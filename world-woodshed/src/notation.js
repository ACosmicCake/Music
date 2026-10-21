/* World Woodshed — staff notation: a small SVG renderer for one treble staff of monophonic
   guitar music (written an octave above sounding, as guitar music always is).
   No fonts needed: the clef, accidentals, rests and flags are drawn as paths, so it renders the
   same offline on every device. Nothing here touches the DOM until renderStaff() is called.

   Notes: { midi: writtenMidi | null (rest), dur: 'w'|'h'|'q'|'8'|'16', dot?, tie? (to the next note),
            spell?: '#'|'b' (how to spell a chromatic note) }
   A bar holding a single whole rest is a full-bar rest in any meter. */

const NS = 'http://www.w3.org/2000/svg';
const mod = (a, n) => ((a % n) + n) % n;

/* ---------- keys and spelling ---------- */
export const KEYS = {
  C: { fifths: 0, tonic: 0 }, G: { fifths: 1, tonic: 7 }, D: { fifths: 2, tonic: 2 }, A: { fifths: 3, tonic: 9 },
  E: { fifths: 4, tonic: 4 }, B: { fifths: 5, tonic: 11 }, 'F#': { fifths: 6, tonic: 6 },
  F: { fifths: -1, tonic: 5 }, Bb: { fifths: -2, tonic: 10 }, Eb: { fifths: -3, tonic: 3 }, Ab: { fifths: -4, tonic: 8 }, Db: { fifths: -5, tonic: 1 },
  Am: { fifths: 0, tonic: 9, minor: true }, Em: { fifths: 1, tonic: 4, minor: true }, Bm: { fifths: 2, tonic: 11, minor: true },
  'F#m': { fifths: 3, tonic: 6, minor: true }, Dm: { fifths: -1, tonic: 2, minor: true }, Gm: { fifths: -2, tonic: 7, minor: true },
  Cm: { fifths: -3, tonic: 0, minor: true }
};
const LETTERS = 'CDEFGAB';
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
const SHARP_ORDER = [3, 0, 4, 1, 5, 2, 6]; // F C G D A E B
const FLAT_ORDER = [6, 2, 5, 1, 4, 0, 3];  // B E A D G C F
const SHARP_POS = [8, 5, 9, 6, 3, 7, 4];   // staff positions (0 = bottom line E4) of the sharps in a treble key signature
const FLAT_POS = [4, 7, 3, 6, 2, 5, 1];

export function keyName(key) {
  const k = KEYS[key] ? key : 'C';
  return k.replace('b', '♭').replace('#', '♯').replace(/m$/, ' minor') + (KEYS[k].minor ? '' : ' major');
}
/* alteration of each letter C..B in a key signature */
export function keyAlters(fifths) {
  const a = [0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < Math.abs(fifths); i++) { if (fifths > 0) a[SHARP_ORDER[i]] = 1; else a[FLAT_ORDER[i]] = -1; }
  return a;
}
/* pitch classes of the key's scale (natural minor for minor keys) */
export function keyScale(key) {
  const k = KEYS[key] || KEYS.C;
  return (k.minor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11]).map(x => (k.tonic + x) % 12);
}
const ACC_TEXT = { '-2': '𝄫', '-1': '♭', 0: '', 1: '♯', 2: '𝄪' };
function mkSpell(midi, L, alter) {
  const octave = Math.floor((midi - alter) / 12) - 1;
  const step = octave * 7 + L;
  return { letter: LETTERS[L], alter, octave, step, pos: step - 30, name: LETTERS[L] + ACC_TEXT[alter] };
}
/* Spell a written MIDI note in a key. pref '#' or 'b' picks the spelling of a chromatic note;
   otherwise naturals win, then sharps (sharp keys, minor keys, C) or flats (flat keys). */
export function spell(midi, key = 'C', pref) {
  const k = KEYS[key] || KEYS.C, alt = keyAlters(k.fifths), pc = mod(midi, 12);
  for (let L = 0; L < 7; L++) if (mod(LETTER_PC[L] + alt[L], 12) === pc) return mkSpell(midi, L, alt[L]);
  for (let L = 0; L < 7; L++) if (LETTER_PC[L] === pc) return mkSpell(midi, L, 0);
  const dir = pref === '#' ? 1 : pref === 'b' ? -1 : (k.fifths < 0 && !k.minor ? -1 : 1);
  for (let L = 0; L < 7; L++) if (mod(LETTER_PC[L] + dir, 12) === pc) return mkSpell(midi, L, dir);
  return mkSpell(midi, 0, 0);
}

