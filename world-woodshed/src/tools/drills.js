import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import { h, toast, tool, openTool, Fretboard, hooks } from '../ui/core.js';
import { playRhythmStep, RhythmGrid } from './rhythm.js';
import { parseChord, prettySym } from '../theory.js';
import { renderStaff } from '../notation.js';
import Mic from '../listen.js';
import { MicToggle, TimingMeter } from '../ui/mic.js';
import Cur from '../curriculum.js';
import { Band } from '../band.js';

/* ======================================================
   STYLE DRILLS: the exercises a teacher of each tradition would give, with a backing loop,
   variations that rotate (variable practice), notation, a tempo ladder and mic timing
   ====================================================== */
const FOCUS = { rhythm: 'Rhythm', technique: 'Technique', melody: 'Melody', harmony: 'Harmony', ear: 'Ear' };
const regionName = id => (D.REGIONS.find(r => r.id === id) || { name: id }).name;
const yt = q => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);

/* A backing loop for a drill. Each pass through it is a "round". */
function Backing(d, getBpm, onRound) {
  const b = d.backing || {};
  let loop = null, band = null;
  const r = b.rhythm ? D.RHYTHMS.find(x => x.id === b.rhythm) : null;
  const g = b.groove ? D.GROOVES[b.groove] : null;
  const bars = g ? (b.bars && b.bars.length ? b.bars : ['C']).map(x => x.split(' ').map(parseChord).filter(Boolean)) : null;
  const click = !r && !g ? Object.assign({ beats: 4, sub: 2 }, b.click || {}) : null;
  const spec = r ? { steps: r.steps, spb: r.spb } : g ? { steps: g.steps * bars.length, spb: g.spb } : { steps: click.beats * click.sub, spb: click.sub };
  return {
    spec, rhythm: r, bars,
    get loop() { return loop; },
    start() {
      A.ensure();
      let lastCycle = -1;
      if (g) { // chord backings play on the band: walking or pattern bass, voice-led comping, drums
        band = Band({ bars, groove: g, grooveId: b.groove, bpm: getBpm, parts: { drums: true, comp: true, bass: true }, comp: 'piano', feel: 'walk', countIn: false,
          onBeat: ({ bar, beat, chorus }) => { if (bar === 0 && beat === 0 && chorus !== lastCycle) { lastCycle = chorus; onRound(chorus); } if (this.onStepVisual) this.onStepVisual(bar * g.steps + beat * g.spb); } });
        loop = { startTime: band.start(), stop: () => band.stop() };
        return;
      }
      loop = A.Loop({
        steps: spec.steps, stepDur: () => 60 / getBpm() / spec.spb,
        onStep: (i, t, cycle) => {
          if (r) playRhythmStep(r, i, t);
          else {
            const beat = i % click.sub === 0;
            A.hit(i === 0 ? 'clickHi' : 'click', t, beat ? 0.85 : 0.3);
          }
        },
        onVisual: (i, cycle) => { if (i === 0 && cycle !== lastCycle) { lastCycle = cycle; onRound(cycle); } if (this.onStepVisual) this.onStepVisual(i); }
      });
      loop.start();
    },
    stop() { if (loop) loop.stop(); loop = null; },
    chordAt(i) { if (!g) return null; const bi = Math.floor(i / g.steps), st = i % g.steps, bar = bars[bi]; return bar.length === 1 ? bar[0] : bar[st < g.steps / 2 ? 0 : 1]; }
  };
}

