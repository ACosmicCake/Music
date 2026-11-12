/* World Woodshed — the garden island in 3D: the real trees, kelp and bottles your practice paid for
   (src/impact.js), and the animals that move in as the island grows (src/ecosystem.js). Built on the shared
   low-poly kit (src/ui/lowpoly.js, three.js, its own chunk) and shared with the Club, which sits in the
   flat lot this leaves for it (`lot`) and adds this island to its own Stage.

   Island(stage, { planted, wilted, seen, next }) → { group, update(planted, o), frame(dt, t), lot, focus }
     planted: the ledger's live orders; wilted: two days or more without practice (dry grass, shy animals
     hide); seen: how many orders were on screen before, so the ones after pop up as they appear; next:
     { kind, frac } for the sapling growing toward the next order.
   plantModel(kind, o), animalModel(id) and animate(obj, t) are the models and their own small motions.
   mountIsland(el, o) makes a Stage with the island alone, for the garden card and the island page.
   Units are metres, y = 0 is the lawn, +z is away from the club's front. All the art is drawn here, original. */
import { THREE, mat, group, shadows, Stage, reduced } from './lowpoly.js';
import Eco from '../ecosystem.js';

export const PALETTE = {
  leaf: 0x5f9e4f, leaf2: 0x4a8a46, leaf3: 0x7aab4a, leafDry: 0xb59a4a, trunk: 0x8a6440, kelp: 0x8f7a2a, float: 0xb08d30,
  sand: 0xeedfb8, sandWet: 0xd6c49a, grass: 0x6fae55, grassDry: 0xb9ad62, sea: 0x3f9fb6, deep: 0x2a6f8f, rock: 0x9a978c,
  bottle: 0xa8dcd4, cap: 0x2f7d95, crate: 0xa77a4b, pond: 0x4b9cb3, reed: 0x7c9a3c
};

/* ---------- little builders (base at y, like the kit's box and cyl) ---------- */
const mk = (geo, color, o) => new THREE.Mesh(geo, o && o.isMaterial ? o : mat(color, o));
const P = (m, x = 0, y = 0, z = 0, s) => { m.position.set(x, y, z); if (s !== undefined) (Array.isArray(s) ? m.scale.set(...s) : m.scale.setScalar(s)); return m; };
const ball = (r, c, d = 0) => mk(new THREE.IcosahedronGeometry(r, d), c);
const cone = (r, h, c, seg = 6) => mk(new THREE.ConeGeometry(r, h, seg), c);
const cyl = (r1, r2, h, c, seg = 6) => mk(new THREE.CylinderGeometry(r1, r2, h, seg), c);
const box = (w, h, d, c) => mk(new THREE.BoxGeometry(w, h, d), c);
const legs4 = (g, w, l, h, c, r = 0.03) => { [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([x, z]) => g.add(P(box(r, h, r, c), x * w, h / 2, z * l))); return g; };

/* ---------- plants (about 1 m tall; the island scales them) ---------- */
function tree({ size = 1, wilted = false, v = 0 } = {}) {
  const leaf = wilted ? PALETTE.leafDry : [PALETTE.leaf, PALETTE.leaf2, PALETTE.leaf3][v % 3];
  const g = group(P(cyl(0.06, 0.1, 0.5, PALETTE.trunk, 5), 0, 0.25, 0));
  const kind = v % 4;
  if (kind === 0) g.add(P(cone(0.42, 0.5, leaf, 7), 0, 0.62, 0), P(cone(0.32, 0.42, leaf, 7), 0, 0.88, 0), P(cone(0.2, 0.34, leaf, 7), 0, 1.1, 0));
  else if (kind === 1) g.add(P(ball(0.38, leaf), 0, 0.78, 0), P(ball(0.26, leaf), 0.22, 0.62, 0.08), P(ball(0.24, leaf), -0.18, 0.64, -0.1));
  else if (kind === 2) { // a palm, for the warm side of the island
    g.children[0].scale.set(0.8, 2, 0.8); g.children[0].position.y = 0.5; g.children[0].rotation.z = 0.12;
    for (let i = 0; i < 6; i++) { const f = P(box(0.5, 0.02, 0.12, leaf), 0, 1.02, 0); f.geometry.translate(0.25, 0, 0); f.rotation.set(0, (i / 6) * Math.PI * 2, -0.35); g.add(f); }
  } else g.add(P(ball(0.3, leaf), 0, 0.7, 0, [1, 1.5, 1]), P(ball(0.18, leaf), 0, 1.08, 0)); // a tall poplar
  g.scale.setScalar(size);
  g.userData.kind = 'tree';
  g.userData.top = kind === 2 ? 1.05 : kind === 0 ? 1.2 : 1.05;
  return shadows(g);
}
function kelp({ size = 1, v = 0 } = {}) {
  const g = new THREE.Group(), n = 3 + (v % 2);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, frond = new THREE.Group();
    for (let j = 0; j < 5; j++) { const s = P(box(0.07, 0.24, 0.02, PALETTE.kelp), 0, 0.12 + j * 0.21, 0); s.rotation.z = (j % 2 ? 1 : -1) * 0.2; frond.add(s); }
    frond.add(P(ball(0.05, PALETTE.float), 0.04, 1.08, 0));
    frond.position.set(Math.cos(a) * 0.1, 0, Math.sin(a) * 0.1);
    frond.rotation.y = a;
    frond.userData.sway = i;
    g.add(frond);
  }
  g.scale.setScalar(size);
  g.userData.kind = 'kelp';
  return g;
}
function bottle(lying) {
  const glass = mat(PALETTE.bottle, { transparent: true, opacity: 0.85 });
  const b = group(P(mk(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 6), 0, glass), 0, 0.09, 0), P(mk(new THREE.CylinderGeometry(0.022, 0.04, 0.06, 6), 0, glass), 0, 0.21, 0), P(cyl(0.024, 0.024, 0.025, PALETTE.cap), 0, 0.25, 0));
  if (lying) { b.rotation.z = Math.PI / 2; b.position.y = 0.05; }
  return b;
}
/* ten bottles collected: a crate of them */
function crate({ size = 1 } = {}) {
  const g = group(P(box(0.42, 0.2, 0.3, PALETTE.crate), 0, 0.1, 0));
  for (let i = 0; i < 6; i++) g.add(P(bottle(false), -0.14 + (i % 3) * 0.14, 0.12, -0.07 + Math.floor(i / 3) * 0.14, 0.9));
  g.scale.setScalar(size);
  g.userData.kind = 'bottles';
  return shadows(g);
}
export function plantModel(kind, o = {}) { return kind === 'kelp' ? kelp(o) : kind === 'bottles' ? crate(o) : tree(o); }

