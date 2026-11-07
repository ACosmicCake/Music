import { describe, it, expect } from 'vitest';
import fs from 'fs';
import zlib from 'zlib';
import { recognize } from '../src/omr/recognize.js';
import { rotateGray } from '../src/omr/image.js';
import { scoreToMusicXML } from '../src/omr/musicxml.js';
import { withCheckBars } from '../src/scoreedit.js';
import { encodeLayout, decodeLayout, layoutFromXML, spots, rowOf, lastBars, spreadOf } from '../src/pagelayout.js';

/* Where a score read from a page sits on it (src/pagelayout.js): kept by the recognizer, written in the
   MusicXML, and turned into a spot on the page for each note Sight-reading reads. */
function fixture(name) {
  const b = zlib.gunzipSync(fs.readFileSync(new URL('./fixtures/omr/' + name + '.pgm.gz', import.meta.url)));
  const head = b.subarray(0, 40).toString('latin1').match(/^P5\s+(\d+)\s+(\d+)\s+255\s/);
  const w = +head[1], h = +head[2];
  return { w, h, d: new Uint8Array(b.subarray(head[0].length, head[0].length + w * h)) };
}
// is there a dark line across the page near (fx, fy)?
const inkNear = (g, fx, fy, reach = 3) => {
  const x = Math.round(fx * g.w), y = Math.round(fy * g.h);
  for (let dy = -reach; dy <= reach; dy++) if (g.d[(y + dy) * g.w + x] < 190) return true;
  return false;
};

describe('the place of each bar on the page', () => {
  const gray = fixture('val-p015');
  const score = recognize([gray]);

  it('is kept for every bar, on the staff lines of the page as given', () => {
    const L = score.layout;
    expect(L.bars).toHaveLength(score.counts.bars);
    L.bars.forEach(b => {
      expect(b.p).toBe(0);
      expect(b.x1).toBeGreaterThan(b.x0);
      expect(b.x0).toBeGreaterThan(0); expect(b.x1).toBeLessThanOrEqual(1);
      const r = b.rows[0], xm = (b.x0 + b.x1) / 2;
      expect(r.y1).toBeGreaterThan(r.y0);
      // the top and bottom lines of the staff really are there
      expect(inkNear(gray, xm, r.y0)).toBe(true);
      expect(inkNear(gray, xm, r.y1)).toBe(true);
      r.xs.forEach(x => { expect(x).toBeGreaterThanOrEqual(b.x0 - 0.01); expect(x).toBeLessThanOrEqual(b.x1 + 0.01); });
    });
    // bars run along a line, then down the page
    for (let i = 1; i < L.bars.length; i++) {
      const a = L.bars[i - 1], b = L.bars[i];
      if (Math.abs(a.rows[0].y0 - b.rows[0].y0) < 0.01) expect(b.x0).toBeGreaterThanOrEqual(a.x0);
      else expect(b.rows[0].y0).toBeGreaterThan(a.rows[0].y0);
    }
  });

  it('is on the page as given when the reader levelled a slanted photo', () => {
    const pad = { w: gray.w, h: gray.h + 200, d: new Uint8Array(gray.w * (gray.h + 200)).fill(240) };
    for (let y = 0; y < gray.h; y++) pad.d.set(gray.d.subarray(y * gray.w, (y + 1) * gray.w), (y + 100) * gray.w);
    const g = rotateGray(pad, -0.03);
    const L = recognize([g]).layout;
    let hit = 0, all = 0;
    L.bars.forEach(b => { const xm = (b.x0 + b.x1) / 2; all += 2; hit += inkNear(g, xm, b.rows[0].y0) + inkNear(g, xm, b.rows[0].y1); });
    expect(hit / all).toBeGreaterThan(0.9);
  });

  it('goes into the MusicXML and comes back, and fixing notes keeps it', () => {
    const xml = scoreToMusicXML(score, { layout: score.layout, pages: 1, check: [2] });
    const back = layoutFromXML(xml);
    expect(back.bars).toHaveLength(score.layout.bars.length);
    expect(back.pages).toBe(1);
    expect(back.bars[3].x0).toBeCloseTo(score.layout.bars[3].x0, 3);
    expect(back.bars[3].rows[0].y1).toBeCloseTo(score.layout.bars[3].rows[0].y1, 3);
    // the bars to check are worked out again; the page layout stays
    const again = withCheckBars(xml);
    expect(layoutFromXML(again).bars).toHaveLength(back.bars.length);
  });
});

describe('spots for the notes being read', () => {
  const layout = { pages: 2, rows: [[0], [1]], bars: [
    { p: 0, x0: 0.2, x1: 0.5, rows: [{ y0: 0.1, y1: 0.15, xs: [0.25, 0.4] }, { y0: 0.2, y1: 0.25, xs: [] }] },
    { p: 0, x0: 0.5, x1: 0.9, rows: [{ y0: 0.1, y1: 0.15, xs: [0.55] }, { y0: 0.2, y1: 0.25, xs: [] }] },
    { p: 1, x0: 0.1, x1: 0.9, rows: [{ y0: 0.1, y1: 0.15, xs: [] }, { y0: 0.2, y1: 0.25, xs: [] }] }
  ] };
  const q = midi => ({ midi, dur: 'q' }), h2 = midi => ({ midi, dur: 'h' });

  it('puts a note where it is printed when the bar holds as many as were read, else by time', () => {
    const piece = { bars: [[h2(60), h2(62)], [q(64), q(65), q(67), q(69)]] };
    const s = spots(piece, layout);
    expect(s.map(x => x.x)).toEqual([0.25, 0.4, expect.any(Number), expect.any(Number), expect.any(Number), expect.any(Number)]);
    // by time within the bar, in order
    expect(s[3].x).toBeGreaterThan(s[2].x); expect(s[5].x).toBeLessThan(0.9);
    expect(s[2].b).toBe(1);
  });

  it('follows the score bars a piece came from, and the staff row of the line read', () => {
    const piece = { bars: [[{ midi: 60, dur: 'w' }], [{ midi: 60, dur: 'w' }]], src: [2, 0] };
    const s = spots(piece, layout, rowOf(layout, { part: 1, staff: '1' }));
    expect(s[0].p).toBe(1);
    expect(s[1].p).toBe(0);
    expect(s[1].y0).toBe(0.2);
    // and which of the piece's bars each spot is in, so a tap on the page finds the bar to play from
    expect(s.map(x => x.bi)).toEqual([0, 1]);
  });

  it('knows the last bar of each page and the pages shown together', () => {
    expect(lastBars(layout)).toEqual([1, 2]);
    expect(spreadOf(0, true, 3)).toEqual([0, 1]);
    expect(spreadOf(1, true, 3)).toEqual([0, 1]);
    expect(spreadOf(2, true, 3)).toEqual([2]);
    expect(spreadOf(2, false, 3)).toEqual([2]);
  });

  it('turns away anything that is not a layout', () => {
    expect(decodeLayout('nope')).toBe(null);
    expect(decodeLayout('[2,1,[[0]],[]]')).toBe(null);
    expect(decodeLayout(encodeLayout(layout, 2)).bars[2].p).toBe(1);
    expect(layoutFromXML('<score-partwise/>')).toBe(null);
  });
});
