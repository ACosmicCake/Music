/* World Woodshed — the garden island drawn flat (SVG), for phones and anywhere the 3D scenes are off
   (src/ui/scenes3d.js). The same island as the 3D one: every place comes from src/islandmap.js, seen from the
   same side (the Club's front, south, nearest; east on the left, as the 3D camera has it). The sea and its
   shallows, the beach and its litter, the lawn, one tree, kelp plant or crate of bottles per order, the sapling
   toward the next, the pond at ten trees, the animals that live there (src/ecosystem.js, drawn from their look in
   src/folklook.js), and the Club on its lot with the rooms you have built and tonight's guests at the door.
   Everything is drawn in code and original. Gentle CSS motion only, none with reduced motion. */
import { s } from './core.js';
import Eco from '../ecosystem.js';
import M from '../islandmap.js';
import { LOOK } from '../folklook.js';
import './islandflat.css';

const K = 0.6;                                  // how much the ground is foreshortened (seen from high up)
const X = x => -(x - M.C.x);                    // east on the left, as the 3D camera sees it
const Y = z => (M.C.z - z) * K;                 // north at the top
const TREE = 2.7, LIFE = 1.9;                   // trees and animals drawn larger than life, to read at this size
const f1 = v => Math.round(v * 10) / 10;
const VIEW = { x: -52, y: -31, w: 104, h: 60 };

const COL = {
  sea: '#4fb0c3', seaFar: '#3a8fae', shallow: '#8fd3d0', foam: '#e9f7f2', sandWet: '#d9c79c', sand: '#efe0b6', cliff: '#c9ab78',
  grass: '#79b65a', grassEdge: '#5e9446', grassDry: '#bdb066', grassDryEdge: '#9c8f4c',
  leaf: ['#5f9e4f', '#4a8a46', '#7aab4a'], leafDry: '#b59a4a', trunk: '#8a6440', kelp: '#9b8430', float: '#c49a35',
  rock: '#a3a094', pond: '#5aa9bf', reed: '#7c9a3c', bottle: '#a8dcd4', cap: '#2f7d95', crate: '#a77a4b',
  wall: '#f3e6cf', wallShade: '#e2cfae', roof: { cafe: '#d0704f', kitchen: '#b85c45', jazzbar: '#5a4a7a', school: '#6c9a8b', hall: '#c98a3a', roof: '#bfe3ea', studio: '#3d5a80' },
  window: '#ffd98a', door: '#7a5233', ink: '#4a3a2c'
};

/* ---------- little drawings ---------- */
const poly = (pts, attrs) => s('polygon', Object.assign({ points: pts.map(p => f1(p[0]) + ',' + f1(p[1])).join(' ') }, attrs));
const coastPts = (sc, dy = 0, seg = 72) => { const out = []; for (let i = 0; i < seg; i++) { const p = M.coast((i / seg) * Math.PI * 2, sc); out.push([X(p.x), Y(p.z) + dy]); } return out; };
// motion goes on a wrapper, since a CSS transform would replace the drawing's own transform attribute
const sway = (el, i) => { const w = s('g', { class: 'if-sway' }); w.style.animationDelay = (-(i * 0.73) % 5).toFixed(2) + 's'; w.append(el); return w; };

