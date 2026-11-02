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

describe('repeat signs', () => {
  // one whole note a bar, C D E F G A B C …, with barlines: { bar (from 0): 'fwd' | 'back' | 'e1' | 'e2' }
  const xml = (n, marks = {}) => {
    const steps = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const ms = [...Array(n).keys()].map(i => {
      const m = [].concat(marks[i] || []);
      const left = (m.includes('fwd') ? '<repeat direction="forward"/>' : '') + (m.includes('e1') ? '<ending number="1" type="start"/>' : '') + (m.includes('e2') ? '<ending number="2" type="start"/>' : '');
      const right = m.includes('back') ? '<barline location="right">' + (m.includes('e1') ? '<ending number="1" type="stop"/>' : '') + '<repeat direction="backward"/></barline>' : '';
      return `<measure number="${i + 1}">${i === 0 ? '<attributes><divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time></attributes>' : ''}` +
        (left ? `<barline location="left">${left}</barline>` : '') +
        `<note><pitch><step>${steps[i % 7]}</step><octave>${5 + Math.floor(i / 7)}</octave></pitch><duration>4</duration><type>whole</type></note>${right}</measure>`;
    });
    return `<?xml version="1.0"?><score-partwise><part-list><score-part id="P1"><part-name>M</part-name></score-part></part-list><part id="P1">${ms.join('')}</part></score-partwise>`;
  };
  const read = (n, marks, per) => readScoreMelody('r.musicxml', new Blob([xml(n, marks)])).then(m => ({ m, out: sections(m, per) }));
  const show = out => out.map(x => [x.from, x.to, x.piece.repeat || null, !!x.again]);

  it('reads the repeat signs of a MusicXML score', async () => {
    const { m } = await read(8, { 2: 'fwd', 3: 'back', 7: 'back' });
    expect(m.repeats).toEqual([{ s: 8, e: 16, first: null }, { s: 16, e: 32, first: null }]);
  });
  it('keeps a short repeat in one section with its signs, so it is read twice', async () => {
    const { out } = await read(8, { 2: 'fwd', 3: 'back' });
    expect(show(out)).toEqual([[1, 4, [2, 3], false], [5, 8, null, false]]);
    expect(attacks(out[0].piece)).toHaveLength(6); // C D E F E F
  });
  it('a repeat from the start with no forward sign', async () => {
    const { out } = await read(6, { 1: 'back' });
    expect(show(out)).toEqual([[1, 4, [0, 1], false], [5, 6, null, false]]);
  });
  it('a repeat that does not fit with the bars before it starts a section, and bars after it fill it up', async () => {
    const { out } = await read(8, { 3: 'fwd', 5: 'back' });
    expect(show(out)).toEqual([[1, 3, null, false], [4, 7, [0, 2], false], [8, 8, null, false]]);
  });
  it('a long repeat is read through, then its sections come again', async () => {
    const { out } = await read(10, { 0: 'fwd', 5: 'back' });
    expect(show(out)).toEqual([[1, 4, null, false], [5, 6, null, false], [1, 4, null, true], [5, 6, null, true], [7, 10, null, false]]);
  });
  it('the 2nd time leaves out the first ending', async () => {
    const { m, out } = await read(8, { 0: 'fwd', 2: 'e1', 3: ['e1', 'back'], 4: 'e2' });
    expect(m.repeats).toEqual([{ s: 0, e: 16, first: 8 }]);
    expect(show(out)).toEqual([[1, 4, null, false], [1, 2, null, true], [5, 8, null, false]]);
  });  it('the whole score is one piece, with each repeat\'s signs', async () => {
    const { out } = await read(10, { 2: 'fwd', 3: 'back', 5: 'fwd', 7: 'back' }, Infinity);
    expect(out).toHaveLength(1);
    expect([out[0].from, out[0].to]).toEqual([1, 10]);
    expect(out[0].piece.repeats).toEqual([[2, 3], [5, 7]]);
    expect(attacks(out[0].piece).map(a => a.midi)).toEqual([72, 74, 76, 77, 76, 77, 79, 81, 83, 84, 81, 83, 84, 86, 88]);
    // one repeat, however long, stays a repeat; 0 also means the whole score
    const long = (await read(10, { 0: 'fwd', 5: 'back' }, 0)).out;
    expect(show(long)).toEqual([[1, 10, [0, 5], false]]);
  });
  it('the whole score writes out a repeat with a first ending', async () => {
    const { out } = await read(8, { 0: 'fwd', 2: 'e1', 3: ['e1', 'back'], 4: 'e2' }, Infinity);
    expect(out).toHaveLength(1);
    expect(out[0].piece.bars).toHaveLength(10); // 1–4, then 1–2, then 5–8
    expect(out[0].piece.repeat).toBeUndefined();
  });
});

