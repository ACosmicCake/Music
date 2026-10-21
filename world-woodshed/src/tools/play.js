import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import { h, s, rand, choice, shuffle, pc, noteName, toast, bar, regionName, TOOLS, tool, openTool, pickFor, Quiz, Fretboard, positionsOfPc } from '../ui/core.js';
import { SOUND_FOR, TapPad } from './rhythm.js';
import { parseChord, flatName, prettySym } from '../theory.js';
import { techniquePage } from './learn.js';
import Mic from '../listen.js';
import { MicToggle, TimingMeter, noteLabel } from '../ui/mic.js';

/* ======================================================
   PLAY TOOLS
   ====================================================== */
tool('fretboard', {
  tab: 'play', skill: 'fretboard', title: 'Fretboard notes', eyebrow: 'Play · know the neck',
  desc: 'Find the named note on the highlighted string: tap it, or play it on your guitar with the mic. Starts with natural notes on the low strings.',
  render(body, ctx) {
    const card = h('div', { class: 'card' }); body.append(card);
    const prompt = h('div', { class: 'prompt' });
    const sub = h('p', { class: 'small muted' });
    const fbk = h('div', { class: 'feedback', hidden: true });
    let item, si, target, t0, locked = false, timer = null;
    const answer = (s2, f, heard) => {
      if (locked) return;
      A.ensure();
      if (!heard) A.note(E.STRINGS[s2].midi + f, A.now() + 0.01, 0.8, 1.2);
      if (s2 !== si) { sub.textContent = 'Tap on the ' + E.STRINGS[si].name + ' string (highlighted).'; return; }
      locked = true;
      const got = (E.STRINGS[s2].midi + f) % 12;
      const ok = got === target;
      E.record('fretboard', item.id, ok, { confused: E.STRINGS[si].id + ':' + got, rt: performance.now() - t0 });
      ctx.tick(1);
      const marks = [];
      for (let ff = 0; ff <= 12; ff++) if ((E.STRINGS[si].midi + ff) % 12 === target) marks.push({ s: si, f: ff, kind: 'good', label: D.NOTE_NAMES[target] });
      if (!ok) marks.push({ s: s2, f, kind: 'bad', label: D.NOTE_NAMES[got] });
      fb.mark(marks);
      fbk.hidden = false; fbk.className = 'feedback ' + (ok ? 'ok' : 'no');
      fbk.textContent = ok ? 'Yes — ' + D.NOTE_FULL[target] + '.' : 'That was ' + D.NOTE_FULL[got] + '. ' + D.NOTE_FULL[target] + ' is at fret ' + marks.filter(m => m.kind === 'good').map(m => m.f).join(' and ') + '.';
      timer = setTimeout(next, ok ? 700 : 2000);
    };
    const fb = Fretboard({ onTap: (s2, f) => answer(s2, f, false) });
    // Played on the guitar: map the heard pitch onto the highlighted string
    let micOff = null;
    const mic = MicToggle({ label: 'Answer by playing', onLabel: 'Listening: play the note', hint: 'Play the note on the highlighted string.',
      onOn: () => { micOff = Mic.on('note', ev => {
        const m = Math.round(ev.midi), f = m - E.STRINGS[si].midi;
        if (f >= 0 && f <= 12) answer(si, f, true);
        else if (!locked) sub.textContent = 'Heard ' + noteLabel(ev.midi) + ': that isn’t on the ' + E.STRINGS[si].name + ' string between frets 0 and 12.';
      }); },
      onOff: () => { if (micOff) micOff(); micOff = null; } });
    card.append(prompt, sub, mic.el, fb.el, fbk);
    function next() {
      clearTimeout(timer); locked = false; fbk.hidden = true; fb.clear();
      item = pickFor('fretboard', ctx);
      const [sid, p] = item.id.split(':');
      si = E.STRINGS.findIndex(x => x.id === sid); target = +p;
      prompt.textContent = 'Find ' + D.NOTE_FULL[target];
      sub.textContent = 'On the ' + E.STRINGS[si].name + ' string';
      fb.highlightString(si);
      t0 = performance.now();
    }
    next();
    return () => { clearTimeout(timer); mic.cleanup(); };
  }
});

