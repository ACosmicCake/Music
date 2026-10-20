import D from '../data.js';
import E from '../engine.js';
import { view, h, shuffle, toast, bar, ui, renderTabs, teardown, go, tool, openTool, pickFor, Quiz } from '../ui/core.js';

/* ======================================================
   ATLAS
   ====================================================== */
tool('atlasquiz', {
  tab: 'atlas', skill: 'atlas', title: 'World music quiz', eyebrow: 'Knowledge · spaced review',
  desc: 'Questions about rhythms, scales, instruments and players from every region. Missed ones come back sooner.',
  render(body, ctx) {
    return Quiz(body, ctx, () => {
      const regionFilter = (x, region) => x.region === region;
      const item = pickFor('atlas', ctx, regionFilter);
      const [rid, i] = item.id.split(':');
      const r = D.REGIONS.find(x => x.id === rid), f = r.facts[+i];
      const opts = shuffle([f.a].concat(f.w));
      return {
        eyebrow: r.name, prompt: f.q, wide: true, choices: opts.map(o => ({ id: o, label: o })), answer: f.a,
        onResult: (ok, id, rt) => E.record('atlas', item.id, ok, { rt }),
        explain: () => r.summary.split('. ')[0] + '.'
      };
    });
  }
});

export function regionPage(r) {
  teardown(); ui.runner = { id: 'region' }; renderTabs();
  view.innerHTML = ''; window.scrollTo(0, 0);
  const score = Math.round(E.regionScore(r) * 100);
  const rw = E.regionOfWeek();
  view.append(h('div', { class: 'runner-head' }, h('div', { class: 'spread' }, h('button', { class: 'btn ghost small', onclick: () => go('atlas') }, '← Atlas'), h('span', { class: 'eyebrow', text: r.places })), h('h1', { text: r.name }), h('p', { text: r.summary })));
  view.append(h('div', { class: 'card' },
    h('div', { class: 'spread' }, h('h3', { text: 'Your progress here' }), h('span', { class: 'mono', text: score + '%' })), bar(score),
    h('div', { class: 'row' },
      h('button', { class: 'btn brass small', onclick: () => openTool('atlasquiz', { params: { region: r.id }, returnTab: 'atlas' }) }, 'Quiz me on ' + r.name),
      rw.id === r.id ? h('span', { class: 'small muted', text: 'This is your region of the week.' }) : h('button', { class: 'btn small', onclick: () => { E.setRegionWeek(r.id); toast(r.name + ' is your focus this week'); regionPage(r); } }, 'Make this my focus region'))));
  view.append(h('div', { class: 'card' }, h('h3', { text: 'Key ideas' }), h('ul', { class: 'list' }, r.concepts.map(c => h('li', { text: c })))));
  if (r.rhythms.length) {
    view.append(h('div', { class: 'card' }, h('h3', { text: 'Rhythms to play' }), h('div', { class: 'chips' }, r.rhythms.map(id => {
      const rr = D.RHYTHMS.find(x => x.id === id);
      return h('button', { class: 'chip', onclick: () => openTool('rhythms', { params: { rhythm: id }, returnTab: 'atlas' }) }, rr.name);
    }))));
  }
  view.append(h('div', { class: 'card' }, h('h3', { text: 'Scales & modes' }), h('div', { class: 'chips' }, r.scales.map(id => {
    const sc = D.SCALES.find(x => x.id === id);
    return h('button', { class: 'chip', onclick: () => openTool('drone', { params: { scale: id }, returnTab: 'atlas' }) }, sc.name);
  })), h('p', { class: 'small muted', text: 'Opens the drone explorer so you can hear and play each one.' })));
  const tunes = D.TUNES.filter(t => t.region === r.id);
  if (tunes.length) view.append(h('div', { class: 'card' }, h('h3', { text: 'Grooves to jam over' }), h('div', { class: 'chips' }, tunes.map(t => h('button', { class: 'chip', onclick: () => openTool('repertoire', { params: { tune: t.id }, returnTab: 'atlas' }) }, t.name)))));
  view.append(h('div', { class: 'card' }, h('h3', { text: 'On guitar' }), h('ul', { class: 'list' }, r.guitar.map(c => h('li', { text: c })))));
  view.append(h('div', { class: 'card' }, h('h3', { text: 'Instruments' }), h('div', { class: 'chips' }, r.instruments.map(c => h('span', { class: 'chip', text: c })))));
  view.append(h('div', { class: 'card' }, h('h3', { text: 'Listen to' }), h('div', { class: 'chips' }, r.listen.map(a => h('a', { class: 'chip', href: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(a), target: '_blank', rel: 'noopener' }, a + ' ↗'))),
    h('p', { class: 'small muted', text: 'Each link opens a YouTube search in a new tab.' })));
}
