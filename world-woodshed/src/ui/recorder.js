/* World Woodshed — recording yourself (the buffers and the file are src/recorder.js).
   The last 20 minutes: on a laptop or desktop (not phones, not the Android app) a ⏺ in the top bar keeps the
   mic's last 20 minutes in memory once you switch it on, so a good improvisation can be saved after you played it.
   The switch is kept on this device (localStorage, ROLL_KEY); the browser only lets audio start after a click, so
   when the app opens it starts at your first click or key. Save puts the recording in the Library (status Want to
   learn, so it stays out of the practice plan), where it can be listened to, transcribed or downloaded.
   Record a take (tool `recorder`, on every device): record, listen back, keep it in the Library or delete it.
   Both are fed by Mic.on('block'), so they share the mic with whatever tool is listening. */
import Mic from '../listen.js';
import { h, s, tool, openTool, toast, ui } from './core.js';
import { isNative } from '../native.js';
import { addToLibrary } from '../library.js';
import { entryPage } from './library.js';
import { Ring, ROLL_SECS, TAKE_SECS, encode, clipName, fileName, clock } from '../recorder.js';
import './recorder.css';

export const ROLL_KEY = 'ww-rolling-rec';
// a laptop or desktop: a mouse or trackpad, and not the Android app
export const isLaptop = () => {
  if (isNative()) return false;
  try { return matchMedia('(hover: hover) and (pointer: fine)').matches; } catch (e) { return false; }
};
const wanted = () => { try { return localStorage.getItem(ROLL_KEY) === 'on'; } catch (e) { return false; } };
const setWanted = v => { try { localStorage.setItem(ROLL_KEY, v ? 'on' : 'off'); } catch (e) { /* private mode: on for this visit only */ } };

/* ---------- the last 20 minutes ---------- */
// state: off | waiting (for a first click) | starting | on | denied | unsupported
const R = { state: 'off', ring: null, unsub: null, saving: 0, saved: null, subs: new Set() };
const notify = () => R.subs.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
export const Rolling = {
  get state() { return R.state; },
  get seconds() { return R.ring ? R.ring.seconds : 0; },
  get saving() { return R.saving; },
  get saved() { return R.saved; },
  on(fn) { R.subs.add(fn); return () => R.subs.delete(fn); },
  async start() {
    setWanted(true);
    if (R.unsub) return true;
    R.state = 'starting'; notify();
    const ok = await Mic.start();
    if (!ok) { R.state = Mic.state === 'denied' ? 'denied' : 'unsupported'; notify(); return false; }
    if (!wanted()) { R.state = 'off'; notify(); return false; } // switched off while the mic was opening
    const sr = Mic.sampleRate;
    if (!R.ring || R.ring.sr !== sr) R.ring = Ring(sr, ROLL_SECS);
    if (!R.unsub) R.unsub = Mic.on('block', buf => R.ring.push(buf));
    R.state = 'on'; notify();
    return true;
  },
  stop() {
    setWanted(false);
    if (R.unsub) { R.unsub(); R.unsub = null; }
    R.ring = null; // the memory goes with it
    R.state = 'off'; notify();
  },
  // the last 20 minutes (or all there is) into the Library → entry id
  async save() {
    if (!R.ring || R.ring.seconds < 1) { toast('Nothing recorded yet'); return null; }
    const snap = R.ring.snapshot(ROLL_SECS), at = new Date(), secs = snap.length / snap.sr;
    R.saving = 0.01; notify();
    try {
      const { blob, ext } = await encode(snap, p => { R.saving = Math.max(0.01, p); notify(); });
      const title = clipName('roll', at), mins = Math.max(1, Math.round(secs / 60));
      const id = await addToLibrary({ title, status: 'want', source: 'recorder',
        notes: 'The ' + (mins === 1 ? 'minute' : mins + ' minutes') + ' before you pressed Save, recorded on this computer.',
        files: [new File([blob], fileName(title, ext), { type: blob.type })] });
      R.saved = { id, title, at: Date.now() };
      toast('Saved to the Library: ' + title);
      return id;
    } catch (e) {
      console.error(e); toast('Could not save the recording' + (e && e.message ? ': ' + e.message : ''));
      return null;
    } finally { R.saving = 0; notify(); }
  }
};
// another part of the app closing the mic (a restart for a new sensitivity) mustn't end the recording
Mic.onState(s => {
  if (s === 'off' && R.unsub && R.state === 'on') setTimeout(() => { if (R.unsub && Mic.state === 'off') Mic.start(); }, 300);
});

