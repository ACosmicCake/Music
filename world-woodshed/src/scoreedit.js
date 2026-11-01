/* World Woodshed — fixing the notes of a score the app read from a page (src/omr/musicxml.js wrote it).
   Plain functions over the MusicXML text, tested in test/scoreedit.test.js.

   A "beat" is what alphaTab draws and lets you tap: one note, a chord (a note and the <chord/> notes after it)
   or a rest, found by part, measure, staff, voice and its place in that voice, as alphaTab counts them
   (all from 0). The recognizer writes one <note> per line and nothing nested in it, so the measures and notes
   are found by their tags; a score written by another program may not line up, so editing is offered only
   for the app's own readings. */

const TYPES = [['whole', 4], ['half', 2], ['quarter', 1], ['eighth', 0.5], ['16th', 0.25], ['32nd', 0.125]];
export const LENGTHS = TYPES.map(t => t[0]);
const STEPS = 'CDEFGAB';
const SHARP_ORDER = 'FCGDAEB';
const ACC = { '-2': 'flat-flat', '-1': 'flat', 0: 'natural', 1: 'sharp', 2: 'double-sharp' };

const tag = (s, name) => { const m = s.match(new RegExp('<' + name + '(?:\\s[^>]*)?>([^<]*)</' + name + '>')); return m ? m[1] : null; };
const num = (s, name, dflt) => { const v = Number(tag(s, name)); return Number.isFinite(v) && tag(s, name) !== null ? v : dflt; };

/* The parts' text ranges, each with its measures' ranges */
function layout(xml) {
  const parts = [];
  const partRe = /<part\s[^>]*>[\s\S]*?<\/part>/g;
  let pm;
  while ((pm = partRe.exec(xml))) {
    const measures = [];
    const mRe = /<measure\b[^>]*>[\s\S]*?<\/measure>/g;
    let mm;
    while ((mm = mRe.exec(pm[0]))) measures.push({ start: pm.index + mm.index, end: pm.index + mm.index + mm[0].length });
    parts.push({ start: pm.index, end: pm.index + pm[0].length, measures });
  }
  return parts;
}
/* The settings in force: divisions, key (fifths) and the bar length in quarters */
export function settings(xml) {
  const time = xml.match(/<time\b[^>]*>([\s\S]*?)<\/time>/);
  const beats = time ? num(time[1], 'beats', 4) : 4, type = time ? num(time[1], 'beat-type', 4) : 4;
  return { div: num(xml, 'divisions', 1), fifths: num(xml, 'fifths', 0), barQ: beats * 4 / type };
}
/* The beats of one measure: [{ staff, voice, index, notes: [{ start, end, text }] }] (offsets into the measure) */
function beatsOf(measure) {
  const out = [], count = {};
  const re = /<note>[\s\S]*?<\/note>/g;
  let m;
  while ((m = re.exec(measure))) {
    const text = m[0], chord = text.includes('<chord/>');
    const n = { start: m.index, end: m.index + text.length, text };
    if (chord && out.length) { out[out.length - 1].notes.push(n); continue; }
    const staff = num(text, 'staff', 1) - 1, voice = num(text, 'voice', 1) - 1, k = staff + ':' + voice;
    count[k] = (count[k] || 0);
    out.push({ staff, voice, index: count[k]++, notes: [n] });
  }
  return out;
}
function find(xml, at) {
  const part = layout(xml)[at.part || 0];
  const ms = part && part.measures[at.bar];
  if (!ms) return null;
  const measure = xml.slice(ms.start, ms.end);
  const beat = beatsOf(measure).find(b => b.staff === (at.staff || 0) && b.voice === (at.voice || 0) && b.index === at.beat);
  return beat ? { ms, measure, beat } : null;
}

/* ---------- reading a beat ---------- */
const keyAlter = (fifths, step) => (fifths > 0 && SHARP_ORDER.slice(0, fifths).includes(step) ? 1 : fifths < 0 && SHARP_ORDER.slice(7 + fifths).includes(step) ? -1 : 0);
function pitchOf(text) {
  const p = text.match(/<pitch>([\s\S]*?)<\/pitch>/);
  if (!p) return null;
  return { step: tag(p[1], 'step'), alter: num(p[1], 'alter', 0), octave: num(p[1], 'octave', 4) };
}
export const midiOf = p => (p ? 12 * (p.octave + 1) + [0, 2, 4, 5, 7, 9, 11][STEPS.indexOf(p.step)] + p.alter : null);
const NAME_ACC = { '-2': '𝄫', '-1': '♭', 0: '', 1: '♯', 2: '𝄪' };
export const pitchName = p => (p ? p.step + NAME_ACC[p.alter] + p.octave : '');

