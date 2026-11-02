/* World Woodshed — score recognition: pages of a score (grey images) to music. Shared by PDFs in the Library
   (each page drawn by pdf.js) and photos of printed or handwritten scores. Runs in a Worker
   (src/omr/omr.worker.js) so the page stays responsive; everything happens on the device. */
import { prepare } from './prepare.js';
import { detect } from './detect.js';
import { classify } from './classify.js';
import { readPage, buildScore } from './assemble.js';

/* One page: the systems found on it, and what was found (for drawing over the page) */
export function readImage(gray) {
  const p = prepare(gray);
  const det = detect(p.R, p.staves, p.metrics, (f, only) => {
    const r = classify(f, 5, only);
    return r && (only || r.conf >= 0.5) ? r : null;
  }, p.bin);
  const systems = readPage(p.staves, det, p.metrics.space);
  return { systems, prep: p, det };
}

/* Several pages → one score (see buildScore in assemble.js), or null when no staff was found */
export function recognize(grays, opts = {}) {
  const pages = [], info = [];
  grays.forEach((g, i) => {
    const r = readImage(g);
    pages.push(r.systems);
    info.push({ page: i + 1, staves: r.prep.staves.filter(s => !s.tab).length, tab: r.prep.staves.some(s => s.tab), systems: r.systems.length, space: r.prep.metrics.space / r.prep.scale });
    if (opts.onPage) opts.onPage(i + 1, grays.length);
  });
  const score = buildScore(pages, opts);
  if (score) score.pages = info;
  return score;
}
