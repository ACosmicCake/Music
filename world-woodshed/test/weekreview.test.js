import { describe, it, expect } from 'vitest';
import { weekReview } from '../src/weekreview.js';

/* The weekly review (src/weekreview.js) */
const NOW = new Date('2026-11-11T10:00:00').getTime(); // a Wednesday: last week is 2–8 November
const day = (sec, by = {}) => ({ sec, q: Object.values(by).reduce((a, x) => a + x[0], 0), c: Object.values(by).reduce((a, x) => a + x[1], 0), by });
function build(days) {
  const hdev = { d1: {} }, history = {};
  Object.entries(days).forEach(([k, r]) => { hdev.d1[k] = r; history[k] = { sec: r.sec, q: r.q, c: r.c }; });
  return { hdev, history, names: { intervals: 'Intervals', chords: 'Chords', clock: 'Time feel' } };
}

describe('weekly review', () => {
  it('is null with no practice in either week', () => {
    expect(weekReview(NOW, build({}))).toBe(null);
  });
  it('counts last week\'s minutes, days and goal days, against the week before', () => {
    const o = build({
      '2026-10-27': day(1800), // the week before: 30 min
      '2026-11-02': day(2400), '2026-11-04': day(600), '2026-11-08': day(3600) // last week: 40 + 10 + 60
    });
    o.goalLog = [['2026-01-01', 30]];
    const r = weekReview(NOW, o);
    expect(r.week).toBe('2026-11-02');
    expect(Math.round(r.min)).toBe(110);
    expect(r.change).toBeCloseTo(110 / 30 - 1);
    expect(r.practised).toBe(3);
    expect(r.goalMet).toBe(2);
    expect(r.focus.kind).toBe('days');
  });
  it('names the skills that improved and the one that slipped, and focuses on the slip', () => {
    const o = build({
      '2026-10-28': day(1200, { intervals: [20, 10, 600], chords: [20, 18, 600] }),
      '2026-11-03': day(1200, { intervals: [20, 18, 600], chords: [20, 12, 600] })
    });
    const r = weekReview(NOW, o);
    expect(r.up.map(s => s.skill)).toEqual(['intervals']);
    expect(r.down.map(s => s.skill)).toEqual(['chords']);
    expect(r.focus).toMatchObject({ kind: 'slipped', skill: 'chords' });
    expect(r.focus.text).toContain('90% to 60%');
  });
  it('ignores accuracy on a handful of answers', () => {
    const o = build({ '2026-10-28': day(600, { intervals: [3, 3, 300] }), '2026-11-03': day(600, { intervals: [4, 1, 300] }) });
    expect(weekReview(NOW, o).down).toEqual([]);
  });
  it('points to the reviews when many are due', () => {
    const o = build(Object.fromEntries(['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06'].map(k => [k, day(900, { intervals: [5, 5, 300], chords: [5, 5, 300] })])));
    o.due = Array.from({ length: 6 }, (_, i) => ({ name: 'Item ' + i }));
    const r = weekReview(NOW, o);
    expect(r.focus.kind).toBe('due');
    expect(r.focus.text).toContain('Item 0');
    expect(r.dueCount).toBe(6);
  });
});
