/* World Woodshed — your own scores as sight-reading: a Library score's melody (MusicXML, .mxl, MIDI or a
   Write by playing draft) cut into sections of a few bars, each a piece the Sight-reading tool reads like
   its own (src/tools/reading.js: { key, time, bars } of notation.js notes, written as guitar music is).
   Plain functions apart from reading the file; the cutting is tested in test/scorepieces.test.js. */
import { quantize, guessKey, okTime, cleanDraft } from './notate.js';
import { writtenUp, readMelodyFile } from './melody.js';
import { parseMidi, midiToDraft, midiLines, clefFor } from './midiread.js';

/* A score file → { notes: [{ s, e, midi }] (quarters, sounding or written pitch), title, bpm, time, clef,
   lines: [{ id, name, clef }] (every staff of a MusicXML score, every track of a MIDI file), line (the one
   read) }. `line` picks one ('part:staff' for MusicXML, 'track:channel' for MIDI); the top line otherwise. */
export async function readScoreMelody(name, blob, line = null) {
  if (/\.midi?$/i.test(name)) {
    const m = parseMidi(new Uint8Array(await blob.arrayBuffer()));
    const lines = midiLines(m);
    const pick = lines.find(l => l.id === line) ? line : null;
    const d = midiToDraft(m, name, pick);
    return { notes: d.notes, title: d.title, bpm: d.bpm, time: d.time, clef: clefFor(d.notes.map(n => n.midi)),
      lines: lines.map(l => ({ id: l.id, name: l.name, clef: l.low < 50 ? 'bass' : 'treble' })), line: pick };
  }
  const [part, staff] = String(line || '').split(':');
  const mel = await readMelodyFile(name, blob, line ? { part: +part, staff } : null);
  if (mel.staves) {
    mel.lines = mel.staves.map(x => ({ id: x.part + ':' + x.staff, name: x.name, clef: x.clef }));
    mel.line = mel.part + ':' + mel.staff;
  }
  return mel;
}

/* The melody cut into sections of `per` bars: [{ from, to (bar numbers from 1), piece }]. per = Infinity (or 0)
   gives the whole score as one piece, read straight through: its repeats with their signs (piece.repeats when
   there are several), and one with a first ending written out (the bars, then the 2nd time without it).
   A melody that lies low (a guitar recording, a MIDI file at sounding pitch) is written an octave up, as
   guitar music is; one already in the treble staff (a score read from a page) stays where it is. The score's
   own time signature is kept (10/4, 13/8, 16/4 as well as 4/4 or 6/8); triplets are rounded to the grid. */
