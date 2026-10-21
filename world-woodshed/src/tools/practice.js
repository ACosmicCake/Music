import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import { h, s, toast, tool, openTool, Fretboard, positionsOfPc } from '../ui/core.js';
import { degreeLabel, diatonicChords, chordMidis, spell, keyPrefersFlats, prettySym, flatName } from '../theory.js';
import { PATTERNS, DRILLS, warmScales } from '../routines.js';

/* ======================================================
   PRACTICE TOOLS: scale warm-up, explorer, circle of fifths, tuner, free practice, break
   ====================================================== */

const scaleOf = id => D.SCALES.find(x => x.id === id) || D.SCALES[0];
function selectEl(id, label, options, value, onchange) {
  const sel = h('select', { id, 'aria-label': label });
  options.forEach(o => {
    if (o.group) { const g = h('optgroup', { label: o.group }); o.items.forEach(it => g.append(h('option', { value: it.value, selected: it.value === value ? true : null, text: it.text }))); sel.append(g); }
    else sel.append(h('option', { value: o.value, selected: o.value === value ? true : null, text: o.text }));
  });
  sel.onchange = () => onchange(sel.value);
  return h('label', { class: 'stack field', for: id }, h('span', { class: 'eyebrow', text: label }), sel);
}
function keyChips(value, onpick) {
  const wrap = h('div', { class: 'chips' });
  D.NOTE_NAMES.forEach((n, i) => wrap.append(h('button', { class: 'chip', 'aria-pressed': i === value ? 'true' : 'false', onclick: () => onpick(i) }, n)));
  return wrap;
}
function scaleOptions(list) {
  return [1, 2, 3, 4, 5].map(t => ({ group: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'][t - 1], items: list.filter(x => x.tier === t).map(x => ({ value: x.id, text: x.name })) })).filter(g => g.items.length);
}

/* Notes of a scale in one 5-fret position, low to high, no repeated pitches */
export function positionNotes(steps, tonicPc, start) {
  const pcs = steps.map(st => (tonicPc + st) % 12);
  const out = [];
  E.STRINGS.forEach((st, si) => {
    for (let f = start; f <= start + 4 && f <= 15; f++) {
      const m = st.midi + f, p = m % 12;
      if (!pcs.includes(p)) continue;
      if (out.length && m <= out[out.length - 1].m) continue;
      out.push({ s: si, f, m, p, deg: steps[pcs.indexOf(p)] });
    }
  });
  return out;
}
export function patternSeq(L, pattern) {
  const n = L.length, seq = [];
  if (n < 2) return L.slice();
  switch (pattern) {
    case 'thirds':
      for (let i = 0; i + 2 < n; i++) seq.push(L[i], L[i + 2]);
      for (let i = n - 1; i - 2 >= 0; i--) seq.push(L[i], L[i - 2]);
      break;
    case 'fours':
      for (let i = 0; i + 3 < n; i++) seq.push(L[i], L[i + 1], L[i + 2], L[i + 3]);
      for (let i = n - 1; i - 3 >= 0; i--) seq.push(L[i], L[i - 1], L[i - 2], L[i - 3]);
      break;
    case 'threes':
      for (let i = 0; i + 2 < n; i++) seq.push(L[i], L[i + 1], L[i + 2]);
      for (let i = n - 1; i - 2 >= 0; i--) seq.push(L[i], L[i - 1], L[i - 2]);
      break;
    case 'sixths':
      for (let i = 0; i + 5 < n; i++) seq.push(L[i], L[i + 5]);
      for (let i = n - 1; i - 5 >= 0; i--) seq.push(L[i], L[i - 5]);
      break;
    default:
      for (let i = 0; i < n; i++) seq.push(L[i]);
      for (let i = n - 2; i > 0; i--) seq.push(L[i]);
  }
  return seq.length ? seq : L.slice();
}

tool('scalewarm', {
  tab: 'play', skill: 'technique', title: 'Scale warm-up', eyebrow: 'Warm-up · scales with the click',
  desc: 'One scale, one position, the metronome and a pattern. The fretboard follows along; the tempo climbs as you stay clean.',
  render(body, ctx) {
    const p = ctx.params || {};
    const saved = E.state.settings.warm || {};
    const st = {
      scale: p.scale || saved.scale || 'major', tonic: p.tonic ?? saved.tonic ?? 7, pattern: p.pattern || saved.pattern || 'updown',
      sub: saved.sub || 2, guide: saved.guide !== false, climb: saved.climb !== false, start: null
    };
    const bpmKey = () => st.scale + ':' + st.pattern;
    const bpms = E.state.settings.warmBpm || {};
    let bpm = p.bpm && !bpms[bpmKey()] ? p.bpm : (bpms[bpmKey()] || p.bpm || 72);
    let loop = null, seq = [], notes = [], rounds = 0;
    const card = h('div', { class: 'card' }), ctl = h('div', { class: 'card' });
    body.append(card, ctl);
    const now = h('div', { class: 'big-number mono warm-note', text: '—' });
    const bpmLbl = h('div', { class: 'big-number mono', text: bpm });
    const info = h('p', { class: 'small muted' });
    const fb = Fretboard({ onTap: (si, f) => A.note(E.STRINGS[si].midi + f, A.now() + 0.01, 0.8, 1.2) });
    const playBtn = h('button', { class: 'btn primary' }, '▶ Start');
    const roundLbl = h('span', { class: 'small muted mono' });
    card.append(
      h('div', { class: 'spread' }, h('div', { class: 'stack', style: { gap: '0' } }, h('span', { class: 'eyebrow', text: 'Now' }), now),
        h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => setBpm(bpm - 4) }, '−4'), h('div', { class: 'stack', style: { gap: '0', justifyItems: 'center' } }, h('span', { class: 'eyebrow', text: 'bpm' }), bpmLbl), h('button', { class: 'btn small', onclick: () => setBpm(bpm + 4) }, '+4'))),
      fb.el, info,
      h('div', { class: 'row' }, playBtn,
        h('button', { class: 'btn brass', onclick: () => { saveBest(); setBpm(bpm + 4); toast('Clean. Up to ' + bpm + ' bpm'); } }, 'Clean ✓ +4'),
        h('button', { class: 'btn', onclick: () => { setBpm(bpm - 6); toast('Back to ' + bpm + ' bpm. Rebuild it clean.'); } }, 'Not clean'), roundLbl));

    const posSel = h('div');
    function persist() { E.setSetting('warm', { scale: st.scale, tonic: st.tonic, pattern: st.pattern, sub: st.sub, guide: st.guide, climb: st.climb }); }
    function setBpm(v) {
      bpm = Math.max(30, Math.min(260, Math.round(v)));
      bpmLbl.textContent = bpm;
      const all = Object.assign({}, E.state.settings.warmBpm || {}); all[bpmKey()] = bpm; E.setSetting('warmBpm', all);
      if (loop) { stop(); start(); }
    }
    function saveBest() {
      const best = Object.assign({}, E.state.settings.warmBest || {});
      best[bpmKey()] = Math.max(best[bpmKey()] || 0, bpm); E.setSetting('warmBest', best);
    }
    function defaultStart() { const f = ((st.tonic - 4) % 12 + 12) % 12; return Math.max(0, f === 0 ? 0 : f - 1); }
    function build() {
      const sc = scaleOf(st.scale);
      if (st.start === null) st.start = defaultStart();
      notes = positionNotes(sc.steps, st.tonic, st.start);
      seq = patternSeq(notes, st.pattern);
      const flats = keyPrefersFlats(st.tonic, sc.steps[2] === 3);
      fb.mark(notes.map(n => ({ s: n.s, f: n.f, kind: n.deg === 0 ? 'root' : 'tone', label: degreeLabel(n.deg) })));
      info.textContent = spell(st.tonic, flats) + ' ' + sc.name + ', frets ' + st.start + '–' + (st.start + 4) + ' · ' + PATTERNS[st.pattern].toLowerCase() + ' · ' + seq.length + ' notes per round. ' +
        'Gold = root. Play one note per ' + ['', 'beat', 'half beat', 'triplet', 'sixteenth'][st.sub] + '.';
      const best = (E.state.settings.warmBest || {})[bpmKey()];
      roundLbl.textContent = best ? 'Best clean: ' + best + ' bpm' : '';
      renderCtl();
    }
    function highlight(i) {
      const n = seq[i]; if (!n) return;
      fb.mark(notes.map(x => ({ s: x.s, f: x.f, kind: x === n ? 'good' : x.deg === 0 ? 'root' : 'tone', label: degreeLabel(x.deg) })));
      now.textContent = spell(n.p, keyPrefersFlats(st.tonic, scaleOf(st.scale).steps[2] === 3));
    }
    let countTimers = [];
    function start() {
      A.ensure(); rounds = 0;
      const len = seq.length, beat = 60 / bpm;
      // one bar of count-in, then the pattern loops (steps are subdivisions)
      const t0 = A.now() + 0.1;
      for (let k = 0; k < 4; k++) {
        A.hit(k === 0 ? 'clickHi' : 'click', t0 + k * beat, 1);
        countTimers.push(setTimeout(() => { now.textContent = (k + 1) + '…'; }, Math.max(0, (t0 + k * beat - A.now() + A.latency()) * 1000)));
      }
      loop = A.Loop({
        steps: Math.ceil(len / st.sub) * st.sub,
        stepDur: () => 60 / bpm / st.sub,
        onStep: (i, t) => {
          if (i % st.sub === 0) A.hit(i === 0 ? 'clickHi' : 'click', t, 0.8);
          if (i < len && st.guide) A.note(seq[i].m, t, 0.32, 0.25);
        },
        onVisual: (i, cycle) => {
          if (i < len) highlight(i);
          if (i === 0 && cycle > 0) {
            rounds++;
            if (st.climb && rounds % 2 === 0) { bpm = Math.min(260, bpm + 2); bpmLbl.textContent = bpm; }
            roundLbl.textContent = 'Round ' + (rounds + 1);
          }
        }
      });
      loop.start(t0 + 4 * beat); playBtn.textContent = '■ Stop'; ctx.setActive(true);
    }
    function stop() { countTimers.forEach(clearTimeout); countTimers = []; if (loop) loop.stop(); loop = null; playBtn.textContent = '▶ Start'; ctx.setActive(false); now.textContent = '—'; build(); }
    playBtn.onclick = () => (loop ? stop() : start());

    function renderCtl() {
      ctl.innerHTML = '';
      const restart = () => { st.start = null; persist(); const was = !!loop; if (loop) { loop.stop(); loop = null; } build(); if (was) start(); };
      ctl.append(h('h3', { text: 'Set up' }),
        h('div', { class: 'formgrid' },
          selectEl('warm-scale', 'Scale', scaleOptions(warmScales()), st.scale, v => { st.scale = v; bpm = (E.state.settings.warmBpm || {})[bpmKey()] || bpm; bpmLbl.textContent = bpm; restart(); }),
          selectEl('warm-pattern', 'Pattern', Object.entries(PATTERNS).map(([k, v]) => ({ value: k, text: v })), st.pattern, v => { st.pattern = v; bpm = (E.state.settings.warmBpm || {})[bpmKey()] || bpm; bpmLbl.textContent = bpm; persist(); const was = !!loop; if (loop) { loop.stop(); loop = null; } build(); if (was) start(); }),
          selectEl('warm-sub', 'Notes per beat', [1, 2, 3, 4].map(v => ({ value: String(v), text: ['1 (quarters)', '2 (eighths)', '3 (triplets)', '4 (sixteenths)'][v - 1] })), String(st.sub), v => { st.sub = +v; persist(); if (loop) { stop(); start(); } else build(); }),
          selectEl('warm-pos', 'Position', Array.from({ length: 11 }, (_, i) => ({ value: String(i), text: 'Frets ' + i + '–' + (i + 4) })), String(st.start), v => { st.start = +v; const was = !!loop; if (loop) { loop.stop(); loop = null; } build(); if (was) start(); })),
        h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Key' }), keyChips(st.tonic, i => { st.tonic = i; restart(); })),
        h('div', { class: 'row' },
          h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: st.guide ? true : null, onchange: e => { st.guide = e.target.checked; persist(); } }), 'Play the notes with me'),
          h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: st.climb ? true : null, onchange: e => { st.climb = e.target.checked; persist(); } }), 'Speed up 2 bpm every 2 rounds')));
    }
    build();
    return () => { countTimers.forEach(clearTimeout); if (loop) loop.stop(); loop = null; };
  }
});

