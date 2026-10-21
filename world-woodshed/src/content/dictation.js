/* World Woodshed — Melodic dictation: the item levels and the melody generator.
   Each item is a kind of melody (source scale, length, range, how often it leaps). Melodies are generated fresh
   every time, so the material never runs out. No imports: the engine reads the item list too. */

export const DICT_SOURCES = {
  major: { name: 'Major', steps: [0, 2, 4, 5, 7, 9, 11], cad: 'major' },
  minor: { name: 'Natural minor', steps: [0, 2, 3, 5, 7, 8, 10], cad: 'minor' },
  dorian: { name: 'Dorian', steps: [0, 2, 3, 5, 7, 9, 10], cad: 'dorian' },
  majpent: { name: 'Major pentatonic', steps: [0, 2, 4, 7, 9], cad: 'major' },
  minpent: { name: 'Minor pentatonic', steps: [0, 3, 5, 7, 10], cad: 'minpent' },
  harmmin: { name: 'Harmonic minor', steps: [0, 2, 3, 5, 7, 8, 11], cad: 'minor' }
};

/* lo/hi: range in semitones around the tonic. leap: chance of a skip or leap per move; maxLeap: its size in scale steps.
   resolve: after a leap of a 4th or more, step back the other way. pad: the degrees offered on the answer row. */
export const DICT_ITEMS = [
  { id: 'triad3', tier: 1, label: '3 notes · Do, Mi, Sol (1 3 5), major', src: 'major', only: [0, 4, 7], len: [3, 3], lo: 0, hi: 12, leap: 0.4, maxLeap: 2, pad: [0, 2, 4, 5, 7], bpm: 80 },
  { id: 'step3', tier: 1, label: '3 notes · steps within 1–5, major', src: 'major', only: [0, 2, 4, 5, 7], len: [3, 3], lo: 0, hi: 7, leap: 0, pad: [0, 2, 4, 5, 7], bpm: 80 },
  { id: 'step4', tier: 2, label: '4 notes · steps in the major scale', src: 'major', len: [4, 4], lo: -1, hi: 12, leap: 0, bpm: 84 },
  { id: 'skip4', tier: 2, label: '4 notes · steps and 3rds, major', src: 'major', len: [4, 4], lo: -1, hi: 12, leap: 0.3, maxLeap: 2, bpm: 84 },
  { id: 'leap5', tier: 3, label: '5 notes · leaps within the octave, major', src: 'major', len: [5, 5], lo: 0, hi: 12, leap: 0.4, maxLeap: 5, resolve: true, bpm: 88 },
  { id: 'low5', tier: 3, label: '5 notes · below and above the tonic, major', src: 'major', len: [5, 5], lo: -5, hi: 7, leap: 0.3, maxLeap: 3, resolve: true, bpm: 88 },
  { id: 'minor6', tier: 4, label: '5–6 notes · natural minor', src: 'minor', len: [5, 6], lo: -5, hi: 12, leap: 0.3, maxLeap: 4, resolve: true, bpm: 92 },
  { id: 'dorian6', tier: 4, label: '5–6 notes · Dorian', src: 'dorian', len: [5, 6], lo: -5, hi: 12, leap: 0.3, maxLeap: 4, resolve: true, bpm: 92 },
  { id: 'majpent6', tier: 4, label: '5–6 notes · major pentatonic', src: 'majpent', len: [5, 6], lo: -5, hi: 12, leap: 0.25, maxLeap: 2, resolve: true, bpm: 92 },
  { id: 'minpent6', tier: 4, label: '5–6 notes · minor pentatonic', src: 'minpent', len: [5, 6], lo: -5, hi: 12, leap: 0.25, maxLeap: 2, resolve: true, bpm: 92 },
  { id: 'chrom7', tier: 5, label: '6–7 notes · major with chromatic neighbours', src: 'major', len: [6, 7], lo: -5, hi: 12, leap: 0.25, maxLeap: 4, resolve: true, chroma: true, rhythm: true, pad: 'all', bpm: 92 },
  { id: 'harm8', tier: 5, label: '6–8 notes · harmonic minor', src: 'harmmin', len: [6, 8], lo: -5, hi: 12, leap: 0.3, maxLeap: 4, resolve: true, rhythm: true, bpm: 96 },
  { id: 'rhythm8', tier: 5, label: '7–8 notes · major, mixed rhythms', src: 'major', len: [7, 8], lo: -5, hi: 12, leap: 0.35, maxLeap: 5, resolve: true, rhythm: true, bpm: 96 }
];

export function dictationItems() { return DICT_ITEMS.map(({ id, label, tier }) => ({ id, label, tier })); }

const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
export const degOf = (m, tonic) => (((m - tonic) % 12) + 12) % 12;

/* Degrees offered on the answer row for an item */
export function padFor(it) {
  if (it.pad === 'all') return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  return (it.pad || DICT_SOURCES[it.src].steps).slice();
}

/* A tonic (MIDI) that keeps the whole range between the guitar's A2 and D5 */
export function tonicFor(it) {
  const lo = Math.max(50, 45 - it.lo), hi = Math.min(62, 74 - it.hi);
  return ri(lo, Math.max(lo, hi));
}

