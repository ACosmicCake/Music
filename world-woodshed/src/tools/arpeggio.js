import A from '../audio.js';
import E from '../engine.js';
import { h, toast, tool, Fretboard, hooks } from '../ui/core.js';
import { spell, keyPrefersFlats, prettySym, parseChord, QUAL } from '../theory.js';
import { guitarMidis } from '../voicings.js';
import { parseChart } from '../mytunes.js';
import Mic from '../listen.js';
import { MicToggle, TimingMeter, noteLabel } from '../ui/mic.js';
import { keepAwake } from '../native.js';
import { selectEl, keyChips } from './practice.js';
import { ARP_ORDER, ARP_PATTERNS, arpOf, toneLabel, windowNotes, arpPositions, arpSeq, PROGRESSIONS, progOf, progChords, bestPosition, changesLine } from '../arpeggios.js';

/* ======================================================
   ARPEGGIOS: the Arpeggio warm-up (one arpeggio in one position, like the Scale warm-up, and the smart plan's
   arp: items) and Arpeggio changes (a new chord every 1, 2 or 4 bars from a progression or your own chords,
   the hand staying in one position). Note choice and patterns are src/arpeggios.js.
   ====================================================== */

const strings = () => E.STRINGS.map(x => x.midi);
const SUBS = ['', 'beat', 'half beat', 'triplet', 'sixteenth'];
const subSel = (id, v, on) => selectEl(id, 'Notes per beat', [1, 2, 3, 4].map(x => ({ value: String(x), text: ['1 (quarters)', '2 (eighths)', '3 (triplets)', '4 (sixteenths)'][x - 1] })), String(v), x => on(+x));
const arpOptions = () => [1, 2, 3, 4, 5].map(t => ({ group: ['Triads', 'More triads', 'Sevenths', 'Half-diminished, diminished and sixths', 'Ninths and altered'][t - 1], items: ARP_ORDER.map(arpOf).filter(c => c.tier === t).map(c => ({ value: c.id, text: c.name })) })).filter(g => g.items.length);
/* Which arpeggios "Go through them all" visits */
const SETS = { off: 'Stay on this one', triads: 'Every triad', sevenths: 'Every 7th chord', all: 'Every arpeggio' };
const inSet = (set, c) => set === 'triads' ? c.iv.length === 3 : set === 'sevenths' ? c.iv.length === 4 : true;
const checkbox = (on, label, onchange) => h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: on ? true : null, onchange: e => onchange(e.target.checked) }), label);
function everySel(label, opts, v, on, unit) {
  const sel = h('select', { 'aria-label': label });
  opts.forEach(x => sel.append(h('option', { value: String(x), selected: x === v ? true : null, text: x + ' ' + unit + (x === 1 ? '' : 's') })));
  sel.onchange = () => on(+sel.value);
  return sel;
}

