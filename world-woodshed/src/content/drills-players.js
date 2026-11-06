/* World Woodshed — drills in the manner of more favourite players, each under their own style: Miles Davis
   (jazz), Arsenio Rodríguez and the Buena Vista Social Club (Cuba), Astor Piazzolla and Mercedes Sosa (Latin
   America), Milton Nascimento and Stan Getz (Brazil) and Umm Kulthum (Arab world). Each drill carries `players`,
   the ids in PLAYERS (src/taste.js), so the plan can lean toward them when they are your favourites.
   Every phrase here is an original practice pattern built from devices these musicians are known for. None is
   a transcription of a recording, and none quotes a melody of theirs.
   Phrases use the short form of drills-heroes.js: 'midi:dur' (sounding pitch), '.' after the duration for a
   dot, 'b' or '#' after the pitch to spell it, 'r' for a rest, '|' between bars, '+' between the pitches of a
   chord on one stem. */

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

/* Chord shapes as '+'-joined sounding pitches; the comment gives the frets, 6th string first (x = not played) */
// Miles
const QD = '52+57+62+67+71';   // Dm7 in fourths with a 3rd on top, E A D G B: x 7 7 7 8 7
const QEB = '53+58+63+68+72';  // the same a fret up for E♭m7: F B♭ E♭ A♭ C, x 8 8 8 9 8
const E7S9 = '52+56+62+67';    // E7♯9: E G♯ D G, x 7 6 7 8 x
// Cuba
const AMIN = '57+60+64';       // Am on the top three strings: A C E, x x x 2 1 0
const DMIN = '57+62+65';       // Dm: A D F, x x x 2 3 1
const E7T = '56+62+64';        // E7: G♯ D E, x x x 1 3 0
const CMAJ = '55+60+64';       // C: G C E, x x x 0 1 0
const A7T = '55+61+64';        // A7: G C♯ E, x x x 0 2 0
const DM7T = '57+60+65';       // Dm7: A C F, x x x 2 1 1
const G7T = '55+59+65';        // G7: G B F, x x x 0 0 1
const FMAJ = '57+60+65';       // F: A C F, x x x 2 1 1
const GMIN = '58+62+67';       // Gm: B♭ D G, x x x 3 3 3
// Latin America
const AMFULL = '45+52+57+60+64';        // open Am, x 0 2 2 1 0
const DMFULL = '50+57+62+65';           // open Dm, x x 0 2 3 1
const E7FULL = '40+47+50+56+59+64';     // open E7, 0 2 0 1 0 0
// Brazil: four-string shapes whose top two strings ring open
const S1 = '54+57+59+64';      // F♯ A B E over D: x x 4 2 0 0
const S2 = '55+59+64';         // G B (B) E over C: x x 5 4 0 0, the 3rd string's B in unison with the open 2nd
const S3 = '57+59+61+64';      // A C♯ B E over D: x x 7 6 0 0
const S4 = '59+62+64';         // B D (B) E over G: x x 9 7 0 0, a unison again
const DSUS = '50+57+62+67', DMAJ = '50+57+62+66';   // Dsus4 and D: x x 0 2 3 3, x x 0 2 3 2
const BMIN = '47+54+59+62';    // Bm: x 2 4 4 3 x
const GMAJ7 = '43+50+54+59';   // Gmaj7: 3 5 4 4 x x
const ASUS = '45+52+57+62+64', AMAJ = '45+52+57+61+64'; // Asus4 and A: x 0 2 2 3 0, x 0 2 2 2 0
const CFULL = '48+52+55+60+64';        // open C, x 3 2 0 1 0
const GFULL = '43+47+50+55+59+67';     // open G, 3 2 0 0 0 3
const EM7 = '52+59+62+67', A7 = '45+55+61+64';       // x 7 9 7 8 x and 5 x 5 6 5 x
const EBM7 = '51+58+61+66', AB7 = '44+54+60+63';     // the same a fret lower
const DM7 = '50+57+60+65', G7 = '43+53+59+62';       // and another
const CMAJ7 = '48+55+59+64';                          // x 3 5 4 5 x

