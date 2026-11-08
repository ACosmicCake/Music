/* World Woodshed — the Statistics page (Today → Progress → All statistics): where the practice time went,
   skill by skill and week by week, how accuracy is moving, six months at a glance, and what the planner
   will ask for tomorrow. The numbers come from src/stats.js; the charts here are also drawn on Today. */
import D from '../data.js';
import E from '../engine.js';
import Cur from '../curriculum.js';
import St from '../stats.js';
import { view, h, s, ui, go, renderTabs, teardown, focusView } from './core.js';
import { fmtMin } from '../routines.js';
import { spell, keyPrefersFlats } from '../theory.js';

const OTHER_NAMES = { transcribe: 'Transcribe', pieces: 'Library pieces' };
const skillName = k => (E.SKILLS[k] ? E.SKILLS[k].name : OTHER_NAMES[k] || k);
const weekLabel = w => w.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const pct = x => Math.round(x * 100) + '%';
const hm = m => { m = Math.round(m); return m < 60 ? m + 'm' : Math.floor(m / 60) + 'h' + (m % 60 ? ' ' + m % 60 + 'm' : ''); }; // short, for the narrow column
let span = 8; // weeks shown; kept while the app is open

export function statsPage(opts = {}) {
  teardown(); ui.runner = { id: 'stats', opts: {} }; renderTabs();
  view.innerHTML = ''; window.scrollTo(0, 0);
  view.append(h('div', { class: 'hero' },
    h('div', { class: 'spread' }, h('button', { class: 'btn ghost small', onclick: () => go(ui.tab || 'today') }, '← Back'), h('span', { class: 'eyebrow', text: 'Statistics' })),
    h('h1', { text: 'Your practice in numbers' }),
    h('p', { class: 'lede', text: 'Where your time went, how your accuracy is moving, and what comes up for review tomorrow. Every device you practise on is counted.' })));
  const body = h('div', { class: 'stack', style: { gap: '18px' } });
  view.append(body);
  draw(body);
  focusView();
  if (opts.section) { const el = body.querySelector('[data-section="' + opts.section + '"]'); if (el) el.scrollIntoView(); }
}

