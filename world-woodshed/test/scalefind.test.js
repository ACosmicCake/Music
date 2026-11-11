import { describe, it, expect } from 'vitest';
import D from '../src/data.js';
import { findScales, catalogue, profile } from '../src/scalefind.js';
import { WORLD_SCALES, MORE_NAMES } from '../src/content/scales-world.js';

const list = catalogue(D);
const best = (notes, opts = {}) => { const r = findScales(notes, { list, ...opts })[0]; return r.scale.id + ':' + r.tonic; };

describe('the scale catalogue', () => {
  it('has every scale once, with valid steps and styles that exist', () => {
    const ids = list.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const regions = new Set(D.REGIONS.map(r => r.id));
    for (const s of list) {
      expect(s.steps[0]).toBe(0);
      s.steps.forEach((x, i) => { if (i) expect(x).toBeGreaterThan(s.steps[i - 1]); expect(x).toBeLessThan(12); });
      (s.styles || []).forEach(id => expect(regions.has(id), s.id + ' → ' + id).toBe(true));
      expect(s.name && s.region && s.note).toBeTruthy();
    }
    WORLD_SCALES.forEach(s => expect(s.styles.length, s.id).toBeGreaterThan(0));
    Object.keys(MORE_NAMES).forEach(id => expect(D.SCALES.some(s => s.id === id), id).toBe(true));
  });
  it('lists no world scale with the same notes as one the app already has', () => {
    const key = s => s.steps.join(',');
    const own = new Set(D.SCALES.map(key));
    WORLD_SCALES.forEach(s => expect(own.has(key(s)), s.id).toBe(false));
  });
  it('ties the app’s scales to the styles that use them', () => {
    expect(list.find(s => s.id === 'phrydom').styles).toContain('flamenco');
    expect(list.find(s => s.id === 'bayati').styles).toContain('arabic');
  });
});

describe('finding the scale of a phrase', () => {
  it('finds a scale run up and down from its tonic', () => {
    expect(best([62, 64, 65, 67, 69, 70, 72, 74, 72, 70, 69, 67, 65, 64, 62])).toBe('aeolian:2');   // D natural minor
    expect(best([60, 62, 64, 65, 67, 69, 71, 72, 71, 69, 67, 65, 64, 62, 60])).toBe('major:0');
    expect(best([64, 65, 68, 69, 71, 72, 74, 76, 74, 72, 71, 69, 68, 65, 64])).toBe('phrydom:4'); // E Phrygian dominant
    expect(best([57, 60, 62, 64, 67, 69, 67, 64, 62, 60, 57])).toBe('minpent:9');
  });
  it('hears the home note in where a phrase lands', () => {
    // the same seven white notes, landing on D and dwelling there: D Dorian, not C major
    expect(best([62, 64, 65, 67, 69, 71, 72, 74, 72, 71, 69, 65, 64, 62, 62, 62])).toBe('dorian:2');
  });
  it('holds the tonic you choose', () => {
    const r = findScales([60, 62, 64, 65, 67, 69, 71], { list, tonic: 9 })[0];
    expect(r.tonic).toBe(9);
    expect(r.scale.id).toBe('aeolian');
  });
  it('tells quarter tones from a guitar tuned a little off', () => {
    // Bayati on D: E half-flat, played on a fretless or bent
    const bayati = [62, 63.5, 65, 67, 69, 70, 72, 74, 72, 70, 69, 67, 65, 63.5, 62];
    expect(best(bayati)).toMatch(/^(bayati|shur):2$/);
    // the same run fretted, 15 cents sharp: D natural minor (or Phrygian), not a quarter-tone scale
    const sharp = [62, 64, 65, 67, 69, 70, 72, 74, 72, 70, 69, 67, 65, 64, 62].map(m => m + 0.15);
    expect(best(sharp)).toBe('aeolian:2');
    expect(profile(sharp).tune).toBe(15);
  });
  it('names the notes missing and outside, and the same notes from another home', () => {
    const r = findScales([60, 62, 64, 67, 69, 66], { list }).find(x => x.scale.id === 'major' && x.tonic === 0);
    expect(r.outside).toEqual([6]);
    expect(r.missing).toEqual([5, 11]);
    const a = findScales([57, 60, 62, 64, 67, 69], { list }).find(x => x.scale.id === 'minpent' && x.tonic === 9);
    expect(a.same.some(x => x.scale.id === 'majpent' && x.tonic === 0)).toBe(true);
  });
  it('finds world scales that are not in the rest of the app', () => {
    expect(best([60, 62, 64, 67, 71, 72, 71, 67, 64, 62, 60])).toBe('hamsadhwani:0');
    expect(best([62, 63, 67, 68, 72, 74, 72, 68, 67, 63, 62])).toBe('iwato:2');
    expect(best([60, 62, 63, 66, 67, 69, 70, 72, 70, 69, 67, 66, 63, 62, 60])).toBe('misheberakh:0'); // also Maqam Nikriz
  });
});
