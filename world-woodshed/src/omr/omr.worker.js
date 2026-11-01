/* World Woodshed — score recognition in a Worker. Pages come one at a time (a long PDF never sits in memory
   whole): { type: 'page', gray: { w, h, d } } is read at once and only its systems are kept; { type: 'finish',
   opts } builds the score and answers with the MusicXML and a summary. */
import { readImage } from './recognize.js';
import { buildScore } from './assemble.js';
import { scoreToMusicXML } from './musicxml.js';

let pages = [], info = [];
self.onmessage = e => {
  const m = e.data || {};
  try {
    if (m.type === 'reset') { pages = []; info = []; self.postMessage({ type: 'ready' }); return; }
    if (m.type === 'page') {
      const r = readImage(m.gray);
      pages.push(r.systems);
      const staves = r.prep.staves.filter(s => !s.tab).length;
      info.push({ staves, tab: r.prep.staves.some(s => s.tab), systems: r.systems.length });
      self.postMessage({ type: 'page', page: pages.length, staves });
      return;
    }
    if (m.type === 'finish') {
      const score = buildScore(pages, m.opts || {});
      const found = info.reduce((a, p) => a + p.staves, 0);
      if (!score || !found || !score.counts.notes) { self.postMessage({ type: 'done', empty: true, pages: info }); return; }
      // bars to check, numbered as the score shows them (a pickup is bar 0)
      const check = [...new Set(score.warnings.map(w => (score.pickup ? w.bar - 1 : w.bar)))].sort((a, b) => a - b);
      const xml = scoreToMusicXML(score, Object.assign({}, m.opts, { check }));
      self.postMessage({ type: 'done', xml, pages: info, summary: {
        bars: score.counts.bars, notes: score.counts.notes, fixed: score.counts.fixed, check,
        time: score.time, fifths: score.fifths, parts: score.parts.map(p => p.name), staves: found
      } });
      pages = []; info = [];
    }
  } catch (err) {
    self.postMessage({ type: 'error', message: String(err && err.message || err) });
  }
};
