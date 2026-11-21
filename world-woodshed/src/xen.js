/* Tuning systems other than 12 equal (plain functions, test/xen.test.js): Bohlen-Pierce, other equal
   divisions of any interval, just ratios and Scala .scl files, for the tuner and the fret calculator.
   Every system here can be fretted with straight frets (a refret or zip ties on a normal guitar): a system is
   one list of steps, in cents above the open string, repeated every period (an octave, or a tritave 3:1 in
   Bohlen-Pierce), and fret k sits where step k does on every string. */

export const cents = r => 1200 * Math.log2(r);

/* Bohlen-Pierce note names, step 0 being C (as in Bohlen's and the usual BP charts) */
export const BP_NAMES = ['C', 'D♭', 'D', 'E', 'F', 'G♭', 'G', 'H', 'J♭', 'J', 'A', 'B♭', 'B'];
/* 26 equal steps of the tritave split each BP step in two: the even steps are the BP notes, an odd one the
   BP note below raised half a step, written with ↑ (C, C↑, D♭, D♭↑ … B, B↑) */
export const BP26_NAMES = BP_NAMES.flatMap(x => [x, x + '↑']);

/* A pitch as Scala writes one: with a dot it is cents ("701.955"), otherwise a ratio ("3/2", "2"). Returns
   cents, or null when it is not one. */
export function pitchCents(t) {
  t = String(t == null ? '' : t).trim();
  if (/^-?\d*\.\d*$/.test(t) && /\d/.test(t)) return +t;
  const m = /^(\d+)(?:\s*\/\s*(\d+))?$/.exec(t);
  if (!m) return null;
  const a = +m[1], b = m[2] ? +m[2] : 1;
  return a > 0 && b > 0 ? cents(a / b) : null;
}

/* A Scala .scl file: '!' lines are comments, then a description, the number of pitches and the pitches
   (the first word of each line), the last being the period. Returns { name, period, steps } or { error }. */
export function parseScl(text) {
  const lines = String(text || '').split(/\r?\n/).filter(l => !/^\s*!/.test(l));
  if (lines.length < 2) return { error: 'A Scala file has a description line, a count, then the pitches.' };
  const name = lines[0].trim(), count = parseInt(lines[1], 10);
  if (!(count > 0)) return { error: 'The second line should be how many pitches follow.' };
  const ps = lines.slice(2).map(l => l.trim()).filter(Boolean).slice(0, count).map(l => pitchCents(l.split(/\s+/)[0]));
  if (ps.length < count) return { error: 'The file lists ' + count + ' pitches but has ' + ps.length + '.' };
  if (ps.some(c => c === null)) return { error: 'A pitch could not be read: write ratios like 3/2 or cents like 701.955.' };
  const period = ps[ps.length - 1];
  return Object.assign(scaleOf(ps.slice(0, -1), period), { name: name || 'Scala scale' });
}

/* steps from a list of cents inside a period: 0 first, sorted, repeats and anything outside dropped */
function scaleOf(list, period) {
  if (!(period > 1)) return { error: 'The period has to be wider than a unison.' };
  const steps = [0];
  list.filter(c => c > 0.5 && c < period - 0.5).sort((a, b) => a - b).forEach(c => { if (c - steps[steps.length - 1] > 0.5) steps.push(c); });
  return { period, steps };
}

/* Build a system from its recipe:
   { kind: 'ed', n, of: '2/1' }  n equal steps of an interval (n-EDO when it is the octave)
   { kind: 'ji', ratios: '9/8 5/4 …', of: '2/1' }  just ratios repeated every period
   { kind: 'scl', text }  a Scala file
   Returns { id, name, period, steps, names, std } or { error }. */
