import './env.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import G from '../src/goals.js';
import E from '../src/engine.js';
import Cur from '../src/curriculum.js';

/* Streaks and the growing daily goal (src/goals.js), and the best streaks the engine keeps for good */

const NOW = new Date('2026-10-21T15:00:00').getTime(); // a Wednesday
const ago = n => G.dayBefore(NOW, n);
const day = min => ({ sec: min * 60, q: 0, c: 0, by: {} });
/* history with these minutes on these days ago: { 0: 30, 1: 45, … } */
const hist = m => Object.fromEntries(Object.entries(m).map(([n, min]) => [ago(+n), day(min)]));

describe('days', () => {
  it('steps by the calendar, across a daylight-saving change', () => {
    expect(G.dayBefore(new Date('2026-03-30T08:00:00').getTime(), 1)).toBe('2026-03-29');
    expect(G.dayBefore(new Date('2026-10-26T01:00:00').getTime(), 2)).toBe('2026-10-24');
    expect(G.daysBetween('2026-10-14', '2026-10-21')).toBe(7);
  });
});

describe('streaks', () => {
  it('runs up to today, or up to yesterday while today is still open', () => {
    const h = hist({ 1: 20, 2: 5, 3: 40, 5: 30 });
    expect(G.streaks(h, NOW)).toMatchObject({ current: 3, today: false, atRisk: true, best: 3 });
    h[ago(0)] = day(2);
    expect(G.streaks(h, NOW)).toMatchObject({ current: 4, today: true, atRisk: false, best: 4 });
  });
  it('counts a day by the chosen rule: any practice, n minutes, or the goal', () => {
    const h = hist({ 0: 25, 1: 12, 2: 40, 3: 8 });
    h[ago(4)] = { sec: 0, q: 3, c: 2, by: {} }; // answers only
    expect(G.streaks(h, NOW, { rule: 'any' }).current).toBe(5);
    expect(G.streaks(h, NOW, { rule: 10 }).current).toBe(3);
    expect(G.streaks(h, NOW, { rule: 20 }).current).toBe(1);
    expect(G.streaks(h, NOW, { rule: 'goal', goal: 30 })).toMatchObject({ current: 0, best: 1 });
  });
  it('judges each day by the goal that held then, so raising it keeps the days already met', () => {
    const h = hist({ 0: 50, 1: 35, 2: 35, 3: 35 });
    const log = [[ago(10), 30], [ago(0), 45]];
    expect(G.streaks(h, NOW, { log })).toMatchObject({ goal: 45, goalCurrent: 4, goalToday: true });
    expect(G.streaks(hist({ 0: 40, 1: 35 }), NOW, { log })).toMatchObject({ goalCurrent: 1, goalToday: false });
  });
  it('finds the best runs in the history kept, and copes with none', () => {
    const h = hist({ 0: 30, 1: 30, 5: 30, 6: 30, 7: 30, 8: 30, 9: 1 });
    expect(G.streaks(h, NOW, { goal: 30 })).toMatchObject({ current: 2, best: 4, goalBest: 4 });
    expect(G.streaks({}, NOW)).toMatchObject({ current: 0, best: 0, goalBest: 0, todayMin: 0, goal: 30 });
    expect(G.streaks(undefined, NOW).current).toBe(0);
  });
});

describe('the goal log', () => {
  it('keeps one entry per day, and only changes', () => {
    let log = G.logGoal([], ago(9), 30);
    log = G.logGoal(log, ago(5), 30);
    expect(log).toEqual([[ago(9), 30]]);
    log = G.logGoal(log, ago(2), 40);
    log = G.logGoal(log, ago(2), 45);
    expect(log).toEqual([[ago(9), 30], [ago(2), 45]]);
    expect(G.goalOn(log, ago(20))).toBe(30);
    expect(G.goalOn(log, ago(3))).toBe(30);
    expect(G.goalOn(log, ago(0))).toBe(45);
    expect(G.goalOn(undefined, ago(0), 60)).toBe(60);
  });
});

describe('the growing goal', () => {
  const week = min => hist({ 1: min, 2: min, 3: min, 4: min, 5: min, 6: min, 7: min });
  it('steps 10%, at least 10 minutes, in fives', () => {
    expect([30, 60, 100, 120, 200, 230].map(G.rampStep)).toEqual([10, 10, 10, 10, 20, 25]);
  });
  it('grows after a week at one goal met on 5 of the last 7 days, up to the target', () => {
    const h = week(60);
    delete h[ago(2)]; delete h[ago(6)]; // 5 of 7
    expect(G.ramp({ goal: 60, target: 240, since: ago(7) }, h, NOW)).toEqual({ met: 5, wait: 0, next: 70, raise: true });
    delete h[ago(3)]; // 4 of 7
    expect(G.ramp({ goal: 60, target: 240, since: ago(7) }, h, NOW).raise).toBe(false);
    expect(G.ramp({ goal: 230, target: 240, since: ago(9) }, week(240), NOW).next).toBe(240);
  });
  it('waits for the week to be up, and needs a start day', () => {
    expect(G.ramp({ goal: 60, target: 240, since: ago(3) }, week(90), NOW)).toMatchObject({ wait: 4, raise: false });
    expect(G.ramp({ goal: 60, target: 240 }, week(90), NOW)).toMatchObject({ wait: 7, raise: false });
  });
  it('is off without a target, or once the goal reaches it', () => {
    expect(G.ramp({ goal: 60, target: 0, since: ago(9) }, week(90), NOW)).toBe(null);
    expect(G.ramp({ goal: 240, target: 240, since: ago(9) }, week(300), NOW)).toBe(null);
  });
});

describe('best streaks kept for good', () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(NOW); E.resetAll(); });
  afterEach(() => vi.useRealTimers());
  it('remembers the longest streak after its days have left the history', () => {
    Object.assign(E.state.history, hist({ 0: 30, 1: 30, 2: 30 }));
    Cur.setPrefs({ goal: 30 });
    expect(E.streaks()).toMatchObject({ current: 3, best: 3, goalBest: 3 });
    expect(E.state.records).toEqual({ streak: 3, goalStreak: 3 });
    E.state.history = hist({ 0: 30 });
    expect(E.streaks()).toMatchObject({ current: 1, best: 3, goalCurrent: 1, goalBest: 3 });
    expect(E.streak()).toBe(1);
  });
  it('follows the streak rule in the learning preferences', () => {
    Object.assign(E.state.history, hist({ 0: 5, 1: 5 }));
    expect(E.streak()).toBe(2);
    Cur.setPrefs({ streakRule: 10 });
    expect(E.streak()).toBe(0);
  });
});
