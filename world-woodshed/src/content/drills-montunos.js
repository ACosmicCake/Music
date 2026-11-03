/* World Woodshed — guitar montunos for Cuba: practice guajeos and comping patterns built the way son, guajira,
   salsa and cha-cha-chá guitar and tres parts are built (short, repeated, fitted to the clave, each new chord
   arriving early). They are practice patterns, not transcriptions of any recording.

   Phrases are written on a grid of sixteenths, one character per sixteenth and 16 to a 4/4 bar:
   'x' starts a note, '-' holds it, '.' is a rest. Bars are split by '|'; a single bar of rhythm is used for every
   bar. The notes are listed in order, one token per 'x' (a '|' between bars is checked against the rhythm): sounding MIDI, with '+' between the pitches of a double
   stop or chord on one stem ('64+60'). S() turns them into the drill bars that drills-a.js writes by hand.

   As in the other Cuba drills, one written bar of the son is one full round of the clave, counted
   1 e & a 2 e & a 3 e & a 4 e & a, with the chords changing on 1 and 3. The cha-cha-chá is counted as written. */

const FIT = [16, 12, 8, 6, 4, 3, 2, 1];
const DUR = { 16: ['w'], 12: ['h', 1], 8: ['h'], 6: ['q', 1], 4: ['q'], 3: ['8', 1], 2: ['8'], 1: ['16'] };
function chunk(len, note, out) { // a note of `len` sixteenths, then rests for what no single value can hold
  let first = true;
  while (len > 0) {
    const k = FIT.find(x => x <= len), [d, dot] = DUR[k];
    const n = first && note ? Object.assign({}, note, { d }) : { m: null, d };
    if (dot) n.dot = true;
    out.push(n); len -= k; first = false;
  }
}
function tok(t) {
  const ms = t.split('+').map(Number);
  if (ms.some(m => !Number.isInteger(m) || m < 40 || m > 88)) throw new Error('montuno: bad note ' + t);
  ms.sort((a, b) => a - b);
  return ms.length > 1 ? { m: ms[ms.length - 1], ch: ms } : { m: ms[0] };
}
export function S(rhythm, notes) {
  const nb = notes.split('|').map(b => b.trim().split(/\s+/).filter(Boolean)), ns = nb.flat();
  let rs = rhythm.split('|').map(r => r.trim());
  if (rs.length === 1) { const per = (rs[0].match(/x/g) || []).length; rs = Array.from({ length: Math.max(1, Math.round(ns.length / per)) }, () => rs[0]); }
  let k = 0;
  const bars = rs.map((r, bi) => {
    if (nb.length > 1 && (r.match(/x/g) || []).length !== (nb[bi] || []).length) throw new Error('montuno: bar ' + (bi + 1) + ' has ' + (nb[bi] || []).length + ' notes for ' + (r.match(/x/g) || []).length + ' places');
    if (r.length !== 16) throw new Error('montuno: a bar needs 16 sixteenths: ' + r);
    const out = [];
    for (let i = 0; i < r.length;) {
      let j = i + 1;
      if (r[i] === 'x') { while (j < r.length && r[j] === '-') j++; chunk(j - i, tok(ns[k++]), out); }
      else if (r[i] === '.') { while (j < r.length && r[j] === '.') j++; chunk(j - i, null, out); }
      else throw new Error('montuno: bad rhythm ' + r);
      i = j;
    }
    return out;
  });
  if (k !== ns.length) throw new Error('montuno: ' + ns.length + ' notes for ' + k + ' places');
  return bars;
}

// the rhythms, one bar each (16 sixteenths: one round of the clave)
const R32 = 'x-xx-xx-..x-x-x-';  // 3-2 guajeo: 1, & of 1, a of 1, e of 2, & of 2 | & of 3, 4, & of 4
const R23 = '..x-x-x-x-xx-xx-';  // the same guajeo from its second half, for 2-3 clave
const CLAVE32 = 'x--x--x---x-x-x-'; // the five clave hits of 3-2, and the & of 4
// three-note shapes on the top strings
const G = '67+62+59', C = '64+60+55', D7 = '66+60+57', AM = '64+60+57', DM7 = '65+60+57', G7 = '65+59+55';