/* What a beat is: { rest, pitches: [{ step, alter, octave }], type, dots, tuplet } or null */
export function beatInfo(xml, at) {
  const f = find(xml, at);
  if (!f) return null;
  const first = f.beat.notes[0].text;
  return {
    rest: first.includes('<rest'), pitches: f.beat.notes.map(n => pitchOf(n.text)).filter(Boolean),
    type: tag(first, 'type') || (first.includes('measure="yes"') ? 'whole' : 'quarter'), dots: (first.match(/<dot\/>/g) || []).length,
    tuplet: first.includes('<time-modification>')
  };
}

/* ---------- changing a beat ---------- */
function setPitch(text, p, fifths) {
  const acc = p.alter !== keyAlter(fifths, p.step) ? `<accidental>${ACC[p.alter]}</accidental>` : '';
  const pitch = `<pitch><step>${p.step}</step>${p.alter ? `<alter>${p.alter}</alter>` : ''}<octave>${p.octave}</octave></pitch>`;
  return text.replace(/<pitch>[\s\S]*?<\/pitch>/, pitch).replace(/<accidental>[^<]*<\/accidental>/, '')
    .replace(/(<\/type>(?:<dot\/>)*)/, '$1' + acc);
}
/* a pitch moved by diatonic steps, taking the key's sharps or flats on its new line */
function moveStep(p, by, fifths) {
  let i = STEPS.indexOf(p.step) + by, octave = p.octave;
  while (i < 0) { i += 7; octave--; }
  while (i > 6) { i -= 7; octave++; }
  const step = STEPS[i];
  return { step, alter: keyAlter(fifths, step), octave };
}
const clampP = p => (p.octave < 0 || p.octave > 9 ? null : p);

/* The edits: each returns the new MusicXML, or the same text if it doesn't apply.
   op: 'up' | 'down' (a line or space), 'sharp' | 'flat' | 'natural', 'octUp' | 'octDown',
       { length: 'quarter', dots: 0 }, 'rest' (a note becomes a rest, or a rest a note on the middle line),
       'delete' (a note the reader saw that isn't there) */
export function editBeat(xml, at, op) {
  const f = find(xml, at);
  if (!f) return xml;
  const { div, fifths } = settings(xml);
  const notes = f.beat.notes;
  let texts = notes.map(n => n.text);
  const isRest = texts[0].includes('<rest');
  const pitchOp = fn => { if (isRest) return null; const out = texts.map(t => { const p = pitchOf(t), q = p && clampP(fn(p)); return q ? setPitch(t, q, fifths) : null; }); return out.every(Boolean) ? out : null; };
  let next = null, fill = [];
  if (op === 'up' || op === 'down') next = pitchOp(p => moveStep(p, op === 'up' ? 1 : -1, fifths));
  else if (op === 'sharp' || op === 'flat' || op === 'natural') next = pitchOp(p => Object.assign({}, p, { alter: op === 'sharp' ? 1 : op === 'flat' ? -1 : 0 }));
  else if (op === 'octUp' || op === 'octDown') next = pitchOp(p => Object.assign({}, p, { octave: p.octave + (op === 'octUp' ? 1 : -1) }));
  else if (op === 'delete') next = [];
  else if (op === 'rest') {
    const first = texts[0];
    if (isRest) {
      // a rest becomes a note on the middle line of a treble staff (B4), or of a bass staff (D3)
      const bass = /<clef[^>]*>\s*<sign>F<\/sign>/.test(xml) && num(first, 'staff', 1) === 2 || (/<clef[^>]*>\s*<sign>F<\/sign>/.test(xml) && !/<sign>G<\/sign>/.test(xml));
      const p = bass ? { step: 'D', alter: keyAlter(fifths, 'D'), octave: 3 } : { step: 'B', alter: keyAlter(fifths, 'B'), octave: 4 };
      let t = first.replace(/<rest[^>]*\/>|<rest[^>]*>[\s\S]*?<\/rest>/, `<pitch><step>${p.step}</step>${p.alter ? `<alter>${p.alter}</alter>` : ''}<octave>${p.octave}</octave></pitch>`);
      if (!/<type>/.test(t)) t = t.replace(/(<voice>[^<]*<\/voice>)/, '$1<type>whole</type>');
      next = [t];
    } else {
      // a note (or chord) becomes one rest of the same length: ties, accidentals and the chord's other notes go
      const t = first.replace(/<pitch>[\s\S]*?<\/pitch>/, '<rest/>').replace(/<tie [^>]*\/>/g, '').replace(/<tied [^>]*\/>/g, '')
        .replace(/<accidental>[^<]*<\/accidental>/, '').replace(/<notations><\/notations>/, '');
      next = [t];
    }
  } else if (op && typeof op === 'object' && op.length) {
    const L = TYPES.find(t => t[0] === op.length);
    if (L) {
      const dots = Math.max(0, Math.min(2, op.dots || 0));
      const q = L[1] * (dots === 1 ? 1.5 : dots === 2 ? 1.75 : 1) * (texts[0].includes('<time-modification>') ? 2 / 3 : 1);
      const d = Math.max(1, Math.round(q * div)), was = num(texts[0], 'duration', d);
      next = texts.map(t => {
        let x = t.replace(/<rest measure="yes"\/>/, '<rest/>').replace(/<duration>\d+<\/duration>/, `<duration>${d}</duration>`).replace(/<dot\/>/g, '');
        if (/<type>[^<]*<\/type>/.test(x)) x = x.replace(/<type>[^<]*<\/type>/, `<type>${op.length}</type>` + '<dot/>'.repeat(dots));
        else x = x.replace(/(<voice>[^<]*<\/voice>)/, `$1<type>${op.length}</type>` + '<dot/>'.repeat(dots));
        return x;
      });
      // made shorter: rests fill what it gave up, right after it, so the bar still adds up
      if (d < was && !texts[0].includes('<time-modification>')) fill = restsFor((was - d) / div, div, texts[0]);
    }
  }
  if (!next) return xml;
  if (fill.length && next.length) next[next.length - 1] += fill.map(r => '\n' + indentOf(f.measure, notes[0].start) + r).join('');
  // put the beat back: its first note's place takes the new text, the chord notes it no longer has go
  let measure = f.measure;
  for (let k = notes.length - 1; k >= 0; k--) {
    const rep = k < next.length ? next[k] : '';
    const end = rep === '' ? (measure.indexOf('\n', notes[k].end) >= 0 && /^\s*$/.test(measure.slice(notes[k].end, measure.indexOf('\n', notes[k].end))) ? measure.indexOf('\n', notes[k].end) + 1 : notes[k].end) : notes[k].end;
    const start = rep === '' ? measure.lastIndexOf('\n', notes[k].start) + 1 : notes[k].start;
    measure = measure.slice(0, start) + rep + measure.slice(end);
  }
  const out = xml.slice(0, f.ms.start) + measure + xml.slice(f.ms.end);
  return withCheckBars(out);
}