/* ---------- durations and meters ---------- */
export const DUR = { w: 4, h: 2, q: 1, 8: 0.5, 16: 0.25 };
export const durQ = n => DUR[n.dur] * (n.dot ? 1.5 : 1);
export function parseTime(time = '4/4') {
  const [num, den] = String(time).split('/').map(Number);
  const barQ = num * 4 / den;
  const compound = den === 8 && num % 3 === 0;
  const beatQ = compound ? 1.5 : 4 / den;
  return { num, den, barQ, beatQ, compound, beats: Math.round(barQ / beatQ) };
}

/* ---------- glyphs (staff space = 10 units, staff top line at y = 0) ---------- */
const CLEF = 'M14.6 31.9 14.2 31.7 13.6 31.4 13 31.2 12.3 30.9 11.7 30.5 11.3 30 11.1 29.5 10.9 29 10.8 28.4 10.7 27.9 10.7 27.3 10.9 26.8 11 26.4 11.2 26.1 11.4 25.7 11.8 25 12.2 24.3 12.7 23.6 13.2 23 13.7 22.5 14.2 22.1 15 21.8 16 21.7 17.1 21.8 18.3 21.9 19.4 22.2 20.4 22.8 21 23.6 21.5 24.4 21.9 25.4 22.3 26.4 22.6 27.5 22.9 28.6 23 29.7 23 30.7 22.9 31.7 22.8 32.9 22.6 34.1 22.3 35.2 21.9 36.4 21.5 37.4 21.1 38.3 20.5 39.1 19.9 40 19.1 40.9 18.2 41.7 17.3 42.4 16.4 43 15.5 43.5 14.6 43.9 13.6 44.2 12.5 44.4 11.4 44.5 10.3 44.5 9.2 44.4 8.2 44.1 7.6 43.3 6.9 42.4 6.3 41.5 5.8 40.5 5.3 39.4 4.9 38.4 4.6 37.4 4.5 36.5 4.4 35.5 4.4 34.6 4.4 33.6 4.5 32.5 4.6 31.5 4.8 30.4 5.1 29.3 5.4 28.1 5.8 26.9 6.3 25.7 6.8 24.5 7.4 23.3 8 22.1 8.6 21.1 9.4 20 10.2 18.9 11.1 17.8 12 16.7 12.9 15.5 13.8 14.3 14.7 13.2 15.5 12.1 16.4 10.9 17.2 9.7 18 8.5 18.8 7.3 19.5 6.1 20.1 4.9 20.7 3.6 21.2 2.4 21.6 1.2 22 -0.1 22.3 -1.4 22.5 -2.6 22.6 -3.9 22.7 -5.2 22.6 -6.5 22.6 -7.7 22.4 -9 22.1 -10.2 21.8 -11.3 21.3 -12.4 20.8 -13.5 20.1 -14.6 19.5 -15.6 18.7 -16.4 17.9 -17 17.1 -17.3 16.4 -17.7 15.5 -17.8 14.6 -17.6 13.7 -17.1 12.9 -16.4 12.1 -15.6 11.6 -14.6 11.1 -13.5 10.7 -12.3 10.4 -11 10.2 -9.6 10 -8.2 9.9 -6.6 9.8 -5 9.9 -3.3 10 -1.6 10.3 0.2 10.5 2.1 10.8 4 11 6 11.2 8.1 11.4 10.3 11.7 12.7 11.9 15.1 12.1 17.6 12.3 20.1 12.5 22.6 12.7 25.1 12.9 27.6 13.1 30.2 13.3 32.8 13.5 35.4 13.7 37.8 13.8 40.1 13.9 42.1 14 43.8 14.1 45.3 14.1 46.7 14.2 47.8 14.1 48.9 14.1 49.9 13.9 50.8 13.8 51.7 13.5 52.6 13.3 53.4 13 54 12.7 54.6 12.4 55.1 12.1 55.5 11.8 55.9 11.4 56.2 10.9 56.5 10.3 56.7 9.7 56.9 9.2 57 8.6 57.1 8.2 56.9 7.8 56.4 7.4 55.9 7 55.4 6.6 54.9 6.2 54.5 5.9 54.2 5.1 54.8 5.3 55.1 5.6 55.6 6 56.2 6.5 56.8 7.1 57.3 7.8 57.6 8.4 57.9 9 58.2 9.8 58.4 10.6 58.4 11.4 58.4 12.2 58.2 13.1 57.9 13.9 57.5 14.5 56.8 15.1 56.1 15.5 55.2 15.9 54.3 16.2 53.3 16.5 52.3 16.7 51.2 16.8 50.1 16.8 49 16.8 47.8 16.7 46.5 16.7 45.2 16.6 43.7 16.5 41.9 16.4 39.9 16.2 37.6 16.1 35.2 15.9 32.6 15.7 30 15.5 27.4 15.3 24.9 15.1 22.4 14.9 19.9 14.6 17.4 14.4 14.9 14.2 12.5 14 10.1 13.8 7.9 13.6 5.8 13.3 3.7 13.1 1.8 13 -0.1 12.8 -1.8 12.8 -3.4 12.8 -5 12.8 -6.5 12.9 -7.9 13.1 -9.3 13.2 -10.5 13.5 -11.6 13.7 -12.6 14 -13.4 14.4 -14.1 14.8 -14.7 15.2 -15.3 15.7 -15.7 16.1 -16.1 16.4 -16.4 16.9 -16.7 17.2 -16.3 17.6 -15.6 18 -14.7 18.4 -13.7 18.8 -12.7 19.1 -11.7 19.2 -10.7 19.3 -9.7 19.3 -8.7 19.2 -7.7 19.1 -6.6 19 -5.5 18.8 -4.4 18.5 -3.4 18.2 -2.4 17.9 -1.3 17.5 -0.3 17.1 0.7 16.6 1.8 16.1 2.9 15.5 3.9 14.9 5 14.2 6 13.5 7.1 12.7 8.2 11.9 9.4 11 10.5 10.2 11.7 9.4 12.8 8.5 13.8 7.6 15 6.6 16.1 5.7 17.3 4.8 18.6 4 19.9 3.3 21.2 2.6 22.6 2 24 1.5 25.4 1 26.8 0.7 28.2 0.4 29.6 0.2 30.9 0.1 32.3 0.1 33.6 0.3 34.9 0.5 36.2 0.9 37.4 1.4 38.6 2 39.7 2.7 40.9 3.6 42 4.5 43 5.5 43.8 6.6 44.5 7.8 44.9 8.8 45.5 9.9 46 11.2 46.4 12.5 46.6 13.8 46.7 15.2 46.7 16.5 46.5 17.8 46.1 19.1 45.5 20.5 44.8 21.7 44 22.9 43 24 41.9 24.9 40.7 25.7 39.4 26.3 37.9 26.7 36.4 27 34.8 27.2 33.3 27.2 31.8 27 30.3 26.7 28.9 26.2 27.6 25.5 26.3 24.8 25.1 24 24 23 23.1 22 22.4 20.9 21.9 19.7 21.5 18.6 20.9 17.3 20.5 16.1 20.2 14.9 20 13.8 19.9 12.6 20.1 11.4 20.6 10.4 21.3 9.6 22.2 8.8 23 8.2 23.9 7.8 24.9 7.6 25.9 7.7 26.9 8 27.8 8.4 28.6 8.9 29.4 9.4 30 9.9 30.5 10.6 30.8 11.4 31.1 12.1 31.3 12.8 31.6 13.5 31.9 14 32 14.4 32.1Z';
const CLEF_BALL = [7, 53.6, 3.5];
function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
  if (parent) parent.append(e);
  return e;
}
const f1 = v => Math.round(v * 100) / 100;

