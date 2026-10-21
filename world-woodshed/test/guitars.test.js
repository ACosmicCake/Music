import { describe, it, expect } from 'vitest';
import G from '../src/guitars.js';
import { SAMPLE_SETS } from '../src/content/samples.js';

/* The recorded guitars behind A.note (src/guitars.js): which recording each choice plays, and how a
   single-velocity recording is made softer. */

describe('guitar voices', () => {
  it('each recorded choice has a sample set covering the guitar and beyond', () => {
    Object.entries(G.VOICES).filter(([, id]) => id).forEach(([k, id]) => {
      const set = SAMPLE_SETS[id];
      expect(set, k).toBeTruthy();
      const midis = set.files.map(f => f[1]);
      // drop C with a low C (36) up to the 24th fret of the top string in standard (88)
      for (let m = 36; m <= 88; m++) expect(midis, k + ' ' + m).toContain(m);
    });
    expect(G.VOICES.synth).toBeNull();
  });
  it('falls back to nylon for an unknown or missing choice', () => {
    G.setVoice('steel'); expect(G.currentVoice()).toBe('steel');
    G.setVoice(undefined); expect(G.currentVoice()).toBe('nylon');
    G.setVoice('banjo'); expect(G.currentVoice()).toBe('nylon');
    G.setVoice('synth'); expect(G.currentVoice()).toBe('synth');
  });
});

describe('softer is darker', () => {
  it('opens the filter as the pluck gets stronger', () => {
    const cuts = [0, 0.2, 0.4, 0.6, 0.8, 1].map(v => G.cutoffFor(v));
    cuts.slice(1).forEach((c, i) => expect(c).toBeGreaterThan(cuts[i]));
    expect(cuts[0]).toBeCloseTo(1600);
    expect(cuts[5]).toBeGreaterThan(10000);
    expect(G.cutoffFor(2)).toBe(G.cutoffFor(1));
  });
  it('stays near the tone the caller asked for', () => {
    expect(G.cutoffFor(1, 1900)).toBe(3800);
    expect(G.cutoffFor(0.1, 9000)).toBe(G.cutoffFor(0.1));
  });
});
