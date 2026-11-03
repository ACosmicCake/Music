import { describe, it, expect } from 'vitest';
import fs from 'fs';
import zlib from 'zlib';
import { binarize, staffMetrics, findStaves, lineY, rotateGray, scaleGray } from '../src/omr/image.js';
import { prepare } from '../src/omr/prepare.js';
import { recognize } from '../src/omr/recognize.js';
import { midiOf, buildScore } from '../src/omr/assemble.js';
import { scoreToMusicXML, valueOf, splitQ } from '../src/omr/musicxml.js';
import { classify } from '../src/omr/classify.js';
import { CLASSES } from '../src/omr/templates.js';

/* Score recognition (src/omr/): engraved test pages made by scripts/omr/make-pages.py (Verovio) with the notes
   they hold, read back. The full benchmark (scripts/omr/bench.mjs) runs on many more pages; these keep the
   pipeline from sliding backwards. */
function fixture(name) {
  const b = zlib.gunzipSync(fs.readFileSync(new URL('./fixtures/omr/' + name + '.pgm.gz', import.meta.url)));
  const head = b.subarray(0, 40).toString('latin1').match(/^P5\s+(\d+)\s+(\d+)\s+255\s/);
  const w = +head[1], h = +head[2];
  return { gray: { w, h, d: new Uint8Array(b.subarray(head[0].length, head[0].length + w * h)) }, gt: JSON.parse(fs.readFileSync(new URL('./fixtures/omr/' + name + '.json', import.meta.url), 'utf8')) };
}
/* the top line of each staff row's notes, in order */
const melodyOf = (score, row = 0) => {
  const out = [];
  let r0 = 0;
  score.parts.forEach(p => { p.bars.forEach(bar => (bar[row - r0] || [[]])[0].forEach(e => { if (!e.rest) out.push(Math.max(...e.pitches.map(midiOf))); })); r0 += p.staves.length; });
  return out;
};
const lcs = (a, b) => {
  const d = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) { let prev = 0; for (let j = 1; j <= b.length; j++) { const t = d[j]; d[j] = a[i - 1] === b[j - 1] ? prev + 1 : Math.max(d[j], d[j - 1]); prev = t; } }
  return d[b.length];
};
const wantMelody = (gt, staff = 0) => gt.notes.filter(n => n.staff === staff && !n.rest).map(n => Math.max(...n.midi));

describe('finding staves', () => {
  it('finds each staff and its five lines', () => {
    const { gray } = fixture('val-p013');
    const bin = binarize(gray), m = staffMetrics(bin), st = findStaves(bin, m);
    expect(m.space).toBeGreaterThan(10);
    expect(st.filter(s => !s.tab)).toHaveLength(6); // three systems of a piano's two staves
    st.forEach(s => {
      const gap = (lineY(s, 4, (s.x0 + s.x1) / 2) - lineY(s, 0, (s.x0 + s.x1) / 2)) / 4;
      expect(Math.abs(gap - m.space)).toBeLessThan(2);
    });
  });
});

describe('a guitar score with tab under each staff', () => {
  it('measures the staff, not the tab, whose six lines are further apart and more common', () => {
    // three systems: a staff (spaces of 16 px) over a tab (spaces of 26 px), as MuseScore prints guitar music
    const w = 1600, h = 1500, d = new Uint8Array(w * h).fill(250);
    const line = y => { for (let t = 0; t < 2; t++) d.fill(20, (y + t) * w + 100, (y + t) * w + 1500); };
    for (let sys = 0; sys < 3; sys++) {
      const y0 = 100 + sys * 450;
      for (let i = 0; i < 5; i++) line(y0 + i * 16);
      for (let i = 0; i < 6; i++) line(y0 + 150 + i * 26);
    }
    const p = prepare({ w, h, d });
    expect(p.staves.filter(s => !s.tab)).toHaveLength(3);
    expect(p.staves.filter(s => s.tab)).toHaveLength(3);
    expect(Math.abs(p.metrics.space - 20)).toBeLessThan(2); // scaled so a staff space is about 20 px
  });
});

