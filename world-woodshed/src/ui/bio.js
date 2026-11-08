/* World Woodshed — a favourite player's life on their card in Style drills → By musician: a folded section that
   loads the text (src/content/players-bio.js, through loadBios) the first time it is opened, then shows the
   timeline, the parts (how they learned and practised, how they wrote, the stories), what to take into your own
   practice and the sources. Text from bundled content only; links open only if they are http(s). */
import D from '../data.js';
import { h } from './core.js';
import { loadBios, drawWhenLoaded } from '../content/lazy.js';

const words = b => [b.lede].concat(...b.parts.map(x => x.p), b.life.map(x => x[1]), b.take).join(' ').split(/\s+/).length;

export function bioBody(b) {
  return h('div', { class: 'stack bio' },
    h('p', { class: 'lede', text: b.lede }),
    h('span', { class: 'mono small muted', text: Math.max(1, Math.round(words(b) / 220)) + ' min read' }),
    h('h3', { text: 'Life' }),
    h('ol', { class: 'timeline' }, b.life.map(([when, what]) => h('li', {}, h('span', { class: 'mono when', text: when }), h('p', { text: what })))),
    h('div', { class: 'essay' }, b.parts.map((x, i) => h('details', { class: 'essay-sec', open: i === 0 ? true : null },
      h('summary', {}, h('span', { class: 'mono es-n', text: String(i + 1).padStart(2, '0') }), h('span', { text: x.h })),
      h('div', { class: 'prose' }, x.p.map(t => h('p', { text: t })))))),
    h('div', { class: 'callout' }, h('b', { text: 'Take it into your practice' }), h('ul', { class: 'list' }, b.take.map(t => h('li', { text: t })))),
    h('div', { class: 'stack', style: { gap: '4px' } }, h('span', { class: 'eyebrow', text: 'Sources' }),
      h('ul', { class: 'list small bio-sources' }, b.sources.map(([title, url]) => h('li', {},
        url && /^https?:\/\//.test(url) ? h('a', { href: url, target: '_blank', rel: 'noopener' }, title + ' ↗') : title)))));
}

/* The folded "Life and work" section for player `id`; the text loads when it is first opened */
export function BioFold(id, name) {
  let drawn = false;
  const body = h('div', {});
  const d = h('details', { class: 'foldwrap bio-fold' },
    h('summary', {}, h('span', { class: 'stack', style: { gap: '1px' } }, 'Life and work',
      h('span', { class: 'small muted', style: { fontFamily: 'var(--font-body)', fontWeight: 400 }, text: 'How ' + name + ' learned, practised and wrote, and the stories behind the music' }))),
    body);
  d.addEventListener('toggle', () => {
    if (!d.open || drawn) return;
    drawn = true;
    drawWhenLoaded(loadBios, body, () => { const b = (D.BIOS || {})[id]; body.append(b ? bioBody(b) : h('p', { class: 'small muted', text: 'No biography yet.' })); });
  });
  return d;
}
