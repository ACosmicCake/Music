/* World Woodshed — the scale library (Learn → Scales) and your own scales. Plain functions (test/scalelib.test.js).

   buildLibrary(D, lib, own) puts every scale the app knows on one list of cards: D.SCALES, the world scales
   (src/content/scales-world.js), the library's own (src/content/scales-lib.js, passed in as `lib` once loaded)
   and the 72 melakartas, then your own scales. A card whose notes another card already has keeps its own name
   and gets `same` (the first card with those notes), so the finder (finderList) names one scale and gives the
   others as its other names.
   Your own scales (state.myScales, by id: { id, name, steps, tonic, note, created, updatedAt }) are checked with
   cleanScale, since they may come from another device. Steps are typed as intervals (parseSteps).
   Steps may be fractional: .5 is a quarter tone; slendro and the equal-step tunings have other fractions. */
import { catalogue } from './scalefind.js';

const mod12 = x => ((x % 12) + 12) % 12;
const r2 = x => Math.round(x * 100) / 100;
export const isMicro = steps => steps.some(x => Math.abs(x - Math.round(x)) > 0.01);
/* The notes of a scale, the same whichever card they come from */
export const pcKey = steps => [...new Set(steps.map(x => r2(mod12(x))))].sort((a, b) => a - b).join(',');

/* An own scale as the rest of the app reads scales */
export function ownCard(o) {
  return { id: o.id, name: o.name, aka: 'Your scale', steps: o.steps.slice(), tonic: o.tonic, note: o.note || '', region: 'Yours', styles: [], fam: ['mine'], own: true, tier: 0 };
}

export function buildLibrary(D, lib, own) {
  const cards = [], byKey = new Map();
  const famOf = (lib && lib.FAMILY_OF) || {};
  const add = (c, extra) => {
    const card = Object.assign({ aka: '', region: '', note: '', styles: [] }, c, extra);
    card.steps = c.steps.slice();
    card.fam = card.fam || famOf[c.id] || famOf[c.same] || ['modes'];
    card.micro = isMicro(card.steps);
    const k = pcKey(card.steps);
    // an own scale stands on its own: it is never folded into a library scale, nor one into it
    if (!card.own) {
      if (card.same && !byKey.has(k)) delete card.same;
      if (!card.same && byKey.has(k)) card.same = byKey.get(k).id;
      if (!card.same) byKey.set(k, card);
    }
    cards.push(card);
  };
  const seen = new Set();
  catalogue(D).forEach(s => { seen.add(s.id); add(s); });
  (D.SCALES || []).filter(s => s.same).forEach(s => { seen.add(s.id); add(s, { app: true }); });
  if (lib) {
    (lib.LIB_SCALES || []).filter(s => !seen.has(s.id)).forEach(s => add(s));
    (lib.melakartas ? lib.melakartas() : []).forEach(s => add(s));
  }
  listOwn(own).forEach(o => add(ownCard(o)));
  // the other names of each scale: the cards that share its notes, and the names scales-world.js gives it
  const byId = new Map(cards.map(c => [c.id, c]));
  cards.forEach(c => { if (c.same) { const m = byId.get(c.same); m.also = (m.also || []).concat(c.name); } });
  return cards;
}

/* What the finder ranks: one entry per set of notes, with every name it goes by, and your own scales */
export function finderList(cards) {
  return cards.filter(c => !c.same).map(c => Object.assign({}, c, { more: [...new Set((c.more || []).concat(c.also || []))] }));
}

/* Search and filters for the list: words (any order) against the names, other names, region and notes;
   fam a family id ('all', 'mine', 'micro' or one of FAMILIES); n the number of notes (0 any, 8 for 8 or more) */
export function filterCards(cards, { q = '', fam = 'all', n = 0 } = {}) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  return cards.filter(c => {
    if (fam === 'micro' ? !c.micro : fam !== 'all' && !c.fam.includes(fam)) return false;
    const len = new Set(c.steps.map(x => r2(mod12(x)))).size;
    if (n && (n >= 8 ? len < 8 : len !== n)) return false;
    if (!words.length) return true;
    const hay = [c.name, c.aka, c.region, c.note, (c.more || []).join(' '), (c.also || []).join(' ')].join(' ').toLowerCase();
    return words.every(w => hay.includes(w));
  });
}

/* Find a scale by id anywhere: D.SCALES, your own, then the library if it is loaded (D.SCALE_LIB) */
export function resolveScale(id, D, own) {
  const s = (D.SCALES || []).find(x => x.id === id);
  if (s) return s;
  const o = own && own[id] && cleanScale(own[id]);
  if (o) return ownCard(o);
  if (D.SCALE_LIB) return libCards(D, own).find(c => c.id === id) || null;
  return null;
}
let cache = null;
function libCards(D, own) {
  const key = JSON.stringify(own || {});
  if (!cache || cache.lib !== D.SCALE_LIB || cache.key !== key) cache = { lib: D.SCALE_LIB, key, cards: buildLibrary(D, D.SCALE_LIB, own) };
  return cache.cards;
}
export const libraryCards = libCards;

/* ---------- Your own scales ---------- */
export const MAX_NOTES = 24;
/* Steps from a typed interval list: "2 1 2 2 2 1 2", "W H W W H W W", "2,2,1.5,…" (quarter tones as .5).
   The intervals must come to an octave; if they come short, the last one is the step back home. Returns
   { steps, intervals, error } with steps from 0 (the octave left off). */
