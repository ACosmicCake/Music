/* World Woodshed — Sight-reading: note flash cards, rhythm reading and melodies, level by level */
import A from '../audio.js';
import E from '../engine.js';
import Mic from '../listen.js';
import { h, tool, toast, Fretboard, hooks } from '../ui/core.js';
import { MicToggle, noteLabel } from '../ui/mic.js';
import { TapPad } from './rhythm.js';
import { renderStaff, parseTime, keyName, durQ, KEYS, keyAlters } from '../notation.js';
import { LEVELS, STAGES, HOW_TO, readingItems, withAccidentals, genMelody, rhythmPiece, noteCard, attacks, playLength, playOrder, eventStarts } from '../content/reading.js';
import { placeFrets } from '../notate.js';
import { parseChord } from '../theory.js';
import { guitarMidis } from '../voicings.js';
import Lib from '../readlib.js';

const SKILL = 'reading';
const LOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const ACC = { '-1': '♭', 0: '♮', 1: '♯' };
const clampLevel = k => Math.max(1, Math.min(LEVELS.length, Math.round(+k) || 1));
const universe = () => { const u = E.universe(SKILL); return u && u.length ? u : readingItems(); };
const itemState = id => { const ss = E.skillState(SKILL); return ss && ss.items ? ss.items[id] : null; };
const POS_NAME = p => p + (p === 1 ? 'st' : p === 2 ? 'nd' : p === 3 ? 'rd' : 'th');
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
      else { const b = Math.floor(q + 1e-6), f = Math.round((q - b) * 12) % 12; t = f === 0 ? String(b + 1) : { 3: 'e', 6: '&', 9: 'a', 4: 'trip', 8: 'let' }[f] || '·'; }
      out.push(n.midi == null ? '(' + t + ')' : t);
      q += durQ(n);
    });
  });
  return out;
}

/* Keep the line being read on screen: when the cursor moves to a line that is low on the screen (or above
   it), scroll it to the upper part of the screen, so the lines after it are in view too. */
function follow(staff, sys) {
  const box = staff && staff.systemBox(sys);
  if (!box || !staff.el.isConnected) return;
  const r = staff.el.getBoundingClientRect(), k = r.height / staff.height;
  const top = r.top + box.top * k, bottom = r.top + box.bottom * k, vh = window.innerHeight;
  if (top < 70 || bottom > vh * 0.62) window.scrollBy({ top: top - vh * 0.22, behavior: 'smooth' });
}

/* Plays one piece, or a run of them, on a grid of twelfths of a quarter (so sixteenths and triplets both land
   on it), moving the cursor along. Each piece starts with a count-in bar: the next piece of a run appears at
   the start of its count-in, so there is a bar to look it over while the beat goes on.
   o: { first: { piece }, staff (drawn for the first piece), bpm, countIn, click, notes (play the pitches),
        phase (element), next(): the next { piece } of the run or null to stop, show(item): draws an item's piece
        and returns its staff, onExpected(e, seg), onPieceEnd(seg): a piece was read to its end, onEnd() }
   A seg is { item, piece, k, expected: [{ i, q, len, midi, chord, t, dur, j }], ats, spq, staff }. */
