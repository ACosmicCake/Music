/* World Woodshed — your garden on Today: every 10 hours practised becomes a real tree, kelp plant or ten
   plastic bottles collected (the rules in src/impact.js; the daily GitHub Action orders them and keeps the
   ledger in your sync repository). This reads the ledger after a sync round, keeps a copy on the device
   (localStorage 'ww-impact') and draws one plant per order, with a sapling growing toward the next one that
   wilts when you haven't played for a couple of days. Settings → Real impact picks what the hours become. */
import E from '../engine.js';
import Imp from '../impact.js';
import { h, s, bar, tool, openTool } from './core.js';
import Eco from '../ecosystem.js';
import { fmtMin } from '../routines.js';
import { repoCall, repoDir, onSynced, status as ghStatus } from '../ghsync.js';

const CACHE = 'ww-impact';
const EVERY_MS = 30 * 60 * 1000; // read the ledger at most this often (the Action writes it once a day)
let ledger = load(), lastRead = 0, reading = null, shownCard = null;
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
          // the card on screen draws itself again; anything else listening hears of it
          if (shownCard && shownCard.isConnected) { const fresh = gardenCard(); if (fresh) shownCard.replaceWith(fresh); }
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

/* ---------- drawing (all original, in code) ---------- */
const W = 30, H = 44;
function treeSvg(test) {
  return s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'gd-plant gd-tree' + (test ? ' gd-test' : ''), 'aria-hidden': 'true' },
    s('path', { d: 'M15 42 L15 24', class: 'gd-trunk' }),
    s('path', { d: 'M15 31 L10 26 M15 28 L20 23', class: 'gd-trunk thin' }),
    s('circle', { cx: 15, cy: 15, r: 10, class: 'gd-leaf' }),
    s('circle', { cx: 9, cy: 20, r: 6, class: 'gd-leaf' }),
    s('circle', { cx: 21, cy: 19, r: 6.5, class: 'gd-leaf' }));
}
function kelpSvg(test) {
  return s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'gd-plant gd-kelp' + (test ? ' gd-test' : ''), 'aria-hidden': 'true' },
    s('path', { d: 'M3 38 Q15 35 27 38 L27 44 L3 44 Z', class: 'gd-water' }),
    s('path', { d: 'M12 42 C8 34 16 28 11 20 C7 14 13 8 11 3', class: 'gd-frond' }),
    s('path', { d: 'M17 42 C21 35 14 29 19 22 C22 17 17 12 19 7', class: 'gd-frond' }),
    s('ellipse', { cx: 13, cy: 17, rx: 3, ry: 1.6, class: 'gd-float' }),
    s('ellipse', { cx: 19, cy: 24, rx: 3, ry: 1.6, class: 'gd-float' }));
}
function bottlesSvg(test) {
  const one = (x, tilt) => s('g', { transform: 'translate(' + x + ' 14) rotate(' + tilt + ' 5 15)' },
    s('rect', { x: 3.5, y: 0, width: 3, height: 4, rx: 1, class: 'gd-cap' }),
    s('path', { d: 'M3 4 L7 4 L7 7 C10 9 10 10 10 12 L10 27 Q10 29 8 29 L2 29 Q0 29 0 27 L0 12 C0 10 0 9 3 7 Z', class: 'gd-bottle' }));
  return s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'gd-plant gd-bottles' + (test ? ' gd-test' : ''), 'aria-hidden': 'true' },
    one(3, -8), one(16, 6), s('path', { d: 'M2 43 L28 43', class: 'gd-ground' }));
}
const DRAW = { tree: treeSvg, kelp: kelpSvg, bottles: bottlesSvg };

/* The one growing now: a stem as tall as the hours so far, a leaf per hour; drooping and brown when thirsty */
function saplingSvg(frac, thirsty) {
  const top = 42 - Math.max(4, Math.round(frac * 30));
  const leaves = [];
  const n = Math.min(9, Math.floor(frac * 10));
  for (let i = 0; i < n; i++) {
    const y = 40 - (i + 1) * ((42 - top) / (n + 1)), side = i % 2 ? 1 : -1, droop = thirsty ? 5 : -3;
    leaves.push(s('path', { d: 'M15 ' + y.toFixed(1) + ' q' + (side * 5) + ' ' + droop + ' ' + (side * 9) + ' ' + (droop + 1), class: 'gd-sprout-leaf' }));
  }
  return s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'gd-plant gd-sapling' + (thirsty ? ' gd-thirsty' : ''), 'aria-hidden': 'true' },
    s('path', { d: 'M6 43 L24 43', class: 'gd-ground' }),
    s('path', { d: thirsty ? 'M15 42 Q15 ' + (top + 6) + ' ' + (15 + 4) + ' ' + (top + 2) : 'M15 42 L15 ' + top, class: 'gd-stem' }),
    leaves);
}

