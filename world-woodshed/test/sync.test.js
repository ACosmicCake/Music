import { describe, it, expect } from 'vitest';
import { migrate, merge, rebuildHistory, digest, SCHEMA } from '../src/sync.js';

const DAY = '2026-10-20';
function base(extra = {}) {
  return Object.assign({ v: 1, created: 1, updatedAt: 1, skills: {}, history: {}, hdev: {}, tomb: {}, anchors: {}, tech: {}, settings: {}, routines: [], journal: [], lessons: {}, heard: {}, songs: {}, cur: {} }, extra);
}

describe('migrate', () => {
  it('brings a version-1 save up to the current schema without losing anything', () => {
    const old = { v: 1, history: { [DAY]: { sec: 600, q: 10, c: 8, by: { intervals: [10, 8, 600] } } }, skills: { intervals: { items: { P5: { n: 3 } } } },
      readLib: { n: 2, pieces: { p1: { id: 'p1', no: 1 }, p2: { id: 'p2', no: 2 } } } };
    const m = migrate(JSON.parse(JSON.stringify(old)), 'dabcdef123');
    expect(m.schema).toBe(SCHEMA);
    expect(m.hdev.legacy[DAY]).toMatchObject({ sec: 600, q: 10, c: 8 });
    expect(m.skills).toEqual(old.skills);
    expect(Object.keys(m.readLib.pieces)).toEqual(['pdef1231', 'pdef1232']);
  });
  it('is idempotent and keeps saves written by a newer app as they are', () => {
    const m = migrate(migrate({ v: 1, history: {} }, 'd1'), 'd1');
    expect(m.schema).toBe(SCHEMA);
    const future = { v: 1, schema: SCHEMA + 5, newThing: { x: 1 } };
    expect(migrate(future, 'd1')).toEqual(future);
  });
  it('moves sight-reading progress from the old 16 levels onto the 36-step path (schema 8)', () => {
    const it = (ema, last) => ({ n: 4, c: 3, ema, box: 2, due: last + 864e5, last });
    const old = { v: 1, schema: 7,
      skills: { reading: { items: { 'n:60': it(0.9, 5), 'L1:melody': it(0.9, 10), 'L1:rhythm': it(0.8, 11), 'L3:melody': it(0.8, 12), 'L5:rhythm': it(0.7, 13), 'L14:melody': it(0.85, 14) }, conf: {}, last: 14 } },
      settings: { readingBpm: { r5: 66, m1: 60, m14: 72 }, readingMode: 'melody' },
      readLib: { n: 2, pieces: { pa1: { id: 'pa1', no: 1, lv: 13, kind: 'm' }, pa2: { id: 'pa2', no: 2, lv: 1, kind: 'r' } } } };
    const m = migrate(JSON.parse(JSON.stringify(old)), 'd1');
    const items = m.skills.reading.items;
    expect(m.schema).toBe(SCHEMA);
    expect(items['n:60']).toEqual(old.skills.reading.items['n:60']);
    // each old level's record moves to the level that teaches the same thing now
    expect(items['L2:melody']).toEqual(old.skills.reading.items['L1:melody']);
    expect(items['L7:melody']).toEqual(old.skills.reading.items['L3:melody']);
    expect(items['L11:rhythm']).toEqual(old.skills.reading.items['L5:rhythm']);
    expect(items['L32:melody']).toEqual(old.skills.reading.items['L14:melody']); // 31 in schema 8, 32 since 9
    expect(items['L31:melody']).toEqual(old.skills.reading.items['L14:melody']); // second position, new in 9, below it
    expect(items['L1:melody']).toEqual(old.skills.reading.items['L1:melody']); // the new first step below it takes a copy
    // the new steps in between take a copy of the next level read above them, up to the end of the sixteenths
    expect(items['L5:melody']).toEqual(old.skills.reading.items['L3:melody']);
    expect(items['L24:melody']).toEqual(old.skills.reading.items['L14:melody']);
    expect(items['L10:rhythm']).toEqual(old.skills.reading.items['L5:rhythm']);
    // triplets and chords are new: they start fresh
    expect(items['L25:melody']).toBeUndefined();
    expect(items['L28:melody']).toBeUndefined();
    expect(items['L12:rhythm']).toBeUndefined();
    expect(m.settings.readingBpm).toEqual({ r11: 66, m2: 60, m32: 72 });
    expect(m.readLib.pieces.pa1.lv).toBe(24);
    expect(m.readLib.pieces.pa2.lv).toBe(2);
    expect(migrate(JSON.parse(JSON.stringify(m)), 'd1')).toEqual(m); // once only
  });
  it('makes room for the positions up the neck (schema 9): fifth position and the levels after it move up', () => {
    const it = (ema, last) => ({ n: 4, c: 3, ema, box: 2, due: last + 864e5, last });
    const old = { v: 1, schema: 8,
      skills: { reading: { items: { 'n:60': it(0.9, 5), 'L25:melody': it(0.9, 6), 'L30:melody': it(0.8, 7), 'L31:melody': it(0.8, 8), 'L33:rhythm': it(0.7, 9), 'L36:melody': it(0.6, 10) }, conf: {}, last: 10 } },
      settings: { readingBpm: { m30: 60, m31: 62, r33: 70, m36: 80 } },
      readLib: { n: 3, pieces: { a: { id: 'a', no: 1, lv: 30, kind: 'm' }, b: { id: 'b', no: 2, lv: 31, kind: 'm' }, c: { id: 'c', no: 3, lv: 36, kind: 'r' } } } };
    const m = migrate(JSON.parse(JSON.stringify(old)), 'd1');
    const items = m.skills.reading.items, was = old.skills.reading.items;
    expect(m.schema).toBe(SCHEMA);
    // up to the chords nothing moves, and nothing is copied in
    expect(items['L25:melody']).toEqual(was['L25:melody']);
    expect(items['L30:melody']).toEqual(was['L30:melody']);
    expect(items['L26:melody']).toBeUndefined();
    // fifth position is 32; 33–36 are 37–40
    expect(items['L32:melody']).toEqual(was['L31:melody']);
    expect(items['L37:rhythm']).toEqual(was['L33:rhythm']);
    expect(items['L40:melody']).toEqual(was['L36:melody']);
    // the new steps below a level you had read take its record, so nothing you had unlocked closes
    expect(items['L31:melody']).toEqual(was['L31:melody']);
    expect(items['L33:melody']).toEqual(was['L36:melody']);
    expect(items['L35:melody']).toEqual(was['L36:melody']);
    expect(items['L34:rhythm']).toEqual(was['L33:rhythm']);
    expect(items['L36:melody']).toBeUndefined(); // larger leaps (old 32) was never read
    expect(m.settings.readingBpm).toEqual({ m30: 60, m32: 62, r37: 70, m40: 80 });
    expect(Object.values(m.readLib.pieces).map(p => p.lv)).toEqual([30, 32, 40]);
    expect(migrate(JSON.parse(JSON.stringify(m)), 'd1')).toEqual(m);
  });
});

