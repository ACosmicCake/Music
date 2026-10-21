/* World Woodshed — listening to your guitar through the microphone.
   Everything runs on the device; no audio is stored or sent anywhere.
   Analyzer: pure signal code (testable without a browser) that finds note onsets with
   millisecond timing, the pitch of what you play (McLeod pitch method) and level.
   Mic: opens the input, feeds the analyzer from an AudioWorklet and fans events out
   to whichever tools are listening; it closes the mic when the last one stops. */
import A from './audio.js';
import E from './engine.js';

const GUITAR_LO = 70, GUITAR_HI = 1400; // Hz: below drop-D low string to above the 24th fret

/* McLeod pitch method on one window. Returns { freq, clarity } or null. */
export function detectPitch(x, sr) {
  const N = x.length;
  const minLag = Math.max(2, Math.floor(sr / GUITAR_HI)), maxLag = Math.min(N >> 1, Math.ceil(sr / GUITAR_LO));
  const nsdf = new Float32Array(maxLag + 2);
  let m = 0;
  for (let i = 0; i < N; i++) m += 2 * x[i] * x[i];
  if (m < 1e-9) return null;
  for (let tau = 0; tau <= maxLag + 1; tau++) {
    let acf = 0;
    for (let i = 0, n = N - tau; i < n; i++) acf += x[i] * x[i + tau];
    if (tau > 0) m -= x[tau - 1] * x[tau - 1] + x[N - tau] * x[N - tau];
    nsdf[tau] = m > 1e-12 ? 2 * acf / m : 0;
  }
  // key maxima: the highest point of each positive lobe after the first zero crossing
  const peaks = [];
  let tau = 1;
  while (tau < maxLag && nsdf[tau] > 0) tau++;
  let best = -1, bestV = -Infinity;
  for (; tau <= maxLag; tau++) {
    if (nsdf[tau] > 0) { if (nsdf[tau] > bestV) { bestV = nsdf[tau]; best = tau; } }
    else if (best >= 0) { peaks.push(best); best = -1; bestV = -Infinity; }
  }
  if (best >= 0) peaks.push(best);
  if (!peaks.length) return null;
  const top = Math.max(...peaks.map(q => nsdf[q]));
  const p = peaks.find(q => nsdf[q] >= 0.9 * top);
  // the true period is shorter than any guitar note (a click, a cymbal): not ours
  if (p < minLag) return null;
  // parabolic interpolation around the chosen lag
  const a = nsdf[p - 1], b = nsdf[p], c = nsdf[p + 1];
  const den = a - 2 * b + c;
  const shift = den !== 0 ? 0.5 * (a - c) / den : 0;
  const lag = p + Math.max(-0.5, Math.min(0.5, shift));
  const freq = sr / lag;
  if (freq < GUITAR_LO || freq > GUITAR_HI) return null;
  return { freq, clarity: b - 0.25 * (a - c) * shift };
}
export const freqToMidi = f => 69 + 12 * Math.log2(f / 440);

/* Streaming analyzer. push(block, t0) takes consecutive samples whose first sample is at audio time t0.
   Emits: onset {t}, pitch {t, freq, midi, clarity, rms}, note {t, midi} (an onset or a legato change with a clear pitch), level {rms, peak}. */
