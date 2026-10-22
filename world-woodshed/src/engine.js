/* World Woodshed — adaptive engine: tracking, spaced repetition, mastery, routines */
import D from './data.js';
import { readingItems } from './content/reading.js';
import { gymItems } from './content/gym.js';
import { dictationItems } from './content/dictation.js';
import { SCHEMA, migrate, merge, digest } from './sync.js';

const LS_KEY = 'world-woodshed-v1';
const DAY = 86400000;
const BOX_MS = [0, 10 * 60 * 1000, DAY, 3 * DAY, 7 * DAY, 21 * DAY, 45 * DAY];
/* This install's id: practice time is kept per device so two devices' days add up when they sync.
   Lives outside the synced state on purpose. */
const DEV = (() => {
  try { let d = localStorage.getItem('ww-device'); if (!d) { d = 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); localStorage.setItem('ww-device', d); } return d; }
  catch (e) { return 'd-local'; }
})();

/* ---------- Skill definitions ---------- */
const SKILLS = {
  intervals: { name: 'Intervals', cat: 'ear', tool: 'intervals', qpm: 6 },
  chords: { name: 'Chord qualities', cat: 'ear', tool: 'chords', qpm: 6 },
  degrees: { name: 'Scale degrees', cat: 'ear', tool: 'degrees', qpm: 5 },
  progressions: { name: 'Progressions', cat: 'ear', tool: 'progressions', qpm: 3 },
  scales: { name: 'World scales by ear', cat: 'ear', tool: 'scales', qpm: 3 },
  dictation: { name: 'Melodic dictation', cat: 'ear', tool: 'dictation', qpm: 2 },
  rhythmTap: { name: 'Rhythm feel', cat: 'rhythm', tool: 'rhythms', qpm: 2 },
  rhythmId: { name: 'Rhythm ID', cat: 'rhythm', tool: 'rhythmid', qpm: 4 },
  clock: { name: 'Internal clock', cat: 'rhythm', tool: 'clock', qpm: 2 },
  tuplets: { name: 'Tuplets & 16ths', cat: 'rhythm', tool: 'gym', qpm: 1 },
  fretboard: { name: 'Fretboard notes', cat: 'play', tool: 'fretboard', qpm: 10 },
  callresp: { name: 'Call & response', cat: 'play', tool: 'callresp', qpm: 4 },
  repertoire: { name: 'Repertoire', cat: 'play', tool: 'repertoire', qpm: 6 },
  technique: { name: 'Technique', cat: 'tech', tool: 'technique', qpm: 1 },
  reading: { name: 'Sight-reading', cat: 'play', tool: 'sightread', qpm: 4 },
  atlas: { name: 'World knowledge', cat: 'know', tool: 'atlasquiz', qpm: 6 }
};
const CAT_NAMES = { ear: 'Ear', rhythm: 'Rhythm', play: 'Fretboard, reading & repertoire', tech: 'Technique', know: 'Knowledge' };

/* Your guitar: the tuning and capo set in Today → Your guitar. STRINGS is updated in place, so every tool
   that reads E.STRINGS (positions, fretboard answers, mic answers) follows the tuning. Ids stay by position
   (6th string = 'E' … 1st = 'e') so progress items keep their meaning. */
const TUNINGS = [
  { id: 'standard', name: 'Standard', midi: [40, 45, 50, 55, 59, 64] },
  { id: 'halfdown', name: 'Half step down', midi: [39, 44, 49, 54, 58, 63] },
  { id: 'dstd', name: 'Whole step down (D standard)', midi: [38, 43, 48, 53, 57, 62] },
  { id: 'dropd', name: 'Drop D', midi: [38, 45, 50, 55, 59, 64] },
  { id: 'dadgad', name: 'DADGAD', midi: [38, 45, 50, 55, 57, 62] },
  { id: 'openg', name: 'Open G (Taro Patch)', midi: [38, 43, 50, 55, 59, 62] },
  { id: 'opend', name: 'Open D', midi: [38, 45, 50, 54, 57, 62] },
  { id: 'openc', name: 'Open C', midi: [36, 43, 48, 55, 60, 64] },
  { id: 'opene', name: 'Open E', midi: [40, 47, 52, 56, 59, 64] },
  { id: 'dropc', name: 'Drop C', midi: [36, 43, 48, 53, 57, 62] }
];
const POS_IDS = ['E', 'A', 'D', 'G', 'B', 'e'];
const PCN = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
const STRINGS = POS_IDS.map((id, i) => ({ id, name: '', midi: TUNINGS[0].midi[i], open: TUNINGS[0].midi[i] }));
function applyTuning(id, capo) {
  const t = TUNINGS.find(x => x.id === id) || TUNINGS[0];
  capo = Math.max(0, Math.min(9, capo | 0));
  STRINGS.forEach((st, i) => {
    st.open = t.midi[i]; st.midi = t.midi[i] + capo;
    const n = (D.NOTE_NAMES[t.midi[i] % 12] || PCN[t.midi[i] % 12]);
    st.name = i === 0 ? 'low ' + n : i === 5 ? 'high ' + (n.length === 1 ? n.toLowerCase() : n) : n;
  });
  delete universeCache.fretboard;
}
/* Note names: letters (C D E) or fixed-do solfège (Do Re Mi), applied to the shared name tables in place */
const NAME_SETS = {
  letters: { names: ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'], full: ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'] },
  solfege: { names: ['Do', 'Do♯', 'Re', 'Mi♭', 'Mi', 'Fa', 'Fa♯', 'Sol', 'La♭', 'La', 'Si♭', 'Si'], full: ['Do', 'Do♯/Re♭', 'Re', 'Re♯/Mi♭', 'Mi', 'Fa', 'Fa♯/Sol♭', 'Sol', 'Sol♯/La♭', 'La', 'La♯/Si♭', 'Si'] },
  solfegeTi: { names: ['Do', 'Do♯', 'Re', 'Mi♭', 'Mi', 'Fa', 'Fa♯', 'Sol', 'La♭', 'La', 'Ti♭', 'Ti'], full: ['Do', 'Do♯/Re♭', 'Re', 'Re♯/Mi♭', 'Mi', 'Fa', 'Fa♯/Sol♭', 'Sol', 'Sol♯/La♭', 'La', 'La♯/Ti♭', 'Ti'] }
};
function applyNames(mode) {
  const set = NAME_SETS[mode] || NAME_SETS.letters;
  set.names.forEach((n, i) => { D.NOTE_NAMES[i] = n; }); set.full.forEach((n, i) => { D.NOTE_FULL[i] = n; });
}
function guitar() { const st = state.settings; return { tuning: st.tuning || 'standard', capo: st.capo || 0, lefty: !!st.lefty }; }
function setGuitar(patch) {
  Object.assign(state.settings, patch);
  const g = guitar(); applyNames(state.settings.noteNames); applyTuning(g.tuning, g.capo);
  scheduleSave(); emit();
}
const NATURALS = [0, 2, 4, 5, 7, 9, 11];

