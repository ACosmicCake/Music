/* World Woodshed — score recognition: what a piece of ink is (a clef, an accidental, a rest, a time
   signature digit, part of a note, or something else), by its nearest neighbours among examples cut from
   engraved pages in five music fonts (scripts/omr/train.mjs makes src/omr/templates.js). */
import { GRID_W, GRID_H, shapeDist as dist } from './shapes.js';
import { CLASSES, DATA } from './templates.js';
import { TIME_DATA, TUPLET_DATA } from './digits.js';

const G = GRID_W * GRID_H, REC = G + 4;
const tables = {};
function unpack(data) {
  const bin = Uint8Array.from(atob(data), c => c.charCodeAt(0));
  const n = Math.floor(bin.length / REC), out = [];
  for (let i = 0; i < n; i++) {
    const o = i * REC;
    const grid = new Float32Array(G);
    for (let k = 0; k < G; k++) grid[k] = bin[o + 4 + k] / 255;
    out.push({ cls: CLASSES[bin[o]], w: bin[o + 1] / 24, h: bin[o + 2] / 24, fill: bin[o + 3] / 255, grid });
  }
  return out;
}
const load = (name = 'main') => tables[name] || (tables[name] = unpack({ main: DATA, time: TIME_DATA, tuplet: TUPLET_DATA }[name]));

/* { cls, conf, d } for a shape (features() from shapes.js), or null when nothing is close; only (a RegExp) keeps
   to the classes it matches */
export function classify(f, k = 5, only = null, set = 'main') {
  const T = load(set);
  const best = [];
  for (const t of T) {
    if (only && !only.test(t.cls)) continue; // only among these classes (where only they can be)
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

/* A digit in a text font (src/omr/digits.js): kind 'time' (a time signature's, two spaces tall) or 'tuplet'
   (a tuplet's number) → { cls: 't3'…, conf, d } or null */
export const classifyDigit = (f, kind = 'time', k = 3) => classify(f, k, null, kind);

/* A feature record packed the way templates.js stores it */
export function pack(cls, f) {
  const out = new Uint8Array(REC);
  out[0] = CLASSES.indexOf(cls);
  out[1] = Math.min(255, Math.round(f.w * 24)); out[2] = Math.min(255, Math.round(f.h * 24)); out[3] = Math.round(f.fill * 255);
  for (let k = 0; k < G; k++) out[4 + k] = Math.round(f.grid[k] * 255);
  return out;
}
