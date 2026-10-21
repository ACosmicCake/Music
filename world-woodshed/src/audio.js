/* World Woodshed — audio engine (Web Audio, synthesized) */
let ctx = null, master = null, noiseBuf = null;
const ksCache = new Map();
const voices = new Set();
const chan = {}; // per-instrument channel inputs: guitar, perc

/* A small room: 0.5 s of decaying noise, a little darker as it fades, slightly different in each ear */
function roomImpulse(secs) {
  const sr = ctx.sampleRate, len = Math.floor(sr * secs), buf = ctx.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch); let lp = 0;
    for (let i = 0; i < len; i++) {
      const t = i / sr, k = 0.6 - 0.4 * (i / len);
      lp += k * ((Math.random() * 2 - 1) - lp);
      d[i] = t < 0.006 ? 0 : lp * Math.exp(-t * 9); // the first reflection after 6 ms, -60 dB by about 0.75 s
    }
  }
  return buf;
}

/* The last stage: unchanged below -3 dBFS, then a smooth curve that reaches full scale only in the limit,
   so a pile-up of loud hits saturates gently instead of clipping. A WaveShaper adds no delay. */
function softClip() {
  const n = 2048, curve = new Float32Array(n), knee = 0.708; // -3 dBFS
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1, a = Math.abs(x);
    const y = a <= knee ? a : knee + (1 - knee) * Math.tanh((a - knee) / (1 - knee));
    curve[i] = Math.sign(x) * y;
  }
  const ws = ctx.createWaveShaper(); ws.curve = curve; ws.oversample = 'none';
  return ws;
}

/* Output chain. Each instrument has a channel: its level, its place in the stereo field and how much
   of it goes to a shared short room reverb. Everything meets at master, then the compressor (as
   before: it alone looks ahead, so output latency is what it was) and a soft limiter. */
function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    const limit = softClip();
    master = ctx.createGain(); master.gain.value = 0.85;
    master.connect(comp); comp.connect(limit); limit.connect(ctx.destination);
    const room = ctx.createConvolver(); room.buffer = roomImpulse(0.5);
    room.connect(master);
    const channel = (gain, pan, send) => {
      // an equal-power panner gives a centred mono sound 3 dB less in each ear than it had before; give it back
      const g = ctx.createGain(); g.gain.value = gain * (ctx.createStereoPanner ? Math.SQRT2 : 1);
      let head = g;
      if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); head = p; }
      head.connect(master);
      const s = ctx.createGain(); s.gain.value = send; head.connect(s); s.connect(room);
      return g;
    };
    chan.guitar = channel(1, -0.12, 0.16); // a touch left, as if across the room from the drums
    chan.perc = channel(1, 0.12, 0.1);
    const len = ctx.sampleRate;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
const now = () => (ctx ? ctx.currentTime : 0);
const latency = () => (ctx ? (ctx.outputLatency || 0) + (ctx.baseLatency || 0) : 0);
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

/* Karplus–Strong plucked string, cached per integer MIDI note */
function ksBuffer(midi) {
  if (ksCache.has(midi)) return ksCache.get(midi);
  const sr = ctx.sampleRate, f = mtof(midi);
  const N = Math.max(2, Math.round(sr / f));
  const dur = midi < 52 ? 2.6 : 2.0;
  const len = Math.floor(sr * dur);
  const buf = ctx.createBuffer(1, len, sr), out = buf.getChannelData(0);
  const ring = new Float32Array(N);
  let p = 0;
  for (let i = 0; i < N; i++) { const r = Math.random() * 2 - 1; p += 0.55 * (r - p); ring[i] = p; }
  const decay = midi < 48 ? 0.9975 : midi < 64 ? 0.9965 : 0.995;
  let idx = 0, peak = 0;
  for (let i = 0; i < len; i++) {
    const a = ring[idx], b = ring[(idx + 1) % N];
    out[i] = a;
    ring[idx] = decay * 0.5 * (a + b);
    idx = (idx + 1) % N;
    if (Math.abs(a) > peak) peak = Math.abs(a);
  }
  const g = peak > 0 ? 0.6 / peak : 1;
  const fade = Math.floor(sr * 0.08);
  for (let i = 0; i < len; i++) { out[i] *= g; if (i > len - fade) out[i] *= (len - i) / fade; }
  const entry = { buf, rate: f / (sr / N) };
  ksCache.set(midi, entry);
  return entry;
}

function track(node, stopAt) { voices.add(node); node.onended = () => voices.delete(node); }

/* o: { out: node, tone: lowpass Hz, detune: cents, release: seconds to fade after dur (default 0.25) } */
function note(midi, when, vel = 0.8, dur = 1.6, o = {}) {
  ensure();
  when = Math.max(when || 0, ctx.currentTime);
  const base = Math.round(midi);
  const e = ksBuffer(base);
  const src = ctx.createBufferSource();
  src.buffer = e.buf;
  src.playbackRate.value = e.rate * Math.pow(2, (midi - base) / 12 + (o.detune || 0) / 1200);
  const rel = o.release || 0.25;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vel, when);
  g.gain.setValueAtTime(vel, when + dur);
  g.gain.exponentialRampToValueAtTime(0.0008, when + dur + rel);
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass'; tone.frequency.value = o.tone || 4200;
  src.connect(tone); tone.connect(g); g.connect(o.out || chan.guitar);
  src.start(when); src.stop(when + dur + rel + 0.05);
  track(src);
  return when;
}

