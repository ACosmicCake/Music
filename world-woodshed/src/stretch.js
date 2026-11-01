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
   Percussive onsets: frames where a large share of bins jump by more than 3 dB, kept only at
   local maxima of that share. Incremental, so a stream can start before the whole input is read:
   advance(upTo) makes sure every onset at or before sample upTo is in `list`. */
function onsetTracker(src, sr) {
  const chs = src.chs, inLen = src.length, nCh = chs.length;
  const N = sr > 64000 ? 2048 : sr > 32000 ? 1024 : 512, H = N / 2, half = N / 2;
  const T = fftTables(N), w = hann(N);
  const re = new Float64Array(N), im = new Float64Array(N);
  const lo = Math.max(1, Math.round(150 * N / sr)), gap = Math.round(sr * 0.05);
  let prev = new Float64Array(half + 1), cur = new Float64Array(half + 1);
  const list = [];
  let c = 0, i = 0, fA = 0, fB = 0, pB = 0;
  function frame() {
    src.ensure(c + half);
    for (let k = 0; k < N; k++) {
      const j = c - half + k;
      let v = 0;
      if (j >= 0 && j < inLen) for (let ch = 0; ch < nCh; ch++) v += chs[ch][j];
      re[k] = v * w[k]; im[k] = 0;
    }
    fft(re, im, T, false);
    let count = 0, total = 0;
    for (let k = lo; k <= half; k++) {
      const e = re[k] * re[k] + im[k] * im[k];
      cur[k] = e;
      if (e > 1e-6) { total++; if (e > 2 * prev[k]) count++; }
    }
    const fC = total > 8 ? count / (half + 1 - lo) : 0;
    // frame i-1 is a peak if it beats both neighbours (frame 0 never counts)
    if (i >= 2 && fB > 0.3 && fB > fA && fB >= fC && (!list.length || pB - list[list.length - 1] > gap)) list.push(pB);
    fA = fB; fB = fC; pB = c;
    const t = prev; prev = cur; cur = t;
    c += H; i++;
  }
  return {
    list,
    advance(upTo) { while (c - half < inLen && c <= upTo + H) frame(); }
  };
}
function findOnsets(chs, sr) {
  const tr = onsetTracker({ chs, length: chs[0].length, ensure() {} }, sr);
  tr.advance(Infinity);
  return tr.list;
}

/* ---------- phase vocoder, streamed ----------
   Reads src ({ chs, length, ensure(j) }: ensure makes samples before j readable) and yields the output
   in order, `first` samples and then `block` at a time, as arrays of Float32Array (one per channel).
   outLen samples in all; tempo < 1 slows down. Between blocks it yields null every few frames, so a
   caller on the main thread can stop for breath. */
