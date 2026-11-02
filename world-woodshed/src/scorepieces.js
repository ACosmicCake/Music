/* World Woodshed — your own scores as sight-reading: a Library score's melody (MusicXML, .mxl, MIDI or a
   Write by playing draft) cut into sections of a few bars, each a piece the Sight-reading tool reads like
   its own (src/tools/reading.js: { key, time, bars } of notation.js notes, written as guitar music is).
   Plain functions apart from reading the file; the cutting is tested in test/scorepieces.test.js. */
import { quantize, guessKey, okTime, cleanDraft } from './notate.js';
import { writtenUp, readMelodyFile } from './melody.js';
import { parseMidi, midiToDraft } from './midiread.js';

/* A score file → { notes: [{ s, e, midi }] (quarters, sounding or written pitch), title, bpm, time } */
export async function readScoreMelody(name, blob) {
  if (/\.midi?$/i.test(name)) {
    const d = midiToDraft(parseMidi(new Uint8Array(await blob.arrayBuffer())), name);
    return { notes: d.notes, title: d.title, bpm: d.bpm, time: d.time };
  }
  return readMelodyFile(name, blob);
}

/* The melody cut into sections of `per` bars: [{ from, to (bar numbers from 1), piece }].
   A melody that lies low (a guitar recording, a MIDI file at sounding pitch) is written an octave up, as
   guitar music is; one already in the treble staff (a score read from a page) stays where it is. The score's
   own time signature is kept (10/4, 13/8, 16/4 as well as 4/4 or 6/8); triplets are rounded to the grid. */
export function sections(melody, per = 4) {
  const time = okTime(melody.time) ? melody.time : '4/4';
  // (a draft for Write by playing keeps to the times it offers; a score keeps its own)
  const draft = Object.assign(cleanDraft({ grid: 0.25, hold: false, notes: melody.notes || [] }), { time });
  if (!draft.notes.length) return [];
  const up = writtenUp(draft.notes);
  // quantize writes an octave up (sounding → written); take that back for a melody already written
  const q = quantize(Object.assign({}, draft, { notes: draft.notes.map(n => ({ s: n.s, e: n.e, midi: up ? n.midi : n.midi - 12 })) }));
  const key = guessKey(draft.notes);
  const bars = q.bars;
  // leave out whole-bar rests at the start (a pickup or an intro played by others)
  let first = 0;
  while (first < bars.length && bars[first].every(n => n.midi == null)) first++;
  // the order the bars are read in: a short repeat stays one section with its repeat signs, read twice; a
  // longer one (or one with a first ending) is read through, then its sections come again for the 2nd time
  const [num, den] = time.split('/').map(Number), barLen = num * 4 / den;
  const segs = [];
  let pos = first;
  (melody.repeats || []).map(r => ({ a: Math.round(r.s / barLen), b: Math.round(r.e / barLen) - 1, e1: r.first == null ? null : Math.round(r.first / barLen) }))
    .sort((x, y) => x.a - y.a).forEach(({ a, b, e1 }) => {
      a = Math.max(a, pos); b = Math.min(b, bars.length - 1);
      if (!(b >= a)) return; // before the music starts, or overlapping the last one
      if (a > pos) segs.push({ from: pos, to: a - 1 });
      const again = e1 != null && e1 > a && e1 <= b ? e1 - 1 : b;
      if (again === b && b - a + 1 <= per) segs.push({ from: a, to: b, rep: true });
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
      if (n.dot) w.dot = true;
      if (n.tie) w.tie = true;
      return w;
    }));
    // a note tied over the end of the section (or of its repeat) ends there
    const untie = bar => { const last = bar[bar.length - 1]; if (last && last.tie) delete last.tie; };
    untie(slice[slice.length - 1]);
    if (x.rep) untie(slice[x.rep[1]]);
    if (slice.every(bar => bar.every(n => n.midi == null))) return; // nothing to read
    const piece = { key, time, bars: slice };
    if (x.rep) piece.repeat = x.rep;
    const sec = { from: x.idx[0] + 1, to: x.idx[x.idx.length - 1] + 1, piece };
    if (x.again) sec.again = true;
    out.push(sec);
  };
  segs.forEach(sg => {
    const n = sg.to - sg.from + 1;
    // a section of its own for a repeat; a short repeat joins the bars before it if it fits whole
    if (sg.own || (cur && (cur.again || (sg.rep && (cur.rep || cur.idx.length + n > per))))) close();
    for (let b = sg.from; b <= sg.to; b++) {
      if (cur && cur.idx.length >= per && !sg.rep) close();
      if (!cur) cur = { idx: [], again: sg.again };
      if (sg.rep && b === sg.from) cur.rep = [cur.idx.length, cur.idx.length + n - 1];
      cur.idx.push(b);
    }
    if (sg.own) close();
  });
  close();
  return out;
}