export function parseSteps(text) {
  const toks = String(text || '').trim().split(/[\s,;·|]+/).filter(Boolean);
  if (!toks.length) return { steps: null, intervals: [], error: 'Type the steps between the notes, such as 2 2 1 2 2 2 1.' };
  const iv = [];
  for (const t of toks) {
    const u = t.toUpperCase().replace('½', '.5').replace('¼', '.25');
    const named = { H: 1, S: 1, W: 2, T: 2, WH: 3, 'W+H': 3, 'A2': 3, Q: 0.5 }[u];
    const v = named ?? (/^\d*\.?\d+$/.test(u) ? +u : NaN);
    if (!Number.isFinite(v)) return { steps: null, intervals: iv, error: '“' + t + '” isn’t a step. Use numbers of half steps (1, 2, 1.5), or W and H.' };
    if (v <= 0) return { steps: null, intervals: iv, error: 'A step of 0 would play the same note twice.' };
    iv.push(r2(v));
  }
  const total = r2(iv.reduce((a, x) => a + x, 0));
  if (total > 12) return { steps: null, intervals: iv, error: 'These steps come to ' + total + ' half steps: more than an octave (12).' };
  if (total < 12) iv.push(r2(12 - total));
  if (iv.length > MAX_NOTES) return { steps: null, intervals: iv, error: 'That is more than ' + MAX_NOTES + ' notes.' };
  if (iv.length < 2) return { steps: null, intervals: iv, error: 'A scale needs at least two notes.' };
  const steps = [0];
  iv.slice(0, -1).forEach(x => steps.push(r2(steps[steps.length - 1] + x)));
  return { steps, intervals: iv, error: null };
}
/* The intervals of a scale as text, for the steps field: "2 1 2 2 2 1 2" */
export function intervalsOf(steps) {
  const s = normSteps(steps);
  return s.map((x, i) => r2((i + 1 < s.length ? s[i + 1] : 12) - x));
}
export const stepsText = steps => intervalsOf(steps).join(' ');
/* Sorted, unique, within the octave, from 0 */
export function normSteps(steps) {
  const s = [...new Set((steps || []).filter(Number.isFinite).map(x => r2(mod12(x))))].sort((a, b) => a - b);
  if (s[0] !== 0) s.unshift(0);
  return s;
}
/* Add or take away one note (a tap on the neck), relative to the tonic; the tonic itself stays */
export function toggleStep(steps, x) {
  const v = r2(mod12(x)), s = normSteps(steps);
  if (v === 0) return s;
  const i = s.findIndex(y => Math.abs(y - v) < 0.01);
  return i >= 0 ? s.filter((_, j) => j !== i) : normSteps(s.concat(v));
}
/* An own scale fit to keep and to play, or null: from this device or another one, or an older app */
export function cleanScale(o) {
  if (!o || typeof o !== 'object' || typeof o.id !== 'string' || !o.id) return null;
  if (!Array.isArray(o.steps)) return null;
  const steps = normSteps(o.steps.filter(x => typeof x === 'number'));
  if (steps.length < 2 || steps.length > MAX_NOTES) return null;
  return {
    id: o.id.slice(0, 60), name: String(o.name || 'My scale').slice(0, 80) || 'My scale', steps,
    tonic: Number.isInteger(o.tonic) ? mod12(o.tonic) : 0, note: String(o.note || '').slice(0, 2000),
    created: Number(o.created) || 0, updatedAt: Number(o.updatedAt) || 0
  };
}
export function listOwn(own) {
  return Object.values(own || {}).map(cleanScale).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
}

/* ---------- On the neck ---------- */
/* Every place a scale's notes sit on frets 0..maxFret, fractional frets for notes between them.
   strings: [{ midi }] low to high. Returns [{ s, f, x (the step), micro }] */
export function neckSpots(steps, tonic, strings, maxFret = 12) {
  const out = [];
  strings.forEach((st, si) => steps.forEach(x => {
    for (let f = mod12(tonic + x - st.midi); f <= maxFret + 0.001; f += 12) out.push({ s: si, f: r2(f), x, micro: Math.abs(f - Math.round(f)) > 0.01 });
  }));
  return out;
}
/* A fractional pitch as text: "E¼♭" for a quarter tone under E, else the nearest note and its cents ("D +40¢").
   name(pc) gives a pitch class's name. */
export function microName(p, name) {
  const fr = r2(p - Math.floor(p));
  if (fr < 0.01) return name(mod12(Math.round(p)));
  if (Math.abs(fr - 0.5) < 0.01) return name(mod12(Math.ceil(p))) + '¼♭';
  const n = Math.round(p), c = Math.round((p - n) * 100);
  return name(mod12(n)) + (c > 0 ? ' +' : ' −') + Math.abs(c) + '¢';
}
/* The steps between notes, as a player reads them: H, W, W+H, ¼ and so on */
export function stepWords(steps) {
  return intervalsOf(steps).map(d => (d === 1 ? 'H' : d === 2 ? 'W' : d === 3 ? 'W+H' : d === 0.5 ? '¼' : d === 1.5 ? '¾' : d === 2.5 ? '1¼' : String(d))).join(' ');
}
