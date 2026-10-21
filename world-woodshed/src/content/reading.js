/* World Woodshed — sight-reading curriculum and exercise generators.
   Pure data and functions (no DOM), so they can be tested in Node.
   All pitches are WRITTEN MIDI numbers: guitar music is written an octave above where it sounds
   (written middle C, 60, is the C on the A string, 3rd fret, which sounds as MIDI 48).
   Tempo is in beats per minute; in 6/8 the beat is the dotted quarter. */
import { KEYS, keyScale, spell, parseTime, durQ, DUR } from '../notation.js';

const range = (lo, hi, pcs) => { const out = []; for (let m = lo; m <= hi; m++) if (!pcs || pcs.includes(m % 12)) out.push(m); return out; };
const NAT = [0, 2, 4, 5, 7, 9, 11];
const nat = (lo, hi) => range(lo, hi, NAT);
const chrom = (lo, hi) => range(lo, hi);
const uniq = a => [...new Set(a)].sort((x, y) => x - y);
// first position, written: low E (52, three ledger lines below) to G♯ on the high e string, 4th fret (80)
const FIRST = nat(52, 79);
const KEY_GDF = [54, 66, 78, 61, 73, 58, 70]; // F♯, C♯, B♭ in first position

export const LEVELS = [
  {
    id: 1, name: 'Strings 1 and 2', goal: 'Read E F G on the high e string and B C D on the B string in whole, half and quarter notes.',
    notes: [71, 72, 74, 76, 77, 79], durs: ['w', 'h', 'q'], times: ['4/4'], keys: ['C'], tempo: [50, 72], maxLeap: 5,
    tips: ['Open high e is the top space; F is the top line; G sits just above the staff.', 'Open B is the middle line; C is the space above it (1st fret), D the line above that (3rd fret).', 'Count "1 2 3 4" out loud: a half note lasts two counts, a whole note four.']
  },
  {
    id: 2, name: 'String 3: G and A', goal: 'Add the open G string and A (2nd fret) and move between three strings without looking down.',
    notes: [67, 69, 71, 72, 74, 76, 77, 79], durs: ['w', 'h', 'q'], times: ['4/4'], keys: ['C'], tempo: [52, 76], maxLeap: 5,
    tips: ['Open G is the second line from the bottom: the line the treble clef curls around.', 'A is the space just above it, 2nd fret.', 'Steps on the staff (line to the next space) are neighbouring notes: often the next fret or the next string.']
  },
  {
    id: 3, name: 'Strings 4 to 6, ledger lines below', goal: 'Read every natural note in first position, down to low E three ledger lines below the staff.',
    notes: FIRST, durs: ['w', 'h', 'q'], dotted: ['h'], times: ['4/4'], keys: ['C'], tempo: [50, 72], maxLeap: 7,
    tips: ['Middle C (one ledger line below) is the A string, 3rd fret. Low E (three ledger lines) is the open 6th string.', 'Learn landmarks, not every note: middle C, open D (space below the staff), open A (two ledger lines) and low E.', 'The bottom line is E on the D string, 2nd fret, an octave above the open low E.']
  },
  {
    id: 4, name: 'Eighth notes', goal: 'Read pairs of beamed eighth notes and count the "and" between beats.',
    notes: FIRST, durs: ['w', 'h', 'q', '8'], dotted: ['h'], times: ['4/4'], keys: ['C'], tempo: [54, 80], maxLeap: 7, focus: ['8'],
    tips: ['Count "1 & 2 & 3 & 4 &": eighth notes fall on the numbers and on the "&".', 'Beams group eighths by the beat, so each beamed pair is one beat.', 'Alternate down and up picking: down on the beat, up on the "&".']
  },
  {
    id: 5, name: 'Rests', goal: 'Keep counting through quarter, half and whole rests and through eighth-note rests.',
    notes: FIRST, durs: ['w', 'h', 'q', '8'], dotted: ['h'], rests: ['h', 'q', '8'], times: ['4/4'], keys: ['C'], tempo: [54, 80], maxLeap: 7, focus: ['r', 'r8'],
    tips: ['A rest is counted exactly like a note of the same length. Keep the count going out loud.', 'Stop the string on a rest: lift the fretting finger or touch the string with the picking hand.', 'The whole rest hangs under the 4th line; the half rest sits on the middle line.']
  },
  {
    id: 6, name: '3/4 and 2/4 time', goal: 'Feel three and two beats to the bar, with the dotted half note filling a bar of 3/4.',
    notes: FIRST, durs: ['h', 'q', '8'], dotted: ['h'], rests: ['h', 'q'], times: ['3/4', '2/4'], keys: ['C'], tempo: [56, 84], maxLeap: 7, focus: ['dh'],
    tips: ['The top number is beats per bar; the bottom 4 means the quarter note gets the beat.', '3/4 is waltz time: accent beat 1 a little, "ONE two three".', 'A dot adds half the note\'s value: a dotted half is 3 beats.']
  },
  {
    id: 7, name: 'Ties and dotted quarters', goal: 'Hold tied notes through the beat and read the dotted quarter plus eighth figure.',
    notes: FIRST, durs: ['w', 'h', 'q', '8'], dotted: ['h', 'q'], rests: ['h', 'q'], ties: true, times: ['4/4', '3/4'], keys: ['C'], tempo: [54, 80], maxLeap: 7, focus: ['dq', 'tie'],
    tips: ['A tie joins two notes of the same pitch: pick the first, hold through the second.', 'Dotted quarter + eighth = "1 & 2 &" with the eighth on the "& of 2". Feel it as a tied quarter and eighth.', 'Keep your foot or head on the beat; the dotted rhythm lands between it.']
  },
  {
    id: 8, name: 'Key signatures: G, D and F', goal: 'Apply the key signature to every F, C or B on the staff, in every octave.',
    notes: uniq(FIRST.concat(KEY_GDF)), durs: ['w', 'h', 'q', '8'], dotted: ['h', 'q'], rests: ['h', 'q'], ties: true, times: ['4/4', '3/4'], keys: ['G', 'D', 'F'], tempo: [54, 80], maxLeap: 7,
    tips: ['Check the key signature before you play a note: one sharp (F♯) is G major, two (F♯ C♯) D major, one flat (B♭) F major.', 'The sharp or flat applies to that letter in every octave, not just the line it is drawn on.', 'F♯ in first position: 2nd fret on the low E and D strings, 2nd fret on the high e.']
  },
  {
    id: 9, name: 'More keys, and minor keys', goal: 'Read in A, B♭ and E♭ major and in A, E and D minor, where the leading tone is raised by an accidental.',
    notes: chrom(52, 80), durs: ['w', 'h', 'q', '8'], dotted: ['h', 'q'], rests: ['h', 'q'], ties: true, times: ['4/4', '3/4', '2/4'], keys: ['A', 'Bb', 'Eb', 'Am', 'Em', 'Dm', 'G', 'D', 'F'], tempo: [54, 80], maxLeap: 7,
    tips: ['Sharps go F C G D A E B; flats go B E A D G C F. The last sharp is a half step below the major key; the second-to-last flat names the key.', 'A minor key shares its signature with the major a minor third above (A minor and C major).', 'In minor, the 7th is usually raised on the way to the tonic: the G♯ in A minor, C♯ in D minor, D♯ in E minor.']
  },
  {
    id: 10, name: 'Accidentals', goal: 'Read sharps, flats and naturals added inside the bar, and remember they last until the bar line.',
    notes: chrom(52, 80), durs: ['h', 'q', '8'], dotted: ['h', 'q'], rests: ['h', 'q'], ties: true, times: ['4/4', '3/4'], keys: ['C', 'G', 'F', 'D', 'Am'], tempo: [52, 76], maxLeap: 7, chromatic: 0.22,
    tips: ['An accidental holds for the rest of the bar on that line or space. The bar line cancels it.', 'A natural sign cancels a sharp or flat from the key signature or from earlier in the bar.', 'Chromatic notes usually move by half step to the next note: look one note ahead to see where they resolve.']
  },
  {
    id: 11, name: 'Sixteenth notes', goal: 'Read groups of four sixteenths, eighth-two-sixteenths and the dotted eighth plus sixteenth.',
    notes: chrom(52, 80), durs: ['h', 'q', '8', '16'], dotted: ['h', 'q', '8'], rests: ['h', 'q', '8'], ties: true, times: ['4/4', '2/4'], keys: ['C', 'G', 'D', 'F', 'Am', 'Em'], tempo: [44, 66], maxLeap: 7, focus: ['16'],
    tips: ['Count "1 e & a 2 e & a": four sixteenths to the beat.', 'Read the beam, not each note: two beams means sixteenths. Recognise whole beat shapes at a glance.', 'Dotted eighth + sixteenth is "1 (e &) a": long-short, like a skip.']
  },
  {
    id: 12, name: 'Syncopation', goal: 'Read rhythms that push across the beat: eighth-quarter-eighth, off-beat starts and ties over the beat.',
    notes: chrom(52, 80), durs: ['w', 'h', 'q', '8'], dotted: ['h', 'q'], rests: ['h', 'q', '8'], ties: true, sync: true, times: ['4/4', '2/4'], keys: ['C', 'G', 'D', 'F', 'Am', 'Em'], tempo: [56, 84], maxLeap: 7, focus: ['sync', 'r8'],
    tips: ['Keep strumming-hand motion going down and up in eighths; play only the strokes the music asks for.', 'Eighth-quarter-eighth: "1 & (2) &". The quarter starts on an "&" and holds through the beat.', 'A note tied over the beat is a syncopation too: say the count you are holding through.']
  },
  {
    id: 13, name: '6/8 time', goal: 'Feel two big beats of three eighths each, and read the quarter-eighth swing of compound time.',
    notes: chrom(52, 80), durs: ['h', 'q', '8', '16'], dotted: ['h', 'q', '8'], rests: ['q', '8'], ties: true, times: ['6/8'], keys: ['C', 'G', 'D', 'F', 'Am', 'Em', 'Dm'], tempo: [40, 63], maxLeap: 7, focus: ['68'],
    tips: ['6/8 has two beats per bar, each a dotted quarter: count "1 2 3 4 5 6" with weight on 1 and 4.', 'Eighths are beamed in threes, one group per beat.', 'Quarter + eighth inside one beat is the lilting "long-short" of jigs and many 6/8 songs.']
  },
  {
    id: 14, name: 'Fifth position, ledger lines above', goal: 'Read up to D above the staff in fifth position (index finger at the 5th fret).',
    notes: uniq(nat(57, 86).concat([61, 66, 68, 70, 73, 78, 80, 82, 85])), durs: ['w', 'h', 'q', '8'], dotted: ['h', 'q'], rests: ['h', 'q', '8'], ties: true, times: ['4/4', '3/4'], keys: ['C', 'G', 'F', 'D', 'Am', 'Em'], tempo: [50, 76], maxLeap: 7, position: 5,
    tips: ['In fifth position the index finger covers fret 5 on every string: the high e string gives A B C D at frets 5, 7, 8, 10.', 'A above the staff sits on one ledger line; C has two. Count the ledger lines from the staff outward.', 'Many notes now have a second home: E at the top space is the open e or the B string, 5th fret. Stay in position.']
  },
  {
    id: 15, name: 'Larger leaps', goal: 'Read leaps of a sixth, seventh and octave by recognising the shape of the interval on the staff.',
    notes: chrom(52, 86), durs: ['w', 'h', 'q', '8'], dotted: ['h', 'q'], rests: ['h', 'q', '8'], ties: true, times: ['4/4', '3/4'], keys: ['C', 'G', 'D', 'F', 'A', 'Bb', 'Am', 'Em', 'Dm'], tempo: [50, 76], maxLeap: 12, leaps: 0.3,
    tips: ['Read intervals, not just letters: line to line is an odd interval (3rd, 5th, 7th), line to space an even one.', 'An octave is line to space (or space to line) seven steps away: on the guitar, two strings over and two or three frets up.', 'Look at where a leap lands before you reach it, so the hand moves early.']
  },
  {
    id: 16, name: 'Everything', goal: 'Mixed keys, meters, rhythms and positions: the kind of page a session or a band chart puts in front of you.',
    notes: chrom(52, 88), durs: ['w', 'h', 'q', '8', '16'], dotted: ['h', 'q', '8'], rests: ['h', 'q', '8'], ties: true, sync: true, times: ['4/4', '3/4', '2/4', '6/8'], keys: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Am', 'Em', 'Bm', 'Dm', 'Gm'], tempo: [52, 84], maxLeap: 12, chromatic: 0.1, leaps: 0.15,
    tips: ['Before you start: key, meter, the highest and lowest notes, and any tricky rhythm. Ten seconds of scanning saves the read.', 'Choose a position that covers the range, then stay in it.', 'Pick a tempo you can hold without stopping. Steady and slightly wrong beats perfect and halting.']
  }
];

