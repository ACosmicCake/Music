/* World Woodshed — Melodic dictation: a cadence or a drone sets the key, a short melody plays, you write it back
   as scale degrees by tapping the degree row, tapping the fretboard, or playing it on the guitar (mic, opt-in). */
import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import Mic from '../listen.js';
import { h, tool, pickFor, Fretboard, hooks } from '../ui/core.js';
import { MicToggle } from '../ui/mic.js';
import { spell, keyPrefersFlats } from '../theory.js';
import { DICT_ITEMS, DICT_SOURCES, dictationItems, genMelody, genRhythm, tonicFor, padFor, degOf } from '../content/dictation.js';
import './dictation.css';

export { dictationItems };

/* ---------- labels: numbers, movable-do solfège, sargam ---------- */
const NUM = ['1', '♭2', '2', '♭3', '3', '4', '♯4', '5', '♭6', '6', '♭7', '7'];
const degInfo = semi => D.DEGREES.find(d => d.semi === semi) || { id: NUM[semi], solf: '', sargam: '' };
// komal notes in lowercase, tivra Ma with a tick: compact enough for the answer slots
const sargamShort = x => (x.startsWith('komal ') ? x.slice(6).toLowerCase() : x.startsWith('tivra ') ? x.slice(6) + '′' : x);
const LABELS = {
  num: semi => NUM[semi],
  solf: semi => degInfo(semi).solf || NUM[semi],
  sargam: semi => sargamShort(degInfo(semi).sargam || '') || NUM[semi]
};

/* ---------- establishing the key ---------- */
const CADS = {
  major: [[0, 4], [5, 4], [7, 4], [0, 4]],    // I IV V I
  minor: [[0, 3], [5, 3], [7, 4], [0, 3]],    // i iv V i
  dorian: [[0, 3], [5, 4], [10, 4], [0, 3]],  // i IV ♭VII i
  minpent: [[0, 3], [5, 3], [10, 4], [0, 3]]  // i iv ♭VII i
};
// root on the low strings (E2 to D♯3), then 5th, octave and 3rd: a guitar-like open voicing
function voicing(tonic, rootSemi, third) {
  const r = 40 + ((((tonic + rootSemi - 40) % 12) + 12) % 12);
  return [r, r + 7, r + 12, r + 12 + third];
}

/* ---------- preferences ---------- */
const prefs = () => Object.assign({ key: 'cadence', labels: 'num', input: 'pad' }, (E.state.settings || {}).dictation || {});
const savePref = p => { try { E.setSetting('dictation', p); } catch (e) { /* settings are a convenience */ } };

/* ---------- picking the item: the engine when it knows the skill, otherwise the same rules locally ---------- */
function localPick(ctx, lastId) {
  const ss = E.skillState('dictation');
  let tier = 1;
  if (ctx.params.test) tier = 5;
  else while (tier < 5) {
    const pool = DICT_ITEMS.filter(x => x.tier <= tier), seen = pool.filter(x => ss.items[x.id]);
    const avg = seen.length ? seen.reduce((a, x) => a + ss.items[x.id].ema, 0) / seen.length : 0;
    if (seen.length / pool.length >= 0.8 && avg >= 0.75) tier++; else break;
  }
  const pool = DICT_ITEMS.filter(x => x.tier <= tier);
  const w = pool.map(x => {
    const it = ss.items[x.id];
    let v = ctx.params.test ? 1 : !it ? 2.2 : 0.35 + (1 - it.ema) * 2.5 + (it.due <= Date.now() ? 1.4 : 0);
    if (x.id === lastId && pool.length > 1) v *= 0.05;
    return v;
  });
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; }
  return pool[pool.length - 1];
}
function chooseItem(ctx, lastId) {
  const forced = ctx.params.item && DICT_ITEMS.find(x => x.id === ctx.params.item);
  if (forced) return forced;
  let got = null;
  try { got = pickFor('dictation', ctx); } catch (e) { got = null; }
  return (got && DICT_ITEMS.find(x => x.id === got.id)) || localPick(ctx, lastId);
}