describe('merge', () => {
  it('adds up the same day practised on two devices, and does not double the shared past', () => {
    const shared = { [DAY]: { sec: 300, q: 4, c: 3, by: {} } };
    const laptop = migrate(base({ history: JSON.parse(JSON.stringify(shared)) }), 'laptop');
    const phone = migrate(base({ history: JSON.parse(JSON.stringify(shared)) }), 'phone');
    laptop.hdev.laptop = { [DAY]: { sec: 600, q: 10, c: 9, by: { intervals: [10, 9, 600] } } };
    phone.hdev.phone = { [DAY]: { sec: 900, q: 0, c: 0, by: { technique: [0, 0, 900] } } };
    const m = merge(laptop, phone);
    expect(m.history[DAY].sec).toBe(300 + 600 + 900);
    expect(m.history[DAY].q).toBe(4 + 10);
    expect(m.history[DAY].by.intervals).toEqual([10, 9, 600]);
    // merging again changes nothing
    expect(merge(m, phone).history[DAY].sec).toBe(1800);
  });
  it('keeps the newer record of each item from either side', () => {
    const a = base({ skills: { intervals: { items: { P5: { n: 5, last: 100, ema: 0.9 }, m3: { n: 1, last: 50 } }, conf: { 'm3>M3': 2 }, last: 100 } } });
    const b = base({ skills: { intervals: { items: { P5: { n: 6, last: 200, ema: 0.95 }, M6: { n: 2, last: 150 } }, conf: { 'm3>M3': 3 }, last: 200 } } });
    const m = merge(a, b);
    expect(m.skills.intervals.items.P5.last).toBe(200);
    expect(Object.keys(m.skills.intervals.items).sort()).toEqual(['M6', 'P5', 'm3']);
    expect(m.skills.intervals.conf['m3>M3']).toBe(3);
  });
  it('joins journals, routines and reading pieces, and respects deletions', () => {
    const a = base({ journal: [{ ts: 1, name: 'A' }], routines: [{ id: 'r1', updatedAt: 5 }, { id: 'r2', updatedAt: 5 }], readLib: { n: 1, pieces: { pa1: { id: 'pa1', last: 1, reads: [{}] } } } });
    const b = base({ journal: [{ ts: 2, name: 'B' }, { ts: 1, name: 'A' }], routines: [{ id: 'r2', updatedAt: 9 }], tomb: { 'routine:r1': 10 }, readLib: { n: 1, pieces: { pb1: { id: 'pb1', last: 2, reads: [{}] } } } });
    const m = merge(a, b);
    expect(m.journal.map(j => j.ts)).toEqual([2, 1]);
    expect(m.routines.map(r => r.id)).toEqual(['r2']);
    expect(m.routines[0].updatedAt).toBe(9);
    expect(Object.keys(m.readLib.pieces).sort()).toEqual(['pa1', 'pb1']);
  });
  it('takes settings from the newer copy but keeps this device’s latency', () => {
    const a = base({ updatedAt: 1, settings: { latencyMs: 40, feel16: true } });
    const b = base({ updatedAt: 2, settings: { latencyMs: 120, feel16: false, band: { who: 'bass' } } });
    const m = merge(a, b);
    expect(m.settings).toEqual({ latencyMs: 40, feel16: false, band: { who: 'bass' } });
  });
  it('keeps the session length last chosen on each device to that device', () => {
    const phone = base({ updatedAt: 1, settings: { lastMinutes: 15, lastRide: 20 } });
    const desk = base({ updatedAt: 2, settings: { lastMinutes: 60 } });
    expect(merge(phone, desk).settings).toMatchObject({ lastMinutes: 15, lastRide: 20 });
    expect(merge(desk, phone).settings.lastMinutes).toBe(60);
    expect(merge(desk, phone).settings).not.toHaveProperty('lastRide');
  });
  it('never brings a practice session in from another copy', () => {
    const running = { id: 's1', name: 'On the go', started: 5, lastTick: 9, idx: 0, blocks: [] };
    // ended here, still in the phone's older sync file: it stays ended
    expect(merge(base({ updatedAt: 10, session: null }), base({ updatedAt: 5, session: running })).session).toBeNull();
    // running here: another copy doesn't replace it
    expect(merge(base({ session: running }), base({ updatedAt: 20, session: Object.assign({}, running, { id: 's2', lastTick: 30 }) })).session.id).toBe('s1');
  });
  it('keeps the best technique tempo from both devices', () => {
    const m = merge(base({ tech: { altpick: { best: 120, bpm: 124, last: 5 } } }), base({ tech: { altpick: { best: 100, bpm: 104, last: 9 } } }));
    expect(m.tech.altpick).toMatchObject({ best: 120, bpm: 104, last: 9 });
  });
  it('merges the smart curriculum day by day', () => {
    const a = base({ cur: { items: { 'tune:autumn': { s: 2, last: 10, n: 2 } }, prefs: { styles: ['jazz'] }, days: { [DAY]: { sessions: [{ start: 1, minutes: 20 }], items: {}, fresh: [{ id: 'x', t: 1 }] } } } });
    const b = base({ updatedAt: 5, cur: { items: { 'tune:autumn': { s: 5, last: 20, n: 3 } }, prefs: { styles: ['flamenco'] }, days: { [DAY]: { sessions: [{ start: 2, minutes: 15 }], items: {}, fresh: [] } } } });
    const m = merge(a, b);
    expect(m.cur.items['tune:autumn'].s).toBe(5);
    expect(m.cur.prefs.styles).toEqual(['flamenco']);
    expect(m.cur.days[DAY].sessions.length).toBe(2);
  });
});

