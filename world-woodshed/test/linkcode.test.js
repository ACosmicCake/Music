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

import { makeCode, normCode, showCode, sendByCode, receiveByCode, RELAY } from '../src/linkcode.js';
describe('Link another device by code', () => {
  // a stand-in for ntfy.sh: POST stores the body under the topic, GET …/json?poll=1 lists it
  const relay = () => {
    const topics = {}, seen = [];
    const f = async (url, o = {}) => {
      const topic = url.slice(RELAY.length).split('/')[0].split('?')[0]; seen.push(url);
      if (o.method === 'POST') { (topics[topic] = topics[topic] || []).push(o.body); return { ok: true }; }
      const lines = (topics[topic] || []).map(m => JSON.stringify({ event: 'message', topic, message: m }));
      return { ok: true, text: async () => [JSON.stringify({ event: 'open' }), ...lines].join('\n') };
    };
    f.seen = seen; f.topics = topics;
    return f;
  };
  it('makes and reads 12-digit codes', () => {
    const c = makeCode();
    expect(c).toMatch(/^\d{12}$/);
    expect(showCode('482193751046')).toBe('4821 9375 1046');
    expect(normCode(' 4821 9375-1046 ')).toBe('482193751046');
    expect(normCode('4821 9375 104')).toBe(null);
  });
  it('passes the setup through the relay, encrypted', async () => {
    const f = relay(), code = '482193751046';
    await sendByCode(cfg, code, f, 1000000);
    const posted = Object.values(f.topics)[0][0];
    expect(posted).not.toContain('github_pat');
    expect(posted).not.toContain('ACosmicCake');
    expect(f.seen[0]).not.toContain(code); // the topic is a hash, not the code
    expect(await receiveByCode(code, f, 1000000 + 60000)).toEqual(cfg);
  });
  it('refuses a wrong code and an old one', async () => {
    const f = relay();
    await sendByCode(cfg, '482193751046', f, 1000000);
    await expect(receiveByCode('482193751047', f, 1000000)).rejects.toThrow(/No device/);
    await expect(receiveByCode('482193751046', f, 1000000 + 11 * 60000)).rejects.toThrow(/No device/);
  });
});
