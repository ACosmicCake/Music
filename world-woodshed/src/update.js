/* World Woodshed — Check for updates (Settings → App updates).
   The web app asks its service worker to look for a new version (src/pwa.js) and reloads into it.
   The Android app carries its own copy of the app, so it asks GitHub for the latest Android release
   (only when the button is tapped: the one request to another site besides opt-in sync) and opens
   the release page, where the APK is. The web check itself is checkForUpdate in src/pwa.js. 
   Plain functions first, tested in test/update.test.js. */
import { isNative } from './native.js';

const REPO = import.meta.env.WW_REPO || 'acosmiccake/music';
export const BUILT = import.meta.env.WW_BUILT || '';
export const COMMIT = import.meta.env.WW_COMMIT || '';

/* 'android-v1.42' or '1.42' → [1, 42]; anything else → null */
export function parseVersion(s) {
  const m = /(\d+(?:\.\d+)*)\s*$/.exec(String(s || ''));
  return m ? m[1].split('.').map(Number) : null;
}
/* is version a newer than b? (missing parts count as 0) */
export function isNewer(a, b) {
  const x = parseVersion(a), y = parseVersion(b);
  if (!x || !y) return false;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] || 0) - (y[i] || 0);
    if (d) return d > 0;
  }
  return false;
}
/* a GitHub release (from /releases/latest) → { version, url } or null; the page must be on github.com */
export function readRelease(r) {
  if (!r || typeof r !== 'object' || !/^android-v\d/.test(String(r.tag_name || ''))) return null;
  const url = String(r.html_url || '');
  if (!/^https:\/\/github\.com\//.test(url)) return null;
  return { version: parseVersion(r.tag_name).join('.'), url };
}
/* the web build's date as '2 Nov 2026' */
export function builtLabel(iso) {
  const d = new Date(iso);
  return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* this copy's version, for showing: '1.42' in the Android app, the build date on the web */
export async function currentVersion() {
  if (isNative()) {
    try { const { App } = await import('@capacitor/app'); return (await App.getInfo()).version; } catch (e) { return ''; }
  }
  const d = builtLabel(BUILT);
  return d ? d + (COMMIT ? ' · ' + COMMIT.slice(0, 7) : '') : '';
}

/* the Android app: is there a newer release than `have`?
   → { state: 'current' | 'available' | 'offline' | 'error', version?, url? } */
export async function checkRelease(have, fetchFn = fetch) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return { state: 'offline' };
  try {
    const res = await fetchFn('https://api.github.com/repos/' + REPO + '/releases/latest', { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' });
    if (!res.ok) return { state: 'error' };
    const rel = readRelease(await res.json());
    if (!rel) return { state: 'error' };
    return isNewer(rel.version, have) ? { state: 'available', ...rel } : { state: 'current', version: have };
  } catch (e) { return { state: 'offline' }; }
}