export function build(spec) {
  if (!spec || typeof spec !== 'object') return { error: 'No tuning system.' };
  let out;
  if (spec.kind === 'ed') {
    const n = Math.round(+spec.n), period = pitchCents(spec.of || '2/1');
    if (!(n >= 1 && n <= 200)) return { error: 'Choose between 1 and 200 steps.' };
    if (period === null) return { error: 'Write the interval as a ratio such as 2/1 or 3/1, or in cents.' };
    out = scaleOf(Array.from({ length: n - 1 }, (_, i) => (i + 1) * period / n), period);
    if (!out.error) {
      const octave = Math.abs(period - 1200) < 0.01, tritave = Math.abs(period - cents(3)) < 0.01;
      out.name = spec.name || (octave ? n + ' equal (' + n + '-EDO)' : tritave && n === 13 ? 'Bohlen-Pierce, 13 equal steps of 3:1' : tritave && n === 26 ? 'Bohlen-Pierce, 26 equal steps of 3:1 (26EDT)' : n + ' equal steps of ' + (spec.of || '2/1'));
      if (tritave && n === 13) out.names = BP_NAMES;
      if (tritave && n === 26) out.names = BP26_NAMES;
      if (octave && n === 12) out.std = true;
    }
  } else if (spec.kind === 'ji') {
    const period = pitchCents(spec.of || '2/1');
    if (period === null) return { error: 'Write the period as a ratio such as 2/1 or 3/1.' };
    const words = String(spec.ratios || '').split(/[\s,]+/).filter(Boolean), cs = words.map(pitchCents);
    if (!words.length) return { error: 'Write the ratios of the steps, such as 9/8 5/4 4/3.' };
    const bad = words.find((w, i) => cs[i] === null);
    if (bad) return { error: '“' + bad + '” is not a ratio or a number of cents.' };
    out = scaleOf(cs, period);
    if (!out.error) {
      out.name = spec.name || 'Just ratios';
      if (Math.abs(period - cents(3)) < 0.01 && out.steps.length === 13) out.names = BP_NAMES;
    }
  } else if (spec.kind === 'scl') {
    out = parseScl(spec.text);
    if (!out.error && spec.name) out.name = spec.name;
  } else return { error: 'Unknown tuning system.' };
  if (out.error) return out;
  if (out.steps.length > 200) return { error: 'That is more than 200 steps in a period.' };
  out.id = spec.id || specKey(spec);
  return out;
}

/* a stable id for a recipe, so a saved system and its open strings stay together across devices */
export function specKey(spec) {
  const body = spec.kind === 'ed' ? spec.n + ':' + (spec.of || '2/1') : spec.kind === 'ji' ? (spec.ratios || '') + '|' + (spec.of || '2/1') : String(spec.text || '');
  let x = 5381;
  for (let i = 0; i < body.length; i++) x = ((x * 33) ^ body.charCodeAt(i)) >>> 0;
  return 'mine:' + spec.kind + ':' + x.toString(36);
}

const BP_JUST = '27/25 25/21 9/7 7/5 75/49 5/3 9/5 49/25 15/7 7/3 63/25 25/9';
/* the systems offered without building one: all of them playable with straight frets */
export const PRESETS = [
  { id: 'edo12', group: 'Standard', spec: { kind: 'ed', n: 12, of: '2/1', name: '12 equal (standard)' } },
  { id: 'bp13', group: 'Bohlen-Pierce', spec: { kind: 'ed', n: 13, of: '3/1' }, note: 'No octaves: the tritave, 3:1, is an octave and a fifth. Built on odd harmonics (3, 5, 7, 9), its main chord is 3:5:7.' },
  { id: 'bpjust', group: 'Bohlen-Pierce', spec: { kind: 'ji', ratios: BP_JUST, of: '3/1', name: 'Bohlen-Pierce, just' }, note: 'The 13 just ratios Bohlen and Pierce derived from the 3:5:7 chord. With straight frets every string gets these ratios above its own open note.' },
  { id: 'bp26', group: 'Bohlen-Pierce', spec: { kind: 'ed', n: 26, of: '3/1' }, note: '26EDT: every BP step split in two, steps of about 73 cents. Every other fret is a BP fret, so it plays all of 13 equal and adds a note between each, for inflections and bends in BP. Frets are about three quarters as wide as standard ones; about 27 reach where a standard 20th fret sits.' },
  ...[10, 15, 16, 17, 19, 22, 24, 31].map(n => ({ id: 'edo' + n, group: 'Equal divisions of the octave', spec: { kind: 'ed', n, of: '2/1' },
    note: { 10: 'Steps of 120 cents: no fifths, very open.', 15: 'Steps of 80 cents, with a good 7:4 and three tritones.', 16: 'Steps of 75 cents: eerie, with a flat fifth.', 17: 'Neutral thirds; a fifth slightly sharp.', 19: 'Meantone-like, sweet thirds and room for sharps and flats as separate notes.', 22: 'Good 5-limit and 7-limit harmony; its fifth is a little sharp.', 24: 'Quarter tones: maqam and Arabic music.', 31: 'Near meantone, with very pure thirds and good 7:4. Frets get close high up.' }[n] })),
  { id: 'alpha', group: 'Non-octave', spec: { kind: 'ed', n: 9, of: '3/2', name: 'Carlos alpha, 9 equal steps of 3:2' }, note: 'Wendy Carlos’s alpha: steps of about 78 cents, with good 3:2, 5:4 and 6:5, and no octave.' },
  { id: 'beta', group: 'Non-octave', spec: { kind: 'ed', n: 11, of: '3/2', name: 'Carlos beta, 11 equal steps of 3:2' }, note: 'Wendy Carlos’s beta: steps of about 64 cents, with good 3:2 and 7:4.' },
  { id: 'just12', group: 'Just intonation', spec: { kind: 'ji', ratios: '16/15 9/8 6/5 5/4 4/3 45/32 3/2 8/5 5/3 9/5 15/8', of: '2/1', name: 'Just 12 (5-limit)' }, note: 'Pure 5-limit ratios above each open string. With straight frets the open-string tuning decides how chords across strings sound.' }
];

