import { describe, it, expect } from 'vitest';
import { quantize, snapNotes, splitSpan, takeNotes, guessKey, placeFrets, toMusicXML, toMidi, cleanDraft, fileBase, DEFAULT_DRAFT } from '../src/notate.js';
import { parseTime, durQ } from '../src/notation.js';

/* Write by playing (src/notate.js): played notes to bars, keys, frets and files for MuseScore */

const draft = (notes, o = {}) => Object.assign(DEFAULT_DRAFT(), { notes: notes.map(([s, e, midi]) => ({ s, e, midi })) }, o);
const written = bars => bars.map(bar => bar.map(n => (n.midi == null ? 'r' : n.midi - 12) + n.dur + (n.dot ? '.' : '') + (n.tie ? '~' : '')).join(' '));
const barLen = (bar, ts) => (bar.length === 1 && bar[0].full ? ts.barQ : bar.reduce((a, n) => a + durQ(n), 0));

describe('takeNotes', () => {
  it('turns mic times into beats from the first downbeat, minus the mic delay', () => {
    const ev = [{ t: 10.05, end: 10.5, midi: 59.8 }, { t: 10.55, end: 11.1, midi: 62.1 }, { t: 9.2, end: 9.4, midi: 64 }];
    const out = takeNotes(ev, { bpm: 120, time: '4/4', t0: 10, lat: 0.05 });
    expect(out).toEqual([{ s: 0, e: 0.9, midi: 60 }, { s: 1, e: 2.1, midi: 62 }]); // the count-in note is dropped
  });
  it('appends after earlier takes and counts dotted-quarter beats in 6/8', () => {
    const out = takeNotes([{ t: 1, end: 1.5, midi: 60 }], { bpm: 60, time: '6/8', t0: 0, at: 6 });
    expect(out[0]).toEqual({ s: 7.5, e: 8.25, midi: 60 });
  });
});

describe('snapNotes', () => {
  it('snaps to the grid, keeps the longer of two attacks on one point and holds notes over short gaps', () => {
    const d = draft([[0.02, 0.4, 60], [0.06, 0.2, 61], [1.02, 1.6, 62], [3, 3.4, 64]]);
    expect(snapNotes(d).map(n => [n.s, n.e, n.midi])).toEqual([[0, 1, 60], [1, 1.5, 62], [3, 3.5, 64]]);
    expect(snapNotes(Object.assign(d, { hold: false })).map(n => [n.s, n.e])).toEqual([[0, 0.5], [1, 1.5], [3, 3.5]]);
  });
  it('cuts a note that rings into the next one', () => {
    expect(snapNotes(draft([[0, 3, 60], [1, 2, 62]])).map(n => n.e)).toEqual([1, 2]);
  });
});

describe('splitSpan', () => {
  const ts4 = parseTime('4/4'), ts68 = parseTime('6/8');
  const vals = (a, b, rest, ts) => splitSpan(a, b, rest, ts).map(x => x.dur + (x.dot ? '.' : ''));
  it('writes long notes from the downbeat whole', () => {
    expect(vals(0, 4, false, ts4)).toEqual(['w']);
    expect(vals(0, 3, false, ts4)).toEqual(['h.']);
    expect(vals(0, 1.5, false, ts4)).toEqual(['q.']);
  });
  it('never crosses the middle of a 4/4 bar from an off beat', () => {
    expect(vals(1, 4, false, ts4)).toEqual(['q', 'h']);
    expect(vals(1, 3, false, ts4)).toEqual(['q', 'q']);
    expect(vals(1, 3.5, false, ts4)).toEqual(['q', 'q.']);
    expect(vals(0.5, 2, false, ts4)).toEqual(['8', 'q']);
  });
  it('keeps short notes inside a beat', () => {
    expect(vals(0.25, 1, false, ts4)).toEqual(['8.']);
    expect(vals(0.75, 1.5, false, ts4)).toEqual(['16', '8']);
  });
  it('does not dot rests in simple time', () => {
    expect(vals(0, 1.5, true, ts4)).toEqual(['q', '8']);
    expect(vals(0, 3, true, ts4)).toEqual(['h', 'q']);
  });
  it('groups 6/8 in dotted quarters', () => {
    expect(vals(0, 3, false, ts68)).toEqual(['h.']);
    expect(vals(0, 2, false, ts68)).toEqual(['q.', '8']);
    expect(vals(0, 1.5, true, ts68)).toEqual(['q.']);
    expect(vals(1, 3, false, ts68)).toEqual(['8', 'q.']);
  });
});

