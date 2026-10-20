/* World Woodshed — audio engine (Web Audio, synthesized) */
(function () {
  let ctx = null, master = null, noiseBuf = null;
  const ksCache = new Map();
  const voices = new Set();

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 4;
      master = ctx.createGain(); master.gain.value = 0.85;
      master.connect(comp); comp.connect(ctx.destination);
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

  function note(midi, when, vel = 0.8, dur = 1.6) {
    ensure();
    when = Math.max(when || 0, ctx.currentTime);
    const base = Math.round(midi);
    const e = ksBuffer(base);
    const src = ctx.createBufferSource();
    src.buffer = e.buf;
    src.playbackRate.value = e.rate * Math.pow(2, (midi - base) / 12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vel, when);
    g.gain.setValueAtTime(vel, when + dur);
    g.gain.exponentialRampToValueAtTime(0.0008, when + dur + 0.25);
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass'; tone.frequency.value = 4200;
    src.connect(tone); tone.connect(g); g.connect(master);
    src.start(when); src.stop(when + dur + 0.3);
    track(src);
    return when;
  }

  function strum(midis, when, vel = 0.6, spread = 0.018, dur = 1.6) {
    ensure();
    when = Math.max(when || 0, ctx.currentTime);
    const v = vel / Math.sqrt(Math.max(1, midis.length) / 2);
    midis.forEach((m, i) => note(m, when + i * spread, v, dur));
  }

  function env(g, when, peak, decay) {
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(peak, when + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, when + decay);
  }
  function noiseHit(when, vel, type, freq, q, decay) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    s.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); env(g, when, vel, decay);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(when, Math.random() * 0.5); s.stop(when + decay + 0.05); track(s);
  }
  function toneHit(when, vel, wave, f0, f1, decay, glide) {
    const o = ctx.createOscillator(); o.type = wave;
    o.frequency.setValueAtTime(f0, when);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, when + (glide || decay * 0.6));
    const g = ctx.createGain(); env(g, when, vel, decay);
    o.connect(g); g.connect(master);
    o.start(when); o.stop(when + decay + 0.05); track(o);
  }

  /* Percussion voices */
  function hit(type, when, vel = 0.8) {
    ensure();
    when = Math.max(when || 0, ctx.currentTime);
    switch (type) {
      case 'low': toneHit(when, 0.95 * vel, 'sine', 140, 52, 0.42, 0.12); break;
      case 'mid': toneHit(when, 0.6 * vel, 'sine', 260, 200, 0.22); noiseHit(when, 0.08 * vel, 'bandpass', 900, 1, 0.05); break;
      case 'high': noiseHit(when, 0.55 * vel, 'bandpass', 3200, 1.2, 0.07); toneHit(when, 0.2 * vel, 'triangle', 520, 480, 0.06); break;
      case 'clave': toneHit(when, 0.55 * vel, 'sine', 2500, 0, 0.07); toneHit(when, 0.18 * vel, 'triangle', 1250, 0, 0.05); break;
      case 'bell': toneHit(when, 0.22 * vel, 'square', 587, 0, 0.22); toneHit(when, 0.16 * vel, 'square', 845, 0, 0.18); break;
      case 'shaker': noiseHit(when, 0.18 * vel, 'highpass', 6500, 0.7, 0.045); break;
      case 'clap':
        for (let i = 0; i < 3; i++) noiseHit(when + i * 0.009, 0.42 * vel, 'bandpass', 1400, 0.9, 0.06 + i * 0.02);
        break;
      case 'chick': noiseHit(when, 0.35 * vel, 'bandpass', 2200, 1.4, 0.05); toneHit(when, 0.12 * vel, 'triangle', 330, 0, 0.04); break;
      case 'hat': noiseHit(when, 0.22 * vel, 'highpass', 8500, 0.8, 0.035); break;
      case 'ride': noiseHit(when, 0.12 * vel, 'highpass', 6000, 0.7, 0.35); toneHit(when, 0.05 * vel, 'square', 3100, 0, 0.3); break;
      case 'click': toneHit(when, 0.45 * vel, 'sine', 1500, 0, 0.035); break;
      case 'clickHi': toneHit(when, 0.6 * vel, 'sine', 2200, 0, 0.04); break;
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

  window.WW_AUDIO = { ensure, now, latency, mtof, note, strum, hit, Loop, Drone, stopAll, eventToAudioTime };
})();
