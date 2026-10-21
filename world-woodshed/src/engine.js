/* World Woodshed — adaptive engine: tracking, spaced repetition, mastery, routines */
import D from './data.js';

const LS_KEY = 'world-woodshed-v1';
const DAY = 86400000;
const BOX_MS = [0, 10 * 60 * 1000, DAY, 3 * DAY, 7 * DAY, 21 * DAY, 45 * DAY];

/* ---------- Skill definitions ---------- */
const SKILLS = {
  intervals: { name: 'Intervals', cat: 'ear', tool: 'intervals', qpm: 6 },
  chords: { name: 'Chord qualities', cat: 'ear', tool: 'chords', qpm: 6 },
  degrees: { name: 'Scale degrees', cat: 'ear', tool: 'degrees', qpm: 5 },
  progressions: { name: 'Progressions', cat: 'ear', tool: 'progressions', qpm: 3 },
  scales: { name: 'World scales by ear', cat: 'ear', tool: 'scales', qpm: 3 },
  rhythmTap: { name: 'Rhythm feel', cat: 'rhythm', tool: 'rhythms', qpm: 2 },
  rhythmId: { name: 'Rhythm ID', cat: 'rhythm', tool: 'rhythmid', qpm: 4 },
  clock: { name: 'Internal clock', cat: 'rhythm', tool: 'clock', qpm: 2 },
  fretboard: { name: 'Fretboard notes', cat: 'play', tool: 'fretboard', qpm: 10 },
  callresp: { name: 'Call & response', cat: 'play', tool: 'callresp', qpm: 4 },
  repertoire: { name: 'Repertoire', cat: 'play', tool: 'repertoire', qpm: 6 },
  technique: { name: 'Technique', cat: 'tech', tool: 'technique', qpm: 1 },
  atlas: { name: 'World knowledge', cat: 'know', tool: 'atlasquiz', qpm: 6 }
};
const CAT_NAMES = { ear: 'Ear', rhythm: 'Rhythm', play: 'Fretboard & repertoire', tech: 'Technique', know: 'Knowledge' };

const STRINGS = [
  { id: 'E', name: 'low E', midi: 40 }, { id: 'A', name: 'A', midi: 45 }, { id: 'D', name: 'D', midi: 50 },
  { id: 'G', name: 'G', midi: 55 }, { id: 'B', name: 'B', midi: 59 }, { id: 'e', name: 'high e', midi: 64 }
];
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
    case 'atlas':
      D.REGIONS.forEach(r => r.facts.forEach((f, i) => list.push({ id: r.id + ':' + i, label: r.name + ': ' + f.q, tier: 1, region: r.id })));
      break;
  }
  universeCache[skill] = list;
  return list;
}
function scaleName(id) { const s = D.SCALES.find(x => x.id === id); return s ? s.name : id; }
function itemLabel(skill, id) { const it = universe(skill).find(x => x.id === id); return it ? it.label : id; }

/* ---------- State ---------- */
function freshState() {
  return {
    v: 1, created: Date.now(), updatedAt: 0,
    skills: {}, history: {}, anchors: {},
    tech: {},
    settings: { latencyMs: 0, minutes: 30, focus: 'balanced', regionWeek: null },
    routine: null, placementDone: false, songs: {},
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
    if (raw) { const s = JSON.parse(raw); if (s && s.v === 1) state = Object.assign(freshState(), s); }
  } catch (e) { /* storage unavailable */ }
}
function saveLocal() {
  const json = JSON.stringify(state);
  try { localStorage.setItem(LS_KEY, json); } catch (e) { /* ignore */ }
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
  idb().then(d => d.transaction('state', 'readwrite').objectStore('state').put(json, LS_KEY)).catch(() => {});
}
async function loadIdb() {
  try {
    const d = await idb();
    const json = await new Promise((res, rej) => {
      const r = d.transaction('state', 'readonly').objectStore('state').get(LS_KEY);
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    const s = json ? JSON.parse(json) : null;
    if (s && s.v === 1 && (s.updatedAt || 0) > (state.updatedAt || 0)) {
      state = Object.assign(freshState(), s);
      try { localStorage.setItem(LS_KEY, json); } catch (e) { /* ignore */ }
      emit();
    }
  } catch (e) { /* IndexedDB unavailable */ }
}

/* ---------- Backup file: export and import ---------- */
function exportBackup() {
  return { app: 'world-woodshed', exportedAt: new Date().toISOString(), state };
}
function importBackup(obj) {
  const s = obj && obj.app === 'world-woodshed' ? obj.state : obj;
  if (!s || s.v !== 1 || typeof s.skills !== 'object') throw new Error('This file is not a World Woodshed backup');
  state = Object.assign(freshState(), s);
  scheduleSave(100);
  emit();
}
async function connectCloud() {
  try {
    if (!window.claude || !window.claude.use) return;
    const [dbNs, userNs] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (!dbNs || !userNs) return;
    const uid = await userNs.id();
    if (!uid) return;
    db = dbNs;
    docRef = db.doc('data/users/' + uid + '/progress');
    const snap = await docRef.get();
    if (snap.exists) {
      const body = snap.data();
      let remote = null;
      try { remote = JSON.parse(body.json); } catch (e) { remote = null; }
      if (remote && remote.v === 1 && (remote.updatedAt || 0) > (state.updatedAt || 0)) {
        state = Object.assign(freshState(), remote);
        saveLocal();
        emit();
      } else if ((state.updatedAt || 0) > ((remote && remote.updatedAt) || 0)) {
        scheduleSave(200);
      }
    } else if (state.updatedAt) {
      scheduleSave(200);
    }
    storageNote = 'Synced to your account';
    emit();
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
    await docRef.set({ json: JSON.stringify(state), updatedAt: state.updatedAt });
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
function addTime(sec, skill) {
  if (!(sec > 0)) return;
  const h = today();
  h.sec += Math.min(sec, 600);
  if (skill) { h.by[skill] = h.by[skill] || [0, 0, 0]; h.by[skill][2] = (h.by[skill][2] || 0) + Math.min(sec, 600); }
  scheduleSave();
}
function pruneHistory() {
  const keys = Object.keys(state.history).sort();
  while (keys.length > 180) delete state.history[keys.shift()];
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
  h.q++; if (correct) h.c++;
  h.by[skill] = h.by[skill] || [0, 0, 0];
  h.by[skill][0]++; if (correct) h.by[skill][1]++;
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
  const candidates = pri.length ? pri.map(id => D.REGIONS.find(r => r.id === id)).filter(Boolean) : D.REGIONS.filter(r => r.rhythms.length || r.scales.length);
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
function deleteSong(id) { delete songsObj()[id]; scheduleSave(); emit(); }

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
  listSongs, getSong, saveSong, deleteSong,
  SKILLS, CAT_NAMES, STRINGS, FOCUS, init, get state() { return state; }, onChange, emit,
  universe, unlocked, unlockedTier, pick, record, mastery, dueCount, daysSince, itemLabel,
  weakItems, confusions, lastNDays, streak, trend, regionOfWeek, setRegionWeek, regionScore,
  makeRoutine, routineToday, blockProgress, placementPlan, finishPlacement,
  techState, techResult, techCount, setTechBpm, anchor, setAnchor, setSetting, touch, addTime, resetAll, exportBackup, importBackup,
  storageNote: () => storageNote, skillState, dayKey
};
