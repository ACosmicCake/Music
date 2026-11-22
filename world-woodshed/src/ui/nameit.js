/* World Woodshed — Name it: what chord, what scale, from anywhere.
   A panel that slides up over whatever page is open (the ♯ button beside the tuner in the top bar, or K and the
   Name it button in Transcribe, full screen included), so a song keeps playing under it. Three sources:
   - the recording: when Transcribe has a song open it registers itself (setSongSource), and the panel names the
     chord at the playhead (every 180 ms while it plays) or the scale over the loop, around the playhead or the
     whole song, from the recording's own sound (chordsFromChroma, notesFromChroma in src/chordid.js);
   - the mic: a strum through ChordEar, or a phrase's notes for the scale;
   - the neck: frets tapped.
   Every name that fits is shown, not only the best (Pan's request): all of nameChord's names for the notes, and
   every scale that holds all the notes heard, with the close fits after them. The full pages (What chord is
   this?, What scale is this?) are still in Train → Guitar → Name it. Choices are kept on this device. */
import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import Mic from '../listen.js';
import { h, s, Fretboard, positionsOfPc, openTool, ui } from './core.js';
import { MicToggle } from './mic.js';
import { keepAwake } from '../native.js';
import { spell, keyPrefersFlats, degreeLabel } from '../theory.js';
import { voicing } from '../voicings.js';
import { nameChord, ChordEar, chordsFromChroma, notesFromChroma, CHORD_TYPES, pcOf } from '../chordid.js';
import { findScales, catalogue } from '../scalefind.js';
import '../tools/whatis.css';
import './nameit.css';

const KEY = 'ww-nameit';
const NOTE = p => D.NOTE_NAMES[pcOf(p)];
const fmt = t => { t = Math.max(0, t || 0); const m = Math.floor(t / 60), x = Math.floor(t - m * 60); return m + ':' + (x < 10 ? '0' : '') + x; };
const minorish = steps => steps.includes(3) && !steps.includes(4);
const stepName = (tonic, x, flats) => (Number.isInteger(x) ? spell(tonic + x, flats) : spell(tonic + Math.ceil(x), flats) + '¼♭');
const scaleTitle = r => spell(r.tonic, keyPrefersFlats(r.tonic, minorish(r.scale.steps))) + ' ' + r.scale.name;
let SCALES = null;
const scaleList = () => SCALES || (SCALES = catalogue(D));

/* ---------- the recording (Transcribe) ---------- */
let song = null;
const songWatch = new Set();
/* src: { name(), now(), playing(), dur(), loop() → { a, b } | null, chroma(a, b) → { pcs, low } | null, seek(t) }, or null */
export function setSongSource(src) { song = src || null; songWatch.forEach(fn => fn()); }

/* ---------- state ---------- */
function loadPrefs() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
const prefs = Object.assign({ mode: 'chord', src: 'mic', small: false, span: 'loop' }, loadPrefs());
const savePrefs = () => { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* private mode */ } };
const S = {
  open: false, pick: 0, hold: false,
  frets: [null, null, null, null, null, null],    // the neck, chord mode
  heard: null,                                     // the mic's chord: { notes, names }
  songNames: [], songAt: null, votes: [],          // the recording's chord at the playhead
  history: [],                                     // [{ sym, names, t (song time) | null }] newest first
  notes: [], tonic: null, scaleOpen: 0, showAll: false, // scale: notes [{ midi, w }]
  songNotes: null, songKey: ''
};
const src = () => (prefs.src === 'song' && !song ? 'mic' : prefs.src);

let panel = null, body = null, timer = 0, mic = null, ear = null, offs = [], lastT = -1, fb = null, btnTop = null;

/* ---------- listening ---------- */
function stopMic() { offs.forEach(f => f()); offs = []; ear = null; keepAwake(false, 'nameit'); }
function startMic() {
  stopMic();
  keepAwake(true, 'nameit');
  if (prefs.mode === 'chord') {
    ear = ChordEar(Mic.sampleRate || A.ensure().sampleRate, { onChord: c => { if (S.hold) return; S.heard = { notes: c.notes, names: c.names }; S.pick = 0; remember(c.names, null); draw(); } });
    offs.push(Mic.on('block', (b, t0) => ear && ear.push(b, t0)), Mic.on('onset', ev => ear && ear.strum(ev.t)));
  } else {
    offs.push(Mic.on('note', ev => { if (S.hold || ev.t - lastT < 0.05) return; lastT = ev.t; addNote(ev.midi); }));
  }
}
/* the chords heard: the mic's newest first; the recording's in song order, one per place, so playing a
   stretch through writes its chords out like a chart */
