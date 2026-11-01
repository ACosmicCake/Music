/* World Woodshed — showing and playing a score inside the app (the Library): MusicXML (.musicxml, .mxl, .xml),
   Guitar Pro (.gp, .gpx, .gp3–.gp5) and MIDI, as notation, tab or both, with playback that follows the music.
   alphaTab (MPL-2.0) draws and plays it with its SONiVOX General MIDI sound font; it is its own chunk, loaded
   the first time a score is opened. A MIDI file is read into a draft (src/midiread.js) and written out as
   MusicXML (src/notate.js) first, since alphaTab reads scores, not performances. */
import * as alphaTab from '@coderline/alphatab';
import { h } from './core.js';
import { parseMidi, midiToDraft } from '../midiread.js';
import { toMusicXML } from '../notate.js';
import { editBeat, beatInfo, pitchName, barsToCheck, LENGTHS } from '../scoreedit.js';

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
  const undoBtn = h('button', { class: 'btn small ghost', disabled: true, onclick: () => { if (!fx.undo.length) return; data = fx.undo.pop(); fx.dirty = true; reload(); } }, 'Undo');
  const fixTools = h('div', { class: 'lib-fixtools', hidden: true, role: 'group', 'aria-label': 'Fix the selected note' },
    h('div', { class: 'row' }, fixInfo),
    h('div', { class: 'row' }, fb('▲', 'up', 'Up a line or space'), fb('▼', 'down', 'Down a line or space'), fb('♯', 'sharp', 'Sharp'), fb('♭', 'flat', 'Flat'), fb('♮', 'natural', 'Natural'),
      fb('8va▲', 'octUp', 'Up an octave'), fb('8va▼', 'octDown', 'Down an octave')),
    h('div', { class: 'row' }, lenSel, dotBtn, restBtn, fb('Delete', 'delete', 'Delete the note'), undoBtn));
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
    fixTools.querySelectorAll('[aria-label="Up a line or space"], [aria-label="Down a line or space"], [aria-label="Sharp"], [aria-label="Flat"], [aria-label="Natural"], [aria-label^="Up an octave"], [aria-label^="Down an octave"]').forEach(b => { b.disabled = info.rest; });
  }
  function apply(op) {
    if (!fx.sel) return;
    const before = xmlText(), after = editBeat(before, fx.sel, op);
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
    if (on) { if (playBtn.textContent === '⏸') api.pause(); describeSel(); } else saveFixes();
  }

  const box = h('div', { class: 'lib-viewer', role: 'dialog', 'aria-modal': 'true', 'aria-label': title || 'Score' },
    h('div', { class: 'lib-vbar' }, closeBtn, playBtn, stopBtn, fixBtn, note),
    h('div', { class: 'lib-vtools' },
      h('span', { class: 'lib-vgroup', role: 'group', 'aria-label': 'Tempo' }, slower, bpmOut, faster, clickBtn),
      h('span', { class: 'lib-vgroup', role: 'group', 'aria-label': 'Section' }, h('span', { class: 'small', text: 'Bars' }), fromIn, h('span', { class: 'small', text: 'to' }), toIn, loopBtn, rampBtn, onlyBtn, cleanBtn),
      h('span', { class: 'lib-vgroup' }, viewSel, zoomSel, trackWrap)),
    h('div', { class: 'lib-vinfo' }, fixTools, recLine, recList, checkNote), pane);
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
  stopBtn.onclick = () => api.stop();
  let ready = false;
  api.playerReady.on(() => { ready = true; playBtn.disabled = false; stopBtn.disabled = false; if (note.textContent.startsWith('Loading the sounds')) note.textContent = ''; });
  api.soundFontLoad.on(e => { if (e.total) note.textContent = 'Loading the sounds… ' + Math.round(e.loaded / e.total * 100) + '%'; });
  // each time the loop comes round: a lap, and 5 beats a minute faster when speeding up
  let lastTick = 0;
  api.playerPositionChanged.on(e => {
    if (sec.loop && !e.isSeek && e.currentTick < lastTick - 10) {
      sec.laps++;
      if (sec.ramp && bpm < written) setBpm(Math.min(written, bpm + 5));
    }
    lastTick = e.currentTick;
  });
  api.playerStateChanged.on(e => {
    const playing = e.state === alphaTab.synth.PlayerState.Playing;
    playBtn.textContent = playing ? '⏸' : '▶'; playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  });

  const close = () => {
    if (closed) return;
    closed = true;
    saveFixes();
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
