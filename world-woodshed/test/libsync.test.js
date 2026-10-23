import './env.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fakeIndexedDB } from './fakeidb.js';

/* The Library's files through the GitHub sync repository (src/libsync.js): uploaded from the device that has
   them, deleted when removed anywhere, downloaded on another device. GitHub's Contents API is faked in memory. */

function fakeGitHub() {
  const files = new Map(); // path → { bytes, sha }
  const calls = [];
  let n = 0;
  const fetch = async (url, opts = {}) => {
    const u = new URL(url), method = opts.method || 'GET';
    const path = decodeURIComponent(u.pathname.replace(/^\/repos\/me\/sync\/contents\/?/, ''));
    calls.push(method + ' ' + path);
    const json = (status, body) => ({ status, ok: status < 300, json: async () => body, text: async () => JSON.stringify(body) });
    if (method === 'GET') {
      const kids = [...files.keys()].filter(k => k.startsWith(path + '/'));
      if (kids.length) return json(200, kids.map(k => ({ type: 'file', name: k.slice(path.length + 1), sha: files.get(k).sha, size: files.get(k).bytes.length })));
      const f = files.get(path);
      if (!f) return json(404, {});
      return { status: 200, ok: true, blob: async () => new Blob([f.bytes]) };
    }
    if (opts.body instanceof Blob) calls.push('blob body');
    const body = JSON.parse(typeof opts.body === 'string' ? opts.body : await opts.body.text());
    if (method === 'PUT') {
      if (files.has(path) && !body.sha) return json(422, {});
      const sha = 'sha' + (++n);
      files.set(path, { bytes: new Uint8Array(Buffer.from(body.content, 'base64')), sha });
      return json(201, { content: { sha } });
    }
    if (method === 'DELETE') {
      if (!files.has(path)) return json(404, {});
      if (files.get(path).sha !== body.sha) return json(409, {});
      files.delete(path);
      return json(200, {});
    }
    return json(400, {});
  };
  return { files, calls, fetch };
}

let gh;
/* a fresh app on a device: its own storage, the same repository */
async function device(idb) {
  globalThis.indexedDB = idb || fakeIndexedDB();
  vi.resetModules();
  const E = (await import('../src/engine.js')).default;
  const L = await import('../src/library.js');
  const LS = await import('../src/libsync.js');
  E.init(); // loads this device's saved progress
  return { E, L, LS, idb: globalThis.indexedDB };
}
beforeEach(() => {
  localStorage.clear();
  gh = fakeGitHub();
  globalThis.fetch = gh.fetch;
  localStorage.setItem('ww-gh-sync', JSON.stringify({ owner: 'me', repo: 'sync', token: 't', path: 'world-woodshed-progress.json' }));
});
afterEach(() => { delete globalThis.fetch; });

describe('Library files through the sync repository', () => {
  it('uploads the files this device has, once, under their id and name', async () => {
    const { L, LS } = await device();
    const id = await L.addToLibrary({ title: 'Riff', files: [new File(['<score/>'], 'riff.musicxml'), new File(['MThd'], 'riff take 2!.mid')] });
    const [a, b] = L.getEntry(id).files.map(f => f.id);
    expect(await LS.syncFiles()).toBe(true);
    expect([...gh.files.keys()].sort()).toEqual(['world-woodshed-library/' + a + '-riff.musicxml', 'world-woodshed-library/' + b + '-riff take 2_.mid'].sort());
    expect(LS.remoteHas(a)).toBe(true);
    gh.calls.length = 0;
    await LS.syncFiles();
    expect(gh.calls.filter(c => c.startsWith('PUT'))).toEqual([]); // nothing new
    expect(LS.status()).toMatchObject({ on: true, pending: 0, error: '', repo: 'me/sync' });
  });
  it('another device downloads a file when asked, into its own storage', async () => {
    const phone = await device();
    const id = await phone.L.addToLibrary({ title: 'Asturias', files: [new File(['%PDF-1.4 asturias'], 'asturias.pdf', { type: 'application/pdf' })] });
    await phone.LS.syncFiles();
    const saved = phone.E.state;
    // the laptop: the same progress (merged in by the progress sync), none of the files
    localStorage.setItem('world-woodshed-v1', JSON.stringify(saved));
    const laptop = await device();
    const f = laptop.L.getEntry(id).files[0];
    expect(await laptop.L.getFile(f.id)).toBeNull();
    await laptop.LS.fetchFile(id, f);
    const got = await laptop.L.getFile(f.id);
    expect(await got.blob.text()).toBe('%PDF-1.4 asturias');
    expect(got.type).toBe('application/pdf');
  });
  it('sends a large file as a body built in pieces, and it arrives whole', async () => {
    const { L, LS } = await device();
    const n = 4 * 1024 * 1024 + 7, data = new Uint8Array(n);
    for (let i = 0; i < n; i++) data[i] = (i * 7 + (i >> 11)) & 255;
    const id = await L.addToLibrary({ title: 'Big', files: [new File([data], 'big.pdf', { type: 'application/pdf' })] });
    const f = L.getEntry(id).files[0];
    expect(await LS.syncFiles()).toBe(true);
    expect(gh.calls).toContain('blob body');
    const up = gh.files.get('world-woodshed-library/' + LS.remoteName(f.id, f.name)).bytes;
    expect(up.length).toBe(n);
    expect(Buffer.compare(Buffer.from(up), Buffer.from(data))).toBe(0);
  });
  it('deletes from the repository what was removed on any device', async () => {
    const { L, LS } = await device();
    const id = await L.addToLibrary({ title: 'x', files: [new File(['1'], 'a.jpg'), new File(['2'], 'b.pdf')] });
    const [a, b] = L.getEntry(id).files.map(f => f.id);
    await LS.syncFiles();
    await L.removeFile(id, a);
    await LS.syncFiles();
    expect([...gh.files.keys()]).toEqual(['world-woodshed-library/' + b + '-b.pdf']);
    await L.deleteEntry(id);
    await LS.syncFiles();
    expect(gh.files.size).toBe(0);
  });
  it('a file another device uploaded first is taken as there, not sent twice', async () => {
    const { L, LS } = await device();
    const id = await L.addToLibrary({ title: 'x', files: [new File(['1'], 'a.jpg')] });
    const f = L.getEntry(id).files[0];
    gh.files.set('world-woodshed-library/' + LS.remoteName(f.id, f.name), { bytes: new Uint8Array([49]), sha: 'other' });
    await LS.syncFiles();
    expect(gh.calls.filter(c => c.startsWith('PUT'))).toEqual([]);
    expect(LS.remoteHas(f.id)).toBe(true);
  });
  it('says what went wrong, and does nothing when sync is off', async () => {
    const { L, LS } = await device();
    await L.addToLibrary({ title: 'x', files: [new File(['1'], 'a.jpg')] });
    globalThis.fetch = async () => ({ status: 401, ok: false, json: async () => ({}) });
    expect(await LS.syncFiles()).toBe(false);
    expect(LS.status().error).toMatch(/refused the token/);
    localStorage.removeItem('ww-gh-sync');
    const off = await device();
    expect(off.LS.isOn()).toBe(false);
    expect(await off.LS.syncFiles()).toBe(false);
    await expect(off.LS.fetchFile('e', { id: 'f', name: 'a.pdf' })).rejects.toThrow(/off/);
  });
  it('leaves files over the limit on their device', async () => {
    const { LS } = await device();
    expect(LS.tooBig({ size: 51 * 1024 * 1024 })).toBe(true);
    expect(LS.tooBig({ size: 49 * 1024 * 1024 })).toBe(false);
  });
});
