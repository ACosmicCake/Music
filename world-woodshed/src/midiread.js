/* World Woodshed — reading a Standard MIDI File into a Write by playing draft (src/notate.js), so the Library
   can show a MIDI file as notation and tab (through MusicXML) and play it. Pure functions, no DOM.

   A draft holds one line of notes, so where notes start together (a chord, or a melody over a bass) the
   highest one is kept: a guitar melody stays as it was, a piano piece comes out as its top line. Drums
   (channel 10) are left out. The first tempo, time signature and track name are used. */
import { okTime } from './notate.js';
import { parseTime } from './notation.js';

function reader(bytes) {
  let p = 0;
  return {
    get pos() { return p; }, set pos(v) { p = v; },
    left: () => bytes.length - p,
    u8: () => { if (p >= bytes.length) throw new Error('The MIDI file ends too early'); return bytes[p++]; },
    u16() { return (this.u8() << 8) | this.u8(); },
    u32() { return ((this.u8() << 24) >>> 0) + (this.u8() << 16) + (this.u8() << 8) + this.u8(); },
    str(n) { let s = ''; for (let i = 0; i < n; i++) s += String.fromCharCode(this.u8()); return s; },
    vlq() { let v = 0, b, k = 0; do { b = this.u8(); v = (v << 7) | (b & 0x7f); } while (b & 0x80 && ++k < 4); return v; },
    bytes(n) { const out = bytes.subarray(p, p + n); p += n; return out; }
  };
}

/* bytes (Uint8Array or ArrayBuffer) → { ppq, tempo (µs per quarter), time: [num, den] | null, name, notes: [{ tick, end, midi, ch }] } */
export function parseMidi(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const r = reader(bytes);
  if (r.str(4) !== 'MThd') throw new Error('This is not a MIDI file');
  const hlen = r.u32(), start = r.pos;
  r.u16(); const ntracks = r.u16(), division = r.u16();
  r.pos = start + hlen;
  if (division & 0x8000) throw new Error('MIDI files timed in SMPTE frames are not supported');
  const out = { ppq: division || 480, tempo: 500000, time: null, name: '', notes: [], tracks: [] };
  let tempoSet = false;
  for (let t = 0; t < ntracks && r.left() >= 8; t++) {
    const id = r.str(4), len = r.u32(), end = Math.min(bytes.length, r.pos + len);
    if (id !== 'MTrk') { r.pos = end; continue; }
    let tick = 0, status = 0, tname = '';
    const open = new Map(); // ch*128+key → [start ticks]
    while (r.pos < end) {
      tick += r.vlq();
      let b = r.u8();
      if (b === 0xff) {
        const type = r.u8(), n = r.vlq(), data = r.bytes(n);
        if (type === 0x51 && n === 3 && !tempoSet) { out.tempo = (data[0] << 16) | (data[1] << 8) | data[2]; tempoSet = true; }
        else if (type === 0x58 && n >= 2 && !out.time) out.time = [data[0], 2 ** data[1]];
        else if (type === 0x03) { const nm = new TextDecoder().decode(data).trim(); if (!out.name) out.name = nm; if (!tname) tname = nm; }
        else if (type === 0x2f) break;
        continue;
      }
      if (b === 0xf0 || b === 0xf7) { r.pos += r.vlq(); continue; }
      if (b & 0x80) status = b; else { if (!status) throw new Error('The MIDI file is damaged'); r.pos--; b = status; }
      const kind = status & 0xf0, ch = status & 0x0f;
      const d1 = r.u8(), d2 = kind === 0xc0 || kind === 0xd0 ? 0 : r.u8();
      const k = ch * 128 + d1;
      if (kind === 0x90 && d2 > 0) { if (!open.has(k)) open.set(k, []); open.get(k).push(tick); }
      else if (kind === 0x80 || (kind === 0x90 && d2 === 0)) {
        const starts = open.get(k);
        if (starts && starts.length) { const s = starts.shift(); if (ch !== 9 && tick > s) out.notes.push({ tick: s, end: tick, midi: d1, ch, trk: t }); }
      }
    }
    out.tracks[t] = tname;
    r.pos = end;
  }
  out.notes.sort((a, b) => a.tick - b.tick || b.midi - a.midi);
  return out;
}

/* The lines a MIDI file holds, for a picker: [{ id: 'track:channel', name, n (notes), low (median pitch) }],
   each track and channel with notes (drums left out), in file order */
export function midiLines(m) {
  const by = new Map();
  m.notes.forEach(n => {
    const id = (n.trk || 0) + ':' + n.ch;
    if (!by.has(id)) by.set(id, { id, trk: n.trk || 0, ch: n.ch, pitches: [] });
    by.get(id).pitches.push(n.midi);
  });
  const lines = [...by.values()].sort((a, b) => a.trk - b.trk || a.ch - b.ch);
  const sameTrack = t => lines.filter(l => l.trk === t).length > 1;
  return lines.map((l, k) => {
    const ps = l.pitches.sort((a, b) => a - b);
    const nm = (m.tracks && m.tracks[l.trk]) || 'Line ' + (k + 1);
    return { id: l.id, name: sameTrack(l.trk) ? nm + ' (channel ' + (l.ch + 1) + ')' : nm, n: ps.length, low: ps[ps.length >> 1] };
  });
}
/* the clef a line of sounding pitches reads best in: bass when most of it lies below the G under middle C
   (a bass line, a piano's left hand); a guitar melody, written an octave up, stays in the treble clef */
export const clefFor = pitches => {
  const ps = [...pitches].sort((a, b) => a - b);
  return ps.length && ps[ps.length >> 1] < 50 ? 'bass' : 'treble';
};

/* A parsed MIDI file → a draft for src/notate.js (toMusicXML, toMidi); `line` ('track:channel', from
   midiLines) keeps only that line */
export function midiToDraft(m, title = '', line = null) {
  const q = m.ppq, notes = [];
  let lastStart = -1;
  (line ? m.notes.filter(n => (n.trk || 0) + ':' + n.ch === line) : m.notes).forEach(n => {
    const s = n.tick / q, e = n.end / q;
    if (Math.abs(s - lastStart) < 1 / 16) return; // started with a higher note (sorted highest first): keep the top line
    lastStart = s;
    notes.push({ s, e, midi: Math.max(21, Math.min(108, n.midi)) });
  });
  const t0 = m.time ? m.time[0] + '/' + m.time[1] : '4/4', time = okTime(t0) ? t0 : '4/4';
  // a draft's tempo counts its beats (a dotted quarter in 6/8), MIDI's counts quarters
  const bpm = Math.round(Math.max(30, Math.min(260, 60e6 / (m.tempo || 500000) / parseTime(time).beatQ)));
  return { title: (title || m.name || '').slice(0, 120), bpm, time, key: 'auto', grid: 0.25, hold: true, notes };
}
