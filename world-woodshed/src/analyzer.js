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
   gain) hears as well as a loud one. */
export function Analyzer(sr, opts = {}) {
  const emit = opts.emit || (() => {});
  const sens = opts.sensitivity ?? 0.5; // 0 = only loud attacks, 1 = very sensitive
  const HOP = 128, hopSec = HOP / sr;
  const ds = sr > 32000 ? 2 : 1, dsr = sr / ds; // pitch runs at half rate: plenty for a guitar
  const W = Math.round(0.043 * dsr / 64) * 64; // ~43 ms window
  const Wsec = W / dsr;
  const ring = new Float32Array(W * 2); let rpos = 0, filled = 0;
  let prevSample = 0, lastOnset = -1, frameBuf = new Float32Array(HOP), fpos = 0, frameT = 0;
  let hopCount = 0, pending = null, cur = null, legato = [], lastLevel = 0, dsAcc = 0, dsN = 0;
  // onsets: the attack band (high-passed) or the whole signal getting much louder than it was a moment ago.
  // Levels are means over a few frames, compared with the mean over the 30-50 ms before: one 128-sample
  // frame is shorter than a low string's period, so frame against frame ripples with the waveform.
  const RISE = 10 - 8 * sens;           // dB, attack band: 10 at 0, 6 at the default, 2 at 1
  const RISE_E = 7 - 5 * sens;         // dB, whole signal, for soft attacks (fingers, a far mic): 4.5 at the default
  const ABOVE = 16 - 8 * sens;          // dB the sound must reach above the room's noise floor
  const NH = Math.max(24, Math.ceil(0.065 / hopSec));
  const dHist = new Float32Array(NH), eHist = new Float32Array(NH); let hpos = 0, frames = 0;
  const fr = sec => Math.max(1, Math.round(sec / hopSec));
  const D_NOW = 2, D_FROM = fr(0.008), D_TO = fr(0.035), E_NOW = fr(0.01), E_FROM = fr(0.02), E_TO = fr(0.06);
  const meanOf = (arr, from, to) => { let s = 0; for (let k = from; k < to; k++) s += arr[(hpos - 1 - k + 2 * NH) % NH]; return s / (to - from); };
  const dB = v => 10 * Math.log10(v + 1e-14);
  const attackFloor = MinTracker(4, 0.25), levelFloor = MinTracker(4, 0.25), rmsFloor = MinTracker(4, 0.25); // the room: the quietest it has been lately
  let armed = true;                     // a new onset needs the level to have peaked and started falling first
  let peakDb = -200;
  // pitch: how far above the room the sound must be, and how sure the pitch must be
  const PITCH_SNR = Math.pow(10, (9 - 6 * sens) / 20);
  const MIN_RMS = 2e-4 * Math.pow(4, 1 - 2 * sens);
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
    dHist[hpos] = d; eHist[hpos] = e; hpos = (hpos + 1) % NH; frames++;
    const dNow = dB(meanOf(dHist, 0, D_NOW)), eNow = dB(meanOf(eHist, 0, E_NOW));
    const floorD = attackFloor.push(dB(meanOf(dHist, 0, D_FROM)), t), floorE = levelFloor.push(eNow, t);
    const ready = frames > E_TO;
    const rise = dNow - Math.max(dB(meanOf(dHist, D_FROM, D_TO)), floorD);
    const riseE = eNow - Math.max(dB(meanOf(eHist, E_FROM, E_TO)), floorE);
    if (!armed && (eNow < peakDb - 2 || t - lastOnset > 0.12)) armed = true;
    if (eNow > peakDb) peakDb = eNow;
    const attack = (rise > RISE && dNow > floorD + ABOVE) || (riseE > RISE_E && eNow > floorE + ABOVE);
    const isOnset = ready && armed && attack && (lastOnset < 0 || t - lastOnset > 0.06);
    if (isOnset) {
      // first sample in the frame that gets near the frame's steepest change marks the attack
      let ps = frameBuf[0];
      for (let i = 1; i < HOP; i++) { if (Math.abs(frameBuf[i] - ps) > 0.5 * maxDiff) { at = i; break; } ps = frameBuf[i]; }
      lastOnset = t + at / sr; armed = false; peakDb = eNow;
      emit({ type: 'onset', t: lastOnset, strength: Math.pow(10, Math.max(rise, riseE) / 10) });
      notePending(t); // a note still waiting to be named is named now, before the next one starts
      pending = { t: lastOnset, readings: [] };
    }
    lastLevel = Math.max(lastLevel * 0.9, Math.sqrt(e));
    if (++hopCount % 8 === 0) emit({ type: 'level', rms: lastLevel, peak });
  }
  function notePending(tEnd) {
    if (!pending || !pending.cand) return;
    const nm = pending.cand.midi;
    emit({ type: 'note', t: pending.t, midi: nm }); cur = { midi: nm, last: tEnd }; pending = null; legato = [];
  }
  function analyse(tEnd) {
    if (filled < W) return;
    const win = new Float32Array(W);
    for (let i = 0; i < W; i++) win[i] = ring[(rpos - W + i + ring.length) % ring.length];
    let e = 0; for (let i = 0; i < W; i++) e += win[i] * win[i];
    const rms = Math.sqrt(e / W);
    const fl = rmsFloor.push(rms, tEnd);
    if (rms < MIN_RMS || rms < fl * PITCH_SNR) { if (cur && tEnd - cur.last > 0.25) cur = null; if (pending && tEnd - pending.t > 0.25) pending = null; return; }
    const res = detectPitch(win, dsr);
    if (!res || res.clarity < (pending ? 0.6 : 0.8)) { if (pending && tEnd - pending.t > 0.25) pending = null; return; }
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
      if (n >= 2 && Math.abs(r[n - 1].midi - r[n - 2].midi) < 0.5) {
        pending.cand = { midi: (r[n - 1].midi + r[n - 2].midi) / 2, t: tEnd };
        // A plucked string's first tens of milliseconds can read an octave high (a nylon bass string's attack
        // is mostly its second harmonic) or be muddy: when it is not clear yet, or could be the octave of a
        // low note, keep listening a little longer before naming it.
        const f = 440 * Math.pow(2, (pending.cand.midi - 69) / 12);
        const sure = r[n - 1].clarity >= 0.95 && r[n - 2].clarity >= 0.95 && !(f > 150 && f < 340);
        if (sure || age >= 0.11) { notePending(tEnd); return; }
      }
      if (age > 0.25) { notePending(tEnd); pending = null; }
    } else {
      if (cur && Math.abs(midi - cur.midi) < 0.5) { cur.last = tEnd; legato = []; return; }
      // a fading note read an octave or a twelfth off (its harmonics) is the same note: a hammer-on, pull-off
      // or slide moves less than an octave
      if (cur && Math.abs(midi - cur.midi) > 11.5) { legato = []; return; }
      legato.push({ t: tEnd, midi });
      if (legato.length >= 3) {
        const l = legato.slice(-3);
        if (Math.abs(l[0].midi - l[2].midi) < 0.5 && Math.abs(l[1].midi - l[2].midi) < 0.5) {
          const nm = l[2].midi; emit({ type: 'note', t: l[0].t - Wsec / 2, midi: nm, legato: true }); cur = { midi: nm, last: tEnd }; legato = [];
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
