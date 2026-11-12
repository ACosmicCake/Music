/* World Woodshed — the Club's furniture, plants and decor in 3D (src/club.js CATALOG), drawn in code from the
   shared kit in src/ui/lowpoly.js: original art. Each model is centred on its footprint (w × d cells of
   CELL m, width along x, depth along z), faces −z (the street side) and stands on y 0. userData.seats lists
   where a guest sits ({ x, z, face } in the model's own frame); meshes with userData.twinkle, fire or sway
   are animated by src/ui/club3d.js. Part of the club3d chunk. */
import { THREE, mat, glow, box, cyl, ball, group, at, shadows, potPlant, HUES } from './lowpoly.js';

const WOOD = 0x8a5a3a, DARK = 0x3b2b1e, CREAM = 0xf4ead5;

/* ---------- pieces shared with the room builder ---------- */
export function chairModel(color = WOOD) {
  return group(box(0.38, 0.05, 0.38, color, 0, 0.42, 0), box(0.38, 0.45, 0.05, color, 0, 0.45, 0.17),
    box(0.04, 0.42, 0.04, DARK, 0.15, 0, -0.15), box(0.04, 0.42, 0.04, DARK, -0.15, 0, -0.15), box(0.04, 0.42, 0.04, DARK, 0.15, 0, 0.15), box(0.04, 0.42, 0.04, DARK, -0.15, 0, 0.15));
}
/* a round table with chairs around it at rad */
export function table(chairs = 4, color = 0x6b4a2e, rad = 0.72, top = 0.45, chair = WOOD) {
  const g = group(cyl(top, top, 0.05, color, 0, 0.7, 0, 18), cyl(0.05, 0.08, 0.7, DARK), cyl(0.22, 0.22, 0.03, DARK, 0, 0, 0, 10));
  const seats = [];
  for (let i = 0; i < chairs; i++) {
    const a = (i / chairs) * Math.PI * 2 + (chairs === 2 ? Math.PI / 2 : Math.PI / 4), cx = Math.cos(a) * rad, cz = Math.sin(a) * rad;
    const face = Math.atan2(-cx, -cz);
    g.add(at(chairModel(chair), cx, cz, face + Math.PI));
    seats.push({ x: cx, z: cz, face });
  }
  g.add(cyl(0.05, 0.05, 0.12, 0xf6d743, 0.1, 0.75, 0.05, 8), ball(0.035, 0xffe9a8, 0.1, 0.9, 0.05, 0, glow(0xffd28a))); // a candle
  g.userData.seats = seats;
  return g;
}
export function tree(s = 1, leaf = 0x3f8f45, leaf2 = 0x2e6b33) {
  const g = group(cyl(0.12, 0.18, 1.4, 0x6d4c33), ball(0.9, leaf, 0, 2.0, 0, 1), ball(0.6, leaf2, 0.55, 1.7, 0.2, 1), ball(0.6, leaf, -0.5, 1.8, -0.2, 1));
  g.scale.setScalar(s);
  return g;
}
export function counter(w = 3, color = 0x5a3d26) { return group(box(w, 1.0, 0.6, color), box(w + 0.1, 0.06, 0.7, 0x2b1d14, 0, 1.0, 0)); }
export function upright() { return group(box(1.3, 1.2, 0.5, 0x1f1b24), box(1.2, 0.05, 0.25, 0xf4f1ea, 0, 0.75, -0.35), box(0.6, 0.45, 0.35, 0x2b1d14, 0, 0, -0.75)); }
export function grand() {
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.3, 20, 1, false, 0, Math.PI), mat(0x111111));
  top.position.y = 0.85; top.rotation.y = Math.PI / 2; top.scale.set(1, 1, 1.5);
  return group(top, box(1.8, 0.3, 0.6, 0x111111, 0, 0.7, 0), box(1.6, 0.04, 0.2, 0xf4f1ea, 0, 0.98, -0.32), cyl(0.05, 0.05, 0.7, 0x111111, 0.7, 0, 0.3), cyl(0.05, 0.05, 0.7, 0x111111, -0.7, 0, 0.3), cyl(0.05, 0.05, 0.7, 0x111111, 0, 0, 1.1));
}
/* the band's instruments, held or stood at */
export function instrument(role) {
  switch (role) {
    case 'guitar': { const b = cyl(0.2, 0.2, 0.08, 0xb5703a, 0, 0, 0, 14); b.rotation.x = Math.PI / 2; const n = box(0.05, 0.05, 0.6, 0x3b2b1e, 0.25, 0, -0.05); n.rotation.y = -0.9; return at(group(b, n), 0.05, -0.2, 0, 0.7); }
    case 'drums': return at(group(cyl(0.3, 0.3, 0.45, 0xc94c4c, 0, 0, 0), cyl(0.18, 0.18, 0.2, 0xc94c4c, 0.35, 0.45, 0.1), cyl(0.18, 0.18, 0.2, 0xc94c4c, -0.35, 0.45, 0.1), cyl(0.25, 0.25, 0.02, 0xe6b422, 0.5, 1.0, 0.2), cyl(0.02, 0.02, 1.0, 0x777777, 0.5, 0, 0.2)), 0, -0.6);
    case 'bass': { const b = group(ball(0.3, 0xb5703a, 0, 0.5, 0, 1), box(0.06, 1.1, 0.06, 0x3b2b1e, 0, 0.7, 0)); b.children[0].scale.set(0.9, 1.4, 0.5); return at(b, 0.3, -0.25, 0); }
    case 'piano': return at(upright(), 0, -0.9, Math.PI);
    case 'vocals': return at(group(cyl(0.02, 0.02, 1.4, 0x888888), ball(0.06, 0x999999, 0, 1.45, 0), cyl(0.15, 0.15, 0.02, 0x555555)), 0, -0.4);
    case 'saxophone': { const s = group(cyl(0.04, 0.09, 0.6, 0xe6b422, 0, 0, 0, 8), ball(0.1, 0xe6b422, 0, 0, 0.05)); s.rotation.x = 0.4; return at(s, 0.05, -0.25, 0, 0.55); }
    case 'congas': return at(group(cyl(0.18, 0.14, 0.75, 0x8a4c24, -0.2), cyl(0.16, 0.12, 0.7, 0xa0662e, 0.2)), 0, -0.5);
    default: return group();
  }
}

