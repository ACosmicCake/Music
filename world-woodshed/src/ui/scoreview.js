/* World Woodshed — showing and playing a score inside the app (the Library): MusicXML (.musicxml, .mxl, .xml),
   Guitar Pro (.gp, .gpx, .gp3–.gp5) and MIDI, as notation, tab or both, with playback that follows the music.
   alphaTab (MPL-2.0) draws and plays it with its SONiVOX General MIDI sound font; it is its own chunk, loaded
   the first time a score is opened. A MIDI file is read into a draft (src/midiread.js) and written out as
   MusicXML (src/notate.js) first, since alphaTab reads scores, not performances. */
import * as alphaTab from '@coderline/alphatab';
import { h } from './core.js';
import { parseMidi, midiToDraft } from '../midiread.js';
import { toMusicXML } from '../notate.js';

const BASE = (import.meta.env && import.meta.env.BASE_URL) || '/';
const VIEWS = [['both', 'Both', alphaTab.StaveProfile.Default], ['score', 'Notes', alphaTab.StaveProfile.Score], ['tab', 'Tab', alphaTab.StaveProfile.Tab]];
const SPEEDS = [0.5, 0.6, 0.75, 0.9, 1];
const ZOOMS = [0.7, 0.9, 1.2];
const pref = { view: 'both', speed: 1, zoom: 0 }; // kept while the app is open

/* The bytes alphaTab should read for this file, or throws */
async function scoreBytes(blob, kind) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (kind !== 'midi') return bytes;
  return new TextEncoder().encode(toMusicXML(midiToDraft(parseMidi(bytes))));
}

/* Show a score full screen; resolves with a close function once it has loaded (throws if it can't) */
export async function openScore(blob, { title, kind } = {}, onClose) {
  const data = await scoreBytes(blob, kind);
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
  const speedSel = select('Speed', SPEEDS.map(x => [x, Math.round(x * 100) + '%']), pref.speed, v => { pref.speed = Number(v); api.playbackSpeed = pref.speed; });
  const zoomSel = select('Size', ZOOMS.map((x, i) => [i, ['Small', 'Medium', 'Large'][i]]), pref.zoom, v => { pref.zoom = Number(v); api.settings.display.scale = ZOOMS[pref.zoom]; api.updateSettings(); api.render(); });
  const trackWrap = h('span', { hidden: true });
  const box = h('div', { class: 'lib-viewer', role: 'dialog', 'aria-modal': 'true', 'aria-label': title || 'Score' },
    h('div', { class: 'lib-vbar' }, closeBtn, playBtn, stopBtn, note),
    h('div', { class: 'lib-vtools' }, viewSel, speedSel, zoomSel, trackWrap), pane);
  document.body.append(box);

  const api = new alphaTab.AlphaTabApi(sheet, {
    core: { fontDirectory: BASE + 'font/', engine: 'svg' },
    display: { scale: ZOOMS[pref.zoom], layoutMode: alphaTab.LayoutMode.Page, staveProfile: VIEWS.find(x => x[0] === pref.view)[2] },
    player: { playerMode: alphaTab.PlayerMode.EnabledSynthesizer, soundFont: BASE + 'soundfont/sonivox.sf3', scrollElement: pane, enableCursor: true, enableUserInteraction: true }
  });
  api.playbackSpeed = pref.speed;
  playBtn.onclick = () => api.playPause();
  stopBtn.onclick = () => api.stop();
  api.playerReady.on(() => { playBtn.disabled = false; stopBtn.disabled = false; if (note.textContent.startsWith('Loading the sounds')) note.textContent = ''; });
  api.soundFontLoad.on(e => { if (e.total) note.textContent = 'Loading the sounds… ' + Math.round(e.loaded / e.total * 100) + '%'; });
  api.playerStateChanged.on(e => {
    const playing = e.state === alphaTab.synth.PlayerState.Playing;
    playBtn.textContent = playing ? '⏸' : '▶'; playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  });

  const close = () => {
    if (closed) return;
    closed = true;
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
      note.textContent = 'Loading the sounds…';
      if (tracks.length > 1) {
        trackWrap.hidden = false; trackWrap.innerHTML = '';
        trackWrap.append(select('Part', tracks.map((t, i) => [i, t.name || 'Part ' + (i + 1)]), 0, v => api.renderTracks([score.tracks[Number(v)]])));
      }
    });
    api.renderFinished.on(() => { if (!done) { done = true; resolve(); } });
    try { api.load(data, [0]); } catch (err) { done = true; close(); reject(err); }
  });
  closeBtn.focus();
  return close;
}
