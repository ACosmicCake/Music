/* World Woodshed — the shared low-poly 3D kit, used by the Club (src/ui/club3d.js) and the garden island
   (src/ui/garden3d.js). three.js, loaded only with those chunks. Everything is built from primitives in code,
   original art.

   - Pieces: mat, glow, box, cyl, ball, group, at, shadows, label, person, potPlant, rnd, reduced, webglOK,
     the palette (HUES, SKIN, HAIR).
   - Stage({ onTap, light, home }) (light: 'evening', golden hour and the default, or 'day'): a canvas seen from high above at an angle, as in a life-sim game. One
     finger (or the mouse) turns it, a pinch or the wheel zooms, a double-tap goes back home, a tap calls
     onTap(point on the ground, event), and a mouse moving over it onHover(point, event). It holds the renderer, the camera, a golden-hour light (warm sky, a low
     sun that casts long shadows) and a loop that sleeps while the canvas is off screen or the page hidden. Returns
     { el (add the class lp-fill to fill its box's height instead of 4:3), canvas, scene, camera, view, hemi, sun (the moon or the sun: change them to set your own light), flyTo(v, ms), setHome(v), goHome(ms), onFrame(fn(dt, t, now)),
       busy(), particle(mesh, life, step), burst(x, y, z, n), pop(obj), snapshot(w), clear(group), dispose(), rayAt(x, y), groundAt(x, y) }. */
import * as THREE from 'three';

export const HUES = [0xe07a5f, 0x3d85c6, 0x81b29a, 0xf2cc8f, 0xc77dff, 0xe9c46a, 0x6c9a8b, 0xd4a5a5, 0xf4a261, 0x90be6d, 0x7fb7d9, 0xef8fa0];
export const SKIN = [0xf1c9a5, 0xe0ac7e, 0xc68642, 0xa0663e, 0x7a4a2a, 0xf6d7b8];
export const HAIR = [0x2b1d14, 0x6b3d1e, 0x111111, 0xa0522d, 0xd8c8a8, 0x888888];
export const DUSK = 0xe6a77f; // golden hour: the one look of the club and the island
export const rnd = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
export const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export function webglOK() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
}

/* ---------- the look: a warm storybook ----------
   Colours are softened toward warm paper (pastel), lit in a few painted bands (toon shading) and drawn with an
   ink line round every shape (the Stage's ink pass, from the depth of the scene). */
const PAPER = new THREE.Color(0xfff1dc);
let bands = null;
function toonBands() {
  if (bands) return bands;
  const d = new Uint8Array([96, 92, 104, 255, 160, 154, 156, 255, 218, 212, 206, 255, 255, 250, 240, 255]);
  bands = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat);
  bands.minFilter = bands.magFilter = THREE.NearestFilter;
  bands.generateMipmaps = false; bands.needsUpdate = true;
  return bands;
}
/* a colour as the storybook paints it: a little toward the paper */
export const pastel = color => new THREE.Color(color).lerp(PAPER, 0.08);

/* ---------- pieces ---------- */
const mats = new Map();
/* a shared painted material per colour and options (don't change it in place: clone it first) */
export const mat = (color, o = {}) => {
  const k = color + JSON.stringify(o);
  if (!mats.has(k)) {
    const opts = Object.assign({ flatShading: true, gradientMap: toonBands() }, o, { color: pastel(color) });
    if (o.emissive !== undefined) opts.emissive = new THREE.Color(o.emissive);
    mats.set(k, new THREE.MeshToonMaterial(opts));
  }
  return mats.get(k);
};
export const glow = color => mat(color, { emissive: color, emissiveIntensity: 0.9 });
const pick = (o, color) => (o && o.isMaterial ? o : mat(color, o));
/* a box standing on y (its base at y), a cylinder standing on y, a ball centred on y */
export function box(w, h, d, color, x = 0, y = 0, z = 0, o) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), pick(o, color)); m.position.set(x, y + h / 2, z); return m; }
export function cyl(rt, rb, h, color, x = 0, y = 0, z = 0, seg = 12, o) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), pick(o, color)); m.position.set(x, y + h / 2, z); return m; }
export function ball(r, color, x = 0, y = 0, z = 0, detail = 0, o) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, detail), pick(o, color)); m.position.set(x, y, z); return m; }
export const group = (...kids) => { const g = new THREE.Group(); kids.forEach(k => k && g.add(k)); return g; };
export const at = (g, x, z, rot = 0, y = 0) => { g.position.set(x, y, z); g.rotation.y = rot; return g; };
export const shadows = g => { g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g; };

