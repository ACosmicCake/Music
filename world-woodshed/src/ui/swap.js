/* World Woodshed — swap a block for something else: the plan's alternatives, or your own choice */
import D from '../data.js';
import Cur from '../curriculum.js';
import E from '../engine.js';
import { h } from './core.js';
import { BLOCKS, BLOCK_ORDER, CATS, blockTitle, describe, fmtMin, warmScales } from '../routines.js';
import { GYM } from '../content/gym.js';

/* What can be picked inside each block type */
function contentFor(type) {
  switch (type) {
    case 'scalewarm': return warmScales().map(x => [x.id, x.name]);
    case 'technique': return D.EXERCISES.map(x => [x.id, x.name]);
    case 'rhythms': return D.RHYTHMS.map(x => [x.id, x.name + ' · ' + ((D.REGIONS.find(r => r.id === x.region) || {}).name || '')]);
    case 'repertoire': return E.listTunes().map(x => [x.id, x.name + ' · your tune']).concat(D.TUNES.map(x => [x.id, x.name]));
    case 'drill': return (D.DRILLS || []).map(x => [x.id, x.name + ' · ' + ((D.REGIONS.find(r => r.id === x.style) || {}).name || x.style)]);
    case 'lesson': return D.LESSONS.map(x => [x.id, x.title]);
    case 'gym': return GYM.map(x => [x.id, x.name]);
    default: return null;
  }
}

export function openSwap({ block, used = [], onPick, title }) {
  const close = () => { back.remove(); document.removeEventListener('keydown', esc); };
  const esc = e => { if (e.key === 'Escape') close(); };
  const pick = nb => { nb.minutes = nb.minutes || block.minutes; close(); onPick(nb); };
  const alts = Cur.alternatives(block, used);
  // manual choice: a type, then (optionally) what inside it
  let type = block.type, ref = '';
  const typeSel = h('select', { id: 'swap-type', 'aria-label': 'Block type' });
  Object.keys(CATS).forEach(c => {
    const g = h('optgroup', { label: CATS[c].name });
    BLOCK_ORDER.filter(t => BLOCKS[t].cat === c && t !== 'break').forEach(t => g.append(h('option', { value: t, selected: t === type ? true : null, text: BLOCKS[t].name })));
    if (g.children.length) typeSel.append(g);
  });
  const refBox = h('div');
  function drawRef() {
    refBox.innerHTML = ''; ref = '';
    const items = contentFor(type);
    if (!items) { refBox.append(h('p', { class: 'small muted', text: BLOCKS[type].desc })); return; }
    const sel = h('select', { id: 'swap-ref', 'aria-label': 'What to practise' });
    sel.append(h('option', { value: '', text: 'Let the plan pick one' }));
    items.forEach(([v, t]) => sel.append(h('option', { value: v, text: t })));
    sel.onchange = () => { ref = sel.value; };
    refBox.append(h('label', { class: 'stack field', for: 'swap-ref' }, h('span', { class: 'eyebrow', text: 'What exactly' }), sel));
  }
  typeSel.onchange = () => { type = typeSel.value; drawRef(); };
  drawRef();
  const back = h('div', { class: 'sheet-back', onclick: e => { if (e.target === back) close(); } },
    h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Swap this block' },
      h('div', { class: 'spread' }, h('h2', { text: title || 'Swap this block' }), h('button', { class: 'btn small ghost', onclick: close }, 'Close')),
      h('p', { class: 'small muted', text: 'Now: ' + blockTitle(block) + ' · ' + describe(block) + '. The time stays the same; the plan records what you actually practise, so reviews still come back at the right time.' }),
      h('span', { class: 'eyebrow', text: 'Let the plan choose' }),
      alts.length ? h('div', { class: 'swapgrid' }, alts.map(a => h('button', { class: 'swapcard cat-' + BLOCKS[a.block.type].cat, onclick: () => pick(Object.assign(a.block, { minutes: block.minutes })) },
        h('span', { class: 'bicon', 'aria-hidden': 'true' }),
        h('span', { class: 'swaptext' }, h('b', {}, a.title, a.block.isNew ? h('span', { class: 'badge brass', text: 'new' }) : ''),
          describe(a.block) !== a.block.reason ? h('span', { class: 'small', text: describe(a.block) }) : '', h('span', { class: 'small muted', text: a.block.reason || '' }))))) : h('p', { class: 'small muted', text: 'Nothing else is due right now. Choose something yourself below.' }),
      h('span', { class: 'eyebrow', text: 'Choose myself' }),
      h('div', { class: 'formgrid' }, h('label', { class: 'stack field', for: 'swap-type' }, h('span', { class: 'eyebrow', text: 'Block' }), typeSel), refBox),
      h('div', { class: 'row' }, h('button', { class: 'btn brass', onclick: () => pick(Cur.blockFor(type, ref, block.minutes)) }, 'Use this · ' + fmtMin(block.minutes)))));
  document.body.append(back);
  document.addEventListener('keydown', esc);
}