/* Item universe for each skill: [{id, label, tier}] */
const universeCache = {};
function universe(skill) {
  if (universeCache[skill]) return universeCache[skill];
  let list = [];
  switch (skill) {
    case 'intervals': {
      const t1 = ['P5', 'P4', 'P8', 'M3'], t2 = ['m3', 'M2', 'M6'], t3 = ['m6', 'm7', 'M7', 'm2', 'TT'];
      D.INTERVALS.forEach(iv => {
        const up = t1.includes(iv.id) ? 1 : t2.includes(iv.id) ? 2 : 3;
        const down = t1.includes(iv.id) ? 2 : t2.includes(iv.id) ? 3 : 4;
        list.push({ id: iv.id + ':up', label: iv.name + ' ↑', tier: up });
        list.push({ id: iv.id + ':down', label: iv.name + ' ↓', tier: down });
        list.push({ id: iv.id + ':harm', label: iv.name + ' (together)', tier: 5 });
      });
      break;
    }
    case 'chords': list = D.CHORDS.map(c => ({ id: c.id, label: c.name, tier: c.tier })); break;
    case 'degrees': list = D.DEGREES.map(d => ({ id: d.id, label: 'Degree ' + d.id, tier: d.tier })); break;
    case 'progressions': list = D.NUMERALS.filter(n => n.id !== 'I').map(n => ({ id: n.id, label: n.id + ' chord', tier: n.tier })); break;
    case 'scales': list = D.SCALES.map(s => ({ id: s.id, label: s.name, tier: s.tier })); break;
    case 'dictation': list = dictationItems(); break;
    case 'rhythmTap': case 'rhythmId': list = D.RHYTHMS.map(r => ({ id: r.id, label: r.name, tier: r.tier })); break;
    case 'clock': list = [[100, 1], [80, 1], [120, 2], [60, 2], [140, 3], [50, 3], [160, 4]].map(([b, t]) => ({ id: String(b), label: b + ' bpm', tier: t })); break;
    case 'fretboard':
      STRINGS.forEach((s, si) => {
        for (let pc = 0; pc < 12; pc++) {
          const natural = NATURALS.includes(pc);
          let tier;
          if (si <= 1) tier = natural ? 1 : 2;
          else if (si <= 3) tier = natural ? 3 : 4;
          else tier = natural ? 4 : 5;
          list.push({ id: s.id + ':' + pc, label: D.NOTE_NAMES[pc] + ' on ' + s.name, tier });
        }
      });
      break;
    case 'callresp': list = D.LICK_ITEMS.map(l => ({ id: l.id, label: scaleName(l.scale) + ', ' + l.len + ' notes', tier: l.tier })); break;
    case 'repertoire': list = D.TUNES.map((t, i) => ({ id: t.id, label: t.name, tier: t.group === 'Jazz standards' ? Math.min(5, 1 + Math.floor(i / 3)) : 2 })); break;
    case 'technique': list = D.EXERCISES.map(e => ({ id: e.id, label: e.name, tier: 1 })); break;
    case 'reading': list = readingItems(); break;
    case 'tuplets': list = gymItems(); break;
    case 'atlas':
      D.REGIONS.forEach(r => r.facts.forEach((f, i) => list.push({ id: r.id + ':' + i, label: r.name + ': ' + f.q, tier: 1, region: r.id })));
      break;
  }
  universeCache[skill] = list;
  return list;
}
function scaleName(id) { const s = D.SCALES.find(x => x.id === id); return s ? s.name : id; }
function itemLabel(skill, id) {
  const it = universe(skill).find(x => x.id === id);
  if (!it && skill === 'repertoire' && state.tunes && state.tunes[id]) return state.tunes[id].name;
  return it ? it.label : id;
}

/* ---------- State ---------- */
function freshState() {
  return {
    v: 1, schema: SCHEMA, created: Date.now(), updatedAt: 0,
    skills: {}, history: {}, hdev: {}, tomb: {}, anchors: {},
    tech: {}, scaleTime: {},
    settings: { latencyMs: 0, minutes: 30, focus: 'balanced', regionWeek: null },
    routine: null, placementDone: false, songs: {}, tunes: {},
    routines: [], session: null, lessons: {}, heard: {}, journal: []
  };
}
let state = freshState();
const listeners = new Set();
const onChange = fn => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = () => listeners.forEach(fn => { try { fn(state); } catch (e) { console.error(e); } });

function skillState(k) {
  if (!state.skills[k]) state.skills[k] = { items: {}, conf: {}, last: 0 };
  return state.skills[k];
}

/* ---------- Persistence: localStorage now, then the private db document ---------- */
let db = null, docRef = null, saveTimer = null, saving = false, pendingSave = false;
let storageNote = 'Saved on this device';
function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) { const s = JSON.parse(raw); if (s && s.v === 1) state = Object.assign(freshState(), migrate(s, DEV)); }
  } catch (e) { /* storage unavailable */ }
}
/* Save health: did the last save reach this device's storage? localStorage is the main copy and IndexedDB
   the second; a save that fails in one still goes to the other. The UI shows one quiet banner while the
   main copy is failing (src/ui/savebanner.js), never a toast per save. */
