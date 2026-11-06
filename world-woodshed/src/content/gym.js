/* World Woodshed — Rhythm gym exercises: tuplets, polyrhythms, the 16th-note grid, displaced clicks, echo.
   Each exercise gives, per bar, where the player's notes fall (in beats from the bar start), what the click
   plays, and which bars are guided (the app plays the part) or silent. No imports: the engine reads it too. */
const SYL = { 1: ['ta'], 2: ['ta', 'ka'], 3: ['ta', 'ki', 'ta'], 4: ['ta', 'ka', 'di', 'mi'], 5: ['ta', 'di', 'ki', 'na', 'tom'], 6: ['ta', 'ka', 'di', 'mi', 'ta', 'ka'], 7: ['ta', 'ki', 'ta', 'ta', 'ka', 'di', 'mi'] };
const NAME = { 1: 'quarters', 2: 'eighths', 3: 'triplets', 4: 'sixteenths', 5: 'quintuplets', 6: 'sextuplets', 7: 'septuplets' };
const perBeat = (n, beats) => { const o = []; for (let b = 0; b < beats; b++) for (let k = 0; k < n; k++) o.push(b + k / n); return o; };
const overSpan = (n, span, beats) => { const o = []; for (let b0 = 0; b0 < beats; b0 += span) for (let k = 0; k < n; k++) o.push(b0 + k * span / n); return o; };
export const beatsClick = beats => Array.from({ length: beats }, (_, b) => ({ pos: b, hi: b === 0 }));
const sixteenths = (idx, beats = 4) => idx.filter(i => i < beats * 4).map(i => i / 4);

export const GYM = [];
const add = (cat, x) => GYM.push(Object.assign({ cat, beats: 4, bpm: [50, 100], plan: [true, true, false, false] }, x));

// --- subdivisions and tuplets
add('tuplets', { id: 'ladder', tier: 1, name: 'Subdivision ladder: 1 to 7 per beat', bpm: [50, 80], plan: [true, false],
  desc: 'Change gear every two bars: quarters, eighths, triplets, sixteenths, quintuplets, sextuplets, septuplets, and back down. Say the syllables.',
  pattern: bar => { const seq = [1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2]; const n = seq[Math.floor(bar / 2) % seq.length]; return perBeat(n, 4); },
  label: bar => { const seq = [1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2]; const n = seq[Math.floor(bar / 2) % seq.length]; return n + ' per beat (' + NAME[n] + '): ' + SYL[n].join('-'); } });
[[3, 1], [5, 3], [6, 2], [7, 4]].forEach(([n, tier]) => add('tuplets', { id: 'tup' + n, tier, name: NAME[n][0].toUpperCase() + NAME[n].slice(1) + ': ' + n + ' per beat against quarters',
  desc: n + ' even notes in every beat while the click plays quarters. Feel where they fall against the 16ths. Say ' + SYL[n].join('-') + '.', pattern: () => perBeat(n, 4), label: () => SYL[n].join('-') + ' on every beat' }));
add('tuplets', { id: 'trip8v16', tier: 2, name: 'Switch: triplets ↔ sixteenths every bar', plan: [true, false],
  desc: 'One bar of triplets, one bar of sixteenths. The hardest part is the change at the bar line.', pattern: bar => perBeat(bar % 2 ? 4 : 3, 4), label: bar => (bar % 2 ? 'Sixteenths: ta-ka-di-mi' : 'Triplets: ta-ki-ta') });
add('tuplets', { id: 'qtrip', tier: 2, name: 'Quarter-note triplets: 3 over 2 beats', desc: 'Three even notes across every two beats. The middle one falls exactly between the 16th grid’s “a” of beat 1 and the “e” of beat 2.', pattern: () => overSpan(3, 2, 4), label: () => '3 in the time of 2 beats' });
add('tuplets', { id: 'htrip', tier: 3, name: 'Half-note triplets: 3 over 4 beats', desc: 'Three even notes across the whole bar. Feel the quarter-note triplets first, then play every other one.', pattern: () => overSpan(3, 4, 4), label: () => '3 in the time of 4 beats' });
add('tuplets', { id: 'q5over2', tier: 4, name: 'Five over two beats', desc: 'Five even notes across two beats. Count the 16th-note quintuplets (10 per 2 beats) and play every other one.', pattern: () => overSpan(5, 2, 4), label: () => '5 in the time of 2 beats' });
add('tuplets', { id: 'q5over4', tier: 5, name: 'Quarter-note quintuplets: 5 over 4 beats', desc: 'Five even notes across the bar. A favourite of modern jazz and progressive rock.', pattern: () => overSpan(5, 4, 4), label: () => '5 in the time of 4 beats' });

