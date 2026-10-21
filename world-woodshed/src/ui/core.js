/* World Woodshed — UI core: DOM helpers, tabs and routing, tool runner, quiz, fretboard */
import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';

export const PAGES = {};
// filled in by other modules (session.js) to avoid import cycles
export const hooks = { sessionBar: null, onSessionTick: null, afterNav: null, signal: null };

export const view = document.getElementById('view');
const tabsEl = document.getElementById('tabs');
export const syncEl = document.getElementById('sync');

/* ---------- tiny DOM helpers ---------- */
export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  kids.flat(Infinity).forEach(c => { if (c === null || c === undefined || c === false) return; el.append(c.nodeType ? c : document.createTextNode(String(c))); });
  return el;
}
const svgNS = 'http://www.w3.org/2000/svg';
export function s(tag, attrs, ...kids) {
  const el = document.createElementNS(svgNS, tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) { if (v !== null && v !== undefined) el.setAttribute(k, v); }
  kids.flat().forEach(c => { if (c !== null && c !== undefined) el.append(c.nodeType ? c : document.createTextNode(String(c))); });
  return el;
}
export const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const choice = arr => arr[Math.floor(Math.random() * arr.length)];
export const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const pc = m => ((Math.round(m) % 12) + 12) % 12;
export const noteName = m => D.NOTE_NAMES[pc(m)];
export function toast(msg) {
  const t = h('div', { class: 'toast', role: 'status', text: msg });
  document.body.append(t); setTimeout(() => t.remove(), 2200);
}
/* ---------- when something breaks ----------
   A failure while drawing a page or a tool should never leave a blank screen with no way out: it is logged,
   said briefly, and the view offers the way back (or a reload, when Today itself failed). */
export function failure(el, e, what) {
  console.error(e);
  toast(what + ' could not open');
  const home = ui.tab === 'today' && !ui.runner
    ? h('button', { class: 'btn brass', onclick: () => location.reload() }, 'Reload the app')
    : h('button', { class: 'btn brass', onclick: () => go('today') }, 'Back to Today');
  const card = h('div', { class: 'card', role: 'alert' },
    h('h2', { text: 'Something went wrong' }),
    h('p', { class: 'small muted', text: what + ' hit an error and could not be shown' + (e && e.message ? ' (' + e.message + ').' : '.') }),
    h('div', { class: 'row' }, home));
  el.append(card);
  home.focus();
}
/* Errors nothing else caught (an event handler, a timer, a promise): one short note, at most every few
   seconds, so a repeating error can't flood the screen. The error still reaches the console as usual. */
export function watchErrors() {
  let last = 0;
  const note = msg => {
    const now = Date.now();
    if (now - last < 8000) return;
    last = now;
    toast('Something went wrong' + (msg ? ': ' + String(msg).slice(0, 80) : '') + '. If a screen looks stuck, go back to Today.');
  };
  window.addEventListener('error', e => {
    if (/ResizeObserver loop/.test(e.message || '')) return; // harmless browser notice, not an app error
    note(e.error && e.error.message || e.message);
  });
  window.addEventListener('unhandledrejection', e => note(e.reason && e.reason.message || e.reason));
}
export function bar(pct, cls) { return h('div', { class: 'bar ' + (cls || '') }, h('i', { style: { width: Math.max(0, Math.min(100, pct)) + '%' } })); }
export function regionName(id) { const r = D.REGIONS.find(x => x.id === id); return r ? r.name : id; }

/* ---------- tabs & routing ---------- */
export const ICONS = {
  today: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg>',
  routine: '<svg viewBox="0 0 24 24"><path d="M4 6h10M4 12h16M4 18h7"/><circle cx="18" cy="6" r="2"/><circle cx="15" cy="18" r="2"/></svg>',
  train: '<svg viewBox="0 0 24 24"><path d="M14 4l6 6-9 9a3 3 0 0 1-4-4l7-11z"/><path d="M4 20l3-3"/><path d="M16 6l2 2"/></svg>',
  learn: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
  ear: '<svg viewBox="0 0 24 24"><path d="M7 15c0-6 2-10 6-10s5 3 5 6-3 4-3 6-1 4-3 4-2-1-2-2"/><path d="M11 11a2 2 0 1 1 4 0"/></svg>',
  rhythm: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="8" rx="8" ry="3"/><path d="M4 8v8c0 1.7 3.6 3 8 3s8-1.3 8-3V8"/><path d="M15 3l3-1M9 3L6 2"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M14 4l6 6-9 9a3 3 0 0 1-4-4l7-11z"/><path d="M4 20l3-3"/><path d="M16 6l2 2"/></svg>'
};
export const TABS = [['today', 'Today'], ['routine', 'Routine'], ['train', 'Train'], ['learn', 'Learn']];
// old tab names still work in links: #ear opens Train on its Ear section, #atlas opens Learn
export const TAB_ALIASES = { ear: ['train', 'ear'], rhythm: ['train', 'rhythm'], play: ['train', 'play'], atlas: ['learn', 'styles'] };
export const ui = { tab: 'today', cleanup: null, runner: null, plan: null, section: {} };

