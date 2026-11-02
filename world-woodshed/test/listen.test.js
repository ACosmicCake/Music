import { describe, it, expect } from 'vitest';
import { Analyzer, detectPitch, freqToMidi } from '../src/analyzer.js';

/* Plucked strings (Karplus-Strong) and the rooms they are heard in. Recorded guitars and a laptop-mic model
   are in scripts/listen/bench.mjs; these keep the main behaviours from coming undone. */
const SR = 48000;
let seed = 7;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const hz = m => 440 * Math.pow(2, (m - 69) / 12);

function pluck(out, t, midi, amp, dur = 1.5, bright = 0.5) {
  const period = SR / hz(midi), n = Math.floor(period), frac = period - n;
  const line = new Float32Array(n + 2);
  for (let i = 0; i < line.length; i++) line[i] = rnd() * 2 - 1;
  let lp = 0; for (let i = 0; i < line.length; i++) { lp += bright * (line[i] - lp); line[i] = lp; }
  const s0 = Math.round(t * SR), len = Math.min(out.length - s0, Math.round(dur * SR));
  let p = 0, prev = 0;
  for (let i = 0; i < len; i++) {
    const a = line[p], b = line[(p + 1) % line.length];
    const v = a + frac * (b - a);
    const y = 0.996 * 0.5 * (v + prev); prev = v;
    line[p] = y; p = (p + 1) % n;
    const fade = i > len - 480 ? (len - i) / 480 : 1;
    out[s0 + i] += v * amp * fade;
  }
}
function highpass(x, f) { // a laptop mic: little below a few hundred Hz (two poles)
  for (let pass = 0; pass < 2; pass++) {
    const a = Math.exp(-2 * Math.PI * f / SR); let px = 0, py = 0;
    for (let i = 0; i < x.length; i++) { const y = a * (py + x[i] - px); px = x[i]; py = y; x[i] = y; }
  }
  return x;
}
function addNoise(x, rms) { for (let i = 0; i < x.length; i++) x[i] += (rnd() * 2 - 1) * rms * 1.73; return x; }
function listen(x, opts = {}) {
  const ev = [];
  const an = Analyzer(SR, { emit: e => ev.push(e), ...opts });
  for (let i = 0; i < x.length; i += 512) an.push(x.subarray(i, Math.min(x.length, i + 512)), i / SR);
  return { notes: ev.filter(e => e.type === 'note'), onsets: ev.filter(e => e.type === 'onset') };
}
const near = (notes, t) => notes.find(n => n.t > t - 0.06 && n.t < t + 0.15);

describe('detectPitch', () => {
  it('reads a steady tone across the guitar range', () => {
    for (const m of [40, 45, 52, 57, 64, 72, 81, 86]) {
      const x = new Float32Array(1024), f = hz(m);
      for (let i = 0; i < x.length; i++) x[i] = Math.sin(2 * Math.PI * f * i / 24000) + 0.4 * Math.sin(4 * Math.PI * f * i / 24000);
      expect(freqToMidi(detectPitch(x, 24000).freq)).toBeCloseTo(m, 1);
    }
  });
  it('hears a low note with a weak fundamental at its own octave, not the one above', () => {
    for (const m of [43, 45, 47]) {
      const x = new Float32Array(1024), f = hz(m);
      for (let i = 0; i < x.length; i++) x[i] = 0.15 * Math.sin(2 * Math.PI * f * i / 24000) + Math.sin(4 * Math.PI * f * i / 24000) + 0.2 * Math.sin(6 * Math.PI * f * i / 24000);
      expect(Math.round(freqToMidi(detectPitch(x, 24000).freq))).toBe(m);
    }
  });
  it('leaves out the metronome woodblock (about 1.38 kHz)', () => {
    const x = new Float32Array(1024);
    for (let i = 0; i < x.length; i++) x[i] = Math.sin(2 * Math.PI * 1380 * i / 24000);
    expect(detectPitch(x, 24000)).toBeNull();
  });
});

describe('Analyzer', () => {
  const melody = [52, 55, 57, 57, 59, 62, 64, 60, 45, 47, 48, 50, 67, 69, 72, 40];
  function phrase(amp, opts = {}) {
    const x = new Float32Array(SR * (melody.length * 0.4 + 1.5));
    melody.forEach((m, i) => pluck(x, 0.6 + i * 0.4, m, amp * (0.6 + 0.4 * rnd()), 0.39));
    if (opts.hp) highpass(x, opts.hp);
    return addNoise(x, opts.noise || 0);
  }
  function score(x) {
    const { notes } = listen(x);
    const right = melody.filter((m, i) => { const n = near(notes, 0.6 + i * 0.4); return n && Math.round(n.midi) === m; }).length;
    return { right, extra: notes.length - right };
  }

  it('hears a phrase played at a normal level', () => {
    const r = score(phrase(0.3, { noise: 0.0005 }));
    expect(r.right).toBeGreaterThanOrEqual(melody.length - 1);
    expect(r.extra).toBeLessThanOrEqual(1);
  });
  it('hears the same phrase from a quiet laptop mic with no bass and a fan', () => {
    // peaks around -40 dBFS: the level a built-in mic gives with automatic gain off. The old fixed gates heard nothing.
    const r = score(phrase(0.01, { hp: 250, noise: 0.0003 }));
    expect(r.right).toBeGreaterThanOrEqual(melody.length - 2);
    expect(r.extra).toBeLessThanOrEqual(2);
  });
  it('hears a repeated note twice', () => {
    const x = new Float32Array(SR * 2);
    pluck(x, 0.5, 57, 0.2, 0.38); pluck(x, 0.9, 57, 0.2, 0.38); pluck(x, 1.3, 57, 0.2, 0.5);
    const { notes } = listen(addNoise(x, 0.0003));
    expect(notes.map(n => Math.round(n.midi))).toEqual([57, 57, 57]);
  });
  it('names a note once while it rings and fades', () => {
    for (const m of [40, 52, 64, 76]) {
      const x = new Float32Array(SR * 4.5);
      pluck(x, 0.5, m, 0.3, 4);
      const { notes } = listen(addNoise(highpass(x, 200), 0.0005));
      expect(notes.length).toBe(1);
      expect(Math.round(notes[0].midi)).toBe(m);
    }
  });
  it('hears nothing in a quiet room', () => {
    const { notes, onsets } = listen(addNoise(new Float32Array(SR * 5), 0.001));
    expect(notes.length).toBe(0);
    expect(onsets.length).toBe(0);
  });
  it('times an onset to within a few milliseconds', () => {
    const x = new Float32Array(SR * 2);
    pluck(x, 1.0, 50, 0.2, 0.8, 0.9);
    const { onsets } = listen(addNoise(x, 0.0005));
    expect(onsets.length).toBe(1);
    expect(Math.abs(onsets[0].t - 1.0)).toBeLessThan(0.004);
  });
});
