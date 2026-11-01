/* World Woodshed — score recognition, step 3: from symbols on staves to music. Per staff: the clef, the key
   signature, the time signature, bars between bar lines, and in each bar the notes and rests in order, with
   their pitches (clef + position + key + accidentals in the bar) and lengths (head, beams or flags, dots).
   Staves joined by bar lines are one system; the staves of a system in order are the parts (two joined
   staves with a treble and a bass clef are one piano part). A bar that doesn't add up is repaired (three
   beamed notes in a beat may be a triplet, a short bar is filled with a rest, a long one cut) and noted, so
   the reader can check those bars. */
import { staffPos } from './image.js';

const STEPS = 'CDEFGAB';
// the diatonic number (octave × 7 + step) of the bottom line for each clef
const BOTTOM = { G: 30, F: 18, C3: 24, C4: 22 };
const REST_Q = { restW: 4, restH: 2, rest4: 1, rest8: 0.5, rest16: 0.25, rest32: 0.125 };
const ACC_ALTER = { sharp: 1, flat: -1, natural: 0, dsharp: 2, dflat: -2 };
const EPS = 1e-6;

/* One page: { staves, det } → systems [{ staves: [{ staff, clef, key, time, bars: [{ events }] }] }] */
export function readPage(staves, det, sp) {
  const rows = staves.map((st, i) => ({ st, i })).filter(r => !r.st.tab);
  const syms = det.syms;
  const out = rows.map(({ st, i }) => readStaff(st, i, det, syms.filter(s => s.staff === i), sp));
  // systems: staves joined by a bar line that runs from one to the next
  const systems = [];
  let cur = null;
  out.forEach((s, k) => {
    const prev = k ? out[k - 1] : null;
    const joined = prev && det.bars.some(b => b.staff === prev.index && b.joinsDown && det.bars.some(c => c.staff === s.index && c.joinsUp && Math.abs(c.x - b.x) < sp));
    if (!joined || !cur) { cur = { staves: [] }; systems.push(cur); }
    cur.staves.push(s);
  });
  // the bar lines of a system line up: every staff is cut where any of them has one
  systems.forEach(sys => {
    const xs = [];
    sys.staves.forEach(s => s.barXs.forEach(x => { if (!xs.some(y => Math.abs(y - x) < sp * 1.2)) xs.push(x); }));
    xs.sort((a, b) => a - b);
    // a bar line on one staff only, where the others have notes, is a stem: keep the ones most staves agree on
    const keep = sys.staves.length > 1 ? xs.filter(x => sys.staves.filter(s => s.barXs.some(y => Math.abs(y - x) < sp * 1.2)).length * 2 >= sys.staves.length) : xs;
    sys.staves.forEach(s => cutBars(s, keep, sp));
  });
  return systems;
}

