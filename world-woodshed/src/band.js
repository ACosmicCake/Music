/* World Woodshed — the backing band for the Repertoire gym.
   Swing: walking upright bass, piano comping in rootless voicings with voice leading,
   a ride-cymbal kit. Bossa nova: two-feel bass, cross-stick, comping on the clave.
   Other grooves use the pattern data with the same bass and voice-led guitar chords.
   Parts mix on a small bus with a room reverb, so any of them can be muted, e.g. bass alone. */
import A from './audio.js';
import Samples from './samples.js';
import { prepare } from './drumkit.js';

const pcOf = m => ((m % 12) + 12) % 12;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
function wpick(list) { // [[item, weight]]
  let t = list.reduce((s, x) => s + x[1], 0) * Math.random();
  for (const [x, w] of list) { if ((t -= w) <= 0) return x; }
  return list[list.length - 1][0];
}

/* ---------- mixing bus ---------- */
let bus = null, noise = null, rideBuf = null, chickBuf = null;
const live = new Set();
function keep(node, until) { live.add(node); node.onended = () => live.delete(node); node.stop(until); }

function impulse(ctx, secs) {
  const sr = ctx.sampleRate, len = Math.floor(sr * secs), buf = ctx.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch); let lp = 0;
    for (let i = 0; i < len; i++) {
      const t = i / sr;
      lp += 0.45 * ((Math.random() * 2 - 1) - lp);
      d[i] = t < 0.012 ? 0 : lp * Math.exp(-t * 3.4);
    }
  }
  return buf;
}
function getBus() {
  const ctx = A.ensure();
  if (bus) return bus;
  const out = ctx.createGain(); out.gain.value = 0.9; out.connect(A.out());
  const conv = ctx.createConvolver(); conv.buffer = impulse(ctx, 1.8);
  const rev = ctx.createGain(); rev.gain.value = 0.3;
  conv.connect(rev); rev.connect(out);
  const part = (level, send, pan) => {
    const g = ctx.createGain(); g.gain.value = level;
    let head = g;
    if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); head = p; }
    head.connect(out);
    const s = ctx.createGain(); s.gain.value = send; head.connect(s); s.connect(conv);
    return { in: g, level };
  };
  const sr = ctx.sampleRate;
  noise = ctx.createBuffer(1, sr, sr);
  const nd = noise.getChannelData(0); for (let i = 0; i < sr; i++) nd[i] = Math.random() * 2 - 1;
  bus = { ctx, out, drums: part(0.62, 0.22, 0.12), comp: part(0.78, 0.45, -0.18), bass: part(1.0, 0.1, 0) };
  return bus;
}

/* ---------- instruments ---------- */
/* A recorded note when the instrument's samples have loaded (they start loading with the band),
   else null and the synth voice plays. */
function sampled(id, m, when, dur, vel, dest) {
  const n = Samples.play(id, m, when, vel, dur, dest);
  if (n) { live.add(n); n.onended = () => live.delete(n); }
  return n;
}

/* Upright bass: a recorded double bass, pizzicato. Until it loads: a sine body with a filtered saw
   for the string, plucked by a fast filter sweep. */
function bassVoice(m, when, dur, vel, bright) {
  // the synth's vel tops out near 0.55; the samples' layers span 0–1
  if (sampled('upright', m, when, dur, Math.min(1, vel * 1.6), bus.bass.in)) return;
  const { ctx } = bus, f = A.mtof(m), dest = bus.bass.in;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(vel, when + 0.007);
  g.gain.setTargetAtTime(vel * (bright ? 0.6 : 0.45), when + 0.007, bright ? 0.25 : 0.16);
  g.gain.setTargetAtTime(0.0001, when + dur, 0.035);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2.2;
  lp.frequency.setValueAtTime(bright ? 2400 : Math.min(1700, f * 16), when);
  lp.frequency.setTargetAtTime(bright ? 900 : Math.max(240, f * 4.5), when + 0.004, 0.06);
  const saw = ctx.createOscillator(); saw.type = 'sawtooth'; saw.frequency.value = f;
  const sg = ctx.createGain(); sg.gain.value = 0.35;
  const body = ctx.createOscillator(); body.type = 'sine'; body.frequency.value = f;
  const oct = ctx.createOscillator(); oct.type = 'sine'; oct.frequency.value = f * 2;
  const og = ctx.createGain(); og.gain.value = 0.3;
  saw.connect(sg); sg.connect(lp); body.connect(lp); oct.connect(og); og.connect(lp);
  lp.connect(g); g.connect(dest);
  // the finger on the string
  const n = ctx.createBufferSource(); n.buffer = noise;
  const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 700; nf.Q.value = 1;
  const ng = ctx.createGain(); ng.gain.setValueAtTime(vel * 0.25, when); ng.gain.exponentialRampToValueAtTime(0.0001, when + 0.03);
  n.connect(nf); nf.connect(ng); ng.connect(dest);
  const end = when + dur + 0.25;
  [saw, body, oct].forEach(o => { o.start(when); keep(o, end); });
  n.start(when, Math.random() * 0.5); keep(n, when + 0.05);
}

