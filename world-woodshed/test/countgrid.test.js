import { describe, it, expect } from 'vitest';
import D from '../src/data.js';
import { loadDrills } from '../src/content/lazy.js';
import { phraseGrid, patternGrid, backingRows, countName, countLabels, groupStarts, playLine } from '../src/countgrid.js';

/* Count grids (src/countgrid.js): where each written note falls on the counts, the backing's part beside it,
   the "play on" line, and that every drill's grid can be drawn. */

const hits = row => row.cells.map((c, j) => (c.kind === 'on' || c.kind === 'acc' ? j : -1)).filter(j => j >= 0);

describe('count labels', () => {
  it('counts simple, compound and odd meters', () => {
    expect(countLabels('4/4', 4).join(' ')).toBe('1 e & a 2 e & a 3 e & a 4 e & a');
    expect(countLabels('6/8', 3).join(' ')).toBe('1 & a 2 & a');
    expect(countLabels('7/8', 1).join(' ')).toBe('1 2 3 4 5 6 7');
    expect(countLabels('6/8', 2)).toBe(null);
  });
  it('names a slot from its beat', () => {
    const l = countLabels('4/4', 4);
    expect(countName(l, 0)).toBe('1');
    expect(countName(l, 3)).toBe('a of 1');
    expect(countName(l, 6)).toBe('& of 2');
  });
  it('finds group starts from bars in the count or from the beats', () => {
    expect(groupStarts('1 2 | 3 4 | 5 6 7', '1 2 3 4 5 6 7'.split(' '))).toEqual([2, 4]);
    expect(groupStarts(undefined, '1 & 2 &'.split(' '))).toEqual([2]);
    expect(groupStarts(undefined, '1 2 3 4'.split(' '))).toEqual([]);
  });
});

describe('the tumbao against son clave', () => {
  const back = backingRows({ rhythm: 'son32' }, D);
  it('shows the clave on 1, a of 1, & of 2, & of 3 and 4', () => {
    expect(back).toHaveLength(1);
    const g = phraseGrid([[{ m: 41, d: 'w' }]], { backing: back });
    expect(g.labels).toHaveLength(16);
    expect(hits(g.bars[0].rows[0]).map(j => countName(g.labels, j))).toEqual(['1', 'a of 1', '& of 2', '& of 3', '4']);
  });
  it('puts the bass on the & of 2 and the & of 4 with the notes named', async () => {
    await loadDrills();
    const d = D.DRILLS.find(x => x.id === 'cuba-tumbao-clave'), v = d.variations[0];
    const g = phraseGrid(v.bars, { time: v.time, key: v.key, backing: back });
    expect(g.bars.map(b => b.play)).toEqual(['Rest on 1 · F on & of 2 · G on & of 4', 'Rest on 1 · F on & of 2 · C on & of 4']);
    const v2 = d.variations[1], g2 = phraseGrid(v2.bars, { time: v2.time, key: v2.key, backing: back });
    expect(hits(g2.bars[0].rows[1]).map(j => countName(g2.labels, j))).toEqual(['a of 1', '& of 2', 'a of 3', '& of 4']);
  });
  it('lines the slow count up with the same clave', () => {
    for (const id of ['son32', 'son23', 'rumba32']) {
      const r = D.RHYTHMS.find(x => x.id === id);
      expect(r.alt, id).toHaveLength(r.steps);
    }
    const r = D.RHYTHMS.find(x => x.id === 'son32');
    const slow = [...r.tracks.clave].map((c, i) => (c === '.' ? null : r.alt[i])).filter(Boolean);
    expect(slow).toEqual(['1', '&', '4', '2', '3']); // 1, 2 &, 4 | 2, 3
  });
});

describe('play lines', () => {
  it('says every count or lists the hits', () => {
    const l = countLabels('4/4', 2), cell = k => ({ kind: k, text: '' });
    expect(playLine(l.map(() => cell('on')), l)).toBe('Every count');
    expect(playLine(l.map((_, j) => cell(j % 2 ? 'on' : '')), l)).toBe('Play on & of 1, & of 2, & of 3, & of 4; rest on 1');
  });
  it('lays out hand-written patterns over several bars', () => {
    const g = patternGrid({ rows: { strum: 'x.x.x.x.' + 'xxxxxxxx' }, bars: 2 });
    expect(g.bars).toHaveLength(2);
    expect(g.bars[1].play).toBe('Every count');
  });
});

describe('drills', () => {
  it('every drill grid and written phrase can be counted', async () => {
    await loadDrills();
    for (const d of D.DRILLS) {
      const back = backingRows(d.backing, D), dg = d.grid || {};
      for (const v of d.variations || []) {
        if (v.grid) expect(patternGrid(Object.assign({}, dg, v.grid), { backing: back }), d.id + ' ' + v.name).not.toBe(null);
        if (dg.count && v.bars && v.bars.length && !v.grid) expect(phraseGrid(v.bars, { time: v.time, count: v.count || dg.count, backing: back }), d.id + ' ' + v.name).not.toBe(null);
      }
    }
  });
  it('rhythm pages explain their words', () => {
    for (const r of D.RHYTHMS.filter(x => ['cuba', 'hindustani', 'carnatic', 'flamenco'].includes(x.region))) expect(r.words, r.id).toBeTruthy();
  });
});