/* How a strum unfolds, string by string. A pick crosses the strings in 8–25 ms, a little unevenly;
   a down-stroke starts on the bass and leans on it, an up-stroke catches the top strings first (on a
   full chord, only the top four) and is lighter. Each string is a hair out of tune with the next, as on
   a real guitar, and the hand damps them all at once, so every note stops at the same moment.
   midis: low to high. rnd: random source (for tests). Returns [{ midi, at, vel, dur, detune }] with
   `at` in seconds after the stroke starts. */
function strumPlan(midis, vel = 0.6, spread = 0.018, dur = 1.6, dir = 'down', rnd = Math.random) {
  let ms = midis.slice();
  if (dir === 'up') { if (ms.length >= 5) ms = ms.slice(-4); ms.reverse(); }
  const gap = Math.min(0.025, Math.max(0.008, spread));
  const v = vel * (dir === 'up' ? 0.8 : 1) / Math.sqrt(Math.max(1, ms.length) / 2);
  let at = 0;
  return ms.map((midi, i) => {
    if (i) at += gap * (0.8 + rnd() * 0.4);
    const lean = 1.12 - 0.24 * (i / Math.max(1, ms.length - 1)); // the first strings struck sound a bit louder
    return { midi, at, vel: v * lean * (0.92 + rnd() * 0.16), dur: Math.max(0.05, dur - at), detune: (rnd() - 0.5) * 6 };
  });
}

/* o: note options, plus dir: 'down' (default) or 'up' */
function strum(midis, when, vel = 0.6, spread = 0.018, dur = 1.6, o = {}) {
  ensure();
  when = Math.max(when || 0, ctx.currentTime);
  const release = o.release || 0.09;
  strumPlan(midis, vel, spread, dur, o.dir).forEach(p => note(p.midi, when + p.at, p.vel, p.dur, { ...o, detune: (o.detune || 0) + p.detune, release }));
}

function env(g, when, peak, decay) {
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(peak, when + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, when + decay);
}
function noiseHit(when, vel, type, freq, q, decay, out) {
  const s = ctx.createBufferSource(); s.buffer = noiseBuf;
  s.playbackRate.value = 0.8 + Math.random() * 0.4;
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain(); env(g, when, vel, decay);
  s.connect(f); f.connect(g); g.connect(out || chan.perc);
  s.start(when, Math.random() * 0.5); s.stop(when + decay + 0.05); track(s);
}
function toneHit(when, vel, wave, f0, f1, decay, glide, out) {
  const o = ctx.createOscillator(); o.type = wave;
  o.frequency.setValueAtTime(f0, when);
  if (f1) o.frequency.exponentialRampToValueAtTime(f1, when + (glide || decay * 0.6));
  const g = ctx.createGain(); env(g, when, vel, decay);
  o.connect(g); g.connect(out || chan.perc);
  o.start(when); o.stop(when + decay + 0.05); track(o);
}

/* Percussion voices. A recorded kit (src/drumkit.js) can take over a hit; it returns false while its
   samples load, or for sounds it has no recording of, and the synth voice below plays instead.
   o: { kit: which recorded instruments play low, mid and high (see drumkit.js), synth: true to skip them } */
let hitSampler = null;
function setHitSampler(fn) { hitSampler = fn; }
function hit(type, when, vel = 0.8, out, o = {}) {
  ensure();
  when = Math.max(when || 0, ctx.currentTime);
  if (hitSampler && !o.synth && hitSampler(type, when, vel, out || chan.perc, o)) return;
  switch (type) {
    case 'low': toneHit(when, 0.95 * vel, 'sine', 140, 52, 0.42, 0.12, out); break;
    case 'mid': toneHit(when, 0.6 * vel, 'sine', 260, 200, 0.22, undefined, out); noiseHit(when, 0.08 * vel, 'bandpass', 900, 1, 0.05, out); break;
    case 'high': noiseHit(when, 0.55 * vel, 'bandpass', 3200, 1.2, 0.07, out); toneHit(when, 0.2 * vel, 'triangle', 520, 480, 0.06, undefined, out); break;
    case 'clave': toneHit(when, 0.55 * vel, 'sine', 2500, 0, 0.07, undefined, out); toneHit(when, 0.18 * vel, 'triangle', 1250, 0, 0.05, undefined, out); break;
    case 'bell': toneHit(when, 0.22 * vel, 'square', 587, 0, 0.22, undefined, out); toneHit(when, 0.16 * vel, 'square', 845, 0, 0.18, undefined, out); break;
    case 'shaker': noiseHit(when, 0.18 * vel, 'highpass', 6500, 0.7, 0.045, out); break;
    case 'clap':
      for (let i = 0; i < 3; i++) noiseHit(when + i * 0.009, 0.42 * vel, 'bandpass', 1400, 0.9, 0.06 + i * 0.02, out);
      break;
    case 'chick': noiseHit(when, 0.35 * vel, 'bandpass', 2200, 1.4, 0.05, out); toneHit(when, 0.12 * vel, 'triangle', 330, 0, 0.04, undefined, out); break;
    case 'hat': noiseHit(when, 0.22 * vel, 'highpass', 8500, 0.8, 0.035, out); break;
    case 'ride': noiseHit(when, 0.12 * vel, 'highpass', 6000, 0.7, 0.35, out); toneHit(when, 0.05 * vel, 'square', 3100, 0, 0.3, undefined, out); break;
    case 'click': toneHit(when, 0.45 * vel, 'sine', 1500, 0, 0.035, undefined, out); break;
    case 'clickHi': toneHit(when, 0.6 * vel, 'sine', 2200, 0, 0.04, undefined, out); break;
    default: break;
  }
}

