/* World Woodshed — the Club in 3D: a lot on the garden island seen from high above at an angle, as in a life-sim
   game, with low-poly rooms, furniture, plants, the band on stage and guests who walk in from the street, sit,
   dance and wander out to the garden. Built from the shared kit in src/ui/lowpoly.js (original art in code). The
   island around the lot (terrain, the real trees, kelp and bottles, the animals) is the garden's, from
   src/ui/garden3d.js when it is there; a plain lawn stands in otherwise. Its own chunk, loaded by
   src/tools/club.js only when the club is opened.

   Club3D({ onRoom }) → { el, draw(model), show(n, o), stop(), celebrate(id), snapshot(), dispose() }, the same
   shape as the flat Scene in src/ui/clubscene.js (the fallback without WebGL). model = { club, band, plants,
   guests }. Drag turns the view, a pinch or the wheel zooms, a tap on a room (or an empty plot) calls onRoom. */
import { THREE, Stage, mat, glow, box, cyl, ball, group, at, shadows, label, webglOK, HUES } from './lowpoly.js';
import { Sim, act } from './people.js';
import { owns, live, footprint, fits, itemOf, CELL, ROOMS, BUILT_IN } from '../club.js';
import { pieceModel, tree, counter, instrument } from './clubpieces.js';

export { webglOK };
// the garden's island, if this build has it (src/ui/garden3d.js, the garden thread's)
const ISLAND = import.meta.glob('./garden3d.js');

/* the lot, in metres: x to the right, z away from the street (the island leaves x -10..22, z -7..21 for it) */
export const ROOMS3D = Object.fromEntries(ROOMS.map(r => [r.id, r.rect]));
const FLOOR = { cafe: 0xb88a5a, kitchen: 0xd9d2c3, hall: 0xa77b52, jazzbar: 0x4b3326, studio: 0x55606b, school: 0x7f9a62, roof: 0xc98b62, courtyard: 0x5d9a4f };
const WALL = { cafe: 0xe8c9a0, kitchen: 0xe7d6c4, hall: 0xb7a0c9, jazzbar: 0x5a4b7a, studio: 0x5b7a87, school: 0xc9d7a8, roof: 0x9fd0bd, courtyard: 0xa6845a };
const LABEL = { cafe: 'Café', kitchen: 'Kitchen', courtyard: 'Courtyard', jazzbar: 'Jazz bar', school: 'Practice rooms', hall: 'Hall', roof: 'Glasshouse', studio: 'Studio' };
const WALL_H = 2.4, LOW = 0.35;

/* ---------- pieces only the club uses (the furniture is in src/ui/clubpieces.js) ---------- */
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

function stringLights(points, color = 0xffe9a8) {
  const g = group();
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, ay, az] = points[i], [bx, by, bz] = points[i + 1];
    for (let k = 0; k < 6; k++) { const t = k / 6, sag = Math.sin(t * Math.PI) * 0.3; const b = ball(0.06, color, ax + (bx - ax) * t, ay + (by - ay) * t - sag, az + (bz - az) * t, 0, glow(color)); b.userData.twinkle = i * 6 + k; g.add(b); }
  }
  return g;
}
/* the ghost of a piece being placed: see-through, green where it fits and red where it doesn't */
const GHOST = { ok: new THREE.MeshBasicMaterial({ color: 0x9be7a5, transparent: true, opacity: 0.55, depthWrite: false }), no: new THREE.MeshBasicMaterial({ color: 0xf28b82, transparent: true, opacity: 0.55, depthWrite: false }) };
const PAD = { ok: new THREE.MeshBasicMaterial({ color: 0x6ad07a, transparent: true, opacity: 0.35, depthWrite: false }), no: new THREE.MeshBasicMaterial({ color: 0xe0614f, transparent: true, opacity: 0.35, depthWrite: false }) };