/* The mic check both tools share: each note heard is matched to the note due nearest that moment */
function micCheck(getLoop, getStep, steps, report) {
  let hits = 0, tries = 0, off = null;
  const heardLbl = h('span', { class: 'mono small' });
  const meter = TimingMeter(() => (getLoop() && getStep() ? { start: getStep().t, step: getStep().sd } : null), { idle: 'Press Start and play along.' });
  const box = h('div', { class: 'stack', hidden: true }, h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Right notes' }), heardLbl), meter.el);
  const paint = last => { heardLbl.textContent = (tries ? hits + ' of ' + tries + ' (' + Math.round(100 * hits / tries) + '%)' : '—') + (last ? ' · last: ' + last : ''); };
  const mic = MicToggle({ label: 'Check my notes and timing', onLabel: 'Listening to you play', hint: 'Headphones help: the mic should hear your guitar, not the click.',
    onOn: () => {
      box.hidden = false; hits = tries = 0; paint(); meter.reset(); meter.start('note');
      off = Mic.on('note', ev => {
        if (!getLoop() || !steps.length) return;
        const t = ev.t - Mic.latencyMs() / 1000;
        let near = steps[0];
        steps.forEach(x => { if (Math.abs(x.t - t) < Math.abs(near.t - t)) near = x; });
        if (Math.abs(near.t - t) > near.sd * 0.6 || near.m === null) return;
        const got = Math.round(ev.midi), ok = got === near.m;
        tries++; if (ok) hits++;
        if (report) report({ micAcc: hits / tries, micN: tries });
        paint(noteLabel(ev.midi) + (ok ? ' ✓' : ' ✗ (wanted ' + noteLabel(near.m).split(' ')[0] + ')'));
      });
    },
    onOff: () => { box.hidden = true; meter.stop(); if (off) off(); off = null; } });
  return { mic, box, stop: () => { meter.stop(); mic.cleanup(); } };
}
/* One bar of count-in, shown in `now` */
function countIn(now, bpm, timers) {
  const beat = 60 / bpm, t0 = A.now() + 0.1;
  for (let k = 0; k < 4; k++) {
    A.hit(k === 0 ? 'clickHi' : 'click', t0 + k * beat, 1);
    timers.push(setTimeout(() => { now.textContent = (k + 1) + '…'; }, Math.max(0, (t0 + k * beat - A.now() + A.latency()) * 1000)));
  }
  return t0 + 4 * beat;
}

/* ---------- Arpeggio warm-up ---------- */
tool('arpwarm', {
  tab: 'play', skill: 'technique', title: 'Arpeggio warm-up', eyebrow: 'Warm-up · arpeggios with the click',
  desc: 'Every arpeggio from triads to 9ths in one position, with the click and a pattern. It can go through them all and up the neck for you.',
  render(body, ctx) {
    const p = ctx.params || {};
    const saved = E.state.settings.arp || {};
    const st = {
      chord: p.chord || saved.chord || 'maj7', root: p.root ?? saved.root ?? 7, pattern: p.pattern || saved.pattern || 'updown',
      sub: saved.sub || 2, guide: saved.guide !== false, climb: saved.climb !== false, start: null,
      autoPos: p.autoPos ?? saved.autoPos ?? false, posEvery: saved.posEvery || 2,
      // a session block stays on its arpeggio, so it can be graded
      set: p.smart ? 'off' : saved.set || 'off', setEvery: saved.setEvery || 2
    };
    const bpmKey = () => st.chord + ':' + st.pattern;
    const bpms = E.state.settings.arpBpm || {};
    let bpm = p.smart ? p.bpm : p.bpm && !bpms[bpmKey()] ? p.bpm : (bpms[bpmKey()] || p.bpm || 72);
    if (Number.isInteger(p.start)) st.start = Math.min(8, Math.max(0, p.start));
    const sig = { clean: 0, notClean: 0 };
    const report = extra => { Object.assign(sig, extra || {}, { bpm }); if (hooks.signal) hooks.signal('arp:' + st.chord, sig); };
    let loop = null, seq = [], notes = [], rounds = 0;
    const card = h('div', { class: 'card' }), ctl = h('div', { class: 'card' });
    body.append(card, ctl);
    const now = h('div', { class: 'big-number mono warm-note', text: '—' });
    const bpmLbl = h('div', { class: 'big-number mono', text: bpm });
    const title = h('h2', { class: 'arp-title' });
    const info = h('p', { class: 'small muted' });
    const fb = Fretboard({ onTap: (si, f) => A.note(E.STRINGS[si].midi + f, A.now() + 0.01, 0.8, 1.2) });
    const playBtn = h('button', { class: 'btn primary' }, '▶ Start');
    const roundLbl = h('span', { class: 'small muted mono' });
    const flats = () => keyPrefersFlats(st.root, arpOf(st.chord).iv[1] === 3);
    const chordName = () => spell(st.root, flats()) + ' ' + arpOf(st.chord).name.toLowerCase();
    card.append(
      title,
      h('div', { class: 'spread' }, h('div', { class: 'stack', style: { gap: '0' } }, h('span', { class: 'eyebrow', text: 'Now' }), now),
        h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => setBpm(bpm - 4) }, '−4'), h('div', { class: 'stack', style: { gap: '0', justifyItems: 'center' } }, h('span', { class: 'eyebrow', text: 'bpm' }), bpmLbl), h('button', { class: 'btn small', onclick: () => setBpm(bpm + 4) }, '+4'))),
      fb.el, info,
      h('div', { class: 'row' }, playBtn,
        h('button', { class: 'btn brass', onclick: () => { saveBest(); setBpm(bpm + 4); sig.clean++; report(); toast('Clean. Up to ' + bpm + ' bpm'); } }, 'Clean ✓ +4'),
        h('button', { class: 'btn', onclick: () => { setBpm(bpm - 6); sig.notClean++; report(); toast('Back to ' + bpm + ' bpm. Rebuild it clean.'); } }, 'Not clean'),
        h('button', { class: 'btn ghost small', onclick: () => { A.ensure(); A.fresh(); const c = arpOf(st.chord); A.strum(guitarMidis(st.root, c.iv), A.now() + 0.03, 0.6, 0.025, 1.8); } }, 'Hear the chord'), roundLbl));

    const steps = [];
    let lastStep = null;
    const check = micCheck(() => loop, () => lastStep, steps, report);
    card.append(check.mic.el, check.box);

    function persist() { E.setSetting('arp', { chord: st.chord, root: st.root, pattern: st.pattern, sub: st.sub, guide: st.guide, climb: st.climb, autoPos: st.autoPos, posEvery: st.posEvery, set: p.smart ? saved.set || 'off' : st.set, setEvery: st.setEvery }); }
    function setBpm(v) {
      bpm = Math.max(30, Math.min(260, Math.round(v)));
      bpmLbl.textContent = bpm;
      const all = Object.assign({}, E.state.settings.arpBpm || {}); all[bpmKey()] = bpm; E.setSetting('arpBpm', all);
      if (loop) { stop(); start(); }
    }
    function saveBest() {
      const best = Object.assign({}, E.state.settings.arpBest || {});
      best[bpmKey()] = Math.max(best[bpmKey()] || 0, bpm); E.setSetting('arpBest', best);
    }
    function defaultStart() { const f = ((st.root - strings()[0]) % 12 + 12) % 12; return Math.max(0, f === 0 ? 0 : f - 1); }
    const make = () => { notes = windowNotes(arpOf(st.chord).iv, st.root, st.start, strings()); seq = arpSeq(notes, st.pattern); };
    const marks = (rn, on) => rn.map(x => ({ s: x.s, f: x.f, kind: x === on ? 'good' : x.iv === 0 ? 'root' : 'tone', label: toneLabel(x.iv, st.chord) }));
    function build() {
      if (st.start === null) st.start = defaultStart();
      make();
      const c = arpOf(st.chord);
      title.textContent = chordName();
      fb.mark(marks(notes));
      const ps = arpPositions(st.root, strings()), pi = ps.indexOf(st.start);
      const tones = c.iv.map(x => spell(st.root + x, flats()) + ' (' + toneLabel(x, c.id) + ')').join(', ');
      info.textContent = tones + ' · frets ' + st.start + '–' + (st.start + 4) + (pi >= 0 ? ' (position ' + (pi + 1) + ' of ' + ps.length + ')' : '') + ' · ' + ARP_PATTERNS[st.pattern].toLowerCase() + ' · ' + seq.length + ' notes per round, root to root. ' +
        'Gold = root. Play one note per ' + SUBS[st.sub] + '.' + (st.autoPos ? ' The position moves every ' + st.posEvery + ' round' + (st.posEvery > 1 ? 's' : '') + '.' : '') +
        (st.set !== 'off' ? ' A new arpeggio every ' + st.setEvery + ' round' + (st.setEvery > 1 ? 's' : '') + ' (' + SETS[st.set].toLowerCase() + ').' : '');
      if (!notes.length || notes.length < 3) info.textContent += ' Few of its notes fall in these frets: try another position.';
      const best = (E.state.settings.arpBest || {})[bpmKey()];
      roundLbl.textContent = best ? 'Best clean: ' + best + ' bpm' : '';
      renderCtl();
    }
    let timers = [], loops = [], posDir = 1;
    function start() {
      A.ensure(); rounds = 0; steps.length = 0; lastStep = null; posDir = 1;
      playRound(countIn(now, bpm, timers));
      keepAwake(true, 'arpwarm');
      playBtn.textContent = '■ Stop'; ctx.setActive(true);
    }
    function playRound(at) {
      const rs = seq, rn = notes, len = rs.length, n = Math.max(st.sub, Math.ceil(len / st.sub) * st.sub), sd = 60 / bpm / st.sub;
      const round = rounds, name = chordName(), label = st.autoPos ? 'frets ' + st.start + '–' + (st.start + 4) : '';
      const lp = A.Loop({
        steps: n, maxSteps: n, stepDur: () => sd,
        onStep: (i, t) => {
          if (i % st.sub === 0) A.hit(i === 0 ? 'clickHi' : 'click', t, 0.8);
          if (i < len && st.guide && !check.mic.on) A.note(rs[i].m, t, 0.32, 0.25);
          lastStep = { t, i, sd, m: i < len ? rs[i].m : null }; steps.push(lastStep); if (steps.length > 16) steps.shift();
          if (i === n - 1 && loop === lp) nextRound(t + sd);
        },
        onVisual: i => {
          if (i < len) { fb.mark(marks(rn, rs[i])); now.textContent = spell(rs[i].p, flats()); }
          if (i === 0) { title.textContent = name; bpmLbl.textContent = Math.round(60 / sd / st.sub); roundLbl.textContent = 'Round ' + (round + 1) + (label ? ' · ' + label : ''); }
        }
      });
      loop = lp; loops.push(lp); if (loops.length > 3) loops.shift();
      lp.start(at);
    }
    function nextRound(at) {
      rounds++;
      if (st.climb && rounds % 2 === 0) bpm = Math.min(260, bpm + 2);
      let changed = false;
      if (st.set !== 'off' && rounds % st.setEvery === 0) {
        // the next arpeggio in the set, same key
        const list = ARP_ORDER.filter(id => inSet(st.set, arpOf(id)));
        st.chord = list[(list.indexOf(st.chord) + 1) % list.length] || list[0];
        changed = true;
      }
      if (st.autoPos && rounds % st.posEvery === 0) {
        const ps = arpPositions(st.root, strings()), i = ps.indexOf(st.start);
        if (i < 0) st.start = ps[0];
        else { if (i + posDir < 0 || i + posDir >= ps.length) posDir = -posDir; st.start = ps[Math.max(0, Math.min(ps.length - 1, i + posDir))]; }
        changed = true;
      }
      if (changed) make();
      playRound(at);
    }
    function stop() { keepAwake(false, 'arpwarm'); timers.forEach(clearTimeout); timers = []; loops.forEach(l => l.stop()); loops = []; loop = null; playBtn.textContent = '▶ Start'; ctx.setActive(false); now.textContent = '—'; build(); }
    playBtn.onclick = () => (loop ? stop() : start());
    const rebuild = () => { persist(); const was = !!loop; if (loop) { loops.forEach(l => l.stop()); loops = []; loop = null; } build(); if (was) start(); };

    function renderCtl() {
      ctl.innerHTML = '';
      const tempoFor = () => { bpm = (E.state.settings.arpBpm || {})[bpmKey()] || bpm; bpmLbl.textContent = bpm; };
      ctl.append(h('h3', { text: 'Set up' }),
        h('div', { class: 'formgrid' },
          selectEl('arp-chord', 'Arpeggio', arpOptions(), st.chord, v => { st.chord = v; tempoFor(); rebuild(); }),
          selectEl('arp-pattern', 'Pattern', Object.entries(ARP_PATTERNS).map(([k, v]) => ({ value: k, text: v })), st.pattern, v => { st.pattern = v; tempoFor(); rebuild(); }),
          subSel('arp-sub', st.sub, v => { st.sub = v; rebuild(); }),
          selectEl('arp-pos', 'Position', Array.from({ length: 9 }, (_, i) => ({ value: String(i), text: 'Frets ' + i + '–' + (i + 4) })), String(st.start), v => { st.start = +v; rebuild(); })),
        h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Root' }), keyChips(st.root, i => { st.root = i; st.start = null; rebuild(); })),
        h('div', { class: 'row' },
          checkbox(st.guide, 'Play the notes with me', v => { st.guide = v; persist(); }),
          checkbox(st.climb, 'Speed up 2 bpm every 2 rounds', v => { st.climb = v; persist(); })),
        h('div', { class: 'row' },
          checkbox(st.autoPos, 'Move up the neck to a new position every', v => { st.autoPos = v; persist(); build(); }),
          everySel('Rounds per position', [1, 2, 4], st.posEvery, v => { st.posEvery = v; persist(); build(); }, 'round')),
        p.smart ? h('p', { class: 'small muted', text: 'The smart plan chose this arpeggio, so it stays on it to see how it goes. Open Arpeggio warm-up from Train to go through them all.' })
          : h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Go through them all' }),
            h('div', { class: 'row' },
              (() => { const sel = h('select', { 'aria-label': 'Which arpeggios to go through' }); Object.entries(SETS).forEach(([k, v]) => sel.append(h('option', { value: k, selected: k === st.set ? true : null, text: v }))); sel.onchange = () => { st.set = sel.value; if (st.set !== 'off' && !inSet(st.set, arpOf(st.chord))) { st.chord = ARP_ORDER.find(id => inSet(st.set, arpOf(id))); } rebuild(); }; return sel; })(),
              h('span', { class: 'small muted', text: 'a new one every' }),
              everySel('Rounds per arpeggio', [1, 2, 4], st.setEvery, v => { st.setEvery = v; persist(); build(); }, 'round'))),
        h('p', { class: 'small muted', text: 'Positions follow the root on the 6th, 5th and 4th strings. Each round starts and ends on the root; say the chord tone (R, 3, 5, 7) as you play it.' }));
    }
    build();
    return () => { keepAwake(false, 'arpwarm'); timers.forEach(clearTimeout); loops.forEach(l => l.stop()); loop = null; check.stop(); };
  }
});

