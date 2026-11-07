/* World Woodshed — Parrot: echo a rhythm that grows. A bird whistles a phrase over the click and you play it
   straight back; every round it keeps the phrase and adds a beat, as a memory game does, until you slip. A slip
   costs one of three feathers and the same phrase comes again. Phrases are made of sixteenth cells, syncopated
   ones from five beats on. Every round counts in the gym's Echo exercises. Rules in src/games.js. */
import A from '../audio.js';
import E from '../engine.js';
import { h, s, tool, hooks } from '../ui/core.js';
import { TapPad, tapTime } from './rhythm.js';
import { matchTaps, parrotCell, phraseNotes, echoPassed, echoPoints } from '../games.js';
import { Leaderboard, endCard } from '../ui/games.js';
import './games.css';

const BPMS = [60, 75, 90, 105];
const SONG = [84, 86, 88, 91, 93, 96, 98]; // the bird's notes, a high pentatonic

/* A short whistle: a sine that slides up into its note */
function whistle(midi, when) {
  A.ensure();
  const ac = A.out().context, f = A.mtof(midi);
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(f * 0.85, when); o.frequency.exponentialRampToValueAtTime(f, when + 0.035);
  g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(0.32, when + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, when + 0.14);
  o.connect(g); g.connect(A.out()); o.start(when); o.stop(when + 0.16);
  return o;
}

/* The bird on its branch, and the phrase as a row of dots under it */
function Scene() {
  const svg = s('svg', { viewBox: '0 0 300 150', class: 'pr-scene', role: 'img', 'aria-label': 'A parrot on a branch, and the phrase as a row of dots' });
  const bird = s('g', { class: 'pr-bird' }), beak = s('path', { class: 'pr-beak', d: 'M38 -6 L50 -2 L38 2 Z' }), row = s('g'), cursor = s('line', { class: 'pr-cursor', x1: 0, x2: 0, y1: 104, y2: 140 });
  bird.append(s('path', { class: 'pr-tail', d: 'M-6 18 L-26 52 L-12 50 L-2 24 Z' }), s('ellipse', { class: 'pr-body', cx: 8, cy: 8, rx: 20, ry: 24 }),
    s('path', { class: 'pr-wing', d: 'M-4 0 Q8 26 22 30 Q6 30 -6 14 Z' }), s('circle', { class: 'pr-head', cx: 26, cy: -8, r: 14 }),
    s('circle', { class: 'pr-eye', cx: 30, cy: -11, r: 2.4 }), beak);
  bird.setAttribute('transform', 'translate(60 52)');
  svg.append(s('path', { class: 'pr-branch', d: 'M0 86 Q120 74 300 82' }), bird, row, cursor);
  let len = 1;
  const xOf = b => 20 + (b / len) * 260;
  return {
    el: svg,
    set(ns, beats) {
      len = beats; row.innerHTML = '';
      for (let b = 0; b <= beats; b++) row.append(s('line', { class: 'pr-beat', x1: xOf(b), x2: xOf(b), y1: 110, y2: 134 }));
      ns.forEach((b, i) => row.append(s('circle', { class: 'pr-dot', cx: xOf(b), cy: 122, r: Math.max(3, Math.min(7, 70 / ns.length)), 'data-i': i })));
    },
    dot(i, cls) { const d = row.querySelector(`[data-i="${i}"]`); if (d) d.setAttribute('class', 'pr-dot ' + cls); },
    hideDots(on) { row.classList.toggle('pr-hidden', on); },
    cursor(b) { const x = b === null ? -10 : xOf(Math.max(0, Math.min(len, b))); cursor.setAttribute('x1', x); cursor.setAttribute('x2', x); },
    sing(on) { beak.setAttribute('d', on ? 'M38 -8 L50 -6 L38 -2 M38 0 L48 4 L38 4 Z' : 'M38 -6 L50 -2 L38 2 Z'); bird.classList.toggle('hop', on); }
  };
}