/* How to sight-read: shown on every level */
export const HOW_TO = [
  ['Scan first', 'Before you play, check the key signature, the time signature, the highest and lowest notes and any rhythm you don\'t recognise.'],
  ['Look ahead', 'Keep your eyes a beat or two ahead of where you are playing. The note you are on is already in your hands.'],
  ['Keep going', 'Never stop to fix a wrong note. The beat goes on; land the next one. Rhythm matters more than pitch.'],
  ['Count', 'Count out loud or in your head the whole time, rests included. Tap your foot.'],
  ['Read in shapes', 'See groups: a beamed beat, a scale run, a chord outline, an interval. Read words, not letters.'],
  ['Go slow', 'Choose a tempo where you can read everything without stopping, then speed up 4 bpm at a time.']
];

/* ---------- items for the skill system ---------- */
const NAME = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const midiLabel = m => NAME[m % 12] + (Math.floor(m / 12) - 1);
export function noteTier(m) {
  const L = LEVELS.find(l => l.notes.includes(m));
  return L ? Math.max(1, Math.min(LEVELS.length, L.id)) : LEVELS.length;
}
export function readingItems() {
  const all = uniq(LEVELS.flatMap(l => l.notes));
  const out = all.map(m => ({ id: 'n:' + m, label: 'Read ' + midiLabel(m) + ' (written)', tier: noteTier(m) }));
  LEVELS.forEach(l => {
    out.push({ id: 'L' + l.id + ':rhythm', label: 'Level ' + l.id + ' rhythm: ' + l.name, tier: l.id });
    out.push({ id: 'L' + l.id + ':melody', label: 'Level ' + l.id + ' melody: ' + l.name, tier: l.id });
  });
  return out;
}
export const levelOf = k => LEVELS[Math.max(0, Math.min(LEVELS.length - 1, (k | 0) - 1))];

