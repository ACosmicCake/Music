/* World Woodshed — Two Drums: polyrhythms with a thumb on each layer. The left drum plays the beat side, the
   right drum the other (for 3 against 2: two on the left, three on the right). Each round is a count-in and four
   bars, the app playing both layers in the first two and leaving you alone in the last two. Pass with three in
   four notes in time on each drum and the next polyrhythm comes; fail and it costs one of three hearts and
   comes again. After the last one the run goes round again 8 bpm faster. Rules in src/games.js. */
import A from '../audio.js';
import E from '../engine.js';
import { h, s, tool, hooks } from '../ui/core.js';
import { tapTime } from './rhythm.js';
import { GYM } from '../content/gym.js';
import { matchShifted, drumPassed, drumRoundPoints, delayTracker, DRUM_PASS } from '../games.js';
import { Leaderboard, endCard, HowTo } from '../ui/games.js';
import './games.css';

const ROUNDS = GYM.filter(x => x.cat === 'poly').slice().sort((a, b) => a.tier - b.tier);
const BPMS = [50, 60, 72, 84];

/* The clock: the bar as a circle, the left layer's notes on the inner ring, the right's on the outer, and a hand */
function Clock() {
  const svg = s('svg', { viewBox: '0 0 200 200', class: 'td-clock', role: 'img', 'aria-label': 'The bar as a circle: the left drum\'s notes inside, the right drum\'s outside' });
  const dots = s('g'), hand = s('line', { class: 'td-hand', x1: 100, y1: 100, x2: 100, y2: 14 });
  svg.append(s('circle', { class: 'td-ring', cx: 100, cy: 100, r: 82 }), s('circle', { class: 'td-ring', cx: 100, cy: 100, r: 56 }), dots, hand);
  const at = (frac, r) => [100 + r * Math.sin(frac * 2 * Math.PI), 100 - r * Math.cos(frac * 2 * Math.PI)];
  return {
    el: svg,
    set(n, m) {
      dots.innerHTML = '';
      for (let k = 0; k < m; k++) { const [x, y] = at(k / m, 56); dots.append(s('circle', { class: 'td-dot l', cx: x, cy: y, r: 9, 'data-k': 'l' + k })); }
      for (let k = 0; k < n; k++) { const [x, y] = at(k / n, 82); dots.append(s('circle', { class: 'td-dot r', cx: x, cy: y, r: 9, 'data-k': 'r' + k })); }
    },
    hand(frac) { const [x, y] = at(frac, 90); hand.setAttribute('x2', x); hand.setAttribute('y2', y); },
    flash(side, k, ok) { const d = dots.querySelector(`[data-k="${side}${k}"]`); if (!d) return; d.classList.remove('ok', 'no'); void d.getBoundingClientRect(); d.classList.add(ok ? 'ok' : 'no'); }
  };
}