const health = { local: true, idb: true, lastOk: Date.now(), error: '' };
const healthListeners = new Set();
const STALE = DAY; // after a day without a successful save, the banner asks for a backup file
function saveHealth() {
  const level = health.local ? 'ok' : health.idb ? 'idb-only' : 'failing';
  return { level, lastOk: health.lastOk, stale: level !== 'ok' && Date.now() - health.lastOk > STALE, error: health.error };
}
function onSaveHealth(fn) { healthListeners.add(fn); return () => healthListeners.delete(fn); }
let healthSig = 'ok';
function markSave(store, ok, err, quiet) {
  health[store] = ok;
  if (ok) health.lastOk = Date.now();
  else if (err && store === 'local') health.error = err.name === 'QuotaExceededError' ? 'storage full' : (err.name || err.message || 'storage unavailable');
  if (quiet) return;
  const h = saveHealth(), sig = h.level + (h.stale ? ':stale' : '');
  if (sig !== healthSig) { healthSig = sig; healthListeners.forEach(fn => { try { fn(h); } catch (e) { console.error(e); } }); }
}
function saveLocal() {
  const json = JSON.stringify(state);
  // a failure here is announced once the IndexedDB copy has settled, so the banner says the right thing first time
  try { localStorage.setItem(LS_KEY, json); markSave('local', true); } catch (e) { markSave('local', false, e, true); }
  idbPut(json);
}