function tree(x, y, size, v, wilted, faded) {
  const leaf = wilted ? COL.leafDry : COL.leaf[v % 3], k = v % 4, sc = size * TREE;
  const g = s('g', { transform: 'translate(' + f1(x) + ' ' + f1(y) + ') scale(' + f1(sc * 10) / 10 + ')', class: 'if-tree' + (faded ? ' if-test' : '') });
  g.append(s('ellipse', { cx: 0, cy: 0, rx: 0.55, ry: 0.22, class: 'if-shadow' }));
  if (k === 2) { // a palm
    g.append(s('path', { d: 'M0 0 Q0.25 -1 0.15 -2.1', class: 'if-trunk', stroke: COL.trunk }));
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.62; g.append(s('path', { d: 'M0.15 -2.1 q' + f1(Math.cos(a) * 0.6) + ' ' + f1(Math.sin(a) * 0.6 - 0.15) + ' ' + f1(Math.cos(a) * 1.1) + ' ' + f1(Math.sin(a) * 0.6 + 0.35), class: 'if-frond', stroke: leaf })); }
  } else {
    g.append(s('path', { d: 'M0 0 L0 -0.9', class: 'if-trunk', stroke: COL.trunk }));
    if (k === 0) [[0.62, -0.5, 0.75], [0.48, -1.0, 0.6], [0.32, -1.45, 0.5]].forEach(([w, top, hgt]) => g.append(poly([[-w, top + hgt * 0.4], [w, top + hgt * 0.4], [0, top - hgt]], { fill: leaf, class: 'if-leaf' })));
    else if (k === 1) { g.append(s('circle', { cx: -0.32, cy: -0.95, r: 0.42, fill: leaf, class: 'if-leaf' }), s('circle', { cx: 0.34, cy: -0.98, r: 0.4, fill: leaf, class: 'if-leaf' }), s('circle', { cx: 0, cy: -1.3, r: 0.55, fill: leaf, class: 'if-leaf' })); }
    else g.append(s('ellipse', { cx: 0, cy: -1.25, rx: 0.4, ry: 0.72, fill: leaf, class: 'if-leaf' }));
  }
  return g;
}
function kelp(x, y, size, v, faded) {
  const g = s('g', { transform: 'translate(' + f1(x) + ' ' + f1(y) + ') scale(' + f1(size * 2) + ')', class: 'if-kelp' + (faded ? ' if-test' : '') });
  const n = 3 + (v % 2);
  for (let i = 0; i < n; i++) {
    const dx = (i - (n - 1) / 2) * 0.35;
    g.append(s('path', { d: 'M' + f1(dx) + ' 0 q0.3 -0.5 0 -1 t0 -1', class: 'if-frond', stroke: COL.kelp }), s('circle', { cx: f1(dx), cy: -2, r: 0.14, fill: COL.float }));
  }
  g.append(s('ellipse', { cx: 0, cy: 0, rx: 0.9, ry: 0.22, class: 'if-ripple' }));
  return sway(g, v);
}
function crate(x, y, faded) {
  const g = s('g', { transform: 'translate(' + f1(x) + ' ' + f1(y) + ') scale(1.6)', class: faded ? 'if-test' : '' });
  for (let i = 0; i < 3; i++) g.append(s('rect', { x: -0.55 + i * 0.4, y: -1.05, width: 0.24, height: 0.6, rx: 0.08, fill: COL.bottle, stroke: COL.cap, 'stroke-width': 0.06 }));
  g.append(s('rect', { x: -0.7, y: -0.55, width: 1.4, height: 0.55, fill: COL.crate, stroke: COL.ink, 'stroke-width': 0.06 }));
  return g;
}
const litter = (x, y, rot) => s('g', { transform: 'translate(' + f1(x) + ' ' + f1(y) + ') scale(1.5) rotate(' + Math.round(rot * 57) % 180 + ')' },
  s('rect', { x: -0.35, y: -0.12, width: 0.55, height: 0.24, rx: 0.1, fill: COL.bottle, stroke: COL.cap, 'stroke-width': 0.05 }), s('rect', { x: 0.2, y: -0.06, width: 0.18, height: 0.12, fill: COL.cap }));

function sapling(x, y, frac, wilted) {
  const hgt = 0.5 + frac * 1.8, g = s('g', { transform: 'translate(' + f1(x) + ' ' + f1(y) + ') scale(1.8)', class: 'if-sapling' + (wilted ? ' if-thirsty' : '') });
  g.append(s('path', { d: wilted ? 'M0 0 Q0 ' + f1(-hgt * 0.7) + ' ' + f1(hgt * 0.3) + ' ' + f1(-hgt * 0.8) : 'M0 0 L0 ' + f1(-hgt), class: 'if-stem' }));
  const n = Math.max(1, Math.min(8, Math.floor(frac * 9)));
  for (let i = 0; i < n; i++) { const yy = -hgt * (i + 1) / (n + 1), sd = i % 2 ? 1 : -1, dr = wilted ? 0.35 : -0.25; g.append(s('path', { d: 'M0 ' + f1(yy) + ' q' + f1(sd * 0.3) + ' ' + dr + ' ' + f1(sd * 0.55) + ' ' + f1(dr + 0.05), class: 'if-sprout' })); }
  return g;
}

