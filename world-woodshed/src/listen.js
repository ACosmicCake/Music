/* World Woodshed — listening to your guitar through the microphone.
   Everything runs on the device; no audio is stored or sent anywhere.
   The analyzer (src/analyzer.js) is pure signal code: note onsets with millisecond timing, the pitch of what
   you play (McLeod pitch method) and level. Mic: opens the input, feeds the analyzer from an AudioWorklet and fans events out
   to whichever tools are listening; it closes the mic when the last one stops. */
import A from './audio.js';
import E from './engine.js';

export { detectPitch, freqToMidi, Analyzer } from './analyzer.js';
import { Analyzer } from './analyzer.js';

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
        node.port.onmessage = e => { if (analyzer) analyzer.push(e.data.buf, e.data.t0); }; // a block can still arrive after stopNow()
      } else {
        node = ctx.createScriptProcessor(1024, 1, 1);
        node.onaudioprocess = e => { if (analyzer) analyzer.push(e.inputBuffer.getChannelData(0).slice(), ctx.currentTime - 1024 / ctx.sampleRate); };
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
  try { if (srcNode) srcNode.disconnect(); if (node) { if (node.port) node.port.onmessage = null; node.disconnect(); } if (sink) sink.disconnect(); } catch (e) { /* ignore */ }
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
  try { for (let i = 0; i < 10; i++) { const t = t0 + i * 0.6; A.hit('clickHi', t, 1, undefined, { synth: true }); clicks.push(t); } } catch (e) { off(); throw e; } // the synth click, so calibration never changes
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
