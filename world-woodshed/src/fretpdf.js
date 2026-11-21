/* A full-size (1:1) fret template as a PDF, written by hand so it needs no library (test/xen.test.js):
   the fingerboard from the nut drawn as a strip with a line at every fret, cut into landscape pages that
   overlap by OVERLAP mm, each with a 100 mm bar to check the print scale, then a page with the table.
   Lengths in mm; the PDF itself is in points. Built-in Helvetica, so text is kept to plain ASCII. */

const PT = 72 / 25.4;
export const PAPERS = { a4: [297, 210], letter: [279.4, 215.9] };
export const OVERLAP = 12;
const MARGIN = 10;

const ascii = t => String(t).replace(/¢/g, 'c').replace(/♭/g, 'b').replace(/♯/g, '#').replace(/[−–—]/g, '-').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[^\x20-\x7e]/g, '?');
const esc = t => ascii(t).replace(/[\\()]/g, m => '\\' + m);
const n = v => (Math.round(v * 100) / 100).toString();

function Page() {
  const ops = [];
  const p = v => n(v * PT);
  return {
    ops,
    line(x1, y1, x2, y2, w = 0.25, dash = null) { ops.push((dash ? '[' + dash.map(p).join(' ') + '] 0 d ' : '[] 0 d ') + p(w) + ' w ' + p(x1) + ' ' + p(y1) + ' m ' + p(x2) + ' ' + p(y2) + ' l S'); },
    rect(x, y, w, h, lw = 0.3) { ops.push('[] 0 d ' + p(lw) + ' w ' + p(x) + ' ' + p(y) + ' ' + p(w) + ' ' + p(h) + ' re S'); },
    fill(x, y, w, h, grey) { ops.push(n(grey) + ' g ' + p(x) + ' ' + p(y) + ' ' + p(w) + ' ' + p(h) + ' re f 0 g'); },
    text(x, y, t, size = 8, { bold = false, rot = false, align = 'left' } = {}) {
      const s = esc(t), wmm = ascii(t).length * size * 0.5 / PT; // Helvetica averages about half the size per character
      const dx = align === 'center' ? -wmm / 2 : align === 'right' ? -wmm : 0;
      ops.push('BT /' + (bold ? 'F2' : 'F1') + ' ' + size + ' Tf ' + (rot ? '0 1 -1 0 ' + p(x) + ' ' + p(y + dx) : '1 0 0 1 ' + p(x + dx) + ' ' + p(y)) + ' Tm (' + s + ') Tj ET');
    }
  };
}

/* o: { title, lines: [string], unit: 'mm'|'in', paper: 'a4'|'letter', frets: [{ fret, dist, gap, name, cents }]
   (dist and gap in mm), table: [[header…], [row…]…] } → Uint8Array */
