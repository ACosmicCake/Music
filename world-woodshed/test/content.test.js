import { describe, it, expect } from 'vitest';
import D from '../src/data.js';
import { LEVELS, STAGES, withAccidentals, genMelody, rhythmPiece, pieceLength, playLength, playOrder, attacks } from '../src/content/reading.js';
import { parseChord } from '../src/theory.js';
import { parseTime, keyScale, KEYS } from '../src/notation.js';
import { loadDrills } from '../src/content/lazy.js';
import { patternGrid, backingRows } from '../src/countgrid.js';

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
  it('every hand-written drill pattern fits its count grid', async () => {
    await loadDrills();
    for (const d of D.DRILLS) for (const v of d.variations) {
      const dg = d.grid || {}, backing = backingRows(d.backing, D);
      if (v.grid) expect(patternGrid(Object.assign({}, dg, v.grid), { backing }), d.id + ' ' + v.name).toBeTruthy();
    }
  });
  it('every style links to rhythms, scales and drills that exist', async () => {
    await loadDrills();
    for (const r of D.REGIONS) {
      r.rhythms.forEach(id => expect(D.RHYTHMS.some(x => x.id === id), r.id + ' ' + id).toBe(true));
      r.scales.forEach(id => expect(D.SCALES.some(x => x.id === id), r.id + ' ' + id).toBe(true));
      expect(D.DRILLS.filter(x => x.style === r.id).length, r.id).toBeGreaterThanOrEqual(4);
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
  it('with sharps and flats switched on, every level keeps its keys and makes full melodies with accidentals', () => {
    let outsideKey = 0;
    for (const L0 of LEVELS) {
      const L = withAccidentals(L0);
      expect(L.keys, 'level ' + L0.id).toEqual(L0.keys);
      for (let i = 0; i < 12; i++) {
        const m = genMelody(L, { bars: 8 });
        expect(m.bars.length, 'level ' + L0.id).toBe(8);
        expect(L0.keys, 'level ' + L0.id).toContain(m.key);
        if (!L.chords) {
          const sc = keyScale(m.key);
          expect(m.bars.flat().some(n => n.midi != null && !sc.includes(n.midi % 12)), 'level ' + L0.id).toBe(true);
          for (const n of m.bars.flat()) if (n.midi != null) {
            expect(n.midi, 'level ' + L0.id).toBeGreaterThanOrEqual(Math.min(...L0.notes));
            expect(n.midi, 'level ' + L0.id).toBeLessThanOrEqual(Math.max(...L0.notes));
            if (!sc.includes(n.midi % 12)) outsideKey++;
          }
        }
      }
    }
    expect(outsideKey).toBeGreaterThan(LEVELS.length * 3);
  });
  it('leaves the levels themselves alone', () => {
    const before = JSON.stringify(LEVELS[0]);
    withAccidentals(LEVELS[0]);
    expect(JSON.stringify(LEVELS[0])).toBe(before);
    expect(LEVELS[0].acc).toBeUndefined();
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
    expect(first(n => n.acc || n.stac)).toBe(named('Accents and staccato'));
    expect(first(n => n.slash)).toBe(named('Rhythm slashes and chord charts'));
    expect(LEVELS.find(L => genMelody(L, { bars: 8 }).repeat).id).toBe(named('Repeat signs'));
    expect(LEVELS.find(L => L.tab).id).toBe(named('Reading tab'));
  });
  it('write repeats around a phrase, played twice, with nothing tied across the jump', () => {
    const L = LEVELS.find(l => l.name === 'Repeat signs');
    for (let i = 0; i < 20; i++) {
      const bars = lens[i % 3], m = genMelody(L, { bars }), [a, b] = m.repeat;
      expect(a % 4).toBe(0);
      expect(b).toBe(Math.min(bars - 1, a + 3));
      expect(playOrder(m)).toEqual([...Array(b + 1).keys()].concat([...Array(bars - a).keys()].map(k => k + a)));
      expect(playLength(m)).toBeCloseTo(pieceLength(m) * (bars + b - a + 1) / bars, 6);
      expect(m.bars[b][m.bars[b].length - 1].tie).toBeUndefined();
      // the attacks run through the repeat: the repeated notes come twice, in order
      const ats = attacks(m);
      for (let k = 1; k < ats.length; k++) expect(ats[k].q).toBeGreaterThan(ats[k - 1].q);
    }
  });
  it('write a chord chart: slashes on the middle line with a chord over every bar, ending V then I', () => {
    const L = LEVELS.find(l => l.chords === 'slash');
    for (let i = 0; i < 20; i++) {
      const m = genMelody(L, { bars: 8 }), K = KEYS[m.key];
      expect(m.chords).toHaveLength(8);
      m.chords.forEach(cs => { expect(cs.length).toBeGreaterThan(0); cs.forEach(c => expect(parseChord(c.text), c.text).toBeTruthy()); });
      m.bars.flat().forEach(n => { if (n.midi != null) { expect(n.slash).toBe(true); expect(n.midi).toBe(71); } });
      expect(parseChord(m.chords[7][0].text).root).toBe(K.tonic);
      expect(parseChord(m.chords[6][0].text).root).toBe((K.tonic + 7) % 12);
      // each strum knows its chord
      attacks(m).forEach(a => { expect(a.slash).toBe(true); expect(a.sym).toBeTruthy(); });
    }
  });
  it('write chords as thirds and sixths, close triads in the key, or a melody with chords under its strong beats', () => {
    for (const L of LEVELS.filter(l => l.chords && l.chords !== 'slash')) for (let i = 0; i < 20; i++) {
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
