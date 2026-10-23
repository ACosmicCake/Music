/* World Woodshed — how to solo or make up your own lines in the drills where you improvise (loaded with the
   drills by loadDrills, attached as d.solo). harmony: the notes to aim for and how they move; theory: the
   scale or mode, why it fits, and the colour and tension notes. */

export default {
  'cuba-coro-pregon': {
    harmony: ['Answer with chord tones: E or G over C, A or C over F, B or F over G7.', 'End your answer on a note of the chord that follows, and stop before the coro comes back.'],
    theory: ['C major pentatonic (C D E G A) for the first answers; add F and B for the F and G7 chords.', 'Start answers on a clave hit (the a of 1 or the & of 2), not on 1, so they sit with the rhythm.']
  },
  'brazil-choro-arpeggios': {
    harmony: ['Put a chord tone on every beat: G B D on G, G♯ B D F on G♯°7, A C E G on Am7, D F♯ A C on D7.', 'The G♯°7 is a passing chord: its G♯ leads up to the A of Am7, as the bass does.'],
    theory: ['G major covers every bar except G♯°7; over that chord use its own four notes.', 'Approach chord tones from a half step below, the choro way, and keep the sixteenths even.']
  },
  'brazil-baiao-lydian-dominant': {
    harmony: ['Over D7, rest on D, F♯ or A; let G♯ rise to A and C fall to B.', 'Short phrases that circle a chord tone with its neighbours sound most like baião.'],
    theory: ['D Lydian dominant (D E F♯ G♯ A B C): D Mixolydian with a raised 4th.', 'Its two colour notes are G♯ (the ♯4) and C (the ♭7): use both in every phrase.']
  },
  'hindustani-bhupali-chalan': {
    harmony: ['There are no chords: every note is heard against Sa (C) in the drone. Sa and Pa (G) are stable; Re (D) mostly passes between Ga and Sa.', 'Rest on Ga (E) and Dha (A), the two most important notes of Bhupali.'],
    theory: ['Five notes only: C D E G A. The same notes as the major pentatonic, but played as the raga’s phrases, not as runs.', 'Improvise slowly from low to high, adding one new note at a time, the way an alap unfolds, and come back to Sa.']
  },
  'carnatic-gamaka-shapes': {
    harmony: ['Every note is heard against the C drone: C and G are stable, B pulls up to C, and D leans down to C or up to E.', 'End phrases on C, G or E.'],
    theory: ['Hamsadhwani: C D E G B, with no F and no A.', 'Improvise slowly with one kind of gamaka per phrase; the ornament is part of the note, so choose it as carefully as the note.']
  },
  'arabic-hijaz-sayr': {
    harmony: ['There are no chords: D is home and G is the resting point halfway up (the ghammaz).', 'Bring out the wide step from E♭ to F♯; at the end of a phrase E♭ falls to D.'],
    theory: ['The lower four notes are jins Hijaz on D (D E♭ F♯ G); above G this drill uses G A B♭ C (jins Nahawand on G).', 'Build a short taqsim in that order: stay low, rest on G, go up once, come back down to D.']
  },
  'centraleast-qenet-phrases': {
    harmony: ['Over the C drone, end Tizita phrases on C, E or G; end Bati phrases on C or G.', 'In Bati, F leans on G and B on C: let them resolve.'],
    theory: ['Tizita major: C D E G A (the major pentatonic). Bati major (as here): C E F G B.', 'Improvise in one scale for a while, then switch: the change of colour over the same drone is the effect.']
  },
  'manouche-approach-arpeggios': {
    harmony: ['Target the chord tones: A C E F♯ over Am6, D F A B over Dm6, G♯ B D F over E7.', 'Resolve G♯ (on E7) up to A, and F (the ♭9 of E7) down to E.'],
    theory: ['A Dorian over Am6 and D Dorian over Dm6 (they contain the chords’ 6ths); A harmonic minor over E7.', 'The diminished arpeggio G♯ B D F over E7 is the gypsy jazz sound.']
  },
  'jazz-guide-tones': {
    harmony: ['Improvise one note per bar from the guide-tone lines, then two, then add rhythm.', 'Keep a 3rd or 7th on every beat 1 and fill between them with scale notes.'],
    theory: ['C major fits all three chords: D Dorian, G Mixolydian and C major are its modes.', 'Over G7 add A♭ (the ♭9) and resolve it to G on Cmaj7.']
  },
  'jazz-enclosures': {
    harmony: ['Choose the target (E, G or C on Cmaj7) before the G7 bar, then build the line backwards from it.', 'Over Dm7 and G7, put chord tones on the beats.'],
    theory: ['The note above the target is usually the next scale note (F above E, A above G); the note below is a half step under it, often outside the key.', 'C major plus these half-step neighbours is the core of bebop vocabulary.']
  },
  'caribbean-short-fills': {
    harmony: ['Over D, end on D or F♯ (its root or 3rd); over Am, C and E are the strong notes.', 'Leave the singer’s bar empty and stop before the next line.'],
    theory: ['A Dorian (A B C D E F♯ G): its F♯ is the 3rd of D.', 'Three to eight notes per fill: short and rhythmic beats long and busy.']
  },
  'klezmer-doina': {
    harmony: ['D is home; F♯ and A are the resting points; E♭ always falls back to D.', 'End each phrase on D and let the drone ring.'],
    theory: ['D freygish (D E♭ F♯ G A B♭ C), the same scale as Hijaz or Phrygian dominant.', 'In free time, shape each phrase like a spoken sentence: a start, a high point, a fall home.']
  },
  'blues-call-response': {
    harmony: ['End on A, C♯ or E, the root, 3rd and 5th of A7; G, the ♭7, leaves the answer open.', 'The rub between C and C♯ (minor and major 3rd) is the blues inside one chord.'],
    theory: ['A minor pentatonic (A C D E G) for the classic sound, A major pentatonic (A B C♯ E F♯) for a sweeter one.', 'Bend D up to E, or push C a little toward C♯.']
  },
  'rock-pentatonic-sequences': {
    harmony: ['There are no changes: E is home. End sequences on E, G or B, the notes of E minor.', 'Break out of a sequence with a held note or a bend.'],
    theory: ['E minor pentatonic (E G A B D); E Aeolian adds F♯ and C, E Phrygian adds F and C.', 'Sequences work best in short bursts: a bar or two, then something sung.']
  },
  'funksoul-sixths-fills': {
    harmony: ['Over G, choose shapes that contain B and D (or G and B); over C, E and G.', 'Slide into each shape from a fret below and land on the chord.'],
    theory: ['G major for the double stops; G major pentatonic for single notes.', 'Sixths on strings 3 and 1, thirds on strings 3 and 2: the same notes, two colours.']
  },
  'country-fiddle-tune-picking': {
    harmony: ['Put chord tones on the beats: G B D over G, D F♯ A C over D7. The C over D7 falls to B on G.', 'End phrases on G, B or D.'],
    theory: ['G major and G major pentatonic for the whole tune.', 'B♭ as a passing note into B (the blue 3rd) gives the country-blues sound.']
  },
  'fado-guitarra-fills': {
    harmony: ['Over E7 aim for G♯, B and D; resolve G♯ to A and D to C as Am returns.', 'Land on A exactly as the next vocal line starts.'],
    theory: ['A harmonic minor (A B C D E F G♯): the G♯ comes from E7.', 'One bar or less per fill: the singer comes first.']
  },
  'persian-avaz-javab': {
    harmony: ['There are no chords: G in the drone is home. End lines on G; the koron A (half-flat) leans down to it.', 'Answer by echoing the line’s last three or four notes.'],
    theory: ['Dastgah Shur on G: G, A koron (between A♭ and A), B♭, C, D, E♭, F.', 'Keep phrases vocal: mostly steps, small ornaments, and rests as long as the phrases.']
  },
  'turkbalkan-kopanitsa-phrase': {
    harmony: ['Rest on E and B; G♯ leans up to A and F falls to E.', 'Put a long note on the long group (counts 5 6 7) and land on E at the end of a phrase.'],
    theory: ['E F G♯ A B C D: A harmonic minor started from E (E Phrygian dominant).', 'Improvise new phrases that keep the same rhythm of short, short, long, short, short.']
  },
  'eastasia-jo-ha-kyu': {
    harmony: ['There are no chords: end phrases on D or A.', 'Every note of the scale sits well, so choose by shape: rising, falling, held.'],
    theory: ['Yo scale D E G A B: five notes with no half steps.', 'Improvise a new phrase with the same arc: slow, building, fast, then a long D.']
  }
};