/* ---------- rhythm generation ---------- */
// cells fill one or more beats. Each event: [dur, dotted, rest]. tags say what a level must allow.
const SIMPLE_CELLS = [
  { len: 4, ev: [['w']], w: 1.2 },
  { len: 3, ev: [['h', 1]], w: 1.2 },
  { len: 2, ev: [['h']], w: 2 },
  { len: 2, ev: [['h', 0, 1]], w: 0.7 },
  { len: 2, ev: [['q', 1], ['8']], w: 1.6, tag: 'dq' },
  { len: 2, ev: [['8'], ['q'], ['8']], w: 1.5, tag: 'sync' },
  { len: 2, ev: [['8', 0, 1], ['q'], ['8']], w: 0.8, tag: 'sync' },
  { len: 1, ev: [['q']], w: 3 },
  { len: 1, ev: [['q', 0, 1]], w: 0.9 },
  { len: 1, ev: [['8'], ['8']], w: 2.4 },
  { len: 1, ev: [['8', 0, 1], ['8']], w: 0.9 },
  { len: 1, ev: [['8'], ['8', 0, 1]], w: 0.5 },
  { len: 1, ev: [['16'], ['16'], ['16'], ['16']], w: 1.4 },
  { len: 1, ev: [['8'], ['16'], ['16']], w: 1.3 },
  { len: 1, ev: [['16'], ['16'], ['8']], w: 1.3 },
  { len: 1, ev: [['8', 1], ['16']], w: 1.2 },
  { len: 1, ev: [['16'], ['8'], ['16']], w: 0.8, tag: 'sync' }
];
const COMPOUND_CELLS = [ // beat = dotted quarter
  { len: 2, ev: [['h', 1]], w: 1 },
  { len: 1, ev: [['q', 1]], w: 2 },
  { len: 1, ev: [['q'], ['8']], w: 3 },
  { len: 1, ev: [['8'], ['8'], ['8']], w: 2.6 },
  { len: 1, ev: [['8'], ['q']], w: 0.6 },
  { len: 1, ev: [['q', 1, 1]], w: 0.5 },
  { len: 1, ev: [['q'], ['8', 0, 1]], w: 0.7 },
  { len: 1, ev: [['8', 0, 1], ['8'], ['8']], w: 0.6 },
  { len: 1, ev: [['8', 1], ['16'], ['8']], w: 1 },
  { len: 1, ev: [['16'], ['16'], ['8'], ['8']], w: 0.8 }
];
function cellAllowed(c, L) {
  const dotted = L.dotted || [], rests = L.rests || [];
  if (c.tag === 'sync' && !L.sync) return false;
  return c.ev.every(([d, dot, rest]) => L.durs.includes(d) && (!dot || dotted.includes(d)) && (!rest || rests.includes(d)));
}
function cellTags(c) {
  const t = new Set();
  if (c.tag) t.add(c.tag);
  c.ev.forEach(([d, dot, rest]) => {
    if (d === '8' && !rest) t.add('8');
    if (d === '16') t.add('16');
    if (rest) t.add(d === '8' ? 'r8' : 'r');
    if (dot && d === 'h') t.add('dh');
    if (dot && d === 'q') t.add('dq');
  });
  return t;
}
const pickW = (arr, wf, rng) => {
  const ws = arr.map(wf), tot = ws.reduce((a, b) => a + b, 0);
  let r = rng() * tot;
  for (let i = 0; i < arr.length; i++) { r -= ws[i]; if (r <= 0) return arr[i]; }
  return arr[arr.length - 1];
};
const toEv = ([d, dot, rest]) => ({ dur: d, dot: !!dot, rest: !!rest });