tool('callresp', {
  tab: 'play', skill: 'callresp', title: 'Call & response', eyebrow: 'Play · ear to hands',
  desc: 'Hear a short phrase, then play it back on your guitar (the mic listens) or by tapping the fretboard. Any octave counts.',
  render(body, ctx) {
    const card = h('div', { class: 'card' }); body.append(card);
    let item, lick = [], played = [], done = false, tonic, sc;
    const prompt = h('div', { class: 'prompt' }), sub = h('p', { class: 'small muted' });
    const slots = h('div', { class: 'row mono' });
    const fbk = h('div', { class: 'feedback', hidden: true });
    const add = (si, f, heard) => {
      A.ensure();
      const m = E.STRINGS[si].midi + f;
      if (!heard) A.note(m, A.now() + 0.01, 0.8, 1.0);
      if (done) return;
      played.push({ m, si, f });
      fb.mark(played.map(p => ({ s: p.si, f: p.f, kind: 'tone', label: noteName(p.m) })));
      renderSlots();
      if (played.length === lick.length) check(false);
    };
    const fb = Fretboard({ onTap: (si, f) => add(si, f, false) });
    // Played on the guitar: place each heard note near the previous one on the neck
    let micOff = null;
    const placeNote = m => {
      const prev = played.length ? played[played.length - 1] : { si: 2, f: 5 };
      let best = null;
      E.STRINGS.forEach((st, si) => { const f = m - st.midi; if (f >= 0 && f <= 12) { const cost = Math.abs(f - prev.f) + Math.abs(si - prev.si) * 1.5; if (!best || cost < best.cost) best = { si, f, cost }; } });
      return best;
    };
    const mic = MicToggle({ label: 'Answer by playing', onLabel: 'Listening: play it back', hint: 'Play after the phrase ends. Any octave counts.',
      onOn: () => { micOff = Mic.on('note', ev => { const p = placeNote(Math.round(ev.midi)); if (p) add(p.si, p.f, true); }); },
      onOff: () => { if (micOff) micOff(); micOff = null; } });
    const playBtn = h('button', { class: 'btn primary' }, '▶ Play phrase');
    const undoBtn = h('button', { class: 'btn small' }, 'Undo');
    const giveBtn = h('button', { class: 'btn small ghost' }, 'Show answer');
    card.append(prompt, sub, h('div', { class: 'row' }, playBtn, undoBtn, giveBtn), mic.el, slots, fb.el, fbk);
    function renderSlots() {
      slots.innerHTML = '';
      lick.forEach((m, i) => slots.append(h('span', { class: 'chip', text: played[i] ? noteName(played[i].m) : '·' })));
    }
    function playLick() {
      const at = A.now() + 0.05;
      A.strum([tonic - 12, tonic - 5, tonic, tonic + (sc.steps.includes(3) && !sc.steps.includes(4) ? 3 : 4)], at, 0.4, 0.02, 0.9);
      lick.forEach((m, i) => A.note(m, at + 1.1 + i * 0.42, 0.85, 0.8));
      // don't mistake the app's own phrase for your answer
      Mic.muteUntil(at + 1.1 + lick.length * 0.42 + 0.6 + Mic.latencyMs() / 1000);
    }
    function gen() {
      item = pickFor('callresp', ctx);
      const li = D.LICK_ITEMS.find(x => x.id === item.id);
      sc = D.SCALES.find(x => x.id === li.scale);
      tonic = rand(52, 59);
      const poolN = [];
      [-12, 0, 12].forEach(o => sc.steps.forEach(st => { const m = tonic + o + st; if (m >= tonic - 5 && m <= tonic + 16) poolN.push(m); }));
      poolN.sort((a, b) => a - b);
      let idx = poolN.indexOf(choice([tonic, tonic + sc.steps[Math.min(2, sc.steps.length - 1)]]));
      if (idx < 0) idx = poolN.indexOf(tonic);
      lick = [poolN[idx]];
      for (let i = 1; i < li.len; i++) {
        const mv = choice([-2, -1, -1, 1, 1, 2, 1, -1, 3, -3]);
        idx = Math.max(0, Math.min(poolN.length - 1, idx + mv));
        if (poolN[idx] === lick[lick.length - 1]) idx = Math.max(0, Math.min(poolN.length - 1, idx + (idx > 0 ? -1 : 1)));
        lick.push(poolN[idx]);
      }
      played = []; done = false; fbk.hidden = true; fb.clear();
      prompt.textContent = 'Play it back: ' + li.len + ' notes';
      sub.textContent = sc.name + ' in ' + noteName(tonic) + '. A chord sets the key first.';
      renderSlots();
      setTimeout(playLick, 150);
    }
    function check(gaveUp) {
      done = true;
      let match = 0; lick.forEach((m, i) => { if (played[i] && pc(played[i].m) === pc(m)) match++; });
      const ok = !gaveUp && match === lick.length;
      E.record('callresp', item.id, ok, { score: gaveUp ? 0 : match / lick.length });
      ctx.tick(1);
      // show answer positions near the first played or around fret 5
      const ans = lick.map(m => { let best = null; E.STRINGS.forEach((st, si) => { const f = m - st.midi; if (f >= 0 && f <= 12) { const cost = Math.abs(f - 5) + si * 0.1; if (!best || cost < best.cost) best = { s: si, f, cost }; } }); return best; }).filter(Boolean);
      fb.mark(ans.map((a, i) => ({ s: a.s, f: a.f, kind: played[i] && pc(played[i].m) === pc(lick[i]) ? 'good' : 'g3', label: String(i + 1) })));
      fbk.hidden = false; fbk.className = 'feedback ' + (ok ? 'ok' : 'no'); fbk.innerHTML = '';
      fbk.append(h('b', { text: ok ? 'Spot on.' : gaveUp ? 'Here it is.' : match + ' of ' + lick.length + ' notes right.' }), h('span', { text: 'The phrase: ' + lick.map(noteName).join(' – ') + '. Numbers on the neck show one way to play it.' }),
        h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: playLick }, 'Hear again'), h('button', { class: 'btn primary small', onclick: gen }, 'Next →')));
    }
    playBtn.onclick = () => { A.ensure(); playLick(); };
    undoBtn.onclick = () => { if (done) return; played.pop(); fb.mark(played.map(p => ({ s: p.si, f: p.f, kind: 'tone', label: noteName(p.m) }))); renderSlots(); };
    giveBtn.onclick = () => { if (!done) check(true); };
    gen();
    return () => mic.cleanup();
  }
});

