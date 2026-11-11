/* World Woodshed — what chord is this? Plain functions (test/chordid.test.js).

   nameChord(notes) names a set of notes, from the frets tapped on the neck or the notes the mic heard, the way
   a guitarist would: every chord the notes could be, best first, with the root, the bass (a slash chord or an
   inversion when it isn't the root), which tones are missing (the fifth is often left out on a guitar) and the
   role of each note (R, 3, ♭7, 9…).

   hearNotes(mag, sr, N) finds the notes sounding in one magnitude spectrum: a strummed chord has five or six
   strings, each with a row of harmonics, and the harmonics of one string land on the notes of another (a C's
   third harmonic is a G). It picks the note whose harmonics explain the most of the spectrum, takes them out
   and looks again (iterative estimation with spectral smoothness, after Klapuri 2003). ChordEar runs it on a
   stream of mic samples: a strum is heard over its first half second or so and the notes held until the next. */

export const pcOf = m => ((Math.round(m) % 12) + 12) % 12;

/* Chord types. iv: semitones above the root (as pitch classes, so a 9th is 2); deg: how each is named;
   opt: tones that may be missing and still name the chord (the fifth, and the 9th of an 11th or 13th).
   Simpler chords come first: of two names for the same notes, the earlier one wins a tie. */
export const CHORD_TYPES = [
  { q: '', name: 'major', iv: [0, 4, 7], deg: ['R', '3', '5'] },
  { q: 'm', name: 'minor', iv: [0, 3, 7], deg: ['R', '♭3', '5'] },
  { q: '7', name: 'dominant 7th', iv: [0, 4, 7, 10], deg: ['R', '3', '5', '♭7'], opt: [7] },
  { q: 'm7', name: 'minor 7th', iv: [0, 3, 7, 10], deg: ['R', '♭3', '5', '♭7'], opt: [7] },
  { q: 'maj7', name: 'major 7th', iv: [0, 4, 7, 11], deg: ['R', '3', '5', '7'], opt: [7] },
  { q: '5', name: 'power chord', iv: [0, 7], deg: ['R', '5'] },
  { q: 'sus4', name: 'suspended 4th', iv: [0, 5, 7], deg: ['R', '4', '5'] },
  { q: 'sus2', name: 'suspended 2nd', iv: [0, 2, 7], deg: ['R', '2', '5'] },
  { q: 'dim', name: 'diminished', iv: [0, 3, 6], deg: ['R', '♭3', '♭5'] },
  { q: 'aug', name: 'augmented', iv: [0, 4, 8], deg: ['R', '3', '♯5'] },
  { q: '6', name: 'major 6th', iv: [0, 4, 7, 9], deg: ['R', '3', '5', '6'], opt: [7] },
  { q: 'm6', name: 'minor 6th', iv: [0, 3, 7, 9], deg: ['R', '♭3', '5', '6'], opt: [7] },
  { q: 'm7♭5', name: 'half-diminished', iv: [0, 3, 6, 10], deg: ['R', '♭3', '♭5', '♭7'] },
  { q: 'dim7', name: 'diminished 7th', iv: [0, 3, 6, 9], deg: ['R', '♭3', '♭5', '𝄫7'] },
  { q: '7sus4', name: 'dominant 7th sus4', iv: [0, 5, 7, 10], deg: ['R', '4', '5', '♭7'], opt: [7] },
  { q: 'add9', name: 'major add 9', iv: [0, 4, 7, 2], deg: ['R', '3', '5', '9'], opt: [7] },
  { q: 'm(add9)', name: 'minor add 9', iv: [0, 3, 7, 2], deg: ['R', '♭3', '5', '9'], opt: [7] },
  { q: 'mMaj7', name: 'minor-major 7th', iv: [0, 3, 7, 11], deg: ['R', '♭3', '5', '7'], opt: [7] },
  { q: '9', name: 'dominant 9th', iv: [0, 4, 7, 10, 2], deg: ['R', '3', '5', '♭7', '9'], opt: [7] },
  { q: 'maj9', name: 'major 9th', iv: [0, 4, 7, 11, 2], deg: ['R', '3', '5', '7', '9'], opt: [7] },
  { q: 'm9', name: 'minor 9th', iv: [0, 3, 7, 10, 2], deg: ['R', '♭3', '5', '♭7', '9'], opt: [7] },
  { q: '6/9', name: 'six-nine', iv: [0, 4, 7, 9, 2], deg: ['R', '3', '5', '6', '9'], opt: [7] },
  { q: 'm6/9', name: 'minor six-nine', iv: [0, 3, 7, 9, 2], deg: ['R', '♭3', '5', '6', '9'], opt: [7] },
  { q: '7♭9', name: 'dominant 7th flat 9', iv: [0, 4, 7, 10, 1], deg: ['R', '3', '5', '♭7', '♭9'], opt: [7] },
  { q: '7♯9', name: 'dominant 7th sharp 9', iv: [0, 4, 7, 10, 3], deg: ['R', '3', '5', '♭7', '♯9'], opt: [7] },
  { q: '7♯11', name: 'dominant 7th sharp 11', iv: [0, 4, 7, 10, 6], deg: ['R', '3', '5', '♭7', '♯11'], opt: [7] },
  { q: '7♭5', name: 'dominant 7th flat 5', iv: [0, 4, 6, 10], deg: ['R', '3', '♭5', '♭7'] },
  { q: '7♯5', name: 'augmented 7th', iv: [0, 4, 8, 10], deg: ['R', '3', '♯5', '♭7'] },
  { q: '7♭13', name: 'dominant 7th flat 13', iv: [0, 4, 7, 10, 8], deg: ['R', '3', '5', '♭7', '♭13'], opt: [7] },
  { q: 'maj7♯11', name: 'Lydian major 7th', iv: [0, 4, 7, 11, 6], deg: ['R', '3', '5', '7', '♯11'], opt: [7] },
  { q: 'maj7♯5', name: 'augmented major 7th', iv: [0, 4, 8, 11], deg: ['R', '3', '♯5', '7'] },
  { q: '9sus4', name: '9th sus4', iv: [0, 5, 7, 10, 2], deg: ['R', '4', '5', '♭7', '9'], opt: [7] },
  { q: 'm11', name: 'minor 11th', iv: [0, 3, 7, 10, 2, 5], deg: ['R', '♭3', '5', '♭7', '9', '11'], opt: [7, 2] },
  { q: '13', name: 'dominant 13th', iv: [0, 4, 7, 10, 2, 9], deg: ['R', '3', '5', '♭7', '9', '13'], opt: [7, 2] },
  { q: 'maj13', name: 'major 13th', iv: [0, 4, 7, 11, 2, 9], deg: ['R', '3', '5', '7', '9', '13'], opt: [7, 2] },
  { q: 'm13', name: 'minor 13th', iv: [0, 3, 7, 10, 2, 9], deg: ['R', '♭3', '5', '♭7', '9', '13'], opt: [7, 2] },
  { q: '7♯9♭13', name: 'altered dominant', iv: [0, 4, 10, 3, 8], deg: ['R', '3', '♭7', '♯9', '♭13'] }
];

