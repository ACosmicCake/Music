/* World Woodshed — the reading library.
   The generators never run out: every "New" is a fresh, unseen piece. Each piece you read is kept here
   (stored compactly with the rest of your progress), so you can play it again, star it, and get the ones
   you missed back for a re-read after a gap: long enough that you are reading it again, not remembering it. */
import E from './engine.js';

const DAY = 864e5;
const CAP = 40; // kept per level and kind, not counting starred pieces
const lib = () => {
  const s = E.state;
  if (!s.readLib || !s.readLib.pieces) s.readLib = { pieces: {}, n: 0 };
  return s.readLib;
};

/* One event: pitch (or r for a rest), duration, then . dot, ~ tie, # or b spelling. Bars split by |. */
function encode(piece) {
  const ev = n => (n.midi == null ? 'r' : n.midi) + n.dur + (n.dot ? '.' : '') + (n.tie ? '~' : '') + (n.spell || '');
  return piece.key + '/' + piece.time + '/' + piece.bars.map(b => b.map(ev).join(' ')).join('|');
}
function decode(code) {
  const parts = code.split('/'), key = parts[0], time = parts[1] + '/' + parts[2], body = parts.slice(3).join('/');
  const bars = body.split('|').map(b => b.split(' ').map(t => {
    const m = /^(r|\d+)(w|h|q|8|16)(\.?)(~?)([#b]?)$/.exec(t);
    const n = { midi: m[1] === 'r' ? null : +m[1], dur: m[2] };
    if (m[3]) n.dot = true; if (m[4]) n.tie = true; if (m[5]) n.spell = m[5];
    return n;
  }));
  return { key, time, bars };
}

const list = (lv, kind) => Object.values(lib().pieces).filter(p => (lv == null || p.lv === lv) && (!kind || p.kind === kind));
const isDue = (p, now = Date.now()) => p.due != null && p.due <= now;

function prune(lv, kind) {
  const all = list(lv, kind).filter(p => !p.star);
  if (all.length <= CAP) return;
  // drop finished pieces first (no review pending), oldest first
  all.sort((a, b) => ((a.due == null ? 0 : 1) - (b.due == null ? 0 : 1)) || (a.last - b.last));
  all.slice(0, all.length - CAP).forEach(p => { delete lib().pieces[p.id]; });
}

/* What to read next: mostly new pieces; when re-reads are due, every third piece is one of them. */
let sinceReview = {};
function next(lv, kind, gen) {
  const k = lv + kind;
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
    p = { id: 'p' + L.n, no: L.n, lv, kind, code: encode(cur.piece), made: now, reads: [], best: 0, gap: 0, due: null, star: false };
    L.pieces[p.id] = p;
    cur.entry = p;
  }
  const sameSitting = p.reads.length && now - p.reads[p.reads.length - 1].t < 30 * 60e3;
  p.reads.push({ t: now, s: Math.round(score * 100) / 100, bpm });
  if (p.reads.length > 8) p.reads.shift();
  p.last = now; p.best = Math.max(p.best || 0, score);
  if (sameSitting) { /* an immediate retry is read from memory: it doesn't change when the piece comes back */ }
  else if (score >= 0.9) { p.due = null; p.gap = 0; }
  else {
    p.gap = score < 0.5 || !p.gap ? 1 : Math.min(21, Math.round(p.gap * 2.5));
    p.due = now + p.gap * DAY;
  }
  prune(lv, kind);
  E.touch();
  return p;
}
function star(id, on) { const p = lib().pieces[id]; if (p) { p.star = on; E.touch(); } }
function remove(id) { delete lib().pieces[id]; E.touch(); }
function dueCount(lv, kind) { return list(lv, kind).filter(p => isDue(p)).length; }
function describe(p) {
  const days = Math.floor((Date.now() - p.made) / DAY);
  const when = days <= 0 ? 'today' : days === 1 ? 'yesterday' : days + ' days ago';
  const lastS = p.reads.length ? Math.round(p.reads[p.reads.length - 1].s * 100) : null;
  return { when, reads: p.reads.length, last: lastS, best: Math.round((p.best || 0) * 100) };
}

export default { next, open, record, star, remove, list, dueCount, isDue, describe, encode, decode };
