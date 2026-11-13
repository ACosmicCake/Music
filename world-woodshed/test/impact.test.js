import { describe, it, expect } from 'vitest';
import Imp from '../src/impact.js';

const day = (k, min) => ({ [k]: { sec: min * 60, q: 0, c: 0, by: {} } });
const hdevOf = (...devs) => Object.fromEntries(devs.map((d, i) => ['dev' + i, d]));
const T = iso => Date.parse(iso);
const fakePlant = (log, failAt = -1) => async (kind, count, key) => {
  if (log.length === failAt) throw new Error('GoodAPI answered 500');
  log.push({ kind, count, key });
  return { id: 'id' + log.length, project: 'Somewhere' };
};

describe('impact: hours into trees', () => {
  it('adds every device and ignores rows that are not days', () => {
    const m = Imp.dayMinutes(hdevOf(day('2026-11-10', 30), { ...day('2026-11-10', 15), junk: { sec: 600 } }));
    expect(m).toEqual({ '2026-11-10': 45 });
  });

  it('the first run only starts counting: past hours never count', async () => {
    const hdev = hdevOf({ ...day('2026-10-01', 600), ...day('2026-11-12', 45) });
    const log = [];
    const r = await Imp.run({ ledger: null, hdev, choice: 'tree', now: T('2026-11-12T03:17:00Z'), plant: fakePlant(log) });
    expect(r.started).toBe(true);
    expect(log).toEqual([]);
    expect(r.ledger.start).toBe('2026-11-12');
    expect(r.ledger.base).toBe(45);
    expect(Imp.progress(r.ledger).min).toBe(0);
  });

  it('starts on the latest day the progress knows when the player is ahead of UTC', () => {
    const l = Imp.startLedger({ '2026-11-13': 20 }, '2026-11-12');
    expect(l.start).toBe('2026-11-13');
    expect(l.base).toBe(20);
  });

  it('orders one unit per 10 hours, with stable idempotency keys, and never twice', async () => {
    let ledger = { v: 1, start: '2026-11-01', base: 0, days: {}, planted: [] };
    const hdev = hdevOf({ ...day('2026-11-01', 400), ...day('2026-11-02', 900) }); // 21.7 h
    const log = [];
    let r = await Imp.run({ ledger, hdev, choice: 'tree', now: T('2026-11-03T03:00:00Z'), plant: fakePlant(log) });
    expect(log.map(x => x.key)).toEqual(['ww-2026-11-01-0', 'ww-2026-11-01-1']);
    expect(r.made.length).toBe(2);
    r = await Imp.run({ ledger: r.ledger, hdev, choice: 'tree', now: T('2026-11-04T03:00:00Z'), plant: fakePlant(log) });
    expect(log.length).toBe(2);
    expect(r.made).toEqual([]);
  });

  it('remembers days the app has since dropped from its history', async () => {
    let ledger = { v: 1, start: '2026-01-01', base: 0, days: { '2026-01-01': 590 }, planted: [] };
    const log = [];
    const r = await Imp.run({ ledger, hdev: hdevOf(day('2026-07-01', 15)), choice: 'tree', now: T('2026-07-02T00:00:00Z'), plant: fakePlant(log) });
    expect(log.length).toBe(1);
    expect(r.ledger.days['2026-01-01']).toBe(590);
  });

  it('keeps the larger total for a day it has seen before', () => {
    const l = Imp.withDays({ v: 1, start: '2026-11-01', base: 0, days: { '2026-11-01': 50 }, planted: [] }, { '2026-11-01': 30, '2026-10-31': 99 });
    expect(l.days).toEqual({ '2026-11-01': 50 });
  });

  it('stops at the monthly cap and carries the rest into next month', async () => {
    const ledger = { v: 1, start: '2026-11-01', base: 0, days: {}, planted: [] };
    const hdev = hdevOf(day('2026-11-01', 600 * 7));
    const log = [];
    let r = await Imp.run({ ledger, hdev, choice: 'tree', cap: 3, now: T('2026-11-20T03:00:00Z'), plant: fakePlant(log) });
    expect(log.length).toBe(3);
    expect(r.waiting).toBe(4);
    r = await Imp.run({ ledger: r.ledger, hdev, choice: 'tree', cap: 3, now: T('2026-11-21T03:00:00Z'), plant: fakePlant(log) });
    expect(log.length).toBe(3);
    r = await Imp.run({ ledger: r.ledger, hdev, choice: 'tree', cap: 3, now: T('2026-12-01T03:00:00Z'), plant: fakePlant(log) });
    expect(log.length).toBe(6);
    expect(log[5].key).toBe('ww-2026-11-01-5');
  });

  it('takes turns: tree, kelp, then ten bottles', async () => {
    const ledger = { v: 1, start: '2026-11-01', base: 0, days: {}, planted: [] };
    const log = [];
    await Imp.run({ ledger, hdev: hdevOf(day('2026-11-01', 600 * 4)), choice: 'turns', now: T('2026-11-02T00:00:00Z'), plant: fakePlant(log) });
    expect(log.map(x => x.kind + x.count)).toEqual(['tree1', 'kelp1', 'bottles10', 'tree1']);
  });

  it('keeps what was ordered before a failure and tries the rest next time', async () => {
    const ledger = { v: 1, start: '2026-11-01', base: 0, days: {}, planted: [] };
    const hdev = hdevOf(day('2026-11-01', 600 * 3));
    const log = [];
    let r = await Imp.run({ ledger, hdev, choice: 'tree', now: T('2026-11-02T00:00:00Z'), plant: fakePlant(log, 1) });
    expect(r.error).toMatch(/500/);
    expect(r.ledger.planted.length).toBe(1);
    r = await Imp.run({ ledger: r.ledger, hdev, choice: 'tree', now: T('2026-11-03T00:00:00Z'), plant: fakePlant(log) });
    expect(log.map(x => x.key)).toEqual(['ww-2026-11-01-0', 'ww-2026-11-01-1', 'ww-2026-11-01-2']);
  });

  it('test orders are marked, keyed apart, and dropped when the live key goes in', async () => {
    const ledger = { v: 1, start: '2026-11-01', base: 0, days: {}, planted: [] };
    const hdev = hdevOf(day('2026-11-01', 600 * 2));
    const log = [];
    let r = await Imp.run({ ledger, hdev, choice: 'tree', test: true, now: T('2026-11-02T00:00:00Z'), plant: fakePlant(log) });
    expect(r.ledger.planted.every(p => p.test)).toBe(true);
    expect(log[0].key).toBe('test-ww-2026-11-01-0');
    expect(Imp.live(r.ledger).length).toBe(2);
    r = await Imp.run({ ledger: r.ledger, hdev, choice: 'tree', now: T('2026-11-03T00:00:00Z'), plant: fakePlant(log) });
    expect(log.slice(2).map(x => x.key)).toEqual(['ww-2026-11-01-0', 'ww-2026-11-01-1']);
    expect(r.ledger.planted.some(p => p.test)).toBe(false);
  });

  it('progress counts practice the app has that the Action has not seen yet', () => {
    const ledger = { v: 1, start: '2026-11-01', base: 10, days: { '2026-11-01': 70 }, planted: [] };
    const p = Imp.progress(ledger, { '2026-11-01': 70, '2026-11-02': 600 });
    expect(p.min).toBe(660);
    expect(p.earned).toBe(1);
    expect(p.waiting).toBe(1);
    expect(p.toNext).toBe(540);
  });

  it('names amounts', () => {
    expect(Imp.amount('tree', 1)).toBe('1 tree');
    expect(Imp.amount('kelp', 3)).toBe('3 kelp');
    expect(Imp.amount('bottles', 2)).toBe('20 bottles');
  });
});