/* ---------- Chord & scale explorer ---------- */
tool('explorer', {
  tab: 'learn', skill: 'fretboard', title: 'Chord & scale explorer', eyebrow: 'Reference · the whole neck',
  desc: 'Any scale or chord in any key, mapped across the neck with interval labels. Scales show the chords that live inside them.',
  render(body, ctx) {
    const p = ctx.params || {};
    const st = { mode: p.mode || 'scale', scale: p.scale || 'major', chord: p.chord || 'maj7', root: p.root ?? 0, labels: 'deg', focus: null, sev: false };
    const card = h('div', { class: 'card' }), chordsCard = h('div', { class: 'card' });
    body.append(card, chordsCard);
    const fb = Fretboard({ onTap: (si, f) => A.note(E.STRINGS[si].midi + f, A.now() + 0.01, 0.8, 1.2) });
    function intervals() { return st.mode === 'scale' ? scaleOf(st.scale).steps : D.CHORDS.find(c => c.id === st.chord).iv; }
    function draw() {
      card.innerHTML = '';
      const seg = h('div', { class: 'seg' }, ['scale', 'chord'].map(m => h('button', { 'aria-pressed': st.mode === m ? 'true' : 'false', onclick: () => { st.mode = m; st.focus = null; draw(); } }, m === 'scale' ? 'Scales' : 'Chords')));
      const labSeg = h('div', { class: 'seg' }, [['deg', 'Intervals'], ['name', 'Note names']].map(([k, t]) => h('button', { 'aria-pressed': st.labels === k ? 'true' : 'false', onclick: () => { st.labels = k; draw(); } }, t)));
      const picker = st.mode === 'scale'
        ? selectEl('ex-scale', 'Scale', scaleOptions(D.SCALES), st.scale, v => { st.scale = v; st.focus = null; draw(); })
        : selectEl('ex-chord', 'Chord', D.CHORDS.map(c => ({ value: c.id, text: c.name })), st.chord, v => { st.chord = v; draw(); });
      const iv = intervals();
      const flats = keyPrefersFlats(st.root, iv[2] === 3 || iv[1] === 3);
      const names = iv.map(x => Number.isInteger(x) ? spell(st.root + x, flats) : spell(st.root + Math.ceil(x), flats) + '¼♭');
      const title = spell(st.root, flats) + ' ' + (st.mode === 'scale' ? scaleOf(st.scale).name : D.CHORDS.find(c => c.id === st.chord).name);
      const EXT = { 13: '♭9', 14: '9', 15: '♯9', 17: '11', 18: '♯11', 20: '♭13', 21: '13' };
      const formula = iv.map(x => x >= 12 ? EXT[x] || degreeLabel(x) : degreeLabel(x)).join(' ');
      const steps = st.mode === 'scale' ? iv.map((x, i) => (i + 1 < iv.length ? iv[i + 1] : 12) - x).map(d => d === 1 ? 'H' : d === 2 ? 'W' : d === 3 ? 'W+H' : d === 0.5 ? '¼' : String(d)).join(' ') : '';
      card.append(h('div', { class: 'spread' }, seg, labSeg), h('div', { class: 'formgrid' }, picker),
        h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Root' }), keyChips(st.root, i => { st.root = i; st.focus = null; draw(); })),
        h('h2', { text: title }),
        h('div', { class: 'kv' }, h('span', { class: 'muted', text: 'Notes' }), h('b', { class: 'mono', text: names.join('  ') }),
          h('span', { class: 'muted', text: 'Formula' }), h('span', { class: 'mono', text: formula }),
          steps ? h('span', { class: 'muted', text: 'Steps' }) : null, steps ? h('span', { class: 'mono', text: steps }) : null),
        st.mode === 'scale' ? h('p', { class: 'small muted', text: scaleOf(st.scale).aka + '. ' + scaleOf(st.scale).note }) : null,
        h('div', { class: 'row' },
          h('button', { class: 'btn primary', onclick: () => playIt(iv) }, '▶ Play'),
          st.mode === 'scale' ? h('button', { class: 'btn', onclick: () => ctxOpen('scalewarm', { scale: st.scale, tonic: st.root }) }, 'Warm up with it') : null,
          st.mode === 'scale' ? h('button', { class: 'btn ghost', onclick: () => ctxOpen('drone', { scale: st.scale, tonic: st.root }) }, 'Improvise over a drone') : null),
        fb.el);
      mark(iv, flats);
      drawChords(flats);
    }
    function mark(iv, flats) {
      const focus = st.focus;
      const pcs = iv.map(x => (st.root + Math.round(Number.isInteger(x) ? x : Math.ceil(x))) % 12);
      const marks = [];
      iv.forEach((x, i) => {
        const pcx = pcs[i];
        positionsOfPc([pcx]).forEach(m => {
          let kind = x === 0 ? 'root' : Number.isInteger(x) ? 'tone' : 'quarter';
          if (focus) kind = focus.pcs.includes(pcx) ? (pcx === focus.root ? 'root' : 'g3') : 'tone faint';
          marks.push(Object.assign(m, { kind, label: st.labels === 'deg' ? (focus ? degreeLabel(((pcx - focus.root) % 12 + 12) % 12) : degreeLabel(x)) : spell(pcx, flats) }));
        });
      });
      fb.mark(marks);
    }
    function playIt(iv) {
      A.ensure(); const t = A.now() + 0.05;
      if (st.mode === 'scale') {
        const up = iv.concat([12]), seq = up.concat(up.slice(0, -1).reverse());
        seq.forEach((x, i) => A.note(48 + st.root + x, t + i * 0.28, 0.7, 0.5));
      } else {
        const ms = chordMidis(st.root, iv);
        ms.forEach((m, i) => A.note(m, t + i * 0.22, 0.6, 1.2));
        A.strum(ms, t + ms.length * 0.22 + 0.2, 0.7, 0.03, 2);
      }
    }
    function drawChords(flats) {
      chordsCard.innerHTML = '';
      if (st.mode !== 'scale') { chordsCard.hidden = true; return; }
      const dc = diatonicChords(scaleOf(st.scale).steps, st.root);
      if (!dc.length) { chordsCard.hidden = true; return; }
      chordsCard.hidden = false;
      const seg = h('div', { class: 'seg' }, [[false, 'Triads'], [true, '7th chords']].map(([v, t]) => h('button', { 'aria-pressed': st.sev === v ? 'true' : 'false', onclick: () => { st.sev = v; drawChords(flats); } }, t)));
      chordsCard.append(h('div', { class: 'spread' }, h('h3', { text: 'Chords in this scale' }), seg),
        h('p', { class: 'small muted', text: 'Tap a chord to hear it and see its notes inside the scale. Tap it again to show the whole scale.' }),
        h('div', { class: 'dchords' }, dc.map(c => {
          const ivs = st.sev ? c.iv7 : c.iv;
          const on = st.focus && st.focus.root === c.root && st.focus.n === ivs.length;
          return h('button', { class: 'dchord' + (on ? ' on' : ''), onclick: () => {
            A.ensure(); A.strum(chordMidis(c.root, ivs), A.now() + 0.03, 0.65, 0.025, 1.8);
            st.focus = on ? null : { root: c.root, n: ivs.length, pcs: ivs.map(x => (c.root + x) % 12) };
            mark(scaleOf(st.scale).steps, flats); drawChords(flats);
          } }, h('span', { class: 'mono small', text: c.roman }), h('b', { text: prettySym(st.sev ? c.seventh : c.triad) }));
        })));
    }
    function ctxOpen(id, params) { openTool(id, { params, returnTab: 'learn' }); }
    draw();
  }
});

