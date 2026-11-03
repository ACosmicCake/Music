/* World Woodshed — style drills: Southern Africa & Madagascar, Mexico, Colombia & Venezuela, mainland Southeast Asia.
   Phrases use the short form of drills-a.js ('midi:dur', '.' after the duration for a dot, 'b' or '#' after the
   pitch to spell it, 'r' for a rest, '|' between bars), plus '+' between pitches for a double stop or chord on
   one stem ('67+71:8'), stored as n.ch with n.m its top note, as the montunos are. Pitches are sounding MIDI. */

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

// Chord shapes used below, as '+'-joined sounding pitches
const G3 = '55+59+67', D7T = '57+60+66', CT = '52+55+60', G7T = '53+55+59', AMT = '57+60+64', E7T = '56+62+64';

export default [
  /* ====================== SOUTHERN AFRICA & MADAGASCAR ====================== */
  {
    id: 'southernafrica-township-chops',
    style: 'southernafrica',
    name: 'Township offbeat chops on the cycle',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Chop short triads on the offbeats through the I–IV–I–V cycle, steady and dry, for several minutes.',
    why: 'In mbaqanga and kwela the rhythm guitar is part of the drum kit. The cycle never resolves, so the groove has to carry the music; keeping the chops exactly the same round after round, while the voicing and the stroke change, builds the steadiness the style lives on.',
    backing: { groove: 'mbaqanga', bars: ['G C', 'G D'] },
    tempo: [96, 126],
    steps: [
      'Fret the three triads on strings 4–2: G at frets 5–4–3, C at 5–5–5, D at 7–7–7. Mute strings 1, 5 and 6.',
      'Count 1 e & a 2 e & a 3 e & a 4 e & a. The chord changes on 1 and on 3.',
      'Strike a short downstroke on each &, then ease the fretting pressure at once so the chord stops.',
      'Keep the picking hand moving down on the beat and up on the &, even where you do not strike.',
      'Play for three minutes without stopping. The aim is that nobody notices you, until you stop.'
    ],
    variations: [
      { name: 'Downstroke chops on every &', how: 'Four short chops per bar: & of 1, & of 2, & of 3, & of 4. G for two beats, then C; G again, then D.', positions: [[4, 5], [3, 4], [2, 3]],
        grid: { rows: { chop: '..x...x...x...x.' } } },
      { name: 'Upstroke chops', how: 'The same four chops, now with upstrokes, so the hand goes down silently on the beat and catches the strings on the way up. Brighter and lighter.',
        grid: { rows: { chop: '..x...x...x...x.' } } },
      { name: 'Leave room: & of 1 and & of 3', how: 'Two chops per bar, only on the & of 1 and the & of 3, as a second guitar does when a lead guitar plays.',
        grid: { rows: { chop: '..x.......x.....' } } },
      { name: 'Ghost and chop', how: 'Brush the muted strings very lightly on each beat, then chop on the &. The ghost strokes keep your time; the chops are the part.',
        grid: { rows: { ghost: 'x...x...x...x...', chop: '..X...X...X...X.' } } },
      { name: 'C and D higher', how: 'Keep G at 5–4–3 but play C at 10–9–8 (strings 4–2) and D at 12–11–10, so each chord jumps up the neck. Same chops; the shift must not make you late.', positions: [[4, 10], [3, 9], [2, 8]] }
    ],
    listen: { artist: 'Mahlathini and the Mahotella Queens', work: 'Thokozile' }
  },
  {
    id: 'southernafrica-mbaqanga-lead',
    style: 'southernafrica',
    name: 'Mbaqanga lead: one line through the cycle',
    focus: 'melody',
    level: 2,
    minutes: 10,
    goal: 'Play a short, bright, picked line high on the neck that repeats with the cycle and changes one note to fit each chord.',
    why: 'Mbaqanga lead guitar is built from short figures repeated many times, placed between the bass notes. Changing a single note as the chord changes teaches you to hear the harmony move under a fixed pattern, which is how Marks Mankwane and his followers built their parts.',
    backing: { groove: 'mbaqanga', bars: ['G C', 'G D'] },
    tempo: [88, 124],
    steps: [
      'Use a pick and a clean, bright tone. Play on strings 1–3 between the 7th and 15th frets.',
      'Learn variation 1 slowly: every note is on an &, between the beats.',
      'Play each note short, with a little palm mute, so there is air between them.',
      'Listen to the bass: your notes should fall in its gaps.',
      'When it is steady, play it for two minutes, then switch to the thirds.'
    ],
    variations: [
      { name: 'Offbeat line', how: 'B, D, E, D over G and C; B, D, F♯, D over G and D. Only the third note changes. Every note on an &.',
        bars: P('r:8 71:8 r:8 74:8 r:8 76:8 r:8 76:8 | r:8 71:8 r:8 74:8 r:8 78:8 r:8 74:8'), time: '4/4', key: 'G',
        positions: [[1, 7], [1, 10], [1, 12], [1, 14]] },
      { name: 'Thirds on strings 3 and 2', how: 'The classic double stops: G and B at the 12th fret, B and D at the 16th and 15th, A and C at the 14th and 13th. Slide into each from a fret below.',
        bars: P('r:8 67+71:8 r:8 71+74:8 r:8 69+72:8 r:8 69+72:8 | r:8 67+71:8 r:8 71+74:8 r:8 71+74:8 r:8 69+72:8'), time: '4/4', key: 'G',
        positions: [[3, 12], [2, 12], [3, 16], [2, 15]] },
      { name: 'Hammer-on pickup', how: 'A quick A to B hammer-on before each bar’s line, then a run back down at the end of the bar. Keep the hammer-on in time: two sixteenths.',
        bars: P('r:8 69:16 71:16 r:8 74:8 r:8 76:8 74:8 71:8 | r:8 69:16 71:16 r:8 74:8 r:8 78:8 76:8 74:8'), time: '4/4', key: 'G' },
      { name: 'Answer the voice', how: 'Rest for a whole bar, as if a singer had the line, then play the offbeat line in the next. Start your answer just as the imagined voice ends.',
        bars: P('r:w | r:8 71:8 r:8 74:8 r:8 78:8 r:8 74:8'), time: '4/4', key: 'G' },
      { name: 'Make your own', how: 'Keep the rhythm of variation 1 and choose your own four notes from G major pentatonic (G A B D E), adding C over C and F♯ over D.' }
    ],
    listen: { artist: 'Various artists', work: 'The Indestructible Beat of Soweto' }
  },
  {
    id: 'southernafrica-maskanda-thumb',
    style: 'southernafrica',
    name: 'Maskanda thumb and finger',
    focus: 'technique',
    level: 2,
    minutes: 10,
    goal: 'Play a steady thumb bass on the low strings and a falling melody with the index finger, alternating, in E.',
    why: 'Ukupika, picking, is the core of maskanda: one hand plays a bass and a melody that answer each other. Learning it with a falling line, the shape of Zulu song, trains both the independence of thumb and finger and the sound of the style.',
    backing: { groove: 'mbaqanga', bars: ['E', 'E', 'B7', 'E'] },
    tempo: [70, 112],
    steps: [
      'No pick: thumb on strings 4–6, index finger on strings 1–3.',
      'Play variation 1, the thumb alone, until it is steady and even: E, B, E, B.',
      'Add the index finger between the thumb notes. Thumb and finger alternate, never together.',
      'Let the melody fall: start high and walk down E major pentatonic (E F♯ G♯ B C♯).',
      'Keep the thumb a little softer than the melody, so the line sings over it.'
    ],
    variations: [
      { name: 'Thumb alone', how: 'Open low E on 1 and 3, B (string 5, 2nd fret) on 2 and 4. Even and relaxed.',
        bars: P('40:q 47:q 40:q 47:q'), time: '4/4', key: 'E', positions: [[6, 0], [5, 2]] },
      { name: 'Thumb and finger alternate', how: 'The thumb plays on the beats; the index finger plays a falling line on the &s: B, G♯, F♯, E.',
        bars: P('40:8 71:8 47:8 68:8 40:8 66:8 47:8 64:8'), time: '4/4', key: 'E', positions: [[1, 7], [1, 4], [1, 2], [1, 0]] },
      { name: 'Two bars falling', how: 'Start at the 12th fret (E) and fall through two bars down to the open B string, the thumb steady underneath.',
        bars: P('40:8 76:8 47:8 73:8 40:8 71:8 47:8 68:8 | 40:8 66:8 47:8 64:8 40:8 61:8 47:8 59:8'), time: '4/4', key: 'E' },
      { name: 'Hammer-ons from the open strings', how: 'The finger plays two notes after some thumb notes: open E hammered to F♯, open B hammered to C♯.',
        bars: P('40:8 64:16 66:16 47:8 59:16 61:16 40:8 64:8 47:8 59:8'), time: '4/4', key: 'E' },
      { name: 'Izihlabo, then the pattern', how: 'Open with a fast run down E major pentatonic from the 12th fret to the open low E, then go straight into the alternating pattern. Confidence matters more than strict time in the run.',
        bars: P('76:16 73:16 71:16 68:16 66:16 64:16 61:16 59:16 56:16 54:16 52:16 49:16 47:16 44:16 42:16 40:16 | 40:8 71:8 47:8 68:8 40:8 66:8 47:8 64:8'), time: '4/4', key: 'E' }
    ],
    listen: { artist: 'Shiyani Ngcobo', work: 'Introducing Shiyani Ngcobo' }
  },
  {
    id: 'southernafrica-bow-roots',
    style: 'southernafrica',
    name: 'Two roots a whole step apart',
    focus: 'harmony',
    level: 2,
    minutes: 8,
    goal: 'Alternate two major chords a whole step apart, C and D, and sing or play falling pentatonic lines over them.',
    why: 'Zulu and Xhosa bows give two fundamentals about a whole step apart, and older southern African song was built on that pair of harmonies rather than on I–IV–V. Hearing and playing it gives you a sound that runs under maskanda melodies and much Xhosa choral music.',
    backing: { groove: 'drone', bars: ['C', 'D', 'C', 'D'] },
    tempo: [60, 92],
    steps: [
      'Play C on the top three strings (open G, C at the 1st fret of string 2, open E) and D (A at the 2nd fret of string 3, D at the 3rd of string 2, F♯ at the 2nd of string 1).',
      'Strum each chord for a bar, in quarters, and listen to the step between the roots.',
      'Hum a falling line over each chord before you play it.',
      'Play the falling lines of variation 2, then let one pentatonic cover both chords.',
      'Notice that neither chord feels like home; the music lives in the swing between them.'
    ],
    variations: [
      { name: 'Alternate the two chords', how: 'One bar of C, one bar of D, strummed in quarters on the top three strings.',
        bars: P(`${'55+60+64:q '.repeat(4)}| ${'57+62+66:q '.repeat(4)}`), time: '4/4', key: 'C' },
      { name: 'A falling line on each', how: 'G, E, D, C over C; A, F♯, E, D over D. Each line falls from the chord’s fifth to its root.',
        bars: P('67:q 64:q 62:q 60:q | 69:q 66:q 64:q 62:q'), time: '4/4', key: 'C' },
      { name: 'One pentatonic for both', how: 'C major pentatonic (C D E G A) over both chords. Over D it sounds open and suspended, close to the bow’s sound.',
        bars: P('72:8 69:8 67:8 64:8 62:q 60:q | 74:8 72:8 69:8 67:8 64:q 62:q'), time: '4/4', key: 'C' },
      { name: 'Thumb roots, finger melody', how: 'The thumb plays the root (C on string 5, D on string 4) on every beat; the finger plays the falling line between.',
        bars: P('48:8 67:8 48:8 64:8 48:8 62:8 48:8 60:8 | 50:8 69:8 50:8 66:8 50:8 64:8 50:8 62:8'), time: '4/4', key: 'C' }
    ],
    listen: { artist: 'Busi Mhlongo', work: 'Urbanzulu' }
  },
  {
    id: 'southernafrica-salegy-hemiola',
    style: 'southernafrica',
    name: 'Salegy: six notes in two and in three',
    focus: 'rhythm',
    level: 2,
    minutes: 8,
    goal: 'Pick even eighths in a fast 12/8 and move the accents between two groups of three and three groups of two without changing the notes.',
    why: 'Salegy and tsapiky are felt in two and in three at once. Moving the accents while the hand keeps the same motion trains you to hear both meters, which is what lets you lock with a Malagasy band, whichever part you follow.',
    backing: { groove: 'salegy', bars: ['A', 'D', 'E', 'D'] },
    tempo: [80, 120],
    grid: { time: '12/8' },
    steps: [
      'Count 1 2 3 4 5 6 for each half of the bar. The backing’s bass is in two; its guitar chops are in three.',
      'Pick every eighth with thumb and fingers: thumb on the accented notes.',
      'Accent 1 and 4 of each half (variation 1), then 1, 3 and 5 (variation 2).',
      'Switch between the two every bar without stopping.',
      'Then play the picked lines, keeping the accents clear.'
    ],
    variations: [
      { name: 'Accents in two', how: 'Thumb on 1 and 4 of each six, fingers on the other notes.',
        grid: { rows: { thumb: 'X..X..X..X..', fingers: '.xx.xx.xx.xx' } } },
      { name: 'Accents in three', how: 'Thumb on 1, 3 and 5 of each six. The same notes, now in three.',
        grid: { rows: { thumb: 'X.X.X.X.X.X.', fingers: '.x.x.x.x.x.x' } } },
      { name: 'Two, then three', how: 'The first half of the bar in two, the second in three. Then swap.',
        grid: { rows: { thumb: 'X..X..X.X.X.', fingers: '.xx.xx.x.x.x' } } },
      { name: 'Picked thirds', how: 'A tsapiky-style line in thirds on strings 1 and 2 over A, with gaps so it breathes.',
        bars: P('73+76:8 r:8 71+74:8 69+73:8 r:8 68+71:8 69+73:8 r:8 71+74:8 73+76:8 r:8 r:8'), time: '12/8', key: 'A' },
      { name: 'Valiha pattern', how: 'Alternate thumb and fingers between low and high strings so each note rings into the next, like the bamboo zither: A, E, A, C♯, E, E.',
        bars: P('45:8 64:8 57:8 61:8 52:8 64:8 45:8 64:8 57:8 61:8 52:8 64:8'), time: '12/8', key: 'A' }
    ],
    listen: { artist: 'Henry Kaiser and David Lindley', work: 'A World Out of Time' }
  },

  /* ====================== MEXICO ====================== */
  {
    id: 'mexico-ranchera-vals',
    style: 'mexico',
    name: 'Ranchera vals: bass, strum, strum',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Accompany a ranchera waltz with a bass note on 1 that alternates root and fifth, short chords on 2 and 3, and bass runs into the changes.',
    why: 'The vals is the most common ranchera accompaniment. Its alternating bass and the bajeos, the runs between chords, are what make a guitar sound like a mariachi’s guitar and guitarrón rather than a strummed folk waltz.',
    backing: { groove: 'vals', bars: ['G', 'G', 'D7', 'D7', 'D7', 'D7', 'G', 'G'] },
    tempo: [120, 170],
    steps: [
      'G: low G on string 6, 3rd fret, and the chord on the top three strings (open G and B, G at the 3rd fret of string 1).',
      'D7: open D on string 4, and the chord at A (string 3, 2nd fret), C (string 2, 1st fret), F♯ (string 1, 2nd fret).',
      'Play the bass on 1 with the thumb, a little louder; strum short on 2 and 3.',
      'Alternate the bass: root in one bar, fifth in the next.',
      'Add the runs only at the end of a phrase, where a singer would hold a note.'
    ],
    variations: [
      { name: 'Bass on 1, chord on 2 and 3', how: 'Two bars of G with the same low G.',
        bars: P(`43:q ${G3}:q ${G3}:q | 43:q ${G3}:q ${G3}:q`), time: '3/4', key: 'G' },
      { name: 'Root, then fifth', how: 'G with G, then D in the bass; D7 with D, then A.',
        bars: P(`43:q ${G3}:q ${G3}:q | 50:q ${G3}:q ${G3}:q | 50:q ${D7T}:q ${D7T}:q | 45:q ${D7T}:q ${D7T}:q`), time: '3/4', key: 'G' },
      { name: 'Bajeo up to D7', how: 'After a bar of G, walk A, B, C♯ and land on D for the D7.',
        bars: P(`43:q ${G3}:q ${G3}:q | 45:q 47:q 49:q | 50:q ${D7T}:q ${D7T}:q`), time: '3/4', key: 'G' },
      { name: 'Bajeo home to G', how: 'From D7, walk down C, B, A and land on G.',
        bars: P(`50:q ${D7T}:q ${D7T}:q | 48:q 47:q 45:q | 43:q ${G3}:q ${G3}:q`), time: '3/4', key: 'G' },
      { name: 'Light and short', how: 'Only the rhythm: the bass rings, the chords are short and soft, as if a singer stood in front of you.',
        grid: { time: '3/4', rows: { bass: 'x.....', strum: '..x.x.' } } }
    ],
    listen: { artist: 'José Alfredo Jiménez', work: 'El rey' }
  },
  {
    id: 'mexico-norteno-polka',
    style: 'mexico',
    name: 'Norteño polka: bass and chop',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Play the polka as a bajo sexto does: bass notes on the beats, short chord chops on the offbeats, and a run into each change.',
    why: 'The polka drives norteño, conjunto and many rancheras and corridos. The bajo sexto’s job is bass and chop in one part; playing both at a fast tempo without rushing the chops is the skill.',
    backing: { groove: 'norteno', bars: ['C', 'G7', 'G7', 'C'] },
    tempo: [140, 200],
    steps: [
      'C: bass C (string 5, 3rd fret) and G (string 6, 3rd fret); chop E, G, C on strings 4–2.',
      'G7: bass G and D (string 4 open); chop F, G, B on strings 4–2 (3rd fret, open, open).',
      'Bass on each beat, alternating root and fifth; chop on each &.',
      'Palm-mute the chops a little so they are short.',
      'Add a run of three eighths into each change.'
    ],
    variations: [
      { name: 'Bass on the beat, chop on the &', how: 'C with C and G in the bass; G7 with G and D.',
        bars: P(`48:8 ${CT}:8 43:8 ${CT}:8 48:8 ${CT}:8 43:8 ${CT}:8 | 43:8 ${G7T}:8 50:8 ${G7T}:8 43:8 ${G7T}:8 50:8 ${G7T}:8`), time: '4/4', key: 'C' },
      { name: 'Muted chops', how: 'Only the rhythm. Rest the side of your picking hand on the strings for the chops; let the bass ring.',
        grid: { rows: { bass: 'x.x.x.x.', chop: '.x.x.x.x' } } },
      { name: 'Run into G7', how: 'End the C bar with B and A, landing on G for the G7.',
        bars: P(`48:8 ${CT}:8 43:8 ${CT}:8 48:8 ${CT}:8 47:8 45:8 | 43:8 ${G7T}:8 50:8 ${G7T}:8 43:8 ${G7T}:8 50:8 ${G7T}:8`), time: '4/4', key: 'C' },
      { name: 'Run back to C', how: 'End the G7 bar with A and B, landing on C.',
        bars: P(`43:8 ${G7T}:8 50:8 ${G7T}:8 43:8 ${G7T}:8 45:8 47:8 | 48:8 ${CT}:8 43:8 ${CT}:8 48:8 ${CT}:8 43:8 ${CT}:8`), time: '4/4', key: 'C' }
    ],
    listen: { artist: 'Los Tigres del Norte', work: 'Jefe de jefes' }
  },
  {
    id: 'mexico-son-sesquialtera',
    style: 'mexico',
    name: 'Son jalisciense: strumming in two and three',
    focus: 'rhythm',
    level: 2,
    minutes: 10,
    goal: 'Strum six eighths per bar and place the accents in 6/8, in 3/4, and in the sesquiáltera mix of both, as a vihuela does.',
    why: 'The mariachi son tumbles between two and three. The vihuela marks it with accents and a damped stroke, and the guitarrón follows. Practising each grouping, then the switch, gives you the rhythmic core of the son jalisciense, the huapango and much Latin American folk music.',
    backing: { groove: 'sonjalisco', bars: ['D', 'A7'] },
    tempo: [66, 104],
    grid: { time: '6/8', count: '1 2 3 4 5 6', bars: 2 },
    steps: [
      'Count six eighths per bar, out loud: 1 2 3 4 5 6.',
      'Use small chords on the top four strings so they sound bright, like a vihuela: D at frets 7–7–7–5 and A7 at 5–6–5–5 (strings 4–1).',
      'In a 6/8 bar, accent 1 and 4. In a 3/4 bar, accent 1, 3 and 5.',
      'The backing plays one bar of 6/8 and one of 3/4; follow it, then try the others against it.',
      'Keep the wrist loose. Speed comes from the wrist, accents from the arm.'
    ],
    variations: [
      { name: 'Both bars in two', how: 'Accents on 1 and 4 of each bar: ONE two three FOUR five six.',
        grid: { rows: { strum: 'X.xX.xX.xX.x' } } },
      { name: 'Both bars in three', how: 'Accents on 1, 3 and 5: ONE two THREE four FIVE six.',
        grid: { rows: { strum: 'X.X.X.X.X.X.' } } },
      { name: 'Sesquiáltera: 6/8 then 3/4', how: 'The first bar in two, the second in three, with the backing.',
        grid: { rows: { strum: 'X.xX.xX.X.X.' } } },
      { name: 'Add the damped stroke', how: 'On 4 of the first bar, let the strumming hand fall flat on the strings so they click without ringing.',
        grid: { rows: { strum: 'X.x..xX.X.X.', damp: '...x........' } } },
      { name: 'Guitarrón bass under the strum', how: 'Thumb plays the bass in octaves where you can (D on strings 5 and 4) on the accents; the fingers strum between.',
        grid: { rows: { bass: 'x..x..x.x.x.', strum: '.xx.xx.x.x.x' } } }
    ],
    listen: { artist: 'Linda Ronstadt with Mariachi Vargas de Tecalitlán', work: 'Canciones de Mi Padre' }
  },
  {
    id: 'mexico-requinto-thirds',
    style: 'mexico',
    name: 'Requinto thirds: a bolero introduction',
    focus: 'melody',
    level: 2,
    minutes: 10,
    goal: 'Play an introduction in parallel thirds and sixths over Am–Dm–E7–Am, with even attack and clean shifts, as a requinto does.',
    why: 'The requinto’s introductions and fills are the signature of the trío romántico. They are built from thirds and sixths moving along the harmonic minor scale; once your hands know those shapes in time, you can make introductions for any bolero.',
    backing: { groove: 'bolero', bars: ['Am', 'Dm', 'E7', 'Am'] },
    tempo: [60, 84],
    steps: [
      'Use a pick. Play the thirds on strings 3 and 2, the sixths on strings 3 and 1, damping string 2.',
      'Learn variation 1 bar by bar; each third is a two-finger shape that moves along the neck.',
      'Shift with the hand relaxed and the fingers close to the strings, so there is no gap between shapes.',
      'Hold the last third and add a tremolo: fast repeated picking.',
      'A capo at the 5th fret gives you the requinto’s pitch.'
    ],
    variations: [
      { name: 'Thirds on strings 3 and 2', how: 'A and C, a neighbour G♯ and B, back to A and C; the same on F and A over Dm; down the scale over E7; A and C at the 2nd and 1st frets to end.',
        bars: P('69+72:q. 68+71:8 69+72:h | 65+69:q. 64+68:8 65+69:h | 64+68:q 62+65:q 60+64:q 59+62:q | 57+60:w'), time: '4/4', key: 'Am',
        positions: [[3, 14], [2, 13], [3, 10], [2, 10]] },
      { name: 'Sixths on strings 3 and 1', how: 'E and C, D and B, C and A, B and G♯ over Am; A and F over Dm; G♯ and E, B and G♯ over E7; C and A to end.',
        bars: P('64+72:q 62+71:q 60+69:q 59+68:q | 57+65:h 57+65:h | 56+64:h 59+68:h | 60+69:w'), time: '4/4', key: 'Am' },
      { name: 'The cadence: E7 to Am', how: 'A run of thirds in eighths over E7, falling to A and C. This is the ending most bolero introductions use.',
        bars: P('64+68:8 65+69:8 64+68:8 62+65:8 60+64:8 59+62:8 57+60:8 56+59:8 | 57+60:w'), time: '4/4', key: 'Am' },
      { name: 'Slides and tremolo', how: 'Play variation 1 again. Slide into the first third of each bar from a fret below, and tremolo-pick the last held third.' }
    ],
    listen: { artist: 'Natalia Lafourcade', work: 'Musas' }
  },
  {
    id: 'mexico-bolero-comping',
    style: 'mexico',
    name: 'Bolero comping with bass runs',
    focus: 'harmony',
    level: 2,
    minutes: 10,
    goal: 'Accompany I–vi–ii–V in C with the bolero rhythm: bass on 1 and 3, chords on 2, the & of 2 and 4, and a bajeo between chords.',
    why: 'This is the trío guitar’s main job. The rhythm is gentle and fixed, so the art is in voicing the chords close together and leading the bass from one root to the next, under a voice.',
    backing: { groove: 'bolero', bars: ['C', 'Am7', 'Dm7', 'G7'] },
    tempo: [64, 86],
    steps: [
      'Chords on the top three strings: C and Am7 share G, C, E (open, 1st fret, open); Dm7 is A, C, F; G7 is G, B, F.',
      'Bass: C and G for C, A and E for Am7, D and A for Dm7, G and D for G7.',
      'Bass on 1 and 3 with the thumb; chords on 2, the & of 2 and 4, soft and short.',
      'Add a bajeo where one chord’s root walks to the next.',
      'Hum the melody of any bolero you know over it and keep the guitar quieter than your voice.'
    ],
    variations: [
      { name: 'The bolero rhythm', how: 'Four bars, one chord each. The bass alternates root and fifth.',
        bars: P('48:q 55+60+64:8 55+60+64:8 43:q 55+60+64:q | 45:q 55+60+64:8 55+60+64:8 40:q 55+60+64:q | 50:q 57+60+65:8 57+60+65:8 45:q 57+60+65:q | 43:q 55+59+65:8 55+59+65:8 50:q 55+59+65:q'), time: '4/4', key: 'C' },
      { name: 'Bajeo from C to Am7', how: 'On beat 4 of the C bar, play B in the bass instead of the chord, leading to A.',
        bars: P('48:q 55+60+64:8 55+60+64:8 48:q 47:q | 45:q 55+60+64:8 55+60+64:8 40:q 55+60+64:q'), time: '4/4', key: 'C' },
      { name: 'Arpeggiated', how: 'Bass, then the three chord notes in eighths, p i m a: the soft bolero of a trio’s quieter verses.',
        bars: P('48:8 55:8 60:8 64:8 43:8 55:8 60:8 64:8 | 45:8 55:8 60:8 64:8 40:8 55:8 60:8 64:8'), time: '4/4', key: 'C' },
      { name: 'Soft chords, singing bass', how: 'Only the rhythm: let the bass notes ring for two beats and keep the chords almost whispered.',
        grid: { rows: { bass: 'x.......x.......', chord: '....x.x.....x...' } } }
    ],
    listen: { artist: 'Agustín Lara', work: 'Solamente una vez' }
  },

  /* ====================== COLOMBIA & VENEZUELA ====================== */
  {
    id: 'colombia-cumbia-offbeats',
    style: 'colombia',
    name: 'Cumbia offbeats and bass',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Play short offbeat chords over a thumb bass on 1 and 3 in A minor, then a chicha-style lead line, relaxed and steady.',
    why: 'In band cumbia the rhythm guitar takes the llamador drum’s job on the offbeats and the bass marks 1 and 3. Getting the offbeats short and even, without rushing, is what makes the music sway; the lead line shows how Peruvian guitar cumbia sang over it.',
    backing: { groove: 'cumbia', bars: ['Am', 'E7'] },
    tempo: [80, 100],
    steps: [
      'Am: A, C, E on strings 4–2 at frets 7–5–5. E7: G♯, D, E on strings 3–1 at frets 1–3–0.',
      'Count 1 e & a 2 e & a… The backing’s scraper plays long–short–short on every beat.',
      'Chop the chord on each &, short and dry.',
      'Add the thumb bass on 1 and 3: A and E for Am, E and B for E7.',
      'Then play the lead line with a clean tone and a little tremolo or chorus.'
    ],
    variations: [
      { name: 'Offbeat chops', how: 'A short chord on every &. Nothing on the beats.', positions: [[4, 7], [3, 5], [2, 5]],
        grid: { rows: { chop: '..x...x...x...x.' } } },
      { name: 'Thumb and chop', how: 'The thumb plays the bass on 1 and 3; the chord chops on each &.',
        bars: P(`45:8 ${AMT}:8 r:8 ${AMT}:8 40:8 ${AMT}:8 r:8 ${AMT}:8 | 40:8 ${E7T}:8 r:8 ${E7T}:8 47:8 ${E7T}:8 r:8 ${E7T}:8`), time: '4/4', key: 'Am' },
      { name: 'The scraper on the guitar', how: 'Mute the strings with the fretting hand and strum the guacharaca’s long–short–short on every beat.',
        grid: { rows: { scrape: 'X.xxX.xxX.xxX.xx' } } },
      { name: 'Chicha lead line', how: 'A, C, B, A, G♯, A, B, C over Am, then B, G♯, E, G♯, B over E7, in A harmonic minor.',
        bars: P('69:8 72:8 71:8 69:8 68:8 69:8 71:8 72:8 | 71:8 68:8 64:8 68:8 71:q r:q'), time: '4/4', key: 'Am' }
    ],
    listen: { artist: 'Various artists', work: 'The Roots of Chicha' }
  },
  {
    id: 'colombia-vallenato-paseo',
    style: 'colombia',
    name: 'Vallenato paseo and accordion thirds',
    focus: 'melody',
    level: 2,
    minutes: 8,
    goal: 'Keep the paseo going with bass and chords, then play accordion-style lines in thirds in A major.',
    why: 'In modern vallenato the guitar either holds the paseo with the bass or doubles the accordion’s lines. Parallel thirds on the top strings are the accordion’s sound; playing them over the guacharaca’s scrape teaches the style’s melodic language.',
    backing: { rhythm: 'paseo' },
    tempo: [90, 116],
    steps: [
      'Listen to the backing: guacharaca on every beat, caja, bass on 1, the & of 2 and 3.',
      'Play the paseo pattern on A: bass on 1, the & of 2 and 3, short chords on 2 and 4.',
      'Then learn the thirds on strings 2 and 1, descending A major.',
      'Keep the thirds short and bouncy, like accordion buttons.',
      'Try a phrase, then a bar of paseo, as accordion and guitar trade.'
    ],
    variations: [
      { name: 'Paseo pattern', how: 'Bass on 1, the & of 2 and 3; short chords on 2 and 4.',
        grid: { rows: { bass: 'x.....x.x.......', chop: '....x.......x...' } } },
      { name: 'Thirds down A major', how: 'C♯ and E, B and D, A and C♯, G♯ and B, F♯ and A, E and G♯, then F♯ and A held.',
        bars: P('73+76:8 71+74:8 69+73:8 68+71:8 66+69:8 64+68:8 66+69:q'), time: '4/4', key: 'A',
        positions: [[2, 14], [1, 12], [2, 12], [1, 10]] },
      { name: 'Run into the phrase', how: 'A quick run up E, F♯, G♯, A, then B, A, and a rest.',
        bars: P('64:16 66:16 68:16 69:16 71:q 69:q r:q'), time: '4/4', key: 'A' },
      { name: 'Puya speed', how: 'Play the thirds of variation 2 as fast as you can keep them clean, then come back to the paseo tempo. The puya is vallenato’s fastest aire.' }
    ],
    listen: { artist: 'Carlos Vives', work: 'Clásicos de la Provincia' }
  },
  {
    id: 'colombia-bambuco-hemiola',
    style: 'colombia',
    name: 'Bambuco: three against two',
    focus: 'rhythm',
    level: 2,
    minutes: 10,
    goal: 'Strum the bambuco accompaniment in 6/8 with its accents on 3 and 6 while you hum or play a melody in three, and play a phrase that crosses the bar line.',
    why: 'The bambuco lives between 6/8 and 3/4: the accompaniment groups six eighths in threes, the melody in twos, and phrases fall across the bar. Holding both at once is the whole difficulty and the whole charm of Andean Colombian music.',
    backing: { rhythm: 'bambuco' },
    tempo: [50, 72],
    grid: { time: '6/8' },
    steps: [
      'Count six eighths: 1 2 3 4 5 6.',
      'Strum all six, soft on 1, 2, 4 and 5, firm on 3 and 6.',
      'Hum on 1, 3 and 5 while you strum. Keep both going.',
      'Play the melody of variation 4: it starts on the last eighth of a bar and ends on the last eighth.',
      'Stay relaxed; the music should sway, not march.'
    ],
    variations: [
      { name: 'Accompaniment: accents on 3 and 6', how: 'Soft, soft, FIRM, soft, soft, FIRM.',
        grid: { rows: { strum: 'xxXxxX' } } },
      { name: 'Melody in three', how: 'Hum or tap on 1, 3 and 5 against the backing.',
        grid: { rows: { melody: 'x.x.x.' } } },
      { name: 'Both together', how: 'Strum the accompaniment and hum in three at once.',
        grid: { rows: { strum: 'xxXxxX', melody: 'x.x.x.' } } },
      { name: 'A phrase across the bar', how: 'In E minor: a pickup B on the last eighth, then C, B, G, F♯; E, F♯, G, B; and A, G to rest. Strum the 6/8 under it if you can.',
        bars: P('r:q. r:8 r:8 71:8 | 72:q 71:q 67:8 66:8 | 64:q 66:q 67:8 71:8 | 69:q. 67:q.'), time: '6/8', key: 'Em' }
    ],
    listen: { artist: 'Garzón y Collazos', work: 'bambucos' }
  },
  {
    id: 'colombia-joropo-cuatro',
    style: 'colombia',
    name: 'Joropo cuatro strum',
    focus: 'rhythm',
    level: 2,
    minutes: 8,
    goal: 'Play the cuatro’s joropo strum on the top four strings, with its muted stroke, fast and steady over D–G–A7–G.',
    why: 'The cuatro is the rhythmic heart of joropo and of Venezuelan music in general. Its muted stroke, the hand landing flat on the strings, is what gives the rhythm its crisp edge against the harp’s bass in three.',
    backing: { rhythm: 'joropo' },
    tempo: [60, 92],
    grid: { time: '6/8' },
    steps: [
      'Use small chords on strings 1–4 only. D: A, D, F♯, A at frets 7–7–7–5 (strings 4–1).',
      'Six strokes per bar: down, up, MUTED down, up, down, up.',
      'For the muted stroke, let the side of the hand land on the strings as it strikes, so they click.',
      'Keep the backing’s harp bass, in three, against your strum, in two.',
      'When it is steady, change chords every bar: D, G, A7, G.'
    ],
    variations: [
      { name: 'Strum with the muted stroke on 3', how: 'Down, up, muted, up, down, up.',
        grid: { rows: { strum: 'xx.xxx', muted: '..x...' } }, positions: [[4, 7], [3, 7], [2, 7], [1, 5]] },
      { name: 'Muted stroke on 6', how: 'Move the muted stroke to the last eighth. Hear how it pushes into the next bar.',
        grid: { rows: { strum: 'xxxxx.', muted: '.....x' } } },
      { name: 'Accent the bar', how: 'A strong downstroke on 1 of every bar, marking the cycle for the harp and the singer.',
        grid: { rows: { strum: 'Xx.xxx', muted: '..x...' } } },
      { name: 'Over the cycle', how: 'D, G, A7, G, one bar each, with the strum of variation 1. G: B, D, G, B at frets 9–7–8–7; A7: C♯, E, G, C♯ at 11–9–8–9, all on strings 4–1. Any small shapes on the top strings will do.' },
      { name: 'Pajarillo in minor', how: 'The same strum over Am and E7, the minor cycle of the golpe pajarillo. Faster, and fierce.' }
    ],
    listen: { artist: 'Simón Díaz', work: 'Caballo viejo' }
  },
  {
    id: 'colombia-lauro-waltz',
    style: 'colombia',
    name: 'Venezuelan waltz: bass in two, melody in three',
    focus: 'technique',
    level: 3,
    minutes: 12,
    goal: 'Play a Venezuelan-waltz texture on one guitar: the thumb in two notes per bar, the chord between, and a melody in quarters on top.',
    why: 'Antonio Lauro’s waltzes put the region’s double meter in one guitarist’s hands: the bass sounds like 6/8 while the melody sings in 3/4. Separating the voices and keeping the dance through the rubato is the technique his music teaches.',
    backing: { click: { beats: 3, sub: 2 } },
    tempo: [60, 112],
    steps: [
      'E minor and B7. The thumb plays on 1 and the & of 2: two dotted quarters per bar.',
      'Fill the chord between with i and m on strings 3 and 2.',
      'Add the melody with a: a quarter on 1, 2 and 3 of the bar, louder than the rest.',
      'Balance: melody loud, bass clear, inner notes soft.',
      'When it is steady, add rubato: stretch the top of a phrase and catch up after, but keep the dance.'
    ],
    variations: [
      { name: 'Bass alone', how: 'E and B for Em, B and F♯ for B7, on 1 and the & of 2.',
        bars: P('40:q. 47:q. | 47:q. 42:q.'), time: '3/4', key: 'Em' },
      { name: 'Bass and chord', how: 'Each bass note followed by two eighths of the chord: G and B for Em, A and D♯ for B7.',
        bars: P('40:8 55+59:8 55+59:8 47:8 55+59:8 55+59:8 | 47:8 57+63:8 57+63:8 42:8 57+63:8 57+63:8'), time: '3/4', key: 'Em' },
      { name: 'Melody in three on top', how: 'The melody falls on 1, 2 and 3 (B, C, B; A, B, A; G, F♯, E) while the bass stays on 1 and the & of 2.',
        bars: P('40+71:8 55:8 72:8 47:8 71:8 55:8 | 47+69:8 57:8 71:8 42:8 69:8 57:8 | 40+67:8 55:8 66:8 47:8 64:8 55:8'), time: '3/4', key: 'Em' },
      { name: 'Rubato', how: 'Play variation 3 with a little stretch on the first beat of each bar and a quicker second beat, as Venezuelan waltzes are played. Keep the bass steady underneath.' }
    ],
    listen: { artist: 'Antonio Lauro', work: 'Natalia (Vals venezolano No. 3)' }
  },

  /* ====================== MAINLAND SOUTHEAST ASIA ====================== */
  {
    id: 'seasia-nhan-bends',
    style: 'seasia',
    name: 'Nhấn: pressed bends',
    focus: 'technique',
    level: 2,
    minutes: 8,
    goal: 'Bend notes up by a quarter tone, a semitone and a whole tone, slowly and in tune, and release them as slowly, over a drone on G.',
    why: 'On the scalloped guitar phím lõm a note is raised by pressing; on an ordinary guitar you get close with small, controlled bends. Vietnamese modes need notes that are pressed and released, so the control to aim a bend at any pitch is the first skill.',
    backing: { groove: 'drone', bars: ['G'] },
    tempo: [48, 72],
    steps: [
      'Open a tuner beside the drill, or listen hard against the drone.',
      'Play G on string 2, 8th fret. Push the string up with three fingers until it reaches G♯; check it.',
      'Let it down as slowly as it went up: one beat up, one beat down.',
      'Now aim at a quarter tone, halfway to G♯. Then at A, a whole tone.',
      'Repeat on string 3 and string 1. Light strings help.'
    ],
    variations: [
      { name: 'Semitone', how: 'G, then bend it to G♯. The second note is the bent pitch, not a new fret.',
        bars: P('67:h 68#:h'), time: '4/4', key: 'G', positions: [[2, 8]] },
      { name: 'Whole tone, slow release', how: 'G, bend up to A and hold, then release back to G.',
        bars: P('67:q 69:h 67:q'), time: '4/4', key: 'G' },
      { name: 'Press A up and back', how: 'On string 2, 10th fret: A, pressed toward B♭, then back to A. In the old modes some notes are always pressed like this.',
        bars: P('69:q 70b:q 69:h'), time: '4/4', key: 'G', positions: [[2, 10]] },
      { name: 'A bend inside a phrase', how: 'G, A, C, D; E, D, C, A. Press the A a little sharp each time it comes, and leave the others plain.',
        bars: P('67:q 69:q 72:q 74:q | 76:q 74:8 72:8 69:h'), time: '4/4', key: 'G' }
    ],
    listen: { artist: 'Various artists', work: 'Longing for the Past: The 78 rpm Era in Southeast Asia' }
  },
  {
    id: 'seasia-rung-vibrato',
    style: 'seasia',
    name: 'Rung: a slow, wide vibrato',
    focus: 'technique',
    level: 1,
    minutes: 6,
    goal: 'Hold a note plain for half a beat, then add a slow, wide, even vibrato that you can make grow and shrink.',
    why: 'Vietnamese vibrato is wider and slower than rock vibrato and often starts late. Choosing which notes to shake and which to leave plain is how the same five notes become a mood.',
    backing: { groove: 'drone', bars: ['G'] },
    tempo: [50, 72],
    steps: [
      'Play D on string 1, 10th fret. Let it ring plain for half a beat.',
      'Then bend up and down by about a quarter tone, three or four times a second.',
      'Keep it even: the same width and speed each cycle.',
      'Make it wider as the note goes on, and narrower at the end.',
      'Use the wrist, not just the finger.'
    ],
    variations: [
      { name: 'One long note', how: 'D held for a bar: plain, then vibrato from beat 2.',
        bars: P('74:w'), time: '4/4', key: 'G', positions: [[1, 10]] },
      { name: 'Bend, then shake', how: 'C, then bend it up to D and add vibrato at the bent pitch.',
        bars: P('72:h 74:h'), time: '4/4', key: 'G' },
      { name: 'One shaken note per phrase', how: 'G, A, C, D, then a long E with vibrato; D, C, A, G plain.',
        bars: P('67:8 69:8 72:8 74:8 76:h | 74:q 72:q 69:q 67:q'), time: '4/4', key: 'G' },
      { name: 'Grow and shrink', how: 'On any held note: start narrow, widen to a quarter tone, narrow again. Then try starting wide and ending plain.' }
    ],
    listen: { artist: 'Various artists', work: 'Hanoi Masters: War Is a Wound, Peace Is a Scar' }
  },
  {
    id: 'seasia-bac-nam',
    style: 'seasia',
    name: 'Bắc and Nam: one set of notes, two moods',
    focus: 'ear',
    level: 2,
    minutes: 10,
    goal: 'Play the five notes hò xự xang xê cống (G A C D E) first plain and bright, then slow, pressed and shaken, and hear how the mood changes.',
    why: 'In southern Vietnamese music a mode is a mood: which notes are pressed, how they are shaken, where phrases end. You will not learn the exact pitches of an Oán mode from a fret chart, but you can learn that the same notes become different music when you change their treatment.',
    backing: { groove: 'drone', bars: ['G'] },
    tempo: [52, 76],
    steps: [
      'Say the names as you play them: hò (G), xự (A), xang (C), xê (D), cống (E), líu (high G).',
      'Play variation 1 plain, with light ornaments: the Bắc spirit.',
      'Play it again slower, pressing xự and cống up a little and shaking them: the Nam spirit.',
      'End phrases on hò or xê in Bắc, on hò or xang in Nam.',
      'Listen to a guitar phím lõm recording and copy one phrase by ear.'
    ],
    variations: [
      { name: 'The names', how: 'Hò, xự, xang, xê, cống, líu: G, A, C, D, E, G.',
        bars: P('55:q 57:q 60:q 62:q | 64:q 67:h r:q'), time: '4/4', key: 'G' },
      { name: 'Bắc: plain and bright', how: 'A simple line on the five notes, ending on hò.',
        bars: P('67:q 69:q 72:q 74:q | 76:q 74:q 72:q 74:q | 72:q 69:q 67:h'), time: '4/4', key: 'G' },
      { name: 'Nam: the same notes, pressed', how: 'The same line, slower. Press each A and E up and shake it; leave G, C and D plain.',
        bars: P('67:q 69:q 72:q 74:q | 76:q 74:q 72:q 74:q | 72:q 69:q 67:h'), time: '4/4', key: 'G' },
      { name: 'End on xang', how: 'A phrase that comes to rest on C, with a long vibrato. It sounds unresolved and longing.',
        bars: P('74:q 72:q 69:q 72:q | 67:q 69:q 72:h'), time: '4/4', key: 'G' }
    ],
    listen: { artist: 'Văn Vĩ', work: 'vọng cổ guitar phím lõm' }
  },
  {
    id: 'seasia-phin-drone',
    style: 'seasia',
    name: 'Phin drone patterns',
    focus: 'technique',
    level: 2,
    minutes: 8,
    goal: 'Pick a fast, repeating pentatonic line on string 3 against the open E string as a drone, phin-style, locked to a mor lam groove.',
    why: 'The phin plays melody on one string while others drone, in patterns repeated many times with small changes. On guitar this builds alternate picking across a string skip and the hypnotic, steady drive of mor lam sing.',
    backing: { groove: 'morlam', bars: ['Em'] },
    tempo: [110, 140],
    steps: [
      'The melody is on string 3: open G, A at the 2nd fret, B at the 4th, D at the 7th.',
      'The open 1st string, E, is the drone. Strike it with the melody notes, or between them.',
      'Alternate picking throughout. Keep string 2 quiet with the side of a fretting finger.',
      'Repeat each pattern many times, then change one note.',
      'A little fuzz or overdrive on the amp gets you closer to an electric phin.'
    ],
    variations: [
      { name: 'Melody with the drone', how: 'B, A, G, A, B, D, B, A, each with the open E above it.',
        bars: P('59+64:8 57+64:8 55+64:8 57+64:8 59+64:8 62+64:8 59+64:8 57+64:8'), time: '4/4', key: 'Em', positions: [[3, 4], [3, 2], [3, 0], [3, 7]] },
      { name: 'Sixteenth drive', how: 'Melody note, open E, melody note, open E: the drone between every note.',
        bars: P('59:16 64:16 57:16 64:16 55:16 64:16 57:16 64:16 59:16 64:16 62:16 64:16 59:16 64:16 57:16 64:16'), time: '4/4', key: 'Em' },
      { name: 'Hammer-on figure', how: 'G hammered to A, B, A hammered to B, D, then down to G.',
        bars: P('55:16 57:16 59:8 57:16 59:16 62:8 59:8 57:8 55:q'), time: '4/4', key: 'Em' },
      { name: 'Two bars, one note changed', how: 'The first bar as variation 1; in the second, end on G instead of going up to D.',
        bars: P('59+64:8 57+64:8 55+64:8 57+64:8 59+64:8 62+64:8 59+64:8 57+64:8 | 59+64:8 57+64:8 55+64:8 57+64:8 59+64:8 57+64:8 55+64:q'), time: '4/4', key: 'Em' }
    ],
    listen: { artist: 'Khun Narin’s Electric Phin Band', work: 'Khun Narin’s Electric Phin Band' }
  },
  {
    id: 'seasia-ching-phrases',
    style: 'seasia',
    name: 'Phrases that land on the chap',
    focus: 'rhythm',
    level: 1,
    minutes: 6,
    goal: 'Play short A minor pentatonic phrases that arrive on the closed “chap” of the ching, so the end of the cycle feels like home.',
    why: 'In Thai and Khmer music the strong beat is the last one, the chap, not the first. Phrasing toward it turns your sense of the bar around and makes melodies breathe out at their end, as the region’s melodies do.',
    backing: { rhythm: 'ching' },
    tempo: [60, 92],
    steps: [
      'Listen to the ching: open “ching” on 1 and 3, closed “chap” on 2 and 4.',
      'Say “ching, chap” with it. Feel the chap as the arrival.',
      'Play the phrases so their last note falls on a chap.',
      'Start each phrase right after a chap.',
      'Improvise your own, in A C D E G, always landing on a chap.'
    ],
    variations: [
      { name: 'Clap the chap', how: 'Clap on 2 and 4 only, with the closed cymbal.',
        grid: { rows: { clap: '..x...x.' } } },
      { name: 'Two short arrivals', how: 'C, A, then G on the chap; A, G, then E on the next chap.',
        bars: P('72:8 69:8 67:q 69:8 67:8 64:q'), time: '4/4', key: 'Am' },
      { name: 'One longer phrase', how: 'Rest on 1, then E, G, A, C rising, landing on A on the second chap.',
        bars: P('r:q 64:8 67:8 69:8 72:8 69:q'), time: '4/4', key: 'Am' },
      { name: 'Two bars, one arrival', how: 'A long line over two bars that lands on E on the very last chap.',
        bars: P('76:8 74:8 72:8 69:8 72:8 74:8 76:q | 74:8 72:8 69:8 67:8 69:q 64:q'), time: '4/4', key: 'Am' }
    ],
    listen: { artist: 'Various artists', work: 'Sound of Siam' }
  }
];
