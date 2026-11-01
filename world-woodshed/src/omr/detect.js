/* World Woodshed — score recognition, step 2: the symbols on each staff. Works on the ink with the staff
   lines taken out (src/omr/image.js) and finds note heads (filled ones by their thickness, hollow ones by
   the hole inside), stems, the beams or flags on each stem, augmentation dots, bar lines, and hands the other
   pieces of ink to a classifier (src/omr/classify.js: clefs, accidentals, rests, time signatures).
   All sizes are in staff spaces (sp, line to line), so the rules hold at any resolution. */
import { components, distance, holes, verticals, features } from './shapes.js';
import { lineY, staffPos, spaceAt } from './image.js';

/* Which staff a point belongs to, and its staff position there; null when it is far from every staff */
export function staffAt(staves, x, y, reach = 6) {
  let best = null, bd = Infinity;
  staves.forEach((st, i) => {
    if (x < st.x0 - st.space * 2 || x > st.x1 + st.space * 2) return;
    const top = lineY(st, 0, x), bot = lineY(st, st.nLines - 1, x), s = spaceAt(st, x);
    const dd = y < top ? (top - y) / s : y > bot ? (y - bot) / s : 0;
    if (dd < bd) { bd = dd; best = i; }
  });
  if (best == null || bd > reach) return null;
  return { staff: best, pos: staffPos(staves[best], y, x) };
}

