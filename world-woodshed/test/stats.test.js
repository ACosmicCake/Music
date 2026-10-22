import './env.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import St from '../src/stats.js';
import E from '../src/engine.js';
import Cur from '../src/curriculum.js';

/* The Statistics page's numbers (src/stats.js): weeks of practice added up over every device, minutes and
   accuracy per skill, and what falls due by tomorrow night. */

const NOW = new Date('2026-10-21T15:00:00').getTime(); // a Wednesday
const DAY = 864e5;
const key = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const daysAgo = n => key(NOW - n * DAY);

describe('weekStart', () => {
  it('is the Monday of the week, Sunday belonging to the week before', () => {
    expect(key(St.weekStart(NOW))).toBe('2026-10-19');
    expect(key(St.weekStart(new Date('2026-10-25T22:00:00').getTime()))).toBe('2026-10-19');
    expect(key(St.weekStart(new Date('2026-10-26T01:00:00').getTime()))).toBe('2026-10-26');
  });
});

describe('dayTotal', () => {
  it('adds up every device', () => {
    const hdev = {
      phone: { '2026-10-21': { sec: 600, q: 10, c: 8, by: { intervals: [10, 8, 300] } } },
      laptop: { '2026-10-21': { sec: 1200, q: 4, c: 2, by: { intervals: [4, 2, 120], technique: [0, 0, 900] } } }
    };
    expect(St.dayTotal(hdev, '2026-10-21')).toEqual({ sec: 1800, q: 14, c: 10, by: { intervals: [14, 10, 420], technique: [0, 0, 900] } });
  });
  it('copes with missing days, devices and old two-number skill records', () => {
    expect(St.dayTotal(undefined, '2026-10-21')).toEqual({ sec: 0, q: 0, c: 0, by: {} });
    expect(St.dayTotal({ a: null, b: { '2026-10-21': { sec: 60, by: { chords: [3, 2] } } } }, '2026-10-21'))
      .toEqual({ sec: 60, q: 0, c: 0, by: { chords: [3, 2, 0] } });
  });
});

describe('weeks', () => {
  const hdev = {
    phone: {
      [daysAgo(0)]: { sec: 900, q: 20, c: 15, by: { intervals: [20, 15, 600] } },        // this week
      [daysAgo(2)]: { sec: 600, q: 0, c: 0, by: { technique: [0, 0, 600] } },             // Monday, this week
      [daysAgo(3)]: { sec: 1200, q: 10, c: 5, by: { intervals: [10, 5, 300] } },          // Sunday, last week
      [daysAgo(40)]: { sec: 6000, q: 0, c: 0, by: {} }                                     // too old for 4 weeks
    },
    laptop: { [daysAgo(0)]: { sec: 300, q: 0, c: 0, by: { technique: [0, 0, 300] } } }
  };
  const ws = St.weeks(hdev, 4, NOW);
  it('gives n Monday-to-Sunday weeks, oldest first, ending with this one', () => {
    expect(ws.map(w => w.key)).toEqual(['2026-09-28', '2026-10-05', '2026-10-12', '2026-10-19']);
  });
  it('adds minutes and answers per skill across devices and days', () => {
    const w = ws[3];
    expect(w.min).toBeCloseTo(30);
    expect(w.skills.intervals).toEqual({ min: 10, q: 20, c: 15 });
    expect(w.skills.technique.min).toBeCloseTo(15);
    expect(w.q).toBe(20); expect(w.c).toBe(15);
    expect(ws[2].skills.intervals).toEqual({ min: 5, q: 10, c: 5 });
    expect(ws[0].min).toBe(0);
  });
  it('counts time not tied to a skill as other', () => {
    expect(ws[3].other).toBeCloseTo(5);   // 900 s on the phone today, 600 of it intervals
    expect(ws[2].other).toBeCloseTo(15);  // 1200 s, 300 of it intervals
  });
  it('lists the skills practised, most minutes first, then most answers', () => {
    expect(St.skillsIn(ws)).toEqual(['intervals', 'technique']); // 15 minutes each; intervals has the answers
    expect(St.skillsIn(St.weeks(hdev, 1, NOW))).toEqual(['technique', 'intervals']);
    expect(St.skillsIn([])).toEqual([]);
  });
});

describe('accuracy', () => {
  const wk = skills => ({ skills });
  const ws = [wk({ chords: { q: 20, c: 10 } }), wk({}), wk({ chords: { q: 10, c: 9 } }), wk({ chords: { q: 10, c: 7 } })];
  it('gives the accuracy per week, null without answers', () => {
    expect(St.accuracySeries(ws, 'chords')).toEqual([0.5, null, 0.9, 0.7]);
    expect(St.accuracySeries(ws, 'intervals')).toEqual([null, null, null, null]);
  });
  it('compares the later half of the weeks with the earlier half, pooled over answers', () => {
    expect(St.accuracyChange(ws, 'chords')).toBeCloseTo(0.8 - 0.5);
  });
  it('says nothing until both halves have enough answers', () => {
    expect(St.accuracyChange(ws, 'chords', 25)).toBeNull();
    expect(St.accuracyChange(ws, 'intervals')).toBeNull();
  });
});

