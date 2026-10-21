import './env.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import T from '../src/mytunes.js';
import E from '../src/engine.js';
import { parseChord } from '../src/theory.js';
import D from '../src/data.js';

/* Your own tunes (src/mytunes.js): reading a typed chart and form, checking a tune, and saving it
   (src/engine.js) with a deletion record so another device does not bring it back. */

describe('normChord', () => {
  it('keeps the spellings the app already uses', () => {
    ['C', 'Cm', 'C7', 'Bbmaj7', 'F#m7b5', 'Ebdim7', 'G13', 'A7b9', 'Dm9', 'Esus4', 'Abaug', 'Cmmaj7'].forEach(c => expect(T.normChord(c).sym).toBe(c));
  });
  it('reads the common ways of writing a chord', () => {
    const cases = { 'C-7': 'Cm7', 'Cmin7': 'Cm7', 'Cmi': 'Cm', 'C-': 'Cm', 'CΔ7': 'Cmaj7', 'CΔ': 'Cmaj7', 'CM7': 'Cmaj7', 'Cma7': 'Cmaj7',
      'Cø': 'Cm7b5', 'Cø7': 'Cm7b5', 'C-7b5': 'Cm7b5', 'Cm7(b5)': 'Cm7b5', 'C°7': 'Cdim7', 'Co': 'Cdim', 'C+': 'Caug', 'Csus': 'Csus4',
      'C7(b9)': 'C7b9', 'B♭7': 'Bb7', 'F♯m7': 'F#m7', 'eb': 'Eb', 'bbm7': 'Bbm7', 'Cmaj': 'C', 'C-Δ7': 'Cmmaj7', 'CmM7': 'Cmmaj7' };
    Object.entries(cases).forEach(([typed, sym]) => expect(T.normChord(typed).sym, typed).toBe(sym));
  });
  it('every chord it accepts is one the band can play', () => {
    ['C-7', 'Cø', 'C°7', 'CΔ9', 'C7#11', 'Cm6', 'C6', 'Csus2'].forEach(c => {
      const p = parseChord(T.normChord(c).sym);
      expect(p.sym).toBe(T.normChord(c).sym);
    });
  });
  it('explains what it cannot read', () => {
    expect(T.normChord('H7').error).toMatch(/A to G/);
    expect(T.normChord('C7sus4').error).toMatch(/does not know/);
    expect(T.normChord('C7/E').error).toMatch(/slash chords.*\(C7\)/);
  });
});

describe('parseChart', () => {
  it('splits bars by | and by lines, and chords in a bar by spaces', () => {
    expect(T.parseChart('Dm7 | G7 | Cmaj7 Am7 |\n| Dm7 G7 | C').bars).toEqual(['Dm7', 'G7', 'Cmaj7 Am7', 'Dm7 G7', 'C']);
    expect(T.parseChart('Dm7\nG7\n\nCmaj7').bars).toEqual(['Dm7', 'G7', 'Cmaj7']);
  });
  it('repeats the bar before with %', () => {
    expect(T.parseChart('C7 | % | F7 F#dim7 | %').bars).toEqual(['C7', 'C7', 'F7 F#dim7', 'F7 F#dim7']);
    expect(T.parseChart('% | C').errors[0]).toMatch(/cannot start/);
  });
  it('names the bar of a chord it cannot read, and limits a bar to four chords', () => {
    const r = T.parseChart('C | F7 Xm | G');
    expect(r.errors).toEqual([expect.stringMatching(/^Bar 2: Xm/)]);
    expect(T.parseChart('C D E F G').errors[0]).toMatch(/up to 4/);
    expect(T.parseChart('  ').errors[0]).toMatch(/Type some chords/);
    expect(T.parseChart(Array(129).fill('C').join('|')).errors[0]).toMatch(/up to 128/);
  });
  it('writes the chart back four bars to a line, and reads that back the same', () => {
    const bars = ['Dm7', 'G7', 'Cmaj7', 'Cmaj7', 'Dm7 G7', 'C'];
    expect(T.chartText(bars)).toBe('Dm7 | G7 | Cmaj7 | Cmaj7\nDm7 G7 | C');
    expect(T.parseChart(T.chartText(bars)).bars).toEqual(bars);
  });
  it('reads every preset tune the same way', () => {
    D.TUNES.forEach(t => expect(T.parseChart(T.chartText(t.bars)).bars, t.id).toEqual(t.bars));
  });
});

