import { describe, it, expect } from 'vitest';
import { scoreToMusicXML } from '../src/omr/musicxml.js';
import { editBeat, toggleTie, beatInfo, barsToCheck, withCheckBars, pitchName } from '../src/scoreedit.js';

/* Fixing the notes of a score read from a page (src/scoreedit.js): each edit changes one beat as alphaTab
   counts them (part, bar, staff, voice, beat) and leaves the rest of the file as the recognizer wrote it. */

const ev = (q, pitches, extra = {}) => Object.assign({ q, dots: 0, voice: 0, pitches }, extra);
const P = (step, octave, alter = 0) => ({ step, octave, alter });
// G major, 4/4: bar 1 is D5 C5 B4 A4 (quarters), bar 2 a half note G4 and a half rest
const melody = () => scoreToMusicXML({
  title: 'T', time: { num: 4, den: 4 }, fifths: 1, pickup: 0,
  parts: [{ name: 'Guitar', staves: ['G'], bars: [
    [[[ev(1, [P('D', 5)]), ev(1, [P('C', 5)]), ev(1, [P('B', 4)]), ev(1, [P('A', 4)])]]],
    [[[ev(2, [P('G', 4)]), { q: 2, rest: true, dots: 0 }]]]
  ] }], warnings: [], counts: {}
}, { bpm: 80 });
const at = (bar, beat, extra = {}) => Object.assign({ part: 0, bar, staff: 0, voice: 0, beat }, extra);
const name = (xml, a) => beatInfo(xml, a).pitches.map(pitchName).join(' ');

describe('reading a beat', () => {
  it('finds notes and rests by bar and place', () => {
    const xml = melody();
    expect(name(xml, at(0, 0))).toBe('D5');
    expect(name(xml, at(0, 3))).toBe('A4');
    expect(beatInfo(xml, at(1, 0))).toMatchObject({ rest: false, type: 'half', dots: 0 });
    expect(beatInfo(xml, at(1, 1))).toMatchObject({ rest: true, type: 'half' });
    expect(beatInfo(xml, at(5, 0))).toBe(null);
  });
});

describe('changing pitch', () => {
  it('moves a note a line or space, taking the key signature (F becomes F♯ in G)', () => {
    let xml = melody();
    xml = editBeat(xml, at(1, 0), 'down'); // G4 → F♯4
    expect(name(xml, at(1, 0))).toBe('F♯4');
    expect(xml).not.toContain('<accidental>'); // the key signature already says so
    xml = editBeat(xml, at(0, 0), 'up'); // D5 → E5
    expect(name(xml, at(0, 0))).toBe('E5');
    expect(name(editBeat(melody(), at(0, 1), 'down'), at(0, 1))).toBe('B4');
  });
  it('sharpens, flattens and naturals, writing the accidental only when the key does not say it', () => {
    let xml = editBeat(melody(), at(0, 1), 'sharp'); // C♯5
    expect(name(xml, at(0, 1))).toBe('C♯5');
    expect(xml).toContain('<accidental>sharp</accidental>');
    xml = editBeat(xml, at(0, 1), 'natural');
    expect(name(xml, at(0, 1))).toBe('C5');
    expect(xml).not.toContain('<accidental>');
    xml = editBeat(editBeat(melody(), at(1, 0), 'down'), at(1, 0), 'natural'); // F♮ in G needs its sign
    expect(xml).toContain('<accidental>natural</accidental>');
  });
  it('moves by octaves, and leaves a rest alone', () => {
    expect(name(editBeat(melody(), at(0, 3), 'octDown'), at(0, 3))).toBe('A3');
    expect(editBeat(melody(), at(1, 1), 'up')).toBe(melody());
  });
});