function draw(body) {
  body.innerHTML = '';
  const st = E.state, now = Date.now();
  const ws = St.weeks(st.hdev, span, now), skills = St.skillsIn(ws);
  const min = ws.reduce((a, w) => a + w.min, 0), q = ws.reduce((a, w) => a + w.q, 0), c = ws.reduce((a, w) => a + w.c, 0);

  body.append(h('div', { class: 'seg', role: 'group', 'aria-label': 'Weeks shown' }, [4, 8, 12].map(n =>
    h('button', { 'aria-pressed': n === span ? 'true' : 'false', onclick: () => { span = n; draw(body); } }, n + ' weeks'))));

  // the weeks: minutes as bars, accuracy as the gold line
  body.append(h('section', { class: 'card' }, h('h2', { text: 'Week by week' }),
    h('div', { class: 'stats' },
      h('div', { class: 'stat' }, h('b', { class: 'mono', text: fmtMin(min) }), h('span', { text: 'in ' + span + ' weeks' })),
      h('div', { class: 'stat' }, h('b', { class: 'mono', text: fmtMin(min / span) }), h('span', { text: 'a week on average' })),
      h('div', { class: 'stat' }, h('b', { class: 'mono', text: q }), h('span', { text: 'answers' })),
      h('div', { class: 'stat' }, h('b', { class: 'mono', text: q ? pct(c / q) : '—' }), h('span', { text: 'accuracy' }))),
    dayChart(ws.map(w => ({ min: Math.round(w.min), acc: w.q ? w.c / w.q : null, w })), {
      label: d => weekLabel(d.w), aria: 'Minutes practised per week for ' + span + ' weeks, with accuracy line',
      note: 'Bars: minutes per week, Monday to Sunday; this week so far on the right. Gold line: accuracy in weeks you answered questions.'
    })));

  // minutes per skill per week
  const mins = h('section', { class: 'card' }, h('h2', { text: 'Minutes per skill' }));
  if (!skills.length) mins.append(h('p', { class: 'muted', text: 'No practice recorded in these weeks yet. Time spent in any trainer shows up here.' }));
  else {
    mins.append(h('p', { class: 'small muted', text: 'One square per week, oldest on the left; darker is more time. Tap or hover a square for the minutes. Other is time not tied to one skill: lessons, listening, free practice and breaks.' }));
    skills.forEach(k => {
      const tot = ws.reduce((a, w) => a + (w.skills[k] ? w.skills[k].min : 0), 0);
      mins.append(h('div', { class: 'skillrow statrow' }, h('span', { text: skillName(k) }), h('span', { class: 'mono', style: { textAlign: 'right' }, text: hm(tot) }),
        h('span', { class: 'mono small muted', style: { textAlign: 'right' }, text: min ? pct(tot / min) : '' }), weekCells(ws, w => (w.skills[k] ? w.skills[k].min : 0))));
    });
    const other = ws.reduce((a, w) => a + w.other, 0);
    if (other >= 1) mins.append(h('div', { class: 'skillrow statrow' }, h('span', { class: 'muted', text: 'Other' }),
      h('span', { class: 'mono', style: { textAlign: 'right' }, text: hm(other) }), h('span', { class: 'mono small muted', style: { textAlign: 'right' }, text: pct(other / min) }), weekCells(ws, w => w.other)));
  }
  body.append(mins);

  // accuracy trend per skill
  const accSkills = skills.filter(k => ws.some(w => w.skills[k] && w.skills[k].q));
  const acc = h('section', { class: 'card' }, h('h2', { text: 'Accuracy per skill' }));
  if (!accSkills.length) acc.append(h('p', { class: 'muted', text: 'No answers in these weeks yet. The ear trainers, quizzes and tests record every answer.' }));
  else {
    acc.append(h('p', { class: 'small muted', text: 'The line is your accuracy week by week. The number on the right compares the later half of these weeks with the earlier half, once each has at least 10 answers.' }));
    accSkills.forEach(k => {
      const series = St.accuracySeries(ws, k), ch = St.accuracyChange(ws, k);
      const sq = ws.reduce((a, w) => a + (w.skills[k] ? w.skills[k].q : 0), 0), sc = ws.reduce((a, w) => a + (w.skills[k] ? w.skills[k].c : 0), 0);
      const pts = Math.round((ch || 0) * 100);
      acc.append(h('div', { class: 'skillrow statrow' }, h('span', {}, skillName(k), h('span', { class: 'small muted', text: ' · ' + sq + ' answers' })),
        h('span', { class: 'mono', style: { textAlign: 'right' }, text: pct(sc / sq) }),
        h('span', { class: 'mono small ' + (ch === null || !pts ? 'muted' : pts > 0 ? 'trend-up' : 'trend-down'), style: { textAlign: 'right' }, title: ch === null ? 'Not enough answers to compare yet' : 'Change in points',
          text: ch === null ? '' : (pts > 0 ? '+' : '') + pts }),
        spark(series, ws)));
    });
  }
  body.append(acc);

  body.append(scaleCard());
  body.append(h('section', { class: 'card' }, h('h2', { text: 'Every day' }), heatmap()));
  body.append(dueTomorrow(now));
}

/* Time on each scale, for good (not only these weeks): seen in your head (No-guitar drills → See the neck in
   your head) and played (Scale warm-up), with the keys inside each scale */