/* the system a setting names: a preset id or one of your own (mine: [{ id, … recipe }]); 12 equal otherwise */
export function systemOf(id, mine = []) {
  const p = PRESETS.find(x => x.id === id);
  if (p) return Object.assign(build(p.spec), { id: p.id, note: p.note || '' });
  const m = (Array.isArray(mine) ? mine : []).find(x => x && x.id === id);
  if (m) { const s = build(m); if (!s.error) return Object.assign(s, { id: m.id, note: '', mine: true }); }
  return systemOf('edo12');
}

/* open-string tunings for a Bohlen-Pierce guitar (13 steps to the tritave), low to high as steps above the
   lowest string, which sounds at root (a MIDI note). A BP fret is about 1.46 times as wide as a standard one,
   so a hand covers about three frets: gaps of 3 or 4 steps between strings (439 and 585 cents) play the way
   fourths do on a standard guitar. Every string stays within 300 cents below and 100 cents above its standard
   pitch, so the strings already on the guitar take it (test/xen.test.js). */
export const BP_TUNINGS = [
  { id: 'near', name: 'Near standard', open: [0, 3, 7, 10, 13, 16], root: 40,
    note: 'The default. Every string is within 61 cents of standard, so the tension hardly changes. Gaps of 3 and 4 steps feel like fourths and a third, and strings 1 and 5, 2 and 6 are a tritave apart, so a shape on the low strings repeats two strings up.' },
  { id: 'even', name: 'All 9:7s (every gap 3 steps)', open: [0, 3, 6, 9, 12, 15], root: 41,
    note: 'Every string is a 9:7 (439 cents, a wide major third) above the one before, so every shape moves across the strings unchanged, like all-thirds tuning. Three frets per string reach every note, so one hand position plays the whole BP chromatic, and the range is the narrowest. The low string goes up a semitone to F and the high one down a semitone, the limits of what standard strings take.' },
  { id: 'frame', name: 'Tritave frame (4-3-3-3-4)', open: [0, 4, 7, 10, 13, 17], root: 39,
    note: 'Gaps of 4, 3, 3, 3, 4: the outer pairs are 7:5 (585 cents, the stretch of a standard fourth), the middle ones 9:7. Strings 1 and 5, 2 and 6 are tritaves, and the low three ring C F H, the 5:7:9 chord. Tuned from E♭ so every string goes down.' },
  { id: 'open', name: 'Open chord on H', open: [0, 4, 7, 11, 13, 17], root: 39,
    note: 'The top four strings strum the 15:21:25:35 chord on H, which holds the 3:5:7 triad, and a barre at any fret moves it. Good for strumming, drones and slide. Every string goes down from standard.' },
  { id: 'wide', name: 'Wide bass (4-4-3-3-3)', open: [0, 4, 8, 11, 14, 17], root: 39,
    note: 'Two 7:5 gaps on the bass spread the low strings wider for bass lines under a melody, played with the thumb. The top four strings are 9:7s apart as in the all-9:7 tuning, so treble shapes move across them unchanged. Every string goes down or stays within 70 cents of standard.' }
];
/* 26EDT plays the same tunings at twice the steps, so its open strings stay on BP notes */
const BP26_TUNINGS = BP_TUNINGS.map(t => Object.assign({}, t, { open: t.open.map(k => 2 * k), name: t.name.replace(/\(([^)]*)\)/, (m, x) => '(' + x.replace(/\d+/g, d => 2 * d) + ')'), note: t.note + ' In 26EDT each BP step here is two frets, and the strings stay on BP notes.' }));
/* the tunings offered for a system: Bohlen-Pierce's when it has 13 or 26 steps to a tritave, none otherwise */
export function tuningsFor(sys) {
  if (!sys || Math.abs(sys.period - cents(3)) >= 1) return [];
  return sys.steps.length === 13 ? BP_TUNINGS : sys.steps.length === 26 ? BP26_TUNINGS : [];
}

