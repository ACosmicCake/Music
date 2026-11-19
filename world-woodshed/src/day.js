/* World Woodshed — the practice day. It ends at DAY_ENDS (1 am) rather than midnight, so practice from 00:00 to
   00:59 counts toward the day before: a late session finishing after midnight still lands on the evening it
   started. Everything that splits practice by day (history and each device's record, the daily goal, streaks
   and freezes, the planner's day, statistics, the weekly review, the club's nights, the garden, the reminder)
   reads its day from here. Keys are 'YYYY-MM-DD' in local time. Plain functions; test/day.test.js. */

export const DAY_ENDS = 1; // the hour, local time, at which a new practice day begins

const pad = n => String(n).padStart(2, '0');
/* 'YYYY-MM-DD' of a Date by its own calendar date (for dates already on a practice day, such as noon dates) */
export const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());

/* Noon on the practice day holding t (noon keeps day steps clear of daylight-saving changes) */
export function practiceDate(t = Date.now()) {
  const d = new Date(t);
  if (d.getHours() < DAY_ENDS) d.setDate(d.getDate() - 1);
  d.setHours(12, 0, 0, 0);
  return d;
}

/* The practice day holding t, as 'YYYY-MM-DD' */
export const dayKey = (t = Date.now()) => ymd(practiceDate(t));

/* When the practice day after the one holding t ends (ms), shifted by `extra` more days */
export function dayEnd(t = Date.now(), extra = 0) {
  const d = practiceDate(t);
  d.setDate(d.getDate() + 1 + extra);
  d.setHours(DAY_ENDS, 0, 0, 0);
  return d.getTime() - 1;
}
