import './env.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import E from '../src/engine.js';
import { SCHEMA } from '../src/sync.js';

/* The skill model in src/engine.js: recording answers, mastery, level unlocks, picking the next
   question, and backups. Each test starts from a fresh state at a fixed time. */

const T0 = new Date('2026-10-20T10:00:00').getTime();
const MIN = 60e3, DAY = 864e5;

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(T0);
  E.resetAll();
});
afterEach(() => vi.useRealTimers());

describe('record', () => {
  it('starts a new item at its first score and smooths later ones (70% old, 30% new)', () => {
    const it = E.record('intervals', 'P5:up', true);
    expect(it).toMatchObject({ n: 1, c: 1, ema: 1, box: 1 });
    E.record('intervals', 'P5:up', false);
    expect(it.ema).toBeCloseTo(0.7);
    expect(it).toMatchObject({ n: 2, c: 1, box: 0 });
  });
  it('spaces a correct item further out each time (Leitner boxes) and resets on a miss', () => {
    const gaps = [];
    for (let i = 0; i < 4; i++) { const it = E.record('chords', 'maj', true); gaps.push(it.due - Date.now()); }
    expect(gaps).toEqual([10 * MIN, DAY, 3 * DAY, 7 * DAY]);
    const it = E.record('chords', 'maj', false);
    expect(it.box).toBe(0);
    expect(it.due).toBe(Date.now());
  });
  it('takes a partial score between 0 and 1, clamped', () => {
    expect(E.record('reading', 'x', true, { score: 0.4 }).ema).toBe(0.4);
    expect(E.record('reading', 'y', true, { score: 7 }).ema).toBe(1);
  });
  it('counts which answer a miss was mistaken for', () => {
    E.record('chords', 'maj7', false, { confused: 'dom7' });
    E.record('chords', 'maj7', false, { confused: 'dom7' });
    E.record('chords', 'maj7', false, { confused: 'maj7' }); // picking the right answer is not a confusion
    expect(E.skillState('chords').conf).toEqual({ 'maj7>dom7': 2 });
    expect(E.confusions()[0]).toMatchObject({ skill: 'chords', a: 'maj7', b: 'dom7', count: 2 });
  });
  it('adds the answer to today on this device and in the totals', () => {
    E.record('intervals', 'P4:up', true);
    E.record('intervals', 'P4:up', false);
    const day = E.dayKey();
    expect(E.state.history[day]).toMatchObject({ q: 2, c: 1 });
    expect(E.state.history[day].by.intervals.slice(0, 2)).toEqual([2, 1]);
    expect(E.state.hdev[E.device()][day]).toMatchObject({ q: 2, c: 1 });
  });
});

describe('mastery and levels', () => {
  it('weighs each item by its accuracy and by how often it has been tried (full weight from 3 tries)', () => {
    const n = E.universe('chords').length;
    E.record('chords', 'maj', true);
    expect(E.mastery('chords')).toBeCloseTo(100 / 3 / n);
    E.record('chords', 'maj', true); E.record('chords', 'maj', true);
    expect(E.mastery('chords')).toBeCloseTo(100 / n);
  });
  it('opens the next level when 80% of the open items are tried at 75% average', () => {
    expect(E.unlockedTier('chords')).toBe(1);
    const tier1 = E.universe('chords').filter(x => x.tier === 1);
    tier1.forEach(x => E.record('chords', x.id, true));
    expect(E.unlockedTier('chords')).toBeGreaterThanOrEqual(2);
    expect(E.unlocked('chords').some(x => x.tier === 2)).toBe(true);
  });
  it('does not open a level while accuracy is low', () => {
    E.universe('chords').filter(x => x.tier === 1).forEach(x => { E.record('chords', x.id, true); E.record('chords', x.id, false); E.record('chords', x.id, false); });
    expect(E.unlockedTier('chords')).toBe(1);
    expect(E.levelProgress('chords').text).toMatch(/accuracy \d+% of 75%/);
  });
  it('technique mastery is the best tempo against each exercise target', () => {
    const ex = E.universe('technique')[0];
    const t = E.techState(ex.id);
    t.best = 1e6; // capped at 100% for that exercise
    expect(E.mastery('technique')).toBeCloseTo(100 / E.universe('technique').length);
  });
});

