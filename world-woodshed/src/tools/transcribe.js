/* World Woodshed — Transcribe: slow down, loop, focus, find notes, save setups */
import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import Stretch from '../stretch.js';
import { detectPitch } from '../listen.js';
import './transcribe.css';
import { TRANSCRIBE_META } from './transcribe-lazy.js';

export default function transcribe(UI) {
  const { h, s, toast, bar, Fretboard, positionsOfPc } = UI;

  /* ---------- formatting ---------- */
  function fmt(t) {
    if (!isFinite(t)) return '0:00.0';
    t = Math.max(0, t);
    const m = Math.floor(t / 60), sec = t - m * 60;
    return m + ':' + (sec < 10 ? '0' : '') + sec.toFixed(1);
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const uid = () => 'sg' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  /* ---------- audio file cache (this device only) ---------- */
  const IDB = (() => {
    let dbp = null;
    function open() {
      if (dbp) return dbp;
      dbp = new Promise((res, rej) => {
        try {
          const r = indexedDB.open('world-woodshed-audio', 1);
          r.onupgradeneeded = () => r.result.createObjectStore('files');
          r.onsuccess = () => res(r.result);
          r.onerror = () => rej(r.error);
        } catch (e) { rej(e); }
      });
      return dbp;
    }
    async function tx(mode, fn) {
      const db = await open();
      return new Promise((res, rej) => {
        const t = db.transaction('files', mode);
        const req = fn(t.objectStore('files'));
        t.oncomplete = () => res(req && req.result);
        t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
      });
    }
    return {
      put: (id, rec) => tx('readwrite', st => st.put(rec, id)).then(() => true).catch(() => false),
      get: id => tx('readonly', st => st.get(id)).then(r => r || null).catch(() => null),
      del: id => tx('readwrite', st => st.delete(id)).then(() => true).catch(() => false)
    };
  })();

  /* ---------- time-stretch: worker with main-thread fallback ---------- */
  let worker = null, wid = 0;
  const pending = new Map();
  function getWorker() {
    if (worker !== null) return worker;
    try {
      worker = new Worker(new URL('../stretch.worker.js', import.meta.url), { type: 'module' });
      worker.onmessage = e => {
        const m = e.data, p = pending.get(m.id);
        if (!p) return;
        if (m.type === 'progress') { p.onProgress && p.onProgress(m.progress); return; }
        pending.delete(m.id);
        if (m.error) p.reject(new Error(m.error)); else p.resolve(m.channels);
      };
      worker.onerror = ev => {
        if (ev && ev.preventDefault) ev.preventDefault();
        worker = false;
        const list = [...pending.values()]; pending.clear();
        list.forEach(p => p.fallback());
      };
    } catch (e) { worker = false; }
    return worker;
  }
  function stretch(channels, sr, speed, semis, onProgress) {
    return new Promise((resolve, reject) => {
      const runLocal = () => setTimeout(() => {
        try { resolve(Stretch.process(channels, sr, speed, semis, null)); } catch (e) { reject(e); }
      }, 30);
      const w = getWorker();
      if (!w) { runLocal(); return; }
      const id = ++wid;
      pending.set(id, { resolve, reject, onProgress, fallback: runLocal });
      try { w.postMessage({ id, channels, sr, speed, semitones: semis }); }
      catch (e) { pending.delete(id); runLocal(); }
    });
  }

  /* ---------- FFT + note finder ---------- */
  function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) {
          const ur = re[i + k], ui = im[i + k];
          const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
          const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
          re[i + k] = ur + vr; im[i + k] = ui + vi;
          re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
          const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
        }
      }
    }
  }
  const HANN = {};
  function hann(N) {
    if (!HANN[N]) { const w = new Float32Array(N); for (let i = 0; i < N; i++) w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1)); HANN[N] = w; }
    return HANN[N];
  }
  /* windowed magnitude spectrum of sig[p .. p+N) */
  function magAt(sig, p, N) {
    const win = hann(N), re = new Float32Array(N), im = new Float32Array(N);
    for (let i = 0; i < N; i++) re[i] = sig[p + i] * win[i];
    fft(re, im);
    const mag = new Float32Array(N / 2);
    for (let k = 0; k < N / 2; k++) mag[k] = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
    return mag;
  }
  /* fold spectral peaks into 12 pitch classes. opts: pow (1 or 2), tune (cents the recording sits from A440), interp (parabolic peak position) */
  function foldPeaks(mag, sr, N, fLo, fHi, pcs, low, opts) {
    const pow = (opts && opts.pow) || 2, tune = (opts && opts.tune) || 0, interp = !!(opts && opts.interp);
    let tot = 0;
    for (let k = 2; k < N / 2 - 1; k++) {
      let f = k * sr / N;
      if (f < fLo || f > fHi) continue;
      if (mag[k] < mag[k - 1] || mag[k] < mag[k + 1]) continue; // peaks only
      if (interp) { const a = mag[k - 1], b = mag[k], c = mag[k + 1], den = a - 2 * b + c; if (den < 0) f = (k + 0.5 * (a - c) / den) * sr / N; }
      const midi = 69 + 12 * Math.log2(f / 440) - tune / 100;
      const pc = ((Math.round(midi) % 12) + 12) % 12;
      const w = pow === 2 ? mag[k] * mag[k] : mag[k];
      pcs[pc] += w; tot += w;
      if (low && f < 260) low[pc] += w;
    }
    return tot;
  }
  function chroma(mono, sr, a, b, fLo, fHi) {
    const N = 8192, hop = 4096;
    const start = Math.floor(a * sr), end = Math.min(mono.length, Math.floor(b * sr));
    const pcs = new Float64Array(12);
    const low = new Float64Array(12);
    let frames = 0;
    for (let p = start; p + N <= Math.max(end, start + N) && p + N <= mono.length && frames < 60; p += hop) {
      foldPeaks(magAt(mono, p, N), sr, N, fLo, fHi, pcs, low, { pow: 2 });
      frames++;
    }
    const norm = arr => { const m = Math.max(...arr); return Array.from(arr, v => (m > 0 ? v / m : 0)); };
    return { pcs: norm(pcs), low: norm(low), frames };
  }
  const CHORD_TEMPLATES = [['', [0, 4, 7]], ['m', [0, 3, 7]], ['7', [0, 4, 7, 10]], ['m7', [0, 3, 7, 10]], ['maj7', [0, 4, 7, 11]], ['m7♭5', [0, 3, 6, 10]], ['dim', [0, 3, 6]], ['sus4', [0, 5, 7]]];
  function guessChord(pcs, low) {
    let best = null;
    for (let r = 0; r < 12; r++) {
      CHORD_TEMPLATES.forEach(([q, iv]) => {
        const tones = iv.map(x => (r + x) % 12);
        let inS = 0, outS = 0;
        for (let p = 0; p < 12; p++) (tones.includes(p) ? (inS += pcs[p]) : (outS += pcs[p]));
        const score = inS / Math.sqrt(iv.length) - 0.45 * outS / Math.sqrt(12 - iv.length) + 0.25 * (low[r] || 0) - (iv.length > 3 ? 0.06 : 0);
        if (!best || score > best.score) best = { root: r, q, score, tones };
      });
    }
    return best;
  }

  /* ---------- whole-song analysis: tuning, key, tempo, beat phase ----------
     Written as generators that yield their progress (0–1) so `drive` can run them in
     ~10 ms slices between frames: the page stays responsive and playback never waits. */
  function drive(gen, alive, onProgress) {
    return new Promise((resolve, reject) => {
      const step = () => {
        if (!alive()) { resolve(null); return; }
        const t0 = performance.now();
        let last;
        try {
          while (performance.now() - t0 < 10) {
            const r = gen.next();
            if (r.done) { resolve(r.value); return; }
            if (r.value !== undefined) last = r.value;
          }
        } catch (e) { reject(e); return; }
        if (onProgress && last !== undefined) onProgress(last);
        setTimeout(step, 0);
      };
      setTimeout(step, 0);
    });
  }
  const lerpP = (p0, p1, f) => p0 + (p1 - p0) * f;
  /* low-pass (windowed sinc) and keep every q-th sample; centred, so times line up with the original */
  function* decimate(x, q, p0, p1) {
    if (q <= 1) return x;
    const M = 4 * q, taps = new Float32Array(2 * M + 1), fc = 0.45 / q;
    let sum = 0;
    for (let m = -M; m <= M; m++) {
      const w = 0.54 + 0.46 * Math.cos(Math.PI * m / M);
      const v = (m === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * m) / (Math.PI * m)) * w;
      taps[m + M] = v; sum += v;
    }
    for (let i = 0; i < taps.length; i++) taps[i] /= sum;
    const n = Math.floor(x.length / q), y = new Float32Array(n), len = x.length;
    for (let j = 0; j < n; j++) {
      const c = j * q - M;
      let acc = 0;
      if (c >= 0 && c + 2 * M < len) for (let m = 0; m <= 2 * M; m++) acc += taps[m] * x[c + m];
      else for (let m = 0; m <= 2 * M; m++) { const i = c + m; if (i >= 0 && i < len) acc += taps[m] * x[i]; }
      y[j] = acc;
      if ((j & 8191) === 0) yield lerpP(p0, p1, j / n);
    }
    return y;
  }
  const fftSizeFor = sr => 1 << Math.round(Math.log2(sr * 0.37)); // ~2.7 Hz bins: semitones apart even in the bass
  function frameRms(x, p, N) { let e = 0; for (let i = p; i < p + N; i += 4) e += x[i] * x[i]; return Math.sqrt(e * 4 / N); }
  /* How far the recording sits from A440, in cents: circular mean of the strongest peaks' offsets */
  function* tuning(x, sr, p0, p1) {
    const N = fftSizeFor(sr), frames = 48, span = x.length - N;
    if (span <= 0) return 0;
    let C = 0, S = 0;
    for (let f = 0; f < frames; f++) {
      const p = Math.floor(span * (f + 0.5) / frames);
      if (frameRms(x, p, N) < 0.004) continue;
      const mag = magAt(x, p, N), peaks = [];
      for (let k = 2; k < N / 2 - 1; k++) {
        const fr = k * sr / N;
        if (fr < 90 || fr > 1800 || mag[k] < mag[k - 1] || mag[k] < mag[k + 1]) continue;
        peaks.push(k);
      }
      peaks.sort((u, v) => mag[v] - mag[u]);
      peaks.slice(0, 6).forEach(k => {
        const a = Math.log(mag[k - 1] + 1e-9), b = Math.log(mag[k] + 1e-9), c = Math.log(mag[k + 1] + 1e-9), den = a - 2 * b + c;
        const kk = k + (den < 0 ? 0.5 * (a - c) / den : 0);
        const m = 69 + 12 * Math.log2(kk * sr / N / 440), dev = m - Math.round(m);
        C += mag[k] * Math.cos(2 * Math.PI * dev); S += mag[k] * Math.sin(2 * Math.PI * dev);
      });
      yield lerpP(p0, p1, f / frames);
    }
    if (!C && !S) return 0;
    return Math.round(Math.atan2(S, C) / (2 * Math.PI) * 100);
  }
  /* Krumhansl–Kessler key profiles (probe-tone ratings) */
  const KK_MAJ = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
  const KK_MIN = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
  function pearson(x, y) {
    const n = x.length; let mx = 0, my = 0;
    for (let i = 0; i < n; i++) { mx += x[i]; my += y[i]; }
    mx /= n; my /= n;
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++) { const a = x[i] - mx, b = y[i] - my; sxy += a * b; sxx += a * a; syy += b * b; }
    return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0;
  }
  function rankKeys(ch) {
    const out = [];
    for (let t = 0; t < 12; t++) {
      [false, true].forEach(minor => {
        const prof = minor ? KK_MIN : KK_MAJ, rot = new Array(12);
        for (let i = 0; i < 12; i++) rot[i] = prof[((i - t) % 12 + 12) % 12];
        out.push({ tonic: t, minor, r: pearson(ch, rot) });
      });
    }
    return out.sort((a, b) => b.r - a.r);
  }
  /* key of x between a and b seconds: per-frame chroma (each frame weighs the same), correlated with the 24 key profiles */
  function* keyScan(x, sr, a, b, tune, p0, p1) {
    const N = fftSizeFor(sr);
    const s0 = Math.max(0, Math.floor(a * sr)), s1 = Math.min(x.length, Math.floor(b * sr));
    const span = s1 - s0 - N;
    if (span < -N / 2 || x.length < N) return null;
    const nFr = clamp(Math.round(Math.max(0, span) / (0.2 * sr)) + 1, 1, 900);
    const hop = nFr > 1 ? span / (nFr - 1) : 0;
    const acc = new Float64Array(12), tmp = new Float64Array(12);
    let used = 0;
    for (let f = 0; f < nFr; f++) {
      const p = Math.min(x.length - N, Math.max(0, Math.round(s0 + f * hop)));
      if (frameRms(x, p, N) >= 0.004) {
        tmp.fill(0);
        const tot = foldPeaks(magAt(x, p, N), sr, N, 70, 2000, tmp, null, { pow: 2, tune, interp: true });
        if (tot > 0) { for (let i = 0; i < 12; i++) acc[i] += tmp[i] / tot; used++; }
      }
      if ((f & 7) === 0) yield lerpP(p0, p1, f / nFr);
    }
    if (!used) return null;
    const ranked = rankKeys(Array.from(acc));
    const r3 = v => Math.round(v * 1000) / 1000;
    const best = ranked[0], alt = ranked[1];
    return { tonic: best.tonic, minor: best.minor, r: r3(best.r), alt: { tonic: alt.tonic, minor: alt.minor, r: r3(alt.r) }, frames: used };
  }
  /* Tempo: spectral-flux onset envelope -> autocorrelation weighted towards 70–180 bpm -> comb refinement -> beat phase */
  function* tempoScan(x, sr, p0, p1) {
    const hop = Math.max(32, Math.round(sr / 86)), N = 1 << Math.ceil(Math.log2(hop * 4));
    const fps = sr / hop;
    // at most 150 s from the middle of the song: plenty for the tempo, and cheap on a phone
    const maxS = Math.floor(150 * sr);
    let s0 = 0, s1 = x.length;
    if (s1 - s0 > maxS) { s0 = Math.floor((x.length - maxS) / 2); s1 = s0 + maxS; }
    const nF = Math.floor((s1 - s0 - N) / hop) + 1;
    if (nF < fps * 6) return null; // needs a few seconds
    const win = hann(N), re = new Float32Array(N), im = new Float32Array(N), prev = new Float32Array(N / 2), env = new Float32Array(nF);
    const kHi = Math.min(N / 2, Math.round(8000 * N / sr));
    for (let i = 0; i < nF; i++) {
      const p = s0 + i * hop;
      for (let k = 0; k < N; k++) { re[k] = x[p + k] * win[k]; im[k] = 0; }
      fft(re, im);
      let flux = 0;
      for (let k = 1; k < kHi; k++) {
        const L = Math.log(1 + 10 * Math.sqrt(re[k] * re[k] + im[k] * im[k]));
        const d = L - prev[k]; if (d > 0) flux += d;
        prev[k] = L;
      }
      env[i] = i ? flux : 0;
      if ((i & 255) === 0) yield lerpP(p0, p1, 0.6 * i / nF);
    }
    // remove the slow trend (local mean over ±0.2 s) and keep the rises
    const R = Math.max(2, Math.round(0.2 * fps)), e = new Float32Array(nF);
    let run = 0;
    for (let i = 0; i < Math.min(nF, R); i++) run += env[i];
    for (let i = 0; i < nF; i++) {
      if (i + R < nF) run += env[i + R];
      if (i - R - 1 >= 0) run -= env[i - R - 1];
      const cnt = Math.min(nF - 1, i + R) - Math.max(0, i - R) + 1;
      e[i] = Math.max(0, env[i] - run / cnt);
    }
    // autocorrelation up to 8 beats at 40 bpm (or the envelope length)
    const Lmin = Math.floor(fps * 60 / 240), Lb = Math.ceil(fps * 60 / 40), Lmax = Math.min(nF - 2, Lb * 4);
    const acf = new Float32Array(Lmax + 2);
    for (let L = 0; L <= Lmax + 1 && L < nF; L++) {
      let sum = 0;
      for (let i = 0, n = nF - L; i < n; i++) sum += e[i] * e[i + L];
      acf[L] = sum / (nF - L);
      if ((L & 15) === 0) yield lerpP(p0, p1, 0.6 + 0.35 * L / Lmax);
    }
    if (!(acf[0] > 0)) return null;
    const acfI = L => { if (L < 0 || L > Lmax) return 0; const i = Math.floor(L), f = L - i; return acf[i] * (1 - f) + acf[Math.min(i + 1, Lmax + 1)] * f; };
    const prior = L => { const z = Math.log2(60 * fps / L / 112) / 0.8; return Math.exp(-0.5 * z * z); };
    let L0 = 0, bestS = -Infinity;
    for (let L = Lmin; L <= Math.min(Lb, Lmax); L++) {
      const sc = prior(L) * (acfI(L) + 0.5 * acfI(2 * L) + 0.25 * acfI(4 * L));
      if (sc > bestS) { bestS = sc; L0 = L; }
    }
    if (!L0) return null;
    // refine the period against its multiples (comb), to well under 1% error
    let T = L0, bestC = -Infinity;
    for (let c = L0 - 1.2; c <= L0 + 1.2; c += 0.02) {
      let sc = 0, k = 1;
      for (; k * c <= Lmax && k <= 16; k++) sc += acfI(k * c);
      sc /= (k - 1) || 1;
      if (sc > bestC) { bestC = sc; T = c; }
    }
    // beat phase: where a comb of period T catches the most onset strength
    const eI = v => { const i = Math.floor(v), f = v - i; return i + 1 < nF ? e[i] * (1 - f) + e[i + 1] * f : 0; };
    let phi = 0, bestP = -Infinity;
    for (let ph = 0; ph < T; ph += 0.25) {
      let sc = 0;
      for (let v = ph; v < nF - 1; v += T) sc += eI(v);
      if (sc > bestP) { bestP = sc; phi = ph; }
    }
    yield p1;
    const bpm = 60 * fps / T, beat = 60 / bpm;
    // the log-flux peak lands about a quarter window before the attack: measured on clicks, it puts beats within ~2 ms
    let phase = (s0 + phi * hop + 0.75 * N) / sr;
    phase = ((phase % beat) + beat) % beat;
    return { bpm: Math.round(bpm * 100) / 100, phase: Math.round(phase * 1000) / 1000, strength: Math.round(acfI(T) / acf[0] * 1000) / 1000 };
  }
  function* songAnalysis(mono, sr) {
    const q = Math.max(1, Math.round(sr / 11025)), dsr = sr / q;
    const ds = yield* decimate(mono, q, 0, 0.25);
    const tune = yield* tuning(ds, dsr, 0.25, 0.3);
    const key = yield* keyScan(ds, dsr, 0, ds.length / dsr, tune, 0.3, 0.55);
    const tempo = yield* tempoScan(ds, dsr, 0.55, 1);
    return { ds, dsr, tune, key, tempo };
  }
  const KEY_MAJ = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
  const KEY_MIN = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B'];
  const keyName = k => (k.minor ? KEY_MIN : KEY_MAJ)[k.tonic] + (k.minor ? ' minor' : ' major');
  const isRelative = (a, b) => a.minor !== b.minor && ((a.minor ? a.tonic + 3 : b.tonic + 3) % 12) === (a.minor ? b.tonic : a.tonic);
  /* confidence words from the fit of the best key and its lead over the runner-up */
  function keyConfidence(k) {
    const lead = k.r - k.alt.r;
    if (k.r < 0.45) return 'no strong key centre (modal, chromatic or mostly drums?)';
    if (lead >= 0.08) return 'fairly clear';
    if (lead >= 0.03) return 'likely';
    return 'a close call';
  }
  const midiName = m => D.NOTE_NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);

  /* ---------- focus (filter) graph ---------- */
  const MODES = [
    { id: 'full', name: 'Full mix', stereo: false, note: 'Everything, as recorded.' },
    { id: 'bass', name: 'Bass', stereo: false, note: 'Low-pass at about 250 Hz with a boost. Bass and kick drum stay; most else fades.' },
    { id: 'melody', name: 'Melody / lead', stereo: true, note: 'Centre of the mix, band-passed to the voice and lead range (220 Hz–4.5 kHz).' },
    { id: 'karaoke', name: 'Remove centre', stereo: true, note: 'Cancels whatever is panned dead centre (often vocals, bass, kick). Side-panned guitars and keys remain.' },
    { id: 'mid', name: 'Centre only', stereo: true, note: 'Left plus right: favours centred parts.' },
    { id: 'left', name: 'Left', stereo: true, note: 'Only the left channel. Great for old hard-panned jazz and Beatles mixes.' },
    { id: 'right', name: 'Right', stereo: true, note: 'Only the right channel.' }
  ];
  function buildChain(ctx, mode, eq) {
    const nodes = [];
    const mk = n => { nodes.push(n); return n; };
    const out = mk(ctx.createGain()); out.gain.value = eq.volume;
    const hp = mk(ctx.createBiquadFilter()); hp.type = 'highpass'; hp.frequency.value = eq.lowcut; hp.Q.value = 0.7;
    const lp = mk(ctx.createBiquadFilter()); lp.type = 'lowpass'; lp.frequency.value = eq.highcut; lp.Q.value = 0.7;
    hp.connect(lp); lp.connect(out); out.connect(ctx.destination);
    let input;
    const filt = (type, f, q, gain) => { const b = mk(ctx.createBiquadFilter()); b.type = type; b.frequency.value = f; if (q) b.Q.value = q; if (gain !== undefined) b.gain.value = gain; return b; };
    const split = () => mk(ctx.createChannelSplitter(2));
    const g = v => { const n = mk(ctx.createGain()); n.gain.value = v; return n; };
    switch (mode) {
      case 'bass': {
        input = g(1);
        const l1 = filt('lowpass', 260, 0.7), l2 = filt('lowpass', 260, 0.7), boost = g(1.9);
        input.connect(l1); l1.connect(l2); l2.connect(boost); boost.connect(hp);
        break;
      }
      case 'melody': case 'mid': case 'karaoke': {
        const sp = split(), gl = g(mode === 'karaoke' ? 0.8 : 0.5), gr = g(mode === 'karaoke' ? -0.8 : 0.5), sum = g(1);
        sp.connect(gl, 0); sp.connect(gr, 1); gl.connect(sum); gr.connect(sum);
        input = sp;
        if (mode === 'melody') {
          const h1 = filt('highpass', 220, 0.7), h2 = filt('highpass', 220, 0.7), l1 = filt('lowpass', 4500, 0.7), pk = filt('peaking', 1500, 0.9, 5);
          sum.connect(h1); h1.connect(h2); h2.connect(l1); l1.connect(pk); pk.connect(hp);
        } else sum.connect(hp);
        break;
      }
      case 'left': case 'right': {
        const sp = split(), one = g(1);
        sp.connect(one, mode === 'left' ? 0 : 1); one.connect(hp);
        input = sp;
        break;
      }
      default: input = g(1); input.connect(hp);
    }
    return { input, hp, lp, out, nodes, disconnect() { nodes.forEach(n => { try { n.disconnect(); } catch (e) { /* ignore */ } }); } };
  }

  /* ======================================================
     The Transcribe tool
     ====================================================== */
  UI.tool('transcribe', Object.assign({}, TRANSCRIBE_META, {
    render(body, ctx) {
      const P = {
        setup: null, buffer: null, mono: null, peaks: null, dur: 0, sr: 44100, file: null, videoUrl: null,
        playing: false, src: null, chain: null, startCtx: 0, startOrig: 0, pausePos: 0, token: 0,
        speed: 1, semis: 0, mode: 'full', eq: { lowcut: 20, highcut: 20000, volume: 1 },
        loopOn: false, a: null, b: null, gap: 0.5, countIn: false, bpm: null, reps: 0,
        trainer: { on: false, start: 60, step: 5, every: 3, target: 100 },
        cache: [], view: [0, 1], raf: 0, alive: true,
        bpmSrc: null, grid: { offset: null, bpb: 4, snap: false, show: true },
        est: null, ds: null, dsr: 0, anToken: 0, wantPlay: false
      };
      const GRID0 = { offset: null, bpb: 4, snap: false, show: true };
      const EST_V = 1;
      let saveTimer = null;
      const root = h('div', { class: 'section' }); body.append(root);

      /* ----- setup persistence ----- */
      function snapshot() {
        if (!P.setup) return;
        Object.assign(P.setup, {
          speed: P.speed, semis: P.semis, mode: P.mode, eq: Object.assign({}, P.eq),
          loop: { a: P.a, b: P.b, on: P.loopOn }, gap: P.gap, countIn: P.countIn, bpm: P.bpm, bpmSrc: P.bpmSrc,
          grid: Object.assign({}, P.grid), trainer: Object.assign({}, P.trainer), duration: P.dur
        });
      }
      function persist(now) {
        if (!P.setup) return;
        clearTimeout(saveTimer);
        const doIt = () => { snapshot(); E.saveSong(P.setup); savedLbl.textContent = 'Saved'; };
        if (now) doIt(); else { savedLbl.textContent = 'Saving…'; saveTimer = setTimeout(doIt, 700); }
      }
      function applySetup(st) {
        P.speed = st.speed || 1; P.semis = st.semis || 0; P.mode = st.mode || 'full';
        P.eq = Object.assign({ lowcut: 20, highcut: 20000, volume: 1 }, st.eq || {});
        P.a = st.loop ? st.loop.a : null; P.b = st.loop ? st.loop.b : null; P.loopOn = !!(st.loop && st.loop.on && P.a !== null);
        P.gap = st.gap !== undefined ? st.gap : 0.5; P.countIn = !!st.countIn; P.bpm = st.bpm || null;
        P.bpmSrc = P.bpm ? (st.bpmSrc || 'tap') : null;
        P.grid = Object.assign({}, GRID0, st.grid || {});
        P.trainer = Object.assign({ on: false, start: 60, step: 5, every: 3, target: 100 }, st.trainer || {});
      }

      /* ----- loading ----- */
      const savedLbl = h('span', { class: 'small muted mono' });
      const fileInput = h('input', { type: 'file', accept: 'audio/*,video/*,.mp3,.m4a,.wav,.aac,.ogg,.flac,.mp4,.mov,.webm', id: 'tr-file', hidden: true });
      fileInput.addEventListener('change', () => { const f = fileInput.files && fileInput.files[0]; if (f) loadFile(f, P.setup); fileInput.value = ''; });
      root.append(fileInput);

      function loaderCard(missing) {
        root.querySelectorAll('.tr-ui').forEach(n => n.remove());
        const c = h('div', { class: 'card tr-ui' });
        if (missing) {
          c.append(h('h2', { text: missing.title }),
            h('p', { text: 'This song\'s setup is saved, but the audio isn\'t stored on this device. Choose the file again to load it with your loops, sections and settings.' }),
            h('p', { class: 'small muted mono', text: 'Looking for: ' + (missing.fileName || 'the original file') }));
          if (missing.link) c.append(h('a', { href: missing.link, target: '_blank', rel: 'noopener', class: 'small' }, 'Open the saved reference link ↗'));
        } else {
          c.append(h('h2', { text: 'Load a song' }),
            h('p', { text: 'Pick an audio or video file from this device: MP3, M4A, WAV, AAC, FLAC, MP4, MOV or WebM. For video, the app uses the soundtrack and shows the picture in sync when it can.' }),
            h('p', { class: 'small muted', text: 'The app can\'t download from YouTube or other websites. Use a file you have, and paste the YouTube link into the song\'s reference field so it\'s one tap away.' }));
        }
        c.append(h('div', { class: 'row' }, h('button', { class: 'btn brass', onclick: () => fileInput.click() }, missing ? 'Choose the file' : 'Choose a file')));
        root.append(c);
      }
      async function loadFile(file, existingSetup) {
        stop();
        root.querySelectorAll('.tr-ui').forEach(n => n.remove());
        const status = h('div', { class: 'card tr-ui' }, h('h2', { text: 'Loading ' + file.name + '…' }), h('p', { class: 'small muted', text: 'Decoding audio. Long videos can take a moment.' }));
        root.append(status);
        try {
          const ac = A.ensure();
          const arr = await file.arrayBuffer();
          const buf = await new Promise((res, rej) => { const p = ac.decodeAudioData(arr, res, rej); if (p && p.then) p.then(res, rej); });
          if (!P.alive) return;
          P.buffer = buf; P.dur = buf.duration; P.sr = buf.sampleRate; P.file = file;
          P.cache = [];
          // mono mix + peaks for waveform and note finding
          const L = buf.getChannelData(0), R = buf.numberOfChannels > 1 ? buf.getChannelData(1) : L;
          P.mono = new Float32Array(L.length);
          for (let i = 0; i < L.length; i++) P.mono[i] = (L[i] + R[i]) * 0.5;
          const blk = 256, nb = Math.ceil(L.length / blk);
          const mn = new Float32Array(nb), mx = new Float32Array(nb);
          for (let bI = 0; bI < nb; bI++) {
            let lo = 1, hi = -1;
            const e = Math.min(L.length, (bI + 1) * blk);
            for (let i = bI * blk; i < e; i++) { const v = P.mono[i]; if (v < lo) lo = v; if (v > hi) hi = v; }
            mn[bI] = lo; mx[bI] = hi;
          }
          P.peaks = { blk, mn, mx };
          P.view = [0, P.dur];
          if (existingSetup) { P.setup = existingSetup; applySetup(existingSetup); }
          else {
            P.setup = { id: uid(), title: file.name.replace(/\.[^.]+$/, ''), link: '', sections: [], notes: '', created: Date.now() };
            P.speed = 1; P.semis = 0; P.mode = 'full'; P.a = P.b = null; P.loopOn = false;
            P.bpm = null; P.bpmSrc = null; P.countIn = false; P.grid = Object.assign({}, GRID0);
          }
          P.est = null; P.ds = null;
          Object.assign(P.setup, { fileName: file.name, fileSize: file.size, fileType: file.type, lastOpened: Date.now(), channels: buf.numberOfChannels });
          if (P.a !== null && (P.a >= P.dur || P.b > P.dur + 0.01)) { P.a = P.b = null; P.loopOn = false; }
          persist(true);
          if (file.size < 250 * 1024 * 1024) IDB.put(P.setup.id, { blob: file, name: file.name, type: file.type, size: file.size }).then(ok => { if (!ok) toast('This device would not store the audio. Reopening will ask for the file.'); });
          if (P.videoUrl) { URL.revokeObjectURL(P.videoUrl); P.videoUrl = null; }
          if ((file.type || '').startsWith('video/')) { try { P.videoUrl = URL.createObjectURL(file); } catch (e) { P.videoUrl = null; } }
          status.remove();
          buildUI();
          startAnalysis(false);
        } catch (e) {
          status.remove();
          const c = h('div', { class: 'card tr-ui' }, h('h2', { text: 'Couldn\'t read that file' }),
            h('p', { text: 'The browser could not decode the audio in "' + file.name + '". Try an MP3, M4A or WAV export of it, or a video in MP4 (AAC audio).' }),
            h('div', { class: 'row' }, h('button', { class: 'btn brass', onclick: () => fileInput.click() }, 'Choose another file')));
          root.append(c);
        }
      }

      /* ----- playback ----- */
      function curPos() {
        if (!P.playing) return P.pausePos;
        const ac = A.ensure();
        const t = P.startOrig + Math.max(0, ac.currentTime - P.startCtx) * P.speed;
        return Math.min(t, P.dur);
      }
      function region() {
        if (P.loopOn && P.a !== null && P.b - P.a > 0.05) return { a: P.a, b: P.b };
        return { a: 0, b: P.dur };
      }
      async function playable(rg, onProgress) {
        if (P.speed === 1 && P.semis === 0) return { buffer: P.buffer, a: 0 };
        const key = [rg.a.toFixed(3), rg.b.toFixed(3), P.speed, P.semis].join('|');
        const hit = P.cache.find(c => c.key === key);
        if (hit) return hit;
        // Stretch a little audio either side of the loop so its edges sound like the middle.
        const pad = Math.round(P.sr * 0.25);
        const s0 = Math.max(0, Math.floor(rg.a * P.sr) - pad), s1 = Math.min(P.buffer.length, Math.ceil(rg.b * P.sr) + pad);
        const chans = [];
        for (let c = 0; c < P.buffer.numberOfChannels; c++) chans.push(P.buffer.getChannelData(c).slice(s0, s1));
        const res = await stretch(chans, P.sr, P.speed, P.semis, onProgress);
        const ac = A.ensure();
        const out = ac.createBuffer(res.length, res[0].length, P.sr);
        res.forEach((ch, i) => out.copyToChannel(ch, i));
        const entry = { key, buffer: out, a: s0 / P.sr };
        P.cache.unshift(entry); if (P.cache.length > 3) P.cache.pop();
        return entry;
      }
      function stopSource() {
        P.token++;
        if (P.src) { P.src.onended = null; try { P.src.stop(); } catch (e) { /* ignore */ } try { P.src.disconnect(); } catch (e) { /* ignore */ } }
        P.src = null;
        if (P.chain) { P.chain.disconnect(); P.chain = null; }
      }
      function stop() {
        if (P.playing) P.pausePos = curPos();
        stopSource();
        P.playing = false; P.wantPlay = false;
        if (vid) vid.pause();
        ctx.setActive(false);
        refreshTransport();
      }
      async function play(from) {
        stopSource();
        const token = P.token;
        const rg = region();
        if (from === undefined || from === null) from = P.pausePos;
        if (from < rg.a || from >= rg.b - 0.05) from = rg.a;
        P.pausePos = from; P.wantPlay = true;
        setStatus('');
        let entry;
        const needs = !(P.speed === 1 && P.semis === 0);
        if (needs) setStatus('Preparing ' + Math.round(P.speed * 100) + '% speed' + (P.semis ? ', ' + (P.semis > 0 ? '+' : '') + P.semis + ' semitones' : '') + '…', 0);
        try { entry = await playable(rg, p => { if (token === P.token) setStatus(null, p); }); }
        catch (e) { setStatus('Could not process the audio: ' + e.message); P.wantPlay = false; refreshTransport(); return; }
        if (token !== P.token || !P.alive) return;
        setStatus('');
        const ac = A.ensure();
        P.chain = buildChain(ac, P.mode, P.eq);
        const src = ac.createBufferSource();
        src.buffer = entry.buffer;
        const rate = needs ? P.speed : 1;
        const offset = (from - entry.a) / rate;
        const length = Math.max(0.01, (rg.b - from) / rate);
        let when = ac.currentTime + 0.06;
        if (P.countIn && P.bpm) {
          const beat = 60 / (P.bpm * P.speed);
          for (let i = 0; i < 4; i++) A.hit(i === 0 ? 'clickHi' : 'click', when + i * beat, 0.9);
          when += 4 * beat;
        }
        // short fades so loop starts and ends don't click
        const fade = ac.createGain(), f = Math.min(0.008, length / 4);
        fade.gain.setValueAtTime(0, when);
        fade.gain.linearRampToValueAtTime(1, when + f);
        fade.gain.setValueAtTime(1, when + length - f);
        fade.gain.linearRampToValueAtTime(0, when + length);
        src.connect(fade); fade.connect(P.chain.input);
        P.chain.nodes.push(fade);
        src.start(when, Math.max(0, offset), length);
        P.src = src; P.startCtx = when; P.startOrig = from; P.playing = true;
        ctx.setActive(true);
        src.onended = () => { if (P.src !== src) return; passEnded(); };
        if (vid) {
          try { vid.playbackRate = clamp(P.speed, 0.25, 4); } catch (e) { /* ignore */ }
          vid.currentTime = from;
          const delay = Math.max(0, (when - ac.currentTime) * 1000);
          setTimeout(() => { if (P.src === src && vid) vid.play().catch(() => {}); }, delay);
        }
        refreshTransport();
      }
      function passEnded() {
        const rg = region();
        P.pausePos = rg.b;
        if (P.loopOn && P.a !== null) {
          P.reps++;
          let changed = false;
          if (P.trainer.on && P.reps % P.trainer.every === 0 && Math.round(P.speed * 100) < P.trainer.target) {
            P.speed = Math.min(P.trainer.target, Math.round(P.speed * 100) + P.trainer.step) / 100; changed = true;
            toast('Speed up: ' + Math.round(P.speed * 100) + '%');
            renderSpeed(); persist();
          }
          repsLbl.textContent = 'Loop passes: ' + P.reps;
          stopSource(); P.playing = false;
          const token = P.token;
          const go = () => { if (token === P.token && P.alive) play(P.a); };
          if (changed) go(); else setTimeout(go, P.gap * 1000);
          refreshTransport();
        } else { P.playing = false; P.wantPlay = false; stopSource(); if (vid) vid.pause(); ctx.setActive(false); refreshTransport(); }
      }
      function restartIfPlaying() { if (P.playing) play(curPos()); }

      /* ----- UI ----- */
      let canvas, wctx, waveCache, vid = null, timeLbl, loopLbl, playBtn, loopBtn, statusEl, statusBar, repsLbl, speedLbl, speedIn, semisLbl, renderSpeed = () => {}, sectionsList, analysisOut, modeNote;
      let hlFret;
      function setStatus(msg, prog) {
        if (!statusEl) return;
        if (msg !== null) statusEl.textContent = msg || '';
        statusEl.hidden = !statusEl.textContent;
        if (prog === undefined) { statusBar.hidden = true; return; }
        statusBar.hidden = false; statusBar.firstChild.style.width = Math.round(prog * 100) + '%';
      }
      function buildUI() {
        root.querySelectorAll('.tr-ui').forEach(n => n.remove());
        const st = P.setup;

        /* Song card */
        const titleIn = h('input', { type: 'text', id: 'tr-title', value: st.title || '', 'aria-label': 'Song title' });
        titleIn.addEventListener('input', () => { st.title = titleIn.value.trim() || 'Untitled'; persist(); msSetup(); });
        const linkIn = h('input', { type: 'text', id: 'tr-link', value: st.link || '', placeholder: 'YouTube or other reference link', 'aria-label': 'Reference link' });
        const linkA = h('a', { target: '_blank', rel: 'noopener', class: 'small' }, 'Open link ↗');
        const syncLink = () => { const v = linkIn.value.trim(); linkA.hidden = !/^https?:\/\//i.test(v); if (!linkA.hidden) linkA.href = v; };
        linkIn.addEventListener('input', () => { st.link = linkIn.value.trim(); syncLink(); persist(); });
        syncLink();
        root.append(h('div', { class: 'card tr-ui' },
          h('label', { class: 'stack', for: 'tr-title' }, h('span', { class: 'eyebrow', text: 'Song' }), titleIn),
          h('label', { class: 'stack', for: 'tr-link' }, h('span', { class: 'eyebrow', text: 'Reference link' }), linkIn), linkA,
          h('div', { class: 'spread' }, h('span', { class: 'small muted mono', text: st.fileName + ' · ' + fmt(P.dur) + (P.buffer.numberOfChannels > 1 ? ' · stereo' : ' · mono') }), savedLbl),
          h('div', { class: 'row' }, h('button', { class: 'btn small ghost', onclick: () => fileInput.click() }, 'Replace audio file'))));

        /* Player card */
        const player = h('div', { class: 'card tr-ui' });
        if (P.videoUrl) {
          vid = h('video', { class: 'tr-video', muted: true, playsinline: true, preload: 'auto' });
          vid.muted = true;
          vid.addEventListener('error', () => { if (vid) { vid.remove(); vid = null; } });
          vid.src = P.videoUrl;
          player.append(vid);
        } else vid = null;
        canvas = h('canvas', { class: 'wave', 'aria-label': 'Waveform. Tap to move the playhead, drag to select a loop.' });
        wctx = canvas.getContext('2d');
        timeLbl = h('span', { class: 'mono' }); loopLbl = h('span', { class: 'mono small muted' });
        playBtn = h('button', { class: 'btn primary', onclick: () => (P.playing ? stop() : play()) }, '▶ Play');
        loopBtn = h('button', { class: 'btn', 'aria-pressed': 'false', onclick: () => { if (P.a === null) { toast('Set A and B first, or drag on the waveform'); return; } P.loopOn = !P.loopOn; persist(); refreshTransport(); restartIfPlaying(); } }, 'Loop');
        const back = h('button', { class: 'btn small', onclick: () => seek(curPos() - 5) }, '−5 s');
        const fwd = h('button', { class: 'btn small', onclick: () => seek(curPos() + 5) }, '+5 s');
        const setA = h('button', { class: 'btn small', onclick: ev => markA(ev.shiftKey) }, 'Set A');
        const setB = h('button', { class: 'btn small', onclick: ev => markB(ev.shiftKey, false) }, 'Set B');
        const clearL = h('button', { class: 'btn small ghost', onclick: () => { P.a = P.b = null; P.loopOn = false; drawStatic(); persist(); refreshTransport(); restartIfPlaying(); } }, 'Clear loop');
        const nudge = (which, d) => h('button', { class: 'btn small ghost', onclick: () => {
          if (P.a === null) return;
          const dd = snapping() ? Math.sign(d) * 60 / P.bpm : d; // with snapping on, nudge by a beat
          if (which === 'a') P.a = clamp(P.a + dd, 0, P.b - 0.1); else P.b = clamp(P.b + dd, P.a + 0.1, P.dur);
          drawStatic(); persist(); refreshTransport(); restartIfPlaying();
        } }, (which === 'a' ? 'A ' : 'B ') + (d < 0 ? '◂' : '▸'));
        const zoomRow = h('div', { class: 'row' },
          h('button', { class: 'btn small ghost', onclick: () => { P.view = [0, P.dur]; drawStatic(); } }, 'Whole song'),
          h('button', { class: 'btn small ghost', onclick: () => { if (P.a === null) return; const pad = Math.max(0.3, (P.b - P.a) * 0.15); P.view = [Math.max(0, P.a - pad), Math.min(P.dur, P.b + pad)]; drawStatic(); } }, 'Zoom to loop'),
          h('button', { class: 'btn small ghost', 'aria-label': 'Zoom in', onclick: () => zoom(0.5) }, '+'),
          h('button', { class: 'btn small ghost', 'aria-label': 'Zoom out', onclick: () => zoom(2) }, '−'));
        statusEl = h('div', { class: 'small', hidden: true });
        statusBar = bar(0, 'brass'); statusBar.hidden = true;
        repsLbl = h('span', { class: 'small muted mono', text: '' });
        player.append(h('div', { class: 'wave-wrap' }, canvas), h('div', { class: 'spread' }, timeLbl, loopLbl), zoomRow,
          h('div', { class: 'row' }, playBtn, loopBtn, back, fwd),
          h('div', { class: 'row' }, setA, setB, nudge('a', -0.05), nudge('a', 0.05), nudge('b', -0.05), nudge('b', 0.05), clearL),
          statusEl, statusBar, repsLbl,
          h('p', { class: 'small muted', text: 'Tap the waveform to jump, drag across it to make a loop, drag the A or B line to adjust. Keys: space play, [ and ] set A and B, L loop, arrows ±2 s. With "Snap loops to beats" on, loops snap to the nearest beat; hold Shift for whole bars.' }));
        root.append(player);

        /* Key, tempo & beat grid card */
        root.append(buildEstCard());

        /* Note at the playhead card */
        root.append(buildNoteCard());

        /* Speed card */
        const speedCard = h('div', { class: 'card tr-ui' });
        speedIn = h('input', { type: 'range', min: 25, max: 125, step: 5, id: 'tr-speed', 'aria-label': 'Speed' });
        speedLbl = h('b', { class: 'mono' });
        semisLbl = h('b', { class: 'mono' });
        const presets = h('div', { class: 'chips' });
        [50, 60, 70, 75, 85, 100].forEach(v => presets.append(h('button', { class: 'chip', onclick: () => { setSpeed(v / 100); } }, v + '%')));
        let speedT = null;
        speedIn.addEventListener('input', () => { speedLbl.textContent = speedIn.value + '%'; clearTimeout(speedT); speedT = setTimeout(() => setSpeed(+speedIn.value / 100), 350); });
        renderSpeed = () => { speedIn.value = Math.round(P.speed * 100); speedLbl.textContent = Math.round(P.speed * 100) + '%'; semisLbl.textContent = (P.semis > 0 ? '+' : '') + P.semis + ' st'; };
        const semi = d => h('button', { class: 'btn small', onclick: () => { P.semis = clamp(P.semis + d, -12, 12); renderSpeed(); persist(); restartIfPlaying(); } }, d > 0 ? '+1' : '−1');
        const trainer = P.trainer;
        const tToggle = h('button', { class: 'chip', 'aria-pressed': String(trainer.on), onclick: () => { trainer.on = !trainer.on; tToggle.setAttribute('aria-pressed', String(trainer.on)); if (trainer.on) { P.reps = 0; setSpeed(trainer.start / 100); } persist(); } }, 'Speed trainer');
        const num = (label, key, min, max, step) => {
          const id = 'tr-tr-' + key;
          const inp = h('input', { type: 'number', id, min, max, step, value: trainer[key], class: 'num' });
          inp.addEventListener('change', () => { trainer[key] = clamp(+inp.value || min, min, max); inp.value = trainer[key]; persist(); });
          return h('label', { class: 'stack small', for: id }, h('span', { text: label }), inp);
        };
        const gapIn = h('input', { type: 'number', id: 'tr-gap', min: 0, max: 10, step: 0.5, value: P.gap, class: 'num' });
        gapIn.addEventListener('change', () => { P.gap = clamp(+gapIn.value || 0, 0, 10); persist(); });
        const countBtn = h('button', { class: 'chip', 'aria-pressed': String(P.countIn), onclick: () => { if (!P.bpm) { toast('Set a tempo first (Key, tempo & beat grid)'); return; } P.countIn = !P.countIn; countBtn.setAttribute('aria-pressed', String(P.countIn)); persist(); } }, 'Count-in before each loop');
        speedCard.append(h('h3', { text: 'Speed & pitch' }),
          h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Speed (pitch stays the same)' }), speedLbl), speedIn, presets,
          h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Transpose' }), h('div', { class: 'row' }, semi(-1), semisLbl, semi(1))),
          h('p', { class: 'small muted', text: 'Transpose to match a different tuning or capo, or drop a fast line an octave lower (−12) to hear it clearly.' }),
          h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Looping' }),
            h('div', { class: 'row' }, h('label', { class: 'stack small', for: 'tr-gap' }, h('span', { text: 'Pause between passes (s)' }), gapIn), countBtn),
            h('div', { class: 'row' }, tToggle),
            h('div', { class: 'tr-grid' }, num('Start %', 'start', 25, 100, 5), num('Add % each step', 'step', 1, 25, 1), num('Every N passes', 'every', 1, 20, 1), num('Stop at %', 'target', 30, 125, 5)),
            h('p', { class: 'small muted', text: 'The speed trainer starts slow and speeds up every few loop passes until it reaches your target.' })));
        root.append(speedCard);
        renderSpeed();

        /* Focus card */
        const focusCard = h('div', { class: 'card tr-ui' });
        const modeChips = h('div', { class: 'chips' });
        modeNote = h('p', { class: 'small muted' });
        const mono = P.buffer.numberOfChannels < 2;
        function renderModes() {
          modeChips.innerHTML = '';
          MODES.forEach(m => {
            const dis = m.stereo && mono;
            modeChips.append(h('button', { class: 'chip', 'aria-pressed': String(P.mode === m.id), disabled: dis ? true : null, title: dis ? 'Needs a stereo file' : null, onclick: () => { P.mode = m.id; renderModes(); swapChain(); persist(); } }, m.name));
          });
          const m = MODES.find(x => x.id === P.mode) || MODES[0];
          modeNote.textContent = m.note + (mono ? ' This file is mono, so stereo tricks are off.' : '');
        }
        const eqRange = (label, key, min, max, fmtV) => {
          const id = 'tr-eq-' + key;
          const lbl = h('span', { class: 'mono small' });
          const inp = h('input', { type: 'range', id, min: 0, max: 1000, 'aria-label': label });
          const toV = x => Math.round(min * Math.pow(max / min, x / 1000));
          const fromV = v => Math.round(1000 * Math.log(v / min) / Math.log(max / min));
          inp.value = fromV(P.eq[key]); lbl.textContent = fmtV(P.eq[key]);
          inp.addEventListener('input', () => {
            P.eq[key] = toV(+inp.value); lbl.textContent = fmtV(P.eq[key]);
            if (P.chain) { const n = key === 'lowcut' ? P.chain.hp : P.chain.lp; n.frequency.setTargetAtTime(P.eq[key], A.now(), 0.02); }
            persist();
          });
          return h('label', { class: 'stack', for: id }, h('span', { class: 'spread' }, h('span', { class: 'eyebrow', text: label }), lbl), inp);
        };
        const volIn = h('input', { type: 'range', id: 'tr-vol', min: 0, max: 200, value: Math.round(P.eq.volume * 100), 'aria-label': 'Volume' });
        volIn.addEventListener('input', () => { P.eq.volume = +volIn.value / 100; if (P.chain) P.chain.out.gain.setTargetAtTime(P.eq.volume, A.now(), 0.02); persist(); });
        const hz = v => v >= 1000 ? (v / 1000).toFixed(1) + ' kHz' : v + ' Hz';
        focusCard.append(h('h3', { text: 'Focus on a part' }), modeChips, modeNote,
          eqRange('Low cut', 'lowcut', 20, 1000, v => v <= 20 ? 'off' : hz(v)), eqRange('High cut', 'highcut', 800, 20000, v => v >= 20000 ? 'off' : hz(v)),
          h('label', { class: 'stack', for: 'tr-vol' }, h('span', { class: 'eyebrow', text: 'Volume' }), volIn),
          h('p', { class: 'small muted', text: 'These are filters and stereo tricks, not true stem separation, so expect some bleed. Combine them: Bass + speed 50% + transpose +12 makes bass lines much easier to hear.' }));
        root.append(focusCard);
        renderModes();

        /* Sections card */
        const secCard = h('div', { class: 'card tr-ui' });
        const secName = h('input', { type: 'text', id: 'tr-sec', placeholder: 'Name, e.g. Intro riff, Solo bars 1–4', 'aria-label': 'Section name' });
        sectionsList = h('div', { class: 'stack' });
        const addSec = h('button', { class: 'btn small brass', onclick: () => {
          if (P.a === null) { toast('Make a loop first'); return; }
          st.sections = st.sections || [];
          st.sections.push({ name: secName.value.trim() || 'Section ' + (st.sections.length + 1), a: P.a, b: P.b });
          st.sections.sort((x, y) => x.a - y.a);
          secName.value = ''; renderSections(); drawStatic(); persist();
        } }, 'Save loop as section');
        secCard.append(h('h3', { text: 'Sections' }), h('div', { class: 'row' }, secName, addSec), sectionsList);
        root.append(secCard);
        renderSections();

        /* Note finder */
        const anCard = h('div', { class: 'card tr-ui' });
        analysisOut = h('div', { class: 'stack' });
        hlFret = Fretboard({ onTap: (si, f) => A.note(E.STRINGS[si].midi + f, A.now() + 0.01, 0.8, 1.4) });
        hlFret.el.hidden = true;
        anCard.append(h('h3', { text: 'What notes are these?' }),
          h('p', { class: 'small muted', text: 'Analyzes the loop (if it\'s under 8 seconds) or half a second around the playhead, using the current focus. Tap the fretboard to check a note against the recording.' }),
          h('div', { class: 'row' }, h('button', { class: 'btn', onclick: analyze }, 'Find the notes')), analysisOut, hlFret.el);
        root.append(anCard);

        /* Notes + tempo */
        const notesCard = h('div', { class: 'card tr-ui' });
        const ta = h('textarea', { id: 'tr-notes', rows: 6, placeholder: 'Your transcription: chords, tab, fingerings, what to practice next…', 'aria-label': 'Notes' });
        ta.value = st.notes || '';
        ta.addEventListener('input', () => { st.notes = ta.value; persist(); });
        notesCard.append(h('h3', { text: 'Notes' }), ta);
        root.append(notesCard);

        setupCanvas();
        refreshTransport();
        savedLbl.textContent = 'Saved';
        msSetup();
        loopTick();
      }

      /* ----- key, tempo & beat grid ----- */
      let keyOut, keyHint, loopKeyOut, tempoLbl, tempoAlt, bpmIn, anStatus, anBar, showChip, snapChip, bpbSel, loopTok = 0;
      const gridOn = () => !!(P.bpm && P.grid.offset !== null && P.grid.offset !== undefined);
      const snapping = () => !!(P.grid.snap && gridOn());
      function snapT(t, toBar) {
        if (!snapping()) return t;
        const L = 60 / P.bpm * (toBar ? P.grid.bpb : 1);
        return clamp(P.grid.offset + Math.round((t - P.grid.offset) / L) * L, 0, P.dur);
      }
      function markA(toBar) {
        const t = snapT(curPos(), toBar);
        P.a = t;
        if (P.b === null || P.b <= t + 0.1) P.b = Math.min(P.dur, t + (snapping() ? 60 / P.bpm * P.grid.bpb : 4));
        drawStatic(); persist(); refreshTransport();
      }
      function markB(toBar, quiet) {
        const t = snapT(curPos(), toBar);
        if (P.a === null || t <= P.a + 0.1) { if (!quiet) toast('Set B after A'); return; }
        P.b = t; P.loopOn = true; drawStatic(); persist(); refreshTransport(); restartIfPlaying();
      }
      function setBpm(v, src) {
        P.bpm = clamp(Math.round(v * 100) / 100, 20, 400); P.bpmSrc = src;
        renderTempo(); renderGrid(); drawStatic(); persist();
      }
      function showAn(msg, prog) {
        if (!anStatus) return;
        if (msg !== null) anStatus.textContent = msg || '';
        anStatus.parentNode.hidden = !anStatus.textContent;
        if (prog !== undefined) anBar.firstChild.style.width = Math.round(prog * 100) + '%';
      }
      function buildEstCard() {
        const c = h('div', { class: 'card tr-ui tr-est' });
        keyOut = h('p', { class: 'tr-keyline' });
        keyHint = h('p', { class: 'small muted' });
        loopKeyOut = h('span', { class: 'small' });
        anStatus = h('span', { class: 'small muted' }); anBar = bar(0, 'brass');
        const anRow = h('div', { class: 'stack tr-an', hidden: true }, anStatus, anBar);
        // tempo
        bpmIn = h('input', { type: 'number', id: 'tr-bpm', min: 30, max: 300, step: 0.1, class: 'num tr-bpm', inputmode: 'decimal' });
        bpmIn.addEventListener('change', () => { const v = +bpmIn.value; if (!(v >= 30 && v <= 300)) { renderTempo(); return; } setBpm(v, 'manual'); });
        tempoLbl = h('p', { class: 'small muted tr-tempo-lbl' });
        tempoAlt = h('div', { class: 'row small' });
        const scaleBtn = (f, label, aria) => h('button', { class: 'btn small ghost', 'aria-label': aria, onclick: () => { if (!P.bpm) { toast('No tempo yet: tap along or type it'); return; } setBpm(P.bpm * f, 'manual'); } }, label);
        const taps = [];
        const tapBtn = h('button', { class: 'btn small', onclick: () => {
          const t = performance.now(); if (taps.length && t - taps[taps.length - 1] > 2000) taps.length = 0;
          taps.push(t); if (taps.length > 8) taps.shift();
          if (taps.length >= 3) { const d = (taps[taps.length - 1] - taps[0]) / (taps.length - 1); setBpm(Math.round(60000 / d / P.speed), 'tap'); }
        } }, 'Tap tempo');
        // grid
        showChip = h('button', { class: 'chip', onclick: () => { P.grid.show = !P.grid.show; renderGrid(); drawStatic(); persist(); } }, 'Show beat grid');
        snapChip = h('button', { class: 'chip', onclick: () => {
          if (!P.grid.snap && !gridOn()) { toast('Set a tempo and a downbeat first'); return; }
          P.grid.snap = !P.grid.snap; renderGrid(); persist();
        } }, 'Snap loops to beats');
        bpbSel = h('select', { id: 'tr-bpb' }, [2, 3, 4, 5, 6, 7].map(n => h('option', { value: n, text: n + ' beats' })));
        bpbSel.addEventListener('change', () => { P.grid.bpb = clamp(+bpbSel.value || 4, 2, 7); drawStatic(); persist(); });
        const downBtn = h('button', { class: 'btn small brass', onclick: () => {
          if (!P.bpm) { toast('Set a tempo first: tap along or type it'); return; }
          P.grid.offset = Math.round(curPos() * 1000) / 1000; P.grid.show = true;
          renderGrid(); drawStatic(); persist(); toast('Bar 1 starts here');
        } }, 'Set downbeat here');
        const gNudge = (d, label, aria) => h('button', { class: 'btn small ghost', 'aria-label': aria, onclick: () => {
          if (!gridOn()) { toast('Set a tempo and a downbeat first'); return; }
          P.grid.offset = Math.round((P.grid.offset + d()) * 1000) / 1000; drawStatic(); persist();
        } }, label);
        c.append(h('h3', { text: 'Key, tempo & beat grid' }), anRow,
          keyOut, keyHint,
          h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: loopKey }, 'Key of the loop'), loopKeyOut),
          h('div', { class: 'tr-sub' }, h('span', { class: 'eyebrow', text: 'Tempo' }),
            h('div', { class: 'row' }, h('label', { class: 'row tr-bpm-wrap', for: 'tr-bpm' }, bpmIn, h('span', { class: 'small muted', text: 'bpm' })),
              scaleBtn(0.5, '½', 'Halve the tempo'), scaleBtn(2, '×2', 'Double the tempo'), tapBtn),
            tempoLbl, tempoAlt),
          h('div', { class: 'tr-sub' }, h('span', { class: 'eyebrow', text: 'Beat grid' }),
            h('div', { class: 'row' }, showChip, h('label', { class: 'row small', for: 'tr-bpb' }, h('span', { text: 'Bar of' }), bpbSel), snapChip),
            h('div', { class: 'row' }, downBtn,
              gNudge(() => -0.01, '◂ 10 ms', 'Move the grid 10 milliseconds earlier'), gNudge(() => 0.01, '10 ms ▸', 'Move the grid 10 milliseconds later'),
              gNudge(() => -60 / P.bpm, '◂ beat', 'Move the bar lines one beat earlier'), gNudge(() => 60 / P.bpm, 'beat ▸', 'Move the bar lines one beat later')),
            h('p', { class: 'small muted', text: 'Tall lines are bar lines, short ticks are beats. Play to the first beat of a bar and press "Set downbeat here", then nudge until the lines sit on the hits (zoom in to check). Live recordings drift, so set the downbeat near the part you are working on.' })));
        renderKey(); renderTempo(); renderGrid();
        return c;
      }
      function renderGrid() {
        if (!showChip) return;
        showChip.setAttribute('aria-pressed', String(!!P.grid.show));
        snapChip.setAttribute('aria-pressed', String(snapping()));
        bpbSel.value = String(P.grid.bpb);
      }
      function renderKey() {
        if (!keyOut) return;
        const k = P.est && P.est.key;
        keyHint.textContent = '';
        if (!P.est) { keyOut.textContent = P.anToken ? 'Key: listening…' : 'Key: not analysed yet.'; return; }
        if (!k) { keyOut.textContent = 'Key: not enough pitched sound to tell.'; return; }
        keyOut.replaceChildren(k.r < 0.45 ? 'Key: unclear, closest is ' : 'Key: probably ', h('b', { text: keyName(k) }), h('span', { class: 'muted', text: ' (or ' + keyName(k.alt) + ')' }));
        const conf = keyConfidence(k), bits = [conf.charAt(0).toUpperCase() + conf.slice(1) + '.'];
        if (isRelative(k, k.alt)) bits.push('Those two keys share the same notes: listen for the chord the song comes home to.');
        else if (k.alt.tonic === k.tonic) bits.push('Same home note, major or minor: listen to the third of the home chord.');
        const tune = P.est.tune || 0;
        if (Math.abs(tune) >= 15) bits.push('The recording sits about ' + Math.abs(tune) + ' cents ' + (tune > 0 ? 'sharp' : 'flat') + ' of A440 (tape speed or a different tuning); the key allows for it, the note readout below does not.');
        keyHint.textContent = bits.join(' ');
      }
      async function loopKey() {
        if (P.a === null) { toast('Make a loop first'); return; }
        const my = ++loopTok, x = P.ds || P.mono, sr = P.ds ? P.dsr : P.sr;
        loopKeyOut.textContent = 'Listening…';
        let k = null;
        try { k = await drive(keyScan(x, sr, P.a, P.b, P.est ? P.est.tune || 0 : 0, 0, 1), () => P.alive && my === loopTok); }
        catch (e) { k = null; }
        if (!P.alive || my !== loopTok) return;
        loopKeyOut.replaceChildren(...(k ? ['Loop: probably ', h('b', { text: keyName(k) }), ' (or ' + keyName(k.alt) + '), ' + keyConfidence(k) + '.'] : ['Not enough pitched sound in the loop to tell.']));
      }
      function renderTempo() {
        if (!tempoLbl) return;
        const est = P.est && P.est.tempo;
        if (document.activeElement !== bpmIn) bpmIn.value = P.bpm ? String(Math.round(P.bpm * 10) / 10) : '';
        if (!P.bpm) tempoLbl.textContent = P.est ? 'No steady beat found. Tap along or type the tempo.' : P.anToken ? 'Estimating…' : 'Tap along or type the tempo.';
        else if (P.bpmSrc === 'est') tempoLbl.textContent = '≈ ' + Math.round(P.bpm) + ' bpm (estimated' + (est && est.strength < 0.12 ? ', weak pulse: check by ear' : '') + '). If it feels twice as fast or slow, use ½ or ×2.';
        else tempoLbl.textContent = (Math.round(P.bpm * 10) / 10) + ' bpm (' + (P.bpmSrc === 'tap' ? 'tapped; the app corrects for the current speed' : 'set by you') + ').';
        tempoAlt.replaceChildren();
        if (est && P.bpmSrc !== 'est' && (!P.bpm || Math.abs(est.bpm / P.bpm - 1) > 0.015)) {
          tempoAlt.append(h('span', { class: 'muted', text: 'Estimate: ≈ ' + Math.round(est.bpm) + ' bpm' }),
            h('button', { class: 'btn small ghost', onclick: () => { if (P.grid.offset === null || P.grid.offset === undefined) P.grid.offset = est.phase; setBpm(est.bpm, 'est'); } }, 'Use estimate'));
        }
      }
      async function startAnalysis(force) {
        const st = P.setup, c = st.est;
        if (!force && c && c.v === EST_V && Math.abs((c.dur || 0) - P.dur) < 0.05 && c.size === (P.file ? P.file.size : 0)) { P.est = c; applyEstimate(); return; }
        const tok = ++P.anToken;
        showAn('Listening for the key and tempo…', 0);
        renderKey(); renderTempo();
        let res;
        try { res = await drive(songAnalysis(P.mono, P.sr), () => P.alive && tok === P.anToken, p => { if (tok === P.anToken) showAn(null, p); }); }
        catch (e) { console.error(e); res = false; }
        if (!P.alive || tok !== P.anToken || res === null) return;
        showAn('');
        if (!res) { keyOut.textContent = 'Key and tempo: could not analyse this file.'; return; }
        P.ds = res.ds; P.dsr = res.dsr;
        P.est = st.est = { v: EST_V, dur: P.dur, size: P.file ? P.file.size : 0, tune: res.tune, key: res.key, tempo: res.tempo };
        applyEstimate(); persist();
      }
      function applyEstimate() {
        const t = P.est && P.est.tempo;
        if (t && !P.bpm) { P.bpm = t.bpm; P.bpmSrc = 'est'; }
        if (t && P.bpmSrc === 'est' && (P.grid.offset === null || P.grid.offset === undefined)) P.grid.offset = t.phase;
        renderKey(); renderTempo(); renderGrid(); drawStatic();
      }

      /* ----- note at the playhead (the recording, not the mic) ----- */
      let noteBig, noteCents, noteFreq, noteWhy, noteMeter, noteFret, noteVisible = true, noteShown = null, noteOnBoard = 0;
      const lastNote = { key: '', at: 0 };
      function noteAt(t) {
        const sr = P.sr, q = sr > 32000 ? 2 : 1, dsr = sr / q;
        const W = Math.round(0.08 * dsr), s0 = Math.round(t * sr) - Math.round(0.04 * sr);
        if (!P.mono || s0 < 0 || s0 + W * q > P.mono.length) return { why: 'edge' };
        const L = P.buffer.getChannelData(0), R = P.buffer.numberOfChannels > 1 ? P.buffer.getChannelData(1) : L, md = P.mode;
        const x = new Float32Array(W);
        let mean = 0;
        for (let j = 0; j < W; j++) {
          let v = 0;
          for (let k = 0; k < q; k++) { const i = s0 + j * q + k; v += md === 'left' ? L[i] : md === 'right' ? R[i] : md === 'karaoke' ? L[i] - R[i] : P.mono[i]; }
          x[j] = v / q; mean += x[j];
        }
        mean /= W;
        let e = 0;
        for (let j = 0; j < W; j++) { x[j] -= mean; e += x[j] * x[j]; }
        if (Math.sqrt(e / W) < 0.004) return { why: 'quiet' };
        const r = detectPitch(x, dsr);
        if (!r || r.clarity < 0.8) return { why: 'unclear' };
        return { freq: r.freq, clarity: r.clarity };
      }
      function updateNote(t) {
        const r = noteAt(t);
        if (!r.freq) {
          noteBig.classList.add('dim');
          noteWhy.textContent = r.why === 'quiet' ? 'Quiet here.' : r.why === 'edge' ? '' : 'No single clear pitch here (a chord, drums or noise).';
          if (!P.playing) { noteBig.textContent = '—'; noteCents.textContent = ''; noteFreq.textContent = ''; noteMeter.hidden = true; noteFret.clear(); noteShown = null; }
          return;
        }
        const m = 69 + 12 * Math.log2(r.freq / 440) + P.semis, mr = Math.round(m), cents = Math.round((m - mr) * 100);
        noteBig.textContent = midiName(mr); noteBig.classList.remove('dim');
        noteCents.textContent = (cents > 0 ? '+' : cents < 0 ? '−' : '±') + Math.abs(cents) + '¢';
        noteFreq.textContent = (r.freq * Math.pow(2, P.semis / 12)).toFixed(1) + ' Hz' + (P.semis ? ' · transposed ' + (P.semis > 0 ? '+' : '−') + Math.abs(P.semis) + ' st' : '');
        noteMeter.hidden = false;
        const needle = noteMeter.firstChild;
        needle.style.left = clamp(50 + cents, 0, 100) + '%';
        needle.classList.toggle('ok', Math.abs(cents) <= 10);
        noteWhy.textContent = '';
        if (noteShown !== mr) {
          noteShown = mr;
          const pos = [];
          E.STRINGS.forEach((st, si) => { const f = mr - st.midi; if (f >= 0 && f <= 12) pos.push({ s: si, f, kind: 'root', label: D.NOTE_NAMES[((mr % 12) + 12) % 12] }); });
          noteFret.mark(pos); noteOnBoard = pos.length;
        }
        if (mr < Math.min(...E.STRINGS.map(x => x.midi))) noteWhy.textContent = 'Below the guitar\'s range: a bass note? Try transpose +12.';
        else if (!noteOnBoard) noteWhy.textContent = 'Above the 12th fret.';
      }
      function buildNoteCard() {
        const c = h('div', { class: 'card tr-ui tr-notecard' });
        noteBig = h('span', { class: 'tr-note dim', text: '—' });
        noteCents = h('span', { class: 'mono' });
        noteFreq = h('span', { class: 'mono small muted' });
        noteMeter = h('div', { class: 'tr-cents', 'aria-hidden': 'true', hidden: true }, h('i'));
        noteWhy = h('p', { class: 'small muted tr-note-why' });
        noteFret = Fretboard({ label: 'Where the note at the playhead sits on the guitar', onTap: (si, f) => A.note(E.STRINGS[si].midi + f, A.now() + 0.01, 0.8, 1.4) });
        noteShown = null; lastNote.key = '';
        c.append(h('h3', { text: 'Note at the playhead' }),
          h('div', { class: 'tr-note-read' }, noteBig, h('div', { class: 'stack tr-note-detail' }, noteCents, noteMeter, noteFreq)),
          noteWhy, h('div', { class: 'tr-mini' }, noteFret.el),
          h('p', { class: 'small muted', text: 'The main pitch of the recording right at the playhead (not the microphone), read a few times a second while it plays and whenever you move it. Best on solo and melody parts: chords and busy mixes confuse it, so try the "Melody / lead" or "Left" / "Right" focus. Tap the fretboard to compare.' }));
        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver(es => { noteVisible = es[es.length - 1].isIntersecting; if (noteVisible) lastNote.key = ''; });
          io.observe(c); cleanups.push(() => io.disconnect());
        }
        return c;
      }
      function noteTick() {
        if (!noteBig || !noteBig.isConnected || !noteVisible || document.visibilityState !== 'visible') return;
        const now = performance.now(), t = curPos();
        if (P.playing) { if (now - lastNote.at < 250) return; }
        else { const key = t.toFixed(4) + '|' + P.semis + '|' + P.mode; if (key === lastNote.key) return; lastNote.key = key; }
        lastNote.at = now;
        updateNote(t);
      }

      function setSpeed(v) {
        P.speed = clamp(Math.round(v * 100) / 100, 0.25, 1.25);
        renderSpeed(); persist(); restartIfPlaying();
      }
      function swapChain() {
        if (!P.src) return;
        const ac = A.ensure();
        const old = P.chain;
        P.chain = buildChain(ac, P.mode, P.eq);
        try { P.src.disconnect(); } catch (e) { /* ignore */ }
        P.src.connect(P.chain.input);
        if (old) old.disconnect();
      }
      function seek(t) {
        t = clamp(t, 0, P.dur);
        P.pausePos = t;
        if (P.playing) play(t); else { if (vid) vid.currentTime = t; refreshTransport(); }
      }
      function zoom(f) {
        const c = curPos(), w = clamp((P.view[1] - P.view[0]) * f, 0.5, P.dur);
        let a = c - w / 2; a = clamp(a, 0, Math.max(0, P.dur - w));
        P.view = [a, a + w]; drawStatic();
      }
      function renderSections() {
        const st = P.setup; sectionsList.innerHTML = '';
        const list = st.sections || [];
        if (!list.length) { sectionsList.append(h('p', { class: 'small muted', text: 'No sections yet. Make a loop, name it, and save it. Sections come back every time you open this song.' })); return; }
        list.forEach((sc, i) => {
          sectionsList.append(h('div', { class: 'secrow' },
            h('button', { class: 'chip', onclick: () => { P.a = sc.a; P.b = sc.b; P.loopOn = true; P.reps = 0; const pad = Math.max(0.3, (sc.b - sc.a) * 0.15); P.view = [Math.max(0, sc.a - pad), Math.min(P.dur, sc.b + pad)]; drawStatic(); persist(); refreshTransport(); play(sc.a); } }, '▶ ' + sc.name),
            h('span', { class: 'mono small muted', text: fmt(sc.a) + '–' + fmt(sc.b) }),
            h('button', { class: 'btn small ghost', 'aria-label': 'Delete section ' + sc.name, onclick: () => { list.splice(i, 1); renderSections(); drawStatic(); persist(); } }, 'Delete')));
        });
      }
      function analyze() {
        let a, b;
        if (P.a !== null && P.b - P.a <= 8) { a = P.a; b = P.b; }
        else { const c = curPos(); a = Math.max(0, c - 0.25); b = Math.min(P.dur, c + 0.25); }
        // use channel mix appropriate to the focus mode
        let sig = P.mono;
        if (P.buffer.numberOfChannels > 1 && ['left', 'right', 'karaoke'].includes(P.mode)) {
          const L = P.buffer.getChannelData(0), R = P.buffer.getChannelData(1);
          const s0 = Math.floor(a * P.sr), s1 = Math.min(L.length, Math.ceil(b * P.sr) + 8192);
          sig = new Float32Array(L.length);
          for (let i = s0; i < s1; i++) sig[i] = P.mode === 'left' ? L[i] : P.mode === 'right' ? R[i] : (L[i] - R[i]);
        }
        let fLo = Math.max(45, P.eq.lowcut), fHi = Math.min(2200, P.eq.highcut);
        if (P.mode === 'bass') { fLo = 35; fHi = 300; }
        if (P.mode === 'melody') { fLo = Math.max(fLo, 200); }
        const res = chroma(sig, P.sr, a, b, fLo, fHi);
        analysisOut.innerHTML = '';
        if (!res.frames || Math.max(...res.pcs) === 0) { analysisOut.append(h('p', { class: 'small', text: 'Nothing clear to analyze here. Try a louder spot or a longer loop.' })); hlFret.el.hidden = true; return; }
        const ranked = res.pcs.map((v, i) => ({ i, v })).sort((x, y) => y.v - x.v);
        const strong = ranked.filter(x => x.v >= 0.3).slice(0, 5);
        const ch = guessChord(res.pcs, res.low);
        const bassPc = res.low.indexOf(Math.max(...res.low));
        // chroma chart
        const W = 360, H = 120;
        const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img', 'aria-label': 'Strength of each of the 12 notes' });
        const bw = W / 12;
        res.pcs.forEach((v, i) => {
          const bh = Math.max(1, v * (H - 28));
          svg.append(s('rect', { x: i * bw + 3, y: H - 18 - bh, width: bw - 6, height: bh, rx: 2, class: strong.some(x => x.i === i) ? 'barfill' : 'barweak' }));
          svg.append(s('text', { x: i * bw + bw / 2, y: H - 4, 'text-anchor': 'middle' }, D.NOTE_NAMES[i]));
        });
        const lines = [
          h('p', {}, h('b', { text: 'Strongest notes: ' }), strong.map(x => D.NOTE_NAMES[x.i]).join(', ')),
          h('p', {}, h('b', { text: 'Chord guess: ' }), D.NOTE_NAMES[ch.root] + ch.q, h('span', { class: 'muted small', text: '  (an estimate; trust your ear)' })),
          P.mode !== 'bass' && res.low[bassPc] > 0 ? h('p', {}, h('b', { text: 'Lowest strong note: ' }), D.NOTE_NAMES[bassPc]) : null,
          h('p', { class: 'small muted', text: 'Analyzed ' + fmt(a) + '–' + fmt(b) + '.' })
        ];
        analysisOut.append(svg, ...lines.filter(Boolean));
        hlFret.el.hidden = false;
        const pcsShow = strong.map(x => x.i);
        hlFret.mark(positionsOfPc(pcsShow).map(m => Object.assign(m, { kind: m.p === ch.root ? 'root' : 'tone' })));
      }

      /* ----- waveform ----- */
      let drag = null;
      function setupCanvas() {
        const resize = () => {
          if (!canvas || !canvas.isConnected) return;
          const dpr = window.devicePixelRatio || 1;
          const w = canvas.parentElement.clientWidth;
          canvas.width = Math.max(200, Math.round(w * dpr)); canvas.height = Math.round(120 * dpr);
          canvas.style.height = '120px';
          drawStatic();
        };
        resize();
        window.addEventListener('resize', resize);
        cleanups.push(() => window.removeEventListener('resize', resize));
        const tAt = ev => { const r = canvas.getBoundingClientRect(); return P.view[0] + clamp((ev.clientX - r.left) / r.width, 0, 1) * (P.view[1] - P.view[0]); };
        const pxPerSec = () => canvas.getBoundingClientRect().width / (P.view[1] - P.view[0]);
        canvas.addEventListener('pointerdown', ev => {
          const t = tAt(ev);
          canvas.setPointerCapture(ev.pointerId);
          const near = x => P.a !== null && Math.abs(x - t) * pxPerSec() < 12;
          if (near(P.a)) drag = { kind: 'a', x0: ev.clientX };
          else if (near(P.b)) drag = { kind: 'b', x0: ev.clientX };
          else drag = { kind: 'new', t0: t, x0: ev.clientX, moved: false };
        });
        canvas.addEventListener('pointermove', ev => {
          if (!drag) return;
          const t = snapT(tAt(ev), ev.shiftKey);
          if (drag.kind === 'a') { P.a = clamp(t, 0, P.b - 0.05); drawStatic(); }
          else if (drag.kind === 'b') { P.b = clamp(t, P.a + 0.05, P.dur); drawStatic(); }
          else if (drag.moved || Math.abs(ev.clientX - drag.x0) > 6) { drag.moved = true; const t0 = snapT(drag.t0, ev.shiftKey); P.a = Math.min(t0, t); P.b = Math.max(t0, t); drawStatic(); }
        });
        const up = ev => {
          if (!drag) return;
          const d = drag; drag = null;
          if (d.kind === 'new' && !d.moved) { seek(tAt(ev)); return; }
          if (P.a !== null && P.b - P.a < 0.05) { P.a = P.b = null; P.loopOn = false; }
          else if (d.kind === 'new') { P.loopOn = true; P.reps = 0; }
          persist(); refreshTransport(); drawStatic();
          if (P.loopOn) { if (P.playing) play(P.a); else P.pausePos = P.a; }
        };
        canvas.addEventListener('pointerup', up);
        canvas.addEventListener('pointercancel', () => { drag = null; });
      }
      function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888'; }
      function drawStatic() {
        if (!canvas || !P.peaks) return;
        const W = canvas.width, H = canvas.height;
        if (!waveCache) waveCache = document.createElement('canvas');
        waveCache.width = W; waveCache.height = H;
        const c = waveCache.getContext('2d');
        c.clearRect(0, 0, W, H);
        c.fillStyle = cssVar('--sunk'); c.fillRect(0, 0, W, H);
        const [v0, v1] = P.view, span = v1 - v0;
        const { blk, mn, mx } = P.peaks;
        const bps = P.sr / blk;
        const mid = H / 2;
        // loop selection
        if (P.a !== null) {
          const xa = (P.a - v0) / span * W, xb = (P.b - v0) / span * W;
          c.fillStyle = cssVar('--brass-soft'); c.fillRect(xa, 0, xb - xa, H);
        }
        // sections markers
        (P.setup.sections || []).forEach(sc => {
          const xa = (sc.a - v0) / span * W;
          if (xa < 0 || xa > W) return;
          c.fillStyle = cssVar('--patina'); c.globalAlpha = 0.5; c.fillRect(xa, 0, Math.max(1, (window.devicePixelRatio || 1)), H); c.globalAlpha = 1;
        });
        const dpr = window.devicePixelRatio || 1;
        const grid = gridOn() && P.grid.show ? gridMarks(v0, v1, W) : null;
        if (grid) { // bar lines under the waveform
          c.fillStyle = cssVar('--ink'); c.globalAlpha = 0.24;
          grid.bars.forEach(g => c.fillRect(Math.round(g.x), 0, Math.max(1, dpr), H));
          c.globalAlpha = 1;
        }
        c.fillStyle = cssVar('--patina');
        for (let x = 0; x < W; x++) {
          const t0 = v0 + x / W * span, t1 = v0 + (x + 1) / W * span;
          let b0 = Math.floor(t0 * bps), b1 = Math.max(b0 + 1, Math.floor(t1 * bps));
          b0 = clamp(b0, 0, mn.length - 1); b1 = clamp(b1, 1, mn.length);
          let lo = 1, hi = -1;
          for (let k = b0; k < b1; k++) { if (mn[k] < lo) lo = mn[k]; if (mx[k] > hi) hi = mx[k]; }
          if (hi < lo) continue;
          const y0 = mid - hi * mid * 0.95, y1 = mid - lo * mid * 0.95;
          c.fillRect(x, y0, 1, Math.max(1, y1 - y0));
        }
        if (grid) { // beat ticks and bar numbers over it
          const th = 7 * dpr, lw = Math.max(1, dpr);
          c.fillStyle = cssVar('--muted');
          grid.beats.forEach(x => { c.fillRect(Math.round(x), 0, lw, th); c.fillRect(Math.round(x), H - th, lw, th); });
          grid.bars.forEach(g => { c.fillRect(Math.round(g.x), 0, lw * 2, th * 1.4); c.fillRect(Math.round(g.x), H - th * 1.4, lw * 2, th * 1.4); });
          if (grid.labels) {
            c.font = Math.round(10 * dpr) + 'px IBM Plex Mono, monospace';
            grid.bars.forEach(g => { if (g.n >= 1) c.fillText(String(g.n), g.x + 4 * dpr, H - 4 * dpr); });
          }
        }
        if (P.a !== null) {
          c.fillStyle = cssVar('--brass');
          const lw = Math.max(2, (window.devicePixelRatio || 1) * 2);
          [P.a, P.b].forEach(t => { const x = (t - v0) / span * W; c.fillRect(x - lw / 2, 0, lw, H); });
          c.font = Math.round(11 * (window.devicePixelRatio || 1)) + 'px ' + 'IBM Plex Mono, monospace';
          c.fillText('A', (P.a - v0) / span * W + 4, 14 * (window.devicePixelRatio || 1));
          c.fillText('B', (P.b - v0) / span * W - 12 * (window.devicePixelRatio || 1), 14 * (window.devicePixelRatio || 1));
        }
        drawFrame();
      }
      /* beat ticks and bar lines in view (x in canvas pixels); thinned out when too dense to read */
      function gridMarks(v0, v1, W) {
        const dpr = window.devicePixelRatio || 1, beat = 60 / P.bpm, bpb = P.grid.bpb, off = P.grid.offset, span = v1 - v0;
        const pxBeat = beat / span * W;
        const out = { bars: [], beats: [], labels: pxBeat * bpb >= 24 * dpr };
        if (pxBeat * bpb < 4 * dpr) return out;
        const showBeats = pxBeat >= 6 * dpr, step = showBeats ? 1 : bpb;
        const k0 = Math.ceil((v0 - off) / beat), k1 = Math.floor((v1 - off) / beat);
        for (let k = showBeats ? k0 : Math.ceil(k0 / bpb) * bpb; k <= k1; k += step) {
          const x = (off + k * beat - v0) / span * W;
          if (((k % bpb) + bpb) % bpb === 0) out.bars.push({ x, n: k / bpb + 1 }); else out.beats.push(x);
        }
        return out;
      }
      function drawFrame() {
        if (!canvas || !waveCache) return;
        const W = canvas.width, H = canvas.height;
        wctx.clearRect(0, 0, W, H);
        wctx.drawImage(waveCache, 0, 0);
        const t = curPos(), [v0, v1] = P.view;
        const x = (t - v0) / (v1 - v0) * W;
        if (x >= 0 && x <= W) { wctx.fillStyle = cssVar('--ink'); wctx.fillRect(x - 1, 0, Math.max(2, window.devicePixelRatio || 1), H); }
      }
      function refreshTransport() {
        syncPlayState();
        if (!playBtn) return;
        playBtn.textContent = P.playing ? '❚❚ Pause' : '▶ Play';
        loopBtn.setAttribute('aria-pressed', String(P.loopOn));
        loopBtn.textContent = P.loopOn ? 'Loop on' : 'Loop';
        loopLbl.textContent = P.a !== null ? 'A ' + fmt(P.a) + ' · B ' + fmt(P.b) + ' · ' + (P.b - P.a).toFixed(1) + ' s' : 'No loop';
        timeLbl.textContent = fmt(curPos()) + ' / ' + fmt(P.dur);
      }
      function loopTick() {
        cancelAnimationFrame(P.raf);
        const tick = () => {
          if (!P.alive) return;
          if (P.playing && timeLbl) {
            const t = curPos();
            timeLbl.textContent = fmt(t) + ' / ' + fmt(P.dur);
            // keep the playhead in view when zoomed in
            const span = P.view[1] - P.view[0];
            if (span < P.dur - 0.01 && (t > P.view[1] || t < P.view[0])) { const a = clamp(t - span * 0.1, 0, P.dur - span); P.view = [a, a + span]; drawStatic(); }
            if (vid && !vid.paused && Math.abs(vid.currentTime - t) > 0.25) { try { vid.currentTime = t; } catch (e) { /* ignore */ } }
          }
          drawFrame();
          noteTick();
          P.raf = requestAnimationFrame(tick);
        };
        P.raf = requestAnimationFrame(tick);
      }

      /* ----- keyboard ----- */
      function onKey(ev) {
        if (!P.buffer || !playBtn) return;
        const tg = ev.target && ev.target.tagName;
        if (tg === 'INPUT' || tg === 'TEXTAREA' || tg === 'SELECT') return;
        if (ev.code === 'Space') { ev.preventDefault(); P.playing ? stop() : play(); }
        else if (ev.key === '[' || ev.key === '{') markA(ev.shiftKey);
        else if (ev.key === ']' || ev.key === '}') markB(ev.shiftKey, true);
        else if (ev.key === 'l' || ev.key === 'L') { if (P.a !== null) { P.loopOn = !P.loopOn; persist(); refreshTransport(); restartIfPlaying(); } }
        else if (ev.key === 'ArrowLeft') { ev.preventDefault(); seek(curPos() - 2); }
        else if (ev.key === 'ArrowRight') { ev.preventDefault(); seek(curPos() + 2); }
      }
      document.addEventListener('keydown', onKey);
      const cleanups = [() => document.removeEventListener('keydown', onKey)];

      /* ----- lock-screen / headset controls (Media Session) and keeping the screen on while it plays ----- */
      const MS = navigator.mediaSession || null;
      let wakeLock = null, wakeBusy = false, lastPlay = null;
      async function wake(on) {
        if (!navigator.wakeLock) return;
        if (!on) { if (wakeLock) { const wl = wakeLock; wakeLock = null; wl.release().catch(() => {}); } return; }
        if (wakeLock || wakeBusy || document.visibilityState !== 'visible') return;
        wakeBusy = true;
        try {
          const wl = await navigator.wakeLock.request('screen');
          if (!P.alive || !P.wantPlay) wl.release().catch(() => {});
          else { wakeLock = wl; wl.addEventListener('release', () => { if (wakeLock === wl) wakeLock = null; }); }
        } catch (e) { /* not allowed right now (battery saver, hidden page) */ }
        wakeBusy = false;
      }
      function msPosition() {
        if (!MS || typeof MS.setPositionState !== 'function' || !(P.dur > 0)) return;
        try { MS.setPositionState({ duration: P.dur, playbackRate: P.speed, position: clamp(curPos(), 0, P.dur) }); } catch (e) { /* ignore */ }
      }
      function syncPlayState() {
        const on = !!P.wantPlay;
        if (on !== lastPlay) {
          lastPlay = on; wake(on);
          if (MS) { try { MS.playbackState = on ? 'playing' : 'paused'; } catch (e) { /* ignore */ } }
        }
        msPosition();
      }
      const MS_ACTIONS = ['play', 'pause', 'stop', 'seekbackward', 'seekforward', 'seekto', 'previoustrack'];
      function msSetup() {
        if (!MS || !P.setup) return;
        try {
          if (typeof MediaMetadata === 'function') MS.metadata = new MediaMetadata({ title: P.setup.title || P.setup.fileName || 'Transcribe', artist: P.setup.fileName || '', album: 'World Woodshed · Transcribe' });
        } catch (e) { /* ignore */ }
        const handlers = {
          play: () => { if (!P.wantPlay && P.buffer) play(); },
          pause: () => { if (P.wantPlay) stop(); },
          stop: () => stop(),
          seekbackward: d => seek(curPos() - ((d && d.seekOffset) || 5)),
          seekforward: d => seek(curPos() + ((d && d.seekOffset) || 5)),
          seekto: d => { if (d && isFinite(d.seekTime)) seek(d.seekTime); },
          previoustrack: () => { P.reps = 0; seek(P.a !== null ? P.a : 0); } // back to the start of the loop
        };
        MS_ACTIONS.forEach(a => { try { MS.setActionHandler(a, handlers[a]); } catch (e) { /* action not supported here */ } });
      }
      function msClear() {
        if (!MS) return;
        MS_ACTIONS.forEach(a => { try { MS.setActionHandler(a, null); } catch (e) { /* ignore */ } });
        try { MS.metadata = null; MS.playbackState = 'none'; } catch (e) { /* ignore */ }
      }
      const onVis = () => { if (document.visibilityState === 'visible' && P.wantPlay) wake(true); };
      document.addEventListener('visibilitychange', onVis);
      cleanups.push(() => { document.removeEventListener('visibilitychange', onVis); P.wantPlay = false; wake(false); msClear(); });

      /* ----- start ----- */
      (async () => {
        const p = ctx.params || {};
        if (p.file) { loadFile(p.file, null); return; }
        if (p.song) {
          const st = E.getSong(p.song);
          if (!st) { loaderCard(null); return; }
          const rec = await IDB.get(st.id);
          if (!P.alive) return;
          if (rec && rec.blob) { const f = rec.blob instanceof File ? rec.blob : new File([rec.blob], rec.name || st.fileName || 'audio', { type: rec.type || '' }); loadFile(f, st); }
          else { P.setup = st; loaderCard(st); }
          return;
        }
        loaderCard(null);
      })();

      return () => {
        P.alive = false; P.anToken++;
        persist(true);
        clearTimeout(saveTimer);
        stopSource();
        if (vid) { vid.pause(); vid = null; }
        if (P.videoUrl) URL.revokeObjectURL(P.videoUrl);
        cancelAnimationFrame(P.raf);
        cleanups.forEach(fn => fn());
      };
    }
  }));

  /* ======================================================
     Transcribe tab: song library
     ====================================================== */
  // the tab and its icon are registered at boot by transcribe-lazy.js
  UI.PAGES.transcribe = function () {
    const view = document.getElementById('view');
    view.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Transcribe' }), h('h1', { text: 'Learn songs from recordings' }),
      h('p', { class: 'muted', text: 'Slow down without changing pitch, loop the hard bars, focus on the bass or the melody, and keep every song\'s loops, sections and notes ready for next time.' })));
    const fi = h('input', { type: 'file', accept: 'audio/*,video/*,.mp3,.m4a,.wav,.aac,.ogg,.flac,.mp4,.mov,.webm', id: 'lib-file', hidden: true });
    fi.addEventListener('change', () => { const f = fi.files && fi.files[0]; if (f) UI.openTool('transcribe', { params: { file: f }, returnTab: 'transcribe' }); });
    view.append(fi, h('div', { class: 'card' }, h('div', { class: 'row' }, h('button', { class: 'btn brass', onclick: () => fi.click() }, 'Open an audio or video file')),
      h('p', { class: 'small muted', text: 'The app can\'t download from YouTube or other sites. Load a file you have; you can save the YouTube link with the song.' })));
    const songs = E.listSongs();
    const lib = h('div', { class: 'section' }, h('h2', { text: 'Your songs' }));
    if (!songs.length) lib.append(h('p', { class: 'muted small', text: 'Songs you open are saved here with their loops, sections, speed, focus and notes. The setups sync to your account; the audio itself stays on the device where you loaded it.' }));
    const list = h('div', { class: 'tools' });
    songs.forEach(sg => {
      const est = sg.est || {};
      const meta = [(sg.sections && sg.sections.length ? sg.sections.length + (sg.sections.length === 1 ? ' section' : ' sections') : 'no sections'), Math.round((sg.speed || 1) * 100) + '% speed',
        est.key ? keyName(est.key) : '', sg.bpm ? Math.round(sg.bpm) + ' bpm' : '', sg.lastOpened ? 'opened ' + new Date(sg.lastOpened).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''].filter(Boolean).join(' · ');
      const row = h('div', { class: 'songrow' });
      row.append(h('button', { class: 'tile', onclick: () => UI.openTool('transcribe', { params: { song: sg.id }, returnTab: 'transcribe' }) },
        h('span', { class: 't-title', text: sg.title || 'Untitled' }), h('span', { class: 't-desc', text: meta }), h('span', { class: 't-meter', text: fmt(sg.duration || 0) })),
        h('button', { class: 'btn small ghost', 'aria-label': 'Delete ' + (sg.title || 'song'), onclick: () => {
          if (row.querySelector('.confirm')) return;
          const c = h('div', { class: 'confirm' }, h('span', { class: 'small', text: 'Delete "' + (sg.title || 'Untitled') + '" and its loops, sections and notes?' }),
            h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => c.remove() }, 'Keep it'),
              h('button', { class: 'btn small', style: { borderColor: 'var(--bad)', color: 'var(--bad)' }, onclick: () => { E.deleteSong(sg.id); IDB.del(sg.id); row.remove(); toast('Song deleted'); } }, 'Delete')));
          row.append(c);
        } }, 'Delete'));
      list.append(row);
    });
    lib.append(list);
    view.append(lib);
  };
}
