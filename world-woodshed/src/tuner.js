/* The tuner's arithmetic (plain functions, test/tuner.test.js): pitch at any reference A, the nearest note,
   which string is being tuned (allowing the octave slips of the pitch reader on low strings), the advice,
   and a steadier reading for the needle. */

export const A4_MIN = 430, A4_MAX = 450;
export const IN_TUNE = 4; // cents either side that count as in tune
export const HOLD_MS = 400; // in tune this long and the string is ticked

export function a4Of(v) { v = Math.round(+v); return v >= A4_MIN && v <= A4_MAX ? v : 440; }
/* fractional MIDI note number of a frequency, with A4 at a4 Hz */
export function freqToMidi(freq, a4 = 440) { return 69 + 12 * Math.log2(freq / a4); }
/* the same note's MIDI number on the A = 440 scale the synth uses (for reference tones at another A) */
export function at440(midi, a4 = 440) { return midi + 12 * Math.log2(a4 / 440); }

/* nearest equal-tempered note and how far off, in cents (−50 to +50) */
export function nearestNote(midi) {
  const n = Math.round(midi);
  return { midi: n, cents: Math.round((midi - n) * 100) };
}

/* The string being tuned: the one closest to the reading, or the one the player picked (pinned). For a picked
   string a reading an octave off (a low string's attack heard on its second harmonic) is folded back onto it;
   in Auto it is not, as a B string tuned a whole step down would then read as an A string in tune.
   Returns { si, cents, folded }. */
export function pickString(midi, strings, pinned = -1) {
  let best = null;
  strings.forEach((m, si) => {
    if (pinned >= 0 && si !== pinned) return;
    for (const k of pinned >= 0 ? [0, -12, 12] : [0]) {
      const d = midi + k - m;
      if (!best || Math.abs(d) < Math.abs(best.d)) best = { si, d, folded: k !== 0 };
    }
  });
  return best ? { si: best.si, cents: Math.round(best.d * 100), folded: best.folded } : null;
}

/* what to do about it */
export function advice(cents) {
  const a = Math.abs(cents);
  if (a <= IN_TUNE) return 'In tune';
  if (a >= 150) { const st = Math.round(a / 100); return (cents > 0 ? 'Sharp' : 'Flat') + ' by about ' + st + ' semitone' + (st > 1 ? 's' : '') + ', tune ' + (cents > 0 ? 'down' : 'up'); }
  return (cents > 0 ? 'Sharp by ' + a + ' cents, tune down' : 'Flat by ' + a + ' cents, tune up');
}

/* "+12", "−7", "0" */
export function centsText(c) { return (c > 0 ? '+' : c < 0 ? '−' : '') + Math.abs(c); }

/* needle angle in degrees for a cents value, ±45° at ±50 cents */
export function needleAngle(cents) { return Math.max(-50, Math.min(50, cents)) * 0.9; }

/* Steadier readings: the median of the last few (one wild reading is dropped), then a light smoothing so the
   needle glides. A jump of more than half a semitone from the median waits until the median follows it. */
export function Steady(n = 5, k = 0.45) {
  const recent = [];
  let shown = null;
  return {
    push(midi) {
      recent.push(midi); if (recent.length > n) recent.shift();
      const sorted = recent.slice().sort((a, b) => a - b), med = sorted[sorted.length >> 1];
      if (Math.abs(midi - med) > 0.5) return null;
      shown = shown === null || Math.abs(med - shown) > 0.5 ? med : shown + (med - shown) * k;
      return shown;
    },
    reset() { recent.length = 0; shown = null; }
  };
}
