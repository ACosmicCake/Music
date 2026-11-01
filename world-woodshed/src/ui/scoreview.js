/* World Woodshed — showing and playing a score inside the app (the Library): MusicXML (.musicxml, .mxl, .xml),
   Guitar Pro (.gp, .gpx, .gp3–.gp5) and MIDI, as notation, tab or both, with playback that follows the music.
   alphaTab (MPL-2.0) draws and plays it with its SONiVOX General MIDI sound font; it is its own chunk, loaded
   the first time a score is opened. A MIDI file is read into a draft (src/midiread.js) and written out as
   MusicXML (src/notate.js) first, since alphaTab reads scores, not performances. */
import * as alphaTab from '@coderline/alphatab';
import { h } from './core.js';
import { parseMidi, midiToDraft } from '../midiread.js';
import { toMusicXML } from '../notate.js';
import { editBeat, toggleTie, beatInfo, pitchName, barsToCheck, LENGTHS } from '../scoreedit.js';
import { TPQ, expectedFrom, follower } from '../follow.js';
import Mic from '../listen.js';
import A from '../audio.js';

const BASE = (import.meta.env && import.meta.env.BASE_URL) || '/';
const VIEWS = [['both', 'Both', alphaTab.StaveProfile.Default], ['score', 'Notes', alphaTab.StaveProfile.Score], ['tab', 'Tab', alphaTab.StaveProfile.Tab]];
const ZOOMS = [0.7, 0.9, 1.2];
const pref = { view: 'both', zoom: 0, click: false }; // kept while the app is open
const BPM_MIN = 20, BPM_MAX = 300;
/* Bars a recognized score asks to be checked (src/omr/musicxml.js writes them in) */
export function checkBars(bytes) {
  const head = new TextDecoder().decode(bytes.subarray(0, 4096));
  const m = head.match(/<miscellaneous-field name="ww-check-bars">([\d ]+)</);
  return m ? m[1].trim().split(/\s+/).map(Number) : [];
}

/* The bytes alphaTab should read for this file, or throws */
async function scoreBytes(blob, kind) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (kind !== 'midi') return bytes;
  return new TextEncoder().encode(toMusicXML(midiToDraft(parseMidi(bytes))));
}

/* Show a score full screen; resolves with a close function once it has loaded (throws if it can't).
   opts.tempos (from the Library): { list(), mark(from, to, bpm, written) } keeps how fast you can play each
   section cleanly. opts.edit (a score the app read from a page): { save(xmlText) → Promise } lets you fix
   its notes (src/scoreedit.js); the fixes are saved when you leave Fix notes or close the score. */
