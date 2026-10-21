/* World Woodshed — Sight-reading: note flash cards, rhythm reading and melodies, level by level */
import A from '../audio.js';
import E from '../engine.js';
import Mic from '../listen.js';
import { h, tool, toast, Fretboard } from '../ui/core.js';
import { MicToggle, noteLabel } from '../ui/mic.js';
import { TapPad } from './rhythm.js';
import { renderStaff, parseTime, keyName, durQ, KEYS, keyAlters } from '../notation.js';
import { LEVELS, HOW_TO, readingItems, genMelody, rhythmPiece, noteCard, attacks, pieceLength } from '../content/reading.js';
import Lib from '../readlib.js';

const SKILL = 'reading';
const LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const ACC = { '-1': '♭', 0: '♮', 1: '♯' };
const clampLevel = k => Math.max(1, Math.min(LEVELS.length, Math.round(+k) || 1));
const universe = () => { const u = E.universe(SKILL); return u && u.length ? u : readingItems(); };
const itemState = id => { const ss = E.skillState(SKILL); return ss && ss.items ? ss.items[id] : null; };
const soundName = m => noteLabel(m).split(' ')[0];

/* scoring taps against expected onsets (same model as the rhythm atlas tap test) */
function scoreTaps(expected, taps, win) {
  const used = new Set(); const errs = [];
  expected.forEach(e => {
    let best = -1, bd = Infinity;
    taps.forEach((tp, j) => { if (used.has(j)) return; const d = tp - e.t; if (Math.abs(d) < Math.abs(bd) && Math.abs(d) <= win) { bd = d; best = j; } });
    if (best >= 0) { used.add(best); errs.push({ e, d: bd }); } else errs.push({ e, d: null });
  });
  const first = expected.length ? expected[0].t - win : 0, last = expected.length ? expected[expected.length - 1].t + win : 0;
  const extra = taps.filter((tp, j) => !used.has(j) && tp >= first && tp <= last).length;
  const hits = errs.filter(x => x.d !== null);
  const hitRate = expected.length ? hits.length / expected.length : 0;
  const meanAbs = hits.length ? hits.reduce((a, x) => a + Math.abs(x.d), 0) / hits.length : win;
  const mean = hits.length ? hits.reduce((a, x) => a + x.d, 0) / hits.length : 0;
  const precision = Math.max(0, 1 - meanAbs / (win * 0.9));
  const score = Math.max(0, Math.min(1, hitRate * 0.6 + precision * 0.4 - Math.min(0.3, extra * 0.04)));
  return { errs, hitRate, meanAbs, mean, extra, score };
}
const describeOffset = ms => Math.abs(ms) < 12 ? 'Right on the beat on average.' : ms > 0 ? 'You were ' + Math.round(ms) + ' ms late on average.' : 'You were ' + Math.round(-ms) + ' ms early on average.';
/* colour an attack and any notes tied on from it */
function markAttack(staff, piece, a, cls) {
  const flat = piece.bars.flat();
  staff.mark(a.i, cls);
  for (let j = a.i; flat[j] && flat[j].tie && flat[j + 1] && flat[j + 1].midi === flat[j].midi; j++) staff.mark(j + 1, cls);
}
function minGapQ(ats) { let g = Infinity; for (let i = 1; i < ats.length; i++) g = Math.min(g, ats[i].q - ats[i - 1].q); return isFinite(g) ? g : 1; }

/* counting syllables under each note: 1 e & a, or 1 2 3 4 5 6 in 6/8 */
function countLabels(piece) {
  const ts = parseTime(piece.time), out = [];
  piece.bars.forEach(bar => {
    let q = 0;
    bar.forEach(n => {
      let t;
      if (ts.compound) { const e = q / 0.5; t = Number.isInteger(Math.round(e * 1000) / 1000) ? String(Math.round(e) + 1) : '+'; }
      else { const b = Math.floor(q + 1e-6), f = Math.round((q - b) * 4); t = f === 0 ? String(b + 1) : ['', 'e', '&', 'a'][f]; }
      out.push(n.midi == null ? '(' + t + ')' : t);
      q += durQ(n);
    });
  });
  return out;
}
/* every event (note or rest) with its onset in quarters, for the cursor */
function eventStarts(piece) {
  const ts = parseTime(piece.time), out = []; let q = 0, i = 0;
  piece.bars.forEach(bar => {
    const full = bar.length === 1 && bar[0].midi == null && bar[0].dur === 'w';
    bar.forEach(n => { out.push({ i, q }); q += full ? ts.barQ : durQ(n); i++; });
  });
  return out;
}

/* Schedules a count-in bar and the piece on a sixteenth-note grid, moving the cursor along.
   o: { piece, staff, bpm, countIn, click, notes (play the pitches), phase (element), onExpected(e), onEnd(expected) } */
