import { describe, it, expect } from 'vitest';
import D from '../src/data.js';
import { QUAL } from '../src/theory.js';
import { parseChart } from '../src/mytunes.js';
import { ARP_ORDER, ARP_PATTERNS, ARPS, toneLabel, windowNotes, arpPositions, arpSeq, PROGRESSIONS, progChords, bestPosition, changesLine, leaps } from '../src/arpeggios.js';

const STD = [40, 45, 50, 55, 59, 64];
const DADGAD = [38, 45, 50, 55, 57, 62];
const ivOf = type => QUAL.find(([k]) => k === type)[1];

describe('arpeggios', () => {
  it('cover every chord the app knows, once', () => {
    expect(new Set(ARP_ORDER).size).toBe(ARP_ORDER.length);
    expect(ARPS().map(c => c.id).sort()).toEqual(D.CHORDS.map(c => c.id).sort());
    ARP_ORDER.forEach(id => expect(D.CHORDS.find(c => c.id === id)).toBeTruthy());
  });
  it('label every chord tone', () => {
    D.CHORDS.forEach(c => c.iv.forEach(x => expect(toneLabel(x, c.id)).not.toMatch(/^\d\d$/)));
    expect(toneLabel(9, 'dim7')).toBe('𝄫7');
    expect(toneLabel(14, 'nine')).toBe('9');
  });
  it('find only chord tones in the window, low to high, root to root', () => {
    for (const tun of [STD, DADGAD]) for (const c of D.CHORDS) for (let root = 0; root < 12; root++) for (const start of arpPositions(root, tun)) {
      const L = windowNotes(c.iv, root, start, tun);
      const pcs = c.iv.map(x => (root + x) % 12);
      L.forEach((n, i) => {
        expect(pcs).toContain(n.p);
        expect(n.f).toBeGreaterThanOrEqual(start); expect(n.f).toBeLessThanOrEqual(Math.min(12, start + 4));
        expect(n.m).toBe(tun[n.s] + n.f);
        if (i) expect(n.m).toBeGreaterThan(L[i - 1].m);
      });
      // every position the warm-up offers has at least one root and the chord's other tones
      expect(L.length).toBeGreaterThanOrEqual(3);
      expect(L[0].iv).toBe(0);
    }
  });
  it('patterns start and end on the root and use only the window\'s notes', () => {
    const L = windowNotes([0, 4, 7, 11], 7, 2, STD);
    Object.keys(ARP_PATTERNS).forEach(p => {
      const seq = arpSeq(L, p);
      expect(seq.length).toBeGreaterThan(L.length - 1);
      expect(seq[0].iv).toBe(0);
      expect(seq[seq.length - 1].iv).toBe(0);
      seq.forEach(n => expect(L).toContain(n));
    });
    // up and down: no note twice in a row
    const ud = arpSeq(L, 'updown');
    ud.forEach((n, i) => { if (i) expect(n).not.toBe(ud[i - 1]); });
  });
});

describe('arpeggio changes', () => {
  it('spell every progression with chord types the app knows', () => {
    PROGRESSIONS.forEach(p => {
      expect(p.chords.length).toBeGreaterThan(1);
      p.chords.forEach(([st, type]) => { expect(st).toBeGreaterThanOrEqual(0); expect(st).toBeLessThan(12); expect(QUAL.some(([k]) => k === type)).toBe(true); });
    });
    expect(progChords(PROGRESSIONS.find(p => p.id === 'iiVI'), 0)).toEqual([{ root: 2, type: 'm7' }, { root: 7, type: '7' }, { root: 0, type: 'maj7' }, { root: 0, type: 'maj7' }]);
  });
  it('choose a position where every chord of every progression has notes, in every key', () => {
    PROGRESSIONS.forEach(p => { for (let key = 0; key < 12; key++) {
      const ch = progChords(p, key), st = bestPosition(ch, ivOf, key, STD);
      expect(st).toBeGreaterThanOrEqual(0); expect(st).toBeLessThanOrEqual(8);
      ch.forEach(c => expect(windowNotes(ivOf(c.type), c.root, st, STD, false).length).toBeGreaterThanOrEqual(4));
    } });
  });
  it('keep the line in one position and move to the nearest note at each change', () => {
    const ch = progChords(PROGRESSIONS.find(p => p.id === 'Ivi'), 0);
    const st = bestPosition(ch, ivOf, 0, STD);
    const wins = ch.map(c => windowNotes(ivOf(c.type), c.root, st, STD, false));
    const segs = changesLine(wins, 8, 'nearest');
    expect(segs.map(s => s.length)).toEqual([8, 8, 8, 8]);
    segs.forEach((sg, i) => sg.forEach(n => { expect(wins[i]).toContain(n); expect(n.f).toBeGreaterThanOrEqual(st); expect(n.f).toBeLessThanOrEqual(st + 4); }));
    expect(segs[0][0].iv).toBe(0);
    // at a change the hand moves by a step or two, never a leap
    leaps(segs).forEach(d => expect(d).toBeLessThanOrEqual(4));
    // inside a chord, each note is the next one up or down in the window
    segs.forEach((sg, i) => sg.forEach((n, k) => { if (k) expect(Math.abs(wins[i].indexOf(n) - wins[i].indexOf(sg[k - 1]))).toBe(1); }));
    // root mode starts each chord on its root
    changesLine(wins, 8, 'root').forEach(sg => expect(sg[0].iv).toBe(0));
  });
  it('reads your own chords as typed', () => {
    const { bars, errors } = parseChart('Dm7 G7 | Cmaj7 | Bø E7b9');
    expect(errors).toEqual([]);
    expect(bars.flatMap(b => b.split(' '))).toEqual(['Dm7', 'G7', 'Cmaj7', 'Bm7b5', 'E7b9']);
  });
});