export async function openScore(blob, { title, kind, tempos, edit } = {}, onClose) {
  let data = await scoreBytes(blob, kind);
  const toCheck = kind === 'musicxml' ? checkBars(data) : [];
  let closed = false;
  const back = document.activeElement;
  const sheet = h('div', { class: 'lib-score' });
  const pane = h('div', { class: 'lib-vpane lib-scorepane' }, sheet);
  const playBtn = h('button', { class: 'btn small brass', disabled: true, 'aria-label': 'Play' }, '▶');
  const stopBtn = h('button', { class: 'btn small', disabled: true, 'aria-label': 'Back to the start' }, '⏮');
  const note = h('span', { class: 'small muted lib-vnote', text: 'Loading…' });
  const closeBtn = h('button', { class: 'btn small', 'aria-label': 'Close' }, '✕');
  const select = (label, opts, value, on) => {
    const s = h('select', { 'aria-label': label, onchange: e => on(e.target.value) }, opts.map(([v, t]) => h('option', { value: v, selected: String(v) === String(value) ? true : null }, t)));
    return s;
  };
  const viewSel = select('Show', VIEWS.map(v => [v[0], v[1]]), pref.view, v => { pref.view = v; api.settings.display.staveProfile = VIEWS.find(x => x[0] === v)[2]; api.updateSettings(); api.render(); });
  const zoomSel = select('Size', ZOOMS.map((x, i) => [i, ['Small', 'Medium', 'Large'][i]]), pref.zoom, v => { pref.zoom = Number(v); api.settings.display.scale = ZOOMS[pref.zoom]; api.updateSettings(); api.render(); });
  const trackWrap = h('span', { hidden: true });

  // the tempo, in beats a minute: the score's own, slowed down or sped up
  let written = 120, bpm = 120, nBars = 0, tempoSet = false;
  const bpmOut = h('output', { class: 'mono lib-bpm', 'aria-live': 'polite' });
  const setBpm = v => {
    bpm = Math.max(BPM_MIN, Math.min(BPM_MAX, Math.round(v)));
    api.playbackSpeed = bpm / written;
    bpmOut.textContent = '♩ ' + bpm + (bpm === written ? '' : ' (' + Math.round(bpm / written * 100) + '%)');
    slower.disabled = bpm <= BPM_MIN; faster.disabled = bpm >= BPM_MAX;
  };
  const slower = h('button', { class: 'btn small', 'aria-label': 'Slower', onclick: () => setBpm(bpm - 5) }, '−');
  const faster = h('button', { class: 'btn small', 'aria-label': 'Faster', onclick: () => setBpm(bpm + 5) }, '+');
  const clickBtn = h('button', { class: 'btn small', 'aria-pressed': String(pref.click), onclick: () => { pref.click = !pref.click; clickBtn.setAttribute('aria-pressed', String(pref.click)); api.metronomeVolume = pref.click ? 1 : 0; } }, 'Click');

  // a section to practise: bars from–to, looped, sped up each time round, or shown alone for reading
  const num = (label, v) => h('input', { type: 'number', min: 1, value: v, inputmode: 'numeric', class: 'lib-barin', 'aria-label': label });
  const fromIn = num('From bar', 1), toIn = num('To bar', 4);
  const sec = { loop: false, ramp: false, only: false, laps: 0 };
  const toggle = (label, key, on) => {
    const b = h('button', { class: 'btn small', 'aria-pressed': 'false', onclick: () => { sec[key] = !sec[key]; b.setAttribute('aria-pressed', String(sec[key])); on(); } }, label);
    return b;
  };
  const loopBtn = toggle('Loop', 'loop', () => applySection());
  const rampBtn = toggle('Speed up', 'ramp', () => {
    sec.laps = 0;
    if (!sec.ramp) return;
    if (!sec.loop) loopBtn.click();
    // start a little under your best clean tempo for these bars (or at 70%), and come up to the written tempo
    const rec = recordFor();
    if (rec && rec.best < written) setBpm(Math.max(BPM_MIN, rec.best - 10));
    else if (bpm >= written) setBpm(written * 0.7);
  });
  rampBtn.title = 'Each time round the loop, 5 beats a minute faster, up to the written tempo';
  const onlyBtn = toggle('Show only these', 'only', () => applyView());
  // how fast you can play these bars: tap Clean when you got through them without a slip at this tempo
  const recordFor = () => { if (!tempos) return null; const [a, b] = range(); return tempos.list().find(r => r.from === a && r.to === b) || null; };
  const cleanBtn = h('button', { class: 'btn small', hidden: !tempos, title: 'You played these bars without a slip at this tempo', onclick: () => {
    const [a, b] = range();
    const before = recordFor();
    tempos.mark(a, b, bpm, written);
    drawRecords();
    recLine.textContent = before && before.best >= bpm ? 'Clean again at ♩' + bpm + '. Your best for bars ' + a + '–' + b + ' is still ♩' + before.best + '.' : 'Bars ' + a + '–' + b + ': clean at ♩' + bpm + (bpm >= written ? ', the written tempo.' : ' (' + Math.round(bpm / written * 100) + '% of ♩' + written + ').');
  } }, 'Clean ✓');
  cleanBtn.setAttribute('aria-label', 'Mark these bars clean at this tempo');
  const recLine = h('p', { class: 'small lib-rec', role: 'status', hidden: !tempos });
  const recList = h('div', { class: 'row lib-recs', hidden: true, role: 'group', 'aria-label': 'Sections you have marked clean' });
  function drawRecords() {
    if (!tempos) return;
    const rec = recordFor(), [a, b] = range();
    recLine.textContent = rec ? 'Bars ' + a + '–' + b + ': clean at ♩' + rec.best + ' of ' + (rec.of || written) + (rec.best >= (rec.of || written) ? ', up to speed.' : ' (' + Math.round(rec.best / (rec.of || written) * 100) + '%).')
      : 'Bars ' + a + '–' + b + ': loop them, and tap Clean when you get through without a slip. The app keeps your best tempo for each section.';
    const all = tempos.list();
    recList.innerHTML = '';
    recList.hidden = !all.length;
    all.forEach(r => recList.append(h('button', { class: 'chip lib-recchip' + (r.best >= (r.of || written) ? ' done' : ''), 'aria-pressed': String(r.from === a && r.to === b), onclick: () => {
      fromIn.value = r.from; toIn.value = r.to; range(); if (sec.loop) applySection(); if (sec.only) applyView(); drawRecords();
    } }, r.from + '–' + r.to + ' · ♩' + r.best)));
  }
  const range = () => {
    let a = Math.max(1, Math.min(nBars || 1, Math.round(Number(fromIn.value) || 1)));
    let b = Math.max(1, Math.min(nBars || 1, Math.round(Number(toIn.value) || a)));
    if (b < a) [a, b] = [b, a];
    fromIn.value = a; toIn.value = b;
    return [a, b];
  };
  function applySection() {
    const sc = api.score;
    if (!sc) return;
    if (sec.loop) {
      const [a, b] = range(), mb = sc.masterBars;
      api.playbackRange = { startTick: mb[a - 1].start, endTick: mb[b - 1].start + mb[b - 1].calculateDuration() };
      api.isLooping = true;
    } else { api.playbackRange = null; api.isLooping = false; }
    sec.laps = 0;
  }
  function applyView() {
    const [a, b] = range();
    api.settings.display.startBar = sec.only ? a : 1;
    api.settings.display.barCount = sec.only ? b - a + 1 : -1;
    api.updateSettings(); api.render();
  }
  [fromIn, toIn].forEach(el => el.addEventListener('change', () => { range(); if (sec.loop) applySection(); if (sec.only) applyView(); drawRecords(); }));
  const checkNote = h('p', { class: 'small lib-check', hidden: true });
  const drawCheck = bars => {
    checkNote.hidden = !bars.length;
    checkNote.textContent = !bars.length ? '' : 'Read from a page by the app. ' + (bars.length === 1 ? 'Bar ' + bars[0] + ' doesn\'t' : 'Bars ' + (bars.length > 10 ? bars.slice(0, 10).join(', ') + '…' : bars.join(', ')) + ' don\'t') + ' add up and may be wrong: compare ' + (bars.length === 1 ? 'it' : 'them') + ' with the page' + (edit ? ' and use Fix notes to correct ' + (bars.length === 1 ? 'it.' : 'them.') : '.');
  };

  // following you with the mic: each note you play is matched to the written one; at the end of a pass the
  // notes are coloured and the bars with the most to fix are offered as a section to loop
  const fo = { on: false, f: null, exp: [], refs: [], tick: 0, wall: 0, playing: false, off: null, styled: [], laps: 0 };
  const followBtn = h('button', { class: 'btn small', 'aria-pressed': 'false', title: 'Play along: the mic hears your notes and marks them on the score', onclick: () => setFollow(!fo.on) }, '🎤 Follow me');
  const soundBtn = h('button', { class: 'btn small', 'aria-pressed': 'false', hidden: true, title: 'With headphones you can hear the score while it listens', onclick: () => {
    const on = soundBtn.getAttribute('aria-pressed') !== 'true';
    soundBtn.setAttribute('aria-pressed', String(on)); muteScore(!on);
  } }, 'Score sound');
  // tapping instead of playing (no mic, or a quiet room): each tap is a note at that moment, timing only
  const tapBtn = h('button', { class: 'btn small brass lib-tap', hidden: true, 'aria-label': 'Tap each note', onpointerdown: e => { e.preventDefault(); placeNote(performance.now(), null); } }, 'Tap');
  const followLine = h('p', { class: 'small lib-follow', role: 'status', 'aria-live': 'polite', hidden: true });
  const followBars = h('div', { class: 'row lib-recs', hidden: true, role: 'group', 'aria-label': 'Bars to work on' });
  const COLORS = { right: [46, 125, 50], early: [183, 121, 31], late: [183, 121, 31], wrong: [198, 40, 40], missed: [140, 140, 140] };
  const track = () => api.score && api.score.tracks[fx.part];
  const muteScore = m => { const t = track(); if (t) api.changeTrackMute([t], m); };
  // the notes to play: every staff and voice of the part, one entry per moment (a tab staff repeats the
  // notation, and a chord may be split across voices), each with the beats to colour
  function buildExpected() {
    const t = track(), at = new Map();
    if (!t) return;
    const range = api.playbackRange;
    t.staves.forEach(st => st.bars.forEach(bar => bar.voices.forEach(v => v.beats.forEach(b => {
      const tick = b.absolutePlaybackStart;
      if (range && (tick < range.startTick || tick >= range.endTick)) return;
      const notes = b.isRest ? [] : b.notes.filter(n => !n.isTieDestination);
      if (!notes.length) return;
      const g = at.get(tick) || { tick, bar: bar.index, notes: [], refs: [] };
      notes.forEach(n => g.notes.push({ midi: n.realValue }));
      g.refs.push(b);
      at.set(tick, g);
    }))));
    const groups = [...at.values()].sort((a, b) => a.tick - b.tick);
    fo.exp = expectedFrom(groups);
    fo.refs = groups.map(g => g.refs);
  }
  function clearColors() {
    if (!fo.styled.length) return;
    fo.styled.forEach(n => { n.style = undefined; });
    fo.styled = [];
    api.render();
  }
  function colorNotes(marks) {
    clearColors();
    const M = alphaTab.model;
    marks.forEach((m, i) => {
      const bs = fo.refs[i];
      if (!m || !bs) return;
      const c = new M.Color(...COLORS[m], 255);
      bs.flatMap(b => b.notes).forEach(n => {
        n.style = new M.NoteStyle();
        n.style.colors.set(M.NoteSubElement.StandardNotationNoteHead, c);
        n.style.colors.set(M.NoteSubElement.GuitarTabFretNumber, c);
        fo.styled.push(n);
      });
    });
    if (fo.styled.length) api.render();
  }
  // a pass from a place in the score (where a repeat goes back to): the notes before it are not part of it
  function startPass(from = -Infinity) {
    buildExpected();
    if (from > -Infinity) {
      const keep = fo.exp.map(x => x.tick >= from - TPQ / 8);
      fo.exp = fo.exp.filter((x, i) => keep[i]); fo.refs = fo.refs.filter((x, i) => keep[i]);
    }
    fo.tried = true;
    fo.f = fo.exp.length ? follower(fo.exp, bpm) : null;
    drawFollow();
  }
  function drawFollow(final) {
    if (!fo.on) return;
    followLine.hidden = false;
    if (!fo.f) { followLine.textContent = !fo.tried || fo.exp.length ? 'Press play and play along: a bar of clicks counts you in, and the notes you play are marked as you go.' : 'There are no notes to follow here.'; return; }
    const r = fo.f.result(), s = r.summary;
    if (!s.total) { followLine.textContent = 'Listening… play along from the count-in.'; return; }
    followLine.textContent = (final ? 'That pass: ' : '') + s.right + ' right · ' + s.timing + ' early or late · ' + s.wrong + ' wrong · ' + s.missed + ' missed' + (final ? ' (' + Math.round(s.score * 100) + '%).' : '');
    if (final) {
      colorNotes(r.marks);
      followBars.innerHTML = '';
      const worst = s.bars.slice(0, 4);
      followBars.hidden = !worst.length;
      if (worst.length) followBars.append(h('span', { class: 'small', text: 'Work on:' }), ...worst.map(b => h('button', { class: 'chip', onclick: () => {
        fromIn.value = Math.max(1, b - 1); toIn.value = Math.min(nBars, b + 1); range();
        if (!sec.loop) loopBtn.click(); else applySection();
        if (sec.only) applyView();
        drawRecords();
      } }, 'bar ' + b)));
    }
  }
  // a pass ends at the end of the score or the loop (all notes count) or where you stopped (later ones don't)
  function endPass(tick = fo.tick) {
    if (!fo.f) return;
    fo.f.passed(tick);
    drawFollow(true);
    fo.f = null;
  }
  // the written place of a tick of the player's clock (they differ once a repeat has been played)
  function writtenTick(tick) {
    const sc = api.score;
    if (!sc || !sc.masterBars.some(m => m.isRepeatStart || m.repeatCount > 0) || !api.tickCache) return tick;
    const r = api.tickCache.findBeat(new Set([fx.part]), tick);
    return r && r.beat ? r.beat.absolutePlaybackStart + Math.max(0, tick - r.start) : tick;
  }
  // a note played (or tapped) at a wall-clock time, placed on the score's clock. alphaTab reports the position
  // every few dozen ms while it plays (and holds still through the count-in), so carry it forward only a short way
  function placeNote(wall, midi) {
    if (!fo.playing || !fo.f) return;
    const tick = fo.tick + Math.max(-250, Math.min(250, wall - fo.wall)) / 1000 * (bpm / 60) * TPQ;
    if (fo.f.heard(tick, midi)) drawFollow();
  }
  async function setFollow(on) {
    if (on) {
      followBtn.textContent = '🎤 Starting…';
      const ok = await Mic.start();
      followBtn.textContent = '🎤 Follow me';
      note.textContent = ok ? '' : (Mic.state === 'denied' ? 'The microphone is blocked, so tap along instead (or allow it for this site).' : 'No microphone here: tap along instead.');
      fo.on = true;
      if (ok) {
        fo.off = Mic.on('note', ev => {
          const ctx = A.ensure();
          placeNote(performance.now() - (ctx.currentTime - ev.t) * 1000 - Mic.latencyMs(), ev.midi);
        });
      }
      tapBtn.hidden = false;
      muteScore(soundBtn.getAttribute('aria-pressed') !== 'true');
      api.countInVolume = 1;
      if (!pref.click) clickBtn.click();
      soundBtn.hidden = false;
      clearColors();
      drawFollow();
    } else {
      fo.on = false;
      if (fo.off) fo.off(); fo.off = null;
      fo.f = null;
      muteScore(false); api.countInVolume = 0;
      soundBtn.hidden = true; tapBtn.hidden = true; followLine.hidden = true; followBars.hidden = true;
      clearColors();
    }
    followBtn.setAttribute('aria-pressed', String(fo.on));
  }

  // fixing the notes the reader got wrong: tap a note, then change it; the file is saved as you leave
  const fx = { on: false, sel: null, undo: [], dirty: false, saving: null, part: 0 };
  const fixBtn = h('button', { class: 'btn small', hidden: !edit, 'aria-pressed': 'false', onclick: () => setFix(!fx.on) }, 'Fix notes');
  const fixInfo = h('span', { class: 'small lib-fixinfo', role: 'status', 'aria-live': 'polite' });
  const fb = (label, op, aria) => h('button', { class: 'btn small', 'aria-label': aria || label, onclick: () => apply(op) }, label);
  const lenSel = h('select', { 'aria-label': 'Note value', onchange: () => apply({ length: lenSel.value, dots: dotBtn.getAttribute('aria-pressed') === 'true' ? 1 : 0 }) },
    LENGTHS.map(l => h('option', { value: l }, { whole: 'Whole', half: 'Half', quarter: 'Quarter', eighth: 'Eighth', '16th': '16th', '32nd': '32nd' }[l])));
  const dotBtn = h('button', { class: 'btn small', 'aria-pressed': 'false', 'aria-label': 'Dotted', onclick: () => {
    const on = dotBtn.getAttribute('aria-pressed') !== 'true';
    apply({ length: lenSel.value, dots: on ? 1 : 0 });
  } }, '•');
  const restBtn = h('button', { class: 'btn small', onclick: () => apply('rest') }, 'Rest');
  const tieBtn = h('button', { class: 'btn small', 'aria-pressed': 'false', 'aria-label': 'Tie to the next note', onclick: () => apply('tie') }, 'Tie ⁀');
  const undoBtn = h('button', { class: 'btn small ghost', disabled: true, onclick: () => { if (!fx.undo.length) return; data = fx.undo.pop(); fx.dirty = true; reload(); } }, 'Undo');
  const fixTools = h('div', { class: 'lib-fixtools', hidden: true, role: 'group', 'aria-label': 'Fix the selected note' },
    h('div', { class: 'row' }, fixInfo),
    h('div', { class: 'row' }, fb('▲', 'up', 'Up a line or space'), fb('▼', 'down', 'Down a line or space'), fb('♯', 'sharp', 'Sharp'), fb('♭', 'flat', 'Flat'), fb('♮', 'natural', 'Natural'),
      fb('8va▲', 'octUp', 'Up an octave'), fb('8va▼', 'octDown', 'Down an octave')),
    h('div', { class: 'row' }, lenSel, dotBtn, restBtn, tieBtn, fb('Delete', 'delete', 'Delete the note'), undoBtn));
  const xmlText = () => new TextDecoder().decode(data);
  function describeSel() {
    const tools = fixTools.querySelectorAll('button:not(.ghost), select');
    if (!fx.sel) { fixInfo.textContent = 'Tap a note or rest on the score to fix it.'; tools.forEach(b => { b.disabled = true; }); return; }
    const info = beatInfo(xmlText(), fx.sel);
    tools.forEach(b => { b.disabled = !info; });
    if (!info) { fixInfo.textContent = 'This one can\'t be changed here: tap another note.'; return; }
    const val = { whole: 'whole', half: 'half', quarter: 'quarter', eighth: 'eighth', '16th': '16th', '32nd': '32nd' }[info.type] || info.type;
    fixInfo.textContent = 'Bar ' + (fx.sel.bar + 1) + ': ' + (info.rest ? (info.dots ? 'dotted ' : '') + val + ' rest' : info.pitches.map(pitchName).join(' + ') + ', ' + (info.dots ? 'dotted ' : '') + val) + (info.tuplet ? ' (triplet)' : '');
    lenSel.value = LENGTHS.includes(info.type) ? info.type : 'quarter';
    dotBtn.setAttribute('aria-pressed', String(info.dots > 0));
    restBtn.textContent = info.rest ? 'Make it a note' : 'Make it a rest';
    tieBtn.setAttribute('aria-pressed', String(!!info.tied));
    tieBtn.disabled = !info.canTie;
    fixTools.querySelectorAll('[aria-label="Up a line or space"], [aria-label="Down a line or space"], [aria-label="Sharp"], [aria-label="Flat"], [aria-label="Natural"], [aria-label^="Up an octave"], [aria-label^="Down an octave"]').forEach(b => { b.disabled = info.rest; });
  }
  function apply(op) {
    if (!fx.sel) return;
    const before = xmlText(), after = op === 'tie' ? toggleTie(before, fx.sel) : editBeat(before, fx.sel, op);
    if (after === before) { describeSel(); return; }
    fx.undo.push(data); if (fx.undo.length > 50) fx.undo.shift();
    data = new TextEncoder().encode(after);
    fx.dirty = true;
    if (op === 'delete') fx.sel = beatInfo(after, fx.sel) ? fx.sel : null;
    reload();
  }
  // the playback cursor marks the note being fixed
  function markSel() {
    const sc = api.score, at = fx.sel;
    try {
      const b = sc.tracks[at.part].staves[at.staff].bars[at.bar].voices[at.voice].beats[at.beat];
      if (b) api.tickPosition = b.absolutePlaybackStart;
    } catch (e) { /* not drawn: nothing to mark */ }
  }
  function reload() {
    undoBtn.disabled = !fx.undo.length;
    drawCheck(barsToCheck(xmlText()));
    api.load(data, [fx.part]);
    describeSel();
  }
  async function saveFixes() {
    if (!fx.dirty || !edit) return;
    fx.dirty = false;
    note.textContent = 'Saving your fixes…';
    try { await (fx.saving = edit.save(xmlText())); note.textContent = 'Fixes saved.'; } catch (e) { fx.dirty = true; note.textContent = 'Could not save the fixes: ' + (e && e.message ? e.message : e); } finally { fx.saving = null; }
  }
  function setFix(on) {
    fx.on = on;
    fixBtn.setAttribute('aria-pressed', String(on));
    fixTools.hidden = !on;
    box.classList.toggle('lib-fixing', on); // the tempo and section controls step aside while you fix notes
    if (on) { if (playBtn.textContent === '⏸') api.pause(); if (fo.on) setFollow(false); describeSel(); } else saveFixes();
  }

  const box = h('div', { class: 'lib-viewer', role: 'dialog', 'aria-modal': 'true', 'aria-label': title || 'Score' },
    h('div', { class: 'lib-vbar' }, closeBtn, playBtn, stopBtn, followBtn, tapBtn, soundBtn, fixBtn, note),
    h('div', { class: 'lib-vtools' },
      h('span', { class: 'lib-vgroup', role: 'group', 'aria-label': 'Tempo' }, slower, bpmOut, faster, clickBtn),
      h('span', { class: 'lib-vgroup', role: 'group', 'aria-label': 'Section' }, h('span', { class: 'small', text: 'Bars' }), fromIn, h('span', { class: 'small', text: 'to' }), toIn, loopBtn, rampBtn, onlyBtn, cleanBtn),
      h('span', { class: 'lib-vgroup' }, viewSel, zoomSel, trackWrap)),
    h('div', { class: 'lib-vinfo' }, fixTools, followLine, followBars, recLine, recList, checkNote), pane);
  document.body.append(box);

  const api = new alphaTab.AlphaTabApi(sheet, {
    core: { fontDirectory: BASE + 'font/', engine: 'svg' },
    display: { scale: ZOOMS[pref.zoom], layoutMode: alphaTab.LayoutMode.Page, staveProfile: VIEWS.find(x => x[0] === pref.view)[2] },
    player: { playerMode: alphaTab.PlayerMode.EnabledSynthesizer, soundFont: BASE + 'soundfont/sonivox.sf3', scrollElement: pane, enableCursor: true, enableUserInteraction: true }
  });
  api.metronomeVolume = pref.click ? 1 : 0;
  drawCheck(toCheck);
  api.beatMouseDown.on(beat => {
    if (!fx.on || !beat || !beat.voice) return;
    const bar = beat.voice.bar;
    fx.sel = { part: bar.staff.track.index, bar: bar.index, staff: bar.staff.index, voice: beat.voice.index, beat: beat.index };
    describeSel();
  });
  playBtn.onclick = () => api.playPause();
  stopBtn.onclick = () => { api.stop(); if (fo.on) endPass(); };
  let ready = false;
  api.playerReady.on(() => { ready = true; playBtn.disabled = false; stopBtn.disabled = false; if (note.textContent.startsWith('Loading the sounds')) note.textContent = ''; });
  api.soundFontLoad.on(e => { if (e.total) note.textContent = 'Loading the sounds… ' + Math.round(e.loaded / e.total * 100) + '%'; });
  // each time the loop comes round: a lap, and 5 beats a minute faster when speeding up
  let lastTick = 0;
  api.playerPositionChanged.on(e => {
    if (sec.loop && !e.isSeek && e.currentTick < lastTick - 10) {
      sec.laps++;
      if (sec.ramp && bpm < written) setBpm(Math.min(written, bpm + 5));
      if (fo.on) { endPass(Infinity); startPass(); } // each time round the loop is a new pass
    }
    if (e.isSeek && fo.on && fo.f) { endPass(); }
    lastTick = e.currentTick;
    // with repeats, the player's clock runs on through the bars played again; the notes are placed by where they
    // are written. Going back to a repeat's start is a new pass, as a loop is
    const w = writtenTick(e.currentTick);
    if (fo.on && fo.f && !e.isSeek && w < fo.tick - TPQ) { endPass(fo.tick); startPass(w); }
    fo.tick = w; fo.wall = performance.now();
    if (fo.f && fo.playing) fo.f.passed(w);
  });
  api.playerFinished.on(() => { if (fo.on) endPass(Infinity); });
  api.playerStateChanged.on(e => {
    const playing = e.state === alphaTab.synth.PlayerState.Playing;
    fo.playing = playing;
    if (playing && fo.on && !fo.f) { clearColors(); startPass(); }
    else if (!playing && fo.on && fo.f) drawFollow();
    playBtn.textContent = playing ? '⏸' : '▶'; playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  });

  const close = () => {
    if (closed) return;
    closed = true;
    saveFixes();
    if (fo.off) fo.off();
    try { api.destroy(); } catch (e) { /* already gone */ }
    box.remove(); document.removeEventListener('keydown', key);
    if (onClose) onClose();
    if (back && back.isConnected && back.focus) back.focus({ preventScroll: true });
  };
  closeBtn.onclick = close;
  const key = e => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === ' ' && e.target === document.body) { e.preventDefault(); if (!playBtn.disabled) api.playPause(); }
  };
  document.addEventListener('keydown', key);

  // wait for the score to load and draw once (or fail), then hand back the close function
  await new Promise((resolve, reject) => {
    let done = false;
    api.error.on(err => { if (!done) { done = true; close(); reject(err instanceof Error ? err : new Error(String(err))); } else note.textContent = 'Playback is not available here.'; });
    api.scoreLoaded.on(score => {
      const tracks = score.tracks || [];
      written = Math.max(BPM_MIN, Math.round(score.tempo || 120));
      nBars = score.masterBars.length;
      fromIn.max = nBars; toIn.max = nBars;
      if (Number(toIn.value) > nBars) toIn.value = nBars;
      if (!tempoSet) { tempoSet = true; setBpm(written); }
      drawRecords();
      if (!ready) note.textContent = 'Loading the sounds…';
      if (tracks.length > 1) {
        trackWrap.hidden = false; trackWrap.innerHTML = '';
        trackWrap.append(select('Part', tracks.map((t, i) => [i, t.name || 'Part ' + (i + 1)]), fx.part, v => { fx.part = Number(v); fx.sel = null; if (fx.on) describeSel(); api.renderTracks([score.tracks[Number(v)]]); }));
      }
    });
    api.renderFinished.on(() => { if (fx.on && fx.sel) markSel(); if (!done) { done = true; resolve(); } });
    try { api.load(data, [0]); } catch (err) { done = true; close(); reject(err); }
  });
  closeBtn.focus();
  return close;
}