function readStaff(st, index, det, syms, sp) {
  const s = { index, staff: st, x0: st.x0, x1: st.x1 };
  // the clef: the first tall symbol
  const clefs = syms.filter(y => y.cls.startsWith('clef') && (y.y1 - y.y0) / sp > 2.2).sort((a, b) => a.x - b.x);
  const c = clefs.find(y => y.x < st.x0 + sp * 6);
  if (c) {
    if (c.cls === 'clefG') s.clef = 'G';
    else if (c.cls === 'clefF') s.clef = 'F';
    else s.clef = staffPos(st, c.y, c.x) > 5 ? 'C4' : 'C3';
    s.clefX = c.x1;
  }
  let hx = c ? c.x1 : st.x0;
  // the key signature: sharps or flats right after the clef, each close to the last
  const firstNote = Math.min(Infinity, ...det.notes.filter(n => n.staff === index).map(n => n.x0 - sp));
  const accs = syms.filter(y => (y.cls === 'sharp' || y.cls === 'flat') && y.x > hx && y.x < firstNote).sort((a, b) => a.x - b.x);
  const key = [];
  for (const a of accs) {
    const last = key.length ? key[key.length - 1].x1 : hx;
    // the first sign may sit a little after the clef (a bass clef's dots come between)
    if (a.x0 - last > sp * (key.length ? 1.6 : 2.6) || (key.length && a.cls !== key[0].cls)) break;
    key.push(a);
  }
  if (key.length) { s.fifths = Math.min(7, key.length) * (key[0].cls === 'sharp' ? 1 : -1); hx = key[key.length - 1].x1; }
  s.keySyms = new Set(key);
  // the time signature: digits (or C, ¢) stacked after the key
  const tsyms = syms.filter(y => /^t\d$|^common$|^cut$/.test(y.cls) && y.x > hx - sp && y.x < Math.min(firstNote, hx + sp * 5)).sort((a, b) => a.x - b.x);
  if (tsyms.length) {
    const cmn = tsyms.find(y => y.cls === 'common' || y.cls === 'cut');
    if (cmn) s.time = cmn.cls === 'common' ? { num: 4, den: 4, symbol: 'common' } : { num: 2, den: 2, symbol: 'cut' };
    else {
      const top = tsyms.filter(y => staffPos(st, y.y, y.x) > 4), bot = tsyms.filter(y => staffPos(st, y.y, y.x) <= 4);
      const num = Number(top.map(y => y.cls.slice(1)).join('')), den = Number(bot.map(y => y.cls.slice(1)).join(''));
      if (num > 0 && num <= 16 && [1, 2, 4, 8, 16].includes(den)) s.time = { num, den };
    }
    hx = Math.max(hx, ...tsyms.map(y => y.x1));
  }
  s.headerEnd = hx;
  // bar lines on this staff, a thin and a thick (or two thin) close together counted once
  const xs = det.bars.filter(b => b.staff === index).map(b => b.x).sort((a, b) => a - b);
  s.barXs = [];
  xs.forEach(x => { if (!s.barXs.length || x - s.barXs[s.barXs.length - 1] > sp * 1.2) s.barXs.push(x); else s.barXs[s.barXs.length - 1] = x; });
  // the events: notes (by their stems or heads) and rests
  s.events = [];
  det.notes.filter(n => n.staff === index && n.x > hx).forEach(n => {
    const base = n.whole ? 4 : !n.filled ? 2 : 1 / Math.pow(2, n.hooks);
    const dots = n.dots || 0;
    const q = base * (dots === 2 ? 1.75 : dots ? 1.5 : 1);
    s.events.push({ x: n.x0, q, base, dots, up: n.up, whole: !!n.whole, hooks: n.hooks, heads: n.heads, beamed: n.hooks > 0 && n.stem && isBeamed(n, det) });
  });
  syms.filter(y => REST_Q[y.cls] != null && y.x > hx).forEach(r => {
    let cls = r.cls;
    if (cls === 'restW' || cls === 'restH') {
      // a whole rest hangs from the fourth line, a half rest sits on the middle line
      const top = staffPos(st, r.y0, r.x), bot = staffPos(st, r.y1, r.x);
      if (Math.abs(top - 6) < 0.7) cls = 'restW'; else if (Math.abs(bot - 4) < 0.7) cls = 'restH';
    }
    const dot = det.dots.find(d => !d.used && d.staff === index && d.x > r.x1 && d.x < r.x1 + sp * 1.4 && d.y > r.y0 - sp * 0.3 && d.y < r.y1 + sp * 0.3);
    if (dot) dot.used = true;
    s.events.push({ x: r.x0, q: REST_Q[cls] * (dot ? 1.5 : 1), base: REST_Q[cls], dots: dot ? 1 : 0, rest: true, wholeRest: cls === 'restW', pos: staffPos(st, r.y, r.x) });
  });
  s.events.sort((a, b) => a.x - b.x);
  // accidentals: each to the head right after it at its height
  const accOf = new Map();
  syms.filter(y => ACC_ALTER[y.cls] != null && !s.keySyms.has(y)).forEach(a => {
    // a flat's belly, where its note sits, is low in the sign
    const ay = a.cls === 'flat' || a.cls === 'dflat' ? a.y1 - sp * 0.55 : (a.y0 + a.y1) / 2;
    const apos = staffPos(st, ay, a.x);
    let best = null, bd = Infinity;
    s.events.forEach(e => (e.heads || []).forEach(hd => {
      const dx = hd.x - a.x1;
      if (dx < -sp * 0.3 || dx > sp * 3.2) return;
      const dp = Math.abs(hd.pos - apos);
      if (dp > 1.3) return;
      const v = dp + dx / sp * 0.3;
      if (v < bd) { bd = v; best = hd; }
    }));
    if (best && !accOf.has(best)) accOf.set(best, ACC_ALTER[a.cls]);
  });
  s.events.forEach(e => (e.heads || []).forEach(hd => { if (accOf.has(hd)) hd.acc = accOf.get(hd); }));
  return s;
}