describe('rebuildHistory', () => {
  it('keeps days that only exist in the old history', () => {
    const s = { hdev: { d1: { '2026-10-21': { sec: 60, q: 1, c: 1, by: {} } } }, history: { '2026-01-01': { sec: 5, q: 0, c: 0, by: {} } } };
    const h = rebuildHistory(s);
    expect(Object.keys(h).sort()).toEqual(['2026-01-01', '2026-10-21']);
  });
});

describe('your own tunes', () => {
  const tune = (id, updatedAt, name = id) => ({ id, name, groove: 'swing', bpm: 140, note: '', bars: ['Dm7', 'G7', 'Cmaj7', 'Cmaj7'], updatedAt });
  it('a schema-2 save gains an empty tune list and keeps the rest', () => {
    const m = migrate({ v: 1, schema: 2, songs: { s1: { id: 's1' } } }, 'd1');
    expect(m.schema).toBe(SCHEMA);
    expect(m.tunes).toEqual({});
    expect(m.songs.s1.id).toBe('s1');
  });
  it('joins the tunes of both devices, keeping the newer edit of each', () => {
    const a = base({ tunes: { t1: tune('t1', 10, 'Old name'), t2: tune('t2', 5) } });
    const b = base({ tunes: { t1: tune('t1', 20, 'New name'), t3: tune('t3', 7) } });
    const m = merge(a, b);
    expect(Object.keys(m.tunes).sort()).toEqual(['t1', 't2', 't3']);
    expect(m.tunes.t1.name).toBe('New name');
    expect(merge(b, a).tunes.t1.name).toBe('New name');
  });
  it('a deleted tune stays deleted, unless it was edited after the deletion', () => {
    const a = base({ tunes: { t1: tune('t1', 10), t2: tune('t2', 30) } });
    const b = base({ tunes: {}, tomb: { 'tune:t1': 20, 'tune:t2': 20 } });
    const m = merge(a, b);
    expect(Object.keys(m.tunes)).toEqual(['t2']);
    expect(m.tomb['tune:t1']).toBe(20);
    expect(Object.keys(merge(m, a).tunes)).toEqual(['t2']);
  });
  it('copes with copies that have no tunes at all', () => {
    const m = merge(base(), base({ tunes: { t1: tune('t1', 1) } }));
    expect(Object.keys(m.tunes)).toEqual(['t1']);
    expect(merge(base(), base()).tunes).toEqual({});
  });
});