/* ---- Chords for repertoire ---- */

tool('repertoire', {
  tab: 'play', skill: 'repertoire', title: 'Repertoire gym', eyebrow: 'Play · standards & world grooves',
  desc: 'Loop the changes in the right groove, see guide tones on the neck, and drill them until you hear the form.',
  render(body, ctx) {
    let tune = D.TUNES.find(t => t.id === ctx.params.tune);
    const listCard = h('div', { class: 'section' });
    const tuneCard = h('div', { class: 'section' });
    body.append(listCard, tuneCard);
    let loop = null, drillCleanup = null;
    function stopLoop() { if (loop) loop.stop(); loop = null; ctx.setActive(false); }
    function showList() {
      stopLoop(); if (drillCleanup) { drillCleanup(); drillCleanup = null; }
      tuneCard.innerHTML = ''; listCard.innerHTML = '';
      ['Jazz standards', 'Blues, rock & roots', 'World grooves'].forEach(g => {
        listCard.append(h('h2', { text: g }));
        const tl = h('div', { class: 'tools' });
        D.TUNES.filter(t => t.group === g).forEach(t => {
          const st = E.skillState('repertoire').items[t.id];
          tl.append(h('button', { class: 'tile', onclick: () => openTune(t) }, h('span', { class: 't-title', text: t.name }), h('span', { class: 't-desc', text: (t.region ? regionName(t.region) + ' · ' : '') + D.GROOVES[t.groove].name + ' · ' + t.note }), h('span', { class: 't-meter', text: st ? Math.round(st.ema * 100) + '%' : 'new' })));
        });
        listCard.append(tl);
      });
    }
    function openTune(t) {
      tune = t; listCard.innerHTML = ''; tuneCard.innerHTML = '';
      const g = D.GROOVES[t.groove];
      let bpm = t.bpm, blind = false;
      const bars = t.bars.map(b => b.split(' ').map(parseChord));
      const back = h('button', { class: 'btn ghost small', onclick: showList }, '← All tunes');
      const chartEl = h('div', { class: 'cchart' });
      const barEls = [];
      function drawChart() {
        chartEl.innerHTML = ''; barEls.length = 0;
        bars.forEach(b => { const el = h('div', { class: 'cbar' }, b.map(c => blind ? h('span', { class: 'blind', text: '?' }) : h('span', { text: prettySym(c.sym) }))); chartEl.append(el); barEls.push(el); });
      }
      const nowLbl = h('div', { class: 'prompt' });
      const legend = h('p', { class: 'small muted' });
      const fb = Fretboard({ onTap: (si, f) => A.note(E.STRINGS[si].midi + f, A.now() + 0.01, 0.8, 1.2) });
      const tempo = h('input', { type: 'range', min: 50, max: 300, value: bpm, id: 'tune-tempo', 'aria-label': 'Tempo' });
      const tempoLbl = h('span', { class: 'mono small', text: bpm + ' bpm' });
      const playBtn = h('button', { class: 'btn primary' }, '▶ Play changes');
      const blindBtn = h('button', { class: 'btn small', 'aria-pressed': 'false' }, 'Hide chord names');
      const drillBtn = h('button', { class: 'btn brass' }, 'Drill guide tones');
      const drillHolder = h('div');
      const card = h('div', { class: 'card' },
        h('div', { class: 'spread' }, back, h('span', { class: 'eyebrow', text: g.name })),
        h('h2', { text: t.name }), h('p', { class: 'small muted', text: t.note }),
        h('div', { class: 'row' }, playBtn, blindBtn, drillBtn),
        h('label', { class: 'stack', for: 'tune-tempo' }, h('span', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Tempo' }), tempoLbl), tempo),
        nowLbl, fb.el, legend, chartEl);
      tuneCard.append(card, drillHolder);
      function showChord(c) {
        if (!c) return;
        nowLbl.textContent = blind ? 'Listen: what is this chord?' : prettySym(c.sym);
        const tones = [{ p: c.root, kind: 'root' }, { p: (c.root + c.third) % 12, kind: 'g3' }, { p: (c.root + (c.seventh !== null ? c.seventh : c.fifth)) % 12, kind: 'g7' }];
        if (blind) { fb.clear(); return; }
        fb.mark(positionsOfPc(tones.map(x => x.p)).map(m => Object.assign(m, { kind: tones.find(x => x.p === m.p).kind, label: m.p === c.root ? 'R' : m.p === (c.root + c.third) % 12 ? '3' : (c.seventh !== null ? c.label7 : '5') })));
        legend.textContent = 'Gold R = root · filled 3 = third · outlined ' + (c.seventh !== null ? c.label7 : '5') + ' = ' + (c.seventh !== null ? 'seventh' : 'fifth') + '. Connect the 3rds and 7ths by the nearest step.';
      }
      drawChart(); showChord(bars[0][0]);
      function chordAt(bi, step) { const b = bars[bi]; return b.length === 1 ? b[0] : b[step < g.steps / 2 ? 0 : 1]; }
      function voicing(c) {
        let r = 43 + c.root; if (r > 50) r -= 12;
        // shell voicing: root, 7th, 3rd above (or a triad when there is no 7th)
        return c.seventh !== null ? [r, r + c.seventh, r + c.third + 12] : [r, r + c.fifth, r + 12, r + c.third + 12];
      }
      function bassNote(c, kind, nextC, beat) {
        let r = 33 + c.root; if (r > 40) r -= 12;
        if (kind === 'r') return r;
        if (kind === '5') return r + c.fifth;
        if (kind === '3') return r + c.third;
        if (kind === '6') return r + 9;
        if (kind === '7') return r + 10;
        if (kind === '8') return r + 12;
        // walking: beat 0 root, 1 third, 2 fifth, 3 approach to next root
        if (beat === 0) return r;
        if (beat === 1) return r + c.third;
        if (beat === 2) return r + c.fifth;
        let nr = 33 + nextC.root; if (nr > 40) nr -= 12;
        return nr + (Math.random() < 0.5 ? 1 : -1);
      }
      const sdur = () => 60 / bpm / g.spb;
      function play() {
        A.ensure();
        const total = g.steps * bars.length;
        let lastChord = null;
        loop = A.Loop({
          steps: total, stepDur: sdur,
          onStep: (i, tt) => {
            const bi = Math.floor(i / g.steps), st = i % g.steps;
            const c = chordAt(bi, st);
            Object.entries(g.perc).forEach(([name, pat]) => { if (pat[st] !== '.') A.hit(SOUND_FOR[name], tt, pat[st] === 'X' ? 0.9 : 0.55); });
            if (g.comp[st] !== '.') A.strum(voicing(c), tt, g.comp[st] === 'X' ? 0.6 : 0.42, 0.012, t.groove === 'funk' ? 0.1 : ['pompe', 'reggae', 'boomchick', 'shuffle'].includes(t.groove) ? 0.18 : ['swing', 'rock', 'fado'].includes(t.groove) ? 0.35 : 0.6);
            if (g.bass === 'walk') { if (st % g.spb === 0) { const nb = bars[(bi + (st / g.spb === 3 ? 1 : 0)) % bars.length]; const nextC = st / g.spb === 3 ? nb[0] : c; A.note(bassNote(c, 'walk', nextC, st / g.spb), tt, 0.75, 0.55); } }
            else if (g.bass[st] !== '.') A.note(bassNote(c, g.bass[st]), tt, 0.75, 0.6);
          },
          onVisual: i => {
            const bi = Math.floor(i / g.steps), st = i % g.steps;
            const c = chordAt(bi, st);
            if (st === 0 || (bars[bi].length > 1 && st === g.steps / 2)) {
              barEls.forEach((el, k) => el.classList.toggle('now', k === bi));
              if (c !== lastChord) { showChord(c); lastChord = c; }
            }
          }
        });
        loop.start(); playBtn.textContent = '■ Stop'; ctx.setActive(true); ctx.timeSkill = 'repertoire';
      }
      playBtn.onclick = () => { if (loop) { stopLoop(); playBtn.textContent = '▶ Play changes'; } else play(); };
      tempo.oninput = () => { bpm = +tempo.value; tempoLbl.textContent = bpm + ' bpm'; };
      blindBtn.onclick = () => { blind = !blind; blindBtn.setAttribute('aria-pressed', String(blind)); blindBtn.textContent = blind ? 'Show chord names' : 'Hide chord names'; drawChart(); showChord(bars[0][0]); };
      drillBtn.onclick = () => { if (drillCleanup) drillCleanup(); drillHolder.innerHTML = ''; drillCleanup = drill(drillHolder, t, bars); drillHolder.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    }
    function drill(holder, t, bars) {
      const all = bars.flat();
      const uniq = []; all.forEach(c => { if (!uniq.some(u => u.sym === c.sym)) uniq.push(c); });
      return Quiz(holder, ctx, () => {
        const c = choice(uniq);
        const want = c.seventh !== null ? [(c.root + c.third) % 12, (c.root + c.seventh) % 12] : [(c.root + c.third) % 12, (c.root + c.fifth) % 12];
        const step2 = c.seventh !== null ? c.label7 : '5th';
        const combos = [];
        // answer choices: correct pair + plausible wrong pairs
        const key = p => flatName(p[0]) + ' & ' + flatName(p[1]);
        const cands = [want, [(c.root + (c.third === 4 ? 3 : 4)) % 12, want[1]], [want[0], (c.root + (c.seventh === 10 ? 11 : 10)) % 12], [(c.root + 7) % 12, c.root], [(want[0] + 1) % 12, (want[1] + 11) % 12]];
        cands.forEach(p => { if (!combos.some(x => key(x) === key(p))) combos.push(p); });
        const opts = shuffle(combos.slice(0, 4));
        const voiceIt = () => { let r = 48 + c.root; A.strum([r - 12].concat(c.iv.map(x => r + x)), A.now() + 0.05, 0.6, 0.02, 1.6); };
        return {
          eyebrow: t.name, prompt: prettySym(c.sym) + ': 3rd & ' + (c.seventh !== null ? c.label7 : '5th') + '?',
          sub: 'Pick the guide tones, then find them on the neck above.', play: voiceIt, replayLabel: 'Hear chord', noAutoplay: false,
          choices: opts.map(p => ({ id: key(p), label: key(p) })), answer: key(want),
          onResult: (ok, id, rt) => E.record('repertoire', t.id, ok, { rt }),
          explain: () => '3rd = ' + flatName(want[0]) + ', ' + step2 + ' = ' + flatName(want[1]) + '. Resolve each by step into the next chord.'
        };
      });
    }
    if (tune) openTune(tune); else showList();
    return () => { stopLoop(); if (drillCleanup) drillCleanup(); };
  }
});

tool('technique', {
  tab: 'play', skill: 'technique', title: 'Technique ladders', eyebrow: 'Play · speed with control',
  desc: 'Play with the click. Clean? It goes up 4 bpm. Two sloppy runs in a row? It drops 8. Your best clean tempo is tracked against a goal.',
  render(body, ctx) {
    const holder = h('div', { class: 'section' }); body.append(holder);
    let loop = null, countTimer = null;
    function stopAll() { if (loop) loop.stop(); loop = null; clearInterval(countTimer); ctx.setActive(false); }
    const dropExtra = () => { if (ctx._cleanupExtra) { ctx._cleanupExtra(); ctx._cleanupExtra = null; } };
    function list() {
      stopAll(); dropExtra(); holder.innerHTML = '';
      const tl = h('div', { class: 'tools' });
      D.EXERCISES.forEach(ex => {
        const t = E.state.tech[ex.id];
        tl.append(h('button', { class: 'tile', onclick: () => open(ex) }, h('span', { class: 't-title', text: ex.name }),
          h('span', { class: 't-desc' }, bar(t && t.best ? 100 * t.best / ex.target : 0, 'brass')),
          h('span', { class: 't-meter', text: (t && t.best ? t.best : '—') + ' / ' + ex.target })));
      });
      holder.append(tl);
    }
    function open(ex) {
      stopAll(); dropExtra(); holder.innerHTML = '';
      const t = E.techState(ex.id);
      const card = h('div', { class: 'card' });
      holder.append(card);
      const back = h('button', { class: 'btn ghost small', onclick: list }, '← All exercises');
      const guide = D.TECHNIQUES.find(g => g.id === ex.id);
      card.append(h('div', { class: 'spread' }, back, h('span', { class: 'eyebrow', text: ex.unit })), h('h2', { text: ex.name }), h('p', { class: 'small', text: ex.how }),
        guide ? h('div', { class: 'row' }, h('button', { class: 'btn small ghost', onclick: () => techniquePage(guide, () => openTool('technique', { params: { exercise: ex.id } })) }, 'Read the full guide: how, why and what to listen for →')) : null);
      const best = h('p', { class: 'small muted' });
      const progress = h('div');
      function refreshStats() {
        best.textContent = 'Best clean: ' + (t.best || '—') + ' · Goal: ' + ex.target + (ex.mode === 'count' ? ' changes per minute' : ' bpm');
        progress.innerHTML = ''; progress.append(bar(100 * (t.best || 0) / ex.target, 'brass'));
      }
      if (ex.mode === 'count') {
        let count = 0, left = 60;
        const big = h('div', { class: 'big-number mono', text: '0' });
        const clock = h('div', { class: 'phase', text: '60 s' });
        const startBtn = h('button', { class: 'btn primary' }, 'Start 60 seconds');
        const padObj = TapPad(() => { if (left > 0 && left < 60) { count++; big.textContent = count; } }, 'Tap once per clean change');
        card.append(best, progress, h('div', { class: 'spread' }, big, clock), startBtn, padObj.el);
        startBtn.onclick = () => {
          count = 0; left = 60; big.textContent = '0'; startBtn.disabled = true; ctx.setActive(true); A.ensure(); A.hit('clickHi', A.now() + 0.05);
          left = 59.9;
          const t0 = Date.now();
          countTimer = setInterval(() => {
            left = Math.max(0, 60 - (Date.now() - t0) / 1000);
            clock.textContent = Math.ceil(left) + ' s';
            if (left <= 0) { clearInterval(countTimer); A.hit('clickHi', A.now() + 0.02); startBtn.disabled = false; ctx.setActive(false); E.techCount(ex.id, count); ctx.tick(1); refreshStats(); toast(count + ' changes in a minute'); }
          }, 100);
        };
        refreshStats();
        ctx._cleanupExtra = () => padObj.cleanup();
        return;
      }
      const big = h('div', { class: 'big-number mono', text: t.bpm });
      const sub = { '16ths': 4, '8ths': 2, '8th triplets': 3, '16th triplets': 6, quarters: 1 }[ex.unit] || 2;
      const playBtn = h('button', { class: 'btn primary' }, '▶ Click');
      const minus = h('button', { class: 'btn small', onclick: () => { E.setTechBpm(ex.id, t.bpm - 2); big.textContent = t.bpm; restart(); } }, '−2');
      const plus = h('button', { class: 'btn small', onclick: () => { E.setTechBpm(ex.id, t.bpm + 2); big.textContent = t.bpm; restart(); } }, '+2');
      const cleanBtn = h('button', { class: 'btn brass' }, 'Clean ✓');
      const sloppyBtn = h('button', { class: 'btn' }, 'Not clean');
      const note = h('p', { class: 'small muted', text: 'Play 4 bars per attempt. Be honest: clean means even, relaxed and in time.' });
      // with the mic on, a meter shows where each note lands against the click
      const meter = TimingMeter(() => (loop ? { start: loop.startTime, step: 60 / t.bpm / sub } : null), { idle: 'Start the click and play the exercise.', onClean: true });
      const meterBox = h('div', { hidden: true }, meter.el);
      const mic = MicToggle({ label: 'Check my timing', onLabel: 'Listening to your timing', hint: 'Wear headphones so the mic hears your guitar, not the click.',
        onOn: () => { meterBox.hidden = false; meter.reset(); meter.start('onset'); },
        onOff: () => { meterBox.hidden = true; meter.stop(); } });
      ctx._cleanupExtra = () => { meter.stop(); mic.cleanup(); };
      card.append(best, progress, h('div', { class: 'spread' }, h('div', { class: 'row' }, minus, big, plus), playBtn), h('div', { class: 'row' }, cleanBtn, sloppyBtn), mic.el, meterBox, note);
      function start() {
        A.ensure();
        loop = A.Loop({ steps: 4 * sub, stepDur: () => 60 / t.bpm / sub, onStep: (i, tt) => { if (i === 0) A.hit('clickHi', tt, 1); else if (i % sub === 0) A.hit('click', tt, 0.85); else A.hit('click', tt, 0.3); } });
        loop.start(); playBtn.textContent = '■ Stop'; ctx.setActive(true);
      }
      function restart() { meter.reset(); if (loop) { loop.stop(); loop = null; start(); } }
      playBtn.onclick = () => { if (loop) { stopAll(); playBtn.textContent = '▶ Click'; } else { meter.reset(); start(); } };
      cleanBtn.onclick = () => { const before = t.bpm; E.techResult(ex.id, true); big.textContent = t.bpm; refreshStats(); restart(); toast('Clean at ' + before + '. Next: ' + t.bpm + ' bpm'); };
      sloppyBtn.onclick = () => { const before = t.bpm; E.techResult(ex.id, false); big.textContent = t.bpm; refreshStats(); restart(); toast(t.bpm < before ? 'Dropped to ' + t.bpm + ' bpm. Rebuild it clean.' : 'Stay at ' + t.bpm + ' and try again'); };
      refreshStats();
    }
    if (ctx.params.exercise) open(D.EXERCISES.find(e => e.id === ctx.params.exercise)); else list();
    return () => { stopAll(); ctx._cleanupExtra && ctx._cleanupExtra(); };
  }
});
