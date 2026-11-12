/* World Woodshed — the Club: a small music place you run (a café, then a restaurant, a jazz bar and a community
   centre full of plants), where practice is the only way forward. Plain functions, no DOM; drawn by
   src/tools/club.js; test/club.test.js.

   state.club (schema 13) = {
     start: 'YYYY-MM-DD'  the day the club opened; practice from before it never counts
     t0: ms               when it opened
     base: { sec, c, by: { skill: sec } }   what that first day already held when it opened, left out
     tiers: { skill: tier }                  each skill's open level when it opened (only levels gained count)
     nights: { day: { m, c, crowd, t, g: { member: minutes } } }   each day since, kept for good (the app's
                          own history is pruned after 180 days), merged field by field by the larger number
     bought: { id: ms }   rooms and amenities bought, merged by joining both copies
   }
   Nothing is stored as a running balance: tips are the nights' tips less what was bought, so two devices can
   never disagree about money. Nothing is ever taken away: a day without practice is a quiet night with the
   doors closed, and the club is as it was when you come back.

   Two kinds of progress:
   - Tips: every minute practised (1, more with the kitchen and the studio), half a tip a guest, and one for
     every five right answers. Spent on rooms and amenities.
   - Reputation (★): real progress since the club opened (band members joining and growing, tunes and pieces
     learned, lessons finished, skill levels opened, game scores set, nights open, regulars, real trees). Never
     spent; a room needs enough of it before it can be built. */

export const OPEN_MIN = 5;           // minutes in a day before the doors open
const round1 = x => Math.round(x * 10) / 10;
const isObj = x => x && typeof x === 'object' && !Array.isArray(x);
const num = x => (Number.isFinite(x) ? x : 0);

/* The band: each member joins after an hour of the practice that trains their part, and grows with it */
export const MEMBERS = [
  { id: 'drums', name: 'Rosa', role: 'drums', skills: ['rhythmTap', 'rhythmId', 'clock', 'tuplets'], what: 'rhythm practice (Rhythm feel, Rhythm ID, Internal clock, the Rhythm gym)' },
  { id: 'bass', name: 'Teo', role: 'bass', skills: ['fretboard', 'notenames', 'degrees'], what: 'the neck and the degrees (Fretboard notes, Note names, Scale degrees)' },
  { id: 'keys', name: 'Mei', role: 'piano', skills: ['chords', 'progressions', 'intervals'], what: 'harmony by ear (Chord qualities, Progressions, Intervals)' },
  { id: 'voice', name: 'Amara', role: 'vocals', skills: ['dictation', 'reading', 'scales', 'pieces'], what: 'melody (Dictation, Sight-reading, World scales, Library pieces)' },
  { id: 'horn', name: 'Jonah', role: 'saxophone', skills: ['repertoire', 'callresp', 'improv', 'transcribe'], what: 'tunes and improvising (Repertoire, Call & response, Constraint roll, Transcribe)' },
  { id: 'perc', name: 'Ilan', role: 'congas', skills: ['technique', 'atlas'], what: 'technique and the world\'s styles (Technique, World knowledge)' }
];
export const MEMBER_LEVELS = [60, 180, 420, 900, 1800]; // minutes for levels 1 (joins) … 5
const GROUP = {};
MEMBERS.forEach(m => m.skills.forEach(s => { GROUP[s] = m.id; }));
export const groupOf = skill => GROUP[skill] || null;

/* Rooms (the establishment grows) and the amenities in each. Effects: seats, tip (extra tips per minute),
   draw (guests per minute practised), slots (tunes on the set list each night). need: reputation to build. */