function remember(names, t) {
  if (!names || !names.length) return;
  const sym = names[0].sym;
  if (t == null) {
    if (S.history[0] && S.history[0].sym === sym && S.history[0].t == null) return;
    S.history = S.history.filter(x => x.t == null);
    S.history.unshift({ sym, names, t });
    if (S.history.length > 12) S.history.pop();
    return;
  }
  S.history = S.history.filter(x => x.t != null && Math.abs(x.t - t) > 1);
  S.history.push({ sym, names, t });
  S.history.sort((a, b) => a.t - b.t);
  if (S.history.length > 48) S.history.shift();
}
function addNote(midi) { S.notes.push({ midi, w: 1 }); if (S.notes.length > 400) S.notes.shift(); S.scaleOpen = 0; draw(); }

/* the recording: the chord at the playhead, and the scale over a span */
function songChord() {
  if (!song || S.hold) return;
  const t = song.now(), playing = song.playing();
  if (!playing && S.songAt !== null && Math.abs(t - S.songAt) < 0.01) return;
  const c = playing ? song.chroma(t - 0.45, t) : song.chroma(t - 0.25, t + 0.35);
  S.songAt = t;
  const names = c ? chordsFromChroma(c.pcs, c.low) : [];
  if (!playing) { S.votes = []; set(names); return; }
  // while it plays, a name shows once two of the last three looks agree, so a passing note doesn't flicker
  S.votes.push(names); if (S.votes.length > 3) S.votes.shift();
  const top = names[0] && names[0].sym;
  if (!top) { if (S.votes.every(v => !v.length)) set([]); return; }
  if (S.votes.filter(v => v[0] && v[0].sym === top).length >= 2) set(names);
  function set(n) {
    const same = n.length && S.songNames.length && n[0].sym === S.songNames[0].sym;
    S.songNames = n;
    if (!same) { S.pick = 0; remember(n, t); }
    if (!same || !playing) draw(); else drawLive();
  }
}
function spanOf() {
  if (!song) return null;
  const lp = song.loop(), d = song.dur(), t = song.now();
  if (prefs.span === 'song') return { a: 0, b: d, label: 'the whole song' };
  if (prefs.span === 'loop' && lp) return { a: lp.a, b: lp.b, label: 'the loop (' + fmt(lp.a) + '–' + fmt(lp.b) + ')' };
  const a = Math.max(0, t - 6), b = Math.min(d, a + 12);
  return { a: Math.max(0, b - 12), b, label: '12 s around the playhead (' + fmt(Math.max(0, b - 12)) + '–' + fmt(b) + ')', around: true };
}
function songScale(force) {
  if (!song) return;
  const sp = spanOf(); if (!sp) return;
  const key = prefs.span + ':' + (sp.around ? Math.round(sp.a / 3) : sp.a.toFixed(2) + '-' + sp.b.toFixed(2));
  if (!force && key === S.songKey) return;
  S.songKey = key; S.songSpan = sp;
  const c = song.chroma(sp.a, sp.b);
  S.songNotes = c ? { notes: notesFromChroma(c.pcs, c.low), pcs: c.pcs } : null;
  S.scaleOpen = 0;
  draw();
}
function tick() {
  if (!S.open) return;
  if (src() === 'song') { if (prefs.mode === 'chord') songChord(); else songScale(false); }
}

