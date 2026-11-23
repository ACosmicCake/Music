/* World Woodshed — the chord and scale identifier: the fretboard first, and what the notes could be under it.
   Tap notes on the neck (tap one again to take it away) or play them into the mic, and every chord and scale
   that holds them is listed, nearest first, narrowing with each note (src/identify.js). Pick one to see its
   notes, the notes it still needs (faint on the neck) and how it is used (src/content/usage.js for chords and
   the core scales, the card's own note for the rest of the library). Used by Name it's Neck (src/ui/nameit.js)
   and the Find a scale or chord page (tool scalefinder, src/tools/scales.js). */
import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import Mic from '../listen.js';
import { h, Fretboard, openTool, ui } from './core.js';
import { MicToggle } from './mic.js';
import { keepAwake } from '../native.js';
import { spell, keyPrefersFlats, degreeLabel } from '../theory.js';
import { voicing } from '../voicings.js';
import { nameChord, ChordEar } from '../chordid.js';
import { chordsWith, scalesWith, pcsOf } from '../identify.js';
import { libraryCards, finderList, buildLibrary, neckSpots, microName } from '../scalelib.js';
import { loadScaleLib } from '../content/lazy.js';
import { stylePage } from '../tools/learn.js';
import '../tools/whatis.css';
import './identify.css';

const mod12 = x => ((x % 12) + 12) % 12;
const near = (a, b) => Math.abs(mod12(a - b + 6) - 6) < 0.01;
const minorish = steps => steps.includes(3) && !steps.includes(4);
const flatsFor = (t, steps) => keyPrefersFlats(t, minorish(steps));
const noteName = (tonic, x, flats) => microName(tonic + x, p => spell(p, flats));
const degName = x => (Number.isInteger(x) ? degreeLabel(mod12(x)) : Math.abs(x - Math.floor(x) - 0.5) < 0.01 ? degreeLabel(mod12(Math.ceil(x))) + '¼♭' : degreeLabel(mod12(Math.round(x))) + '~');
const scaleTitle = r => spell(r.tonic, flatsFor(r.tonic, r.scale.steps)) + ' ' + r.scale.name;
const KEY = 'ww-identify';
const PAGE = 40;

let USE = null;
const useLoad = import('../content/usage.js').then(m => { USE = m; });

