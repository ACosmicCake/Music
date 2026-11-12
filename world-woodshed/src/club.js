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
     bought: { id: ms }   rooms and fixtures bought, merged by joining both copies
     placed: { uid: { k, x, z, r, t, f? } | { k, gone: 1, t } }   furniture, plants and decor placed in build
                          mode (cells of CELL m, a quarter turn r, f: a free starter), merged per piece by t
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

/* Rooms (the establishment grows). rect: where the room stands on the lot, in metres [x0, z0, x1, z1] (x to
   the right, z away from the street). Effects: seats (standing room; chairs and benches you place add more),
   tip (extra tips per minute), draw (guests per minute practised), slots (tunes on the set list each night).
   need: reputation to build. */
export const ROOMS = [
  { id: 'cafe', name: 'The Café', need: 0, cost: 0, rect: [0, 0, 8, 6], fx: { seats: 6, slots: 3 }, about: 'A corner of a neighbourhood café, a rug for a stage and a few tables. Where it starts.' },
  { id: 'kitchen', name: 'The Kitchen', need: 10, cost: 200, rect: [8, 0, 12, 6], fx: { seats: 4, tip: 0.2 }, about: 'Hot food, so people stay for the second set. A restaurant now: more tips every minute you practise.' },
  { id: 'courtyard', name: 'The Courtyard Garden', need: 25, cost: 400, rect: [-8, 0, 0, 6], fx: { seats: 10, draw: 0.05 }, about: 'Tables under the trees, open to the island and the real trees your practice pays for.' },
  { id: 'jazzbar', name: 'The Jazz Bar', need: 50, cost: 800, rect: [0, 6, 12, 14], fx: { seats: 14, slots: 3, draw: 0.05 }, about: 'Low lights and a real stage at the back. The band moves in here.' },
  { id: 'school', name: 'The Practice Rooms', need: 90, cost: 1400, rect: [-8, 6, 0, 12], fx: { seats: 2, draw: 0.08, regulars: 0.5 }, about: 'Neighbours come to learn and to play. Your community grows half as fast again.' },
  { id: 'hall', name: 'The Community Hall', need: 150, cost: 2400, rect: [12, 0, 20, 6], fx: { seats: 50, slots: 4 }, about: 'Open mics, dances and the big nights, for the whole neighbourhood.' },
  { id: 'roof', name: 'The Glasshouse', need: 230, cost: 3800, rect: [0, 14, 12, 19], fx: { seats: 24, draw: 0.1 }, about: 'Glass, vines and lemon trees behind the jazz bar, with the sea beyond.' },
  { id: 'studio', name: 'The Recording Studio', need: 330, cost: 6000, rect: [12, 6, 20, 12], fx: { tip: 0.5, slots: 2 }, about: 'Record the band. The records sell: more tips for every minute.' }
];
/* Fixtures: built into a room at their own place (on a wall, over the stage, across the ceiling), bought once.
   at: the floor they take [x0, z0, x1, z1] in metres; flat ones (a dance floor) can have furniture on them. */
export const AMENITIES = [
  { id: 'lights', room: 'cafe', name: 'Fairy lights', cost: 30, fx: { draw: 0.03 } },
  { id: 'herbs', room: 'kitchen', name: 'Herb wall', cost: 90, fx: { draw: 0.03 }, plant: true, at: [8.5, 0, 11.5, 0.5] },
  { id: 'strings', room: 'courtyard', name: 'String lights', cost: 120, fx: { draw: 0.04 } },
  { id: 'spots', room: 'jazzbar', name: 'Stage lights', cost: 250, fx: { draw: 0.06 } },
  { id: 'floor', room: 'hall', name: 'Dance floor', cost: 600, fx: { seats: 30 }, at: [14, 0.5, 18, 3.5], flat: true },
  { id: 'bunting', room: 'hall', name: 'Bunting', cost: 300, fx: { draw: 0.05 } },
  { id: 'booth', room: 'studio', name: 'Vocal booth', cost: 1100, fx: { tip: 0.1, slots: 1 }, at: [17.5, 10.5, 20, 12] },
  { id: 'gold', room: 'studio', name: 'Wall of records', cost: 1200, fx: { draw: 0.08 }, at: [13.5, 11.5, 17, 12] }
];