/* ---------- Arpeggio changes ---------- */
const ivOfType = type => (QUAL.find(([k]) => k === type) || QUAL[QUAL.length - 1])[1];
/* Your own chords, typed: one chord per change, split by spaces or bars. → { chords: [{ root, type, sym }], errors } */
export function ownChords(text) {
  const { bars, errors } = parseChart(text);
  const chords = bars.flatMap(b => b.split(' ').filter(Boolean)).map(sym => { const c = parseChord(sym); return { root: c.root, type: sym.replace(/^[A-G][#b]?/, ''), sym }; });
  return { chords: chords.slice(0, 32), errors };
}

tool('arpchanges', {
  tab: 'play', skill: 'technique', title: 'Arpeggio changes', eyebrow: 'Arpeggios · through the changes',
  desc: 'A new arpeggio every 1, 2 or 4 bars, through a ii–V–I, a blues or your own chords, without moving your hand.',
  render(body, ctx) {
    const saved = E.state.settings.arpChanges || {};
    const st = {
      src: saved.src || 'prog', prog: saved.prog || 'iiVI', key: saved.key ?? 0, own: saved.own || 'Dm7 G7 Cmaj7 A7',
      bars: saved.bars || 1, sub: saved.sub || 2, mode: saved.mode || 'nearest', pos: saved.pos ?? 'auto',
      guide: saved.guide !== false, comp: saved.comp !== false, climb: !!saved.climb, bpm: saved.bpm || 80
    };
    let bpm = st.bpm;
    let chords = [], wins = [], line = [], start = 0, errors = [];
    const persist = () => E.setSetting('arpChanges', Object.assign({}, st, { bpm }));
    const card = h('div', { class: 'card' }), ctl = h('div', { class: 'card' });
    body.append(card, ctl);
    const nowChord = h('div', { class: 'big-number arp-chord', text: '—' });
    const nextLbl = h('div', { class: 'small muted arp-next' });
    const now = h('div', { class: 'big-number mono warm-note', text: '—' });
    const bpmLbl = h('div', { class: 'big-number mono', text: bpm });
    const strip = h('div', { class: 'chips arp-strip' });
    const info = h('p', { class: 'small muted' });
    const err = h('p', { class: 'small bad', hidden: true });
    const fb = Fretboard({ onTap: (si, f) => A.note(E.STRINGS[si].midi + f, A.now() + 0.01, 0.8, 1.2) });
    const playBtn = h('button', { class: 'btn primary' }, '▶ Start');
    const passLbl = h('span', { class: 'small muted mono' });
    card.append(
      h('div', { class: 'spread' },
        h('div', { class: 'stack', style: { gap: '0' } }, h('span', { class: 'eyebrow', text: 'Chord' }), nowChord, nextLbl),
        h('div', { class: 'stack', style: { gap: '0', justifyItems: 'end' } }, h('span', { class: 'eyebrow', text: 'Note' }), now)),
      strip, fb.el, info, err,
      h('div', { class: 'row' }, playBtn,
        h('button', { class: 'btn small', onclick: () => setBpm(bpm - 4) }, '−4'),
        h('div', { class: 'stack', style: { gap: '0', justifyItems: 'center' } }, h('span', { class: 'eyebrow', text: 'bpm' }), bpmLbl),
        h('button', { class: 'btn small', onclick: () => setBpm(bpm + 4) }, '+4'), passLbl));

    const steps = [];
    let loop = null, lastStep = null;
    const check = micCheck(() => loop, () => lastStep, steps, null);
    card.append(check.mic.el, check.box);

    const flats = () => st.src === 'prog' ? keyPrefersFlats(st.key, !!progOf(st.prog).minor) : true;
    const symOf = c => c.sym ? prettySym(c.sym) : prettySym(spell(c.root, flats()) + c.type);
    const marks = (W, on, c) => W.map(x => ({ s: x.s, f: x.f, kind: x === on ? 'good' : x.iv === 0 ? 'root' : 'tone', label: toneLabel(x.iv, c && c.type === 'dim7' ? 'dim7' : '') }));
    const perChord = () => st.bars * 4 * st.sub;
    function setBpm(v) {
      bpm = Math.max(30, Math.min(260, Math.round(v))); bpmLbl.textContent = bpm; persist();
      if (loop) { stop(); begin(); }
    }
    function build() {
      if (st.src === 'prog') { chords = progChords(progOf(st.prog), st.key); errors = []; }
      else { const r = ownChords(st.own); chords = r.chords; errors = r.errors; }
      err.hidden = !errors.length; err.textContent = errors.slice(0, 3).join(' ');
      const S = strings();
      start = st.pos === 'auto' ? bestPosition(chords.length ? chords : [{ root: st.key, type: '' }], ivOfType, st.src === 'prog' ? st.key : (chords[0] || { root: 0 }).root, S) : +st.pos;
      wins = chords.map(c => windowNotes(ivOfType(c.type), c.root, start, S, false));
      line = changesLine(wins, perChord(), st.mode);
      strip.innerHTML = '';
      chords.forEach((c, i) => strip.append(h('span', { class: 'chip', 'aria-pressed': 'false', 'data-i': String(i), text: symOf(c) })));
      showChord(0, null);
      info.textContent = chords.length
        ? 'Frets ' + start + '–' + (start + 4) + (st.pos === 'auto' ? ' (chosen so every chord has notes here)' : '') + ' · a new chord every ' + (st.bars === 1 ? 'bar' : st.bars + ' bars') + ' · one note per ' + SUBS[st.sub] + '. ' +
          (st.mode === 'nearest' ? 'At each change, go to the new chord’s nearest note and keep going the same way.' : 'Start each chord on its root.') + ' Gold = root.'
        : '';
      renderCtl();
    }
    function showChord(i, on) {
      const c = chords[i]; if (!c) { nowChord.textContent = '—'; nextLbl.textContent = ''; fb.mark([]); return; }
      nowChord.textContent = symOf(c);
      nextLbl.textContent = chords.length > 1 ? 'Next: ' + symOf(chords[(i + 1) % chords.length]) : '';
      fb.mark(marks(wins[i], on, c));
      [...strip.children].forEach((x, k) => x.setAttribute('aria-pressed', k === i ? 'true' : 'false'));
    }
    let timers = [], loops = [], passes = 0;
    function begin() {
      if (!chords.length) { toast('Pick a progression or type some chords first.'); return; }
      A.ensure(); passes = 0; steps.length = 0; lastStep = null;
      playPass(countIn(now, bpm, timers));
      keepAwake(true, 'arpchanges');
      playBtn.textContent = '■ Stop'; ctx.setActive(true);
    }
    // One time through the chords; its last step schedules the next pass on time
    function playPass(at) {
      const L = line, C = chords, W = wins, per = perChord(), n = C.length * per, sd = 60 / bpm / st.sub, sub = st.sub, pass = passes;
      const comps = C.map(c => guitarMidis(c.root, ivOfType(c.type)));
      const lp = A.Loop({
        steps: n, maxSteps: n, stepDur: () => sd,
        onStep: (i, t) => {
          const ci = Math.floor(i / per), k = i % per, note = L[ci] && L[ci][k];
          if (i % sub === 0) A.hit(i % (4 * sub) === 0 ? 'clickHi' : 'click', t, 0.8);
          const quiet = check.mic.on;
          if (st.comp && !quiet && k % (4 * sub) === 0) A.strum(comps[ci], t, 0.22, 0.02, 60 / bpm * 3.6);
          if (note && st.guide && !quiet) A.note(note.m, t, 0.3, 0.25);
          lastStep = { t, i, sd, m: note ? note.m : null }; steps.push(lastStep); if (steps.length > 16) steps.shift();
          if (i === n - 1 && loop === lp) { passes++; if (st.climb) bpm = Math.min(260, bpm + 2); playPass(t + sd); }
        },
        onVisual: i => {
          const ci = Math.floor(i / per), k = i % per, note = L[ci] && L[ci][k];
          if (k === 0 || !note) showChord(ci, note); else fb.mark(marks(W[ci], note, C[ci]));
          if (note) now.textContent = spell(note.p, flats());
          // on the last beat of a chord, light up where the next one goes
          if (C.length > 1 && k === per - sub) nextLbl.textContent = 'Next: ' + symOf(C[(ci + 1) % C.length]) + ' →';
          if (i === 0) { bpmLbl.textContent = Math.round(60 / sd / sub); passLbl.textContent = 'Time through ' + (pass + 1); }
        }
      });
      loop = lp; loops.push(lp); if (loops.length > 3) loops.shift();
      lp.start(at);
    }
    function stop() { keepAwake(false, 'arpchanges'); timers.forEach(clearTimeout); timers = []; loops.forEach(l => l.stop()); loops = []; loop = null; playBtn.textContent = '▶ Start'; ctx.setActive(false); now.textContent = '—'; build(); }
    playBtn.onclick = () => (loop ? stop() : begin());
    const rebuild = () => { persist(); const was = !!loop; if (loop) { loops.forEach(l => l.stop()); loops = []; loop = null; } build(); if (was) begin(); };

    function renderCtl() {
      ctl.innerHTML = '';
      const srcSeg = h('div', { class: 'seg' }, [['prog', 'Progressions'], ['own', 'Your own chords']].map(([k, t]) => h('button', { 'aria-pressed': st.src === k ? 'true' : 'false', onclick: () => { st.src = k; rebuild(); } }, t)));
      const own = h('textarea', { id: 'arp-own', rows: 2, class: 'arp-own', 'aria-label': 'Your chords', placeholder: 'Dm7 G7 Cmaj7 A7' });
      own.value = st.own;
      const useOwn = () => { st.own = own.value.slice(0, 400); rebuild(); };
      own.addEventListener('change', useOwn);
      ctl.append(h('h3', { text: 'Set up' }), srcSeg,
        st.src === 'prog'
          ? h('div', { class: 'stack' },
            h('div', { class: 'formgrid' }, selectEl('arp-prog', 'Progression', PROGRESSIONS.map(x => ({ value: x.id, text: x.name })), st.prog, v => { st.prog = v; rebuild(); })),
            h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Key' }), keyChips(st.key, i => { st.key = i; rebuild(); })))
          : h('label', { class: 'stack field', for: 'arp-own' }, h('span', { class: 'eyebrow', text: 'Your chords, in order' }), own,
            h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: useOwn }, 'Use these chords'),
              h('span', { class: 'small muted', text: 'Split by spaces or |. Any type the Repertoire band knows: Cmaj7, Dm7, G7, Bø, E7♭9, F6, Am…' }))),
        h('div', { class: 'formgrid' },
          selectEl('arp-bars', 'New chord every', [1, 2, 4].map(v => ({ value: String(v), text: v === 1 ? 'bar' : v + ' bars' })), String(st.bars), v => { st.bars = +v; rebuild(); }),
          subSel('arp-csub', st.sub, v => { st.sub = v; rebuild(); }),
          selectEl('arp-mode', 'At each change', [{ value: 'nearest', text: 'Nearest note' }, { value: 'root', text: 'Start on the root' }], st.mode, v => { st.mode = v; rebuild(); }),
          selectEl('arp-cpos', 'Position', [{ value: 'auto', text: 'Best for these chords' }].concat(Array.from({ length: 9 }, (_, i) => ({ value: String(i), text: 'Frets ' + i + '–' + (i + 4) }))), String(st.pos), v => { st.pos = v === 'auto' ? 'auto' : +v; rebuild(); })),
        h('div', { class: 'row' },
          checkbox(st.guide, 'Play the notes with me', v => { st.guide = v; persist(); }),
          checkbox(st.comp, 'Strum the chords softly', v => { st.comp = v; persist(); }),
          checkbox(st.climb, 'Speed up 2 bpm each time through', v => { st.climb = v; persist(); })),
        h('p', { class: 'small muted', text: 'Staying in one position makes you find each chord’s notes under your hand, the way you will when you solo over the changes. The guide notes and strums stop while the mic listens.' }));
    }
    build();
    return () => { keepAwake(false, 'arpchanges'); timers.forEach(clearTimeout); loops.forEach(l => l.stop()); loop = null; check.stop(); };
  }
});

