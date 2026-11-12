/* World Woodshed — keeping progress in step across devices.
   Pure functions (no DOM), so they can be tested in Node.
   - migrate(state): bring saved state from any older format up to SCHEMA. Never throws away data.
   - merge(a, b): combine two copies of the state (this device and the phone, the cloud copy, a sync file)
     without losing practice done on either. Items keep the newer record; lists are joined; practice time is
     kept per device so the same day practised on two devices adds up instead of being counted twice. */

export const SCHEMA = 13;
// Settings that belong to one device (audio and mic latency, screen layout and text size differ per phone and laptop) never sync.
// So does the session length last chosen here: the phone's ride and the desk's evening session are different times.
export const DEVICE_SETTINGS = ['latencyMs', 'micLatencyMs', 'micSensitivity', 'micOn', 'display', 'textSize', 'audioOutput', 'lastMinutes', 'lastRide', 'reminder', 'readingClickVol', 'readingZoom'];

import { mergeGames } from './games.js';
import { mergeClub } from './club.js';

const isObj = x => x && typeof x === 'object' && !Array.isArray(x);
const clone = x => JSON.parse(JSON.stringify(x));
const stamp = x => (isObj(x) ? Math.max(x.last || 0, x.updatedAt || 0, x.lastOpened || 0, x.t || 0, x.ts || 0, x.lastTick || 0) : 0);
/* the newer of two records by their timestamps; ties go to the one with more work in it */
function newer(a, b) {
  if (a === undefined) return b; if (b === undefined) return a;
  const sa = stamp(a), sb = stamp(b);
  if (sa !== sb) return sa > sb ? a : b;
  const na = isObj(a) ? (a.n || 0) + ((a.reads && a.reads.length) || 0) : 0, nb = isObj(b) ? (b.n || 0) + ((b.reads && b.reads.length) || 0) : 0;
  return nb > na ? b : a;
}
function byKey(a = {}, b = {}, pickFn = newer) {
  const out = {};
  new Set([...Object.keys(a || {}), ...Object.keys(b || {})]).forEach(k => { out[k] = pickFn(a ? a[k] : undefined, b ? b[k] : undefined, k); });
  return out;
}
const maxNum = (a, b) => Math.max(a || 0, b || 0);

