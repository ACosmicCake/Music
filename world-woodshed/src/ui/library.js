/* World Woodshed — the Library tab: your scores (PDF, MusicXML, MuseScore, Guitar Pro, MIDI), photos of
   scores taken with the phone, and the songs you want to learn, are learning and have learned.
   The data and the files are handled by src/library.js; this draws the list, an entry's page and the photo
   viewer. Each entry's details sync; its files stay on the device they were added on. */
import './library.css';
import * as L from '../library.js';
import { STATUSES, KIND_LABEL, SCORE_KINDS, sizeLabel } from '../library.js';
import { view, h, ui, go, toast, renderTabs, teardown, focusView, PAGES, TOOLS, ICONS, TABS, openTool } from './core.js';
import { shareBlob, isNative } from '../native.js';

ICONS.library = '<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/><circle cx="10.5" cy="16.5" r="1.8"/><path d="M12.3 16.5V10l3 1"/></svg>';
TABS.push(['library', 'Library']);

const STATUS_NAME = Object.fromEntries(STATUSES);
const dateLabel = t => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const filter = { status: 'all', sort: 'recent', q: '' }; // kept while the app is open
const urls = new Set(); // object URLs for thumbnails and the viewer, let go when the page closes
function urlFor(blob) { const u = URL.createObjectURL(blob); urls.add(u); return u; }
function dropUrls() { urls.forEach(u => URL.revokeObjectURL(u)); urls.clear(); }
let closeViewer = null; // the photo viewer, closed when the page goes (the Android back button, a tab)
function leave() { if (closeViewer) closeViewer(); dropUrls(); }
const titleFromFile = name => String(name || '').replace(/\.wwscore\.json$/i, '').replace(/\.[a-z0-9]{1,8}$/i, '').replace(/[_]+/g, ' ').trim();

/* a hidden file input: camera (a photo of a score), the photo gallery, or any file */
function picker(kind, onFiles) {
  const attrs = { type: 'file', hidden: true };
  if (kind === 'camera') { attrs.accept = 'image/*'; attrs.capture = 'environment'; }
  else if (kind === 'photos') { attrs.accept = 'image/*'; attrs.multiple = true; }
  else attrs.multiple = true; // any file: score apps' formats have no type Android knows, so nothing is filtered out
  const fi = h('input', attrs);
  fi.addEventListener('change', () => { const files = [...(fi.files || [])]; fi.value = ''; if (files.length) onFiles(files); });
  return fi;
}
function reportAdd(r) {
  if (r.failed.length) toast(r.failed.map(([n, why]) => n + ': ' + why).join('; '));
  else if (r.added) toast(r.added === 1 ? 'Added' : r.added + ' files added');
}
const writeButton = (cls, params) => (TOOLS.notate
  ? h('button', { class: cls, onclick: () => openTool('notate', { returnTab: 'library', params }) }, params ? 'Edit in Write by playing' : 'Write a score by playing')
  : null);