/* a floating name tag that always faces the camera */
export function label(text, color = '#fff') {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const x = c.getContext('2d');
  x.fillStyle = 'rgba(20,24,40,0.72)'; x.beginPath(); if (x.roundRect) x.roundRect(4, 8, 248, 48, 22); else x.rect(4, 8, 248, 48); x.fill();
  x.fillStyle = color; x.font = '600 26px "Atkinson Hyperlegible", system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 128, 33);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false, transparent: true }));
  sp.scale.set(3.2, 0.8, 1); sp.renderOrder = 10;
  return sp;
}

/* a person about 1.35 m tall, feet at y 0, facing +z; userData has legs, arms, body and head to animate */
export function person(i, o = {}) {
  const r = rnd(1000 + i * 7919);
  const shirt = o.shirt ?? HUES[Math.floor(r() * HUES.length)], skin = o.skin ?? SKIN[Math.floor(r() * SKIN.length)], hair = o.hair ?? HAIR[Math.floor(r() * HAIR.length)];
  const legs = [-0.09, 0.09].map(x => { const l = box(0.11, 0.48, 0.12, o.pants ?? 0x2f3542); l.geometry.translate(0, -0.48, 0); l.position.set(x, 0.48, 0); return l; });
  const body = box(0.36, 0.5, 0.24, shirt, 0, 0.48, 0);
  const head = ball(0.16, skin, 0, 1.17, 0, 1);
  const cap = ball(0.17, hair, 0, 1.22, 0.02, 1); cap.scale.set(1, 0.7, 1);
  const arms = [-0.23, 0.23].map(x => { const a = box(0.09, 0.42, 0.1, shirt); a.geometry.translate(0, -0.42, 0); a.position.set(x, 0.96, 0); return a; });
  const g = group(...legs, body, head, cap, ...arms);
  g.userData = { legs, arms, body, head, phase: r() * 6.28 };
  return shadows(g);
}

/* a plant in a pot: leafy, monstera, lemon or fern */
export function potPlant(kind = 'leafy', s = 1) {
  const g = group(cyl(0.22, 0.16, 0.32, 0xc0673f));
  if (kind === 'monstera') { [[-0.2, 0.7, 0], [0.2, 0.75, 0.05], [0, 0.95, -0.1], [0.05, 0.6, 0.2]].forEach(([x, y, z], i) => { const l = ball(0.24, i % 2 ? 0x2e7d32 : 0x43a047, x, y, z); l.scale.set(1, 0.35, 1.3); l.rotation.set(0.4 * (i - 1.5), i, 0); g.add(l); }); g.add(cyl(0.02, 0.03, 0.6, 0x4e6b2e, 0, 0.3, 0)); }
  else if (kind === 'lemon') { g.add(cyl(0.04, 0.05, 0.6, 0x6d4c33, 0, 0.3, 0), ball(0.45, 0x4caf50, 0, 1.15, 0, 1)); [[0.3, 1.1, 0.2], [-0.25, 1.25, 0.25], [0.1, 1.0, -0.35]].forEach(p => g.add(ball(0.07, 0xf6d743, ...p))); }
  else if (kind === 'fern') { for (let i = 0; i < 7; i++) { const l = box(0.08, 0.02, 0.6, 0x5f9e55, 0, 0.35, 0); l.geometry.translate(0, 0, 0.3); l.rotation.set(-0.5, (i / 7) * Math.PI * 2, 0); g.add(l); } }
  else { g.add(ball(0.26, 0x43a047, 0, 0.62, 0), ball(0.2, 0x2e7d32, 0.15, 0.82, 0.05), ball(0.18, 0x4caf50, -0.14, 0.78, -0.08)); }
  g.scale.setScalar(s);
  return shadows(g);
}

