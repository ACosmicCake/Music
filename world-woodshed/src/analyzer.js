/* World Woodshed — the listening analyzer: pure signal code (testable without a browser) that finds
   note onsets with millisecond timing, the pitch of what you play (McLeod pitch method) and level. */
// Hz: below drop-D low string, to D♯6 (the 23rd fret). Not higher: the metronome woodblock rings at about
// 1.38 kHz (an F6 a little flat) for 150 ms, and from laptop speakers the mic hears it as a note.
const GUITAR_LO = 70, GUITAR_HI = 1270;

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
  let p = peaks.find(q => nsdf[q] >= 0.9 * top);
  // A weak fundamental (the low strings of a nylon guitar, a laptop mic with no bass) makes half the period
  // look almost as good as the period itself. When the lobe at twice the lag is clearly the better one, the odd
  // harmonics are real and the note is an octave lower. Only where that can happen: readings of 150-340 Hz.
  const peakAt = q => { const a = nsdf[q - 1], b = nsdf[q], c = nsdf[q + 1], den = a - 2 * b + c; return den < 0 ? b - 0.125 * (a - c) * (a - c) / den : b; };
  const f1 = sr / p;
  if (f1 > 150 && f1 < 340) {
    const dbl = peaks.find(q => Math.abs(q - 2 * p) <= 2);
    if (dbl !== undefined && dbl < maxLag && peakAt(dbl) > peakAt(p) + 0.03) p = dbl;
  }
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
const midiToFreq = m => 440 * Math.pow(2, (m - 69) / 12);

/* ---------- spectra: what an attack added, and which note explains it ---------- */
const FFTS = {};
function fftTables(n) {
  if (FFTS[n]) return FFTS[n];
  const rev = new Uint32Array(n), cos = new Float64Array(n / 2), sin = new Float64Array(n / 2);
  for (let i = 0, bits = Math.log2(n); i < n; i++) { let r = 0; for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b); rev[i] = r; }
  for (let i = 0; i < n / 2; i++) { cos[i] = Math.cos(2 * Math.PI * i / n); sin[i] = -Math.sin(2 * Math.PI * i / n); }
  return (FFTS[n] = { rev, cos, sin });
}
/* Magnitude spectrum (bins 0..n/2) of x, Hann-windowed and zero-padded to n (a power of two). */
export function magSpectrum(x, n) {
  const { rev, cos, sin } = fftTables(n), re = new Float64Array(n), im = new Float64Array(n), L = x.length;
  for (let i = 0; i < L; i++) re[rev[i]] = x[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * (i + 0.5) / L));
  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1, step = n / size;
    for (let i = 0; i < n; i += size) for (let j = 0, k = 0; j < half; j++, k += step) {
      const a = i + j, b = a + half, tr = re[b] * cos[k] - im[b] * sin[k], ti = re[b] * sin[k] + im[b] * cos[k];
      re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
    }
  }
  const out = new Float32Array(n / 2 + 1);
  for (let k = 0; k <= n / 2; k++) out[k] = Math.hypot(re[k], im[k]);
  return out;
}
/* The strongest spectral peaks between 60 Hz and 5 kHz, at most `max`, each { f, a } with its frequency
   interpolated; none weaker than `range` dB under the strongest or than `floor`. */
export function spectralPeaks(mag, df, max = 14, range = 30, floor = 0) {
  const lo = Math.max(2, Math.floor(60 / df)), hi = Math.min(mag.length - 2, Math.ceil(5000 / df));
  let top = 0; for (let k = lo; k <= hi; k++) if (mag[k] > top) top = mag[k];
  const min = Math.max(floor, top * Math.pow(10, -range / 20)), out = [];
  if (!(top > 0)) return out;
  for (let k = lo; k <= hi; k++) {
    const b = mag[k];
    if (b < min || b <= mag[k - 1] || b < mag[k + 1]) continue;
    const la = Math.log(mag[k - 1] + 1e-12), lb = Math.log(b), lc = Math.log(mag[k + 1] + 1e-12), den = la - 2 * lb + lc;
    const p = den < 0 ? Math.max(-0.5, Math.min(0.5, 0.5 * (la - lc) / den)) : 0;
    out.push({ f: (k + p) * df, a: Math.exp(lb - 0.25 * (la - lc) * p) });
  }
  out.sort((x, y) => y.a - x.a);
  return out.slice(0, max);
}
/* How well the harmonics of f0 explain a set of peaks: frac, the share of the peaks' amplitude that sits on a
   harmonic (within 40 cents), less what would by chance; cover, the share of its first six harmonics (below 4 kHz) that have a peak. A
   chord's common period (a "note" an octave or two under the chord) leaves its own harmonics empty, so its
   cover is low; the octave above a note leaves the odd harmonics unexplained, so its frac is low. Under 200 Hz
   a missing fundamental doesn't count against it: laptop and phone mics hardly hear it. `slack` (Hz) widens the
   40 cents for low partials to what the spectrum can resolve. */