tool('drill', {
  tab: 'train', skill: null, title: 'Style drills', eyebrow: 'Play · exercises from each tradition',
  desc: 'Concrete exercises for every style, with a backing loop, notation, variations that change as you go, and a tempo that climbs when you play clean.',
  render(body, ctx) {
    const holder = h('div', { class: 'section' }); body.append(holder);
    let back = null, cleanupExtra = null;
    const stopAll = () => { if (back) back.stop(); back = null; if (cleanupExtra) { cleanupExtra(); cleanupExtra = null; } ctx.setActive(false); };
    function list(filter = 'all') {
      stopAll(); holder.innerHTML = '';
      const pri = (Cur.prefs().styles || []);
      const styles = [...new Set(D.DRILLS.map(d => d.style))].sort((a, b) => (pri.indexOf(a) < 0 ? 99 : pri.indexOf(a)) - (pri.indexOf(b) < 0 ? 99 : pri.indexOf(b)));
      holder.append(h('div', { class: 'chips' }, [['all', 'All']].concat(Object.entries(FOCUS)).map(([k, t]) => h('button', { class: 'chip', 'aria-pressed': k === filter ? 'true' : 'false', onclick: () => list(k) }, t))));
      styles.forEach(st => {
        const ds = D.DRILLS.filter(d => d.style === st && (filter === 'all' || d.focus === filter));
        if (!ds.length) return;
        holder.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: regionName(st) + (pri.includes(st) ? ' · your focus' : '') }),
          h('div', { class: 'tools' }, ds.map(d => {
            const best = (E.state.settings.drillBest || {})[d.id];
            return h('button', { class: 'tile', onclick: () => open(d) }, h('span', { class: 't-title', text: d.name }), h('span', { class: 't-desc', text: FOCUS[d.focus] + ' · level ' + d.level + ' · ' + d.goal }), h('span', { class: 't-meter', text: best ? best + ' bpm' : 'new' }));
          }))));
      });
    }
    function open(d) {
      stopAll(); holder.innerHTML = '';
      const vars = d.variations || [];
      const saved = E.state.settings.drillBpm || {};
      let bpm = saved[d.id] || d.tempo[0], vi = 0, rounds = 0, rotateEvery = E.state.settings.drillRotate ?? 2;
      const sig = { clean: 0, notClean: 0 };
      const report = () => { if (hooks.signal) hooks.signal('drill:' + d.id, sig); };
      const card = h('div', { class: 'card' });
      holder.append(card);
      const bpmLbl = h('div', { class: 'big-number mono', text: bpm });
      const playBtn = h('button', { class: 'btn primary' }, '▶ Play');
      const roundLbl = h('span', { class: 'mono small muted' });
      const varBox = h('div', { class: 'techvar' });
      const fb = Fretboard({ onTap: (si, f) => A.note(E.STRINGS[si].midi + f, A.now() + 0.01, 0.8, 1.1) });
      const chordLbl = h('div', { class: 'prompt' });
      back = Backing(d, () => bpm, cycle => {
        rounds = cycle;
        roundLbl.textContent = 'Round ' + (cycle + 1);
        if (cycle > 0 && rotateEvery && cycle % rotateEvery === 0 && vars.length > 1) setVar(vi + 1);
      });
      const grid = back.rhythm ? RhythmGrid(back.rhythm) : null;
      back.onStepVisual = i => { if (grid) grid.setNow(i); const c = back.chordAt(i); if (c) chordLbl.textContent = prettySym(c.sym); };
      function setTempo(v) { bpm = Math.max(30, Math.min(400, Math.round(v))); bpmLbl.textContent = bpm; const o = Object.assign({}, E.state.settings.drillBpm || {}); o[d.id] = bpm; E.setSetting('drillBpm', o); }
      function setVar(i) { if (!vars.length) return; vi = ((i % vars.length) + vars.length) % vars.length; drawVar(); }
      function drawVar() {
        varBox.innerHTML = '';
        if (!vars.length) return;
        const v = vars[vi];
        varBox.append(h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Variation ' + (vi + 1) + ' of ' + vars.length }),
          h('div', { class: 'row' }, h('button', { class: 'mbtn', 'aria-label': 'Previous variation', onclick: () => setVar(vi - 1) }, '‹'), h('button', { class: 'mbtn', 'aria-label': 'Next variation', onclick: () => setVar(vi + 1) }, '›'))),
          h('b', { text: v.name }), h('p', { class: 'small', text: v.how }));
        if (v.bars && v.bars.length) {
          try {
            const staff = renderStaff({ bars: v.bars.map(bar => bar.map(n => ({ midi: n.m === null || n.m === undefined ? null : n.m + 12, dur: n.d, dot: !!n.dot }))), key: v.key || 'C', time: v.time || '4/4', width: Math.min(720, card.clientWidth || 680) });
            varBox.append(h('div', { class: 'drill-staff' }, staff.el));
          } catch (e) { console.error(e); }
          const play = h('button', { class: 'btn small ghost', onclick: () => {
            A.ensure(); let t = A.now() + 0.05; const q = 60 / bpm * (back && back.rhythm && back.rhythm.unit === '♪' ? 2 : 1); // ♪ rhythms count eighths
            v.bars.flat().forEach(n => { const len = { w: 4, h: 2, q: 1, 8: 0.5, 16: 0.25 }[n.d] * (n.dot ? 1.5 : 1) * q; if (n.m !== null && n.m !== undefined) A.note(n.m, t, 0.75, len * 0.95); t += len; });
          } }, '▶ Hear the phrase');
          varBox.append(play);
        }
        if (v.positions && v.positions.length) {
          fb.mark(v.positions.map(([str, fr], k) => ({ s: 6 - str, f: fr, kind: k === 0 ? 'root' : 'tone', label: String(k + 1) })));
          varBox.append(fb.el);
        }
      }
      const meter = TimingMeter(() => (back && back.loop ? { start: back.loop.startTime, step: 60 / bpm / back.spec.spb } : null), { idle: 'Press Play and play along.' });
      const meterBox = h('div', { hidden: true }, meter.el);
      const mic = MicToggle({ label: 'Check my timing', onLabel: 'Listening to your timing', hint: 'Headphones help: the mic should hear your guitar, not the backing.',
        onOn: () => { meterBox.hidden = false; meter.reset(); meter.start('onset'); }, onOff: () => { meterBox.hidden = true; meter.stop(); } });
      cleanupExtra = () => { meter.stop(); mic.cleanup(); };
      const b = d.backing || {};
      const backingName = b.rhythm ? (back.rhythm ? back.rhythm.name : b.rhythm) : b.groove ? D.GROOVES[b.groove].name + (b.bars ? ': ' + b.bars.map(prettySym).join(' · ') : '') : 'Click';
      const unit = back.rhythm && back.rhythm.unit ? back.rhythm.unit + '/min' : 'bpm';
      card.append(
        h('div', { class: 'spread' }, h('button', { class: 'btn ghost small', onclick: () => list() }, '← All drills'), h('span', { class: 'eyebrow', text: regionName(d.style) + ' · ' + FOCUS[d.focus] + ' · level ' + d.level })),
        h('h2', { text: d.name }), h('p', { class: 'lede', text: d.goal }),
        h('p', { class: 'small muted', text: d.why }),
        h('ol', { class: 'list steps' }, d.steps.map(x => h('li', { text: x }))),
        varBox,
        h('div', { class: 'spread' }, h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => setTempo(bpm - 4) }, '−4'), h('div', { class: 'stack', style: { gap: '0', justifyItems: 'center' } }, h('span', { class: 'eyebrow', text: unit }), bpmLbl), h('button', { class: 'btn small', onclick: () => setTempo(bpm + 4) }, '+4')),
          h('div', { class: 'stack', style: { gap: '2px', justifyItems: 'end' } }, playBtn, roundLbl)),
        h('p', { class: 'small muted', text: 'Backing: ' + backingName + ' · goal ' + d.tempo[1] + ' ' + unit }),
        back.bars ? chordLbl : '', grid ? grid.el : '',
        h('div', { class: 'row' },
          h('button', { class: 'btn brass', onclick: () => { sig.clean++; report(); const best = Object.assign({}, E.state.settings.drillBest || {}); best[d.id] = Math.max(best[d.id] || 0, bpm); E.setSetting('drillBest', best); setTempo(Math.min(d.tempo[1] + 20, bpm + 4)); setVar(vi + 1); toast('Clean. Up to ' + bpm); } }, 'Clean ✓ +4'),
          h('button', { class: 'btn', onclick: () => { sig.notClean++; report(); setTempo(Math.max(30, bpm - 6)); toast('Back to ' + bpm + '. Rebuild it clean.'); } }, 'Not clean')),
        h('div', { class: 'row' }, h('span', { class: 'small muted', text: 'Change variation every' }),
          (() => { const s2 = h('select', { 'aria-label': 'Rounds per variation' }); [[0, 'never (stay)'], [1, 'round'], [2, '2 rounds'], [4, '4 rounds']].forEach(([v, t]) => s2.append(h('option', { value: String(v), selected: v === rotateEvery ? true : null, text: t }))); s2.onchange = () => { rotateEvery = +s2.value; E.setSetting('drillRotate', rotateEvery); }; return s2; })()),
        mic.el, meterBox,
        d.listen ? h('p', { class: 'small' }, 'Hear it: ', h('a', { href: yt(d.listen.artist + ' ' + d.listen.work), target: '_blank', rel: 'noopener' }, d.listen.artist + ', ' + d.listen.work + ' ↗')) : '');
      drawVar();
      playBtn.onclick = () => { if (back.loop) { back.stop(); playBtn.textContent = '▶ Play'; ctx.setActive(false); } else { meter.reset(); back.start(); playBtn.textContent = '■ Stop'; ctx.setActive(true); } };
    }
    const start = D.DRILLS.find(d => d.id === (ctx.params || {}).drill);
    if (start) open(start); else list();
    return () => stopAll();
  }
});