/* ---------- build mode: furniture, plants and decor you place, move and sell ----------
   The floor is a grid of CELL metres. Each piece takes w × d cells (turned a quarter: d × w), costs its price
   (given back in full when sold, so trying things out costs nothing) and opens with its room. seats count
   for every copy; every other effect counts once per kind, so a room is furnished to taste, not stacked.
   unique: only one. flat: a rug, which other pieces can stand on. */
export const CELL = 0.5;
export const CATS = [['seat', 'Seating'], ['table', 'Tables'], ['plant', 'Plants'], ['light', 'Lights'], ['music', 'Music'], ['decor', 'Decor'], ['kitchen', 'Kitchen & bar']];
export const CATALOG = [
  { id: 'chair', cat: 'seat', name: 'Wooden chair', cost: 8, w: 1, d: 1, seats: 1 },
  { id: 'stool', cat: 'seat', name: 'Bar stool', cost: 10, w: 1, d: 1, seats: 1 },
  { id: 'beanbag', cat: 'seat', name: 'Beanbag', cost: 15, w: 2, d: 2, seats: 1 },
  { id: 'armchair', cat: 'seat', name: 'Velvet armchair', cost: 40, w: 2, d: 2, seats: 1, fx: { draw: 0.01 } },
  { id: 'sofa', cat: 'seat', name: 'Old green sofa', cost: 80, w: 4, d: 2, seats: 3, fx: { draw: 0.01 } },
  { id: 'benches', cat: 'seat', name: 'Garden bench', cost: 35, w: 4, d: 1, seats: 2, room: 'courtyard' },
  { id: 'hammocks', cat: 'seat', name: 'Hammock', cost: 120, w: 5, d: 2, seats: 2, fx: { draw: 0.02 }, room: 'roof' },
  { id: 'bistro', cat: 'table', name: 'Bistro table for two', cost: 30, w: 3, d: 3, seats: 2 },
  { id: 'chairs', cat: 'table', name: 'Café table for four', cost: 55, w: 4, d: 4, seats: 4 },
  { id: 'table', cat: 'table', name: 'Long shared table', cost: 120, w: 7, d: 4, seats: 8, fx: { draw: 0.02 }, room: 'kitchen' },
  { id: 'snake', cat: 'plant', name: 'Snake plant', cost: 6, w: 1, d: 1, plant: true },
  { id: 'cactus', cat: 'plant', name: 'Cactus', cost: 8, w: 1, d: 1, plant: true },
  { id: 'monstera', cat: 'plant', name: 'Potted monstera', cost: 25, w: 2, d: 2, fx: { draw: 0.02 }, plant: true },
  { id: 'fig', cat: 'plant', name: 'Fiddle-leaf fig', cost: 35, w: 2, d: 2, fx: { draw: 0.01 }, plant: true },
  { id: 'ferns', cat: 'plant', name: 'Fern on a stand', cost: 30, w: 2, d: 2, fx: { draw: 0.02 }, plant: true },
  { id: 'palm', cat: 'plant', name: 'Potted palm', cost: 45, w: 2, d: 2, fx: { draw: 0.01 }, plant: true },
  { id: 'flowers', cat: 'plant', name: 'Flower bed', cost: 20, w: 4, d: 1, fx: { draw: 0.01 }, plant: true, room: 'courtyard' },
  { id: 'olive', cat: 'plant', name: 'Olive tree', cost: 160, w: 3, d: 3, fx: { draw: 0.04 }, plant: true, room: 'courtyard' },
  { id: 'lemons', cat: 'plant', name: 'Lemon tree in a pot', cost: 90, w: 2, d: 2, fx: { draw: 0.05 }, plant: true, room: 'roof' },
  { id: 'lamp', cat: 'light', name: 'Floor lamp', cost: 15, w: 1, d: 1, fx: { draw: 0.01 } },
  { id: 'lantern', cat: 'light', name: 'Lantern post', cost: 25, w: 1, d: 1, fx: { draw: 0.01 }, room: 'courtyard' },
  { id: 'firebowl', cat: 'light', name: 'Fire bowl', cost: 90, w: 2, d: 2, fx: { draw: 0.02 }, room: 'courtyard' },
  { id: 'upright', cat: 'music', name: 'Second-hand upright piano', cost: 90, w: 3, d: 2, fx: { draw: 0.04, slots: 1 }, unique: true },
  { id: 'records', cat: 'music', name: 'Record player', cost: 45, w: 2, d: 1, fx: { draw: 0.01 } },
  { id: 'jukebox', cat: 'music', name: 'Jukebox', cost: 140, w: 2, d: 1, fx: { draw: 0.03, tip: 0.02 } },
  { id: 'pa', cat: 'music', name: 'Speaker stack', cost: 350, w: 2, d: 1, fx: { tip: 0.1, draw: 0.03 }, room: 'jazzbar' },
  { id: 'grand', cat: 'music', name: 'Grand piano', cost: 600, w: 4, d: 4, fx: { draw: 0.06, slots: 1 }, unique: true, room: 'jazzbar' },
  { id: 'amps', cat: 'music', name: 'Practice amp', cost: 150, w: 1, d: 1, fx: { regulars: 0.2 }, room: 'school' },
  { id: 'lending', cat: 'music', name: 'Instrument lending shelf', cost: 400, w: 5, d: 1, fx: { regulars: 0.3 }, room: 'school' },
  { id: 'tape', cat: 'music', name: 'Tape machine', cost: 900, w: 2, d: 2, fx: { tip: 0.1 }, room: 'studio' },
  { id: 'rug', cat: 'decor', name: 'Patterned rug', cost: 20, w: 4, d: 3, flat: true },
  { id: 'shelf', cat: 'decor', name: 'Bookshelf', cost: 35, w: 3, d: 1, fx: { draw: 0.01 } },
  { id: 'easel', cat: 'decor', name: 'Painting on an easel', cost: 30, w: 1, d: 1, fx: { draw: 0.01 } },
  { id: 'chalk', cat: 'decor', name: 'Chalkboard menu', cost: 40, w: 2, d: 1, fx: { tip: 0.05 } },
  { id: 'aquarium', cat: 'decor', name: 'Aquarium', cost: 160, w: 3, d: 1, fx: { draw: 0.03 } },
  { id: 'fountain', cat: 'decor', name: 'Fountain', cost: 220, w: 4, d: 4, fx: { draw: 0.05 }, room: 'courtyard' },
  { id: 'board', cat: 'decor', name: 'Lesson board', cost: 200, w: 3, d: 1, fx: { draw: 0.04 }, room: 'school' },
  { id: 'coats', cat: 'decor', name: 'Coat stand', cost: 250, w: 1, d: 1, fx: { tip: 0.05 }, room: 'hall' },
  { id: 'scope', cat: 'decor', name: 'Telescope', cost: 400, w: 2, d: 2, fx: { draw: 0.03 }, room: 'roof' },
  { id: 'espresso', cat: 'kitchen', name: 'Espresso machine', cost: 60, w: 2, d: 1, fx: { tip: 0.03 } },
  { id: 'cakes', cat: 'kitchen', name: 'Cake counter', cost: 70, w: 2, d: 1, fx: { tip: 0.03 } },
  { id: 'oven', cat: 'kitchen', name: 'Wood-fired oven', cost: 150, w: 3, d: 3, fx: { tip: 0.15 }, room: 'kitchen' }
];
/* The built-in pieces each room comes with (the café's rug stage and counter, the jazz bar's stage and bar…),
   in metres [x0, z0, x1, z1]: nothing can be placed on them. keep: a way through (the café door, the path). */
