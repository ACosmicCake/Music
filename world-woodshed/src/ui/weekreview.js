/* The weekly review card (src/weekreview.js does the sums): on Today from Monday until you close it, and
   always at the top of Statistics. */
import E from '../engine.js';
import Cur from '../curriculum.js';
import { h, toast } from './core.js';
import { fmtMin } from '../routines.js';
import { weekReview, pct } from '../weekreview.js';
import { skillName } from './stats.js';

export function reviewNow(now = Date.now()) {
  const p = Cur.prefs() || {};
  return weekReview(now, { hdev: E.state.hdev, history: E.state.history, goalLog: p.goalLog, goal: p.goal, due: Cur.dueAt(now), names: skillName });
}

const dateOf = d => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

/* o.today: the Today version, with a button to put it away until next week */
export function weekReviewCard(o = {}) {
  const r = reviewNow();
  if (!r) return null;
  if (o.today && E.state.settings.reviewSeen === r.week) return null;
  const end = new Date(r.start); end.setDate(end.getDate() + 6);
  const card = h('section', { class: 'card week-review', 'aria-label': 'Last week' });
  const ch = r.change === null ? '' : r.change >= 0.05 ? ', up ' + pct(r.change) + ' on the week before' : r.change <= -0.05 ? ', down ' + pct(-r.change) + ' on the week before' : ', about the same as the week before';
  card.append(
    h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Your week · ' + dateOf(r.start) + ' to ' + dateOf(end) }),
      o.today ? h('button', { class: 'btn small ghost', onclick: () => { E.setSetting('reviewSeen', r.week); toast('See it again any time in Statistics'); card.remove(); } }, 'Got it') : null),
    h('h2', { text: fmtMin(r.min) + ' of practice' + ch + '.' }),
    h('div', { class: 'wr-days', role: 'img', 'aria-label': r.practised + ' days practised, goal met on ' + r.goalMet },
      r.days.map(d => h('span', { class: 'wr-day' + (d.min >= d.goal && d.min > 0 ? ' met' : d.min >= 1 ? ' some' : ''), title: d.key + ': ' + fmtMin(d.min) }))),
    h('p', { class: 'small muted', text: 'Practised on ' + r.practised + ' of 7 days; your daily goal met on ' + r.goalMet + '.' }));
  const list = [];
  if (r.most.length) list.push(h('li', { text: 'Most time: ' + r.most.map(s => s.name + ' (' + fmtMin(s.min) + ')').join(', ') + '.' }));
  r.up.forEach(s => list.push(h('li', { class: 'wr-up', text: s.name + ' got more accurate: ' + pct(s.acc - s.change) + ' → ' + pct(s.acc) + '.' })));
  r.down.forEach(s => list.push(h('li', { class: 'wr-down', text: s.name + ' slipped: ' + pct(s.acc - s.change) + ' → ' + pct(s.acc) + '.' })));
  if (r.dueCount) list.push(h('li', { text: r.dueCount + ' item' + (r.dueCount > 1 ? 's' : '') + ' due for review now' + (r.due.length ? ', most overdue: ' + r.due.map(x => x.name).join(', ') : '') + '.' }));
  if (list.length) card.append(h('ul', { class: 'list small' }, list));
  card.append(h('div', { class: 'wr-focus' }, h('b', { text: 'This week: ' }), h('span', { text: r.focus.text })));
  return card;
}
