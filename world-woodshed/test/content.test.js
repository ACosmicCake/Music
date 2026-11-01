import { describe, it, expect } from 'vitest';
import D from '../src/data.js';
import { parseChord } from '../src/theory.js';
import { LEVELS, STAGES, genMelody, rhythmPiece, pieceLength, attacks } from '../src/content/reading.js';
import { parseTime, keyScale } from '../src/notation.js';
import { loadDrills } from '../src/content/lazy.js';

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
  it('drills point at real backings and their bars add up', async () => {
    await loadDrills();
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
  const lens = [4, 8, 16];
  it('fill every bar exactly, at every level and length', () => {
    for (const L of LEVELS) for (let i = 0; i < 24; i++) {
      const bars = lens[i % 3];
      for (const p of [genMelody(L, { bars }), rhythmPiece(L, { bars })]) {
        const ts = parseTime(p.time);
        expect(p.bars.length, 'level ' + L.id).toBe(bars);
        expect(pieceLength(p), 'level ' + L.id).toBeCloseTo(ts.barQ * bars, 6);
      }
    }
  });
  it('never fall back to the one-note stand-in, and keep to the level\'s notes, keys and meters', () => {
    for (const L of LEVELS) for (let i = 0; i < 20; i++) {
      const m = genMelody(L, { bars: 8 });
      expect(m.bars.length, 'level ' + L.id).toBe(8);
      expect(L.keys, 'level ' + L.id).toContain(m.key);
      expect(L.times, 'level ' + L.id).toContain(m.time);
      if (!L.chords) for (const n of m.bars.flat()) if (n.midi != null) expect(L.notes, 'level ' + L.id).toContain(n.midi);
    }
  });
  it('bring in each new figure at its own level and not before', () => {
    const has = (L, test) => { for (let i = 0; i < 30; i++) if ([genMelody(L, { bars: 8 }), rhythmPiece(L, { bars: 8 })].some(p => p.bars.flat().some(test))) return true; return false; };
    const first = test => LEVELS.find(L => has(L, test)).id;
    const named = name => LEVELS.find(L => L.name === name).id;
    expect(first(n => n.dur === 'q')).toBe(named('Quarter notes'));
    expect(first(n => n.midi == null)).toBe(named('Rests'));
    expect(first(n => n.dur === '8')).toBe(named('Eighth notes'));
    expect(first(n => n.tie)).toBe(named('Ties'));
    expect(first(n => n.dur === '16')).toBe(named('Sixteenth notes'));
    expect(first(n => n.tup && n.dur === '8')).toBe(named('Eighth-note triplets'));
    expect(first(n => n.tup && n.dur === 'q')).toBe(named('Triplets with rests and longer notes'));
    expect(first(n => n.tup && n.dur === '16')).toBe(named('Sixteenth-note triplets'));
    expect(first(n => n.chord && n.chord.length === 2)).toBe(named('Two notes at once'));
    expect(first(n => n.chord && n.chord.length === 3)).toBe(named('Three-note chords'));
  });
  it('write chords as thirds and sixths, close triads in the key, or a melody with chords under its strong beats', () => {
    for (const L of LEVELS.filter(l => l.chords)) for (let i = 0; i < 20; i++) {
      const m = genMelody(L, { bars: 8 }), sc = keyScale(m.key), flat = m.bars.flat();
      const chords = flat.filter(n => n.chord);
      expect(chords.length, 'level ' + L.id).toBeGreaterThan(0);
      for (const n of chords) {
        expect(n.midi).toBe(Math.max(...n.chord));
        const iv = n.chord[n.chord.length - 1] - n.chord[0];
        if (L.chords === 'dyad') expect([3, 4, 8, 9]).toContain(iv);
        else expect(iv).toBeLessThanOrEqual(12);
        // the chord tones are in the key (a raised 7th in minor allowed)
        n.chord.forEach(x => expect(sc.includes(x % 12) || sc.includes((x + 11) % 12), 'level ' + L.id + ' ' + m.key).toBe(true));
      }
      if (L.chords === 'triad') expect(flat.filter(n => n.midi != null).every(n => n.chord && n.chord.length === 3)).toBe(true);
      // attacks carry every pitch, so the mic can match any of them
      attacks(m).forEach(a => { const n = flat[a.i]; if (n.chord) expect(a.chord).toEqual(n.chord); });
    }
  });
  it('group the path into stages that cover every level once', () => {
    expect(STAGES[0].from).toBe(1);
    STAGES.forEach((st, k) => { expect(st.to).toBeGreaterThanOrEqual(st.from); if (k) expect(st.from).toBe(STAGES[k - 1].to + 1); });
    expect(STAGES[STAGES.length - 1].to).toBe(LEVELS.length);
    LEVELS.forEach(L => { expect(L.tips.length).toBeGreaterThanOrEqual(3); L.tips.forEach(t => expect(t, 'level ' + L.id).not.toMatch(/\?/)); });
  });
});