export const BUILT_IN = {
  cafe: [[0.5, 3.5, 3, 5.5], [4.5, 4.5, 8, 5.5], [3, 0, 5, 1.5, 'keep']],
  kitchen: [[8.5, 5, 11.5, 6], [11, 2.5, 12, 3.5]],
  courtyard: [[-2, 0, -1, 6, 'keep']],
  jazzbar: [[0.5, 11, 8, 14], [9.5, 7, 12, 11]],
  school: [[-5.5, 8, -5, 10], [-3, 8, -2.5, 10], [-0.5, 8, 0, 10], [-7, 10, -6, 11]],
  hall: [[13.5, 4, 18.5, 6]],
  roof: [],
  studio: [[13.5, 6.5, 16.5, 8], [16.5, 8, 17.5, 10.5]]
};
/* What a room comes with, free: [kind, x, z, turn] with x and z the corner in metres. Selling one gives
   nothing back, as it cost nothing. */
export const STARTERS = {
  cafe: [['bistro', 0.5, 0.5], ['bistro', 5.5, 2], ['stool', 5, 3.5], ['stool', 6.5, 3.5], ['snake', 0, 2.5]],
  kitchen: [['bistro', 10.5, 0.5], ['chair', 8.5, 4.5], ['chair', 9.5, 4.5]],
  courtyard: [['chairs', -7, 1], ['bistro', -4, 3.5]],
  jazzbar: [['bistro', 1, 7.5], ['bistro', 4, 7], ['bistro', 6.5, 7.5], ['stool', 9, 7.5], ['stool', 9, 8.5], ['stool', 9, 9.5]],
  school: [['beanbag', -7.5, 6.5], ['beanbag', -4.5, 10.5]],
  hall: [['chairs', 12, 0.5], ['chairs', 18, 0.5]],
  roof: [['palm', 0.5, 17.5], ['ferns', 10.5, 14.5], ['bistro', 5.5, 15.5]],
  studio: [['armchair', 18, 7]]
};
/* Where the amenities bought before build mode stand now: [x, z, turn] in metres */
const MOVED_IN = {
  chairs: [2, 1.5], monstera: [7, 0], chalk: [6, 1], upright: [3, 3.5],
  oven: [10.5, 3.5], table: [8, 1, 1], olive: [-8, 4], fountain: [-4.5, 0.5], benches: [-8, 0.5, 1],
  pa: [0, 10.5], grand: [8, 11.5], ferns: [10.5, 12], amps: [-7.5, 8.5], lending: [-5, 6, 0], board: [-2.5, 6],
  coats: [19.5, 5.5], lemons: [2.5, 14.5], scope: [10, 17], hammocks: [6.5, 17]
};
const BY_ID = new Map([...ROOMS, ...AMENITIES, ...CATALOG].map(x => [x.id, x]));
export const itemOf = id => BY_ID.get(id) || null;
export const isRoom = id => ROOMS.some(r => r.id === id);
export const isPiece = id => CATALOG.some(x => x.id === id);

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
  const club = { start, t0: now, base: { sec: num(rec.sec), c: num(rec.c), by: secBy(rec) }, tiers: Object.assign({}, tiers), nights: {}, bought: {}, placed: {} };
  addStarters(club, 'cafe', now);
  return club;
}

