/* World Woodshed — smart practice UI: the planner, learning preferences, and the science behind it */
import D from '../data.js';
import E from '../engine.js';
import Cur from '../curriculum.js';
import { view, h, toast, go, ui, renderTabs, teardown } from './core.js';
import { BLOCKS, blockTitle, describe, totalOf, fmtMin, syncWeights } from '../routines.js';
import { startSession } from './session.js';
import { ribbon } from './routine.js';

const TIMES = [10, 15, 20, 30, 45, 60, 90, 120];

/* "How much time do you have right now?" → a plan for this session, explained */
export function smartPlanner(opts = {}) {
  const card = h('div', { class: 'card smart-card' });
  let plan = null, minutes = null;
  function draw() {
    card.innerHTML = '';
    const ctx = Cur.context(), goal = Cur.prefs().goal || 30;
    const done = ctx.minutesToday;
    const status = ctx.sessionNo === 1 ? 'First session today' : 'Session ' + ctx.sessionNo + ' today · ' + fmtMin(done) + ' so far' + (ctx.sinceLast !== null ? ', last one ' + (ctx.sinceLast < 1 ? Math.round(ctx.sinceLast * 60) + ' min' : Math.round(ctx.sinceLast) + ' h') + ' ago' : '');
    card.append(
      h('div', { class: 'spread' }, h('div', { class: 'stack', style: { gap: '2px' } }, h('span', { class: 'eyebrow', text: 'Smart practice' }), h('h2', { text: plan ? 'Your session' : 'How much time do you have right now?' })),
        h('button', { class: 'btn small ghost', onclick: () => sciencePage() }, 'How it decides →')),
      h('div', { class: 'daygoal' }, h('span', { class: 'small', text: status }), h('span', { class: 'mono small muted', text: fmtMin(done) + ' / ' + fmtMin(goal) + ' goal' }),
        h('div', { class: 'bar brass' }, h('i', { style: { width: Math.min(100, 100 * done / goal) + '%' } }))));
    const chips = h('div', { class: 'chips presets' }, TIMES.map(m => h('button', { class: 'chip', 'aria-pressed': m === minutes ? 'true' : 'false', onclick: () => { minutes = m; plan = Cur.planSession(m); draw(); } }, fmtMin(m).replace(' min', 'm').replace(' h', 'h'))));
    card.append(chips);
    if (!plan) {
      card.append(h('p', { class: 'small muted', text: 'Pick a length. The plan reviews what is due, brings in new material slowly from the styles you put first, and remembers what you already did today, so a second or third session picks up where the first left off.' }));
      return;
    }
    const nNew = plan.blocks.filter(b => b.isNew).length;
    card.append(ribbon(plan.blocks),
      h('p', { class: 'small muted', text: plan.blocks.length + ' blocks · ' + (nNew ? nNew + ' new item' + (nNew > 1 ? 's' : '') : 'no new items: reviews and practice') + (ctx.dueNow ? ' · ' + ctx.dueNow + ' due for review' : '') }),
      h('ol', { class: 'blocks static smartlist' }, plan.blocks.map(b => h('li', { class: 'brow cat-' + BLOCKS[b.type].cat },
        h('div', { class: 'bmain' }, h('span', { class: 'bicon' }),
          h('div', { class: 'btext' }, h('b', {}, blockTitle(b), b.isNew ? h('span', { class: 'badge brass', text: 'new' }) : null),
            h('span', { class: 'small', text: describe(b) !== b.reason ? describe(b) : '' }), h('span', { class: 'small muted', text: b.reason || '' })),
          h('span', { class: 'mono small', text: b.minutes + 'm' }))))),
      h('div', { class: 'row' },
        h('button', { class: 'btn brass big', onclick: () => startSession({ name: 'Smart practice', blocks: plan.blocks, autoAdvance: true }) }, '▶ Start · ' + fmtMin(totalOf(plan.blocks))),
        h('button', { class: 'btn ghost', onclick: () => { plan = Cur.planSession(minutes); draw(); } }, 'Shuffle'),
        opts.compact ? null : h('button', { class: 'btn ghost', onclick: () => {
          const r = { id: E.uid('r'), name: 'Smart ' + fmtMin(minutes), breaks: false, autoAdvance: true, blocks: plan.blocks.filter(b => b.type !== 'break').map(b => ({ id: E.uid('b'), type: b.type, minutes: b.minutes, settings: {} })) };
          syncWeights(r); E.saveRoutine(r); E.setActiveRoutine(r.id); toast('Saved as a routine. Its content stays smart.'); go('routine');
        } }, 'Save the shape as a routine')));
  }
  draw();
  return card;
}