/* A second copy in IndexedDB, so progress survives if localStorage is cleared or full */
let idbp = null;
function idb() {
  if (!idbp) idbp = new Promise((res, rej) => {
    try {
      const r = indexedDB.open('world-woodshed-state', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('state');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    } catch (e) { rej(e); }
  });
  return idbp;
}
function idbPut(json) {
  idb().then(d => new Promise((res, rej) => {
    const tx = d.transaction('state', 'readwrite');
    tx.objectStore('state').put(json, LS_KEY);
    tx.oncomplete = res; tx.onerror = tx.onabort = () => rej(tx.error);
  })).then(() => markSave('idb', true), e => markSave('idb', false, e));
}
async function loadIdb() {
  try {
    const d = await idb();
    const json = await new Promise((res, rej) => {
      const r = d.transaction('state', 'readonly').objectStore('state').get(LS_KEY);
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    const s = json ? JSON.parse(json) : null;
    if (s && s.v === 1) adopt(migrate(s, DEV), false);
  } catch (e) { /* IndexedDB unavailable */ }
}

/* Fold another copy of the progress (IndexedDB, the cloud, a sync file) into this one.
   Nothing practised on either side is lost; returns true when anything changed. */
function adopt(other, save = true) {
  const before = digest(state);
  state = Object.assign(freshState(), merge(state, other));
  const changed = digest(state) !== before;
  if (changed) { applyNames(state.settings.noteNames); applyTuning(guitar().tuning, guitar().capo); saveLocal(); emit(); }
  if (save && changed) scheduleSave(300);
  return changed;
}
function tombstone(key) { if (!state.tomb) state.tomb = {}; state.tomb[key] = Date.now(); }

/* ---------- Backup and sync file: export and import ---------- */
function exportBackup() {
  return { app: 'world-woodshed', exportedAt: new Date().toISOString(), device: DEV, schema: SCHEMA, state };
}
/* mode 'merge' (default) combines the file with this device's progress; 'replace' restores it as it was */
function importBackup(obj, mode = 'merge') {
  const s = obj && obj.app === 'world-woodshed' ? obj.state : obj;
  if (!s || s.v !== 1 || typeof s.skills !== 'object') throw new Error('This file is not a World Woodshed backup');
  const m = migrate(JSON.parse(JSON.stringify(s)), obj.device || 'file');
  if (mode === 'replace') { state = Object.assign(freshState(), m); applyNames(state.settings.noteNames); applyTuning(guitar().tuning, guitar().capo); scheduleSave(100); emit(); return true; }
  return adopt(m);
}

/* ---------- Cloud: the private database inside a claude.ai Artifact ----------
   The state is stored in chunks (a document holds at most 256 KiB) under data/users/<id>/, written chunks first
   and the index last, so a reader never sees half a save. Other devices' saves arrive live and are merged in. */
const CHUNK = 180000;
let cloudBase = '', cloudVer = '', unsubCloud = null, lastPulled = '';
async function cloudRead() {
  const snap = await docRef.get();
  if (!snap.exists) return null;
  const meta = snap.data();
  if (typeof meta.json === 'string') return JSON.parse(meta.json); // the old single-document format
  if (!meta.n) return null;
  const parts = await Promise.all(Array.from({ length: meta.n }, (_, i) => db.doc(cloudBase + '/chunks/c' + i).get()));
  if (parts.some(p => !p.exists || p.data().ver !== meta.ver)) return null; // another device is mid-save; its snapshot will come
  lastPulled = meta.ver;
  return JSON.parse(parts.map(p => p.data().part).join(''));
}
async function connectCloud() {
  try {
    if (!window.claude || !window.claude.use) return;
    const [dbNs, userNs] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (!dbNs || !userNs) return;
    const uid = await userNs.id();
    if (!uid) return;
    db = dbNs;
    cloudBase = 'data/users/' + uid;
    docRef = db.doc(cloudBase + '/progress');
    const remote = await cloudRead();
    const changedHere = remote && remote.v === 1 ? adopt(migrate(remote, 'cloud'), false) : false;
    // push if this device has anything the cloud copy lacks
    if (!remote || changedHere || digest(state) !== digest(Object.assign(freshState(), migrate(remote, 'cloud')))) scheduleSave(200);
    storageNote = 'Synced to your account';
    emit();
    if (unsubCloud) unsubCloud();
    unsubCloud = docRef.onSnapshot(snap => {
      if (!snap.exists) return;
      const meta = snap.data();
      if (!meta || meta.ver === cloudVer || meta.ver === lastPulled || meta.dev === DEV) return;
      cloudRead().then(r => { if (r && r.v === 1) adopt(migrate(r, 'cloud'), false); }).catch(() => {});
    }, () => {});
  } catch (e) {
    docRef = null;
  }
}
function scheduleSave(delay = 1200) {
  state.updatedAt = Date.now();
  saveLocal();
  if (!docRef) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, delay);
}
async function flush() {
  if (!docRef) return;
  if (saving) { pendingSave = true; return; }
  saving = true;
  try {
    const json = JSON.stringify(state), n = Math.max(1, Math.ceil(json.length / CHUNK)), ver = uid('v');
    for (let i = 0; i < n; i++) await db.doc(cloudBase + '/chunks/c' + i).set({ ver, i, part: json.slice(i * CHUNK, (i + 1) * CHUNK) });
    cloudVer = ver;
    await docRef.set({ ver, n, dev: DEV, schema: SCHEMA, updatedAt: state.updatedAt });
    storageNote = 'Synced to your account';
  } catch (e) {
    if (e && e.code === 'unavailable') { setTimeout(flush, 1500 + Math.random() * 1000); }
    else if (e && (e.code === 'invalid_argument' || e.code === 'revoked' || e.code === 'not_granted')) { docRef = null; storageNote = 'Saved on this device'; }
  }
  saving = false;
  if (pendingSave) { pendingSave = false; flush(); }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { saveLocal(); flush(); } });

/* ---------- Dates & history ---------- */
function dayKey(t = Date.now()) {
  const d = new Date(t);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function today() {
  const k = dayKey();
  if (!state.history[k]) state.history[k] = { sec: 0, q: 0, c: 0, by: {} };
  return state.history[k];
}
/* this device's own record of today (the totals above add up every device's) */
function todayDev() {
  const k = dayKey();
  if (!state.hdev) state.hdev = {};
  const d = state.hdev[DEV] || (state.hdev[DEV] = {});
  if (!d[k]) d[k] = { sec: 0, q: 0, c: 0, by: {} };
  return d[k];
}
function bump(rec, skill, q, c, sec) {
  rec.q += q; rec.c += c; rec.sec += sec;
  if (skill) { const b = rec.by[skill] || (rec.by[skill] = [0, 0, 0]); b[0] += q; b[1] += c; b[2] = (b[2] || 0) + sec; }
}
function addTime(sec, skill) {
  if (!(sec > 0)) return;
  const add = Math.min(sec, 600);
  bump(today(), skill, 0, 0, add); bump(todayDev(), skill, 0, 0, add);
  scheduleSave();
}
/* Time on a scale in one key, kept per device and for good (not pruned with the daily history):
   kind 'v' is seen in your head (No-guitar drills), 'p' is played (Scale warm-up). */
function addScaleTime(kind, scale, tonic, sec) {
  if (!(sec > 0) || (kind !== 'v' && kind !== 'p') || !scale || !Number.isInteger(tonic)) return;
  if (!state.scaleTime) state.scaleTime = {};
  const d = state.scaleTime[DEV] || (state.scaleTime[DEV] = {});
  const k = scale + ':' + (((tonic % 12) + 12) % 12);
  const r = d[k] || (d[k] = { v: 0, p: 0, last: 0 });
  r[kind] = Math.round(((r[kind] || 0) + Math.min(sec, 600)) * 10) / 10;
  r.last = Date.now();
  scheduleSave();
}
function pruneHistory() {
  const keys = Object.keys(state.history).sort();
  while (keys.length > 180) delete state.history[keys.shift()];
  const oldest = keys[0];
  Object.values(state.hdev || {}).forEach(d => Object.keys(d).forEach(k => { if (k < oldest) delete d[k]; }));
}

/* ---------- Recording results ---------- */
function record(skill, itemId, correct, opts = {}) {
  const ss = skillState(skill);
  const it = ss.items[itemId] || (ss.items[itemId] = { n: 0, c: 0, ema: 0, box: 0, due: 0, last: 0 });
  const score = typeof opts.score === 'number' ? Math.max(0, Math.min(1, opts.score)) : (correct ? 1 : 0);
  it.ema = it.n === 0 ? score : it.ema * 0.7 + score * 0.3;
  it.n++; if (correct) it.c++;
  it.box = correct ? Math.min(BOX_MS.length - 1, it.box + 1) : 0;
  it.due = Date.now() + BOX_MS[it.box];
  it.last = Date.now();
  if (opts.rt) it.rt = it.rt ? it.rt * 0.7 + opts.rt * 0.3 : opts.rt;
  if (!correct && opts.confused && opts.confused !== itemId) {
    const key = itemId + '>' + opts.confused;
    ss.conf[key] = (ss.conf[key] || 0) + 1;
  }
  ss.last = Date.now();
  const h = today();
  bump(h, skill, 1, correct ? 1 : 0, 0); bump(todayDev(), skill, 1, correct ? 1 : 0, 0);
  h.mastery = h.mastery || {};
  h.mastery[skill] = Math.round(mastery(skill));
  pruneHistory();
  scheduleSave();
  emit();
  return it;
}

/* ---------- Mastery & unlocking ---------- */
function mastery(skill) {
  const ss = skillState(skill), u = universe(skill);
  if (!u.length) return 0;
  if (skill === 'technique') {
    let sum = 0;
    u.forEach(x => {
      const ex = D.EXERCISES.find(e => e.id === x.id), t = state.tech[x.id];
      if (t && t.best) sum += Math.min(1, t.best / ex.target);
    });
    return 100 * sum / u.length;
  }
  let sum = 0;
  u.forEach(x => { const it = ss.items[x.id]; if (it) sum += it.ema * Math.min(1, it.n / 3); });
  return 100 * sum / u.length;
}
function unlockedTier(skill) {
  const ss = skillState(skill), u = universe(skill);
  const maxTier = Math.max(...u.map(x => x.tier));
  let tier = 1;
  while (tier < maxTier) {
    const pool = u.filter(x => x.tier <= tier);
    const seen = pool.filter(x => ss.items[x.id]);
    const coverage = seen.length / pool.length;
    const avg = seen.length ? seen.reduce((a, x) => a + ss.items[x.id].ema, 0) / seen.length : 0;
    if (coverage >= 0.8 && avg >= 0.75) tier++; else break;
  }
  return tier;
}
/* What stands between you and the next level of a skill, in plain words */
function levelProgress(skill) {
  const ss = skillState(skill), u = universe(skill), tier = unlockedTier(skill);
  const maxTier = Math.max(...u.map(x => x.tier));
  if (tier >= maxTier) return { tier, maxTier, text: 'All levels open' };
  const pool = u.filter(x => x.tier <= tier), seen = pool.filter(x => ss.items[x.id]);
  const avg = seen.length ? seen.reduce((a, x) => a + ss.items[x.id].ema, 0) / seen.length : 0;
  const needSeen = Math.max(0, Math.ceil(pool.length * 0.8) - seen.length);
  const parts = [];
  if (needSeen) parts.push(needSeen + ' more item' + (needSeen === 1 ? '' : 's') + ' to try');
  if (avg < 0.75) parts.push('accuracy ' + Math.round(avg * 100) + '% of 75%');
  return { tier, maxTier, coverage: seen.length / pool.length, avg, text: 'Level ' + (tier + 1) + ': ' + (parts.join(', ') || 'nearly there') };
}
function unlocked(skill) { const t = unlockedTier(skill); return universe(skill).filter(x => x.tier <= t); }
function dueCount(skill) {
  const ss = skillState(skill), n = Date.now();
  return unlocked(skill).filter(x => ss.items[x.id] && ss.items[x.id].due <= n).length;
}
function daysSince(skill) {
  const l = skillState(skill).last;
  return l ? (Date.now() - l) / DAY : 99;
}

/* Weighted pick: due reviews, weak items, new items; avoids repeats */
const recent = {};
function pick(skill, pool, opts = {}) {
  const ss = skillState(skill), n = Date.now();
  pool = pool || unlocked(skill);
  if (!pool.length) return null;
  const rec = recent[skill] || (recent[skill] = []);
  const weights = pool.map(x => {
    const it = ss.items[x.id];
    let w;
    if (opts.uniform) w = 1;
    else if (!it) w = 2.2;
    else {
      w = 0.35 + (1 - it.ema) * 2.5;
      if (it.due <= n) w += 1.4;
      if (it.n < 3) w += 0.6;
    }
    const ri = rec.indexOf(x.id);
    if (ri >= 0) w *= ri === rec.length - 1 ? 0.02 : 0.35;
    return w;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total, chosen = pool[pool.length - 1];
  for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) { chosen = pool[i]; break; } }
  rec.push(chosen.id); if (rec.length > Math.min(4, Math.max(1, pool.length - 1))) rec.shift();
  return chosen;
}

/* ---------- Insights ---------- */
function weakItems(limit = 6) {
  const out = [];
  Object.keys(SKILLS).forEach(k => {
    if (k === 'technique') return;
    const ss = skillState(k);
    Object.entries(ss.items).forEach(([id, it]) => { if (it.n >= 2) out.push({ skill: k, id, ema: it.ema, n: it.n, label: itemLabel(k, id) }); });
  });
  return out.sort((a, b) => a.ema - b.ema).filter(x => x.ema < 0.8).slice(0, limit);
}
function confusions(limit = 4) {
  const out = [];
  Object.keys(SKILLS).forEach(k => {
    Object.entries(skillState(k).conf).forEach(([key, count]) => {
      const [a, b] = key.split('>');
      out.push({ skill: k, a, b, count, la: itemLabel(k, a), lb: itemLabel(k, b) });
    });
  });
  return out.sort((x, y) => y.count - x.count).slice(0, limit);
}
function topConfusion(skill) { return confusions(50).find(c => c.skill === skill && c.count >= 2); }
function lastNDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const k = dayKey(Date.now() - i * DAY);
    const h = state.history[k] || { sec: 0, q: 0, c: 0 };
    out.push({ key: k, min: Math.round(h.sec / 60), q: h.q, c: h.c, acc: h.q ? h.c / h.q : null, date: new Date(Date.now() - i * DAY) });
  }
  return out;
}
function streak() {
  let s = 0;
  for (let i = 0; i < 400; i++) {
    const h = state.history[dayKey(Date.now() - i * DAY)];
    if (h && (h.q > 0 || h.sec > 60)) s++;
    else if (i === 0) continue;
    else break;
  }
  return s;
}
function trend(skill) {
  const nowM = mastery(skill);
  for (let i = 7; i <= 14; i++) {
    const h = state.history[dayKey(Date.now() - i * DAY)];
    if (h && h.mastery && typeof h.mastery[skill] === 'number') return nowM - h.mastery[skill];
  }
  return null;
}

