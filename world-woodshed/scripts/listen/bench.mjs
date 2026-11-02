/* Measures how well the listening analyzer (src/analyzer.js) hears guitar notes.
   Builds phrases from the app's own recorded guitars (public/samples/guitar-*), puts them
   through a phone-like chain (mic roll-off, room, noise, level) and scores the 'note' events
   against what was played. Needs ffmpeg. Usage: node scripts/listen/bench.mjs [--seed N] [--n N] [--verbose] */
import { execFileSync } from 'node:child_process';
import { readdirSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SR = 48000;
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? +args[i + 1] : d; };
const verbose = args.includes('--verbose');
const anPath = args.includes('--analyzer') ? path.resolve(args[args.indexOf('--analyzer') + 1]) : path.join(ROOT, 'src/analyzer.js');
const { Analyzer } = await import(anPath);
let seed = arg('--seed', 1);
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const gauss = () => { let u = 0; for (let i = 0; i < 6; i++) u += rnd(); return u - 3; };

const CACHE = path.join(os.tmpdir(), 'ww-listen-bench'); mkdirSync(CACHE, { recursive: true });
function decode(file) {
  const c = path.join(CACHE, path.basename(path.dirname(file)) + '-' + path.basename(file) + '.f32');
  const raw = existsSync(c) ? readFileSync(c) : execFileSync('ffmpeg', ['-v', 'quiet', '-i', file, '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], { maxBuffer: 1 << 26 });
  if (!existsSync(c)) writeFileSync(c, raw);
  const x = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
  // the files start a little before the attack: trim to the first sample above -40 dB of the peak
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

/* --- the phone: biquads, room, noise --- */
function biquad(x, type, f, q = 0.707) {
  const w = 2 * Math.PI * f / SR, c = Math.cos(w), al = Math.sin(w) / (2 * q);
  let b0, b1, b2; const a0 = 1 + al, a1 = -2 * c, a2 = 1 - al;
  if (type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; } else { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; }
  const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; }
  return y;
}
function room(x, rt, wet) {
  // sparse exponentially decaying impulse response (a small room), convolved directly
  const taps = []; const len = Math.round(rt * SR);
  for (let k = 0; k < 160; k++) { const d = Math.round(SR * 0.003 + rnd() * len); taps.push([d, (rnd() * 2 - 1) * Math.exp(-6.9 * d / len) * wet * 0.4]); }
  const y = Float32Array.from(x);
  for (const [d, g] of taps) for (let i = d; i < x.length; i++) y[i] += g * x[i - d];
  return y;
}
const PROFILES = {
  clean: { hp: 0, lp: 0, room: 0, noise: 0, level: [0.3, 0.6] },
  phone: { hp: 150, lp: 7000, room: 0.25, noise: 0.0004, level: [0.05, 0.3] },
  laptop: { hp: 250, lp: 8000, room: 0.35, noise: 0.0005, fan: 0.003, level: [0.03, 0.15], glide: 30, detune: 15 },
  'laptop quiet': { hp: 250, lp: 8000, room: 0.35, noise: 0.0003, fan: 0.001, level: [0.006, 0.025], glide: 30, detune: 15 },
  'phone far': { hp: 200, lp: 6000, room: 0.45, noise: 0.0008, level: [0.015, 0.08] }
};

/* --- a phrase: mostly steps, some leaps and repeats; a note is damped by the next one or rings on --- */
let curDetune = 0; const PROFILES_DETUNE = () => curDetune;
function phrase(kit, n) {
  const notes = []; let t = 0.6, m = 45 + Math.floor(rnd() * 30);
  for (let i = 0; i < n; i++) {
    const r = rnd();
    if (r < 0.15) { /* repeat */ } else if (r < 0.75) m += rnd() < 0.5 ? -1 - Math.floor(rnd() * 2) : 1 + Math.floor(rnd() * 2); else m += Math.round(gauss() * 6);
    m = Math.max(40, Math.min(84, m));
    const ioi = [0.22, 0.3, 0.4, 0.5, 0.75, 1][Math.floor(rnd() * 6)];
    // a repeated note is played on the same string, which stops it ringing
    if (notes.length && notes[notes.length - 1].midi === m) notes[notes.length - 1].damp = true;
    notes.push({ t, midi: m, vel: 0.35 + rnd() * 0.65, dur: ioi, damp: rnd() < 0.6 });
    t += ioi;
  }
  return { notes, len: t + 1, detune: PROFILES_DETUNE() };
}
function render(kit, ph, prof) {
  let x = ph.raw ? Float32Array.from(ph.raw) : new Float32Array(Math.ceil(ph.len * SR));
  for (const nt of ph.notes) {
    const smp = kits[kit][nt.midi]; const s0 = Math.round(nt.t * SR);
    // damped: the pick or the fretting hand stops it just before the next note
    const end = nt.damp ? Math.round((nt.dur - 0.015) * SR) : smp.length, rel = Math.round(0.02 * SR);
    // a real string: the guitar a little off A440 and each pluck starting sharp, harder ones more
    const cents0 = (ph.detune || 0) + (prof.glide ? prof.glide * nt.vel : 0);
    let pos = 0;
    for (let i = 0; s0 + i < x.length; i++) {
      const j = Math.floor(pos); if (j + 1 >= smp.length) break;
      let g = nt.vel; if (i > end) { if (i > end + rel) break; g *= 1 - (i - end) / rel; }
      x[s0 + i] += (smp[j] + (pos - j) * (smp[j + 1] - smp[j])) * g;
      pos += Math.pow(2, ((ph.detune || 0) + (cents0 - (ph.detune || 0)) * Math.exp(-i / SR / 0.05)) / 1200);
    }
  }
  // the guitar at its level, the room's hiss and a fan's rumble, all through the mic's own roll-off
  if (prof.room) x = room(x, 0.4, prof.room);
  const lvl = prof.level[0] + rnd() * (prof.level[1] - prof.level[0]);
  let pk = 1e-9; for (const v of x) pk = Math.max(pk, Math.abs(v));
  if (!ph.notes.length && !ph.raw) pk = 1;
  const noise = new Float32Array(x.length), fan = new Float32Array(x.length);
  let b = 0;
  for (let i = 0; i < x.length; i++) { b = 0.97 * b + (rnd() * 2 - 1) * 0.25; noise[i] = rnd() * 2 - 1 + b; fan[i] = rnd() * 2 - 1; }
  const fanF = biquad(biquad(fan, 'lp', 300), 'lp', 300);
  const rms = a => Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length);
  const nR = rms(noise), fR = rms(fanF);
  for (let i = 0; i < x.length; i++) x[i] = x[i] / pk * lvl + (prof.noise ? noise[i] / nR * prof.noise : 0) + (prof.fan ? fanF[i] / fR * prof.fan : 0);
  if (prof.hp) x = biquad(biquad(x, 'hp', prof.hp), 'hp', prof.hp);
  if (prof.lp) x = biquad(x, 'lp', prof.lp);
  return x;
}

let lastAll = [];
function run(x, opts = {}) {
  const ev = []; lastAll = [];
  const an = Analyzer(SR, { emit: e => { lastAll.push(e); if (e.type === 'note') ev.push(e); }, sensitivity: opts.sensitivity ?? arg('--sens', 0.5) });
  for (let i = 0; i < x.length; i += 512) an.push(x.subarray(i, Math.min(x.length, i + 512)), i / SR);
  return ev;
}
function score(ph, ev) {
  const out = { n: ph.notes.length, ok: 0, octave: 0, wrong: 0, missed: 0, extra: 0, late: [] };
  const used = new Set();
  ph.notes.forEach((nt, i) => {
    const nextT = i + 1 < ph.notes.length ? ph.notes[i + 1].t : Infinity;
    const cands = ev.map((e, k) => ({ e, k })).filter(({ e, k }) => !used.has(k) && e.t > nt.t - 0.06 && e.t < Math.min(nt.t + 0.15, nextT - 0.03));
    if (!cands.length) {
      out.missed++;
      if (verbose) {
        const near = lastAll.filter(e => e.t > nt.t - 0.05 && e.t < nt.t + 0.25 && e.type !== 'level').map(e => e.type[0] + (e.midi ? Math.round(e.midi * 10) / 10 : '') + '@' + Math.round((e.t - nt.t) * 1000));
        console.log('  missed', nt.midi, nt.t.toFixed(2), 'v' + nt.vel.toFixed(2), near.join(' '));
      }
      return;
    }
    const hit = cands.find(({ e }) => Math.round(e.midi) === nt.midi) || cands[0];
    used.add(hit.k);
    const d = Math.round(hit.e.midi) - nt.midi;
    if (d === 0) { out.ok++; out.late.push(hit.e.t - nt.t); } else if (d % 12 === 0) out.octave++; else out.wrong++;
    if (d && verbose) console.log('  heard', Math.round(hit.e.midi), 'for', nt.midi, nt.t.toFixed(2));
  });
  out.extra = ev.length - used.size;
  if (verbose) ev.forEach((e, k) => { if (!used.has(k)) {
    const near = ph.notes.filter(n => Math.abs(n.t - e.t) < 0.5).map(n => n.midi + '@' + Math.round((n.t - e.t) * 1000) + (n.damp ? 'd' : '') + 'v' + n.vel.toFixed(1)).join(' ');
    console.log('  extra', Math.round(e.midi * 10) / 10, e.t.toFixed(3), e.legato ? 'legato' : '', '| played', near);
  } });
  return out;
}

const LEN0 = 24;
/* things that are not a note played: the metronome woodblock from the laptop's speakers, the room alone,
   a note left to ring for four seconds. Counts the notes heard (any is a false alarm). */
function falseAlarms(prof) {
  const out = {};
  const wood = decode(path.join(ROOT, 'public/samples/wood/60-1-0.mp3'));
  const len = 10 * SR;
  const clicks = new Float32Array(len);
  for (let k = 0; k < 18; k++) {
    const s0 = Math.round((0.5 + k * 0.5) * SR), up = k % 4 === 0 ? Math.pow(2, 7 / 12) : 1; // the accent a fifth up
    for (let i = 0; s0 + i < len; i++) { const j = Math.floor(i * up); if (j + 1 >= wood.length) break; clicks[s0 + i] += wood[j] * 0.5; }
  }
  const asPhrase = x => ({ notes: [], len: x.length / SR, raw: x });
  const mev = run(render(null, asPhrase(clicks), prof)); out.metronome = mev.length;
  if (verbose) console.log('   metronome heard as', mev.map(e => Math.round(e.midi * 10) / 10).join(' '));
  out.room = run(render(null, asPhrase(new Float32Array(len)), prof)).length;
  let ring = 0;
  for (const kit of Object.keys(kits)) for (const m of [40, 45, 52, 57, 64, 69, 76]) {
    const ev = run(render(kit, { notes: [{ t: 0.5, midi: m, vel: 0.8, dur: 4, damp: false }], len: 4.5 }, prof));
    ring += Math.max(0, ev.length - 1);
    if (verbose && ev.length > 1) console.log('   ringing', kit, m, ev.map(e => Math.round(e.midi * 10) / 10 + '@' + e.t.toFixed(2) + (e.legato ? 'L' : '')).join(' '));
  }
  out.ringing = ring;
  return out;
}
/* single notes after silence, as the note quizzes hear them: is the first note heard the one played? */
function singles(kit, prof) {
  const r = { n: 0, ok: 0, octave: 0, wrong: 0, missed: 0, bad: [] };
  for (let m = 40; m <= 84; m++) {
    const ph = { notes: [{ t: 0.8, midi: m, vel: 0.4 + rnd() * 0.6, dur: 2, damp: false }], len: 3, detune: (rnd() * 2 - 1) * (prof.detune || 0) };
    const ev = run(render(kit, ph, prof)).filter(e => e.t > 0.7);
    r.n++;
    if (!ev.length) { r.missed++; r.bad.push(m + ':-'); continue; }
    const d = Math.round(ev[0].midi) - m;
    if (!d) r.ok++; else {
      if (d % 12 === 0) r.octave++; else r.wrong++; r.bad.push(m + ':' + (d > 0 ? '+' : '') + d);
      if (args.includes('--why')) console.log('   ', kit, m, lastAll.filter(e => e.type !== 'level' && e.t > 0.7 && e.t < 1.0).map(e => e.type[0] + (e.midi ? Math.round(e.midi * 10) / 10 : '') + (e.clarity ? '/' + e.clarity.toFixed(2) : '') + '@' + Math.round((e.t - 0.8) * 1000)).join(' '));
    }
  }
  return r;
}
if (args.includes('--false')) {
  console.log('false alarms   metronome  room  ringing (notes heard that were not played)');
  for (const [pname, prof] of Object.entries(PROFILES)) { const f = falseAlarms(prof); console.log(pname.padEnd(14), String(f.metronome).padStart(9), String(f.room).padStart(5), String(f.ringing).padStart(8)); }
}
if (!args.includes('--no-singles')) {
  console.log('single notes   kit           notes  right  octave  wrong  missed');
  for (const [pname, prof] of Object.entries(PROFILES)) {
    for (const kit of Object.keys(kits)) {
      const r = singles(kit, prof); const pc = k => (100 * r[k] / r.n).toFixed(1).padStart(5) + '%';
      console.log(pname.padEnd(14), kit.padEnd(13), String(r.n).padStart(5), pc('ok'), ' ', pc('octave'), pc('wrong'), ' ', pc('missed'), verbose ? r.bad.join(' ') : '');
    }
  }
}
if (args.includes('--trace')) {
  const [kit, pname, idx] = args[args.indexOf('--trace') + 1].split(':');
  const ph = phrase(kit, LEN0); const x = render(kit, ph, PROFILES[pname]);
  const nt = ph.notes[+idx]; console.log(ph.notes.slice(Math.max(0, idx - 2), +idx + 1));
  globalThis.TRACE = [nt.t - 0.02, nt.t + 0.04]; run(x); process.exit(0);
}
if (args.includes('--one')) {
  const [kit, pname, m] = args[args.indexOf('--one') + 1].split(':');
  const ph = { notes: [{ t: 0.8, midi: +m, vel: 0.7, dur: 2, damp: false }], len: 2 };
  run(render(kit, ph, PROFILES[pname]));
  console.log(lastAll.filter(e => e.type !== 'level' && e.t > 0.7 && e.t < 1.3).map(e => e.type[0] + (e.midi ? Math.round(e.midi * 10) / 10 : '') + '@' + Math.round((e.t - 0.8) * 1000)).join(' '));
  process.exit(0);
}
const N = arg('--n', 12), LEN = LEN0;
console.log('profile        kit           notes  right  octave  wrong  missed  extra');
const all = { n: 0, ok: 0 };
const only = args.includes('--profile') ? args[args.indexOf('--profile') + 1] : null;
for (const [pname, prof] of Object.entries(PROFILES)) {
  if (only && pname !== only) continue;
  for (const kit of Object.keys(kits)) {
    const tot = { n: 0, ok: 0, octave: 0, wrong: 0, missed: 0, extra: 0 };
    for (let r = 0; r < N; r++) {
      curDetune = (rnd() * 2 - 1) * (prof.detune || 0); const ph = phrase(kit, LEN), x = render(kit, ph, prof);
      const sc = score(ph, run(x));
      for (const k in tot) tot[k] += sc[k];
    }
    all.n += tot.n; all.ok += tot.ok;
    const pc = k => (100 * tot[k] / tot.n).toFixed(1).padStart(5) + '%';
    console.log(pname.padEnd(14), kit.padEnd(13), String(tot.n).padStart(5), pc('ok'), ' ', pc('octave'), pc('wrong'), ' ', pc('missed'), ' ', String(tot.extra).padStart(4));
  }
}
console.log('overall right: ' + (100 * all.ok / all.n).toFixed(1) + '%');