/* ---------- the panel ---------- */
function chordNames() {
  const from = src();
  if (from === 'song') return S.songNames;
  if (from === 'mic') return S.heard ? S.heard.names : [];
  const notes = S.frets.map((f, si) => (f === null ? null : E.STRINGS[si].midi + f)).filter(m => m !== null);
  return nameChord(notes);
}
function chordNotes() {
  const from = src();
  if (from === 'mic') return S.heard ? S.heard.notes : [];
  if (from === 'neck') return S.frets.map((f, si) => (f === null ? null : E.STRINGS[si].midi + f)).filter(m => m !== null);
  return [];
}
function hearChord(c) {
  A.ensure(); A.fresh();
  let ms = chordNotes();
  if (!ms.length || src() === 'song') {
    const t = CHORD_TYPES.find(x => x.q === c.q), v = t && voicing(c.root, t.iv);
    ms = v ? v.frets.map((f, si) => (f === null || f < 0 ? null : E.STRINGS[si].midi + f)).filter(m => m !== null) : c.tones.map(x => 48 + x.pc);
  }
  A.strum(ms.slice().sort((a, b) => a - b), A.now() + 0.03, 0.65, 0.022, 2);
}

let liveEl = null;
function drawLive() { if (liveEl && song) liveEl.textContent = 'At ' + fmt(song.now()); }

function draw() {
  if (!panel) return;
  body.innerHTML = '';
  const from = src();
  // the switches: chord or scale, and where the notes come from
  const seg = (items, cur, set, label) => h('div', { class: 'ni-seg', role: 'group', 'aria-label': label }, items.map(([id, text]) =>
    h('button', { class: 'chip', 'aria-pressed': String(cur === id), onclick: () => set(id) }, text)));
  const sources = [song ? ['song', '🎵 Recording'] : null, ['mic', '🎤 Mic'], ['neck', '✋ Neck']].filter(Boolean);
  body.append(h('div', { class: 'ni-bar' },
    seg([['chord', 'Chord'], ['scale', 'Scale']], prefs.mode, m => { prefs.mode = m; savePrefs(); S.pick = 0; S.scaleOpen = 0; S.showAll = false; if (mic && mic.on) startMic(); draw(); tick(); }, 'Name a chord or a scale'),
    seg(sources, from, x => setSrc(x), 'Listen to')));
  if (from === 'mic') body.append(mic.el);
  if (prefs.mode === 'chord') drawChord(from); else drawScale(from);
}
function setSrc(x) {
  prefs.src = x; savePrefs(); S.pick = 0; S.scaleOpen = 0; S.showAll = false; S.songAt = null; S.songKey = '';
  if (x !== 'mic' && mic && mic.on) mic.cleanup();
  draw(); tick();
}

function chordCard(c, names, from) {
  const out = [];
  out.push(h('div', { class: 'ni-head' }, h('div', { class: 'wi-big ni-big', text: c.sym }),
    h('div', { class: 'ni-headside' },
      h('p', { class: 'wi-sub', text: c.name + (c.inversion ? ', ' + c.inversion : '') + (c.slash && !c.inversion ? ', over ' + NOTE(c.bass) + ' in the bass' : '') }),
      from === 'song' ? (liveEl = h('span', { class: 'small muted mono', text: 'At ' + fmt(S.songAt) })) : null)));
  if (prefs.small) return out;
  out.push(h('div', { class: 'wi-tones' }, c.tones.map(t => h('span', { class: 'wi-tone' + (t.heard ? '' : ' off'), title: t.heard ? null : 'not heard' }, h('b', { text: t.name }), h('span', { text: t.deg })))));
  if (c.missing && c.missing.length && from !== 'song') out.push(h('p', { class: 'small muted', text: 'No ' + c.missing.join(' or ') + ': guitarists often leave ' + (c.missing.length > 1 ? 'them' : 'it') + ' out, and the chord keeps its name.' }));
  if (c.extra && c.extra.length) out.push(h('p', { class: 'small muted', text: 'Plus ' + c.extra.map(NOTE).join(', ') + ', which isn’t in this chord.' }));
  if (names.length > 1) out.push(h('div', { class: 'stack wi-also' },
    h('span', { class: 'eyebrow', text: from === 'song' ? 'Every chord it could be (' + names.length + ')' : 'Every name for these notes (' + names.length + ')' }),
    h('div', { class: 'chips' }, names.map((x, i) => h('button', { class: 'chip', 'aria-pressed': String(x === c), title: x.name, onclick: () => { S.pick = i; draw(); } }, x.sym)))));
  out.push(h('div', { class: 'row' },
    h('button', { class: 'btn small', onclick: () => hearChord(c) }, '▶ Hear it'),
    from !== 'neck' ? h('button', { class: 'btn small ghost', 'aria-pressed': String(S.hold), onclick: () => { S.hold = !S.hold; draw(); } }, S.hold ? '❚❚ Held: tap to listen again' : '❚❚ Hold this') : null));
  return out;
}

