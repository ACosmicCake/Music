/* World Woodshed — practice session runner: timer, session bar, time-up chime, finish screen */
import A from '../audio.js';
import E from '../engine.js';
import { h, ui, go, openTool, toast, view, renderTabs, teardown, hooks, bar } from './core.js';
import { BLOCKS, CATS, paramsFor, blockTitle, describe, fmtClock, fmtMin, totalOf } from '../routines.js';
import Cur from '../curriculum.js';
import { openSwap } from './swap.js';
import Mic from '../listen.js';

let ticker = null, lastNow = 0, secAcc = 0, saveAcc = 0, wake = null;
/* Auto-advance never cuts into a phrase: when the countdown ends while the mic hears you playing, or you
   are tapping, it waits until you have paused for this long. */
const PAUSE_MS = 2500;
let lastInput = 0, waitingForPause = false;
['pointerdown', 'keydown'].forEach(t => document.addEventListener(t, () => { lastInput = Date.now(); }, true));
const bars = new Set();
const pill = h('button', { class: 'session-pill', hidden: true, onclick: () => runCurrent() });
document.querySelector('.topbar-inner').insertBefore(pill, document.getElementById('sync'));

export const cur = () => { const s = E.session(); return s ? s.blocks[s.idx] || null : null; };
const inSessionTool = () => !!(ui.runner && ui.runner.opts && ui.runner.opts.session);

export function startSession(src) {
  if (!src.blocks.length) { toast('Add a block first'); return; }
  E.startSession(src);
  ensureTicker();
  runCurrent();
}
export function runCurrent() {
  const s = E.session(); if (!s) { go('routine'); return; }
  const b = s.blocks[s.idx];
  if (!b) { finishScreen(); return; }
  if (s.paused) { s.paused = false; E.sessionChanged(); }
  ensureTicker();
  // resolve 'auto' choices once, so coming back to a block opens the same exercise or tune
  if (!b.resolved) { b.params = paramsFor(b, new Set(s.blocks.map(x => x.cur).filter(Boolean))); b.resolved = true; E.touchSession(); }
  openTool(BLOCKS[b.type].tool, { session: true, params: b.params, returnTab: 'routine' });
}
export function jump(i) {
  const s = E.session(); if (!s) return;
  s.idx = Math.max(0, Math.min(s.blocks.length - 1, i)); s.autoAt = null;
  E.sessionChanged(); runCurrent();
}
/* ---------- grading the block's item for the smart plan ---------- */
// Tools report what they measured (a test score, notes the mic heard, Clean presses) for the current item
hooks.signal = (curId, data) => {
  const b = cur();
  if (b && b.cur === curId) { b.signals = Object.assign(b.signals || {}, data); E.touchSession(); }
};
function autoGrade(b) {
  const g = b.signals || {};
  if (typeof g.score === 'number') return Cur.gradeFromScore(g.score);
  if (typeof g.micAcc === 'number' && (g.micN || 0) >= 8) return Cur.gradeFromScore(g.micAcc);
  if (g.clean || g.notClean) return g.notClean >= 2 && g.notClean > (g.clean || 0) ? 'hard' : (g.clean || 0) >= 2 ? 'easy' : g.clean ? 'good' : 'hard';
  return null;
}
function applyGrade(b, grade) {
  const g = b.signals || {}, info = {};
  if (b.type === 'scalewarm' && b.params) {
    const base = g.bpm || b.params.bpm || 66;
    info.bpm = g.clean || g.notClean ? base : base + ({ easy: 4, good: 2, hard: -4, again: -8 }[grade] || 0);
    info.key = b.params.tonic; info.pattern = b.params.pattern;
  }
  Cur.review(b.cur, grade, info);
  b.rated = grade; b.askRating = false;
}
export function rate(grade) {
  const b = cur(); if (!b) return;
  if (grade) applyGrade(b, grade); else { b.rated = 'skipped'; b.askRating = false; }
  next(false);
}

