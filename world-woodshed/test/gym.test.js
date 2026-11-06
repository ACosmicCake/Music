import { describe, it, expect } from 'vitest';
import { GYM, FEELS, SEGS, feelAt, nextFeel } from '../src/content/gym.js';

const feelEx = GYM.filter(x => x.cat === 'feel');

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
    expect(feelEx.length).toBeGreaterThanOrEqual(6);
    for (const ex of feelEx.filter(x => !x.random)) for (const seg of SEGS) {
      for (let bar = 0; bar < ex.seq.length * seg * 2; bar++) {
        expect(feelAt(ex, bar, 0, { seg })).toBe(FEELS[ex.seq[Math.floor(bar / seg) % ex.seq.length]]);
        const changes = feelAt(ex, bar + 1, 0, { seg }) !== feelAt(ex, bar, 0, { seg });
        expect(ex.cue(bar, 0, { seg })).toBe(changes);
        if (changes) expect(ex.label(bar, 0, { seg })).toContain('next: ' + feelAt(ex, bar + 1, 0, { seg }).name);
      }
      expect(ex.guided(0, { seg })).toBe(true);
    }
  });

  it('surprise changes never repeat a feel and are the same for one run', () => {
    const ex = feelEx.find(x => x.random);
    const seen = new Set();
    for (let bar = 0; bar < 200; bar += 2) {
      const f = feelAt(ex, bar, 42, { seg: 2 });
      seen.add(f);
      expect(nextFeel(ex, bar + 1, 42, { seg: 2 })).not.toBe(f);
    }
    expect(seen.size).toBe(ex.seq.length);
    expect(feelAt(ex, 50, 42, { seg: 2 })).toBe(feelAt(ex, 50, 42, { seg: 2 }));
  });
});
