/* World Woodshed — score recognition: pages of a score (grey images) to music. Shared by PDFs in the Library
   (each page drawn by pdf.js) and photos of printed or handwritten scores. Runs in a Worker
   (src/omr/omr.worker.js) so the page stays responsive; everything happens on the device. */
import { prepare } from './prepare.js';
import { lineY } from './image.js';
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
  systems.forEach(sys => { sys.layout = layoutOf(sys, p); });
  return { systems, prep: p, det };
}

/* Where each bar of a system sits on the page as it was given (before scaling and levelling), as fractions
   of the page's width and height: [{ x0, x1, rows: [{ y0, y1 (top and bottom line), xs (each event) }] }],
   one per bar, for showing the page itself with a cursor (src/pagelayout.js) */
export function layoutOf(sys, p) {
  const { w, h } = p.img, c = Math.cos(p.angle || 0), sn = Math.sin(p.angle || 0), cx = w / 2, cy = h / 2;
  // (levelling turned the page about its middle: the same turn finds a point's place on the page as given)
  const at = (x, y) => { const dx = x - cx, dy = y - cy; return [(c * dx - sn * dy + cx) / w, (sn * dx + c * dy + cy) / h]; };
  const n = Math.max(0, ...sys.staves.map(s => (s.bars || []).length));
  const out = [];
  for (let k = 0; k < n; k++) {
    const ref = sys.staves.find(s => s.bars && s.bars[k]);
    if (!ref) { out.push(null); continue; }
    const { x0, x1 } = ref.bars[k], xm = (x0 + x1) / 2;
    const sp = p.metrics.space;
    const rows = sys.staves.map(s => {
      const st = s.staff, top = lineY(st, 0, xm), bot = lineY(st, st.nLines - 1, xm);
      const xs = s.bars && s.bars[k] ? s.bars[k].events.map(e => at(e.x + sp * 0.6, (top + bot) / 2)[0]) : [];
      return { y0: at(xm, top)[1], y1: at(xm, bot)[1], xs };
    });
    const first = sys.staves[0].staff, last = sys.staves[sys.staves.length - 1].staff;
    const mid = (lineY(first, 0, xm) + lineY(last, last.nLines - 1, xm)) / 2;
    out.push({ x0: at(x0, mid)[0], x1: at(x1, mid)[0], rows });
  }
  return out;
}

/* Several pages → one score (see buildScore in assemble.js), or null when no staff was found */
export function recognize(grays, opts = {}) {
  const pages = [], info = [];
  grays.forEach((g, i) => {
    const r = readImage(g);
    r.systems.forEach(sys => { sys.page = i; });
    pages.push(r.systems);
    info.push({ page: i + 1, staves: r.prep.staves.filter(s => !s.tab).length, tab: r.prep.staves.some(s => s.tab), systems: r.systems.length, space: r.prep.metrics.space / r.prep.scale });
    if (opts.onPage) opts.onPage(i + 1, grays.length);
  });
  const score = buildScore(pages, opts);
  if (score) score.pages = info;
  return score;
}
