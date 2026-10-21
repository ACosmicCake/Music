import { describe, it, expect, vi, afterEach } from 'vitest';
import D from '../src/data.js';
import { onSpotify, spotifyQuery, spotifyWeb, spotifyApp, openSpotify } from '../src/spotify.js';

const recs = D.REGIONS.flatMap(r => r.essential || []);

/* a pretend browser: Android or desktop, a page that can lose focus when another app opens */
function browser(ua) {
  const win = {}, doc = {};
  const on = map => (type, fn) => { map[type] = fn; };
  globalThis.navigator = { userAgent: ua };
  globalThis.location = { href: 'https://acosmiccake.github.io/music/' };
  globalThis.window = { addEventListener: on(win), removeEventListener: () => {}, open: vi.fn() };
  globalThis.document = { hidden: false, addEventListener: on(doc), removeEventListener: () => {} };
  return { win, doc };
}
const tap = () => ({ preventDefault: vi.fn() });
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Jelly Star) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36';

afterEach(() => { vi.useRealTimers(); for (const k of ['navigator', 'location', 'window', 'document']) delete globalThis[k]; });

describe('Spotify links', () => {
  it('albums and songs get one, books and films do not', () => {
    expect(recs.some(onSpotify)).toBe(true);
    for (const e of recs) expect(onSpotify(e), e.work).toBe(e.kind === 'album' || e.kind === 'track');
  });
  it('searches for the artist and the record, safely encoded', () => {
    for (const e of recs.filter(onSpotify)) {
      const q = spotifyQuery(e);
      expect(q.split(' ').length, q).toBeLessThanOrEqual(16);
      expect(spotifyWeb(q)).toMatch(/^https:\/\/open\.spotify\.com\/search\/[^/?#\s]+$/);
      expect(spotifyApp(q)).toMatch(/^spotify:search:[^/?#\s]+$/);
    }
    expect(spotifyQuery({ artist: 'Eddie Palmieri', work: 'Azúcar “pa’ ti”' })).toBe("Eddie Palmieri Azúcar pa' ti");
    expect(spotifyQuery({ artist: 'Shivkumar Sharma, Hariprasad Chaurasia & Brij Bhushan Kabra', work: 'Call of the Valley' })).toBe('Shivkumar Sharma Call of the Valley');
    expect(spotifyQuery({ artist: 'Various artists (recorded by Paul Berliner)', work: 'Zimbabwe: The Soul of Mbira' })).toBe('Zimbabwe: The Soul of Mbira');
    expect(spotifyQuery({ artist: 'Django Reinhardt & Stéphane Grappelli (Quintette du Hot Club de France)', work: 'Minor Swing' })).toBe('Django Reinhardt & Stéphane Grappelli Minor Swing');
    expect(spotifyWeb('Celia & Johnny')).toBe('https://open.spotify.com/search/Celia%20%26%20Johnny');
  });
  it('off Android the link opens the web player as it is', () => {
    browser('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0');
    const ev = tap();
    openSpotify(ev, 'Siembra');
    expect(ev.preventDefault).not.toHaveBeenCalled();
    expect(location.href).not.toMatch(/^spotify:/);
  });
  it('on Android it opens the app, and nothing more when the app takes over', () => {
    vi.useFakeTimers();
    const { win } = browser(ANDROID);
    const ev = tap();
    openSpotify(ev, 'Willie Colón Siembra');
    expect(ev.preventDefault).toHaveBeenCalled();
    expect(location.href).toBe(spotifyApp('Willie Colón Siembra'));
    win.blur();
    vi.advanceTimersByTime(2000);
    expect(window.open).not.toHaveBeenCalled();
  });
  it('without the Spotify app it opens the search on the web', () => {
    vi.useFakeTimers();
    browser(ANDROID);
    openSpotify(tap(), 'Siembra');
    vi.advanceTimersByTime(2000);
    expect(window.open).toHaveBeenCalledWith(spotifyWeb('Siembra'), '_blank', 'noopener');
  });
});