export const ROOMS = [
  { id: 'cafe', name: 'The Café', need: 0, cost: 0, fx: { seats: 12, slots: 3 }, about: 'A corner of a neighbourhood café, a rug for a stage and a few tables. Where it starts.' },
  { id: 'kitchen', name: 'The Kitchen', need: 10, cost: 200, fx: { seats: 8, tip: 0.2 }, about: 'Hot food, so people stay for the second set. A restaurant now: more tips every minute you practise.' },
  { id: 'courtyard', name: 'The Courtyard Garden', need: 25, cost: 400, fx: { seats: 16, draw: 0.05 }, about: 'Tables under the trees. The trees, kelp and bottles your practice pays for grow here.' },
  { id: 'jazzbar', name: 'The Jazz Bar', need: 50, cost: 800, fx: { seats: 24, slots: 3, draw: 0.05 }, about: 'Upstairs, low lights and a real stage. The band moves up here.' },
  { id: 'school', name: 'The Practice Rooms', need: 90, cost: 1400, fx: { draw: 0.08, regulars: 0.5 }, about: 'Neighbours come to learn and to play. Your community grows half as fast again.' },
  { id: 'hall', name: 'The Community Hall', need: 150, cost: 2400, fx: { seats: 60, slots: 4 }, about: 'Open mics, dances and the big nights, for the whole neighbourhood.' },
  { id: 'roof', name: 'The Rooftop Greenhouse', need: 230, cost: 3800, fx: { seats: 30, draw: 0.1 }, about: 'Glass, vines and lemon trees, with the city lights beyond.' },
  { id: 'studio', name: 'The Recording Studio', need: 330, cost: 6000, fx: { tip: 0.5, slots: 2 }, about: 'Record the band. The records sell: more tips for every minute.' }
];
export const AMENITIES = [
  { id: 'lights', room: 'cafe', name: 'Fairy lights', cost: 30, fx: { draw: 0.03 } },
  { id: 'monstera', room: 'cafe', name: 'Potted monstera', cost: 25, fx: { draw: 0.02 }, plant: true },
  { id: 'chalk', room: 'cafe', name: 'Chalkboard menu', cost: 40, fx: { tip: 0.05 } },
  { id: 'chairs', room: 'cafe', name: 'Mismatched chairs', cost: 60, fx: { seats: 6 } },
  { id: 'upright', room: 'cafe', name: 'Second-hand upright piano', cost: 90, fx: { draw: 0.04, slots: 1 } },
  { id: 'oven', room: 'kitchen', name: 'Wood-fired oven', cost: 150, fx: { tip: 0.15 } },
  { id: 'herbs', room: 'kitchen', name: 'Herb wall', cost: 90, fx: { draw: 0.03 }, plant: true },
  { id: 'table', room: 'kitchen', name: 'Long shared table', cost: 120, fx: { seats: 10 } },
  { id: 'olive', room: 'courtyard', name: 'Olive tree', cost: 160, fx: { draw: 0.04 }, plant: true },
  { id: 'strings', room: 'courtyard', name: 'String lights', cost: 120, fx: { draw: 0.04 } },
  { id: 'fountain', room: 'courtyard', name: 'Fountain', cost: 220, fx: { draw: 0.05 } },
  { id: 'benches', room: 'courtyard', name: 'Garden benches', cost: 140, fx: { seats: 12 } },
  { id: 'spots', room: 'jazzbar', name: 'Stage lights', cost: 250, fx: { draw: 0.06 } },
  { id: 'pa', room: 'jazzbar', name: 'Sound system', cost: 350, fx: { tip: 0.1, draw: 0.03 } },
  { id: 'grand', room: 'jazzbar', name: 'Grand piano', cost: 600, fx: { draw: 0.06, slots: 1 } },
  { id: 'ferns', room: 'jazzbar', name: 'Hanging ferns', cost: 180, fx: { draw: 0.03 }, plant: true },
  { id: 'amps', room: 'school', name: 'Practice amps', cost: 300, fx: { regulars: 0.2 } },
  { id: 'lending', room: 'school', name: 'Instrument lending shelf', cost: 400, fx: { regulars: 0.3 } },
  { id: 'board', room: 'school', name: 'Lesson board', cost: 200, fx: { draw: 0.04 } },
  { id: 'floor', room: 'hall', name: 'Dance floor', cost: 600, fx: { seats: 30 } },
  { id: 'bunting', room: 'hall', name: 'Bunting', cost: 300, fx: { draw: 0.05 } },
  { id: 'coats', room: 'hall', name: 'Coat room', cost: 250, fx: { tip: 0.05 } },
  { id: 'lemons', room: 'roof', name: 'Lemon trees', cost: 500, fx: { draw: 0.05 }, plant: true },
  { id: 'scope', room: 'roof', name: 'Telescope', cost: 400, fx: { draw: 0.03 } },
  { id: 'hammocks', room: 'roof', name: 'Hammocks', cost: 450, fx: { seats: 10 } },
  { id: 'tape', room: 'studio', name: 'Tape machine', cost: 900, fx: { tip: 0.1 } },
  { id: 'booth', room: 'studio', name: 'Vocal booth', cost: 1100, fx: { tip: 0.1, slots: 1 } },
  { id: 'gold', room: 'studio', name: 'Wall of records', cost: 1200, fx: { draw: 0.08 } }
];
const BY_ID = new Map([...ROOMS, ...AMENITIES].map(x => [x.id, x]));
export const itemOf = id => BY_ID.get(id) || null;
export const isRoom = id => ROOMS.some(r => r.id === id);