/* ---------- the tab: every entry ---------- */
PAGES.library = function () {
  leave();
  ui.cleanup = leave;
  L.prune().catch(() => {});
  view.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Library' }), h('h1', { text: 'Your scores and songs' }),
    h('p', { class: 'muted', text: 'Score files, photos of scores, and the songs you are learning or have learned, with your notes.' })));

  // adding: a photo of a score, score files, or just a song
  const newFrom = async (files, fields) => {
    const id = await L.addToLibrary(Object.assign({ title: titleFromFile(files[0] && files[0].name) || 'Untitled score' }, fields));
    reportAdd(await L.addFiles(id, files));
    entryPage(id, { rename: true });
  };
  const cam = picker('camera', files => newFrom(files, { title: 'Score photo ' + dateLabel(Date.now()) }));
  const any = picker('files', files => newFrom(files, {}));
  const songForm = h('form', { class: 'stack lib-songform', hidden: true });
  const tIn = h('input', { type: 'text', id: 'lib-new-title', maxlength: 200, placeholder: 'Blackbird', autocomplete: 'off', required: true });
  const bIn = h('input', { type: 'text', id: 'lib-new-by', maxlength: 200, placeholder: 'The Beatles', autocomplete: 'off' });
  let newStatus = 'learned';
  const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Status' }, STATUSES.map(([id, label]) => h('button', { type: 'button', 'aria-pressed': id === newStatus ? 'true' : 'false', onclick: e => {
    newStatus = id; seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget)));
  } }, label)));
  songForm.append(
    h('label', { class: 'stack field', for: tIn.id }, h('span', { class: 'eyebrow', text: 'Song' }), tIn),
    h('label', { class: 'stack field', for: bIn.id }, h('span', { class: 'eyebrow', text: 'By (optional)' }), bIn),
    seg,
    h('div', { class: 'row' }, h('button', { class: 'btn brass small', type: 'submit' }, 'Add the song'), h('button', { class: 'btn ghost small', type: 'button', onclick: () => { songForm.hidden = true; } }, 'Cancel')));
  songForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!tIn.value.trim()) { tIn.focus(); return; }
    await L.addToLibrary({ title: tIn.value, by: bIn.value, status: newStatus });
    toast('Added to your library');
    go('library');
  });
  view.append(cam, any, h('div', { class: 'card' },
    h('div', { class: 'row lib-add' },
      h('button', { class: 'btn brass', onclick: () => cam.click() }, 'Photograph a score'),
      h('button', { class: 'btn', onclick: () => any.click() }, 'Add score files'),
      h('button', { class: 'btn', onclick: () => { songForm.hidden = false; tIn.focus(); } }, 'Add a song'),
      writeButton('btn')),
    songForm,
    h('p', { class: 'small muted', text: 'PDF, MusicXML, MuseScore, Guitar Pro, MIDI, photos and audio. The details sync to your other devices; the files stay on the device you added them on.' })));

  const all = L.listEntries();
  const list = h('div', { class: 'tools lib-list' });
  const section = h('div', { class: 'section' });
  view.append(section);
  if (!all.length) {
    section.append(h('p', { class: 'muted small', text: 'Nothing here yet. Photograph a page of a score, add a PDF or MusicXML file, or note a song you have learned.' }));
    return;
  }
  const n = L.countBy(all);
  const search = h('input', { type: 'search', class: 'search', placeholder: 'Search titles, composers, notes', 'aria-label': 'Search the library', value: filter.q });
  const statusSeg = h('div', { class: 'seg lib-filter', role: 'group', 'aria-label': 'Show' }, [['all', 'All']].concat(STATUSES).map(([id, label]) =>
    h('button', { 'aria-pressed': filter.status === id ? 'true' : 'false', onclick: () => { filter.status = id; go('library'); } }, label + ' ' + (n[id] || 0))));
  const sortSel = h('select', { 'aria-label': 'Sort by', onchange: e => { filter.sort = e.target.value; drawList(); } },
    [['recent', 'Last changed'], ['title', 'Title'], ['by', 'Composer or artist']].map(([v, l]) => h('option', { value: v, selected: v === filter.sort ? true : null }, l)));
  search.addEventListener('input', () => { filter.q = search.value; drawList(); });
  section.append(h('h2', { text: 'In your library' }), ...(all.length > 4 ? [search] : []), statusSeg, h('label', { class: 'row small muted' }, 'Sort ', sortSel), list);

  let localP = null;
  function drawList() {
    list.innerHTML = '';
    const shown = L.sortEntries(all.filter(e => (filter.status === 'all' || e.status === filter.status) && L.matches(e, filter.q)), filter.sort);
    if (!shown.length) { list.append(h('p', { class: 'muted small', text: 'Nothing matches.' })); return; }
    localP = localP || L.localIds();
    shown.forEach(e => {
      const thumb = h('span', { class: 'lib-thumb', 'aria-hidden': 'true' });
      const kinds = [...new Set(e.files.map(f => KIND_LABEL[f.kind]))];
      const meta = [e.by, STATUS_NAME[e.status] + (e.status === 'learned' && e.learned ? ' ' + dateLabel(e.learned) : ''),
        e.files.length ? (e.files.length === 1 ? kinds[0] : e.files.length + ' files') : ''].filter(Boolean).join(' · ');
      list.append(h('button', { class: 'tile lib-tile', onclick: () => entryPage(e.id) }, thumb,
        h('span', { class: 't-title', text: e.title }), h('span', { class: 't-desc', text: meta })));
      const img = e.files.find(f => f.kind === 'image');
      if (img) localP.then(have => (have.has(img.id) ? L.getThumb(img.id) : null)).then(b => { if (b && thumb.isConnected) thumb.style.backgroundImage = 'url("' + urlFor(b) + '")'; });
      else thumb.textContent = e.files.length ? (KIND_LABEL[e.files[0].kind] || 'File').slice(0, 4) : '♪';
    });
  }
  drawList();
};

