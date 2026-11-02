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
  const out = [];
  for (let b = first; b < bars.length; b += per) {
    const slice = bars.slice(b, b + per).map(bar => bar.map(n => {
      const w = { midi: n.midi, dur: n.dur };
      if (n.dot) w.dot = true;
      if (n.tie) w.tie = true;
      return w;
    }));
    // a note tied over the end of the section ends there
    const lastBar = slice[slice.length - 1], last = lastBar[lastBar.length - 1];
    if (last && last.tie) delete last.tie;
    if (slice.every(bar => bar.every(n => n.midi == null))) continue; // nothing to read
    out.push({ from: b + 1, to: b + slice.length, piece: { key, time, bars: slice } });
  }
  return out;
}
