/* World Woodshed — reading from the printed page in Sight-reading's full screen (Your scores): the PDF or the
   photos a score was read from, shown as they are (one page, or two side by side as an open book when the
   screen is wide), with the cursor and the mic check's marks drawn over the printed notes and the page
   turned as you reach its last bar. Where each bar sits comes from src/pagelayout.js. Its own chunk (pdf.js),
   loaded the first time it is shown. */
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.min.mjs';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { h } from './core.js';
import { spots, lastBars, spreadOf } from '../pagelayout.js';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const MAX_PX = 8e6; // the most pixels one page's canvas may have
const free = c => { if (c && c.tagName === 'CANVAS') { c.width = 0; c.height = 0; } };

/* The pages of a PDF (blob) or of photos (blobs, in page order): { count, size(i) → [w, h], draw(i, cssH) → canvas } */
export async function openSource(src) {
  if (src.pdf) {
    const task = pdfjs.getDocument({ data: new Uint8Array(await src.pdf.arrayBuffer()), isEvalSupported: false });
    const doc = await task.promise;
    const sizes = [];
    for (let i = 1; i <= doc.numPages; i++) { const p = await doc.getPage(i); const v = p.getViewport({ scale: 1 }); sizes.push([v.width, v.height]); }
    return {
      count: doc.numPages, size: i => sizes[i],
      async draw(i, cssH) {
        const page = await doc.getPage(i + 1), [w, hh] = sizes[i], scale = cssH / hh;
        const dpr = Math.min(window.devicePixelRatio || 1, 3, Math.sqrt(MAX_PX / (w * hh * scale * scale)));
        const v = page.getViewport({ scale: scale * dpr });
        const c = h('canvas', { width: Math.floor(v.width), height: Math.floor(v.height) });
        await page.render({ canvasContext: c.getContext('2d'), viewport: v, canvas: c }).promise;
        return c;
      },
      close() { task.destroy(); }
    };
  }
  // photos: turned upright from their EXIF orientation, as the reader saw them
  const bmps = [];
  for (const b of src.photos || []) bmps.push(await createImageBitmap(b, { imageOrientation: 'from-image' }));
  return {
    count: bmps.length, size: i => [bmps[i].width, bmps[i].height],
    async draw(i, cssH) {
      const bm = bmps[i], dpr = Math.min(window.devicePixelRatio || 1, 2);
      const f = Math.min(1, cssH * dpr / bm.height, Math.sqrt(MAX_PX / (bm.width * bm.height)));
      const c = h('canvas', { width: Math.round(bm.width * f), height: Math.round(bm.height * f) });
      c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height);
      return c;
    },
    close() { bmps.forEach(b => b.close()); }
  };
}

/* The page view: { el, fit(w, h), forPiece(piece, row, label) → a staff for Sight-reading (as renderStaff's:
   noteEls, mark, clearMarks, cursor, posOf), turn(±1), label(), onTurn, destroy() } */
