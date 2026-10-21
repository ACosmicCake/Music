/* World Woodshed — sampled instruments.
   Recordings of real instruments (public/samples, built by scripts/samples/build.mjs, credited in
   public/samples/LICENSES.md). Each instrument loads on first use. Until it has, or when it can't
   (offline before it was ever downloaded), play() returns null and the caller uses its synth voice.
   The service worker keeps every file it has fetched, so a sound heard once also works offline. */
import A from './audio.js';
import { SAMPLE_SETS } from './content/samples.js';

const BASE = ((import.meta.env && import.meta.env.BASE_URL) || '/') + 'samples/';
export const SAMPLE_CACHE = 'ww-samples'; // the service worker's runtime cache (vite.config.js)
const state = {}; // id -> { status: 'loading' | 'ready' | 'failed', promise, notes: Map(midi -> [layer][rr]), roots }
const rrNext = new Map();

const urlOf = (id, name) => BASE + id + '/' + name;

function decode(ctx, arr) {
  // Safari once had only the callback form
  return new Promise((res, rej) => { const p = ctx.decodeAudioData(arr, res, rej); if (p && p.then) p.then(res, rej); });
}

/* Where the note starts: MP3 encoders pad the start of a file, and browsers differ in whether they
   remove it, so find the attack in the decoded audio and start playback there (half a millisecond early). */
function onsetOf(buf) {
  const d = buf.getChannelData(0), n = Math.min(d.length, buf.sampleRate);
  for (let i = 0; i < n; i++) if (Math.abs(d[i]) > 0.003) return Math.max(0, i - Math.round(buf.sampleRate * 0.0005)) / buf.sampleRate;
  return 0;
}

async function pool(items, size, fn) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => { while (next < items.length) { const i = next++; await fn(items[i], i); } }));
}

/* Load an instrument (once). Resolves to true when it can play. */
export function load(id) {
  const set = SAMPLE_SETS[id];
  if (!set) return Promise.resolve(false);
  if (state[id]) return state[id].promise;
  const st = state[id] = { status: 'loading', notes: new Map(), roots: [] };
  st.promise = (async () => {
    try {
      const ctx = A.ensure();
      await pool(set.files, 6, async ([name, midi, layer, rr]) => {
        const r = await fetch(urlOf(id, name));
        if (!r.ok) throw new Error(name + ': HTTP ' + r.status);
        const buf = await decode(ctx, await r.arrayBuffer());
        if (!st.notes.has(midi)) st.notes.set(midi, []);
        const layers = st.notes.get(midi);
        (layers[layer] = layers[layer] || [])[rr] = { buf, onset: onsetOf(buf) };
      });
      st.roots = [...st.notes.keys()].sort((a, b) => a - b);
      st.status = 'ready';
      return true;
    } catch (e) {
      // keep the synth; a later call (back online, say) may try again
      console.warn('Samples for ' + id + ' could not load:', e && e.message);
      delete state[id];
      return false;
    }
  })();
  return st.promise;
}
export const ready = id => !!(state[id] && state[id].status === 'ready');

/* Play one note. vel 0–1 picks the velocity layer and the level within it. Starts loading the
   instrument and returns null if it isn't ready, so the caller can play its synth voice instead.
   o: { gain, detune (cents), release (seconds), pan (-1 left to 1 right) }.
   Returns the source node (already scheduled to stop). */
export function play(id, midi, when, vel = 0.8, dur = 1, out = null, o = {}) {
  const st = state[id], set = SAMPLE_SETS[id];
  if (!st || st.status !== 'ready') { load(id); return null; }
  const ctx = A.ensure();
  when = Math.max(when || 0, ctx.currentTime);
  // the nearest sampled pitch: never more than about two semitones to shift
  let root = st.roots[0];
  for (const r of st.roots) if (Math.abs(r - midi) < Math.abs(root - midi)) root = r;
  const layers = st.notes.get(root);
  const v = Math.max(0, Math.min(1, vel));
  const layer = Math.min(layers.length - 1, Math.floor(v * layers.length * 0.999));
  const rrs = layers[layer].filter(Boolean);
  const key = id + ':' + root + ':' + layer, k = rrNext.get(key) || 0;
  rrNext.set(key, k + 1);
  const smp = rrs[k % rrs.length];
  // within a layer, a little louder or softer with the velocity; layerGain restores the dynamic
  // range of libraries that normalised every sample
  const within = v * layers.length - layer; // 0..1 inside the layer
  const level = (set.gain || 1) * (set.layerGain ? set.layerGain[layer] : 1) * (0.8 + 0.35 * within) * (o.gain || 1);
  const src = ctx.createBufferSource();
  src.buffer = smp.buf;
  src.playbackRate.value = Math.pow(2, (midi - root) / 12) * (o.detune ? Math.pow(2, o.detune / 1200) : 1);
  const g = ctx.createGain();
  const rel = o.release || set.release || 0.1;
  g.gain.setValueAtTime(level, when);
  g.gain.setValueAtTime(level, when + dur);
  g.gain.setTargetAtTime(0, when + dur, rel / 3); // the damper: down to silence in about one release time
  src.connect(g);
  let head = g;
  if (o.pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = o.pan; g.connect(p); head = p; }
  head.connect(out || A.out());
  const left = (smp.buf.duration - smp.onset) / src.playbackRate.value;
  src.start(when, smp.onset);
  src.stop(when + Math.min(left, dur + rel * 1.5));
  return src;
}

/* ---------- downloading for offline use ---------- */
export const instruments = () => Object.entries(SAMPLE_SETS).map(([id, s]) => ({ id, name: s.name, bytes: s.bytes, files: s.files.length }));
export const totalBytes = () => Object.values(SAMPLE_SETS).reduce((a, s) => a + s.bytes, 0);
const allFiles = () => Object.entries(SAMPLE_SETS).flatMap(([id, s]) => s.files.map(f => ({ url: urlOf(id, f[0]), bytes: f[4] })));

/* How much is already on this device: files the service worker has kept */
export async function offlineBytes() {
  if (typeof caches === 'undefined') return 0;
  try {
    const c = await caches.open(SAMPLE_CACHE);
    let have = 0;
    await pool(allFiles(), 8, async f => { if (await c.match(new URL(f.url, location.href).href)) have += f.bytes; });
    return have;
  } catch (e) { return 0; }
}

/* Fetch every file, so the service worker keeps them all. onProgress(doneBytes, totalBytes). */
export async function downloadAll(onProgress) {
  const files = allFiles(), total = files.reduce((a, f) => a + f.bytes, 0);
  let done = 0, failed = 0;
  await pool(files, 4, async f => {
    try { const r = await fetch(f.url); if (!r.ok) throw new Error('HTTP ' + r.status); await r.arrayBuffer(); }
    catch (e) { failed++; }
    done += f.bytes;
    if (onProgress) onProgress(done, total);
  });
  return { total, failed };
}

export default { load, ready, play, instruments, totalBytes, offlineBytes, downloadAll };
