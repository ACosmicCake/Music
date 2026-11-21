/* World Woodshed — phrase lengths: soloing in phrases of a set number of bars (plain functions, test/phrases.test.js).
   A round is a phrase you play and then as many bars of rest while the band keeps going: play 2, rest 2, play 2…
   Half-bar phrases play the first half of each bar (the larger half in an odd metre) and rest the other.
   Mixed changes the length every few rounds, never to the same length twice running.
   The tool is src/tools/phrases.js; each length is an item of the smart plan, 'phrase:<id>' (src/curriculum.js). */

// tier and order are the planner's: one- and two-bar phrases first, then half a bar and four, then eight and mixed
export const LENGTHS = [
  { id: '1', bars: 1, name: 'One-bar phrases', short: '1 bar', tier: 1, order: 0 },
  { id: '2', bars: 2, name: 'Two-bar phrases', short: '2 bars', tier: 1, order: 1 },
  { id: 'half', bars: 0.5, name: 'Half-bar phrases', short: '½ bar', tier: 2, order: 2 },
  { id: '4', bars: 4, name: 'Four-bar phrases', short: '4 bars', tier: 2, order: 3 },
  { id: '8', bars: 8, name: 'Eight-bar phrases', short: '8 bars', tier: 3, order: 4 },
  { id: 'mix', bars: null, name: 'Mixed phrase lengths', short: 'Mixed', tier: 3, order: 5 }
];
export const FIXED = LENGTHS.filter(x => x.bars);
export const lengthOf = id => LENGTHS.find(x => x.id === String(id)) || LENGTHS[0];
export const MIX_FROM = ['1', '2', '4'];
export const MIX_EVERY = [1, 2, 4];

/* The lengths a mixed run picks from: known fixed lengths, at least two of them (else the default) */
export function mixFrom(list) {
  const ok = Array.isArray(list) ? FIXED.map(x => x.id).filter(id => list.includes(id)) : [];
  return ok.length >= 2 ? ok : MIX_FROM.slice();
}

/* Beats a phrase of `bars` plays and rests in a bar of `bpb` beats */
export function windowBeats(bars, bpb) {
  if (bars >= 1) return { play: bars * bpb, rest: bars * bpb };
  const play = Math.ceil(bpb / 2);
  return { play, rest: bpb - play };
}

/* The run of rounds. opts: { len: '1'|'2'|'half'|'4'|'8'|'mix', bpb, from (mix), every (mix), rng }.
   at(beat) for a beat counted from 0 at the first bar after the count-in gives
   { round, bars, play, into, left, beats, bar, ofBars, last, next }: the round's phrase length in bars, whether this
   beat is in the phrase or the rest, beats into and left in that part (left counts this beat), its length in beats,
   the bar of that part (1-based) and how many it has, whether this is its last beat, and the next round's length. */
export function Phraser(opts) {
  const bpb = Math.max(1, Math.round(opts.bpb || 4)), rng = opts.rng || Math.random;
  const L = lengthOf(opts.len), from = mixFrom(opts.from), every = MIX_EVERY.includes(+opts.every) ? +opts.every : 2;
  const rounds = []; // { bars, start, play, rest }
  let mixPrev = null;
  function lenFor(i) {
    if (L.bars) return L.bars;
    if (i % every === 0 || mixPrev === null) {
      const pool = from.filter(id => lengthOf(id).bars !== mixPrev);
      mixPrev = lengthOf(pool[Math.floor(rng() * pool.length) % pool.length]).bars;
    }
    return mixPrev;
  }
  function grow(beat) {
    while (!rounds.length || rounds[rounds.length - 1].start + rounds[rounds.length - 1].play + rounds[rounds.length - 1].rest <= beat) {
      const i = rounds.length, prev = rounds[i - 1];
      const bars = lenFor(i), w = windowBeats(bars, bpb);
      rounds.push({ bars, start: prev ? prev.start + prev.play + prev.rest : 0, play: w.play, rest: w.rest });
    }
  }
  function roundAt(beat) {
    grow(beat);
    let lo = 0, hi = rounds.length - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (rounds[m].start <= beat) lo = m; else hi = m - 1; }
    return lo;
  }
  return {
    bpb,
    at(beat) {
      beat = Math.max(0, Math.floor(beat));
      const i = roundAt(beat), r = rounds[i];
      grow(r.start + r.play + r.rest); // so the next round is known
      const play = beat < r.start + r.play;
      const into = play ? beat - r.start : beat - r.start - r.play, beats = play ? r.play : r.rest;
      const ofBars = Math.max(1, Math.ceil(beats / bpb));
      return { round: i, bars: r.bars, play, into, left: beats - into, beats, bar: Math.floor(into / bpb) + 1, ofBars, last: into === beats - 1, next: rounds[i + 1].bars };
    },
    round: i => { grow(0); while (rounds.length <= i) grow(rounds[rounds.length - 1].start + rounds[rounds.length - 1].play + rounds[rounds.length - 1].rest); return Object.assign({}, rounds[i]); }
  };
}

/* "2 bars", "½ bar", "1 bar" for a length in bars */
export const barsName = n => (n === 0.5 ? '½ bar' : n + (n === 1 ? ' bar' : ' bars'));
