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
  if (n === 2) return { dirs: ['up', 'down'], secs: 9, name: 'The watchtower', note: 'Rising and falling, 9 seconds each.' };
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

/* ---------- Your own steady delay ----------
   A phone screen, a Bluetooth speaker or a keyboard adds a delay of its own, the same on every tap, which the app
   doesn't know (nothing calibrates taps). Played along with a click, that delay shows as every note a little late
   (or early) by the same amount. The rhythm games learn it from the bars you play with the click or the guide and
   take it off before judging, so a steady 60 ms from the screen doesn't count against you; what changes from note
   to note (rushing, dragging, an uneven hand) still does. delayTracker(max) keeps the median of the last errors
   it was given within ±max (seconds or beats, as given); get() is 0 until it has `need` of them. */
export function delayTracker(max, need = 3, keep = 24) {
  const list = [];
  return {
    add(e) { if (e !== null && e !== undefined && Number.isFinite(e) && Math.abs(e) <= max) { list.push(e); if (list.length > keep) list.shift(); } },
    get() { if (list.length < need) return 0; const s = list.slice().sort((a, b) => a - b), k = s.length >> 1; return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2; },
    get size() { return list.length; }
  };
}
/* Match taps after taking off the delay learned from them: a first pass with a wide window finds the steady delay
   (median of the errors, at most `max`), the second judges the shifted taps in the real window. */
export function matchShifted(expected, taps, win, tracker, max = 0.12) {
  matchTaps(expected, taps, Math.max(win, max)).errs.forEach(e => tracker.add(e));
  const off = tracker.get();
  return Object.assign(matchTaps(expected, taps.map(t => t - off), win), { offset: off });
}

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

/* ---------- Lighthouse Keeper: scale degrees ----------
   A harbour is one key, set by a cadence when you arrive; SHIPS ships call one note each and you light the
   lamp for its degree before they reach the rocks. Three wrecks end the run. Each harbour moves to a new key,
   gives less time and, from the third, brings in degrees one tier past those you have opened. */
export const SHIPS = 8;
export const WRECKS = 3;
export const harbourSecs = n => Math.max(5, 12 - n * 1.5);
export const harbourTier = (n, opened) => Math.min(5, Math.max(opened, n >= 2 ? opened + 1 : opened));
export const shipPoints = (secs, limit, harbour) => Math.round(towerPoints(secs, limit) * (1 + harbour * 0.5));

/* ---------- Firefly Hunt: the fretboard ----------
   Each round names a note (later two): find every place it sits on the neck, frets 0 to 12, before the
   fireflies fade. A wrong tap costs FIREFLY_PENALTY seconds; a round that runs out costs one of three lives. */
export const FIREFLY_PENALTY = 2;
export function fireflyRound(n) {
  return { secs: Math.max(12, 30 - n * 1.5), accidentals: n >= 4, two: n >= 9 };
}
export const fireflyPoints = (found, secsLeft, round) => found * 10 + Math.round(secsLeft * 5) * (1 + Math.floor(round / 3));

/* ---------- Lost in the Form: hear where the sections start ----------
   The band plays a tune's form with the chart hidden; tap the section's letter as it comes in. Within half a
   beat of its first downbeat is perfect, within a beat and a quarter good (early or late). */
export const sectionLetter = lbl => String(lbl || '').replace(/^([A-Z])\d+$/, '$1');
/* the bars where each section starts, with its letter: [{ bar, letter }] (bars counted from 0) */
export function formStarts(form) {
  const out = []; let n = 0;
  (form || []).forEach(([lbl, len]) => { out.push({ bar: n, letter: sectionLetter(lbl) }); n += len; });
  return out;
}
export const formLetters = form => [...new Set(formStarts(form).map(x => x.letter))];
export const formJudge = beats => (Math.abs(beats) <= 0.5 ? 'perfect' : Math.abs(beats) <= 1.25 ? 'good' : null);
export const formPoints = (kind, chorus) => Math.round((kind === 'perfect' ? 100 : kind === 'good' ? 60 : 0) * (1 + chorus * 0.25));

/* ---------- Opening Night: sight-reading that never stops ----------
   The music scrolls at tempo and never waits. A note played in time scores, the right pitch more; a wrong note
   costs almost nothing. Stopping costs a lot: a bar with notes written and none played drops the crowd by
   CROWD_SILENT, two such bars in a row (or an empty crowd) bring the curtain down. Coming back in on the first
   note after a slip doubles that bar. The streak counts bars kept going (most of their notes played, right or
   wrong). A new reading level every SHOW_LEVEL_BARS bars. */
export const SHOW_LEVEL_BARS = 8;
export const CROWD_SILENT = 35;
/* bar: { notes, played (in time, any pitch), right (in time and the right pitch) } */
export const barSilent = b => b.notes > 0 && b.played === 0;
export const barKept = b => b.notes === 0 || b.played / b.notes >= 0.6;
export function crowdAfter(crowd, b) {
  if (barSilent(b)) return Math.max(0, crowd - CROWD_SILENT);
  return Math.max(0, Math.min(100, crowd + 2 * b.played - 3 * (b.notes - b.played)));
}
export const curtain = (crowd, silentRun) => crowd <= 0 || silentRun >= 2;
/* a note's points: 10 in time, 10 more for the right pitch; tapped (no pitch heard) 5 more */
export const showNotePoints = (inTime, pitch) => (inTime ? 10 + (pitch === true ? 10 : pitch === null ? 5 : 0) : 0);