tool('parrot', {
  tab: 'rhythm', skill: 'tuplets', game: 'parrot', title: 'Parrot', eyebrow: 'Game · Rhythm gym',
  desc: 'A parrot whistles a rhythm and you play it straight back. Each round it adds a beat, until you slip. Three feathers.',
  render(body, ctx) {
    const holder = h('div', { class: 'stack' }); body.append(holder);
    let stopRun = null;
    const bpmNow = () => (BPMS.includes(E.state.settings.parrotBpm) ? E.state.settings.parrotBpm : 75);
    const detail = e => 'Longest phrase ' + e.beats + ' beat' + (e.beats === 1 ? '' : 's') + ' · ' + e.bpm + ' bpm';

    function menu(mark) {
      if (stopRun) stopRun();
      holder.innerHTML = '';
      const chip = v => h('button', { class: 'chip', 'aria-pressed': bpmNow() === v ? 'true' : 'false', onclick: () => { E.setSetting('parrotBpm', v); menu(mark); } }, v + ' bpm');
      holder.append(h('div', { class: 'card' },
        h('p', { text: 'After a bar of count-in the parrot whistles a phrase, and you play it back straight after, on the click. Each round keeps the phrase and adds a beat. Count “1 e & a” to place the sixteenths.' }),
        h('div', { class: 'chips' }, h('span', { class: 'small muted', text: 'Tempo' }), BPMS.map(chip)),
        h('p', { class: 'small muted', text: 'Tap, use the space bar, or switch on the mic and play it on your guitar.' }),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: () => play() }, '▶ Start'))),
      Leaderboard('parrot', { mark, detail }));
    }

    function play() {
      if (stopRun) stopRun();
      holder.innerHTML = ''; A.ensure(); A.fresh();
      const bpm = bpmNow(), bd = 60 / bpm, lat = (E.state.settings.latencyMs || 0) / 1000, win = Math.max(0.05, Math.min(0.09, bd / 4 * 0.45));
      const cells = [parrotCell(Math.random, 1), parrotCell(Math.random, 2)];
      let feathers = 3, score = 0, best = 0, alive = true, ended = false, raf = 0, taps = [], plan = null;
      const timers = [], sounds = [];
      const later = (fn, ms) => timers.push(setTimeout(() => { if (alive) fn(); }, ms));
      const scene = Scene();
      const hud = h('div', { class: 'ud-hud mono' });
      const status = h('div', { class: 'phase', role: 'status' });
      const stopBtn = h('button', { class: 'btn small' }, '■ Stop');
      const padHolder = h('div');
      holder.append(h('div', { class: 'card ud-card' }, h('div', { class: 'spread' }, h('b', { text: bpm + ' bpm' }), stopBtn), hud, h('div', { class: 'pr-wrap' }, scene.el), status, padHolder));
      const drawHud = () => { hud.textContent = score.toLocaleString() + ' pts · ' + '🪶'.repeat(feathers) + ' · phrase of ' + cells.length + ' beats'; };
      const pad = TapPad(ev => { if (plan) { taps.push(tapTime(ev, lat)); markTap(taps[taps.length - 1]); } }, 'Tap it back (or space bar)', { mic: true });
      padHolder.append(pad.el);
      scene.el.addEventListener('pointerdown', ev => { ev.preventDefault(); if (plan) { taps.push(tapTime(ev, lat)); markTap(taps[taps.length - 1]); } });
      function markTap(t) {
        if (!plan || t < plan.back - win) return;
        plan.exp.forEach((x, i) => { if (Math.abs(x - t) <= win) scene.dot(i, 'hit'); });
      }

      function round() {
        const L = cells.length, notes = phraseNotes(cells), t0 = A.now() + 0.3;
        const phrase = t0 + 4 * bd, back = phrase + L * bd, endT = back + L * bd;
        taps = [];
        plan = { t0, phrase, back, endT, exp: notes.map(b => back + b * bd), sung: notes.map(b => phrase + b * bd), notes, L };
        scene.set(notes, L); scene.hideDots(false);
        drawHud();
        // the click: a count-in bar, then every beat through the phrase and your turn
        const total = 4 + 2 * L;
        for (let b = 0; b < total; b++) sounds.push(A.hit(b === 0 || b === 4 || b === 4 + L ? 'clickHi' : 'click', t0 + b * bd, b < 4 ? 0.9 : 0.6));
        notes.forEach((b, i) => sounds.push(whistle(SONG[(i * 3 + Math.round(b * 4)) % SONG.length], phrase + b * bd)));
        later(() => judge(), (endT + win - A.now()) * 1000 + 80);
      }
      function judge() {
        const p = plan; plan = null;
        const m = matchTaps(p.exp, taps.filter(t => t >= p.back - win && t <= p.endT + win), win);
        const ok = echoPassed(m);
        const item = p.L >= 5 ? 'echo4' : 'echo2';
        E.record('tuplets', item, ok, { score: m.rate });
        if (hooks.signal) hooks.signal('gym:' + item, { score: m.rate });
        ctx.tick(1);
        m.errs.forEach((e, i) => scene.dot(i, e === null ? 'miss' : 'hit'));
        if (ok) {
          score += echoPoints(m, win) * p.L; best = Math.max(best, p.L);
          cells.push(parrotCell(Math.random, cells.length + 1));
          status.textContent = 'Squawk! Perfect echo. Now ' + cells.length + ' beats.';
        } else {
          feathers--;
          status.textContent = (m.hits < m.errs.length ? (m.errs.length - m.hits) + ' note' + (m.errs.length - m.hits === 1 ? '' : 's') + ' missed' : 'Extra notes') + '. ' + (feathers ? 'The same phrase again.' : '');
        }
        drawHud();
        if (feathers <= 0) { later(end, 1500); return; }
        later(round, 1600);
      }
      function frame() {
        if (!alive) return;
        const now = A.heard();
        if (plan) {
          const singing = plan.sung.some(t => now >= t && now < t + 0.1);
          scene.sing(singing);
          if (now < plan.phrase) { status.textContent = 'Count-in… listen'; scene.cursor(null); }
          else if (now < plan.back) { status.textContent = 'Listen to the parrot'; scene.cursor((now - plan.phrase) / bd); }
          else if (now < plan.endT) { if (status.textContent !== 'Your turn: play it back') { status.textContent = 'Your turn: play it back'; scene.hideDots(plan.L >= 4); } scene.cursor((now - plan.back) / bd); }
        } else { scene.sing(false); scene.cursor(null); }
        raf = requestAnimationFrame(frame);
      }
      function cleanup() {
        alive = false; timers.forEach(clearTimeout); cancelAnimationFrame(raf); pad.cleanup(); A.fresh();
        sounds.forEach(o => { try { if (o && o.stop) o.stop(); } catch (e) { /* done */ } });
        ctx.setActive(false); stopRun = null;
      }
      function end() {
        if (ended || !holder.isConnected) return;
        ended = true; cleanup();
        const t = Date.now(), rank = score > 0 ? E.addGameScore('parrot', { s: score, t, beats: best, bpm }) : 0;
        holder.innerHTML = '';
        holder.append(endCard({ title: 'Parrot', score, rank, again: () => play(),
          lines: [best ? 'Your longest echo: ' + best + ' beats.' : 'No phrase echoed this time.', 'Every round counted in the gym\'s Echo exercises.'],
          extra: h('button', { class: 'btn', onclick: () => menu(t) }, 'Change tempo') }),
        Leaderboard('parrot', { mark: t, detail }));
      }
      stopBtn.onclick = () => end();
      stopRun = () => { if (alive) cleanup(); };
      ctx.setActive(true);
      round(); raf = requestAnimationFrame(frame);
    }
    menu();
    return () => { if (stopRun) stopRun(); };
  }
});
