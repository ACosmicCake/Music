/* World Woodshed — score recognition, step 1: from a picture to black and white, the staff size and the
   staves. Plain functions on typed arrays (no DOM), so they run in a Worker and in the tests.

   An image here is { w, h, d } with d a Uint8Array of w × h: grey levels (0 black … 255 white) for a grey
   image, 1 (ink) or 0 (paper) for a binary one. */

/* RGBA pixels (ImageData) to grey levels */
export function toGray(rgba, w, h) {
  const d = new Uint8Array(w * h);
  for (let i = 0, j = 0; i < d.length; i++, j += 4) {
    const a = rgba[j + 3] / 255; // transparent counts as white paper
    d[i] = Math.round((0.299 * rgba[j] + 0.587 * rgba[j + 1] + 0.114 * rgba[j + 2]) * a + 255 * (1 - a));
  }
  return { w, h, d };
}

/* Halve or scale a grey image by f (box filter when shrinking, bilinear when growing) */
export function scaleGray(img, f) {
  const { w, h, d } = img;
  const W = Math.max(1, Math.round(w * f)), H = Math.max(1, Math.round(h * f));
  const out = new Uint8Array(W * H);
  if (f < 1) {
    const r = 1 / f;
    for (let y = 0; y < H; y++) {
      const y0 = Math.floor(y * r), y1 = Math.min(h, Math.max(y0 + 1, Math.floor((y + 1) * r)));
      for (let x = 0; x < W; x++) {
        const x0 = Math.floor(x * r), x1 = Math.min(w, Math.max(x0 + 1, Math.floor((x + 1) * r)));
        let s = 0;
        for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) s += d[yy * w + xx];
        out[y * W + x] = s / ((y1 - y0) * (x1 - x0));
      }
    }
  } else {
    for (let y = 0; y < H; y++) {
      const sy = Math.min(h - 1, (y + 0.5) / f - 0.5), y0 = Math.max(0, Math.floor(sy)), y1 = Math.min(h - 1, y0 + 1), fy = Math.max(0, sy - y0);
      for (let x = 0; x < W; x++) {
        const sx = Math.min(w - 1, (x + 0.5) / f - 0.5), x0 = Math.max(0, Math.floor(sx)), x1 = Math.min(w - 1, x0 + 1), fx = Math.max(0, sx - x0);
        const a = d[y0 * w + x0] * (1 - fx) + d[y0 * w + x1] * fx, b = d[y1 * w + x0] * (1 - fx) + d[y1 * w + x1] * fx;
        out[y * W + x] = a * (1 - fy) + b * fy;
      }
    }
  }
  return { w: W, h: H, d: out };
}

/* Otsu's threshold of a grey image */
export function otsu(img) {
  const hist = new Float64Array(256);
  for (let i = 0; i < img.d.length; i++) hist[img.d[i]]++;
  const n = img.d.length;
  let sum = 0; for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sB = 0, wB = 0, best = 0, t = 128;
  for (let i = 0; i < 256; i++) {
    wB += hist[i]; if (!wB) continue;
    const wF = n - wB; if (!wF) break;
    sB += i * hist[i];
    const mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF);
    if (v > best) { best = v; t = i; }
  }
  return t;
}

/* Ink and paper. Each pixel is compared with the mean of the window around it (Bradley and Roth), so a
   shadow across a photo or a grey scan still comes out clean; flat areas far brighter than the ink
   (Otsu's threshold over the whole page) are paper whatever their neighbours. win: the window's side. */
export let K = 0.88;
export const setK = k => { K = k; };
export function binarize(img, win) {
  const { w, h, d } = img;
  const r = Math.max(4, Math.round((win || Math.max(31, Math.min(w, h) / 12)) / 2));
  const I = new Float64Array((w + 1) * (h + 1)); // integral image
  for (let y = 0; y < h; y++) {
    let row = 0;
    for (let x = 0; x < w; x++) { row += d[y * w + x]; I[(y + 1) * (w + 1) + x + 1] = I[y * (w + 1) + x + 1] + row; }
  }
  const g = otsu(img), out = new Uint8Array(w * h);
  // a page of almost nothing but paper: Otsu would split the paper's own grain, so ink must be clearly darker
  const paperHi = Math.min(250, g + 40);
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1);
      const s = I[y1 * (w + 1) + x1] - I[y0 * (w + 1) + x1] - I[y1 * (w + 1) + x0] + I[y0 * (w + 1) + x0];
      const mean = s / ((y1 - y0) * (x1 - x0));
      // the pixel with its neighbours, so the grain of a photo doesn't speckle the paper
      const o = y * w + x;
      const v = x > 0 && x < w - 1 && y > 0 && y < h - 1
        ? (d[o] * 4 + d[o - 1] + d[o + 1] + d[o - w] + d[o + w]) / 8 : d[o];
      out[o] = v < mean * K && v < paperHi ? 1 : 0;
    }
  }
  return { w, h, d: out };
}