/* accidental glyph centred on (x, y); returns the element */
function accidental(g, alter, x, y) {
  const p = [];
  if (alter === 1) {
    p.push(`M${f1(x - 2.6)} ${f1(y - 8.5)}h1.2v18h-1.2z`, `M${f1(x + 1.4)} ${f1(y - 10)}h1.2v18h-1.2z`);
    [-2.6, 3].forEach(o => p.push(`M${f1(x - 4.6)} ${f1(y + o + 1.4)}L${f1(x + 4.6)} ${f1(y + o - 1.8)}v2.6L${f1(x - 4.6)} ${f1(y + o + 4)}z`));
  } else if (alter === -1) {
    p.push(`M${f1(x - 3.4)} ${f1(y - 13)}h1.2v17.5h-1.2z`,
      `M${f1(x - 2.4)} ${f1(y - 1.2)}C${f1(x + 0.6)} ${f1(y - 4.6)} ${f1(x + 5.4)} ${f1(y - 4.2)} ${f1(x + 4.4)} ${f1(y - 0.6)}C${f1(x + 3.6)} ${f1(y + 1.8)} ${f1(x)} ${f1(y + 3.2)} ${f1(x - 2.4)} ${f1(y + 4.5)}z` +
      `M${f1(x - 2.4)} ${f1(y + 2.8)}C${f1(x - 0.6)} ${f1(y + 1.6)} ${f1(x + 2.9)} ${f1(y - 0.4)} ${f1(x + 2.6)} ${f1(y - 2)}C${f1(x + 2.3)} ${f1(y - 3.3)} ${f1(x - 0.4)} ${f1(y - 2.5)} ${f1(x - 2.4)} ${f1(y - 0.2)}z`);
  } else if (alter === 0) {
    p.push(`M${f1(x - 3)} ${f1(y - 10)}h1.1v14h-1.1z`, `M${f1(x + 1.9)} ${f1(y - 4)}h1.1v14h-1.1z`);
    [-1.6, 4].forEach(o => p.push(`M${f1(x - 3)} ${f1(y + o)}L${f1(x + 3)} ${f1(y + o - 2.2)}v2.5L${f1(x - 3)} ${f1(y + o + 2.5)}z`));
  } else if (alter === 2) {
    p.push(`M${f1(x - 3.5)} ${f1(y - 3.5)}l7 7m0 -7l-7 7`);
    return el('path', { d: p.join(''), stroke: 'currentColor', 'stroke-width': 1.8, fill: 'none' }, g);
  } else if (alter === -2) {
    const gg = el('g', {}, g);
    accidental(gg, -1, x - 3, y); accidental(gg, -1, x + 3, y);
    return gg;
  }
  return el('path', { d: p.join(''), fill: 'currentColor', 'fill-rule': alter === -1 ? 'evenodd' : 'nonzero' }, g);
}
const ACC_W = { 1: 10, '-1': 8, 0: 7, 2: 9, '-2': 13 };