tool('twodrums', {
  tab: 'rhythm', skill: 'tuplets', game: 'twodrums', title: 'Two Drums', eyebrow: 'Game · Rhythm gym',
  desc: 'A polyrhythm with a thumb on each drum: the beat on the left, the other layer on the right. Pass a round and the next polyrhythm comes.',
  render(body, ctx) {
    const holder = h('div', { class: 'stack' }); body.append(holder);
    let stopRun = null;
    const bpmNow = () => (BPMS.includes(E.state.settings.drumsBpm) ? E.state.settings.drumsBpm : 60);
    const first = Math.max(0, ROUNDS.findIndex(x => x.id === (ctx.params || {}).ex));
    const detail = e => 'Reached ' + e.n + ' against ' + e.m + (e.lap > 1 ? ', lap ' + e.lap : '') + ' · from ' + e.bpm + ' bpm';

    function menu(mark) {
      if (stopRun) stopRun();
      holder.innerHTML = '';
      const chip = v => h('button', { class: 'chip', 'aria-pressed': bpmNow() === v ? 'true' : 'false', onclick: () => { E.setSetting('drumsBpm', v); menu(mark); } }, v + ' bpm');
      holder.append(h('div', { class: 'card' },
        HowTo({ game: 'twodrums',
          goal: 'Play two rhythms at once, one with each hand: a polyrhythm such as 3 against 2.',
          steps: ['Hold the phone in both hands. Your left thumb plays the beat on the left drum, your right thumb the other rhythm on the right drum. On a keyboard: F and J, or ← and →.',
            'The circle is one bar: the inner dots are the left drum\'s notes, the outer dots the right drum\'s, and the hand goes round once a bar. A dot flashes green when you hit it in time.',
            'Each round is a bar of count-in and then 4 bars. In bars 1 and 2 the app plays both drums with you; in bars 3 and 4 you are alone, with a soft click on 1.',
            'Pass a round with 75% of the notes in time on each drum and the next polyrhythm comes: ' + ROUNDS.map(x => x.poly[0] + ' against ' + x.poly[1]).join(', ') + '. After the last one they come round again 8 bpm faster.',
            'The game learns your screen\'s own delay as you play, so a steady delay that isn\'t you doesn\'t count.'],
          scoring: ['Each round passed scores the share of notes in time on both drums, more for polyrhythms with more notes, less 10 for each extra tap.', 'Doubled on the second time round, tripled on the third.'],
          ends: 'after three failed rounds (♥). A failed round comes again.',
          note: 'Taps only: the mic can\'t tell which hand played.' }),
        h('div', { class: 'chips' }, h('span', { class: 'small muted', text: 'Tempo' }), BPMS.map(chip)),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: () => play() }, '▶ Play'))),
      Leaderboard('twodrums', { mark, detail }));
    }

    function play() {
      if (stopRun) stopRun();
      holder.innerHTML = ''; A.ensure(); A.fresh();
      const startBpm = bpmNow(), lat = (E.state.settings.latencyMs || 0) / 1000;
      let idx = first, lap = 1, hearts = 3, score = 0, passed = 0, loop = null, raf = 0, alive = true, ended = false;
      let exp = { l: [], r: [] }, taps = { l: [], r: [] }, barStart = 0, barDur = 1, curCycle = 0;
      const clock = Clock();
      const delay = delayTracker(0.12); // your screen's own steady delay, taken off before judging (src/games.js)
      const hud = h('div', { class: 'ud-hud mono' });
      const status = h('div', { class: 'phase', role: 'status' });
      const label = h('div', { class: 'prompt' });
      const pads = { l: h('button', { class: 'td-pad l', type: 'button' }, 'Left: the beat'), r: h('button', { class: 'td-pad r', type: 'button' }, 'Right') };
      const stopBtn = h('button', { class: 'btn small' }, '■ Stop');
      holder.append(h('div', { class: 'card ud-card' }, h('div', { class: 'spread' }, label, stopBtn), hud, h('div', { class: 'td-wrap' }, clock.el), status, h('div', { class: 'td-pads' }, pads.l, pads.r)));
      const drawHud = () => { hud.textContent = score.toLocaleString() + ' pts · ' + '♥'.repeat(hearts) + '♡'.repeat(3 - hearts) + ' · round ' + (passed + 1) + (lap > 1 ? ' · lap ' + lap : ''); };
      const bpm = () => startBpm + (lap - 1) * 8;
      const tap = (side, ev) => {
        if (!loop) return;
        const t = tapTime(ev, lat); taps[side].push(t);
        pads[side].classList.add('flash'); setTimeout(() => pads[side].classList.remove('flash'), 80);
        // light the dot this tap was for
        const list = exp[side]; let k = -1, bd = Infinity;
        const tt = t - delay.get();
        list.forEach((x, i) => { const d = Math.abs(x.t - tt); if (d < bd) { bd = d; k = i; } });
        if (k >= 0 && bd < 0.12) clock.flash(side, list[k].k, bd <= win());
      };
      Object.entries(pads).forEach(([side, el]) => el.addEventListener('pointerdown', ev => { ev.preventDefault(); tap(side, ev); }));
      const onKey = ev => {
        if (ev.repeat || (ev.target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(ev.target.tagName))) return;
        const side = ev.code === 'KeyF' || ev.code === 'ArrowLeft' ? 'l' : ev.code === 'KeyJ' || ev.code === 'ArrowRight' ? 'r' : null;
        if (side) { ev.preventDefault(); tap(side, ev); }
      };
      document.addEventListener('keydown', onKey);
      let winS = 0.08;
      const win = () => winS;

      function round() {
        const ex = ROUNDS[idx], [n, m] = ex.poly, bd = 60 / bpm();
        label.textContent = n + ' against ' + m;
        pads.l.textContent = 'Left: ' + m + ' (the beat)'; pads.r.textContent = 'Right: ' + n;
        clock.set(n, m);
        exp = { l: [], r: [] }; taps = { l: [], r: [] };
        // the window: under half the closest two notes come, at most 90 ms
        let gap = 1; for (let a = 0; a < n; a++) for (let b = 0; b < m; b++) { const d = Math.abs(a * m / n - b); if (d > 1e-6) gap = Math.min(gap, d); }
        winS = Math.max(0.045, Math.min(0.09, gap * bd * 0.45));
        drawHud();
        loop = A.Loop({
          steps: m, stepDur: () => bd, maxSteps: 5 * m, shot: true,
          onStep: (i, t, cycle) => {
            const guided = cycle === 1 || cycle === 2;
            if (cycle === 0) { A.hit(i === 0 ? 'clickHi' : 'click', t, 0.9); return; }
            if (i === 0 && !guided) A.hit('click', t, 0.5); // alone: a soft click on 1 only
            if (guided) A.hit('low', t, 0.9);
            exp.l.push({ t, k: i });
            for (let k = 0; k < n; k++) {
              const pos = k * m / n;
              if (pos >= i && pos < i + 1) { const at = t + (pos - i) * bd; if (guided) A.hit('high', at, 0.8); exp.r.push({ t: at, k }); }
            }
          },
          onVisual: (i, cycle) => {
            if (i !== 0) return;
            curCycle = cycle; barStart = A.heard(); barDur = m * bd;
            status.textContent = cycle === 0 ? 'Count-in…' : cycle <= 2 ? 'Bar ' + cycle + ' of 4 · with the drums' : 'Bar ' + cycle + ' of 4 · on your own';
            status.className = 'phase' + (cycle > 2 ? ' ghost' : '');
          },
          onEnd: () => { if (alive) setTimeout(() => judge(ex), win() * 1000 + 50); }
        });
        loop.start();
      }
      function judge(ex) {
        if (!alive) return;
        loop = null;
        const L = matchShifted(exp.l.map(x => x.t), taps.l, win(), delay), R = matchShifted(exp.r.map(x => x.t), taps.r, win(), delay);
        const ok = drumPassed(L.rate, R.rate), [n, m] = ex.poly;
        E.record('tuplets', ex.id, ok, { score: (L.rate + R.rate) / 2 });
        if (hooks.signal) hooks.signal('gym:' + ex.id, { score: (L.rate + R.rate) / 2 });
        ctx.tick(1);
        const pts = drumRoundPoints(L.rate, R.rate, L.extra + R.extra, n + m) * lap;
        score += ok ? pts : 0;
        const line = 'Left ' + Math.round(L.rate * 100) + '% · right ' + Math.round(R.rate * 100) + '% in time';
        if (ok) {
          passed++; idx++;
          if (idx >= ROUNDS.length) { idx = 0; lap++; }
          status.textContent = 'Passed! ' + line + '. Next: ' + ROUNDS[idx].poly.join(' against ') + (idx === 0 ? ', ' + bpm() + ' bpm' : '') + '.';
        } else {
          hearts--;
          status.textContent = 'Not yet: ' + line + '. You need ' + Math.round(DRUM_PASS * 100) + '% on each drum.' + (hearts ? ' Again!' : '');
        }
        drawHud();
        if (hearts <= 0) { setTimeout(end, 1500); return; }
        setTimeout(() => { if (alive) round(); }, 2200);
      }
      function cleanup() { alive = false; if (loop) loop.stop(); loop = null; cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey); ctx.setActive(false); stopRun = null; }
      function end() {
        if (ended || !holder.isConnected) return;
        ended = true;
        const ex = ROUNDS[idx];
        cleanup();
        const t = Date.now(), rank = score > 0 ? E.addGameScore('twodrums', { s: score, t, n: ex.poly[0], m: ex.poly[1], lap, bpm: startBpm }) : 0;
        holder.innerHTML = '';
        holder.append(endCard({ title: 'Two Drums', score, rank, again: () => play(),
          lines: [passed + ' round' + (passed === 1 ? '' : 's') + ' passed, up to ' + ex.poly.join(' against ') + (lap > 1 ? ' on lap ' + lap : '') + '.'],
          extra: h('button', { class: 'btn', onclick: () => menu(t) }, 'Change tempo') }),
        Leaderboard('twodrums', { mark: t, detail }));
      }
      const frame = () => { if (!alive) return; if (curCycle > 0) clock.hand(((A.heard() - barStart) / barDur) % 1); raf = requestAnimationFrame(frame); };
      stopBtn.onclick = () => end();
      stopRun = () => { if (alive) cleanup(); };
      ctx.setActive(true);
      round(); raf = requestAnimationFrame(frame);
    }
    menu();
    return () => { if (stopRun) stopRun(); };
  }
});
