/* World Woodshed — your garden on Today: every 10 hours practised becomes a real tree, kelp plant or ten
   plastic bottles collected (the rules in src/impact.js; the daily GitHub Action orders them and keeps the
   ledger in your sync repository). This reads the ledger after a sync round, keeps a copy on the device
   (localStorage 'ww-impact') and draws one plant per order, with a sapling growing toward the next one that
   wilts when you haven't played for a couple of days. Settings → Real impact picks what the hours become. */
import E from '../engine.js';
import Imp from '../impact.js';
import { h, tool, openTool } from './core.js';
import { IslandFlat } from './islandflat.js';
import { ROOMS, owns } from '../club.js';
import Eco from '../ecosystem.js';
import { fmtMin } from '../routines.js';
import { show3D } from './scenes3d.js';
import { repoCall, repoDir, onSynced, status as ghStatus } from '../ghsync.js';

const CACHE = 'ww-impact';
const EVERY_MS = 30 * 60 * 1000; // read the ledger at most this often (the Action writes it once a day)
let ledger = load(), lastRead = 0, reading = null;
const listeners = new Set();
function load() { try { const l = JSON.parse(localStorage.getItem(CACHE)); return l && l.v === 1 ? l : null; } catch (e) { return null; } }
function keep(l) { ledger = l; try { if (l) localStorage.setItem(CACHE, JSON.stringify(l)); else localStorage.removeItem(CACHE); } catch (e) { /* storage full or blocked */ } }

/* Fetch the ledger from the sync repository (quietly does nothing when sync is off or GitHub can't be reached) */
export function refreshLedger(force) {
  if (!ghStatus().on) return Promise.resolve(ledger);
  if (reading) return reading;
  if (!force && Date.now() - lastRead < EVERY_MS) return Promise.resolve(ledger);
  reading = (async () => {
    try {
      const res = await repoCall('GET', repoDir() + Imp.LEDGER_FILE, null, 'application/vnd.github.raw+json');
      lastRead = Date.now();
      if (res.status === 404) return ledger;
      if (!res.ok) return ledger;
      const l = JSON.parse(await res.text());
      if (l && l.v === 1 && Array.isArray(l.planted) && typeof l.days === 'object') {
        const before = JSON.stringify(ledger);
        keep(l);
        if (JSON.stringify(l) !== before) {
          // the island card on Today (src/ui/islandcard.js) and anything else listening draw themselves again
          listeners.forEach(fn => { try { fn(l); } catch (e) { console.error(e); } });
        }
      }
    } catch (e) { /* offline: the copy on the device stands */ }
    return ledger;
  })().finally(() => { reading = null; });
  return reading;
}
export const currentLedger = () => ledger;
/* The real orders so far ({ n, kind: 'tree' | 'kelp' | 'bottles', count, project, at }), test ones while the
   Action still runs on a test key; [] before the ledger exists. For other pages that show them (the club). */
export const plantings = () => (ledger ? Imp.live(ledger).map(p => Object.assign({}, p)) : []);
export function onLedger(fn) { listeners.add(fn); return () => listeners.delete(fn); }
let wired = false;
export function initGarden() {
  if (wired) return;
  wired = true;
  onSynced(() => refreshLedger());
}

/* days since the last practice (0 = today) */
export function idleDays(mins) {
  const keys = Object.keys(mins).filter(k => mins[k] >= 1).sort();
  if (!keys.length) return 99;
  const last = new Date(keys[keys.length - 1] + 'T12:00:00'), now = new Date(E.dayKey() + 'T12:00:00');
  return Math.round((now - last) / 864e5);
}

/* ---------- the island in 3D (src/ui/garden3d.js, its own chunk with three.js) ----------
   One world for the whole app: Today redraws often, so the same canvas moves into each new card (and into the
   island page) instead of being made again. Orders not yet seen on this device pop up when it first shows them. */
const SEEN = 'ww-island-seen';
let world = null, loading = null;
export function islandState() {
  const mins = Imp.dayMinutes(E.state.hdev), p = Imp.progress(ledger, mins), live = Imp.live(ledger);
  const choice = (E.state.settings.impact && E.state.settings.impact.kind) || 'tree';
  return { planted: live, wilted: idleDays(mins) >= 2, next: ledger ? { kind: Imp.kindFor(choice, live.length + p.waiting), frac: p.frac } : null };
}
/* The rooms of the Club built so far, for drawing it on its lot from outside */
export const clubRooms = () => ROOMS.filter(r => owns(E.state.club, r.id)).map(r => ({ id: r.id, rect: r.rect }));
/* the 3D island's first view: the wild corner and the Club both in sight */
const HOME3D = { cx: -6, cz: 4, yaw: -0.45, pitch: 0.95 };

