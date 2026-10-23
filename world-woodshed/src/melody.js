/* World Woodshed — the melody under a Repertoire tune's changes (plain functions, test/melody.test.js).
   A melody is a list of notes { s, e, midi }: s and e in quarter notes from the start of bar 1, midi the
   sounding pitch, the same shape as a Write by playing draft (src/notate.js). The app's own melodies are
   written as text in src/content/tunes-melody.js; Pan's own come from Write by playing, a draft or score in
   the Library, or a MusicXML file, and are kept in state.melodies (packed as [s, e, midi] triples). */
import { KEYS } from './notation.js';
import { quantize, cleanDraft } from './notate.js';

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const EPS = 1e-6;
export const MAX_NOTES = 2000;

/* 'Bb4' → 70 (sounding pitch, C4 = 60) */
export function noteMidi(tok) {
  const m = /^([A-G])(b|#)?(-?\d)$/.exec(tok);
  if (!m) return null;
  return NOTE[m[1]] + (m[2] === 'b' ? -1 : m[2] === '#' ? 1 : 0) + (+m[3] + 1) * 12;
}

/* The text form, one bar between bars lines: 'D4:1 F4:.5 G4:2.5 | -:1 r:1 A4:2'. Each token is a note
   (pitch:quarters), a rest (r:quarters) or '-' (the note before held on). → { notes, bars: [quarters per bar], errors } */
export function parseMel(text) {
  const notes = [], bars = [], errors = [];
  let at = 0;
  String(text || '').split('|').forEach((bar, bi) => {
    const start = at;
    bar.trim().split(/\s+/).filter(Boolean).forEach(tok => {
      const [p, d] = tok.split(':'), q = +d;
      if (!(q > 0)) { errors.push('bar ' + (bi + 1) + ': ' + tok); return; }
      if (p === 'r') { at += q; return; }
      if (p === '-') {
        const last = notes[notes.length - 1];
        if (!last || Math.abs(last.e - at) > EPS) errors.push('bar ' + (bi + 1) + ': nothing to hold');
        else last.e += q;
        at += q; return;
      }
      const midi = noteMidi(p);
      if (midi === null) { errors.push('bar ' + (bi + 1) + ': ' + tok); return; }
      notes.push({ s: at, e: at + q, midi }); at += q;
    });
    bars.push(+(at - start).toFixed(6));
  });
  return { notes, bars, errors };
}

/* Notes packed for saving: [[s, e, midi]]; unpack checks everything (it may come from another device) */
const r3 = x => Math.round(x * 1000) / 1000;
export const packNotes = notes => notes.map(n => [r3(n.s), r3(n.e), n.midi]);
export function cleanMelody(m) {
  if (!m || typeof m !== 'object' || !Array.isArray(m.notes)) return null;
  const notes = m.notes.filter(x => Array.isArray(x) && x.length === 3 && x.every(v => typeof v === 'number' && isFinite(v)))
    .map(([s, e, midi]) => ({ s: Math.max(0, s), e: Math.max(Math.max(0, s) + 0.05, e), midi: Math.max(21, Math.min(108, Math.round(midi))) }))
    .sort((a, b) => a.s - b.s).slice(0, MAX_NOTES);
  if (!notes.length) return null;
  return { notes, from: typeof m.from === 'string' ? m.from.slice(0, 20) : '', name: typeof m.name === 'string' ? m.name.slice(0, 120) : '', updatedAt: +m.updatedAt || 0 };
}

/* Move every note by q quarters (a nudge to line the melody up with bar 1); notes moved before the start go */
export const shiftNotes = (notes, q) => notes.map(n => ({ s: r3(n.s + q), e: r3(n.e + q), midi: n.midi })).filter(n => n.s >= -EPS).map(n => Object.assign(n, { s: Math.max(0, n.s) }));
/* Start the melody on the bar line of bar 1 when the file begins with empty bars */
export function trimLead(notes, barQ = 4) {
  if (!notes.length) return notes;
  const empty = Math.floor(notes[0].s / barQ + EPS);
  return empty ? shiftNotes(notes, -empty * barQ) : notes;
}

/* The key signature to write a melody in: a key of a tune's harmony ('Bb', 'Gm', 'Ebm') moved by shift
   semitones, as a key notation.js knows (a minor key it lacks is written with its relative major's signature) */
export function staffKey(key, shift = 0) {
  const m = /^([A-G])(b|#)?(m?)$/.exec(key || '');
  if (!m) return 'C';
  const pc = ((NOTE[m[1]] + (m[2] === 'b' ? -1 : m[2] === '#' ? 1 : 0) + shift) % 12 + 24) % 12, minor = !!m[3];
  const hit = Object.keys(KEYS).find(k => KEYS[k].tonic === pc && !!KEYS[k].minor === minor);
  if (hit) return hit;
  const rel = (pc + (minor ? 3 : 0)) % 12;
  return Object.keys(KEYS).find(k => KEYS[k].tonic === rel && !KEYS[k].minor) || 'C';
}

/* Written an octave above sounding (as guitar music is) when the melody lies low, as a guitar recording does;
   at concert pitch, as on a lead sheet, when it lies in the treble staff */
export function writtenUp(notes) {
  if (!notes.length) return false;
  const m = notes.map(n => n.midi).sort((a, b) => a - b)[Math.floor(notes.length / 2)];
  return m < 62;
}

/* How to spell a note outside the key over a chord ({ root, sym, iv }): as the chord's own 3rd, 5th or 7th
   (F♯ over D7 even in F major, B♮ over Bdim7), else as the step it is above the root → '#', 'b' or undefined */
const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }, LETTERS = 'CDEFGAB';
export function spellOver(midi, c) {
  if (!c || !c.sym || !(c.sym[0] in LETTER_PC)) return undefined;
  const iv = ((midi - c.root) % 12 + 12) % 12, has = x => (c.iv || []).some(v => v % 12 === x);
  const steps = { 0: 0, 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: has(6) ? 4 : 3, 7: 4, 8: has(8) && !has(7) ? 4 : 5, 9: has(6) && !has(10) ? 6 : 5, 10: 6, 11: 6 }[iv]; // the ♭♭7 of a diminished 7th
  const letter = LETTERS[(LETTERS.indexOf(c.sym[0]) + steps) % 7];
  const alt = ((midi - LETTER_PC[letter]) % 12 + 12) % 12;
  return alt === 1 ? '#' : alt === 11 ? 'b' : undefined;
}

/* The melody as notation.js bars for nBars bars of 4/4, with the notes past the chart left out. chords (optional):
   the chart's chords per bar, to spell the notes outside the key the way the chords do.
   → { bars, cut: notes left out, up } */
export function melodyBars(notes, nBars, shift = 0, chords = null) {
  const end = nBars * 4;
  const inside = notes.filter(n => n.s < end - EPS).map(n => ({ s: n.s, e: Math.min(n.e, end), midi: n.midi + shift }));
  const up = writtenUp(inside);
  const grid = inside.every(n => Math.abs(n.s * 2 - Math.round(n.s * 2)) < EPS && Math.abs(n.e * 2 - Math.round(n.e * 2)) < EPS) ? 0.5 : 0.25;
  // quantize writes an octave up; take that back for a melody written at concert pitch
  const q = quantize({ notes: inside.map(n => ({ s: n.s, e: n.e, midi: up ? n.midi : n.midi - 12 })), time: '4/4', grid, hold: false }, { minBars: nBars });
  const bars = q.bars.slice(0, nBars);
  if (chords) bars.forEach((bar, bi) => bar.forEach(w => {
    const segs = chords[bi];
    if (w.midi == null || !segs || !segs.length) return;
    const sp = spellOver(w.midi, segs[Math.min(segs.length - 1, Math.floor((w.at - bi * 4 + EPS) * segs.length / 4))]);
    if (sp) w.spell = sp;
  }));
  return { bars, cut: notes.length - inside.length, up };
}

/* Notes by the beat they start on, for the band: Map(beat index from bar 1 → [note]) */
export function byBeat(notes) {
  const m = new Map();
  notes.forEach(n => { const b = Math.floor(n.s + EPS); if (!m.has(b)) m.set(b, []); m.get(b).push(n); });
  return m;
}

/* ---------- reading files ---------- */
/* A very small XML reader, enough for MusicXML: elements with attributes, children and text. */
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const unent = s => s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => (e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENT[e] ?? m));
export function parseXML(text) {
  const root = { name: '#root', attrs: {}, kids: [], text: '' };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<!\[CDATA\[([\s\S]*?)\]\]>|<\?[\s\S]*?\?>|<!DOCTYPE[^>[]*(\[[\s\S]*?\])?\s*>|<\/([\w:.-]+)\s*>|<([\w:.-]+)((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>|([^<]+)/g;
  let m;
  while ((m = re.exec(text))) {
    const top = stack[stack.length - 1];
    if (m[1] !== undefined) top.text += m[1];
    else if (m[3]) { if (stack.length > 1) stack.pop(); }
    else if (m[4]) {
      const attrs = {};
      (m[5] || '').replace(/([\w:.-]+)\s*=\s*("([^"]*)"|'([^']*)')/g, (x, k, v, a, b) => { attrs[k] = unent(a ?? b ?? ''); });
      const node = { name: m[4], attrs, kids: [], text: '' };
      top.kids.push(node);
      if (!m[6]) stack.push(node);
    } else if (m[7]) top.text += unent(m[7]);
  }
  return root;
}
const kid = (n, name) => n && n.kids.find(k => k.name === name);
const kids = (n, name) => (n ? n.kids.filter(k => k.name === name) : []);
const txt = (n, name) => { const k = kid(n, name); return k ? k.text.trim() : ''; };

/* The melody of a MusicXML score: the first part, its top staff and first voice, chords reduced to their
   top note, ties joined, grace notes left out. Pitches are sounding (a <transpose> is applied), as
   MuseScore writes guitar parts. → { notes, title, bpm, time, parts } or throws when it is not MusicXML */
export function fromMusicXML(text) {
  const doc = parseXML(text);
  const score = kid(doc, 'score-partwise');
  if (!score) throw new Error(kid(doc, 'score-timewise') ? 'This MusicXML is time-wise; export it from MuseScore again' : 'Not a MusicXML score');
  const parts = kids(score, 'part');
  const part = parts[0];
  if (!part) throw new Error('The score has no parts');
  const title = txt(kid(score, 'work'), 'work-title') || txt(score, 'movement-title');
  let div = 1, pos = 0, trans = 0, time = null, bpm = 0, voice = null, staff = null;
  const notes = [], open = new Map(); // midi → the note a tie continues
  kids(part, 'measure').forEach(meas => {
    let barStart = pos, far = pos;
    meas.kids.forEach(x => {
      if (x.name === 'attributes') {
        const d = +txt(x, 'divisions'); if (d > 0) div = d;
        const tr = kid(x, 'transpose'); if (tr) trans = (+txt(tr, 'chromatic') || 0) + 12 * (+txt(tr, 'octave-change') || 0);
        const t = kid(x, 'time'); if (t && !time) time = txt(t, 'beats') + '/' + txt(t, 'beat-type');
      } else if (x.name === 'direction' || x.name === 'sound') {
        const snd = x.name === 'sound' ? x : kid(x, 'sound');
        if (snd && +snd.attrs.tempo > 0 && !bpm) bpm = Math.round(+snd.attrs.tempo);
      } else if (x.name === 'backup') pos -= (+txt(x, 'duration') || 0) / div;
      else if (x.name === 'forward') pos += (+txt(x, 'duration') || 0) / div;
      else if (x.name === 'note') {
        if (kid(x, 'grace') || kid(x, 'cue')) return;
        const dur = (+txt(x, 'duration') || 0) / div, isChord = !!kid(x, 'chord');
        const v = txt(x, 'voice') || '1', st = txt(x, 'staff') || '1';
        if (voice === null && !kid(x, 'rest')) { voice = v; staff = st; }
        const mine = (voice === null || v === voice) && (staff === null || st === staff);
        const at = isChord ? pos - dur : pos;
        if (!isChord) pos += dur;
        far = Math.max(far, pos);
        const p = kid(x, 'pitch');
        if (!mine || !p) return;
        const step = txt(p, 'step'), oct = +txt(p, 'octave');
        if (!(step in NOTE) || !isFinite(oct)) return;
        const midi = NOTE[step] + Math.round(+txt(p, 'alter') || 0) + (oct + 1) * 12 + trans;
        const ties = kids(x, 'tie').map(t => t.attrs.type);
        const held = ties.includes('stop') && open.get(midi);
        if (isChord) { // keep the top note of a chord
          const last = notes[notes.length - 1];
          if (last && Math.abs(last.s - at) < EPS && midi > last.midi) { last.midi = midi; }
          return;
        }
        if (held && Math.abs(held.e - at) < 0.01) held.e = at + dur;
        else notes.push({ s: r3(at), e: r3(at + dur), midi });
        const n = held && Math.abs(held.e - (at + dur)) < 0.01 ? held : notes[notes.length - 1];
        if (ties.includes('start')) open.set(midi, n); else open.delete(midi);
      }
    });
    pos = Math.max(pos, far, barStart);
  });
  notes.forEach(n => { n.s = r3(n.s); n.e = r3(n.e); });
  return { notes: notes.filter(n => n.e > n.s).slice(0, MAX_NOTES), title, bpm, time: time || '4/4', parts: parts.length };
}

/* A Write by playing draft saved as .wwscore.json → its notes */
export function fromDraftJSON(text) {
  const v = JSON.parse(text);
  if (!v || v.kind !== 'wwscore') throw new Error('Not a Write by playing draft');
  const d = cleanDraft(v.draft);
  return { notes: d.notes, title: d.title, bpm: d.bpm, time: d.time };
}

/* The score inside a compressed MusicXML file (.mxl, a zip): the root file its container names, else the
   first .musicxml or .xml outside META-INF. Needs DecompressionStream for deflated entries. */
export async function unzipMxl(buf) {
  const b = new Uint8Array(buf), dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const files = new Map();
  let eocd = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 66000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('Not a .mxl file');
  let p = dv.getUint32(eocd + 16, true);
  const count = dv.getUint16(eocd + 10, true);
  for (let k = 0; k < count && dv.getUint32(p, true) === 0x02014b50; k++) {
    const method = dv.getUint16(p + 10, true), size = dv.getUint32(p + 20, true);
    const nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(b.subarray(p + 46, p + 46 + nl));
    files.set(name, { method, size, off });
    p += 46 + nl + xl + cl;
  }
  async function read(name) {
    const f = files.get(name);
    if (!f) return null;
    const lo = f.off, start = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true);
    const raw = b.subarray(start, start + f.size);
    if (f.method === 0) return new TextDecoder().decode(raw);
    if (f.method !== 8 || typeof DecompressionStream === 'undefined') throw new Error('This .mxl can’t be opened here; export it as uncompressed MusicXML');
    const out = new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw')));
    return out.text();
  }
  const container = await read('META-INF/container.xml');
  const rootfile = container ? (/full-path\s*=\s*"([^"]+)"/.exec(container) || [])[1] : null;
  const name = rootfile && files.has(rootfile) ? rootfile : [...files.keys()].find(n => !n.startsWith('META-INF') && /\.(musicxml|xml)$/i.test(n));
  if (!name) throw new Error('No score inside the .mxl file');
  return read(name);
}

/* Any melody file → { notes, title, bpm, time }: .wwscore.json, .mxl, .musicxml / .xml */
export async function readMelodyFile(name, blob) {
  const n = String(name || '').toLowerCase();
  if (n.endsWith('.json')) return fromDraftJSON(await blob.text());
  if (n.endsWith('.mxl')) return fromMusicXML(await unzipMxl(await blob.arrayBuffer()));
  return fromMusicXML(await blob.text());
}
export const MELODY_FILE = /\.(musicxml|xml|mxl|wwscore\.json)$/i;