function drawChord(from) {
  const names = chordNames(), c = names[S.pick] || names[0];
  const res = h('div', { class: 'wi-result ni-result', 'aria-live': 'polite' });
  body.append(res);
  if (c) res.append(...chordCard(c, names, from));
  else {
    const notes = chordNotes(), pcs = [...new Set(notes.map(pcOf))];
    res.append(h('div', { class: 'wi-big ni-big muted', text: pcs.length ? pcs.map(NOTE).join(' ') : '—' }),
      h('p', { class: 'small muted', text:
        from === 'song' ? (song && song.playing() ? 'Listening to the recording at the playhead…' : 'Play the song, or move the playhead to a chord.')
        : from === 'mic' ? (mic.on ? 'Strum a chord and let it ring.' : 'Turn on the mic and strum a chord.')
        : pcs.length === 1 ? 'One note isn’t a chord yet: add another string.' : pcs.length ? 'These notes don’t make a chord the app knows. Try leaving one out.' : 'Tap each string where it is fretted (0 for open). Tap again to lift the finger.' }));
  }
  if (prefs.small) return;
  // the chords heard so far, newest first; in the recording a tap goes back to where it was
  if (from !== 'neck' && S.history.filter(x => (x.t != null) === (from === 'song')).length > 1) body.append(h('div', { class: 'stack ni-hist' }, h('span', { class: 'eyebrow', text: from === 'song' ? 'Chords heard, in song order' : 'Heard so far' }),
    h('div', { class: 'chips' }, S.history.filter(x => (x.t != null) === (from === 'song')).map(x => h('button', { class: 'chip', title: x.t != null ? 'Go back to ' + fmt(x.t) : null, onclick: () => {
      if (x.t != null && song && song.seek && from === 'song') { song.seek(x.t); S.hold = false; }
      else { S.hold = true; if (from === 'mic') S.heard = { notes: S.heard ? S.heard.notes : [], names: x.names }; }
      S.pick = 0; draw();
    } }, (x.t != null ? fmt(x.t) + ' ' : '') + x.sym)))));
  // the neck: what you tap, or a shape for the chord named
  fb = Fretboard({ label: from === 'neck' ? 'Guitar neck: tap where your fingers are' : 'A shape for this chord', onTap: (si, f) => {
    A.ensure(); A.fresh(); A.note(E.STRINGS[si].midi + f, A.now() + 0.01, 0.75, 1.4);
    if (from !== 'neck') { prefs.src = 'neck'; savePrefs(); if (mic && mic.on) mic.cleanup(); S.frets = [null, null, null, null, null, null]; }
    S.frets[si] = S.frets[si] === f ? null : f; S.pick = 0; draw();
  } });
  let frets = S.frets;
  if (from !== 'neck' && c) { const t = CHORD_TYPES.find(x => x.q === c.q), v = t && voicing(c.root, t.iv); frets = v ? v.frets : []; }
  fb.mark(frets.map((f, si) => (f === null || f === undefined || f < 0 ? null : { s: si, f, kind: c && pcOf(E.STRINGS[si].midi + f) === c.root ? 'root' : 'tone', label: NOTE(E.STRINGS[si].midi + f) })).filter(Boolean));
  body.append(h('div', { class: 'ni-neck' }, fb.el, from === 'neck'
    ? h('div', { class: 'row' }, h('button', { class: 'btn small ghost', onclick: () => { S.frets = [null, null, null, null, null, null]; S.pick = 0; draw(); } }, 'Clear'),
      h('button', { class: 'btn small ghost', onclick: () => openTool('whatchord', { returnTab: ui.tab }) }, 'Open the full page'))
    : h('p', { class: 'small muted', text: c ? 'A shape for ' + c.sym + '. Tap the neck to name your own.' : 'Tap the neck to name a chord by its frets.' })));
}

