/* Fret calculator (tool 'frets', Train → Guitar): where the frets go for any system in src/xen.js on your
   scale length, as a table, a full-size PDF template (src/fretpdf.js) and a CSV. The system is the tuner's
   (settings.xen); your own systems (equal steps of any interval, just ratios, Scala files) are kept in
   settings.xen.mine; the guitar in settings.frets: { len (mm), unit, count, paper }. Not practice time. */
import E from '../engine.js';
import { h, tool, openTool, toast } from '../ui/core.js';
import { selectEl, systemOptions, sysLine } from './practice.js';
import { systemOf, build, specKey, fretTable, stepName, nearStandard, tightest, lenText, fretCsv, MM_PER_IN, stdText } from '../xen.js';
import { fretPdf } from '../fretpdf.js';
import { openBlob } from '../native.js';

const LENGTHS = [[645, 'Steel-string, 25.4″ (645 mm)'], [629, 'Short scale, 24.75″ (629 mm)'], [650, 'Classical, 650 mm']];
const SNAP = 3; // mm: a standard fret this near is worth naming, for zip ties over old frets
const TIGHT = 6; // mm: frets closer than this are hard to play and to fit

tool('frets', {
  tab: 'train', skill: null, noTime: true, title: 'Fret calculator', eyebrow: 'Refret',
  desc: 'Where the frets go for Bohlen-Pierce, other equal divisions, just ratios or a Scala file on your scale length: a table, a full-size template to print, and a CSV.',
  render(body) {
    const xs = () => E.state.settings.xen || {};
    const saveXen = patch => E.setSetting('xen', Object.assign({}, xs(), patch));
    const g0 = Object.assign({ len: 645, unit: 'mm', count: 20, paper: 'a4' }, E.state.settings.frets || {});
    const g = { len: g0.len >= 100 && g0.len <= 1500 ? +g0.len : 645, unit: g0.unit === 'in' ? 'in' : 'mm', count: Math.max(1, Math.min(36, Math.round(+g0.count) || 20)), paper: g0.paper === 'letter' ? 'letter' : 'a4' };
    const keep = () => E.setSetting('frets', Object.assign({}, g));
    let sys = systemOf(xs().sys, xs().mine), make = 'ed';
    const sysCard = h('div', { class: 'card' }), gtrCard = h('div', { class: 'card' }), tblCard = h('div', { class: 'card' }), outCard = h('div', { class: 'card' });
    body.append(sysCard, gtrCard, tblCard, outCard);
    const name = k => stepName(sys, k).name;
    // the standard note a fret sounds on the low string (tuned to the tuner's root, E2 unless changed)
    const lowRoot = () => { const r = +xs().root; return r >= 24 && r <= 60 ? r : 40; };
    const onLow = r => stdText(lowRoot() + r.cents / 100);
    const u = () => g.unit === 'in' ? 'in' : 'mm';

    function drawSys() {
      sysCard.innerHTML = '';
      const steps = h('div', { class: 'chips fr-steps' }, sys.steps.map((c, m) => h('span', { class: 'chip', text: (sys.names ? sys.names[m] + ' ' : m + ' · ') + Math.round(c) + '¢' })));
      sysCard.append(...[h('h3', { text: 'Tuning system' }),
        selectEl('fr-sys', 'System', systemOptions(xs().mine), sys.id, v => { saveXen({ sys: v }); sys = systemOf(v, xs().mine); drawAll(); }),
        h('p', { class: 'small muted', text: sysLine(sys) }), steps,
        sys.mine ? h('div', { class: 'row' }, h('button', { class: 'btn small ghost', type: 'button', onclick: () => {
          saveXen({ mine: (xs().mine || []).filter(m => m.id !== sys.id), sys: 'edo12' }); sys = systemOf('edo12'); toast('Deleted'); drawAll();
        } }, 'Delete ' + sys.name)) : null,
        makeYourOwn(),
        h('div', { class: 'row' }, h('button', { class: 'btn small ghost', type: 'button', onclick: () => openTool('tuner', { returnTab: 'train' }) }, 'Tune the strings for it'))].filter(Boolean));
    }
    function makeYourOwn() {
      const d = h('details', { class: 'fr-make' }, h('summary', { text: 'Make your own system' }));
      const seg = h('div', { class: 'seg' }, [['ed', 'Equal steps'], ['ji', 'Ratios'], ['scl', 'Scala file']].map(([k, t]) => h('button', { type: 'button', 'aria-pressed': String(make === k), onclick: () => { make = k; const o = d.open; drawSys(); sysCard.querySelector('.fr-make').open = o; } }, t)));
      const err = h('p', { class: 'small fr-err', 'aria-live': 'polite' });
      const nameIn = h('input', { type: 'text', placeholder: 'Name (optional)', 'aria-label': 'Name', maxlength: 60 });
      let form, read;
      if (make === 'ed') {
        const n = h('input', { type: 'number', min: 1, max: 200, value: 13, 'aria-label': 'Number of steps', class: 'fr-num' });
        const of = h('input', { type: 'text', value: '3/1', 'aria-label': 'Interval divided', class: 'fr-num' });
        form = h('div', { class: 'row' }, n, h('span', { text: 'equal steps of' }), of, h('span', { class: 'small muted', text: '2/1 an octave, 3/1 a tritave, 3/2 a fifth, or cents' }));
        read = () => ({ kind: 'ed', n: +n.value, of: of.value.trim() });
      } else if (make === 'ji') {
        const ta = h('textarea', { rows: 3, 'aria-label': 'Ratios', placeholder: '9/8 5/4 4/3 3/2 5/3 15/8' });
        const of = h('input', { type: 'text', value: '2/1', 'aria-label': 'Period', class: 'fr-num' });
        form = h('div', { class: 'stack' }, ta, h('div', { class: 'row' }, h('span', { text: 'repeating every' }), of, h('span', { class: 'small muted', text: 'Ratios above the open string (1/1 is added), or cents with a dot' })));
        read = () => ({ kind: 'ji', ratios: ta.value.trim(), of: of.value.trim() });
      } else {
        const ta = h('textarea', { rows: 5, 'aria-label': 'Scala file', placeholder: '! my.scl\nMy scale\n 3\n 9/8\n 5/4\n 2/1' });
        const file = h('input', { type: 'file', accept: '.scl,text/plain', 'aria-label': 'Load a Scala file' });
        file.onchange = async () => { const f = file.files && file.files[0]; if (!f) return; ta.value = (await f.text()).slice(0, 50000); };
        form = h('div', { class: 'stack' }, h('label', { class: 'small' }, 'Load a .scl file ', file), ta, h('p', { class: 'small muted', text: 'Thousands of scales come as Scala files; paste one or load it.' }));
        read = () => ({ kind: 'scl', text: ta.value });
      }
      const add = h('button', { class: 'btn small', type: 'button', onclick: () => {
        const spec = read(); if (nameIn.value.trim()) spec.name = nameIn.value.trim();
        const s = build(spec);
        if (s.error) { err.textContent = s.error; return; }
        spec.id = specKey(spec);
        if (!spec.name) spec.name = s.name;
        const mine = (xs().mine || []).filter(m => m.id !== spec.id).concat([spec]).slice(-30);
        saveXen({ mine, sys: spec.id }); sys = systemOf(spec.id, mine); toast('Added ' + sys.name); drawAll();
      } }, 'Add it');
      d.append(h('div', { class: 'stack' }, seg, form, nameIn, h('div', { class: 'row' }, add), err));
      return d;
    }
    function drawGuitar() {
      gtrCard.innerHTML = '';
      const val = g.unit === 'in' ? +(g.len / MM_PER_IN).toFixed(3) : +g.len.toFixed(1);
      const lenIn = h('input', { type: 'number', step: g.unit === 'in' ? 0.01 : 0.5, min: g.unit === 'in' ? 4 : 100, max: g.unit === 'in' ? 59 : 1500, value: val, 'aria-label': 'Scale length', class: 'fr-num' });
      lenIn.onchange = () => { const v = +lenIn.value * (g.unit === 'in' ? MM_PER_IN : 1); if (v >= 100 && v <= 1500) { g.len = v; keep(); drawTable(); } else lenIn.value = val; };
      const countIn = h('input', { type: 'number', min: 1, max: 36, value: g.count, 'aria-label': 'Frets', class: 'fr-num' });
      countIn.onchange = () => { const v = Math.round(+countIn.value); if (v >= 1 && v <= 36) { g.count = v; keep(); drawTable(); } else countIn.value = g.count; };
      gtrCard.append(h('h3', { text: 'Your guitar' }),
        h('div', { class: 'row' }, h('label', { class: 'stack field' }, h('span', { class: 'eyebrow', text: 'Scale length' }), h('span', { class: 'row' }, lenIn,
          h('span', { class: 'seg' }, [['mm', 'mm'], ['in', 'inches']].map(([k, t]) => h('button', { type: 'button', 'aria-pressed': String(g.unit === k), onclick: () => { g.unit = k; keep(); drawGuitar(); drawTable(); } }, t))))),
          h('label', { class: 'stack field' }, h('span', { class: 'eyebrow', text: 'Frets' }), countIn)),
        h('div', { class: 'chips' }, LENGTHS.map(([mm, t]) => h('button', { type: 'button', class: 'chip', 'aria-pressed': String(Math.abs(g.len - mm) < 0.3), onclick: () => { g.len = mm; keep(); drawGuitar(); drawTable(); } }, t))),
        h('p', { class: 'small muted', text: 'The scale length is the string’s vibrating length, nut to saddle, as the maker gives it. To check yours, measure from the nut to the middle of the 12th fret and double it.' }));
    }
    function drawTable() {
      tblCard.innerHTML = '';
      const t = fretTable(sys, g.len, g.count), tight = tightest(t);
      tblCard.append(h('h3', { text: 'Where the frets go' }),
        h('p', { class: 'small muted', text: 'From the front edge of the nut to the middle of each fret slot, in ' + (g.unit === 'in' ? 'inches' : 'mm') + '. Plain positions: no nut or saddle compensation.' }));
      if (tight && tight.gap < TIGHT) tblCard.append(h('p', { class: 'small fr-warn', text: 'Frets ' + (tight.fret - 1) + ' and ' + tight.fret + ' are only ' + lenText(tight.gap, u()) + ' ' + u() + ' apart: hard to play cleanly and to fit zip ties. Fewer frets may be better.' }));
      tblCard.append(h('div', { class: 'tablewrap' }, h('table', { class: 'fr-table mono' },
        h('thead', {}, h('tr', {}, ['Fret', 'Step', 'On low ' + stdText(lowRoot()), 'Cents', 'From nut', 'From last', 'Old fret'].map(c => h('th', { text: c })))),
        h('tbody', {}, t.map(r => { const ns = nearStandard(r.dist, g.len); return h('tr', { class: r.k % sys.steps.length === 0 ? 'fr-period' : null },
          h('td', { text: String(r.fret) }), h('td', { text: name(r.k) }), h('td', { text: onLow(r) }), h('td', { text: r.cents.toFixed(1) }),
          h('td', { text: lenText(r.dist, u()) }), h('td', { text: lenText(r.gap, u()) }),
          h('td', { text: Math.abs(ns.off) <= SNAP ? ns.fret + ' (' + (ns.off >= 0 ? '+' : '−') + lenText(Math.abs(ns.off), u()) + ')' : '—' })); })))),
        h('p', { class: 'small muted', text: 'Old fret: for zip ties on a guitar that keeps its frets, the standard fret within ' + SNAP + ' mm of this one and how far past it (+) or before it (−). The highlighted rows end a ' + (Math.abs(sys.period - 1200) < 0.01 ? 'octave' : 'period') + '.' }));
    }
    function lines() { return [sys.name + ': ' + sysLine(sys).split('. ')[0].replace(/\.$/, ''), 'Scale length ' + lenText(g.len, u()) + ' ' + u() + ', ' + g.count + ' frets']; }
    function drawOut() {
      outCard.innerHTML = '';
      outCard.append(h('h3', { text: 'Print and save' }),
        h('div', { class: 'row' }, h('span', { class: 'eyebrow', text: 'Paper' }), h('span', { class: 'seg' }, [['a4', 'A4'], ['letter', 'Letter']].map(([k, t]) => h('button', { type: 'button', 'aria-pressed': String(g.paper === k), onclick: () => { g.paper = k; keep(); drawOut(); } }, t)))),
        h('div', { class: 'row' },
          h('button', { class: 'btn', type: 'button', onclick: () => {
            const t = fretTable(sys, g.len, g.count);
            const bytes = fretPdf({ title: sys.name, lines: lines(), unit: g.unit, paper: g.paper,
              frets: t.map(r => ({ fret: r.fret, dist: r.dist, name: name(r.k), std: onLow(r) })),
              table: [['Fret', 'Step', 'On low ' + stdText(lowRoot()), 'Cents', 'From nut (' + u() + ')', 'From last (' + u() + ')'], ...t.map(r => [String(r.fret), name(r.k), onLow(r), r.cents.toFixed(1), lenText(r.dist, u()), lenText(r.gap, u())])] });
            openBlob(fileName('pdf'), new Blob([bytes], { type: 'application/pdf' }), 'Fret template');
          } }, 'Full-size template (PDF)'),
          h('button', { class: 'btn ghost', type: 'button', onclick: () => openBlob(fileName('csv'), new Blob([fretCsv(sys, fretTable(sys, g.len, g.count), g.unit, name, onLow)], { type: 'text/csv' }), 'Fret table') }, 'Table (CSV)')),
        h('p', { class: 'small muted', text: 'Print the template at 100% (Actual size, not Fit to page) and check the 100 mm bar on each page with a ruler. Cut along the dashed line and lay each page over the one before so the fret lines meet, then tape the strip to the fingerboard with its nut line on the nut’s front edge and mark or saw at each line.' }));
    }
    const fileName = ext => 'frets ' + sys.name.replace(/[^\w\- ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ' + Math.round(g.len) + 'mm.' + ext;
    function drawAll() { drawSys(); drawGuitar(); drawTable(); drawOut(); }
    drawAll();
  }
});