/* Compact layout for small phones (e.g. 3-inch screens): automatic below 380 x 640 CSS px, or chosen in
   Train → Display. Text size is separate. Both are per device. */
export function isCompact() { return document.documentElement.classList.contains('compact'); }
export function applyDisplay() {
  const st = E.state.settings || {}, mode = st.display || 'auto';
  const small = window.innerWidth <= 380 || window.innerHeight <= 640;
  document.documentElement.classList.toggle('compact', mode === 'compact' || (mode === 'auto' && small));
  document.documentElement.dataset.text = st.textSize || 'm';
}
export function renderTabs() {
  document.body.classList.toggle('in-tool', !!ui.runner);
  tabsEl.innerHTML = '';
  TABS.forEach(([id, label]) => {
    const b = h('button', { class: 'tab', 'aria-current': ui.tab === id && !ui.runner ? 'page' : null, onclick: () => go(id) });
    b.innerHTML = ICONS[id];
    b.append(h('span', { text: label }));
    tabsEl.append(b);
  });
}
export function teardown() {
  if (ui.cleanup) { try { ui.cleanup(); } catch (e) { console.error(e); } }
  ui.cleanup = null;
  A.stopAll();
}
/* After a navigation, move keyboard and screen-reader focus to the new view's heading (without scrolling),
   so the next Tab starts in the new content instead of on the button that was just removed. */
export function focusView() {
  const hd = view.querySelector('h1') || view.querySelector('h2');
  if (!hd) return;
  if (!hd.hasAttribute('tabindex')) hd.setAttribute('tabindex', '-1');
  hd.focus({ preventScroll: true });
}
/* Escape leaves a tool or a sub-page, like its back button; it leaves open sheets and dialogs to close
   themselves, and never fires while typing in a field. */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || e.defaultPrevented || !ui.runner) return;
  if (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
  if (document.querySelector('[role="dialog"]')) return;
  const back = view.querySelector('.rh-back');
  if (back) back.click(); else go(ui.tab || 'today');
});
export function go(tab, section) {
  if (TAB_ALIASES[tab]) { section = TAB_ALIASES[tab][1]; tab = TAB_ALIASES[tab][0]; }
  if (section) ui.section[tab] = section;
  teardown();
  ui.tab = tab; ui.runner = null;
  try { history.replaceState(null, '', '#' + tab); } catch (e) { /* ignore */ }
  renderTabs();
  view.innerHTML = '';
  window.scrollTo(0, 0);
  try { PAGES[tab](); focusView(); } catch (e) { view.innerHTML = ''; failure(view, e, (TABS.find(t => t[0] === tab) || [, 'This page'])[1]); }
  if (hooks.afterNav) hooks.afterNav();
}
E.onChange(() => {
  syncEl.textContent = E.storageNote();
  if (!ui.runner && ui.tab === 'today') {
    const y = window.scrollY; view.innerHTML = '';
    try { PAGES.today(); } catch (e) { view.innerHTML = ''; failure(view, e, 'Today'); }
    window.scrollTo(0, y);
  }
});

/* ---------- tool registry ---------- */
export const TOOLS = {};
export function tool(id, def) { TOOLS[id] = Object.assign({ id }, def); }

