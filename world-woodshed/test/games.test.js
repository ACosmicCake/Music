import { describe, it, expect } from 'vitest';
import { BOARD, addScore, rankFor, best, table, mergeGames, climb, TOWER, towerStage, towerPoints, gatePoints, updraftBpm,
  matchTaps, ropeStage, ropeClick, leanAfter, ropeFell, ropePoints, ROPE_BARS, drumPassed, drumRoundPoints, parrotCell, phraseNotes, echoPassed, echoPoints } from '../src/games.js';
import { merge } from '../src/sync.js';

/* Game mode (src/games.js): personal high-score tables that sync, and the rules of The Tower and Updraft */
const e = (s, t, d = 'devA') => ({ s, t, d });

describe('high-score tables', () => {
  it('keep the best first, at most BOARD, and say where a new score placed', () => {
    let list = [];
    for (let i = 0; i < 12; i++) list = addScore(list, e(i * 10, 1000 + i)).list;
    expect(list).toHaveLength(BOARD);
    expect(list[0].s).toBe(110);
    expect(list[BOARD - 1].s).toBe(20);
    const r = addScore(list, e(75, 5000));
    expect(r.rank).toBe(5);
    expect(addScore(r.list, e(1, 6000)).rank).toBe(0);
    expect(rankFor(r.list, 200)).toBe(1);
    expect(best(r.list).s).toBe(110);
  });
  it('a tie goes to the score set first', () => {
    const { list, rank } = addScore([e(50, 1)], e(50, 2));
    expect(rank).toBe(2);
    expect(list.map(x => x.t)).toEqual([1, 2]);
  });
  it('drop broken entries from another copy', () => {
    expect(table([e(10, 1), { s: 'x', t: 2 }, null, { s: 5 }])).toEqual([e(10, 1)]);
    expect(table('nope')).toEqual([]);
  });
  it('merge two devices without doubling an entry both have', () => {
    const a = { tower: [e(300, 1, 'phone'), e(100, 3, 'phone')], updraft: [e(5000, 9, 'phone')] };
    const b = { tower: [e(300, 1, 'phone'), e(200, 2, 'laptop')] };
    const m = mergeGames(a, b);
    expect(m.tower.map(x => x.s)).toEqual([300, 200, 100]);
    expect(m.updraft).toHaveLength(1);
    expect(mergeGames(undefined, b)).toEqual({ tower: [e(300, 1, 'phone'), e(200, 2, 'laptop')] });
  });
  it('travel with the rest of the progress in a merge', () => {
    const out = merge({ v: 1, schema: 11, games: { tower: [e(40, 1, 'a')] } }, { v: 1, schema: 11, games: { tower: [e(90, 2, 'b')] } });
    expect(out.games.tower.map(x => x.s)).toEqual([90, 40]);
  });
});

describe('The Tower', () => {
  it('climbs a step for a right answer and slips one for a wrong one, never below the tower it is on', () => {
    expect(climb(0, true)).toMatchObject({ step: 1, tower: 0, topped: false });
    expect(climb(0, false).step).toBe(0);
    expect(climb(5, false).step).toBe(4);
    expect(climb(TOWER - 1, true)).toMatchObject({ step: TOWER, tower: 1, topped: true });
    expect(climb(TOWER, false).step).toBe(TOWER);
  });
  it('asks rising, then falling, then both, then together, with less time each tower', () => {
    expect(towerStage(0)).toMatchObject({ dirs: ['up'], secs: 0 });
    expect(towerStage(1).dirs).toEqual(['down']);
    expect(towerStage(2).dirs).toEqual(['up', 'down']);
    expect(towerStage(3).dirs).toEqual(['harm']);
    expect(towerStage(4).secs).toBeGreaterThan(towerStage(6).secs);
    expect(towerStage(40).secs).toBe(4);
  });
  it('gives 10 a step and more for a quick answer', () => {
    expect(towerPoints(0, 10)).toBe(15);
    expect(towerPoints(10, 10)).toBe(10);
    expect(towerPoints(30, 0)).toBe(10);
  });
});

