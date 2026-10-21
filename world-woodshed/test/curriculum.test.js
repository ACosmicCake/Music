import './env.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import E from '../src/engine.js';
import Cur from '../src/curriculum.js';

/* The smart practice engine (src/curriculum.js): the FSRS-style memory model, how practice changes
   an item's stability, the daily cap on new material, and planning a session for the minutes you have. */

const T0 = new Date('2026-10-20T10:00:00').getTime();
const HOUR = 36e5, DAY = 864e5;
const at = t => vi.setSystemTime(t);
const item = id => E.state.cur.items[id];

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  at(T0);
  E.resetAll();
});
afterEach(() => vi.useRealTimers());

describe('recall curve', () => {
  it('predicts 90% recall exactly when the elapsed days equal the stability', () => {
    const it = { s: 5, last: T0 };
    expect(Cur.recall(it, T0)).toBe(1);
    expect(Cur.recall(it, T0 + 5 * DAY)).toBeCloseTo(0.9);
    expect(Cur.recall(it, T0 + 50 * DAY)).toBeLessThan(0.5);
  });
  it('is 0 for something never practised', () => {
    expect(Cur.recall(undefined)).toBe(0);
  });
});

describe('review: how stability changes', () => {
  const id = 'rhythm:son32';
  it('a first practice sets the starting stability by how it went', () => {
    expect(Cur.review('warm:major', 'again').item.s).toBe(0.3);
    expect(Cur.review('warm:minpent', 'hard').item.s).toBe(0.5);
    expect(Cur.review('warm:aeolian', 'good').item.s).toBe(1);
    expect(Cur.review('warm:majpent', 'easy').item.s).toBe(3);
  });
  it('massed repetition within two hours barely helps', () => {
    Cur.review(id, 'good');
    at(T0 + HOUR);
    expect(Cur.review(id, 'easy').item.s).toBeCloseTo(1.05);
  });
  it('a good review later the same day helps a little, a hard one not at all', () => {
    Cur.review(id, 'good');
    at(T0 + 5 * HOUR);
    expect(Cur.review(id, 'good').item.s).toBeCloseTo(1.15);
    at(T0 + 10 * HOUR);
    expect(Cur.review(id, 'hard').item.s).toBeCloseTo(1.15);
  });
  it('a review at the due point grows stability most; waiting longer counts up to 1.5×', () => {
    Cur.review(id, 'easy');                 // s = 3
    at(T0 + 3 * DAY);
    expect(Cur.review(id, 'good').item.s).toBeCloseTo(3 * (1 + 1 * 1.5)); // f = 1
    const s = item(id).s;                   // 7.5
    at(T0 + 3 * DAY + 30 * DAY);
    expect(Cur.review(id, 'easy').item.s).toBeCloseTo(s * (1 + 1.5 * 2.5)); // f capped at 1.5
  });
  it('a lapse cuts stability to 30% (never below half a day) and counts the lapse', () => {
    Cur.review(id, 'easy');
    at(T0 + DAY);
    const r = Cur.review(id, 'again').item;
    expect(r.s).toBeCloseTo(0.9);
    expect(r.lapses).toBe(1);
    at(T0 + 2 * DAY);
    expect(Cur.review(id, 'again').item.s).toBe(0.5);
  });
  it('caps motor skills at 90 days and knowledge at a year', () => {
    Cur.review(id, 'easy'); item(id).s = 80;
    at(T0 + 120 * DAY);
    expect(Cur.review(id, 'easy').item.s).toBe(90);
    const les = 'lesson:' + Cur.catalog().find(x => x.kind === 'lesson').ref;
    Cur.review(les, 'easy'); item(les).s = 300;
    at(T0 + 120 * DAY + 400 * DAY);
    expect(Cur.review(les, 'easy').item.s).toBe(365);
  });
  it('remembers the tempo and the key it was last played in', () => {
    Cur.review('warm:major', 'good', { bpm: 92, key: 7 });
    expect(item('warm:major')).toMatchObject({ bpm: 92, keys: { 7: T0 } });
  });
});

describe('gradeFromScore', () => {
  it('turns a score from 0 to 1 into a grade', () => {
    expect([0.95, 0.9, 0.8, 0.72, 0.6, 0.5, 0.49, 0].map(Cur.gradeFromScore))
      .toEqual(['easy', 'easy', 'good', 'good', 'hard', 'hard', 'again', 'again']);
  });
});