/* Tool runner: header, block progress, activity time tracking */
export function openTool(id, opts = {}) {
  teardown();
  const t = TOOLS[id];
  ui.runner = { id, opts };
  renderTabs();
  view.innerHTML = '';
  window.scrollTo(0, 0);
  const block = opts.block || null;
  // back, eyebrow, title, description; the compact layout puts back, title and an ⓘ (for the description) on one row
  const head = h('div', { class: 'runner-head' });
  const backLabel = opts.session ? 'Plan' : opts.block ? 'Routine' : 'Back';
  const backBtn = h('button', { class: 'btn ghost small rh-back', 'aria-label': backLabel, onclick: () => go(opts.returnTab || t.tab || 'today') }, '← ', h('span', { class: 'rh-lbl', text: backLabel }));
  const desc = t.desc && !block && !opts.session ? h('p', { class: 'muted rh-desc', text: t.desc }) : null;
  const info = desc ? h('button', { class: 'btn ghost small rh-info', 'aria-label': 'About this tool', 'aria-expanded': 'false', onclick: () => { const open = head.classList.toggle('desc-open'); info.setAttribute('aria-expanded', String(open)); } }, 'ⓘ') : null;
  head.append(backBtn, h('span', { class: 'eyebrow rh-eyebrow', text: t.eyebrow || '' }), info || '', h('h1', { class: 'rh-title', text: t.title }));
  if (opts.session && hooks.sessionBar) head.append(hooks.sessionBar());
  if (desc) head.append(desc);
  const blockBar = h('div', { class: 'blockbar', hidden: !block });
  head.append(blockBar);
  const body = h('div', { class: 'section' });
  view.append(head, body);

  let lastAct = Date.now(), active = false, finished = false;
  const markAct = () => { lastAct = Date.now(); };
  document.addEventListener('pointerdown', markAct, true);
  document.addEventListener('keydown', markAct, true);
  const unitIsTime = block && !block.questions;
  function renderBlockBar() {
    if (!block) return;
    blockBar.innerHTML = '';
    const target = unitIsTime ? block.minutes * 60 : block.questions;
    const prog = Math.min(block.progress || 0, target);
    const plan = ui.plan;
    const idx = plan ? plan.blocks.indexOf(block) : -1;
    const label = unitIsTime ? Math.floor(prog / 60) + ' of ' + block.minutes + ' min' : prog + ' of ' + target;
    blockBar.append(h('div', { class: 'spread' }, h('b', { text: (plan && plan.kind === 'placement' ? 'Placement ' : 'Block ') + (idx + 1) + ' of ' + (plan ? plan.blocks.length : 1) }), h('span', { class: 'mono', text: label })));
    blockBar.append(bar(100 * prog / target, 'brass'));
    if (block.reason) blockBar.append(h('span', { class: 'small muted', text: block.reason }));
    if (block.done || prog >= target) {
      const next = plan ? plan.blocks.find(b => !b.done && b !== block) : null;
      blockBar.append(h('div', { class: 'row' },
        h('b', { text: 'Block complete.' }),
        next ? h('button', { class: 'btn brass small', onclick: () => runBlock(next) }, 'Next: ' + (E.SKILLS[next.skill] ? E.SKILLS[next.skill].name : TOOLS[next.tool].title) + ' →')
          : h('button', { class: 'btn brass small', onclick: () => finishPlan() }, plan && plan.kind === 'placement' ? 'See my results →' : 'Finish routine →')));
    }
  }
  function completeIfDone() {
    if (!block || finished) return;
    const target = unitIsTime ? block.minutes * 60 : block.questions;
    if ((block.progress || 0) >= target) {
      finished = true; block.done = true;
      if (ui.plan && ui.plan.kind === 'routine') E.blockProgress(block.id, block.progress, true);
      toast('Block complete');
    }
  }
  const ctx = {
    params: Object.assign({}, block ? block.params : {}, opts.params || {}),
    block,
    skill: t.skill,
    tick(n = 1) {
      if (!block || unitIsTime) return;
      block.progress = (block.progress || 0) + n;
      if (ui.plan && ui.plan.kind === 'routine') E.blockProgress(block.id, block.progress, false);
      completeIfDone(); renderBlockBar();
    },
    setActive(v) { active = v; },
    get blockDone() { return !!(block && block.done); }
  };
  const timer = setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    if (!active && Date.now() - lastAct > 45000) return;
    const skill = (ctx.timeSkill) || t.skill;
    if (!opts.session) E.addTime(5, skill); // a session counts its own wall-clock time
    if (block && unitIsTime) {
      block.progress = (block.progress || 0) + 5;
      if (ui.plan && ui.plan.kind === 'routine' && block.progress % 30 === 0) E.blockProgress(block.id, block.progress, false);
      completeIfDone(); renderBlockBar();
    }
  }, 5000);
  renderBlockBar();
  if (hooks.afterNav) hooks.afterNav();
  let toolCleanup = null;
  // a tool that failed keeps focus on its way back (failure() focuses it); otherwise focus the tool's title
  try { toolCleanup = t.render(body, ctx); focusView(); } catch (e) { failure(body, e, t.title || 'This tool'); }
  ui.cleanup = () => {
    clearInterval(timer);
    document.removeEventListener('pointerdown', markAct, true);
    document.removeEventListener('keydown', markAct, true);
    if (typeof toolCleanup === 'function') toolCleanup();
    if (block && ui.plan && ui.plan.kind === 'routine') E.blockProgress(block.id, block.progress || 0, block.done);
  };
}

