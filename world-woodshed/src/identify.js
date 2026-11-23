/* World Woodshed — what could these notes be? Plain functions (test/identify.test.js) for the identifier
   (src/ui/identify.js): every chord and every scale that holds all the notes tapped so far, nearest first, so
   the list narrows as notes are added.

   chordsWith(notes) gives each chord type of CHORD_TYPES on each root whose tones include every pitch class
   played: the ones already complete (none missing but the optional fifth or 9th) first, then by how many notes
   they still need. scalesWith(notes, list) does the same for scales (finderList cards), on every tonic. */
import { CHORD_TYPES, rootName, spellTone, pcOf } from './chordid.js';

const mod12 = x => ((x % 12) + 12) % 12;
const near = (a, b) => Math.abs(mod12(a - b + 6) - 6) < 0.01;
/* the pitch classes of a list of notes ({ midi } or numbers), fractional ones kept, in the order first played */
export function pcsOf(notes) {
  const out = [];
  notes.forEach(n => { const m = typeof n === 'number' ? n : n.midi; const p = Math.round(mod12(m) * 100) / 100; if (!out.some(q => near(q, p))) out.push(p); });
  return out;
}

/* Every chord holding the notes. Returns [{ root, q, sym, name, T, tones: [{ pc, deg, name, have }], need: [tone],
   complete, score }] best first. A chord can only hold whole semitones, so a quarter tone gives nothing. */
export function chordsWith(notes, opts = {}) {
  const pcs = pcsOf(notes);
  if (!pcs.length || pcs.some(p => !Number.isInteger(p))) return [];
  const bass = opts.bass != null ? pcOf(opts.bass) : pcOf(Math.min(...notes.map(n => (typeof n === 'number' ? n : n.midi))));
  const out = [];
  for (let r = 0; r < 12; r++) {
    CHORD_TYPES.forEach((T, ti) => {
      const tones = T.iv.map(x => mod12(r + x));
      if (!pcs.every(p => tones.includes(p))) return;
      const minor = T.iv.includes(3) && !T.iv.includes(4), rn = rootName(r, minor);
      const list = T.iv.map((x, i) => ({ pc: tones[i], deg: T.deg[i], name: spellTone(rn, r, x, T.deg[i]), have: pcs.includes(tones[i]), opt: (T.opt || []).includes(x) }));
      const need = list.filter(t => !t.have && !t.opt);
      if (T.q === '5' && pcs.length > 2) return;
      // simpler chords first, the root in the bass, the root among the notes, then the fewest notes still to add
      const score = need.length * 10 + list.filter(t => !t.have && t.opt).length * 2 + ti * 0.05 + (bass === r ? 0 : 1.5) + (pcs.includes(r) ? 0 : 3);
      out.push({ root: r, q: T.q, sym: rn + T.q, name: rn + ' ' + T.name, T, tones: list, need, complete: !need.length && pcs.length >= Math.min(3, T.iv.length), score });
    });
  }
  return out.sort((a, b) => a.score - b.score);
}

/* Every scale (and tonic) holding the notes. list: finderList cards ({ id, name, steps, app, own }).
   opts.tonic holds the home note fixed. Returns [{ scale, tonic, extra: [step] (scale notes not played), score }] */
export function scalesWith(notes, list, opts = {}) {
  const pcs = pcsOf(notes);
  if (!pcs.length) return [];
  const first = pcs[0], low = pcOf(Math.min(...notes.map(n => (typeof n === 'number' ? n : n.midi))));
  const tonics = opts.tonic != null ? [mod12(opts.tonic)] : [...Array(12).keys()];
  const out = [];
  for (const sc of list) {
    const steps = [...new Set(sc.steps.map(x => Math.round(mod12(x) * 100) / 100))];
    for (const t of tonics) {
      if (!pcs.every(p => steps.some(x => near(t + x, p)))) continue;
      const extra = steps.filter(x => !pcs.some(p => near(t + x, p)));
      const score = extra.length + (near(t, low) ? 0 : 0.6) + (near(t, first) ? 0 : 0.3) + (pcs.some(p => near(p, t)) ? 0 : 1.5)
        + (sc.own ? -0.2 : sc.app ? 0 : 0.35) + (steps.some(x => !Number.isInteger(x)) && pcs.every(Number.isInteger) ? 0.8 : 0);
      out.push({ scale: sc, tonic: t, extra, score });
    }
  }
  return out.sort((a, b) => a.score - b.score);
}
