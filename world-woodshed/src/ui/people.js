/* World Woodshed — the club's people: life-sim characters in the storybook look, drawn in code (original
   designs). Each is a small jointed rig (hips, spine, neck, head, shoulders, elbows, hips, knees) with a face
   that blinks and smiles, one of several hair styles, clothes and builds, and a set of poses blended smoothly
   from one to the next: walk, idle, chat, listen, sit, sit and talk, eat, clap, cheer, wave, four dances and
   playing each instrument in the band.

   Sim(seed, o) → a THREE.Group, feet at y 0, facing +z, about 1.55 m tall (o: shirt, pants, skin, hair,
   style, seated — override the seeded choices). act(p, pose, t, dt, o) moves it a frame toward that pose
   (o.speed for walk, o.seat for the seat's height, o.beat for the band and dancers). Part of the club3d chunk. */
import { THREE, mat, group, rnd, shadows, SKIN, HAIR } from './lowpoly.js';

const smooth = c => mat(c, { flatShading: false });
function capsule(r, len, color, flat = true) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 3, 8), flat ? mat(color) : smooth(color));
  m.geometry.translate(0, -(len / 2 + r * 0.6), 0); // hangs down from its joint
  return m;
}
const sphere = (r, color, x = 0, y = 0, z = 0, s = smooth) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), s(color)); m.position.set(x, y, z); return m; };
const joint = (x = 0, y = 0, z = 0, ...kids) => { const g = new THREE.Group(); g.position.set(x, y, z); kids.forEach(k => k && g.add(k)); return g; };

const CLOTHES = [0xe07a5f, 0x3d85c6, 0x81b29a, 0xf2cc8f, 0xc77dff, 0xe9c46a, 0x6c9a8b, 0xd4a5a5, 0xf4a261, 0x90be6d, 0x7fb7d9, 0xef8fa0, 0xf4f1ea, 0x2b2238, 0x9b4f6f, 0x5b8a7b];
const BOTTOMS = [0x2f3542, 0x3b4a6b, 0x5a4636, 0x1f1b24, 0x6b7b8c, 0x8a6d4b, 0x3d5a40, 0x7a3b4a];
const SHOES = [0x2b1d14, 0x111111, 0xf4f1ea, 0x8a4c24, 0xc94c4c];
const HAIRS = ['short', 'bob', 'bun', 'ponytail', 'curly', 'long', 'buzz', 'afro', 'swept'];

function hairFor(style, color) {
  const h = smooth(color);
  const g = new THREE.Group();
  const cap = (sx = 1, sy = 0.75, sz = 1.05, y = 0.035) => { const c = new THREE.Mesh(new THREE.SphereGeometry(0.135, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), h); c.scale.set(sx, sy, sz); c.position.set(0, y, -0.01); return c; };
  switch (style) {
    case 'buzz': g.add(cap(1.0, 0.65, 1.0, 0.02)); break;
    case 'short': g.add(cap(), (() => { const b = sphere(0.12, color, 0, -0.01, -0.05); b.scale.set(1.05, 0.9, 0.8); return b; })()); break;
    case 'swept': { g.add(cap(1.05, 0.85, 1.1)); const q = sphere(0.07, color, 0.05, 0.11, 0.07); q.scale.set(1.6, 0.6, 1); g.add(q); break; }
    case 'bob': { g.add(cap(1.08, 0.8, 1.1)); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.17, 14, 1, true, Math.PI * 0.75, Math.PI * 1.5), h); b.material.side = THREE.DoubleSide; b.position.set(0, -0.04, -0.01); g.add(b); break; }
    case 'bun': g.add(cap(), sphere(0.06, color, 0, 0.11, -0.09)); break;
    case 'ponytail': { g.add(cap()); const t = capsule(0.04, 0.16, color, false); t.position.set(0, 0.06, -0.13); t.rotation.x = 0.35; g.add(t); break; }
    case 'curly': for (let i = 0; i < 14; i++) { const a = i * 2.4, y = 0.02 + (i % 4) * 0.035; g.add(sphere(0.05, color, Math.cos(a) * 0.11, y, Math.sin(a) * 0.1 - 0.02)); } break;
    case 'afro': { const a = sphere(0.19, color, 0, 0.05, -0.03); a.scale.set(1, 0.9, 0.95); g.add(a); break; }
    case 'long': { g.add(cap(1.06, 0.8, 1.1)); const b = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.3, 0.06), h); b.position.set(0, -0.12, -0.1); g.add(b); break; }
  }
  return g;
}