const G = 1 / 12;
function playRun(o) {
  A.ensure();
  const segs = [];
  const opts = { steps: 1e9, maxSteps: 0 };
  const make = (item, start) => {
    const piece = item.piece, ts = parseTime(piece.time), spq = 60 / o.bpm / ts.beatQ;
    const barSteps = Math.round(ts.barQ / G), beatSteps = Math.round(ts.beatQ / G);
    const pre = segs.length || o.countIn ? barSteps : 0;
    const len = Math.round(playLength(piece) / G), order = playOrder(piece);
    const ats = attacks(piece);
    const byStep = new Map(); ats.forEach((a, j) => byStep.set(Math.round(a.q / G), Object.assign({ j }, a)));
    const evAt = new Map(); eventStarts(piece).forEach(e => evAt.set(Math.round(e.q / G), e.i));
    const seg = { item, piece, order, k: segs.length, start, pre, end: start + pre + len, ts, spq, barSteps, beatSteps, byStep, evAt, ats, expected: [], staff: segs.length ? null : o.staff };
    segs.push(seg);
    return seg;
  };
  const segAt = i => { for (let k = segs.length - 1; k >= 0; k--) if (segs[k].start <= i) return segs[k]; return segs[0]; };
  make(o.first, 0);
  let nowEl = null, nowSys = -1, ended = false;
  const setNow = (seg, i) => {
    if (nowEl) nowEl.classList.remove('now');
    nowEl = i === null || !seg.staff ? null : seg.staff.noteEls[i];
    if (nowEl) nowEl.classList.add('now');
    if (seg.staff) seg.staff.cursor(i);
    const p = i === null || !seg.staff ? null : seg.staff.posOf(i);
    if (p && p.sys !== nowSys) { nowSys = p.sys; follow(seg.staff, p.sys); }
  };
  const finish = seg => { if (seg.done) return; seg.done = true; if (o.onPieceEnd) o.onPieceEnd(seg); };
  Object.assign(opts, {
    stepDur: i => segAt(i).spq * G,
    onStep: (i, t) => {
      const seg = segAt(i), k = i - seg.start, inPre = k < seg.pre, kk = inPre ? k : k - seg.pre;
      if (kk % seg.beatSteps === 0) {
        const down = kk % seg.barSteps === 0;
        if (inPre) A.hit(down ? 'clickHi' : 'click', t, 0.95);
        else if (o.click) A.hit(down ? 'clickHi' : 'click', t, 0.45);
      } else if (inPre && seg.ts.compound && kk % 6 === 0) A.hit('click', t, 0.4);
      if (!inPre && seg.byStep.has(kk)) {
        const a = seg.byStep.get(kk), e = Object.assign({}, a, { t, dur: a.len * seg.spq });
        seg.expected.push(e);
        if (o.onExpected) o.onExpected(e, seg);
        const ring = Math.max(0.12, Math.min(2, a.len * seg.spq - 0.03));
        if (o.notes && a.slash) { const c = a.sym && parseChord(a.sym); if (c) A.strum(guitarMidis(c.root, c.iv), t, 0.55, 0.014, ring); }
        else if (o.notes) (a.chord || [a.midi]).forEach((m, x) => A.note(m - 12, t + x * 0.014, a.chord ? 0.6 : 0.8, ring));
      }
      // the last step of a piece: line up the next one, or end here
      if (i === seg.end - 1 && seg.k === segs.length - 1) {
        const nx = o.next ? o.next(seg) : null;
        if (nx) make(nx, seg.end); else opts.maxSteps = seg.end;
      }
    },
    onVisual: i => {
      const seg = segAt(i), k = i - seg.start, inPre = k < seg.pre, kk = inPre ? k : k - seg.pre;
      if (i === seg.start && seg.k > 0) {
        const prev = segs[seg.k - 1];
        setNow(prev, null);
        setTimeout(() => finish(prev), 260); // late taps and notes still count
        seg.staff = o.show(seg.item, seg); nowSys = -1;
        follow(seg.staff, 0);
      }
      if (inPre) { if (o.phase && kk % seg.beatSteps === 0) o.phase.textContent = (seg.k ? 'Next piece · count-in: ' : 'Count-in: ') + (kk / seg.beatSteps + 1) + ' …'; return; }
      if (o.phase && kk % seg.beatSteps === 0) o.phase.textContent = (segs.length > 1 || o.next ? 'Piece ' + (seg.k + 1) + ' · ' : '') + 'Bar ' + ((seg.order[Math.floor(kk / seg.barSteps)] || 0) + 1) + ' of ' + seg.piece.bars.length + ' · beat ' + ((kk % seg.barSteps) / seg.beatSteps + 1);
      if (seg.evAt.has(kk)) setNow(seg, seg.evAt.get(kk));
    },
    onEnd: () => {
      if (ended) return; ended = true;
      const last = segs[segs.length - 1];
      setNow(last, null); if (o.phase) o.phase.textContent = '';
      setTimeout(() => { finish(last); if (o.onEnd) o.onEnd(); }, 120);
    }
  });
  const loop = A.Loop(opts);
  const startAt = loop.start(A.now() + 0.15);
  return {
    segs, startAt,
    // stopping keeps the pieces already read to the end; the one under way is left unscored
    stop() { if (ended) return; ended = true; loop.stop(); const cur = segs.find(sg => !sg.done && sg.staff); if (cur) setNow(cur, null); if (o.phase) o.phase.textContent = ''; }
  };
}

function staffWidth(holder) { return Math.max(260, (holder.clientWidth || 320) - 4); }

const paperOn = () => !!E.state.settings.readingPaper;
const accOn = () => !!E.state.settings.readingAcc;
/* how many bars a rhythm or melody runs to, and whether the next one follows by itself */
const LENGTHS = [4, 8, 16];
const lenFor = kind => { const v = (E.state.settings.readingLen || {})[kind]; return LENGTHS.includes(v) ? v : 8; };
const setLen = (kind, v) => E.setSetting('readingLen', Object.assign({}, E.state.settings.readingLen || {}, { [kind]: v }));
const runOn = () => E.state.settings.readingRunOn !== false;
function lengthControls(kind, onChange) {
  const seg = h('div', { class: 'seg sr-len', role: 'group', 'aria-label': 'Length' });
  const paint = () => seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.n === lenFor(kind) ? 'true' : 'false'));
  LENGTHS.forEach(n => seg.append(h('button', { 'data-n': n, onclick: () => { if (lenFor(kind) === n) return; setLen(kind, n); paint(); onChange(); } }, n + ' bars')));
  paint();
  const keep = h('label', { class: 'check small' }, h('input', { type: 'checkbox', checked: runOn() ? true : null, onchange: e => E.setSetting('readingRunOn', e.target.checked) }), 'Keep going: the next one follows after a count-in bar');
  return h('div', { class: 'stack sr-opts' }, seg, keep);
}