/* Root names as guitarists write them: F♯ rather than G♭; for minor chords C♯ and G♯ rather than D♭ and A♭ */
const ROOT_MAJ = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const ROOT_MIN = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B'];
export function rootName(pc, minor) { return (minor ? ROOT_MIN : ROOT_MAJ)[pcOf(pc)]; }

/* Spell a chord tone from its root's name and its degree label, so B♭7 is B♭ D F A♭ and not A♯ D F G♯ */
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'], LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
export function spellTone(root, rootPc, semis, deg) {
  const num = deg === 'R' ? 1 : +(/\d+/.exec(deg) || [1])[0];
  const li = (LETTERS.indexOf(root[0]) + num - 1) % 7;
  const want = pcOf(rootPc + semis);
  let acc = want - LETTER_PC[li];
  if (acc > 6) acc -= 12; if (acc < -6) acc += 12;
  if (Math.abs(acc) > 1) return ROOT_MAJ[want]; // a double flat (a dim7's 𝄫7) reads easier as the plain note
  return LETTERS[li] + ['♭', '', '♯'][acc + 1];
}

const INVERSION = { 3: '1st inversion', 5: '2nd inversion', 7: '3rd inversion' };

/* Every name for these notes, best first.
   notes: MIDI notes (or pitch classes); bass: the lowest note's pitch class (defaults to the lowest of notes).
   Returns [{ sym, root, q, name, bass, slash, inversion, exact, missing: [deg], extra: [pc], tones: [{ pc, deg, name }], score }]. */
