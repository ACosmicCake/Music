/* World Woodshed — your island on Today: one card for the garden island and the Club that stands on it. The
   picture is the island with the Club on its lot, in 3D where this device draws 3D scenes (src/ui/scenes3d.js;
   the one shared world in src/ui/garden.js) and drawn flat otherwise (src/ui/islandflat.js); a tap on it opens
   the island page, a tap on the Club (flat) or Open the club opens the Club. Below it, the Club's night and next
   goal (src/tools/club.js clubInfo) and, once the daily Action has started counting, the real plants: how far
   the next one has grown and who lives there (src/ui/garden.js gardenInfo). */
import { h, bar, openTool, TOOLS } from './core.js';
import Eco from '../ecosystem.js';
import { pickGuest } from '../folklook.js';
import { gardenInfo, islandState, flatIsland, showIsland, onLedger } from './garden.js';
import { clubInfo, openClub } from '../tools/club.js';
import { show3D } from './scenes3d.js';

let shown = null, wired = false;

export function islandCard() {
  if (!wired) { wired = true; onLedger(() => { if (shown && shown.isConnected) shown.replaceWith(islandCard()); }); }
  let club = null, garden = null;
  try { club = TOOLS.club ? clubInfo() : null; } catch (e) { console.error(e); }
  try { garden = gardenInfo(); } catch (e) { console.error(e); }
  const st = islandState();
  const residents = Eco.residents(Eco.counts(st.planted), { wilted: st.wilted });
  const guests = [];
  for (let i = 0; i < Math.min(6, club ? club.crowd : 0); i++) guests.push(pickGuest(residents, i * 13 + 5));
  const card = h('div', { class: 'card isl-card' });
  shown = card;
  const toIsland = () => openTool('island', { returnTab: 'today' });
  const toClub = () => openClub('today');
  const pic = h('div', { class: 'isl-pic' }, flatIsland({ residents, guests, onClub: club ? toClub : null, onIsland: toIsland }));
  card.append(
    h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Your island' }), h('span', { class: 'mono small', text: garden ? (garden.summary || 'Growing your first') : '' })),
    pic);
  if (show3D()) showIsland(pic);
  if (club) card.append(h('div', { class: 'isl-club' },
    h('b', { class: 'isl-name', text: club.name }),
    h('span', { class: 'small', text: club.line }),
    h('span', { class: 'small muted', text: club.stats })));
  if (garden) {
    card.append(bar(100 * garden.frac, 'good'), h('p', { class: 'small', text: garden.lead }), h('p', { class: 'small muted', text: garden.animals }));
    if (garden.waiting) card.append(h('p', { class: 'small muted', text: garden.waiting }));
    if (garden.test) card.append(h('p', { class: 'small muted', text: garden.test }));
    card.append(h('p', { class: 'small muted', text: garden.start }));
  }
  const links = h('div', { class: 'row' });
  if (club) links.append(h('button', { class: 'btn small brass', onclick: toClub }, 'Open ' + club.name));
  links.append(h('button', { class: 'btn small ghost', onclick: toIsland }, 'Explore the island'));
  if (garden && garden.dashboard) links.append(h('a', { class: 'btn small ghost', href: garden.dashboard, target: '_blank', rel: 'noopener' }, 'See them on GoodAPI ↗'));
  card.append(links);
  return card;
}