/* ---------- Region of the week ---------- */
function regionScore(r) {
  const vals = [];
  r.rhythms.forEach(id => { const it = skillState('rhythmTap').items[id]; vals.push(it ? it.ema : 0); });
  r.scales.forEach(id => { const it = skillState('scales').items[id]; vals.push(it ? it.ema : 0); });
  r.facts.forEach((f, i) => { const it = skillState('atlas').items[r.id + ':' + i]; vals.push(it ? it.ema : 0); });
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
}
function regionOfWeek() {
  const rw = state.settings.regionWeek;
  const pri = (state.cur && state.cur.prefs && state.cur.prefs.styles) || [];
  if (rw && Date.now() - rw.start < 7 * DAY && D.REGIONS.find(r => r.id === rw.id) && (!pri.length || pri.includes(rw.id) || rw.manual)) return D.REGIONS.find(r => r.id === rw.id);
  const visited = (state.settings.visitedRegions || []);
  // with style priorities set, the weekly focus rotates through them, favouring the top of the list
  let candidates = pri.map(id => D.REGIONS.find(r => r.id === id)).filter(Boolean);
  // (a ranked style this version doesn't have, from another device, doesn't count)
  if (!candidates.length) candidates = D.REGIONS.filter(r => r.rhythms.length || r.scales.length);
  const ranked = candidates.map((r, i) => ({ r, s: regionScore(r) + (visited.includes(r.id) ? 0.3 : 0) + (pri.length ? i * 0.12 : 0) + Math.random() * 0.05 })).sort((a, b) => a.s - b.s);
  const chosen = ranked[0].r;
  state.settings.regionWeek = { id: chosen.id, start: Date.now() };
  const v = state.settings.visitedRegions || (state.settings.visitedRegions = []);
  if (!v.includes(chosen.id)) v.push(chosen.id);
  if (v.length >= D.REGIONS.length) state.settings.visitedRegions = [chosen.id];
  scheduleSave();
  return chosen;
}
function setRegionWeek(id) {
  state.settings.regionWeek = { id, start: Date.now(), manual: true };
  const v = state.settings.visitedRegions || (state.settings.visitedRegions = []);
  if (!v.includes(id)) v.push(id);
  if (v.length >= D.REGIONS.length) state.settings.visitedRegions = [id];
  scheduleSave(); emit();
}

