/* World Woodshed — score recognition: a page made ready for reading. The picture is scaled so a staff space
   is about SPACE pixels (small enough to be quick on a phone, large enough for the thin strokes), turned so
   the staves run level, made black and white, and the staff lines taken out. */
import { binarize, staffMetrics, findStaves, removeStaves, scaleGray, rotateGray, staffAngle } from './image.js';

export const SPACE = 20;
const MAX_SIDE = 4200;

export function prepare(gray, opts = {}) {
  let img = gray, scale = 1, angle = 0;
  // very large photos first come down to a size where the staff can be measured
  const big = Math.max(img.w, img.h);
  if (big > MAX_SIDE) { const f = MAX_SIDE / big; img = scaleGray(img, f); scale *= f; }
  let bin = binarize(img), m = staffMetrics(bin);
  // when two spacings are common (a staff's and its tab's, which can pass for a staff), take the one that
  // explains the most staves, staff and tab both; the smaller on a tie
  if (m.cands && m.cands.length > 1) {
    let best = null;
    m.cands.forEach(space => {
      const st = findStaves(bin, { line: m.line, space });
      const n = st.length, five = st.filter(s => !s.tab).length;
      if (five && (!best || n > best.n || (n === best.n && space < best.space))) best = { space, n };
    });
    if (best) m = { line: m.line, space: best.space };
  }
  if (m.space >= 6 && Math.abs(m.space - SPACE) > 3) {
    let f = SPACE / m.space;
    f = Math.min(f, MAX_SIDE / Math.max(img.w, img.h));
    if (Math.abs(f - 1) > 0.08) { img = scaleGray(img, f); scale *= f; bin = binarize(img, SPACE * 4); m = pick(staffMetrics(bin), SPACE); }
  }
  let staves = findStaves(bin, m);
  const a = staffAngle(staves);
  if (Math.abs(a) > 0.0035 && opts.rotate !== false) {
    img = rotateGray(img, a); angle = a;
    bin = binarize(img, m.space * 4); m = pick(staffMetrics(bin), m.space); staves = findStaves(bin, m);
  }
  const R = removeStaves(bin, staves, m);
  return { img, bin, metrics: m, staves, R, scale, angle };
}

/* After scaling, the spacing measured again: the candidate nearest the one chosen */
function pick(m, want) {
  const all = [m.space].concat(m.cands || []);
  const space = all.reduce((a, b) => (Math.abs(b - want) < Math.abs(a - want) ? b : a));
  return { line: m.line, space };
}
