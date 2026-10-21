import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import { h, s, shuffle, bar, regionName, TOOLS, tool, pickFor, Quiz, hooks } from '../ui/core.js';
import Mic from '../listen.js';
import { MicToggle, micSettingsCard } from '../ui/mic.js';

/* ======================================================
   RHYTHM TOOLS
   ====================================================== */
export const SOUND_FOR = { clave: 'clave', bell: 'bell', low: 'low', mid: 'mid', high: 'high', shaker: 'shaker', clap: 'clap', chick: 'chick', hat: 'hat', ride: 'ride' };
export function stepDurFn(r, bpm) { const sd = 60 / bpm / r.spb; return () => sd; }
function targetSteps(r) {
  const out = [];
  for (let i = 0; i < r.steps; i++) {
    if (r.target === 'all') { if (Object.entries(r.tracks).some(([k, v]) => (k === 'low' || k === 'high') && v[i] !== '.')) out.push(i); }
    else if (r.tracks[r.target][i] !== '.') out.push(i);
  }
  return out;
}
function beatSteps(r) {
  if (r.groups) { const out = []; let acc = 0; r.groups.forEach(g => { out.push(acc); acc += g; }); return out; }
  const out = []; for (let i = 0; i < r.steps; i += r.spb) out.push(i); return out;
}
export function RhythmGrid(r) {
  const wrap = h('div', { class: 'rgrid-wrap' });
  const grid = h('div', { class: 'rgrid' });
  const cols = `56px repeat(${r.steps}, minmax(12px, 1fr))`;
  const gstarts = new Set(); if (r.groups) { let a = 0; r.groups.forEach(g => { if (a) gstarts.add(a); a += g; }); } else for (let i = r.spb; i < r.steps; i += r.spb) gstarts.add(i);
  const cells = [];
  const tgt = new Set(targetSteps(r));
  Object.entries(r.tracks).forEach(([name, pat]) => {
    const row = h('div', { class: 'rrow', style: { gridTemplateColumns: cols } });
    row.append(h('span', { class: 'rname', text: name === 'low' ? 'dum/low' : name === 'high' ? 'tek/high' : name }));
    for (let i = 0; i < r.steps; i++) {
      const ch = pat[i];
      const isT = (r.target === name) || (r.target === 'all' && (name === 'low' || name === 'high'));
      const c = h('span', { class: 'cell' + (ch === 'X' ? ' acc' : ch !== '.' ? ' on' : '') + (isT && ch !== '.' ? ' target' : '') + (gstarts.has(i) ? ' gstart' : '') });
      row.append(c); (cells[i] = cells[i] || []).push(c);
    }
    grid.append(row);
  });
  const labs = [];
  const labRow = h('div', { class: 'rrow', style: { gridTemplateColumns: cols } });
  labRow.append(h('span', { class: 'rname', text: r.labels ? 'say' : 'count' }));
  for (let i = 0; i < r.steps; i++) {
    let t = r.labels ? r.labels[i] : (i % r.spb === 0 ? String(i / r.spb + 1) : r.spb === 2 ? '&' : r.spb === 4 ? ['', 'e', '&', 'a'][i % 4] : r.spb === 3 ? ['', '&', 'a'][i % 3] : '');
    if (r.groups && !r.labels) { let a = 0, gi = 0; for (const g of r.groups) { if (i >= a && i < a + g) { t = String(i - a + 1); break; } a += g; gi++; } }
    const l = h('span', { class: 'lab' + (gstarts.has(i) ? ' gstart' : ''), text: t, title: t });
    labs.push(l); labRow.append(l);
  }
  grid.append(labRow);
  if (r.marks) {
    const mRow = h('div', { class: 'rrow', style: { gridTemplateColumns: cols } });
    mRow.append(h('span', { class: 'rname', text: 'hand' }));
    for (let i = 0; i < r.steps; i++) mRow.append(h('span', { class: 'lab', text: r.marks[i] || '' }));
    grid.append(mRow);
  }
  wrap.append(grid);
  let prev = -1;
  return {
    el: wrap,
    setNow(i) {
      if (prev >= 0) { (cells[prev] || []).forEach(c => c.classList.remove('now')); labs[prev] && labs[prev].classList.remove('now'); }
      if (i >= 0) { (cells[i] || []).forEach(c => c.classList.add('now')); labs[i] && labs[i].classList.add('now'); }
      prev = i;
    }
  };
}
export function playRhythmStep(r, i, t, mute) {
  Object.entries(r.tracks).forEach(([name, pat]) => {
    if (mute && mute.has(name)) return;
    const ch = pat[i];
    if (ch !== '.') A.hit(SOUND_FOR[name] || 'mid', t, ch === 'X' ? 1 : 0.7);
  });
}

