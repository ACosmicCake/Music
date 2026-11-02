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

  // a head above or below the staff sits on or between ledger lines: without them it is a fingering digit,
  // a dynamic (p, f) or a string number, which guitar scores have around the notes
  for (let i = heads.length - 1; i >= 0; i--) if (!ledgersFor(bin, staves[heads[i].staff], heads[i], sp)) heads.splice(i, 1);

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
    if (!c) return;
    // in the same ink as a head it is that head's stem, unless the head is not beside it (a tie from a note
    // touches the bar line)
    if (headComps.has(st.comp) && heads.some(hd => hd.comp === st.comp && Math.abs(hd.x - st.x) < sp * 1.3)) return;
    // a tie or slur touching a bar line makes the piece wide; away from the stroke it is a thin curve, where a
    // beam is a thick bar
    if ((c.x1 - c.x0 + 1) > sp * 1.2 && !thinBeside(R, labels, c, st.x, sp, heads.filter(hd => hd.comp === st.comp).map(hd => hd.x))) return;
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
    if (cw < 0.18 || ch < 0.18 || cw > 0.75 || ch > 0.75) return; // a photo's blur makes dots larger
    if (c.area < (c.x1 - c.x0 + 1) * (c.y1 - c.y0 + 1) * 0.5) return;
    // a dot stands alone on the page as printed: a piece of a fingering digit cut off by a staff line doesn't
    if (!aloneIn(bin, c, Math.max(1, Math.round(sp * 0.1)))) return;
    const at = onStaff(c.cx, c.cy, 5);
    if (at) dots.push({ x: c.cx, y: c.cy, ...at, id: c.id });
  });
  findRepeats(bars, dots, staves, sp);
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

  return { notes, syms, bars, heads, stems, dots, labels, comps, ink: R };
}

/* Away from a stroke at x (more than half a space), is every column of the piece thin (a curve, not a beam)?
   Columns at the heads the curve runs into (headXs, a blurred photo joins them) are left out. */
function thinBeside(R, labels, c, x, sp, headXs = []) {
  const { w } = R;
  const runs = [];
  for (let xx = c.x0; xx <= c.x1; xx++) {
    if (Math.abs(xx - x) <= sp * 0.5 || headXs.some(hx => Math.abs(xx - hx) < sp * 0.9)) continue;
    let run = 0, best = 0;
    for (let y = c.y0; y <= c.y1; y++) { if (labels[y * w + xx] === c.id) { run++; if (run > best) best = run; } else run = 0; }
    if (best > sp * 0.55) return false;
    if (best) runs.push(best);
  }
  // a curve thins toward its ends; a beam is as thick all along
  runs.sort((a, b) => a - b);
  return runs.length > 0 && runs[Math.floor(runs.length / 2)] < sp * 0.4;
}

/* Ties: between two notes in a row on one staff at the same staff position, a thin curve just above or below
   the heads (with the staff lines out). Looked for column by column in the gap between the heads: most columns
   need a short run of ink in the band, on one side. Marks hd.tieStart and the next head's tieStop. */
export function findTies(ink, events, sp) {
  const { w, h, d } = ink;
  const evs = events.filter(e => !e.rest && e.heads && e.heads.length);
  for (let k = 0; k + 1 < evs.length; k++) {
    const A = evs[k], B = evs[k + 1];
    A.heads.forEach(a => {
      const b = B.heads.find(hb => Math.abs(hb.pos - a.pos) < 0.3);
      if (!b || b.x - a.x > sp * 9 || b.x - a.x < sp * 1.6) return;
      const x0 = Math.round(a.x + sp * 0.85), x1 = Math.round(b.x - sp * 0.85);
      if (x1 - x0 < sp * 0.5) return;
      const y = (a.y + b.y) / 2;
      for (const side of [1, -1]) {
        const near = y + side * sp * 0.35, far = y + side * sp * 1.7;
        let hit = 0, n = 0;
        for (let x = x0; x <= x1; x++) {
          n++;
          let run = 0, best = 0, any = false;
          for (let yy = Math.round(Math.min(near, far)); yy <= Math.round(Math.max(near, far)); yy++) {
            if (yy < 0 || yy >= h || x < 0 || x >= w) continue;
            if (d[yy * w + x]) { run++; any = true; if (run > best) best = run; } else run = 0;
          }
          if (any && best <= sp * 0.45) hit++;
        }
        if (n && hit / n >= 0.72) { a.tieStart = true; b.tieStop = true; return; }
      }
    });
  }
}