/* days since the last practice (0 = today) */
function idleDays(mins) {
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
const canGL = () => { try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } };
/* Settings → Display → 3D scenes (per device, shared with the club): off draws the flat row and never loads three.js */
const use3D = () => E.state.settings.scenes3d !== false && canGL();
function islandState() {
  const mins = Imp.dayMinutes(E.state.hdev), p = Imp.progress(ledger, mins), live = Imp.live(ledger);
  const choice = (E.state.settings.impact && E.state.settings.impact.kind) || 'tree';
  return { planted: live, wilted: idleDays(mins) >= 2, next: { kind: Imp.kindFor(choice, live.length + p.waiting), frac: p.frac } };
}
/* put the island into `holder` (a stand-in stays there if 3D can't run) */
function showIsland(holder) {
  if (!ledger || !use3D()) return;
  const go = () => {
    const st = islandState();
    if (!world) {
      let seen = 0;
      try { seen = Math.min(+localStorage.getItem(SEEN) || 0, st.planted.length); } catch (e) { /* storage blocked */ }
      if (localStorage.getItem(SEEN) === null) seen = Math.max(0, st.planted.length - 1); // first visit: only the newest pops
      world = loading.mountIsland(document.createElement('div'), Object.assign({ seen }, st));
    } else world.island.update(st.planted, st);
    try { localStorage.setItem(SEEN, String(st.planted.length)); } catch (e) { /* storage blocked */ }
    holder.replaceChildren(world.el);
    world.stage.wake && world.stage.wake();
  };
  if (loading && loading.mountIsland) go();
  else import('./garden3d.js').then(m => { loading = m; if (holder.isConnected || document.contains(holder)) go(); else requestAnimationFrame(() => { if (holder.isConnected) go(); }); }).catch(e => console.error(e));
}
/* "Rabbits move in after 1 more tree." */
function arrivalLine(planted) {
  const n = Eco.nextArrival(Eco.counts(planted));
  return n ? n.name + (n.name.startsWith('A ') ? ' moves' : ' move') + ' in after ' + Eco.shortWords(n.short) + '.' : 'Every animal the island can hold has moved in.';
}