/* Matching taps to expected onsets */
export function scoreTaps(expected, taps, win) {
  const used = new Set(); const errs = [];
  expected.forEach(e => {
    let best = -1, bd = Infinity;
    taps.forEach((tp, j) => { if (used.has(j)) return; const d = tp - e.t; if (Math.abs(d) < Math.abs(bd) && Math.abs(d) <= win) { bd = d; best = j; } });
    if (best >= 0) { used.add(best); errs.push({ e, d: bd }); } else errs.push({ e, d: null });
  });
  const first = expected.length ? expected[0].t - win : 0, last = expected.length ? expected[expected.length - 1].t + win : 0;
  const extra = taps.filter((tp, j) => !used.has(j) && tp >= first && tp <= last).length;
  const hits = errs.filter(x => x.d !== null);
  const hitRate = expected.length ? hits.length / expected.length : 0;
  const meanAbs = hits.length ? hits.reduce((a, x) => a + Math.abs(x.d), 0) / hits.length : win;
  const mean = hits.length ? hits.reduce((a, x) => a + x.d, 0) / hits.length : 0;
  const sd = hits.length > 1 ? Math.sqrt(hits.reduce((a, x) => a + (x.d - mean) ** 2, 0) / (hits.length - 1)) : 0;
  const precision = Math.max(0, 1 - meanAbs / (win * 0.9));
  const score = Math.max(0, Math.min(1, hitRate * 0.6 + precision * 0.4 - Math.min(0.3, extra * 0.04)));
  return { errs, hitRate, meanAbs, mean, sd, extra, score };
}
export function OffsetChart(errs, win, groupFn) {
  const W = 640, Hh = 150, pad = 30;
  const svg = s('svg', { viewBox: `0 0 ${W} ${Hh}`, class: 'chart', role: 'img', 'aria-label': 'Tap timing: points above the line are late, below are early' });
  const lim = Math.ceil(win * 1000 / 20) * 20;
  const y = ms => Hh / 2 - (ms / lim) * (Hh / 2 - 14);
  [-lim, -lim / 2, 0, lim / 2, lim].forEach(v => {
    svg.append(s('line', { class: v === 0 ? 'zero' : 'grid', x1: pad, x2: W - 6, y1: y(v), y2: y(v) }));
    svg.append(s('text', { x: pad - 4, y: y(v) + 3, 'text-anchor': 'end' }, (v > 0 ? '+' : '') + Math.round(v)));
  });
  svg.append(s('text', { x: W - 6, y: 12, 'text-anchor': 'end' }, 'late (ms)'), s('text', { x: W - 6, y: Hh - 4, 'text-anchor': 'end' }, 'early'));
  const n = errs.length, step = (W - pad - 16) / Math.max(1, n - 1);
  errs.forEach((x, i) => {
    const cx = pad + 8 + i * step;
    if (x.d === null) svg.append(s('text', { x: cx, y: Hh / 2 + 4, 'text-anchor': 'middle', fill: 'currentColor', class: '' }, '×'));
    else svg.append(s('circle', { cx, cy: y(Math.max(-lim, Math.min(lim, x.d * 1000))), r: 4.5, class: Math.abs(x.d * 1000) < 35 ? 'pt-good' : 'pt-bad' }));
  });
  return svg;
}
export function describeOffset(meanMs) {
  if (Math.abs(meanMs) < 12) return 'Right in the pocket on average.';
  return meanMs > 0 ? 'You drag by ' + Math.round(meanMs) + ' ms on average (late).' : 'You rush by ' + Math.round(-meanMs) + ' ms on average (early).';
}
/* Tap input. With opts.mic, the player can switch to playing on the guitar: each attack the mic
   hears counts as a tap, already corrected for latency (ev.micTime, audio clock). */
export function TapPad(onTap, label = 'Tap here (or space bar)', opts = {}) {
  const pad = h('button', { class: 'tappad', type: 'button' }, label);
  const flash = () => { pad.classList.add('flash'); setTimeout(() => pad.classList.remove('flash'), 80); };
  const fire = ev => { ev.preventDefault(); onTap(ev); flash(); };
  pad.addEventListener('pointerdown', fire);
  const key = ev => { if (ev.code === 'Space' && !ev.repeat && !(ev.target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(ev.target.tagName))) fire(ev); };
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  document.addEventListener('keydown', key);
  let micOff = null, micT = null;
  if (opts.mic) {
    micT = MicToggle({
      label: 'Play on the guitar instead', onLabel: 'Listening: play on your guitar', hint: 'Wear headphones so the mic hears only your guitar, not the app.',
      onOn: () => { micOff = Mic.on('onset', ev => { onTap({ micTime: ev.t - Mic.latencyMs() / 1000 }); flash(); }); pad.textContent = 'Play on your guitar (tapping still works)'; },
      onOff: () => { if (micOff) micOff(); micOff = null; pad.textContent = label; }
    });
  }
  return { el: micT ? h('div', { class: 'stack' }, pad, micT.el) : pad, cleanup: () => { document.removeEventListener('keydown', key); if (micOff) micOff(); if (micT) micT.cleanup(); } };
}
/* Audio-clock time of a tap or a heard note */
export const tapTime = (ev, lat) => (ev.micTime !== undefined ? ev.micTime : A.eventToAudioTime(ev) - lat);