/* Where to play a note on the neck: close to the previous position */
function placeNear(m, ref) {
  ref = ref || { si: 2, f: 5 };
  let best = null;
  E.STRINGS.forEach((st, si) => {
    const f = m - st.midi;
    if (f >= 0 && f <= 12) { const cost = Math.abs(f - ref.f) + Math.abs(si - ref.si) * 1.5; if (!best || cost < best.cost) best = { si, f, cost }; }
  });
  return best;
}

tool('dictation', {
  tab: 'train', skill: 'dictation', title: 'Melodic dictation', eyebrow: 'Ear · hear it, write it',
  desc: 'A cadence or a drone sets the key, then a short melody plays. Write it back as scale degrees: tap them, tap the fretboard, or play it on your guitar.',
  render(body, ctx) {
    const test = !!ctx.params.test;
    const pref = prefs();
    let item = null, tonic = 60, mel = [], durs = [], entries = [], done = false, result = null, t0 = 0, lastId = null, lastDegs = null, alive = true;
    let drone = null;
    const timers = new Set();
    const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (alive) fn(); }, Math.max(0, ms)); timers.add(id); };
    const stopDrone = () => { if (drone) { drone.stop(); drone = null; } };
    const lab = semi => LABELS[pref.labels](semi);

    /* ----- options ----- */
    function segOf(name, opts, cur, onPick) {
      const el = h('div', { class: 'seg', role: 'group', 'aria-label': name });
      const paint = v => el.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v ? 'true' : 'false'));
      Object.entries(opts).forEach(([v, label]) => el.append(h('button', { type: 'button', 'data-v': v, onclick: () => { paint(v); onPick(v); } }, label)));
      paint(cur);
      return el;
    }
    const keySeg = segOf('Set the key with', { cadence: 'Cadence', drone: 'Drone' }, pref.key, v => { pref.key = v; savePref(Object.assign({}, pref)); });
    const labelSeg = segOf('Labels', { num: '1 2 3', solf: 'Do Re Mi', sargam: 'Sa Re Ga' }, pref.labels, v => {
      pref.labels = v; savePref(Object.assign({}, pref)); renderPad(); renderSlots(); showInput(); if (result) renderFeedback();
    });
    const inputSeg = segOf('Answer with', { pad: 'Degrees', frets: 'Fretboard' }, pref.input, v => { pref.input = v; savePref(Object.assign({}, pref)); showInput(); });

    /* ----- layout ----- */
    const card = h('div', { class: 'card dict' }); body.append(card);
    const eyebrow = h('span', { class: 'eyebrow' });
    const prompt = h('div', { class: 'prompt' });
    const sub = h('p', { class: 'small muted' });
    const playBtn = h('button', { class: 'btn primary', type: 'button', onclick: () => play() }, '▶ Play again');
    const melBtn = h('button', { class: 'btn small', type: 'button', onclick: () => play({ melodyOnly: true }) }, 'Melody only');
    const slowBtn = h('button', { class: 'btn small', type: 'button', onclick: () => play({ melodyOnly: true, speed: 0.6 }) }, 'Slower');
    const tonicBtn = h('button', { class: 'btn small', type: 'button', onclick: () => { A.ensure(); A.fresh(); A.note(tonic, A.now() + 0.03, 0.85, 1.4); muteMic(A.now() + 1.6); } }, 'Tonic');
    const hintBox = h('div', { class: 'hint', hidden: true });
    const slots = h('div', { class: 'dict-slots', role: 'list', 'aria-label': 'Your answer' });
    const pad = h('div', { class: 'dict-pad' });
    const legend = h('p', { class: 'small muted', text: 'Sargam: lowercase is komal (flat), Ma′ is tivra Ma (♯4).' });
    const fb = Fretboard({ label: 'Fretboard: tap the notes of the melody', onTap: (si, f) => add({ m: E.STRINGS[si].midi + f, si, f }, false) });
    const fretBox = h('div', { class: 'stack' }, fb.el, h('p', { class: 'small muted', text: 'Tap each note where you hear it. Any octave counts.' }));
    let micOff = null;
    const mic = MicToggle({
      label: 'Answer by playing', onLabel: 'Listening: play it back', hint: 'Play the melody after it ends, one note at a time. Any octave counts.',
      onOn: () => { micOff = Mic.on('note', ev => { if (done || !item) return; const m = Math.round(ev.midi); const p = placeNear(m, lastPos()); add({ m, si: p ? p.si : undefined, f: p ? p.f : undefined }, true); }); },
      onOff: () => { if (micOff) micOff(); micOff = null; }
    });
    const undoBtn = h('button', { class: 'btn small', type: 'button', onclick: () => undo() }, 'Undo');
    const hintBtn = test ? null : h('button', { class: 'btn small ghost', type: 'button', onclick: () => hint() }, 'First note');
    const giveBtn = h('button', { class: 'btn small ghost', type: 'button', onclick: () => grade(true) }, 'Give up');
    const out = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
    card.append(
      h('div', { class: 'stack' }, eyebrow, prompt, sub),
      h('div', { class: 'row' }, playBtn, melBtn, slowBtn, tonicBtn),
      hintBox,
      slots,
      h('div', { class: 'dict-opts' }, h('div', { class: 'dict-opt' }, h('span', { class: 'eyebrow', text: 'Answer with' }), inputSeg), h('div', { class: 'dict-opt' }, h('span', { class: 'eyebrow', text: 'Labels' }), labelSeg)),
      pad, legend, fretBox, mic.el,
      h('div', { class: 'row' }, undoBtn, hintBtn, giveBtn),
      out,
      h('div', { class: 'dict-opts' }, h('div', { class: 'dict-opt' }, h('span', { class: 'eyebrow', text: 'Set the key with' }), keySeg))
    );

    /* ----- sound ----- */
    const muteMic = until => Mic.muteUntil(until + 0.3 + Mic.latencyMs() / 1000);
    function keyIn(at) {
      if (pref.key === 'drone') {
        drone = A.Drone(50 + degOf(tonic, 50));
        drone.start(at);
        return at + 2.4;
      }
      CADS[DICT_SOURCES[item.src].cad].forEach(([r, th], i) => A.strum(voicing(tonic, r, th), at + i * 0.62, 0.6, 0.02, i === 3 ? 1.0 : 0.6));
      return at + 3 * 0.62 + 1.45;
    }
    function playNotes(notes, at, speed = 1) {
      const beat = 60 / item.bpm / speed;
      let t = at;
      notes.forEach((m, i) => { const d = (durs[i] || 1) * beat; if (m !== null && m !== undefined) A.note(m, t, 0.85, Math.max(0.22, d * 0.85)); t += d; });
      return t;
    }
    function play(opts = {}) {
      if (!item) return 0;
      A.ensure(); A.stopAll(); stopDrone();
      let at = A.now() + 0.08;
      if (!opts.melodyOnly) at = keyIn(at);
      let end = playNotes(opts.notes || mel, at, opts.speed || 1);
      if (opts.then) end = playNotes(opts.then, end + 0.9, opts.speed || 1);
      if (drone) { const d = drone; later(() => { d.stop(); if (drone === d) drone = null; }, (end - A.now() + 0.3) * 1000); }
      muteMic(end);
      return end;
    }

    /* ----- answer row ----- */
    function renderPad() {
      pad.innerHTML = '';
      if (!item) return;
      padFor(item).forEach((semi, i) => {
        const main = lab(semi);
        pad.append(h('button', { class: 'choice' + (semi === 0 ? ' home' : ''), type: 'button', 'data-semi': semi, 'aria-label': 'Degree ' + NUM[semi] + (pref.labels !== 'num' ? ' (' + main + ')' : ''), onclick: () => addDegree(semi) },
          h('b', { text: main }), h('span', { text: pref.labels === 'num' ? (degInfo(semi).solf || '') : NUM[semi] })));
      });
    }
    function showInput() {
      pad.hidden = pref.input !== 'pad';
      legend.hidden = pref.input !== 'pad' || pref.labels !== 'sargam';
      fretBox.hidden = pref.input !== 'frets';
    }
    function renderSlots() {
      slots.innerHTML = '';
      mel.forEach((m, i) => {
        const e = entries[i], want = degOf(m, tonic);
        let cls = 'dict-slot' + (e ? ' filled' : '');
        let extra = null, aria = 'Note ' + (i + 1) + ': ' + (e ? lab(e.deg) : 'empty');
        if (done) {
          const ok = !!e && e.deg === want;
          cls += ok ? ' ok' : ' no';
          if (!ok) { extra = h('small', { text: '→ ' + lab(want) }); aria += ', should be ' + lab(want); }
        } else if (i === entries.length) cls += ' cur';
        slots.append(h('span', { class: cls, role: 'listitem', 'aria-label': aria }, h('b', { text: e ? lab(e.deg) : done ? '–' : '·' }), extra));
      });
    }
    function lastPos() {
      for (let i = entries.length - 1; i >= 0; i--) if (entries[i].si !== undefined) return entries[i];
      return null;
    }
    function markEntries() {
      let ref = null;
      fb.mark(entries.map(e => {
        const p = e.si !== undefined ? { si: e.si, f: e.f } : placeNear(e.m, ref);
        ref = p || ref;
        return p ? { s: p.si, f: p.f, kind: 'tone', label: lab(e.deg) } : null;
      }).filter(Boolean));
    }
    function markAnswer() {
      let ref = lastPos() || entries[0] || null;
      if (ref && ref.si === undefined) ref = null;
      const marks = [];
      mel.forEach((m, i) => {
        const p = placeNear(m, ref); if (!p) return;
        ref = p;
        marks.push({ s: p.si, f: p.f, kind: result.res[i] ? 'good' : 'g3', label: String(i + 1) });
      });
      fb.mark(marks);
    }

    /* ----- entering notes ----- */
    function addDegree(semi) {
      // the octave closest to the note you wrote last (or the tonic), kept on the neck
      const ref = entries.length ? entries[entries.length - 1].m : tonic;
      let m = tonic + semi;
      while (m - ref > 6) m -= 12;
      while (ref - m > 6) m += 12;
      while (m < 40) m += 12;
      while (m > 76) m -= 12;
      add({ m }, false);
    }
    function add(e, heard) {
      if (!item) return;
      A.ensure();
      if (!heard) { A.note(e.m, A.now() + 0.01, 0.8, 0.9); muteMic(A.now() + 0.4); }
      if (done || entries.length >= mel.length) return;
      e.deg = degOf(e.m, tonic);
      entries.push(e);
      renderSlots(); markEntries();
      if (entries.length === mel.length) grade(false);
    }
    function undo() {
      if (done || !entries.length) return;
      entries.pop(); renderSlots(); markEntries();
    }
    function hint() {
      if (done || !item) return;
      const first = degOf(mel[0], tonic);
      hintBox.hidden = false;
      hintBox.textContent = 'It starts on ' + NUM[first] + (degInfo(first).solf ? ' (' + degInfo(first).solf + ', ' + degInfo(first).sargam + ')' : '') + '.';
      A.ensure(); A.stopAll(); stopDrone();
      const at = A.now() + 0.05;
      A.note(tonic, at, 0.8, 0.6); A.note(mel[0], at + 0.7, 0.85, 1.0);
      muteMic(at + 1.8);
    }

    /* ----- grading ----- */
    function grade(gaveUp) {
      if (done || !item) return;
      done = true;
      const res = mel.map((m, i) => !!entries[i] && entries[i].deg === degOf(m, tonic));
      const right = res.filter(Boolean).length, n = mel.length;
      const ok = !gaveUp && right === n, score = gaveUp ? 0 : right / n;
      E.record('dictation', item.id, ok, { rt: Math.round(performance.now() - t0), score });
      if (hooks.signal) hooks.signal('dictation:' + item.id, { score });
      ctx.tick(1);
      result = { res, right, n, ok, gaveUp };
      undoBtn.disabled = true; giveBtn.disabled = true; if (hintBtn) hintBtn.disabled = true;
      renderSlots(); markAnswer(); renderFeedback();
    }
    function renderFeedback() {
      const { res, right, n, ok, gaveUp } = result;
      const minorish = DICT_SOURCES[item.src].steps.includes(3) && !DICT_SOURCES[item.src].steps.includes(4);
      const flats = keyPrefersFlats(degOf(tonic, 0), minorish);
      out.hidden = false; out.className = 'feedback ' + (ok ? 'ok' : 'no'); out.innerHTML = '';
      out.append(h('b', { text: ok ? 'All ' + n + ' notes right.' : gaveUp ? 'Here it is.' : right + ' of ' + n + ' notes right.' }));
      out.append(h('span', { text: 'The melody: ' + mel.map(m => lab(degOf(m, tonic))).join(' – ') + ' (' + mel.map(m => spell(degOf(m, 0), flats)).join(' ') + ').' }));
      const wrong = res.map((r, i) => (r ? null : i)).filter(i => i !== null && entries[i]);
      if (!ok && wrong.length) out.append(h('span', { class: 'small', text: 'Check ' + wrong.map(i => 'note ' + (i + 1) + ' (you wrote ' + lab(entries[i].deg) + ', it was ' + lab(degOf(mel[i], tonic)) + ')').join(', ') + '.' }));
      const yours = entries.map(e => e.m);
      const row = h('div', { class: 'row' }, h('button', { class: 'btn small', type: 'button', onclick: () => play({ melodyOnly: true }) }, 'Hear it'));
      if (!ok && yours.length) {
        row.append(h('button', { class: 'btn small', type: 'button', onclick: () => play({ melodyOnly: true, notes: yours }) }, 'Hear yours'),
          h('button', { class: 'btn small', type: 'button', onclick: () => play({ melodyOnly: true, then: yours }) }, 'Correct, then yours'));
      }
      row.append(h('button', { class: 'btn primary small', type: 'button', onclick: next }, 'Next →'));
      out.append(row);
    }

    /* ----- a new melody ----- */
    function next() {
      if (!alive) return;
      for (const id of timers) clearTimeout(id);
      timers.clear();
      A.stopAll(); stopDrone();
      item = chooseItem(ctx, lastId); lastId = item.id;
      tonic = tonicFor(item);
      mel = genMelody(item, tonic, lastDegs);
      lastDegs = mel.map(m => degOf(m, tonic));
      durs = genRhythm(item, mel.length);
      entries = []; done = false; result = null;
      const src = DICT_SOURCES[item.src];
      const minorish = src.steps.includes(3) && !src.steps.includes(4);
      const keyName = spell(degOf(tonic, 0), keyPrefersFlats(degOf(tonic, 0), minorish)) + ' ' + (item.src === 'major' ? 'major' : src.name.toLowerCase());
      eyebrow.textContent = 'Level ' + item.tier + ' · ' + src.name + (item.rhythm ? ' · mixed rhythm' : '') + (test ? ' · test' : '');
      prompt.textContent = 'Write the melody: ' + mel.length + ' notes';
      sub.textContent = 'Key of ' + keyName + '. The key sounds first, then the melody. Write each note as a degree; any octave counts.';
      hintBox.hidden = true; out.hidden = true; out.innerHTML = '';
      undoBtn.disabled = false; giveBtn.disabled = false; if (hintBtn) hintBtn.disabled = false;
      fb.clear();
      renderPad(); showInput(); renderSlots();
      t0 = performance.now();
      later(() => { play(); t0 = performance.now(); }, 150);
    }

    function onKey(e) {
      const tg = e.target;
      if (tg && /^(INPUT|SELECT|TEXTAREA)$/.test(tg.tagName)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (tg && tg.tagName === 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) return; // the button handles it
      if (e.key === 'Backspace') { e.preventDefault(); undo(); return; }
      if (e.key === 'Enter') { if (done) { e.preventDefault(); next(); } return; }
      if (e.key === 'r' || e.key === 'R') { play(); return; }
      const k = parseInt(e.key, 10), degs = item ? padFor(item) : [];
      if (!done && degs.length <= 9 && k >= 1 && k <= degs.length) addDegree(degs[k - 1]);
    }
    document.addEventListener('keydown', onKey);
    next();
    return () => {
      alive = false;
      for (const id of timers) clearTimeout(id);
      timers.clear();
      stopDrone();
      mic.cleanup();
      document.removeEventListener('keydown', onKey);
    };
  }
});
