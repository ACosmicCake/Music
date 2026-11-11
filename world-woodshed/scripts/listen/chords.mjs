/* Measures how well "What chord is this?" (src/chordid.js) hears strummed chords.
   Strums real shapes on the app's recorded guitars (public/samples/guitar-*), one after another as a player
   would, through clean, phone and laptop-mic chains, and checks the notes heard and the name given against
   the shape played. Needs ffmpeg. Usage: node scripts/listen/chords.mjs [--seed N] [--verbose] [--file F.f32 --sr 44100]
   With --file it prints what it hears in a recording (32-bit float mono) instead. */
import { execFileSync } from 'node:child_process';
import { readdirSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ChordEar, nameChord, pcOf } from '../../src/chordid.js';
import { Analyzer } from '../../src/analyzer.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const verbose = args.includes('--verbose');
const NM = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const nm = m => NM[pcOf(m)] + (Math.floor(Math.round(m) / 12) - 1);

/* Feed samples to the analyzer (for strums) and the chord ear, as the app does; returns what it named */
function listen(x, SR) {
  const heard = [];
  const ear = ChordEar(SR, { onChord: c => heard.push(c) });
  const an = Analyzer(SR, { emit: e => { if (e.type === 'onset') ear.strum(e.t); } });
  for (let i = 0; i < x.length; i += 512) { const b = x.subarray(i, Math.min(x.length, i + 512)); ear.push(b, i / SR); an.push(b, i / SR); }
  return heard;
}

if (args.includes('--file')) {
  const sr = +arg('--sr', 44100), raw = readFileSync(arg('--file'));
  const x = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
  for (const c of listen(x, sr)) console.log(c.t.toFixed(2).padStart(6), (c.names[0] ? c.names[0].sym : '?').padEnd(10), c.notes.map(nm).join(' '), c.names.slice(1, 4).map(n => n.sym).join(', '));
  process.exit(0);
}

const SR = 48000;
let seed = +arg('--seed', 1);
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const CACHE = path.join(os.tmpdir(), 'ww-listen-bench'); mkdirSync(CACHE, { recursive: true });
function decode(file) {
  const c = path.join(CACHE, path.basename(path.dirname(file)) + '-' + path.basename(file) + '.f32');
  const raw = existsSync(c) ? readFileSync(c) : execFileSync('ffmpeg', ['-v', 'quiet', '-i', file, '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], { maxBuffer: 1 << 26 });
  if (!existsSync(c)) writeFileSync(c, raw);
  const x = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
  let pk = 0; for (const v of x) pk = Math.max(pk, Math.abs(v));
  let s = 0; while (s < x.length && Math.abs(x[s]) < pk * 0.01) s++;
  return x.slice(Math.max(0, s - 24));
}
const kits = {};
for (const kit of ['guitar-nylon', 'guitar-steel']) {
  kits[kit] = {};
  for (const f of readdirSync(path.join(ROOT, 'public/samples', kit))) {
    const m = +f.split('-')[0];
    const x = decode(path.join(ROOT, 'public/samples', kit, f));
    let pk = 0; for (const v of x) pk = Math.max(pk, Math.abs(v));
    kits[kit][m] = x.map(v => v / pk);
  }
}
function biquad(x, type, f, q = 0.707) {
  const w = 2 * Math.PI * f / SR, c = Math.cos(w), al = Math.sin(w) / (2 * q);
  let b0, b1, b2; const a0 = 1 + al, a1 = -2 * c, a2 = 1 - al;
  if (type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; } else { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; }
  const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; }
  return y;
}
function room(x, rt, wet) {
  const taps = []; const len = Math.round(rt * SR);
  for (let k = 0; k < 160; k++) { const d = Math.round(SR * 0.003 + rnd() * len); taps.push([d, (rnd() * 2 - 1) * Math.exp(-6.9 * d / len) * wet * 0.4]); }
  const y = Float32Array.from(x);
  for (const [d, g] of taps) for (let i = d; i < x.length; i++) y[i] += g * x[i - d];
  return y;
}
const PROFILES = {
  clean: { hp: 0, lp: 0, room: 0, noise: 0, level: [0.3, 0.6] },
  phone: { hp: 150, lp: 7000, room: 0.25, noise: 0.0004, level: [0.05, 0.3] },
  laptop: { hp: 250, lp: 8000, room: 0.35, noise: 0.0005, fan: 0.003, level: [0.03, 0.15], detune: 15 }
};

/* Shapes, low E string first (null: muted), and the frets they move up by */
const TUNING = [40, 45, 50, 55, 59, 64];
const OPEN = [
  [0, 2, 2, 1, 0, 0], [0, 2, 2, 0, 0, 0], [0, 2, 0, 1, 0, 0], [0, 2, 0, 0, 0, 0], [null, 0, 2, 2, 2, 0], [null, 0, 2, 2, 1, 0],
  [null, 0, 2, 0, 2, 0], [null, 0, 2, 0, 1, 0], [null, 0, 2, 1, 2, 0], [null, 3, 2, 0, 1, 0], [3, 2, 0, 0, 0, 3], [null, null, 0, 2, 3, 2],
  [null, null, 0, 2, 3, 1], [null, null, 0, 2, 1, 2], [null, 3, 2, 0, 0, 0], [null, 0, 2, 2, 3, 0], [null, 0, 2, 2, 0, 0], [null, 3, 2, 0, 3, 0],
  [3, 2, 0, 0, 0, 1], [null, 3, 2, 3, 1, 0], [0, 2, 2, 1, 3, 0], [null, null, 0, 2, 1, 1]
];
const MOVABLE = [
  [1, 3, 3, 2, 1, 1], [1, 3, 3, 1, 1, 1], [1, 3, 1, 2, 1, 1], [1, 3, 1, 1, 1, 1], [null, 1, 3, 3, 3, 1], [null, 1, 3, 3, 2, 1],
  [null, 1, 3, 1, 3, 1], [null, 1, 3, 1, 2, 1], [null, 1, 3, 2, 3, 1], [1, null, 2, 2, 1, null], [null, 1, 2, 1, 2, null],
  [null, null, 1, 2, 1, 2], [null, 3, 2, 3, 3, null], [null, 2, 1, 2, 3, null], [1, null, 1, 2, 3, null], [null, 1, 3, 3, 4, 1],
  [2, null, 2, 2, 1, null], [null, 1, 1, 3, 1, 3]
];
function shapes() {
  const out = OPEN.map(f => f);
  for (const s of MOVABLE) for (const d of [0, 2, 4, 6]) out.push(s.map(f => (f === null ? null : f + d)));
  return out;
}
const midisOf = fr => fr.map((f, i) => (f === null ? null : TUNING[i] + f)).filter(m => m !== null);

function render(kit, chords, prof) {
  const gap = 1.6, len = 0.6 + gap * chords.length + 1;
  let x = new Float32Array(Math.ceil(len * SR));
  const detune = (rnd() * 2 - 1) * (prof.detune || 0);
  chords.forEach((ms, ci) => {
    const t0 = 0.6 + ci * gap, up = rnd() < 0.3;
    const order = up ? ms.slice().reverse() : ms;
    order.forEach((m, k) => {
      const smp = kits[kit][m]; if (!smp) return;
      const s0 = Math.round((t0 + k * (0.008 + rnd() * 0.017)) * SR), vel = 0.5 + rnd() * 0.5;
      const end = Math.round((gap - 0.03 - k * 0.012) * SR), rel = Math.round(0.02 * SR);
      let pos = 0; const step = Math.pow(2, detune / 1200);
      for (let i = 0; s0 + i < x.length; i++) {
        const j = Math.floor(pos); if (j + 1 >= smp.length) break;
        let g = vel; if (i > end) { if (i > end + rel) break; g *= 1 - (i - end) / rel; }
        x[s0 + i] += (smp[j] + (pos - j) * (smp[j + 1] - smp[j])) * g;
        pos += step;
      }
    });
  });
  if (prof.room) x = room(x, 0.4, prof.room);
  const lvl = prof.level[0] + rnd() * (prof.level[1] - prof.level[0]);
  let pk = 1e-9; for (const v of x) pk = Math.max(pk, Math.abs(v));
  const noise = new Float32Array(x.length), fan = new Float32Array(x.length);
  let b = 0;
  for (let i = 0; i < x.length; i++) { b = 0.97 * b + (rnd() * 2 - 1) * 0.25; noise[i] = rnd() * 2 - 1 + b; fan[i] = rnd() * 2 - 1; }
  const fanF = biquad(biquad(fan, 'lp', 300), 'lp', 300);
  const rms = a => Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length);
  const nR = rms(noise), fR = rms(fanF);
  for (let i = 0; i < x.length; i++) x[i] = x[i] / pk * lvl + (prof.noise ? noise[i] / nR * prof.noise : 0) + (prof.fan ? fanF[i] / fR * prof.fan : 0);
  if (prof.hp) x = biquad(biquad(x, 'hp', prof.hp), 'hp', prof.hp);
  if (prof.lp) x = biquad(x, 'lp', prof.lp);
  return { x, gap };
}