/* ---------- migrations ---------- */
const MIGRATIONS = {
  // 1 → 2: practice time per device; reading-library ids unique across devices
  2(s, dev) {
    if (!s.hdev) s.hdev = {};
    // history from before per-device tracking goes under 'legacy': two devices migrating the same old history
    // produce identical legacy copies, which merge to one instead of doubling
    if (s.history && Object.keys(s.history).length && !s.hdev.legacy) {
      s.hdev.legacy = {};
      Object.entries(s.history).forEach(([day, h]) => { s.hdev.legacy[day] = { sec: h.sec || 0, q: h.q || 0, c: h.c || 0, by: clone(h.by || {}) }; });
    }
    const lib = s.readLib;
    if (lib && lib.pieces) {
      const tag = (dev || 'x').slice(-6), next = {}; // the random end of the device id
      Object.values(lib.pieces).forEach(p => { if (/^p\d+$/.test(p.id)) p.id = 'p' + tag + p.no; next[p.id] = p; });
      lib.pieces = next;
    }
    return s;
  },
  // 2 → 3: the player's own tunes for the Repertoire gym
  3(s) {
    if (!isObj(s.tunes)) s.tunes = {};
    return s;
  },
  // 3 → 4: time on each scale and key, per device
  4(s) {
    if (!isObj(s.scaleTime)) s.scaleTime = {};
    return s;
  },
  // 4 → 5: personal bests kept for good (the longest streaks), past the six months of history
  5(s) {
    if (!isObj(s.records)) s.records = {};
    return s;
  },
  // 5 → 6: the Library (scores, photos of scores, songs learned); only the details sync, the files stay on each device
  6(s) {
    if (!isObj(s.library)) s.library = {};
    return s;
  },
  // 6 → 7: melodies added to Repertoire tunes (by tune id), for the standards the app can't include and your own tunes
  7(s) {
    if (!isObj(s.melodies)) s.melodies = {};
    return s;
  },
  // 7 → 8: sight-reading went from 16 levels to a path of 36 small steps. Each old level's progress, tempos and
  // kept pieces move to the level that now teaches the same thing, and the new steps below the highest level
  // you had read (up to the end of the sixteenths, which the old levels covered) take a copy of the next level
  // up, so nothing you had unlocked closes again. Triplets, chords, 5/4 and 12/8 are new and start fresh.
  8(s) {
    return moveLevels(s, { 1: 2, 2: 3, 3: 7, 4: 10, 5: 11, 6: 9, 7: 13, 8: 16, 9: 18, 10: 19, 11: 23, 12: 20, 13: 24, 14: 31, 15: 32, 16: 36 }, 36, n => n <= 24);
  },
  // 8 → 9: four steps up the neck joined the reading path (second, seventh and ninth position, and shifting
  // between positions), around fifth position (31 → 32); the levels after it moved up four (32–36 → 36–40).
  // The new steps below the highest level you had read take a copy of the next level up, as in 8.
  9(s) {
    const map = { 31: 32, 32: 36, 33: 37, 34: 38, 35: 39, 36: 40 };
    return moveLevels(s, map, 40, n => [31, 33, 34, 35].includes(n));
  },
  // 9 → 10: four band-chart steps (accents and staccato, repeat signs, tab, rhythm slashes) went in before the
  // last level, Everything (40 → 44), and take its record when you had read it.
  10(s) {
    return moveLevels(s, { 40: 44 }, 44, n => n >= 40 && n <= 43);
  },
  // 10 → 11: game mode's high-score tables (src/games.js), by game
  11(s) {
    if (!isObj(s.games)) s.games = {};
    return s;
  },
  // 11 → 12: when each setting and learning preference last changed (keyT), so they merge one by one, and
  // the time of the last "erase every device" (resetAt, none yet). Settings saved before have no time and
  // merge as before, by the newer copy.
  12(s) {
    if (!isObj(s.keyT)) s.keyT = { settings: {}, prefs: {} };
    return s;
  },
  // 12 → 13: the Club (src/club.js), opened by the app when it starts (initClub), so nothing to add here:
  // practice from before it opens never counts
  13(s) { return s; }
};
/* Sight-reading levels renumbered: each level's progress (skill items L<n>:rhythm|melody), tempos
   (settings.readingBpm r<n>/m<n>) and kept pieces (readLib) move by map (old → new; levels not in it keep
   their number). Then a new level (fill(n)) with no progress below one with some takes a copy of it. */
function moveLevels(s, map, top, fill) {
  const rd = s.skills && s.skills.reading;
  if (rd && isObj(rd.items)) {
    const items = {};
    Object.entries(rd.items).forEach(([id, it]) => {
      const m = /^L(\d+):(rhythm|melody)$/.exec(id);
      items[m && map[m[1]] ? 'L' + map[m[1]] + ':' + m[2] : id] = it;
    });
    ['rhythm', 'melody'].forEach(kind => {
      let above = null;
      for (let n = top; n >= 1; n--) {
        const id = 'L' + n + ':' + kind;
        if (items[id]) above = items[id];
        else if (above && fill(n)) items[id] = clone(above);
      }
    });
    rd.items = items;
  }
  const bpm = s.settings && s.settings.readingBpm;
  if (isObj(bpm)) {
    const out = {};
    Object.entries(bpm).forEach(([k, v]) => { const m = /^([rm])(\d+)$/.exec(k); out[m && map[m[2]] ? m[1] + map[m[2]] : k] = v; });
    s.settings.readingBpm = out;
  }
  if (s.readLib && isObj(s.readLib.pieces)) Object.values(s.readLib.pieces).forEach(p => { if (p && map[p.lv]) p.lv = map[p.lv]; });
  return s;
}
export function migrate(s, dev) {
  if (!isObj(s)) return s;
  let v = s.schema || 1;
  while (v < SCHEMA) { v++; if (MIGRATIONS[v]) s = MIGRATIONS[v](s, dev) || s; s.schema = v; }
  return s; // a newer schema (written by a newer app on another device) is kept as it is
}

