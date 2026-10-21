/* World Woodshed — time-stretch and pitch-shift.
   A phase vocoder with identity phase locking (Laroche & Dolson), phase resets on
   transients so attacks stay sharp, and one shared phase rotation for every channel
   so the stereo image (and the centre-cancel focus modes) survive. Pitch shifting
   stretches, then resamples with a windowed-sinc filter.
   Imported by the page (fallback) and by stretch.worker.js. */

const TAU = 2 * Math.PI;

/* ---------- radix-2 complex FFT, in place ---------- */
const fftCache = new Map();
function fftTables(N) {
  let t = fftCache.get(N);
  if (t) return t;
  const bits = Math.log2(N) | 0;
  const rev = new Uint32Array(N);
  for (let i = 0; i < N; i++) {
    let r = 0;
    for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b);
    rev[i] = r;
  }
  // twiddles stored stage by stage so the inner loop reads them in order
  const wr = new Float64Array(N), wi = new Float64Array(N);
  for (let size = 2, o = 0; size <= N; size <<= 1) {
    const half = size >> 1;
    for (let k = 0; k < half; k++) { wr[o + k] = Math.cos(TAU * k / size); wi[o + k] = -Math.sin(TAU * k / size); }
    o += half;
  }
  t = { N, rev, wr, wi };
  fftCache.set(N, t);
  return t;
}
// inverse = true computes the unscaled inverse transform
function fft(re, im, T, inverse) {
  const N = T.N, rev = T.rev, WR = T.wr, WI = T.wi;
  for (let i = 0; i < N; i++) {
    const j = rev[i];
    if (j > i) { let x = re[i]; re[i] = re[j]; re[j] = x; x = im[i]; im[i] = im[j]; im[j] = x; }
  }
  // first stage: size 2, twiddle 1
  for (let a = 0; a < N; a += 2) {
    const xr = re[a + 1], xi = im[a + 1];
    re[a + 1] = re[a] - xr; im[a + 1] = im[a] - xi; re[a] += xr; im[a] += xi;
  }
  const sgn = inverse ? -1 : 1;
  for (let size = 4, o = 1; size <= N; size <<= 1) {
    const half = size >> 1;
    for (let start = 0; start < N; start += size) {
      for (let k = 0; k < half; k++) {
        const wr = WR[o + k], wi = sgn * WI[o + k];
        const a = start + k, b = a + half;
        const br = re[b], bi = im[b];
        const xr = br * wr - bi * wi, xi = br * wi + bi * wr;
        re[b] = re[a] - xr; im[b] = im[a] - xi;
        re[a] += xr; im[a] += xi;
      }
    }
    o += half;
  }
}

function hann(n) {
  const w = new Float64Array(n);
  for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos(TAU * i / n); // periodic: overlap-adds flat
  return w;
}
const princarg = x => x - TAU * Math.round(x / TAU);

/* ---------- onset detection on the input (fixed resolution, independent of speed) ----------
   Returns sorted sample positions of percussive onsets: frames where a large share of
   bins jump by more than 3 dB, kept only at local maxima of that share. */
function findOnsets(chs, sr) {
  const inLen = chs[0].length;
  const N = sr > 64000 ? 2048 : sr > 32000 ? 1024 : 512, H = N / 2;
  const T = fftTables(N), w = hann(N);
  const re = new Float64Array(N), im = new Float64Array(N);
  const half = N / 2;
  let mono = chs[0];
  if (chs.length > 1) { mono = new Float32Array(inLen); for (const x of chs) for (let i = 0; i < inLen; i++) mono[i] += x[i]; }
  let prev = new Float64Array(half + 1), cur = new Float64Array(half + 1);
  const feat = [], pos = [];
  const lo = Math.max(1, Math.round(150 * N / sr));
  for (let c = 0; c - half < inLen; c += H) {
    for (let i = 0; i < N; i++) {
      const j = c - half + i;
      re[i] = j >= 0 && j < inLen ? mono[j] * w[i] : 0; im[i] = 0;
    }
    fft(re, im, T, false);
    let count = 0, total = 0;
    for (let k = lo; k <= half; k++) {
      const e = re[k] * re[k] + im[k] * im[k];
      cur[k] = e;
      if (e > 1e-6) { total++; if (e > 2 * prev[k]) count++; }
    }
    feat.push(total > 8 ? count / (half + 1 - lo) : 0);
    pos.push(c);
    const t = prev; prev = cur; cur = t;
  }
  const onsets = [];
  const gap = Math.round(sr * 0.05);
  for (let i = 1; i < feat.length - 1; i++) {
    const f = feat[i];
    if (f > 0.3 && f > feat[i - 1] && f >= feat[i + 1] && (!onsets.length || pos[i] - onsets[onsets.length - 1] > gap)) onsets.push(pos[i]);
  }
  return onsets;
}

