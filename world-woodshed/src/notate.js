/* World Woodshed — from what you play to a score. Plain functions, no DOM and no audio, so they are
   tested on their own (test/notate.test.js); the Write by playing tool (src/tools/notate.js) draws them.

   A draft: { title, bpm, time: '4/4', key: 'auto' | a key of notation.js KEYS, grid: 0.25 | 0.5 (the
   smallest note, in quarters), hold: true (a note lasts until the next one when the gap is under a beat),
   notes: [{ s, e, midi }] } with s and e in quarter notes from the start of bar 1 and midi the sounding
   pitch. Notes stay as played (unrounded) so a different grid can still be chosen afterwards.

   quantize() lines the notes up on the grid and writes bars of notation.js notes, split with ties at
   beats and bar lines the way engravers do; guessKey() finds the key; placeFrets() picks a string and
   fret for each note; toMusicXML() and toMidi() write files that MuseScore (and most notation apps) open. */
import { KEYS, spell, parseTime, keyAlters } from './notation.js';

export const TIMES = ['4/4', '3/4', '2/4', '6/8', '12/8'];
export const DEFAULT_DRAFT = () => ({ title: '', bpm: 80, time: '4/4', key: 'auto', grid: 0.25, hold: true, notes: [] });

/* A draft from saved or imported data, with every field checked (it may come from another device) */
export function cleanDraft(d) {
  const base = DEFAULT_DRAFT();
  if (!d || typeof d !== 'object') return base;
  const num = (v, lo, hi, dflt) => (typeof v === 'number' && isFinite(v) ? Math.max(lo, Math.min(hi, v)) : dflt);
  const notes = Array.isArray(d.notes) ? d.notes.filter(n => n && isFinite(n.s) && isFinite(n.e) && isFinite(n.midi))
    .map(n => ({ s: Math.max(0, +n.s), e: Math.max(+n.s, +n.e), midi: Math.max(21, Math.min(108, Math.round(n.midi))) })).slice(0, 4000) : [];
  return {
    title: typeof d.title === 'string' ? d.title.slice(0, 120) : '',
    bpm: Math.round(num(d.bpm, 30, 260, base.bpm)),
    time: TIMES.includes(d.time) ? d.time : base.time,
    key: d.key === 'auto' || KEYS[d.key] ? d.key : 'auto',
    grid: d.grid === 0.5 ? 0.5 : 0.25,
    hold: d.hold !== false,
    notes: notes.sort((a, b) => a.s - b.s)
  };
}

/* Mic notes ({ t, end, midi } in audio seconds) to draft notes. t0: the audio time of the first beat,
   lat: the mic's delay in seconds, at: where in the draft (quarters) the first beat goes. Notes played
   during the count-in are dropped, except a hair early on the first beat. */
export function takeNotes(events, { bpm, time = '4/4', t0, lat = 0, at = 0 }) {
  const qps = bpm / 60 * parseTime(time).beatQ;
  const out = [];
  events.forEach(ev => {
    let s = (ev.t - lat - t0) * qps, e = ((ev.end ?? ev.t) - lat - t0) * qps;
    if (s < -0.2) return;
    s = Math.max(0, s); e = Math.max(s + 0.05, e);
    out.push({ s: +(at + s).toFixed(3), e: +(at + e).toFixed(3), midi: Math.round(ev.midi) });
  });
  return out;
}

/* ---------- lining notes up on the grid ---------- */
const snap = (x, g) => Math.round(x / g + 1e-9) * g;

/* The notes as they will be written: on the grid, without overlaps. Each keeps src, its index in draft.notes. */
export function snapNotes(draft) {
  const g = draft.grid || 0.25, ts = parseTime(draft.time);
  const list = draft.notes.map((n, src) => ({ s: snap(n.s, g), e: snap(n.e, g), midi: n.midi, src, len: n.e - n.s }))
    .sort((a, b) => a.s - b.s || b.len - a.len);
  const out = [];
  list.forEach(n => {
    if (n.e <= n.s) n.e = n.s + g;
    const prev = out[out.length - 1];
    if (prev && prev.s === n.s) return; // two attacks on one grid point: keep the longer (sorted first)
    out.push(n);
  });
  out.forEach((n, i) => {
    const nx = out[i + 1];
    if (!nx) return;
    if (n.e > nx.s) n.e = nx.s;
    else if (draft.hold !== false && nx.s - n.e < ts.beatQ - 1e-9) n.e = nx.s; // a short gap is a released note, not a rest
  });
  return out.map(({ s, e, midi, src }) => ({ s, e, midi, src }));
}