/* ---------- per-device practice history ---------- */
const HFIELDS = ['sec', 'q', 'c'];
function sumDays(recs) {
  const out = { sec: 0, q: 0, c: 0, by: {} };
  recs.forEach(r => {
    if (!r) return;
    HFIELDS.forEach(f => { out[f] += r[f] || 0; });
    Object.entries(r.by || {}).forEach(([k, arr]) => { const o = out.by[k] || (out.by[k] = [0, 0, 0]); (arr || []).forEach((v, i) => { o[i] = (o[i] || 0) + (v || 0); }); });
  });
  return out;
}
/* rebuild the per-day totals from every device's record (mastery snapshots are kept from either copy) */
export function rebuildHistory(s, prev = {}) {
  const days = new Set();
  Object.values(s.hdev || {}).forEach(d => Object.keys(d).forEach(k => days.add(k)));
  const out = {};
  days.forEach(day => {
    const tot = sumDays(Object.values(s.hdev).map(d => d[day]));
    const old = prev[day] || (s.history || {})[day];
    if (old && old.mastery) tot.mastery = old.mastery;
    out[day] = tot;
  });
  // days that only ever lived in the old history (no device record) are kept as they are
  Object.entries(s.history || {}).forEach(([day, h]) => { if (!out[day]) out[day] = h; });
  return out;
}

/* ---------- the merge ---------- */
function mergeSkills(a = {}, b = {}) {
  return byKey(a, b, (x, y) => {
    if (!x) return y; if (!y) return x;
    return { items: byKey(x.items, y.items), conf: byKey(x.conf, y.conf, maxNum), last: maxNum(x.last, y.last) };
  });
}
function mergeHdev(a = {}, b = {}) {
  // a device's own record only grows, so the bigger copy of each day is the newer one
  return byKey(a, b, (x, y) => byKey(x, y, (p, q) => {
    if (!p) return q; if (!q) return p;
    const w = r => (r.sec || 0) + (r.q || 0) * 5;
    return w(q) > w(p) ? q : p;
  }));
}
/* Time on each scale: { device: { 'scale:tonic': { v: seconds seen in your head, p: seconds played, last } } }.
   A device's own totals only grow, so the bigger number of each is the newer one. */
function mergeScaleTime(a = {}, b = {}) {
  return byKey(a, b, (x, y) => byKey(x, y, (p, q) => {
    if (!isObj(p) || !isObj(q)) return isObj(p) ? p : q;
    return { v: maxNum(p.v, q.v), p: maxNum(p.p, q.p), last: maxNum(p.last, q.last) };
  }));
}
function mergeTech(a = {}, b = {}) {
  return byKey(a, b, (x, y) => {
    if (!x || !y) return x || y;
    const n = clone(newer(x, y)); n.best = Math.max(x.best || 0, y.best || 0); return n;
  });
}
function mergeList(a = [], b = [], key, cap) {
  const m = new Map();
  [...(a || []), ...(b || [])].forEach(x => { const k = key(x); m.set(k, m.has(k) ? newer(m.get(k), x) : x); });
  let out = [...m.values()];
  if (cap) out = out.sort((x, y) => stamp(y) - stamp(x)).slice(0, cap);
  return out;
}
/* Settings and learning preferences merge one by one: each key comes from the copy that changed it last
   (keyT, stamped by stampKeys when it is saved). A key with no time on either copy (saved before schema 12,
   or never changed) comes from the newer copy, or from the other when the newer one doesn't have it. */
