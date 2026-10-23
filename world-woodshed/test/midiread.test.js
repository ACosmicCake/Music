import { describe, it, expect } from 'vitest';
import { parseMidi, midiToDraft } from '../src/midiread.js';
import { toMidi, toMusicXML } from '../src/notate.js';

/* Reading MIDI files back into a draft (src/midiread.js), so the Library can show and play them */
const draft = { title: 'Riff', bpm: 96, time: '3/4', key: 'auto', grid: 0.25, hold: true, notes: [{ s: 0, e: 1, midi: 64 }, { s: 1, e: 1.5, midi: 67 }, { s: 1.5, e: 3, midi: 69 }, { s: 3, e: 6, midi: 71 }] };
const bytes = (...b) => new Uint8Array(b.flat(Infinity));
const u32 = n => [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];
const smf = (ppq, ...tracks) => bytes([0x4d, 0x54, 0x68, 0x64], u32(6), [0, 1, 0, tracks.length, ppq >> 8, ppq & 0xff],
  tracks.map(t => [[0x4d, 0x54, 0x72, 0x6b], u32(t.length), t]));

describe('reading MIDI', () => {
  it('reads back what Write by playing writes: notes, tempo, time and title', () => {
    const m = parseMidi(toMidi(draft));
    expect(m.name).toBe('Riff');
    expect(m.time).toEqual([3, 4]);
    const d = midiToDraft(m);
    expect(d).toMatchObject({ title: 'Riff', bpm: 96, time: '3/4' });
    expect(d.notes).toEqual(draft.notes);
  });
  it('keeps a 6/8 tempo in dotted quarters', () => {
    const d = midiToDraft(parseMidi(toMidi(Object.assign({}, draft, { time: '6/8', bpm: 60 }))));
    expect(d.time).toBe('6/8');
    expect(d.bpm).toBe(60);
  });
  it('keeps the top line of chords, leaves the drums out, and follows running status and note-on velocity 0', () => {
    // one track, ppq 4: a C major chord, then (running status) E with a 0-velocity note off, and a drum hit
    const t = [0, 0x90, 60, 80, 0, 64, 80, 0, 67, 80, 4, 60, 0, 0, 64, 0, 0, 67, 0, 0, 76, 90, 2, 76, 0, 0, 0x99, 36, 100, 1, 0x89, 36, 0, 0, 0xff, 0x2f, 0];
    const d = midiToDraft(parseMidi(smf(4, t)), 'Chords');
    expect(d.notes).toEqual([{ s: 0, e: 1, midi: 67 }, { s: 1, e: 1.5, midi: 76 }]);
    expect(d).toMatchObject({ title: 'Chords', bpm: 120, time: '4/4' });
  });
  it('joins notes from several tracks, and turns away what is not MIDI', () => {
    const a = [0, 0x90, 60, 80, 4, 0x80, 60, 0, 0, 0xff, 0x2f, 0];
    const b = [4, 0x91, 62, 80, 4, 0x81, 62, 0, 0, 0xff, 0x2f, 0];
    expect(midiToDraft(parseMidi(smf(4, a, b))).notes.map(n => n.midi)).toEqual([60, 62]);
    expect(() => parseMidi(new TextEncoder().encode('<score-partwise/>'))).toThrow(/not a MIDI file/);
  });
  it('makes MusicXML a score reader can open', () => {
    const xml = toMusicXML(midiToDraft(parseMidi(toMidi(draft))));
    expect(xml).toContain('<score-partwise');
    expect((xml.match(/<note>/g) || []).length).toBeGreaterThanOrEqual(4);
  });
});