/* A person. Their look comes from the seed, so the same guest looks the same every night. */
export function Sim(seed, o = {}) {
  const r = rnd(4000 + seed * 7919);
  const pick = a => a[Math.floor(r() * a.length)];
  const skin = o.skin ?? pick(SKIN), hairC = o.hair ?? pick(HAIR), shirt = o.shirt ?? pick(CLOTHES), pants = o.pants ?? pick(BOTTOMS), shoes = pick(SHOES);
  const style = o.style ?? pick(HAIRS), top = pick(['tee', 'tee', 'long', 'jacket', 'dress']), legs = top === 'dress' ? 'skirt' : pick(['pants', 'pants', 'pants', 'shorts', 'skirt']);
  const tall = 0.93 + r() * 0.13, wide = 0.9 + r() * 0.25;

  // legs
  const leg = side => {
    const thigh = capsule(0.062 * wide, 0.28, legs === 'pants' ? pants : legs === 'shorts' ? pants : skin);
    const shin = capsule(0.052, 0.3, legs === 'pants' ? pants : skin);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.19), mat(shoes)); foot.position.set(0, -0.39, 0.045);
    const knee = joint(0, -0.4, 0, shin, foot);
    if (legs === 'shorts') { const cuff = capsule(0.066 * wide, 0.12, pants); thigh.add(cuff); }
    return { hip: joint(side * 0.085 * wide, 0, 0, thigh, knee), knee };
  };
  const L = leg(1), R = leg(-1);
  // torso
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.24, 3, 10), mat(shirt));
  torso.scale.set(1.12 * wide, 1, 0.72); torso.position.y = 0.24;
  const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8), mat(legs === 'pants' || legs === 'shorts' ? pants : top === 'dress' ? shirt : pants));
  pelvis.scale.set(1.1 * wide, 0.7, 0.8);
  const spine = joint(0, 0.02, 0, torso);
  if (top === 'jacket') { const j = new THREE.Mesh(new THREE.CapsuleGeometry(0.155, 0.22, 3, 10), mat(pick(BOTTOMS))); j.scale.set(1.16 * wide, 1, 0.78); j.position.set(0, 0.25, -0.01); spine.add(j); const s = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.02), mat(shirt)); s.position.set(0, 0.26, 0.11); spine.add(s); }
  if (legs === 'skirt') { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * wide, 0.24 * wide, 0.32, 12), mat(top === 'dress' ? shirt : pants)); k.position.y = -0.12; pelvis.add(k); }
  // arms
  const sleeve = top === 'long' || top === 'jacket';
  const arm = side => {
    const upper = capsule(0.045, 0.2, sleeve ? (top === 'jacket' ? torso.material.color.getHex() : shirt) : skin);
    if (!sleeve) { const cap = capsule(0.05, 0.06, shirt); upper.add(cap); }
    const fore = capsule(0.04, 0.18, sleeve ? shirt : skin);
    const hand = sphere(0.045, skin, 0, -0.26, 0.01);
    const elbow = joint(0, -0.27, 0, fore, hand);
    return { sh: joint(side * 0.2 * wide, 0.4, 0, upper, elbow), elbow, hand };
  };
  const AL = arm(1), AR = arm(-1);
  spine.add(AL.sh, AR.sh);
  // head and face
  const head = sphere(0.125, skin);
  head.scale.set(0.95, 1.05, 1);
  const eye = x => { const e = sphere(0.02, 0x221a1e, x, 0.015, 0.112); e.scale.set(1, 1.25, 0.6); const s = sphere(0.006, 0xffffff, x + 0.006, 0.024, 0.122); return [e, s]; };
  const [eL, sL] = eye(0.045), [eR, sR] = eye(-0.045);
  const brow = x => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.01, 0.01), smooth(hairC)); b.position.set(x, 0.058, 0.118); return b; };
  const nose = sphere(0.018, skin, 0, -0.02, 0.125);
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.006, 6, 12, Math.PI), smooth(0x7a2e2e)); mouth.position.set(0, -0.05, 0.116); mouth.rotation.z = Math.PI;
  const cheek = x => { const c = sphere(0.02, 0xef8fa0, x, -0.025, 0.105); c.scale.set(1, 0.6, 0.3); c.material = mat(0xef8fa0, { flatShading: false, transparent: true, opacity: 0.55 }); return c; };
  const ear = x => sphere(0.025, skin, x, 0, 0);
  const headG = joint(0, 0.1, 0, head, eL, sL, eR, sR, brow(0.045), brow(-0.045), nose, mouth, cheek(0.07), cheek(-0.07), ear(0.12), ear(-0.12), hairFor(style, hairC));
  if (r() < 0.15) { const gl = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.005, 6, 14), smooth(0x2b2238)); const g2 = gl.clone(); gl.position.set(0.045, 0.015, 0.125); g2.position.set(-0.045, 0.015, 0.125); headG.add(gl, g2); }
  if (r() < 0.12) { const hat = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), mat(pick(CLOTHES))); hat.position.y = 0.04; hat.scale.set(1.02, 0.8, 1.04); headG.add(hat); }
  const neck = joint(0, 0.48, 0, capsule(0.04, 0.03, skin, false), headG);
  neck.children[0].position.y = 0.06;
  spine.add(neck);
  const hips = joint(0, 0.82, 0, pelvis, spine, L.hip, R.hip);
  // a cup that shows in the hand while eating and drinking
  const cup = new THREE.Group();
  cup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.08, 10), mat(0xf4f1ea)));
  cup.position.set(0, -0.3, 0.04); cup.visible = false;
  AR.elbow.add(cup);
  const root = group(hips);
  root.scale.setScalar(tall);
  root.userData = {
    sim: true, phase: r() * 6.28, blinkAt: 0, dance: Math.floor(r() * 4),
    j: { hips, spine, neck: headG, armL: AL.sh, armR: AR.sh, elbowL: AL.elbow, elbowR: AR.elbow, hipL: L.hip, hipR: R.hip, kneeL: L.knee, kneeR: R.knee },
    eyes: [eL, eR, sL, sR], mouth, cup, pose: 'idle'
  };
  return shadows(root);
}

