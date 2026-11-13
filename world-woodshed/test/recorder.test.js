import { describe, it, expect } from 'vitest';
import { Ring, wav, oggOpus, crcOgg, opusHead, clipName, fileName, clock, isAutoRec } from '../src/recorder.js';

const tone = (n, v = 0.5) => Float32Array.from({ length: n }, () => v);
const cat = parts => { const out = new Uint8Array(parts.reduce((a, p) => a + p.length, 0)); let o = 0; parts.forEach(p => { out.set(p, o); o += p.length; }); return out; };

describe('Ring', () => {
  it('keeps only the last maxSecs seconds, plus the second filling', () => {
    const r = Ring(100, 3);
    for (let i = 0; i < 10; i++) r.push(tone(50, i / 20));
    r.push(tone(30));
    expect(r.seconds).toBeCloseTo(3.3);
    const snap = r.snapshot();
    expect(snap.length).toBe(330);
    expect(snap.chunks.reduce((a, c) => a + c.length, 0)).toBe(330);
  });
  it('cuts a snapshot to the seconds asked, from the end', () => {
    const r = Ring(100, 0);
    for (let i = 0; i < 500; i++) r.push(Float32Array.of(i / 1000));
    const snap = r.snapshot(1.5);
    expect(snap.length).toBe(150);
    const flat = Int16Array.from(snap.chunks.flatMap(c => [...c]));
    expect(flat.length).toBe(150);
    expect(flat[149]).toBe(Math.round(0.499 * 32767));
    expect(flat[0]).toBe(Math.round(0.35 * 32767));
  });
  it('a snapshot is not changed by later samples', () => {
    const r = Ring(10, 2);
    r.push(tone(25, 0.1));
    const snap = r.snapshot();
    r.push(tone(40, -0.9));
    expect(snap.length).toBe(25);
    expect([...snap.chunks.flatMap(c => [...c])].every(v => v === Math.round(0.1 * 32767))).toBe(true);
  });
  it('clips loud samples instead of wrapping round', () => {
    const r = Ring(4, 0);
    r.push(Float32Array.of(1.5, -1.5, 1, -1));
    expect([...r.snapshot().chunks[0]]).toEqual([32767, -32768, 32767, -32768]);
  });
  it('after a save, keeps only what came after the snapshot', () => {
    const r = Ring(10, 3);
    for (let i = 0; i < 25; i++) r.push(Float32Array.of(i / 100));
    const snap = r.snapshot(3);
    expect(snap.end).toBe(25);
    for (let i = 25; i < 32; i++) r.push(Float32Array.of(i / 100)); // played while it was saving
    r.dropUntil(snap.end);
    expect(r.length).toBe(7);
    const flat = [...r.snapshot().chunks.flatMap(c => [...c])];
    expect(flat).toEqual([25, 26, 27, 28, 29, 30, 31].map(i => Math.round(i / 100 * 32767)));
    r.push(tone(5));
    expect(r.length).toBe(12); // and carries on from there
    r.dropUntil(r.total);
    expect(r.length).toBe(0);
  });
  it('grows without limit for a take', () => {
    const r = Ring(10, 0);
    r.push(tone(1000));
    expect(r.seconds).toBe(100);
  });
});

describe('WAV', () => {
  it('writes a 16-bit mono header for the samples', () => {
    const r = Ring(8000, 0); r.push(tone(12000, 0.25));
    const bytes = cat(wav(r.snapshot()));
    const d = new DataView(bytes.buffer);
    expect(String.fromCharCode(...bytes.subarray(0, 4))).toBe('RIFF');
    expect(d.getUint32(4, true)).toBe(bytes.length - 8);
    expect(d.getUint16(22, true)).toBe(1);
    expect(d.getUint32(24, true)).toBe(8000);
    expect(d.getUint32(40, true)).toBe(24000);
    expect(d.getInt16(44, true)).toBe(Math.round(0.25 * 32767));
  });
});

