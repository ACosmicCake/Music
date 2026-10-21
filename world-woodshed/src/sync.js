/* World Woodshed — keeping progress in step across devices.
   Pure functions (no DOM), so they can be tested in Node.
   - migrate(state): bring saved state from any older format up to SCHEMA. Never throws away data.
   - merge(a, b): combine two copies of the state (this device and the phone, the cloud copy, a sync file)
     without losing practice done on either. Items keep the newer record; lists are joined; practice time is
     kept per device so the same day practised on two devices adds up instead of being counted twice. */

export const SCHEMA = 2;
// Settings that belong to one device (audio and mic latency, screen layout and text size differ per phone and laptop) never sync.
// So does the session length last chosen here: the phone's ride and the desk's evening session are different times.
export const DEVICE_SETTINGS = ['latencyMs', 'micLatencyMs', 'micSensitivity', 'micOn', 'display', 'textSize', 'lastMinutes', 'lastRide'];

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
  }
};
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
function mergeCur(a = {}, b = {}, newerSide) {
  const out = Object.assign({}, newerSide === 'b' ? b : a);
  out.items = byKey(a.items, b.items);
  out.prefs = clone((newerSide === 'b' ? b.prefs : a.prefs) || a.prefs || b.prefs || {});
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
  const a = local, b = remote;
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
    songs: dropDeleted(byKey(a.songs, b.songs), tomb, 'song:'),
    routines: mergeList(a.routines, b.routines, r => r.id).filter(r => !tomb['routine:' + r.id] || stamp(r) > tomb['routine:' + r.id]),
    journal: mergeList(a.journal, b.journal, j => String(j.ts), 300).sort((x, y) => y.ts - x.ts),
    lessons: byKey(a.lessons, b.lessons, maxNum),
    heard: byKey(a.heard, b.heard, maxNum),
    placementDone: !!(a.placementDone || b.placementDone),
    session: newer(a.session || undefined, b.session || undefined) || null,
    cur: mergeCur(a.cur || {}, b.cur || {}, bNewer ? 'b' : 'a')
  });
  if (a.readLib || b.readLib) {
    const la = a.readLib || {}, lb = b.readLib || {};
    out.readLib = { n: maxNum(la.n, lb.n), pieces: dropDeleted(byKey(la.pieces, lb.pieces), tomb, 'piece:') };
  }
  out.history = rebuildHistory(out, Object.assign({}, b.history, a.history));
  // settings: the newer copy's choices, but this device keeps its own latency and mic settings
  out.settings = Object.assign({}, clone(bNewer ? b.settings || {} : a.settings || {}));
  DEVICE_SETTINGS.forEach(k => { if (a.settings && k in a.settings) out.settings[k] = a.settings[k]; else delete out.settings[k]; });
  return out;
}

/* A short fingerprint of the content that matters, to tell whether a merge changed anything */
export function digest(s) {
  const pick = { skills: s.skills, hdev: s.hdev, tech: s.tech, cur: s.cur && s.cur.items, readLib: s.readLib, journal: (s.journal || []).length, routines: s.routines, settings: s.settings };
  const str = JSON.stringify(pick);
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36) + ':' + str.length;
}