/* One bar of rhythm events: [{dur, dot, rest}] */
function genBar(L, ts, rng, opts = {}) {
  const compound = ts.compound;
  const cells = (compound ? COMPOUND_CELLS : SIMPLE_CELLS).filter(c => cellAllowed(c, L));
  const focus = new Set(L.focus || []);
  const beats = ts.beats;
  const out = [];
  let b = 0;
  const end = opts.endLen || 0; // beats reserved for a final long note
  const fits = (c, at) => {
    if (at + c.len > beats - end) return false;
    if (!compound && c.len >= 2 && beats === 4) {
      if (c.len === 2 && at % 2 !== 0) return false;  // half-note shapes start on 1 or 3
      if (c.len === 3 && at > 1) return false;
      if (c.len === 4 && at !== 0) return false;
    }
    return true;
  };
  while (b < beats - end) {
    const ok = cells.filter(c => fits(c, b) && !(opts.noRestStart && b === 0 && c.ev[0][2]));
    const c = pickW(ok, x => {
      let w = x.w;
      const tags = cellTags(x);
      tags.forEach(t => { if (focus.has(t)) w *= 3; });
      if (x.len > 1 && b === 0 && opts.first) w *= 0.6;
      return w;
    }, rng);
    c.ev.forEach(e => out.push(toEv(e)));
    b += c.len;
  }
  if (end) {
    const q = end * ts.beatQ;
    const ev = q === 4 ? ['w'] : q === 3 ? ['h', 1] : q === 2 ? ['h'] : q === 1.5 ? ['q', 1] : ['q'];
    out.push(toEv(ev));
  }
  return out;
}
function endLenFor(L, ts, rng) {
  const dotted = L.dotted || [];
  const opts = [];
  if (ts.compound) { if (L.durs.includes('h') && dotted.includes('h')) opts.push([2, 3]); if (dotted.includes('q')) opts.push([1, 2]); }
  else {
    if (ts.beats === 4 && L.durs.includes('w')) opts.push([4, 3]);
    if (ts.beats >= 3 && dotted.includes('h')) opts.push([3, 2]);
    if (ts.beats >= 2 && L.durs.includes('h')) opts.push([2, 3]);
    opts.push([1, 1]);
  }
  return pickW(opts, o => o[1], rng)[0];
}