/* The staff's two numbers from the lengths of vertical runs: the commonest ink run is the line
   thickness, the commonest line + gap is the staff space (line to line). */
export function staffMetrics(bin) {
  const { w, h, d } = bin;
  const black = new Float64Array(64), pair = new Float64Array(256);
  const step = Math.max(1, Math.floor(w / 600));
  for (let x = 0; x < w; x += step) {
    let y = 0, lastB = -1;
    while (y < h) {
      const v = d[y * w + x];
      let n = 0; while (y < h && d[y * w + x] === v) { y++; n++; }
      if (v) { if (n < 64) black[n]++; lastB = n; }
      else if (lastB > 0 && lastB < 64 && y < h && n + lastB < 256) pair[n + lastB]++;
    }
  }
  const peak = (a, from) => { let b = from; for (let i = from; i < a.length; i++) if (a[i] > a[b]) b = i; return b; };
  const lt = peak(black, 1);
  const sp = peak(pair, Math.max(4, lt + 2));
  // a finer estimate: the mean around each peak
  const around = (a, p, k) => { let s = 0, n = 0; for (let i = Math.max(0, p - k); i <= Math.min(a.length - 1, p + k); i++) { s += a[i] * i; n += a[i]; } return n ? s / n : p; };
  return { line: Math.max(1, around(black, lt, 1)), space: around(pair, sp, 1) };
}

/* ---------- the staves ---------- */

/* Rows of horizontal line ink in a vertical strip: each pixel that lies in a horizontal run of ink at least
   minRun long counts. */
function lineRuns(bin, minRun) {
  const { w, h, d } = bin, out = new Uint8Array(w * h);
  // a line in a photo that slopes a little steps from row to row: ink in the row or the ones beside it counts
  const ink = (y, x) => d[y * w + x] || (y > 0 && d[(y - 1) * w + x]) || (y < h - 1 && d[(y + 1) * w + x]);
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      if (!ink(y, x)) { x++; continue; }
      let e = x; while (e < w && ink(y, e)) e++;
      if (e - x >= minRun) out.fill(1, y * w + x, y * w + e);
      x = e;
    }
  }
  return out;
}

/* Peaks of a profile above a threshold: for each run of rows above it, the row (or the middle of the rows)
   with the most line ink, so a beam lying against a line doesn't pull the line's y toward it */
function peaksOf(prof, thr) {
  const out = [];
  let y = 0;
  while (y < prof.length) {
    if (prof[y] < thr) { y++; continue; }
    let e = y, mx = 0;
    while (e < prof.length && prof[e] >= thr) { if (prof[e] > mx) mx = prof[e]; e++; }
    let s = 0, n = 0;
    for (let k = y; k < e; k++) if (prof[k] >= mx * 0.85) { s += prof[k] * k; n += prof[k]; }
    out.push({ y: s / n, top: y, bot: e - 1, v: mx });
    y = e;
  }
  return out;
}

/* Groups of evenly spaced lines in a list of peaks: 5 for a staff, 6 for guitar tab. Other peaks (beams,
   ledger lines, text) may sit between them, so each line is looked for where the spacing puts it. */