function playPiece(o) {
  A.ensure();
  const ts = parseTime(o.piece.time), spq = 60 / o.bpm / ts.beatQ, G = 0.25;
  const barSteps = Math.round(ts.barQ / G), beatSteps = Math.round(ts.beatQ / G);
  const pre = o.countIn ? barSteps : 0;
  const total = pre + Math.round(pieceLength(o.piece) / G);
  const byStep = new Map(); attacks(o.piece).forEach(a => byStep.set(Math.round(a.q / G), a));
  const evAt = new Map(); eventStarts(o.piece).forEach(e => evAt.set(Math.round(e.q / G), e.i));
  const expected = [];
  let nowEl = null;
  const setNow = i => {
    if (nowEl) nowEl.classList.remove('now');
    nowEl = i === null ? null : o.staff.noteEls[i];
    if (nowEl) nowEl.classList.add('now');
    o.staff.cursor(i);
  };
  const loop = A.Loop({
    steps: total, maxSteps: total, stepDur: () => spq * G,
    onStep: (i, t) => {
      const inPre = i < pre, k = inPre ? i : i - pre;
      if (k % beatSteps === 0) {
        const down = k % barSteps === 0;
        if (inPre) A.hit(down ? 'clickHi' : 'click', t, 0.95);
        else if (o.click) A.hit(down ? 'clickHi' : 'click', t, 0.45);
      } else if (inPre && ts.compound && k % 2 === 0) A.hit('click', t, 0.4);
      if (!inPre && byStep.has(k)) {
        const a = byStep.get(k), e = Object.assign({}, a, { t, dur: a.len * spq });
        expected.push(e);
        if (o.onExpected) o.onExpected(e);
        if (o.notes) A.note(a.midi - 12, t, 0.8, Math.max(0.12, Math.min(2, a.len * spq - 0.03)));
      }
    },
    onVisual: i => {
      const inPre = i < pre, k = inPre ? i : i - pre;
      if (inPre) { if (o.phase && k % beatSteps === 0) o.phase.textContent = 'Count-in: ' + (k / beatSteps + 1) + ' …'; return; }
      if (o.phase && k % beatSteps === 0) o.phase.textContent = 'Bar ' + (Math.floor(k / barSteps) + 1) + ' of ' + o.piece.bars.length + ' · beat ' + ((k % barSteps) / beatSteps + 1);
      if (evAt.has(k)) setNow(evAt.get(k));
    },
    onEnd: () => { setNow(null); if (o.phase) o.phase.textContent = ''; o.onEnd && o.onEnd(expected); }
  });
  const startAt = loop.start(A.now() + 0.15);
  return { stop() { loop.stop(); setNow(null); if (o.phase) o.phase.textContent = ''; }, startAt, spq, pre: pre * spq * G };
}

function staffWidth(holder) { return Math.max(260, (holder.clientWidth || 320) - 4); }

tool('sightread', {
  tab: 'train', skill: SKILL, title: 'Sight-reading', eyebrow: 'Reading · notes, rhythm, melody',
  desc: 'Read standard notation on the guitar, level by level: name notes, tap rhythms, then play melodies at sight while a cursor keeps time.',
  render(body, ctx) {
    const p = ctx.params || {};
    const unlocked = () => Math.max(1, Math.min(LEVELS.length, E.unlockedTier(SKILL) || 1));
    let level = p.level ? clampLevel(p.level) : unlocked();
    let mode = ['notes', 'rhythm', 'melody'].includes(p.mode) ? p.mode : (E.state.settings.readingMode || 'notes');
    let modeApi = null;

    const levelCard = h('div', { class: 'card sr-level' });
    const modeSeg = h('div', { class: 'seg big' });
    const modeBody = h('div', { class: 'section' });
    const how = h('details', { class: 'card sr-how' },
      h('summary', {}, h('b', { text: 'How to sight-read' })),
      h('ul', { class: 'sr-howlist' }, HOW_TO.map(([t, d]) => h('li', {}, h('b', { text: t + '. ' }), d))));
    body.append(levelCard, modeSeg, modeBody, how);

    const L = () => LEVELS[level - 1];
    function renderLevel() {
      const top = unlocked(), lv = L();
      levelCard.innerHTML = '';
      const chips = h('div', { class: 'sr-levels', role: 'group', 'aria-label': 'Level' });
      LEVELS.forEach(x => {
        const locked = x.id > top;
        const st = itemState('L' + x.id + ':melody');
        const b = h('button', { class: 'chip sr-lv' + (locked ? ' locked' : '') + (st && st.ema >= 0.75 ? ' done' : ''), 'aria-pressed': x.id === level ? 'true' : 'false', title: 'Level ' + x.id + ': ' + x.name + (locked ? ' (locked)' : ''), onclick: () => { level = x.id; renderLevel(); renderMode(); } });
        if (locked) { const ic = h('span', { class: 'sr-lock' }); ic.innerHTML = LOCK; b.append(ic); }
        b.append(String(x.id));
        chips.append(b);
      });
      const locked = level > top;
      levelCard.append(
        h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Level ' + level + ' of ' + LEVELS.length }), h('span', { class: 'small muted', text: 'Unlocked up to ' + top })),
        chips,
        h('h2', { text: lv.name }),
        h('p', { text: lv.goal }),
        locked ? h('p', { class: 'small sr-preview', text: 'Preview: this level unlocks when you read level ' + top + ' reliably (notes, rhythm and melody). You can still try it.' }) : '',
        h('details', { class: 'sr-tips' }, h('summary', { class: 'small' }, 'Tips for this level'), h('ul', {}, lv.tips.map(t => h('li', { class: 'small', text: t })))));
    }
    function renderSeg() {
      modeSeg.innerHTML = '';
      [['notes', 'Notes'], ['rhythm', 'Rhythm'], ['melody', 'Melody']].forEach(([k, t]) => modeSeg.append(h('button', { 'aria-pressed': mode === k ? 'true' : 'false', onclick: () => { if (mode === k) return; mode = k; E.setSetting('readingMode', k); renderSeg(); renderMode(); } }, t)));
    }
    function renderMode() {
      if (modeApi) { try { modeApi.cleanup(); } catch (e) { console.error(e); } }
      modeBody.innerHTML = '';
      ctx.setActive(false);
      modeApi = (mode === 'notes' ? notesMode : mode === 'rhythm' ? rhythmMode : melodyMode)(modeBody, L(), ctx);
    }
    let rsz = null, lastW = window.innerWidth;
    const onResize = () => { clearTimeout(rsz); rsz = setTimeout(() => { if (Math.abs(window.innerWidth - lastW) < 40) return; lastW = window.innerWidth; if (modeApi && modeApi.redraw) modeApi.redraw(); }, 250); };
    window.addEventListener('resize', onResize);
    renderLevel(); renderSeg(); renderMode();
    return () => { window.removeEventListener('resize', onResize); clearTimeout(rsz); if (modeApi) modeApi.cleanup(); };
  }
});

