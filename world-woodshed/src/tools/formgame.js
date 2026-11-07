/* World Woodshed — Lost in the Form: hear where you are in a tune. The Repertoire gym's band plays a tune's form
   with the chart hidden; tap the letter of each section (A, B, C) as it comes in. The first chorus shows the
   sections lighting up as they go by; after that you are on your own, the band thins out (the piano drops out,
   then the drums) and the tempo rises each chorus. A section missed, the wrong letter or a tap where no section
   starts costs one of three hearts. Each chorus counts in the Repertoire skill for that tune. */
import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import { h, tool, hooks } from '../ui/core.js';
import { parseChord } from '../theory.js';
import { Band } from '../band.js';
import { formStarts, formLetters, formJudge, formPoints } from '../games.js';
import { Leaderboard, endCard } from '../ui/games.js';
import './games.css';

// tunes with more than one section, shortest form first
const TUNES = () => D.TUNES.filter(t => t.form && formLetters(t.form).length > 1 && D.GROOVES[t.groove]).sort((a, b) => a.bars.length - b.bars.length);
const PARTS = [{ drums: true, comp: true, bass: true }, { drums: true, comp: true, bass: true }, { drums: true, comp: false, bass: true }, { drums: false, comp: false, bass: true }];
const PART_NAME = ['the full band', 'the full band', 'bass and drums', 'bass alone'];

