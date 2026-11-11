/* Tap tempo (plain functions, test/taptempo.test.js): a tempo from taps on a button or key.
   The beat is the median gap of the last few taps, so one early or late tap doesn't throw it; a pause of
   more than RESET_MS starts a new count, and a gap far off the others is left out. */

export const RESET_MS = 2000;
const KEEP = 8;

/* The tempo in BPM from tap times in ms (oldest first), or null with fewer than two usable taps */
export function tempoFrom(times) {
  const gaps = [];
  for (let i = 1; i < times.length; i++) gaps.push(times[i] - times[i - 1]);
  const use = gaps.slice(-(KEEP - 1)).filter(g => g > 0);
  if (!use.length) return null;
  const med = [...use].sort((a, b) => a - b)[Math.floor(use.length / 2)];
  const near = use.filter(g => Math.abs(g - med) <= med * 0.25);
  const avg = near.reduce((a, g) => a + g, 0) / near.length;
  return Math.round(60000 / avg);
}

/* A tapper: tap(t) records a tap and returns the tempo so far (null after the first tap of a count) */
export function tapper(o = {}) {
  const lo = o.min || 30, hi = o.max || 300;
  let times = [];
  return {
    tap(t = Date.now()) {
      if (times.length && t - times[times.length - 1] > RESET_MS) times = [];
      times.push(t);
      if (times.length > KEEP) times.shift();
      const bpm = tempoFrom(times);
      return bpm === null ? null : Math.max(lo, Math.min(hi, bpm));
    },
    get count() { return times.length; },
    reset() { times = []; }
  };
}