export default [
  /* ====================== MILES DAVIS ====================== */
  {
    id: 'jazz-miles-space',
    style: 'jazz',
    players: ['miles'],
    name: 'Miles: fewer notes, more space',
    focus: 'melody',
    level: 1,
    minutes: 8,
    goal: 'Solo over a ii–V–I with one or two notes a bar, in the middle of the guitar, and leave whole beats empty.',
    why: 'Miles Davis often played very few notes in the middle register, many of them through a Harmon mute held close to the microphone, and let the rhythm section fill the gaps. A held note in the right place says more than a run. Playing less also makes you choose each note and hear where it sits in the chord.',
    backing: { groove: 'swing', bars: ['Dm7', 'G7', 'Cmaj7', 'Cmaj7'] },
    tempo: [60, 140],
    steps: [
      'Stay between the 5th and 8th frets on the top three strings: no low notes, no high squeals.',
      'Play at most two notes in a bar. Hold the last one.',
      'Start late: on beat 2, or the & of 2, rather than on 1.',
      'Leave the fourth bar empty every time and listen to the band in it.'
    ],
    variations: [
      { name: 'Two notes a bar', how: 'F (the 3rd of Dm7) held, B and A over G7, then E (the 3rd of C) for a whole bar.', bars: P('65:h. r:q | 71:q 69:h r:q | 64:w | r:w'), time: '4/4', key: 'C' },
      { name: 'Come in late', how: 'Start on the & of 2. Two short notes, a long one, and then nothing.', bars: P('r:q r:8 69:8 72:q. r:8 | 71:8 65:8 r:h. | 64:h. r:q | r:w'), time: '4/4', key: 'C' },
      { name: 'One note, many rhythms', how: 'Only E: it is the 9th of Dm7, the 13th of G7 and the 3rd of C, so it changes colour without moving.', bars: P('r:8 64:8 r:q 64:q. r:8 | r:h 64:8 64:8 r:q | 64:w | r:w'), time: '4/4', key: 'C' },
      { name: 'Half a lick', how: 'Take a line you already play over a ii–V, leave out every second note and hold the last one. Then leave out half of what is left.' }
    ],
    listen: { artist: 'Miles Davis', work: '’Round About Midnight' }
  },
  {
    id: 'jazz-miles-modal',
    style: 'jazz',
    players: ['miles'],
    name: 'Miles: one mode for many bars',
    focus: 'harmony',
    level: 2,
    minutes: 10,
    goal: 'Comp and solo in D Dorian for bar after bar, make its 6th (B) heard, then move the whole thing up a half step to E♭ Dorian.',
    why: 'On Kind of Blue (1959) Miles gave the band scales instead of chord changes: one mode for eight or sixteen bars. With no changes pushing you along, the line has to make its own shape. D Dorian is C major played from D, and its B is what makes it Dorian rather than plain minor. Pianist Bill Evans voiced chords on that record in stacked fourths with a major third on top, and the shape lies well on guitar.',
    backing: { groove: 'swing', bars: ['Dm7', 'Dm7', 'Dm7', 'Dm7', 'Ebm7', 'Ebm7', 'Dm7', 'Dm7'] },
    tempo: [80, 180],
    steps: [
      'D Dorian: D E F G A B C. The same notes as C major, with D as home.',
      'The voicing in fourths: E, A and D on the 5th, 4th and 3rd strings at the 7th fret, G on the 2nd string at the 8th, B on the 1st string at the 7th.',
      'The same shape one fret up is E♭m7: F B♭ E♭ A♭ C. Nothing else changes.',
      'Count the bars. Eight bars of one chord feel long until you hear the phrase shape inside them.'
    ],
    variations: [
      { name: 'The voicing, up a fret and back', how: 'Held, then short on the & of 1, then E♭ Dorian, then home.', bars: P(`${QD}:h r:h | r:8 ${QD}:8 r:q r:h | ${QEB}b:h r:h | ${QD}:w`), time: '4/4', key: 'C' },
      { name: 'Dorian up and down', how: 'From D up an octave and a step, and back. Even eighths, then swing them.', bars: P('62:8 64:8 65:8 67:8 69:8 71:8 72:8 74:8 | 76:8 74:8 72:8 71:8 69:8 67:8 65:8 64:8 | 62:h r:h | r:w'), time: '4/4', key: 'C' },
      { name: 'Lean on the 6th', how: 'A short phrase that keeps landing on B, the note that makes the mode Dorian.', bars: P('69:q 71:h 69:q | 65:q. 67:8 69:h | 74:q 72:8 71:8 r:h | 71:w'), time: '4/4', key: 'C' },
      { name: 'Up a half step', how: 'Play the last variation one fret higher over E♭m7: the same fingers, the 6th is now C. Then come back down without a gap.' }
    ],
    listen: { artist: 'Miles Davis', work: 'Kind of Blue' }
  },
  {
    id: 'jazz-miles-electric',
    style: 'jazz',
    players: ['miles'],
    name: 'Miles: the electric vamp',
    focus: 'rhythm',
    level: 2,
    minutes: 8,
    goal: 'Over a one-chord funk vamp in E, lock a riff on the low strings to the drums, add short E7♯9 stabs, and drop out for bars at a time.',
    why: 'From In a Silent Way (1969) and Bitches Brew (1970) on, Miles built long pieces on vamps: a bass figure, one chord, and players coming in and out. Guitarist John McLaughlin, on those records and on A Tribute to Jack Johnson (1971), played riffs and slashing chords as much as solos. In a vamp the guitar is part of the drum kit, and leaving room is how the music breathes.',
    backing: { groove: 'funk', bars: ['E7#9', 'E7#9', 'E7#9', 'E7#9'] },
    tempo: [80, 120],
    steps: [
      'The riff uses E minor pentatonic on the 6th and 5th strings: open E, G at the 3rd fret, A open, B at the 2nd fret, D open (4th string).',
      'Rest the side of your picking hand on the strings by the bridge so the low notes are short and thick.',
      'E7♯9: E on the 5th string, 7th fret, G♯ on the 4th, 6th fret, D on the 3rd, 7th fret, G on the 2nd, 8th fret. Mute the others.',
      'Stabs are short: strike and release the pressure at once.'
    ],
    variations: [
      { name: 'The riff', how: 'Two bars on the low strings; the second ends differently.', bars: P('40:8 40:8 r:8 43:8 45:8 r:8 47:8 50:8 | 40:8 40:8 r:8 43:8 45:8 r:8 50:8 47:8'), time: '4/4', key: 'Em' },
      { name: 'Stabs off the beat', how: 'E7♯9 on the & of 1 and the & of 3, then a bar of nothing, then two in a row.', bars: P(`r:8 ${E7S9}:8 r:q r:8 ${E7S9}:8 r:q | r:w | r:8 ${E7S9}:8 r:8 ${E7S9}:8 r:h | r:w`), time: '4/4', key: 'Em' },
      { name: 'Riff and stab together', how: 'E on 1, a stab on the & of 1, the riff answering, then a bar with the stab alone.', bars: P(`40:q r:8 ${E7S9}:8 40:8 43:8 45:8 r:8 | 40:q r:8 ${E7S9}:8 r:h`), time: '4/4', key: 'Em' },
      { name: 'In and out', how: 'Play the riff for four bars, then nothing for four, then stabs for four. Come back in on a 1 so the band hears you arrive.' }
    ],
    listen: { artist: 'Miles Davis', work: 'A Tribute to Jack Johnson' }
  },

  /* ====================== ARSENIO RODRÍGUEZ ====================== */
  {
    id: 'cuba-arsenio-cells',
    style: 'cuba',
    players: ['arsenio'],
    name: 'Arsenio: a tres solo built on one cell',
    focus: 'rhythm',
    level: 2,
    minutes: 8,
    goal: 'In the montuno, take one short figure and repeat it against the clave, on its hits or across them, then break out of it.',
    why: 'Arsenio Rodríguez, the blind tresero from Matanzas province who reshaped the son conjunto in the 1940s, played solos that grab a small figure and keep hammering it while the clave turns underneath. The repetition builds tension, and the release when he lets go is the point. On guitar, play the tres’s high strings with a pick, on the top two or three strings.',
    backing: { groove: 'son', bars: ['C F', 'G7 F'] },
    tempo: [80, 120],
    steps: [
      'One bar of the backing holds the whole son clave, 3-2: 1, the a of 1, the & of 2, then the & of 3 and 4.',
      'Pick down on the beats and up between them. Keep the hand moving even when you rest.',
      'Each figure lasts at least four bars before you change it.',
      'Change only one thing at a time: the notes, or the rhythm, never both.'
    ],
    variations: [
      { name: 'Tresillo cell', how: 'Three notes, 3 + 3 + 2 eighths, again and again. Over G7 the F falls to D.', bars: P('67:q. 64:q. 65:q | 67:q. 65:q. 62:q'), time: '4/4', key: 'C' },
      { name: 'On the clave', how: 'Double stops in thirds exactly on the five clave strokes. The F chord comes in early, on the & of 2.', bars: P('64+67:8. 64+67:8. 65+69:q 65+69:8 69+72:q | 65+71:8. 65+71:8. 65+69:q 65+69:8 64+67:q'), time: '4/4', key: 'C' },
      { name: 'Hammer one note', how: 'High C in pairs of sixteenths between the beats, then let it go down to B and C.', bars: P('r:8 72:16 72:16 r:8 72:16 72:16 r:8 72:16 72:16 72:8 r:8 | 71:8 72:8 r:q r:h'), time: '4/4', key: 'C' },
      { name: 'Your own cell', how: 'Make up a two- or three-note figure from C major pentatonic, play it for eight bars, then answer it with a run down to the root.' }
    ],
    listen: { artist: 'Arsenio Rodríguez y su Conjunto', work: 'Dundunbanza' }
  },
  {
    id: 'cuba-arsenio-diablo',
    style: 'cuba',
    players: ['arsenio'],
    name: 'Arsenio: the diablo, riffs over the montuno',
    focus: 'melody',
    level: 2,
    minutes: 8,
    goal: 'Play a short horn-style riff in octaves, then in sixths, over a minor montuno, and keep it tight with the clave.',
    why: 'In the 1940s Arsenio added two or three trumpets, piano and conga to the son trio, and in the montuno the trumpets played short riffs against each other and against the coro. He called this hot section the diablo, and it fed straight into mambo and, later, salsa. On guitar a riff in octaves cuts through like a horn section; in sixths it sounds like two trumpets in harmony.',
    backing: { groove: 'son', bars: ['Am Dm', 'E7 Am'] },
    tempo: [80, 120],
    steps: [
      'Octaves: the lower note on the 4th string and the upper on the 2nd string, three frets higher, with the 3rd string muted.',
      'Sixths: one string apart (3rd and 1st, or 4th and 2nd).',
      'Riffs are short. Cut every note off cleanly; the rest after it is part of the riff.',
      'Play the riff the same way eight times before you change a note.'
    ],
    variations: [
      { name: 'Riff in octaves', how: 'A, A, C over Am and Dm; B, B, A over E7 and Am.', bars: P('57+69:8 r:8 r:8 57+69:8 r:8 60+72:8 r:q | 59+71:8 r:8 r:8 59+71:8 r:8 57+69:8 r:q'), time: '4/4', key: 'Am' },
      { name: 'Riff in sixths', how: 'The same rhythm as two horns a sixth apart, ending on A and C.', bars: P('60+69:8 r:8 60+69:8 62+71:8 r:8 64+72:8 r:q | 59+68:8 r:8 59+68:8 62+71:8 r:8 60+69:8 r:q'), time: '4/4', key: 'Am' },
      { name: 'Riff against riff', how: 'Two bars of the octave riff, then two of the sixths, as two trumpets answering each other.' },
      { name: 'Build the diablo', how: 'Play four bars of a montuno guajeo, then four of the riff, then four of the riff an octave higher. Each time round, it gets hotter.' }
    ],
    listen: { artist: 'Arsenio Rodríguez y su Conjunto', work: 'Fuego en el 23' }
  },
  {
    id: 'cuba-arsenio-rumba',
    style: 'cuba',
    players: ['arsenio'],
    name: 'Arsenio: son over the rumba clave',
    focus: 'rhythm',
    level: 3,
    minutes: 8,
    goal: 'Play double stops and a guajeo on the rumba clave, whose third stroke comes a sixteenth later than the son clave’s, and feel the difference.',
    why: 'Arsenio brought the drums and songs of Afro-Cuban rumba and of Congo heritage into the son, with conga in the band and records such as Quindembo (1963) that mixed the styles. Rumba clave moves one stroke a sixteenth later, and everything that sits on it leans forward. Hearing which clave is under you is a basic skill in Cuban music.',
    backing: { rhythm: 'rumba32' },
    tempo: [80, 115],
    steps: [
      'Rumba clave, 3-2: 1, the a of 1, the a of 2, then the & of 3 and 4.',
      'Clap it first, then play the first variation with the backing.',
      'Then play the son clave rhythm (the & of 2 instead of the a of 2) and hear it clash.',
      'Keep the double stops short so the late stroke is clear.'
    ],
    variations: [
      { name: 'On the rumba clave', how: 'C, then F, on the five strokes. The third stroke is late.', bars: P('64+67:8. 64+67:q 65+69:8. 65+69:8 69+72:q'), time: '4/4', key: 'C' },
      { name: 'A guajeo', how: 'A single-note figure in sixteenths that leaves the strong beats empty, as a tres often does.', bars: P('r:16 67:16 72:16 r:16 67:16 72:16 r:16 69:16 r:16 72:16 69:16 r:16 65:8 69:8'), time: '4/4', key: 'C' },
      { name: 'Son, then rumba', how: 'Four bars of the first variation with the son clave’s third stroke (the & of 2), then four with the rumba’s. Say “son” and “rumba” as you switch.' },
      { name: 'Your own figure', how: 'Make a guajeo of your own that has notes on at least three of the clave strokes.' }
    ],
    listen: { artist: 'Arsenio Rodríguez', work: 'Quindembo' }
  },

  /* ====================== BUENA VISTA SOCIAL CLUB ====================== */
  {
    id: 'cuba-bvsc-segunda',
    style: 'cuba',
    players: ['bvsc'],
    name: 'Buena Vista: the second voice',
    focus: 'harmony',
    level: 1,
    minutes: 8,
    goal: 'Play a simple line with a second voice a third under it, then a sixth under it, and fill between phrases in thirds.',
    why: 'Compay Segundo took his stage name from the segunda, the second voice that sings under the lead a third or a sixth away, as in the Cuban trova duos he sang in for decades. On the Buena Vista Social Club record (1997) the voices and the guitars move together in thirds and sixths. On guitar, thirds sit on neighbouring strings and sixths skip one.',
    backing: { groove: 'son', bars: ['C', 'G7', 'G7', 'C'] },
    tempo: [70, 110],
    steps: [
      'Thirds: the 1st and 2nd strings, or the 2nd and 3rd. In C major the frets shift between the shapes; let your ear say which.',
      'Sixths: the 1st and 3rd strings, or the 2nd and 4th. Mute the string between with the side of your finger.',
      'Hum the top voice while you play both.',
      'Keep the second voice softer than the first.'
    ],
    variations: [
      { name: 'A line in thirds', how: 'Top voice E F G, F E D, D E F D, C; the second voice a third below.', bars: P('64+67:q 65+69:q 67+71:h | 67+71:q 65+69:q 62+65:h | 62+65:q 64+67:q 65+69:q 62+65:q | 60+64:w'), time: '4/4', key: 'C' },
      { name: 'The same in sixths', how: 'The lower voice a sixth under the top one: a rounder, more open sound.', bars: P('60+69:q 62+71:q 64+72:h | 62+71:q 59+67:q 57+65:h | 57+65:q 59+67:q 60+69:q 57+65:q | 55+64:w'), time: '4/4', key: 'C' },
      { name: 'Fill in thirds', how: 'Hold, then a run down the scale in thirds to the next chord, as the guitars do between sung lines.', bars: P('r:h 72+76:8 71+74:8 69+72:8 67+71:8 | 64+67:w'), time: '4/4', key: 'C' },
      { name: 'Sing one, play the other', how: 'Sing the top voice and play only the lower one. Then swap.' }
    ],
    listen: { artist: 'Buena Vista Social Club', work: 'Buena Vista Social Club' }
  },
  {
    id: 'cuba-bvsc-bolero',
    style: 'cuba',
    players: ['bvsc'],
    name: 'Buena Vista: bolero accompaniment',
    focus: 'harmony',
    level: 2,
    minutes: 8,
    goal: 'Accompany a slow bolero with bass on 1 and 3 and soft chords between, then as broken chords.',
    why: 'The bolero is Cuba’s slow love song, and Ibrahim Ferrer’s singing of boleros on Buena Vista and on his own album two years later brought them to a new audience worldwide. The guitar keeps a quiet, rocking pattern under the voice: bass with the thumb, chords with the fingers, never louder than the singer.',
    backing: { groove: 'bolero', bars: ['C', 'A7', 'Dm7', 'G7'] },
    tempo: [60, 90],
    steps: [
      'Thumb on the bass: C on the 5th string, 3rd fret, and G on the 6th, 3rd fret; open A and open E for A7; open D and open A for Dm7; G and open D for G7.',
      'Fingers on the top three strings for the chords.',
      'Play the chords half as loud as the bass.',
      'At this tempo every note is long. Let them ring into each other.'
    ],
    variations: [
      { name: 'Bass and chord', how: 'Bass on 1, two chords on 2 and its &, bass on 3, chord on 4.', bars: P(`48:q ${CMAJ}:8 ${CMAJ}:8 43:q ${CMAJ}:q | 45:q ${A7T}#:8 ${A7T}#:8 40:q ${A7T}#:q | 50:q ${DM7T}:8 ${DM7T}:8 45:q ${DM7T}:q | 43:q ${G7T}:8 ${G7T}:8 50:q ${G7T}:q`), time: '4/4', key: 'C' },
      { name: 'Broken chords', how: 'The same chords one note at a time, up and back in eighths.', bars: P('48:8 55:8 60:8 64:8 60:8 55:8 43:8 55:8 | 45:8 55:8 61#:8 64:8 61#:8 55:8 40:8 55:8 | 50:8 57:8 60:8 65:8 60:8 57:8 45:8 57:8 | 43:8 55:8 59:8 65:8 59:8 55:8 50:8 55:8'), time: '4/4', key: 'C' },
      { name: 'Walk into the next chord', how: 'On beat 4, play a bass note a step from the next root: B into A7, E into Dm7, F♯ into G7, B into C.' },
      { name: 'Under a voice', how: 'Sing or hum any slow line of your own over the pattern. When you hold a note, play a little more; when you move, play less.' }
    ],
    listen: { artist: 'Ibrahim Ferrer', work: 'Buena Vista Social Club Presents Ibrahim Ferrer' }
  },
  {
    id: 'cuba-bvsc-fills',
    style: 'cuba',
    players: ['bvsc'],
    name: 'Buena Vista: strum, then fill, Oriente style',
    focus: 'technique',
    level: 2,
    minutes: 8,
    goal: 'Strum two beats of each chord in a D minor son loop, then fill the other two with a quick run down to the next chord.',
    why: 'Eliades Ochoa comes from near Santiago de Cuba in the east, the Oriente, where the son began, and plays the guitar as rhythm and lead at once: strumming under the singing, then a short run when the voice rests. The run starts on a chord note and ends on a note of the next chord, so the change sounds as if the line had walked there.',
    backing: { groove: 'son', bars: ['Dm', 'F', 'Gm', 'A7'] },
    tempo: [70, 110],
    steps: [
      'Dm, F, Gm and A7 on the top three strings, all near the first three frets.',
      'Strum on 1 and 2, then pick the run on 3 and 4.',
      'Each run ends a step or a half step from a note of the next chord.',
      'Play the strum softer than the run, so the run steps out.'
    ],
    variations: [
      { name: 'Strum and run', how: 'Two strums, then four eighths down into the next chord.', bars: P(`${DMIN}:q ${DMIN}:q 69:8 67:8 65:8 64:8 | ${FMAJ}:q ${FMAJ}:q 67:8 65:8 64:8 62:8 | ${GMIN}:q ${GMIN}:q 69:8 67:8 65:8 64:8 | ${A7T}#:q ${A7T}#:q 64:8 62:8 61#:8 r:8`), time: '4/4', key: 'Dm' },
      { name: 'Runs in thirds', how: 'The A7 bar with a run in thirds: E and G, D and F, C♯ and E, A and C♯, then home.', bars: P(`${DMIN}:q ${DMIN}:q 69:8 67:8 65:8 64:8 | ${FMAJ}:q ${FMAJ}:q 67:8 65:8 64:8 62:8 | ${GMIN}:q ${GMIN}:q 69:8 67:8 65:8 64:8 | ${A7T}#:h 64+67:8 62+65:8 61+64#:8 57+61#:8`), time: '4/4', key: 'Dm' },
      { name: 'Octaves', how: 'Play the runs in octaves (two strings apart, the one between muted), like the doubled strings of a tres.' },
      { name: 'Your own runs', how: 'Make up a run for each change. Start on any note of the chord you are in and end next to a note of the chord coming.' }
    ],
    listen: { artist: 'Buena Vista Social Club', work: 'Chan Chan' }
  },

  /* ====================== ASTOR PIAZZOLLA ====================== */
  {
    id: 'latam-piazzolla-332',
    style: 'latam',
    players: ['piazzolla'],
    name: 'Piazzolla: the 3-3-2 accents',
    focus: 'rhythm',
    level: 2,
    minutes: 8,
    goal: 'Split eight eighths 3 + 3 + 2 with hard accents on 1, the & of 2 and 4, then switch between that and the four-square marcato.',
    why: 'Astor Piazzolla made the 3 + 3 + 2 split of the bar the engine of his nuevo tango: the old tango’s even four beats are still there, but the accents cut across them. His Quinteto Nuevo Tango, formed in 1960, had an electric guitar, so this is music a guitarist can play in the band, not only arrange.',
    backing: { groove: 'tango332', bars: ['Am', 'Am', 'Dm', 'E7'] },
    tempo: [90, 140],
    steps: [
      'Count eighths: “1 2 3 1 2 3 1 2”. The 1s are the accents.',
      'In beats that is 1, the & of 2 and 4.',
      'Strum down on the accents, hard, with the palm muting a little after each.',
      'Then play every eighth, the accents as full chords and the others as one bass note.'
    ],
    variations: [
      { name: 'Accents only', how: 'A dotted quarter, a dotted quarter, a quarter: one chord on each accent.', bars: P(`${AMIN}:q. ${AMIN}:q. ${AMIN}:q | ${AMIN}:q. ${AMIN}:q. ${AMIN}:q | ${DMIN}:q. ${DMIN}:q. ${DMIN}:q | ${E7T}#:q. ${E7T}#:q. ${E7T}#:q`), time: '4/4', key: 'Am' },
      { name: 'Every eighth', how: 'Chords on the accents, the open bass string between them.', bars: P(`${AMIN}:8 45:8 45:8 ${AMIN}:8 45:8 45:8 ${AMIN}:8 45:8 | ${AMIN}:8 45:8 45:8 ${AMIN}:8 45:8 45:8 ${AMIN}:8 45:8 | ${DMIN}:8 50:8 50:8 ${DMIN}:8 50:8 50:8 ${DMIN}:8 50:8 | ${E7T}#:8 40:8 40:8 ${E7T}#:8 40:8 40:8 ${E7T}#:8 40:8`), time: '4/4', key: 'Am' },
      { name: 'Marcato, then 3-3-2', how: 'Two bars of four even beats, then two of 3-3-2, without a gap.', bars: P(`${AMIN}:q ${AMIN}:q ${AMIN}:q ${AMIN}:q | ${AMIN}:q ${AMIN}:q ${AMIN}:q ${AMIN}:q | ${DMIN}:q. ${DMIN}:q. ${DMIN}:q | ${E7T}#:q. ${E7T}#:q. ${E7T}#:q`), time: '4/4', key: 'Am' },
      { name: 'In the bass', how: 'The same accents on the low strings alone: A, A, E, then D, D, A, and E, E, B.', bars: P('45:q. 45:q. 40:q | 45:q. 45:q. 40:q | 50:q. 50:q. 45:q | 40:q. 40:q. 47:q'), time: '4/4', key: 'Am' }
    ],
    listen: { artist: 'Astor Piazzolla', work: 'Libertango' }
  },
  {
    id: 'latam-piazzolla-ostinato',
    style: 'latam',
    players: ['piazzolla'],
    name: 'Piazzolla: an ostinato under long notes',
    focus: 'technique',
    level: 3,
    minutes: 10,
    goal: 'Play a driving eighth-note ostinato in D minor with the thumb, grouped 3 + 3 + 2, and hold long notes over it with the fingers.',
    why: 'Piazzolla often set a slow, singing line over a bass figure that never stops, so the music is calm and restless at once. He also loved counterpoint: he studied with Nadia Boulanger in Paris in 1954–55, and wrote fugues into tango, such as “Fuga y misterio” in María de Buenos Aires (1968). On guitar the thumb is the ostinato and the fingers are the singer.',
    backing: { groove: 'tango332', bars: ['Dm', 'Bb', 'Gm', 'A7'] },
    tempo: [80, 140],
    steps: [
      'Learn the ostinato alone first, thumb only. Each group of three starts on the root.',
      'Then the long notes alone, fingers only, held through the bar.',
      'Then both, at half speed. The long note is struck with the first bass note of the bar.',
      'Keep the ostinato even and soft and the long notes singing.'
    ],
    variations: [
      { name: 'The ostinato', how: 'Root, 5th, octave, in groups of 3 + 3 + 2, through Dm, B♭, Gm and A7.', bars: P('50:8 57:8 62:8 50:8 57:8 62:8 50:8 57:8 | 46:8 53:8 58:8 46:8 53:8 58:8 46:8 53:8 | 43:8 50:8 55:8 43:8 50:8 55:8 43:8 50:8 | 45:8 52:8 55:8 45:8 52:8 55:8 45:8 49#:8'), time: '4/4', key: 'Dm' },
      { name: 'The long notes', how: 'D, then D falling to C, then B♭, then A rising to C♯.', bars: P('74:w | 74:h 72:h | 70:w | 69:h 73#:h'), time: '4/4', key: 'Dm' },
      { name: 'Both at once', how: 'The long note struck with the first bass note, then the ostinato alone under it.', bars: P('50+74:8 57:8 62:8 50:8 57:8 62:8 50:8 57:8 | 46+74:8 53:8 58:8 46:8 53+72:8 58:8 46:8 53:8 | 43+70:8 50:8 55:8 43:8 50:8 55:8 43:8 50:8 | 45+69:8 52:8 55:8 45:8 52+73#:8 55:8 45:8 49#:8'), time: '4/4', key: 'Dm' },
      { name: 'A second line', how: 'Make up a slow line that moves up while the bass moves down, one note per bar. Two lines in contrary motion are the start of counterpoint.' }
    ],
    listen: { artist: 'Astor Piazzolla', work: 'Tango: Zero Hour' }
  },
  {
    id: 'latam-piazzolla-effects',
    style: 'latam',
    players: ['piazzolla'],
    name: 'Piazzolla: percussion on the strings',
    focus: 'technique',
    level: 2,
    minutes: 8,
    goal: 'Replace chords with percussive sounds on the guitar: a thumb slap by the bridge on the accents, a knock on the top, a scrape along the low string and a fast slide.',
    why: 'Tango players, and Piazzolla’s above all, turn their instruments into drums: the violin’s chicharra (bowing behind the bridge, a cicada’s rasp), the látigo (a whip-like slide), knocks on the body of the bass and the bandoneón. A band with no drummer makes its own percussion. On guitar the same sounds come from the tambora (the side of the thumb slapped on the strings by the bridge), a golpe on the top, and a nail scraped along a wound string.',
    backing: { groove: 'tango332', bars: ['Am', 'Am', 'Am', 'E7'] },
    tempo: [90, 130],
    steps: [
      'Tambora: hold an Am chord and slap the strings with the side of your thumb, just in front of the bridge. The chord sounds like a drum with a pitch.',
      'Golpe: tap the top below the 1st string with the fingertips or nails.',
      'Scrape: run a fingernail of the picking hand along the low E string, toward the bridge.',
      'Látigo: slide one note from high up the neck down to the next chord, fast.'
    ],
    variations: [
      { name: 'Tambora on the accents', how: 'Hold Am and E7 and play every accent of 3-3-2 as a tambora instead of a strum.', bars: P(`${AMFULL}:q. ${AMFULL}:q. ${AMFULL}:q | ${AMFULL}:q. ${AMFULL}:q. ${AMFULL}:q | ${AMFULL}:q. ${AMFULL}:q. ${AMFULL}:q | ${E7FULL}#:q. ${E7FULL}#:q. ${E7FULL}#:q`), time: '4/4', key: 'Am' },
      { name: 'Golpe between', how: 'Strum the accents and knock on the top on each beat between them (2 and 3).' },
      { name: 'Scrape into the change', how: 'On beat 4 of the third bar, scrape the low string instead of playing, then hit E7 hard on 1.' },
      { name: 'Látigo to finish', how: 'At the end of the fourth bar, slide from the 12th fret of the 1st string down to the open E, landing on 1 with the Am.' }
    ],
    listen: { artist: 'Astor Piazzolla', work: 'La Camorra' }
  },

  /* ====================== MERCEDES SOSA ====================== */
  {
    id: 'latam-sosa-zamba',
    style: 'latam',
    players: ['sosa'],
    name: 'Mercedes Sosa: zamba arpeggios under a voice',
    focus: 'technique',
    level: 2,
    minutes: 8,
    goal: 'Fingerpick a slow zamba in A minor in six eighths a bar, then move the bass so the bar is felt in three, as the sesquiáltera does.',
    why: 'Mercedes Sosa, from Tucumán in the north of Argentina, sang the zambas and chacareras of the northwest with a guitar and a bombo legüero, and made them the voice of the nueva canción movement. The zamba is slow and swaying, in six, with the feel of two and of three side by side. The guitar under a singer like her is steady, soft and never in the way.',
    backing: { rhythm: 'sesqui' },
    grid: { time: '6/8', count: '1 2 3 4 5 6' },
    tempo: [50, 80],
    steps: [
      'Thumb on the bass strings, fingers i, m and a on the 3rd, 2nd and 1st.',
      'One bar is six eighths. Count “1 2 3 4 5 6”, the bass on 1.',
      'The backing’s clap moves between 1 and 4 (in two) and 1, 3 and 5 (in three). Feel both.',
      'Play softly. The voice, even an imagined one, comes first.'
    ],
    variations: [
      { name: 'Arpeggio in six', how: 'Bass, then up and down the chord: Am, Dm, E7, Am.', bars: P('45:8 57:8 60:8 64:8 60:8 57:8 | 50:8 57:8 62:8 65:8 62:8 57:8 | 40:8 56:8 62:8 64:8 62:8 56:8 | 45:8 57:8 60:8 64:8 60:8 57:8'), time: '6/8', key: 'Am' },
      { name: 'In two, then in three', how: 'One bar with the chord on 1 and 4, the next with it on 1, 3 and 5: the sesquiáltera in your hand.', bars: P(`45:q. ${AMIN}:q. | 45:q ${AMIN}:q ${AMIN}:q | 50:q. ${DMIN}:q. | 40:q ${E7T}#:q ${E7T}#:q`), time: '6/8', key: 'Am' },
      { name: 'A strum', how: 'One common zamba strum: bass on 1, down and up on 2 and 3, a chasquido on 4 (strum and stop the strings with the palm at once), down and up on 5 and 6.',
        grid: { rows: { bass: 'X.....', down: '.x.Xx.', up: '..x..x' } } },
      { name: 'Leave room', how: 'Hum a slow line of your own. While it moves, play only the bass on 1 and 4; when it holds, play the arpeggio.' }
    ],
    listen: { artist: 'Mercedes Sosa', work: 'Mujeres argentinas' }
  },
  {
    id: 'latam-sosa-chacarera',
    style: 'latam',
    players: ['sosa'],
    name: 'Mercedes Sosa: chacarera strum with the bombo',
    focus: 'rhythm',
    level: 3,
    minutes: 8,
    goal: 'Strum the chacarera fast in six, with its accent moving between two and three, and keep it locked to the bombo.',
    why: 'The chacarera, from Santiago del Estero, is a fast dance in six, and it is in the bombo legüero, the big wooden drum Sosa often played on stage herself, that the two-against-three is clearest. The guitar strums the same mix of two and three, and its muted chasquido answers the drum.',
    backing: { rhythm: 'sesqui' },
    grid: { time: '6/8', count: '1 2 3 4 5 6' },
    tempo: [70, 120],
    steps: [
      'Keep the strumming hand moving down and up, six strokes a bar, and only touch the strings on some of them.',
      'The chasquido: strum down and stop the strings with the palm in the same motion, so it clicks.',
      'Hold Am for the first variations. Then change chords on 1, never in the middle of the bar.',
      'Start slowly. A real chacarera runs fast, but the accents matter more than the speed.'
    ],
    variations: [
      { name: 'In two', how: 'Accents on 1 and 4, the chasquido on 4.',
        grid: { rows: { down: 'X.x.x.', up: '.x...x', chasquido: '...X..' } } },
      { name: 'In three', how: 'Accents on 1, 3 and 5.',
        grid: { rows: { down: 'X.X.X.', up: '.x.x.x' } } },
      { name: 'Two bars, both feels', how: 'The first bar in two, the second in three, as the backing’s clap does.',
        grid: { bars: 2, rows: { down: 'X.x.x.X.X.X.', up: '.x...x.x.x.x', chasquido: '...X........' } } },
      { name: 'Over a progression', how: 'One chord a bar: Am, E7, Am, E7, Dm, Am, E7, Am. The bombo does not stop when the chords change.' }
    ],
    listen: { artist: 'Mercedes Sosa', work: 'Mercedes Sosa en Argentina' }
  },
  {
    id: 'latam-sosa-rubato',
    style: 'latam',
    players: ['sosa'],
    name: 'Mercedes Sosa: a free opening, then in time',
    focus: 'ear',
    level: 2,
    minutes: 8,
    goal: 'Open a song with held chords out of time, following an imagined singer’s breath, then bring the pulse in and keep it strictly.',
    why: 'Folk songs of the kind Sosa sang often begin slowly and freely, the voice stretching a line over a few held chords before the rhythm settles in. Accompanying that means two different skills: in the free part you follow the singer and wait; once the pulse starts you are the clock and do not move.',
    backing: { click: { beats: 2, sub: 3 } },
    tempo: [50, 80],
    steps: [
      'Turn the backing off for the free part. Strike each chord and hold it as long as one sung line would take.',
      'Breathe in before each change, as a singer would, and change on the breath out.',
      'Then start the click and play the zamba arpeggio in time.',
      'The change from free to strict is the hard part: give one bar of bass alone to set the tempo.'
    ],
    variations: [
      { name: 'Held chords', how: 'Am, Dm, E7, Am, each held out. With no click, take as long as you like.', bars: P(`${AMFULL}:h. | ${DMFULL}:h. | ${E7FULL}#:h. | ${AMFULL}:h.`), time: '6/8', key: 'Am' },
      { name: 'Slowing into the end', how: 'Arpeggiate each chord, getting slower, and hold the last bass note before the next chord.' },
      { name: 'Then in time', how: 'After the free chords, one bar of bass alone on 1 and 4, then the arpeggio with the click.' },
      { name: 'Free, strict, free', how: 'Free opening, eight bars in time, then a free ending on Am that rings until it fades.' }
    ],
    listen: { artist: 'Mercedes Sosa', work: 'Homenaje a Violeta Parra' }
  },

  /* ====================== MILTON NASCIMENTO ====================== */
  {
    id: 'brazil-milton-openstrings',
    style: 'brazil',
    players: ['milton'],
    name: 'Milton: shapes that move over ringing strings',
    focus: 'harmony',
    level: 2,
    minutes: 8,
    goal: 'Move a two-finger shape on the 4th and 3rd strings up the neck while the open B and E keep ringing, and hear each chord change colour.',
    why: 'The songs Milton Nascimento made with the Clube da Esquina circle in Minas Gerais, guitarist Toninho Horta among them, are full of chords where fretted notes rub against open strings, often a step apart or in unison. One shape moved along the neck over the same two open strings gives a whole progression, glowing and slightly blurred, in the Minas sound.',
    backing: { groove: 'toada', bars: ['Dmaj7', 'Cmaj7', 'Dmaj7', 'G6'] },
    tempo: [60, 100],
    steps: [
      'Let the 2nd and 1st strings ring open the whole time: B and E.',
      'Shapes on the 4th and 3rd strings: frets 4 and 2 (over D), 5 and 4 (over C), 7 and 6 (over D), 9 and 7 (over G).',
      'Over C and G the 3rd string plays B in unison with the open 2nd string. Let the two beat against each other.',
      'Mute the 5th and 6th strings; the band has the bass.'
    ],
    variations: [
      { name: 'Four shapes', how: 'One whole note each. Slide the fingers between shapes without lifting.', bars: P(`${S1}#:w | ${S2}:w | ${S3}#:w | ${S4}:w`), time: '4/4', key: 'D' },
      { name: 'Let it ring', how: 'The same shapes as a rolling arpeggio, every note left to ring.', bars: P('54:8 57:8 59:8 64:8 59:8 64:8 57:8 59:8 | 55:8 59:8 59:8 64:8 59:8 64:8 59:8 59:8 | 57:8 61:8 59:8 64:8 59:8 64:8 61:8 59:8 | 59:8 62:8 59:8 64:8 59:8 64:8 62:8 59:8'), time: '4/4', key: 'D' },
      { name: 'Slide into it', how: 'Slide each shape in from a fret below, and let the open strings sound the moment the fretted notes arrive.' },
      { name: 'Your own shapes', how: 'Keep the open B and E and try every two-fret shape you can reach on the 4th and 3rd strings. Keep the three you like best and make a progression of them.' }
    ],
    listen: { artist: 'Milton Nascimento and Lô Borges', work: 'Clube da Esquina' }
  },
  {
    id: 'brazil-milton-sus',
    style: 'brazil',
    players: ['milton'],
    name: 'Milton: suspended chords and a falling bass',
    focus: 'harmony',
    level: 2,
    minutes: 8,
    goal: 'Hold a sus4 chord and let it resolve late, then play a progression where the bass steps down under chords that stay put.',
    why: 'Milton’s songs often float on suspended chords and on bass lines that walk down by step while the chord above them hardly moves, a sound with roots in the church music of Minas and in the pop of the 1960s. The ear waits for the 4th to fall to the 3rd, and sometimes it never does.',
    backing: { groove: 'toada', bars: ['D', 'Bm', 'Gmaj7', 'A'] },
    tempo: [60, 100],
    steps: [
      'Dsus4 to D: only the little finger moves, from G (1st string, 3rd fret) to F♯ (2nd fret).',
      'Asus4 to A: D to C♯ on the 2nd string.',
      'For the falling bass, the thumb plays the bass on 1 and 3 and the fingers keep the same chord on 2 and 4.',
      'Play it slowly enough that every note rings into the next.'
    ],
    variations: [
      { name: 'Sus, then resolve', how: 'Dsus4 to D, Bm, Gmaj7, then Asus4 to A.', bars: P(`${DSUS}:h ${DMAJ}#:h | ${BMIN}#:w | ${GMAJ7}#:w | ${ASUS}:h ${AMAJ}#:h`), time: '4/4', key: 'D' },
      { name: 'The bass falls', how: 'D, C♯, B, A, G, F♯, E, A under the chords: D over D and C♯, Bm over B and A, G over G and F♯, then A.', bars: P('50:q 57+62+66:q 49:q 57+62+66:q | 47:q 54+59+62:q 45:q 54+59+62:q | 43:q 55+59+62:q 42:q 55+59+62:q | 40:q 57+62+64:q 45:q 57+61+64:q'), time: '4/4', key: 'D' },
      { name: 'Never resolve', how: 'Play the first variation, but stay on Asus4 at the end and let it ring out. Listen to how open the ending feels.' },
      { name: 'Sus everywhere', how: 'Make every chord sus4 or sus2 and resolve only the last one.' }
    ],
    listen: { artist: 'Milton Nascimento', work: 'Minas' }
  },
  {
    id: 'brazil-milton-meter',
    style: 'brazil',
    players: ['milton'],
    name: 'Milton: a phrase that adds a beat',
    focus: 'rhythm',
    level: 3,
    minutes: 8,
    goal: 'Play a progression in 7/4, counted 4 + 3, so each phrase is a beat shorter than you expect, until it feels natural.',
    why: 'Songs from Milton and his circle often stretch or shorten a phrase by a beat to follow the words, so a bar of three turns up among bars of four, or the bar is seven beats long. Wayne Shorter recorded Native Dancer (1975) with him. Counting it until you stop counting is the drill.',
    backing: { click: { beats: 7, sub: 2 } },
    tempo: [70, 130],
    steps: [
      'Count “1 2 3 4, 1 2 3” out loud. The click’s high note marks the first 1.',
      'Change chord on the second 1: four beats of one chord, three of the next.',
      'Then strum eighths, accenting the start of each group.',
      'Sing a melody of your own over it. Seven beats stop sounding odd once a tune fits them.'
    ],
    variations: [
      { name: 'Four and three', how: 'D for four beats, C for three; G for four, A for three.', bars: P(`${DMAJ}#:w ${CFULL}:h. | ${GFULL}:w ${AMAJ}#:h.`), time: '7/4', key: 'D' },
      { name: 'In eighths', how: 'Arpeggiate: eight eighths of D, six of C; eight of G, six of A.', bars: P('50:8 57:8 62:8 66#:8 62:8 57:8 62:8 66#:8 48:8 55:8 60:8 64:8 60:8 55:8 | 43:8 50:8 55:8 59:8 55:8 50:8 55:8 59:8 45:8 52:8 57:8 61#:8 57:8 52:8'), time: '7/4', key: 'D' },
      { name: 'Three and four', how: 'Swap the order: three beats of D, then four of C. The phrase now leans forward.' },
      { name: 'Sing first', how: 'Make up a two-bar melody that fits 4 + 3, sing it, and then find it on the guitar over the chords.' }
    ],
    listen: { artist: 'Milton Nascimento', work: 'Milagre dos Peixes' }
  },

  /* ====================== STAN GETZ ====================== */
  {
    id: 'brazil-getz-batida',
    style: 'brazil',
    players: ['getz'],
    name: 'Getz/Gilberto: the batida, soft and even',
    focus: 'technique',
    level: 2,
    minutes: 8,
    goal: 'Play João Gilberto’s kind of bossa nova guitar: the thumb steady on the bass, the fingers on a two-bar syncopated figure, very quietly.',
    why: 'On Getz/Gilberto (1964), Stan Getz’s saxophone floats over João Gilberto’s voice and guitar. Gilberto’s right hand, the batida, keeps the thumb even like a quiet surdo while the fingers pluck the chord in a pattern that pushes against it. It is soft enough to sing over in a whisper, and it is the bed every bossa nova soloist plays on.',
    backing: { groove: 'bossa', bars: ['Am7', 'D7', 'Gmaj7', 'Gmaj7'] },
    tempo: [90, 140],
    steps: [
      'The thumb plays the root on 1 and the 5th on 3, every bar, without accents.',
      'The fingers (i, m, a) pluck the top three strings together. They do not strum.',
      'The finger figure lasts two bars: 1, the & of 2 and 4, then 2 and the & of 3.',
      'Play everything soft, and the thumb softer than the fingers.'
    ],
    variations: [
      { name: 'Thumb and fingers', how: 'The two-bar figure over a steady thumb.',
        grid: { bars: 2, rows: { fingers: 'x..x..x...x..x..', thumb: 'x...x...x...x...' } } },
      { name: 'The other bar first', how: 'Start the figure from its second bar. Both orders are common; the backing plays the first.',
        grid: { bars: 2, rows: { fingers: '..x..x..x..x..x.', thumb: 'x...x...x...x...' } } },
      { name: 'Change early', how: 'Where a finger hit falls on the & of 4, play the next bar’s chord there, so the change arrives early.' },
      { name: 'Whisper', how: 'Play as quietly as you can while every note still sounds. Then hum a line over it.' }
    ],
    listen: { artist: 'Stan Getz and João Gilberto', work: 'Getz/Gilberto' }
  },
  {
    id: 'brazil-getz-line',
    style: 'brazil',
    players: ['getz'],
    name: 'Getz: long, singing lines over bossa changes',
    focus: 'melody',
    level: 2,
    minutes: 8,
    goal: 'Solo over a ii–V–I–VI in C with long held notes on the 3rds and 7ths, phrases that start late and fall, and half-step approaches.',
    why: 'Stan Getz had one of the most lyrical sounds in jazz, light, airy and singing, and on Jazz Samba (1962), with guitarist Charlie Byrd, he made bossa nova a hit in the United States. His solos sit on the chord’s colour notes and fall gently, rarely rushing. On guitar the same line needs held notes and a soft attack.',
    backing: { groove: 'bossa', bars: ['Dm7', 'G7', 'Cmaj7', 'A7'] },
    tempo: [100, 150],
    steps: [
      'Find the 3rds: F on Dm7, B on G7, E on Cmaj7, C♯ on A7. And the 7ths: C, F, B, G.',
      'Play with the fingers or a soft pick, near the neck, for a round tone.',
      'Let held notes sing: a slow vibrato after the note has sounded a moment.',
      'Start phrases after beat 1 and let them fall at the end.'
    ],
    variations: [
      { name: 'Guide tones, held', how: 'F, F, E, C♯: one note a bar, each the 3rd or 7th, moving by half steps or not at all.', bars: P('65:w | 65:w | 64:w | 61#:w'), time: '4/4', key: 'C' },
      { name: 'Start late, fall', how: 'A short rising pickup, then a long note, then a fall to the next chord’s colour.', bars: P('r:q r:8 69:8 72:h | 71:8 69:8 65:h. | r:8 67:8 71:q 69:h | 70b:q. 69:8 67:h'), time: '4/4', key: 'C' },
      { name: 'From a half step below', how: 'Each 3rd approached from a half step below on the & of 3.', bars: P('r:h r:8 64:8 65:q | r:h r:8 70b:8 71:q | r:h r:8 63b:8 64:q | r:h r:8 60:8 61#:q'), time: '4/4', key: 'C' },
      { name: 'One string', how: 'Play the second variation on the 2nd string only, sliding between notes as a saxophone would.' }
    ],
    listen: { artist: 'Stan Getz and Charlie Byrd', work: 'Jazz Samba' }
  },
  {
    id: 'brazil-getz-chain',
    style: 'brazil',
    players: ['getz'],
    name: 'Getz: ii–Vs that slide down a fret',
    focus: 'harmony',
    level: 3,
    minutes: 10,
    goal: 'Play a chain of ii–Vs falling by half steps (Em7 A7, E♭m7 A♭7, Dm7 G7) to Cmaj7, first as chords, then as two-note guide tones.',
    why: 'The bossa nova songs Getz recorded are full of ii–Vs that slip down a half step at a time, so a shape slides a fret and one note can stay while the others move. Learning the chain as moving shapes makes you hear it as one line rather than six chords.',
    backing: { groove: 'bossa', bars: ['Em7 A7', 'Ebm7 Ab7', 'Dm7 G7', 'Cmaj7'] },
    tempo: [90, 140],
    steps: [
      'Em7 with the root on the 5th string, 7th fret; A7 with the root on the 6th string, 5th fret.',
      'Each next pair is the same two shapes one fret lower.',
      'Cmaj7: the root on the 5th string, 3rd fret.',
      'Then the guide tones only: the 3rd and 7th of each chord, two notes on the 3rd and 2nd strings, each moving by a half step or staying.'
    ],
    variations: [
      { name: 'The shapes', how: 'Two chords a bar, a fret lower each bar.', bars: P(`${EM7}:h ${A7}#:h | ${EBM7}b:h ${AB7}b:h | ${DM7}:h ${G7}:h | ${CMAJ7}:w`), time: '4/4', key: 'C' },
      { name: 'Guide tones', how: 'D and G, C♯ and G; D♭ and G♭, C and G♭; C and F, B and F; B and E.', bars: P('62+67:h 61+67#:h | 61+66b:h 60+66b:h | 60+65:h 59+65:h | 59+64:w'), time: '4/4', key: 'C' },
      { name: 'Keep the top note', how: 'Find voicings of the chain whose highest note stays the same for two or three chords. Let the inner notes do the moving.' },
      { name: 'A line through it', how: 'Play the guide tones one at a time as a slow melody, one note per chord, then add a note between each.' }
    ],
    listen: { artist: 'Stan Getz', work: 'Big Band Bossa Nova' }
  },

  /* ====================== UMM KULTHUM ====================== */
  {
    id: 'arabic-kulthum-lazima',
    style: 'arabic',
    players: ['kulthum'],
    name: 'Umm Kulthum: the lazima, and room for the voice',
    focus: 'melody',
    level: 2,
    minutes: 8,
    goal: 'Play a two-bar instrumental refrain in maqam Kurd on D over maqsum, tight with the drum, then leave two bars empty for the voice.',
    why: 'In Umm Kulthum’s songs the orchestra plays a short phrase between the sung lines, a lazima, and the same lazima returns again and again, so the listener always knows where they are. The players play it together, exactly, and then fall silent or drop to a drone for the singer. Kurd on D (D E♭ F G A B♭ C) has no quarter tones, so it lies well on guitar.',
    backing: { rhythm: 'maqsum' },
    tempo: [80, 120],
    steps: [
      'Maqam Kurd on D: D E♭ F G A B♭ C D. On the guitar, start on the 5th fret of the 5th string.',
      'Maqsum: dum on 1 and 3, tek on the & of 1, the & of 2 and 4.',
      'Start and end the lazima exactly with the drum.',
      'In the empty bars, hum a slow line of your own, or just listen to the drum.'
    ],
    variations: [
      { name: 'The lazima', how: 'Up from D to A and back down to a held D.', bars: P('62:8 63b:8 65:8 67:8 69:q 67:8 65:8 | 63b:8 65:8 63b:8 62:8 62:h'), time: '4/4', key: 'Gm' },
      { name: 'Lazima, then wait', how: 'The lazima, then two bars for the singer.', bars: P('62:8 63b:8 65:8 67:8 69:q 67:8 65:8 | 63b:8 65:8 63b:8 62:8 62:h | r:w | r:w'), time: '4/4', key: 'Gm' },
      { name: 'With turns', how: 'The same lazima with quick turns around E♭ and A, as an oud or a violin would ornament it.', bars: P('62:8 63b:16 62:16 63b:8 65:8 67:8 69:16 70b:16 69:8 67:8 | 65:16 67:16 65:16 63b:16 62:8 63b:8 62:h'), time: '4/4', key: 'Gm' },
      { name: 'Tremolo', how: 'Play the held D at the end as a fast, even tremolo, the way the oud’s plectrum sustains a note.' }
    ],
    listen: { artist: 'Umm Kulthum', work: 'Enta Omri' }
  },
  {
    id: 'arabic-kulthum-repeat',
    style: 'arabic',
    players: ['kulthum'],
    name: 'Umm Kulthum: one line, again and again',
    focus: 'ear',
    level: 3,
    minutes: 10,
    goal: 'Take one short phrase in maqam Nahawand on D and play it many times, changing it each time: stretched, ornamented, higher, with the same ending.',
    why: 'Umm Kulthum would sing a single line many times in a row, changing it each time, stretching a word, moving an ornament, rising higher, as the audience called for it again. This is tarab, the rapture shared by singer and listeners, and it is why one of her concert songs could last an hour. Finding many ways to play one phrase is a lesson in variation that works in any style.',
    backing: { groove: 'drone', bars: ['Dm'] },
    tempo: [60, 100],
    steps: [
      'Nahawand on D: D E F G A B♭ C♯ D (with C natural on the way down).',
      'Learn the plain phrase first, and always end it the same way, on D.',
      'Change only one thing each time: a held note, an ornament, the octave.',
      'Leave a silence after each version, as if waiting for the hall to call for more.'
    ],
    variations: [
      { name: 'The plain line', how: 'A B♭ A G, F E D.', bars: P('r:q 69:8 70b:8 69:q 67:q | 65:q. 64:8 62:h'), time: '4/4', key: 'Dm' },
      { name: 'Stretch one word', how: 'Hold the A for a whole bar, then hurry the rest down to D.', bars: P('r:q 69:h. | 70b:8 69:8 67:8 65:8 64:q 62:q'), time: '4/4', key: 'Dm' },
      { name: 'Higher', how: 'The same shape an octave up, through C♯, then down to D.', bars: P('r:q 74:8 76:8 77:q 76:q | 74:q. 73#:8 74:h'), time: '4/4', key: 'Dm' },
      { name: 'Ten versions', how: 'Play the phrase ten times without stopping, each one different, all ending on D. Record it and listen for the one that moves you.' }
    ],
    listen: { artist: 'Umm Kulthum', work: 'Al Atlal' }
  },
  {
    id: 'arabic-kulthum-qafla',
    style: 'arabic',
    players: ['kulthum'],
    name: 'Umm Kulthum: the qafla, a cadence to end on',
    focus: 'melody',
    level: 2,
    minutes: 8,
    goal: 'Close a phrase in maqam Hijaz on D with a run down to the tonic, a held note, and a landing exactly with the drum.',
    why: 'A qafla is the cadence that ends a phrase and brings it home to the maqam’s tonic. In tarab singing the qafla is the moment of release: a held note, an ornament, then the arrival, and the audience answers it. Getting the landing in time with the drum is as important as the notes.',
    backing: { rhythm: 'maqsum' },
    tempo: [80, 120],
    steps: [
      'Hijaz on D: D E♭ F♯ G A B♭ C D. The step from E♭ up to F♯ is the Hijaz sound.',
      'Learn the run down slowly, then at tempo.',
      'Hold the note before the end with a slow vibrato, then let it go.',
      'Land on D with the dum on 1 and stop.'
    ],
    variations: [
      { name: 'Down to the tonic', how: 'From D an octave up, down through Hijaz, landing on D.', bars: P('74:8 72:8 70b:8 69:8 67:8 66#:8 63b:8 66#:8 | 62:h r:h'), time: '4/4', key: 'Gm' },
      { name: 'Hold, then land', how: 'A long A, a turn through G and F♯, then E♭ and D on the beat.', bars: P('69:h. 67:8 66#:8 | 63b:8 62:8 r:q 62:q r:q'), time: '4/4', key: 'Gm' },
      { name: 'With the band', how: 'Play the first variation so that the last D falls on the dum on 1 of the next cycle, then stop dead with the drum.' },
      { name: 'In Kurd', how: 'Play the same shape with F instead of F♯ (maqam Kurd). The ending is darker and softer.' }
    ],
    listen: { artist: 'Umm Kulthum', work: 'Alf Leila wa Leila' }
  }
];
