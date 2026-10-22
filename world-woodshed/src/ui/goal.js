/* World Woodshed — the daily goal and the streaks on Today, and their settings (also in Your learning plan).
   The rules live in src/goals.js; the goal, its target, its log and the streak rule are learning preferences
   (state.cur.prefs), so they sync with the rest. */
import E from '../engine.js';
import Cur from '../curriculum.js';
import Goals from '../goals.js';
import { h, toast, bar } from './core.js';
import { fmtMin } from '../routines.js';

const GOALS = [15, 30, 45, 60, 90, 120, 180, 240, 300, 360];
const TARGETS = [0, 60, 120, 180, 240, 300, 360];
const RULES = [['any', 'Any practice'], [10, '10 min'], [20, '20 min'], [30, '30 min'], ['goal', 'The goal']];
const DEFAULT_TARGET = 240; // growing toward four hours a day unless the player picks another target or Off
const target = p => (p.goalTarget === undefined ? DEFAULT_TARGET : p.goalTarget);
const short = m => fmtMin(m).replace(' min', 'm').replace(' h', 'h');
const days = n => n + ' day' + (n === 1 ? '' : 's');

function setGoal(m) {
  const k = E.dayKey();
  Cur.setPrefs({ goal: m, goalSince: k, goalLog: Goals.logGoal(Cur.prefs().goalLog, k, m) });
}

/* Grow the goal when it is time (drawn on Today); the first look starts the week at this goal */
export function applyRamp() {
  const p = Cur.prefs(), t = target(p), goal = p.goal || 30;
  if (!t || goal >= t) return;
  if (!p.goalSince) { Cur.setPrefs({ goalSince: E.dayKey(), goalLog: Goals.logGoal(p.goalLog, E.dayKey(), goal) }); return; }
  const r = Goals.ramp({ goal, target: t, since: p.goalSince, log: p.goalLog }, E.state.history, Date.now());
  if (r && r.raise) {
    setGoal(r.next);
    toast('Daily goal up to ' + fmtMin(r.next) + '. You met ' + fmtMin(goal) + ' on ' + r.met + ' of the last 7 days.');
  }
}

/* What counts toward the streak, in words */
function ruleText(rule, goal) {
  return rule === 'goal' ? fmtMin(goal) : typeof rule === 'number' && rule > 0 ? rule + ' min' : 'a minute or more';
}

/* Today: minutes against the goal, the streaks, and where the goal is heading */
export function goalCard() {
  const card = h('div', { class: 'card goal-card' });
  const p = Cur.prefs(), st = E.streaks(), goal = st.goal, done = st.todayMin;
  const left = Math.max(0, Math.ceil(goal - done)), t = target(p);
  card.append(
    h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Today' }), h('span', { class: 'mono small', text: fmtMin(done) + ' / ' + fmtMin(goal) })),
    bar(100 * done / goal, 'brass'),
    h('p', { class: 'small goal-left', text: left ? fmtMin(left) + ' to go today.' : 'Goal met for today. Anything more is a bonus.' }),
    h('div', { class: 'goal-streaks' },
      h('div', {}, h('b', { class: 'mono', text: st.current }), h('span', { text: 'day streak' + (st.best > st.current ? ' · best ' + st.best : '') })),
      h('div', {}, h('b', { class: 'mono', text: st.goalCurrent }), h('span', { text: 'goal days in a row' + (st.goalBest > st.goalCurrent ? ' · best ' + st.goalBest : '') }))));
  if (st.atRisk) card.append(h('p', { class: 'small callout', text: 'Practise ' + ruleText(p.streakRule, goal) + ' today to keep your ' + days(st.current) + ' going.' }));
  const r = Goals.ramp({ goal, target: t, since: p.goalSince, log: p.goalLog }, E.state.history, Date.now());
  if (r) card.append(h('p', { class: 'small muted', text: 'Growing toward ' + fmtMin(t) + ' a day. Next step ' + fmtMin(r.next) + (r.wait
    ? ' after a week at this goal (' + days(r.wait) + ' left), if you meet it on ' + Goals.RAMP_MET + ' of the 7.'
    : ' as soon as you meet the goal on ' + Goals.RAMP_MET + ' of the last 7 days (now ' + r.met + ').') }));
  else if (t && goal >= t) card.append(h('p', { class: 'small muted', text: 'Your goal has reached its target of ' + fmtMin(t) + ' a day.' }));
  if (goal >= 120) card.append(h('p', { class: 'small muted', text: 'Long days go best in several sessions of 45 to 90 minutes with breaks between them. Stop if your hands or wrists hurt.' }));
  card.append(h('details', { class: 'goal-more' }, h('summary', { class: 'small', text: 'Change the goal and the streak' }), goalSettings()));
  return card;
}

/* The goal, its target and the streak rule */
export function goalSettings(opts = {}) {
  const wrap = h('div', { class: 'stack goal-settings' });
  function draw() {
    wrap.innerHTML = '';
    const p = Cur.prefs(), goal = p.goal || 30, t = target(p), rule = p.streakRule === undefined ? 'any' : p.streakRule;
    const done = () => { draw(); if (opts.onChange) opts.onChange(); };
    wrap.append(
      h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Daily goal' }),
        h('div', { class: 'chips presets' }, GOALS.map(m => h('button', { class: 'chip', 'aria-pressed': goal === m ? 'true' : 'false', onclick: () => { setGoal(m); done(); } }, short(m)))),
        h('span', { class: 'small muted', text: 'All your practice counts, on every device. Split it into as many sessions as your day allows; several spread out are as good as one long one, often better.' })),
      h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Grow the goal toward' }),
        h('div', { class: 'chips presets' }, TARGETS.map(m => h('button', { class: 'chip', 'aria-pressed': t === m ? 'true' : 'false', onclick: () => { Cur.setPrefs({ goalTarget: m, goalSince: p.goalSince || E.dayKey() }); done(); } }, m ? short(m) : 'Off'))),
        h('span', { class: 'small muted', text: 'Each week you meet the goal on ' + Goals.RAMP_MET + ' of 7 days, it goes up about 10% (at least 10 minutes) until it reaches this. It never goes down by itself.' })),
      h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'A day counts toward the streak with' }),
        h('div', { class: 'chips presets' }, RULES.map(([v, label]) => h('button', { class: 'chip', 'aria-pressed': rule === v ? 'true' : 'false', onclick: () => { Cur.setPrefs({ streakRule: v }); done(); } }, label)))));
  }
  draw();
  return wrap;
}