// --- feel changes: one steady beat, the feel underneath it changes every few bars (you choose 1, 2 or 4).
// The bar before a change shows the next feel and rings a bell on its last beat; the first bar of each feel is guided.
export const FEELS = {
  q: { name: 'Quarters', say: 'ta', pos: perBeat(1, 4) },
  e: { name: 'Eighths', say: 'ta-ka', pos: perBeat(2, 4) },
  t: { name: 'Triplets', say: 'ta-ki-ta', pos: perBeat(3, 4) },
  s: { name: 'Sixteenths', say: 'ta-ka-di-mi', pos: perBeat(4, 4) },
  sw: { name: 'Swing eighths', say: 'ta – ta (the 1st and 3rd of each triplet)', pos: perBeat(3, 4).filter((_, i) => i % 3 !== 1) },
  q3: { name: '3 against 2 (quarter-note triplets)', say: '3 even notes across every 2 beats', pos: overSpan(3, 2, 4) },
  h3: { name: '3 against 4 (half-note triplets)', say: '3 even notes across the bar', pos: overSpan(3, 4, 4) },
  d8: { name: 'Dotted eighths (3 + 3 + 3 …)', say: 'every 3rd sixteenth', pos: sixteenths([0, 3, 6, 9, 12, 15]) }
};
export const SEGS = [1, 2, 4];
const segOf = o => (o && SEGS.includes(o.seg) ? o.seg : 2);
const surprise = new Map(); // run → feels chosen so far, so a change never lands on the same feel
function feelSeq(ex, i, run) {
  if (!ex.random) return ex.seq[i % ex.seq.length];
  let got = surprise.get(run);
  if (!got) { if (surprise.size > 20) surprise.clear(); got = [ex.seq[0]]; surprise.set(run, got); }
  while (got.length <= i) {
    const rng = seeded(run * 131 + got.length * 17 + 5), prev = ex.seq.indexOf(got[got.length - 1]);
    rng();
    got.push(ex.seq[(prev + 1 + Math.floor(rng() * (ex.seq.length - 1))) % ex.seq.length]);
  }
  return got[i];
}
export const feelAt = (ex, bar, run = 0, o) => FEELS[feelSeq(ex, Math.floor(bar / segOf(o)), run)];
export const nextFeel = (ex, bar, run = 0, o) => { const seg = segOf(o); return bar % seg === seg - 1 ? FEELS[feelSeq(ex, Math.floor(bar / seg) + 1, run)] : null; };
const feelAdd = (id, tier, name, seq, desc, x) => add('feel', Object.assign({
  id, tier, name, seq, feels: true, desc: desc + ' The bar before each change shows the next feel and rings a bell on its last beat.',
  pattern: (bar, run, o) => feelAt(GYM.find(g => g.id === id), bar, run, o).pos,
  label: (bar, run, o) => { const ex = GYM.find(g => g.id === id), f = feelAt(ex, bar, run, o), n = nextFeel(ex, bar, run, o); return f.name + ': ' + f.say + (n && n !== f ? '  →  next: ' + n.name : ''); },
  cue: (bar, run, o) => { const ex = GYM.find(g => g.id === id), n = nextFeel(ex, bar, run, o); return !!n && n !== feelAt(ex, bar, run, o); },
  // the first bar of each feel is guided; with one bar per feel, guided and alone take turns a whole pass at a time
  guided: (bar, o) => { const seg = segOf(o), ex = GYM.find(g => g.id === id); return seg === 1 ? Math.floor(bar / (ex.random ? 4 : ex.seq.length)) % 2 === 0 : bar % seg < seg / 2; }
}, x));
feelAdd('feel-up', 1, 'Quarters → eighths → triplets → sixteenths', ['q', 'e', 't', 's', 't', 'e'], 'Up the gears and back down over the same beat: 1, 2, 3, then 4 notes per beat. Keep the beat where it is; only what you fit inside it changes.', { bpm: [50, 90] });
feelAdd('feel-8t', 1, 'Eighths ↔ triplets', ['e', 't'], 'Two notes per beat, then three. The beat stays put: the second triplet comes earlier than the “&” did.', { bpm: [50, 100] });
feelAdd('feel-q32', 2, 'Quarters ↔ 3 against 2', ['q', 'q3'], 'On the beat, then three even notes across every two beats (quarter-note triplets) while the click keeps the beat. Only every other one lands on a beat.', { bpm: [50, 100] });
feelAdd('feel-t32', 2, 'Triplets ↔ 3 against 2', ['t', 'q3'], 'Three per beat, then every other triplet: that is 3 against 2. Keep the triplets running in your head through the slow bars.', { bpm: [50, 100] });
feelAdd('feel-swing', 2, 'Straight ↔ swing eighths', ['e', 'sw'], 'Even eighths, then swung: the “&” moves late to the last note of the triplet. The same two notes per beat, a different feel.', { bpm: [60, 140] });
feelAdd('feel-16d8', 3, 'Sixteenths ↔ dotted eighths', ['s', 'd8'], 'Four per beat, then every third sixteenth: a group of three that drifts across the beat and comes home after three beats.', { bpm: [50, 90] });
feelAdd('feel-over', 3, 'Over the bar: quarters, 3 against 2, 3 against 4', ['q', 'q3', 'h3', 'q3'], 'The notes get longer than the beat: on the beat, then three across two beats, then three across the whole bar, and back.', { bpm: [50, 100] });
feelAdd('feel-all', 4, 'Surprise changes', ['q', 'e', 't', 's', 'sw', 'q3', 'h3', 'd8'], 'Every feel, in an order you can\'t predict. Read the next one in the bar before it and change on the bar line.', { random: true, bpm: [50, 90] });

