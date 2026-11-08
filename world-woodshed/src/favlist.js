/* The player's favourites as plain data (no UI), read by the Train page's ★ Favourites (src/ui/favs.js) and by the
   smart planner (src/curriculum.js), which mixes them into sessions for variety.
   Drills keep their own list (settings.favDrills, older than the rest); the rest are 'kind:id' in settings.favs. */
export const FAV_KINDS = ['tool', 'gym', 'tech', 'drill'];
/* [{ kind, id }] in the order starred, drills after the rest */
export function favsOf(settings = {}) {
  const own = Array.isArray(settings.favs) ? settings.favs : [], drills = Array.isArray(settings.favDrills) ? settings.favDrills : [];
  return own.filter(k => typeof k === 'string' && k.includes(':')).map(k => { const i = k.indexOf(':'); return { kind: k.slice(0, i), id: k.slice(i + 1) }; })
    .filter(f => FAV_KINDS.includes(f.kind)).concat(drills.filter(id => typeof id === 'string').map(id => ({ kind: 'drill', id })));
}
