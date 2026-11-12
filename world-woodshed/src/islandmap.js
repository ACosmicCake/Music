/* World Woodshed — where everything stands on the garden island, in metres: plain data and functions with no
   three.js, shared by the 3D island (src/ui/garden3d.js) and its flat drawing (src/ui/islandflat.js), so the two
   show the same island. x runs east, z north; the Club's lot (`LOT`) is kept flat and free of trees. */
import Eco from './ecosystem.js';

export const LOT = { x0: -10, x1: 22, z0: -7, z1: 21 };            // the Club's flat ground; z0 is its front
export const C = { x: 4, z: 6 }, RX = 40, RZ = 32;                   // the land's centre and radii
export const WILD = { x: -22, z: 9 };                                // where the wood starts and spreads from
export const POND = { x: -25, z: 22, r: 3.4 };                       // appears with ten trees
export const POND_TREES = 10;
export const shapeR = (a, s = 1) => { // the coast, a little ragged, the same every time
  const j = 1 + 0.05 * Math.sin(a * 3 + 1) + 0.035 * Math.sin(a * 7 + 2) + 0.02 * Math.sin(a * 13);
  return s * j;
};
export const coast = (a, s) => ({ x: C.x + Math.cos(a) * RX * shapeR(a, s), z: C.z + Math.sin(a) * RZ * shapeR(a, s) });
export const inside = (x, z, s = 1) => { const a = Math.atan2((z - C.z) / RZ, (x - C.x) / RX); const d = Math.hypot((x - C.x) / RX, (z - C.z) / RZ); return d < shapeR(a, s); };
export const inLot = (x, z, m = 0) => x > LOT.x0 - m && x < LOT.x1 + m && z > LOT.z0 - m && z < LOT.z1 + m;
export const nearPond = (x, z, m = 0) => Math.hypot(x - POND.x, z - POND.z) < POND.r + m;
export const landOK = (x, z) => inside(x, z, 0.86) && !inLot(x, z, 2) && !nearPond(x, z, 2);
export const shallow = (x, z) => inside(x, z, 1.32) && !inside(x, z, 1.14);
export const BOUNDS = [C.x - RX, C.x + RX, C.z - RZ, C.z + RZ];

/* trees spread out from the wild corner, kelp along the shallows off the pond's shore, crates on that shore,
   litter on the beach */
export const treeAt = n => Eco.spots(n, { bounds: BOUNDS, ok: landOK, gap: 2.6, cx: WILD.x, cz: WILD.z, seed: 11 });
const aShore = Math.atan2((POND.z - C.z) / RZ, (POND.x - C.x) / RX);
export const kelpFrom = coast(aShore + 0.15, 1.22), crateFrom = coast(aShore - 0.2, 0.99);
export const kelpAt = n => Eco.spots(n, { bounds: [C.x - RX * 1.4, C.x + RX * 1.4, C.z - RZ * 1.4, C.z + RZ * 1.4], ok: shallow, gap: 1.8, cx: kelpFrom.x, cz: kelpFrom.z, seed: 23 });
export const LITTER = 16;
export const litterAt = (() => { const rr = Eco.rng(5), out = []; while (out.length < LITTER) { const a = rr() * Math.PI * 2, p = coast(a, 1.0 + rr() * 0.06); if (!inLot(p.x, p.z, 3)) out.push({ x: p.x, z: p.z, rot: rr() * 6 }); } return out; })();
export const crateAt = i => ({ x: crateFrom.x + (i % 4) * 0.7, z: crateFrom.z - 1.5 + Math.floor((i % 8) / 4) * 0.55, y: Math.floor(i / 8) * 0.3 });

export default { LOT, C, RX, RZ, WILD, POND, POND_TREES, shapeR, coast, inside, inLot, nearPond, landOK, shallow, BOUNDS, treeAt, kelpAt, kelpFrom, crateFrom, LITTER, litterAt, crateAt };
