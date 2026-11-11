import { describe, it, expect } from 'vitest';
import { tempoFrom, tapper, RESET_MS } from '../src/taptempo.js';

/* Tap tempo (src/taptempo.js) */
const taps = (bpm, n, from = 0) => Array.from({ length: n }, (_, i) => from + i * 60000 / bpm);

describe('tap tempo', () => {
  it('reads a steady tempo', () => {
    expect(tempoFrom(taps(120, 4))).toBe(120);
    expect(tempoFrom(taps(72, 6))).toBe(72);
  });
  it('needs two taps', () => {
    expect(tempoFrom([1000])).toBe(null);
    expect(tapper().tap(1000)).toBe(null);
  });
  it('one stray tap does not throw it', () => {
    const t = taps(100, 6); t[3] += 120;
    expect(Math.abs(tempoFrom(t) - 100)).toBeLessThanOrEqual(2);
  });
  it('a pause starts a new count, and the last taps count most', () => {
    const tp = tapper();
    taps(60, 4).forEach(t => tp.tap(t));
    expect(tp.tap(3000 + RESET_MS + 1)).toBe(null);
    let bpm;
    taps(150, 5, 3000 + RESET_MS + 1 + 400).forEach(t => { bpm = tp.tap(t); });
    expect(bpm).toBe(150);
  });
  it('keeps within the range given', () => {
    const tp = tapper({ min: 40, max: 200 });
    tp.tap(0);
    expect(tp.tap(100)).toBe(200);
  });
});