/* ---------- Plans: routine and placement ---------- */
export function runBlock(block) {
  openTool(block.tool, { block, returnTab: 'today' });
}
export function startRoutine() {
  const r = E.routineToday(); if (!r) return;
  ui.plan = { kind: 'routine', blocks: r.blocks };
  const next = r.blocks.find(b => !b.done) || r.blocks[0];
  runBlock(next);
}
export function startPlacement() {
  ui.plan = { kind: 'placement', blocks: E.placementPlan() };
  runBlock(ui.plan.blocks[0]);
}
function finishPlan() {
  const plan = ui.plan;
  if (plan && plan.kind === 'placement') { E.finishPlacement(); E.makeRoutine(); toast('Placement saved. Your first routine is ready.'); }
  else toast('Routine finished. Nice work.');
  ui.plan = null;
  go('today');
}

/* ---------- Shared: item picking with test/region modes ---------- */
export function pickFor(skill, ctx, regionFilter) {
  const p = ctx.params || {};
  if (p.test) return E.pick(skill, E.universe(skill), { uniform: true });
  // a contrast drill: only the two items you confuse
  if (Array.isArray(p.contrast)) {
    const pool = E.universe(skill).filter(x => p.contrast.includes(x.id));
    if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
  }
  if (p.region && regionFilter && Math.random() < 0.65) {
    const pool = E.universe(skill).filter(x => regionFilter(x, p.region));
    if (pool.length) return E.pick(skill, pool);
  }
  return E.pick(skill);
}