export function detect(R, staves, metrics, classify, bin = R) {
  const { w, h } = R, sp = metrics.space, lt = metrics.line;
  const { labels, comps } = components(R);
  const D = distance(R);
  const notationStaves = staves.map((s, i) => (s.tab ? -1 : i)).filter(i => i >= 0);
  const onStaff = (x, y, reach) => {
    const r = staffAt(staves, x, y, reach);
    return r && !staves[r.staff].tab ? r : null;
  };

  /* ---- 1. pieces that are whole symbols: clefs, time signatures, accidentals, rests (classified first, so
     their thick parts and loops are not taken for note heads) ---- */
  const kind = new Map(); // component id → { cls, conf }
  const syms = [];
  comps.forEach(c => {
    if (!c) return;
    const cw = (c.x1 - c.x0 + 1) / sp, ch = (c.y1 - c.y0 + 1) / sp;
    if (cw < 0.15 && ch < 0.15) return;
    if (cw > 4 || ch > 9) return; // beamed groups, slurs, text lines: never one symbol
    if (cw < 0.4 && ch > 1.5) return; // a thin upright line: a stem or a bar line
    const where = onStaff(c.cx, c.cy, 4);
    if (!where) return;
    // a time signature whose digits touch through what was left of the lines: read it digit by digit
    if (ch > 3 && ch < 5 && cw > 0.8 && cw < 4) {
      const digits = splitDigits(labels, w, c, staves[where.staff], sp, classify);
      if (digits) {
        kind.set(c.id, { cls: 'time', conf: 1 });
        digits.forEach(d => syms.push(Object.assign(d, { id: c.id, staff: where.staff, pos: staffPos(staves[where.staff], d.y, d.x) })));
        return;
      }
    }
    const f = features(labels, w, c, sp);
    const r = classify(f);
    if (!r) return;
    kind.set(c.id, r);
    syms.push(Object.assign({ cls: r.cls, conf: r.conf, x: c.cx, y: c.cy, x0: c.x0, x1: c.x1, y0: c.y0, y1: c.y1, id: c.id }, where));
  });
  const isSymbol = id => {
    const k = kind.get(id);
    return k && k.cls !== 'note' && k.cls !== 'other';
  };

  /* ---- 2. note heads ---- */
  const heads = [];
  // filled heads: their middle is far from the paper (about half a space); beams are thinner, stems far thinner
  const thr = sp * 0.27;
  const core = new Uint8Array(w * h);
  for (let i = 0; i < D.length; i++) if (D[i] >= thr && !isSymbol(labels[i])) core[i] = 1;
  const coreLab = components({ w, h, d: core });
  const cores = coreLab.comps;
  // the thickest point of each core: a head is about a space tall (half a space to the paper), a beam half that
  const maxD = new Float32Array(cores.length);
  for (let i = 0; i < D.length; i++) { const id = coreLab.labels[i]; if (id && D[i] > maxD[id]) maxD[id] = D[i]; }
  cores.forEach(c => {
    if (!c) return;
    if (maxD[c.id] < sp * 0.34) return;
    const cw = (c.x1 - c.x0 + 1) / sp, ch = (c.y1 - c.y0 + 1) / sp;
    if (cw > 1.3 || ch > 1.0) {
      // two heads a second apart on one side, or a cluster: as many heads as fit
      if (ch <= 1.0 || cw > 1.6 || ch > 3.2) return;
      const n = Math.round((ch + 0.45) / 0.9);
      for (let k = 0; k < n; k++) {
        const y = c.y0 + (k + 0.5) * (c.y1 - c.y0 + 1) / n;
        const at = onStaff(c.cx, y, 6);
        if (at) heads.push({ x: c.cx, y, filled: true, comp: labels[Math.round(y) * w + Math.round(c.cx)] || labels[Math.round(c.cy) * w + Math.round(c.cx)], ...at });
      }
      return;
    }
    if (cw < 0.12 && ch < 0.12) return;
    const at = onStaff(c.cx, c.cy, 6);
    if (!at) return;
    const id = labels[Math.round(c.cy) * w + Math.round(c.cx)];
    heads.push({ x: c.cx, y: c.cy, filled: true, comp: id, ...at, size: c.area });
  });
  // hollow heads: a hole about half a space across with a ring of ink around it. Looked for with the staff
  // lines out (a head on a line: the line crossed its hole) and with them in (a head in a space: taking out
  // the lines above and below can open its thin ring)
  const hs = holes(R, sp * sp * 2);
  if (globalThis.OMR_BINHOLES) holes(bin, sp * sp).forEach(o => {
    // with the lines in, paper boxed in by two lines and two stems is a hole too: a head's hole is smaller and round
    const hw = (o.x1 - o.x0 + 1) / sp, hh = (o.y1 - o.y0 + 1) / sp;
    if (hh > 0.62 || hw > 1.0 || o.area < (o.x1 - o.x0 + 1) * (o.y1 - o.y0 + 1) * 0.5) return;
    if (!hs.some(q => Math.abs(q.cx - o.cx) < sp * 0.4 && Math.abs(q.cy - o.cy) < sp * 0.4)) { o.fromBin = true; hs.push(o); }
  });
  hs.forEach(o => {
    const hw = (o.x1 - o.x0 + 1) / sp, hh = (o.y1 - o.y0 + 1) / sp;
    if (hw < 0.2 || hw > 1.3 || hh < 0.12 || hh > 0.85 || o.area < sp * sp * 0.04) return;
    // the ring: ink just outside the hole on both sides
    const yc = Math.round(o.cy), lx = Math.round(o.x0 - 1), rx = Math.round(o.x1 + 1);
    if (lx < 0 || rx >= w) return;
    const id = labels[yc * w + lx] || labels[yc * w + rx];
    if (!id || isSymbol(id)) return;
    // the ink around: a head is wider than tall
    const c = comps[id];
    if ((c.x1 - c.x0 + 1) / sp < 0.8) return;
    const at = onStaff(o.cx, o.cy, 6);
    if (!at) return;
    heads.push({ x: o.cx, y: o.cy, filled: false, comp: id, hole: o, fromBin: o.fromBin, ...at });
  });

  /* ---- 3. stems and bar lines ---- */
  const vs = verticals(R, Math.round(sp * 1.6), Math.max(3, sp * 0.8));
  const stems = [];
  const bars = [];
  vs.forEach(v => {
    const id = labels[Math.round((v.y0 + v.y1) / 2) * w + Math.round(v.x)] || labels[v.y0 * w + Math.round(v.x)];
    if (id && isSymbol(id)) return;
    v.comp = id;
    v.heads = [];
    stems.push(v);
  });
  // each head to the stem it hangs on: stem up on the head's right, stem down on its left
  heads.forEach(hd => {
    let best = null, bd = Infinity;
    stems.forEach(st => {
      // a stem is thin and at least about two and a half spaces long (a column of chord heads is neither)
      if (st.len < sp * 2.4 || st.width > Math.max(3, sp * 0.35)) return;
      const dx = st.x - hd.x;
      if (Math.abs(dx) > sp * 1.0 || Math.abs(dx) < sp * 0.15) return;
      if (hd.y < st.y0 - sp * 0.75 || hd.y > st.y1 + sp * 0.75) return;
      const up = dx > 0; // a stem on the right goes up from its lowest head
      const end = up ? st.y1 : st.y0;
      // the head is near the stem's head end, or along it (a chord)
      const along = hd.y > st.y0 + sp * 0.3 && hd.y < st.y1 - sp * 0.3;
      const nearEnd = Math.abs(hd.y - end) < sp * 0.8;
      if (!nearEnd && !along) return;
      const score = Math.abs(Math.abs(dx) - sp * 0.6) + (nearEnd ? 0 : sp * 0.3);
      if (score < bd) { bd = score; best = st; }
    });
    if (best) { best.heads.push(hd); hd.stem = best; }
  });
  // a stem's direction: the end with heads is the head end
  stems.forEach(st => {
    if (!st.heads.length) return;
    const nearTop = st.heads.filter(hd => hd.y < st.y0 + sp * 1.0).length, nearBot = st.heads.filter(hd => hd.y > st.y1 - sp * 1.0).length;
    st.up = nearBot >= nearTop;
    // keep heads that make sense for that direction: on the head end's half of the stem
    st.heads = st.heads.filter(hd => (st.up ? hd.y > st.y0 + sp * 1.2 : hd.y < st.y1 - sp * 1.2) || (st.up ? hd.x < st.x + sp * 0.2 : hd.x > st.x - sp * 0.2));
    st.heads.forEach(hd => { hd.stem = st; });
  });
  heads.forEach(hd => { if (hd.stem && !hd.stem.heads.includes(hd)) hd.stem = null; });
  // the lengths a stem must reach: from the furthest head, at least about 2.2 spaces
  stems.forEach(st => {
    if (!st.heads.length) return;
    const far = st.up ? Math.min(...st.heads.map(hd => hd.y)) : Math.max(...st.heads.map(hd => hd.y));
    const len = st.up ? far - st.y0 : st.y1 - far;
    if (len < sp * 1.8) { st.heads.forEach(hd => { hd.stem = null; }); st.heads = []; }
  });
  // bar lines: strokes with no heads that run from a staff's top line to its bottom line
  const headComps = new Set(heads.map(hd => hd.comp));
  stems.filter(st => !st.heads.length).forEach(st => {
    // a bar line is a piece of its own: a stroke in the same ink as a note head is a stem, a flag or a beam
    const c = comps[st.comp];
    if (!c || headComps.has(st.comp) || (c.x1 - c.x0 + 1) > sp * 1.2) return;
    notationStaves.forEach(si => {
      const s = staves[si], x = st.x;
      if (x < s.x0 - sp || x > s.x1 + sp) return;
      const top = lineY(s, 0, x), bot = lineY(s, 4, x);
      if (st.y0 <= top + sp * 0.4 && st.y1 >= bot - sp * 0.4 && st.width <= sp * 0.8) {
        // a bar line stops at its staff, or runs on to the next staff of the system
        const above = st.y0 < top - sp * 1.5, below = st.y1 > bot + sp * 1.5;
        bars.push({ staff: si, x, thick: st.width > Math.max(lt * 2.5, sp * 0.3), joinsUp: above, joinsDown: below, y0: st.y0, y1: st.y1 });
      }
    });
  });

  /* ---- 4. filled heads need a stem; a hollow head with no stem is a whole note ---- */
  const notes = [];
  const head = (hd, extra) => Object.assign({ x: hd.x, y: hd.y, staff: hd.staff, pos: hd.pos }, extra);
  stems.filter(st => st.heads.length).forEach(st => {
    const hs = st.heads;
    const filled = hs.filter(hd => hd.filled).length >= hs.length / 2;
    const freeEnd = st.up ? st.y0 : st.y1;
    const near = st.up ? Math.min(...hs.map(hd => hd.y)) : Math.max(...hs.map(hd => hd.y));
    const hooks = filled ? countHooks(R, labels, st, freeEnd, near, sp) : 0;
    const staff = mode(hs.map(hd => hd.staff));
    notes.push({ x: st.x, staff, up: st.up, filled, hooks, stem: st, heads: hs.map(hd => head(hd)).sort((a, b) => a.pos - b.pos), x0: Math.min(...hs.map(hd => hd.x)), y0: st.y0, y1: st.y1 });
  });
  heads.filter(hd => !hd.stem && !hd.filled).forEach(hd => {
    const c = comps[hd.comp], cw = (c.x1 - c.x0 + 1) / sp, ch = (c.y1 - c.y0 + 1) / sp;
    if (cw < 1.0 || cw > 2.6 || ch < 0.6 || ch > 1.6) return; // a whole note's head is wide; anything else with a hole is not one
    notes.push({ x: hd.x, staff: hd.staff, filled: false, whole: true, hooks: 0, heads: [head(hd)], x0: hd.x, y0: c.y0, y1: c.y1 });
  });
  // whole notes stacked in a chord (no stem): join heads at the same x
  joinWholes(notes, sp);

  /* ---- 5. augmentation dots: small round pieces just right of a head, in a space ---- */
  const dots = [];
  comps.forEach(c => {
    if (!c) return;
    const cw = (c.x1 - c.x0 + 1) / sp, ch = (c.y1 - c.y0 + 1) / sp;
    if (cw < 0.18 || ch < 0.18 || cw > 0.65 || ch > 0.65) return;
    if (c.area < (c.x1 - c.x0 + 1) * (c.y1 - c.y0 + 1) * 0.5) return;
    const at = onStaff(c.cx, c.cy, 5);
    if (at) dots.push({ x: c.cx, y: c.cy, ...at, id: c.id });
  });
  notes.forEach(n => {
    const right = Math.max(...n.heads.map(hd => hd.x)) + (n.up === false ? 0 : 0);
    n.dots = 0;
    const mine = dots.filter(d => d.staff === n.staff && d.x > right + sp * 0.5 && d.x < right + sp * 2.2 &&
      n.heads.some(hd => Math.abs(d.y - hd.y) < sp * 0.75) && !d.used);
    if (mine.length) {
      // a second dot right after the first
      mine.sort((a, b) => a.x - b.x);
      n.dots = 1; mine[0].used = true;
      const nx = mine.find(d => d !== mine[0] && d.x - mine[0].x < sp * 0.9 && Math.abs(d.y - mine[0].y) < sp * 0.3);
      if (nx) { n.dots = 2; nx.used = true; }
    }
  });

  return { notes, syms, bars, heads, stems, dots, labels, comps };
}