function drawScale(from) {
  // the notes: the recording's span, or what was played or tapped
  let notes = S.notes, sum = null;
  if (from === 'song') {
    const sp = S.songSpan;
    body.append(h('div', { class: 'ni-span' }, h('span', { class: 'small muted', text: 'Over' }),
      h('div', { class: 'ni-seg' }, [['loop', 'The loop'], ['around', 'Around here'], ['song', 'Whole song']].map(([id, t]) =>
        h('button', { class: 'chip', 'aria-pressed': String(prefs.span === id || (id === 'around' && prefs.span === 'loop' && sp && sp.around)), disabled: id === 'loop' && !(song && song.loop()) ? '' : null,
          onclick: () => { prefs.span = id; savePrefs(); songScale(true); } }, t))),
      h('button', { class: 'btn small ghost', onclick: () => songScale(true) }, '↻')));
    if (sp) body.append(h('p', { class: 'small muted ni-note', text: 'Listening over ' + sp.label + '.' }));
    notes = S.songNotes ? S.songNotes.notes : [];
    if (S.songNotes) sum = S.songNotes.pcs.map((v, p) => [p, v / Math.max(...S.songNotes.pcs)]).filter(([, v]) => v >= 0.15);
  } else {
    const counts = new Map();
    notes.forEach(n => { const p = pcOf(n.midi); counts.set(p, (counts.get(p) || 0) + 1); });
    const mx = Math.max(1, ...counts.values());
    sum = [...counts.entries()].sort((a, b) => a[0] - b[0]).map(([p, n]) => [p, n / mx, n]);
  }
  if (sum && sum.length && !prefs.small) body.append(h('div', { class: 'wi-pcs ni-pcs' }, sum.map(([p, w, n]) => h('span', { class: 'wi-pc', style: { '--w': w.toFixed(2) } }, h('b', { text: D.NOTE_NAMES[p] }), n ? h('span', { class: 'mono small', text: '×' + n }) : null))));
  const tonicSel = h('select', { 'aria-label': 'Home note (tonic)', onchange: e => { S.tonic = e.target.value === '' ? null : +e.target.value; S.scaleOpen = 0; draw(); } },
    h('option', { value: '', text: 'Home note: auto' }), D.NOTE_NAMES.map((n, i) => h('option', { value: String(i), text: 'Home note: ' + n })));
  tonicSel.value = S.tonic === null ? '' : String(S.tonic);
  body.append(h('div', { class: 'row ni-tools' }, tonicSel, from !== 'song' && notes.length ? h('button', { class: 'btn small ghost', onclick: () => { S.notes.pop(); S.scaleOpen = 0; draw(); } }, 'Undo last') : null,
    from !== 'song' && notes.length ? h('button', { class: 'btn small ghost', onclick: () => { S.notes = []; S.scaleOpen = 0; draw(); } }, 'Start again') : null));

  const res = h('div', { class: 'wi-result ni-result', 'aria-live': 'polite' });
  body.append(res);
  const distinct = new Set(notes.map(n => pcOf(n.midi))).size;
  let r = null;
  if (distinct < 3) {
    res.append(h('div', { class: 'wi-big ni-big muted', text: '—' }), h('p', { class: 'small muted', text:
      from === 'song' ? (S.songNotes ? 'Too few notes heard here. Try a longer span.' : 'Open a song, set a loop or play it, and the scales that fit show here.')
      : from === 'mic' ? (mic.on ? 'Play a phrase in one key, or run up and down the scale: three different notes at least, five or more to tell scales apart.' : 'Turn on the mic and play a phrase.')
      : 'Tap notes on the neck: each tap adds one.' }));
  } else {
    const all = findScales(notes, { list: scaleList(), tonic: S.tonic });
    const fits = all.filter(x => !x.outside.length), close = all.filter(x => x.outside.length === 1 && x.fit > 0.85).slice(0, 12);
    const list = fits.length ? fits : all.slice(0, 10);
    r = list[S.scaleOpen] || list[0];
    const sc = r.scale, flats = keyPrefersFlats(r.tonic, minorish(sc.steps));
    res.append(h('div', { class: 'ni-head' }, h('div', { class: 'wi-big ni-big', text: scaleTitle(r) }),
      h('div', { class: 'ni-headside' }, h('p', { class: 'wi-sub', text: [sc.aka, ...(sc.more || [])].filter(Boolean).join(' · ') || sc.region }))));
    if (!prefs.small) {
      res.append(...[h('div', { class: 'wi-tones' }, sc.steps.map((x, i) => h('span', { class: 'wi-tone' + (r.missing.includes(x) ? ' off' : '') }, h('b', { text: stepName(r.tonic, x, flats) }), h('span', { text: i === 0 ? 'home' : Number.isInteger(x) ? degreeLabel(x) : degreeLabel(Math.ceil(x)) + '¼♭' })))),
        h('p', { class: 'small', text: sc.region + '. ' + sc.note }),
        r.missing.length ? h('p', { class: 'small muted', text: 'Not heard yet: ' + r.missing.map(x => stepName(r.tonic, x, flats)).join(', ') + '.' }) : null,
        r.outside.length ? h('p', { class: 'small muted', text: 'Outside this scale: ' + r.outside.map(p => (Number.isInteger(p) ? spell(p, flats) : spell(Math.ceil(p), flats) + '¼♭')).join(', ') + '.' }) : null,
        h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => {
          A.ensure(); A.fresh();
          const base = 52 + ((r.tonic - 52) % 12 + 12) % 12, t0 = A.now() + 0.05;
          [...sc.steps, 12].forEach((x, i) => A.note(base + x, t0 + i * 0.3, 0.7, 0.6, { detune: Number.isInteger(x) ? 0 : (x - Math.round(x)) * 100 }));
        } }, '▶ Hear the scale'), h('button', { class: 'btn small ghost', onclick: () => openTool('whatscale', { returnTab: ui.tab }) }, 'Open the full page'))].filter(Boolean));
      // every scale that holds all the notes, then the ones only one note off
      const row = (x, i) => h('button', { class: 'wi-row' + (x === r ? ' on' : ''), 'aria-pressed': String(x === r), onclick: () => { S.scaleOpen = i; draw(); } },
        h('b', { text: scaleTitle(x) }), h('span', { class: 'small muted', text: x.scale.region + (x.missing.length ? ' · ' + x.missing.length + ' not heard' : ' · every note') + (x.outside.length ? ' · ' + x.outside.length + ' outside' : '') }));
      const SHOW = 24, shown = S.showAll ? list : list.slice(0, SHOW);
      res.append(h('div', { class: 'stack wi-also' }, h('span', { class: 'eyebrow', text: fits.length ? 'Every scale that fits (' + fits.length + ')' : 'Nothing fits every note: the closest' }),
        h('div', { class: 'wi-list ni-list' }, shown.map((x, i) => row(x, i))),
        list.length > SHOW ? h('button', { class: 'btn small ghost', onclick: () => { S.showAll = !S.showAll; draw(); } }, S.showAll ? 'Show fewer' : 'Show all ' + list.length) : null));
      if (fits.length && close.length) res.append(h('details', { class: 'ni-close' }, h('summary', { text: 'Close fits, one note off (' + close.length + ')' }),
        h('div', { class: 'wi-list ni-list' }, close.map(x => h('div', { class: 'wi-row' }, h('b', { text: scaleTitle(x) }), h('span', { class: 'small muted', text: x.scale.region + ' · not ' + x.outside.map(p => spell(p, keyPrefersFlats(x.tonic, minorish(x.scale.steps)))).join(', ') }))))));
    }
  }
  if (prefs.small) return;
  fb = Fretboard({ label: 'Guitar neck: tap notes to add them', onTap: (si, f) => {
    const m = E.STRINGS[si].midi + f;
    A.ensure(); A.fresh(); A.note(m, A.now() + 0.01, 0.75, 1.2);
    if (from !== 'neck') { prefs.src = 'neck'; savePrefs(); if (mic && mic.on) mic.cleanup(); S.notes = []; }
    addNote(m);
  } });
  if (r) { const pcs = r.scale.steps.filter(Number.isInteger).map(x => pcOf(r.tonic + x)); fb.mark(positionsOfPc(pcs, 12, p => (p === r.tonic ? 'root' : 'tone'))); }
  body.append(h('div', { class: 'ni-neck' }, fb.el, h('p', { class: 'small muted', text: r ? 'The neck shows ' + scaleTitle(r) + ', home notes filled. Tap it to add notes of your own.' : 'Each tap adds a note.' })));
}

