import D from '../data.js';
import E from '../engine.js';
import { h, shuffle, tool, pickFor, Quiz } from '../ui/core.js';

/* ======================================================
   ATLAS
   ====================================================== */
tool('atlasquiz', {
  tab: 'learn', skill: 'atlas', title: 'World music quiz', eyebrow: 'Knowledge · spaced review',
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

// Region pages are the style deep-dives in learn.js
export { stylePage as regionPage } from './learn.js';
