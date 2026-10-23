/* World Woodshed — "How to solo over it": the notes to aim for (harmony) and the scales and colour (theory),
   for a Repertoire tune (t.harmony.solo) or an improvising drill (d.solo). */
import { h } from './core.js';

export function SoloTips(solo, title = 'How to solo over it') {
  if (!solo) return null;
  const part = (label, items) => items && items.length ? h('div', { class: 'stack', style: { gap: '4px' } }, h('span', { class: 'eyebrow', text: label }), h('ul', { class: 'list small' }, items.map(x => h('li', { text: x })))) : null;
  return h('div', { class: 'callout patina solotips' }, h('b', { text: title }),
    part('Harmony: notes to aim for', solo.harmony), part('Theory: scales and colour', solo.theory));
}