describe('quizDue and endOfTomorrow', () => {
  it('ends tomorrow at midnight, local time', () => {
    const t = St.endOfTomorrow(NOW);
    expect(key(t)).toBe('2026-10-22');
    expect(key(t + 1)).toBe('2026-10-23');
  });
  it('counts quiz items due by the time, per skill', () => {
    const skills = {
      intervals: { items: { m3: { due: NOW - 1 }, P5: { due: NOW + DAY }, M7: { due: NOW + 3 * DAY } } },
      chords: { items: { maj: { due: NOW + 3 * DAY } } },
      degrees: { items: {} }
    };
    expect(St.quizDue(skills, NOW)).toEqual({ intervals: 1 });
    expect(St.quizDue(skills, St.endOfTomorrow(NOW))).toEqual({ intervals: 2 });
    expect(St.quizDue(undefined, NOW)).toEqual({});
  });
});

describe('dueAt: the planner\'s reviews by a time', () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(NOW); E.resetAll(); });
  afterEach(() => vi.useRealTimers());
  it('follows the planner\'s rule: due once 90% of the stability has passed, most overdue first', () => {
    Cur.review('warm:major', 'easy');       // s = 3 days
    Cur.review('rhythm:son32', 'good');     // s = 1 day
    expect(Cur.dueAt(NOW)).toEqual([]);
    const tomorrow = Cur.dueAt(St.endOfTomorrow(NOW));
    expect(tomorrow.map(x => x.id)).toEqual(['rhythm:son32']);
    expect(tomorrow[0].kindName).toBe('rhythm');
    expect(tomorrow[0].recall).toBeLessThan(0.95);
    expect(Cur.dueAt(NOW + 4 * DAY).map(x => x.id)).toEqual(['rhythm:son32', 'warm:major']);
  });
  it('ignores items no longer in the catalogue', () => {
    Cur.review('warm:major', 'good');
    E.state.cur.items['tune:gone'] = { s: 1, last: NOW - 5 * DAY, n: 1 };
    expect(Cur.dueAt(NOW + 2 * DAY).map(x => x.id)).toEqual(['warm:major']);
  });
});

describe('time on each scale', () => {
  const scaleTime = {
    phone: { 'major:7': { v: 600, p: 0, last: 5 }, 'major:0': { v: 60, p: 30, last: 9 }, 'phrygian-dominant:4': { v: 0, p: 1200, last: 3 } },
    desk: { 'major:7': { v: 0, p: 900, last: 7 }, 'dorian:2': { v: 0, p: 0, last: 1 } }
  };
  it('adds up every device, per scale and per key, most time first', () => {
    const list = St.scaleTotals(scaleTime);
    expect(list.map(x => x.scale)).toEqual(['major', 'phrygian-dominant']);
    expect(list[0]).toMatchObject({ v: 660, p: 930, total: 1590, last: 9 });
    expect(list[0].keys).toEqual([{ tonic: 7, v: 600, p: 900, total: 1500 }, { tonic: 0, v: 60, p: 30, total: 90 }]);
  });
  it('gives one scale in one key or in every key', () => {
    expect(St.scaleTimeOf(scaleTime, 'major', 7)).toEqual({ v: 600, p: 900 });
    expect(St.scaleTimeOf(scaleTime, 'major')).toEqual({ v: 660, p: 930 });
    expect(St.scaleTimeOf(scaleTime, 'major', 5)).toEqual({ v: 0, p: 0 });
    expect(St.scaleTimeOf(undefined, 'major')).toEqual({ v: 0, p: 0 });
  });
});

describe('addScaleTime', () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(NOW); E.resetAll(); });
  afterEach(() => vi.useRealTimers());
  it('keeps seen-in-your-head and played time apart, per scale and key, on this device', () => {
    E.addScaleTime('v', 'major', 7, 5);
    E.addScaleTime('v', 'major', 7, 5.04);
    E.addScaleTime('p', 'major', 19, 30); // 19 is G again, an octave up
    E.addScaleTime('x', 'major', 7, 5);  // not a kind
    E.addScaleTime('v', 'major', 7, -3);
    expect(E.state.scaleTime[E.device()]).toEqual({ 'major:7': { v: 10, p: 30, last: NOW } });
  });
  it('never adds more than ten minutes at once', () => {
    E.addScaleTime('p', 'dorian', 2, 5000);
    expect(St.scaleTimeOf(E.state.scaleTime, 'dorian', 2).p).toBe(600);
  });
});
