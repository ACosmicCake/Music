/* World Woodshed — Note names: name notes and chords on the treble, bass and grand staff, at real pitch.
   Spaced by how well you know each one (skill `notenames`, items in src/content/notenames.js). */
import A from '../audio.js';
import E from '../engine.js';
import Mic from '../listen.js';
import { h, tool } from '../ui/core.js';
import { MicToggle, noteLabel } from '../ui/mic.js';
import { renderStaff } from '../notation.js';
import { LETTERS, LEVELS, STAVES, QUALITIES, INVERSIONS, poolFor, openLevel, noteCard, chordCard, qualitiesAt, nameOf } from '../content/notenames.js';
import './notenames.css';

const SKILL = 'notenames';
const ACC = { '-1': '♭', 0: '♮', 1: '♯' };
const KINDS = { notes: 'Notes', chords: 'Chords' };
const ANSWERS = { name: 'Name the chord', each: 'Name each note' };
const TIPS = {
  t: ['Lines, bottom to top: E G B D F (Every Good Boy Does Fine). Spaces: F A C E.', 'Middle C sits on one ledger line below the staff; the G clef curls round G above it, the second line.', 'Above the staff: G hangs on the top line, A sits on the first ledger line, C on the second.'],
  b: ['Lines, bottom to top: G B D F A (Good Boys Do Fine Always). Spaces: A C E G (All Cows Eat Grass).', 'The F clef’s two dots sit either side of the F line, the fourth line up: F below middle C.', 'Middle C sits on one ledger line above the bass staff, the same note as one ledger line below the treble.'],
  chords: ['A triad in root position is three notes on three lines or three spaces in a row: a stack of thirds.', 'Read the lowest note first, then the shape: in an inversion, a second (two notes side by side or a fourth gap) shows where the root is. The root is the upper note of the fourth.', 'Major and minor differ in the middle note: count the half steps from the root, 4 for major, 3 for minor.']
};
const prefs = () => Object.assign({ kind: 'notes', staff: 't', answer: 'name', levels: {} }, (E.state.settings || {}).staffNames || {});
const savePrefs = v => E.setSetting('staffNames', Object.assign(prefs(), v));
const seen = () => (E.skillState(SKILL) || {}).items || {};

