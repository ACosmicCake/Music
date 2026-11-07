/* World Woodshed — game mode: personal high-score tables. Plain functions (no DOM), tested in test/games.test.js.
   state.games = { <game id>: [ { s: score, t: when (ms), d: device, ...details } ] }, best first, at most BOARD
   entries per game. The tables sync with the rest of the progress: two copies are joined (an entry is the same
   entry on both when its time and device match) and the best BOARD kept, so a high score set on the phone and
   one set on the laptop both stay. */
export const BOARD = 10;
const isObj = x => x && typeof x === 'object' && !Array.isArray(x);
const keyOf = e => e.t + '@' + (e.d || '');
const valid = e => isObj(e) && Number.isFinite(e.s) && Number.isFinite(e.t);
// best first; a tie goes to the score set first (it was there before)
const order = (a, b) => b.s - a.s || a.t - b.t;

/* A game's table made safe (it may come from another device or an old copy) */
export const table = list => (Array.isArray(list) ? list.filter(valid).slice().sort(order).slice(0, BOARD) : []);

/* Add a score: returns { list, rank } with rank counted from 1, or 0 when it didn't make the table */
export function addScore(list, entry) {
  const e = Object.assign({}, entry);
  if (!valid(e)) return { list: table(list), rank: 0 };
  const all = table(list).filter(x => keyOf(x) !== keyOf(e)).concat([e]).sort(order).slice(0, BOARD);
  return { list: all, rank: all.indexOf(e) + 1 };
}

/* Where a score would place without adding it (1 = a new best), 0 if it wouldn't make the table */
export function rankFor(list, s) {
  const t = table(list);
  const r = t.filter(x => x.s >= s).length + 1;
  return r <= BOARD ? r : 0;
}

export const best = list => { const t = table(list); return t.length ? t[0] : null; };

/* Join two copies of every game's table */
export function mergeGames(a, b) {
  const out = {};
  const A = isObj(a) ? a : {}, B = isObj(b) ? b : {};
  new Set([...Object.keys(A), ...Object.keys(B)]).forEach(g => {
    const m = new Map();
    [...table(A[g]), ...table(B[g])].forEach(e => { if (!m.has(keyOf(e))) m.set(keyOf(e), e); });
    out[g] = table([...m.values()]);
  });
  return out;
}

/* ---------- The Tower: how a run climbs ----------
   Each tower has TOWER steps. A right answer climbs one, a wrong one drops one (never below the tower's
   ground floor: a tower climbed stays climbed). Five wrong answers end the run. The score is the highest
   step reached across the towers, with a small bonus for quick answers. */
export const TOWER = 12;
export const TOWER_HEARTS = 5;
/* What the singer sings on the nth tower (from 0): its directions and the seconds to answer (0 = no limit) */
export function towerStage(n) {
  if (n <= 0) return { dirs: ['up'], secs: 0, name: 'The garden tower', note: 'Rising intervals, no hurry.' };
  if (n === 1) return { dirs: ['down'], secs: 12, name: 'The bell tower', note: 'Falling intervals, 12 seconds each.' };
  if (n === 2) return { dirs: ['up', 'down'], secs: 9, name: 'The lighthouse', note: 'Rising and falling, 9 seconds each.' };
  if (n === 3) return { dirs: ['harm'], secs: 9, name: 'The star tower', note: 'Two notes at once, 9 seconds each.' };
  return { dirs: ['up', 'down', 'harm'], secs: Math.max(4, 8 - (n - 4)), name: 'The cloud tower ' + (n - 3), note: 'Everything, faster each tower.' };
}
/* one answer: the new step and tower (step counts from 0 at the bottom of tower 0) */
export function climb(step, ok) {
  const floor = Math.floor(step / TOWER) * TOWER;
  const next = ok ? step + 1 : Math.max(floor, step - 1);
  return { step: next, tower: Math.floor(next / TOWER), topped: ok && next % TOWER === 0 };
}
/* points for a right answer: 10 a step, up to 5 more for answering in the first seconds */
export const towerPoints = (secs, limit) => 10 + Math.max(0, Math.round(5 - secs * (limit ? 5 / limit : 1)));

/* ---------- Updraft: how a run scores ----------
   Every note of the rhythm is a gate in the clouds. A tap within PERFECT of it is a perfect pass, within the
   exercise's window a good one; a gate passed without a tap costs a heart. Points grow with the combo, and
   gates in the bars you play alone (the guide silent) are worth double. */
