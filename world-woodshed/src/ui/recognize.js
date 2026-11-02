/* World Woodshed — turning a score's PDF or photos into a playable score (MusicXML) in the Library.
   Every page becomes a grey image here (pdf.js draws a PDF's pages; photos are decoded and scaled), and is
   read in a Worker (src/omr/omr.worker.js) one page at a time; nothing leaves the device. The result is saved
   to the same Library entry as "<name> (notes read).musicxml", which plays in the score viewer and opens in
   MuseScore. Its own chunk, loaded the first time a score is read. */
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.min.mjs';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import * as L from '../library.js';
import { toGray } from '../omr/image.js';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const PAGE_W = 2400;   // a PDF page is drawn this wide: a staff space comes to about 20 pixels
const MAX_SIDE = 3600; // photos are scaled down to this, which keeps a page of staves sharp enough
export const MAX_PAGES = 40;

/* The file name for what was read from a file (or from an entry's photos) */
export const readName = base => String(base || 'Score').replace(/\.[a-z0-9]{1,8}$/i, '').slice(0, 120) + ' (notes read).musicxml';

/* Draw an image source on a canvas no larger than maxW × maxSide and return it as grey levels */
function grayOf(src, w, h, scale) {
  const W = Math.max(1, Math.round(w * scale)), H = Math.max(1, Math.round(h * scale));
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
  g.drawImage(src, 0, 0, W, H);
  const img = g.getImageData(0, 0, W, H);
  c.width = 0; c.height = 0; // its memory back at once
  return toGray(img.data, W, H);
}

/* Each page of a PDF as a grey image, one at a time */
async function* pdfPages(blob) {
  const task = pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()), isEvalSupported: false });
  const doc = await task.promise;
  try {
    const n = Math.min(doc.numPages, MAX_PAGES);
    for (let i = 1; i <= n; i++) {
      const page = await doc.getPage(i);
      const v1 = page.getViewport({ scale: 1 });
      const v = page.getViewport({ scale: Math.min(PAGE_W / v1.width, 4000 / v1.height) });
      const c = document.createElement('canvas');
      c.width = Math.floor(v.width); c.height = Math.floor(v.height);
      const g = c.getContext('2d', { willReadFrequently: true });
      g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: g, viewport: v, canvas: c }).promise;
      const img = g.getImageData(0, 0, c.width, c.height);
      const gray = toGray(img.data, c.width, c.height);
      c.width = 0; c.height = 0;
      page.cleanup();
      yield { gray, page: i, of: n, total: doc.numPages };
    }
  } finally { task.destroy(); }
}

