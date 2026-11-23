import './env.js';
import { describe, it, expect } from 'vitest';
import D from '../src/data.js';
import * as lib from '../src/content/scales-lib.js';
import { buildLibrary, finderList } from '../src/scalelib.js';
import { CHORD_TYPES } from '../src/chordid.js';
import { chordsWith, scalesWith, pcsOf } from '../src/identify.js';
import { CHORD_USE, SCALE_USE } from '../src/content/usage.js';
import { catalogue } from '../src/scalefind.js';

const list = finderList(buildLibrary(D, lib, {}));
const C = 48, E = 52, G = 55, Bb = 58, B = 59, D4 = 62;

describe('what could these notes be', () => {
  it('keeps notes once, in the order played', () => {
    expect(pcsOf([64, 60, 72, 67])).toEqual([4, 0, 7]);
  });
  it('narrows the chords as notes are added', () => {
    const one = chordsWith([C]), two = chordsWith([C, E]), three = chordsWith([C, E, G]), four = chordsWith([C, E, G, Bb]);
    expect(one.length).toBeGreaterThan(two.length);
    expect(two.length).toBeGreaterThan(three.length);
    expect(three.length).toBeGreaterThan(four.length);
    expect(three[0].sym).toBe('C');
    expect(three[0].complete).toBe(true);
    expect(four[0].sym).toBe('C7');
    // every chord listed holds every note played
    four.forEach(c => [0, 4, 7, 10].forEach(p => expect(c.tones.some(t => t.pc === p)).toBe(true)));
    // and says what it still needs: C7 → C9 needs D
    expect(four.find(c => c.sym === 'C9').need.map(t => t.name)).toEqual(['D']);
  });
  it('lists the scales that hold the notes, fewest notes to add first', () => {
    const s = scalesWith([C, D4, E, G, B], list);
    s.forEach(r => [0, 2, 4, 7, 11].forEach(p => expect(r.scale.steps.some(x => ((r.tonic + x) % 12 + 12) % 12 === p)).toBe(true)));
    expect(s.length).toBeLessThan(scalesWith([C, E, G], list).length);
    // C D E G B is exactly Raga Hamsadhwani; C major and Lydian each add one note
    expect(s[0].scale.id).toBe('hamsadhwani');
    expect(s[0].extra).toEqual([]);
    expect(s.slice(0, 5).some(r => r.tonic === 0 && r.scale.id === 'major' && r.extra.length === 2)).toBe(true);
  });
  it('holds the home note fixed when asked', () => {
    expect(scalesWith([C, E, G], list, { tonic: 7 }).every(r => r.tonic === 7)).toBe(true);
  });
  it('says how every chord type is used, and every core scale', () => {
    CHORD_TYPES.forEach(T => {
      const u = CHORD_USE[T.q];
      expect(u, T.q).toBeTruthy();
      expect(u.use.length).toBeGreaterThan(40);
      expect(u.styles.length).toBeGreaterThan(3);
      u.scales.forEach(id => expect(catalogue(D).some(s => s.id === id), id).toBe(true));
    });
    D.SCALES.filter(s => !s.same).forEach(s => expect(SCALE_USE[s.id], s.id).toBeTruthy());
  });
});