export function explain(peaks, f0, slack = 0) {
  let tot = 0, got = 0;
  const N = Math.max(2, Math.min(6, Math.floor(4000 / f0))), hit = new Array(N + 1).fill(false);
  let amax = 0; for (const p of peaks) if (p.a > amax) amax = p.a;
  let low = false, luck = 0;
  for (const p of peaks) {
    tot += p.a;
    // within 40 cents of a harmonic, and never more than an eighth of the way to the next one (high harmonics of a
    // low note stand close together); luck is the chance a stray peak would land that close anyway
    const n = Math.round(p.f / f0), tol = Math.min(Math.max(0.0234 * p.f, slack), 0.125 * f0);
    if (n > 16) continue;
    luck += p.a * Math.min(1, 2 * tol / f0);
    if (n >= 1 && Math.abs(p.f - n * f0) < tol) {
      got += p.a; if (n <= N) hit[n] = true;
      if (n <= 2) low = true;
    }
  }
  let have = 0, want = 0;
  for (let n = 1; n <= N; n++) { if (n === 1 && f0 < 200 && !hit[1]) continue; want++; if (hit[n]) have++; }
  // a low note heard without its fundamental still has its octave; a chord's common period often has neither
  if (f0 < 200 && !low) have = 0;
  // the share explained beyond what any f0 that low would explain by chance
  const chance = tot > 0 ? luck / tot : 0, frac = tot > 0 ? Math.max(0, (got / tot - chance) / (1 - chance + 1e-9)) : 0;
  return { frac, cover: want ? have / want : 0 };
}
const fitOf = e => e.frac * e.cover * e.cover;
/* f is a subharmonic of g (g = k·f, k from 2 to 6) */
const under = (f, g) => { const k = Math.round(g / f); return k >= 2 && k <= 6 && Math.abs(1200 * Math.log2(g / (k * f))) < 40; };
/* Is f a better reading than g? A subharmonic of g only when it explains clearly more: the odd harmonics
   of a real low note are there, those of a chord's common period are not. */
function better(peaks, f, ef, g, eg, margin = 0.12) {
  if (under(f, g)) return ef.frac >= eg.frac + margin && fitOf(ef) >= 0.8 * fitOf(eg);
  if (under(g, f)) return !(eg.frac >= ef.frac + margin && fitOf(eg) >= 0.8 * fitOf(ef));
  return fitOf(ef) > fitOf(eg);
}
/* The guitar note that best explains a set of peaks: { freq, fit, frac, cover } or null. Candidates are each
   strong peak's frequency divided by 1 to 8, refined from the harmonics they match. */
export function bestF0(peaks, lo = GUITAR_LO, hi = GUITAR_HI, slack = 0) {
  if (!peaks.length) return null;
  const cands = [];
  for (const p of peaks.slice(0, 8)) for (let h = 1; h <= 8; h++) {
    const f = p.f / h; if (f < lo || f > hi) continue;
    if (!cands.some(c => Math.abs(1200 * Math.log2(c / f)) < 30)) cands.push(f);
  }
  let best = null;
  for (const f of cands) {
    const e = explain(peaks, f, slack);
    if (!best || better(peaks, f, e, best.freq, best)) best = { freq: f, fit: fitOf(e), ...e };
  }
  if (!best) return null;
  // refine: the amplitude-weighted mean of f/n over the peaks that sit on its harmonics
  let sw = 0, sf = 0;
  for (const p of peaks) {
    const n = Math.round(p.f / best.freq);
    if (n >= 1 && n <= 12 && Math.abs(1200 * Math.log2(p.f / (n * best.freq))) < 40) { sw += p.a; sf += p.a * p.f / n; }
  }
  if (sw > 0) best.freq = sf / sw;
  return best;
}

/* x with each band [lo, hi] (Hz) taken out: two band-stop biquads per band, run forward over the window. */
function bandStop(x, bands, sr) {
  let y = Float32Array.from(x);
  for (const [lo, hi] of bands) {
    const f0 = Math.sqrt(lo * hi), q = f0 / (hi - lo), w = 2 * Math.PI * f0 / sr, c = Math.cos(w), al = Math.sin(w) / (2 * q);
    const a0 = 1 + al, b0 = 1 / a0, b1 = -2 * c / a0, a1 = -2 * c / a0, a2 = (1 - al) / a0;
    for (let pass = 0; pass < 2; pass++) {
      let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
      for (let i = 0; i < y.length; i++) { const v = y[i], o = b0 * v + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = v; y2 = y1; y1 = o; y[i] = o; }
    }
  }
  return y;
}