/* Rests that make up q quarters (longest first), in the voice and staff of the note they follow */
function restsFor(q, div, like) {
  const voice = tag(like, 'voice') || '1', staff = tag(like, 'staff');
  const out = [];
  let r = q, guard = 0;
  while (r > 0.125 - 1e-6 && guard++ < 16) {
    const [type, L] = TYPES.find(t => t[1] <= r + 1e-6);
    out.push(`<note><rest/><duration>${Math.round(L * div)}</duration><voice>${voice}</voice><type>${type}</type>${staff ? `<staff>${staff}</staff>` : ''}</note>`);
    r -= L;
  }
  return out;
}
const indentOf = (text, at) => { const ls = text.lastIndexOf('\n', at) + 1; return text.slice(ls, at).match(/^[ \t]*/)[0]; };

/* The bars whose voices don't fill the bar exactly (counted from 1, as the score viewer shows them) */
export function barsToCheck(xml) {
  const { div, barQ } = settings(xml), len = Math.round(barQ * div), out = new Set();
  layout(xml).forEach(part => part.measures.forEach((ms, i) => {
    const measure = xml.slice(ms.start, ms.end);
    if (measure.includes('implicit="yes"')) return;
    measure.split(/<backup>/).forEach(piece => {
      const notes = (piece.match(/<note>[\s\S]*?<\/note>/g) || []).filter(n => !n.includes('<chord/>'));
      if (!notes.length) return;
      const used = notes.reduce((a, n) => a + num(n, 'duration', 0), 0);
      if (used !== len) out.add(i + 1);
    });
  }));
  return [...out].sort((a, b) => a - b);
}
/* The score's list of bars to check, brought up to date (the field is added or dropped as needed) */
export function withCheckBars(xml) {
  const bars = barsToCheck(xml);
  const field = bars.length ? `<miscellaneous><miscellaneous-field name="ww-check-bars">${bars.join(' ')}</miscellaneous-field></miscellaneous>` : '';
  if (/<miscellaneous>[\s\S]*?<\/miscellaneous>/.test(xml)) {
    return xml.replace(/\n?[ \t]*<miscellaneous>[\s\S]*?<\/miscellaneous>/, field ? '\n    ' + field : '');
  }
  return field ? xml.replace(/(\s*)<\/identification>/, '\n    ' + field + '$1</identification>') : xml;
}
