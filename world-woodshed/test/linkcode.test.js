import { describe, it, expect } from 'vitest';
import { encodeLink, decodeLink, linkUrl, isLinkHash, qrGrid } from '../src/linkcode.js';

const cfg = { owner: 'ACosmicCake', repo: 'woodshed-sync', token: 'github_pat_11ABCDEFG0123456789_abcdefghijklmnop', path: 'world-woodshed-progress.json' };

describe('Link another device', () => {
  it('round-trips the sync setup through a link, a bare code and a hash', () => {
    const url = linkUrl('https://acosmiccake.github.io/music/#today', cfg);
    expect(url.startsWith('https://acosmiccake.github.io/music/#link=ww1.')).toBe(true);
    expect(decodeLink(url)).toEqual(cfg);
    expect(decodeLink('  ' + encodeLink(cfg) + '\n')).toEqual(cfg);
    expect(isLinkHash(new URL(url).hash)).toBe(true);
    expect(decodeLink(new URL(url).hash)).toEqual(cfg);
    expect(encodeLink(cfg)).toMatch(/^ww1\.[A-Za-z0-9_-]+$/); // safe in a URL fragment as it is
  });
  it('rejects anything that is not a good link', () => {
    expect(decodeLink('')).toBe(null);
    expect(decodeLink('https://acosmiccake.github.io/music/#today')).toBe(null);
    expect(decodeLink('ww1.@@@')).toBe(null);
    expect(decodeLink(encodeLink({ ...cfg, owner: 'a/b' }))).toBe(null);
    expect(decodeLink(encodeLink({ ...cfg, token: 'short' }))).toBe(null);
    expect(decodeLink(encodeLink({ ...cfg, path: '../x.json' }))).toBe(null);
    expect(isLinkHash('#settings')).toBe(false);
  });
  it('makes a QR code with a quiet zone', async () => {
    const g = await qrGrid(linkUrl('https://acosmiccake.github.io/music/', cfg));
    expect(g.length).toBe(g[0].length);
    expect(g[0].every(x => !x)).toBe(true);
    expect(g[4][4]).toBe(true); // the finder pattern's corner
  });
});
