/* World Woodshed — the Club in 3D: a lot on the garden island seen from high above at an angle, as in a life-sim
   game, with low-poly rooms, furniture, plants, the band on stage and guests who walk in from the street, sit,
   dance and wander out to the garden. Built from the shared kit in src/ui/lowpoly.js (original art in code). The
   island around the lot (terrain, the real trees, kelp and bottles, the animals) is the garden's, from
   src/ui/garden3d.js when it is there; a plain lawn stands in otherwise. Its own chunk, loaded by
   src/tools/club.js only when the club is opened.

   Club3D({ onRoom }) → { el, draw(model), show(n, o), stop(), celebrate(id), snapshot(), dispose() }, the same
   shape as the flat Scene in src/ui/clubscene.js (the fallback without WebGL). model = { club, band, plants,
   guests }. Drag turns the view, a pinch or the wheel zooms, a tap on a room (or an empty plot) calls onRoom. */
import { THREE, Stage, mat, glow, box, cyl, ball, group, at, shadows, label, person, potPlant, webglOK, HUES } from './lowpoly.js';
import { owns } from '../club.js';

export { webglOK };
// the garden's island, if this build has it (src/ui/garden3d.js, the garden thread's)
const ISLAND = import.meta.glob('./garden3d.js');

/* the lot, in metres: x to the right, z away from the street (the island leaves x -10..22, z -7..21 for it) */
export const ROOMS3D = {
  courtyard: [-8, 0, 0, 6], cafe: [0, 0, 8, 6], kitchen: [8, 0, 12, 6], hall: [12, 0, 20, 6],
  school: [-8, 6, 0, 12], jazzbar: [0, 6, 12, 14], studio: [12, 6, 20, 12], roof: [0, 14, 12, 19]
};
const FLOOR = { cafe: 0xb88a5a, kitchen: 0xd9d2c3, hall: 0xa77b52, jazzbar: 0x4b3326, studio: 0x55606b, school: 0x7f9a62, roof: 0xc98b62, courtyard: 0x5d9a4f };
const WALL = { cafe: 0xe8c9a0, kitchen: 0xe7d6c4, hall: 0xb7a0c9, jazzbar: 0x5a4b7a, studio: 0x5b7a87, school: 0xc9d7a8, roof: 0x9fd0bd, courtyard: 0xa6845a };
const LABEL = { cafe: 'Café', kitchen: 'Kitchen', courtyard: 'Courtyard', jazzbar: 'Jazz bar', school: 'Practice rooms', hall: 'Hall', roof: 'Glasshouse', studio: 'Studio' };
const WALL_H = 2.4, LOW = 0.35;

/* ---------- pieces only the club uses ---------- */
function tree(s = 1, leaf = 0x3f8f45, leaf2 = 0x2e6b33) {
  const g = group(cyl(0.12, 0.18, 1.4, 0x6d4c33), ball(0.9, leaf, 0, 2.0, 0, 1), ball(0.6, leaf2, 0.55, 1.7, 0.2, 1), ball(0.6, leaf, -0.5, 1.8, -0.2, 1));
  g.scale.setScalar(s);
  return g;
}
function kelpPond(n = 1) {
  const g = group(cyl(0.9, 0.9, 0.12, 0x2f6f8f, 0, 0, 0, 20, { transparent: true, opacity: 0.85 }), cyl(0.95, 0.95, 0.08, 0x7d8597));
  for (let i = 0; i < Math.min(5, n + 1); i++) { const k = cyl(0.04, 0.06, 0.9 + (i % 3) * 0.3, 0x6aa84f, Math.cos(i * 2.1) * 0.45, 0.05, Math.sin(i * 2.1) * 0.45, 6); k.userData.sway = i; g.add(k); }
  return g;
}
function bottlePlanter() {
  const g = group();
  for (let i = 0; i < 3; i++) { g.add(cyl(0.07, 0.09, 0.32, i === 1 ? 0xa8e6a0 : 0x9ad1e8, -0.18 + i * 0.18, 0, 0, 8, { transparent: true, opacity: 0.75 }), cyl(0.03, 0.05, 0.1, 0xcfe8f5, -0.18 + i * 0.18, 0.32, 0, 6)); }
  g.add(ball(0.16, 0x4caf50, -0.08, 0.55, 0), ball(0.14, 0x2e7d32, 0.12, 0.5, 0.05));
  return g;
}
const testLook = g => { g.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.45; } }); return g; };