/* A saved club made safe (it may come from another device or an older app). Amenities bought before build
   mode become placed pieces where they stood, and every built room gets its free starter pieces; both have
   fixed ids, so two devices doing this agree. */
export function clean(c) {
  if (!isObj(c) || !isDay(c.start)) return null;
  const nights = {};
  Object.entries(isObj(c.nights) ? c.nights : {}).forEach(([k, n]) => { if (isDay(k) && isObj(n)) nights[k] = n; });
  const bought = {}, placed = {};
  Object.entries(isObj(c.placed) ? c.placed : {}).forEach(([u, p]) => {
    if (typeof u !== 'string' || u.length > 40 || !isObj(p) || !isPiece(p.k) || !Number.isFinite(p.t)) return;
    if (p.gone) { placed[u] = { k: p.k, gone: 1, t: p.t }; return; }
    if (![p.x, p.z].every(Number.isInteger) || ![0, 1, 2, 3].includes(p.r)) return;
    placed[u] = { k: p.k, x: p.x, z: p.z, r: p.r, t: p.t };
    if (p.f) placed[u].f = 1;
  });
  Object.entries(isObj(c.bought) ? c.bought : {}).forEach(([k, t]) => {
    if (!BY_ID.has(k) || !Number.isFinite(t)) return;
    if (isPiece(k)) { const u = 'a:' + k, at = MOVED_IN[k] || [0, 0]; if (!placed[u]) placed[u] = { k, x: Math.round(at[0] / CELL), z: Math.round(at[1] / CELL), r: at[2] || 0, t }; }
    else bought[k] = t;
  });
  const base = isObj(c.base) ? c.base : {};
  const out = { start: c.start, t0: num(c.t0), base: { sec: num(base.sec), c: num(base.c), by: isObj(base.by) ? base.by : {} }, tiers: isObj(c.tiers) ? c.tiers : {}, nights, bought, placed };
  ROOMS.forEach(r => { if (owns(out, r.id)) addStarters(out, r.id, r.id === 'cafe' ? out.t0 : bought[r.id]); });
  return out;
}
function addStarters(club, room, t) {
  (STARTERS[room] || []).forEach(([k, x, z, r], i) => {
    const u = 's:' + room + ':' + i;
    if (!club.placed[u]) club.placed[u] = { k, x: Math.round(x / CELL), z: Math.round(z / CELL), r: r || 0, t: num(t), f: 1 };
  });
}