describe('quantize', () => {
  it('fills bars with notes, rests and ties across the bar line', () => {
    const q = quantize(draft([[0, 1, 64], [1, 2, 62], [2, 5, 60], [6, 6.5, 67]]));
    expect(written(q.bars)).toEqual(['64q 62q 60h~', '60q rq 678 r8 rq']);
    q.bars.forEach(b => expect(barLen(b, q.ts)).toBeCloseTo(4));
    expect(q.bars[0][2].src).toBe(2);
  });
  it('writes a whole bar of silence as one full-bar rest', () => {
    const q = quantize(draft([[0, 1, 60], [8, 9, 62]], { time: '3/4' }));
    expect(q.bars.length).toBe(3);
    expect(q.bars[1]).toEqual([{ midi: null, dur: 'w', src: -1, at: 3, full: true }]);
    q.bars.forEach(b => expect(barLen(b, q.ts)).toBeCloseTo(3));
  });
  it('fills every bar exactly for random playing in every meter and grid', () => {
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (const time of ['4/4', '3/4', '2/4', '6/8', '12/8']) {
      for (const grid of [0.25, 0.5]) {
        for (let k = 0; k < 20; k++) {
          const notes = [];
          let t = rnd() * 2;
          for (let i = 0; i < 30; i++) { const len = 0.1 + rnd() * 2; notes.push([t, t + len, 45 + Math.floor(rnd() * 30)]); t += len * (rnd() < 0.3 ? 2 : 1) + rnd() * 0.3; }
          const d = draft(notes, { time, grid, hold: rnd() < 0.5 });
          const q = quantize(d);
          q.bars.forEach(b => expect(barLen(b, q.ts)).toBeCloseTo(q.ts.barQ));
          // every note's written pieces add up to its snapped length
          const lens = {};
          q.bars.flat().forEach(n => { if (n.src >= 0) lens[n.src] = (lens[n.src] || 0) + durQ(n); });
          q.notes.forEach(n => expect(lens[n.src]).toBeCloseTo(n.e - n.s));
        }
      }
    }
  });
});

describe('guessKey', () => {
  const scale = (root, steps) => steps.map((x, i) => ({ s: i, e: i + 1, midi: root + x }));
  it('finds major and minor keys from a melody', () => {
    expect(guessKey(scale(55, [0, 2, 4, 5, 7, 9, 11, 12, 7, 4, 0]))).toBe('G');
    expect(guessKey(scale(57, [0, 2, 3, 5, 7, 8, 7, 5, 3, 2, 0, -5, 0]))).toBe('Am');
    expect(guessKey(scale(58, [0, 2, 4, 5, 7, 4, 0]))).toBe('Bb');
    expect(guessKey([])).toBe('C');
  });
});

describe('placeFrets', () => {
  const STD = [40, 45, 50, 55, 59, 64];
  it('plays an open-position C major scale in open position', () => {
    const p = placeFrets([48, 50, 52, 53, 55, 57, 59, 60], STD);
    expect(p.map(x => x.f)).toEqual([3, 0, 2, 3, 0, 2, 0, 1]);
    expect(p.map(x => x.si)).toEqual([1, 2, 2, 2, 3, 3, 4, 4]);
  });
  it('keeps a phrase under one hand position', () => {
    const p = placeFrets([64, 66, 67, 69, 71, 72, 71, 69], STD);
    const fretted = p.map(x => x.f).filter(f => f > 0);
    expect(Math.max(...fretted) - Math.min(...fretted)).toBeLessThanOrEqual(3);
  });
  it('stays up the neck for a high phrase and marks notes out of reach', () => {
    const p = placeFrets([76, 79, 81, 79, 76, 30], STD);
    p.slice(0, 5).forEach(x => expect(x.f).toBeGreaterThanOrEqual(5));
    expect(p[5]).toBeNull();
  });
});