/* ---------- Routine generator ---------- */
const FOCUS = {
  balanced: { name: 'Balanced', bonus: {} },
  ear: { name: 'Ear first', bonus: { intervals: 0.5, chords: 0.5, degrees: 0.6, progressions: 0.5, scales: 0.3, callresp: 0.4 } },
  rhythm: { name: 'Rhythm & time', bonus: { rhythmTap: 0.7, clock: 0.6, rhythmId: 0.4, technique: 0.2 } },
  jazz: { name: 'Jazz', bonus: { repertoire: 0.8, chords: 0.4, progressions: 0.4, degrees: 0.3, callresp: 0.3 } },
  world: { name: 'World music', bonus: { scales: 0.7, rhythmTap: 0.6, rhythmId: 0.5, atlas: 0.5, repertoire: 0.2 } },
  hands: { name: 'Hands & fretboard', bonus: { technique: 0.7, fretboard: 0.6, callresp: 0.5, repertoire: 0.3 } }
};

function techPick() {
  // exercise with lowest best/target, nudged toward the region of the week
  const rw = regionOfWeek();
  const regional = { flamenco: ['rasg', 'picado'], manouche: ['reststroke', 'pompe'], brazil: ['bossarh'], carnatic: ['konnakol'], hindustani: ['konnakol'], cuba: ['strskip'], westafrica: ['travis'], centraleast: ['altpick', 'tremolo'],
    blues: ['bends'], rock: ['altpick', 'legato', 'bends'], funksoul: ['funkstrum'], country: ['hybrid', 'travis'], classical: ['pima'], fado: ['tremolo'], hawaii: ['travis'], persian: ['tremolo'] }[rw.id] || [];
  const ranked = D.EXERCISES.map(e => {
    const t = state.tech[e.id];
    const ratio = t && t.best ? t.best / e.target : 0;
    const stale = t && t.last ? Math.min(1, (Date.now() - t.last) / (5 * DAY)) : 1;
    return { e, s: ratio - stale * 0.3 - (regional.includes(e.id) ? 0.35 : 0) + Math.random() * 0.15 };
  }).sort((a, b) => a.s - b.s);
  return ranked[0].e;
}

function makeRoutine(minutes, focus) {
  minutes = minutes || state.settings.minutes || 30;
  focus = focus || state.settings.focus || 'balanced';
  state.settings.minutes = minutes; state.settings.focus = focus;
  const rw = regionOfWeek();
  const fb = (FOCUS[focus] || FOCUS.balanced).bonus;
  const info = Object.keys(SKILLS).filter(k => k !== 'technique').map(k => {
    const m = mastery(k), days = daysSince(k), due = dueCount(k);
    const p = (1 - m / 100) * 1.0 + Math.min(days, 10) / 10 * 0.6 + Math.min(due, 10) / 10 * 0.5 + (fb[k] || 0) + Math.random() * 0.08;
    return { k, m, days, due, p };
  }).sort((a, b) => b.p - a.p);

  const nBlocks = minutes <= 15 ? 3 : minutes <= 30 ? 5 : minutes <= 45 ? 6 : 7;
  const warm = Math.max(3, Math.round(minutes * 0.12));
  const blocks = [];
  const ex = techPick();
  blocks.push({ skill: 'technique', tool: 'technique', minutes: warm, params: { exercise: ex.id }, reason: 'Warm-up: ' + ex.name + techReason(ex) });

  // pick core skills, alternating categories, at least one ear and one rhythm
  const chosen = [];
  const want = nBlocks - 2;
  const needCats = ['ear', 'rhythm'];
  needCats.forEach(c => { const s = info.find(x => SKILLS[x.k].cat === c && !chosen.includes(x)); if (s && chosen.length < want) chosen.push(s); });
  info.forEach(x => { if (chosen.length < want && !chosen.includes(x)) chosen.push(x); });
  // order to avoid same category back to back
  chosen.sort((a, b) => b.p - a.p);
  const ordered = [];
  while (chosen.length) {
    const prevCat = ordered.length ? SKILLS[ordered[ordered.length - 1].k].cat : 'tech';
    let idx = chosen.findIndex(x => SKILLS[x.k].cat !== prevCat);
    if (idx < 0) idx = 0;
    ordered.push(chosen.splice(idx, 1)[0]);
  }
  const applyMin = Math.max(4, Math.round(minutes * 0.2));
  const coreMin = Math.max(minutes - warm - applyMin, ordered.length * 3);
  const pSum = ordered.reduce((a, x) => a + x.p, 0) || 1;
  ordered.forEach(x => {
    const mins = Math.max(3, Math.round(coreMin * x.p / pSum));
    const params = {};
    if (['rhythmTap', 'rhythmId', 'scales', 'atlas'].includes(x.k)) params.region = rw.id;
    blocks.push({ skill: x.k, tool: SKILLS[x.k].tool, minutes: mins, questions: Math.max(2, Math.round(mins * SKILLS[x.k].qpm)), params, reason: reasonFor(x, rw) });
  });

  // apply block: play music in context
  const regionTunes = D.TUNES.filter(t => t.region === rw.id);
  let apply;
  if (focus === 'jazz' || (!regionTunes.length && focus !== 'world')) {
    const tune = pick('repertoire', unlocked('repertoire').filter(x => D.TUNES.find(t => t.id === x.id).group === 'Jazz standards'));
    apply = { skill: 'repertoire', tool: 'repertoire', minutes: applyMin, params: { tune: tune ? tune.id : 'autumn' }, reason: 'Apply it: play over ' + (D.TUNES.find(t => t.id === (tune ? tune.id : 'autumn')).name) + ' and drill its guide tones' };
  } else if (regionTunes.length) {
    const tune = regionTunes[Math.floor(Math.random() * regionTunes.length)];
    apply = { skill: 'repertoire', tool: 'repertoire', minutes: applyMin, params: { tune: tune.id }, reason: 'Apply it: jam over the ' + tune.name + ' (' + rw.name + ')' };
  } else {
    const rid = rw.rhythms[0] || 'son32';
    apply = { skill: 'rhythmTap', tool: 'rhythms', minutes: applyMin, questions: Math.max(2, Math.round(applyMin * 1.5)), params: { region: rw.id, rhythm: rid }, reason: 'Apply it: groove with ' + D.RHYTHMS.find(r => r.id === rid).name + ' from ' + rw.name };
  }
  // transcription block: keep working on a song you opened recently
  const recentSong = listSongs().find(sg => sg.lastOpened && Date.now() - sg.lastOpened < 21 * DAY);
  if (recentSong && minutes >= 30 && (focus === 'ear' || Math.random() < 0.4)) {
    blocks.push({ skill: 'transcribe', tool: 'transcribe', minutes: Math.max(5, Math.round(minutes * 0.2)), params: { song: recentSong.id }, reason: 'Transcribe: keep working on "' + recentSong.title + '"' + (recentSong.sections && recentSong.sections.length ? ' (' + recentSong.sections.length + ' saved sections)' : '') });
  }
  blocks.push(apply);
  blocks.forEach((b, i) => { b.id = 'b' + i; b.done = false; b.progress = 0; });
  state.routine = { date: dayKey(), minutes, focus, region: rw.id, blocks };
  scheduleSave(); emit();
  return state.routine;
}
function techReason(ex) {
  const t = state.tech[ex.id];
  if (!t || !t.best) return ' (new: find your starting tempo)';
  return ' (best ' + t.best + ' / goal ' + ex.target + ' ' + (ex.mode === 'count' ? 'per min' : 'bpm') + ')';
}
function reasonFor(x, rw) {
  const c = topConfusion(x.k);
  const bits = [];
  if (x.m < 25) bits.push('lowest mastery (' + Math.round(x.m) + '%)');
  else bits.push(Math.round(x.m) + '% mastered');
  if (x.due >= 3) bits.push(x.due + ' items due for review');
  if (x.days >= 2 && x.days < 99) bits.push('not practiced for ' + Math.floor(x.days) + ' days');
  if (x.days >= 99) bits.push('not started yet');
  if (c) bits.push('you mix up ' + shortLabel(c.la) + ' and ' + shortLabel(c.lb));
  if (['rhythmTap', 'rhythmId', 'scales', 'atlas'].includes(x.k)) bits.push('focus: ' + rw.name);
  return bits.join(' · ');
}
function shortLabel(l) { return l.replace(' (together)', ' harmonic'); }