function groups(peaks, space) {
  const out = [], used = new Set();
  const near = (y, tol) => {
    let best = -1, bd = tol;
    for (let j = 0; j < peaks.length; j++) { const dd = Math.abs(peaks[j].y - y); if (dd <= bd && !used.has(j)) { bd = dd; best = j; } }
    return best;
  };
  for (let i = 0; i < peaks.length; i++) {
    if (used.has(i)) continue;
    // the first gap: each following peak a plausible spacing away, the closest to the usual staff space first
    const cands = [];
    for (let j = i + 1; j < peaks.length; j++) {
      const g = peaks[j].y - peaks[i].y;
      if (g > space * 1.8) break;
      if (g >= space * 0.7) cands.push(j);
    }
    cands.sort((a, b) => Math.abs(peaks[a].y - peaks[i].y - space) - Math.abs(peaks[b].y - peaks[i].y - space));
    for (const j of cands) {
      const g = peaks[j].y - peaks[i].y, tol = Math.max(1.5, g * 0.22);
      // the chain of evenly spaced peaks, up to three ledger lines or beams beyond a staff's five
      const found = [i, j], ys = [peaks[i].y, peaks[j].y];
      let y = peaks[j].y, miss = 0;
      for (let k = 2; k < 9; k++) {
        const n = near(y + g, tol);
        if (n < 0 || found.includes(n)) {
          // one line hidden under a symbol in this strip: where it should be, if the next one is there
          if (miss) break;
          miss++; y += g; found.push(-1); ys.push(y); continue;
        }
        found.push(n); ys.push(peaks[n].y); y = peaks[n].y;
      }
      while (found.length && found[found.length - 1] < 0) { found.pop(); ys.pop(); }
      if (found.length < 5) continue;
      // the staff is the strongest run of five (staff lines are longer than ledger lines); six strong lines a
      // little wider apart than a staff is guitar tab
      const v = k => (found[k] >= 0 ? peaks[found[k]].v : 0);
      const win = n => {
        let best = -1, bv = -1;
        for (let a = 0; a + n <= found.length; a++) { let t = 0; for (let k = a; k < a + n; k++) t += v(k); if (t > bv) { bv = t; best = a; } }
        return best;
      };
      let from = win(5), n = 5;
      const tab = found.length >= 6 && g > space * 1.15;
      if (!tab && Math.abs(g - space) > space * 0.2) continue; // the staves on a page share one size
      if (tab) {
        const a6 = win(6), vmax = Math.max(...found.map((_, k) => v(k)));
        let strong = true; for (let k = a6; k < a6 + 6; k++) if (v(k) < vmax * 0.75) strong = false;
        if (strong) { from = a6; n = 6; } else if (Math.abs(g - space) > space * 0.2) continue;
      }
      found.slice(from, from + n).forEach(k => { if (k >= 0) used.add(k); });
      out.push({ ys: ys.slice(from, from + n), n });
      break;
    }
  }
  return out;
}

/* Find the staves. Lines in a photo bend and slope, so the page is cut into vertical strips; in each, the
   rows of long horizontal runs give peaks, groups of five even peaks are staves, and the strips are linked
   into whole staves. Returns staves [{ lines: [[x, y0..y4]...] (knots), x0, x1, space, tab }] sorted
   top to bottom, with lineY(staff, i, x) for any x. Six-line groups (guitar tab) are returned with tab: true. */
export function findStaves(bin, metrics) {
  const { w, h } = bin;
  const sp = metrics.space;
  const runs = lineRuns(bin, Math.max(4, Math.round(sp * 3.5)));
  const sw = Math.max(16, Math.round(sp * 3)); // strip width
  const strips = [];
  for (let x0 = 0; x0 < w; x0 += sw) {
    const x1 = Math.min(w, x0 + sw), prof = new Float64Array(h);
    for (let y = 0; y < h; y++) { let n = 0; const o = y * w; for (let x = x0; x < x1; x++) n += runs[o + x]; prof[y] = n; }
    const pk = peaksOf(prof, (x1 - x0) * 0.45);
    strips.push({ x: (x0 + x1) / 2, groups: groups(pk, sp) });
  }
  // link strips: each track follows a staff from strip to strip by the y of its top line
  const tracks = [];
  strips.forEach(st => {
    const taken = new Set();
    st.groups.forEach(g => {
      let best = null, bd = sp * 1.2;
      tracks.forEach(t => {
        if (taken.has(t) || t.n !== g.n) return;
        const last = t.knots[t.knots.length - 1];
        const dist = Math.abs(last.ys[0] - g.ys[0]);
        if (st.x - last.x < sw * 12 && dist < bd) { bd = dist; best = t; }
      });
      if (best) { best.knots.push({ x: st.x, ys: g.ys }); taken.add(best); }
      else { const t = { n: g.n, knots: [{ x: st.x, ys: g.ys }] }; tracks.push(t); taken.add(t); }
    });
  });
  if (globalThis.OMR_DEBUG) tracks.forEach(t => console.log("track", t.n, t.knots.map(k => Math.round(k.x) + ":" + Math.round(k.ys[0])).join(" ")));
  const minKnots = Math.max(3, Math.round(strips.length * 0.12));
  let staves = tracks.filter(t => t.knots.length >= minKnots).map(t => {
    const ys = t.knots.map(k => k.ys);
    const gaps = []; ys.forEach(a => { for (let i = 1; i < a.length; i++) gaps.push(a[i] - a[i - 1]); });
    gaps.sort((a, b) => a - b);
    return { knots: smoothKnots(t.knots), space: gaps[gaps.length >> 1], tab: t.n === 6, nLines: t.n };
  });
  // a staff found twice (two tracks broken apart) keeps the longer
  staves.sort((a, b) => a.knots.length - b.knots.length);
  staves = staves.filter((s, i) => !staves.slice(i + 1).some(o => Math.abs(lineY(o, 0, mid(s)) - lineY(s, 0, mid(s))) < sp && overlaps(s, o)));
  staves.forEach(s => extent(bin, s));
  staves = staves.filter(s => s.x1 - s.x0 > sp * 8);
  staves.sort((a, b) => lineY(a, 0, w / 2) - lineY(b, 0, w / 2));
  return staves;
}
const mid = s => (s.knots[0].x + s.knots[s.knots.length - 1].x) / 2;
const overlaps = (a, b) => a.knots[0].x <= b.knots[b.knots.length - 1].x && b.knots[0].x <= a.knots[a.knots.length - 1].x;

