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