/* one animal, about a metre across, from its look (fur and what sits on its head) */
const SEA = { fish: 1, jellyfish: 1, otter: 1, turtle: 1, dolphin: 1, whale: 1 };
export function critter(id, x, y, o = {}) {
  const look = LOOK[id] || ['#c9a27a', 'round'], fur = look[0], sc = f1((o.sc || 1) * LIFE * 10) / 10;
  const g = s('g', { transform: 'translate(' + f1(x) + ' ' + f1(y) + ') scale(' + (o.flip ? -sc : sc) + ' ' + sc + ')', class: 'if-critter' });
  const eye = (cx, cy) => s('circle', { cx, cy, r: 0.07, fill: COL.ink });
  if (SEA[id]) {
    if (id === 'fish') g.append(s('path', { d: 'M-0.4 0 Q0 -0.3 0.35 0 Q0 0.3 -0.4 0 Z M0.35 0 L0.6 -0.2 L0.6 0.2 Z', fill: fur }), eye(-0.22, -0.04));
    else if (id === 'jellyfish') g.append(s('path', { d: 'M-0.4 0 A0.4 0.4 0 0 1 0.4 0 Z', fill: fur, opacity: 0.85 }), s('path', { d: 'M-0.25 0 q0.05 0.3 0 0.5 M0 0 q0.05 0.3 0 0.55 M0.25 0 q0.05 0.3 0 0.5', class: 'if-line', stroke: fur }));
    else if (id === 'otter') g.append(s('ellipse', { cx: 0, cy: 0, rx: 0.6, ry: 0.2, fill: fur }), s('circle', { cx: -0.5, cy: -0.2, r: 0.28, fill: fur }), s('circle', { cx: -0.7, cy: -0.42, r: 0.09, fill: fur }), s('circle', { cx: -0.35, cy: -0.42, r: 0.09, fill: fur }), eye(-0.58, -0.22));
    else if (id === 'turtle') g.append(s('ellipse', { cx: 0, cy: 0, rx: 0.7, ry: 0.4, fill: '#6f8f4a', stroke: '#4f6a34', 'stroke-width': 0.08 }), s('circle', { cx: -0.8, cy: -0.05, r: 0.2, fill: fur }), eye(-0.85, -0.1));
    else if (id === 'dolphin') g.append(s('path', { d: 'M-1 0.1 Q-0.2 -0.9 0.9 0.1 Q0.2 -0.3 -1 0.1 Z', fill: fur }), s('path', { d: 'M0 -0.45 L0.15 -0.75 L0.3 -0.42 Z', fill: fur }));
    else if (id === 'whale') g.append(s('path', { d: 'M-2 0.2 Q0 -1.1 2 0.2 Z', fill: fur }), s('path', { d: 'M-1.3 -0.5 q-0.2 -0.6 0.1 -0.9 M-1.3 -0.5 q0.3 -0.6 -0.1 -0.9', class: 'if-spout' }), eye(-1.2, -0.2));
    return g;
  }
  if (id === 'butterfly' || id === 'dragonfly' || id === 'bee' || id === 'ladybird') {
    const wing = { butterfly: '#f2a65a', dragonfly: '#cfe8ff', bee: '#ffffff', ladybird: '#d9473c' }[id];
    if (id === 'ladybird') g.append(s('circle', { cx: 0, cy: 0, r: 0.3, fill: wing }), s('circle', { cx: -0.25, cy: 0, r: 0.13, fill: fur }), s('circle', { cx: 0.08, cy: -0.1, r: 0.06, fill: fur }));
    else g.append(s('ellipse', { cx: -0.2, cy: -0.25, rx: 0.3, ry: 0.22, fill: wing, opacity: 0.9, class: 'if-wing' }), s('ellipse', { cx: 0.2, cy: -0.25, rx: 0.3, ry: 0.22, fill: wing, opacity: 0.9, class: 'if-wing' }), s('ellipse', { cx: 0, cy: 0, rx: id === 'dragonfly' ? 0.5 : 0.22, ry: 0.1, fill: fur }));
    return g;
  }
  if (id === 'starfish') { g.append(poly([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.16 : 0.42; return [Math.cos(a) * r, Math.sin(a) * r * 0.7]; }), { fill: fur })); return g; }
  // a body, a head, and what sits on it
  const birdy = look[1] === 'beak', small = { snail: 0.7, crab: 0.8, hedgehog: 0.8, frog: 0.8, songbird: 0.7, kingfisher: 0.7 }[id] || 1;
  const big = { bear: 1.5, deer: 1.3, boar: 1.2, heron: 1.2, pelican: 1.2, peacock: 1.1 }[id] || 1, k = small * big;
  const b = s('g', { transform: 'scale(' + k + ')' });
  if (id === 'snail') b.append(s('circle', { cx: 0.15, cy: -0.35, r: 0.32, fill: '#c98f5a', stroke: '#8a5a32', 'stroke-width': 0.07 }), s('ellipse', { cx: 0, cy: -0.05, rx: 0.55, ry: 0.12, fill: fur }));
  else if (id === 'crab') b.append(s('ellipse', { cx: 0, cy: -0.25, rx: 0.45, ry: 0.25, fill: fur }), s('path', { d: 'M-0.45 -0.3 l-0.25 -0.25 M0.45 -0.3 l0.25 -0.25 M-0.3 -0.1 l-0.2 0.15 M0.3 -0.1 l0.2 0.15', class: 'if-line', stroke: fur }));
  else b.append(s('ellipse', { cx: 0, cy: -0.4, rx: birdy ? 0.32 : 0.36, ry: 0.4, fill: fur }));
  if (id === 'peacock') b.append(s('path', { d: 'M0.2 -0.4 Q1 -1.4 1.1 -0.2 Z', fill: '#3f8f6a', stroke: '#2a6fb0', 'stroke-width': 0.08 }));
  if (id === 'squirrel' || id === 'fox') b.append(s('path', { d: 'M0.3 -0.3 Q0.9 -0.5 0.6 -1.0', class: 'if-tail', stroke: fur }));
  if (id === 'hedgehog') b.append(s('path', { d: 'M-0.35 -0.5 l0.1 -0.25 l0.1 0.2 l0.1 -0.25 l0.1 0.2 l0.1 -0.25 l0.1 0.2 l0.1 -0.2', class: 'if-line', stroke: '#7a5a3a' }));
  const hx = birdy ? -0.15 : 0, hy = id === 'snail' ? -0.35 : id === 'crab' ? -0.35 : -0.95, hr = id === 'crab' || id === 'snail' ? 0 : 0.28;
  if (hr) b.append(s('circle', { cx: hx, cy: hy, r: hr, fill: fur }));
  const top = hy - hr;
  const kind = look[1];
  if (kind === 'long') b.append(s('ellipse', { cx: hx - 0.12, cy: top - 0.25, rx: 0.08, ry: 0.28, fill: fur }), s('ellipse', { cx: hx + 0.12, cy: top - 0.25, rx: 0.08, ry: 0.28, fill: fur }));
  else if (kind === 'point') b.append(poly([[hx - 0.28, top + 0.12], [hx - 0.08, top + 0.02], [hx - 0.22, top - 0.25]], { fill: fur }), poly([[hx + 0.28, top + 0.12], [hx + 0.08, top + 0.02], [hx + 0.22, top - 0.25]], { fill: fur }));
  else if (kind === 'round') b.append(s('circle', { cx: hx - 0.22, cy: top + 0.05, r: 0.1, fill: fur }), s('circle', { cx: hx + 0.22, cy: top + 0.05, r: 0.1, fill: fur }));
  else if (kind === 'beak') b.append(poly([[hx - hr + 0.02, hy - 0.05], [hx - hr - 0.25, hy + (id === 'pelican' ? 0.2 : 0.02)], [hx - hr + 0.02, hy + 0.08]], { fill: '#f2a93b' }));
  else if (kind === 'antlers') b.append(s('path', { d: 'M' + f1(hx - 0.1) + ' ' + f1(top) + ' l-0.15 -0.35 m0.07 0.15 l-0.18 -0.05 M' + f1(hx + 0.1) + ' ' + f1(top) + ' l0.15 -0.35 m-0.07 0.15 l0.18 -0.05', class: 'if-line', stroke: '#8a6440' }));
  else if (kind === 'stalks') { const sx = id === 'snail' ? -0.45 : 0, sy = id === 'snail' ? -0.1 : -0.45; b.append(s('path', { d: 'M' + (sx - 0.08) + ' ' + sy + ' l-0.05 -0.3 M' + (sx + 0.08) + ' ' + sy + ' l0.05 -0.3', class: 'if-line', stroke: fur }), eye(sx - 0.13, sy - 0.3), eye(sx + 0.13, sy - 0.3)); }
  else if (kind === 'eyes') b.append(s('circle', { cx: hx - 0.13, cy: top + 0.02, r: 0.1, fill: fur }), s('circle', { cx: hx + 0.13, cy: top + 0.02, r: 0.1, fill: fur }));
  if (hr) b.append(eye(hx - 0.1, hy - 0.02), eye(hx + 0.1, hy - 0.02));
  g.append(b);
  return g;
}