tool('notenames', {
  tab: 'train', skill: SKILL, title: 'Note names', eyebrow: 'Reading · treble, bass and grand staff',
  desc: 'Name notes and chords on the treble staff, the bass clef and both together, from the lines and spaces out to ledger lines, sharps and flats.',
  render(body, ctx) {
    const p = ctx.params || {};
    let { kind, staff, answer } = prefs();
    if (KINDS[p.kind]) kind = p.kind;
    if (STAVES[p.staff]) staff = p.staff;
    const lvKey = () => kind + ':' + staff;
    let level = 1;
    const pickLevel = () => { const s = prefs().levels[lvKey()]; level = s >= 1 && s <= LEVELS.length ? s : openLevel(staff, kind, seen()); };
    pickLevel();

    const wrap = h('div', { class: 'stack nn-wrap' });
    const setup = h('div', { class: 'card stack nn-setup' });
    const quiz = h('div', { class: 'card nn-quiz' });
    const tipsBox = h('details', { class: 'card nn-tips' });
    wrap.append(setup, quiz, tipsBox);
    body.append(wrap);

    function seg(label, opts, cur, on, cls) {
      const s = h('div', { class: 'seg' + (cls ? ' ' + cls : ''), role: 'group', 'aria-label': label });
      Object.entries(opts).forEach(([k, t]) => s.append(h('button', { 'aria-pressed': String(k) === String(cur) ? 'true' : 'false', onclick: () => { if (String(k) !== String(cur)) on(k); } }, t)));
      return s;
    }
    function renderSetup() {
      setup.innerHTML = '';
      const open = openLevel(staff, kind, seen());
      const lv = LEVELS[level - 1];
      const levels = h('div', { class: 'seg nn-levels', role: 'group', 'aria-label': 'Level' }, LEVELS.map(L => h('button', {
        'aria-pressed': L.id === level ? 'true' : 'false', title: L.id > open ? 'Not open yet: you can still try it' : '',
        onclick: () => { if (L.id === level) return; level = L.id; const lvs = Object.assign({}, prefs().levels); lvs[lvKey()] = level; savePrefs({ levels: lvs }); renderSetup(); restart(); }
      }, h('b', { text: String(L.id) }), h('span', { text: L[kind] + (L.id > open ? ' 🔒' : '') }))));
      setup.append(
        seg('Notes or chords', KINDS, kind, k => { kind = k; savePrefs({ kind }); pickLevel(); renderSetup(); restart(); }, 'big'),
        h('div', { class: 'stack nn-row' }, h('span', { class: 'eyebrow', text: 'Staff' }),
          seg('Staff', { t: 'Treble', b: 'Bass', g: 'Both (grand staff)' }, staff, s => { staff = s; savePrefs({ staff }); pickLevel(); renderSetup(); restart(); })),
        kind === 'chords' ? h('div', { class: 'stack nn-row' }, h('span', { class: 'eyebrow', text: 'Answer' }),
          seg('Answer', ANSWERS, answer, a => { answer = a; savePrefs({ answer }); renderSetup(); restart(); })) : '',
        h('div', { class: 'stack nn-row' }, h('span', { class: 'eyebrow', text: 'Level' }), levels),
        h('p', { class: 'small', text: lv[kind + 'Goal'] }),
        level > open ? h('p', { class: 'small muted', text: 'Not open yet: level ' + (open + 1) + ' opens when you know most of level ' + open + ' here (80% tried, 75% right). You can try it now.' }) : '');
      tipsBox.innerHTML = '';
      const tips = (staff === 'g' ? TIPS.t.slice(0, 1).concat(TIPS.b.slice(0, 1), [TIPS.b[2]]) : TIPS[staff]).concat(kind === 'chords' ? TIPS.chords : []);
      tipsBox.append(h('summary', {}, h('b', { text: 'How to read them' })), h('ul', {}, tips.map(t => h('li', { class: 'small', text: t }))));
    }

    /* ---------- the quiz ---------- */
    let api = null;
    function restart() {
      if (api) api.cleanup();
      quiz.innerHTML = '';
      api = quizMode(quiz, { kind, staff, level, answer: kind === 'chords' ? answer : 'name' }, ctx);
    }
    renderSetup(); restart();
    let rsz = null, lastW = window.innerWidth;
    const onResize = () => { clearTimeout(rsz); rsz = setTimeout(() => { if (Math.abs(window.innerWidth - lastW) < 40) return; lastW = window.innerWidth; if (api) api.redraw(); }, 250); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(rsz); if (api) api.cleanup(); };
  }
});

