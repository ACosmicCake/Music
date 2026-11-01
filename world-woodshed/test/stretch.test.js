import { describe, it, expect } from 'vitest';
import Stretch from '../src/stretch.js';

const sr = 22050;
function tone(sec, freqs, stereo, clicks = true) {
  const n = Math.round(sr * sec), L = new Float32Array(n), R = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let v = 0;
    freqs.forEach((f, k) => { v += (0.3 / (k + 1)) * Math.sin(2 * Math.PI * f * i / sr); });
    if (clicks && i % 5512 < 60) v += 0.4 * Math.sin(i * 1.7); // a click four times a second
    L[i] = v; R[i] = 0.7 * v;
  }
  return stereo ? [L, R] : [L];
}
// strength of frequency f over a second in the middle of x
function level(x, f) {
  const s0 = Math.floor(x.length / 2) - sr / 2;
  let re = 0, im = 0;
  for (let i = 0; i < sr; i++) {
    const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / sr);
    re += x[s0 + i] * w * Math.cos(2 * Math.PI * f * i / sr); im += x[s0 + i] * w * Math.sin(2 * Math.PI * f * i / sr);
  }
  return 4 * Math.hypot(re, im) / sr;
}
function streamed(chs, speed, semis, first, block) {
  const blocks = [];
  for (const b of Stretch.stream(chs.map(c => c.slice()), sr, speed, semis, first, block)) if (b) blocks.push(b);
  return blocks;
}

describe('time-stretch', () => {
  it('streams blocks of the asked size that add up to the whole result', () => {
    const chs = tone(3, [220, 330], true);
    for (const [speed, semis] of [[0.5, 0], [0.7, 12], [1, -12], [0.75, 3], [1.25, -5], [0.5, 0.0001]]) {
      const blocks = streamed(chs, speed, semis, 4000, 9000);
      const whole = Stretch.process(chs.map(c => c.slice()), sr, speed, semis);
      const len = Math.round(chs[0].length / speed);
      expect(whole[0].length).toBe(len);
      expect(blocks.reduce((n, b) => n + b[0].length, 0)).toBe(len);
      expect(blocks[0][0].length).toBeGreaterThanOrEqual(4000);
      blocks.slice(1, -1).forEach(b => expect(b[0].length).toBeGreaterThanOrEqual(9000));
      blocks.forEach(b => expect(b.length).toBe(2));
      // the blocks are the whole result, in order
      let at = 0;
      for (const b of blocks) { for (let i = 0; i < b[0].length; i += 97) expect(b[1][i]).toBeCloseTo(whole[1][at + i], 5); at += b[0].length; }
    }
  });

  it('keeps the pitch when slowing down and moves it by the semitones asked', () => {
    const chs = tone(4, [220], false, false);
    const slow = Stretch.process(chs, sr, 0.5, 0)[0];
    expect(level(slow, 220)).toBeGreaterThan(0.2);
    expect(level(slow, 110)).toBeLessThan(0.02);
    const up = Stretch.process(chs, sr, 0.5, 12)[0];
    expect(level(up, 440)).toBeGreaterThan(0.2);
    expect(level(up, 220)).toBeLessThan(0.02);
    const down = Stretch.process(chs, sr, 1, -12)[0];
    expect(level(down, 110)).toBeGreaterThan(0.2);
    expect(level(down, 220)).toBeLessThan(0.02);
  });

  it('finds the clicks as onsets', () => {
    const on = Stretch.findOnsets(tone(3, [220], false), sr);
    expect(on.length).toBeGreaterThanOrEqual(8);
    on.forEach(p => expect(Math.min(p % 5512, 5512 - (p % 5512))).toBeLessThan(600));
  });
});
