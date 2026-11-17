import './env.js';
import { describe, it, expect } from 'vitest';
import E from '../src/engine.js';
import D from '../src/data.js';
import { warmScales } from '../src/routines.js';
import { catalogue } from '../src/scalefind.js';

const RAGAS = { bilawal: [0, 2, 4, 5, 7, 9, 11], marwa: [0, 1, 4, 6, 9, 11], kirwani: [0, 2, 3, 5, 7, 8, 11], bhupali: [0, 2, 4, 7, 9] };

describe('ragas listed under their own names', () => {
  it('have their notes and can be picked in the Scale warm-up and on the North India page', () => {
    const hind = D.REGIONS.find(r => r.id === 'hindustani');
    for (const [id, steps] of Object.entries(RAGAS)) {
      expect(D.SCALES.find(s => s.id === id).steps).toEqual(steps);
      expect(warmScales().some(s => s.id === id)).toBe(true);
      expect(hind.scales).toContain(id);
    }
  });
  it('share the notes of the scale they name in same, which ear training and the scale finder use instead', () => {
    const alias = D.SCALES.filter(s => s.same);
    expect(alias.length).toBeGreaterThan(0);
    const items = E.universe('scales').map(x => x.id), list = catalogue(D);
    for (const a of alias) {
      expect(D.SCALES.find(s => s.id === a.same).steps).toEqual(a.steps);
      expect(items).not.toContain(a.id);
      expect(list.some(s => s.id === a.id)).toBe(false);
      const base = list.find(s => s.id === a.same);
      expect((base.aka + ' ' + base.more.join(' '))).toContain(a.name.replace('Raga ', ''));
      expect(base.styles).toContain('hindustani');
    }
  });
});
