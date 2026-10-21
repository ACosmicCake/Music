/* World Woodshed — microphone UI: the Listen toggle, the settings card and the timing meter */
import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import Mic from '../listen.js';
import { h, s } from './core.js';

const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
const levelPct = rms => Math.max(0, Math.min(100, (20 * Math.log10(Math.max(rms, 1e-5)) + 60) / 50 * 100));

/* A button that switches listening on for one tool. It remembers your choice across tools. */
export function MicToggle(opts = {}) {
  let active = false, offLevel = null;
  const fill = h('i');
  const meter = h('span', { class: 'micmeter', 'aria-hidden': 'true' }, fill);
  const btn = h('button', { class: 'btn micbtn', type: 'button', 'aria-pressed': 'false' });
  btn.innerHTML = ICON;
  const label = h('span', { text: opts.label || 'Listen to my guitar' });
  btn.append(label, meter);
  const note = h('span', { class: 'small muted mic-note', text: opts.hint || '' });
  const wrap = h('div', { class: 'microw' }, btn, note);
  function paint() {
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    label.textContent = active ? (opts.onLabel || 'Listening') : (opts.label || 'Listen to my guitar');
    meter.hidden = !active;
  }
  async function turnOn() {
    label.textContent = 'Starting the mic…';
    const ok = await Mic.start();
    if (!ok) {
      note.textContent = Mic.state === 'denied' ? 'The microphone is blocked. Allow it for this site in your browser settings, then try again.' : 'This browser can’t use a microphone here.';
      paint(); return;
    }
    active = true; Mic.setWanted(true);
    offLevel = Mic.on('level', ev => { fill.style.width = levelPct(ev.rms) + '%'; });
    note.textContent = opts.hint || '';
    paint();
    if (opts.onOn) opts.onOn();
  }
  function turnOff(remember = true) {
    if (!active) return;
    active = false;
    if (offLevel) offLevel(); offLevel = null;
    if (remember) Mic.setWanted(false);
    paint();
    if (opts.onOff) opts.onOff();
  }
  btn.onclick = () => (active ? turnOff() : turnOn());
  paint();
  if (opts.auto !== false && Mic.wanted) setTimeout(turnOn, 0);
  return { el: wrap, get on() { return active; }, cleanup: () => turnOff(false), setHint(t) { note.textContent = t; } };
}

