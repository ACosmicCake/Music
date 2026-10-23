/* World Woodshed — Write by playing: play a melody into the mic (or tap it on the fretboard) and the app
   writes it as notation and tab, which you can fix by tapping a note, hear back, and send to MuseScore
   as MusicXML or MIDI. The notes, keys, frets and files come from src/notate.js; the draft stays on this
   device (localStorage) until it is exported or saved to the Library (src/library.js), which can open it here again. */
import A from '../audio.js';
import E from '../engine.js';
import Mic from '../listen.js';
import { h, tool, toast, Fretboard, openTool } from '../ui/core.js';
import { noteLabel } from '../ui/mic.js';
import { renderStaff, parseTime, keyName, KEYS } from '../notation.js';
import { cleanDraft, quantize, takeNotes, keyOf, guessKey, placeFrets, toMusicXML, toMidi, fileBase, TIMES } from '../notate.js';
import { keepAwake, openBlob } from '../native.js';
import { addToLibrary, addFiles, getEntry, getFile, removeFile, updateEntry } from '../library.js';
import { packNotes, trimLead } from '../melody.js';
import './notate.css';

const STORE = 'ww-notate-draft';
function loadStore() {
  try { const v = JSON.parse(localStorage.getItem(STORE) || 'null'); return { draft: cleanDraft(v && v.draft), click: v && v.click === 'all' ? 'all' : 'count', entry: v && typeof v.entry === 'string' ? v.entry : null }; } catch (e) { return { draft: cleanDraft(null), click: 'count', entry: null }; }
}
function saveStore(v) { try { localStorage.setItem(STORE, JSON.stringify(v)); } catch (e) { /* the draft is a convenience; the export is the copy that matters */ } }

const DUR_OPTS = [[0.25, '16th'], [0.5, '8th'], [1, 'Quarter'], [2, 'Half'], [4, 'Whole']];
const snapTo = (x, g) => Math.round(x / g + 1e-9) * g;

