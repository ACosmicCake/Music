/* World Woodshed — score recognition, step 2's tools: connected pieces of ink, the distance from each ink
   pixel to the paper, the holes inside shapes, and vertical strokes. Plain functions on binary images. */

/* Pieces of ink (8-connected). Returns { labels: Int32Array (0 = paper, else the piece's id), comps: [null,
   { id, x0, y0, x1, y1, area, cx, cy }] } */
export function components(bin) {
  const { w, h, d } = bin, labels = new Int32Array(w * h), comps = [null];
  const stack = new Int32Array(w * h);
  for (let i = 0; i < d.length; i++) {
    if (!d[i] || labels[i]) continue;
    const id = comps.length;
    let sp = 0, x0 = w, y0 = h, x1 = 0, y1 = 0, area = 0, sx = 0, sy = 0;
    stack[sp++] = i; labels[i] = id;
    while (sp) {
      const p = stack[--sp], x = p % w, y = (p - x) / w;
      area++; sx += x; sy += y;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy; if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx; if (xx < 0 || xx >= w) continue;
          const q = yy * w + xx;
          if (d[q] && !labels[q]) { labels[q] = id; stack[sp++] = q; }
        }
      }
    }
    comps.push({ id, x0, y0, x1, y1, area, cx: sx / area, cy: sy / area });
  }
  return { labels, comps };
}

/* For each ink pixel, its distance to the nearest paper (chamfer 3-4, in pixels) */
export function distance(bin) {
  const { w, h, d } = bin, D = new Float32Array(w * h), BIG = 1e6;
  for (let i = 0; i < d.length; i++) D[i] = d[i] ? BIG : 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (!D[i]) continue;
    let v = D[i];
    if (x > 0) v = Math.min(v, D[i - 1] + 3); else v = Math.min(v, 3);
    if (y > 0) {
      v = Math.min(v, D[i - w] + 3);
      if (x > 0) v = Math.min(v, D[i - w - 1] + 4);
      if (x < w - 1) v = Math.min(v, D[i - w + 1] + 4);
    } else v = Math.min(v, 3);
    D[i] = v;
  }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
    const i = y * w + x; if (!D[i]) continue;
    let v = D[i];
    if (x < w - 1) v = Math.min(v, D[i + 1] + 3); else v = Math.min(v, 3);
    if (y < h - 1) {
      v = Math.min(v, D[i + w] + 3);
      if (x < w - 1) v = Math.min(v, D[i + w + 1] + 4);
      if (x > 0) v = Math.min(v, D[i + w - 1] + 4);
    } else v = Math.min(v, 3);
    D[i] = v;
  }
  for (let i = 0; i < D.length; i++) D[i] /= 3;
  return D;
}

/* Paper enclosed by ink (4-connected paper that doesn't reach the edge): [{ x0, y0, x1, y1, area, cx, cy }].
   maxArea: larger holes are skipped. */
export function holes(bin, maxArea = Infinity) {
  const { w, h, d } = bin, seen = new Uint8Array(w * h), stack = new Int32Array(w * h), out = [];
  const flood = (start, keep) => {
    let sp = 0, x0 = w, y0 = h, x1 = 0, y1 = 0, area = 0, sx = 0, sy = 0, edge = false;
    stack[sp++] = start; seen[start] = 1;
    while (sp) {
      const p = stack[--sp], x = p % w, y = (p - x) / w;
      area++; sx += x; sy += y;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edge = true;
      const nb = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1];
      for (const q of nb) if (q >= 0 && !d[q] && !seen[q]) { seen[q] = 1; stack[sp++] = q; }
    }
    if (keep && !edge && area <= maxArea) out.push({ x0, y0, x1, y1, area, cx: sx / area, cy: sy / area });
  };
  // the paper around everything first, so the holes are what is left
  for (let x = 0; x < w; x++) { if (!d[x] && !seen[x]) flood(x, false); const b = (h - 1) * w + x; if (!d[b] && !seen[b]) flood(b, false); }
  for (let y = 0; y < h; y++) { const a = y * w; if (!d[a] && !seen[a]) flood(a, false); const b = a + w - 1; if (!d[b] && !seen[b]) flood(b, false); }
  for (let i = 0; i < d.length; i++) if (!d[i] && !seen[i]) flood(i, true);
  return out;
}