/* Photos (blobs) as grey images, turned upright from their EXIF orientation */
async function* photoPages(blobs) {
  for (let i = 0; i < blobs.length; i++) {
    const bmp = await createImageBitmap(blobs[i], { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const gray = grayOf(bmp, bmp.width, bmp.height, scale);
    bmp.close();
    yield { gray, page: i + 1, of: blobs.length, total: blobs.length };
  }
}

/* Read pages in the Worker → { xml, summary } or { empty: true } */
async function readPages(pages, opts, onProgress) {
  const worker = new Worker(new URL('../omr/omr.worker.js', import.meta.url), { type: 'module' });
  const ask = (msg, transfer) => new Promise((resolve, reject) => {
    worker.onmessage = e => (e.data.type === 'error' ? reject(new Error(e.data.message)) : resolve(e.data));
    worker.onerror = e => reject(new Error(e.message || 'the reader stopped'));
    worker.postMessage(msg, transfer || []);
  });
  try {
    await ask({ type: 'reset' });
    let total = 0;
    for await (const p of pages) {
      total = p.total;
      onProgress('Reading page ' + p.page + ' of ' + p.of + '…', (p.page - 1) / p.of);
      await ask({ type: 'page', gray: p.gray }, [p.gray.d.buffer]);
    }
    onProgress('Putting the score together…', 1);
    const r = await ask({ type: 'finish', opts });
    if (total > MAX_PAGES) r.skipped = total - MAX_PAGES;
    return r;
  } finally { worker.terminate(); }
}

/* ---------- jobs: one at a time, and an open entry page can follow along ---------- */
const jobs = new Map(); // entry and source → { entryId, text, frac, promise }
const results = new Map(); // entry id → the last reading's result, while the app is open
export const lastResult = entryId => results.get(entryId) || null;
const listeners = new Set();
const tell = () => listeners.forEach(fn => { try { fn(); } catch (e) { /* a page that went away */ } });
export const onJobs = fn => { listeners.add(fn); return () => listeners.delete(fn); };
export const jobsFor = entryId => [...jobs.values()].filter(j => j.entryId === entryId);
let queue = Promise.resolve();

/* Read a score from an entry's PDF (fileId) or its photos (fileId null: every photo, in page order) and save
   the MusicXML to the entry, replacing an earlier reading of the same source. Resolves with
   { name, summary } or { empty: true }; throws when the file can't be read. */
export function readIntoLibrary(entryId, fileId = null, opts = {}) {
  const key = entryId + '|' + (fileId || 'photos');
  if (jobs.has(key)) return jobs.get(key).promise;
  const job = { entryId, fileId, text: 'Waiting to read the notes…', frac: 0 };
  jobs.set(key, job); tell();
  const run = async () => {
    const e = L.getEntry(entryId);
    if (!e) throw new Error('the entry was deleted');
    const set = (text, frac) => { job.text = text; job.frac = frac; tell(); };
    let pages, base;
    if (fileId) {
      const got = await L.getFile(fileId);
      if (!got) throw new Error('the PDF is not on this device');
      pages = pdfPages(got.blob); base = got.name;
    } else {
      const imgs = e.files.filter(f => f.kind === 'image');
      const blobs = [];
      for (const f of imgs) { const got = await L.getFile(f.id); if (got) blobs.push(got.blob); }
      if (!blobs.length) throw new Error('none of the photos are on this device');
      pages = photoPages(blobs); base = e.title || 'Score';
    }
    const r = await readPages(pages, { title: e.title, composer: e.by, bpm: opts.bpm }, set);
    if (r.empty) return { empty: true, pages: r.pages };
    const name = readName(base);
    // a second reading replaces the first
    const cur = L.getEntry(entryId);
    for (const f of (cur ? cur.files : []).filter(f => f.name === name)) await L.removeFile(entryId, f.id);
    const blob = new Blob([r.xml], { type: 'application/vnd.recordare.musicxml+xml' });
    const added = await L.addFiles(entryId, [{ blob, name, type: blob.type }]);
    if (added.failed.length) throw new Error(added.failed[0][1]);
    return { name, summary: r.summary, skipped: r.skipped || 0 };
  };
  job.promise = (queue = queue.catch(() => {}).then(run)).then(r => { results.set(entryId, r); return r; }).finally(() => { jobs.delete(key); tell(); });
  return job.promise;
}

/* The PDFs of an entry that have no reading yet (on this device), for reading by themselves after adding */
export function unreadPdfs(entry, have) {
  const names = new Set(entry.files.map(f => f.name));
  return entry.files.filter(f => f.kind === 'pdf' && have.has(f.id) && !names.has(readName(f.name)));
}

/* A few words for a toast */
export function short(r) {
  if (r.empty) return 'No music staves were found on the page';
  const n = r.summary.check.length;
  return 'Score ready: ' + r.summary.bars + ' bars' + (n ? ', ' + n + ' to check' : '');
}

/* What a reading found, in words */
export function describe(r) {
  if (r.empty) return 'No music staves were found. Is the page sharp, flat and well lit, with the staves running across?';
  const s = r.summary;
  const bits = [s.bars + (s.bars === 1 ? ' bar' : ' bars') + ' and ' + s.notes + ' notes read'];
  if (s.check.length) bits.push(s.check.length + (s.check.length === 1 ? ' bar didn\'t add up and was evened out (bar ' : ' bars didn\'t add up and were evened out (bars ') + listBars(s.check) + '): check those against the page');
  if (s.drums) bits.push(s.drums > 1 ? 'the drum staves were left out (their notes are drums, not pitches)' : 'the drum staff was left out (its notes are drums, not pitches)');
  if (s.partsFrom) bits.push('the separate parts from page ' + s.partsFrom + ' on were left out (the score before them has every part)');
  if (r.skipped) bits.push('only the first ' + MAX_PAGES + ' pages were read');
  return bits.join('; ') + '.';
}
const listBars = a => (a.length > 8 ? a.slice(0, 8).join(', ') + ' and ' + (a.length - 8) + ' more' : a.join(', '));