/* one note or chord on one staff, or on the grand staff (treble over bass, joined by a brace) */
function drawCard(box, card, staff, kind) {
  box.innerHTML = '';
  const w = Math.min(Math.max(200, box.clientWidth || 300), 340);
  const one = (midis, clef, label) => {
    const n = midis.length ? { midi: midis[midis.length - 1], dur: 'w', spell: card.spell } : null;
    if (n && midis.length > 1) n.chord = midis.slice();
    return renderStaff({ bars: [n ? [n] : []], key: 'C', time: '4/4', showTime: false, endBar: 'none', width: w, scale: 1.45, clef, label });
  };
  const trebleM = kind === 'notes' ? (card.staff === 't' ? [card.midi] : []) : card.treble;
  const bassM = kind === 'notes' ? (card.staff === 'b' ? [card.midi] : []) : card.bass;
  const what = kind === 'notes' ? 'One note' : 'A chord';
  const out = [];
  if (staff === 'g') {
    const g = h('div', { class: 'nn-grand' });
    const top = one(trebleM, 'treble', what + ' on the treble staff of a grand staff'), bot = one(bassM, 'bass', 'The bass staff of the grand staff');
    g.append(top.el, bot.el);
    box.append(g);
    out.push(trebleM.length ? top : null, bassM.length ? bot : null);
    // line the two up when both have notes (accidentals in front of one push its head to the right)
    if (top.noteEls && bot.noteEls && top.noteEls[0] && bot.noteEls[0] && trebleM.length && bassM.length) {
      const dx = top.noteEls[0].getBoundingClientRect().left - bot.noteEls[0].getBoundingClientRect().left;
      if (Math.abs(dx) > 1) (dx > 0 ? bot : top).el.style.marginLeft = Math.abs(dx) + 'px';
    }
  } else {
    const st = one(staff === 'b' ? bassM : trebleM, staff === 'b' ? 'bass' : 'treble', what + ' on the ' + (staff === 'b' ? 'bass' : 'treble') + ' staff');
    box.append(st.el);
    out.push(st);
  }
  return out.filter(Boolean);
}