const all = shapes().filter(s => midisOf(s).every(m => m <= 88));
console.log('chords strummed   kit           chords  name right  notes right  bass right  nothing');
for (const [pname, prof] of Object.entries(PROFILES).filter(([k]) => !arg("--only") || k === arg("--only"))) {
  for (const kit of Object.keys(kits)) {
    const order = all.map(s => [rnd(), s]).sort((a, b) => a[0] - b[0]).map(p => p[1]);
    const r = { n: 0, name: 0, notes: 0, bass: 0, none: 0 };
    for (let i = 0; i < order.length; i += 8) {
      const group = order.slice(i, i + 8), chords = group.map(midisOf);
      const { x, gap } = render(kit, chords, prof);
      const heard = listen(x, SR);
      chords.forEach((ms, ci) => {
        r.n++;
        const t0 = 0.6 + ci * gap;
        const mine = heard.filter(c => c.t > t0 && c.t < t0 + gap);
        if (!mine.length) { r.none++; if (verbose) console.log('  nothing for', ms.map(nm).join(' ')); return; }
        const c = mine[mine.length - 1], want = nameChord(ms)[0];
        const pcsW = [...new Set(ms.map(pcOf))].sort().join(), pcsH = [...new Set(c.notes.map(pcOf))].sort().join();
        if (pcsW === pcsH) r.notes++;
        if (pcOf(c.notes[0]) === pcOf(ms[0])) r.bass++;
        const ok = c.names[0] && want && c.names[0].sym === want.sym;
        if (ok) r.name++;
        else if (verbose) console.log('  ', (want ? want.sym : '?').padEnd(9), ms.map(nm).join(' ').padEnd(24), '→', (c.names[0] ? c.names[0].sym : '?').padEnd(9), c.notes.map(nm).join(' '));
      });
    }
    const pc = k => (100 * r[k] / r.n).toFixed(0).padStart(4) + '%';
    console.log(pname.padEnd(17), kit.padEnd(13), String(r.n).padStart(6), pc('name').padStart(11), pc('notes').padStart(12), pc('bass').padStart(11), pc('none').padStart(8));
  }
}
