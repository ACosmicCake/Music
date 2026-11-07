/* World Woodshed — Firefly Hunt: the fretboard as a game. Each round names a note (later two): catch every
   firefly by tapping every place that note sits on the neck, frets 0 to 12, before they fade. A wrong tap costs
   two seconds; a round that runs out costs one of three lives. Natural notes first, then sharps and flats, then
   two notes at once. Every tap counts in the Fretboard notes skill (on the string you tapped). With the mic on,
   playing the note catches its lowest firefly still out. */
import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import Mic from '../listen.js';
import { h, tool, Fretboard, positionsOfPc } from '../ui/core.js';
import { MicToggle } from '../ui/mic.js';
import { FIREFLY_PENALTY, fireflyRound, fireflyPoints } from '../games.js';
import { Leaderboard, endCard } from '../ui/games.js';
import './games.css';

const NATURAL = [0, 2, 4, 5, 7, 9, 11];

tool('firefly', {
  tab: 'play', skill: 'fretboard', game: 'firefly', title: 'Firefly Hunt', eyebrow: 'Game · Fretboard notes',
  desc: 'A note is named: catch every firefly by tapping each place it sits on the neck before they fade. Three lives.',
  render(body, ctx) {
    const holder = h('div', { class: 'stack' }); body.append(holder);
    let cleanupRun = null;
    const detail = e => 'Round ' + e.round + ' · ' + e.found + ' fireflies';

    function menu(mark) {
      if (cleanupRun) cleanupRun();
      holder.innerHTML = '';
      holder.append(h('div', { class: 'card' },
        h('p', { text: 'Each round names a note. Fireflies hide at every place it sits on the neck, frets 0 to 12, on every string: tap them all before they fade.' }),
        h('p', { class: 'small', text: 'A wrong tap costs ' + FIREFLY_PENALTY + ' seconds. Natural notes first, then sharps and flats, then two notes at once. Three lives.' }),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: () => play() }, '▶ Start the hunt'))),
      Leaderboard('firefly', { mark, detail }));
    }

    function play() {
      if (cleanupRun) cleanupRun();
      holder.innerHTML = ''; A.ensure(); ctx.setActive(true);
      let round = 0, lives = 3, score = 0, found = 0, targets = [], left = [], deadline = 0, raf = 0, alive = true, between = true;
      const timers = [];
      const hud = h('div', { class: 'tw-hud mono' });
      const prompt = h('div', { class: 'prompt', role: 'status' });
      const sub = h('p', { class: 'small muted' });
      const timeBar = h('div', { class: 'tw-time ff-time' }, h('span'));
      const stopBtn = h('button', { class: 'btn small ghost', onclick: () => end() }, 'Stop');
      const fb = Fretboard({ onTap: (si, f) => tap(si, f, false), label: 'Guitar fretboard: tap every place the named note sits' });
      const mic = MicToggle({ label: 'Catch them by playing', onLabel: 'Listening: play the notes', hint: 'Each note you play catches its lowest firefly still out.',
        onOn: () => { micOff = Mic.on('note', ev => { const m = Math.round(ev.midi); const hit = left.filter(x => E.STRINGS[x.s].midi + x.f === m).sort((a, b) => a.f - b.f)[0]; if (hit) tap(hit.s, hit.f, true); }); },
        onOff: () => { if (micOff) micOff(); micOff = null; } });
      let micOff = null;
      holder.append(h('div', { class: 'card ff-card' }, h('div', { class: 'spread' }, prompt, stopBtn), hud, timeBar, sub, h('div', { class: 'ff-neck' }, fb.el), mic.el));
      const drawHud = () => { hud.textContent = score.toLocaleString() + ' pts · round ' + (round + 1) + ' · ' + '♥'.repeat(lives) + '♡'.repeat(3 - lives) + ' · ' + (targets.length - left.length) + ' of ' + targets.length + ' found'; };
      const caught = [], misses = [];
      const paint = () => fb.mark(caught.map(x => ({ s: x.s, f: x.f, kind: 'good', label: D.NOTE_NAMES[x.p] })).concat(misses.map(x => ({ s: x.s, f: x.f, kind: 'bad', label: '✕' }))));

      function start() {
        const r = fireflyRound(round);
        const pool = r.accidentals ? [...Array(12).keys()] : NATURAL;
        const a = pool[Math.floor(Math.random() * pool.length)];
        let pcs = [a];
        if (r.two) { const b = (a + [7, 5, 4, 3][Math.floor(Math.random() * 4)]) % 12; pcs = [a, b]; }
        targets = positionsOfPc(pcs, 12); left = targets.slice(); caught.length = 0; misses.length = 0;
        prompt.textContent = 'Find every ' + pcs.map(p => D.NOTE_FULL[p]).join(' and every ');
        sub.textContent = targets.length + ' fireflies are hiding, frets 0 to 12.';
        paint(); drawHud();
        deadline = performance.now() + r.secs * 1000; between = false;
        const tick = () => {
          if (!alive || between) return;
          const rem = Math.max(0, deadline - performance.now()), full = fireflyRound(round).secs * 1000;
          timeBar.firstChild.style.width = (100 * rem / full) + '%';
          timeBar.classList.toggle('low', rem < 4000);
          if (rem <= 0) { finish(false); return; }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }
      function tap(si, f, heard) {
        if (between) return;
        const midi = E.STRINGS[si].midi + f, p = midi % 12;
        if (!heard) A.note(midi, A.now() + 0.01, 0.75, 0.8);
        if (caught.some(x => x.s === si && x.f === f)) return;
        const i = left.findIndex(x => x.s === si && x.f === f);
        const ok = i >= 0;
        // the Fretboard notes skill is a note on one string; a wrong tap is confused with the note tapped
        const target = ok ? p : (targets.find(x => x.s === si) || targets[0]).p;
        E.record('fretboard', E.STRINGS[si].id + ':' + target, ok, { confused: E.STRINGS[si].id + ':' + p });
        ctx.tick(1);
        if (ok) { caught.push(left.splice(i, 1)[0]); found++; }
        else { misses.push({ s: si, f }); deadline -= FIREFLY_PENALTY * 1000; sub.textContent = 'That was ' + D.NOTE_FULL[p] + '. −' + FIREFLY_PENALTY + ' seconds.'; }
        paint(); drawHud();
        if (!left.length) finish(true);
      }
      function finish(ok) {
        between = true; cancelAnimationFrame(raf);
        const secsLeft = Math.max(0, (deadline - performance.now()) / 1000);
        if (ok) {
          const pts = fireflyPoints(targets.length, secsLeft, round);
          score += pts;
          prompt.textContent = 'All caught! +' + pts;
          sub.textContent = Math.round(secsLeft) + ' seconds to spare.';
        } else {
          lives--;
          fb.mark(caught.map(x => ({ s: x.s, f: x.f, kind: 'good', label: D.NOTE_NAMES[x.p] })).concat(left.map(x => ({ s: x.s, f: x.f, kind: 'root', label: D.NOTE_NAMES[x.p] }))));
          prompt.textContent = 'They faded. ' + left.length + ' got away (gold).';
          sub.textContent = lives ? 'Look where they were, then the next round.' : '';
        }
        round++; drawHud();
        timers.push(setTimeout(() => { if (!alive) return; if (lives <= 0) end(); else start(); }, ok ? 1400 : 3200));
      }
      function cleanup() { alive = false; between = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout); mic.cleanup(); ctx.setActive(false); cleanupRun = null; }
      function end() {
        if (!alive) return;
        cleanup();
        const t = Date.now(), rank = score > 0 ? E.addGameScore('firefly', { s: score, t, round, found }) : 0;
        holder.innerHTML = '';
        holder.append(endCard({ title: 'Firefly Hunt', score, rank, again: () => play(),
          lines: [found + ' fireflies caught over ' + round + ' round' + (round === 1 ? '' : 's') + '.', 'Every tap counted in your Fretboard notes progress.'],
          extra: h('button', { class: 'btn', onclick: () => menu(t) }, 'High scores') }),
        Leaderboard('firefly', { mark: t, detail }));
      }
      cleanupRun = () => { if (alive) cleanup(); };
      start();
    }
    menu();
    return () => { if (cleanupRun) cleanupRun(); };
  }
});