/* note values, longest first: [quarters, dur, dot] */
const VALUES = [[4, 'w', false], [3, 'h', true], [2, 'h', false], [1.5, 'q', true], [1, 'q', false], [0.75, '8', true], [0.5, '8', false], [0.25, '16', false]];
const EPS = 1e-6;
/* May a note (or rest) of length L start p quarters into a bar? Notes stay inside a beat unless they start
   on one; longer notes are whole beats; in 4/4 nothing but a note from the downbeat crosses the middle of
   the bar; rests are dotted only in compound time, and only a whole beat. */
function fits(p, L, dot, rest, ts) {
  const B = ts.beatQ;
  if (p + L > ts.barQ + EPS) return false;
  const beatOf = x => Math.floor(x / B + EPS);
  if (L < B - EPS) {
    if (beatOf(p) !== beatOf(p + L - 2 * EPS)) return false;
    if (rest && dot) return false;
    return true;
  }
  if (Math.abs(p / B - Math.round(p / B)) > EPS) return false; // a beat or longer starts on a beat
  if (ts.compound) { if (Math.abs(L / B - Math.round(L / B)) > EPS) return false; }
  else if (rest && dot) return false;
  if (ts.barQ === 4 && !ts.compound && p > EPS && p < 2 - EPS && p + L > 2 + EPS) return false;
  if (ts.barQ === 6 && ts.compound && p > EPS && p + L > 3 + EPS && p < 3 - EPS) return false; // 12/8: the same at the middle
  return true;
}
/* Split a span [a, b) of one bar (a, b in quarters from the bar line) into written values */
export function splitSpan(a, b, rest, ts) {
  const out = [];
  let p = a, guard = 0;
  while (b - p > EPS && guard++ < 64) {
    const v = VALUES.find(([L, , dot]) => L <= b - p + EPS && fits(p, L, dot, rest, ts));
    if (!v) { out.push({ q: b - p, dur: '16', dot: false }); break; } // off the grid: cannot happen with snapped input
    out.push({ q: v[0], dur: v[1], dot: v[2] });
    p += v[0];
  }
  return out;
}

/* The draft as bars of notation.js notes (written an octave up, as guitar music is), plus the snapped
   notes. Each written note carries src (its draft note, or -1 for a rest) and at (quarters from the start). */
export function quantize(draft, opts = {}) {
  const ts = parseTime(draft.time);
  const notes = snapNotes(draft);
  const end = notes.length ? notes[notes.length - 1].e : 0;
  const nBars = Math.max(opts.minBars || 1, Math.ceil(end / ts.barQ - EPS));
  const bars = [];
  let k = 0;
  for (let b = 0; b < nBars; b++) {
    const b0 = b * ts.barQ, b1 = b0 + ts.barQ, bar = [];
    let p = b0;
    const push = (from, to, n) => {
      const parts = splitSpan(from - b0, to - b0, !n, ts);
      let at = from;
      parts.forEach((x, j) => {
        const w = { midi: n ? n.midi + 12 : null, dur: x.dur, src: n ? n.src : -1, at };
        if (x.dot) w.dot = true;
        if (n && (j < parts.length - 1 || to < n.e - EPS)) w.tie = true;
        bar.push(w); at += x.q;
      });
    };
    while (k < notes.length && notes[k].e <= b0 + EPS) k++;
    for (let j = k; j < notes.length && notes[j].s < b1 - EPS; j++) {
      const n = notes[j], s = Math.max(n.s, b0), e = Math.min(n.e, b1);
      if (s > p + EPS) push(p, s, null);
      push(s, e, n);
      p = e;
    }
    if (p < b1 - EPS) {
      if (p <= b0 + EPS) bar.push({ midi: null, dur: 'w', src: -1, at: b0, full: true }); // a whole bar's rest
      else push(p, b1, null);
    }
    bars.push(bar);
  }
  return { bars, notes, ts };
}

