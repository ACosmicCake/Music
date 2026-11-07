/* World Woodshed — Lighthouse Keeper: scale degrees as a game. A cadence sets the harbour's key when you
   arrive; then ships sail in out of the dark, each sounding one note on its horn. Light the lamp for its degree
   (1, ♭3, 5…) before the ship reaches the rocks and it turns safely into harbour; a wrong lamp or none and it is
   wrecked. Eight ships to a harbour, then a new key, less time and, from the third harbour, a degree you
   haven't opened yet. Three wrecks end the run. Every answer counts in the Scale degrees skill. */
import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import { h, s, tool, rand, noteName } from '../ui/core.js';
import { SHIPS, WRECKS, harbourSecs, harbourTier, shipPoints } from '../games.js';
import { Leaderboard, endCard } from '../ui/games.js';
import './games.css';

function cadence(t, at) {
  const I = [t - 12, t - 5, t, t + 4], IV = [t - 7, t - 3, t, t + 5], V = [t - 5, t - 1, t + 2, t + 7];
  [I, IV, V, I].forEach((c, i) => A.strum(c, at + i * 0.6, 0.6, 0.02, 0.8));
  return at + 4 * 0.6;
}

/* The harbour at night: sea, rocks, the lighthouse and its beam, and the ship coming in */
function Scene() {
  const svg = s('svg', { viewBox: '0 0 320 170', class: 'lh-scene', role: 'img', 'aria-label': 'A lighthouse on the rocks at night and a ship sailing towards it' });
  const beam = s('path', { class: 'lh-beam', d: 'M262 50 L40 20 L40 95 Z' });
  const ship = s('g', { class: 'lh-ship' });
  ship.append(s('path', { class: 'lh-hull', d: 'M-22 0 L22 0 L15 10 L-15 10 Z' }), s('line', { class: 'lh-mast', x1: 0, y1: 0, x2: 0, y2: -30 }),
    s('path', { class: 'lh-sail', d: 'M2 -28 L20 -4 L2 -4 Z' }), s('path', { class: 'lh-sail b', d: 'M-2 -24 L-16 -4 L-2 -4 Z' }), s('circle', { class: 'lh-lamp', cx: -18, cy: -2, r: 2 }));
  const stars = s('g');
  for (let k = 0; k < 14; k++) stars.append(s('circle', { class: 'lh-star', cx: (k * 53) % 300 + 10, cy: (k * 29) % 60 + 6, r: k % 3 ? 0.8 : 1.3 }));
  svg.append(s('rect', { class: 'lh-sky', x: 0, y: 0, width: 320, height: 170 }), stars, beam,
    s('rect', { class: 'lh-sea', x: 0, y: 110, width: 320, height: 60 }),
    s('path', { class: 'lh-wave', d: 'M0 122 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0' }),
    ship,
    s('path', { class: 'lh-rock', d: 'M220 170 L228 128 L246 116 L276 112 L300 124 L312 170 Z' }),
    s('path', { class: 'lh-tower', d: 'M254 116 L258 52 L272 52 L276 116 Z' }), s('path', { class: 'lh-stripe', d: 'M256.5 80 L273.5 80 L274.5 92 L255.5 92 Z' }),
    s('rect', { class: 'lh-room', x: 255, y: 40, width: 20, height: 12 }), s('path', { class: 'lh-cap', d: 'M252 40 L265 28 L278 40 Z' }));
  let anim = null;
  return {
    el: svg,
    sail(secs) {
      if (anim) anim.cancel();
      ship.setAttribute('class', 'lh-ship');
      anim = ship.animate([{ transform: 'translate(-30px, 112px)' }, { transform: 'translate(212px, 112px)' }], { duration: secs * 1000, easing: 'linear', fill: 'forwards' });
    },
    safe() { if (anim) anim.pause(); ship.setAttribute('class', 'lh-ship safe'); beam.setAttribute('class', 'lh-beam on'); setTimeout(() => beam.setAttribute('class', 'lh-beam'), 900); },
    wreck() { if (anim) anim.pause(); ship.setAttribute('class', 'lh-ship wreck'); },
    hide() { if (anim) anim.cancel(); ship.setAttribute('class', 'lh-ship gone'); },
    stop() { if (anim) anim.cancel(); }
  };
}