describe('new material per day', () => {
  it('stops offering new motor items once the day\'s budget is used (gentle pace: one a day)', () => {
    Cur.setPrefs({ pace: 'gentle' });
    // introduce one item of every kind first, so no "first of its kind" starter is free
    ['warm:major', 'tech:altpick', 'rhythm:son32'].forEach(id => Cur.review(id, 'good'));
    at(T0 + 6 * HOUR);
    const r = Cur.choose('warm', Cur.context(), new Set(['warm:major']));
    expect(r === null || !r.isNew).toBe(true);
  });
  it('waits four hours after a new motor skill before the next one', () => {
    Cur.setPrefs({ pace: 'fast' });
    ['warm:major', 'tech:altpick'].forEach(id => Cur.review(id, 'good'));
    // yesterday's items, so only the four-hour rule can block
    E.state.cur.days = {};
    Object.values(E.state.cur.items).forEach(it => { it.last -= DAY; it.intro -= DAY; it.s = 30; }); // and not due
    Cur.review('rhythm:son32', 'good');
    at(T0 + 2 * HOUR);
    const ctx = Cur.context();
    expect(ctx.newMotorToday).toBe(1);
    const r = Cur.choose('tech', ctx, new Set());
    expect(r.isNew).toBeFalsy();
    expect(r.why).toMatch(/under 4 hours ago/);
  });
  it('brings something new from earlier today back after four hours as a same-day review', () => {
    Cur.review('warm:major', 'good');
    at(T0 + 5 * HOUR);
    const r = Cur.choose('warm', Cur.context());
    expect(r.item.id).toBe('warm:major');
    expect(r.tag).toBe('review');
    expect(r.why).toMatch(/Same-day review/);
  });
});

describe('planSession', () => {
  const total = blocks => blocks.reduce((a, b) => a + b.minutes, 0);
  it('fills exactly the minutes asked for, for short and long sessions', () => {
    [10, 15, 20, 30, 45, 60, 90, 120].forEach(m => {
      E.resetAll();
      const { blocks } = Cur.planSession(m);
      expect(total(blocks), m + ' min').toBe(m);
      blocks.forEach(b => expect(b.minutes, m + ' min ' + b.type).toBeGreaterThanOrEqual(1));
    });
  });
  // The shortest On the go ride: two blocks of at least two minutes, not three (which made it 6 minutes).
  it('fits a 5-minute session in 5 minutes', () => {
    for (let i = 0; i < 20; i++) {
      const p = Cur.planSession(5).blocks;
      expect(total(p)).toBe(5);
      expect(p[0].type).toBe('scalewarm');
    }
  });
  it('starts with a scale warm-up', () => {
    expect(Cur.planSession(30).blocks[0].type).toBe('scalewarm');
  });
  it('adds two-minute hand breaks only in sessions of 45 minutes or more', () => {
    expect(Cur.planSession(40).blocks.filter(b => b.type === 'break')).toHaveLength(0);
    const long = Cur.planSession(90).blocks.filter(b => b.type === 'break');
    expect(long.length).toBeGreaterThan(0);
    long.forEach(b => expect(b.minutes).toBe(2));
  });
  it('knows about earlier sessions today', () => {
    const first = Cur.planSession(20);
    expect(first.ctx.sessionNo).toBe(1);
    E.startSession({ name: 'Smart', blocks: first.blocks });
    E.state.session.blocks.forEach(b => { b.done = true; });
    Cur.logSession(E.state.session, 20);
    E.endSession();
    at(T0 + 3 * HOUR);
    const ctx = Cur.planSession(20).ctx;
    expect(ctx.sessionNo).toBe(2);
    expect(ctx.minutesToday).toBe(20);
    expect(ctx.sinceLast).toBeCloseTo(3, 0);
  });
  it('never plans more than one new item in a session once the starters are in', () => {
    // a player with one item of every kind already learned yesterday
    Cur.setPrefs({ pace: 'fast' });
    ['warm', 'tech', 'rhythm', 'tune', 'drill'].forEach(k => { const x = Cur.catalog().find(c => c.kind === k); if (x) Cur.review(x.id, 'good'); });
    E.state.cur.days = {};
    Object.values(E.state.cur.items).forEach(it => { it.last -= DAY; it.intro -= DAY; });
    const { blocks } = Cur.planSession(60);
    expect(blocks.filter(b => b.isNew).length).toBeLessThanOrEqual(1);
  });
});
