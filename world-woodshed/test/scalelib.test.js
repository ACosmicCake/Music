import { describe, it, expect } from 'vitest';
import D from '../src/data.js';
import * as LIB from '../src/content/scales-lib.js';
import { buildLibrary, finderList, filterCards, parseSteps, stepsText, toggleStep, cleanScale, neckSpots, microName, pcKey, resolveScale, normSteps } from '../src/scalelib.js';
import { findScales } from '../src/scalefind.js';

const cards = buildLibrary(D, LIB, {});
const FAMS = new Set(LIB.FAMILIES.map(f => f[0]));

describe('the scale library', () => {
  it('has about 250 scales, each once, with valid steps, families and styles', () => {
    expect(cards.length).toBeGreaterThanOrEqual(250);
    const ids = cards.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    const regions = new Set(D.REGIONS.map(r => r.id));
    for (const c of cards) {
      expect(c.steps[0], c.id).toBe(0);
      c.steps.forEach((x, i) => { if (i) expect(x, c.id).toBeGreaterThan(c.steps[i - 1]); expect(x, c.id).toBeLessThan(12); });
      expect(c.fam.length, c.id).toBeGreaterThan(0);
      c.fam.forEach(f => expect(FAMS.has(f), c.id + ' family ' + f).toBe(true));
      (c.styles || []).forEach(id => expect(regions.has(id), c.id + ' → ' + id).toBe(true));
      expect(c.name && c.note, c.id).toBeTruthy();
    }
  });
  it('gives every set of notes one main card, the others pointing to it', () => {
    const main = new Map();
    cards.filter(c => !c.same).forEach(c => { expect(main.has(pcKey(c.steps)), c.id + ' repeats ' + (main.get(pcKey(c.steps)) || {}).id).toBe(false); main.set(pcKey(c.steps), c); });
    cards.filter(c => c.same).forEach(c => expect(main.get(pcKey(c.steps)).id, c.id).toBe(c.same));
    expect(main.size).toBeGreaterThanOrEqual(170);
  });
  it('makes the 72 melakartas by their rule', () => {
    const mk = LIB.melakartas();
    expect(mk).toHaveLength(72);
    expect(new Set(mk.map(m => pcKey(m.steps))).size).toBe(72);
    const at = n => mk[n - 1].steps.join(' ');
    expect(at(29)).toBe('0 2 4 5 7 9 11');   // Dheerasankarabharanam: major
    expect(at(22)).toBe('0 2 3 5 7 9 10');   // Kharaharapriya: Dorian
    expect(at(8)).toBe('0 1 3 5 7 8 10');    // Hanumatodi: Phrygian
    expect(at(15)).toBe('0 1 4 5 7 8 11');   // Mayamalavagowla: double harmonic
    expect(at(65)).toBe('0 2 4 6 7 9 11');   // Mechakalyani: Lydian
    expect(at(1)).toBe('0 1 2 5 7 8 9');     // Kanakangi
    expect(at(72)).toBe('0 3 4 6 7 10 11');  // Rasikapriya
    expect(cards.find(c => c.id === 'mela29').same).toBe('major');
  });
  it('finds scales by name, other name, family and number of notes', () => {
    expect(filterCards(cards, { q: 'kharaharapriya' }).map(c => c.id)).toContain('mela22');
    expect(filterCards(cards, { q: 'hijaz rast' }).map(c => c.id)).toContain('hijazrast');
    expect(filterCards(cards, { fam: 'micro' }).every(c => c.micro)).toBe(true);
    expect(filterCards(cards, { fam: 'micro' }).length).toBeGreaterThan(15);
    expect(filterCards(cards, { n: 5 }).every(c => c.steps.length === 5)).toBe(true);
    expect(filterCards(cards, { n: 8 }).every(c => c.steps.length >= 8)).toBe(true);
    expect(filterCards(cards, { fam: 'africa' }).length).toBeGreaterThan(5);
  });
  it('lets the finder name a scale from the library', () => {
    const list = finderList(cards);
    // Raga Hindol's five notes on C: C E F♯ A B, ending on C
    const r = findScales([60, 64, 66, 69, 71, 69, 66, 64, 60], { list })[0];
    expect(r.scale.id + ':' + r.tonic).toBe('hindol:0');
    expect(list.find(c => c.id === 'major').more).toContain('Melakarta 29: Dheerasankarabharanam');
  });
});

