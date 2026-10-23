/* World Woodshed — style drills: Cuba, Brazil, flamenco, Hindustani, Carnatic, Arab world, Turkey & the Balkans,
   West Africa, Central & East Africa, gypsy jazz, jazz, Latin America.
   Phrases are written in a short form and expanded below: 'midi:dur' tokens, '.' after the duration for a dot,
   'b' or '#' after the pitch to spell a chromatic note as a flat or a sharp, 'r' for a rest, '|' between bars.
   Pitches are sounding MIDI (guitar range 40–88). */

const P = s => s.trim().split('|').map(bar => bar.trim().split(/\s+/).map(tok => {
  const [m0, d0] = tok.split(':');
  const dot = d0.endsWith('.'), sp = /[b#]$/.test(m0) ? m0.slice(-1) : null, m = sp ? m0.slice(0, -1) : m0;
  const n = { m: m === 'r' ? null : Number(m), d: dot ? d0.slice(0, -1) : d0 };
  if (dot) n.dot = true;
  if (sp) n.sp = sp;
  return n;
}));

export default [
  /* ====================== CUBA ====================== */
  /* One written 4/4 bar is one full round of son clave, counted as the app's clave grid counts it:
     1 e & a 2 e & a 3 e & a 4 e & a, clave on 1, a of 1, & of 2, & of 3 and 4. */
  {
    id: 'cuba-tumbao-clave',
    style: 'cuba',
    name: 'Tumbao bass against son clave',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Play the son bass line (the tumbao) on the low strings while the backing plays the clave.',
    why: 'The son bass never plays on 1. It plays just before each chord change, so the music seems to lean forward. You keep the rhythm the same and change the notes, so you learn the feel instead of one finger pattern.',
    backing: { rhythm: 'son32' },
    tempo: [70, 110],
    steps: [
      'Count every bar as 1 e & a 2 e & a 3 e & a 4 e & a. One bar is one round of the clave.',
      'The clave plays on 1, the a of 1, the & of 2, the & of 3 and 4. Clap it once with the backing.',
      'Play variation 1: only the & of 2 and the & of 4, with your thumb.',
      'Then variation 2: add the a of 1 and the a of 3. You never play on 1 or 3.',
      'Tap your foot on 1, 2, 3 and 4 the whole time, so you still feel the 1 you skip.',
      'Some teachers count the same clave twice as slowly, over two bars: 1, 2 &, 4, then 2, 3. It is the same rhythm.'
    ],
    variations: [
      {
        name: 'Anticipation only',
        how: 'Two notes per bar: one on the & of 2 and one on the & of 4. Bar 1 is F, then G. Bar 2 is F, then C. The chords change every two beats (C, F, G, F) but the backing has no chords; your notes arrive just before each change.',
        bars: P('r:q. 41:8 r:q. 43:8 | r:q. 41:8 r:q. 48:8'),
        time: '4/4', key: 'C',
        positions: [[6, 1], [6, 3], [5, 3]]
      },
      {
        name: 'Fifth, then anticipation',
        how: 'Four notes per bar, on the a of 1, the & of 2, the a of 3 and the & of 4. In each pair, the first note is the fifth of the chord you are on and the second is the root of the next chord.',
        bars: P('r:8. 43:8. 41:8 r:8. 48:8. 43:8 | r:8. 50:8. 41:8 r:8. 48:8. 48:8'),
        time: '4/4', key: 'C'
      },
      {
        name: 'Root, then anticipation',
        how: 'Same counts as variation 2, but the first note of each pair is the root of the chord you are on. Hear how much heavier it sounds.',
        bars: P('r:8. 48:8. 41:8 r:8. 41:8. 43:8 | r:8. 43:8. 41:8 r:8. 41:8. 48:8'),
        time: '4/4', key: 'C'
      },
      {
        name: 'Thumb tumbao, fingers with the clave',
        how: 'Your thumb keeps variation 2 going. Your fingers pluck a short F chord on the top three strings (frets 2, 1, 1) on the & of 3 and on 4, together with the clave.',
        grid: { rows: { thumb: '...x..x....x..x.', fingers: '..........x.x...' } }
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
    goal: 'Play a short repeating tres line (a guajeo) in octaves on strings 1 and 3, with a note on every clave hit.',
    why: 'The Cuban tres doubles its lines in octaves, and its line only works if it agrees with the clave. You change one thing at a time, so your hands and your ear both learn where the clave sits.',
    backing: { groove: 'son', bars: ['C F', 'G7 F'] },
    tempo: [70, 105],
    steps: [
      'This is a practice guajeo, built the way tres parts are built: short, repeated and fitted to the clave.',
      'Count every bar as 1 e & a 2 e & a 3 e & a 4 e & a. One written bar is one round of the clave; the chord changes on 3.',
      'Learn the top line alone on string 1. Then add the same notes on string 3, three frets lower, and mute string 2 with the side of your finger.',
      'Pick down on the numbers and &s, up on the e and a counts. On a rest, keep the pick moving but miss the strings.',
      'Play it for a full minute without changing anything before you move on.'
    ],
    variations: [
      {
        name: 'Top line only',
        how: 'Single notes on string 1. In bar 1, a note lands on all five clave hits; the grid shows them lined up.',
        bars: P('72:16 r:16 76:16 72:16 r:16 76:16 72:8 r:16 69:16 72:16 r:16 69:16 70b:16 69:8 | 71:16 r:16 74:16 71:16 r:16 74:16 71:8 r:16 72:16 69:16 r:16 72:16 69:16 67:8'),
        time: '4/4', key: 'C'
      },
      {
        name: 'In octaves',
        how: 'The same line, with each note also played on string 3, three frets lower. The marks show the C pair (strings 1 and 3, frets 8 and 5) and the E pair (frets 12 and 9).',
        bars: P('72:16 r:16 76:16 72:16 r:16 76:16 72:8 r:16 69:16 72:16 r:16 69:16 70b:16 69:8 | 71:16 r:16 74:16 71:16 r:16 74:16 71:8 r:16 72:16 69:16 r:16 72:16 69:16 67:8'),
        time: '4/4', key: 'C',
        positions: [[1, 8], [3, 5], [1, 12], [3, 9]]
      },
      {
        name: 'In thirds',
        how: 'Keep the rhythm. Under each top note, add the chord note a third below it on string 2, as a second tres or a piano often does.'
      },
      {
        name: 'Backwards on purpose',
        how: 'For one round, start the line from the & of 3 (its second half) so it no longer matches the clave. Hear the clash, then put it back.'
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
    goal: 'Learn a short chorus line (the coro) by ear, then answer it with your own short improvised line (the pregón).',
    why: 'Late in a son song, a fixed chorus and an improvising lead singer take turns. Learning the chorus by ear and answering it with a few rules trains your ear and your ideas together.',
    backing: { groove: 'son', bars: ['C F', 'G7 F'] },
    tempo: [70, 100],
    steps: [
      'Set “Change variation every” to never while you learn the coro, then let it change.',
      'Press Hear the phrase without looking at the staff. Sing it back twice.',
      'Find it on the guitar by ear, then check it against the notation.',
      'Take turns: play the coro for one round, make up an answer for one round, repeat.',
      'Keep your answer short. Leave a gap before the coro comes back.'
    ],
    variations: [
      {
        name: 'Learn the coro',
        how: 'A practice coro over C, F, G7, F, one round long. Sing it, then play it on strings 1 and 2.',
        bars: P('76:8 76:16 74:16 72:8 r:8 69:8. 72:16 r:q | 74:8 74:16 72:16 71:8 r:8 69:8 67:8 r:q'),
        time: '4/4', key: 'C'
      },
      {
        name: 'Answer with two notes',
        how: 'Make up your answer using only C and E. All the interest has to come from the rhythm and where you start.'
      },
      {
        name: 'Answer in the coro’s rhythm',
        how: 'Keep the coro’s rhythm exactly, but choose new notes from each chord.'
      },
      {
        name: 'Start on the a of 1',
        how: 'Begin every answer on the a of 1 (the second clave hit), never on 1, and stop before the coro returns.'
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
    goal: 'Play each new chord one & early, the way son guitar, bass and piano do.',
    why: 'In son the next chord arrives early, on the & just before the change, and rings over it. The backing changes exactly on time, so you can hear how early you are.',
    backing: { groove: 'son', bars: ['Dm F', 'Gm A7'] },
    tempo: [70, 105],
    steps: [
      'The chords change every two beats, on 1 and on 3: Dm, F, Gm, A7.',
      'Learn the four chords on the top three strings shown in the variations; they sit within two frets of each other.',
      'First play one short chord on each beat, changing exactly on 1 and 3.',
      'Then play each new chord on the & just before: the & of 2 and the & of 4. Let it ring over the 1 or 3.',
      'Keep your hand moving down-up on every count (1 & 2 &) even when you do not strike, so the early chord lands in time.'
    ],
    variations: [
      {
        name: 'On the beat (reference)',
        how: 'Change exactly with the backing, on 1 and 3. The marks show Dm on the top strings.',
        positions: [[3, 7], [2, 6], [1, 5]],
        grid: { rows: { strum: 'x.x.x.x.' } }
      },
      {
        name: 'Every change early',
        how: 'Strike on 2 and 4, and play each new chord on the & of 2 and the & of 4. Do not strike 1 or 3: the early chord is still ringing. The marks show F.',
        positions: [[3, 5], [2, 6], [1, 5]],
        grid: { rows: { strum: '..xX..xX' } }
      },
      {
        name: 'Early into Dm and Gm only',
        how: 'Play Dm and Gm early, on the & of 4 of the bar before. Play F and A7 on time, on 3. The marks show Gm.',
        positions: [[3, 7], [2, 8], [1, 6]],
        grid: { rows: { strum: '..x.x.xX' } }
      },
      {
        name: 'Early changes with a strum',
        how: 'Strum muted down-up eighths. Let the chord sound loud only on the & of 2 and the & of 4, which is where each new chord comes in. The marks show A7.',
        positions: [[3, 6], [2, 8], [1, 5]],
        grid: { rows: { strum: 'xxxXxxxX' } }
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
    goal: 'Play Dm9, G13, Cmaj9 and A7♭9 in the bossa rhythm, with the thumb on the bass and a top note that moves one step at a time.',
    why: 'Bossa guitar changes one note of the chord at a time while the others stay put. You build the chords up in stages (three notes, then four, then the top line) so you learn to hear the notes inside the chord.',
    backing: { groove: 'bossa', bars: ['Dm9', 'G13', 'Cmaj9', 'A7b9'] },
    tempo: [70, 130],
    steps: [
      'Learn the four shapes slowly without the backing, saying each top note as you play it.',
      'Count every bar as 1 e & a 2 e & a 3 e & a 4 e & a.',
      'Thumb on the bass string on 1, the & of 2, 3 and the & of 4. It never changes.',
      'Fingers (index, middle, ring) pluck the upper strings together on 1, the a of 1, the & of 2, the & of 3 and the e of 4. These are the same counts as the clave in the backing.',
      'Learn thumb and fingers separately first, then together, slowly.',
      'Listen to the top note as a melody: E, E, D, C♯.'
    ],
    variations: [
      {
        name: 'Shells first',
        how: 'Three notes only: thumb on the root, two fingers on the 3rd and 7th. The marks show Dm7 as D, F and C.',
        positions: [[5, 5], [4, 3], [3, 5]],
        grid: { rows: { thumb: 'x.....x.x.....x.', fingers: 'x..x..x...x..x..' } }
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
        how: 'Play the last finger stroke of each bar (the e of 4) already as the next chord. The thumb stays on the old bass note until 1.',
        grid: { rows: { thumb: 'x.....x.x.....x.', fingers: 'x..x..x...x..X..' } }
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
    goal: 'Keep a steady samba bass in your thumb, louder on 2, while your fingers play short chords between the thumb notes.',
    why: 'Samba guitar is two parts in one hand: the thumb copies the big bass drum (the surdo) and the fingers copy the small drums. You move the finger part while the thumb stays the same, so the two hands learn to work on their own.',
    backing: { rhythm: 'samba' },
    tempo: [70, 100],
    steps: [
      'The backing is two short bars of 2 beats. Count each bar “1 e & a 2 e & a”. The bass drum hits hard on 2.',
      'Hold Am7 at the 5th fret (5-x-5-5-5-x) for the whole drill.',
      'Thumb on 1 and 2 only: string 6 on 1 (soft), string 4 on 2 (loud).',
      'Add the finger part from each variation. If the thumb speeds up or drifts, go back to the thumb alone.'
    ],
    variations: [
      {
        name: 'Thumb alone',
        how: 'Thumb only: soft on 1, loud on 2, with the bass drum.',
        positions: [[6, 5], [4, 5], [3, 5], [2, 5]],
        grid: { time: '2/4', bars: 2, rows: { thumb: 'x...X...x...X...' } }
      },
      {
        name: 'Fingers on every “a”',
        how: 'Fingers pluck the chord on the a of 1 and the a of 2, just before each thumb note.',
        grid: { time: '2/4', bars: 2, rows: { thumb: 'x...X...x...X...', fingers: '...x...x...x...x' } }
      },
      {
        name: 'Fingers on “e” and “a”',
        how: 'Fingers on every e and every a, so they never play together with the thumb.',
        grid: { time: '2/4', bars: 2, rows: { thumb: 'x...X...x...X...', fingers: '.x.x.x.x.x.x.x.x' } }
      },
      {
        name: 'The bossa figure',
        how: 'Fingers on 1, the a of 1 and the & of 2 in bar 1, then the & of 1 and the e of 2 in bar 2. João Gilberto took this samba figure and made it the bossa nova beat.',
        grid: { time: '2/4', bars: 2, rows: { thumb: 'x...X...x...X...', fingers: 'x..x..x...x..x..' } }
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
    goal: 'Play fast even notes (four per beat) through the chords of G, G♯dim7, Am7 and D7, the way choro melodies move.',
    why: 'Choro melodies are mostly chord notes played one at a time, with extra notes a half step below. You change one thing at a time (direction, extra notes), so the line stays flexible instead of memorised.',
    backing: { click: { beats: 2, sub: 2 } },
    tempo: [60, 100],
    steps: [
      'Learn the plain arpeggios first at a tempo where every note is even.',
      'Each bar is two beats. Count it “1 e & a 2 e & a”: one note on every count.',
      'Pick down-up all the way through, all notes the same loudness.',
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
        how: 'After the four bars, answer with a bass run on strings 5 and 6, as the 7-string guitar does in choro (a baixaria): D, C, B, A, G, one note per count, then start the line again.'
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
    goal: 'Play short phrases from northeast Brazil over D7 that use G♯ and C, the two notes that give baião its sound.',
    why: 'Baião and forró melodies use a scale with a raised 4th (G♯ over D) and a lowered 7th (C). Playing the same phrase in two octaves and then making up your own answer turns the scale into phrases you can use.',
    backing: { groove: 'drone', bars: ['D7'] },
    tempo: [70, 110],
    steps: [
      'Play D Lydian dominant once up and down: D E F♯ G♯ A B C D.',
      'Learn the first phrase and sing it; notice the G♯ resolving to A.',
      'Play each phrase twice in a row, then rest for one round.',
      'Each bar is two beats: count “1 & 2 &”. Keep the eighths even, not swung.'
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
    goal: 'Play the 12-count soleá rhythm (its compás) on E and F, loud on 3, 6, 8, 10 and 12.',
    why: 'Keeping the 12-count rhythm is the first thing a flamenco teacher checks. The chords stay the same while your strumming hand changes, so the loud counts get into your body before you add harder techniques.',
    backing: { rhythm: 'solea' },
    grid: { time: '12/4', count: '1 2 3 | 4 5 6 | 7 8 | 9 10 | 11 12' },
    tempo: [90, 160],
    steps: [
      'Count 1 to 12 out loud with the backing before you play. The loud counts are 3, 6, 8, 10 and 12.',
      'Chords: E on counts 1 to 7, F on 8 and 9, E again on 10 to 12.',
      'Play F as x-3-3-2-1-0, letting the open top string ring.',
      'Strum on every count, and make 3, 6, 8, 10 and 12 clearly louder.',
      'Keep counting out loud for the whole drill.'
    ],
    variations: [
      {
        name: 'Strokes on the accents',
        how: 'A loud index-finger downstroke on 3, 6, 8, 10 and 12. A soft thumb stroke on every other count.',
        positions: [[6, 0], [5, 2], [4, 2], [3, 1], [2, 0], [1, 0]],
        grid: { rows: { index: '..X..X.X.X.X', thumb: 'xx.xx.x.x.x.' } }
      },
      {
        name: 'Rasgueado on 3 and 6',
        how: 'On 3 and 6, play a rasgueado instead of one stroke: flick out the little, ring, middle and index fingers one after another, so the last one lands exactly on the count.',
        grid: { rows: { roll: '..X..X......', strum: 'xx.xx.xXxXxX' } }
      },
      {
        name: 'Close on 10',
        how: 'A rasgueado (finger roll) on 10, then lay your fretting hand flat on the strings so 11 is silent. A light stroke on 12.',
        grid: { rows: { roll: '.........X..', strum: 'xxXxxXxXx..x' } }
      },
      {
        name: 'Add golpe',
        how: 'On each loud count, tap the guitar top below the strings (the golpe) with your ring finger at the same moment as the strum.',
        grid: { rows: { strum: 'xxXxxXxXxXxX', tap: '..x..x.x.x.x' } }
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
    goal: 'Play fast single-note runs (picado) with index and middle fingers that end on E exactly when the E chord arrives.',
    why: 'A fast run only works if it ends on time on the chord. You change the shape of the run while the last note stays the same, which trains your hand and your ear together.',
    backing: { groove: 'flamenco', bars: ['Am', 'G', 'F', 'E'] },
    tempo: [70, 120],
    steps: [
      'Alternate index and middle fingers. After each note, let the finger come to rest on the next string down (a rest stroke).',
      'Practise each variation without the backing first at half tempo.',
      'Plant the thumb on string 6 for stability on the higher runs.',
      'Count “1 & 2 & 3 & 4 &” for eighths, “1 e & a” for the fast ones. The last note must land on 1 or 3 of the E bar; land it, then stop.'
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
        how: 'Four notes per beat, in groups of four, each group starting one note lower. Play it over the F and E bars.',
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
        how: 'Play the descending fours, but make every third note loud. The loud notes move around inside the groups of four.',
        grid: { rows: { accent: 'X..X..X..X..X..X' } }
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
    why: 'These four chords, falling to A, are home for bulerías and many flamenco melodies. Playing them in different ways teaches you the neck instead of one set of shapes.',
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
        how: 'Thumb plays the bass note on 1. Index finger strums on 1, 2, the & of 2, 3 and 4, loud on 1 and 3, like the backing.',
        grid: { rows: { thumb: 'x.......', index: 'X.xxX.x.' } }
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
        how: 'Count “1 & 2 & 3 & 4 &”. Thumb on the bass note on 1 and 3; index, middle, index on strings 3, 2, 3 on the counts between.',
        grid: { rows: { thumb: 'x...x...', fingers: '.xxx.xxx' } }
      },
      {
        name: 'Rasgueado on the change',
        how: 'On 1 of each new chord, a rasgueado (flick out little, ring, middle and index fingers in turn). Single strokes on 2, 3 and 4.'
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
    goal: 'Keep the fast 12-count bulerías rhythm going on A and B♭, and end a phrase on 10 with silence on 11.',
    why: 'Bulerías is the soleá cycle played fast. Players and dancers end a phrase with a sharp hit on 10 (the cierre, “closing”). Changing what you leave out trains the cycle, not just the strokes.',
    backing: { rhythm: 'solea' },
    grid: { time: '12/4', count: '1 2 3 | 4 5 6 | 7 8 | 9 10 | 11 12' },
    tempo: [160, 240],
    steps: [
      'Count 1 to 12 with the backing, like soleá. Bulerías players start each phrase on 12, the last count, so your first strum is on 12.',
      'Chords: A from 12 to 6, B♭ on 7 and 8, A on 9 and 10, nothing on 11.',
      'Loud on 12, 3, 6, 8 and 10.',
      'Start at the low tempo. Bulerías has to feel relaxed before it can be fast.'
    ],
    variations: [
      {
        name: 'Basic compás',
        how: 'A strum on every count, loud on 12, 3, 6, 8 and 10. On 11, lay your fretting hand on the strings so nothing sounds.',
        grid: { rows: { strum: 'xxXxxXxXxX.X' } }
      },
      {
        name: 'Accents only',
        how: 'Strum only on 12, 3, 6, 8 and 10. Count the gaps out loud.',
        grid: { rows: { strum: '..X..X.X.X.X' } }
      },
      {
        name: 'Cierre',
        how: 'A sharp rasgueado (finger roll) on 10, then both hands stop the strings so 11 is truly silent. Start again on 12.',
        grid: { rows: { strum: 'xxXxxXxXx..X', roll: '.........X..' } }
      },
      {
        name: 'Contratiempo',
        how: 'From 1 to 6, strum only on the “&” between the counts, like handclaps between the beats. Then go back to strumming on 8 and 10.',
        grid: { count: '1 & 2 & 3 & | 4 & 5 & 6 & | 7 & 8 & | 9 & 10 & | 11 & 12 &', rows: { strum: '.x.x.x.x.x.x..X...X.....' } }
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
    why: 'A raga is a set of typical phrases, not just a scale. Playing a few of them slowly against the drone trains your ear to hear every note against Sa, the home note.',
    backing: { groove: 'drone', bars: ['C'] },
    tempo: [50, 80],
    steps: [
      'Sa (the home note, the drone) is C. Bhupali uses five notes: Sa Re Ga Pa Dha, which here are C D E G A.',
      'Hold each long note until it stops beating against the drone.',
      'Slide between notes on one string where you can, rather than changing strings.',
      'Sing the sargam names as you play: Sa Re Ga Pa Dha.'
    ],
    variations: [
      {
        name: 'Aroha and avaroha',
        how: 'Up the scale and back down, one note per beat: C D E G A C, then C A G E D C.',
        bars: P('60:q 62:q 64:q 67:q | 69:q 72:h. | 72:q 69:q 67:q 64:q | 62:q 60:h.'),
        time: '4/4', key: 'C'
      },
      {
        name: 'G R S, D̤ S',
        how: 'E, D, C, then dip down to the low A and back up to C. Slide from D to C.',
        bars: P('64:h 62:q 60:q | 57:q 60:h.'),
        time: '4/4', key: 'C'
      },
      {
        name: 'G P D Ṡ and back',
        how: 'Climb E G A to the high C, then come back down to D and C.',
        bars: P('64:q 67:q 69:q 72:q | 72:h 69:8 67:8 64:q | 62:q 64:q 62:q 60:q | 60:w'),
        time: '4/4', key: 'C'
      },
      {
        name: 'Lower octave',
        how: 'Start from the low G and A, rise to E, then settle on C.',
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
    goal: 'Play a short phrase three times so that its very last note lands on beat 1 of the 16-beat cycle (sam).',
    why: 'This three-times phrase (a tihai) is how Hindustani musicians end a passage on beat 1. Working out where to start for different phrases trains the counting and the feel of the cycle together.',
    backing: { rhythm: 'teental' },
    grid: { count: ['1 & 2 & 3 & 4 &', '5 & 6 & 7 & 8 &', '9 & 10 & 11 & 12 &', '13 & 14 & 15 & 16 &'] },
    tempo: [60, 120],
    steps: [
      'The cycle (teental) has 16 beats. Clap on 1, 5 and 13; on 9, wave your hand instead (that beat is called khali, “empty”).',
      'Each written bar is 4 beats, so bars 1 to 4 are beats 1 to 16. Bar 5 is beat 1 of the next cycle, where you land.',
      'To find the start: add up the phrase three times plus the two gaps. Count back that many beats from the next 1, and add 1. Each variation gives the answer.',
      'The notes are C D E F♯ G A B. Every phrase ends on C (Sa).',
      'Say the beat numbers while you play, and play the last C clearly louder.'
    ],
    variations: [
      {
        name: 'P 3, gap 1: start on 7',
        how: 'E D C, then one beat of rest, three times. Start on beat 7: E D C rest, E D C rest, E D C, and the last C is beat 1.',
        bars: P('r:w | r:q r:q 64:q 62:q | 60:q r:q 64:q 62:q | 60:q r:q 64:q 62:q | 60:q r:q r:h'),
        time: '4/4', key: 'C'
      },
      {
        name: 'P 5, no gap: start on 3',
        how: 'B D E D C, three times with no rest. Start on beat 3.',
        bars: P('r:h 59:q 62:q | 64:q 62:q 60:q 59:q | 62:q 64:q 62:q 60:q | 59:q 62:q 64:q 62:q | 60:q r:q r:h'),
        time: '4/4', key: 'C'
      },
      {
        name: 'P 4, gap 2: start on 2',
        how: 'F♯ E D C, then two beats of rest, three times. Start on beat 2.',
        bars: P('r:q 66:q 64:q 62:q | 60:q r:q r:q 66:q | 64:q 62:q 60:q r:q | r:q 66:q 64:q 62:q | 60:q r:q r:h'),
        time: '4/4', key: 'C'
      },
      {
        name: 'Dugun: P 5 at double speed',
        how: 'B D E D C at double speed (two notes per beat), three times. Start on the & of 10.',
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
    goal: 'Play the two flat notes of raga Bhairav (D♭ and A♭) with a slow, small sway (andolan) that never reaches the next fret.',
    why: 'In Bhairav the flat 2nd and flat 6th are not plain notes: they sway slowly. You practise the sway on each note alone before you put it back in a phrase.',
    backing: { groove: 'drone', bars: ['C'] },
    tempo: [40, 70],
    steps: [
      'Sa (the home note) is C. Bhairav: C D♭ E F G A♭ B.',
      'The sway: push the string a little sideways and let it back, slower than vibrato, about once per beat. Never bend it as far as the next fret.',
      'Tune by ear: the swaying note should keep sounding like komal Re or komal Dha, never like the note above.',
      'Play other notes plain so the andolan stands out.'
    ],
    variations: [
      {
        name: 'G M d, P',
        how: 'E, F, then a long A♭ with the sway, ending on G.',
        bars: P('64:q 65:q 68:h | 67:w'),
        time: '4/4', key: 'C', spell: 'b'
      },
      {
        name: 'G M r, S',
        how: 'E, F, then a long D♭ with the sway, ending on C.',
        bars: P('64:q 65:q 61:h | 60:w'),
        time: '4/4', key: 'C', spell: 'b'
      },
      {
        name: 'The full movement',
        how: 'C E F G, A♭ G, E F D♭ C: sway on the A♭ and the D♭.',
        bars: P('60:q 64:q 65:q 67:q | 68:h 67:h | 64:q 65:q 61:h | 60:w'),
        time: '4/4', key: 'C', spell: 'b'
      },
      {
        name: 'Upper tetrachord',
        how: 'A♭ B C, C B A♭ G: sway on the A♭ each time.',
        bars: P('68:h 71:q 72:q | 72:q 71:q 68:h | 67:w'),
        time: '4/4', key: 'C', spell: 'b'
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
    why: 'Hindustani music is taught by ear, teacher to student. Naming the notes before you play them ties your ear to the fretboard.',
    backing: { groove: 'drone', bars: ['C'] },
    tempo: [50, 80],
    steps: [
      'Sa (the home note) is C. Raga Kafi: C D E♭ F G A B♭, sung as Sa Re ga ma Pa Dha ni.',
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
    goal: 'Play a Carnatic beginner exercise (janta varisai: every note played twice) at three speeds over the 8-beat cycle.',
    why: 'This is one of the first exercises in the traditional Carnatic course. Playing each note twice trains a clean, even repeat, and changing speed while the cycle stays the same is how the exercises are always practised.',
    backing: { rhythm: 'adi' },
    tempo: [50, 90],
    steps: [
      'The scale (raga Mayamalavagowla) on C: C D♭ E F G A♭ B C.',
      'Keep the 8-beat cycle (adi tala) in your hand: beat 1 clap, beats 2, 3, 4 touch little, ring and middle finger to your thumb, beat 5 clap, 6 wave, 7 clap, 8 wave.',
      'Play C C D♭ D♭ E E F F, G G A♭ A♭ B B C C, then back down.',
      'Make the second note of each pair a little louder than the first.'
    ],
    variations: [
      {
        name: 'First speed',
        how: 'One note per beat. The whole exercise takes four cycles of 8 beats.',
        bars: P('60:q 60:q 61:q 61:q | 64:q 64:q 65:q 65:q | 67:q 67:q 68:q 68:q | 71:q 71:q 72:q 72:q | 72:q 72:q 71:q 71:q | 68:q 68:q 67:q 67:q | 65:q 65:q 64:q 64:q | 61:q 61:q 60:q 60:q'),
        time: '4/4', key: 'C', spell: 'b'
      },
      {
        name: 'Second speed',
        how: 'Two notes per beat (count “1 & 2 &”). The exercise fits in two cycles.',
        bars: P('60:8 60:8 61:8 61:8 64:8 64:8 65:8 65:8 | 67:8 67:8 68:8 68:8 71:8 71:8 72:8 72:8 | 72:8 72:8 71:8 71:8 68:8 68:8 67:8 67:8 | 65:8 65:8 64:8 64:8 61:8 61:8 60:8 60:8'),
        time: '4/4', key: 'C', spell: 'b'
      },
      {
        name: 'Third speed',
        how: 'Four notes per beat (count “1 e & a”). The exercise fits in one cycle.',
        bars: P('60:16 60:16 61:16 61:16 64:16 64:16 65:16 65:16 67:16 67:16 68:16 68:16 71:16 71:16 72:16 72:16 | 72:16 72:16 71:16 71:16 68:16 68:16 67:16 67:16 65:16 65:16 64:16 64:16 61:16 61:16 60:16 60:16'),
        time: '4/4', key: 'C', spell: 'b'
      },
      {
        name: 'Sphuritam',
        how: 'At the second speed, play the second note of each pair as a quick hammer-on from one fret lower. This little flick (sphuritam) is the ornament these repeated notes carry.'
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
    goal: 'Keep the 8-beat cycle steady while you split each beat into 3, 4, 5 or 7 even notes, first speaking the syllables, then playing them.',
    why: 'Carnatic rhythm changes how many notes fit in a beat (the nadai) while the beat itself stays the same. Saying the syllables first and then playing ties the count to your body.',
    backing: { rhythm: 'adi' },
    tempo: [50, 80],
    steps: [
      'Keep the beat with your foot or your hand the whole time. The backing claps beats 1, 5 and 7.',
      'Say the syllables for one cycle, then play them on one note for one cycle.',
      'Make the first syllable of each beat louder, so every group starts with the beat.',
      'When one speed is solid, play up and down a scale in it instead of one note.'
    ],
    variations: [
      { name: 'Threes', how: 'Say “ta-ki-ta” on every beat: three even notes per beat, 24 per cycle.' },
      { name: 'Fours', how: 'Say “ta-ka-di-mi” on every beat: four even notes per beat, 32 per cycle.' },
      { name: 'Fives', how: 'Say “ta-di-gi-na-thom” on every beat: five even notes per beat, 40 per cycle.' },
      { name: 'Sevens', how: 'Say “ta-ki-ta ta-ka-di-mi” on every beat: seven even notes per beat, 56 per cycle.' },
      { name: 'Switch every two beats', how: 'Beats 1 and 2 in threes, 3 and 4 in fours, 5 and 6 in fives, 7 and 8 in fours. Keep the beat steady through the changes.' }
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
    goal: 'Play one short phrase four ways: plain, sliding up into each note, sliding down into each note, and with a fast wobble.',
    why: 'In Carnatic music the ornament (gamaka) is part of the note itself. You add one kind of ornament at a time to the same phrase, so each motion is clear before you mix them.',
    backing: { groove: 'drone', bars: ['C'] },
    tempo: [50, 80],
    steps: [
      'The raga (Hamsadhwani) on C uses five notes: C D E G B. Sing the phrase first.',
      'These are the basic motions; in a real raga each note has its own habits, so learn them from recordings.',
      'Slides: one finger, keep pressure, arrive in tune.',
      'Wobble (kampita): push the string up toward the next note and back, two or three times per beat.'
    ],
    variations: [
      { name: 'Plain', how: 'No gamaka at all, for reference.', bars: P('60:q 62:q 64:q 67:q | 71:q 72:h.'), time: '4/4', key: 'C' },
      { name: 'Slide up into each note', how: 'Slide into each note from the scale note below it.', bars: P('60:q 62:q 64:q 67:q | 71:q 72:h.'), time: '4/4', key: 'C' },
      { name: 'Slide down into each note', how: 'Going down, slide into each note from the one above it.', bars: P('72:q 71:q 67:q 64:q | 62:q 60:h.'), time: '4/4', key: 'C' },
      { name: 'Wobble on E and B', how: 'Wobble the long E and B toward the note above. Play G and C plain.', bars: P('64:h 67:h | 71:h 72:h'), time: '4/4', key: 'C' }
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
    goal: 'Play a phrase three times, with gaps, so that its last note lands exactly on beat 1 of the 8-beat cycle.',
    why: 'This three-times ending (a mora) is how Carnatic musicians finish an improvisation. Working it out and then feeling it for different phrase lengths builds the skill from several sides.',
    backing: { rhythm: 'adi' },
    grid: { count: ['1 e & a 2 e & a 3 e & a 4 e & a', '5 e & a 6 e & a 7 e & a 8 e & a'] },
    tempo: [50, 80],
    steps: [
      'Count four syllables per beat, “ta ka di mi”, so one cycle of 8 beats is 32 syllables. The grid writes them 1 e & a.',
      'The five-note phrase is E D C B C (say ta-di-gi-na-thom). The seven-note phrase is D E G E D B C (ta-ka-di-mi-ta-ki-ta).',
      'The grid shows where to start. The last note lands on beat 1 of the next cycle (bar 3 in the grid).',
      'Speak it first, then play it, keeping the beat in your hand.'
    ],
    variations: [
      { name: 'Five, gap three', how: 'The five-note phrase, three syllables of rest, three times. Start on beat 4.',
        grid: { bars: 3, rows: { you: '............xxxxx...xxxxx...xxxxX...............' } } },
      { name: 'Seven, gap two', how: 'The seven-note phrase, two syllables of rest, three times. Start on beat 3.',
        grid: { bars: 3, rows: { you: '........xxxxxxx..xxxxxxx..xxxxxxX...............' } } },
      { name: 'Five, gap one', how: 'The five-note phrase, one syllable of rest, three times. Start on beat 5.',
        grid: { bars: 3, rows: { you: '................xxxxx.xxxxx.xxxxX...............' } } },
      { name: 'Five, gap three, in threes', how: 'Now three syllables per beat, “ta ki ta”, so 24 per cycle. The same phrase and gaps start on the second syllable of beat 2.',
        grid: { bars: 3, count: ['1 & a 2 & a 3 & a 4 & a', '5 & a 6 & a 7 & a 8 & a'], rows: { you: '....xxxxx...xxxxx...xxxxX...........' } } }
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
    goal: 'Play the Arabic rhythm maqsum on the guitar: low “dum” notes on a bass string and short “tek” chops on the high strings.',
    why: 'Arabic rhythms are a few main strokes that players fill in. The main strokes stay the same while you change the fill and the notes, so they get solid.',
    backing: { rhythm: 'maqsum' },
    tempo: [80, 120],
    steps: [
      'Count “1 & 2 & 3 & 4 &”. Dum is on 1 and 3. Tek is on the & of 1, the & of 2 and 4.',
      'Say it with the backing: “dum tek – tek dum – tek –”.',
      'Dum: the open D string, with your thumb or a downstroke. Tek: a short stroke on the top strings with your palm resting on them, so it clicks.',
      'Play the skeleton for a minute before trying any fill.',
      'Fills are always softer than the skeleton.'
    ],
    variations: [
      { name: 'Main strokes only', how: 'Dum on 1 and 3. Tek on the & of 1, the & of 2 and 4. Nothing else.',
        grid: { backing: false, rows: { dum: 'x...x...', tek: '.x.x..x.' } } },
      { name: 'Filled', how: 'Add a soft muted tap on each empty count (the & of 3 and the & of 4), so you play every count but only the main strokes are loud.',
        grid: { backing: false, rows: { dum: 'X...X...', tek: '.X.X..X.', soft: '.....x.x' } } },
      {
        name: 'Hijaz on the strokes',
        how: 'Play D on every dum and higher notes on the teks, so the melody follows the rhythm exactly.',
        bars: P('62:8 66:q 67:8 62:q 63b:q | 62:8 63b:q 66:8 62:q 60:q'),
        time: '4/4', key: 'Dm'
      },
      { name: 'Fast picking on the last tek', how: 'Turn the tek on 4 into a quick run of down-up strokes (tremolo), the way an oud player uses the pick.' }
    ]
  },
  {
    id: 'arabic-hijaz-sayr',
    style: 'arabic',
    name: 'Maqam Hijaz: lower jins, ghammaz and upper jins',
    focus: 'melody',
    level: 2,
    minutes: 10,
    goal: 'Play phrases in maqam Hijaz on D: stay low, rest on G, climb higher, and come back to D.',
    why: 'A maqam has a usual path: it stays in its lowest four notes first, rests on a pivot note, and only then moves up. Learning a phrase for each stage gives you the pieces of a free improvisation (taqsim).',
    backing: { groove: 'drone', bars: ['D'] },
    tempo: [50, 80],
    steps: [
      'The lower four notes are D E♭ F♯ G. The pivot note is G.',
      'Above G, use G A B♭ C D.',
      'Play each phrase slowly, then repeat it with a different ornament on the long note.',
      'Always come back down to D by step.'
    ],
    variations: [
      { name: 'The lower four notes', how: 'D E♭ F♯ G and back, resting on G.', bars: P('62:q 63b:8 66:8 67:h | 66:q 63b:q 62:h'), time: '4/4', key: 'Dm' },
      { name: 'From below', how: 'Approach D from C, the note below the tonic, then rise to G.', bars: P('60:8 62:8 63b:8 66:8 67:q 66:8 63b:8 | 62:h. r:q'), time: '4/4', key: 'Dm' },
      { name: 'Up high', how: 'From G up through A B♭ C to the high D, then all the way down.', bars: P('67:8 69:8 70:8 72:8 74:q 72:8 70:8 | 69:8 67:8 66:8 63b:8 62:h'), time: '4/4', key: 'Dm' },
      { name: 'Short taqsim', how: 'Improvise without a beat: stay in the lower four notes, rest on G, go up high once, and come back to D.' }
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
    why: 'Bayati and Kurd differ only in their second note, which in Bayati sits between two frets. Switching between them sharpens your ear far more than playing either one alone.',
    backing: { groove: 'drone', bars: ['Dm'] },
    tempo: [50, 80],
    steps: [
      'The staff shows E♭. For Bayati, bend the E♭ up about a quarter tone, halfway to E.',
      'Play each phrase slowly enough to hear the second note against the drone.',
      'Record yourself or ask someone: which phrase was Bayati?'
    ],
    variations: [
      { name: 'Kurd', how: 'Fretted E♭: D E♭ F G and back.', bars: P('62:q 63:q 65:q 67:q | 65:q 63:q 62:h'), time: '4/4', key: 'Dm', spell: 'b' },
      { name: 'Bayati', how: 'The same phrase with the E♭ bent up a quarter tone.', bars: P('62:q 63:q 65:q 67:q | 65:q 63:q 62:h'), time: '4/4', key: 'Dm', spell: 'b' },
      { name: 'Back to back', how: 'Play the Kurd phrase, then the Bayati phrase, without stopping. Then reverse the order.' },
      { name: 'Bayati from the top', how: 'From G up to C and back down to D, with the half-flat E on the way down.', bars: P('67:q 69:q 70:q 72:q | 70:q 69:q 67:q 65:q | 63:q 62:h.'), time: '4/4', key: 'Dm', spell: 'b' }
    ]
  },
  {
    id: 'arabic-samai-thaqil',
    style: 'arabic',
    name: 'Sama’i thaqil in 10/8',
    focus: 'rhythm',
    level: 3,
    minutes: 10,
    goal: 'Play the 10-count Arabic rhythm sama’i thaqil on the guitar, then fill it in and put a melody on it.',
    why: 'This rhythm carries the sama’i, the main instrumental piece of classical Arabic ensembles. Counting the groups and then filling them in is how Arab percussionists practise.',
    backing: { click: { beats: 10, sub: 1 } },
    grid: { time: '10/8', count: '1 2 3 | 4 5 | 6 7 | 8 9 10' },
    tempo: [120, 200],
    steps: [
      'The click counts 1 to 10; the high click is 1. Count “1 2 3, 4 5, 6 7, 8 9 10”.',
      'Dum on 1, 6 and 7. Tek on 4 and 8. Say “dum – – tek – dum dum tek – –”.',
      'Dum on the open D string. Tek on the top strings with your palm resting on them, so it clicks.'
    ],
    variations: [
      { name: 'Main strokes only', how: 'Only the five strokes, silence on every other count.',
        grid: { rows: { dum: 'x....xx...', tek: '...x...x..' } } },
      { name: 'Count aloud', how: 'Play the main strokes while saying the groups: “1-2-3, 1-2, 1-2, 1-2-3”.',
        grid: { rows: { dum: 'x....xx...', tek: '...x...x..' } } },
      { name: 'Filled', how: 'A soft muted tap on every empty count; the five main strokes stay loud.',
        grid: { rows: { dum: 'X....XX...', tek: '...X...X..', soft: '.xx.x...xx' } } },
      { name: 'Bayati on the strokes', how: 'One note of D Bayati (D, E half-flat, F, G, A) on each of the five strokes, going up for one cycle and down for the next.' }
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
    goal: 'Accompany the Bulgarian dance rhythm rachenitsa (7 fast counts: short, short, long) with bass notes and short chord chops.',
    why: 'Balkan wedding guitar plays these uneven groups like a bass and a snare drum. You change one thing at a time, so the 7-count feel stays solid.',
    backing: { rhythm: 'rachenitsa' },
    grid: { time: '7/8', count: '1 2 | 3 4 | 5 6 7' },
    tempo: [200, 360],
    steps: [
      'Each bar is 7 fast counts in three groups: “1 2, 3 4, 5 6 7”. The tempo number counts every one of the 7.',
      'Use Dm (x-x-0-2-3-1) and A7 (x-0-2-0-2-0).',
      'Start slow enough that the last group clearly sounds longer, not like a mistake.',
      'Tap your foot on 1, 3 and 5 only: quick, quick, slow.'
    ],
    variations: [
      { name: 'Group starts', how: 'One downstroke on 1, 3 and 5. After the third one there is a longer gap.',
        grid: { rows: { strum: 'x.x.x..' } } },
      { name: 'Oom-pa, oom-pa, oom-pa-pa', how: 'A bass note on 1, 3 and 5, and a short chord chop on every other count.',
        grid: { rows: { bass: 'x.x.x..', chop: '.x.x.xx' } } },
      { name: 'Change every bar', how: 'Keep the oom-pa. Play Dm for one bar and A7 for the next, changing on 1.',
        grid: { rows: { bass: 'x.x.x..', chop: '.x.x.xx' } } },
      { name: 'Lift the long beat', how: 'Make 5 loud and let that chord ring through 6 and 7, the way dancers lift on the slow step.',
        grid: { rows: { strum: 'x.x.X--' } } }
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
    goal: 'Add four kinds of quick ornaments, one kind at a time, to a slow line, using hammer-ons, pull-offs and slides.',
    why: 'Clarinet and flute lines in this music are full of fast ornaments. You add one kind at a time to the same line, so each motion gets clean before you mix them.',
    backing: { groove: 'drone', bars: ['E'] },
    tempo: [50, 80],
    steps: [
      'Learn the plain line first. It uses E F G♯ A B C D.',
      'Ornaments are played with the fretting hand only: pick the first note, then hammer on and pull off.',
      'Keep each ornament short and before the beat, so the main note still lands on time.',
      'Stay on one ornament type until it sounds easy.'
    ],
    variations: [
      { name: 'Plain', how: 'The line with no ornaments.', bars: P('69:h 68:q 65:q | 64:w | 65:q 68:q 69:q 71:q | 69:h 64:h'), time: '4/4', key: 'Am' },
      { name: 'Flick up (mordent)', how: 'On each half note: play the note, hammer quickly to the note above, pull back.', bars: P('69:h 68:q 65:q | 64:w | 65:q 68:q 69:q 71:q | 69:h 64:h'), time: '4/4', key: 'Am' },
      { name: 'Trill', how: 'On the long notes, hammer on and pull off to the note above again and again, as fast as you can keep it even.' },
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
    goal: 'Play a phrase that follows the 11-count Bulgarian rhythm kopanitsa: short, short, long, short, short.',
    why: 'In this rhythm the melody has to know where the long beat is. You go from bass notes to the melody and then start it somewhere else, so you learn the groups instead of one fixed line.',
    backing: { rhythm: 'kopanitsa' },
    grid: { count: '1 2 | 3 4 | 5 6 7 | 8 9 | 10 11' },
    tempo: [180, 340],
    steps: [
      'Each bar is 11 fast counts in five groups: “1 2, 3 4, 5 6 7, 8 9, 10 11”. Say “ta-ka ta-ka ta-ki-ta ta-ka ta-ka”.',
      'The tempo number counts every one of the 11. Start slow.',
      'The notes are E F G♯ A B C D.',
      'The long group (5 6 7) is in the middle; lean on it.'
    ],
    variations: [
      { name: 'Bass on the groups', how: 'Low E on 1, 3, 5, 8 and 10, the start of each group.', bars: P('52:q 52:q 52:q. 52:q 52:q'), time: '11/8', key: 'Am' },
      { name: 'The phrase', how: 'Two bars up to the long B and back to E.', bars: P('64:8 65:8 68:8 69:8 71:q. 69:8 68:8 65:8 64:8 | 65:8 68:8 69:8 68:8 65:8 64:8 62:8 64:q r:q'), time: '11/8', key: 'Am' },
      { name: 'Ornament the long note', how: 'Trill the long B in bar 1 (hammer on and pull off to C again and again), stopping exactly on 8.' },
      { name: 'Start in the middle', how: 'Begin the phrase on 5, the long group, instead of on 1, and fit the rest around the cycle.' }
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
    why: 'In Turkish makam Rast, the third note sits a little below the guitar’s fret. Comparing three versions of one note builds a finer ear than learning any one of them.',
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
    goal: 'Play the West African bell pattern with your fingers while your thumb keeps the four main beats.',
    why: 'Everyone in a West African drum group follows the bell. You have to feel the four big beats and the twelve small pulses at the same time. Your thumb holds still while your fingers change, so one hand learns both.',
    backing: { rhythm: 'bembe' },
    grid: { count: '1 2 3 | 4 5 6 | 7 8 9 | 10 11 12' },
    tempo: [70, 110],
    steps: [
      'Count 12 quick pulses per cycle: “1 2 3, 4 5 6, 7 8 9, 10 11 12”. The four main beats are 1, 4, 7 and 10. (The drum grid writes the same 12 as 1 & a 2 & a 3 & a 4 & a.)',
      'Thumb on the four main beats, switching between the open A and E strings.',
      'For the bell, pluck strings 2 and 3 together with the fretting hand resting on them, so they click.',
      'Tap your foot on 1, 4, 7 and 10 the whole time.'
    ],
    variations: [
      { name: 'Thumb alone', how: 'Open A on 1 and 7, open E on 4 and 10.',
        grid: { rows: { thumb: 'x..x..x..x..' } } },
      { name: 'Thumb and bell', how: 'Add the fingers on the seven bell strokes: 1, 3, 5, 6, 8, 10 and 12.',
        grid: { rows: { thumb: 'x..x..x..x..', fingers: 'x.x.xx.x.x.x' } } },
      { name: 'Six against four', how: 'Fingers on every other pulse (1, 3, 5, 7, 9, 11): six even notes against the thumb’s four.',
        grid: { rows: { thumb: 'x..x..x..x..', fingers: 'x.x.x.x.x.x.' } } },
      { name: 'Bell alone', how: 'Thumb silent. Keep the four beats in your foot and play only the bell.',
        grid: { rows: { fingers: 'x.x.xx.x.x.x' } } }
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
    goal: 'Play C, F, C, G7 with a thumb bass and two-note chords between the beats, then a melody in thirds on top.',
    why: 'Highlife guitar is clean, repetitive and light: a thumb bass, short chords between the beats and melodies in two-note harmony. You build the parts one at a time and hold each one for a long time, which is how these parts are learned.',
    backing: { groove: 'highlife', bars: ['C', 'F', 'C', 'G7'] },
    tempo: [80, 120],
    steps: [
      'Count “1 e & a 2 e & a 3 e & a 4 e & a”.',
      'Thumb: the chord’s root on 1, its fifth on 3.',
      'Fingers (index, or index and middle): two notes of the chord on strings 3 and 2.',
      'Repeat each variation for at least 16 bars without changing it.',
      'Keep the fingers soft and the thumb steady.'
    ],
    variations: [
      { name: 'Between the beats', how: 'Fingers on the & of every beat, with the backing’s chord.',
        grid: { rows: { thumb: 'x.......x.......', fingers: '..x...x...x...x.' } } },
      { name: 'Add the a of 2 and 4', how: 'One extra finger stroke on the a of 2 and the a of 4.',
        grid: { rows: { thumb: 'x.......x.......', fingers: '..x...xx..x...xx' } } },
      { name: 'Walking into the change', how: 'On the & of 4 the thumb plays one extra note that leads to the next chord’s root (for C to F: E).',
        grid: { rows: { thumb: 'x.......x.....x.', fingers: '..x...x...x...x.' } } },
      {
        name: 'Melody in thirds',
        how: 'The top line on string 1 or 2, with a second note on the next string, a third below (two scale steps down), over the same thumb bass.',
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
    goal: 'Hold a repeating kora-style pattern for minutes, then drop in a fast run and come back without losing the beat.',
    why: 'A kora player keeps a steady repeating pattern (kumbengo) and now and then breaks into fast runs (birimintingo). Leaving the pattern and coming back on time is the real skill.',
    backing: { click: { beats: 4, sub: 3 } },
    grid: { count: '1 & a 2 & a 3 & a 4 & a' },
    tempo: [60, 100],
    steps: [
      'Each beat has three pulses: count “1 & a 2 & a 3 & a 4 & a”. Thumb on each number, index finger on each a.',
      'Bass notes: F (string 4, fret 3) and C (string 5, fret 3). High notes on strings 1 and 2.',
      'Do not speed up. Kora patterns are hypnotic because they are steady.',
      'Play each variation for at least two minutes.'
    ],
    variations: [
      {
        name: 'Thumb alone',
        how: 'F, C, F, C on 1, 2, 3 and 4.',
        positions: [[4, 3], [5, 3]],
        grid: { rows: { thumb: 'x..x..x..x..' } }
      },
      {
        name: 'Add the index',
        how: 'Index on each a: A, G, A, C on string 1 (frets 5, 3, 5, 8).',
        positions: [[4, 3], [1, 5], [5, 3], [1, 3], [1, 8]],
        grid: { rows: { thumb: 'x..x..x..x..', index: '..x..x..x..x' } }
      },
      { name: 'Shift the index', how: 'Move the index notes to each &. Hear how the whole pattern changes feel.',
        grid: { rows: { thumb: 'x..x..x..x..', index: '.x..x..x..x.' } } },
      { name: 'Drop in a run', how: 'Every fourth time round, play a fast run down strings 1 and 2 instead (C A G F D C), then start the pattern again on 1.' }
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
    goal: 'Play a short muted line in the gaps between the drums, then move it one count later and keep it steady.',
    why: 'Afrobeat guitars play short muted lines that fit into the gaps the drums and each other leave. Moving the same line by one count trains exact placement instead of one memorised groove.',
    backing: { rhythm: 'funk16' },
    tempo: [80, 112],
    steps: [
      'Count “1 e & a 2 e & a 3 e & a 4 e & a”.',
      'Rest the side of your picking hand lightly on the strings near the bridge, so the notes are short and muted.',
      'Keep the pick moving down-up on every count, even when you do not play.',
      'The notes are A, C and D.',
      'Play one variation for two minutes before you change it.'
    ],
    variations: [
      { name: 'The line', how: 'Notes on the e of 1, 2, the & of 2, the e of 3, 4 and the & of 4.', bars: P('r:16 57:16 r:8 60:16 r:16 62:16 r:16 r:16 62:16 r:8 60:16 r:16 57:8'), time: '4/4', key: 'Dm' },
      { name: 'One count later', how: 'The same notes, each moved one count later: the & of 1, the e of 2, the a of 2, and so on.', bars: P('r:8 57:16 r:16 r:16 60:16 r:16 62:16 r:8 62:16 r:16 r:16 60:16 r:16 57:16'), time: '4/4', key: 'Dm' },
      { name: 'Chord chops', how: 'Play the first line’s rhythm as short muted Dm7 chords on strings 2 to 4.',
        grid: { rows: { chop: '.x..x.x..x..x.x.' } } },
      { name: 'Two-bar answer', how: 'Play the line in bar 1. In bar 2, answer it using C, D and F on the same counts.' }
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
    goal: 'Play the notes of E, A, B and A one at a time, high on the neck, with relaxed down-up picking for minutes at a time.',
    why: 'In the fast dance section of Congolese rumba (the sebene), the lead guitar loops bright broken chords high on the neck. Changing speed and direction on the same shapes builds stamina and evenness.',
    backing: { groove: 'soukous', bars: ['E', 'A', 'B', 'A'] },
    tempo: [90, 140],
    steps: [
      'Shapes on strings 3-2-1: E at frets 9-9-7, A at 9-10-9, B at 11-12-11.',
      'Pick down-up with small motions and a light, clean tone.',
      'Repeat a variation for three minutes without speeding up.',
      'Keep the left hand down; let notes ring into each other.'
    ],
    variations: [
      {
        name: 'Eighths',
        how: 'Low, middle, high, middle, two notes per beat (count “1 & 2 &”).',
        bars: P('64:8 68:8 71:8 68:8 64:8 68:8 71:8 68:8 | 64:8 69:8 73:8 69:8 64:8 69:8 73:8 69:8 | 66:8 71:8 75:8 71:8 66:8 71:8 75:8 71:8 | 64:8 69:8 73:8 69:8 64:8 69:8 73:8 69:8'),
        time: '4/4', key: 'E',
        positions: [[3, 9], [2, 9], [1, 7]]
      },
      {
        name: 'Sixteenths',
        how: 'The same, twice as fast: four notes per beat (count “1 e & a”).',
        bars: P('64:16 68:16 71:16 68:16 64:16 68:16 71:16 68:16 64:16 68:16 71:16 68:16 64:16 68:16 71:16 68:16 | 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16 | 66:16 71:16 75:16 71:16 66:16 71:16 75:16 71:16 66:16 71:16 75:16 71:16 66:16 71:16 75:16 71:16 | 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16'),
        time: '4/4', key: 'E'
      },
      {
        name: 'Top down',
        how: 'High, middle, low, middle, four notes per beat.',
        bars: P('71:16 68:16 64:16 68:16 71:16 68:16 64:16 68:16 71:16 68:16 64:16 68:16 71:16 68:16 64:16 68:16 | 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16 | 75:16 71:16 66:16 71:16 75:16 71:16 66:16 71:16 75:16 71:16 66:16 71:16 75:16 71:16 66:16 71:16 | 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16 73:16 69:16 64:16 69:16'),
        time: '4/4', key: 'E'
      },
      { name: 'Loud on the a', how: 'Four notes per beat, with the last one of each beat (the a) louder, to push the dancers forward.',
        grid: { rows: { pick: 'xxxXxxxXxxxXxxxX' } } }
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
    goal: 'Add a second note under a short lead line: first a third below, then a sixth below, over E, A, B, A.',
    why: 'Congolese and Kenyan bands play their lead lines in two-note harmony. Playing one line with different harmonies teaches you the note pairs on the neck, not just one riff.',
    backing: { groove: 'soukous', bars: ['E', 'A', 'B', 'A'] },
    tempo: [90, 130],
    steps: [
      'Learn the top line alone first.',
      'Thirds: the second note is on the next string down, two notes lower in the E major scale.',
      'Sixths: the second note skips a string and is five notes lower in the scale.',
      'Pick both notes together, or use the pick and your middle finger.'
    ],
    variations: [
      { name: 'Top line', how: 'Single notes high on strings 1 and 2.', bars: P('71:8 73:8 76:q 75:8 73:8 71:q | 73:8 76:8 78:q 76:8 73:8 69:q | 75:8 78:8 75:8 73:8 71:h | 73:8 71:8 69:8 68:8 69:h'), time: '4/4', key: 'E' },
      { name: 'In thirds', how: 'Add a note a third below each note, on the next string down.' },
      { name: 'In sixths', how: 'Add a note a sixth below each note, skipping a string (strings 1 and 3, or 2 and 4).' },
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
    goal: 'Play phrases in two Ethiopian scales (qenet), Tizita and Bati, over a C drone, sliding into notes and with a wide vibrato.',
    why: 'Each Ethiopian scale has its own colour, and singers carry it with slides and vibrato. Switching scales over the same drone makes the difference easy to hear.',
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
    goal: 'Split a 12-pulse pattern in the style of the mbira (thumb piano) between a muted thumb bass and high finger notes, then move the high part.',
    why: 'Zimbabwean chimurenga guitarists copy the mbira’s low and high parts that fit together. Moving one part against the other trains you to feel both the four beats and the twelve pulses.',
    backing: { click: { beats: 4, sub: 3 } },
    grid: { count: '1 2 3 | 4 5 6 | 7 8 9 | 10 11 12' },
    tempo: [60, 100],
    steps: [
      'This is a practice pattern in the mbira style, not a transcription of a particular piece.',
      'Count 12 quick pulses: “1 2 3, 4 5 6, 7 8 9, 10 11 12”. The click’s beats are 1, 4, 7 and 10.',
      'Thumb on the low strings with your palm resting on them; fingers on strings 1 and 2.',
      'Start on G for a whole minute. Then change the chord each cycle: G, Em, C, D.',
      'Keep both parts steady; the interest comes from how they fit together.'
    ],
    variations: [
      { name: 'Thumb bass', how: 'Muted G on 1 and 7, D on 4 and 10.', positions: [[6, 3], [5, 5]],
        grid: { rows: { thumb: 'x..x..x..x..' } } },
      { name: 'High notes at the end of each beat', how: 'Fingers on 3, 6, 9 and 12: B, D, B, G on the top strings.', positions: [[6, 3], [2, 0], [2, 3], [1, 3]],
        grid: { rows: { thumb: 'x..x..x..x..', fingers: '..x..x..x..x' } } },
      { name: 'Six against four', how: 'Fingers on the even pulses (2, 4, 6, 8, 10, 12): six notes against the thumb’s four.',
        grid: { rows: { thumb: 'x..x..x..x..', fingers: '.x.x.x.x.x.x' } } },
      { name: 'Move the high part', how: 'Move the finger notes one pulse earlier (2, 5, 8, 11) and hear where beat 1 seems to go.',
        grid: { rows: { thumb: 'x..x..x..x..', fingers: '.x..x..x..x.' } } }
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
    goal: 'Play the gypsy jazz rhythm (la pompe) on Am6, Dm6, E7, Am6: four downstrokes per bar, very short on 2 and 4, with a relaxed arm.',
    why: 'In gypsy jazz the rhythm guitar is the drum kit. The strokes stay the same while you change the chord shape and the volume, so the rhythm holds at any tempo.',
    backing: { groove: 'pompe', bars: ['Am6', 'Dm6', 'E7', 'Am6'] },
    tempo: [110, 200],
    steps: [
      'Shapes: Am6 5-x-4-5-5-x, Dm6 x-5-3-4-3-x, E7 0-x-0-1-0-x.',
      'Count “1 2 3 4”. One downstroke on each count, moving from the wrist and forearm, not the fingers.',
      'Just after 2 and 4, loosen your fretting fingers (keep touching the strings) so those chords stop at once.',
      'Raise the tempo only when your arm still feels loose.'
    ],
    variations: [
      { name: 'Even fours', how: 'Four equal downstrokes, short on 2 and 4.', positions: [[6, 5], [4, 4], [3, 5], [2, 5]],
        grid: { rows: { strum: 'x.X.x.X.' } } },
      { name: 'Bass on 1 and 3', how: 'Play only the bass string on 1 and 3, and the full chord (short) on 2 and 4.',
        grid: { rows: { bass: 'x...x...', chord: '..X...X.' } } },
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
    goal: 'Play G6, G♯dim7, Am7, D7 in the pompe rhythm, moving each shape as little as possible.',
    why: 'Gypsy jazz slips a diminished chord in between two chords to connect them. One diminished shape works again every three frets, so one shape gives you four chords.',
    backing: { groove: 'pompe', bars: ['G6 G#dim7', 'Am7 D7'] },
    tempo: [100, 180],
    steps: [
      'Two chords per bar: G6 on 1 and 2, G♯dim7 on 3 and 4; then Am7 on 1 and 2, D7 on 3 and 4.',
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
    why: 'Django’s lines play the notes of the chord and slide in from one fret below. You add the extra note and the special picking one at a time, until both are automatic.',
    backing: { groove: 'pompe', bars: ['Am6', 'Dm6', 'E7', 'Am6'] },
    tempo: [90, 180],
    steps: [
      'Am6 is A C E F♯. Dm6 is D F A B. E7 here also has F (one fret above the E).',
      'When you move to the next string, use a downstroke and let the pick come to rest on that next string (a rest stroke).',
      'Learn the plain version, then the version with an extra note one fret below each chord note.',
      'Count “1 & 2 & 3 & 4 &”, the & notes slightly shorter than the numbers (a light swing).'
    ],
    variations: [
      { name: 'Plain arpeggios', how: 'Chord tones only.', bars: P('57:8 60:8 64:8 66:8 69:8 66:8 64:8 60:8 | 62:8 65:8 69:8 71:8 74:8 71:8 69:8 65:8 | 64:8 68:8 71:8 74:8 71:8 68:8 64:8 62:8 | 57:h r:h'), time: '4/4', key: 'Am' },
      { name: 'Approach from below', how: 'Each arpeggio starts a half step under its root.', bars: P('56:8 57:8 60:8 64:8 66:8 64:8 60:8 57:8 | 61:8 62:8 65:8 69:8 71:8 69:8 65:8 62:8 | 63:8 64:8 68:8 71:8 74:8 77:8 74:8 71:8 | 69:h r:h'), time: '4/4', key: 'Am' },
      { name: 'Rest strokes', how: 'The version with extra notes, using a rest stroke on every string change, even going up.' },
      { name: 'Start on the third', how: 'Same idea, but start each chord one fret below its 3rd (C for Am6) instead of its root.' }
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
    goal: 'Play a fast diminished-chord run up and down the neck over E7 and end it cleanly on Am6.',
    why: 'Fast diminished runs are a gypsy jazz trademark. The shape repeats every three frets, so you learn one shape and one jump instead of many notes.',
    backing: { groove: 'pompe', bars: ['E7', 'Am6'] },
    tempo: [90, 180],
    steps: [
      'The run uses F A♭ B D. Over E7 these sound like E7 with an added F (E7♭9).',
      'The four-string shape x-x-3-4-3-4 works again three frets higher with the same fingers.',
      'End the run on a note of Am6 (A, C, E or F♯) exactly on 1 of the Am6 bar.',
      'Rest strokes when you change string, down-up picking on one string.'
    ],
    variations: [
      { name: 'Up, eighths', how: 'Two octaves up from F, resolving to E.', bars: P('53:8 56:8 59:8 62:8 65:8 68:8 71:8 74:8 | 76:q 72:q 69:h'), time: '4/4', key: 'Am', spell: 'b', positions: [[4, 3], [3, 4], [2, 3], [1, 4]] },
      { name: 'Down, eighths', how: 'From high F down, resolving to A.', bars: P('77:8 74:8 71:8 68:8 65:8 62:8 59:8 56:8 | 57:q 60:q 64:h'), time: '4/4', key: 'Am', spell: 'b' },
      { name: 'Up and down, sixteenths', how: 'Up two octaves and straight back down in one bar.', bars: P('53:16 56:16 59:16 62:16 65:16 68:16 71:16 74:16 77:16 74:16 71:16 68:16 65:16 62:16 59:16 56:16 | 57:q 60:q 64:h'), time: '4/4', key: 'Am', spell: 'b' },
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
    goal: 'Play the 3rds and 7ths of Dm7, G7, Cmaj7 as smooth lines, then turn them into a melody.',
    why: 'The 3rd and 7th are the notes that make each chord sound like itself, and through these chords they move by one fret or stay put. Going from one note per bar to a melody teaches you to hear the chords change.',
    backing: { groove: 'swing', bars: ['Dm7', 'G7', 'Cmaj7', 'Cmaj7'] },
    tempo: [80, 180],
    steps: [
      'Say the 3rd and 7th of each chord: Dm7 F and C, G7 B and F, Cmaj7 E and B.',
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
    goal: 'Accompany a 12-bar blues in F with three-note chords, in four different rhythms.',
    why: 'Good accompaniment (comping) is mostly rhythm. The chord shapes stay the same and only the rhythm changes, so you build a set of rhythms to choose from while a soloist plays.',
    backing: { groove: 'swing', bars: ['F7', 'Bb7', 'F7', 'F7', 'Bb7', 'Bb7', 'F7', 'D7', 'Gm7', 'C7', 'F7 D7', 'Gm7 C7'] },
    grid: { count: '1 & a 2 & a 3 & a 4 & a' },
    tempo: [80, 160],
    steps: [
      'Swing: split each beat in three and count “1 & a 2 & a 3 & a 4 & a”. The swung “and” is the a, the last of the three.',
      'Three-note chords (root, 7th, 3rd) on strings 6-4-3 or 5-4-3, muting the strings in between.',
      'F7: 1-x-1-2-x-x. B♭7: 6-x-6-7-x-x, or x-1-0-1-x-x.',
      'Keep the comp short and light, and leave space.',
      'Play each variation for at least two full choruses.'
    ],
    variations: [
      { name: 'Four to the bar', how: 'A short chord on every beat, a little louder on 2 and 4, like Freddie Green in the Basie band.', positions: [[6, 1], [4, 1], [3, 2]],
        grid: { rows: { comp: 'x..X..x..X..' } } },
      { name: 'Charleston', how: 'Two hits per bar: on 1 and on the a of 2 (the swung “and” of 2).', positions: [[6, 6], [4, 6], [3, 7]],
        grid: { rows: { comp: 'x....x......' } } },
      { name: 'Early chords', how: 'One hit per bar, on the a of 4 (the swung “and” of 4): each chord arrives early and rings over into its own bar.',
        grid: { rows: { comp: '...........x' } } },
      { name: 'Leave space', how: 'Play only in bars 2 and 4 of each four bars, one or two hits off the beat, as if answering a soloist.' }
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
    why: 'Playing the notes just above and just below a target note (an enclosure) is how bebop lines make chord notes land. Aiming at a different target with the same idea builds the skill, not one lick.',
    backing: { groove: 'swing', bars: ['Dm7', 'G7', 'Cmaj7', 'Cmaj7'] },
    tempo: [80, 200],
    steps: [
      'Each line runs through Dm7 and G7 and lands on beat 1 of the Cmaj7 bar.',
      'Learn the last beat of the G7 bar plus the target first, then add the rest.',
      'Swing the notes in long–short pairs: count “1 & a” and play on the number and the a. Make the a notes slightly louder.',
      'Stop after the target and listen to it against the chord.'
    ],
    variations: [
      { name: 'Enclose the 3rd', how: 'F above, D♯ below, land on E.', bars: P('62:8 65:8 69:8 72:8 71:8 69:8 67:8 65:8 | 67:8 71:8 74:8 72:8 71:8 69:8 65:8 63:8 | 64:q r:q r:h | r:w'), time: '4/4', key: 'C' },
      { name: 'Enclose the 5th', how: 'A above, F♯ below, land on G.', bars: P('62:8 65:8 69:8 72:8 71:8 69:8 67:8 65:8 | 67:8 71:8 74:8 72:8 71:8 65:8 69:8 66:8 | 67:q r:q r:h | r:w'), time: '4/4', key: 'C' },
      { name: 'Enclose the root', how: 'D♭ above, B below, land on C.', bars: P('62:8 65:8 69:8 72:8 71:8 69:8 67:8 65:8 | 67:8 71:8 74:8 77:8 76:8 74:8 73b:8 71:8 | 72:q r:q r:h | r:w'), time: '4/4', key: 'C' },
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
    why: 'Players who can sing the chords can hear them while they improvise. You sing one chord note at a time through the whole progression, then play what you sang to check it.',
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
    goal: 'Strum six counts per bar on Am and E7, and move the loud strums so the bar feels like two big beats or three.',
    why: 'Switching between two big beats and three in the same bar is the heart of chacarera, zamba and joropo. Your hand keeps moving the same way and only the loud strums move, so the feel goes into your strum.',
    backing: { rhythm: 'sesqui' },
    grid: { time: '2/4', count: '1 2 3 4 5 6', bars: 2 },
    tempo: [60, 100],
    steps: [
      'Count “1 2 3 4 5 6” in each bar.',
      'The backing claps on 1 and 4 in the first bar (two big beats) and on 1, 3 and 5 in the second (three beats).',
      'Strum down-up on every count without stopping; only the loud strums change.',
      'Am for one bar, E7 for the next.'
    ],
    variations: [
      { name: 'Always in 2', how: 'Loud on 1 and 4 in every bar.',
        grid: { rows: { strum: 'XxxXxxXxxXxx' } } },
      { name: 'Always in 3', how: 'Loud on 1, 3 and 5 in every bar.',
        grid: { rows: { strum: 'XxXxXxXxXxXx' } } },
      { name: 'Follow the backing', how: 'Loud on 1 and 4 in the first bar, on 1, 3 and 5 in the second, with the claps.',
        grid: { rows: { strum: 'XxxXxxXxXxXx' } } },
      { name: 'Muted slap', how: 'On each loud strum, strike down and stop the strings at once with your palm (the chasquido of Argentine strumming).',
        grid: { rows: { strum: 'XxxXxxXxXxXx' } } },
      { name: 'Bass in 3, strum in 2', how: 'Thumb plays a bass note on 1, 3 and 5 while the loud strums stay on 1 and 4.',
        grid: { rows: { bass: 'x.x.x.x.x.x.', strum: 'X..X..X..X..' } } }
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
    goal: 'Accompany Am and E7 with heavy, short tango chords (marcato), then add a drag into 1 (arrastre) and the 3+3+2 rhythm.',
    why: 'Tango accompaniment keeps changing its feel while the chords stay simple. You try each way of playing on the same chords, so you get several strums instead of one.',
    backing: { groove: 'tango', bars: ['Am', 'E7', 'E7', 'Am'] },
    tempo: [80, 130],
    steps: [
      'Count “1 & 2 & 3 & 4 &”.',
      'Short, heavy downstrokes. Loosen the fretting hand right after each one so the chord stops.',
      'Keep the tempo steady when you change from one variation to the next.'
    ],
    variations: [
      { name: 'Four heavy chords', how: 'Four equal, heavy, short chords per bar, on 1, 2, 3 and 4.',
        grid: { rows: { chord: 'X.X.X.X.' } } },
      { name: 'Heavy in two', how: 'Loud on 1 and 3, lighter on 2 and 4.',
        grid: { rows: { chord: 'X.x.X.x.' } } },
      { name: 'Drag into 1', how: 'On the & of 4, start sliding up the bass string from a few frets below, so the root arrives exactly on 1.',
        grid: { rows: { chord: 'X.x.X.x.', slide: '.......x' } } },
      { name: '3+3+2', how: 'Loud on 1, the & of 2 and 4, like the habanera bass.',
        grid: { rows: { chord: 'X..X..X.' } } }
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
    why: 'A line that falls one fret at a time over a minor chord is everywhere in tango and Latin American song. Hearing the line alone, then inside the chord, connects it to shapes you already know.',
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
      { name: 'Picked one note at a time', how: 'Thumb on the bass note, then index, middle and ring fingers on strings 3, 2 and 1, twice per bar (count “1 & 2 & 3 & 4 &”).',
        grid: { rows: { thumb: 'x...x...', fingers: '.xxx.xxx' } } },
      { name: 'Heavy and short', how: 'Four short, heavy chords per bar, with the moving note on top.',
        grid: { rows: { chord: 'X.X.X.X.' } } }
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
    goal: 'Keep a milonga bass going in your thumb on Em and B7 (on 1, the & of 2 and 4) while your fingers play a melody.',
    why: 'In the country milonga of Yupanqui and others, one guitar plays bass and melody at once. You learn the bass until it runs by itself, then add the melody in small steps.',
    backing: { groove: 'tango', bars: ['Em', 'B7'] },
    tempo: [60, 100],
    steps: [
      'Thumb on strings 6 to 4, fingers on strings 1 to 3.',
      'Count “1 & 2 & 3 & 4 &”. The bass plays on 1, the & of 2 and 4 (groups of 3 + 3 + 2 counts).',
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