/* ---------- What plays in each cycle ----------
   The player's own part (the target) stays the same; the music around it varies: the basic pattern and its
   traditional variations rotate, a fill (tihai, remate, break) closes a phrase now and then, and in ghost
   cycles the player's part drops out so they keep it going alone. Variable practice and retrieval of the pulse. */
function sliceTracks(tracks, from, len) { const o = {}; Object.entries(tracks).forEach(([k, p]) => { o[k] = p.slice(from, from + len); }); return o; }
export function cycleSchedule(r, o = {}) {
  const V = (r.var && r.var.variations) || [], F = (r.var && r.var.fills) || [];
  const pool = [{ name: 'Basic pattern', tracks: r.tracks, labels: r.labels, note: r.note }].concat(o.variations === false ? [] : V);
  const plan = [];
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  function extend() {
    const c = plan.length;
    if (o.fillEvery && F.length && c > 0 && (c + 1) % o.fillEvery === 0) {
      const f = F[Math.floor(c / o.fillEvery) % F.length], n = f.cycles || 1;
      for (let k = 0; k < n; k++) plan.push({ kind: 'fill', name: f.name + (n > 1 ? ' (' + (k + 1) + '/' + n + ')' : ''), note: f.note, tracks: sliceTracks(f.tracks, k * r.steps, r.steps), labels: f.labels ? f.labels.slice(k * r.steps, (k + 1) * r.steps) : r.labels });
      return;
    }
    const v = o.fixed !== undefined && pool[o.fixed] ? pool[o.fixed] : pool[Math.floor(c / (o.varEvery || 4)) % pool.length];
    const ghost = !!o.ghostRate && c >= 2 && rnd() < o.ghostRate;
    plan.push(Object.assign({}, v, { kind: ghost ? 'ghost' : v === pool[0] ? 'base' : 'var', ghost }));
  }
  return c => { while (plan.length <= c) extend(); return plan[c]; };
}
const targetTracks = r => (r.target === 'all' ? ['low', 'high'] : [r.target]);
/* "Feel the 16ths": a soft pulse of sixteenths under everything (six per beat in compound meters).
   Steps are 16ths when spb is 4; aksak rhythms count in eighths; talas in matras (beats). */
export const feel16On = () => E.state.settings.feel16 !== false;
export function sixteenthsPerStep(r) { return r.spb === 4 ? 1 : r.spb === 2 ? 2 : r.spb === 3 ? 2 : r.unit === '♪' ? 2 : 4; }
export function feelTicks(n, t, sd) { for (let k = 0; k < n; k++) A.hit('hat', t + k * sd / n, k === 0 ? 0.16 : 0.1); }
function playCycleStep(r, plan, i, t) {
  const mute = plan.ghost ? new Set(targetTracks(r)) : null;
  playRhythmStep(Object.assign({}, r, { tracks: plan.tracks }), i, t, mute);
}
/* Guided and ghost cycles for a test: support fades step by step (1, then 2, then 3 silent cycles in a row) */
function testPlan(n) {
  const out = [false, false];
  let run = 1;
  while (out.length < n) { for (let k = 0; k < run && out.length < n; k++) out.push(true); if (out.length < n) out.push(false); run = Math.min(3, run + 1); }
  out[n - 1] = true;
  return out.slice(0, n);
}
function testCycles(r) {
  if (r.var && r.var.cycles) return Math.max(4, Math.min(16, r.var.cycles));
  const beats = r.groups ? r.groups.length : r.steps / r.spb;
  return Math.max(4, Math.min(12, Math.ceil(32 / Math.max(1, beats))));
}

