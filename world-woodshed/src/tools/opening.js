/* World Woodshed — Opening Night: sight-reading as a live show, built on the first rule of reading: never stop.
   The music scrolls at tempo and never waits for you, a new four-bar line coming in under the one you read so
   you can look ahead. Wrong notes cost almost nothing; stopping costs a lot (rules in src/games.js). It starts
   at your sight-reading level and climbs a level every 8 bars (the single-line levels: chords, slashes and
   repeats are left out), at one steady tempo: the show never changes speed under you. With the mic it hears pitch (any octave); without it, taps
   score the rhythm. Each line counts in that level's Sight-reading record. */
import A from '../audio.js';
import E from '../engine.js';
import Mic from '../listen.js';
import { h, tool } from '../ui/core.js';
import { MicToggle } from '../ui/mic.js';
import { TapPad, tapTime } from './rhythm.js';
import { renderStaff, parseTime } from '../notation.js';
import { LEVELS, genMelody, attacks, eventStarts, barLength } from '../content/reading.js';
import { SHOW_LEVEL_BARS, delayTracker, barSilent, barKept, crowdAfter, curtain, showNotePoints } from '../games.js';
import { Leaderboard, endCard, HowTo } from '../ui/games.js';
import './games.css';

const SHOW_LEVELS = LEVELS.filter(L => !L.chords && !L.repeats);
const levelFrom = id => SHOW_LEVELS.filter(L => L.id <= id).pop() || SHOW_LEVELS[0];
const nextLevel = L => SHOW_LEVELS.find(x => x.id > L.id) || L;