/* ---------- poses: each gives target rotations (x forward/back, z sideways) for the joints ---------- */
const Z = () => ({ hipsY: 0.82, hipsX: 0, hipsZ: 0, hipsRY: 0, spineX: 0, spineY: 0, spineZ: 0, headX: 0, headY: 0, headZ: 0,
  armLX: 0, armLZ: 0.08, armRX: 0, armRZ: -0.08, elbowLX: -0.15, elbowRX: -0.15, hipLX: 0, hipRX: 0, hipLZ: 0, hipRZ: 0, kneeLX: 0, kneeRX: 0, mouth: 0, cup: 0 });
const SEATED = (p, h = 0.47) => Object.assign(p, { hipsY: h + 0.07, hipLX: -1.45, hipRX: -1.45, kneeLX: 1.45, kneeRX: 1.45, armLX: -0.35, armRX: -0.35, elbowLX: -0.7, elbowRX: -0.7, armLZ: 0.12, armRZ: -0.12 });
const POSES = {
  idle(p, t, ph) { p.spineX = Math.sin(t * 1.3 + ph) * 0.02; p.headY = Math.sin(t * 0.4 + ph) * 0.35; p.hipsZ = Math.sin(t * 0.5 + ph) * 0.02; p.armLZ = 0.1; p.armRZ = -0.1; },
  listen(p, t, ph, o) { const b = (o.beat ?? t * 2) * Math.PI; p.headX = Math.abs(Math.sin(b)) * 0.15 - 0.05; p.hipsZ = Math.sin(b / 2 + ph) * 0.03; p.hipsY -= Math.abs(Math.sin(b)) * 0.015; p.armLX = -0.15; p.armRX = -0.15; p.elbowLX = -0.4; p.elbowRX = -0.4; p.mouth = 0.3; },
  walk(p, t, ph, o) {
    const w = t * 7 * (o.speed || 1) + ph, s = Math.sin(w);
    p.hipLX = -s * 0.5; p.hipRX = s * 0.5;
    p.kneeLX = 0.1 + Math.max(0, Math.cos(w)) * 0.7; p.kneeRX = 0.1 + Math.max(0, -Math.cos(w)) * 0.7;
    p.armLX = s * 0.45; p.armRX = -s * 0.45; p.elbowLX = -0.35; p.elbowRX = -0.35;
    p.hipsY = 0.82 - 0.015 + Math.abs(Math.cos(w)) * 0.03; p.hipsRY = s * 0.08; p.spineY = -s * 0.12; p.spineX = 0.05;
  },
  chat(p, t, ph) {
    const g = Math.sin(t * 2.1 + ph), talking = Math.sin(t * 0.7 + ph) > 0;
    POSES.idle(p, t, ph); p.headY = Math.sin(t * 0.9 + ph) * 0.15;
    if (talking) { p.armRX = -0.5 + g * 0.2; p.elbowRX = -1.3 + Math.sin(t * 3.3 + ph) * 0.3; p.armRZ = -0.3; p.mouth = 0.4 + Math.abs(Math.sin(t * 11 + ph)) * 0.6; p.headX = Math.sin(t * 2.7 + ph) * 0.06; }
    else { p.armLX = -0.25; p.elbowLX = -1.0; p.armRX = -0.25; p.elbowRX = -1.0; p.armLZ = -0.2; p.armRZ = 0.2; p.headX = 0.05 + Math.abs(Math.sin(t * 1.7 + ph)) * 0.08; }
  },
  sit(p, t, ph, o) { SEATED(p, o.seat); p.spineX = Math.sin(t * 1.3 + ph) * 0.02; p.headY = Math.sin(t * 0.35 + ph) * 0.4; },
  sitChat(p, t, ph, o) {
    SEATED(p, o.seat); const talking = Math.sin(t * 0.8 + ph) > 0;
    p.headY = Math.sin(t * 0.6 + ph) * 0.25;
    if (talking) { p.armRX = -0.9; p.elbowRX = -1.2 + Math.sin(t * 3 + ph) * 0.35; p.armRZ = -0.25; p.mouth = 0.4 + Math.abs(Math.sin(t * 10 + ph)) * 0.6; p.spineX = 0.08; }
    else { p.headX = 0.04 + Math.abs(Math.sin(t * 1.5 + ph)) * 0.08; p.spineX = -0.05; p.mouth = 0.2; }
  },
  eat(p, t, ph, o) {
    SEATED(p, o.seat); const k = Math.max(0, Math.sin(t * 1.4 + ph));
    p.armRX = -0.5 - k * 0.6; p.elbowRX = -0.9 - k * 1.3; p.armRZ = -0.15 + k * 0.25; p.headX = 0.15 - k * 0.1; p.spineX = 0.1; p.cup = 1; p.mouth = k * 0.5;
  },
  clap(p, t, ph) {
    POSES.idle(p, t, ph); const c = Math.sin(t * 14 + ph);
    p.armLX = -1.0; p.armRX = -1.0; p.elbowLX = -1.3; p.elbowRX = -1.3; p.armLZ = -0.25 + c * 0.18; p.armRZ = 0.25 - c * 0.18; p.mouth = 0.8; p.headX = -0.1;
  },
  sitClap(p, t, ph, o) { POSES.clap(p, t, ph); SEATED(Object.assign(p, {}), o.seat); const c = Math.sin(t * 14 + ph); p.armLX = -1.0; p.armRX = -1.0; p.elbowLX = -1.3; p.elbowRX = -1.3; p.armLZ = -0.25 + c * 0.18; p.armRZ = 0.25 - c * 0.18; p.mouth = 0.8; },
  cheer(p, t, ph) {
    const b = Math.abs(Math.sin(t * 6 + ph));
    p.armLX = -2.8 + Math.sin(t * 6 + ph) * 0.15; p.armRX = -2.8 - Math.sin(t * 6 + ph) * 0.15; p.armLZ = 0.35; p.armRZ = -0.35; p.elbowLX = -0.2; p.elbowRX = -0.2;
    p.hipsY = 0.82 + b * 0.09; p.kneeLX = 0.3 * (1 - b); p.kneeRX = 0.3 * (1 - b); p.hipLX = -0.15 * (1 - b); p.hipRX = -0.15 * (1 - b); p.headX = -0.25; p.mouth = 1;
  },
  wave(p, t, ph) { POSES.idle(p, t, ph); p.armRX = -0.3; p.armRZ = -2.4; p.elbowRX = -0.2 + Math.sin(t * 10) * 0.35; p.mouth = 0.7; },
  dance(p, t, ph, o) {
    const b = (o.beat ?? t * 2.1) * Math.PI, s = Math.sin(b), c = Math.cos(b), bounce = Math.abs(s);
    p.hipsY = 0.8 - bounce * 0.05; p.kneeLX = 0.15 + bounce * 0.3; p.kneeRX = 0.15 + bounce * 0.3; p.hipLX = -0.1 - bounce * 0.15; p.hipRX = -0.1 - bounce * 0.15; p.mouth = 0.7;
    switch (o.style ?? 0) {
      case 0: // the bounce: arms pumping, hips side to side
        p.hipsZ = Math.sin(b / 2) * 0.08; p.armLX = -0.6 - s * 0.4; p.armRX = -0.6 + s * 0.4; p.elbowLX = -1.6; p.elbowRX = -1.6; p.headZ = Math.sin(b / 2) * 0.15; break;
      case 1: // pointing up, side to side
        { const up = Math.sin(b / 2) > 0; p.armLX = up ? -2.6 : -0.2; p.armLZ = up ? 0.5 : 0.1; p.armRX = up ? -0.2 : -2.6; p.armRZ = up ? -0.1 : -0.5; p.elbowLX = -0.1; p.elbowRX = -0.1; p.hipsZ = up ? 0.07 : -0.07; p.headY = up ? 0.3 : -0.3; } break;
      case 2: // the twist
        p.hipsRY = Math.sin(b) * 0.35; p.spineY = -Math.sin(b) * 0.55; p.armLX = -0.7; p.armRX = -0.7; p.elbowLX = -1.4; p.elbowRX = -1.4; p.armLZ = 0.4; p.armRZ = -0.4; p.hipsY = 0.74; p.kneeLX = 0.6; p.kneeRX = 0.6; p.hipLX = -0.35; p.hipRX = -0.35; break;
      default: // swaying with the arms up, like a ballad
        p.armLX = -2.5 + c * 0.2; p.armRX = -2.5 - c * 0.2; p.armLZ = 0.5 + s * 0.2; p.armRZ = -0.5 + s * 0.2; p.elbowLX = -0.4; p.elbowRX = -0.4; p.hipsZ = s * 0.06; p.spineZ = s * 0.12; p.headZ = -s * 0.1;
    }
  },
  /* the band */
  guitar(p, t, ph, o) { const b = (o.beat ?? t * 2) * Math.PI; POSES.listen(p, t, ph, o); p.armLX = -1.05; p.armLZ = 0.05; p.elbowLX = -1.5; p.armRX = -0.55; p.armRZ = -0.25; p.elbowRX = -1.35 + Math.sin(b * 2) * 0.25; p.headX = 0.2 + Math.abs(Math.sin(b)) * 0.12; p.headY = 0.25; p.mouth = 0.2; },
  bass(p, t, ph, o) { const b = (o.beat ?? t * 2) * Math.PI; POSES.listen(p, t, ph, o); p.armLX = -1.9; p.armLZ = 0.35; p.elbowLX = -0.8; p.armRX = -0.7; p.armRZ = -0.15; p.elbowRX = -0.8 + Math.sin(b * 2) * 0.2; p.headY = 0.35; p.spineX = 0.05; },
  drums(p, t, ph, o) { const b = (o.beat ?? t * 2) * Math.PI; SEATED(p, 0.55); p.armLX = -0.75 + Math.max(0, Math.sin(b * 2)) * 0.5; p.armRX = -0.75 + Math.max(0, Math.sin(b * 2 + Math.PI)) * 0.5; p.elbowLX = -1.0; p.elbowRX = -1.0; p.armLZ = 0.3; p.armRZ = -0.3; p.headX = Math.abs(Math.sin(b)) * 0.2; p.kneeRX = 1.45 + Math.max(0, Math.sin(b)) * 0.2; p.mouth = 0.3; },
  piano(p, t, ph, o) { const b = (o.beat ?? t * 2) * Math.PI; SEATED(p, 0.5); p.armLX = -1.0; p.armRX = -1.0; p.elbowLX = -0.75; p.elbowRX = -0.75; p.armLZ = -0.05 + Math.sin(b * 1.5) * 0.1; p.armRZ = 0.05 + Math.sin(b * 1.5 + 1) * 0.1; p.spineX = 0.12 + Math.sin(b / 2) * 0.05; p.headX = 0.15; p.headY = Math.sin(b / 4) * 0.2; },
  vocals(p, t, ph, o) { const b = (o.beat ?? t * 2) * Math.PI; POSES.listen(p, t, ph, o); p.armRX = -0.9; p.armRZ = 0.25; p.elbowRX = -2.1; p.armLX = -0.6 + Math.sin(b / 2) * 0.4; p.armLZ = 0.6; p.elbowLX = -0.4; p.mouth = 0.4 + Math.abs(Math.sin(b * 1.5)) * 0.6; p.headX = -0.1; p.spineX = -0.05 + Math.sin(b / 2) * 0.04; },
  saxophone(p, t, ph, o) { const b = (o.beat ?? t * 2) * Math.PI; POSES.listen(p, t, ph, o); p.armLX = -0.85; p.armRX = -0.55; p.elbowLX = -1.8; p.elbowRX = -1.5; p.armLZ = -0.1; p.armRZ = 0.1; p.spineX = -0.12 + Math.sin(b / 2) * 0.1; p.headX = -0.15; p.mouth = 0.6; },
  congas(p, t, ph, o) { const b = (o.beat ?? t * 2) * Math.PI; POSES.listen(p, t, ph, o); p.armLX = -0.85 + Math.max(0, Math.sin(b * 2)) * 0.4; p.armRX = -0.85 + Math.max(0, Math.sin(b * 2 + 2)) * 0.4; p.elbowLX = -0.9; p.elbowRX = -0.9; p.armLZ = 0.25; p.armRZ = -0.25; p.spineX = 0.1; p.headX = 0.2; }
};
export const POSE_NAMES = Object.keys(POSES);