export function nameChord(notes, bass) {
  const list = (notes || []).filter(n => Number.isFinite(n));
  if (!list.length) return [];
  const pcs = [...new Set(list.map(pcOf))];
  const b = bass != null ? pcOf(bass) : pcOf(Math.min(...list));
  if (pcs.length === 1) return [];
  const out = [];
  for (const r of pcs) {
    for (let ti = 0; ti < CHORD_TYPES.length; ti++) {
      const T = CHORD_TYPES[ti];
      const tones = T.iv.map(x => pcOf(r + x));
      // the chord with every note, or (a slash chord over a bass that isn't a chord tone) without the bass
      for (const over of [false, true]) {
        if (over && (tones.includes(b) || b === r)) continue;
        const have = over ? pcs.filter(p => p !== b) : pcs;
        if (!have.includes(r)) continue;
        const extra = have.filter(p => !tones.includes(p));
        const missing = T.iv.filter((x, i) => !have.includes(tones[i]) && !(T.opt || []).includes(x));
        const omitted = T.iv.filter((x, i) => !have.includes(tones[i]) && (T.opt || []).includes(x));
        if (missing.length || extra.length > 1) continue;
        // a chord needs its character: a triad with one of three notes is not a chord
        const found = T.iv.length - omitted.length;
        if (found < Math.min(3, T.iv.length) && !(T.q === '5' && pcs.length === 2)) continue;
        // a missing fifth matters more in a four-note chord: G B♭ D over B♭ is Gm/B♭ before it is a B♭6 with no F
        let score = 10 - 4 * extra.length - (T.iv.length > 4 ? 0.8 : 2) * omitted.length - ti * 0.04 - (T.iv.length > 4 ? 0.3 : 0);
        // in the bass: the root best; a 3rd, 5th or 7th is an inversion; a 9th, 11th or 13th there reads better as a slash chord
        const bd = tones.includes(b) ? T.deg[tones.indexOf(b)] : null, ext = bd && +(/\d+/.exec(bd) || [0])[0] >= 9;
        if (b === r) score += 1.6; else if (over) score -= 1.2; else score -= 0.2 + (ext ? 1 : 0) + (bd === '5' && T.iv.length === 3 ? 0.4 : 0);
        const minor = T.iv.includes(3) && !T.iv.includes(4);
        const rn = rootName(r, minor);
        const bassDeg = tones.includes(b) ? T.deg[tones.indexOf(b)] : null;
        const sym = rn + T.q + (b !== r ? '/' + (bassDeg ? spellTone(rn, r, T.iv[tones.indexOf(b)], bassDeg) : rootName(b, minor)) : '');
        out.push({
          sym, root: r, q: T.q, name: rn + ' ' + T.name, bass: b, slash: b !== r,
          inversion: !over && b !== r ? INVERSION[(/\d+/.exec(bassDeg) || [])[0]] || null : null,
          exact: !extra.length && !omitted.length, missing: omitted.map(x => T.deg[T.iv.indexOf(x)]), extra,
          tones: T.iv.map((x, i) => ({ pc: tones[i], deg: T.deg[i], name: spellTone(rn, r, x, T.deg[i]), heard: have.includes(tones[i]) })),
          score
        });
      }
    }
  }
  // names far behind the best (a power chord for a triad, with its 3rd as an extra) are no help
  const seen = new Set();
  out.sort((x, y) => y.score - x.score);
  return out.filter(c => c.score > out[0].score - 3 && !seen.has(c.sym) && seen.add(c.sym));
}

/* ---------------- hearing the notes of a chord ---------------- */

/* radix-2 FFT, in place */
const TABLES = new Map();
function fft(re, im) {
  const n = re.length;
  let T = TABLES.get(n);
  if (!T) { T = { c: new Float64Array(n / 2), s: new Float64Array(n / 2) }; for (let k = 0; k < n / 2; k++) { T.c[k] = Math.cos(-2 * Math.PI * k / n); T.s[k] = Math.sin(-2 * Math.PI * k / n); } TABLES.set(n, T); }
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const step = n / len, half = len >> 1;
    for (let i = 0; i < n; i += len) {
      for (let k = 0; k < half; k++) {
        const wr = T.c[k * step], wi = T.s[k * step], a = i + k, bb = a + half;
        const vr = re[bb] * wr - im[bb] * wi, vi = re[bb] * wi + im[bb] * wr;
        re[bb] = re[a] - vr; im[bb] = im[a] - vi; re[a] += vr; im[a] += vi;
      }
    }
  }
}
const HANN = new Map();
/* magnitude spectrum of x (its length a power of two), Hann windowed */
export function spectrum(x) {
  const N = x.length;
  let w = HANN.get(N);
  if (!w) { w = new Float32Array(N); for (let i = 0; i < N; i++) w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N); HANN.set(N, w); }
  const re = new Float64Array(N), im = new Float64Array(N);
  for (let i = 0; i < N; i++) re[i] = x[i] * w[i];
  fft(re, im);
  const mag = new Float32Array(N / 2);
  for (let k = 0; k < N / 2; k++) mag[k] = Math.hypot(re[k], im[k]);
  return mag;
}

