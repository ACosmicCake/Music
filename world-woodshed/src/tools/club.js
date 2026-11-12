/* World Woodshed — the Club page (Train → Games) and its small card on Today. A café, restaurant, jazz bar and
   community centre full of plants that grows only with practice: the rules are in src/club.js, the drawing in
   src/ui/clubscene.js. Looking at the club is not practice, so the tool counts no time (noTime). */
import D from '../data.js';
import E from '../engine.js';
import { h, tool, openTool, toast, bar, TOOLS } from '../ui/core.js';
import C from '../club.js';
import { Scene } from '../ui/clubscene.js';
import { plantings, onLedger } from '../ui/garden.js';
import './club.css';

export const DEFAULT_NAME = 'The Greenhouse';
const nameOf = () => String((E.state.settings || {}).clubName || '').trim().slice(0, 40) || DEFAULT_NAME;
const SEEN = 'ww-club-seen'; // this device: the night last shown, so a show plays when there is something new

/* The 3D club (src/ui/club3d.js, three.js) is its own chunk, loaded the first time the club opens; null
   where WebGL isn't there, and the flat drawing stays */
let mod3d = null;
function load3d() {
  if (!mod3d) mod3d = import('../ui/club3d.js').then(m => (m.webglOK() ? m : null)).catch(() => null);
  return mod3d;
}
/* A picture of the 3D club for the Today card, kept on this device only */
const SHOT = 'ww-club-shot';
function saveShot(url) { if (url && url.length < 200000) try { localStorage.setItem(SHOT, url); } catch (e) { /* full */ } }
const savedShot = () => { try { return localStorage.getItem(SHOT); } catch (e) { return null; } };

/* The club in the state, opened now if it isn't there yet (practice from before never counts) */
export function ensureClub() {
  const st = E.state;
  const c = C.clean(st.club);
  if (c) { st.club = c; return c; }
  const tiers = {};
  Object.keys(E.SKILLS).forEach(k => { try { tiers[k] = E.unlockedTier(k); } catch (e) { tiers[k] = 1; } });
  st.club = C.openClub(st.history, tiers);
  E.touch();
  return st.club;
}

/* What the rules need from the rest of the app */
function context() {
  const items = ((E.state.cur || {}).items) || {};
  const tunes = Object.entries(items).filter(([k]) => k.startsWith('tune:')).map(([k, it]) => {
    const id = k.slice(5), t = D.TUNES.find(x => x.id === id) || E.getTune(id);
    return { id, name: t ? t.name : id, s: it.s || 0, last: it.last || 0 };
  });
  const pieces = E.listLibrary().filter(e => e.status === 'learned').map(e => ({ id: e.id, title: e.title, learned: e.learned || 0 }));
  const tiers = {};
  Object.keys(E.SKILLS).forEach(k => { try { tiers[k] = E.unlockedTier(k); } catch (e) { /* a skill with no items yet */ } });
  let plants = [];
  try { plants = plantings(); } catch (e) { /* no ledger */ }
  return { tunes, pieces, tiers, lessons: E.state.lessons || {}, games: E.state.games || {}, plants: plants.filter(p => !p.test).length, plantList: plants };
}

/* Everything one screen shows, with the nights brought up to date */
function model() {
  const club = ensureClub(), ctx = context();
  if (C.settle(club, E.state.history, ctx)) E.touch();
  const st = C.stats(club, ctx), rep = C.reputation(club, ctx, st), tot = C.totals(club);
  const today = club.nights[C.dayKey()] || null;
  const last = Object.keys(club.nights).filter(k => club.nights[k].crowd > 0).sort().pop();
  return { club, ctx, st, rep, tot, today, last: last ? Object.assign({ day: last }, club.nights[last]) : null, money: C.balance(club), regulars: C.regulars(club, st) };
}
const sceneModel = (m, guests) => ({ club: m.club, band: m.st.members, plants: m.ctx.plantList, guests });

const fmt = n => Math.round(n).toLocaleString();

