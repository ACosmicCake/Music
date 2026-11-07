/* World Woodshed — The Tower: interval training as a climb. A princess sings two notes from her window at the
   top of a tower; name the interval and you climb a step, miss it and you slip down one. Twelve steps to a
   tower; each tower climbed opens the next, which sings falling intervals, then both, then both notes at once,
   with less time to answer. Five wrong answers end the run. Every answer counts in the Intervals skill, the
   same as the Intervals quiz. Scores go on your own table (src/games.js). */
import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import { h, s, tool, rand } from '../ui/core.js';
import { TOWER, TOWER_HEARTS, towerStage, climb, towerPoints } from '../games.js';
import { Leaderboard, endCard } from '../ui/games.js';
import './games.css';

const ROOFS = ['--c-tech', '--c-ear', '--patina', '--c-fret', '--brass'];
const ivOf = id => D.INTERVALS.find(i => i.id === id);
const dirWord = { up: 'rising', down: 'falling', harm: 'together' };

/* Her voice: a sawtooth through three vowel formants ("ah"), with vibrato that grows after the attack */
function Voice() {
  const live = new Set();
  function sing(midi, when, dur, vel = 0.5) {
    A.ensure();
    const ac = A.out().context, f = A.mtof(midi);
    const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
    const lfo = ac.createOscillator(), depth = ac.createGain(); lfo.frequency.value = 5.4;
    depth.gain.setValueAtTime(0, when); depth.gain.linearRampToValueAtTime(f * 0.012, when + Math.min(0.5, dur * 0.6));
    lfo.connect(depth); depth.connect(o.frequency);
    const env = ac.createGain();
    env.gain.setValueAtTime(0.0001, when); env.gain.exponentialRampToValueAtTime(vel, when + 0.09);
    env.gain.setValueAtTime(vel, when + dur - 0.05); env.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.25);
    [[800, 6, 1], [1150, 8, 0.5], [2900, 10, 0.22]].forEach(([fr, q, g]) => {
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = q;
      const gg = ac.createGain(); gg.gain.value = g * 2.2;
      o.connect(bp); bp.connect(gg); gg.connect(env);
    });
    env.connect(A.out());
    o.start(when); lfo.start(when); o.stop(when + dur + 0.3); lfo.stop(when + dur + 0.3);
    const rec = { o, lfo, env }; live.add(rec); o.onended = () => live.delete(rec);
  }
  function hush() {
    if (!live.size) return;
    const t = A.out().context.currentTime;
    live.forEach(r => { try { r.env.gain.cancelScheduledValues(t); r.env.gain.setTargetAtTime(0.0001, t, 0.03); r.o.stop(t + 0.15); r.lfo.stop(t + 0.15); } catch (e) { /* already stopped */ } });
    live.clear();
  }
  return { sing, hush };
}

