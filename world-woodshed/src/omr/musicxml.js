/* World Woodshed — a recognized score (src/omr/assemble.js buildScore) written as MusicXML, which MuseScore,
   alphaTab (the app's score player) and most notation apps open. Plain functions, tested in
   test/omr.test.js. */

import { encodeLayout, FIELD } from '../pagelayout.js';

const DIV = 24; // divisions per quarter: a 32nd is 3, an eighth of a triplet 8
const TYPES = [[4, 'whole'], [2, 'half'], [1, 'quarter'], [0.5, 'eighth'], [0.25, '16th'], [0.125, '32nd']];
const ACC = { '-2': 'flat-flat', '-1': 'flat', 0: 'natural', 1: 'sharp', 2: 'double-sharp' };
const CLEF = { G: ['G', 2], F: ['F', 4], C3: ['C', 3], C4: ['C', 4] };
const EPS = 1e-6;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));

/* A length in quarters as a written value: { type, dots } (before any triplet), or null */
export function valueOf(q) {
  for (const [L, type] of TYPES) {
    if (Math.abs(q - L) < EPS) return { type, dots: 0 };
    if (Math.abs(q - L * 1.5) < EPS) return { type, dots: 1 };
    if (Math.abs(q - L * 1.75) < EPS) return { type, dots: 2 };
  }
  return null;
}
/* A length no single value writes, as several (longest first); what is left under a 32nd is dropped */
export function splitQ(q) {
  const out = [];
  let r = q, guard = 0;
  while (r > 0.125 - EPS && guard++ < 32) {
    const L = TYPES.find(([v]) => v <= r + EPS)[0];
    out.push(L); r -= L;
  }
  return out;
}

/* Events as written: lengths no value writes are split (notes tied across the pieces) */
function written(ev) {
  const out = [];
  ev.forEach(e => {
    if (e.tuplet) { const v = valueOf(e.q * 1.5); if (v) { out.push(Object.assign({}, e, v, { base: e.q * 1.5 })); return; } }
    const v = valueOf(e.q);
    if (v) { out.push(Object.assign({}, e, v, { base: e.q, tuplet: null })); return; }
    const parts = splitQ(e.q);
    parts.forEach((L, i) => out.push(Object.assign({}, e, valueOf(L), { q: L, base: L, tuplet: null, full: false,
      tieStart: !e.rest && i < parts.length - 1, tieStop: !e.rest && i > 0, first: i === 0, last: i === parts.length - 1 })));
  });
  return out;
}

function miscOf(opts) {
  const f = [];
  if (opts.check && opts.check.length) f.push(`<miscellaneous-field name="ww-check-bars">${opts.check.map(Number).join(' ')}</miscellaneous-field>`);
  const lay = opts.layout ? encodeLayout(opts.layout, opts.pages) : '';
  if (lay) f.push(`<miscellaneous-field name="${FIELD}">${esc(lay)}</miscellaneous-field>`);
  return f.length ? `    <miscellaneous>${f.join('')}</miscellaneous>` : null;
}