describe('parseForm', () => {
  it('splits equal sections from letters', () => {
    expect(T.parseForm('AABA', 32).form).toEqual([['A', 8], ['A', 8], ['B', 8], ['A', 8]]);
    expect(T.parseForm('AABA', 30).error).toMatch(/do not divide by 4/);
  });
  it('reads labels with bar counts, written together or apart', () => {
    expect(T.parseForm('A8 B4', 12).form).toEqual([['A', 8], ['B', 4]]);
    expect(T.parseForm('Intro 4, A 8, Coda 2', 14).form).toEqual([['Intro', 4], ['A', 8], ['Coda', 2]]);
    expect(T.parseForm('A1 8 A2 8', 16).form).toEqual([['A1', 8], ['A2', 8]]);
  });
  it('checks the form against the chart', () => {
    expect(T.parseForm('A8 B8', 12).error).toMatch(/adds up to 16 bars, but the chart has 12/);
    expect(T.parseForm('A B8', 16).error).toMatch(/Section A needs/);
    expect(T.parseForm('8 A', 16).error).toMatch(/section name before 8/);
    expect(T.parseForm('Bridgework8', 8).error).toMatch(/short/);
    expect(T.parseForm('', 12)).toEqual({ form: null });
  });
  it('writes a form back so it reads the same', () => {
    [[['A', 8], ['A', 8], ['B', 8], ['A', 8]], [['A', 8], ['B', 4]], [['A1', 8], ['A2', 8], ['B', 8], ['A3', 12]], [['Intro', 4], ['A', 8]]].forEach(f => {
      const n = f.reduce((a, x) => a + x[1], 0);
      expect(T.parseForm(T.formText(f), n).form).toEqual(f);
    });
    expect(T.formText(null)).toBe('');
  });
});

describe('checkTune and playable', () => {
  const draft = { name: '  Blues in F ', chart: 'F7 | Bb7 | F7 | % | Bb7 | % | F7 | D7 | Gm7 | C7 | F7 D7 | Gm7 C7', groove: 'swing', bpm: '132', form: 'ABC', note: 'twelve-bar' };
  it('turns a good draft into a tune shaped like the presets', () => {
    const { tune, errors } = T.checkTune(draft);
    expect(errors).toEqual({});
    expect(tune).toEqual({ name: 'Blues in F', groove: 'swing', bpm: 132, note: 'twelve-bar', form: [['A', 4], ['B', 4], ['C', 4]],
      bars: ['F7', 'Bb7', 'F7', 'F7', 'Bb7', 'Bb7', 'F7', 'D7', 'Gm7', 'C7', 'F7 D7', 'Gm7 C7'] });
    tune.bars.forEach(b => b.split(' ').forEach(c => expect(parseChord(c)).toBeTruthy()));
  });
  it('reports each problem by field', () => {
    const { tune, errors } = T.checkTune({ name: '', chart: 'F7 | Q', groove: 'polka', bpm: 9 });
    expect(tune).toBeUndefined();
    expect(Object.keys(errors).sort()).toEqual(['chart', 'groove', 'name']);
    expect(T.checkTune(Object.assign({}, draft, { form: 'A B8' })).errors.form).toMatch(/needs a number/);
  });
  it('keeps the tempo in the slider range', () => {
    expect(T.checkTune(Object.assign({}, draft, { bpm: 900 })).tune.bpm).toBe(300);
    expect(T.checkTune(Object.assign({}, draft, { bpm: 'fast' })).tune.bpm).toBe(120);
  });
  it('makes a saved tune safe to play, whatever another device wrote', () => {
    const p = T.playable(Object.assign({ id: 'my-x' }, T.checkTune(draft).tune));
    expect(p).toMatchObject({ id: 'my-x', group: 'Your tunes', mine: true, groove: 'swing', form: [['A', 4], ['B', 4], ['C', 4]] });
    expect(T.playable({ id: 'my-y', bars: ['C', 'Zzz'], groove: 'swing' })).toBeNull();
    expect(T.playable({ id: 'my-y', bars: ['C'], groove: 'nope' })).toBeNull();
    expect(T.playable({ bars: ['C'], groove: 'swing' })).toBeNull();
    expect(T.playable(null)).toBeNull();
    const odd = T.playable({ id: 'my-z', name: 7, bars: ['C', 'G7'], groove: 'rock', bpm: 1, form: [['A', 5]] });
    expect(odd).toMatchObject({ name: '7', bpm: 50, form: undefined, note: '' });
  });
});