/* the status, the switch and Save: in the top bar's panel and on the Record a take page */
function rollingPanel() {
  const status = h('p', { class: 'rec-status', 'aria-live': 'polite' });
  const btns = h('div', { class: 'row' });
  const savedRow = h('p', { class: 'small', hidden: true });
  const note = h('p', { class: 'small muted', text: 'It is kept in memory on this computer only. Nothing is saved until you press Save; then it goes to your Library, where you can listen to it, transcribe it or download it.' });
  const el = h('div', { class: 'stack rec-roll' }, status, btns, savedRow, note);
  function paint() {
    const st = R.state;
    el.classList.toggle('on', st === 'on');
    btns.innerHTML = '';
    if (st === 'on') {
      const secs = Rolling.seconds, mins = Math.min(20, Math.ceil(secs / 60));
      status.textContent = secs >= ROLL_SECS - 1 ? 'Keeping the last 20 minutes.' : 'Keeping the last 20 minutes: ' + clock(secs) + ' so far.';
      const label = R.saving ? 'Saving… ' + Math.round(R.saving * 100) + '%' : secs >= 60 ? 'Save the last ' + mins + ' minutes' : 'Save what it has';
      btns.append(h('button', { class: 'btn brass', disabled: R.saving ? true : null, onclick: () => Rolling.save() }, label),
        h('button', { class: 'btn small ghost', onclick: () => Rolling.stop() }, 'Turn off'));
    } else if (st === 'waiting') {
      status.textContent = 'Starts recording at your first click or key.';
      btns.append(h('button', { class: 'btn brass', onclick: () => Rolling.start() }, 'Start now'), h('button', { class: 'btn small ghost', onclick: () => Rolling.stop() }, 'Turn off'));
    } else if (st === 'starting') {
      status.textContent = 'Opening the microphone…';
    } else {
      status.textContent = st === 'denied' ? 'The microphone is blocked. Allow it for this site in your browser settings, then turn this on again.'
        : st === 'unsupported' ? 'This browser can’t use a microphone here.'
        : 'Off. Turn it on and the app keeps the last 20 minutes of what the mic hears, so you can save a good improvisation after you played it.';
      btns.append(h('button', { class: 'btn brass', onclick: () => Rolling.start() }, 'Keep the last 20 minutes'));
    }
    savedRow.innerHTML = '';
    savedRow.hidden = !R.saved;
    if (R.saved) savedRow.append('Saved ', h('b', { text: R.saved.title }), ' ', h('button', { class: 'btn small ghost', onclick: () => { closePop(); entryPage(R.saved.id); } }, 'Open it'));
  }
  paint();
  const off = Rolling.on(paint), tick = setInterval(() => { if (R.state === 'on' && !R.saving) paint(); }, 1000);
  return { el, cleanup: () => { off(); clearInterval(tick); } };
}

