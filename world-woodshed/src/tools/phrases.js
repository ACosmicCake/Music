import A from '../audio.js';
import D from '../data.js';
import E from '../engine.js';
import { h, tool, hooks, toast } from '../ui/core.js';
import { parseChord, prettySym } from '../theory.js';
import { Band } from '../band.js';
import TN from '../mytunes.js';
import { keepAwake } from '../native.js';
import { selectEl } from './practice.js';
import { VAMPS, vampOf, vampBars } from '../constraints.js';
import { LENGTHS, FIXED, lengthOf, Phraser, MIX_EVERY, mixFrom, barsName } from '../phrases.js';

/* ======================================================
   PHRASE LENGTHS: solo in phrases of a set length. Play a phrase of 1, 2, 4 or 8 bars (or half a bar), then rest as
   many bars while the backing keeps going, round after round, or mix the lengths. The backing is a vamp from the
   Constraint roll, a Repertoire tune (yours too) or a click with a drone. Nothing is judged: the smart plan asks
   how it went at the end of a block. The rounds are src/phrases.js.
   ====================================================== */

const WHO = { full: ['Full band', { drums: true, comp: true, bass: true }], rhythm: ['Bass and drums', { drums: true, comp: false, bass: true }], drums: ['Drums only', { drums: true, comp: false, bass: false }] };
const BEATS = [2, 3, 4, 5, 6, 7];
const checkbox = (on, label, onchange) => h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: on ? true : null, onchange: e => onchange(e.target.checked) }), label);
const tunes = () => D.TUNES.filter(t => D.GROOVES[t.groove]);
const myTunes = () => E.listTunes().map(TN.playable).filter(Boolean);

/* The backing for a choice: 'auto', 'v:<vamp>', 't:<tune>' or 'click' */
function backingOf(id) {
  if (id === 'click') return { id, click: true, name: 'Click and drone', bpm: 90 };
  if (String(id).startsWith('t:')) {
    const tid = id.slice(2), t = tunes().find(x => x.id === tid) || myTunes().find(x => x.id === tid);
    if (t) return { id, name: t.name, where: t.group || 'Your tunes', groove: t.groove, bars: vampBars(t, parseChord), bpm: t.bpm || 100 };
  }
  const v = String(id).startsWith('v:') ? vampOf(id.slice(2)) : VAMPS[Math.floor(Math.random() * VAMPS.length)];
  return { id: 'v:' + v.id, name: v.name, where: v.where + ' · ' + v.scaleName, groove: v.groove, bars: vampBars(v, parseChord), bpm: v.bpm };
}