/* where it sits: above Transcribe's deck when that is showing, else above the tab bar */
function place() {
  if (!panel) return;
  const deck = document.querySelector('.tr-deck');
  const tabs = document.querySelector('.tabs');
  let bottom = 0;
  const shown = el => el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
  if (shown(deck)) bottom = Math.max(0, window.innerHeight - deck.getBoundingClientRect().top);
  else if (shown(tabs) && !document.body.classList.contains('tr-fs-on')) bottom = Math.max(0, window.innerHeight - tabs.getBoundingClientRect().top);
  panel.style.bottom = Math.round(bottom) + 'px';
}

export function openNameIt(opts = {}) {
  if (opts.mode) prefs.mode = opts.mode;
  if (opts.src) prefs.src = opts.src;
  else if (song && !S.open && opts.fromSong) prefs.src = 'song';
  savePrefs();
  if (S.open) { draw(); place(); tick(); return; }
  S.open = true;
  mic = MicToggle({ label: 'Listen through the mic', onLabel: 'Listening', hint: '', auto: false,
    onOn: () => { startMic(); draw(); }, onOff: () => { stopMic(); draw(); } });
  body = h('div', { class: 'ni-body' });
  const sizeBtn = h('button', { class: 'btn small ghost', 'aria-label': 'Make the panel smaller or larger', onclick: () => { prefs.small = !prefs.small; savePrefs(); paintSize(); draw(); place(); } });
  const paintSize = () => { sizeBtn.textContent = prefs.small ? '▴ More' : '▾ Less'; panel.classList.toggle('small', prefs.small); };
  panel = h('div', { class: 'card ni-panel', role: 'dialog', 'aria-label': 'Name it: what chord, what scale' },
    h('div', { class: 'ni-top' }, h('span', { class: 'eyebrow', text: 'Name it' }), h('div', { class: 'row' }, sizeBtn,
      h('button', { class: 'btn small ghost', 'aria-label': 'Close Name it', 'data-back-close': '', onclick: () => closeNameIt() }, '✕'))),
    body);
  paintSize();
  document.body.append(panel);
  if (btnTop) btnTop.setAttribute('aria-pressed', 'true');
  songWatch.add(onSong);
  window.addEventListener('resize', place);
  draw(); place(); tick();
  timer = setInterval(() => { tick(); place(); }, 180);
  requestAnimationFrame(() => panel && panel.classList.add('in'));
}
function onSong() { S.songNames = []; S.songAt = null; S.songKey = ''; S.songNotes = null; S.votes = []; if (S.open) { draw(); tick(); } }
export function closeNameIt() {
  if (!S.open) return;
  S.open = false;
  clearInterval(timer);
  if (mic) mic.cleanup();
  stopMic();
  songWatch.delete(onSong);
  window.removeEventListener('resize', place);
  if (panel) panel.remove();
  panel = body = fb = liveEl = null;
  if (btnTop) btnTop.setAttribute('aria-pressed', 'false');
}
export function toggleNameIt(opts) { if (S.open) closeNameIt(); else openNameIt(opts); }
export const nameItOpen = () => S.open;