/* ---------- what you own and what it does ---------- */
/* the pieces standing in the club: [uid, { k, x, z, r, t, f? }] */
export const live = club => Object.entries((club && club.placed) || {}).filter(([, p]) => p && !p.gone);
export const owns = (club, id) => id === 'cafe' || !!(club && club.bought && club.bought[id]) || (isPiece(id) && live(club).some(([, p]) => p.k === id));
export function spent(club) {
  const rooms = Object.keys((club && club.bought) || {}).reduce((a, id) => a + ((itemOf(id) || {}).cost || 0), 0);
  return rooms + live(club).reduce((a, [, p]) => a + (p.f ? 0 : (itemOf(p.k) || {}).cost || 0), 0);
}
/* The sum of every room's, fixture's and placed piece's effects (seats for every piece, the rest once per kind) */
export function effects(club) {
  const fx = { seats: 0, tip: 0, draw: 0, slots: 0, regulars: 0 };
  const add = o => Object.entries(o || {}).forEach(([k, v]) => { fx[k] += v; });
  ROOMS.forEach(r => { if (owns(club, r.id)) add(r.fx); });
  AMENITIES.forEach(x => { if (owns(club, x.id) && owns(club, x.room)) add(x.fx); });
  const kinds = new Set();
  live(club).forEach(([, p]) => { const x = itemOf(p.k); fx.seats += x.seats || 0; if (!kinds.has(p.k)) { kinds.add(p.k); add(x.fx); } });
  return fx;
}

/* ---------- placing pieces ---------- */
/* the cells a piece takes: [x0, z0, x1, z1), turned a quarter swaps width and depth */
export function footprint(k, x, z, r = 0) {
  const it = itemOf(k), w = r % 2 ? it.d : it.w, d = r % 2 ? it.w : it.d;
  return [x, z, x + w, z + d];
}
const cellsOf = rect => rect.slice(0, 4).map(v => Math.round(v / CELL));
const overlap = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
const inside = (a, b) => a[0] >= b[0] && a[1] >= b[1] && a[2] <= b[2] && a[3] <= b[3];
/* the room a cell rectangle lies wholly in (a built one), or null */
export function roomAt(club, f) {
  const r = ROOMS.find(r => owns(club, r.id) && inside(f, cellsOf(r.rect)));
  return r ? r.id : null;
}
/* Can kind k stand at cell (x, z) turned r? skip: the uid of the piece being moved. → { ok, why } */
export function fits(club, k, x, z, r = 0, skip = null) {
  const it = itemOf(k);
  if (!it || !isPiece(k)) return { ok: false, why: 'Unknown' };
  const f = footprint(k, x, z, r), room = roomAt(club, f);
  if (!room) return { ok: false, why: 'Inside a room you\'ve built' };
  const blocked = (BUILT_IN[room] || []).some(b => overlap(f, cellsOf(b)) && !(it.flat && b[4] !== 'keep'));
  if (blocked) return { ok: false, why: 'Something built in is there' };
  if (AMENITIES.some(a => a.at && owns(club, a.id) && !(a.flat || it.flat) && overlap(f, cellsOf(a.at)))) return { ok: false, why: 'Something built in is there' };
  const hit = live(club).some(([u, p]) => u !== skip && !!itemOf(p.k).flat === !!it.flat && overlap(f, footprint(p.k, p.x, p.z, p.r)));
  if (hit) return { ok: false, why: 'Something is in the way' };
  return { ok: true, why: '', room };
}
/* Can a new piece of kind k be bought? (where it goes is fits') */
export function canPlace(club, k, money = balance(club)) {
  const it = itemOf(k);
  if (!it || !isPiece(k)) return { ok: false, why: 'Unknown' };
  if (it.room && !owns(club, it.room)) return { ok: false, why: 'Build ' + itemOf(it.room).name.replace(/^The /, 'the ') + ' first' };
  if (it.unique && owns(club, k)) return { ok: false, why: 'You have one' };
  if (money < it.cost) return { ok: false, why: 'Needs ' + (it.cost - money) + ' more tips' };
  return { ok: true, why: '' };
}
const newId = now => now.toString(36) + Math.random().toString(36).slice(2, 7);
/* Buy and place a piece → { ok, why, uid } */
export function place(club, k, x, z, r = 0, now = Date.now()) {
  const c = canPlace(club, k);
  if (!c.ok) return c;
  const f = fits(club, k, x, z, r);
  if (!f.ok) return f;
  const uid = newId(now);
  club.placed[uid] = { k, x, z, r, t: now };
  return { ok: true, why: '', uid };
}
/* Move or turn a piece already placed */
export function move(club, uid, x, z, r, now = Date.now()) {
  const p = club.placed[uid];
  if (!p || p.gone) return { ok: false, why: 'Gone' };
  const f = fits(club, p.k, x, z, r, uid);
  if (!f.ok) return f;
  Object.assign(p, { x, z, r, t: Math.max(now, p.t + 1) });
  return { ok: true, why: '' };
}
/* Sell a piece: its price comes back (nothing for a free starter); the uid stays as a tombstone for the merge */
export function sell(club, uid, now = Date.now()) {
  const p = club.placed[uid];
  if (!p || p.gone) return { ok: false, refund: 0 };
  const refund = p.f ? 0 : (itemOf(p.k) || {}).cost || 0;
  club.placed[uid] = { k: p.k, gone: 1, t: Math.max(now, p.t + 1) };
  return { ok: true, refund };
}
/* The first free spot for a piece, in the room asked for first (scanning from the back corner), or null */
export function freeSpot(club, k, prefer) {
  const order = ROOMS.filter(r => owns(club, r.id)).sort((a, b) => (b.id === prefer) - (a.id === prefer));
  for (const room of order) {
    const [x0, z0, x1, z1] = cellsOf(room.rect);
    for (const r of [0, 1]) for (let z = z1 - 1; z >= z0; z--) for (let x = x0; x < x1; x++) if (fits(club, k, x, z, r).ok) return { x, z, r };
  }
  return null;
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
  add('decor', 'Kinds of furniture and plants you chose', new Set(live(club).filter(([, p]) => !p.f).map(([, p]) => p.k)).size, 1);
  return { total: parts.reduce((a, p) => a + p.pts, 0), parts };
}