/* The lowest value seen over the last `span` seconds, kept as minima of `step`-second chunks. */
function MinTracker(span, step) {
  const n = Math.ceil(span / step), mins = []; let chunk = Infinity, chunkT = null;
  return {
    push(v, t) {
      if (chunkT === null) chunkT = t;
      if (t - chunkT >= step) { mins.push(chunk); if (mins.length > n) mins.shift(); chunk = Infinity; chunkT = t; }
      if (v < chunk) chunk = v;
      let m = chunk; for (const x of mins) if (x < m) m = x;
      return m;
    }
  };
}

/* Streaming analyzer. push(block, t0) takes consecutive samples whose first sample is at audio time t0.
   Emits: onset {t}, pitch {t, freq, midi, clarity, rms}, note {t, midi} (an onset or a legato change with a clear pitch), level {rms, peak}.
   Every threshold is relative to the room's own noise floor, which it tracks, so a quiet phone mic (no automatic
   gain) hears as well as a loud one.
   A note is named from what its attack added to the sound: the spectrum just after the onset less the one just
   before it, matched to a guitar note by its harmonics (bestF0). So a note played while others ring (an arpeggio,
   a melody over a held chord) is named, not the louder note still ringing, and a chord is named by a note in it,
   not by the low "note" its common period makes. The time-domain pitch (detectPitch) gives the exact value when
   the two agree. */
