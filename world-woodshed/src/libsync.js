/* World Woodshed — the Library's files, synced through the same private GitHub repository as your progress
   (src/ghsync.js, opt-in). Each file is its own file in a folder of that repository, world-woodshed-library/,
   named <file id>-<name>, so the progress file stays small and a phone only downloads the scores you open.
   After every sync round this uploads the files this device has that the repository lacks, and deletes the
   ones removed on any device (their 'libfile:' tombstones); another device downloads a file when its entry
   is opened (fetchFile). Files over MAX_SYNC_MB stay on the device they were added on. */
import E from './engine.js';
import { putFile, getFile, localIds, thumbnail } from './libfiles.js';
import { repoCall, repoDir, onSynced, status as ghStatus, explain } from './ghsync.js';
import { fileKind, mimeOf } from './library.js';

export const MAX_SYNC_MB = 50; // GitHub's Contents API takes a file of up to 100 MB, sent as base64 JSON
const DIR = 'world-woodshed-library';
const CACHE = 'ww-lib-remote'; // the ids last seen in the repository, so the Library can say what is there offline
const folder = () => repoDir() + DIR;
const safe = name => [...String(name || 'file')].map(c => (/[\w.()+ -]/.test(c) ? c : '_')).join('').slice(0, 100) || 'file';
export const remoteName = (id, name) => id + '-' + safe(name);
const idOf = remote => String(remote).split('-')[0];

let remote = loadCache(), busy = null, lastError = '', pending = 0;
const listeners = new Set();
function loadCache() { try { const c = JSON.parse(localStorage.getItem(CACHE)); return new Map((c && c.files) || []); } catch (e) { return new Map(); } }
function saveCache() { try { localStorage.setItem(CACHE, JSON.stringify({ files: [...remote] })); } catch (e) { /* storage full or blocked */ } }
const tell = () => listeners.forEach(fn => { try { fn(status()); } catch (e) { console.error(e); } });

export const isOn = () => !!ghStatus().on;
export const remoteHas = id => remote.has(id);
export const tooBig = f => (f.size || 0) > MAX_SYNC_MB * 1024 * 1024;
export function status() { return { on: isOn(), busy: !!busy, pending, error: lastError, repo: isOn() ? ghStatus().owner + '/' + ghStatus().repo : '' }; }
export function onStatus(fn) { listeners.add(fn); return () => listeners.delete(fn); }

const blobB64 = blob => (typeof FileReader !== 'undefined'
  ? new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).slice(String(r.result).indexOf(',') + 1)); r.onerror = () => rej(r.error); r.readAsDataURL(blob); })
  : blob.arrayBuffer().then(buf => { const b = new Uint8Array(buf); let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); }));
/* The body of an upload ({ message, content: the file as base64 }) as a Blob, built a piece at a time: one
   string of a 50 MB file's base64, then its JSON copy, held the page's memory at several times the file's
   size and could close the app on a phone. */
const PIECE = 3 * 512 * 1024; // a multiple of 3, so the pieces' base64 joins up
async function uploadBody(message, blob) {
  const parts = ['{"message":' + JSON.stringify(message) + ',"content":"'];
  for (let i = 0; i < blob.size; i += PIECE) parts.push(new Blob([await blobB64(blob.slice(i, i + PIECE))]));
  parts.push('"}');
  return new Blob(parts, { type: 'application/json' });
}
const wait = ms => new Promise(r => setTimeout(r, ms));
/* a write, tried again once if another device's commit moved the branch in between (409) */
async function write(method, path, body) {
  let res = await repoCall(method, path, body);
  if (res.status === 409) { await wait(1500); res = await repoCall(method, path, body); }
  return res;
}

/* What the repository's folder holds: id → { name, sha, size } */
async function list() {
  const res = await repoCall('GET', folder());
  if (res.status === 404) { remote = new Map(); saveCache(); return remote; }
  if (!res.ok) throw new Error(explain(res));
  const items = await res.json();
  remote = new Map((Array.isArray(items) ? items : []).filter(x => x && x.type === 'file').map(x => [idOf(x.name), { name: x.name, sha: x.sha, size: x.size }]));
  saveCache();
  return remote;
}

/* One round: delete what was removed anywhere, upload what only this device has */
export function syncFiles() {
  if (!isOn()) return Promise.resolve(false);
  if (busy) return busy;
  busy = (async () => {
    try {
      await list();
      const tomb = E.state.tomb || {};
      for (const [id, r] of [...remote]) {
        if (!tomb['libfile:' + id]) continue;
        const res = await write('DELETE', folder() + '/' + r.name, { message: 'Remove a Library file', sha: r.sha });
        if (res.ok || res.status === 404) remote.delete(id); else throw new Error(explain(res));
      }
      saveCache();
      const have = await localIds();
      const todo = [];
      E.listLibrary().forEach(e => (Array.isArray(e.files) ? e.files : []).forEach(f => {
        if (f && f.id && have.has(f.id) && !remote.has(f.id) && !tomb['libfile:' + f.id] && !tooBig(f)) todo.push([e, f]);
      }));
      pending = todo.length; tell();
      for (const [e, f] of todo) {
        const rec = await getFile(f.id);
        if (!rec || !rec.blob) { pending--; continue; }
        const name = remoteName(f.id, f.name);
        const res = await write('PUT', folder() + '/' + name, await uploadBody('Library: ' + String(e.title || 'Untitled').slice(0, 60) + ' · ' + String(f.name).slice(0, 60), rec.blob));
        if (res.status === 422) await list(); // already there (another device uploaded it): take the repository's word
        else if (!res.ok) throw new Error(explain(res));
        else { const out = await res.json(); remote.set(f.id, { name, sha: out.content && out.content.sha, size: rec.blob.size }); }
        pending--; saveCache(); tell();
      }
      lastError = '';
      return true;
    } catch (e) {
      lastError = typeof navigator !== 'undefined' && navigator.onLine === false ? 'Offline: files sync when you are back online.' : 'Library files: ' + (e.message || 'sync failed');
      return false;
    } finally { busy = null; tell(); }
  })();
  tell();
  return busy;
}

/* Download one file of an entry from the repository into this device → true, or throws with the reason */
export async function fetchFile(entryId, f) {
  if (!isOn()) throw new Error('Automatic sync is off on this device');
  if (!remote.has(f.id)) await list();
  const r = remote.get(f.id);
  if (!r) throw new Error('Not in your sync repository yet: open the Library on the device that has it');
  const res = await repoCall('GET', folder() + '/' + r.name, null, 'application/vnd.github.raw+json');
  if (!res.ok) throw new Error(explain(res));
  const type = f.type || mimeOf(f.name, '');
  const blob = new Blob([await res.blob()], { type });
  const th = fileKind(f.name, f.type) === 'image' ? await thumbnail(blob) : null;
  if (!await putFile(f.id, { blob, name: f.name, type: f.type || '', size: blob.size, entry: entryId, thumb: th ? th.blob : null })) throw new Error('This device would not store it (storage full or blocked)');
  return true;
}

/* After each progress sync, and soon after a file is added */
let wired = false;
export function initLibSync() {
  if (wired) return;
  wired = true;
  onSynced(() => { syncFiles(); });
}
