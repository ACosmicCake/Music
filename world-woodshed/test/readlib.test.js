import './env.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import E from '../src/engine.js';
import RL from '../src/readlib.js';
import { LEVELS, genMelody, rhythmPiece } from '../src/content/reading.js';

/* The reading library (src/readlib.js): pieces are stored as short strings, and missed reads come back
   after a growing gap. */

const T0 = new Date('2026-10-20T10:00:00').getTime();
const DAY = 864e5;
beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(T0); E.resetAll(); });
afterEach(() => vi.useRealTimers());

describe('compact encoding', () => {
  it('round-trips pitches, rests, dots, ties and spellings', () => {
    const piece = { key: 'Bb', time: '6/8', bars: [
      [{ midi: 70, dur: 'q', dot: true }, { midi: null, dur: '8' }, { midi: 61, dur: '8', spell: 'b' }, { midi: 61, dur: 'q', tie: true, spell: '#' }],
      [{ midi: 72, dur: 'h', dot: true }]
    ] };
    const code = RL.encode(piece);
    expect(code).toBe('Bb/6/8/70q. r8 618b 61q~#|72h.');
    expect(RL.decode(code)).toEqual(piece);
  });
  it('round-trips generated melodies and rhythms at every level', () => {
    for (const [lv, L] of LEVELS.entries()) {
      for (let k = 0; k < 5; k++) {
        const pieces = [genMelody(L), rhythmPiece(L)];
        pieces.forEach(p => {
          const small = { key: p.key, time: p.time, bars: p.bars };
          const back = RL.decode(RL.encode(small));
          expect(RL.encode(back), 'level ' + lv).toBe(RL.encode(small));
          expect(back.bars.flat().map(n => n.midi ?? null)).toEqual(small.bars.flat().map(n => n.midi ?? null));
        });
      }
    }
  });
});

describe('re-reads', () => {
  const piece = { key: 'C', time: '4/4', bars: [[{ midi: 60, dur: 'w' }]] };
  it('a clean first read (90% or better) never comes back', () => {
    const p = RL.record({ piece, entry: null }, 1, 'melody', 0.95, 80);
    expect(p.due).toBeNull();
  });
  it('a missed read comes back after a day, then at 2.5× the gap, up to three weeks', () => {
    const cur = { piece, entry: null };
    const p = RL.record(cur, 1, 'melody', 0.7, 80);
    expect(p.due).toBe(T0 + DAY);
    const gaps = [];
    for (let i = 1; i <= 5; i++) { vi.setSystemTime(T0 + i * 30 * DAY); RL.record(cur, 1, 'melody', 0.7, 80); gaps.push(p.gap); }
    expect(gaps).toEqual([3, 8, 20, 21, 21]);
  });
  it('a bad read (under 50%) resets the gap to a day', () => {
    const cur = { piece, entry: null };
    const p = RL.record(cur, 1, 'melody', 0.7, 80);
    vi.setSystemTime(T0 + 2 * DAY); RL.record(cur, 1, 'melody', 0.7, 80);
    expect(p.gap).toBe(3);
    vi.setSystemTime(T0 + 6 * DAY); RL.record(cur, 1, 'melody', 0.3, 80);
    expect(p.gap).toBe(1);
  });
  it('an immediate retry in the same sitting does not move the next re-read', () => {
    const cur = { piece, entry: null };
    const p = RL.record(cur, 1, 'melody', 0.6, 80);
    vi.setSystemTime(T0 + 5 * 60e3);
    RL.record(cur, 1, 'melody', 1, 80);
    expect(p.due).toBe(T0 + DAY);
    expect(p.reads).toHaveLength(2);
  });
  it('deleting a piece leaves a tombstone so a sync does not bring it back', () => {
    const p = RL.record({ piece, entry: null }, 1, 'melody', 0.6, 80);
    RL.remove(p.id);
    expect(E.state.readLib.pieces[p.id]).toBeUndefined();
    expect(E.state.tomb['piece:' + p.id]).toBe(T0);
  });
});