/* ---------- Circle of fifths ---------- */
const MAJ_ORDER = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];
const SIG = ['', '1♯', '2♯', '3♯', '4♯', '5♯', '6♯/6♭', '5♭', '4♭', '3♭', '2♭', '1♭'];
const MAJ_LABEL = ['C', 'G', 'D', 'A', 'E', 'B', 'F♯/G♭', 'D♭', 'A♭', 'E♭', 'B♭', 'F'];
const MIN_LABEL = ['Am', 'Em', 'Bm', 'F♯m', 'C♯m', 'G♯m', 'D♯m/E♭m', 'B♭m', 'Fm', 'Cm', 'Gm', 'Dm'];
export function CircleWidget(opts = {}) {
  let sel = opts.key ?? 0; // index in MAJ_ORDER
  const wrap = h('div', { class: 'circle-wrap' });
  const svg = s('svg', { viewBox: '-170 -170 340 340', class: 'circle', role: 'img', 'aria-label': 'Circle of fifths' });
  const panel = h('div', { class: 'stack' });
  wrap.append(svg, panel);
  const pt = (r, a) => [r * Math.sin(a), -r * Math.cos(a)];
  function seg(r0, r1, i) {
    const a0 = (i - 0.5) * Math.PI / 6, a1 = (i + 0.5) * Math.PI / 6;
    const [x0, y0] = pt(r1, a0), [x1, y1] = pt(r1, a1), [x2, y2] = pt(r0, a1), [x3, y3] = pt(r0, a0);
    return `M${x0} ${y0}A${r1} ${r1} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 0 0 ${x3} ${y3}Z`;
  }
  function draw() {
    svg.innerHTML = '';
    for (let i = 0; i < 12; i++) {
      const near = i === sel ? 'sel' : (i === (sel + 1) % 12 || i === (sel + 11) % 12) ? 'near' : '';
      const g = s('g', { class: 'cseg ' + near, tabindex: '0', role: 'button', 'aria-label': MAJ_LABEL[i] + ' major' });
      g.append(s('path', { d: seg(100, 160, i), class: 'outer' }), s('path', { d: seg(58, 100, i), class: 'inner' }));
      const [tx, ty] = pt(130, i * Math.PI / 6), [mx, my] = pt(79, i * Math.PI / 6), [sx, sy] = pt(46, i * Math.PI / 6);
      g.append(s('text', { x: tx, y: ty, class: 'maj' }, MAJ_LABEL[i].split('/')[0]), s('text', { x: mx, y: my, class: 'min' }, MIN_LABEL[i].split('/')[0]));
      if (i === sel) g.append(s('text', { x: sx, y: sy, class: 'sig' }, SIG[i] || '0'));
      g.addEventListener('click', () => { sel = i; draw(); A.ensure(); A.strum(chordMidis(MAJ_ORDER[i], [0, 4, 7]), A.now() + 0.03, 0.6, 0.02, 1.5); });
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); g.dispatchEvent(new Event('click')); } });
      svg.append(g);
    }
    svg.append(s('circle', { r: 32, class: 'hub' }), s('text', { x: 0, y: 4, class: 'hubtext' }, 'key'));
    renderPanel();
  }
  function renderPanel() {
    panel.innerHTML = '';
    const tonic = MAJ_ORDER[sel];
    const dc = diatonicChords([0, 2, 4, 5, 7, 9, 11], tonic);
    const flats = keyPrefersFlats(tonic, false);
    const sharpsOrder = ['F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯'], flatsOrder = ['B♭', 'E♭', 'A♭', 'D♭', 'G♭', 'C♭'];
    const n = sel <= 6 ? sel : 12 - sel;
    const acc = sel === 0 ? 'No sharps or flats' : (sel <= 6 && !flats ? sharpsOrder.slice(0, n) : flatsOrder.slice(0, sel <= 6 ? 6 : n)).join(' ');
    panel.append(
      h('div', { class: 'spread' }, h('h2', { text: MAJ_LABEL[sel] + ' major · ' + MIN_LABEL[sel] }), h('span', { class: 'mono small muted', text: SIG[sel] || '0 ♯/♭' })),
      h('p', { class: 'small', text: 'Key signature: ' + acc + '. Neighbours on the circle (' + MAJ_LABEL[(sel + 11) % 12].split('/')[0] + ' and ' + MAJ_LABEL[(sel + 1) % 12].split('/')[0] + ') share all but one note: they are the IV and V keys.' }),
      h('div', { class: 'dchords' }, dc.map(c => h('button', { class: 'dchord', onclick: () => { A.ensure(); A.strum(chordMidis(c.root, c.iv), A.now() + 0.03, 0.65, 0.025, 1.6); } }, h('span', { class: 'mono small', text: c.roman }), h('b', { text: prettySym(c.triad) })))),
      h('div', { class: 'row' },
        h('button', { class: 'btn small', onclick: () => playProg([0, 3, 4, 0]) }, '▶ I–IV–V–I'),
        h('button', { class: 'btn small', onclick: () => playProg([0, 4, 5, 3]) }, '▶ I–V–vi–IV'),
        h('button', { class: 'btn small', onclick: () => playProg([1, 4, 0, 0]) }, '▶ ii–V–I')));
    function playProg(degs) { A.ensure(); const t = A.now() + 0.05; degs.forEach((d, i) => A.strum(chordMidis(dc[d].root, dc[d].iv), t + i * 0.9, 0.6, 0.02, 0.85)); }
  }
  draw();
  return wrap;
}
tool('circle', {
  tab: 'learn', skill: null, title: 'Circle of fifths', eyebrow: 'Reference · keys',
  desc: 'Every key, its relative minor, its key signature and its chords. Tap a key to hear it.',
  render(body) { body.append(h('div', { class: 'card' }, CircleWidget())); }
});

