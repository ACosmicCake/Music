/* World Woodshed — streaks and the daily goal: plain functions over the practice history (state.history, every
   device added up, see src/sync.js), so they can be tested with a pinned clock.

   - A day counts toward the streak by the player's rule: any practice (a minute, or one answer), at least
     n minutes, or the daily goal met.
   - The goal can grow by itself toward a target (say 4 hours): after at least a week at one goal, if it was
     met on 5 of the last 7 days, it goes up one step (10%, at least 10 minutes). It never goes down by
     itself; the player can always set it by hand.
   - The goal of each day is kept in a short log ([[day, minutes], …], from that day on), so raising the goal
     does not undo the days already met. */

const DAY = 864e5;
export const RAMP_DAYS = 7, RAMP_MET = 5;
export const keyOf = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const noon = key => new Date(key + 'T12:00:00');
/* the day n days before the day of t (by the calendar, so daylight-saving changes don't skip a day) */
export function dayBefore(t, n) { const d = new Date(t); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n); return keyOf(d); }
export function daysBetween(a, b) { return Math.round((noon(b) - noon(a)) / DAY); }

export const minutesOn = (history, key) => { const h = history && history[key]; return h ? (h.sec || 0) / 60 : 0; };

/* The goal that held on a day: the last log entry on or before it (before the log starts, its first goal) */
export function goalOn(log, key, fallback = 30) {
  if (!Array.isArray(log) || !log.length) return fallback;
  let g = log[0][1];
  log.forEach(([k, m]) => { if (k <= key) g = m; });
  return g;
}
/* The log with today's goal set (one entry per day, oldest first, the last 60 changes) */
export function logGoal(log, key, minutes) {
  const out = (Array.isArray(log) ? log : []).filter(([k]) => k !== key);
  if (!out.length || goalOn(out, key) !== minutes) out.push([key, minutes]);
  return out.sort((a, b) => (a[0] < b[0] ? -1 : 1)).slice(-60);
}

/* Does a day count toward the streak? rule: 'any', a number of minutes, or 'goal' */
export function counts(h, rule, goal) {
  if (!h) return false;
  const min = (h.sec || 0) / 60;
  if (rule === 'goal') return min >= goal;
  if (typeof rule === 'number' && rule > 0) return min >= rule;
  return (h.q || 0) > 0 || (h.sec || 0) > 60;
}

/* Where the streaks stand at time `now`:
   { current, today (today already counts), atRisk (a streak that today has not kept yet), best,
     goalCurrent, goalToday, goalBest, todayMin, goal (today's) }
   A streak runs up to today, or up to yesterday while today is still open. Best is over the history kept
   (about six months); the engine keeps the best ever on top of that. */
export function streaks(history, now, o = {}) {
  const rule = o.rule === undefined ? 'any' : o.rule, log = o.log || [], fallback = o.goal || 30;
  const todayKey = keyOf(now), goal = goalOn(log, todayKey, fallback);
  const metDay = k => minutesOn(history, k) >= goalOn(log, k, fallback);
  const okDay = k => counts(history && history[k], rule, goalOn(log, k, fallback));
  const run = test => {
    let n = 0;
    for (let i = 0; i < 1000; i++) {
      if (test(dayBefore(now, i))) n++;
      else if (i === 0) continue; // today is not over yet
      else break;
    }
    return n;
  };
  // best runs over every day from the oldest kept to today
  const keys = Object.keys(history || {}).filter(k => k <= todayKey).sort();
  let best = 0, goalBest = 0;
  if (keys.length) {
    let a = 0, b = 0;
    for (let i = Math.min(daysBetween(keys[0], todayKey), 1000); i >= 0; i--) {
      const k = dayBefore(now, i);
      a = okDay(k) ? a + 1 : 0; b = metDay(k) ? b + 1 : 0;
      best = Math.max(best, a); goalBest = Math.max(goalBest, b);
    }
  }
  const today = okDay(todayKey), current = run(okDay);
  return { current, today, atRisk: current > 0 && !today, best, goalCurrent: run(metDay), goalToday: metDay(todayKey), goalBest,
    todayMin: minutesOn(history, todayKey), goal };
}

/* One step up from a goal: 10%, at least 10 minutes, in whole 5 minutes */
export function rampStep(goal) { return Math.max(10, Math.round(goal * 0.1 / 5) * 5); }

/* The growing goal. p: { goal, target, since (day the goal was last set), log }.
   { met (goal days in the last 7 full days), wait (days until the week at this goal is up), next (the
   goal it grows to), raise (true when it should grow now) }, or null when it is not growing. */
export function ramp(p, history, now) {
  const goal = p.goal || 30, target = p.target || 0;
  if (!target || goal >= target) return null;
  const log = p.log || [];
  let met = 0;
  for (let i = 1; i <= RAMP_DAYS; i++) { const k = dayBefore(now, i); if (minutesOn(history, k) >= goalOn(log, k, goal)) met++; }
  const wait = p.since ? Math.max(0, RAMP_DAYS - daysBetween(p.since, keyOf(now))) : RAMP_DAYS;
  const next = Math.min(target, goal + rampStep(goal));
  return { met, wait, next, raise: !!p.since && wait === 0 && met >= RAMP_MET };
}

export default { keyOf, dayBefore, daysBetween, minutesOn, goalOn, logGoal, counts, streaks, rampStep, ramp, RAMP_DAYS, RAMP_MET };
