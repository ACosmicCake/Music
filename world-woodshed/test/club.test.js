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
    expect(club.nights['2026-11-12']).toMatchObject({ m: 4, crowd: 0, t: Math.round(4 / C.PACE) });
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

describe('pace and guests', () => {
  it('tips come PACE times slower: the Kitchen takes hours of practice', () => {
    const club = C.openClub({}, {}, T0);
    C.settle(club, { '2026-11-12': rec(60) }, {}, T0);
    const perHour = C.balance(club), kitchen = C.ROOMS.find(r => r.id === 'kitchen').cost;
    expect(kitchen / perHour).toBeGreaterThan(8);
  });
  it('the guests are the animals on the island, at least a few visitors, never more than the seats', () => {
    const night = animals => { const club = C.openClub({}, {}, T0); C.settle(club, { '2026-11-12': rec(120) }, { animals }, T0); return club.nights['2026-11-12'].crowd; };
    expect(night(0)).toBe(C.VISITORS);
    expect(night(2)).toBe(C.VISITORS);
    expect(night(5)).toBe(5);
    expect(night(500)).toBe(C.stats(C.openClub({}, {}, T0)).seats);
    expect(night(undefined)).toBe(C.stats(C.openClub({}, {}, T0)).seats);
  });
});

describe('tips and building', () => {
  it('a purchase is paid from the tips, and needs its room and reputation', () => {
    const club = C.openClub({}, {}, T0);
    C.settle(club, { '2026-11-12': rec(120, {}, 50) }, {}, T0);
    const money = C.balance(club);
    expect(money).toBeGreaterThan(120 / C.PACE);
    expect(C.canBuy(club, 'oven', 99).why).toMatch(/Kitchen/);
    expect(C.canBuy(club, 'kitchen', 0).why).toMatch(/★/);
    expect(C.buy(club, 'lights', 0).ok).toBe(true);
    expect(C.balance(club)).toBe(money - 30);
    expect(C.canBuy(club, 'lights', 0).ok).toBe(false);
    expect(C.canBuy(club, 'roof', 999).why).toMatch(/tips/);
  });
  it('fixtures add their effects only with their room', () => {
    const club = C.openClub({}, {}, T0);
    club.bought = { herbs: 1 };
    expect(C.effects(club).draw).toBe(0);
    club.bought.kitchen = 1;
    expect(C.effects(club).draw).toBeCloseTo(0.03);
    expect(C.effects(club).tip).toBeCloseTo(0.2);
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
    expect(m.bought).toEqual({ lights: 3 });
    expect(m.placed['a:chairs']).toMatchObject({ k: 'chairs', t: 9 });
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

describe('build mode', () => {
  const rich = () => { const c = C.openClub({}, {}, T0); c.nights = { '2026-11-12': { m: 3000, c: 0, crowd: 0, t: 3000, g: {} } }; return c; };
  it('a new club has its free starter pieces, which fit and cost nothing', () => {
    const club = C.openClub({}, {}, T0);
    const pieces = C.live(club);
    expect(pieces.length).toBe(C.STARTERS.cafe.length);
    pieces.forEach(([u, p]) => expect(C.fits(club, p.k, p.x, p.z, p.r, u).ok, u).toBe(true));
    expect(C.spent(club)).toBe(0);
    expect(C.effects(club).seats).toBe(6 + 2 + 2 + 1 + 1);
  });
  it('every room\'s starters and every old amenity fit together with everything built', () => {
    const bought = {}; C.ROOMS.forEach(r => { bought[r.id] = 1; }); C.AMENITIES.forEach(a => { bought[a.id] = 1; });
    C.CATALOG.filter(x => !C.STARTERS.cafe.some(s => s[0] === x.id) && ['chairs', 'monstera', 'chalk', 'upright', 'oven', 'table', 'olive', 'fountain', 'benches', 'pa', 'grand', 'ferns', 'amps', 'lending', 'board', 'coats', 'lemons', 'scope', 'hammocks'].includes(x.id)).forEach(x => { bought[x.id] = 2; });
    const club = C.clean({ start: '2026-11-12', t0: 1, nights: {}, bought });
    C.live(club).forEach(([u, p]) => expect(C.fits(club, p.k, p.x, p.z, p.r, u).ok, u).toBe(true));
    expect(C.live(club).filter(([u]) => u.startsWith('a:'))).toHaveLength(19);
  });
  it('places, blocks overlaps and walls, moves, turns and sells for a full refund', () => {
    const club = rich(), money = C.balance(club);
    expect(C.fits(club, 'sofa', -10, 2, 0).ok).toBe(false);                 // outside the café
    expect(C.fits(club, 'sofa', 1, 8, 0).why).toMatch(/built in/);        // on the rug stage
    expect(C.fits(club, 'sofa', 1, 1, 0).why).toMatch(/in the way/);      // on the first bistro table
    expect(C.fits(club, 'rug', 1, 1, 0).ok).toBe(true);                   // a rug goes under it
    const r = C.place(club, 'sofa', 6, 7, 0, T0 + 1);
    expect(r.ok).toBe(true);
    expect(C.balance(club)).toBe(money - 80);
    expect(C.effects(club).seats).toBe(12 + 3);
    expect(C.move(club, r.uid, 14, 0, 1, T0 + 2).ok).toBe(true);
    expect(C.footprint('sofa', 14, 0, 1)).toEqual([14, 0, 16, 4]);
    expect(C.sell(club, r.uid, T0 + 3).refund).toBe(80);
    expect(C.balance(club)).toBe(money);
    expect(club.placed[r.uid].gone).toBe(1);
    expect(C.sell(club, 's:cafe:0', T0 + 4).refund).toBe(0);
  });
  it('one of a unique piece, a room\'s pieces wait for the room, and effects count once per kind', () => {
    const club = rich();
    expect(C.buy(club, 'upright', 0).ok).toBe(true);
    expect(C.canPlace(club, 'upright').why).toMatch(/one/);
    expect(C.canPlace(club, 'oven').why).toMatch(/Kitchen/);
    const d0 = C.effects(club).draw;
    C.buy(club, 'lamp', 0, T0 + 1); C.buy(club, 'lamp', 0, T0 + 2);
    expect(C.effects(club).draw).toBeCloseTo(d0 + 0.01);
    expect(C.reputation(club, {}).parts.find(p => p.id === 'decor').n).toBe(2);
  });
  it('two devices: each piece from the copy that changed it last, a sale kept', () => {
    const a = rich(), b = C.clean(JSON.parse(JSON.stringify(a)));
    C.move(a, 's:cafe:4', 1, 0, 0, T0 + 10);
    C.sell(b, 's:cafe:0', T0 + 20);
    const u = C.place(b, 'lamp', 15, 0, 0, T0 + 30).uid;
    const m = C.mergeClub(a, b);
    expect(m.placed['s:cafe:4']).toMatchObject({ x: 1, z: 0 });
    expect(m.placed['s:cafe:0'].gone).toBe(1);
    expect(m.placed[u].k).toBe('lamp');
    expect(C.mergeClub(b, a)).toEqual(m);
  });
});
