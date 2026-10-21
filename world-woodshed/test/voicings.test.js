import './env.js';
import { describe, it, expect, afterEach } from 'vitest';
import D from '../src/data.js';
import E from '../src/engine.js';
import A from '../src/audio.js';
import { QUAL, parseChord } from '../src/theory.js';
import { voicings, voicing, guitarMidis, progressionMidis, fingers } from '../src/voicings.js';

/* Guitar chord shapes (src/voicings.js) and the strum that plays them (strumPlan in src/audio.js). */

const pc = m => ((m % 12) + 12) % 12;
const show = v => v.frets.map(f => (f === null ? 'x' : f)).join('');
const STD = E.TUNINGS.find(t => t.id === 'standard').midi;
const fifthOnly = iv => iv.length >= 5 ? [pc(7)] : []; // the only tone a five-note chord may drop
const allChords = D.CHORDS.map(c => [c.id, c.iv]).concat(QUAL.map(([k, iv]) => ['sym ' + k, iv]));

/* What makes a shape playable, checked on every shape we return */
function playable(v, root, iv, tuning, label) {
  expect(v, label).toBeTruthy();
  expect(v.frets, label).toHaveLength(6);                         // one fret (or a mute) per string
  const fretted = v.frets.filter(f => f > 0);
  if (fretted.length) expect(Math.max(...fretted) - Math.min(...fretted), label + ' span').toBeLessThanOrEqual(4); // within 5 frets
  expect(fingers(v.frets), label + ' fingers').toBeLessThanOrEqual(4);
  expect(v.midis, label).toEqual(v.frets.map((f, s) => (f === null ? null : tuning[s] + f)).filter(m => m !== null));
  expect(v.midis.length, label).toBeGreaterThanOrEqual(3);
  expect(pc(v.midis[0]), label + ' bass').toBe(pc(root));      // the root in the bass
  expect(Math.min(...v.midis), label + ' lowest').toBe(v.midis[0]);
  const heard = new Set(v.midis.map(pc));
  const want = [...new Set(iv.map(x => pc(root + x)))];
  want.forEach(x => expect(heard.has(x) || (iv.length >= 5 && x === pc(root + 7)) || (iv.length >= 6 && x === pc(root + 2)), label + ' has ' + x).toBe(true));
  v.midis.forEach(m => expect(want, label + ' stray note').toContain(pc(m)));
  const on = v.frets.map((f, i) => (f === null ? -1 : i)).filter(i => i >= 0);
  expect(on[on.length - 1] - on[0] + 1 - on.length, label + ' muted strings inside').toBeLessThanOrEqual(1);
}

describe('voicings', () => {
  it('finds the shapes guitarists learn first, in standard tuning', () => {
    const best = (root, iv) => show(voicings(root, iv, STD)[0]);
    expect(best(0, [0, 4, 7])).toBe('x32010');   // C
    expect(best(7, [0, 4, 7])).toBe('320003');   // G
    expect(best(2, [0, 4, 7])).toBe('xx0232');   // D
    expect(best(9, [0, 4, 7])).toBe('x02220');   // A
    expect(best(4, [0, 4, 7])).toBe('022100');   // E
    expect(best(5, [0, 4, 7])).toBe('133211');   // F, the first barre chord
    expect(best(9, [0, 3, 7])).toBe('x02210');   // Am
    expect(best(4, [0, 3, 7])).toBe('022000');   // Em
    expect(best(2, [0, 3, 7])).toBe('xx0231');   // Dm
    expect(best(11, [0, 3, 7])).toBe('x24432');  // Bm
    expect(best(7, [0, 4, 7, 10])).toBe('320001'); // G7
    expect(best(4, [0, 4, 7, 10])).toBe('020100'); // E7
    expect(best(0, [0, 4, 7, 11])).toBe('x32000'); // Cmaj7
    expect(best(2, [0, 3, 7, 10])).toBe('xx0211'); // Dm7
    expect(best(0, [0, 3, 6, 9])).toBe('x31212');  // Cdim7
  });
  it('every chord in the app, on every root and every tuning, has a playable shape', () => {
    for (const t of E.TUNINGS) for (const [id, iv] of allChords) for (let r = 0; r < 12; r++) {
      playable(voicings(r, iv, t.midi)[0], r, iv, t.midi, t.id + ' ' + r + ' ' + id);
    }
  });
  it('keeps every tone of triads and 7th chords; only bigger chords thin out, fifth first', () => {
    for (const t of E.TUNINGS) for (const c of D.CHORDS) for (let r = 0; r < 12; r++) {
      const v = voicings(r, c.iv, t.midi)[0];
      if (c.iv.length <= 4) expect(v.omitted, t.id + ' ' + r + c.id).toBe(0);
      else expect(v.omitted).toBeLessThanOrEqual(fifthOnly(c.iv).length);
    }
  });
  it('voices every chord symbol in the tunes', () => {
    D.TUNES.forEach(tu => tu.bars.forEach(b => b.split(' ').forEach(sym => {
      const c = parseChord(sym);
      playable(voicings(c.root, c.iv, STD)[0], c.root, c.iv, STD, tu.id + ' ' + sym);
    })));
  });
  it('lists other shapes too, all playable, best first', () => {
    const all = voicings(7, [0, 4, 7], STD);
    expect(all.length).toBeGreaterThan(10);
    all.forEach(v => playable(v, 7, [0, 4, 7], STD, show(v)));
  });
  it('stays near a given fret when asked (smooth changes)', () => {
    const v = voicings(7, [0, 4, 7], STD, { near: 10 })[0];
    expect(v.pos).toBeGreaterThanOrEqual(7);
    expect(progressionMidis([[2, [0, 3, 7, 10]], [7, [0, 4, 7, 10]], [0, [0, 4, 7, 11]]])).toHaveLength(3);
  });
});

