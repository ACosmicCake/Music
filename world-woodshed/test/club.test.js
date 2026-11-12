import { describe, it, expect } from 'vitest';
import C from '../src/club.js';
import { merge, migrate, SCHEMA } from '../src/sync.js';

/* The Club (src/club.js): practice from before it opens never counts, nights only grow, tips are worked out
   from the nights less what was bought, and two devices' clubs join without losing anything. */

const T0 = new Date(2026, 10, 12, 9, 0).getTime();     // 12 Nov 2026, 09:00 local
const DAY = 86400000;
const rec = (min, by = {}, c = 0) => ({ sec: min * 60, q: c, c, by: Object.fromEntries(Object.entries(by).map(([k, m]) => [k, [0, 0, m * 60]])) });

describe('opening the club', () => {
  it('leaves out what today already held', () => {
    const hist = { '2026-11-11': rec(90), '2026-11-12': rec(20, { clock: 20 }) };
    const club = C.openClub(hist, { intervals: 2 }, T0);
    expect(club.start).toBe('2026-11-12');
    expect(club.base.sec).toBe(1200);
    hist['2026-11-12'] = rec(50, { clock: 35, fretboard: 15 });
    C.settle(club, hist, {}, T0 + 3600000);
    expect(club.nights['2026-11-11']).toBeUndefined();
    const n = club.nights['2026-11-12'];
    expect(n.m).toBe(30);
    expect(n.g).toEqual({ drums: 15, bass: 15 });
    expect(n.crowd).toBeGreaterThan(0);
    expect(n.crowd).toBeLessThanOrEqual(12);
  });
  it('keeps the doors shut under five minutes, but still pays the tips', () => {
    const club = C.openClub({}, {}, T0);
    C.settle(club, { '2026-11-12': rec(4) }, {}, T0);
    expect(club.nights['2026-11-12']).toMatchObject({ m: 4, crowd: 0, t: 4 });
  });
});

describe('nights', () => {
  it('only grow, and an old night stays as it was', () => {
    const club = C.openClub({}, {}, T0);
    const hist = { '2026-11-12': rec(40) };
    C.settle(club, hist, {}, T0);
    const first = Object.assign({}, club.nights['2026-11-12']);
    C.settle(club, { '2026-11-12': rec(10) }, {}, T0);
    expect(club.nights['2026-11-12'].m).toBe(first.m);
    // days later the app's history no longer has the day: the night is still there
    C.settle(club, { '2026-11-20': rec(15) }, {}, T0 + 8 * DAY);
    expect(club.nights['2026-11-12']).toEqual(first);
    expect(Object.keys(club.nights)).toHaveLength(2);
  });
  it('a day without practice takes nothing away', () => {
    const club = C.openClub({}, {}, T0);
    C.settle(club, { '2026-11-12': rec(60) }, {}, T0);
    const before = { money: C.balance(club), band: C.band(club).map(b => b.level) };
    C.settle(club, {}, {}, T0 + 10 * DAY);
    expect(C.balance(club)).toBe(before.money);
    expect(C.band(club).map(b => b.level)).toEqual(before.band);
  });
});

describe('tips and building', () => {
  it('a purchase is paid from the tips, and needs its room and reputation', () => {
    const club = C.openClub({}, {}, T0);
    C.settle(club, { '2026-11-12': rec(120, {}, 50) }, {}, T0);
    const money = C.balance(club);
    expect(money).toBeGreaterThan(120);
    expect(C.canBuy(club, 'oven', 99).why).toMatch(/Kitchen/);
    expect(C.canBuy(club, 'kitchen', 0).why).toMatch(/★/);
    expect(C.buy(club, 'lights', 0).ok).toBe(true);
    expect(C.balance(club)).toBe(money - 30);
    expect(C.canBuy(club, 'lights', 0).ok).toBe(false);
    expect(C.canBuy(club, 'roof', 999).why).toMatch(/tips/);
  });
  it('amenities add their effects only with their room', () => {
    const club = C.openClub({}, {}, T0);
    club.bought = { oven: 1 };
    expect(C.effects(club).tip).toBe(0);
    club.bought.kitchen = 1;
    expect(C.effects(club).tip).toBeCloseTo(0.35);
    expect(C.effects(club).seats).toBe(20);
  });
  it('suggests something to aim for', () => {
    const club = C.openClub({}, {}, T0);
    const g = C.nextGoal(club, 0);
    expect(g.ready).toBe(false);
    expect(g.item.cost).toBeGreaterThan(0);
  });
});