describe('reading a page', () => {
  it('reads a printed melody: bars, time, key and the notes in order', () => {
    const { gray, gt } = fixture('val-p015');
    const score = recognize([gray]);
    expect(score.counts.bars).toBe(gt.meta.bars);
    expect(score.time.num + '/' + score.time.den).toBe(gt.meta.time);
    expect(score.fifths).toBe(gt.meta.fifths);
    const want = wantMelody(gt), got = melodyOf(score);
    expect(lcs(want, got) / want.length).toBeGreaterThan(0.9);
  });

  it('reads repeat signs and ties, and writes them into the MusicXML', () => {
    const { gray, gt } = fixture('val-m003');
    const score = recognize([gray]);
    expect(score.counts.bars).toBe(gt.meta.bars);
    expect(score.repeats).toEqual(gt.meta.repeats);
    // the ties start on the notes the page ties
    const want = gt.notes.filter(n => n.tieStart).map(n => n.m + '@' + n.t);
    const got = [];
    score.parts[0].bars.forEach((bar, m) => bar[0].forEach(v => { let t = 0; v.forEach(e => { if ((e.pitches || []).some(p => p.tieStart)) got.push(m + '@' + t); t += e.q; }); }));
    expect(got).toEqual(want);
    const xml = scoreToMusicXML(score);
    expect((xml.match(/<repeat direction="forward"\/>/g) || []).length).toBe(2);
    expect((xml.match(/<repeat direction="backward"\/>/g) || []).length).toBe(2);
    expect((xml.match(/<tie type="start"\/>/g) || []).length).toBe(want.length);
    expect((xml.match(/<tie type="stop"\/>/g) || []).length).toBe(want.length);
  });

  it('reads first and second endings, and writes them so the 2nd time skips the 1st ending', async () => {
    const { gray, gt } = fixture('val-e001');
    const score = recognize([gray]);
    expect(score.repeats).toEqual(gt.meta.repeats);
    expect(score.endings.map((e) => [e[0], e[2]])).toEqual(gt.meta.endings);
    const xml = scoreToMusicXML(score);
    expect(xml).toContain('<ending number="1" type="start">1.</ending>');
    expect(xml).toContain('<ending number="1" type="stop"/><repeat direction="backward"/>');
    expect(xml).toContain('<ending number="2" type="start">2.</ending>');
    // the sight-reading reader sees the first ending (src/melody.js): the repeat is read through, then again without it
    const { fromMusicXML } = await import('../src/melody.js');
    const rep = fromMusicXML(xml).repeats.find(r => r.first != null);
    expect(rep).toBeTruthy();
  });

  it('reads a piano score into one part on two staves', () => {
    const { gray, gt } = fixture('val-p013');
    const score = recognize([gray]);
    expect(score.parts).toHaveLength(1);
    expect(score.parts[0].staves).toEqual(['G', 'F']);
    expect(score.counts.bars).toBe(gt.meta.bars);
    const want = wantMelody(gt), got = melodyOf(score);
    expect(lcs(want, got) / want.length).toBeGreaterThan(0.85);
  });

  it('reads a page photographed at a slant, on grey grainy paper', () => {
    const { gray, gt } = fixture('val-p015');
    // bigger (a phone photo, so the scaling blurs it), turned 2°, grey paper and noise
    let g = scaleGray(gray, 1.6);
    const pad = { w: g.w, h: g.h + 200, d: new Uint8Array(g.w * (g.h + 200)).fill(235) };
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) pad.d[(y + 100) * g.w + x] = Math.min(235, g.d[y * g.w + x]);
    g = rotateGray(pad, -0.035);
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < g.d.length; i++) g.d[i] = Math.max(0, Math.min(255, g.d[i] * 0.85 + (rnd() - 0.5) * 30));
    const score = recognize([g]);
    const want = wantMelody(gt), got = melodyOf(score);
    expect(lcs(want, got) / want.length).toBeGreaterThan(0.8);
  });

  it('finds nothing on a blank page', () => {
    const blank = { w: 600, h: 800, d: new Uint8Array(600 * 800).fill(240) };
    const score = recognize([blank]);
    expect(score === null || score.counts.notes === 0).toBe(true);
  });
});