tool('notate', {
  tab: 'train', skill: null, title: 'Write by playing', eyebrow: 'Guitar · score from your playing',
  desc: 'Play a melody into the mic, or tap it on the fretboard, and it is written as notation and tab. Fix any note by tapping it, hear it back, open it in MuseScore as MusicXML or MIDI, or keep it in your Library.',
  render(body, ctx) {
    const store = loadStore();
    const draft = store.draft;
    let sel = null, undo = [], rec = null, play = null, alive = true, stepDur = 1, stepDot = false;
    const save = () => saveStore({ draft, click: store.click, entry: store.entry });
    const snapshot = () => { undo.push(JSON.stringify(draft.notes)); if (undo.length > 60) undo.shift(); undoBtn.disabled = false; };
    const lastEnd = () => draft.notes.reduce((a, n) => Math.max(a, n.e), 0);

    /* ----- settings ----- */
    function seg(name, opts, cur, onPick) {
      const el = h('div', { class: 'seg', role: 'group', 'aria-label': name });
      const paint = v => el.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === String(v) ? 'true' : 'false'));
      (Array.isArray(opts) ? opts : Object.entries(opts)).forEach(([v, label]) => el.append(h('button', { type: 'button', 'data-v': v, onclick: () => { paint(v); onPick(v); } }, label)));
      paint(cur);
      return { el, paint };
    }
    const title = h('input', { type: 'text', value: draft.title, placeholder: 'Untitled', 'aria-label': 'Title', maxlength: 120 });
    title.oninput = () => { draft.title = title.value; save(); };
    const bpmOut = h('b', { class: 'mono nt-bpm', text: String(draft.bpm) });
    const setBpm = v => { draft.bpm = Math.max(30, Math.min(260, v)); bpmOut.textContent = String(draft.bpm); save(); };
    const bpmRow = h('div', { class: 'row nt-tempo' },
      h('button', { class: 'btn small', type: 'button', 'aria-label': 'Slower', onclick: () => setBpm(draft.bpm - 4) }, '−'), bpmOut,
      h('button', { class: 'btn small', type: 'button', 'aria-label': 'Faster', onclick: () => setBpm(draft.bpm + 4) }, '+'),
      h('span', { class: 'small muted', text: 'beats a minute' }));
    const timeSeg = seg('Time signature', Object.fromEntries(TIMES.map(t => [t, t])), draft.time, v => { draft.time = v; save(); draw(); });
    const gridSeg = seg('Smallest note', { 0.5: 'Eighths', 0.25: 'Sixteenths' }, draft.grid, v => { draft.grid = +v; save(); draw(); });
    const clickSeg = seg('Click', { count: 'Count-in', all: 'All the way' }, store.click, v => { store.click = v; save(); });
    const keySel = h('select', { 'aria-label': 'Key' });
    function paintKeys() {
      keySel.innerHTML = '';
      keySel.append(h('option', { value: 'auto', text: 'Key: find it (' + keyName(guessKey(draft.notes)) + ')' }));
      Object.keys(KEYS).forEach(k => keySel.append(h('option', { value: k, text: keyName(k) })));
      keySel.value = draft.key;
    }
    keySel.onchange = () => { draft.key = keySel.value; save(); draw(); };
    const hold = h('input', { type: 'checkbox', id: 'nt-hold' });
    hold.checked = draft.hold;
    hold.onchange = () => { draft.hold = hold.checked; save(); draw(); };
    const holdOff = why => { if (!draft.hold) return; draft.hold = false; hold.checked = false; toast(why); };

    /* ----- recording ----- */
    const recBtn = h('button', { class: 'btn primary nt-rec', type: 'button', onclick: () => (rec ? stopRec() : record()) }, '● Record');
    const meterFill = h('i');
    const meter = h('span', { class: 'micmeter', 'aria-hidden': 'true', hidden: true }, meterFill);
    const status = h('p', { class: 'small nt-status', 'aria-live': 'polite', text: draft.notes.length ? 'Record again to add more bars after these.' : 'Set the tempo, press Record, wait for the count-in and play one note at a time.' });
    const heard = h('span', { class: 'mono nt-heard' });
    let offs = [];
    async function record() {
      stopPlay();
      if (!(await Mic.start())) {
        status.textContent = Mic.state === 'denied' ? 'The microphone is blocked. Allow it for this site in your browser settings, or write the notes by tapping below.' : 'This browser can’t use a microphone here. Write the notes by tapping below.';
        openStep(true); return;
      }
      if (!alive) return;
      A.ensure();
      const ts = parseTime(draft.time), beatS = 60 / draft.bpm;
      const end = lastEnd();
      const at = end > 0 ? Math.ceil(end / ts.barQ - 1e-6) * ts.barQ : 0;
      const t0 = A.now() + 0.35 + ts.beats * beatS;
      rec = { t0, at, events: [], cur: null, nextClick: t0 - ts.beats * beatS, beat: 0, until: store.click === 'all' ? Infinity : t0 - 1e-3, lat: Mic.latencyMs() / 1000 };
      offs = [
        Mic.on('note', ev => {
          const r = rec; if (!r || ev.t - r.lat < r.t0 - 0.15) return;
          if (r.cur) r.cur.end = Math.min(r.cur.end, ev.t);
          r.cur = { t: ev.t, end: ev.t + 0.12, midi: ev.midi };
          r.events.push(r.cur);
          heard.textContent = noteLabel(Math.round(ev.midi));
          liveDraw();
        }),
        Mic.on('pitch', ev => { const c = rec && rec.cur; if (c && ev.t > c.t && Math.abs(ev.midi - c.midi) < 0.6) c.end = Math.max(c.end, ev.t); }),
        Mic.on('level', ev => { meterFill.style.width = Math.max(0, Math.min(100, (20 * Math.log10(Math.max(ev.rms, 1e-5)) + 60) * 2)) + '%'; })
      ];
      meter.hidden = false;
      recBtn.textContent = '■ Stop';
      recBtn.classList.add('on');
      keepAwake(true, 'notate');
      rec.timer = setInterval(() => {
        const r = rec; if (!r) return;
        const now = A.now();
        while (r.nextClick < now + 0.25 && r.nextClick < r.until) {
          const down = r.beat % ts.beats === 0;
          A.hit(down ? 'clickHi' : 'click', r.nextClick, down ? 0.9 : 0.6, undefined, { synth: true });
          r.nextClick += beatS; r.beat++;
        }
        const el = now - r.t0;
        if (el < 0) status.textContent = 'Count-in… ' + Math.max(1, Math.ceil(-el / beatS));
        else {
          const bar = Math.floor(r.at / ts.barQ + el / (beatS * ts.beats)) + 1, beat = Math.floor(el / beatS) % ts.beats + 1;
          status.textContent = 'Recording · bar ' + bar + ', beat ' + beat + (r.events.length ? ' · ' + r.events.length + ' notes' : '');
        }
      }, 40);
    }
    function takeFrom(r, until) {
      const evs = r.events.map(x => ({ t: x.t, end: Math.min(x.end, until), midi: x.midi }));
      return takeNotes(evs, { bpm: draft.bpm, time: draft.time, t0: r.t0, lat: r.lat, at: r.at });
    }
    function stopRec() {
      const r = rec; if (!r) return;
      rec = null;
      clearInterval(r.timer);
      offs.forEach(f => f()); offs = [];
      keepAwake(false, 'notate');
      meter.hidden = true; recBtn.textContent = '● Record'; recBtn.classList.remove('on'); heard.textContent = '';
      const notes = takeFrom(r, A.now());
      if (notes.length) {
        snapshot();
        draft.notes.push(...notes); draft.notes.sort((a, b) => a.s - b.s);
        save();
        status.textContent = notes.length + ' notes written. Tap a note to fix it, or record again to add more bars.';
      } else status.textContent = 'No notes heard. Play a little louder or closer to the phone, or raise the mic sensitivity in Train → Microphone.';
      draw();
    }
    let liveT = 0;
    function liveDraw() {
      if (liveT) return;
      liveT = setTimeout(() => { liveT = 0; if (rec && alive) draw(takeFrom(rec, Infinity)); }, 250);
    }

    /* ----- tapping the notes in ----- */
    const durSeg = seg('Note length', DUR_OPTS, stepDur, v => { stepDur = +v; });
    durSeg.el.classList.add('nt-durs');
    const dotBtn = h('button', { class: 'btn small', type: 'button', 'aria-pressed': 'false', onclick: () => { stepDot = !stepDot; dotBtn.setAttribute('aria-pressed', String(stepDot)); } }, 'Dotted');
    const stepLen = () => stepDur * (stepDot ? 1.5 : 1);
    let stepAt = null;
    const stepFrom = () => (stepAt !== null && stepAt >= lastEnd() - 1e-6 ? stepAt : lastEnd());
    const fb = Fretboard({
      label: 'Fretboard: tap a note to write it', onTap: (si, f) => {
        const m = E.STRINGS[si].midi + f, s0 = stepFrom();
        snapshot();
        const n = { s: s0, e: s0 + stepLen(), midi: m };
        draft.notes.push(n); stepAt = n.e;
        A.ensure(); A.note(m, A.now() + 0.02, 0.8, Math.min(2, stepLen() * 60 / draft.bpm + 0.2));
        fb.mark([{ s: si, f, kind: 'root' }]);
        sel = draft.notes.length - 1;
        save(); draw();
      }
    });
    const restBtn = h('button', { class: 'btn small', type: 'button', onclick: () => { holdOff('Hold notes is off, so your rests show.'); stepAt = stepFrom() + stepLen(); draw(); } }, 'Rest');
    const stepPanel = h('div', { class: 'stack nt-step-panel', hidden: true }, h('p', { class: 'small muted', text: 'Pick a length, then tap the neck. Each note goes after the last one.' }), durSeg.el, h('div', { class: 'row' }, dotBtn, restBtn), fb.el);
    const stepToggle = h('button', { class: 'btn ghost small nt-step-toggle', type: 'button', 'aria-expanded': 'false', onclick: () => openStep(stepPanel.hidden) }, 'Write by tapping instead');
    const openStep = on => { stepPanel.hidden = !on; stepToggle.setAttribute('aria-expanded', String(on)); stepToggle.textContent = on ? 'Hide the fretboard' : 'Write by tapping instead'; };
    const stepBox = h('div', { class: 'stack nt-step' }, stepToggle, stepPanel);

    /* ----- the score ----- */
    const staffBox = h('div', { class: 'nt-staff' });
    const empty = h('p', { class: 'muted small', text: 'Your score shows here as you play.' });
    const selLabel = h('b', { class: 'mono' });
    const editBtn = (label, aria, fn) => h('button', { class: 'btn small', type: 'button', 'aria-label': aria, onclick: fn }, label);
    const edit = h('div', { class: 'nt-edit', hidden: true },
      h('div', { class: 'spread' }, selLabel, h('button', { class: 'btn ghost small', type: 'button', onclick: () => { sel = null; draw(); } }, 'Done')),
      h('div', { class: 'nt-edit-grid' },
        editBtn('♭ Lower', 'A semitone lower', () => change(n => { n.midi = Math.max(28, n.midi - 1); }, true)),
        editBtn('♯ Higher', 'A semitone higher', () => change(n => { n.midi = Math.min(100, n.midi + 1); }, true)),
        editBtn('8va ↓', 'An octave lower', () => change(n => { n.midi = Math.max(28, n.midi - 12); }, true)),
        editBtn('8va ↑', 'An octave higher', () => change(n => { n.midi = Math.min(100, n.midi + 12); }, true)),
        editBtn('← Earlier', 'Move earlier', () => change(n => { const g = draft.grid, s = snapTo(n.s, g), e = snapTo(n.e, g); if (s < g) return; n.s = s - g; n.e = e - g; })),
        editBtn('Later →', 'Move later', () => change(n => { const g = draft.grid; n.s = snapTo(n.s, g) + g; n.e = snapTo(n.e, g) + g; })),
        editBtn('Shorter', 'Make it shorter', () => change(n => { const g = draft.grid, s = snapTo(n.s, g), e = snapTo(n.e, g); holdOff('Hold notes is off, so shorter notes show.'); n.e = Math.max(s + g, e - g); })),
        editBtn('Longer', 'Make it longer', () => change(n => { const g = draft.grid; n.e = snapTo(n.e, g) + g; })),
        h('button', { class: 'btn small danger', type: 'button', onclick: () => { if (sel === null) return; snapshot(); draft.notes.splice(sel, 1); sel = null; save(); draw(); } }, 'Delete')));
    function change(fn, sound) {
      const n = draft.notes[sel]; if (!n) return;
      snapshot(); fn(n);
      draft.notes.sort((a, b) => a.s - b.s); sel = draft.notes.indexOf(n);
      if (sound) { A.ensure(); A.note(n.midi, A.now() + 0.02, 0.8, 0.8); }
      save(); draw();
    }
    const undoBtn = h('button', { class: 'btn small', type: 'button', disabled: true, onclick: () => { const v = undo.pop(); if (!v) return; draft.notes = JSON.parse(v); sel = null; undoBtn.disabled = !undo.length; save(); draw(); } }, 'Undo');
    const playBtn = h('button', { class: 'btn small', type: 'button', onclick: () => (play ? stopPlay() : startPlay()) }, '▶ Play');
    const clearBtn = h('button', { class: 'btn small ghost', type: 'button', onclick: () => {
      if (!draft.notes.length) return;
      if (!confirm('Start a new score? This one is cleared (Undo brings it back while you stay here).')) return;
      snapshot(); draft.notes = []; draft.title = ''; title.value = ''; sel = null; stepAt = null; store.entry = null; save(); draw();
    } }, 'New score');
    let staff = null, flat = [];
    function draw(extra) {
      if (!alive) return;
      const d = extra && extra.length ? Object.assign({}, draft, { notes: draft.notes.concat(extra).sort((a, b) => a.s - b.s) }) : draft;
      paintKeys();
      staffBox.innerHTML = '';
      empty.hidden = d.notes.length > 0;
      playBtn.disabled = !draft.notes.length;
      exportBox.hidden = !draft.notes.length;
      if (!d.notes.length) { edit.hidden = true; return; }
      const q = quantize(d);
      flat = q.bars.flat();
      const frets = placeFrets(q.notes.map(n => n.midi), E.STRINGS.map(s => s.midi));
      const fretOf = new Map(q.notes.map((n, i) => [n.src, frets[i]]));
      const tab = flat.map((n, i) => (n.midi == null || (i && flat[i - 1].tie && flat[i - 1].src === n.src) ? null : fretOf.get(n.src) || null));
      const key = keyOf(d);
      staff = renderStaff({ bars: q.bars, key, time: d.time, width: Math.max(220, (staffBox.clientWidth || body.clientWidth || 320) - 4), tab, label: 'Your score in ' + keyName(key) + ', ' + q.bars.length + ' bars' });
      staffBox.append(staff.el);
      staff.el.addEventListener('click', ev => {
        if (rec) return;
        const g = ev.target.closest && ev.target.closest('.nt');
        const it = g ? flat[+g.dataset.i] : null;
        sel = it && it.src >= 0 ? it.src : null;
        if (sel !== null) { A.ensure(); A.note(draft.notes[sel].midi, A.now() + 0.02, 0.8, 0.8); }
        draw();
      });
      if (sel !== null && !draft.notes[sel]) sel = null;
      edit.hidden = sel === null || !!rec;
      if (sel !== null) {
        flat.forEach((n, i) => { if (n.src === sel) staff.mark(i, 'now'); });
        const n = draft.notes[sel];
        selLabel.textContent = noteLabel(n.midi) + ' · bar ' + (Math.floor(snapTo(n.s, d.grid) / parseTime(d.time).barQ + 1e-9) + 1);
      }
      if (rec) staffBox.scrollTop = staffBox.scrollHeight;
    }

    /* ----- hearing it back ----- */
    function startPlay() {
      if (rec || !draft.notes.length) return;
      A.ensure(); A.fresh();
      const q = quantize(draft), qps = draft.bpm / 60 * q.ts.beatQ, t0 = A.now() + 0.15;
      q.notes.forEach(n => A.note(n.midi, t0 + n.s / qps, 0.8, (n.e - n.s) / qps + 0.05));
      const end = t0 + (q.notes.length ? q.notes[q.notes.length - 1].e : 0) / qps + 0.3;
      playBtn.textContent = '■ Stop';
      play = setInterval(() => {
        const now = A.now() - A.latency();
        if (now > end || !staff) { stopPlay(); return; }
        const at = (now - t0) * qps;
        let i = -1;
        flat.forEach((n, j) => { if (n.at <= at + 1e-6) i = j; });
        staff.cursor(i >= 0 ? i : null);
      }, 40);
    }
    function stopPlay() {
      if (!play) return;
      clearInterval(play); play = null;
      A.stopAll();
      playBtn.textContent = '▶ Play';
      if (staff) staff.cursor(null);
    }

    /* ----- MuseScore ----- */
    const withTab = h('input', { type: 'checkbox', id: 'nt-tab', checked: true });
    const fileOpts = () => ({ strings: E.STRINGS.map(s => s.midi), program: E.state.settings.guitarSound === 'steel' ? 25 : 24, date: new Date().toISOString().slice(0, 10), tab: withTab.checked });
    const xmlBlob = () => new Blob([toMusicXML(draft, fileOpts())], { type: 'application/vnd.recordare.musicxml+xml' });
    const midBlob = () => new Blob([toMidi(draft, fileOpts())], { type: 'audio/midi' });
    async function send(kind) {
      const base = fileBase(draft), blob = kind === 'xml' ? xmlBlob() : midBlob();
      try {
        const how = await openBlob(base + (kind === 'xml' ? '.musicxml' : '.mid'), blob, draft.title || 'My score');
        if (how === 'downloaded') toast('Saved ' + base + (kind === 'xml' ? '.musicxml' : '.mid') + ' to your downloads');
      } catch (e) { toast('Couldn’t open the file: ' + (e && e.message ? e.message : 'unknown error')); }
    }
    /* ----- the Library: the MusicXML, the MIDI and this draft (to edit again), on this device ----- */
    const libNote = h('p', { class: 'small' });
    const libBtn = h('button', { class: 'btn', type: 'button', onclick: () => saveToLib() });
    const linked = () => (store.entry && getEntry(store.entry) ? store.entry : null);
    function paintLib() {
      const id = linked();
      libBtn.textContent = id ? 'Update it in the Library' : 'Save to the Library';
      libNote.textContent = id ? 'Saved as “' + getEntry(id).title + '”. Updating replaces its files with this version.' : 'Saves the MusicXML, the MIDI and this draft, so you can open it from the Library and edit it here again.';
    }
    async function saveToLib() {
      libBtn.disabled = true;
      try {
        const base = fileBase(draft);
        const files = [
          { blob: xmlBlob(), name: base + '.musicxml', type: 'application/vnd.recordare.musicxml+xml' },
          { blob: midBlob(), name: base + '.mid', type: 'audio/midi' },
          { blob: new Blob([JSON.stringify({ app: 'world-woodshed', kind: 'wwscore', v: 1, draft })], { type: 'application/json' }), name: base + '.wwscore.json', type: 'application/json' }
        ];
        let id = linked(), res;
        if (id) {
          // replace this tool's own files from the last save; anything else Pan added to the entry stays
          for (const f of getEntry(id).files) if (['musicxml', 'midi', 'wwscore'].includes(f.kind) && /^[\w-]+\.(musicxml|mid|wwscore\.json)$/.test(f.name)) await removeFile(id, f.id);
          if (draft.title.trim()) updateEntry(id, { title: draft.title });
          res = await addFiles(id, files);
        } else {
          id = await addToLibrary({ title: draft.title || 'Untitled', source: 'notation', status: 'learning', files: [] });
          res = await addFiles(id, files);
          store.entry = id; save();
        }
        toast(res.failed.length ? 'Saved, but ' + res.failed.map(x => x[0] + ' (' + x[1] + ')').join(', ') + ' could not be stored' : 'Saved in the Library');
      } catch (e) { toast('Couldn’t save to the Library: ' + (e && e.message ? e.message : 'unknown error')); }
      libBtn.disabled = false;
      paintLib();
    }
    /* Open a draft saved in the Library (params.load: the entry id) */
    async function loadFromLib(id) {
      const e = getEntry(id);
      const f = e && e.files.filter(x => x.kind === 'wwscore').pop();
      const got = f ? await getFile(f.id) : null;
      if (!alive) return;
      if (!got) { toast('That score’s draft isn’t on this device'); return; }
      try {
        const v = JSON.parse(await got.blob.text());
        const d = cleanDraft(v && v.draft);
        if (draft.notes.length) snapshot();
        Object.assign(draft, d);
        store.entry = id; sel = null; stepAt = null;
        title.value = draft.title; timeSeg.paint(draft.time); gridSeg.paint(draft.grid); hold.checked = draft.hold; bpmOut.textContent = String(draft.bpm);
        save(); draw();
        status.textContent = 'Opened “' + e.title + '” from the Library. Record to add bars, or tap a note to fix it.';
      } catch (err) { toast('That draft couldn’t be read'); }
    }
    const exportBox = h('div', { class: 'card stack nt-export', hidden: true },
      h('h3', { text: 'Open it in MuseScore' }),
      h('p', { class: 'small', text: 'MusicXML keeps the notes, ties, key and tab; MIDI keeps only the notes and the tempo. In the Android app the file opens in MuseScore if it is installed (or the share sheet offers it); in a browser it downloads, and MuseScore Studio opens it with File → Open.' }),
      h('label', { class: 'row small', for: 'nt-tab' }, withTab, 'Add a tab staff (your tuning and capo)'),
      h('div', { class: 'row' },
        h('button', { class: 'btn brass', type: 'button', onclick: () => send('xml') }, 'Open MusicXML'),
        h('button', { class: 'btn', type: 'button', onclick: () => send('mid') }, 'Open MIDI')),
      h('h3', { text: 'Keep it in your Library' }),
      libNote,
      h('div', { class: 'row' }, libBtn));

    /* ----- the melody of a Repertoire tune (params.forTune: { id, name }, from the tune's Add the melody) ----- */
    const forTune = ctx.params.forTune && typeof ctx.params.forTune.id === 'string' ? ctx.params.forTune : null;
    const tuneBox = forTune ? h('div', { class: 'callout patina stack' },
      h('b', { text: 'The melody of ' + forTune.name }),
      h('p', { class: 'small', text: 'Play it from bar 1 of the chart, straight after the count-in, at any tempo you can manage: it is kept in beats, and the band plays it at the tune’s tempo. Fix any wrong note by tapping it, then use it.' }),
      h('div', { class: 'row' },
        h('button', { class: 'btn brass', type: 'button', onclick: () => {
          const notes = trimLead(draft.notes, parseTime(draft.time).barQ);
          if (!notes.length) { toast('Record or tap the melody first'); return; }
          E.saveMelody(forTune.id, { notes: packNotes(notes), from: 'notate', name: draft.title || 'Write by playing' });
          toast('Melody added to ' + forTune.name);
          openTool('repertoire', { params: { tune: forTune.id }, returnTab: 'play' });
        } }, 'Use it as the melody'),
        h('button', { class: 'btn ghost', type: 'button', onclick: () => openTool('repertoire', { params: { tune: forTune.id }, returnTab: 'play' }) }, 'Back to the tune'))) : null;
    if (forTune && !draft.notes.length && !draft.title) { draft.title = forTune.name; title.value = draft.title; save(); }

    /* ----- layout ----- */
    body.append(...(tuneBox ? [tuneBox] : []),
      h('div', { class: 'card stack nt-setup' },
        title,
        h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Tempo' }), bpmRow),
        h('div', { class: 'nt-opts' },
          h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Time' }), timeSeg.el),
          h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Smallest note' }), gridSeg.el),
          h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Click' }), clickSeg.el)),
        keySel,
        h('div', { class: 'row' }, recBtn, meter, heard),
        status,
        h('p', { class: 'small muted', text: 'It writes single notes, not chords. If the click plays all the way, wear headphones so the mic hears only your guitar.' }),
        stepBox),
      h('div', { class: 'card stack nt-score' },
        h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Your score' }), h('div', { class: 'row' }, playBtn, undoBtn, clearBtn)),
        empty, staffBox, edit,
        h('label', { class: 'row small', for: 'nt-hold' }, hold, 'Hold each note until the next one (short gaps aren’t rests)')),
      exportBox);
    draw();
    paintLib();
    if (ctx.params.load) loadFromLib(String(ctx.params.load));

    return () => {
      if (rec) stopRec();
      alive = false;
      stopPlay();
      clearTimeout(liveT);
      keepAwake(false, 'notate');
    };
  }
});