const K = ['hipsY', 'hipsX', 'hipsZ', 'hipsRY', 'spineX', 'spineY', 'spineZ', 'headX', 'headY', 'headZ', 'armLX', 'armLZ', 'armRX', 'armRZ', 'elbowLX', 'elbowRX', 'hipLX', 'hipRX', 'hipLZ', 'hipRZ', 'kneeLX', 'kneeRX', 'mouth'];
/* One frame toward a pose: every joint eases there, so a guest who sits down or jumps up to cheer moves smoothly */
export function act(p, pose, t, dt, o = {}) {
  const u = p.userData, j = u.j;
  if (!u.cur) { u.cur = Z(); if (o.snap !== false) { const f = Z(); (POSES[pose] || POSES.idle)(f, t, u.phase, Object.assign({ style: u.dance }, o)); u.cur = f; } }
  const goal = Z();
  (POSES[pose] || POSES.idle)(goal, t, u.phase, Object.assign({ style: u.dance }, o));
  const k = Math.min(1, dt * (pose === 'walk' ? 14 : 8)), c = u.cur;
  K.forEach(key => { c[key] += (goal[key] - c[key]) * k; });
  u.pose = pose;
  j.hips.position.y = c.hipsY; j.hips.position.x = c.hipsX; j.hips.rotation.set(0, c.hipsRY, c.hipsZ);
  j.spine.rotation.set(c.spineX, c.spineY, c.spineZ);
  j.neck.rotation.set(c.headX, c.headY, c.headZ);
  j.armL.rotation.set(c.armLX, 0, c.armLZ); j.armR.rotation.set(c.armRX, 0, c.armRZ);
  j.elbowL.rotation.x = c.elbowLX; j.elbowR.rotation.x = c.elbowRX;
  j.hipL.rotation.set(c.hipLX, 0, c.hipLZ); j.hipR.rotation.set(c.hipRX, 0, c.hipRZ);
  j.kneeL.rotation.x = c.kneeLX; j.kneeR.rotation.x = c.kneeRX;
  u.mouth.scale.set(1, 1 + c.mouth * 1.6, 1);
  u.cup.visible = goal.cup > 0;
  // blink now and then
  if (t > u.blinkAt) u.blinkAt = t + 2 + ((u.phase * 977) % 1) * 4;
  const shut = u.blinkAt - t > 0 && u.blinkAt - t < 0.12;
  u.eyes.forEach(e => { e.scale.y = shut ? 0.15 : e === u.eyes[2] || e === u.eyes[3] ? 1 : 1.25; });
}