function quizMode(root, o, ctx) {
  const { kind, staff, level } = o;
  const each = kind === 'chords' && o.answer === 'each';
  const pool = poolFor(staff, kind, level);
  const usesAcc = level >= 3;
  const staffBox = h('div', { class: 'sr-staff sr-card nn-staff' });
  const tally = h('span', { class: 'mono small' });
  const prompt = h('span', { class: 'eyebrow' });
  let accSel = 0;
  const accSeg = h('div', { class: 'seg sr-acc', role: 'group', 'aria-label': 'Accidental' });
  const paintAcc = () => accSeg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.a === accSel ? 'true' : 'false'));
  [-1, 0, 1].forEach(a => accSeg.append(h('button', { 'data-a': a, 'aria-label': a === -1 ? 'flat' : a === 1 ? 'sharp' : 'natural', onclick: () => { accSel = a; paintAcc(); } }, ACC[a])));
  const letters = h('div', { class: 'sr-letters' }, LETTERS.map(l => h('button', { class: 'choice', 'data-l': l, onclick: () => onLetter(l) }, h('b', { text: l }))));
  const quals = qualitiesAt(level);
  const qualRow = h('div', { class: 'nn-quals', role: 'group', 'aria-label': 'Chord quality' }, quals.map(q => h('button', { class: 'choice', 'data-q': q, onclick: () => onQuality(q) }, h('b', { text: QUALITIES[q].sym || 'maj' }), h('span', { text: QUALITIES[q].name }))));
  const slots = h('div', { class: 'nn-slots', 'aria-live': 'polite' });
  const undo = h('button', { class: 'btn small', onclick: () => { if (answered || !got.length) return; got.pop(); paintSlots(); } }, '⌫ Undo');
  const fb = h('div', { class: 'feedback', hidden: true });
  let micOff = null;
  const mic = kind === 'notes' ? MicToggle({ label: 'Answer by playing it', onLabel: 'Listening: play the note',
    hint: 'Any octave counts: on the guitar, treble notes are played an octave lower than they sound here.',
    onOn: () => { micOff = Mic.on('note', onHeard); }, onOff: () => { if (micOff) micOff(); micOff = null; } }) : null;
  root.append(h('div', { class: 'spread' }, prompt, tally), staffBox,
    usesAcc ? h('div', { class: 'row' }, accSeg, h('span', { class: 'small muted', text: each || kind === 'notes' ? 'Pick ♯ or ♭ first if the note needs one.' : 'Pick ♯ or ♭ first if the root needs one.' })) : '',
    each ? h('div', { class: 'row nn-slotrow' }, slots, undo) : '',
    kind === 'chords' && !each ? h('span', { class: 'small muted', text: 'The root, then the quality.' }) : '',
    letters, kind === 'chords' && !each ? qualRow : '', mic ? mic.el : '', fb);
  paintAcc();

  let q = null, item = null, t0 = 0, answered = false, auto = null, right = 0, total = 0, rtSum = 0, staves = [];
  let root_ = null, qual = null, got = [];
  const want = () => (kind === 'notes' ? [q] : q.notes);
  function paintSlots() {
    slots.innerHTML = '';
    const n = want().length;
    for (let i = 0; i < n; i++) {
      const g = got[i];
      const cls = 'nn-slot' + (answered && g ? (g.L === want()[i].L && g.alter === want()[i].alter ? ' ok' : ' no') : '') + (!answered && i === got.length ? ' now' : '');
      slots.append(h('span', { class: cls, text: g ? nameOf(g.L, g.alter) : '·' }));
    }
  }
  function draw() {
    staves = drawCard(staffBox, q, staff, kind);
    if (answered) staves.forEach(st => st.mark(0, q.ok ? 'good' : 'bad'));
  }
  function next() {
    clearTimeout(auto);
    item = E.pick(SKILL, pool) || pool[0];
    q = kind === 'notes' ? noteCard(item.id) : chordCard(item.id, level);
    answered = false; accSel = 0; paintAcc(); root_ = null; qual = null; got = [];
    prompt.textContent = kind === 'notes' ? 'Name the note' : each ? 'Name each note, from the bottom up' : 'Name the chord';
    root.querySelectorAll('.choice').forEach(b => { b.disabled = false; b.classList.remove('correct', 'wrong', 'picked'); });
    fb.hidden = true;
    if (each) paintSlots();
    draw();
    t0 = performance.now();
  }
  const sounding = () => (kind === 'notes' ? [q.midi] : q.notes.map(n => n.midi));
  function hear(vel = 0.75) {
    A.ensure(); A.fresh();
    if (mic && mic.on) Mic.muteUntil(A.now() + 1.8);
    sounding().forEach((m, i) => A.note(m, A.now() + 0.02 + i * 0.035, vel, 1.6));
  }
  function finish(ok, msg, score) {
    answered = true; q.ok = ok;
    const rt = performance.now() - t0;
    E.record(SKILL, item.id, ok, { rt, score });
    ctx.tick(1);
    total++; if (ok) { right++; rtSum += rt; }
    tally.textContent = right + ' / ' + total + (right ? ' · ' + (rtSum / right / 1000).toFixed(1) + ' s avg' : '');
    root.querySelectorAll('.choice').forEach(b => { b.disabled = true; });
    if (kind === 'notes') letters.querySelector('[data-l="' + q.letter + '"]').classList.add('correct');
    else if (!each) {
      letters.querySelector('[data-l="' + q.root.name[0] + '"]').classList.add('correct');
      const qb = qualRow.querySelector('[data-q="' + q.q + '"]'); if (qb) qb.classList.add('correct');
    }
    if (each) paintSlots();
    draw();
    fb.hidden = false; fb.className = 'feedback ' + (ok ? 'ok' : 'no'); fb.innerHTML = '';
    if (kind === 'notes') fb.append(h('b', { text: (ok ? 'Correct: ' : 'It’s ') + q.full + (q.midi === 60 ? ', middle C.' : '.') }));
    else {
      fb.append(h('b', { text: (ok ? 'Correct: ' : 'It’s ') + q.symbol + ', ' + q.name + '.' }));
      fb.append(h('span', { class: 'small', text: 'Bottom up: ' + q.notes.map(n => n.name + n.octave).join(' ') + '.' }));
    }
    if (msg) fb.append(h('span', { text: msg }));
    fb.append(h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => hear(0.8) }, '▶ Hear it'), h('button', { class: 'btn primary small', onclick: next }, 'Next →')));
    if (!(mic && mic.on)) hear(0.7);
    if (ok) auto = setTimeout(next, mic && mic.on ? 1500 : kind === 'notes' ? 1300 : 1900);
  }
  function onLetter(l) {
    if (answered || !q) return;
    const L = LETTERS.indexOf(l), alter = accSel;
    if (kind === 'notes') {
      const ok = L === q.L && alter === q.alter;
      if (!ok) letters.querySelector('[data-l="' + l + '"]').classList.add('wrong');
      const msg = ok ? '' : L === q.L ? (q.alter ? 'Right letter: it needs the ' + (q.alter > 0 ? 'sharp.' : 'flat.') : 'Right letter, but this one is natural.') : 'You chose ' + nameOf(L, alter) + '.';
      finish(ok, msg);
      return;
    }
    if (each) {
      got.push({ L, alter });
      accSel = 0; paintAcc();
      paintSlots();
      if (got.length === q.notes.length) {
        const good = got.filter((g, i) => g.L === q.notes[i].L && g.alter === q.notes[i].alter).length;
        const ok = good === got.length;
        finish(ok, ok ? '' : good + ' of ' + got.length + ' right.', good / got.length);
      }
      return;
    }
    root_ = { L, alter };
    letters.querySelectorAll('.choice').forEach(b => b.classList.toggle('picked', b.dataset.l === l));
    if (qual) submitChord();
  }
  function onQuality(qq) {
    if (answered || !q) return;
    qual = qq;
    qualRow.querySelectorAll('.choice').forEach(b => b.classList.toggle('picked', b.dataset.q === qq));
    if (root_) submitChord();
  }
  function submitChord() {
    const rootOk = root_.L === q.root.L && root_.alter === q.root.alter, qOk = qual === q.q;
    const ok = rootOk && qOk;
    if (!rootOk) letters.querySelector('[data-l="' + LETTERS[root_.L] + '"]').classList.add('wrong');
    if (!qOk) qualRow.querySelector('[data-q="' + qual + '"]').classList.add('wrong');
    root.querySelectorAll('.picked').forEach(b => b.classList.remove('picked'));
    const said = nameOf(root_.L, root_.alter) + QUALITIES[qual].sym;
    let msg = '';
    if (!ok) msg = 'You said ' + said + '. ' + (rootOk ? 'Right root; listen to the quality: count the half steps above it.' : qOk ? 'Right quality, wrong root' + (q.inv ? ': in ' + INVERSIONS[q.inv] + ' the root is not the lowest note.' : '.') : '');
    finish(ok, msg.trim(), (rootOk ? 0.5 : 0) + (qOk ? 0.5 : 0));
  }
  function onHeard(ev) {
    if (answered || !q || kind !== 'notes' || performance.now() - t0 < 350) return;
    const m = Math.round(ev.midi);
    if (((m - q.midi) % 12 + 12) % 12 === 0) finish(true, 'Heard ' + noteLabel(m).split(' ')[0] + '.');
    else finish(false, 'Heard ' + noteLabel(m).split(' ')[0] + '.');
  }
  function onKey(e) {
    if (e.target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
    const k = e.key;
    if (!answered && /^[a-gA-G]$/.test(k)) { e.preventDefault(); onLetter(k.toUpperCase()); }
    else if (!answered && (k === '#' || k === '+')) { accSel = 1; paintAcc(); }
    else if (!answered && k === '-') { accSel = -1; paintAcc(); }
    else if (!answered && k === '=') { accSel = 0; paintAcc(); }
    else if (!answered && each && k === 'Backspace') { e.preventDefault(); undo.click(); }
    else if (!answered && kind === 'chords' && !each && /^[1-8]$/.test(k) && quals[+k - 1]) onQuality(quals[+k - 1]);
    else if (answered && (k === 'Enter' || k === ' ') && e.target.tagName !== 'BUTTON') { e.preventDefault(); next(); }
  }
  document.addEventListener('keydown', onKey);
  next();
  return {
    redraw: () => q && draw(),
    cleanup() { clearTimeout(auto); document.removeEventListener('keydown', onKey); if (micOff) micOff(); if (mic) mic.cleanup(); }
  };
}