/* put the 3D island, with the Club on it, into `holder` (whatever is there stays if 3D can't run) */
export function showIsland(holder) {
  if (!show3D()) return;
  const go = () => {
    const st = islandState();
    if (!world) {
      let seen = 0;
      try { seen = Math.min(+localStorage.getItem(SEEN) || 0, st.planted.length); } catch (e) { /* storage blocked */ }
      if (localStorage.getItem(SEEN) === null) seen = Math.max(0, st.planted.length - 1); // first visit: only the newest pops
      const trees = Eco.counts(st.planted).tree;
      world = loading.mountIsland(document.createElement('div'), Object.assign({ seen, rooms: clubRooms(), home: Object.assign({ dist: Math.max(58, Math.min(72, 54 + trees * 0.4)) }, HOME3D) }, st));
    } else { world.island.update(st.planted, st); world.island.setClub(clubRooms()); }
    try { localStorage.setItem(SEEN, String(st.planted.length)); } catch (e) { /* storage blocked */ }
    holder.replaceChildren(world.el);
    world.stage.wake && world.stage.wake();
  };
  if (loading && loading.mountIsland) go();
  else import('./garden3d.js').then(m => { loading = m; if (holder.isConnected || document.contains(holder)) go(); else requestAnimationFrame(() => { if (holder.isConnected) go(); }); }).catch(e => console.error(e));
}
/* the island drawn flat, with the Club on it */
export function flatIsland(o = {}) {
  const st = islandState();
  return IslandFlat(Object.assign({ planted: st.planted, wilted: st.wilted, next: st.next, rooms: clubRooms() }, o));
}
/* "Rabbits move in after 1 more tree." */
export function arrivalLine(planted) {
  const n = Eco.nextArrival(Eco.counts(planted));
  return n ? n.name + (n.name.startsWith('A ') ? ' moves' : ' move') + ' in after ' + Eco.shortWords(n.short) + '.' : 'Every animal the island can hold has moved in.';
}

/* What the island card on Today says about the garden (src/ui/islandcard.js); null until the Action has started
   counting, when it asks for the ledger */
export function gardenInfo() {
  refreshLedger();
  if (!ledger) return null;
  const mins = Imp.dayMinutes(E.state.hdev);
  const p = Imp.progress(ledger, mins), live = Imp.live(ledger), test = live.length > 0 && live.every(x => x.test);
  const choice = (E.state.settings.impact && E.state.settings.impact.kind) || 'tree';
  const nextKind = Imp.kindFor(choice, live.length + p.waiting);
  const idle = idleDays(mins), thirsty = idle >= 2;
  const totals = {};
  live.forEach(x => { totals[x.kind] = (totals[x.kind] || 0) + 1; });
  const summary = Imp.ORDER.filter(k => totals[k]).map(k => Imp.amount(k, totals[k])).join(' · ');
  const next = Imp.KINDS[nextKind];
  const lead = thirsty
    ? 'Your ' + (nextKind === 'bottles' ? 'next haul' : 'sapling') + ' is thirsty: ' + (idle >= 99 ? 'it hasn\'t had any practice yet' : 'no practice for ' + idle + ' days') + '. A few minutes will perk it up.'
    : fmtMin(Math.ceil(p.toNext)) + ' more practice and ' + (nextKind === 'bottles' ? 'ten more bottles are collected' : 'a real ' + (nextKind === 'kelp' ? 'kelp plant goes into the sea' : 'tree goes into the ground')) + ' in ' + next.where + '.';
  const rs = Eco.residents(Eco.counts(live), { wilted: thirsty });
  return {
    frac: p.frac, summary, lead,
    animals: (rs.length ? rs.length + ' kind' + (rs.length === 1 ? '' : 's') + ' of animal live there. ' : '') + arrivalLine(live),
    waiting: p.waiting ? (p.waiting === 1 ? 'One more is earned and will be ordered at the next daily run.' : p.waiting + ' more are earned and will be ordered at the next daily runs.') : '',
    test: test ? 'Test mode: these are pretend orders, nothing is planted or paid yet. Put your live GoodAPI key in the repository to make them real.' : '',
    start: 'Every ' + Imp.HOURS + ' hours you practise, on any device, plants one. Counting began ' + ledger.start + '.',
    dashboard: ledger.dashboard && /^https:\/\//.test(ledger.dashboard) ? ledger.dashboard : ''
  };
}

