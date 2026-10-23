/* World Woodshed — audio engine (Web Audio, synthesized) */
let ctx = null, master = null, noiseBuf = null;
const ksCache = new Map();
const voices = new Map(); // every sounding or scheduled source -> { g: its gain node, at: start time, shot }
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

/* The last stage: unchanged below -3 dBFS, then a smooth curve towards full scale, so a pile-up of loud
   hits saturates gently instead of clipping. A WaveShaper only reads its input between -1 and 1 and holds
   the end of its curve beyond that, so the signal goes in at a quarter and the curve covers ±4: peaks up
   to four times full scale still bend instead of being cut flat. A WaveShaper adds no delay. */
const HEADROOM = 4;
export function clipCurve(n = 8193, knee = 0.708) { // knee: -3 dBFS
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = ((i / (n - 1)) * 2 - 1) * HEADROOM, a = Math.abs(x);
    const y = a <= knee ? a : knee + (1 - knee) * Math.tanh((a - knee) / (1 - knee));
    curve[i] = Math.sign(x) * y;
  }
  return curve;
}
function softClip() {
  const pre = ctx.createGain(); pre.gain.value = 1 / HEADROOM;
  const ws = ctx.createWaveShaper(); ws.curve = clipCurve(); ws.oversample = 'none';
  pre.connect(ws);
  return { in: pre, out: ws };
}

/* Which output path to ask the browser for. On Android the default (lowest-latency) path keeps only a few
   milliseconds of audio in hand, and on some phones it crackles even with a single note playing. 'smooth'
   asks for the ordinary playback path: sounds start a few tens of milliseconds later, which the timing
   tools already allow for (latency() includes the reported output latency). 'fast' keeps the low-latency
   path, and 'auto' picks smooth on Android only. Read when the audio starts (settings.audioOutput, per device). */
let outputPref = 'auto', outputUsed = null;
function setOutput(v) { outputPref = v || 'auto'; }
export function latencyHintFor(pref, android) { return pref === 'smooth' || (pref !== 'fast' && android) ? 'playback' : 'interactive'; }
const onAndroid = () => typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent || '');

/* Output chain. Each instrument has a channel: its level, its place in the stereo field and how much
   of it goes to a shared short room reverb. Everything meets at master, then the compressor (as
   before: it alone looks ahead, so output latency is what it was) and a soft limiter. */
function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    const hint = latencyHintFor(outputPref, onAndroid());
    try { ctx = new AC({ latencyHint: hint }); outputUsed = hint; } catch (e) { ctx = new AC(); outputUsed = 'interactive'; } // older Safari takes no options
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    const limit = softClip();
    master = ctx.createGain(); master.gain.value = 0.85;
    master.connect(comp); comp.connect(limit.in); limit.out.connect(ctx.destination);
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

/* One-shot sounds and play buttons. What a play button plays (an interval, a chord, a phrase, a scale) is a
   one-shot sound: every source not scheduled by a running Loop. A.fresh() is called when a play button is
   pressed: it fades out the one-shot sounds still ringing, cancels the ones not yet started, the timers
   set with A.later and the loops started with { shot: true }, so pressing Play again starts over instead
   of piling a second sound on the first. Loops the player starts and stops (the metronome, a drone, the
   band, a reading run) and the notes they schedule are left alone. */
let inLoop = null; // { mine, shot } while a loop schedules a step: the sources it starts are its own
const shotTimers = new Map(), shotLoops = new Set(); // timer id -> what to do if it is cancelled
const FADE = 0.03;
function track(node, g, at) {
  const scope = inLoop;
  voices.set(node, { g, at: at || 0, shot: !scope || scope.shot });
  if (scope) scope.mine.add(node);
  node.addEventListener('ended', () => { voices.delete(node); if (scope) scope.mine.delete(node); });
}
/* Silence one source: not started yet, it never plays; sounding, its level falls to nothing in FADE
   seconds (a sudden stop clicks) and then it stops. */
