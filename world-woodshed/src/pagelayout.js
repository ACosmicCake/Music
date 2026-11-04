/* World Woodshed — where a score read from a page (src/omr/) sits on that page, so Sight-reading can show the
   PDF or photo itself in full screen, with the cursor and the mic check's marks drawn over the printed notes.
   The recognizer keeps, for every bar, its page and its place on it (fractions of the page's width and
   height, so any size of drawing fits): written in the MusicXML as <miscellaneous-field name="ww-page-layout">
   and read back here. Plain functions, tested in test/pagelayout.test.js. */

import { durQ } from './notation.js';

export const FIELD = 'ww-page-layout';
const K = 10000; // fractions kept to four places: a tenth of a millimetre on A4

/* layout { bars: [{ p, x0, x1, rows: [{ y0, y1, xs }] } | null], rows: [[staff row]] per part } → the field's text:
   [1, pages, rows, bars], each bar [p, x0, x1, [[y0, y1, [x…]] per row]] in ten-thousandths */
export function encodeLayout(layout, pages = 0) {
  if (!layout || !Array.isArray(layout.bars)) return '';
  const q = v => Math.max(0, Math.min(K, Math.round(v * K)));
  const bars = layout.bars.map(b => (b ? [b.p, q(b.x0), q(b.x1), b.rows.map(r => [q(r.y0), q(r.y1), (r.xs || []).map(q)])] : 0));
  return JSON.stringify([1, pages || 0, layout.rows || [[0]], bars]);
}

/* The field's text → { pages, rows, bars } (as encodeLayout takes it), or null when it isn't one */
export function decodeLayout(text) {
  let a;
  try { a = JSON.parse(text); } catch (e) { return null; }
  if (!Array.isArray(a) || a[0] !== 1 || !Array.isArray(a[3])) return null;
  const n = v => (Number.isFinite(v) ? Math.max(0, Math.min(1, v / K)) : 0);
  const bars = a[3].map(b => {
    if (!Array.isArray(b) || !Number.isInteger(b[0]) || b[0] < 0 || !Array.isArray(b[3])) return null;
    return { p: b[0], x0: n(b[1]), x1: n(b[2]), rows: b[3].map(r => ({ y0: n(r && r[0]), y1: n(r && r[1]), xs: Array.isArray(r && r[2]) ? r[2].map(n) : [] })) };
  });
  const rows = Array.isArray(a[2]) ? a[2].filter(Array.isArray).map(r => r.filter(Number.isInteger)) : [[0]];
  const pages = Math.max(Number.isInteger(a[1]) ? a[1] : 0, ...bars.filter(Boolean).map(b => b.p + 1));
  return bars.some(Boolean) ? { pages, rows, bars } : null;
}

/* The layout written in a MusicXML text, or null */
export function layoutFromXML(xml) {
  const m = String(xml || '').match(/<miscellaneous-field name="ww-page-layout">([^<]*)<\/miscellaneous-field>/);
  return m ? decodeLayout(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')) : null;
}

/* The file name for what was read from a file (or from an entry's photos), as src/ui/recognize.js saves it */
export const readName = base => String(base || 'Score').replace(/\.[a-z0-9]{1,8}$/i, '').slice(0, 120) + ' (notes read).musicxml';

/* The staff row a line of the score is on: line { part (from 0), staff ('1', '2'…) } as melody.js reads it */
export function rowOf(layout, line) {
  const rows = (layout && layout.rows) || [[0]];
  const part = rows[line && Number.isInteger(+line.part) ? +line.part : 0] || rows[0] || [0];
  const r = part[Math.max(0, (+(line && line.staff) || 1) - 1)];
  return Number.isInteger(r) ? r : part[0] || 0;
}

/* Where each note of a reading piece sits on the page: one spot per note of piece.bars.flat(), or null.
   piece.src gives the score bar each of its bars is (sections() in src/scorepieces.js), else bar for bar.
   A spot is { p (page from 0), b (score bar), x, y0, y1 (the staff row's top and bottom line) }: x is the
   printed note's own place when the bar holds as many as were read from the page, else its place by time. */
export function spots(piece, layout, row = 0) {
  const out = [];
  if (!piece || !layout) return out;
  piece.bars.forEach((bar, bi) => {
    const b = piece.src ? piece.src[bi] : bi, L = layout.bars[b];
    const R = L && (L.rows[row] || L.rows[0]);
    if (!R) { bar.forEach(() => out.push(null)); return; }
    const len = bar.reduce((a, n) => a + durOf(n), 0) || 1;
    // a bar's first notes come after the clef and key at a line's start: by time, within the notes read
    const lo = R.xs.length ? Math.min(L.x0 + (L.x1 - L.x0) * 0.04, R.xs[0]) : L.x0 + (L.x1 - L.x0) * 0.08;
    const hi = L.x0 + (L.x1 - L.x0) * 0.92;
    let q = 0;
    bar.forEach((n, k) => {
      const x = R.xs.length === bar.length ? R.xs[k] : lo + (hi - lo) * (q / len);
      out.push({ p: L.p, b, x, y0: R.y0, y1: R.y1 });
      q += durOf(n);
    });
  });
  return out;
}
const durOf = n => durQ(n) || 0;

/* The last score bar on each page */
export function lastBars(layout) {
  const out = [];
  (layout ? layout.bars : []).forEach((b, i) => { if (b) out[b.p] = i; });
  return out;
}

/* Which pages to show for a page being read: one page, or two side by side as an open book (1 and 2, 3 and 4) */
export function spreadOf(p, two, pages) {
  if (!two) return [p];
  const a = p - (p % 2);
  return a + 1 < pages ? [a, a + 1] : [a];
}