function scaleCard() {
  const list = St.scaleTotals(E.state.scaleTime);
  const card = h('section', { class: 'card', 'data-section': 'scales' }, h('h2', { text: 'Time on each scale' }));
  if (!list.length) {
    card.append(h('p', { class: 'muted', text: 'Nothing yet. Time counts while the click runs in Scale warm-up (played) and in No-guitar drills → See the neck in your head.' }));
    return card;
  }
  const dur = sec => (sec < 60 ? Math.round(sec) + ' s' : hm(sec / 60));
  const tot = list.reduce((a, x) => [a[0] + x.v, a[1] + x.p], [0, 0]);
  card.append(h('p', { class: 'small muted', text: 'All time, every device. In your head: ' + dur(tot[0]) + ' · played: ' + dur(tot[1]) + '. Tap a scale for its keys.' }));
  list.forEach(x => {
    const sc = D.SCALES.find(y => y.id === x.scale), minor = sc ? sc.steps[2] === 3 : false;
    card.append(h('details', { class: 'scaletime' },
      h('summary', {}, h('span', { class: 'st-name', text: sc ? sc.name : x.scale }), h('b', { class: 'mono', text: dur(x.total) }),
        h('span', { class: 'small muted st-split', text: 'head ' + dur(x.v) + ' · played ' + dur(x.p) })),
      h('ul', { class: 'list small' }, x.keys.map(k => h('li', { class: 'spread' }, h('span', { text: spell(k.tonic, keyPrefersFlats(k.tonic, minor)) }),
        h('span', { class: 'mono muted', text: 'head ' + dur(k.v) + ' · played ' + dur(k.p) }))))));
  });
  return card;
}

/* A strip of week squares for one row, shaded like the heatmap */
function weekCells(ws, minutes) {
  return h('div', { class: 'wkcells', style: { gridTemplateColumns: 'repeat(' + ws.length + ', minmax(0, 1fr))' } }, ws.map(w => {
    const m = Math.round(minutes(w)), lvl = m >= 60 ? 4 : m >= 30 ? 3 : m >= 10 ? 2 : m > 0 ? 1 : 0;
    const label = 'Week of ' + weekLabel(w) + ': ' + (m ? fmtMin(m) : 'none');
    return h('i', { class: 'l' + lvl, title: label, 'aria-label': label, role: 'img' });
  }));
}

/* Accuracy week by week as a small line; a week without answers leaves a gap */
function spark(series, ws) {
  const W = 100, Hh = 22, n = series.length;
  const x = i => (n > 1 ? 3 + i * (W - 6) / (n - 1) : W / 2), y = v => 2 + (1 - v) * (Hh - 4);
  const svg = s('svg', { viewBox: `0 0 ${W} ${Hh}`, class: 'spark', preserveAspectRatio: 'none', role: 'img',
    'aria-label': 'Accuracy by week: ' + series.map((v, i) => weekLabel(ws[i]) + ' ' + (v === null ? 'no answers' : pct(v))).join(', ') });
  svg.append(s('line', { class: 'grid', x1: 0, x2: W, y1: y(0.5), y2: y(0.5) }));
  let run = [];
  const flush = () => { if (run.length > 1) svg.append(s('polyline', { points: run.join(' ') })); run = []; };
  series.forEach((v, i) => { if (v === null) flush(); else run.push(x(i) + ',' + y(v)); });
  flush();
  // dots as zero-length round-capped lines, so they stay round when the line stretches to the width
  series.forEach((v, i) => { if (v !== null) svg.append(s('polyline', { class: 'dot', points: x(i) + ',' + y(v) + ' ' + x(i) + ',' + y(v) })); });
  return svg;
}

/* What the planner will treat as due tomorrow: reviews of the scales, techniques, rhythms, tunes, drills and
   lessons you have learned (the same rule the smart plan uses), quiz items per skill, and the new-material
   allowance for your pace */