function silence(node, t) {
  const v = voices.get(node);
  voices.delete(node);
  try {
    if (!v || v.at > t + 0.005 || !v.g) { node.stop(); return; }
    const p = v.g.gain;
    if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t);
    else { p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); }
    p.linearRampToValueAtTime(0, t + FADE);
    node.stop(t + FADE + 0.01);
  } catch (e) { /* already stopped */ }
}
function fresh() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const cancelled = [...shotTimers];
  shotTimers.clear();
  cancelled.forEach(([id, onCancel]) => { clearTimeout(id); if (onCancel) onCancel(); });
  [...shotLoops].forEach(lp => lp.halt());
  voices.forEach((v, node) => { if (v.shot) silence(node, t); });
}
/* setTimeout for a one-shot sound's visuals (highlighting the chord that sounds): A.fresh() cancels it,
   and then runs onCancel, if given, to put the display back */
function later(fn, ms, onCancel) {
  const id = setTimeout(() => { shotTimers.delete(id); fn(); }, Math.max(0, ms));
  shotTimers.set(id, onCancel || null);
  return id;
}

/* Guitar notes. A recorded guitar (src/guitars.js) can take over a note; it returns null while its
   samples load, or when the player chose the synth, and the plucked string below plays instead.
   o: { out: node, tone: lowpass Hz, detune: cents, release: seconds to fade after dur (default 0.25),
   synth: true to skip the recording } */
let noteSampler = null;
function setNoteSampler(fn) { noteSampler = fn; }
function note(midi, when, vel = 0.8, dur = 1.6, o = {}) {
  ensure();
  when = Math.max(when || 0, ctx.currentTime);
  const smp = noteSampler && !o.synth ? noteSampler(midi, when, vel, dur, Object.assign({}, o, { out: o.out || chan.guitar })) : null;
  if (smp) { track(smp, smp.gainNode, when); return when; }
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
  track(src, g, when);
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
  s.start(when, Math.random() * 0.5); s.stop(when + decay + 0.05); track(s, g, when);
}
function toneHit(when, vel, wave, f0, f1, decay, glide, out) {
  const o = ctx.createOscillator(); o.type = wave;
  o.frequency.setValueAtTime(f0, when);
  if (f1) o.frequency.exponentialRampToValueAtTime(f1, when + (glide || decay * 0.6));
  const g = ctx.createGain(); env(g, when, vel, decay);
  o.connect(g); g.connect(out || chan.perc);
  o.start(when); o.stop(when + decay + 0.05); track(o, g, when);
}

/* Percussion voices. A recorded kit (src/drumkit.js) can take over a hit and returns the source it
   plays; it returns null while its samples load, or for sounds it has no recording of, and the synth
   voice below plays instead.
   o: { kit: which recorded instruments play low, mid and high (see drumkit.js), synth: true to skip them } */
