import A from '../audio.js';
import E from '../engine.js';
import { h, s, toast, tool, hooks, pickFor } from '../ui/core.js';
import { TapPad, tapTime, scoreTaps, OffsetChart, describeOffset, feel16On } from './rhythm.js';
import { GYM, CATS, beatsClick } from '../content/gym.js';

/* ======================================================
   RHYTHM GYM: tuplets, polyrhythms, the 16th-note grid, displaced clicks and rhythmic echo.
   Every exercise sits on a felt 16th-note pulse. Guided bars (the app plays your part) alternate with
   silent bars (you play it alone), so support fades and the timing has to come from you.
   ====================================================== */
/* Timeline of one bar: 16th ticks, beats, the click, your part and your taps */
function Timeline(beats) {
  const W = 640, H = 92, pad = 12, x = p => pad + p / beats * (W - 2 * pad);
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'gym-tl', role: 'img', 'aria-label': 'One bar: 16th-note grid, click, your part and your notes' });
  const base = s('g'), marks = s('g'), head = s('line', { class: 'gym-head', x1: pad, x2: pad, y1: 4, y2: H - 4 });
  for (let i = 0; i <= beats * 4; i++) base.append(s('line', { class: i % 4 ? 'g16' : 'gbeat', x1: x(i / 4), x2: x(i / 4), y1: i % 4 ? 30 : 18, y2: i % 4 ? 62 : 74 }));
  for (let b = 0; b < beats; b++) ['', 'e', '&', 'a'].forEach((l, k) => base.append(s('text', { class: 'gcount', x: x(b + k / 4), y: H - 4 }, k ? l : String(b + 1))));
  svg.append(base, marks, head);
  return {
    el: svg,
    draw(bar) {
      marks.innerHTML = '';
      (bar.click || []).forEach(c => marks.append(s('path', { class: 'gclick' + (c.hi ? ' hi' : ''), d: `M${x(c.pos) - 6} 6 L${x(c.pos) + 6} 6 L${x(c.pos)} 15 Z` })));
      bar.pattern.forEach(p => marks.append(s('circle', { class: 'gnote' + (bar.guided ? '' : ' silent'), cx: x(p), cy: 46, r: 7 })));
    },
    tap(pos, ok) { marks.append(s('line', { class: 'gtap' + (ok ? ' ok' : ''), x1: x(pos), x2: x(pos), y1: 32, y2: 60 })); },
    head(pos) { const xx = x(Math.max(0, Math.min(beats, pos))); head.setAttribute('x1', xx); head.setAttribute('x2', xx); }
  };
}