/* The digits of a stacked time signature that came out as one piece: the top half and the bottom half of the
   staff, each cut where a column has no ink. Null unless every piece reads as a digit. */
function splitDigits(labels, w, c, st, sp, classify) {
  const mid = lineY(st, 2, (c.x0 + c.x1) / 2);
  const out = [];
  for (const [y0, y1] of [[c.y0, Math.floor(mid)], [Math.ceil(mid), c.y1]]) {
    const cols = [];
    for (let x = c.x0; x <= c.x1; x++) { let n = 0; for (let y = y0; y <= y1; y++) if (labels[y * w + x] === c.id) n++; cols.push(n); }
    let x = 0;
    const half = [];
    while (x < cols.length) {
      if (cols[x] <= 1) { x++; continue; }
      let e = x; while (e < cols.length && cols[e] > 1) e++;
      // the piece's own rows
      let a = y1, b = y0;
      for (let xx = c.x0 + x; xx < c.x0 + e; xx++) for (let y = y0; y <= y1; y++) if (labels[y * w + xx] === c.id) { if (y < a) a = y; if (y > b) b = y; }
      const box = { x0: c.x0 + x, x1: c.x0 + e - 1, y0: a, y1: b, id: c.id };
      if ((e - x) / sp > 0.4 && (b - a) / sp > 1.2) {
        const r = classify(features(labels, w, box, sp, c.id));
        if (!r || !/^t\d$/.test(r.cls)) return null;
        half.push(Object.assign({ cls: r.cls, conf: r.conf, x: (box.x0 + box.x1) / 2, y: (a + b) / 2 }, box));
      }
      x = e;
    }
    if (!half.length || half.length > 2) return null;
    out.push(...half);
  }
  return out;
}

