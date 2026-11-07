/* World Woodshed — reading from the printed page in Sight-reading's full screen (Your scores): the PDF or the
   photos a score was read from, shown as they are (one page, or two side by side as an open book when the
   screen is wide), with the cursor and the mic check's marks drawn over the printed notes and the page
   turned as you reach its last bar. Where each bar sits comes from src/pagelayout.js. Its own chunk (pdf.js),
   loaded the first time it is shown. */
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.min.mjs';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { h } from './core.js';
import { spots, lastBars, spreadOf, zoomOf, clampZoom, stepZoom, followTop, followLeft, rowEnds } from '../pagelayout.js';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const MAX_PX = 8e6; // the most pixels one page's canvas may have
const free = c => { if (c && c.tagName === 'CANVAS') { c.width = 0; c.height = 0; } };

/* The pages of a PDF (blob) or of photos (blobs, in page order): { count, size(i) → [w, h], unit (CSS px per unit of
   size at 100%), draw(i, cssH) → canvas } */
export async function openSource(src) {
  if (src.pdf) {
    const task = pdfjs.getDocument({ data: new Uint8Array(await src.pdf.arrayBuffer()), isEvalSupported: false });
    const doc = await task.promise;
    const sizes = [];
    for (let i = 1; i <= doc.numPages; i++) { const p = await doc.getPage(i); const v = p.getViewport({ scale: 1 }); sizes.push([v.width, v.height]); }
    return {
      count: doc.numPages, size: i => sizes[i], unit: 96 / 72, // points, at 96 CSS px to the inch
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
    unit: bmps.length ? 794 / bmps[0].width : 1, // a photo has no printed size: as wide as A4 at 96 to the inch
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
   noteEls, mark, clearMarks, cursor, posOf), turn(±1), label(), onTurn, destroy() }, zoomed as a word processor
   is (opts.zoom, saved through opts.onZoom; see zoomOf in src/pagelayout.js): zoomIn(), zoomOut(), setZoom(z),
   zoomText(), and a pinch on a touch screen or Ctrl + the wheel (a trackpad's pinch). While the whole page is
   in view it is turned as a page turner would; zoomed in past that, the pages lie one under the other and
   scroll along with the line being read. */
export function PageView(source, layout, opts = {}) {
  const pages = Math.min(source.count, Math.max(1, layout.pages || source.count));
  const last = lastBars(layout);
  const el = h('div', { class: 'sr-pages', role: 'img' }); // the scroller
  const inner = h('div', { class: 'sr-pinner' });           // the pages, scaled while a pinch is under way
  el.append(inner);
  // one slot per page, kept: its canvas once drawn, and an overlay for the cursor and the marks
  const slots = [];
  for (let i = 0; i < pages; i++) {
    const over = h('div', { class: 'sr-pover' });
    slots.push({ el: h('div', { class: 'sr-page', 'data-page': i + 1 }, over), over, canvas: null, at: 0, job: 0 });
  }
  const cur = h('div', { class: 'sr-pcur', hidden: true });
  let two = false, column = false, shown = [], pageH = 0, spotsNow = [], rowEnd = [], notes = [], ahead = null, gone = false;
  let W = 0, H = 0, zoom = zoomOf(opts.zoom), inView = 0, userAt = -1e9, quietTill = 0;
  const api = { el, onTurn: null };
  const [pw0, ph0] = source.size(0) || [595, 842];
  const realH = ph0 * (source.unit || 1);
  const now = () => performance.now();

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
  function drop(s) { s.job++; free(s.canvas); if (s.canvas) s.canvas.remove(); s.canvas = null; s.at = 0; }
  function show(p) {
    p = Math.max(0, Math.min(pages - 1, p));
    const want = spreadOf(p, two, pages);
    if (want.join() !== shown.join()) {
      shown = want;
      inView = shown[0];
      inner.innerHTML = '';
      shown.forEach(i => { inner.append(slots[i].el); paint(i); });
      // the next pages drawn ahead, so a page turn shows at once
      spreadOf(Math.min(pages - 1, shown[shown.length - 1] + 1), two, pages).forEach(paint);
      el.setAttribute('aria-label', label());
      if (api.onTurn) api.onTurn();
    }
  }
  function label() {
    if (column) return 'Page ' + (inView + 1) + ' of ' + pages;
    return shown.length ? 'Page ' + (shown[0] + 1) + (shown.length > 1 ? '–' + (shown[1] + 1) : '') + ' of ' + pages : '';
  }
  // where a page is in the scroller's own px (as scrollTop counts), and how big it is drawn
  const boxOf = p => {
    const r = slots[p].el.getBoundingClientRect(), e = el.getBoundingClientRect();
    return { top: r.top - e.top + el.scrollTop, left: r.left - e.left + el.scrollLeft, w: r.width, h: r.height };
  };
  // the pages one under the other: draw those on screen and next to it, let go of those far away
  let nearT = 0;
  function near() {
    nearT = 0;
    if (!column || gone) return;
    const top = el.scrollTop, hh = el.clientHeight;
    let best = inView, bv = -1;
    slots.forEach((s, i) => {
      const b = boxOf(i), seen = Math.min(b.top + b.h, top + hh) - Math.max(b.top, top);
      if (seen > bv) { bv = seen; best = i; }
      if (b.top + b.h > top - hh && b.top < top + hh * 2) paint(i);
      else if (b.top + b.h < top - hh * 3 || b.top > top + hh * 4) drop(s);
    });
    if (best !== inView) { inView = best; el.setAttribute('aria-label', label()); if (api.onTurn) api.onTurn(); }
  }
  el.addEventListener('scroll', () => { if (column && !nearT) nearT = requestAnimationFrame(near); }, { passive: true });

  /* the pages laid out for the screen (W × H) at the zoom chosen */
  function layoutPages() {
    if (!W || !H) return;
    const [pw, ph] = [pw0, ph0];
    const fitH = Math.max(120, H - 12);
    const bar = matchMedia('(pointer: coarse)').matches ? 0 : 18; // room for a scroll bar where it takes some
    let hh, ww;
    two = false;
    if (zoom === 'page') {
      // as large as the screen allows: the page's full height, two pages when they fit side by side
      hh = fitH; ww = hh * pw / ph;
      two = pages > 1 && W >= ww * 2 + 28;
      if (!two && ww > W - 12) { ww = W - 12; hh = ww * ph / pw; }
    } else if (zoom === 'width') {
      ww = W - 12; hh = ww * ph / pw;
      if (hh > fitH) { ww = W - 12 - bar; hh = ww * ph / pw; }
    } else {
      hh = zoom * realH; ww = hh * pw / ph;
      two = pages > 1 && hh <= fitH && W >= ww * 2 + 28;
    }
    hh = Math.max(60, Math.floor(hh));
    const changed = hh !== pageH;
    pageH = hh;
    const was = column ? inView : shown.length ? shown[0] : 0;
    column = hh > fitH + 1 || hh * pw / ph > W - 12 + 1;
    el.classList.toggle('sr-column', column);
    slots.forEach((s, i) => { const [a, b] = source.size(i) || [pw, ph]; s.el.style.height = hh + 'px'; s.el.style.width = Math.floor(hh * a / b) + 'px'; if (changed) s.at = 0; });
    shown = [];
    if (column) {
      inner.innerHTML = '';
      slots.forEach(s => inner.append(s.el));
      shown = slots.map((s, i) => i);
      inView = Math.max(0, Math.min(pages - 1, was));
      el.setAttribute('aria-label', label());
      near();
      if (api.onTurn) api.onTurn();
    } else {
      el.scrollTop = el.scrollLeft = 0;
      show(was);
    }
  }
  api.fit = (w, hh) => {
    W = w; H = hh;
    const p = column ? inView : shown.length ? shown[0] : 0;
    layoutPages();
    if (column) scrollToPage(p, false);
  };
  function scrollToPage(p, smooth = true) {
    p = Math.max(0, Math.min(pages - 1, p));
    el.scrollTo({ top: Math.max(0, boxOf(p).top - 6), behavior: smooth ? 'smooth' : 'auto' });
    if (!smooth) near();
  }
  api.turn = d => {
    if (column) return scrollToPage(inView + d);
    show((shown.length ? shown[0] : 0) + d * (two ? 2 : 1));
  };
  api.canTurn = d => (column ? (d < 0 ? inView > 0 : inView < pages - 1)
    : d < 0 ? shown.length && shown[0] > 0 : shown.length && shown[shown.length - 1] < pages - 1);
  api.label = label;

  /* zoom: the size shown now (1 = printed size), the setting, and a change that keeps the point at (cx, cy)
     on the screen (the middle of the view unless given) where it was */
  const size = () => (pageH && realH ? pageH / realH : 1);
  api.zoom = () => zoom;
  api.zoomText = () => Math.round(size() * 100) + '%';
  api.setZoom = (z, cx, cy) => {
    z = zoomOf(z);
    const e = el.getBoundingClientRect();
    if (cx == null) { cx = e.left + e.width / 2; cy = e.top + Math.min(e.height / 2, 120); }
    // the page and the place on it under that point
    let anchor = null;
    for (const p of shown) {
      const r = slots[p].el.getBoundingClientRect();
      if (cy >= r.top - 8 && cy <= r.bottom + 8 && (!anchor || (cx >= r.left && cx <= r.right))) anchor = { p, fx: Math.max(0, Math.min(1, (cx - r.left) / r.width)), fy: Math.max(0, Math.min(1, (cy - r.top) / r.height)) };
    }
    zoom = z;
    layoutPages();
    if (anchor && column) {
      const r = slots[anchor.p].el.getBoundingClientRect();
      el.scrollTop += r.top + anchor.fy * r.height - cy;
      el.scrollLeft += r.left + anchor.fx * r.width - cx;
      near();
    } else if (anchor && !shown.includes(anchor.p)) show(anchor.p);
    if (opts.onZoom) opts.onZoom(zoom);
  };
  api.zoomIn = () => api.setZoom(stepZoom(size(), 1));
  api.zoomOut = () => api.setZoom(stepZoom(size(), -1));

  // a pinch (two fingers) or Ctrl + the wheel: the pages scaled as they are while it lasts, drawn again at the end
  let pinch = null, wheel = null;
  const preview = (f, ox, oy) => {
    const r = inner.getBoundingClientRect();
    if (ox != null) inner.style.transformOrigin = (ox - r.left) + 'px ' + (oy - r.top) + 'px';
    inner.style.transform = f === 1 ? '' : 'scale(' + f + ')';
  };
  const limit = f => clampZoom(size() * f) / size();
  const spread2 = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY) || 1;
  el.addEventListener('touchstart', e => {
    if (e.touches.length !== 2) return;
    const t = e.touches;
    pinch = { d0: spread2(t), cx: (t[0].clientX + t[1].clientX) / 2, cy: (t[0].clientY + t[1].clientY) / 2, f: 1 };
    preview(1, pinch.cx, pinch.cy);
    e.preventDefault();
  }, { passive: false });
  el.addEventListener('touchmove', e => {
    userAt = now();
    if (!pinch || e.touches.length !== 2) return;
    e.preventDefault();
    pinch.f = limit(spread2(e.touches) / pinch.d0);
    preview(pinch.f);
  }, { passive: false });
  const endPinch = () => {
    if (!pinch) return;
    const p = pinch; pinch = null;
    preview(1);
    quietTill = now() + 450; // the fingers leaving are not a tap on a bar
    if (Math.abs(p.f - 1) > 0.03) api.setZoom(size() * p.f, p.cx, p.cy);
  };
  el.addEventListener('touchend', e => { if (e.touches.length < 2) endPinch(); });
  el.addEventListener('touchcancel', endPinch);
  el.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) { userAt = now(); return; }
    e.preventDefault();
    if (!wheel) { wheel = { f: 1, cx: e.clientX, cy: e.clientY, t: 0 }; preview(1, e.clientX, e.clientY); }
    const d = Math.max(-60, Math.min(60, e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY));
    wheel.f = limit(wheel.f * Math.exp(-d * 0.006));
    preview(wheel.f);
    clearTimeout(wheel.t);
    wheel.t = setTimeout(() => { const w = wheel; wheel = null; preview(1); if (Math.abs(w.f - 1) > 0.01) api.setZoom(size() * w.f, w.cx, w.cy); }, 180);
  }, { passive: false });
  el.addEventListener('click', e => { if (now() < quietTill) { e.stopPropagation(); e.preventDefault(); } }, true);

  /* the pages scrolled so the note being read (spot index i) and, near the end of its line, the next line show */
  const band = sp => {
    const b = boxOf(sp.p), g = sp.y1 - sp.y0;
    return { top: b.top + (sp.y0 - g * 2.2) * b.h, bottom: b.top + (sp.y1 + g * 2.2) * b.h };
  };
  function reveal(i, smooth) {
    const sp = spotsNow[i];
    if (!column || !sp || pinch || wheel) return;
    if (smooth && now() - userAt < 2000) return; // they are looking about the page themselves
    let next = null;
    const j = rowEnd[i];
    if (j != null) { const L = layout.bars[sp.b]; if (L && sp.x >= (L.x0 + L.x1) / 2) next = band(spotsNow[j]); }
    const top = followTop({ top: el.scrollTop, height: el.clientHeight }, band(sp), next);
    const left = el.scrollWidth > el.clientWidth + 2 ? followLeft({ left: el.scrollLeft, width: el.clientWidth }, boxOf(sp.p).left + sp.x * boxOf(sp.p).w) : null;
    if (top == null && left == null) return;
    el.scrollTo({ top: top == null ? el.scrollTop : top, left: left == null ? el.scrollLeft : left, behavior: smooth ? 'smooth' : 'auto' });
  }

  api.forPiece = (piece, row, name) => {
    notes.forEach(n => n && n.remove());
    spotsNow = spots(piece, layout, row);
    rowEnd = rowEnds(spotsNow); // for each note in the last bar of a printed line: the next line's first
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
    const first = spotsNow.findIndex(Boolean);
    if (first >= 0) { if (column) reveal(first, false); else show(spotsNow[first].p); }
    const staff = {
      el, noteEls: notes, line: false, width: 0, height: 0, systems: 0,
      posOf: () => null, systemBox: () => null, xOf: () => null,
      mark(i, cls) { const e = notes[i]; if (!e) return; e.classList.remove('now', 'good', 'bad', 'near'); if (cls) cls.split(' ').forEach(c => e.classList.add(c)); },
      clearMarks() { notes.forEach(e => e && e.classList.remove('now', 'good', 'bad', 'near')); },
      bar() {},
      /* the piece's bar under a tap on a page shown, or null: the printed bar whose box (across the row read) holds it */
      barAt(cx, cy) {
        for (const p of shown) {
          const r = slots[p].el.getBoundingClientRect();
          if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) continue;
          const fx = (cx - r.left) / r.width, fy = (cy - r.top) / r.height;
          let best = null, bd = Infinity;
          spotsNow.forEach(sp => {
            if (!sp || sp.p !== p || sp.bi == null) return;
            const L = layout.bars[sp.b];
            if (!L || fx < L.x0 || fx > L.x1) return;
            const gap = sp.y1 - sp.y0, d = Math.max(0, sp.y0 - gap * 1.5 - fy, fy - sp.y1 - gap * 1.5);
            if (d < bd) { bd = d; best = sp; }
          });
          return best && bd < 0.03 ? best.bi : null;
        }
        return null;
      },
      /* the note being played (whether or not the cursor shows it): turns the page, or scrolls the pages */
      follow(i) {
        const sp = i === null || i === undefined ? null : spotsNow[i];
        if (!sp) return;
        if (column) { reveal(i, true); return; }
        if (ahead != null && sp.b !== ahead) ahead = null;
        if (!shown.includes(sp.p)) { if (ahead == null) show(sp.p); }
        else if (sp.p === shown[shown.length - 1] && sp.b === last[sp.p] && sp.p + 1 < pages) {
          // the page turned while the last bar is played, as a page turner would: the next page's first
          // notes are in view before they come
          const L = layout.bars[sp.b];
          if (L && sp.x >= (L.x0 + L.x1) / 2) { ahead = sp.b; show(sp.p + 1); }
        }
      },
      cursor(i) {
        const sp = i === null || i === undefined ? null : spotsNow[i];
        if (!sp) { cur.hidden = true; return; }
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
  api.destroy = () => { gone = true; if (nearT) cancelAnimationFrame(nearT); if (wheel) clearTimeout(wheel.t); slots.forEach(s => { free(s.canvas); s.canvas = null; }); el.remove(); try { source.close(); } catch (e) { /* closed */ } };
  return api;
}