function routineToday() {
  const r = state.routine;
  return r && r.date === dayKey() ? r : null;
}
function blockProgress(blockId, progress, done) {
  const r = routineToday(); if (!r) return;
  const b = r.blocks.find(x => x.id === blockId); if (!b) return;
  b.progress = progress; if (done) b.done = true;
  scheduleSave(); emit();
}

/* ---------- Placement test plan ---------- */
function placementPlan() {
  return [
    { skill: 'intervals', tool: 'intervals', questions: 10, params: { test: true }, reason: 'All interval types, up and down' },
    { skill: 'chords', tool: 'chords', questions: 8, params: { test: true }, reason: 'Chord qualities from triads to 9ths' },
    { skill: 'degrees', tool: 'degrees', questions: 6, params: { test: true }, reason: 'Hear notes against a key' },
    { skill: 'scales', tool: 'scales', questions: 5, params: { test: true }, reason: 'Scales from several traditions' },
    { skill: 'fretboard', tool: 'fretboard', questions: 10, params: { test: true }, reason: 'Find notes on every string' },
    { skill: 'clock', tool: 'clock', questions: 1, params: { test: true, tempo: '100' }, reason: 'Keep time when the click disappears' },
    { skill: 'rhythmTap', tool: 'rhythms', questions: 1, params: { test: true, rhythm: 'son32' }, reason: 'Tap son clave' },
    { skill: 'atlas', tool: 'atlasquiz', questions: 6, params: { test: true }, reason: 'What you already know about world music' }
  ].map((b, i) => Object.assign(b, { id: 'p' + i, done: false, progress: 0, minutes: Math.ceil(b.questions / SKILLS[b.skill].qpm) }));
}
function finishPlacement() { state.placementDone = true; scheduleSave(); emit(); }

/* ---------- Technique ladders ---------- */
function techState(id) {
  const ex = D.EXERCISES.find(e => e.id === id);
  if (!state.tech[id]) state.tech[id] = { bpm: ex.start || 60, best: 0, last: 0, hist: [], sloppy: 0 };
  return state.tech[id];
}
function techResult(id, clean) {
  const ex = D.EXERCISES.find(e => e.id === id), t = techState(id);
  if (clean) {
    t.best = Math.max(t.best, t.bpm);
    t.bpm = Math.min(ex.target + 40, t.bpm + 4);
    t.sloppy = 0;
  } else {
    t.sloppy = (t.sloppy || 0) + 1;
    if (t.sloppy >= 2) { t.bpm = Math.max(30, t.bpm - 8); t.sloppy = 0; }
  }
  t.last = Date.now();
  t.hist.push([dayKey(), t.best]); if (t.hist.length > 60) t.hist.shift();
  const h = today(); h.mastery = h.mastery || {}; h.mastery.technique = Math.round(mastery('technique'));
  skillState('technique').last = Date.now();
  scheduleSave(); emit();
  return t;
}
function techCount(id, count) {
  const t = techState(id);
  t.best = Math.max(t.best, count); t.bpm = count; t.last = Date.now();
  t.hist.push([dayKey(), count]); if (t.hist.length > 60) t.hist.shift();
  skillState('technique').last = Date.now();
  scheduleSave(); emit();
  return t;
}
function setTechBpm(id, bpm) { techState(id).bpm = Math.max(30, Math.min(300, Math.round(bpm))); scheduleSave(); }

/* ---------- Anchors & settings ---------- */
function anchor(ivId, dir) {
  const custom = state.anchors[ivId + ':' + dir];
  if (custom) return custom;
  const iv = D.INTERVALS.find(i => i.id === ivId);
  return dir === 'down' ? iv.down : iv.up;
}
function setAnchor(ivId, dir, text) { state.anchors[ivId + ':' + dir] = text; scheduleSave(); }
function setSetting(k, v) { state.settings[k] = v; scheduleSave(); emit(); }
// save and notify after changing state in place (used by the curriculum)
function touch() { scheduleSave(); emit(); }
function resetAll() { state = freshState(); scheduleSave(100); emit(); }

function init() {
  loadLocal();
  applyNames(state.settings.noteNames); applyTuning(guitar().tuning, guitar().capo);
  loadIdb().then(connectCloud);
  // Ask the browser not to evict saved progress when space runs low.
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* ignore */ }
}