/* Generate a melody (MIDI notes) for an item in a key: starts on or near 1, 3 or 5, mostly steps,
   leaps turn back by step, ends on the tonic (or 3/5 on the easy levels) reached by step or a small skip. */
/* avoid: the previous melody's degrees, so the same tune doesn't come twice in a row */
export function genMelody(it, tonic, avoid) {
  const steps = it.only || DICT_SOURCES[it.src].steps;
  const scale = DICT_SOURCES[it.src].steps;
  const third = scale.includes(4) ? 4 : 3;
  const pool = [];
  for (let m = tonic + it.lo; m <= tonic + it.hi; m++) if (steps.includes(degOf(m, tonic))) pool.push(m);
  const n = ri(it.len[0], it.len[1]);
  const homes = [0, third, 7];
  // level 1 starts on 1, 3 or 5; later levels may start on any nearby note, with 1, 3 and 5 twice as likely
  const near = pool.map((m, i) => i).filter(i => pool[i] >= tonic - 5 && pool[i] <= tonic + 7);
  const homeIdx = near.filter(i => homes.includes(degOf(pool[i], tonic)));
  const starts = it.tier <= 1 ? homeIdx : it.leap ? near.concat(homeIdx) : near;
  const tonicEnd = it.tier >= 2 && Math.random() < 0.7;
  const ends = tonicEnd ? [0] : homes;
  for (let tries = 0; tries < 600; tries++) {
    let idx = pick(starts);
    const mel = [pool[idx]];
    let lastSemis = 0, leaps = 0, ok = true;
    for (let k = 1; k < n && ok; k++) {
      let mv;
      if (it.resolve && Math.abs(lastSemis) >= 5) mv = -Math.sign(lastSemis);
      else if (Math.random() < (it.leap || 0) && leaps < 2) mv = pick([-1, 1]) * ri(2, it.maxLeap || 2);
      else mv = pick([-1, 1]);
      const ni = idx + mv;
      if (ni < 0 || ni >= pool.length) { ok = false; break; }
      const semis = pool[ni] - pool[idx];
      if (Math.abs(semis) === 6 || Math.abs(semis) > 9) { ok = false; break; }
      leaps = Math.abs(mv) >= 2 ? leaps + 1 : 0;
      // no A-B-A-B see-saw
      if (mel.length >= 3 && pool[ni] === mel[mel.length - 2] && mel[mel.length - 1] === mel[mel.length - 3]) { ok = false; break; }
      idx = ni; lastSemis = semis; mel.push(pool[idx]);
    }
    if (!ok) continue;
    const last = mel[n - 1], prev = mel[n - 2];
    if (!ends.includes(degOf(last, tonic))) continue;
    if (it.tier >= 2 && Math.abs(last - prev) > 5) continue;
    if (it.tier >= 2 && new Set(mel).size < Math.min(3, n - 1)) continue;
    if (it.chroma && !addChromatic(mel, scale, tonic)) continue;
    if (avoid && avoid.length === n && avoid.every((d, i) => d === degOf(mel[i], tonic))) continue;
    return mel;
  }
  // fallback: walk down the scale to the tonic
  const down = pool.filter(m => m >= tonic && m <= tonic + 12).slice(0, n).reverse();
  return down.length === n ? down : Array.from({ length: n }, (_, i) => tonic + scale[Math.max(0, n - 1 - i) % scale.length]);
}

/* Turn one or two inner notes into chromatic neighbours that resolve by half step to the next note */
function addChromatic(mel, scale, tonic) {
  const cand = [];
  for (let i = 1; i < mel.length - 1; i++) {
    [-1, 1].forEach(dir => {
      const c = mel[i + 1] + dir;
      if (scale.includes(degOf(c, tonic))) return;
      if (c === mel[i - 1] || Math.abs(c - mel[i - 1]) > 5) return;
      cand.push([i, c]);
    });
  }
  if (!cand.length) return false;
  const want = mel.length >= 7 && Math.random() < 0.5 ? 2 : 1;
  const used = new Set();
  for (let k = 0; k < want; k++) {
    const opts = cand.filter(([i]) => !used.has(i) && !used.has(i - 1) && !used.has(i + 1));
    if (!opts.length) break;
    const [i, c] = pick(opts);
    mel[i] = c; used.add(i);
  }
  return used.size > 0;
}

/* Note lengths in beats. Plain levels: even quarters with a held last note; rhythm levels mix eighths, dotted quarters and halves. */
export function genRhythm(it, n) {
  if (!it.rhythm) return Array(n - 1).fill(1).concat([2]);
  const d = [];
  while (d.length < n - 1) {
    const left = n - 1 - d.length, r = Math.random();
    if (left >= 2 && r < 0.32) d.push(0.5, 0.5);
    else if (left >= 2 && r < 0.48) d.push(1.5, 0.5);
    else if (r < 0.58) d.push(2);
    else d.push(1);
  }
  return d.concat([2]);
}
