/* World Woodshed — the Club drawn in code: an evening on the island with the building cut open, each room you've built
   lit and furnished, plants everywhere, the band on the stage and tonight's guests, the island's animals (the
   same ones the 3D club shows, src/folklook.js). All original art.
   Scene(opts) → { el, draw(model), show(night, o) }, where model = { club, band, plants, guests } and show plays
   the evening: the view moves in to the stage, the lights come up, the guests walk in and the tips jar fills.
   Used full size by the Club page (src/tools/club.js) and small on the Today card. */
import { s } from './core.js';
import { owns } from '../club.js';
import Eco from '../ecosystem.js';
import { LOOK, pickGuest } from '../folklook.js';

const W = 400, H = 300, GROUND = 270;
/* where each room sits: x, y, w, h */
export const ROOM_BOX = {
  courtyard: [0, 180, 100, 90], cafe: [100, 180, 100, 90], kitchen: [200, 180, 100, 90], hall: [300, 180, 100, 90],
  jazzbar: [100, 90, 200, 90], studio: [300, 90, 100, 90], school: [100, 30, 100, 60], roof: [200, 30, 100, 60]
};
const WALL = { cafe: '#c9915c', kitchen: '#b8755a', hall: '#8f6f9e', jazzbar: '#4a3f6b', studio: '#3f5f6b', school: '#7a8f5c', roof: '#9fc7b4' };
const HUES = ['#e07a5f', '#3d85c6', '#81b29a', '#f2cc8f', '#c77dff', '#e9c46a', '#6c9a8b', '#d4a5a5', '#f4a261', '#90be6d', '#a8dadc', '#ef8fa0'];
/* the band are island animals too, as in the 3D club (src/ui/club3d.js) */
const BAND_FOLK = { guitar: 'fox', drums: 'bear', bass: 'heron', piano: 'owl', keys: 'owl', vocals: 'songbird', saxophone: 'otter', sax: 'otter', congas: 'macaque' };
const rnd = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

