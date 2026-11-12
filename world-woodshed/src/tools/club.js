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
  const scene = Scene({ small: true });
  scene.draw(sceneModel(m, (m.today || {}).crowd || 0));
  const n = m.today;
  const line = n && n.crowd > 0 ? n.crowd + ' guest' + (n.crowd === 1 ? '' : 's') + ' tonight and ' + fmt(n.t) + ' tips.'
    : n && n.m > 0 ? 'The doors open at ' + C.OPEN_MIN + ' minutes; you\'re at ' + Math.floor(n.m) + '.'
      : 'The doors open when you practise. ' + C.OPEN_MIN + ' minutes and the first guests come in.';
  const goal = C.nextGoal(m.club, m.rep.total);
  const goalLine = goal ? (goal.ready ? 'You can build ' + goal.item.name.replace(/^The /, 'the ') + ' now.' : 'Next: ' + goal.item.name.replace(/^The /, 'the ') + ', ' + (goal.item.need > m.rep.total ? (goal.item.need - m.rep.total) + ' ★ to go' : fmt(goal.item.cost - m.money) + ' tips to go') + '.') : '';
  return h('button', { class: 'card cl-card' + (where === 'games' ? ' cl-banner' : ''), onclick: () => openTool('club', { returnTab: where === 'games' ? 'train' : 'today' }) },
    h('div', { class: 'cl-card-scene' }, scene.el),
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
    const scene = Scene({ onRoom: id => { tab = 'build'; openRoom = id; drawTabs(); drawPanel(); const el = panel.querySelector(`[data-room-card="${id}"]`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
    scene.setItemRoom(id => (C.itemOf(id) || {}).room);
    const wrap = h('div', { class: 'cl-wrap' }, scene.el);
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
    body.append(h('div', { class: 'stack' }, wrap, nameRow, chips, tonight, h('div', { class: 'row' }, showBtn), goalBox, tabs, panel));

    function refresh(keepScene) {
      m = model();
      if (!keepScene) scene.draw(sceneModel(m, (m.today || {}).crowd || 0));
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
        card.append(h('summary', {}, h('span', { class: 'stack', style: { gap: '1px' } }, h('b', { text: r.name }),
          h('span', { class: 'small muted', text: own ? have + ' of ' + ams.length + ' amenities' + effectWords(r.fx, ' · ') : r.need > m.rep.total ? 'Needs ' + r.need + ' ★ and ' + fmt(r.cost) + ' tips' : fmt(r.cost) + ' tips' })),
        own ? h('span', { class: 'cl-badge', text: '✓' }) : ''));
        card.append(h('p', { class: 'small', text: r.about }));
        if (!own) card.append(buyRow(r));
        else ams.forEach(a => card.append(buyRow(a)));
        panel.append(card);
      });
    }
    function effectWords(fx, lead = '') {
      const w = [];
      if (fx.seats) w.push('+' + fx.seats + ' seats');
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
      scene.celebrate(x.id);
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
    if (n && n.crowd > 0 && !(was.day === C.dayKey() && was.crowd >= n.crowd)) setTimeout(() => playShow(Object.assign({ day: C.dayKey() }, n), false), 500);
    const offL = onLedger(() => { if (alive) { refresh(); drawPanel(); } });
    return () => { alive = false; scene.stop(); offL(); };
  }
});

/* at start: open the club (only practice from now on counts) */
export function initClub() { try { ensureClub(); } catch (e) { console.error(e); } }
