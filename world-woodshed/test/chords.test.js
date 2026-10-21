import { describe, it, expect } from 'vitest';
import { chordMidis, parseChord } from '../src/theory.js';

/* chordMidis: the close voicing the ear trainers and the explorer play. root is a pitch class (0 = C). */

describe('chordMidis', () => {
  it('puts the named root in the bass: C major is C E G, not E G♯ B', () => {
    expect(chordMidis(0, [0, 4, 7])).toEqual([48, 52, 55]); // C3 E3 G3
    for (let pc = 0; pc < 12; pc++) expect(chordMidis(pc, [0, 4, 7])[0] % 12, 'pc ' + pc).toBe(pc);
  });
  it('keeps the bass in the guitar\'s middle register, G2 to F♯3', () => {
    for (let pc = 0; pc < 12; pc++) {
      const r = chordMidis(pc, [0])[0];
      expect(r).toBeGreaterThanOrEqual(43);
      expect(r).toBeLessThanOrEqual(54);
    }
  });
  it('accepts any integer root and stacks the intervals on it', () => {
    expect(chordMidis(12, [0, 3, 7])).toEqual(chordMidis(0, [0, 3, 7]));
    expect(chordMidis(-1, [0])).toEqual(chordMidis(11, [0]));
    const c = parseChord('Bbmaj7');
    expect(chordMidis(c.root, c.iv)).toEqual([46, 50, 53, 57]);
  });
});