export function next(skip) {
  const s = E.session(); if (!s) return;
  const b = s.blocks[s.idx];
  // finishing a block that teaches an item: grade it from what was measured, or ask
  if (b && !skip && b.cur && !b.rated && (b.elapsed || 0) > 20000) {
    const g = autoGrade(b);
    if (g) { applyGrade(b, g); toast(Cur.describeItem(b.cur) + ': logged as ' + Cur.GRADE_LABEL[g].toLowerCase()); }
    else { b.askRating = true; s.autoAt = null; E.sessionChanged(); render(); return; }
  }
  if (b) { if (skip) b.skipped = true; else b.done = true; }
  s.autoAt = null;
  // move to the next block that isn't finished yet, else finish
  let i = s.idx + 1;
  while (i < s.blocks.length && s.blocks[i].done) i++;
  if (i >= s.blocks.length) { const open = s.blocks.findIndex(x => !x.done && !x.skipped); i = open >= 0 && open !== s.idx ? open : s.blocks.length; }
  s.idx = i;
  E.sessionChanged();
  if (i >= s.blocks.length) finishScreen(); else runCurrent();
}
/* Replace the current block: the time already spent stays on the old one, the rest goes to the new one */
export function swapCurrent(nb) {
  const s = E.session(); if (!s) return;
  const b = s.blocks[s.idx]; if (!b) return;
  const spentMin = (b.elapsed || 0) / 60000;
  Object.assign(nb, { elapsed: 0, done: false, skipped: false, resolved: false });
  nb.minutes = Math.max(2, Math.round(b.minutes - spentMin));
  if (spentMin < 1) s.blocks[s.idx] = nb;
  else { b.skipped = true; b.swapped = true; b.minutes = Math.max(1, Math.round(spentMin)); s.blocks.splice(s.idx + 1, 0, nb); s.idx++; }
  s.autoAt = null;
  E.sessionChanged();
  runCurrent();
}
export function swapPrompt() {
  const s = E.session(), b = cur(); if (!s || !b) return;
  openSwap({ block: b, used: s.blocks.map(x => x.cur).filter(Boolean), onPick: swapCurrent });
}
export function togglePause() {
  const s = E.session(); if (!s) return;
  s.paused = !s.paused; s.autoAt = null;
  E.sessionChanged(); updateWake(); render();
}
export function addMinutes(n) {
  const b = cur(); if (!b) return;
  b.minutes = Math.max(1, b.minutes + n);
  if (b.elapsed < b.minutes * 60000) b.timeUp = false;
  const s = E.session(); s.autoAt = null;
  E.sessionChanged(); render();
}
export function stay() { const s = E.session(); if (s) { s.autoAt = null; render(); } }

/* ---------- ticker ---------- */
function ensureTicker() {
  if (ticker || !E.session()) return;
  lastNow = Date.now();
  ticker = setInterval(tick, 500);
  updateWake();
}
function tick() {
  const s = E.session();
  if (!s) { clearInterval(ticker); ticker = null; updateWake(); render(); return; }
  const now = Date.now();
  const dt = Math.min(now - lastNow, 15 * 60000); // a sleeping device shouldn't add hours
  lastNow = now;
  const b = s.blocks[s.idx];
  if (!s.paused && b) {
    b.elapsed = (b.elapsed || 0) + dt;
    secAcc += dt; saveAcc += dt;
    if (secAcc >= 5000) { E.addTime(Math.round(secAcc / 1000), BLOCKS[b.type].skill); secAcc = 0; }
    if (saveAcc >= 10000) { E.touchSession(); saveAcc = 0; }
    if (!b.timeUp && b.elapsed >= b.minutes * 60000) timeUp(s, b);
  }
  if (s.autoAt && now >= s.autoAt) {
    waitingForPause = now - Math.max(Mic.lastHeard, lastInput) < PAUSE_MS;
    if (waitingForPause) s.autoAt = now + 500;
    else { s.autoAt = null; if (inSessionTool()) next(); }
  }
  render();
}
function timeUp(s, b) {
  b.timeUp = true;
  try {
    A.ensure();
    const t = A.now() + 0.05;
    [76, 81, 88].forEach((m, i) => A.note(m, t + i * 0.16, 0.5, 1.4));
  } catch (e) { /* audio unavailable */ }
  try { if (navigator.vibrate) navigator.vibrate([120, 80, 120]); } catch (e) { /* ignore */ }
  const nxt = s.blocks[s.idx + 1];
  if (s.autoAdvance && inSessionTool() && nxt) { s.autoAt = Date.now() + 10000; waitingForPause = false; }
  E.touchSession();
}

/* Keep the screen on while a session runs (you're holding a guitar, not the phone) */
async function updateWake() {
  const want = !!(E.session() && !E.session().paused && document.visibilityState === 'visible');
  try {
    if (want && !wake && navigator.wakeLock) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); }
    else if (!want && wake) { await wake.release(); wake = null; }
  } catch (e) { wake = null; }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { lastNow = lastNow || Date.now(); } updateWake(); });