tool('sightread', {
  tab: 'train', skill: SKILL, title: 'Sight-reading', eyebrow: 'Reading · notes, rhythm, melody',
  desc: 'Read standard notation on the guitar, level by level: name notes, tap rhythms, then play melodies at sight while a cursor keeps time.',
  render(body, ctx) {
    const p = ctx.params || {};
    const unlocked = () => Math.max(1, Math.min(LEVELS.length, E.unlockedTier(SKILL) || 1));
    let level = p.level ? clampLevel(p.level) : unlocked();
    let mode = ['notes', 'rhythm', 'melody', 'scores'].includes(p.mode) ? p.mode : (E.state.settings.readingMode || 'notes');
    let modeApi = null, pathOpen = false;

    const wrap = h('div', { class: 'stack sr-wrap' + (paperOn() ? ' sr-paper' : '') });
    const levelCard = h('div', { class: 'card sr-level' });
    const modeSeg = h('div', { class: 'seg big' });
    const paper = h('label', { class: 'check small sr-papertoggle' }, h('input', { type: 'checkbox', checked: paperOn() ? true : null, onchange: e => { E.setSetting('readingPaper', e.target.checked); wrap.classList.toggle('sr-paper', e.target.checked); } }), 'White paper: black notes on a white page');
    const modeBody = h('div', { class: 'section' });
    const how = h('details', { class: 'card sr-how' },
      h('summary', {}, h('b', { text: 'How to sight-read' })),
      h('ul', { class: 'sr-howlist' }, HOW_TO.map(([t, d]) => h('li', {}, h('b', { text: t + '. ' }), d))));
    const accBox = h('label', { class: 'check small sr-acctoggle' }, h('input', { type: 'checkbox', checked: accOn() ? true : null, onchange: e => { E.setSetting('readingAcc', e.target.checked); renderLevel(); renderMode(); } }), 'Sharps and flats: add ♯ and ♭ beside the notes, at any level');
    wrap.append(levelCard, modeSeg, h('div', { class: 'stack sr-toggles' }, accBox, paper), modeBody, how);
    body.append(wrap);

    const L = () => accOn() ? withAccidentals(LEVELS[level - 1]) : LEVELS[level - 1];
    const go = n => { level = clampLevel(n); renderLevel(); renderMode(); };
    function renderLevel() {
      const top = unlocked(), lv = L();
      levelCard.innerHTML = '';
      const stage = STAGES.find(st => level >= st.from && level <= st.to);
      const chip = x => {
        const locked = x.id > top;
        const st = itemState('L' + x.id + ':melody');
        const b = h('button', { class: 'chip sr-lv' + (locked ? ' locked' : '') + (st && st.ema >= 0.75 ? ' done' : ''), 'aria-pressed': x.id === level ? 'true' : 'false', title: 'Level ' + x.id + ': ' + x.name + (locked ? ' (locked)' : ''), onclick: () => go(x.id) });
        if (locked) { const ic = h('span', { class: 'sr-lock' }); ic.innerHTML = LOCK; b.append(ic); }
        b.append(String(x.id));
        return b;
      };
      const path = h('details', { class: 'sr-path', open: pathOpen ? true : null, ontoggle: e => { pathOpen = e.target.open; } },
        h('summary', { class: 'small' }, 'All ' + LEVELS.length + ' levels'),
        STAGES.map(st => h('div', { class: 'sr-stage' },
          h('span', { class: 'small muted', text: st.name }),
          h('div', { class: 'sr-levels', role: 'group', 'aria-label': st.name }, LEVELS.slice(st.from - 1, st.to).map(chip)))));
      const locked = level > top;
      levelCard.append(
        h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Level ' + level + ' of ' + LEVELS.length + (stage ? ' · ' + stage.name : '') }), h('span', { class: 'small muted', text: 'Unlocked up to ' + top })),
        h('div', { class: 'sr-step' },
          h('button', { class: 'btn small', 'aria-label': 'Previous level', disabled: level <= 1 ? true : null, onclick: () => go(level - 1) }, '←'),
          h('h2', { text: lv.name }),
          h('button', { class: 'btn small', 'aria-label': 'Next level', disabled: level >= LEVELS.length ? true : null, onclick: () => go(level + 1) }, '→')),
        h('p', { text: lv.goal }),
        lv.acc ? h('p', { class: 'small muted sr-accnote', text: 'With sharps and flats: notes can carry a ♯ or ♭ (and a ♮ to cancel it), which lasts to the end of the bar.' }) : '',
        locked ? h('p', { class: 'small sr-preview', text: 'Preview: this level unlocks when you read level ' + top + ' reliably (notes, rhythm and melody). You can still try it.' }) : '',
        h('details', { class: 'sr-tips' }, h('summary', { class: 'small' }, 'Tips for this level'), h('ul', {}, lv.tips.map(t => h('li', { class: 'small', text: t })))),
        path);
    }
    function renderSeg() {
      modeSeg.innerHTML = '';
      [['notes', 'Notes'], ['rhythm', 'Rhythm'], ['melody', 'Melody'], ['scores', 'Your scores']].forEach(([k, t]) => modeSeg.append(h('button', { 'aria-pressed': mode === k ? 'true' : 'false', onclick: () => { if (mode === k) return; mode = k; E.setSetting('readingMode', k); renderSeg(); renderMode(); } }, t)));
    }
    function renderMode() {
      if (modeApi) { try { modeApi.cleanup(); } catch (e) { console.error(e); } }
      modeBody.innerHTML = '';
      levelCard.hidden = mode === 'scores'; // your own scores have no level
      ctx.setActive(false);
      modeApi = (mode === 'notes' ? notesMode : mode === 'rhythm' ? rhythmMode : mode === 'scores' ? scoresMode : melodyMode)(modeBody, L(), ctx, mode === 'scores' ? p : undefined);
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
    fb.append(h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => { A.ensure(); A.fresh(); if (mic.on) Mic.muteUntil(A.now() + 1.8); A.note(sounding, A.now() + 0.02, 0.8, 1.4); } }, '▶ Hear it'), h('button', { class: 'btn primary small', onclick: next }, 'Next →')));
    if (!mic.on) { A.ensure(); A.fresh(); A.note(sounding, A.now() + 0.02, 0.7, 1.2); }
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
    else if (answered && (k === 'Enter' || k === ' ') && e.target.tagName !== 'BUTTON') { e.preventDefault(); next(); }
  }
  document.addEventListener('keydown', onKey);
  next();
  return {
    redraw: () => q && draw(),
    cleanup() { clearTimeout(auto); document.removeEventListener('keydown', onKey); if (micOff) micOff(); mic.cleanup(); }
  };
}

/* ======================================================
   YOUR SCORES: a score from the Library (MusicXML, MIDI, a Write by playing draft) read a section at a time
   ====================================================== */