tool('gym', {
  tab: 'rhythm', skill: 'tuplets', title: 'Rhythm gym', eyebrow: 'Rhythm · tuplets, polyrhythms, 16ths',
  desc: 'Tuplets from triplets to septuplets, polyrhythms, every spot in the 16th grid, displaced clicks and echo. Guided bars alternate with silent ones, all over a felt 16th pulse.',
  render(body, ctx) {
    const holder = h('div', { class: 'section' }); body.append(holder);
    let stopFn = null;
    const stop = () => { if (stopFn) stopFn(); stopFn = null; ctx.setActive(false); };
    function list() {
      stop(); holder.innerHTML = '';
      const unlocked = E.unlockedTier('tuplets');
      Object.entries(CATS).forEach(([c, nm]) => {
        holder.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: nm }),
          h('div', { class: 'tools' }, GYM.filter(x => x.cat === c).map(x => {
            const it = E.skillState('tuplets').items[x.id];
            return h('button', { class: 'tile' + (x.tier > unlocked + 1 ? ' dim' : ''), onclick: () => open(x) }, h('span', { class: 't-title', text: x.name }), h('span', { class: 't-desc', text: 'Level ' + x.tier + ' · ' + x.desc }), h('span', { class: 't-meter', text: it ? Math.round(it.ema * 100) + '%' : 'new' }));
          }))));
      });
    }
    function open(ex) {
      stop(); holder.innerHTML = '';
      const bpms = E.state.settings.gymBpm || {};
      let bpm = bpms[ex.id] || ex.bpm[0], running = null, run = Math.floor(Math.random() * 1000);
      const card = h('div', { class: 'card' }); holder.append(card);
      const bpmLbl = h('b', { class: 'mono', text: bpm + ' bpm' });
      const label = h('div', { class: 'prompt gym-label', text: ex.label(0) });
      const status = h('div', { class: 'phase', role: 'status' });
      const tl = Timeline(ex.beats);
      const stats = h('div', { class: 'gym-stats small mono' });
      const practiceBtn = h('button', { class: 'btn primary' }, '▶ Practise');
      const testBtn = h('button', { class: 'btn brass' }, 'Take the test');
      const padHolder = h('div'), result = h('div', { class: 'stack' });
      const setBpm = v => { bpm = Math.max(30, Math.min(220, Math.round(v))); bpmLbl.textContent = bpm + ' bpm'; const o = Object.assign({}, E.state.settings.gymBpm || {}); o[ex.id] = bpm; E.setSetting('gymBpm', o); };
      const f16 = h('label', { class: 'check small' }, h('input', { type: 'checkbox', checked: feel16On() ? true : null, onchange: e => E.setSetting('feel16', e.target.checked) }), 'Feel the 16ths (soft pulse)');
      card.append(h('div', { class: 'spread' }, h('button', { class: 'btn ghost small', onclick: list }, '← All exercises'), h('span', { class: 'eyebrow', text: CATS[ex.cat] + ' · level ' + ex.tier })),
        h('h2', { text: ex.name }), h('p', { class: 'small', text: ex.desc }),
        label, tl.el, status, stats,
        h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => setBpm(bpm - 4) }, '−4'), bpmLbl, h('button', { class: 'btn small', onclick: () => setBpm(bpm + 4) }, '+4'), f16),
        h('div', { class: 'row' }, practiceBtn, testBtn), padHolder, result,
        h('p', { class: 'small muted', text: 'Filled circles: the app plays your part. Hollow: you play it alone. Lines are your notes, green when on time. Tap the pad or space bar, or switch on the mic and play.' }));

      // shared engine for practice (open-ended) and test (fixed bars)
      function go(mode) {
        stop(); result.innerHTML = ''; A.ensure(); run++;
        const beatDur = () => 60 / bpm;
        const testPlan = [true, true, false, false, true, false, false, false];
        const nBars = mode === 'test' ? testPlan.length + 1 : Infinity;
        const expected = [], taps = [];
        const lat = (E.state.settings.latencyMs || 0) / 1000;
        let barStart = 0, barIdx = -1, curBar = null, rafId = 0;
        const barPlan = b => {
          const k = b - 1; // bar 0 is a count-in
          const guided = k < 0 ? false : mode === 'test' ? testPlan[k] : ex.plan[k % ex.plan.length];
          const click = ex.click ? ex.click(Math.max(0, k)) : ex.poly ? beatsClick(ex.poly[1]) : beatsClick(ex.beats);
          return { k, guided, click: k < 0 ? beatsClick(ex.beats) : click, pattern: k < 0 ? [] : ex.pattern(Math.max(0, k), run), label: k < 0 ? 'Count-in…' : ex.label(k) };
        };
        const win = () => { const p = (curBar && curBar.pattern.length) ? curBar.pattern.slice().sort((a, b) => a - b) : [0, 1]; let g = ex.beats; for (let i = 1; i < p.length; i++) g = Math.min(g, p[i] - p[i - 1]); return Math.max(0.035, Math.min(0.09, g * beatDur() * 0.42)); };
        const pad = TapPad(ev => {
          const t = tapTime(ev, lat); taps.push(t);
          if (curBar) {
            const pos = (t - barStart) / beatDur();
            const ok = expected.some(e => Math.abs(e.t - t) <= win());
            if (pos >= -0.2 && pos <= ex.beats) tl.tap(Math.max(0, pos), ok);
          }
        }, 'Tap here (or space bar)', { mic: true });
        padHolder.innerHTML = ''; padHolder.append(pad.el);
        const loop = A.Loop({
          steps: ex.beats, stepDur: beatDur, maxSteps: isFinite(nBars) ? nBars * ex.beats : 0,
          onStep: (i, t, cycle) => {
            const bar = barPlan(cycle), bd = beatDur();
            bar.click.filter(c => c.pos >= i && c.pos < i + 1).forEach(c => A.hit(c.hi || (c.pos === 0 && cycle === 0) ? 'clickHi' : 'click', t + (c.pos - i) * bd, 0.9));
            if (feel16On()) for (let k = 0; k < 4; k++) A.hit('hat', t + k * bd / 4, k ? 0.09 : 0.14);
            bar.pattern.filter(p => p >= i && p < i + 1).forEach(p => {
              const at = t + (p - i) * bd;
              if (bar.guided) A.hit('clave', at, 0.75);
              if (bar.k >= 0) expected.push({ t: at, ghost: !bar.guided });
            });
          },
          onVisual: (i, cycle) => {
            if (i === 0) {
              const bar = barPlan(cycle);
              curBar = bar; barIdx = cycle;
              barStart = A.now() - A.latency();
              tl.draw(bar); label.textContent = bar.label;
              status.textContent = bar.k < 0 ? 'Count-in' : (bar.guided ? 'With the guide' : 'On your own') + (mode === 'test' ? ' · bar ' + (bar.k + 1) + ' of ' + testPlan.length : ' · bar ' + (bar.k + 1));
              status.className = 'phase' + (bar.guided || bar.k < 0 ? '' : ' ghost');
              // running accuracy over the last few bars
              if (mode !== 'test' && expected.length) {
                const recent = expected.filter(e => e.t > A.now() - 8 * ex.beats * beatDur() && e.t < A.now() - 0.1);
                const r = scoreTaps(recent, taps, win());
                stats.textContent = recent.length ? 'Last bars: ' + Math.round(r.hitRate * 100) + '% on time · ±' + Math.round(r.meanAbs * 1000) + ' ms' : '';
              }
            }
          },
          onEnd: () => finish()
        });
        const tick = () => { if (curBar) tl.head((A.now() - A.latency() - barStart) / beatDur()); rafId = requestAnimationFrame(tick); };
        loop.start(); rafId = requestAnimationFrame(tick); ctx.setActive(true);
        running = mode;
        practiceBtn.textContent = mode === 'practice' ? '■ Stop' : '▶ Practise';
        testBtn.disabled = mode === 'test';
        stopFn = () => { loop.stop(); cancelAnimationFrame(rafId); pad.cleanup(); padHolder.innerHTML = ''; running = null; practiceBtn.textContent = '▶ Practise'; testBtn.disabled = false; };
        function finish() {
          if (mode !== 'test') return;
          const w = win();
          const res = scoreTaps(expected, taps, w), alone = scoreTaps(expected.filter(e => e.ghost), taps, w);
          const ok = res.score >= 0.7;
          E.record('tuplets', ex.id, ok, { score: res.score });
          if (hooks.signal) hooks.signal('gym:' + ex.id, { score: res.score });
          ctx.tick(1);
          stop();
          result.append(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') },
            h('div', { class: 'spread' }, h('b', { text: 'Score ' + Math.round(res.score * 100) + '%' }), h('span', { class: 'mono small', text: Math.round(res.hitRate * 100) + '% on time · ±' + Math.round(res.sd * 1000) + ' ms' })),
            h('span', { text: describeOffset(res.mean * 1000) }),
            h('span', { class: 'small', text: 'On your own: ' + Math.round(alone.hitRate * 100) + '% of notes on time.' + (res.extra ? ' ' + res.extra + ' extra notes.' : '') })),
            OffsetChart(res.errs, w),
            h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => go('test') }, 'Try again'),
              ok && res.score >= 0.85 ? h('button', { class: 'btn small brass', onclick: () => { setBpm(bpm + 4); go('test'); } }, '+4 bpm and again') : ''));
        }
      }
      practiceBtn.onclick = () => (running === 'practice' ? stop() : go('practice'));
      testBtn.onclick = () => go('test');
    }
    const want = GYM.find(x => x.id === (ctx.params || {}).ex);
    if (want) open(want);
    else if (ctx.params && ctx.params.auto) { const it = pickFor('tuplets', ctx); open(GYM.find(x => x.id === (it && it.id)) || GYM[0]); }
    else list();
    return () => stop();
  }
});