describe('saving your tunes', () => {
  const NOW = new Date('2026-10-21T15:00:00').getTime();
  beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(NOW); E.resetAll(); });
  afterEach(() => vi.useRealTimers());
  it('gives a new tune an id and stamps every save', () => {
    const t = E.saveTune(T.checkTune({ name: 'Mine', chart: 'C | G7', groove: 'rock', bpm: 100 }).tune);
    expect(t.id).toMatch(/^my-/);
    expect(t.created).toBe(NOW);
    vi.setSystemTime(NOW + 1000);
    const again = E.saveTune(Object.assign({}, t, { name: 'Mine, edited' }));
    expect(again.id).toBe(t.id);
    expect(again.updatedAt).toBe(NOW + 1000);
    expect(E.listTunes().map(x => x.name)).toEqual(['Mine, edited']);
  });
  it('keeps its own copy, so editing the draft afterwards changes nothing saved', () => {
    const draft = T.checkTune({ name: 'Mine', chart: 'C | G7', groove: 'rock' }).tune;
    const t = E.saveTune(draft);
    draft.bars.push('F');
    expect(E.getTune(t.id).bars).toEqual(['C', 'G7']);
  });
  it('leaves a deletion record when a tune is deleted', () => {
    const t = E.saveTune(T.checkTune({ name: 'Gone soon', chart: 'C', groove: 'rock' }).tune);
    E.deleteTune(t.id);
    expect(E.getTune(t.id)).toBeNull();
    expect(E.state.tomb['tune:' + t.id]).toBe(NOW);
  });
  it('names your tune where practice answers are listed', () => {
    const t = E.saveTune(T.checkTune({ name: 'My blues', chart: 'C7 | F7', groove: 'shuffle' }).tune);
    expect(E.itemLabel('repertoire', t.id)).toBe('My blues');
    expect(E.itemLabel('repertoire', 'autumn')).toBe('Autumn Leaves');
  });
});