/* ---------- phase vocoder: output length = input length / tempo (tempo < 1 slows down) ---------- */
function vocoder(chs, sr, tempo, onProgress, pStart, pSpan) {
  const inLen = chs[0].length, nCh = chs.length;
  const outLen = Math.max(1, Math.round(inLen / tempo));
  // ~93 ms frames: long enough for clean tones when slowed down a lot
  const N = sr > 64000 ? 8192 : sr > 32000 ? 4096 : 2048;
  const half = N / 2, Hs = N / 4;
  const T = fftTables(N), win = hann(N);
  const onsets = findOnsets(chs, sr);
  const resetFrom = Math.max(1, Math.round(150 * N / sr)); // keep bass phase continuous through resets

  // channels are processed in pairs packed as real + imaginary of one complex FFT
  const pairs = [];
  for (let c = 0; c < nCh; c += 2) pairs.push([chs[c], c + 1 < nCh ? chs[c + 1] : null]);
  const out = [];
  for (let c = 0; c < nCh; c++) out.push(new Float64Array(outLen + N));
  const norm = new Float64Array(outLen + N);

  const re = pairs.map(() => new Float64Array(N)), im = pairs.map(() => new Float64Array(N));
  const mr = new Float64Array(half + 1), mi = new Float64Array(half + 1); // guide (sum of channels) spectrum
  const pr = new Float64Array(half + 1), pi = new Float64Array(half + 1); // previous guide spectrum
  const mag = new Float64Array(half + 1);
  let delta = new Float64Array(half + 1), prevDelta = new Float64Array(half + 1);
  const peaks = new Int32Array(half + 1);
  const cosD = new Float64Array(half + 1), sinD = new Float64Array(half + 1);

  const frames = Math.ceil((outLen + half) / Hs);
  let prevA = 0, onsetIdx = 0;
  for (let m = 0; m < frames; m++) {
    const a = Math.round(m * Hs * tempo); // analysis centre in the input
    // window and pack each pair
    for (let p = 0; p < pairs.length; p++) {
      const [x0, x1] = pairs[p], r = re[p], q = im[p];
      for (let i = 0; i < N; i++) {
        const j = a - half + i;
        if (j >= 0 && j < inLen) { r[i] = x0[j] * win[i]; q[i] = x1 ? x1[j] * win[i] : 0; }
        else { r[i] = 0; q[i] = 0; }
      }
      fft(r, q, T, false);
    }
    // guide spectrum = sum of all channels (unpack each pair's two spectra)
    let maxMag = 0;
    for (let k = 0; k <= half; k++) {
      const nk = (N - k) & (N - 1);
      let sr0 = 0, si0 = 0;
      for (let p = 0; p < pairs.length; p++) {
        const r = re[p], q = im[p];
        // X0 = (Z[k] + conj Z[N-k]) / 2, X1 = (Z[k] - conj Z[N-k]) / 2i
        sr0 += (r[k] + r[nk]) * 0.5; si0 += (q[k] - q[nk]) * 0.5;
        if (pairs[p][1]) { sr0 += (q[k] + q[nk]) * 0.5; si0 -= (r[k] - r[nk]) * 0.5; }
      }
      mr[k] = sr0; mi[k] = si0;
      const e = sr0 * sr0 + si0 * si0;
      mag[k] = e; if (e > maxMag) maxMag = e;
    }

    let reset = false;
    const hopA = a - prevA;
    while (onsetIdx < onsets.length && onsets[onsetIdx] <= a) { if (m > 0 && onsets[onsetIdx] > prevA) reset = true; onsetIdx++; }

    if (m === 0 || hopA <= 0) {
      delta.fill(0); cosD.fill(1); sinD.fill(0);
    } else {
      // peaks of the guide spectrum
      let np = 0;
      const floor = maxMag * 1e-8;
      for (let k = 2; k < half - 1; k++) {
        const e = mag[k];
        if (e > floor && e > mag[k - 1] && e >= mag[k + 1] && e > mag[k - 2] && e >= mag[k + 2]) peaks[np++] = k;
      }
      if (!np) {
        delta.set(prevDelta);
        for (let k = 0; k <= half; k++) { cosD[k] = Math.cos(delta[k]); sinD[k] = Math.sin(delta[k]); }
      } else {
        const ratio = Hs / hopA - 1;
        // each peak: advance its phase at its true frequency; the bins around it rotate with it
        let lo = 0;
        for (let j = 0; j < np; j++) {
          const k = peaks[j];
          let d;
          if (reset && k >= resetFrom) d = 0;
          else {
            const omega = TAU * k / N;
            // angle of M[k] * conj(Mprev[k]) = phase advance since the previous analysis frame
            const adv = Math.atan2(mi[k] * pr[k] - mr[k] * pi[k], mr[k] * pr[k] + mi[k] * pi[k]);
            const dev = princarg(adv - omega * hopA);
            d = prevDelta[k] + (omega * hopA + dev) * ratio;
            d = princarg(d);
          }
          // region boundary: lowest bin between this peak and the next
          let hi = half;
          if (j + 1 < np) {
            const k2 = peaks[j + 1];
            let mn = k, mv = Infinity;
            for (let b = k; b <= k2; b++) if (mag[b] < mv) { mv = mag[b]; mn = b; }
            hi = mn;
          }
          const c = Math.cos(d), sn = Math.sin(d);
          for (let b = lo; b <= hi; b++) { delta[b] = d; cosD[b] = c; sinD[b] = sn; }
          lo = hi + 1;
        }
      }
    }
    // DC and Nyquist must stay real
    delta[0] = 0; cosD[0] = 1; sinD[0] = 0; delta[half] = 0; cosD[half] = 1; sinD[half] = 0;

    // rotate every channel by the same delta and resynthesise
    const o0 = m * Hs; // output frame start (frame centre at m*Hs - half + half)
    for (let p = 0; p < pairs.length; p++) {
      const r = re[p], q = im[p];
      const stereo = !!pairs[p][1];
      // unpack, rotate, repack in place: work on k and N-k together
      for (let k = 0; k <= half; k++) {
        const nk = (N - k) & (N - 1);
        const ar = (r[k] + r[nk]) * 0.5, ai = (q[k] - q[nk]) * 0.5;      // X0[k]
        const br = (q[k] + q[nk]) * 0.5, bi = -(r[k] - r[nk]) * 0.5;     // X1[k]
        const c = cosD[k], s = sinD[k];
        const yr0 = ar * c - ai * s, yi0 = ar * s + ai * c;
        const yr1 = stereo ? br * c - bi * s : 0, yi1 = stereo ? br * s + bi * c : 0;
        // Z[k] = Y0[k] + i Y1[k]; Z[N-k] = conj(Y0[k]) + i conj(Y1[k])
        r[k] = yr0 - yi1; q[k] = yi0 + yr1;
        if (nk !== k) { r[nk] = yr0 + yi1; q[nk] = -yi0 + yr1; }
      }
      fft(r, q, T, true);
      const y0 = out[p * 2], y1 = stereo ? out[p * 2 + 1] : null;
      for (let i = 0; i < N; i++) {
        const w = win[i] / N;
        y0[o0 + i] += r[i] * w;
        if (y1) y1[o0 + i] += q[i] * w;
      }
    }
    for (let i = 0; i < N; i++) norm[o0 + i] += win[i] * win[i];

    pr.set(mr); pi.set(mi);
    const t = prevDelta; prevDelta = delta; delta = t;
    prevA = a;
    if (onProgress && m % 64 === 0) onProgress(pStart + pSpan * (m / frames));
  }
  // frame m is centred at output sample m*Hs, stored at m*Hs + half
  return out.map(o => {
    const y = new Float32Array(outLen);
    for (let i = 0; i < outLen; i++) { const g = norm[i + half]; y[i] = g > 1e-3 ? o[i + half] / g : 0; }
    return y;
  });
}