/* A rhythm: { time, bars: [[{dur, dot, rest, tie}]] }. With final, the last bar ends on a long note. */
export function genRhythm(L, o = {}) {
  const rng = o.rng || Math.random;
  const time = o.time || L.times[Math.floor(rng() * L.times.length)];
  const ts = parseTime(time);
  const nb = o.bars || 2;
  const bars = [];
  for (let i = 0; i < nb; i++) {
    const last = i === nb - 1 && o.final !== false;
    bars.push(genBar(L, ts, rng, { endLen: last ? endLenFor(L, ts, rng) : 0, first: i === 0, noRestStart: i === 0 && o.noRestStart }));
  }
  // ties: join a note to the next one across a beat or bar line
  if (L.ties) {
    const flat = []; bars.forEach((bar, bi) => { let on = 0; bar.forEach(e => { flat.push({ e, bi, on }); on += DUR[e.dur] * (e.dot ? 1.5 : 1); }); });
    const cands = [];
    for (let i = 0; i + 1 < flat.length; i++) {
      const a = flat[i], z = flat[i + 1];
      if (a.e.rest || z.e.rest) continue;
      if (i + 1 === flat.length - 1) continue; // the final note stays a fresh attack
      const onBeat = Math.abs(z.on / ts.beatQ - Math.round(z.on / ts.beatQ)) < 1e-6;
      if (onBeat && (z.bi !== a.bi || z.on > 0)) cands.push(a);
    }
    const n = Math.min(cands.length, Math.round(nb * (L.sync ? 0.6 : 0.4) * (0.5 + rng())));
    for (let k = 0; k < n && cands.length; k++) {
      const c = cands.splice(Math.floor(rng() * cands.length), 1)[0];
      c.e.tie = true;
      // no chains: the notes either side of a tie can't start another one
      const j = flat.indexOf(c);
      for (let x = cands.length - 1; x >= 0; x--) if (Math.abs(flat.indexOf(cands[x]) - j) <= 1) cands.splice(x, 1);
    }
  }
  return { time, bars };
}

