/* World Woodshed — the Library: score files (PDF, MusicXML, MuseScore, Guitar Pro, MIDI), photos of scores, and
   the songs you want to learn, are learning and have learned, each with who wrote it, notes and a link.

   The details of each entry sync like the rest of the state (state.library, merged in src/sync.js); the files
   stay on the device they were added on (src/libfiles.js), so another device lists them as "on another device".
   Other tools add to the Library with addToLibrary / addFiles (Write by playing saves its MusicXML, MIDI and
   its own .wwscore.json here) and read a file back with getFile.

   The helpers at the top are pure (no DOM, no storage): what kind a file is, making an entry from another
   device safe to show, search and sort. */
import E from './engine.js';
import { putFile, getFile as readFile, delFile, localIds, thumbnail } from './libfiles.js';

export const STATUSES = [['want', 'Want to learn'], ['learning', 'Learning'], ['learned', 'Learned']];
export const MAX_FILE_MB = 150, MAX_FILES = 120;
const STATUS_IDS = new Set(STATUSES.map(s => s[0]));

/* ---------- what a file is ---------- */
const EXT = {
  pdf: 'pdf',
  jpg: 'image', jpeg: 'image', png: 'image', webp: 'image', gif: 'image', heic: 'image', heif: 'image', avif: 'image',
  musicxml: 'musicxml', mxl: 'musicxml', xml: 'musicxml',
  mscz: 'musescore', mscx: 'musescore',
  gp: 'guitarpro', gpx: 'guitarpro', gp3: 'guitarpro', gp4: 'guitarpro', gp5: 'guitarpro',
  mid: 'midi', midi: 'midi',
  mp3: 'audio', m4a: 'audio', wav: 'audio', ogg: 'audio', flac: 'audio', aac: 'audio', opus: 'audio',
  txt: 'text', md: 'text'
};
export const KIND_LABEL = {
  pdf: 'PDF', image: 'Photo', musicxml: 'MusicXML', musescore: 'MuseScore', guitarpro: 'Guitar Pro', midi: 'MIDI',
  audio: 'Audio', text: 'Text', wwscore: 'Written by playing', other: 'File'
};
/* files MuseScore opens (it imports Guitar Pro too) */
export const SCORE_KINDS = new Set(['musicxml', 'musescore', 'guitarpro', 'midi']);
export function fileKind(name, type) {
  const n = String(name || '').toLowerCase(), t = String(type || '').toLowerCase();
  if (n.endsWith('.wwscore.json')) return 'wwscore';
  const ext = n.includes('.') ? n.slice(n.lastIndexOf('.') + 1) : '';
  if (EXT[ext]) return EXT[ext];
  if (t.startsWith('image/')) return 'image';
  if (t === 'application/pdf') return 'pdf';
  if (t.startsWith('audio/')) return 'audio';
  if (t.includes('musicxml')) return 'musicxml';
  if (t.includes('midi')) return 'midi';
  return 'other';
}
/* the type to hand to another app when the browser didn't give one */
const MIME = {
  pdf: 'application/pdf', musicxml: 'application/vnd.recordare.musicxml+xml', midi: 'audio/midi',
  musescore: 'application/x-musescore', guitarpro: 'application/x-guitar-pro', text: 'text/plain', wwscore: 'application/json'
};
export function mimeOf(name, type) {
  if (type) return type;
  const k = fileKind(name);
  if (k === 'musicxml' && /\.mxl$/i.test(name)) return 'application/vnd.recordare.musicxml';
  return MIME[k] || 'application/octet-stream';
}
export function sizeLabel(bytes) {
  const b = Number(bytes) || 0;
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return Math.round(b / 1024) + ' KB';
  return (b / 1024 / 1024).toFixed(b < 10 * 1024 * 1024 ? 1 : 0) + ' MB';
}