/* ======================================================
   NOTES: flash cards
   ====================================================== */
function notesMode(root, lv, ctx) {
  const usesAcc = lv.notes.some(m => ![0, 2, 4, 5, 7, 9, 11].includes(m % 12)) || lv.keys.some(k => k !== 'C');
  const pool = universe().filter(x => x.id.startsWith('n:') && lv.notes.includes(+x.id.slice(2)));
  const card = h('div', { class: 'card' }); root.append(card);
  const staffBox = h('div', { class: 'sr-staff sr-card' });
  const keyLbl = h('span', { class: 'small muted' });
  const tally = h('span', { class: 'mono small' });
  let accSel = 0;
  const accSeg = h('div', { class: 'seg sr-acc', role: 'group', 'aria-label': 'Accidental' });
  const paintAcc = () => accSeg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.a === accSel ? 'true' : 'false'));
  [-1, 0, 1].forEach(a => accSeg.append(h('button', { 'data-a': a, 'aria-label': a === -1 ? 'flat' : a === 1 ? 'sharp' : 'natural', onclick: () => { accSel = a; paintAcc(); } }, ACC[a])));
  const letters = h('div', { class: 'sr-letters' }, LETTERS.map(l => h('button', { class: 'choice', 'data-l': l, onclick: () => answer(l, accSel) }, h('b', { text: l }))));
  const fb = h('div', { class: 'feedback', hidden: true });
  const fbBoard = Fretboard({ label: 'Where the note is on the guitar' });
  const boardBox = h('div', { class: 'stack', hidden: true }, h('span', { class: 'eyebrow', text: 'Where to play it' }), fbBoard.el);
  let micOff = null;
  const mic = MicToggle({ label: 'Answer by playing it', onLabel: 'Listening: play the note', hint: 'Play it where it sounds: guitar music sounds an octave lower than written.',
    onOn: () => { micOff = Mic.on('note', onHeard); }, onOff: () => { if (micOff) micOff(); micOff = null; } });
  card.append(h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Name the note' }), tally), staffBox, keyLbl,
    usesAcc ? h('div', { class: 'row' }, accSeg, h('span', { class: 'small muted', text: 'Pick ♯ or ♭ first if the note needs one, including from the key signature.' })) : '',
    letters, mic.el, fb, boardBox);
  paintAcc();

  let q = null, t0 = 0, answered = false, auto = null, right = 0, total = 0, rtSum = 0;
  function draw() {
    staffBox.innerHTML = '';
    const w = Math.min(staffWidth(staffBox), 360);
    const st = renderStaff({ bars: [[q.card.note]], key: q.card.key, time: '4/4', showTime: false, endBar: 'none', width: w, scale: 1.55, label: 'One note on the staff' });
    staffBox.append(st.el);
    if (answered) st.mark(0, q.ok ? 'good' : 'bad');
  }
  function next() {
    clearTimeout(auto);
    const item = E.pick(SKILL, pool) || pool[0];
    const midi = +item.id.slice(2);
    q = { midi, card: noteCard(lv, midi) };
    answered = false; accSel = 0; paintAcc();
    keyLbl.textContent = q.card.key !== 'C' ? 'Key: ' + keyName(q.card.key) : '';
    letters.querySelectorAll('button').forEach(b => { b.disabled = false; b.classList.remove('correct', 'wrong'); });
    fb.hidden = true; boardBox.hidden = true;
    draw();
    t0 = performance.now();
  }
  function finish(ok, msg) {
    answered = true; q.ok = ok;
    const rt = performance.now() - t0;
    E.record(SKILL, 'n:' + q.midi, ok, { rt });
    ctx.tick(1);
    total++; if (ok) { right++; rtSum += rt; }
    tally.textContent = right + ' / ' + total + (right ? ' · ' + (rtSum / right / 1000).toFixed(1) + ' s avg' : '');
    letters.querySelectorAll('button').forEach(b => { b.disabled = true; if (b.dataset.l === q.card.letter) b.classList.add('correct'); });
    draw();
    const sounding = q.midi - 12;
    const places = [];
    E.STRINGS.forEach((s, si) => { const f = sounding - s.midi; if (f >= 0 && f <= 12) places.push({ s: si, f }); });
    const best = places.slice().sort((a, b) => a.f - b.f)[0];
    fbBoard.mark(places.map(pl => ({ s: pl.s, f: pl.f, kind: pl === best ? 'root' : 'tone', label: q.card.letter + (q.card.alter ? ACC[q.card.alter] : '') })));
    boardBox.hidden = false;
    fb.hidden = false; fb.className = 'feedback ' + (ok ? 'ok' : 'no'); fb.innerHTML = '';
    fb.append(h('b', { text: (ok ? 'Correct: ' : 'It’s ') + q.card.name + '.' }));
    if (msg) fb.append(h('span', { text: msg }));
    fb.append(h('span', { class: 'small', text: 'Sounds as ' + soundName(sounding) + '. ' + (best ? 'Lowest place: ' + E.STRINGS[best.s].name + ' string, ' + (best.f ? 'fret ' + best.f : 'open') + '.' : '') }));
    fb.append(h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => { A.ensure(); if (mic.on) Mic.muteUntil(A.now() + 1.8); A.note(sounding, A.now() + 0.02, 0.8, 1.4); } }, '▶ Hear it'), h('button', { class: 'btn primary small', onclick: next }, 'Next →')));
    if (!mic.on) { A.ensure(); A.note(sounding, A.now() + 0.02, 0.7, 1.2); }
    if (ok) auto = setTimeout(next, mic.on ? 1500 : 1300);
  }
  function answer(letter, alter) {
    if (answered || !q) return;
    const ok = letter === q.card.letter && alter === q.card.alter;
    letters.querySelectorAll('button').forEach(b => { if (b.dataset.l === letter && !ok) b.classList.add('wrong'); });
    let msg = '';
    if (!ok && letter === q.card.letter) {
      const fromKey = keyAlters(KEYS[q.card.key].fifths)['CDEFGAB'.indexOf(q.card.letter)] === q.card.alter;
      msg = q.card.alter === 0 ? 'Right letter, but this one is natural.' : 'Right letter: it needs the ' + (q.card.alter > 0 ? 'sharp' : 'flat') + (fromKey ? ' from the key signature.' : '.');
    } else if (!ok) msg = 'You chose ' + letter + (alter ? ACC[alter] : '') + '.';
    finish(ok, msg);
  }
  function onHeard(ev) {
    if (answered || !q || performance.now() - t0 < 350) return;
    const got = Math.round(ev.midi), want = q.midi - 12;
    if (got === want) finish(true, 'Heard ' + soundName(got) + '.');
    else if ((got - want) % 12 === 0) finish(false, 'Heard ' + soundName(got) + ': right note, wrong octave. Written notes sound an octave lower than they look.');
    else finish(false, 'Heard ' + soundName(got) + '.');
  }
  function onKey(e) {
    if (e.target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
    const k = e.key;
    if (!answered && /^[a-gA-G]$/.test(k)) { e.preventDefault(); answer(k.toUpperCase(), accSel); }
    else if (!answered && (k === '#' || k === '+')) { accSel = 1; paintAcc(); }
    else if (!answered && k === '-') { accSel = -1; paintAcc(); }
    else if (!answered && k === '=') { accSel = 0; paintAcc(); }
    else if (answered && (k === 'Enter' || k === ' ')) { e.preventDefault(); next(); }
  }
  document.addEventListener('keydown', onKey);
  next();
  return {
    redraw: () => q && draw(),
    cleanup() { clearTimeout(auto); document.removeEventListener('keydown', onKey); if (micOff) micOff(); mic.cleanup(); }
  };
}