describe('digest', () => {
  it('matches the same progress whatever order its keys were added in', () => {
    const a = base({ skills: { intervals: { items: { P5: { n: 1 }, M3: { n: 2 } } } }, lessons: { l1: 5, l2: 6 } });
    const b = base({ lessons: { l2: 6, l1: 5 }, skills: { intervals: { items: { M3: { n: 2 }, P5: { n: 1 } } } } });
    expect(digest(a)).toBe(digest(b));
  });
  it('notices lessons, records heard, songs and deletions, not only practice', () => {
    const d = digest(base());
    expect(digest(base({ lessons: { l1: 5 } }))).not.toBe(d);
    expect(digest(base({ heard: { x: 5 } }))).not.toBe(d);
    expect(digest(base({ songs: { s1: { id: 's1' } } }))).not.toBe(d);
    expect(digest(base({ tomb: { 'tune:x': 5 } }))).not.toBe(d);
  });
  it('two devices that merged each other agree, so the sync stops pushing', () => {
    const sk = items => ({ items, conf: {}, last: 0 });
    const phone = base({ updatedAt: 5, skills: { intervals: sk({ P5: { n: 1, last: 3 } }) }, lessons: { l1: 4 }, cur: { items: { 'tune:a': { s: 1, last: 2 } } } });
    const desk = base({ updatedAt: 7, skills: { chords: sk({ maj: { n: 2, last: 6 } }), intervals: sk({ M3: { n: 1, last: 6 } }) }, heard: { r: 1 }, cur: { items: { 'tune:b': { s: 2, last: 6 } } } });
    const onPhone = merge(phone, desk), onDesk = merge(desk, onPhone);
    expect(digest(onDesk)).toBe(digest(onPhone));
  });
});

