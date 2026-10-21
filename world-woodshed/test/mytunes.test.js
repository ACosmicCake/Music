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