export function sections(melody, per = 4) {
  const whole = !(per > 0 && per < Infinity);
  if (whole) per = Infinity;
  const time = okTime(melody.time) ? melody.time : '4/4';
  // (a draft for Write by playing keeps to the times it offers; a score keeps its own)
  const draft = Object.assign(cleanDraft({ grid: 0.25, hold: false, notes: melody.notes || [] }), { time });
  if (!draft.notes.length) return [];
  // a bass line (a bass clef staff, or a low MIDI line) is written in the bass clef as it sounds, or as the
  // page writes it when its part sounds an octave down (a bass guitar); everything else in the treble clef
  const bass = melody.clef === 'bass';
  const up = bass ? false : writtenUp(draft.notes);
  // quantize writes an octave up (sounding → written); take that back for a melody already written
  const q = quantize(Object.assign({}, draft, { notes: draft.notes.map(n => ({ s: n.s, e: n.e, midi: up ? n.midi : n.midi - 12 })) }));
  // the score's own key signature when it has one (a score in C with flats written in stays in C)
  const key = guessKey(draft.notes, Number.isFinite(melody.fifths) ? melody.fifths : null);
  const spell = melody.spell || {};
  // a MusicXML score is read bar by bar as it is written (its notes, rests, ties, triplets, chords and
  // accidentals); a MIDI file or a played draft has only times, so it is written out by quantize
  const wr = melody.written && melody.written.bars && melody.written.bars.length && time === (melody.time || time) ? melody.written : null;
  const shift = bass ? (melody.trans && melody.trans % 12 === 0 && melody.written ? -melody.trans : 0) : up ? 12 : 0;
  const bars = wr ? wr.bars.map(bar => bar.map(n => Object.assign({}, n, n.midi == null ? {} : { midi: n.midi + shift }, n.chord ? { chord: n.chord.map(m => m + shift) } : {}))) : q.bars;
  // leave out whole-bar rests at the start (a pickup or an intro played by others)
  let first = 0;
  while (first < bars.length && bars[first].every(n => n.midi == null)) first++;
  // the order the bars are read in: a short repeat stays one section with its repeat signs, read twice; a
  // longer one (or one with a first ending) is read through, then its sections come again for the 2nd time
  const [num, den] = time.split('/').map(Number), barLen = num * 4 / den;
  // a place in quarters → its bar: the written bars' own starts (a pickup is a short bar), else even bars
  const barAt = q => {
    if (!wr || !wr.starts) return Math.round(q / barLen);
    let best = 0;
    wr.starts.forEach((st, i) => { if (Math.abs(st - q) < Math.abs(wr.starts[best] - q)) best = i; });
    return Math.abs(wr.starts[best] - q) < 1e-3 ? best : q >= wr.starts[wr.starts.length - 1] ? wr.starts.length : best;
  };
  const segs = [];
  let pos = first;
  (melody.repeats || []).map(r => ({ a: barAt(r.s), b: barAt(r.e) - 1, e1: r.first == null ? null : barAt(r.first) }))
    .sort((x, y) => x.a - y.a).forEach(({ a, b, e1 }) => {
      a = Math.max(a, pos); b = Math.min(b, bars.length - 1);
      if (!(b >= a)) return; // before the music starts, or overlapping the last one
      if (a > pos) segs.push({ from: pos, to: a - 1 });
      const again = e1 != null && e1 > a && e1 <= b ? e1 - 1 : b;
      if (again === b && b - a + 1 <= per) segs.push({ from: a, to: b, rep: true });
      else if (whole) segs.push({ from: a, to: b, cut: true }, { from: a, to: again, cut: true });
      else segs.push({ from: a, to: b, own: true }, { from: a, to: again, own: true, again: true });
      pos = b + 1;
    });
  if (pos < bars.length) segs.push({ from: pos, to: bars.length - 1 });
  const out = [];
  let cur = null;
  const close = () => {
    if (!cur) return;
    const x = cur; cur = null;
    const slice = x.idx.map(b => bars[b].map(n => {
      const w = { midi: n.midi, dur: n.dur };
      // sharps and flats as the score writes them (an E♭ stays E♭, not D♯): each note's own when it is read as written
      if (n.spell) w.spell = n.spell;
      else if (n.midi != null && !wr && spell[((n.midi % 12) + 12) % 12]) w.spell = spell[((n.midi % 12) + 12) % 12];
      if (n.chord) w.chord = n.chord.slice();
      if (n.tup) w.tup = n.tup;
      if (n.dot) w.dot = true;
      if (n.tie) w.tie = true;
      return w;
    }));
    // a note tied over the end of the section (or of its repeat) ends there
    const untie = bar => { const last = bar[bar.length - 1]; if (last && last.tie) delete last.tie; };
    untie(slice[slice.length - 1]);
    x.reps.forEach(r => untie(slice[r[1]]));
    x.cuts.forEach(k => untie(slice[k]));
    if (slice.every(bar => bar.every(n => n.midi == null))) return; // nothing to read
    const piece = { key, time, bars: slice };
    if (bass) piece.clef = 'bass';
    if (x.reps.length === 1) piece.repeat = x.reps[0];
    else if (x.reps.length) piece.repeats = x.reps;
    const sec = { from: x.idx[0] + 1, to: x.idx[x.idx.length - 1] + 1, piece };
    if (x.again) sec.again = true;
    out.push(sec);
  };
  segs.forEach(sg => {
    const n = sg.to - sg.from + 1;
    // a section of its own for a repeat; a short repeat joins the bars before it if it fits whole
    if (sg.own || (cur && (cur.again || (sg.rep && ((cur.reps.length && !whole) || cur.idx.length + n > per))))) close();
    for (let b = sg.from; b <= sg.to; b++) {
      if (cur && cur.idx.length >= per && !sg.rep) close();
      if (!cur) cur = { idx: [], again: sg.again, reps: [], cuts: [] };
      if (sg.rep && b === sg.from) cur.reps.push([cur.idx.length, cur.idx.length + n - 1]);
      cur.idx.push(b);
    }
    if (sg.cut && cur) cur.cuts.push(cur.idx.length - 1);
    if (sg.own) close();
  });
  close();
  return out;
}