/* ---------- the ink pass ----------
   The scene is drawn into a texture with its depth; a full-screen pass then lays it down with a dark warm line
   wherever the depth jumps (the outline of every shape), a soft paper grain and a warm vignette. One extra
   cheap pass, no second drawing of the scene. null where depth textures aren't there (plain drawing then). */
function inkPass(renderer) {
  const gl2 = renderer.capabilities.isWebGL2;
  if (!gl2 && !renderer.extensions.has('WEBGL_depth_texture')) return null;
  const target = new THREE.WebGLRenderTarget(4, 4, { samples: 0, type: THREE.UnsignedByteType });
  target.depthTexture = new THREE.DepthTexture(4, 4);
  target.texture.colorSpace = THREE.SRGBColorSpace;
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: { tColor: { value: target.texture }, tDepth: { value: target.depthTexture }, px: { value: new THREE.Vector2(1 / 4, 1 / 4) }, near: { value: 0.5 }, far: { value: 200 }, inkColor: { value: new THREE.Color(0x3a2a2e) }, width: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
      uniform sampler2D tColor; uniform sampler2D tDepth; uniform vec2 px; uniform float near; uniform float far; uniform vec3 inkColor; uniform float width;
      varying vec2 vUv;
      float lin(vec2 uv) { float z = texture2D(tDepth, uv).x * 2.0 - 1.0; return 2.0 * near * far / (far + near - z * (far - near)); }
      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main() {
        vec4 c = texture2D(tColor, vUv);
        float d = lin(vUv), o = px.x * width, q = px.y * width;
        float dl = lin(vUv - vec2(o, 0.0)), dr = lin(vUv + vec2(o, 0.0)), dd = lin(vUv - vec2(0.0, q)), du = lin(vUv + vec2(0.0, q));
        // the line where a nearer shape stands in front of a farther one, fading far away
        float jump = max(max(dl - d, dr - d), max(dd - d, du - d)) / d;
        float edge = smoothstep(0.012, 0.045, jump);
        // and where the paint changes sharply (a leg on the floor, a cushion on a sofa)
        vec3 W = vec3(0.299, 0.587, 0.114);
        float lx = abs(dot(texture2D(tColor, vUv + vec2(o, 0.0)).rgb, W) - dot(texture2D(tColor, vUv - vec2(o, 0.0)).rgb, W));
        float ly = abs(dot(texture2D(tColor, vUv + vec2(0.0, q)).rgb, W) - dot(texture2D(tColor, vUv - vec2(0.0, q)).rgb, W));
        edge = max(edge, smoothstep(0.16, 0.32, max(lx, ly)) * 0.55);
        edge *= 1.0 - smoothstep(45.0, 110.0, d);
        vec3 col = mix(c.rgb, inkColor, edge * 0.92);
        // paper: a fine grain and a warm vignette
        col *= 0.97 + 0.05 * hash(floor(vUv / px));
        vec2 v = vUv - 0.5; col = mix(col, col * vec3(0.92, 0.84, 0.78), smoothstep(0.35, 0.8, dot(v, v) * 2.2));
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
    depthTest: false, depthWrite: false
  }));
  quad.frustumCulled = false;
  const post = new THREE.Scene(); post.add(quad);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const u = quad.material.uniforms;
  return {
    size(w, h) { target.setSize(w, h); target.depthTexture.image.width = w; target.depthTexture.image.height = h; u.px.value.set(1 / w, 1 / h); u.width.value = Math.max(1.6, renderer.getPixelRatio() * 1.1); },
    render(scene, camera) {
      u.near.value = camera.near; u.far.value = camera.far;
      renderer.setRenderTarget(target); renderer.render(scene, camera);
      renderer.setRenderTarget(null); renderer.render(post, cam);
    },
    dispose() { target.dispose(); quad.geometry.dispose(); quad.material.dispose(); }
  };
}

