import { describe, it, expect } from 'vitest';
import { BOARD, addScore, rankFor, best, table, mergeGames, climb, TOWER, towerStage, towerPoints,
  matchTaps, delayTracker, matchShifted, ropeStage, ropeClick, leanAfter, ropeFell, ropePoints, ROPE_BARS, drumPassed, drumRoundPoints, parrotCell, phraseNotes, echoPassed, echoPoints,
  SHIPS, harbourSecs, harbourTier, shipPoints, fireflyRound, fireflyPoints, formStarts, formLetters, formJudge, formPoints, sectionLetter,
  barSilent, barKept, crowdAfter, curtain, showNotePoints, CROWD_SILENT } from '../src/games.js';
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

describe('your own steady delay', () => {
  it('learns the median of the errors within range, once it has enough', () => {
    const d = delayTracker(0.12);
    d.add(0.05); d.add(0.06);
    expect(d.get()).toBe(0);
    d.add(0.04); d.add(0.5); d.add(null);
    expect(d.size).toBe(3);
    expect(d.get()).toBeCloseTo(0.05);
  });
  it('a steady 60 ms late passes, an uneven hand still misses', () => {
    const exp = [1, 2, 3, 4], win = 0.05;
    expect(matchTaps(exp, exp.map(t => t + 0.06), win).hits).toBe(0);
    const m = matchShifted(exp, exp.map(t => t + 0.06), win, delayTracker(0.12));
    expect(m.hits).toBe(4);
    expect(m.offset).toBeCloseTo(0.06);
    const uneven = matchShifted(exp, [1.06, 2.06, 3.15, 4.06], win, delayTracker(0.12));
    expect(uneven.hits).toBe(3);
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

describe('Lighthouse Keeper', () => {
  it('gives less time each harbour, never under 5 seconds', () => {
    expect(harbourSecs(0)).toBe(12);
    expect(harbourSecs(2)).toBe(9);
    expect(harbourSecs(20)).toBe(5);
    expect(SHIPS).toBe(8);
  });
  it('brings in one tier past those opened from the third harbour, never past the last', () => {
    expect(harbourTier(0, 1)).toBe(1);
    expect(harbourTier(1, 1)).toBe(1);
    expect(harbourTier(2, 1)).toBe(2);
    expect(harbourTier(5, 5)).toBe(5);
    expect(shipPoints(0, 12, 0)).toBe(15);
    expect(shipPoints(0, 12, 2)).toBe(30);
  });
});

describe('Firefly Hunt', () => {
  it('starts with natural notes, adds accidentals, then two notes, with less time', () => {
    expect(fireflyRound(0)).toMatchObject({ accidentals: false, two: false, secs: 30 });
    expect(fireflyRound(4).accidentals).toBe(true);
    expect(fireflyRound(9).two).toBe(true);
    expect(fireflyRound(50).secs).toBe(12);
    expect(fireflyPoints(7, 10, 0)).toBe(120);
  });
});

describe('Lost in the Form', () => {
  it('finds where each section starts and its letter', () => {
    const form = [['A1', 8], ['A2', 8], ['B', 8], ['A3', 12]];
    expect(formStarts(form)).toEqual([{ bar: 0, letter: 'A' }, { bar: 8, letter: 'A' }, { bar: 16, letter: 'B' }, { bar: 24, letter: 'A' }]);
    expect(formLetters(form)).toEqual(['A', 'B']);
    expect(sectionLetter('C')).toBe('C');
  });
  it('judges a tap by beats from the section\'s first downbeat', () => {
    expect(formJudge(0.3)).toBe('perfect');
    expect(formJudge(-0.9)).toBe('good');
    expect(formJudge(2)).toBeNull();
    expect(formPoints('perfect', 0)).toBe(100);
    expect(formPoints('good', 4)).toBe(120);
  });
  it('has at least one tune in the app with more than one kind of section', async () => {
    const D = (await import('../src/data.js')).default;
    expect(D.TUNES.filter(t => t.form && formLetters(t.form).length > 1).length).toBeGreaterThan(3);
  });
});

describe('Opening Night', () => {
  it('makes stopping cost far more than wrong notes', () => {
    const wrong = crowdAfter(100, { notes: 4, played: 4, right: 0 });
    const silent = crowdAfter(100, { notes: 4, played: 0, right: 0 });
    expect(wrong).toBe(100);
    expect(silent).toBe(100 - CROWD_SILENT);
    expect(showNotePoints(true, false)).toBe(10);
    expect(showNotePoints(true, true)).toBe(20);
    expect(showNotePoints(true, null)).toBe(15);
    expect(showNotePoints(false, undefined)).toBe(0);
  });
  it('brings the curtain down after two silent bars in a row, not after wrong notes', () => {
    expect(curtain(65, 1)).toBe(false);
    expect(curtain(30, 2)).toBe(true);
    expect(curtain(0, 0)).toBe(true);
    expect(barSilent({ notes: 0, played: 0 })).toBe(false);
  });
  it('counts a bar as kept going when most of its notes were played, right or wrong', () => {
    expect(barKept({ notes: 5, played: 3 })).toBe(true);
    expect(barKept({ notes: 5, played: 2 })).toBe(false);
    expect(barKept({ notes: 0, played: 0 })).toBe(true);
  });
});
