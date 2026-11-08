import A from '../audio.js';
import D from '../data.js';
import E from '../engine.js';
import { h, toast, tool, Fretboard } from '../ui/core.js';
import { parseChord, prettySym } from '../theory.js';
import { Band } from '../band.js';
import Mic from '../listen.js';
import { MicToggle } from '../ui/mic.js';
import { keepAwake } from '../native.js';
import { selectEl } from './practice.js';
import { VAMPS, CATS, vampOf, roll, build, makeJudge, vampBars, marksFor, constraintOf } from '../constraints.js';

/* ======================================================
   CONSTRAINT ROLL: improvise over a vamp on the band with one limit at a time (three notes, one string, off the
   beat, in the manner of a favourite player…), rolled at random from the kinds you pick, a new one every few
   minutes. Many limits are checked as you play, by the mic or by taps on the fretboard; the others are on your
   honour. The constraints and their checks are src/constraints.js.
   ====================================================== */

const MINS = [1, 2, 3, 5, 0];
const WHO = { full: ['Full band', { drums: true, comp: true, bass: true }], rhythm: ['Bass and drums', { drums: true, comp: false, bass: true }], drums: ['Drums only', { drums: true, comp: false, bass: false }] };
const checkbox = (on, label, onchange) => h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: on ? true : null, onchange: e => onchange(e.target.checked) }), label);
const tuning = () => E.STRINGS.map(x => x.midi);
const fmt = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