let hitSampler = null;
function setHitSampler(fn) { hitSampler = fn; }
function hit(type, when, vel = 0.8, out, o = {}) {
  ensure();
  when = Math.max(when || 0, ctx.currentTime);
  const smp = hitSampler && !o.synth ? hitSampler(type, when, vel, out || chan.perc, o) : null;
  if (smp) { if (typeof smp === 'object') track(smp, smp.gainNode, when); return; }
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
   opts: { steps, stepDur(i) -> seconds, onStep(i, time, cycle), onVisual(i, cycle), maxSteps, onEnd(),
   shot: true for a loop a play button starts to be heard once (two cycles of a rhythm): A.fresh() stops
   it, and calls onEnd so its button is reset }.
   Stopping a loop cancels the sounds it had already scheduled ahead that haven't started. */
function Loop(opts) {
  let timer = null, nextTime = 0, step = 0, running = false;
  const visTimers = new Set(), mine = new Set(), scope = { mine, shot: !!opts.shot };
  function end() {
    const endDelay = Math.max(0, (nextTime - ctx.currentTime + latency()) * 1000);
    clearInterval(timer); timer = null;
    setTimeout(() => { if (running) { running = false; shotLoops.delete(api); opts.onEnd && opts.onEnd(); } }, endDelay + 30);
  }
  function tick() {
    // The page slept (screen off, the app in the background) while the audio clock ran on: skip the steps
    // that are already past instead of scheduling them all at once, which played minutes of clicks or band
    // in one burst of thousands of sounds. The beat stays where it was.
    if (nextTime < ctx.currentTime - 0.1) {
      for (let n = 0; nextTime < ctx.currentTime && n < 1e6; n++) {
        nextTime += Math.max(opts.stepDur(step % opts.steps) || 0, 1e-3); step++;
        if (opts.maxSteps && step >= opts.maxSteps) { end(); return; }
      }
    }
    while (nextTime < ctx.currentTime + 0.12) {
      const i = step % opts.steps, cycle = Math.floor(step / opts.steps);
      const t = nextTime;
      if (opts.onStep) {
        const outer = inLoop;
        inLoop = scope;
        try { opts.onStep(i, t, cycle); } finally { inLoop = outer; }
      }
      if (opts.onVisual) {
        const delay = Math.max(0, (t - ctx.currentTime + latency()) * 1000);
        const id = setTimeout(() => { visTimers.delete(id); if (running) opts.onVisual(i, cycle); }, delay);
        visTimers.add(id);
      }
      nextTime += opts.stepDur(i);
      step++;
      if (opts.maxSteps && step >= opts.maxSteps) { end(); return; }
    }
  }
  const api = {
    start(at) {
      ensure();
      if (opts.shot) shotLoops.add(api);
      running = true; step = 0; nextTime = Math.max(at || 0, ctx.currentTime + 0.08);
      api.startTime = nextTime;
      tick();
      if (!timer && running) timer = setInterval(tick, 25);
      return nextTime;
    },
    stop() {
      running = false;
      shotLoops.delete(api);
      if (timer) clearInterval(timer); timer = null;
      visTimers.forEach(clearTimeout); visTimers.clear();
      const t = ctx ? ctx.currentTime : 0;
      mine.forEach(n => { const v = voices.get(n); if (v && v.at > t + 0.005) silence(n, t); });
      mine.clear();
    },
    /* stopped by A.fresh: as stop, and onEnd runs so whoever started it can reset its button */
    halt() { const was = running; api.stop(); if (was && opts.onEnd) opts.onEnd(); },
    get running() { return running; }
  };
  return api;
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
    o.connect(og); og.connect(g); o.start(when); o.stop(when + dur + 0.45); track(o, g, when);
    return o;
  });
  return () => {
    const t = ctx.currentTime;
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    oscs.forEach(o => { try { o.stop(t + 0.2); } catch (e) { /* already stopped */ } });
  };
}

/* Everything off (leaving a tool): the one-shot sounds, their timers and loops, and whatever the loops
   had scheduled, all faded out rather than cut */
function stopAll() {
  fresh();
  const t = ctx ? ctx.currentTime : 0;
  [...voices.keys()].forEach(n => silence(n, t));
}

function eventToAudioTime(ev) {
  // Convert a DOM event timestamp to the audio clock, minus output latency so it lines up with what was heard.
  if (!ctx) return 0;
  const ageMs = Math.max(0, performance.now() - (ev && ev.timeStamp ? ev.timeStamp : performance.now()));
  return ctx.currentTime - ageMs / 1000 - latency();
}

/* An instrument's channel input (guitar, perc), for a caller that wants its own node on that channel */
const channel = name => { ensure(); return chan[name]; };

export default { out: () => master, channel, setOutput, outputUsed: () => outputUsed, outputFor: pref => latencyHintFor(pref, onAndroid()), ensure, now, latency, mtof, note, strum, strumPlan, hit, setHitSampler, setNoteSampler, tone, Loop, Drone, stopAll, fresh, later, eventToAudioTime };
