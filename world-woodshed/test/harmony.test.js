import { describe, it, expect } from 'vitest';
import D from '../src/data.js';
import { parseChord } from '../src/theory.js';
import { loadTuneNotes, loadDrills } from '../src/content/lazy.js';
import SOLO_DRILLS from '../src/content/drills-solo.js';
import { parseKey, keyName, parseNumeral, numeralRoot, chartNumerals, prettyNumeral } from '../src/harmony.js';

/* Roman numerals (src/harmony.js) and the jazz standards' walk-throughs (src/content/tunes-harmony.js):
   every numeral must name its chord's root and the right kind of 3rd in its key. */

describe('numerals', () => {
  it('reads keys and numerals', () => {
    expect(parseKey('Bb')).toEqual({ pc: 10, minor: false });
    expect(parseKey('Ebm')).toEqual({ pc: 3, minor: true });
    expect(keyName('Gm')).toBe('G minor');
    expect(keyName('Bb', 1)).toBe('B major');
    expect(keyName('Gm', 3)).toBe('B♭ minor');
    expect(numeralRoot('V7', 0)).toBe(7);
    expect(numeralRoot('bIII6', 9)).toBe(0); // C6 in A minor
    expect(numeralRoot('V7/ii', 0)).toBe(9); // A7 in C
    expect(numeralRoot('#iv°7', 5)).toBe(11); // B°7 in F
    expect(parseNumeral('iiø7').minor).toBe(true);
    expect(prettyNumeral('bvi7 V7/bII')).toBe('♭vi7 V7/♭II');
  });
  it('marks where the key changes', () => {
    const rows = chartNumerals({ rn: ['ii7 V7', 'Imaj7', 'ii7:G V7:G'], sections: [{ bars: [1, 3], key: 'C' }] });
    expect(rows.flat().map(x => x.newKey)).toEqual([true, false, false, true, false]);
  });
});

describe('the Repertoire tunes', () => {
  it('explains every tune and how to solo over it', async () => {
    await loadTuneNotes();
    for (const t of D.TUNES) {
      expect(t.harmony, t.id).toBeTruthy();
      for (const k of ['harmony', 'theory']) expect(t.harmony.solo[k].length, t.id + ' ' + k).toBeGreaterThan(1);
    }
    expect(D.HARMONY_WORDS.length).toBeGreaterThan(5);
  });
  it('sections cover every bar in order', async () => {
    await loadTuneNotes();
    for (const t of D.TUNES.filter(x => x.harmony)) {
      let next = 1;
      for (const s of t.harmony.sections) {
        expect(s.bars[0], t.id + ' ' + s.title).toBe(next);
        expect(s.bars[1]).toBeGreaterThanOrEqual(s.bars[0]);
        expect(parseKey(s.key), t.id + ' ' + s.key).not.toBe(null);
        expect(s.text, t.id).toBeTruthy();
        next = s.bars[1] + 1;
      }
      expect(next - 1, t.id).toBe(t.bars.length);
    }
  });
  it('every numeral names its chord', async () => {
    await loadTuneNotes();
    for (const t of D.TUNES.filter(x => x.harmony)) {
      expect(t.harmony.rn.length, t.id).toBe(t.bars.length);
      chartNumerals(t.harmony).forEach((bar, bi) => {
        const chords = t.bars[bi].split(' ');
        expect(bar.length, t.id + ' bar ' + (bi + 1)).toBe(chords.length);
        bar.forEach((x, ci) => {
          const c = parseChord(chords[ci]), n = parseNumeral(x.rn), where = t.id + ' bar ' + (bi + 1) + ' ' + chords[ci] + ' = ' + x.rn + ' in ' + x.key;
          expect(n, where).not.toBe(null);
          expect(numeralRoot(x.rn, parseKey(x.key).pc), where).toBe(c.root);
          expect(n.minor, where).toBe(c.third === 3);
          const kind = c.iv.join() === '0,3,6,10' ? 'ø7' : c.iv.join() === '0,3,6,9' ? '°7' : c.seventh === 11 ? 'maj7' : c.seventh === 10 ? '7' : c.seventh === 9 ? '6' : '';
          // a dominant with extensions (E9, D7♯11) may be written as V7 or with its extension
          expect([kind, kind === '7' ? chords[ci].replace(/^[A-G][b#]?m?/, '') : kind], where).toContain(n.rest);
        });
      });
    }
  });
});

describe('improvising drills', () => {
  it('every solo note belongs to a drill and has both parts', async () => {
    await loadDrills();
    for (const [id, solo] of Object.entries(SOLO_DRILLS)) {
      const d = D.DRILLS.find(x => x.id === id);
      expect(d, id).toBeTruthy();
      expect(d.solo).toBe(solo);
      expect(solo.harmony.length && solo.theory.length, id).toBeTruthy();
    }
  });
});