/* ---------- the Club on its lot: one block per room built, seen from the front and above ---------- */
const HEIGHT = { cafe: 2.8, kitchen: 2.8, jazzbar: 3.4, school: 2.8, hall: 4, roof: 3, studio: 3.2 };
function room(id, rect) {
  const [x0, z0, x1, z1] = rect, L = X(x1), R = X(x0), F = Y(z0), B = Y(z1), g = s('g', { class: 'if-room', 'data-room': id });
  if (id === 'courtyard') { // open to the sky: a terrace, a fence, tables under parasols
    g.append(poly([[L, B], [R, B], [R, F], [L, F]], { fill: '#d8c59a' }));
    for (let x = L + 0.4; x < R; x += 0.8) g.append(s('rect', { x: f1(x), y: f1(F - 0.8), width: 0.18, height: 0.8, fill: '#a6845a' }));
    g.append(s('rect', { x: f1(L), y: f1(F - 0.65), width: f1(R - L), height: 0.12, fill: '#a6845a' }));
    [0.3, 0.7].forEach((fx, i) => { const cx = L + (R - L) * fx, cy = F - (F - B) * (0.55 - i * 0.1); g.append(s('path', { d: 'M' + f1(cx) + ' ' + f1(cy) + ' l0 -1.6', class: 'if-line', stroke: '#7a5233' }), s('path', { d: 'M' + f1(cx - 1.1) + ' ' + f1(cy - 1.4) + ' Q' + f1(cx) + ' ' + f1(cy - 2.4) + ' ' + f1(cx + 1.1) + ' ' + f1(cy - 1.4) + ' Z', fill: i ? '#e07a5f' : '#f2cc8f' })); });
    return g;
  }
  const H = HEIGHT[id] || 3, glass = id === 'roof';
  // the roof (seen from above), then the front wall with its windows and, for the café, the door
  g.append(poly([[L, B - H], [R, B - H], [R, F - H], [L, F - H]], { fill: COL.roof[id] || '#c0704f', class: glass ? 'if-glass' : '' }));
  if (!glass) for (let y = B - H + 0.7; y < F - H - 0.2; y += 0.7) g.append(s('path', { d: 'M' + f1(L + 0.2) + ' ' + f1(y) + ' L' + f1(R - 0.2) + ' ' + f1(y), class: 'if-tiles' }));
  else for (let x = L + 1.5; x < R; x += 1.5) g.append(s('path', { d: 'M' + f1(x) + ' ' + f1(B - H) + ' L' + f1(x) + ' ' + f1(F - H), class: 'if-mullion' }));
  g.append(s('rect', { x: f1(L), y: f1(F - H), width: f1(R - L), height: f1(H), fill: glass ? '#d6eef2' : COL.wall, class: glass ? 'if-glass' : '' }));
  g.append(s('rect', { x: f1(L), y: f1(F - H), width: f1(R - L), height: 0.35, fill: COL.wallShade }));
  const n = Math.max(1, Math.floor((R - L) / 2.2));
  for (let i = 0; i < n; i++) {
    const cx = L + (R - L) * (i + 0.5) / n;
    if (id === 'cafe' && i === Math.floor(n / 2)) { g.append(s('rect', { x: f1(cx - 0.5), y: f1(F - 1.9), width: 1, height: 1.9, rx: 0.4, fill: COL.door }), s('rect', { x: f1(cx - 0.9), y: f1(F - H + 0.5), width: 1.8, height: 0.55, rx: 0.15, fill: '#2f6f5e' })); continue; }
    g.append(s('rect', { x: f1(cx - 0.45), y: f1(F - H + 0.9), width: 0.9, height: f1(H * 0.38), rx: 0.15, fill: COL.window, class: 'if-window' }));
  }
  if (id === 'kitchen') g.append(s('rect', { x: f1(R - 1.2), y: f1(B - H - 1.2), width: 0.6, height: 1.4, fill: '#8a6d5b' }));
  return g;
}