/* Today's card (hidden until the Action has started counting) */
export function gardenCard() {
  // until the Action has started counting: an empty stand-in, replaced if the ledger turns up
  if (!ledger) { shownCard = h('div', { class: 'garden-card', hidden: true }); refreshLedger(); return shownCard; }
  const card = h('div', { class: 'card garden-card' });
  shownCard = card;
  refreshLedger();
  const mins = Imp.dayMinutes(E.state.hdev);
  const p = Imp.progress(ledger, mins), live = Imp.live(ledger), test = live.length > 0 && live.every(x => x.test);
  const choice = (E.state.settings.impact && E.state.settings.impact.kind) || 'tree';
  const nextKind = Imp.kindFor(choice, live.length + p.waiting);
  const idle = idleDays(mins), thirsty = idle >= 2;
  const totals = {};
  live.forEach(x => { totals[x.kind] = (totals[x.kind] || 0) + 1; });
  const summary = Imp.ORDER.filter(k => totals[k]).map(k => Imp.amount(k, totals[k])).join(' · ');

  const row = h('div', { class: 'gd-row', role: 'img', 'aria-label': (summary || 'Nothing planted yet') + '; the next one is ' + Math.round(p.frac * 100) + '% grown' });
  const shown = live.slice(-23);
  if (live.length > shown.length) row.append(h('span', { class: 'gd-more mono small', text: '+' + (live.length - shown.length) }));
  shown.forEach(x => row.append(h('span', { class: 'gd-slot', title: Imp.amount(x.kind, 1) + (x.project ? ', ' + x.project : '') + ', ' + String(x.at).slice(0, 10) }, (DRAW[x.kind] || treeSvg)(x.test))));
  for (let i = 0; i < p.waiting; i++) row.append(h('span', { class: 'gd-slot gd-waiting', title: 'Earned, ordered at the next daily run' }, (DRAW[Imp.kindFor(choice, live.length + i)] || treeSvg)(true)));
  row.append(h('span', { class: 'gd-slot gd-next' }, saplingSvg(p.frac, thirsty)));

  const next = Imp.KINDS[nextKind];
  const lead = thirsty
    ? 'Your ' + (nextKind === 'bottles' ? 'next haul' : 'sapling') + ' is thirsty: ' + (idle >= 99 ? 'it hasn\'t had any practice yet' : 'no practice for ' + idle + ' days') + '. A few minutes will perk it up.'
    : fmtMin(Math.ceil(p.toNext)) + ' more practice and ' + (nextKind === 'bottles' ? 'ten more bottles are collected' : 'a real ' + (nextKind === 'kelp' ? 'kelp plant goes into the sea' : 'tree goes into the ground')) + ' in ' + next.where + '.';
  const holder = h('div', { class: 'gd-3d' }, row);
  const rs = Eco.residents(Eco.counts(live), { wilted: thirsty });
  card.append(
    h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Your garden' }), h('span', { class: 'mono small', text: summary || 'Growing your first' })),
    holder,
    bar(100 * p.frac, 'good'),
    h('p', { class: 'small', text: lead }),
    h('p', { class: 'small muted', text: (rs.length ? rs.length + ' kind' + (rs.length === 1 ? '' : 's') + ' of animal live there. ' : '') + arrivalLine(live) }));
  showIsland(holder);
  if (p.waiting) card.append(h('p', { class: 'small muted', text: p.waiting === 1 ? 'One more is earned and will be ordered at the next daily run.' : p.waiting + ' more are earned and will be ordered at the next daily runs.' }));
  if (test) card.append(h('p', { class: 'small muted', text: 'Test mode: these are pretend orders, nothing is planted or paid yet. Put your live GoodAPI key in the repository to make them real.' }));
  const links = h('div', { class: 'row' });
  if (use3D()) links.append(h('button', { class: 'btn small brass', onclick: () => openTool('island', { returnTab: 'today' }) }, 'Explore the island'));
  if (ledger.dashboard && /^https:\/\//.test(ledger.dashboard)) links.append(h('a', { class: 'btn small ghost', href: ledger.dashboard, target: '_blank', rel: 'noopener' }, 'See them on GoodAPI ↗'));
  card.append(h('p', { class: 'small muted', text: 'Every ' + Imp.HOURS + ' hours you practise, on any device, plants one. Counting began ' + ledger.start + '.' }));
  if (links.children.length) card.append(links);
  return card;
}

/* The island page: the same world, bigger, with who lives there */
tool('island', {
  tab: 'today', skill: null, title: 'Your island', eyebrow: 'Real trees from your practice',
  desc: 'Every 10 hours you practise plants a real tree, a kelp plant or collects ten plastic bottles, and each one appears here. As the island grows, animals move in. Drag to turn it, pinch or scroll to zoom, double-tap to come back.',
  render(body) {
    if (!ledger) { body.append(h('div', { class: 'card' }, h('p', { text: 'Your island starts with the first daily run. See Settings → Real impact for your practice.' }))); return; }
    const holder = h('div', { class: 'gd-3d gd-3d-big' });
    const st = islandState(), live = st.planted, c = Eco.counts(live);
    const rs = Eco.residents(c, { wilted: st.wilted });
    const who = h('div', { class: 'chips' }, rs.map(r => h('span', { class: 'chip' + (r.hiding ? ' muted' : ''), text: r.name + (r.n > 1 && !r.name.startsWith('A ') ? ' × ' + r.n : '') + (r.hiding ? ' (hiding)' : '') })));
    body.append(holder, h('div', { class: 'card stack' },
      h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'On the island' }), h('span', { class: 'mono small', text: Imp.ORDER.filter(k => c[k]).map(k => Imp.amount(k, c[k])).join(' · ') || 'Nothing planted yet' })),
      rs.length ? who : h('p', { class: 'small muted', text: 'No animals yet.' }),
      h('p', { class: 'small', text: arrivalLine(live) }),
      st.wilted ? h('p', { class: 'small callout', text: 'The island is dry: no practice for two days or more, and the shy animals are hiding. A few minutes of practice brings them back.' }) : null,
      c.tree < 10 ? h('p', { class: 'small muted', text: 'At ten trees the wood holds enough rain for a pond.' }) : null));
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
      h('p', { class: 'small', text: 'Every ' + Imp.HOURS + ' hours you practise can plant a real tree, a kelp plant, or collect ten plastic bottles, paid through GoodAPI from your own account by a daily GitHub Action. Your garden on Today shows each one.' }),
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
