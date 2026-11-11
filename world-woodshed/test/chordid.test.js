import { describe, it, expect } from 'vitest';
import { nameChord, hearNotes, spectrum, tuningOf, peaksOf, ChordEar, CHORD_TYPES, spellTone } from '../src/chordid.js';

const SR = 48000;
const top = (notes, bass) => (nameChord(notes, bass)[0] || {}).sym;
// a plucked-string stand-in: harmonics falling off, a little stretched, with a fast decay
function strum(midis, len = 1.2, opts = {}) {
  const x = new Float32Array(Math.round(len * SR));
  midis.forEach((m, k) => {
    const f0 = 440 * Math.pow(2, (m - 69 + (opts.cents || 0) / 100) / 12), t0 = Math.round((0.1 + k * 0.012) * SR);
    for (let hh = 1; hh <= 10; hh++) {
      const f = hh * f0 * Math.sqrt(1 + 0.0001 * hh * hh); if (f > SR / 2) break;
      const a = Math.pow(0.7, hh - 1) * (hh === 1 && m < 48 ? 0.4 : 1);
      for (let i = t0; i < x.length; i++) x[i] += a * Math.sin(2 * Math.PI * f * (i - t0) / SR) * Math.exp(-(i - t0) / SR / 1.2) * 0.1;
    }
  });
  return x;
}

describe('naming chords from notes', () => {
  it('names triads, sevenths and their inversions', () => {
    expect(top([48, 52, 55])).toBe('C');
    expect(top([45, 48, 52])).toBe('Am');
    expect(top([52, 55, 60])).toBe('C/E');
    expect(nameChord([52, 55, 60])[0].inversion).toBe('1st inversion');
    expect(top([55, 60, 64])).toBe('C/G');
    expect(top([43, 50, 53, 59])).toBe('G7');
    expect(top([48, 52, 55, 59])).toBe('Cmaj7');
    expect(top([50, 53, 56, 60])).toBe('Dm7♭5');
  });
  it('names open guitar shapes', () => {
    expect(top([48, 52, 55, 60, 64])).toBe('C');          // x32010
    expect(top([43, 47, 50, 55, 59, 67])).toBe('G');      // 320003
    expect(top([40, 47, 52, 56, 59, 64])).toBe('E');      // 022100
    expect(top([45, 52, 57, 60, 64])).toBe('Am');         // x02210
    expect(top([45, 52, 55, 61, 64])).toBe('A7');         // x02020
    expect(top([50, 57, 62, 65])).toBe('Dm');             // xx0231
  });
  it('lets the fifth go, as guitarists do', () => {
    const c7 = nameChord([48, 52, 58])[0];                // C E B♭
    expect(c7.sym).toBe('C7');
    expect(c7.missing).toEqual(['5']);
    expect(c7.exact).toBe(false);
  });
  it('prefers a triad in inversion to a sixth chord missing its fifth', () => {
    expect(top([58, 62, 67])).toBe('Gm/B♭');               // B♭ D G
  });
  it('gives the other names of the same notes', () => {
    const syms = nameChord([45, 52, 55, 60]).map(c => c.sym); // A E G C
    expect(syms[0]).toBe('Am7');
    expect(syms).toContain('C6/A');
  });
  it('names a slash chord over a bass that is not in the chord', () => {
    expect(top([50, 55, 59, 62, 67])).toBe('G/D');
    const cOverD = nameChord([50, 60, 64, 67]).slice(0, 2).map(c => c.sym); // C over D: the bass is no chord tone
    expect(cOverD).toContain('C/D');
    expect(cOverD).toContain('D9sus4');                    // what a jazz player may call it
  });
  it('spells chord tones by their degree', () => {
    const b7 = nameChord([46, 53, 58, 62, 68])[0];       // B♭ F B♭ D A♭
    expect(b7.sym).toBe('B♭7');
    expect(b7.tones.map(t => t.name)).toEqual(['B♭', 'D', 'F', 'A♭']);
    expect(spellTone('F♯', 6, 3, '♭3')).toBe('A');
    expect(spellTone('E♭', 3, 9, '𝄫7')).toBe('C');
    expect(top([49, 52, 56])).toBe('C♯m');
  });
  it('needs two different notes, and every chord type has a name per tone', () => {
    expect(nameChord([60])).toEqual([]);
    expect(nameChord([48, 60])).toEqual([]);
    expect(top([40, 47])).toBe('E5');
    CHORD_TYPES.forEach(t => expect(t.deg.length).toBe(t.iv.length));
    expect(new Set(CHORD_TYPES.map(t => t.q)).size).toBe(CHORD_TYPES.length);
  });
});

describe('hearing a strum', () => {
  const pcs = notes => [...new Set(notes.map(n => ((n.midi % 12) + 12) % 12))].sort((a, b) => a - b);
  it('finds the notes of a chord in one spectrum, the bass too', () => {
    for (const [ms, want] of [[[48, 52, 55, 60, 64], [0, 4, 7]], [[45, 52, 57, 60, 64], [0, 4, 9]], [[43, 47, 50, 55, 59, 67], [2, 7, 11]], [[40, 47, 52, 55, 59, 64], [4, 7, 11]]]) {
      const x = strum(ms), N = 8192, o = Math.round(0.3 * SR);
      const notes = hearNotes(spectrum(x.subarray(o, o + N)), SR, N);
      expect(pcs(notes)).toEqual(want);
      expect(notes[0].midi % 12).toBe(ms[0] % 12);
    }
  });
  it('finds how far the guitar is from A440', () => {
    const x = strum([45, 52, 57, 61, 64], 1, { cents: 18 }), N = 8192, o = Math.round(0.3 * SR);
    expect(Math.abs(tuningOf(peaksOf(spectrum(x.subarray(o, o + N)), SR, N)) - 18)).toBeLessThan(6);
  });
  it('names chords strummed one after another', () => {
    const chords = [[48, 52, 55, 60, 64], [45, 52, 57, 60, 64], [41, 48, 53, 57, 60, 65], [43, 47, 50, 55, 59, 67]];
    const x = new Float32Array(SR * 6);
    chords.forEach((ms, i) => { const c = strum(ms, 1.4), at = Math.round(i * 1.4 * SR); for (let k = 0; k < c.length && at + k < x.length; k++) x[at + k] += c[k]; });
    const heard = [];
    const ear = ChordEar(SR, { onChord: c => heard.push(c) });
    for (let i = 0; i < x.length; i += 512) {
      const t0 = i / SR;
      chords.forEach((_, ci) => { const s = ci * 1.4 + 0.1; if (s >= t0 && s < t0 + 512 / SR) ear.strum(s); });
      ear.push(x.subarray(i, i + 512), t0);
    }
    const names = chords.map((_, ci) => heard.filter(c => c.t > ci * 1.4 && c.t < (ci + 1) * 1.4).map(c => c.names[0] && c.names[0].sym));
    expect(names.map(n => n[n.length - 1])).toEqual(['C', 'Am', 'F', 'G']);
  });
});