/* opts: { title, composer, bpm, program (General MIDI, 1–128 as MusicXML counts), date } */
export function scoreToMusicXML(score, opts = {}) {
  const title = opts.title || score.title || 'Untitled';
  const bpm = Math.round(opts.bpm || score.bpm || 80);
  const timeAt = bi => (score.times && score.times[bi]) || score.time;
  const { num, den } = timeAt(0);
  const L = [];
  L.push('<?xml version="1.0" encoding="UTF-8" standalone="no"?>',
    '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">',
    '<score-partwise version="4.0">',
    `  <work><work-title>${esc(title)}</work-title></work>`,
    '  <identification>',
    opts.composer ? `    <creator type="composer">${esc(opts.composer)}</creator>` : null,
    `    <encoding><software>World Woodshed (score recognition)</software>${opts.date ? `<encoding-date>${esc(opts.date)}</encoding-date>` : ''}</encoding>`,
    // the bars that didn't add up when read, for the score viewer to point out
    // and where each bar sits on the page it was read from (src/pagelayout.js), for reading from the page itself
    miscOf(opts),
    '  </identification>',
    '  <part-list>');
  score.parts.forEach((p, pi) => {
    const id = 'P' + (pi + 1);
    const program = p.name === 'Piano' ? 1 : (opts.program || 25);
    L.push(`    <score-part id="${id}"><part-name>${esc(p.name)}</part-name>`,
      `      <score-instrument id="${id}-I1"><instrument-name>${esc(p.name)}</instrument-name></score-instrument>`,
      `      <midi-instrument id="${id}-I1"><midi-channel>${pi + 1}</midi-channel><midi-program>${program}</midi-program></midi-instrument>`,
      '    </score-part>');
  });
  L.push('  </part-list>');
  score.parts.forEach((p, pi) => {
    L.push(`  <part id="P${pi + 1}">`);
    p.bars.forEach((bar, bi) => {
      const pickup = bi === 0 && score.pickup;
      const tb = timeAt(bi), prev = bi ? timeAt(bi - 1) : null;
      const len = pickup ? score.pickup : tb.num * 4 / tb.den;
      L.push(`    <measure number="${pickup ? 0 : score.pickup ? bi : bi + 1}"${pickup ? ' implicit="yes"' : ''}>`);
      const reps = score.repeats || [];
      // first and second endings: [first bar, last bar, number]; one left and one right barline per bar
      const end = (score.endings || []).find(e => bi >= e[0] && bi <= e[1]);
      const endStart = end && end[0] === bi ? `<ending number="${end[2]}" type="start">${end[2]}.</ending>` : '';
      const endStop = end && end[1] === bi ? `<ending number="${end[2]}" type="${reps.some(r => r[1] === bi) || end[2] === 1 ? 'stop' : 'discontinue'}"/>` : '';
      const fwd = reps.some(r => r[0] === bi && bi > 0);
      if (fwd || endStart) L.push(`      <barline location="left">${fwd ? '<bar-style>heavy-light</bar-style>' : ''}${endStart}${fwd ? '<repeat direction="forward"/>' : ''}</barline>`);
      if (bi === 0) {
        L.push('      <attributes>', `        <divisions>${DIV}</divisions>`,
          `        <key><fifths>${score.fifths || 0}</fifths></key>`,
          `        <time${tb.symbol ? ` symbol="${tb.symbol}"` : ''}><beats>${num}</beats><beat-type>${den}</beat-type></time>`);
        if (p.staves.length > 1) L.push(`        <staves>${p.staves.length}</staves>`);
        p.staves.forEach((c, si) => {
          const [sign, line] = CLEF[c] || CLEF.G;
          L.push(`        <clef${p.staves.length > 1 ? ` number="${si + 1}"` : ''}><sign>${sign}</sign><line>${line}</line></clef>`);
        });
        L.push('      </attributes>');
        if (pi === 0) L.push(`      <direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${bpm}</per-minute></metronome></direction-type><sound tempo="${bpm}"/></direction>`);
      }
      // a time that changes from bar to bar
      if (bi > 0 && (tb.num !== prev.num || tb.den !== prev.den || tb.symbol !== prev.symbol)) L.push(`      <attributes><time${tb.symbol ? ` symbol="${tb.symbol}"` : ''}><beats>${tb.num}</beats><beat-type>${tb.den}</beat-type></time></attributes>`);
      let first = true;
      bar.forEach((voices, si) => voices.forEach((ev, vi) => {
        if (!first) L.push(`      <backup><duration>${Math.round(len * DIV)}</duration></backup>`);
        first = false;
        const voice = vi + 1; // alphaTab greys out any voice past the first on a staff, so each staff counts from 1
        let used = 0;
        written(ev).forEach(e => {
          const dur = Math.round((e.full ? len : e.q) * DIV);
          used += dur;
          const staff = p.staves.length > 1 ? `<staff>${si + 1}</staff>` : '';
          const tm = e.tuplet ? '<time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>' : '';
          const tupN = e.tuplet === 'start' ? '<tuplet type="start" bracket="yes"/>' : e.tuplet === 'stop' ? '<tuplet type="stop"/>' : '';
          if (e.rest) {
            const full = e.full;
            L.push(`      <note>${full ? '<rest measure="yes"/>' : '<rest/>'}<duration>${dur}</duration><voice>${voice}</voice>` +
              (full ? '' : `<type>${e.type}</type>${'<dot/>'.repeat(e.dots)}`) + tm + staff + (tupN ? `<notations>${tupN}</notations>` : '') + '</note>');
            return;
          }
          e.pitches.forEach((pt, k) => {
            // a note split to fit the bar is tied to itself; a tie read from the page starts on its last piece
            const stop = e.tieStop || (e.first !== false && pt.tieStop), start = e.tieStart || (e.last !== false && pt.tieStart);
            const ties = (stop ? '<tie type="stop"/>' : '') + (start ? '<tie type="start"/>' : '');
            const tied = (stop ? '<tied type="stop"/>' : '') + (start ? '<tied type="start"/>' : '');
            const nots = tied + (k === 0 ? tupN : '');
            L.push('      <note>' + (k ? '<chord/>' : '') +
              `<pitch><step>${pt.step}</step>${pt.alter ? `<alter>${pt.alter}</alter>` : ''}<octave>${pt.octave}</octave></pitch>` +
              `<duration>${dur}</duration>${ties}<voice>${voice}</voice><type>${e.type}</type>${'<dot/>'.repeat(e.dots)}` +
              (pt.acc != null && !stop ? `<accidental>${ACC[pt.acc]}</accidental>` : '') + tm + staff +
              (nots ? `<notations>${nots}</notations>` : '') + '</note>');
          });
        });
        // a voice shorter than the bar (it can't be after fitting, but a split may drop a hair): pad it
        const rest = Math.round(len * DIV) - used;
        if (rest > 0) L.push(`      <forward><duration>${rest}</duration></forward>`);
      }));
      if (reps.some(r => r[1] === bi)) L.push(`      <barline location="right"><bar-style>light-heavy</bar-style>${endStop}<repeat direction="backward"/></barline>`);
      else if (bi === p.bars.length - 1) L.push(`      <barline location="right"><bar-style>light-heavy</bar-style>${endStop}</barline>`);
      else if (endStop) L.push(`      <barline location="right">${endStop}</barline>`);
      L.push('    </measure>');
    });
    L.push('  </part>');
  });
  L.push('</score-partwise>', '');
  return L.filter(x => x !== null).join('\n');
}