/* ---------- the whole island ---------- */
/* { planted, wilted, next: { kind, frac } | null, rooms: [{ id, rect }], guests: [animal id], residents, onClub,
   onIsland, big } → an <svg> */
export function IslandFlat(o = {}) {
  const planted = o.planted || [], wilted = !!o.wilted, c = Eco.counts(planted);
  const rs = o.residents || Eco.residents(c, { wilted });
  const svg = s('svg', { viewBox: VIEW.x + ' ' + VIEW.y + ' ' + VIEW.w + ' ' + VIEW.h, class: 'if-svg' + (o.big ? ' if-big' : ''), role: 'img', 'aria-label': ariaOf(c, rs, o) });
  const defs = s('defs', null,
    s('linearGradient', { id: 'if-sea', x1: 0, y1: 0, x2: 0, y2: 1 }, s('stop', { offset: 0, 'stop-color': COL.seaFar }), s('stop', { offset: 1, 'stop-color': COL.sea })),
    s('radialGradient', { id: 'if-glow', cx: 0.5, cy: 0.45, r: 0.7 }, s('stop', { offset: 0.6, 'stop-color': '#000', 'stop-opacity': 0 }), s('stop', { offset: 1, 'stop-color': '#3a2410', 'stop-opacity': 0.22 })));
  svg.append(defs, s('rect', { x: VIEW.x, y: VIEW.y, width: VIEW.w, height: VIEW.h, fill: 'url(#if-sea)' }));
  // waves drifting on the sea
  const r = Eco.rng(31), waves = s('g', { class: 'if-waves' });
  for (let i = 0; i < 26; i++) { const x = VIEW.x + r() * VIEW.w, y = VIEW.y + r() * VIEW.h; if (M.inside(-x + M.C.x, M.C.z - y / K, 1.2)) continue; waves.append(s('path', { d: 'M' + f1(x) + ' ' + f1(y) + ' q0.8 -0.5 1.6 0 t1.6 0', class: 'if-wave' })); }
  svg.append(waves);
  // the ground: shallows, wet sand, the beach's edge and the beach, the lawn's edge and the lawn
  const dry = wilted;
  svg.append(
    poly(coastPts(1.3), { fill: COL.shallow, opacity: 0.55 }),
    poly(coastPts(1.14), { fill: COL.sandWet }),
    poly(coastPts(1.08, 1.2), { fill: COL.cliff }),
    poly(coastPts(1.08), { fill: COL.sand }),
    poly(coastPts(0.95, 0.5), { fill: dry ? COL.grassDryEdge : COL.grassEdge }),
    poly(coastPts(0.95), { fill: dry ? COL.grassDry : COL.grass, class: 'if-lawn' }));
  // light and shade on the lawn, tufts and flowers, rocks along the shore (the same every time)
  const cover = s('g', { class: 'if-cover' });
  const pr = Eco.rng(41);
  for (let i = 0; i < 16; i++) { const x = M.BOUNDS[0] + pr() * (M.BOUNDS[1] - M.BOUNDS[0]), z = M.BOUNDS[2] + pr() * (M.BOUNDS[3] - M.BOUNDS[2]); if (!M.inside(x, z, 0.8) || M.inLot(x, z, 2)) continue; cover.append(s('ellipse', { cx: f1(X(x)), cy: f1(Y(z)), rx: f1(4 + pr() * 6), ry: f1((2 + pr() * 3) * K), class: 'if-patch' + (i % 2 ? ' dark' : '') + (dry ? ' dry' : '') })); }
  for (let i = 0; i < 90; i++) {
    const x = M.BOUNDS[0] + r() * (M.BOUNDS[1] - M.BOUNDS[0]), z = M.BOUNDS[2] + r() * (M.BOUNDS[3] - M.BOUNDS[2]);
    if (!M.inside(x, z, 0.9) || M.inLot(x, z, 1) || M.nearPond(x, z, 1)) continue;
    if (i % 3 === 1) cover.append(s('circle', { cx: f1(X(x)), cy: f1(Y(z)), r: 0.28, fill: ['#f2d24a', '#e07ab0', '#ffffff', '#c77dff'][i % 4] }));
    else cover.append(s('path', { d: 'M' + f1(X(x) - 0.4) + ' ' + f1(Y(z)) + ' l0.2 -0.6 l0.2 0.6 l0.2 -0.7 l0.2 0.7', class: 'if-tuft' + (dry ? ' dry' : '') }));
  }
  for (let i = 0; i < 14; i++) { const a = r() * Math.PI * 2, p = M.coast(a, 1.03 + r() * 0.04); if (M.inLot(p.x, p.z, 4)) continue; cover.append(s('ellipse', { cx: f1(X(p.x)), cy: f1(Y(p.z)), rx: f1(0.7 + r() * 0.8), ry: 0.45, fill: COL.rock })); }
  svg.append(cover);
  // the pond, once the wood holds enough rain
  if (c.tree >= M.POND_TREES) {
    const px = X(M.POND.x), py = Y(M.POND.z), pr = M.POND.r;
    svg.append(s('g', { class: 'if-pond' },
      s('ellipse', { cx: f1(px), cy: f1(py), rx: f1(pr + 0.5), ry: f1((pr + 0.5) * K), fill: COL.sandWet }),
      s('ellipse', { cx: f1(px), cy: f1(py), rx: f1(pr), ry: f1(pr * K), fill: COL.pond }),
      s('ellipse', { cx: f1(px - 1), cy: f1(py + 0.4), rx: 0.45, ry: 0.25, fill: '#5e9e4a' }), s('ellipse', { cx: f1(px + 0.9), cy: f1(py - 0.5), rx: 0.4, ry: 0.22, fill: '#5e9e4a' }),
      [0, 1, 2, 3, 4].map(i => { const a = i * 0.9 + 0.3, x = px + Math.cos(a) * (pr + 0.2), y = py + Math.sin(a) * (pr + 0.2) * K; return s('path', { d: 'M' + f1(x) + ' ' + f1(y) + ' l0 -1.1', class: 'if-reed' }); })));
  }

  // what stands on the ground, back to front: plants, crates, litter, the Club, the animals
  const items = []; // [y, element]
  const ts = M.treeAt(c.tree + 1), ks = M.kelpAt(c.kelp + 1);
  let ti = 0, ki = 0, bi = 0;
  planted.forEach(p => {
    if (p.kind === 'kelp') { const q = ks[ki++]; items.push([Y(q.z), kelp(X(q.x), Y(q.z), q.size, q.v, p.test)]); }
    else if (p.kind === 'bottles') { const q = M.crateAt(bi++); items.push([Y(q.z), crate(X(q.x), Y(q.z) - q.y * 3, p.test)]); }
    else { const q = ts[ti++]; items.push([Y(q.z), sway(tree(X(q.x), Y(q.z), q.size, q.v, wilted, p.test), ti)]); }
  });
  for (let i = c.bottles; i < M.LITTER; i++) { const q = M.litterAt[i]; items.push([Y(q.z) - 5, litter(X(q.x), Y(q.z), q.rot)]); }
  const nx = o.next;
  if (nx && nx.kind === 'tree') { const q = ts[c.tree]; items.push([Y(q.z), sapling(X(q.x), Y(q.z), nx.frac || 0, wilted)]); }
  if (nx && nx.kind === 'kelp') { const q = ks[c.kelp]; items.push([Y(q.z), kelp(X(q.x), Y(q.z), q.size * (0.3 + 0.6 * (nx.frac || 0)), q.v)]); }
  // the Club: its rooms back to front, the café always there, and tonight's guests at its door
  const club = s('g', { class: 'if-club' + (o.onClub ? ' if-tap' : ''), 'aria-hidden': 'true' });
  const rooms = (o.rooms || []).slice().sort((a, b) => b.rect[1] - a.rect[1] || b.rect[3] - a.rect[3]);
  rooms.forEach(rm => club.append(room(rm.id, rm.rect)));
  if (o.onClub) club.addEventListener('click', e => { e.stopPropagation(); o.onClub(); });
  items.push([Y(0) - 0.01, club]);
  (o.guests || []).slice(0, 6).forEach((id, i) => { const x = 3.4 + (i % 2 ? 1 : -1) * (1.2 + Math.floor(i / 2) * 1.4), z = -1.4 - (i % 3) * 0.7; items.push([Y(z), walkish(critter(id, X(x), Y(z), { sc: 1.2, flip: i % 2 }), i)]); });
  // the animals where they live (shy ones hidden while the island is dry); a few of each kind
  const ar = Eco.rng(97);
  const nearTree = () => { const q = ts.length > 1 ? ts[Math.floor(ar() * Math.max(1, c.tree))] : { x: M.WILD.x, z: M.WILD.z }; for (let k = 0; k < 8; k++) { const x = q.x + (ar() - 0.5) * 7, z = q.z + (ar() - 0.5) * 7; if (M.landOK(x, z)) return { x, z }; } return { x: q.x + 1.5, z: q.z - 1 }; };
  rs.forEach(a => {
    if (a.hiding) return;
    const n = Math.min(a.n, 3);
    for (let i = 0; i < n; i++) {
      const flip = ar() < 0.5;
      if (a.home === 'land') { const p = nearTree(); items.push([Y(p.z), walkish(critter(a.id, X(p.x), Y(p.z), { flip }), i + a.id.length)]); }
      else if (a.home === 'tree' && c.tree) { const q = ts[Math.floor(ar() * c.tree)], top = (q.v % 4 === 0 ? 2.3 : 2.0) * q.size * TREE; items.push([Y(q.z) + 0.01, critter(a.id, X(q.x) + (ar() - 0.5) * 0.6, Y(q.z) - top, { sc: 0.9, flip })]); }
      else if (a.home === 'air') { const p = nearTree(); items.push([Y(p.z), fly(critter(a.id, X(p.x), Y(p.z) - 2.5 - ar() * 2, { sc: 0.9, flip }), i)]); }
      else if (a.home === 'sky') { const ang = ar() * Math.PI * 2, p = M.coast(ang, 1.25); items.push([99, fly(gull(X(p.x), Math.min(Y(p.z), 0) - 8 - ar() * 6), i)]); }
      else if ((a.home === 'pond' || a.home === 'pond-air') && c.tree >= M.POND_TREES) { const ang = ar() * Math.PI * 2, x = M.POND.x + Math.cos(ang) * (M.POND.r + 0.4), z = M.POND.z + Math.sin(ang) * (M.POND.r + 0.4); const el = critter(a.id, X(x), Y(z) - (a.home === 'pond-air' ? 2 : 0), { sc: 0.9, flip }); items.push([Y(z), a.home === 'pond-air' ? fly(el, i) : el]); }
      else if (a.home === 'sea' || a.home === 'deep') { const ang = 0.5 + ar() * 5.3, p = M.coast(ang, a.home === 'deep' ? 1.42 : 1.2 + ar() * 0.12); const y = Math.max(VIEW.y + 3, Math.min(VIEW.y + VIEW.h - 2, Y(p.z))), x = Math.max(VIEW.x + 3, Math.min(VIEW.x + VIEW.w - 3, X(p.x))); items.push([y, bob(critter(a.id, x, y, { flip, sc: a.id === 'fish' ? 1.3 : 1 }), i)]); }
      else if (a.home === 'shore') { const ang = Math.PI * (0.6 + ar() * 0.8), p = M.coast(ang, 1.04); items.push([Y(p.z), critter(a.id, X(p.x), Y(p.z), { flip })]); }
    }
  });
  items.sort((a, b) => a[0] - b[0]).forEach(([, el]) => svg.append(el));
  svg.append(s('rect', { x: VIEW.x, y: VIEW.y, width: VIEW.w, height: VIEW.h, fill: 'url(#if-glow)', 'pointer-events': 'none' }));
  if (o.onIsland) { svg.classList.add('if-tap'); svg.addEventListener('click', () => o.onIsland()); }
  return svg;
}
const gull = (x, y) => s('path', { d: 'M' + f1(x - 1) + ' ' + f1(y) + ' q0.5 -0.6 1 0 q0.5 -0.6 1 0', class: 'if-gull' });
const anim = cls => (el, i) => { const w = s('g', { class: cls }); w.style.animationDelay = (-(i * 1.37) % 7).toFixed(2) + 's'; w.append(el); return w; };
const walkish = anim('if-walk'), fly = anim('if-fly'), bob = anim('if-bob');

function ariaOf(c, rs, o) {
  const bits = [];
  if (c.tree) bits.push(c.tree + ' tree' + (c.tree === 1 ? '' : 's'));
  if (c.kelp) bits.push(c.kelp + ' kelp plant' + (c.kelp === 1 ? '' : 's'));
  if (c.bottles) bits.push(c.bottles + ' crate' + (c.bottles === 1 ? '' : 's') + ' of bottles');
  const seen = rs.filter(a => !a.hiding).length;
  return 'Your island' + (bits.length ? ' with ' + bits.join(', ') : '') + (seen ? ', ' + seen + ' kind' + (seen === 1 ? '' : 's') + ' of animal' : '') + ((o.rooms || []).length ? ', and your club with ' + o.rooms.length + ' room' + (o.rooms.length === 1 ? '' : 's') : '') + (o.wilted ? '. It is dry: no practice for two days.' : '.');
}

export default { IslandFlat, critter };
