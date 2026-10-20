/* World Woodshed — time-stretch (WSOLA) and pitch-shift.
   Loaded both as a page script (fallback) and as a Web Worker. */
(function (root) {
  function hann(n) {
    const w = new Float32Array(n);
    for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
    return w;
  }

  /* WSOLA: output length = input length / tempo (tempo < 1 slows down) */
  function wsola(chs, sr, tempo, onProgress, pStart, pSpan) {
    const inLen = chs[0].length;
    let N = Math.round(sr * 0.05); if (N % 2) N++;
    const Hs = N / 2, Ha = Hs * tempo;
    const tol = Math.round(sr * 0.008);
    const win = hann(N);
    const outLen = Math.max(1, Math.round(inLen / tempo));
    const out = chs.map(() => new Float32Array(outLen + N));
    const norm = new Float32Array(outLen + N);
    // mono guide signal
    const mono = new Float32Array(inLen);
    for (let c = 0; c < chs.length; c++) { const x = chs[c]; for (let i = 0; i < inLen; i++) mono[i] += x[i]; }
    let prevPos = 0;
    const frames = Math.ceil(outLen / Hs) + 1;
    const L = Hs;
    for (let m = 0; m < frames; m++) {
      const outPos = m * Hs;
      if (outPos >= outLen) break;
      const nominal = Math.round(m * Ha);
      let pos;
      if (m === 0) pos = 0;
      else {
        const target = prevPos + Hs;
        let bestD = 0, bestV = -Infinity;
        const lo = -tol, hi = tol;
        // coarse search on every 4th sample
        for (let d = lo; d <= hi; d += 4) {
          const p = nominal + d;
          if (p < 0 || p + L >= inLen || target + L >= inLen) continue;
          let v = 0;
          for (let i = 0; i < L; i += 4) v += mono[p + i] * mono[target + i];
          if (v > bestV) { bestV = v; bestD = d; }
        }
        // refine
        const c0 = bestD;
        for (let d = c0 - 3; d <= c0 + 3; d++) {
          const p = nominal + d;
          if (d < lo || d > hi || p < 0 || p + L >= inLen || target + L >= inLen) continue;
          let v = 0;
          for (let i = 0; i < L; i += 2) v += mono[p + i] * mono[target + i];
          if (v > bestV) { bestV = v; bestD = d; }
        }
        pos = nominal + bestD;
      }
      if (pos < 0) pos = 0;
      if (pos > inLen - 1) pos = inLen - 1;
      const n = Math.min(N, inLen - pos);
      for (let c = 0; c < chs.length; c++) {
        const x = chs[c], o = out[c];
        for (let i = 0; i < n; i++) o[outPos + i] += x[pos + i] * win[i];
      }
      for (let i = 0; i < n; i++) norm[outPos + i] += win[i];
      prevPos = pos;
      if (onProgress && m % 400 === 0) onProgress(pStart + pSpan * (m / frames));
    }
    for (let c = 0; c < out.length; c++) {
      const o = out[c];
      for (let i = 0; i < outLen; i++) { const g = norm[i]; if (g > 1e-3) o[i] /= g; }
    }
    return out.map(o => o.subarray(0, outLen).slice());
  }

  /* Cubic (Catmull-Rom) resampling: plays input `ratio` times faster */
  function resample(chs, ratio) {
    const inLen = chs[0].length;
    const outLen = Math.max(1, Math.floor(inLen / ratio));
    return chs.map(x => {
      const y = new Float32Array(outLen);
      for (let j = 0; j < outLen; j++) {
        const t = j * ratio, i = Math.floor(t), f = t - i;
        const xm1 = x[i - 1 < 0 ? 0 : i - 1], x0 = x[i], x1 = x[i + 1 < inLen ? i + 1 : inLen - 1], x2 = x[i + 2 < inLen ? i + 2 : inLen - 1];
        const a = (-xm1 + 3 * x0 - 3 * x1 + x2) / 2, b = xm1 - 2.5 * x0 + 2 * x1 - x2 / 2, c = (x1 - xm1) / 2;
        y[j] = ((a * f + b) * f + c) * f + (x0 === undefined ? 0 : x0);
      }
      return y;
    });
  }

  /* speed: 0.25–2 (1 = original tempo). semitones: pitch shift. */
  function process(chs, sr, speed, semitones, onProgress) {
    const r = Math.pow(2, (semitones || 0) / 12);
    const tempo = speed / r;
    let out = chs;
    if (Math.abs(tempo - 1) > 1e-4) out = wsola(out, sr, tempo, onProgress, 0, r !== 1 ? 0.85 : 1);
    if (Math.abs(r - 1) > 1e-4) out = resample(out, r);
    if (onProgress) onProgress(1);
    return out;
  }

  root.WW_STRETCH = { process, wsola, resample };

  const isWorker = typeof WorkerGlobalScope !== 'undefined' && root instanceof WorkerGlobalScope;
  if (isWorker) {
    root.onmessage = function (e) {
      const m = e.data;
      try {
        const res = process(m.channels, m.sr, m.speed, m.semitones, p => root.postMessage({ id: m.id, type: 'progress', progress: p }));
        root.postMessage({ id: m.id, type: 'done', channels: res }, res.map(c => c.buffer));
      } catch (err) {
        root.postMessage({ id: m.id, type: 'done', error: String(err && err.message || err) });
      }
    };
  }
})(typeof self !== 'undefined' ? self : this);