function mergeKeyed(x, y, tx, ty, yNewer) {
  x = isObj(x) ? x : {}; y = isObj(y) ? y : {}; tx = isObj(tx) ? tx : {}; ty = isObj(ty) ? ty : {};
  const out = {}, t = {};
  new Set([...Object.keys(x), ...Object.keys(y), ...Object.keys(tx), ...Object.keys(ty)]).forEach(k => {
    const sa = tx[k] || 0, sb = ty[k] || 0;
    let useY = sa !== sb ? sb > sa : yNewer;
    if (!(useY ? sb : sa) && !(k in (useY ? y : x))) useY = !useY; // no time and not on the newer copy
    const src = useY ? y : x, st = useY ? sb : sa;
    if (k in src && src[k] !== undefined) out[k] = clone(src[k]);
    if (st) t[k] = st;
  });
  return { out, t };
}
/* Note which settings and preferences changed since the last save: cache holds each key's JSON as last seen. */
export function stampKeys(s, cache, now = Date.now()) {
  if (!isObj(s.keyT)) s.keyT = { settings: {}, prefs: {} };
  [['settings', s.settings], ['prefs', s.cur && s.cur.prefs]].forEach(([part, obj]) => {
    const t = isObj(s.keyT[part]) ? s.keyT[part] : (s.keyT[part] = {}), seen = cache[part] || (cache[part] = {});
    const o = isObj(obj) ? obj : {};
    new Set([...Object.keys(o), ...Object.keys(seen)]).forEach(k => {
      const j = o[k] === undefined ? undefined : JSON.stringify(o[k]);
      // a key appearing for the first time is not dated: the app fills in defaults as it starts, and a default
      // must never beat a choice made on another device (a key only one copy has is kept by the merge anyway)
      if (j !== seen[k]) { if (k in seen) t[k] = now; if (j === undefined) delete seen[k]; else seen[k] = j; }
    });
  });
  return cache;
}
/* The cache stampKeys compares against, set from a state just loaded or merged (nothing stamped). */
export function keyCache(s) {
  const c = { settings: {}, prefs: {} };
  [['settings', s.settings], ['prefs', s.cur && s.cur.prefs]].forEach(([part, obj]) => {
    Object.entries(isObj(obj) ? obj : {}).forEach(([k, v]) => { if (v !== undefined) c[part][k] = JSON.stringify(v); });
  });
  return c;
}
/* After "erase every device" (resetAt), a copy from before it keeps only this device's own settings. */
function wiped(s, at) {
  const settings = {};
  DEVICE_SETTINGS.forEach(k => { if (s.settings && k in s.settings) settings[k] = s.settings[k]; });
  return { v: 1, schema: s.schema, created: at, updatedAt: 0, resetAt: at, settings, session: null };
}
function mergeCur(a = {}, b = {}, newerSide, ta = {}, tb = {}) {
  const out = Object.assign({}, newerSide === 'b' ? b : a);
  out.items = byKey(a.items, b.items);
  out.prefs = mergeKeyed(a.prefs, b.prefs, ta, tb, newerSide === 'b').out;
  out.days = byKey(a.days, b.days, (x, y) => {
    if (!x || !y) return x || y;
    return {
      sessions: mergeList(x.sessions, y.sessions, s => String(s.start)),
      items: byKey(x.items, y.items),
      fresh: mergeList(x.fresh, y.fresh, f => f.id + '@' + f.t)
    };
  });
  return out;
}
/* Library entries: the newer copy's details, and the files listed on either copy (a photo added on the phone
   and a note edited on the laptop both survive), less any file removed on either (a 'libfile:' tombstone). */
function mergeLibrary(a = {}, b = {}, tomb = {}) {
  return byKey(a, b, (x, y) => {
    if (!isObj(x) || !isObj(y)) return isObj(x) ? x : y;
    const w = newer(x, y), n = clone(w), seen = new Set(), files = [];
    [w.files, w === x ? y.files : x.files].forEach(list => (Array.isArray(list) ? list : []).forEach(f => {
      if (isObj(f) && f.id && !seen.has(f.id)) { seen.add(f.id); files.push(clone(f)); }
    }));
    n.files = files.filter(f => !tomb['libfile:' + f.id]);
    // the fastest clean tempo for each section, from either copy
    if (isObj(x.tempos) || isObj(y.tempos)) {
      const t = {};
      [x.tempos, y.tempos].forEach(src => Object.entries(isObj(src) ? src : {}).forEach(([k, v]) => {
        if (isObj(v) && (!t[k] || (v.best || 0) > (t[k].best || 0))) t[k] = clone(v);
      }));
      n.tempos = t;
    }
    return n;
  });
}
function dropDeleted(obj, tomb, prefix) {
  if (!tomb) return obj;
  const out = {};
  Object.entries(obj || {}).forEach(([k, v]) => { const t = tomb[prefix + k]; if (!t || stamp(v) > t) out[k] = v; });
  return out;
}

