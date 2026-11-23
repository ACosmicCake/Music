/* World Woodshed — Learn → Scales: the scale library, the finder and your own scales.
   The library (src/scalelib.js over src/content/scales-lib.js, loaded on demand) lists about 270 scales from
   every tradition the app knows; each opens on the whole neck in any key, with notes between the frets drawn as
   diamonds (a microtone, for a guitar with extra frets or a bend). The finder names the chords and scales in
   notes tapped on the neck or played into the mic. My scales keeps your own, made by tapping or typing steps;
   they sync, and the explorer and the Scale warm-up offer them too. */
import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import { h, s, tool, openTool, Fretboard, toast } from '../ui/core.js';
import { spell, keyPrefersFlats, degreeLabel, diatonicChords, prettySym } from '../theory.js';
import { guitarMidis } from '../voicings.js';
import { libraryCards, filterCards, parseSteps, stepsText, toggleStep, listOwn, cleanScale, neckSpots, microName, stepWords, isMicro, normSteps, pcKey } from '../scalelib.js';
import { loadScaleLib, drawWhenLoaded } from '../content/lazy.js';
import { stylePage } from './learn.js';
import { Identifier } from '../ui/identify.js';
import './scales.css';

const mod12 = x => ((x % 12) + 12) % 12;
const cards = () => libraryCards(D, E.state.myScales);
const byId = id => cards().find(c => c.id === id) || null;
const famName = id => (id === 'mine' ? 'My scales' : ((D.SCALE_LIB.FAMILIES.find(f => f[0] === id) || [])[1] || id));
const minorish = steps => steps.includes(3) && !steps.includes(4);
const flatsFor = (tonic, steps) => keyPrefersFlats(tonic, minorish(steps));
/* note names and interval labels that cope with notes between the frets */
const noteName = (tonic, x, flats) => microName(tonic + x, p => spell(p, flats));
function degName(x) {
  const fr = Math.round((x - Math.floor(x)) * 100) / 100;
  if (!fr) return degreeLabel(mod12(x));
  if (Math.abs(fr - 0.5) < 0.01) return degreeLabel(mod12(Math.ceil(x))) + '¼♭';
  const n = Math.round(x), c = Math.round((x - n) * 100);
  return degreeLabel(mod12(n)) + (c > 0 ? '+' : '−') + Math.abs(c) + '¢';
}
/* a pitch (MIDI, may be fractional) on the guitar sound */
function sound(m, t, vel = 0.75, dur = 0.6) {
  const n = Math.round(m);
  A.note(n, t, vel, dur, { detune: Math.round((m - n) * 100) });
}
function playScale(steps, tonic) {
  A.ensure(); A.fresh();
  const base = 48 + mod12(tonic), t0 = A.now() + 0.05;
  const up = steps.concat([12]), seq = up.concat(up.slice(0, -1).reverse());
  seq.forEach((x, i) => sound(base + x, t0 + i * 0.28));
}
/* A small round picture of a scale: twelve places round a clock, its notes as dots, the home note filled,
   a note between two places drawn between them */
export function dial(steps, size = 38) {
  const r = 14, c = 19;
  const svg = s('svg', { viewBox: '0 0 38 38', width: size, height: size, class: 'sc-dial', 'aria-hidden': 'true' });
  svg.append(s('circle', { cx: c, cy: c, r, class: 'ring' }));
  for (let i = 0; i < 12; i++) { const a = i / 12 * 2 * Math.PI; svg.append(s('circle', { cx: c + r * Math.sin(a), cy: c - r * Math.cos(a), r: 1.3, class: 'tick' })); }
  steps.forEach(x => {
    const a = x / 12 * 2 * Math.PI;
    svg.append(s('circle', { cx: c + r * Math.sin(a), cy: c - r * Math.cos(a), r: x === 0 ? 3.6 : 3, class: x === 0 ? 'home' : isMicro([x]) ? 'micro' : 'note' }));
  });
  return svg;
}

