/* World Woodshed — connect your Spotify account to read your top artists (opt-in, the web app only).
   Spotify's Authorization Code flow with PKCE: no secret in the app, only a public client ID. The tokens stay in
   this device's localStorage (key `ww-spotify`) like the GitHub sync token, never in the state, sync files or
   backups. The app asks only for `user-top-read` and talks only to accounts.spotify.com and api.spotify.com,
   and only after you connect. What it learns (your top artists and the styles and players they point to) is
   kept in your learning plan (Cur.prefs().taste) so your other devices get it too.

   The client ID is the app's own (APP_ID), or VITE_SPOTIFY_CLIENT_ID at build time, or one typed in Settings on this device. The app in the
   Spotify developer dashboard must list this page's address as a redirect URI (redirectUri()). */

const KEY = 'ww-spotify', PEND = 'ww-spotify-pending';
const AUTH = 'https://accounts.spotify.com/authorize', TOKEN = 'https://accounts.spotify.com/api/token', API = 'https://api.spotify.com/v1';
export const SCOPE = 'user-top-read';
// the app's own Spotify app (a client ID is public: PKCE needs no secret); VITE_SPOTIFY_CLIENT_ID overrides it
const APP_ID = 'f2bfc00c38f349beb5aa3dcfba6198b8';
const BUILT_ID = (import.meta.env && import.meta.env.VITE_SPOTIFY_CLIENT_ID) || APP_ID;

const listeners = new Set();
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
function save(cfg) { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) { /* storage blocked */ } listeners.forEach(fn => fn(status())); }
export function onStatus(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export const clientId = () => load().clientId || BUILT_ID;
export const builtClientId = () => BUILT_ID;
export function setClientId(id) { const cfg = load(); cfg.clientId = String(id || '').trim().replace(/[^0-9a-f]/gi, '').slice(0, 64); save(cfg); }
/* The address Spotify sends you back to: this page without its hash or query, as the dashboard must list it */
export const redirectUri = () => location.origin + ((import.meta.env && import.meta.env.BASE_URL) || '/');
export function status() { const c = load(); return { on: !!c.refresh, clientId: clientId(), lastError: c.lastError || null, at: c.at || null }; }

const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
function randomString(n) {
  const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(bytes, b => abc[b % abc.length]).join('');
}

/* Send the browser to Spotify's login. Comes back to redirectUri() with ?code=…&state=… */
export async function connect() {
  const id = clientId();
  if (!id) throw new Error('Add the Client ID from your Spotify app first.');
  const verifier = randomString(64), state = randomString(16);
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  try { sessionStorage.setItem(PEND, JSON.stringify({ verifier, state, hash: location.hash || '' })); } catch (e) { throw new Error('This browser blocks storage, so the login cannot finish.'); }
  const q = new URLSearchParams({ response_type: 'code', client_id: id, scope: SCOPE, redirect_uri: redirectUri(), state, code_challenge_method: 'S256', code_challenge: challenge });
  location.assign(AUTH + '?' + q);
}

async function tokenCall(body) {
  const res = await fetch(TOKEN, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(body) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error_description || j.error || ('Spotify said ' + res.status));
  return j;
}
function keep(j) {
  const cfg = load();
  cfg.access = j.access_token;
  cfg.expires = Date.now() + (j.expires_in || 3600) * 1000 - 60000;
  if (j.refresh_token) cfg.refresh = j.refresh_token;
  cfg.lastError = null;
  save(cfg);
}

/* At start: finish a login Spotify has just sent us back from. Returns true when a new connection was made. */
export async function finishLogin() {
  const q = new URLSearchParams(location.search);
  if (!q.has('code') && !q.has('error')) return false;
  let pend = null;
  try { pend = JSON.parse(sessionStorage.getItem(PEND)); sessionStorage.removeItem(PEND); } catch (e) { /* none */ }
  // take ?code=… out of the address bar either way, and go back to where you were
  history.replaceState(null, '', redirectUri() + ((pend && pend.hash) || ''));
  if (!pend || q.get('state') !== pend.state) return false;
  if (q.has('error')) { const cfg = load(); cfg.lastError = q.get('error') === 'access_denied' ? 'You said no on Spotify, so nothing was connected.' : 'Spotify: ' + q.get('error'); save(cfg); return false; }
  keep(await tokenCall({ grant_type: 'authorization_code', code: q.get('code'), redirect_uri: redirectUri(), client_id: clientId(), code_verifier: pend.verifier }));
  return true;
}

async function accessToken() {
  const cfg = load();
  if (!cfg.refresh) throw new Error('Spotify is not connected on this device.');
  if (cfg.access && cfg.expires > Date.now()) return cfg.access;
  keep(await tokenCall({ grant_type: 'refresh_token', refresh_token: cfg.refresh, client_id: clientId() }));
  return load().access;
}

/* Your top artists, best first: [{ name, genres }], from the last 6 months then the last year or so */
export async function topArtists() {
  try {
    const tok = await accessToken();
    const get = async range => {
      const res = await fetch(API + '/me/top/artists?limit=50&time_range=' + range, { headers: { Authorization: 'Bearer ' + tok } });
      if (res.status === 403) throw new Error('Spotify refused: add your Spotify account under User Management in your Spotify app (the developer dashboard), then connect again.');
      if (res.status === 401) { const cfg = load(); delete cfg.access; save(cfg); throw new Error('Spotify sign-in ran out. Connect again.'); }
      if (!res.ok) throw new Error('Spotify said ' + res.status);
      return ((await res.json()).items || []).map(a => ({ name: String(a.name || ''), genres: Array.isArray(a.genres) ? a.genres.map(String) : [] }));
    };
    const mid = await get('medium_term'), long = await get('long_term');
    const seen = new Set(), out = [];
    mid.concat(long).forEach(a => { const k = a.name.toLowerCase(); if (a.name && !seen.has(k)) { seen.add(k); out.push(a); } });
    const cfg = load(); cfg.at = Date.now(); cfg.lastError = null; save(cfg);
    return out;
  } catch (e) {
    const cfg = load(); cfg.lastError = e.message; save(cfg);
    throw e;
  }
}

export function disconnect() { const cfg = load(); const keepId = cfg.clientId; try { localStorage.removeItem(KEY); } catch (e) { /* blocked */ } if (keepId) save({ clientId: keepId }); else listeners.forEach(fn => fn(status())); }