const LO = 40, HI = 81;            // E2 to A5: a chord's notes (higher ones are mostly a lower string's harmonics)
const FMAX = 5000;                 // harmonics above this add little but noise
const B0 = 36, B1 = 112, R = 3, NB = (B1 - B0) * R; // the grid the spectrum is folded onto: thirds of a semitone from C2 up
const DECAYS = [0.55, 0.85];       // a dark and a bright string: each note gets both, so either fits
const HARM = 14, ITERS = 400;

/* Spectral peaks: [{ f, a }] with the frequency from a parabola through the three bins (on log magnitude) */
export function peaksOf(mag, sr, N) {
  const out = [], hz = sr / N, kMax = Math.min(mag.length - 1, Math.floor(FMAX / hz));
  // the floor: twice the band's mean drops the hiss between the peaks
  let sum = 0; for (let k = 2; k < kMax; k++) sum += mag[k];
  const floor = 2 * sum / Math.max(1, kMax - 2);
  for (let k = 2; k < kMax; k++) {
    const b = mag[k];
    if (b <= floor || b < mag[k - 1] || b < mag[k + 1]) continue;
    const la = Math.log(mag[k - 1] + 1e-12), lb = Math.log(b), lc = Math.log(mag[k + 1] + 1e-12), den = la - 2 * lb + lc;
    const d = den < 0 ? Math.max(-0.5, Math.min(0.5, 0.5 * (la - lc) / den)) : 0;
    out.push({ f: (k + d) * hz, a: b });
  }
  return out;
}

/* How far (cents) the strongest peaks sit from A440's semitones: a guitar tuned a little sharp or flat. The
   grid is a third of a semitone, so 17 cents off would put every note between two of its cells. Circular mean,
   weighted by loudness, of the peaks under 1.5 kHz (higher harmonics of stiff strings run sharp). */
export function tuningOf(peaks) {
  let c = 0, s = 0;
  for (const p of peaks) {
    if (p.f > 1500) continue;
    const dev = 12 * Math.log2(p.f / 440), ph = 2 * Math.PI * (dev - Math.round(dev)), w = p.a * p.a;
    c += w * Math.cos(ph); s += w * Math.sin(ph);
  }
  return c || s ? Math.round(100 * Math.atan2(s, c) / (2 * Math.PI)) : 0;
}

/* Each note's harmonic series on the grid (a little stretched: strings are stiff), normalised */
let TEMPLATES = null;
function templates() {
  if (TEMPLATES) return TEMPLATES;
  TEMPLATES = [];
  for (let m = LO; m <= HI; m++) for (const d of DECAYS) {
    const row = new Map();
    for (let h = 1; h <= HARM; h++) {
      const b = Math.round((m + 12 * Math.log2(h * Math.sqrt(1 + 0.0001 * h * h)) - B0) * R);
      if (b >= NB) break;
      row.set(b, (row.get(b) || 0) + Math.pow(d, h - 1));
    }
    let n = 0; for (const v of row.values()) n += v;
    TEMPLATES.push({ m, bins: [...row.entries()].map(([b, v]) => [b, v / n]) });
  }
  return TEMPLATES;
}

/* The notes sounding in a spectrum. Returns [{ midi, strength }] (strength 0..1 of the strongest), low to high.
   The spectrum's peaks are folded onto a semitone grid and explained as a sum of notes' harmonic series with
   weights that can't go below zero (non-negative least squares, by multiplicative updates): a harmonic two notes
   share is shared between them, and a low string whose fundamental the mic hardly hears (a laptop's) is still
   found from the rest of its series. opts: { tune: cents the guitar sits from A440, min: weakest note kept (0.2) } */