/* ---------- the top bar's ⏺ (laptops only) ---------- */
let pop = null, popPanel = null;
function closePop() {
  if (!pop) return;
  pop.remove(); pop = null;
  if (popPanel) { popPanel.cleanup(); popPanel = null; }
  const b = document.getElementById('rec-btn');
  if (b) b.setAttribute('aria-expanded', 'false');
}
function openPop(btn) {
  if (pop) { closePop(); return; }
  popPanel = rollingPanel();
  pop = h('div', { class: 'card rec-pop', role: 'dialog', 'aria-label': 'The last 20 minutes' },
    h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'The last 20 minutes' }), h('button', { class: 'btn small ghost', 'aria-label': 'Close', onclick: closePop }, '✕')),
    popPanel.el,
    h('button', { class: 'btn small', onclick: () => { closePop(); if (!(ui.runner && ui.runner.id === 'recorder')) openTool('recorder', { returnTab: ui.tab }); } }, 'Record a take instead'));
  // under the button, its right edge lined up with it
  const r = btn.getBoundingClientRect();
  pop.style.top = Math.round(r.bottom + 6) + 'px';
  pop.style.right = Math.max(8, Math.round(window.innerWidth - r.right - 4)) + 'px';
  document.body.append(pop);
  btn.setAttribute('aria-expanded', 'true');
}
function topBarButton() {
  const end = document.querySelector('.topbar-end'), fork = document.getElementById('tuner-btn');
  if (!end || document.getElementById('rec-btn')) return;
  const btn = h('button', { class: 'gear rec-btn', id: 'rec-btn', type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': 'false' });
  btn.append(s('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }, s('circle', { cx: 12, cy: 12, r: 8.5 }), s('circle', { class: 'rec-core', cx: 12, cy: 12, r: 4.5 })));
  btn.addEventListener('click', ev => { ev.stopPropagation(); openPop(btn); });
  end.insertBefore(btn, fork || end.firstChild);
  const paint = () => {
    const on = R.state === 'on';
    btn.classList.toggle('live', on);
    btn.classList.toggle('waiting', R.state === 'waiting');
    const t = on ? 'Keeping the last 20 minutes (' + clock(Rolling.seconds) + '): click to save' : R.state === 'waiting' ? 'The last 20 minutes: starts at your first click' : 'Keep the last 20 minutes';
    btn.title = t; btn.setAttribute('aria-label', t);
  };
  paint(); Rolling.on(paint); setInterval(() => { if (R.state === 'on') paint(); }, 5000);
  document.addEventListener('click', ev => { if (pop && !pop.contains(ev.target) && ev.target !== btn && document.body.contains(ev.target)) closePop(); });
  document.addEventListener('keydown', ev => { if (pop && ev.key === 'Escape') { ev.stopPropagation(); closePop(); btn.focus(); } }, true);
}
export function bootRecorder() {
  if (!isLaptop()) return;
  topBarButton();
  if (!wanted()) return;
  // audio can only start after a click or a key, so it waits for the first one
  R.state = 'waiting'; notify();
  const go = () => {
    window.removeEventListener('pointerdown', go, true); window.removeEventListener('keydown', go, true);
    if (R.state === 'waiting') Rolling.start();
  };
  window.addEventListener('pointerdown', go, true); window.addEventListener('keydown', go, true);
}

/* ---------- Record a take ---------- */
// kept outside the page, so a take survives leaving the tool and coming back
const T = { state: 'idle', ring: null, unsub: null, level: 0, blob: null, url: '', ext: '', title: '', at: 0, savedId: null, why: '' };
function dropTake() {
  if (T.url) URL.revokeObjectURL(T.url);
  Object.assign(T, { state: 'idle', ring: null, blob: null, url: '', ext: '', title: '', savedId: null, why: '' });
}
async function startTake() {
  dropTake();
  T.state = 'starting';
  if (!(await Mic.start())) { T.state = 'idle'; T.why = Mic.state === 'denied' ? 'The microphone is blocked. Allow it for this site in your browser settings, then try again.' : 'This browser can’t use a microphone here.'; return; }
  T.ring = Ring(Mic.sampleRate, 0); T.at = Date.now(); T.level = 0;
  T.unsub = Mic.on('block', buf => {
    if (T.state !== 'recording') return;
    let pk = 0;
    for (let i = 0; i < buf.length; i++) { const a = Math.abs(buf[i]); if (a > pk) pk = a; }
    T.level = Math.max(pk, T.level * 0.9);
    T.ring.push(buf);
    if (T.ring.seconds >= TAKE_SECS) stopTake();
  });
  T.state = 'recording';
}
let onTake = null; // the open page's redraw
async function stopTake() {
  if (T.state !== 'recording') return;
  if (T.unsub) { T.unsub(); T.unsub = null; }
  const snap = T.ring.snapshot();
  T.ring = null;
  if (snap.length < snap.sr * 0.5) { dropTake(); T.why = 'That was too short to keep.'; if (onTake) onTake(); return; }
  T.state = 'encoding'; if (onTake) onTake();
  try {
    const { blob, ext } = await encode(snap);
    T.blob = blob; T.ext = ext; T.url = URL.createObjectURL(blob);
    T.title = clipName('take', new Date(T.at)); T.state = 'ready';
  } catch (e) { console.error(e); dropTake(); T.why = 'Could not make the recording' + (e && e.message ? ': ' + e.message : ''); }
  if (onTake) onTake();
}
async function keepTake(title) {
  if (T.state !== 'ready' || !T.blob) return;
  T.title = String(title || '').trim() || T.title;
  T.state = 'saving'; if (onTake) onTake();
  try {
    T.savedId = await addToLibrary({ title: T.title, status: 'want', source: 'recorder', files: [new File([T.blob], fileName(T.title, T.ext), { type: T.blob.type })] });
    T.state = 'saved'; toast('Kept in the Library');
  } catch (e) { console.error(e); T.state = 'ready'; toast('Could not keep it' + (e && e.message ? ': ' + e.message : '')); }
  if (onTake) onTake();
}

tool('recorder', {
  tab: 'play', skill: null, title: 'Record a take', eyebrow: 'Record yourself · listen back',
  desc: 'Record yourself playing, listen back, then keep it in the Library or delete it. On a laptop the app can also keep the last 20 minutes all the time, so a good improvisation can be saved after you played it.',
  render(body) {
    const card = h('div', { class: 'card stack rec-take' });
    let tick = null, confirmDel = false;
    function draw() {
      card.innerHTML = '';
      clearInterval(tick); tick = null;
      if (T.state === 'idle' || T.state === 'starting') {
        card.append(h('p', { text: 'Play something, then listen back. Keep the take in the Library, or delete it and try again.' }),
          h('div', { class: 'row' }, h('button', { class: 'btn brass rec-go', disabled: T.state === 'starting' ? true : null, onclick: async () => { T.why = ''; const p = startTake(); draw(); await p; draw(); } }, h('span', { class: 'rec-dot', 'aria-hidden': 'true' }), T.state === 'starting' ? 'Opening the mic…' : 'Record')),
          T.why ? h('p', { class: 'small muted', text: T.why }) : null);
      } else if (T.state === 'recording') {
        const time = h('b', { class: 'mono rec-time', text: '0:00' }), fill = h('span', { class: 'rec-fill' });
        card.append(h('div', { class: 'spread' }, h('span', { class: 'rec-live' }, h('span', { class: 'rec-dot', 'aria-hidden': 'true' }), 'Recording'), h('span', null, time, h('span', { class: 'small muted', text: ' / ' + clock(TAKE_SECS) }))),
          h('div', { class: 'rec-meter', 'aria-hidden': 'true' }, fill),
          h('button', { class: 'btn primary', onclick: () => stopTake() }, '■ Stop'));
        tick = setInterval(() => {
          if (T.state !== 'recording') return;
          time.textContent = clock(T.ring ? T.ring.seconds : 0);
          fill.style.width = Math.min(100, Math.round(Math.sqrt(T.level) * 100)) + '%';
          T.level *= 0.8;
        }, 100);
      } else if (T.state === 'encoding') {
        card.append(h('p', { text: 'Getting it ready to play…' }));
      } else {
        const name = h('input', { type: 'text', class: 'rec-name', value: T.title, 'aria-label': 'Name', maxlength: '120', disabled: T.state !== 'ready' ? true : null });
        card.append(h('audio', { controls: true, src: T.url, preload: 'metadata', class: 'rec-audio' }));
        if (T.state === 'saved') {
          card.append(h('p', null, 'Kept in the Library as ', h('b', { text: T.title }), '.'),
            h('div', { class: 'row' }, h('button', { class: 'btn brass', onclick: () => { dropTake(); draw(); } }, 'Record another'), h('button', { class: 'btn small', onclick: () => entryPage(T.savedId) }, 'Open it in the Library')));
        } else if (confirmDel) {
          card.append(h('div', { class: 'confirm' }, h('span', { class: 'small', text: 'Delete this take? It was never saved.' }),
            h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => { confirmDel = false; draw(); } }, 'Keep it'), h('button', { class: 'btn small danger', onclick: () => { confirmDel = false; dropTake(); draw(); } }, 'Delete'))));
        } else {
          card.append(h('label', { class: 'stack field' }, h('span', { class: 'eyebrow', text: 'Name' }), name),
            h('div', { class: 'row' }, h('button', { class: 'btn brass', disabled: T.state === 'saving' ? true : null, onclick: () => keepTake(name.value) }, T.state === 'saving' ? 'Keeping it…' : 'Keep it in the Library'),
              h('button', { class: 'btn small ghost', onclick: () => { confirmDel = true; draw(); } }, 'Delete')));
        }
      }
    }
    onTake = draw;
    draw();
    body.append(card);
    let roll = null;
    if (isLaptop()) {
      roll = rollingPanel();
      body.append(h('div', { class: 'card stack' }, h('span', { class: 'eyebrow', text: 'The last 20 minutes' }), roll.el));
    }
    // leaving while recording stops the take; it waits here to be kept or deleted
    return () => { onTake = null; clearInterval(tick); if (roll) roll.cleanup(); if (T.state === 'recording') stopTake(); };
  }
});