export function Analyzer(sr, opts = {}) {
  const emit = opts.emit || (() => {});
  const sens = opts.sensitivity ?? 0.5; // 0 = only loud attacks, 1 = very sensitive
  const HOP = 128;
  const ds = sr > 32000 ? 2 : 1, dsr = sr / ds; // pitch runs at half rate: plenty for a guitar
  const W = Math.round(0.043 * dsr / 64) * 64; // ~43 ms window
  const ring = new Float32Array(W * 2); let rpos = 0, filled = 0;
  let prevSample = 0, prevD = 0, bg = 1e-6, lastOnset = -1, frameBuf = new Float32Array(HOP), fpos = 0, frameT = 0;
  let hopCount = 0, pending = null, cur = null, legato = [], lastLevel = 0, dsAcc = 0, dsN = 0;
  const ratio = 9 - 6 * sens, gate = 4e-7 * Math.pow(30, 1 - sens);
  function onFrame(t) {
    // high-passed energy (first difference) makes pick and finger attacks stand out
    let d = 0, e = 0, peak = 0, at = 0, maxDiff = 0;
    for (let i = 0; i < HOP; i++) {
      const v = frameBuf[i], diff = v - prevSample; prevSample = v;
      d += diff * diff; e += v * v;
      const ad = Math.abs(diff); if (ad > maxDiff) { maxDiff = ad; }
      if (Math.abs(v) > peak) peak = Math.abs(v);
    }
    d /= HOP;
    // first sample in the frame that gets near the frame's steepest change marks the attack
    let ps = frameBuf[0];
    for (let i = 1; i < HOP; i++) { if (Math.abs(frameBuf[i] - ps) > 0.5 * maxDiff) { at = i; break; } ps = frameBuf[i]; }
    const isOnset = d > gate && d > bg * ratio && d > prevD * 1.8 && (lastOnset < 0 || t - lastOnset > 0.07);
    if (isOnset) {
      lastOnset = t + at / sr;
      emit({ type: 'onset', t: lastOnset, strength: d / Math.max(bg, 1e-9) });
      pending = { t: lastOnset, readings: [] };
    }
    bg = isOnset ? bg : bg * 0.993 + d * 0.007;
    prevD = d;
    lastLevel = Math.max(lastLevel * 0.9, Math.sqrt(e / HOP));
    if (++hopCount % 8 === 0) emit({ type: 'level', rms: lastLevel, peak });
  }
  function analyse(tEnd) {
    if (filled < W) return;
    const win = new Float32Array(W);
    for (let i = 0; i < W; i++) win[i] = ring[(rpos - W + i + ring.length) % ring.length];
    let e = 0; for (let i = 0; i < W; i++) e += win[i] * win[i];
    const rms = Math.sqrt(e / W);
    if (rms < 0.002 + 0.01 * (1 - sens)) { if (cur && tEnd - cur.last > 0.25) cur = null; return; }
    const res = detectPitch(win, dsr);
    if (!res || res.clarity < 0.8) return;
    const midi = freqToMidi(res.freq);
    emit({ type: 'pitch', t: tEnd, freq: res.freq, midi, clarity: res.clarity, rms });
    // turn readings into notes: after an onset, or when the pitch moves without one (hammer-ons, slides)
    if (pending && tEnd - pending.t > 0.025) {
      pending.readings.push(midi);
      if (pending.readings.length >= 2) {
        const r = pending.readings.slice(-2);
        if (Math.abs(r[0] - r[1]) < 0.5) { const nm = (r[0] + r[1]) / 2; emit({ type: 'note', t: pending.t, midi: nm }); cur = { midi: nm, last: tEnd }; pending = null; legato = []; return; }
      }
      if (tEnd - pending.t > 0.16) pending = null;
    } else if (!pending) {
      if (cur && Math.abs(midi - cur.midi) < 0.5) { cur.last = tEnd; legato = []; return; }
      legato.push({ t: tEnd, midi });
      if (legato.length >= 3) {
        const l = legato.slice(-3);
        if (Math.abs(l[0].midi - l[2].midi) < 0.5 && Math.abs(l[1].midi - l[2].midi) < 0.5) {
          const nm = l[2].midi; emit({ type: 'note', t: l[0].t - W / dsr / 2, midi: nm, legato: true }); cur = { midi: nm, last: tEnd }; legato = [];
        }
      }
    }
  }
  return {
    push(block, t0) {
      for (let i = 0; i < block.length; i++) {
        if (fpos === 0) frameT = t0 + i / sr;
        frameBuf[fpos++] = block[i];
        if (fpos === HOP) { fpos = 0; onFrame(frameT); }
        dsAcc += block[i]; dsN++;
        if (dsN === ds) {
          ring[rpos] = dsAcc / ds; rpos = (rpos + 1) % ring.length; filled++;
          dsAcc = 0; dsN = 0;
          if (filled % (W >> 2) === 0) analyse(t0 + (i + 1) / sr); // ~11 ms hop
        }
      }
    }
  };
}

/* ---------- the microphone ---------- */
const WORKLET = `
class WWMic extends AudioWorkletProcessor {
  constructor() { super(); this.buf = new Float32Array(512); this.n = 0; this.t0 = 0; }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) {
      if (this.n === 0) this.t0 = currentTime;
      this.buf.set(ch, this.n); this.n += ch.length;
      if (this.n >= 512) { this.port.postMessage({ t0: this.t0, buf: this.buf.slice(0, this.n) }); this.n = 0; }
    }
    return true;
  }
}
registerProcessor('ww-mic', WWMic);`;

const subs = { onset: new Set(), pitch: new Set(), note: new Set(), level: new Set() };
let stream = null, srcNode = null, node = null, sink = null, analyzer = null, starting = null, stopTimer = null;
let state = 'off'; // off | starting | on | denied | unsupported
const stateSubs = new Set();
const setState = s => { state = s; stateSubs.forEach(fn => { try { fn(s); } catch (e) { console.error(e); } }); };
let mutedUntil = 0, lastHeard = 0;

function dispatch(ev) {
  if ((ev.type === 'onset' || ev.type === 'note') && ev.t < mutedUntil) return;
  if (ev.type === 'onset' || ev.type === 'note') lastHeard = Date.now();
  subs[ev.type].forEach(fn => { try { fn(ev); } catch (e) { console.error(e); } });
}
function listenerCount() { return subs.onset.size + subs.pitch.size + subs.note.size + subs.level.size; }