/* the ♯ beside the tuner in the top bar, and Escape to close (before a tool's own Escape) */
export function bootNameIt() {
  const fork = document.getElementById('tuner-btn');
  if (!fork || document.getElementById('nameit-btn')) return;
  btnTop = h('button', { class: 'gear', id: 'nameit-btn', type: 'button', 'aria-label': 'Name it: what chord, what scale', title: 'Name it: what chord, what scale', 'aria-pressed': 'false' });
  // three stacked note heads on a stem: a chord
  btnTop.append(s('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' },
    s('ellipse', { cx: 9, cy: 19, rx: 3.2, ry: 2.3 }), s('ellipse', { cx: 9, cy: 13, rx: 3.2, ry: 2.3 }), s('ellipse', { cx: 9, cy: 7, rx: 3.2, ry: 2.3 }),
    s('path', { d: 'M12.2 19V3' }), s('path', { d: 'M16 9h5M16 14h5M18.5 6.5v10' })));
  btnTop.addEventListener('click', () => toggleNameIt({ fromSong: true }));
  fork.after(btnTop);
  window.addEventListener('keydown', ev => {
    if (!S.open || ev.key !== 'Escape' || document.querySelector('.sheet-back')) return;
    ev.preventDefault(); ev.stopImmediatePropagation(); closeNameIt();
  }, true);
}