/* ---------- small drawings ---------- */
/* one of the island's animals, dressed (animal: an id of LOOK in src/folklook.js) */
function person(x, y, { shirt, animal = 'rabbit', sc = 1, sit = false } = {}) {
  const [fur, top] = LOOK[animal] || LOOK.rabbit;
  const g = s('g', { transform: `translate(${x} ${y}) scale(${sc})`, class: 'cl-person' });
  if (!sit) g.append(s('path', { d: 'M-2 -6 L-2.5 0 M2 -6 L2.5 0', class: 'cl-legs' }));
  const hy = sit ? -16.5 : -18.5;
  g.append(s('rect', { x: -4, y: sit ? -13 : -15, width: 8, height: sit ? 9 : 10, rx: 3, fill: shirt }));
  // what sits on the head, behind or over it
  const ear = d => s('path', { d, fill: fur, class: 'cl-ear' });
  if (top === 'long') g.append(ear(`M-2.4 ${hy - 2} q-1.6 -7 0.4 -8 q1.6 1 0.6 8 Z M2.4 ${hy - 2} q1.6 -7 -0.4 -8 q-1.6 1 -0.6 8 Z`));
  else if (top === 'point') g.append(ear(`M-3.6 ${hy - 1} l0.4 -4.6 l2.8 2.6 Z M3.6 ${hy - 1} l-0.4 -4.6 l-2.8 2.6 Z`));
  else if (top === 'round') g.append(s('circle', { cx: -2.8, cy: hy - 2.8, r: 1.6, fill: fur }), s('circle', { cx: 2.8, cy: hy - 2.8, r: 1.6, fill: fur }));
  else if (top === 'antennae' || top === 'stalks') g.append(s('path', { d: `M-1.2 ${hy - 3} l-1.6 -4 M1.2 ${hy - 3} l1.6 -4`, class: 'cl-antenna' }), s('circle', { cx: -2.8, cy: hy - 7, r: top === 'stalks' ? 1.2 : 0.9, class: 'cl-antenna-tip' }), s('circle', { cx: 2.8, cy: hy - 7, r: top === 'stalks' ? 1.2 : 0.9, class: 'cl-antenna-tip' }));
  else if (top === 'antlers') g.append(s('path', { d: `M-2 ${hy - 3} l-1.5 -4 m0.8 2 l-2 -0.8 M2 ${hy - 3} l1.5 -4 m-0.8 2 l2 -0.8`, class: 'cl-antler' }));
  else if (top === 'fin') g.append(ear(`M-1.5 ${hy - 3} l1.5 -3.4 l1.5 3.4 Z`));
  g.append(s('circle', { cx: 0, cy: hy, r: 3.6, fill: fur }));
  if (top === 'beak') g.append(s('path', { d: `M2.8 ${hy} l3.2 0.8 l-3.2 0.8 Z`, class: 'cl-beak' }));
  else if (top === 'eyes') g.append(s('circle', { cx: -1.7, cy: hy - 3, r: 1.3, fill: fur }), s('circle', { cx: 1.7, cy: hy - 3, r: 1.3, fill: fur }));
  g.append(s('circle', { cx: -1.2, cy: hy - 0.4, r: 0.45, class: 'cl-eye' }), s('circle', { cx: 1.2, cy: hy - 0.4, r: 0.45, class: 'cl-eye' }));
  return g;
}
function pot(x, y, kind = 'leafy', sc = 1) {
  const g = s('g', { transform: `translate(${x} ${y}) scale(${sc})`, class: 'cl-plant' });
  g.append(s('path', { d: 'M-4 0 L4 0 L5 -6 L-5 -6 Z', class: 'cl-pot' }));
  if (kind === 'monstera') g.append(s('ellipse', { cx: -4, cy: -11, rx: 5, ry: 3.5, class: 'cl-leaf', transform: 'rotate(-30 -4 -11)' }), s('ellipse', { cx: 4, cy: -12, rx: 5, ry: 3.5, class: 'cl-leaf2', transform: 'rotate(30 4 -12)' }), s('ellipse', { cx: 0, cy: -16, rx: 4, ry: 5, class: 'cl-leaf' }));
  else if (kind === 'lemon') g.append(s('circle', { cx: 0, cy: -14, r: 7, class: 'cl-leaf' }), s('circle', { cx: -3, cy: -13, r: 1.4, fill: '#f6d743' }), s('circle', { cx: 3, cy: -16, r: 1.4, fill: '#f6d743' }), s('circle', { cx: 2, cy: -11, r: 1.3, fill: '#f6d743' }));
  else g.append(s('path', { d: 'M0 -6 Q-6 -10 -5 -16 M0 -6 Q0 -14 1 -19 M0 -6 Q6 -11 5 -15', class: 'cl-stem' }), s('circle', { cx: -5, cy: -16, r: 2.4, class: 'cl-leaf' }), s('circle', { cx: 1, cy: -19, r: 2.4, class: 'cl-leaf2' }), s('circle', { cx: 5, cy: -15, r: 2.4, class: 'cl-leaf' }));
  return g;
}
function tree(x, y, sc = 1, cls = '') {
  return s('g', { transform: `translate(${x} ${y}) scale(${sc})`, class: 'cl-plant ' + cls },
    s('path', { d: 'M0 0 L0 -18 M0 -10 L-5 -15 M0 -13 L5 -19', class: 'cl-trunk' }),
    s('circle', { cx: 0, cy: -26, r: 10, class: 'cl-leaf' }), s('circle', { cx: -7, cy: -20, r: 6, class: 'cl-leaf2' }), s('circle', { cx: 7, cy: -21, r: 6.5, class: 'cl-leaf' }));
}
function kelp(x, y, sc = 1, cls = '') {
  return s('g', { transform: `translate(${x} ${y}) scale(${sc})`, class: 'cl-plant cl-kelp ' + cls },
    s('path', { d: 'M0 0 C-4 -8 4 -14 0 -22 C-3 -28 2 -32 0 -36', class: 'cl-kelpstem' }),
    s('path', { d: 'M4 0 C1 -6 7 -12 4 -18', class: 'cl-kelpstem' }));
}
function bottles(x, y, sc = 1, cls = '') {
  // a planter made of the bottles collected, with a little vine
  const g = s('g', { transform: `translate(${x} ${y}) scale(${sc})`, class: 'cl-plant ' + cls });
  [-6, 0, 6].forEach((dx, i) => g.append(s('path', { d: `M${dx - 2.4} 0 L${dx - 2.4} -8 Q${dx} -11 ${dx} -13 L${dx} -14 M${dx + 2.4} 0 L${dx + 2.4} -8 Q${dx} -11 ${dx} -13`, class: 'cl-bottle' + (i === 1 ? ' b2' : '') })));
  g.append(s('path', { d: 'M-8 -9 Q-2 -18 0 -14 Q4 -20 8 -10', class: 'cl-stem' }), s('circle', { cx: -2, cy: -16, r: 2, class: 'cl-leaf' }), s('circle', { cx: 4, cy: -17, r: 2, class: 'cl-leaf2' }));
  return g;
}
function noteGlyph(x, y) {
  return s('g', { transform: `translate(${x} ${y})`, class: 'cl-note' }, s('ellipse', { cx: 0, cy: 0, rx: 2.6, ry: 2, transform: 'rotate(-20)' }), s('path', { d: 'M2.3 -0.6 L2.3 -9 L6 -7.5', class: 'cl-notestem' }));
}

