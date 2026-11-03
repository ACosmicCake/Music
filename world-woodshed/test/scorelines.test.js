import { describe, it, expect } from 'vitest';
import './env.js';
import { sections, readScoreMelody } from '../src/scorepieces.js';
import { fromMusicXML } from '../src/melody.js';
import { parseMidi, midiLines, clefFor } from '../src/midiread.js';

/* Picking a line of a score (a part, a staff of a piano part, a MIDI track) and reading a bass line in the bass clef. */

const note = (step, oct, dur = 4, staff = 1) => `<note><pitch><step>${step}</step><octave>${oct}</octave></pitch><duration>${dur}</duration><voice>${staff === 1 ? 1 : 5}</voice><type>whole</type><staff>${staff}</staff></note>`;
const piano = `<?xml version="1.0"?><score-partwise><part-list><score-part id="P1"><part-name>Piano</part-name></score-part><score-part id="P2"><part-name>Bass</part-name></score-part></part-list>
<part id="P1"><measure number="1"><attributes><divisions>1</divisions><key><fifths>-1</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time><staves>2</staves>
<clef number="1"><sign>G</sign><line>2</line></clef><clef number="2"><sign>F</sign><line>4</line></clef></attributes>
<direction><sound tempo="90"/></direction>${note('C', 5)}<backup><duration>4</duration></backup>${note('F', 2, 4, 2)}</measure>
<measure number="2">${note('D', 5)}<backup><duration>4</duration></backup>${note('A', 2, 4, 2)}</measure></part>
<part id="P2"><measure number="1"><attributes><divisions>1</divisions><transpose><diatonic>0</diatonic><chromatic>0</chromatic><octave-change>-1</octave-change></transpose><clef><sign>F</sign><line>4</line></clef></attributes>
<note><pitch><step>E</step><octave>2</octave></pitch><duration>4</duration><voice>1</voice><type>whole</type></note></measure>
<measure number="2"><note><pitch><step>G</step><octave>2</octave></pitch><duration>4</duration><voice>1</voice><type>whole</type></note></measure></part></score-partwise>`;
const heads = p => p.bars.flat().filter(n => n.midi != null).map(n => n.midi);

describe('the lines of a MusicXML score', () => {
  it('lists every staff of every part with its clef', () => {
    const m = fromMusicXML(piano);
    expect(m.staves).toEqual([
      { part: 0, staff: '1', name: 'Piano (upper staff)', clef: 'treble' },
      { part: 0, staff: '2', name: 'Piano (lower staff)', clef: 'bass' },
      { part: 1, staff: '1', name: 'Bass', clef: 'bass' }]);
    expect(m.clef).toBe('treble');
    expect(m.notes.map(n => n.midi)).toEqual([72, 74]);
  });
  it('reads the left hand when asked, in the bass clef where it is written', () => {
    const m = fromMusicXML(piano, { part: 0, staff: '2' });
    expect(m.clef).toBe('bass');
    expect(m.notes.map(n => n.midi)).toEqual([41, 45]);
    const [sec] = sections(m, 0);
    expect(sec.piece.clef).toBe('bass');
    expect(heads(sec.piece)).toEqual([41, 45]); // not an octave up
  });
  it('reads a bass guitar part as its page writes it, and takes the tempo from the first part', () => {
    const m = fromMusicXML(piano, { part: 1, staff: '1' });
    expect(m.notes.map(n => n.midi)).toEqual([28, 31]); // sounding
    expect(m.bpm).toBe(90);
    const [sec] = sections(m, 0);
    expect(heads(sec.piece)).toEqual([40, 43]); // written: E2 and G2, under and on the bottom line
  });
  it('keeps the treble reading of a guitar melody as it was', () => {
    const m = fromMusicXML(piano);
    expect(sections(m, 0)[0].piece.clef).toBeUndefined();
  });
  it('readScoreMelody names the lines and the one it read', async () => {
    const blob = new Blob([piano]);
    const m = await readScoreMelody('x.musicxml', blob, '0:2');
    expect(m.lines.map(l => l.id)).toEqual(['0:1', '0:2', '1:1']);
    expect(m.line).toBe('0:2');
  });
});

/* a type 1 MIDI file: a melody track and a bass track */
function midi() {
  const vlq = n => (n < 128 ? [n] : [0x80 | (n >> 7), n & 127]);
  const trk = (name, ch, pitches) => {
    const ev = [0, 0xff, 0x03, name.length, ...[...name].map(c => c.charCodeAt(0))];
    pitches.forEach(p => ev.push(0, 0x90 | ch, p, 90, ...vlq(480), 0x80 | ch, p, 0));
    ev.push(0, 0xff, 0x2f, 0);
    return [0x4d, 0x54, 0x72, 0x6b, 0, 0, (ev.length >> 8) & 255, ev.length & 255, ...ev];
  };
  return new Uint8Array([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 1, 0, 2, 1, 0xe0, ...trk('Lead', 0, [72, 74, 76, 77]), ...trk('Bass', 1, [36, 38, 40, 41])]);
}
describe('the lines of a MIDI file', () => {
  it('lists each track, and a low one reads in the bass clef', async () => {
    const m = parseMidi(midi());
    expect(midiLines(m).map(l => [l.id, l.name])).toEqual([['0:0', 'Lead'], ['1:1', 'Bass']]);
    expect(clefFor([36, 38, 40])).toBe('bass');
    expect(clefFor([55, 60, 64])).toBe('treble');
    const top = await readScoreMelody('x.mid', new Blob([midi()]));
    expect(top.clef).toBe('treble');
    const bass = await readScoreMelody('x.mid', new Blob([midi()]), '1:1');
    expect(bass.clef).toBe('bass');
    expect(bass.notes.map(n => n.midi)).toEqual([36, 38, 40, 41]);
    expect(heads(sections(bass, 0)[0].piece)).toEqual([36, 38, 40, 41]);
  });
});

