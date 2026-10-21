import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import { h, s, shuffle, bar, regionName, TOOLS, tool, pickFor, Quiz } from '../ui/core.js';

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
function scoreTaps(expected, taps, win) {
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
function OffsetChart(errs, win, groupFn) {
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
function describeOffset(meanMs) {
  if (Math.abs(meanMs) < 12) return 'Right in the pocket on average.';
  return meanMs > 0 ? 'You drag by ' + Math.round(meanMs) + ' ms on average (late).' : 'You rush by ' + Math.round(-meanMs) + ' ms on average (early).';
}
export function TapPad(onTap, label = 'Tap here (or space bar)') {
  const pad = h('button', { class: 'tappad', type: 'button' }, label);
  const fire = ev => { ev.preventDefault(); onTap(ev); pad.classList.add('flash'); setTimeout(() => pad.classList.remove('flash'), 80); };
  pad.addEventListener('pointerdown', fire);
  const key = ev => { if (ev.code === 'Space' && !ev.repeat && !(ev.target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(ev.target.tagName))) fire(ev); };
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  document.addEventListener('keydown', key);
  return { el: pad, cleanup: () => document.removeEventListener('keydown', key) };
}

tool('rhythms', {
  tab: 'rhythm', skill: 'rhythmTap', title: 'Rhythm atlas', eyebrow: 'Rhythm · play & tap along',
  desc: 'Clave, talas, iqa\'at, aksak meters and flamenco compás. Loop one, then take the tap test: two cycles with the pattern, two with it muted.',
  render(body, ctx) {
    const regionFilter = (x, region) => D.RHYTHMS.find(r => r.id === x.id).region === region;
    let r = D.RHYTHMS.find(x => x.id === ctx.params.rhythm) || D.RHYTHMS.find(x => x.id === (pickFor('rhythmTap', ctx, regionFilter) || {}).id) || D.RHYTHMS[0];
    let bpm = r.bpm, loop = null, testing = false, padObj = null;
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
    const tempo = h('input', { type: 'range', min: 40, max: 400, id: 'rhythm-tempo', 'aria-label': 'Tempo' });
    const tempoLbl = h('span', { class: 'mono small' });
    const playBtn = h('button', { class: 'btn primary' }, '▶ Loop');
    const testBtn = h('button', { class: 'btn brass' }, 'Take the tap test');
    const phase = h('div', { class: 'phase', hidden: true });
    const padHolder = h('div');
    const result = h('div', { class: 'stack' });
    card.append(h('label', { class: 'stack', for: 'rhythm-pick' }, h('span', { class: 'eyebrow', text: 'Rhythm' }), sel), head, gridHolder,
      h('label', { class: 'stack', for: 'rhythm-tempo' }, h('span', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Tempo' }), tempoLbl), tempo),
      h('div', { class: 'row' }, playBtn, testBtn), phase, padHolder, result);
    let grid = null;
    function setR(nr) {
      stop(); r = nr; bpm = r.bpm; sel.value = r.id;
      tempo.min = Math.round(r.bpm * 0.45); tempo.max = Math.round(r.bpm * 1.6); tempo.value = bpm;
      tempoLbl.textContent = bpm + ' ' + (r.unit ? r.unit + '/min' : 'bpm');
      head.innerHTML = '';
      const st = E.skillState('rhythmTap').items[r.id];
      head.append(h('h2', { text: r.name }), h('p', { class: 'small muted', text: regionName(r.region) + ' · ' + r.meter + (st ? ' · best recent score ' + Math.round(st.ema * 100) + '%' : '') }), h('p', { class: 'small', text: r.note }),
        h('p', { class: 'small muted', text: 'Outlined cells are what you tap in the test: ' + (r.target === 'all' ? 'every dum and tek' : r.target) + '.' }));
      gridHolder.innerHTML = ''; grid = RhythmGrid(r); gridHolder.append(grid.el);
      result.innerHTML = '';
    }
    function stop() {
      if (loop) loop.stop(); loop = null; testing = false;
      playBtn.textContent = '▶ Loop'; ctx.setActive(false);
      grid && grid.setNow(-1);
      if (padObj) { padObj.cleanup(); padObj = null; } padHolder.innerHTML = ''; phase.hidden = true;
      testBtn.disabled = false;
    }
    function play() {
      A.ensure();
      loop = A.Loop({ steps: r.steps, stepDur: stepDurFn(r, bpm), onStep: (i, t) => playRhythmStep(r, i, t), onVisual: i => grid.setNow(i) });
      loop.start(); playBtn.textContent = '■ Stop'; ctx.setActive(true);
    }
    playBtn.onclick = () => (loop ? stop() : play());
    tempo.oninput = () => { bpm = +tempo.value; tempoLbl.textContent = bpm + ' ' + (r.unit ? r.unit + '/min' : 'bpm'); if (loop && !testing) { stop(); play(); } };
    sel.onchange = () => setR(D.RHYTHMS.find(x => x.id === sel.value));
    testBtn.onclick = () => runTest();

    function runTest() {
      stop(); A.ensure(); testing = true; testBtn.disabled = true; result.innerHTML = '';
      const CYCLES = 5; // 1 count-in, 2 guided, 2 ghost
      const tgt = new Set(targetSteps(r));
      const beats = new Set(beatSteps(r));
      const sd = 60 / bpm / r.spb;
      const muteSet = new Set(r.target === 'all' ? ['low', 'high'] : [r.target]);
      const expected = [], taps = [];
      const lat = (E.state.settings.latencyMs || 0) / 1000;
      padObj = TapPad(ev => { taps.push(A.eventToAudioTime(ev) - lat); });
      padHolder.append(padObj.el);
      phase.hidden = false;
      loop = A.Loop({
        steps: r.steps, stepDur: () => sd, maxSteps: r.steps * CYCLES,
        onStep: (i, t, cycle) => {
          const ghost = cycle >= 3;
          playRhythmStep(r, i, t, ghost ? muteSet : null);
          if (cycle === 0 && beats.has(i)) A.hit(i === 0 ? 'clickHi' : 'click', t, 0.8);
          if (ghost && beats.has(i)) A.hit(i === 0 ? 'clickHi' : 'click', t, 0.45);
          if (cycle >= 1 && tgt.has(i)) expected.push({ t, cycle, ghost });
        },
        onVisual: (i, cycle) => {
          grid.setNow(i);
          phase.textContent = cycle === 0 ? 'Count-in: listen…' : cycle <= 2 ? 'Cycle ' + cycle + ' of 4: tap with the pattern' : 'Cycle ' + cycle + ' of 4: pattern muted, keep tapping';
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
        const ok = res.score >= 0.7;
        E.record('rhythmTap', r.id, ok, { score: res.score });
        ctx.tick(1);
        stop();
        result.append(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') },
          h('div', { class: 'spread' }, h('b', { text: 'Score ' + Math.round(res.score * 100) + '%' }), h('span', { class: 'mono small', text: Math.round(res.hitRate * 100) + '% hit · ±' + Math.round(res.sd * 1000) + ' ms spread' })),
          h('span', { text: describeOffset(res.mean * 1000) }),
          h('span', { class: 'small', text: 'With the pattern muted you hit ' + Math.round(ghostRes.hitRate * 100) + '% of notes' + (res.extra ? '; ' + res.extra + ' extra taps' : '') + '.' })),
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
      if (pool.length < 3) pool = D.RHYTHMS.filter(x => x.id !== r.id && x.tier <= r.tier + 1).map(x => x.id);
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
    const info = h('div', { class: 'phase' });
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
      padObj = TapPad(ev => taps.push(A.eventToAudioTime(ev) - lat)); padHolder.append(padObj.el);
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
    const st = { bpm: 90, beats: 4, sub: 1, play: 4, mute: 0 };
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