/* Electric-piano comping voice (two-operator FM: warm, round attack, bell-like decay) */
function epNote(m, when, dur, vel) {
  const { ctx } = bus, f = A.mtof(m), dest = bus.comp.in;
  const car = ctx.createOscillator(); car.frequency.value = f;
  const car2 = ctx.createOscillator(); car2.frequency.value = f * 1.0025;
  const mod = ctx.createOscillator(); mod.frequency.value = f;
  const mg = ctx.createGain();
  mg.gain.setValueAtTime(f * (0.9 + 1.6 * vel), when);
  mg.gain.setTargetAtTime(f * 0.25, when, 0.25);
  mod.connect(mg); mg.connect(car.frequency); mg.connect(car2.frequency);
  const g = ctx.createGain();
  const peak = vel * 0.16 * (m > 72 ? 0.8 : 1);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(peak, when + 0.005);
  g.gain.setTargetAtTime(peak * 0.35, when + 0.005, 0.6);
  g.gain.setTargetAtTime(0.0001, when + dur, 0.09);
  const c2 = ctx.createGain(); c2.gain.value = 0.5;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
  car.connect(lp); car2.connect(c2); c2.connect(lp); lp.connect(g); g.connect(dest);
  const end = when + dur + 0.6;
  [car, car2, mod].forEach(o => { o.start(when); keep(o, end); });
}
/* Piano: a recorded grand when loaded, else the electric-piano synth. The notes of a chord land a few
   milliseconds apart, as a hand's fingers do. */
function pianoChord(notes, when, dur, vel) {
  notes.forEach((m, i) => {
    const t = when + i * 0.004 + rnd(0, 0.006), v = vel * rnd(0.9, 1.05);
    if (!sampled('piano', m, t, dur, v * 0.8, bus.comp.in)) epNote(m, t, dur, v);
  });
}
function guitarChord(notes, when, dur, vel, tone) { A.strum(notes, when, vel, 0.012, dur, { out: bus.comp.in, tone: tone || 1900 }); }

