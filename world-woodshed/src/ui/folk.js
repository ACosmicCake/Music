/* World Woodshed — the island's animals as the club's guests and band: storybook animal folk, drawn in code
   (original designs). Each is a Sim from src/ui/people.js (the same jointed rig, clothes and poses) with fur
   for skin and its own head: ears, a snout or a beak, antlers, a shell, wings or a tail, for every animal in
   ANIMALS (src/ecosystem.js). So the animals the trees, kelp and bottles bring to the island are the ones who
   come to hear the band.

   Folk(id, seed, o) → a THREE.Group like Sim's (o as Sim's: shirt, pants…). FOLK lists every look; pickGuest
   chooses who comes, from the island's residents. Part of the club3d chunk. */
import { THREE, mat } from './lowpoly.js';
import { Sim } from './people.js';

const smooth = c => mat(c, { flatShading: false });
const ball = (r, c, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), smooth(c)); m.position.set(x, y, z); m.scale.set(sx, sy, sz); return m; };
const cone = (r, h, c, x, y, z, rx = 0, rz = 0, seg = 8) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat(c)); m.position.set(x, y, z); m.rotation.set(rx, 0, rz); return m; };
const cyl = (r, h, c, x, y, z, rx = 0, rz = 0) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 8), smooth(c)); m.position.set(x, y, z); m.rotation.set(rx, 0, rz); return m; };
const pair = (make) => [make(1), make(-1)];