tool('rhythms', {
  tab: 'rhythm', skill: 'rhythmTap', title: 'Rhythm atlas', eyebrow: 'Rhythm · play & tap along',
  desc: 'Clave, talas, iqa\'at, aksak meters, flamenco compás and more. The studio plays long passes with traditional variations, fills and silent cycles; the test checks your time with the support fading out.',
  render(body, ctx) {
    const regionFilter = (x, region) => D.RHYTHMS.find(r => r.id === x.id).region === region;
    let r = D.RHYTHMS.find(x => x.id === ctx.params.rhythm) || D.RHYTHMS.find(x => x.id === (pickFor('rhythmTap', ctx, regionFilter) || {}).id) || D.RHYTHMS[0];
    let bpm = r.bpm, loop = null, testing = false, padObj = null;
    const opt = Object.assign({ varEvery: 4, fills: 8, ghost: 'some', laya: false, fixed: undefined }, E.state.settings.rhythmStudio || {}, { feel16: feel16On() });
    const saveOpt = () => E.setSetting('rhythmStudio', { varEvery: opt.varEvery, fills: opt.fills, ghost: opt.ghost });
    const card = h('div', { class: 'card' }); body.append(card);
    const sel = h('select', { id: 'rhythm-pick', 'aria-label': 'Rhythm' });
    D.REGIONS.forEach(reg => {
      const list = D.RHYTHMS.filter(x => x.region === reg.id); if (!list.length) return;
      const g = h('optgroup', { label: reg.name });
      list.forEach(x => g.append(h('option', { value: x.id, text: x.name })));
      sel.append(g);
    });
    const head = h('div', { class: 'stack' });
    const gridHolder = h('div');
    const now = h('div', { class: 'studio-now' });
    const tempo = h('input', { type: 'range', min: 40, max: 400, id: 'rhythm-tempo', 'aria-label': 'Tempo' });
    const tempoLbl = h('span', { class: 'mono small' });
    const playBtn = h('button', { class: 'btn primary' }, '▶ Studio');
    const testBtn = h('button', { class: 'btn brass' }, 'Take the test');
    const opts = h('div', { class: 'studio-opts' });
    const phase = h('div', { class: 'phase', hidden: true, role: 'status' });
    const padHolder = h('div');
    const result = h('div', { class: 'stack' });
    const tipsBox = h('div');
    card.append(h('label', { class: 'stack', for: 'rhythm-pick' }, h('span', { class: 'eyebrow', text: 'Rhythm' }), sel), head, gridHolder, now,
      h('label', { class: 'stack', for: 'rhythm-tempo' }, h('span', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Tempo' }), tempoLbl), tempo),
      h('div', { class: 'row' }, playBtn, testBtn), opts, phase, padHolder, result, tipsBox);
    let grid = null, shownTracks = null;
    const unitLbl = () => (r.unit ? r.unit + '/min' : 'bpm');
    function showGrid(plan) {
      const tracks = plan ? plan.tracks : r.tracks;
      if (tracks === shownTracks && grid) return;
      shownTracks = tracks;
      gridHolder.innerHTML = '';
      grid = RhythmGrid(Object.assign({}, r, { tracks, labels: (plan && plan.labels) || r.labels }));
      gridHolder.append(grid.el);
    }
    const seg = (label, key, vals, fmt, after) => {
      const w = h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: label }));
      const sg = h('div', { class: 'seg' });
      vals.forEach(v => sg.append(h('button', { 'aria-pressed': opt[key] === v ? 'true' : 'false', onclick: e => { opt[key] = v; sg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === e.currentTarget ? 'true' : 'false')); saveOpt(); if (after) after(); if (loop && !testing) { stop(); play(); } } }, fmt ? fmt(v) : String(v))));
      w.append(sg); return w;
    };
    function drawOpts() {
      opts.innerHTML = '';
      const V = (r.var && r.var.variations) || [], F = (r.var && r.var.fills) || [];
      const varSel = h('select', { 'aria-label': 'Variation', id: 'rhythm-var' });
      varSel.append(h('option', { value: '', text: 'Rotate through all ' + (V.length + 1) }));
      [{ name: 'Basic pattern' }].concat(V).forEach((v, i) => varSel.append(h('option', { value: String(i), selected: opt.fixed === i ? true : null, text: v.name })));
      varSel.onchange = () => { opt.fixed = varSel.value === '' ? undefined : +varSel.value; if (loop && !testing) { stop(); play(); } };
      opts.append(
        V.length ? h('label', { class: 'stack field', for: 'rhythm-var' }, h('span', { class: 'eyebrow', text: 'Variation' }), varSel) : '',
        h('div', { class: 'row' },
          V.length ? seg('Change every', 'varEvery', [2, 4, 8], v => v + ' cycles') : '',
          F.length ? seg('Fills', 'fills', [0, 4, 8], v => (v ? 'every ' + v : 'off')) : '',
          seg('Silent cycles', 'ghost', ['off', 'some', 'many']),
          seg('Tempo', 'laya', [false, true], v => (v ? 'speed up' : 'steady')),
          seg('Feel the 16ths', 'feel16', [true, false], v => (v ? 'on' : 'off'), () => E.setSetting('feel16', opt.feel16))),
        h('p', { class: 'small muted', text: 'Silent cycles drop your part out so you keep it going alone. ' + (r.var && r.var.layaRamp ? 'This tradition speeds up as a piece builds: try “speed up”.' : '') }));
    }
    function setR(nr) {
      stop(); r = nr; bpm = r.bpm; sel.value = r.id; opt.fixed = undefined;
      if (r.var && r.var.layaRamp) opt.laya = true;
      const lo = r.var && r.var.tempo ? r.var.tempo[0] : Math.round(r.bpm * 0.45), hi = r.var && r.var.tempo ? r.var.tempo[1] : Math.round(r.bpm * 1.6);
      tempo.min = Math.min(lo, r.bpm); tempo.max = Math.max(hi, r.bpm); tempo.value = bpm;
      tempoLbl.textContent = bpm + ' ' + unitLbl();
      head.innerHTML = '';
      const st = E.skillState('rhythmTap').items[r.id];
      const nv = r.var ? (r.var.variations || []).length : 0, nf = r.var ? (r.var.fills || []).length : 0;
      head.append(h('h2', { text: r.name }), h('p', { class: 'small muted', text: regionName(r.region) + ' · ' + r.meter + (nv ? ' · ' + nv + ' variations' : '') + (nf ? ' · ' + nf + ' fills' : '') + (st ? ' · best recent score ' + Math.round(st.ema * 100) + '%' : '') }), h('p', { class: 'small', text: r.note }),
        h('p', { class: 'small muted', text: 'Outlined cells are your part: ' + (r.target === 'all' ? 'every dum and tek' : r.target) + '. It stays the same while the rest varies.' }));
      shownTracks = null; showGrid(null); now.innerHTML = '';
      tipsBox.innerHTML = '';
      if (r.var && r.var.tips && r.var.tips.length) tipsBox.append(h('details', { class: 'sr-tips' }, h('summary', { class: 'small', text: 'Practice tips for ' + r.name }), h('ul', { class: 'list small' }, r.var.tips.map(t => h('li', { text: t })))));
      drawOpts();
      result.innerHTML = '';
    }
    function stop() {
      if (loop) loop.stop(); loop = null; testing = false;
      playBtn.textContent = '▶ Studio'; ctx.setActive(false);
      grid && grid.setNow(-1);
      if (padObj) { padObj.cleanup(); padObj = null; } padHolder.innerHTML = ''; phase.hidden = true;
      testBtn.disabled = false;
    }
    // Studio: an open-ended pass through the rhythm and its variations
    function play() {
      A.ensure();
      const sched = cycleSchedule(r, { varEvery: opt.varEvery, fillEvery: opt.fills, ghostRate: { off: 0, some: 0.2, many: 0.4 }[opt.ghost], fixed: opt.fixed });
      const top = +tempo.max;
      let cur = sched(0), cyc = -1;
      const beats = new Set(beatSteps(r));
      loop = A.Loop({
        steps: r.steps, stepDur: () => 60 / bpm / r.spb,
        onStep: (i, t, cycle) => {
          if (i === 0) {
            cur = sched(cycle);
            if (opt.laya && cycle > 0) { bpm = Math.min(top, Math.round(bpm * 1.02 * 10) / 10); }
          }
          playCycleStep(r, cur, i, t);
          if (cur.ghost && beats.has(i)) A.hit(i === 0 ? 'clickHi' : 'click', t, 0.35);
          if (opt.feel16) feelTicks(sixteenthsPerStep(r), t, 60 / bpm / r.spb);
        },
        onVisual: (i, cycle) => {
          if (i === 0 && cycle !== cyc) {
            cyc = cycle;
            const p = sched(cycle), nx = sched(cycle + 1);
            showGrid(p);
            tempoLbl.textContent = Math.round(bpm) + ' ' + unitLbl();
            now.innerHTML = '';
            now.className = 'studio-now ' + p.kind;
            now.append(h('span', { class: 'mono small', text: 'Cycle ' + (cycle + 1) }),
              h('b', { text: p.kind === 'ghost' ? 'Your part is silent: keep it going' : p.kind === 'fill' ? 'Fill: ' + p.name : p.name }),
              p.note && p.kind !== 'ghost' ? h('span', { class: 'small muted', text: p.note }) : '',
              nx.kind === 'fill' && p.kind !== 'fill' ? h('span', { class: 'small studio-next', text: 'Next cycle: ' + nx.name }) : '');
          }
          grid.setNow(i);
        }
      });
      loop.start(); playBtn.textContent = '■ Stop'; ctx.setActive(true);
    }
    playBtn.onclick = () => (loop ? stop() : play());
    tempo.oninput = () => { bpm = +tempo.value; tempoLbl.textContent = bpm + ' ' + unitLbl(); if (loop && !testing) { stop(); play(); } };
    sel.onchange = () => setR(D.RHYTHMS.find(x => x.id === sel.value));
    testBtn.onclick = () => runTest();

    // Test: a count-in, then longer than before, with the accompaniment varying and the support fading out
    function runTest() {
      stop(); A.ensure(); testing = true; testBtn.disabled = true; result.innerHTML = '';
      const N = testCycles(r), ghosts = testPlan(N);
      const sched = cycleSchedule(r, { varEvery: 2 });
      const tgt = new Set(targetSteps(r));
      const beats = new Set(beatSteps(r));
      const sd = 60 / bpm / r.spb;
      const expected = [], taps = [];
      const lat = (E.state.settings.latencyMs || 0) / 1000;
      padObj = TapPad(ev => { taps.push(tapTime(ev, lat)); }, undefined, { mic: true });
      padHolder.append(padObj.el);
      phase.hidden = false;
      loop = A.Loop({
        steps: r.steps, stepDur: () => sd, maxSteps: r.steps * (N + 1),
        onStep: (i, t, cycle) => {
          const k = cycle - 1, ghost = k >= 0 && ghosts[k];
          const plan = Object.assign({}, sched(Math.max(0, k)), { ghost });
          if (cycle === 0) playRhythmStep(r, i, t, new Set(targetTracks(r)));
          else playCycleStep(r, plan, i, t);
          if ((cycle === 0 || ghost) && beats.has(i)) A.hit(i === 0 ? 'clickHi' : 'click', t, cycle === 0 ? 0.8 : 0.45);
          if (feel16On()) feelTicks(sixteenthsPerStep(r), t, sd);
          if (cycle >= 1 && tgt.has(i)) expected.push({ t, cycle, ghost });
        },
        onVisual: (i, cycle) => {
          grid.setNow(i);
          if (i === 0) {
            const k = cycle - 1;
            phase.textContent = cycle === 0 ? 'Count-in: listen…' : 'Cycle ' + cycle + ' of ' + N + ': ' + (ghosts[k] ? 'your part is silent, keep going' : 'play with the pattern' + (sched(k).kind === 'var' ? ' (' + sched(k).name + ')' : ''));
            phase.className = 'phase' + (ghosts[k] ? ' ghost' : '');
          }
        },
        onEnd: finish
      });
      loop.start(); ctx.setActive(true);
      function finish() {
        const ts = targetSteps(r);
        let minGap = r.steps;
        ts.forEach((st, k) => { const nx = k + 1 < ts.length ? ts[k + 1] : ts[0] + r.steps; minGap = Math.min(minGap, nx - st); });
        const win = Math.max(0.05, Math.min(0.15, sd * minGap * 0.45));
        const res = scoreTaps(expected, taps, win);
        const ghostRes = scoreTaps(expected.filter(e => e.ghost), taps, win);
        const guidedRes = scoreTaps(expected.filter(e => !e.ghost), taps, win);
        const ok = res.score >= 0.7;
        E.record('rhythmTap', r.id, ok, { score: res.score });
        if (hooks.signal) hooks.signal('rhythm:' + r.id, { score: res.score });
        ctx.tick(1);
        stop();
        result.append(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') },
          h('div', { class: 'spread' }, h('b', { text: 'Score ' + Math.round(res.score * 100) + '%' }), h('span', { class: 'mono small', text: N + ' cycles · ' + Math.round(res.hitRate * 100) + '% hit · ±' + Math.round(res.sd * 1000) + ' ms spread' })),
          h('span', { text: describeOffset(res.mean * 1000) }),
          h('span', { class: 'small', text: 'With the pattern playing you hit ' + Math.round(guidedRes.hitRate * 100) + '%; on your own, ' + Math.round(ghostRes.hitRate * 100) + '%' + (res.extra ? '. ' + res.extra + ' extra taps' : '') + '.' }),
          ghostRes.hitRate + 0.15 < guidedRes.hitRate ? h('span', { class: 'small', text: 'You lean on the pattern: more silent cycles in the studio will help.' }) : ''),
          OffsetChart(res.errs, win),
          h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: runTest }, 'Try again'),
            h('button', { class: 'btn primary small', onclick: () => { const nx = pickFor('rhythmTap', ctx, regionFilter); setR(D.RHYTHMS.find(x => x.id === nx.id)); } }, 'Next rhythm →')));
      }
    }
    setR(r);
    return () => stop();
  }
});

