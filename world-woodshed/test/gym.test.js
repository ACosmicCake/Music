import { describe, it, expect } from 'vitest';
import { GYM, FEELS, SEGS, FEEL_PRESETS, feelOpts, feelAt, nextFeel } from '../src/content/gym.js';

describe('rhythm gym', () => {
  it('has unique ids and patterns inside the bar', () => {
    expect(new Set(GYM.map(x => x.id)).size).toBe(GYM.length);
    for (const ex of GYM) for (let bar = 0; bar < 24; bar++) {
      const p = ex.pattern(bar, 7, { seg: 2 });
      expect(p.length).toBeGreaterThan(0);
      p.forEach(x => { expect(x).toBeGreaterThanOrEqual(0); expect(x).toBeLessThan(ex.beats); });
    }
  });

  it('feels are even and 3 against 2 splits two beats in three', () => {
    expect(FEELS.q3.pos).toEqual([0, 2 / 3, 4 / 3, 2, 2 + 2 / 3, 2 + 4 / 3]);
    expect(FEELS.sw.pos.slice(0, 2)).toEqual([0, 2 / 3]);
    expect(FEELS.d8.pos).toEqual([0, 0.75, 1.5, 2.25, 3, 3.75]);
    Object.values(FEELS).forEach(f => expect(f.pos.every((x, i, a) => !i || x > a[i - 1])).toBe(true));
  });

  it('feel changes hold each feel for the chosen bars and cue the bar before a change', () => {
    const ex = GYM.find(x => x.id === 'feel-mix');
    for (const p of FEEL_PRESETS.filter(x => !x.random)) for (const seg of SEGS) {
      const o = { seq: p.seq, seg };
      for (let bar = 0; bar < p.seq.length * seg * 2; bar++) {
        expect(feelAt(bar, 0, o)).toBe(FEELS[p.seq[Math.floor(bar / seg) % p.seq.length]]);
        const changes = feelAt(bar + 1, 0, o) !== feelAt(bar, 0, o);
        expect(ex.cue(bar, 0, o)).toBe(changes);
        if (changes) expect(ex.label(bar, 0, o)).toContain('next: ' + feelAt(bar + 1, 0, o).name);
      }
      expect(ex.guided(0, o)).toBe(true);
    }
  });

  it('cleans up a saved mix', () => {
    expect(feelOpts({ seq: ['t', 'nope', 'q3'], seg: 3, random: 1 })).toEqual({ seq: ['t', 'q3'], random: true, seg: 2 });
    expect(feelOpts(undefined).seq.length).toBeGreaterThan(0);
    expect(feelOpts({ seq: [] }).seq).toEqual(FEEL_PRESETS[0].seq);
    expect(feelAt(5, 0, { seq: ['t'], random: true })).toBe(FEELS.t);
  });

  it('shuffled changes never repeat a feel and are the same for one run', () => {
    const o = { seq: Object.keys(FEELS), random: true, seg: 2 };
    const seen = new Set();
    for (let bar = 0; bar < 200; bar += 2) {
      const f = feelAt(bar, 42, o);
      seen.add(f);
      expect(nextFeel(bar + 1, 42, o)).not.toBe(f);
    }
    expect(seen.size).toBe(o.seq.length);
    expect(feelAt(50, 42, o)).toBe(feelAt(50, 42, o));
  });
});