describe('time on each scale', () => {
  it('a schema-3 save gains an empty record and keeps the rest', () => {
    const m = migrate({ v: 1, schema: 3, tunes: { t1: { id: 't1' } } }, 'd1');
    expect(m.schema).toBe(SCHEMA);
    expect(m.scaleTime).toEqual({});
    expect(m.tunes.t1.id).toBe('t1');
  });
  it('keeps each device’s own time, taking the bigger total of each scale and key', () => {
    const a = base({ scaleTime: { phone: { 'major:7': { v: 300, p: 0, last: 10 } }, desk: { 'major:7': { v: 0, p: 60, last: 5 } } } });
    const b = base({ scaleTime: { phone: { 'major:7': { v: 120, p: 30, last: 8 }, 'dorian:2': { v: 50, p: 0, last: 9 } }, desk: { 'major:7': { v: 0, p: 600, last: 20 } } } });
    const m = merge(a, b);
    expect(m.scaleTime.phone['major:7']).toEqual({ v: 300, p: 30, last: 10 });
    expect(m.scaleTime.phone['dorian:2'].v).toBe(50);
    expect(m.scaleTime.desk['major:7'].p).toBe(600);
    // merging again, either way round, changes nothing
    expect(merge(m, a).scaleTime).toEqual(m.scaleTime);
    expect(digest(merge(b, a))).toBe(digest(m));
  });
  it('copes with copies that have no scale time', () => {
    expect(merge(base(), base()).scaleTime).toEqual({});
    expect(merge(base(), base({ scaleTime: { d: { 'major:0': { v: 5, p: 0, last: 1 } } } })).scaleTime.d['major:0'].v).toBe(5);
  });
  it('is part of the digest, so the sync pushes it', () => {
    expect(digest(base({ scaleTime: { d: { 'major:0': { v: 5 } } } }))).not.toBe(digest(base()));
  });
});

describe('personal bests', () => {
  it('a schema-4 save gains an empty record and keeps its scale time', () => {
    const m = migrate({ v: 1, schema: 4, scaleTime: { d: { 'major:0': { v: 5, p: 0, last: 1 } } } }, 'd1');
    expect(m.schema).toBe(SCHEMA);
    expect(m.records).toEqual({});
    expect(m.scaleTime.d['major:0'].v).toBe(5);
  });
  it('keeps the best of each from either copy, and is part of the digest', () => {
    const m = merge(base({ records: { streak: 12, goalStreak: 2 } }), base({ updatedAt: 9, records: { streak: 5, goalStreak: 7 } }));
    expect(m.records).toEqual({ streak: 12, goalStreak: 7 });
    expect(merge(base(), base()).records).toEqual({});
    expect(digest(base({ records: { streak: 1 } }))).not.toBe(digest(base()));
  });
});