tool('rhythmid', {
  tab: 'rhythm', skill: 'rhythmId', title: 'Name that rhythm', eyebrow: 'Rhythm · recognition',
  desc: 'Hear two cycles of a rhythm from somewhere in the world. Name it.',
  render(body, ctx) {
    let loop = null;
    const regionFilter = (x, region) => D.RHYTHMS.find(r => r.id === x.id).region === region;
    const stopLoop = () => { if (loop) loop.stop(); loop = null; };
    const cleanup = Quiz(body, ctx, () => {
      stopLoop();
      const item = pickFor('rhythmId', ctx, regionFilter);
      const r = D.RHYTHMS.find(x => x.id === item.id);
      let pool = (ctx.params.test ? E.universe('rhythmId') : E.unlocked('rhythmId')).map(x => x.id).filter(id => id !== r.id);
      if (ctx.params.contrast) pool = ctx.params.contrast.filter(id => id !== r.id);
      else if (pool.length < 3) pool = D.RHYTHMS.filter(x => x.id !== r.id && x.tier <= r.tier + 1).map(x => x.id);
      const opts = shuffle(shuffle(pool).slice(0, 3).concat([r.id])).map(id => D.RHYTHMS.find(x => x.id === id));
      const play = (rr = r) => { stopLoop(); loop = A.Loop({ steps: rr.steps, stepDur: stepDurFn(rr, rr.bpm), maxSteps: rr.steps * 2, onStep: (i, t) => playRhythmStep(rr, i, t) }); loop.start(); };
      return {
        prompt: 'Which rhythm?', play: () => play(r), wide: true, autoDelay: 1800,
        choices: opts.map(x => ({ id: x.id, label: x.name, sub: regionName(x.region) + ' · ' + x.meter })), answer: r.id,
        compare: id => play(D.RHYTHMS.find(x => x.id === id)),
        onResult: (ok, id, rt) => E.record('rhythmId', r.id, ok, { confused: id, rt }),
        explain: () => r.name + ' (' + regionName(r.region) + ', ' + r.meter + '). ' + r.note
      };
    });
    return () => { stopLoop(); cleanup(); };
  }
});

