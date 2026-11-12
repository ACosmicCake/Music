/* World Woodshed — which island animals come to the club tonight, and how each looks at a glance: plain data
   and functions with no three.js, shared by the 3D folk (src/ui/folk.js) and the flat drawing
   (src/ui/clubscene.js). test/folk.test.js checks every animal in ANIMALS has a look here. */

/* id → [fur colour, what sits on the head: long or pointed or round ears, a beak, antennae, eye stalks,
   antlers, eyes on top, a fin, or nothing] */
export const LOOK = {
  snail: ['#b8c48a', 'stalks'],
  butterfly: ['#2b2238', 'antennae'],
  ladybird: ['#2b2238', 'antennae'],
  bee: ['#f2c94c', 'antennae'],
  songbird: ['#9c6b4e', 'beak'],
  rabbit: ['#d8c3a5', 'long'],
  squirrel: ['#c06a3a', 'point'],
  frog: ['#6fae4f', 'eyes'],
  dragonfly: ['#3d85c6', 'antennae'],
  hedgehog: ['#c9a27a', 'round'],
  kingfisher: ['#2a9d8f', 'beak'],
  heron: ['#b8c2c8', 'beak'],
  fox: ['#d9733a', 'point'],
  peacock: ['#2a6fb0', 'beak'],
  macaque: ['#9a8a78', 'round'],
  deer: ['#c08a5a', 'antlers'],
  owl: ['#9c7a5a', 'point'],
  boar: ['#6b4a32', 'point'],
  bear: ['#7a5233', 'round'],
  fish: ['#f4a261', 'fin'],
  jellyfish: ['#c9b6e4', 'none'],
  otter: ['#7a5a3e', 'round'],
  starfish: ['#ef8f6a', 'none'],
  crab: ['#d9573c', 'stalks'],
  seabird: ['#f4f1ea', 'beak'],
  pelican: ['#f4f1ea', 'beak'],
  turtle: ['#8fae6a', 'none'],
  dolphin: ['#8aa6bf', 'fin'],
  whale: ['#3d5a80', 'none']
};

/* before any animal has moved onto the island, these come to visit */
export const FIRST = ['rabbit', 'songbird', 'snail', 'butterfly', 'squirrel', 'hedgehog'];

/* who comes: one of the island's residents ([{ id, n, hiding }]), more often the more there are of them (by the
   square root, so one kind doesn't fill the room), the same for the same seed; animals hiding while the island
   is wilted stay home */
export function pickGuest(residents, seed) {
  const pool = (residents || []).filter(r => r.n > 0 && LOOK[r.id] && !r.hiding);
  const r = Math.abs(Math.sin(seed * 12.9898 + 78.233) * 43758.5453) % 1;
  if (!pool.length) return FIRST[Math.floor(r * FIRST.length)];
  const total = pool.reduce((a, b) => a + Math.sqrt(b.n), 0);
  let x = r * total;
  for (const a of pool) { x -= Math.sqrt(a.n); if (x <= 0) return a.id; }
  return pool[pool.length - 1].id;
}
