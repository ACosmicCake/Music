import { describe, it, expect } from 'vitest';
import { clipCurve, latencyHintFor } from '../src/audio.js';

describe('output path', () => {
  it('asks for the smooth playback path on Android unless low latency is chosen', () => {
    expect(latencyHintFor('auto', true)).toBe('playback');
    expect(latencyHintFor(undefined, true)).toBe('playback');
    expect(latencyHintFor('fast', true)).toBe('interactive');
    expect(latencyHintFor('auto', false)).toBe('interactive');
    expect(latencyHintFor('smooth', false)).toBe('playback');
  });
});

describe('soft limiter', () => {
  const curve = clipCurve(), n = curve.length;
  // the signal reaches the curve at a quarter of its level, so the curve spans ±4 × full scale
  const at = x => { const p = (x / 4 + 1) / 2 * (n - 1), i = Math.floor(p), f = p - i; return curve[i] + f * ((curve[i + 1] ?? curve[i]) - curve[i]); };
  it('leaves the signal unchanged below -3 dBFS', () => {
    for (const x of [-0.7, -0.3, 0, 0.25, 0.5, 0.7]) expect(at(x)).toBeCloseTo(x, 3);
  });
  it('bends peaks above full scale instead of cutting them flat', () => {
    expect(at(1)).toBeGreaterThan(0.9);
    expect(at(1.5)).toBeGreaterThan(at(1.2));
    expect(at(1.2)).toBeGreaterThan(at(1));
    expect(Math.max(...curve)).toBeLessThanOrEqual(1);
    expect(at(2)).toBeLessThan(1);
    expect(at(-1.5)).toBeCloseTo(-at(1.5), 6);
  });
  it('rises steadily', () => {
    for (let i = 1; i < n; i++) expect(curve[i]).toBeGreaterThanOrEqual(curve[i - 1]);
  });
});