tool('clock', {
  tab: 'rhythm', skill: 'clock', title: 'Internal clock', eyebrow: 'Rhythm · time feel',
  desc: 'Tap every beat. After two bars the click disappears for four bars. Keep going until it comes back.',
  render(body, ctx) {
    const card = h('div', { class: 'card' }); body.append(card);
    let loop = null, padObj = null, item = ctx.params.tempo ? E.universe('clock').find(x => x.id === ctx.params.tempo) : pickFor('clock', ctx);
    const tempoSel = h('div', { class: 'chips' });
    const info = h('div', { class: 'phase', role: 'status' });
    const startBtn = h('button', { class: 'btn brass' }, 'Start');
    const padHolder = h('div'), result = h('div', { class: 'stack' });
    card.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Tempo' }), tempoSel), h('div', { class: 'row' }, startBtn), info, padHolder, result);
    function renderTempos() {
      tempoSel.innerHTML = '';
      E.universe('clock').slice().sort((a, b) => +a.id - +b.id).forEach(x => {
        const st = E.skillState('clock').items[x.id];
        tempoSel.append(h('button', { class: 'chip', 'aria-pressed': x.id === item.id ? 'true' : 'false', onclick: () => { item = x; renderTempos(); } }, x.label + (st ? ' · ' + Math.round(st.ema * 100) + '%' : '')));
      });
    }
    function stop() { if (loop) loop.stop(); loop = null; if (padObj) { padObj.cleanup(); padObj = null; } padHolder.innerHTML = ''; ctx.setActive(false); startBtn.disabled = false; }
    startBtn.onclick = () => {
      stop(); A.ensure(); result.innerHTML = ''; startBtn.disabled = true;
      const bpm = +item.id, beat = 60 / bpm, taps = [], expected = [];
      const lat = (E.state.settings.latencyMs || 0) / 1000;
      padObj = TapPad(ev => taps.push(tapTime(ev, lat)), undefined, { mic: true }); padHolder.append(padObj.el);
      const total = 8 + 16 + 4;
      loop = A.Loop({
        steps: total, stepDur: () => beat, maxSteps: total,
        onStep: (i, t) => {
          const audible = i < 8 || i >= 24;
          if (audible) A.hit(i % 4 === 0 ? 'clickHi' : 'click', t, 0.9);
          if (i >= 8 && i < 24) expected.push({ t, beat: i });
        },
        onVisual: i => { info.textContent = i < 8 ? 'Click on — bar ' + (Math.floor(i / 4) + 1) + ' of 2' : i < 24 ? 'Silent — bar ' + (Math.floor((i - 8) / 4) + 1) + ' of 4. Keep tapping.' : 'Click is back: how close were you?'; },
        onEnd: () => {
          const res = scoreTaps(expected, taps, beat * 0.45);
          const lastHits = res.errs.slice(-4).filter(x => x.d !== null);
          const drift = lastHits.length ? lastHits.reduce((a, x) => a + x.d, 0) / lastHits.length * 1000 : 0;
          const score = Math.max(0, Math.min(1, res.hitRate * 0.5 + Math.max(0, 1 - res.meanAbs * 1000 / 80) * 0.5));
          const ok = score >= 0.7;
          E.record('clock', item.id, ok, { score });
          ctx.tick(1);
          stop(); renderTempos();
          result.append(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') },
            h('b', { text: 'Score ' + Math.round(score * 100) + '%' }),
            h('span', { text: 'Average error ' + Math.round(res.meanAbs * 1000) + ' ms. By the end of the silence you were ' + (Math.abs(drift) < 15 ? 'still on the beat.' : Math.round(Math.abs(drift)) + ' ms ' + (drift > 0 ? 'late (slowing down).' : 'early (speeding up).')) })),
            OffsetChart(res.errs, beat * 0.45),
            h('p', { class: 'small muted', text: 'Each point is one silent beat, left to right. Drifting upward means you slow down without the click.' }));
        }
      });
      loop.start(); ctx.setActive(true);
    };
    renderTempos();
    return () => stop();
  }
});

