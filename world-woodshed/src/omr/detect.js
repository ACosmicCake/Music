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
    if (!r) {
      // digits in a font unlike the examples, touching: still a time signature when it fills the staff from
      // its top line to its bottom one near the start of the line, with ink above and below the middle.
      // Unread (the time is worked out from the bars), but not taken for notes (a "1" for a stem, the loop
      // of an "8" for a half note's head)
      const st = staves[where.staff], mx = (c.x0 + c.x1) / 2;
      const top = lineY(st, 0, mx), bot = lineY(st, st.nLines - 1, mx), mid = lineY(st, 2, mx);
      if (c.x0 < st.x0 + sp * 12 && Math.abs(c.y0 - top) < sp * 0.6 && Math.abs(c.y1 - bot) < sp * 0.6 && inkIn(labels, w, c, top + sp * 0.5, mid - sp * 0.5) && inkIn(labels, w, c, mid + sp * 0.5, bot - sp * 0.5) &&
        longestRun(labels, w, c) < sp * 2.6) { // (a note's stem runs further: a time signature's "1" is half the staff)
        kind.set(c.id, { cls: 'time', conf: 1 });
        syms.push({ cls: 'timeUnread', conf: 1, x: c.cx, y: c.cy, x0: c.x0, x1: c.x1, y0: c.y0, y1: c.y1, id: c.id, staff: where.staff, pos: where.pos });
        return;
      }
      return;
    }
    // a clef starts the line: further along, a tall piece that looks like one is a chord on one stem
    if (r.cls.startsWith('clef') && c.x0 > staves[where.staff].x0 + sp * 8) return;
    kind.set(c.id, r);
    syms.push(Object.assign({ cls: r.cls, conf: r.conf, x: c.cx, y: c.cy, x0: c.x0, x1: c.x1, y0: c.y0, y1: c.y1, id: c.id }, where));
  });
  // a rest away from the staff with letters of its size beside it is a letter in a word (an "L" can pass for a rest)
  for (let i = syms.length - 1; i >= 0; i--) {
    const y = syms[i];
    if (!/^rest(4|8|16|32)$/.test(y.cls)) continue;
    const st = staves[y.staff], top = lineY(st, 0, y.x), bot = lineY(st, st.nLines - 1, y.x);
    if (y.y1 > top - sp * 0.5 && y.y0 < bot + sp * 0.5) continue;
    const h0 = y.y1 - y.y0 + 1;
    const word = comps.some(c => c && c.id !== y.id && Math.max(c.x0 - y.x1, y.x0 - c.x1) < sp * 1.2 && Math.max(c.x0 - y.x1, y.x0 - c.x1) > -sp * 0.3 && // (letters can touch)
      
      Math.min(c.y1, y.y1) - Math.max(c.y0, y.y0) > Math.min(h0, c.y1 - c.y0 + 1) * 0.5 && (c.y1 - c.y0 + 1) > h0 * 0.3 && (c.x1 - c.x0 + 1) < sp * 2.5);
    if (word) { kind.delete(y.id); syms.splice(i, 1); }
  }
  // one clef to a line: a second tall piece just after it is a chord on one stem
  for (let i = syms.length - 1; i >= 0; i--) {
    const y = syms[i];
    if (!y.cls.startsWith('clef')) continue;
    if (syms.some(o => o !== y && o.cls.startsWith('clef') && o.staff === y.staff && o.x1 < y.x0 && y.x0 - o.x1 < sp * 8)) { kind.delete(y.id); syms.splice(i, 1); }
  }
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
      // two heads side by side (a second, either side of the stem) whose cores touch: split at the narrow column
      if (cw > 1.6 && cw <= 3.2 && ch <= 2.2) {
        (sideBySide(coreLab.labels, w, c, sp) || []).forEach(b => {
          const at = onStaff(b.x, b.y, 6);
          if (at) heads.push({ x: b.x, y: b.y, filled: true, comp: labels[Math.round(b.y) * w + Math.round(b.x)] || labels[Math.round(c.cy) * w + Math.round(c.cx)], ...at });
        });
        return;
      }
      // two heads a second apart on one side, or a cluster: as many heads as fit
      if (ch <= 1.0 || cw > 1.6 || ch > 3.2) return;
      // heads a third apart touch at a narrow waist: split there; heads a second apart overlap, so as many as fit
      const ys = waists(coreLab.labels, w, c);
      const n = ys ? ys.length : Math.round((ch + 0.45) / 0.9);
      for (let k = 0; k < n; k++) {
        const y = ys ? ys[k] : c.y0 + (k + 0.5) * (c.y1 - c.y0 + 1) / n;
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
  // a whole note on a ledger line: the line splits its hole, so it is tried as a ring with the lines in
  comps.forEach(c => {
    if (!c || isSymbol(c.id)) return;
    const cw = (c.x1 - c.x0 + 1) / sp, ch = (c.y1 - c.y0 + 1) / sp;
    if (cw < 1.0 || cw > 2.8 || ch < 0.6 || ch > 1.6) return;
    if (heads.some(hd => hd.comp === c.id)) return;
    const at = onStaff(c.cx, c.cy, 6);
    if (!at || (at.pos > -1.4 && at.pos < 9.4)) return;
    const st = staves[at.staff], p = Math.round(at.pos);
    const bot = lineY(st, st.nLines - 1, c.cx), gap = (bot - lineY(st, 0, c.cx)) / (st.nLines - 1), y = bot - p * gap / 2;
    if (Math.abs(y - c.cy) > gap * 0.35 || !hollowAt(bin, c.cx, y, sp, p % 2 === 0, lt)) return;
    heads.push({ x: c.cx, y, filled: false, comp: c.id, staff: at.staff, pos: p });
  });

  // a head above or below the staff sits on or between ledger lines: without them it is a fingering digit,
  // a dynamic (p, f) or a string number, which guitar scores have around the notes
  // (between two staves a head belongs to the one whose ledger lines it has, not always the nearer)
  for (let i = heads.length - 1; i >= 0; i--) {
    const hd = heads[i];
    if (ledgersFor(bin, staves[hd.staff], hd, sp)) continue;
    const alt = notationStaves.filter(si => si !== hd.staff && hd.x > staves[si].x0 - sp * 2 && hd.x < staves[si].x1 + sp * 2)
      .map(si => ({ si, pos: staffPos(staves[si], hd.y, hd.x) })).find(o => Math.abs(o.pos - 4) < 4 + 12 && ledgersFor(bin, staves[o.si], { x: hd.x, pos: o.pos }, sp) && (o.pos < -1.4 || o.pos > 9.4));
    if (alt) { hd.staff = alt.si; hd.pos = alt.pos; } else heads.splice(i, 1);
  }

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
  // a half note whose ring touches a staff line opens when the line is taken out, so it has no hole above; a
  // stem with no head looks for one with the lines in, where its head would be (left of an up stem at its
  // foot, right of a down stem at its top)
  // (not the curve of a flag beside a stem that has its head)
  const bare = stems.filter(st => !st.heads.length && st.len >= sp * 2.4 && st.width <= Math.max(3, sp * 0.35) &&
    !stems.some(o => o !== st && o.heads.length && Math.abs(o.x - st.x) < sp * 1.6 && o.y0 < st.y1 && st.y0 < o.y1));
  if (bare.length && !globalThis.NOBARE) {
    const bh = holes(bin, sp * sp * 2).filter(o => {
      const hw = (o.x1 - o.x0 + 1) / sp, hh = (o.y1 - o.y0 + 1) / sp;
      // round, not the square corners of paper boxed in by lines and stems
      const fill = o.area / ((o.x1 - o.x0 + 1) * (o.y1 - o.y0 + 1));
      // (nor the loop of a time signature's digit or another symbol)
      if (syms.some(y => y.cls !== 'note' && y.cls !== 'other' && o.cx > y.x0 && o.cx < y.x1 && o.cy > y.y0 && o.cy < y.y1)) return false;
      return hw >= 0.45 && hw <= 1.3 && hh >= 0.3 && hh <= 0.85 && fill >= 0.45 && fill <= 0.86;
    });
    bare.forEach(st => {
      let best = null, bd = Infinity;
      bh.forEach(o => {
        for (const up of [true, false]) {
          const dx = up ? st.x - o.cx : o.cx - st.x, dy = Math.abs(o.cy - (up ? st.y1 : st.y0));
          if (dx < sp * 0.2 || dx > sp * 1.0 || dy > sp * 0.7) continue;
          const v = Math.abs(dx - sp * 0.6) + dy;
          if (v < bd) { bd = v; best = { o, up }; }
        }
      });
      if (!best || heads.some(hd => Math.abs(hd.x - best.o.cx) < sp * 0.5 && Math.abs(hd.y - best.o.cy) < sp * 0.5)) return;
      const at = onStaff(best.o.cx, best.o.cy, 6);
      if (!at || !ledgersFor(bin, staves[at.staff], { x: best.o.cx, pos: at.pos }, sp)) return;
      const hd = { x: best.o.cx, y: best.o.cy, filled: false, comp: st.comp, hole: best.o, byStem: true, ...at, stem: st };
      heads.push(hd); st.heads.push(hd);
    });
  }
  // the other heads of a chord of half notes: rings that touch each other, or a line, rarely leave a hole once
  // the lines are out, so every staff position along the stem's head end is tried with the lines in
  if (!globalThis.NOCHORDSCAN) stems.forEach(st => {
    const hs = st.heads;
    if (!hs.length || hs.some(hd => hd.filled) || st.len < sp * 2.4 || st.width > Math.max(3, sp * 0.35)) return;
    const stf = staves[hs[0].staff];
    // an up stem has its heads on the left (a second's other head aside), a down stem on the right
    const left = hs.filter(hd => hd.x < st.x).length;
    const nearBot = hs.filter(hd => hd.y > st.y1 - sp * 1.0).length, nearTop = hs.filter(hd => hd.y < st.y0 + sp * 1.0).length;
    const up = left * 2 === hs.length ? nearBot >= nearTop : left * 2 > hs.length;
    const bot = lineY(stf, stf.nLines - 1, st.x), gap = (bot - lineY(stf, 0, st.x)) / (stf.nLines - 1);
    const lo = up ? st.y0 + sp * 2.5 : st.y0 - sp * 0.6, hi = up ? st.y1 + sp * 0.6 : st.y1 - sp * 2.5;
    const found = [];
    for (let p = Math.ceil((bot - hi) / (gap / 2)); bot - p * gap / 2 >= lo; p++) {
      const y = bot - p * gap / 2;
      if (heads.some(hd => Math.abs(hd.y - y) < gap * 0.4 && Math.abs(hd.x - st.x) < sp * 1.6)) continue;
      // beside the stem on its usual side, or on the other (a second)
      let best = null;
      for (const side of up ? [-1, 1] : [1, -1]) {
        // (a pixel up or down too: a ring drawn soft at the edges can just miss at its centre)
        for (const off of [0.5, 0.6, 0.4, 0.7, 0.55, 0.65, 0.45]) for (const dy of [0, -1, 1]) {
          const cx = st.x + side * (off * sp + st.width / 2), q = hollowAt(bin, cx, y + dy, sp, p % 2 === 0, lt);
          if (q && (!best || q > best.q)) best = { x: cx, q };
        }
      }
      // (not in a rest or another symbol beside the stem)
      if (best && !syms.some(o => o.cls !== 'note' && o.cls !== 'other' && best.x > o.x0 && best.x < o.x1 && y > o.y0 && y < o.y1)) found.push({ x: best.x, y, p, q: best.q });
    }
    // two heads on one side of the stem are at least a third apart: of a step's two, the clearer ring (the
    // heads found before are weighed the same way: the paper between two touching rings can pass for a hole)
    const all = found.map(f => Object.assign(f, { hd: null })).concat(hs.map(hd => ({ hd, x: hd.x, y: hd.y,
      q: (hollowAt(bin, hd.x, bot - Math.round(hd.pos) * gap / 2, sp, Math.round(hd.pos) % 2 === 0, lt) || 0) + 0.01 })));
    const kept = [];
    all.sort((a, b) => b.q - a.q).forEach(f => {
      if (kept.some(k => Math.abs(k.x - f.x) < sp * 0.8 && Math.abs(k.y - f.y) < gap * 0.8)) { if (f.hd) f.hd.drop = true; return; }
      if (f.hd) { kept.push(f); return; }
      const hd = { x: f.x, y: f.y, filled: false, comp: st.comp, byStem: true, staff: hs[0].staff, pos: f.p, stem: st };
      if (!ledgersFor(bin, stf, hd, sp)) return;
      kept.push(f); heads.push(hd); st.heads.push(hd);
    });
    st.heads = st.heads.filter(hd => !hd.drop);
  });
  // a stem's direction: the end with heads is the head end
  stems.forEach(st => {
    if (!st.heads.length) return;
    // hollow heads on one side of a stem are a third or more apart: of two closer, the one nearer a line or
    // space (the paper between two touching rings is not a head)
    const off = hd => Math.abs(hd.pos - Math.round(hd.pos));
    // one stem's heads are all filled or all hollow: a hole by a filled chord, or the loop of a flag, is not one
    const nf = st.heads.filter(hd => hd.filled).length;
    if (nf && nf < st.heads.length) st.heads.forEach(hd => { if (hd.filled !== nf * 2 >= st.heads.length) hd.drop = true; });
    // a hollow "head" on a stroke right beside a stem with filled heads is the loop of that stem's flags
    // (a stroke shorter than a stem can be a little further off: the flags' outer curve)
    if (!nf && stems.some(o => o !== st && Math.abs(o.x - st.x) < sp * (st.y1 - st.y0 < sp * 3 ? 1.4 : 1.0) && o.y0 < st.y1 && st.y0 < o.y1 && o.heads.some(hd => hd.filled))) st.heads.forEach(hd => { hd.drop = true; });
    const keep = [];
    st.heads.slice().sort((a, b) => off(a) - off(b)).forEach(hd => {
      if (hd.drop) return;
      if (!hd.filled && keep.some(k => !k.filled && Math.abs(k.x - hd.x) < sp * 0.8 && Math.abs(k.y - hd.y) < sp * 0.8)) { hd.drop = true; return; }
      keep.push(hd);
    });
    st.heads = st.heads.filter(hd => !hd.drop);
    const nearTop = st.heads.filter(hd => hd.y < st.y0 + sp * 1.0).length, nearBot = st.heads.filter(hd => hd.y > st.y1 - sp * 1.0).length;
    st.up = nearBot >= nearTop;
    // keep heads that make sense for that direction: on the head end's half of the stem
    st.heads = st.heads.filter(hd => (st.up ? hd.y > st.y0 + sp * 1.2 : hd.y < st.y1 - sp * 1.2) || (st.up ? hd.x < st.x + sp * 0.2 : hd.x > st.x - sp * 0.2));
    st.heads.forEach(hd => { hd.stem = st; });
  });
  for (let i = heads.length - 1; i >= 0; i--) if (heads[i].drop) heads.splice(i, 1);
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

  // a percussion clef: two short thick strokes on the middle lines at the start of the staff
  notationStaves.forEach(si => {
    const s = staves[si], top = lineY(s, 0, s.x0), bot = lineY(s, s.nLines - 1, s.x0);
    const cand = stems.filter(st => !st.heads.length && st.x > s.x0 && st.x < s.x0 + sp * 6 && st.width >= sp * 0.25 &&
      st.len >= sp * 1.4 && st.len <= sp * 2.8 && st.y0 >= top + sp * 0.3 && st.y1 <= bot - sp * 0.3);
    for (const a of cand) {
      const b = cand.find(o => o.x - a.x >= sp * 0.4 && o.x - a.x <= sp * 1.5 && Math.abs(o.y0 - a.y0) < sp * 0.4 && Math.abs(o.y1 - a.y1) < sp * 0.4);
      if (!b) continue;
      const y = (a.y0 + a.y1) / 2;
      syms.push({ cls: 'clefPerc', conf: 1, x: (a.x + b.x) / 2, y, x0: Math.round(a.x - a.width / 2), x1: Math.round(b.x + b.width / 2), y0: a.y0, y1: a.y1, staff: si, pos: staffPos(s, y, a.x) });
      break;
    }
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
  heads.filter(hd => !hd.stem && !hd.filled && !hd.byStem && comps[hd.comp]).forEach(hd => {
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
  // in close writing a rest or a dot can touch a note's stem or head and so be part of its ink: with the
  // stems and heads taken out of that ink, a piece the size of a rest is tried as one, and a small round one
  // as a dot (a flag left on its stem's free end is neither)
  const byComp = new Map();
  notes.forEach(n => { const id = n.stem && n.stem.comp; if (id) { if (!byComp.has(id)) byComp.set(id, []); byComp.get(id).push(n); } });
  byComp.forEach((ns, id) => {
    const c = comps[id];
    if (!c) return;
    const bw = c.x1 - c.x0 + 1, bh = c.y1 - c.y0 + 1;
    if (bw > sp * 40 || bh > sp * 12) return;
    const m = new Uint8Array(bw * bh);
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) if (labels[(y + c.y0) * w + x + c.x0] === id) m[y * bw + x] = 1;
    const clear = (x0, x1, y0, y1) => {
      for (let y = Math.max(0, Math.round(y0 - c.y0)); y <= Math.min(bh - 1, Math.round(y1 - c.y0)); y++)
        for (let x = Math.max(0, Math.round(x0 - c.x0)); x <= Math.min(bw - 1, Math.round(x1 - c.x0)); x++) m[y * bw + x] = 0;
    };
    const mine = stems.filter(st => st.comp === id);
    mine.forEach(st => clear(st.x - st.width / 2 - 1, st.x + st.width / 2 + 1, st.y0, st.y1));
    ns.forEach(n => n.heads.forEach(hd => clear(hd.x - sp * 0.6, hd.x + sp * 0.6, hd.y - sp * 0.55, hd.y + sp * 0.55)));
    const loc = components({ w: bw, h: bh, d: m });
    loc.comps.forEach(p => {
      if (!p) return;
      const pw = (p.x1 - p.x0 + 1) / sp, ph = (p.y1 - p.y0 + 1) / sp, gx = p.cx + c.x0, gy = p.cy + c.y0;
      const at = onStaff(gx, gy, 2);
      if (!at) return;
      // (round, and in a space as dots are: what is left of a ledger line by a head is flat, on a line)
      if (pw >= 0.2 && ph >= 0.2 && pw <= 0.6 && ph <= 0.6 && pw / ph > 0.6 && pw / ph < 1.6 && Math.abs(Math.abs(at.pos % 2) - 1) < 0.35 &&
        p.area >= (p.x1 - p.x0 + 1) * (p.y1 - p.y0 + 1) * 0.5) {
        if (!dots.some(o => Math.abs(o.x - gx) < sp * 0.3 && Math.abs(o.y - gy) < sp * 0.3)) dots.push({ x: gx, y: gy, ...at, carved: true });
        return;
      }
      if (pw < 0.6 || pw > 1.8 || ph < 1.2 || ph > 3.5) return;
      if (mine.some(st => st.heads.length && Math.abs(p.x0 + c.x0 - st.x) < sp * 0.6 && (st.up ? Math.abs(p.y0 + c.y0 - st.y0) < sp * 0.8 : Math.abs(p.y1 + c.y0 - st.y1) < sp * 0.8))) return;
      const r = classify(features(loc.labels, bw, p, sp));
      if (!r || !/^rest(8|16|32)$/.test(r.cls)) return;
      syms.push({ cls: r.cls, conf: r.conf, x: gx, y: gy, x0: p.x0 + c.x0, x1: p.x1 + c.x0, y0: p.y0 + c.y0, y1: p.y1 + c.y0, id, carved: true, ...at });
    });
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

  // an accidental between two staves goes with the note it stands before (a low note's sharp is often
  // nearer the staff below)
  const ACC = /^(sharp|flat|natural|dsharp|dflat)$/;
  syms.forEach(y => {
    if (!ACC.test(y.cls)) return;
    const yc = y.cls === 'flat' || y.cls === 'dflat' ? y.y1 - sp * 0.55 : (y.y0 + y.y1) / 2;
    const near = hd => hd.stem && hd.x - y.x1 > -sp * 0.3 && hd.x - y.x1 < sp * 3.2 && Math.abs(hd.y - yc) < sp * 0.7;
    if (heads.some(hd => hd.staff === y.staff && near(hd))) return;
    const hd = heads.find(near);
    if (hd) { y.staff = hd.staff; y.pos = staffPos(staves[hd.staff], yc, y.x); }
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

/* The longest upright run of a piece's ink, in pixels */
function longestRun(labels, w, c) {
  let best = 0;
  for (let x = c.x0; x <= c.x1; x++) {
    let run = 0;
    for (let y = c.y0; y <= c.y1; y++) { if (labels[y * w + x] === c.id) { if (++run > best) best = run; } else run = 0; }
  }
  return best;
}
/* Whether a piece has ink in the rows from y0 to y1 */
function inkIn(labels, w, c, y0, y1) {
  for (let y = Math.max(c.y0, Math.ceil(y0)); y <= Math.min(c.y1, Math.floor(y1)); y++) for (let x = c.x0; x <= c.x1; x++) if (labels[y * w + x] === c.id) return true;
  return false;
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
    // a digit stacked over another in the staff: only a digit (a font unlike the examples may look more like
    // something else), so the nearest digit, if it is near enough
    const read = (from, to) => {
      let a = y1, b = y0;
      for (let xx = c.x0 + from; xx < c.x0 + to; xx++) for (let y = y0; y <= y1; y++) if (labels[y * w + xx] === c.id) { if (y < a) a = y; if (y > b) b = y; }
      const box = { x0: c.x0 + from, x1: c.x0 + to - 1, y0: a, y1: b, id: c.id };
      const f = features(labels, w, box, sp, c.id);
      let r = classify(f);
      if (!r || !/^t\d$/.test(r.cls)) r = classify(f, DIGITS);
      if (!r || !/^t\d$/.test(r.cls) || r.d > 0.4) return null;
      return Object.assign({ cls: r.cls, conf: r.conf, x: (box.x0 + box.x1) / 2, y: (a + b) / 2 }, box);
    };
    const tall = (from, to) => {
      let a = y1, b = y0;
      for (let xx = c.x0 + from; xx < c.x0 + to; xx++) for (let y = y0; y <= y1; y++) if (labels[y * w + xx] === c.id) { if (y < a) a = y; if (y > b) b = y; }
      return (to - from) / sp > 0.4 && (b - a) / sp > 1.2;
    };
    let x = 0;
    const half = [];
    while (x < cols.length) {
      if (cols[x] <= 1) { x++; continue; }
      let e = x; while (e < cols.length && cols[e] > 1) e++;
      if (tall(x, e)) {
        let d = read(x, e);
        // two digits that touch ("13" whose 1 has a foot): cut at the thinnest column in the middle
        if (!d && (e - x) / sp > 1.2) {
          let cut = -1;
          for (let k = x + Math.round((e - x) * 0.25); k < x + Math.round((e - x) * 0.75); k++) if (cut < 0 || cols[k] < cols[cut]) cut = k;
          const l = cut > x && tall(x, cut) ? read(x, cut) : null, r = l && tall(cut, e) ? read(cut, e) : null;
          if (l && r) { half.push(l); d = r; }
        }
        if (!d) return null;
        half.push(d);
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
    // beams and flags hang from the free end one under another: a run further along (a thick ledger line
    // crossing the stem of a low note) is not one
    let n = 0, inRun = false, runLen = 0, lastEnd = 0, open = true;
    // a thin run that carries on well past where a flag ends is a tie or slur touching the flag
    const tieAt = (k, len) => {
      if (len >= sp * 0.3) return false;
      const ym = Math.round(startY + dir * (k - len / 2)), reach = st.x + sp * 1.5;
      for (let y = Math.max(0, Math.round(ym - sp * 0.4)); y <= Math.min(h - 1, Math.round(ym + sp * 0.4)); y++) {
        // the run of ink along this row that passes the column (or starts just past it)
        let a = -1;
        for (let xx = x - 3; xx <= x + 3; xx++) if (xx >= 0 && xx < w && d[y * w + xx]) { a = xx; break; }
        if (a < 0) continue;
        let xx = a;
        while (xx < w && xx < reach && d[y * w + xx]) xx++;
        if (xx >= reach) return true;
      }
      return false;
    };
    const close = k => {
      if (runLen >= sp * 0.12 && runLen <= sp * 1.4 && open && !tieAt(k, runLen)) {
        if (k - runLen - lastEnd <= sp * (n ? 0.9 : 1.6)) { n++; lastEnd = k; } else open = false;
      }
    };
    for (let k = 0; k <= span; k++) {
      const y = Math.round(startY + dir * k);
      if (y < 0 || y >= h) continue;
      const ink = d[y * w + x] && labels[y * w + x] === st.comp;
      if (ink) { if (!inRun) { inRun = true; runLen = 0; } runLen++; }
      else if (inRun) { inRun = false; close(k); }
    }
    if (inRun) close(span + 1);
    if (n > best && n <= 4) best = n;
  }
  return Math.min(best, 4);
}

/* No ink in a thin ring around a piece's box (a few stray pixels allowed) */
/* A wide blob as heads side by side: the columns between its narrow waists, each a head about a space tall
   (the middle of its own rows); null when it doesn't split that way */
function sideBySide(labels, w, c, sp) {
  const cols = [];
  for (let x = c.x0; x <= c.x1; x++) { let n = 0; for (let y = c.y0; y <= c.y1; y++) if (labels[y * w + x] === c.id) n++; cols.push(n); }
  const max = Math.max(...cols), runs = [];
  let start = -1;
  cols.forEach((n, i) => {
    if (n >= max * 0.5) { if (start < 0) start = i; } else if (start >= 0) { runs.push([start, i - 1]); start = -1; }
  });
  if (start >= 0) runs.push([start, cols.length - 1]);
  if (runs.length !== 2) return null;
  const out = [];
  for (const [a, b] of runs) {
    if ((b - a + 1) / sp < 0.5 || (b - a + 1) / sp > 1.6) return null;
    let y0 = Infinity, y1 = -Infinity, sy = 0, n = 0;
    for (let x = c.x0 + a; x <= c.x0 + b; x++) for (let y = c.y0; y <= c.y1; y++) if (labels[y * w + x] === c.id) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); sy += y; n++; }
    if ((y1 - y0 + 1) / sp > 1.1) return null;
    out.push({ x: c.x0 + (a + b) / 2, y: sy / n });
  }
  return out;
}

/* The rows of a tall blob between its narrow waists: the middle row of each wide stretch, or null with no waist */
function waists(labels, w, c) {
  const rows = [];
  for (let y = c.y0; y <= c.y1; y++) { let n = 0; for (let x = c.x0; x <= c.x1; x++) if (labels[y * w + x] === c.id) n++; rows.push(n); }
  const max = Math.max(...rows), runs = [];
  let start = -1;
  rows.forEach((n, i) => {
    if (n >= max * 0.55) { if (start < 0) start = i; } else if (start >= 0) { runs.push([start, i - 1]); start = -1; }
  });
  if (start >= 0) runs.push([start, rows.length - 1]);
  if (runs.length < 2) return null;
  // a waist is a real dip between two wide stretches
  for (let k = 1; k < runs.length; k++) if (Math.min(...rows.slice(runs[k - 1][1] + 1, runs[k][0])) > max * 0.45) return null;
  return runs.map(([a, b]) => c.y0 + (a + b) / 2);
}

/* A hollow head centred at (x, y), in the ink with the lines in: paper in its middle (the line through it left
   out when it sits on one), ink all round it within about two thirds of a space, and the ring thick at both
   sides (paper between a stem and a rest is boxed in by thin strokes) */
function hollowAt(bin, x, y, sp, onLine, lt) {
  const { w, h, d } = bin;
  const ink = (px, py) => { px = Math.round(px); py = Math.round(py); return px >= 0 && py >= 0 && px < w && py < h && d[py * w + px] > 0; };
  // the hole leans up to the right, as the head does
  const skip = onLine ? lt / 2 + 1.5 : -1, ax = sp * 0.3, c = Math.cos(0.45), s = Math.sin(0.45);
  // (on a line, rows to look at above and below it however thick the line came out)
  const ay = Math.max(sp * 0.13, skip + 1);
  let n = 0, paper = 0;
  for (let v = -ay; v <= ay; v += 1) for (let u = -ax; u <= ax; u += 1) {
    if ((u / ax) ** 2 + (v / ay) ** 2 > 1) continue;
    const dx = u * c + v * s, dy = -u * s + v * c;
    if (Math.abs(dy) <= skip) continue;
    n++; if (!ink(x + dx, y + dy)) paper++;
  }
  if (n < 4 || paper < n * 0.8) return false;
  const K = 32;
  let hit = 0;
  for (let k = 0; k < K; k++) {
    const a = k / K * 2 * Math.PI, cx = Math.cos(a), cy = Math.sin(a);
    for (let r = 0.2; r <= 0.75; r += 0.04) if (ink(x + cx * r * sp, y + cy * r * sp * 0.8)) { hit++; break; }
  }
  if (hit < K * 0.94) return 0;
  // the ring's sides, a little above and below the middle (clear of a line through it)
  const side = dir => {
    let best = 0;
    for (const dy of [-0.25, -0.15, 0.15, 0.25]) {
      const yy = y + dy * sp;
      let r = 0;
      while (r < sp * 0.75 && !ink(x + dir * r, yy)) r++;
      let run = 0;
      while (run < sp && ink(x + dir * (r + run), yy)) run++;
      best = Math.max(best, run);
    }
    return best;
  };
  if (side(1) < sp * 0.22 || side(-1) < sp * 0.22) return 0;
  return paper / n + hit / K;
}

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