/* ---------- Generic quiz component ---------- */
export function Quiz(container, ctx, gen, opts = {}) {
  const card = h('div', { class: 'card' });
  container.append(card);
  let q = null, t0 = 0, answered = false, autoTimer = null, alive = true;
  function next() {
    clearTimeout(autoTimer);
    if (!alive) return;
    const keepFocus = q !== null && card.contains(document.activeElement);
    answered = false;
    q = gen();
    const pair = ctx.params && Array.isArray(ctx.params.contrast) ? ctx.params.contrast : null;
    if (pair && q.choices) { // a contrast drill offers just the two you confuse
      const keep = q.choices.filter(c => pair.some(x => x === c.id || String(x).split(':')[0] === c.id));
      if (keep.length >= 2) q.choices = keep;
    }
    card.innerHTML = '';
    if (pair) card.append(h('div', { class: 'callout contrast-banner' }, h('b', { text: 'Contrast drill' }), h('span', { class: 'small', text: ' Just these two, in random order. Listen for what makes them different; when you get most right, go back to the full mix.' })));
    const top = h('div', { class: 'stack' });
    if (q.eyebrow) top.append(h('span', { class: 'eyebrow', text: q.eyebrow }));
    top.append(h('div', { class: 'prompt', text: q.prompt }));
    if (q.sub) top.append(h('p', { class: 'muted small', text: q.sub }));
    card.append(top);
    const ctrl = h('div', { class: 'row' });
    if (q.play) ctrl.append(h('button', { class: 'btn primary', onclick: () => { A.ensure(); q.play(); } }, '▶ ', q.replayLabel || 'Play again'));
    (q.extraButtons || []).forEach(b => ctrl.append(h('button', { class: 'btn small', onclick: b.onclick }, b.label)));
    const hintBox = h('div', { class: 'hint', hidden: true });
    if (q.hint && q.hint.text) {
      if (q.hint.mode === 'auto') { hintBox.hidden = false; hintBox.textContent = q.hint.text; }
      else if (q.hint.mode === 'button') ctrl.append(h('button', { class: 'btn small ghost', onclick: () => { hintBox.hidden = false; hintBox.textContent = q.hint.text; } }, 'Hint'));
    }
    card.append(ctrl, hintBox);
    const grid = h('div', { class: 'choices' + (q.wide ? ' wide' : '') });
    q.choices.forEach((c, i) => {
      const b = h('button', { class: 'choice' + (q.wide ? ' wide' : ''), 'data-id': c.id, onclick: () => answer(c.id, b) }, h('b', { text: c.label }), c.sub ? h('span', { text: c.sub }) : null);
      grid.append(b);
    });
    card.append(grid);
    const fb = h('div', { class: 'feedback', hidden: true, role: 'status', 'aria-live': 'polite' });
    card.append(fb);
    if (q.after) card.append(q.after);
    // keyboard users keep their place: the next question starts on its first answer
    if (keepFocus) { const first = grid.querySelector('.choice'); if (first) first.focus({ preventScroll: true }); }
    A.ensure();
    setTimeout(() => { if (alive && q.play && !q.noAutoplay) q.play(); t0 = performance.now(); }, 120);
    t0 = performance.now();
  }
  function answer(id) {
    if (answered) return;
    answered = true;
    const wasInCard = card.contains(document.activeElement);
    const rt = performance.now() - t0;
    const correct = id === q.answer;
    card.querySelectorAll('.choice').forEach(b => {
      b.disabled = true;
      if (b.dataset.id === q.answer) b.classList.add('correct');
      else if (b.dataset.id === id) b.classList.add('wrong');
    });
    q.onResult && q.onResult(correct, id, rt);
    ctx.tick(1);
    const fb = card.querySelector('.feedback');
    fb.hidden = false; fb.className = 'feedback ' + (correct ? 'ok' : 'no');
    fb.innerHTML = '';
    const ex = q.explain ? q.explain(correct, id) : null;
    fb.append(h('b', { text: correct ? 'Correct.' : 'Not quite.' }));
    if (ex) fb.append(typeof ex === 'string' ? h('span', { text: ex }) : ex);
    const row = h('div', { class: 'row' });
    if (!correct && q.compare) {
      row.append(h('button', { class: 'btn small', onclick: () => q.compare(id) }, 'Hear yours'));
      if (q.play) row.append(h('button', { class: 'btn small', onclick: () => q.play() }, 'Hear correct'));
    }
    const nextBtn = h('button', { class: 'btn primary small', onclick: next }, 'Next →');
    row.append(nextBtn);
    fb.append(row);
    // the answer buttons are now disabled, which would drop keyboard focus to the page: put it on Next
    if (wasInCard) nextBtn.focus({ preventScroll: true });
    if (correct && !opts.noAuto) autoTimer = setTimeout(next, q.autoDelay || 1300);
  }
  function onKey(e) {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
    // Enter and Space on a focused button (an answer, Next, Hear yours) belong to that button
    if (e.target && e.target.tagName === 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) return;
    const n = parseInt(e.key, 10);
    if (!answered && n >= 1 && q && n <= q.choices.length) answer(q.choices[n - 1].id);
    else if (answered && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); next(); }
    else if (!answered && (e.key === 'r' || e.key === ' ') && q && q.play) { e.preventDefault(); q.play(); }
  }
  document.addEventListener('keydown', onKey);
  next();
  return () => { alive = false; clearTimeout(autoTimer); document.removeEventListener('keydown', onKey); };
}