/* ---------- melody generation ---------- */
const sum = a => a.reduce((x, y) => x + y, 0);
/* A melody: { key, time, bars: [[{midi, dur, dot?, tie?, spell?}]] }; starts and ends on the tonic. */
export function genMelody(L, o = {}) {
  const rng = o.rng || Math.random;
  for (let attempt = 0; attempt < 300; attempt++) {
    const key = o.key || L.keys[Math.floor(rng() * L.keys.length)];
    const m = tryMelody(L, key, rng, o);
    if (m) return m;
  }
  // fall back to a plain scale fragment (should never be needed; the tests check this)
  const key = L.keys[0], K = KEYS[key];
  const t = L.notes.find(n => n % 12 === K.tonic);
  return { key, time: '4/4', bars: [[{ midi: t, dur: 'w' }]] };
}
function tryMelody(L, key, rng, o) {
  const K = KEYS[key];
  const rh = genRhythm(L, { time: o.time, bars: o.bars || 4, rng, final: true, noRestStart: true });
  const scale = keyScale(key);
  const dia = L.notes.filter(n => scale.includes(n % 12));
  if (dia.length < 5) return null;
  const tonics = dia.filter(n => n % 12 === K.tonic);
  if (!tonics.length) return null;
  const lead = K.minor ? (K.tonic + 11) % 12 : null; // raised 7th in minor
  // attacks: notes that need a pitch (tied continuations copy the one before)
  const evs = rh.bars.flat();
  const attacks = [];
  evs.forEach((e, i) => { if (e.rest) return; const prev = evs[i - 1]; if (prev && !prev.rest && prev.tie) return; attacks.push(e); });
  const n = attacks.length;
  if (n < 2) return null;
  const mid = (dia[0] + dia[dia.length - 1]) / 2;
  const start = pickW(tonics, t => 1 / (1 + Math.abs(t - mid) / 4), rng);
  const lo = dia[0], hi = dia[dia.length - 1];
  const seq = [start], spells = [null];
  const leapP = L.leaps || 0.1;
  const idxOf = m => dia.indexOf(m);
  let forced = null;
  for (let i = 1; i < n; i++) {
    const prev = seq[i - 1], prev2 = seq[i - 2];
    if (i === n - 1) {
      const t = tonics.filter(x => Math.abs(x - prev) <= Math.min(L.maxLeap, 7));
      if (!t.length) return null;
      seq.push(t.sort((a, b) => Math.abs(a - prev) - Math.abs(b - prev))[0]); spells.push(null);
      break;
    }
    if (forced !== null) { seq.push(forced.m); spells.push(forced.sp); forced = null; continue; }
    if (i === n - 2) {
      // cadence: approach a tonic by step (2nd degree or leading tone), sometimes from the 5th
      const opts = [];
      tonics.forEach(T => {
        const above = dia.find(x => x > T), below = [...dia].reverse().find(x => x < T);
        if (above !== undefined && above - T <= 2) opts.push([above, 3]);
        if (below !== undefined) {
          if (lead !== null && L.notes.includes(T - 1) && (L.id >= 9)) opts.push([T - 1, 3]);
          else opts.push([below, 2]);
        }
        if (L.maxLeap >= 5 && dia.includes(T + 7)) opts.push([T + 7, 0.6]);
        if (L.maxLeap >= 5 && dia.includes(T - 5)) opts.push([T - 5, 0.6]);
      });
      const ok = opts.filter(([m]) => Math.abs(m - prev) <= L.maxLeap && m !== prev);
      if (!ok.length) return null;
      seq.push(pickW(ok, x => x[1] / (1 + Math.abs(x[0] - prev) / 5), rng)[0]); spells.push(null);
      continue;
    }
    // chromatic passing or neighbour tone
    if (L.chromatic && rng() < L.chromatic && i < n - 3) {
      const dir = rng() < 0.5 ? 1 : -1, c = prev + dir;
      if (!scale.includes(c % 12) && L.notes.includes(c)) {
        const pass = prev + 2 * dir;
        if (dia.includes(pass) && rng() < 0.6) { seq.push(c); spells.push(dir > 0 ? '#' : 'b'); forced = { m: pass, sp: null }; continue; }
        seq.push(c); spells.push(dir > 0 ? 'b' : '#'); forced = { m: prev, sp: null }; continue; // neighbour: up = flat, down = sharp
      }
    }
    // diatonic motion: mostly steps, some thirds, occasional leaps; recover after a leap
    const pi = idxOf(prev);
    const lastLeap = prev2 !== undefined ? prev - prev2 : 0;
    const cand = [];
    dia.forEach((m, j) => {
      const d = j - pi, iv = Math.abs(m - prev);
      if (iv > L.maxLeap) return;
      let w;
      if (d === 0) w = 0.25;
      else if (Math.abs(d) === 1) w = 5;
      else if (Math.abs(d) === 2) w = 1.8;
      else w = leapP * 6 / (Math.abs(d) - 1);
      if (Math.abs(lastLeap) >= 5) w *= Math.sign(m - prev) === -Math.sign(lastLeap) && Math.abs(d) === 1 ? 4 : 0.15;
      // drift back towards the middle of the range
      const nm = (m - mid) / Math.max(4, (hi - lo) / 2);
      w *= Math.exp(-nm * nm * 0.8);
      if (d === 0 && prev2 === prev) w = 0;
      cand.push([m, w]);
    });
    const c = cand.filter(x => x[1] > 0);
    if (!c.length) return null;
    seq.push(pickW(c, x => x[1], rng)[0]); spells.push(null);
  }
  if (seq.length !== n) return null;
  for (let i = 1; i < n; i++) if (Math.abs(seq[i] - seq[i - 1]) > L.maxLeap) return null;
  if (seq.some(m => !L.notes.includes(m))) return null;
  // write the pitches into the rhythm
  let k = -1;
  const bars = rh.bars.map(bar => bar.map(e => {
    if (e.rest) return { midi: null, dur: e.dur, dot: e.dot || undefined };
    const prevE = evs[evs.indexOf(e) - 1];
    if (!(prevE && !prevE.rest && prevE.tie)) k++;
    const out = { midi: seq[k], dur: e.dur };
    if (e.dot) out.dot = true;
    if (e.tie) out.tie = true;
    if (spells[k]) out.spell = spells[k];
    return out;
  }));
  return { key, time: rh.time, bars };
}