export default [
  {
    id: 'cuba-montuno-thirds',
    style: 'cuba',
    name: 'Son montuno in thirds (3-2)',
    focus: 'technique',
    level: 1,
    minutes: 10,
    goal: 'Play a son montuno in thirds on strings 2 and 3 over C, F, G7, F, with each new chord arriving on the & before it.',
    why: 'Son guitarists and tres players fill the montuno with short figures in thirds that repeat every round of the clave. You learn one rhythm and keep it while the shapes move, so the clave and the early chord changes settle into your hands.',
    backing: { groove: 'son', bars: ['C F', 'G7 F'] },
    tempo: [70, 105],
    steps: [
      'Count every bar as 1 e & a 2 e & a 3 e & a 4 e & a. One bar is one round of 3-2 clave; the chord changes on 1 and 3.',
      'Clap the rhythm first: 1, & of 1, a of 1, e of 2, & of 2, then & of 3, 4, & of 4. The count grid shows it under the clave.',
      'The notes on the & of 2 and the & of 4 already belong to the next chord. Let them ring into the change.',
      'Play the top line alone, then the thirds. Pick down on the numbers and &s, up on the e and a counts.',
      'Stay on one variation for a full minute before you let it change.'
    ],
    variations: [
      {
        name: 'Top line',
        how: 'Single notes on string 2. Bar 1 goes up through C and F; bar 2 rocks between D and F over G7, then A and F over F. The G that ends bar 2 is the C chord arriving early.',
        bars: S(R32, '64 65 64 67 69 65 69 65 | 62 65 62 65 69 65 69 67'),
        time: '4/4', key: 'C'
      },
      {
        name: 'In thirds',
        how: 'The same rhythm with a third under every note, on string 3. The shapes slide along strings 2 and 3; the marks show the first two, E over C (fret 5) and F over D (frets 6 and 7).',
        bars: S(R32, '64+60 65+62 64+60 67+64 69+65 65+62 69+65 65+62 | 62+59 65+62 62+59 65+62 69+65 65+62 69+65 67+64'),
        time: '4/4', key: 'C',
        positions: [[2, 5], [3, 5], [2, 6], [3, 7]]
      },
      {
        name: 'Thumb on the anticipations',
        how: 'Fingers play the thirds rhythm. Your thumb adds the root of the next chord on the low strings on the & of 2 and the & of 4, with the fingers: F, then G, then F, then C.',
        grid: { rows: { thumb: '......x.......x.', fingers: 'x.xx.xx...x.x.x.' } }
      },
      {
        name: 'Only with the clave',
        how: 'Play the thirds only on the five clave hits, and let each one ring until the next. Then go back to the full rhythm and hear how it is built around these.',
        bars: S('x--x--x---x-x---', '64+60 64+60 69+65 65+62 69+65 | 62+59 62+59 69+65 65+62 69+65'),
        time: '4/4', key: 'C'
      }
    ],
    listen: { artist: 'Trío Matamoros', work: 'Son de la loma' }
  },
  {
    id: 'cuba-montuno-octaves-23',
    style: 'cuba',
    name: 'Son montuno in octaves (2-3)',
    focus: 'rhythm',
    level: 2,
    minutes: 10,
    goal: 'Play a guajeo in octaves on strings 2 and 4 over 2-3 clave, in A: A, D, E7, D.',
    why: 'Many son and salsa songs run their clave 2-3, starting from the half with two hits. A 2-3 guajeo is the 3-2 one started from its second half, so the same notes land on the clave whichever way round the song goes.',
    backing: { groove: 'son23', bars: ['A D', 'E7 D'] },
    tempo: [70, 110],
    steps: [
      'Listen to the backing first. The clave plays on the & of 1 and 2, then 3, the a of 3 and the & of 4.',
      'The guajeo rests on 1. It starts on the & of 1 with the clave, and the & of 2 and the & of 4 bring in the next chord early.',
      'Learn the top line on string 2. Then add the same note on string 4, three frets lower, and let a finger lie on string 3 to mute it.',
      'If you did the 3-2 thirds drill, this is its rhythm with the halves swapped. Compare the two count grids.'
    ],
    variations: [
      {
        name: 'Top line',
        how: 'Single notes on string 2: A and E over A, a run around F♯ over D, then G♯ to bring in E7. Bar 2 answers it and ends on E, the A chord arriving early.',
        bars: S(R23, '69 64 66 69 66 64 66 68 | 71 68 69 66 69 71 69 64'),
        time: '4/4', key: 'A'
      },
      {
        name: 'In octaves',
        how: 'Each note on string 2 and again on string 4, three frets lower, with string 3 muted. The marks show the A pair (frets 10 and 7) and the E pair (frets 5 and 2).',
        bars: S(R23, '69+57 64+52 66+54 69+57 66+54 64+52 66+54 68+56 | 71+59 68+56 69+57 66+54 69+57 71+59 69+57 64+52'),
        time: '4/4', key: 'A',
        positions: [[2, 10], [4, 7], [2, 5], [4, 2]]
      },
      {
        name: 'The picking hand never stops',
        how: 'Keep the pick moving in sixteenths, down on the numbers and &s, up on the e and a counts. Strike the octave where the guajeo plays (loud) and brush the muted strings everywhere else.',
        grid: { rows: { pick: 'xxXxXxXxXxXXxXXx' } }
      },
      {
        name: 'Hear it crossed',
        how: 'For one round, start the guajeo on 1 instead of the & of 1, as if the clave were 3-2. It fights the backing; Cubans call this cruzado, crossed. Put it back and feel it lock in.'
      }
    ],
    listen: { artist: 'Arsenio Rodríguez', work: 'Dundunbanza' }
  },
  {
    id: 'cuba-montuno-minor',
    style: 'cuba',
    name: 'Minor montuno in broken chords',
    focus: 'harmony',
    level: 2,
    minutes: 10,
    goal: 'Play a broken-chord montuno over A minor, D minor and E7 in fifth position, with the G♯ of E7 pulling back to A minor.',
    why: 'Minor son montunos (the son section of a bolero-son, many guajeos) turn on the E7 to A minor pull. Breaking the chords into a line shows you exactly which note moves where: G♯ up to A, D down to C.',
    backing: { groove: 'son', bars: ['Am Dm', 'E7 Am'] },
    tempo: [70, 105],
    steps: [
      'Learn the three shapes on strings 1 to 3 first: A minor at fret 5, D minor (frets 5, 6, 7) and E7 (frets 4, 5, 7). They are the variation called Chords on the clave.',
      'One bar is one round of 3-2 clave. The chords change on 1 and 3; the & of 4 already plays the next one.',
      'Play the broken chords with alternate picking. The rhythm is busy on the & of 2 and the a of 2, then quiet on 3.',
      'Listen for the two moves into A minor: G♯ goes up to A and D goes down to C.'
    ],
    variations: [
      {
        name: 'Broken chords',
        how: 'A minor, then D minor from the & of 2, then G♯ on the & of 4 for E7. Bar 2 walks down E7 and lands on C for A minor; the high C on the & of 4 starts A minor again.',
        bars: S('x-xx-xxx--xxx-x-', '69 64 60 64 62 65 69 65 62 68 | 71 68 64 62 60 64 69 64 60 72'),
        time: '4/4', key: 'Am'
      },
      {
        name: 'Chords on the clave',
        how: 'The three shapes on the clave hits and the & of 4. The marks show A minor; D minor and E7 sit within a fret of it.',
        bars: S(CLAVE32, '69+64+60 69+64+60 69+65+62 69+65+62 69+65+62 68+64+62 | 68+64+62 68+64+62 69+64+60 69+64+60 69+64+60 69+64+60'),
        time: '4/4', key: 'Am',
        positions: [[3, 5], [2, 5], [1, 5]]
      },
      {
        name: 'Thumb on the bass, fingers on the line',
        how: 'Fingers play the broken chords. Your thumb plays the root of the next chord on the & of 2 and the & of 4: D, E, A, A.',
        grid: { rows: { thumb: '......x.......x.', fingers: 'x.xx.xxx..xxx.x.' } }
      },
      {
        name: 'E7 with an F',
        how: 'In bar 2, play F instead of E over E7 (string 2, fret 6). The flat ninth gives the Spanish colour that many minor sones use. Hear how F wants to fall to E.',
        bars: S('x-xx-xxx--xxx-x-', '69 64 60 64 62 65 69 65 62 68 | 71 68 65 62 60 64 69 64 60 72'),
        time: '4/4', key: 'Am'
      }
    ],
    listen: { artist: 'Trío Matamoros', work: 'Lágrimas negras' }
  },
  {
    id: 'cuba-montuno-salsa',
    style: 'cuba',
    name: 'Salsa montuno in octaves (ii–V–I)',
    focus: 'technique',
    level: 3,
    minutes: 12,
    goal: 'Play a piano-style salsa montuno on guitar, in octaves on strings 1 and 3, over Dm7, G7 and C in 2-3 clave.',
    why: 'In salsa the piano plays the montuno in octaves with a chord note between. On guitar the same sound comes from octaves on strings 1 and 3 with a note on string 2. The ii–V–I shapes here move by half steps, the way a pianist voice-leads.',
    backing: { groove: 'son23', bars: ['Dm7 G7', 'C C'] },
    tempo: [75, 115],
    steps: [
      'The chords last two beats each: Dm7, G7, then C for a whole bar. The clave is 2-3.',
      'Learn the octave shape: string 1 and string 3 three frets lower, string 2 muted by the finger on string 3. Then the three-note shapes, which put a note on string 2.',
      'From Dm7 to G7 only the outer notes move, down a fret (frets 8, 6, 5 to 7, 6, 4).',
      'The rhythm is the 2-3 guajeo with one more note on the e of 2. Play it slowly with the count grid before you turn the backing on.'
    ],
    variations: [
      {
        name: 'Octaves',
        how: 'Octaves on strings 1 and 3. Over Dm7: C, D, C; over G7: B, D, B, G, B; the C on the & of 4 brings C major in early. Bar 2 stays on C, with a D on top as a colour, and its last D brings Dm7 back.',
        bars: S('..x-xxx-x-xx-xx-', '72+60 74+62 72+60 71+59 74+62 71+59 67+55 71+59 72+60 | 72+60 67+55 72+60 74+62 72+60 67+55 72+60 72+60 74+62'),
        time: '4/4', key: 'C',
        positions: [[1, 8], [3, 5]]
      },
      {
        name: 'Octaves with the middle note',
        how: 'On the & of 1, the & of 2, the a of 3 and the & of 4, add a chord note between the octave on string 2. The marks show Dm7 (frets 8, 6, 5); G7 is the same shape a fret lower on strings 1 and 3.',
        bars: S('..x-xxx-x-xx-xx-', '72+65+60 74+62 72+60 71+65+59 74+62 71+59 67+62+55 71+59 72+67+60 | 72+67+60 67+55 72+60 74+67+62 72+60 67+55 72+67+60 72+60 74+69+62'),
        time: '4/4', key: 'C',
        positions: [[1, 8], [2, 6], [3, 5]]
      },
      {
        name: 'Only the accents',
        how: 'The three-note shapes alone, on the & of 1, the & of 2, the a of 3 and the & of 4. This is the skeleton the octaves hang on; keep the hand moving through the rests.',
        bars: S('..x-..x-...x-.x-', '72+65+60 71+65+59 67+62+55 72+67+60 | 72+67+60 74+67+62 72+67+60 74+69+62'),
        time: '4/4', key: 'C'
      },
      {
        name: 'Make it yours',
        how: 'Keep the rhythm and the three-note shapes. Change only the order of the top notes inside each chord, one bar at a time. If it still lands on the clave and on the early changes, it is a montuno.'
      }
    ],
    listen: { artist: 'Eddie Palmieri', work: 'Azúcar pa’ ti' }
  },
  {
    id: 'cuba-montuno-guajira',
    style: 'cuba',
    name: 'Guajira montuno with thumb and fingers',
    focus: 'technique',
    level: 1,
    minutes: 8,
    goal: 'Fingerpick a slow guajira montuno over G, C and D7: the thumb on the early bass notes, the fingers on the clave.',
    why: 'The guajira is the country side of son: a solo guitar keeps the bass, the chords and the clave going at once. Splitting the job between thumb and fingers, then putting them together, is how it is learned.',
    backing: { groove: 'son', bars: ['G C', 'D7 D7'] },
    tempo: [60, 95],
    steps: [
      'Use open chords: G, C and D7. The fingers (i, m, a) play strings 3, 2 and 1; the thumb plays the bass strings.',
      'One bar is one round of 3-2 clave, chords changing on 1 and 3. Take it slowly: the guajira is relaxed.',
      'Learn the thumb alone, then the fingers alone, then put them together where they meet on the & of 2 and the & of 4.',
      'The last variation rolls the chords one note at a time; keep the thumb notes where they were.'
    ],
    variations: [
      {
        name: 'Thumb alone',
        how: 'Only the bass, on the & of 2 and the & of 4: C (string 5, fret 3) and D (string 4 open) in bar 1, then A (string 5 open) and G (string 6, fret 3) in bar 2. Each one is the next chord arriving early.',
        bars: S('......x-------x-', '48 50 | 45 43'),
        time: '4/4', key: 'G'
      },
      {
        name: 'Fingers on the clave',
        how: 'The top three strings of each chord, pinched on the five clave hits and on the & of 4.',
        bars: S(CLAVE32, `${G} ${G} ${C} ${C} ${C} ${D7} | ${D7} ${D7} ${D7} ${D7} ${D7} ${G}`),
        time: '4/4', key: 'G'
      },
      {
        name: 'Thumb and fingers together',
        how: 'The fingers keep the clave; on the & of 2 and the & of 4 the thumb plays its bass note with them.',
        bars: S(CLAVE32, `${G} ${G} 48+${C} ${C} ${C} 50+${D7} | ${D7} ${D7} 45+${D7} ${D7} ${D7} 43+${G}`),
        time: '4/4', key: 'G'
      },
      {
        name: 'Rolled',
        how: 'One note at a time in eighths, low to high across the top strings, with the thumb notes still on the & of 2 and the & of 4.',
        bars: S('x-x-x-x-x-x-x-x-', '59 62 67 48 55 60 64 50 | 57 60 66 45 57 60 66 43'),
        time: '4/4', key: 'G'
      }
    ],
    listen: { artist: 'Guillermo Portabales', work: 'El carretero' }
  },
  {
    id: 'cuba-montuno-chachacha',
    style: 'cuba',
    name: 'Cha-cha-chá guitar',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Comp a cha-cha-chá over C, Am, Dm7, G7: chords on the beat with the cha-cha-chá on 4, the & of 4 and 1, then a short guajeo.',
    why: 'The cha-cha-chá is danced on the beat, so its guitar part sits on the beat too, unlike the son. Its one push is the three strokes it is named after. Feeling the difference makes your son playing clearer as well.',
    backing: { groove: 'chacha', bars: ['C Am', 'Dm7 G7'] },
    tempo: [90, 126],
    steps: [
      'Count it as written: 1 & 2 & 3 & 4 &, one chord for two beats. The cowbell plays every beat.',
      'Use the top three strings: C (open, fret 1, open), A minor (open, 1, 2), Dm7 (1, 1, 2) and G7 (1, open, open).',
      'Strike on every beat, and add the & of 4: 4, &, 1 is the cha-cha-chá.',
      'Then the guajeo: single notes in eighths that leave out 2 and 4.'
    ],
    variations: [
      {
        name: 'On the beat, with the cha-cha-chá',
        how: 'Short chords on 1, 2, 3 and 4, and one more on the & of 4. Together with the next 1 that is the cha-cha-chá.',
        bars: S('x---x---x---x-x-', `${C} ${C} ${AM} ${AM} ${AM} | ${DM7} ${DM7} ${G7} ${G7} ${G7}`),
        time: '4/4', key: 'C'
      },
      {
        name: 'Guajeo in eighths',
        how: 'Single notes on strings 1 and 2 on 1, the & of 1, the & of 2, 3, the & of 3 and the & of 4. The F that ends bar 2 falls to E, from G7 to C.',
        bars: S('x-x-..x-x-x-..x-', '64 67 64 60 64 69 | 65 69 65 59 62 65'),
        time: '4/4', key: 'C'
      },
      {
        name: 'Bass and chords',
        how: 'Thumb on the root on 1 and 3; fingers on 2, 4 and the & of 4.',
        grid: { rows: { thumb: 'x.......x.......', fingers: '....x.......x.x.' } }
      },
      {
        name: 'Only the cha-cha-chá',
        how: 'Rest through 2 and 3 and play only 4, the & of 4 and the next 1. Count the rests out loud.',
        grid: { rows: { strum: 'x...........x.x.' } }
      }
    ],
    listen: { artist: 'Orquesta Aragón', work: 'El bodeguero' }
  }
];