/* the band: you on guitar and whoever has joined, with their instruments */
function instrument(role) {
  switch (role) {
    case 'guitar': return s('g', {}, s('ellipse', { cx: 2, cy: -8, rx: 3.4, ry: 2.6, class: 'cl-wood' }), s('path', { d: 'M4 -9 L10 -13', class: 'cl-neck' }));
    case 'drums': return s('g', {}, s('ellipse', { cx: 7, cy: -4, rx: 5, ry: 4, class: 'cl-drum' }), s('ellipse', { cx: -6, cy: -9, rx: 3.5, ry: 1.2, class: 'cl-cymbal' }), s('path', { d: 'M-6 -9 L-6 0', class: 'cl-neck' }), s('ellipse', { cx: 6, cy: -11, rx: 3, ry: 1.5, class: 'cl-drum' }));
    case 'bass': return s('g', {}, s('ellipse', { cx: 4, cy: -5, rx: 3.6, ry: 5.5, class: 'cl-wood' }), s('path', { d: 'M4 -10 L4 -24', class: 'cl-neck' }));
    case 'piano': return s('g', {}, s('rect', { x: 2, y: -12, width: 12, height: 12, rx: 1, class: 'cl-piano' }), s('rect', { x: 2, y: -8, width: 12, height: 2, class: 'cl-keys' }));
    case 'vocals': return s('g', {}, s('path', { d: 'M5 0 L5 -16', class: 'cl-neck' }), s('circle', { cx: 5, cy: -17, r: 1.6, class: 'cl-mic' }));
    case 'saxophone': return s('path', { d: 'M1 -18 L4 -15 L4 -6 Q4 -2 7 -3 L8 -7', class: 'cl-sax' });
    case 'congas': return s('g', {}, s('path', { d: 'M3 0 L2 -9 L9 -9 L8 0 Z', class: 'cl-drum' }), s('path', { d: 'M9 0 L8.5 -7 L14 -7 L13.5 0 Z', class: 'cl-drum' }));
    default: return s('g');
  }
}
function player(x, y, role, i, level = 1) {
  const g = s('g', { transform: `translate(${x} ${y})`, class: 'cl-player', style: `--d:${(0.36 + (i % 3) * 0.07).toFixed(2)}s` });
  const p = person(0, 0, { shirt: HUES[(i * 5 + 2) % HUES.length], animal: BAND_FOLK[role] || 'fox' });
  if (role === 'piano' || role === 'drums') g.append(instrument(role), p); else g.append(p, instrument(role));
  // a star over the head for each level past the first
  for (let k = 1; k < level; k++) g.append(s('circle', { cx: -4 + k * 2, cy: -26, r: 0.8, class: 'cl-lvl' }));
  return g;
}

/* ---------- rooms ---------- */
function roomShell(id, built, onRoom) {
  const [x, y, w, hh] = ROOM_BOX[id];
  const g = s('g', { class: 'cl-room ' + (built ? 'built' : 'empty'), 'data-room': id });
  if (onRoom) { g.addEventListener('click', () => onRoom(id)); g.style.cursor = 'pointer'; }
  if (!built) {
    g.append(s('rect', { x: x + 2, y: y + 2, width: w - 4, height: hh - 4, rx: 3, class: 'cl-plot' }),
      s('circle', { cx: x + w / 2, cy: y + hh / 2, r: 8, class: 'cl-plus-c' }),
      s('path', { d: `M${x + w / 2 - 4} ${y + hh / 2} h8 M${x + w / 2} ${y + hh / 2 - 4} v8`, class: 'cl-plus' }));
    return g;
  }
  if (id === 'courtyard') {
    g.append(s('rect', { x, y: y + hh - 6, width: w, height: 6, class: 'cl-grass' }), s('path', { d: `M${x + 2} ${y + hh - 6} v-14 M${x + 2} ${y + hh - 14} h${w - 4} M${x + 18} ${y + hh - 6} v-14 M${x + 34} ${y + hh - 6} v-14 M${x + 50} ${y + hh - 6} v-14`, class: 'cl-fence' }));
    return g;
  }
  if (id === 'roof') {
    g.append(s('path', { d: `M${x + 4} ${y + hh} L${x + 4} ${y + 22} Q${x + w / 2} ${y - 6} ${x + w - 4} ${y + 22} L${x + w - 4} ${y + hh} Z`, class: 'cl-glass' }),
      s('path', { d: `M${x + w / 2} ${y + 8} L${x + w / 2} ${y + hh} M${x + 26} ${y + 14} L${x + 26} ${y + hh} M${x + w - 26} ${y + 14} L${x + w - 26} ${y + hh}`, class: 'cl-mullion' }));
    return g;
  }
  g.append(s('rect', { x, y, width: w, height: hh, fill: WALL[id], class: 'cl-wall' }),
    s('rect', { x, y: y + hh - 5, width: w, height: 5, class: 'cl-floor' }),
    s('rect', { x, y, width: w, height: hh, class: 'cl-shade' }));
  return g;
}