export const PERFECT = 0.04;
export const UPDRAFT_HEARTS = 3;
export function gatePoints(kind, combo, alone) {
  const base = kind === 'perfect' ? 100 : kind === 'good' ? 50 : 0;
  return Math.round(base * (1 + Math.min(combo, 20) * 0.1) * (alone ? 2 : 1));
}
/* the tempo after a number of bars: 4 bpm more every 4 bars, up to the exercise's top tempo plus 20 */
export const updraftBpm = (start, bars, top) => Math.min(Math.max(start, top + 20), start + 4 * Math.floor(Math.max(0, bars) / 4));

/* ---------- Matching taps to notes (Two Drums, Parrot) ----------
   Each written time takes the nearest unused tap within win seconds. Returns the hits, the signed errors
   (seconds, + late) per note (null when missed) and the taps left over inside the span. */
export function matchTaps(expected, taps, win) {
  const used = new Set();
  const errs = expected.map(t => {
    let best = -1, bd = Infinity;
    taps.forEach((tp, j) => { if (used.has(j)) return; const d = tp - t; if (Math.abs(d) <= win && Math.abs(d) < Math.abs(bd)) { bd = d; best = j; } });
    if (best < 0) return null;
    used.add(best); return bd;
  });
  const lo = expected.length ? Math.min(...expected) - win : 0, hi = expected.length ? Math.max(...expected) + win : 0;
  const extra = taps.filter((tp, j) => !used.has(j) && tp >= lo && tp <= hi).length;
  const hits = errs.filter(e => e !== null).length;
  return { hits, errs, extra, rate: expected.length ? hits / expected.length : 1 };
}

/* ---------- Tightrope: keep the beat as the click fades ----------
   You play every beat. The click sounds on every beat for 8 bars, then on 2 and 4, then on 1, then on 1 of every
   other bar, then of every fourth bar. Each note leans the walker by how early (−) or late (+) it was, as a
   fraction of a beat, and the lean settles back a little each beat: a steady rush or drag of about a tenth of a
   beat tips you off; a beat with no note jolts you. */
export const ROPE_STAGES = ['every beat', 'beats 2 and 4', 'beat 1', 'beat 1 of every other bar', 'beat 1 of every fourth bar'];
export const ROPE_BARS = 8;
export const ropeStage = beat => Math.min(ROPE_STAGES.length - 1, Math.floor(Math.max(0, beat) / (ROPE_BARS * 4)));
export function ropeClick(stage, beat) {
  const b = ((beat % 4) + 4) % 4, bar = Math.floor(beat / 4);
  if (stage <= 0) return true;
  if (stage === 1) return b === 1 || b === 3;
  if (stage === 2) return b === 0;
  if (stage === 3) return b === 0 && bar % 2 === 0;
  return b === 0 && bar % 4 === 0;
}
/* err: signed fraction of a beat, or null for a beat with no note */
export function leanAfter(lean, err) {
  if (err === null) return lean * 0.85 + (lean >= 0 ? 0.35 : -0.35);
  return lean * 0.85 + err * 1.6;
}
export const ropeFell = lean => Math.abs(lean) >= 1;
export const ropePoints = (err, stage) => Math.round((10 + Math.max(0, 10 - Math.abs(err) * 200)) * (1 + stage * 0.5));

/* ---------- Two Drums: a polyrhythm, one thumb on each layer ----------
   Rounds of 4 bars (2 with the app playing both layers, 2 alone) on each polyrhythm in turn. A round passes when
   each layer has at least DRUM_PASS of its notes in time; a failed round costs one of three hearts and comes again. */
export const DRUM_PASS = 0.75;
export const drumRoundPoints = (rateL, rateR, extra, n) => Math.max(0, Math.round((rateL + rateR) * 50 * n - extra * 10));
export const drumPassed = (rateL, rateR) => rateL >= DRUM_PASS && rateR >= DRUM_PASS;

/* ---------- Parrot: echo a rhythm that grows a beat each round ----------
   The phrase is one cell of sixteenths per beat. Pass when every note is played back in time with at most one
   extra; a slip costs one of three feathers and the same phrase comes again. */
const EASY = [[0], [0, 2], [0, 1, 2, 3], [0, 2, 3], [0, 1, 2]], HARD = [[0, 3], [1, 2], [0, 1, 3], [2], [1, 3], [3], [0, 1]];
export function parrotCell(rnd, len) {
  const cells = len >= 5 ? EASY.concat(HARD) : EASY;
  return cells[Math.floor(rnd() * cells.length) % cells.length];
}
/* the phrase's notes in beats from its start: cells[i] is beat i */
export const phraseNotes = cells => cells.flatMap((c, b) => c.map(i => b + i / 4));
export const echoPassed = m => m.hits === m.errs.length && m.extra <= 1;
export const echoPoints = (m, win) => Math.round(m.errs.reduce((a, e) => a + (e === null ? 0 : 10 + Math.max(0, 10 * (1 - Math.abs(e) / win))), 0));
