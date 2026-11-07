/* World Woodshed — Tightrope: keep the beat while the click fades. You play every beat; a walker crosses a
   canyon on a rope and leans the way your timing goes (rushing tips them forward, dragging back), so the lean
   is your average timing made visible. The click thins out every 8 bars: every beat, 2 and 4, beat 1, beat 1
   of every other bar, every fourth bar. Lean too far and you fall into the net. Rules in src/games.js. */
import A from '../audio.js';
import E from '../engine.js';
import { h, s, tool, hooks } from '../ui/core.js';
import { TapPad, tapTime } from './rhythm.js';
import { ROPE_STAGES, ROPE_BARS, ropeStage, ropeClick, leanAfter, ropeFell, ropePoints, delayTracker } from '../games.js';
import { Leaderboard, endCard, HowTo } from '../ui/games.js';
import './games.css';

const BPMS = [60, 80, 100, 120];

/* The canyon: hills that slide by, posts every four bars, the rope, the walker with a long pole and a net below */
function Scene() {
  const svg = s('svg', { viewBox: '0 0 320 190', class: 'tr-scene', role: 'img', 'aria-label': 'A walker on a tightrope; they lean forward when you rush and back when you drag' });
  const far = s('g'), posts = s('g'), walker = s('g', { class: 'tr-walker' });
  svg.append(far, s('path', { class: 'tr-cliff', d: 'M0 190 L0 120 L34 116 L44 190 Z' }), s('path', { class: 'tr-cliff', d: 'M320 190 L320 120 L286 116 L276 190 Z' }),
    s('path', { class: 'tr-net', d: 'M20 168 Q160 186 300 168' }), posts, s('line', { class: 'tr-rope', x1: 0, x2: 320, y1: 112, y2: 112 }), walker);
  for (let k = 0; k < 6; k++) far.append(s('path', { class: 'tr-far', d: `M${k * 90 - 40} 112 L${k * 90 + 10} 60 L${k * 90 + 60} 112 Z` }));
  walker.append(s('line', { class: 'tr-pole', x1: -46, y1: -34, x2: 46, y2: -34 }), s('circle', { class: 'tr-weight', cx: -46, cy: -34, r: 3 }), s('circle', { class: 'tr-weight', cx: 46, cy: -34, r: 3 }),
    s('path', { class: 'tr-legs', d: 'M-4 0 L0 -14 L4 0' }), s('rect', { class: 'tr-body', x: -5, y: -32, width: 10, height: 19, rx: 4 }),
    s('circle', { class: 'tw-skin', cx: 0, cy: -38, r: 5 }), s('path', { class: 'tr-cap', d: 'M-6 -40 Q0 -48 6 -40 Z' }));
  return {
    el: svg,
    draw(beat, lean) {
      far.setAttribute('transform', `translate(${-((beat * 4) % 90)} 0)`);
      posts.innerHTML = '';
      const per = 16, px = 26; // a post every 16 beats, 26 px a beat
      for (let b = Math.floor(beat / per) * per; b < beat + 12; b += per) {
        const x = 160 + (b - beat) * px;
        if (x > -10 && x < 330) posts.append(s('line', { class: 'tr-post', x1: x, x2: x, y1: 112, y2: 140 }), s('text', { class: 'tr-mark', x, y: 152 }, String(b)));
      }
      walker.setAttribute('transform', `translate(160 112) rotate(${Math.max(-60, Math.min(60, -lean * 40))})`);
    },
    fall() { walker.classList.add('fall'); }
  };
}

