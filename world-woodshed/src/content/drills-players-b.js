/* World Woodshed — a second set of drills for each favourite player (PLAYERS in src/taste.js), two each, in
   the player's own style. Like drills-heroes.js and drills-players.js, every phrase is an original practice
   pattern built from devices the musician is known for; none is a transcription of a recording or one of their
   melodies. Phrases use the same short form: 'midi:dur' (sounding pitch), '.' after the duration for a dot,
   'b' or '#' after the pitch to spell it, 'r' for a rest, '|' between bars, '+' between the pitches of a chord. */

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

/* Chord shapes as '+'-joined sounding pitches; frets from the 6th string (x = not played) */
const BB7 = '46+56+62';        // B♭7 shell: x 1 x 1 3 x (B♭, A♭, D)
const EB7 = '51+55+61';        // E♭7 shell: x 6 5 6 x x (E♭, G, D♭)
const CM = '48+52+55+60+64';   // open C
const G7O = '43+47+50+55+59+65'; // open G7
const FMAJ = '53+57+60+65';    // F: x x 3 2 1 1
const DPED = '50+57+62+66', CPED = '50+55+60+64', GPED = '50+55+59+67'; // D, C over D, G over D: the open 4th string under each
const DM9 = '50+57+60+64', A7B9 = '45+55+58+61';  // Dm9 without its 3rd (D A C E) x x 0 2 1 0, A7♭9 x 0 5 3 2 x