/* Style priorities, pace and daily goal, plus what the memory model knows */
export function learningPrefsCard(opts = {}) {
  const card = h('div', { class: 'card prefs-card' });
  function draw() {
    card.innerHTML = '';
    const p = Cur.prefs(), chosen = (p.styles || []).slice();
    const set = patch => { Cur.setPrefs(patch); draw(); if (opts.onChange) opts.onChange(); };
    card.append(h('div', { class: 'spread' }, h('h2', { text: 'Your learning plan' }), opts.dismiss ? h('button', { class: 'btn small' + ((Cur.prefs().styles || []).length ? ' brass' : ' ghost'), onclick: opts.dismiss }, (Cur.prefs().styles || []).length ? 'Done' : 'Later') : null),
      h('p', { class: 'small muted', text: 'Pick the styles you want to work on first, in order. New scales, rhythms, tunes, techniques and records come from these first, and your weekly focus rotates through them. Everything else still appears now and then.' }));
    const list = h('ol', { class: 'prio' });
    chosen.forEach((id, i) => {
      const r = D.REGIONS.find(x => x.id === id); if (!r) return;
      list.append(h('li', {}, h('span', { class: 'mono prio-n', text: String(i + 1) }), h('b', { text: r.name }),
        h('span', { class: 'grow' }),
        h('button', { class: 'mbtn', 'aria-label': 'Move up', disabled: i === 0 ? true : null, onclick: () => { const a = chosen.slice(); [a[i - 1], a[i]] = [a[i], a[i - 1]]; set({ styles: a }); } }, '↑'),
        h('button', { class: 'mbtn', 'aria-label': 'Move down', disabled: i === chosen.length - 1 ? true : null, onclick: () => { const a = chosen.slice(); [a[i + 1], a[i]] = [a[i], a[i + 1]]; set({ styles: a }); } }, '↓'),
        h('button', { class: 'mbtn', 'aria-label': 'Remove', onclick: () => set({ styles: chosen.filter(x => x !== id) }) }, '✕')));
    });
    card.append(chosen.length ? list : h('p', { class: 'small', text: 'No styles chosen yet: the plan spreads across everything.' }));
    card.append(h('div', { class: 'chips' }, D.REGIONS.filter(r => !chosen.includes(r.id)).map(r => h('button', { class: 'chip', disabled: chosen.length >= 5 ? true : null, onclick: () => set({ styles: chosen.concat([r.id]) }) }, '+ ' + r.name))));
    card.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Pace of new material' }),
      h('div', { class: 'seg' }, Object.entries(Cur.PACE).map(([k, v]) => h('button', { 'aria-pressed': (p.pace || 'steady') === k ? 'true' : 'false', onclick: () => set({ pace: k }) }, v.name))),
      h('span', { class: 'small muted', text: Cur.PACE[p.pace || 'steady'].desc })));
    card.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Daily goal' }),
      h('div', { class: 'chips presets' }, [15, 30, 45, 60, 90, 120, 180].map(m => h('button', { class: 'chip', 'aria-pressed': (p.goal || 30) === m ? 'true' : 'false', onclick: () => set({ goal: m }) }, fmtMin(m)))),
      h('span', { class: 'small muted', text: 'Split it into as many sessions as your day allows. Several short sessions spread out are as good as one long one, often better.' })));
    if (!opts.compact) {
      const st = Cur.stats();
      card.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'What you have learned' }),
        h('div', { class: 'kindgrid' }, st.byKind.map(k => h('div', { class: 'kind' }, h('b', { class: 'mono', text: k.n + '/' + k.total }), h('span', { class: 'small muted', text: k.name + 's' })))),
        h('p', { class: 'small muted', text: st.learned ? st.strong + ' items are well established (stable for three weeks or more); ' + st.due + ' due for review now.' : 'Nothing yet: your first session brings in the first items.' })));
      const up = Cur.upcoming(5);
      if (up.length) card.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Coming back next' }),
        h('ul', { class: 'list small' }, up.map(u => h('li', { text: u.name + ': ' + (u.dueIn <= 0 ? 'due now' : u.dueIn < 1 ? 'later today' : 'in ' + Math.round(u.dueIn) + ' day' + (Math.round(u.dueIn) === 1 ? '' : 's')) })))));
    }
  }
  draw();
  return card;
}

/* The research behind the plan */
export function sciencePage() {
  teardown(); ui.runner = { id: 'science', opts: {} }; renderTabs();
  view.innerHTML = ''; window.scrollTo(0, 0);
  view.append(h('div', { class: 'hero' },
    h('div', { class: 'spread' }, h('button', { class: 'btn ghost small', onclick: () => go(ui.tab || 'today') }, '← Back'), h('span', { class: 'eyebrow', text: 'The science' })),
    h('h1', { text: 'How the app decides what you practise' }),
    h('p', { class: 'lede', text: 'The smart plan follows what research on learning and memory has found, and says where the evidence is thin. These are the principles, what they mean for you, and the studies behind them.' })));
  (D.SCIENCE || []).forEach((x, i) => view.append(h('section', { class: 'card science' },
    h('span', { class: 'eyebrow', text: String(i + 1).padStart(2, '0') }), h('h2', { text: x.title }),
    h('p', { text: x.finding }),
    h('div', { class: 'callout patina' }, h('b', { text: 'In the app' }), h('p', { text: x.inApp })),
    h('details', { class: 'sources' }, h('summary', { class: 'small', text: 'Sources (' + x.sources.length + ')' }),
      h('ul', { class: 'list small' }, x.sources.map(src => h('li', {}, src.cite, src.url ? [' ', h('a', { href: src.url, target: '_blank', rel: 'noopener' }, 'link ↗')] : null)))))));
}