/* ======================================================
   THE LIBRARY: every piece you read is kept. New ones never run out; missed ones come back for a re-read.
   ====================================================== */
const KIND_NAME = { r: 'Rhythm', m: 'Melody' }, KIND_PLURAL = { r: 'rhythms', m: 'melodies' };
function sourceLine(el, cur, kind) {
  el.innerHTML = '';
  if (cur.entry) {
    const d = Lib.describe(cur.entry);
    el.append(h('span', { class: 'badge ' + (cur.review ? 'brass' : ''), text: cur.review ? 'Re-read' : 'From your library' }),
      ' ' + KIND_NAME[kind] + ' ' + cur.entry.no + ' · first read ' + d.when + (d.last != null ? ' · last time ' + d.last + '%' : ''));
  } else el.append(h('span', { class: 'badge', text: 'New' }), ' Unseen piece, made just now');
}
/* The list of kept pieces for this level, with filters; onOpen(entryId) loads one */
function libraryPanel(kind, lv, onOpen) {
  const box = h('div', { class: 'sr-lib', hidden: true });
  let filter = 'all';
  function draw() {
    box.innerHTML = '';
    const all = Lib.list(lv.id, kind).sort((a, b) => b.last - a.last);
    const due = all.filter(p => Lib.isDue(p));
    const pick = { all, due, missed: all.filter(p => p.best < 0.9), star: all.filter(p => p.star) }[filter];
    box.append(h('div', { class: 'spread' }, h('b', { text: 'Your ' + KIND_PLURAL[kind] + ' at level ' + lv.id }), h('span', { class: 'small muted', text: all.length + ' kept · ' + due.length + ' due' })),
      h('p', { class: 'small muted', text: 'Every piece you read is kept here. A clean first read is done; anything less comes back after a day, then at longer gaps, until you read it cleanly. A retry straight away doesn’t count: by then you are partly playing from memory.' }),
      h('div', { class: 'chips' }, [['all', 'All'], ['due', 'Due (' + due.length + ')'], ['missed', 'Not clean yet'], ['star', '★ Starred']].map(([k, t]) => h('button', { class: 'chip', 'aria-pressed': k === filter ? 'true' : 'false', onclick: () => { filter = k; draw(); } }, t))));
    if (!pick.length) { box.append(h('p', { class: 'small', text: all.length ? 'Nothing here.' : 'Nothing kept yet: read a piece to the end and it lands here.' })); return; }
    box.append(h('ul', { class: 'sr-liblist' }, pick.slice(0, 40).map(p => {
      const d = Lib.describe(p), pc = Lib.decode(p.code);
      return h('li', {},
        h('button', { class: 'sr-libopen', onclick: () => onOpen(p.id) },
          h('b', { text: KIND_NAME[kind] + ' ' + p.no }),
          h('span', { class: 'small muted', text: (kind === 'm' ? keyName(pc.key) + ' · ' : '') + pc.time + ' · ' + d.reads + ' read' + (d.reads === 1 ? '' : 's') + ' · best ' + d.best + '% · ' + d.when }),
          Lib.isDue(p) ? h('span', { class: 'badge brass', text: 'due' }) : p.due ? h('span', { class: 'small muted', text: 'back in ' + Math.max(1, Math.ceil((p.due - Date.now()) / 864e5)) + ' d' }) : ''),
        h('button', { class: 'mbtn', 'aria-label': p.star ? 'Unstar' : 'Star', title: p.star ? 'Starred: kept for good' : 'Star to keep it for good', onclick: () => { Lib.star(p.id, !p.star); draw(); } }, p.star ? '★' : '☆'),
        h('button', { class: 'mbtn', 'aria-label': 'Delete', title: 'Delete', onclick: () => { Lib.remove(p.id); draw(); } }, '✕'));
    })));
  }
  return { el: box, toggle() { box.hidden = !box.hidden; if (!box.hidden) draw(); }, draw };
}
function libButton(kind, lv, panel) {
  const b = h('button', { class: 'btn ghost small', onclick: () => panel.toggle() });
  const paint = () => { const n = Lib.list(lv.id, kind).length, d = Lib.dueCount(lv.id, kind); b.textContent = 'Library (' + n + (d ? ' · ' + d + ' due' : '') + ')'; };
  paint();
  return { el: b, paint };
}
function starButton(cur) {
  if (!cur.entry) return '';
  const b = h('button', { class: 'btn small ghost', onclick: () => { Lib.star(cur.entry.id, !cur.entry.star); paint(); } });
  const paint = () => { b.textContent = cur.entry.star ? '★ Starred' : '☆ Keep this one'; };
  paint();
  return b;
}