function* vocoderStream(src, sr, tempo, outLen, first, block) {
  const chs = src.chs, inLen = src.length, nCh = chs.length;
  // ~93 ms frames: long enough for clean tones when slowed down a lot
  const N = sr > 64000 ? 8192 : sr > 32000 ? 4096 : 2048;
  const half = N / 2, Hs = N / 4;
  const T = fftTables(N), win = hann(N);
  const onsets = onsetTracker(src, sr);
  const resetFrom = Math.max(1, Math.round(150 * N / sr)); // keep bass phase continuous through resets

  // channels are processed in pairs packed as real + imaginary of one complex FFT
  const pairs = [];
  for (let c = 0; c < nCh; c += 2) pairs.push([chs[c], c + 1 < nCh ? chs[c + 1] : null]);
  // overlap-add accumulators, a sliding window over the output: acc[i] is padded output sample base + i
  const size = Math.max(first, block) + 2 * N;
  const acc = [];
  for (let c = 0; c < nCh; c++) acc.push(new Float64Array(size));
  const norm = new Float64Array(size);
  let base = 0, emitted = 0;

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
    src.ensure(a + half);
    onsets.advance(a);
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
    const hopA = a - prevA, ol = onsets.list;
    while (onsetIdx < ol.length && ol[onsetIdx] <= a) { if (m > 0 && ol[onsetIdx] > prevA) reset = true; onsetIdx++; }

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
    const o0 = m * Hs - base; // frame m covers padded output samples m*Hs .. m*Hs + N
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
      const y0 = acc[p * 2], y1 = stereo ? acc[p * 2 + 1] : null;
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

    // padded samples before (m+1)*Hs get nothing more; output sample i is padded sample i + half
    const ready = Math.min(outLen, (m + 1) * Hs - half);
    if (ready - emitted >= (emitted ? block : first) || (m === frames - 1 && ready > emitted)) {
      const n = ready - emitted, off = emitted + half - base;
      const outs = acc.map(o => {
        const y = new Float32Array(n);
        for (let i = 0; i < n; i++) { const g = norm[off + i]; y[i] = g > 1e-3 ? o[off + i] / g : 0; }
        return y;
      });
      // slide the window past what was handed out
      const sh = off + n;
      for (const o of acc) { o.copyWithin(0, sh); o.fill(0, size - sh); }
      norm.copyWithin(0, sh); norm.fill(0, size - sh);
      base += sh; emitted = ready;
      yield outs;
    } else if ((m & 7) === 7) yield null;
  }
  if (emitted < outLen) yield chs.map(() => new Float32Array(outLen - emitted));
}