/* ---------- Reference tones (tuner) ---------- */
const TUNINGS = [
  ['Standard', [40, 45, 50, 55, 59, 64]],
  ['Half step down', [39, 44, 49, 54, 58, 63]],
  ['Drop D', [38, 45, 50, 55, 59, 64]],
  ['DADGAD', [38, 45, 50, 55, 57, 62]],
  ['Open G (Taro Patch)', [38, 43, 50, 55, 59, 62]],
  ['Open D', [38, 45, 50, 54, 57, 62]],
  ['Open C', [36, 43, 48, 55, 60, 64]],
  ['Open E', [40, 47, 52, 56, 59, 64]]
];
tool('tuner', {
  tab: 'learn', skill: null, title: 'Reference tones', eyebrow: 'Reference · tune by ear',
  desc: 'Sustained tones for each string in common tunings. Play the string with the tone and listen for the beating to slow down and stop.',
  render(body) {
    let ti = 0, stopFn = null, playing = -1, cycle = null;
    const card = h('div', { class: 'card' }); body.append(card);
    function stopTone() { if (stopFn) stopFn(); stopFn = null; playing = -1; clearTimeout(cycle); cycle = null; }
    function draw() {
      card.innerHTML = '';
      const [name, midis] = TUNINGS[ti];
      card.append(selectEl('tun-sel', 'Tuning', TUNINGS.map((t, i) => ({ value: String(i), text: t[0] + ' · ' + t[1].map(m => flatName(m)).join(' ') })), String(ti), v => { stopTone(); ti = +v; draw(); }),
        h('div', { class: 'strings' }, midis.map((m, i) => h('button', { class: 'stringbtn' + (playing === i ? ' on' : ''), onclick: () => {
          A.ensure(); const was = playing === i; stopTone();
          if (!was) { stopFn = A.tone(m, A.now() + 0.02, 30); playing = i; }
          draw();
        } }, h('b', { text: flatName(m) }), h('span', { class: 'small muted', text: (6 - i) + (i === 0 ? ' (low)' : i === 5 ? ' (high)' : '') })))),
        h('div', { class: 'row' },
          h('button', { class: 'btn', onclick: () => {
            A.ensure(); stopTone();
            let i = 0;
            const step = () => { if (i >= midis.length) { stopTone(); draw(); return; } stopFn && stopFn(); stopFn = A.tone(midis[i], A.now() + 0.02, 2.2); playing = i; draw(); i++; cycle = setTimeout(step, 2400); };
            step();
          } }, '▶ Play all strings'),
          h('button', { class: 'btn ghost', onclick: () => { stopTone(); draw(); } }, 'Stop')),
        h('p', { class: 'small muted', text: name + '. Tones use A = 440 Hz. Tap a string to hold its note; tap again to stop.' }));
    }
    draw();
    return () => stopTone();
  }
});