/* The island page: the same world, bigger, with who lives there */
tool('island', {
  tab: 'today', skill: null, title: 'Your island', eyebrow: 'Real trees from your practice',
  desc: 'Every 10 hours you practise plants a real tree, a kelp plant or collects ten plastic bottles, and each one appears here. As the island grows, animals move in. Drag to turn it, pinch or scroll to zoom, double-tap to come back.',
  render(body) {
    const holder = h('div', { class: 'gd-3d gd-3d-big' }, flatIsland({ big: true, onClub: () => openTool('club', { returnTab: 'today' }) }));
    const st = islandState(), live = st.planted, c = Eco.counts(live);
    const rs = Eco.residents(c, { wilted: st.wilted });
    const who = h('div', { class: 'chips' }, rs.map(r => h('span', { class: 'chip' + (r.hiding ? ' muted' : ''), text: r.name + (r.n > 1 && !r.name.startsWith('A ') ? ' × ' + r.n : '') + (r.hiding ? ' (hiding)' : '') })));
    body.append(holder, h('div', { class: 'card stack' },
      h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'On the island' }), h('span', { class: 'mono small', text: Imp.ORDER.filter(k => c[k]).map(k => Imp.amount(k, c[k])).join(' · ') || 'Nothing planted yet' })),
      rs.length ? who : h('p', { class: 'small muted', text: 'No animals yet.' }),
      h('p', { class: 'small', text: arrivalLine(live) }),
      st.wilted ? h('p', { class: 'small callout', text: 'The island is dry: no practice for two days or more, and the shy animals are hiding. A few minutes of practice brings them back.' }) : null,
      c.tree < 10 ? h('p', { class: 'small muted', text: 'At ten trees the wood holds enough rain for a pond.' }) : null,
      ledger ? null : h('p', { class: 'small muted', text: 'Real trees, kelp and bottles start with the first daily run: see Settings → Real impact for your practice.' })));
    showIsland(holder);
    return () => { if (world && holder.contains(world.el)) holder.replaceChildren(); };
  }
});

/* Settings → Real impact: what the hours become, and how it stands */
export function impactSettingsCard() {
  const card = h('div', { class: 'card stack' });
  function draw() {
    card.innerHTML = '';
    const choice = (E.state.settings.impact && E.state.settings.impact.kind) || 'tree';
    card.append(h('h3', { text: 'Real impact for your practice' }),
      h('p', { class: 'small', text: 'Every ' + Imp.HOURS + ' hours you practise can plant a real tree, a kelp plant, or collect ten plastic bottles, paid through GoodAPI from your own account by a daily GitHub Action. The island on Today shows each one.' }),
      h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Every 10 hours becomes' }),
        h('div', { class: 'chips presets' }, Imp.CHOICES.map(([v, label]) => h('button', { class: 'chip', 'aria-pressed': choice === v ? 'true' : 'false', onclick: () => { E.setSetting('impact', { kind: v }); draw(); } }, label))),
        h('span', { class: 'small muted', text: 'A tree in Kilifi, Kenya or kelp off British Columbia is about $0.43; ten ocean-bound bottles about $0.50. Take turns goes tree, kelp, bottles.' })));
    const st = ghStatus();
    if (!st.on) card.append(h('p', { class: 'small callout', text: 'This needs automatic GitHub sync (above), since the Action reads your hours from your sync repository.' }));
    else if (!ledger) card.append(h('p', { class: 'small muted', text: 'Not started yet. Setting it up takes a GoodAPI key and two repository settings: see "Real impact for your practice" in the app\'s README on GitHub. Hours count from the Action\'s first run.' }));
    else {
      const live = Imp.live(ledger);
      card.append(h('p', { class: 'small muted', text: (live.length ? live.length + ' ordered' : 'Nothing ordered yet') + (live.length && live.every(x => x.test) ? ' in test mode' : '') + '. Counting since ' + ledger.start + (ledger.ran ? '; last run ' + String(ledger.ran).slice(0, 10) : '') + '.' }));
    }
  }
  draw();
  return card;
}