/* Knots whose spacing jumps from their neighbours' (a strip that grouped a ledger line or a beam) are dropped */
function smoothKnots(knots) {
  // a knot whose lines are spaced unlike the rest of the staff (it took a beam or ledger line for a line)
  const spacing = k => (k.ys[k.ys.length - 1] - k.ys[0]) / (k.ys.length - 1);
  const sorted = knots.map(spacing).sort((a, b) => a - b), med = sorted[sorted.length >> 1];
  knots = knots.filter(k => Math.abs(spacing(k) - med) <= med * 0.08);
  if (knots.length < 3) return knots;
  return knots.filter((k, i) => {
    const nb = [knots[i - 1], knots[i + 1]].filter(Boolean);
    return nb.some(o => Math.abs(o.ys[0] - k.ys[0]) < (k.ys[k.ys.length - 1] - k.ys[0]) * 0.15 + 2 + Math.abs(o.x - k.x) * 0.06);
  });
}

/* The y of line i (0 = top) of a staff at x, linear between knots and straight beyond the ends */
export function lineY(st, i, x) {
  const k = st.knots;
  if (k.length === 1 || x <= k[0].x) return extrap(k[0], k[1] || k[0], i, x);
  if (x >= k[k.length - 1].x) return extrap(k[k.length - 1], k[k.length - 2] || k[k.length - 1], i, x);
  let lo = 0, hi = k.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (k[m].x <= x) lo = m; else hi = m; }
  const f = (x - k[lo].x) / (k[hi].x - k[lo].x || 1);
  return k[lo].ys[i] * (1 - f) + k[hi].ys[i] * f;
}
function extrap(a, b, i, x) {
  if (a === b || a.x === b.x) return a.ys[i];
  // the slope over the last few strips, so an end doesn't swing on one noisy knot
  const slope = (a.ys[i] - b.ys[i]) / (a.x - b.x);
  return a.ys[i] + Math.max(-0.1, Math.min(0.1, slope)) * (x - a.x);
}
/* The staff position of y at x: 0 the bottom line, 8 the top line, one step per line or space */
export function staffPos(st, y, x) {
  const n = st.nLines - 1;
  const top = lineY(st, 0, x), bot = lineY(st, n, x);
  return (bot - y) / ((bot - top) / n) * 2;
}
/* The local staff space at x */
export const spaceAt = (st, x) => (lineY(st, st.nLines - 1, x) - lineY(st, 0, x)) / (st.nLines - 1);

/* Where the staff's lines start and end: the widest x range where most of its lines have ink */
function extent(bin, st) {
  const { w, d } = bin;
  const has = x => {
    let n = 0;
    for (let i = 0; i < st.nLines; i++) {
      const y = Math.round(lineY(st, i, x));
      if ((y >= 0 && y < bin.h && d[y * w + x]) || (y > 0 && d[(y - 1) * w + x]) || (y + 1 < bin.h && d[(y + 1) * w + x])) n++;
    }
    return n >= st.nLines - 1;
  };
  const c = Math.round(st.knots[Math.floor(st.knots.length / 2)].x);
  const gapMax = Math.max(3, st.space * 0.6);
  let x0 = c, miss = 0;
  for (let x = c; x >= 0; x--) { if (has(x)) { x0 = x; miss = 0; } else if (++miss > gapMax) break; }
  let x1 = c; miss = 0;
  for (let x = c; x < w; x++) { if (has(x)) { x1 = x; miss = 0; } else if (++miss > gapMax) break; }
  st.x0 = x0; st.x1 = x1;
}