/* ---------- Free practice (your own item) ---------- */
tool('free', {
  tab: 'routine', skill: null, title: 'Free practice', eyebrow: 'Your own item',
  desc: 'A timer, your notes and an optional click for anything that isn\'t in the app: pieces, songs, études.',
  render(body, ctx) {
    const p = ctx.params || {};
    let bpm = p.bpm || 80, loop = null;
    const t0 = Date.now();
    const card = h('div', { class: 'card' }); body.append(card);
    if (p.title && p.title !== 'Free practice') card.append(h('h2', { text: p.title }));
    if (p.notes) card.append(h('p', { class: 'notes', text: p.notes }));
    const clock = h('div', { class: 'big-number mono', text: '0:00' });
    const bpmLbl = h('b', { class: 'mono', text: bpm + ' bpm' });
    const btn = h('button', { class: 'btn' }, '▶ Click');
    const range = h('input', { type: 'range', min: 30, max: 240, value: bpm, 'aria-label': 'Tempo' });
    range.oninput = () => { bpm = +range.value; bpmLbl.textContent = bpm + ' bpm'; if (loop) { loop.stop(); start(); } };
    function start() { A.ensure(); loop = A.Loop({ steps: 4, stepDur: () => 60 / bpm, onStep: (i, t) => A.hit(i === 0 ? 'clickHi' : 'click', t, 0.9) }); loop.start(); btn.textContent = '■ Stop click'; ctx.setActive(true); }
    btn.onclick = () => { if (loop) { loop.stop(); loop = null; btn.textContent = '▶ Click'; } else start(); };
    card.append(h('div', { class: 'spread' }, h('div', { class: 'stack', style: { gap: '0' } }, h('span', { class: 'eyebrow', text: 'Time on this' }), clock), h('div', { class: 'row' }, btn, bpmLbl)), range,
      h('p', { class: 'small muted', text: 'Pick a small goal for this block: two clean bars, one passage at a new tempo, a song from memory. Record yourself once at the end.' }));
    ctx.setActive(true);
    const tm = setInterval(() => { const sec = Math.floor((Date.now() - t0) / 1000); clock.textContent = Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }, 1000);
    return () => { clearInterval(tm); if (loop) loop.stop(); };
  }
});

