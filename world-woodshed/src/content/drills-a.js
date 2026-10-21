/* World Woodshed — style drills: Cuba, Brazil, flamenco, Hindustani, Carnatic, Arab world, Turkey & the Balkans,
   West Africa, Central & East Africa, gypsy jazz, jazz, Latin America.
   Phrases are written in a short form and expanded below: 'midi:dur' tokens, '.' after the duration for a dot,
   'r' for a rest, '|' between bars. Pitches are sounding MIDI (guitar range 40–88). */

const P = s => s.trim().split('|').map(bar => bar.trim().split(/\s+/).map(tok => {
  const [m, d0] = tok.split(':');
  const dot = d0.endsWith('.');
  const n = { m: m === 'r' ? null : Number(m), d: dot ? d0.slice(0, -1) : d0 };
  if (dot) n.dot = true;
  return n;
}));

export default [
  /* ====================== CUBA ====================== */
  {
    id: 'cuba-tumbao-clave',
    style: 'cuba',
    name: 'Tumbao bass against son clave',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Play the anticipated son bass (the tumbao) on the low strings while the clave keeps its own place.',
    why: 'The tumbao skips beat 1 and lands early on the next chord, which is what makes son lean forward. Rotating the note choice while the rhythm stays fixed builds a flexible skill rather than one memorised motion.',
    backing: { rhythm: 'son32' },
    tempo: [70, 110],
    steps: [
      'One round of the backing is one whole clave: the 3-side, then the 2-side. The notation writes each side as a short bar, so every written bar is one bar of the son.',
      'Clap the clave once through with the backing before you play.',
      'Play only the last bass note of each bar first, with the thumb, and hear how it pulls into the next bar.',
      'Add the earlier note so you have two notes per bar and nothing on the downbeat.',
      'Keep your foot on the quarter-note pulse; the downbeat you skip should still be felt.'
    ],
    variations: [
      {
        name: 'Anticipation only',
        how: 'One note per bar, on beat 4 of each son bar (where the ponche falls on the 3-side). Each note is the root of the chord that comes next: F, G, F, C over a C–F–G–F loop.',
        bars: P('r:q. 41:8 | r:q. 43:8 | r:q. 41:8 | r:q. 48:8'),
        time: '2/4', key: 'C',
        positions: [[6, 1], [6, 3], [5, 3]]
      },
      {
        name: 'Fifth, then anticipation',
        how: 'Two notes per bar: the fifth of the current chord, then the root of the next chord. Leave the downbeat empty every time.',
        bars: P('r:8. 43:8. 41:8 | r:8. 48:8. 43:8 | r:8. 50:8. 41:8 | r:8. 48:8. 48:8'),
        time: '2/4', key: 'C'
      },
      {
        name: 'Root, then anticipation',
        how: 'Same rhythm, but the first note is the root of the current chord. Listen for how much heavier it sounds than the fifth.',
        bars: P('r:8. 48:8. 41:8 | r:8. 41:8. 43:8 | r:8. 43:8. 41:8 | r:8. 41:8. 48:8'),
        time: '2/4', key: 'C'
      },
      {
        name: 'Thumb tumbao, fingers on the 2-side',
        how: 'Keep the tumbao in the thumb and pluck a short C or F chord on the top three strings exactly with the two strokes of the 2-side of the clave.'
      }
    ],
    listen: { artist: 'Israel “Cachao” López', work: 'Master Sessions Vol. 1' }
  },
  {
    id: 'cuba-tres-guajeo',
    style: 'cuba',
    name: 'Tres-style guajeo in octaves',
    focus: 'technique',
    level: 2,
    minutes: 10,
    goal: 'Play a syncopated guajeo in octaves on strings 1 and 3 that sits on the 3-2 clave.',
    why: 'The tres doubles its lines in octaves, and a guajeo only works if its accents agree with the clave. Changing texture and alignment one at a time trains both the hand and the ear for clave direction.',
    backing: { groove: 'son', bars: ['C F', 'G7 F'] },
    tempo: [70, 105],
    steps: [
      'This is a model guajeo written for practice, built the way tres parts are built: short, repeated, and locked to the clave.',
      'Each written bar is one bar of the son; one round of the backing covers two written bars (C then F).',
      'Learn the top line alone on string 1, then add the octave below on string 3 (three frets lower), muting string 2 with the side of the finger.',
      'Use down-up alternate picking; the rests are where the pick still moves but misses the strings.',
      'Play the guajeo for a full minute without changing anything before you move on.'
    ],
    variations: [
      {
        name: 'Top line only',
        how: 'Single notes on string 1. Check that bar 1 hits the three strokes of the 3-side and bar 2 hits both strokes of the 2-side.',
        bars: P('72:16 r:16 76:16 72:16 r:16 76:16 72:8 | r:16 69:16 72:16 r:16 69:16 70:16 69:8 | 71:16 r:16 74:16 71:16 r:16 74:16 71:8 | r:16 72:16 69:16 r:16 72:16 69:16 67:8'),
        time: '2/4', key: 'C'
      },
      {
        name: 'In octaves',
        how: 'Same line, each note doubled an octave lower on string 3, three frets back. The marks show the C and E octave pairs.',
        bars: P('72:16 r:16 76:16 72:16 r:16 76:16 72:8 | r:16 69:16 72:16 r:16 69:16 70:16 69:8 | 71:16 r:16 74:16 71:16 r:16 74:16 71:8 | r:16 72:16 69:16 r:16 72:16 69:16 67:8'),
        time: '2/4', key: 'C',
        positions: [[1, 8], [3, 5], [1, 12], [3, 9]]
      },
      {
        name: 'In thirds',
        how: 'Keep the rhythm, but harmonise each top note with the chord tone a third below on string 2, the way a second tres or a piano montuno often does.'
      },
      {
        name: 'Crossed on purpose',
        how: 'For one round, start the line from its second bar so the 2-side figure falls on the 3-side. Hear the clash (the part is “cruzado”), then put it back.'
      }
    ],
    listen: { artist: 'Buena Vista Social Club', work: 'El Cuarto de Tula' }
  },
  {
    id: 'cuba-coro-pregon',
    style: 'cuba',
    name: 'Coro and pregón trade',
    focus: 'ear',
    level: 2,
    minutes: 8,
    goal: 'Learn a short coro by ear and answer it with your own improvised pregón that fits the clave.',
    why: 'The montuno section of son is a call and response between a fixed coro and an improvised pregón. Learning the coro by ear and answering it under constraints is retrieval and variable practice in one.',
    backing: { groove: 'son', bars: ['C F', 'G7 F'] },
    tempo: [70, 100],
    steps: [
      'Set “Change variation every” to never while you learn the coro, then let it rotate.',
      'Press Hear the phrase without looking at the staff. Sing it back twice.',
      'Find it on the guitar by ear, then check against the notation.',
      'Trade: play the coro for two rounds, improvise for two rounds, repeat.',
      'Keep your answer short. A good pregón leaves space before the coro comes back.'
    ],
    variations: [
      {
        name: 'Learn the coro',
        how: 'A model coro over C–F–G7–F, two rounds long. Sing it, then play it on strings 1 and 2.',
        bars: P('76:8 76:16 74:16 72:8 r:8 | 69:8. 72:16 r:q | 74:8 74:16 72:16 71:8 r:8 | 69:8 67:8 r:q'),
        time: '2/4', key: 'C'
      },
      {
        name: 'Answer with two notes',
        how: 'Improvise the pregón using only C and E. All the interest has to come from rhythm and where you start.'
      },
      {
        name: 'Answer in the coro’s rhythm',
        how: 'Keep the coro’s rhythm exactly but choose new chord tones for each chord.'
      },
      {
        name: 'Start on the second clave stroke',
        how: 'Begin every answer on the second stroke of the 3-side, never on the downbeat, and end before the coro returns.'
      }
    ],
    listen: { artist: 'Septeto Nacional de Ignacio Piñeiro', work: 'Échale salsita' }
  },
  {
    id: 'cuba-anticipated-changes',
    style: 'cuba',
    name: 'Anticipated chord changes in a minor montuno',
    focus: 'harmony',
    level: 3,
    minutes: 10,
    goal: 'Move to each new chord an eighth note before the bar line, the way son guitar, bass and piano do.',
    why: 'In son the harmony changes early: the new chord arrives on the last eighth of the old bar and is held over the downbeat. The backing changes on the beat, so you hear exactly how early you are.',
    backing: { groove: 'son', bars: ['Dm F', 'Gm A7'] },
    tempo: [70, 105],
    steps: [
      'Learn the four triads on the top three strings shown in the variations; they sit within two frets of each other.',
      'Play one short chord on each beat with the backing, changing on the downbeat.',
      'Then move each change to the last eighth of the bar before, and let that chord ring over the downbeat.',
      'Keep the right hand moving in eighths even when you do not strike, so the anticipation falls in time.'
    ],
    variations: [
      {
        name: 'On the beat (reference)',
        how: 'Change exactly with the backing on each downbeat. The marks show Dm on the top strings.',
        positions: [[3, 7], [2, 6], [1, 5]]
      },
      {
        name: 'Every change early',
        how: 'Strike each new chord on the “and” of 4 of the bar before and do not strike the downbeat. The marks show F (C–F–A).',
        positions: [[3, 5], [2, 6], [1, 5]]
      },
      {
        name: 'Early into the 3-side only',
        how: 'Anticipate only the changes into Dm and Gm (the starts of the 3-side); land on F and A7 on the beat. The marks show Gm.',
        positions: [[3, 7], [2, 8], [1, 6]]
      },
      {
        name: 'Anticipation with a strum pattern',
        how: 'Muted down-up eighths, accents on the “and” of 2 and on 4, and the chord change on the “and” of 4. The marks show A7 (C♯–G–A).',
        positions: [[3, 6], [2, 8], [1, 5]]
      }
    ],
    listen: { artist: 'Buena Vista Social Club', work: 'Chan Chan' }
  },

  /* ====================== BRAZIL ====================== */
  {
    id: 'brazil-bossa-voice-leading',
    style: 'brazil',
    name: 'Bossa nova voicings with a moving top note',
    focus: 'harmony',
    level: 2,
    minutes: 10,
    goal: 'Comp a ii–V–I–VI in C with four-note voicings whose top note moves by step, thumb on the bass.',
    why: 'Bossa guitar moves one voice at a time while the rest hold still. Building from shells to full voicings to a planned top line is whole–part practice for a skill that is about listening to the inner voices.',
    backing: { groove: 'bossa', bars: ['Dm9', 'G13', 'Cmaj9', 'A7b9'] },
    tempo: [70, 130],
    steps: [
      'Learn the four shapes slowly without the backing, saying each top note as you play it.',
      'Thumb on the bass string, fingers (i-m-a) on the three upper strings together.',
      'Play the chords on the bossa pattern with the backing; the thumb stays steady while the fingers syncopate.',
      'Listen to the top note as a melody: E, E, D, C♯.'
    ],
    variations: [
      {
        name: 'Shells first',
        how: 'Root, 3rd and 7th only: thumb on the root, two fingers on the 3rd and 7th. The marks show the Dm7 shell (D–F–C).',
        positions: [[5, 5], [4, 3], [3, 5]]
      },
      {
        name: 'Add the colour tone on top',
        how: 'Full voicings: Dm9 (x-5-3-5-5-x), G13 (3-x-3-4-5-x), Cmaj9 (x-3-2-4-3-x), A7♭9 (x-0-5-3-2-x). The marks show G13.',
        positions: [[6, 3], [4, 3], [3, 4], [2, 5]]
      },
      {
        name: 'Hear the top line',
        how: 'Play the voicings and sing or hum only the top note. The staff shows that line.',
        bars: P('64:w | 64:w | 62:w | 61:w'),
        time: '4/4', key: 'C'
      },
      {
        name: 'Anticipate the change',
        how: 'Play the last finger stroke of each bar as the next chord, so the harmony arrives a sixteenth early while the thumb stays on the old root until the bar line.'
      }
    ],
    listen: { artist: 'João Gilberto', work: 'Chega de Saudade (1959)' }
  },
  {
    id: 'brazil-samba-hands',
    style: 'brazil',
    name: 'Samba guitar: thumb surdo, finger syncopation',
    focus: 'rhythm',
    level: 2,
    minutes: 8,
    goal: 'Keep a samba bass in the thumb with the weight on beat 2 while the fingers place chords on different sixteenths.',
    why: 'Samba guitar is two parts in one hand: the thumb plays the surdo and the fingers play the tamborim-like syncopation. Moving the finger part while the thumb stays fixed builds independence.',
    backing: { rhythm: 'samba' },
    tempo: [70, 100],
    steps: [
      'The backing is two bars of 2/4: the surdo hits hard on beat 2 of each bar. Count “1 e & a 2 e & a”.',
      'Hold Am7 at the 5th fret (5-x-5-5-5-x) for the whole drill.',
      'Thumb on the beats, alternating root (string 6) and fifth (string 5), softer on 1 and heavier on 2.',
      'Add the finger part from each variation without letting the thumb speed up or drift.'
    ],
    variations: [
      {
        name: 'Thumb alone',
        how: 'Root on 1, fifth on 2, heavier on 2, matching the surdo.',
        positions: [[6, 5], [4, 5], [3, 5], [2, 5]]
      },
      {
        name: 'Fingers on every “a”',
        how: 'Pluck the chord with i-m-a on the last sixteenth of each beat, just before the thumb.'
      },
      {
        name: 'Fingers on “e” and “a”',
        how: 'Two finger strokes per beat, on the second and fourth sixteenths, so the fingers never land with the thumb.'
      },
      {
        name: 'The bossa figure',
        how: 'Fingers on sixteenths 1, 4, 7, 11 and 14 of the two bars: the samba-derived figure that João Gilberto made the bossa nova beat.'
      }
    ],
    listen: { artist: 'Cartola', work: 'O Mundo é um Moinho' }
  },
  {
    id: 'brazil-choro-arpeggios',
    style: 'brazil',
    name: 'Choro arpeggio line through a passing diminished',
    focus: 'melody',
    level: 3,
    minutes: 10,
    goal: 'Run sixteenth-note arpeggios through G–G♯dim7–Am7–D7 with chromatic approach notes, the way choro melodies move.',
    why: 'Choro lines are arpeggios with chromatic approaches, and the diminished chord between I and ii is one of its signature moves. Changing direction and adding approaches one step at a time keeps the line flexible instead of memorised.',
    backing: { click: { beats: 2, sub: 2 } },
    tempo: [60, 100],
    steps: [
      'Learn the plain arpeggios first at a tempo where every note is even.',
      'Alternate picking (or i-m rest strokes) with no accent except where you choose one.',
      'Hear the bass climbing G–G♯–A under the line, then D7 pulling back to G.',
      'Raise the tempo only when the whole four bars are clean twice in a row.'
    ],
    variations: [
      {
        name: 'Plain arpeggios',
        how: 'Chord tones only, up and back down in each bar.',
        bars: P('62:16 67:16 71:16 74:16 71:16 67:16 62:16 59:16 | 56:16 59:16 62:16 65:16 68:16 65:16 62:16 59:16 | 57:16 60:16 64:16 67:16 69:16 67:16 64:16 60:16 | 62:16 66:16 69:16 72:16 69:16 66:16 62:8'),
        time: '2/4', key: 'G'
      },
      {
        name: 'Chromatic approach on each beat',
        how: 'Each beat starts a half step below its first chord tone.',
        bars: P('61:16 62:16 67:16 71:16 73:16 74:16 71:16 67:16 | 55:16 56:16 59:16 62:16 64:16 65:16 62:16 59:16 | 56:16 57:16 60:16 64:16 66:16 67:16 64:16 60:16 | 61:16 62:16 66:16 69:16 72:16 69:16 66:8'),
        time: '2/4', key: 'G'
      },
      {
        name: 'Descending first',
        how: 'Same chords, each arpeggio starts at the top and turns around at the bottom.',
        bars: P('74:16 71:16 67:16 62:16 59:16 62:16 67:16 71:16 | 71:16 68:16 65:16 62:16 59:16 62:16 65:16 68:16 | 72:16 69:16 67:16 64:16 60:16 64:16 67:16 69:16 | 72:16 69:16 66:16 62:16 60:16 62:16 66:8'),
        time: '2/4', key: 'G'
      },
      {
        name: 'Add a baixaria',
        how: 'After the four bars, answer with a 7-string-style bass run on strings 5 and 6 (D–C–B–A–G in sixteenths) into the top of the line.'
      }
    ],
    listen: { artist: 'Jacob do Bandolim', work: 'Noites Cariocas' }
  },
  {
    id: 'brazil-baiao-lydian-dominant',
    style: 'brazil',
    name: 'Baião phrases in Lydian dominant',
    focus: 'melody',
    level: 2,
    minutes: 8,
    goal: 'Play and vary short northeastern phrases over D7 that lean on the ♯4 (G♯) and the ♭7 (C).',
    why: 'The raised 4th and lowered 7th are the colour of baião and forró melody. Moving the same phrase between octaves and then answering it yourself turns a scale into vocabulary.',
    backing: { groove: 'drone', bars: ['D7'] },
    tempo: [70, 110],
    steps: [
      'Play D Lydian dominant once up and down: D E F♯ G♯ A B C D.',
      'Learn the first phrase and sing it; notice the G♯ resolving to A.',
      'Play each phrase twice in a row, then rest for one round.',
      'Keep the eighths straight and bright; the music is in 2.'
    ],
    variations: [
      {
        name: 'The ♯4 phrase',
        how: 'Circles A with its lower neighbour G♯, then descends to D.',
        bars: P('69:8 68:16 69:16 71:8 72:8 | 71:8 69:8 68:8 66:8 | 64:8 66:8 68:8 69:8 | 66:16 64:16 62:8 62:q'),
        time: '2/4', key: 'D'
      },
      {
        name: 'Down an octave',
        how: 'The same phrase on the low strings with the thumb, the way an accordion bass line answers.',
        bars: P('57:8 56:16 57:16 59:8 60:8 | 59:8 57:8 56:8 54:8 | 52:8 54:8 56:8 57:8 | 54:16 52:16 50:8 50:q'),
        time: '2/4', key: 'D'
      },
      {
        name: 'The ♭7 phrase',
        how: 'Starts on C, the ♭7, and comes down through G♯ to D.',
        bars: P('72:8 74:8 72:8 69:8 | 68:8 69:16 68:16 66:q | 64:8 62:8 64:8 66:8 | 62:q r:q'),
        time: '2/4', key: 'D'
      },
      {
        name: 'Your answer',
        how: 'Play one written phrase, then improvise two bars that use both G♯ and C and end on D or A.'
      }
    ],
    listen: { artist: 'Luiz Gonzaga', work: 'Baião' }
  },

  /* ====================== FLAMENCO ====================== */
  {
    id: 'flamenco-solea-compas',
    style: 'flamenco',
    name: 'Soleá compás on E and F',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Play a basic soleá compás por arriba, E and F, with the accents on 3, 6, 8, 10 and 12.',
    why: 'Compás is the first thing a flamenco teacher checks. Keeping the chords fixed while the right hand changes lets you build the accents into the body before adding technique.',
    backing: { rhythm: 'solea' },
    tempo: [90, 160],
    steps: [
      'Count 1 to 12 out loud with the backing before you play.',
      'One common basic pattern: E from 1 to 7, F on 8 and 9, back to E on 10 to 12.',
      'Play F as x-3-3-2-1-0, letting the open top string ring.',
      'Strike on every count but make the accented counts clearly louder.',
      'Keep counting out loud for the whole drill.'
    ],
    variations: [
      {
        name: 'Strokes on the accents',
        how: 'One index downstroke on 3, 6, 8, 10 and 12; light thumb strokes on the other counts.',
        positions: [[6, 0], [5, 2], [4, 2], [3, 1], [2, 0], [1, 0]]
      },
      {
        name: 'Rasgueado on 3 and 6',
        how: 'Replace the strokes on 3 and 6 with an e-a-m-i roll that finishes exactly on the count.'
      },
      {
        name: 'Close on 10',
        how: 'A full rasgueado on 10, then damp the strings with the left hand: silence on 11, a light stroke on 12.'
      },
      {
        name: 'Add golpe',
        how: 'Tap the golpeador with the ring finger together with the strum on each accent.'
      }
    ],
    listen: { artist: 'Paco de Lucía', work: 'Gloria al Niño Ricardo (Almoraima, 1976)' }
  },
  {
    id: 'flamenco-picado-runs',
    style: 'flamenco',
    name: 'Picado runs that land on E',
    focus: 'technique',
    level: 2,
    minutes: 10,
    goal: 'Play i-m rest-stroke runs in A minor / E Phrygian dominant that land on E at the end of the cadence.',
    why: 'A picado run is only useful if it lands on time on the chord. Changing the grouping and direction while the target stays the same is variable practice for the hand and the ear.',
    backing: { groove: 'flamenco', bars: ['Am', 'G', 'F', 'E'] },
    tempo: [70, 120],
    steps: [
      'Alternate i and m with rest strokes; the finger comes to rest on the next string.',
      'Practise each variation without the backing first at half tempo.',
      'Plant the thumb on string 6 for stability on the higher runs.',
      'The last note must arrive on beat 1 or 3 of the E bar; land it, then stop.'
    ],
    variations: [
      {
        name: 'Eighths down the cadence',
        how: 'One octave per bar, stepping down through Am, G and F, then G♯–A–G♯–F–E over the E chord.',
        bars: P('69:8 67:8 65:8 64:8 62:8 60:8 59:8 57:8 | 67:8 65:8 64:8 62:8 60:8 59:8 57:8 55:8 | 65:8 64:8 62:8 60:8 59:8 57:8 55:8 53:8 | 56:8 57:8 56:8 53:8 52:h'),
        time: '4/4', key: 'Am'
      },
      {
        name: 'Descending fours',
        how: 'Sixteenths in four-note cells, each cell starting a step lower. Play it over the F and E bars.',
        bars: P('69:16 67:16 65:16 64:16 67:16 65:16 64:16 62:16 65:16 64:16 62:16 60:16 64:16 62:16 60:16 59:16 | 62:16 60:16 59:16 57:16 60:16 59:16 57:16 56:16 59:16 57:16 56:16 53:16 52:q'),
        time: '4/4', key: 'Am'
      },
      {
        name: 'Ascending fours',
        how: 'The same idea going up from low E, ending on E on the top string.',
        bars: P('52:16 53:16 56:16 57:16 53:16 56:16 57:16 59:16 56:16 57:16 59:16 60:16 57:16 59:16 60:16 62:16 | 59:16 60:16 62:16 64:16 60:16 62:16 64:16 65:16 62:16 64:16 65:16 67:16 64:q'),
        time: '4/4', key: 'Am'
      },
      {
        name: 'Accent every third note',
        how: 'Play the descending fours but accent every third note, so the accents cut across the groups of four.'
      }
    ],
    listen: { artist: 'Paco de Lucía', work: 'Entre dos aguas' }
  },
  {
    id: 'flamenco-por-medio-voicings',
    style: 'flamenco',
    name: 'Por medio cadence with a falling top voice',
    focus: 'harmony',
    level: 2,
    minutes: 8,
    goal: 'Play Dm–C–B♭–A in several textures, including parallel triads whose top note falls A–G–F–E.',
    why: 'The Andalusian cadence por medio is the home of bulerías, soleá por medio and many falsetas. Playing the same four chords in different textures builds a flexible map of the neck rather than one shape set.',
    backing: { groove: 'flamenco', bars: ['Dm', 'C', 'Bb', 'A'] },
    tempo: [80, 130],
    steps: [
      'Play the four chords once each in open position and say the bass notes: D, C, B♭, A.',
      'Each variation changes only the texture; the chords stay the same.',
      'End each pass on A and let it ring to the end of the bar.'
    ],
    variations: [
      {
        name: 'Thumb bass and strum',
        how: 'Thumb on the bass note on beat 1, index strums on the accents of the groove.'
      },
      {
        name: 'Parallel triads, top strings',
        how: 'Dm (strings 3-2-1 at 7-6-5), C (5-5-3), B♭ (3-3-1), A (2-2-0). The top note falls A–G–F–E.',
        bars: P('69:w | 67:w | 65:w | 64:w'),
        time: '4/4', key: 'Dm',
        positions: [[3, 7], [2, 6], [1, 5]]
      },
      {
        name: 'Arpeggio p-i-m-i',
        how: 'Thumb on the bass, then i-m-i on strings 3-2-3 in eighths, two groups per bar.'
      },
      {
        name: 'Rasgueado on the change',
        how: 'A four-finger rasgueado on the first beat of each new chord, single strokes in between.'
      }
    ]
  },
  {
    id: 'flamenco-bulerias-cierre',
    style: 'flamenco',
    name: 'Bulerías compás and cierre on 10',
    focus: 'rhythm',
    level: 3,
    minutes: 10,
    goal: 'Hold a fast bulerías compás por medio counted from 12, closing on 10 with silence on 11.',
    why: 'Bulerías is soleá’s cycle at speed, counted from 12, and the cierre on 10 is how players and dancers mark the end of a phrase. Varying what you leave out trains the cycle, not just the strokes.',
    backing: { rhythm: 'solea' },
    tempo: [160, 240],
    steps: [
      'Count “12, 1, 2, 3 … 11” with the backing. The cycle starts on 12.',
      'One common basic compás por medio: A on 12 through 6, B♭ on 7 and 8, A on 9 and 10, silence on 11.',
      'Accent 12, 3, 6, 8 and 10.',
      'Start at the low tempo; bulerías needs to feel relaxed before it can be fast.'
    ],
    variations: [
      {
        name: 'Basic compás',
        how: 'A strum on every count from 12 to 10, accents on 12, 3, 6, 8 and 10; damp on 11.'
      },
      {
        name: 'Accents only',
        how: 'Strike only 12, 3, 6, 8 and 10. Count the gaps out loud.'
      },
      {
        name: 'Cierre',
        how: 'A sharp rasgueado on 10, then both hands damp the strings so 11 is truly silent.'
      },
      {
        name: 'Contratiempo',
        how: 'From 1 to 6 strum only between the counts, like off-beat palmas, then return to the accents on 8 and 10.'
      }
    ],
    listen: { artist: 'Paco de Lucía', work: 'Almoraima' }
  },

  /* ====================== HINDUSTANI ====================== */
  {
    id: 'hindustani-bhupali-chalan',
    style: 'hindustani',
    name: 'Raga Bhupali phrases over the drone',
    focus: 'melody',
    level: 1,
    minutes: 10,
    goal: 'Play the characteristic phrases of Bhupali (S R G P D) with each note settled against Sa.',
    why: 'A raga is its phrases, not its scale. Learning a few movements in different registers, slowly, against the drone trains the ear to hear each note as a relation to Sa.',
    backing: { groove: 'drone', bars: ['C'] },
    tempo: [50, 80],
    steps: [
      'Sa is C. Bhupali uses S R G P D (C D E G A) and leaves out Ma and Ni.',
      'Hold each long note until it stops beating against the drone.',
      'Slide between notes on one string where you can, rather than changing strings.',
      'Sing the sargam names as you play: Sa Re Ga Pa Dha.'
    ],
    variations: [
      {
        name: 'Aroha and avaroha',
        how: 'Ascent S R G P D Ṡ and descent Ṡ D P G R S, each note a beat.',
        bars: P('60:q 62:q 64:q 67:q | 69:q 72:h. | 72:q 69:q 67:q 64:q | 62:q 60:h.'),
        time: '4/4', key: 'C'
      },
      {
        name: 'G R S, D̤ S',
        how: 'Ga to Re, down to Sa, dip to lower Dha and back. Slide from Re to Sa.',
        bars: P('64:h 62:q 60:q | 57:q 60:h.'),
        time: '4/4', key: 'C'
      },
      {
        name: 'G P D Ṡ and back',
        how: 'Climb to upper Sa through Pa and Dha, then come back down to Re and Sa.',
        bars: P('64:q 67:q 69:q 72:q | 72:h 69:8 67:8 64:q | 62:q 64:q 62:q 60:q | 60:w'),
        time: '4/4', key: 'C'
      },
      {
        name: 'Lower octave',
        how: 'Start from lower Pa and Dha and rise to Ga, then settle on Sa.',
        bars: P('55:q 57:q 60:h | 62:q 64:q 62:q 60:q | 57:h 60:h | 60:w'),
        time: '4/4', key: 'C'
      }
    ],
    listen: { artist: 'Kishori Amonkar', work: 'Sahela Re (Raga Bhoop)' }
  },
  {
    id: 'hindustani-tihai-teental',
    style: 'hindustani',
    name: 'Tihais that land on sam',
    focus: 'rhythm',
    level: 2,
    minutes: 10,
    goal: 'Start a three-times-repeated phrase at the right beat of teental so its last note lands on sam.',
    why: 'A tihai is how Hindustani musicians end a passage on sam. Working out the start point for different phrase and gap lengths trains the arithmetic and the feel of the cycle together.',
    backing: { rhythm: 'teental' },
    tempo: [60, 120],
    steps: [
      'Clap teental with the backing: claps on 1, 5 and 13, a wave on 9 (khali).',
      'Rule: phrase length P, gap G. The tihai takes 3P + 2G beats, so it starts on beat 18 − (3P + 2G).',
      'The notes come from Yaman (C D E F♯ G A B). Every phrase ends on Sa.',
      'The written notation is five bars: the fifth bar is sam of the next cycle.',
      'Say the beat numbers while you play; land the last Sa with a clear accent.'
    ],
    variations: [
      {
        name: 'P 3, gap 1: start on 7',
        how: 'Ga Re Sa, rest, three times. Start on beat 7.',
        bars: P('r:w | r:q r:q 64:q 62:q | 60:q r:q 64:q 62:q | 60:q r:q 64:q 62:q | 60:q r:q r:h'),
        time: '4/4', key: 'C'
      },
      {
        name: 'P 5, no gap: start on 3',
        how: 'Ni Re Ga Re Sa, three times without a break. Start on beat 3.',
        bars: P('r:h 59:q 62:q | 64:q 62:q 60:q 59:q | 62:q 64:q 62:q 60:q | 59:q 62:q 64:q 62:q | 60:q r:q r:h'),
        time: '4/4', key: 'C'
      },
      {
        name: 'P 4, gap 2: start on 2',
        how: 'Ma♯ Ga Re Sa, two beats rest, three times. Start on beat 2.',
        bars: P('r:q 66:q 64:q 62:q | 60:q r:q r:q 66:q | 64:q 62:q 60:q r:q | r:q 66:q 64:q 62:q | 60:q r:q r:h'),
        time: '4/4', key: 'C'
      },
      {
        name: 'Dugun: P 5 at double speed',
        how: 'Ni Re Ga Re Sa in eighths, three times. At double speed the tihai is 7½ beats long, so it starts on beat 10.',
        bars: P('r:w | r:w | r:q 59:8 62:8 64:8 62:8 60:8 59:8 | 62:8 64:8 62:8 60:8 59:8 62:8 64:8 62:8 | 60:q r:q r:h'),
        time: '4/4', key: 'C'
      }
    ]
  },
  {
    id: 'hindustani-bhairav-andolan',
    style: 'hindustani',
    name: 'Bhairav: andolan on komal Re and Dha',
    focus: 'technique',
    level: 3,
    minutes: 10,
    goal: 'Play Bhairav’s komal Re and komal Dha with a slow, narrow andolan that never reaches the next fret.',
    why: 'In Bhairav the flat 2nd and flat 6th are not plain notes: they sway slowly. Isolating the ornament on each note before putting it back in a phrase is part–whole practice for a fine motor skill.',
    backing: { groove: 'drone', bars: ['C'] },
    tempo: [40, 70],
    steps: [
      'Sa is C. Bhairav: C D♭ E F G A♭ B.',
      'Andolan on guitar: push the string slightly and release, slower than vibrato, about one sway per beat, staying below the next semitone.',
      'Tune by ear: the swaying note should keep sounding like komal Re or komal Dha, never like the note above.',
      'Play other notes plain so the andolan stands out.'
    ],
    variations: [
      {
        name: 'G M d, P',
        how: 'Ga, Ma, then a long komal Dha with andolan, resolving to Pa.',
        bars: P('64:q 65:q 68:h | 67:w'),
        time: '4/4', key: 'C'
      },
      {
        name: 'G M r, S',
        how: 'Ga, Ma, then a long komal Re with andolan, resolving to Sa.',
        bars: P('64:q 65:q 61:h | 60:w'),
        time: '4/4', key: 'C'
      },
      {
        name: 'The full movement',
        how: 'S G M P, d P, G M r S: andolan on both komal notes.',
        bars: P('60:q 64:q 65:q 67:q | 68:h 67:h | 64:q 65:q 61:h | 60:w'),
        time: '4/4', key: 'C'
      },
      {
        name: 'Upper tetrachord',
        how: 'd N Ṡ, Ṡ N d P: andolan on Dha each time it appears.',
        bars: P('68:h 71:q 72:q | 72:q 71:q 68:h | 67:w'),
        time: '4/4', key: 'C'
      }
    ],
    listen: { artist: 'Pandit Bhimsen Joshi', work: 'Raga Bhairav' }
  },
  {
    id: 'hindustani-sargam-echo',
    style: 'hindustani',
    name: 'Sargam echo in Kafi',
    focus: 'ear',
    level: 1,
    minutes: 8,
    goal: 'Hear a short Kafi phrase, sing it back in sargam, then find it on the guitar without looking.',
    why: 'Hindustani music is taught by ear, teacher to student. Naming notes against Sa before playing them is retrieval practice that ties the ear to the fretboard.',
    backing: { groove: 'drone', bars: ['C'] },
    tempo: [50, 80],
    steps: [
      'Sa is C. Kafi has komal Ga and komal Ni: C D E♭ F G A B♭.',
      'Cover the staff. Press Hear the phrase once.',
      'Sing it back with sargam names (Sa Re ga ma Pa Dha ni).',
      'Play it on the guitar, then uncover the staff and check.'
    ],
    variations: [
      { name: 'S R g R S', how: 'Around Sa, touching komal Ga.', bars: P('60:q 62:q 63:q 62:q | 60:w'), time: '4/4', key: 'Bb' },
      { name: 'm P D n D P', how: 'The upper half, turning on komal Ni.', bars: P('65:q 67:q 69:q 70:q | 69:q 67:h.'), time: '4/4', key: 'Bb' },
      { name: 'g m P g R S', how: 'Up to Pa and back down to Sa.', bars: P('63:q 65:q 67:q 63:q | 62:q 60:h.'), time: '4/4', key: 'Bb' },
      { name: 'Ṡ n D P m g R S', how: 'The whole descent from upper Sa.', bars: P('72:q 70:q 69:q 67:q | 65:q 63:q 62:q 60:q'), time: '4/4', key: 'Bb' }
    ]
  },

  /* ====================== CARNATIC ====================== */
  {
    id: 'carnatic-janta-varisai',
    style: 'carnatic',
    name: 'Janta varisai in Mayamalavagowla',
    focus: 'technique',
    level: 1,
    minutes: 8,
    goal: 'Play the first janta varisai (each swara doubled) in Mayamalavagowla at three speeds in adi tala.',
    why: 'Janta varisai follow sarali varisai in the traditional Carnatic syllabus: doubling each note trains a clean, stressed repeat. Changing speed while keeping the tala is the standard way the exercises are practised.',
    backing: { rhythm: 'adi' },
    tempo: [50, 90],
    steps: [
      'Mayamalavagowla on C: C D♭ E F G A♭ B C.',
      'Put the tala in your hand: clap and three finger counts, clap and wave, clap and wave.',
      'S S R R G G M M | P P D D N N Ṡ Ṡ, then back down.',
      'Make the second note of each pair slightly stronger than the first.'
    ],
    variations: [
      {
        name: 'First speed',
        how: 'One swara per beat: the whole exercise takes four cycles of adi tala.',
        bars: P('60:q 60:q 61:q 61:q | 64:q 64:q 65:q 65:q | 67:q 67:q 68:q 68:q | 71:q 71:q 72:q 72:q | 72:q 72:q 71:q 71:q | 68:q 68:q 67:q 67:q | 65:q 65:q 64:q 64:q | 61:q 61:q 60:q 60:q'),
        time: '4/4', key: 'C'
      },
      {
        name: 'Second speed',
        how: 'Two swaras per beat: the exercise fits in two cycles.',
        bars: P('60:8 60:8 61:8 61:8 64:8 64:8 65:8 65:8 | 67:8 67:8 68:8 68:8 71:8 71:8 72:8 72:8 | 72:8 72:8 71:8 71:8 68:8 68:8 67:8 67:8 | 65:8 65:8 64:8 64:8 61:8 61:8 60:8 60:8'),
        time: '4/4', key: 'C'
      },
      {
        name: 'Third speed',
        how: 'Four swaras per beat: the exercise fits in one cycle.',
        bars: P('60:16 60:16 61:16 61:16 64:16 64:16 65:16 65:16 67:16 67:16 68:16 68:16 71:16 71:16 72:16 72:16 | 72:16 72:16 71:16 71:16 68:16 68:16 67:16 67:16 65:16 65:16 64:16 64:16 61:16 61:16 60:16 60:16'),
        time: '4/4', key: 'C'
      },
      {
        name: 'Sphuritam',
        how: 'At second speed, sound the second note of each pair with a quick touch from the fret below (a fast hammer from one fret lower), the gamaka that janta swaras carry.'
      }
    ]
  },
  {
    id: 'carnatic-nadai-change',
    style: 'carnatic',
    name: 'Changing nadai in adi tala',
    focus: 'rhythm',
    level: 2,
    minutes: 10,
    goal: 'Keep adi tala steady while you split each beat into 3, 4, 5 and 7, speaking and playing the konnakol.',
    why: 'Carnatic rhythm is built on changing the subdivision (nadai or gati) against a fixed tala. Speaking first and playing second ties the count to the body; switching nadai is variable practice for the internal pulse.',
    backing: { rhythm: 'adi' },
    tempo: [50, 80],
    steps: [
      'Keep the tala in your left hand or foot the whole time.',
      'Say the syllables for one cycle, then play them on one note for one cycle.',
      'Accent the first syllable of each beat so the groups always start with the tala.',
      'When a nadai is solid, play up and down a scale in it instead of one note.'
    ],
    variations: [
      { name: 'Tisra (3)', how: 'Ta-ki-ta on every beat: 24 notes per cycle.' },
      { name: 'Chatusra (4)', how: 'Ta-ka-di-mi on every beat: 32 notes per cycle.' },
      { name: 'Khanda (5)', how: 'Ta-di-gi-na-thom on every beat: 40 notes per cycle.' },
      { name: 'Misra (7)', how: 'Ta-ki-ta ta-ka-di-mi on every beat: 56 notes per cycle.' },
      { name: 'Switch every two beats', how: 'Two beats of 3, two of 4, two of 5, two of 4, without losing the tala.' }
    ],
    listen: { artist: 'Shakti with John McLaughlin', work: 'Joy' }
  },
  {
    id: 'carnatic-gamaka-shapes',
    style: 'carnatic',
    name: 'Gamaka shapes on the guitar',
    focus: 'melody',
    level: 2,
    minutes: 10,
    goal: 'Play a short Hamsadhwani phrase plain, with slides from below and above, and with a kampita oscillation.',
    why: 'In Carnatic music the gamaka is part of the note. Applying one kind of gamaka at a time to the same phrase isolates each motion before you mix them as a singer would.',
    backing: { groove: 'drone', bars: ['C'] },
    tempo: [50, 80],
    steps: [
      'Hamsadhwani on C: C D E G B. Sing the phrase first.',
      'These are the basic motions; in a real raga each note has its own habits, so learn them from recordings.',
      'Slides: one finger, keep pressure, arrive in tune.',
      'Kampita: push the string up toward the next note and back, two or three times per beat.'
    ],
    variations: [
      { name: 'Plain', how: 'No gamaka at all, for reference.', bars: P('60:q 62:q 64:q 67:q | 71:q 72:h.'), time: '4/4', key: 'C' },
      { name: 'Jaru from below', how: 'Slide into each note from the swara below.', bars: P('60:q 62:q 64:q 67:q | 71:q 72:h.'), time: '4/4', key: 'C' },
      { name: 'Jaru from above', how: 'Descending phrase, sliding down into each note from the one above.', bars: P('72:q 71:q 67:q 64:q | 62:q 60:h.'), time: '4/4', key: 'C' },
      { name: 'Kampita on Ga and Ni', how: 'Oscillate the held Ga and Ni toward the note above; land Pa and Sa plain.', bars: P('64:h 67:h | 71:h 72:h'), time: '4/4', key: 'C' }
    ],
    listen: { artist: 'U. Shrinivas', work: 'Vatapi Ganapatim' }
  },
  {
    id: 'carnatic-mora-adi',
    style: 'carnatic',
    name: 'Moras that land on samam',
    focus: 'rhythm',
    level: 3,
    minutes: 10,
    goal: 'Place a phrase repeated three times with gaps so its last note falls exactly on samam of adi tala.',
    why: 'Moras and korvais are how Carnatic musicians end improvisations. Calculating and then feeling different phrase and gap lengths builds the same skill from several directions.',
    backing: { rhythm: 'adi' },
    tempo: [50, 80],
    steps: [
      'Adi tala in chatusra nadai has 32 sixteenth-note syllables per cycle.',
      'A mora of phrase P and gap G is 3P + 2G syllables long; it starts at syllable 33 − (3P + 2G), counting from 1 on samam.',
      'Five-note phrase: E D C B C (ta-di-gi-na-thom). Seven-note phrase: D E G E D B C (ta-ka-di-mi-ta-ki-ta).',
      'Speak it first, then play, keeping the tala in your hand.'
    ],
    variations: [
      { name: 'Five, gap three', how: 'Ta-di-gi-na-thom, three syllables of rest, three times. 21 syllables: start on beat 4.' },
      { name: 'Seven, gap two', how: 'Ta-ka-di-mi-ta-ki-ta, two rests, three times. 25 syllables: start on beat 3.' },
      { name: 'Five, gap one', how: 'Ta-di-gi-na-thom, one rest, three times. 17 syllables: start on beat 5, the first beat of the first dhrutam.' },
      { name: 'Five, gap three in tisra', how: 'Three syllables per beat (24 per cycle). The same 21-syllable mora starts on the second syllable of beat 2.' }
    ]
  },

  /* ====================== ARAB WORLD ====================== */
  {
    id: 'arabic-maqsum-guitar',
    style: 'arabic',
    name: 'Maqsum on the guitar: dum, tek and fills',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Play maqsum on the guitar with dum on a bass string and tek on muted high strings, then fill it and put melody on it.',
    why: 'Iqa’at are a skeleton that players fill. Keeping the skeleton fixed while you change the fill and the pitch content is variable practice that keeps the dum–tek placement solid.',
    backing: { rhythm: 'maqsum' },
    tempo: [80, 120],
    steps: [
      'Say it with the backing: “dum tek – tek dum – tek –”.',
      'Dum: open D string, struck with the thumb or a downstroke. Tek: a short palm-muted stroke on the top strings.',
      'Play the skeleton for a minute before trying any fill.',
      'Fills are always softer than the skeleton.'
    ],
    variations: [
      { name: 'Skeleton', how: 'Dum on 1 and 3, tek on the “and” of 1, the “and” of 2 and on 4.' },
      { name: 'Filled', how: 'Add soft muted taps (ka) on each empty eighth, so you play every eighth but only the skeleton strokes are loud.' },
      {
        name: 'Hijaz on the strokes',
        how: 'D on the dums, the upper Hijaz notes on the teks: the melody follows the rhythm exactly.',
        bars: P('62:8 66:q 67:8 62:q 63:q | 62:8 63:q 66:8 62:q 60:q'),
        time: '4/4', key: 'Dm'
      },
      { name: 'Tremolo on the last tek', how: 'Turn the tek on beat 4 into a quick down-up tremolo, the way an oud player uses the risha.' }
    ]
  },
  {
    id: 'arabic-hijaz-sayr',
    style: 'arabic',
    name: 'Maqam Hijaz: lower jins, ghammaz and upper jins',
    focus: 'melody',
    level: 2,
    minutes: 10,
    goal: 'Play Hijaz phrases on D that rest on G, climb into the upper jins and return to D.',
    why: 'A maqam has a path (sayr): it explores its lower jins, rests on the ghammaz and only then moves up. Learning phrases for each stage gives you the building blocks of a taqsim.',
    backing: { groove: 'drone', bars: ['D'] },
    tempo: [50, 80],
    steps: [
      'Jins Hijaz on D: D E♭ F♯ G. The ghammaz (pivot) is G.',
      'Upper jins: Nahawand on G (G A B♭ C D) is a common choice.',
      'Play each phrase slowly, then repeat it with a different ornament on the long note.',
      'Always come back down to D by step.'
    ],
    variations: [
      { name: 'Inside the jins', how: 'D E♭ F♯ G and back, resting on G.', bars: P('62:q 63:8 66:8 67:h | 66:q 63:q 62:h'), time: '4/4', key: 'Dm' },
      { name: 'From below', how: 'Approach D from C, the note below the tonic, then rise to G.', bars: P('60:8 62:8 63:8 66:8 67:q 66:8 63:8 | 62:h. r:q'), time: '4/4', key: 'Dm' },
      { name: 'Up to the upper jins', how: 'From G up through Nahawand to D, then all the way down.', bars: P('67:8 69:8 70:8 72:8 74:q 72:8 70:8 | 69:8 67:8 66:8 63:8 62:h'), time: '4/4', key: 'Dm' },
      { name: 'Short taqsim', how: 'Free time: stay in the lower jins, rest on G, rise to the upper jins once, and return to D. Ignore the pulse.' }
    ],
    listen: { artist: 'Ali Jihad Racy and Simon Shaheen', work: 'Taqasim: The Art of Improvisation in Arabic Music' }
  },
  {
    id: 'arabic-bayati-kurd-ear',
    style: 'arabic',
    name: 'Bayati or Kurd? Hearing the half-flat',
    focus: 'ear',
    level: 2,
    minutes: 8,
    goal: 'Hear and play the difference between Kurd (E♭) and Bayati (E half-flat) on D.',
    why: 'Bayati and Kurd differ only in the second note, and that quarter tone is the sound of the maqam. Alternating the two sharpens the ear far more than playing either alone.',
    backing: { groove: 'drone', bars: ['Dm'] },
    tempo: [50, 80],
    steps: [
      'The staff shows E♭. For Bayati, bend the E♭ up about a quarter tone, halfway to E.',
      'Play each phrase slowly enough to hear the second note against the drone.',
      'Record yourself or ask someone: which phrase was Bayati?'
    ],
    variations: [
      { name: 'Kurd', how: 'Fretted E♭: D E♭ F G and back.', bars: P('62:q 63:q 65:q 67:q | 65:q 63:q 62:h'), time: '4/4', key: 'Dm' },
      { name: 'Bayati', how: 'The same phrase with the E♭ bent up a quarter tone.', bars: P('62:q 63:q 65:q 67:q | 65:q 63:q 62:h'), time: '4/4', key: 'Dm' },
      { name: 'Back to back', how: 'Play the Kurd phrase, then the Bayati phrase, without stopping. Then reverse the order.' },
      { name: 'Bayati from the top', how: 'From the ghammaz G up to C and back down to D, with the half-flat on the way down.', bars: P('67:q 69:q 70:q 72:q | 70:q 69:q 67:q 65:q | 63:q 62:h.'), time: '4/4', key: 'Dm' }
    ]
  },
  {
    id: 'arabic-samai-thaqil',
    style: 'arabic',
    name: 'Sama’i thaqil in 10/8',
    focus: 'rhythm',
    level: 3,
    minutes: 10,
    goal: 'Play the 10/8 sama’i thaqil cycle on the guitar, then fill it and put melody on it.',
    why: 'Sama’i thaqil carries the sama’i, the main instrumental form of the takht repertoire. Counting the groups and then filling them is the same skeleton-then-fill practice Arab percussionists use.',
    backing: { click: { beats: 10, sub: 1 } },
    tempo: [120, 200],
    steps: [
      'The click gives ten eighth notes per cycle; the high click is 1.',
      'Strokes: dum on 1, tek on 4, dum on 6 and 7, tek on 8. Say “dum – – tek – dum dum tek – –”.',
      'Count the groups 3+2+2+3 under it.',
      'Dum on the open D string, tek muted on the top strings.'
    ],
    variations: [
      { name: 'Skeleton', how: 'Only the five strokes, everything else silent.' },
      { name: 'Count aloud', how: 'Play the skeleton while saying “1-2-3, 1-2, 1-2, 1-2-3”.' },
      { name: 'Filled', how: 'Soft muted taps on every empty eighth; the skeleton stays loud.' },
      { name: 'Bayati on the strokes', how: 'One note of D Bayati per stroke, rising for one cycle and falling for the next.' }
    ],
    listen: { artist: 'Ibrahim al-Aryan', work: 'Sama’i Bayati al-Aryan' }
  },

  /* ====================== TURKEY & THE BALKANS ====================== */
  {
    id: 'turkbalkan-rachenitsa-comp',
    style: 'turkbalkan',
    name: 'Rachenitsa comping in 7/8',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Comp a 2+2+3 rachenitsa with bass and chord chops, changing chords without losing the long beat.',
    why: 'Balkan wedding guitar pumps out the aksak groups like a bass and snare. Changing one element at a time keeps the 7/8 feel solid under each new demand.',
    backing: { rhythm: 'rachenitsa' },
    tempo: [200, 360],
    steps: [
      'The tempo counts fast eighth-note pulses. Say “1-2, 1-2, 1-2-3”.',
      'Use Dm (x-x-0-2-3-1) and A7 (x-0-2-0-2-0).',
      'Start slow enough that the long group feels clearly longer, not like a mistake.',
      'Tap your foot on the three group starts, not on every pulse.'
    ],
    variations: [
      { name: 'Group starts', how: 'One downstroke on each group start: three strokes per bar, the third followed by the longer gap.' },
      { name: 'Oom-pa, oom-pa, oom-pa-pa', how: 'Bass note on each group start, a short chord chop on the other pulses.' },
      { name: 'Change every bar', how: 'Dm for one bar, A7 for the next, changing on the first pulse.' },
      { name: 'Lift the long beat', how: 'Accent the start of the long group and let that chord ring through it, the way dancers lift on the slow step.' }
    ],
    listen: { artist: 'Ivo Papasov and His Wedding Band', work: 'Orpheus Ascending' }
  },
  {
    id: 'turkbalkan-clarinet-ornaments',
    style: 'turkbalkan',
    name: 'Clarinet-style ornaments, one type at a time',
    focus: 'technique',
    level: 2,
    minutes: 10,
    goal: 'Add mordents, trills, turns and slides to a slow Phrygian dominant line with legato.',
    why: 'Clarinet and kaval lines are carried by fast ornaments. Applying one ornament type to the same line at a time makes each motion clean before you mix them freely.',
    backing: { groove: 'drone', bars: ['E'] },
    tempo: [50, 80],
    steps: [
      'Learn the plain line in E Phrygian dominant (E F G♯ A B C D).',
      'Ornaments are left-hand legato: pick the first note only.',
      'Keep each ornament short and before the beat, so the main note still lands on time.',
      'Stay on one ornament type until it sounds easy.'
    ],
    variations: [
      { name: 'Plain', how: 'The line with no ornaments.', bars: P('69:h 68:q 65:q | 64:w | 65:q 68:q 69:q 71:q | 69:h 64:h'), time: '4/4', key: 'Am' },
      { name: 'Upper mordent', how: 'On each half note: note, quick hammer to the note above, pull back.', bars: P('69:h 68:q 65:q | 64:w | 65:q 68:q 69:q 71:q | 69:h 64:h'), time: '4/4', key: 'Am' },
      { name: 'Trill', how: 'Trill the whole note and the half notes with the note above, hammer and pull as fast as stays even.' },
      { name: 'Turn', how: 'Before each half note: note above, the note, note below, the note.' },
      { name: 'Slide in', how: 'Slide into each quarter note from the fret below.' }
    ],
    listen: { artist: 'Selim Sesler', work: 'The Road to Keşan' }
  },
  {
    id: 'turkbalkan-kopanitsa-phrase',
    style: 'turkbalkan',
    name: 'Kopanitsa phrase in 11/8',
    focus: 'melody',
    level: 3,
    minutes: 10,
    goal: 'Play a Phrygian dominant phrase that follows the 2+2+3+2+2 groups of kopanitsa.',
    why: 'In 11/8 the melody has to know where the long beat is. Building from bass to melody and then shifting the start trains the grouping, not one fixed line.',
    backing: { rhythm: 'kopanitsa' },
    tempo: [180, 340],
    steps: [
      'Say the groups: “ta-ka ta-ka ta-ki-ta ta-ka ta-ka”.',
      'The tempo counts eighth-note pulses; start slow.',
      'The phrase is in E Phrygian dominant: E F G♯ A B C D.',
      'The dotted quarter is the long group in the middle; lean on it.'
    ],
    variations: [
      { name: 'Bass on the groups', how: 'Low E on each of the five group starts.', bars: P('52:q 52:q 52:q. 52:q 52:q'), time: '11/8', key: 'Am' },
      { name: 'The phrase', how: 'Two bars up to the long B and back to E.', bars: P('64:8 65:8 68:8 69:8 71:q. 69:8 68:8 65:8 64:8 | 65:8 68:8 69:8 68:8 65:8 64:8 62:8 64:q r:q'), time: '11/8', key: 'Am' },
      { name: 'Ornament the long note', how: 'Trill the long B in bar 1 with the C above, stopping exactly at the next group.' },
      { name: 'Start in the middle', how: 'Begin the phrase on the long group instead of the first, and fit the rest around the cycle.' }
    ],
    listen: { artist: 'Ivo Papasov and His Wedding Band', work: 'Balkanology' }
  },
  {
    id: 'turkbalkan-rast-segah',
    style: 'turkbalkan',
    name: 'Makam Rast: hearing the segâh',
    focus: 'ear',
    level: 2,
    minutes: 8,
    goal: 'Hear and play the Turkish segâh (B about a comma flat) against fretted B and the lower Arabic half-flat.',
    why: 'Turkish theory divides the whole tone into nine commas, and makam Rast’s third sits a little below the fret. Comparing three versions of one note builds a finer ear than learning any one of them.',
    backing: { groove: 'drone', bars: ['Gsus4'] },
    tempo: [50, 80],
    steps: [
      'Rast on G: G A B(segâh) C D E F♯(eviç) G. The drone has no third, so the B is up to you.',
      'Fretted B is too high for segâh. Play B♭ and bend it up almost to B, stopping a hair short.',
      'Arabic Rast places the same degree lower still: about halfway between B♭ and B.',
      'Play each version slowly and hold the third against the drone.'
    ],
    variations: [
      { name: 'Fretted B', how: 'The guitar’s B, for reference.', bars: P('67:q 69:q 71:q 72:q | 74:h 72:q 71:q | 69:q 67:h.'), time: '4/4', key: 'G' },
      { name: 'Segâh', how: 'The same phrase with B♭ bent up almost to B.', bars: P('67:q 69:q 71:q 72:q | 74:h 72:q 71:q | 69:q 67:h.'), time: '4/4', key: 'G' },
      { name: 'Arabic half-flat', how: 'The same phrase with B♭ bent only halfway. Compare it with segâh.' },
      { name: 'Eviç on top', how: 'Upper phrase: bend F up almost to F♯ for eviç, then resolve to G.', bars: P('74:q 76:q 78:q 79:q | 79:h 78:q 76:q | 74:w'), time: '4/4', key: 'G' }
    ]
  },

  /* ====================== WEST AFRICA ====================== */
  {
    id: 'westafrica-bell-two-three',
    style: 'westafrica',
    name: 'Bell pattern and the four beats',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Play the 12/8 bell pattern with the fingers while the thumb holds the four main beats.',
    why: 'The bell timeline anchors West African ensembles, and the guitar has to feel both the four beats and the twelve pulses. Moving the finger part while the thumb holds still builds the 3-against-2 feel in one hand.',
    backing: { rhythm: 'bembe' },
    tempo: [70, 110],
    steps: [
      'Count twelve pulses per cycle; the main beats fall on pulses 1, 4, 7 and 10.',
      'Thumb on the open A and E strings, alternating, on the four beats.',
      'Fingers on a muted pair of strings (2 and 3) for the bell.',
      'Tap your foot on the four beats the whole time.'
    ],
    variations: [
      { name: 'Thumb alone', how: 'Open A on pulses 1 and 7, open E on 4 and 10.' },
      { name: 'Thumb and bell', how: 'Fingers play the seven bell strokes: pulses 1, 3, 5, 6, 8, 10 and 12.' },
      { name: 'Three against two', how: 'Fingers on every other pulse (1, 3, 5, 7, 9, 11): six even notes against the thumb’s four.' },
      { name: 'Bell alone', how: 'Thumb silent. Keep the four beats in your foot and play only the bell.' }
    ],
    listen: { artist: 'Babatunde Olatunji', work: 'Drums of Passion' }
  },
  {
    id: 'westafrica-highlife-two-finger',
    style: 'westafrica',
    name: 'Highlife two-finger picking',
    focus: 'harmony',
    level: 1,
    minutes: 8,
    goal: 'Play I–IV–I–V in C with a thumb bass and offbeat finger dyads, then a melody in thirds on top.',
    why: 'Highlife guitar is clean, repetitive and light: a thumb bass, offbeat chords and lines in thirds. Building the parts one at a time and holding each for a long time is how these parts are learned.',
    backing: { groove: 'highlife', bars: ['C', 'F', 'C', 'G7'] },
    tempo: [80, 120],
    steps: [
      'Thumb: root on beat 1, fifth on beat 3.',
      'Index (or index and middle): a two-note chord fragment on strings 3 and 2.',
      'Repeat each variation for at least 16 bars without changing it.',
      'Keep the fingers soft and the thumb steady.'
    ],
    variations: [
      { name: 'Offbeat dyads', how: 'Fingers on the “and” of every beat, matching the backing’s chord.' },
      { name: 'Add the “a” of 2 and 4', how: 'One extra finger stroke on the last sixteenth of beats 2 and 4.' },
      { name: 'Walking into the change', how: 'On the “and” of 4 the thumb plays a passing note into the next chord’s root.' },
      {
        name: 'Melody in thirds',
        how: 'The top line on string 1 or 2 with a third below on the next string, over the same thumb bass.',
        bars: P('72:q 76:8 74:8 72:q 67:q | 69:q 72:8 69:8 65:h | 67:q 72:8 74:8 76:q 72:q | 71:q 74:q 71:h'),
        time: '4/4', key: 'C'
      }
    ],
    listen: { artist: 'E. T. Mensah and the Tempos', work: 'All for You' }
  },
  {
    id: 'westafrica-kora-ostinato',
    style: 'westafrica',
    name: 'Kora-style ostinato and run',
    focus: 'technique',
    level: 2,
    minutes: 10,
    goal: 'Hold a kumbengo-style ostinato for minutes, then drop in a fast run and return without losing the cycle.',
    why: 'On kora the birimintingo runs sit over the steady kumbengo. Leaving and returning to the ostinato is the real skill, and practising the return is retrieval under time pressure.',
    backing: { click: { beats: 4, sub: 3 } },
    tempo: [60, 100],
    steps: [
      'Each beat has three pulses. Thumb on the first pulse of each beat, index on the third.',
      'Bass notes: F (string 4, fret 3) and C (string 5, fret 3). High notes on strings 1 and 2.',
      'Do not speed up. Kora ostinatos are hypnotic because they are steady.',
      'Play each variation for at least two minutes.'
    ],
    variations: [
      {
        name: 'Thumb alone',
        how: 'F, C, F, C on the four beats.',
        positions: [[4, 3], [5, 3]]
      },
      {
        name: 'Add the index',
        how: 'On the third pulse of each beat: A, G, A, C on string 1 (frets 5, 3, 5, 8).',
        positions: [[4, 3], [1, 5], [5, 3], [1, 3], [1, 8]]
      },
      { name: 'Shift the index', how: 'Move the index notes to the second pulse of each beat. Hear the whole pattern change feel.' },
      { name: 'Drop in a run', how: 'Every fourth cycle replace the pattern with a fast run down F major pentatonic on strings 1 and 2 (C A G F D C), then pick the ostinato back up on beat 1.' }
    ],
    listen: { artist: 'Toumani Diabaté', work: 'Jarabi' }
  },
  {
    id: 'westafrica-afrobeat-interlock',
    style: 'westafrica',
    name: 'Afrobeat interlocking guitar line',
    focus: 'rhythm',
    level: 3,
    minutes: 10,
    goal: 'Play a muted single-note line on the sixteenths between the drums, then shift it one sixteenth and keep it locked.',
    why: 'Afrobeat guitars play short muted lines that fit into the gaps left by each other and the drums. Moving the same line one sixteenth trains exact placement, not a memorised groove.',
    backing: { rhythm: 'funk16' },
    tempo: [80, 112],
    steps: [
      'Count every sixteenth: 1 e & a 2 e & a.',
      'Light palm mute, alternate picking with the hand moving in sixteenths all the time.',
      'The notes come from D Dorian (A, C and D here).',
      'Play one variation for two minutes before you change it.'
    ],
    variations: [
      { name: 'The line', how: 'Notes on the “e” of 1, beat 2, the “&” of 2, the “e” of 3, beat 4 and the “&” of 4.', bars: P('r:16 57:16 r:8 60:16 r:16 62:16 r:16 r:16 62:16 r:8 60:16 r:16 57:8'), time: '4/4', key: 'Dm' },
      { name: 'One sixteenth later', how: 'The same notes, each moved one sixteenth later.', bars: P('r:8 57:16 r:16 r:16 60:16 r:16 62:16 r:8 62:16 r:16 r:16 60:16 r:16 57:16'), time: '4/4', key: 'Dm' },
      { name: 'Chord chops', how: 'Play the first line’s rhythm as short muted Dm7 chops on strings 2 to 4.' },
      { name: 'Two-bar answer', how: 'Play the line in bar 1 and answer it in bar 2 with C, D and F in the same spaces.' }
    ],
    listen: { artist: 'Fela Kuti', work: 'Water No Get Enemy' }
  },

  /* ====================== CENTRAL & EAST AFRICA ====================== */
  {
    id: 'centraleast-sebene-arpeggios',
    style: 'centraleast',
    name: 'Sebene arpeggio cells',
    focus: 'technique',
    level: 1,
    minutes: 10,
    goal: 'Play high triad arpeggios through E–A–B–A with relaxed alternate picking for minutes at a time.',
    why: 'The sebene lead guitar loops bright arpeggio cells high on the neck. Changing subdivision and direction on the same three-string shapes builds endurance and evenness.',
    backing: { groove: 'soukous', bars: ['E', 'A', 'B', 'A'] },
    tempo: [90, 140],
    steps: [
      'Shapes on strings 3-2-1: E at frets 9-9-7, A at 9-10-9, B at 11-12-11.',
      'Alternate picking, small motions, a light clean tone.',
      'Repeat a variation for three minutes without speeding up.',
      'Keep the left hand down; let notes ring into each other.'
    ],
    variations: [
      {
        name: 'Eighths',
        how: 'Low, middle, high, middle in eighth notes.',
        bars: P('64:8 68:8 71:8 68:8 64:8 68:8 71:8 68:8 | 64:8 69:8 73:8 69:8 64:8 69:8 73:8 69:8 | 66:8 71:8 75:8 71:8 66:8 71:8 75:8 71:8 | 64:8 69:8 73:8 69:8 64:8 69:8 73:8 69:8'),
        time: '4/4', key: 'E',
        positions: [[3, 9], [2, 9], [1, 7]]
      },
      {
        name: 'Sixteenths',
        how: 'The same cells, twice as fast.',
        bars: P('64:16 68:16 71:16 68:16 64:16 68:16 71:16 68:16 64:16 68:16 71:16 68:16 64:16 68:16 71:16 68:16 | 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16 | 66:16 71:16 75:16 71:16 66:16 71:16 75:16 71:16 66:16 71:16 75:16 71:16 66:16 71:16 75:16 71:16 | 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16'),
        time: '4/4', key: 'E'
      },
      {
        name: 'Top down',
        how: 'High, middle, low, middle in sixteenths.',
        bars: P('71:16 68:16 64:16 68:16 71:16 68:16 64:16 68:16 71:16 68:16 64:16 68:16 71:16 68:16 64:16 68:16 | 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16 | 75:16 71:16 66:16 71:16 75:16 71:16 66:16 71:16 75:16 71:16 66:16 71:16 75:16 71:16 66:16 71:16 | 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16'),
        time: '4/4', key: 'E'
      },
      { name: 'Accent the “a”', how: 'Sixteenths, with an accent on the last sixteenth of each beat to push the dancers forward.' }
    ],
    listen: { artist: 'Franco & TPOK Jazz', work: 'Mario' }
  },
  {
    id: 'centraleast-thirds-sixths',
    style: 'centraleast',
    name: 'Lead line in thirds and sixths',
    focus: 'harmony',
    level: 2,
    minutes: 8,
    goal: 'Harmonise a short sebene line in diatonic thirds, then sixths, over E–A–B–A.',
    why: 'Congolese and Kenyan-Congolese bands voice their lines in parallel thirds and sixths. Playing one line in several harmonisations teaches the fretboard pairs, not just one riff.',
    backing: { groove: 'soukous', bars: ['E', 'A', 'B', 'A'] },
    tempo: [90, 130],
    steps: [
      'Learn the top line alone first.',
      'Thirds: the second voice sits on the next string down, a diatonic third below (E major scale).',
      'Sixths: the second voice skips a string and sits a diatonic sixth below.',
      'Pick both notes together, or pluck with pick and middle finger.'
    ],
    variations: [
      { name: 'Top line', how: 'Single notes high on strings 1 and 2.', bars: P('71:8 73:8 76:q 75:8 73:8 71:q | 73:8 76:8 78:q 76:8 73:8 69:q | 75:8 78:8 75:8 73:8 71:h | 73:8 71:8 69:8 68:8 69:h'), time: '4/4', key: 'E' },
      { name: 'In thirds', how: 'Add a diatonic third below each note on the next string down.' },
      { name: 'In sixths', how: 'Add a diatonic sixth below each note, skipping a string (strings 1 and 3, or 2 and 4).' },
      { name: 'Lower voice alone', how: 'Play only the harmony voice while singing the top line.' }
    ],
    listen: { artist: 'Super Mazembe', work: 'Shauri Yako' }
  },
  {
    id: 'centraleast-qenet-phrases',
    style: 'centraleast',
    name: 'Ethiopian qenet: Tizita and Bati phrases',
    focus: 'melody',
    level: 2,
    minutes: 8,
    goal: 'Play and vary phrases in Tizita major and Bati major over a C drone, with slides into notes and a wide vibrato.',
    why: 'Each qenet has its own colour, and Ethiopian singers carry it with slides and vibrato. Switching qenet over the same drone makes the difference audible.',
    backing: { groove: 'drone', bars: ['C'] },
    tempo: [50, 90],
    steps: [
      'Tizita major on C: C D E G A. Bati major (as used in this app): C E F G B.',
      'Slide into the long notes from a fret below.',
      'Add a slow, wide vibrato on held notes, like a singer.',
      'Sing each phrase once before playing it.'
    ],
    variations: [
      { name: 'Tizita descent', how: 'From upper C down to C.', bars: P('72:q 69:q 67:h | 64:q 62:q 60:h'), time: '4/4', key: 'C' },
      { name: 'Tizita arch', how: 'Up to C and back, ending on D.', bars: P('60:8 62:8 64:q 67:8 69:8 72:q | 69:q 67:8 64:8 62:h'), time: '4/4', key: 'C' },
      { name: 'Bati rise', how: 'Up through F and G to B and C, then back down.', bars: P('60:q 64:q 65:q 67:q | 71:h 72:h | 71:q 67:q 65:q 64:q | 60:w'), time: '4/4', key: 'C' },
      { name: 'Bati turn', how: 'A faster turn around B and G.', bars: P('72:8 71:8 67:q 65:8 64:8 60:q | 64:q 65:q 67:h'), time: '4/4', key: 'C' }
    ],
    listen: { artist: 'Mulatu Astatke', work: 'Yègellé Tezeta' }
  },
  {
    id: 'centraleast-chimurenga-mbira',
    style: 'centraleast',
    name: 'Chimurenga guitar in the mbira style',
    focus: 'rhythm',
    level: 3,
    minutes: 10,
    goal: 'Split a 12-pulse mbira-style pattern between a muted thumb bass and high finger notes, then shift the high part.',
    why: 'Chimurenga guitarists copy the mbira’s interlocking low and high parts in 12/8. Moving one part against the other trains the three-against-two feel and the shifting downbeat.',
    backing: { click: { beats: 4, sub: 3 } },
    tempo: [60, 100],
    steps: [
      'This is a practice pattern in the mbira style, not a transcription of a particular piece.',
      'Twelve pulses per cycle. Thumb palm-muted on the low strings, fingers on strings 1 and 2.',
      'Start on G for a whole minute. Then change the chord each cycle: G, Em, C, D.',
      'Keep both parts steady; the interest comes from how they lock together.'
    ],
    variations: [
      { name: 'Thumb bass', how: 'Palm-muted G on pulses 1 and 7, D on 4 and 10.', positions: [[6, 3], [5, 5]] },
      { name: 'High notes on the last pulse', how: 'Fingers on pulses 3, 6, 9 and 12: B, D, B, G on the top strings.', positions: [[6, 3], [2, 0], [2, 3], [1, 3]] },
      { name: 'Three against two', how: 'Fingers on the even pulses (2, 4, 6, 8, 10, 12), six notes against the thumb’s four.' },
      { name: 'Shift the high part', how: 'Move the finger notes one pulse earlier and hear where the downbeat seems to go.' }
    ],
    listen: { artist: 'Thomas Mapfumo and the Blacks Unlimited', work: 'Corruption' }
  },

  /* ====================== GYPSY JAZZ ====================== */
  {
    id: 'manouche-pompe-control',
    style: 'manouche',
    name: 'La pompe: short, even, relaxed',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Play la pompe on Am6–Dm6–E7–Am6 with short chops on 2 and 4 and a relaxed right arm.',
    why: 'In gypsy jazz the rhythm guitar is the drum kit. Varying voicing and dynamics while the strokes stay identical builds a pompe that holds at any tempo.',
    backing: { groove: 'pompe', bars: ['Am6', 'Dm6', 'E7', 'Am6'] },
    tempo: [110, 200],
    steps: [
      'Shapes: Am6 5-x-4-5-5-x, Dm6 x-5-3-4-3-x, E7 0-x-0-1-0-x.',
      'Four downstrokes per bar from the wrist and forearm, never from the fingers.',
      'Lift the left-hand pressure just after 2 and 4 so those chords are very short.',
      'Raise the tempo only when your arm still feels loose.'
    ],
    variations: [
      { name: 'Even fours', how: 'Four equal downstrokes, short on 2 and 4.', positions: [[6, 5], [4, 4], [3, 5], [2, 5]] },
      { name: 'Bass on 1 and 3', how: 'Strike only the bass string on 1 and 3, the full chord on 2 and 4.' },
      { name: 'Dm6 shape', how: 'Check the Dm6 shape alone for a few bars: root on string 5, muted string 6.', positions: [[5, 5], [4, 3], [3, 4], [2, 3]] },
      { name: 'Soft and loud', how: 'Four bars very soft, four bars loud, without the tempo moving.' }
    ],
    listen: { artist: 'Django Reinhardt and the Quintette du Hot Club de France', work: 'Minor Swing' }
  },
  {
    id: 'manouche-passing-diminished',
    style: 'manouche',
    name: 'Passing diminished chords',
    focus: 'harmony',
    level: 2,
    minutes: 8,
    goal: 'Comp G6–G♯dim7–Am7–D7 with la pompe, moving each shape by the smallest step.',
    why: 'Gypsy jazz uses dim7 chords as passing chords between beats. Learning that a dim7 shape repeats every three frets turns one shape into four chords.',
    backing: { groove: 'pompe', bars: ['G6 G#dim7', 'Am7 D7'] },
    tempo: [100, 180],
    steps: [
      'Two chords per bar: G6 on 1–2, G♯dim7 on 3–4, Am7 on 1–2, D7 on 3–4.',
      'Notice the bass climbing G–G♯–A.',
      'Keep the pompe strokes identical when the chord changes.'
    ],
    variations: [
      { name: 'G6', how: 'G6: 3-x-2-4-3-x.', positions: [[6, 3], [4, 2], [3, 4], [2, 3]] },
      { name: 'G♯dim7', how: 'G♯dim7: 4-x-3-4-3-x. Only the root and the 6th move from G6.', positions: [[6, 4], [4, 3], [3, 4], [2, 3]] },
      { name: 'The same dim7, three frets up', how: 'Play the passing chord as 7-x-6-7-6-x (Bdim7): same four notes, so it works in the same place.' },
      { name: 'D7 as a dim7', how: 'Replace D7 with an E♭dim7 shape on the top four strings (x-x-1-2-1-2): it sounds as D7♭9.' }
    ],
    listen: { artist: 'Django Reinhardt', work: 'Swing 42' }
  },
  {
    id: 'manouche-approach-arpeggios',
    style: 'manouche',
    name: 'Arpeggios with chromatic approach',
    focus: 'melody',
    level: 2,
    minutes: 10,
    goal: 'Play Am6, Dm6 and E7 arpeggios in eighths, starting each from a half step below, with rest strokes.',
    why: 'Django’s lines outline the chord and slide in from a half step below. Adding the approach and the rest stroke one at a time makes the sound and the picking automatic.',
    backing: { groove: 'pompe', bars: ['Am6', 'Dm6', 'E7', 'Am6'] },
    tempo: [90, 180],
    steps: [
      'Am6 is A C E F♯; Dm6 is D F A B; E7 here adds F, the ♭9.',
      'Downstroke on every string change (rest stroke): the pick lands on the next string.',
      'Learn the plain version, then the approach version.',
      'Swing the eighths lightly, more even than in bebop.'
    ],
    variations: [
      { name: 'Plain arpeggios', how: 'Chord tones only.', bars: P('57:8 60:8 64:8 66:8 69:8 66:8 64:8 60:8 | 62:8 65:8 69:8 71:8 74:8 71:8 69:8 65:8 | 64:8 68:8 71:8 74:8 71:8 68:8 64:8 62:8 | 57:h r:h'), time: '4/4', key: 'Am' },
      { name: 'Approach from below', how: 'Each arpeggio starts a half step under its root.', bars: P('56:8 57:8 60:8 64:8 66:8 64:8 60:8 57:8 | 61:8 62:8 65:8 69:8 71:8 69:8 65:8 62:8 | 63:8 64:8 68:8 71:8 74:8 77:8 74:8 71:8 | 69:h r:h'), time: '4/4', key: 'Am' },
      { name: 'Rest strokes', how: 'The approach version with a downstroke rest stroke on every string change, even when going up.' },
      { name: 'Start on the third', how: 'Same idea, but each arpeggio starts a half step below its 3rd instead of its root.' }
    ],
    listen: { artist: 'Django Reinhardt', work: 'Minor Swing' }
  },
  {
    id: 'manouche-diminished-runs',
    style: 'manouche',
    name: 'Diminished runs over E7 to Am6',
    focus: 'technique',
    level: 3,
    minutes: 10,
    goal: 'Run a diminished arpeggio up and down the neck over E7 and resolve it cleanly onto Am6.',
    why: 'Fast diminished runs are a gypsy jazz signature. Because the shape repeats every three frets, practising it as one shift-and-repeat motion is efficient chunking.',
    backing: { groove: 'pompe', bars: ['E7', 'Am6'] },
    tempo: [90, 180],
    steps: [
      'Over E7, F A♭ B D is E7♭9 without the root.',
      'The four-string shape x-x-3-4-3-4 repeats three frets higher with the same fingering.',
      'Resolve: the run ends on a chord tone of Am6 on beat 1.',
      'Rest strokes on string changes, alternate picking within a string.'
    ],
    variations: [
      { name: 'Up, eighths', how: 'Two octaves up from F, resolving to E.', bars: P('53:8 56:8 59:8 62:8 65:8 68:8 71:8 74:8 | 76:q 72:q 69:h'), time: '4/4', key: 'Am', positions: [[4, 3], [3, 4], [2, 3], [1, 4]] },
      { name: 'Down, eighths', how: 'From high F down, resolving to A.', bars: P('77:8 74:8 71:8 68:8 65:8 62:8 59:8 56:8 | 57:q 60:q 64:h'), time: '4/4', key: 'Am' },
      { name: 'Up and down, sixteenths', how: 'Up two octaves and straight back down in one bar.', bars: P('53:16 56:16 59:16 62:16 65:16 68:16 71:16 74:16 77:16 74:16 71:16 68:16 65:16 62:16 59:16 56:16 | 57:q 60:q 64:h'), time: '4/4', key: 'Am' },
      { name: 'Shape shifts', how: 'Play the four-note shape as a chord, then as an arpeggio, moving it up three frets each beat.' }
    ],
    listen: { artist: 'Django Reinhardt', work: 'Djangology' }
  },

  /* ====================== JAZZ ====================== */
  {
    id: 'jazz-guide-tones',
    style: 'jazz',
    name: 'Guide-tone lines through ii–V–I',
    focus: 'harmony',
    level: 1,
    minutes: 8,
    goal: 'Play the 3rds and 7ths of Dm7–G7–Cmaj7 as smooth lines, then turn them into a melody.',
    why: 'The 3rd and 7th define each chord, and they move by half step or not at all through a ii–V–I. Building from one note per bar to a melodic line is whole–part practice for hearing the changes.',
    backing: { groove: 'swing', bars: ['Dm7', 'G7', 'Cmaj7', 'Cmaj7'] },
    tempo: [80, 180],
    steps: [
      'Say the guide tones: Dm7 F and C, G7 B and F, Cmaj7 E and B.',
      'Find each line on one string set before playing with the backing.',
      'Let each note ring for its full length.',
      'Listen to the half-step resolutions (C to B, F to E).'
    ],
    variations: [
      { name: 'Line from the 3rd', how: 'F, F, E: the 3rd of Dm7 becomes the 7th of G7, then falls to the 3rd of C.', bars: P('65:w | 65:w | 64:w | 64:w'), time: '4/4', key: 'C' },
      { name: 'Line from the 7th', how: 'C, B, B: the 7th of Dm7 falls to the 3rd of G7 and stays as the 7th of Cmaj7.', bars: P('72:w | 71:w | 71:w | 71:w'), time: '4/4', key: 'C' },
      { name: 'Both, two per bar', how: 'The 3rd then the 7th of each chord.', bars: P('65:h 72:h | 71:h 65:h | 64:h 71:h | 64:w'), time: '4/4', key: 'C' },
      { name: 'Guide tone on beat 1', how: 'Quarter notes that land on a 3rd at each bar line.', bars: P('65:q 67:q 69:q 72:q | 71:q 69:q 67:q 65:q | 64:q 62:q 60:q 59:q | 60:w'), time: '4/4', key: 'C' }
    ],
    listen: { artist: 'Jim Hall and Bill Evans', work: 'Undercurrent' }
  },
  {
    id: 'jazz-blues-comping',
    style: 'jazz',
    name: 'Comping rhythms on a jazz blues',
    focus: 'rhythm',
    level: 2,
    minutes: 10,
    goal: 'Comp shell voicings on a 12-bar blues in F with four different rhythmic approaches.',
    why: 'Good comping is mostly rhythm. Keeping the voicings fixed and changing only the rhythm builds a vocabulary you can choose from while listening to a soloist.',
    backing: { groove: 'swing', bars: ['F7', 'Bb7', 'F7', 'F7', 'Bb7', 'Bb7', 'F7', 'D7', 'Gm7', 'C7', 'F7 D7', 'Gm7 C7'] },
    tempo: [80, 160],
    steps: [
      'Shells (root, 7th, 3rd) on strings 6-4-3 or 5-4-3, muting the strings in between.',
      'F7: 1-x-1-2-x-x. B♭7: 6-x-6-7-x-x, or x-1-0-1-x-x.',
      'Keep the comp short and light, and leave space.',
      'Play each variation for at least two full choruses.'
    ],
    variations: [
      { name: 'Four to the bar', how: 'Short quarter notes on every beat, Freddie Green style, accents on 2 and 4.', positions: [[6, 1], [4, 1], [3, 2]] },
      { name: 'Charleston', how: 'Beat 1 and the “and” of 2 in every bar.', positions: [[6, 6], [4, 6], [3, 7]] },
      { name: 'Anticipate', how: 'Play each new chord on the “and” of 4 of the bar before and let it ring over the bar line.' },
      { name: 'Leave space', how: 'Comp only in bars 2 and 4 of each four-bar phrase, with one or two syncopated hits, as if answering a soloist.' }
    ],
    listen: { artist: 'Count Basie Orchestra', work: 'Shiny Stockings' }
  },
  {
    id: 'jazz-enclosures',
    style: 'jazz',
    name: 'Bebop enclosures into Cmaj7',
    focus: 'melody',
    level: 3,
    minutes: 10,
    goal: 'Target a chord tone of Cmaj7 on beat 1 by surrounding it with the notes above and below.',
    why: 'Enclosures are how bebop lines make chord tones land. Hitting a different target with the same idea in each variation builds the skill rather than one lick.',
    backing: { groove: 'swing', bars: ['Dm7', 'G7', 'Cmaj7', 'Cmaj7'] },
    tempo: [80, 200],
    steps: [
      'Each line runs through Dm7 and G7 and lands on beat 1 of the Cmaj7 bar.',
      'Learn the last beat of the G7 bar plus the target first, then add the rest.',
      'Swing the eighths and accent the upbeats lightly.',
      'Stop after the target and listen to it against the chord.'
    ],
    variations: [
      { name: 'Enclose the 3rd', how: 'F above, D♯ below, land on E.', bars: P('62:8 65:8 69:8 72:8 71:8 69:8 67:8 65:8 | 67:8 71:8 74:8 72:8 71:8 69:8 65:8 63:8 | 64:q r:q r:h | r:w'), time: '4/4', key: 'C' },
      { name: 'Enclose the 5th', how: 'A above, F♯ below, land on G.', bars: P('62:8 65:8 69:8 72:8 71:8 69:8 67:8 65:8 | 67:8 71:8 74:8 72:8 71:8 65:8 69:8 66:8 | 67:q r:q r:h | r:w'), time: '4/4', key: 'C' },
      { name: 'Enclose the root', how: 'D♭ above, B below, land on C.', bars: P('62:8 65:8 69:8 72:8 71:8 69:8 67:8 65:8 | 67:8 71:8 74:8 77:8 76:8 74:8 73:8 71:8 | 72:q r:q r:h | r:w'), time: '4/4', key: 'C' },
      { name: 'Three-note enclosure', how: 'F above, then D and D♯ below, land on E.', bars: P('62:8 65:8 69:8 72:8 71:8 69:8 67:8 65:8 | 67:8 71:8 74:8 72:8 71:8 65:8 62:8 63:8 | 64:q r:q r:h | r:w'), time: '4/4', key: 'C' }
    ],
    listen: { artist: 'Charlie Parker', work: 'Donna Lee' }
  },
  {
    id: 'jazz-sing-the-changes',
    style: 'jazz',
    name: 'Sing the changes',
    focus: 'ear',
    level: 2,
    minutes: 8,
    goal: 'Sing the root, then the 3rd, then the 7th of each chord of an Autumn Leaves-type progression in time.',
    why: 'Players who can sing the changes can hear them while they improvise. Singing one chord tone at a time through the form, then playing what you sang, is retrieval with immediate feedback.',
    backing: { groove: 'swing', bars: ['Am7', 'D7', 'Gmaj7', 'Cmaj7', 'F#m7b5', 'B7', 'Em', 'Em'] },
    tempo: [70, 140],
    steps: [
      'Sing on a neutral syllable, one note per bar, held for the whole bar.',
      'If you lose your place, hum the bass line to find it again.',
      'After singing a line, play it on the guitar without stopping the backing.',
      'Cover the chord names once it feels secure.'
    ],
    variations: [
      { name: 'Roots', how: 'A, D, G, C, F♯, B, E, E: the bass line in fifths.' },
      { name: 'Thirds', how: 'C, F♯, B, E, A, D♯, G, G.' },
      { name: 'Sevenths', how: 'G, C, F♯, B, E, A, then D (the 7th of Em7) and D.' },
      { name: 'Guide-tone line', how: 'Sing the smoothest path through 3rds and 7ths, then play it.' }
    ],
    listen: { artist: 'Cannonball Adderley', work: 'Autumn Leaves (Somethin’ Else, 1958)' }
  },

  /* ====================== LATIN AMERICA ====================== */
  {
    id: 'latam-sesquialtera-strum',
    style: 'latam',
    name: 'Sesquiáltera strumming in 6/8 and 3/4',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Strum six eighths per bar and move the accents between 6/8 and 3/4 on Am–E7, with a muted slap on the accents.',
    why: 'The shift between two big beats and three is the heart of chacarera, zamba and joropo. Keeping the hand moving the same way while only the accents move builds the feel into the strum.',
    backing: { rhythm: 'sesqui' },
    tempo: [60, 100],
    steps: [
      'The backing claps 6/8 in the first bar and 3/4 in the second.',
      'Keep a constant down-up motion; only the accents change.',
      'Am for one bar, E7 for the next.',
      'Count “1 2 3 4 5 6” for each bar.'
    ],
    variations: [
      { name: 'Always in 2', how: 'Accents on 1 and 4 in every bar (6/8).' },
      { name: 'Always in 3', how: 'Accents on 1, 3 and 5 in every bar (3/4).' },
      { name: 'Follow the backing', how: 'Bar one in 6/8, bar two in 3/4, matching the clap.' },
      { name: 'Chasquido', how: 'On each accent, strike down and immediately damp the strings with the palm: the muted slap of Argentine strumming.' },
      { name: 'Bass in 3, strum in 2', how: 'Thumb plays the bass on 1, 3 and 5 while the strum accents stay on 1 and 4.' }
    ],
    listen: { artist: 'Atahualpa Yupanqui', work: 'Chacarera de las piedras' }
  },
  {
    id: 'latam-tango-marcato',
    style: 'latam',
    name: 'Tango marcato and arrastre',
    focus: 'rhythm',
    level: 2,
    minutes: 8,
    goal: 'Accompany Am–E7 in tango marcato in 4 and in 2, add arrastre drags and the 3+3+2 accent.',
    why: 'Tango accompaniment changes feel constantly while the chords stay simple. Practising each articulation on the same progression builds a palette rather than one strum.',
    backing: { groove: 'tango', bars: ['Am', 'E7', 'E7', 'Am'] },
    tempo: [80, 130],
    steps: [
      'Strike with short downstrokes and release the left hand right after each one.',
      'Marcato is heavy and detached; think of a bandoneón section.',
      'Keep the tempo steady through the changes in articulation.'
    ],
    variations: [
      { name: 'Marcato in 4', how: 'Four equal, heavy, short chords per bar.' },
      { name: 'Marcato in 2', how: 'Strong on 1 and 3, lighter on 2 and 4.' },
      { name: 'Arrastre', how: 'Drag into beat 1: slide up the bass string from a few frets below on the last eighth of the bar so the root arrives on the beat.' },
      { name: '3+3+2', how: 'Accents on 1, the “and” of 2 and 4, as in the habanera’s bass.' }
    ],
    listen: { artist: 'Juan D’Arienzo', work: 'La Cumparsita' }
  },
  {
    id: 'latam-chromatic-line',
    style: 'latam',
    name: 'Descending chromatic line in A minor',
    focus: 'harmony',
    level: 2,
    minutes: 8,
    goal: 'Play the line A–G♯–G–F♯–F–E under and inside A minor chords, ending on E7.',
    why: 'Chromatic bass lines over a minor chord are everywhere in tango and Latin American song. Hearing the line alone, then inside the chord, connects voice leading to the shapes you already know.',
    backing: { groove: 'tango', bars: ['Am', 'Ammaj7', 'Am7', 'Am6', 'F', 'E7'] },
    tempo: [70, 120],
    steps: [
      'The backing holds A in the bass under the first four chords while the line moves above it.',
      'Learn the line alone, one note per bar.',
      'Then keep the Am shape (x-0-2-2-1-0) and move only one note: string 3 frets 2, 1, 0, then F♯ on string 4 fret 4.',
      'Finish with F (x-x-3-2-1-1) and E7 (0-2-0-1-0-0).'
    ],
    variations: [
      { name: 'The line alone', how: 'One whole note per bar on the bass strings.', bars: P('45:w | 44:w | 43:w | 42:w | 41:w | 40:w'), time: '4/4', key: 'Am' },
      { name: 'Inside the chord', how: 'Strum the chords with the moving note on string 3 (then 4) clearly louder.' },
      { name: 'Arpeggio p-i-m-a', how: 'Thumb on the bass, then i-m-a on the top strings, two groups per bar.' },
      { name: 'With marcato', how: 'Four short marcato strokes per bar, the moving voice on top.' }
    ],
    listen: { artist: 'Astor Piazzolla', work: 'Libertango' }
  },
  {
    id: 'latam-milonga-bass',
    style: 'latam',
    name: 'Milonga bass with a melody on top',
    focus: 'technique',
    level: 3,
    minutes: 10,
    goal: 'Keep a 3+3+2 milonga bass in the thumb on Em–B7 while the fingers play a melody.',
    why: 'In the milonga campera of Yupanqui and others the guitar plays bass and melody at once. Learning the bass to automaticity, then adding the melody in stages, is part–whole practice for independence.',
    backing: { groove: 'tango', bars: ['Em', 'B7'] },
    tempo: [60, 100],
    steps: [
      'Thumb on strings 6 to 4, fingers on strings 1 to 3.',
      'The bass groups eight eighth notes as 3+3+2.',
      'Learn the bass until you can talk while playing it.',
      'Then add the melody one bar at a time.'
    ],
    variations: [
      { name: 'Bass alone', how: 'E–B–E over Em, B–F♯–B over B7.', bars: P('40:q. 47:q. 52:q | 47:q. 42:q. 47:q'), time: '4/4', key: 'Em' },
      { name: 'Melody alone', how: 'The top line on strings 1 and 2.', bars: P('r:8 71:8 72:8 71:8 67:q 64:q | r:8 66:8 67:8 66:8 63:q 59:q'), time: '4/4', key: 'Em' },
      { name: 'Bass and melody', how: 'Both together: the thumb never waits for the fingers.' },
      { name: 'Melody in thirds', how: 'Add a third below each melody note on the next string down.' }
    ],
    listen: { artist: 'Atahualpa Yupanqui', work: 'Milonga del peón de campo' }
  }
];
