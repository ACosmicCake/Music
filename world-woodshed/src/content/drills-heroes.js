/* World Woodshed — jazz drills in the manner of two players: Thelonious Monk and Sun Ra. Each drill carries
   `players`, the ids in src/players.js, so the plan can lean toward them when they are your favourites.
   Every phrase here is an original practice pattern built from the devices these players are known for
   (whole-tone runs, minor seconds, displaced motifs and stride for Monk; vamps, space, stacked fourths and
   free playing over a pulse for Sun Ra). None is a transcription of a recording.
   Phrases use the short form of drills-c.js: 'midi:dur', '.' after the duration for a dot, 'b' or '#' after
   the pitch to spell it, 'r' for a rest, '|' between bars, '+' between the pitches of a chord on one stem. */

const P = s => s.trim().split('|').map(bar => bar.trim().split(/\s+/).map(tok => {
  const [m0, d0] = tok.split(':');
  const dot = d0.endsWith('.'), sp = /[b#]$/.test(m0) ? m0.slice(-1) : null, m = sp ? m0.slice(0, -1) : m0;
  const ch = m.includes('+') ? m.split('+').map(Number) : null;
  const n = { m: m === 'r' ? null : ch ? Math.max(...ch) : Number(m), d: dot ? d0.slice(0, -1) : d0 };
  if (ch) n.ch = ch;
  if (dot) n.dot = true;
  if (sp) n.sp = sp;
  return n;
}));

// Chord shapes, as '+'-joined sounding pitches (strings 3–1 unless the name says otherwise)
const C6R = '59+60+64';        // C6 with B against C: B (3rd string, 4th fret), C (2nd, 1st), E (open 1st)
const G7B9 = '53+56+59+67';    // G7♭9 without its root: F A♭ B, G on top (4th string 3rd fret, 3rd 1st, 2nd open, 1st 3rd)
const A7T = '55+61+64';        // A7: G C♯ E (3rd open, 2nd 2nd fret, 1st open)
const DM7T = '57+60+65';       // Dm7: A C F (3rd 2nd fret, 2nd 1st, 1st 1st)
const G7T = '55+59+65';        // G7: G B F (3rd open, 2nd open, 1st 1st fret)
const EQ = '40+45+50+55';      // E minor in fourths: E A D G, the four open bass strings
const FQ = '41+46+51+56';      // the same stack a fret higher (F B♭ E♭ A♭), a barre at the 1st fret
const FSQ = '42+47+52+57';     // and a fret higher again, at the 2nd fret
const F7S = '41+45+51+59';     // F7♯11: F A E♭ B (6th string 1st fret, open A, 4th string 1st fret, open B; 3rd string muted)

export default [
  /* ====================== THELONIOUS MONK ====================== */
  {
    id: 'jazz-monk-wholetone',
    style: 'jazz',
    players: ['monk'],
    name: 'Monk: whole-tone runs down a dominant',
    focus: 'melody',
    level: 2,
    minutes: 8,
    goal: 'Play the whole-tone scale over G7, fast and even, and land on a note of C6 on beat 1.',
    why: 'Monk loved the whole-tone scale over dominant chords: six notes a whole step apart, so every note sounds as strange as the next and the line has no home until the chord resolves. Running it down a dominant and landing cleanly is the move, and once your hand knows the shape you can put it anywhere.',
    backing: { groove: 'swing', bars: ['Dm7', 'G7', 'C6', 'C6'] },
    tempo: [70, 180],
    steps: [
      'The whole-tone scale on G: G A B C♯ D♯ F. It has the 3rd (B) and 7th (F) of G7, plus the ♯11 (C♯) and ♯5 (D♯).',
      'On one string it is every second fret. Across strings it is two or three notes per string, moving by whole steps.',
      'Play it straight, not swung, as Monk often did with these runs: an even rush of notes that stops dead on the next chord.',
      'Hit the landing note hard and stop. The silence after it is part of the effect.'
    ],
    variations: [
      { name: 'Down in eighths', how: 'Dm7 arpeggio, then from F down the whole-tone scale, landing on E, the 3rd of C6.', bars: P('62:q 65:q 69:q 72:q | 77:8 75b:8 73b:8 71:8 69:8 67:8 65:8 63b:8 | 64:h. r:q | r:w'), time: '4/4', key: 'C' },
      { name: 'Up in eighths', how: 'From G up the same scale to A, then fall to E.', bars: P('62:q 65:q 69:q 72:q | 67:8 69:8 71:8 73#:8 75#:8 77:8 79:8 81:8 | 76:h. r:q | r:w'), time: '4/4', key: 'C' },
      { name: 'Augmented triads', how: 'The whole-tone scale is two augmented triads: G B D♯ and A C♯ F. Play them as broken chords with a rest after each.', bars: P('62:q 65:q 69:q 72:q | 67:8 71:8 75#:8 r:8 69:8 73#:8 77:8 r:8 | 76:q 72:q r:h | r:w'), time: '4/4', key: 'C' },
      { name: 'Anywhere', how: 'Take the run to D7 (whole-tone on D) and E♭7 (whole-tone on E♭: the other of the two whole-tone scales). There are only two, so you already know them all.' }
    ],
    listen: { artist: 'Thelonious Monk', work: 'Brilliant Corners' }
  },
  {
    id: 'jazz-monk-seconds',
    style: 'jazz',
    players: ['monk'],
    name: 'Monk: minor seconds that rub',
    focus: 'harmony',
    level: 2,
    minutes: 8,
    goal: 'Comp and play melodies with two notes a half step apart sounding together, and hear them as colour, not a mistake.',
    why: 'Monk’s chords often hold two notes a half step apart, and he would strike a note together with the one below it and let that one go (a crushed note). It makes a plain chord sound bent. On guitar the rub comes easiest from an open string against a fretted one.',
    backing: { groove: 'swing', bars: ['C6', 'C6', 'G7', 'C6'] },
    tempo: [70, 160],
    steps: [
      'C6 with the rub: B on the 3rd string, 4th fret, C on the 2nd string, 1st fret, open high E. B and C together are the rub.',
      'G7♭9 without its root: F (4th string, 3rd fret), A♭ (3rd string, 1st fret), open B, G on the 1st string, 3rd fret.',
      'Play each chord short and hard, then let the silence ring as long as the chord did.',
      'For the crushed notes, strike both notes together and lift the lower finger at once, so only the upper note sustains.'
    ],
    variations: [
      { name: 'The rub on C6', how: 'Held, then short on 1 and 3, then G7♭9 back to C6.', bars: P(`${C6R}:h r:h | ${C6R}:q r:q ${C6R}:q r:q | ${G7B9}:h r:h | ${C6R}:w`), time: '4/4', key: 'C' },
      { name: 'Crushed notes', how: 'Each chord tone struck with the note a half step below it, then held alone: E, G, the B of G7, E.', bars: P('63+64:q 64:q r:h | 66+67:q 67:q r:h | 70+71:q 71:q r:h | 63+64:h r:h'), time: '4/4', key: 'C' },
      { name: 'Stabs off the beat', how: 'Just B and C, on the & of 1 and the & of 3; F and B over G7; then the whole chord.', bars: P(`r:8 59+60:8 r:q r:8 59+60:8 r:q | r:w | r:8 53+59:8 r:q r:8 53+59:8 r:q | ${C6R}:h r:h`), time: '4/4', key: 'C' },
      { name: 'Your own rub', how: 'Take any chord you know, find an open string a half step from one of its notes, and add it. Keep the ones you like.' }
    ],
    listen: { artist: 'Thelonious Monk', work: 'Monk’s Dream' }
  },
  {
    id: 'jazz-monk-displaced',
    style: 'jazz',
    players: ['monk'],
    name: 'Monk: one idea, moved across the beat',
    focus: 'rhythm',
    level: 3,
    minutes: 10,
    goal: 'Repeat a three-note idea in straight eighths over 4/4 so it lands on a different part of the beat each time, then come out on beat 1.',
    why: 'Monk built solos out of a tiny idea played again and again, each time shifted against the beat. Three eighths in a bar of eight never line up the same way twice until three bars have gone by. Keeping your place while the idea turns around is the skill.',
    backing: { groove: 'swing', bars: ['Bb7', 'Bb7', 'Bb7', 'Bb7'] },
    tempo: [70, 160],
    steps: [
      'Count “1 & 2 & 3 & 4 &” out loud, or tap your foot on every beat, the whole time.',
      'The idea is F, D, B♭: down the B♭ chord. Play it over and over without a gap.',
      'Mark where it starts: on 1, then the & of 2, then 4, then the & of 1 in the next bar.',
      'Eight times through is exactly three bars. Land on B♭ on beat 1 of bar 4.'
    ],
    variations: [
      { name: 'Three against four', how: 'F D B♭ eight times, then the high B♭ on 1.', bars: P('65:8 62:8 58:8 65:8 62:8 58:8 65:8 62:8 | 58:8 65:8 62:8 58:8 65:8 62:8 58:8 65:8 | 62:8 58:8 65:8 62:8 58:8 65:8 62:8 58:8 | 70:h r:h'), time: '4/4', key: 'Bb' },
      { name: 'Two notes and a rest', how: 'F D and a rest of an eighth: the gap moves round the bar too.', bars: P('65:8 62:8 r:8 65:8 62:8 r:8 65:8 62:8 | r:8 65:8 62:8 r:8 65:8 62:8 r:8 65:8 | 62:8 r:8 65:8 62:8 r:8 65:8 62:8 r:8 | 70:h r:h'), time: '4/4', key: 'Bb' },
      { name: 'With a rub', how: 'The same idea with a minor second in it, Monk style: F, E, B♭.', bars: P('65:8 64:8 58:8 65:8 64:8 58:8 65:8 64:8 | 58:8 65:8 64:8 58:8 65:8 64:8 58:8 65:8 | 64:8 58:8 65:8 64:8 58:8 65:8 64:8 58:8 | 70:h r:h'), time: '4/4', key: 'Bb' },
      { name: 'Your own idea', how: 'Make up a three-note idea from the B♭ blues scale and run it the same way. Then try a five-note idea: it takes five bars to come round.' }
    ],
    listen: { artist: 'Thelonious Monk Quartet with John Coltrane', work: 'At Carnegie Hall' }
  },
  {
    id: 'jazz-monk-stride',
    style: 'jazz',
    players: ['monk'],
    name: 'Monk: stride on guitar',
    focus: 'harmony',
    level: 2,
    minutes: 8,
    goal: 'Play a stride left hand on guitar: a bass note on 1 and 3, a chord on 2 and 4, through C6–A7–Dm7–G7.',
    why: 'Monk came out of Harlem stride piano, and on his solo records the left hand still leaps from a low bass note to a chord in the middle. On guitar the bass goes on the 5th and 6th strings and the chord on the top three, so your hand learns to jump between them in time.',
    backing: { groove: 'swing', bars: ['C6', 'A7', 'Dm7', 'G7'] },
    tempo: [60, 150],
    steps: [
      'Bass notes with your thumb, chords with your fingers (or a pick, jumping strings).',
      'Bass on 1 and 3: the root, then the 5th below. Chord on 2 and 4, short.',
      'C6: C (5th string, 3rd fret), then G (6th, 3rd). A7: open A, then open E. Dm7: open D, then open A. G7: G (6th, 3rd), then open D.',
      'Mute the bass note as the chord sounds, so the two don’t blur.'
    ],
    variations: [
      { name: 'Bass and chord', how: 'Root, chord, 5th, chord, in every bar.', bars: P(`48:q ${C6R}:q 43:q ${C6R}:q | 45:q ${A7T}:q 40:q ${A7T}:q | 50:q ${DM7T}:q 45:q ${DM7T}:q | 43:q ${G7T}:q 50:q ${G7T}:q`), time: '4/4', key: 'C' },
      { name: 'Walk up to the next bass', how: 'Replace the last chord of each bar with a bass note a half step from the next root.', bars: P(`48:q ${C6R}:q 43:q 44:q | 45:q ${A7T}:q 40:q 49:q | 50:q ${DM7T}:q 45:q 42:q | 43:q ${G7T}:q 50:q 47:q`), time: '4/4', key: 'C' },
      { name: 'Leave the 1 out', how: 'Skip the bass on 1 of every second bar and play nothing there, Monk style. The band keeps the time.' }
    ],
    listen: { artist: 'Thelonious Monk', work: 'Thelonious Himself' }
  },

  /* ====================== SUN RA ====================== */
  {
    id: 'jazz-sunra-vamp',
    style: 'jazz',
    players: ['sunra'],
    name: 'Sun Ra: space over a vamp',
    focus: 'melody',
    level: 1,
    minutes: 8,
    goal: 'Over a one-chord vamp in E minor, play short phrases and leave whole bars empty.',
    why: 'Sun Ra’s Arkestra often sat on one chord or one bass figure for a long time, with chants and solos floating over it. Over a vamp nothing pushes you to the next chord, so what you leave out matters as much as what you play.',
    backing: { groove: 'highlife', bars: ['Em7', 'Em7', 'Em7', 'Em7'] },
    tempo: [80, 130],
    steps: [
      'E minor pentatonic: E G A B D. Open strings and the 2nd and 3rd frets give you all of it.',
      'Play one to three notes, then rest a whole bar. Count the empty bar.',
      'Hold the last note of each phrase as long as you can.',
      'Listen to the bell and bass and answer them, as if you were one more voice in the band.'
    ],
    variations: [
      { name: 'Three notes, then wait', how: 'E G B up, rest; A G E down, rest.', bars: P('64:q 67:q 71:h | r:w | 69:q 67:q 64:h | r:w'), time: '4/4', key: 'Em' },
      { name: 'The bass figure', how: 'Play the vamp’s bass line yourself: open E twice, B (5th string, 2nd fret), open D; A at the end.', bars: P('40:q. 40:8 r:8 47:8 50:q | 40:q. 40:8 r:8 47:8 50:q | 40:q. 40:8 r:8 47:8 50:q | 40:q. 40:8 r:8 47:8 45:q'), time: '4/4', key: 'Em' },
      { name: 'Long tones that bend', how: 'One note per two bars, bent slowly up and back, or slid into from a fret below. Play nothing else.' },
      { name: 'Chant and answer', how: 'Sing a two-bar phrase on one syllable, then play it, then change one note. The Arkestra chanted over vamps like this one.' }
    ],
    listen: { artist: 'Sun Ra', work: 'Space Is the Place' }
  },
  {
    id: 'jazz-sunra-fourths',
    style: 'jazz',
    players: ['sunra'],
    name: 'Sun Ra: chords in fourths that drift',
    focus: 'harmony',
    level: 2,
    minutes: 8,
    goal: 'Play E minor as a stack of fourths, slide it up by half steps and back, and move to F7♯11.',
    why: 'Chords built in fourths have no clear root, so they float. Sun Ra moved shapes like this by half steps over a pedal note, and the clash between the shape and the bass is the sound. On guitar the four open bass strings are already a stack of fourths.',
    backing: { groove: 'drone', bars: ['Em7', 'Em7', 'F7#11', 'Em7'] },
    tempo: [50, 110],
    steps: [
      'Strum the four open bass strings, E A D G: each a fourth above the one below.',
      'Barre the same four strings at the 1st fret, then the 2nd: the stack moves up a half step each time.',
      'F7♯11: F on the 6th string, 1st fret, open A, E♭ on the 4th string, 1st fret, open B. Mute the 3rd string with the barre finger.',
      'Let every chord ring until it fades, and listen to it rub against the drone.'
    ],
    variations: [
      { name: 'Ring and change', how: 'The open stack for two bars, F7♯11, back to the stack.', bars: P(`${EQ}:w | ${EQ}:w | ${F7S}:w | ${EQ}:w`), time: '4/4', key: 'Em' },
      { name: 'Slide the stack', how: 'Up a fret, up another, then back down to the open strings.', bars: P(`${EQ}:h ${FQ}:h | ${FSQ}:h ${FQ}:h | ${F7S}:w | ${EQ}:w`), time: '4/4', key: 'Em' },
      { name: 'Clusters', how: 'Three notes next to each other in E minor (D E F♯ or G A B) on three strings, struck soft and left to fade.' }
    ],
    listen: { artist: 'Sun Ra and His Arkestra', work: 'Lanquidity' }
  },
  {
    id: 'jazz-sunra-freepulse',
    style: 'jazz',
    players: ['sunra'],
    name: 'Sun Ra: free over a steady pulse',
    focus: 'ear',
    level: 3,
    minutes: 10,
    goal: 'Improvise with no bar lines and no key while the band keeps a steady pulse, and come back to E when you choose.',
    why: 'On records such as The Heliocentric Worlds of Sun Ra the Arkestra played free, but often over a pulse someone kept. Playing free means choosing sounds on purpose: register, density, loud and soft, noise and pitch. A pulse under you lets you leave the key without losing the band.',
    backing: { groove: 'drone', bars: ['Em7', 'Em7', 'Em7', 'Em7'] },
    tempo: [50, 120],
    steps: [
      'Decide one thing before each phrase: high or low, many notes or few, loud or soft.',
      'Change only that one thing in the next phrase.',
      'Use the whole neck, the strings behind the nut, scrapes and harmonics as well as notes.',
      'Every so often come back to E and land on it in time with the pulse, so you and the band agree where home is.'
    ],
    variations: [
      { name: 'Register only', how: 'Two minutes: the same short idea, moved from the lowest notes to the highest and back.' },
      { name: 'Density only', how: 'From one note every few seconds to as many as you can play, then back.' },
      { name: 'Out and home', how: 'Leave the key for four bars, then land on E on a beat. Make the landing obvious.' },
      { name: 'Sounds, not notes', how: 'One minute without a single clear pitch: scrapes, mutes, harmonics, taps on the body.' }
    ],
    listen: { artist: 'Sun Ra', work: 'The Heliocentric Worlds of Sun Ra, Vol. 1' }
  }
];