/* where guests can stand or sit in a room: a few rows from the floor up */
function spotsIn(id, n, avoid = 0) {
  const [x, y, w, hh] = ROOM_BOX[id];
  const out = [], floor = y + hh - 5, rows = id === 'courtyard' ? 2 : hh >= 80 ? 2 : 1;
  const left = x + 6 + avoid, right = x + w - 6;
  const per = Math.max(1, Math.floor((right - left) / 9));
  for (let r = 0; r < rows && out.length < n; r++) for (let i = 0; i < per && out.length < n; i++) out.push([left + 4 + i * 9 + (r % 2) * 4, floor - r * 4, 1 - r * 0.12]);
  return out;
}

/* the amenities, drawn in their rooms */
const DRAW = {
  lights: () => { const g = s('g', { class: 'cl-fairy' }); g.append(s('path', { d: 'M100 186 Q125 194 150 186 Q175 194 200 186', class: 'cl-wire' })); [108, 120, 133, 146, 158, 171, 184, 196].forEach((x, i) => g.append(s('circle', { cx: x, cy: 188 + (i % 2), r: 1.4, class: 'cl-bulb', style: `--i:${i}` }))); return g; },
  monstera: () => pot(192, 265, 'monstera', 1),
  chalk: () => s('g', {}, s('rect', { x: 170, y: 196, width: 18, height: 13, rx: 1, class: 'cl-chalk' }), s('path', { d: 'M173 200 h10 M173 203 h7 M173 206 h11', class: 'cl-chalkline' })),
  chairs: () => s('g', { class: 'cl-chairs' }, s('path', { d: 'M150 265 v-8 h6 v8 M164 265 v-7 h6 v7 M178 265 v-8 h5 v8', class: 'cl-chair' })),
  upright: () => null, // drawn with the pianist
  oven: () => s('g', {}, s('path', { d: 'M262 265 L262 246 Q275 232 288 246 L288 265 Z', class: 'cl-oven' }), s('path', { d: 'M269 265 L269 254 Q275 248 281 254 L281 265 Z', class: 'cl-fire' })),
  herbs: () => { const g = s('g', {}); [[208, 200], [220, 200], [232, 200], [208, 212], [220, 212], [232, 212]].forEach(([x, y], i) => g.append(s('rect', { x, y, width: 9, height: 3, class: 'cl-pot' }), s('circle', { cx: x + 4.5, cy: y - 2, r: 3, class: i % 2 ? 'cl-leaf' : 'cl-leaf2' }))); return g; },
  table: () => s('rect', { x: 212, y: 254, width: 44, height: 3, rx: 1, class: 'cl-tabletop' }),
  olive: () => tree(80, 264, 1.1, 'cl-olive'),
  strings: () => { const g = s('g', { class: 'cl-fairy' }); g.append(s('path', { d: 'M0 196 Q50 210 100 196', class: 'cl-wire' })); [10, 24, 38, 52, 66, 80, 92].forEach((x, i) => g.append(s('circle', { cx: x, cy: 200 + Math.sin(i / 2) * 3, r: 1.5, class: 'cl-bulb', style: `--i:${i}` }))); return g; },
  fountain: () => s('g', {}, s('ellipse', { cx: 50, cy: 262, rx: 14, ry: 3, class: 'cl-basin' }), s('path', { d: 'M50 262 v-10 M50 252 q-6 2 -8 8 M50 252 q6 2 8 8', class: 'cl-water' })),
  benches: () => s('path', { d: 'M8 264 h20 M10 264 v3 M26 264 v3 M66 264 h20 M68 264 v3 M84 264 v3', class: 'cl-bench' }),
  spots: () => s('g', { class: 'cl-spots' }, s('path', { d: 'M120 92 L106 174 L150 174 Z', class: 'cl-beam' }), s('path', { d: 'M170 92 L150 174 L196 174 Z', class: 'cl-beam b2' }), s('rect', { x: 116, y: 91, width: 8, height: 4, class: 'cl-can' }), s('rect', { x: 166, y: 91, width: 8, height: 4, class: 'cl-can' })),
  pa: () => s('g', {}, s('rect', { x: 102, y: 150, width: 7, height: 24, rx: 1, class: 'cl-speaker' }), s('rect', { x: 205, y: 150, width: 7, height: 24, rx: 1, class: 'cl-speaker' }), s('circle', { cx: 105.5, cy: 166, r: 2.4, class: 'cl-cone' }), s('circle', { cx: 208.5, cy: 166, r: 2.4, class: 'cl-cone' })),
  grand: () => null, // drawn with the pianist
  ferns: () => { const g = s('g', {}); [230, 262, 292].forEach(x => g.append(s('path', { d: `M${x} 90 v8`, class: 'cl-wire' }), s('path', { d: `M${x - 6} 98 h12 l-2 4 h-8 Z`, class: 'cl-pot' }), s('path', { d: `M${x - 4} 102 q-4 8 -6 14 M${x} 102 q0 9 1 16 M${x + 4} 102 q4 8 6 13`, class: 'cl-fern' }))); return g; },
  amps: () => s('g', {}, s('rect', { x: 106, y: 76, width: 12, height: 9, rx: 1, class: 'cl-amp' }), s('rect', { x: 122, y: 78, width: 9, height: 7, rx: 1, class: 'cl-amp' })),
  lending: () => s('g', {}, s('rect', { x: 170, y: 52, width: 26, height: 33, class: 'cl-shelf' }), s('path', { d: 'M174 70 l3 -14 M180 70 l0 -12 M187 70 l3 -13 M174 84 l4 -10 M184 84 v-11', class: 'cl-neck' })),
  board: () => s('g', {}, s('rect', { x: 140, y: 42, width: 22, height: 15, rx: 1, class: 'cl-chalk' }), s('path', { d: 'M144 47 h6 M144 51 h12 M152 47 h6', class: 'cl-chalkline' })),
  floor: () => s('g', { class: 'cl-dance' }, [0, 1, 2, 3, 4, 5, 6, 7].map(i => s('rect', { x: 316 + i * 9, y: 262, width: 9, height: 3, class: i % 2 ? 'cl-tile' : 'cl-tile b2', style: `--i:${i}` }))),
  bunting: () => { const g = s('g', {}); g.append(s('path', { d: 'M300 186 Q350 198 400 186', class: 'cl-wire' })); [306, 318, 330, 342, 354, 366, 378, 390].forEach((x, i) => g.append(s('path', { d: `M${x - 4} ${188 + Math.sin(i / 2.5) * 2} l4 7 l4 -7 Z`, fill: HUES[i % HUES.length] }))); return g; },
  coats: () => s('path', { d: 'M384 200 v20 M380 204 q4 10 0 16 M388 204 q-2 10 2 16', class: 'cl-coat' }),
  lemons: () => s('g', {}, pot(218, 89, 'lemon', 1.1), pot(282, 89, 'lemon', 1.1)),
  scope: () => s('g', {}, s('path', { d: 'M256 89 l-5 -10 M256 89 l5 -10 M256 79 l0 10', class: 'cl-neck' }), s('rect', { x: 250, y: 66, width: 16, height: 4, rx: 2, transform: 'rotate(-28 258 68)', class: 'cl-scope' })),
  hammocks: () => s('path', { d: 'M232 72 Q244 84 256 72 M262 74 Q272 84 282 74', class: 'cl-hammock' }),
  tape: () => s('g', {}, s('rect', { x: 340, y: 150, width: 22, height: 24, rx: 1, class: 'cl-amp' }), s('circle', { cx: 345.5, cy: 157, r: 3.5, class: 'cl-reel' }), s('circle', { cx: 356.5, cy: 157, r: 3.5, class: 'cl-reel' })),
  booth: () => s('g', {}, s('rect', { x: 368, y: 120, width: 26, height: 54, rx: 2, class: 'cl-booth' }), s('path', { d: 'M381 168 v-18', class: 'cl-neck' }), s('circle', { cx: 381, cy: 149, r: 1.6, class: 'cl-mic' })),
  gold: () => { const g = s('g', {}); [[308, 100], [322, 100], [336, 100], [308, 114], [322, 114]].forEach(([x, y]) => g.append(s('circle', { cx: x + 5, cy: y + 5, r: 5, class: 'cl-record' }), s('circle', { cx: x + 5, cy: y + 5, r: 1.4, class: 'cl-label' }))); return g; }
};