/* ---------- animals (life size, facing +z) ---------- */
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
function wings(color, span, flat) {
  const geo = flat ? new THREE.BoxGeometry(span, 0.01, span * 0.4) : new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -span * 0.3), new THREE.Vector3(span, 0, 0), new THREE.Vector3(0, 0, span * 0.45)]);
  if (flat) geo.translate(span / 2, 0, 0);
  geo.computeVertexNormals();
  const m = mat(color, { side: THREE.DoubleSide });
  const L = group(new THREE.Mesh(geo, m)), R = group(new THREE.Mesh(geo, m));
  R.scale.x = -1;
  L.userData.wing = 1; R.userData.wing = -1;
  return [L, R];
}
const MAKERS = {
  snail: () => group(P(box(0.06, 0.02, 0.16, 0xc9b79c), 0, 0.01, 0), P(ball(0.05, 0xa0603a, 1), 0, 0.06, -0.02, [0.7, 1, 1])),
  ladybird: () => group(P(ball(0.03, 0xd0302a, 1), 0, 0.02, 0, [1, 0.6, 1.2]), P(ball(0.014, 0x1a1a1a), 0, 0.02, 0.035)),
  butterfly: () => group(P(box(0.015, 0.015, 0.08, 0x2b2b2b), 0, 0, 0), ...wings(pick([0xf2a03d, 0x7aa6e8, 0xf0d24a, 0xe07ab0]), 0.08)),
  bee: () => group(P(ball(0.03, 0xf0c02a, 1), 0, 0, 0, [1, 0.9, 1.4]), P(box(0.062, 0.015, 0.015, 0x2b2b2b), 0, 0, 0.005), ...wings(0xe8f4f8, 0.04)),
  dragonfly: () => group(P(box(0.015, 0.015, 0.12, 0x2f8fa0), 0, 0, 0), ...wings(0xcfeaf0, 0.07)),
  songbird: () => group(P(ball(0.07, pick([0xc85a3a, 0x3d85c6, 0xe9c46a]), 1), 0, 0.07, 0, [1, 0.9, 1.25]), P(ball(0.05, 0x7a4a35, 1), 0, 0.13, 0.06), P(cone(0.017, 0.05, 0xf0b030, 4), 0, 0.13, 0.11).rotateX(Math.PI / 2), ...wings(0x7a4a35, 0.1, true)),
  kingfisher: () => group(P(ball(0.07, 0x1f8fc2, 1), 0, 0.07, 0, [1, 0.9, 1.3]), P(ball(0.05, 0xe07a2f, 1), 0, 0.05, 0.03), P(ball(0.05, 0x1f8fc2, 1), 0, 0.13, 0.06), P(cone(0.015, 0.09, 0x222222, 4), 0, 0.13, 0.13).rotateX(Math.PI / 2), ...wings(0x1f8fc2, 0.1, true)),
  seabird: () => group(P(ball(0.1, 0xf4f4f0, 1), 0, 0, 0, [0.8, 0.8, 1.5]), P(cone(0.02, 0.08, 0xf0b030, 4), 0, 0.02, 0.17).rotateX(Math.PI / 2), ...wings(0xdedcd6, 0.4, true)),
  rabbit: () => {
    const c = pick([0xb9a48a, 0x8f7b66, 0xd8d0c4]);
    const g = group(P(ball(0.12, c, 1), 0, 0.11, 0, [0.9, 0.85, 1.2]), P(ball(0.075, c, 1), 0, 0.2, 0.12), P(ball(0.035, 0xf4efe6), 0, 0.12, -0.14));
    [-1, 1].forEach(s => { const e = P(box(0.03, 0.12, 0.015, c), s * 0.03, 0.31, 0.11); e.rotation.z = s * 0.15; g.add(e); });
    return g;
  },
  squirrel: () => { const t = P(ball(0.08, 0xa0522d), 0, 0.18, -0.1, [0.7, 1.4, 0.7]); t.rotation.x = -0.4; return group(P(ball(0.07, 0xa0522d, 1), 0, 0.08, 0, [0.9, 1, 1.2]), P(ball(0.045, 0xa0522d, 1), 0, 0.15, 0.07), t); },
  frog: () => group(P(ball(0.06, 0x5aa14a, 1), 0, 0.04, 0, [1.2, 0.7, 1.1]), P(ball(0.02, 0xf0f0e0), -0.03, 0.08, 0.04), P(ball(0.02, 0xf0f0e0), 0.03, 0.08, 0.04)),
  hedgehog: () => group(P(ball(0.11, 0x6b5440, 0), 0, 0.08, 0, [1, 0.75, 1.25]), P(ball(0.05, 0xc8ae8c, 1), 0, 0.06, 0.12), P(ball(0.012, 0x1a1a1a), 0, 0.06, 0.17)),
  heron: () => {
    const g = group(P(ball(0.14, 0x9aa3ad, 1), 0, 0.75, 0, [0.8, 0.9, 1.4]), P(cyl(0.025, 0.03, 0.35, 0x9aa3ad, 5), 0, 0.98, 0.12), P(ball(0.05, 0xdfe3e6, 1), 0, 1.16, 0.15), P(cone(0.015, 0.16, 0xe0b030, 4), 0, 1.15, 0.26).rotateX(Math.PI / 2));
    g.add(P(box(0.02, 0.62, 0.02, 0xc0a060), -0.04, 0.31, 0), P(box(0.02, 0.62, 0.02, 0xc0a060), 0.04, 0.31, 0));
    return g;
  },
  fox: () => {
    const g = group(P(box(0.16, 0.14, 0.36, 0xd2691e), 0, 0.22, 0), P(box(0.14, 0.13, 0.14, 0xd2691e), 0, 0.31, 0.22), P(cone(0.045, 0.1, 0x2b2b2b, 4), 0, 0.28, 0.33).rotateX(Math.PI / 2));
    const tail = P(cone(0.07, 0.3, 0xd2691e, 5), 0, 0.22, -0.3); tail.rotation.x = -Math.PI / 2 - 0.4; g.add(tail, P(ball(0.04, 0xf4efe6), 0, 0.16, -0.43));
    [-1, 1].forEach(s => g.add(P(cone(0.035, 0.08, 0xd2691e, 4), s * 0.045, 0.41, 0.21)));
    return legs4(g, 0.055, 0.12, 0.15, 0x3a2a20);
  },
  peacock: () => {
    const g = group(P(ball(0.12, 0x1f5fa8, 1), 0, 0.42, 0, [0.9, 1, 1.2]), P(cyl(0.03, 0.04, 0.28, 0x1f5fa8, 5), 0, 0.6, 0.1), P(ball(0.05, 0x1f5fa8, 1), 0, 0.76, 0.12), P(cone(0.015, 0.06, 0x2f8f6f, 4), 0, 0.85, 0.12));
    const fan = new THREE.Group();
    for (let i = 0; i < 9; i++) { const f = P(box(0.08, 0.7, 0.015, 0x2f8f6f), 0, 0, 0); f.geometry.translate(0, 0.35, 0); f.rotation.z = (i - 4) * 0.22; fan.add(f, P(ball(0.035, 0x1f5fa8), Math.sin((i - 4) * 0.22) * -0.62, Math.cos((i - 4) * 0.22) * 0.62, 0.01)); }
    fan.position.set(0, 0.45, -0.14); fan.rotation.x = -0.35; fan.userData.fan = true; g.add(fan);
    return legs4(g, 0.04, 0.0, 0.32, 0x8a7a6a, 0.02);
  },
  macaque: () => {
    const c = 0x8c7a5c;
    const g = group(P(ball(0.13, c, 1), 0, 0.28, 0, [0.9, 1.2, 0.9]), P(ball(0.09, c, 1), 0, 0.5, 0.04), P(ball(0.06, 0xd89a8a, 1), 0, 0.48, 0.1, [1, 0.9, 0.6]));
    const tail = P(cyl(0.015, 0.02, 0.3, c, 4), 0, 0.2, -0.15); tail.rotation.x = 0.9; g.add(tail);
    return legs4(g, 0.06, 0.04, 0.18, c, 0.04);
  },
  deer: () => {
    const g = group(P(box(0.24, 0.24, 0.6, 0x9b6b43), 0, 0.62, 0), P(box(0.11, 0.3, 0.11, 0x9b6b43), 0, 0.85, 0.28), P(box(0.12, 0.11, 0.22, 0x9b6b43), 0, 1.02, 0.34), P(ball(0.05, 0xf4efe6), 0, 0.68, -0.31));
    [-1, 1].forEach(s => { const a = P(cyl(0.012, 0.018, 0.24, 0xd8c8a8, 4), s * 0.06, 1.18, 0.3); a.rotation.z = -s * 0.5; g.add(a); const t = P(cyl(0.01, 0.012, 0.1, 0xd8c8a8, 4), s * 0.1, 1.24, 0.34); t.rotation.x = 0.6; g.add(t); });
    return legs4(g, 0.08, 0.22, 0.5, 0x5a3d26, 0.05);
  },
  boar: () => {
    const g = group(P(box(0.3, 0.3, 0.6, 0x4a3a2e), 0, 0.42, 0), P(box(0.2, 0.2, 0.22, 0x4a3a2e), 0, 0.4, 0.38), P(cyl(0.05, 0.06, 0.06, 0x8a6a5a, 6), 0, 0.37, 0.5).rotateX(Math.PI / 2));
    [-1, 1].forEach(s => g.add(P(cone(0.015, 0.08, 0xf0ead8, 4), s * 0.07, 0.33, 0.48).rotateZ(-s * 0.4)));
    return legs4(g, 0.1, 0.2, 0.28, 0x2e241c, 0.06);
  },
  bear: () => {
    const c = 0x4a3326;
    const g = group(P(ball(0.45, c, 1), 0, 0.7, 0, [0.85, 0.75, 1.3]), P(ball(0.24, c, 1), 0, 0.85, 0.5), P(ball(0.1, 0x8a6a50, 1), 0, 0.8, 0.7));
    [-1, 1].forEach(s => g.add(P(ball(0.07, c), s * 0.15, 1.05, 0.48)));
    return legs4(g, 0.22, 0.3, 0.5, c, 0.16);
  },
  owl: () => group(P(ball(0.1, 0x8b7355, 1), 0, 0.12, 0, [1, 1.3, 0.9]), P(ball(0.03, 0xf8e8a0), -0.04, 0.17, 0.08), P(ball(0.03, 0xf8e8a0), 0.04, 0.17, 0.08), P(cone(0.015, 0.04, 0xe0a030, 4), 0, 0.13, 0.1)),
  fish: () => { const c = pick([0xf09a3a, 0xf2d24a, 0x7ec8e3, 0xe86a5a]); const t = P(cone(0.05, 0.08, c, 4), 0, 0, -0.1); t.rotation.x = Math.PI / 2; return group(P(ball(0.06, c), 0, 0, 0, [0.6, 0.8, 1.3]), t); },
  jellyfish: () => { const g = group(P(ball(0.14, 0xe9a8d8, 1), 0, 0, 0, [1, 0.6, 1])); for (let i = 0; i < 5; i++) g.add(P(box(0.012, 0.25, 0.012, 0xf2c8e8), Math.cos(i * 1.3) * 0.07, -0.14, Math.sin(i * 1.3) * 0.07)); g.children[0].material = mat(0xe9a8d8, { transparent: true, opacity: 0.8 }); return g; },
  starfish: () => { const c = pick([0xe86a3a, 0xf0a040, 0xc8506a]); const g = new THREE.Group(); for (let i = 0; i < 5; i++) { const a = P(box(0.05, 0.02, 0.14, c), 0, 0.01, 0); a.geometry.translate(0, 0, 0.07); a.rotation.y = (i / 5) * Math.PI * 2; g.add(a); } return g; },
  crab: () => {
    const g = group(P(ball(0.09, 0xd2492a), 0, 0.06, 0, [1.3, 0.55, 1]));
    [-1, 1].forEach(s => { g.add(P(ball(0.04, 0xd2492a), s * 0.13, 0.06, 0.08)); for (let i = 0; i < 3; i++) { const l = P(box(0.09, 0.015, 0.015, 0xb03a20), s * 0.11, 0.025, -0.04 + i * 0.04); l.rotation.z = s * 0.4; g.add(l); } });
    return g;
  },
  pelican: () => group(P(ball(0.2, 0xf2f0ea, 1), 0, 0.45, 0, [0.9, 1, 1.3]), P(cyl(0.04, 0.05, 0.3, 0xf2f0ea, 5), 0, 0.68, 0.15), P(ball(0.07, 0xf2f0ea, 1), 0, 0.85, 0.17), P(box(0.06, 0.06, 0.32, 0xf0a030), 0, 0.8, 0.36), P(box(0.03, 0.3, 0.03, 0xe0a040), -0.06, 0.15, 0), P(box(0.03, 0.3, 0.03, 0xe0a040), 0.06, 0.15, 0)),
  otter: () => group(P(ball(0.12, 0x6b4a32, 1), 0, 0.03, 0, [1, 0.6, 1.8]), P(ball(0.08, 0x6b4a32, 1), 0, 0.08, 0.2), P(ball(0.05, 0xd8c8b0), 0, 0.07, 0.26)),
  turtle: () => {
    const g = group(P(ball(0.35, 0x4f7a3a, 0), 0, 0.05, 0, [1, 0.45, 1.2]), P(ball(0.12, 0x8aa86a, 1), 0, 0.03, 0.45));
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([x, z]) => { const f = P(box(0.26, 0.03, 0.1, 0x8aa86a), x * 0.3, 0, z * 0.22); f.userData.flipper = x * z; g.add(f); });
    return g;
  },
  dolphin: () => {
    const g = group(P(ball(0.3, 0x7f93a8, 1), 0, 0, 0, [0.7, 0.7, 2.6]), P(cone(0.08, 0.3, 0x7f93a8, 4), 0, 0.03, 0.85).rotateX(Math.PI / 2), P(cone(0.1, 0.25, 0x6a7f94, 4), 0, 0.28, -0.05));
    const t = P(box(0.5, 0.04, 0.16, 0x6a7f94), 0, 0, -0.8); g.add(t);
    return g;
  },
  whale: () => {
    const g = group(P(ball(1.6, 0x3d5468, 1), 0, 0, 0, [0.8, 0.55, 2.6]), P(ball(1.2, 0xc8d0d8, 1), 0, -0.35, 0.9, [0.7, 0.4, 1.6]));
    const t = P(box(2.2, 0.12, 0.7, 0x3d5468), 0, 0.1, -4.2); g.add(t);
    return g;
  }
};
// a little larger than life, so they read from up high; the smallest most of all
const SCALE = { butterfly: 5, bee: 5, ladybird: 6, snail: 5, dragonfly: 5, songbird: 3.2, kingfisher: 3.2, squirrel: 3, frog: 3.5, rabbit: 2.6, hedgehog: 2.8, fish: 3.5, starfish: 3, crab: 3, owl: 3, jellyfish: 2.2, otter: 2.2, seabird: 2.2, heron: 1.8, fox: 2, peacock: 2, macaque: 2.2, deer: 1.7, boar: 1.8, bear: 1.6, pelican: 1.8, turtle: 1.8, dolphin: 1.5, whale: 1.2 };
export function animalModel(id) {
  const g = shadows((MAKERS[id] || MAKERS.rabbit)());
  g.userData.kind = id;
  g.userData.phase = Math.random() * Math.PI * 2;
  g.scale.setScalar(SCALE[id] || 2);
  return g;
}