/* ---------------- The library: Learn → Scales ---------------- */
const lst = { q: '', fam: 'all', n: 0 };
export function scalesIndex(view) {
  const own = listOwn(E.state.myScales).length;
  view.append(h('div', { class: 'tools sl-tools' },
    h('button', { class: 'tile', onclick: () => openTool('scalefinder', { returnTab: 'learn' }) },
      h('span', { class: 't-title', text: 'Find a scale or chord' }),
      h('span', { class: 't-desc', text: 'Tap notes on the neck or play them into the mic: every chord and scale they could be, narrowing as you add notes.' })),
    h('button', { class: 'tile', onclick: () => openTool('myscales', { returnTab: 'learn' }) },
      h('span', { class: 't-title', text: 'My scales' + (own ? ' (' + own + ')' : '') }),
      h('span', { class: 't-desc', text: 'Make your own: tap the notes on the neck or type the steps. Quarter tones too.' }))));
  const box = h('div', { class: 'stack' });
  view.append(box);
  drawWhenLoaded(loadScaleLib, box, () => libraryList(box));
}
function libraryList(box) {
  const all = cards();
  const search = h('input', { type: 'search', class: 'search', placeholder: 'Search ' + all.length + ' scales: names, ragas, maqamat, places…', 'aria-label': 'Search scales', value: lst.q });
  const famChips = h('div', { class: 'chips' }), nChips = h('div', { class: 'chips' });
  const count = h('p', { class: 'small muted' });
  const list = h('div', { class: 'sl-list' });
  box.append(search, famChips, h('div', { class: 'spread sl-nrow' }, h('span', { class: 'eyebrow', text: 'Notes' }), nChips), count, list);
  const fams = [['all', 'All']].concat(listOwn(E.state.myScales).length ? [['mine', 'My scales']] : [], D.SCALE_LIB.FAMILIES, [['micro', 'Microtonal']]);
  function chips() {
    famChips.innerHTML = ''; nChips.innerHTML = '';
    fams.forEach(([k, t]) => famChips.append(h('button', { class: 'chip', 'aria-pressed': String(lst.fam === k), onclick: () => { lst.fam = k; chips(); draw(); } }, t)));
    [[0, 'Any'], [5, '5'], [6, '6'], [7, '7'], [8, '8+']].forEach(([k, t]) => nChips.append(h('button', { class: 'chip', 'aria-pressed': String(lst.n === k), onclick: () => { lst.n = k; chips(); draw(); } }, t)));
  }
  function row(c) {
    const same = c.same && all.find(x => x.id === c.same);
    return h('button', { class: 'sl-row', onclick: () => openTool('scale', { params: { id: c.id }, returnTab: 'learn' }) },
      dial(c.steps),
      h('span', { class: 'sl-text' }, h('b', { text: c.name }),
        h('span', { class: 'small muted', text: same ? 'Same notes as ' + same.name : [c.aka, c.region].filter(Boolean).join(' · ') })),
      h('span', { class: 'sl-meta mono small' }, String(c.steps.length), c.micro ? h('span', { class: 'sl-micro', title: 'Microtonal: notes between the frets', text: '¼' }) : null));
  }
  function draw() {
    const found = filterCards(all, lst);
    count.textContent = found.length === all.length ? all.length + ' scales' : found.length + ' of ' + all.length + ' scales';
    list.innerHTML = '';
    if (!found.length) { list.append(h('p', { class: 'muted', text: 'No scale matches. Try fewer words, or make it yourself in My scales.' })); return; }
    // with no search, the whole library goes under headings by family (a scale under its first one)
    if (lst.fam === 'all' && !lst.q) {
      ['mine'].concat(D.SCALE_LIB.FAMILIES.map(f => f[0])).forEach(f => {
        const g = found.filter(c => c.fam[0] === f);
        if (g.length) list.append(h('h3', { class: 'sl-head', text: famName(f) + ' · ' + g.length }), ...g.map(row));
      });
    } else list.append(...found.map(row));
  }
  let t = null;
  search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { lst.q = search.value.trim(); draw(); }, 120); });
  chips(); draw();
}