/* ---------- Break ---------- */
tool('rest', {
  tab: 'routine', skill: null, title: 'Break', eyebrow: 'Rest is practice too',
  desc: 'Put the guitar down for a few minutes.',
  render(body) {
    body.append(h('div', { class: 'card rest-card' },
      h('div', { class: 'breathe', 'aria-hidden': 'true' }),
      h('h2', { text: 'Hands down, shoulders loose.' }),
      h('ul', { class: 'list' },
        h('li', { text: 'Open and close your hands slowly, five times. Spread the fingers wide.' }),
        h('li', { text: 'Wrist stretch: arm out, palm up, gently pull the fingers back for 15 seconds. Then palm down.' }),
        h('li', { text: 'Roll your shoulders back ten times and let your neck drop side to side.' }),
        h('li', { text: 'Look at something far away for 20 seconds. Drink some water.' }),
        h('li', { text: 'Hum the last thing you played. Can you still hear it?' }))));
  }
});

/* ---------- No guitar: drills for when the instrument isn't with you ---------- */
const FINGER_PATTERNS = { '1234': [1, 2, 3, 4], '4321': [4, 3, 2, 1], '1324': [1, 3, 2, 4], '1423': [1, 4, 2, 3], '2413': [2, 4, 1, 3], 'pairs': ['1+3', '2+4', '1+3', '2+4'] };
const KONNAKOL = { 3: ['ta', 'ki', 'ta'], 4: ['ta', 'ka', 'di', 'mi'], 5: ['ta', 'di', 'ki', 'na', 'tom'], 7: ['ta', 'ki', 'ta', 'ta', 'ka', 'di', 'mi'] };
tool('away', {
  tab: 'train', skill: null, title: 'No-guitar drills', eyebrow: 'Practice away from the instrument',
  desc: 'Finger independence on a tabletop, konnakol, seeing the neck in your head and singing scale degrees. All you need is the phone.',
  render(body, ctx) {
    let drill = (ctx.params || {}).drill || 'fingers';
    let loop = null, drone = null, cleanupExtra = null;
    const seg = h('div', { class: 'seg big wrap' });
    const holder = h('div', { class: 'section' });
    body.append(seg, holder);
    function stopAll() { if (loop) loop.stop(); loop = null; if (drone) drone.stop(); drone = null; if (cleanupExtra) cleanupExtra(); cleanupExtra = null; ctx.setActive(false); }
    function drawSeg() {
      seg.innerHTML = '';
      Object.entries(DRILLS).forEach(([k, t]) => seg.append(h('button', { 'aria-pressed': k === drill ? 'true' : 'false', onclick: () => { drill = k; drawSeg(); show(); } }, t.split(' (')[0].split(':')[0])));
    }
    // a metronome row shared by the timed drills
    function clickRow(state, onStart, onStop) {
      const lbl = h('b', { class: 'mono', text: state.bpm + ' bpm' });
      const btn = h('button', { class: 'btn primary' }, '▶ Start');
      const set = v => { state.bpm = Math.max(30, Math.min(220, v)); lbl.textContent = state.bpm + ' bpm'; if (loop) { stopAll(); onStart(); btn.textContent = '■ Stop'; } };
      btn.onclick = () => { if (loop) { stopAll(); btn.textContent = '▶ Start'; onStop && onStop(); } else { onStart(); btn.textContent = '■ Stop'; } };
      return h('div', { class: 'row' }, btn, h('button', { class: 'btn small', onclick: () => set(state.bpm - 4) }, '−4'), lbl, h('button', { class: 'btn small', onclick: () => set(state.bpm + 4) }, '+4'));
    }
    function show() {
      stopAll(); holder.innerHTML = '';
      const card = h('div', { class: 'card' }); holder.append(card);
      if (drill === 'fingers') {
        const st = { bpm: 60, pat: '1234' };
        const big = h('div', { class: 'big-number mono finger', text: '—' });
        const sel = selectEl('fing-pat', 'Pattern', Object.keys(FINGER_PATTERNS).map(k => ({ value: k, text: k === 'pairs' ? '1+3 / 2+4 pairs' : k.split('').join('-') })), st.pat, v => { st.pat = v; });
        card.append(h('h2', { text: 'Finger independence' }),
          h('p', { text: 'Rest your fretting-hand fingertips on a table, curved as if on the neck. On each click, lift only the finger shown and tap it down firmly. The other fingers stay touching the table.' }),
          h('div', { class: 'formgrid' }, sel), big,
          clickRow(st, () => {
            A.ensure();
            loop = A.Loop({ steps: 4, stepDur: () => 60 / st.bpm, onStep: (i, t) => A.hit(i === 0 ? 'clickHi' : 'click', t, 0.9), onVisual: i => { big.textContent = String(FINGER_PATTERNS[st.pat][i]); } });
            loop.start(); ctx.setActive(true);
          }, () => { big.textContent = '—'; }),
          h('ul', { class: 'list small' }, h('li', { text: 'Two minutes per hand, then swap. Index = 1, little finger = 4.' }), h('li', { text: 'Go up 4 bpm only when no other finger lifts.' }), h('li', { text: 'Picking hand: tap thumb–index–middle–ring (p-i-m-a) the same way.' })));
      } else if (drill === 'konnakol') {
        const st = { bpm: 70, group: 3 };
        const syl = h('div', { class: 'syllables' });
        const sel = selectEl('kon-grp', 'Group', [[4, 'Fours: ta ka di mi'], [3, 'Threes: ta ki ta'], [5, 'Fives: ta di ki na tom'], [7, 'Sevens: ta ki ta ta ka di mi']].map(([v, t]) => ({ value: String(v), text: t })), String(st.group), v => { st.group = +v; drawSyl(-1); });
        function drawSyl(on) {
          syl.innerHTML = '';
          const g = KONNAKOL[st.group];
          const total = st.group === 4 ? 16 : st.group * 4; // cycle until the group lands back on the beat
          for (let i = 0; i < total; i++) syl.append(h('span', { class: 'syl' + (i % st.group === 0 ? ' acc' : '') + (i % 4 === 0 ? ' beat' : '') + (i === on ? ' on' : ''), text: g[i % st.group] }));
        }
        drawSyl(-1);
        card.append(h('h2', { text: 'Konnakol: say and clap' }),
          h('p', { text: 'Clap on every click (the beat). Speak four syllables per beat, and accent the first syllable of each group. With groups of 3, 5 or 7 the accents drift across the beats and land back on beat 1 at the end of the cycle.' }),
          h('div', { class: 'formgrid' }, sel), syl,
          clickRow(st, () => {
            A.ensure();
            const total = st.group === 4 ? 16 : st.group * 4;
            loop = A.Loop({ steps: total, stepDur: () => 60 / st.bpm / 4,
              onStep: (i, t) => { if (i % 4 === 0) A.hit(i === 0 ? 'clickHi' : 'click', t, 0.9); if (i % st.group === 0) A.hit('high', t, 0.5); },
              onVisual: i => drawSyl(i) });
            loop.start(); ctx.setActive(true);
          }, () => drawSyl(-1)),
          h('p', { class: 'small muted', text: 'Carnatic drummers learn every rhythm by voice first. Once you can say it, playing it on the guitar is easy.' }));
      } else if (drill === 'visualise') {
        const p = ctx.params || {};
        const scales = warmScales().filter(x => x.tier <= 3);
        let sc = scaleOf(p.scale && scales.find(x => x.id === p.scale) ? p.scale : scales[Math.floor(Math.random() * scales.length)].id);
        let tonic = p.tonic ?? Math.floor(Math.random() * 12), start = 0;
        const st = { bpm: 60 };
        const prompt = h('div', { class: 'prompt' });
        const fb = Fretboard({});
        const fbWrap = h('div', { hidden: true }, fb.el);
        const pick = () => {
          const f = ((tonic - 4) % 12 + 12) % 12; start = Math.max(0, f - 1);
          prompt.textContent = spell(tonic, keyPrefersFlats(tonic, sc.steps[2] === 3)) + ' ' + sc.name + ', frets ' + start + '–' + (start + 4);
          const notes = positionNotes(sc.steps, tonic, start);
          fb.mark(notes.map(n => ({ s: n.s, f: n.f, kind: n.deg === 0 ? 'root' : 'tone', label: degreeLabel(n.deg) })));
          fbWrap.hidden = true;
        };
        pick();
        card.append(h('h2', { text: 'See the neck in your head' }), prompt,
          h('p', { text: 'Close your eyes. Picture the neck and "play" this scale in position, one note per click, up and down. Say each note name or degree under your breath. Then reveal it and check where you went wrong.' }),
          clickRow(st, () => { A.ensure(); loop = A.Loop({ steps: 4, stepDur: () => 60 / st.bpm, onStep: (i, t) => A.hit(i === 0 ? 'clickHi' : 'click', t, 0.8) }); loop.start(); ctx.setActive(true); }),
          h('div', { class: 'row' }, h('button', { class: 'btn brass', onclick: () => { fbWrap.hidden = !fbWrap.hidden; } }, 'Reveal / hide'),
            h('button', { class: 'btn ghost', onclick: () => { sc = scaleOf(scales[Math.floor(Math.random() * scales.length)].id); tonic = Math.floor(Math.random() * 12); pick(); } }, 'New scale')),
          fbWrap,
          h('p', { class: 'small muted', text: 'Mental practice works: players who rehearse in their heads keep much of their progress. Do the same with a piece you are learning.' }));
      } else {
        // sing the degrees over a drone
        const pool = D.DEGREES.filter(x => x.tier <= 3);
        let tonic = 48 + Math.floor(Math.random() * 7), cur = null, n = 0;
        const prompt = h('div', { class: 'prompt' }), sub = h('p', { class: 'small muted' });
        const next = () => { cur = pool[Math.floor(Math.random() * pool.length)]; n++; prompt.textContent = 'Sing ' + cur.id + ' (' + cur.solf + ' / ' + cur.sargam + ')'; sub.textContent = 'Round ' + n + '. Hold the note, then check it.'; };
        const droneBtn = h('button', { class: 'btn' }, 'Start drone');
        droneBtn.onclick = () => { A.ensure(); if (drone) { drone.stop(); drone = null; droneBtn.textContent = 'Start drone'; ctx.setActive(false); } else { drone = A.Drone(tonic); drone.start(); droneBtn.textContent = 'Stop drone'; ctx.setActive(true); } };
        next();
        card.append(h('h2', { text: 'Sing the degrees' }),
          h('p', { text: 'A drone holds the tonic (Sa, Do, 1). Sing the degree shown, hold it against the drone, then tap Check to hear the right note. Sing quietly; humming is fine.' }),
          droneBtn, prompt, sub,
          h('div', { class: 'row' },
            h('button', { class: 'btn primary', onclick: () => { A.ensure(); A.note(tonic + 12 + cur.semi, A.now() + 0.02, 0.8, 1.6); } }, '▶ Check'),
            h('button', { class: 'btn brass', onclick: next }, 'Next degree →')),
          h('p', { class: 'small muted', text: 'Singing builds the same inner ear that lets you play what you hear.' }));
      }
    }
    drawSeg(); show();
    return () => stopAll();
  }
});