tool('tightrope', {
  tab: 'rhythm', skill: 'tuplets', game: 'tightrope', title: 'Tightrope', eyebrow: 'Game · Rhythm gym',
  desc: 'Play every beat while the click fades away. The walker leans forward when you rush and back when you drag; lean too far and you fall.',
  render(body, ctx) {
    const holder = h('div', { class: 'stack' }); body.append(holder);
    let stopRun = null;
    const bpmNow = () => (BPMS.includes(E.state.settings.ropeBpm) ? E.state.settings.ropeBpm : 80);
    const detail = e => e.beats + ' steps · ' + e.bpm + ' bpm · click on ' + ROPE_STAGES[e.stage || 0];

    function menu(mark) {
      if (stopRun) stopRun();
      holder.innerHTML = '';
      const chip = v => h('button', { class: 'chip', 'aria-pressed': bpmNow() === v ? 'true' : 'false', onclick: () => { E.setSetting('ropeBpm', v); menu(mark); } }, v + ' bpm');
      holder.append(h('div', { class: 'card' },
        HowTo({ game: 'tightrope',
          goal: 'Walk the rope across the canyon by keeping a steady beat while the click fades away.',
          steps: ['After four clicks of count-in, play every beat: tap the pad, press the space bar, or switch on the mic and play on the guitar.',
            'Every ' + ROPE_BARS + ' bars the click plays less: ' + ROPE_STAGES.join(', then ') + '. Keep every beat going in between.',
            'The walker leans the way your timing goes: forward (right) when you rush, back (left) when you drag. The bar under the picture shows it too, and how many milliseconds early or late your last note was. A beat with no note jolts them.',
            'In the first ' + ROPE_BARS + ' bars the game learns your screen\'s or speaker\'s own delay, so a steady delay that isn\'t you doesn\'t count.'],
          scoring: ['10 to 20 points a beat, the most for a note right on it.', 'Worth half as much again with each thinner click: ×1.5 on 2 and 4, ×2 on 1, and so on.'],
          ends: 'when the walker leans too far and falls into the net.' }),
        h('div', { class: 'chips' }, h('span', { class: 'small muted', text: 'Tempo' }), BPMS.map(chip)),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: () => play() }, '▶ Step out'))),
      Leaderboard('tightrope', { mark, detail }));
    }

    function play() {
      if (stopRun) stopRun();
      holder.innerHTML = ''; A.ensure(); A.fresh();
      const bpm = bpmNow(), bd = 60 / bpm, lat = (E.state.settings.latencyMs || 0) / 1000;
      let lean = 0, score = 0, walked = 0, over = false, ended = false, raf = 0, stage = 0;
      const beats = new Map(); // beat number → { t, err }
      const errs = [];
      // your screen's own steady delay, learned while the click plays every beat (in beats)
      const delay = delayTracker(0.3, 3);
      const scene = Scene();
      const hud = h('div', { class: 'ud-hud mono' });
      const status = h('div', { class: 'phase', role: 'status' }, 'Count-in…');
      const meter = h('div', { class: 'tr-meter', 'aria-hidden': 'true' }, h('span', { class: 'tr-mid' }), h('span', { class: 'tr-dot' }));
      const words = h('div', { class: 'small mono tr-words' }, h('span', { text: '← dragging' }), h('span', { class: 'tr-last' }), h('span', { text: 'rushing →' }));
      const stopBtn = h('button', { class: 'btn small' }, '■ Stop');
      const padHolder = h('div');
      holder.append(h('div', { class: 'card ud-card' }, h('div', { class: 'spread' }, h('b', { text: bpm + ' bpm' }), stopBtn), hud, h('div', { class: 'tr-wrap' }, scene.el), meter, words, status, padHolder));
      const drawHud = () => { hud.textContent = score.toLocaleString() + ' pts · ' + walked + ' steps · click on ' + ROPE_STAGES[stage]; };
      const showLean = () => { meter.lastChild.style.left = (50 - Math.max(-1, Math.min(1, lean)) * 50) + '%'; meter.classList.toggle('warn', Math.abs(lean) > 0.6); };
      // a beat is settled once its note came, or half a beat went by without one
      function settle(n, raw) {
        const b = beats.get(n); if (!b || b.done) return;
        b.done = true; walked = Math.max(walked, n + 1);
        if (raw !== null && n < ROPE_BARS * 4) delay.add(raw);
        const err = raw === null ? null : raw - delay.get();
        if (err === null && n < 4) return; // the first bar is for finding the beat: a late start doesn't jolt you
        lean = leanAfter(lean, err);
        if (err !== null) { score += ropePoints(err, stage); errs.push(err); words.children[1].textContent = Math.abs(err * bd * 1000) < 12 ? 'on it' : Math.round(Math.abs(err * bd * 1000)) + ' ms ' + (err < 0 ? 'early' : 'late'); }
        else words.children[1].textContent = 'missed a beat!';
        showLean(); drawHud();
        if (ropeFell(lean)) { scene.fall(); status.textContent = 'You fell into the net.'; over = true; loop.stop(); setTimeout(end, 1200); }
      }
      function onTap(ev) {
        if (over) return;
        const t = tapTime(ev, lat);
        let best = null, bdist = Infinity;
        beats.forEach((b, n) => { const d = Math.abs(t - b.t); if (!b.done && d < bdist) { bdist = d; best = n; } });
        if (best !== null && bdist < bd * 0.45) settle(best, (t - beats.get(best).t) / bd);
      }
      const pad = TapPad(onTap, 'Tap every beat (or space bar)', { mic: true });
      padHolder.append(pad.el);
      scene.el.addEventListener('pointerdown', ev => { ev.preventDefault(); onTap(ev); });
      const loop = A.Loop({
        steps: 4, stepDur: () => bd,
        onStep: (i, t, cycle) => {
          if (cycle === 0) { A.hit(i === 0 ? 'clickHi' : 'click', t, 0.9); return; }
          const n = (cycle - 1) * 4 + i, st = ropeStage(n);
          if (ropeClick(st, n)) A.hit(n % 4 === 0 ? 'clickHi' : 'click', t, 0.9);
          beats.set(n, { t, done: false });
        },
        onVisual: (i, cycle) => {
          if (cycle === 0) { status.textContent = 'Count-in: ' + (i + 1); return; }
          const n = (cycle - 1) * 4 + i, st = ropeStage(n);
          if (st !== stage) { stage = st; drawHud(); }
          status.textContent = 'Bar ' + cycle + ' · the click plays ' + ROPE_STAGES[stage];
        }
      });
      function frame() {
        if (over) return;
        const now = A.heard();
        beats.forEach((b, n) => { if (!b.done && now > b.t + bd * 0.5) settle(n, null); });
        beats.forEach((b, n) => { if (b.done && b.t < now - 4 * bd) beats.delete(n); });
        let pos = 0; beats.forEach((b, n) => { if (b.t <= now) pos = Math.max(pos, n + Math.min(1, (now - b.t) / bd)); });
        scene.draw(pos, lean);
        if (!over) raf = requestAnimationFrame(frame);
      }
      function cleanup() { over = true; loop.stop(); cancelAnimationFrame(raf); pad.cleanup(); ctx.setActive(false); stopRun = null; }
      function end() {
        if (ended || !holder.isConnected) return;
        ended = true; cleanup();
        const acc = errs.length ? errs.reduce((a, e) => a + Math.max(0, 1 - Math.abs(e) / 0.25), 0) / errs.length : 0;
        // the beat kept with the click on 1 of every other bar is the gym's "One click per two bars"
        if (stage >= 3) { E.record('tuplets', 'disp-bar', acc >= 0.7, { score: acc }); if (hooks.signal) hooks.signal('gym:disp-bar', { score: acc }); ctx.tick(1); }
        const mean = errs.length ? errs.reduce((a, e) => a + e, 0) / errs.length * bd * 1000 : 0;
        const t = Date.now(), rank = score > 0 ? E.addGameScore('tightrope', { s: score, t, beats: walked, bpm, stage }) : 0;
        holder.innerHTML = '';
        holder.append(endCard({ title: 'Tightrope', score, rank, again: () => play(),
          lines: [walked + ' steps, as far as the click on ' + ROPE_STAGES[stage] + '.', errs.length ? 'On average you played ' + (Math.abs(mean) < 8 ? 'right on the beat.' : Math.round(Math.abs(mean)) + ' ms ' + (mean < 0 ? 'early: you rush a little.' : 'late: you drag a little.')) : ''],
          extra: h('button', { class: 'btn', onclick: () => menu(t) }, 'Change tempo') }),
        Leaderboard('tightrope', { mark: t, detail }));
      }
      stopBtn.onclick = () => end();
      stopRun = () => { if (!over) cleanup(); };
      drawHud(); showLean(); scene.draw(0, 0);
      loop.start(); ctx.setActive(true);
      raf = requestAnimationFrame(frame);
    }
    menu();
    return () => { if (stopRun) stopRun(); };
  }
});