describe('MusicXML', () => {
  const d = draft([[0, 1, 64], [1, 2, 66], [2, 5, 67], [5, 6, 71]], { title: 'Tom & Jerry <3', bpm: 96 });
  const xml = toMusicXML(d, { date: '2026-10-22' });
  it('writes a guitar part MuseScore reads: treble 8vb, tab staff, tempo, escaped title', () => {
    expect(xml).toContain('<work-title>Tom &amp; Jerry &lt;3</work-title>');
    expect(xml).toContain('<clef-octave-change>-1</clef-octave-change>');
    expect(xml).toContain('<sign>TAB</sign>');
    expect(xml).toContain('<per-minute>96</per-minute>');
    expect(xml).toContain('<sound tempo="96"/>');
    expect(xml).toContain('<fifths>1</fifths>'); // G major: F sharp, no accidental needed
    expect(xml).not.toContain('<accidental>');
    expect((xml.match(/<staff-tuning /g) || []).length).toBe(6);
  });
  it('writes sounding pitches, ties and frets', () => {
    expect(xml).toContain('<pitch><step>E</step><octave>4</octave></pitch>'); // midi 64
    expect(xml).toContain('<pitch><step>F</step><alter>1</alter><octave>4</octave></pitch>');
    expect((xml.match(/<tie type="start"\/>/g) || []).length).toBe(2); // G half tied to a quarter, once per staff
    expect(xml).toMatch(/<technical><string>\d<\/string><fret>\d+<\/fret><\/technical>/);
    expect(xml).toContain('<bar-style>light-heavy</bar-style>');
  });
  it('balances every measure on both staves', () => {
    const measures = xml.split('<measure ').slice(1);
    measures.forEach(m => {
      const back = +(m.match(/<backup><duration>(\d+)<\/duration>/) || [])[1];
      const [one, two] = m.split('<backup>');
      const sum = s => (s.match(/<duration>(\d+)<\/duration>/g) || []).reduce((a, x) => a + +x.match(/\d+/)[0], 0);
      expect(sum(one)).toBe(16);
      expect(back).toBe(16);
      expect(sum(two.replace(/^<duration>\d+<\/duration>/, '').replace(/^[^<]*<duration>\d+<\/duration><\/backup>/, ''))).toBe(16);
    });
  });
  it('can leave the tab out', () => {
    const x = toMusicXML(d, { tab: false });
    expect(x).not.toContain('TAB');
    expect(x).not.toContain('<staff>');
  });
});

describe('MIDI', () => {
  it('writes a valid type 0 file with tempo and every note', () => {
    const d = draft([[0, 1, 60], [1, 2, 62], [2, 4, 64]], { bpm: 100 });
    const b = toMidi(d);
    const str = i => String.fromCharCode(...b.slice(i, i + 4));
    expect(str(0)).toBe('MThd');
    expect(Array.from(b.slice(8, 12))).toEqual([0, 0, 0, 1]); // type 0, one track
    expect((b[12] << 8) | b[13]).toBe(480);
    expect(str(14)).toBe('MTrk');
    const len = (b[18] << 24) | (b[19] << 16) | (b[20] << 8) | b[21];
    expect(22 + len).toBe(b.length);
    const us = 600000; // 100 bpm
    const i = b.findIndex((x, j) => x === 0xff && b[j + 1] === 0x51);
    expect((b[i + 3] << 16) | (b[i + 4] << 8) | b[i + 5]).toBe(us);
    const ons = []; for (let j = 22; j < b.length - 2; j++) if (b[j] === 0x90) ons.push(b[j + 1]);
    expect(ons).toEqual([60, 62, 64]);
    expect(Array.from(b.slice(-3))).toEqual([0xff, 0x2f, 0]);
  });
});

describe('drafts', () => {
  it('cleans a draft from another device', () => {
    const d = cleanDraft({ title: 5, bpm: 999, time: '5/4', key: 'H', grid: 0.3, notes: [{ s: 2, e: 1, midi: 60.4 }, { s: 'x' }, null, { s: 0, e: 1, midi: 200 }] });
    expect(d).toEqual({ title: '', bpm: 260, time: '4/4', key: 'auto', grid: 0.25, hold: true, notes: [{ s: 0, e: 1, midi: 108 }, { s: 2, e: 2, midi: 60 }] });
    expect(cleanDraft(null)).toEqual(DEFAULT_DRAFT());
  });
  it('makes safe file names', () => {
    expect(fileBase({ title: 'Café / Blues #2' })).toBe('Cafe-Blues-2');
    expect(fileBase({ title: '' })).toBe('my-score');
  });
});