tool('metronome', {
  tab: 'rhythm', skill: 'clock', title: 'Metronome & calibration', eyebrow: 'Rhythm · tools',
  desc: 'A metronome with gap bars and subdivisions, plus a tap calibration that makes every timing score fair on your device.',
  render(body, ctx) {
    const st = { bpm: 90, beats: 4, sub: feel16On() ? 4 : 1, play: 4, mute: 0 };
    let loop = null, calLoop = null, calPad = null;
    const card = h('div', { class: 'card' }); body.append(card);
    const big = h('div', { class: 'big-number mono', text: st.bpm });
    const dots = h('div', { class: 'row' });
    const bpmIn = h('input', { type: 'range', min: 30, max: 260, value: st.bpm, id: 'met-bpm', 'aria-label': 'Tempo' });
    const seg = (label, key, vals, fmt) => {
      const wrapper = h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: label }));
      const sg = h('div', { class: 'seg' });
      vals.forEach(v => sg.append(h('button', { 'aria-pressed': st[key] === v ? 'true' : 'false', onclick: e => { st[key] = v; sg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === e.currentTarget ? 'true' : 'false')); if (loop) { stopMet(); startMet(); } } }, fmt ? fmt(v) : String(v))));
      wrapper.append(sg); return wrapper;
    };
    const btn = h('button', { class: 'btn primary' }, '▶ Start');
    card.append(h('div', { class: 'spread' }, big, dots), bpmIn,
      h('div', { class: 'row' }, seg('Beats', 'beats', [2, 3, 4, 5, 7]), seg('Subdivision', 'sub', [1, 2, 3, 4], v => ['♩', '♫', '3', '4'][v - 1])),
      h('div', { class: 'row' }, seg('Play bars', 'play', [1, 2, 4]), seg('Then mute bars', 'mute', [0, 1, 2, 4], v => v === 0 ? 'off' : String(v))), btn);
    function renderDots(active) { dots.innerHTML = ''; for (let i = 0; i < st.beats; i++) dots.append(h('span', { style: { width: '14px', height: '14px', borderRadius: '50%', display: 'inline-block', background: i === active ? 'var(--brass)' : 'var(--sunk)' } })); }
    function startMet() {
      A.ensure();
      const steps = st.beats * st.sub * (st.play + st.mute);
      loop = A.Loop({
        steps, stepDur: () => 60 / st.bpm / st.sub,
        onStep: (i, t) => {
          const bar = Math.floor(i / (st.beats * st.sub));
          if (bar >= st.play) return;
          const inBar = i % (st.beats * st.sub);
          if (inBar === 0) A.hit('clickHi', t, 1); else if (inBar % st.sub === 0) A.hit('click', t, 0.85); else A.hit('click', t, 0.35);
        },
        onVisual: i => { const inBar = i % (st.beats * st.sub); if (inBar % st.sub === 0) renderDots(inBar / st.sub); }
      });
      loop.start(); btn.textContent = '■ Stop'; ctx.setActive(true);
    }
    function stopMet() { if (loop) loop.stop(); loop = null; btn.textContent = '▶ Start'; ctx.setActive(false); renderDots(-1); }
    btn.onclick = () => (loop ? stopMet() : startMet());
    bpmIn.oninput = () => { st.bpm = +bpmIn.value; big.textContent = st.bpm; if (loop) { stopMet(); startMet(); } };
    renderDots(-1);

    const cal = h('div', { class: 'card' }); body.append(cal);
    const calInfo = h('p', { class: 'small', text: 'Current correction: ' + (E.state.settings.latencyMs || 0) + ' ms.' });
    const calBtn = h('button', { class: 'btn' }, 'Calibrate');
    const calPadHolder = h('div');
    body.append(micSettingsCard());
    cal.append(h('h2', { text: 'Tap calibration' }), h('p', { class: 'small muted', text: 'Phones and Bluetooth headphones add delay. Tap along with 12 clicks; the app measures your device and subtracts it from every timing test.' }), calInfo, calBtn, calPadHolder);
    calBtn.onclick = () => {
      stopMet(); A.ensure(); calBtn.disabled = true;
      const taps = [], clicks = [], beat = 60 / 90;
      calPad = TapPad(ev => taps.push(A.eventToAudioTime(ev))); calPadHolder.innerHTML = ''; calPadHolder.append(calPad.el);
      calLoop = A.Loop({ steps: 16, stepDur: () => beat, maxSteps: 16, onStep: (i, t) => { A.hit(i % 4 === 0 ? 'clickHi' : 'click', t, 1); if (i >= 4) clicks.push(t); }, onEnd: () => {
        const offs = [];
        clicks.forEach(c => { let best = null; taps.forEach(tp => { const d = tp - c; if (Math.abs(d) < beat * 0.45 && (best === null || Math.abs(d) < Math.abs(best))) best = d; }); if (best !== null) offs.push(best * 1000); });
        calPad.cleanup(); calPadHolder.innerHTML = ''; calBtn.disabled = false;
        if (offs.length < 6) { calInfo.textContent = 'Not enough taps landed near the clicks. Try again and tap on every click.'; return; }
        offs.sort((a, b) => a - b);
        const med = Math.round(offs[Math.floor(offs.length / 2)]);
        E.setSetting('latencyMs', med);
        calInfo.textContent = 'Saved: ' + med + ' ms correction (' + offs.length + ' taps measured).';
      } });
      calLoop.start();
    };
    return () => { stopMet(); if (calLoop) calLoop.stop(); if (calPad) calPad.cleanup(); };
  }
});
