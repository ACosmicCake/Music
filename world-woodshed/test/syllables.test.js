import { describe, it, expect } from 'vitest';
import D from '../src/data.js';
import { sayRow, takaRow, syllableFor } from '../src/syllables.js';

describe('rhythm syllables', () => {
  it('gives every rhythm a syllable on each step that sounds, and a counting row of its length', () => {
    for (const r of D.RHYTHMS) {
      const say = sayRow(r);
      expect(say.length, r.id).toBe(r.steps);
      if (!r.labels) for (let i = 0; i < r.steps; i++) {
        const sounds = Object.values(r.tracks).some(p => p[i] && p[i] !== '.');
        expect(!!say[i], r.id + ' step ' + i).toBe(sounds);
      }
      const t = takaRow(r);
      if (t) { expect(t.length, r.id).toBe(r.steps); expect(t[0], r.id).toBe('ta'); }
    }
  });
  it('counts in Takadimi', () => {
    expect(takaRow({ steps: 8, spb: 4 })).toEqual(['ta', 'ka', 'di', 'mi', 'ta', 'ka', 'di', 'mi']);
    expect(takaRow({ steps: 6, spb: 3 })).toEqual(['ta', 'ki', 'da', 'ta', 'ki', 'da']);
    expect(takaRow({ steps: 7, spb: 1, unit: '♪', groups: [2, 2, 3] })).toEqual(['ta', 'di', 'ta', 'di', 'ta', 'ki', 'da']);
    expect(takaRow({ steps: 8, spb: 1, unit: 'matra', groups: [4, 4] })).toBe(null);
  });
  it('says the player\'s own part first and loud hits in capitals', () => {
    const r = { steps: 4, region: 'rock', target: 'high', tracks: { low: 'x.x.', high: 'X.x.', hat: 'xxxx' } };
    expect(sayRow(r)).toEqual(['TA', 'ts', 'ta', 'ts']);
    expect(sayRow({ steps: 4, region: 'cuba', target: 'clave', tracks: { clave: 'xx.x' } })).toEqual(['to', 'tok', '', 'tok']);
    expect(syllableFor('low', 'turkbalkan')).toBe('dum');
    expect(syllableFor('high', 'turkbalkan')).toBe('tek');
  });
});