function isBeamed(n, det) {
  // another stem in the same piece of ink
  return det.notes.some(m => m !== n && m.stem && n.stem && m.stem.comp === n.stem.comp);
}

function cutBars(s, xs, sp) {
  const cuts = xs.filter(x => x > s.headerEnd - sp * 0.5);
  const bounds = [s.headerEnd].concat(cuts);
  if (s.x1 - bounds[bounds.length - 1] > sp * 3) bounds.push(s.x1 + 1);
  s.bars = [];
  for (let k = 0; k + 1 < bounds.length; k++) {
    const a = bounds[k], b = bounds[k + 1];
    s.bars.push({ events: s.events.filter(e => e.x >= a && e.x < b) });
  }
  // a header-only stretch before the first bar line (clef and key with nothing in it) is not a bar
  if (s.bars.length > 1 && !s.bars[0].events.length && cuts.length && cuts[0] - s.headerEnd < sp * 3) s.bars.shift();
}

/* ---------- the whole piece ---------- */

/* Pages of systems → a score:
   { title, time: { num, den, symbol? }, fifths, parts: [{ name, staves: [clef], bars: [[staff][voice][event]] }],
     pickup: quarters | 0, warnings: [{ bar, part, text }], counts: { notes, bars, fixed } } */
export function buildScore(pages, opts = {}) {
  const systems = pages.flat();
  if (!systems.length) return null;
  // staff rows: the usual number of staves in a system
  const nRows = mode(systems.map(s => s.staves.length));
  const rowsOf = sys => (sys.staves.length === nRows ? sys.staves : sys.staves.slice(0, nRows));
  // clef, key, time: per row, the most common reading across systems (each system repeats clef and key)
  const clefs = [], keys = [];
  for (let r = 0; r < nRows; r++) {
    clefs.push(mode(systems.map(s => rowsOf(s)[r] && rowsOf(s)[r].clef).filter(Boolean)) || 'G');
    keys.push(mode(systems.map(s => rowsOf(s)[r] && rowsOf(s)[r].fifths).filter(v => v != null)));
  }
  const fifths = mode(keys.filter(v => v != null)) ?? 0;
  let time = null;
  for (const sys of systems) { for (const s of rowsOf(sys)) if (s.time) { time = s.time; break; } if (time) break; }
  // the parts: two joined staves (treble over bass) are a piano; otherwise one part per row
  const piano = nRows === 2 && clefs[0] !== 'F' && clefs[1] === 'F' && systems.some(s => s.staves.length === 2);
  const partRows = piano ? [[0, 1]] : clefs.map((_, r) => [r]);
  // bars of each row, system after system
  const rowBars = [];
  for (let r = 0; r < nRows; r++) rowBars.push([]);
  systems.forEach(sys => {
    const rs = rowsOf(sys);
    const n = Math.max(...rs.map(s => s.bars.length));
    for (let r = 0; r < nRows; r++) {
      const s = rs[r];
      for (let k = 0; k < n; k++) rowBars[r].push(s && s.bars[k] ? s.bars[k].events : []);
    }
  });
  const nBars = Math.max(0, ...rowBars.map(b => b.length));
  // a time signature misread (a 3 taken for an 8) shows as bars that all add up to something else
  if (time) {
    const g = guessTime(rowBars), lens = barLengths(rowBars);
    const want = time.num * 4 / time.den, got = g.num * 4 / g.den;
    if (Math.abs(want - got) > EPS && lens.filter(q => Math.abs(q - got) < EPS).length >= lens.length * 0.5 && lens.length >= 3) time = Object.assign(g, { misread: true });
  }
  if (!time) time = guessTime(rowBars);
  const barQ = time.num * 4 / time.den;
  const warnings = [];
  let fixed = 0, noteCount = 0;
  // a first bar shorter than the rest, in every row, is a pickup
  const firstLen = rowBars.map(b => sum((b[0] || []).filter(e => !e.wholeRest)));
  const pickup = nBars > 1 && firstLen.every(l => l > EPS && l < barQ - EPS) ? Math.max(...firstLen) : 0;
  const parts = partRows.map((rows, pi) => ({
    name: piano ? 'Piano' : partRows.length > 1 ? 'Part ' + (pi + 1) : opts.instrument || 'Music',
    staves: rows.map(r => clefs[r]),
    bars: []
  }));
  for (let b = 0; b < nBars; b++) {
    const len = b === 0 && pickup ? pickup : barQ;
    partRows.forEach((rows, pi) => {
      const bar = rows.map(r => {
        const ev = (rowBars[r][b] || []).map(e => Object.assign({}, e));
        const voices = splitVoices(ev, len);
        return voices.map((v, vi) => {
          const r2 = fitBar(v, len, time);
          if (r2.fixed) { fixed++; warnings.push({ bar: b + 1, part: pi, staff: rows.indexOf(r), text: r2.fixed }); }
          return r2.events.map(e => toEvent(e, clefs[r], fifths, vi));
        });
      });
      // accidentals carry through the bar per staff: recompute pitch alters in order
      bar.forEach(voices => applyAccidentals(voices, fifths));
      bar.forEach(voices => voices.forEach(v => v.forEach(e => { if (!e.rest) noteCount += e.pitches.length; })));
      parts[pi].bars.push(bar);
    });
  }
  return { title: opts.title || '', time, fifths, parts, pickup, warnings, counts: { notes: noteCount, bars: nBars, fixed } };
}

