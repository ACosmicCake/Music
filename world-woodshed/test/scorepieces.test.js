import { describe, it, expect } from 'vitest';
import { sections, readScoreMelody } from '../src/scorepieces.js';
import { toMusicXML, toMidi } from '../src/notate.js';
import { pieceLength, attacks } from '../src/content/reading.js';

/* Your own scores as sight-reading (src/scorepieces.js): a melody cut into sections the Sight-reading tool reads. */

// a C major scale up and down in quarters, sounding where a guitar plays it (C4 is middle C, guitar's C on the A string 3rd fret is C3)
const scale = (lo = 48) => [0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 2, 0, 2, 4, 5, 7, 9].map((d, i) => ({ s: i, e: i + 1, midi: lo + d }));
const written = p => p.bars.flat().filter(n => n.midi != null).map(n => n.midi);

describe('cutting a melody into sections', () => {
  it('gives sections of four bars, numbered from bar 1, each a full piece', () => {
    const out = sections({ notes: scale(), time: '4/4' });
    expect(out.map(x => [x.from, x.to])).toEqual([[1, 4], [5, 5]]);
    expect(out[0].piece.bars).toHaveLength(4);
    expect(pieceLength(out[0].piece)).toBe(16);
    expect(out[0].piece).toMatchObject({ key: 'C', time: '4/4' });
    expect(attacks(out[0].piece)).toHaveLength(16);
  });
  it('the last section is as long as what is left, and eight-bar sections work too', () => {
    const out = sections({ notes: scale(), time: '4/4' }, 8);
    expect(out.map(x => [x.from, x.to])).toEqual([[1, 5]]);
    expect(out[0].piece.bars).toHaveLength(5);
  });
  it('writes a low melody an octave up, as guitar music is, and leaves one already in the treble staff', () => {
    const low = sections({ notes: scale(48), time: '4/4' })[0].piece;
    expect(written(low).slice(0, 3)).toEqual([60, 62, 64]);
    const high = sections({ notes: scale(67), time: '4/4' })[0].piece;
    expect(written(high).slice(0, 3)).toEqual([67, 69, 71]);
  });
  it('leaves out the empty bars at the start and the empty sections in the middle', () => {
    const notes = [{ s: 8, e: 12, midi: 48 }, { s: 32, e: 36, midi: 50 }];
    const out = sections({ notes, time: '4/4' });
    expect(out.map(x => [x.from, x.to])).toEqual([[3, 6], [7, 9]]);
    expect(out[0].piece.bars[0][0]).toMatchObject({ midi: 60, dur: 'w' });
  });
  it('ends a note tied over the end of a section there', () => {
    const notes = [{ s: 0, e: 15, midi: 48 }, { s: 15, e: 18, midi: 50 }];
    const [a, b] = sections({ notes, time: '4/4' });
    const last = a.piece.bars[3][a.piece.bars[3].length - 1];
    expect(last.midi).toBe(62);
    expect(last.tie).toBeUndefined();
    expect(b.piece.bars[0][0]).toMatchObject({ midi: 62 });
  });
  it('keeps the score\'s own time signature, and reads one that is not a time signature as 4/4', () => {
    expect(sections({ notes: scale(), time: '3/4' })[0].piece.time).toBe('3/4');
    expect(sections({ notes: scale(), time: '6/8' })[0].piece.time).toBe('6/8');
    expect(sections({ notes: scale(), time: '5/4' })[0].piece.time).toBe('5/4');
    expect(sections({ notes: scale(), time: '7/3' })[0].piece.time).toBe('4/4');
  });
  it('bars a ten-beat or thirteen-eighth score as written', () => {
    // two bars of 10/4: quarters and halves, 10 beats each
    const lens = [2, 2, 1, 2, 1, 1, 1, 2, 3, 1, 1, 1, 1, 1];
    let t = 0;
    const notes = lens.map((L, i) => { const n = { s: t, e: t + L, midi: 72 - (i % 5) }; t += L; return n; });
    const [sec] = sections({ notes, time: '10/4' });
    expect(sec.piece.time).toBe('10/4');
    expect(sec.piece.bars).toHaveLength(2);
    const q = { w: 4, h: 2, q: 1, 8: 0.5, 16: 0.25 };
    sec.piece.bars.forEach(bar => expect(bar.reduce((a, n) => a + q[n.dur] * (n.dot ? 1.5 : 1), 0)).toBe(10));
    const odd = sections({ notes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => ({ s: i / 2, e: i / 2 + 0.5, midi: 72 })), time: '13/8' })[0];
    expect(odd.piece.bars).toHaveLength(1);
  });
  it('finds the key', () => {
    const g = [67, 69, 71, 72, 74, 76, 78, 79, 74, 71, 67].map((m, i) => ({ s: i, e: i + 1, midi: m - 12 }));
    expect(sections({ notes: g, time: '4/4' })[0].piece.key).toBe('G');
  });
  it('has nothing to read in an empty melody', () => {
    expect(sections({ notes: [], time: '4/4' })).toEqual([]);
    expect(sections({})).toEqual([]);
  });
});

describe('reading a score file', () => {
  const draft = { title: 'Scale', bpm: 90, time: '4/4', key: 'auto', grid: 0.25, hold: true, notes: scale() };
  it('reads MusicXML and MIDI to the same melody', async () => {
    const x = await readScoreMelody('scale.musicxml', new Blob([toMusicXML(draft)]));
    const m = await readScoreMelody('scale.mid', new Blob([toMidi(draft)]));
    expect(x.notes.map(n => n.midi)).toEqual(scale().map(n => n.midi));
    expect(m.notes.map(n => n.midi)).toEqual(scale().map(n => n.midi));
    expect(m.bpm).toBe(90);
    expect(written(sections(x)[0].piece)).toEqual(written(sections(m)[0].piece));
  });
});