describe('the Library', () => {
  const file = (id, name = id + '.jpg') => ({ id, name, type: 'image/jpeg', size: 100, added: 1 });
  const entry = (id, updatedAt, extra = {}) => Object.assign({ id, title: id, by: '', status: 'learning', notes: '', link: '', files: [], updatedAt }, extra);
  it('a schema-5 save gains an empty library and keeps the rest', () => {
    const m = migrate({ v: 1, schema: 5, records: { streak: 3 } }, 'd1');
    expect(m.schema).toBe(SCHEMA);
    expect(m.library).toEqual({});
    expect(m.records.streak).toBe(3);
  });
  it('keeps the newer details and the files added on either device', () => {
    const phone = base({ library: { e1: entry('e1', 10, { notes: 'old', files: [file('p1'), file('p2')] }) } });
    const desk = base({ library: { e1: entry('e1', 20, { notes: 'new', files: [file('p1'), file('x.pdf')] }), e2: entry('e2', 5) } });
    const m = merge(phone, desk);
    expect(Object.keys(m.library).sort()).toEqual(['e1', 'e2']);
    expect(m.library.e1.notes).toBe('new');
    expect(m.library.e1.files.map(f => f.id)).toEqual(['p1', 'x.pdf', 'p2']); // the newer copy's order, then the rest
    expect(merge(desk, phone).library.e1.files.map(f => f.id)).toEqual(['p1', 'x.pdf', 'p2']);
    expect(digest(merge(desk, m))).toBe(digest(m));
  });
  it('a removed file and a deleted entry stay gone', () => {
    const phone = base({ library: { e1: entry('e1', 10, { files: [file('p1'), file('p2')] }), e2: entry('e2', 10) } });
    const desk = base({ library: { e1: entry('e1', 30, { files: [file('p1')] }) }, tomb: { 'libfile:p2': 30, 'lib:e2': 30 } });
    const m = merge(phone, desk);
    expect(m.library.e1.files.map(f => f.id)).toEqual(['p1']);
    expect(m.library.e2).toBeUndefined();
    expect(merge(m, phone).library.e2).toBeUndefined();
  });
  it('keeps the fastest clean tempo for each section from either copy', () => {
    const phone = base({ library: { e1: entry('e1', 10, { tempos: { 'f1:1-4': { best: 90, of: 120, t: 10 }, 'f1:9-16': { best: 60, of: 120, t: 9 } } }) } });
    const desk = base({ library: { e1: entry('e1', 20, { notes: 'new', tempos: { 'f1:1-4': { best: 80, of: 120, t: 20 }, 'f1:5-8': { best: 70, of: 120, t: 20 } } }) } });
    const m = merge(phone, desk);
    expect(m.library.e1.notes).toBe('new');
    expect(m.library.e1.tempos).toEqual({ 'f1:1-4': { best: 90, of: 120, t: 10 }, 'f1:5-8': { best: 70, of: 120, t: 20 }, 'f1:9-16': { best: 60, of: 120, t: 9 } });
    expect(merge(desk, phone).library.e1.tempos).toEqual(m.library.e1.tempos);
    expect(merge(base({ library: { e1: entry('e1', 1) } }), base({ library: { e1: entry('e1', 2) } })).library.e1.tempos).toBeUndefined();
  });
  it('copes with copies that have no library, and is part of the digest', () => {
    expect(merge(base(), base()).library).toEqual({});
    expect(Object.keys(merge(base(), base({ library: { e1: entry('e1', 1) } })).library)).toEqual(['e1']);
    expect(digest(base({ library: { e1: entry('e1', 1) } }))).not.toBe(digest(base()));
  });
});