/* Can a room or fixture be bought now? → { ok, why } */
export function canBuy(club, id, rep, money = balance(club)) {
  const x = itemOf(id);
  if (!x) return { ok: false, why: 'Unknown' };
  if (isPiece(id)) return canPlace(club, id, money);
  if (owns(club, id)) return { ok: false, why: 'Yours' };
  if (x.room && !owns(club, x.room)) return { ok: false, why: 'Build ' + itemOf(x.room).name.replace(/^The /, 'the ') + ' first' };
  if (x.need && rep < x.need) return { ok: false, why: 'Needs ' + x.need + ' ★' };
  if (money < x.cost) return { ok: false, why: 'Needs ' + (x.cost - money) + ' more tips' };
  return { ok: true, why: '' };
}
/* Buy a room (with its free starter pieces) or a fixture; a piece goes to its first free spot */
export function buy(club, id, rep, now = Date.now()) {
  if (isPiece(id)) { const at = freeSpot(club, id, itemOf(id).room); return at ? place(club, id, at.x, at.z, at.r, now) : { ok: false, why: 'No room for it: sell or move something' }; }
  const r = canBuy(club, id, rep);
  if (r.ok) { club.bought[id] = now; if (isRoom(id)) addStarters(club, id, now); }
  return r;
}

/* What to aim for next: the cheapest room or fixture you could build that you can't afford or reach yet */
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
  // each placed piece from the copy that changed it last (a sale beats a move made at the same time)
  const placed = Object.assign({}, B.placed);
  Object.entries(A.placed).forEach(([u, p]) => { const q = placed[u]; if (!q || p.t > q.t || (p.t === q.t && p.gone && !q.gone)) placed[u] = p; });
  return { start: first.start, t0: first.t0, base: first.base, tiers: first.tiers, nights, bought, placed };
}

export default { OPEN_MIN, MEMBERS, MEMBER_LEVELS, ROOMS, AMENITIES, CATALOG, CATS, CELL, BUILT_IN, STARTERS, itemOf, isRoom, isPiece, live, footprint, roomAt, fits, canPlace, place, move, sell, freeSpot, groupOf, dayKey, openClub, clean, owns, spent, effects, band, levelFor, memberMinutes, setList, stats, nightOf, settle, totals, balance, regulars, reputation, canBuy, buy, nextGoal, mergeClub };
