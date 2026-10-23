/* World Woodshed — reading a PDF score inside the app (the Library). pdf.js is loaded the first time a PDF is
   opened (its own chunk and worker, precached so it works offline). Pages are drawn as they scroll into view
   and let go when far away, so a long score doesn't hold every page in memory on a phone. */
// the legacy build carries the polyfills (Map.getOrInsertComputed and the like) that Android WebViews lack
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.min.mjs';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { h } from './core.js';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

/* Show `blob` full screen; resolves with a close function once the document has opened (throws if it can't) */
export async function openPdf(blob, title, onClose) {
  const task = pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()), isEvalSupported: false });
  const doc = await task.promise;
  let zoom = 1, at = 0, closed = false;
  const back = document.activeElement;
  const pane = h('div', { class: 'lib-vpane lib-pdf' });
  const count = h('span', { class: 'mono small' });
  const prev = h('button', { class: 'btn small', 'aria-label': 'Previous page', onclick: () => go(at - 1) }, '‹');
  const next = h('button', { class: 'btn small', 'aria-label': 'Next page', onclick: () => go(at + 1) }, '›');
  const zoomBtn = h('button', { class: 'btn small', onclick: () => { zoom = zoom >= 3 ? 1 : zoom + 1; layout(); } });
  const closeBtn = h('button', { class: 'btn small', 'aria-label': 'Close', onclick: () => close() }, '✕');
  const box = h('div', { class: 'lib-viewer', role: 'dialog', 'aria-modal': 'true', 'aria-label': title || 'Score' },
    h('div', { class: 'lib-vbar' }, closeBtn, prev, count, next, zoomBtn), pane);
  if (doc.numPages === 1) [prev, next].forEach(el => { el.hidden = true; });

  // one slot per page, sized from the page's shape before it is drawn
  const sizes = [];
  for (let i = 1; i <= doc.numPages; i++) { const p = await doc.getPage(i); const v = p.getViewport({ scale: 1 }); sizes.push([v.width, v.height]); }
  const slots = sizes.map((_, i) => h('div', { class: 'lib-pdfpage', 'data-page': i + 1, 'aria-label': 'Page ' + (i + 1) }));
  pane.append(...slots);
  const drawn = new Map(); // slot index → render task
  async function draw(i) {
    if (drawn.has(i) || closed) return;
    const slot = slots[i], page = await doc.getPage(i + 1);
    const cssW = slot.clientWidth, scale = cssW / sizes[i][0], dpr = Math.min(window.devicePixelRatio || 1, 3);
    const v = page.getViewport({ scale: scale * dpr });
    const c = h('canvas', { width: Math.floor(v.width), height: Math.floor(v.height) });
    const task = page.render({ canvasContext: c.getContext('2d'), viewport: v, canvas: c });
    drawn.set(i, task);
    try { await task.promise; } catch (e) { drawn.delete(i); return; }
    if (drawn.get(i) === task) { slot.innerHTML = ''; slot.append(c); }
  }
  function drop(i) {
    const t = drawn.get(i);
    if (!t) return;
    drawn.delete(i); try { t.cancel(); } catch (e) { /* already done */ }
    slots[i].innerHTML = '';
  }
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    const i = Number(en.target.dataset.page) - 1;
    if (en.isIntersecting) draw(i); else drop(i);
  }), { root: pane, rootMargin: '150% 0px' });
  slots.forEach(s => io.observe(s));
  // the page at the top of the screen
  const onScroll = () => {
    const top = pane.scrollTop + 20;
    let i = 0; while (i < slots.length - 1 && slots[i + 1].offsetTop <= top) i++;
    if (i !== at) { at = i; label(); }
  };
  pane.addEventListener('scroll', onScroll, { passive: true });
  function label() { count.textContent = (at + 1) + ' / ' + doc.numPages; prev.disabled = at === 0; next.disabled = at === doc.numPages - 1; }
  function go(i) { if (i < 0 || i >= slots.length) return; pane.scrollTo({ top: slots[i].offsetTop, behavior: 'smooth' }); at = i; label(); }
  function layout() {
    zoomBtn.textContent = zoom === 1 ? 'Zoom' : zoom + '×';
    zoomBtn.setAttribute('aria-label', 'Zoom: ' + (zoom === 1 ? 'fit width' : zoom + ' times'));
    const keep = at;
    [...drawn.keys()].forEach(drop);
    slots.forEach((s, i) => { s.style.width = (zoom * 100) + '%'; s.style.aspectRatio = sizes[i][0] + ' / ' + sizes[i][1]; });
    slots.forEach(s => { io.unobserve(s); io.observe(s); });
    pane.scrollTop = slots[keep].offsetTop;
  }
  const key = e => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowRight' || e.key === 'PageDown') go(at + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(at - 1);
  };
  function close() {
    if (closed) return;
    closed = true;
    io.disconnect(); [...drawn.keys()].forEach(drop);
    box.remove(); document.removeEventListener('keydown', key);
    task.destroy();
    if (onClose) onClose();
    if (back && back.isConnected && back.focus) back.focus({ preventScroll: true });
  }
  document.addEventListener('keydown', key);
  document.body.append(box);
  layout(); label();
  closeBtn.focus();
  return close;
}