/* Drum kit */
function buildRide(ctx) {
  const sr = ctx.sampleRate, len = Math.floor(sr * 1.6), buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
  const partial = (f, amp, decay) => {
    const w = 2 * Math.PI * f / sr, c = Math.cos(w), s = Math.sin(w), k = Math.exp(-1 / (decay * sr));
    let x = Math.random(), y = Math.sqrt(1 - x * x), a = amp;
    for (let i = 0; i < len; i++) { const nx = x * c - y * s; y = x * s + y * c; x = nx; d[i] += a * y; a *= k; }
  };
  for (let i = 0; i < 64; i++) partial(rnd(3000, 9500), rnd(0.2, 1) / 16, rnd(0.25, 1.2));
  [[620, 0.12, 1.1], [1340, 0.1, 0.9], [2110, 0.07, 0.7], [2890, 0.06, 0.6]].forEach(p => partial(...p)); // the bell ("ping")
  let lp = 0;
  for (let i = 0; i < Math.floor(sr * 0.012); i++) { lp += 0.5 * ((Math.random() * 2 - 1) - lp); d[i] += lp * 0.5 * (1 - i / (sr * 0.012)); } // stick
  let pk = 0; for (let i = 0; i < len; i++) pk = Math.max(pk, Math.abs(d[i]));
  for (let i = 0; i < len; i++) d[i] *= 0.6 / pk;
  return buf;
}
function buildChick(ctx) {
  const sr = ctx.sampleRate, len = Math.floor(sr * 0.12), buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
  let p1 = 0, p2 = 0;
  for (let i = 0; i < len; i++) {
    const r = Math.random() * 2 - 1, h1 = r - p1; p1 = r; const h2 = h1 - p2; p2 = h1;
    const t = i / sr;
    d[i] = (0.5 * h2 * Math.exp(-t / 0.022) + 0.3 * Math.sin(2 * Math.PI * 380 * t) * Math.exp(-t / 0.012)) * Math.min(1, t / 0.0015);
  }
  return buf;
}
function sample(buf, when, vel, rate = 1, pan = 0) {
  const { ctx } = bus;
  const s = ctx.createBufferSource(); s.buffer = buf; s.playbackRate.value = rate;
  const g = ctx.createGain(); g.gain.value = vel;
  let head = g;
  if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); head = p; }
  s.connect(g); head.connect(bus.drums.in);
  s.start(when); keep(s, when + buf.duration / rate);
}
const ride = (t, v) => sample(rideBuf, t, v * 0.55, rnd(0.995, 1.005), 0.3);
const chick = (t, v) => sample(chickBuf, t, v * 0.7, 1, -0.2);
function kick(t, v) {
  const { ctx } = bus, o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(72, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.12);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  o.connect(g); g.connect(bus.drums.in); o.start(t); keep(o, t + 0.32);
}
function snare(t, v) {
  const { ctx } = bus;
  const n = ctx.createBufferSource(); n.buffer = noise;
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = 0.7;
  const g = ctx.createGain(); g.gain.setValueAtTime(v * 0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  n.connect(f); f.connect(g); g.connect(bus.drums.in); n.start(t, Math.random() * 0.5); keep(n, t + 0.16);
  const o = ctx.createOscillator(); o.frequency.value = 185;
  const og = ctx.createGain(); og.gain.setValueAtTime(v * 0.3, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
  o.connect(og); og.connect(bus.drums.in); o.start(t); keep(o, t + 0.09);
}
function crossStick(t, v) {
  const { ctx } = bus;
  [[1750, 0.035, 0.5], [520, 0.05, 0.35]].forEach(([fr, dec, a]) => {
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = fr;
    const g = ctx.createGain(); g.gain.setValueAtTime(v * a, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
    o.connect(g); g.connect(bus.drums.in); o.start(t); keep(o, t + dec + 0.02);
  });
}

/* ---------- harmony helpers ---------- */
const LO = 28, HI = 50; // bass range: low E to the D above the open strings
function nearest(pc, ref, lo = LO, hi = HI) {
  let best = null;
  for (let m = lo; m <= hi; m++) if (pcOf(m) === pc && (best === null || Math.abs(m - ref) < Math.abs(best - ref))) best = m;
  return best;
}
function chordTones(c) { return [0, c.third, c.fifth, c.seventh].filter(x => x !== null).map(x => (c.root + x) % 12); }
function scalePcs(c) {
  let base;
  if (c.fifth === 6 && c.seventh === 9) base = [0, 2, 3, 5, 6, 8, 9, 11];
  else if (c.fifth === 6) base = [0, 1, 3, 5, 6, 8, 10];
  else if (c.third === 4) base = c.seventh === 10 ? [0, 2, 4, 5, 7, 9, 10] : [0, 2, 4, 5, 7, 9, 11];
  else base = c.seventh === 11 ? [0, 2, 3, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 9, 10];
  const out = new Set(base.map(x => (c.root + x) % 12));
  c.iv.forEach(x => out.add((c.root + x) % 12));
  if (c.iv.includes(18)) out.delete((c.root + 5) % 12);
  if (c.iv.includes(13)) out.delete((c.root + 2) % 12);
  return out;
}

/* One stretch of walking bass over chord c lasting n beats, starting on S, heading to the next chord.
   Returns the notes and T, where the next stretch starts. Roots on the changes, chord and scale tones
   in between, a chromatic or dominant approach into the next chord. */
function walkStretch(c, n, next, S, twoFeel) {
  let T;
  const center = 39;
  if (next.sym === c.sym) { // the same chord continues: roam to another chord tone
    const opts = [];
    for (let m = LO; m <= HI; m++) if (chordTones(c).includes(pcOf(m)) && Math.abs(m - S) >= 3 && Math.abs(m - S) <= 9) opts.push(m);
    T = opts.length ? pick(opts) : S;
  } else T = nearest(next.root, S * 0.65 + center * 0.35);
  const sc = scalePcs(c), ct = chordTones(c);
  const approach = prev => {
    const c5 = T + 7 <= HI ? T + 7 : T - 5;
    const step = [T + 2, T - 2, T + 1, T - 1].filter(m => sc.has(pcOf(m)));
    const cands = [[T - 1, 3], [T + 1, 3], [c5, 1]].concat(step.slice(0, 1).map(m => [m, 2]))
      .filter(([m]) => m >= LO && m <= HI + 1 && m !== prev && m !== T);
    return cands.length ? wpick(cands) : T - 1;
  };
  if (n <= 1) return { notes: [[0, S, 1]], T };
  if (twoFeel && n >= 4) {
    const fifth = nearest((c.root + c.fifth) % 12, S);
    const second = Math.random() < 0.6 ? fifth : approach(S);
    return { notes: [[0, S, 2], [2, second === S ? approach(S) : second, 2]], T };
  }
  if (n === 2) return { notes: [[0, S, 1], [1, approach(S), 1]], T };
  const A4 = approach(S);
  const inner = [];
  let prev = S;
  const used = [S, A4];
  for (let k = 1; k < n - 1; k++) {
    const goal = S + (A4 - S) * k / (n - 1);
    const strong = k === 2;
    let best = null, bc = Infinity;
    for (let m = Math.max(LO, prev - 5); m <= Math.min(HI, prev + 5); m++) {
      if (m === prev || !sc.has(pcOf(m))) continue;
      if (k === n - 2 && (m === A4 || Math.abs(m - A4) > 4)) continue;
      const cost = Math.abs(m - goal) + (ct.includes(pcOf(m)) ? (strong ? -1.5 : -0.6) : 0) + (used.includes(m) ? 1.5 : 0) + Math.random() * 1.8;
      if (cost < bc) { bc = cost; best = m; }
    }
    if (best === null) best = prev + (A4 > prev ? 2 : -2);
    inner.push(best); used.push(best); prev = best;
  }
  const line = [S].concat(inner, [A4]);
  return { notes: line.map((m, k) => [k, m, 1]), T };
}

/* Rootless piano voicings (Bill Evans "A" and "B" forms) and shells for guitar */
function pianoShapes(c) {
  const has = x => c.iv.includes(x);
  if (c.fifth === 6 && c.seventh === 9) return [[3, 6, 9, 12], [6, 9, 12, 15], [9, 12, 15, 18]];
  if (c.fifth === 6) return [[3, 6, 10, 12], [10, 12, 15, 18], [3, 6, 10, 14]];
  if (c.triad) {
    const [a, b, d] = c.iv;
    return [[a, b, d, 12], [b, d, 12, b + 12], [d, 12, b + 12, d + 12]];
  }
  if (c.third === 4 && c.seventh === 10) {
    if (has(18)) return [[4, 10, 14, 18], [10, 16, 18, 21]];
    if (has(13)) return [[4, 9, 10, 13], [10, 13, 16, 21]];
    if (has(15)) return [[4, 10, 15, 20], [-2, 4, 8, 15]];
    return [[4, 9, 10, 14], [10, 14, 16, 21]];
  }
  if (c.third === 4 && c.seventh === 9) return [[4, 7, 9, 14], [9, 14, 16, 19]];
  if (c.third === 4) return [[4, 7, 11, 14], [11, 14, 16, 19]];
  if (c.seventh === 9) return [[3, 7, 9, 14], [9, 14, 15, 19]];
  if (c.seventh === 11) return [[3, 7, 11, 14], [11, 14, 15, 19]];
  return [[3, 7, 10, 14], [10, 14, 15, 19]];
}
function guitarShapes(c) {
  const s7 = c.seventh !== null ? c.seventh : 12;
  return [[0, s7, c.third + 12], [0, c.third + 12, s7 + 12 > 22 ? s7 : s7 + 12].sort((a, b) => a - b), [0, c.fifth, c.third + 12, s7 === 12 ? 19 : s7 + 12]];
}
function voiceLead(shapes, root, prev, lo, hi, home) {
  let best = null, bc = Infinity;
  shapes.forEach(sh => {
    for (let base = root - 24; base <= root + 72; base += 12) {
      const v = sh.map(x => base + x).sort((a, b) => a - b);
      if (v[0] < lo || v[0] > hi || v[v.length - 1] > hi + 24) continue;
      let cost = Math.abs(v[0] - home) * (prev ? 0.15 : 1) + Math.random() * 1.2;
      if (prev) for (let i = 0; i < Math.min(v.length, prev.length); i++) cost += Math.abs(v[i] - prev[i]);
      if (cost < bc) { bc = cost; best = v; }
    }
  });
  return best;
}

/* Comping rhythms for a 4/4 swing bar, in eighths (0..7) with lengths in beats.
   Odd eighths anticipate the chord of the next beat. */
const SWING_1 = [
  [[[0, 1.4], [3, 1.2]], 4],          // Charleston
  [[[2, 0.6], [6, 0.6]], 2],          // 2 and 4
  [[[3, 0.6], [7, 1.4]], 2],          // and-of-2, push into the next bar
  [[[0, 3.2]], 1.5],                  // one long chord
  [[[1, 1], [5, 0.6]], 1.5],          // and-of-1, and-of-3
  [[[4, 1.6]], 1],                    // just beat 3
  [[[0, 0.5], [3, 0.6], [6, 0.5]], 1], // busier
  [[], 0.7]                           // space
];
const SWING_2 = [
  [[[0, 1.5], [4, 1.5]], 4],
  [[[1, 1], [5, 1]], 2],
  [[[0, 1], [3, 1.4]], 2],
  [[[0, 0.6], [4, 0.6], [7, 1]], 1]
];

/* ---------- the band ---------- */
export function Band(o) {
  // o: { bars: [[chord]], barsFor(chorus)?, range: [firstBar, lastBar]?, groove, grooveId, bpm(), parts: {drums, comp, bass},
  //      comp: 'piano'|'guitar', feel: 'walk'|'two', countIn, onBeat, onCount, onChorus(chorus) }
  // barsFor gives each pass its own chords (e.g. a new key every chorus); range loops a section of the form.
  const g = o.groove, gid = o.grooveId;
  const engine = gid === 'swing' ? 'swing' : gid === 'bossa' ? 'bossa' : 'pattern';
  const nb = o.bars.length;
  const lo = o.range ? Math.max(0, o.range[0]) : 0, hi = o.range ? Math.min(nb - 1, o.range[1]) : nb - 1;
  const barsOf = ch => (o.barsFor ? o.barsFor(ch) : o.bars);
  let bars = barsOf(0);
  const nextBar = (bi, ch) => (bi < hi ? bars[bi + 1] : barsOf(ch + 1)[lo]);
  const BPB = Math.round(g.steps / g.spb) || 4;
  const bright = ['rock', 'funk', 'reggae', 'soukous', 'highlife', 'son'].includes(gid);
  let loop = null, stopTimer = null, countTimers = [];
  let bassPrev = null, bassStart = null, voicing = null, pushed = false, barPlan = null;
  const history = [];
  const beatDur = () => 60 / o.bpm();
  const sw = () => { const b = o.bpm(); return b < 110 ? 0.66 : b < 180 ? 0.63 : b < 240 ? 0.58 : 0.54; };
  const chordIn = (B, bi, beat) => { const b = B[((bi % nb) + nb) % nb]; return b[Math.min(b.length - 1, Math.floor(beat * b.length / BPB))]; };
  const chordAt = (bi, beat) => chordIn(bars, bi, beat);

  function setParts(p) {
    if (!bus) return;
    const t = bus.ctx.currentTime;
    ['drums', 'comp', 'bass'].forEach(k => bus[k].in.gain.setTargetAtTime(p[k] ? bus[k].level : 0, t, 0.03));
  }

  /* Plan one bar: bass notes, comp hits and drum extras, each tagged with the beat it starts on */
  function planBar(bi, chorus) {
    const ev = [];
    const segs = bars[bi % nb], k = segs.length, per = BPB / k, after = nextBar(bi, chorus);
    // bass
    if (engine === 'swing') {
      for (let j = 0; j < k; j++) {
        const c = segs[j], next = j < k - 1 ? segs[j + 1] : after[0];
        if (bassStart === null) bassStart = nearest(c.root, 38);
        const r = walkStretch(c, per, next, bassStart, o.feel === 'two');
        r.notes.forEach(([b, m, len]) => ev.push({ beat: j * per + b, at: 0, kind: 'bass', m, len: len * 0.92, vel: rnd(0.78, 0.9) * (b % 2 ? 0.95 : 1) }));
        bassStart = r.T;
      }
    } else if (engine === 'bossa') {
      for (let j = 0; j < k; j++) {
        const c = segs[j], next = j < k - 1 ? segs[j + 1] : after[0];
        const root = nearest(c.root, bassPrev || 38, 33, 50), fifth = nearest((c.root + c.fifth) % 12, root + 4, 33, 52);
        if (per >= 4) {
          ev.push({ beat: 0, at: 0, kind: 'bass', m: root, len: 1.4, vel: 0.85 }, { beat: 1, at: 0.5, kind: 'bass', m: fifth, len: 0.45, vel: 0.7 },
            { beat: 2, at: 0, kind: 'bass', m: fifth, len: 1.4, vel: 0.8 }, { beat: 3, at: 0.5, kind: 'bass', m: next.sym === c.sym ? root : nearest(next.root, fifth, 33, 50), len: 0.45, vel: 0.72 });
        } else {
          ev.push({ beat: j * per, at: 0, kind: 'bass', m: root, len: 1.4, vel: 0.85 }, { beat: j * per + 1, at: 0.5, kind: 'bass', m: fifth, len: 0.45, vel: 0.7 });
        }
        bassPrev = root;
      }
    } else {
      const steps = [];
      for (let s = 0; s < g.steps; s++) if (g.bass !== 'walk' && g.bass[s] && g.bass[s] !== '.') steps.push(s);
      steps.forEach((s, idx) => {
        const c = chordAt(bi, s / g.spb), kind = g.bass[s];
        const r = nearest(c.root, bassPrev || 38, 33, 50);
        const add = { r: 0, 5: c.fifth, 3: c.third, 6: 9, 7: 10, 8: 12 }[kind] || 0;
        const nextS = idx < steps.length - 1 ? steps[idx + 1] : g.steps + steps[0];
        ev.push({ beat: Math.floor(s / g.spb), at: (s % g.spb) / g.spb, kind: 'bass', m: r + add, len: Math.min(1.8, (nextS - s) / g.spb * 0.85), vel: 0.82 });
        bassPrev = r;
      });
    }
    // comping
    if (engine === 'swing') {
      if (o.comp === 'guitar') {
        for (let b = 0; b < BPB; b++) ev.push({ beat: b, at: 0, kind: 'gtr', c: chordAt(bi, b), len: 0.42, vel: b % 2 ? 0.5 : 0.42 });
      } else {
        let pat = wpick(k > 1 ? SWING_2 : SWING_1).slice();
        if (pushed) pat = pat.filter(([e]) => e !== 0);
        pushed = pat.some(([e]) => e === 7);
        pat.forEach(([e, len]) => {
          const beat = Math.floor(e / 2), off = e % 2;
          ev.push({ beat, at: off ? -1 : 0, kind: 'piano', c: off && beat + 1 >= BPB ? after[0] : chordAt(bi, off ? beat + 1 : beat), len, vel: off ? rnd(0.6, 0.72) : rnd(0.5, 0.62) });
        });
      }
    } else if (engine === 'bossa') {
      const pat = chorus * nb + bi;
      const hits = pat % 2 === 0 ? [0, 3, 6] : [2, 5]; // the two-bar bossa figure in eighths
      hits.forEach(e => {
        const beat = Math.floor(e / 2), off = e % 2;
        ev.push({ beat, at: off ? 0.5 : 0, kind: o.comp === 'guitar' ? 'gtr' : 'piano', c: off && beat + 1 >= BPB ? after[0] : chordAt(bi, off ? beat + 1 : beat), len: 0.85, vel: 0.55 });
      });
    } else {
      for (let s = 0; s < g.steps; s++) if (g.comp[s] && g.comp[s] !== '.') {
        const len = gid === 'funk' ? 0.2 : ['pompe', 'reggae', 'boomchick', 'shuffle'].includes(gid) ? 0.35 : ['rock', 'fado'].includes(gid) ? 0.6 : 1;
        ev.push({ beat: Math.floor(s / g.spb), at: (s % g.spb) / g.spb, kind: 'gtr', c: chordAt(bi, s / g.spb), len, vel: g.comp[s] === 'X' ? 0.6 : 0.42, tone: 3600 });
      }
    }
    // drums
    if (engine === 'swing') {
      const last = bi === hi;
      for (let b = 0; b < BPB; b++) {
        const top = b === 0 && bi === lo && chorus > 0;
        ev.push({ beat: b, at: 0, kind: 'ride', vel: top ? 1 : rnd(0.62, 0.72) + (b % 2 ? 0.08 : 0) });
        if (b % 2) { ev.push({ beat: b, at: -1, kind: 'ride', vel: rnd(0.4, 0.5) }); ev.push({ beat: b, at: 0, kind: 'chick', vel: 0.65 }); }
        ev.push({ beat: b, at: 0, kind: 'kick', vel: top ? 0.6 : 0.14 });
        if (top) ev.push({ beat: 0, at: 0, kind: 'snare', vel: 0.3 });
      }
      if (last) [0, 1 / 3, 2 / 3].forEach((at, i) => ev.push({ beat: 3, at, kind: 'snare', vel: 0.28 + i * 0.12 }));
      else if (Math.random() < 0.3) ev.push({ beat: pick([1, 3]), at: -1, kind: 'snare', vel: rnd(0.12, 0.2) });
    } else if (engine === 'bossa') {
      const two = (chorus * nb + bi) % 2 === 0 ? [0, 3, 6] : [2, 5];
      for (let e = 0; e < 8; e++) {
        const beat = Math.floor(e / 2), at = (e % 2) / 2;
        ev.push({ beat, at, kind: 'hat', vel: e % 2 ? 0.35 : 0.5 });
        if (two.includes(e)) ev.push({ beat, at, kind: 'xstick', vel: 0.6 });
        if ([0, 3, 4, 7].includes(e)) ev.push({ beat, at, kind: 'kick', vel: e % 4 === 0 ? 0.3 : 0.18 });
      }
    } else {
      Object.entries(g.perc).forEach(([name, pat]) => {
        for (let s = 0; s < g.steps; s++) if (pat[s] !== '.') ev.push({ beat: Math.floor(s / g.spb), at: (s % g.spb) / g.spb, kind: 'hit', name, vel: pat[s] === 'X' ? 0.9 : 0.55 });
      });
    }
    return ev;
  }

  function play(ev, t, bd) {
    const swOff = sw() * bd;
    ev.forEach(e => {
      const when = t + (e.at === -1 ? swOff : e.at * bd) + (e.kind === 'ride' || e.kind === 'chick' ? rnd(-0.003, 0.003) : 0);
      switch (e.kind) {
        case 'bass': bassVoice(e.m, when, e.len * bd, e.vel * 0.55, bright); break;
        case 'piano': {
          const c = e.c || chordAt(e.bi, e.cb);
          voicing = voiceLead(pianoShapes(c), c.root, voicing && voicing.length === 4 ? voicing : null, 50, 62, 55);
          pianoChord(voicing, when, e.len * bd, e.vel); break;
        }
        case 'gtr': {
          const c = e.c || chordAt(e.bi, e.cb);
          const v = voiceLead(guitarShapes(c), c.root, null, 40, 51, 45);
          guitarChord(v, when, e.len * bd, e.vel, e.tone || (engine === 'bossa' ? 2600 : 1700)); break;
        }
        case 'ride': ride(when, e.vel); break;
        case 'chick': chick(when, e.vel); break;
        case 'kick': kick(when, e.vel); break;
        case 'snare': snare(when, e.vel); break;
        case 'xstick': crossStick(when, e.vel); break;
        case 'hat': A.hit('hat', when, e.vel, bus.drums.in); break;
        case 'hit': A.hit(e.name, when, e.vel, bus.drums.in); break;
        default: break;
      }
    });
  }

  function start() {
    getBus();
    Samples.load('upright'); Samples.load('piano'); // the first bars may still use the synth
    prepare(['hat'].concat(Object.keys(g.perc || {})));
    if (!rideBuf) { rideBuf = buildRide(bus.ctx); chickBuf = buildChick(bus.ctx); }
    clearTimeout(stopTimer);
    live.forEach(n => { try { n.stop(); } catch (e) { /* already stopped */ } }); live.clear();
    const ctx = bus.ctx;
    bus.out.gain.cancelScheduledValues(ctx.currentTime); bus.out.gain.setValueAtTime(0.9, ctx.currentTime);
    setParts(o.parts);
    bassStart = null; bassPrev = null; voicing = null; pushed = false; history.length = 0;
    let t0 = ctx.currentTime + 0.12;
    if (o.countIn) { // two bars: 1 . 2 . | 1 2 3 4
      const bd = beatDur(), clicks = [[0, '1'], [2, '2'], [4, '1'], [5, '2'], [6, '3'], [7, '4']];
      clicks.forEach(([b, lbl]) => {
        const t = t0 + b * bd;
        sample(chickBuf, t, 0.9);
        const s = bus.ctx.createBufferSource(); s.buffer = chickBuf; // also straight to the output, so it is heard with the drums muted
        const gg = bus.ctx.createGain(); gg.gain.value = 0.5; s.connect(gg); gg.connect(bus.out); s.start(t); keep(s, t + 0.13);
        if (o.onCount) countTimers.push(setTimeout(() => o.onCount(lbl), Math.max(0, (t - ctx.currentTime + A.latency()) * 1000)));
      });
      t0 += 8 * bd;
    }
    bars = barsOf(0);
    loop = A.Loop({
      steps: (hi - lo + 1) * BPB, stepDur: beatDur,
      onStep: (i, t, cycle) => {
        const bi = lo + Math.floor(i / BPB), beat = i % BPB;
        if (i === 0) { bars = barsOf(cycle); if (cycle > 0 && o.onChorus) o.onChorus(cycle); }
        if (beat === 0) {
          barPlan = planBar(bi, cycle);
          history.push({ t, bi, chorus: cycle }); if (history.length > 64) history.shift();
        }
        if (barPlan) play(barPlan.filter(e => e.beat === beat), t, beatDur());
      },
      onVisual: (i, cycle) => {
        const bi = lo + Math.floor(i / BPB), beat = i % BPB;
        if (o.onBeat) o.onBeat({ bar: bi, beat, chorus: cycle, chord: chordIn(barsOf(cycle), bi, beat) });
      }
    });
    loop.start(t0);
    return t0;
  }
  function stop() {
    if (loop) loop.stop(); loop = null;
    countTimers.forEach(clearTimeout); countTimers = [];
    if (!bus) return;
    const t = bus.ctx.currentTime;
    bus.out.gain.cancelScheduledValues(t); bus.out.gain.setTargetAtTime(0, t, 0.03);
    stopTimer = setTimeout(() => {
      live.forEach(n => { try { n.stop(); } catch (e) { /* already stopped */ } }); live.clear();
      bus.out.gain.setValueAtTime(0.9, bus.ctx.currentTime);
    }, 200);
  }
  /* Which bar was sounding at audio time t (for the "where are we?" check) */
  function barAt(t) {
    let hit = null;
    for (const x of history) if (x.t <= t) hit = x;
    return hit;
  }
  return {
    start, stop, barAt,
    get running() { return !!loop; },
    set(patch) { Object.assign(o, patch); if (patch.parts) setParts(o.parts); },
    beatDur
  };
}