function mode(a) {
  const m = new Map(); a.forEach(v => m.set(v, (m.get(v) || 0) + 1));
  return [...m.entries()].sort((x, y) => y[1] - x[1])[0][0];
}

function joinWholes(notes, sp) {
  const wholes = notes.filter(n => n.whole).sort((a, b) => a.x - b.x);
  for (let i = 0; i < wholes.length; i++) {
    const a = wholes[i]; if (a.gone) continue;
    for (let j = i + 1; j < wholes.length && wholes[j].x - a.x < sp * 0.6; j++) {
      const b = wholes[j]; if (b.gone || b.staff !== a.staff) continue;
      a.heads.push(...b.heads); b.gone = true;
    }
    a.heads.sort((p, q) => p.pos - q.pos);
  }
  for (let i = notes.length - 1; i >= 0; i--) if (notes[i].gone) notes.splice(i, 1);
}

/* Beams or flags at a stem's free end: crossings of ink joined to the stem, in a column just beside it,
   from the free end toward the heads. Beams and flags mean the same thing for the length of a note. */
function countHooks(R, labels, st, freeEnd, nearHead, sp) {
  const { w, h, d } = R;
  const dir = st.up ? 1 : -1; // from the free end toward the heads
  const startY = freeEnd - dir * sp * 0.5;
  const stopY = nearHead - dir * sp * 0.75;
  const span = (stopY - startY) * dir;
  if (span <= 0) return 0;
  let best = 0;
  for (const off of [-0.45, 0.45, -0.7, 0.7]) {
    if (best && Math.abs(off) > 0.5) break; // the wider columns only when the near ones found nothing
    const x = Math.round(st.x + off * sp);
    if (x < 0 || x >= w) continue;
    let n = 0, inRun = false, runLen = 0;
    for (let k = 0; k <= span; k++) {
      const y = Math.round(startY + dir * k);
      if (y < 0 || y >= h) continue;
      const ink = d[y * w + x] && labels[y * w + x] === st.comp;
      if (ink) { if (!inRun) { inRun = true; runLen = 0; } runLen++; }
      else if (inRun) { inRun = false; if (runLen >= sp * 0.12 && runLen <= sp * 1.4) n++; }
    }
    if (inRun && runLen >= sp * 0.12 && runLen <= sp * 1.4) n++;
    if (n > best && n <= 4) best = n;
  }
  return Math.min(best, 4);
}
