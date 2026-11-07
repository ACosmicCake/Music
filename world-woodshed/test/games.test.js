import { describe, it, expect } from 'vitest';
import { BOARD, addScore, rankFor, best, table, mergeGames, climb, TOWER, towerStage, towerPoints, gatePoints, updraftBpm } from '../src/games.js';
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
