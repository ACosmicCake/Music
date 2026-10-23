import { describe, it, expect, vi } from 'vitest';

/* The Android app hands a file to another app by writing it to its cache folder first. The file crosses to
   Android as base64; in one piece a large score or song ran the app out of memory and closed it. */
const calls = [];
vi.mock('@capacitor/filesystem', () => ({
  Directory: { Cache: 'CACHE' },
  Filesystem: {
    writeFile: async o => { calls.push(['write', o]); return { uri: 'file:///cache/' + o.path }; },
    appendFile: async o => { calls.push(['append', o]); }
  }
}));
const { writeCacheFile } = await import('../src/native.js');

const bytesOf = b64 => new Uint8Array(Buffer.from(b64, 'base64'));

describe('writing a file for another app', () => {
  it('sends a large file in pieces of a couple of megabytes that add up to the file', async () => {
    const n = 5 * 1024 * 1024 + 5, data = new Uint8Array(n);
    for (let i = 0; i < n; i++) data[i] = (i * 31 + (i >> 9)) & 255;
    calls.length = 0;
    const uri = await writeCacheFile('open/song.mp3', new Blob([data]));
    expect(uri).toBe('file:///cache/open/song.mp3');
    expect(calls[0][0]).toBe('write');
    expect(calls.slice(1).every(c => c[0] === 'append')).toBe(true);
    expect(calls.length).toBeGreaterThan(3);
    calls.forEach(([, o]) => { expect(o.path).toBe('open/song.mp3'); expect(o.data.length).toBeLessThan(2.2 * 1024 * 1024); expect(o.encoding).toBeUndefined(); });
    const out = new Uint8Array(n);
    let at = 0;
    calls.forEach(([, o]) => { const b = bytesOf(o.data); out.set(b, at); at += b.length; });
    expect(at).toBe(n);
    expect(Buffer.compare(Buffer.from(out), Buffer.from(data))).toBe(0);
  });
  it('writes a small file in one call', async () => {
    calls.length = 0;
    await writeCacheFile('share/a.musicxml', new Blob(['<score-partwise/>']));
    expect(calls.length).toBe(1);
    expect(new TextDecoder().decode(bytesOf(calls[0][1].data))).toBe('<score-partwise/>');
  });
});