const sum = evs => evs.reduce((a, e) => a + e.q, 0);
function mode(a) {
  const m = new Map(); a.forEach(v => m.set(v, (m.get(v) || 0) + 1));
  let best, bn = 0; m.forEach((n, v) => { if (n > bn) { bn = n; best = v; } });
  return best;
}

function barLengths(rowBars) {
  const lens = [];
  rowBars.forEach(bars => bars.forEach(ev => { const q = sum(ev.filter(e => !e.wholeRest)); if (q > 0) lens.push(Math.round(q * 4) / 4); }));
  return lens;
}
function guessTime(rowBars) {
  const q = mode(barLengths(rowBars)) || 4;
  const table = { 4: [4, 4], 3: [3, 4], 2: [2, 4], 1.5: [3, 8], 6: [6, 4], 5: [5, 4], 2.5: [5, 8], 1: [2, 8], 4.5: [9, 8], 7: [7, 4] };
  const t = table[q] || [4, 4];
  // three quarters of eighths grouped in threes is 6/8, not 3/4
  if (q === 3) {
    let threes = 0, twos = 0;
    rowBars.forEach(bars => bars.forEach(ev => { let run = 0; ev.forEach(e => { if (e.beamed && e.q === 0.5) run++; else { if (run === 3) threes++; if (run === 2 || run === 4) twos++; run = 0; } }); if (run === 3) threes++; if (run === 2 || run === 4) twos++; }));
    if (threes > twos * 2 && threes >= 2) return { num: 6, den: 8, guessed: true };
  }
  if (q === 6) return { num: 12, den: 8, guessed: true, alt: [6, 4] };
  return { num: t[0], den: t[1], guessed: true };
}

/* One voice, or two: when a bar holds about twice its length with stems both ways, the up stems (and rests
   high on the staff) are one voice and the down stems the other */