/* parts, in the head's frame (radius 0.125, front +z) or the body's */
const P = {
  earsLong: (c, inner = 0xf3b6c2) => pair(s => { const g = new THREE.Group(); g.add(ball(0.035, c, 0, 0.1, 0, 1, 2.6, 0.6), ball(0.022, inner, 0, 0.1, 0.012, 1, 2.2, 0.4)); g.position.set(s * 0.05, 0.1, -0.02); g.rotation.z = -s * 0.15; return g; }),
  earsPoint: (c, inner = 0xf4f1ea) => pair(s => { const g = new THREE.Group(); g.add(cone(0.045, 0.1, c, 0, 0, 0, 0, 0, 4), cone(0.028, 0.06, inner, 0, -0.01, 0.012, 0, 0, 4)); g.position.set(s * 0.075, 0.12, -0.01); g.rotation.z = -s * 0.3; return g; }),
  earsRound: (c, r = 0.04) => pair(s => ball(r, c, s * 0.09, 0.1, -0.01, 1, 1, 0.5)),
  earsSide: (c) => pair(s => ball(0.035, c, s * 0.13, 0.04, -0.01, 1.8, 0.7, 0.6)),
  snout: (c, nose = 0x2b1d14, len = 0.07, r = 0.05) => [ball(r, c, 0, -0.03, 0.11 + len * 0.4, 1, 0.8, len / r), ball(0.018, nose, 0, -0.01, 0.11 + len * 1.1)],
  muzzle: (c, nose = 0x2b1d14) => [ball(0.06, c, 0, -0.04, 0.1, 1.1, 0.75, 0.7), ball(0.02, nose, 0, -0.015, 0.155, 1.3, 0.9, 1)],
  piggy: (c) => [cyl(0.035, 0.05, c, 0, -0.03, 0.135, Math.PI / 2), ball(0.008, 0x3b2b1e, 0.013, -0.03, 0.161), ball(0.008, 0x3b2b1e, -0.013, -0.03, 0.161)],
  beak: (c, len = 0.08, r = 0.03, down = 0.25) => [cone(r, len, c, 0, -0.025, 0.12 + len / 2, Math.PI / 2 + down, 0)],
  whiskers: () => pair(s => { const g = new THREE.Group(); for (let i = 0; i < 2; i++) { const w = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.004, 0.004), mat(0x2b2238)); w.position.set(s * 0.07, -0.035 - i * 0.012, 0.13); w.rotation.z = s * (0.15 - i * 0.25); g.add(w); } return g; }),
  antennae: (c = 0x2b2238) => pair(s => { const g = new THREE.Group(); const st = cyl(0.006, 0.14, c, 0, 0.07, 0); g.add(st, ball(0.018, c, 0, 0.14, 0)); g.position.set(s * 0.05, 0.1, 0.03); g.rotation.set(0.3, 0, -s * 0.35); return g; }),
  stalks: (c) => pair(s => { const g = new THREE.Group(); g.add(cyl(0.012, 0.12, c, 0, 0.06, 0), ball(0.028, 0xf4f1ea, 0, 0.13, 0), ball(0.014, 0x221a1e, 0, 0.13, 0.022)); g.position.set(s * 0.045, 0.08, 0.04); g.rotation.z = -s * 0.25; return g; }),
  antlers: (c = 0xd9c3a0) => pair(s => { const g = new THREE.Group(); g.add(cyl(0.01, 0.14, c, 0, 0.07, 0), cyl(0.008, 0.07, c, s * 0.03, 0.09, 0, 0, -s * 0.9), cyl(0.008, 0.06, c, -s * 0.01, 0.13, 0, 0, s * 0.6)); g.position.set(s * 0.06, 0.1, -0.02); g.rotation.z = -s * 0.35; return g; }),
  crest: (c, n = 3) => { const g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(ball(0.025, c, 0, 0.12 + i * 0.012, 0.02 - i * 0.035, 0.5, 1.6, 0.6)); return [g]; },
  tufts: (c) => pair(s => cone(0.03, 0.08, c, s * 0.08, 0.13, 0, 0, -s * 0.35, 4)),
  bigEyes: (c = 0xf4f1ea) => pair(s => ball(0.045, c, s * 0.05, 0.015, 0.09, 1, 1, 0.5)),
  facePatch: (c) => [ball(0.1, c, 0, -0.01, 0.045, 1, 1, 0.75)],
  tusks: () => pair(s => cone(0.009, 0.04, 0xf4f1ea, s * 0.03, -0.04, 0.14, 0, s * 0.3)),
  tusklessStar: (c) => { const g = new THREE.Group(); for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; const arm = cone(0.04, 0.1, c, Math.sin(a) * 0.13, Math.cos(a) * 0.13 + 0.01, -0.01, 0, -a, 5); g.add(arm); } return [g]; },
  fins: (c) => pair(s => { const f = cone(0.04, 0.09, c, s * 0.13, 0, -0.02, 0, -s * Math.PI / 2, 3); f.scale.z = 0.3; return f; }),
  topFin: (c) => [(() => { const f = cone(0.05, 0.11, c, 0, 0.14, -0.03, -0.3, 0, 3); f.scale.x = 0.3; return f; })()],
  bell: (c) => [(() => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(c, { flatShading: false, transparent: true, opacity: 0.8 })); d.position.y = 0.0; return d; })()],
  /* on the back (spine frame: torso centred at y 0.24, back at z ≈ -0.11) */
  shell: (c, c2) => { const sh = ball(0.2, c, 0, 0.26, -0.13, 1, 1.05, 0.65); const g = new THREE.Group(); g.add(sh); if (c2) for (let i = 0; i < 5; i++) g.add(ball(0.035, c2, Math.cos(i * 1.26) * 0.09, 0.27 + Math.sin(i * 1.26) * 0.09, -0.24, 1, 1, 0.3)); return g; },
  spiral: (c) => { const g = new THREE.Group(); g.add(ball(0.17, c, 0, 0.3, -0.17, 0.7, 1, 1)); g.add(ball(0.09, 0xd9a066, 0.07, 0.3, -0.18, 0.5, 0.8, 0.8)); return g; },
  wings: (c, big = 1, n = 1) => { const g = new THREE.Group(); for (let k = 0; k < n; k++) [1, -1].forEach(s => { const w = ball(0.11 * big, c, s * 0.13 * big, 0.3 - k * 0.12, -0.15, 1.6, k ? 0.6 : 1, 0.15); w.rotation.z = s * (0.5 - k * 0.6); w.material = mat(c, { flatShading: false, transparent: n > 1 || big < 1, opacity: 0.75 }); g.add(w); }); return g; },
  spines: (c) => { const g = new THREE.Group(); for (let i = 0; i < 14; i++) { const a = (i % 7) / 6 - 0.5, y = 0.12 + Math.floor(i / 7) * 0.18; g.add(cone(0.035, 0.12, c, a * 0.3, y + 0.05, -0.13, -2.2, a * 1.2, 5)); } return g; },
  fan: (c, eye = 0x2a9d8f) => { const g = new THREE.Group(); for (let i = 0; i < 9; i++) { const a = (i / 8 - 0.5) * 2.4; const f = ball(0.06, c, Math.sin(a) * 0.3, 0.3 + Math.cos(a) * 0.3, -0.2, 0.5, 1.6, 0.15); f.rotation.z = -a; g.add(f, ball(0.022, eye, Math.sin(a) * 0.45, 0.3 + Math.cos(a) * 0.45, -0.19, 1, 1, 0.3)); } return g; },
  dorsal: (c) => { const f = cone(0.07, 0.18, c, 0, 0.35, -0.14, -0.6, 0, 3); f.scale.x = 0.3; return f; },
  claws: (c) => [1, -1].map(s => ({ side: s, mesh: ball(0.05, c, 0, -0.02, 0.03, 1.2, 0.7, 0.8) })),
  /* from the hips (tail) */
  tail: (c, tip, len = 0.32, r = 0.07) => { const g = new THREE.Group(); g.add(ball(r, c, 0, 0.05, -len * 0.5, 0.9, 1, len / r * 0.55)); if (tip) g.add(ball(r * 0.75, tip, 0, 0.08, -len * 0.95, 0.9, 0.9, 1)); g.position.set(0, -0.05, -0.1); g.rotation.x = -0.5; return g; },
  puff: (c) => ball(0.05, c, 0, -0.02, -0.15),
  curl: (c) => { const t = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 6, 12, Math.PI * 1.6), mat(c)); t.position.set(0, 0, -0.15); t.rotation.y = Math.PI / 2; return t; },
  bushy: (c) => { const g = new THREE.Group(); g.add(ball(0.09, c, 0, 0.15, -0.12, 0.9, 2.6, 0.9)); g.position.set(0, -0.08, -0.1); g.rotation.x = -0.25; return g; },
  flukes: (c) => { const g = new THREE.Group(); g.add(ball(0.05, c, 0, -0.05, -0.2, 1, 1, 2.2), ball(0.05, c, 0.07, -0.05, -0.38, 1.6, 0.3, 0.8), ball(0.05, c, -0.07, -0.05, -0.38, 1.6, 0.3, 0.8)); return g; },
  tendrils: (c) => { const g = new THREE.Group(); for (let i = 0; i < 6; i++) { const a = i * 1.05; g.add(cyl(0.01, 0.3, c, Math.cos(a) * 0.1, -0.15, Math.sin(a) * 0.08)); } return g; }
};