tool('formgame', {
  tab: 'play', skill: 'repertoire', game: 'formgame', title: 'Lost in the Form', eyebrow: 'Game · Repertoire gym',
  desc: 'The band plays a tune with the chart hidden. Tap each section\'s letter as it comes in: A, B, the bridge. The band thins out and speeds up each chorus.',
  render(body, ctx) {
    const holder = h('div', { class: 'stack' }); body.append(holder);
    let stopRun = null;
    const list = TUNES();
    const pickId = () => (list.find(t => t.id === (ctx.params || {}).tune) || list.find(t => t.id === E.state.settings.formTune) || list[0]).id;
    let tuneId = pickId();
    const detail = e => { const t = D.TUNES.find(x => x.id === e.tune); return (t ? t.name : e.tune) + ' · chorus ' + e.chorus; };

    function menu(mark) {
      if (stopRun) stopRun();
      holder.innerHTML = '';
      const sel = h('select', { 'aria-label': 'Tune', onchange: e => { tuneId = e.target.value; E.setSetting('formTune', tuneId); menu(mark); } },
        list.map(t => h('option', { value: t.id, selected: t.id === tuneId ? true : null, text: t.name + ' (' + t.form.map(f => f[0].replace(/\d+$/, '')).join('') + ')' })));
      const t = list.find(x => x.id === tuneId);
      holder.append(h('div', { class: 'card' },
        h('label', { class: 'stack small' }, h('span', { text: 'The tune' }), sel),
        h('p', { text: 'Its form: ' + t.form.map(([l, n]) => l.replace(/\d+$/, '') + ' (' + n + ' bars)').join(', ') + '.' }),
        h('p', { class: 'small', text: 'Tap the section\'s letter right on its first beat (the first A is given). In the first chorus the sections light up as they pass; then you\'re on your own, with less of the band and a faster tempo each time round.' }),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: () => play(t) }, '▶ Count me in'))),
      Leaderboard('formgame', { mark, detail }));
    }

    function play(t) {
      if (stopRun) stopRun();
      holder.innerHTML = ''; A.ensure(); A.fresh();
      const g = D.GROOVES[t.groove], bpb = g.steps / g.spb;
      const bars = t.bars.map(b => b.split(' ').map(parseChord));
      const starts = formStarts(t.form), letters = formLetters(t.form);
      const startAt = new Map(starts.map(x => [x.bar, x.letter]));
      let bpm = Math.max(60, Math.min(t.bpm, 150)) - 10, chorus = 0, hearts = 3, score = 0, over = false, ended = false;
      let hits = 0, chorusHits = 0, chorusAsks = 0, bestChorus = 0;
      const judged = new Map([['0:0', 'free']]); // `${chorus}:${bar}` → 'hit' | 'miss'; the first section comes straight after the count-in, so it is given
      const hud = h('div', { class: 'tw-hud mono' });
      const status = h('div', { class: 'prompt fg-status', role: 'status' }, 'Count-in…');
      const strip = h('div', { class: 'fg-strip', 'aria-hidden': 'true' }, starts.map((x, i) => h('span', { class: 'fg-sec', 'data-i': i, style: 'flex:' + t.form[i][1] }, x.letter)));
      const pads = h('div', { class: 'fg-pads' }, letters.map(l => h('button', { class: 'fg-pad', type: 'button', onpointerdown: ev => { ev.preventDefault(); tap(l, ev); } }, l)));
      const stopBtn = h('button', { class: 'btn small' }, '■ Stop');
      holder.append(h('div', { class: 'card ud-card' }, h('div', { class: 'spread' }, h('b', { text: t.name }), stopBtn), hud, strip, status, pads,
        h('p', { class: 'small muted', text: 'Keys: ' + letters.map(l => l).join(', ') + ' on the keyboard.' })));
      const drawHud = () => { hud.textContent = score.toLocaleString() + ' pts · chorus ' + (chorus + 1) + ' · ' + '♥'.repeat(hearts) + '♡'.repeat(3 - hearts) + ' · ' + bpm + ' bpm · ' + PART_NAME[Math.min(chorus, 3)]; };
      const lightSec = bi => { const i = starts.findIndex((x, k) => bi >= x.bar && (k === starts.length - 1 || bi < starts[k + 1].bar)); [...strip.children].forEach((el, k) => el.classList.toggle('now', k === i)); };
      const flashPad = (l, cls) => { const el = [...pads.children].find(b => b.textContent === l); if (!el) return; el.classList.remove('right', 'wrong'); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), 700); };
      function lose(msg) { hearts--; status.textContent = msg; drawHud(); if (hearts <= 0) { over = true; setTimeout(end, 1600); } }

      function tap(letter, ev) {
        if (over || !band) return;
        const tt = A.eventToAudioTime(ev), at = band.barAt(tt);
        if (!at) return;
        const bd = band.beatDur(), into = (tt - at.t) / bd;
        // the section start this tap is for: the bar it fell in (late) or the next one (early)
        let bar = null, off = 0, ch = at.chorus !== undefined ? at.chorus : chorus;
        if (startAt.has(at.bi) && into <= 1.25) { bar = at.bi; off = into; }
        else if (startAt.has((at.bi + 1) % bars.length) && bpb - into <= 1.25) { bar = (at.bi + 1) % bars.length; off = into - bpb; if (bar === 0) ch++; }
        const key = ch + ':' + bar;
        if (bar === null) { flashPad(letter, 'wrong'); lose('No new section there. Keep counting the bars.'); return; }
        if (judged.has(key)) return;
        const kind = formJudge(off);
        if (!kind || startAt.get(bar) !== letter) {
          judged.set(key, 'miss'); flashPad(letter, 'wrong'); chorusAsks++;
          lose(kind ? 'That was the ' + startAt.get(bar) + ', not the ' + letter + '.' : 'The ' + startAt.get(bar) + ' started ' + Math.abs(off).toFixed(1) + ' beats ' + (off < 0 ? 'after' : 'before') + ' that tap.');
          return;
        }
        judged.set(key, 'hit'); hits++; chorusHits++; chorusAsks++;
        score += formPoints(kind, ch); flashPad(letter, 'right');
        status.textContent = (kind === 'perfect' ? 'Right on it: ' : 'Got it: ') + 'the ' + letter + '.';
        drawHud();
      }
      const onKey = ev => {
        if (ev.repeat || ev.ctrlKey || ev.metaKey || (ev.target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(ev.target.tagName))) return;
        const l = (ev.key || '').toUpperCase();
        if (letters.includes(l)) { ev.preventDefault(); tap(l, ev); }
      };
      document.addEventListener('keydown', onKey);

      const band = Band({
        bars, barsFor: () => bars, range: null, groove: g, grooveId: t.groove, bpm: () => bpm, parts: PARTS[0], comp: 'piano', feel: 'walk', countIn: true,
        onCount: n => { status.textContent = 'Count-in: ' + n; },
        onChorus: () => {},
        onBeat: ({ bar: bi, beat, chorus: ch }) => {
          if (over) return;
          if (ch !== chorus) {
            // a chorus done: it counts for the tune; the next is faster with less of the band
            if (chorusAsks) { const sc = chorusHits / chorusAsks; E.record('repertoire', t.id, sc >= 0.75, { score: sc }); ctx.tick(1); if (sc === 1) bestChorus = Math.max(bestChorus, chorus + 1); }
            chorusHits = 0; chorusAsks = 0;
            chorus = ch; bpm = Math.min(t.bpm + 30, bpm + 6);
            band.set({ parts: PARTS[Math.min(chorus, 3)] });
            drawHud();
          }
          if (chorus === 0) lightSec(bi); else [...strip.children].forEach(el => el.classList.remove('now'));
          if (beat === 0 && chorus === 0 && startAt.has(bi)) status.textContent = 'Now: the ' + startAt.get(bi);
          // a section start gone by without its letter
          const prev = beat >= 2 ? bi : null;
          if (prev !== null && startAt.has(prev) && !judged.has(ch + ':' + prev)) {
            judged.set(ch + ':' + prev, 'miss'); chorusAsks++;
            lose('You missed the ' + startAt.get(prev) + (chorus > 0 ? ' (bar ' + (prev + 1) + ')' : '') + '.');
          }
        }
      });
      function cleanup() { over = true; band.stop(); document.removeEventListener('keydown', onKey); ctx.setActive(false); stopRun = null; }
      function end() {
        if (ended || !holder.isConnected) return;
        ended = true; cleanup();
        if (hooks.signal && hits >= 3) hooks.signal('tune:' + t.id, { score: hits / Math.max(1, judged.size - 1) });
        const tm = Date.now(), rank = score > 0 ? E.addGameScore('formgame', { s: score, t: tm, tune: t.id, chorus: chorus + 1 }) : 0;
        holder.innerHTML = '';
        holder.append(endCard({ title: t.name, score, rank, again: () => play(t),
          lines: [hits + ' section' + (hits === 1 ? '' : 's') + ' heard, into chorus ' + (chorus + 1) + ' at ' + bpm + ' bpm.' + (bestChorus ? ' A perfect chorus!' : ''), 'Each chorus counted in your Repertoire progress for this tune.'],
          extra: h('button', { class: 'btn', onclick: () => menu(tm) }, 'Pick another tune') }),
        Leaderboard('formgame', { mark: tm, detail }));
      }
      stopBtn.onclick = () => end();
      stopRun = () => { if (!over) cleanup(); };
      drawHud();
      band.start(); ctx.setActive(true); ctx.timeSkill = 'repertoire';
    }
    menu();
    return () => { if (stopRun) stopRun(); };
  }
});