export function hearNotes(mag, sr, N, opts = {}) {
  const min = opts.min ?? 0.2, peaks = peaksOf(mag, sr, N);
  const tune = opts.tune ?? tuningOf(peaks);
  const V = new Float64Array(NB);
  for (const p of peaks) {
    const b = Math.round((69 + 12 * Math.log2(p.f / 440) - tune / 100 - B0) * R);
    if (b >= 0 && b < NB) V[b] += Math.pow(p.a, 0.6); // compressed: a loud string doesn't hide a soft one
  }
  let tot = 0; for (const v of V) tot += v;
  if (!tot) return [];
  for (let i = 0; i < NB; i++) V[i] /= tot;
  const W = templates(), K = W.length, H = new Float64Array(K).fill(1 / K), WH = new Float64Array(NB);
  for (let it = 0; it < ITERS; it++) {
    WH.fill(1e-9);
    for (let k = 0; k < K; k++) { const hk = H[k]; for (const [b, w] of W[k].bins) WH[b] += w * hk; }
    for (let k = 0; k < K; k++) { let num = 0; for (const [b, w] of W[k].bins) num += w * V[b] / WH[b]; H[k] *= num; }
  }
  const act = new Map();
  for (let k = 0; k < K; k++) act.set(W[k].m, (act.get(W[k].m) || 0) + H[k]);
  let mx = 0; for (const v of act.values()) mx = Math.max(mx, v);
  const found = [...act.entries()].map(([m, v]) => ({ midi: m, strength: v / mx })).filter(n => n.strength >= min).sort((a, b) => a.midi - b.midi);
  // a bright string's 3rd, 5th, 6th or 7th harmonic can still read as a note of its own: unless that pitch
  // class also sounds lower down, a note there weaker than the string below it is that string
  return found.filter(n => {
    const under = found.some(l => [19, 28, 31, 34].includes(n.midi - l.midi) && n.strength < l.strength);
    return !under || found.some(o => o.midi < n.midi && pcOf(o.midi) === pcOf(n.midi));
  });
}

/* Listen to a stream of samples (from the mic) and name what is strummed.
   push(block, t) with consecutive samples, all the time; strum(t) when the mic hears an attack (the analyzer's
   onset), which starts the count afresh so the next chord is named sooner. It looks every 70 ms (not only after
   an attack: a soft strum or a chord let ring may not give one) and names a chord when the same notes have been
   heard in most of the last four looks.
   onChord({ notes: [midi], bass, names: nameChord(...), t }) each time what it hears settles on new notes. */
export function ChordEar(sr, opts = {}) {
  const N = sr > 32000 ? 8192 : 4096;           // about 170 ms: bins about 6 Hz apart, peaks found to well under that
  const ring = new Float32Array(N * 2); let w = 0, total = 0;
  let hist = [], lastSent = '', nextLook = 0, quiet = 0;
  const onChord = opts.onChord || (() => {});
  const HOP = 0.07, KEEP = 4;
  function look(tNow) {
    const x = new Float32Array(N);
    for (let i = 0; i < N; i++) x[i] = ring[(w - N + i + ring.length) % ring.length];
    let e = 0; for (let i = 0; i < N; i++) e += x[i] * x[i];
    if (Math.sqrt(e / N) < (opts.floor ?? 3e-4)) { if (++quiet >= 3) { hist = []; lastSent = ''; } return; } // silence: the next chord is new
    quiet = 0;
    hist.push(hearNotes(spectrum(x), sr, N, { min: 0.12 }));
    if (hist.length > KEEP) hist.shift();
    if (hist.length < 2) return;
    // a note counts when most looks hear it at a fair strength: a stray harmonic or the pick's noise doesn't
    const need = Math.max(2, Math.ceil(hist.length * 0.6)), votes = new Map();
    hist.forEach(ns => ns.forEach(n => { const v = votes.get(n.midi) || { s: 0, n: 0 }; v.s += n.strength; v.n++; votes.set(n.midi, v); }));
    const kept = [...votes.entries()].filter(([, v]) => v.n >= need && v.s / hist.length >= 0.2).map(([m]) => m).sort((a, b) => a - b);
    if (new Set(kept.map(pcOf)).size < 2) return;
    // as a chord rings, its top strings fade first: fewer of the same notes is the same chord, not a new one
    const key = kept.join('.'), before = lastSent ? lastSent.split('.').map(Number) : [];
    if (key === lastSent || (before.length && kept.every(m => before.includes(m)))) return;
    lastSent = key;
    onChord({ notes: kept, bass: pcOf(kept[0]), names: nameChord(kept), t: tNow });
  }
  return {
    push(block, t0) {
      for (let i = 0; i < block.length; i++) { ring[w] = block[i]; w = (w + 1) % ring.length; total++; }
      const tNow = t0 + block.length / sr;
      if (tNow >= nextLook && total >= N) { look(tNow); nextLook = tNow + HOP; }
    },
    strum(t) {
      // what rang before the strum is another chord: start again once the window is (nearly) all the new one
      hist = []; lastSent = ''; nextLook = t + N / sr * 0.9;
    },
    reset() { hist = []; lastSent = ''; }
  };
}