describe('on your guitar', () => {
  afterEach(() => E.setGuitar({ tuning: 'standard', capo: 0 }));
  it('follows the capo: frets count from the capo, and the chord sounds where it should', () => {
    E.setGuitar({ tuning: 'standard', capo: 2 });
    const v = voicing(2, [0, 4, 7]);                          // D with a capo on 2 is the C shape
    expect(show(v)).toBe('x32010');
    expect(v.midis[0]).toBe(45 + 2 + 3);                       // D3
    playable(v, 2, [0, 4, 7], E.STRINGS.map(s => s.midi), 'capo 2');
  });
  it('follows the tuning', () => {
    E.setGuitar({ tuning: 'dropd', capo: 0 });
    expect(guitarMidis(2, [0, 4, 7])[0]).toBe(38);            // drop D: the low string is the root
  });
});

describe('strumPlan', () => {
  const seq = vals => { let i = 0; return () => vals[i++ % vals.length]; };
  it('crosses the strings in 8 to 25 ms each, a little unevenly', () => {
    for (const spread of [0, 0.005, 0.018, 0.03, 0.1]) {
      const p = A.strumPlan([40, 47, 52, 56, 59, 64], 0.6, spread, 1.6, 'down');
      p.slice(1).forEach((x, i) => {
        const gap = x.at - p[i].at;
        expect(gap).toBeGreaterThanOrEqual(0.008 * 0.8 - 1e-9);
        expect(gap).toBeLessThanOrEqual(0.025 * 1.2 + 1e-9);
      });
    }
    const a = A.strumPlan([40, 47, 52], 0.6, 0.02, 1, 'down', seq([0, 1]));
    expect(a[1].at - a[0].at).not.toBeCloseTo(a[2].at - a[1].at, 4);
  });
  it('a down-stroke starts on the bass; an up-stroke on the top string, and only the top four of six', () => {
    const ms = [40, 47, 52, 56, 59, 64];
    expect(A.strumPlan(ms, 0.6, 0.02, 1.6, 'down').map(x => x.midi)).toEqual(ms);
    expect(A.strumPlan(ms, 0.6, 0.02, 1.6, 'up').map(x => x.midi)).toEqual([64, 59, 56, 52]);
    expect(A.strumPlan([48, 52, 55], 0.6, 0.02, 1, 'up').map(x => x.midi)).toEqual([55, 52, 48]);
  });
  it('damps every string at the same moment, with a slight detune of a few cents', () => {
    const p = A.strumPlan([40, 47, 52, 56, 59, 64], 0.6, 0.02, 1.6);
    p.forEach(x => {
      expect(x.at + x.dur).toBeCloseTo(1.6, 9);
      expect(Math.abs(x.detune)).toBeLessThanOrEqual(3);
    });
  });
  it('keeps the overall loudness of the old strum, leaning on the first strings struck', () => {
    const mid = () => 0.5;
    const p = A.strumPlan([40, 47, 52, 56, 59, 64], 0.6, 0.02, 1.6, 'down', mid);
    const old = 0.6 / Math.sqrt(3);
    expect(p.reduce((a, x) => a + x.vel, 0) / p.length).toBeCloseTo(old, 6);
    expect(p[0].vel).toBeGreaterThan(p[5].vel);
  });
});
