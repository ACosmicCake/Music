/* World Woodshed — automatic sync through a private GitHub repository you own.
   Opt-in: you give the app a fine-grained token that can only read and write that one repository.
   The token stays in this device's localStorage; it is never part of the synced state, sync files or backups.
   The app keeps one file there (a normal sync file), pulls it when the app opens, every few minutes and
   when you come back to it, merges it into this device's progress (nothing practised on either side is
   lost), and pushes when this device has something new. GitHub's file version (sha) guards against two
   devices writing at once: on a clash it pulls, merges and tries again. */
import E from './engine.js';
import { digest, DEVICE_SETTINGS } from './sync.js';

const KEY = 'ww-gh-sync';
const API = 'https://api.github.com/repos/';
const EVERY_MS = 3 * 60 * 1000;   // pull while the app is open
const AFTER_CHANGE_MS = 20 * 1000; // push a little after you practise

let cfg = load(), busy = null, timer = null, changeTimer = null, listeners = new Set(), lastPushedDigest = null;
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } }
function save() { try { if (cfg) localStorage.setItem(KEY, JSON.stringify(cfg)); else localStorage.removeItem(KEY); } catch (e) { /* storage blocked */ } listeners.forEach(fn => fn(status())); }

/* what counts as "different": progress and shared settings, not this device's latency or layout */
function syncDigest(s) {
  const settings = Object.assign({}, s.settings || {});
  DEVICE_SETTINGS.forEach(k => { delete settings[k]; });
  return digest(Object.assign({}, s, { settings }));
}
const b64encode = str => { const bytes = new TextEncoder().encode(str); let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(bin); };
const b64decode = b64 => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), c => c.charCodeAt(0)));

