/* World Woodshed — style drills: Caribbean, klezmer, East Asia, Celtic, blues, rock, funk & soul, country, classical, fado, Persian, Hawaiian */
export default [
  /* ---------------- Jamaica ---------------- */
  {
    id: 'caribbean-onedrop-skank',
    style: 'caribbean',
    name: 'One-drop skank on 2 and 4',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Chop a short, even, relaxed skank on beats 2 and 4 over a one-drop groove without rushing.',
    why: 'In reggae the guitar is a percussion part with pitch, and the length of the chop matters as much as its timing. Changing the voicing and the stroke while the groove stays fixed builds a skank that survives any song, not one memorised shape.',
    backing: { groove: 'reggae', bars: ['Am', 'D'] },
    tempo: [66, 84],
    steps: [
      'Fret Am on strings 4–2 at the 5th fret (7-5-5) and D at the 7th fret (7-7-7). Mute strings 1, 5 and 6 with spare fingers.',
      'Count “1 2 3 4” out loud and hear that the kick and snare land together on 3 only.',
      'Strike a short downstroke on 2 and 4, then ease fretting pressure at once so the chord stops dead. Do not lift the fingers off the strings.',
      'Keep the picking hand moving lightly in the air on 1 and 3 so the chop has a place to come from.',
      'Record a minute and check that every chop is the same length and sits a hair behind the beat, never ahead of it.'
    ],
    variations: [
      { name: 'Single chop, strings 4–2', how: 'One short downstroke on 2 and 4: Am at 7-5-5, D at 7-7-7. Stop each chord by releasing pressure.', positions: [[4, 7], [3, 5], [2, 5]] },
      { name: 'Double chop', how: 'On 2 and 4 play two quick strokes, down on the beat and up on the next 16th (“chu-ka”), both short. Then go back to the single chop and feel the difference.' },
      { name: 'Top-string voicings', how: 'Move to strings 3–1: Am at the 5th fret (5-5-5) and D in open position (2-3-2). Same short stroke, brighter colour.', positions: [[1, 5], [3, 5], [2, 5]] },
      { name: 'Lay back', how: 'Keep the single chop but place it a little later each time, until it feels relaxed and slightly behind the snare. Stop before it sounds late.' },
      { name: 'Silent 1 and 3', how: 'On 1 and 3 brush the muted strings very softly with a downstroke, then chop on 2 and 4 with an upstroke. Many players keep this motion so the chop never rushes.' }
    ],
    listen: { artist: 'Bob Marley & the Wailers', work: 'Stir It Up' }
  },
  {
    id: 'caribbean-ska-upstrokes',
    style: 'caribbean',
    name: 'Ska upstrokes on every offbeat',
    focus: 'rhythm',
    level: 2,
    minutes: 6,
    goal: 'Play clean, short upstrokes on every “and” of the bar at ska tempo while the chords change under them.',
    why: 'Ska doubles the reggae skank and puts it on every offbeat, which builds endurance and a steady picking motion. Keeping the hand moving down on the beat and up on the offbeat chunks the bar into a single motion you can then speed up.',
    backing: { click: { beats: 4, sub: 2 } },
    tempo: [110, 160],
    steps: [
      'Choose a C–F–G progression, one chord per bar, using small shapes on the top three or four strings.',
      'Move the picking hand down on every beat without touching the strings and up on every “and”, striking only on the way up.',
      'Release the chord right after each upstroke so the offbeat is short and the beat is silent.',
      'Change chords on beat 1 while the hand is in the air, so the next upstroke is ready on time.',
      'Raise the tempo only when every upstroke is the same length and volume.'
    ],
    variations: [
      { name: 'One chord, offbeats only', how: 'Stay on C and play upstrokes on all four “ands”. Listen for even length.' },
      { name: 'C–F–G–C, one bar each', how: 'Change chords on beat 1 with no gap in the offbeat pattern.' },
      { name: 'C–Am–F–G', how: 'The I–vi–IV–V change that early ska shared with the American R&B it grew from. Keep the shapes small so the hand moves as little as possible.' },
      { name: 'Accent 2 and 4', how: 'Keep every offbeat but play the “and” of 2 and the “and” of 4 a little louder, to lock with the snare.' }
    ],
    listen: { artist: 'The Skatalites', work: 'Guns of Navarone' }
  },
  {
    id: 'caribbean-bass-double',
    style: 'caribbean',
    name: 'Second guitar: double the bass line',
    focus: 'technique',
    level: 2,
    minutes: 8,
    goal: 'Play a roots bass line an octave up, palm-muted and picked near the bridge, locked to the one drop.',
    why: 'On many roots records one guitar skanks while the other doubles the bass in muted single notes, so learning the bass first teaches you the song. Changing one thing per variation (placement, rhythm, approach notes) keeps the line flexible instead of fixed.',
    backing: { groove: 'reggae', bars: ['Am', 'D'] },
    tempo: [66, 84],
    steps: [
      'Rest the side of the picking hand on the strings right at the bridge so notes are short and dull, almost like a muted bass.',
      'Pick every note with a downstroke, close to the bridge.',
      'Play the line in the staff on strings 6–4 around the 5th fret.',
      'Hum the line while you play it; if you can hum it, you know it.',
      'Leave the rests empty: the space is part of the line.'
    ],
    variations: [
      {
        name: 'Root, third, fifth',
        how: 'A long root, a short third, the fifth, then space. D in the second bar.',
        bars: [[{ m: 45, d: 'q', dot: true }, { m: 48, d: '8' }, { m: 52, d: 'q' }, { m: null, d: 'q' }], [{ m: 50, d: 'q', dot: true }, { m: 54, d: '8' }, { m: 57, d: 'q' }, { m: null, d: 'q' }]],
        time: '4/4', key: 'Am', positions: [[6, 5], [6, 8], [5, 7]]
      },
      {
        name: 'Start on the offbeat',
        how: 'Leave the first eighth empty and push the line forward.',
        bars: [[{ m: null, d: '8' }, { m: 45, d: '8' }, { m: 45, d: '8' }, { m: 48, d: '8' }, { m: 52, d: 'q' }, { m: 50, d: '8' }, { m: 48, d: '8' }], [{ m: null, d: '8' }, { m: 50, d: '8' }, { m: 50, d: '8' }, { m: 54, d: '8' }, { m: 57, d: 'q' }, { m: 55, d: '8' }, { m: 54, d: '8' }]],
        time: '4/4', key: 'Am'
      },
      {
        name: 'Drop beat 1',
        how: 'Rest on beat 1, the way the one drop leaves it open, and land the long note on beat 4.',
        bars: [[{ m: null, d: 'q' }, { m: 45, d: '8' }, { m: 48, d: '8' }, { m: 52, d: '8' }, { m: 55, d: '8' }, { m: 57, d: 'q' }], [{ m: null, d: 'q' }, { m: 50, d: '8' }, { m: 54, d: '8' }, { m: 57, d: '8' }, { m: 60, d: '8' }, { m: 62, d: 'q' }]],
        time: '4/4', key: 'Am'
      },
      {
        name: 'Approach notes',
        how: 'Each bar ends a half step below the next root: C♯ into D, G♯ back into A.',
        bars: [[{ m: 45, d: 'q' }, { m: null, d: '8' }, { m: 45, d: '8' }, { m: 48, d: '8' }, { m: 52, d: '8' }, { m: 49, d: 'q' }], [{ m: 50, d: 'q' }, { m: null, d: '8' }, { m: 50, d: '8' }, { m: 54, d: '8' }, { m: 57, d: '8' }, { m: 44, d: 'q' }]],
        time: '4/4', key: 'Am'
      }
    ]
  },
  {
    id: 'caribbean-short-fills',
    style: 'caribbean',
    name: 'Short fills between vocal lines',
    focus: 'melody',
    level: 3,
    minutes: 8,
    goal: 'Answer a two-bar vocal space with a one-bar fill in A Dorian that ends cleanly before the next line.',
    why: 'Reggae lead guitar answers the singer in short phrases and gets out of the way, like Ernest Ranglin’s quick, jazzy answers. Rotating fills of different shapes over the same gap trains choosing and stopping, not just playing.',
    backing: { groove: 'reggae', bars: ['Am', 'D'] },
    tempo: [66, 84],
    steps: [
      'Bar 1 belongs to the singer: count it, or sing a line, and play nothing.',
      'Play the fill in bar 2 over D. A Dorian has F♯, the third of D, so the fill fits the chord.',
      'End on D or F♯ before beat 1 comes round; the next vocal line starts there.',
      'Use a clean, bright tone and pick lightly. Let the last note ring, then mute it.',
      'Make up your own one-bar answer with the same rules after the written ones.'
    ],
    variations: [
      {
        name: 'Up and back to D',
        how: 'E G A, then G E D. Simple and vocal.',
        bars: [[{ m: null, d: 'w' }], [{ m: 64, d: '8' }, { m: 67, d: '8' }, { m: 69, d: 'q' }, { m: 67, d: '8' }, { m: 64, d: '8' }, { m: 62, d: 'q' }]],
        time: '4/4', key: 'Am'
      },
      {
        name: 'Late start, through F♯',
        how: 'Wait a beat, then step down through F♯ to D.',
        bars: [[{ m: null, d: 'w' }], [{ m: null, d: 'q' }, { m: 69, d: '8' }, { m: 67, d: '8' }, { m: 66, d: '8' }, { m: 64, d: '8' }, { m: 62, d: 'q' }]],
        time: '4/4', key: 'Am'
      },
      {
        name: 'Quick turn at the top',
        how: 'A sixteenth-note pickup to C, then down through A and F♯ to D.',
        bars: [[{ m: null, d: 'w' }], [{ m: null, d: '8' }, { m: 69, d: '16' }, { m: 71, d: '16' }, { m: 72, d: '8' }, { m: 71, d: '8' }, { m: 69, d: '8' }, { m: 66, d: '8' }, { m: 62, d: 'q' }]],
        time: '4/4', key: 'Am'
      },
      { name: 'Octaves', how: 'Play the first fill in octaves (strings 4 and 2, or 3 and 1), muting the string between with the side of the index finger.' },
      { name: 'Your own answer', how: 'Make a new one-bar fill each round. Rules: start after beat 1, end on D or F♯, no more than eight notes.' }
    ],
    listen: { artist: 'Ernest Ranglin', work: 'Below the Bassline' }
  },

  /* ---------------- Klezmer ---------------- */
  {
    id: 'klezmer-bulgar-oompah',
    style: 'klezmer',
    name: 'Oom-pah with the bulgar accent',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Keep a steady oom-pah in D freygish and lay the 3+3+2 bulgar accent on top of it.',
    why: 'The chord player in a klezmer band holds the dance together with bass on the beat and a dry chop off it. Adding the accent pattern as a separate layer is part practice: first the even oom-pah, then the 3+3+2 over it.',
    backing: { rhythm: 'bulgar' },
    tempo: [100, 150],
    steps: [
      'Fret D on strings 4–2 at the 7th fret (A D F♯). Play the open D string as the bass with your thumb or a downstroke.',
      'Oom-pah: bass on every beat, a short chord chop on every “and”. Damp the chop at once.',
      'Count eight eighths per bar and say the bulgar grouping: 1 2 3, 4 5 6, 7 8.',
      'Accent the notes that fall on 1, 4 and 7 while the oom-pah carries on underneath.',
      'Change to E♭ (the same shape one fret up, 8-8-8) when the variation asks, without losing the pulse.'
    ],
    variations: [
      { name: 'Plain oom-pah on D', how: 'Bass on each beat, chop on each “and”, all at the same volume.', positions: [[3, 7], [4, 7], [2, 7]] },
      { name: '3+3+2 accents', how: 'Keep the oom-pah but accent eighths 1, 4 and 7 of the bar, matching the clap in the backing.' },
      { name: 'D and E♭', how: 'Two bars of D, one bar of E♭ (8-8-8 on strings 4–2), one bar of D. The ♭II chord is the sound of freygish.', positions: [[3, 8], [4, 8], [2, 8]] },
      { name: 'Add Gm', how: 'D – D – Gm – D. Gm on strings 4–2 is 8-7-8 (B♭ D G). Keep the accents.', positions: [[2, 8], [4, 8], [3, 7]] }
    ],
    listen: { artist: 'Dave Tarras', work: 'Yiddish-American Klezmer Music 1925–1956' }
  },
  {
    id: 'klezmer-freygish-krekhts',
    style: 'klezmer',
    name: 'Freygish phrase with a krekhts',
    focus: 'technique',
    level: 2,
    minutes: 8,
    goal: 'Play a short D freygish phrase and place a clean krekhts (sob) and a turn exactly where the line needs them.',
    why: 'Klezmer melody is shaped by a few well-placed ornaments, not by covering every note. Learning the plain line first and then adding one ornament at a time keeps the melody clear and lets you hear what each ornament does.',
    backing: { groove: 'drone', bars: ['D'] },
    tempo: [56, 88],
    steps: [
      'Play the plain line in the first variation until it sings. The key signature has B♭ and E♭; the F♯ is the raised third that gives freygish its sound.',
      'Krekhts: hammer onto the note, then flick off quickly to the note below so the sound breaks like a sob. Keep it short and light.',
      'Turns (dreydlekh) are quick hammer-on and pull-off figures around one note; keep the main note in time.',
      'End every phrase on D and let it ring over the drone.',
      'Sing the phrase once before you play it, so the phrasing comes from the voice.'
    ],
    variations: [
      {
        name: 'Plain line',
        how: 'Up the scale to A and back to D, no ornaments.',
        bars: [[{ m: 62, d: '8' }, { m: 63, d: '8' }, { m: 66, d: '8' }, { m: 67, d: '8' }, { m: 69, d: 'q' }, { m: 67, d: '8' }, { m: 66, d: '8' }], [{ m: 63, d: 'q' }, { m: 62, d: 'h', dot: true }]],
        time: '4/4', key: 'Gm', positions: [[2, 3], [2, 4], [1, 2], [1, 3], [1, 5]]
      },
      {
        name: 'Krekhts on A',
        how: 'The two sixteenths G–A are the krekhts: hammer to A, flick off to G at once.',
        bars: [[{ m: 69, d: 'q' }, { m: 70, d: '8' }, { m: 69, d: '8' }, { m: 67, d: '16' }, { m: 69, d: '16' }, { m: 67, d: '8' }, { m: 66, d: 'q' }], [{ m: 66, d: '8' }, { m: 63, d: '8' }, { m: 62, d: 'h' }, { m: null, d: 'q' }]],
        time: '4/4', key: 'Gm'
      },
      {
        name: 'Climb to C and turn on G',
        how: 'Arpeggio up to C, then a turn G–A–G–F♯ before resolving through E♭ to D.',
        bars: [[{ m: 62, d: '8' }, { m: 66, d: '8' }, { m: 69, d: '8' }, { m: 72, d: '8' }, { m: 70, d: 'q' }, { m: 69, d: 'q' }], [{ m: 67, d: '16' }, { m: 69, d: '16' }, { m: 67, d: '16' }, { m: 66, d: '16' }, { m: 63, d: 'q' }, { m: 62, d: 'h' }]],
        time: '4/4', key: 'Gm'
      },
      {
        name: 'Krekhts an octave down',
        how: 'The second phrase on strings 3–5. The ornament is harder on thicker strings; keep it light.',
        bars: [[{ m: 57, d: 'q' }, { m: 58, d: '8' }, { m: 57, d: '8' }, { m: 55, d: '16' }, { m: 57, d: '16' }, { m: 55, d: '8' }, { m: 54, d: 'q' }], [{ m: 54, d: '8' }, { m: 51, d: '8' }, { m: 50, d: 'h' }, { m: null, d: 'q' }]],
        time: '4/4', key: 'Gm'
      }
    ],
    listen: { artist: 'Andy Statman', work: 'Jewish Klezmer Music' }
  },
  {
    id: 'klezmer-hora-misheberakh',
    style: 'klezmer',
    name: 'Hora sway in mi sheberakh: Dm and E7',
    focus: 'harmony',
    level: 2,
    minutes: 7,
    goal: 'Accompany a slow hora in D mi sheberakh, bass on the long beat and the chord on the short one, moving between Dm and E7.',
    why: 'The hora (zhok) limps long–short, and the chord player makes the sway by placing the chord late in the bar. Using the right chords for the mode (Dm and E7, not D and E) trains your ear to follow the mode, not a stock progression.',
    backing: { click: { beats: 3, sub: 1 } },
    tempo: [120, 168],
    steps: [
      'The click counts eighth notes, three to a bar. Play the bass on 1, nothing on 2, and the chord on 3.',
      'Dm on strings 4–2: 7-7-6 (A D F). E7 on strings 4–2: 6-7-5 (G♯ D E). Only two notes move.',
      'Keep the chord short and soft, the bass a little longer.',
      'Change chords on the bass note, never on the chord stroke.',
      'Play the mode’s melody in the last variation so you hear where G♯ and B come from.'
    ],
    variations: [
      { name: 'Dm only', how: 'Bass D (open 4th string) on 1, Dm chord on 3, over and over until the sway feels natural.', positions: [[3, 7], [4, 7], [2, 6]] },
      { name: 'Dm – E7', how: 'Two bars each. Bass E (open 6th string) under E7.', positions: [[2, 5], [4, 6], [3, 7]] },
      { name: 'Dm – E7 – Am – Dm', how: 'Am on strings 4–2 is 7-5-5 (A C E). One bar each.' },
      {
        name: 'The mode’s melody',
        how: 'A G♯ F E D: the descent that defines mi sheberakh. Play it long–short to the same sway.',
        bars: [[{ m: 69, d: 'q' }, { m: 68, d: '8' }], [{ m: 65, d: 'q' }, { m: 64, d: '8' }], [{ m: 62, d: 'q', dot: true }]],
        time: '3/8', key: 'Dm'
      }
    ]
  },
  {
    id: 'klezmer-doina',
    style: 'klezmer',
    name: 'Doina phrases over a drone',
    focus: 'melody',
    level: 3,
    minutes: 10,
    goal: 'Improvise unmetered doina phrases in D freygish that breathe, use ornaments sparingly and always come home to D.',
    why: 'The doina is free in time, so it trains phrasing and silence rather than tempo. Each variation fixes one shape (a cell, a climb, an echo) so you build a vocabulary of phrase types instead of noodling.',
    backing: { groove: 'drone', bars: ['D'] },
    tempo: [40, 60],
    steps: [
      'Let the drone set the mood, not the pace. Ignore the beat.',
      'Play a phrase about as long as one breath, then stop and let the drone ring.',
      'End every phrase on D, on the 2nd string 3rd fret or the open 4th string.',
      'Use at most one krekhts or turn per phrase.',
      'After four or five phrases, start a steady oom-pah on D, as a band would move from the doina into a freylekhs.'
    ],
    variations: [
      { name: 'Three-note cell', how: 'Use only D, E♭ and F♯. Vary the length of each note and end on D.' },
      { name: 'Long note, then a run down', how: 'Hold A with a slow tremolo, then run quickly down A G F♯ E♭ D.' },
      { name: 'Climb to C and fall', how: 'Rise in small steps to C, rest there, then fall back to D in one breath.' },
      { name: 'Echo an octave down', how: 'Play a phrase, then answer it with the same ending an octave lower.' },
      { name: 'Silence as long as the phrase', how: 'After each phrase, wait as long as it took to play before starting the next.' }
    ],
    listen: { artist: 'Naftule Brandwein', work: 'King of the Klezmer Clarinet' }
  },

  /* ---------------- East & Southeast Asia ---------------- */
  {
    id: 'eastasia-in-scale-bends',
    style: 'eastasia',
    name: 'In scale: bend into the half steps',
    focus: 'technique',
    level: 1,
    minutes: 7,
    goal: 'Play the in scale on E on the 1st string, reaching F and C by bending in tune instead of fretting them.',
    why: 'On the koto the player shapes a note after it starts by pressing behind the bridge, and guitar bends are the nearest equivalent. Comparing the fretted note with the bent one is immediate feedback for pitch, and silence between phrases is part of the drill.',
    backing: { groove: 'drone', bars: ['Esus4'] },
    tempo: [50, 72],
    steps: [
      'The in scale on E is E F A B C. On the 1st string: frets 0, 1, 5, 7, 8.',
      'Play the fretted version first and memorise how F and C sound.',
      'Now play F as a half-step bend from E (2nd string, 5th fret) and C as a half-step bend from B (1st string, 7th fret).',
      'Check each bend against the fretted note; bend slowly, as a koto player presses.',
      'Leave space after each phrase. Let the note decay fully.'
    ],
    variations: [
      {
        name: 'Fretted reference',
        how: 'The scale up and back down, fretted, with even notes.',
        bars: [[{ m: 64, d: 'q' }, { m: 65, d: 'q' }, { m: 69, d: 'q' }, { m: 71, d: 'q' }], [{ m: 72, d: 'q' }, { m: 71, d: 'q' }, { m: 69, d: 'h' }]],
        time: '4/4', positions: [[1, 0], [1, 1], [1, 5], [1, 7], [1, 8]]
      },
      {
        name: 'Bend B up to C',
        how: 'Pick B at the 7th fret, bend it a half step to C, release to B, then step down to E.',
        bars: [[{ m: 71, d: 'q' }, { m: 72, d: 'q' }, { m: 71, d: 'h' }], [{ m: 69, d: 'q' }, { m: 65, d: 'q' }, { m: 64, d: 'h' }]],
        time: '4/4', positions: [[1, 7]]
      },
      {
        name: 'Pre-bend F and release',
        how: 'On the 2nd string, 5th fret, bend E silently up to F, pick, and let it sink to E. Then a quick B–C bend and release on the 1st string.',
        bars: [[{ m: 65, d: 'h' }, { m: 64, d: 'h' }], [{ m: 69, d: 'q' }, { m: 71, d: '8' }, { m: 72, d: '8' }, { m: 71, d: 'h' }]],
        time: '4/4'
      },
      {
        name: 'Phrase and silence',
        how: 'A short phrase, then a full bar of silence. Add a slow, late vibrato on the last note.',
        bars: [[{ m: 64, d: 'q', dot: true }, { m: 65, d: '8' }, { m: 69, d: 'h' }], [{ m: null, d: 'w' }]],
        time: '4/4'
      },
      { name: 'Harmonic ending', how: 'Play any phrase above, then end on the 12th-fret harmonic of the 1st string, a bell-like E.' }
    ],
    listen: { artist: 'Yatsuhashi Kengyō', work: 'Rokudan no shirabe' }
  },
  {
    id: 'eastasia-kotekan',
    style: 'eastasia',
    name: 'Kotekan: one line, two parts',
    focus: 'rhythm',
    level: 2,
    minutes: 8,
    goal: 'Play the on-beat (polos) and off-beat (sangsih) halves of an interlocking line so that together they sound like one player.',
    why: 'Balinese kotekan splits a fast line between two players, so each part must be exact for the whole to work. Practising each half alone and then together is part–whole practice, and the off-beat part trains you to hear the beat you are not playing.',
    backing: { click: { beats: 4, sub: 2 } },
    tempo: [70, 120],
    steps: [
      'Learn the combined line first (variation 3), slowly.',
      'Play the polos alone: only the notes on the beats, with rests between.',
      'Play the sangsih alone: only the notes between the beats. Tap your foot on the beat you are not playing.',
      'With a looper or a friend, play one part against the other until the line sounds continuous.',
      'Then try the double-density version, where the same idea runs twice as fast.'
    ],
    variations: [
      {
        name: 'Polos (on the beat)',
        how: 'Notes on the beats only. Keep the rests silent.',
        bars: [[{ m: 64, d: '8' }, { m: null, d: '8' }, { m: 69, d: '8' }, { m: null, d: '8' }, { m: 69, d: '8' }, { m: null, d: '8' }, { m: 64, d: '8' }, { m: null, d: '8' }]],
        time: '4/4'
      },
      {
        name: 'Sangsih (between the beats)',
        how: 'Notes on the offbeats only. This is the hard half.',
        bars: [[{ m: null, d: '8' }, { m: 67, d: '8' }, { m: null, d: '8' }, { m: 71, d: '8' }, { m: null, d: '8' }, { m: 67, d: '8' }, { m: null, d: '8' }, { m: 67, d: '8' }]],
        time: '4/4'
      },
      {
        name: 'The combined line',
        how: 'What the listener hears when both parts lock together.',
        bars: [[{ m: 64, d: '8' }, { m: 67, d: '8' }, { m: 69, d: '8' }, { m: 71, d: '8' }, { m: 69, d: '8' }, { m: 67, d: '8' }, { m: 64, d: '8' }, { m: 67, d: '8' }]],
        time: '4/4'
      },
      {
        name: 'Double density',
        how: 'The combined line in sixteenths, twice per bar, as when the irama changes.',
        bars: [[{ m: 64, d: '16' }, { m: 67, d: '16' }, { m: 69, d: '16' }, { m: 71, d: '16' }, { m: 69, d: '16' }, { m: 67, d: '16' }, { m: 64, d: '16' }, { m: 67, d: '16' }, { m: 64, d: '16' }, { m: 67, d: '16' }, { m: 69, d: '16' }, { m: 71, d: '16' }, { m: 69, d: '16' }, { m: 67, d: '16' }, { m: 64, d: '16' }, { m: 67, d: '16' }]],
        time: '4/4'
      }
    ],
    listen: { artist: 'David Lewiston (recordist)', work: 'Music from the Morning of the World' }
  },
  {
    id: 'eastasia-jo-ha-kyu',
    style: 'eastasia',
    name: 'Jo-ha-kyū: one phrase, three speeds',
    focus: 'melody',
    level: 2,
    minutes: 7,
    goal: 'Play one yo-scale phrase slowly, then building, then fast, giving each note shape and weight at every speed.',
    why: 'Many Japanese pieces follow jo-ha-kyū: a slow opening, a gradual build and a fast close. Playing the same notes at three densities is variable practice, and it shows that the slow version needs as much care as the fast one.',
    backing: { click: { beats: 4, sub: 1 } },
    tempo: [50, 80],
    steps: [
      'The yo scale here is D E G A B, five notes with no half steps.',
      'Jo: half notes. Pluck near the bridge for a sharp attack and add a slight bend or slide into each note.',
      'Ha: the same idea in quarters, a little stronger.',
      'Kyū: eighths, driving, then stop on a long D.',
      'Finally play the whole arc without stopping, letting the speed grow instead of jumping.'
    ],
    variations: [
      {
        name: 'Jo (slow)',
        how: 'Long notes. Slide into the G from F♯ and let each note decay.',
        bars: [[{ m: 69, d: 'h' }, { m: 67, d: 'h' }], [{ m: 64, d: 'h' }, { m: 62, d: 'h' }]],
        time: '4/4'
      },
      {
        name: 'Ha (building)',
        how: 'Quarters, rising to B and back.',
        bars: [[{ m: 64, d: 'q' }, { m: 67, d: 'q' }, { m: 69, d: 'q' }, { m: 71, d: 'q' }], [{ m: 69, d: 'q' }, { m: 67, d: 'q' }, { m: 64, d: 'h' }]],
        time: '4/4'
      },
      {
        name: 'Kyū (fast close)',
        how: 'Eighths, firm attack, then a whole-note D.',
        bars: [[{ m: 62, d: '8' }, { m: 64, d: '8' }, { m: 67, d: '8' }, { m: 69, d: '8' }, { m: 71, d: '8' }, { m: 69, d: '8' }, { m: 67, d: '8' }, { m: 64, d: '8' }], [{ m: 62, d: 'w' }]],
        time: '4/4'
      },
      {
        name: 'The whole arc',
        how: 'Jo, ha and kyū in one go.',
        bars: [[{ m: 69, d: 'h' }, { m: 67, d: 'h' }], [{ m: 64, d: 'h' }, { m: 62, d: 'h' }], [{ m: 64, d: 'q' }, { m: 67, d: 'q' }, { m: 69, d: 'q' }, { m: 71, d: 'q' }], [{ m: 69, d: 'q' }, { m: 67, d: 'q' }, { m: 64, d: 'h' }], [{ m: 62, d: '8' }, { m: 64, d: '8' }, { m: 67, d: '8' }, { m: 69, d: '8' }, { m: 71, d: '8' }, { m: 69, d: '8' }, { m: 67, d: '8' }, { m: 64, d: '8' }], [{ m: 62, d: 'w' }]],
        time: '4/4'
      }
    ],
  },
  {
    id: 'eastasia-balungan-layers',
    style: 'eastasia',
    name: 'Gamelan layers: core melody and elaboration',
    focus: 'harmony',
    level: 3,
    minutes: 10,
    goal: 'Play a slow core melody, then elaborations at two and four times its density that move toward each next core note, and close the cycle with a gong tone.',
    why: 'Gamelan has no chords; its “harmony” is layers of one melody at different densities. Building the layers one at a time on a looper is part–whole practice and trains you to hear where each layer is heading.',
    backing: { click: { beats: 4, sub: 2 } },
    tempo: [60, 100],
    steps: [
      'Treat the five notes C D E G A as a stand-in for slendro; a guitar cannot play its real tuning, and this drill is about structure.',
      'Learn the core melody (balungan) in quarters. Its last note, D, is the goal of the cycle.',
      'Play the open 4th string (low D) with the final D as the gong.',
      'Learn the double and quadruple elaborations; each one circles the core notes and arrives on them.',
      'With a looper, record the core melody, add a layer, and play the gong yourself at the end of each cycle.'
    ],
    variations: [
      {
        name: 'Core melody (balungan)',
        how: 'Even quarters. The last D sounds with the low open D string as the gong.',
        bars: [[{ m: 60, d: 'q' }, { m: 62, d: 'q' }, { m: 64, d: 'q' }, { m: 62, d: 'q' }], [{ m: 67, d: 'q' }, { m: 64, d: 'q' }, { m: 62, d: 'h' }]],
        time: '4/4'
      },
      {
        name: 'Two-times elaboration',
        how: 'Two notes per core note, arriving on each core note.',
        bars: [[{ m: 60, d: '8' }, { m: 62, d: '8' }, { m: 60, d: '8' }, { m: 62, d: '8' }, { m: 64, d: '8' }, { m: 62, d: '8' }, { m: 64, d: '8' }, { m: 62, d: '8' }], [{ m: 67, d: '8' }, { m: 64, d: '8' }, { m: 67, d: '8' }, { m: 64, d: '8' }, { m: 62, d: '8' }, { m: 64, d: '8' }, { m: 62, d: 'q' }]],
        time: '4/4'
      },
      {
        name: 'Four-times elaboration',
        how: 'Sixteenths that alternate around each target and land on it.',
        bars: [[{ m: 62, d: '16' }, { m: 60, d: '16' }, { m: 62, d: '16' }, { m: 60, d: '16' }, { m: 60, d: '16' }, { m: 62, d: '16' }, { m: 60, d: '16' }, { m: 62, d: '16' }, { m: 62, d: '16' }, { m: 64, d: '16' }, { m: 62, d: '16' }, { m: 64, d: '16' }, { m: 64, d: '16' }, { m: 62, d: '16' }, { m: 64, d: '16' }, { m: 62, d: '16' }], [{ m: 64, d: '16' }, { m: 67, d: '16' }, { m: 64, d: '16' }, { m: 67, d: '16' }, { m: 67, d: '16' }, { m: 64, d: '16' }, { m: 67, d: '16' }, { m: 64, d: '16' }, { m: 64, d: '16' }, { m: 62, d: '16' }, { m: 64, d: '16' }, { m: 62, d: '16' }, { m: 62, d: 'q' }]],
        time: '4/4'
      },
      {
        name: 'Slower core (irama change)',
        how: 'The core melody spread to half notes while the elaboration stays as fast as before, so it now fits twice as many notes per core note.',
        bars: [[{ m: 60, d: 'h' }, { m: 62, d: 'h' }], [{ m: 64, d: 'h' }, { m: 62, d: 'h' }], [{ m: 67, d: 'h' }, { m: 64, d: 'h' }], [{ m: 62, d: 'w' }]],
        time: '4/4'
      }
    ],
    listen: { artist: 'Pura Paku Alaman', work: 'Javanese Court Gamelan' }
  },

  /* ---------------- Ireland & Scotland ---------------- */
  {
    id: 'celtic-jig-strum',
    style: 'celtic',
    name: 'Jig strum in DADGAD',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Strum a steady 6/8 jig pattern in DADGAD that marks the first of each three and lets open strings ring.',
    why: 'A session guitarist’s main job is rhythm with lift that never rushes. Trying both common jig strokes (down-up-down and down-down-up) is variable practice; you will feel which one suits which tune.',
    backing: { click: { beats: 2, sub: 3 } },
    tempo: [80, 116],
    steps: [
      'Tune to DADGAD (lower strings 6, 2 and 1 a whole step).',
      'Shapes: D5 = 0 0 0 2 0 0; G = 5 5 0 0 0 0; Asus4 = x 0 2 2 0 0. Let the open strings ring.',
      'The click gives two beats per bar, each split in three. Count “1 2 3, 4 5 6”.',
      'Strum down-up-down for each group of three and accent the first stroke.',
      'Keep the arm moving the same way through chord changes.'
    ],
    variations: [
      { name: 'Down-up-down, D5 only', how: 'Accent the first stroke of each group; keep the other two light.' },
      { name: 'Down-down-up', how: 'Same chord, the other common pattern. It gives a heavier, rounder feel.' },
      { name: 'D5 – G – D5 – Asus4', how: 'One bar each, any stroke pattern, with no gap at the changes.' },
      { name: 'Push the change', how: 'Change to the next chord on the last eighth of the bar, just before the downbeat, then hold it. Push only the change into Asus4.' }
    ],
    listen: { artist: 'The Bothy Band', work: 'Old Hag You Have Killed Me' }
  },
  {
    id: 'celtic-reel-picking',
    style: 'celtic',
    name: 'Flatpicking a reel phrase',
    focus: 'technique',
    level: 2,
    minutes: 8,
    goal: 'Flatpick even reel eighths with strict alternate picking, adding lift on the offbeats and a hammer-on cut.',
    why: 'Strict alternate picking makes the picking hand the clock, so the tune stays even at speed. Changing one thing at a time (accent, mode, ornament) builds a flexible phrase you can carry into any reel.',
    backing: { click: { beats: 4, sub: 2 } },
    tempo: [80, 160],
    steps: [
      'Standard tuning. Pick down on every beat and up on every “and”, without exception.',
      'Play the phrase slowly with all notes equal.',
      'Then lift: play the offbeats a little stronger, the way fiddlers push a reel.',
      'Session reels are faster than this drill’s goal; build toward them over weeks and stay relaxed.',
      'Learn real reels by ear from a fiddle, flute or pipes recording and apply the same picking.'
    ],
    variations: [
      {
        name: 'Even eighths in D',
        how: 'An up-and-down arpeggio phrase, strict alternate picking.',
        bars: [[{ m: 62, d: '8' }, { m: 66, d: '8' }, { m: 69, d: '8' }, { m: 66, d: '8' }, { m: 62, d: '8' }, { m: 66, d: '8' }, { m: 69, d: '8' }, { m: 74, d: '8' }], [{ m: 76, d: '8' }, { m: 74, d: '8' }, { m: 71, d: '8' }, { m: 69, d: '8' }, { m: 67, d: '8' }, { m: 66, d: '8' }, { m: 64, d: '8' }, { m: 62, d: '8' }]],
        time: '4/4', key: 'D'
      },
      {
        name: 'Lift on the offbeats',
        how: 'The same notes, accenting each upstroke slightly.',
        bars: [[{ m: 62, d: '8' }, { m: 66, d: '8' }, { m: 69, d: '8' }, { m: 66, d: '8' }, { m: 62, d: '8' }, { m: 66, d: '8' }, { m: 69, d: '8' }, { m: 74, d: '8' }], [{ m: 76, d: '8' }, { m: 74, d: '8' }, { m: 71, d: '8' }, { m: 69, d: '8' }, { m: 67, d: '8' }, { m: 66, d: '8' }, { m: 64, d: '8' }, { m: 62, d: '8' }]],
        time: '4/4', key: 'D'
      },
      {
        name: 'Mixolydian ending',
        how: 'C natural instead of B in bar 2, as in many D Mixolydian tunes, and a quarter-note D to close.',
        bars: [[{ m: 62, d: '8' }, { m: 66, d: '8' }, { m: 69, d: '8' }, { m: 66, d: '8' }, { m: 62, d: '8' }, { m: 66, d: '8' }, { m: 69, d: '8' }, { m: 74, d: '8' }], [{ m: 76, d: '8' }, { m: 74, d: '8' }, { m: 72, d: '8' }, { m: 69, d: '8' }, { m: 67, d: '8' }, { m: 64, d: '8' }, { m: 62, d: 'q' }]],
        time: '4/4', key: 'D'
      },
      {
        name: 'Hammer-on cut',
        how: 'On beat 2, hammer from A to B and back as two sixteenths, like a fiddler’s cut. Keep the picking pattern.',
        bars: [[{ m: 62, d: '8' }, { m: 66, d: '8' }, { m: 69, d: '16' }, { m: 71, d: '16' }, { m: 69, d: '8' }, { m: 66, d: '8' }, { m: 69, d: '8' }, { m: 74, d: '8' }, { m: 69, d: '8' }]],
        time: '4/4', key: 'D'
      }
    ]
  },
  {
    id: 'celtic-modal-backing',
    style: 'celtic',
    name: 'Backing a D Mixolydian tune',
    focus: 'harmony',
    level: 2,
    minutes: 8,
    goal: 'Back a modal tune with open DADGAD shapes that leave out the 3rd, a ringing drone and a simple moving bass.',
    why: 'Many Irish tunes are modal, and a full major chord can fight the melody; open fifths and drones support it instead. Changing one element per variation (voicing, drone, bass, push) builds a backing vocabulary rather than one set of chords.',
    backing: { groove: 'drone', bars: ['D', 'C', 'G', 'D'] },
    tempo: [70, 110],
    steps: [
      'Tune to DADGAD. D5 = 0 0 0 2 0 0, C = x 3 0 0 3 0, G = 5 5 0 0 0 0.',
      'Strum steady quarter or eighth notes, one chord per bar, following the backing.',
      'Hum a D Mixolydian tune you know while you play; the chords follow its arrival points.',
      'Keep the top two open strings (A and D) ringing in every shape.',
      'Play softly, as you would at the edge of a session.'
    ],
    variations: [
      { name: 'Open shapes', how: 'D5, C, G, D5 as given in the steps. No 3rds on top.' },
      { name: 'Drone on top', how: 'Keep the open 1st and 2nd strings ringing through every chord and change only the bass strings.' },
      { name: 'Moving bass', how: 'Single bass notes on beats 1 and 3: D, then C, then G, then D, with a passing note on beat 4 leading to the next root.' },
      { name: 'Pushes', how: 'Change to each chord an eighth note early, on the “and” of 4, and hold it into the bar.' }
    ],
    listen: { artist: 'Martin Hayes & Dennis Cahill', work: 'The Lonesome Touch' }
  },
  {
    id: 'celtic-cuts-rolls',
    style: 'celtic',
    name: 'Cuts and rolls on a jig phrase',
    focus: 'melody',
    level: 3,
    minutes: 9,
    goal: 'Decorate a 6/8 jig phrase with a cut and a roll played with hammer-ons and pull-offs, keeping the jig pulse steady.',
    why: 'Irish ornaments are rhythmic, not decorative extras: a roll fills a long note with the same pulse as the tune. Adding them to a fixed plain phrase one at a time (the plain phrase first) keeps the melody recognisable and the ornament in time.',
    backing: { click: { beats: 2, sub: 3 } },
    tempo: [60, 100],
    steps: [
      'Learn the plain phrase first; it is a jig figure in D.',
      'A cut is a very short higher note just before the main note, here a quick hammer-on and pull-off.',
      'A roll on a long note is: the note, a cut above, the note, a tap below, the note, all within the length of the long note.',
      'Pick only the first note of a roll and play the rest with the left hand.',
      'Keep the jig pulse (two beats per bar) exactly the same with or without ornaments.'
    ],
    variations: [
      {
        name: 'Plain phrase',
        how: 'No ornaments, even eighths in groups of three.',
        bars: [[{ m: 62, d: '8' }, { m: 66, d: '8' }, { m: 69, d: '8' }, { m: 67, d: 'q' }, { m: 66, d: '8' }], [{ m: 64, d: '8' }, { m: 62, d: '8' }, { m: 64, d: '8' }, { m: 66, d: 'q', dot: true }]],
        time: '6/8', key: 'D'
      },
      {
        name: 'Cut on G',
        how: 'A quick A before the G: hammer and pull off.',
        bars: [[{ m: 62, d: '8' }, { m: 66, d: '8' }, { m: 69, d: '8' }, { m: 67, d: '8' }, { m: 69, d: '16' }, { m: 67, d: '16' }, { m: 66, d: '8' }], [{ m: 64, d: '8' }, { m: 62, d: '8' }, { m: 64, d: '8' }, { m: 66, d: 'q', dot: true }]],
        time: '6/8', key: 'D'
      },
      {
        name: 'Roll on G',
        how: 'G, A, G, F♯, G inside one dotted quarter.',
        bars: [[{ m: 62, d: '8' }, { m: 66, d: '8' }, { m: 69, d: '8' }, { m: 67, d: '16' }, { m: 69, d: '16' }, { m: 67, d: '16' }, { m: 66, d: '16' }, { m: 67, d: '8' }], [{ m: 64, d: '8' }, { m: 62, d: '8' }, { m: 64, d: '8' }, { m: 66, d: 'q', dot: true }]],
        time: '6/8', key: 'D'
      },
      {
        name: 'Roll on F♯ at the end',
        how: 'Plain first bar, then a roll on the closing F♯: F♯, G, F♯, E, F♯.',
        bars: [[{ m: 62, d: '8' }, { m: 66, d: '8' }, { m: 69, d: '8' }, { m: 67, d: 'q' }, { m: 66, d: '8' }], [{ m: 64, d: '8' }, { m: 62, d: '8' }, { m: 64, d: '8' }, { m: 66, d: '16' }, { m: 67, d: '16' }, { m: 66, d: '16' }, { m: 64, d: '16' }, { m: 66, d: '8' }]],
        time: '6/8', key: 'D'
      }
    ],
    listen: { artist: 'Kevin Burke', work: 'If the Cap Fits' }
  },

  /* ---------------- Blues ---------------- */
  {
    id: 'blues-shuffle-boogie',
    style: 'blues',
    name: 'Shuffle boogie through a 12-bar in A',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Play the root–5th / root–6th boogie with a long–short shuffle feel through all twelve bars without losing your place.',
    why: 'This low-string figure is the backbone of electric blues rhythm guitar, and the 12-bar form is learned best by playing it, not counting it. Each variation changes one thing (the shape, the ♭7, the muting, the ending) so the boogie becomes flexible.',
    backing: { groove: 'shuffle', bars: ['A7', 'A7', 'A7', 'A7', 'D7', 'D7', 'A7', 'A7', 'E7', 'D7', 'A7', 'E7'] },
    tempo: [70, 120],
    steps: [
      'A: open 5th string with 4th string at fret 2, then fret 4. D: open 4th with 3rd string at 2 and 4. E: open 6th with 5th at 2 and 4.',
      'Play two notes per beat, long–short, like the backing’s ride cymbal.',
      'Rest the picking palm lightly on the strings near the bridge.',
      'Follow the chord name on screen and say the bar number out loud for the first few rounds.',
      'Keep going through mistakes; the form keeps moving.'
    ],
    variations: [
      { name: 'Root–5th, root–6th', how: 'Per beat: 5th, 5th, 6th, 6th, over and over on each chord.', positions: [[5, 0], [4, 2], [4, 4]] },
      { name: 'Add the ♭7', how: 'Per bar: 5th, 6th, ♭7, 6th. On A, the ♭7 is the 4th string at fret 5.', positions: [[5, 0], [4, 2], [4, 4], [4, 5]] },
      { name: 'Open and muted', how: 'Palm-mute bars 1–8 and lift the palm in bars 9–12 for a lift in energy.' },
      { name: 'Turnaround', how: 'In bar 12 (E7), stop the boogie and play E7 on beat 1 only, then come back in at the top.' }
    ],
    listen: { artist: 'Jimmy Reed', work: 'Baby What You Want Me to Do' }
  },
  {
    id: 'blues-bends-in-tune',
    style: 'blues',
    name: 'Bends to pitch in A minor pentatonic',
    focus: 'technique',
    level: 2,
    minutes: 8,
    goal: 'Bend the 4th to the 5th and the ♭7 to the root exactly in tune, and nudge the ♭3 a quarter tone sharp.',
    why: 'Out-of-tune bends are the most common weakness in blues guitar. Playing the target note fretted first gives you an immediate pitch reference, and alternating different bends keeps the ear checking instead of the hand repeating.',
    backing: { groove: 'shuffle', bars: ['A7'] },
    tempo: [60, 90],
    steps: [
      'Box 1 at the 5th fret. Use two or three fingers behind the bending finger.',
      'Play the target note fretted, then pick the lower note and bend until it matches.',
      'Hold the bend for its full length; do not let it sag.',
      'Add vibrato only once you arrive at pitch.',
      'If a bend falls short, play the reference again before the next try.'
    ],
    variations: [
      {
        name: 'D up to E (3rd string)',
        how: 'E fretted on the 2nd string, then D at the 7th fret of the 3rd string bent a whole step to E.',
        bars: [[{ m: 64, d: 'q', dot: true }, { m: 62, d: 'q', dot: true }, { m: 64, d: 'h', dot: true }]],
        time: '12/8', key: 'A', positions: [[2, 5], [3, 7]]
      },
      {
        name: 'G up to A (2nd string)',
        how: 'A fretted on the 1st string, then G at the 8th fret of the 2nd string bent to A.',
        bars: [[{ m: 69, d: 'q', dot: true }, { m: 67, d: 'q', dot: true }, { m: 69, d: 'h', dot: true }]],
        time: '12/8', key: 'A', positions: [[1, 5], [2, 8]]
      },
      {
        name: 'The ♭3, a quarter tone up',
        how: 'C at the 8th fret of the 1st string, pushed slightly sharp toward C♯ on the second hit, then resolved to A.',
        bars: [[{ m: 72, d: 'q', dot: true }, { m: 72, d: 'q', dot: true }, { m: 69, d: 'h', dot: true }]],
        time: '12/8', key: 'A', positions: [[1, 8], [1, 5]]
      },
      {
        name: 'Bend, release, walk down',
        how: 'Bend D to E, release back to D, then C and A on the 3rd and 4th strings.',
        bars: [[{ m: 64, d: 'q', dot: true }, { m: 62, d: 'q', dot: true }, { m: 60, d: 'q', dot: true }, { m: 57, d: 'q', dot: true }]],
        time: '12/8', key: 'A', positions: [[3, 7], [3, 5], [4, 7]]
      }
    ],
    listen: { artist: 'B.B. King', work: 'Live at the Regal' }
  },
  {
    id: 'blues-ninth-chords',
    style: 'blues',
    name: 'Jump-blues comping with 9th chords',
    focus: 'harmony',
    level: 2,
    minutes: 8,
    goal: 'Comp a 12-bar with a quick change using small 9th and 7th shapes on 2 and 4, sliding into chords from a fret below.',
    why: 'Jump and West Coast blues players such as T-Bone Walker comp with jazzy 9th chords instead of the boogie. Moving one compact shape around the neck shows how the I, IV and V are related, and the slide-in adds the style’s swing.',
    backing: { groove: 'shuffle', bars: ['A7', 'D9', 'A7', 'A7', 'D9', 'D9', 'A7', 'A7', 'E9', 'D9', 'A7', 'E9'] },
    tempo: [70, 110],
    steps: [
      'A7 shell: 5 x 5 6 x x. D9: x 5 4 5 5 x. E9: x 7 6 7 7 x.',
      'Strum short chords on beats 2 and 4 only, like a horn section’s stabs.',
      'Notice bar 2: the quick change to IV and straight back.',
      'Keep the shapes small and the strums light; the bass player has the root.',
      'Count the form until you feel bars 9–12 coming.'
    ],
    variations: [
      { name: 'Shapes on 2 and 4', how: 'One short stab on each backbeat. The D9 shape is shown.', positions: [[5, 5], [4, 4], [3, 5], [2, 5]] },
      { name: 'Slide in from below', how: 'Hit each 9th chord a fret low on the “and” before the beat and slide it up into place.' },
      { name: 'Same shape, three places', how: 'Play D9 at the 5th fret, E9 at the 7th fret and A9 at the 12th fret, so the whole blues uses one shape.' },
      { name: 'Turnaround stab', how: 'In bars 11–12, play A7 on beat 1, then E9 on beat 4 of bar 12, sliding up from E♭9.' }
    ],
    listen: { artist: 'T-Bone Walker', work: 'Call It Stormy Monday' }
  },
  {
    id: 'blues-call-response',
    style: 'blues',
    name: 'Answer the vocal line',
    focus: 'melody',
    level: 3,
    minutes: 10,
    goal: 'Leave the first two bars of each line to the singer and answer in bars 3–4 with a phrase that ends on A and stops before bar 5.',
    why: 'Blues guitar grew out of answering the voice, and a good answer is short and ends somewhere definite. Rotating minor, bent and major-pentatonic answers over the same gap trains choice and restraint, and making your own is retrieval practice.',
    backing: { groove: 'shuffle', bars: ['A7', 'A7', 'A7', 'A7'] },
    tempo: [60, 90],
    steps: [
      'Sing or hum a two-bar line in bars 1–2, or just count them. Play nothing.',
      'Play the written answer in bars 3–4.',
      'Let the last A ring, then mute it before bar 1 returns.',
      'Feel each beat as long–short, as in the backing.',
      'After the written answers, invent your own: start after the singer, end on A, then stop.'
    ],
    variations: [
      {
        name: 'Minor pentatonic answer',
        how: 'C A G E G A, then down to the low A.',
        bars: [[{ m: null, d: 'w', dot: true }], [{ m: null, d: 'w', dot: true }], [{ m: null, d: 'q' }, { m: 72, d: '8' }, { m: 69, d: 'q' }, { m: 67, d: '8' }, { m: 64, d: 'q' }, { m: 67, d: '8' }, { m: 69, d: 'q', dot: true }], [{ m: 64, d: 'q' }, { m: 60, d: '8' }, { m: 57, d: 'h', dot: true }, { m: null, d: 'q', dot: true }]],
        time: '12/8', key: 'A'
      },
      {
        name: 'With a bend',
        how: 'The first note is D bent up to E on the 3rd string; release it and walk down to A.',
        bars: [[{ m: null, d: 'w', dot: true }], [{ m: null, d: 'w', dot: true }], [{ m: null, d: 'q' }, { m: 64, d: '8' }, { m: 62, d: 'q' }, { m: 60, d: '8' }, { m: 57, d: 'q' }, { m: 60, d: '8' }, { m: 57, d: 'q', dot: true }], [{ m: 55, d: 'q' }, { m: 57, d: '8' }, { m: 57, d: 'h', dot: true }, { m: null, d: 'q', dot: true }]],
        time: '12/8', key: 'A'
      },
      {
        name: 'Major pentatonic answer',
        how: 'F♯ E C♯ B C♯ A, then the C–C♯ rub before landing. Sweeter, B.B. King territory.',
        bars: [[{ m: null, d: 'w', dot: true }], [{ m: null, d: 'w', dot: true }], [{ m: null, d: 'q' }, { m: 66, d: '8' }, { m: 64, d: 'q' }, { m: 61, d: '8' }, { m: 59, d: 'q' }, { m: 61, d: '8' }, { m: 57, d: 'q', dot: true }], [{ m: 60, d: 'q' }, { m: 61, d: '8' }, { m: 57, d: 'h', dot: true }, { m: null, d: 'q', dot: true }]],
        time: '12/8', key: 'A'
      },
      { name: 'Your own answer', how: 'Bars 3–4 only, no more than six notes, end on A. Make a different answer every round.' }
    ],
    listen: { artist: 'Freddie King', work: 'Have You Ever Loved a Woman' }
  },

  /* ---------------- Rock & metal ---------------- */
  {
    id: 'rock-downpicked-eighths',
    style: 'rock',
    name: 'Down-picked eighths and a riff',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Play palm-muted, all-downstroke eighths that are identical in volume and length, then carry that into a riff with silent rests.',
    why: 'Rock is judged by its rhythm guitar, and evenness comes from one repeated motion. Keeping the stroke fixed while the riff, the rests and the gallop change one at a time builds control instead of a single memorised riff.',
    backing: { rhythm: 'backbeat' },
    tempo: [90, 150],
    steps: [
      'Rest the side of the picking hand lightly on the low strings right at the bridge.',
      'Down-pick every eighth note on the open low E. Keep the forearm loose; the motion comes from the wrist.',
      'Lock to the kick drum, and make every note the same volume and length.',
      'In rests, mute with both hands so the rest is truly silent.',
      'Record yourself and listen for uneven notes before raising the tempo.'
    ],
    variations: [
      {
        name: 'Open E eighths',
        how: 'Eight palm-muted downstrokes per bar.',
        bars: [[{ m: 40, d: '8' }, { m: 40, d: '8' }, { m: 40, d: '8' }, { m: 40, d: '8' }, { m: 40, d: '8' }, { m: 40, d: '8' }, { m: 40, d: '8' }, { m: 40, d: '8' }]],
        time: '4/4', key: 'Em'
      },
      {
        name: 'E5 – G5 – A5',
        how: 'Roots shown; play them as power chords (root and fifth). Four eighths of E5, two of G5, two of A5.',
        bars: [[{ m: 40, d: '8' }, { m: 40, d: '8' }, { m: 40, d: '8' }, { m: 40, d: '8' }, { m: 43, d: '8' }, { m: 43, d: '8' }, { m: 45, d: '8' }, { m: 45, d: '8' }]],
        time: '4/4', key: 'Em', positions: [[6, 0], [6, 3], [6, 5]]
      },
      {
        name: 'Silent rests',
        how: 'The same riff with rests; each rest must be dead silent.',
        bars: [[{ m: 40, d: '8' }, { m: 40, d: '8' }, { m: null, d: '8' }, { m: 40, d: '8' }, { m: 43, d: '8' }, { m: null, d: '8' }, { m: 45, d: 'q' }]],
        time: '4/4', key: 'Em'
      },
      {
        name: 'Gallop',
        how: 'An eighth and two sixteenths on each beat (down, down-up), palm-muted, as in heavy metal.',
        bars: [[{ m: 40, d: '8' }, { m: 40, d: '16' }, { m: 40, d: '16' }, { m: 40, d: '8' }, { m: 40, d: '16' }, { m: 40, d: '16' }, { m: 40, d: '8' }, { m: 40, d: '16' }, { m: 40, d: '16' }, { m: 40, d: '8' }, { m: 40, d: '16' }, { m: 40, d: '16' }]],
        time: '4/4', key: 'Em'
      }
    ],
    listen: { artist: 'AC/DC', work: 'Back in Black' }
  },
  {
    id: 'rock-bends-vibrato',
    style: 'rock',
    name: 'In-tune bends and wide vibrato',
    focus: 'technique',
    level: 2,
    minutes: 8,
    goal: 'Bend whole steps to pitch in B minor pentatonic and add an even, unhurried vibrato only after you arrive.',
    why: 'Rock lead grows from the blues bend, and a slow, even vibrato says more than a fast run. Checking every bend against a fretted reference gives instant feedback, and changing which bend you play keeps your ear working.',
    backing: { rhythm: 'backbeat' },
    tempo: [70, 110],
    steps: [
      'B minor pentatonic box at the 7th fret.',
      'Play the fretted reference note first, then bend to match it.',
      'Support the bending finger with the fingers behind it and turn the wrist as if turning a door handle.',
      'Hold the pitch, then add vibrato: a slight release and return, even and in time.',
      'Use a little gain at most, so you can hear the pitch clearly.'
    ],
    variations: [
      {
        name: 'E up to F♯ (3rd string)',
        how: 'F♯ fretted at the 7th fret of the 2nd string, then E at the 9th fret of the 3rd string bent a whole step.',
        bars: [[{ m: 66, d: 'q' }, { m: 64, d: 'q' }, { m: 66, d: 'h' }]],
        time: '4/4', key: 'Bm', positions: [[2, 7], [3, 9]]
      },
      {
        name: 'A up to B (2nd string)',
        how: 'B fretted at the 7th fret of the 1st string, then A at the 10th fret of the 2nd string bent a whole step.',
        bars: [[{ m: 71, d: 'q' }, { m: 69, d: 'q' }, { m: 71, d: 'h' }]],
        time: '4/4', key: 'Bm', positions: [[1, 7], [2, 10]]
      },
      {
        name: 'Bend, release, land',
        how: 'Bend A to B, release to A, then land on F♯ (2nd string, 7th fret) with vibrato.',
        bars: [[{ m: 71, d: 'q' }, { m: 69, d: 'q' }, { m: 66, d: 'h' }]],
        time: '4/4', key: 'Bm', positions: [[2, 10], [2, 7]]
      },
      {
        name: 'Pre-bend and release',
        how: 'Bend A to B without picking, then pick and let it fall back to A slowly over three beats.',
        bars: [[{ m: 71, d: 'q' }, { m: 69, d: 'h', dot: true }]],
        time: '4/4', key: 'Bm'
      },
      {
        name: 'Vibrato on a bent note',
        how: 'Bend A to B and hold it for a whole bar with vibrato in even eighth-note pulses.',
        bars: [[{ m: 71, d: 'w' }]],
        time: '4/4', key: 'Bm'
      }
    ],
    listen: { artist: 'Pink Floyd', work: 'Comfortably Numb' }
  },
  {
    id: 'rock-mixolydian-progression',
    style: 'rock',
    name: 'I–♭VII–IV in three voicings',
    focus: 'harmony',
    level: 2,
    minutes: 7,
    goal: 'Play the Mixolydian I–♭VII–IV (D–C–G) as power chords, open chords and small triads on the top strings.',
    why: 'This move, borrowed from Mixolydian, is one of the most common in rock. Playing it in three voicings shows how the same harmony sounds under distortion, ringing open, or cutting through in a band.',
    backing: { groove: 'rock', bars: ['D', 'C', 'G', 'G'] },
    tempo: [80, 120],
    steps: [
      'Strum eighths with the backing, one chord per bar, G for two bars.',
      'Notice that C is not in the key of D major; the ♭VII is the Mixolydian sound.',
      'Change voicing per variation but keep the strum identical.',
      'Mute strings you are not playing so each voicing sounds clean.'
    ],
    variations: [
      { name: 'Power chords', how: 'D5 at x 5 7 7 x x, C5 at x 3 5 5 x x, G5 at 3 5 5 x x x.', positions: [[5, 5], [4, 7]] },
      { name: 'Open chords', how: 'Open D, C and G, letting the strings ring.' },
      { name: 'Triads on strings 3–1', how: 'D = 7 7 5, C = 5 5 3, G = 4 3 3. Small shapes that cut through.', positions: [[3, 7], [2, 7], [1, 5]] },
      { name: 'Ringing D on top', how: 'Open chords again, but keep the open D string (4th) or a high D ringing over every chord.' }
    ],
    listen: { artist: 'Lynyrd Skynyrd', work: 'Sweet Home Alabama' }
  },
  {
    id: 'rock-pentatonic-sequences',
    style: 'rock',
    name: 'Sequences in E minor pentatonic and modes',
    focus: 'melody',
    level: 3,
    minutes: 10,
    goal: 'Play descending sixteenth-note sequences in fours and threes with strict alternate picking, then hear Aeolian and Phrygian colours in the same pattern.',
    why: 'Sequences turn a scale into phrases and train the picking hand at speed. Changing the grouping and then the scale, one at a time, is variable practice: the hand learns the motion and the ear learns the colour.',
    backing: { rhythm: 'backbeat' },
    tempo: [60, 120],
    steps: [
      'E minor pentatonic box at the 12th fret.',
      'Alternate pick strictly, starting with a downstroke on each beat.',
      'Start at a tempo where every note is clean; raise it 4 bpm at a time.',
      'Accent the first note of each group so you hear the shape.',
      'Then play the same pattern in E Aeolian and E Phrygian and listen for F♯ against F.'
    ],
    variations: [
      {
        name: 'Groups of four',
        how: 'Down the pentatonic box, four notes from each starting note.',
        bars: [[{ m: 76, d: '16' }, { m: 74, d: '16' }, { m: 71, d: '16' }, { m: 69, d: '16' }, { m: 74, d: '16' }, { m: 71, d: '16' }, { m: 69, d: '16' }, { m: 67, d: '16' }, { m: 71, d: '16' }, { m: 69, d: '16' }, { m: 67, d: '16' }, { m: 64, d: '16' }, { m: 69, d: '16' }, { m: 67, d: '16' }, { m: 64, d: '16' }, { m: 62, d: '16' }], [{ m: 67, d: '16' }, { m: 64, d: '16' }, { m: 62, d: '16' }, { m: 59, d: '16' }, { m: 64, d: '16' }, { m: 62, d: '16' }, { m: 59, d: '16' }, { m: 57, d: '16' }, { m: 62, d: '16' }, { m: 59, d: '16' }, { m: 57, d: '16' }, { m: 55, d: '16' }, { m: 52, d: 'q' }]],
        time: '4/4', key: 'Em'
      },
      {
        name: 'Groups of three',
        how: 'Three-note groups in sixteenths, so the accent moves across the beat.',
        bars: [[{ m: 76, d: '16' }, { m: 74, d: '16' }, { m: 71, d: '16' }, { m: 74, d: '16' }, { m: 71, d: '16' }, { m: 69, d: '16' }, { m: 71, d: '16' }, { m: 69, d: '16' }, { m: 67, d: '16' }, { m: 69, d: '16' }, { m: 67, d: '16' }, { m: 64, d: '16' }, { m: 67, d: '16' }, { m: 64, d: '16' }, { m: 62, d: '16' }, { m: null, d: '16' }], [{ m: 64, d: '16' }, { m: 62, d: '16' }, { m: 59, d: '16' }, { m: 62, d: '16' }, { m: 59, d: '16' }, { m: 57, d: '16' }, { m: 59, d: '16' }, { m: 57, d: '16' }, { m: 55, d: '16' }, { m: 57, d: '16' }, { m: 55, d: '16' }, { m: 52, d: '16' }, { m: null, d: 'q' }]],
        time: '4/4', key: 'Em'
      },
      {
        name: 'E Aeolian in fours',
        how: 'The seven-note natural minor: C and F♯ join the pentatonic.',
        bars: [[{ m: 76, d: '16' }, { m: 74, d: '16' }, { m: 72, d: '16' }, { m: 71, d: '16' }, { m: 74, d: '16' }, { m: 72, d: '16' }, { m: 71, d: '16' }, { m: 69, d: '16' }, { m: 72, d: '16' }, { m: 71, d: '16' }, { m: 69, d: '16' }, { m: 67, d: '16' }, { m: 71, d: '16' }, { m: 69, d: '16' }, { m: 67, d: '16' }, { m: 66, d: '16' }], [{ m: 64, d: 'w' }]],
        time: '4/4', key: 'Em'
      },
      {
        name: 'E Phrygian in fours',
        how: 'The same pattern with F natural: darker, the metal sound.',
        bars: [[{ m: 76, d: '16' }, { m: 74, d: '16' }, { m: 72, d: '16' }, { m: 71, d: '16' }, { m: 74, d: '16' }, { m: 72, d: '16' }, { m: 71, d: '16' }, { m: 69, d: '16' }, { m: 72, d: '16' }, { m: 71, d: '16' }, { m: 69, d: '16' }, { m: 67, d: '16' }, { m: 71, d: '16' }, { m: 69, d: '16' }, { m: 67, d: '16' }, { m: 65, d: '16' }], [{ m: 64, d: 'w' }]],
        time: '4/4', key: 'Em'
      }
    ],
    listen: { artist: 'Led Zeppelin', work: 'Heartbreaker' }
  },

  /* ---------------- Funk, soul & R&B ---------------- */
  {
    id: 'funksoul-sixteenth-scratch',
    style: 'funksoul',
    name: 'Sixteenth scratch with moving accents',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Keep the strumming hand moving in even sixteenths and let chosen accents ring out of a muted scratch.',
    why: 'In funk the right hand is a drum: the motion never stops, and the groove lives in which strokes sound. Moving the accent while the motion stays fixed is variable practice that frees the hand from one pattern.',
    backing: { rhythm: 'funk16' },
    tempo: [76, 104],
    steps: [
      'E9 on strings 4–1: 6 7 7 7. Rest the fingers on the strings without pressing for the muted scratch.',
      'Strum sixteenths: down on the beat and the “&”, up on the “e” and the “a”. Small, loose wrist motion.',
      'Press the chord down only for the accented stroke, then release at once.',
      'Count “1 e & a 2 e & a” out loud for the first rounds.',
      'Lock with the hi-hat, not the snare.'
    ],
    variations: [
      { name: 'All muted', how: 'Every stroke scratched, none pressed. Listen for even volume.', positions: [[4, 6], [3, 7], [2, 7], [1, 7]] },
      { name: 'Accent on 1', how: 'Press the chord on beat 1 only; everything else muted.' },
      { name: '1 and the “a” of 2', how: 'Two accents: a downstroke on 1 and an upstroke on the “a” of 2.' },
      { name: 'With the snare', how: 'Accents on 2 and 4, plus the “e” of 3.' },
      { name: 'Your own cell', how: 'Choose three accents in the bar and repeat them for a full minute without changing.' }
    ],
    listen: { artist: 'James Brown', work: 'Papa’s Got a Brand New Bag' }
  },
  {
    id: 'funksoul-sixths-fills',
    style: 'funksoul',
    name: 'Soul fills in 6ths and 3rds',
    focus: 'melody',
    level: 2,
    minutes: 8,
    goal: 'Answer between vocal lines with short double-stop fills in 6ths and 3rds that slide into chord tones.',
    why: 'Soul guitarists such as Steve Cropper and Curtis Mayfield fill the gaps with sweet double stops instead of single-note runs. Using the same rhythm with different interval shapes builds a vocabulary of fills that fit under a singer.',
    backing: { groove: 'funk', bars: ['G', 'G', 'C', 'C'] },
    tempo: [70, 96],
    steps: [
      'The staff shows the top note; the lower note is a 6th below on the 3rd string (or a 3rd below on the 2nd string).',
      'Pluck the two strings together with pick and middle finger, or two fingers, and mute the string between.',
      'Leave beats 1 and 2 for the singer and fill in beats 3 and 4.',
      'Slide into the first shape from a fret below for a soul sound.',
      'Never play two fills in a row; leave a bar empty.'
    ],
    variations: [
      {
        name: '6ths down to G',
        how: 'Strings 3 and 1: frets 7/7, 5/5, 4/3. Top notes B, A, G.',
        bars: [[{ m: null, d: 'h' }, { m: 71, d: '8' }, { m: 69, d: '8' }, { m: 67, d: 'q' }]],
        time: '4/4', key: 'G', positions: [[3, 7], [1, 7], [3, 5], [1, 5], [3, 4], [1, 3]]
      },
      {
        name: '3rds on strings 3 and 2',
        how: 'D/F♯, C/E, B/D: frets 7/7, 5/5, 4/3. Hammer the lower pair into the first shape.',
        bars: [[{ m: null, d: 'h' }, { m: 66, d: '8' }, { m: 64, d: '8' }, { m: 62, d: 'q' }]],
        time: '4/4', key: 'G', positions: [[3, 7], [2, 7], [3, 5], [2, 5], [3, 4], [2, 3]]
      },
      {
        name: '6ths up over C',
        how: 'Strings 3 and 1: frets 9/8, 10/10, 12/12. Top notes C, D, E.',
        bars: [[{ m: null, d: 'h' }, { m: 72, d: '8' }, { m: 74, d: '8' }, { m: 76, d: 'q' }]],
        time: '4/4', key: 'G', positions: [[3, 9], [1, 8], [3, 10], [1, 10], [3, 12], [1, 12]]
      },
      { name: 'Fill only after the change', how: 'Play one fill in the last bar of G and one in the last bar of C, nowhere else.' }
    ],
    listen: { artist: 'Otis Redding', work: '(Sittin’ On) The Dock of the Bay' }
  },
  {
    id: 'funksoul-one-chord-vamp',
    style: 'funksoul',
    name: 'One-chord vamp, four shapes',
    focus: 'harmony',
    level: 2,
    minutes: 8,
    goal: 'Hold an Em7 groove for minutes while moving between small shapes: Em7, Em9, the Dorian IV and a neighbour chord.',
    why: 'Funk often stays on one chord, and the interest comes from small voicing moves and the rhythm. Rotating shapes over the same vamp teaches the Dorian sound (the major IV over a minor chord) by ear, not by theory.',
    backing: { groove: 'funk', bars: ['Em7', 'Em7'] },
    tempo: [84, 104],
    steps: [
      'Keep the sixteenth motion from the scratch drill.',
      'Use one rhythm cell for the whole drill; only the shapes change.',
      'Em7 on strings 4–2: 9 7 8. Em9: x 7 5 7 7 x. A on strings 3–1: 6 5 5.',
      'Change shapes on beat 1 or on the “a” of 2 and come back by the next bar.',
      'Stay on each variation for at least two full rounds.'
    ],
    variations: [
      { name: 'Em7, strings 4–2', how: 'Just the one shape, accents on 1 and the “a” of 2.', positions: [[4, 9], [3, 7], [2, 8]] },
      { name: 'Em9', how: 'x 7 5 7 7 x: richer and darker. Same rhythm.', positions: [[5, 7], [4, 5], [3, 7], [2, 7]] },
      { name: 'Em7 – A (Dorian IV)', how: 'Em7 on strings 3–1 (7 8 7) for one bar, A on strings 3–1 (6 5 5) for the next.', positions: [[3, 7], [2, 8], [1, 7]] },
      { name: 'Neighbour F♯m7', how: 'On the “a” of 4 slide the Em7 shape up two frets to F♯m7 and back down on the 1.' }
    ],
    listen: { artist: 'Chic', work: 'Good Times' }
  },
  {
    id: 'funksoul-single-note-lines',
    style: 'funksoul',
    name: 'Single-note lines with ghost strokes',
    focus: 'technique',
    level: 3,
    minutes: 9,
    goal: 'Play syncopated single-note lines in E Dorian inside a constant sixteenth motion, with every rest a muted ghost stroke.',
    why: 'New Orleans and James Brown players built grooves from single notes as much as chords, and the muted strokes between notes are what make them funky. Keeping the hand moving while note placement shifts is the hardest part of funk timing, so the lines change one placement at a time.',
    backing: { rhythm: 'funk16' },
    tempo: [70, 100],
    steps: [
      'Play on strings 4 and 3 around the 2nd–7th frets.',
      'The picking hand moves in sixteenths all the time: down on the beat and the “&”, up on the “e” and the “a”.',
      'Every rest in the staff is a muted stroke: lift the fretting finger slightly so the string goes dead.',
      'Notes must be short and percussive; release each one before the next stroke.',
      'Use a clean, bright tone.'
    ],
    variations: [
      {
        name: 'On the beat',
        how: 'Starts on 1; E, G and A.',
        bars: [[{ m: 52, d: '16' }, { m: null, d: '16' }, { m: null, d: '16' }, { m: 55, d: '16' }, { m: null, d: '16' }, { m: 52, d: '16' }, { m: null, d: '16' }, { m: 55, d: '16' }, { m: 57, d: '16' }, { m: null, d: '16' }, { m: 55, d: '16' }, { m: null, d: '16' }, { m: 52, d: '8' }, { m: null, d: '8' }]],
        time: '4/4', key: 'Em'
      },
      {
        name: 'Starting on the “e”',
        how: 'The same idea pushed off the beat; B on beat 3.',
        bars: [[{ m: null, d: '16' }, { m: 52, d: '16' }, { m: null, d: '16' }, { m: 52, d: '16' }, { m: 55, d: '16' }, { m: null, d: '16' }, { m: 57, d: '16' }, { m: null, d: '16' }, { m: 59, d: '16' }, { m: null, d: '16' }, { m: 57, d: '16' }, { m: 55, d: '16' }, { m: 52, d: 'q' }]],
        time: '4/4', key: 'Em'
      },
      {
        name: 'Add the Dorian C♯',
        how: 'Up to C♯, the note that makes it Dorian, and back.',
        bars: [[{ m: 52, d: '16' }, { m: null, d: '16' }, { m: 55, d: '16' }, { m: 57, d: '16' }, { m: null, d: '16' }, { m: 59, d: '16' }, { m: null, d: '16' }, { m: 61, d: '16' }, { m: null, d: '16' }, { m: 59, d: '16' }, { m: 57, d: '16' }, { m: null, d: '16' }, { m: 55, d: '16' }, { m: 52, d: '16' }, { m: null, d: '8' }]],
        time: '4/4', key: 'Em'
      },
      {
        name: 'An octave up',
        how: 'The first line on strings 2 and 1. Same picking, brighter.',
        bars: [[{ m: 64, d: '16' }, { m: null, d: '16' }, { m: null, d: '16' }, { m: 67, d: '16' }, { m: null, d: '16' }, { m: 64, d: '16' }, { m: null, d: '16' }, { m: 67, d: '16' }, { m: 69, d: '16' }, { m: null, d: '16' }, { m: 67, d: '16' }, { m: null, d: '16' }, { m: 64, d: '8' }, { m: null, d: '8' }]],
        time: '4/4', key: 'Em'
      }
    ],
    listen: { artist: 'The Meters', work: 'Cissy Strut' }
  },

  /* ---------------- Country, bluegrass & folk ---------------- */
  {
    id: 'country-boomchick-bass',
    style: 'country',
    name: 'Boom-chick with alternating bass and walk-ups',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Play a strong boom-chick on G, C and D with alternating bass notes and a walk-up into each new chord.',
    why: 'In country and bluegrass the guitar’s bass notes drive the band as much as the strums. Adding one element at a time (alternation, then walk-ups) is part practice that keeps the strum steady while the bass gets busier.',
    backing: { groove: 'boomchick', bars: ['G', 'G', 'C', 'C', 'D', 'D', 'G', 'G'] },
    tempo: [80, 130],
    steps: [
      'Bass note on 1 and 3, a short, crisp strum on 2 and 4.',
      'Bass notes as strong as the strums; pick them with full tone.',
      'G: root on the 6th string (fret 3), alternate on the 4th (open D). C: 5th string fret 3, alternate on the 6th string fret 3. D: open 4th, alternate on the open 5th.',
      'Walk-ups go in the last two beats before a change; use them only there.'
    ],
    variations: [
      { name: 'Root only', how: 'The root on 1 and 3 under every chord.', positions: [[6, 3], [4, 0]] },
      { name: 'Root and fifth', how: 'Root on 1, the alternate bass on 3.' },
      {
        name: 'Walk up from G to C',
        how: 'In the second bar of G, replace beats 3 and 4 with A and B, landing on C. Rests are where the strums go.',
        bars: [[{ m: 43, d: 'q' }, { m: null, d: 'q' }, { m: 50, d: 'q' }, { m: null, d: 'q' }], [{ m: 43, d: 'q' }, { m: null, d: 'q' }, { m: 45, d: 'q' }, { m: 47, d: 'q' }], [{ m: 48, d: 'q' }, { m: null, d: 'q' }, { m: 43, d: 'q' }, { m: null, d: 'q' }]],
        time: '4/4', key: 'G'
      },
      {
        name: 'Walk down from D to G',
        how: 'In the second D bar play D, a strum, then C and B on beats 3 and 4, landing on G.',
        bars: [[{ m: 50, d: 'q' }, { m: null, d: 'q' }, { m: 45, d: 'q' }, { m: null, d: 'q' }], [{ m: 50, d: 'q' }, { m: null, d: 'q' }, { m: 48, d: 'q' }, { m: 47, d: 'q' }], [{ m: 43, d: 'q' }, { m: null, d: 'q' }, { m: 50, d: 'q' }, { m: null, d: 'q' }]],
        time: '4/4', key: 'G'
      }
    ],
    listen: { artist: 'Johnny Cash', work: 'Folsom Prison Blues' }
  },
  {
    id: 'country-travis-picking',
    style: 'country',
    name: 'Travis picking on C and G',
    focus: 'technique',
    level: 2,
    minutes: 10,
    goal: 'Keep the thumb steady on the bass strings like a clock while the fingers add notes between the beats.',
    why: 'Travis picking needs a thumb that runs without thought, so it is built one layer at a time: thumb alone, then one finger, then the full pattern. That part–whole order is how Merle Travis’s style is usually taught.',
    backing: { click: { beats: 4, sub: 2 } },
    tempo: [60, 110],
    steps: [
      'Thumb only first: on C, strings 5, 4, 6, 4 (C, E, G, E) on the beats. Palm-mute lightly with the edge of the hand.',
      'Add one finger note on the “and” of 2.',
      'Then the full pattern: a finger note on every “and”, the thumb never stopping.',
      'Check that the thumb has not slowed or rushed when the fingers come in.',
      'Move to G with the same pattern; the thumb alternates strings 6, 4, 5, 4.'
    ],
    variations: [
      {
        name: 'Thumb alone on C',
        how: 'C, E, G, E on the beats.',
        bars: [[{ m: 48, d: 'q' }, { m: 52, d: 'q' }, { m: 43, d: 'q' }, { m: 52, d: 'q' }]],
        time: '4/4', key: 'C', positions: [[5, 3], [4, 2], [6, 3]]
      },
      {
        name: 'One finger note',
        how: 'Add C on the 2nd string (index) on the “and” of 2.',
        bars: [[{ m: 48, d: 'q' }, { m: 52, d: '8' }, { m: 60, d: '8' }, { m: 43, d: 'q' }, { m: 52, d: 'q' }]],
        time: '4/4', key: 'C'
      },
      {
        name: 'Full pattern on C',
        how: 'Thumb on the beats, middle finger on the 1st string and index on the 2nd string between them.',
        bars: [[{ m: 48, d: '8' }, { m: 64, d: '8' }, { m: 52, d: '8' }, { m: 60, d: '8' }, { m: 43, d: '8' }, { m: 64, d: '8' }, { m: 52, d: '8' }, { m: 60, d: '8' }]],
        time: '4/4', key: 'C', positions: [[5, 3], [1, 0], [4, 2], [2, 1], [6, 3]]
      },
      {
        name: 'Full pattern on G',
        how: 'Thumb on G, D, B, D (strings 6, 4, 5, 4); fingers on G (1st string, 3rd fret) and B (open 2nd).',
        bars: [[{ m: 43, d: '8' }, { m: 67, d: '8' }, { m: 50, d: '8' }, { m: 59, d: '8' }, { m: 47, d: '8' }, { m: 67, d: '8' }, { m: 50, d: '8' }, { m: 59, d: '8' }]],
        time: '4/4', key: 'G', positions: [[6, 3], [1, 3], [4, 0], [2, 0], [5, 2]]
      }
    ],
    listen: { artist: 'Merle Travis', work: 'Cannon Ball Rag' }
  },
  {
    id: 'country-fiddle-tune-picking',
    style: 'country',
    name: 'Fiddle-tune lines and crosspicking',
    focus: 'melody',
    level: 2,
    minutes: 8,
    goal: 'Flatpick fiddle-tune style eighth-note lines in G with strict alternate picking and a strong, round tone, then try a crosspicked roll.',
    why: 'Flatpicked fiddle tunes make the picking hand the clock: down on the beat, up on the offbeat, always. Moving between lines, a pickup and a crosspicking roll keeps the hand honest when the pattern changes.',
    backing: { groove: 'boomchick', bars: ['G', 'D7'] },
    tempo: [70, 130],
    steps: [
      'Use a heavy pick and play from the wrist.',
      'Down on every beat, up on every “and”, even when you change strings.',
      'Aim for each note to be full and even before you raise the tempo; Doc Watson’s power comes from solid notes, not speed.',
      'Learn real fiddle tunes from fiddle recordings as well as guitar ones.'
    ],
    variations: [
      {
        name: 'G to D7 line',
        how: 'Arpeggio and scale over G, then over D7 with the C natural.',
        bars: [[{ m: 67, d: '8' }, { m: 62, d: '8' }, { m: 59, d: '8' }, { m: 62, d: '8' }, { m: 67, d: '8' }, { m: 71, d: '8' }, { m: 69, d: '8' }, { m: 67, d: '8' }], [{ m: 66, d: '8' }, { m: 69, d: '8' }, { m: 62, d: '8' }, { m: 66, d: '8' }, { m: 69, d: '8' }, { m: 72, d: '8' }, { m: 71, d: '8' }, { m: 69, d: '8' }]],
        time: '4/4', key: 'G'
      },
      {
        name: 'Pickup on an upstroke',
        how: 'Rest for a beat and a half, then start on an upstroke.',
        bars: [[{ m: null, d: 'q', dot: true }, { m: 62, d: '8' }, { m: 67, d: '8' }, { m: 66, d: '8' }, { m: 64, d: '8' }, { m: 62, d: '8' }], [{ m: 66, d: '8' }, { m: 69, d: '8' }, { m: 62, d: '8' }, { m: 66, d: '8' }, { m: 69, d: '8' }, { m: 72, d: '8' }, { m: 71, d: '8' }, { m: 69, d: '8' }]],
        time: '4/4', key: 'G'
      },
      {
        name: 'Run down and land on G',
        how: 'A descending line that lands on the low G on beat 1 and holds.',
        bars: [[{ m: 71, d: '8' }, { m: 69, d: '8' }, { m: 67, d: '8' }, { m: 66, d: '8' }, { m: 64, d: '8' }, { m: 62, d: '8' }, { m: 59, d: '8' }, { m: 62, d: '8' }], [{ m: 55, d: 'q' }, { m: 55, d: '8' }, { m: 55, d: '8' }, { m: 55, d: 'h' }]],
        time: '4/4', key: 'G'
      },
      {
        name: 'Crosspicking roll',
        how: 'G, B, G (strings 3, 2, 1) repeating in eighths, picked down-down-up, so the three-note pattern rolls across the four beats.',
        bars: [[{ m: 55, d: '8' }, { m: 59, d: '8' }, { m: 67, d: '8' }, { m: 55, d: '8' }, { m: 59, d: '8' }, { m: 67, d: '8' }, { m: 55, d: '8' }, { m: 59, d: '8' }]],
        time: '4/4', key: 'G', positions: [[3, 0], [2, 0], [1, 3]]
      }
    ],
    listen: { artist: 'Doc Watson', work: 'Black Mountain Rag' }
  },
  {
    id: 'country-steel-bends',
    style: 'country',
    name: 'Pedal-steel bends inside a chord',
    focus: 'technique',
    level: 3,
    minutes: 9,
    goal: 'Hold two notes of a triad while bending the third string up a whole step, turning a sus2 into a major chord in tune.',
    why: 'Electric country players copy the pedal steel by bending one note inside a chord shape. Holding fixed notes while one moves is a hard independence skill, so the drill keeps the shape and moves it, one chord at a time.',
    backing: { groove: 'boomchick', bars: ['G', 'G', 'C', 'D'] },
    tempo: [60, 100],
    steps: [
      'G shape: 3rd string fret 2 (A), 2nd string fret 3 (D), 1st string fret 3 (G).',
      'Hybrid-pick: pick the 3rd string, middle and ring fingers on the 2nd and 1st.',
      'Bend the 3rd string a whole step (A to B) with the middle or ring finger while the other two notes keep sounding.',
      'Check the bent B against the 2nd string open; it must match.',
      'Move the same shape up for C (fret 7) and D (fret 9).'
    ],
    variations: [
      { name: 'G: A up to B', how: 'Pluck all three, then bend. Gsus2 becomes G.', positions: [[3, 2], [2, 3], [1, 3]] },
      { name: 'Pre-bend and release', how: 'Bend first, pluck all three, then release: G falls to Gsus2.' },
      { name: 'C at the 7th fret', how: '3rd string fret 7 (D) bent to E, under G and C at fret 8.', positions: [[3, 7], [2, 8], [1, 8]] },
      { name: 'D at the 9th fret', how: '3rd string fret 9 (E) bent to F♯, under A and D at fret 10.', positions: [[3, 9], [2, 10], [1, 10]] },
      { name: 'Through the changes', how: 'One bend per chord in time with the backing: G, G, C, D.' }
    ],
    listen: { artist: 'The Byrds', work: 'Chestnut Mare' }
  },

  /* ---------------- Classical guitar ---------------- */
  {
    id: 'classical-pima-arpeggios',
    style: 'classical',
    name: 'p-i-m-a arpeggio patterns',
    focus: 'technique',
    level: 1,
    minutes: 8,
    goal: 'Play even arpeggios with p, i, m and a in several orders, with a still hand and a round tone.',
    why: 'Arpeggio studies such as Giuliani’s right-hand exercises train each finger to play on its own string with the same tone. Changing the finger order while the chord stays the same is variable practice that prevents a single locked-in motion.',
    backing: { click: { beats: 4, sub: 4 } },
    tempo: [50, 80],
    steps: [
      'Sit with the guitar raised on the left leg (footstool or support).',
      'Assign strings: p on the bass, i on the 3rd, m on the 2nd, a on the 1st.',
      'Prepare each finger on its string an instant before it plays.',
      'Play four notes per click, all at the same volume.',
      'Keep the hand still; the fingers move from the knuckle.'
    ],
    variations: [
      {
        name: 'p i m a on Em',
        how: 'Open E minor, four notes per beat.',
        bars: [[{ m: 40, d: '16' }, { m: 55, d: '16' }, { m: 59, d: '16' }, { m: 64, d: '16' }, { m: 40, d: '16' }, { m: 55, d: '16' }, { m: 59, d: '16' }, { m: 64, d: '16' }, { m: 40, d: '16' }, { m: 55, d: '16' }, { m: 59, d: '16' }, { m: 64, d: '16' }, { m: 40, d: '16' }, { m: 55, d: '16' }, { m: 59, d: '16' }, { m: 64, d: '16' }]],
        time: '4/4', key: 'Em'
      },
      {
        name: 'p a m i',
        how: 'The same chord, fingers in the opposite order.',
        bars: [[{ m: 40, d: '16' }, { m: 64, d: '16' }, { m: 59, d: '16' }, { m: 55, d: '16' }, { m: 40, d: '16' }, { m: 64, d: '16' }, { m: 59, d: '16' }, { m: 55, d: '16' }, { m: 40, d: '16' }, { m: 64, d: '16' }, { m: 59, d: '16' }, { m: 55, d: '16' }, { m: 40, d: '16' }, { m: 64, d: '16' }, { m: 59, d: '16' }, { m: 55, d: '16' }]],
        time: '4/4', key: 'Em'
      },
      {
        name: 'p i m i, alternating bass',
        how: 'p alternates between the 6th string (E) and the 5th string 2nd fret (B).',
        bars: [[{ m: 40, d: '16' }, { m: 55, d: '16' }, { m: 59, d: '16' }, { m: 55, d: '16' }, { m: 47, d: '16' }, { m: 55, d: '16' }, { m: 59, d: '16' }, { m: 55, d: '16' }, { m: 40, d: '16' }, { m: 55, d: '16' }, { m: 59, d: '16' }, { m: 55, d: '16' }, { m: 47, d: '16' }, { m: 55, d: '16' }, { m: 59, d: '16' }, { m: 55, d: '16' }]],
        time: '4/4', key: 'Em'
      },
      {
        name: 'Am – B7 – Em',
        how: 'p i m a through a short cadence; change chords without a gap.',
        bars: [[{ m: 45, d: '16' }, { m: 57, d: '16' }, { m: 60, d: '16' }, { m: 64, d: '16' }, { m: 45, d: '16' }, { m: 57, d: '16' }, { m: 60, d: '16' }, { m: 64, d: '16' }, { m: 47, d: '16' }, { m: 57, d: '16' }, { m: 59, d: '16' }, { m: 66, d: '16' }, { m: 47, d: '16' }, { m: 57, d: '16' }, { m: 59, d: '16' }, { m: 66, d: '16' }], [{ m: 40, d: '16' }, { m: 55, d: '16' }, { m: 59, d: '16' }, { m: 64, d: '16' }, { m: 40, d: '16' }, { m: 55, d: '16' }, { m: 59, d: '16' }, { m: 64, d: '16' }, { m: 40, d: 'h' }]],
        time: '4/4', key: 'Em'
      }
    ],
    listen: { artist: 'Mauro Giuliani', work: '120 Studies for the Right Hand, Op. 1' }
  },
  {
    id: 'classical-romance-phrase',
    style: 'classical',
    name: 'Shaping a melody: the Romance',
    focus: 'melody',
    level: 1,
    minutes: 8,
    goal: 'Play the opening phrase of the anonymous Romance as a sung line, with direction, dynamics and a little rubato.',
    why: 'The commonest fault in classical playing is equal notes with no direction. Playing one short phrase several ways (legato, shaped, with bass, with rubato) makes you choose an interpretation rather than just play the notes.',
    backing: { click: { beats: 3, sub: 3 } },
    tempo: [50, 80],
    steps: [
      'The melody starts on B at the 7th fret of the 1st string. In the full piece each beat is a triplet arpeggio; here you play the melody alone.',
      'Play it legato: hold each note until the next one sounds.',
      'Decide where the phrase is going (the B at the end) and shape toward it.',
      'Use rest stroke with a on the melody when the bass is added.',
      'Record two versions and choose which you prefer, and why.'
    ],
    variations: [
      {
        name: 'Melody, legato',
        how: 'Even and connected, no dynamics yet.',
        bars: [[{ m: 71, d: 'q' }, { m: 71, d: 'q' }, { m: 71, d: 'q' }], [{ m: 71, d: 'q' }, { m: 69, d: 'q' }, { m: 67, d: 'q' }], [{ m: 67, d: 'q' }, { m: 66, d: 'q' }, { m: 64, d: 'q' }], [{ m: 64, d: 'q' }, { m: 67, d: 'q' }, { m: 71, d: 'q' }]],
        time: '3/4', key: 'Em', positions: [[1, 7], [1, 5], [1, 3], [1, 2], [1, 0]]
      },
      {
        name: 'Shaped',
        how: 'Soft at the start, a little louder through bar 2, softer down to E, then grow into the last B.',
        bars: [[{ m: 71, d: 'q' }, { m: 71, d: 'q' }, { m: 71, d: 'q' }], [{ m: 71, d: 'q' }, { m: 69, d: 'q' }, { m: 67, d: 'q' }], [{ m: 67, d: 'q' }, { m: 66, d: 'q' }, { m: 64, d: 'q' }], [{ m: 64, d: 'q' }, { m: 67, d: 'q' }, { m: 71, d: 'q' }]],
        time: '3/4', key: 'Em'
      },
      { name: 'With the bass', how: 'Add the open low E with p on beat 1 of each bar and let it ring under the melody.' },
      { name: 'Rubato', how: 'Take a little time on the last B and give it back in the next phrase. Make the stretch audible but small.' }
    ],
    listen: { artist: 'Narciso Yepes', work: 'Romance (Jeux interdits)' }
  },
  {
    id: 'classical-cadence-voice-leading',
    style: 'classical',
    name: 'A minor cadence, voice by voice',
    focus: 'harmony',
    level: 2,
    minutes: 8,
    goal: 'Play i–iv–V7–i in A minor so each of the four voices moves smoothly and the common tones are held, not replayed.',
    why: 'On the guitar one player holds bass, harmony and melody at once, so voice leading matters as much as chord names. Playing the same cadence as blocks, arpeggios and single voices builds an ear for the lines inside the chords.',
    backing: { click: { beats: 4, sub: 1 } },
    tempo: [50, 80],
    steps: [
      'Am (x 0 2 2 1 0), Dm (x x 0 2 3 1), E7 (0 2 0 1 0 0), Am. One chord per bar.',
      'Sing or play each voice alone: top E–F–E–E, then C–D–B–C, then A–A–G♯–A, and the bass A–D–E–A.',
      'Keep the A on the 3rd string held from Am into Dm; do not lift and replace it.',
      'Let each chord ring its full length; do not cut notes short while moving to the next shape.'
    ],
    variations: [
      { name: 'Block chords', how: 'p i m a together on beat 1, held for the bar.', positions: [[5, 0], [4, 2], [3, 2], [2, 1], [1, 0]] },
      { name: 'Arpeggiated', how: 'p i m a, one note per beat, every note left to ring.' },
      { name: 'Bring out the tenor', how: 'Play the 3rd string with i in rest stroke so A–A–G♯–A sings above the others.' },
      { name: 'In D minor', how: 'Dm (x x 0 2 3 1), Gm (3 5 5 3 3 3), A7 (x 0 2 0 2 0), Dm. Find the held notes yourself.' }
    ],
    listen: { artist: 'Fernando Sor', work: 'Study in B minor, Op. 35 No. 22' }
  },
  {
    id: 'classical-tremolo',
    style: 'classical',
    name: 'p-a-m-i tremolo',
    focus: 'technique',
    level: 3,
    minutes: 10,
    goal: 'Play an even p-a-m-i tremolo, a bass note followed by three repeated melody notes, so the melody sounds continuous.',
    why: 'Tremolo pieces such as Tárrega’s Recuerdos de la Alhambra depend on three fingers sounding identical. Changing the melody string, the bass and the rhythm one at a time exposes uneven fingers, and dotted-rhythm practice is a standard way to even them out.',
    backing: { click: { beats: 4, sub: 4 } },
    tempo: [40, 72],
    steps: [
      'p plays the bass; a, m, i play the same melody note in that order.',
      'Start slowly, with a light free stroke and the fingers close to the string.',
      'Listen for the gap between i and the next p; keep it the same as the others.',
      'Practise in a dotted (long–short) rhythm, then short–long, then even again.',
      'Keep the hand still and relaxed.'
    ],
    variations: [
      {
        name: 'Open strings',
        how: 'p on the open 5th string, a m i on the open 1st string.',
        bars: [[{ m: 45, d: '16' }, { m: 64, d: '16' }, { m: 64, d: '16' }, { m: 64, d: '16' }, { m: 45, d: '16' }, { m: 64, d: '16' }, { m: 64, d: '16' }, { m: 64, d: '16' }, { m: 45, d: '16' }, { m: 64, d: '16' }, { m: 64, d: '16' }, { m: 64, d: '16' }, { m: 45, d: '16' }, { m: 64, d: '16' }, { m: 64, d: '16' }, { m: 64, d: '16' }]],
        time: '4/4', key: 'Am'
      },
      {
        name: 'Moving bass',
        how: 'p plays A, E, A, E (strings 5, 4, 3, 4) while the melody stays on E, moving to F (1st string, 1st fret) on beat 3.',
        bars: [[{ m: 45, d: '16' }, { m: 64, d: '16' }, { m: 64, d: '16' }, { m: 64, d: '16' }, { m: 52, d: '16' }, { m: 64, d: '16' }, { m: 64, d: '16' }, { m: 64, d: '16' }, { m: 57, d: '16' }, { m: 65, d: '16' }, { m: 65, d: '16' }, { m: 65, d: '16' }, { m: 52, d: '16' }, { m: 64, d: '16' }, { m: 64, d: '16' }, { m: 64, d: '16' }]],
        time: '4/4', key: 'Am'
      },
      {
        name: 'Melody on the 2nd string',
        how: 'a m i on the 2nd string, 1st fret (C); it is harder to keep even next to the 1st string.',
        bars: [[{ m: 45, d: '16' }, { m: 60, d: '16' }, { m: 60, d: '16' }, { m: 60, d: '16' }, { m: 52, d: '16' }, { m: 60, d: '16' }, { m: 60, d: '16' }, { m: 60, d: '16' }, { m: 45, d: '16' }, { m: 60, d: '16' }, { m: 60, d: '16' }, { m: 60, d: '16' }, { m: 52, d: '16' }, { m: 60, d: '16' }, { m: 60, d: '16' }, { m: 60, d: '16' }]],
        time: '4/4', key: 'Am'
      },
      { name: 'Dotted rhythm', how: 'Play each group long–short–long–short, then short–long–short–long, then even again.' }
    ],
    listen: { artist: 'Francisco Tárrega', work: 'Recuerdos de la Alhambra' }
  },

  /* ---------------- Portugal (fado) ---------------- */
  {
    id: 'fado-viola-menor',
    style: 'fado',
    name: 'Viola accompaniment: Fado Menor',
    focus: 'rhythm',
    level: 1,
    minutes: 8,
    goal: 'Play the viola part of Fado Menor (Am–E7): a firm bass on the beat and a soft chord after it, well below the singer.',
    why: 'The viola is the floor of a fado, and the singer moves the time around it. Changing the bass pattern and the stops one at a time keeps the pulse steady while you learn to wait.',
    backing: { groove: 'fado', bars: ['Am', 'Am', 'E7', 'E7', 'E7', 'E7', 'Am', 'Am'] },
    tempo: [60, 90],
    steps: [
      'Thumb on the bass on the beat, fingers brushing a short, soft chord after it.',
      'Am: bass A on the 5th string. E7: bass E on the 6th string.',
      'Keep the chord quieter than the bass, and both quieter than a voice would be.',
      'Change chords exactly where the backing does; in fado you follow the singer, so practise listening, not leading.'
    ],
    variations: [
      { name: 'Root and chord', how: 'Root on each beat, chord on each offbeat.', positions: [[5, 0], [4, 2], [3, 2], [2, 1]] },
      { name: 'Alternating bass', how: 'Root on beat 1, fifth on beat 2 (E under Am, B under E7), chord after each.' },
      { name: 'Walk into E7', how: 'In the last bar of Am walk the bass down A–G–F to the E.' },
      { name: 'Wait for the singer', how: 'At the end of the second E7 bar, stop and hold the bass for a full bar, then come back in on Am.' }
    ],
    listen: { artist: 'Alfredo Marceneiro', work: 'A Casa da Mariquinhas' }
  },
  {
    id: 'fado-corrido-viola',
    style: 'fado',
    name: 'Fado Corrido: I–V7 with inversions',
    focus: 'harmony',
    level: 2,
    minutes: 8,
    goal: 'Accompany Fado Corrido (C–G7) with smooth bass lines and inversions, ready to move to another key.',
    why: 'Traditional fados use the same few chords under many poems, and singers choose their own key. Changing voicings and bass lines on one progression, then moving key, builds the flexibility a house player needs.',
    backing: { groove: 'fado', bars: ['C', 'C', 'G7', 'G7', 'G7', 'G7', 'C', 'C'] },
    tempo: [80, 120],
    steps: [
      'Fado Corrido is livelier than Fado Menor; keep the bass firm and the chord short.',
      'C: bass C on the 5th string, 3rd fret. G7: bass G on the 6th string, 3rd fret.',
      'Find the shortest move between shapes: the B in G7 sits a half step below C.',
      'Play the same pattern with a capo or new shapes in D and G.'
    ],
    variations: [
      { name: 'Open shapes', how: 'Open C and G7, root on the beat, chord after.' },
      { name: 'Alternating bass', how: 'C with G as the alternate bass; G7 with D.' },
      { name: 'G7 in first inversion', how: 'Play G7 with B in the bass (x 2 0 0 0 1) so the bass moves C–B–C by half step.' },
      { name: 'In D', how: 'Capo 2, or play D–A7 in open position. Same bass ideas.' }
    ]
  },
  {
    id: 'fado-guitarra-fills',
    style: 'fado',
    name: 'Guitarra-style fills in A harmonic minor',
    focus: 'melody',
    level: 2,
    minutes: 8,
    goal: 'Answer the singer with short fills high on the neck that resolve to the chord exactly as the next line begins.',
    why: 'The guitarra answers each vocal line with a brief fill, often in harmonic minor, and stops before the singer returns. Rotating fills of different shapes over the same gap trains timing the resolution, not just the notes.',
    backing: { groove: 'fado', bars: ['Am', 'E7'] },
    tempo: [60, 84],
    steps: [
      'Bar 1 belongs to the singer. Play the fill in bar 2 over E7.',
      'Pick near the bridge with a bright, crisp attack; alternate thumb and index (figueta) or use a pick.',
      'The fill leads to A on beat 1 of the next bar; play that A as the backing returns to Am.',
      'Use G♯, the raised 7th of harmonic minor, as the note that pulls to A.',
      'Keep each fill to one bar or less.'
    ],
    variations: [
      {
        name: 'Down to G♯',
        how: 'E F E D B G♯, then A on the next downbeat.',
        bars: [[{ m: null, d: 'w' }], [{ m: null, d: 'q' }, { m: 76, d: '8' }, { m: 77, d: '8' }, { m: 76, d: '8' }, { m: 74, d: '8' }, { m: 71, d: '8' }, { m: 68, d: '8' }]],
        time: '4/4', key: 'Am'
      },
      {
        name: 'With a mordent',
        how: 'A quick E–F–E at the start, then down the scale.',
        bars: [[{ m: null, d: 'w' }], [{ m: null, d: 'q' }, { m: 76, d: '16' }, { m: 77, d: '16' }, { m: 76, d: '8' }, { m: 74, d: '8' }, { m: 72, d: '8' }, { m: 71, d: '8' }, { m: 68, d: '8' }]],
        time: '4/4', key: 'Am'
      },
      {
        name: 'Two-beat answer',
        how: 'Wait two beats, then B C B G♯. Shorter is often better.',
        bars: [[{ m: null, d: 'w' }], [{ m: null, d: 'h' }, { m: 71, d: '8' }, { m: 72, d: '8' }, { m: 71, d: '8' }, { m: 68, d: '8' }]],
        time: '4/4', key: 'Am'
      },
      {
        name: 'Tremolo on a held note',
        how: 'Hold E with fast, light tremolo for three beats, then resolve to A on the next downbeat.',
        bars: [[{ m: null, d: 'w' }], [{ m: null, d: 'q' }, { m: 76, d: 'h', dot: true }]],
        time: '4/4', key: 'Am'
      },
      { name: 'In 3rds', how: 'Play the first fill with a second note a 3rd below on the next string, for the sweeter sound guitarra players use.' }
    ],
    listen: { artist: 'Carlos Paredes', work: 'Verdes Anos' }
  },
  {
    id: 'fado-tremolo-figueta',
    style: 'fado',
    name: 'Figueta runs and tremolo on long notes',
    focus: 'technique',
    level: 3,
    minutes: 9,
    goal: 'Play running notes with alternating thumb and index and switch to an even tremolo on every long note.',
    why: 'Guitarra players pick moving notes with thumb and index (figueta) and sustain long notes with tremolo (dedilho). Switching between the two inside one phrase is the hard part, so the drill builds each alone and then joins them.',
    backing: { click: { beats: 4, sub: 2 } },
    tempo: [50, 80],
    steps: [
      'Tremolo on the open 1st string with a pick or i-m: first four, then six notes per beat.',
      'Figueta: alternate thumb (down) and index (up) on single notes, near the bridge.',
      'In the phrase, play the eighths with figueta and the half notes with tremolo.',
      'Keep the tremolo light and even; it should sound like one sustained note.'
    ],
    variations: [
      { name: 'Four per beat', how: 'Tremolo on one note, four strokes per click.' },
      { name: 'Six per beat', how: 'Same note, six strokes per click. Stay relaxed.' },
      {
        name: 'Tremolo melody',
        how: 'Tremolo on every note of a slow harmonic-minor line.',
        bars: [[{ m: 69, d: 'q' }, { m: 68, d: 'q' }, { m: 69, d: 'q' }, { m: 71, d: 'q' }], [{ m: 72, d: 'h' }, { m: 71, d: 'h' }]],
        time: '4/4', key: 'Am'
      },
      {
        name: 'Figueta into tremolo',
        how: 'Eighths with thumb and index, then tremolo on the half-note A.',
        bars: [[{ m: 76, d: '8' }, { m: 74, d: '8' }, { m: 72, d: '8' }, { m: 71, d: '8' }, { m: 69, d: 'h' }], [{ m: 72, d: '8' }, { m: 71, d: '8' }, { m: 69, d: '8' }, { m: 68, d: '8' }, { m: 69, d: 'h' }]],
        time: '4/4', key: 'Am'
      }
    ],
    listen: { artist: 'Carlos Paredes', work: 'Movimento Perpétuo' }
  },

  /* ---------------- Persia ---------------- */
  {
    id: 'persian-shur-koron',
    style: 'persian',
    name: 'Finding the koron in Shur',
    focus: 'ear',
    level: 1,
    minutes: 8,
    goal: 'Place the koron second of Shur on G (A koron, between A♭ and A) in tune against a drone, and use it in a short phrase.',
    why: 'Koron notes sit between the frets, so they must be found by ear. Comparing A♭, A and the bend between them gives immediate feedback, and using the note in different phrases fixes it in memory.',
    backing: { groove: 'drone', bars: ['Gm'] },
    tempo: [50, 72],
    steps: [
      'Shur on G: G, A koron, B♭, C, D, E♭, F.',
      'On the 1st string, play G (fret 3), A♭ (fret 4) and A (fret 5) against the drone.',
      'Play A♭ and bend it slowly up until it sits halfway to A. That is roughly the koron; trust the ear over the fret.',
      'In the staff, read every A as A koron.',
      'End every phrase on G.'
    ],
    variations: [
      { name: 'Find the note', how: 'G, then A♭ bent up slightly, then G. Repeat until the bend lands in the same place each time.', positions: [[1, 3], [1, 4], [1, 5]] },
      {
        name: 'Circle around G',
        how: 'A short daramad-like phrase that rises to C and settles back on G. Every A is koron.',
        bars: [[{ m: 67, d: '8' }, { m: 69, d: '8' }, { m: 70, d: '8' }, { m: 69, d: '8' }, { m: 67, d: 'h' }], [{ m: 72, d: '8' }, { m: 70, d: '8' }, { m: 69, d: '8' }, { m: 70, d: '8' }, { m: 69, d: 'q' }, { m: 67, d: 'q' }]],
        time: '4/4', key: 'Gm'
      },
      {
        name: 'Come home from below',
        how: 'B♭, A koron, G, then F below and back to G.',
        bars: [[{ m: 70, d: '8' }, { m: 69, d: '8' }, { m: 67, d: '8' }, { m: 65, d: '8' }, { m: 67, d: 'h' }]],
        time: '4/4', key: 'Gm'
      },
      { name: 'Without the drone', how: 'Play the second phrase with the drone off in your head: does G still sound like home?' }
    ]
  },
  {
    id: 'persian-riz',
    style: 'persian',
    name: 'Riz: tar-style tremolo',
    focus: 'technique',
    level: 2,
    minutes: 8,
    goal: 'Play a fast, light, even riz (tremolo) with a small pick, and use it in place of sustain on long notes.',
    why: 'The tar and setar sustain long notes with riz, and an uneven riz sounds like nervous picking. Measured tremolo against a click first, then free riz inside a phrase, links the exercise to the music.',
    backing: { click: { beats: 4, sub: 4 } },
    tempo: [60, 110],
    steps: [
      'Use a small, stiff pick close to the bridge for a tar-like attack.',
      'Alternate pick on one string, very small motions, wrist loose.',
      'Start with four even strokes per click, then speed up only while it stays even.',
      'Use riz only on long notes; short notes are single strokes.'
    ],
    variations: [
      { name: 'Measured, four per beat', how: 'Sixteenth notes on the open 3rd string (G), even in volume.' },
      { name: 'Free riz', how: 'As fast as you can while still even, for two beats, then two beats of silence.' },
      { name: 'Swell', how: 'Riz on one note growing louder over two beats and softer over the next two.' },
      {
        name: 'Riz in a phrase',
        how: 'Single strokes on the quarters, riz on the half and dotted half. The A is koron.',
        bars: [[{ m: 67, d: 'h' }, { m: 69, d: 'q' }, { m: 70, d: 'q' }], [{ m: 69, d: 'q' }, { m: 67, d: 'h', dot: true }]],
        time: '4/4', key: 'Gm'
      }
    ]
  },
  {
    id: 'persian-avaz-javab',
    style: 'persian',
    name: 'Answering the voice (javab)',
    focus: 'melody',
    level: 2,
    minutes: 9,
    goal: 'Play a voice-like line, rest, then answer it with a short javab that echoes its ending.',
    why: 'In avaz the instrument answers each line of the singer, usually by echoing its ending. Answering in several ways (exact, lower, ornamented) trains listening and memory, and the rests teach that silence is part of the phrase.',
    backing: { groove: 'drone', bars: ['Gm'] },
    tempo: [44, 66],
    steps: [
      'Treat the beat only as a guide; stretch notes as a singer would.',
      'Play the line in the staff, then rest as long as feels natural.',
      'Answer with the last three or four notes of the line.',
      'Keep vibrato minimal; shape with timing and small ornaments.',
      'End on G each time. Every A is koron.'
    ],
    variations: [
      {
        name: 'Line and exact echo',
        how: 'The line, a rest, then its ending repeated.',
        bars: [[{ m: 67, d: 'q' }, { m: 69, d: '8' }, { m: 70, d: '8' }, { m: 72, d: 'q', dot: true }, { m: 70, d: '8' }], [{ m: 69, d: 'q' }, { m: 67, d: 'h', dot: true }], [{ m: null, d: 'h' }, { m: 70, d: '8' }, { m: 69, d: '8' }, { m: 67, d: 'q' }]],
        time: '4/4', key: 'Gm'
      },
      {
        name: 'Echo an octave down',
        how: 'The answer moves to the 3rd and 4th strings.',
        bars: [[{ m: 67, d: 'q' }, { m: 69, d: '8' }, { m: 70, d: '8' }, { m: 72, d: 'q', dot: true }, { m: 70, d: '8' }], [{ m: 69, d: 'q' }, { m: 67, d: 'h', dot: true }], [{ m: null, d: 'h' }, { m: 58, d: '8' }, { m: 57, d: '8' }, { m: 55, d: 'q' }]],
        time: '4/4', key: 'Gm'
      },
      { name: 'Echo with a tahrir flick', how: 'Answer with the same ending, adding a quick hammer-on and pull-off cluster that flicks up and falls back, like the singer’s tahrir.' },
      { name: 'Your own line', how: 'Make up a line of about one breath, then answer it yourself. Keep the answer shorter than the line.' }
    ],
    listen: { artist: 'Mohammad-Reza Shajarian', work: 'Bidad' }
  },
  {
    id: 'persian-chaharmezrab-pedal',
    style: 'persian',
    name: 'Chaharmezrab-style pedal-note picking',
    focus: 'rhythm',
    level: 3,
    minutes: 9,
    goal: 'Play a fast 6/8 figure that alternates a melody note with a repeated open-string pedal, keeping both voices even.',
    why: 'The chaharmezrab is a fast instrumental piece built over a repeated note or ostinato that shows off the right hand. Moving the melody and the pedal pattern one at a time trains string crossing and accent control at speed.',
    backing: { click: { beats: 2, sub: 3 } },
    tempo: [60, 110],
    steps: [
      'The pedal is the open 3rd string (G). The melody is on strings 1 and 2. Every A is koron.',
      'Alternate pick: down on the pedal, up on the melody note, or as the pattern requires.',
      'Keep the pedal softer than the melody.',
      'Count two beats per bar, each split in three.'
    ],
    variations: [
      {
        name: 'Pedal then melody',
        how: 'G pedal before each melody note, rising then falling.',
        bars: [[{ m: 55, d: '8' }, { m: 67, d: '8' }, { m: 55, d: '8' }, { m: 69, d: '8' }, { m: 55, d: '8' }, { m: 70, d: '8' }], [{ m: 55, d: '8' }, { m: 72, d: '8' }, { m: 55, d: '8' }, { m: 70, d: '8' }, { m: 55, d: '8' }, { m: 69, d: '8' }]],
        time: '6/8', key: 'Gm'
      },
      {
        name: 'Double pedal',
        how: 'Two quick pedal notes before each melody note.',
        bars: [[{ m: 55, d: '16' }, { m: 55, d: '16' }, { m: 67, d: '8' }, { m: 55, d: '16' }, { m: 55, d: '16' }, { m: 69, d: '8' }, { m: 55, d: '16' }, { m: 55, d: '16' }, { m: 70, d: '8' }]],
        time: '6/8', key: 'Gm'
      },
      {
        name: 'Melody on the beat',
        how: 'The melody note first, the pedal after it.',
        bars: [[{ m: 67, d: '8' }, { m: 55, d: '8' }, { m: 69, d: '8' }, { m: 55, d: '8' }, { m: 70, d: '8' }, { m: 55, d: '8' }], [{ m: 72, d: '8' }, { m: 55, d: '8' }, { m: 70, d: '8' }, { m: 55, d: '8' }, { m: 69, d: '8' }, { m: 55, d: '8' }]],
        time: '6/8', key: 'Gm'
      },
      {
        name: 'Descent to G',
        how: 'From C down to F and back to G over the pedal.',
        bars: [[{ m: 55, d: '8' }, { m: 72, d: '8' }, { m: 55, d: '8' }, { m: 70, d: '8' }, { m: 55, d: '8' }, { m: 69, d: '8' }], [{ m: 55, d: '8' }, { m: 67, d: '8' }, { m: 55, d: '8' }, { m: 65, d: '8' }, { m: 55, d: '8' }, { m: 67, d: '8' }]],
        time: '6/8', key: 'Gm'
      }
    ]
  },

  /* ---------------- Hawaiian slack key & steel ---------------- */
  {
    id: 'hawaii-taro-patch-thumb',
    style: 'hawaii',
    name: 'Taro Patch alternating thumb',
    focus: 'technique',
    level: 1,
    minutes: 8,
    goal: 'Keep a soft, steady alternating thumb in Taro Patch tuning while the fingers add melody notes on the top strings.',
    why: 'Slack key rests on a thumb that never stops and stays quieter than the melody. Building it alone first, then adding fingers and chord changes one at a time, makes the thumb automatic.',
    backing: { click: { beats: 4, sub: 2 } },
    tempo: [60, 90],
    steps: [
      'Tune to Taro Patch: D G D G B D (lower strings 6, 5 and 1 a whole step).',
      'Open strings are a G chord. Thumb alternates the 5th string (G) and the 4th string (D) on each beat.',
      'Play with the flesh of the fingers or a thumbpick, close to the sound hole, and let every string ring.',
      'Keep the thumb a little quieter than the melody.',
      'The fretboard and staff in this app assume standard tuning, so this drill uses words only.'
    ],
    variations: [
      { name: 'Thumb alone', how: 'Strings 5 and 4, alternating on the beats. Even and soft.' },
      { name: 'Melody on the offbeats', how: 'Add the open 1st or 2nd string between thumb notes.' },
      { name: 'Pinch on 1', how: 'Play the 1st string together with the thumb on beat 1, then continue the pattern.' },
      { name: 'G – C – D – G', how: 'Barre the 5th fret for C and the 7th fret for D, one bar each, thumb unbroken.' },
      { name: 'Nahenahe', how: 'Set the tempo to 60 and play as softly and warmly as you can, letting every note decay.' }
    ],
    listen: { artist: 'Gabby Pahinui', work: 'Hiʻilawe' }
  },
  {
    id: 'hawaii-hammer-pull',
    style: 'hawaii',
    name: 'Hammer-ons, pull-offs and chimes',
    focus: 'melody',
    level: 2,
    minutes: 8,
    goal: 'Decorate a slack key melody with hammer-ons and pull-offs from open strings, in time, and end it with 12th-fret chimes.',
    why: 'Slack key melodies are shaped by left-hand ornaments against ringing open strings. Each variation moves the ornament to a different string, so the hand learns the ornament, not one lick.',
    backing: { click: { beats: 4, sub: 2 } },
    tempo: [56, 84],
    steps: [
      'Taro Patch tuning (D G D G B D). The staff shows sounding pitch.',
      'Pick the open string, then hammer to the 2nd fret (or 1st on the 2nd string) in time.',
      'For pull-offs, pluck the fretted note and flick the finger off sideways to sound the open string.',
      'Keep the alternating thumb going underneath once the ornament is steady.',
      'Chimes: touch the string lightly right over the 12th fret, pluck, then lift.'
    ],
    variations: [
      {
        name: 'Hammer on the 3rd string',
        how: 'Open G, hammer to A at the 2nd fret, then open B and D.',
        bars: [[{ m: 55, d: '8' }, { m: 57, d: '8' }, { m: 59, d: 'q' }, { m: 62, d: 'q' }, { m: 59, d: 'q' }]],
        time: '4/4', key: 'G'
      },
      {
        name: 'Pull-off on the 1st string',
        how: 'E at the 2nd fret pulled off to open D, then down to G.',
        bars: [[{ m: 64, d: '8' }, { m: 62, d: '8' }, { m: 59, d: 'q' }, { m: 57, d: '8' }, { m: 55, d: '8' }, { m: 55, d: 'q' }]],
        time: '4/4', key: 'G'
      },
      {
        name: 'Hammer on the 2nd string',
        how: 'Open B hammered to C at the 1st fret, then D and E.',
        bars: [[{ m: 59, d: '8' }, { m: 60, d: '8' }, { m: 62, d: 'q' }, { m: 64, d: '8' }, { m: 62, d: '8' }, { m: 59, d: 'q' }]],
        time: '4/4', key: 'G'
      },
      {
        name: 'Phrase ending in chimes',
        how: 'A rising line with hammer-ons, then 12th-fret harmonics on the 1st and 3rd strings.',
        bars: [[{ m: 55, d: '8' }, { m: 57, d: '8' }, { m: 59, d: '8' }, { m: 62, d: '8' }, { m: 64, d: '8' }, { m: 62, d: '8' }, { m: 59, d: 'q' }], [{ m: 74, d: 'h' }, { m: 67, d: 'h' }]],
        time: '4/4', key: 'G'
      }
    ],
    listen: { artist: 'Ray Kāne', work: 'Punahele' }
  },
  {
    id: 'hawaii-vamp',
    style: 'hawaii',
    name: 'The vamp: II7–V7–I',
    focus: 'harmony',
    level: 2,
    minutes: 8,
    goal: 'Play the II7–V7–I vamp (A7–D7–G) that closes each verse, in Taro Patch, with a broken-chord line on top.',
    why: 'The vamp between verses is the glue of a Hawaiian song, and players repeat it until the singer is ready. Playing it as chords, as bass, and as a melodic line gives three ways to know the same progression.',
    backing: { groove: 'boomchick', bars: ['A7', 'D7', 'G', 'G'] },
    tempo: [60, 92],
    steps: [
      'Taro Patch tuning (D G D G B D). The staff shows sounding pitch.',
      'A7 = x 2 2 0 2 2. D7 = x x 0 2 1 4. G = all open.',
      'Keep the thumb alternating on the bass strings under every chord.',
      'Play the vamp several times in a row, as you would while waiting for the singer.'
    ],
    variations: [
      { name: 'Chords and thumb', how: 'One chord per bar, thumb on the beats, a light brush on the offbeats.' },
      { name: 'Bass line', how: 'Roots only on beats 1 and 3: A (5th string, 2nd fret), D (open 4th), G (open 5th).' },
      {
        name: 'Broken-chord line',
        how: 'The top of each chord as a line, ending on the low G.',
        bars: [[{ m: 64, d: 'q' }, { m: 61, d: 'q' }, { m: 55, d: 'q' }, { m: 61, d: 'q' }], [{ m: 66, d: 'q' }, { m: 60, d: 'q' }, { m: 57, d: 'q' }, { m: 60, d: 'q' }], [{ m: 62, d: 'q' }, { m: 59, d: 'q' }, { m: 55, d: 'q' }, { m: 59, d: 'q' }], [{ m: 43, d: 'w' }]],
        time: '4/4', key: 'G'
      },
      { name: 'Chimes to close', how: 'Play the vamp, then in the last G bar play 12th-fret harmonics on strings 1, 2 and 3.' }
    ],
    listen: { artist: 'Gabby Pahinui Hawaiian Band', work: 'Gabby Pahinui Hawaiian Band' }
  },
  {
    id: 'hawaii-steel-glides',
    style: 'hawaii',
    name: 'Steel glides to a target note',
    focus: 'ear',
    level: 3,
    minutes: 9,
    goal: 'Slide with a bar or slide onto target notes in tune against a drone, without searching, and add a narrow, even vibrato.',
    why: 'The steel guitar has no frets, so every note is placed by ear. Sliding to fixed targets against a drone gives instant feedback, and changing the target and direction keeps the ear working rather than the arm memorising a distance.',
    backing: { groove: 'drone', bars: ['G'] },
    tempo: [50, 72],
    steps: [
      'Use a lap steel, or a guitar in Taro Patch with a slide; the open strings are a G chord.',
      'Hold the slide directly over the fret wire, touching lightly, and mute behind it with a spare finger.',
      'Slide from below into the target and stop exactly on it; then add a narrow vibrato.',
      'Lift (block) the note with the picking hand before moving on, so glides stay clean.',
      'Avoid swooping into every note; one glide per phrase is plenty.'
    ],
    variations: [
      { name: 'Chord glides', how: 'Strings 1–3 together: slide from fret 3 to 5 (C), from 5 to 7 (D), then up to 12 (G).' },
      {
        name: 'Melody down from D',
        how: 'On the 1st string: D at fret 12, B at 9, A at 7, then G at 5, with a glide into the first note only.',
        bars: [[{ m: 74, d: 'h' }, { m: 71, d: 'q' }, { m: 69, d: 'q' }], [{ m: 67, d: 'w' }]],
        time: '4/4', key: 'G'
      },
      {
        name: 'Melody up to D',
        how: 'On the 1st string: open D, E at 2, G at 5, then A, B and the octave D at 12.',
        bars: [[{ m: 62, d: 'q' }, { m: 64, d: 'q' }, { m: 67, d: 'h' }], [{ m: 69, d: 'q' }, { m: 71, d: 'q' }, { m: 74, d: 'h' }]],
        time: '4/4', key: 'G'
      },
      { name: 'Vibrato only', how: 'Land on D at the 12th fret and hold it for a whole bar with a slow, narrow vibrato, even on both sides of the pitch.' }
    ]
  }
];