describe('Updraft', () => {
  it('scores perfect over good, more with a combo, double when alone', () => {
    expect(gatePoints('perfect', 0, false)).toBe(100);
    expect(gatePoints('good', 0, false)).toBe(50);
    expect(gatePoints('perfect', 10, false)).toBe(200);
    expect(gatePoints('perfect', 0, true)).toBe(200);
    expect(gatePoints('perfect', 100, false)).toBe(300);
    expect(gatePoints('miss', 5, true)).toBe(0);
  });
  it('picks up 4 bpm every four bars, up to 20 over the exercise top', () => {
    expect(updraftBpm(60, 0, 100)).toBe(60);
    expect(updraftBpm(60, 3, 100)).toBe(60);
    expect(updraftBpm(60, 4, 100)).toBe(64);
    expect(updraftBpm(60, 400, 100)).toBe(120);
  });
});

describe('matching taps to notes', () => {
  it('takes the nearest tap within the window, once, and counts the rest as extra', () => {
    const m = matchTaps([1, 2, 3], [1.02, 1.03, 2.2, 2.97], 0.05);
    expect(m.hits).toBe(2);
    expect(m.errs[0]).toBeCloseTo(0.02);
    expect(m.errs[1]).toBeNull();
    expect(m.errs[2]).toBeCloseTo(-0.03);
    expect(m.extra).toBe(2);
    expect(m.rate).toBeCloseTo(2 / 3);
  });
});

describe('Tightrope', () => {
  it('thins the click every 8 bars', () => {
    expect(ropeStage(0)).toBe(0);
    expect(ropeStage(ROPE_BARS * 4)).toBe(1);
    expect(ropeStage(10000)).toBe(4);
    expect([0, 1, 2, 3].map(b => ropeClick(1, b))).toEqual([false, true, false, true]);
    expect([0, 1, 4].map(b => ropeClick(2, b))).toEqual([true, false, true]);
    expect([0, 4, 8].map(b => ropeClick(3, b))).toEqual([true, false, true]);
    expect([0, 4, 8, 12, 16].map(b => ropeClick(4, b))).toEqual([true, false, false, false, true]);
  });
  it('falls with a steady drag of a tenth of a beat, but not with a small one or with even errors', () => {
    const run = errs => { let l = 0; for (const e of errs) { l = leanAfter(l, e); if (ropeFell(l)) return true; } return false; };
    expect(run(Array(40).fill(0.1))).toBe(true);
    expect(run(Array(40).fill(-0.1))).toBe(true);
    expect(run(Array(40).fill(0.04))).toBe(false);
    expect(run(Array.from({ length: 40 }, (_, i) => (i % 2 ? 0.08 : -0.08)))).toBe(false);
    expect(run([null, null, null, null])).toBe(true);
  });
  it('pays more for a beat on time and once the click has thinned', () => {
    expect(ropePoints(0, 0)).toBe(20);
    expect(ropePoints(0.1, 0)).toBe(10);
    expect(ropePoints(0, 2)).toBe(40);
  });
});

describe('Two Drums', () => {
  it('passes with three in four on each drum', () => {
    expect(drumPassed(0.75, 1)).toBe(true);
    expect(drumPassed(1, 0.7)).toBe(false);
    expect(drumRoundPoints(1, 1, 0, 5)).toBe(500);
    expect(drumRoundPoints(0, 0, 3, 5)).toBe(0);
  });
});

describe('Parrot', () => {
  it('makes a phrase of one sixteenth cell a beat', () => {
    expect(phraseNotes([[0], [0, 2], [1, 3]])).toEqual([0, 1, 1.5, 2.25, 2.75]);
    for (let i = 0; i < 50; i++) {
      const c = parrotCell(Math.random, 2);
      expect(c[0]).toBe(0); // short phrases start every beat on the beat
      expect(c.every(x => x >= 0 && x < 4)).toBe(true);
    }
  });
  it('passes only with every note back and at most one extra', () => {
    expect(echoPassed(matchTaps([1, 2], [1.01, 2.01], 0.05))).toBe(true);
    expect(echoPassed(matchTaps([1, 2], [1.01, 1.5, 1.7, 2.01], 0.05))).toBe(false);
    expect(echoPassed(matchTaps([1, 2], [1.01], 0.05))).toBe(false);
    expect(echoPoints(matchTaps([1, 2], [1, 2], 0.05), 0.05)).toBe(40);
  });
});