describe('the score\'s own key and spelling', () => {
  // C minor's notes (E♭, A♭, B♭) written in C with flats, as a raga in C is
  const xml = (fifths, transpose = '') => `<?xml version="1.0"?><score-partwise><part-list><score-part id="P1"><part-name>M</part-name></score-part></part-list><part id="P1">` +
    `<measure number="1"><attributes><divisions>1</divisions><key><fifths>${fifths}</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time>${transpose}</attributes>` +
    [['C', 0], ['E', -1], ['G', 0], ['A', -1]].map(([s, a]) => `<note><pitch><step>${s}</step>${a ? `<alter>${a}</alter>` : ''}<octave>5</octave></pitch><duration>1</duration><type>quarter</type></note>`).join('') +
    `</measure><measure number="2">` + [['B', -1], ['A', -1], ['G', 0], ['C', 0]].map(([s, a]) => `<note><pitch><step>${s}</step>${a ? `<alter>${a}</alter>` : ''}<octave>5</octave></pitch><duration>1</duration><type>quarter</type></note>`).join('') +
    `</measure></part></score-partwise>`;
  const read = x => readScoreMelody('k.musicxml', new Blob([x])).then(m => sections(m)[0].piece);
  it('keeps a score written in C in C, its flats spelled as flats', async () => {
    const p = await read(xml(0));
    expect(p.key).toBe('C');
    expect(p.bars[0].map(n => n.spell || '')).toEqual(['', 'b', '', 'b']);
  });
  it('keeps the key signature the score has', async () => {
    expect((await read(xml(-3))).key).toMatch(/^(Eb|Cm)$/);
  });
  it('guesses the key of a transposing part, whose signature is not the sounding one', async () => {
    const p = await read(xml(0, '<transpose><chromatic>-2</chromatic></transpose>'));
    expect(p.bars[0][1].spell).toBeUndefined();
  });
});

describe('a MusicXML score is read as it is written', () => {
  const N = (pitch, type, extra = '') => {
    if (pitch === 'r') return `<note><rest/><duration>${{ quarter: 2, eighth: 1, half: 4 }[type]}</duration><voice>1</voice><type>${type}</type>${extra}</note>`;
    const [, step, acc, oct] = /^([A-G])(#|b)?(\d)$/.exec(pitch);
    const alter = acc === '#' ? 1 : acc === 'b' ? -1 : 0;
    return `<note>${extra.includes('<chord/>') ? '<chord/>' : ''}<pitch><step>${step}</step>${alter ? `<alter>${alter}</alter>` : ''}<octave>${oct}</octave></pitch><duration>${{ quarter: 2, eighth: 1, half: 4 }[type] * (extra.includes('3:2') ? 2 / 3 : 1)}</duration>` +
      (extra.includes('tie') ? '<tie type="start"/>' : '') + `<voice>1</voice><type>${type}</type>` + (extra.includes('3:2') ? '<time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>' : '') + '</note>';
  };
  const score = (bars, pickup = false) => `<?xml version="1.0"?><score-partwise><part-list><score-part id="P1"><part-name>M</part-name></score-part></part-list><part id="P1">` +
    bars.map((b, i) => `<measure number="${i + 1}"${pickup && i === 0 ? ' implicit="yes"' : ''}>${i === 0 ? '<attributes><divisions>2</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time></attributes>' : ''}${b.join('')}</measure>`).join('') + '</part></score-partwise>';
  const read = x => readScoreMelody('w.musicxml', new Blob([x])).then(m => sections(m, 0)[0].piece);
  it('keeps rests, ties, triplets, chords and each note\'s own sharp or flat', async () => {
    const p = await read(score([
      [N('C5', 'quarter'), N('r', 'quarter'), N('D#5', 'eighth', '3:2'), N('Eb5', 'eighth', '3:2'), N('E5', 'eighth', '3:2'), N('G5', 'quarter', 'tie')],
      [N('G5', 'half'), N('C5', 'half'), N('E5', 'half', '<chord/>')]
    ]));
    expect(p.bars[0].map(n => [n.midi, n.dur, n.tup || 0, n.spell || '', !!n.tie])).toEqual([
      [72, 'q', 0, '', false], [null, 'q', 0, '', false], [75, '8', 3, '#', false], [75, '8', 3, 'b', false], [76, '8', 3, '', false], [79, 'q', 0, '', true]]);
    expect(p.bars[1][1]).toMatchObject({ midi: 76, chord: [72, 76] });
  });
  it('a pickup bar is filled with rests before its notes', async () => {
    const p = await read(score([[N('G4', 'quarter')], [N('C5', 'half'), N('D5', 'half')]], true));
    expect(p.bars[0].map(n => n.midi)).toEqual([null, null, 67]);
    expect(p.bars[1].map(n => n.midi)).toEqual([72, 74]);
  });
});