export function Club3D({ onRoom, onBuild } = {}) {
  const stage = Stage({ light: 'evening', onTap: (p, e) => {
    if (building) { buildTap(p, e); return; }
    const id = Object.keys(ROOMS3D).find(k => { const [a, b, c, d] = ROOMS3D[k]; return p.x >= a && p.x <= c && p.z >= b && p.z <= d; });
    if (id && onRoom) onRoom(id);
  }, onHover: p => { if (building && ghostOf) ghostTo(p); } });
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
  const pieces = new Map(); // uid → the piece's group
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
  function addSeats(g, x, z, rot, y, id) {
    (g.userData.seats || []).forEach(s => { const c = Math.cos(rot), sn = Math.sin(rot); seats.push({ x: x + s.x * c + s.z * sn, z: z - s.x * sn + s.z * c, face: s.face + rot, y, h: s.h ?? SEAT_H[id] ?? 0.45, eat: !!s.eat, taken: null }); });
  }
  function put(g, x, z, rot = 0, y = 0, id) { at(g, x, z, rot, y); shadows(g); if (id) g.userData.item = id; world.add(g); addSeats(g, x, z, rot, y, id); return g; }
  function furnish(club) {
    const has = id => owns(club, id);
    // the café's built-ins: a rug for a stage, the counter with the tips jar
    put(box(2.4, 0.04, 1.8, 0xa63d40), 1.75, 4.5);
    put(counter(3.3), 6.25, 5.0);
    jar = put(group(cyl(0.14, 0.12, 0.3, 0xcfe6f5, 0, 0, 0, 10, { transparent: true, opacity: 0.5 }), cyl(0.11, 0.11, 0.12, 0xe6b422)), 5.2, 4.9, 0, 1.06);
    if (has('lights')) world.add(collect(stringLights([[0.2, 2.2, 0.2], [4, 2.3, 0.4], [7.8, 2.2, 0.2]])));
    if (has('kitchen')) {
      put(counter(3, 0x8a8f99), 10, 5.5); put(box(0.8, 1.8, 0.8, 0xcfd4dc), 11.5, 3.0);
      if (has('herbs')) { const hw = group(box(2.8, 1.6, 0.1, 0x6d4c33, 0, 0.5, 0)); for (let i = 0; i < 12; i++) hw.add(ball(0.17, i % 2 ? 0x43a047 : 0x2e7d32, -1.1 + (i % 4) * 0.73, 0.8 + Math.floor(i / 4) * 0.45, -0.1)); put(hw, 10, 0.2, 0, 0, 'herbs'); }
    }
    if (has('courtyard')) {
      put(box(1.0, 0.09, 6, 0xc9b28a), -1.5, 3);
      if (has('strings')) world.add(collect(stringLights([[-7.8, 2.4, 0.3], [-4, 2.6, 3], [-0.3, 2.4, 5.7]])));
    }
    if (has('jazzbar')) {
      put(box(7.4, 0.4, 2.9, 0x6b4a2e), 4.25, 12.5);
      put(counter(3.8, 0x3b2b1e), 10.0, 9.0, Math.PI / 2);
      put(group(box(0.4, 1.8, 3.8, 0x3b2b1e), ...[0, 1, 2, 3, 4].map(i => cyl(0.05, 0.05, 0.25, [0x6aa84f, 0xc94c4c, 0xe6b422][i % 3], 0.05, 1.2, -1.4 + i * 0.7, 6))), 11.75, 9.0);
      if (has('spots')) [[2, 0.4], [6.4, -0.4]].forEach(([x, r]) => { const cone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3.2, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff1b8, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); cone.position.set(x, 1.95, 12.5); cone.rotation.z = r * 0.3; beams.push(cone); world.add(cone, at(cyl(0.18, 0.12, 0.3, 0x1f1b24), x, 12.5, 0, 3.4)); });
    }
    if (has('school')) {
      [-5.25, -2.75, -0.25].forEach(x => put(box(0.12, 2.4, 2, 0xc9d7a8), x, 9));
      put(group(box(0.5, 0.5, 0.5, 0x3a3a3a), cyl(0.15, 0.15, 0.4, 0x8a5a3a, 0, 0.5, 0)), -6.5, 10.5);
    }
    if (has('hall')) {
      put(box(4.8, 0.3, 1.8, 0x6b4a2e), 16, 5.0);
      if (has('floor')) { for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const t = box(0.95, 0.05, 0.95, 0, 0, 0, 0, mat((i + j) % 2 ? 0xd4a5a5 : 0xf2cc8f).clone()); at(t, 14.5 + i, 1 + j); t.userData.k = i + j; t.receiveShadow = true; tiles.push(t); world.add(t); } }
      if (has('bunting')) { const b = group(); for (let i = 0; i < 14; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.35, 3), mat(HUES[i % HUES.length])); f.position.set(12.4 + i * 0.55, 2.2 - Math.sin((i / 13) * Math.PI) * 0.3, 3); f.rotation.x = Math.PI; b.add(f); } world.add(b); }
    }
    if (has('studio')) {
      put(group(box(2.2, 0.8, 0.9, 0x2b2b33), box(2.0, 0.05, 0.6, 0x9aa3ad, 0, 0.82, 0)), 15, 7.25);
      put(box(0.1, 2.4, 2.5, 0x7aa6b8, 0, 0, 0, { transparent: true, opacity: 0.4 }), 17, 9.25);
      if (has('booth')) put(group(box(2.3, 2.3, 0.06, 0x2c3e4a, 0, 0, 0.6), box(0.06, 2.3, 1.2, 0x2c3e4a, -1.15, 0, 0), cyl(0.02, 0.02, 1.5, 0x888888, 0, 0, 0), ball(0.07, 0x999999, 0, 1.55, 0)), 18.75, 11.2, 0, 0, 'booth');
      if (has('gold')) { const g = group(box(3.4, 1.6, 0.08, 0x2b2238, 0, 0.8, 0.1)); for (let i = 0; i < 5; i++) { const d = cyl(0.28, 0.28, 0.03, 0xe6b422, -1.3 + i * 0.65, 1.4 + (i % 2) * 0.5, 0); d.rotation.x = Math.PI / 2; g.add(d); } put(g, 15.25, 11.85, 0, 0, 'gold'); }
    }
    // the pieces placed in build mode
    live(club).forEach(([uid, p]) => {
      const [x0, z0, x1, z1] = footprint(p.k, p.x, p.z, p.r);
      const g = collect(pieceModel(p.k));
      g.userData.uid = uid;
      put(g, (x0 + x1) / 2 * CELL, (z0 + z1) / 2 * CELL, -p.r * Math.PI / 2, 0, p.k);
      pieces.set(uid, g);
    });
    // the band, on the jazz bar's stage once it is built, otherwise on the café's rug
    stageAt = has('jazzbar') ? { x: 4.25, z: 12.5, y: 0.4, w: 6, dir: Math.PI } : { x: 1.75, z: 4.5, y: 0.04, w: 2.2, dir: Math.PI };
  }
  function collect(g) { g.traverse(o => { const u = o.userData || {}; if (u.twinkle !== undefined) twinkles.push(o); if (u.fire) fires.push(o); if (u.sway !== undefined) sway.push(o); }); return g; }

  /* real trees, kelp and bottles (plantings() from the garden) along the pavement, when the island isn't there */
  function plantReal(list) {
    const yard = false, spots = [[-6.6, -1.4], [-4.8, -1.4], [-3, -1.4], [-0.6, -1.4], [1.2, -1.4], [6.8, -1.4], [8.6, -1.4], [10.4, -1.4], [12.2, -1.4], [14, -1.4]];
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
    walls = []; seats = []; stands = []; lamps = []; beams = []; twinkles = []; sway = []; tiles = []; fires = []; pieces.clear();
    Object.keys(ROOMS3D).forEach(id => { const g = room(id, owns(m.club, id)); g.userData.room = id; world.add(g); });
    furnish(m.club);
    // the real trees, kelp and bottles: on the island around the club when it is there, else by the club
    if (island) { if (island.update) island.update(m.plants || []); } else plantReal(m.plants || []);
    // a big sign over the café door, lit
    const sign = group(box(3.2, 0.6, 0.12, 0x2b2238, 0, 2.5, -0.1));
    for (let i = 0; i < 8; i++) { const b = ball(0.07, 0xf6d743, -1.4 + i * 0.4, 2.8, -0.18, 0, glow(0xf6d743)); b.userData.twinkle = 100 + i; twinkles.push(b); sign.add(b); }
    world.add(at(sign, 4, 0));
    // standing spots: the free floor of each built room
    Object.keys(ROOMS3D).filter(id => owns(m.club, id)).forEach(id => {
      const [x0, z0, x1, z1] = ROOMS3D[id];
      for (let x = x0 + 0.75; x < x1 - 0.5; x += 1) for (let z = z0 + 0.75; z < z1 - 0.5; z += 1) {
        if (seats.some(s => Math.hypot(s.x - x, s.z - z) < 0.8)) continue;
        if (!fits(m.club, 'chair', Math.floor(x / CELL), Math.floor(z / CELL), 0).ok) continue; // a piece or a built-in there
        stands.push({ x, z, room: id, taken: null });
      }
    });
    // the band
    const players = [{ role: 'guitar', id: 'you' }].concat((m.band || []).filter(b => b.level > 0));
    const piano = world.children.find(c => c.userData.item === 'grand') || world.children.find(c => c.userData.item === 'upright');
    players.forEach((b, i) => {
      const n = players.length, x = stageAt.x - stageAt.w / 2 + 0.4 + (stageAt.w - 0.8) * (n === 1 ? 0.5 : i / (n - 1));
      const p = lighten(Sim(500 + i, { shirt: [0x2b2238, 0xc94c4c, 0x3d85c6, 0x6c9a8b, 0xe9c46a, 0xc77dff, 0xf4a261][i % 7], pants: 0x1a1a22 }));
      p.userData.role = b.role;
      at(p, x, stageAt.z + (i % 2 ? 0.3 : -0.2), stageAt.dir, stageAt.y);
      if (b.role === 'piano' && piano) { const f = piano.rotation.y; at(p, piano.position.x - Math.sin(f) * 0.9, piano.position.z - Math.cos(f) * 0.9, f, 0); } // at the piano, wherever it stands
      else { const w = group(instrument(b.role)); w.scale.z = -1; p.add(w); } // the instruments were drawn for a player facing −z; a person faces +z
      bandG.add(p);
    });
    frameOwned(m.club);
    if (building) { drawGrid(); if (ghostOf) { const g = ghostOf; ghost = null; ghostAt(g.k, g.x, g.z, g.r, g.uid); } pick(picked); }
    if (!stage.flying && !building) Object.assign(view, home);
    spawnCrowd(m.guests || 0, false);
  }

  /* ---------- the guests: walk in from the street, sit or stand, dance, wander, leave ---------- */
  const DOOR = { x: 4, z: -0.6 };
  /* how high each kind of seat is, for the sitting pose (m) */
  const SEAT_H = { stool: 0.74, beanbag: 0.3, armchair: 0.48, sofa: 0.48, hammocks: 0.85 };
  /* the small bits of a face cast no shadow: fewer draw calls with a full room */
  /* only a person's body and limbs cast shadows, and the small bits of a face (eyes, brows, nose, mouth, cheeks,
     ears) are drawn only when the camera is close enough to see them: far fewer draw calls with a full room */
  let near = true;
  const NEAR = 15;
  function lighten(p) {
    p.traverse(o => {
      if (!o.isMesh) return;
      o.geometry.computeBoundingSphere();
      const r = o.geometry.boundingSphere.radius * Math.max(o.scale.x, o.scale.y, o.scale.z);
      if (r < 0.1) o.castShadow = false;
      if (r < 0.035) { (p.userData.details ||= []).push(o); o.visible = near; }
    });
    return p;
  }
  let guests = [], want = 0, nextSpawn = 0;
  function spawnCrowd(n, burst) {
    clear(people); guests = []; seats.forEach(s => { s.taken = null; }); stands.forEach(s => { s.taken = null; });
    want = Math.min(n, 30);
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
    const p = lighten(Sim(guests.length * 13 + i + (placed ? 0 : 777)));
    const spot = freeSpot(Math.random() < 0.35 ? 'stand' : 'any');
    if (!spot) return null;
    const now = performance.now();
    const g = { p, spot, state: placed ? 'stay' : 'walk', path: [], until: now + 20000 + Math.random() * 40000, dance: Math.random() < 0.4, act: 'idle', actUntil: 0, hello: 0, turnTo: null };
    spot.taken = g;
    if (placed) { at(p, spot.x, spot.z, spot.face ?? Math.random() * 6.28); if (seats.includes(spot)) sit(g); }
    else { p.position.set(DOOR.x + (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * (showing ? 4 : 12)), 0, -2.4 - Math.random() * 1.6); g.path = [{ x: DOOR.x - 0.5 + Math.random(), z: -1.6 }, { x: DOOR.x, z: 0.8 }, { x: spot.x, z: spot.z }]; }
    act(p, g.state === 'walk' ? 'walk' : g.sat ? 'sit' : 'idle', 0, 1, { seat: spot.h });
    people.add(p); guests.push(g);
    return g;
  }
  function sit(g) { g.sat = true; g.p.position.y = g.spot.y || 0; g.turnTo = g.spot.face ?? g.p.rotation.y; g.p.rotation.y = g.turnTo; }
  function standUp(g) { g.sat = false; g.p.position.y = 0; }
  function leave(g) {
    if (g.spot) g.spot.taken = null;
    standUp(g); g.state = 'leave'; g.hello = performance.now() + 900; // a wave goodbye first
    g.path = [{ x: DOOR.x, z: 0.8 }, { x: DOOR.x, z: -1.6 }, { x: 26, z: -3.5 + Math.random() }];
  }
  const pick1 = a => a[Math.floor(Math.random() * a.length)];
  /* what a guest does next where they are: eat and talk at a table, chat with whoever stands near, dance, listen,
     and clap and cheer when the band plays the show */
  function choose(g) {
    g.turnTo = null;
    if (g.sat) {
      if (showing) return pick1(['sitClap', 'sitClap', 'sit']);
      return g.spot.eat ? pick1(['eat', 'eat', 'sitChat']) : pick1(['sitChat', 'sitChat', 'sit']);
    }
    if (showing) return pick1(g.dance ? ['dance', 'dance', 'cheer'] : ['clap', 'cheer', 'listen', 'clap']);
    if (g.dance && want > 0 && Math.random() < 0.7) return 'dance';
    const me = g.p.position, near = guests.find(o => o !== g && o.state === 'stay' && !o.sat && Math.hypot(o.p.position.x - me.x, o.p.position.z - me.z) < 1.6);
    if (near && Math.random() < 0.75) { // turn to each other and talk
      g.turnTo = Math.atan2(near.p.position.x - me.x, near.p.position.z - me.z);
      if (near.act !== 'chat' && near.act !== 'dance') { near.act = 'chat'; near.turnTo = g.turnTo + Math.PI; near.actUntil = performance.now() + 6000 + Math.random() * 5000; }
      return 'chat';
    }
    if (stageAt) g.turnTo = Math.atan2(stageAt.x - me.x, stageAt.z - me.z);
    return pick1(['listen', 'listen', 'idle']);
  }
  function turnToward(o, goal, k) { let d = goal - o.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); o.rotation.y += d * k; }
  function stepGuest(g, dt, t, beat) {
    const now = performance.now();
    if (g.state === 'walk' || g.state === 'leave') {
      if (now < g.hello) { act(g.p, 'wave', t, dt); return; }
      const to = g.path[0];
      if (!to) {
        if (g.state === 'leave') { people.remove(g.p); guests.splice(guests.indexOf(g), 1); return; }
        g.state = 'stay'; g.actUntil = 0;
        if (seats.includes(g.spot)) sit(g);
        else if (Math.random() < 0.5) g.hello = now + 1400; // waves hello to the room
        return;
      }
      const dx = to.x - g.p.position.x, dz = to.z - g.p.position.z, d = Math.hypot(dx, dz), sp = (showing ? 3 : 1.3) * dt;
      if (d < sp) { g.p.position.x = to.x; g.p.position.z = to.z; g.path.shift(); }
      else { g.p.position.x += dx / d * sp; g.p.position.z += dz / d * sp; turnToward(g.p, Math.atan2(dx, dz), Math.min(1, dt * 10)); }
      act(g.p, 'walk', t, dt, { speed: showing ? 1.9 : 1 });
      return;
    }
    // staying: a while at one thing, then the next
    if (now > g.actUntil) { g.act = choose(g); g.actUntil = now + 5000 + Math.random() * 7000; }
    if (g.turnTo != null && !g.sat) turnToward(g.p, g.turnTo, Math.min(1, dt * 4));
    act(g.p, now < g.hello && !g.sat ? 'wave' : g.act, t, dt, { seat: g.spot.h, beat: beat + g.p.userData.phase * 0.05 });
    if (!showing && now > g.until) {
      if (guests.length > want || Math.random() < 0.3) leave(g);
      else { const next = freeSpot('any'); if (next) { g.spot.taken = null; standUp(g); g.spot = next; next.taken = g; g.state = 'walk'; g.path = [{ x: next.x, z: next.z }]; } g.until = now + 20000 + Math.random() * 40000; }
    }
  }


  /* ---------- build mode: a grid over the rooms, a ghost to place, pieces to pick ----------
     onBuild({ type: 'ghost', k, x, z, r, uid, ok, why }) as the ghost moves, ({ type: 'select', uid }) when a
     piece is tapped (uid null: nothing). */
  let building = false, ghostOf = null, ghost = null, picked = null, ring = null;
  const gridG = new THREE.Group(), ghostG = new THREE.Group();
  gridG.visible = false;
  scene.add(gridG, ghostG);
  function drawGrid() {
    clear(gridG);
    if (!model) return;
    const pts = [];
    ROOMS.filter(r => owns(model.club, r.id)).forEach(r => {
      const [x0, z0, x1, z1] = r.rect;
      for (let x = x0; x <= x1 + 1e-6; x += CELL) pts.push(x, 0.07, z0, x, 0.07, z1);
      for (let z = z0; z <= z1 + 1e-6; z += CELL) pts.push(x0, 0.07, z, x1, 0.07, z);
      (BUILT_IN[r.id] || []).forEach(([a, b, c, d, keep]) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(c - a, d - b), new THREE.MeshBasicMaterial({ color: keep ? 0xf2cc8f : 0x2b2238, transparent: true, opacity: keep ? 0.3 : 0.18, depthWrite: false }));
        m.rotation.x = -Math.PI / 2; m.position.set((a + c) / 2, 0.08, (b + d) / 2); gridG.add(m);
      });
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    gridG.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 })));
  }
  function setBuild(on) {
    building = !!on;
    gridG.visible = building; people.visible = !building;
    if (building) { drawGrid(); flyTo({ dist: Math.max(12, home.dist * 0.75), pitch: 1.05 }, 700); }
    else { endGhost(); pick(null); }
  }
  /* the ghost of kind k at cell (x, z) turned r; uid: the piece being moved (hidden meanwhile) */
  function ghostAt(k, x, z, r = 0, uid = null) {
    if (ghostOf && ghostOf.uid && ghostOf.uid !== uid && pieces.get(ghostOf.uid)) pieces.get(ghostOf.uid).visible = true;
    if (!ghost || !ghostOf || ghostOf.k !== k || ghostOf.r !== r) {
      clear(ghostG);
      ghost = pieceModel(k);
      ghost.traverse(o => { if (o.isMesh) { o.castShadow = false; o.userData.ghost = true; } });
      const it = itemOf(k), w = (r % 2 ? it.d : it.w) * CELL, d = (r % 2 ? it.w : it.d) * CELL;
      const pad = new THREE.Mesh(new THREE.PlaneGeometry(w, d), PAD.ok);
      pad.rotation.x = -Math.PI / 2; pad.position.y = 0.1; pad.userData.pad = true;
      ghost.rotation.y = -r * Math.PI / 2;
      ghostG.add(ghost, pad);
    }
    if (uid && pieces.get(uid)) pieces.get(uid).visible = false;
    const f = footprint(k, x, z, r), cx = (f[0] + f[2]) / 2 * CELL, cz = (f[1] + f[3]) / 2 * CELL;
    const fit = fits(model.club, k, x, z, r, uid);
    ghostG.children.forEach(o => { o.position.x = cx; o.position.z = cz; });
    ghost.traverse(o => { if (o.isMesh) o.material = fit.ok ? GHOST.ok : GHOST.no; });
    ghostG.children[1].material = fit.ok ? PAD.ok : PAD.no;
    ghostOf = { k, x, z, r, uid, ok: fit.ok, why: fit.why };
    if (onBuild) onBuild(Object.assign({ type: 'ghost' }, ghostOf));
    return ghostOf;
  }
  /* the ghost centred on a point of the ground */
  function ghostTo(p) {
    const it = itemOf(ghostOf.k), w = ghostOf.r % 2 ? it.d : it.w, d = ghostOf.r % 2 ? it.w : it.d;
    const x = Math.round(p.x / CELL - w / 2), z = Math.round(p.z / CELL - d / 2);
    if (x !== ghostOf.x || z !== ghostOf.z) ghostAt(ghostOf.k, x, z, ghostOf.r, ghostOf.uid);
  }
  /* a quarter turn about the ghost's middle */
  function turn() {
    if (!ghostOf) return null;
    const { k, x, z, r, uid } = ghostOf, f = footprint(k, x, z, r), r2 = (r + 1) % 4;
    const it = itemOf(k), w = r2 % 2 ? it.d : it.w, d = r2 % 2 ? it.w : it.d;
    return ghostAt(k, Math.round((f[0] + f[2] - w) / 2), Math.round((f[1] + f[3] - d) / 2), r2, uid);
  }
  function endGhost() {
    if (ghostOf && ghostOf.uid && pieces.get(ghostOf.uid)) pieces.get(ghostOf.uid).visible = true;
    clear(ghostG); ghost = null; ghostOf = null;
  }
  /* a piece picked: a ring of light around it */
  function pick(uid) {
    picked = uid && pieces.get(uid) ? uid : null;
    if (ring) { scene.remove(ring); ring.geometry.dispose(); ring = null; }
    if (!picked) return;
    const g = pieces.get(picked), box3 = new THREE.Box3().setFromObject(g), size = box3.getSize(new THREE.Vector3());
    ring = new THREE.Mesh(new THREE.RingGeometry(Math.max(size.x, size.z) * 0.55 + 0.1, Math.max(size.x, size.z) * 0.55 + 0.22, 32), new THREE.MeshBasicMaterial({ color: 0xf6d743, transparent: true, opacity: 0.9, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(g.position.x, 0.12, g.position.z);
    scene.add(ring);
  }
  function buildTap(p, e) {
    if (ghostOf) { ghostTo(p); return; }
    const hits = stage.rayAt(e.clientX, e.clientY).intersectObjects([...pieces.values()], true);
    let uid = null;
    for (const h of hits) { let o = h.object; while (o && !o.userData.uid) o = o.parent; if (o) { uid = o.userData.uid; break; } }
    pick(uid);
    if (onBuild) onBuild({ type: 'select', uid });
  }

  /* ---------- the loop ---------- */
  let showing = false, beatT = 0;
  const camDir = new THREE.Vector3();
  stage.onFrame((dt, t, now) => {
    // walls between the camera and the room come down, as in a life-sim's cutaway view
    camera.getWorldDirection(camDir);
    walls.forEach(w => { const [nx, nz] = w.userData.out, facing = nx * camDir.x + nz * camDir.z < -0.2; const goal = facing ? LOW / WALL_H : 1; w.scale.y += (goal - w.scale.y) * Math.min(1, dt * 8); });
    // life
    if (guests.length < want && now > nextSpawn) { addGuest(guests.length, false); nextSpawn = now + (showing ? 140 : 1800 + Math.random() * 2500); }
    // one beat for the room, so the band plays and the dancers dance to the same time (faster for the show)
    if ((view.dist < NEAR) !== near) { near = !near; guests.map(g => g.p).concat(bandG.children).forEach(p => (p.userData.details || []).forEach(o => { o.visible = near; })); }
    beatT += dt * (showing ? 2.2 : want > 0 ? 1.8 : 1.1);
    for (let i = guests.length - 1; i >= 0; i--) stepGuest(guests[i], dt, t, beatT);
    bandG.children.forEach(p => act(p, p.userData.role, t, dt, { beat: beatT }));
    twinkles.forEach(b => { b.material = b.userData.mat || (b.userData.mat = b.material.clone()); b.material.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 2 + b.userData.twinkle * 1.7); });
    sway.forEach(k => { k.rotation.z = Math.sin(t * 1.3 + k.userData.sway) * 0.15; });
    fires.forEach(f => { f.scale.setScalar(0.85 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7) * 0.07); });
    tiles.forEach(tl => { tl.material.emissive.setHex(want > 0 && Math.floor(t * 2 + tl.userData.k) % 3 === 0 ? 0x553311 : 0x000000); });
    beams.forEach(b => { b.material.opacity += ((showing ? 0.22 : want > 0 ? 0.1 : 0.03) - b.material.opacity) * Math.min(1, dt * 3); });
    if (ring) ring.material.opacity = 0.6 + 0.35 * Math.sin(t * 5);
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
    showing = true; guests.forEach(g => { g.actUntil = 0; }); // everyone turns to the stage
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
    showing = false; guests.forEach(g => { g.actUntil = 0; });
  }
  function stop() { show.token = null; showing = false; }
  function celebrate(id) {
    const item = pieces.get(id) || world.children.find(c => c.userData.item === id);
    if (building && item) { stage.pop(item); burst(item.position.x, 1, item.position.z, 14); return; }
    const b = ROOMS3D[id];
    let x, z;
    if (b) { x = (b[0] + b[2]) / 2; z = (b[1] + b[3]) / 2; } else if (item) { x = item.position.x; z = item.position.z; } else { x = 4; z = 3; }
    if (item) stage.pop(item);
    else world.children.filter(c => c.userData.room === id).forEach(c => stage.pop(c));
    flyTo({ cx: x, cz: z - 1, dist: Math.max(12, Math.min(20, view.dist)), pitch: 0.9 }, 700).then(() => burst(x, 1.5, z, 30));
  }
  function dispose() { show.token = null; stage.dispose(); }
  return {
    el, draw, show, stop, celebrate, snapshot: w => stage.snapshot(w), dispose, ready: islandReady, home: () => stage.goHome(700),
    build: { on: setBuild, ghost: ghostAt, turn, end: endGhost, pick, get state() { return ghostOf; }, get picked() { return picked; } },
    /* the cell in the middle of the view (where a new piece's ghost starts) */
    centre: () => ({ x: view.cx, z: view.cz }),
    /* look closer at a point (metres), as when a piece is picked up */
    focus: (x, z, dist = 13) => flyTo({ cx: x, cz: z, dist: Math.min(view.dist, dist) }, 600)
  };
}