tool('constraint', {
  tab: 'play', skill: 'improv', title: 'Constraint roll', eyebrow: 'Improvise · one limit at a time',
  desc: 'Improvise over a vamp from anywhere in the app’s world with one rule at a time: three notes, one string, off the beat, in the manner of a player you love. Limits make you find ideas that are your own.',
  render(body, ctx) {
    const p = ctx.params || {};
    const saved = E.state.settings.constraint || {};
    const st = {
      vamp: p.vamp || saved.vamp || 'auto', mins: saved.mins ?? 2, who: WHO[saved.who] ? saved.who : 'full',
      auto: saved.auto !== false, stack: !!saved.stack, onlyKept: !!saved.onlyKept,
      cats: Array.isArray(saved.cats) && saved.cats.length ? saved.cats.filter(k => CATS[k]) : Object.keys(CATS),
      kept: Array.isArray(saved.kept) ? saved.kept.filter(constraintOf) : [], recent: Array.isArray(saved.recent) ? saved.recent.slice(-20) : [],
      bpm: Object.assign({}, saved.bpm || {})
    };
    const persist = () => E.setSetting('constraint', { vamp: st.vamp, mins: st.mins, who: st.who, auto: st.auto, stack: st.stack, onlyKept: st.onlyKept, cats: st.cats, kept: st.kept, recent: st.recent.slice(-20), bpm: st.bpm });
    let vamp = st.vamp === 'auto' ? VAMPS[Math.floor(Math.random() * VAMPS.length)] : vampOf(st.vamp);
    let bars = vampBars(vamp, parseChord), insts = [], built = [], judge = null;
    const bpmOf = () => st.bpm[vamp.id] || vamp.bpm;

    const card = h('div', { class: 'card cr-card' }), ctl = h('div', { class: 'card' }), keptCard = h('div', { class: 'card' });
    body.append(card, ctl, keptCard);
    const kindLbl = h('span', { class: 'eyebrow' });
    const rules = h('div', { class: 'stack cr-rules' });
    const timeLbl = h('div', { class: 'big-number mono cr-time', text: '—' });
    const chordLbl = h('div', { class: 'big-number cr-chord', text: '—' });
    const restLbl = h('span', { class: 'chip cr-rest', hidden: true });
    const vampLbl = h('p', { class: 'small muted' });
    const heardLbl = h('p', { class: 'small mono cr-heard', 'aria-live': 'polite' });
    const playBtn = h('button', { class: 'btn primary' }, '▶ Start');
    const rollBtn = h('button', { class: 'btn brass', onclick: () => newRoll(true) }, '🎲 Roll');
    const keepBtn = h('button', { class: 'btn', 'aria-pressed': 'false', onclick: () => toggleKeep() }, '♡ Keep');
    const bpmLbl = h('div', { class: 'big-number mono', text: bpmOf() });
    const fb = Fretboard({ onTap: (si, f, ev) => {
      const m = E.STRINGS[si].midi + f;
      A.note(m, A.now() + 0.01, 0.8, 1.2);
      if (band) hear({ midi: m, t: A.eventToAudioTime(ev), si, f });
    } });
    card.append(
      kindLbl, rules,
      h('div', { class: 'spread' },
        h('div', { class: 'stack', style: { gap: '0' } }, h('span', { class: 'eyebrow', text: 'Chord' }), chordLbl, restLbl),
        h('div', { class: 'stack', style: { gap: '0', justifyItems: 'end' } }, h('span', { class: 'eyebrow', text: 'Time left' }), timeLbl)),
      h('div', { class: 'row' }, playBtn, rollBtn, keepBtn),
      fb.el, vampLbl, heardLbl);

    /* ---------- the mic ---------- */
    let micOff = null;
    const mic = MicToggle({ label: 'Check me as I play', onLabel: 'Listening to you play', hint: 'Headphones help: the mic should hear your guitar, not the band. Without the mic, tap the fretboard.',
      onOn: () => { micOff = Mic.on('note', ev => { if (band) hear({ midi: ev.midi, t: ev.t - Mic.latencyMs() / 1000 }); }); },
      onOff: () => { if (micOff) micOff(); micOff = null; } });
    card.append(mic.el);

    /* ---------- the roll ---------- */
    function show() {
      rules.innerHTML = '';
      kindLbl.textContent = built.map(b => b.kind).join(' + ');
      built.forEach((b, i) => rules.append(h('div', { class: 'stack cr-rule' + (i ? ' cr-second' : '') },
        h('h2', { class: 'cr-name', text: (i ? '+ ' : '') + b.name }),
        h('p', { class: 'cr-text', text: b.text }),
        h('p', { class: 'small muted', text: b.why }),
        h('span', { class: 'small cr-badge' + (b.checked ? ' on' : ''), text: b.checked ? '✓ The app checks this as you play (mic or taps)' : 'On your honour: the app can’t hear this one' }))));
      const kept = built.length === 1 && st.kept.includes(built[0].id);
      keepBtn.textContent = kept ? '♥ Kept' : '♡ Keep'; keepBtn.setAttribute('aria-pressed', kept ? 'true' : 'false');
      keepBtn.hidden = built.length !== 1;
      vampLbl.textContent = vamp.name + ' · ' + vamp.where + ' · ' + vamp.scaleName + ' · ' + bpmOf() + ' bpm';
      paintFret(bars[0][0]);
      heardLbl.textContent = '';
    }
    function paintFret(chord) {
      const T = tuning(), marks = [];
      built.forEach(b => marksFor(b.show, vamp, chord, T).forEach(m => { if (!marks.some(x => x.s === m.s && x.f === m.f)) marks.push(m); }));
      // two stacked rules that both light the neck: show only where both allow
      const both = built.filter(b => b.show);
      if (both.length === 2) {
        const a = marksFor(both[0].show, vamp, chord, T), b = marksFor(both[1].show, vamp, chord, T);
        fb.mark(a.filter(x => b.some(y => y.s === x.s && y.f === x.f)));
      } else fb.mark(marks);
    }
    function useInsts(list) {
      insts = list; built = list.map(x => build(x, vamp, tuning())).filter(Boolean);
      judge = makeJudge(built, bars, bpb());
      list.forEach(x => { st.recent = st.recent.filter(id => id !== x.id).concat([x.id]).slice(-20); });
      persist(); show();
    }
    function newRoll(byHand) {
      const players = (E.state.prefs && E.state.prefs.players) || [];
      useInsts(roll(vamp, { cats: st.cats, only: st.onlyKept ? st.kept : null, recent: st.recent, stack: st.stack, players }));
      if (band) { left = st.mins * 60; started = Date.now(); paintTime(); }
      if (byHand && band) toast('New rule: ' + built.map(b => b.name).join(' + '));
    }
    function toggleKeep() {
      if (built.length !== 1) return;
      const id = built[0].id;
      st.kept = st.kept.includes(id) ? st.kept.filter(x => x !== id) : st.kept.concat([id]);
      persist(); show(); drawKept();
    }

    /* ---------- playing ---------- */
    let band = null, tick = null, left = 0, started = 0, timeUp = false;
    const bpb = () => { const g = D.GROOVES[vamp.groove]; return Math.round(g.steps / g.spb) || 4; };
    function posAt(t) {
      if (!band) return 0;
      const x = band.barAt(t), bd = band.beatDur();
      if (!x) return (t - band.t0) / bd;
      return (x.chorus * bars.length + (x.bi)) * bpb() + (t - x.t) / bd;
    }
    function hear(n) {
      if (!judge) return;
      const r = judge.hear({ midi: n.midi, pos: posAt(n.t), si: n.si, f: n.f });
      if (!r) return;
      const s = judge.stats, nm = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'][((Math.round(n.midi) % 12) + 12) % 12];
      heardLbl.textContent = (built.some(b => b.checked) ? 'Kept to it: ' + s.kept + ' of ' + s.notes + ' notes · ' : s.notes + ' notes · ') + 'last: ' + nm + (r.ok ? ' ✓' : ' ✗ ' + r.why);
      heardLbl.classList.toggle('bad', !r.ok);
    }
    function paintTime() {
      if (!band) { timeLbl.textContent = st.mins ? fmt(st.mins * 60) : '∞'; return; }
      if (!st.mins) { timeLbl.textContent = fmt((Date.now() - started) / 1000); return; }
      const rem = Math.max(0, left - (Date.now() - started) / 1000);
      timeLbl.textContent = fmt(Math.ceil(rem));
      if (rem <= 0 && !timeUp) {
        timeUp = true;
        const t = A.now() + 0.05; [76, 81, 88].forEach((m, i) => A.note(m, t + i * 0.16, 0.5, 1.4));
        if (st.auto) { timeUp = false; newRoll(false); toast('Time’s up. New rule: ' + built.map(b => b.name).join(' + ')); }
        else timeLbl.textContent = 'Time’s up';
      }
    }
    function begin() {
      A.ensure();
      const g = D.GROOVES[vamp.groove];
      timeUp = false; left = st.mins * 60;
      if (judge) judge.reset();
      band = Band({
        bars, groove: g, grooveId: vamp.groove, bpm: bpmOf, parts: WHO[st.who][1], comp: 'piano', feel: 'walk', countIn: true,
        onCount: n => { chordLbl.textContent = n + '…'; },
        onBeat: ({ bar, beat, chorus, chord }) => {
          if (beat === 0 && chorus === 0 && bar === 0 && !started) { started = Date.now(); }
          chordLbl.textContent = chord ? prettySym(chord.sym) : '—';
          const rest = built.find(b => b.rest);
          const n = chorus * bars.length + bar;
          if (rest) { const r = Math.floor(n / rest.rest) % 2 === 1; restLbl.hidden = false; restLbl.textContent = r ? 'Rest' : 'Play'; restLbl.classList.toggle('on', !r); }
          else restLbl.hidden = true;
          if (built.some(b => b.show && b.show.chord) && beat === 0) paintFret(chord);
        }
      });
      started = 0;
      band.t0 = band.start();
      tick = setInterval(() => { if (started) paintTime(); }, 250);
      keepAwake(true, 'constraint');
      playBtn.textContent = '■ Stop'; ctx.setActive(true);
    }
    function stop() {
      if (band) band.stop(); band = null;
      clearInterval(tick); tick = null; started = 0;
      keepAwake(false, 'constraint');
      playBtn.textContent = '▶ Start'; ctx.setActive(false);
      chordLbl.textContent = '—'; restLbl.hidden = true; paintTime(); paintFret(bars[0][0]);
    }
    playBtn.onclick = () => (band ? stop() : begin());
    function setVamp(id) {
      const was = !!band; if (band) stop();
      st.vamp = id; vamp = id === 'auto' ? VAMPS[Math.floor(Math.random() * VAMPS.length)] : vampOf(id);
      bars = vampBars(vamp, parseChord); bpmLbl.textContent = bpmOf();
      // the same rules on the new vamp (their notes come from its scale, so roll the note ones again)
      const again = insts.map(x => (constraintOf(x.id).cat === 'notes' || constraintOf(x.id).cat === 'world' ? { id: x.id, p: constraintOf(x.id).make(vamp, Math.random) } : x));
      persist(); useInsts(again);
      if (was) begin();
    }
    function setBpm(v) {
      st.bpm[vamp.id] = Math.max(40, Math.min(240, Math.round(v))); bpmLbl.textContent = bpmOf(); persist();
      vampLbl.textContent = vamp.name + ' · ' + vamp.where + ' · ' + vamp.scaleName + ' · ' + bpmOf() + ' bpm';
    }

    /* ---------- set up ---------- */
    function renderCtl() {
      ctl.innerHTML = '';
      const kinds = h('div', { class: 'chips' }, Object.entries(CATS).map(([k, name]) => h('button', {
        class: 'chip', 'aria-pressed': st.cats.includes(k) ? 'true' : 'false',
        onclick: () => {
          const on = st.cats.includes(k);
          if (on && st.cats.length === 1) { toast('Keep at least one kind.'); return; }
          st.cats = on ? st.cats.filter(x => x !== k) : st.cats.concat([k]); persist(); renderCtl();
        }
      }, name)));
      ctl.append(h('h3', { text: 'Set up' }),
        h('div', { class: 'formgrid' },
          selectEl('cr-vamp', 'Backing', [{ value: 'auto', text: 'Surprise me' }].concat(VAMPS.map(v => ({ value: v.id, text: v.name + ' · ' + v.where }))), st.vamp, setVamp),
          selectEl('cr-mins', 'Each rule lasts', MINS.map(m => ({ value: String(m), text: m ? m + ' minute' + (m === 1 ? '' : 's') : 'Until I roll again' })), String(st.mins), v => { st.mins = +v; left = st.mins * 60; started = band ? Date.now() : 0; persist(); paintTime(); }),
          selectEl('cr-who', 'Who plays', Object.entries(WHO).map(([k, [t]]) => ({ value: k, text: t })), st.who, v => { st.who = v; persist(); if (band) band.set({ parts: WHO[v][1] }); })),
        h('div', { class: 'row' },
          h('button', { class: 'btn small', onclick: () => setBpm(bpmOf() - 4) }, '−4'),
          h('div', { class: 'stack', style: { gap: '0', justifyItems: 'center' } }, h('span', { class: 'eyebrow', text: 'bpm' }), bpmLbl),
          h('button', { class: 'btn small', onclick: () => setBpm(bpmOf() + 4) }, '+4')),
        h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Kinds of rule to roll' }), kinds),
        h('div', { class: 'row' },
          checkbox(st.auto, 'Roll a new rule when time is up', v => { st.auto = v; persist(); }),
          checkbox(st.stack, 'Two rules at once', v => { st.stack = v; persist(); newRoll(true); }),
          checkbox(st.onlyKept, 'Only the ones I kept' + (st.kept.length ? ' (' + st.kept.length + ')' : ''), v => { if (v && !st.kept.length) { toast('Keep a rule first with ♡ Keep.'); renderCtl(); return; } st.onlyKept = v; persist(); })),
        h('p', { class: 'small muted', text: 'Play for the whole time, even when the rule feels awkward: the ideas that come out of the awkward part are the ones you wouldn’t have found. Favourite players in Settings → Your music taste come up more often.' }));
    }
    function drawKept() {
      keptCard.innerHTML = '';
      keptCard.hidden = !st.kept.length;
      if (!st.kept.length) return;
      keptCard.append(h('h3', { text: 'Rules you kept' }),
        h('div', { class: 'chips' }, st.kept.map(id => {
          const c = constraintOf(id);
          return h('span', { class: 'chip cr-kept' },
            h('button', { class: 'btn ghost small', 'aria-label': 'Play with ' + c.name, onclick: () => { useInsts([{ id, p: c.make(vamp, Math.random) }]); if (band) { left = st.mins * 60; started = Date.now(); } } }, c.name),
            h('button', { class: 'btn ghost small', 'aria-label': 'Forget ' + c.name, onclick: () => { st.kept = st.kept.filter(x => x !== id); persist(); show(); drawKept(); renderCtl(); } }, '×'));
        })));
    }
    renderCtl(); drawKept();
    newRoll(false);
    paintTime();
    return () => { if (band) band.stop(); band = null; clearInterval(tick); keepAwake(false, 'constraint'); mic.cleanup(); };
  }
});