/* ---------- session bar (top of each tool during a session) ---------- */
function sessionBar() {
  const el = h('div', { class: 'sessionbar' });
  bars.add(el);
  paint(el);
  return el;
}
hooks.sessionBar = sessionBar;
hooks.afterNav = () => render();

function paint(el) {
  const s = E.session(), b = cur();
  if (!s || !b) { el.hidden = true; return; }
  el.hidden = false;
  const def = BLOCKS[b.type];
  el.className = 'sessionbar cat-' + def.cat + (s.paused ? ' paused' : '') + (b.timeUp ? ' over' : '');
  const left = b.minutes * 60 - b.elapsed / 1000;
  const sig = [s.idx, s.paused, b.timeUp, !!s.autoAt, b.minutes, !!b.askRating].join('|');
  if (el.dataset.sig !== sig) {
    el.dataset.sig = sig;
    el.innerHTML = '';
    const nxt = s.blocks[s.idx + 1];
    el.append(
      h('div', { class: 'sb-top' },
        h('span', { class: 'sb-dot', 'aria-hidden': 'true' }),
        h('div', { class: 'sb-what' },
          h('span', { class: 'eyebrow', text: (s.paused ? 'Paused · ' : '') + 'Block ' + (s.idx + 1) + ' of ' + s.blocks.length + ' · ' + s.name }),
          h('b', { text: blockTitle(b) }),
          h('span', { class: 'small muted', text: describe(b) })),
        h('div', { class: 'sb-clock mono', role: 'timer', 'aria-label': 'Time left in this block' })),
      h('div', { class: 'sb-prog' }, h('i')),
      b.reason && b.smart !== false && b.reason !== describe(b) ? h('p', { class: 'small sb-why', text: b.reason }) : '',
      b.askRating ? h('div', { class: 'sb-rate' },
        h('b', { text: 'How did ' + Cur.describeItem(b.cur) + ' go?' }),
        h('span', { class: 'small muted', text: 'This sets when it comes back.' }),
        h('div', { class: 'row' }, ['again', 'hard', 'good', 'easy'].map(g => h('button', { class: 'btn small rate-' + g, onclick: () => rate(g) }, Cur.GRADE_LABEL[g])),
          h('button', { class: 'btn small ghost', onclick: () => rate(null) }, 'Skip'))) : '',
      h('div', { class: 'sb-ctrl' },
        h('button', { class: 'btn small', onclick: togglePause, 'aria-label': s.paused ? 'Resume' : 'Pause' }, s.paused ? '▶ Resume' : '❚❚ Pause'),
        h('button', { class: 'btn small ghost', onclick: () => addMinutes(1) }, '+1 min'),
        h('button', { class: 'btn small ghost', onclick: swapPrompt, title: 'Swap this block for something else' }, '⇄ Swap'),
        h('button', { class: 'btn small ghost', onclick: () => go('routine') }, 'Plan'),
        h('span', { class: 'grow' }),
        h('button', { class: 'btn small ghost', onclick: () => next(true) }, 'Skip'),
        h('button', { class: 'btn small brass', onclick: () => next(false) }, nxt ? 'Done · next →' : 'Finish ✓')),
      b.timeUp ? h('div', { class: 'sb-up', role: 'status' },
        h('b', { text: 'Time\'s up.' }),
        h('span', { class: 'small sb-auto' }),
        h('span', { class: 'grow' }),
        s.autoAt ? h('button', { class: 'btn small', onclick: stay }, 'Stay here') : h('button', { class: 'btn small', onclick: () => addMinutes(5) }, '+5 min')) : '');
  }
  const clock = el.querySelector('.sb-clock');
  clock.textContent = left >= 0 ? fmtClock(left) : '+' + fmtClock(-left);
  el.querySelector('.sb-prog i').style.width = Math.min(100, 100 * b.elapsed / (b.minutes * 60000)) + '%';
  const auto = el.querySelector('.sb-auto');
  if (auto) {
    const nxt = s.blocks[s.idx + 1];
    auto.textContent = s.autoAt ? 'Next: ' + blockTitle(nxt) + (waitingForPause ? ' when you pause' : ' in ' + Math.max(0, Math.ceil((s.autoAt - Date.now()) / 1000)) + ' s') : nxt ? 'Keep going, or move on when ready.' : 'Last block. Finish when ready.';
  }
}
function render() {
  bars.forEach(el => { if (!el.isConnected) bars.delete(el); else paint(el); });
  const s = E.session(), b = cur();
  pill.hidden = !s || !b || inSessionTool();
  if (!pill.hidden) {
    const left = b.minutes * 60 - b.elapsed / 1000;
    pill.className = 'session-pill cat-' + BLOCKS[b.type].cat + (s.paused ? ' paused' : '');
    pill.textContent = (s.paused ? '❚❚ ' : '● ') + blockTitle(b) + ' · ' + (left >= 0 ? fmtClock(left) : '+' + fmtClock(-left));
    pill.title = 'Back to your session';
  }
  if (typeof hooks.onSessionTick === 'function') hooks.onSessionTick();
}