/* ---------- Transcription song setups ---------- */
function songsObj() { if (!state.songs) state.songs = {}; return state.songs; }
function listSongs() { return Object.values(songsObj()).sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0)); }
function getSong(id) { return songsObj()[id] || null; }
function saveSong(setup) {
  if (!setup || !setup.id) return;
  songsObj()[setup.id] = JSON.parse(JSON.stringify(setup));
  const ids = listSongs().map(x => x.id);
  while (ids.length > 150) delete state.songs[ids.pop()];
  scheduleSave();
}
function deleteSong(id) { delete songsObj()[id]; tombstone('song:' + id); scheduleSave(); emit(); }

/* ---------- Your own tunes (Repertoire gym): checked by src/mytunes.js, played like D.TUNES ---------- */
function tunesObj() { if (!state.tunes) state.tunes = {}; return state.tunes; }
function listTunes() { return Object.values(tunesObj()).filter(t => t && Array.isArray(t.bars)).sort((a, b) => String(a.name).localeCompare(String(b.name))); }
function getTune(id) { return tunesObj()[id] || null; }
function saveTune(tune) {
  if (!tune) return null;
  const t = JSON.parse(JSON.stringify(tune));
  if (!t.id) { t.id = 'my-' + DEV.slice(-4) + Date.now().toString(36); t.created = Date.now(); }
  t.updatedAt = Date.now();
  tunesObj()[t.id] = t;
  scheduleSave(); emit();
  return t;
}
function deleteTune(id) { delete tunesObj()[id]; tombstone('tune:' + id); scheduleSave(); emit(); }

/* ---------- Custom routines ---------- */
function routines() { if (!Array.isArray(state.routines)) state.routines = []; return state.routines; }
function getRoutine(id) { return routines().find(r => r.id === id) || null; }
function saveRoutine(r) {
  r.updatedAt = Date.now();
  const list = routines(), i = list.findIndex(x => x.id === r.id);
  const copy = JSON.parse(JSON.stringify(r));
  if (i >= 0) list[i] = copy; else list.push(copy);
  scheduleSave(); emit();
  return copy;
}
function deleteRoutine(id) {
  state.routines = routines().filter(r => r.id !== id);
  tombstone('routine:' + id);
  if (state.settings.activeRoutine === id) state.settings.activeRoutine = state.routines.length ? state.routines[0].id : 'smart';
  scheduleSave(); emit();
}
function activeRoutineId() {
  const id = state.settings.activeRoutine;
  if (id === 'smart' || getRoutine(id)) return id;
  return 'smart';
}
function setActiveRoutine(id) { state.settings.activeRoutine = id; scheduleSave(); emit(); }
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/* ---------- Practice session (a routine being played through) ----------
   Elapsed time is wall-clock while not paused, so it keeps counting while you play with the screen off. */
function session() {
  const s = state.session;
  if (!s) return null;
  if (Date.now() - (s.lastTick || s.started) > 12 * 3600 * 1000) { state.session = null; return null; }
  return s;
}
function startSession(src) {
  state.session = {
    id: uid('s'), routineId: src.id || null, name: src.name, started: Date.now(), lastTick: Date.now(),
    paused: false, idx: 0, autoAdvance: src.autoAdvance !== false,
    blocks: src.blocks.map(b => Object.assign(JSON.parse(JSON.stringify(b)), { elapsed: 0, done: false, skipped: false }))
  };
  scheduleSave(); emit();
  return state.session;
}
// Called often by the session ticker; saves without re-rendering pages.
function touchSession() { if (state.session) { state.session.lastTick = Date.now(); scheduleSave(4000); } }
function sessionChanged() { if (state.session) state.session.lastTick = Date.now(); scheduleSave(); emit(); }
function endSession(note) {
  const s = state.session; if (!s) return null;
  const sec = Math.round(s.blocks.reduce((a, b) => a + (b.elapsed || 0), 0) / 1000);
  const entry = { ts: Date.now(), date: dayKey(), name: s.name, sec, done: s.blocks.filter(b => b.done).length, total: s.blocks.length, note: (note || '').trim() };
  if (!Array.isArray(state.journal)) state.journal = [];
  if (sec >= 30 || entry.note) state.journal.unshift(entry);
  if (state.journal.length > 300) state.journal.length = 300;
  state.session = null;
  scheduleSave(); emit();
  return entry;
}
function journal() { return Array.isArray(state.journal) ? state.journal : []; }

/* ---------- Lessons read and recordings heard ---------- */
function lessonDone(id) { return !!(state.lessons && state.lessons[id]); }
function setLessonDone(id, done) {
  if (!state.lessons) state.lessons = {};
  if (done) state.lessons[id] = Date.now(); else delete state.lessons[id];
  scheduleSave(); emit();
}
function heard(key) { return !!(state.heard && state.heard[key]); }
function setHeard(key, on) {
  if (!state.heard) state.heard = {};
  if (on) state.heard[key] = Date.now(); else delete state.heard[key];
  scheduleSave(); emit();
}

export default {
  routines, getRoutine, saveRoutine, deleteRoutine, activeRoutineId, setActiveRoutine, uid,
  session, startSession, touchSession, sessionChanged, endSession, journal,
  lessonDone, setLessonDone, heard, setHeard, techPick,
  listSongs, getSong, saveSong, deleteSong, listTunes, getTune, saveTune, deleteTune,
  SKILLS, CAT_NAMES, STRINGS, TUNINGS, guitar, setGuitar, FOCUS, init, get state() { return state; }, onChange, emit,
  universe, unlocked, unlockedTier, levelProgress, pick, record, mastery, dueCount, daysSince, itemLabel,
  weakItems, confusions, lastNDays, streak, trend, regionOfWeek, setRegionWeek, regionScore,
  makeRoutine, routineToday, blockProgress, placementPlan, finishPlacement,
  techState, techResult, techCount, setTechBpm, anchor, setAnchor, setSetting, touch, addTime, addScaleTime, resetAll, exportBackup, importBackup,
  storageNote: () => (saveHealth().level === 'failing' ? 'Not saving on this device' : storageNote), saveHealth, onSaveHealth, skillState, dayKey, tombstone, adopt, device: () => DEV, cloudOn: () => !!docRef
};