const PERS = [2, 4, 8];
const barsLabel = x => (x.to > x.from ? 'Bars ' + x.from + '–' + x.to : 'Bar ' + x.from) + (x.again ? ', 2nd time' : x.piece && x.piece.repeat ? ', with the repeat' : '');
function scoresMode(root, lv, ctx, p) {
  const card = h('div', { class: 'card stack' }); root.append(card);
  const body = h('div', { class: 'section' }); root.append(body);
  let api = null, gone = false, token = 0;
  const saved = () => Object.assign({ per: 4 }, E.state.settings.readingOwn || {});
  const keep = v => E.setSetting('readingOwn', Object.assign(saved(), v));
  const done = () => { if (api) { try { api.cleanup(); } catch (e) { console.error(e); } } api = null; body.innerHTML = ''; ctx.setActive(false); };
  card.append(h('span', { class: 'eyebrow', text: 'Read your own scores' }),
    h('p', { class: 'small muted', text: 'A score from your Library, a few bars at a time, with the count-in, the cursor and the mic check of the melodies here. The top line of a MusicXML or MIDI file is read, or a score you wrote by playing.' }));
  const status = h('p', { class: 'small', text: 'Looking through your Library…' });
  card.append(status);
  (async () => {
    const [L, S] = await Promise.all([import('../library.js'), import('../scorepieces.js')]);
    const have = await L.localIds();
    if (gone) return;
    const files = [];
    L.sortEntries(L.listEntries(), 'recent').forEach(e => (e.files || []).forEach(f => { if (have.has(f.id) && L.READABLE_MELODY.test(f.name)) files.push({ e, f }); }));
    if (!files.length) {
      status.textContent = 'No score on this device to read yet. Add a MusicXML or MIDI file to the Library, have it read a PDF or a photo of a page, or write one by playing, and it shows up here.';
      return;
    }
    status.remove();
    const want = Object.assign(saved(), p && p.entry ? { entry: p.entry, file: p.file } : {});
    let pick = files.find(x => x.f.id === want.file) || files.find(x => x.e.id === want.entry) || files[0];
    const select = h('select', { 'aria-label': 'Score', onchange: () => { pick = files[+select.value]; keep({ entry: pick.e.id, file: pick.f.id, from: 0 }); load(0); } },
      files.map((x, i) => h('option', { value: i, selected: x === pick ? true : null, text: x.e.title + (x.e.files.filter(f => L.READABLE_MELODY.test(f.name)).length > 1 ? ' · ' + x.f.name : '') })));
    const perSeg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Bars at a time' });
    const paintPer = () => perSeg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.n === saved().per ? 'true' : 'false'));
    PERS.forEach(n => perSeg.append(h('button', { 'data-n': n, onclick: () => { if (saved().per === n) return; keep({ per: n, from: 0 }); paintPer(); load(0); } }, n + ' bars')));
    paintPer();
    const fromSel = h('select', { 'aria-label': 'Start at' });
    const runKeep = h('label', { class: 'check small' }, h('input', { type: 'checkbox', checked: runOn() ? true : null, onchange: e => E.setSetting('readingRunOn', e.target.checked) }), 'Keep going: the next section follows after a count-in bar');
    // a score the app read from a page may have a note wrong: fix it in the score viewer, then read on here
    let LU = null;
    const fixBtn = h('button', { class: 'btn small', onclick: async () => {
      LU = LU || await import('../ui/library.js');
      const from = +fromSel.value || 0;
      LU.fixNotes(pick.e.id, pick.f.id, id => {
        const e = L.getEntry(pick.e.id), f = e && e.files.find(x => x.id === id);
        if (!f || gone) return;
        const i = files.indexOf(pick);
        pick = { e, f };
        if (i >= 0) files[i] = pick;
        keep({ entry: e.id, file: id, from });
        load(from);
      });
    } }, 'Fix the notes');
    const fixLine = h('p', { class: 'small muted' }, 'Read by the app from a page, so a note may be wrong. ', fixBtn);
    const paintFix = () => { fixLine.hidden = !pick.f.name.endsWith(' (notes read).musicxml') || pick.f.kind !== 'musicxml'; };
    paintFix();
    select.addEventListener('change', paintFix);
    card.append(h('label', { class: 'stack small' }, 'Score', select), fixLine);
    const msg = h('p', { class: 'small', role: 'status' });
    card.append(msg);
    async function load(at) {
      const my = ++token;
      done(); msg.textContent = 'Reading the notes…';
      let mel = null;
      try {
        const got = await L.getFile(pick.f.id);
        if (!got) throw new Error('the file is not on this device');
        mel = await S.readScoreMelody(got.name, got.blob);
      } catch (e) { if (my === token) msg.textContent = 'Could not read this score: ' + (e && e.message ? e.message : 'unknown error'); return; }
      if (my !== token || gone) return;
      const per = saved().per, secs = S.sections(mel, per);
      if (!secs.length) { msg.textContent = 'There are no notes to read in this score.'; return; }
      msg.textContent = '';
      let idx = Math.max(0, Math.min(secs.length - 1, at || 0));
      fromSel.innerHTML = '';
      secs.forEach((x, i) => fromSel.append(h('option', { value: i, selected: i === idx ? true : null, text: barsLabel(x) })));
      fromSel.onchange = () => { keep({ from: +fromSel.value }); load(+fromSel.value); };
      const title = pick.e.title;
      const bpm = mel.bpm > 0 ? Math.round(mel.bpm) : 0;
      const own = {
        title,
        opts: h('div', { class: 'stack sr-opts' }, h('div', { class: 'row' }, perSeg, h('label', { class: 'row small' }, 'Start at', fromSel)), runKeep),
        make() {
          const x = secs[idx], label = barsLabel(x);
          idx = (idx + 1) % secs.length;
          return { piece: x.piece, label, of: title };
        },
        record(score) {
          // practising a Library piece counts for it in the daily plan, as its own page does
          if (hooks.signal) hooks.signal('piece:' + pick.e.id, { score });
        }
      };
      const olv = { id: 'own', tempo: [60, 200], range: bpm ? 'written at ' + bpm + ' bpm' : 'your tempo' };
      api = melodyMode(body, olv, ctx, own);
    }
    load(pick.f.id === want.file ? want.from || 0 : 0);
  })().catch(e => { console.error(e); status.textContent = 'Could not open your Library here.'; });
  return { redraw: () => { if (api && api.redraw) api.redraw(); }, cleanup: () => { gone = true; done(); } };
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
  return { el: h('div', { class: 'row sr-tempo' }, h('span', { class: 'eyebrow', text: 'Tempo' }), h('button', { class: 'btn small', 'aria-label': 'Slower', onclick: () => bump(-4) }, '−4'), lbl, h('button', { class: 'btn small', 'aria-label': 'Faster', onclick: () => bump(4) }, '+4'), h('span', { class: 'small muted', text: lv.range || 'level range ' + lv.tempo[0] + '–' + lv.tempo[1] })), paint, bump };
}