/* the whole output at once, from vocoderStream */
function vocoder(chs, sr, tempo) {
  const inLen = chs[0].length, outLen = Math.max(1, Math.round(inLen / tempo));
  return collect(vocoderStream({ chs, length: inLen, ensure() {} }, sr, tempo, outLen, 1 << 16, 1 << 16), chs.length, outLen);
}
function collect(gen, nCh, len, onProgress) {
  const out = Array.from({ length: nCh }, () => new Float32Array(len));
  let at = 0;
  for (const b of gen) {
    if (!b) continue;
    const n = Math.min(b[0].length, len - at);
    b.forEach((y, c) => out[c].set(n < y.length ? y.subarray(0, n) : y, at));
    at += n;
    if (onProgress) onProgress(at / len);
  }
  return out;
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
/* y[j - yOff] for j0 <= j < j1: the input x played `ratio` times faster. x holds input samples from
   xBase on; inLen is the input's whole length (so the ends are treated as silence, not as missing) */
function resampleRange(x, y, ratio, j0, j1, xBase = 0, inLen = x.length + xBase, yOff = 0) {
  const tab = sincTab();
  const fc = Math.min(1, 1 / ratio) * 0.97; // cutoff below the new Nyquist when shifting up
  const reach = Math.ceil(ZC / fc);
  for (let j = j0; j < j1; j++) {
    const t = j * ratio, i0 = Math.floor(t);
    let acc = 0;
    const from = Math.max(0, i0 - reach + 1), to = Math.min(inLen - 1, i0 + reach);
    for (let i = from; i <= to; i++) {
      const pos = Math.abs(t - i) * fc * OS;
      const k = pos | 0;
      if (k >= ZC * OS) continue;
      const f = pos - k;
      acc += x[i - xBase] * (tab[k] + (tab[k + 1] - tab[k]) * f);
    }
    y[j - yOff] = acc * fc;
  }
}
const reachFor = ratio => Math.ceil(ZC / (Math.min(1, 1 / ratio) * 0.97));
/* resamples a stream of blocks (as vocoderStream yields them, inLen samples in all) as it arrives */
function* resampleStream(gen, ratio, inLen, outLen, first, block) {
  const reach = reachFor(ratio);
  let buf = null, xBase = 0, have = 0, j = 0;
  const flush = all => {
    // outputs whose window lies inside what has arrived (or everything, at the end)
    let j1 = all ? outLen : Math.min(outLen, Math.floor((have - reach - 1) / ratio));
    if (!all && j1 - j < (j ? block : first)) return null;
    if (j1 <= j) return null;
    const outs = buf.map(x => { const y = new Float32Array(j1 - j); resampleRange(x, y, ratio, j, j1, xBase, inLen, j); return y; });
    j = j1;
    // keep only the input the next outputs can still reach
    const keep = Math.max(xBase, Math.floor(j * ratio) - reach - 1);
    if (keep > xBase) { buf = buf.map(x => x.slice(keep - xBase)); xBase = keep; }
    return outs;
  };
  for (const b of gen) {
    if (!b) { yield null; continue; }
    buf = buf ? buf.map((x, c) => { const y = new Float32Array(x.length + b[c].length); y.set(x); y.set(b[c], x.length); return y; }) : b;
    have += b[0].length;
    const outs = flush(false);
    yield outs;
  }
  const outs = buf && flush(true);
  if (outs) yield outs;
}
function resample(chs, ratio, outLen) {
  outLen = outLen || Math.max(1, Math.floor(chs[0].length / ratio));
  return chs.map(x => { const y = new Float32Array(outLen); resampleRange(x, y, ratio, 0, outLen); return y; });
}
/* the input played `ratio` times faster, worked out only as far as it is read */
function lazyResampled(chs, ratio) {
  const length = Math.max(1, Math.floor(chs[0].length / ratio));
  const out = chs.map(() => new Float32Array(length));
  let filled = 0;
  return {
    chs: out, length,
    ensure(j) {
      // in steps of a quarter second or so, so each call does a useful amount
      const to = Math.min(length, Math.max(j, filled + 8192));
      if (to <= filled) return;
      chs.forEach((x, c) => resampleRange(x, out[c], ratio, filled, to));
      filled = to;
    }
  };
}

/* speed: 0.25–2 (1 = original tempo). semitones: pitch shift.
   Streams the result: yields arrays of Float32Array (one per channel) in order, the first `first` samples
   long and then `block` (the last may be shorter), round(input length / speed) samples in all, and
   null now and then while working. A pitch shift resamples before or after the phase vocoder, whichever
   has fewer samples to make: shifting up while slowing down resamples the input first, so the vocoder
   only ever makes the final length instead of stretching further and resampling the longer result. */
function* stream(chs, sr, speed, semitones, first, block) {
  const r = Math.pow(2, (semitones || 0) / 12);
  const tempo = speed / r;
  const finalLen = Math.max(1, Math.round(chs[0].length / speed));
  first = Math.max(1024, Math.round(first || sr));
  block = Math.max(1024, Math.round(block || 2 * sr));
  const shift = Math.abs(r - 1) > 1e-4;
  const plain = { chs, length: chs[0].length, ensure() {} };
  if (shift && r < speed) {
    // shifting down by more than it slows: stretch first (to fewer samples), then resample
    const midLen = Math.max(1, Math.round(chs[0].length / tempo));
    yield* resampleStream(vocoderStream(plain, sr, tempo, midLen, Math.ceil(first * r) + 64, Math.ceil(block * r) + 64), r, midLen, finalLen, first, block);
    return;
  }
  const src = shift ? lazyResampled(chs, r) : plain;
  if (Math.abs(tempo - 1) > 1e-4) { yield* vocoderStream(src, sr, tempo, finalLen, first, block); return; }
  // no stretching needed (the speed and the pitch shift cancel out, or neither applies)
  for (let at = 0, n = first; at < finalLen; at += n, n = block) {
    const end = Math.min(finalLen, at + n);
    src.ensure(end);
    yield src.chs.map(x => { const y = new Float32Array(end - at); y.set(x.subarray(Math.min(at, x.length), Math.min(end, x.length))); return y; });
  }
}

/* the whole result at once (tests, and anything that wants it in one piece) */
function process(chs, sr, speed, semitones, onProgress) {
  const len = Math.max(1, Math.round(chs[0].length / speed));
  return collect(stream(chs, sr, speed, semitones, 1 << 16, 1 << 16), chs.length, len, onProgress);
}

export default { process, stream, vocoder, resample, findOnsets };