function ellipsePath(cx, cy, rx, ry, rot) {
  const t = rot * Math.PI / 180, dx = rx * Math.cos(t), dy = rx * Math.sin(t);
  return `M${f1(cx - dx)} ${f1(cy - dy)}A${rx} ${ry} ${rot} 1 0 ${f1(cx + dx)} ${f1(cy + dy)}A${rx} ${ry} ${rot} 1 0 ${f1(cx - dx)} ${f1(cy - dy)}z`;
}
function notehead(g, dur, x, y) {
  if (dur === 'w') return el('path', { d: ellipsePath(x, y, 7.2, 4.6, 0) + ellipsePath(x + 0.2, y, 3.6, 2.4, 55), fill: 'currentColor', 'fill-rule': 'evenodd' }, g);
  if (dur === 'h') return el('path', { d: ellipsePath(x, y, 5.9, 4.1, -22) + ellipsePath(x, y, 4.4, 1.9, -30), fill: 'currentColor', 'fill-rule': 'evenodd' }, g);
  return el('path', { d: ellipsePath(x, y, 5.9, 4.1, -22), fill: 'currentColor' }, g);
}
/* flag(s) hanging off a stem tip; dir -1 = stem up, +1 = stem down */
function flags(g, n, sx, sy, dir) {
  for (let k = 0; k < n; k++) {
    const y0 = sy - dir * k * 7.5, s = -dir; // s: +1 flag goes down the page (stem up)
    el('path', { d: `M${f1(sx)} ${f1(y0)}C${f1(sx + 0.6)} ${f1(y0 + s * 6.5)} ${f1(sx + 10.5)} ${f1(y0 + s * 9.5)} ${f1(sx + 8)} ${f1(y0 + s * (k === n - 1 ? 22 : 16))}C${f1(sx + 9.2)} ${f1(y0 + s * 12.5)} ${f1(sx + 3)} ${f1(y0 + s * 10.5)} ${f1(sx)} ${f1(y0 + s * 8.5)}z`, fill: 'currentColor' }, g);
  }
}
function rest(g, dur, x) {
  if (dur === 'w') return el('rect', { x: f1(x - 6), y: 10, width: 12, height: 5, fill: 'currentColor' }, g);
  if (dur === 'h') return el('rect', { x: f1(x - 6), y: 15, width: 12, height: 5, fill: 'currentColor' }, g);
  if (dur === 'q') {
    const d = `M${x - 2.2} 5.5L${x + 4.6} 14.2Q${x + 0.4} 17.6 ${x + 1.2} 20.6L${x + 5.2} 27.4Q${x - 1.2} 24.8 ${x - 1.6} 29.4Q${x - 1.6} 32.8 ${x + 2} 35.6Q${x - 5.6} 33.2 ${x - 4.8} 28.2Q${x - 4.2} 24 ${x + 0.6} 24.6L${x - 3.6} 18.2Q${x + 0.6} 13.8 ${x - 0.2} 10.8Z`;
    return el('path', { d: d.replace(/\d+\.\d{3,}/g, m => (+m).toFixed(2)), fill: 'currentColor' }, g);
  }
  const n = dur === '16' ? 2 : 1;
  const top = 12.6, bot = n === 2 ? 36 : 29;
  const sx0 = x + 4.6, slope = (sx0 - (x - 1.6 - (n - 1) * 2.4)) / (bot - top);
  const grp = el('g', {}, g);
  el('path', { d: `M${f1(sx0)} ${top}L${f1(sx0 - slope * (bot - top))} ${bot}`, stroke: 'currentColor', 'stroke-width': 1.4, fill: 'none' }, grp);
  for (let k = 0; k < n; k++) {
    const by = 15.5 + k * 10, sxk = sx0 - slope * (by - 2.4 - top);
    const bx = x - 2.2 - k * 2.6;
    el('circle', { cx: f1(bx), cy: by, r: 2.5, fill: 'currentColor' }, grp);
    el('path', { d: `M${f1(bx)} ${by + 1.6}Q${f1((bx + sxk) / 2 + 0.5)} ${by + 2.6} ${f1(sxk + 0.4)} ${f1(by - 2.6)}`, stroke: 'currentColor', 'stroke-width': 1.3, fill: 'none' }, grp);
  }
  return grp;
}

