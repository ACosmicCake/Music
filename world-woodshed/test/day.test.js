import { describe, it, expect } from 'vitest';
import './env.js';
import { DAY_ENDS, dayKey, practiceDate, dayEnd } from '../src/day.js';
import { keyOf, dayBefore, streaks } from '../src/goals.js';
import { weekStart, endOfTomorrow } from '../src/stats.js';
import { reminderTimes } from '../src/reminder.js';

const at = (y, m, d, hh, mm = 0) => new Date(y, m - 1, d, hh, mm).getTime();

describe('the practice day ends at 1 am', () => {
  it('counts 00:00 to 00:59 toward the day before', () => {
    expect(DAY_ENDS).toBe(1);
    expect(dayKey(at(2026, 11, 19, 0, 0))).toBe('2026-11-18');
    expect(dayKey(at(2026, 11, 19, 0, 59))).toBe('2026-11-18');
    expect(dayKey(at(2026, 11, 19, 1, 0))).toBe('2026-11-19');
    expect(dayKey(at(2026, 11, 19, 23, 59))).toBe('2026-11-19');
    expect(dayKey(at(2026, 1, 1, 0, 30))).toBe('2025-12-31');
    expect(dayKey(at(2026, 3, 1, 0, 30))).toBe('2026-02-28');
  });
  it('gives noon on that day, and when the next one ends', () => {
    const d = practiceDate(at(2026, 11, 19, 0, 30));
    expect([d.getDate(), d.getHours()]).toEqual([18, 12]);
    expect(dayEnd(at(2026, 11, 19, 0, 30))).toBe(at(2026, 11, 19, 1) - 1);
    expect(dayEnd(at(2026, 11, 19, 15))).toBe(at(2026, 11, 20, 1) - 1);
  });
  it('is the day the goals, streaks and statistics use', () => {
    expect(keyOf(at(2026, 11, 19, 0, 30))).toBe('2026-11-18');
    expect(dayBefore(at(2026, 11, 19, 0, 30), 1)).toBe('2026-11-17');
    // Monday 16 November 2026 00:30 is still Sunday's practice day, so last week's
    expect(weekStart(at(2026, 11, 16, 0, 30)).getDate()).toBe(9);
    expect(weekStart(at(2026, 11, 16, 1, 0)).getDate()).toBe(16);
    expect(endOfTomorrow(at(2026, 11, 19, 0, 30))).toBe(at(2026, 11, 20, 1) - 1);
  });
  it('keeps a streak alive through a late session after midnight', () => {
    const history = { '2026-11-17': { sec: 1800 }, '2026-11-18': { sec: 1800 } };
    const st = streaks(history, at(2026, 11, 19, 0, 40), { rule: 'any', goal: 30 });
    expect(st.today).toBe(true);
    expect(st.current).toBe(2);
  });
  it('skips the reminders of a practice day already played', () => {
    // 00:30 on the 19th, practised on the 18th's day: a 00:45 reminder belongs to the 18th and is left out
    const t = reminderTimes(at(2026, 11, 19, 0, 30), '00:45', true, 2);
    expect(t.map(d => d.getDate())).toEqual([20, 21]);
    const u = reminderTimes(at(2026, 11, 19, 0, 30), '20:00', true, 2);
    expect(u.map(d => d.getDate())).toEqual([19, 20]);
  });
});
