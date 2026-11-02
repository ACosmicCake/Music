import { describe, it, expect } from 'vitest';
import { parseVersion, isNewer, readRelease, builtLabel, checkRelease } from '../src/update.js';

const res = (body, ok = true) => async () => ({ ok, json: async () => body });
const rel = { tag_name: 'android-v1.57', html_url: 'https://github.com/acosmiccake/music/releases/tag/android-v1.57' };

describe('check for updates', () => {
  it('reads versions from tags and the app', () => {
    expect(parseVersion('android-v1.42')).toEqual([1, 42]);
    expect(parseVersion('1.42')).toEqual([1, 42]);
    expect(parseVersion('')).toBe(null);
  });
  it('compares versions by number, not text', () => {
    expect(isNewer('1.100', '1.99')).toBe(true);
    expect(isNewer('1.42', '1.42')).toBe(false);
    expect(isNewer('1.41', '1.42')).toBe(false);
    expect(isNewer('1.1', '1.0.9')).toBe(true);
    expect(isNewer('1.5', '')).toBe(false);
  });
  it('accepts only Android releases that link to github.com', () => {
    expect(readRelease(rel)).toEqual({ version: '1.57', url: rel.html_url });
    expect(readRelease({ ...rel, tag_name: 'v2' })).toBe(null);
    expect(readRelease({ ...rel, html_url: 'javascript:alert(1)' })).toBe(null);
    expect(readRelease(null)).toBe(null);
  });
  it('labels the build date', () => {
    expect(builtLabel('2026-11-02T15:00:00Z')).toBe('2 Nov 2026');
    expect(builtLabel('')).toBe('');
  });
  it('finds a newer release, or says this one is the latest', async () => {
    expect(await checkRelease('1.50', res(rel))).toEqual({ state: 'available', version: '1.57', url: rel.html_url });
    expect((await checkRelease('1.57', res(rel))).state).toBe('current');
    expect((await checkRelease('1.50', res({}, false))).state).toBe('error');
    expect((await checkRelease('1.50', async () => { throw new TypeError('offline'); })).state).toBe('offline');
  });
});
