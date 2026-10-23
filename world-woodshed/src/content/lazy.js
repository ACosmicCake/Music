/* World Woodshed — long-form content that only a few pages show, kept out of the first download.
   Each loader fetches its chunk once and merges it into the shared data. The chunks are in the service
   worker's precache like the rest of the app, so this works offline; a failed load can be retried. */
import D from '../data.js';

function once(load) {
  let p = null, done = false;
  const get = () => p || (p = load().then(() => { done = true; }, e => { p = null; throw e; }));
  get.done = () => done;
  return get;
}

/* Style essays: philosophy and meaning, how it works, guitar approach, glossary (r.essay) */
export const loadEssays = once(() => Promise.all([
  import('./essays-1.js'), import('./essays-2.js'), import('./essays-3.js'),
  import('./essays-4.js'), import('./essays-5.js'), import('./essays-6.js')
]).then(mods => {
  const all = Object.assign({}, ...mods.map(m => m.default));
  D.REGIONS.forEach(r => { if (all[r.id]) r.essay = all[r.id]; });
}));

/* The research behind the smart plan (D.SCIENCE) */
export const loadScience = once(() => import('./science.js').then(m => { D.SCIENCE = m.default; }));

/* The full technique guides, style drills and lessons, merged into the index objects in D (same order, same ids) */
const fill = (list, mods) => {
  const byId = new Map(list.map(x => [x.id, x]));
  mods.forEach(m => m.default.forEach(full => { const x = byId.get(full.id); if (x) Object.assign(x, full); }));
};
export const loadGuides = once(() => Promise.all([import('./techniques-a.js'), import('./techniques-b.js')]).then(m => fill(D.TECHNIQUES, m)));
export const loadDrills = once(() => Promise.all([import('./drills-a.js'), import('./drills-b.js'), import('./drills-solo.js')]).then(m => {
  fill(D.DRILLS, m.slice(0, 2));
  D.DRILLS.forEach(d => { if (m[2].default[d.id]) d.solo = m[2].default[d.id]; }); // how to solo, for the drills where you improvise
}));
export const loadLessons = once(() => import('./lessons.js').then(m => fill(D.LESSONS, [m])));

/* Inside a tool or a card: show "Loading…" in `el`, then call draw() (which may return a cleanup).
   Returns a cleanup for the caller to run when the view goes away, before or after the load. */
export function drawWhenLoaded(load, el, draw) {
  let gone = false, cleanup = null;
  const stop = () => { gone = true; if (typeof cleanup === 'function') cleanup(); };
  if (load.done()) { cleanup = draw(); return stop; }
  const note = document.createElement('p');
  note.className = 'muted'; note.textContent = 'Loading…';
  el.append(note);
  load().then(() => { if (gone) return; note.remove(); cleanup = draw(); }, e => {
    console.error(e);
    note.textContent = 'This could not be loaded. Check your connection and open it again.';
  });
  return stop;
}

/* Draw `page` once `load` is done. Until then the view says it is loading; if the player has moved on
   by the time it arrives (ui.runner changed), nothing is drawn. If the chunk can't be fetched, an optional
   chunk (extra texts on a page that works without them) still draws the page, with a toast saying why;
   otherwise the view says it could not be loaded. */
export function whenLoaded(load, ui, view, toast, page, optional = true) {
  if (load.done()) { page(); return; }
  const mark = ui.runner;
  const note = document.createElement('p');
  note.className = 'muted'; note.textContent = 'Loading…';
  view.append(note);
  const draw = () => { if (ui.runner !== mark) return; note.remove(); page(); };
  load().then(draw, e => {
    console.error(e);
    if (ui.runner !== mark) return;
    if (!optional) { note.textContent = 'This page could not be loaded. Check your connection and open it again.'; return; }
    toast('Could not load the long texts for this page. They will be here next time you are online.');
    draw();
  });
}

/* How the changes of each Repertoire tune work and how to solo over them (t.harmony, t.harmony.solo on D.TUNES),
   the words they use (D.HARMONY_WORDS), and the app's own melodies for the tunes that have one (t.melody:
   { key, mel } in the text form src/melody.js reads) */
export const loadTuneNotes = once(() => Promise.all([import('./tunes-harmony.js'), import('./tunes-melody.js')]).then(([m, mm]) => {
  D.TUNES.forEach(t => {
    if (m.default[t.id]) t.harmony = Object.assign({ solo: m.SOLO[t.id] }, m.default[t.id]);
    if (mm.default[t.id]) t.melody = mm.default[t.id];
  });
  D.HARMONY_WORDS = m.WORDS;
}));
