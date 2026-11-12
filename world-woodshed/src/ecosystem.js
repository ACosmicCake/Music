/* World Woodshed — the garden island's ecosystem: which animals have moved in for the trees, kelp and bottles
   your practice has paid for (src/impact.js). Plain functions, no drawing (src/ui/island3d.js draws them);
   test/ecosystem.test.js. Land animals come with trees, sea life with kelp, and shore life once the beach is
   clean of bottles; a few need two things at once (a fox needs rabbits to hunt, a turtle needs kelp and a clean
   beach, a heron needs frogs, a bear needs deer), and ten trees make a pond. How many of each grows slowly with
   what they live on. After two days without practice the island
   wilts and the shyest animals hide until you play again. */

/* id, name, what it needs ({ tree, kelp, bottles } units, and other animals), how many per unit beyond that,
   at most, where it lives, and whether it hides when the island wilts */
export const ANIMALS = [
  // the first trees: small things
  { id: 'snail', name: 'Snails', needs: { tree: 1 }, per: { tree: 0.2 }, max: 3, home: 'land', shy: true },
  { id: 'butterfly', name: 'Butterflies', needs: { tree: 2 }, per: { tree: 0.5 }, max: 8, home: 'air' },
  { id: 'ladybird', name: 'Ladybirds', needs: { tree: 3 }, per: { tree: 0.3 }, max: 4, home: 'land' },
  { id: 'bee', name: 'Bees', needs: { tree: 4 }, per: { tree: 0.4 }, max: 6, home: 'air' },
  { id: 'songbird', name: 'Songbirds', needs: { tree: 5 }, per: { tree: 0.25 }, max: 6, home: 'tree' },
  { id: 'rabbit', name: 'Rabbits', needs: { tree: 7 }, per: { tree: 0.2 }, max: 5, home: 'land', shy: true },
  { id: 'squirrel', name: 'Squirrels', needs: { tree: 9 }, per: { tree: 0.12 }, max: 3, home: 'tree', shy: true },
  // ten trees hold enough rain for a pond
  { id: 'frog', name: 'Frogs', needs: { tree: 10 }, per: { tree: 0.15 }, max: 4, home: 'pond', shy: true },
  { id: 'dragonfly', name: 'Dragonflies', needs: { tree: 11 }, per: { tree: 0.15 }, max: 4, home: 'pond-air' },
  { id: 'hedgehog', name: 'Hedgehogs', needs: { tree: 13 }, per: { tree: 0.08 }, max: 2, home: 'land', shy: true },
  { id: 'kingfisher', name: 'A kingfisher', needs: { tree: 15 }, per: {}, max: 1, home: 'pond-air' },
  { id: 'heron', name: 'A heron', needs: { tree: 18, frog: 1 }, per: {}, max: 1, home: 'pond', shy: true },
  { id: 'fox', name: 'A fox', needs: { tree: 20, rabbit: 1 }, per: {}, max: 1, home: 'land', shy: true },
  { id: 'peacock', name: 'Peafowl', needs: { tree: 24 }, per: { tree: 0.05 }, max: 2, home: 'land' },
  { id: 'macaque', name: 'Macaques', needs: { tree: 28 }, per: { tree: 0.06 }, max: 3, home: 'tree', shy: true },
  { id: 'deer', name: 'Deer', needs: { tree: 32 }, per: { tree: 0.05 }, max: 3, home: 'land', shy: true },
  { id: 'owl', name: 'An owl', needs: { tree: 38 }, per: {}, max: 1, home: 'tree', shy: true },
  { id: 'boar', name: 'Wild boar', needs: { tree: 44 }, per: { tree: 0.04 }, max: 2, home: 'land', shy: true },
  { id: 'bear', name: 'A bear', needs: { tree: 60, deer: 1 }, per: {}, max: 1, home: 'land', shy: true },
  // the sea, with kelp
  { id: 'fish', name: 'Fish', needs: { kelp: 1 }, per: { kelp: 0.6 }, max: 10, home: 'sea' },
  { id: 'jellyfish', name: 'Jellyfish', needs: { kelp: 3 }, per: { kelp: 0.2 }, max: 4, home: 'sea' },
  { id: 'otter', name: 'Sea otters', needs: { kelp: 8 }, per: { kelp: 0.1 }, max: 3, home: 'sea', shy: true },
  // the shore, as the beach gets clean
  { id: 'starfish', name: 'Starfish', needs: { bottles: 1 }, per: { bottles: 0.3 }, max: 5, home: 'shore' },
  { id: 'crab', name: 'Crabs', needs: { bottles: 3 }, per: { bottles: 0.3 }, max: 4, home: 'shore', shy: true },
  { id: 'seabird', name: 'Seabirds', needs: { bottles: 5 }, per: { bottles: 0.2 }, max: 4, home: 'sky' },
  { id: 'pelican', name: 'A pelican', needs: { bottles: 8, fish: 1 }, per: {}, max: 1, home: 'shore' },
  // both: a clean, living sea
  { id: 'turtle', name: 'A sea turtle', needs: { kelp: 5, bottles: 5 }, per: {}, max: 1, home: 'sea' },
  { id: 'dolphin', name: 'Dolphins', needs: { kelp: 10, bottles: 8 }, per: { kelp: 0.1 }, max: 3, home: 'sea' },
  { id: 'whale', name: 'A whale', needs: { kelp: 20, bottles: 15 }, per: {}, max: 1, home: 'deep' }
];
const KINDS = ['tree', 'kelp', 'bottles'];

