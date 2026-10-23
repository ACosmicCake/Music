import { describe, it, expect } from 'vitest';
import { deflateRawSync } from 'node:zlib';
import D from '../src/data.js';
import MEL from '../src/content/tunes-melody.js';
import { parseChord } from '../src/theory.js';
import { noteMidi, spellOver, parseMel, cleanMelody, packNotes, shiftNotes, trimLead, staffKey, melodyBars, byBeat, fromMusicXML, fromDraftJSON, unzipMxl, readMelodyFile } from '../src/melody.js';
import { toMusicXML, snapNotes, DEFAULT_DRAFT } from '../src/notate.js';
import { KEYS, durQ } from '../src/notation.js';
import { merge, migrate } from '../src/sync.js';

/* The melody under a Repertoire tune's changes (src/melody.js): the app's own melodies, Pan's from files. */

describe('the text form', () => {
  it('reads notes, rests and held notes bar by bar', () => {
    expect(noteMidi('C4')).toBe(60);
    expect(noteMidi('Bb3')).toBe(58);
    expect(noteMidi('F#5')).toBe(78);
    const p = parseMel('C4:1 r:1 E4:2 | -:1 G4:.5 r:2.5');
    expect(p.errors).toEqual([]);
    expect(p.bars).toEqual([4, 4]);
    expect(p.notes).toEqual([{ s: 0, e: 1, midi: 60 }, { s: 2, e: 5, midi: 64 }, { s: 5, e: 5.5, midi: 67 }]);
    expect(parseMel('H4:1 | -:1').errors.length).toBe(2);
  });
});

describe('the app’s own melodies', () => {
  it('belong to tunes and fill every bar of the chart with four beats', () => {
    for (const [id, m] of Object.entries(MEL)) {
      const t = D.TUNES.find(x => x.id === id);
      expect(t, id).toBeTruthy();
      const p = parseMel(m.mel);
      expect(p.errors, id).toEqual([]);
      expect(p.bars.length, id).toBe(t.bars.length);
      p.bars.forEach((q, bi) => expect(q, id + ' bar ' + (bi + 1)).toBeCloseTo(4, 6));
      expect(KEYS[m.key], id).toBeTruthy();
      // a melody's range: written in the treble staff at concert pitch, up to two ledger lines
      p.notes.forEach(n => { expect(n.midi, id).toBeGreaterThanOrEqual(60); expect(n.midi, id).toBeLessThanOrEqual(84); });
    }
  });
  it('is written as a lead sheet, bar for bar', () => {
    for (const [id, m] of Object.entries(MEL)) {
      const t = D.TUNES.find(x => x.id === id), p = parseMel(m.mel);
      const lay = melodyBars(p.notes, t.bars.length);
      expect(lay.bars.length, id).toBe(t.bars.length);
      expect(lay.cut).toBe(0);
      lay.bars.forEach(bar => expect(bar.length === 1 && bar[0].full ? 4 : bar.reduce((a, n) => a + durQ(n), 0), id).toBeCloseTo(4, 6));
    }
  });
  it('leaves out the standards still under copyright', () => {
    ['autumn', 'bluebossa', 'summertime', 'flyme', 'satin', 'atrain', 'sowhat', 'atttya', 'solar', 'giant'].forEach(id => expect(MEL[id], id).toBeUndefined());
  });
});

describe('placing and saving a melody', () => {
  it('writes low melodies an octave up, as guitar music, and cuts what runs past the chart', () => {
    const low = [{ s: 0, e: 1, midi: 52 }, { s: 1, e: 2, midi: 55 }, { s: 8, e: 9, midi: 57 }];
    const lay = melodyBars(low, 2);
    expect(lay.up).toBe(true);
    expect(lay.cut).toBe(1);
    expect(lay.bars[0][0].midi).toBe(64); // written E4 for the sounding E3
    expect(melodyBars([{ s: 0, e: 4, midi: 72 }], 1).bars[0][0].midi).toBe(72); // concert pitch
  });
  it('moves notes, starts at bar 1 and sorts notes by beat', () => {
    const n = [{ s: 8.5, e: 9, midi: 60 }, { s: 9, e: 10, midi: 62 }];
    expect(trimLead(n)).toEqual([{ s: 0.5, e: 1, midi: 60 }, { s: 1, e: 2, midi: 62 }]);
    expect(shiftNotes(n, -8.75)).toEqual([{ s: 0.25, e: 1.25, midi: 62 }]);
    expect([...byBeat(trimLead(n)).keys()]).toEqual([0, 1]);
  });
  it('checks a saved melody from another device', () => {
    expect(cleanMelody(null)).toBe(null);
    expect(cleanMelody({ notes: [] })).toBe(null);
    const m = cleanMelody({ notes: [[1, 2, 60], ['x', 1, 2], [0, -1, 200]], name: 7, from: 'file' });
    expect(m.notes).toEqual([{ s: 0, e: 0.05, midi: 108 }, { s: 1, e: 2, midi: 60 }]);
    expect(m.name).toBe('');
    expect(packNotes([{ s: 1 / 3, e: 1, midi: 60 }])).toEqual([[0.333, 1, 60]]);
  });
  it('spells notes outside the key as the chord does', () => {
    const c = sym => parseChord(sym);
    expect(spellOver(66, c('D7'))).toBe('#'); // F♯, the 3rd of D7
    expect(spellOver(68, c('Bdim7'))).toBe('b'); // A♭, its diminished 7th
    expect(spellOver(61, c('Bb7'))).toBe('b'); // D♭ over B♭7, a minor 3rd above the root
    expect(spellOver(68, c('E7'))).toBe('#'); // G♯
    expect(spellOver(70, c('Am7b5'))).toBe('b'); // B♭, the ♭9
    const lay = melodyBars([{ s: 0, e: 4, midi: 66 }], 1, 0, [[c('D7')]]);
    expect(lay.bars[0][0].spell).toBe('#');
  });
  it('writes each key signature it can, the relative major’s otherwise', () => {
    expect(staffKey('Bb')).toBe('Bb');
    expect(staffKey('Gm')).toBe('Gm');
    expect(staffKey('Gm', 2)).toBe('Am');
    expect(staffKey('Ebm')).toBe('F#'); // G♭ major's six flats, written as F♯ major's six sharps
    expect(staffKey('nonsense')).toBe('C');
  });
});