/* ---------- the catalogue ---------- */
const seat = (g, list) => { g.userData.seats = list; return g; };
const lit = (m, k) => { m.userData.twinkle = k; return m; };
function leaves(n, color, r, y, spread, seed = 1) {
  const g = group();
  for (let i = 0; i < n; i++) { const a = i * 2.39 + seed, l = ball(r, i % 2 ? color : 0x2e7d32, Math.cos(a) * spread, y + (i % 3) * 0.12, Math.sin(a) * spread); l.scale.set(1, 0.45, 1.4); l.rotation.set(0.5, a, 0); g.add(l); }
  return g;
}
const MODELS = {
  chair: () => seat(chairModel(), [{ x: 0, z: 0, face: Math.PI }]),
  stool: () => seat(group(cyl(0.17, 0.17, 0.07, 0xc94c4c, 0, 0.7, 0, 14), cyl(0.03, 0.03, 0.7, 0x777777), cyl(0.14, 0.14, 0.02, 0x777777, 0, 0.25, 0, 12), cyl(0.15, 0.17, 0.02, 0x555555)), [{ x: 0, z: 0, face: Math.PI }]),
  beanbag: () => { const b = ball(0.42, 0xe07a5f, 0, 0.25, 0, 1); b.scale.set(1, 0.6, 1); const c = ball(0.3, 0xe07a5f, 0, 0.45, 0.22, 1); c.scale.set(1.1, 0.8, 0.6); return seat(group(b, c), [{ x: 0, z: -0.05, face: Math.PI }]); },
  armchair: () => seat(group(box(0.8, 0.4, 0.75, 0x7b4b94, 0, 0.1, 0), box(0.8, 0.55, 0.18, 0x7b4b94, 0, 0.4, 0.3), box(0.15, 0.3, 0.75, 0x6a3d82, -0.38, 0.4, 0), box(0.15, 0.3, 0.75, 0x6a3d82, 0.38, 0.4, 0), box(0.05, 0.1, 0.05, DARK, 0.35, 0, 0.3), box(0.05, 0.1, 0.05, DARK, -0.35, 0, -0.3)), [{ x: 0, z: -0.05, face: Math.PI }]),
  sofa: () => seat(group(box(1.9, 0.38, 0.8, 0x6c9a8b, 0, 0.1, 0), box(1.9, 0.5, 0.2, 0x5b8a7b, 0, 0.45, 0.32), box(0.18, 0.32, 0.8, 0x5b8a7b, -0.92, 0.42, 0), box(0.18, 0.32, 0.8, 0x5b8a7b, 0.92, 0.42, 0),
    box(0.45, 0.35, 0.12, 0xf2cc8f, -0.5, 0.5, 0.18), box(0.45, 0.35, 0.12, 0xef8fa0, 0.5, 0.5, 0.18)), [-0.55, 0, 0.55].map(x => ({ x, z: -0.05, face: Math.PI }))),
  benches: () => seat(group(box(1.8, 0.08, 0.42, WOOD, 0, 0.42, 0), box(1.8, 0.4, 0.06, WOOD, 0, 0.5, 0.2), box(0.08, 0.42, 0.38, DARK, -0.8), box(0.08, 0.42, 0.38, DARK, 0.8)), [{ x: -0.45, z: 0, face: Math.PI }, { x: 0.45, z: 0, face: Math.PI }]),
  hammocks: () => { const hm = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.12, 6, 16, Math.PI), mat(0xe9c46a)); hm.rotation.set(Math.PI, 0, 0); hm.position.y = 1.05; return seat(group(hm, cyl(0.06, 0.06, 1.4, 0x6d4c33, 1.05), cyl(0.06, 0.06, 1.4, 0x6d4c33, -1.05)), [{ x: -0.35, z: 0, face: Math.PI }, { x: 0.35, z: 0, face: Math.PI }]); },
  bistro: () => table(2, 0x6b4a2e, 0.52, 0.32),
  chairs: () => table(4, 0x7a5232, 0.68, 0.45),
  table: () => {
    const g = group(box(3.0, 0.06, 0.9, 0x6b4a2e, 0, 0.72, 0), box(0.1, 0.72, 0.8, DARK, -1.3), box(0.1, 0.72, 0.8, DARK, 1.3),
      box(3.0, 0.06, 0.35, WOOD, 0, 0.42, -0.75), box(3.0, 0.06, 0.35, WOOD, 0, 0.42, 0.75), box(0.08, 0.42, 0.3, DARK, -1.3, 0, -0.75), box(0.08, 0.42, 0.3, DARK, 1.3, 0, -0.75), box(0.08, 0.42, 0.3, DARK, -1.3, 0, 0.75), box(0.08, 0.42, 0.3, DARK, 1.3, 0, 0.75));
    [-0.9, 0, 0.9].forEach(x => g.add(cyl(0.12, 0.1, 0.08, CREAM, x, 0.75, 0, 12)));
    return seat(g, [-1.1, -0.37, 0.37, 1.1].flatMap(x => [{ x, z: -0.75, face: 0 }, { x, z: 0.75, face: Math.PI }]));
  },
  snake: () => { const g = group(cyl(0.16, 0.12, 0.26, 0xd9d2c3)); for (let i = 0; i < 6; i++) { const l = box(0.06, 0.6 + (i % 3) * 0.12, 0.02, i % 2 ? 0x4f7a3a : 0x6b9a4a, Math.cos(i * 2.1) * 0.06, 0.2, Math.sin(i * 2.1) * 0.06); l.rotation.set(Math.sin(i) * 0.2, i * 1.1, Math.cos(i) * 0.2); g.add(l); } return g; },
  cactus: () => group(cyl(0.15, 0.11, 0.22, 0xc0673f), cyl(0.1, 0.11, 0.55, 0x5a9e5a, 0, 0.2, 0, 8), cyl(0.05, 0.05, 0.22, 0x5a9e5a, 0.13, 0.42, 0, 6), ball(0.06, 0xef8fa0, 0, 0.78, 0)),
  monstera: () => potPlant('monstera', 1.3),
  fig: () => group(cyl(0.2, 0.15, 0.3, 0xf4ead5), cyl(0.04, 0.05, 1.1, 0x6d4c33, 0, 0.3, 0), leaves(9, 0x4c8c3a, 0.18, 1.1, 0.18, 2), leaves(6, 0x4c8c3a, 0.16, 0.85, 0.14, 4)),
  ferns: () => group(cyl(0.05, 0.08, 0.7, DARK), cyl(0.2, 0.2, 0.03, DARK, 0, 0.7, 0), at(potPlant('fern', 1.1), 0, 0, 0, 0.72)),
  palm: () => { const g = group(cyl(0.24, 0.18, 0.36, 0xd4a5a5), cyl(0.05, 0.07, 1.1, 0x8a6d4b, 0, 0.3, 0, 8)); for (let i = 0; i < 7; i++) { const l = box(0.14, 0.02, 0.8, 0x5f9e55, 0, 1.4, 0); l.geometry.translate(0, 0, 0.4); l.rotation.set(0.5, (i / 7) * Math.PI * 2, 0); g.add(l); } return g; },
  flowers: () => { const g = group(box(1.9, 0.22, 0.42, 0x8a6d4b), box(1.8, 0.04, 0.34, 0x5d4632, 0, 0.22, 0)); for (let i = 0; i < 10; i++) g.add(cyl(0.01, 0.01, 0.2, 0x4f7a3a, -0.8 + i * 0.18, 0.24, (i % 2 - 0.5) * 0.14, 4), ball(0.07, HUES[(i * 5) % HUES.length], -0.8 + i * 0.18, 0.46, (i % 2 - 0.5) * 0.14)); return g; },
  olive: () => tree(0.9, 0x8aa36a, 0x6b8550),
  lemons: () => potPlant('lemon', 1.5),
  lamp: () => group(cyl(0.14, 0.16, 0.04, DARK), cyl(0.02, 0.02, 1.4, DARK), cyl(0.12, 0.22, 0.28, 0xf2cc8f, 0, 1.3, 0, 10), lit(ball(0.08, 0xffe9a8, 0, 1.36, 0, 0, glow(0xffd28a)), 3)),
  lantern: () => group(cyl(0.04, 0.05, 1.5, DARK), box(0.24, 0.3, 0.24, 0x2b2238, 0, 1.5, 0), lit(box(0.18, 0.22, 0.18, 0xffe9a8, 0, 1.54, 0, glow(0xffc46b)), 5), cyl(0.0, 0.18, 0.1, 0x2b2238, 0, 1.8, 0, 4)),
  firebowl: () => { const f = ball(0.25, 0xf4a261, 0, 0.55, 0, 0, glow(0xf4a261)); f.userData.fire = 1; const f2 = ball(0.15, 0xf6d743, 0.05, 0.7, 0, 0, glow(0xf6d743)); f2.userData.fire = 1; return group(cyl(0.45, 0.25, 0.35, 0x3a3a3a, 0, 0.12, 0, 12), cyl(0.06, 0.12, 0.15, 0x3a3a3a), f, f2); },
  upright: () => at(upright(), 0, 0.15),
  records: () => { const d = cyl(0.17, 0.17, 0.015, 0x111111, -0.08, 0.86, 0, 18); return group(box(0.95, 0.6, 0.42, 0xb5703a, 0, 0, 0), box(0.5, 0.12, 0.38, 0xd9d2c3, -0.08, 0.6, 0), box(0.5, 0.22, 0.06, 0x2b1d14, 0.0, 0.2, -0.2), d, ball(0.03, 0xe07a5f, -0.08, 0.88, 0)); },
  jukebox: () => { const arch = cyl(0.42, 0.42, 0.4, 0xc94c4c, 0, 1.2, 0, 16, undefined); arch.rotation.x = Math.PI / 2; arch.position.y = 1.25; return group(box(0.84, 1.25, 0.42, 0xc94c4c), arch, lit(box(0.6, 0.5, 0.05, 0xffe9a8, 0, 0.6, -0.22, glow(0xf6d743)), 2), lit(box(0.7, 0.06, 0.06, 0x7fb7d9, 0, 1.2, -0.22, glow(0x7fb7d9)), 7)); },
  pa: () => group(box(0.5, 1.0, 0.42, 0x1f1b24, -0.24), box(0.45, 0.9, 0.42, 0x1f1b24, 0.25), cyl(0.15, 0.15, 0.04, 0x555555, -0.24, 0.55, -0.22), cyl(0.13, 0.13, 0.04, 0x555555, 0.25, 0.5, -0.22), box(0.5, 0.5, 0.4, 0x1f1b24, -0.24, 1.0, 0)),
  grand: () => at(grand(), 0, -0.1, Math.PI * 0.85),
  amps: () => group(box(0.45, 0.42, 0.3, 0x1f1b24), box(0.38, 0.3, 0.02, 0x6b5a4a, 0, 0.05, -0.16), box(0.4, 0.06, 0.02, 0xe9c46a, 0, 0.36, -0.16)),
  lending: () => { const sh = group(box(2.4, 1.9, 0.4, DARK), box(2.3, 0.04, 0.36, WOOD, 0, 0.95, -0.02)); for (let i = 0; i < 4; i++) sh.add(at(instrument(i % 2 ? 'guitar' : 'saxophone'), -0.9 + i * 0.6, -0.15, 0, 0.4 + (i % 2) * 0.6)); return sh; },
  tape: () => { const t = group(box(0.9, 1.1, 0.6, 0x3a3a3a), box(0.8, 0.2, 0.4, 0x555555, 0, 1.1, 0)); [-0.22, 0.22].forEach(x => { const r = cyl(0.18, 0.18, 0.04, 0xaaaaaa, x, 0.7, -0.31, 14); r.rotation.x = Math.PI / 2; t.add(r); }); return t; },
  rug: () => { const g = group(box(1.9, 0.02, 1.4, 0x9b4f6f), box(1.6, 0.025, 1.1, 0xf2cc8f), box(1.2, 0.03, 0.7, 0x3d85c6)); g.children.forEach(m => m.castShadow = false); g.userData.flat = true; return g; },
  shelf: () => { const g = group(box(1.4, 1.6, 0.36, WOOD)); for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) g.add(box(0.08 + (i % 3) * 0.03, 0.3 - (i % 2) * 0.06, 0.26, HUES[(i * 7 + r * 3) % HUES.length], -0.55 + i * 0.17, 0.15 + r * 0.5, -0.06)); return g; },
  easel: () => { const g = group(box(0.04, 1.5, 0.04, WOOD, -0.2), box(0.04, 1.5, 0.04, WOOD, 0.2), box(0.04, 1.3, 0.04, WOOD, 0, 0, 0.25), box(0.6, 0.48, 0.04, CREAM, 0, 0.9, -0.03), ball(0.12, 0xf4a261, -0.1, 1.2, -0.06), box(0.4, 0.12, 0.01, 0x7fb7d9, 0, 0.98, -0.06), box(0.5, 0.04, 0.08, WOOD, 0, 0.85, 0)); g.children[0].rotation.z = 0.1; g.children[1].rotation.z = -0.1; return g; },
  chalk: () => group(box(0.9, 1.1, 0.08, 0x26302b, 0, 0.45, 0), box(0.04, 0.45, 0.04, 0x5a3d26, -0.36), box(0.04, 0.45, 0.04, 0x5a3d26, 0.36), box(0.6, 0.03, 0.01, CREAM, 0, 1.25, -0.05), box(0.45, 0.03, 0.01, CREAM, 0, 1.1, -0.05), box(0.5, 0.03, 0.01, 0xf2cc8f, 0, 0.95, -0.05)),
  aquarium: () => { const g = group(box(1.4, 0.6, 0.4, DARK), box(1.36, 0.55, 0.36, 0x7fc8e8, 0, 0.6, 0, { transparent: true, opacity: 0.55 }), box(1.4, 0.05, 0.4, DARK, 0, 1.15, 0)); [[-0.3, 0.85, 0xf4a261], [0.25, 0.75, 0xf6d743], [0.4, 0.95, 0xe07a5f]].forEach(([x, y, c], i) => { const f = ball(0.06, c, x, y, 0); f.scale.set(1.6, 1, 0.6); f.userData.sway = i + 1; g.add(f); }); g.add(cyl(0.02, 0.03, 0.35, 0x4caf50, -0.5, 0.62, 0.05, 5), cyl(0.02, 0.03, 0.28, 0x4caf50, 0.55, 0.62, -0.05, 5)); return g; },
  fountain: () => group(cyl(0.9, 1.0, 0.4, 0x9a9faa, 0, 0, 0, 20), cyl(0.8, 0.8, 0.05, 0x5fa8d3, 0, 0.38, 0, 20), cyl(0.08, 0.1, 1.0, 0x9a9faa), cyl(0.35, 0.3, 0.12, 0x9a9faa, 0, 1.0, 0), cyl(0.03, 0.15, 0.4, 0x9fd8f0, 0, 1.1, 0, 8, { transparent: true, opacity: 0.6 })),
  board: () => group(box(1.4, 1.0, 0.06, 0x26302b, 0, 0.9, 0), box(0.06, 1.9, 0.06, WOOD, -0.68), box(0.06, 1.9, 0.06, WOOD, 0.68), box(0.25, 0.3, 0.01, 0xf2cc8f, -0.4, 1.4, -0.04), box(0.25, 0.3, 0.01, 0x7fb7d9, 0, 1.3, -0.04), box(0.25, 0.3, 0.01, 0xef8fa0, 0.4, 1.45, -0.04)),
  coats: () => group(cyl(0.04, 0.04, 1.8, 0x5a3d26), cyl(0.18, 0.2, 0.04, 0x5a3d26), ball(0.25, 0x8a4c24, 0.15, 1.4, 0), ball(0.25, 0x3d85c6, -0.15, 1.3, 0.05), ball(0.1, 0xe9c46a, 0, 1.8, 0)),
  scope: () => { const s = group(cyl(0.03, 0.03, 1.2, 0x555555), cyl(0.0, 0.25, 0.08, 0x555555, 0, 0, 0, 3), box(0.16, 0.16, 1.1, 0xc9b27c, 0, 1.3, 0)); s.children[2].rotation.x = -0.6; return s; },
  espresso: () => group(box(0.95, 0.85, 0.45, WOOD), box(0.6, 0.45, 0.4, 0xb8c4cc, -0.1, 0.85, 0), cyl(0.05, 0.05, 0.08, 0x111111, -0.1, 0.95, -0.22, 8), cyl(0.06, 0.05, 0.08, CREAM, 0.3, 0.85, -0.05, 10), box(0.62, 0.05, 0.42, 0x2b1d14, -0.1, 1.3, 0)),
  cakes: () => group(box(0.95, 0.9, 0.45, CREAM), box(0.9, 0.35, 0.4, 0xbfe8d8, 0, 0.9, 0, { transparent: true, opacity: 0.4 }), cyl(0.12, 0.12, 0.12, 0xef8fa0, -0.22, 0.92, 0, 12), cyl(0.12, 0.12, 0.14, 0xf2cc8f, 0.2, 0.92, 0, 12), ball(0.03, 0xc94c4c, 0.2, 1.08, 0)),
  oven: () => { const f = ball(0.22, 0xf4a261, 0, 0.35, -0.5, 0, glow(0xf4a261)); f.userData.fire = 1; return group(box(1.3, 1.1, 1.2, 0xa9573c), ball(0.66, 0xa9573c, 0, 1.1, 0, 1), box(0.6, 0.45, 0.1, 0x2b1d14, 0, 0.3, -0.6), cyl(0.1, 0.1, 0.6, 0x7a4030, 0.3, 1.5, 0.2, 8), f); }
};

/* A piece of kind k, centred on its footprint, facing the street side */
export function pieceModel(k) {
  const make = MODELS[k];
  const g = make ? make() : group(box(0.4, 0.4, 0.4, 0xcccccc));
  return shadows(g);
}
export const hasModel = k => !!MODELS[k];
