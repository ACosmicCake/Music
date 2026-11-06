import E from '../engine.js';
import { h, toast } from './core.js';

/* Favourites across the app: Train tools, Rhythm gym exercises, technique exercises and style drills, starred
   beside their tile or on their page and listed together at the top of Train (`favList`).
   Drills keep their own list (settings.favDrills, older than this); the rest are 'kind:id' in settings.favs. */
export const FAV_KINDS = ['tool', 'gym', 'tech', 'drill'];
const own = () => (Array.isArray(E.state.settings.favs) ? E.state.settings.favs : []);
const drills = () => (Array.isArray(E.state.settings.favDrills) ? E.state.settings.favDrills : []);

export const isFav = (kind, id) => (kind === 'drill' ? drills().includes(id) : own().includes(kind + ':' + id));
export function toggleFav(kind, id) {
  const on = isFav(kind, id);
  if (kind === 'drill') E.setSetting('favDrills', on ? drills().filter(x => x !== id) : drills().concat([id]));
  else { const key = kind + ':' + id; E.setSetting('favs', on ? own().filter(x => x !== key) : own().concat([key])); }
  toast(on ? 'Taken out of your favourites' : 'Added to your favourites');
  return !on;
}
/* [{ kind, id }] in the order starred, drills after the rest */
export const favList = () => own().map(k => { const i = k.indexOf(':'); return { kind: k.slice(0, i), id: k.slice(i + 1) }; })
  .filter(f => FAV_KINDS.includes(f.kind)).concat(drills().map(id => ({ kind: 'drill', id })));

/* A ☆/★ toggle for one item */
export function favStar(kind, id, name, onChange) {
  const b = h('button', { class: 'fav-star', 'data-fav': kind + ':' + id, 'data-name': name });
  b.onclick = e => { e.stopPropagation(); toggleFav(kind, id); paintStar(b); if (onChange) onChange(); };
  paintStar(b); return b;
}
function paintStar(b) {
  const k = b.dataset.fav, i = k.indexOf(':'), on = isFav(k.slice(0, i), k.slice(i + 1)), name = b.dataset.name;
  b.textContent = on ? '★' : '☆'; b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', (on ? 'Remove ' : 'Add ') + name + (on ? ' from' : ' to') + ' favourites');
}
/* Bring every star under root up to date (the same item can be starred in two places on one page) */
export const repaintStars = root => root.querySelectorAll('.fav-star[data-fav]').forEach(paintStar);
/* A tile with its star beside it */
export const withStar = (tile, kind, id, name, onChange) => h('div', { class: 'dtile' }, tile, favStar(kind, id, name, onChange));
