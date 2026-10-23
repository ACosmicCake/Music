import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';

/* Just enough of the Web Audio API to see what the engine schedules: sources remember when they were
   started and stopped, and gains the automation they were given. The clock only moves when a test moves it. */
class Param {
  constructor(v) { this.value = v; this.events = []; }
  setValueAtTime(v, t) { this.events.push(['set', v, t]); }
  linearRampToValueAtTime(v, t) { this.events.push(['ramp', v, t]); }
  exponentialRampToValueAtTime(v, t) { this.events.push(['exp', v, t]); }
  setTargetAtTime(v, t) { this.events.push(['target', v, t]); }
  cancelScheduledValues(t) { this.events.push(['cancel', t]); }
  cancelAndHoldAtTime(t) { this.events.push(['hold', t]); }
}
class Node {
  constructor() { ['gain', 'frequency', 'Q', 'pan', 'playbackRate', 'detune', 'threshold', 'ratio'].forEach(k => { this[k] = new Param(1); }); }
  connect(n) { return n; }
  disconnect() {}
}
class Source extends Node {
  start(t) { this.startAt = t; }
  stop(t = 0) { this.stopAt = t; }
  addEventListener() {}
}
class Ctx {
  constructor() { this.currentTime = 1; this.sampleRate = 4000; this.state = 'running'; this.destination = new Node(); }
  createGain() { return new Node(); }
  createBiquadFilter() { return new Node(); }
  createDynamicsCompressor() { return new Node(); }
  createWaveShaper() { return new Node(); }
  createConvolver() { return new Node(); }
  createStereoPanner() { return new Node(); }
  createBufferSource() { return new Source(); }
  createOscillator() { return new Source(); }
  createBuffer(ch, len, sr) { const d = Array.from({ length: ch }, () => new Float32Array(len)); return { getChannelData: i => d[i], duration: len / sr, length: len }; }
  resume() {}
}

let A, ctx;
const made = [];
beforeAll(async () => {
  globalThis.window = { AudioContext: function () { ctx = new Ctx(); const cbs = ctx.createBufferSource.bind(ctx), osc = ctx.createOscillator.bind(ctx); ctx.createBufferSource = () => { const s = cbs(); made.push(s); return s; }; ctx.createOscillator = () => { const s = osc(); made.push(s); return s; }; return ctx; } };
  A = (await import('../src/audio.js')).default;
  A.ensure();
});
afterEach(() => { A.stopAll(); made.length = 0; vi.useRealTimers(); });

const fadedOut = s => s.stopAt > ctx.currentTime && s.stopAt < ctx.currentTime + 0.1;

describe('pressing play again starts over', () => {
  it('fades out a note that is still ringing instead of letting it pile up under the next', () => {
    A.note(60, ctx.currentTime, 0.8, 1.6);
    const [src] = made;
    expect(src.stopAt).toBeGreaterThan(ctx.currentTime + 1.6);
    A.fresh();
    expect(fadedOut(src)).toBe(true);
  });
  it('cancels the notes of a phrase that have not started yet', () => {
    const t = ctx.currentTime;
    [60, 62, 64].forEach((m, i) => A.note(m, t + 1 + i * 0.5, 0.8, 0.4));
    A.fresh();
    made.forEach(s => expect(s.stopAt).toBe(0)); // stopped before its start: it never sounds
  });
  it('cancels the timers that light up a one-shot sound, and puts the display back', () => {
    vi.useFakeTimers();
    const ran = vi.fn(), undo = vi.fn();
    A.later(ran, 500, undo);
    A.fresh();
    vi.advanceTimersByTime(600);
    expect(ran).not.toHaveBeenCalled();
    expect(undo).toHaveBeenCalledOnce();
  });
  it('leaves the metronome, drones and the band alone', () => {
    vi.useFakeTimers();
    const loop = A.Loop({ steps: 4, stepDur: () => 0.05, onStep: (i, t) => A.hit('click', t, 0.9) });
    loop.start();
    const clicks = made.slice();
    expect(clicks.length).toBeGreaterThan(0);
    A.fresh();
    clicks.forEach(s => expect(s.stopAt).toBeGreaterThan(ctx.currentTime + 0.05));
    expect(loop.running).toBe(true);
    loop.stop();
  });
  it('stops a loop a play button started to be heard once, and resets its button', () => {
    vi.useFakeTimers();
    const onEnd = vi.fn();
    const loop = A.Loop({ shot: true, steps: 8, maxSteps: 16, stepDur: () => 0.25, onStep: (i, t) => A.hit('low', t, 0.9), onEnd });
    loop.start();
    A.fresh();
    expect(loop.running).toBe(false);
    expect(onEnd).toHaveBeenCalledOnce();
    made.forEach(s => expect(s.stopAt === 0 || fadedOut(s)).toBe(true));
  });
  it('stopping a loop cancels the clicks it had already scheduled ahead', () => {
    vi.useFakeTimers();
    const loop = A.Loop({ steps: 4, stepDur: () => 0.03, onStep: (i, t) => A.hit('click', t, 0.9) });
    loop.start();
    expect(made.length).toBeGreaterThan(0);
    loop.stop();
    made.forEach(s => expect(s.stopAt).toBe(0));
  });
});

describe('a loop after the page slept', () => {
  it('skips the steps that went by instead of playing them all at once, and keeps the beat', () => {
    vi.useFakeTimers();
    const steps = [];
    const loop = A.Loop({ steps: 4, stepDur: () => 0.125, onStep: (i, t) => { steps.push([i, t]); A.hit('click', t, 0.9); } });
    loop.start();
    const t0 = steps[0][1], before = steps.length;
    ctx.currentTime += 600; // ten minutes with the screen off: the audio clock ran, the timers didn't
    vi.advanceTimersByTime(25);
    const after = steps.slice(before);
    expect(after.length).toBeGreaterThan(0);
    expect(after.length).toBeLessThan(5); // the look-ahead's worth, not 4800 clicks
    after.forEach(([i, t]) => {
      expect(t).toBeGreaterThanOrEqual(ctx.currentTime);
      const k = (t - t0) / 0.125; // still on the same grid
      expect(Math.abs(k - Math.round(k))).toBeLessThan(1e-3);
      expect(Math.round(k) % 4).toBe(i);
    });
    loop.stop();
  });
  it('ends a play-once loop whose steps all went by while asleep', () => {
    vi.useFakeTimers();
    const onEnd = vi.fn(), onStep = vi.fn();
    const loop = A.Loop({ steps: 4, maxSteps: 8, stepDur: () => 0.25, onStep, onEnd });
    loop.start();
    const n = onStep.mock.calls.length;
    ctx.currentTime += 60;
    vi.advanceTimersByTime(200);
    expect(onStep.mock.calls.length).toBe(n);
    expect(onEnd).toHaveBeenCalledOnce();
    expect(loop.running).toBe(false);
  });
});