describe('reading files', () => {
  const draft = Object.assign(DEFAULT_DRAFT(), { title: 'Line & co', bpm: 96, notes: [[0, 1, 64], [1, 1.5, 67], [1.5, 3, 69], [3, 6, 72], [7, 7.5, 71]].map(([s, e, midi]) => ({ s, e, midi })) });
  it('reads back the MusicXML that Write by playing writes, tab staff and ties included', () => {
    const xml = toMusicXML(draft);
    const got = fromMusicXML(xml);
    expect(got.title).toBe('Line & co');
    expect(got.bpm).toBe(96);
    expect(got.time).toBe('4/4');
    expect(got.notes).toEqual(snapNotes(draft).map(({ s, e, midi }) => ({ s, e, midi })));
  });
  it('applies a transposing part, keeps the top note of a chord and skips grace notes', () => {
    const xml = `<?xml version="1.0"?><score-partwise><part-list/><part id="P1"><measure number="1">
      <attributes><divisions>2</divisions><transpose><chromatic>-2</chromatic></transpose><time><beats>4</beats><beat-type>4</beat-type></time></attributes>
      <note><grace/><pitch><step>B</step><octave>4</octave></pitch><type>eighth</type></note>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>4</duration></note>
      <note><chord/><pitch><step>E</step><octave>5</octave></pitch><duration>4</duration></note>
      <note><rest/><duration>2</duration></note>
      <note><pitch><step>D</step><alter>1</alter><octave>5</octave></pitch><duration>2</duration></note>
      </measure></part></score-partwise>`;
    expect(fromMusicXML(xml).notes).toEqual([{ s: 0, e: 2, midi: 74 }, { s: 3, e: 4, midi: 73 }]);
    expect(() => fromMusicXML('<html></html>')).toThrow();
  });
  it('reads a Write by playing draft and a compressed .mxl', async () => {
    const json = JSON.stringify({ app: 'world-woodshed', kind: 'wwscore', v: 1, draft });
    expect(fromDraftJSON(json).notes.length).toBe(5);
    expect(() => fromDraftJSON('{"kind":"other"}')).toThrow();
    const xml = toMusicXML(draft);
    for (const deflate of [false, true]) {
      const zip = makeZip([['META-INF/container.xml', '<container><rootfiles><rootfile full-path="score.xml"/></rootfiles></container>'], ['score.xml', xml]], deflate);
      expect(await unzipMxl(zip)).toBe(xml);
      const got = await readMelodyFile('Line.mxl', new Blob([zip]));
      expect(got.notes.length).toBe(snapNotes(draft).length);
    }
  });
});

describe('saved melodies across devices', () => {
  it('migrate adds an empty list; merge keeps the newer melody and a removal', () => {
    expect(migrate({ schema: 6 }).melodies).toEqual({});
    const a = { updatedAt: 1, melodies: { autumn: { notes: [[0, 1, 60]], updatedAt: 5 }, solar: { notes: [[0, 1, 62]], updatedAt: 5 } }, tomb: {} };
    const b = { updatedAt: 2, melodies: { autumn: { notes: [[0, 2, 67]], updatedAt: 9 } }, tomb: { 'mel:solar': 7 } };
    const m = merge(a, b);
    expect(m.melodies.autumn.notes).toEqual([[0, 2, 67]]);
    expect(m.melodies.solar).toBeUndefined();
  });
});

/* A zip with each file stored or deflated, the way MuseScore writes an .mxl */
function makeZip(files, deflate) {
  const enc = new TextEncoder(), local = [], central = [];
  let off = 0;
  files.forEach(([name, text]) => {
    const nb = enc.encode(name), raw = enc.encode(text), data = deflate ? new Uint8Array(deflateRawSync(raw)) : raw;
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(8, deflate ? 8 : 0, true);
    lh.setUint32(18, data.length, true); lh.setUint32(22, raw.length, true); lh.setUint16(26, nb.length, true);
    local.push(new Uint8Array(lh.buffer), nb, data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(10, deflate ? 8 : 0, true);
    ch.setUint32(20, data.length, true); ch.setUint32(24, raw.length, true); ch.setUint16(28, nb.length, true); ch.setUint32(42, off, true);
    central.push(new Uint8Array(ch.buffer), nb);
    off += 30 + nb.length + data.length;
  });
  const cdSize = central.reduce((a, x) => a + x.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, cdSize, true); end.setUint32(16, off, true);
  const parts = [...local, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(parts.reduce((a, x) => a + x.length, 0));
  let p = 0; parts.forEach(x => { out.set(x, p); p += x.length; });
  return out.buffer;
}
