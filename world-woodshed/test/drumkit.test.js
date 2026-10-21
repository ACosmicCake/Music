import './env.js';
import { describe, it, expect } from 'vitest';
import D from '../src/data.js';
import { SAMPLE_SETS } from '../src/content/samples.js';
import { KITS, kitFor, sampleFor } from '../src/drumkit.js';

/* The recorded percussion behind A.hit() (src/drumkit.js): every voice the rhythms and the metronome
   use has a recording, or keeps its synth on purpose. */

const SYNTH_ON_PURPOSE = new Set(['chick']); // a muted guitar chop in most rhythms, not a drum
// every track of every rhythm and band groove (rhythm.js plays a track by its name), and the metronome
const voices = [...new Set(D.RHYTHMS.flatMap(r => Object.keys(r.tracks))
  .concat(Object.values(D.GROOVES).flatMap(g => Object.keys(g.perc || {})), ['click', 'clickHi']))];

describe('drum kit', () => {
  it('has a recording for every voice the rhythms and the metronome use', () => {
    voices.filter(v => !SYNTH_ON_PURPOSE.has(v)).forEach(v => {
      const s = sampleFor(v, 'drums');
      expect(s, v).toBeTruthy();
      expect(SAMPLE_SETS[s[0]], v + ' → ' + s[0]).toBeTruthy();
    });
    SYNTH_ON_PURPOSE.forEach(v => expect(sampleFor(v, 'drums')).toBeNull());
  });
  it('every kit plays low, mid and high on instruments in the sample set (or the synth, for the tabla)', () => {
    Object.entries(KITS).forEach(([id, k]) => ['low', 'mid', 'high'].forEach(v => {
      if (id === 'tabla') expect(k[v]).toBeNull();
      else expect(SAMPLE_SETS[k[v]], id + ' ' + v).toBeTruthy();
    }));
  });
  it('gives each style its own hand drums', () => {
    expect(sampleFor('low', kitFor('cuba'))[0]).toBe('conga-low');
    expect(sampleFor('high', kitFor('arabic'))[0]).toBe('darbuka-tek');
    expect(sampleFor('low', kitFor('arabic'))[0]).toBe('darbuka-doum');
    expect(sampleFor('mid', kitFor('flamenco'))[0]).toBe('cajon-slap');
    expect(sampleFor('high', kitFor('rock'))[0]).toBe('snare');
    expect(sampleFor('low', kitFor('hindustani'))).toBeNull(); // tabla: synth until there is a free recording
    expect(sampleFor('bell', 'congas', 'cuba')[0]).toBe('cowbell');
    expect(sampleFor('bell', 'congas', 'westafrica')[0]).toBe('agogo');
  });
  it('every rhythm region has a kit', () => {
    D.RHYTHMS.forEach(r => expect(KITS[kitFor(r.region)], r.id).toBeTruthy());
  });
  it('accents the metronome a fifth higher on the same woodblock', () => {
    expect(sampleFor('click')).toEqual(['wood', 0]);
    expect(sampleFor('clickHi')).toEqual(['wood', 7, 1.7]);
  });
});
