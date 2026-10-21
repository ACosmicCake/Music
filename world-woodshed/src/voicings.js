/* World Woodshed — guitar chord voicings: where the fingers go for a chord on your guitar.

   chordMidis() in theory.js stacks the notes in close position, which suits ear training (every note
   is easy to hear) but is not how a guitar sounds: a strummed guitar chord spreads over two octaves,
   doubles the root and fifth, and rings open strings. This finds real shapes on the six strings of the
   current tuning, so the chord explorer, the lessons and the circle of fifths play what you would play.

   A shape is a fret (or null for a muted string) per string, low E side first. Frets count from the
   capo, because E.STRINGS already includes it. A shape is playable when:
   - the lowest sounding note is the root (no inversions here),
   - the played strings form one block, with at most one muted string inside it,
   - the fretted notes span at most 4 frets (index finger to little finger, with a stretch),
   - it needs at most four fingers, counting a barre at the lowest fret as one,
   - every chord tone sounds. Chords of five or six notes cannot always fit; then the fifth goes first,
     then the ninth when there is a higher extension, the way guitarists thin a 13th chord down to
     root, third, seventh and thirteenth. A shape with fewer omissions always wins. */
import E from './engine.js';

const MAX_FRET = 12, SPAN = 4;
const pcOf = m => ((m % 12) + 12) % 12;

/* Which tones may be left out, in order, for a chord with these intervals */
function omittable(iv) {
  const out = [];
  if (iv.length >= 4 && iv.includes(7)) out.push(7);           // the perfect fifth adds least
  if (iv.length >= 5 && iv.some(x => x > 14) && iv.includes(14)) out.push(14); // a 9th under an 11th or 13th
  return out;
}

/* Fingers a shape needs: one per fretted note, except that notes at the lowest fret can share one
   barre when no string between them is open or muted (the index finger lies flat across them). */
export function fingers(frets) {
  const fretted = frets.filter(f => f > 0);
  if (!fretted.length) return 0;
  const low = Math.min(...fretted);
  const at = frets.map((f, i) => (f === low ? i : -1)).filter(i => i >= 0);
  let barre = at.length > 1;
  for (let i = at[0]; barre && i <= at[at.length - 1]; i++) if (!(frets[i] >= low)) barre = false;
  return barre ? fretted.length - at.length + 1 : fretted.length;
}

/* Lower is better. Prefers: low on the neck (open-position shapes ring and are the first ones learned),
   more strings, the root on a low string, fewer fingers and a small stretch. Open strings help in the
   first position, but an open string ringing between fingers higher up the neck is an awkward reach. */
function cost(frets, lo, hi, missing, near) {
  const fretted = frets.filter(f => f > 0);
  const min = fretted.length ? Math.min(...fretted) : 0, max = fretted.length ? Math.max(...fretted) : 0;
  const played = frets.filter(f => f !== null).length;
  const opens = frets.filter(f => f === 0).length;
  const stuck = frets.filter((f, i) => f === 0 && frets.slice(0, i).some(x => x > 0) && frets.slice(i + 1).some(x => x > 0)).length;
  let c = missing * 20 + (hi - lo + 1 - played) * 5 - played * 1.2 + lo * 0.6 + fingers(frets) * 0.6;
  c += (max - min) * 0.8 + (max - min === SPAN ? 2 : 0);
  c += max >= 4 ? stuck * 1.5 : -opens * 0.4;
  c += near == null ? max * 0.5 + min * 0.4 : Math.abs((min + max) / 2 - near) * 1.2;
  return c;
}

/* All playable shapes of a chord, best first.
   root: pitch class (0 = C). iv: semitones above the root. tuning: the six open-string MIDI notes
   (with the capo), low to high. opts.near: a fret to stay close to (for smooth changes in a progression). */