/* ---------------- One scale on the whole neck ---------------- */
tool('scale', {
  tab: 'learn', skill: null, title: 'Scale', eyebrow: 'Scale library',
  desc: 'One scale in any key, on the whole neck. Notes between the frets are drawn as diamonds.',
  render(body, ctx) {
    return drawWhenLoaded(loadScaleLib, body, () => scalePage(body, ctx.params || {}));
  }
});
function scalePage(body, p) {
  const sc = byId(p.id);
  if (!sc) { body.append(h('div', { class: 'card' }, h('p', { class: 'muted', text: 'This scale isn’t in the library on this device (it may have been deleted).' }))); return; }
  const st = { tonic: p.tonic ?? (sc.own ? sc.tonic : (E.state.settings.scaleLibKey ?? 0)), labels: 'deg', sev: false };
  const card = h('div', { class: 'card' }), chordsCard = h('div', { class: 'card' });
  body.append(card, chordsCard);
  const fb = Fretboard({ label: sc.name + ' on the neck', onTap: (si, f) => { A.ensure(); A.fresh(); sound(E.STRINGS[si].midi + f, A.now() + 0.01, 0.8, 1.2); } });
  const all = cards();
  function draw() {
    const flats = flatsFor(st.tonic, sc.steps);
    const same = sc.same && all.find(x => x.id === sc.same);
    const also = (sc.also || []).concat(sc.more || []);
    const regs = (sc.styles || []).map(id => D.REGIONS.find(g => g.id === id)).filter(Boolean);
    card.innerHTML = '';
    card.append(...[
      h('span', { class: 'eyebrow', text: sc.fam.map(famName).join(' · ') + (sc.region && sc.region !== 'Yours' ? ' · ' + sc.region : '') }),
      h('h2', { text: spell(st.tonic, flats) + ' ' + sc.name }),
      sc.aka && !sc.own ? h('p', { class: 'small muted', text: sc.aka }) : null,
      same ? h('p', { class: 'small' }, 'Same notes as ', h('button', { class: 'linkbtn', onclick: () => openTool('scale', { params: { id: same.id, tonic: st.tonic }, returnTab: 'learn' }) }, same.name), '.') : null,
      also.length ? h('p', { class: 'small muted', text: 'Also known as: ' + [...new Set(also)].join(' · ') }) : null,
      h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Key' }),
        h('div', { class: 'chips' }, D.NOTE_NAMES.map((n, i) => h('button', { class: 'chip', 'aria-pressed': String(i === st.tonic), onclick: () => { st.tonic = i; if (!sc.own) E.setSetting('scaleLibKey', i); draw(); } }, n)))),
      h('div', { class: 'kv' },
        h('span', { class: 'muted', text: 'Notes' }), h('b', { class: 'mono', text: sc.steps.map(x => noteName(st.tonic, x, flats)).join('  ') }),
        h('span', { class: 'muted', text: 'Formula' }), h('span', { class: 'mono', text: sc.steps.map(degName).join(' ') }),
        h('span', { class: 'muted', text: 'Steps' }), h('span', { class: 'mono', text: stepWords(sc.steps) + '  (' + stepsText(sc.steps) + ')' })),
      sc.note ? h('p', { class: 'small', text: sc.note }) : null,
      sc.micro ? h('p', { class: 'small sc-microhint', text: '◆ Diamonds sit between the frets: microtones, off the twelve notes. With an extra fret there (a custom fret job) you can play them as written; on a standard neck, bend up from the fret below or slide into them.' }) : null,
      regs.length ? h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Heard in' }), h('div', { class: 'chips' }, regs.map(g => h('button', { class: 'chip', onclick: () => stylePage(g) }, g.name)))) : null,
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', onclick: () => playScale(sc.steps, st.tonic) }, '▶ Play'),
        h('div', { class: 'seg' }, [['deg', 'Intervals'], ['name', 'Notes']].map(([k, t]) => h('button', { 'aria-pressed': String(st.labels === k), onclick: () => { st.labels = k; draw(); } }, t)))),
      fb.el,
      h('div', { class: 'row' },
        !sc.micro ? h('button', { class: 'btn', onclick: () => openTool('scalewarm', { params: { scale: sc.id, tonic: st.tonic }, returnTab: 'learn' }) }, 'Warm up with it') : null,
        D.SCALES.some(x => x.id === sc.id) || sc.own ? h('button', { class: 'btn ghost', onclick: () => openTool('explorer', { params: { mode: 'scale', scale: sc.id, root: st.tonic }, returnTab: 'learn' }) }, 'Open in the explorer') : null,
        sc.own ? h('button', { class: 'btn ghost', onclick: () => openTool('myscales', { params: { edit: sc.id }, returnTab: 'learn' }) }, 'Edit') :
          h('button', { class: 'btn ghost', onclick: () => openTool('myscales', { params: { from: sc.id, tonic: st.tonic }, returnTab: 'learn' }) }, 'Make my own from this'))
    ].filter(Boolean));
    fb.mark(neckSpots(sc.steps, st.tonic, E.STRINGS).map(m => ({ s: m.s, f: m.f, kind: m.x === 0 ? 'root' : 'tone', label: st.labels === 'deg' ? (m.x === 0 ? 'R' : degName(m.x)) : noteName(st.tonic, m.x, flats) })));
    drawChords(flats);
  }
  function drawChords() {
    chordsCard.innerHTML = '';
    const dc = sc.steps.length === 7 && !sc.micro ? diatonicChords(sc.steps, st.tonic) : [];
    chordsCard.hidden = !dc.length;
    if (!dc.length) return;
    const seg = h('div', { class: 'seg' }, [[false, 'Triads'], [true, '7th chords']].map(([v, t]) => h('button', { 'aria-pressed': String(st.sev === v), onclick: () => { st.sev = v; drawChords(); } }, t)));
    chordsCard.append(h('div', { class: 'spread' }, h('h3', { text: 'Chords in this scale' }), seg),
      h('div', { class: 'dchords' }, dc.map(c => h('button', { class: 'dchord', onclick: () => { A.ensure(); A.fresh(); A.strum(guitarMidis(c.root, st.sev ? c.iv7 : c.iv), A.now() + 0.03, 0.65, 0.025, 1.8); } },
        h('span', { class: 'mono small', text: c.roman }), h('b', { text: prettySym(st.sev ? c.seventh : c.triad) })))));
  }
  draw();
}