/* ---------- one entry: status, pages and files, details ---------- */
export function entryPage(id, opts = {}) {
  teardown(); ui.runner = { id: 'library-entry', opts: {} }; renderTabs();
  view.innerHTML = ''; window.scrollTo(0, 0);
  leave();
  ui.cleanup = leave;
  const e = L.getEntry(id);
  if (!e) { go('library'); return; }
  const title = h('h1', { text: e.title }), byLine = h('p', { class: 'muted', text: e.by, hidden: !e.by });
  view.append(h('div', { class: 'hero lib-hero' },
    h('div', { class: 'spread' }, h('button', { class: 'btn ghost small rh-back', onclick: () => go('library') }, '← Library'), h('span', { class: 'eyebrow', text: 'Library' })),
    title, byLine));

  // status
  const seg = h('div', { class: 'seg big', role: 'group', 'aria-label': 'Status' }, STATUSES.map(([sid, label]) => h('button', { 'aria-pressed': sid === e.status ? 'true' : 'false', onclick: ev => {
    const saved = L.updateEntry(id, { status: sid });
    seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === ev.currentTarget)));
    learnedNote.textContent = sid === 'learned' && saved && saved.learned ? 'Learned ' + dateLabel(saved.learned) : '';
  } }, label)));
  const learnedNote = h('p', { class: 'small muted', text: e.status === 'learned' && e.learned ? 'Learned ' + dateLabel(e.learned) : '' });
  view.append(h('div', { class: 'stack' }, seg, learnedNote));

  // pages and files
  const filesCard = h('section', { class: 'card' });
  view.append(filesCard);
  const after = r => { reportAdd(r); drawFiles(); };
  const cam = picker('camera', files => L.addFiles(id, files).then(after));
  const photos = picker('photos', files => L.addFiles(id, files).then(after));
  const any = picker('files', files => L.addFiles(id, files).then(after));
  view.append(cam, photos, any);
  async function drawFiles() {
    const cur = L.getEntry(id);
    if (!cur) return;
    const have = await L.localIds();
    filesCard.innerHTML = '';
    filesCard.append(h('h2', { text: 'Pages and files' }));
    const imgs = cur.files.filter(f => f.kind === 'image'), others = cur.files.filter(f => f.kind !== 'image');
    if (!cur.files.length) filesCard.append(h('p', { class: 'small muted', text: 'No files yet. Photograph each page of the score, or add a PDF, MusicXML, MuseScore or Guitar Pro file.' }));
    if (imgs.length) {
      const strip = h('div', { class: 'lib-pages' });
      const here = imgs.filter(f => have.has(f.id));
      imgs.forEach((f, i) => {
        const local = have.has(f.id);
        const b = h('button', { class: 'lib-page', 'aria-label': 'Page ' + (i + 1) + (local ? '' : ', on another device'), disabled: local ? null : true, onclick: () => viewer(here, here.indexOf(f)) },
          h('span', { class: 'lib-pno', text: String(i + 1) }));
        if (local) L.getThumb(f.id).then(t => { if (t) b.style.backgroundImage = 'url("' + urlFor(t) + '")'; });
        else b.append(h('span', { class: 'lib-away small', text: 'On another device' }));
        strip.append(b);
      });
      filesCard.append(strip);
      if (here.length) filesCard.append(h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => viewer(here, 0) }, here.length > 1 ? 'Read the ' + here.length + ' pages' : 'Open the photo')));
    }
    const rows = others.concat(imgs);
    if (rows.length) filesCard.append(h('div', { class: 'stack lib-files' }, rows.map(f => fileRow(cur, f, have.has(f.id), drawFiles))));
    filesCard.append(h('div', { class: 'row' },
      h('button', { class: 'btn small brass', onclick: () => cam.click() }, 'Take a photo'),
      h('button', { class: 'btn small', onclick: () => photos.click() }, 'From your photos'),
      h('button', { class: 'btn small', onclick: () => any.click() }, 'Add files'),
      cur.files.some(f => f.kind === 'wwscore' && have.has(f.id)) ? writeButton('btn small', { load: id }) : null));
    if (cur.files.some(f => !have.has(f.id))) filesCard.append(h('p', { class: 'small muted', text: 'Files marked "on another device" were added there. Files never sync, only their names: share one from that device to bring it here.' }));
  }
  drawFiles();

  // details: saved as you leave each field
  const field = (label, input) => h('label', { class: 'stack field', for: input.id }, h('span', { class: 'eyebrow', text: label }), input);
  const tIn = h('input', { type: 'text', id: 'lib-title', maxlength: 200, value: e.title, autocomplete: 'off' });
  const bIn = h('input', { type: 'text', id: 'lib-by', maxlength: 200, value: e.by, placeholder: 'Composer, artist or band', autocomplete: 'off' });
  const lIn = h('input', { type: 'url', id: 'lib-link', maxlength: 500, value: e.link, placeholder: 'https://', autocomplete: 'off', inputmode: 'url' });
  const nIn = h('textarea', { id: 'lib-notes', rows: 5, maxlength: 8000, placeholder: 'Key, tuning, capo, the hard bars, where you learned it' });
  nIn.value = e.notes;
  const linkBtn = h('a', { class: 'btn small ghost', target: '_blank', rel: 'noopener noreferrer', hidden: !e.link }, 'Open the link');
  if (e.link) linkBtn.href = e.link;
  const save = fields => {
    const saved = L.updateEntry(id, fields);
    if (!saved) return;
    title.textContent = saved.title;
    byLine.textContent = saved.by; byLine.hidden = !saved.by;
    if ('link' in fields) {
      const ok = L.webLink(lIn.value);
      linkBtn.hidden = !ok; if (ok) linkBtn.href = ok; else linkBtn.removeAttribute('href');
      if (lIn.value.trim() && !ok) toast('Links must start with http:// or https://');
    }
  };
  tIn.addEventListener('change', () => save({ title: tIn.value }));
  bIn.addEventListener('change', () => save({ by: bIn.value }));
  lIn.addEventListener('change', () => save({ link: lIn.value }));
  nIn.addEventListener('change', () => save({ notes: nIn.value }));
  view.append(h('section', { class: 'card lib-details' }, h('h2', { text: 'Details' }),
    field('Title', tIn), field('By', bIn), field('Link (a video, a lesson, the recording)', lIn), linkBtn, field('Notes', nIn),
    h('p', { class: 'small muted', text: 'Saved as you go. The details sync to your other devices.' })));

  // delete
  const delWrap = h('div', { class: 'stack' });
  delWrap.append(h('button', { class: 'btn small danger', onclick: () => {
    if (delWrap.querySelector('.confirm')) return;
    const n = (L.getEntry(id) || e).files.length;
    delWrap.append(h('div', { class: 'confirm' }, h('span', { class: 'small', text: 'Delete "' + tIn.value + '"' + (n ? ' and its ' + (n === 1 ? 'file' : n + ' files') : '') + ' from every device?' }),
      h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: ev => ev.currentTarget.closest('.confirm').remove() }, 'Keep it'),
        h('button', { class: 'btn small danger', onclick: async () => { await L.deleteEntry(id); toast('Deleted'); go('library'); } }, 'Delete'))));
  } }, 'Delete from the library'));
  view.append(delWrap);

  focusView();
  if (opts.rename) { tIn.focus(); tIn.select(); }
}