export function voicings(root, iv, tuning, opts = {}) {
  const pcs = [...new Set(iv.map(x => pcOf(root + x)))];
  const rootPc = pcOf(root);
  const skip = omittable(iv).map(x => pcOf(root + x));
  const found = [];
  // what each string can play: muted, or any chord tone up to the 12th fret
  const choices = tuning.map(open => {
    const c = [null];
    for (let f = 0; f <= MAX_FRET; f++) if (pcs.includes(pcOf(open + f))) c.push(f);
    return c;
  });
  const frets = new Array(tuning.length).fill(null);
  const walk = (i, lo, min, max) => {
    if (i === tuning.length) {
      if (lo < 0) return;
      let hi = tuning.length - 1;
      while (frets[hi] === null) hi--;
      if (hi - lo < 2 || !isBlock(frets) || fingers(frets) > 4) return; // three strings at least, one block
      const heard = new Set(frets.map((f, s) => (f === null ? -1 : pcOf(tuning[s] + f))));
      const gone = pcs.filter(x => !heard.has(x));
      if (gone.some(x => !skip.includes(x))) return;
      found.push({ frets: frets.slice(), lo, hi, missing: gone.length });
      return;
    }
    for (const f of choices[i]) {
      if (f > 0 && (Math.max(max, f) - Math.min(min, f) > SPAN)) continue;
      if (f !== null) {
        // below the lowest played string everything is muted, and the lowest played note is the root;
        // it must stay the lowest pitch too (a higher string can sound lower in some open tunings)
        if (lo < 0 && pcOf(tuning[i] + f) !== rootPc) continue;
        if (lo >= 0 && tuning[i] + f < tuning[lo] + frets[lo]) continue;
      }
      frets[i] = f;
      walk(i + 1, lo < 0 && f !== null ? i : lo, f > 0 ? Math.min(min, f) : min, f > 0 ? Math.max(max, f) : max);
    }
    frets[i] = null;
  };
  walk(0, -1, Infinity, -Infinity);
  return found
    .map(v => ({ ...v, cost: cost(v.frets, v.lo, v.hi, v.missing, opts.near) }))
    .sort((a, b) => a.cost - b.cost)
    .map(v => shape(v.frets, tuning, v.missing));
}

/* The played strings are one block with at most one muted string inside it */
function isBlock(frets) {
  const on = frets.map((f, i) => (f === null ? -1 : i)).filter(i => i >= 0);
  const gaps = on[on.length - 1] - on[0] + 1 - on.length;
  return gaps <= 1;
}

function shape(frets, tuning, missing) {
  const fretted = frets.filter(f => f > 0);
  return {
    frets,
    midis: frets.map((f, s) => (f === null ? null : tuning[s] + f)).filter(m => m !== null),
    pos: fretted.length ? Math.min(...fretted) : 0,
    omitted: missing
  };
}

/* The best shape on your guitar (tuning and capo from Today → Your guitar), or null if none fits.
   Remembered per tuning, so tapping through chords costs nothing after the first time. */
const cache = new Map();
export function voicing(root, iv, opts = {}) {
  const tuning = E.STRINGS.map(s => s.midi);
  const key = tuning.join('.') + '|' + pcOf(root) + '|' + iv.join('.') + '|' + (opts.near == null ? '' : Math.round(opts.near));
  if (!cache.has(key)) {
    if (cache.size > 500) cache.clear();
    cache.set(key, voicings(root, iv, tuning, opts)[0] || null);
  }
  return cache.get(key);
}

/* The notes to strum for a chord on your guitar, low to high; close position if no shape fits */
export function guitarMidis(root, iv, opts) {
  const v = voicing(root, iv, opts);
  if (v) return v.midis;
  let r = 40 + pcOf(root - 40); if (r < 43) r += 12;
  return iv.map(x => r + x);
}

/* Play a progression with smooth changes: each chord stays near where the last one was played */
export function progressionMidis(chords) {
  let near = null;
  return chords.map(([root, iv]) => {
    const v = voicing(root, iv, near == null ? {} : { near });
    if (!v) return guitarMidis(root, iv);
    const fretted = v.frets.filter(f => f > 0);
    near = fretted.length ? (Math.min(...fretted) + Math.max(...fretted)) / 2 : 1;
    return v.midis;
  });
}

export default { voicings, voicing, guitarMidis, progressionMidis, fingers };