describe('putting a score together', () => {
  const note = (q, pos, up = true) => ({ x: 0, q, base: q, dots: 0, up, heads: [{ pos }] });
  const staff = (evs, clef = 'G') => ({ clef, bars: [{ events: evs }] });
  const tenBeats = () => [note(2, 4), note(2, 5), note(1, 4), note(2, 3), note(1, 2), note(1, 0), note(1, 1)];
  it('guesses a time of ten beats from the bars, and leaves out the parts printed after the score', () => {
    const sys = () => ({ staves: [staff(tenBeats()), staff([note(4, 4, false)], 'F')] });
    const part = () => ({ staves: [staff(tenBeats())] });
    const s = buildScore([[sys(), sys()], [sys()], [part(), part(), part()]]);
    expect(s.time.num + '/' + s.time.den).toBe('10/4');
    expect(s.counts.bars).toBe(3); // the parts' pages are not added on as more bars
    expect(s.partsFrom).toBe(3);
    expect(s.parts[0].staves).toEqual(['G', 'F']);
  });
  it('leaves out a drum staff, and keeps whole rests that fill a long bar beside a note', () => {
    const rest = { x: 5, q: 4, base: 4, dots: 0, rest: true, wholeRest: true, pos: 6 };
    const whole = { x: 0, q: 4, base: 4, dots: 0, whole: true, heads: [{ pos: -2 }] };
    const bar = () => [whole, rest, Object.assign({}, rest, { x: 6 }), Object.assign({}, rest, { x: 7 })].map(e => Object.assign({}, e));
    const drums = () => staff([note(4, 4), note(4, 2), note(4, 4), note(4, 2)], 'perc');
    const tune = () => staff([note(4, 4), note(4, 5), note(4, 4), note(4, 3)]);
    const sys = evs => ({ staves: [evs, drums()] });
    const s = buildScore([[sys(Object.assign(tune(), { time: { num: 16, den: 4 } })), sys(tune()), sys(staff(bar()))]]);
    expect(s.time.num + '/' + s.time.den).toBe('16/4');
    expect(s.parts).toHaveLength(1);
    expect(s.drums).toBe(1);
    expect(s.parts[0].bars[2][0][0].map(e => (e.rest ? 'r' : 'n') + e.q)).toEqual(['n4', 'r4', 'r4', 'r4']);
    expect(s.warnings).toHaveLength(0);
  });
  it('puts a whole note under a tune with its stems up in a voice of its own', () => {
    const bar = [note(1, 8), note(1, 8), note(1, 9), { x: 0, q: 4, base: 4, dots: 0, whole: true, heads: [{ pos: -2 }] }, note(1, 10)];
    bar.forEach((e, i) => { e.x = i; });
    const s = buildScore([[{ staves: [staff(bar)] }, { staves: [staff(bar.map(e => Object.assign({}, e)))] }]]);
    expect(s.time.num + '/' + s.time.den).toBe('4/4');
    expect(s.parts[0].bars[0][0]).toHaveLength(2);
    expect(s.parts[0].bars[0][0][1].map(e => e.q)).toEqual([4]);
  });
});

describe('half-note chords and ledger lines, drawn', () => {
  // a staff (space 20 px) with half-note chords whose rings touch each other and the lines, and a whole note
  // on a ledger line: their holes close up once the lines are taken out
  const W = 1300, H = 420, top = 150, sp = 20;
  const page = () => {
    const d = new Uint8Array(W * H).fill(255);
    const ink = (x, y) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) d[y * W + x] = 0; };
    const rect = (x0, x1, y0, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) ink(x, y); };
    for (let i = 0; i < 5; i++) rect(40, W - 40, top + i * sp - 1, top + i * sp);
    const ring = (cx, cy, wide = 1) => {
      const t = -0.35, c = Math.cos(t), s = Math.sin(t);
      for (let y = -12; y <= 12; y++) for (let x = -16 * wide; x <= 16 * wide; x++) {
        const u = x * c + y * s, v = -x * s + y * c;
        const out = (u / (11.5 * wide)) ** 2 + (v / 10.2) ** 2 <= 1, inn = (u / (7.5 * wide)) ** 2 + (v / 5.2) ** 2 <= 1;
        if (out && !inn) ink(cx + x, cy + y);
      }
    };
    const yOf = pos => top + 4 * sp - pos * sp / 2;
    const chord = (x, poss) => {
      poss.forEach(p => ring(x, yOf(p)));
      rect(Math.round(x + 10), Math.round(x + 11), Math.round(yOf(Math.max(...poss)) - 3.5 * sp), Math.round(yOf(Math.min(...poss))));
    };
    const bar = x => rect(x, x + 1, top, top + 4 * sp);
    // bar 1: E4+G4, then F4+A4+C5; bar 2: G4+B4, then a C4 whole note on its ledger line (the bar is 4/4)
    chord(160, [0, 2]); chord(380, [1, 3, 5]); bar(560);
    chord(660, [2, 4]); bar(860);
    ring(1000, yOf(-2), 1.35); rect(980, 1020, yOf(-2) - 1, yOf(-2)); bar(1180);
    return { w: W, h: H, d };
  };
  it('reads every head of a chord and the whole note under the staff', () => {
    const score = recognize([page()]);
    const bars = score.parts[0].bars.map(b => b[0][0].filter(e => !e.rest).map(e => e.pitches.map(midiOf).sort((a, b) => a - b).join('+') + ':' + e.q));
    expect(bars[0]).toEqual(['64+67:2', '65+69+72:2']);
    expect(bars[1][0]).toBe('67+71:2');
    expect(bars[2]).toEqual(['60:4']);
  });
});