/* Settings: test the input, sensitivity, latency calibration, privacy note */
export function micSettingsCard() {
  let off = null;
  const fill = h('i');
  const meter = h('span', { class: 'micmeter big' }, fill);
  const heard = h('span', { class: 'mono small', text: '—' });
  const sens = h('input', { type: 'range', min: 0, max: 100, value: Math.round((E.state.settings.micSensitivity ?? 0.5) * 100), id: 'mic-sens', 'aria-label': 'Sensitivity' });
  const calInfo = h('p', { class: 'small' });
  const calBtn = h('button', { class: 'btn small' }, 'Calibrate timing');
  const testBtn = h('button', { class: 'btn small' }, 'Test the mic');
  const paintCal = () => { calInfo.textContent = typeof E.state.settings.micLatencyMs === 'number' ? 'Timing correction: ' + E.state.settings.micLatencyMs + ' ms (calibrated).' : 'Timing correction: about ' + Mic.latencyMs() + ' ms (estimated; calibrate for accurate rhythm scores).'; };
  paintCal();
  const stopTest = () => { if (off) { off(); off = null; } testBtn.textContent = 'Test the mic'; heard.textContent = '—'; fill.style.width = '0%'; };
  testBtn.onclick = async () => {
    if (off) { stopTest(); return; }
    if (!(await Mic.start())) { heard.textContent = Mic.state === 'denied' ? 'Microphone blocked by the browser' : 'No microphone available'; return; }
    const a = Mic.on('level', ev => { fill.style.width = levelPct(ev.rms) + '%'; });
    const b = Mic.on('note', ev => { heard.textContent = 'Heard ' + noteLabel(ev.midi); });
    off = () => { a(); b(); };
    testBtn.textContent = 'Stop test';
  };
  sens.onchange = () => { E.setSetting('micSensitivity', +sens.value / 100); Mic.restart(); };
  calBtn.onclick = async () => {
    calBtn.disabled = true; calInfo.textContent = 'Listening to 10 clicks through your speakers. Stay quiet…';
    const ms = await Mic.calibrate(p => { calInfo.textContent = 'Listening… ' + Math.round(p * 100) + '%'; });
    calBtn.disabled = false;
    if (ms === null) calInfo.textContent = 'The mic didn’t hear enough clicks. Turn the speakers up (not headphones), move the phone or laptop closer, and try again.';
    else paintCal();
  };
  const card = h('details', { class: 'card miccard' },
    h('summary', {}, h('span', { class: 'micico' }), h('b', { text: 'Microphone' }), h('span', { class: 'small muted', text: 'Let the app hear your guitar' })),
    h('p', { class: 'small', text: 'Tools with a Listen button can hear you play: the tuner, Fretboard notes, Call & response, Melodic dictation, the rhythm tests, Internal clock, Technique ladders, Scale warm-up, Sight-reading and Sing the degrees. The sound is analysed on this device as you play. Nothing is recorded, saved or sent anywhere, and the mic switches off when you leave the tool.' }),
    h('div', { class: 'row' }, testBtn, meter, heard),
    h('label', { class: 'stack field', for: 'mic-sens' }, h('span', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Sensitivity' }), h('span', { class: 'small muted', text: 'Lower it in a noisy room; raise it for soft fingerstyle' })), sens),
    h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Rhythm timing' }), calInfo,
      h('p', { class: 'small muted', text: 'Calibrate once per device with speakers on. For the rhythm tests and timing meters, wear headphones while you play so the mic hears only your guitar, not the click.' }), h('div', { class: 'row' }, calBtn)));
  card.querySelector('.micico').innerHTML = ICON;
  card.addEventListener('toggle', () => { if (!card.open) stopTest(); });
  return card;
}

export function noteLabel(midi) {
  const names = D.NOTE_NAMES;
  const r = Math.round(midi), c = Math.round((midi - r) * 100);
  return names[((r % 12) + 12) % 12] + (Math.floor(r / 12) - 1) + (Math.abs(c) >= 3 ? ' ' + (c > 0 ? '+' : '−') + Math.abs(c) + '¢' : '');
}

/* Live timing against a grid: where each note you play lands relative to the nearest subdivision.
   grid() returns { start, step } in audio time, or null when nothing is playing. */
export function TimingMeter(grid, opts = {}) {
  const offs = [];
  const W = 320, H = 54;
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'tmeter', role: 'img', 'aria-label': 'Where your notes land: left is early, right is late' });
  const summary = h('div', { class: 'tm-sum' });
  const el = h('div', { class: 'tm' }, h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Your timing' }), h('span', { class: 'small muted', text: 'early ← on the beat → late' })), svg, summary);
  let off = null;
  function draw() {
    svg.innerHTML = '';
    const g = grid();
    const half = g ? g.step / 2 * 1000 : 100, lim = Math.min(half, 120);
    const x = ms => W / 2 + Math.max(-1, Math.min(1, ms / lim)) * (W / 2 - 8);
    svg.append(s('rect', { x: x(-25), y: 6, width: x(25) - x(-25), height: H - 12, rx: 6, class: 'tm-zone' }), s('line', { x1: W / 2, x2: W / 2, y1: 2, y2: H - 2, class: 'tm-center' }));
    offs.forEach((o, i) => svg.append(s('circle', { cx: x(o), cy: H / 2, r: i === offs.length - 1 ? 6 : 4, class: 'tm-dot' + (Math.abs(o) <= 25 ? ' ok' : ''), opacity: 0.25 + 0.75 * (i + 1) / offs.length })));
    if (offs.length < 4) { summary.textContent = offs.length ? 'Keep playing…' : (opts.idle || 'Start the click and play.'); return; }
    const n = offs.length, mean = offs.reduce((a, b) => a + b, 0) / n;
    const mad = offs.reduce((a, b) => a + Math.abs(b), 0) / n;
    const inWin = offs.filter(o => Math.abs(o) <= 25).length / n;
    const sd = Math.sqrt(offs.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
    summary.innerHTML = '';
    summary.append(h('b', { class: 'mono', text: Math.round(inWin * 100) + '% on time' }), h('span', { class: 'mono small', text: '±' + Math.round(mad) + ' ms · ' + (Math.abs(mean) < 6 ? 'centred' : mean > 0 ? 'dragging ' + Math.round(mean) + ' ms' : 'rushing ' + Math.round(-mean) + ' ms') }));
    if (n >= 8 && sd < 2.5) summary.append(h('span', { class: 'small warn', text: 'These are suspiciously perfect: the mic is probably hearing the click. Use headphones.' }));
    else if (n >= 12 && inWin >= 0.85 && opts.onClean) summary.append(h('span', { class: 'small good', text: 'That sounds clean.' }));
    if (opts.onStats) opts.onStats({ n, inWin, mad, mean });
  }
  function startListening(kind = 'onset') {
    stopListening();
    off = Mic.on(kind, ev => {
      const g = grid(); if (!g) return;
      const t = ev.t - Mic.latencyMs() / 1000;
      let o = ((t - g.start) % g.step + g.step) % g.step;
      if (o > g.step / 2) o -= g.step;
      offs.push(o * 1000); if (offs.length > (opts.keep || 24)) offs.shift();
      draw();
    });
  }
  function stopListening() { if (off) off(); off = null; }
  draw();
  return { el, start: startListening, stop: stopListening, reset() { offs.length = 0; draw(); }, get stats() { return offs.slice(); } };
}