/* furniture */
function table(round = true, chairs = 4, color = 0x6b4a2e) {
  const g = group(round ? cyl(0.45, 0.45, 0.05, color, 0, 0.7, 0, 16) : box(1.0, 0.05, 0.7, color, 0, 0.7, 0), cyl(0.05, 0.08, 0.7, 0x3b2b1e));
  const seats = [];
  for (let i = 0; i < chairs; i++) {
    const a = (i / chairs) * Math.PI * 2, cx = Math.cos(a) * 0.75, cz = Math.sin(a) * 0.75;
    const ch = group(box(0.38, 0.05, 0.38, 0x8a5a3a, 0, 0.42, 0), box(0.38, 0.45, 0.05, 0x8a5a3a, 0, 0.45, 0.17), box(0.04, 0.42, 0.04, 0x5a3d26, 0.15, 0, -0.15), box(0.04, 0.42, 0.04, 0x5a3d26, -0.15, 0, -0.15));
    at(ch, cx, cz, -a - Math.PI / 2); g.add(ch);
    seats.push({ x: cx, z: cz, face: Math.atan2(-cx, -cz) });
  }
  g.userData.seats = seats;
  return g;
}
function counter(w = 3, color = 0x5a3d26) { return group(box(w, 1.0, 0.6, color), box(w + 0.1, 0.06, 0.7, 0x2b1d14, 0, 1.0, 0)); }
function upright() { return group(box(1.3, 1.2, 0.5, 0x1f1b24), box(1.2, 0.05, 0.25, 0xf4f1ea, 0, 0.75, -0.35), box(0.6, 0.45, 0.35, 0x2b1d14, 0, 0, -0.75)); }
function grand() { const top = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.3, 20, 1, false, 0, Math.PI), mat(0x111111)); top.position.y = 0.85; top.rotation.y = Math.PI / 2; top.scale.set(1, 1, 1.5); return group(top, box(1.8, 0.3, 0.6, 0x111111, 0, 0.7, 0), box(1.6, 0.04, 0.2, 0xf4f1ea, 0, 0.98, -0.32), cyl(0.05, 0.05, 0.7, 0x111111, 0.7, 0, 0.3), cyl(0.05, 0.05, 0.7, 0x111111, -0.7, 0, 0.3), cyl(0.05, 0.05, 0.7, 0x111111, 0, 0, 1.1)); }
function stringLights(points, color = 0xffe9a8) {
  const g = group();
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, ay, az] = points[i], [bx, by, bz] = points[i + 1];
    for (let k = 0; k < 6; k++) { const t = k / 6, sag = Math.sin(t * Math.PI) * 0.3; const b = ball(0.06, color, ax + (bx - ax) * t, ay + (by - ay) * t - sag, az + (bz - az) * t, 0, glow(color)); b.userData.twinkle = i * 6 + k; g.add(b); }
  }
  return g;
}

/* people: a body, a head, hair, legs that walk and arms that play */