/* ---------------- Find a scale or chord ---------------- */
tool('scalefinder', {
  tab: 'learn', skill: null, title: 'Find a scale or chord', eyebrow: 'Scale library',
  desc: 'Tap notes on the neck, or play them into the mic: every chord and scale they could be shows under the neck and narrows as you add notes, from every tradition in the library and your own scales, with how each is used.',
  render(body) { return drawWhenLoaded(loadScaleLib, body, () => finder(body)); }
});
/* the identifier (src/ui/identify.js): the neck first, every chord and scale the notes could be under it */
function finder(body) {
  const id = Identifier({ mic: true });
  body.append(id.el);
  return () => id.cleanup();
}

/* ---------------- My scales ---------------- */
tool('myscales', {
  tab: 'learn', skill: null, title: 'My scales', eyebrow: 'Scale library',
  desc: 'Your own scales: tap the notes on the neck or type the steps between them, quarter tones too. They sync to your other devices and show up in the library, the finder, the explorer and the Scale warm-up.',
  render(body, ctx) { return drawWhenLoaded(loadScaleLib, body, () => myScales(body, ctx.params || {})); }
});
function myScales(body, p) {
  let mode = p.edit || p.from ? 'edit' : 'list';
  let cleanup = null;
  function show() {
    if (cleanup) cleanup(); cleanup = null;
    body.innerHTML = '';
    if (mode === 'list') listView(); else cleanup = editor(p.edit ? E.state.myScales[p.edit] : null, p.from ? byId(p.from) : null);
  }
  function listView() {
    const own = listOwn(E.state.myScales);
    const card = h('div', { class: 'card' });
    body.append(card);
    card.append(h('div', { class: 'spread' }, h('h2', { text: own.length ? 'Your scales' : 'No scales of your own yet' }),
      h('button', { class: 'btn primary', onclick: () => { p = {}; mode = 'edit'; show(); } }, '+ New scale')));
    if (!own.length) card.append(h('p', { class: 'muted', text: 'Make one by tapping its notes on the neck or typing the steps between them (2 2 1 2 2 2 1 is the major scale). Or open any scale in the library and choose Make my own from this.' }));
    own.forEach(o => {
      const flats = flatsFor(o.tonic, o.steps);
      let armed = false;
      const del = h('button', { class: 'btn ghost small' }, 'Delete');
      del.onclick = () => {
        if (!armed) { armed = true; del.textContent = 'Tap again to delete'; setTimeout(() => { armed = false; del.textContent = 'Delete'; }, 3000); return; }
        E.deleteScale(o.id); toast('Deleted ' + o.name); show();
      };
      card.append(h('div', { class: 'sl-own' }, dial(o.steps, 44),
        h('div', { class: 'sl-text' }, h('b', { text: o.name }), h('span', { class: 'small mono', text: o.steps.map(x => noteName(o.tonic, x, flats)).join(' ') }),
          o.note ? h('span', { class: 'small muted', text: o.note }) : null),
        h('div', { class: 'row' },
          h('button', { class: 'btn small', onclick: () => openTool('scale', { params: { id: o.id }, returnTab: 'learn' }) }, 'Open'),
          h('button', { class: 'btn ghost small', onclick: () => { p = { edit: o.id }; mode = 'edit'; show(); } }, 'Edit'), del)));
    });
  }
  function editor(old, from) {
    const o = old ? cleanScale(old) : null;
    const d = { name: o ? o.name : from ? from.name + ' (mine)' : '', tonic: o ? o.tonic : from ? (p.tonic ?? 0) : 0, steps: o ? o.steps : from ? normSteps(from.steps) : [0], note: o ? o.note : from && from.note ? from.note : '', how: 'tap', micro: !!(o && isMicro(o.steps)) || !!(from && from.micro) };
    let text = d.steps.length > 1 ? stepsText(d.steps) : '';
    const card = h('div', { class: 'card' }), prev = h('div', { class: 'stack' }), howBox = h('div', { class: 'stack' });
    body.append(card);
    const name = h('input', { type: 'text', maxlength: '80', placeholder: 'Its name', value: d.name, 'aria-label': 'Scale name' });
    name.addEventListener('input', () => { d.name = name.value; });
    const note = h('textarea', { rows: '3', maxlength: '2000', placeholder: 'Where it comes from, how it sounds, what to play it over (optional)', 'aria-label': 'Notes about the scale' });
    note.value = d.note;
    note.addEventListener('input', () => { d.note = note.value; });
    const fb = Fretboard({ label: 'Guitar neck: tap notes to add them to the scale or take them away', micro: () => d.micro, onTap: (si, f) => {
      const m = E.STRINGS[si].midi + f;
      A.ensure(); A.fresh(); sound(m, A.now() + 0.01, 0.75, 1.2);
      d.steps = toggleStep(d.steps, m - d.tonic); text = stepsText(d.steps); paint();
    } });
    const tonicChips = h('div', { class: 'chips' });
    function drawTonic() {
      tonicChips.innerHTML = '';
      D.NOTE_NAMES.forEach((n, i) => tonicChips.append(h('button', { class: 'chip', 'aria-pressed': String(i === d.tonic), onclick: () => { d.tonic = i; drawTonic(); paint(); } }, n)));
    }
    const stepsIn = h('input', { type: 'text', inputmode: 'text', class: 'mono', placeholder: '2 2 1 2 2 2 1', 'aria-label': 'Steps between the notes, in half steps', value: text });
    const err = h('p', { class: 'small sc-err', 'aria-live': 'polite' });
    stepsIn.addEventListener('input', () => {
      text = stepsIn.value;
      const r = parseSteps(text);
      err.textContent = r.error || '';
      if (r.steps) { d.steps = r.steps; paint(true); }
    });
    function drawHow() {
      howBox.innerHTML = '';
      howBox.append(h('div', { class: 'seg' }, [['tap', 'Tap the notes'], ['type', 'Type the steps']].map(([k, t]) => h('button', { 'aria-pressed': String(d.how === k), onclick: () => { d.how = k; if (k === 'type') stepsIn.value = text; drawHow(); } }, t))));
      if (d.how === 'tap') howBox.append(
        h('p', { class: 'small muted', text: 'Tap any place a note sits; the scale takes that note in every octave. Tap it again to take it out. The home note stays.' }),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: d.micro ? true : null, onchange: e => { d.micro = e.target.checked; } }), 'Quarter tones: a tap on a fret wire is the note between the frets'),
        fb.el);
      else howBox.append(
        h('p', { class: 'small muted', text: 'The steps between the notes in half steps, from the home note up: 2 2 1 2 2 2 1 is major. W and H work too, and 1.5 is three quarter tones. If they come short of an octave (12), the last step home is added for you.' }),
        stepsIn, err, fb.el);
    }
    function paint(fromTyping) {
      const flats = flatsFor(d.tonic, d.steps);
      if (!fromTyping && d.how === 'type') stepsIn.value = text;
      fb.mark(neckSpots(d.steps, d.tonic, E.STRINGS).map(m => ({ s: m.s, f: m.f, kind: m.x === 0 ? 'root' : 'tone', label: noteName(d.tonic, m.x, flats) })));
      const twin = d.steps.length > 1 && cards().find(c => !c.own && !c.same && pcKey(c.steps) === pcKey(d.steps));
      prev.innerHTML = '';
      prev.append(h('div', { class: 'kv' },
        h('span', { class: 'muted', text: 'Notes' }), h('b', { class: 'mono', text: d.steps.map(x => noteName(d.tonic, x, flats)).join('  ') }),
        h('span', { class: 'muted', text: 'Formula' }), h('span', { class: 'mono', text: d.steps.map(degName).join(' ') }),
        h('span', { class: 'muted', text: 'Steps' }), h('span', { class: 'mono', text: d.steps.length > 1 ? stepWords(d.steps) + '  (' + stepsText(d.steps) + ')' : '—' })),
        twin ? h('p', { class: 'small muted', text: 'The library has these notes as ' + twin.name + ((twin.also || []).length ? ' (also ' + twin.also.slice(0, 3).join(', ') + ')' : '') + '. Keep yours anyway if you like: your name and notes stay with it.' }) : '');
    }
    function save() {
      if (d.steps.length < 2) { toast('Add at least one note besides the home note.'); return; }
      const nm = d.name.trim() || 'My scale';
      const saved = E.saveScale(Object.assign({}, old || {}, { name: nm, steps: d.steps, tonic: d.tonic, note: d.note.trim() }));
      toast('Saved ' + nm);
      openTool('scale', { params: { id: saved.id }, returnTab: 'learn' });
    }
    card.append(h('h2', { text: old ? 'Edit ' + o.name : 'New scale' }),
      h('label', { class: 'stack field' }, h('span', { class: 'eyebrow', text: 'Name' }), name),
      h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Home note' }), tonicChips),
      howBox, prev,
      h('label', { class: 'stack field' }, h('span', { class: 'eyebrow', text: 'Notes' }), note),
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', onclick: save }, 'Save'),
        h('button', { class: 'btn', onclick: () => playScale(d.steps, d.tonic) }, '▶ Play'),
        h('button', { class: 'btn ghost', onclick: () => { p = {}; mode = 'list'; show(); } }, 'Cancel')));
    drawTonic(); drawHow(); paint();
    return null;
  }
  show();
  return () => { if (cleanup) cleanup(); };
}