/* ---------- idle motion ---------- */
export function animate(obj, t) {
  const k = obj.userData.kind, p = obj.userData.phase || 0;
  if (k === 'kelp') { obj.children.forEach(f => { if (f.userData.sway !== undefined) f.rotation.x = Math.sin(t * 1.1 + f.userData.sway) * 0.14; }); return; }
  if (k === 'tree') { obj.rotation.z = Math.sin(t * 0.7 + obj.position.x) * 0.012; return; }
  const flap = { butterfly: 10, bee: 30, dragonfly: 34, songbird: 14, kingfisher: 16, seabird: 3 }[k];
  if (flap) obj.children.forEach(c => { if (c.userData.wing) c.rotation.z = c.userData.wing * (0.2 + Math.sin(t * flap + p) * (k === 'seabird' ? 0.3 : 0.8)); });
  if (k === 'turtle') obj.children.forEach(c => { if (c.userData.flipper) c.rotation.y = Math.sin(t * 2 + p) * 0.4 * c.userData.flipper; });
  if (k === 'jellyfish') obj.children[0].scale.y = 0.6 + Math.sin(t * 2 + p) * 0.12;
  if (k === 'peacock') obj.children.forEach(c => { if (c.userData.fan) c.scale.setScalar(0.75 + 0.25 * Math.max(0, Math.sin(t * 0.4 + p))); });
}