/* ---------- windowed-sinc resampler: plays input `ratio` times faster ---------- */
const ZC = 10, OS = 512; // zero crossings per side, table oversampling
let sincTable = null;
function sincTab() {
  if (sincTable) return sincTable;
  const n = ZC * OS + 2;
  sincTable = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const x = i / OS;
    const s = x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
    // Blackman window over [-ZC, ZC]
    const u = 0.5 + 0.5 * Math.min(1, x / ZC);
    const w = x >= ZC ? 0 : 0.42 - 0.5 * Math.cos(TAU * u) + 0.08 * Math.cos(2 * TAU * u);
    sincTable[i] = s * w;
  }
  return sincTable;
}
function resample(chs, ratio, outLen) {
  const inLen = chs[0].length;
  outLen = outLen || Math.max(1, Math.floor(inLen / ratio));
  const tab = sincTab();
  const fc = Math.min(1, 1 / ratio) * 0.97; // cutoff below the new Nyquist when shifting up
  const reach = Math.ceil(ZC / fc);
  return chs.map(x => {
    const y = new Float32Array(outLen);
    for (let j = 0; j < outLen; j++) {
      const t = j * ratio, i0 = Math.floor(t);
      let acc = 0;
      const from = Math.max(0, i0 - reach + 1), to = Math.min(inLen - 1, i0 + reach);
      for (let i = from; i <= to; i++) {
        const pos = Math.abs(t - i) * fc * OS;
        const k = pos | 0;
        if (k >= ZC * OS) continue;
        const f = pos - k;
        acc += x[i] * (tab[k] + (tab[k + 1] - tab[k]) * f);
      }
      y[j] = acc * fc;
    }
    return y;
  });
}

/* speed: 0.25–2 (1 = original tempo). semitones: pitch shift.
   The output is always round(input length / speed) samples long. */
function process(chs, sr, speed, semitones, onProgress) {
  const r = Math.pow(2, (semitones || 0) / 12);
  const tempo = speed / r;
  const finalLen = Math.max(1, Math.round(chs[0].length / speed));
  let out = chs;
  const shift = Math.abs(r - 1) > 1e-4;
  if (Math.abs(tempo - 1) > 1e-4) out = vocoder(out, sr, tempo, onProgress, 0, shift ? 0.8 : 1);
  if (shift) { if (onProgress) onProgress(0.82); out = resample(out, r, finalLen); }
  if (onProgress) onProgress(1);
  return out;
}

export default { process, vocoder, resample, findOnsets };