describe('the symbol classifier', () => {
  it('has examples of every class it can name', () => {
    ['clefG', 'clefF', 'sharp', 'flat', 'natural', 'rest4', 'rest8', 'rest16', 'restW', 'restH', 'note', 'other'].forEach(c => expect(CLASSES).toContain(c));
    // a solid block a space wide and half a space tall is a rest (whole or half), not a clef
    const grid = new Float32Array(60).fill(1);
    const r = classify({ w: 1.2, h: 0.5, fill: 1, grid });
    expect(r && r.cls).toMatch(/^rest[WH]$/);
  });
});

describe('writing MusicXML', () => {
  it('names note values, and splits lengths no single value writes', () => {
    expect(valueOf(1)).toEqual({ type: 'quarter', dots: 0 });
    expect(valueOf(1.5)).toEqual({ type: 'quarter', dots: 1 });
    expect(valueOf(3.5)).toEqual({ type: 'half', dots: 2 });
    expect(valueOf(1.25)).toBe(null);
    expect(splitQ(1.25)).toEqual([1, 0.25]);
    expect(splitQ(2.75)).toEqual([2, 0.5, 0.25]);
  });

  it('writes parts, staves, voices, chords, triplets and the bars to check', () => {
    const ev = (q, pitches, extra = {}) => Object.assign({ q, dots: 0, voice: 0, pitches }, extra);
    const C4 = { step: 'C', octave: 4, alter: 0 }, E4 = { step: 'E', octave: 4, alter: 0 }, Fs4 = { step: 'F', octave: 4, alter: 1, acc: 1 };
    const score = {
      title: 'T', time: { num: 2, den: 4 }, fifths: 1, pickup: 0,
      parts: [{ name: 'Piano', staves: ['G', 'F'], bars: [
        [[[ev(1, [C4, E4]), ev(1 / 3, [Fs4], { tuplet: 'start' }), ev(1 / 3, [C4], { tuplet: 'mid' }), ev(1 / 3, [C4], { tuplet: 'stop' })]], [[{ q: 2, rest: true, full: true }]]],
        [[[ev(1.25, [C4]), { q: 0.75, rest: true, dots: 0 }]], [[ev(2, [C4])]]]
      ] }],
      warnings: [], counts: {}
    };
    const xml = scoreToMusicXML(score, { bpm: 90, check: [2] });
    expect(xml).toContain('<staves>2</staves>');
    expect(xml).toContain('<clef number="2"><sign>F</sign><line>4</line></clef>');
    expect(xml).toContain('<chord/>');
    expect(xml).toContain('<actual-notes>3</actual-notes>');
    expect(xml).toContain('<accidental>sharp</accidental>');
    expect(xml).toContain('<rest measure="yes"/>');
    expect(xml).toContain('<tie type="start"/>'); // 1¼ beats is a quarter tied to a sixteenth
    expect(xml).toContain('<per-minute>90</per-minute>');
    expect(xml).toContain('<miscellaneous-field name="ww-check-bars">2</miscellaneous-field>');
    // every bar of every voice fills its length (2 beats × 24 divisions)
    const measures = xml.split('<measure ').slice(1);
    measures.forEach(m => {
      const voices = m.split('<backup>');
      voices.forEach(v => {
        let t = 0;
        v.replace(/<note>(<chord\/>)?.*?<duration>(\d+)<\/duration>/g, (_, chord, d) => { if (!chord) t += Number(d); return ''; });
        v.replace(/<forward><duration>(\d+)/g, (_, d) => { t += Number(d); return ''; });
        expect(t).toBe(48);
      });
    });
  });

  it('turns a page that was read into MusicXML that keeps every note', () => {
    const { gray } = fixture('val-p015');
    const score = recognize([gray]);
    const xml = scoreToMusicXML(score);
    const n = (xml.match(/<pitch>/g) || []).length;
    expect(n).toBeGreaterThanOrEqual(score.counts.notes); // tied pieces may add a few
  });

  it('builds nothing from no pages', () => {
    expect(buildScore([])).toBe(null);
  });
});