/* step k (any whole number, 0 the open string) in cents */
export function stepCents(sys, k) {
  const n = sys.steps.length, p = Math.floor(k / n);
  return p * sys.period + sys.steps[k - p * n];
}
/* its name inside the period, and which period (0 the first) */
export function stepName(sys, k) {
  const n = sys.steps.length, p = Math.floor(k / n), m = k - p * n;
  return { name: sys.names ? sys.names[m] : String(m), period: p, m };
}
/* the step nearest a pitch c cents above step 0, and how far off: { k, cents } */
export function nearestStep(sys, c) {
  const n = sys.steps.length, p = Math.floor(c / sys.period);
  let best = null;
  for (let k = (p - 1) * n; k <= (p + 2) * n; k++) {
    const d = c - stepCents(sys, k);
    if (!best || Math.abs(d) < Math.abs(best.d)) best = { k, d };
  }
  return { k: best.k, cents: Math.round(best.d) };
}

/* open strings low to high, as steps above the lowest: the steps nearest standard tuning's E A D G B E,
   each above the one before (Bohlen-Pierce gives 0 3 7 10 13 16, C E H A C E) */
const STANDARD = [0, 500, 1000, 1500, 1900, 2400];
export function defaultOpen(sys) {
  const ts = tuningsFor(sys);
  if (ts.length) return ts[0].open.slice();
  const out = [];
  STANDARD.forEach(c => { let k = nearestStep(sys, c).k; if (out.length && k <= out[out.length - 1]) k = out[out.length - 1] + 1; out.push(k); });
  return out;
}
/* saved open strings, kept only when they are six whole numbers rising from 0 within reason */
export function openOf(sys, saved) {
  if (Array.isArray(saved) && saved.length === 6 && saved.every((k, i) => Number.isInteger(k) && k >= 0 && k <= sys.steps.length * 6 && (i === 0 ? k === 0 : k >= saved[i - 1]))) return saved.slice();
  return defaultOpen(sys);
}

/* fret positions from the nut on a scale length (any unit): fret k at step k */
export function fretTable(sys, len, count) {
  const out = [];
  let last = 0;
  for (let k = 1; k <= count; k++) {
    const c = stepCents(sys, k), dist = len * (1 - Math.pow(2, -c / 1200));
    out.push({ fret: k, k, cents: c, dist, gap: dist - last });
    last = dist;
  }
  return out;
}
/* the standard (12 equal) fret nearest a position, for zip ties over old frets: { fret, off } */
export function nearStandard(dist, len) {
  const j = Math.max(1, Math.round(-12 * Math.log2(1 - Math.min(dist / len, 0.999))));
  return { fret: j, off: dist - len * (1 - Math.pow(2, -j / 12)) };
}
/* the closest two frets in a table: { fret, gap } (fret is the higher one) */
export function tightest(table) {
  return table.reduce((b, r) => !b || r.gap < b.gap ? { fret: r.fret, gap: r.gap } : b, null);
}

export const MM_PER_IN = 25.4;
/* a length in the chosen unit: mm to 0.1, inches to 0.001 */
export function lenText(mm, unit) { return unit === 'in' ? (mm / MM_PER_IN).toFixed(3) : mm.toFixed(1); }

/* the table as CSV, in the chosen unit */
export function fretCsv(sys, table, unit, names, std) {
  const u = unit === 'in' ? 'in' : 'mm';
  const rows = [['fret', 'step'].concat(std ? ['standard note on the low string'] : [], ['cents', 'from nut (' + u + ')', 'from previous fret (' + u + ')'])];
  table.forEach(r => rows.push([r.fret, names ? names(r.k) : stepName(sys, r.k).name].concat(std ? [std(r)] : [], [r.cents.toFixed(2), lenText(r.dist, u), lenText(r.gap, u)])));
  return rows.map(r => r.map(v => /[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v)).join(',')).join('\n') + '\n';
}

/* The standard (12 equal) note nearest a pitch, as "D3 +24¢": the octave number with C4 middle C, the cents
   rounded to one (to 0.1 with fine). midi may be fractional, on the A the tuner uses. */
const STD_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
export function standardOf(midi) {
  const n = Math.round(midi);
  return { midi: n, name: STD_NAMES[((n % 12) + 12) % 12] + (Math.floor(n / 12) - 1), cents: (midi - n) * 100 };
}
export function stdText(midi, fine = false) {
  const s = standardOf(midi), c = fine ? Math.round(s.cents * 10) / 10 : Math.round(s.cents);
  return s.name + (c ? ' ' + (c > 0 ? '+' : '−') + Math.abs(c) + '¢' : '');
}
