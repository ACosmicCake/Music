/* World Woodshed — Updraft: the Rhythm gym as a game. A paper kite rides the wind through gaps in the clouds,
   and every gap is a note of the exercise's rhythm: tap (or play, with the mic) right on it and the kite lifts
   through; a gap passed without a note costs one of three hearts. The guide plays your part in some bars and
   leaves you alone in others, as in the gym, where the gaps hide in the mist and score double. The wind picks
   up (4 bpm) every four bars. Scores go on your own table (src/games.js). */
import A from '../audio.js';
import E from '../engine.js';
import { h, tool, hooks, pickFor } from '../ui/core.js';
import { TapPad, tapTime } from './rhythm.js';
import { GYM, CATS, beatsClick, feelOpts } from '../content/gym.js';
import { PERFECT, UPDRAFT_HEARTS, gatePoints, updraftBpm } from '../games.js';
import { Leaderboard, endCard } from '../ui/games.js';
import './games.css';

const css = (el, name, fallback) => (getComputedStyle(el).getPropertyValue(name) || '').trim() || fallback;
const exName = id => { const x = GYM.find(g => g.id === id); return x ? x.name : id; };

tool('updraft', {
  tab: 'rhythm', skill: 'tuplets', game: 'updraft', title: 'Updraft', eyebrow: 'Game · Rhythm gym',
  desc: 'Fly a paper kite through the clouds on the rhythm. Every gap is a note: tap right on it to lift through. Three hearts, and the wind picks up every four bars.',
  render(body, ctx) {
    const p = ctx.params || {};
    const start = GYM.find(x => x.id === p.ex) || GYM.find(x => x.id === E.state.settings.updraftEx)
      || (p.auto && GYM.find(x => x.id === (pickFor('tuplets', ctx) || {}).id)) || GYM.find(x => x.id === 'pos-and') || GYM[0];
    let ex = start, stopRun = null;
    const holder = h('div', { class: 'stack' }); body.append(holder);

    function menu(mark) {
      if (stopRun) stopRun();
      holder.innerHTML = '';
      const sel = h('select', { 'aria-label': 'Rhythm to fly', onchange: e => { ex = GYM.find(x => x.id === e.target.value) || ex; E.setSetting('updraftEx', ex.id); } },
        Object.entries(CATS).map(([c, nm]) => h('optgroup', { label: nm }, GYM.filter(x => x.cat === c).map(x => h('option', { value: x.id, selected: x.id === ex.id ? true : null, text: x.name + ' (level ' + x.tier + ')' })))));
      holder.append(h('div', { class: 'card' },
        h('label', { class: 'stack small' }, h('span', { text: 'The rhythm you fly' }), sel),
        h('p', { class: 'small muted', text: 'The gaps in the clouds are the notes. Bars where the guide plays along are clear; bars you play alone are misty, and score double. Tap the sky, the pad or the space bar, or switch on the mic and play your guitar.' }),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: () => play() }, '▶ Fly'))),
      Leaderboard('updraft', { mark, detail: e => exName(e.ex) + (e.bpm ? ' · up to ' + e.bpm + ' bpm' : '') }));
    }

    function play() {
      if (stopRun) stopRun();
      holder.innerHTML = '';
      A.ensure(); A.fresh();
      const run = Math.floor(Math.random() * 1000), opts = feelOpts(E.state.settings.gymFeel);
      const startBpm = (E.state.settings.gymBpm || {})[ex.id] || ex.bpm[0];
      const lat = (E.state.settings.latencyMs || 0) / 1000;
      const beats = ex.beats;
      // the game's state
      let score = 0, combo = 0, bestCombo = 0, hearts = UPDRAFT_HEARTS, over = false, topBpm = startBpm;
      let perfect = 0, good = 0, missed = 0;
      const bpmOf = new Map(); // bar (cycle) → its tempo
      const tempo = cycle => { if (!bpmOf.has(cycle)) bpmOf.set(cycle, updraftBpm(startBpm, Math.max(0, cycle - 1), ex.bpm[1])); return bpmOf.get(cycle); };
      const barPlan = cycle => {
        const k = cycle - 1;
        if (k < 0) return { k, guided: false, pattern: [], click: beatsClick(beats) };
        const guided = ex.guided ? ex.guided(k, opts) : ex.plan[k % ex.plan.length];
        return { k, guided, pattern: ex.pattern(k, run, opts), click: ex.click ? ex.click(k) : ex.poly ? beatsClick(ex.poly[1]) : beatsClick(beats) };
      };
      // gates: one per note, keyed by its place in beats from the start (bar × beats + position)
      const gates = new Map();
      let nGates = 0;
      const gateAt = (cycle, pos) => {
        const gb = cycle * beats + pos, key = gb.toFixed(4);
        if (!gates.has(key)) {
          const plan = barPlan(cycle), n = nGates++;
          gates.set(key, { gb, alone: !plan.guided, y: 0.5 + 0.28 * Math.sin(n * 1.7 + run) * Math.min(1, 0.4 + n / 20), t: null, state: null });
        }
        return gates.get(key);
      };
      const plannedTo = { cycle: 0 };
      const planAhead = upTo => { while (plannedTo.cycle <= upTo) { const c = plannedTo.cycle++; barPlan(c).pattern.forEach(pos => gateAt(c, pos)); } };
      const win = () => {
        const bd = 60 / tempo(Math.max(1, barNow.cycle));
        const ps = [...gates.values()].filter(g => g.state === null).map(g => g.gb).sort((a, b) => a - b).slice(0, 6);
        let gap = beats; for (let i = 1; i < ps.length; i++) gap = Math.min(gap, ps[i] - ps[i - 1]);
        return Math.max(0.05, Math.min(0.1, gap * bd * 0.45));
      };

      // what's on screen
      const hud = h('div', { class: 'ud-hud mono' });
      const status = h('div', { class: 'phase', role: 'status' }, 'Count-in…');
      const cv = h('canvas', { class: 'ud-sky', role: 'img', 'aria-label': 'A paper kite flying through gaps in the clouds; each gap is a note of the rhythm' });
      const stopBtn = h('button', { class: 'btn small' }, '■ Land');
      const padHolder = h('div');
      const card = h('div', { class: 'card ud-card' }, h('div', { class: 'spread' }, h('b', { text: ex.name }), stopBtn), hud, cv, status, padHolder);
      holder.append(card);
      const g2 = cv.getContext('2d');
      const col = {
        sky1: css(card, '--patina-soft', '#d5ebe6'), sky2: css(card, '--surface', '#f9faf6'), cloud: css(card, '--surface', '#fff'),
        edge: css(card, '--line', '#d2d8cf'), kite: css(card, '--brass', '#9a6a14'), kite2: css(card, '--c-tech', '#c0513a'), ink: css(card, '--ink', '#18201c'),
        good: css(card, '--good', '#2b7a46'), bad: css(card, '--bad', '#b03f2b'), muted: css(card, '--muted', '#5b6760')
      };
      let W = 0, H = 0, dpr = 1;
      const size = () => {
        dpr = Math.min(2, window.devicePixelRatio || 1);
        W = Math.max(200, cv.clientWidth || 300); H = Math.round(Math.max(160, Math.min(320, W * 0.6)));
        cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px';
      };
      size();
      const onResize = () => size();
      window.addEventListener('resize', onResize);
      const drawHud = () => { hud.textContent = score.toLocaleString() + ' pts · ×' + combo + ' · ' + '♥'.repeat(hearts) + '♡'.repeat(UPDRAFT_HEARTS - hearts) + ' · ' + tempo(Math.max(1, barNow.cycle)) + ' bpm'; };

      // where the music is now, in beats from the start: from the start of the bar being heard
      const barNow = { cycle: 0, at: 0, bd: 60 / startBpm };
      const beatNow = () => barNow.cycle * beats + Math.max(0, (A.heard() - barNow.at) / barNow.bd);
      const expected = []; // { t, gate } as scheduled
      const pops = []; // floating words and sparkles
      let kiteY = 0.5, hop = 0, shake = 0;

      function judge(g, kind) {
        g.state = kind;
        if (kind === 'miss') {
          missed++; combo = 0; hearts--; shake = 1;
          pops.push({ text: 'Missed', c: col.bad, b: g.gb, y: g.y, life: 1 });
          if (hearts <= 0) end();
        } else {
          kind === 'perfect' ? perfect++ : good++;
          score += gatePoints(kind, combo, g.alone); combo++; bestCombo = Math.max(bestCombo, combo); hop = 1;
          pops.push({ text: (kind === 'perfect' ? 'Perfect' : 'Good') + (g.alone ? ' ×2' : ''), c: kind === 'perfect' ? col.good : col.kite, b: g.gb, y: g.y, life: 1, spark: kind === 'perfect' });
        }
        drawHud();
      }
      function onTap(ev) {
        if (over) return;
        const t = tapTime(ev, lat), w = win();
        let best = null, bd = Infinity;
        expected.forEach(e => { if (e.gate.state !== null) return; const d = Math.abs(e.t - t); if (d < bd) { bd = d; best = e; } });
        if (best && bd <= w) judge(best.gate, bd <= PERFECT ? 'perfect' : 'good');
        else if (barNow.cycle > 0) { combo = 0; shake = Math.max(shake, 0.4); drawHud(); } // a flap with no gap to fly through
      }
      const pad = TapPad(onTap, 'Tap on the notes (or space bar)', { mic: true });
      padHolder.append(pad.el);
      cv.addEventListener('pointerdown', ev => { ev.preventDefault(); onTap(ev); });

      let plannedCycle = 0, raf = 0;
      const loop = A.Loop({
        steps: beats, stepDur: () => 60 / tempo(Math.max(1, plannedCycle)),
        onStep: (i, t, cycle) => {
          plannedCycle = cycle;
          const bar = barPlan(cycle), bd = 60 / tempo(Math.max(1, cycle));
          planAhead(cycle + 3);
          bar.click.filter(c => c.pos >= i && c.pos < i + 1).forEach(c => A.hit(c.hi || c.pos === 0 ? 'clickHi' : 'click', t + (c.pos - i) * bd, 0.85));
          bar.pattern.filter(q => q >= i && q < i + 1).forEach(q => {
            const at = t + (q - i) * bd;
            if (bar.guided) A.hit('clave', at, 0.7);
            const g = gateAt(cycle, q); g.t = at;
            expected.push({ t: at, gate: g });
          });
        },
        onVisual: (i, cycle) => {
          if (i !== 0) return;
          barNow.cycle = cycle; barNow.at = A.heard(); barNow.bd = 60 / tempo(Math.max(1, cycle));
          topBpm = Math.max(topBpm, tempo(Math.max(1, cycle)));
          const bar = barPlan(cycle);
          status.textContent = bar.k < 0 ? 'Count-in…' : bar.guided ? 'With the guide · bar ' + (bar.k + 1) : 'On your own, in the mist: double points · bar ' + (bar.k + 1);
          status.className = 'phase' + (bar.k >= 0 && !bar.guided ? ' ghost' : '');
          drawHud();
        }
      });
      planAhead(3);

      function frame() {
        if (over) return;
        const now = A.heard(), w = win();
        // a gap gone by with no note in it
        expected.forEach(e => { if (e.gate.state === null && now > e.t + w) judge(e.gate, 'miss'); });
        if (over) return;
        for (let i = expected.length - 1; i >= 0; i--) if (expected[i].gate.state !== null) expected.splice(i, 1);
        const bn = beatNow();
        gates.forEach((g, k) => { if (g.gb < bn - 4 && g.state !== null) gates.delete(k); });
        draw(bn);
        raf = requestAnimationFrame(frame);
      }
      function draw(bNow) {
        const c = g2; c.setTransform(dpr, 0, 0, dpr, 0, 0);
        const pxBeat = W * 0.26, kx = W * 0.24;
        const sky = c.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, col.sky1); sky.addColorStop(1, col.sky2);
        c.fillStyle = sky; c.fillRect(0, 0, W, H);
        // far hills and wisps, sliding slower than the clouds
        c.fillStyle = col.edge; c.globalAlpha = 0.45;
        for (let k = -1; k < 6; k++) { const x = ((k * 140 - bNow * pxBeat * 0.25) % (W + 280) + W + 280) % (W + 280) - 140; c.beginPath(); c.ellipse(x, H + 10, 110, 48, 0, Math.PI, 2 * Math.PI); c.fill(); }
        c.globalAlpha = 1;
        // the beat lines: thin, the bar line stronger
        for (let b = Math.floor(bNow) - 1; b < bNow + W / pxBeat; b++) {
          const x = kx + (b - bNow) * pxBeat; if (x < -2 || x > W + 2) continue;
          c.strokeStyle = col.edge; c.lineWidth = b % beats === 0 ? 2 : 1; c.globalAlpha = b % beats === 0 ? 0.9 : 0.4;
          c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke();
        }
        c.globalAlpha = 1;
        // the cloud columns with their gaps
        let target = null;
        [...gates.values()].forEach(g => {
          const x = kx + (g.gb - bNow) * pxBeat;
          if (x < -40 || x > W + 40) return;
          if (g.state === null && x >= kx - 10 && (!target || g.gb < target.gb)) target = g;
          const gapH = H * 0.32, cy = g.y * H, top = cy - gapH / 2, bot = cy + gapH / 2, cw = 22;
          c.globalAlpha = g.state === 'miss' ? 0.35 : g.alone ? 0.55 : 1;
          c.fillStyle = col.cloud; c.strokeStyle = g.state === 'perfect' ? col.good : g.state === 'good' ? col.kite : g.state === 'miss' ? col.bad : col.edge;
          c.lineWidth = g.state && g.state !== 'miss' ? 2.5 : 1.5;
          if (g.alone && g.state === null) c.setLineDash([5, 4]);
          puff(c, x, top, cw, -1); puff(c, x, bot, cw, 1);
          c.setLineDash([]); c.globalAlpha = 1;
        });
        // the kite drifts toward the next gap, hops on a note and shakes on a miss
        const ty = target ? target.y : 0.5;
        kiteY += (ty - kiteY) * 0.06;
        hop *= 0.88; shake *= 0.9;
        const ky = kiteY * H - hop * 14 + Math.sin(performance.now() / 50) * shake * 8;
        kite(c, kx, ky, bNow);
        // words and sparkles
        for (let i = pops.length - 1; i >= 0; i--) {
          const q = pops[i]; q.life -= 0.02; if (q.life <= 0) { pops.splice(i, 1); continue; }
          const x = Math.max(30, kx + (q.b - bNow) * pxBeat), y = q.y * H - 30 - (1 - q.life) * 30;
          c.globalAlpha = q.life; c.fillStyle = q.c; c.font = '700 14px ' + css(card, '--font-display', 'sans-serif'); c.textAlign = 'center';
          c.fillText(q.text, x, y);
          if (q.spark) for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + q.life * 3, r = 10 + (1 - q.life) * 26; c.fillRect(kx + Math.cos(a) * r - 1.5, q.y * H + Math.sin(a) * r - 1.5, 3, 3); }
          c.globalAlpha = 1;
        }
      }
      // a column of cloud from the gap's edge to the top (dir −1) or the bottom (dir 1) of the sky
      function puff(c, x, edgeY, w, dir) {
        const far = dir < 0 ? -10 : H + 10;
        c.beginPath();
        c.moveTo(x - w, far); c.lineTo(x - w, edgeY - dir * 8);
        c.quadraticCurveTo(x - w, edgeY, x - w * 0.4, edgeY + dir * 2);
        c.quadraticCurveTo(x, edgeY + dir * 8, x + w * 0.4, edgeY + dir * 2);
        c.quadraticCurveTo(x + w, edgeY, x + w, edgeY - dir * 8);
        c.lineTo(x + w, far); c.closePath(); c.fill(); c.stroke();
      }
      // the paper kite: a folded diamond with a crease, and a tail of three bows that sways with the beat
      function kite(c, x, y, bNow) {
        const sw = Math.sin(bNow * Math.PI) * 6;
        c.strokeStyle = col.muted; c.lineWidth = 1;
        c.beginPath(); c.moveTo(x, y + 16); c.bezierCurveTo(x - 14, y + 26 + sw, x - 28, y + 20 - sw, x - 42, y + 30 + sw); c.stroke();
        [[-14, 25], [-28, 22], [-41, 30]].forEach(([dx, dy], k) => { c.fillStyle = k % 2 ? col.kite : col.kite2; const yy = y + dy + (k % 2 ? -sw : sw) * 0.8; c.beginPath(); c.moveTo(x + dx - 4, yy - 3); c.lineTo(x + dx + 4, yy + 3); c.lineTo(x + dx + 4, yy - 3); c.lineTo(x + dx - 4, yy + 3); c.closePath(); c.fill(); });
        c.beginPath(); c.moveTo(x + 12, y - 2); c.lineTo(x, y - 16); c.lineTo(x - 12, y - 2); c.lineTo(x, y + 16); c.closePath();
        c.fillStyle = col.kite; c.fill();
        c.beginPath(); c.moveTo(x + 12, y - 2); c.lineTo(x, y - 16); c.lineTo(x, y + 16); c.closePath(); c.fillStyle = col.kite2; c.globalAlpha = 0.8; c.fill(); c.globalAlpha = 1;
        c.strokeStyle = col.ink; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + 12, y - 2); c.lineTo(x, y - 16); c.lineTo(x - 12, y - 2); c.lineTo(x, y + 16); c.closePath(); c.moveTo(x - 12, y - 2); c.lineTo(x + 12, y - 2); c.stroke();
      }

      function cleanup() {
        over = true; loop.stop(); cancelAnimationFrame(raf); pad.cleanup(); window.removeEventListener('resize', onResize);
        ctx.setActive(false); stopRun = null;
      }
      function end() {
        if (over) return;
        cleanup();
        const passed = perfect + good + missed;
        const rate = passed ? (perfect + good * 0.7) / passed : 0;
        if (passed >= 8) {
          E.record('tuplets', ex.id, rate >= 0.7, { score: rate });
          if (hooks.signal) hooks.signal('gym:' + ex.id, { score: rate });
          ctx.tick(1);
        }
        const t = Date.now();
        const rank = score > 0 ? E.addGameScore('updraft', { s: score, t, ex: ex.id, bpm: topBpm, combo: bestCombo }) : 0;
        holder.innerHTML = '';
        holder.append(endCard({
          title: ex.name, score, rank, again: () => play(),
          lines: [perfect + ' perfect · ' + good + ' good · ' + missed + ' missed · longest combo ' + bestCombo, 'Flew up to ' + topBpm + ' bpm.' + (passed >= 8 ? ' Counted in your Rhythm gym progress.' : '')],
          extra: h('button', { class: 'btn', onclick: () => menu(t) }, 'Pick another rhythm')
        }), Leaderboard('updraft', { mark: t, detail: e => exName(e.ex) + (e.bpm ? ' · up to ' + e.bpm + ' bpm' : '') }));
      }
      stopBtn.onclick = () => end();
      stopRun = () => { if (!over) cleanup(); };
      drawHud();
      loop.start(); ctx.setActive(true);
      raf = requestAnimationFrame(frame);
    }
    menu();
    return () => { if (stopRun) stopRun(); };
  }
});