/* ---------- the key ---------- */
// Krumhansl–Kessler probe-tone profiles, from the tonic
const MAJ = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MIN = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
function corr(a, b) {
  const ma = a.reduce((x, y) => x + y, 0) / 12, mb = b.reduce((x, y) => x + y, 0) / 12;
  let n = 0, da = 0, db = 0;
  for (let i = 0; i < 12; i++) { n += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
  return da && db ? n / Math.sqrt(da * db) : 0;
}
/* The key (one of notation.js KEYS) that best fits the notes, weighted by length; a last note on the
   tonic tips a close call. C when there is nothing to go on. */
export function guessKey(notes) {
  if (!notes.length) return 'C';
  const pcs = new Array(12).fill(0);
  notes.forEach(n => { pcs[((n.midi % 12) + 12) % 12] += Math.min(4, Math.max(0.25, n.e - n.s)); });
  const last = ((notes[notes.length - 1].midi % 12) + 12) % 12;
  let best = 'C', bestV = -Infinity;
  Object.entries(KEYS).forEach(([name, k]) => {
    const prof = k.minor ? MIN : MAJ;
    const rot = pcs.map((_, i) => prof[((i - k.tonic) % 12 + 12) % 12]);
    const v = corr(pcs, rot) + (last === k.tonic ? 0.05 : 0);
    if (v > bestV + 1e-9) { bestV = v; best = name; }
  });
  return best;
}
export const keyOf = draft => (draft.key && draft.key !== 'auto' && KEYS[draft.key] ? draft.key : guessKey(draft.notes));

/* ---------- strings and frets ---------- */
/* A string and fret for each pitch, the way a player would finger it: the hand sits in a position (the
   index finger's fret, covering four frets) and moves as little as it can; open strings are free low on
   the neck. A Viterbi search over (place, hand position) for each note. strings: open pitches low to high
   (with the capo). Returns [{ si, f }] with si indexing strings, or null for a note the guitar cannot reach. */
export function placeFrets(midis, strings, maxFret = 19) {
  const states = midis.map(m => {
    const c = [];
    strings.forEach((o, si) => {
      const f = m - o;
      if (f < 0 || f > maxFret) return;
      if (f === 0) for (let pos = 1; pos <= maxFret - 3; pos++) c.push({ si, f, pos });
      else for (let pos = Math.max(1, f - 3); pos <= f; pos++) c.push({ si, f, pos });
    });
    return c;
  });
  // where the hand would rather be: low on the neck, a fretted note under its own finger (fret - pos)
  const own = p => 0.04 * p.pos + (p.f === 0 ? (p.pos > 5 ? 0.6 : 0) : 0.02 * (p.f - p.pos) + (p.f - p.pos === 3 ? 0.05 : 0));
  const move = (a, b) => (a.pos === b.pos ? 0 : 1 + 0.25 * Math.abs(a.pos - b.pos)) + 0.08 * Math.abs(a.si - b.si) + (a.si === b.si && a.f !== b.f && b.f && a.f ? 0.05 : 0);
  const out = new Array(midis.length).fill(null);
  let i = 0;
  while (i < midis.length) {
    if (!states[i].length) { i++; continue; }
    let j = i; // a run of notes the guitar can reach
    while (j < midis.length && states[j].length) j++;
    const cost = [states[i].map(own)], from = [states[i].map(() => -1)];
    for (let k = i + 1; k < j; k++) {
      const prev = states[k - 1], pc = cost[k - 1 - i], c = [], fr = [];
      states[k].forEach(p => {
        let bv = Infinity, bi = 0;
        prev.forEach((q, qi) => { const v = pc[qi] + move(q, p); if (v < bv) { bv = v; bi = qi; } });
        c.push(bv + own(p)); fr.push(bi);
      });
      cost.push(c); from.push(fr);
    }
    const lastC = cost[j - 1 - i];
    let bi = lastC.indexOf(Math.min(...lastC));
    for (let k = j - 1; k >= i; k--) { const p = states[k][bi]; out[k] = { si: p.si, f: p.f }; bi = from[k - i][bi]; }
    i = j;
  }
  return out;
}

/* ---------- MusicXML ---------- */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const TYPE = { w: 'whole', h: 'half', q: 'quarter', 8: 'eighth', 16: '16th' };
const ACC = { '-2': 'flat-flat', '-1': 'flat', 0: 'natural', 1: 'sharp', 2: 'double-sharp' };
const STEP_OF = 'CDEFGAB';

/* opts: { strings: open pitches low to high (capo included), capo, tab: true, program: 25 (General MIDI,
   steel guitar; 24 is nylon), date: 'YYYY-MM-DD' } */
export function toMusicXML(draft, opts = {}) {
  const { bars, notes, ts } = quantize(draft);
  const key = keyOf(draft), K = KEYS[key];
  const strings = opts.strings || [40, 45, 50, 55, 59, 64];
  const tab = opts.tab !== false;
  const DIV = 4; // divisions per quarter: a sixteenth is 1
  const frets = placeFrets(notes.map(n => n.midi), strings);
  const fretOf = new Map(notes.map((n, i) => [n.src, frets[i]]));
  const barDiv = Math.round(ts.barQ * DIV);
  const title = draft.title || 'Untitled';
  const L = [];
  L.push('<?xml version="1.0" encoding="UTF-8" standalone="no"?>',
    '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">',
    '<score-partwise version="4.0">',
    `  <work><work-title>${esc(title)}</work-title></work>`,
    '  <identification>',
    opts.composer ? `    <creator type="composer">${esc(opts.composer)}</creator>` : null,
    `    <encoding><software>World Woodshed</software>${opts.date ? `<encoding-date>${esc(opts.date)}</encoding-date>` : ''}</encoding>`,
    '  </identification>',
    '  <part-list>',
    '    <score-part id="P1"><part-name>Guitar</part-name>',
    '      <score-instrument id="P1-I1"><instrument-name>Guitar</instrument-name></score-instrument>',
    `      <midi-instrument id="P1-I1"><midi-channel>1</midi-channel><midi-program>${(opts.program ?? 25) + 1}</midi-program></midi-instrument>`,
    '    </score-part>',
    '  </part-list>',
    '  <part id="P1">');
  const alters = keyAlters(K.fifths);
  bars.forEach((bar, bi) => {
    L.push(`    <measure number="${bi + 1}">`);
    if (bi === 0) {
      L.push('      <attributes>', `        <divisions>${DIV}</divisions>`,
        `        <key><fifths>${K.fifths}</fifths><mode>${K.minor ? 'minor' : 'major'}</mode></key>`,
        `        <time><beats>${ts.num}</beats><beat-type>${ts.den}</beat-type></time>`);
      if (tab) L.push('        <staves>2</staves>');
      L.push(`        <clef${tab ? ' number="1"' : ''}><sign>G</sign><line>2</line><clef-octave-change>-1</clef-octave-change></clef>`);
      if (tab) {
        L.push('        <clef number="2"><sign>TAB</sign><line>5</line></clef>',
          `        <staff-details number="2"><staff-lines>${strings.length}</staff-lines>`);
        strings.forEach((m, i) => { const sp = spell(m, 'C'); L.push(`          <staff-tuning line="${i + 1}"><tuning-step>${sp.letter}</tuning-step>${sp.alter ? `<tuning-alter>${sp.alter}</tuning-alter>` : ''}<tuning-octave>${sp.octave}</tuning-octave></staff-tuning>`); });
        L.push('        </staff-details>');
      }
      L.push('      </attributes>');
      const unit = ts.compound ? '<beat-unit>quarter</beat-unit><beat-unit-dot/>' : `<beat-unit>${TYPE[{ 1: 'q', 2: 'h', 0.5: '8' }[ts.beatQ] || 'q']}</beat-unit>`;
      L.push(`      <direction placement="above"><direction-type><metronome>${unit}<per-minute>${draft.bpm}</per-minute></metronome></direction-type><sound tempo="${+(draft.bpm * ts.beatQ).toFixed(2)}"/></direction>`);
    }
    const write = (staff, voice) => {
      const state = {}; // accidentals already shown in this bar, by staff step
      bar.forEach((n, j) => {
        const prev = j ? bar[j - 1] : bi ? bars[bi - 1][bars[bi - 1].length - 1] : null;
        const tiedIn = prev && prev.tie && n.midi != null && prev.midi === n.midi;
        const dur = n.full ? barDiv : Math.round((n.dot ? 1.5 : 1) * { w: 4, h: 2, q: 1, 8: 0.5, 16: 0.25 }[n.dur] * DIV);
        const x = ['      <note>'];
        if (n.midi == null) x.push(n.full ? '<rest measure="yes"/>' : '<rest/>');
        else {
          const sp = spell(n.midi - 12, key);
          x.push(`<pitch><step>${sp.letter}</step>${sp.alter ? `<alter>${sp.alter}</alter>` : ''}<octave>${sp.octave}</octave></pitch>`);
          n.sp = sp;
        }
        x.push(`<duration>${dur}</duration>`);
        if (n.midi != null) { if (tiedIn) x.push('<tie type="stop"/>'); if (n.tie) x.push('<tie type="start"/>'); }
        x.push(`<voice>${voice}</voice>`);
        if (!n.full) { x.push(`<type>${TYPE[n.dur]}</type>`); if (n.dot) x.push('<dot/>'); }
        if (n.midi != null && staff === 1) {
          const cur = n.sp.step in state ? state[n.sp.step] : alters[STEP_OF.indexOf(n.sp.letter)];
          if (cur !== n.sp.alter && !tiedIn) x.push(`<accidental>${ACC[n.sp.alter]}</accidental>`);
          state[n.sp.step] = n.sp.alter;
        }
        if (tab) x.push(`<staff>${staff}</staff>`);
        const nt = [];
        if (n.midi != null && tiedIn) nt.push('<tied type="stop"/>');
        if (n.midi != null && n.tie) nt.push('<tied type="start"/>');
        if (staff === 2 && n.midi != null) {
          const p = fretOf.get(n.src);
          if (p) nt.push(`<technical><string>${strings.length - p.si}</string><fret>${p.f}</fret></technical>`);
        }
        if (nt.length) x.push(`<notations>${nt.join('')}</notations>`);
        x.push('</note>');
        L.push(x.join(''));
      });
    };
    write(1, 1);
    if (tab) { L.push(`      <backup><duration>${barDiv}</duration></backup>`); write(2, 5); }
    if (bi === bars.length - 1) L.push('      <barline location="right"><bar-style>light-heavy</bar-style></barline>');
    L.push('    </measure>');
  });
  L.push('  </part>', '</score-partwise>', '');
  return L.filter(x => x !== null).join('\n');
}

/* ---------- Standard MIDI file ---------- */
function vlq(n) {
  const b = [n & 0x7f];
  while ((n >>= 7)) b.unshift((n & 0x7f) | 0x80);
  return b;
}
/* A type 0 MIDI file (480 ticks a quarter): tempo, time and key signatures, the guitar program, the notes. */
export function toMidi(draft, opts = {}) {
  const { notes, ts } = quantize(draft);
  const key = keyOf(draft), K = KEYS[key];
  const PPQ = 480;
  const ev = []; // [tick, order, bytes]
  const usPerQ = Math.round(60e6 / (draft.bpm * ts.beatQ));
  const name = Array.from(new TextEncoder().encode(draft.title || 'Untitled')).slice(0, 120);
  ev.push([0, 0, [0xff, 0x03, ...vlq(name.length), ...name]]);
  ev.push([0, 0, [0xff, 0x51, 0x03, (usPerQ >> 16) & 0xff, (usPerQ >> 8) & 0xff, usPerQ & 0xff]]);
  ev.push([0, 0, [0xff, 0x58, 0x04, ts.num, Math.log2(ts.den), ts.compound ? 36 : 24, 8]]);
  ev.push([0, 0, [0xff, 0x59, 0x02, K.fifths & 0xff, K.minor ? 1 : 0]]);
  ev.push([0, 0, [0xc0, (opts.program ?? 25) & 0x7f]]);
  notes.forEach(n => {
    const a = Math.round(n.s * PPQ), b = Math.round(n.e * PPQ);
    ev.push([a, 2, [0x90, n.midi & 0x7f, opts.velocity || 84]]);
    ev.push([b, 1, [0x80, n.midi & 0x7f, 0x40]]); // a note off sorts before a note on at the same tick
  });
  ev.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  const end = Math.max(Math.ceil((notes.length ? notes[notes.length - 1].e : 0) / ts.barQ - EPS), 1) * ts.barQ * PPQ;
  const trk = [];
  let last = 0;
  ev.forEach(([t, , bytes]) => { trk.push(...vlq(t - last), ...bytes); last = t; });
  trk.push(...vlq(Math.max(0, end - last)), 0xff, 0x2f, 0x00);
  const u32 = n => [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];
  return new Uint8Array([
    0x4d, 0x54, 0x68, 0x64, ...u32(6), 0, 0, 0, 1, (PPQ >> 8) & 0xff, PPQ & 0xff,
    0x4d, 0x54, 0x72, 0x6b, ...u32(trk.length), ...trk
  ]);
}

/* A file name from the title: letters, digits and dashes */
export const fileBase = draft => (draft.title || 'my-score').normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'my-score';