/* ---------- the stage ---------- */
export const DAY = 0x9fd3ea;
export function Stage({ onTap, onHover, light = 'evening', home: home0 } = {}) {
  const day = light === 'day', background = day ? DAY : DUSK;
  const el = document.createElement('div');
  el.className = 'lp-wrap';
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const ink = inkPass(renderer);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.className = 'lp-canvas';
  canvas.style.touchAction = 'none';
  el.append(canvas);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);
  scene.fog = new THREE.Fog(background, 45, 90);
  const camera = new THREE.PerspectiveCamera(38, 4 / 3, 0.5, 200);
  const hemi = day ? new THREE.HemisphereLight(0xdff2ff, 0x6b8a4e, 1.9) : new THREE.HemisphereLight(0xffd6b0, 0x4a3d55, 1.5);
  const moon = day ? new THREE.DirectionalLight(0xfff1d6, 2.4) : new THREE.DirectionalLight(0xffb878, 2.3);
  moon.position.set(-14, 26, -10);
  moon.castShadow = true;
  moon.shadow.mapSize.set(1024, 1024);
  Object.assign(moon.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 80 });
  scene.add(hemi, moon, moon.target);
  const fx = new THREE.Group();
  scene.add(fx);

  /* the camera: yaw turns around the point (cx, cz), pitch is how high above, dist how far */
  const view = { yaw: -0.35, pitch: 0.95, dist: 26, cx: 0, cz: 0 };
  let home = Object.assign({}, view, home0), target = null, idleAt = 0;
  Object.assign(view, home);
  function placeCamera() {
    const { yaw, pitch, dist, cx, cz } = view;
    camera.position.set(cx + Math.sin(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist, cz - Math.cos(yaw) * Math.cos(pitch) * dist);
    camera.lookAt(cx, 0.8, cz);
    moon.target.position.set(cx, 0, cz); moon.position.set(cx - 26, 16, cz - 8); // low in the west: long warm shadows
  }
  function flyTo(v, ms = 1000) {
    if (reduced() || !ms) { Object.assign(view, v); target = null; return Promise.resolve(); }
    return new Promise(res => { target = { from: Object.assign({}, view), to: Object.assign({}, view, v), t0: performance.now(), ms, res }; });
  }
  const setHome = v => { home = Object.assign({}, home, v); };

  // touch and mouse
  const ptrs = new Map();
  let downAt = null, moved = 0, pinch0 = 0, dist0 = 0;
  canvas.addEventListener('pointerdown', e => { try { canvas.setPointerCapture(e.pointerId); } catch (x) { /* synthetic */ } ptrs.set(e.pointerId, [e.clientX, e.clientY]); downAt = [e.clientX, e.clientY]; moved = 0; if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); dist0 = view.dist; } });
  canvas.addEventListener('pointermove', e => {
    if (!ptrs.has(e.pointerId)) { if (onHover && e.pointerType === 'mouse') { const p = groundAt(e.clientX, e.clientY); if (p) onHover(p, e); } return; }
    const prev = ptrs.get(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    target = null; idleAt = performance.now();
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch0 && d) view.dist = Math.max(8, Math.min(80, dist0 * pinch0 / d)); moved = 99; return; }
    const dx = e.clientX - prev[0], dy = e.clientY - prev[1];
    moved += Math.abs(dx) + Math.abs(dy);
    view.yaw += dx * 0.008;
    view.pitch = Math.max(0.5, Math.min(1.35, view.pitch + dy * 0.004));
  });
  const up = e => { ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch0 = 0; if (downAt && moved < 8 && e.type === 'pointerup') tap(e); downAt = null; };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', e => { e.preventDefault(); target = null; idleAt = performance.now(); view.dist = Math.max(8, Math.min(80, view.dist * (1 + Math.sign(e.deltaY) * 0.1))); }, { passive: false });
  canvas.addEventListener('dblclick', () => flyTo(home, 700));
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  /* the raycaster through a point of the screen, and the point on the ground there */
  function rayAt(cx, cy) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    return ray;
  }
  function groundAt(cx, cy) { const p = new THREE.Vector3(); return rayAt(cx, cy).ray.intersectPlane(ground, p) ? p : null; }
  function tap(e) {
    if (!onTap) return;
    const p = groundAt(e.clientX, e.clientY);
    if (p) onTap(p, e);
  }

  /* effects: a particle is any mesh with a life in seconds and step(mesh, 0..1, dt) */
  function particle(mesh, life, step) { mesh.userData.fx = { age: 0, life, step }; fx.add(mesh); return mesh; }
  function burst(x, y, z, n = 26, colors = [0x6abf69, 0xf6d743]) {
    if (reduced()) return;
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(new THREE.TetrahedronGeometry(0.12), i % 3 ? mat(colors[0]) : glow(colors[1]));
      const v = [(Math.random() - 0.5) * 6, 3 + Math.random() * 4, (Math.random() - 0.5) * 6];
      m.position.set(x, y, z);
      particle(m, 1.6, (o, k, dt) => { o.position.x += v[0] * dt; o.position.y += v[1] * dt; o.position.z += v[2] * dt; v[1] -= 9 * dt; o.rotation.x += dt * 6; o.rotation.y += dt * 4; });
    }
  }
  /* grow: something new springs up from nothing with a little overshoot */
  function pop(obj, ms = 700) {
    if (!obj || reduced()) return;
    const s = obj.scale.x || 1;
    obj.scale.setScalar(0.01);
    particle(new THREE.Object3D(), ms / 1000, (o, k) => { const e = k < 1 ? 1 + Math.sin(k * Math.PI) * 0.3 * (1 - k) : 1; obj.scale.setScalar(Math.max(0.01, s * Math.min(1, k * 1.5) * e)); if (k >= 0.99) obj.scale.setScalar(s); });
  }

  /* the loop */
  const frames = new Set();
  let raf = 0, last = performance.now(), visible = true, fitted = '';
  const io = typeof IntersectionObserver === 'function' ? new IntersectionObserver(es => { visible = es.some(e => e.isIntersecting); wake(); }) : null;
  if (io) io.observe(el);
  function fit() {
    const w = el.clientWidth || 360, h = el.classList.contains('lp-fill') && el.clientHeight ? el.clientHeight : Math.round(w * 0.75), key = w + 'x' + h;
    if (key === fitted) return;
    fitted = key; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (ink) ink.size(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
  }
  function frame(now) {
    raf = 0;
    if (!el.isConnected || !visible || document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000), t = now / 1000;
    last = now;
    fit();
    if (target) {
      const k = Math.min(1, (now - target.t0) / target.ms), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      Object.keys(target.to).forEach(key => { view[key] = target.from[key] + (target.to[key] - target.from[key]) * e; });
      if (k >= 1) { const r = target.res; target = null; r(); }
    } else if (!reduced() && !ptrs.size && now - idleAt > 6000) view.yaw += dt * 0.03; // a slow turn when left alone
    placeCamera();
    frames.forEach(fn => { try { fn(dt, t, now); } catch (e) { console.error(e); } });
    for (let i = fx.children.length - 1; i >= 0; i--) {
      const f = fx.children[i], u = f.userData.fx;
      u.age += dt;
      if (u.age >= u.life) { u.step(f, 1, dt); fx.remove(f); if (f.geometry) f.geometry.dispose(); continue; }
      u.step(f, u.age / u.life, dt);
    }
    if (ink) ink.render(scene, camera); else renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function wake() { if (!raf && visible && !document.hidden && el.isConnected !== false) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  document.addEventListener('visibilitychange', wake);
  raf = requestAnimationFrame(frame);

  function clear(g) { while (g.children.length) { const c = g.children.pop(); c.traverse(o => { if (o.geometry) o.geometry.dispose(); }); } }
  /* a small picture of the scene (JPEG data URL) */
  function snapshot(w = 360) {
    try {
      const c = document.createElement('canvas'); c.width = w; c.height = Math.round(w * 0.75);
      c.getContext('2d').drawImage(canvas, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', 0.72);
    } catch (e) { return null; }
  }
  function dispose() {
    cancelAnimationFrame(raf); raf = 0; frames.clear();
    document.removeEventListener('visibilitychange', wake);
    if (io) io.disconnect();
    scene.traverse(o => { if (o.geometry) o.geometry.dispose(); });
    if (ink) ink.dispose();
    renderer.dispose();
  }
  return {
    el, canvas, scene, camera, view, hemi, sun: moon, flyTo, setHome, goHome: (ms = 700) => flyTo(home, ms), get home() { return home; }, get flying() { return !!target; },
    onFrame(fn) { frames.add(fn); wake(); return () => frames.delete(fn); }, busy: () => ptrs.size > 0,
    particle, burst, pop, snapshot, clear, dispose, wake, rayAt, groundAt
  };
}

export { THREE };
