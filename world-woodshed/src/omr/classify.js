/* World Woodshed — score recognition: what a piece of ink is (a clef, an accidental, a rest, a time
   signature digit, part of a note, or something else), by its nearest neighbours among examples cut from
   engraved pages in five music fonts (scripts/omr/train.mjs makes src/omr/templates.js). */
import { GRID_W, GRID_H, shapeDist as dist } from './shapes.js';
import { CLASSES, DATA } from './templates.js';

const G = GRID_W * GRID_H, REC = G + 4;
let table = null;
function load() {
  if (table) return table;
  const bin = Uint8Array.from(atob(DATA), c => c.charCodeAt(0));
  const n = Math.floor(bin.length / REC);
  table = [];
  for (let i = 0; i < n; i++) {
    const o = i * REC;
    const grid = new Float32Array(G);
    for (let k = 0; k < G; k++) grid[k] = bin[o + 4 + k] / 255;
    table.push({ cls: CLASSES[bin[o]], w: bin[o + 1] / 24, h: bin[o + 2] / 24, fill: bin[o + 3] / 255, grid });
  }
  return table;
}

/* { cls, conf, d } for a shape (features() from shapes.js), or null when nothing is close */
export function classify(f, k = 5) {
  const T = load();
  const best = [];
  for (const t of T) {
    const d = dist(f, t);
    if (best.length < k || d < best[best.length - 1].d) {
      best.push({ t, d }); best.sort((x, y) => x.d - y.d); if (best.length > k) best.pop();
    }
  }
  if (!best.length || best[0].d > 0.6) return null;
  const vote = new Map();
  best.forEach(({ t, d }) => vote.set(t.cls, (vote.get(t.cls) || 0) + 1 / (d + 0.02)));
  const [cls, v] = [...vote.entries()].sort((a, b) => b[1] - a[1])[0];
  const total = [...vote.values()].reduce((a, b) => a + b, 0);
  return { cls, conf: v / total, d: best[0].d };
}

/* A feature record packed the way templates.js stores it */
export function pack(cls, f) {
  const out = new Uint8Array(REC);
  out[0] = CLASSES.indexOf(cls);
  out[1] = Math.min(255, Math.round(f.w * 24)); out[2] = Math.min(255, Math.round(f.h * 24)); out[3] = Math.round(f.fill * 255);
  for (let k = 0; k < G; k++) out[4 + k] = Math.round(f.grid[k] * 255);
  return out;
}