/* one file: what it is, and what can be done with it here */
function fileRow(entry, f, local, redraw) {
  const pages = entry.files.filter(x => x.kind === 'image'), i = pages.indexOf(f); // photos are the pages, read in this order
  const row = h('div', { class: 'lib-file' });
  const info = h('div', { class: 'lib-finfo' }, h('span', { class: 'badge', text: f.kind === 'image' && pages.length > 1 ? 'Page ' + (i + 1) : KIND_LABEL[f.kind] || 'File' }),
    h('span', { class: 'lib-fname', text: f.name }), h('span', { class: 'small muted', text: local ? sizeLabel(f.size) : sizeLabel(f.size) + ' · on another device' }));
  const acts = h('div', { class: 'row' });
  const withFile = fn => async () => {
    const got = await L.getFile(f.id);
    if (!got) { toast('This file is not on this device'); return; }
    try { await fn(got); } catch (e) { console.error(e); toast('Could not hand the file over' + (e && e.message ? ': ' + e.message : '')); }
  };
  const share = (got, what) => shareBlob(got.name, got.blob.type ? got.blob : new Blob([got.blob], { type: got.type }), got.name).then(r => {
    if (r === 'downloaded') toast('Saved to your downloads' + (what ? ': open it in ' + what : ''));
  });
  if (local) {
    if (SCORE_KINDS.has(f.kind)) acts.append(h('button', { class: 'btn small brass', onclick: withFile(got => share(got, 'MuseScore')) }, 'Open in MuseScore'));
    else if (f.kind === 'pdf' && !isNative()) acts.append(h('button', { class: 'btn small brass', onclick: withFile(async got => { const u = urlFor(new Blob([got.blob], { type: 'application/pdf' })); window.open(u, '_blank', 'noopener'); }) }, 'Open'));
    if (f.kind === 'audio' && TOOLS.transcribe) acts.append(h('button', { class: 'btn small', onclick: withFile(got => openTool('transcribe', { returnTab: 'library', params: { file: got.blob instanceof File ? got.blob : new File([got.blob], got.name, { type: got.type }) } })) }, 'Transcribe'));
    acts.append(h('button', { class: 'btn small', onclick: withFile(got => share(got, '')) }, isNative() ? 'Share or open' : 'Share or save'));
  }
  if (f.kind === 'image' && pages.length > 1) {
    acts.append(h('button', { class: 'btn small ghost', 'aria-label': 'Move ' + f.name + ' a page earlier', disabled: i <= 0 ? true : null, onclick: () => { L.moveFile(entry.id, f.id, -1); redraw(); } }, '↑'),
      h('button', { class: 'btn small ghost', 'aria-label': 'Move ' + f.name + ' a page later', disabled: i >= pages.length - 1 ? true : null, onclick: () => { L.moveFile(entry.id, f.id, 1); redraw(); } }, '↓'));
  }
  acts.append(h('button', { class: 'btn small ghost', 'aria-label': 'Remove ' + f.name, onclick: () => {
    if (row.querySelector('.confirm')) return;
    row.append(h('div', { class: 'confirm' }, h('span', { class: 'small', text: 'Remove ' + f.name + (local ? '' : ' (it is on another device)') + '?' }),
      h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: ev => ev.currentTarget.closest('.confirm').remove() }, 'Keep it'),
        h('button', { class: 'btn small danger', onclick: async () => { await L.removeFile(entry.id, f.id); toast('Removed'); redraw(); } }, 'Remove'))));
  } }, 'Remove'));
  row.append(info, acts);
  return row;
}