/* The tower as an SVG: stone, a turret with her window, twelve ledges winding up the front and you */
function Scene() {
  const W = 240, H = 360, ground = 338;
  const sx = i => { const k = (i % TOWER) / 6; return 88 + 64 * (k <= 1 ? k : 2 - k); };
  const sy = i => ground - 8 - (i % TOWER) * 18.5;
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'tw-scene', role: 'img', 'aria-label': 'A tower with a princess singing at the top window and you on the steps' });
  const tower = s('g'), notes = s('g'), me = s('g', { class: 'tw-me' });
  svg.append(tower, notes, me);
  // you: a traveller in a wide hat, with a lute on the back
  me.append(s('ellipse', { class: 'tw-lute', cx: -5, cy: -12, rx: 4, ry: 6 }), s('rect', { class: 'tw-body', x: -4, y: -16, width: 8, height: 12, rx: 3 }),
    s('circle', { class: 'tw-skin', cx: 0, cy: -21, r: 4.5 }), s('path', { class: 'tw-hat', d: 'M-8 -23 L8 -23 L3 -27 L-3 -27 Z' }), s('path', { class: 'tw-legs', d: 'M-2 -4 L-3 0 M2 -4 L3 0' }));
  function draw(n) {
    tower.innerHTML = '';
    const roof = `var(${ROOFS[n % ROOFS.length]})`;
    tower.append(
      s('rect', { class: 'tw-hill', x: 0, y: ground, width: W, height: H - ground }),
      s('rect', { class: 'tw-stone', x: 70, y: 96, width: 100, height: ground - 96 }),
      s('rect', { class: 'tw-stone', x: 92, y: 44, width: 56, height: 56 }),
      s('path', { d: 'M86 46 L120 6 L154 46 Z', style: 'fill:' + roof }),
      s('path', { class: 'tw-flag', d: 'M120 6 L120 -4 L132 0 L120 3', style: 'stroke:' + roof }),
      s('path', { class: 'tw-crenel', d: 'M66 96 h108 v-8 h-12 v5 h-10 v-5 h-12 v5 h-10 v-5 h-12 v5 h-10 v-5 h-12 v5 h-10 v-5 h-10 Z' }),
      s('path', { class: 'tw-window', d: 'M108 88 L108 66 Q120 52 132 66 L132 88 Z' }));
    // the bricks
    for (let y = 108; y < ground; y += 14) tower.append(s('line', { class: 'tw-brick', x1: 70, x2: 170, y1: y, y2: y }));
    // her: hair, a small crown, a face and her arms on the sill
    tower.append(s('path', { class: 'tw-hair', d: 'M111 82 Q110 64 120 63 Q130 64 129 82 Z' }), s('circle', { class: 'tw-skin', cx: 120, cy: 72, r: 6 }),
      s('path', { class: 'tw-crown', d: 'M114 66 L114 61 L117 63.5 L120 60 L123 63.5 L126 61 L126 66 Z' }),
      s('path', { class: 'tw-dress', d: 'M110 88 Q120 78 130 88 Z', style: 'fill:' + roof }), s('rect', { class: 'tw-sill', x: 104, y: 87, width: 32, height: 4, rx: 1 }));
    // the door and the ledges
    tower.append(s('path', { class: 'tw-door', d: 'M110 338 L110 318 Q120 306 130 318 L130 338 Z' }));
    for (let i = 1; i < TOWER; i++) tower.append(s('rect', { class: 'tw-ledge', x: sx(i) - 11, y: sy(i), width: 22, height: 4, rx: 1.5 }));
    tower.append(s('rect', { class: 'tw-ledge top', x: 100, y: sy(TOWER - 0.001) - 0, width: 40, height: 4 }));
  }
  function place(step, cls) {
    const i = step % TOWER, x = i === 0 ? 60 : sx(i), y = i === 0 ? ground : sy(i);
    me.style.transform = `translate(${x}px, ${y}px)`;
    me.classList.remove('slip', 'hop'); if (cls) requestAnimationFrame(() => me.classList.add(cls));
  }
  function sing() {
    for (let k = 0; k < 2; k++) {
      const n = s('text', { class: 'tw-note', x: 136 + k * 10, y: 70, style: 'animation-delay:' + (k * 0.7) + 's' }, k ? '♫' : '♪');
      notes.append(n); setTimeout(() => n.remove(), 2600);
    }
  }
  draw(0); place(0);
  return { el: svg, draw, place, sing, atTop: () => { me.style.transform = 'translate(150px, 100px)'; } };
}