describe('your own scales', () => {
  it('reads typed steps', () => {
    expect(parseSteps('2 2 1 2 2 2 1').steps).toEqual([0, 2, 4, 5, 7, 9, 11]);
    expect(parseSteps('W H W W H W').steps).toEqual([0, 2, 3, 5, 7, 8, 10]);   // the last step home is filled in
    expect(parseSteps('1.5 1.5 2 2 1 2 2').steps).toEqual([0, 1.5, 3, 5, 7, 8, 10]);
    expect(parseSteps('2,2,2,2,2').steps).toEqual([0, 2, 4, 6, 8, 10]);
    expect(parseSteps('5 5 5').error).toMatch(/more than an octave/);
    expect(parseSteps('2 x 2').error).toMatch(/isn’t a step/);
    expect(parseSteps('12').error).toMatch(/two notes/);
    expect(parseSteps('').error).toBeTruthy();
    expect(stepsText([0, 2, 3.5, 5, 7, 9, 10.5])).toBe('2 1.5 1.5 2 2 1.5 1.5');
  });
  it('adds and takes away notes tapped on the neck, keeping the home note', () => {
    let s = [0];
    s = toggleStep(s, 7); s = toggleStep(s, 3.5); s = toggleStep(s, 15);
    expect(s).toEqual([0, 3, 3.5, 7]);
    s = toggleStep(s, 3); s = toggleStep(s, 12);
    expect(s).toEqual([0, 3.5, 7]);
  });
  it('keeps a scale from another device only if it can be played', () => {
    expect(cleanScale({ id: 'my-1', name: 'Mine', steps: [7, 0, 3, 3, 15.5], tonic: 14 })).toMatchObject({ steps: [0, 3, 3.5, 7], tonic: 2 });
    expect(cleanScale({ id: 'my-1', steps: [0] })).toBe(null);
    expect(cleanScale({ id: 'my-1', steps: 'x' })).toBe(null);
    expect(cleanScale(null)).toBe(null);
    expect(normSteps([2, 4])).toEqual([0, 2, 4]);
  });
  it('shows your scales in the library and the finder, and finds them by id', () => {
    const own = { 'my-a': { id: 'my-a', name: 'Pan’s mode', steps: [0, 1, 4, 5, 7, 9, 10], tonic: 2 } };
    const all = buildLibrary(D, LIB, own);
    const mine = all.find(c => c.id === 'my-a');
    expect(mine).toMatchObject({ own: true, fam: ['mine'] });
    expect(mine.same).toBeUndefined();   // it stands on its own even with a library scale's notes
    expect(finderList(all).some(c => c.id === 'my-a')).toBe(true);
    expect(resolveScale('my-a', D, own).name).toBe('Pan’s mode');
    expect(resolveScale('dorian', D, own).name).toBe('Dorian');
  });
});

describe('the neck', () => {
  it('places every note, quarter tones between the frets', () => {
    const strings = [{ midi: 40 }];    // low E
    const spots = neckSpots([0, 1.5], 4, strings);   // E and a quarter-flat F♯ (F + ¼)
    expect(spots.map(s => s.f)).toEqual([0, 12, 1.5]);
    expect(spots.find(s => s.f === 1.5).micro).toBe(true);
    const name = p => ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'][p];
    expect(microName(3.5, name)).toBe('E¼♭');
    expect(microName(2.4, name)).toBe('D +40¢');
    expect(microName(7, name)).toBe('G');
  });
});