function dueTomorrow(now) {
  const end = St.endOfTomorrow(now);
  const nowIds = new Set(Cur.dueAt(now).map(x => x.id));
  const due = Cur.dueAt(end);
  const waiting = due.filter(x => nowIds.has(x.id)), coming = due.filter(x => !nowIds.has(x.id));
  const quiz = St.quizDue(E.state.skills, end);
  const pace = Cur.PACE[Cur.prefs().pace || 'steady'];
  const card = h('section', { class: 'card' }, h('h2', { text: 'Due by tomorrow night' }),
    h('p', { class: 'small muted', text: 'What the smart plan will bring back for review, by the rule it uses: an item is due once its predicted recall falls to about 90%.' }));
  const list = (title, xs) => h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: title + ' · ' + xs.length }),
    h('ul', { class: 'list' }, xs.slice(0, 12).map(x => h('li', { class: 'spread' }, h('span', {}, x.name, h('span', { class: 'small muted', text: ' · ' + x.kindName })),
      h('span', { class: 'mono small muted', text: 'recall ' + pct(x.recall) })))),
    xs.length > 12 ? h('span', { class: 'small muted', text: 'and ' + (xs.length - 12) + ' more' }) : null);
  if (waiting.length) card.append(list('Due already', waiting));
  if (coming.length) card.append(list('Coming due', coming));
  const qk = Object.keys(quiz).sort((a, b) => quiz[b] - quiz[a]);
  if (qk.length) card.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Quiz reviews' }),
    h('ul', { class: 'list' }, qk.map(k => h('li', { class: 'spread' }, h('span', { text: skillName(k) }), h('span', { class: 'mono small', text: quiz[k] + ' item' + (quiz[k] === 1 ? '' : 's') }))))));
  if (!due.length && !qk.length) card.append(h('p', { class: 'muted', text: 'Nothing is due by tomorrow night. The plan will keep things fresh and bring in new material.' }));
  card.append(h('p', { class: 'small muted', text: 'New material: up to ' + pace.newPerDay + ' new item' + (pace.newPerDay > 1 ? 's' : '') + ' a day at your pace (' + pace.name + '), when reviews are under control.' }));
  return card;
}

/* Draw an SVG at the width its box has on screen, so its text stays at its own size on a phone
   instead of shrinking with a wide viewBox, and again when that width changes (a turned phone, an opened fold) */
function sized(box, draw, fallback) {
  let w = 0;
  const redraw = () => {
    const now = Math.round(box.clientWidth) || 0;
    if (now === w && box.firstChild) return;
    if (!now && box.firstChild) return; // hidden (a closed fold): keep what is drawn
    w = now;
    box.replaceChildren(draw(now || fallback));
  };
  redraw();
  requestAnimationFrame(redraw);
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => { if (!box.isConnected) { ro.disconnect(); return; } redraw(); });
    ro.observe(box);
  }
  return box;
}

/* Six months of practice at a glance: one square per day, darker for longer.
   The squares shrink to fit the card, down to a size still easy to see; below that the map scrolls, latest weeks first */
export function heatmap() {
  const weeks = 26, padL = 24, padT = 16, minCol = 8, maxCol = 16;
  const end = new Date(); end.setHours(12, 0, 0, 0);
  const start = new Date(end); start.setDate(end.getDate() - (weeks * 7 - 1));
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // back to a Monday
  const cols = Math.round((end - start) / 864e5 / 7) + 1;
  let days = 0, total = 0;
  const cells = [];
  for (let w = 0; w < cols; w++) for (let d = 0; d < 7; d++) {
    const dt = new Date(start); dt.setDate(start.getDate() + w * 7 + d);
    if (dt > end) continue;
    const hrec = E.state.history[E.dayKey(dt.getTime())], min = hrec ? Math.round(hrec.sec / 60) : 0, q = hrec ? hrec.q : 0;
    const lvl = min >= 45 ? 4 : min >= 20 ? 3 : min >= 8 ? 2 : (min > 0 || q > 0) ? 1 : 0;
    if (lvl) { days++; total += min; }
    cells.push({ w, d, dt, min, q, lvl });
  }
  const draw = width => {
    // on the narrowest phones the weekday names go, so the six months still fit without scrolling
    const pl = width - padL - 2 >= cols * minCol ? padL : 0;
    const col = Math.max(pl ? minCol : 6, Math.min(maxCol, Math.floor((width - pl - 2) / cols)));
    const gap = col >= 12 ? 3 : col >= 8 ? 2 : 1, cell = col - gap;
    const W = pl + cols * col, Hh = padT + 7 * col;
    const svg = s('svg', { viewBox: `0 0 ${W} ${Hh}`, width: W, height: Hh, class: 'heatmap', role: 'img', 'aria-label': 'Practice per day over the last six months' });
    if (pl) ['Mon', '', 'Wed', '', 'Fri', '', ''].forEach((t, i) => t && svg.append(s('text', { x: 0, y: padT + i * col + cell - 1 }, t)));
    let lastMonth = -1, lastX = -99;
    cells.forEach(c => {
      const x = pl + c.w * col, y = padT + c.d * col;
      if (c.d === 0 && c.dt.getMonth() !== lastMonth) {
        lastMonth = c.dt.getMonth();
        // a month's name only where it fits: not over the one before, nor past the right edge
        if (x - lastX >= 26 && x + 20 <= W) { svg.append(s('text', { x, y: 10 }, c.dt.toLocaleDateString(undefined, { month: 'short' }))); lastX = x; }
      }
      const r = s('rect', { class: 'hm l' + c.lvl, x, y, width: cell, height: cell, rx: Math.min(3, cell / 3) });
      r.append(s('title', {}, c.dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) + ': ' + (c.min ? c.min + ' min' : c.q ? c.q + ' answers' : 'no practice')));
      svg.append(r);
    });
    return svg;
  };
  const scroller = sized(h('div', { class: 'heatscroll' }), draw, padL + cols * 13);
  requestAnimationFrame(() => { scroller.scrollLeft = scroller.scrollWidth; }); // the latest weeks first if it scrolls
  return h('div', { class: 'stack heatwrap' }, h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Six months' }), h('span', { class: 'small muted', text: days + ' day' + (days === 1 ? '' : 's') + ' practised · ' + fmtMin(total) })), scroller);
}

