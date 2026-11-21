import { describe, it, expect } from 'vitest';
import { LENGTHS, Phraser, windowBeats, mixFrom, lengthOf, barsName } from '../src/phrases.js';

describe('phrase lengths', () => {
  it('lists half, 1, 2, 4, 8 bars and mixed, with unique ids', () => {
    expect(LENGTHS.map(x => x.id).sort()).toEqual(['1', '2', '4', '8', 'half', 'mix'].sort());
    expect(lengthOf('nope').id).toBe('1');
    expect(barsName(0.5)).toBe('½ bar');
    expect(barsName(1)).toBe('1 bar');
    expect(barsName(4)).toBe('4 bars');
  });
  it('plays N bars then rests N bars', () => {
    const p = Phraser({ len: '2', bpb: 4 });
    for (let b = 0; b < 8; b++) expect(p.at(b).play).toBe(true);
    for (let b = 8; b < 16; b++) expect(p.at(b).play).toBe(false);
    expect(p.at(16).play).toBe(true);
    expect(p.at(16).round).toBe(1);
    expect(p.at(5)).toMatchObject({ bar: 2, ofBars: 2, into: 5, left: 3, beats: 8, last: false });
    expect(p.at(15).last).toBe(true);
  });
  it('splits a bar for half-bar phrases, the larger half played in an odd metre', () => {
    expect(windowBeats(0.5, 4)).toEqual({ play: 2, rest: 2 });
    expect(windowBeats(0.5, 3)).toEqual({ play: 2, rest: 1 });
    const p = Phraser({ len: 'half', bpb: 3 });
    expect([0, 1, 2, 3, 4, 5].map(b => p.at(b).play)).toEqual([true, true, false, true, true, false]);
  });
  it('works in any metre and from any beat', () => {
    const p = Phraser({ len: '4', bpb: 7 });
    expect(p.at(27).play).toBe(true);
    expect(p.at(28).play).toBe(false);
    expect(p.at(1000).round).toBe(Math.floor(1000 / 56));
  });
  it('mixes lengths, never the same one twice running, every n rounds', () => {
    let seed = 1; const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const p = Phraser({ len: 'mix', bpb: 4, from: ['1', '2', '4'], every: 2, rng });
    const lens = Array.from({ length: 20 }, (_, i) => p.round(i).bars);
    for (let i = 0; i < 20; i += 2) {
      expect(lens[i + 1]).toBe(lens[i]);
      if (i) expect(lens[i]).not.toBe(lens[i - 1]);
      expect([1, 2, 4]).toContain(lens[i]);
    }
    // rounds follow each other with no gap
    for (let i = 1; i < 20; i++) { const a = p.round(i - 1), b = p.round(i); expect(b.start).toBe(a.start + a.play + a.rest); }
    expect(p.at(p.round(3).start).next).toBe(p.round(4).bars);
  });
  it('keeps at least two lengths to mix', () => {
    expect(mixFrom(['8'])).toEqual(['1', '2', '4']);
    expect(mixFrom(['8', 'half', 'mix'])).toEqual(['half', '8']);
    expect(mixFrom(null)).toEqual(['1', '2', '4']);
  });
});