/* ======================================================
   RHYTHM: read and tap a two-bar rhythm
   ====================================================== */
function bpmFor(lv, kind) {
  const all = E.state.settings.readingBpm || {};
  const v = all[kind + lv.id];
  return typeof v === 'number' ? v : lv.tempo[0];
}
function saveBpm(lv, kind, v) { const all = Object.assign({}, E.state.settings.readingBpm || {}); all[kind + lv.id] = v; E.setSetting('readingBpm', all); }
function tempoControl(get, set, lv) {
  const lbl = h('b', { class: 'mono sr-bpm' });
  const paint = () => { lbl.textContent = get() + ' bpm'; };
  const bump = d => { set(Math.max(30, Math.min(220, get() + d))); paint(); };
  paint();
  return { el: h('div', { class: 'row sr-tempo' }, h('span', { class: 'eyebrow', text: 'Tempo' }), h('button', { class: 'btn small', 'aria-label': 'Slower', onclick: () => bump(-4) }, '−4'), lbl, h('button', { class: 'btn small', 'aria-label': 'Faster', onclick: () => bump(4) }, '+4'), h('span', { class: 'small muted', text: 'level range ' + lv.tempo[0] + '–' + lv.tempo[1] })), paint, bump };
}

function rhythmMode(root, lv, ctx) {
  const card = h('div', { class: 'card' }); root.append(card);
  let cur = Lib.next(lv.id, 'r', () => rhythmPiece(lv)), piece = cur.piece, staff = null, run = null, pad = null, showCounts = !!E.state.settings.readingCounts;
  const src = h('p', { class: 'small sr-src' });
  const lib = libraryPanel('r', lv, id => { stop(); cur = Lib.open(id); piece = cur.piece; result.innerHTML = ''; draw(); lib.toggle(); card.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
  const libBtn = libButton('r', lv, lib);
  let bpm = bpmFor(lv, 'r');
  const staffBox = h('div', { class: 'sr-staff' });
  const info = h('span', { class: 'small muted' });
  const phase = h('div', { class: 'phase' });
  const padBox = h('div');
  const result = h('div', { class: 'stack' });
  const tempo = tempoControl(() => bpm, v => { bpm = v; saveBpm(lv, 'r', v); }, lv);
  const startBtn = h('button', { class: 'btn brass' }, 'Start: count-in, then tap');
  const hearBtn = h('button', { class: 'btn' }, '▶ Hear it');
  const newBtn = h('button', { class: 'btn ghost' }, 'Next rhythm');
  const stopBtn = h('button', { class: 'btn', hidden: true, onclick: () => stop() }, '■ Stop');
  const countBox = h('label', { class: 'check small' }, h('input', { type: 'checkbox', checked: showCounts ? true : null, onchange: e => { showCounts = e.target.checked; E.setSetting('readingCounts', showCounts); draw(); } }), 'Show the counts');
  card.append(h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Read this rhythm' }), info), src, staffBox, countBox, tempo.el,
    h('div', { class: 'row' }, startBtn, stopBtn, hearBtn, newBtn, libBtn.el), phase, padBox, result, lib.el);
  function draw() {
    staffBox.innerHTML = '';
    staff = renderStaff({ bars: piece.bars, key: 'C', time: piece.time, width: staffWidth(staffBox), barsPerLine: 2, lyrics: showCounts ? countLabels(piece) : null, label: 'A two-bar rhythm' });
    staffBox.append(staff.el);
    sourceLine(src, cur, 'r'); libBtn.paint();
    info.textContent = piece.time + ' · ' + (parseTime(piece.time).compound ? 'beat = dotted quarter' : 'beat = quarter');
  }
  function stop() {
    if (run) run.stop(); run = null;
    if (pad) { pad.cleanup(); pad = null; } padBox.innerHTML = '';
    ctx.setActive(false); startBtn.disabled = false; hearBtn.disabled = false; newBtn.disabled = false; stopBtn.hidden = true;
  }
  hearBtn.onclick = () => {
    stop(); draw(); ctx.setActive(true); hearBtn.disabled = true; stopBtn.hidden = false;
    run = playPiece({ piece, staff, bpm, countIn: true, click: true, notes: true, phase, onEnd: () => { run = null; stop(); } });
  };
  newBtn.onclick = () => { stop(); cur = Lib.next(lv.id, 'r', () => rhythmPiece(lv)); piece = cur.piece; result.innerHTML = ''; draw(); };
  startBtn.onclick = () => {
    stop(); draw(); result.innerHTML = '';
    A.ensure(); ctx.setActive(true);
    startBtn.disabled = hearBtn.disabled = newBtn.disabled = true; stopBtn.hidden = false;
    const taps = [];
    const lat = (E.state.settings.latencyMs || 0) / 1000;
    pad = TapPad(ev => taps.push(ev.micTime !== undefined ? ev.micTime : A.eventToAudioTime(ev) - lat), 'Tap the rhythm here (or space bar)', { mic: true });
    padBox.append(pad.el);
    run = playPiece({
      piece, staff, bpm, countIn: true, click: true, notes: false, phase,
      onEnd: expected => setTimeout(() => {
        const spq = 60 / bpm / parseTime(piece.time).beatQ;
        const win = Math.max(0.05, Math.min(0.15, minGapQ(expected) * spq * 0.45));
        const res = scoreTaps(expected, taps, win);
        res.errs.forEach(x => markAttack(staff, piece, x.e, x.d !== null && Math.abs(x.d) <= Math.max(0.035, win * 0.55) ? 'good' : 'bad'));
        const ok = res.score >= 0.7;
        E.record(SKILL, 'L' + lv.id + ':rhythm', ok, { score: res.score });
        Lib.record(cur, lv.id, 'r', res.score, bpm); sourceLine(src, cur, 'r'); libBtn.paint(); if (!lib.el.hidden) lib.draw();
        ctx.tick(1);
        run = null; stop();
        result.innerHTML = '';
        result.append(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') },
          h('div', { class: 'spread' }, h('b', { text: 'Score ' + Math.round(res.score * 100) + '%' }), h('span', { class: 'mono small', text: Math.round(res.hitRate * 100) + '% of notes hit' + (res.extra ? ' · ' + res.extra + ' extra' : '') })),
          h('span', { text: describeOffset(res.mean * 1000) }),
          h('span', { class: 'small', text: 'Green notes landed on time; red ones were early, late or missed.' }),
          h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => startBtn.onclick() }, 'Try again'),
            ok && res.score >= 0.85 ? h('button', { class: 'btn small', onclick: () => { tempo.bump(4); toast('Up to ' + bpm + ' bpm'); newBtn.onclick(); } }, '+4 bpm, next rhythm') : '',
            starButton(cur),
            h('button', { class: 'btn primary small', onclick: () => newBtn.onclick() }, 'Next rhythm →'))));
      }, 150)
    });
  };
  draw();
  return { redraw: () => { if (!run) draw(); }, cleanup: stop };
}