export function PageView(source, layout) {
  const pages = Math.min(source.count, Math.max(1, layout.pages || source.count));
  const last = lastBars(layout);
  const el = h('div', { class: 'sr-pages', role: 'img' });
  // one slot per page, kept: its canvas once drawn, and an overlay for the cursor and the marks
  const slots = [];
  for (let i = 0; i < pages; i++) {
    const over = h('div', { class: 'sr-pover' });
    slots.push({ el: h('div', { class: 'sr-page', 'data-page': i + 1 }, over), over, canvas: null, at: 0, job: 0 });
  }
  const cur = h('div', { class: 'sr-pcur', hidden: true });
  let two = false, shown = [], pageH = 0, spotsNow = [], notes = [], ahead = null, gone = false;
  const api = { el, onTurn: null };

  async function paint(i) {
    const s = slots[i];
    if (!s || !pageH || s.at === pageH) return;
    const my = ++s.job;
    let c;
    try { c = await source.draw(i, pageH); } catch (e) { console.error(e); return; }
    if (gone || my !== s.job) { free(c); return; }
    free(s.canvas); if (s.canvas) s.canvas.remove();
    s.canvas = c; s.at = pageH;
    s.el.insertBefore(c, s.over);
  }
  function show(p) {
    p = Math.max(0, Math.min(pages - 1, p));
    const want = spreadOf(p, two, pages);
    if (want.join() !== shown.join()) {
      shown = want;
      el.innerHTML = '';
      shown.forEach(i => { el.append(slots[i].el); paint(i); });
      // the next pages drawn ahead, so a page turn shows at once
      spreadOf(Math.min(pages - 1, shown[shown.length - 1] + 1), two, pages).forEach(paint);
      el.setAttribute('aria-label', label());
      if (api.onTurn) api.onTurn();
    }
  }
  function label() { return shown.length ? 'Page ' + (shown[0] + 1) + (shown.length > 1 ? '–' + (shown[1] + 1) : '') + ' of ' + pages : ''; }
  /* as large as the screen allows: the page's full height, two pages when they fit side by side */
  api.fit = (W, H) => {
    const [pw, ph] = source.size(0) || [595, 842];
    let hh = Math.max(120, H - 12), ww = hh * pw / ph;
    two = pages > 1 && W >= ww * 2 + 28;
    if (!two && ww > W - 12) { ww = W - 12; hh = ww * ph / pw; }
    hh = Math.floor(hh);
    const changed = hh !== pageH;
    pageH = hh;
    slots.forEach((s, i) => { const [a, b] = source.size(i) || [pw, ph]; s.el.style.height = hh + 'px'; s.el.style.width = Math.floor(hh * a / b) + 'px'; if (changed) s.at = 0; });
    const p = shown.length ? shown[0] : 0;
    shown = [];
    show(p);
  };
  api.turn = d => show((shown.length ? shown[0] : 0) + d * (two ? 2 : 1));
  api.canTurn = d => (d < 0 ? shown.length && shown[0] > 0 : shown.length && shown[shown.length - 1] < pages - 1);
  api.label = label;
  api.forPiece = (piece, row, name) => {
    notes.forEach(n => n && n.remove());
    spotsNow = spots(piece, layout, row);
    notes = spotsNow.map(sp => {
      if (!sp || !slots[sp.p]) return null;
      const n = h('div', { class: 'sr-pnote' });
      const gap = sp.y1 - sp.y0;
      Object.assign(n.style, { left: (sp.x * 100) + '%', top: ((sp.y1 + gap * 0.35) * 100) + '%' });
      slots[sp.p].over.append(n);
      return n;
    });
    ahead = null;
    if (name) el.setAttribute('aria-label', name + ', ' + label());
    const first = spotsNow.find(Boolean);
    if (first) show(first.p);
    const staff = {
      el, noteEls: notes, line: false, width: 0, height: 0, systems: 0,
      posOf: () => null, systemBox: () => null, xOf: () => null,
      mark(i, cls) { const e = notes[i]; if (!e) return; e.classList.remove('now', 'good', 'bad', 'near'); if (cls) cls.split(' ').forEach(c => e.classList.add(c)); },
      clearMarks() { notes.forEach(e => e && e.classList.remove('now', 'good', 'bad', 'near')); },
      bar() {},
      cursor(i) {
        const sp = i === null || i === undefined ? null : spotsNow[i];
        if (!sp) { cur.hidden = true; return; }
        if (ahead != null && sp.b !== ahead) ahead = null;
        if (!shown.includes(sp.p)) { if (ahead == null) show(sp.p); }
        else if (sp.p === shown[shown.length - 1] && sp.b === last[sp.p] && sp.p + 1 < pages) {
          // the page turned while the last bar is played, as a page turner would: the next page's first
          // notes are in view before they come
          const L = layout.bars[sp.b];
          if (L && sp.x >= (L.x0 + L.x1) / 2) { ahead = sp.b; show(sp.p + 1); }
        }
        const s = slots[sp.p];
        if (cur.parentNode !== s.over) { cur.style.transition = 'none'; s.over.append(cur); void cur.offsetWidth; }
        else cur.style.transition = '';
        const gap = sp.y1 - sp.y0;
        Object.assign(cur.style, { left: (sp.x * 100) + '%', top: ((sp.y0 - gap * 0.7) * 100) + '%', height: (gap * 2.4 * 100) + '%' });
        cur.hidden = false;
      }
    };
    return staff;
  };
  api.destroy = () => { gone = true; slots.forEach(s => { free(s.canvas); s.canvas = null; }); el.remove(); try { source.close(); } catch (e) { /* closed */ } };
  return api;
}