/* ---------- finish ---------- */
export function finishScreen() {
  const s = E.session(); if (!s) { go('routine'); return; }
  teardown(); ui.runner = { id: 'session-end', opts: {} }; ui.tab = 'routine'; renderTabs();
  view.innerHTML = ''; window.scrollTo(0, 0);
  const sec = s.blocks.reduce((a, b) => a + (b.elapsed || 0), 0) / 1000;
  const done = s.blocks.filter(b => b.done).length;
  const note = h('textarea', { rows: 4, id: 'journal-note', placeholder: 'What went well? What to fix next time? Tempos reached, songs learned…' });
  view.append(
    h('div', { class: 'hero done-hero' },
      h('span', { class: 'eyebrow', text: 'Session complete' }),
      h('h1', { text: 'Nice work.' }),
      h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('b', { class: 'mono', text: fmtMin(sec / 60) }), h('span', { text: 'practised' })),
        h('div', { class: 'stat' }, h('b', { class: 'mono', text: done + '/' + s.blocks.length }), h('span', { text: 'blocks done' })),
        h('div', { class: 'stat' }, h('b', { class: 'mono', text: E.streak() }), h('span', { text: 'day streak' })),
        h('div', { class: 'stat' }, h('b', { class: 'mono', text: fmtMin(totalOf(s.blocks)) }), h('span', { text: 'planned' })))),
    h('div', { class: 'card' },
      h('h3', { text: 'What you did' }),
      h('div', { class: 'stack' }, s.blocks.map(b => h('div', { class: 'endrow cat-' + BLOCKS[b.type].cat },
        h('span', { class: 'dot' }), h('span', { text: blockTitle(b) }),
        h('span', { class: 'mono small muted', text: b.done ? fmtClock(b.elapsed / 1000) : b.skipped ? 'skipped' : 'not done' }))))),
    h('div', { class: 'card' },
      h('label', { class: 'stack', for: 'journal-note' }, h('h3', { text: 'Practice journal' }), h('span', { class: 'small muted', text: 'A line or two for future you. It shows on the Today page.' })), note,
      h('div', { class: 'row' },
        h('button', { class: 'btn brass', onclick: () => { Cur.logSession(s, sec / 60); E.endSession(note.value); updateWake(); toast('Session saved'); go('today'); } }, 'Save & finish'),
        h('button', { class: 'btn ghost', onclick: () => { const st = E.session(); const i = st.blocks.findIndex(b => !b.done); jump(i >= 0 ? i : 0); } }, 'Back to the session'))));
}

export function discardSession() {
  const s = E.session();
  if (s) { const sec = s.blocks.reduce((a, b) => a + (b.elapsed || 0), 0) / 1000; if (sec > 120) Cur.logSession(s, sec / 60); }
  E.endSession(''); updateWake(); render();
}

/* After a reload (call after E.init): a session the app was closed in the middle of comes back paused, so it
   doesn't count time or take over until you resume it; one left untouched for hours is closed into the journal. */
const IDLE_PAUSE = 15 * 60000, IDLE_END = 3 * 3600000;
export function bootSession() {
  const s = E.state.session;
  if (s) {
    const idle = Date.now() - (s.lastTick || s.started || 0);
    if (idle > IDLE_END) discardSession();
    else if (idle > IDLE_PAUSE && !s.paused) { s.paused = true; s.autoAt = null; E.sessionChanged(); }
  }
  if (E.session()) ensureTicker();
  render();
}
E.onChange(() => { if (E.session()) ensureTicker(); render(); });
export { render as renderSession };