/* ======================================================
   MELODY: read four bars at sight with a moving cursor
   ====================================================== */
function melodyMode(root, lv, ctx) {
  const card = h('div', { class: 'card' }); root.append(card);
  let cur = Lib.next(lv.id, 'm', () => genMelody(lv)), piece = cur.piece, staff = null, run = null, bpm = bpmFor(lv, 'm'), marks = {};
  const src = h('p', { class: 'small sr-src' });
  const lib = libraryPanel('m', lv, id => { cur = Lib.open(id); piece = cur.piece; fresh(); lib.toggle(); card.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
  const libBtn = libButton('m', lv, lib);
  const staffBox = h('div', { class: 'sr-staff' });
  const info = h('span', { class: 'small muted' });
  const phase = h('div', { class: 'phase' });
  const result = h('div', { class: 'stack' });
  const live = h('span', { class: 'mono small' });
  const tempo = tempoControl(() => bpm, v => { bpm = v; saveBpm(lv, 'm', v); }, lv);
  const startBtn = h('button', { class: 'btn brass' }, '▶ Start reading');
  const hearBtn = h('button', { class: 'btn' }, 'Hear it');
  const newBtn = h('button', { class: 'btn ghost' }, 'Next melody');
  const stopBtn = h('button', { class: 'btn', hidden: true, onclick: () => stop() }, '■ Stop');
  let micNoteOff = null;
  const mic = MicToggle({ label: 'Check my playing', onLabel: 'Listening: notes and timing are checked', hint: 'Headphones help, so the mic hears your guitar and not the click.' });
  card.append(h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Play this at sight' }), info), src, staffBox, tempo.el,
    h('div', { class: 'row' }, startBtn, stopBtn, hearBtn, newBtn, libBtn.el), mic.el, phase, live, result, lib.el);
  function draw() {
    staffBox.innerHTML = '';
    staff = renderStaff({ bars: piece.bars, key: piece.key, time: piece.time, width: staffWidth(staffBox), label: 'A four-bar melody in ' + keyName(piece.key) });
    staffBox.append(staff.el);
    attacks(piece).forEach(a => { if (marks[a.i]) markAttack(staff, piece, a, marks[a.i]); });
    info.textContent = keyName(piece.key) + ' · ' + piece.time;
    sourceLine(src, cur, 'm'); libBtn.paint();
  }
  function stop() {
    if (run) run.stop(); run = null;
    if (micNoteOff) micNoteOff(); micNoteOff = null;
    ctx.setActive(false); startBtn.disabled = hearBtn.disabled = newBtn.disabled = false; stopBtn.hidden = true;
  }
  function fresh() { stop(); marks = {}; result.innerHTML = ''; live.textContent = ''; draw(); }
  hearBtn.onclick = () => {
    fresh(); ctx.setActive(true); hearBtn.disabled = true; stopBtn.hidden = false;
    run = playPiece({ piece, staff, bpm, countIn: true, click: true, notes: true, phase, onEnd: () => { run = null; stop(); } });
    if (mic.on) Mic.muteUntil(A.now() + 0.2 + (parseTime(piece.time).barQ + pieceLength(piece)) * 60 / bpm / parseTime(piece.time).beatQ + 1.5);
  };
  newBtn.onclick = () => { cur = Lib.next(lv.id, 'm', () => genMelody(lv)); piece = cur.piece; fresh(); };
  startBtn.onclick = () => {
    fresh(); A.ensure(); ctx.setActive(true);
    startBtn.disabled = hearBtn.disabled = newBtn.disabled = true; stopBtn.hidden = false;
    const listening = mic.on;
    const ats = attacks(piece), spq = 60 / bpm / parseTime(piece.time).beatQ;
    const judged = new Map(); // attack index -> { pitch, d }
    const exp = [];
    const winOf = j => { const gap = Math.min(j > 0 ? ats[j].q - ats[j - 1].q : 9, j + 1 < ats.length ? ats[j + 1].q - ats[j].q : 9); return Math.max(0.08, Math.min(0.25, gap * spq * 0.5)); };
    let heardN = 0, goodN = 0;
    if (listening) {
      micNoteOff = Mic.on('note', ev => {
        if (!exp.length) return;
        const t = ev.t - Mic.latencyMs() / 1000;
        let best = -1, bd = Infinity;
        exp.forEach(e => { const d = t - e.t; if (Math.abs(d) < Math.abs(bd)) { bd = d; best = e.k; } });
        if (best < 0 || judged.has(best) || Math.abs(bd) > winOf(best)) return;
        const want = ats[best].midi - 12, got = Math.round(ev.midi);
        const pitch = got === want ? 1 : (got - want) % 12 === 0 ? 0.5 : 0;
        judged.set(best, { pitch, d: bd, got });
        const good = pitch === 1 && Math.abs(bd) <= winOf(best) * 0.6;
        marks[ats[best].i] = good ? 'good' : 'bad'; markAttack(staff, piece, ats[best], marks[ats[best].i]);
        heardN++; if (good) goodN++;
        live.textContent = 'Heard ' + noteLabel(ev.midi).split(' ')[0] + (pitch === 1 ? ' ✓' : ' ✗ (wanted ' + soundName(want) + ')') + ' · ' + goodN + ' of ' + heardN + ' clean';
      });
    }
    run = playPiece({
      piece, staff, bpm, countIn: true, click: true, notes: false, phase,
      onExpected: e => exp.push(Object.assign({ k: exp.length }, e)),
      onEnd: () => setTimeout(() => {
        run = null;
        if (micNoteOff) micNoteOff(); micNoteOff = null;
        if (listening) finishMic(); else finishSelf();
      }, listening ? 400 : 50)
    });
    function finishMic() {
      let sum = 0, right = 0, absD = 0, nD = 0;
      ats.forEach((a, j) => {
        const r = judged.get(j);
        if (!r) { marks[a.i] = 'bad'; markAttack(staff, piece, a, 'bad'); return; }
        const timing = Math.max(0, 1 - Math.abs(r.d) / winOf(j));
        sum += r.pitch * (0.6 + 0.4 * timing);
        if (r.pitch === 1) right++;
        absD += Math.abs(r.d); nD++;
      });
      const score = ats.length ? sum / ats.length : 0;
      const missed = ats.length - judged.size;
      record(score, h('span', { class: 'small', text: right + ' of ' + ats.length + ' right notes' + (missed ? ', ' + missed + ' not heard' : '') + (nD ? ' · timing ±' + Math.round(absD / nD * 1000) + ' ms' : '') + '.' }), score >= 0.9);
    }
    function finishSelf() {
      stop();
      result.innerHTML = '';
      const choose = (score, clean) => record(score, null, clean);
      result.append(h('div', { class: 'stack' }, h('b', { text: 'How did that go?' }),
        h('div', { class: 'row' },
          h('button', { class: 'btn small', onclick: () => choose(1, true) }, 'Got it all'),
          h('button', { class: 'btn small', onclick: () => choose(0.7, false) }, 'Most of it'),
          h('button', { class: 'btn small', onclick: () => choose(0.35, false) }, 'Struggled')),
        h('div', { class: 'row' }, h('button', { class: 'btn ghost small', onclick: () => hearBtn.onclick() }, '▶ Hear it'), h('span', { class: 'small muted', text: 'Listen back and check yourself against it.' }))));
    }
    function record(score, detail, clean) {
      stop();
      const ok = score >= 0.75;
      E.record(SKILL, 'L' + lv.id + ':melody', ok, { score });
      Lib.record(cur, lv.id, 'm', score, bpm); sourceLine(src, cur, 'm'); libBtn.paint(); if (!lib.el.hidden) lib.draw();
      ctx.tick(1);
      result.innerHTML = '';
      result.append(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') },
        h('b', { text: listening ? 'Score ' + Math.round(score * 100) + '%' : ok ? 'Nice read.' : score >= 0.5 ? 'Good: read a new one at this tempo.' : 'Try it 8 bpm slower, and keep going through mistakes.' }),
        detail,
        h('div', { class: 'row' },
          h('button', { class: 'btn small', onclick: () => startBtn.onclick() }, 'Again'),
          !listening ? null : h('button', { class: 'btn small', onclick: () => hearBtn.onclick() }, '▶ Hear it'),
          clean ? h('button', { class: 'btn brass small', onclick: () => { tempo.bump(4); toast('Up to ' + bpm + ' bpm'); newBtn.onclick(); } }, '+4 bpm') : '',
          !ok && score < 0.5 ? h('button', { class: 'btn small', onclick: () => { tempo.bump(-8); toast('Down to ' + bpm + ' bpm'); } }, '−8 bpm') : null,
          starButton(cur),
          h('button', { class: 'btn primary small', onclick: () => newBtn.onclick() }, 'Next melody →'))));
    }
  };
  draw();
  return { redraw: () => { if (!run) draw(); }, cleanup: () => { stop(); mic.cleanup(); } };
}