/* ---------- the island ---------- */
const LOT = { x0: -10, x1: 22, z0: -7, z1: 21 };            // the Club's flat ground; z0 is its front
const C = { x: 4, z: 6 }, RX = 40, RZ = 32;                   // the land's centre and radii
const WILD = { x: -22, z: 9 };                                // where the wood starts and spreads from
const POND = { x: -25, z: 22, r: 3.4 };                       // appears with ten trees
const SEA_Y = -0.35;
const shapeR = (a, s = 1) => { // the coast, a little ragged, the same every time
  const j = 1 + 0.05 * Math.sin(a * 3 + 1) + 0.035 * Math.sin(a * 7 + 2) + 0.02 * Math.sin(a * 13);
  return s * j;
};
const coast = (a, s) => ({ x: C.x + Math.cos(a) * RX * shapeR(a, s), z: C.z + Math.sin(a) * RZ * shapeR(a, s) });
const inside = (x, z, s = 1) => { const a = Math.atan2((z - C.z) / RZ, (x - C.x) / RX); const d = Math.hypot((x - C.x) / RX, (z - C.z) / RZ); return d < shapeR(a, s); };
const inLot = (x, z, m = 0) => x > LOT.x0 - m && x < LOT.x1 + m && z > LOT.z0 - m && z < LOT.z1 + m;
const nearPond = (x, z, m = 0) => Math.hypot(x - POND.x, z - POND.z) < POND.r + m;
const landOK = (x, z) => inside(x, z, 0.86) && !inLot(x, z, 2) && !nearPond(x, z, 2);
const shallow = (x, z) => inside(x, z, 1.32) && !inside(x, z, 1.14);
const BOUNDS = [C.x - RX, C.x + RX, C.z - RZ, C.z + RZ];
const TREE_SCALE = 3.4, KELP_SCALE = 3.2;
const HOME = { cx: WILD.x + 4, cz: WILD.z - 3, dist: 50, pitch: 0.95, yaw: -0.55 }; // the wild side, with the sea beyond