/* A one-pitch rhythm to read, written on the middle line */
export function rhythmPiece(L, o = {}) {
  const rh = genRhythm(L, Object.assign({ bars: 2, final: true }, o));
  const pitch = o.pitch || 71;
  return { key: 'C', time: rh.time, bars: rh.bars.map(bar => bar.map(e => {
    const n = { midi: e.rest ? null : pitch, dur: e.dur };
    if (e.dot) n.dot = true; if (e.tie && !e.rest) n.tie = true;
    return n;
  })) };
}

/* A flash card: one written note, the key it is shown in and its spelled name */
export function noteCard(L, midi, rng = Math.random) {
  const keys = L.keys.filter(k => keyScale(k).includes(midi % 12));
  const key = keys.length ? keys[Math.floor(rng() * keys.length)] : 'C';
  const pref = rng() < 0.5 ? '#' : 'b';
  const sp = spell(midi, key, pref);
  return { key, note: { midi, dur: 'w', spell: pref }, letter: sp.letter, alter: sp.alter, name: sp.name };
}

/* Onset times of a piece in quarter notes: [{ i (flat index), q (onset), len, midi }] for each attack */
export function attacks(piece) {
  const out = []; let t = 0, i = 0, prev = null;
  const ts = parseTime(piece.time);
  piece.bars.forEach(bar => {
    const full = bar.length === 1 && bar[0].midi == null && bar[0].dur === 'w';
    bar.forEach(n => {
      const len = full ? ts.barQ : durQ(n);
      if (n.midi != null) {
        if (prev && prev.midi === n.midi && prev.tie) out[out.length - 1].len += len;
        else out.push({ i, q: t, len, midi: n.midi });
      }
      prev = n; t += len; i++;
    });
  });
  return out;
}
export const pieceLength = piece => sum(piece.bars.map(b => (b.length === 1 && b[0].midi == null && b[0].dur === 'w') ? parseTime(piece.time).barQ : sum(b.map(durQ))));