export function fretPdf(o) {
  const [pw, ph] = PAPERS[o.paper] || PAPERS.a4;
  const W = pw - 2 * MARGIN, frets = o.frets || [];
  const end = (frets.length ? frets[frets.length - 1].dist : 0) + 5, step = W - OVERLAP; // page i shows [i·step − 8, + W]
  const pages = [];
  const count = Math.max(1, Math.ceil((end + 8 - W) / step - 1e-9) + 1);
  const total = count + 1;
  const fmt = mm => o.unit === 'in' ? (mm / 25.4).toFixed(3) : mm.toFixed(1);
  for (let i = 0; i < count; i++) {
    const pg = Page(), a = i * step - 8, X = mm => MARGIN + (mm - a); // template mm → page mm
    const top = ph - MARGIN;
    pg.text(MARGIN, top - 4, o.title || 'Fret template', 12, { bold: true });
    pg.text(pw - MARGIN, top - 4, 'Page ' + (i + 1) + ' of ' + total, 9, { align: 'right' });
    (o.lines || []).slice(0, 3).forEach((t, j) => pg.text(MARGIN, top - 10 - j * 4.2, t, 8));
    // the strip: a fingerboard 56 mm wide
    const y0 = 70, y1 = y0 + 56, lo = Math.max(a, 0), hi = Math.min(a + W, end);
    if (hi > lo) {
      pg.line(X(lo), y0, X(hi), y0, 0.3); pg.line(X(lo), y1, X(hi), y1, 0.3);
      pg.line(X(lo), (y0 + y1) / 2, X(hi), (y0 + y1) / 2, 0.15, [1, 2]);
    }
    const marks = [{ fret: 0, dist: 0, name: '' }].concat(frets);
    marks.forEach(f => {
      if (f.dist < a - 0.01 || f.dist > a + W + 0.01) return;
      const x = X(f.dist);
      if (f.fret === 0) { pg.fill(x - 1.5, y0, 1.5, y1 - y0, 0.2); pg.text(x - 2.5, y0 + 4, 'NUT  (measure from this edge)', 7, { rot: true }); return; }
      pg.line(x, y0 - 6, x, y1 + 6, 0.25);
      pg.text(x, y1 + 8, String(f.fret), 9, { bold: true, align: 'center' });
      if (f.name) pg.text(x, y1 + 12, f.name, 7, { align: 'center' });
      if (f.std) pg.text(x, y1 + 15.5, f.std, 6, { align: 'center' });
      pg.text(x - 1, y0 - 7, fmt(f.dist), 7, { rot: true, align: 'right' });
    });
    // the overlap with the page before, to cut along and lay over it
    if (i > 0) {
      pg.line(MARGIN, y0 - 20, MARGIN, y1 + 18, 0.3, [2, 1.5]);
      pg.text(MARGIN + 1.5, y1 + 18, 'Cut here and lay over page ' + i + ': the fret lines meet.', 7);
    }
    if (i < count - 1) pg.fill(pw - MARGIN - OVERLAP, y0 - 3, OVERLAP, 2, 0.75);
    // the scale check
    const ry = 30;
    pg.line(MARGIN, ry, MARGIN + 100, ry, 0.35);
    for (let m = 0; m <= 100; m += 1) pg.line(MARGIN + m, ry, MARGIN + m, ry + (m % 10 === 0 ? 4 : m % 5 === 0 ? 2.8 : 1.6), 0.15);
    for (let m = 0; m <= 100; m += 10) pg.text(MARGIN + m, ry + 5.5, String(m), 6, { align: 'center' });
    pg.text(MARGIN, ry - 5, 'Print at 100% (Actual size, no fit to page). This bar must measure exactly 100 mm.', 8);
    pg.text(MARGIN, ry - 9.5, 'Lengths in ' + (o.unit === 'in' ? 'inches' : 'mm') + ', from the nut to the middle of each fret slot. No compensation added.', 8);
    pages.push(pg);
  }
  // the table
  const tp = Page(), top = ph - MARGIN;
  tp.text(MARGIN, top - 4, (o.title || 'Fret template') + ': table', 12, { bold: true });
  tp.text(pw - MARGIN, top - 4, 'Page ' + total + ' of ' + total, 9, { align: 'right' });
  (o.lines || []).forEach((t, j) => tp.text(MARGIN, top - 10 - j * 4.2, t, 8));
  const rows = o.table || [], y0 = top - 12 - (o.lines || []).length * 4.2 - 4;
  const perCol = Math.floor((y0 - MARGIN) / 4.4), cols = [0, 12, 26, 50, 70, 98];
  rows.forEach((r, j) => {
    const col = j === 0 ? 0 : Math.floor((j - 1) / (perCol - 1)), row = j === 0 ? 0 : (j - 1) % (perCol - 1) + 1;
    const draw = (rr, rowI, colI) => rr.forEach((c, k) => tp.text(MARGIN + colI * 135 + cols[k], y0 - rowI * 4.4, c, 8, { bold: rowI === 0 }));
    if (j === 0) draw(r, 0, 0);
    else { if (row === 1 && col > 0) draw(rows[0], 0, col); draw(r, row, col); }
  });
  pages.push(tp);
  return write(pages, pw, ph);
}

function write(pages, pw, ph) {
  const objs = [];
  const add = s => { objs.push(s); return objs.length; };
  const cat = add(''), tree = add(''), f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'), f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  const kids = pages.map(pg => {
    const body = pg.ops.join('\n');
    const c = add('<< /Length ' + body.length + ' >>\nstream\n' + body + '\nendstream');
    return add('<< /Type /Page /Parent ' + tree + ' 0 R /MediaBox [0 0 ' + n(pw * PT) + ' ' + n(ph * PT) + '] /Resources << /Font << /F1 ' + f1 + ' 0 R /F2 ' + f2 + ' 0 R >> >> /Contents ' + c + ' 0 R >>');
  });
  objs[cat - 1] = '<< /Type /Catalog /Pages ' + tree + ' 0 R >>';
  objs[tree - 1] = '<< /Type /Pages /Kids [' + kids.map(k => k + ' 0 R').join(' ') + '] /Count ' + kids.length + ' >>';
  let out = '%PDF-1.4\n';
  const offs = objs.map((o, i) => { const at = out.length; out += (i + 1) + ' 0 obj\n' + o + '\nendobj\n'; return at; });
  const xref = out.length;
  out += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n' + offs.map(x => String(x).padStart(10, '0') + ' 00000 n \n').join('');
  out += 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root ' + cat + ' 0 R >>\nstartxref\n' + xref + '\n%%EOF\n';
  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff;
  return bytes;
}