/* a short line per piece read in a run: "Rhythm 12 · 85%" */
function runLine(list, kind, cur, pct, ok) {
  list.hidden = false;
  list.append(h('li', { class: ok ? 'ok' : 'no' }, h('b', { text: cur.label ? cur.label : KIND_NAME[kind] + ' ' + (cur.entry ? cur.entry.no : '') }), ' ', pct == null ? '' : h('span', { class: 'mono', text: pct + '%' })));
}

function rhythmMode(root, lv, ctx) {
  const card = h('div', { class: 'card' }); root.append(card);
  const make = () => Lib.next(lv.id, 'r', () => rhythmPiece(lv, { bars: lenFor('r') }));
  let cur = make(), piece = cur.piece, staff = null, run = null, pad = null, showCounts = !!E.state.settings.readingCounts;
  const src = h('p', { class: 'small sr-src' });
  const lib = libraryPanel('r', lv, id => { stop(); cur = Lib.open(id); piece = cur.piece; result.innerHTML = ''; draw(); lib.toggle(); card.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
  const libBtn = libButton('r', lv, lib);
  let bpm = bpmFor(lv, 'r');
  const staffBox = h('div', { class: 'sr-staff' });
  const info = h('span', { class: 'small muted' });
  const phase = h('div', { class: 'phase', role: 'status' });
  const padBox = h('div', { class: 'sr-padbox' });
  const runList = h('ul', { class: 'sr-run', hidden: true, 'aria-label': 'Pieces read in this run' });
  const result = h('div', { class: 'stack' });
  const tempo = tempoControl(() => bpm, v => { bpm = v; saveBpm(lv, 'r', v); }, lv);
  const startBtn = h('button', { class: 'btn brass' }, 'Start: count-in, then tap');
  const hearBtn = h('button', { class: 'btn' }, '▶ Hear it');
  const newBtn = h('button', { class: 'btn ghost' }, 'Next rhythm');
  const stopBtn = h('button', { class: 'btn small', onclick: () => stop(true) }, '■ Stop');
  const runBar = h('div', { class: 'sr-runbar', hidden: true }, phase, stopBtn); // stays at the bottom of the screen while it runs
  padBox.append(runBar);
  const countBox = h('label', { class: 'check small' }, h('input', { type: 'checkbox', checked: showCounts ? true : null, onchange: e => { showCounts = e.target.checked; E.setSetting('readingCounts', showCounts); if (!run) draw(); } }), 'Show the counts');
  const opts = lengthControls('r', () => { if (!run && !cur.entry) newBtn.onclick(); });
  card.append(h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Read this rhythm' }), info), src, tempo.el, opts, countBox,
    h('div', { class: 'row' }, startBtn, hearBtn, newBtn, libBtn.el), staffBox, padBox, runList, result, lib.el);
  function draw() {
    staffBox.innerHTML = '';
    staff = renderStaff({ bars: piece.bars, key: 'C', time: piece.time, width: staffWidth(staffBox), repeat: piece.repeat, barsPerLine: piece.bars.length <= 2 ? 2 : undefined, lyrics: showCounts ? countLabels(piece) : null, label: 'A rhythm of ' + piece.bars.length + ' bars' });
    staffBox.append(staff.el);
    sourceLine(src, cur, 'r'); libBtn.paint();
    info.textContent = piece.time + ' · ' + (parseTime(piece.time).compound ? 'beat = dotted quarter' : 'beat = quarter');
    return staff;
  }
  let summary = null;
  function stop(byHand) {
    if (run) run.stop(); run = null;
    if (pad) { pad.cleanup(); pad.el.remove(); pad = null; } padBox.classList.remove('live'); runBar.hidden = true;
    ctx.setActive(false); startBtn.disabled = false; hearBtn.disabled = false; newBtn.disabled = false;
    const f = summary; summary = null;
    if (byHand && f) setTimeout(f, 320); // after the piece that just ended is scored
  }
  hearBtn.onclick = () => {
    stop(); draw(); ctx.setActive(true); hearBtn.disabled = true; runBar.hidden = false; padBox.classList.add('live');
    run = playRun({ first: { piece }, staff, bpm, countIn: true, click: true, notes: true, phase, onEnd: () => { run = null; stop(); } });
  };
  newBtn.onclick = () => { stop(); cur = make(); piece = cur.piece; result.innerHTML = ''; runList.innerHTML = ''; runList.hidden = true; draw(); };
  startBtn.onclick = () => {
    stop(); draw(); result.innerHTML = ''; runList.innerHTML = ''; runList.hidden = true;
    A.ensure(); ctx.setActive(true);
    startBtn.disabled = hearBtn.disabled = newBtn.disabled = true; runBar.hidden = false;
    const taps = [], scores = [];
    let lastRes = null;
    const lat = (E.state.settings.latencyMs || 0) / 1000;
    pad = TapPad(ev => taps.push(ev.micTime !== undefined ? ev.micTime : A.eventToAudioTime(ev) - lat), 'Tap the rhythm here (or space bar)', { mic: true });
    padBox.append(pad.el); padBox.classList.add('live');
    const chained = runOn();
    const score = seg => {
      const c = seg.item.cur, p = seg.piece, spq = seg.spq;
      const win = Math.max(0.05, Math.min(0.15, minGapQ(seg.expected) * spq * 0.45));
      const res = scoreTaps(seg.expected, taps, win);
      if (seg.staff) res.errs.forEach(x => markAttack(seg.staff, p, x.e, x.d !== null && Math.abs(x.d) <= Math.max(0.035, win * 0.55) ? 'good' : 'bad'));
      const ok = res.score >= 0.7;
      E.record(SKILL, 'L' + lv.id + ':rhythm', ok, { score: res.score });
      Lib.record(c, lv.id, 'r', res.score, bpm); libBtn.paint(); if (!lib.el.hidden) lib.draw();
      if (c === cur) sourceLine(src, cur, 'r');
      ctx.tick(1);
      scores.push(res.score); lastRes = { res, ok, c };
      if (chained) runLine(runList, 'r', c, Math.round(res.score * 100), ok);
    };
    summary = () => {
      summary = null;
      result.innerHTML = '';
      if (!lastRes) return;
      const { res, ok } = lastRes, avg = scores.reduce((a, x) => a + x, 0) / scores.length;
      result.append(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') },
        h('div', { class: 'spread' }, h('b', { text: scores.length > 1 ? scores.length + ' rhythms · average ' + Math.round(avg * 100) + '%' : 'Score ' + Math.round(res.score * 100) + '%' }), h('span', { class: 'mono small', text: (scores.length > 1 ? 'last one: ' : '') + Math.round(res.hitRate * 100) + '% of notes hit' + (res.extra ? ' · ' + res.extra + ' extra' : '') })),
        h('span', { text: describeOffset(res.mean * 1000) }),
        h('span', { class: 'small', text: 'Green notes landed on time; red ones were early, late or missed.' }),
        h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => startBtn.onclick() }, scores.length > 1 ? 'Read this one again' : 'Try again'),
          ok && avg >= 0.85 ? h('button', { class: 'btn small', onclick: () => { tempo.bump(4); toast('Up to ' + bpm + ' bpm'); newBtn.onclick(); } }, '+4 bpm, next rhythm') : '',
          starButton(lastRes.c),
          h('button', { class: 'btn primary small', onclick: () => newBtn.onclick() }, 'Next rhythm →'))));
    };
    run = playRun({
      first: { piece, cur }, staff, bpm, countIn: true, click: true, notes: false, phase,
      next: chained ? () => { const c = make(); return { piece: c.piece, cur: c }; } : null,
      show: item => { cur = item.cur; piece = item.piece; return draw(); },
      onPieceEnd: score,
      onEnd: () => { const f = summary; run = null; stop(); if (f) f(); }
    });
  };
  draw();
  return { redraw: () => { if (!run) draw(); }, cleanup: () => stop() };
}