/* the band's instruments, held or stood at */
/* the band's instruments, held or stood at */
function instrument(role) {
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


export function Club3D({ onRoom } = {}) {
  const stage = Stage({ light: 'evening', onTap: p => {
    const id = Object.keys(ROOMS3D).find(k => { const [a, b, c, d] = ROOMS3D[k]; return p.x >= a && p.x <= c && p.z >= b && p.z <= d; });
    if (id && onRoom) onRoom(id);
  } });
  const { el, scene, camera, view, flyTo } = stage;
  el.classList.add('cl3-wrap');
  stage.canvas.classList.add('cl3-canvas');
  stage.canvas.setAttribute('role', 'img');
  stage.canvas.setAttribute('aria-label', 'Your club in 3D on the garden island, seen from above: its rooms, plants, the band and tonight\'s guests');
  const world = new THREE.Group(), people = new THREE.Group(), ground = new THREE.Group();
  scene.add(ground, world, people);

  // the island from the garden, or a lawn; the street and pavement in front of the club are the club's
  let island = null;
  function lawn() { ground.add(at(box(60, 0.02, 50, 0x5f8f4a, 0, -0.03, 0), 6, 8, 0, -0.03)); }
  const islandReady = (ISLAND['./garden3d.js'] ? ISLAND['./garden3d.js']() : Promise.resolve(null)).then(mod => {
    if (!mod || !mod.Island) { lawn(); return; }
    island = mod.Island(stage, { planted: (model && model.plants) || [] });
    // the island's golden hour, the same as the garden page's, so the two read as one world
    scene.background = new THREE.Color(0xf3d6b4);
    scene.fog = new THREE.Fog(0xf3d6b4, 70, 140);
    stage.hemi.color.set(0xfff0dc); stage.hemi.groundColor.set(0x52603a); stage.hemi.intensity = 1.8;
    stage.sun.color.set(0xffd9a8); stage.sun.intensity = 1.9;
    ground.add(island.group);
    if (island.frame) stage.onFrame(island.frame);
    if (model) draw(model);
  }).catch(e => { console.error(e); lawn(); });
  ground.add(at(box(34, 0.03, 3, 0x7a7466), 6, -5));
  ground.add(at(box(34, 0.05, 1.6, 0xb9b2a0), 6, -2.6));
  let home = { yaw: -0.35, pitch: 0.95, dist: 26, cx: 4, cz: 4 };
  function frameOwned(club) {
    const ids = Object.keys(ROOMS3D).filter(id => owns(club, id));
    let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
    ids.forEach(id => { const [a, b, c, d] = ROOMS3D[id]; x0 = Math.min(x0, a); z0 = Math.min(z0, b); x1 = Math.max(x1, c); z1 = Math.max(z1, d); });
    // one ring of plots around what is built, so the next room is in view
    x0 -= 3; x1 += 3; z1 += 3; z0 -= 3;
    const span = Math.max(x1 - x0, (z1 - z0) * 1.2);
    home = { yaw: -0.35, pitch: 0.95, dist: Math.max(14, Math.min(42, span * 1.25)), cx: (x0 + x1) / 2, cz: (z0 + z1) / 2 };
    stage.setHome(home);
  }

  /* ---------- building the club ---------- */
  let model = null, walls = [], seats = [], stands = [], lamps = [], beams = [], twinkles = [], sway = [], tiles = [], fires = [], stageAt = null, jar = null;
  const bandG = new THREE.Group();
  scene.add(bandG);
  const clear = stage.clear;

  function wall(x0, z0, x1, z1, color, outward) {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const m = new THREE.Mesh(new THREE.BoxGeometry(len, WALL_H, 0.18), mat(color));
    m.geometry.translate(0, WALL_H / 2, 0);
    m.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
    m.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
    m.castShadow = true; m.receiveShadow = true;
    m.userData.out = outward; // the side the wall faces: lowered when the camera is on that side
    walls.push(m);
    return m;
  }
  function room(id, built) {
    const [x0, z0, x1, z1] = ROOMS3D[id], w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const g = new THREE.Group();
    if (!built) {
      // an empty plot: a dashed outline, a sold sign and the room's name
      const pts = [[x0 + 0.2, z0 + 0.2], [x1 - 0.2, z0 + 0.2], [x1 - 0.2, z1 - 0.2], [x0 + 0.2, z1 - 0.2], [x0 + 0.2, z0 + 0.2]].map(([x, z]) => new THREE.Vector3(x, 0.05, z));
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.5, gapSize: 0.35, transparent: true, opacity: 0.55 }));
      line.computeLineDistances();
      g.add(line, at(group(box(0.08, 1.2, 0.08, 0x8a6d4b), box(0.9, 0.55, 0.06, 0xf2cc8f, 0, 1.0, 0)), cx, cz));
      const l = label('+ ' + LABEL[id], '#f2cc8f'); l.position.set(cx, 2.6, cz); g.add(l);
      return g;
    }
    g.add(at(box(w, 0.08, d, FLOOR[id]), cx, cz));
    if (id === 'kitchen') { for (let i = 0; i < w; i++) for (let j = 0; j < d; j++) if ((i + j) % 2) g.add(at(box(1, 0.09, 1, 0x9aa3ad), x0 + i + 0.5, z0 + j + 0.5)); }
    if (id === 'courtyard') {
      g.add(at(box(1.2, 0.09, d, 0xc9b28a), x1 - 1.4, cz));
      for (let x = x0 + 0.3; x < x1; x += 0.6) g.add(at(box(0.08, 0.7, 0.08, 0xa6845a), x, z0 + 0.1));
      g.add(at(box(w, 0.06, 0.06, 0xa6845a, 0, 0.55, 0), cx, z0 + 0.1));
      return g;
    }
    if (id === 'roof') {
      const glass = mat(0xbfe8d8, { transparent: true, opacity: 0.25 });
      [[x0, z0, x1, z0], [x1, z0, x1, z1], [x1, z1, x0, z1], [x0, z1, x0, z0]].forEach(([a, b, c, e]) => { const len = Math.hypot(c - a, e - b), m = new THREE.Mesh(new THREE.BoxGeometry(len, 2.6, 0.06), glass); m.position.set((a + c) / 2, 1.3, (b + e) / 2); m.rotation.y = -Math.atan2(e - b, c - a); g.add(m); });
      for (let x = x0; x <= x1; x += 2) g.add(at(box(0.08, 2.6, 0.08, 0xdfe9e4), x, z0), at(box(0.08, 2.6, 0.08, 0xdfe9e4), x, z1));
      return g;
    }
    // walls on the outside edges (an edge shared with another built room has none, so rooms open into each other)
    const shared = (ax, az, bx, bz) => Object.keys(ROOMS3D).some(k => {
      if (k === id || !owns(model.club, k)) return false;
      const [p0, q0, p1, q1] = ROOMS3D[k], mx = (ax + bx) / 2, mz = (az + bz) / 2;
      return mx >= p0 - 0.01 && mx <= p1 + 0.01 && mz >= q0 - 0.01 && mz <= q1 + 0.01 && !(mx > p0 && mx < p1 && mz > q0 && mz < q1);
    });
    const edges = [[x0, z0, x1, z0, [0, -1]], [x1, z0, x1, z1, [1, 0]], [x1, z1, x0, z1, [0, 1]], [x0, z1, x0, z0, [-1, 0]]];
    edges.forEach(([a, b, c, e, n]) => { if (!shared(a, b, c, e)) g.add(wall(a, b, c, e, WALL[id], n)); });
    // a warm lamp in each room
    const lamp = new THREE.PointLight(0xffc98a, 14, 9, 1.6);
    lamp.position.set(cx, 2.3, cz);
    lamps.push(lamp); g.add(lamp, at(cyl(0.25, 0.1, 0.18, 0xffe2a8, 0, 0, 0, 10, glow(0xffd28a)), cx, cz, 0, 2.2));
    return g;
  }

  // where each room's basic furniture and each amenity go; seats and standing spots for guests
  function addSeats(g, x, z, rot) {
    (g.userData.seats || []).forEach(s => { const c = Math.cos(rot), sn = Math.sin(rot); seats.push({ x: x + s.x * c + s.z * sn, z: z - s.x * sn + s.z * c, face: s.face + rot, taken: null }); });
  }
  function put(g, x, z, rot = 0, y = 0, id) { at(g, x, z, rot, y); shadows(g); if (id) g.userData.item = id; world.add(g); addSeats(g, x, z, rot); return g; }
  function furnish(club) {
    const has = id => owns(club, id);
    // the café: a rug stage by the window, a counter with the tips jar, tables
    put(box(2.4, 0.04, 1.6, 0xa63d40), 1.8, 4.5);
    put(counter(2.6), 6.2, 4.9);
    jar = put(group(cyl(0.14, 0.12, 0.3, 0xcfe6f5, 0, 0, 0, 10, { transparent: true, opacity: 0.5 }), cyl(0.11, 0.11, 0.12, 0xe6b422)), 5.4, 4.7, 0, 1.06);
    put(table(true, 3), 2.5, 1.8); put(table(true, 3), 5.4, 2.2);
    if (has('chairs')) { put(table(true, 4, 0x7a5232), 7.0, 1.4); }
    if (has('lights')) world.add(collect(stringLights([[0.2, 2.2, 0.2], [4, 2.3, 0.4], [7.8, 2.2, 0.2]])));
    if (has('monstera')) put(potPlant('monstera', 1.3), 7.4, 3.2, 0, 0, 'monstera');
    if (has('chalk')) put(group(box(0.9, 1.2, 0.08, 0x26302b, 0, 0.4, 0), box(0.04, 0.4, 0.04, 0x5a3d26, -0.3), box(0.04, 0.4, 0.04, 0x5a3d26, 0.3)), 7.3, 0.6, 0.3, 0, 'chalk');
    put(potPlant('leafy'), 0.5, 0.5);
    // the kitchen
    if (has('kitchen')) {
      put(counter(3, 0x8a8f99), 10, 5.3); put(box(0.8, 0.9, 0.6, 0xcfd4dc), 11.4, 3.2);
      if (has('oven')) { const o = put(group(box(1.4, 1.2, 1.2, 0xa9573c), ball(0.7, 0xa9573c, 0, 1.2, 0, 1), box(0.6, 0.45, 0.1, 0x2b1d14, 0, 0.3, -0.6)), 9.0, 3.6, Math.PI / 2, 0, 'oven'); const f = ball(0.22, 0xf4a261, 0, 0.35, -0.5, 0, glow(0xf4a261)); o.add(f); fires.push(f); }
      if (has('herbs')) { const hw = group(box(2.5, 1.6, 0.1, 0x6d4c33, 0, 0.5, 0)); for (let i = 0; i < 9; i++) hw.add(ball(0.17, i % 2 ? 0x43a047 : 0x2e7d32, -1 + (i % 3) * 1, 0.8 + Math.floor(i / 3) * 0.5, -0.1)); put(hw, 10, 0.25, 0, 0, 'herbs'); }
      if (has('table')) put(group(box(3, 0.06, 0.9, 0x6b4a2e, 0, 0.72, 0), box(0.1, 0.72, 0.8, 0x3b2b1e, -1.3), box(0.1, 0.72, 0.8, 0x3b2b1e, 1.3)), 10, 1.6, Math.PI / 2, 0, 'table');
      if (has('table')) [[9.4, 0.6], [9.4, 1.6], [9.4, 2.6], [10.6, 0.6], [10.6, 1.6], [10.6, 2.6]].forEach(([x, z]) => seats.push({ x, z, face: x < 10 ? Math.PI / 2 : -Math.PI / 2, taken: null }));
    }
    // the courtyard garden
    if (has('courtyard')) {
      put(table(true, 4, 0xd9d2c3), -5, 2.2); put(table(true, 2, 0xd9d2c3), -2.6, 4.4);
      if (has('olive')) put(tree(1.1, 0x8aa36a, 0x6b8550), -6.6, 4.8, 0, 0, 'olive');
      if (has('fountain')) { const f = put(group(cyl(0.9, 1.0, 0.4, 0x9a9faa), cyl(0.8, 0.8, 0.05, 0x5fa8d3, 0, 0.38, 0, 20), cyl(0.08, 0.1, 1.0, 0x9a9faa), cyl(0.35, 0.3, 0.12, 0x9a9faa, 0, 1.0, 0)), -3.0, 1.4, 0, 0, 'fountain'); const w = cyl(0.03, 0.15, 0.4, 0x9fd8f0, 0, 1.1, 0, 8, { transparent: true, opacity: 0.6 }); f.add(w); }
      if (has('benches')) { put(group(box(1.6, 0.08, 0.45, 0x8a5a3a, 0, 0.45, 0), box(0.08, 0.45, 0.4, 0x3b2b1e, -0.7), box(0.08, 0.45, 0.4, 0x3b2b1e, 0.7)), -7.3, 2.2, Math.PI / 2, 0, 'benches'); seats.push({ x: -7.3, z: 1.8, face: Math.PI / 2, taken: null }, { x: -7.3, z: 2.6, face: Math.PI / 2, taken: null }); }
      if (has('strings')) world.add(collect(stringLights([[-7.8, 2.4, 0.3], [-4, 2.6, 3], [-0.3, 2.4, 5.7]])));
    }
    // the jazz bar: the stage at the back, a bar, tables in front
    if (has('jazzbar')) {
      put(box(7, 0.4, 2.6, 0x6b4a2e), 4.2, 12.6);
      put(counter(3.4, 0x3b2b1e), 10.2, 9.0, Math.PI / 2);
      put(box(0.4, 1.8, 3.2, 0x3b2b1e, 0, 0, 0), 11.7, 9.0);
      put(table(true, 3, 0x2b1d14), 2.0, 8.2); put(table(true, 3, 0x2b1d14), 5.0, 7.6); put(table(true, 3, 0x2b1d14), 7.8, 8.4);
      if (has('spots')) [[2, 0.4], [6.4, -0.4]].forEach(([x, r]) => { const cone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3.2, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff1b8, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); cone.position.set(x, 1.95, 12.6); cone.rotation.z = r * 0.3; beams.push(cone); world.add(cone, at(cyl(0.18, 0.12, 0.3, 0x1f1b24), x, 12.6, 0, 3.4)); });
      if (has('pa')) [[0.6, 13.2], [7.8, 13.2]].forEach(([x, z]) => put(group(box(0.6, 1.4, 0.5, 0x1f1b24), cyl(0.18, 0.18, 0.05, 0x555555, 0, 0.9, -0.26)), x, z, 0, 0.4, 'pa'));
      if (has('ferns')) [[1, 6.8], [11, 13], [9, 6.8]].forEach(([x, z]) => put(potPlant('fern', 1.2), x, z, 0, 1.9, 'ferns'));
    }
    // the band, on the jazz bar's stage once it is built, otherwise on the café's rug
    stageAt = has('jazzbar') ? { x: 4.2, z: 12.6, y: 0.4, w: 6, dir: Math.PI } : { x: 1.8, z: 4.5, y: 0.04, w: 2.2, dir: Math.PI };
    const piano = has('grand') && has('jazzbar') ? grand() : has('upright') ? upright() : null;
    if (piano) put(piano, stageAt.x + stageAt.w / 2 - 0.2, stageAt.z + 0.2, has('grand') && has('jazzbar') ? -0.4 : 0, stageAt.y, has('grand') ? 'grand' : 'upright');
    // the practice rooms
    if (has('school')) {
      for (let i = 0; i < 3; i++) put(group(box(0.06, 2.4, 2, 0xc9d7a8)), -8 + (i + 1) * 2.6, 9);
      put(group(box(0.5, 0.5, 0.5, 0x3a3a3a), cyl(0.15, 0.15, 0.4, 0x8a5a3a, 0, 0.5, 0)), -6.6, 10.6);
      if (has('amps')) [[-4, 10.8], [-1.4, 10.8]].forEach(([x, z]) => put(box(0.6, 0.55, 0.35, 0x1f1b24), x, z, 0, 0, 'amps'));
      if (has('lending')) { const sh = group(box(2.4, 2, 0.4, 0x3b2b1e)); for (let i = 0; i < 4; i++) sh.add(at(instrument(i % 2 ? 'guitar' : 'saxophone'), -0.9 + i * 0.6, 0.1, 0, 0.5 + (i % 2) * 0.6)); put(sh, -4, 6.4, 0, 0, 'lending'); }
      if (has('board')) put(group(box(1.4, 1, 0.06, 0x26302b, 0, 1.0, 0)), -1.0, 6.2, 0, 0, 'board');
    }
    // the community hall
    if (has('hall')) {
      put(box(4.5, 0.3, 1.6, 0x6b4a2e), 16, 5.0);
      put(table(false, 4), 13.6, 1.8); put(table(false, 4), 18.4, 1.8);
      if (has('floor')) { for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const t = box(0.9, 0.05, 0.9, (i + j) % 2 ? 0xd4a5a5 : 0xf2cc8f, 0, 0, 0, mat((i + j) % 2 ? 0xd4a5a5 : 0xf2cc8f, { emissive: 0x000000 }).clone()); at(t, 14.6 + i * 0.95, 2.4 + j * 0.95); t.userData.k = i + j; tiles.push(t); world.add(t); } }
      if (has('bunting')) { const b = group(); for (let i = 0; i < 14; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.35, 3), mat(HUES[i % HUES.length])); f.position.set(12.4 + i * 0.55, 2.2 - Math.sin((i / 13) * Math.PI) * 0.3, 3); f.rotation.x = Math.PI; b.add(f); } world.add(b); }
      if (has('coats')) put(group(cyl(0.04, 0.04, 1.8, 0x5a3d26), ball(0.25, 0x8a4c24, 0.15, 1.4, 0), ball(0.25, 0x3d85c6, -0.15, 1.3, 0.05)), 19.4, 0.6, 0, 0, 'coats');
    }
    // the glasshouse
    if (has('roof')) {
      put(potPlant('monstera', 1.4), 1.2, 18); put(potPlant('fern', 1.3), 10.8, 15);
      put(table(true, 2, 0xd9d2c3), 6, 16.5);
      if (has('lemons')) [[2.5, 15.2], [9.5, 18], [4, 18.2]].forEach(([x, z]) => put(potPlant('lemon', 1.6), x, z, 0, 0, 'lemons'));
      if (has('scope')) { const s = group(cyl(0.03, 0.03, 1.2, 0x555555), box(0.18, 0.18, 1.2, 0xc9b27c, 0, 1.3, 0)); s.children[1].rotation.x = -0.6; put(s, 10.8, 18.2, 0.5, 0, 'scope'); }
      if (has('hammocks')) { const hm = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.12, 6, 16, Math.PI), mat(0xe9c46a)); hm.rotation.set(Math.PI, 0, 0); hm.position.y = 1.0; put(group(hm, cyl(0.05, 0.05, 1.3, 0x6d4c33, 0.9), cyl(0.05, 0.05, 1.3, 0x6d4c33, -0.9)), 7.5, 18.4, 0, 0, 'hammocks'); seats.push({ x: 7.5, z: 18.4, face: 0, taken: null }); }
    }
    // the studio
    if (has('studio')) {
      put(group(box(2.2, 0.8, 0.9, 0x2b2b33), box(2.0, 0.05, 0.6, 0x9aa3ad, 0, 0.82, 0)), 15, 7.4);
      put(box(0.06, 2.4, 3, 0x7aa6b8, 0, 0, 0, { transparent: true, opacity: 0.4 }), 17, 9.5);
      if (has('tape')) { const t = group(box(0.9, 1.1, 0.6, 0x3a3a3a)); [-0.22, 0.22].forEach(x => { const r = cyl(0.18, 0.18, 0.04, 0xaaaaaa, x, 0.7, -0.31, 14); r.rotation.x = Math.PI / 2; t.add(r); }); put(t, 13.2, 10.8, Math.PI, 0, 'tape'); }
      if (has('booth')) put(group(box(1.8, 2.3, 0.06, 0x2c3e4a), cyl(0.02, 0.02, 1.5, 0x888888, 0, 0, 0.6), ball(0.07, 0x999999, 0, 1.55, 0.6)), 18.8, 11.4, 0, 0, 'booth');
      if (has('gold')) { const g = group(); for (let i = 0; i < 5; i++) { const d = cyl(0.28, 0.28, 0.03, 0xe6b422, -1.2 + i * 0.6, 1.4 + (i % 2) * 0.5, 0); d.rotation.x = Math.PI / 2; g.add(d); } put(g, 16, 11.85, Math.PI, 0, 'gold'); }
    }
  }
  function collect(g) { g.traverse(o => { if (o.userData && o.userData.twinkle !== undefined) twinkles.push(o); }); return g; }

  /* real trees, kelp and bottles (plantings() from the garden): in the courtyard once built, along the pavement before */
  function plantReal(list, club) {
    const yard = owns(club, 'courtyard');
    const spots = yard ? [[-7.2, 0.8], [-5.8, 0.6], [-4.4, 0.8], [-1.0, 0.8], [-7.4, 5.4], [-5.2, 5.5], [-1.2, 3.2], [-3.8, 3.6], [-6.4, 3.3], [-2.2, 5.6]] : [[-0.6, -1.4], [1.2, -1.4], [3, -1.4], [5, -1.4], [6.8, -1.4], [8.6, -1.4], [10.4, -1.4], [12.2, -1.4]];
    let ponds = 0;
    list.slice(0, spots.length).forEach((p, i) => {
      const [x, z] = spots[i];
      let g;
      if (p.kind === 'kelp') { if (ponds++ && yard) return; g = kelpPond(list.filter(q => q.kind === 'kelp').length); g.traverse(o => { if (o.userData.sway !== undefined) sway.push(o); }); }
      else if (p.kind === 'bottles') g = bottlePlanter();
      else g = tree(yard ? 0.8 : 0.5);
      if (p.test) testLook(g);
      put(g, x, z);
    });
  }

  function draw(m) {
    model = m;
    clear(world); clear(bandG);
    walls = []; seats = []; stands = []; lamps = []; beams = []; twinkles = []; sway = []; tiles = []; fires = [];
    Object.keys(ROOMS3D).forEach(id => { const g = room(id, owns(m.club, id)); g.userData.room = id; world.add(g); });
    furnish(m.club);
    // the real trees, kelp and bottles: on the island around the club when it is there, else by the club
    if (island) { if (island.update) island.update(m.plants || []); } else plantReal(m.plants || [], m.club);
    // a big sign over the café door, lit
    const sign = group(box(3.2, 0.6, 0.12, 0x2b2238, 0, 2.5, -0.1));
    for (let i = 0; i < 8; i++) { const b = ball(0.07, 0xf6d743, -1.4 + i * 0.4, 2.8, -0.18, 0, glow(0xf6d743)); b.userData.twinkle = 100 + i; twinkles.push(b); sign.add(b); }
    world.add(at(sign, 4, 0));
    // standing spots: the free floor of each built room
    Object.keys(ROOMS3D).filter(id => owns(m.club, id)).forEach(id => {
      const [x0, z0, x1, z1] = ROOMS3D[id];
      for (let x = x0 + 0.9; x < x1 - 0.6; x += 1.1) for (let z = z0 + 0.9; z < z1 - 0.6; z += 1.1) {
        if (seats.some(s => Math.hypot(s.x - x, s.z - z) < 1.0)) continue;
        if (stageAt && Math.abs(x - stageAt.x) < stageAt.w / 2 + 0.4 && Math.abs(z - stageAt.z) < 1.6) continue;
        if (id === 'jazzbar' && x > 9.2) continue;
        stands.push({ x, z, room: id, taken: null });
      }
    });
    // the band
    const players = [{ role: 'guitar', id: 'you' }].concat((m.band || []).filter(b => b.level > 0));
    const hasPiano = !!world.children.find(c => c.userData.item === 'grand' || c.userData.item === 'upright');
    players.forEach((b, i) => {
      const n = players.length, x = stageAt.x - stageAt.w / 2 + 0.4 + (stageAt.w - 0.8) * (n === 1 ? 0.5 : i / (n - 1));
      const p = person(500 + i, { shirt: [0x2b2238, 0xc94c4c, 0x3d85c6, 0x6c9a8b, 0xe9c46a, 0xc77dff, 0xf4a261][i % 7], pants: 0x1a1a22 });
      p.userData.role = b.role;
      at(p, x, stageAt.z + (i % 2 ? 0.3 : -0.2), stageAt.dir, stageAt.y);
      if (b.role === 'piano' && hasPiano) p.position.x = stageAt.x + stageAt.w / 2 - 0.2; // at the piano
      else p.add(instrument(b.role));
      bandG.add(p);
    });
    frameOwned(m.club);
    if (!stage.flying) Object.assign(view, home);
    spawnCrowd(m.guests || 0, false);
  }

  /* ---------- the guests: walk in from the street, sit or stand, dance, wander, leave ---------- */
  const DOOR = { x: 4, z: -0.6 };
  let guests = [], want = 0, nextSpawn = 0;
  function spawnCrowd(n, burst) {
    clear(people); guests = []; seats.forEach(s => { s.taken = null; }); stands.forEach(s => { s.taken = null; });
    want = Math.min(n, 40);
    // settle most of tonight's guests where they are already, so the club is lively at once
    const already = burst ? 0 : Math.max(0, want - 4);
    for (let i = 0; i < already; i++) addGuest(i, true);
    nextSpawn = 0;
  }
  function freeSpot(pref) {
    const pool = pref === 'stand' ? stands : seats.concat(stands);
    const free = pool.filter(s => !s.taken);
    return free.length ? free[Math.floor(Math.random() * free.length)] : null;
  }
  function addGuest(i, placed) {
    const p = person(guests.length * 13 + i + (placed ? 0 : 777));
    const spot = freeSpot(Math.random() < 0.35 ? 'stand' : 'any');
    if (!spot) return null;
    const g = { p, spot, state: placed ? 'stay' : 'walk', path: [], until: performance.now() + 20000 + Math.random() * 40000, dance: Math.random() < 0.4 };
    spot.taken = g;
    if (placed) { at(p, spot.x, spot.z, spot.face ?? Math.random() * 6.28); if (seats.includes(spot)) sit(g); }
    else { p.position.set(DOOR.x + (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * (showing ? 4 : 12)), 0, -2.4 - Math.random() * 1.6); g.path = [{ x: DOOR.x - 0.5 + Math.random(), z: -1.6 }, { x: DOOR.x, z: 0.8 }, { x: spot.x, z: spot.z }]; }
    people.add(p); guests.push(g);
    return g;
  }
  function sit(g) { g.sat = true; g.p.position.y = -0.06; g.p.userData.legs.forEach(l => { l.rotation.x = -1.4; }); g.p.rotation.y = g.spot.face ?? g.p.rotation.y; }
  function standUp(g) { g.sat = false; g.p.position.y = 0; g.p.userData.legs.forEach(l => { l.rotation.x = 0; }); }
  function leave(g) {
    if (g.spot) g.spot.taken = null;
    standUp(g); g.state = 'leave';
    g.path = [{ x: DOOR.x, z: 0.8 }, { x: DOOR.x, z: -1.6 }, { x: 26, z: -3.5 + Math.random() }];
  }
  function stepGuest(g, dt, t) {
    const u = g.p.userData;
    if (g.state === 'walk' || g.state === 'leave') {
      const to = g.path[0];
      if (!to) { if (g.state === 'leave') { people.remove(g.p); guests.splice(guests.indexOf(g), 1); return; } g.state = 'stay'; if (seats.includes(g.spot)) sit(g); else g.p.rotation.y = stageAt ? Math.atan2(stageAt.x - g.p.position.x, stageAt.z - g.p.position.z) : 0; return; }
      const dx = to.x - g.p.position.x, dz = to.z - g.p.position.z, d = Math.hypot(dx, dz), sp = (showing ? 3.6 : 1.8) * dt;
      if (d < sp) { g.p.position.x = to.x; g.p.position.z = to.z; g.path.shift(); }
      else { g.p.position.x += dx / d * sp; g.p.position.z += dz / d * sp; g.p.rotation.y = Math.atan2(dx, dz); }
      const sw = Math.sin(t * 9 + u.phase) * 0.6;
      u.legs[0].rotation.x = sw; u.legs[1].rotation.x = -sw; u.arms[0].rotation.x = -sw * 0.7; u.arms[1].rotation.x = sw * 0.7;
      return;
    }
    // staying: listen, nod, dance; later wander to another spot or go home
    u.arms[0].rotation.x = 0; u.arms[1].rotation.x = 0;
    if (!g.sat) { u.legs[0].rotation.x = 0; u.legs[1].rotation.x = 0; }
    const lit = showing || want > 0;
    if (g.dance && !g.sat && lit) { g.p.position.y = Math.abs(Math.sin(t * 4.2 + u.phase)) * 0.12; u.arms[0].rotation.z = Math.sin(t * 4.2 + u.phase) * 0.6; u.arms[1].rotation.z = -Math.sin(t * 4.2 + u.phase) * 0.6; }
    else u.head.rotation.x = Math.sin(t * 3 + u.phase) * 0.12;
    if (!showing && performance.now() > g.until) {
      if (guests.length > want || Math.random() < 0.3) leave(g);
      else { const next = freeSpot('any'); if (next) { g.spot.taken = null; standUp(g); g.spot = next; next.taken = g; g.state = 'walk'; g.path = [{ x: next.x, z: next.z }]; } g.until = performance.now() + 20000 + Math.random() * 40000; }
    }
  }


  /* ---------- the loop ---------- */
  let showing = false;
  const camDir = new THREE.Vector3();
  stage.onFrame((dt, t, now) => {
    // walls between the camera and the room come down, as in a life-sim's cutaway view
    camera.getWorldDirection(camDir);
    walls.forEach(w => { const [nx, nz] = w.userData.out, facing = nx * camDir.x + nz * camDir.z < -0.2; const goal = facing ? LOW / WALL_H : 1; w.scale.y += (goal - w.scale.y) * Math.min(1, dt * 8); });
    // life
    if (guests.length < want && now > nextSpawn) { addGuest(guests.length, false); nextSpawn = now + (showing ? 140 : 1800 + Math.random() * 2500); }
    for (let i = guests.length - 1; i >= 0; i--) stepGuest(guests[i], dt, t);
    bandG.children.forEach((p, i) => {
      const u = p.userData, beat = t * (showing ? 4.4 : 3.2) + i;
      p.position.y = (stageAt ? stageAt.y : 0) + (want > 0 || showing ? Math.abs(Math.sin(beat)) * 0.05 : 0);
      if (want > 0 || showing) { u.arms[0].rotation.x = -0.9 + Math.sin(beat * 2) * 0.3; u.arms[1].rotation.x = -0.7 + Math.cos(beat * 2) * 0.3; u.head.rotation.x = Math.sin(beat) * 0.15; }
    });
    twinkles.forEach(b => { b.material = b.userData.mat || (b.userData.mat = b.material.clone()); b.material.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 2 + b.userData.twinkle * 1.7); });
    sway.forEach(k => { k.rotation.z = Math.sin(t * 1.3 + k.userData.sway) * 0.15; });
    fires.forEach(f => { f.scale.setScalar(0.85 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7) * 0.07); });
    tiles.forEach(tl => { tl.material.emissive.setHex(want > 0 && Math.floor(t * 2 + tl.userData.k) % 3 === 0 ? 0x553311 : 0x000000); });
    beams.forEach(b => { b.material.opacity += ((showing ? 0.22 : want > 0 ? 0.1 : 0.03) - b.material.opacity) * Math.min(1, dt * 3); });
    lamps.forEach(l => { l.intensity += ((want > 0 || showing ? 16 : 7) - l.intensity) * Math.min(1, dt * 2); });
  });

  /* ---------- effects ---------- */
  function noteFrom(x, z) {
    const n = group(ball(0.12, 0xf6d743, 0, 0, 0, 0, glow(0xf6d743)), box(0.03, 0.4, 0.03, 0xf6d743, 0.1, 0, 0, glow(0xf6d743)));
    n.position.set(x, 2, z);
    stage.particle(n, 2.2, (o, k) => { o.position.y = 2 + k * 2.5; o.position.x = x + Math.sin(k * 6) * 0.3; o.scale.setScalar(Math.max(0.01, 1 - k * 0.6)); });
  }
  function coin(sx, sz) {
    if (!jar) return;
    const to = jar.position, m = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 12), glow(0xf6d743));
    m.position.set(sx, 1.2, sz);
    stage.particle(m, 0.9, (o, k) => { o.position.set(sx + (to.x - sx) * k, 1.2 + Math.sin(k * Math.PI) * 2.5 + (to.y - 1.2 + 0.3) * k, sz + (to.z - sz) * k); o.rotation.x += 0.3; });
  }
  const burst = (x, y, z, n) => stage.burst(x, y, z, n);

  /* Showtime: the camera flies to the stage, the lights come up, tonight's guests come in, tips fly to the jar */
  async function show(n, o = {}) {
    if (!model) return;
    showing = true;
    const token = {}; show.token = token;
    const alive = () => show.token === token && el.isConnected;
    await flyTo({ cx: stageAt.x, cz: stageAt.z - 2.5, dist: 13, pitch: 0.75, yaw: view.yaw + 0.25 }, 1200);
    if (!alive()) return;
    spawnCrowd(n, true);
    const total = want;
    const notes = setInterval(() => { if (!alive()) { clearInterval(notes); return; } noteFrom(stageAt.x - stageAt.w / 2 + Math.random() * stageAt.w, stageAt.z); }, 300);
    let counted = 0;
    const tally = setInterval(() => {
      if (!alive()) { clearInterval(tally); return; }
      const inside = guests.filter(g => g.state !== 'walk' || g.path.length <= 1).length;
      if (inside > counted) { counted = inside; if (o.onGuest) o.onGuest(counted - 1, Math.max(1, total)); }
    }, 120);
    await new Promise(r => setTimeout(r, Math.min(7000, 1800 + total * 150)));
    clearInterval(tally);
    if (o.onGuest) o.onGuest(Math.max(0, total - 1), Math.max(1, total));
    if (!alive()) { clearInterval(notes); return; }
    await flyTo({ cx: 4, cz: 4, dist: 12, pitch: 0.85 }, 900);
    for (let i = 0; i < 12; i++) setTimeout(() => { if (!alive()) return; const g = guests[Math.floor(Math.random() * guests.length)]; if (g) coin(g.p.position.x, g.p.position.z); if (o.onCoin) o.onCoin(i, 12); }, i * 130);
    await new Promise(r => setTimeout(r, 2000));
    clearInterval(notes);
    if (!alive()) return;
    if (jar) burst(jar.position.x, 1.6, jar.position.z, 30);
    await flyTo(home, 1100);
    showing = false;
  }
  function stop() { show.token = null; showing = false; }
  function celebrate(id) {
    const item = world.children.find(c => c.userData.item === id);
    const b = ROOMS3D[id];
    let x, z;
    if (b) { x = (b[0] + b[2]) / 2; z = (b[1] + b[3]) / 2; } else if (item) { x = item.position.x; z = item.position.z; } else { x = 4; z = 3; }
    if (item) stage.pop(item);
    else world.children.filter(c => c.userData.room === id).forEach(c => stage.pop(c));
    flyTo({ cx: x, cz: z - 1, dist: Math.max(12, Math.min(20, view.dist)), pitch: 0.9 }, 700).then(() => burst(x, 1.5, z, 30));
  }
  function dispose() { show.token = null; stage.dispose(); }
  return { el, draw, show, stop, celebrate, snapshot: w => stage.snapshot(w), dispose, ready: islandReady, home: () => stage.goHome(700) };
}
