/* World Woodshed — recording yourself: the last 20 minutes on a laptop, and takes on any device.
   The mic's raw samples (Mic.on('block')) are kept in memory as 16-bit chunks of one second (`Ring`): a rolling
   one drops its oldest second as each new one fills, a take just grows. Nothing leaves the memory until you save:
   `encode` makes an Ogg Opus file with WebCodecs (about 1 MB a minute) where the browser can both make and play
   one, a WAV file otherwise, and the caller puts it in the Library. The pure parts (Ring, oggOpus, wav, crcOgg)
   are tested in test/recorder.test.js. */

export const ROLL_SECS = 20 * 60;   // how much the laptop keeps
export const TAKE_SECS = 20 * 60;   // the longest take, so a phone's memory is never at risk
export const OPUS_BITRATE = 96000;

/* ---------- the buffer ---------- */
/* Samples in one-second Int16 chunks. maxSecs: the rolling length (oldest dropped); 0 grows without limit. */
export function Ring(sr, maxSecs = 0) {
  let full = [], cur = new Int16Array(sr), n = 0;
  return {
    sr,
    push(f32) {
      for (let i = 0; i < f32.length; i++) {
        const v = f32[i];
        cur[n++] = v >= 1 ? 32767 : v <= -1 ? -32768 : Math.round(v * 32767);
        if (n === sr) {
          full.push(cur); cur = new Int16Array(sr); n = 0;
          if (maxSecs && full.length > maxSecs) full.shift(); // the oldest second goes; a snapshot already taken keeps it
        }
      }
    },
    get length() { return full.length * sr + n; },
    get seconds() { return (full.length * sr + n) / sr; },
    // the last `secs` seconds (all of it by default) as chunks that no later push changes
    snapshot(secs = Infinity) {
      const chunks = full.slice(), last = cur.slice(0, n);
      if (n) chunks.push(last);
      let length = full.length * sr + n;
      const want = Math.min(length, Math.round(secs * sr));
      while (chunks.length && length - chunks[0].length >= want) length -= chunks.shift().length;
      if (length > want) { const cut = length - want; chunks[0] = chunks[0].subarray(cut); length = want; }
      return { chunks, length, sr };
    },
    clear() { full = []; cur = new Int16Array(sr); n = 0; }
  };
}

/* ---------- WAV ---------- */
export function wav({ chunks, length, sr }) {
  const head = new DataView(new ArrayBuffer(44));
  const str = (o, t) => { for (let i = 0; i < t.length; i++) head.setUint8(o + i, t.charCodeAt(i)); };
  str(0, 'RIFF'); head.setUint32(4, 36 + length * 2, true); str(8, 'WAVE');
  str(12, 'fmt '); head.setUint32(16, 16, true); head.setUint16(20, 1, true); head.setUint16(22, 1, true);
  head.setUint32(24, sr, true); head.setUint32(28, sr * 2, true); head.setUint16(32, 2, true); head.setUint16(34, 16, true);
  str(36, 'data'); head.setUint32(40, length * 2, true);
  // Int16Array is little-endian on every device that runs this app
  return [new Uint8Array(head.buffer), ...chunks.map(c => new Uint8Array(c.buffer, c.byteOffset, c.byteLength))];
}

/* ---------- Ogg Opus (RFC 7845) ---------- */
let CRC = null;
export function crcOgg(bytes, crc = 0) {
  if (!CRC) {
    CRC = new Uint32Array(256);
    for (let i = 0; i < 256; i++) { let r = i << 24; for (let j = 0; j < 8; j++) r = r & 0x80000000 ? (r << 1) ^ 0x04c11db7 : r << 1; CRC[i] = r >>> 0; }
  }
  for (let i = 0; i < bytes.length; i++) crc = ((crc << 8) ^ CRC[((crc >>> 24) ^ bytes[i]) & 0xff]) >>> 0;
  return crc >>> 0;
}
const ascii = t => Uint8Array.from(t, c => c.charCodeAt(0));
export function opusHead(preSkip, rate) {
  const b = new Uint8Array(19), d = new DataView(b.buffer);
  b.set(ascii('OpusHead')); b[8] = 1; b[9] = 1; d.setUint16(10, preSkip, true); d.setUint32(12, rate, true);
  return b; // output gain 0, mapping family 0
}
function opusTags(vendor) {
  const v = ascii(vendor), b = new Uint8Array(8 + 4 + v.length + 4), d = new DataView(b.buffer);
  b.set(ascii('OpusTags')); d.setUint32(8, v.length, true); b.set(v, 12); // and no comments
  return b;
}
function page(segs, body, granule, serial, seq, flags) {
  const out = new Uint8Array(27 + segs.length + body.length), d = new DataView(out.buffer);
  out.set(ascii('OggS')); out[4] = 0; out[5] = flags;
  d.setUint32(6, granule % 0x100000000, true); d.setUint32(10, Math.floor(granule / 0x100000000), true);
  d.setUint32(14, serial, true); d.setUint32(18, seq, true); out[26] = segs.length;
  out.set(segs, 27); out.set(body, 27 + segs.length);
  d.setUint32(22, crcOgg(out), true);
  return out;
}
/* packets: [{ data: Uint8Array, samples: duration at 48 kHz }] → the file's pages (Uint8Arrays).
   total: samples of real audio at 48 kHz, so the last page's granule trims the encoder's padding at the end. */