describe('changing length and rests', () => {
  it('changes a note value and marks the bar if it no longer adds up', () => {
    const xml = editBeat(melody(), at(0, 0), { length: 'half' });
    expect(beatInfo(xml, at(0, 0))).toMatchObject({ type: 'half', dots: 0 });
    expect(barsToCheck(xml)).toEqual([1]);
    expect(xml).toContain('<miscellaneous-field name="ww-check-bars">1</miscellaneous-field>');
    // the reader saw a note that isn't there: deleting it makes the bar add up again
    const fixed = editBeat(xml, at(0, 1), 'delete');
    expect(name(fixed, at(0, 1))).toBe('B4');
    expect(barsToCheck(fixed)).toEqual([]);
    expect(fixed).not.toContain('ww-check-bars');
  });
  it('fills what a shorter note gave up with rests right after it, so the bar still adds up', () => {
    const xml = editBeat(melody(), at(0, 1), { length: 'eighth' });
    expect(beatInfo(xml, at(0, 2))).toMatchObject({ rest: true, type: 'eighth' });
    expect(name(xml, at(0, 3))).toBe('B4');
    expect(barsToCheck(xml)).toEqual([]);
    const dotted = editBeat(melody(), at(1, 0), { length: 'eighth' }); // a half becomes an eighth: a quarter and an eighth rest
    expect(beatInfo(dotted, at(1, 1))).toMatchObject({ rest: true, type: 'quarter' });
    expect(beatInfo(dotted, at(1, 2))).toMatchObject({ rest: true, type: 'eighth' });
    expect(barsToCheck(dotted)).toEqual([]);
  });
  it('dots a note', () => {
    const xml = editBeat(melody(), at(1, 0), { length: 'quarter', dots: 1 });
    expect(beatInfo(xml, at(1, 0))).toMatchObject({ type: 'quarter', dots: 1 });
  });
  it('turns a note into a rest and back', () => {
    const r = editBeat(melody(), at(0, 2), 'rest');
    expect(beatInfo(r, at(0, 2))).toMatchObject({ rest: true, type: 'quarter' });
    const n = editBeat(r, at(0, 2), 'rest');
    expect(name(n, at(0, 2))).toBe('B4');
    expect(barsToCheck(n)).toEqual([]);
  });
});

describe('chords and staves', () => {
  const piano = () => scoreToMusicXML({
    title: 'T', time: { num: 2, den: 4 }, fifths: 0, pickup: 0,
    parts: [{ name: 'Piano', staves: ['G', 'F'], bars: [
      [[[ev(1, [P('C', 4), P('E', 4)]), ev(1, [P('D', 4)])]], [[ev(2, [P('C', 3)])]]]
    ] }], warnings: [], counts: {}
  });
  it('moves the whole chord, and finds the lower staff', () => {
    const xml = editBeat(piano(), at(0, 0), 'up');
    expect(name(xml, at(0, 0))).toBe('D4 F4');
    expect(name(xml, at(0, 0, { staff: 1 }))).toBe('C3');
    expect(name(editBeat(piano(), at(0, 0, { staff: 1 }), 'down'), at(0, 0, { staff: 1 }))).toBe('B2');
  });
  it('a chord made a rest loses its other notes', () => {
    const xml = editBeat(piano(), at(0, 0), 'rest');
    expect(beatInfo(xml, at(0, 0)).rest).toBe(true);
    expect(name(xml, at(0, 1))).toBe('D4');
    expect((xml.match(/<chord\/>/g) || []).length).toBe(0);
  });
});

describe('ties', () => {
  // bar 1 ends on A4, bar 2 starts on G4: tie A to A only after making the G an A
  it('ties a note to the same pitch after it, across the bar line, and takes the tie off again', () => {
    let xml = melody();
    expect(beatInfo(xml, at(0, 3))).toMatchObject({ tied: false, canTie: false }); // A4 then G4
    xml = editBeat(xml, at(1, 0), 'up'); // G4 → A4
    expect(beatInfo(xml, at(0, 3)).canTie).toBe(true);
    xml = toggleTie(xml, at(0, 3));
    expect(beatInfo(xml, at(0, 3)).tied).toBe(true);
    expect(xml).toContain('<tie type="start"/>');
    expect(xml).toContain('<tie type="stop"/>');
    expect((xml.match(/<tied type="(start|stop)"\/>/g) || []).length).toBe(2);
    const off = toggleTie(xml, at(0, 3));
    expect(off).not.toContain('<tie ');
    expect(off).not.toContain('<notations></notations>');
    expect(beatInfo(off, at(0, 3)).tied).toBe(false);
  });
  it('does nothing on a rest, or where the next note differs', () => {
    expect(toggleTie(melody(), at(1, 1))).toBe(melody());
    expect(toggleTie(melody(), at(0, 0))).toBe(melody());
  });
});

describe('the bars to check', () => {
  it('adds and removes the field as the bars change', () => {
    const xml = melody();
    expect(withCheckBars(xml)).toBe(xml);
    const bad = xml.replace('<duration>24</duration>', '<duration>12</duration>');
    expect(withCheckBars(bad)).toContain('<miscellaneous-field name="ww-check-bars">1</miscellaneous-field>');
  });
});