tool('phrases', {
  tab: 'play', skill: 'improv', title: 'Phrase lengths', eyebrow: 'Improvise · in 1, 2, 4 or 8 bars',
  desc: 'Solo in phrases of a set length: play for one bar and rest for one, or two and two, four and four, eight and eight, half a bar, or a mix, while the band keeps going. Shaping ideas to a length is how solos start to sound like sentences.',
  render(body, ctx) {
    const p = ctx.params || {};
    const saved = E.state.settings.phrases || {};
    const st = {
      len: p.len && LENGTHS.some(x => x.id === String(p.len)) ? String(p.len) : lengthOf(saved.len).id,
      backing: saved.backing || 'auto', who: WHO[saved.who] ? saved.who : 'full', bell: saved.bell !== false,
      from: mixFrom(saved.from), every: MIX_EVERY.includes(saved.every) ? saved.every : 2,
      click: Object.assign({ tonic: 9, bpb: 4, drone: true }, saved.click || {}), bpm: Object.assign({}, saved.bpm || {})
    };
    const persist = () => E.setSetting('phrases', { len: st.len, backing: st.backing, who: st.who, bell: st.bell, from: st.from, every: st.every, click: st.click, bpm: st.bpm });
    let back = backingOf(st.backing);
    const bpmOf = () => st.bpm[back.id] || back.bpm;
    const bpb = () => (back.click ? st.click.bpb : Math.round(D.GROOVES[back.groove].steps / D.GROOVES[back.groove].spb) || 4);

    const card = h('div', { class: 'card ph-card' }), ctl = h('div', { class: 'card' });
    body.append(card, ctl);
    const nameLbl = h('h2', { class: 'ph-name' });
    const lenChips = h('div', { class: 'chips ph-lens', role: 'group', 'aria-label': 'Phrase length' });
    const stateLbl = h('div', { class: 'big-number ph-state', 'aria-live': 'polite', text: 'Ready' });
    const barLbl = h('div', { class: 'small mono ph-bar' });
    const fill = h('div', { class: 'ph-fill' });
    const meter = h('div', { class: 'ph-meter', 'aria-hidden': 'true' }, fill);
    const chordLbl = h('div', { class: 'big-number ph-chord', text: '—' });
    const chordHead = h('span', { class: 'eyebrow', text: 'Chord' });
    const roundLbl = h('div', { class: 'big-number mono ph-round', text: '—' });
    const nextLbl = h('p', { class: 'small muted ph-next' });
    const backLbl = h('p', { class: 'small muted' });
    const playBtn = h('button', { class: 'btn primary' }, '▶ Start');
    card.append(
      h('span', { class: 'eyebrow', text: 'Phrase length' }), nameLbl, lenChips,
      h('div', { class: 'ph-stage' }, stateLbl, barLbl, meter),
      h('div', { class: 'spread' },
        h('div', { class: 'stack', style: { gap: '0' } }, chordHead, chordLbl),
        h('div', { class: 'stack', style: { gap: '0', justifyItems: 'end' } }, h('span', { class: 'eyebrow', text: 'Phrases' }), roundLbl)),
      nextLbl, h('div', { class: 'row' }, playBtn), backLbl);

    /* ---------- the length ---------- */
    function drawLen() {
      const L = lengthOf(st.len);
      nameLbl.textContent = L.name;
      lenChips.innerHTML = '';
      LENGTHS.forEach(x => lenChips.append(h('button', { class: 'chip', 'aria-pressed': x.id === st.len ? 'true' : 'false', onclick: () => setLen(x.id) }, x.short)));
      if (!running()) nextLbl.textContent = L.bars ? 'Play ' + barsName(L.bars) + ', rest ' + barsName(L.bars) + ', and again.' : 'Phrases of ' + st.from.map(id => lengthOf(id).short.replace(/ bars?$/, '')).join(', ').replace(/, ([^,]*)$/, ' or $1') + ' bars, a new length every ' + (st.every === 1 ? 'round' : st.every + ' rounds') + '.';
    }
    function setLen(id) {
      if (id === st.len) return;
      st.len = id; persist(); drawLen(); renderCtl();
      if (p.smart && hooks.follow) hooks.follow('phrases', id, { len: id });
      if (running()) restartRounds();
    }

    /* ---------- the rounds ---------- */
    let phr = null, base = 0, phrases = 0;
    const newPhraser = () => Phraser({ len: st.len, bpb: bpb(), from: st.from, every: st.every });
    // a change while playing starts the new rounds from the next bar
    let pendingFrom = null;
    function restartRounds() { pendingFrom = true; }
    function bell() { if (!st.bell) return; const t = A.now() + 0.01; A.note(91, t, 0.32, 0.9, { synth: true }); A.note(96, t + 0.09, 0.22, 0.9, { synth: true }); }
    function onAbsBeat(n) {
      const b = bpb();
      if (pendingFrom && n % b === 0) { phr = newPhraser(); base = n; pendingFrom = null; }
      if (pendingFrom) { stateLbl.textContent = 'Rest'; barLbl.textContent = 'New length from the next bar'; card.classList.remove('ph-on'); return; }
      const x = phr.at(n - base);
      if (x.play && x.into === 0) phrases++;
      card.classList.toggle('ph-on', x.play);
      stateLbl.textContent = x.play ? 'Play' : 'Rest';
      barLbl.textContent = (x.bars < 1 ? 'Beat ' + (x.into + 1) + ' of ' + x.beats : 'Bar ' + x.bar + ' of ' + x.ofBars) + ' · ' + barsName(x.bars).replace(' ', '-').replace(/bars$/, 'bar') + ' phrase';
      fill.style.width = Math.round((x.into + 1) / x.beats * 100) + '%';
      roundLbl.textContent = String(phrases);
      nextLbl.textContent = x.play ? 'Then rest ' + barsName(x.bars) + '.' : 'Next: a phrase of ' + barsName(x.next) + (x.next !== x.bars ? ' (a new length)' : '') + '.';
      if (!x.play && x.last) bell();
    }

    /* ---------- playing ---------- */
    let band = null, loop = null, drone = null, bandBars = 0;
    const running = () => !!(band || loop);
    function count(n, lastOne) {
      card.classList.remove('ph-on');
      stateLbl.textContent = n + '…'; barLbl.textContent = 'Count-in'; fill.style.width = '0%';
      if (lastOne) bell();
    }
    function begin() {
      A.ensure();
      phr = newPhraser(); base = 0; phrases = 0; pendingFrom = null;
      roundLbl.textContent = '0';
      if (back.click) {
        const b = st.click.bpb;
        if (st.click.drone) { drone = A.Drone(48 + st.click.tonic); drone.start(); }
        chordLbl.textContent = D.NOTE_NAMES[st.click.tonic];
        loop = A.Loop({
          steps: b, stepDur: () => 60 / bpmOf(),
          onStep: (i, t) => A.hit(i === 0 ? 'clickHi' : 'click', t, i === 0 ? 1 : 0.7),
          onVisual: (i, cycle) => { const n = cycle * b + i - b; if (n < 0) count(i + 1, i === b - 1); else onAbsBeat(n); }
        });
        loop.start();
      } else {
        const g = D.GROOVES[back.groove];
        bandBars = back.bars.length;
        band = Band({
          bars: back.bars, groove: g, grooveId: back.groove, bpm: bpmOf, parts: WHO[st.who][1], comp: 'piano', feel: 'walk', countIn: true,
          onCount: n => count(n, n === '4'),
          onBeat: ({ bar, beat, chorus, chord }) => {
            chordLbl.textContent = chord ? prettySym(chord.sym) : '—';
            onAbsBeat((chorus * bandBars + bar) * bpb() + beat);
          }
        });
        band.start();
      }
      keepAwake(true, 'phrases');
      playBtn.textContent = '■ Stop'; ctx.setActive(true);
    }
    function stop() {
      if (band) band.stop(); band = null;
      if (loop) loop.stop(); loop = null;
      if (drone) drone.stop(); drone = null;
      keepAwake(false, 'phrases');
      playBtn.textContent = '▶ Start'; ctx.setActive(false);
      card.classList.remove('ph-on');
      stateLbl.textContent = 'Ready'; barLbl.textContent = phrases ? phrases + ' phrase' + (phrases === 1 ? '' : 's') + ' played' : ''; fill.style.width = '0%';
      chordLbl.textContent = '—';
      drawLen();
    }
    playBtn.onclick = () => (running() ? stop() : begin());
    function setBacking(id) {
      const was = running(); if (was) stop();
      st.backing = id; back = backingOf(id); persist(); renderCtl(); showBack();
      if (was) begin();
    }
    function setBpm(v) { st.bpm[back.id] = Math.max(40, Math.min(260, Math.round(v))); persist(); renderCtl(); showBack(); }
    function showBack() {
      chordHead.textContent = back.click ? (st.click.drone ? 'Drone' : 'Key') : 'Chord';
      backLbl.textContent = back.click
        ? 'Click in ' + st.click.bpb + (st.click.drone ? ' with a drone on ' + D.NOTE_NAMES[st.click.tonic] : '') + ' · ' + bpmOf() + ' bpm'
        : back.name + ' · ' + back.where + ' · ' + bpmOf() + ' bpm';
    }

    /* ---------- set up ---------- */
    function renderCtl() {
      ctl.innerHTML = '';
      const opts = [{ value: 'auto', text: 'Surprise me (a vamp)' }, { value: 'click', text: 'Click and drone' },
        { group: 'Vamps', items: VAMPS.map(v => ({ value: 'v:' + v.id, text: v.name + ' · ' + v.where })) },
        { group: 'Tunes', items: tunes().map(t => ({ value: 't:' + t.id, text: t.name })) }];
      const mine = myTunes();
      if (mine.length) opts.push({ group: 'Your tunes', items: mine.map(t => ({ value: 't:' + t.id, text: t.name })) });
      const grid = h('div', { class: 'formgrid' }, selectEl('ph-back', 'Backing', opts, st.backing, setBacking));
      if (back.click) {
        grid.append(
          selectEl('ph-key', 'Drone on', D.NOTE_NAMES.map((n, i) => ({ value: String(i), text: n })), String(st.click.tonic), v => { st.click.tonic = +v; persist(); showBack(); if (drone) { drone.stop(); drone = A.Drone(48 + st.click.tonic); drone.start(); } if (running()) chordLbl.textContent = D.NOTE_NAMES[st.click.tonic]; }),
          selectEl('ph-bpb', 'Beats in a bar', BEATS.map(n => ({ value: String(n), text: String(n) })), String(st.click.bpb), v => { const was = running(); if (was) stop(); st.click.bpb = +v; persist(); showBack(); if (was) begin(); }));
      } else {
        grid.append(selectEl('ph-who', 'Who plays', Object.entries(WHO).map(([k, [t]]) => ({ value: k, text: t })), st.who, v => { st.who = v; persist(); if (band) band.set({ parts: WHO[v][1] }); }));
      }
      const bpmLbl = h('div', { class: 'big-number mono', text: bpmOf() });
      ctl.append(h('h3', { text: 'Set up' }), grid,
        h('div', { class: 'row' },
          h('button', { class: 'btn small', onclick: () => setBpm(bpmOf() - 4) }, '−4'),
          h('div', { class: 'stack', style: { gap: '0', justifyItems: 'center' } }, h('span', { class: 'eyebrow', text: 'bpm' }), bpmLbl),
          h('button', { class: 'btn small', onclick: () => setBpm(bpmOf() + 4) }, '+4')));
      if (back.click) ctl.append(checkbox(st.click.drone, 'Drone', v => { st.click.drone = v; persist(); showBack(); if (!v && drone) { drone.stop(); drone = null; } else if (v && loop && !drone) { drone = A.Drone(48 + st.click.tonic); drone.start(); } }));
      if (st.len === 'mix') {
        ctl.append(
          h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Mix these lengths' }),
            h('div', { class: 'chips' }, FIXED.map(x => h('button', {
              class: 'chip', 'aria-pressed': st.from.includes(x.id) ? 'true' : 'false',
              onclick: () => {
                const on = st.from.includes(x.id);
                if (on && st.from.length <= 2) { toast('Mix at least two lengths.'); return; }
                st.from = mixFrom(on ? st.from.filter(id => id !== x.id) : st.from.concat([x.id])); persist(); renderCtl(); drawLen();
                if (running()) restartRounds();
              }
            }, x.short)))),
          h('div', { class: 'formgrid' }, selectEl('ph-every', 'New length every', MIX_EVERY.map(n => ({ value: String(n), text: n === 1 ? 'round' : n + ' rounds' })), String(st.every), v => { st.every = +v; persist(); drawLen(); if (running()) restartRounds(); })));
      }
      ctl.append(checkbox(st.bell, 'A soft bell on the beat before each phrase', v => { st.bell = v; persist(); }),
        h('p', { class: 'small muted', text: 'Play while it says Play and stop when the rest comes, even in the middle of an idea. The rests are part of the solo.' }));
    }
    drawLen(); renderCtl(); showBack();
    return () => { if (band) band.stop(); band = null; if (loop) loop.stop(); loop = null; if (drone) drone.stop(); drone = null; keepAwake(false, 'phrases'); };
  }
});
