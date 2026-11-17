/* World Woodshed — the reading library.
   The generators never run out: every "New" is a fresh, unseen piece. Each piece you read is kept here
   (stored compactly with the rest of your progress), so you can play it again, star it, and get the ones
   you missed back for a re-read after a gap: long enough that you are reading it again, not remembering it.
   Melodies never come back by themselves (Pan wants a new one every time, never one to learn): no re-reads
   are scheduled for them, and every melody shown is remembered as a short hash (`seen`) so a new one is
   never one already seen, on any device. Opening one from the library by hand still works. */
import E from './engine.js';

const DAY = 864e5;
const CAP = 40; // kept per level and kind, not counting starred pieces
const lib = () => {
  const s = E.state;
  if (!s.readLib || !s.readLib.pieces) s.readLib = { pieces: {}, n: 0 };
  return s.readLib;
};

/* One event: pitch (r for a rest, s for a slash, or the pitches of a chord joined by +), duration, then . dot,
   ~ tie, # or b spelling, t triplet, > accent, ' staccato. Bars split by |. After the bars, @r<first>-<last> for
   a repeat and @c<chords> for a chart's chord symbols (sym:at, split by , in a bar and | between bars). */
function encode(piece) {
  const pitch = n => (n.midi == null ? 'r' : n.slash ? 's' : n.chord && n.chord.length > 1 ? n.chord.join('+') : n.midi);
  const ev = n => pitch(n) + n.dur + (n.dot ? '.' : '') + (n.tie ? '~' : '') + (n.spell || '') + (n.tup ? 't' : '') + (n.acc ? '>' : '') + (n.stac ? "'" : '');
  let code = piece.key + '/' + piece.time + '/' + piece.bars.map(b => b.map(ev).join(' ')).join('|');
  if (Array.isArray(piece.repeat)) code += '@r' + piece.repeat[0] + '-' + piece.repeat[1];
  if (Array.isArray(piece.chords)) code += '@c' + piece.chords.map(cs => (cs || []).map(c => c.text + ':' + c.at).join(',')).join('|');
  return code;
}
const SLASH = 71;
function decode(code) {
  const [main, ...extra] = code.split('@');
  const parts = main.split('/'), key = parts[0], time = parts[1] + '/' + parts[2], body = parts.slice(3).join('/');
  const bars = body.split('|').map(b => b.split(' ').map(t => {
    const m = /^(r|s|\d+(?:\+\d+)*)(w|h|q|8|16)(\.?)(~?)([#b]?)(t?)(>?)('?)$/.exec(t);
    if (!m) return { midi: null, dur: 'q' }; // written by a newer app: keep the bar's place
    const ps = m[1] === 'r' ? null : m[1] === 's' ? [SLASH] : m[1].split('+').map(Number);
    const n = { midi: ps ? Math.max(...ps) : null, dur: m[2] };
    if (ps && ps.length > 1) n.chord = ps.sort((x, y) => x - y);
    if (m[1] === 's') n.slash = true;
    if (m[3]) n.dot = true; if (m[4]) n.tie = true; if (m[5]) n.spell = m[5]; if (m[6]) n.tup = 3;
    if (m[7]) n.acc = true; if (m[8]) n.stac = true;
    return n;
  }));
  const piece = { key, time, bars };
  extra.forEach(x => {
    const r = /^r(\d+)-(\d+)$/.exec(x);
    if (r) piece.repeat = [+r[1], +r[2]];
    else if (x[0] === 'c') piece.chords = x.slice(1).split('|').map(b => (b ? b.split(',').map(c => { const k = c.lastIndexOf(':'); return { text: c.slice(0, k), at: +c.slice(k + 1) || 0 }; }) : []));
  });
  return piece;
}

/* kinds that never come back for a re-read, and are never shown twice when new */
const NO_REPEAT = { m: true };
const SEEN_CAP = 5000; // hashes kept per kind, newest last (about 8 bytes each)
const TRIES = 40;
/* FNV-1a over the piece's code, in base 36 */
export function hashCode(code) {
  let x = 0x811c9dc5;
  for (let i = 0; i < code.length; i++) { x ^= code.charCodeAt(i); x = Math.imul(x, 0x01000193) >>> 0; }
  return x.toString(36);
}
function seenOf(kind) {
  const L = lib();
  if (!L.seen || typeof L.seen !== 'object') L.seen = {};
  if (!Array.isArray(L.seen[kind])) L.seen[kind] = Object.values(L.pieces).filter(p => p && p.kind === kind && p.code).map(p => hashCode(p.code));
  return L.seen[kind];
}
const seenSets = {};
function seenSet(kind) {
  const arr = seenOf(kind);
  let c = seenSets[kind];
  if (!c || c.arr !== arr || c.len !== arr.length) c = seenSets[kind] = { arr, len: arr.length, set: new Set(arr) };
  return c.set;
}
function markSeen(kind, hash) {
  const arr = seenOf(kind);
  arr.push(hash);
  if (arr.length > SEEN_CAP) arr.splice(0, arr.length - SEEN_CAP);
  E.touch();
}
/* A piece from gen() that has never been shown before (of this kind), remembered as seen. After TRIES
   pieces that were all seen (a level with very few possible pieces), the last one is shown. */
function fresh(kind, gen) {
  const set = seenSet(kind);
  let piece, h;
  for (let i = 0; i < TRIES; i++) {
    piece = gen(); h = hashCode(encode(piece));
    if (!set.has(h)) break;
  }
  markSeen(kind, h);
  return piece;
}
const seen = (kind, piece) => seenSet(kind).has(hashCode(encode(piece)));

const list = (lv, kind) => Object.values(lib().pieces).filter(p => (lv == null || p.lv === lv) && (!kind || p.kind === kind));
const isDue = (p, now = Date.now()) => !NO_REPEAT[p.kind] && p.due != null && p.due <= now;

function prune(lv, kind) {
  const all = list(lv, kind).filter(p => !p.star);
  if (all.length <= CAP) return;
  // drop finished pieces first (no review pending), oldest first
  all.sort((a, b) => ((a.due == null ? 0 : 1) - (b.due == null ? 0 : 1)) || (a.last - b.last));
  all.slice(0, all.length - CAP).forEach(p => { delete lib().pieces[p.id]; });
}

/* What to read next: mostly new pieces; when re-reads are due, every third piece is one of them.
   Melodies are always new. */
let sinceReview = {};
function next(lv, kind, gen) {
  const k = lv + kind;
  if (NO_REPEAT[kind]) return { entry: null, piece: fresh(kind, gen), review: false };
  const due = list(lv, kind).filter(p => isDue(p)).sort((a, b) => a.due - b.due);
  if (due.length && (sinceReview[k] || 0) >= 2) {
    sinceReview[k] = 0;
    return { entry: due[0], piece: decode(due[0].code), review: true };
  }
  sinceReview[k] = (sinceReview[k] || 0) + 1;
  return { entry: null, piece: gen(), review: false };
}
function open(id) { const p = lib().pieces[id]; return p ? { entry: p, piece: decode(p.code), review: isDue(p) } : null; }

/* Record a read. A clean first read is done; anything less comes back after a day, then at growing gaps
   until you read it cleanly (a bad read resets the gap to a day). Returns the entry. */
function record(cur, lv, kind, score, bpm) {
  const L = lib(), now = Date.now();
  let p = cur.entry;
  if (!p) {
    L.n = (L.n || 0) + 1;
    p = { id: 'p' + E.device().slice(-6) + L.n, no: L.n, lv, kind, code: encode(cur.piece), made: now, reads: [], best: 0, gap: 0, due: null, star: false };
    L.pieces[p.id] = p;
    cur.entry = p;
  }
  const sameSitting = p.reads.length && now - p.reads[p.reads.length - 1].t < 30 * 60e3;
  p.reads.push({ t: now, s: Math.round(score * 100) / 100, bpm });
  if (p.reads.length > 8) p.reads.shift();
  p.last = now; p.best = Math.max(p.best || 0, score);
  if (sameSitting) { /* an immediate retry is read from memory: it doesn't change when the piece comes back */ }
  else if (score >= 0.9 || NO_REPEAT[kind]) { p.due = null; p.gap = 0; }
  else {
    p.gap = score < 0.5 || !p.gap ? 1 : Math.min(21, Math.round(p.gap * 2.5));
    p.due = now + p.gap * DAY;
  }
  prune(lv, kind);
  E.touch();
  return p;
}
function star(id, on) { const p = lib().pieces[id]; if (p) { p.star = on; E.touch(); } }
function remove(id) { delete lib().pieces[id]; E.tombstone('piece:' + id); E.touch(); }
function dueCount(lv, kind) { return list(lv, kind).filter(p => isDue(p)).length; }
function describe(p) {
  const days = Math.floor((Date.now() - p.made) / DAY);
  const when = days <= 0 ? 'today' : days === 1 ? 'yesterday' : days + ' days ago';
  const lastS = p.reads.length ? Math.round(p.reads[p.reads.length - 1].s * 100) : null;
  return { when, reads: p.reads.length, last: lastS, best: Math.round((p.best || 0) * 100) };
}

export default { next, fresh, seen, open, record, star, remove, list, dueCount, isDue, describe, encode, decode };