/* ---------- days ---------- */
export function dayKey(t = Date.now()) {
  const d = new Date(t);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
const prevDay = day => { const [y, m, d] = day.split('-').map(Number); return dayKey(new Date(y, m - 1, d - 1, 12).getTime()); };
const isDay = k => /^\d{4}-\d{2}-\d{2}$/.test(k);

/* seconds per skill in one day's record ({ sec, q, c, by: { skill: [q, c, sec] } }) */
const secBy = rec => {
  const out = {};
  Object.entries((rec && rec.by) || {}).forEach(([k, v]) => { if (Array.isArray(v) && v[2] > 0) out[k] = v[2]; });
  return out;
};

/* A new club, opening now: what today already holds is left out, so only practice from here on counts */
export function openClub(history, tiers, now = Date.now()) {
  const start = dayKey(now), rec = (history || {})[start] || {};
  return { start, t0: now, base: { sec: num(rec.sec), c: num(rec.c), by: secBy(rec) }, tiers: Object.assign({}, tiers), nights: {}, bought: {} };
}

/* A saved club made safe (it may come from another device or an older app) */
export function clean(c) {
  if (!isObj(c) || !isDay(c.start)) return null;
  const nights = {};
  Object.entries(isObj(c.nights) ? c.nights : {}).forEach(([k, n]) => { if (isDay(k) && isObj(n)) nights[k] = n; });
  const bought = {};
  Object.entries(isObj(c.bought) ? c.bought : {}).forEach(([k, t]) => { if (BY_ID.has(k) && Number.isFinite(t)) bought[k] = t; });
  const base = isObj(c.base) ? c.base : {};
  return { start: c.start, t0: num(c.t0), base: { sec: num(base.sec), c: num(base.c), by: isObj(base.by) ? base.by : {} }, tiers: isObj(c.tiers) ? c.tiers : {}, nights, bought };
}

/* ---------- what you own and what it does ---------- */
export const owns = (club, id) => id === 'cafe' || !!(club && club.bought && club.bought[id]);
export function spent(club) {
  return Object.keys((club && club.bought) || {}).reduce((a, id) => a + ((itemOf(id) || {}).cost || 0), 0);
}
/* The sum of every owned room's and amenity's effects */
export function effects(club) {
  const fx = { seats: 0, tip: 0, draw: 0, slots: 0, regulars: 0 };
  [...ROOMS, ...AMENITIES].forEach(x => {
    if (!owns(club, x.id) || (x.room && !owns(club, x.room))) return;
    Object.entries(x.fx || {}).forEach(([k, v]) => { fx[k] += v; });
  });
  return fx;
}

/* Minutes of practice for each band member, from the nights */
export function memberMinutes(club) {
  const out = {};
  MEMBERS.forEach(m => { out[m.id] = 0; });
  Object.values((club && club.nights) || {}).forEach(n => Object.entries((n && n.g) || {}).forEach(([k, v]) => { if (k in out) out[k] += num(v); }));
  return out;
}
export const levelFor = min => MEMBER_LEVELS.filter(x => min >= x).length;
/* Each member: { ...member, min, level (0 = not yet), next (minutes to the next level, 0 at the top) } */
export function band(club) {
  const mins = memberMinutes(club);
  return MEMBERS.map(m => {
    const min = round1(mins[m.id]), level = levelFor(min), nextAt = MEMBER_LEVELS[level];
    return Object.assign({}, m, { min, level, next: nextAt ? round1(nextAt - min) : 0, frac: nextAt ? (min - (MEMBER_LEVELS[level - 1] || 0)) / (nextAt - (MEMBER_LEVELS[level - 1] || 0)) : 1 });
  });
}

/* The set list: Repertoire tunes and Library pieces learned (tunes: practised since the club opened and held
   in memory at least 3 days; pieces: marked learned since). ctx.tunes [{ id, name, s, last }], ctx.pieces
   [{ id, title, learned }]. Most recent first. */
export function setList(club, ctx = {}) {
  const t0 = num(club && club.t0);
  const tunes = (ctx.tunes || []).filter(t => t && t.last >= t0 && t.s >= 3).map(t => ({ id: 'tune:' + t.id, name: t.name, at: t.last, kind: 'tune' }));
  const pieces = (ctx.pieces || []).filter(p => p && p.learned >= t0 && p.learned > 0).map(p => ({ id: 'piece:' + p.id, name: p.title, at: p.learned, kind: 'piece' }));
  return tunes.concat(pieces).sort((a, b) => b.at - a.at);
}

/* How many guests come per minute practised, and the rest of tonight's numbers */
export function stats(club, ctx = {}) {
  const fx = effects(club), members = band(club), list = setList(club, ctx);
  const slots = fx.slots, onStage = Math.min(list.length, slots);
  const levels = members.reduce((a, m) => a + m.level, 0);
  const draw = round1((0.45 + fx.draw + 0.06 * levels + 0.03 * onStage) * 100) / 100;
  return { seats: fx.seats, tip: round1(fx.tip * 100) / 100, draw, slots, regRate: 1 + fx.regulars, members, setList: list, onStage, levels };
}

/* One night from a day's practice record (less the opening day's base) under the club as it is */
export function nightOf(rec, base, st) {
  const by = secBy(rec), b = base || {}, bBy = b.by || {};
  const sec = Math.max(0, num(rec && rec.sec) - num(b.sec)), c = Math.max(0, num(rec && rec.c) - num(b.c));
  const m = round1(sec / 60), g = {};
  Object.entries(by).forEach(([k, v]) => { const id = groupOf(k); if (!id) return; const x = Math.max(0, v - num(bBy[k])) / 60; if (x > 0) g[id] = round1((g[id] || 0) + x); });
  const crowd = m >= OPEN_MIN ? Math.min(st.seats, Math.round(m * st.draw)) : 0;
  const t = Math.round(m * (1 + st.tip) + crowd * 0.5 + c / 5);
  return { m, c, crowd, t, g };
}
const maxNight = (a, b) => {
  if (!a) return b; if (!b) return a;
  const g = Object.assign({}, a.g);
  Object.entries(b.g || {}).forEach(([k, v]) => { g[k] = Math.max(num(g[k]), num(v)); });
  return { m: Math.max(num(a.m), num(b.m)), c: Math.max(num(a.c), num(b.c)), crowd: Math.max(num(a.crowd), num(b.crowd)), t: Math.max(num(a.t), num(b.t)), g };
};
const sameNight = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* Bring the nights up to date from the daily history (in place). Today and yesterday are worked out again
   (practice is still coming in, or arriving from another device); an older night is worked out only if it
   isn't there yet. A night only ever grows. Returns true if anything changed. */
export function settle(club, history, ctx = {}, now = Date.now()) {
  if (!club) return false;
  const today = dayKey(now), yday = prevDay(today), st = stats(club, ctx);
  let changed = false;
  Object.keys(history || {}).filter(k => isDay(k) && k >= club.start && k <= today).sort().forEach(k => {
    const old = club.nights[k];
    if (old && k < yday) return;
    const n = maxNight(old, nightOf(history[k], k === club.start ? club.base : null, st));
    if (n.m <= 0 && !old) return;
    if (!old || !sameNight(old, n)) { club.nights[k] = n; changed = true; }
  });
  return changed;
}

/* Totals over every night */
export function totals(club) {
  const out = { tips: 0, crowd: 0, nights: 0, min: 0, best: 0 };
  Object.values((club && club.nights) || {}).forEach(n => {
    out.tips += num(n.t); out.crowd += num(n.crowd); out.min += num(n.m);
    if (n.crowd > 0) out.nights++;
    out.best = Math.max(out.best, num(n.crowd));
  });
  out.min = round1(out.min);
  return out;
}
export const balance = club => totals(club).tips - spent(club);
/* People who keep coming back: one for every 15 guests over all the nights, faster with the practice rooms */
export const regulars = (club, st) => Math.floor(totals(club).crowd / 15 * ((st && st.regRate) || 1));

/* Reputation (★): progress since the club opened, part by part, each { id, label, n, each, pts }.
   ctx.tiers { skill: open level now }, ctx.lessons { id: ms finished }, ctx.games { game: [entries] },
   ctx.plants (real trees, kelp and bottles ordered) */
export function reputation(club, ctx = {}, st = stats(club, ctx)) {
  const t0 = num(club && club.t0), parts = [];
  const add = (id, label, n, each) => { if (n > 0) parts.push({ id, label, n, each, pts: n * each }); };
  add('nights', 'Nights open', totals(club).nights, 1);
  add('band', 'Band member levels', st.levels, 5);
  add('set', 'Tunes and pieces learned', st.setList.length, 8);
  add('lessons', 'Lessons finished', Object.values(ctx.lessons || {}).filter(t => t >= t0).length, 4);
  let tiers = 0;
  Object.entries(ctx.tiers || {}).forEach(([k, v]) => { tiers += Math.max(0, num(v) - num((club.tiers || {})[k] || 1)); });
  add('levels', 'Skill levels opened', tiers, 6);
  let scores = 0;
  Object.values(ctx.games || {}).forEach(list => { scores += Math.min(5, (Array.isArray(list) ? list : []).filter(e => e && e.t >= t0).length); });
  add('games', 'Game scores set', scores, 2);
  add('regulars', 'Regulars (every 5)', Math.floor(regulars(club, st) / 5), 2);
  add('plants', 'Real trees, kelp and bottles', num(ctx.plants), 10);
  return { total: parts.reduce((a, p) => a + p.pts, 0), parts };
}

/* Can it be bought now? → { ok, why } */
export function canBuy(club, id, rep, money = balance(club)) {
  const x = itemOf(id);
  if (!x) return { ok: false, why: 'Unknown' };
  if (owns(club, id)) return { ok: false, why: 'Yours' };
  if (x.room && !owns(club, x.room)) return { ok: false, why: 'Build ' + itemOf(x.room).name + ' first' };
  if (x.need && rep < x.need) return { ok: false, why: 'Needs ' + x.need + ' ★' };
  if (money < x.cost) return { ok: false, why: 'Needs ' + (x.cost - money) + ' more tips' };
  return { ok: true, why: '' };
}
export function buy(club, id, rep, now = Date.now()) {
  const r = canBuy(club, id, rep);
  if (r.ok) club.bought[id] = now;
  return r;
}

/* What to aim for next: the cheapest thing you could build that you can't afford or reach yet, or null */
export function nextGoal(club, rep) {
  const money = balance(club);
  const open = [...ROOMS, ...AMENITIES].filter(x => !owns(club, x.id) && (!x.room || owns(club, x.room)));
  const ready = open.filter(x => canBuy(club, x.id, rep, money).ok).sort((a, b) => a.cost - b.cost);
  if (ready.length) return { item: ready[0], ready: true };
  const rooms = ROOMS.filter(x => !owns(club, x.id)).sort((a, b) => a.need - b.need);
  const cheap = open.filter(x => !isRoom(x.id)).sort((a, b) => a.cost - b.cost)[0];
  const room = rooms[0];
  const item = !room ? cheap : !cheap ? room : (room.need <= rep ? (room.cost < cheap.cost ? room : cheap) : cheap);
  return item ? { item, ready: false } : null;
}

/* Two copies of the club joined: the earlier opening wins (with its base), nights field by field by the larger
   number, purchases from both (the earlier time kept) */
export function mergeClub(a, b) {
  const A = clean(a), B = clean(b);
  if (!A) return B || undefined; if (!B) return A;
  const first = A.start < B.start || (A.start === B.start && A.t0 <= B.t0) ? A : B;
  const nights = {};
  new Set([...Object.keys(A.nights), ...Object.keys(B.nights)]).forEach(k => { nights[k] = maxNight(A.nights[k], B.nights[k]); });
  const bought = Object.assign({}, B.bought);
  Object.entries(A.bought).forEach(([k, t]) => { bought[k] = k in bought ? Math.min(bought[k], t) : t; });
  return { start: first.start, t0: first.t0, base: first.base, tiers: first.tiers, nights, bought };
}

export default { OPEN_MIN, MEMBERS, MEMBER_LEVELS, ROOMS, AMENITIES, itemOf, isRoom, groupOf, dayKey, openClub, clean, owns, spent, effects, band, levelFor, memberMinutes, setList, stats, nightOf, settle, totals, balance, regulars, reputation, canBuy, buy, nextGoal, mergeClub };