/* Look-ahead step scheduler.
   opts: { steps, stepDur(i) -> seconds, onStep(i, time, cycle), onVisual(i, cycle) } */
function Loop(opts) {
  let timer = null, nextTime = 0, step = 0, running = false;
  const visTimers = new Set();
  function tick() {
    while (nextTime < ctx.currentTime + 0.12) {
      const i = step % opts.steps, cycle = Math.floor(step / opts.steps);
      const t = nextTime;
      if (opts.onStep) opts.onStep(i, t, cycle);
      if (opts.onVisual) {
        const delay = Math.max(0, (t - ctx.currentTime + latency()) * 1000);
        const id = setTimeout(() => { visTimers.delete(id); if (running) opts.onVisual(i, cycle); }, delay);
        visTimers.add(id);
      }
      nextTime += opts.stepDur(i);
      step++;
      if (opts.maxSteps && step >= opts.maxSteps) {
        const endDelay = Math.max(0, (nextTime - ctx.currentTime + latency()) * 1000);
        clearInterval(timer); timer = null;
        setTimeout(() => { if (running) { running = false; opts.onEnd && opts.onEnd(); } }, endDelay + 30);
        return;
      }
    }
  }
  return {
    start(at) {
      ensure();
      running = true; step = 0; nextTime = Math.max(at || 0, ctx.currentTime + 0.08);
      this.startTime = nextTime;
      tick();
      if (!timer && running) timer = setInterval(tick, 25);
      return nextTime;
    },
    stop() {
      running = false;
      if (timer) clearInterval(timer); timer = null;
      visTimers.forEach(clearTimeout); visTimers.clear();
    },
    get running() { return running; }
  };
}

/* Tanpura-like drone: Pa, Sa', Sa', Sa (low) */
function Drone(tonicMidi, fifth = 7) {
  const pattern = [tonicMidi - 12 + fifth, tonicMidi, tonicMidi, tonicMidi - 12];
  const loop = Loop({
    steps: 4,
    stepDur: i => (i === 3 ? 1.1 : 0.7),
    onStep: (i, t) => {
      note(pattern[i], t, i === 3 ? 0.42 : 0.3, 2.8);
    }
  });
  return loop;
}

/* Sustained, organ-like reference tone (for tuning). Returns a function that stops it. */
function tone(midi, when, dur = 4, vel = 0.35) {
  ensure();
  when = Math.max(when || 0, ctx.currentTime);
  const f = mtof(midi), g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(vel, when + 0.06);
  g.gain.setValueAtTime(vel, when + dur);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.4);
  g.connect(master);
  const oscs = [[1, 1], [2, 0.35], [3, 0.18], [4, 0.08]].map(([k, a]) => {
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.frequency.value = f * k; og.gain.value = a;
    o.connect(og); og.connect(g); o.start(when); o.stop(when + dur + 0.45); track(o);
    return o;
  });
  return () => {
    const t = ctx.currentTime;
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    oscs.forEach(o => { try { o.stop(t + 0.2); } catch (e) { /* already stopped */ } });
  };
}

function stopAll() {
  voices.forEach(v => { try { v.stop(); } catch (e) { /* already stopped */ } });
  voices.clear();
}

function eventToAudioTime(ev) {
  // Convert a DOM event timestamp to the audio clock, minus output latency so it lines up with what was heard.
  if (!ctx) return 0;
  const ageMs = Math.max(0, performance.now() - (ev && ev.timeStamp ? ev.timeStamp : performance.now()));
  return ctx.currentTime - ageMs / 1000 - latency();
}

/* An instrument's channel input (guitar, perc), for a caller that wants its own node on that channel */
const channel = name => { ensure(); return chan[name]; };

export default { out: () => master, channel, ensure, now, latency, mtof, note, strum, strumPlan, hit, setHitSampler, tone, Loop, Drone, stopAll, eventToAudioTime };
