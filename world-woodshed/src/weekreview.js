/* The weekly review (plain functions, test/weekreview.test.js): last week, Monday to Sunday, against the one
   before. Minutes, days practised and days the daily goal was met, which skills got more accurate and which
   slipped, and one thing to focus on this week. Nothing here reads the clock or the engine: the caller passes
   the state's parts and "now". */
import { weeks } from './stats.js';
import { goalOn } from './goals.js';

const keyOf = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const MIN_ANSWERS = 10; // fewer answers than this in a week say little about accuracy
const MOVE = 0.05;      // accuracy has moved when it changed by 5 points or more

/* o: { hdev, history, goalLog, goal (today's, for days before the log), due: [{ name, kindName }] most overdue
   first, names: { skill: name } or a function of the skill }. Returns null when last week had no practice and the week before none either. */
export function weekReview(now, o = {}) {
  const [before, last] = weeks(o.hdev || {}, 3, now);
  if (last.min < 1 && last.q === 0 && before.min < 1) return null;
  const days = [];
  for (let d = 0; d < 7; d++) {
    const day = new Date(last.start); day.setDate(last.start.getDate() + d);
    const key = keyOf(day), h = (o.history || {})[key], min = h ? (h.sec || 0) / 60 : 0;
    days.push({ key, min, goal: goalOn(o.goalLog, key, o.goal || 30) });
  }
  const practised = days.filter(d => d.min >= 1).length;
  const goalMet = days.filter(d => d.min >= d.goal && d.min > 0).length;
  const name = k => (typeof o.names === 'function' ? o.names(k) : (o.names && o.names[k]) || k);
  const acc = s => (s && s.q >= MIN_ANSWERS ? s.c / s.q : null);
  const skills = Object.keys(last.skills).map(k => {
    const now_ = acc(last.skills[k]), then = acc(before.skills[k]);
    return { skill: k, name: name(k), min: last.skills[k].min, q: last.skills[k].q, acc: now_, change: now_ !== null && then !== null ? now_ - then : null };
  });
  const most = skills.filter(s => s.min >= 1 || s.q > 0).sort((a, b) => b.min - a.min || b.q - a.q).slice(0, 3);
  const up = skills.filter(s => s.change !== null && s.change >= MOVE).sort((a, b) => b.change - a.change).slice(0, 3);
  const down = skills.filter(s => s.change !== null && s.change <= -MOVE).sort((a, b) => a.change - b.change);
  const due = o.due || [];
  let focus;
  if (down.length) focus = { kind: 'slipped', skill: down[0].skill, text: down[0].name + ' slipped from ' + pct(down[0].acc - down[0].change) + ' to ' + pct(down[0].acc) + ' right. Give it a block early in a session this week, while you are fresh.' };
  else if (due.length >= 5) focus = { kind: 'due', text: due.length + ' things are due for review, starting with ' + due[0].name + '. Let the smart plan clear them before it adds new material.' };
  else if (practised && practised < 4) focus = { kind: 'days', text: 'You practised on ' + practised + ' day' + (practised > 1 ? 's' : '') + '. Short sessions on more days stick better than one long one: try ten minutes on the days you would skip.' };
  else if (most.length && most[0].min > last.min * 0.6) focus = { kind: 'narrow', skill: most[0].skill, text: 'Most of the week went on ' + most[0].name + '. Mixing in other kinds of practice helps each one stick.' };
  else focus = { kind: 'keep', text: 'A good spread of practice. Keep the same rhythm this week.' };
  return {
    week: last.key, start: last.start,
    min: last.min, minBefore: before.min, change: before.min >= 1 ? (last.min - before.min) / before.min : null,
    practised, goalMet, days, most, up, down: down.slice(0, 2), due: due.slice(0, 3), dueCount: due.length, focus
  };
}
export const pct = x => Math.round(x * 100) + '%';