describe('the band and the set list', () => {
  it('a member joins after an hour of their practice and grows', () => {
    const club = C.openClub({}, {}, T0);
    club.nights = { '2026-11-12': { m: 70, c: 0, crowd: 5, t: 70, g: { drums: 70 } }, '2026-11-13': { m: 130, c: 0, crowd: 5, t: 130, g: { drums: 130 } } };
    const drums = C.band(club).find(b => b.id === 'drums');
    expect(drums.level).toBe(2);
    expect(drums.next).toBe(220);
    expect(C.band(club).find(b => b.id === 'bass').level).toBe(0);
  });
  it('every practice skill belongs to a member', () => {
    ['rhythmTap', 'rhythmId', 'clock', 'tuplets', 'fretboard', 'notenames', 'degrees', 'chords', 'progressions', 'intervals', 'dictation', 'reading', 'scales', 'repertoire', 'callresp', 'technique', 'atlas', 'improv', 'pieces', 'transcribe']
      .forEach(k => expect(C.groupOf(k), k).toBeTruthy());
  });
  it('only tunes and pieces learned since the club opened go on the set', () => {
    const club = C.openClub({}, {}, T0);
    const list = C.setList(club, {
      tunes: [{ id: 'a', name: 'Old', s: 20, last: T0 - DAY }, { id: 'b', name: 'New', s: 4, last: T0 + DAY }, { id: 'c', name: 'Shaky', s: 1, last: T0 + DAY }],
      pieces: [{ id: 'p', title: 'Piece', learned: T0 + 2 * DAY }, { id: 'q', title: 'Before', learned: T0 - 5 }]
    });
    expect(list.map(x => x.name)).toEqual(['Piece', 'New']);
  });
});

describe('reputation', () => {
  it('counts only progress since the club opened', () => {
    const club = C.openClub({}, { intervals: 2, chords: 1 }, T0);
    club.nights = { '2026-11-12': { m: 60, c: 0, crowd: 20, t: 60, g: { keys: 60 } } };
    const r = C.reputation(club, { tiers: { intervals: 3, chords: 1 }, lessons: { a: T0 - 1, b: T0 + 1 }, games: { tower: [{ s: 1, t: T0 - 1 }, { s: 2, t: T0 + 5 }] }, plants: 1 });
    const pts = Object.fromEntries(r.parts.map(p => [p.id, p.pts]));
    expect(pts).toMatchObject({ nights: 1, band: 5, lessons: 4, levels: 6, games: 2, plants: 10 });
    expect(r.total).toBe(28);
  });
});

describe('two devices', () => {
  it('join: the earlier opening, the larger nights, everything bought on either', () => {
    const a = C.openClub({}, {}, T0);
    a.nights = { '2026-11-12': { m: 30, c: 2, crowd: 10, t: 32, g: { drums: 30 } } };
    a.bought = { lights: 5 };
    const b = C.openClub({}, {}, T0 + DAY);
    b.nights = { '2026-11-12': { m: 45, c: 0, crowd: 12, t: 46, g: { bass: 10 } }, '2026-11-13': { m: 10, c: 0, crowd: 4, t: 10, g: {} } };
    b.bought = { lights: 3, chairs: 9 };
    const m = C.mergeClub(a, b);
    expect(m.start).toBe('2026-11-12');
    expect(m.nights['2026-11-12']).toEqual({ m: 45, c: 2, crowd: 12, t: 46, g: { drums: 30, bass: 10 } });
    expect(m.bought).toEqual({ lights: 3, chairs: 9 });
    expect(C.mergeClub(undefined, b)).toEqual(C.clean(b));
  });
  it('the progress merge keeps the club, and unknown purchases from a newer app are dropped safely', () => {
    const club = C.openClub({}, {}, T0);
    club.bought = { lights: 1, 'rocket-pad': 2 };
    const local = migrate({ v: 1, schema: 12, settings: {} }, 'x');
    const remote = { v: 1, schema: SCHEMA, settings: {}, club };
    const out = merge(local, remote);
    expect(out.club.bought).toEqual({ lights: 1 });
    expect(out.club.start).toBe('2026-11-12');
  });
});