/* ---------- Fretboard ---------- */
const FB = { W: 700, H: 250, nut: 44, fw: 54.6, top: 22, gap: 40 };
function fretX(f) { return f === 0 ? FB.nut / 2 : FB.nut + (f - 0.5) * FB.fw; }
function strY(si) { return FB.top + (5 - si) * FB.gap; }
export function Fretboard(opts = {}) {
  // left-handed players see the neck mirrored: nut on the right
  const lefty = !!(E.state.settings && E.state.settings.lefty), capo = (E.state.settings && E.state.settings.capo) || 0;
  const X = x => (lefty ? FB.W - x : x);
  const svg = s('svg', { viewBox: `0 0 ${FB.W} ${FB.H}`, class: 'fretboard' + (lefty ? ' lefty' : ''), role: 'img', 'aria-label': opts.label || 'Guitar fretboard, frets 0 to 12' + (capo ? ', capo at ' + capo : '') + (lefty ? ', left-handed' : '') });
  const base = s('g'), hl = s('g'), dots = s('g');
  base.append(s('rect', { class: 'wood', x: lefty ? 0 : FB.nut, y: FB.top - 12, width: FB.W - FB.nut, height: FB.gap * 5 + 24, rx: 4 }));
  [3, 5, 7, 9].forEach(f => base.append(s('circle', { class: 'inlay', cx: X(fretX(f)), cy: FB.top + FB.gap * 2.5, r: 7 })));
  base.append(s('circle', { class: 'inlay', cx: X(fretX(12)), cy: FB.top + FB.gap * 1.5, r: 7 }), s('circle', { class: 'inlay', cx: X(fretX(12)), cy: FB.top + FB.gap * 3.5, r: 7 }));
  for (let f = 1; f <= 12; f++) base.append(s('line', { class: 'fret', x1: X(FB.nut + f * FB.fw), x2: X(FB.nut + f * FB.fw), y1: FB.top - 12, y2: FB.top + FB.gap * 5 + 12 }));
  base.append(s('line', { class: 'nut' + (capo ? ' capo' : ''), x1: X(FB.nut), x2: X(FB.nut), y1: FB.top - 12, y2: FB.top + FB.gap * 5 + 12 }));
  for (let si = 0; si < 6; si++) base.append(s('line', { class: 'str', x1: X(4), x2: X(FB.W), y1: strY(si), y2: strY(si), 'stroke-width': 1 + (5 - si) * 0.35 + 0.4 }));
  for (let f = 0; f <= 12; f++) base.append(s('text', { class: 'fnum', x: X(fretX(f)), y: FB.H - 4 }, f === 0 && capo ? 'C' + capo : String(f)));
  svg.append(base, hl, dots);
  function highlightString(si) {
    hl.innerHTML = '';
    if (si === null || si === undefined) return;
    hl.append(s('rect', { class: 'hl', x: 0, y: strY(si) - FB.gap / 2 + 2, width: FB.W, height: FB.gap - 4, rx: 6 }));
  }
  function mark(list, keep) {
    if (!keep) dots.innerHTML = '';
    list.forEach(m => {
      const filled = ['root', 'g3', 'good', 'bad'].includes(m.kind);
      dots.append(s('circle', { class: 'dot ' + (m.kind || 'tone'), cx: X(fretX(m.f)), cy: strY(m.s), r: 14 }));
      if (m.label) dots.append(s('text', { class: 'lbl' + (filled ? ' on' : ''), x: X(fretX(m.f)), y: strY(m.s) }, m.label));
    });
    // on a narrow screen the neck scrolls sideways: bring the marked notes into view
    if (list.length) requestAnimationFrame(() => {
      if (wrap.scrollWidth <= wrap.clientWidth + 2) return;
      const xs = list.map(m => X(fretX(m.f))), mid = (Math.min(...xs) + Math.max(...xs)) / 2;
      wrap.scrollLeft = Math.max(0, mid / FB.W * wrap.scrollWidth - wrap.clientWidth / 2);
    });
  }
  svg.addEventListener('click', ev => {
    if (!opts.onTap) return;
    const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    const ctm = svg.getScreenCTM(); if (!ctm) return;
    const p = pt.matrixTransform(ctm.inverse());
    const px = X(p.x);
    let si = Math.round(5 - (p.y - FB.top) / FB.gap); si = Math.max(0, Math.min(5, si));
    let f = px < FB.nut ? 0 : Math.ceil((px - FB.nut) / FB.fw); f = Math.max(0, Math.min(12, f));
    opts.onTap(si, f, ev);
  });
  const wrap = h('div', { class: 'fretwrap' }); wrap.append(svg);
  return { el: wrap, mark, clear: () => { dots.innerHTML = ''; }, highlightString };
}
export function positionsOfPc(pcs, maxFret = 12, kindFn) {
  const out = [];
  E.STRINGS.forEach((st, si) => {
    for (let f = 0; f <= maxFret; f++) {
      const p = (st.midi + f) % 12;
      if (pcs.includes(p)) out.push({ s: si, f, p, kind: kindFn ? kindFn(p) : 'tone', label: D.NOTE_NAMES[p] });
    }
  });
  return out;
}