// --- polyrhythms: the click plays one side, you play the other
[[3, 2, 1], [2, 3, 2], [4, 3, 3], [3, 4, 3], [5, 4, 4], [4, 5, 4], [5, 3, 5], [7, 4, 5]].forEach(([n, m, tier]) => add('poly', {
  id: 'p' + n + m, tier, beats: m, bpm: [50, 110], name: n + ' against ' + m, poly: [n, m],
  desc: 'The click plays ' + m + ' even beats; you play ' + n + ' evenly across them. ' + (n * m <= 12 ? 'Both line up only on beat 1. Count the ' + n * m + ' tiny pulses where they meet.' : 'Feel the long cycle; land together on 1.'),
  pattern: () => overSpan(n, m, m), label: () => n + ':' + m }));

// --- the 16th-note grid
const POS = { e: [1], and: [2], a: [3], ea: [1, 3], ena: [1, 2, 3], one_a: [0, 3], one_e: [0, 1] };
[['and', 'Only the “&”', 1], ['e', 'Only the “e”', 2], ['a', 'Only the “a”', 2], ['ea', 'The “e” and the “a”', 3], ['one_a', 'Gallop: 1 and “a”', 2], ['one_e', 'Reverse gallop: 1 and “e”', 3], ['ena', 'Everything but the beat', 3]].forEach(([k, nm, tier]) => add('grid16', {
  id: 'pos-' + k, tier, name: nm + ' of every beat', desc: 'Sixteenths: 1 e & a. Play only ' + nm.toLowerCase().replace('only ', '') + ' while the click marks the beat. It trains you to place notes anywhere in the 16th grid, not only on the beat.',
  pattern: () => { const o = []; for (let b = 0; b < 4; b++) POS[k].forEach(i => o.push(b + i / 4)); return o; }, label: () => nm }));
add('grid16', { id: 'moving16', tier: 2, name: 'The moving sixteenth', plan: [true, false], desc: 'One note per beat that moves through the beat: on 1 for a bar, then on the e, the &, the a. Say “1 e & a” and only play the moving one.',
  pattern: bar => { const i = Math.floor(bar / 2) % 4; return [0, 1, 2, 3].map(b => b + i / 4); }, label: bar => 'On the ' + ['beat', '“e”', '“&”', '“a”'][Math.floor(bar / 2) % 4] });