/* Repeat signs: two dots in the middle two spaces (staff positions 3 and 5) beside a bar line. Dots on its right
   open a repeat (forward), on its left close one (backward). The dots are used up, so no note takes them for its
   own dot. Sets bar.repeat on the nearest bar line. */
export function findRepeats(bars, dots, staves, sp) {
  const free = dots.filter(d => !d.used && !staves[d.staff].tab);
  free.forEach(a => {
    if (a.used || Math.abs(a.pos - 5) > 0.6) return;
    const b = free.find(d => d !== a && !d.used && d.staff === a.staff && Math.abs(d.x - a.x) < sp * 0.45 && Math.abs(d.pos - 3) < 0.6);
    if (!b) return;
    const x = (a.x + b.x) / 2;
    let best = null, bd = Infinity;
    bars.forEach(bl => { if (bl.staff !== a.staff) return; const d = Math.abs(bl.x - x); if (d < sp * 1.6 && d < bd) { bd = d; best = bl; } });
    if (!best) return;
    a.used = b.used = true;
    const dir = x > best.x ? 'forward' : 'backward';
    best.repeat = best.repeat && best.repeat !== dir ? 'both' : dir;
  });
}

/* The digits of a stacked time signature that came out as one piece: the top half and the bottom half of the
   staff, each cut where a column has no ink. Null unless every piece reads as a digit. */
const DIGITS = /^t\d$/;
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
        // a digit stacked over another in the staff: only a digit (a font unlike the examples may look
        // more like something else), so the nearest digit, if it is near enough
        const f = features(labels, w, box, sp, c.id);
        let r = classify(f);
        if (!r || !/^t\d$/.test(r.cls)) r = classify(f, DIGITS);
        if (!r || !/^t\d$/.test(r.cls) || r.d > 0.4) return null;
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

/* No ink in a thin ring around a piece's box (a few stray pixels allowed) */
function aloneIn(img, c, r) {
  const { w, h, d } = img;
  let ink = 0, n = 0;
  for (let y = Math.max(0, c.y0 - r); y <= Math.min(h - 1, c.y1 + r); y++) {
    for (let x = Math.max(0, c.x0 - r); x <= Math.min(w - 1, c.x1 + r); x++) {
      if (y >= c.y0 && y <= c.y1 && x >= c.x0 && x <= c.x1) continue;
      n++; if (d[y * w + x]) ink++;
    }
  }
  return ink <= n * 0.08;
}

/* The ledger lines a head beyond the staff needs, every one there (a run of ink across the head at each) */
function ledgersFor(bin, st, hd, sp) {
  const pos = hd.pos, top = (st.nLines - 1) * 2;
  if (pos > -1.4 && pos < top + 1.4) return true;
  const want = [];
  if (pos < 0) for (let k = -2; k >= pos - 0.6; k -= 2) want.push(k);
  else for (let k = top + 2; k <= pos + 0.6; k += 2) want.push(k);
  const bot = lineY(st, st.nLines - 1, hd.x), gap = (bot - lineY(st, 0, hd.x)) / (st.nLines - 1);
  const { w, h, d } = bin, half = Math.round(sp * 0.75), slack = Math.max(1, Math.round(sp * 0.25));
  return want.every(k => {
    const yc = Math.round(bot - k * gap / 2);
    for (let y = Math.max(0, yc - slack); y <= Math.min(h - 1, yc + slack); y++) {
      let n = 0;
      for (let x = Math.max(0, Math.round(hd.x) - half); x <= Math.min(w - 1, Math.round(hd.x) + half); x++) n += d[y * w + x] ? 1 : 0;
      if (n >= (2 * half + 1) * 0.85) return true;
    }
    return false;
  });
}