/* ---------- reading photos of a score, page by page, zoomed to fit the width or closer ---------- */
function viewer(pages, start) {
  if (!pages.length) return;
  let at = Math.max(0, start), zoom = 1;
  const back = document.activeElement;
  const img = h('img', { class: 'lib-vimg', alt: '' });
  const pane = h('div', { class: 'lib-vpane' }, img);
  const count = h('span', { class: 'mono small' });
  const prev = h('button', { class: 'btn small', 'aria-label': 'Previous page', onclick: () => show(at - 1) }, '‹');
  const next = h('button', { class: 'btn small', 'aria-label': 'Next page', onclick: () => show(at + 1) }, '›');
  const zoomBtn = h('button', { class: 'btn small', onclick: () => { zoom = zoom >= 3 ? 1 : zoom + 1; setZoom(); } });
  const close = () => {
    box.remove(); document.removeEventListener('keydown', key); closeViewer = null;
    if (back && back.isConnected && back.focus) back.focus({ preventScroll: true });
  };
  if (closeViewer) closeViewer();
  closeViewer = close;
  const closeBtn = h('button', { class: 'btn small', onclick: close }, 'Close');
  const box = h('div', { class: 'lib-viewer', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Score pages' },
    h('div', { class: 'lib-vbar' }, closeBtn, prev, count, next, zoomBtn), pane);
  function setZoom() { img.style.width = (zoom * 100) + '%'; zoomBtn.textContent = zoom === 1 ? 'Zoom' : zoom + '×'; zoomBtn.setAttribute('aria-label', 'Zoom: ' + (zoom === 1 ? 'fit width' : zoom + ' times')); }
  async function show(i) {
    if (i < 0 || i >= pages.length) return;
    at = i;
    count.textContent = (i + 1) + ' / ' + pages.length;
    prev.disabled = i === 0; next.disabled = i === pages.length - 1;
    img.alt = 'Page ' + (i + 1) + ': ' + pages[i].name;
    const got = await L.getFile(pages[i].id);
    if (got && at === i) { img.src = urlFor(got.blob); pane.scrollTo(0, 0); }
  }
  const key = e => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowRight' || e.key === 'PageDown') show(at + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') show(at - 1);
  };
  document.addEventListener('keydown', key);
  document.body.append(box);
  if (pages.length === 1) [prev, count, next].forEach(el => { el.hidden = true; });
  setZoom(); show(at);
  closeBtn.focus();
}