add('grid16', { id: 'g332', tier: 2, name: '3+3+2 in sixteenths (tresillo, twice a bar)', desc: 'Accents grouped 3+3+2 over sixteenths, twice per bar. The same shape as tresillo, at double speed: the root of reggaeton, dembow and much funk.', pattern: () => sixteenths([0, 3, 6, 8, 11, 14]), label: () => '3 + 3 + 2 | 3 + 3 + 2' });
[[3, 3, 'over three bars'], [5, 4, 'over five bars'], [7, 5, 'over seven bars']].forEach(([g, tier, over]) => add('grid16', {
  id: 'group' + g, tier, name: 'Groups of ' + g + ' over sixteenths', plan: [true, true, false, false], cycleBars: g,
  desc: 'Accent every ' + g + 'th sixteenth while the 16ths run on. The accent drifts across the beat and comes home ' + over + '. A konnakol and progressive rock classic.',
  pattern: bar => { const o = []; for (let i = 0; i < 16; i++) if ((bar * 16 + i) % g === 0) o.push(i / 4); return o; }, label: bar => 'Group of ' + g + ' · bar ' + (bar % g + 1) + ' of ' + g }));

// --- displaced click: the click moves off the beat, you keep the beat
[['and', 0.5, 'the “&”', 2], ['e', 0.25, 'the “e”', 3], ['a', 0.75, 'the “a”', 4]].forEach(([k, off, nm, tier]) => add('displace', {
  id: 'disp-' + k, tier, name: 'Click on ' + nm + ', you play the beat', plan: [true, true, false, false], bpm: [60, 110],
  desc: 'The click sounds on ' + nm + ' of every beat. Hear it as off-beat and play the beats themselves. If the click starts to feel like the beat, slow down.',
  click: () => [0, 1, 2, 3].map(b => ({ pos: b + off, hi: false })), countIn: true, pattern: () => [0, 1, 2, 3], label: () => 'Click on ' + nm }));
add('displace', { id: 'disp-24', tier: 1, name: 'Click on 2 and 4 only', desc: 'The click plays only the backbeat, like a hi-hat in jazz or a snare in rock. Play all four beats and let 2 and 4 sit in the click.', click: () => [{ pos: 1, hi: false }, { pos: 3, hi: false }], countIn: true, pattern: () => [0, 1, 2, 3], label: () => 'Backbeat click' });
add('displace', { id: 'disp-bar', tier: 3, name: 'One click per two bars', plan: [true, true, true, true], desc: 'The click only sounds on beat 1 of every other bar. Play every beat in between and land with it.', click: bar => (bar % 2 ? [] : [{ pos: 0, hi: true }]), countIn: true, pattern: () => [0, 1, 2, 3], label: bar => (bar % 2 ? 'No click this bar' : 'Click on 1') });

// --- echo: hear a bar, play it back
const seeded = seed => () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
function randomBar(rng, tier) {
  // a musical 16th rhythm: each beat picks a cell; harder tiers allow syncopated cells
  const easy = [[0], [0, 2], [0, 1, 2, 3], [0, 2, 3], [0, 1, 2]], hard = [[0, 3], [1, 2], [0, 1, 3], [2], [1, 3], [3], [0, 1]];
  const cells = tier >= 3 ? easy.concat(hard) : easy;
  const o = [];
  for (let b = 0; b < 4; b++) cells[Math.floor(rng() * cells.length)].forEach(i => o.push(b + i / 4));
  return o;
}
[[2, 'Echo: sixteenth rhythms'], [4, 'Echo: syncopated sixteenths']].forEach(([tier, nm]) => add('echo', {
  id: 'echo' + tier, tier, name: nm, plan: [true, false], bpm: [60, 100],
  desc: 'The app plays a one-bar rhythm on the 16th grid; you play it straight back in the next bar. A new rhythm every two bars. Hearing, remembering and placing 16ths in one exercise.',
  pattern: (bar, run) => randomBar(seeded(1000 * run + Math.floor(bar / 2) * 7 + 3), tier), label: bar => (bar % 2 ? 'Your turn: play it back' : 'Listen…') }));

export const gymItems = () => GYM.map(x => ({ id: x.id, label: x.name, tier: x.tier }));
export const CATS = { tuplets: 'Subdivisions & tuplets', feel: 'Feel changes', poly: 'Polyrhythms', grid16: 'The 16th-note grid', displace: 'Displaced click', echo: 'Echo' };

