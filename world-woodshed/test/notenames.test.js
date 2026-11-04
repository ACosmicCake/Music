import { describe, it, expect } from 'vitest';
import { noteItems, chordItems, poolFor, openLevel, noteCard, chordCard, chordRoots, spellNote, RANGE, QUALITIES } from '../src/content/notenames.js';

const seq = seed => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const LPC = [0, 2, 4, 5, 7, 9, 11];

describe('note items', () => {
  it('level 1 stays on the staff, level 2 reaches three ledger lines, level 3 adds both spellings', () => {
    const t1 = poolFor('t', 'notes', 1).map(x => noteCard(x.id).midi);
    expect(Math.min(...t1)).toBe(62); expect(Math.max(...t1)).toBe(79);
    const b2 = poolFor('b', 'notes', 2).map(x => noteCard(x.id).midi);
    expect(Math.min(...b2)).toBe(33); expect(Math.max(...b2)).toBe(67);
    expect(poolFor('t', 'notes', 2).every(x => noteCard(x.id).alter === 0)).toBe(true);
    const ids = poolFor('t', 'notes', 3).map(x => x.id);
    expect(ids).toContain('n:t:61:s'); expect(ids).toContain('n:t:61:f');
    expect(noteCard('n:t:61:f').full).toBe('D♭4');
    expect(noteCard('n:b:60').full).toBe('C4');
  });
  it('the grand staff asks notes from both staves', () => {
    const g = poolFor('g', 'notes', 1);
    expect(g.length).toBe(poolFor('t', 'notes', 1).length + poolFor('b', 'notes', 1).length);
  });
  it('spells sharps and flats', () => {
    expect(spellNote(70, 'f').name).toBe('B♭');
    expect(spellNote(70, 's').name).toBe('A♯');
    expect(noteItems().every(x => x.tier >= 1 && x.tier <= 3)).toBe(true);
  });
});

describe('chords', () => {
  it('spells every root third by third, with no double or odd accidentals', () => {
    Object.keys(QUALITIES).forEach(q => {
      const roots = chordRoots(q, false);
      expect(roots.length, q).toBeGreaterThan(5);
      roots.forEach(r => {
        const c = chordCard('c:t:' + q + ':0', 3, seq(r.L * 3 + r.alter + 7));
        expect(c).toBeTruthy();
      });
    });
    expect(chordRoots('maj', true).map(r => 'CDEFGAB'[r.L])).toEqual(['C', 'F', 'G']);
    expect(chordRoots('min', true).map(r => 'CDEFGAB'[r.L])).toEqual(['D', 'E', 'A']);
    expect(chordRoots('dim', true).map(r => 'CDEFGAB'[r.L])).toEqual(['B']);
  });
  it('every chord item makes a card on every level it belongs to, inside its range, with the right pitches', () => {
    chordItems().forEach(it => {
      for (let lv = it.tier; lv <= 3; lv++) for (let k = 1; k <= 12; k++) {
        const c = chordCard(it.id, lv, seq(k * 97 + lv));
        expect(c, it.id + ' L' + lv).toBeTruthy();
        const [, s, q, inv] = it.id.split(':');
        // every note's letter and alteration give its pitch
        c.notes.forEach(n => expect(((LPC[n.L] + n.alter) % 12 + 12) % 12).toBe(((n.midi % 12) + 12) % 12));
        // the pitch classes are the chord's, from the root
        const rootPc = ((LPC[c.root.L] + c.root.alter) % 12 + 12) % 12;
        const pcs = new Set(c.notes.map(n => ((n.midi - rootPc) % 12 + 12) % 12));
        expect([...pcs].sort((a, b) => a - b)).toEqual([...QUALITIES[q].iv].sort((a, b) => a - b));
        // the lowest note is the inversion's bass
        expect(((c.notes[0].midi - rootPc) % 12 + 12) % 12).toBe(QUALITIES[q].iv[+inv]);
        const rangeOf = st => (lv === 1 ? RANGE[st].in : RANGE[st].out);
        c.treble.forEach(m => { expect(m).toBeGreaterThanOrEqual(rangeOf('t')[0]); expect(m).toBeLessThanOrEqual(rangeOf('t')[1]); });
        c.bass.forEach(m => { expect(m).toBeGreaterThanOrEqual(rangeOf('b')[0]); expect(m).toBeLessThanOrEqual(rangeOf('b')[1]); });
        if (s === 'g') { expect(c.bass.length).toBe(1); expect(c.treble.length).toBe(QUALITIES[q].iv.length); }
        if (lv < 3) expect(c.notes.every(n => n.alter === 0)).toBe(true);
      }
    });
  });
  it('names inversions with their bass note', () => {
    const c = chordCard('c:t:maj:1', 2, () => 0);
    expect(c.symbol).toMatch(/^[CFG]\/[EAB]$/);
    expect(c.name).toMatch(/first inversion/);
  });
});

describe('levels', () => {
  it('opens the next level at 80% tried and 75% right', () => {
    expect(openLevel('t', 'notes', {})).toBe(1);
    const seen = {};
    poolFor('t', 'notes', 1).forEach(x => { seen[x.id] = { ema: 0.9 }; });
    expect(openLevel('t', 'notes', seen)).toBe(2);
    expect(openLevel('b', 'notes', seen)).toBe(1);
  });
});
