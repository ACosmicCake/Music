/* Makes src/omr/templates.js: example shapes for the symbol classifier, cut from engraved test pages.

     python3 scripts/omr/make-pages.py /tmp/omr/train 120 --seed 7
     node scripts/omr/train.mjs /tmp/omr/train [per-class]

   Each page comes with a second image whose glyphs are coloured by class (make-pages.py). The page goes
   through the same steps as in the app (src/omr/prepare.js), and every piece of ink is labelled with the
   class most of its coloured pixels have: 'note' if it holds any part of a note, 'other' if no glyph. A
   spread of examples per class (farthest-point sampling) is kept. */
import fs from 'fs';
import path from 'path';
import { prepare } from '../../src/omr/prepare.js';
import { components, features, shapeDist as dist } from '../../src/omr/shapes.js';

const dir = process.argv[2];
const PER = Number(process.argv[3] || 40);

function readP(f) {
  const b = fs.readFileSync(f); let p = 0;
  const tok = () => { while (/\s/.test(String.fromCharCode(b[p]))) p++; let s = ''; while (!/\s/.test(String.fromCharCode(b[p]))) s += String.fromCharCode(b[p++]); return s; };
  const magic = tok(), w = +tok(), h = +tok(); tok(); p++;
  return { w, h, d: new Uint8Array(b.subarray(p, p + w * h * (magic === 'P6' ? 3 : 1))), rgb: magic === 'P6' };
}

const pages = fs.readdirSync(dir).filter(f => f.endsWith('.label.ppm')).map(f => path.join(dir, f.replace('.label.ppm', '')));
const samples = new Map();
let glyphClasses = null;
for (const base of pages) {
  const meta = JSON.parse(fs.readFileSync(base + '.json', 'utf8'));
  glyphClasses = meta.classes;
  const g = readP(base + '.pgm'), lab = readP(base + '.label.ppm');
  const p = prepare(g, { rotate: false });
  const { w, h } = p.R, sp = p.metrics.space;
  const { labels, comps } = components(p.R);
  // the glyph class under each pixel of the prepared page (exact colours only: the anti-aliased edges blend)
  const clsAt = (x, y) => {
    const sx = Math.min(lab.w - 1, Math.round(x / p.scale)), sy = Math.min(lab.h - 1, Math.round(y / p.scale));
    const o = (sy * lab.w + sx) * 3, r = lab.d[o], gg = lab.d[o + 1], b = lab.d[o + 2];
    if (gg !== 200 || b !== 50 || (r - 10) % 5) return -1;
    return (r - 10) / 5;
  };
  const tally = new Map();
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const id = labels[y * w + x]; if (!id) continue;
    const c = clsAt(x, y); if (c < 0) continue;
    let t = tally.get(id); if (!t) { t = new Map(); tally.set(id, t); }
    t.set(c, (t.get(c) || 0) + 1);
  }
  comps.forEach(c => {
    if (!c) return;
    const cw = (c.x1 - c.x0 + 1) / sp, ch = (c.y1 - c.y0 + 1) / sp;
    if ((cw < 0.15 && ch < 0.15) || cw > 4 || ch > 9 || (cw < 0.4 && ch > 1.5)) return; // thin upright lines are stems and bar lines
    const t = tally.get(c.id);
    let cls = 'other';
    if (t) {
      const noteIdx = glyphClasses.indexOf('note');
      const total = [...t.values()].reduce((a, b) => a + b, 0);
      if (t.get(noteIdx) > 3) cls = 'note';
      else if (total > c.area * 0.15) cls = glyphClasses[[...t.entries()].sort((a, b) => b[1] - a[1])[0][0]];
    }
    if (cls === 'clefF' && ch < 1.2) cls = 'other'; // the bass clef's two dots are pieces of their own
    const f = features(labels, w, c, sp);
    if (!samples.has(cls)) samples.set(cls, []);
    samples.get(cls).push(f);
  });
  process.stderr.write('.');
}
process.stderr.write('\n');

if (process.argv.includes('--eval')) {
  // how the current templates classify these pages' pieces
  const { classify } = await import('../../src/omr/classify.js');
  const conf = new Map(); let ok = 0, n = 0;
  for (const [cls, list] of samples) for (const f of list) {
    const r = classify(f); const got = r ? r.cls : 'none';
    n++; if (got === cls || (got === 'none' && cls === 'other')) ok++;
    else { const k = cls + ' → ' + got; conf.set(k, (conf.get(k) || 0) + 1); if (process.env.SHOW === k) console.log(f.w.toFixed(2), f.h.toFixed(2), f.fill.toFixed(2)); }
  }
  console.log('accuracy', (ok / n * 100).toFixed(1) + '%', n);
  [...conf.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).forEach(([k, v]) => console.log(String(v).padStart(5), k));
  process.exit(0);
}

const CLASSES = [...new Set([...(glyphClasses || []), 'other'])];
const out = [];
for (const [cls, list] of samples) {
  // farthest-point sampling: a spread of examples, not a pile of near-identical ones
  const keep = [list[0]];
  const dmin = list.map(f => dist(f, list[0]));
  const per = cls === 'other' || cls === 'note' ? PER * 3 : PER;
  while (keep.length < Math.min(per, list.length)) {
    let bi = 0; for (let i = 1; i < list.length; i++) if (dmin[i] > dmin[bi]) bi = i;
    if (dmin[bi] < 0.004) break;
    keep.push(list[bi]);
    for (let i = 0; i < list.length; i++) dmin[i] = Math.min(dmin[i], dist(list[i], list[bi]));
  }
  console.log(cls.padEnd(8), String(list.length).padStart(6), 'examples, kept', keep.length);
  keep.forEach(f => out.push([cls, f]));
}
const REC = 64;
const buf = new Uint8Array(out.length * REC);
out.forEach(([cls, f], i) => {
  const o = i * REC;
  buf[o] = CLASSES.indexOf(cls);
  buf[o + 1] = Math.min(255, Math.round(f.w * 24)); buf[o + 2] = Math.min(255, Math.round(f.h * 24)); buf[o + 3] = Math.round(f.fill * 255);
  for (let k = 0; k < 60; k++) buf[o + 4 + k] = Math.round(f.grid[k] * 255);
});
const js = `/* Generated by scripts/omr/train.mjs from engraved test pages (fonts: Bravura, Leland, Leipzig, Gootville and
   Petaluma, all SIL Open Font License). Each record: class, width and height (1/24 space), fill, 6 × 10 ink grid. */
export const CLASSES = ${JSON.stringify(CLASSES)};
export const DATA = '${Buffer.from(buf).toString('base64')}';
`;
fs.writeFileSync(new URL('../../src/omr/templates.js', import.meta.url), js);
console.log('templates:', out.length, 'bytes', js.length);
