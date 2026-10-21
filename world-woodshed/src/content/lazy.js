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

/* Draw `page` once `load` is done. Until then the view says it is loading; if the player has moved on
   by the time it arrives (ui.runner changed), nothing is drawn. If the chunk can't be fetched, the page
   is drawn without it and a toast says why. */
export function whenLoaded(load, ui, view, toast, page) {
  if (load.done()) { page(); return; }
  const mark = ui.runner;
  const note = document.createElement('p');
  note.className = 'muted'; note.textContent = 'Loading…';
  view.append(note);
  const draw = () => { if (ui.runner !== mark) return; note.remove(); page(); };
  load().then(draw, e => {
    console.error(e);
    if (ui.runner === mark) toast('Could not load the long texts for this page. They will be here next time you are online.');
    draw();
  });
}