/* every animal on the island as folk: fur (skin), extras for the head, the back and the hips, and how big */
export const FOLK = {
  snail: { fur: 0xb8c48a, head: () => [...P.stalks(0xb8c48a)], back: () => P.spiral(0xc98a4b), scale: 0.8 },
  butterfly: { fur: 0x2b2238, head: () => P.antennae(), back: () => P.wings(0xf4a261, 1.3, 2), scale: 0.8 },
  ladybird: { fur: 0x2b2238, head: () => P.antennae(), back: () => P.shell(0xd63c3c, 0x1f1b24), scale: 0.75 },
  bee: { fur: 0xf2c94c, head: () => P.antennae(), back: () => P.wings(0xdcefff, 0.8, 1), hips: () => ball(0.1, 0x2b2238, 0, -0.02, -0.08, 1, 0.6, 1), scale: 0.75 },
  songbird: { fur: 0x9c6b4e, head: () => [...P.beak(0xf2b134, 0.06, 0.025), ...P.crest(0x9c6b4e, 2)], back: () => P.wings(0x7a523a, 0.9), scale: 0.8 },
  rabbit: { fur: 0xd8c3a5, head: () => [...P.earsLong(0xd8c3a5), ball(0.016, 0xef8fa0, 0, -0.015, 0.125)], hips: () => P.puff(0xf4f1ea), scale: 0.9 },
  squirrel: { fur: 0xc06a3a, head: () => [...P.tufts(0xc06a3a), ...P.snout(0xe9c8a8, 0x2b1d14, 0.04, 0.04)], hips: () => P.bushy(0xc06a3a), scale: 0.85 },
  frog: { fur: 0x6fae4f, head: () => [...P.bigEyes(0x6fae4f)], eyesUp: true, scale: 0.9 },
  dragonfly: { fur: 0x3d85c6, head: () => [...P.bigEyes(0x7fb7d9)], back: () => P.wings(0xdcefff, 1.1, 2), scale: 0.8 },
  hedgehog: { fur: 0xc9a27a, head: () => [...P.snout(0xe6c9a8, 0x2b1d14, 0.07, 0.04), ...P.earsRound(0xc9a27a, 0.025)], back: () => P.spines(0x6b4a2e), scale: 0.8 },
  kingfisher: { fur: 0x2a9d8f, head: () => [...P.beak(0x2b2238, 0.11, 0.022, 0.1)], back: () => P.wings(0x1f6f9a, 0.9), scale: 0.8 },
  heron: { fur: 0xb8c2c8, head: () => [...P.beak(0xe9c46a, 0.16, 0.022, 0.05), ...P.crest(0x2b2238, 2)], back: () => P.wings(0x8a979e, 1), scale: 1.1 },
  fox: { fur: 0xd9733a, head: () => [...P.earsPoint(0xd9733a), ...P.snout(0xf4f1ea, 0x2b1d14, 0.08, 0.05)], hips: () => P.tail(0xd9733a, 0xf4f1ea), scale: 1 },
  peacock: { fur: 0x2a6fb0, head: () => [...P.beak(0xd9c3a0, 0.05, 0.02), ...P.crest(0x2a9d8f, 3)], back: () => P.fan(0x2f8f6a), scale: 1 },
  macaque: { fur: 0x9a8a78, head: () => [...P.facePatch(0xe8a7a0), ...P.earsRound(0xe8a7a0, 0.03)], hips: () => P.tail(0x9a8a78, null, 0.2, 0.03), scale: 0.9 },
  deer: { fur: 0xc08a5a, head: () => [...P.earsSide(0xc08a5a), ...P.antlers(), ...P.snout(0xc08a5a, 0x2b1d14, 0.06, 0.045)], hips: () => P.puff(0xf4f1ea), scale: 1.05 },
  owl: { fur: 0x9c7a5a, head: () => [...P.tufts(0x7a5a3a), ...P.bigEyes(0xf2cc8f), ...P.beak(0xe9c46a, 0.04, 0.02, 0.6)], back: () => P.wings(0x7a5a3a, 1), scale: 0.9 },
  boar: { fur: 0x6b4a32, head: () => [...P.earsPoint(0x6b4a32, 0x8a6a52), ...P.piggy(0xc89a8a), ...P.tusks()], hips: () => P.curl(0x6b4a32), scale: 1.05 },
  bear: { fur: 0x7a5233, head: () => [...P.earsRound(0x7a5233), ...P.muzzle(0xc8a27a)], hips: () => P.puff(0x7a5233), scale: 1.18 },
  fish: { fur: 0xf4a261, head: () => [...P.fins(0xe07a5f), ...P.topFin(0xe07a5f)], scale: 0.8 },
  jellyfish: { fur: 0xc9b6e4, head: () => [...P.bell(0xc77dff)], hips: () => P.tendrils(0xc77dff), scale: 0.85 },
  otter: { fur: 0x7a5a3e, head: () => [...P.earsRound(0x7a5a3e, 0.025), ...P.muzzle(0xe6d2b5), ...P.whiskers()], hips: () => P.tail(0x7a5a3e, null, 0.3, 0.05), scale: 0.95 },
  starfish: { fur: 0xef8f6a, head: () => [...P.tusklessStar(0xef8f6a)], scale: 0.8 },
  crab: { fur: 0xd9573c, head: () => [...P.stalks(0xd9573c)], hands: 'claws', scale: 0.8 },
  seabird: { fur: 0xf4f1ea, head: () => [...P.beak(0xf2b134, 0.08, 0.022, 0.2)], back: () => P.wings(0x9aa5ab, 1.1), scale: 0.9 },
  pelican: { fur: 0xf4f1ea, head: () => [...P.beak(0xf2b134, 0.18, 0.03, 0.3), ball(0.04, 0xf2cc8f, 0, -0.08, 0.18, 0.8, 0.8, 1.8)], back: () => P.wings(0xd9d9d0, 1.1), scale: 1.05 },
  turtle: { fur: 0x8fae6a, head: () => [...P.muzzle(0x8fae6a, 0x3d5a40)], back: () => P.shell(0x5a7a3a, 0x8a6a3a), scale: 0.95 },
  dolphin: { fur: 0x8aa6bf, head: () => [...P.snout(0xb9cad8, 0x8aa6bf, 0.09, 0.04)], back: () => P.dorsal(0x6f8aa3), hips: () => P.flukes(0x8aa6bf), scale: 1.05 },
  whale: { fur: 0x3d5a80, head: () => [ball(0.13, 0xb9cad8, 0, -0.05, 0.03, 1, 0.6, 1)], hips: () => P.flukes(0x3d5a80), scale: 1.3 }
};
export const FOLK_IDS = Object.keys(FOLK);

/* an island animal as folk, dressed by its seed */
export function Folk(id, seed, o = {}) {
  const f = FOLK[id] || FOLK.rabbit;
  const p = Sim(seed, Object.assign({ skin: f.fur, animal: id }, o));
  const u = p.userData, j = u.j;
  u.animal = id;
  (f.head ? f.head() : []).forEach(m => j.neck.add(m));
  if (f.back) j.spine.add(f.back());
  if (f.hips) j.hips.add(f.hips());
  if (f.eyesUp) u.eyes.forEach(e => { e.position.y += 0.07; });
  if (f.hands === 'claws') [j.elbowL, j.elbowR].forEach(el => { const c = ball(0.055, f.fur, 0, -0.27, 0.02, 1.3, 0.7, 0.9); el.add(c); });
  p.scale.multiplyScalar(f.scale || 1);
  p.traverse(m => { if (m.isMesh) { m.castShadow = true; } });
  return p;
}

export { pickGuest, FIRST } from '../folklook.js';