tool('opening', {
  tab: 'play', skill: 'reading', game: 'opening', title: 'Opening Night', eyebrow: 'Game · Sight-reading',
  desc: 'Sight-read a live show: the music never waits. Wrong notes cost almost nothing; stopping costs a lot. Keep going and the crowd stays with you.',
  render(body, ctx) {
    const holder = h('div', { class: 'stack' }); body.append(holder);
    let stopRun = null;
    const detail = e => 'Level ' + e.level + ' · ' + e.bars + ' bars · best run ' + e.streak + (e.mic ? '' : ' · tapped');

    function menu(mark) {
      if (stopRun) stopRun();
      holder.innerHTML = '';
      const L = levelFrom(E.unlockedTier('reading'));
      holder.append(h('div', { class: 'card' },
        HowTo({ game: 'opening',
          goal: 'Sight-read a live show. The music never waits for you, so whatever happens, keep playing.',
          steps: ['After a bar of count-in the click keeps time. Read the line on top and play it; the next line is already showing underneath, so read ahead.',
            'Play on the guitar with the mic on (Score my pitch, on the next screen) to be scored on the notes, or tap the rhythm on the pad or the space bar.',
            'A wrong note costs almost nothing. Stopping costs a lot: the crowd meter drops a third for every bar you leave silent.',
            'Slipped? Come straight back in on the next bar\'s first note and that bar scores double.',
            'You start at level ' + L.id + ' (' + L.name + ') at its slowest tempo, which stays steady all night, and the lines move up a level every ' + SHOW_LEVEL_BARS + ' bars.'],
          scoring: ['10 points for each note played in time, 10 more when the mic hears the right pitch (5 more when tapped).', 'The crowd meter fills a little for each note played and empties a little for each note missed.', 'Your run counts the bars in a row where you played most of the notes.'],
          ends: 'when the crowd meter is empty or two bars in a row go silent: the curtain comes down.' }),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: () => play() }, '▶ Curtain up'))),
      Leaderboard('opening', { mark, detail }));
    }

    function play() {
      if (stopRun) stopRun();
      holder.innerHTML = ''; A.ensure(); A.fresh();
      let L = levelFrom(E.unlockedTier('reading'));
      const bpm = L.tempo[0], qd = 60 / bpm;
      const lat = (E.state.settings.latencyMs || 0) / 1000;
      let crowd = 100, silentRun = 0, score = 0, streak = 0, bestStreak = 0, barsDone = 0, over = false, ended = false, slipped = false, usedMic = false;
      const lines = []; // { piece, L, q0 (start, quarters from t0), len, ats, bars: [{ q0, len, notes: [exp] }] }
      const exp = [];   // every expected note: { t, a, line, bar, hit, pitch }
      const delay = delayTracker(0.15); // your screen's or mic's own steady delay, taken off before judging (src/games.js)
      let t0 = 0, sched = null, raf = 0, clickQ = 0, staffNow = null, shown = -1;

      const hud = h('div', { class: 'tw-hud mono' });
      const crowdBar = h('div', { class: 'on-crowd', 'aria-hidden': 'true' }, h('span'));
      const status = h('div', { class: 'prompt on-status', role: 'status' }, 'Count-in…');
      const nowBox = h('div', { class: 'on-staff now' }), nextBox = h('div', { class: 'on-staff next' });
      const stopBtn = h('button', { class: 'btn small' }, '■ Stop');
      const padHolder = h('div');
      let micOff = null;
      const mic = MicToggle({ label: 'Score my pitch (mic)', onLabel: 'Listening: play what you read', hint: 'Headphones keep the click out of the mic. Any octave counts.',
        onOn: () => { usedMic = true; micOff = Mic.on('note', ev => heard(ev.t - Mic.latencyMs() / 1000, Math.round(ev.midi))); }, onOff: () => { if (micOff) micOff(); micOff = null; } });
      holder.append(h('div', { class: 'card ud-card' }, h('div', { class: 'spread' }, h('b', { class: 'on-level' }), stopBtn), hud, crowdBar, status, nowBox, nextBox, mic.el, padHolder));
      const pad = TapPad(ev => heard(tapTime(ev, lat), null), 'Tap the rhythm (or space bar)', {});
      padHolder.append(pad.el);
      const drawHud = () => {
        hud.textContent = score.toLocaleString() + ' pts · ' + barsDone + ' bars · run ' + streak + ' · ' + bpm + ' bpm';
        crowdBar.firstChild.style.width = crowd + '%'; crowdBar.classList.toggle('low', crowd < 40);
        const RL = shown >= 0 && lines[shown] ? lines[shown].L : L;
        holder.querySelector('.on-level').textContent = 'Level ' + RL.id + ': ' + RL.name;
      };

      // the next four-bar line, at the current level, straight after the last
      function addLine() {
        const piece = genMelody(L, { bars: 4 });
        const prev = lines[lines.length - 1], q0 = prev ? prev.q0 + prev.len : 0;
        const bars = piece.bars.map((b, k) => ({ len: barLength(piece, k), notes: [] }));
        let acc = 0; bars.forEach(b => { b.q0 = q0 + acc; acc += b.len; });
        const line = { piece, L, q0, len: acc, ats: attacks(piece), bars, idx: lines.length };
        const barOf = new Map(eventStarts(piece).map(e => [e.i, e.bar]));
        line.ats.forEach(a => { const e = { t: t0 + (q0 + a.q) * qd, a, line, bar: bars[barOf.get(a.i)], hit: false, pitch: undefined }; e.bar.notes.push(e); exp.push(e); });
        lines.push(line);
        return line;
      }
      const draw = (box, line) => { box.innerHTML = ''; if (!line) return null; const st = renderStaff({ bars: line.piece.bars, key: line.piece.key, time: line.piece.time, width: Math.max(220, (box.clientWidth || 320) - 4), barsPerLine: 4, label: 'Four bars to read' }); box.append(st.el); return st; };
      function show(i) {
        if (i === shown) return; shown = i;
        while (lines.length < i + 2) addLine();
        staffNow = draw(nowBox, lines[i]); draw(nextBox, lines[i + 1]);
        if (i > 0 && lines[i].L !== lines[i - 1].L) status.textContent = 'Level up: ' + lines[i].L.name + '!';
        else if (lines[i + 1].L !== lines[i].L) status.textContent = 'Next line: level ' + lines[i + 1].L.id + ', ' + lines[i + 1].L.name + '.';
        drawHud();
      }

      function heard(raw, midi) {
        if (over) return;
        const t = raw - delay.get();
        let best = null, bd = Infinity;
        for (let x = exp.length - 1; x >= 0; x--) { const e = exp[x]; if (e.hit) continue; const d = Math.abs(t - e.t); if (d < bd) { bd = d; best = e; } if (e.t < t - 1) break; }
        if (!best) return;
        const gap = Math.min(...best.line.ats.map(a => Math.abs(a.q - best.a.q)).filter(x => x > 1e-6), 2) * qd;
        if (bd > Math.max(0.08, Math.min(0.16, gap * 0.5))) return;
        best.hit = true; delay.add(raw - best.t);
        best.pitch = midi === null ? null : ((midi - (best.a.midi - 12)) % 12 + 12) % 12 === 0;
        if (staffNow && best.line.idx === shown) staffNow.mark(best.a.i, best.pitch === false ? 'bad' : 'good');
      }
      // a bar is judged once its time and the window after it have passed
      function judgeBar(line, b) {
        const st = { notes: b.notes.length, played: b.notes.filter(e => e.hit).length, right: b.notes.filter(e => e.hit && e.pitch !== false).length };
        let pts = b.notes.reduce((s, e) => s + showNotePoints(e.hit, e.pitch), 0);
        const back = slipped && b.notes.length && b.notes[0].hit;
        if (back) pts *= 2;
        score += pts; barsDone++;
        crowd = crowdAfter(crowd, st);
        silentRun = barSilent(st) ? silentRun + 1 : 0;
        if (barKept(st)) { streak++; bestStreak = Math.max(bestStreak, streak); } else streak = 0;
        slipped = st.notes > 0 && st.played < st.notes;
        b.notes.forEach(e => { if (!e.hit && staffNow && line.idx === shown) staffNow.mark(e.a.i, 'bad'); });
        status.textContent = barSilent(st) ? (silentRun >= 2 ? 'Silence…' : 'Don\'t stop! Come back in on the next note.') : back ? 'Back in! Double points.' : st.right === st.notes && st.notes ? 'Beautiful.' : st.played === st.notes ? 'Kept going. That\'s the way.' : 'Keep going!';
        if (curtain(crowd, silentRun)) { over = true; status.textContent = 'The curtain comes down.'; setTimeout(end, 1500); }
        drawHud();
      }
      function lineDone(line) {
        const n = line.ats.length; if (!n) return;
        const sc = line.bars.reduce((s, b) => s + b.notes.reduce((x, e) => x + (e.hit ? (usedMic ? (e.pitch ? 1 : 0.4) : 1) : 0), 0), 0) / n;
        E.record('reading', 'L' + line.L.id + (usedMic ? ':melody' : ':rhythm'), sc >= 0.75, { score: sc });
        ctx.tick(1);
      }

      function begin() {
        const first = addLine(); // made before t0 is known: fix its times below
        const ts = parseTime(first.piece.time);
        t0 = A.now() + 0.4 + ts.barQ * qd; // one bar of count-in
        exp.forEach(e => { e.t = t0 + (e.line.q0 + e.a.q) * qd; });
        // the count-in: the first line's beats
        for (let b = 0; b < ts.beats; b++) A.hit(b === 0 ? 'clickHi' : 'click', t0 - ts.barQ * qd + b * ts.beatQ * qd, 0.9);
        show(0);
        let judgedTo = { line: 0, bar: 0 };
        sched = setInterval(() => {
          if (over) return;
          const now = A.now();
          // the click, bar by bar along the lines, a little ahead
          while (true) {
            const line = lines.find(l => clickQ >= l.q0 - 1e-6 && clickQ < l.q0 + l.len - 1e-6) || (addLine(), null);
            if (!line) continue;
            const t = t0 + clickQ * qd;
            if (t > now + 0.25) break;
            const b = line.bars.find(x => clickQ >= x.q0 - 1e-6 && clickQ < x.q0 + x.len - 1e-6), ts2 = parseTime(line.piece.time);
            A.hit(Math.abs(clickQ - b.q0) < 1e-6 ? 'clickHi' : 'click', t, 0.75);
            clickQ += ts2.beatQ;
            if (lines.length < line.idx + 3) addLine();
          }
          // bars whose time is up
          const heardNow = A.heard();
          while (true) {
            const line = lines[judgedTo.line]; if (!line) break;
            const b = line.bars[judgedTo.bar];
            if (heardNow < t0 + (b.q0 + b.len) * qd + 0.16) break;
            judgeBar(line, b);
            judgedTo.bar++;
            if (judgedTo.bar >= line.bars.length) {
              lineDone(line); judgedTo = { line: judgedTo.line + 1, bar: 0 };
              // a new level every SHOW_LEVEL_BARS bars: the lines not yet made come at the next level
              if (barsDone % SHOW_LEVEL_BARS === 0) L = nextLevel(L);
            }
            if (over) return;
          }
        }, 40);
        const frame = () => {
          if (over) return;
          const q = (A.heard() - t0) / qd;
          const i = lines.findIndex(l => q < l.q0 + l.len);
          if (i >= 0 && q >= 0) {
            show(i);
            const line = lines[i];
            const a = line.ats.filter(x => line.q0 + x.q <= q + 0.02).pop();
            if (staffNow) staffNow.cursor(a ? a.i : null);
          }
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      }
      function cleanup() { over = true; clearInterval(sched); cancelAnimationFrame(raf); pad.cleanup(); mic.cleanup(); A.fresh(); ctx.setActive(false); stopRun = null; }
      function end() {
        if (ended || !holder.isConnected) return;
        ended = true; cleanup();
        const t = Date.now(), rank = score > 0 ? E.addGameScore('opening', { s: score, t, level: L.id, bars: barsDone, streak: bestStreak, mic: usedMic }) : 0;
        holder.innerHTML = '';
        holder.append(endCard({ title: 'Opening Night', score, rank, again: () => play(),
          lines: [barsDone + ' bars read, up to level ' + L.id + '. Your longest run without stopping: ' + bestStreak + ' bars.', usedMic ? 'Every line counted in your Sight-reading progress.' : 'Tapped, so rhythm only. Switch on the mic next time to be scored on the notes too.'],
          extra: h('button', { class: 'btn', onclick: () => menu(t) }, 'High scores') }),
        Leaderboard('opening', { mark: t, detail }));
      }
      stopBtn.onclick = () => end();
      stopRun = () => { if (!over) cleanup(); };
      drawHud(); ctx.setActive(true);
      begin();
    }
    menu();
    return () => { if (stopRun) stopRun(); };
  }
});