function splitVoices(ev, len) {
  const total = sum(ev.filter(e => !e.wholeRest));
  const ups = ev.filter(e => e.up === true), downs = ev.filter(e => e.up === false);
  if (total > len * 1.45 && ups.length && downs.length) {
    const a = ev.filter(e => e.up === true || (e.rest && e.pos >= 4) || (e.whole && e.heads[0].pos >= 4));
    const b = ev.filter(e => !a.includes(e));
    if (Math.abs(sum(a) - len) < len * 0.3 || Math.abs(sum(b) - len) < len * 0.3) return [a, b];
  }
  return [ev];
}

/* Make a voice add up to the bar: triplets first, then a rest to fill or a cut */
function fitBar(ev, len, time) {
  let events = ev.filter(e => !(e.wholeRest && ev.length > 1)).map(e => Object.assign({}, e));
  if (events.length === 1 && events[0].wholeRest) { events[0].q = len; events[0].full = true; return { events }; }
  if (!events.length) return { events: [{ rest: true, q: len, full: true }] };
  let total = sum(events), fixed = null;
  // three notes of one length, beamed, where two belong (in simple time): a triplet
  if (total > len + EPS && time.den !== 8) {
    for (let i = 0; i + 2 < events.length && total > len + EPS; i++) {
      const a = events[i], b = events[i + 1], c = events[i + 2];
      if ([a, b, c].every(e => !e.rest && !e.dots && e.beamed && e.q === a.q && !e.tuplet) && a.q <= 0.5) {
        [a, b, c].forEach((e, k) => { e.q = e.q * 2 / 3; e.tuplet = k === 0 ? 'start' : k === 2 ? 'stop' : 'mid'; });
        total = sum(events); i += 2;
      }
    }
    if (Math.abs(total - len) < EPS) fixed = null;
  }
  if (total < len - EPS) {
    events.push({ rest: true, q: len - total, filler: true });
    fixed = 'Short by ' + fmtQ(len - total) + ': a rest was added';
  } else if (total > len + EPS) {
    let t = 0; const keep = [];
    for (const e of events) {
      if (t + e.q <= len + EPS) { keep.push(e); t += e.q; } else { if (len - t > EPS) { e.q = len - t; e.cut = true; keep.push(e); t = len; } break; }
    }
    fixed = 'Too long by ' + fmtQ(total - len) + ': the end was cut';
    events = keep;
  }
  return { events, fixed };
}
const fmtQ = q => (q === 1 ? 'a beat' : (+q.toFixed(3)) + ' beats');

function toEvent(e, clef, fifths, voice) {
  const out = { q: e.q, voice, dots: e.dots || 0 };
  if (e.tuplet) out.tuplet = e.tuplet;
  if (e.rest) { out.rest = true; if (e.full) out.full = true; return out; }
  const base = BOTTOM[clef] ?? 30;
  out.pitches = e.heads.map(hd => {
    const dn = base + Math.round(hd.pos);
    const octave = Math.floor(dn / 7), step = STEPS[((dn % 7) + 7) % 7];
    return { step, octave, acc: hd.acc, dn };
  });
  // the same staff position twice in a chord (a misread) once
  out.pitches = out.pitches.filter((p, i, a) => a.findIndex(o => o.dn === p.dn) === i);
  return out;
}

/* Alterations: the key signature, changed by an accidental until the end of the bar (per staff position and octave) */
function applyAccidentals(voices, fifths) {
  const keyAlt = {};
  const SH = 'FCGDAEB', FL = 'BEADGCF';
  for (let i = 0; i < Math.abs(fifths); i++) keyAlt[(fifths > 0 ? SH : FL)[i]] = fifths > 0 ? 1 : -1;
  const all = [];
  voices.forEach(v => { let t = 0; v.forEach(e => { all.push([t, e]); t += e.q; }); });
  all.sort((a, b) => a[0] - b[0]);
  const state = {};
  all.forEach(([, e]) => (e.pitches || []).forEach(p => {
    if (p.acc != null) state[p.dn] = p.acc;
    p.alter = p.dn in state ? state[p.dn] : (keyAlt[p.step] || 0);
  }));
}

/* The written pitch as MIDI */
export function midiOf(p) {
  return (p.octave + 1) * 12 + [0, 2, 4, 5, 7, 9, 11][STEPS.indexOf(p.step)] + (p.alter || 0);
}
