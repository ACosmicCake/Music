import { describe, it, expect } from 'vitest';
import D from '../src/data.js';
import { parseChord } from '../src/theory.js';
import { VAMPS, CATS, CONSTRAINTS, roll, build, makeJudge, vampBars, marksFor } from '../src/constraints.js';

const STD = [40, 45, 50, 55, 59, 64];
const seq = (...xs) => { let i = 0; return () => xs[i++ % xs.length]; };
const one = (id, p, vamp = VAMPS[0]) => build({ id, p }, vamp, STD);
const judge = (b, vamp = VAMPS[0]) => makeJudge([].concat(b), vampBars(vamp, parseChord), 4);

describe('constraint roll', () => {
  it('has many constraints, every kind well filled, ids unique', () => {
    expect(CONSTRAINTS.length).toBeGreaterThanOrEqual(60);
    expect(new Set(CONSTRAINTS.map(c => c.id)).size).toBe(CONSTRAINTS.length);
    Object.keys(CATS).forEach(k => expect(CONSTRAINTS.filter(c => c.cat === k).length).toBeGreaterThanOrEqual(5));
    expect(CONSTRAINTS.filter(c => build({ id: c.id, p: c.make(VAMPS[0], Math.random) }, VAMPS[0], STD).checked).length).toBeGreaterThanOrEqual(25);
  });
  it('vamps play on real grooves with chords the band knows, and scales that hold their chords’ roots', () => {
    VAMPS.forEach(v => {
      expect(D.GROOVES[v.groove]).toBeTruthy();
      vampBars(v, parseChord).forEach(b => { expect(b.length).toBeGreaterThan(0); b.forEach(c => expect(v.scale.map(s => (v.tonic + s) % 12)).toContain(c.root)); });
    });
  });
  it('builds every constraint on every vamp with words and a reason', () => {
    VAMPS.forEach(v => CONSTRAINTS.forEach(c => {
      for (let k = 0; k < 4; k++) {
        const b = build({ id: c.id, p: c.make(v, Math.random) }, v, STD);
        expect(b.text.length).toBeGreaterThan(10);
        expect(b.why.length).toBeGreaterThan(10);
        expect(b.text).not.toMatch(/undefined|NaN/);
      }
    }));
  });
  it('rolls from the kinds chosen, avoids recent ones and stacks two different kinds', () => {
    for (let i = 0; i < 50; i++) {
      const r = roll(VAMPS[0], { cats: ['rhythm'] });
      expect(CONSTRAINTS.find(c => c.id === r[0].id).cat).toBe('rhythm');
    }
    const rhythm = CONSTRAINTS.filter(c => c.cat === 'rhythm').map(c => c.id);
    const r = roll(VAMPS[0], { cats: ['rhythm'], recent: rhythm.slice(1) });
    expect(r[0].id).toBe(rhythm[0]);
    for (let i = 0; i < 50; i++) {
      const [a, b] = roll(VAMPS[0], { stack: true }).map(x => CONSTRAINTS.find(c => c.id === x.id));
      expect(a.cat).not.toBe(b.cat);
      expect([a.cat, b.cat].sort().join()).not.toBe('notes,shape');
    }
    expect(roll(VAMPS[0], { only: ['thumb'] })[0].id).toBe('thumb');
  });
  it('keeps a rolled constraint the same when built again from what was saved', () => {
    const [inst] = roll(VAMPS[1], { cats: ['notes'] }, seq(0.1, 0.5, 0.9, 0.3));
    const saved = JSON.parse(JSON.stringify(inst));
    expect(build(saved, VAMPS[1], STD).text).toBe(build(inst, VAMPS[1], STD).text);
  });
  it('three notes: always the tonic and two more from the scale', () => {
    const v = VAMPS[0];
    for (let i = 0; i < 20; i++) {
      const p = CONSTRAINTS.find(c => c.id === 'three-notes').make(v, Math.random);
      expect(new Set(p.pcs).size).toBe(3);
      expect(p.pcs[0]).toBe(v.tonic);
      p.pcs.forEach(x => expect(v.scale.map(s => (v.tonic + s) % 12)).toContain(x));
    }
    const j = judge(one('three-notes', { pcs: [2, 5, 9] }));
    expect(j.hear({ midi: 62, pos: 0 }).ok).toBe(true);
    expect(j.hear({ midi: 77, pos: 1 }).ok).toBe(true);
    const bad = j.hear({ midi: 64, pos: 2 });
    expect(bad.ok).toBe(false);
    expect(bad.why).toMatch(/E/);
    expect(j.stats).toEqual({ notes: 3, kept: 2, broke: 1 });
  });
  it('chord rules follow the chord sounding at that beat', () => {
    // D Dorian vamp: bar 1 Dm7, bar 2 G7
    const j = judge(one('chord-tones', {}));
    expect(j.hear({ midi: 65, pos: 0 }).ok).toBe(true); // F in Dm7
    expect(j.hear({ midi: 71, pos: 4 }).ok).toBe(true); // B in G7
    expect(j.hear({ midi: 71, pos: 8 }).ok).toBe(false); // B not in Dm7 (bar 3 = Dm7 again)
    expect(j.hear({ midi: 71, pos: 11.9 }).ok).toBe(true); // a hair before bar 4 counts as G7
    const g = judge(one('guide-tones', {}));
    expect(g.hear({ midi: 65, pos: 0 }).ok).toBe(true); // F, 3rd of Dm7
    expect(g.hear({ midi: 60, pos: 1 }).ok).toBe(true); // C, 7th
    expect(g.hear({ midi: 62, pos: 2 }).ok).toBe(false); // D root
    const r = judge(one('no-root', {}));
    expect(r.hear({ midi: 67, pos: 1 }).ok).toBe(true);
    expect(r.hear({ midi: 67, pos: 4 }).ok).toBe(false);
  });
  it('interval rules look only at notes in the same phrase', () => {
    const j = judge(one('steps', {}));
    expect(j.hear({ midi: 60, pos: 0 }).ok).toBe(true);
    expect(j.hear({ midi: 62, pos: 0.5 }).ok).toBe(true);
    expect(j.hear({ midi: 67, pos: 1 }).ok).toBe(false);
    expect(j.hear({ midi: 50, pos: 4 }).ok).toBe(true); // after two beats' rest: a new start
    const f = judge(one('fourths', {}));
    f.hear({ midi: 60, pos: 0 });
    expect(f.hear({ midi: 65, pos: 1 }).ok).toBe(true);
    expect(f.hear({ midi: 72, pos: 2 }).ok).toBe(true);
    expect(f.hear({ midi: 75, pos: 3 }).ok).toBe(false);
  });
  it('rhythm rules: off the beat, few notes a bar, play then rest, never on 1, long notes', () => {
    const o = judge(one('offbeats', {}));
    expect(o.hear({ midi: 60, pos: 0.5 }).ok).toBe(true);
    expect(o.hear({ midi: 60, pos: 1.66 }).ok).toBe(true); // a swung eighth
    expect(o.hear({ midi: 60, pos: 3.05 }).ok).toBe(false);
    const b = judge(one('per-bar', { n: 2 }));
    expect([0, 1, 2].map(k => b.hear({ midi: 60, pos: k }).ok)).toEqual([true, true, false]);
    expect(b.hear({ midi: 60, pos: 3.9 }).ok).toBe(true); // just early for bar 2
    const pr = judge(one('play-rest', { n: 2 }));
    expect(pr.hear({ midi: 60, pos: 5 }).ok).toBe(true);
    expect(pr.hear({ midi: 60, pos: 9 }).ok).toBe(false);
    expect(pr.hear({ midi: 60, pos: 17 }).ok).toBe(true);
    const n1 = judge(one('not-on-one', {}));
    expect(n1.hear({ midi: 60, pos: 3.9 }).ok).toBe(false);
    expect(n1.hear({ midi: 60, pos: 8.02 }).ok).toBe(false);
    expect(n1.hear({ midi: 60, pos: 9 }).ok).toBe(true);
    const l = judge(one('long-notes', {}));
    l.hear({ midi: 60, pos: 0 });
    expect(l.hear({ midi: 62, pos: 1 }).ok).toBe(false);
    expect(l.hear({ midi: 62, pos: 3 }).ok).toBe(true);
  });
  it('phrase rules: where a phrase starts and how long it is', () => {
    const s = judge(one('phrase-beat', { b: 1 }));
    expect(s.hear({ midi: 60, pos: 1.05 }).ok).toBe(true);
    expect(s.hear({ midi: 60, pos: 1.5 }).ok).toBe(true); // inside the phrase: any beat
    expect(s.hear({ midi: 60, pos: 4 }).ok).toBe(false); // a new phrase on 1
    const p = judge(one('short-phrases', { n: 3 }));
    expect([0, 0.5, 1, 1.5].map(k => p.hear({ midi: 60, pos: k }).ok)).toEqual([true, true, true, false]);
    expect(p.hear({ midi: 60, pos: 3 }).ok).toBe(true);
  });
  it('neck rules check a tap by string and fret, a heard note by pitch', () => {
    const b = one('one-string', { s: 3 }); // G string
    const j = judge(b);
    expect(j.hear({ midi: 57, pos: 0, si: 3, f: 2 }).ok).toBe(true);
    expect(j.hear({ midi: 57, pos: 1, si: 2, f: 7 }).ok).toBe(false);
    expect(j.hear({ midi: 67, pos: 2 }).ok).toBe(true);
    expect(j.hear({ midi: 50, pos: 3 }).ok).toBe(false);
    const box = judge(one('two-frets', { f: 5 }));
    expect(box.hear({ midi: 45, pos: 0, si: 0, f: 5 }).ok).toBe(true);
    expect(box.hear({ midi: 45, pos: 1, si: 1, f: 0 }).ok).toBe(false);
    expect(marksFor(b.show, VAMPS[0], null, STD).length).toBe(13);
  });
  it('two stacked constraints both apply', () => {
    const j = judge([one('three-notes', { pcs: [2, 5, 9] }), one('offbeats', {})]);
    expect(j.hear({ midi: 62, pos: 0.5 }).ok).toBe(true);
    expect(j.hear({ midi: 62, pos: 2 }).ok).toBe(false);
    expect(j.hear({ midi: 64, pos: 2.5 }).ok).toBe(false);
  });
  it('lights the fretboard for note and chord rules', () => {
    const v = VAMPS[0], bars = vampBars(v, parseChord);
    const m = marksFor(one('three-notes', { pcs: [2, 5, 9] }).show, v, bars[0][0], STD);
    expect(m.length).toBeGreaterThan(10);
    expect(m.some(x => x.kind === 'root')).toBe(true);
    const g = marksFor(one('guide-tones', {}).show, v, bars[1][0], STD); // G7: B and F
    g.forEach(x => expect([11, 5]).toContain((STD[x.s] + x.f) % 12));
    expect(marksFor(null, v, null, STD)).toEqual([]);
  });
});