/* Minutes as bars with an accuracy line: 14 days on Today, weeks here. points: [{ min, acc }] */
export function dayChart(days, o = {}) {
  const label = o.label || (d => d.date.getDate());
  const maxMin = Math.max(30, ...days.map(d => d.min));
  const top = Math.ceil(maxMin / 15) * 15;
  const labels = days.map(d => String(label(d)));
  const longest = Math.max(1, ...labels.map(t => t.length));
  const draw = width => {
    const W = Math.max(160, width), Hh = Math.round(Math.min(180, Math.max(130, W * 0.36)));
    const padL = 28, padR = 32, padB = 20, padT = 18;
    const svg = s('svg', { viewBox: `0 0 ${W} ${Hh}`, width: W, height: Hh, class: 'chart', role: 'img', 'aria-label': o.aria || 'Minutes practiced per day for 14 days, with accuracy line' });
    const ih = Hh - padB - padT, iw = W - padL - padR;
    const y = v => padT + ih - (v / top) * ih;
    [0, top / 2, top].forEach(v => { svg.append(s('line', { class: 'grid', x1: padL, x2: W - padR, y1: y(v), y2: y(v) }), s('text', { x: padL - 4, y: y(v) + 3, 'text-anchor': 'end' }, Math.round(v))); });
    [0, 0.5, 1].forEach(v => svg.append(s('text', { x: W - 2, y: padT + ih - v * ih + 3, 'text-anchor': 'end' }, Math.round(v * 100) + '%')));
    // the units above their own axis, clear of its top number
    svg.append(s('text', { x: 0, y: 8 }, 'min'), s('text', { x: W - 2, y: 8, 'text-anchor': 'end' }, 'acc'));
    const bw = iw / days.length, gapB = Math.min(3, bw * 0.2);
    // as many labels as fit, always the latest
    const step = Math.max(1, Math.ceil((longest * 6.2 + 6) / bw));
    const pts = [];
    days.forEach((d, i) => {
      const x = padL + i * bw;
      if (d.min > 0) svg.append(s('rect', { class: 'barfill', x: x + gapB, y: y(d.min), width: Math.max(2, bw - 2 * gapB), height: Math.max(1, y(0) - y(d.min)), rx: 2 }));
      if ((days.length - 1 - i) % step === 0) svg.append(s('text', { x: x + bw / 2, y: Hh - 5, 'text-anchor': 'middle' }, labels[i]));
      if (d.acc !== null) pts.push([x + bw / 2, padT + ih - d.acc * ih]);
    });
    if (pts.length > 1) svg.append(s('polyline', { class: 'accline', points: pts.map(p => p.join(',')).join(' ') }));
    pts.forEach(p => svg.append(s('circle', { class: 'accdot', cx: p[0], cy: p[1], r: 3 })));
    return svg;
  };
  return h('div', { class: 'stack' }, sized(h('div', { class: 'chartbox' }), draw, 640), h('p', { class: 'small muted', text: o.note || 'Bars: minutes per day. Gold line: accuracy on days you answered questions.' }));
}