/* the room kitchen and studio etc. get a simple standing piece each, so a new room never looks bare */
const BASIC = {
  cafe: () => s('g', {}, s('rect', { x: 102, y: 255, width: 40, height: 10, rx: 2, class: 'cl-rug' }), s('rect', { x: 150, y: 232, width: 30, height: 4, class: 'cl-counter' }), s('rect', { x: 120, y: 194, width: 22, height: 26, rx: 2, class: 'cl-window' })),
  kitchen: () => s('g', {}, s('rect', { x: 240, y: 236, width: 40, height: 4, class: 'cl-counter' }), s('path', { d: 'M246 236 v-6 q4 -4 8 0 v6 M262 236 v-5 h6 v5', class: 'cl-pan' })),
  hall: () => s('g', {}, s('rect', { x: 320, y: 196, width: 60, height: 22, rx: 2, class: 'cl-window' }), s('path', { d: 'M350 196 v22', class: 'cl-mullion' })),
  jazzbar: () => s('g', {}, s('rect', { x: 102, y: 168, width: 104, height: 7, class: 'cl-stage' }), s('rect', { x: 250, y: 140, width: 40, height: 4, class: 'cl-counter' }), s('rect', { x: 254, y: 120, width: 32, height: 16, class: 'cl-shelf' })),
  studio: () => s('g', {}, s('rect', { x: 306, y: 140, width: 26, height: 10, rx: 1, class: 'cl-desk' }), s('path', { d: 'M309 143 h20 M309 146 h20', class: 'cl-keys' })),
  school: () => s('g', {}, s('rect', { x: 110, y: 50, width: 18, height: 18, rx: 1, class: 'cl-window' }), s('path', { d: 'M150 85 v-14 h14 v14', class: 'cl-chair' })),
  roof: () => s('g', {}, pot(236, 89, 'leafy', 0.9), pot(266, 89, 'monstera', 0.9))
};

