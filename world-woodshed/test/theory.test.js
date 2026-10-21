import { describe, it, expect } from 'vitest';
import { parseChord, prettySym, flatName, spell, keyPrefersFlats, degreeLabel, diatonicChords } from '../src/theory.js';

/* Chord symbols, note spelling and diatonic harmony (src/theory.js). */

describe('parseChord', () => {
  it('reads the root as a pitch class, with sharps and flats, wrapping round C', () => {
    expect(parseChord('C').root).toBe(0);
    expect(parseChord('F#7').root).toBe(6);
    expect(parseChord('Bbm7').root).toBe(10);
    expect(parseChord('Cb').root).toBe(11);
    expect(parseChord('B#').root).toBe(0);
  });
  it('maps each quality to its intervals above the root', () => {
    expect(parseChord('C').iv).toEqual([0, 4, 7]);
    expect(parseChord('Cm').iv).toEqual([0, 3, 7]);
    expect(parseChord('Cmaj7').iv).toEqual([0, 4, 7, 11]);
    expect(parseChord('C7').iv).toEqual([0, 4, 7, 10]);
    expect(parseChord('Cm7b5').iv).toEqual([0, 3, 6, 10]);
    expect(parseChord('Cdim7').iv).toEqual([0, 3, 6, 9]);
    expect(parseChord('C13').iv).toEqual([0, 4, 7, 10, 14, 21]);
    expect(parseChord('Csus4').iv).toEqual([0, 5, 7]);
  });
  it('names the guide tones: third, seventh and an altered fifth', () => {
    const m7b5 = parseChord('Am7b5');
    expect(m7b5).toMatchObject({ third: 3, seventh: 10, fifth: 6, triad: false, label7: '7' });
    expect(parseChord('Caug')).toMatchObject({ third: 4, fifth: 8, seventh: null, triad: true });
    expect(parseChord('Cmaj7').seventh).toBe(11);
  });
  it('labels a sixth as 6 and the diminished seventh as a double-flat 7', () => {
    expect(parseChord('C6').label7).toBe('6');
    expect(parseChord('Cdim7').label7).toBe('♭♭7');
  });
  it('treats an unknown quality as a major triad, and rejects a symbol without a root', () => {
    expect(parseChord('Cxyz').iv).toEqual([0, 4, 7]);
    expect(parseChord('H7')).toBeNull();
    expect(parseChord('')).toBeNull();
  });
});

describe('note names', () => {
  it('flatName and spell wrap any integer into a pitch class', () => {
    expect(flatName(1)).toBe('D♭');
    expect(flatName(-1)).toBe('B');
    expect(flatName(25)).toBe('D♭');
    expect(spell(6, false)).toBe('F♯');
    expect(spell(6, true)).toBe('G♭');
  });
  it('prefers flats in the flat keys and their relative minors', () => {
    // F, B♭, E♭, A♭, D♭, G♭ major
    [5, 10, 3, 8, 1, 6].forEach(pc => expect(keyPrefersFlats(pc, false), pc).toBe(true));
    [0, 7, 2, 9, 4, 11].forEach(pc => expect(keyPrefersFlats(pc, false), pc).toBe(false));
    expect(keyPrefersFlats(2, true)).toBe(true);  // D minor, relative of F
    expect(keyPrefersFlats(9, true)).toBe(false); // A minor, relative of C
  });
  it('prettySym turns ASCII accidentals into music symbols', () => {
    expect(prettySym('Bbm7b5')).toBe('B♭m7♭5');
    expect(prettySym('F#7')).toBe('F♯7');
    expect(prettySym('Ebmaj7')).toBe('E♭maj7');
  });
  it('degreeLabel names semitones above the root, and marks quarter tones', () => {
    expect(degreeLabel(0)).toBe('R');
    expect(degreeLabel(10)).toBe('♭7');
    expect(degreeLabel(19)).toBe('5');
    expect(degreeLabel(3.5)).toBe('¼');
  });
});

describe('diatonicChords', () => {
  const MAJOR = [0, 2, 4, 5, 7, 9, 11];
  it('builds the seven triads and sevenths of C major', () => {
    const c = diatonicChords(MAJOR, 0);
    expect(c.map(x => x.roman)).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']);
    expect(c.map(x => x.triad)).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim']);
    expect(c.map(x => x.seventh)).toEqual(['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7♭5']);
    expect(c[4].iv7).toEqual([0, 4, 7, 10]);
  });
  it('spells a flat key with flats', () => {
    const f = diatonicChords(MAJOR, 5);
    expect(f[3].triad).toBe('B♭');
  });
  it('marks altered degrees in a minor scale', () => {
    const aeolian = diatonicChords([0, 2, 3, 5, 7, 8, 10], 9);
    expect(aeolian.map(x => x.roman)).toEqual(['i', 'ii°', '♭III', 'iv', 'v', '♭VI', '♭VII']);
    const harmonic = diatonicChords([0, 2, 3, 5, 7, 8, 11], 9);
    expect(harmonic[2].roman).toBe('♭III+');
    expect(harmonic[4].seventh).toBe('E7');
  });
  it('returns nothing for scales that are not seven equal-tempered notes', () => {
    expect(diatonicChords([0, 2, 4, 7, 9], 0)).toEqual([]);
    expect(diatonicChords([0, 1.5, 3.5, 5, 7, 8.5, 10], 0)).toEqual([]);
  });
});