/* ---------- entries ---------- */
const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : typeof v === 'number' ? String(v) : '');
const num = v => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : 0);
// a saved link is only ever opened as a web page: an entry from another device or a backup could carry anything
export const webLink = v => (typeof v === 'string' && /^https?:\/\/[^\s]+$/i.test(v.trim()) ? v.trim() : '');

function cleanFile(f) {
  if (!f || typeof f !== 'object' || typeof f.id !== 'string' || !f.id) return null;
  const name = str(f.name, 200) || 'file';
  return { id: f.id.slice(0, 64), name, type: str(f.type, 100), size: num(f.size), added: num(f.added), kind: fileKind(name, f.type), w: num(f.w), h: num(f.h) };
}
/* An entry as saved (perhaps by another device or an older app) → one that is safe to show */
export function cleanEntry(e) {
  if (!e || typeof e !== 'object' || typeof e.id !== 'string') return null;
  const files = (Array.isArray(e.files) ? e.files : []).map(cleanFile).filter(Boolean).slice(0, MAX_FILES);
  return {
    id: e.id, title: str(e.title, 200).trim() || 'Untitled', by: str(e.by, 200).trim(),
    status: STATUS_IDS.has(e.status) ? e.status : 'learning', notes: str(e.notes, 8000), link: webLink(e.link),
    files, source: str(e.source, 40), learned: num(e.learned), created: num(e.created), updatedAt: num(e.updatedAt)
  };
}
/* the fields a new entry starts with */
export function newEntry(fields = {}) {
  const status = STATUS_IDS.has(fields.status) ? fields.status : 'learning';
  return {
    title: str(fields.title, 200).trim() || 'Untitled', by: str(fields.by, 200).trim(), status,
    notes: str(fields.notes, 8000), link: webLink(fields.link), files: [], source: str(fields.source, 40),
    learned: status === 'learned' ? Date.now() : 0
  };
}
/* a copy with a new status; the day a song was first marked learned is kept */
export function withStatus(e, status, now = Date.now()) {
  if (!STATUS_IDS.has(status)) return e;
  return Object.assign({}, e, { status, learned: status === 'learned' ? (e.learned || now) : e.learned || 0 });
}
const fold = x => String(x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
export function matches(e, query) {
  const q = fold(query).trim();
  if (!q) return true;
  const hay = fold([e.title, e.by, e.notes, ...(e.files || []).map(f => f.name)].join(' '));
  return q.split(/\s+/).every(w => hay.includes(w));
}
/* 'recent' (last changed first), 'title' or 'by' (A to Z) */
export function sortEntries(list, by = 'recent') {
  const cmp = (a, b) => fold(a).localeCompare(fold(b));
  return list.slice().sort(by === 'title' ? (a, b) => cmp(a.title, b.title)
    : by === 'by' ? (a, b) => cmp(a.by || '￿', b.by || '￿') || cmp(a.title, b.title)
      : (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}
export function countBy(list) {
  const out = { all: list.length, want: 0, learning: 0, learned: 0 };
  list.forEach(e => { out[e.status] = (out[e.status] || 0) + 1; });
  return out;
}

/* ---------- reading and writing (the details through the engine, the files in IndexedDB) ---------- */
export const listEntries = () => E.listLibrary().map(cleanEntry).filter(Boolean);
export const getEntry = id => cleanEntry(E.getLibEntry(id));
/* A file added on this device → { blob, name, type }, or null (added on another device, or storage refused) */
export async function getFile(fileId) {
  const r = await readFile(fileId);
  return r && r.blob ? { blob: r.blob, name: r.name, type: mimeOf(r.name, r.type) } : null;
}
export async function getThumb(fileId) {
  const r = await readFile(fileId);
  return r ? r.thumb || null : null;
}
const fileId = () => 'lf' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/* Store files (File objects or { blob, name, type }) with an entry → { added, failed: [[name, why]] } */
export async function addFiles(entryId, files) {
  const out = { added: 0, failed: [] };
  for (const f of files || []) {
    const blob = f instanceof Blob ? f : f && f.blob;
    const name = str((f && f.name) || (blob && blob.name), 200) || 'file';
    if (!(blob instanceof Blob)) { out.failed.push([name, 'not a file']); continue; }
    const cur = E.getLibEntry(entryId);
    if (!cur) { out.failed.push([name, 'the entry was deleted']); continue; }
    if ((cur.files || []).length >= MAX_FILES) { out.failed.push([name, 'an entry holds ' + MAX_FILES + ' files at most']); continue; }
    if (blob.size > MAX_FILE_MB * 1024 * 1024) { out.failed.push([name, 'larger than ' + MAX_FILE_MB + ' MB']); continue; }
    const type = str((f && f.type) || blob.type, 100), kind = fileKind(name, type), id = fileId();
    const th = kind === 'image' ? await thumbnail(blob) : null;
    const ok = await putFile(id, { blob, name, type, size: blob.size, entry: entryId, thumb: th ? th.blob : null });
    if (!ok) { out.failed.push([name, 'this device would not store it (storage full or blocked)']); continue; }
    const e = E.getLibEntry(entryId);
    if (!e) { await delFile(id); out.failed.push([name, 'the entry was deleted']); continue; }
    const meta = { id, name, type, size: blob.size, added: Date.now() };
    if (th) { meta.w = th.w; meta.h = th.h; }
    E.saveLibEntry(Object.assign({}, e, { files: (e.files || []).concat([meta]) }));
    out.added++;
  }
  return out;
}
/* A new entry with its files → its id. meta: { title, by, notes, link, status, source, files } */
export async function addToLibrary(meta = {}) {
  const e = E.saveLibEntry(newEntry(meta));
  if (meta.files && meta.files.length) await addFiles(e.id, meta.files);
  return e.id;
}
/* Save edited details (title, by, notes, link, status); the file list is left as it is */
export function updateEntry(id, fields) {
  const e = E.getLibEntry(id);
  if (!e) return null;
  const next = Object.assign({}, e);
  ['title', 'by', 'notes'].forEach(k => { if (k in fields) next[k] = str(fields[k], k === 'notes' ? 8000 : 200); });
  if ('title' in fields && !next.title.trim()) next.title = 'Untitled';
  if ('link' in fields) next.link = webLink(fields.link);
  const out = 'status' in fields ? withStatus(next, fields.status) : next;
  return E.saveLibEntry(out);
}
export async function removeFile(entryId, id) {
  E.removeLibFile(entryId, id);
  await delFile(id);
}
/* Move a file one place earlier (-1) or later (+1). Photos move among the photos (they are the pages, read in
   this order) and other files among the other files. */
export function moveFile(entryId, id, dir) {
  const e = E.getLibEntry(entryId);
  if (!e || !Array.isArray(e.files)) return;
  const files = e.files.slice(), i = files.findIndex(f => f.id === id);
  if (i < 0) return;
  const img = f => fileKind(f.name, f.type) === 'image';
  let j = i + dir;
  while (j >= 0 && j < files.length && img(files[j]) !== img(files[i])) j += dir;
  if (j < 0 || j >= files.length) return;
  [files[i], files[j]] = [files[j], files[i]];
  E.saveLibEntry(Object.assign({}, e, { files }));
}
export async function deleteEntry(id) {
  const e = E.getLibEntry(id);
  const ids = e ? (e.files || []).map(f => f.id) : [];
  E.deleteLibEntry(id);
  for (const f of ids) await delFile(f);
}
/* Free the space of files deleted on another device (their entry or the file itself has a tombstone) */
export async function prune() {
  const tomb = E.state.tomb || {}, have = await localIds();
  let n = 0;
  for (const id of have) {
    if (tomb['libfile:' + id]) { await delFile(id); n++; continue; }
    const r = await readFile(id);
    if (r && r.entry && tomb['lib:' + r.entry] && !E.getLibEntry(r.entry)) { await delFile(id); n++; }
  }
  return n;
}
export { localIds };