describe('a tune from a Transcribe song', () => {
  it('turns section names into one-word form labels', () => {
    expect(T.shortLabel('Verse 2')).toBe('Verse2');
    expect(T.shortLabel('Intro riff')).toBe('Intro');
    expect(T.shortLabel('Section 12')).toBe('Sectio12');
    expect(T.shortLabel('Solo bars 1–4')).toBe('Solo4');
    expect(T.shortLabel('  ')).toBe('?');
    const f = [[T.shortLabel('Verse 1'), 4], [T.shortLabel('Chorus'), 4]];
    expect(T.parseForm(T.formText(f), 8).form).toEqual([['Verse1', 4], ['Chorus', 4]]);
  });
  // 120 bpm in 4: a bar is 2 s; bar lines at 0.5, 2.5, 4.5, …
  const grid = { bpm: 120, offset: 0.5, bpb: 4, dur: 30 };
  it('makes each section a part of the form, rounding its ends to the bar lines', () => {
    const lay = T.songLayout(Object.assign({ sections: [{ name: 'Verse 1', a: 4.4, b: 12.6 }, { name: 'Intro', a: 0.4, b: 4.6 }] }, grid));
    expect(lay.from).toBe('sections');
    expect(lay.form).toEqual([['Intro', 2], ['Verse1', 4]]);
    expect(lay.bars.map(b => b.t0)).toEqual([0.5, 2.5, 4.5, 6.5, 8.5, 10.5]);
    expect(lay.bars[5].t1).toBe(12.5);
  });
  it('trims overlapping sections, leaves out gaps, and skips sections under a bar', () => {
    const lay = T.songLayout(Object.assign({ sections: [{ name: 'A', a: 0.5, b: 8.5 }, { name: 'B', a: 6.5, b: 10.5 }, { name: 'tiny', a: 12, b: 12.6 }, { name: 'C', a: 16.5, b: 20.5 }] }, grid));
    expect(lay.form).toEqual([['A', 4], ['B', 1], ['C', 2]]);
    expect(lay.bars.map(b => b.t0)).toEqual([0.5, 2.5, 4.5, 6.5, 8.5, 16.5, 18.5]);
  });
  it('uses the loop when there are no sections, then the whole song', () => {
    const loop = T.songLayout(Object.assign({ sections: [], loop: { a: 2.4, b: 10.6 } }, grid));
    expect(loop).toMatchObject({ from: 'loop', form: null });
    expect(loop.bars.map(b => b.t0)).toEqual([2.5, 4.5, 6.5, 8.5]);
    const song = T.songLayout(Object.assign({ loop: { a: 2, b: 2.5 } }, grid)); // a loop under a bar does not count
    expect(song.from).toBe('song');
    expect(song.bars[0].t0).toBe(0.5);
    expect(song.bars.length).toBe(15); // the last bar, 28.5–30.5, is mostly inside the 30 s
    expect(T.songLayout(Object.assign({}, grid, { offset: 1.9 })).bars[0].t0).toBeCloseTo(-0.1); // a pickup of 0.1 s still counts
  });
  it('stops at the longest tune', () => {
    const lay = T.songLayout({ bpm: 240, offset: 0, bpb: 4, dur: 600 });
    expect(lay.bars.length).toBe(T.MAX_BARS);
    expect(lay.capped).toBe(true);
    const secs = T.songLayout({ bpm: 240, offset: 0, bpb: 4, dur: 600, sections: [{ name: 'A', a: 0, b: 100 }, { name: 'B', a: 100, b: 400 }] });
    expect(secs.form).toEqual([['A', 100], ['B', 28]]);
  });
  it('needs a tempo, a downbeat and four beats to a bar', () => {
    expect(T.songLayout({ bpm: null, offset: 0, dur: 30 }).error).toBe('tempo');
    expect(T.songLayout({ bpm: 100, offset: null, dur: 30 }).error).toBe('tempo');
    expect(T.songLayout({ bpm: 100, offset: 0, bpb: 3, dur: 30 }).error).toBe('meter');
    expect(T.songLayout({ bpm: 60, offset: 0, dur: 1 }).error).toBe('short');
  });
  it('names guessed chords the way the band reads them', () => {
    expect(T.chordName(10, 'm7♭5')).toBe('Bbm7b5');
    expect(T.chordName(6, '7', false)).toBe('F#7');
    expect(T.chordName(-1, 'maj7')).toBe('Bmaj7');
    ['', 'm', '7', 'm7', 'maj7', 'm7♭5', 'dim', 'sus4'].forEach(q => expect(T.normChord(T.chordName(3, q)).sym).toBe(T.chordName(3, q)));
  });
  it('splits a bar only when a half clearly hears another chord', () => {
    expect(T.splitBar('C', null, null)).toEqual(['C']);
    expect(T.splitBar('C', { sym: 'C', score: 1, wScore: 1 }, { sym: 'C', score: 1, wScore: 1 })).toEqual(['C']);
    expect(T.splitBar('C', { sym: 'C', score: 1, wScore: 1 }, { sym: 'G7', score: 0.9, wScore: 0.5 })).toEqual(['C', 'G7']);
    expect(T.splitBar('C', { sym: 'C', score: 1, wScore: 1 }, { sym: 'Am', score: 0.9, wScore: 0.85 })).toEqual(['C']);
    expect(T.splitBar('C', { sym: 'Dm7', score: 0.9, wScore: 0.4 }, { sym: 'G7', score: 0.9, wScore: 0.4 })).toEqual(['Dm7', 'G7']);
  });
  it('keeps the link to its song through saving and playing', () => {
    const { tune } = T.checkTune({ name: 'From a song', chart: 'C | G7', groove: 'rock', song: 'sg1' });
    expect(tune.song).toBe('sg1');
    expect(T.playable(Object.assign({ id: 'my-s' }, tune)).song).toBe('sg1');
    expect(T.checkTune({ name: 'Mine', chart: 'C', groove: 'rock' }).tune.song).toBeUndefined();
  });
});
