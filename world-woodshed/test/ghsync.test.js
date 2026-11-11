import './env.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/* Automatic sync through the player's GitHub repository (src/ghsync.js): one round pulls the progress file,
   merges it and pushes when this device has news. GitHub's Contents API is faked in memory. */

const PATH = 'world-woodshed-progress.json';
function fakeGitHub() {
  let file = null, n = 0; // { text, sha }
  const gh = { puts: 0, clashes: 0, get text() { return file && file.text; } };
  const json = (status, body) => ({ status, ok: status < 300, json: async () => body, text: async () => JSON.stringify(body) });
  gh.fetch = async (url, opts = {}) => {
    const method = opts.method || 'GET';
    if (!new URL(url).pathname.endsWith('/contents/' + PATH)) return json(200, {}); // the repository itself
    if (method === 'GET') return file ? json(200, { sha: file.sha, size: file.text.length, content: Buffer.from(file.text, 'utf8').toString('base64') }) : json(404, {});
    const body = JSON.parse(opts.body);
    if (gh.clashes > 0) { gh.clashes--; return json(409, {}); } // another device saved first
    if (file && body.sha !== file.sha) return json(409, {});
    file = { text: Buffer.from(body.content, 'base64').toString('utf8'), sha: 'sha' + (++n) };
    gh.puts++;
    return json(200, { content: { sha: file.sha } });
  };
  return gh;
}

let gh;
async function device(id) {
  localStorage.removeItem('world-woodshed-v1');
  localStorage.setItem('ww-device', id);
  vi.resetModules();
  const E = (await import('../src/engine.js')).default;
  const G = await import('../src/ghsync.js');
  E.init();
  return { E, G };
}
beforeEach(() => {
  localStorage.clear();
  gh = fakeGitHub();
  globalThis.fetch = gh.fetch;
  localStorage.setItem('ww-gh-sync', JSON.stringify({ owner: 'me', repo: 'sync', token: 't', path: PATH }));
});
afterEach(() => { delete globalThis.fetch; });

describe('GitHub sync', () => {
  it('pushes this device\'s progress, and pushes nothing when the repository already has it', async () => {
    const { E, G } = await device('d-one');
    E.record('intervals', 'P5:up', true);
    expect(await G.syncNow()).toBe(true);
    expect(gh.puts).toBe(1);
    expect(JSON.parse(gh.text).state.skills.intervals.items['P5:up'].n).toBe(1);
    await G.syncNow(); // (the first merge may add the empty parts a new install hasn't made yet)
    const puts = gh.puts;
    expect(await G.syncNow()).toBe(true);
    expect(gh.puts).toBe(puts);
  });
  it('merges what another device pushed', async () => {
    const a = await device('d-one');
    a.E.record('intervals', 'P5:up', true);
    await a.G.syncNow();
    const b = await device('d-two');
    b.E.record('chords', 'maj', true);
    expect(await b.G.syncNow()).toBe(true);
    expect(b.E.state.skills.intervals.items['P5:up'].n).toBe(1);
    const pushed = JSON.parse(gh.text).state.skills;
    expect(pushed.intervals.items['P5:up'].n).toBe(1);
    expect(pushed.chords.items.maj.n).toBe(1);
  });
  it('tries again when another device saved first', async () => {
    const { E, G } = await device('d-one');
    E.record('intervals', 'P5:up', true);
    gh.clashes = 2;
    expect(await G.syncNow()).toBe(true);
    expect(gh.puts).toBe(1);
    expect(G.status().lastError).toBe(null);
  });
  // Three clashes in a row once counted as a finished sync: "synced just now" with nothing pushed
  it('does not call it synced when every try clashed', async () => {
    const { E, G } = await device('d-one');
    E.record('intervals', 'P5:up', true);
    gh.clashes = 3;
    expect(await G.syncNow()).toBe(false);
    expect(gh.puts).toBe(0);
    expect(G.status().lastError).toMatch(/try again/);
    expect(G.status().lastSync).toBeFalsy();
    expect(await G.syncNow()).toBe(true); // the next round gets through
    expect(gh.puts).toBe(1);
    expect(G.status().lastError).toBe(null);
  });
  it('erasing every device clears the synced copy and the other devices', async () => {
    const a = await device('d-one');
    a.E.record('intervals', 'P5:up', true);
    await a.G.syncNow();
    const b = await device('d-two');
    await b.G.syncNow();
    expect(b.E.state.skills.intervals.items['P5:up'].n).toBe(1);
    const old = JSON.parse(JSON.stringify(b.E.state)); // a device that still holds the progress
    b.E.resetAll(true);
    await b.G.syncNow();
    expect(JSON.parse(gh.text).state.skills).toEqual({});
    // the first device, still holding its old progress, syncs and is cleared too
    localStorage.setItem('world-woodshed-v1', JSON.stringify(old));
    localStorage.setItem('ww-device', 'd-one');
    vi.resetModules();
    const E = (await import('../src/engine.js')).default, G = await import('../src/ghsync.js');
    E.init();
    expect(E.state.skills.intervals.items['P5:up'].n).toBe(1);
    await G.syncNow();
    expect(E.state.skills).toEqual({});
  });
});