tool('tower', {
  tab: 'ear', skill: 'intervals', game: 'tower', title: 'The Tower', eyebrow: 'Game · Intervals',
  desc: 'A princess sings two notes from the top of her tower. Name the interval to climb a step; miss it and you slip down one. Five wrong answers and the run is over.',
  render(body, ctx) {
    const holder = h('div', { class: 'stack' }); body.append(holder);
    const voice = Voice();
    let timers = [], alive = true;
    const later = (fn, ms) => { const id = setTimeout(() => { if (alive) fn(); }, ms); timers.push(id); };
    const clear = () => { timers.forEach(clearTimeout); timers = []; voice.hush(); };
    const sound = () => E.state.settings.towerSound || 'voice';
    const detail = e => 'Step ' + e.step + ' · ' + towerStage(e.tower || 0).name;

    function menu(mark) {
      clear(); holder.innerHTML = ''; ctx.setActive(false);
      const chip = (v, label) => h('button', { class: 'chip', 'aria-pressed': sound() === v ? 'true' : 'false', onclick: () => { E.setSetting('towerSound', v); menu(mark); } }, label);
      holder.append(h('div', { class: 'card' },
        h('p', { text: 'Each tower has ' + TOWER + ' steps. A right answer climbs one, a wrong one slips down one. Climb a tower and the next one opens: falling intervals, then both ways, then both notes at once, with less time to answer each tower.' }),
        h('div', { class: 'chips' }, h('span', { class: 'small muted', text: 'She sings with' }), chip('voice', 'Her voice'), chip('guitar', 'A guitar')),
        h('p', { class: 'small muted', text: 'The intervals are the ones you have opened in the Intervals quiz, and every answer counts there too.' }),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: () => play() }, '▶ Start climbing'))),
      Leaderboard('tower', { mark, detail }));
    }

    function play() {
      clear(); holder.innerHTML = ''; A.ensure(); A.fresh(); ctx.setActive(true);
      let step = 0, hearts = TOWER_HEARTS, points = 0, right = 0, asked = 0, q = null, answered = true, t0 = 0;
      const scene = Scene();
      const hud = h('div', { class: 'tw-hud mono' });
      const stageLbl = h('div', { class: 'eyebrow' });
      const timeBar = h('div', { class: 'tw-time' }, h('span'));
      const prompt = h('div', { class: 'prompt', role: 'status' });
      const choices = h('div', { class: 'choices tw-choices' });
      const again = h('button', { class: 'btn small', onclick: () => { if (q) { voice.hush(); A.fresh(); playIv(q, 0.05); } } }, '↻ Sing again');
      const nextBtn = h('button', { class: 'btn small primary', hidden: true, onclick: () => next() }, 'Next ▶');
      const giveUp = h('button', { class: 'btn small ghost', onclick: () => end() }, 'Stop');
      const card = h('div', { class: 'card tw-card' }, h('div', { class: 'spread' }, stageLbl, giveUp), hud, h('div', { class: 'tw-wrap' }, scene.el), timeBar, prompt, choices, h('div', { class: 'row' }, nextBtn, again));
      holder.append(card);
      const drawHud = () => { hud.textContent = points.toLocaleString() + ' pts · step ' + step + ' · ' + '♥'.repeat(hearts) + '♡'.repeat(TOWER_HEARTS - hearts); };

      function playIv(qq, delay) {
        const t = A.now() + delay, semi = ivOf(qq.iv).semi, lo = qq.root, hi = qq.root + semi;
        const one = (m, at, d) => (sound() === 'guitar' ? A.note(m - 12, at, 0.8, d + 0.4) : voice.sing(m, at, d));
        if (qq.dir === 'up') { one(lo, t, 0.65); one(hi, t + 0.75, 0.9); }
        else if (qq.dir === 'down') { one(hi, t, 0.65); one(lo, t + 0.75, 0.9); }
        else { one(lo, t, 1.4); one(hi, t, 1.4); }
        scene.sing();
      }
      // the items to ask: the intervals you have opened, in this tower's directions
      function pool(dirs) {
        const open = new Set(E.unlocked('intervals').map(x => x.id.split(':')[0]));
        let items = E.universe('intervals').filter(x => dirs.includes(x.id.split(':')[1]) && open.has(x.id.split(':')[0]));
        if (!items.length) items = E.universe('intervals').filter(x => dirs.includes(x.id.split(':')[1])).slice(0, 4);
        return items;
      }
      function ask() {
        const tower = Math.floor(step / TOWER), st = towerStage(tower);
        stageLbl.textContent = 'Tower ' + (tower + 1) + ' · ' + st.name;
        const items = pool(st.dirs);
        const item = E.pick('intervals', items) || items[0];
        const [iv, dir] = item.id.split(':');
        q = { item, iv, dir, root: rand(60, 69) };
        let ids = [...new Set(items.filter(x => x.id.endsWith(':' + dir)).map(x => x.id.split(':')[0]))];
        if (ids.length < 4) D.INTERVALS.forEach(x => { if (ids.length < 4 && !ids.includes(x.id)) ids.push(x.id); });
        prompt.textContent = 'She sings two notes, ' + dirWord[dir] + '. Which interval?';
        choices.innerHTML = '';
        D.INTERVALS.filter(x => ids.includes(x.id)).forEach(x => choices.append(h('button', { class: 'choice', onclick: () => answer(x.id) }, h('b', { text: x.id }), h('span', { class: 'small', text: x.name }))));
        answered = false;
        playIv(q, 0.1);
        // the clock starts when she has sung
        const ttl = st.secs;
        timeBar.hidden = !ttl;
        const bar = timeBar.firstChild; bar.style.transition = 'none'; bar.style.width = '100%';
        const qNow = q;
        later(() => {
          t0 = performance.now();
          if (!ttl) return;
          requestAnimationFrame(() => { bar.style.transition = 'width ' + ttl + 's linear'; bar.style.width = '0%'; });
          later(() => { if (q === qNow && !answered) answer(null); }, ttl * 1000);
        }, 1600);
        if (!t0) t0 = performance.now();
      }
      function answer(id) {
        if (answered || !q) return;
        answered = true; asked++;
        const ok = id === q.iv, rt = (performance.now() - t0) / 1000, st = towerStage(Math.floor(step / TOWER));
        E.record('intervals', q.item.id, ok, { confused: id ? id + ':' + q.dir : undefined, rt: rt * 1000 });
        ctx.tick(1);
        [...choices.children].forEach(b => { b.disabled = true; const bid = b.firstChild.textContent; if (bid === q.iv) b.classList.add('correct'); else if (bid === id) b.classList.add('wrong'); });
        const bar = timeBar.firstChild; bar.style.transition = 'none';
        const was = step, r = climb(step, ok);
        step = r.step;
        if (ok) { right++; points += towerPoints(rt, st.secs); } else hearts--;
        drawHud();
        const name = ivOf(q.iv).name;
        if (ok) prompt.textContent = 'Yes, a ' + name.toLowerCase() + '. Up you go!';
        else prompt.textContent = (id ? 'That was a ' + name.toLowerCase() + ', not a ' + ivOf(id).name.toLowerCase() : 'Too slow: it was a ' + name.toLowerCase()) + (was === step ? '. You hold on to the ledge.' : '. You slip down a step.');
        if (r.topped) {
          scene.atTop(); points += 50; drawHud();
          prompt.textContent = 'You reached her window! ' + towerStage(r.tower).name + ' is next: ' + towerStage(r.tower).note;
          later(() => { scene.draw(r.tower); scene.place(step); next(); }, 2600);
          return;
        }
        scene.place(step, ok ? 'hop' : was === step ? '' : 'slip');
        if (hearts <= 0) { later(end, 1800); return; }
        if (ok) later(next, 1100);
        else {
          // hear the right one again before going on
          later(() => playIv(q, 0.05), 700);
          nextBtn.hidden = false;
        }
      }
      function next() { clear(); nextBtn.hidden = true; ask(); }
      function end() {
        clear(); ctx.setActive(false);
        const t = Date.now(), tower = Math.floor(step / TOWER);
        const rank = points > 0 ? E.addGameScore('tower', { s: points, t, step, tower }) : 0;
        holder.innerHTML = '';
        holder.append(endCard({ title: 'The Tower', score: points, rank, again: () => play(),
          lines: ['You reached step ' + step + (tower ? ', on ' + towerStage(tower).name.replace(/^The /, 'the ') : '') + '. ' + right + ' of ' + asked + ' right.', 'Every answer counted in your Intervals progress.'],
          extra: h('button', { class: 'btn', onclick: () => menu(t) }, 'High scores') }),
        Leaderboard('tower', { mark: t, detail }));
      }
      drawHud();
      ask();
    }
    menu();
    return () => { alive = false; clear(); };
  }
});