/* ======================================================
   MELODY: read a melody at sight with a moving cursor
   ====================================================== */
/* a chart's chord symbols as the staff shows them (♯ and ♭) */
const prettyChord = t => t.replace(/^([A-G])#/, '$1♯').replace(/^([A-G])b/, '$1♭');
const chartChords = piece => (Array.isArray(piece.chords) ? piece.chords.map(cs => (cs || []).map(c => ({ text: prettyChord(c.text), at: c.at }))) : null);
/* tab under the staff on your tuning and capo: a fret for each note that is struck (not a tied continuation) */
function tabFor(piece) {
  const flat = piece.bars.flat(), struck = [];
  flat.forEach((n, i) => { const p = flat[i - 1]; if (n.midi != null && !(p && p.tie && p.midi === n.midi)) struck.push(i); });
  const frets = placeFrets(struck.map(i => flat[i].midi - 12), E.STRINGS.map(st => st.midi));
  const out = flat.map(() => null);
  struck.forEach((i, k) => { out[i] = frets[k]; });
  return out;
}
/* own: a score of yours instead of the level's melodies ({ make, title }, from scoresMode below): nothing goes
   into the reading library or the level's record, and the sections follow one another */
function melodyMode(root, lv, ctx, own) {
  const card = h('div', { class: 'card' }); root.append(card);
  const make = own ? own.make : () => Lib.next(lv.id, 'm', () => genMelody(lv, { bars: lenFor('m') }));
  const NEXT = own ? 'Next section' : 'Next melody';
  let cur = make(), piece = cur.piece, staff = null, run = null, bpm = bpmFor(lv, 'm'), marks = {};
  const src = h('p', { class: 'small sr-src' });
  const lib = own ? { el: '', toggle() {}, draw() {} } : libraryPanel('m', lv, id => { cur = Lib.open(id); piece = cur.piece; fresh(); lib.toggle(); card.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
  const libBtn = own ? { el: '', paint() {} } : libButton('m', lv, lib);
  const staffBox = h('div', { class: 'sr-staff' });
  const info = h('span', { class: 'small muted' });
  const phase = h('div', { class: 'phase', role: 'status' });
  const runList = h('ul', { class: 'sr-run', hidden: true, 'aria-label': 'Pieces read in this run' });
  const result = h('div', { class: 'stack' });
  const live = h('span', { class: 'mono small' });
  const tempo = tempoControl(() => bpm, v => { bpm = v; saveBpm(lv, 'm', v); }, lv);
  const startBtn = h('button', { class: 'btn brass' }, '▶ Start reading');
  const hearBtn = h('button', { class: 'btn' }, 'Hear it');
  const newBtn = h('button', { class: 'btn ghost' }, NEXT);
  const stopBtn = h('button', { class: 'btn small', onclick: () => stop(true) }, '■ Stop');
  const runBar = h('div', { class: 'sr-runbar live', hidden: true }, h('div', { class: 'stack' }, phase, live), stopBtn);
  let micNoteOff = null;
  const mic = MicToggle({ label: 'Check my playing', onLabel: 'Listening: notes and timing are checked', hint: 'Headphones help, so the mic hears your guitar and not the click.' });
  const opts = own ? own.opts : lengthControls('m', () => { if (!run && !cur.entry) newBtn.onclick(); });
  card.append(h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: own ? own.title : lv.chords ? 'Play these chords at sight' : 'Play this at sight' }), info), src, tempo.el, opts,
    h('div', { class: 'row' }, startBtn, hearBtn, newBtn, libBtn.el), mic.el, staffBox, runBar, runList, result, lib.el);
  function draw() {
    staffBox.innerHTML = '';
    staff = renderStaff({ bars: piece.bars, key: piece.key, time: piece.time, width: staffWidth(staffBox), chords: chartChords(piece), repeat: piece.repeat, tab: lv.tab ? tabFor(piece) : null, label: (own ? own.title + ', ' + cur.label : 'A melody of ' + piece.bars.length + ' bars') + ' in ' + keyName(piece.key) });
    staffBox.append(staff.el);
    attacks(piece).forEach(a => { if (marks[a.i]) markAttack(staff, piece, a, marks[a.i]); });
    info.textContent = keyName(piece.key) + ' · ' + piece.time + (lv.position ? ' · ' + POS_NAME(lv.position) + ' position' : '');
    if (own) { src.innerHTML = ''; src.append(h('span', { class: 'badge', text: 'Your score' }), ' ' + cur.label + ' of ' + cur.of); } else sourceLine(src, cur, 'm');
    libBtn.paint();
    return staff;
  }
  let onStop = null;
  function stop(byHand) {
    if (run) run.stop(); run = null;
    if (micNoteOff) micNoteOff(); micNoteOff = null;
    ctx.setActive(false); startBtn.disabled = hearBtn.disabled = newBtn.disabled = false; runBar.hidden = true;
    const f = onStop; onStop = null;
    if (byHand && f) setTimeout(f, 320); // after the piece that just ended is scored
  }
  function fresh() { stop(); marks = {}; result.innerHTML = ''; runList.innerHTML = ''; runList.hidden = true; live.textContent = ''; draw(); }
  hearBtn.onclick = () => {
    fresh(); ctx.setActive(true); hearBtn.disabled = true; runBar.hidden = false;
    run = playRun({ first: { piece }, staff, bpm, countIn: true, click: true, notes: true, phase, onEnd: () => { run = null; stop(); } });
    if (mic.on) Mic.muteUntil(A.now() + 0.2 + (parseTime(piece.time).barQ + playLength(piece)) * 60 / bpm / parseTime(piece.time).beatQ + 1.5);
  };
  newBtn.onclick = () => { cur = make(); piece = cur.piece; fresh(); };
  startBtn.onclick = () => {
    fresh(); A.ensure(); ctx.setActive(true);
    startBtn.disabled = hearBtn.disabled = newBtn.disabled = true; runBar.hidden = false;
    const listening = mic.on, chained = runOn();
    const read = []; // pieces read to the end: { seg, score }
    const exp = [];  // every expected attack so far, across the run
    const winOf = (seg, j) => { const ats = seg.ats; const gap = Math.min(j > 0 ? ats[j].q - ats[j - 1].q : 9, j + 1 < ats.length ? ats[j + 1].q - ats[j].q : 9); return Math.max(0.08, Math.min(0.25, gap * seg.spq * 0.5)); };
    let heardN = 0, goodN = 0;
    if (listening) {
      micNoteOff = Mic.on('note', ev => {
        if (!exp.length) return;
        const t = ev.t - Mic.latencyMs() / 1000;
        let best = null, bd = Infinity;
        for (let x = exp.length - 1; x >= 0 && x >= exp.length - 24; x--) { const d = t - exp[x].t; if (Math.abs(d) < Math.abs(bd)) { bd = d; best = exp[x]; } }
        if (!best) return;
        const seg = best.seg, j = best.j;
        seg.judged = seg.judged || new Map();
        if (seg.judged.has(j) || Math.abs(bd) > winOf(seg, j)) return;
        const a = seg.ats[j], got = Math.round(ev.midi), want = (a.chord || [a.midi]).map(m => m - 12);
        const pitch = a.slash ? 1 : want.includes(got) ? 1 : want.some(w => (got - w) % 12 === 0) ? 0.5 : 0; // a slash: any note of the strum counts
        seg.judged.set(j, { pitch, d: bd, got });
        const good = pitch === 1 && Math.abs(bd) <= winOf(seg, j) * 0.6;
        if (seg.staff === staff) { marks[a.i] = good ? 'good' : 'bad'; markAttack(staff, piece, a, marks[a.i]); }
        heardN++; if (good) goodN++;
        live.textContent = (a.slash ? 'Heard a strum' : 'Heard ' + noteLabel(ev.midi).split(' ')[0]) + (pitch === 1 ? ' ✓' : ' ✗ (wanted ' + soundName(want[want.length - 1]) + ')') + ' · ' + goodN + ' of ' + heardN + ' clean';
      });
    }
    const scoreMic = seg => {
      let sum = 0, right = 0, absD = 0, nD = 0;
      const judged = seg.judged || new Map();
      seg.ats.forEach((a, j) => {
        const r = judged.get(j);
        if (!r) { if (seg.staff) markAttack(seg.staff, seg.piece, a, 'bad'); if (seg.staff === staff) marks[a.i] = 'bad'; return; }
        const timing = Math.max(0, 1 - Math.abs(r.d) / winOf(seg, j));
        sum += r.pitch * (0.6 + 0.4 * timing);
        if (r.pitch === 1) right++;
        absD += Math.abs(r.d); nD++;
      });
      const score = seg.ats.length ? sum / seg.ats.length : 0, missed = seg.ats.length - judged.size;
      return { score, detail: right + ' of ' + seg.ats.length + ' right notes' + (missed ? ', ' + missed + ' not heard' : '') + (nD ? ' · timing ±' + Math.round(absD / nD * 1000) + ' ms' : '') + '.' };
    };
    const record = (seg, score) => {
      const c = seg.item.cur;
      if (own) { own.record(score); ctx.tick(1); return; }
      E.record(SKILL, 'L' + lv.id + ':melody', score >= 0.75, { score });
      Lib.record(c, lv.id, 'm', score, bpm); libBtn.paint(); if (!lib.el.hidden) lib.draw();
      if (c === cur) sourceLine(src, cur, 'm');
      ctx.tick(1);
    };
    const pieceEnd = seg => {
      if (!listening) { read.push({ seg }); if (chained) runLine(runList, 'm', seg.item.cur, null, true); return; }
      const r = scoreMic(seg);
      record(seg, r.score);
      read.push({ seg, score: r.score, detail: r.detail });
      if (chained) runLine(runList, 'm', seg.item.cur, Math.round(r.score * 100), r.score >= 0.75);
    };
    const finishAll = () => {
      if (micNoteOff) micNoteOff(); micNoteOff = null;
      if (!read.length) return;
      if (listening) {
        const avg = read.reduce((a, x) => a + x.score, 0) / read.length, last = read[read.length - 1];
        feedback(avg, read.length > 1 ? read.length + (own ? ' sections' : ' melodies') + ' · average ' + Math.round(avg * 100) + '%' : 'Score ' + Math.round(avg * 100) + '%', last.detail, last.score >= 0.9, last.seg.item.cur);
      } else askSelf();
    };
    function askSelf() {
      result.innerHTML = '';
      const n = read.length;
      const choose = (score, clean) => { read.forEach(x => record(x.seg, score)); feedback(score, null, null, clean, read[n - 1].seg.item.cur); };
      result.append(h('div', { class: 'stack' }, h('b', { text: n > 1 ? 'How did those ' + n + (own ? ' sections' : ' melodies') + ' go?' : 'How did that go?' }),
        h('div', { class: 'row' },
          h('button', { class: 'btn small', onclick: () => choose(1, true) }, 'Got it all'),
          h('button', { class: 'btn small', onclick: () => choose(0.7, false) }, 'Most of it'),
          h('button', { class: 'btn small', onclick: () => choose(0.35, false) }, 'Struggled')),
        h('div', { class: 'row' }, h('button', { class: 'btn ghost small', onclick: () => hearBtn.onclick() }, '▶ Hear ' + (n > 1 ? 'the last one' : 'it')), h('span', { class: 'small muted', text: 'Listen back and check yourself against it.' }))));
    }
    function feedback(score, title, detail, clean, c) {
      const ok = score >= 0.75;
      result.innerHTML = '';
      result.append(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') },
        h('b', { text: title || (ok ? 'Nice read.' : score >= 0.5 ? 'Good: read a new one at this tempo.' : 'Try it 8 bpm slower, and keep going through mistakes.') }),
        detail ? h('span', { class: 'small', text: detail }) : null,
        h('div', { class: 'row' },
          h('button', { class: 'btn small', onclick: () => startBtn.onclick() }, 'Again'),
          !listening ? null : h('button', { class: 'btn small', onclick: () => hearBtn.onclick() }, '▶ Hear it'),
          clean ? h('button', { class: 'btn brass small', onclick: () => { tempo.bump(4); toast('Up to ' + bpm + ' bpm'); newBtn.onclick(); } }, '+4 bpm') : '',
          !ok && score < 0.5 ? h('button', { class: 'btn small', onclick: () => { tempo.bump(-8); toast('Down to ' + bpm + ' bpm'); } }, '−8 bpm') : null,
          starButton(c),
          h('button', { class: 'btn primary small', onclick: () => newBtn.onclick() }, NEXT + ' →'))));
    }
    onStop = finishAll;
    run = playRun({
      first: { piece, cur }, staff, bpm, countIn: true, click: true, notes: false, phase,
      next: chained ? () => { const c = make(); return { piece: c.piece, cur: c }; } : null,
      show: item => { cur = item.cur; piece = item.piece; marks = {}; return draw(); },
      onExpected: (e, seg) => exp.push(Object.assign({ seg }, e)),
      onPieceEnd: pieceEnd,
      onEnd: () => setTimeout(() => { run = null; stop(); finishAll(); }, listening ? 300 : 0)
    });
  };
  draw();
  return { redraw: () => { if (!run) draw(); }, cleanup: () => { stop(); mic.cleanup(); } };
}
