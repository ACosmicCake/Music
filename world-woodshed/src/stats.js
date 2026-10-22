/* World Woodshed — practice statistics: plain functions over the saved state, for the Statistics page.

   Practice time and answers are kept per device and per day in state.hdev ({ device: { 'YYYY-MM-DD':
   { sec, q, c, by: { skill: [answers, correct, sec] } } } }); each device only ever writes its own days, so
   adding the devices up gives the real total (history is rebuilt the same way, src/sync.js). Weeks run
   Monday to Sunday, as on the Today heatmap. Nothing here reads the clock or the engine: the caller passes
   the state and "now", so the tests can pin both. */

const keyOf = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

/* Noon on the Monday of the week holding t (noon keeps day steps clear of daylight-saving changes) */
export function weekStart(t) {
  const d = new Date(t); d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

/* Every device's record of one day, added up */
export function dayTotal(hdev, key) {
  const out = { sec: 0, q: 0, c: 0, by: {} };
  Object.values(hdev || {}).forEach(dev => {
    const r = dev && dev[key];
    if (!r) return;
    out.sec += r.sec || 0; out.q += r.q || 0; out.c += r.c || 0;
    Object.entries(r.by || {}).forEach(([k, a]) => {
      const o = out.by[k] || (out.by[k] = [0, 0, 0]);
      (a || []).forEach((v, i) => { o[i] += v || 0; });
    });
  });
  return out;
}

/* The last n weeks, oldest first, ending with the current one (which is still in progress).
   Each: { start (Date, Monday), key, min, q, c, other (minutes not tied to one skill: breaks, lessons,
   listening, free practice), skills: { skill: { min, q, c } } } */
export function weeks(hdev, n = 8, now = Date.now()) {
  const first = weekStart(now);
  first.setDate(first.getDate() - 7 * (n - 1));
  const out = [];
  for (let w = 0; w < n; w++) {
    const start = new Date(first); start.setDate(first.getDate() + 7 * w);
    const wk = { start, key: keyOf(start), min: 0, q: 0, c: 0, other: 0, skills: {} };
    for (let d = 0; d < 7; d++) {
      const day = new Date(start); day.setDate(start.getDate() + d);
      const t = dayTotal(hdev, keyOf(day));
      wk.min += t.sec / 60; wk.q += t.q; wk.c += t.c;
      Object.entries(t.by).forEach(([k, [q, c, sec]]) => {
        const s = wk.skills[k] || (wk.skills[k] = { min: 0, q: 0, c: 0 });
        s.min += sec / 60; s.q += q; s.c += c;
      });
      wk.other += Math.max(0, t.sec - Object.values(t.by).reduce((a, b) => a + (b[2] || 0), 0)) / 60;
    }
    out.push(wk);
  }
  return out;
}

/* The skills practised in these weeks, most minutes first (then most answers) */
export function skillsIn(weekList) {
  const tot = {};
  weekList.forEach(w => Object.entries(w.skills).forEach(([k, s]) => {
    const t = tot[k] || (tot[k] = { min: 0, q: 0 });
    t.min += s.min; t.q += s.q;
  }));
  return Object.keys(tot).filter(k => tot[k].min >= 0.5 || tot[k].q > 0).sort((a, b) => tot[b].min - tot[a].min || tot[b].q - tot[a].q);
}

/* Accuracy per week for one skill (null in a week without answers) */
export function accuracySeries(weekList, skill) {
  return weekList.map(w => { const s = w.skills[skill]; return s && s.q ? s.c / s.q : null; });
}

/* Has accuracy moved? The later half of the weeks against the earlier half, each pooled over its answers,
   so one lucky week of three questions does not count as much as a week of fifty. Null until both halves
   have at least `min` answers. */
export function accuracyChange(weekList, skill, min = 10) {
  const half = Math.floor(weekList.length / 2);
  const pool = ws => ws.reduce((a, w) => { const s = w.skills[skill]; return s ? [a[0] + s.q, a[1] + s.c] : a; }, [0, 0]);
  const [q1, c1] = pool(weekList.slice(0, half)), [q2, c2] = pool(weekList.slice(half));
  if (q1 < min || q2 < min) return null;
  return c2 / q2 - c1 / q1;
}

/* Quiz items (ear training, fretboard, reading and the rest) whose next review falls by time t, per skill.
   These are the "due" counts on Today; the planner serves the skills with most due first. */
export function quizDue(skills, t) {
  const out = {};
  Object.entries(skills || {}).forEach(([k, ss]) => {
    const n = Object.values((ss && ss.items) || {}).filter(it => it && it.due && it.due <= t).length;
    if (n) out[k] = n;
  });
  return out;
}

/* The end of the day after t (23:59:59.999 local time) */
export function endOfTomorrow(t) {
  const d = new Date(t); d.setDate(d.getDate() + 1); d.setHours(23, 59, 59, 999);
  return d.getTime();
}

/* Time on each scale, every device added up (state.scaleTime: { device: { 'scale:tonic': { v, p, last } } },
   v = seconds seen in your head, p = seconds played). One entry per scale, most time first:
   { scale, v, p, total, last, keys: [{ tonic, v, p, total }] (most time first) } */
export function scaleTotals(scaleTime) {
  const by = {};
  Object.values(scaleTime || {}).forEach(dev => Object.entries(dev || {}).forEach(([k, r]) => {
    const i = k.lastIndexOf(':'), scale = k.slice(0, i), tonic = +k.slice(i + 1);
    if (!scale || !Number.isInteger(tonic) || !r) return;
    const sc = by[scale] || (by[scale] = { scale, v: 0, p: 0, total: 0, last: 0, keys: {} });
    const kt = sc.keys[tonic] || (sc.keys[tonic] = { tonic, v: 0, p: 0, total: 0 });
    const v = r.v || 0, p = r.p || 0;
    sc.v += v; sc.p += p; sc.total += v + p; kt.v += v; kt.p += p; kt.total += v + p;
    sc.last = Math.max(sc.last, r.last || 0);
  }));
  return Object.values(by).filter(x => x.total > 0)
    .map(x => Object.assign(x, { keys: Object.values(x.keys).filter(k => k.total > 0).sort((a, b) => b.total - a.total || a.tonic - b.tonic) }))
    .sort((a, b) => b.total - a.total);
}
/* One scale in one key (tonic) or in every key (tonic null): { v, p } in seconds */
export function scaleTimeOf(scaleTime, scale, tonic = null) {
  const sc = scaleTotals(scaleTime).find(x => x.scale === scale);
  if (!sc) return { v: 0, p: 0 };
  if (tonic === null) return { v: sc.v, p: sc.p };
  const k = sc.keys.find(x => x.tonic === tonic);
  return k ? { v: k.v, p: k.p } : { v: 0, p: 0 };
}

export default { weekStart, dayTotal, weeks, skillsIn, accuracySeries, accuracyChange, quizDue, endOfTomorrow, scaleTotals, scaleTimeOf };