export function oggOpus(packets, { preSkip = 312, rate = 48000, total = null, serial = 0x5757, vendor = 'World Woodshed' } = {}) {
  const pages = [];
  let seq = 0;
  pages.push(page([19], opusHead(preSkip, rate), 0, serial, seq++, 2));
  const tags = opusTags(vendor);
  pages.push(page([tags.length], tags, 0, serial, seq++, 0));
  let segs = [], body = [], size = 0, gran = preSkip, sent = 0;
  const end = total == null ? Infinity : preSkip + total;
  const flush = last => {
    const b = new Uint8Array(size); let o = 0;
    body.forEach(x => { b.set(x, o); o += x.length; });
    pages.push(page(segs, b, last ? Math.min(gran, end) : gran, serial, seq++, last ? 4 : 0));
    segs = []; body = []; size = 0;
  };
  packets.forEach((p, i) => {
    const lace = [];
    for (let left = p.data.length; ; left -= 255) { if (left >= 255) lace.push(255); else { lace.push(left); break; } }
    if (segs.length + lace.length > 255 || size > 16000) flush(false); // a page holds 255 segments; ~16 KB keeps seeking quick
    segs.push(...lace); body.push(p.data); size += p.data.length;
    gran += p.samples; sent++;
    if (i === packets.length - 1) flush(true);
  });
  if (!sent) pages.push(page([], new Uint8Array(0), preSkip, serial, seq++, 4));
  return pages;
}

/* ---------- making the file (in the browser) ---------- */
const OGG = 'audio/ogg; codecs=opus';
let opusOk = null;
async function canOpus(sr) {
  if (typeof AudioEncoder === 'undefined' || typeof AudioData === 'undefined' || typeof document === 'undefined') return false;
  try { if (!document.createElement('audio').canPlayType(OGG)) return false; } catch (e) { return false; }
  try { return !!(await AudioEncoder.isConfigSupported({ codec: 'opus', sampleRate: sr, numberOfChannels: 1, bitrate: OPUS_BITRATE })).supported; } catch (e) { return false; }
}
async function toOpus(snap, onProgress) {
  const { chunks, length, sr } = snap;
  const packets = [];
  let preSkip = 312, failed = null;
  const enc = new AudioEncoder({
    output: (chunk, meta) => {
      const desc = meta && meta.decoderConfig && meta.decoderConfig.description;
      if (desc) { // the encoder's own OpusHead, when it gives one, has the true pre-skip
        const b = desc instanceof ArrayBuffer ? new Uint8Array(desc) : new Uint8Array(desc.buffer, desc.byteOffset, desc.byteLength);
        if (b.length >= 12 && String.fromCharCode(...b.subarray(0, 8)) === 'OpusHead') preSkip = b[10] | (b[11] << 8);
      }
      const data = new Uint8Array(chunk.byteLength); chunk.copyTo(data);
      packets.push({ data, samples: Math.round((chunk.duration || 20000) * 48 / 1000) });
    },
    error: e => { failed = e; }
  });
  enc.configure({ codec: 'opus', sampleRate: sr, numberOfChannels: 1, bitrate: OPUS_BITRATE });
  let done = 0;
  for (const c of chunks) {
    if (failed) throw failed;
    const f = new Float32Array(c.length);
    for (let i = 0; i < c.length; i++) f[i] = c[i] / 32768;
    const ad = new AudioData({ format: 'f32', sampleRate: sr, numberOfFrames: c.length, numberOfChannels: 1, timestamp: Math.round(done / sr * 1e6), data: f });
    enc.encode(ad); ad.close();
    done += c.length;
    if (enc.encodeQueueSize > 8) await new Promise(r => setTimeout(r, 0)); // let it catch up, so memory stays flat
    if (onProgress) onProgress(done / length);
  }
  // the encoder keeps back its look-ahead (the pre-skip) until more comes: silence pushes the last real samples
  // out, and the last page's granule cuts it off again
  const pad = new AudioData({ format: 'f32', sampleRate: sr, numberOfFrames: 2048, numberOfChannels: 1, timestamp: Math.round(done / sr * 1e6), data: new Float32Array(2048) });
  enc.encode(pad); pad.close();
  await enc.flush();
  enc.close();
  if (failed) throw failed;
  return new Blob(oggOpus(packets, { preSkip, rate: sr, total: Math.round(length * 48000 / sr) }), { type: OGG });
}
/* snapshot → { blob, ext } */
export async function encode(snap, onProgress) {
  if (opusOk === null || opusOk.sr !== snap.sr) opusOk = { sr: snap.sr, ok: await canOpus(snap.sr) };
  if (opusOk.ok) {
    try { return { blob: await toOpus(snap, onProgress), ext: 'ogg' }; } catch (e) { console.error(e); }
  }
  return { blob: new Blob(wav(snap), { type: 'audio/wav' }), ext: 'wav' };
}

/* ---------- names ---------- */
const pad = n => String(n).padStart(2, '0');
export function clipName(kind, at = new Date()) {
  const day = at.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  return (kind === 'take' ? 'Take' : 'Improvisation') + ' · ' + day + ' ' + pad(at.getHours()) + ':' + pad(at.getMinutes());
}
export function fileName(title, ext) {
  const safe = String(title || '').replace(/·/g, '-').replace(/:/g, '.').replace(/[\\/*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
  return (safe || 'Recording') + '.' + ext;
}
export const clock = secs => { const s = Math.max(0, Math.floor(secs)); return Math.floor(s / 60) + ':' + pad(s % 60); };
