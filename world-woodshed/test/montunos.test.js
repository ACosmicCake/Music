import { describe, it, expect } from 'vitest';
import D from '../src/data.js';
import MONTUNOS, { S } from '../src/content/drills-montunos.js';
import { phraseGrid, patternGrid, backingRows } from '../src/countgrid.js';

const Q = { w: 4, h: 2, q: 1, 8: 0.5, 16: 0.25 };
const len = n => Q[n.d] * (n.dot ? 1.5 : 1);

describe('guitar montunos', () => {
  it('S writes a sixteenth grid as drill bars, with chords on one stem', () => {
    const [bar] = S('x-xx-xx-..x-x-x-', '64 65 64+60 67 69 65 69 65');
    expect(bar.map(n => n.d + (n.dot ? '.' : ''))).toEqual(['8', '16', '8', '16', '8', '8', '8', '8', '8']);
    expect(bar[2]).toMatchObject({ m: 64, ch: [60, 64] });
    expect(bar[5].m).toBe(null); // the rest on 3
    // a length no single value holds becomes a note and a rest
    const [odd] = S('x----...........', '60');
    expect(odd.map(n => [n.m, n.d, !!n.dot])).toEqual([[60, 'q', false], [null, '16', false], [null, 'h', false], [null, '8', true]]);
    // one bar of rhythm is used for every bar of notes
    expect(S('x---x---x---x---', '60 62 64 65 67 69 71 72')).toHaveLength(2);
    expect(() => S('x---', '60')).toThrow();
    expect(() => S('x---x---x---x---', '60 62 64')).toThrow();
    expect(() => S('x---------------', '30')).toThrow();
  });

  it('are Cuba drills on real backings, with notes on the guitar and count grids beside the clave', () => {
    expect(MONTUNOS.length).toBeGreaterThanOrEqual(6);
    for (const d of MONTUNOS) {
      expect(d.style, d.id).toBe('cuba');
      expect(D.GROOVES[d.backing.groove], d.id).toBeTruthy();
      expect(d.variations.length, d.id).toBeGreaterThanOrEqual(4);
      const rows = backingRows(d.backing, D);
      for (const v of d.variations) {
        if (v.grid) { expect(patternGrid(v.grid, { backing: rows }), d.id + ' ' + v.name).toBeTruthy(); continue; }
        if (!v.bars) continue;
        for (const bar of v.bars) {
          expect(bar.reduce((a, n) => a + len(n), 0), d.id + ' ' + v.name).toBeCloseTo(4, 6);
          for (const n of bar) if (n.m != null) {
            for (const m of n.ch || [n.m]) { expect(m, d.id).toBeGreaterThanOrEqual(40); expect(m, d.id).toBeLessThanOrEqual(88); }
            if (n.ch) expect(Math.max(...n.ch), d.id).toBe(n.m);
          }
        }
        const g = phraseGrid(v.bars, { time: v.time, key: v.key, backing: rows });
        expect(g, d.id + ' ' + v.name).toBeTruthy();
        if (rows.length) { // counted in sixteenths, so the clave fits beside it
          expect(g.labels, d.id + ' ' + v.name).toHaveLength(16);
          expect(g.bars[0].rows[0].name, d.id).toBe('clave');
        }
      }
    }
  });

  it('names single notes and double stops in the play line, and gives only the count for chords', () => {
    const rows = [{ name: 'clave', pattern: D.GROOVES.son.perc.clave, stepQ: 0.25 }];
    const chords = phraseGrid(S('x--x--x---x-x-x-', '67+62+59 67+62+59 64+60+55 64+60+55 64+60+55 66+60+57'), { backing: rows });
    expect(chords.bars[0].play).toBe('Play on 1, a of 1, & of 2, & of 3, 4, & of 4');
    const thirds = phraseGrid(S('x--x--x---x-x-x-', '64+60 64+60 69+65 65+62 69+65 62+59'), { backing: rows });
    expect(thirds.bars[0].play).toMatch(/^E on 1 · E on a of 1/);
  });

  it('the 2-3 son backing is the 3-2 one started from its second half', () => {
    const c32 = D.GROOVES.son.perc.clave.toLowerCase(), c23 = D.GROOVES.son23.perc.clave.toLowerCase();
    expect(c23).toBe(c32.slice(8) + c32.slice(0, 8));
  });
});