async function call(method, body, accept, path = cfg.path) {
  const url = API + encodeURIComponent(cfg.owner) + '/' + encodeURIComponent(cfg.repo) + '/contents/' + path.split('/').map(encodeURIComponent).join('/');
  const res = await fetch(url + (method === 'GET' ? '?t=' + Date.now() : ''), {
    method, cache: 'no-store',
    headers: { Authorization: 'Bearer ' + cfg.token, Accept: accept || 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  return res;
}
/* Another file in the same repository (the Library's files, src/libsync.js): a Contents API call on `path`.
   Throws when sync is off. */
export function repoCall(method, path, body, accept) {
  if (!cfg || !cfg.token) throw new Error('Automatic sync is off');
  return call(method, body, accept, path);
}
/* the folder the progress file is in ('' at the top of the repository) */
export const repoDir = () => (cfg && cfg.path.includes('/') ? cfg.path.slice(0, cfg.path.lastIndexOf('/') + 1) : '');
const syncedListeners = new Set();
/* fn() after each sync round that reached GitHub */
export function onSynced(fn) { syncedListeners.add(fn); return () => syncedListeners.delete(fn); }
export function explain(res) {
  if (res.status === 401) return 'GitHub refused the token (expired or mistyped). Paste a new one.';
  if (res.status === 403) return 'The token is not allowed to write to that repository. Give it Contents: Read and write on it.';
  if (res.status === 404) return 'Repository not found. Check the name, and that the token includes that repository.';
  return 'GitHub answered ' + res.status + '.';
}

async function pull() {
  const res = await call('GET');
  if (res.status === 404) {
    // either the file doesn't exist yet (fine) or the repository is out of reach (not fine)
    const repo = await fetch(API + encodeURIComponent(cfg.owner) + '/' + encodeURIComponent(cfg.repo), { headers: { Authorization: 'Bearer ' + cfg.token, Accept: 'application/vnd.github+json' }, cache: 'no-store' });
    if (!repo.ok) throw new Error(explain(repo));
    return { sha: null, data: null };
  }
  if (!res.ok) throw new Error(explain(res));
  const meta = await res.json();
  let text = meta.content ? b64decode(meta.content) : '';
  if (!text && meta.size) { // over 1 MB: the JSON answer leaves content out, so fetch the file itself
    const raw = await call('GET', null, 'application/vnd.github.raw+json');
    if (!raw.ok) throw new Error(explain(raw));
    text = await raw.text();
  }
  let data = null;
  try { data = JSON.parse(text); } catch (e) { throw new Error('The sync file in the repository is not readable. Delete it there and sync again.'); }
  return { sha: meta.sha, data };
}

async function push(sha) {
  const backup = E.exportBackup();
  const res = await call('PUT', { message: 'Sync from ' + (cfg.deviceName || 'a device') + ', ' + new Date().toISOString().slice(0, 16).replace('T', ' '), content: b64encode(JSON.stringify(backup)), ...(sha ? { sha } : {}) });
  if (res.status === 409 || res.status === 422) return { clash: true };
  if (!res.ok) throw new Error(explain(res));
  const out = await res.json();
  return { sha: out.content && out.content.sha };
}

/* One round: pull, merge, push if this device has news. Retries once when another device saved first. */
export function syncNow(reason) {
  if (!cfg || !cfg.token) return Promise.resolve(false);
  if (busy) return busy;
  busy = (async () => {
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const remote = await pull();
        let remoteState = null;
        if (remote.data) {
          remoteState = remote.data.app === 'world-woodshed' ? remote.data.state : remote.data;
          E.importBackup(remote.data, 'merge');
        }
        const mine = syncDigest(E.state);
        const theirs = remoteState ? syncDigest(remoteState) : null;
        if (theirs === mine) { lastPushedDigest = mine; break; }
        const r = await push(remote.sha);
        if (r.clash) continue; // someone saved in between: pull their version, merge, try again
        lastPushedDigest = mine;
        break;
      }
      cfg.lastSync = Date.now(); cfg.lastError = null; save();
      syncedListeners.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
      return true;
    } catch (e) {
      if (cfg) { cfg.lastError = navigator.onLine === false ? 'Offline: will sync when you are back online.' : (e.message || 'Sync failed'); save(); }
      return false;
    } finally { busy = null; }
  })();
  return busy;
}

/* Connect with a repository and token (checks them by syncing once). */
export async function connect({ owner, repo, token, path, deviceName }) {
  cfg = { owner: owner.trim(), repo: repo.trim(), token: token.trim(), path: (path || 'world-woodshed-progress.json').trim(), deviceName: (deviceName || '').trim(), lastSync: null, lastError: null };
  save();
  const ok = await syncNow('connect');
  if (!ok) { const err = cfg.lastError; cfg = null; save(); throw new Error(err || 'Could not connect'); }
  wire(); start();
  return true;
}
export function disconnect() { stop(); cfg = null; save(); }
export function status() { return cfg ? { on: true, owner: cfg.owner, repo: cfg.repo, path: cfg.path, lastSync: cfg.lastSync, lastError: cfg.lastError, busy: !!busy } : { on: false }; }
export function onStatus(fn) { listeners.add(fn); return () => listeners.delete(fn); }

function start() {
  stop();
  timer = setInterval(() => { if (document.visibilityState === 'visible') syncNow('interval'); }, EVERY_MS);
}
function stop() { clearInterval(timer); timer = null; clearTimeout(changeTimer); changeTimer = null; }

/* boot: sync now, then on a timer, when the app comes back to the screen, and soon after local changes */
let wired = false;
function wire() {
  if (wired) return;
  wired = true;
  document.addEventListener('visibilitychange', () => { if (cfg && document.visibilityState === 'visible') syncNow('resume'); });
  window.addEventListener('online', () => { if (cfg) syncNow('online'); });
  E.onChange(() => {
    if (!cfg || busy) return;
    clearTimeout(changeTimer);
    changeTimer = setTimeout(() => { if (syncDigest(E.state) !== lastPushedDigest) syncNow('change'); }, AFTER_CHANGE_MS);
  });
}
export function initGitHubSync() {
  if (!cfg) return;
  wire(); start();
  setTimeout(() => syncNow('open'), 1500);
}