/* Take the staff lines (and ledger lines) out of the ink, keeping whatever crosses them: at each x, a run of
   ink around a line's y no taller than a line is the line alone. Returns a new binary image. */
export function removeStaves(bin, staves, metrics) {
  const { w, h } = bin, d = bin.d.slice();
  const maxRun = Math.max(2, Math.round(metrics.line * 1.2 + 0.5));
  const clear = (x, yc) => {
    const y = Math.round(yc);
    let a = -1;
    for (let dy = 0; dy <= Math.ceil(metrics.line) + 1 && a < 0; dy++) {
      if (y + dy >= 0 && y + dy < h && d[(y + dy) * w + x]) a = y + dy;
      else if (y - dy >= 0 && y - dy < h && d[(y - dy) * w + x]) a = y - dy;
    }
    if (a < 0) return;
    let t = a, b = a;
    while (t > 0 && d[(t - 1) * w + x]) t--;
    while (b < h - 1 && d[(b + 1) * w + x]) b++;
    if (b - t + 1 <= maxRun) for (let yy = t; yy <= b; yy++) d[yy * w + x] = 0;
  };
  staves.forEach(st => {
    for (let x = Math.max(0, st.x0 - 1); x <= Math.min(w - 1, st.x1 + 1); x++) for (let i = 0; i < st.nLines; i++) clear(x, lineY(st, i, x));
  });
  // ledger lines: short lines a space beyond the staff, found as thin horizontal runs of about two spaces
  staves.forEach(st => {
    if (st.tab) return;
    const sp = st.space;
    for (let k = 1; k <= 5; k++) {
      for (const side of [-1, 1]) {
        let x = Math.max(0, st.x0);
        while (x <= Math.min(w - 1, st.x1)) {
          const yc = side < 0 ? lineY(st, 0, x) - k * spaceAt(st, x) : lineY(st, 4, x) + k * spaceAt(st, x);
          const y = Math.round(yc);
          const thin = xx => {
            for (let dy = -1; dy <= 1; dy++) {
              const yy = y + dy; if (yy < 1 || yy >= h - 1 || !d[yy * w + xx]) continue;
              let t = yy, b = yy; while (t > 0 && d[(t - 1) * w + xx]) t--; while (b < h - 1 && d[(b + 1) * w + xx]) b++;
              return b - t + 1 <= maxRun ? 1 : 2;
            }
            return 0;
          };
          if (!thin(x)) { x++; continue; }
          let e = x; while (e <= st.x1 && thin(e)) e++;
          if (e - x >= sp * 1.2 && e - x <= sp * 4) for (let xx = x; xx < e; xx++) clear(xx, side < 0 ? lineY(st, 0, xx) - k * spaceAt(st, xx) : lineY(st, 4, xx) + k * spaceAt(st, xx));
          x = e + 1;
        }
      }
    }
  });
  return { w, h, d };
}

/* Turn a grey image by angle (radians; a positive angle levels lines that fall to the right), keeping its size; the corners
   brought in are paper. */
export function rotateGray(img, angle) {
  const { w, h, d } = img, out = new Uint8Array(w * h);
  const c = Math.cos(angle), s = Math.sin(angle), cx = w / 2, cy = h / 2;
  // paper: the brightest common level
  const hist = new Uint32Array(256); for (let i = 0; i < d.length; i += 7) hist[d[i]]++;
  let paper = 255, pv = 0; for (let i = 128; i < 256; i++) if (hist[i] > pv) { pv = hist[i]; paper = i; }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = x - cx, dy = y - cy;
    const sx = c * dx - s * dy + cx, sy = s * dx + c * dy + cy;
    const x0 = Math.floor(sx), y0 = Math.floor(sy);
    if (x0 < 0 || y0 < 0 || x0 >= w - 1 || y0 >= h - 1) { out[y * w + x] = paper; continue; }
    const fx = sx - x0, fy = sy - y0, i = y0 * w + x0;
    out[y * w + x] = (d[i] * (1 - fx) + d[i + 1] * fx) * (1 - fy) + (d[i + w] * (1 - fx) + d[i + w + 1] * fx) * fy;
  }
  return { w, h, d: out };
}

/* The slope of the staves (mean of each staff's top line from end to end), as an angle in radians */
export function staffAngle(staves) {
  let s = 0, n = 0;
  staves.forEach(st => {
    const k = st.knots; if (k.length < 2) return;
    const a = k[0], b = k[k.length - 1], len = b.x - a.x;
    if (len <= 0) return;
    s += Math.atan2(b.ys[0] - a.ys[0], len) * len; n += len;
  });
  return n ? s / n : 0;
}