/* read the pages back: each one's CRC, flags, granule and packets */
function readOgg(bytes) {
  const pages = [];
  let o = 0;
  while (o < bytes.length) {
    expect(String.fromCharCode(...bytes.subarray(o, o + 4))).toBe('OggS');
    const d = new DataView(bytes.buffer, bytes.byteOffset + o);
    const n = bytes[o + 26], lace = [...bytes.subarray(o + 27, o + 27 + n)], size = lace.reduce((a, b) => a + b, 0);
    const len = 27 + n + size, copy = bytes.slice(o, o + len);
    copy[22] = copy[23] = copy[24] = copy[25] = 0;
    expect(crcOgg(copy)).toBe(d.getUint32(22, true));
    const packets = []; let cur = 0, at = o + 27 + n;
    lace.forEach(l => { cur += l; if (l < 255) { packets.push(cur); cur = 0; } });
    pages.push({ flags: bytes[o + 5], granule: d.getUint32(6, true) + d.getUint32(10, true) * 2 ** 32, seq: d.getUint32(18, true), packets, body: bytes.subarray(at, at + size) });
    o += len;
  }
  return pages;
}

describe('Ogg Opus', () => {
  it('uses the Ogg CRC (polynomial 0x04c11db7, no reflection)', () => {
    expect(crcOgg(new TextEncoder().encode('123456789'))).toBe(0x89a1897f); // CRC-32/MPEG-2 without its inversions
  });
  it('writes the head, the tags and the packets with their granule positions', () => {
    const packets = Array.from({ length: 120 }, (_, i) => ({ data: new Uint8Array(100 + (i % 3) * 200).fill(i), samples: 960 }));
    packets[5].data = new Uint8Array(510); // a multiple of 255 needs a closing 0 in its lacing
    const pages = readOgg(cat(oggOpus(packets, { preSkip: 312, rate: 44100, total: 120 * 960 - 500 })));
    expect(pages[0].flags).toBe(2);
    expect(String.fromCharCode(...pages[0].body.subarray(0, 8))).toBe('OpusHead');
    expect(new DataView(pages[0].body.buffer, pages[0].body.byteOffset).getUint16(10, true)).toBe(312);
    expect(new DataView(pages[0].body.buffer, pages[0].body.byteOffset).getUint32(12, true)).toBe(44100);
    expect(String.fromCharCode(...pages[1].body.subarray(0, 8))).toBe('OpusTags');
    const audio = pages.slice(2);
    expect(audio.flatMap(p => p.packets)).toEqual(packets.map(p => p.data.length));
    expect(audio.map(p => p.seq)).toEqual(audio.map((_, i) => i + 2));
    let seen = 0;
    audio.forEach((p, i) => {
      seen += p.packets.length;
      const want = i === audio.length - 1 ? 312 + 120 * 960 - 500 : 312 + seen * 960;
      expect(p.granule).toBe(want);
      expect(p.flags).toBe(i === audio.length - 1 ? 4 : 0);
    });
    expect(audio.length).toBeGreaterThan(1);
  });
  it('an empty recording still ends its stream', () => {
    const pages = readOgg(cat(oggOpus([])));
    expect(pages.length).toBe(3);
    expect(pages[2].flags).toBe(4);
  });
  it('the head is 19 bytes, mono, mapping family 0', () => {
    const b = opusHead(312, 48000);
    expect(b.length).toBe(19);
    expect(b[9]).toBe(1);
    expect(b[18]).toBe(0);
  });
});

describe('names', () => {
  it('names a clip by kind and time, and makes a safe file name', () => {
    const at = new Date(2026, 10, 11, 14, 5);
    const t = clipName('roll', at);
    expect(t.startsWith('Improvisation · ')).toBe(true);
    expect(t.endsWith('14:05')).toBe(true);
    expect(clipName('take', at).startsWith('Take · ')).toBe(true);
    expect(fileName(t, 'ogg')).not.toMatch(/[:·/\\]/);
    expect(fileName(t, 'ogg').endsWith('14.05.ogg')).toBe(true);
    expect(fileName('  ', 'wav')).toBe('Recording.wav');
    expect(clock(125.7)).toBe('2:05');
  });
});

describe('isAutoRec', () => {
  it('knows the last 20 minutes\' saves, old and new, from takes and other entries', () => {
    expect(isAutoRec({ source: 'autorec', title: 'x' })).toBe(true);
    expect(isAutoRec({ source: 'recorder', title: 'Improvisation · Wed 11 Nov 14:20' })).toBe(true);
    expect(isAutoRec({ source: 'recorder', title: 'Take · Wed 11 Nov 14:20' })).toBe(false);
    expect(isAutoRec({ source: '', title: 'Improvisation in D' })).toBe(false);
    expect(isAutoRec(null)).toBe(false);
  });
});