export function Analyzer(sr, opts = {}) {
  const emit = opts.emit || (() => {});
  const sens = opts.sensitivity ?? 0.5; // 0 = only loud attacks, 1 = very sensitive
  const HOP = 128, hopSec = HOP / sr;
  const ds = sr > 32000 ? 2 : 1, dsr = sr / ds; // pitch runs at half rate: plenty for a guitar
  const W = Math.round(0.043 * dsr / 64) * 64; // ~43 ms window
  const Wsec = W / dsr;
  const RING = 4096, ring = new Float32Array(RING); let rpos = 0, filled = 0, tds = 0; // tds: the time just after the newest sample
  let prevSample = 0, lastOnset = -1, frameBuf = new Float32Array(HOP), fpos = 0, frameT = 0;
  let hopCount = 0, pending = null, cur = null, legato = [], lastLevel = 0, dsAcc = 0, dsN = 0;
  // onsets: the attack band (high-passed) or the whole signal getting much louder than it was a moment ago.
  // Levels are means over a few frames, compared with the mean over the 30-50 ms before: one 128-sample
  // frame is shorter than a low string's period, so frame against frame ripples with the waveform.
  const RISE = 10 - 8 * sens;           // dB, attack band: 10 at 0, 6 at the default, 2 at 1
  const RISE_E = 7 - 5 * sens;         // dB, whole signal, for soft attacks (fingers, a far mic): 4.5 at the default
  const ABOVE = 16 - 8 * sens;          // dB the sound must reach above the room's noise floor
  const NH = Math.max(24, Math.ceil(0.065 / hopSec));
  const dHist = new Float32Array(NH), eHist = new Float32Array(NH), tHist = new Float64Array(NH); let hpos = 0, frames = 0;
  const fr = sec => Math.max(1, Math.round(sec / hopSec));
  const D_NOW = 2, D_FROM = fr(0.008), D_TO = fr(0.035), E_NOW = fr(0.01), E_FROM = fr(0.02), E_TO = fr(0.06);
  const meanOf = (arr, from, to) => { let s = 0; for (let k = from; k < to; k++) s += arr[(hpos - 1 - k + 2 * NH) % NH]; return s / (to - from); };
  const dB = v => 10 * Math.log10(v + 1e-14);
  const attackFloor = MinTracker(4, 0.25), levelFloor = MinTracker(4, 0.25), rmsFloor = MinTracker(4, 0.25); // the room: the quietest it has been lately
  let armed = true;                     // a new onset needs the level to have peaked and started falling first
  let peakDb = -200, roomRms = 0;
  // pitch: how far above the room the sound must be, and how sure the pitch must be
  const PITCH_SNR = Math.pow(10, (9 - 6 * sens) / 20);
  const MIN_RMS = 2e-4 * Math.pow(4, 1 - 2 * sens);
  // spectra: a 1024-sample window (~45 ms) zero-padded to 4096 for naming notes; 512 samples every 128 for onsets
  const SN = 1024, NFFT = 4096, df = dsr / NFFT, SLACK = 1.5 * df;
  const FN = 512, FHOP = 128, fdf = dsr / FN, fLo = Math.ceil(150 / fdf), fHi = Math.min(FN / 2 - 2, Math.floor(6000 / fdf));
  const FLUX = 0.34 - 0.2 * sens;       // log rise per bin over the room and the frame two before, weighted by the bin's level
  let fluxHold = null, fprev1 = null, fprev2 = null, fFloor = null, fluxPrev = 0, fluxPrev2 = 0, fluxT = 0, dsCount = 0;
  const fluxHist = new Float32Array(32); let fluxN = 0;
  /* The app's own clicks (the metronome's woodblock, Sight-reading's beat), as the mic hears them: a short burst
     whose energy lies in one band, which laptop speakers play straight into the mic, often as loud as the guitar
     and on the very beat a note is played. Within a click's moment that band is left out of naming notes and of
     the spectral flux, and an onset it made gives way to the note's own. */
  const clicks = [];
  // the woodblock's body and its upper ring (the synth clicks are single tones inside them); the accent is a fifth up
  const CLICK_BAND = { click: [[1080, 1800], [3300, 3850]], clickHi: [[1600, 2750], [4950, 5780]] };
  const clickIn = (t0, t1) => { for (const c of clicks) if (c.t - 0.04 < t1 && c.t + 0.07 > t0) return c; return null; };
  const bandsIn = (t0, t1) => { const b = []; for (const c of clicks) if (c.t - 0.04 < t1 && c.t + 0.07 > t0) b.push(...CLICK_BAND[c.kind]); return b; };
  const inBands = (f, bands) => bands.some(([lo, hi]) => f >= lo && f <= hi);

  function windowEnding(tEnd, n) {
    const back = Math.round((tds - tEnd) * dsr);
    if (back < 0 || back + n > Math.min(filled, RING)) return null;
    const out = new Float32Array(n), end = rpos - back;
    for (let i = 0; i < n; i++) out[i] = ring[(end - n + i + 2 * RING) % RING];
    return out;
  }
  // the size of a peak that stands clear of the room's noise in a SN-sample Hann window
  const noiseMag = () => roomRms * Math.sqrt(0.375 * SN) * 3;
  let lastClicky = false;
  function onsetAt(t, strength, kind) {
    const clicky = !!clickIn(t, t);
    if (lastOnset >= 0 && t - lastOnset < 0.06) {
      // an onset in a click's moment may be only the click: the note's own attack just after it takes over,
      // keeping the spectrum from before the click
      if (!(lastClicky && pending && !pending.spec && t - lastOnset > 0.012)) return;
      lastOnset = t; lastClicky = clicky; armed = false;
      pending = { t, kind, readings: [], before: pending.before, specT: t + 0.005 + SN / dsr };
      return;
    }
    lastOnset = t; lastClicky = clicky; armed = false;
    emit({ type: 'onset', t, strength });
    notePending(t); // a note still waiting to be named is named now, before the next one starts
    const xb = windowEnding(t - 0.003, SN);
    pending = { t, kind, readings: [], before: xb ? magSpectrum(xb, NFFT) : null, specT: t + 0.005 + SN / dsr };
  }
  function onFrame(t) {
    // high-passed energy (first difference) makes pick and finger attacks stand out
    let d = 0, e = 0, peak = 0, at = 0, maxDiff = 0;
    for (let i = 0; i < HOP; i++) {
      const v = frameBuf[i], diff = v - prevSample; prevSample = v;
      d += diff * diff; e += v * v;
      const ad = Math.abs(diff); if (ad > maxDiff) { maxDiff = ad; }
      if (Math.abs(v) > peak) peak = Math.abs(v);
    }
    d /= HOP; e /= HOP;
    dHist[hpos] = d; eHist[hpos] = e; tHist[hpos] = t; hpos = (hpos + 1) % NH; frames++;
    const dNow = dB(meanOf(dHist, 0, D_NOW)), eNow = dB(meanOf(eHist, 0, E_NOW));
    const floorD = attackFloor.push(dB(meanOf(dHist, 0, D_FROM)), t), floorE = levelFloor.push(eNow, t);
    const ready = frames > E_TO;
    const rise = dNow - Math.max(dB(meanOf(dHist, D_FROM, D_TO)), floorD);
    const riseE = eNow - Math.max(dB(meanOf(eHist, E_FROM, E_TO)), floorE);
    if (!armed && (eNow < peakDb - 2 || t - lastOnset > 0.12)) armed = true;
    if (eNow > peakDb) peakDb = eNow;
    const attack = (rise > RISE && dNow > floorD + ABOVE) || (riseE > RISE_E && eNow > floorE + ABOVE);
    if (ready && armed && attack && (lastOnset < 0 || t - lastOnset > 0.06)) {
      // first sample in the frame that gets near the frame's steepest change marks the attack
      let ps = frameBuf[0];
      for (let i = 1; i < HOP; i++) { if (Math.abs(frameBuf[i] - ps) > 0.5 * maxDiff) { at = i; break; } ps = frameBuf[i]; }
      peakDb = eNow;
      const tOn = t + at / sr;
      if (fluxHold && tOn > fluxHold.t - 0.03 && tOn < fluxHold.t + 0.09) fluxHold = null;
      onsetAt(tOn, Math.pow(10, Math.max(rise, riseE) / 10), 'level');
    }
    lastLevel = Math.max(lastLevel * 0.9, Math.sqrt(e));
    if (++hopCount % 8 === 0) emit({ type: 'level', rms: lastLevel, peak });
  }
  /* Onsets the level misses: a note played again while it still rings, or a new note over others ringing,
     barely changes the level but brings new partials. Spectral flux: the rise of each frequency band over the frame
     two before and over the room's own spectrum, averaged with the louder bands counting more. */
  function onFlux() {
    const x = windowEnding(tds, FN); if (!x) return;
    const m = magSpectrum(x, FN);
    if (!fFloor) { fFloor = Float32Array.from(m); fprev1 = fprev2 = m; return; }
    let sum = 0, wsum = 0;
    const cb = bandsIn(tds - FN / dsr, tds);
    for (let k = fLo; k <= fHi; k++) {
      if (cb.length && inBands(k * fdf, cb)) { fFloor[k] = Math.max(fFloor[k], 0); continue; }
      const fl = 4 * fFloor[k], ref = Math.max(fprev2[k - 1], fprev2[k], fprev2[k + 1]);
      const r = Math.log((m[k] + fl) / (ref + fl)); if (r > 0) sum += r * m[k];
      wsum += m[k];
      fFloor[k] = m[k] > fFloor[k] ? fFloor[k] * 1.003 : Math.max(m[k], fFloor[k] * 0.9);
    }
    const flux = sum / (wsum + 1e-12);
    fprev2 = fprev1; fprev1 = m;
    // the frame before is a peak: higher than both neighbours, over the threshold and over the recent median
    const t1 = fluxT; fluxT = tds - FN / 2 / dsr;
    let med = 0;
    if (fluxN >= 8) { const srt = Array.from(fluxHist.subarray(0, Math.min(fluxN, 32))).sort((a, b) => a - b); med = srt[srt.length >> 1]; }
    if (fluxPrev > fluxPrev2 && fluxPrev >= flux && fluxPrev > FLUX + 0.5 * med && frames > E_TO) {
      // when the attack is: the frame (128 samples) whose high-passed energy rose most, from a little before the
      // middle of the peak frame on (the flux peaks as the attack crosses the middle of its window)
      let best = -1, bestR = 0;
      for (let k = 0; k < NH - 4; k++) {
        const idx = (hpos - 1 - k + 2 * NH) % NH; if (tHist[idx] < t1 - 0.012) break;
        let before = 0; for (let j = 1; j <= 3; j++) before += dHist[(idx - j + 2 * NH) % NH];
        const r = dHist[idx] / (before / 3 + 1e-14);
        if (r > bestR) { bestR = r; best = idx; }
      }
      const t = best >= 0 && bestR > 1.5 ? tHist[best] : t1;
      // the level must have risen at least a little: a note fading (beating strings, a hand on them) changes
      // its spectrum too, but never gets louder
      let now = 0, then = 0;
      for (let k = 0; k < fr(0.03); k++) now = Math.max(now, eHist[(hpos - 1 - k + 2 * NH) % NH]);
      for (let k = fr(0.03); k < fr(0.06); k++) then += eHist[(hpos - 1 - k + 2 * NH) % NH] / (fr(0.06) - fr(0.03));
      // held a moment: the level's own onset, when it comes too, times the attack better
      if (dB(now) - dB(then) > 0.5 && (lastOnset < 0 || t - lastOnset > 0.08)) fluxHold = { t, strength: Math.exp(fluxPrev), until: tds + 0.05 };
    }
    fluxHist[fluxN++ % 32] = flux;
    fluxPrev2 = fluxPrev; fluxPrev = flux;
  }
  /* The spectrum a new note added: after its attack less before it. After silence, the whole spectrum. */
  function attackSpectrum() {
    const xa = windowEnding(pending.specT, SN);
    if (!xa) { pending.spec = null; return; }
    const A = magSpectrum(xa, NFFT), B = pending.before, N = new Float32Array(A.length);
    // a click's band, widened by its skirt, is left out of the energies and the peaks
    const cb = bandsIn(pending.t - 0.01, pending.specT).map(([lo, hi]) => [lo * 0.93, hi * 1.06]);
    let ea = 0, eb = 0, en = 0;
    // what was ringing, widened by a few bins so its partials leave no edges behind when taken away
    for (let k = 0; k < A.length; k++) {
      let b = 0; if (B) for (let j = Math.max(0, k - 3); j <= Math.min(A.length - 1, k + 3); j++) if (B[j] > b) b = B[j];
      N[k] = Math.max(0, A[k] - b);
      if (cb.length && inBands(k * df, cb)) continue;
      ea += A[k] * A[k]; en += N[k] * N[k]; if (B) eb += B[k] * B[k];
    }
    const fresh = eb < 0.1 * ea; // nothing much was sounding before
    // (taken out before the peaks are picked, so a loud click doesn't set the range they are picked in; a peak
    // right at the cut's edge is the click's skirt)
    if (cb.length) for (let k = 0; k < A.length; k++) if (inBands(k * df, cb)) A[k] = N[k] = 0;
    const edge = cb.map(([lo, hi]) => [lo * 0.97, hi * 1.03]);
    const outside = list => cb.length ? list.filter(p => !inBands(p.f, edge)) : list;
    const all = outside(spectralPeaks(A, df, 24, 30, noiseMag())), peaks = fresh ? all : outside(spectralPeaks(N, df, 24, 30, noiseMag()));
    const res = bestF0(peaks, GUITAR_LO, GUITAR_HI, SLACK);
    pending.clicky = cb.length > 0;
    pending.spec = { midi: res ? freqToMidi(res.freq) : null, fit: res ? res.fit : 0, frac: res ? res.frac : 0, cover: res ? res.cover : 0, peaks, all, fresh, loud: peaks.length > 0 && peaks[0].a >= 6 * noiseMag(), added: fresh ? 1 : en / (ea + 1e-20) };
  }
  // does a reading explain what the attack added about as well as the best note does?
  const fits = (S, m) => {
    if (S.midi === null) return false;
    if (Math.abs(m - S.midi) < 0.5) return true;
    const f = midiToFreq(m), g = midiToFreq(S.midi), e = explain(S.peaks, f, SLACK);
    if (under(f, g)) return better(S.peaks, f, e, g, S, 0.2);
    // a reading an octave or more above the attack's note (an early window full of the second harmonic)
    if (under(g, f)) return !better(S.peaks, g, S, f, e);
    return fitOf(e) >= 0.8 * S.fit;
  };
  /* The note's fundamental or octave is the strongest peak (or, with any, one within 20 dB of it). */
  function leads(peaks, m, any) {
    if (!peaks.length) return false;
    const f = midiToFreq(m), near = (p, g) => Math.abs(p.f - g) < Math.max(0.0234 * g, SLACK);
    return any ? peaks.some(p => p.a >= 0.1 * peaks[0].a && (near(p, f) || near(p, 2 * f))) : near(peaks[0], f) || near(peaks[0], 2 * f);
  }
  /* Among its first three harmonics, within 16 dB of the strongest peak, one that isn't a harmonic of `other`. */
  function ownPartials(peaks, m, other) {
    if (!peaks.length) return false;
    const f = midiToFreq(m), g = other == null ? 0 : midiToFreq(other);
    const on = (p, h, most) => { const n = Math.round(p.f / h); return n >= 1 && n <= most && Math.abs(p.f - n * h) < Math.max(0.0234 * p.f, SLACK); };
    return peaks.some(p => p.a >= 0.15 * peaks[0].a && on(p, f, 3) && !(g && on(p, g, 16)));
  }
  function mOwnH1(peaks, m) {
    const f = midiToFreq(m);
    return peaks.some(p => p.a >= 0.05 * peaks[0].a && Math.abs(p.f - f) < Math.max(0.0234 * f, SLACK));
  }
  /* Which note the attack was: undefined to wait for more, null for none. The time-domain reading (M) is the more
     exact and is kept when the attack's spectrum agrees with it; otherwise the note that best explains what the
     attack added (S); a weak spectral answer over a note still ringing is that note played again. */
  function decide(age, last) {
    const S = pending.spec, M = pending.cand;
    if (S === undefined && !last) return undefined;
    // (a click with the attack blurs the first readings: a little longer for a clear one)
    const wait = !last && age < (pending.clicky && !M ? 0.2 : 0.11);
    if (!S) return M ? (M.sure || !wait ? M.midi : undefined) : (last ? null : undefined);
    if (M && fits(S, M.midi)) {
      // A plucked string's first tens of milliseconds can read an octave high or be muddy: when the reading is
      // not clear yet, or could be the octave of a low note, keep listening a little longer
      const f = midiToFreq(M.midi);
      return (M.sure && !(f > 150 && f < 340)) || !wait ? M.midi : undefined;
    }
    if (wait) return undefined;
    // the attack brought next to nothing new: a ringing string's own wobble or a hand touching it, not a note
    // (with a clear attack in the level, the same note played again over itself)
    // (or a soft new note over louder ones ringing: a pitch that isn't the note ringing, its fundamental in the sound)
    if (S.added < 0.05) return M && ((pending.kind === 'level' && cur && Math.abs(M.midi - cur.midi) < 0.5) || ((!cur || Math.abs(M.midi - cur.midi) >= 0.5) && mOwnH1(S.all, M.midi))) ? M.midi : null;
    // nothing in the attack's spectrum stands well clear of the room: a bump in the noise, unless the time-domain
    // reading is sure of itself
    if (!S.loud) return M && (M.sure || mOwnH1(S.all, M.midi)) ? M.midi : null;
    // an unsure low reading with no fundamental of its own in the sound: the common period of strings struck
    // together (a root and its fifth read as the octave below the root), so the attack's own note
    if (M && !M.sure && midiToFreq(M.midi) < 200 && !mOwnH1(S.all, M.midi)) {
      if (S.fit >= (pending.clicky ? 0.08 : 0.2)) return S.midi;
      if (pending.clicky) return null; // the click left too little of the attack to tell: better nothing than a note under it
    }
    // S, unsure, an octave or more above M, and M has partials of its own in the sound (not S's): the attack's
    // window is short for a low note, and M is the note itself
    const mOwn = M && ownPartials(S.all, M.midi, S.midi);
    if (M && mOwn && S.fit < 0.45 && under(midiToFreq(M.midi), midiToFreq(S.midi))) return M.midi;
    // after silence the time-domain reading is right unless it is a chord's common period (below)
    if (S.fit >= 0.45 && (M ? !S.fresh : S.loud)) return S.midi;
    // the time-domain reading of notes ringing together is their common period, a "note" under the chord with
    // neither its fundamental nor its octave in the sound; the attack's own note leads the spectrum
    if (M && S.midi !== null && leads(S.peaks, S.midi) && !mOwn && !(S.fit < 0.45 && Math.abs(S.midi - M.midi - 12) < 0.5)) return S.midi;
    if (M) return M.midi;
    if (cur && explain(S.peaks, midiToFreq(cur.midi), SLACK).frac >= 0.6) return cur.midi;
    if (S.loud && (S.fit >= 0.3 || (pending.kind === 'level' && S.added >= 0.2 && S.fit >= 0.2))) return S.midi;
    return null;
  }
  function emitNote(nm) {
    // a legato reading that already named this note a moment ago
    const dup = cur && cur.legato && Math.abs(cur.midi - nm) < 0.5 && pending.t - cur.t < 0.12;
    if (!dup) emit({ type: 'note', t: pending.t, midi: nm });
    cur = { midi: nm, last: tds, t: pending.t }; pending = null; legato = [];
  }
  // a note waiting to be named, called before the next onset replaces it
  function notePending() {
    if (!pending) return;
    const nm = decide(tds - pending.t, true);
    if (nm != null) emitNote(nm);
  }
  function tryName(t) {
    const nm = decide(t - pending.t, false);
    if (nm != null) emitNote(nm);
    else if (nm === null) pending = null;
  }
  function analyse(tEnd) {
    if (filled < W) return;
    const win = windowEnding(tEnd, W); if (!win) return;
    let e = 0; for (let i = 0; i < W; i++) e += win[i] * win[i];
    const rms = Math.sqrt(e / W);
    roomRms = rmsFloor.push(rms, tEnd);
    const quiet = rms < MIN_RMS || rms < roomRms * PITCH_SNR;
    if (pending && pending.spec !== undefined && (quiet || tEnd - pending.t > 0.25)) {
      tryName(tEnd);
      if (pending && tEnd - pending.t > 0.25) { notePending(); pending = null; }
    }
    if (quiet) { if (cur && tEnd - cur.last > 0.25) cur = null; return; }
    // a click in the window: its band taken out first, so the reading is the guitar's and not the click's
    const cb = bandsIn(tEnd - Wsec, tEnd);
    let pw = win;
    if (cb.length) { // filtered with a run-in before the window, so the filter's own start-up isn't in it
      const pre = Math.round(0.02 * dsr), long = windowEnding(tEnd, W + pre);
      pw = long ? bandStop(long, cb, dsr).subarray(pre) : bandStop(win, cb, dsr);
    }
    const res = detectPitch(pw, dsr);
    if (!res || res.clarity < (pending ? (cb.length ? 0.45 : 0.6) : 0.8)) { if (pending) tryName(tEnd); return; }
    const midi = freqToMidi(res.freq);
    emit({ type: 'pitch', t: tEnd, freq: res.freq, midi, clarity: res.clarity, rms });
    // turn readings into notes: after an onset, or when the pitch moves without one (hammer-ons, slides)
    if (pending) {
      // only windows wholly after the onset: with the silence or the last note in it, the reading is often a
      // twelfth low (high notes) or comes from the note still ringing
      const age = tEnd - pending.t;
      if (age < Wsec + 0.002) return;
      pending.readings.push({ midi, clarity: res.clarity });
      const r = pending.readings, n = r.length;
      if (n >= 2 && Math.abs(r[n - 1].midi - r[n - 2].midi) < 0.5)
        pending.cand = { midi: (r[n - 1].midi + r[n - 2].midi) / 2, sure: r[n - 1].clarity >= 0.95 && r[n - 2].clarity >= 0.95 };
      tryName(tEnd);
    } else {
      if (cur && Math.abs(midi - cur.midi) < 0.5) { cur.last = tEnd; legato = []; return; }
      // a fading note read an octave or a twelfth off (its harmonics) is the same note: a hammer-on, pull-off
      // or slide moves less than an octave
      if (cur && Math.abs(midi - cur.midi) > 11.5) { legato = []; return; }
      legato.push({ t: tEnd, midi });
      if (legato.length >= 3) {
        const l = legato.slice(-3);
        if (Math.abs(l[0].midi - l[2].midi) < 0.5 && Math.abs(l[1].midi - l[2].midi) < 0.5) {
          const nm = l[2].midi; legato = [];
          // the common period of notes ringing together reads as a low note nobody played: only a note whose
          // own harmonics are there
          if (!heardNow(nm, tEnd)) return;
          emit({ type: 'note', t: l[0].t - Wsec / 2, midi: nm, legato: true }); cur = { midi: nm, last: tEnd, t: l[0].t - Wsec / 2, legato: true };
        }
      }
    }
  }
  function heardNow(nm, tEnd) {
    const x = windowEnding(tEnd, SN); if (!x) return true;
    const peaks = spectralPeaks(magSpectrum(x, NFFT), df, 24, 30, noiseMag());
    const best = bestF0(peaks, GUITAR_LO, GUITAR_HI, SLACK); if (!best) return false;
    return fits({ midi: freqToMidi(best.freq), fit: best.fit, peaks }, nm);
  }
  return {
    // the app plays a click ('click' or 'clickHi') that reaches the mic at audio time t
    clickAt(t, kind = 'click') {
      clicks.push({ t, kind: CLICK_BAND[kind] ? kind : 'click' });
      while (clicks.length && clicks[0].t < tds - 1) clicks.shift();
      if (clicks.length > 64) clicks.splice(0, clicks.length - 64);
    },
    push(block, t0) {
      for (let i = 0; i < block.length; i++) {
        if (fpos === 0) frameT = t0 + i / sr;
        frameBuf[fpos++] = block[i];
        if (fpos === HOP) { fpos = 0; onFrame(frameT); }
        dsAcc += block[i]; dsN++;
        if (dsN === ds) {
          ring[rpos] = dsAcc / ds; rpos = (rpos + 1) % RING; filled++; tds = t0 + (i + 1) / sr;
          dsAcc = 0; dsN = 0; dsCount++;
          if (dsCount % FHOP === 0) onFlux();
          if (fluxHold && tds >= fluxHold.until) { const h = fluxHold; fluxHold = null; onsetAt(h.t, h.strength, 'flux'); }
          if (pending && pending.spec === undefined && tds >= pending.specT) { attackSpectrum(); tryName(tds); }
          if (filled % (W >> 2) === 0) analyse(tds); // ~11 ms hop
        }
      }
    }
  };
}