tool('lighthouse', {
  tab: 'ear', skill: 'degrees', game: 'lighthouse', title: 'Lighthouse Keeper', eyebrow: 'Game · Scale degrees',
  desc: 'A cadence sets the key, then ships sound one note each on their horns. Light the lamp for its degree before they reach the rocks. Three wrecks and the run is over.',
  render(body, ctx) {
    const holder = h('div', { class: 'stack' }); body.append(holder);
    let timers = [], alive = true, scene = null;
    const later = (fn, ms) => { timers.push(setTimeout(() => { if (alive) fn(); }, ms)); };
    const clear = () => { timers.forEach(clearTimeout); timers = []; if (scene) scene.stop(); };
    const detail = e => 'Harbour ' + (e.harbour + 1) + ' · ' + e.ships + ' ships home';

    function menu(mark) {
      clear(); holder.innerHTML = ''; ctx.setActive(false);
      holder.append(h('div', { class: 'card' },
        h('p', { text: 'At each harbour a cadence sets the key. Then ships come in one at a time, each sounding one note. Name the note\'s degree in the key and the lighthouse guides it home.' }),
        h('p', { class: 'small', text: SHIPS + ' ships to a harbour; each new harbour is a new key with less time, and from the third, a degree you haven\'t opened yet. Hold the key in your head: hearing it again takes time.' }),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: () => play() }, '▶ Light the lamp'))),
      Leaderboard('lighthouse', { mark, detail }));
    }

    function play() {
      clear(); holder.innerHTML = ''; A.ensure(); A.fresh(); ctx.setActive(true);
      let harbour = 0, ship = 0, wrecks = 0, score = 0, home = 0, tonic = 60, q = null, answered = true, t0 = 0;
      scene = Scene();
      const hud = h('div', { class: 'tw-hud mono' });
      const where = h('div', { class: 'eyebrow' });
      const timeBar = h('div', { class: 'tw-time' }, h('span'));
      const prompt = h('div', { class: 'prompt', role: 'status' });
      const choices = h('div', { class: 'choices' });
      const keyBtn = h('button', { class: 'btn small', onclick: () => { A.fresh(); cadence(tonic, A.now() + 0.05); } }, '↻ Hear the key');
      const hornBtn = h('button', { class: 'btn small', onclick: () => { if (q) { A.fresh(); horn(q.midi, 0.05); } } }, '📯 Horn again');
      const stopBtn = h('button', { class: 'btn small ghost', onclick: () => end() }, 'Stop');
      holder.append(h('div', { class: 'card tw-card' }, h('div', { class: 'spread' }, where, stopBtn), hud, h('div', { class: 'lh-wrap' }, scene.el), timeBar, prompt, choices, h('div', { class: 'row' }, hornBtn, keyBtn)));
      const drawHud = () => { hud.textContent = score.toLocaleString() + ' pts · ship ' + Math.min(ship + 1, SHIPS) + ' of ' + SHIPS + ' · ' + '⚓'.repeat(WRECKS - wrecks) + '✕'.repeat(wrecks); };
      const horn = (m, d) => A.tone(m, A.now() + d, 1.1, 0.32);
      const pool = () => {
        const tier = harbourTier(harbour, E.unlockedTier('degrees'));
        let ds = D.DEGREES.filter(d => d.tier <= tier);
        if (ds.length < 3) ds = D.DEGREES.slice(0, 3);
        return ds.slice().sort((a, b) => a.semi - b.semi);
      };
      function arrive() {
        const prev = tonic;
        do tonic = rand(55, 64); while (harbour > 0 && tonic === prev);
        ship = 0;
        where.textContent = 'Harbour ' + (harbour + 1) + ' · key of ' + noteName(tonic) + ' major';
        prompt.textContent = 'Arriving at harbour ' + (harbour + 1) + '. Listen to the key…';
        choices.innerHTML = ''; timeBar.hidden = true; scene.hide();
        drawHud();
        const at = cadence(tonic, A.now() + 0.1);
        later(nextShip, (at - A.now()) * 1000 + 500);
      }
      function nextShip() {
        const ds = pool(), dg = E.pick('degrees', E.universe('degrees').filter(x => ds.some(d => d.id === x.id))) || ds[0];
        const deg = D.DEGREES.find(d => d.id === dg.id);
        q = { deg, midi: tonic + deg.semi };
        const secs = harbourSecs(harbour);
        prompt.textContent = 'A ship calls. Which degree?';
        choices.innerHTML = '';
        ds.forEach(d => choices.append(h('button', { class: 'choice', 'data-id': d.id, onclick: () => answer(d.id) }, h('b', { text: d.id }), h('span', { text: d.solf + ' · ' + d.sargam }))));
        answered = false; drawHud();
        scene.sail(secs + 1.2);
        horn(q.midi, 0.15);
        timeBar.hidden = false;
        const bar = timeBar.firstChild; bar.style.transition = 'none'; bar.style.width = '100%';
        const mine = q;
        later(() => {
          t0 = performance.now();
          requestAnimationFrame(() => { bar.style.transition = 'width ' + secs + 's linear'; bar.style.width = '0%'; });
          later(() => { if (q === mine && !answered) answer(null); }, secs * 1000);
        }, 1200);
        t0 = performance.now() + 1200;
      }
      function answer(id) {
        if (answered || !q) return;
        answered = true;
        const ok = id === q.deg.id, rt = Math.max(0, (performance.now() - t0) / 1000), secs = harbourSecs(harbour);
        E.record('degrees', q.deg.id, ok, { confused: id || undefined, rt: rt * 1000 });
        ctx.tick(1);
        timeBar.firstChild.style.transition = 'none';
        [...choices.children].forEach(b => { b.disabled = true; if (b.dataset.id === q.deg.id) b.classList.add('correct'); else if (b.dataset.id === id) b.classList.add('wrong'); });
        if (ok) { score += shipPoints(rt, secs, harbour); home++; scene.safe(); prompt.textContent = 'Degree ' + q.deg.id + ' (' + q.deg.solf + '). Safe in harbour!'; }
        else {
          wrecks++; scene.wreck();
          prompt.textContent = (id ? 'Not ' + id + ': it was ' : 'Too late: it was ') + q.deg.id + ' (' + q.deg.solf + '). Hear it from the tonic.';
          // the tonic, then the note: the way back to hearing it
          later(() => { A.note(tonic, A.now() + 0.05, 0.7, 0.8); A.note(q.midi, A.now() + 0.7, 0.85, 1.2); }, 500);
        }
        ship++; drawHud();
        if (wrecks >= WRECKS) { later(end, 2200); return; }
        if (ship >= SHIPS) { harbour++; later(arrive, ok ? 1300 : 2600); return; }
        later(nextShip, ok ? 1200 : 2600);
      }
      function end() {
        clear(); ctx.setActive(false);
        const t = Date.now(), rank = score > 0 ? E.addGameScore('lighthouse', { s: score, t, harbour, ships: home }) : 0;
        holder.innerHTML = '';
        holder.append(endCard({ title: 'Lighthouse Keeper', score, rank, again: () => play(),
          lines: [home + ' ship' + (home === 1 ? '' : 's') + ' guided home, as far as harbour ' + (harbour + 1) + '.', 'Every answer counted in your Scale degrees progress.'],
          extra: h('button', { class: 'btn', onclick: () => menu(t) }, 'High scores') }),
        Leaderboard('lighthouse', { mark: t, detail }));
      }
      arrive();
    }
    menu();
    return () => { alive = false; clear(); };
  }
});
