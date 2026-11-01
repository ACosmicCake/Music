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
  if (m.space >= 6 && Math.abs(m.space - SPACE) > 3) {
    let f = SPACE / m.space;
    f = Math.min(f, MAX_SIDE / Math.max(img.w, img.h));
    if (Math.abs(f - 1) > 0.08) { img = scaleGray(img, f); scale *= f; bin = binarize(img, SPACE * 4); m = staffMetrics(bin); }
  }
  let staves = findStaves(bin, m);
  const a = staffAngle(staves);
  if (Math.abs(a) > 0.0035 && opts.rotate !== false) {
    img = rotateGray(img, a); angle = a;
    bin = binarize(img, m.space * 4); m = staffMetrics(bin); staves = findStaves(bin, m);
  }
  const R = removeStaves(bin, staves, m);
  return { img, bin, metrics: m, staves, R, scale, angle };
}