/* Vertical strokes at least minLen tall: stems and bar lines. A pixel counts as ink when it or a
   neighbour across is ink, so a slightly slanted or ragged stroke still makes a long run. Columns whose runs
   match are joined into one stroke. Returns [{ x, x0, x1, y0, y1, len }] */
export function verticals(bin, minLen, maxWidth) {
  const { w, h, d } = bin, runs = [];
  for (let x = 0; x < w; x++) {
    let y = 0;
    while (y < h) {
      const ink = yy => d[yy * w + x] || (x > 0 && d[yy * w + x - 1]) || (x < w - 1 && d[yy * w + x + 1]);
      if (!ink(y)) { y++; continue; }
      let e = y; while (e < h && ink(e)) e++;
      if (e - y >= minLen) {
        // the run of real ink in this column inside the widened one, for the width
        let n = 0; for (let yy = y; yy < e; yy++) n += d[yy * w + x];
        if (n >= (e - y) * 0.6) runs.push({ x, y0: y, y1: e - 1 });
      }
      y = e;
    }
  }
  runs.sort((a, b) => a.x - b.x || a.y0 - b.y0);
  const segs = [], tol = Math.max(2, minLen * 0.2);
  runs.forEach(r => {
    const s = segs.find(s => s.last === r.x - 1 && Math.abs(s.y0 - r.y0) <= tol && Math.abs(s.y1 - r.y1) <= tol);
    if (s) { s.last = r.x; s.cols.push(r); s.y0 = Math.min(s.y0, r.y0); s.y1 = Math.max(s.y1, r.y1); }
    else segs.push({ first: r.x, last: r.x, y0: r.y0, y1: r.y1, cols: [r] });
  });
  return segs.map(s => {
    // the stroke's own ends: the longest column's
    const best = s.cols.reduce((a, b) => (b.y1 - b.y0 > a.y1 - a.y0 ? b : a));
    // the widened runs added a pixel each side
    const x0 = s.first + 1, x1 = s.last - 1;
    return { x: (s.first + s.last) / 2, x0: Math.min(x0, x1), x1: Math.max(x0, x1), width: Math.max(1, s.last - s.first - 1), y0: best.y0, y1: best.y1, len: best.y1 - best.y0 + 1 };
  }).filter(s => s.width <= maxWidth);
}

/* A component's shape as numbers, for telling symbols apart: its size in staff spaces, how much of its box
   is ink, and the ink in a 6 × 10 grid over its box. */
export const GRID_W = 6, GRID_H = 10;
export function features(labels, w, comp, sp, id = comp.id) {
  const bw = comp.x1 - comp.x0 + 1, bh = comp.y1 - comp.y0 + 1;
  const grid = new Float32Array(GRID_W * GRID_H), cnt = new Float32Array(GRID_W * GRID_H);
  let ink = 0;
  for (let y = comp.y0; y <= comp.y1; y++) for (let x = comp.x0; x <= comp.x1; x++) {
    const gx = Math.min(GRID_W - 1, Math.floor((x - comp.x0) / bw * GRID_W)), gy = Math.min(GRID_H - 1, Math.floor((y - comp.y0) / bh * GRID_H));
    const v = labels[y * w + x] === id ? 1 : 0;
    grid[gy * GRID_W + gx] += v; cnt[gy * GRID_W + gx]++; ink += v;
  }
  for (let i = 0; i < grid.length; i++) grid[i] = cnt[i] ? grid[i] / cnt[i] : 0;
  return { w: bw / sp, h: bh / sp, fill: ink / (bw * bh), grid };
}

/* The distance between two shapes: the ink grids, plus the sizes (relative) and how full the box is */
export function shapeDist(a, b) {
  const G = GRID_W * GRID_H;
  let g = 0;
  for (let k = 0; k < G; k++) { const d = a.grid[k] - b.grid[k]; g += d * d; }
  const lw = Math.log((a.w + 0.05) / (b.w + 0.05)), lh = Math.log((a.h + 0.05) / (b.h + 0.05));
  return g / G * 4 + lw * lw * 1.2 + lh * lh * 1.2 + (a.fill - b.fill) * (a.fill - b.fill);
}
