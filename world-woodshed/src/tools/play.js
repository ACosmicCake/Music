import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import { guitarMidis } from '../voicings.js';
import { h, s, rand, choice, shuffle, pc, noteName, toast, bar, regionName, TOOLS, tool, openTool, pickFor, Quiz, Fretboard, positionsOfPc, hooks } from '../ui/core.js';
import { TapPad } from './rhythm.js';
import { parseChord, flatName, prettySym } from '../theory.js';
import TN from '../mytunes.js';
import { Band } from '../band.js';
import { techniquePage } from './learn.js';
import Mic from '../listen.js';
import { MicToggle, TimingMeter, noteLabel } from '../ui/mic.js';

/* ======================================================
   PLAY TOOLS
   ====================================================== */
const ROOT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
/* the same chord k semitones higher */
function transposeChord(c, k) {
  if (!k) return c;
  return parseChord(ROOT_NAMES[(c.root + k) % 12] + c.sym.replace(/^[A-G][#b]?/, '')) || c;
}
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
    // a preset from D.TUNES, or one of your own (checked again here: it may come from another device)
    const findTune = id => D.TUNES.find(t => t.id === id) || TN.playable(E.getTune(id));
    let tune = findTune(ctx.params.tune);
    const listCard = h('div', { class: 'section' });
    const tuneCard = h('div', { class: 'section' });
    body.append(listCard, tuneCard);
    let band = null, drillCleanup = null, stopTune = null;
    function stopLoop() { if (band) { band.stop(); if (stopTune) stopTune(); } band = null; ctx.setActive(false); }
    function showList() {
      stopLoop(); if (drillCleanup) { drillCleanup(); drillCleanup = null; }
      tuneCard.innerHTML = ''; listCard.innerHTML = '';
      const tile = t => {
        const st = E.skillState('repertoire').items[t.id];
        return h('button', { class: 'tile', onclick: () => openTune(t) }, h('span', { class: 't-title', text: t.name }), h('span', { class: 't-desc', text: (t.region ? regionName(t.region) + ' · ' : '') + D.GROOVES[t.groove].name + ' · ' + (t.note || t.bars.length + ' bars') }), h('span', { class: 't-meter', text: st ? Math.round(st.ema * 100) + '%' : 'new' }));
      };
      const mine = E.listTunes().map(TN.playable).filter(Boolean);
      listCard.append(h('div', { class: 'spread' }, h('h2', { text: 'Your tunes' }), h('button', { class: 'btn small', onclick: () => editTune() }, '+ New tune')));
      listCard.append(mine.length ? h('div', { class: 'tools' }, mine.map(tile)) : h('p', { class: 'small muted', text: 'Type a chord chart, pick a groove and a tempo, and the band plays it like the tunes below.' }));
      ['Jazz standards', 'Blues, rock & roots', 'World grooves'].forEach(g => {
        listCard.append(h('h2', { text: g }));
        listCard.append(h('div', { class: 'tools' }, D.TUNES.filter(t => t.group === g).map(tile)));
      });
    }
    /* Write a tune, edit one of yours, start your own version of a preset (src), or check a draft made from
       a Transcribe song (fromSong: an editor draft with the song's id). Saved tunes have the shape of D.TUNES
       entries, so openTune and the band treat them the same. */
    function editTune(src, fromSong) {
      stopLoop(); if (drillCleanup) { drillCleanup(); drillCleanup = null; }
      listCard.innerHTML = ''; tuneCard.innerHTML = '';
      const saved = src && src.mine ? E.getTune(src.id) : null;
      const songOf = fromSong ? fromSong.song : saved ? saved.song : null;
      const toSong = () => openTool('transcribe', { params: { song: fromSong.song }, returnTab: 'transcribe' });
      const leave = () => (src ? openTune(src) : fromSong && E.getSong(fromSong.song) ? toSong() : showList());
      const d0 = fromSong || (src ? { name: saved ? src.name : src.name + ' (my version)', chart: TN.chartText(src.bars), groove: src.groove, bpm: src.bpm, form: TN.formText(src.form), note: src.note } : { groove: 'swing', bpm: 120 });
      const name = h('input', { type: 'text', id: 'tune-name', maxlength: 60, value: d0.name || '', placeholder: 'Blues in F' });
      const chart = h('textarea', { id: 'tune-chart', rows: 6, spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', placeholder: 'Dm7 | G7 | Cmaj7 | Cmaj7\nEm7 A7 | Dm7 G7 | C | %' });
      chart.value = d0.chart || '';
      const groove = h('select', { id: 'tune-groove' }, Object.entries(D.GROOVES).map(([k, g]) => h('option', { value: k, text: g.name, selected: k === d0.groove ? true : null })));
      const bpmIn = h('input', { type: 'number', id: 'tune-bpm', min: TN.MIN_BPM, max: TN.MAX_BPM, step: 1, inputmode: 'numeric', value: d0.bpm || 120 });
      const formIn = h('input', { type: 'text', id: 'tune-form', maxlength: 80, autocapitalize: 'characters', autocomplete: 'off', value: d0.form || '', placeholder: 'AABA, or A8 B8' });
      const note = h('input', { type: 'text', id: 'tune-note', maxlength: 120, value: d0.note || '', placeholder: 'Key, feel, what to work on' });
      const warn = {};
      const field = (key, label, input, hint, wide) => {
        warn[key] = h('span', { class: 'small warn', hidden: true });
        return h('label', { class: 'stack field' + (wide ? ' wide' : ''), for: input.id }, h('span', { class: 'eyebrow', text: label }), input, hint ? h('span', { class: 'small muted', text: hint }) : null, warn[key]);
      };
      const preview = h('div', { class: 'cform' }), count = h('p', { class: 'mono small muted' });
      const draft = () => ({ name: name.value, chart: chart.value, groove: groove.value, bpm: bpmIn.value, form: formIn.value, note: note.value, song: songOf });
      const showErrors = errs => Object.entries(warn).forEach(([k, el]) => { el.textContent = errs[k] || ''; el.hidden = !errs[k]; });
      let errTimer = null;
      // the chart as it will be played, redrawn while typing; mistakes are named after a pause, not mid-word
      function redraw() {
        const { bars } = TN.parseChart(chart.value), f = TN.parseForm(formIn.value, bars.length);
        preview.innerHTML = '';
        const form = f.form || [['', bars.length]];
        preview.classList.toggle('longlabels', form.some(x => x[0].length > 2));
        let bi = 0;
        form.forEach(([lbl, len]) => {
          const grid = h('div', { class: 'cchart' });
          for (let k = 0; k < len && bi < bars.length; k++, bi++) grid.append(h('div', { class: 'cbar' }, bars[bi].split(' ').filter(Boolean).map(c => h('span', { text: prettySym(c) }))));
          if (grid.children.length) preview.append(lbl ? h('div', { class: 'csection' }, h('span', { class: 'csec', text: lbl }), grid) : grid);
        });
        count.textContent = bars.length ? bars.length + ' bar' + (bars.length === 1 ? '' : 's') + (f.form ? ' · form ' + f.form.map(x => x[0]).join(' ') : '') : '';
        clearTimeout(errTimer);
        errTimer = setTimeout(() => { if (!name.isConnected) return; const e = TN.checkTune(draft()).errors; delete e.name; if (!chart.value.trim()) delete e.chart; showErrors(e); }, 700);
      }
      chart.oninput = redraw; formIn.oninput = redraw;
      const saveBtn = h('button', { class: 'btn primary', onclick: () => {
        clearTimeout(errTimer);
        const r = TN.checkTune(draft());
        showErrors(r.errors);
        if (!r.tune) { const first = Object.keys(warn).find(k => r.errors[k]); if (first) { const f = warn[first].closest('label'); f.scrollIntoView({ behavior: 'smooth', block: 'center' }); f.querySelector('input, textarea, select').focus({ preventScroll: true }); } return; }
        const t = E.saveTune(saved ? Object.assign({ id: saved.id, created: saved.created }, r.tune) : r.tune);
        toast(saved ? 'Tune saved' : 'Tune added to Your tunes');
        openTune(TN.playable(t));
      } }, saved ? 'Save changes' : 'Save tune');
      const head = h('div', { class: 'spread' }, h('button', { class: 'btn ghost small', onclick: leave }, src ? '← Back to the tune' : fromSong ? '← Back to the song' : '← All tunes'), h('span', { class: 'eyebrow', text: 'Your tunes' }));
      const FROM = { sections: 'one chart section for each of its sections', loop: 'the bars of its loop', song: 'the whole song, bar by bar' };
      const card = h('div', { class: 'card' }, head,
        h('h2', { text: saved ? 'Edit ' + src.name : src ? 'Your version of ' + src.name : fromSong ? 'A tune from ' + fromSong.title : 'New tune' }),
        fromSong ? h('div', { class: 'callout' }, h('p', { class: 'small', text: 'The chords below are guesses from the recording, one or two per bar of your beat grid, taken from ' + (FROM[fromSong.from] || FROM.song) + (fromSong.capped ? ' (the first ' + TN.MAX_BARS + ' bars)' : '') + '. They are a start, not a transcription: play along, fix what sounds wrong, pick a groove, then save.' })) : null,
        h('div', { class: 'formgrid' },
          field('name', 'Name', name, null, true),
          field('chart', 'Chords', chart, 'Bars split by | or new lines, chords in a bar split by spaces (up to four, one per beat). % repeats the bar before. C-7, CΔ7, Cø and C°7 work too.', true),
          field('groove', 'Groove', groove),
          field('bpm', 'Tempo (bpm)', bpmIn),
          field('form', 'Form (optional)', formIn, 'Letters for equal sections, or each section with its bars.'),
          field('note', 'Note (optional)', note)),
        h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'How the band reads it' }), count), preview,
        h('div', { class: 'row' }, saveBtn, h('button', { class: 'btn ghost', onclick: leave }, 'Cancel'),
          saved ? h('button', { class: 'btn ghost', onclick: () => {
            if (card.querySelector('.confirm')) return;
            const c = h('div', { class: 'confirm' }, h('b', { text: 'Delete "' + saved.name + '"?' }),
              h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => c.remove() }, 'Keep it'), h('button', { class: 'btn small danger', onclick: () => { E.deleteTune(saved.id); toast('Tune deleted'); showList(); } }, 'Delete')));
            card.append(c); c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } }, 'Delete') : null));
      tuneCard.append(card);
      redraw();
      if (!src && !fromSong) name.focus();
    }
    function openTune(t) {
      tune = t; listCard.innerHTML = ''; tuneCard.innerHTML = '';
      const g = D.GROOVES[t.groove];
      const engine = t.groove === 'swing' ? 'swing' : t.groove === 'bossa' ? 'bossa' : 'pattern';
      let bpm = t.bpm, blind = false;
      const bars = t.bars.map(b => b.split(' ').map(parseChord));
      const pref = Object.assign({ who: 'full', comp: 'piano', feel: 'walk', countIn: true }, E.state.settings.band || {});
      if (ctx.params.ear) pref.who = 'bd'; // on the go: bass and drums, to hear the form
      const savePref = patch => { Object.assign(pref, patch); E.setSetting('band', Object.assign({}, pref)); };
      const WHO = { full: ['Full band', { drums: true, comp: true, bass: true }], bd: ['Bass & drums', { drums: true, comp: false, bass: true }], bp: ['Bass & ' + (pref.comp === 'guitar' ? 'guitar' : 'piano'), { drums: false, comp: true, bass: true }], bass: ['Just bass', { drums: false, comp: false, bass: true }] };
      // form sections: [label, bars]; one unlabeled section when the tune has none
      const form = t.form || [['', bars.length]];
      // AABA for letter sections (A1, A2 count as A), the names in turn for longer ones
      const formName = f => { const l = f.map(x => x[0].replace(/^([A-Z])\d+$/, '$1')); return l.join(l.every(x => x.length <= 1) ? '' : ' '); };
      const sectionOf = bi => { let n = 0; for (const [lbl, len] of form) { if (bi < n + len) return lbl; n += len; } return ''; };
      const back = h('button', { class: 'btn ghost small', onclick: showList }, '← All tunes');
      const chartEl = h('div', { class: 'cform' });
      const barEls = [];
      let check = !!ctx.params.ear, checks = 0, right = 0, askAt = -1, curBar = 0; // ear: start in 'follow the form by ear' (On the go)
      /* Woodshedding: a key for this run, a key change every chorus (all 12 keys), a looped section, tempo up each chorus */
      let keyBase = 0, keyMove = pref.keyMove || 'same', ramp = pref.ramp || 0, range = null, shownCh = 0;
      const STEP = { same: 0, fourth: 5, half: 1 };
      const shiftFor = ch => ((keyBase + STEP[keyMove] * ch) % 12 + 12) % 12;
      const tCache = {};
      const barsIn = k => tCache[k] || (tCache[k] = bars.map(b => b.map(c => transposeChord(c, k))));
      const barsFor = ch => barsIn(shiftFor(ch));
      const shiftName = k => (k === 0 ? 'original key' : (k <= 6 ? 'up ' + k : 'down ' + (12 - k)) + ' semitone' + ((k <= 6 ? k : 12 - k) === 1 ? '' : 's'));
      function drawChart() {
        chartEl.innerHTML = ''; barEls.length = 0;
        const B = barsFor(shownCh);
        let bi = 0;
        form.forEach(([lbl, len], fi) => {
          const grid = h('div', { class: 'cchart' });
          const first = bi;
          for (let k = 0; k < len && bi < B.length; k++, bi++) {
            const b = B[bi], idx = bi;
            const el = h('div', { class: 'cbar' + (range && (idx < range[0] || idx > range[1]) ? ' out' : ''), onclick: ev => guess(idx, ev) }, b.map(c => blind ? h('span', { class: 'blind', text: '?' }) : h('span', { text: prettySym(c.sym) })));
            grid.append(el); barEls.push(el);
          }
          const last = bi - 1;
          chartEl.append(lbl ? h('div', { class: 'csection' }, h('button', { class: 'csec', title: 'Loop the ' + lbl + ' section', 'aria-label': 'Loop section ' + lbl, onclick: () => setRange(range && range[0] === first && range[1] === last ? null : [first, last]) }, lbl), grid) : grid);
        });
        chartEl.classList.toggle('checking', check);
        chartEl.classList.toggle('longlabels', form.some(f => f[0].length > 2)); // names such as Verse1 go above their bars
      }
      const nowLbl = h('div', { class: 'prompt' });
      const where = h('p', { class: 'mono small muted', text: (t.form ? 'Form ' + formName(t.form) + ' · ' : '') + bars.length + ' bars' });
      const legend = h('p', { class: 'small muted' });
      const fb = Fretboard({ onTap: (si, f) => A.note(E.STRINGS[si].midi + f, A.now() + 0.01, 0.8, 1.2) });
      const tempo = h('input', { type: 'range', min: 50, max: 300, value: bpm, id: 'tune-tempo', 'aria-label': 'Tempo' });
      const tempoLbl = h('span', { class: 'mono small', text: bpm + ' bpm' });
      const playBtn = h('button', { class: 'btn primary' }, '▶ Play changes');
      const blindBtn = h('button', { class: 'btn small', 'aria-pressed': 'false' }, 'Hide chord names');
      const drillBtn = h('button', { class: 'btn brass' }, 'Drill guide tones');
      const drillHolder = h('div');
      const seg = (opts, cur, on) => h('div', { class: 'seg' }, opts.map(([k, lbl]) => h('button', { 'aria-pressed': k === cur ? 'true' : 'false', onclick: e => { [...e.target.parentNode.children].forEach(b => b.setAttribute('aria-pressed', String(b === e.target))); on(k); } }, lbl)));
      const whoSeg = seg(Object.entries(WHO).map(([k, v]) => [k, v[0]]), pref.who, k => { savePref({ who: k }); if (band) band.set({ parts: WHO[k][1] }); });
      const compSeg = engine === 'pattern' ? null : seg([['piano', 'Piano'], ['guitar', 'Guitar']], pref.comp, k => { savePref({ comp: k }); whoSeg.children[2].textContent = 'Bass & ' + (k === 'guitar' ? 'guitar' : 'piano'); if (band) band.set({ comp: k }); });
      const feelSeg = engine === 'swing' ? seg([['walk', 'Walking'], ['two', 'Two-feel']], pref.feel, k => { savePref({ feel: k }); if (band) band.set({ feel: k }); }) : null;
      const tally = h('span', { class: 'small mono' });
      const checkBox = h('input', { type: 'checkbox', checked: check ? true : null, onchange: e => { check = e.target.checked; checks = 0; right = 0; tally.textContent = ''; askAt = -1; drawChart(); if (band) highlight(curBar); showChord(check ? null : barsFor(shownCh)[curBar][0]); } });
      const band_ = h('div', { class: 'bandbox' },
        h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Who plays' }), whoSeg),
        compSeg ? h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Comping' }), compSeg) : null,
        feelSeg ? h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Bass' }), feelSeg) : null,
        h('label', { class: 'check small' }, h('input', { type: 'checkbox', checked: pref.countIn ? true : null, onchange: e => savePref({ countIn: e.target.checked }) }), 'Two-bar count-in'));
      const fromSel = h('select', { id: 'loop-from', 'aria-label': 'Loop from bar' }), toSel = h('select', { id: 'loop-to', 'aria-label': 'Loop to bar' });
      bars.forEach((b, i) => { fromSel.append(h('option', { value: String(i), text: String(i + 1) })); toSel.append(h('option', { value: String(i), text: String(i + 1) })); });
      toSel.value = String(bars.length - 1);
      const loopAll = h('button', { class: 'btn small ghost', onclick: () => setRange(null) }, 'Whole tune');
      const applyRange = () => { let a = +fromSel.value, b = +toSel.value; if (b < a) [a, b] = [b, a]; setRange(a === 0 && b === bars.length - 1 ? null : [a, b]); };
      fromSel.onchange = applyRange; toSel.onchange = applyRange;
      function setRange(r) {
        range = r;
        fromSel.value = String(r ? r[0] : 0); toSel.value = String(r ? r[1] : bars.length - 1);
        loopAll.hidden = !r;
        drawChart(); highlight(curBar);
        if (band) { stopLoop(); play(); }
      }
      const keySel = h('select', { id: 'tune-key', 'aria-label': 'Key', onchange: () => { keyBase = +keySel.value; shownCh = 0; drawChart(); showChord(check ? null : barsFor(0)[0][0]); if (band) { stopLoop(); play(); } } },
        [0, 1, 2, 3, 4, 5, 6, 11, 10, 9, 8, 7].map(k => h('option', { value: String(k), text: k === 0 ? 'Original key' : shiftName(k)[0].toUpperCase() + shiftName(k).slice(1) })));
      const moveSeg = seg([['same', 'Same key'], ['fourth', 'Up a 4th: all 12 keys'], ['half', 'Up a half step']], keyMove, k => { keyMove = k; savePref({ keyMove: k }); });
      const rampSel = h('select', { id: 'tune-ramp', 'aria-label': 'Tempo change each chorus', onchange: () => { ramp = +rampSel.value; savePref({ ramp }); } },
        [0, 2, 4, 6, 8, 10].map(n => h('option', { value: String(n), selected: n === ramp ? true : null, text: n ? '+' + n + ' bpm each chorus' : 'Steady tempo' })));
      loopAll.hidden = true;
      const shed = h('div', { class: 'bandbox shedbox' },
        h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Loop' }), h('div', { class: 'row' }, h('span', { class: 'small', text: 'bars' }), fromSel, h('span', { class: 'small', text: 'to' }), toSel, loopAll)),
        h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Key' }), keySel),
        h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Each chorus' }), moveSeg),
        h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Tempo' }), rampSel),
        t.form ? h('p', { class: 'small muted', text: 'Tip: tap a section letter on the chart to loop just that section.' }) : null);
      const checkCard = h('div', { class: 'callout patina formcheck' },
        h('label', { class: 'check' }, checkBox, h('b', { text: 'Follow the form by ear' })),
        h('p', { class: 'small', text: 'The bar marker and chord readout go dark. Keep your place by listening, best with just the bass. When asked, or whenever you like, tap the bar the band is in. Play over it at the same time if you can: soloing without losing the form is the skill.' }),
        tally);
      const card = h('div', { class: 'card' },
        h('div', { class: 'spread' }, back, h('span', { class: 'eyebrow', text: g.name })),
        h('h2', { text: t.name }), t.note ? h('p', { class: 'small muted', text: t.note }) : null,
        h('div', { class: 'row' }, playBtn, blindBtn, drillBtn),
        h('div', { class: 'row' }, h('button', { class: 'btn small ghost', onclick: () => editTune(t) }, t.mine ? 'Edit this tune' : 'Make your own version'),
          t.song && E.getSong(t.song) ? h('button', { class: 'btn small ghost', onclick: () => openTool('transcribe', { params: { song: t.song }, returnTab: 'transcribe' }) }, 'Open the song in Transcribe') : null),
        h('label', { class: 'stack', for: 'tune-tempo' }, h('span', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Tempo' }), tempoLbl), tempo),
        band_, shed, checkCard,
        h('div', { class: 'spread' }, nowLbl, where), fb.el, legend, chartEl);
      tuneCard.append(card, drillHolder);
      function showChord(c) {
        if (!c) { nowLbl.textContent = check ? 'Listen…' : ''; fb.clear(); legend.textContent = ''; return; }
        nowLbl.textContent = blind ? 'Listen: what is this chord?' : prettySym(c.sym);
        const tones = [{ p: c.root, kind: 'root' }, { p: (c.root + c.third) % 12, kind: 'g3' }, { p: (c.root + (c.seventh !== null ? c.seventh : c.fifth)) % 12, kind: 'g7' }];
        if (blind) { fb.clear(); return; }
        fb.mark(positionsOfPc(tones.map(x => x.p)).map(m => Object.assign(m, { kind: tones.find(x => x.p === m.p).kind, label: m.p === c.root ? 'R' : m.p === (c.root + c.third) % 12 ? '3' : (c.seventh !== null ? c.label7 : '5') })));
        legend.textContent = 'Gold R = root · filled 3 = third · outlined ' + (c.seventh !== null ? c.label7 : '5') + ' = ' + (c.seventh !== null ? 'seventh' : 'fifth') + '. Connect the 3rds and 7ths by the nearest step.';
      }
      function highlight(bi) { barEls.forEach((el, k) => el.classList.toggle('now', !check && k === bi)); }
      drawChart(); showChord(bars[0][0]);
      function flash(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), 1100); }
      function guess(bi, ev) {
        if (!check || !band) return;
        const at = band.barAt(A.eventToAudioTime(ev));
        if (!at) return;
        const into = (A.eventToAudioTime(ev) - at.t) / band.beatDur();
        const prevBar = (at.bi - 1 + bars.length) % bars.length;
        const ok = bi === at.bi || (bi === prevBar && into < 0.6);
        checks++; if (ok) right++;
        E.record('repertoire', t.id, ok);
        flash(barEls[bi], ok ? 'right' : 'wrong');
        if (!ok) flash(barEls[at.bi], 'truth');
        const sec = sectionOf(at.bi);
        nowLbl.textContent = ok ? '✓ Bar ' + (at.bi + 1) + (sec ? ' · ' + sec : '') : 'The band is in bar ' + (at.bi + 1) + (sec ? ' (' + sec + ')' : '') + '. Find your place.';
        tally.textContent = 'Form check: ' + right + ' of ' + checks;
        askAt = -1;
      }
      function report() {
        // your own tunes are not in the planner's catalogue, so only the presets report to it
        if (!t.mine && checks >= 3 && hooks.signal) hooks.signal('tune:' + t.id, { score: right / checks });
      }
      function play() {
        band = Band({
          bars, barsFor, range, groove: g, grooveId: t.groove, bpm: () => bpm, parts: WHO[pref.who][1], comp: pref.comp, feel: pref.feel, countIn: pref.countIn,
          onCount: n => { nowLbl.textContent = n; },
          onChorus: () => { if (ramp) { bpm = Math.min(+tempo.max, bpm + ramp); setTimeout(() => { tempo.value = bpm; tempoLbl.textContent = bpm + ' bpm'; }, 0); } },
          onBeat: ({ bar: bi, beat, chorus, chord }) => {
            if (beat === 0) {
              curBar = bi;
              if (chorus !== shownCh) { const moved = shiftFor(chorus) !== shiftFor(shownCh); shownCh = chorus; if (moved) drawChart(); }
              highlight(bi);
              const sec = sectionOf(bi), k = shiftFor(chorus);
              where.textContent = 'Chorus ' + (chorus + 1) + ' · ' + (check ? '?' : 'bar ' + (bi + 1)) + ' / ' + bars.length + (sec && !check ? ' · ' + sec : '') + (k ? ' · ' + shiftName(k) : '');
              if (check) {
                if (askAt < 0 && chorus + bi > 0 && Math.random() < 0.18) { askAt = bi; nowLbl.textContent = 'Where are we? Tap the bar.'; }
                else if (askAt >= 0 && bi !== askAt && (bi - askAt + bars.length) % bars.length > 2) { askAt = -1; nowLbl.textContent = 'Listen…'; }
              }
            }
            if (!check && (beat === 0 || chord !== lastChord)) { if (chord !== lastChord) showChord(chord); lastChord = chord; }
          }
        });
        let lastChord = null;
        shownCh = 0; drawChart();
        band.start();
        playBtn.textContent = '■ Stop'; ctx.setActive(true); ctx.timeSkill = 'repertoire';
      }
      stopTune = () => { report(); checks = 0; right = 0; };
      playBtn.onclick = () => { if (band) { stopLoop(); playBtn.textContent = '▶ Play changes'; } else play(); };
      tempo.oninput = () => { bpm = +tempo.value; tempoLbl.textContent = bpm + ' bpm'; };
      blindBtn.onclick = () => { blind = !blind; blindBtn.setAttribute('aria-pressed', String(blind)); blindBtn.textContent = blind ? 'Show chord names' : 'Hide chord names'; drawChart(); highlight(curBar); showChord(check ? null : barsFor(shownCh)[curBar][0]); };
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
        const voiceIt = () => A.strum(guitarMidis(c.root, c.iv), A.now() + 0.05, 0.6, 0.02, 1.6);
        return {
          eyebrow: t.name, prompt: prettySym(c.sym) + ': 3rd & ' + (c.seventh !== null ? c.label7 : '5th') + '?',
          sub: 'Pick the guide tones, then find them on the neck above.', play: voiceIt, replayLabel: 'Hear chord', noAutoplay: false,
          choices: opts.map(p => ({ id: key(p), label: key(p) })), answer: key(want),
          onResult: (ok, id, rt) => E.record('repertoire', t.id, ok, { rt }),
          explain: () => '3rd = ' + flatName(want[0]) + ', ' + step2 + ' = ' + flatName(want[1]) + '. Resolve each by step into the next chord.'
        };
      });
    }
    if (ctx.params.draft) editTune(null, ctx.params.draft); else if (tune) openTune(tune); else showList();
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
        const clock = h('div', { class: 'phase', role: 'timer', 'aria-label': 'Time left', text: '60 s' });
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
      // Variations rotate (variable practice); each comes with a cue about the sound, not the hand
      const VX = ex.vars || {}, vars = VX.variations || [];
      let vi = (E.state.settings.techVar || {})[ex.id] || 0, rotate = (E.state.settings.techRotate ?? true);
      const varBox = h('div', { class: 'techvar' });
      const vfb = Fretboard({ onTap: (si, f) => A.note(E.STRINGS[si].midi + f, A.now() + 0.01, 0.8, 1.1) });
      function drawVar() {
        varBox.innerHTML = '';
        if (!vars.length) return;
        const v = vars[vi % vars.length];
        varBox.append(
          h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Variation ' + (vi % vars.length + 1) + ' of ' + vars.length }),
            h('div', { class: 'row' }, h('button', { class: 'mbtn', 'aria-label': 'Previous variation', onclick: () => setVar(vi - 1) }, '‹'), h('button', { class: 'mbtn', 'aria-label': 'Next variation', onclick: () => setVar(vi + 1) }, '›'))),
          h('b', { text: v.name }), h('p', { class: 'small', text: v.how }),
          v.focus ? h('p', { class: 'small muted', text: 'Listen for: ' + v.focus }) : '',
          v.positions && v.positions.length ? vfb.el : '',
          h('label', { class: 'check small' }, h('input', { type: 'checkbox', checked: rotate ? true : null, onchange: e => { rotate = e.target.checked; E.setSetting('techRotate', rotate); } }), 'Change variation after each attempt'));
        if (v.positions && v.positions.length) vfb.mark(v.positions.map(([str, fr], k) => ({ s: 6 - str, f: fr, kind: k === 0 ? 'root' : 'tone', label: String(k + 1) })));
      }
      function setVar(i) { vi = ((i % vars.length) + vars.length) % vars.length; const o = Object.assign({}, E.state.settings.techVar || {}); o[ex.id] = vi; E.setSetting('techVar', o); drawVar(); }
      const cueEl = VX.cue ? h('p', { class: 'small cue', text: '🎧 ' + VX.cue }) : '';
      const burstBtn = h('button', { class: 'btn small', title: VX.burst || 'One bar at +20% tempo, then back to normal' }, '⚡ Burst');
      card.append(best, progress, h('div', { class: 'spread' }, h('div', { class: 'row' }, minus, big, plus), playBtn), varBox, cueEl, h('div', { class: 'row' }, cleanBtn, sloppyBtn, burstBtn), mic.el, meterBox, note,
        VX.burst ? h('p', { class: 'small muted', text: 'Burst: ' + VX.burst }) : '');
      drawVar();
      let burstNext = false, burstOn = false; // a burst starts on the next downbeat and lasts one bar
      function start(at) {
        A.ensure();
        loop = A.Loop({ steps: 4 * sub, stepDur: () => 60 / (t.bpm * (burstOn ? 1.2 : 1)) / sub, onStep: (i, tt) => {
          if (i === 0) { burstOn = burstNext; burstNext = false; }
          if (i === 0) A.hit('clickHi', tt, 1); else if (i % sub === 0) A.hit('click', tt, 0.85); else A.hit('click', tt, 0.3);
        } });
        loop.start(at); playBtn.textContent = '■ Stop'; ctx.setActive(true);
      }
      burstBtn.onclick = () => { burstNext = true; if (!loop) start(); toast('Burst: one bar at ' + Math.round(t.bpm * 1.2) + ' bpm, then back'); };
      function restart() { meter.reset(); if (loop) { loop.stop(); loop = null; start(); } }
      playBtn.onclick = () => { if (loop) { stopAll(); playBtn.textContent = '▶ Click'; } else { meter.reset(); start(); } };
      const sig = { clean: 0, notClean: 0 };
      const report = () => { if (hooks.signal) hooks.signal('tech:' + ex.id, sig); };
      const afterAttempt = () => { if (rotate && vars.length > 1) setVar(vi + 1); };
      cleanBtn.onclick = () => { sig.clean++; report(); const before = t.bpm; E.techResult(ex.id, true); big.textContent = t.bpm; refreshStats(); restart(); afterAttempt(); toast('Clean at ' + before + '. Next: ' + t.bpm + ' bpm'); };
      sloppyBtn.onclick = () => { sig.notClean++; report(); const before = t.bpm; E.techResult(ex.id, false); big.textContent = t.bpm; refreshStats(); restart(); afterAttempt(); toast(t.bpm < before ? 'Dropped to ' + t.bpm + ' bpm. Rebuild it clean.' : 'Stay at ' + t.bpm + ' and try again'); };
      refreshStats();
    }
    if (ctx.params.exercise) open(D.EXERCISES.find(e => e.id === ctx.params.exercise)); else list();
    return () => { stopAll(); ctx._cleanupExtra && ctx._cleanupExtra(); };
  }
});
