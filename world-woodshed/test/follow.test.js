import { describe, it, expect } from 'vitest';
import { TPQ, expectedFrom, follower, summarize } from '../src/follow.js';

/* Following you through a score (src/follow.js): heard notes matched to written ones, by pitch class and time. */

const Q = TPQ; // a quarter note in ticks
// four quarters at 60 bpm (a second each): C D E F, then a bar of G (half) and a tie into another G
const beats = [
  { tick: 0, bar: 0, notes: [{ midi: 60 }] }, { tick: Q, bar: 0, notes: [{ midi: 62 }] },
  { tick: 2 * Q, bar: 0, notes: [{ midi: 64 }] }, { tick: 3 * Q, bar: 0, notes: [{ midi: 65 }] },
  { tick: 4 * Q, bar: 1, notes: [{ midi: 67 }] }, { tick: 6 * Q, bar: 1, notes: [{ midi: 67, isTieDestination: true }] },
  { tick: 7 * Q, bar: 1, isRest: true, notes: [] }
];
const exp = expectedFrom(beats);

describe('the notes to play', () => {
  it('leaves out rests and notes tied over', () => {
    expect(exp.map(e => e.midis[0])).toEqual([60, 62, 64, 65, 67]);
  });
});

describe('matching what the mic hears', () => {
  it('marks notes in time as right, whatever the octave', () => {
    const f = follower(exp, 60);
    expect(f.heard(0.05 * Q, 48).mark).toBe('right'); // C an octave down, 50 ms late
    expect(f.heard(Q, 62).mark).toBe('right');
  });
  it('tells early from late, and a wrong note from a right one', () => {
    const f = follower(exp, 60);
    expect(f.heard(2 * Q - 0.25 * Q, 64).mark).toBe('early'); // 250 ms early at 60 bpm
    expect(f.heard(3 * Q + 0.2 * Q, 65).mark).toBe('late');
    expect(f.heard(4 * Q, 66).mark).toBe('wrong');
  });
  it('counts the same tolerance in seconds at any tempo', () => {
    // at 120 bpm a quarter is half a second: 0.2 of a quarter is 100 ms, still in time
    expect(follower(exp, 120).heard(Q + 0.2 * Q, 62).mark).toBe('right');
    expect(follower(exp, 60).heard(Q + 0.2 * Q, 62).mark).toBe('late');
  });
  it('takes a tap (no pitch) as the written note, so tapping marks timing only', () => {
    const f = follower(exp, 60);
    expect(f.heard(0.3 * Q, null).mark).toBe('late');
    expect(f.heard(Q, null).mark).toBe('right');
  });
  it('ignores what is nowhere near a written note', () => {
    const f = follower(exp, 60);
    expect(f.heard(10 * Q, 60)).toBe(null);
  });
  it('a slip then the right note keeps the better mark, and a right note is not taken over by a stray one', () => {
    const f = follower(exp, 60);
    f.heard(0, 61); // wrong
    expect(f.heard(0.05 * Q, 60).mark).toBe('right');
    f.heard(Q, 62);
    f.heard(Q + 0.1 * Q, 63); // a stray note just after: goes nowhere better than the open note
    expect(f.result().marks[1]).toBe('right');
  });
  it('marks the notes left behind as missed, and sums up the pass with the bars to work on', () => {
    const f = follower(exp, 60);
    f.heard(0, 60); f.heard(Q, 62); f.heard(2 * Q, 64); f.heard(3 * Q + 0.25 * Q, 65);
    f.passed(6 * Q);
    const r = f.result();
    expect(r.marks).toEqual(['right', 'right', 'right', 'late', 'missed']);
    expect(r.summary).toMatchObject({ total: 5, right: 3, timing: 1, wrong: 0, missed: 1, bars: [2, 1] });
    expect(r.summary.score).toBeCloseTo(0.7);
  });
});

describe('summing up', () => {
  it('scores nothing played as 0, and leaves unreached notes out', () => {
    expect(summarize(exp, exp.map(() => null))).toMatchObject({ total: 0, score: 0, bars: [] });
  });
});
