import { describe, it, expect } from 'vitest';
import D from '../src/data.js';
import { parseChord } from '../src/theory.js';
import { LEVELS, genMelody, rhythmPiece, pieceLength } from '../src/content/reading.js';
import { parseTime } from '../src/notation.js';

const SOUNDS = new Set(['clave', 'bell', 'low', 'mid', 'high', 'shaker', 'clap', 'chick', 'hat', 'ride']);
const Q = { w: 4, h: 2, q: 1, 8: 0.5, 16: 0.25 };

describe('rhythms', () => {
  it('every track, variation and fill fits its cycle', () => {
    for (const r of D.RHYTHMS) {
      for (const [k, p] of Object.entries(r.tracks)) { expect(SOUNDS.has(k), r.id + ' ' + k).toBe(true); expect(p.length, r.id + ' ' + k).toBe(r.steps); }
      for (const v of (r.var && r.var.variations) || []) for (const p of Object.values(v.tracks)) expect(p.length, r.id + ' ' + v.name).toBe(r.steps);
      for (const f of (r.var && r.var.fills) || []) for (const p of Object.values(f.tracks)) expect(p.length, r.id + ' ' + f.name).toBe(r.steps * (f.cycles || 1));
    }
  });
  it('ids are unique and each has a style', () => {
    const ids = D.RHYTHMS.map(r => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const r of D.RHYTHMS) expect(D.REGIONS.some(g => g.id === r.region), r.id).toBe(true);
  });
});

describe('tunes, drills and exercises', () => {
  it('every chord symbol parses and forms cover the bars', () => {
    for (const t of D.TUNES) {
      t.bars.forEach(b => b.split(' ').forEach(c => expect(parseChord(c), t.id + ' ' + c).toBeTruthy()));
      if (t.form) expect(t.form.reduce((a, f) => a + f[1], 0), t.id).toBe(t.bars.length);
    }
  });
  it('drills point at real backings and their bars add up', () => {
    const ids = new Set();
    for (const d of D.DRILLS) {
      expect(ids.has(d.id), d.id).toBe(false); ids.add(d.id);
      const b = d.backing || {};
      if (b.rhythm) expect(D.RHYTHMS.some(r => r.id === b.rhythm), d.id).toBe(true);
      if (b.groove) expect(D.GROOVES[b.groove], d.id).toBeTruthy();
      for (const v of d.variations) if (v.bars) {
        const [n, u] = (v.time || '4/4').split('/').map(Number);
        v.bars.forEach(bar => expect(bar.reduce((a, x) => a + Q[x.d] * (x.dot ? 1.5 : 1), 0), d.id + ' ' + v.name).toBeCloseTo(n * 4 / u, 6));
      }
    }
  });
  it('every technique exercise has variations', () => {
    for (const ex of D.EXERCISES) expect((ex.vars && ex.vars.variations || []).length, ex.id).toBeGreaterThanOrEqual(5);
  });
});

describe('sight-reading generators', () => {
  it('fill every bar exactly, at every level', () => {
    for (const L of LEVELS) for (let i = 0; i < 25; i++) for (const p of [genMelody(L), rhythmPiece(L)]) {
      const ts = parseTime(p.time);
      expect(pieceLength(p), 'level ' + L.id).toBeCloseTo(ts.barQ * p.bars.length, 6);
    }
  });
});