/* A number that counts up to its new value */
function counter(el, from, to, ms = 1400) {
  if (from === to || matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt(to); return; }
  const t0 = performance.now();
  const step = now => { const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(from + (to - from) * e); if (k < 1 && el.isConnected) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

/* ---------- the Today card and the Games banner ---------- */
export function clubCard({ where = 'today' } = {}) {
  let m;
  try { m = model(); } catch (e) { console.error(e); return ''; }
  const shot = savedShot();
  let pic;
  if (shot) pic = h('img', { src: shot, alt: 'Your club', class: 'cl-shot' });
  else { const scene = Scene({ small: true }); scene.draw(sceneModel(m, (m.today || {}).crowd || 0)); pic = scene.el; }
  const n = m.today;
  const line = n && n.crowd > 0 ? n.crowd + ' guest' + (n.crowd === 1 ? '' : 's') + ' tonight and ' + fmt(n.t) + ' tips.'
    : n && n.m > 0 ? 'The doors open at ' + C.OPEN_MIN + ' minutes; you\'re at ' + Math.floor(n.m) + '.'
      : 'The doors open when you practise. ' + C.OPEN_MIN + ' minutes and the first guests come in.';
  const goal = C.nextGoal(m.club, m.rep.total);
  const goalLine = goal ? (goal.ready ? 'You can build ' + goal.item.name.replace(/^The /, 'the ') + ' now.' : 'Next: ' + goal.item.name.replace(/^The /, 'the ') + ', ' + (goal.item.need > m.rep.total ? (goal.item.need - m.rep.total) + ' ★ to go' : fmt(goal.item.cost - m.money) + ' tips to go') + '.') : '';
  return h('button', { class: 'card cl-card' + (where === 'games' ? ' cl-banner' : ''), onclick: () => openTool('club', { returnTab: where === 'games' ? 'train' : 'today' }) },
    h('div', { class: 'cl-card-scene' }, pic),
    h('div', { class: 'stack cl-card-text' },
      h('span', { class: 'eyebrow', text: where === 'games' ? 'Your club · the game you play by practising' : 'Your club' }),
      h('b', { class: 'cl-card-name', text: nameOf() }),
      h('span', { class: 'small', text: line }),
      h('span', { class: 'small muted', text: '🪙 ' + fmt(m.money) + ' · ★ ' + m.rep.total + (goalLine ? ' · ' + goalLine : '') })));
}

/* ---------- the page ---------- */
tool('club', {
  tab: 'train', title: 'Your club', eyebrow: 'Game · Every kind of practice', noTime: true,
  desc: 'A little café that grows into a restaurant, a jazz bar and a community centre full of plants. Practice is the only way forward: minutes bring guests and tips, progress brings reputation and band members, learned tunes go on the set list.',
  meter: () => { try { return '★ ' + model().rep.total; } catch (e) { return ''; } },
  render(body) {
    let m = model(), tab = 'build', openRoom = null, alive = true;
    const onRoom = id => { tab = 'build'; openRoom = id; drawTabs(); drawPanel(); const el = panel.querySelector(`[data-room-card="${id}"]`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    // the flat drawing first (and for good without WebGL), the 3D club as soon as its chunk has loaded
    let scene = Scene({ onRoom });
    scene.setItemRoom(id => (C.itemOf(id) || {}).room);
    const wrap = h('div', { class: 'cl-wrap' }, scene.el);
    const hint = h('p', { class: 'small muted cl-hint', hidden: true, text: 'Drag to turn, pinch or scroll to zoom, double-tap to look at the whole club, tap a room or plot to see what goes there.' });
    const ready = load3d().then(mod => {
      if (!alive || !mod) return;
      const s3 = mod.Club3D({ onRoom, onBuild: ev => { if (ev.type === 'ghost') bstate = { mode: 'ghost', g: ev }; else bstate = ev.uid ? { mode: 'picked', uid: ev.uid } : { mode: 'browse' }; drawBuildBar(); } });
      scene.stop(); scene = s3;
      wrap.classList.add('is3d'); wrap.replaceChildren(s3.el); hint.hidden = false; buildBtn.hidden = false;
      s3.draw(sceneModel(m, (m.today || {}).crowd || 0));
      setTimeout(() => { if (alive) saveShot(s3.snapshot()); }, 2500);
    }).catch(e => console.error(e));
    const nameEl = h('h2', { class: 'cl-name', text: nameOf() });
    const rename = h('button', { class: 'btn ghost small', 'aria-label': 'Rename the club', onclick: () => renameBox() }, '✎');
    const nameRow = h('div', { class: 'row cl-namerow' }, nameEl, rename);
    const chip = (icon, label) => { const v = h('b', { class: 'mono' }); return { el: h('div', { class: 'cl-chip' }, h('span', { class: 'cl-chip-i', text: icon, 'aria-hidden': 'true' }), v, h('span', { class: 'small muted', text: label })), v }; };
    const cTips = chip('🪙', 'tips'), cRep = chip('★', 'reputation'), cGuests = chip('👥', 'tonight'), cSet = chip('♫', 'set list');
    const chips = h('div', { class: 'cl-chips' }, cTips.el, cRep.el, cGuests.el, cSet.el);
    const tonight = h('p', { class: 'cl-tonight' });
    const showBtn = h('button', { class: 'btn brass', onclick: () => playShow(m.today && m.today.crowd > 0 ? m.today : m.last, true) }, '▶ Watch the show');
    const goalBox = h('div', { class: 'cl-goal' });
    const tabs = h('div', { class: 'seg big wrap cl-tabs', role: 'group', 'aria-label': 'Club pages' });
    const panel = h('div', { class: 'stack cl-panel' });
    /* build mode (3D only): a catalogue to pick from, a ghost to place, pieces to move, turn and sell */
    let building = false, bstate = { mode: 'browse' }, bcat = 'seat';
    const buildBtn = h('button', { class: 'btn small cl-build-btn', hidden: true, 'aria-pressed': 'false', onclick: () => setBuilding(!building) }, '🛠 Build mode');
    const buildBar = h('div', { class: 'cl-bb', hidden: true });
    function setBuilding(on) {
      building = on; buildBtn.setAttribute('aria-pressed', String(on)); buildBtn.textContent = on ? '✓ Done building' : '🛠 Build mode';
      wrap.classList.toggle('building', on);
      page.classList.toggle('cl-building', on);
      if (on && scene.stop) { scene.stop(); showBtn.disabled = false; }
      if (scene.build) scene.build.on(on);
      if (scene.home) scene.home();
      bstate = { mode: 'browse' }; buildBar.hidden = !on; hint.hidden = on;
      if (on) { drawBuildBar(); requestAnimationFrame(() => wrap.scrollIntoView({ behavior: 'smooth', block: 'start' })); }
    }
    const page = h('div', { class: 'stack cl-page' });
    body.append(page);
    page.append(h('div', { class: 'cl-stagebox' }, wrap, h('div', { class: 'cl-stagebtns' }, buildBtn)), buildBar, hint, nameRow, chips, tonight, h('div', { class: 'row' }, showBtn), goalBox, tabs, panel);

    const CAT_ICON = { seat: '🪑', table: '☕', plant: '🌿', light: '💡', music: '🎹', decor: '🖼', kitchen: '🍰' };
    function pieceWords(it) {
      const w = [];
      if (it.seats) w.push(it.seats + ' seat' + (it.seats === 1 ? '' : 's'));
      const e = effectWords(Object.assign({}, it.fx, { seats: 0 }));
      if (e) w.push(e);
      return w.join(' · ');
    }
    function drawBuildBar() {
      if (!building) return;
      buildBar.textContent = '';
      const sb = scene.build;
      if (bstate.mode === 'ghost') {
        const g = bstate.g, it = C.itemOf(g.k), moving = !!g.uid, can = moving ? { ok: true } : C.canPlace(m.club, g.k, m.money);
        const ok = g.ok && can.ok;
        buildBar.append(h('div', { class: 'cl-bb-head' }, h('b', { text: (moving ? 'Moving: ' : '') + it.name }), h('span', { class: 'small ' + (ok ? 'cl-ok' : 'cl-no'), text: !can.ok ? can.why : g.ok ? '✓ Fits here' : g.why })),
          h('p', { class: 'small muted', text: 'Tap the floor where it should go' + (matchMedia('(hover: hover)').matches ? ' (or move the mouse there)' : '') + '. R turns it, Enter puts it down.' }),
          h('div', { class: 'row cl-bb-btns' },
            h('button', { class: 'btn small', onclick: () => sb.turn() }, '⟳ Turn'),
            h('button', { class: 'btn small brass', disabled: !ok, onclick: confirmGhost }, moving ? '✓ Put it here' : '✓ Buy · ' + fmt(it.cost)),
            h('button', { class: 'btn small ghost', onclick: () => { sb.end(); bstate = { mode: 'browse' }; drawBuildBar(); } }, '✕ Cancel')));
        return;
      }
      if (bstate.mode === 'picked') {
        const p = m.club.placed[bstate.uid];
        if (!p || p.gone) { bstate = { mode: 'browse' }; drawBuildBar(); return; }
        const it = C.itemOf(p.k), refund = p.f ? 0 : it.cost;
        buildBar.append(h('div', { class: 'cl-bb-head' }, h('b', { text: it.name }), h('span', { class: 'small muted', text: pieceWords(it) })),
          h('div', { class: 'row cl-bb-btns' },
            h('button', { class: 'btn small brass', onclick: () => sb.ghost(p.k, p.x, p.z, p.r, bstate.uid) }, '✥ Move'),
            h('button', { class: 'btn small', onclick: () => turnPicked(bstate.uid) }, '⟳ Turn'),
            h('button', { class: 'btn small ghost', onclick: () => sellPicked(bstate.uid) }, refund ? 'Sell · +' + fmt(refund) : 'Take away'),
            h('button', { class: 'btn small ghost', onclick: () => { sb.pick(null); bstate = { mode: 'browse' }; drawBuildBar(); } }, '✕')));
        return;
      }
      const cats = h('div', { class: 'seg cl-bb-cats', role: 'group', 'aria-label': 'Kinds of piece' });
      C.CATS.forEach(([id, label]) => cats.append(h('button', { 'aria-pressed': String(bcat === id), onclick: () => { bcat = id; drawBuildBar(); } }, CAT_ICON[id] + ' ' + label)));
      const strip = h('div', { class: 'cl-bb-strip' });
      C.CATALOG.filter(x => x.cat === bcat).forEach(it => {
        const can = C.canPlace(m.club, it.id, m.money);
        strip.append(h('button', { class: 'cl-bb-card' + (can.ok ? '' : ' off'), disabled: !can.ok && !/tips/.test(can.why) ? true : null, onclick: () => startPlace(it.id), 'aria-label': it.name + ', ' + it.cost + ' tips' },
          h('span', { class: 'cl-bb-ico', 'aria-hidden': 'true', text: CAT_ICON[it.cat] }),
          h('b', { class: 'small', text: it.name }),
          h('span', { class: 'small mono', text: '🪙 ' + fmt(it.cost) }),
          h('span', { class: 'small muted', text: can.ok ? pieceWords(it) || 'Just for looks' : can.why })));
      });
      buildBar.append(h('div', { class: 'cl-bb-head' }, h('b', { text: 'Build' }), h('span', { class: 'small muted', text: '🪙 ' + fmt(m.money) + ' to spend · tap a piece in the club to move, turn or sell it' })), cats, strip,
        h('p', { class: 'small muted', text: 'Seats add up for every piece; other effects count once for each kind. Selling gives the whole price back, so try things out.' }));
    }
    function startPlace(k) {
      const can = C.canPlace(m.club, k, m.money);
      if (!can.ok) { toast(can.why); return; }
      const c = scene.centre(), roomHere = (C.ROOMS.find(r => C.owns(m.club, r.id) && c.x >= r.rect[0] && c.x <= r.rect[2] && c.z >= r.rect[1] && c.z <= r.rect[3]) || {}).id;
      const at = C.freeSpot(m.club, k, roomHere || C.itemOf(k).room || 'cafe') || { x: Math.round(c.x / C.CELL), z: Math.round(c.z / C.CELL), r: 0 };
      const g = scene.build.ghost(k, at.x, at.z, at.r), f = C.footprint(k, g.x, g.z, g.r);
      scene.focus((f[0] + f[2]) / 2 * C.CELL, (f[1] + f[3]) / 2 * C.CELL);
    }
    function confirmGhost() {
      const g = scene.build.state;
      if (!g) return;
      const r = g.uid ? C.move(m.club, g.uid, g.x, g.z, g.r) : C.place(m.club, g.k, g.x, g.z, g.r);
      if (!r.ok) { toast(r.why); return; }
      E.touch();
      scene.build.end();
      bstate = { mode: 'browse' };
      refresh();
      scene.celebrate(g.uid || r.uid);
      if (!g.uid) toast('Added ' + C.itemOf(g.k).name.toLowerCase().replace(/^(?=[aeiou])/, '') + '. ' + pieceWords(C.itemOf(g.k)));
      drawBuildBar();
    }
    function turnPicked(uid) {
      const p = m.club.placed[uid], it = C.itemOf(p.k), f = C.footprint(p.k, p.x, p.z, p.r), r2 = (p.r + 1) % 4;
      const w = r2 % 2 ? it.d : it.w, d = r2 % 2 ? it.w : it.d;
      const r = C.move(m.club, uid, Math.round((f[0] + f[2] - w) / 2), Math.round((f[1] + f[3] - d) / 2), r2);
      if (!r.ok) { toast('It can\'t turn here: ' + r.why.toLowerCase() + '. Move it first.'); return; }
      E.touch(); refresh(); scene.build.pick(uid); drawBuildBar();
    }
    function sellPicked(uid) {
      const r = C.sell(m.club, uid);
      if (!r.ok) return;
      E.touch(); bstate = { mode: 'browse' }; refresh(); drawBuildBar();
      toast(r.refund ? '+' + fmt(r.refund) + ' tips back' : 'Taken away');
    }
    const onKey = e => {
      if (!building || e.target.closest('input, textarea, select') || document.querySelector('dialog[open]')) return;
      const sb = scene.build;
      if (bstate.mode === 'ghost') {
        if (e.key === 'r' || e.key === 'R') { sb.turn(); e.preventDefault(); } else if (e.key === 'Enter') { confirmGhost(); e.preventDefault(); } else if (e.key === 'Escape') { sb.end(); bstate = { mode: 'browse' }; drawBuildBar(); e.preventDefault(); e.stopPropagation(); }
      } else if (bstate.mode === 'picked') {
        if (e.key === 'r' || e.key === 'R') { turnPicked(bstate.uid); e.preventDefault(); } else if (e.key === 'm' || e.key === 'M') { const p = m.club.placed[bstate.uid]; sb.ghost(p.k, p.x, p.z, p.r, bstate.uid); e.preventDefault(); } else if (e.key === 'Delete' || e.key === 'Backspace') { sellPicked(bstate.uid); e.preventDefault(); } else if (e.key === 'Escape') { sb.pick(null); bstate = { mode: 'browse' }; drawBuildBar(); e.preventDefault(); e.stopPropagation(); }
      }
    };
    document.addEventListener('keydown', onKey, true);

    function refresh(keepScene) {
      m = model();
      if (!keepScene) scene.draw(sceneModel(m, (m.today || {}).crowd || 0));
      if (!keepScene && scene.snapshot) setTimeout(() => { if (alive && scene.snapshot) saveShot(scene.snapshot()); }, 1500);
      nameEl.textContent = nameOf();
      cTips.v.textContent = fmt(m.money); cRep.v.textContent = fmt(m.rep.total);
      cGuests.v.textContent = ((m.today || {}).crowd || 0) + ' / ' + m.st.seats; cSet.v.textContent = m.st.onStage + ' / ' + m.st.slots;
      const n = m.today;
      tonight.textContent = n && n.crowd > 0 ? 'Tonight ' + n.crowd + ' guest' + (n.crowd === 1 ? '' : 's') + ' came for ' + Math.floor(n.m) + ' minutes of practice and left ' + fmt(n.t) + ' tips.' + (n.crowd >= m.st.seats ? ' Every seat was taken: more rooms or seats bring more.' : '')
        : n && n.m > 0 ? 'The doors open at ' + C.OPEN_MIN + ' minutes of practice today. You\'re at ' + Math.floor(n.m) + '.'
          : 'The club is quiet until you practise today. ' + C.OPEN_MIN + ' minutes opens the doors; every minute after brings more guests and tips.';
      showBtn.hidden = !(m.today && m.today.crowd > 0) && !m.last;
      showBtn.textContent = m.today && m.today.crowd > 0 ? '▶ Watch tonight\'s show' : '▶ Watch the last show';
      goalBox.textContent = '';
      const g = C.nextGoal(m.club, m.rep.total);
      if (g) {
        const it = g.item, needRep = it.need > m.rep.total;
        const pct = g.ready ? 100 : needRep ? 100 * m.rep.total / it.need : 100 * m.money / it.cost;
        goalBox.append(h('div', { class: 'spread' }, h('span', { class: 'small' }, h('b', { text: g.ready ? 'Ready to build: ' : 'Next goal: ' }), it.name),
          h('span', { class: 'small mono muted', text: g.ready ? fmt(it.cost) + ' tips' : needRep ? m.rep.total + ' / ' + it.need + ' ★' : fmt(m.money) + ' / ' + fmt(it.cost) })), bar(pct, g.ready ? 'brass' : ''));
      }
    }
    function renameBox() {
      const input = h('input', { type: 'text', value: nameOf(), maxlength: 40, 'aria-label': 'Club name' });
      const save = () => { E.setSetting('clubName', input.value.trim().slice(0, 40)); nameRow.replaceChildren(nameEl, rename); refresh(true); };
      input.addEventListener('keydown', e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') nameRow.replaceChildren(nameEl, rename); });
      nameRow.replaceChildren(input, h('button', { class: 'btn small primary', onclick: save }, 'Save'));
      input.focus(); input.select();
    }

    const TABS = [['build', 'Build'], ['band', 'Band'], ['set', 'Set list'], ['people', 'Community'], ['how', 'How it works']];
    function drawTabs() {
      tabs.textContent = '';
      TABS.forEach(([id, label]) => tabs.append(h('button', { 'aria-pressed': String(tab === id), onclick: () => { tab = id; openRoom = null; drawTabs(); drawPanel(); } }, label)));
    }
    function drawPanel() {
      panel.textContent = '';
      ({ build, band, set, people, how })[tab]();
    }

    /* Build: each room, then its amenities */
    function build() {
      C.ROOMS.forEach(r => {
        const own = C.owns(m.club, r.id);
        const card = h('details', { class: 'card cl-room-card' + (own ? ' own' : ''), 'data-room-card': r.id, open: openRoom === r.id || (own && r.id === 'cafe' && !openRoom) ? true : null });
        const ams = C.AMENITIES.filter(a => a.room === r.id), have = ams.filter(a => C.owns(m.club, a.id)).length;
        const opens = C.CATALOG.filter(x => (x.room || 'cafe') === r.id);
        card.append(h('summary', {}, h('span', { class: 'stack', style: { gap: '1px' } }, h('b', { text: r.name }),
          h('span', { class: 'small muted', text: own ? (ams.length ? have + ' of ' + ams.length + ' fixtures' : 'Built') + effectWords(r.fx, ' · ') : r.need > m.rep.total ? 'Needs ' + r.need + ' ★ and ' + fmt(r.cost) + ' tips' : fmt(r.cost) + ' tips' })),
        own ? h('span', { class: 'cl-badge', text: '✓' }) : ''));
        card.append(h('p', { class: 'small', text: r.about }));
        if (opens.length) card.append(h('p', { class: 'small muted', text: (own ? 'Opened for build mode: ' : 'Opens for build mode: ') + opens.map(x => x.name.toLowerCase()).join(', ') + '.' }));
        if (!own) card.append(buyRow(r));
        else ams.forEach(a => card.append(buyRow(a)));
        panel.append(card);
      });
      // furniture, plants and decor: build mode in 3D, a plain list without it
      const mine = C.live(m.club).length, fc = h('div', { class: 'card' }, h('h3', { text: 'Furniture, plants and decor' }),
        h('p', { class: 'small', text: 'You have ' + mine + ' piece' + (mine === 1 ? '' : 's') + ' in the club. Every chair, sofa and bench is a seat for one more guest; plants, lights and music bring more people in.' }));
      if (scene.build) fc.append(h('div', { class: 'row' }, h('button', { class: 'btn small brass', onclick: () => { if (!building) setBuilding(true); wrap.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, '🛠 Open build mode')));
      else C.CATALOG.forEach(it => { const can = C.canPlace(m.club, it.id, m.money); fc.append(h('div', { class: 'cl-buy' }, h('span', { class: 'stack', style: { gap: '1px' } }, h('span', { text: CAT_ICON[it.cat] + ' ' + it.name }), h('span', { class: 'small muted', text: fmt(it.cost) + ' tips · ' + (pieceWords(it) || 'just for looks') })), h('button', { class: 'btn small ' + (can.ok ? 'brass' : 'ghost'), disabled: !can.ok, onclick: () => doBuy(it) }, can.ok ? 'Buy · ' + fmt(it.cost) : can.why))); });
      panel.append(fc);
    }
    function effectWords(fx, lead = '') {
      const w = [];
      if (fx.seats) w.push('+' + fx.seats + ' places');
      if (fx.tip) w.push('+' + Math.round(fx.tip * 100) + '% tips');
      if (fx.draw) w.push('+' + Math.round(fx.draw * 100) + ' guests per 100 minutes');
      if (fx.slots) w.push('+' + fx.slots + ' on the set list');
      if (fx.regulars) w.push('regulars ' + Math.round(fx.regulars * 100) + '% faster');
      return w.length ? lead + w.join(', ') : '';
    }
    function buyRow(x) {
      const own = C.owns(m.club, x.id), can = C.canBuy(m.club, x.id, m.rep.total, m.money);
      const btn = own ? h('span', { class: 'cl-badge', text: '✓' })
        : h('button', { class: 'btn small ' + (can.ok ? 'brass' : 'ghost'), disabled: !can.ok, onclick: () => doBuy(x) }, can.ok ? 'Build · ' + fmt(x.cost) : can.why);
      return h('div', { class: 'cl-buy' + (own ? ' own' : '') }, h('span', { class: 'stack', style: { gap: '1px' } }, h('span', { text: (x.plant ? '🌿 ' : '') + x.name + (C.isRoom(x.id) ? '' : '') }),
        h('span', { class: 'small muted', text: (own || C.isRoom(x.id) ? '' : fmt(x.cost) + ' tips · ') + effectWords(x.fx) })), btn);
    }
    function doBuy(x) {
      const r = C.buy(m.club, x.id, m.rep.total);
      if (!r.ok) { toast(r.why); return; }
      E.touch();
      if (C.isRoom(x.id)) openRoom = x.id;
      refresh();
      drawPanel();
      scene.celebrate(r.uid || x.id);
      toast((C.isRoom(x.id) ? 'Built ' : 'Added ') + x.name.replace(/^The /, 'the ') + '!');
    }

    /* Band: who has joined, who is coming, and what brings them */
    function band() {
      m.st.members.forEach(b => {
        const skill = Object.keys(E.SKILLS).find(k => b.skills.includes(k) && TOOLS[E.SKILLS[k].tool]);
        const stars = '★'.repeat(b.level) + '☆'.repeat(C.MEMBER_LEVELS.length - b.level);
        panel.append(h('div', { class: 'card cl-member' + (b.level ? ' joined' : '') },
          h('div', { class: 'spread' }, h('span', { class: 'stack', style: { gap: '1px' } }, h('b', { text: b.level ? b.name + ' on ' + b.role : 'A ' + b.role + ' player' }),
            h('span', { class: 'small muted', text: b.level ? 'In the band · ' + Math.floor(b.min) + ' minutes of their practice' : 'Joins after ' + C.MEMBER_LEVELS[0] + ' minutes of ' + b.what.split(' (')[0] })),
          h('span', { class: 'cl-stars', 'aria-label': 'Level ' + b.level, text: stars })),
          bar(100 * b.frac, b.level ? 'brass' : ''),
          h('p', { class: 'small', text: b.next ? Math.ceil(b.next) + ' more minutes of ' + b.what + (b.level ? ' to level ' + (b.level + 1) + '.' : ' and ' + b.name + ' joins.') : b.name + ' is at the top level.' }),
          skill ? h('div', { class: 'row' }, h('button', { class: 'btn small ghost', onclick: () => openTool(E.SKILLS[skill].tool, { returnTab: 'train' }) }, 'Practise: ' + TOOLS[E.SKILLS[skill].tool].title + ' →')) : ''));
      });
      panel.append(h('p', { class: 'small muted', text: 'You play guitar in every show. Each member\'s level brings more guests every night.' }));
    }

    /* Set list: what's learned since the club opened, the first ones on stage tonight */
    function set() {
      const list = m.st.setList;
      const card = h('div', { class: 'card' }, h('h3', { text: 'Tonight\'s set' }));
      if (!list.length) card.append(h('p', { class: 'small', text: 'Nothing yet. A Repertoire tune joins the set once you know it well (practise it on a few different days), and a Library piece joins when you mark it Learned.' }),
        h('div', { class: 'row' }, TOOLS.repertoire ? h('button', { class: 'btn small brass', onclick: () => openTool('repertoire', { returnTab: 'train' }) }, 'Repertoire gym →') : '', h('button', { class: 'btn small ghost', onclick: () => { location.hash = '#library'; } }, 'Library →')));
      else card.append(h('ol', { class: 'cl-set' }, list.map((t, i) => h('li', { class: i < m.st.slots ? 'on' : 'off' }, h('span', { text: t.name }), h('span', { class: 'small muted', text: (t.kind === 'tune' ? 'tune' : 'Library piece') + (i < m.st.slots ? '' : ' · waiting for a slot') })))));
      card.append(h('p', { class: 'small muted', text: m.st.slots + ' tunes fit on the set each night; the stage, the piano and the bigger rooms add more. Each tune played brings more guests.' }));
      panel.append(card);
    }

    /* Community and reputation */
    function people() {
      const t = m.tot;
      panel.append(h('div', { class: 'card' }, h('h3', { text: 'Your community' }),
        h('div', { class: 'cl-chips' }, ...[['🏠', fmt(m.regulars), 'regulars'], ['🌙', fmt(t.nights), 'nights open'], ['👥', fmt(t.crowd), 'guests in all'], ['🎉', fmt(t.best), 'best night']].map(([i, v, l]) => h('div', { class: 'cl-chip' }, h('span', { class: 'cl-chip-i', text: i }), h('b', { class: 'mono', text: v }), h('span', { class: 'small muted', text: l })))),
        h('p', { class: 'small', text: 'Guests who keep coming become regulars: one for every 15 guests, faster with the Practice Rooms. The club opened on ' + new Date(m.club.start + 'T12:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) + '.' })));
      const rep = h('div', { class: 'card' }, h('h3', { text: 'Reputation ★ ' + m.rep.total }));
      if (!m.rep.parts.length) rep.append(h('p', { class: 'small', text: 'Reputation comes from progress: band members, tunes learned, lessons, skill levels, game scores, nights open, regulars and real trees.' }));
      else rep.append(h('ul', { class: 'cl-rep' }, m.rep.parts.map(p => h('li', {}, h('span', { text: p.label }), h('span', { class: 'mono small', text: p.n + ' × ' + p.each + ' = ' + p.pts })))));
      if (m.ctx.plantList.length) rep.append(h('p', { class: 'small muted', text: 'The trees, kelp and bottles in the ' + (C.owns(m.club, 'courtyard') ? 'courtyard' : 'pots out front') + ' are the real ones your practice paid for.' + (m.ctx.plantList.some(p => p.test) ? ' The faded ones are test orders.' : '') }));
      panel.append(rep);
    }

    function how() {
      const li = t => h('li', { text: t });
      panel.append(h('div', { class: 'card' }, h('h3', { text: 'How the club works' }), h('ul', { class: 'game-how-list' },
        li('Every minute you practise anywhere in the app is a tip, plus one for every five right answers. The kitchen, the studio and a few amenities raise it.'),
        li('After ' + C.OPEN_MIN + ' minutes in a day the doors open. Guests come with every minute, more with each band member, each tune on the set and each amenity, as many as the seats allow; each leaves half a tip.'),
        li('Reputation (★) comes from progress, never from spending: it opens the bigger rooms.'),
        li('Band members join after an hour of the practice that trains their part and grow up to five levels.'),
        li('A tune you know well from the Repertoire gym, or a Library piece marked Learned, goes on the set list.'),
        li('Practice from before the club opened doesn\'t count. A day without practice is just a quiet night: nothing is lost, nobody leaves.'),
        li('The club syncs with the rest of your progress. Tips are worked out from your practice, so two devices never disagree.')),
        h('p', { class: 'small muted', text: 'Looking around the club isn\'t counted as practice time.' })));
    }

    /* the show: the guests walk in, the numbers count up */
    function playShow(night, byHand) {
      if (!night || !alive) return;
      const prev = byHand ? { crowd: 0, t: 0 } : seen();
      const sameDay = prev.day === (night.day || C.dayKey());
      const from = sameDay ? prev : { crowd: 0, t: 0 };
      showBtn.disabled = true;
      let shownGuests = from.crowd;
      cGuests.v.textContent = from.crowd + ' / ' + m.st.seats;
      scene.show(night.crowd, {
        onGuest: (i, n) => { const v = Math.round(from.crowd + (night.crowd - from.crowd) * (i + 1) / n); if (v !== shownGuests) { shownGuests = v; cGuests.v.textContent = v + ' / ' + m.st.seats; } },
        onCoin: i => { if (i === 0) counter(cTips.v, Math.max(0, m.money - (night.t - from.t)), m.money, 1300); }
      }).then(() => { if (!alive) return; showBtn.disabled = false; refresh(true); });
      remember(night);
    }
    function seen() { try { return JSON.parse(localStorage.getItem(SEEN)) || {}; } catch (e) { return {}; } }
    function remember(night) { try { localStorage.setItem(SEEN, JSON.stringify({ day: night.day || C.dayKey(), crowd: night.crowd, t: night.t })); } catch (e) { /* private mode */ } }

    drawTabs();
    refresh();
    drawPanel();
    // something new since this device last looked: the evening plays by itself
    const n = m.today, was = seen();
    if (n && n.crowd > 0 && !(was.day === C.dayKey() && was.crowd >= n.crowd)) ready.then(() => setTimeout(() => playShow(Object.assign({ day: C.dayKey() }, n), false), 600));
    const offL = onLedger(() => { if (alive) { refresh(); drawPanel(); } });
    return () => { alive = false; document.removeEventListener('keydown', onKey, true); scene.stop(); if (scene.dispose) scene.dispose(); offL(); };
  }
});

/* at start: open the club (only practice from now on counts) */
export function initClub() { try { ensureClub(); } catch (e) { console.error(e); } }
