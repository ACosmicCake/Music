import './env.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import E from '../src/engine.js';
import { BLOCKS, totalOf, paramsFor } from '../src/routines.js';
import { GO_GROUPS, GO_KEYS, groupOf, goBlock, commuteBlocks, planRide, mineBlocks, toMine, DEFAULT_MINE } from '../src/commuteplan.js';

/* On the go (src/commuteplan.js): no guitar blocks in a ride, what to include, and your own commute. */

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-20T08:00:00'));
  E.resetAll();
});
afterEach(() => vi.useRealTimers());

const NEEDS_GUITAR = ['scalewarm', 'technique', 'callresp', 'drill', 'free', 'transcribe', 'metronome', 'explorer', 'drone'];

describe('commuteBlocks', () => {
  it('swaps guitar blocks, and a swapped block no longer grades the planned item', () => {
    const out = commuteBlocks([
      { id: 'a', type: 'scalewarm', minutes: 5, params: { scale: 'dorian', tonic: 2 }, cur: 'warm:dorian', isNew: true },
      { id: 'b', type: 'technique', minutes: 5, params: { exercise: 'spider' }, cur: 'tech:spider' },
      { id: 'c', type: 'repertoire', minutes: 5, params: { tune: 'autumn' }, cur: 'tune:autumn' }
    ]);
    expect(out.map(b => b.type)).toEqual(['away', 'away', 'repertoire']);
    expect(out[0].params).toEqual({ drill: 'visualise', scale: 'dorian', tonic: 2 });
    expect(out[0].cur).toBeUndefined();
    expect(out[0].isNew).toBeUndefined();
    expect(out[1].cur).toBeUndefined();
    expect(out[2]).toMatchObject({ cur: 'tune:autumn', params: { tune: 'autumn', ear: true } });
  });
});

describe('planRide', () => {
  it('fills the ride with phone-only blocks', () => {
    [5, 15, 30, 60].forEach(m => {
      const blocks = planRide(m);
      expect(totalOf(blocks)).toBe(m);
      blocks.forEach(b => expect(NEEDS_GUITAR).not.toContain(b.type));
    });
  });
  it('leaves out what you turn off, and stays as long', () => {
    const skip = ['ear', 'body', 'tunes'];
    for (let k = 0; k < 10; k++) {
      const blocks = planRide(20, skip);
      expect(totalOf(blocks)).toBe(20);
      expect(blocks.length).toBeGreaterThan(1);
      blocks.forEach(b => expect(skip).not.toContain(groupOf(b)));
    }
  });
  it('can be only one kind of practice', () => {
    const skip = Object.keys(GO_GROUPS).filter(g => g !== 'rhythm');
    const blocks = planRide(15, skip);
    expect(totalOf(blocks)).toBe(15);
    blocks.forEach(b => expect(groupOf(b)).toBe('rhythm'));
  });
});

describe('your own commute', () => {
  it('turns a saved list into blocks fitted to the ride, and back', () => {
    const blocks = mineBlocks(DEFAULT_MINE, 30);
    expect(totalOf(blocks)).toBe(30);
    expect(toMine(blocks).map(x => x.key)).toEqual(DEFAULT_MINE.map(x => x.key));
    expect(totalOf(mineBlocks(DEFAULT_MINE, null))).toBe(15);
  });
  it('ignores entries it does not know (an older or newer app wrote them)', () => {
    expect(mineBlocks([{ key: 'technique', minutes: 5 }, { key: 'nope' }, null, { key: 'away:sing', minutes: 3 }], null).map(b => b.type)).toEqual(['away']);
  });
  it('every kind on offer opens its tool on the phone', () => {
    GO_KEYS.forEach(k => {
      const b = goBlock(k, 4);
      expect(BLOCKS[b.type]).toBeTruthy();
      expect(b.minutes).toBe(4);
      const p = paramsFor(b);
      if (k.startsWith('away:')) expect(p.drill).toBe(k.slice(5));
      if (k === 'repertoire') expect(p.ear).toBe(true);
      if (k === 'sightread') expect(p.mode).toBe('notes');
    });
  });
});