async function start() {
  if (state === 'on') return true;
  if (starting) return starting;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { setState('unsupported'); return false; }
  setState('starting');
  starting = (async () => {
    try {
      const ctx = A.ensure();
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      srcNode = ctx.createMediaStreamSource(stream);
      analyzer = Analyzer(ctx.sampleRate, { emit: dispatch, sensitivity: E.state.settings.micSensitivity ?? 0.5 });
      sink = ctx.createGain(); sink.gain.value = 0; sink.connect(ctx.destination);
      if (ctx.audioWorklet) {
        const url = URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' }));
        await ctx.audioWorklet.addModule(url);
        URL.revokeObjectURL(url);
        node = new AudioWorkletNode(ctx, 'ww-mic');
        node.port.onmessage = e => analyzer.push(e.data.buf, e.data.t0);
      } else {
        node = ctx.createScriptProcessor(1024, 1, 1);
        node.onaudioprocess = e => analyzer.push(e.inputBuffer.getChannelData(0).slice(), ctx.currentTime - 1024 / ctx.sampleRate);
      }
      srcNode.connect(node); node.connect(sink);
      setState('on');
      return true;
    } catch (e) {
      stopNow();
      setState(e && (e.name === 'NotAllowedError' || e.name === 'SecurityError') ? 'denied' : 'unsupported');
      return false;
    } finally { starting = null; }
  })();
  return starting;
}
function stopNow() {
  try { if (srcNode) srcNode.disconnect(); if (node) node.disconnect(); if (sink) sink.disconnect(); } catch (e) { /* ignore */ }
  if (stream) stream.getTracks().forEach(t => t.stop());
  stream = srcNode = node = sink = analyzer = null;
  if (state === 'on' || state === 'starting') setState('off');
}
// Close the mic shortly after the last tool stops listening (so moving between tools doesn't re-prompt)
function maybeStop() { clearTimeout(stopTimer); if (!listenerCount()) stopTimer = setTimeout(() => { if (!listenerCount()) stopNow(); }, 1500); }

function on(type, fn) {
  subs[type].add(fn); clearTimeout(stopTimer);
  return () => { subs[type].delete(fn); maybeStop(); };
}

/* Delay from a scheduled sound to the moment the mic stamps you playing along with it (ms). */
function latencyMs() {
  const s = E.state.settings.micLatencyMs;
  if (typeof s === 'number') return s;
  return Math.round(A.latency() * 1000 + 25); // rough guess until calibrated
}

/* Play clicks through the speakers and time when the mic hears them. Resolves to ms, or null. */
async function calibrate(onProgress) {
  if (!(await start())) return null;
  // set up outside the promise, so an error here reaches the caller instead of leaving it waiting forever
  const ctx = A.ensure(), clicks = [], heard = [];
  const off = on('onset', ev => heard.push(ev.t));
  const t0 = ctx.currentTime + 0.4;
  try { for (let i = 0; i < 10; i++) { const t = t0 + i * 0.6; A.hit('clickHi', t, 1); clicks.push(t); } } catch (e) { off(); throw e; }
  return new Promise(resolve => {
    const tick = setInterval(() => onProgress && onProgress(Math.min(1, (ctx.currentTime - t0) / 6)), 200);
    setTimeout(() => {
      clearInterval(tick); off();
      const offs = [];
      clicks.forEach(c => { const d = heard.map(h => h - c).filter(x => x > -0.02 && x < 0.35).sort((a, b) => a - b)[0]; if (d !== undefined) offs.push(d * 1000); });
      if (offs.length < 6) { resolve(null); return; }
      offs.sort((a, b) => a - b);
      const ms = Math.round(offs[offs.length >> 1]);
      E.setSetting('micLatencyMs', ms);
      resolve(ms);
    }, 6600);
  });
}

// re-open with new settings (e.g. sensitivity); listeners stay subscribed
async function restart() { if (state !== 'on') return; stopNow(); await start(); }

export const Mic = {
  start, stop: stopNow, restart, on, latencyMs, calibrate,
  get state() { return state; },
  // wall-clock time (ms) the mic last heard the player play a note: the session runner waits for a pause
  get lastHeard() { return lastHeard; },
  onState(fn) { stateSubs.add(fn); return () => stateSubs.delete(fn); },
  // ignore onsets until this audio time (e.g. while the app itself plays a phrase)
  muteUntil(t) { mutedUntil = Math.max(mutedUntil, t); },
  get wanted() { return !!E.state.settings.micOn; },
  setWanted(v) { E.setSetting('micOn', !!v); }
};
export default Mic;