/* Units of each kind from the ledger's orders: { tree, kelp, bottles } */
export function counts(planted) {
  const c = { tree: 0, kelp: 0, bottles: 0 };
  (planted || []).forEach(p => { if (KINDS.includes(p.kind)) c[p.kind]++; });
  return c;
}

const has = (a, c, have) => Object.entries(a.needs).every(([k, n]) => (KINDS.includes(k) ? c[k] : have[k] || 0) >= n);

/* The animals living on the island: [{ id, name, home, n }] in arrival order. wilted (two days or more
   without practice) sends the shy ones into hiding: they are still counted, with hiding: true. */
export function residents(c, { wilted = false } = {}) {
  const have = {}, out = [];
  ANIMALS.forEach(a => {
    if (!has(a, c, have)) return;
    let n = 1;
    Object.entries(a.per).forEach(([k, r]) => { n += Math.floor((c[k] - a.needs[k]) * r); });
    n = Math.max(1, Math.min(a.max, n));
    have[a.id] = n;
    out.push({ id: a.id, name: a.name, home: a.home, n, hiding: !!(wilted && a.shy) });
  });
  return out;
}

/* The next animal to come and what it still needs, for "3 more trees and rabbits move in", or null */
export function nextArrival(c) {
  const here = new Set(residents(c).map(r => r.id));
  let best = null;
  ANIMALS.forEach(a => {
    if (here.has(a.id)) return;
    const short = {};
    let total = 0, blocked = false;
    Object.entries(a.needs).forEach(([k, n]) => {
      if (KINDS.includes(k)) { const s = Math.max(0, n - c[k]); if (s) { short[k] = s; total += s; } }
      else if (!here.has(k)) blocked = true;
    });
    if (blocked || !total) return;
    if (!best || total < best.total) best = { id: a.id, name: a.name, short, total };
  });
  return best;
}

/* Words for what is still needed: "3 more trees", "2 more kelp and 10 more bottles" */
export function shortWords(short) {
  const w = { tree: n => n + ' more tree' + (n === 1 ? '' : 's'), kelp: n => n + ' more kelp', bottles: n => n * 10 + ' more bottles' };
  return Object.entries(short).map(([k, n]) => w[k](n)).join(' and ');
}

/* A fixed pseudo-random sequence from a seed, so each tree keeps its spot on the island across visits */
export function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

/* Spots for n things inside bounds [x0, x1, z0, z1] where ok(x, z) holds, at least `gap` apart where there is
   room, growing outward from (cx, cz) like a wood spreading: the same n always gives the same spots, and n + 1
   keeps the first n. */
export function spots(n, { bounds = [-5, 5, -5, 5], ok = () => true, gap = 2, cx = 0, cz = 0, seed = 7, tries = 40 } = {}) {
  const r = rng(seed), out = [];
  const [x0, x1, z0, z1] = bounds;
  for (let i = 0; i < n; i++) {
    let best = null, loose = null;
    for (let t = 0; t < tries; t++) {
      const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0);
      if (!ok(x, z)) continue;
      const near = out.reduce((m, q) => Math.min(m, Math.hypot(q.x - x, q.z - z)), Infinity);
      const d = Math.hypot(x - cx, z - cz);
      if (near >= gap) { if (!best || d < best.d) best = { x, z, d }; }
      else if (!loose || near > loose.near) loose = { x, z, near };
    }
    const p = best || loose || { x: cx, z: cz };
    out.push({ x: p.x, z: p.z, rot: r() * Math.PI * 2, size: 0.85 + r() * 0.35, v: Math.floor(r() * 1000) });
  }
  return out;
}

export default { ANIMALS, counts, residents, nextArrival, shortWords, rng, spots };