/* opts: { mic: offer the mic too, tab(): 'chord' | 'scale', setTab(t), onChange() } */
export function Identifier(opts = {}) {
  const saved = (() => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } })();
  let tabLocal = saved.tab === 'scale' ? 'scale' : 'chord';
  const tab = () => (opts.tab ? opts.tab() : tabLocal);
  const setTab = t => { if (opts.setTab) opts.setTab(t); else { tabLocal = t; try { localStorage.setItem(KEY, JSON.stringify({ tab: t })); } catch (e) { /* private mode */ } } };
  const st = { notes: [], tonic: null, sel: null, more: {}, ear: 'notes' };   // notes: [{ midi, s, f }]
  const el = h('div', { class: 'id-wrap' });
  const head = h('div', { class: 'id-head' }), list = h('div', { class: 'id-out', 'aria-live': 'polite' });
  let scaleList = null;
  const scales = () => scaleList || (scaleList = finderList(D.SCALE_LIB ? libraryCards(D, E.state.myScales) : buildLibrary(D, null, E.state.myScales)));
  loadScaleLib().then(() => { scaleList = null; draw(); });
  useLoad.then(() => draw());

  // the mic: notes one by one are added; a strum puts the chord heard in place of the notes
  let offs = [], ear = null, lastT = -1;
  const stopEar = () => { offs.forEach(f => f()); offs = []; ear = null; };
  const startEar = () => {
    stopEar();
    if (st.ear === 'notes') offs.push(Mic.on('note', ev => { if (ev.t - lastT < 0.05) return; lastT = ev.t; if (!st.notes.some(n => near(n.midi, ev.midi))) add({ midi: ev.midi }); }));
    else {
      ear = ChordEar(Mic.sampleRate || A.ensure().sampleRate, { onChord: c => { st.notes = c.notes.map(m => ({ midi: m })); st.sel = null; draw(); } });
      offs.push(Mic.on('block', (b, t0) => ear && ear.push(b, t0)), Mic.on('onset', ev => ear && ear.strum(ev.t)));
    }
  };
  const mic = opts.mic ? MicToggle({ label: 'Listen through the mic', onLabel: 'Listening', hint: '', auto: false,
    onOn: () => { keepAwake(true, 'identify'); startEar(); draw(); }, onOff: () => { keepAwake(false, 'identify'); stopEar(); draw(); } }) : null;

  function add(n) { st.notes.push(n); if (st.notes.length > 48) st.notes.shift(); st.more = {}; draw(); }
  const fb = Fretboard({ label: 'Guitar neck: tap notes to add them, tap again to take one away', onTap: (si, f) => {
    const m = E.STRINGS[si].midi + f;
    A.ensure(); A.fresh(); A.note(m, A.now() + 0.01, 0.75, 1.2);
    const i = st.notes.findIndex(n => n.s === si && n.f === f);
    if (i >= 0) { st.notes.splice(i, 1); st.more = {}; draw(); } else add({ midi: m, s: si, f });
  } });
  el.append(head, h('div', { class: 'id-neck' }, fb.el), list);

  function playNotes(ms, strum) {
    A.ensure(); A.fresh();
    const t0 = A.now() + 0.04;
    if (strum) A.strum(ms.slice().sort((a, b) => a - b), t0, 0.65, 0.022, 2);
    else ms.forEach((m, i) => { const r = Math.round(m); A.note(r, t0 + i * 0.28, 0.72, 0.6, { detune: Math.round((m - r) * 100) }); });
  }

  function draw() {
    const pcs = pcsOf(st.notes);
    // above the neck: the notes so far, and what to do with them
    head.innerHTML = '';
    if (mic) head.append(h('div', { class: 'row id-mic' }, mic.el,
      mic.on ? h('div', { class: 'ni-seg' }, [['notes', 'Notes one by one'], ['chord', 'A strummed chord']].map(([k, t]) => h('button', { class: 'chip', 'aria-pressed': String(st.ear === k), onclick: () => { st.ear = k; startEar(); draw(); } }, t))) : null));
    head.append(h('div', { class: 'id-notes' },
      pcs.length ? h('div', { class: 'id-pcs' }, pcs.map(p => h('span', { class: 'id-pc', text: microName(p, q => D.NOTE_NAMES[q]) })))
        : h('p', { class: 'muted id-hint', text: 'Tap notes on the neck, one at a time. The chords and scales they could be show below and narrow as you add more. Tap a note again to take it away.' }),
      pcs.length ? h('div', { class: 'row id-acts' },
        h('button', { class: 'btn small', onclick: () => playNotes(st.notes.map(n => n.midi), false) }, '▶ Play'),
        h('button', { class: 'btn small ghost', onclick: () => playNotes(st.notes.filter(n => Number.isInteger(n.midi)).map(n => n.midi), true) }, 'Strum'),
        h('button', { class: 'btn small ghost', onclick: () => { st.notes.pop(); st.more = {}; draw(); } }, 'Undo'),
        h('button', { class: 'btn small ghost', onclick: () => { st.notes = []; st.sel = null; st.more = {}; draw(); } }, 'Clear')) : null));

    const chords = chordsWith(st.notes.map(n => n.midi));
    const exact = pcs.length >= 2 && pcs.length <= 7 && pcs.every(Number.isInteger) ? nameChord(st.notes.map(n => n.midi)) : [];
    const scs = scalesWith(st.notes, scales(), { tonic: st.tonic });
    const t = tab();
    list.innerHTML = '';
    if (!pcs.length) { fb.mark([]); opts.onChange && opts.onChange(); return; }
    list.append(h('div', { class: 'ni-seg id-tabs', role: 'tablist' },
      h('button', { class: 'chip', role: 'tab', 'aria-selected': String(t === 'chord'), 'aria-pressed': String(t === 'chord'), onclick: () => { setTab('chord'); draw(); } }, 'Chords · ' + (exact.length + chords.filter(c => !exact.some(x => x.root === c.root && x.q === c.q)).length)),
      h('button', { class: 'chip', role: 'tab', 'aria-selected': String(t === 'scale'), 'aria-pressed': String(t === 'scale'), onclick: () => { setTab('scale'); draw(); } }, 'Scales · ' + scs.length)));
    if (t === 'chord') drawChords(exact, chords, pcs); else drawScales(scs);
    opts.onChange && opts.onChange();
  }

  /* ---------- chords ---------- */
  function drawChords(exact, chords, pcs) {
    // what the notes are now (nameChord's names, with slashes and inversions), then what they could grow into
    const rest = chords.filter(c => !exact.some(x => x.root === c.root && x.q === c.q));
    const items = [...exact.map(c => ({ key: c.sym, exact: c })), ...rest.map(c => ({ key: c.sym, grow: c }))];
    if (!items.length) { list.append(h('p', { class: 'muted', text: pcs.some(p => !Number.isInteger(p)) ? 'A note between the frets: no chord holds it. See the scales.' : 'No chord the app knows holds all of these notes. Take one away, or see the scales.' })); markNeck(null); return; }
    const pick = items.find(x => st.sel && st.sel.kind === 'chord' && st.sel.key === x.key) || items[0];
    list.append(chordDetail(pick));
    const groups = [['It is', items.filter(x => x.exact)], ['Already there, another name', items.filter(x => x.grow && x.grow.complete)]];
    const byNeed = new Map();
    items.filter(x => x.grow && !x.grow.complete).forEach(x => { const n = Math.min(3, x.grow.need.length || 1); if (!byNeed.has(n)) byNeed.set(n, []); byNeed.get(n).push(x); });
    [...byNeed.keys()].sort().forEach(n => groups.push([n === 3 ? 'Add 3 notes or more' : 'Add ' + n + ' note' + (n > 1 ? 's' : ''), byNeed.get(n)]));
    groups.forEach(([title, xs], gi) => {
      if (!xs.length) return;
      const k = 'c' + gi, shown = xs.slice(0, st.more[k] || PAGE);
      list.append(h('div', { class: 'stack id-group' }, h('span', { class: 'eyebrow', text: title + ' (' + xs.length + ')' }),
        h('div', { class: 'chips' }, shown.map(x => h('button', { class: 'chip id-chip', 'aria-pressed': String(x === pick),
          title: x.exact ? x.exact.name : x.grow.name + (x.grow.need.length ? ': add ' + x.grow.need.map(n => n.name).join(', ') : ''),
          onclick: () => { st.sel = { kind: 'chord', key: x.key }; draw(); } },
          x.key, x.grow && x.grow.need.length ? h('span', { class: 'id-add', text: ' +' + x.grow.need.map(n => n.name).join(' ') }) : null))),
        xs.length > shown.length ? h('button', { class: 'btn small ghost', onclick: () => { st.more[k] = (st.more[k] || PAGE) + PAGE * 3; draw(); } }, 'Show more (' + (xs.length - shown.length) + ')') : null));
    });
  }
  function chordDetail(x) {
    const c = x.exact, g = x.grow, q = c ? c.q : g.q, root = c ? c.root : g.root;
    const tones = c ? c.tones.map(t => ({ name: t.name, deg: t.deg, have: t.heard, pc: t.pc })) : g.tones;
    const u = USE && USE.CHORD_USE[q];
    const need = tones.filter(t => !t.have);
    const card = h('div', { class: 'card id-detail' },
      h('div', { class: 'ni-head' }, h('div', { class: 'wi-big ni-big', text: x.key }),
        h('p', { class: 'wi-sub', text: (c ? c.name + (c.inversion ? ', ' + c.inversion : '') + (c.slash && !c.inversion ? ', over ' + D.NOTE_NAMES[c.bass] + ' in the bass' : '') : g.name) })),
      h('div', { class: 'wi-tones' }, tones.map(t => h('span', { class: 'wi-tone' + (t.have ? '' : ' off'), title: t.have ? null : 'add this note' }, h('b', { text: t.name }), h('span', { text: t.deg })))),
      need.length ? h('p', { class: 'small', text: (c ? 'Left out: ' : 'Add ') + need.map(t => t.name + ' (' + t.deg + ')').join(', ') + (c ? '. Guitarists often leave ' + (need.length > 1 ? 'them' : 'it') + ' out.' : ' to make it ' + x.key + '.') }) : null,
      u ? h('p', { class: 'id-use', text: u.use }) : null,
      u ? h('p', { class: 'small muted', text: 'Heard in: ' + u.styles + '.' }) : null,
      u && u.scales.length ? h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Scales over it' }),
        h('div', { class: 'chips' }, u.scales.map(id => { const sc = scales().find(s => s.id === id || (s.more || []).includes(id)) || (D.SCALES || []).find(s => s.id === id); return sc ? h('button', { class: 'chip', onclick: () => { st.sel = { kind: 'scale', key: sc.id + ':' + root }; st.tonic = null; setTab('scale'); draw(); } }, spell(root, flatsFor(root, sc.steps)) + ' ' + sc.name) : null; }))) : null,
      h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => {
        const T = c ? null : g.T, v = voicing(root, (T || { iv: tones.map(t => mod12(t.pc - root)) }).iv);
        playNotes(v ? v.frets.map((f, si) => (f === null || f < 0 ? null : E.STRINGS[si].midi + f)).filter(m => m !== null) : tones.map(t => 48 + t.pc), true);
      } }, '▶ Hear ' + x.key)));
    markNeck({ root, need: need.map(t => t.pc) });
    return card;
  }

  /* ---------- scales ---------- */
  function drawScales(scs) {
    const tonicSel = h('select', { 'aria-label': 'Home note', onchange: e => { st.tonic = e.target.value === '' ? null : +e.target.value; st.more = {}; draw(); } },
      h('option', { value: '', text: 'Home note: any' }), D.NOTE_NAMES.map((n, i) => h('option', { value: String(i), text: 'Home note: ' + n })));
    tonicSel.value = st.tonic === null ? '' : String(st.tonic);
    list.append(h('div', { class: 'row id-tools' }, tonicSel));
    if (!scs.length) { list.append(h('p', { class: 'muted', text: 'No scale in the library holds all of these notes' + (st.tonic !== null ? ' on that home note' : '') + '. Take one away, or make your own in My scales.' })); markNeck(null); return; }
    const key = r => r.scale.id + ':' + r.tonic;
    const pick = scs.find(r => st.sel && st.sel.kind === 'scale' && st.sel.key === key(r)) || scs[0];
    list.append(scaleDetail(pick));
    const by = new Map();
    scs.forEach(r => { const n = Math.min(3, r.extra.length); if (!by.has(n)) by.set(n, []); by.get(n).push(r); });
    [...by.keys()].sort().forEach(n => {
      const xs = by.get(n), k = 's' + n, shown = xs.slice(0, st.more[k] || PAGE);
      list.append(h('div', { class: 'stack id-group' }, h('span', { class: 'eyebrow', text: (n === 0 ? 'Exactly these notes' : n === 3 ? 'Add 3 notes or more' : 'Add ' + n + ' note' + (n > 1 ? 's' : '')) + ' (' + xs.length + ')' }),
        h('div', { class: 'wi-list id-list' }, shown.map(r => h('button', { class: 'wi-row' + (r === pick ? ' on' : ''), 'aria-pressed': String(r === pick), onclick: () => { st.sel = { kind: 'scale', key: key(r) }; draw(); } },
          h('b', { text: scaleTitle(r) }),
          h('span', { class: 'small muted', text: (r.scale.own ? 'Your scale' : r.scale.region || '') + (r.extra.length ? ' · add ' + r.extra.map(x => noteName(r.tonic, x, flatsFor(r.tonic, r.scale.steps))).join(' ') : '') })))),
        xs.length > shown.length ? h('button', { class: 'btn small ghost', onclick: () => { st.more[k] = (st.more[k] || PAGE) + PAGE * 3; draw(); } }, 'Show more (' + (xs.length - shown.length) + ')') : null));
    });
  }
  function scaleDetail(r) {
    const sc = r.scale, flats = flatsFor(r.tonic, sc.steps), use = USE && USE.SCALE_USE[sc.id];
    const regs = (sc.styles || []).map(id => (D.REGIONS || []).find(g => g.id === id)).filter(Boolean);
    const card = h('div', { class: 'card id-detail' },
      h('div', { class: 'ni-head' }, h('div', { class: 'wi-big ni-big', text: scaleTitle(r) }),
        (sc.aka || (sc.more || []).length) ? h('p', { class: 'wi-sub', text: [sc.aka, ...(sc.more || [])].filter(Boolean).join(' · ') }) : null),
      h('div', { class: 'wi-tones' }, sc.steps.map(x => h('span', { class: 'wi-tone' + (r.extra.some(e => near(e, x)) ? ' off' : '') }, h('b', { text: noteName(r.tonic, x, flats) }), h('span', { text: x === 0 ? 'home' : degName(x) })))),
      r.extra.length ? h('p', { class: 'small', text: 'Add ' + r.extra.map(x => noteName(r.tonic, x, flats)).join(', ') + ' to play the whole scale.' }) : null,
      use ? h('p', { class: 'id-use', text: use }) : null,
      sc.note ? h('p', { class: use ? 'small muted' : 'id-use', text: (sc.region ? sc.region + '. ' : '') + sc.note }) : null,
      regs.length ? h('div', { class: 'chips' }, regs.map(g => h('button', { class: 'chip', onclick: () => stylePage(g) }, g.name))) : null,
      h('div', { class: 'row' },
        h('button', { class: 'btn small', onclick: () => { const base = 48 + mod12(r.tonic), up = sc.steps.concat([12]); playNotes(up.concat(up.slice(0, -1).reverse()).map(x => base + x), false); } }, '▶ Hear it'),
        h('button', { class: 'btn small ghost', onclick: () => openTool('scale', { params: { id: sc.id, tonic: r.tonic }, returnTab: ui.tab }) }, 'On the whole neck')));
    markNeck({ scale: r });
    return card;
  }

  /* the neck: the notes tapped, filled (the home note or root darker); what the pick still needs, faint */
  function markNeck(p) {
    const out = [];
    if (p && p.scale) neckSpots(p.scale.scale.steps, p.scale.tonic, E.STRINGS).forEach(m => { if (!st.notes.some(n => n.s === m.s && n.f === m.f)) out.push({ s: m.s, f: m.f, kind: 'tone faint' }); });
    if (p && p.need) E.STRINGS.forEach((s, si) => { for (let f = 0; f <= 12; f++) if (p.need.includes(mod12(s.midi + f))) out.push({ s: si, f, kind: 'tone faint', label: D.NOTE_NAMES[mod12(s.midi + f)] }); });
    const home = p ? (p.scale ? p.scale.tonic : p.root) : null;
    st.notes.forEach(n => { if (n.s !== undefined) out.push({ s: n.s, f: n.f, kind: home !== null && near(n.midi, home) ? 'root' : 'g3', label: microName(n.midi, q => D.NOTE_NAMES[q]) }); });
    fb.mark(out);
  }

  draw();
  return {
    el, draw,
    /* notes from elsewhere (a chord heard, frets tapped in another view): [{ midi, s?, f? }] */
    setNotes(ns) { st.notes = ns.slice(); st.sel = null; st.more = {}; draw(); },
    get notes() { return st.notes.slice(); },
    cleanup() { stopEar(); keepAwake(false, 'identify'); if (mic) mic.cleanup(); }
  };
}