describe('pick', () => {
  const pool = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  it('almost never asks the same item twice in a row (its weight drops to 2%)', () => {
    let last = null, repeats = 0;
    for (let i = 0; i < 500; i++) { const p = E.pick('degrees', pool); if (p.id === last) repeats++; last = p.id; }
    expect(repeats).toBeLessThan(25);
  });
  it('favours a weak item over a strong one', () => {
    const two = [{ id: 'weak' }, { id: 'strong' }];
    for (let i = 0; i < 5; i++) E.record('progressions', 'strong', true);
    E.record('progressions', 'weak', false); E.record('progressions', 'weak', false);
    // drawing once from another pool in between clears the "just asked" penalty, so each draw is independent
    const counts = { weak: 0, strong: 0 };
    const rnd = vi.spyOn(Math, 'random');
    for (let i = 0; i < 100; i++) { rnd.mockReturnValue((i + 0.5) / 100); E.pick('progressions', [{ id: 'zz' + i }]); counts[E.pick('progressions', two).id]++; }
    rnd.mockRestore();
    expect(counts.weak).toBeGreaterThan(counts.strong * 2);
  });
  it('returns null for an empty pool', () => {
    expect(E.pick('degrees', [])).toBeNull();
  });
});

describe('backup export and import', () => {
  it('exports the whole state with the app name and schema', () => {
    E.record('intervals', 'P5:up', true);
    const b = E.exportBackup();
    expect(b).toMatchObject({ app: 'world-woodshed', schema: SCHEMA, device: E.device() });
    expect(b.state.skills.intervals.items['P5:up'].n).toBe(1);
  });
  it('merges an imported backup with what is on this device, losing neither', () => {
    E.record('intervals', 'P5:up', true);
    const file = JSON.parse(JSON.stringify(E.exportBackup()));
    file.device = 'phone';
    file.state.skills.chords = { items: { maj: { n: 4, c: 4, ema: 1, box: 3, due: 0, last: T0 + 1 } }, conf: {}, last: T0 + 1 };
    E.resetAll();
    E.record('degrees', '5', true);
    expect(E.importBackup(file)).toBe(true);
    expect(E.state.skills.chords.items.maj.n).toBe(4);
    expect(E.state.skills.degrees.items['5'].n).toBe(1);
    expect(E.state.skills.intervals.items['P5:up'].n).toBe(1);
  });
  it('replace mode restores the file exactly, dropping this device\'s changes', () => {
    const file = JSON.parse(JSON.stringify(E.exportBackup()));
    E.record('degrees', '5', true);
    E.importBackup(file, 'replace');
    expect(E.state.skills.degrees).toBeUndefined();
  });
  it('accepts a bare state as well as the wrapped file, and rejects anything else', () => {
    const bare = JSON.parse(JSON.stringify(E.state));
    expect(() => E.importBackup(bare)).not.toThrow();
    expect(() => E.importBackup({ hello: 1 })).toThrow(/not a World Woodshed backup/);
    expect(() => E.importBackup(null)).toThrow();
  });
});

describe('technique tempo', () => {
  it('keeps an open exercise tied to the live state after a sync folds another copy in', () => {
    const t = E.techState('altpick'), start = t.bpm;
    E.importBackup(JSON.parse(JSON.stringify(E.exportBackup())));
    E.setTechBpm('altpick', t.bpm + 2);
    expect(t.bpm).toBe(start + 2);
    expect(E.state.tech.altpick).toBe(t);
    E.importBackup(JSON.parse(JSON.stringify(E.exportBackup())), 'replace');
    E.setTechBpm('altpick', t.bpm + 2);
    expect(E.state.tech.altpick.bpm).toBe(start + 4);
  });
  it('lets a tempo set by hand win over an older copy from another device', () => {
    const t = E.techState('altpick');
    E.techResult('altpick', true);
    const other = JSON.parse(JSON.stringify(E.exportBackup()));
    other.state.tech.altpick.last = T0 + MIN; // practised on the phone a minute later
    vi.setSystemTime(T0 + 2 * MIN);
    E.setTechBpm('altpick', 120);
    E.importBackup(other);
    expect(E.state.tech.altpick.bpm).toBe(120);
    expect(t.bpm).toBe(120);
  });
});