/* ---------- the renderer ---------- */
const SPACE = q => 6 + 8.5 * Math.log2(1 + 4 * q); // horizontal room a note needs, by length in quarters
const LEFT = 9, RIGHT = 5;                         // padding inside each bar
const STEM = 34;

/* opts: { bars: [[note…]…], key, time, width (CSS px of the container), barsPerLine (max, default 4),
           scale (CSS px per unit; default 1; below 480 px the largest of 1 to 0.76 that fits 2 bars a line), lyrics: [text per note], label,
           showTime (default true), endBar: 'final' | 'single' | 'none' }
   returns { el, noteEls, items, xOf(i), posOf(i), mark(i, 'now'|'good'|'bad'|null), clearMarks(), cursor(i|null) };
   i is the index of a note or rest counting through all bars. */
export function renderStaff(opts) {
  const bars = opts.bars || [];
  const key = KEYS[opts.key] ? opts.key : 'C', K = KEYS[key];
  const ts = parseTime(opts.time || '4/4');
  const widthPx = opts.width || 600;
  const narrow = widthPx < 480;
  const maxPer = opts.barsPerLine || (narrow ? 2 : 4);
  const keyAlt = keyAlters(K.fifths), nKey = Math.abs(K.fifths);

  /* 1. flatten, spell, decide accidentals, measure */
  const items = [];
  const barInfo = bars.map((bar, bi) => {
    const state = {};
    let onset = 0;
    const full = bar.length === 1 && bar[0].midi == null && bar[0].dur === 'w';
    const list = bar.map((n, j) => {
      const q = full ? ts.barQ : durQ(n);
      const it = { i: items.length, bar: bi, onset, q, n, rest: n.midi == null, full };
      onset += q;
      if (!it.rest) {
        const sp = spell(n.midi, key, n.spell);
        it.sp = sp;
        const prev = items[items.length - 1];
        const cur = sp.step in state ? state[sp.step] : keyAlt[LETTERS.indexOf(sp.letter)];
        const tiedIn = prev && !prev.rest && prev.n.tie && prev.n.midi === n.midi;
        // a note tied over from the one before keeps its accidental without repeating it
        if (cur !== sp.alter && !tiedIn) it.acc = sp.alter;
        state[sp.step] = sp.alter;
      }
      it.lead = it.acc !== undefined ? ACC_W[it.acc] : 0;
      it.space = full ? 40 : SPACE(q) + (n.dot ? 4 : 0) + (!it.rest && (n.dur === '8' || n.dur === '16') ? 2 : 0);
      items.push(it);
      return it;
    });
    const spring = list.reduce((a, x) => a + x.space, 0);
    const lead = list.reduce((a, x) => a + x.lead, 0);
    return { list, spring, min: LEFT + RIGHT + spring + lead, full };
  });

  /* 2. systems: the fewest lines that fit, with bars spread evenly */
  const header = first => 4 + 32 + (nKey ? nKey * 8 + 6 : 0) + (first && opts.showTime !== false ? 24 : 0);
  function pack(W) {
    for (let n = Math.ceil(bars.length / maxPer) || 1; n <= Math.max(1, bars.length); n++) {
      const sizes = []; let left = bars.length;
      for (let k = 0; k < n; k++) { const sz = Math.ceil(left / (n - k)); sizes.push(sz); left -= sz; }
      let start = 0, ok = true; const sys = [];
      sizes.forEach((sz, k) => {
        const bs = barInfo.slice(start, start + sz);
        const need = header(k === 0) + bs.reduce((a, b) => a + b.min, 0) + 4;
        if (need > W) ok = false;
        sys.push({ bars: bs, first: start, need }); start += sz;
      });
      if (ok || n === Math.max(1, bars.length)) return sys;
    }
    return [];
  }
  // on narrow screens, the largest staff that still fits maxPer bars a line (down to 0.76 px per unit)
  let scale = opts.scale || 1, W = Math.round(widthPx / scale), systems = pack(W);
  if (!opts.scale && narrow) {
    const want = Math.ceil(bars.length / maxPer) || 1;
    for (const sc of [1, 0.92, 0.84, 0.76]) {
      scale = sc; W = Math.round(widthPx / sc); systems = pack(W);
      if (systems.length <= want) break;
    }
  }
  const VW = Math.max(W, ...systems.map(s => s.need));

  /* 3. horizontal positions */
  systems.forEach((sy, si) => {
    sy.x0 = header(si === 0);
    const springs = sy.bars.reduce((a, b) => a + b.spring, 0) || 1;
    const extra = Math.max(0, VW - 4 - sy.x0 - sy.bars.reduce((a, b) => a + b.min, 0));
    let x = sy.x0;
    sy.bars.forEach(b => {
      b.x0 = x;
      const k = 1 + extra / springs;
      let cx = x + LEFT;
      b.list.forEach(it => {
        cx += it.lead;
        it.x = cx + 6; it.sys = si;
        cx += it.space * k;
      });
      if (b.full) b.list[0].x = x + (cx + RIGHT - x) / 2;
      x = cx + RIGHT; b.x1 = x;
    });
    sy.x1 = x;
  });

  /* 4. beams and stems */
  const ypos = p => (8 - p) * 5;
  barInfo.forEach(b => {
    let grp = [];
    const flush = () => { if (grp.length > 1) { const g = { notes: grp }; grp.forEach(it => { it.beam = g; }); } grp = []; };
    b.list.forEach(it => {
      const beamable = !it.rest && (it.n.dur === '8' || it.n.dur === '16') && !it.full;
      const beat = Math.floor(it.onset / ts.beatQ + 1e-6), endBeat = Math.floor((it.onset + it.q) / ts.beatQ - 1e-6);
      if (!beamable || beat !== endBeat) { flush(); return; }
      if (grp.length && grp[0].beat !== beat) flush();
      it.beat = beat; grp.push(it);
    });
    flush();
  });
  items.forEach(it => {
    if (it.rest) return;
    it.y = ypos(it.sp.pos);
    if (!it.beam) it.up = it.sp.pos < 4;
  });
  const beams = new Set(items.filter(it => it.beam).map(it => it.beam));
  beams.forEach(bm => {
    const ps = bm.notes.map(it => it.sp.pos);
    const above = Math.max(...ps) - 4, below = 4 - Math.min(...ps);
    const up = above === below ? ps.reduce((a, p) => a + p - 4, 0) < 0 : below > above;
    bm.up = up;
    const d = up ? -1 : 1;
    bm.notes.forEach(it => { it.up = up; it.sx = it.x + (up ? 5.5 : -5.5); });
    const a = bm.notes[0], z = bm.notes[bm.notes.length - 1];
    let slant = Math.max(-7, Math.min(7, (z.y - a.y) * 0.45));
    const inner = bm.notes.slice(1, -1);
    if (inner.some(it => (up ? it.y < Math.min(a.y, z.y) : it.y > Math.max(a.y, z.y)))) slant = 0;
    const span = (z.sx - a.sx) || 1;
    const lvl2 = bm.notes.some(it => it.n.dur === '16');
    const len = STEM + (lvl2 ? 3 : 0);
    let c = up ? Math.min(...bm.notes.map(it => it.y - len - slant * (it.sx - a.sx) / span))
      : Math.max(...bm.notes.map(it => it.y + len - slant * (it.sx - a.sx) / span));
    const ends = [c, c + slant];
    if (up && Math.max(...ends) > 20) c -= Math.max(...ends) - 20;
    if (!up && Math.min(...ends) < 20) c += 20 - Math.min(...ends);
    bm.yAt = x => c + slant * (x - a.sx) / span;
    bm.d = d;
  });

  /* 5. draw */
  const svg = el('svg', { class: 'ww-staff' + (opts.cls ? ' ' + opts.cls : ''), role: 'img', 'aria-label': opts.label || 'Music notation' });
  const noteEls = new Array(items.length);
  const sysGroups = [];
  const ties = [];
  systems.forEach((sy, si) => {
    const g = el('g', { class: 'st-sys' }, svg);
    sysGroups.push(g);
    let minY = -24, maxY = 64;
    const track = (y0, y1) => { minY = Math.min(minY, y0, y1); maxY = Math.max(maxY, y0, y1); };
    for (let l = 0; l < 5; l++) el('line', { class: 'st-line', x1: 0, x2: f1(sy.x1), y1: l * 10, y2: l * 10 }, g);
    const clef = el('g', { class: 'st-clef', transform: 'translate(4 0)' }, g);
    el('path', { d: CLEF, fill: 'currentColor' }, clef);
    el('circle', { cx: CLEF_BALL[0], cy: CLEF_BALL[1], r: CLEF_BALL[2], fill: 'currentColor' }, clef);
    for (let k = 0; k < nKey; k++) {
      const pos = (K.fifths > 0 ? SHARP_POS : FLAT_POS)[k];
      accidental(g, K.fifths > 0 ? 1 : -1, 40 + k * 8 + 4, ypos(pos)).setAttribute('class', 'st-key');
    }
    if (si === 0 && opts.showTime !== false) {
      const tx = 36 + (nKey ? nKey * 8 + 6 : 0) + 10;
      [[ts.num, 10], [ts.den, 30]].forEach(([v, y]) => el('text', { class: 'st-time', x: tx, y: y + 0.5, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, g).textContent = v);
    }
    // bar lines
    sy.bars.forEach((b, k) => {
      const isLast = sy.first + k === bars.length - 1;
      const end = isLast ? (opts.endBar || (opts.final === false ? 'single' : 'final')) : 'single';
      if (end === 'none') return;
      if (end === 'final') {
        el('rect', { class: 'st-bar', x: f1(b.x1 - 4), y: 0, width: 4, height: 40 }, g);
        el('rect', { class: 'st-bar', x: f1(b.x1 - 8.5), y: 0, width: 1.3, height: 40 }, g);
      } else el('rect', { class: 'st-bar', x: f1(b.x1 - 1.3), y: 0, width: 1.3, height: 40 }, g);
    });
    // notes
    sy.bars.forEach(b => b.list.forEach(it => {
      const ng = el('g', { class: 'nt' + (it.rest ? ' rest' : ''), 'data-i': it.i, 'data-midi': it.rest ? null : it.n.midi }, g);
      noteEls[it.i] = ng;
      const n = it.n, x = it.x;
      if (it.rest) {
        rest(ng, it.full ? 'w' : n.dur, x);
        if (n.dot && !it.full) el('circle', { cx: f1(x + 9), cy: 15, r: 1.6, fill: 'currentColor' }, ng);
        return;
      }
      const p = it.sp.pos, y = it.y;
      for (let lp = -2; lp >= p; lp -= 2) el('rect', { x: f1(x - 9.5), y: f1(ypos(lp) - 0.6), width: 19, height: 1.2, fill: 'currentColor' }, ng);
      for (let lp = 10; lp <= p; lp += 2) el('rect', { x: f1(x - 9.5), y: f1(ypos(lp) - 0.6), width: 19, height: 1.2, fill: 'currentColor' }, ng);
      if (it.acc !== undefined) accidental(ng, it.acc, x - 6 - ACC_W[it.acc] / 2 - 1.5, y);
      notehead(ng, n.dur, x, y);
      track(y - 6, y + 6);
      if (n.dot) { const dy = p % 2 === 0 ? y - 5 : y; el('circle', { cx: f1(x + (it.up && !it.beam && (n.dur === '8' || n.dur === '16') ? 16 : 9.5)), cy: dy, r: 1.7, fill: 'currentColor' }, ng); }
      if (n.dur === 'w') return;
      const sx = it.beam ? it.sx : x + (it.up ? 5.5 : -5.5);
      let sy2;
      if (it.beam) sy2 = it.beam.yAt(sx);
      else {
        const extra = n.dur === '16' ? 4 : 0;
        sy2 = it.up ? Math.min(y - STEM - extra, 20) : Math.max(y + STEM + extra, 20);
      }
      const sy1 = y + (it.up ? -1.2 : 1.2);
      el('rect', { x: f1(sx - 0.65), y: f1(Math.min(sy1, sy2)), width: 1.3, height: f1(Math.abs(sy2 - sy1)), fill: 'currentColor' }, ng);
      track(sy2, sy2);
      if (!it.beam && (n.dur === '8' || n.dur === '16')) flags(ng, n.dur === '16' ? 2 : 1, sx + (it.up ? 0.6 : -0.6), sy2, it.up ? -1 : 1);
    }));
    // beams
    beams.forEach(bm => {
      if (bm.notes[0].sys !== si) return;
      const bg = el('g', { class: 'st-beam' }, g);
      const T = 4.6, d = bm.d; // d = +1 stems down (beam below), -1 stems up
      const seg = (x1, x2, off) => {
        const y1 = bm.yAt(x1) - d * off, y2 = bm.yAt(x2) - d * off;
        el('path', { d: `M${f1(x1 - 0.65)} ${f1(y1)}L${f1(x2 + 0.65)} ${f1(y2)}L${f1(x2 + 0.65)} ${f1(y2 - d * T)}L${f1(x1 - 0.65)} ${f1(y1 - d * T)}z`, fill: 'currentColor' }, bg);
        track(y1 - d * T, y2 - d * T);
      };
      const ns = bm.notes;
      seg(ns[0].sx, ns[ns.length - 1].sx, 0);
      ns.forEach((it, j) => {
        if (it.n.dur !== '16') return;
        const nx = ns[j + 1], pv = ns[j - 1];
        if (nx && nx.n.dur === '16') seg(it.sx, nx.sx, 7.5);
        else if (!(pv && pv.n.dur === '16')) {
          const left = j === ns.length - 1 || (pv && pv.n.dot);
          if (left) seg(it.sx - 9, it.sx, 7.5); else seg(it.sx, it.sx + 9, 7.5);
        }
      });
    });
    sy.minY = minY; sy.maxY = maxY; sy.g = g; sy.track = track;
  });
  // ties (may cross a line break)
  items.forEach((it, i) => {
    const nx = items[i + 1];
    if (it.rest || !it.n.tie || !nx || nx.rest || nx.n.midi !== it.n.midi) return;
    const below = it.n.dur === 'w' ? it.sp.pos < 4 : it.up;
    const s = below ? 1 : -1;
    const draw = (sys, x1, x2, y) => {
      const yy = y + s * 6, h = Math.min(7, 3 + (x2 - x1) * 0.06);
      const mx = (x1 + x2) / 2;
      el('path', { class: 'st-tie', d: `M${f1(x1)} ${f1(yy)}Q${f1(mx)} ${f1(yy + s * h * 2)} ${f1(x2)} ${f1(yy)}Q${f1(mx)} ${f1(yy + s * (h * 2 - 3))} ${f1(x1)} ${f1(yy)}z`, fill: 'currentColor' }, systems[sys].g);
      systems[sys].track(yy, yy + s * h * 1.2);
    };
    if (nx.sys === it.sys) draw(it.sys, it.x + 6, nx.x - 6, it.y);
    else { draw(it.sys, it.x + 6, systems[it.sys].x1 + 2, it.y); draw(nx.sys, systems[nx.sys].x0 - 4, nx.x - 6, nx.y); }
  });
  // lyrics / counts under the staff
  if (opts.lyrics) systems.forEach(sy => {
    const ly = Math.max(sy.maxY, 50) + 14;
    sy.bars.forEach(b => b.list.forEach(it => {
      const t = opts.lyrics[it.i]; if (!t) return;
      el('text', { class: 'st-lyr', x: f1(it.x), y: ly, 'text-anchor': 'middle' }, sy.g).textContent = t;
    }));
    sy.maxY = ly + 4;
  });

  /* 6. stack the systems */
  let y = 0;
  systems.forEach((sy, si) => {
    const top = y - sy.minY + (si ? 6 : 2);
    sy.top = top;
    sy.g.setAttribute('transform', `translate(0 ${f1(top)})`);
    y = top + sy.maxY;
  });
  const H = Math.ceil(y + 4);
  svg.setAttribute('viewBox', `0 0 ${f1(VW)} ${H}`);
  svg.setAttribute('width', f1(VW * scale));
  svg.style.maxWidth = '100%';
  svg.style.height = 'auto';

  // the cursor: a soft band over the current note
  const cur = el('rect', { class: 'st-cur', x: -9, y: -18, width: 18, height: 76, rx: 4, visibility: 'hidden' }, null);
  svg.insertBefore(cur, svg.firstChild);
  const posOf = i => { const it = items[i]; if (!it) return null; return { x: it.x, y: systems[it.sys].top, sys: it.sys, bar: it.bar, onset: it.onset }; };
  return {
    el: svg, noteEls, items, systems: systems.length, width: VW, height: H,
    xOf: i => (items[i] ? items[i].x : null),
    posOf,
    mark(i, cls) { const e = noteEls[i]; if (!e) return; e.classList.remove('now', 'good', 'bad', 'near'); if (cls) cls.split(' ').forEach(c => e.classList.add(c)); },
    clearMarks() { noteEls.forEach(e => e && e.classList.remove('now', 'good', 'bad', 'near')); },
    cursor(i) {
      const p = i === null || i === undefined ? null : posOf(i);
      if (!p) { cur.setAttribute('visibility', 'hidden'); return; }
      const jump = cur.dataset.sys !== String(p.sys);
      cur.dataset.sys = p.sys;
      cur.style.transition = jump ? 'none' : '';
      cur.setAttribute('visibility', 'visible');
      cur.style.transform = `translate(${f1(p.x)}px, ${f1(p.y)}px)`;
    }
  };
}