function flatShape(s, seg = 40) {
  const sh = new THREE.Shape();
  for (let i = 0; i <= seg; i++) { const a = (i / seg) * Math.PI * 2, p = coast(a, s); if (i) sh.lineTo(p.x, -p.z); else sh.moveTo(p.x, -p.z); }
  const g = new THREE.ShapeGeometry(sh);
  g.rotateX(-Math.PI / 2);
  return g;
}

export function Island(stage, o = {}) {
  const root = new THREE.Group(), plants = new THREE.Group(), fauna = new THREE.Group(), deco = new THREE.Group();
  root.add(deco, plants, fauna);
  stage.scene.add(root);
  let wilted = !!o.wilted, planted = o.planted || [], seen = o.seen ?? planted.length, next = o.next || null;

  // the ground: sea, wet sand, beach, lawn
  const sea = new THREE.Mesh(new THREE.CircleGeometry(140, 40).rotateX(-Math.PI / 2), mat(PALETTE.sea, { transparent: true, opacity: 0.88 }));
  sea.position.y = SEA_Y; sea.receiveShadow = true;
  const deep = new THREE.Mesh(new THREE.RingGeometry(70, 140, 40).rotateX(-Math.PI / 2), mat(PALETTE.deep));
  deep.position.y = SEA_Y - 0.02;
  const wet = new THREE.Mesh(flatShape(1.14), mat(PALETTE.sandWet)); wet.position.y = -0.3;
  const sand = new THREE.Mesh(flatShape(1.08), mat(PALETTE.sand)); sand.position.y = -0.12; sand.receiveShadow = true;
  const lawn = new THREE.Mesh(flatShape(0.95), mat(wilted ? PALETTE.grassDry : PALETTE.grass)); lawn.position.y = 0; lawn.receiveShadow = true;
  root.add(deep, sea, wet, sand, lawn);
  // rocks on the shore and hills of grass, the same every time
  const r = Eco.rng(31);
  for (let i = 0; i < 14; i++) {
    const a = r() * Math.PI * 2, p = coast(a, 1.02 + r() * 0.05);
    if (inLot(p.x, p.z, 4)) continue;
    const rock = P(ball(0.6 + r() * 0.9, PALETTE.rock), p.x, -0.1, p.z, [1, 0.6, 1]); rock.rotation.y = r() * 6; deco.add(shadows(rock));
  }
  // ground cover: bushes, flowers and tufts of grass, so a young island isn't bare
  const flowers = [0xf2d24a, 0xe07ab0, 0xffffff, 0xc77dff];
  for (let i = 0; i < 70; i++) {
    const x = BOUNDS[0] + r() * (BOUNDS[1] - BOUNDS[0]), z = BOUNDS[2] + r() * (BOUNDS[3] - BOUNDS[2]);
    if (!inside(x, z, 0.9) || inLot(x, z, 1) || nearPond(x, z, 1)) continue;
    const k = i % 3;
    if (k === 0) deco.add(shadows(P(ball(0.5 + r() * 0.4, i % 2 ? PALETTE.leaf2 : PALETTE.leaf3), x, 0.25, z, [1, 0.7, 1])));
    else if (k === 1) { const f = group(P(cyl(0.02, 0.02, 0.4, PALETTE.reed, 4), 0, 0.2, 0), P(ball(0.12, flowers[i % 4]), 0, 0.42, 0)); f.position.set(x, 0, z); deco.add(f); }
    else { const tuft = group(); for (let j = 0; j < 3; j++) { const b = P(cone(0.08, 0.45, PALETTE.leaf3, 3), (j - 1) * 0.1, 0.22, 0); b.rotation.z = (j - 1) * 0.3; tuft.add(b); } tuft.position.set(x, 0, z); deco.add(tuft); }
  }
  let pond = null;
  function makePond() {
    pond = new THREE.Group();
    const water = new THREE.Mesh(new THREE.CircleGeometry(POND.r, 9).rotateX(-Math.PI / 2), mat(PALETTE.pond)); water.position.y = 0.02;
    const rim = new THREE.Mesh(new THREE.RingGeometry(POND.r, POND.r + 0.5, 9).rotateX(-Math.PI / 2), mat(PALETTE.sandWet)); rim.position.y = 0.015;
    pond.add(water, rim);
    for (let i = 0; i < 9; i++) { const a = i * 0.7 + 0.3, reed = P(cyl(0.03, 0.04, 1 + (i % 3) * 0.3, PALETTE.reed, 4), POND.x + Math.cos(a) * (POND.r + 0.2), 0.5, POND.z + Math.sin(a) * (POND.r + 0.2)); pond.add(reed); }
    for (let i = 0; i < 3; i++) pond.add(P(new THREE.Mesh(new THREE.CircleGeometry(0.35, 6).rotateX(-Math.PI / 2), mat(0x5e9e4a)), POND.x - 1 + i, 0.04, POND.z + (i % 2 ? 1 : -0.8)));
    pond.children.slice(0, 2).forEach(m => m.position.set(POND.x, m.position.y, POND.z));
    shadows(pond);
    root.add(pond);
  }

  // where things go: trees spread out from the wild corner, kelp along the west shallows, litter on the beach
  const treeAt = n => Eco.spots(n, { bounds: BOUNDS, ok: landOK, gap: 2.6, cx: WILD.x, cz: WILD.z, seed: 11 });
  // the shore beside the pond, which the first view looks across: kelp grows off it and the crates stand on it
  const aShore = Math.atan2((POND.z - C.z) / RZ, (POND.x - C.x) / RX), kelpFrom = coast(aShore + 0.15, 1.22), crateFrom = coast(aShore - 0.2, 0.99);
  const kelpAt = n => Eco.spots(n, { bounds: [C.x - RX * 1.4, C.x + RX * 1.4, C.z - RZ * 1.4, C.z + RZ * 1.4], ok: shallow, gap: 1.8, cx: kelpFrom.x, cz: kelpFrom.z, seed: 23 });
  const LITTER = 16;
  const litterAt = (() => { const rr = Eco.rng(5), out = []; while (out.length < LITTER) { const a = rr() * Math.PI * 2, p = coast(a, 1.0 + rr() * 0.06); if (!inLot(p.x, p.z, 3)) out.push({ x: p.x, z: p.z, rot: rr() * 6 }); } return out; })();
  const crateAt = i => ({ x: crateFrom.x + (i % 4) * 0.7, z: crateFrom.z - 1.5 + Math.floor((i % 8) / 4) * 0.55, y: Math.floor(i / 8) * 0.3 });

  let trees = [], sapling = null;
  function buildPlants(popFrom) {
    stage.clear(plants);
    const c = Eco.counts(planted);
    const ts = treeAt(c.tree + 1), ks = kelpAt(c.kelp + 1);
    trees = [];
    let ti = 0, ki = 0, bi = 0;
    const popped = [];
    planted.forEach((p, i) => {
      let m;
      if (p.kind === 'kelp') { const s = ks[ki++]; m = kelp({ size: KELP_SCALE * s.size, v: s.v }); m.position.set(s.x, -2.4, s.z); m.rotation.y = s.rot; }
      else if (p.kind === 'bottles') { const s = crateAt(bi++); m = crate({ size: 1.4 }); m.position.set(s.x, s.y - 0.1, s.z); }
      else { const s = ts[ti++]; m = tree({ size: TREE_SCALE * s.size, wilted, v: s.v }); m.position.set(s.x, 0, s.z); m.rotation.y = s.rot; trees.push(m); }
      if (p.test) m.traverse(x => { if (x.isMesh) { x.material = x.material.clone(); x.material.transparent = true; x.material.opacity = 0.55; } });
      plants.add(m);
      if (i >= popFrom) popped.push(m);
    });
    // what is left of the litter: each ten bottles collected takes one piece off the beach
    for (let i = c.bottles; i < LITTER; i++) { const s = litterAt[i], b = bottle(true); b.scale.setScalar(2.2); b.position.set(s.x, -0.04, s.z); b.rotation.y = s.rot; plants.add(shadows(b)); }
    // the sapling growing toward the next order
    sapling = null;
    if (next && next.kind === 'tree') { const s = ts[c.tree]; sapling = tree({ size: TREE_SCALE * (0.12 + 0.5 * next.frac), wilted, v: s.v }); sapling.position.set(s.x, 0, s.z); plants.add(sapling); }
    if (next && next.kind === 'kelp') { const s = ks[c.kelp]; sapling = kelp({ size: KELP_SCALE * (0.3 + 0.6 * next.frac), v: s.v }); sapling.position.set(s.x, -2.4, s.z); plants.add(sapling); }
    if (c.tree >= 10 && !pond) makePond();
    if (c.tree < 10 && pond) { root.remove(pond); pond = null; }
    // new ones spring up one after another, with a little shower of leaves
    popped.forEach((m, k) => setTimeout(() => {
      if (!m.parent) return;
      m.scale.setScalar(m.userData.full);
      stage.pop(m, 900);
      if (!reduced()) stage.burst(m.position.x, Math.max(0.5, m.position.y + 1), m.position.z, 20, m.userData.kind === 'kelp' ? [PALETTE.kelp, 0x9fe0ff] : m.userData.kind === 'bottles' ? [PALETTE.bottle, 0xffffff] : [PALETTE.leaf, 0xf6d743]);
    }, 400 + k * 650));
    popped.forEach(m => { m.userData.full = m.scale.x; if (!reduced()) m.scale.setScalar(0.01); });
    return c;
  }

  // the animals and how each kind gets about
  let crowd = [], sig = '';
  const rr = Math.random;
  const wildPoint = () => { const ts = trees.length ? trees : [{ position: { x: WILD.x, z: WILD.z } }]; const t = ts[Math.floor(rr() * ts.length)].position; for (let i = 0; i < 8; i++) { const x = t.x + (rr() - 0.5) * 8, z = t.z + (rr() - 0.5) * 8; if (landOK(x, z)) return { x, z }; } return { x: t.x + 1.2, z: t.z + 1.2 }; };
  const crownOf = t => ({ x: t.position.x + (rr() - 0.5) * 0.6, y: t.scale.x * (t.userData.top || 1.05) * 0.95, z: t.position.z + (rr() - 0.5) * 0.6 });
  function place(a) {
    const u = a.userData, h = u.home;
    if (h === 'land') { const p = wildPoint(); a.position.set(p.x, 0, p.z); u.to = wildPoint(); u.speed = { rabbit: 1.6, fox: 1.8, deer: 1.4, boar: 1.2, bear: 0.9, snail: 0.08, ladybird: 0.15, hedgehog: 0.4, peacock: 0.5 }[u.kind] || 0.8; }
    else if (h === 'tree') { const t = trees[Math.floor(rr() * trees.length)]; const c = t ? crownOf(t) : { x: WILD.x, y: 3, z: WILD.z }; a.position.set(c.x, c.y, c.z); u.wait = 3 + rr() * 8; }
    else if (h === 'air') { const p = wildPoint(); u.anchor = { x: p.x, z: p.z, y: 1.2 + rr() * 2.2, r: 1 + rr() * 2.5, w: (u.kind === 'bee' ? 1.4 : 0.7) * (rr() < 0.5 ? -1 : 1) }; }
    else if (h === 'sky') u.anchor = { x: C.x - RX * 0.7 + rr() * 10, z: C.z + (rr() - 0.5) * RZ, y: 7 + rr() * 3, r: 6 + rr() * 6, w: 0.25 * (rr() < 0.5 ? -1 : 1) };
    else if (h === 'pond' || h === 'pond-air') { const ang = rr() * Math.PI * 2; u.ang = ang; a.position.set(POND.x + Math.cos(ang) * (POND.r + 0.3), h === 'pond' ? 0.04 : 1.2, POND.z + Math.sin(ang) * (POND.r + 0.3)); u.wait = 2 + rr() * 6; }
    else if (h === 'sea' || h === 'deep') { u.ang = rr() * Math.PI * 2; u.s = h === 'deep' ? 1.75 : 1.17 + rr() * 0.13; u.w = (h === 'deep' ? 0.006 : 0.02 + rr() * 0.03) * (rr() < 0.5 ? -1 : 1); }
    else if (h === 'shore') { u.ang = Math.PI * (0.6 + rr() * 0.8); u.w = 0; u.wait = rr() * 4; const p = coast(u.ang, 1.03); a.position.set(p.x, -0.1, p.z); }
  }
  function buildFauna(c) {
    const rs = Eco.residents(c, { wilted }), key = JSON.stringify(rs.map(x => [x.id, x.n, x.hiding]));
    if (key === sig) return;
    sig = key;
    stage.clear(fauna); crowd = [];
    rs.forEach(rsd => {
      if (rsd.hiding) return;
      if ((rsd.home === 'tree') && !trees.length) return;
      if ((rsd.home === 'pond' || rsd.home === 'pond-air') && !pond) return;
      for (let i = 0; i < rsd.n; i++) {
        const a = animalModel(rsd.id);
        a.userData.home = rsd.home;
        place(a);
        fauna.add(a); crowd.push(a);
      }
    });
  }
  const turnTo = (a, dx, dz, k = 0.15) => { if (Math.abs(dx) + Math.abs(dz) < 1e-6) return; const want = Math.atan2(dx, dz); let d = want - a.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); a.rotation.y += d * k; };
  function frame(dt, t) {
    plants.children.forEach(m => animate(m, t));
    crowd.forEach(a => {
      const u = a.userData, h = u.home;
      animate(a, t);
      if (h === 'land') {
        if (u.rest > 0) { u.rest -= dt; return; }
        const dx = u.to.x - a.position.x, dz = u.to.z - a.position.z, d = Math.hypot(dx, dz);
        if (d < 0.3) { u.to = wildPoint(); u.rest = 1 + rr() * 4; return; }
        const step = Math.min(d, u.speed * dt);
        a.position.x += dx / d * step; a.position.z += dz / d * step;
        turnTo(a, dx, dz);
        a.position.y = u.kind === 'rabbit' ? Math.abs(Math.sin(t * 9 + u.phase)) * 0.18 : 0;
      } else if (h === 'tree') {
        u.wait -= dt;
        if (u.hop) {
          u.hop.k = Math.min(1, u.hop.k + dt / u.hop.ms);
          const k = u.hop.k, f = u.hop.from, e = u.hop.to;
          a.position.set(f.x + (e.x - f.x) * k, f.y + (e.y - f.y) * k + Math.sin(k * Math.PI) * 2, f.z + (e.z - f.z) * k);
          turnTo(a, e.x - f.x, e.z - f.z, 0.3);
          if (k >= 1) { u.hop = null; u.wait = 4 + rr() * 10; }
        } else if (u.wait <= 0 && trees.length) {
          const tt = trees[Math.floor(rr() * trees.length)];
          u.hop = { from: a.position.clone(), to: crownOf(tt), k: 0, ms: 1.2 + rr() };
        } else a.rotation.y += Math.sin(t + u.phase) * 0.005;
      } else if (h === 'air' || h === 'sky') {
        const q = u.anchor, ang = t * q.w + u.phase;
        const x = q.x + Math.cos(ang) * q.r + Math.sin(t * 2.3 + u.phase) * 0.3, z = q.z + Math.sin(ang) * q.r, y = q.y + Math.sin(t * 1.7 + u.phase) * 0.4;
        turnTo(a, x - a.position.x, z - a.position.z, 0.4);
        a.position.set(x, y, z);
        if (rr() < dt * 0.05 && h === 'air') { const p = wildPoint(); q.x = p.x; q.z = p.z; }
      } else if (h === 'pond-air') {
        const ang = t * (u.kind === 'kingfisher' ? 0.6 : 1.3) + u.phase;
        const x = POND.x + Math.cos(ang) * (POND.r * 0.7), z = POND.z + Math.sin(ang * 1.3) * (POND.r * 0.7);
        turnTo(a, x - a.position.x, z - a.position.z, 0.4);
        a.position.set(x, 0.7 + Math.abs(Math.sin(t * 0.9 + u.phase)) * 1.2, z);
      } else if (h === 'pond') {
        u.wait -= dt;
        if (u.wait <= 0) { u.ang += (rr() - 0.5) * 1.2; u.wait = 3 + rr() * 6; }
        const want = { x: POND.x + Math.cos(u.ang) * (POND.r + 0.3), z: POND.z + Math.sin(u.ang) * (POND.r + 0.3) };
        const dx = want.x - a.position.x, dz = want.z - a.position.z, d = Math.hypot(dx, dz);
        if (d > 0.05) { const s = Math.min(d, (u.kind === 'heron' ? 0.3 : 1.2) * dt); a.position.x += dx / d * s; a.position.z += dz / d * s; turnTo(a, dx, dz); a.position.y = u.kind === 'frog' ? Math.abs(Math.sin(t * 8)) * 0.15 : 0; }
        else { a.position.y = 0.02; turnTo(a, POND.x - a.position.x, POND.z - a.position.z, 0.05); }
      } else if (h === 'sea' || h === 'deep') {
        u.ang += u.w * dt;
        const p = coast(u.ang, u.s);
        turnTo(a, p.x - a.position.x, p.z - a.position.z, 0.3);
        let y = { fish: SEA_Y - 0.15, jellyfish: SEA_Y - 0.05, otter: SEA_Y + 0.02, turtle: SEA_Y - 0.08, dolphin: SEA_Y - 0.25, whale: SEA_Y - 0.6 }[u.kind] ?? SEA_Y;
        if (u.kind === 'dolphin') { const j = (t * 0.35 + u.phase) % 4; if (j < 1) { y = SEA_Y - 0.25 + Math.sin(j * Math.PI) * 1.6; a.rotation.x = -Math.cos(j * Math.PI) * 0.7; } else a.rotation.x = 0; }
        if (u.kind === 'whale') y += Math.max(0, Math.sin(t * 0.2 + u.phase)) * 0.8;
        if (u.kind === 'otter') a.rotation.z = Math.sin(t + u.phase) * 0.2;
        a.position.set(p.x, y + (u.kind === 'jellyfish' ? Math.sin(t * 1.5 + u.phase) * 0.12 : 0), p.z);
      } else if (h === 'shore') {
        if (u.kind === 'starfish' || u.kind === 'pelican') return;
        u.wait -= dt;
        if (u.wait <= 0) { u.w = (rr() - 0.5) * 0.02; u.wait = 2 + rr() * 5; }
        u.ang += u.w * dt;
        const p = coast(u.ang, 1.03);
        a.position.set(p.x, -0.06, p.z);
        a.rotation.y = Math.atan2(p.x - C.x, p.z - C.z) + Math.PI / 2; // crabs go sideways along the shore
      }
    });
  }

  function update(nextPlanted, o2 = {}) {
    if (o2.wilted !== undefined) wilted = !!o2.wilted;
    if (o2.next !== undefined) next = o2.next;
    lawn.material = mat(wilted ? PALETTE.grassDry : PALETTE.grass);
    const was = planted.length;
    planted = nextPlanted || planted;
    const c = buildPlants(o2.seen ?? Math.min(was, seen));
    seen = planted.length;
    buildFauna(c);
  }
  const c0 = buildPlants(seen);
  seen = planted.length;
  buildFauna(c0);

  const focus = Object.assign({}, HOME);
  return { group: root, update, frame, lot: Object.assign({}, LOT), focus, residents: () => Eco.residents(Eco.counts(planted), { wilted }) };
}

/* A Stage with the island alone (the garden card and the island page). Returns { el, island, stage, dispose }. */
export function mountIsland(host, o = {}) {
  // a young island is seen close up; the view draws back as the wood spreads
  const trees = Eco.counts(o.planted).tree;
  const stage = Stage({ light: 'evening', home: Object.assign({}, HOME, { dist: Math.max(28, Math.min(HOME.dist, 26 + trees * 0.6)) }, o.home) });
  // golden hour: warmer and brighter than the club's night
  stage.scene.background = new THREE.Color(0xf3d6b4);
  stage.scene.fog = new THREE.Fog(0xf3d6b4, 70, 140);
  stage.hemi.color.set(0xfff0dc); stage.hemi.groundColor.set(0x52603a); stage.hemi.intensity = 1.8;
  stage.sun.color.set(0xffd9a8); stage.sun.intensity = 1.9;
  const island = Island(stage, o);
  stage.onFrame(island.frame);
  host.append(stage.el);
  return { el: stage.el, island, stage, dispose: () => stage.dispose() };
}

export default { PALETTE, plantModel, animalModel, animate, Island, mountIsland };