/* Combine two copies of the state. `local` is this device's copy: its device-only settings are kept. */
export function merge(local, remote) {
  if (!isObj(remote)) return local;
  if (!isObj(local)) return remote;
  let a = local, b = remote;
  // "erase every device": the copy from before the latest erase is dropped
  const ra = a.resetAt || 0, rb = b.resetAt || 0;
  if (rb > ra) a = wiped(a, rb); else if (ra > rb) b = wiped(b, ra);
  const bNewer = (b.updatedAt || 0) > (a.updatedAt || 0);
  const base = clone(bNewer ? b : a);
  const tomb = byKey(a.tomb, b.tomb, maxNum);
  const out = Object.assign(base, {
    schema: Math.max(a.schema || 1, b.schema || 1),
    created: Math.min(a.created || Date.now(), b.created || Date.now()),
    updatedAt: Math.max(a.updatedAt || 0, b.updatedAt || 0),
    tomb,
    skills: mergeSkills(a.skills, b.skills),
    hdev: mergeHdev(a.hdev, b.hdev),
    anchors: Object.assign({}, a.anchors, b.anchors, bNewer ? b.anchors : a.anchors),
    tech: mergeTech(a.tech, b.tech),
    scaleTime: mergeScaleTime(a.scaleTime, b.scaleTime),
    songs: dropDeleted(byKey(a.songs, b.songs), tomb, 'song:'),
    tunes: dropDeleted(byKey(a.tunes, b.tunes), tomb, 'tune:'),
    melodies: dropDeleted(byKey(a.melodies, b.melodies), tomb, 'mel:'),
    library: dropDeleted(mergeLibrary(a.library, b.library, tomb), tomb, 'lib:'),
    routines: mergeList(a.routines, b.routines, r => r.id).filter(r => !tomb['routine:' + r.id] || stamp(r) > tomb['routine:' + r.id]),
    journal: mergeList(a.journal, b.journal, j => String(j.ts), 300).sort((x, y) => y.ts - x.ts),
    lessons: byKey(a.lessons, b.lessons, maxNum),
    heard: byKey(a.heard, b.heard, maxNum),
    records: byKey(a.records, b.records, maxNum),
    games: mergeGames(a.games, b.games),
    placementDone: !!(a.placementDone || b.placementDone),
    // a running session belongs to the device it runs on: another copy (the phone's sync file, the cloud, an
    // older save) must never start it here, or bring back one that was finished or discarded on this device
    session: a.session || null,
    cur: mergeCur(a.cur || {}, b.cur || {}, bNewer ? 'b' : 'a', (a.keyT || {}).prefs, (b.keyT || {}).prefs)
  });
  const club = mergeClub(a.club, b.club);
  if (club) out.club = club; else delete out.club;
  if (ra || rb) out.resetAt = Math.max(ra, rb); else delete out.resetAt;
  if (a.readLib || b.readLib) {
    const la = a.readLib || {}, lb = b.readLib || {};
    out.readLib = { n: maxNum(la.n, lb.n), pieces: dropDeleted(byKey(la.pieces, lb.pieces), tomb, 'piece:') };
  }
  out.history = rebuildHistory(out, Object.assign({}, b.history, a.history));
  // settings: each from the copy that changed it last, but this device keeps its own latency and mic settings
  const st = mergeKeyed(a.settings, b.settings, (a.keyT || {}).settings, (b.keyT || {}).settings, bNewer);
  out.settings = st.out;
  out.keyT = { settings: st.t, prefs: mergeKeyed(a.cur && a.cur.prefs, b.cur && b.cur.prefs, (a.keyT || {}).prefs, (b.keyT || {}).prefs, bNewer).t };
  DEVICE_SETTINGS.forEach(k => { if (a.settings && k in a.settings) out.settings[k] = a.settings[k]; else delete out.settings[k]; });
  return out;
}

/* A short fingerprint of the content that matters, to tell whether a merge changed anything */
/* A fingerprint of everything that syncs (not this device's session, nor history, which is rebuilt from hdev).
   Keys are sorted, so two copies with the same content match even when their keys were added in a different
   order on each device; otherwise the GitHub sync would push the same progress back and forth forever. */
const stable = x => {
  if (Array.isArray(x)) return '[' + x.map(stable).join(',') + ']';
  if (x && typeof x === 'object') return '{' + Object.keys(x).sort().filter(k => x[k] !== undefined).map(k => JSON.stringify(k) + ':' + stable(x[k])).join(',') + '}';
  return x === undefined ? 'null' : JSON.stringify(x);
};
export function digest(s) {
  const pick = { skills: s.skills, hdev: s.hdev, tech: s.tech, scaleTime: s.scaleTime, cur: s.cur, readLib: s.readLib, tunes: s.tunes, melodies: s.melodies, songs: s.songs, library: s.library, journal: (s.journal || []).length,
    routines: s.routines, settings: s.settings, lessons: s.lessons, heard: s.heard, records: s.records, games: s.games, club: s.club, anchors: s.anchors, tomb: s.tomb, placementDone: !!s.placementDone, resetAt: s.resetAt || 0 };
  const str = stable(pick);
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36) + ':' + str.length;
}