export default [
  /* ---------------- Thelonious Monk ---------------- */
  {
    id: 'jazz-monk-leaps',
    style: 'jazz',
    players: ['monk'],
    name: 'Monk: lines of wide leaps',
    focus: 'melody',
    level: 3,
    minutes: 8,
    goal: 'Build lines from wide and awkward intervals (major 7ths, 9ths, tritones) and make them land on a chord tone in time.',
    why: 'Many of Monk’s themes jump where other players would step: a 7th up, a 9th down, a tritone across. The leaps sound angular at first and then completely logical, because each one lands on a strong note of the chord. On guitar, leaps across strings train your hand to see the same note in two octaves at once.',
    backing: { groove: 'swing', bars: ['C6', 'C6', 'G7', 'C6'] },
    tempo: [60, 150],
    steps: [
      'A major 7th is an octave minus a half step: on neighbouring strings two apart (the 5th and 3rd), it is one fret back from the octave shape.',
      'A 9th is an octave plus a whole step: the octave shape, then two frets up.',
      'Play each leap slowly and hold the note it lands on.',
      'Then put the leaps in rhythm with the band.'
    ],
    variations: [
      { name: 'Major 7ths', how: 'C up to B; then G up to F♯, D up to C♯ and E up to E♭, each falling a half step.', bars: P('48:q 59:h r:q | 55:q 66#:q 67:h | 50:q 61#:q 62:h | 52:q 63b:q 64:h'), time: '4/4', key: 'C' },
      { name: 'Down a 9th', how: 'High notes falling a 9th, each landing on a note of the chord.', bars: P('76:q 62:q r:h | 74:q 60:q r:h | 77:q 63b:8 62:8 r:h | 76:q 62:q 60:h'), time: '4/4', key: 'C' },
      { name: 'Tritones', how: 'B and F, the tritone inside G7, played as leaps up and down, resolving to C and E.', bars: P('59:8 65:8 r:q 65:8 59:8 r:q | 60:8 64:8 r:h. | 71:8 65:8 r:q 65:8 71:8 r:q | 72:h 64:h'), time: '4/4', key: 'C' },
      { name: 'Your own theme', how: 'Write four notes with at least two leaps of a 6th or more. Repeat it over the four bars, starting on a different beat each time.' }
    ],
    listen: { artist: 'Thelonious Monk', work: 'Genius of Modern Music' }
  },
  {
    id: 'jazz-monk-strolling',
    style: 'jazz',
    players: ['monk'],
    name: 'Monk: comp sparsely, then stroll',
    focus: 'rhythm',
    level: 2,
    minutes: 8,
    goal: 'Comp a blues with as few chords as possible on unexpected beats, then lay out for a whole chorus and come back in on time.',
    why: 'Monk often stood up from the piano while a horn player soloed and danced beside it, letting bass and drums carry the band. When he played behind a soloist he could leave long gaps and then drop one hard chord on an odd beat. Laying out, which jazz players call strolling, takes as much attention as comping: you must know where 1 is to come back in.',
    backing: { groove: 'swing', bars: ['Bb7', 'Eb7', 'Bb7', 'Bb7', 'Eb7', 'Eb7', 'Bb7', 'Bb7', 'F7', 'Eb7', 'Bb7', 'F7'] },
    tempo: [80, 180],
    steps: [
      'Three-note shells: B♭7 with the root on the 5th string, 1st fret (x 1 x 1 3 x); E♭7 with the root on the 5th string, 6th fret (x 6 5 6 x x).',
      'Play at most two chords in a bar, never two bars in a row the same way.',
      'For the stroll, keep counting the bars out loud or in your head.',
      'Come back in on beat 1 of the first bar of a chorus, hard.'
    ],
    variations: [
      { name: 'One chord, odd places', how: 'The & of 1, beat 4, the & of 3, then a held chord.', bars: P(`r:8 ${BB7}b:8 r:h. | r:h. ${EB7}b:q | r:h r:8 ${BB7}b:8 r:q | ${BB7}b:w`), time: '4/4', key: 'Bb' },
      { name: 'Anticipate the change', how: 'Play each new chord an eighth early, on the & of 4 of the bar before.', bars: P(`r:h. r:8 ${EB7}b:8 | r:w | r:h. r:8 ${BB7}b:8 | r:w`), time: '4/4', key: 'Bb' },
      { name: 'Stroll', how: 'Comp one chorus, lay out for one, comp the next. Count the twelve bars of the empty chorus on your fingers.' },
      { name: 'Back in with a crash', how: 'After the empty chorus, come in on beat 1 with B♭7 plus a B natural rubbing against its B♭: Monk’s minor second.' }
    ],
    listen: { artist: 'Thelonious Monk Quartet with John Coltrane', work: 'At Carnegie Hall' }
  },

  /* ---------------- Sun Ra ---------------- */
  {
    id: 'jazz-sunra-riffs',
    style: 'jazz',
    players: ['sunra'],
    name: 'Sun Ra: big-band riffs on a blues',
    focus: 'melody',
    level: 2,
    minutes: 8,
    goal: 'Play two short riffs over a B♭ blues as two sections of a big band would, one calling and one answering.',
    why: 'Before the space music, Sun Ra was a swing pianist and arranger in Chicago, and in 1946–47 he worked with Fletcher Henderson’s band. His Arkestra kept that swing-band craft all its life: riffs passed between the saxophones and the brass. A riff is a short phrase repeated over changing chords, and it has to fit all of them.',
    backing: { groove: 'swing', bars: ['Bb7', 'Eb7', 'Bb7', 'Bb7', 'Eb7', 'Eb7', 'Bb7', 'Bb7', 'F7', 'Eb7', 'Bb7', 'F7'] },
    tempo: [100, 190],
    steps: [
      'Riff A uses only F, A♭ and B♭: they fit B♭7, E♭7 and F7 with little change.',
      'Riff B answers in the gap riff A leaves.',
      'Play riff A for two bars, riff B for two, all through the blues.',
      'Accent the last note of each riff, as a horn section does.'
    ],
    variations: [
      { name: 'Riff A, the saxes', how: 'F A♭ B♭, then a rest. Two bars, repeated.', bars: P('65:8 68b:8 70b:q r:h | 65:8 68b:8 70b:8 68b:8 r:h'), time: '4/4', key: 'Bb' },
      { name: 'Riff B, the brass', how: 'Short hits in the second half of the bar.', bars: P('r:h 74:8 74:8 r:q | r:h 75b:8 74:8 r:q'), time: '4/4', key: 'Bb' },
      { name: 'Call and answer', how: 'A then B in the same bar.', bars: P('65:8 68b:8 70b:q 74:8 74:8 r:q | 65:8 68b:8 70b:q 75b:8 74:8 r:q'), time: '4/4', key: 'Bb' },
      { name: 'Over the changes', how: 'Keep riff A the same over E♭7 and F7. Where a note clashes, move it a half step and hear the riff change colour.' }
    ],
    listen: { artist: 'Sun Ra and His Arkestra', work: 'Jazz in Silhouette' }
  },
  {
    id: 'jazz-sunra-colours',
    style: 'jazz',
    players: ['sunra'],
    name: 'Sun Ra: sound colours on the guitar',
    focus: 'technique',
    level: 2,
    minutes: 8,
    goal: 'Over a drone, make sounds rather than notes: volume swells, slides, harmonics and bends, each held and shaped.',
    why: 'Sun Ra was one of the first jazz musicians to use electric keyboards and synthesizers, and he chose sounds for their colour as much as their pitch. On guitar, colour comes from how a note starts and how it changes while it rings: a swell with the volume knob, a slow slide, a harmonic, a bend.',
    backing: { groove: 'drone', bars: ['Em7'] },
    tempo: [50, 90],
    steps: [
      'Swell: turn the guitar’s volume down, pick the note, then roll the volume up. (On acoustic, pick very softly and let the note bloom.)',
      'Harmonics: touch the string lightly over the 12th, 7th or 5th fret and pick.',
      'Slide: pick once and move the finger slowly a few frets, keeping the pressure.',
      'One sound at a time, as long as it lasts.'
    ],
    variations: [
      { name: 'Swells', how: 'E, B, then G and D together, each swelled in and left to ring.', bars: P('64:w | 71:w | 67+74:w | r:w'), time: '4/4', key: 'Em' },
      { name: 'Harmonics', how: 'The 12th-fret harmonics on the top four strings, then the 7th-fret ones.' },
      { name: 'Slow slides', how: 'One note on the 3rd string, slid up four frets over a whole bar, then back.' },
      { name: 'A piece of colours', how: 'Two minutes using only these sounds. Plan the order: start thin and quiet, grow, end on one harmonic.' }
    ],
    listen: { artist: 'Sun Ra', work: 'Lanquidity' }
  },

  /* ---------------- Miles Davis ---------------- */
  {
    id: 'jazz-miles-ballad',
    style: 'jazz',
    players: ['miles'],
    name: 'Miles: a ballad line, then paraphrase it',
    focus: 'melody',
    level: 2,
    minutes: 8,
    goal: 'Play a slow line plainly, then again with its rhythm moved and one or two notes changed, so it is still recognisable.',
    why: 'On ballads Miles stated the melody almost bare, behind the beat, and then paraphrased it: the same contour with notes delayed, left out or bent. A paraphrase sits between the tune and a solo, and it teaches you that changing the rhythm changes a phrase more than changing its notes.',
    backing: { groove: 'swing', bars: ['Fmaj7', 'Dm7', 'Gm7', 'C7'] },
    tempo: [50, 80],
    steps: [
      'Play the line slowly with a soft attack and no vibrato until the end of each long note.',
      'Then play it a little behind the beat: let the band arrive first.',
      'Paraphrase: keep the first and last notes, and change only the rhythm between them.',
      'Then change one note in the middle.'
    ],
    variations: [
      { name: 'The plain line', how: 'A slow line through F, Dm7, Gm7 and C7.', bars: P('69:h. 72:q | 69:h 65:h | 70b:h. 69:q | 67:w'), time: '4/4', key: 'F' },
      { name: 'Moved in time', how: 'The same notes, each one late.', bars: P('r:8 69:q. 72:h | r:q 69:q. 65:8 r:q | r:8 70b:h. 69:8 | r:q 67:h.'), time: '4/4', key: 'F' },
      { name: 'One note changed', how: 'The second bar now reaches up to D, the 6th of F, before falling.', bars: P('r:8 69:q. 72:h | r:q 74:q. 65:8 r:q | r:8 70b:h. 69:8 | r:q 67:h.'), time: '4/4', key: 'F' },
      { name: 'Leave notes out', how: 'Play the line with only three of its notes. Choose which ones carry it.' }
    ],
    listen: { artist: 'Miles Davis', work: 'Kind of Blue' }
  },
  {
    id: 'jazz-miles-scalechain',
    style: 'jazz',
    players: ['miles'],
    name: 'Miles: a chain of scales, moving when you are ready',
    focus: 'ear',
    level: 3,
    minutes: 10,
    goal: 'Improvise through five scales in order, each held as long as you choose, and hear each change as a new colour.',
    why: 'For one piece on Kind of Blue, the players were given a series of scales instead of a chord chart, and each soloist moved to the next scale when they felt ready. The music becomes a set of moods rather than a progression. Practising a chain of scales trains you to hear what one changed note does to everything around it.',
    backing: { groove: 'drone', bars: ['Cmaj7', 'Abmaj7', 'Dm7', 'Em', 'G7'] },
    tempo: [50, 80],
    steps: [
      'The chain: C Ionian (C major), A♭ Lydian, D Dorian, E Phrygian, G Mixolydian.',
      'C Ionian, D Dorian, E Phrygian and G Mixolydian all use the notes of C major; only the home note changes. A♭ Lydian is the odd one out.',
      'With the backing, the scales change every bar. Without it, stay in each as long as you like.',
      'At each change, play the one note that is new, so the change is heard.'
    ],
    variations: [
      { name: 'Up each scale', how: 'An octave of each scale, one bar each. Listen to the home note.', bars: P('60:8 62:8 64:8 65:8 67:8 69:8 71:8 72:8 | 56b:8 58b:8 60:8 62:8 63b:8 65:8 67:8 68b:8 | 62:8 64:8 65:8 67:8 69:8 71:8 72:8 74:8 | 64:8 65:8 67:8 69:8 71:8 72:8 74:8 76:8 | 67:8 69:8 71:8 72:8 74:8 76:8 77:8 79:8'), time: '4/4', key: 'C' },
      { name: 'The colour note', how: 'Just each scale’s character note, held: B (Ionian’s 7th), D (Lydian’s ♯4 on A♭), B (Dorian’s 6th), F (Phrygian’s ♭2), F (Mixolydian’s ♭7).', bars: P('71:w | 74:w | 71:w | 65:w | 77:w'), time: '4/4', key: 'C' },
      { name: 'Take your time', how: 'Turn the backing off. Play over a drone on each home note, and move to the next only when you have said something in the one you are in.' },
      { name: 'Your own chain', how: 'Make a chain of four scales from different keys. Write it down and play it as a piece.' }
    ],
    listen: { artist: 'Miles Davis', work: 'Kind of Blue' }
  },

  /* ---------------- Arsenio Rodríguez ---------------- */
  {
    id: 'cuba-arsenio-guajeo',
    style: 'cuba',
    players: ['arsenio'],
    name: 'Arsenio: a two-bar guajeo on the 2-3 clave',
    focus: 'technique',
    level: 2,
    minutes: 8,
    goal: 'Play a two-bar tres-style guajeo in C over 2-3 son clave, octaves and single notes, without losing the clave.',
    why: 'The guajeo is the tres’s own repeated figure in the montuno, and in Arsenio’s conjunto it locked with the piano, the bass and the clave. A guajeo is a melody and a rhythm at once: it outlines the chords and leaves the strongest beats for the bass and the conga.',
    backing: { groove: 'son23', bars: ['C', 'G7'] },
    tempo: [80, 120],
    steps: [
      'Pick with a light, steady down-up on the sixteenths, touching the strings only where notes are.',
      'The first bar is the 2 side of the clave, the second the 3 side.',
      'Start slowly with the clave alone, then with the band.',
      'Keep the octaves short and bright, like a tres’s doubled strings.'
    ],
    variations: [
      { name: 'Single notes', how: 'G and E around C, then F and D for G7.', bars: P('r:8 67:8 64:8 67:8 72:8 67:8 64:8 r:8 | r:8 65:8 62:8 65:8 71:8 65:8 62:8 r:8'), time: '4/4', key: 'C' },
      { name: 'Octaves', how: 'The same notes in octaves on the 4th and 2nd strings.', bars: P('r:8 55+67:8 52+64:8 55+67:8 60+72:8 55+67:8 52+64:8 r:8 | r:8 53+65:8 50+62:8 53+65:8 59+71:8 53+65:8 50+62:8 r:8'), time: '4/4', key: 'C' },
      { name: 'With the anticipation', how: 'Play the last note of each bar on the & of 4, a step from the next chord, so the change arrives early.', bars: P('r:8 67:8 64:8 67:8 72:8 67:8 64:8 65:8 | r:8 65:8 62:8 65:8 71:8 65:8 62:8 64:8'), time: '4/4', key: 'C' },
      { name: 'Your own guajeo', how: 'Keep the rhythm of the first variation and choose new notes from each chord.' }
    ],
    listen: { artist: 'Arsenio Rodríguez y su Conjunto', work: 'Dundunbanza' }
  },
  {
    id: 'cuba-arsenio-cierre',
    style: 'cuba',
    players: ['arsenio'],
    name: 'Arsenio: the band break on the clave',
    focus: 'rhythm',
    level: 2,
    minutes: 8,
    goal: 'End a montuno with a two-bar break that the whole band plays together, on the clave, and stop dead.',
    why: 'Arsenio’s conjunto played arranged breaks, short figures the whole band hits in unison, to end a section or launch the next. Afterwards everyone stops, or the montuno comes back in on the next 1. A break only works if it sits exactly on the clave, so it is a rhythm drill as much as a riff.',
    backing: { groove: 'son', bars: ['C F', 'G7 F', 'C F', 'G7 C'] },
    tempo: [80, 115],
    steps: [
      'Play three bars of montuno chords, then the break in the fourth bar.',
      'The break’s hits match the clave strokes of that bar, or the bell.',
      'After the last hit, mute the strings completely.',
      'Then count one bar of silence before going on.'
    ],
    variations: [
      { name: 'On the clave', how: 'Three bars of chords on 2 and 4, then C on the five clave strokes.', bars: P(`r:q ${CM}:q r:q ${FMAJ}:q | r:q ${G7O}:q r:q ${FMAJ}:q | r:q ${CM}:q r:q ${FMAJ}:q | ${CM}:8. ${CM}:8. ${CM}:q ${CM}:8 ${CM}:q`), time: '4/4', key: 'C' },
      { name: 'In unison', how: 'The break as a single line, as the trumpets and the tres would play it together.', bars: P('r:q 64+67:q r:q 65+69:q | r:q 65+71:q r:q 65+69:q | r:q 64+67:q r:q 65+69:q | 72:8. 71:8. 67:q 69:8 72:q'), time: '4/4', key: 'C' },
      { name: 'Stop dead', how: 'After the break, a bar of complete silence while the backing goes on. Come back in on 1.' },
      { name: 'Your own break', how: 'Make a break of your own that starts on beat 1 and ends on beat 4 of the same bar.' }
    ],
    listen: { artist: 'Arsenio Rodríguez y su Conjunto', work: 'Fuego en el 23' }
  },

  /* ---------------- Buena Vista Social Club ---------------- */
  {
    id: 'cuba-bvsc-cinquillo',
    style: 'cuba',
    players: ['bvsc'],
    name: 'Buena Vista: the cinquillo',
    focus: 'rhythm',
    level: 2,
    minutes: 8,
    goal: 'Play the cinquillo, five strokes in eight eighths (long-short-long-short-long), as chords, then as a bass line, against a steady beat.',
    why: 'The cinquillo is one of the oldest Cuban rhythms, the heart of the danzón and alive in son and bolero. Rubén González’s piano on Buena Vista comes from the danzón tradition, and the cinquillo is everywhere in that style. It is the same as the first half of the clave with one more stroke added.',
    backing: { click: { beats: 4, sub: 2 } },
    grid: { count: '1 & 2 & 3 & 4 &' },
    tempo: [70, 120],
    steps: [
      'Count eighths: “1 & 2 & 3 & 4 &”. The cinquillo strikes on 1, 2, the & of 2, the & of 3 and 4.',
      'Clap it first while you tap your foot on every beat.',
      'Then strum it on one chord, down strokes only.',
      'Then alternate: one bar of cinquillo, one bar of the beat alone.'
    ],
    variations: [
      { name: 'The cinquillo', how: 'Five strokes: long, short, long, short, long.',
        grid: { rows: { strum: 'X.xx.xx.' } } },
      { name: 'With the beat', how: 'The thumb plays every beat on the bass, the fingers play the cinquillo.',
        grid: { rows: { fingers: 'X.xx.xx.', thumb: 'x.x.x.x.' } } },
      { name: 'Cinquillo, then rest', how: 'One bar of cinquillo, one of only the beat.',
        grid: { bars: 2, rows: { strum: 'X.xx.xx.x.x.x.x.' } } },
      { name: 'In a progression', how: 'C, F, G7, C, one bar each, every bar on the cinquillo.' }
    ],
    listen: { artist: 'Rubén González', work: 'Introducing… Rubén González' }
  },
  {
    id: 'cuba-bvsc-laud',
    style: 'cuba',
    players: ['bvsc'],
    name: 'Buena Vista: laúd-style tremolo in a guajira',
    focus: 'technique',
    level: 3,
    minutes: 8,
    goal: 'Play a slow line in thirds with fast, even tremolo picking on each note, as the Cuban laúd does in the country music of the guajira.',
    why: 'Barbarito Torres played the laúd, a small Cuban lute with doubled strings, on Buena Vista, and its quick tremolo and runs in thirds come from the punto and guajira of the Cuban countryside. On guitar, a steady tremolo with a pick keeps long notes singing the way the laúd’s doubled strings do.',
    backing: { groove: 'son', bars: ['G', 'C', 'D7', 'G'] },
    tempo: [60, 100],
    steps: [
      'Tremolo: very fast down-up picking on one note, from the wrist, with a loose grip.',
      'Keep the tremolo even when you move to the next note; do not stop picking between notes.',
      'Thirds on the 2nd and 1st strings, moving down the G major scale.',
      'Start each note exactly on the beat, then fill it with tremolo.'
    ],
    variations: [
      { name: 'One note', how: 'D, held for a bar, as an even tremolo. Then G, C, D, G on the beat.', bars: P('74:w | 72:w | 74:w | 71:w'), time: '4/4', key: 'G' },
      { name: 'Thirds', how: 'Thirds down the scale, a half note each, tremolo throughout.', bars: P('71+74:h 69+72:h | 67+71:h 64+67:h | 66+69:h 64+67:h | 67+71:w'), time: '4/4', key: 'G' },
      { name: 'Run, then tremolo', how: 'A quick run down to the third, then hold it with tremolo.', bars: P('79:8 78:8 76:8 74:8 71+74:h | 76:8 74:8 72:8 71:8 67+72:h | 69:8 72:8 74:8 76:8 66+72:h | 67+71:w'), time: '4/4', key: 'G' },
      { name: 'Your own line', how: 'Make a four-bar line in thirds, one or two notes a bar, and play it with tremolo over the guajira chords.' }
    ],
    listen: { artist: 'Buena Vista Social Club', work: 'Buena Vista Social Club' }
  },

  /* ---------------- Astor Piazzolla ---------------- */
  {
    id: 'latam-piazzolla-milonga',
    style: 'latam',
    players: ['piazzolla'],
    name: 'Piazzolla: a milonga lenta',
    focus: 'technique',
    level: 2,
    minutes: 8,
    goal: 'Fingerpick a slow milonga in E minor: the bass in 3 + 3 + 2, arpeggios in between, and a melody note held on top.',
    why: 'Among Piazzolla’s most played pieces are slow milongas, such as “Milonga del ángel” (1965), where the 3 + 3 + 2 of the old milonga slows to a heartbeat under a long, sad melody. Slowed down, the rhythm needs no accents: it is in the bass alone, and the space above it is for the melody.',
    backing: { groove: 'tango332', bars: ['Em', 'Am', 'B7', 'Em'] },
    tempo: [50, 80],
    steps: [
      'The thumb plays the bass on 1, the & of 2 and 4: root, root, 5th.',
      'The fingers fill the eighths between with notes of the chord.',
      'The melody note on top is struck with the first bass note and held.',
      'Play slowly and softly; let each bar sound a little different.'
    ],
    variations: [
      { name: 'The bass alone', how: 'E, E, B; A, A, E; B, B, F♯; E, E, B.', bars: P('40:q. 40:q. 47:q | 45:q. 45:q. 40:q | 47:q. 47:q. 42#:q | 40:q. 40:q. 47:q'), time: '4/4', key: 'Em' },
      { name: 'Bass and arpeggio', how: 'The bass with the chord’s notes between.', bars: P('40:8 55:8 59:8 40:8 55:8 59:8 47:8 55:8 | 45:8 57:8 60:8 45:8 57:8 60:8 40:8 57:8 | 47:8 57:8 63#:8 47:8 57:8 63#:8 42#:8 57:8 | 40:8 55:8 59:8 40:8 55:8 59:8 47:8 55:8'), time: '4/4', key: 'Em' },
      { name: 'With a melody', how: 'A long note on top of each bar: G, C, D♯ resolving to E.', bars: P('40+67:8 55:8 59:8 40:8 55:8 59:8 47:8 55:8 | 45+72:8 57:8 60:8 45:8 57:8 60:8 40:8 57:8 | 47+75#:8 57:8 63#:8 47:8 57:8 63#:8 42#:8 57:8 | 40+76:8 55:8 59:8 40:8 55:8 59:8 47:8 55:8'), time: '4/4', key: 'Em' },
      { name: 'Your own melody', how: 'Keep the bass and arpeggio and make up a melody of one or two notes a bar on the 1st string.' }
    ],
    listen: { artist: 'Astor Piazzolla', work: 'Milonga del ángel' }
  },
  {
    id: 'latam-piazzolla-imitation',
    style: 'latam',
    players: ['piazzolla'],
    name: 'Piazzolla: two voices in imitation',
    focus: 'harmony',
    level: 3,
    minutes: 10,
    goal: 'Play a short subject in A minor, then the same subject a fifth higher while the first voice goes on, as a fugue begins.',
    why: 'Piazzolla loved Bach and studied classical composition, and fugues and imitative passages run through his tangos. In imitation one voice states a subject and a second voice copies it a little later, often a fifth higher, while the first carries on. Playing both on one guitar is hard and teaches you to hear two lines at once.',
    backing: { click: { beats: 4, sub: 2 } },
    tempo: [50, 90],
    steps: [
      'Learn the subject alone: two bars on the 3rd and 2nd strings.',
      'Learn the answer: the same shape a fifth higher, on the 2nd and 1st strings.',
      'Then the counter-line that the first voice plays under the answer.',
      'Put them together slowly. Let the lower voice be a little softer.'
    ],
    variations: [
      { name: 'The subject', how: 'A, C, B, E, then down to A.', bars: P('57:q 60:q 59:q 64:q | 62:8 60:8 59:8 57:8 56#:q 57:q'), time: '4/4', key: 'Am' },
      { name: 'The answer', how: 'The subject a fifth higher, starting on E.', bars: P('64:q 67:q 66#:q 71:q | 69:8 67:8 66#:8 64:8 63#:q 64:q'), time: '4/4', key: 'Am' },
      { name: 'Both voices', how: 'The subject, then the answer above while the lower voice moves in long notes.', bars: P('57:q 60:q 59:q 64:q | 62:8 60:8 59:8 57:8 56#:q 57:q | 57+64:q 55+67:q 53+66#:q 52+71:q | 53+69:8 67:8 64+66#:8 64:8 52+63#:q 57+64:q'), time: '4/4', key: 'Am' },
      { name: 'Your own subject', how: 'Write a two-bar subject in A minor, play it a fifth higher as an answer, and find a slow line to go under it.' }
    ],
    listen: { artist: 'Astor Piazzolla', work: 'María de Buenos Aires' }
  },

  /* ---------------- Mercedes Sosa ---------------- */
  {
    id: 'latam-sosa-bombo',
    style: 'latam',
    players: ['sosa'],
    name: 'Mercedes Sosa: the bombo on your guitar',
    focus: 'rhythm',
    level: 2,
    minutes: 8,
    goal: 'Play a bombo legüero pattern on the guitar’s body, the drum’s head with the palm and its wooden rim with the fingertips, in six.',
    why: 'The bombo legüero, a wooden drum with goat or sheep skin, is played on its skin (the parche) and on its wooden rim (the aro), and the mix of deep and dry strokes carries the zamba and the chacarera. Sosa played it herself on stage. Playing the pattern on the guitar body puts the rhythm in your hands before you strum it.',
    backing: { rhythm: 'sesqui' },
    grid: { time: '6/8', count: '1 2 3 4 5 6' },
    tempo: [60, 110],
    steps: [
      'Parche: the flat of the hand on the top, near the bridge: a low thump.',
      'Aro: the fingertips on the edge of the body: a dry click.',
      'One common way to play it is given below; drummers vary it.',
      'Then strum the same rhythm on a chord, a deep strum for the parche and a muted chop for the aro.'
    ],
    variations: [
      { name: 'Parche and aro', how: 'A deep stroke on 1, rim strokes between.',
        grid: { rows: { parche: 'X.....', aro: '.xx.xx' } } },
      { name: 'In three', how: 'Deep strokes on 1, 3 and 5.',
        grid: { rows: { parche: 'X.x.x.', aro: '.x.x.x' } } },
      { name: 'Two bars', how: 'One bar in two, one in three.',
        grid: { bars: 2, rows: { parche: 'X..x..X.x.x.', aro: '.xx.xx.x.x.x' } } },
      { name: 'On the strings', how: 'Play the two-bar pattern on an Am chord: a full strum for the parche, a strum muted with the palm for the aro.' }
    ],
    listen: { artist: 'Mercedes Sosa', work: 'Canciones con fundamento' }
  },
  {
    id: 'latam-sosa-huayno',
    style: 'latam',
    players: ['sosa'],
    name: 'Mercedes Sosa: carnavalito and huayno strum',
    focus: 'rhythm',
    level: 2,
    minutes: 8,
    goal: 'Strum the bright Andean rhythm of the carnavalito and huayno, an eighth and two sixteenths, in A minor, without rushing the sixteenths.',
    why: 'Sosa sang the music of every part of Argentina and of the Andes beyond it, including the carnavalitos of Jujuy and the huayno shared with Bolivia and Peru. Their rhythm, long-short-short, is light and driving, and on guitar it is a quick down, down-up.',
    backing: { rhythm: 'huayno' },
    tempo: [70, 110],
    steps: [
      'Count “1 e & a 2 e & a”. The strokes are on 1, &, a, 2, &, a.',
      'Strum down on 1, down on &, up on a.',
      'Keep the arm moving in sixteenths so the up-stroke falls in place.',
      'The bass note on each beat comes first, the strum after it.'
    ],
    variations: [
      { name: 'The strum', how: 'Long-short-short, twice in a bar of 2/4.', bars: P('57+60+64:8 57+60+64:16 57+60+64:16 57+60+64:8 57+60+64:16 57+60+64:16'), time: '2/4', key: 'Am' },
      { name: 'Bass and strum', how: 'The bass on the beat, the strum on & and a.', bars: P('45:8 57+60+64:16 57+60+64:16 40:8 57+60+64:16 57+60+64:16 | 43:8 55+59+62:16 55+59+62:16 50:8 55+59+62:16 55+59+62:16'), time: '2/4', key: 'Am' },
      { name: 'Am, G, C, E7', how: 'The progression Andean songs love: Am, G, C, E7, one bar each, then Am.' },
      { name: 'Faster', how: 'Raise the tempo 4 bpm each time the strum stays even, and stop when the sixteenths blur.' }
    ],
    listen: { artist: 'Mercedes Sosa', work: 'Mercedes Sosa en Argentina' }
  },

  /* ---------------- Milton Nascimento ---------------- */
  {
    id: 'brazil-milton-pedal',
    style: 'brazil',
    players: ['milton'],
    name: 'Milton: chords over a D pedal',
    focus: 'harmony',
    level: 2,
    minutes: 8,
    goal: 'Keep the open D string ringing as a pedal while D, C and G chords move above it, and hear the colours it makes.',
    why: 'A pedal is a bass note that stays while the chords above it change. In music from Minas Gerais, Milton’s home, the open strings of guitar and viola make pedals natural, and C or G over a D bass gives the modal, open sound of so much of Clube da Esquina. It is D Mixolydian: D major with a C natural.',
    backing: { groove: 'toada', bars: ['D', 'D', 'D', 'D'] },
    tempo: [60, 100],
    steps: [
      'The 4th string, open D, is played on every beat with the thumb.',
      'D: frets 2, 3, 2 on the 3rd, 2nd, 1st strings. C over D: x x 0 0 1 0. G over D: x x 0 0 0 3.',
      'Change the top chord, never the bass.',
      'Listen for the C over D: the bass and the chord do not agree, and it sounds beautiful.'
    ],
    variations: [
      { name: 'D, C, G, D', how: 'One chord a bar over the D pedal.', bars: P(`${DPED}#:w | ${CPED}:w | ${GPED}:w | ${DPED}#:w`), time: '4/4', key: 'D' },
      { name: 'Two a bar', how: 'D and C in the first bar, G and D in the second.', bars: P(`${DPED}#:h ${CPED}:h | ${GPED}:h ${DPED}#:h | ${DPED}#:h ${CPED}:h | ${GPED}:h ${DPED}#:h`), time: '4/4', key: 'D' },
      { name: 'Arpeggio', how: 'D pedal on the beats, chord notes between.', bars: P('50:8 57:8 62:8 66#:8 50:8 62:8 57:8 62:8 | 50:8 55:8 60:8 64:8 50:8 60:8 55:8 60:8 | 50:8 55:8 59:8 67:8 50:8 59:8 55:8 59:8 | 50:8 57:8 62:8 66#:8 50:8 62:8 57:8 62:8'), time: '4/4', key: 'D' },
      { name: 'Your own chords', how: 'Find other chords whose notes you can play over the open D: Em, Am, F. Keep the ones that glow.' }
    ],
    listen: { artist: 'Milton Nascimento and Lô Borges', work: 'Clube da Esquina' }
  },
  {
    id: 'brazil-milton-leaps',
    style: 'brazil',
    players: ['milton'],
    name: 'Milton: a melody that leaps an octave',
    focus: 'melody',
    level: 2,
    minutes: 8,
    goal: 'Play a slow melody that jumps up an octave or more and floats down, keeping the high notes soft and the leaps clean.',
    why: 'Milton’s voice moves from a deep chest voice to a high falsetto in a single phrase, and many of his melodies are built on those leaps. On guitar the leaps cross the neck: the high note is played softer, as a singer floats it, and held while the line falls step by step.',
    backing: { groove: 'toada', bars: ['Dmaj7', 'Bm7', 'Gmaj7', 'A7'] },
    tempo: [60, 90],
    steps: [
      'Find each high note before you play the phrase, so the hand arrives without a slide.',
      'Play the low note firmly and the high note softly.',
      'Let the high note ring while you fall back down.',
      'Breathe between phrases.'
    ],
    variations: [
      { name: 'Up an octave', how: 'F♯ up to F♯, then falling to D; D up to D, falling to A.', bars: P('54:q 66#:h. | 64:q 62:q 61#:h | 50:q 62:h. | 61#:q 59:q 57:h'), time: '4/4', key: 'D' },
      { name: 'Up a ninth', how: 'Each leap an octave and a step.', bars: P('54:q 68#:h 66#:q | 59:q 73#:h 71:q | 55:q 69:h 67:q | 57:q 71:h 69:q'), time: '4/4', key: 'D' },
      { name: 'Leap and slide', how: 'The same leaps, sliding into the high note from a step below.' },
      { name: 'Your own phrase', how: 'Make a four-bar melody with one big leap in each bar, and sing it before you play it.' }
    ],
    listen: { artist: 'Milton Nascimento', work: 'Minas' }
  },

  /* ---------------- Stan Getz ---------------- */
  {
    id: 'brazil-getz-chordmelody',
    style: 'brazil',
    players: ['getz'],
    name: 'Jazz Samba: chord melody on nylon strings',
    focus: 'harmony',
    level: 3,
    minutes: 10,
    goal: 'Play a melody on the top string with the chord under each note, through a minor bossa progression, as Charlie Byrd did on nylon-string guitar.',
    why: 'Charlie Byrd, who brought bossa nova records home from a tour of Brazil and made Jazz Samba with Getz, played an unamplified nylon-string guitar with classical technique. In chord melody the tune is the top note and the chords sit under it, so the guitar is the whole band. It teaches you where the melody note is in every chord shape.',
    backing: { groove: 'bossa', bars: ['Dm9', 'Dm9', 'Em7b5', 'A7b9'] },
    tempo: [80, 120],
    steps: [
      'Play with the fingers: the thumb for the bass, i m a for the chord and the top note.',
      'The melody note is a little louder than the others.',
      'Dm9 (here without its 3rd): x x 0 2 1 0. A7♭9: x 0 5 3 2 x.',
      'Em7♭5: E B♭ D G on the 4th to 1st strings, at the 2nd, 3rd, 3rd and 3rd frets (x x 2 3 3 3).'
    ],
    variations: [
      { name: 'Melody alone', how: 'E, F, E, D; then G, F, E, C♯ to D.', bars: P('64:q 65:q 64:h | 62:w | 67:q 65:q 64:h | 61#:h. r:q'), time: '4/4', key: 'Dm' },
      { name: 'With the chords', how: 'Each melody note on top of its chord.', bars: P(`${DM9}:q 50+57+60+65:q ${DM9}:h | 50+57+62:w | 52+58+62+67:q 52+58+62+65:q 52+58+62+64:h | ${A7B9}#:h. r:q`), time: '4/4', key: 'Dm' },
      { name: 'In the bossa rhythm', how: 'Play the chord melody with the batida: thumb on 1 and 3, the chord on the syncopated hits.' },
      { name: 'Your own melody', how: 'Over the same four chords, choose one top note per half bar and find the chord under it.' }
    ],
    listen: { artist: 'Stan Getz and Charlie Byrd', work: 'Jazz Samba' }
  },
  {
    id: 'brazil-getz-legato',
    style: 'brazil',
    players: ['getz'],
    name: 'Getz: cool, legato eighths',
    focus: 'technique',
    level: 2,
    minutes: 8,
    goal: 'Play long lines of eighths over a ii–V–I with slurs, a light swing and a soft, even tone, as the cool school did.',
    why: 'Before bossa nova, Getz was a star of cool jazz: in 1948, with Woody Herman’s band, his solo on “Early Autumn” made his name. His eighths were light, smooth and lightly swung, with no hard accents. On guitar that means hammer-ons and pull-offs inside each beat, a soft pick attack and steady time.',
    backing: { groove: 'swing', bars: ['Dm7', 'G7', 'Cmaj7', 'Cmaj7'] },
    tempo: [100, 200],
    steps: [
      'Pick the first note of each beat and slur the second (hammer-on going up, pull-off going down).',
      'Keep every note the same volume.',
      'Swing lightly: just a little longer on the beat than off it.',
      'End each line on a long note, the 3rd or 5th of the chord.'
    ],
    variations: [
      { name: 'Down the ii–V', how: 'A line down through Dm7 and G7 to E.', bars: P('77:8 76:8 74:8 72:8 69:8 67:8 65:8 64:8 | 65:8 67:8 69:8 71:8 74:8 72:8 71:8 69:8 | 67:h 64:h | r:w'), time: '4/4', key: 'C' },
      { name: 'Up and over', how: 'Rising arpeggios, falling scale.', bars: P('62:8 65:8 69:8 72:8 74:8 72:8 69:8 67:8 | 67:8 71:8 74:8 77:8 76:8 74:8 72:8 71:8 | 72:w | r:w'), time: '4/4', key: 'C' },
      { name: 'With a chromatic step', how: 'The first variation with E♭ added between E and D in bar 1, the line one eighth later.' },
      { name: 'Four bars, no breath', how: 'Make one unbroken line of eighths through all four bars, then end on G.' }
    ],
    listen: { artist: 'Stan Getz', work: 'Focus' }
  },

  /* ---------------- Umm Kulthum ---------------- */
  {
    id: 'arabic-kulthum-taqsim',
    style: 'arabic',
    players: ['kulthum'],
    name: 'Umm Kulthum: a taqsim before the song',
    focus: 'ear',
    level: 3,
    minutes: 10,
    goal: 'Improvise a free, unmetered introduction in maqam Kurd on D that shows its notes from the bottom up and ends on the tonic.',
    why: 'Before Umm Kulthum sang, an instrumentalist, often on oud, qanun or violin, would play a taqsim: a solo improvisation with no beat that presents the maqam, its lower notes first, its resting places, then its higher notes, before coming home. It sets the mood for the whole song. A good taqsim is unhurried and full of silences.',
    backing: { groove: 'drone', bars: ['Dm'] },
    tempo: [50, 80],
    steps: [
      'Kurd on D: D E♭ F G A B♭ C D. The first four notes (D E♭ F G) are the lower jins, the heart of the maqam.',
      'Stay in the lower jins for a while. Then move up to A and rest there.',
      'Visit the higher notes, then come back down slowly to D.',
      'No beat: each phrase is as long as a breath, and silences are part of it.'
    ],
    variations: [
      { name: 'The lower jins', how: 'Phrases around D E♭ F G only, each ending on D or F.', bars: P('62:q 63b:q 65:h | 63b:q 62:h. | 67:q 65:8 63b:8 62:h | r:w'), time: '4/4', key: 'Gm' },
      { name: 'Rest on A', how: 'Climb to A and hold it; it is the maqam’s second home.', bars: P('62:8 63b:8 65:8 67:8 69:h | 70b:q 69:h. | 67:8 65:8 63b:8 65:8 62:h'), time: '4/4', key: 'Gm' },
      { name: 'The whole taqsim', how: 'Lower jins, then A, then the high D, then back down to D. Two minutes, no beat.' },
      { name: 'Into the song', how: 'End the taqsim on D, then play the lazima from the drill “Umm Kulthum: the lazima” in time with the maqsum.' }
    ],
    listen: { artist: 'Umm Kulthum', work: 'Fakarouni' }
  },
  {
    id: 'arabic-kulthum-rast',
    style: 'arabic',
    players: ['kulthum'],
    name: 'Umm Kulthum: maqam Rast and its neutral third',
    focus: 'ear',
    level: 3,
    minutes: 10,
    goal: 'Play maqam Rast on C on the guitar, bending E♭ up a quarter tone to its neutral third, and hear it as neither major nor minor.',
    why: 'Rast is the foundation of the maqam system, and many classic Egyptian songs are in it. Its third and seventh lie between major and minor, a quarter tone below E and B. A fretted guitar has no such note, so you bend E♭ up by a quarter tone. Hearing that note in tune is the key to the sound of Umm Kulthum’s Cairo.',
    backing: { groove: 'drone', bars: ['C'] },
    tempo: [50, 90],
    steps: [
      'Rast on C: C D E-half-flat F G A B-half-flat C.',
      'On guitar: fret E♭ and bend it up a little, about a quarter of a fret’s worth. Do the same with B♭ for the seventh.',
      'Play E natural, then E♭, then the bent note between them. Sing the one between.',
      'On the way down, the seventh often becomes a plain B♭.'
    ],
    variations: [
      { name: 'The lower jins', how: 'C D E♭ (bent up a quarter) F, and back. The bent note is marked E♭.', bars: P('60:q 62:q 63b:q 65:q | 63b:q 62:q 60:h'), time: '4/4', key: 'C' },
      { name: 'Up to the octave', how: 'The whole scale with both bent notes, and down with B♭ plain.', bars: P('60:8 62:8 63b:8 65:8 67:8 69:8 70b:8 72:8 | 72:8 70b:8 69:8 67:8 65:8 63b:8 62:8 60:8 | 60:w'), time: '4/4', key: 'C' },
      { name: 'Three thirds', how: 'Play E, E♭, and the bent note against the drone in turn. Only the bent one is Rast.' },
      { name: 'A phrase', how: 'Make a short phrase in Rast that rests on G, then on C. Bend in tune every time.' }
    ],
    listen: { artist: 'Umm Kulthum', work: 'Al Atlal' }
  }
];