export function Scene({ small = false, onRoom } = {}) {
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'cl-scene' + (small ? ' small' : ''), role: 'img', 'aria-label': 'Your club: the building cut open, its rooms, plants, band and guests' });
  const sky = s('g'), back = s('g'), rooms = s('g'), stuff = s('g'), bandG = s('g', { class: 'cl-band' }), guestsG = s('g'), fx = s('g', { class: 'cl-fx' }), front = s('g');
  svg.append(sky, back, rooms, stuff, bandG, guestsG, front, fx);
  let model = null, stageId = 'cafe';

  function draw(m) {
    model = m;
    const club = m.club;
    [sky, back, rooms, stuff, bandG, guestsG, front, fx].forEach(g => { g.textContent = ''; });
    // the evening sky, a moon, a few stars, a skyline far off
    sky.append(s('rect', { x: 0, y: 0, width: W, height: H, class: 'cl-sky' }), s('circle', { cx: 352, cy: 34, r: 11, class: 'cl-moon' }));
    const r = rnd(7);
    for (let i = 0; i < 22; i++) sky.append(s('circle', { cx: Math.round(r() * W), cy: Math.round(r() * 80), r: r() > 0.8 ? 1 : 0.6, class: 'cl-star', style: `--i:${i % 7}` }));
    // the island's hills and woods far off, then the lawn the club stands on
    sky.append(s('path', { d: 'M0 150 Q40 104 90 128 Q120 112 150 150 Z M250 150 Q300 100 350 122 Q380 110 400 128 V150 Z', class: 'cl-hills' }));
    back.append(s('rect', { x: 0, y: GROUND, width: W, height: H - GROUND, class: 'cl-lawn' }), s('path', { d: `M0 ${GROUND + 1} H${W}`, class: 'cl-lawnedge' }));
    // the building's outline behind the rooms, with a sign over the café door
    Object.keys(ROOM_BOX).forEach(id => rooms.append(roomShell(id, owns(club, id), onRoom)));
    if (owns(club, 'jazzbar') || owns(club, 'studio')) rooms.append(s('path', { d: 'M96 90 L304 90', class: 'cl-roofline' }));
    rooms.append(s('rect', { x: 116, y: 172, width: 68, height: 10, rx: 2, class: 'cl-sign' }));
    for (let i = 0; i < 6; i++) rooms.append(s('circle', { cx: 122 + i * 11, cy: 177, r: 1.6, class: 'cl-signbulb', style: `--i:${i}` }));
    // basics and amenities
    Object.keys(BASIC).forEach(id => { if (owns(club, id)) stuff.append(BASIC[id]()); });
    Object.keys(DRAW).forEach(id => { if (owns(club, id) && DRAW[id]) { const el = DRAW[id](); if (el) { el.setAttribute('data-item', id); stuff.append(el); } } });
    plants(m.plants || [], club);
    // the band, on the jazz bar's stage once it is built
    stageId = owns(club, 'jazzbar') ? 'jazzbar' : 'cafe';
    const [sx] = ROOM_BOX[stageId], floor = stageId === 'jazzbar' ? 168 : 265;
    const members = (m.band || []).filter(b => b.level > 0);
    const piano = owns(club, 'grand') && stageId === 'jazzbar' ? 'grand' : owns(club, 'upright') ? 'upright' : null;
    const line = [{ role: 'guitar', level: 1 }].concat(members);
    const step = stageId === 'jazzbar' ? 14 : 6.4;
    line.forEach((b, i) => bandG.append(player(sx + 10 + i * step, floor - (stageId === 'cafe' && i % 2 ? 4 : 0), b.role, i, b.level)));
    if (piano && members.some(b => b.id === 'keys')) bandG.append(s('rect', { x: sx + 4, y: floor - 3, width: 4, height: 3, class: 'cl-piano' }));
    // tonight's guests
    guests(m.guests || 0, false);
    // the tips jar on the café counter
    front.append(s('path', { d: 'M184 232 l1 -9 h8 l1 9 Z', class: 'cl-jar' }), s('rect', { x: 185.5, y: 227, width: 7, height: 4, class: 'cl-coins', 'data-jar': '1' }));
  }

  /* real trees, kelp and bottles (src/ui/garden.js plantings()) and the plant amenities: in the courtyard once
     it's built, along the front before then */
  function plants(list, club) {
    const yard = owns(club, 'courtyard');
    const shown = list.slice(0, yard ? 14 : 8);
    shown.forEach((p, i) => {
      const cls = p.test ? 'cl-test' : '';
      let x, y, sc;
      if (yard) { x = 8 + (i % 7) * 13 + (i >= 7 ? 6 : 0); y = i >= 7 ? 264 : 254; sc = i >= 7 ? 0.9 : 0.7; } else { x = 8 + i * 12; y = GROUND - 1; sc = 0.55; }
      const el = p.kind === 'kelp' ? kelp(x, y, sc * 0.9, cls) : p.kind === 'bottles' ? bottles(x, y, sc, cls) : tree(x, y, sc, cls);
      (yard ? stuff : front).append(el);
    });
    if (list.length > shown.length) front.append(s('circle', { cx: yard ? 94 : 8 + shown.length * 12, cy: GROUND - 6, r: 4, class: 'cl-more' }));
  }

  /* guests: the stage room first, then the other rooms you've built. animate: walk in one by one */
  function guests(n, animate) {
    guestsG.textContent = '';
    if (!model || n <= 0) return [];
    const club = model.club, order = [stageId, 'cafe', 'courtyard', 'kitchen', 'hall', 'roof', 'jazzbar', 'school', 'studio'].filter((id, i, a) => a.indexOf(id) === i && owns(club, id));
    const drawn = Math.min(n, small ? 30 : 60), spots = [];
    const bandWidth = 10 + ((model.band || []).filter(b => b.level > 0).length + 1) * (stageId === 'jazzbar' ? 14 : 6.4);
    order.forEach(id => { if (spots.length < drawn) spots.push(...spotsIn(id, drawn - spots.length, id === stageId ? bandWidth : id === 'cafe' && stageId === 'cafe' ? bandWidth : 0)); });
    const r = rnd(11), els = [];
    let pool = [];
    try { pool = Eco.residents(Eco.counts(model.plants || [])); } catch (e) { /* no island yet */ }
    spots.slice(0, drawn).forEach(([x, y, sc], i) => {
      const g = person(x, y, { shirt: HUES[Math.floor(r() * HUES.length)], animal: pickGuest(pool, i * 13 + 5), sc: sc * 0.9 });
      const wrap = s('g', { class: 'cl-guest' + (animate ? ' in' : ''), style: `--dx:${Math.round(-x - 20)}px;--t:${(i * (2.2 / drawn)).toFixed(2)}s` }, g);
      guestsG.append(wrap); els.push(wrap);
    });
    return els;
  }

  /* the view: the whole building, or close on one room (for the show) */
  let vb = [0, 0, W, H], anim = 0;
  function moveTo(target, ms) {
    cancelAnimationFrame(anim);
    const from = vb.slice(), t0 = performance.now();
    if (!ms || matchMedia('(prefers-reduced-motion: reduce)').matches) { vb = target; svg.setAttribute('viewBox', vb.join(' ')); return Promise.resolve(); }
    return new Promise(res => {
      const step = now => {
        const k = Math.min(1, (now - t0) / ms), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        vb = from.map((v, i) => v + (target[i] - v) * e);
        svg.setAttribute('viewBox', vb.map(v => v.toFixed(1)).join(' '));
        if (k < 1) anim = requestAnimationFrame(step); else res();
      };
      anim = requestAnimationFrame(step);
    });
  }
  const stageView = () => {
    const [x, y, w, hh] = ROOM_BOX[stageId];
    const vw = Math.max(w + 40, 180), vh = vw * H / W;
    return [Math.max(0, Math.min(W - vw, x + w / 2 - vw / 2)), Math.max(0, Math.min(H - vh, y + hh / 2 - vh / 2 + 6)), vw, vh];
  };

  /* Showtime: o.onGuest(i) as each guest comes in, o.onCoin() as tips drop in the jar; resolves when done */
  let showing = null;
  async function show(n, o = {}) {
    if (!model) return;
    stop();
    const token = showing = {};
    const alive = () => showing === token && svg.isConnected;
    svg.classList.add('cl-showing');
    await moveTo(stageView(), 900);
    if (!alive()) return;
    svg.classList.add('cl-lit');
    const els = guests(n, true);
    // notes rising from the stage
    const [sx, , sw] = ROOM_BOX[stageId], floor = stageId === 'jazzbar' ? 150 : 245;
    const notes = setInterval(() => {
      if (!alive()) { clearInterval(notes); return; }
      const g = noteGlyph(sx + 12 + Math.random() * Math.min(sw - 20, 80), floor);
      fx.append(g); setTimeout(() => g.remove(), 2400);
    }, 380);
    const per = els.length ? 2200 / els.length : 0;
    for (let i = 0; i < els.length; i++) setTimeout(() => { if (alive() && o.onGuest) o.onGuest(i, els.length); }, i * per + 500);
    await new Promise(r => setTimeout(r, 2900));
    if (!alive()) { clearInterval(notes); return; }
    // tips: coins hop from the room to the jar
    for (let i = 0; i < 10; i++) setTimeout(() => {
      if (!alive()) return;
      const c = s('circle', { cx: sx + 20 + Math.random() * 60, cy: floor + 10, r: 2.2, class: 'cl-coin', style: `--tx:${Math.round(188 - (sx + 50))}px;--ty:${Math.round(228 - floor - 10)}px` });
      fx.append(c); setTimeout(() => c.remove(), 900);
      if (o.onCoin) o.onCoin(i, 10);
    }, i * 140);
    await new Promise(r => setTimeout(r, 1700));
    clearInterval(notes);
    if (!alive()) return;
    await moveTo([0, 0, W, H], 900);
    leaves();
    showing = null;
    svg.classList.remove('cl-showing');
  }
  function stop() { showing = null; cancelAnimationFrame(anim); vb = [0, 0, W, H]; svg.setAttribute('viewBox', vb.join(' ')); svg.classList.remove('cl-showing'); }
  /* a little burst of leaves and sparkles (after a show, or where something new was built) */
  function leaves(x = W / 2, y = 120, n = 16) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, d = 30 + Math.random() * 40;
      const el = s('ellipse', { cx: x, cy: y, rx: 2.6, ry: 1.4, class: i % 3 ? 'cl-flyleaf' : 'cl-spark', style: `--fx:${Math.round(Math.cos(a) * d)}px;--fy:${Math.round(Math.sin(a) * d + 30)}px;--r:${Math.round(Math.random() * 360)}deg` });
      fx.append(el); setTimeout(() => el.remove(), 1400);
    }
  }
  function celebrate(id) {
    const box = ROOM_BOX[id] || ROOM_BOX[(itemRoom(id))];
    if (!box) { leaves(); return; }
    const el = stuff.querySelector(`[data-item="${id}"]`);
    if (el) el.classList.add('cl-new');
    const room = rooms.querySelector(`[data-room="${id}"]`);
    if (room) room.classList.add('cl-new');
    leaves(box[0] + box[2] / 2, box[1] + box[3] / 2, 22);
  }
  let itemRoom = () => null;
  return { el: svg, draw, show, stop, celebrate, leaves, setItemRoom(fn) { itemRoom = fn; }, get stage() { return stageId; } };
}
