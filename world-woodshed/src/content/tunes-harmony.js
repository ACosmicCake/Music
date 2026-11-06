/* World Woodshed — how the changes of each Repertoire tune work, in plain words (loaded with loadTuneNotes,
   attached to D.TUNES as t.harmony and shown under the chart in the Repertoire gym).
   rn: one Roman numeral per chord, bar by bar, in the key of the section the bar is in (src/harmony.js);
   ":Key" after a numeral puts that one chord in another key. sections: bars counted from 1, in order, with
   no gaps. Notes named in the text are in the tune's own key; test/harmony.test.js checks every numeral
   against its chord. */

export const WORDS = [
  ['Roman numerals', 'name a chord by the note of the key it is built on: in C, I is C, ii is D minor, V is G. Capitals have a major 3rd, small letters a minor 3rd. ♭III is built a half step below the 3rd note of the major scale (E♭ in C).'],
  ['ii–V–I', 'the most common move in jazz: a minor chord, a dominant 7th a fifth below it, then home (Dm7–G7–Cmaj7 in C). In a minor key it is iiø7–V7–i (Dm7♭5–G7–Cm).'],
  ['Key centre', 'the key the music is in for a few bars. A tune can move through several; each new one usually arrives by a ii–V or a V7.'],
  ['Guide tones', 'the 3rd and 7th of each chord. They say what the chord is, and they move by a half or whole step to the next chord’s 3rd and 7th, so a line through them follows the changes.'],
  ['Dominant (V7)', 'a major triad with a minor 7th (G7 = G B D F). Its 3rd and 7th clash, and they settle into the chord a fifth below.'],
  ['V7/ii', 'read “V7 of ii”: a dominant 7th that points to a chord other than I. A7 in C is V7/ii because it leads to Dm7.'],
  ['ø and °', 'm7♭5, half-diminished (D F A♭ C), the ii of a minor key; °7, diminished 7th (B D F A♭), often a passing chord between two others a whole step apart.'],
  ['Tritone substitute', 'a dominant 7th six half steps from the expected one. D♭7 can replace G7: they share their 3rd and 7th (F and B), and D♭7’s root slides down a half step to C.'],
  ['Turnaround', 'two to four chords at the end of a section that lead back to its start, such as Dm7–G7 back to C.']
];

export default {
  autumn: {
    intro: 'Two keys that share all their notes: B♭ major and its relative minor, G minor. Every four bars the music lands in one of them, each time by a ii–V. Because the notes are shared, one scale (G natural minor, the same notes as B♭ major) fits almost everything; the only outsider is F♯, the 3rd of D7.',
    rn: ['ii7', 'V7', 'Imaj7', 'IVmaj7', 'iiø7', 'V7', 'i6', 'i6',
      'ii7', 'V7', 'Imaj7', 'IVmaj7', 'iiø7', 'V7', 'i6', 'i6',
      'iiø7', 'V7', 'i6', 'i6', 'ii7', 'V7', 'Imaj7', 'IVmaj7',
      'iiø7', 'V7', 'iii7 V7/ii', 'ii7 V7', 'Imaj7', 'iiø7 V7', 'i6', 'i6'],
    sections: [
      { bars: [1, 4], key: 'Bb', title: 'Major ii–V–I, then IV', text: 'Cm7 (ii) and F7 (V) lead to B♭maj7 (I), then E♭maj7 (IV). Each root is a fifth below the one before: C, F, B♭, E♭.', aim: 'The 7th of each chord falls a half step to the 3rd of the next: B♭ (on Cm7) to A (on F7), E♭ (on F7) to D (on B♭maj7).', scale: 'B♭ major, which has the same notes as G natural minor.' },
      { bars: [5, 8], key: 'Gm', title: 'Minor ii–V–i', text: 'Am7♭5 (A C E♭ G) and D7 lead to G minor. In a minor key the ii chord is half-diminished, and V7 brings in F♯ from outside the key, which pulls hard up to G.', aim: 'F♯ on D7 (its 3rd) rising to G on Gm6. On Am7♭5, G (its 7th) falls to F♯.', scale: 'G harmonic minor over D7 (G A B♭ C D E♭ F♯); G minor with an E (G Dorian) over Gm6.' },
      { bars: [9, 12], key: 'Bb', title: 'Bars 1–4 again', text: 'The same major ii–V–I–IV.' },
      { bars: [13, 16], key: 'Gm', title: 'Bars 5–8 again', text: 'The same minor ii–V–i.' },
      { bars: [17, 20], key: 'Gm', title: 'Bridge: the minor key first', text: 'The bridge swaps the order: the minor ii–V–i comes first…' },
      { bars: [21, 24], key: 'Bb', title: '…then the major', text: '…and the major ii–V–I–IV second.' },
      { bars: [25, 26], key: 'Gm', title: 'A minor ii–V…', text: 'Am7♭5–D7 promises G minor again…' },
      { bars: [27, 29], key: 'Eb', title: '…that lands somewhere else', text: '…but D7 moves to Gm7, the start of a chain: Gm7–C7 and Fm7–B♭7, two ii–Vs a whole step apart, landing on E♭maj7. In E♭ this is iii–VI–ii–V–I.', aim: 'Each chord’s 7th steps down to the next chord’s 3rd: F to E (Gm7 to C7), B♭ to A♭ (C7 to Fm7), E♭ to D (Fm7 to B♭7), A♭ to G (B♭7 to E♭maj7).' },
      { bars: [30, 32], key: 'Gm', title: 'Home to G minor', text: 'One more minor ii–V–i, squeezed into one bar, ends the tune in G minor.' }
    ]
  },

  bluebossa: {
    intro: 'C minor, with a short visit to D♭ major, a half step higher. Bars 1–8 stay in C minor; bars 9–12 move to D♭ and bars 13–16 come back by a minor ii–V.',
    rn: ['i7', 'i7', 'iv7', 'iv7', 'iiø7', 'V7', 'i7', 'i7',
      'ii7', 'V7', 'Imaj7', 'Imaj7', 'iiø7', 'V7', 'i7', 'iiø7 V7'],
    sections: [
      { bars: [1, 4], key: 'Cm', title: 'Home, then the iv chord', text: 'Two bars of Cm7 (i), two of Fm7 (iv). Both belong to C minor, so nothing pulls yet.', aim: 'E♭ stays (the 3rd of Cm7 is the 7th of Fm7) while B♭ steps down to A♭.', scale: 'C natural minor (C D E♭ F G A♭ B♭).' },
      { bars: [5, 8], key: 'Cm', title: 'Minor ii–V–i', text: 'Dm7♭5 (D F A♭ C) and G7 lead back to Cm7. G7 has B, the note that pulls up to C.', aim: 'B on G7 rising to C; F (the 7th of G7) falling to E♭.', scale: 'C harmonic minor over G7 (it has the B and keeps the A♭).' },
      { bars: [9, 12], key: 'Db', title: 'A half step up: ii–V–I in D♭', text: 'E♭m7–A♭7–D♭maj7 is a major ii–V–I in D♭, the key a half step above C: the bright surprise of the tune.', aim: 'D♭ (the 7th of E♭m7) falls to C (the 3rd of A♭7); G♭ (the 7th of A♭7) falls to F (the 3rd of D♭maj7).', scale: 'D♭ major (D♭ E♭ F G♭ A♭ B♭ C) for all four bars.' },
      { bars: [13, 16], key: 'Cm', title: 'Back home', text: 'Dm7♭5 keeps three notes of D♭maj7 (F, A♭, C); only D♭ moves up to D. Then G7 and Cm7, and a last ii–V to go round again.', aim: 'Move D♭ up to D and keep the rest: the smallest possible change of key.' }
    ]
  },

  summertime: {
    intro: 'A minor throughout. The chords move between i (Am), iv (Dm) and V (E7), with a minor ii–V (Bm7♭5–E7) to come home and C6, the relative major, for colour near the end.',
    rn: ['i6', 'V7', 'i6', 'i6', 'iv7', 'iv7', 'iiø7', 'V7',
      'i6', 'V7', 'i6', 'i6', 'bIII6 i7', 'iv7 V7', 'i6', 'iiø7 V7'],
    sections: [
      { bars: [1, 4], key: 'Am', title: 'Home and V', text: 'Am6 (i) and E7 (V). E7 brings G♯, which is not in A minor; it pulls up to A.', aim: 'G♯ on E7 rising to A; D (the 7th of E7) falling to C (the 3rd of Am6).', scale: 'A Dorian over Am6 (it has the chord’s F♯); A harmonic minor over E7.' },
      { bars: [5, 8], key: 'Am', title: 'iv, then a minor ii–V', text: 'Dm7 (iv) for two bars, then Bm7♭5–E7 leads back to A minor.', aim: 'F is the 3rd of Dm7. Over Bm7♭5–E7 hold D (it is in both chords) and let it fall to C on Am.' },
      { bars: [9, 12], key: 'Am', title: 'Bars 1–4 again', text: 'The same i–V–i.' },
      { bars: [13, 16], key: 'Am', title: 'Relative major and turnaround', text: 'C6 (♭III) has the same notes as Am7, which follows it. Then Dm7–E7 (iv–V), home on Am6, and Bm7♭5–E7 turns back to the top.' }
    ]
  },

  flyme: {
    intro: 'C major, with a side trip to its relative minor, A minor. Almost every root falls a fifth to the next (A, D, G, C, F, B, E, A), so the changes roll downhill and the guide tones step down with them.',
    rn: ['vi7', 'ii7', 'V7', 'Imaj7 V7/IV', 'IVmaj7', 'iiø7', 'V7', 'i7 V7/iv',
      'ii7', 'V7', 'Imaj7 vi7', 'ii7', 'V7', 'Imaj7', 'iiø7', 'V7'],
    sections: [
      { bars: [1, 5], key: 'C', title: 'Down the cycle of fifths', text: 'Am7 (vi), Dm7 (ii), G7 (V), Cmaj7 (I), Fmaj7 (IV). In bar 4 Cmaj7 turns into C7 for two beats: it becomes the V7 of F and points there.', aim: 'Each 7th steps down to the next 3rd: G to F (Am7 to Dm7), C to B (Dm7 to G7), F to E (G7 to Cmaj7), B♭ to A (C7 to Fmaj7).', scale: 'C major; add B♭ for the C7 (C Mixolydian).' },
      { bars: [6, 8], key: 'Am', title: 'Into A minor', text: 'Bm7♭5–E7–Am7 is a minor ii–V–i in A minor, the relative minor. In bar 8 Am7 turns into A7, the V7 of D minor, to lead to Dm7.', aim: 'G♯ on E7 rising to A on Am7. On A7, G (its 7th) falls to F, the 3rd of Dm7.', scale: 'A harmonic minor over E7.' },
      { bars: [9, 14], key: 'C', title: 'ii–V–I, twice', text: 'Dm7–G7–Cmaj7, then Am7 (vi) steps aside and ii–V–I comes again.', aim: 'C (the 7th of Dm7) falls to B (the 3rd of G7); F (the 7th of G7) falls to E (the 3rd of Cmaj7).' },
      { bars: [15, 16], key: 'Am', title: 'Turnaround to the top', text: 'Bm7♭5–E7 is the minor ii–V that takes you back to Am7 in bar 1.' }
    ]
  },

  fblues: {
    intro: 'A 12-bar blues in F with jazz ii–Vs added. In the blues the I and IV chords are dominant 7ths (F7, B♭7), which gives the bluesy flat 7th; the ii–Vs and a diminished chord connect them.',
    rn: ['I7', 'IV7', 'I7', 'ii7/IV V7/IV', 'IV7', '#iv°7', 'I7', 'V7/ii', 'ii7', 'V7', 'I7 V7/ii', 'ii7 V7'],
    sections: [
      { bars: [1, 4], key: 'F', title: 'I, and a quick IV', text: 'F7 (I), a quick change to B♭7 (IV) in bar 2, back to F7. Bar 4 is Cm7–F7, a ii–V that points to B♭7.', aim: 'A (the 3rd of F7) falls to A♭ (the 7th of B♭7); E♭ (the 7th of F7) falls to D (the 3rd of B♭7).', scale: 'The F blues scale (F A♭ B♭ B C E♭) fits the whole form; F Mixolydian on F7, B♭ Mixolydian on B♭7.' },
      { bars: [5, 8], key: 'F', title: 'IV, a diminished step, back to I', text: 'B♭7 (IV), then B°7: the bass can climb B♭, B, C (playing F7 with C in the bass). D7 in bar 8 is the V7 of Gm7.', aim: 'F♯ (the 3rd of D7) rises to G on Gm7.' },
      { bars: [9, 12], key: 'F', title: 'ii–V–I and the turnaround', text: 'Gm7–C7–F7 is a ii–V–I. Then D7–Gm7–C7 is a turnaround: it leads back to F7 at the top.', aim: 'F (the 7th of Gm7) falls to E (the 3rd of C7); B♭ (the 7th of C7) falls to A (the 3rd of F7).' }
    ]
  },

  satin: {
    intro: 'C major, reached only at the end. The section is a chain of ii–Vs that keeps stepping up (towards D, then G) without landing, then slides down by half steps into C.',
    rn: ['ii7 V7', 'ii7 V7', 'ii7:D V7:D', 'ii7:D V7:D', 'ii7:G V7:G', 'bvi7 bII7', 'Imaj7', 'Imaj7'],
    sections: [
      { bars: [1, 2], key: 'C', title: 'A ii–V that does not land', text: 'Dm7–G7 twice. G7 wants to go to C, but the tune goes back to Dm7 instead.', aim: 'F (the 7th of G7) would fall to E; here it stays, because F is also the 3rd of Dm7.' },
      { bars: [3, 4], key: 'C', title: 'The same, a step higher', text: 'Em7–A7 is the same shape a whole step up: the ii–V of D, which never arrives.', aim: 'G (the 3rd of Em7) is also the 7th of A7; D (the 7th of Em7) falls to C♯ (the 3rd of A7).' },
      { bars: [5, 6], key: 'C', title: 'Up again, then sliding down', text: 'Am7–D7 is the ii–V of G. Then the same shape slides down a half step: A♭m7–D♭7. D♭7 is a tritone substitute for G7: it shares G7’s 3rd and 7th (B and F), and its root falls a half step to C.', aim: 'From D7 to D♭7 both guide tones fall a half step (F♯ to F, C to B); then F falls to E on Cmaj7.' },
      { bars: [7, 8], key: 'C', title: 'Home at last', text: 'Cmaj7 (I) for two bars.', scale: 'C major; over the ii–Vs that point elsewhere, the major scale of the key they point to (D major over Em7–A7, G major over Am7–D7).' }
    ]
  },

  atrain: {
    intro: 'C major. The famous sound is bar 3: D7, a chord from outside the key, with a raised 11th (G♯) in the melody. Then an ordinary ii–V–I brings it home.',
    rn: ['Imaj7', 'Imaj7', 'II7', 'II7', 'ii7', 'V7', 'Imaj7', 'Imaj7'],
    sections: [
      { bars: [1, 4], key: 'C', title: 'I, then the borrowed II7', text: 'Two bars of Cmaj7, then two of D7. C major’s own chord on D is Dm7; making it D7 brings in F♯, the surprise. The ♯11 is G♯.', aim: 'E (the 3rd of Cmaj7) rises a whole step to F♯ (the 3rd of D7).', scale: 'D Lydian dominant over D7♯11 (D E F♯ G♯ A B C).' },
      { bars: [5, 8], key: 'C', title: 'ii–V–I home', text: 'D7 turns minor (Dm7, the ii), then G7 (V) and Cmaj7 (I).', aim: 'F♯ falls to F as D7 becomes Dm7; C (the 7th of Dm7) falls to B (the 3rd of G7); F (the 7th of G7) falls to E (the 3rd of Cmaj7).' }
    ]
  },

  sowhat: {
    intro: 'Modal: one chord for a long time, with one scale. D Dorian for 16 bars, the same scale a half step up (E♭ Dorian) for the bridge, then D Dorian again. There are no ii–Vs; the interest comes from your rhythm, your phrasing and the move up and back.',
    rn: ['i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7',
      'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7'],
    sections: [
      { bars: [1, 16], key: 'Dm', title: 'D Dorian', text: 'Dm7 for 16 bars. Lean on the chord tones (D, F, A, C) and use E, G and B as passing and colour notes; B is the note that makes it Dorian rather than plain minor.', scale: 'D Dorian: the white notes from D to D.' },
      { bars: [17, 24], key: 'Ebm', title: 'Up a half step', text: 'Everything moves up a half step to E♭m7. Practise the change: from any note of D Dorian, find the nearest note of E♭ Dorian.', scale: 'E♭ Dorian: E♭ F G♭ A♭ B♭ C D♭.' },
      { bars: [25, 32], key: 'Dm', title: 'Back down', text: 'D Dorian again for the last eight bars.' }
    ]
  },

  rhythm: {
    intro: 'B♭ major, fast. The A section is mostly I–vi–ii–V turnarounds, two chords a bar, with a short visit to E♭ (IV) in the middle. Hear it as B♭ the whole time and colour the moving chords with their 3rds. (The full tune’s bridge is four dominant 7ths, two bars each: D7, G7, C7, F7.)',
    rn: ['Imaj7 V7/ii', 'ii7 V7', 'iii7 V7/ii', 'ii7 V7', 'ii7/IV V7/IV', 'IVmaj7 #iv°7', 'iii7 V7/ii', 'ii7 V7'],
    sections: [
      { bars: [1, 4], key: 'Bb', title: 'I–vi–ii–V, twice', text: 'B♭maj7, G7, Cm7, F7. G7 is the chord on the 6th note made dominant, so it points to Cm7. Bar 3 replaces B♭ with Dm7 (iii), which shares three of its notes (D, F, A).', aim: 'B (the 3rd of G7) rises to C on Cm7; B♭ (the 7th of Cm7) falls to A (the 3rd of F7).', scale: 'B♭ major; B on G7 is the one outside note to aim at.' },
      { bars: [5, 6], key: 'Bb', title: 'A visit to E♭', text: 'Fm7–B♭7 is a ii–V to E♭maj7 (IV). E°7 then lets the bass climb E♭, E, F on the way back to B♭.', aim: 'A♭ (the 7th of B♭7) falls to G (the 3rd of E♭maj7).' },
      { bars: [7, 8], key: 'Bb', title: 'Turnaround', text: 'Dm7–G7–Cm7–F7 (iii–VI–ii–V) leads back to B♭ at the top, or into the bridge.' }
    ]
  },

  atttya: {
    intro: 'The key keeps moving. Bars 1–8 are in A♭ major, then jump to C; bars 9–16 do the same a fifth lower (E♭, then G). The bridge visits G and E, and the last section returns to A♭. Each new key arrives by a V7 or a ii–V, so the 3rds and 7ths keep moving by small steps.',
    rn: ['vi7', 'ii7', 'V7', 'Imaj7', 'IVmaj7', 'V7', 'Imaj7', 'Imaj7',
      'vi7', 'ii7', 'V7', 'Imaj7', 'IVmaj7', 'iiø7 V7', 'Imaj7', 'Imaj7',
      'ii7', 'V7', 'Imaj7', 'Imaj7', 'iiø7', 'V7', 'Imaj7', 'V7/vi',
      'vi7', 'ii7', 'V7', 'Imaj7', 'IVmaj7', 'iv7', 'iii7', 'biii°7', 'ii7', 'V7', 'Imaj7', 'viiø7 V7/vi'],
    sections: [
      { bars: [1, 5], key: 'Ab', title: 'Down the cycle of fifths in A♭', text: 'Fm7 (vi), B♭m7 (ii), E♭7 (V), A♭maj7 (I), D♭maj7 (IV): each root a fifth below the last.', aim: 'Each 7th falls to the next 3rd: E♭ to D♭, A♭ to G, D♭ to C.' },
      { bars: [6, 8], key: 'C', title: 'Jump to C', text: 'G7–Cmaj7 is a V–I in C, a major third below A♭. D♭maj7 and G7 share one note, F.', aim: 'Keep F (in D♭maj7 and in G7, where it is the 7th) and let it fall to E on Cmaj7. C on D♭maj7 falls to B, the 3rd of G7.' },
      { bars: [9, 13], key: 'Eb', title: 'The same five chords, in E♭', text: 'Bars 1–5 again, a fifth lower: Cm7, Fm7, B♭7, E♭maj7, A♭maj7.' },
      { bars: [14, 16], key: 'G', title: 'Jump to G', text: 'A♭maj7 turns into Am7♭5 by moving one note, A♭ up to A. Then D7 and Gmaj7: a ii–V–I in G, a major third below E♭.', aim: 'C (the 7th of D7) falls to B (the 3rd of Gmaj7).' },
      { bars: [17, 20], key: 'G', title: 'Bridge: ii–V–I in G', text: 'A plain ii–V–I in G: Am7, D7, Gmaj7.', aim: 'G (the 7th of Am7) falls to F♯ (the 3rd of D7); C (the 7th of D7) falls to B (the 3rd of Gmaj7).' },
      { bars: [21, 23], key: 'E', title: 'ii–V–I in E', text: 'F♯m7♭5–B7–Emaj7: the same move into E major, a minor third below G.', aim: 'E (the 7th of F♯m7♭5) falls to D♯ (the 3rd of B7); A (the 7th of B7) falls to G♯ (the 3rd of Emaj7).' },
      { bars: [24, 29], key: 'Ab', title: 'Back to A♭', text: 'C7 is the V7 of F minor; its 3rd, E, is the root of the chord before it, Emaj7. It leads into Fm7, and bars 25–29 repeat bars 1–5.', aim: 'E (the 3rd of C7) rises a half step to F; B♭ (the 7th of C7) falls to A♭ (the 3rd of Fm7).' },
      { bars: [30, 36], key: 'Ab', title: 'A longer ending', text: 'D♭maj7 turns into D♭m7 (iv, borrowed from A♭ minor), then the bass walks down by half steps: Cm7 (iii), B°7, B♭m7 (ii), E♭7 (V), A♭maj7 (I). Gm7♭5–C7 in bar 36 leads back to Fm7 at the top.', aim: 'F (the 3rd of D♭maj7) falls to F♭ (the 3rd of D♭m7), then to E♭ (the 3rd of Cm7).' }
    ]
  },

  solar: {
    intro: 'A 12-bar cycle that keeps changing key, always by a ii–V, each new key a whole step lower than the last: from C minor to F, E♭ and D♭, then a minor ii–V back to C minor.',
    rn: ['i6', 'i6', 'ii7', 'V7', 'Imaj7', 'Imaj7', 'ii7', 'V7', 'Imaj7', 'ii7 V7', 'Imaj7', 'iiø7 V7'],
    sections: [
      { bars: [1, 2], key: 'Cm', title: 'C minor', text: 'Cm6 for two bars: C minor with a bright 6th (A).', scale: 'C Dorian (C D E♭ F G A B♭) or C melodic minor (with B).' },
      { bars: [3, 6], key: 'F', title: 'ii–V–I in F', text: 'Gm7–C7–Fmaj7: a ii–V–I in F major, a fourth above C.', aim: 'F (the 7th of Gm7) falls to E (the 3rd of C7); B♭ (the 7th of C7) falls to A (the 3rd of Fmaj7).' },
      { bars: [7, 9], key: 'Eb', title: 'Down a whole step: E♭', text: 'Fmaj7 turns minor (Fm7), which is the ii of E♭: Fm7–B♭7–E♭maj7.', aim: 'A (the 3rd of Fmaj7) falls to A♭ (the 3rd of Fm7); E♭ (the 7th of Fm7) falls to D (the 3rd of B♭7); A♭ (the 7th of B♭7) falls to G (the 3rd of E♭maj7).' },
      { bars: [10, 11], key: 'Db', title: 'Down another whole step: D♭', text: 'The same move again: E♭maj7 turns minor (E♭m7), the ii of D♭: E♭m7–A♭7–D♭maj7.', aim: 'G falls to G♭ as E♭maj7 becomes E♭m7. D♭ (the 7th of E♭m7) falls to C (the 3rd of A♭7), and G♭ (the 7th of A♭7) falls to F (the 3rd of D♭maj7).' },
      { bars: [12, 12], key: 'Cm', title: 'Minor ii–V back to C minor', text: 'Dm7♭5–G7 takes you back to Cm6 at the top. As in Blue Bossa, D♭maj7 to Dm7♭5 moves only one note, D♭ up to D.' }
    ]
  },

  giant: {
    intro: 'Three keys a major third apart: B, G and E♭. They split the octave into three equal parts, so the tune moves to a new key every bar or two, each reached by its own V7 or ii–V. Coltrane recorded it in 1959 (released in 1960); it is the hardest tune here. Start slow and learn the three major chords first.',
    rn: ['Imaj7:B V7:G', 'Imaj7:G V7:Eb', 'Imaj7:Eb', 'ii7:G V7:G', 'Imaj7:G V7:Eb', 'Imaj7:Eb V7:B', 'Imaj7:B', 'ii7:Eb V7:Eb',
      'Imaj7:Eb', 'ii7:G V7:G', 'Imaj7:G', 'ii7:B V7:B', 'Imaj7:B', 'ii7:Eb V7:Eb', 'Imaj7:Eb', 'ii7:B V7:B'],
    sections: [
      { bars: [1, 7], key: 'B', title: 'Three keys, each reached by a V7', text: 'B, then D7 to G, then B♭7 to E♭. Bars 4–7 go round again: Am7–D7 to G, B♭7 to E♭, F♯7 to B. Every V7 is the dominant of the next key.', aim: 'The 7th of each V7 falls a half step to the 3rd of the next major chord: C to B (D7 to Gmaj7), A♭ to G (B♭7 to E♭maj7), E to D♯ (F♯7 to Bmaj7).', scale: 'B major, G major and E♭ major; over each V7, the major scale of the key it leads to.' },
      { bars: [8, 16], key: 'Eb', title: 'The same keys by ii–Vs', text: 'From bar 8 each key is reached by a ii–V lasting one bar: Fm7–B♭7 to E♭, Am7–D7 to G, C♯m7–F♯7 to B. The last bar (C♯m7–F♯7) leads back to Bmaj7 at the top.', aim: 'Coltrane’s own approach: play notes 1, 2, 3 and 5 of each key (B C♯ D♯ F♯, G A B D, E♭ F G B♭) and move the shape into place.' }
    ]
  },

  monkblues: {
    intro: 'A 12-bar blues in B♭ with dominant 7ths on I, IV and V, and a diminished chord in bar 6 that lets the bass climb from E♭ through E to F (B♭7 with F in the bass). Monk kept blues like this plain so that his own sounds stood out: whole-tone runs over the dominants, minor seconds in the chords, and a lot of space.',
    rn: ['I7', 'IV7', 'I7', 'I7', 'IV7', '#iv°7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7'],
    sections: [
      { bars: [1, 4], key: 'Bb', title: 'I with a quick IV', text: 'B♭7, a quick E♭7 in bar 2, then B♭7 for two bars.', aim: 'D (the 3rd of B♭7) falls to D♭ (the 7th of E♭7); A♭ (the 7th of B♭7) falls to G (the 3rd of E♭7).', scale: 'The B♭ blues scale (B♭ D♭ E♭ E F A♭) over the whole form.' },
      { bars: [5, 8], key: 'Bb', title: 'IV and the diminished step', text: 'E♭7, then E°7 (E G B♭ D♭), then home to B♭7. E°7 shares three notes with B♭7 (G, B♭ and D♭ against B♭7♭9), so it sounds like B♭7 leaning upward.', aim: 'G on E°7 rising to A♭, or D♭ falling to D on B♭7.' },
      { bars: [9, 12], key: 'Bb', title: 'V, IV, I and a turnaround', text: 'F7 (V) falls to E♭7 (IV), then B♭7 and F7 to go round again.', aim: 'A (the 3rd of F7) falls to G (the 3rd of E♭7); then D on B♭7.', scale: 'Over F7, the whole-tone scale on F (F G A B C♯ E♭) for the Monk sound.' }
    ]
  },

  monkslips: {
    intro: 'F, with each F7 nudged up a half step to G♭7 and straight back. The second half climbs: D♭7, D7, E♭7, E7, a dominant on every half step, until E7 slides into F7. Monk built tunes on moves like this; every chord is a 7th, so the colour comes from the root moving, not the chord type.',
    rn: ['I7 bII7', 'I7 bII7', 'I7 bII7', 'I7', 'bVI7', 'VI7', 'bVII7 VII7', 'I7'],
    sections: [
      { bars: [1, 4], key: 'F', title: 'Up a half step and back', text: 'F7 to G♭7 and back, three times, then F7. G♭7 is a half step above home, so it falls back like a neighbour note.', aim: 'A (the 3rd of F7) up to B♭ (the 3rd of G♭7) and back; E♭ (the 7th of F7) to E (the 7th of G♭7, F♭) and back.' },
      { bars: [5, 8], key: 'F', title: 'Dominants climbing by half steps', text: 'D♭7, D7, E♭7, E7: the same chord moved up a fret at a time until it lands on F7.', aim: 'Move one shape up a fret per chord. The 3rds climb F, F♯, G, G♯ and arrive on A.', scale: 'Mixolydian on each root, or simply the chord’s own four notes moved up a fret at a time.' }
    ]
  },

  sunravamp: {
    intro: 'E minor for four bars, two of F7♯11, then E minor again. F7♯11 is a half step above home (♭II), so it is a short trip out and straight back. The vamp is the point: in Sun Ra’s Arkestra one chord could go on for minutes while chants and solos floated over it.',
    rn: ['i7', 'i7', 'i7', 'i7', 'bII7#11', 'bII7#11', 'i7', 'i7'],
    sections: [
      { bars: [1, 4], key: 'Em', title: 'The vamp', text: 'Em7 over the bell pattern. Nothing moves, so you choose when to play and when to wait.', aim: 'G (the 3rd) and D (the 7th); end phrases on E or B.', scale: 'E Dorian (E F♯ G A B C♯ D) or E minor pentatonic.' },
      { bars: [5, 6], key: 'Em', title: 'Out a half step', text: 'F7♯11 (F A C E♭ B), a half step above E. The B is the ♯11 and is also the 5th of Em7, so it can carry over.', aim: 'Hold B through the change; or play A and E♭ (the 3rd and 7th of F7) and let them fall to G and D on Em7.', scale: 'F Lydian dominant (F G A B C D E♭).' },
      { bars: [7, 8], key: 'Em', title: 'Home', text: 'Back to Em7 for two bars before the top.' }
    ]
  },

  /* ---------- More favourite players ---------- */
  milesmodal: {
    intro: 'Thirty-two bars and only two chords: Dm7 for sixteen bars, E♭m7 for the eight-bar bridge, Dm7 to end. Each chord stands for a whole mode, D Dorian and then E♭ Dorian, as on Miles Davis’s Kind of Blue (1959). With nothing changing, the shape of the solo has to come from you.',
    rn: ['i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7', 'i7'],
    sections: [
      { bars: [1, 8], key: 'Dm', title: 'A: D Dorian', text: 'Eight bars of Dm7. Treat it as one long chord and build a phrase that rises and falls across all eight.', aim: 'F and C (the 3rd and 7th); B, the 6th, for the Dorian colour.', scale: 'D Dorian (D E F G A B C): the notes of C major.' },
      { bars: [9, 16], key: 'Dm', title: 'A again', text: 'The same eight bars. Answer what you played the first time instead of starting something new.' },
      { bars: [17, 24], key: 'Ebm', title: 'B: up a half step', text: 'E♭m7 for eight bars: everything moves one fret up. Arriving there is the event of the tune, so make the first note of the bridge count.', aim: 'G♭ and D♭ (the 3rd and 7th); C, the 6th.', scale: 'E♭ Dorian (E♭ F G♭ A♭ B♭ C D♭).' },
      { bars: [25, 32], key: 'Dm', title: 'A: home', text: 'Back down to Dm7. A half step down feels like coming home, so end your phrase near D or A.' }
    ]
  },

  mileselectric: {
    intro: 'A funk vamp on E7♯9 for eight bars, then a lift through G7 and A7 (♭III and IV) before the vamp comes back. In Miles’s electric bands one chord could run for minutes; the changes came when he cued them. The ♯9 (G) and the 3rd (G♯) side by side give the chord its bite and let the blues scale fit it.',
    rn: ['I7#9', 'I7#9', 'I7#9', 'I7#9', 'I7#9', 'I7#9', 'I7#9', 'I7#9', 'bIII7', 'IV7', 'bIII7', 'IV7'],
    sections: [
      { bars: [1, 8], key: 'E', title: 'The vamp', text: 'E7♯9 for eight bars. Play riffs with the bass and drums, short stabs, or nothing; a solo here is built of rhythm as much as notes.', aim: 'G (the ♯9) bent toward G♯, and D (the 7th).', scale: 'E minor pentatonic or the E blues scale (E G A B♭ B D).' },
      { bars: [9, 12], key: 'E', title: 'The lift', text: 'G7 and A7, a bar each, twice. G7 is a minor third above E, so the blues scale still fits; A7 is the IV of the blues.', aim: 'B (the 3rd of G7) up to C♯ (the 3rd of A7).', scale: 'G Mixolydian, then A Mixolydian; or keep the E blues scale and bend.' }
    ]
  },

  arseniomontuno: {
    intro: 'A son in A minor in two parts, as Arsenio Rodríguez’s conjunto played them: eight bars of song with one chord a bar, then the montuno, where the same i–iv–V7–i turns twice as fast and the tres, the trumpets and the coro take over. The chords stay simple so that the rhythm can be complicated.',
    rn: ['i', 'iv', 'V7', 'i', 'i', 'iv', 'V7', 'i', 'i iv', 'V7 i', 'i iv', 'V7 i', 'i iv', 'V7 i', 'i iv', 'V7 i'],
    sections: [
      { bars: [1, 8], key: 'Am', title: 'The son', text: 'Am, Dm, E7, Am, twice: the song part, one chord a bar. The bass anticipates each change on the & of 2 and on 4.', aim: 'C (the 3rd of Am) to F on Dm; G♯ on E7 rising to A.', scale: 'A harmonic minor (A B C D E F G♯) for the G♯ of E7; A natural minor elsewhere.' },
      { bars: [9, 16], key: 'Am', title: 'The montuno', text: 'Two chords a bar, round and round. Here the tres plays its cells and the trumpets their riffs, the diablo.', aim: 'Thirds on the clave strokes: C and E over Am, D and F over Dm, B and D (or G♯ and B) over E7.', scale: 'A minor pentatonic for riffs, with G♯ over E7.' }
    ]
  },

  bvscson: {
    intro: 'Dm, F, Gm, A7, round and round: i–♭III–iv–V7 in D minor. Loops like this carry many sones from the Oriente, the east of Cuba, including songs on the Buena Vista Social Club record. Every chord is on the top three strings near the nut, so the left hand is free to fill between them.',
    rn: ['i', 'bIII', 'iv', 'V7', 'i', 'bIII', 'iv', 'V7', 'i', 'bIII', 'iv', 'V7', 'i', 'bIII', 'iv', 'V7'],
    sections: [
      { bars: [1, 8], key: 'Dm', title: 'The loop', text: 'i to ♭III is D minor to its relative major, F; iv (Gm) and V7 (A7) bring it back. The bass moves D, F, G, A: up the minor scale.', aim: 'F on Dm and on F (it belongs to both); D on Gm; C♯ on A7, rising to D.', scale: 'D natural minor (D E F G A B♭ C), with C♯ over A7.' },
      { bars: [9, 16], key: 'Dm', title: 'Round again', text: 'The same four chords. Change your fills, not the chords: a run in thirds into Gm, single notes into A7.', aim: 'End every fill a step from the next chord’s root or 3rd.' }
    ]
  },

  bvscbolero: {
    intro: 'A Cuban bolero in C, slow and romantic: I, then A7 (V7 of ii) to Dm7, and the ii–V home. The second half goes to the IV through C7, then darkens it to F minor 6 (iv, borrowed from C minor), a sound boleros love, before the turnaround.',
    rn: ['I', 'V7/ii', 'ii7', 'V7', 'iii7', 'V7/ii', 'ii7', 'V7', 'I', 'V7/IV', 'IV', 'iv6', 'I', 'V7/ii', 'ii7 V7', 'I'],
    sections: [
      { bars: [1, 8], key: 'C', title: 'Round the circle', text: 'C, A7, Dm7, G7, then Em7 standing in for C before A7 again. Each dominant leads a fifth down.', aim: 'C♯ (the 3rd of A7) up to D on Dm7; B on G7 to C.', scale: 'C major, with C♯ over A7.' },
      { bars: [9, 16], key: 'C', title: 'To IV, and darker', text: 'C7 leads to F (IV); then F becomes Fm6 (iv), whose A♭ falls to G on the way home. The last bars are the turnaround.', aim: 'B♭ on C7 to A on F; A to A♭ on Fm6, then G.', scale: 'C major; F minor 6 arpeggio (F A♭ C D) over Fm6.' }
    ]
  },

  piazzollaminor: {
    intro: 'A minor over Piazzolla’s 3-3-2. The A section falls: Am, Am7, F♯m7♭5 (Am with F♯ in the bass, the line A, G, F♯), Fmaj7, then iv and V. The B section moves through the circle, Dm7 G7 Cmaj7 Fmaj7, into the minor ii–V (Bm7♭5 E7) and home.',
    rn: ['i', 'i7', 'viø7', 'bVImaj7', 'iv7', 'V7', 'i', 'V7', 'iv7', 'bVII7', 'bIIImaj7', 'bVImaj7', 'iiø7', 'V7', 'i', 'i'],
    sections: [
      { bars: [1, 4], key: 'Am', title: 'The falling line', text: 'Am, Am7, F♯m7♭5, Fmaj7: one note steps down each bar, A, G, F♯, F, over the same A minor colour.', aim: 'The falling note itself: A, G, F♯, F, then E.', scale: 'A melodic minor (with F♯ and G♯) in bar 3, natural minor elsewhere.' },
      { bars: [5, 8], key: 'Am', title: 'iv and V', text: 'Dm7, E7, Am, E7: the strongest close in minor. E7 is where the tango leans hardest.', aim: 'G♯ on E7, falling to A or rising to A.', scale: 'A harmonic minor (A B C D E F G♯).' },
      { bars: [9, 12], key: 'Am', title: 'The circle', text: 'Dm7, G7, Cmaj7, Fmaj7: a run of fifths through the relative major, C.', aim: 'F (the 7th of G7) falling to E (the 3rd of C).', scale: 'C major (the same notes as A minor) through these bars.' },
      { bars: [13, 16], key: 'Am', title: 'Minor ii–V home', text: 'Bm7♭5 and E7, the ii–V of A minor, then two bars of Am.', aim: 'D on Bm7♭5, G♯ on E7, A.', scale: 'A harmonic minor.' }
    ]
  },

  sosazamba: {
    intro: 'A zamba in A minor, slow and in six: a verse of eight bars and its estribillo, the refrain. It turns round the minor circle: Am, Dm, G7, C, then E7 back to Am. G7 to C is the relative major, so the music rises in the middle of each half and falls back to minor at its end.',
    rn: ['i', 'i', 'iv', 'iv', 'bVII7', 'bVII7', 'bIII', 'V7', 'i', 'i', 'iv', 'bVII7', 'bIII', 'V7', 'i', 'i'],
    sections: [
      { bars: [1, 8], key: 'Am', title: 'The verse', text: 'Two bars each of Am, Dm and G7, then C and E7: the circle of fifths in A minor, with E7 to lead home.', aim: 'C on Am, F on Dm, B on G7, E on C, G♯ on E7.', scale: 'A natural minor, with G♯ over E7.' },
      { bars: [9, 16], key: 'Am', title: 'The estribillo', text: 'The same circle, faster: Dm and G7 a bar each, C, E7 and home.', aim: 'Let the line fall to A or C on the last two bars.', scale: 'A natural minor, with G♯ over E7.' }
    ]
  },

  miltonminas: {
    intro: 'D major in the A section: Dmaj7, Bm7, Gmaj7, then Em7 and A7. The B section borrows from D minor, Fmaj7, Cmaj7 and B♭maj7 (♭III, ♭VII and ♭VI), and its major 7ths over shifting roots give the floating Minas sound, before Em7 and A7 lead home. Keep the open B and E strings ringing where you can.',
    rn: ['Imaj7', 'Imaj7', 'vi7', 'vi7', 'IVmaj7', 'IVmaj7', 'ii7', 'V7', 'bIIImaj7', 'bIIImaj7', 'bVIImaj7', 'bVIImaj7', 'bVImaj7', 'bVImaj7', 'ii7', 'V7'],
    sections: [
      { bars: [1, 8], key: 'D', title: 'A: in D major', text: 'Dmaj7, Bm7, Gmaj7 and Em7 A7, two bars each but the last. The open B and E belong to every chord here.', aim: 'F♯ on Dmaj7, D on Bm7, B on Gmaj7; G on A7 falling to F♯.', scale: 'D major (D E F♯ G A B C♯).' },
      { bars: [9, 16], key: 'D', title: 'B: borrowed from D minor', text: 'Fmaj7, Cmaj7 and B♭maj7 come from D minor (♭III, ♭VII and ♭VI), each a major 7th chord, so the colour stays bright while the key goes dark. Em7 and A7 bring back D major.', aim: 'E (the 7th of Fmaj7) to E (the 3rd of Cmaj7), then D (the 3rd of B♭maj7); C♯ on A7.', scale: 'F Lydian, C Lydian and B♭ Lydian (each major scale with a raised 4th), or just each chord’s own notes.' }
    ]
  },

  getzbossa: {
    intro: 'A bossa in C with the chromatic ii–Vs of the songs Stan Getz played: Em7 A7 slips down to E♭m7 A♭7 and lands on Dm7 G7. The bridge moves to E♭ major by its own ii–V (Fm7 B♭7), then A♭maj7 (♭VI in C) slides back to Dm7 G7 and home.',
    rn: ['Imaj7', 'Imaj7', 'iii7 V7/ii', 'biii7 bVI7', 'ii7', 'V7', 'Imaj7', 'ii7 V7', 'Imaj7', 'Imaj7', 'ii7 V7', 'Imaj7', 'bVImaj7', 'ii7 V7', 'Imaj7', 'ii7 V7'],
    sections: [
      { bars: [1, 8], key: 'C', title: 'A: ii–Vs that slide', text: 'Two bars of C, then Em7 A7, E♭m7 A♭7, Dm7 G7: the same ii–V pair one fret lower each time, so one shape slides down the neck.', aim: 'G (the 3rd of Em7, the 7th of A7), then G♭, then F: one note falling a half step a bar.', scale: 'C major over C; each ii–V’s own major key (D, D♭, C), or simply its guide tones.' },
      { bars: [9, 10], key: 'C', title: 'B: C again', text: 'Two bars of Cmaj7 to start the bridge.' },
      { bars: [11, 12], key: 'Eb', title: 'Up to E♭', text: 'Fm7 B♭7 to E♭maj7: a ii–V into a key a minor third up.', aim: 'A♭ (the 3rd of Fm7) to A♭ (the 7th of B♭7) to G (the 3rd of E♭maj7).', scale: 'E♭ major.' },
      { bars: [13, 16], key: 'C', title: 'Back home', text: 'A♭maj7, ♭VI in C, borrowed from C minor, then Dm7 G7 and C. Its A♭ falls a half step to G.', aim: 'G on A♭maj7 to F on Dm7 and G7, then E.', scale: 'A♭ Lydian (A♭ B♭ C D E♭ F G) over A♭maj7.' }
    ]
  },

  kulthumkurd: {
    intro: 'Maqam Kurd on D (D E♭ F G A B♭ C) over the maqsum rhythm, in two parts: a lazima, the refrain the orchestra plays between sung lines, and the line itself. Arabic music is a melody, not a chord progression; the chords here only mark where the maqam rests: D minor at home, E♭ for the dark second degree, G minor for the fourth.',
    rn: ['i', 'i', 'bII', 'i', 'iv', 'iv', 'bII', 'i'],
    sections: [
      { bars: [1, 4], key: 'Dm', title: 'The lazima', text: 'D, then E♭ (the half step above the tonic that defines Kurd), then D again. Play the lazima tight with the drum.', aim: 'E♭ falling to D; A, the maqam’s second resting note.', scale: 'Maqam Kurd on D: D E♭ F G A B♭ C.' },
      { bars: [5, 8], key: 'Dm', title: 'The line', text: 'Gm, the 4th, opens the sung line; E♭ and D close it. Repeat it with a new ornament each time round.', aim: 'G and B♭ over Gm, then down to D.', scale: 'Maqam Kurd on D; an upper jins from G (G A B♭ C) for the line.' }
    ]
  },

  sunraspace: {
    intro: 'D minor with a slip: Dm7, then E♭m7 a half step up (♭ii) and straight back, then B♭maj7 (♭VI) and A7♯9 (V) home. Sun Ra liked chords that slide by half steps and dominants with a bite; the A7♯9 holds both C♯ and C.',
    rn: ['i7', 'i7', 'bii7', 'i7', 'bVImaj7', 'V7#9', 'i7', 'i7'],
    sections: [
      { bars: [1, 4], key: 'Dm', title: 'A slip up and back', text: 'Dm7, Dm7, E♭m7, Dm7: the whole chord moves up a fret for one bar.', aim: 'F on Dm7, G♭ on E♭m7, back to F.', scale: 'D Dorian, then E♭ Dorian for one bar.' },
      { bars: [5, 8], key: 'Dm', title: 'Home through A7♯9', text: 'B♭maj7 falls a half step to A7♯9, whose C♯ and C (the ♯9) rub, then two bars of Dm7.', aim: 'D on B♭maj7, C♯ on A7♯9, D on Dm7.', scale: 'B♭ Lydian over B♭maj7; the altered scale or D harmonic minor over A7♯9.' }
    ]
  },

  arseniodos: {
    intro: 'A major son in C on the 2-3 clave: eight bars of song with I, V7 and IV, then a montuno where C–F and G7–F turn every bar. The bars of the montuno are where the tres plays its guajeo and the band its breaks.',
    rn: ['I', 'V7', 'V7', 'I', 'I', 'IV', 'V7', 'I', 'I IV', 'V7 IV', 'I IV', 'V7 IV', 'I IV', 'V7 IV', 'I IV', 'V7 I'],
    sections: [
      { bars: [1, 8], key: 'C', title: 'The son', text: 'C, G7 for two bars, C; then C, F, G7, C. The bass anticipates each change.', aim: 'E on C, B and F on G7, A on F.', scale: 'C major.' },
      { bars: [9, 16], key: 'C', title: 'The montuno', text: 'C F, G7 F, round and round, ending on G7 C.', aim: 'E and G on C, A on F, B on G7.', scale: 'C major pentatonic for guajeos; add F and B for G7.' }
    ]
  },

  piazzollamilonga: {
    intro: 'A slow milonga in E minor over 3-3-2. The A section goes i–iv–V7, then C (♭VI) and the minor ii–V (F♯m7♭5 B7) home. The B section turns to the relative major, G, by D7, then Cmaj7 and the minor ii–V bring E minor back.',
    rn: ['i', 'i', 'iv', 'V7', 'i', 'bVI', 'iiø7', 'V7', 'i', 'i', 'iv', 'bVII7', 'bIIImaj7', 'bVImaj7', 'iiø7 V7', 'i'],
    sections: [
      { bars: [1, 8], key: 'Em', title: 'A: E minor', text: 'Em, Am, B7, then C and the minor ii–V F♯m7♭5 B7.', aim: 'G on Em, C on Am, D♯ on B7 rising to E.', scale: 'E harmonic minor (E F♯ G A B C D♯).' },
      { bars: [9, 16], key: 'Em', title: 'B: to G and back', text: 'D7 leads to Gmaj7, the relative major; Cmaj7 falls to F♯m7♭5 B7 and E minor.', aim: 'F♯ on D7, B on Gmaj7, E on Cmaj7, D♯ on B7.', scale: 'E natural minor (the notes of G major), with D♯ over B7.' }
    ]
  },

  sosachacarera: {
    intro: 'A chacarera in D minor on three chords: i, V7 and iv. The harmony is simple so the rhythm can be strong: the two-against-three of the sesquiáltera, the bombo and the strum carry it.',
    rn: ['i', 'V7', 'i', 'V7', 'i', 'iv', 'V7', 'i', 'iv', 'i', 'V7', 'i'],
    sections: [
      { bars: [1, 8], key: 'Dm', title: 'The verse', text: 'Dm and A7 back and forth, then Gm, A7 and home.', aim: 'F on Dm, C♯ on A7, B♭ on Gm.', scale: 'D harmonic minor (D E F G A B♭ C♯).' },
      { bars: [9, 12], key: 'Dm', title: 'The close', text: 'Gm, Dm, A7, Dm: the four bars that end each verse.', aim: 'D on Gm, A on Dm, C♯ on A7, D.', scale: 'D harmonic minor.' }
    ]
  },

  miltonpedal: {
    intro: 'D, C and G over a D that the guitar keeps ringing: I, ♭VII and IV of D Mixolydian, the major scale with a C natural. The pedal makes the C and G chords sound suspended over D. A7 in the last bar brings a C♯ back, as a lift into the top.',
    rn: ['I', 'bVII', 'IV', 'I', 'I', 'bVII', 'IV', 'V7'],
    sections: [
      { bars: [1, 4], key: 'D', title: 'Over the pedal', text: 'D, C, G, D, each over the open D string.', aim: 'F♯ on D, E on C, D on G (the pedal itself).', scale: 'D Mixolydian (D E F♯ G A B C).' },
      { bars: [5, 8], key: 'D', title: 'And up to A7', text: 'The same, with A7 at the end: its C♯ leads back to D.', aim: 'C♯ on A7 rising to D.', scale: 'D Mixolydian, with C♯ over A7.' }
    ]
  },

  getzminor: {
    intro: 'A minor bossa in D: two bars of Dm7, the minor ii–V (Em7♭5 A7) back home, a bar of Gm7 (iv), and the ii–V again to Dm7. Eight bars, made for chord melody or long legato lines.',
    rn: ['i7', 'i7', 'iiø7', 'V7', 'i7', 'iv7', 'iiø7 V7', 'i7'],
    sections: [
      { bars: [1, 4], key: 'Dm', title: 'Minor ii–V', text: 'Dm7 for two bars, then Em7♭5 and A7.', aim: 'F on Dm7, G on Em7♭5, C♯ on A7.', scale: 'D Dorian over Dm7; D harmonic minor over the ii–V.' },
      { bars: [5, 8], key: 'Dm', title: 'iv and home', text: 'Dm7, Gm7, then the ii–V in one bar and Dm7.', aim: 'B♭ on Gm7, then G, C♯ and F.', scale: 'D Dorian; D harmonic minor over A7.' }
    ]
  },

  kulthumnahawand: {
    intro: 'Maqam Nahawand on C (C D E♭ F G A♭ B C, often B♭ on the way down) over maqsum: four bars of lazima on C minor, F minor and G7, then a line through A♭ back home. Nahawand is the maqam closest to the Western minor scale; the chords mark its resting notes, and the music is in the line.',
    rn: ['i', 'i', 'iv', 'V7', 'i', 'bVI', 'V7', 'i'],
    sections: [
      { bars: [1, 4], key: 'Cm', title: 'The lazima', text: 'C minor, F minor, G7: the line rises to G and falls back.', aim: 'E♭ and G on Cm; B (the leading note) on G7.', scale: 'Maqam Nahawand on C: C D E♭ F G A♭ B C.' },
      { bars: [5, 8], key: 'Cm', title: 'The line', text: 'C minor, A♭ (♭VI), G7, C minor: a sung line that leans on A♭ and resolves.', aim: 'A♭ falling to G; B rising to C.', scale: 'Nahawand on C, with B♭ when the line falls.' }
    ]
  },

  /* ---------- Blues, rock and roots; world grooves ---------- */
  minorswing: {
    intro: 'A gypsy jazz tune in A minor with three chords: Am6 (i), Dm6 (iv) and E7 (V). Each lasts two bars, so there is time to outline every chord.',
    rn: ['i6', 'i6', 'iv6', 'iv6', 'i6', 'i6', 'V7', 'V7', 'iv6', 'iv6', 'i6', 'i6', 'V7', 'V7', 'i6', 'i6'],
    sections: [
      { bars: [1, 8], key: 'Am', title: 'i, iv, i, V', text: 'Am6 for two bars, Dm6 for two, Am6 for two, E7 for two.', aim: 'G♯ (the 3rd of E7) rising to A at the top of the next section.' },
      { bars: [9, 16], key: 'Am', title: 'iv, i, V, i', text: 'Dm6, Am6, E7, then home on Am6.', aim: 'F (the 3rd of Dm6) falls to E on Am6; G♯ on E7 rises to A.' }
    ]
  },

  andalusian: {
    intro: 'The flamenco cadence: Am, G, F, E, each chord a step lower. Flamenco hears E as home (E Phrygian, the mode with F a half step above E), so the line falls home to E rather than away from A.',
    rn: ['iv', 'bIII', 'bII', 'I', 'iv', 'bIII', 'bII', 'I'],
    sections: [
      { bars: [1, 4], key: 'E', name: 'E Phrygian', title: 'Falling to E', text: 'Am (iv), G (♭III), F (♭II), E (I). The F–E half step at the end is the cadence.', aim: 'The 3rds fall with the bass: C (Am), B (G), A (F), G♯ (E).' },
      { bars: [5, 8], key: 'E', name: 'E Phrygian', title: 'Again', text: 'The same four chords.' }
    ]
  },

  sonmontuno: {
    intro: 'C major, two chords a bar: I–IV, then V–IV. Nothing leaves C, so the interest is in the rhythm: every part has to sit with the clave.',
    rn: ['I IV', 'V IV', 'I IV', 'V IV'],
    sections: [
      { bars: [1, 4], key: 'C', title: 'I–IV–V–IV', text: 'C and F, then G and F, twice. The chords change on 1 and 3; the bass and the piano play each new chord early, on the & of 2 and the & of 4.', aim: 'E on C, A on F, B on G: the 3rds.' }
    ]
  },

  bossavamp: {
    intro: 'D minor with a minor ii–V–i (Em7♭5–A7–Dm7) every four bars. Bossa nova is quiet and even: few notes, long lines, straight eighths.',
    rn: ['i7', 'i7', 'iiø7', 'V7', 'i7', 'i7', 'iiø7', 'V7'],
    sections: [
      { bars: [1, 4], key: 'Dm', title: 'i, then a minor ii–V', text: 'Two bars of Dm7, then Em7♭5 (E G B♭ D) and A7 lead back to Dm7.', aim: 'C♯ (the 3rd of A7) rises to D; G (the 7th of A7) falls to F (the 3rd of Dm7).' },
      { bars: [5, 8], key: 'Dm', title: 'Again', text: 'The same four bars.' }
    ]
  },

  highlife: {
    intro: 'G major with I, IV and V, one chord a bar. The harmony stays simple so that the interlocking guitar lines can dance over it.',
    rn: ['I', 'IV', 'I', 'V', 'I', 'IV', 'V', 'I'],
    sections: [
      { bars: [1, 8], key: 'G', title: 'I–IV–I–V, I–IV–V–I', text: 'G, C, G, D, then G, C, D and home to G.', aim: 'B on G, E on C, F♯ on D: the 3rds.' }
    ]
  },

  soukous: {
    intro: 'E major, two chords a bar: I–IV, V–IV, looping. In the sebene (the fast dance section) the guitars repeat short bright cells high on the neck.',
    rn: ['I IV', 'V IV', 'I IV', 'V IV'],
    sections: [
      { bars: [1, 4], key: 'E', title: 'I–IV–V–IV', text: 'E and A, then B and A, round and round.', aim: 'G♯ on E, C♯ on A, D♯ on B: the 3rds.' }
    ]
  },

  reggae: {
    intro: 'Two chords, Am and D. D major has F♯, so the key is A Dorian: A minor with a raised 6th.',
    rn: ['i', 'IV', 'i', 'IV'],
    sections: [
      { bars: [1, 4], key: 'Am', name: 'A Dorian', title: 'i–IV', text: 'Am for a bar, D for a bar. The F♯ in D is what makes the mode Dorian.', aim: 'C on Am, F♯ on D: the 3rds, a tritone apart.' }
    ]
  },

  tango: {
    intro: 'A minor with E7, the V7 from A harmonic minor, and Dm (iv). The bass plays the habanera rhythm; the melody leans on the G♯ that E7 brings.',
    rn: ['i', 'V7', 'V7', 'i', 'iv', 'i', 'V7', 'i'],
    sections: [
      { bars: [1, 4], key: 'Am', title: 'i–V7–i', text: 'Am, two bars of E7, back to Am.', aim: 'G♯ (the 3rd of E7) rising to A; D (the 7th of E7) falling to C.' },
      { bars: [5, 8], key: 'Am', title: 'iv, i, V7, i', text: 'Dm, Am, E7 and home.', aim: 'F (the 3rd of Dm) falls to E on Am.' }
    ]
  },

  hijazvamp: {
    intro: 'D Hijaz, also called Phrygian dominant or freygish: D E♭ F♯ G A B♭ C. The D chord is home; E♭ (♭II), a half step above, pulls back down to it, and Cm comes from the upper notes of the scale.',
    rn: ['I', 'I', 'bII', 'I', 'I', 'bvii', 'bII', 'I'],
    sections: [
      { bars: [1, 8], key: 'D', name: 'D Hijaz', title: 'Home, ♭II and back', text: 'D for two bars, E♭ for one, back to D, then Cm and E♭ leading home to D.', aim: 'E♭ falls a half step to D at the end of each phrase; F♯ (the 3rd of D) is the note that makes the chord major.' }
    ]
  },

  blues12: {
    intro: 'The 12-bar blues in A: A7 (I7), D7 (IV7) and E7 (V7). All three are dominant 7ths, so the key is neither plain major nor plain minor: that mix is the blues sound.',
    rn: ['I7', 'I7', 'I7', 'I7', 'IV7', 'IV7', 'I7', 'I7', 'V7', 'IV7', 'I7', 'V7'],
    sections: [
      { bars: [1, 4], key: 'A', title: 'Four bars of I7', text: 'A7 for four bars: the singer’s first line.', aim: 'C♯, the 3rd of A7.' },
      { bars: [5, 8], key: 'A', title: 'IV7 and back', text: 'D7 for two bars, then A7 for two: the line again over a new chord.', aim: 'C♯ (A7) falls to C (the 7th of D7); F♯ is the 3rd of D7.' },
      { bars: [9, 12], key: 'A', title: 'V7, IV7, I7, turnaround', text: 'E7, D7, A7, and E7 to send it round again.', aim: 'G♯ on E7 rising to A.' }
    ]
  },

  rockvamp: {
    intro: 'D, C and G: I–♭VII–IV. The C chord comes from D Mixolydian (D major with C instead of C♯), the classic rock sound.',
    rn: ['I', 'bVII', 'IV', 'I', 'I', 'bVII', 'IV', 'I'],
    sections: [
      { bars: [1, 8], key: 'D', name: 'D Mixolydian', title: 'I–♭VII–IV–I', text: 'D, C, G, D, twice. Each chord is a major triad; the C natural is the borrowed note.', aim: 'A falling line through the chords: F♯ (D), E (C), D (G).' }
    ]
  },

  funkvamp: {
    intro: 'One chord, E9, for as long as the groove lasts. The interest is all in the rhythm and in how much tension you choose.',
    rn: ['I9', 'I9', 'I9', 'I9'],
    sections: [
      { bars: [1, 4], key: 'E', name: 'E, one chord', title: 'E9', text: 'E9 is E G♯ B D F♯: a dominant 7th with a 9th on top.', aim: 'G♯ and D, the 3rd and 7th.' }
    ]
  },

  country145: {
    intro: 'G major with I, IV and V7, two bars each: the backbone of country, bluegrass and folk songs.',
    rn: ['I', 'I', 'IV', 'IV', 'I', 'I', 'V7', 'V7', 'I', 'I', 'IV', 'IV', 'I', 'V7', 'I', 'I'],
    sections: [
      { bars: [1, 8], key: 'G', title: 'I, IV, I, V7', text: 'G, C, G, D7, two bars each.', aim: 'B (G), E (C), F♯ (D7): the 3rds. C, the 7th of D7, falls to B on G.' },
      { bars: [9, 16], key: 'G', title: 'I, IV, then faster to V7 and home', text: 'G and C two bars each, then G, D7, G, G one bar each.' }
    ]
  },

  fadominor: {
    intro: 'A minor with E7 (V7) and a turn to Dm (iv) through A7, the V7 of D minor. The guitar answers the singer between lines.',
    rn: ['i', 'i', 'V7', 'V7', 'V7', 'V7', 'i', 'i', 'i', 'V7/iv', 'iv', 'iv', 'i', 'V7', 'i', 'i'],
    sections: [
      { bars: [1, 8], key: 'Am', title: 'i and V7', text: 'Two bars of Am, four of E7, two of Am.', aim: 'G♯ (the 3rd of E7) rising to A.' },
      { bars: [9, 16], key: 'Am', title: 'A turn to iv, then home', text: 'Am becomes A7 for a bar, leading to Dm; then Am, E7 and Am.', aim: 'C♯ (the 3rd of A7) rises to D; G (the 7th of A7) falls to F (the 3rd of Dm).' }
    ]
  },

  slackkey: {
    intro: 'G major with I, IV and V7, played in Taro Patch tuning (D G D G B D), where the open strings make a G chord.',
    rn: ['I', 'I', 'IV', 'I', 'I', 'V7', 'I', 'I'],
    sections: [
      { bars: [1, 8], key: 'G', title: 'I, IV, I, V7, I', text: 'G for two bars, C, G for two, D7, then G.', aim: 'B on G, E on C, F♯ on D7.' }
    ]
  },

  mbaqangajive: {
    intro: 'G major, two chords a bar: I–IV, then I–V, the marabi cycle that runs through South African township music. It never lands: the D leads straight back into G as the next round begins.',
    rn: ['I IV', 'I V', 'I IV', 'I V'],
    sections: [
      { bars: [1, 4], key: 'G', title: 'The cycle', text: 'G and C, then G and D, twice. The chords change on 1 and 3; the bass bounces between roots, fifths and thirds under them.', aim: 'B on G, E on C, F♯ on D: the 3rds, high on the neck.' }
    ]
  },

  ranchera: {
    intro: 'G major in a ranchera waltz. The first half sits on a long D7 so a singer can hold a note over it; the second half visits C through G7, the I7 that points to IV, and comes home through D7.',
    rn: ['I', 'I', 'V7', 'V7', 'V7', 'V7', 'I', 'I', 'I', 'V7/IV', 'IV', 'IV', 'I', 'V7', 'I', 'I'],
    sections: [
      { bars: [1, 8], key: 'G', title: 'I, a long V7, I', text: 'Two bars of G, four of D7, two of G. The long dominant is typical of rancheras: it builds the tension a singer releases on the return to G.', aim: 'C, the 7th of D7, falling to B on G.' },
      { bars: [9, 16], key: 'G', title: 'I7 to IV and home', text: 'G turns into G7 (F natural added), which pulls to C. Then G, D7 and G close the verse.', aim: 'F on G7 falling to E on C; F♯ on D7 rising to G.' }
    ]
  },

  cumbiaam: {
    intro: 'A minor with i, iv and V7, the harmonic minor’s dominant: Am, Dm, E7, Am. Cumbia keeps the harmony simple; the sway comes from the offbeats.',
    rn: ['i', 'iv', 'V7', 'i', 'i', 'iv', 'V7', 'i'],
    sections: [
      { bars: [1, 4], key: 'Am', title: 'i–iv–V7–i', text: 'One chord per bar. E7 has G♯, the raised 7th of A minor, which pulls up to A.', aim: 'C on Am, F on Dm, G♯ on E7 rising to A.' },
      { bars: [5, 8], key: 'Am', title: 'Again', text: 'The same four bars.' }
    ]
  },

  morlamvamp: {
    intro: 'One chord, A minor, as a drone. Mor lam is modal: the melody moves in A thang san, the khaen’s “short” mode, here A C D E G, over a fixed root.',
    rn: ['i', 'i', 'i', 'i'],
    sections: [
      { bars: [1, 4], key: 'Am', title: 'The drone', text: 'Am all the way. The interest is in the repeating phin-style figures and the singer’s ornaments, not in chord changes.', aim: 'A and E, the root and fifth that the drone strings give.' }
    ]
  }
};

/* How to solo over each tune: the notes to aim for and how to move between chords (harmony), then the
   scales, modes and colour notes and why they fit (theory). Shown under "How to solo over it". */
export const SOLO = {
  autumn: {
    harmony: ['Start with one guide tone per bar: E♭ (Cm7), E♭ (F7), D (B♭maj7), D (E♭maj7), C (Am7♭5), C (D7), B♭ (Gm6). The line falls a step every two bars.', 'Then arpeggiate each chord up from that note (3, 5, 7, 9) and land on the next guide tone on beat 1.', 'On D7, aim for F♯ and resolve it up to G: the strongest pull in the tune.'],
    theory: ['G natural minor (the same notes as B♭ major) fits every bar except D7. Over D7 use G harmonic minor: its F♯ is the 3rd of D7.', 'For tension on D7, add E♭ (the ♭9) and B♭ (the ♭13), both from G harmonic minor; E♭ falls to D, the 5th of Gm.', 'Approach a chord tone from a half step below on the & before the beat, such as C♯ into D on B♭maj7.']
  },
  bluebossa: {
    harmony: ['Land on the 3rd of each new chord on beat 1: E♭ (Cm7), A♭ (Fm7), F (Dm7♭5), B (G7), G♭ (E♭m7), C (A♭7), F (D♭maj7).', 'On G7, B rising to C on Cm7 tells the listener you are home.', 'Keep the bossa feel: long notes, straight eighths, space between phrases.'],
    theory: ['C natural minor (C D E♭ F G A♭ B♭) over bars 1–8; on G7 switch to C harmonic minor (B instead of B♭).', 'D♭ major in bars 9–12. Only two notes change from C minor: D becomes D♭ and G becomes G♭.', 'Over G7, A♭ (the ♭9) and E♭ (the ♭13) add tension; A♭ falls to G and E♭ becomes the 3rd of Cm7.']
  },
  summertime: {
    harmony: ['Target C (the 3rd of Am) and G♯ (the 3rd of E7): the half step G♯–A is the sound of the tune.', 'On Dm7 land on F; over Bm7♭5–E7 hold D, then let it fall to C.', 'Keep phrases short and vocal, like the melody: play for two bars, leave two.'],
    theory: ['A minor pentatonic (A C D E G) works over almost every bar and gives the blues colour; do not linger on G over E7.', 'A Dorian (with F♯) over Am6, A harmonic minor (with G♯ and F) over E7.', 'The blue note: slide from E♭ up to E for a bluesy cry.']
  },
  flyme: {
    harmony: ['Play the falling guide-tone line, one note every bar: G (Am7), F (Dm7), F (G7), E (Cmaj7), E (Fmaj7), D (Bm7♭5), D (E7), C (Am7).', 'Then arpeggiate each chord from that note, so the next guide tone is always the nearest note.', 'On E7 aim for G♯ and on A7 for C♯: the borrowed notes carry the colour.'],
    theory: ['C major covers bars 1–5 and 9–14: one scale for many chords (a key-centre approach).', 'A harmonic minor (C major with G♯) over Bm7♭5–E7.', 'Approach notes: play the note a half step below a chord tone on the & of 4 and land on the chord tone on 1.']
  },
  fblues: {
    harmony: ['Aim for the 3rds: A on F7, D on B♭7, F♯ on D7, B♭ on Gm7, E on C7. The 3rd makes each change audible.', 'The A–A♭ move from F7 to B♭7 (bars 1–2 and 4–5) is the heart of the blues: play it.', 'In bars 11–12, outline D7 and Gm7–C7 to lead back to F7 at the top.'],
    theory: ['The F blues scale (F A♭ B♭ B C E♭) over the whole form for bluesy phrases: its A♭ against the A of F7 is the blue note.', 'F Mixolydian (F G A B♭ C D E♭) over F7, B♭ Mixolydian over B♭7: mix them with the blues scale.', 'Bebop: add E as a passing note to F Mixolydian, so the chord tones fall on the beats in eighth-note lines.']
  },
  satin: {
    harmony: ['Treat each ii–V as one idea: the 3rd of the ii on beat 1, the 3rd of the V on beat 3: F then B, G then C♯, C then F♯, C♭ (B) then F.', 'Play a short motif on Dm7–G7, then move the same shape up a step for Em7–A7, as the melody does.', 'Land on E or B on Cmaj7 and let it ring.'],
    theory: ['One major scale per ii–V: C over Dm7–G7, D over Em7–A7, G over Am7–D7, G♭ over A♭m7–D♭7.', 'Because the ii–Vs never land, the tension keeps building until Cmaj7: save your strongest resolution for bar 7.', 'Satin Doll swings lazily: fewer notes, repeated rhythms.']
  },
  atrain: {
    harmony: ['Aim for E (the 3rd) and B (the 7th) on Cmaj7, then F♯ (the 3rd) on D7: the step from E to F♯ is the colour of the tune.', 'On D7♯11, the melody’s G♯ is the ♯11: hold it against the chord.', 'In bars 5–8 follow the guide tones F (Dm7), F (G7), E (Cmaj7).'],
    theory: ['C major over Cmaj7.', 'D Lydian dominant (D E F♯ G♯ A B C) over D7♯11: it is the scale that contains the ♯11.', 'C major over the ii–V–I; on G7 add A♭ (the ♭9) and resolve it to G.']
  },
  sowhat: {
    harmony: ['With no changes to follow, make your own: outline Dm7 (D F A C), then for tension play Em7 or Fmaj7 shapes inside the same scale, and come back.', 'Lean on B, the 6th, to sound Dorian; end phrases on D, F or A.', 'Try stacked fourths, like the So What chord (E A D G and B over D): they sound open and modal.'],
    theory: ['D Dorian (D E F G A B C) for 16 bars, E♭ Dorian (E♭ F G♭ A♭ B♭ C D♭) for 8, D Dorian again.', 'D minor pentatonic (D F G A C) is a safe start; add E and B for the full Dorian sound.', 'Side-slipping: inside the D bars, play one phrase a half step up (in E♭ Dorian) and come back: the same move the tune makes.']
  },
  rhythm: {
    harmony: ['At this tempo, think two bars at a time: D (B♭maj7) and B (G7) in bar 1, E♭ (Cm7) and A (F7) in bar 2.', 'Outline Fm7–B♭7 and land on G, the 3rd of E♭maj7, in bar 6.', 'Practise plain chord tones (1, 3, 5, 7) in eighths for a few choruses before you make lines.'],
    theory: ['B♭ major pentatonic or the B♭ blues scale over the whole A section: the classic swing approach.', 'B♭ major with B over G7 and E over E°7 for the moving chords.', 'The bebop dominant scale (Mixolydian plus the major 7th as a passing note) on G7 and F7.']
  },
  atttya: {
    harmony: ['Learn the line of 3rds and 7ths for each section before soloing: it moves by half and whole steps through every key change.', 'At each new key, land on the 3rd of its I chord: C (A♭), E (C), G (E♭), B (G), G♯ (E).', 'Use the shared notes: G♯ on Emaj7 is the A♭ of Fm7, and F links D♭maj7 to G7.'],
    theory: ['One major scale per key centre: A♭, C, E♭, G, E, then A♭.', 'Over the ii–V into each key, already play the new key’s scale.', 'Over B°7 in bar 32, use the chord’s own four notes (B D F A♭).']
  },
  solar: {
    harmony: ['Learn the 3rds of the chords each ii–V lands on: A (Fmaj7), G (E♭maj7), F (D♭maj7), then E♭ (Cm6).', 'When a maj7 chord turns minor, lower its 3rd by a half step: A to A♭ (Fmaj7 to Fm7), G to G♭ (E♭maj7 to E♭m7). Play that move.', 'Twelve bars go by quickly: make phrases that cross the key changes, not ones that stop at them.'],
    theory: ['C melodic minor (C D E♭ F G A B) or C Dorian over Cm6.', 'F major, E♭ major and D♭ major for the three ii–V–Is.', 'C harmonic minor over Dm7♭5–G7.']
  },
  giant: {
    harmony: ['Learn the three major triads first (B D♯ F♯, G B D, E♭ G B♭) and arpeggiate each in its bar.', 'Then the V7s: D7 (D F♯ A C), B♭7 (B♭ D F A♭), F♯7 (F♯ A♯ C♯ E). Each 7th falls a half step to the next 3rd.', 'Play 1-2-3-5 shapes on every chord, as Coltrane did: they keep you in the key at speed.'],
    theory: ['Three major scales (B, G, E♭), switching every bar or two.', 'On each V7 or ii–V, the scale of the key it leads to.', 'Start at 60–80 bpm and loop bars 1–4 until the changes feel automatic.']
  },
  monkblues: {
    harmony: ['Aim for the 3rd of each chord as it arrives: D on B♭7, G on E♭7, A on F7.', 'Over E°7 in bar 6, play its own four notes (E G B♭ D♭), then land on D in bar 7.', 'Play one short idea and repeat it, shifted across the beat, for a whole chorus (see the drill “One idea, moved across the beat”).'],
    theory: ['The B♭ blues scale (B♭ D♭ E♭ E F A♭) fits the whole form.', 'Whole-tone runs over the dominants: on F7, F G A B C♯ E♭ (see the drill “Whole-tone runs down a dominant”).', 'Strike a chord tone with the note a half step below it, and leave silence after it.']
  },
  monkslips: {
    harmony: ['Play the same small idea on F7 and on G♭7, moved up a fret, so the slip is in your line too.', 'In bars 5–8, move one chord shape up a fret per chord and let the 3rds climb F, F♯, G, G♯, A.', 'Land on A (the 3rd of F7) on beat 1 of bar 8.'],
    theory: ['F Mixolydian over F7, G♭ Mixolydian over G♭7: one shape, a fret apart.', 'The whole-tone scale on F (F G A B C♯ E♭) covers F7 and its ♯11 and ♯5.', 'Over the climbing dominants, the chord’s own notes are enough: speed comes from moving the shape, not from scales.']
  },
  sunravamp: {
    harmony: ['On Em7, rest on G and D; end phrases on E or B.', 'On F7♯11, hold B (the ♯11, also the 5th of Em7) across the change, or play A and E♭ and let them fall to G and D.', 'Leave whole bars empty: the vamp keeps going without you.'],
    theory: ['E Dorian (with C♯) or E minor pentatonic over Em7.', 'F Lydian dominant (F G A B C D E♭) over F7♯11.', 'Chords in fourths (the four open bass strings, E A D G) slide up and down a fret for colour.']
  },
  milesmodal: {
    harmony: ['On Dm7, rest on F, A and C; touch B, the 6th, for the Dorian colour.', 'Shape each eight bars as one phrase: start low, climb, fall back.', 'At the bridge, move your idea up one fret to E♭m7, then back down for the last A.'],
    theory: ['D Dorian (D E F G A B C) for the A sections, E♭ Dorian (E♭ F G♭ A♭ B♭ C D♭) for the bridge.', 'Chords in fourths (E A D G with B on top) slide a fret for the bridge.', 'D minor pentatonic works too; add B and E to make it Dorian.']
  },
  mileselectric: {
    harmony: ['On E7♯9, riff on the low strings or stab the chord off the beat; leave bars empty.', 'In the lift, land on B on G7 and C♯ on A7.', 'Bend G toward G♯: the ♯9 and the 3rd of E7.'],
    theory: ['E minor pentatonic or the E blues scale (E G A B♭ B D) over the vamp.', 'G Mixolydian and A Mixolydian in the lift, or stay in the E blues scale.', 'Funk-guitar sixteenths with the left hand muting between chords.']
  },
  arseniomontuno: {
    harmony: ['In the son part, aim for C on Am, F on Dm and G♯ on E7.', 'In the montuno, play one cell or riff for eight bars before changing it.', 'Put your notes on the clave strokes, or right between them, on purpose.'],
    theory: ['A natural minor, with G♯ over E7 (A harmonic minor).', 'A minor pentatonic for riffs; thirds and sixths for tres-style double stops.', 'See the drills “Arsenio: a tres solo built on one cell” and “the diablo”.']
  },
  bvscson: {
    harmony: ['Strum two beats of each chord and fill the other two with a run into the next.', 'Over A7, play C♯ and let it rise to D.', 'Add a second voice a third under any line you play.'],
    theory: ['D natural minor (D E F G A B♭ C), with C♯ over A7.', 'Thirds on the top strings for fills; octaves for a tres sound.', 'See the drills “Buena Vista: the second voice” and “strum, then fill”.']
  },
  bvscbolero: {
    harmony: ['Aim for each chord’s 3rd as it arrives: E, C♯, F, B, G.', 'Over Fm6, A♭ falling to G is the bolero’s sigh.', 'Play under the voice: thumb on 1 and 3, soft chords between.'],
    theory: ['C major, with C♯ over A7 and B♭ over C7.', 'The F minor 6 arpeggio (F A♭ C D) over Fm6.', 'Thirds and sixths for fills between sung lines.']
  },
  piazzollaminor: {
    harmony: ['Play the falling line A, G, F♯, F yourself, one note per bar, in bars 1–4.', 'Over E7, lean on G♯ and resolve it to A.', 'Accent your phrases 3 + 3 + 2 with the backing.'],
    theory: ['A harmonic minor (A B C D E F G♯) over E7 and Bm7♭5.', 'A melodic minor (with F♯) over F♯m7♭5.', 'C major through the circle in bars 9–12.']
  },
  sosazamba: {
    harmony: ['Arpeggiate each chord in six, bass on 1.', 'Over E7, play G♯ and let it rise to A.', 'Leave room for a voice: thin out while it moves, fill while it holds.'],
    theory: ['A natural minor, with G♯ over E7.', 'Feel each bar in two, then in three: the sesquiáltera.', 'See the drills “Mercedes Sosa: zamba arpeggios” and “chacarera strum”.']
  },
  miltonminas: {
    harmony: ['Keep the open B and E ringing through the A section; they belong to every chord there.', 'In the B section, hear the borrowed chords as bright colours over a dark key.', 'Land on F♯ (the 3rd of D) when D major returns.'],
    theory: ['D major for the A section.', 'Each borrowed major 7th chord as Lydian: F, C and B♭ Lydian.', 'See the drill “Milton: shapes that move over ringing strings”.']
  },
  getzbossa: {
    harmony: ['Hold the guide tones: G, G♭, F as the ii–Vs slide down.', 'In the bridge, A♭ (the 3rd of Fm7) holds over B♭7 and falls to G on E♭maj7.', 'Start phrases late and let them fall, as Getz did.'],
    theory: ['C major on the C bars; D, D♭ and C major on the three ii–Vs, or just their 3rds and 7ths.', 'E♭ major in bars 11–12; A♭ Lydian over A♭maj7.', 'See the drills “Getz: long, singing lines” and “ii–Vs that slide down a fret”.']
  },
  kulthumkurd: {
    harmony: ['Play the lazima the same way each time, tight with the drum.', 'In the line, start from G or B♭ and end on D.', 'Repeat the line with one change each time: a held note, a turn, higher.'],
    theory: ['Maqam Kurd on D: D E♭ F G A B♭ C. No quarter tones, so it lies well on guitar.', 'Turns around E♭ and A, tremolo on held notes, as an oud would play them.', 'See the drills “Umm Kulthum: the lazima” and “one line, again and again”.']
  },
  sunraspace: {
    harmony: ['On Dm7, rest on F and C; on E♭m7, move the same idea up a fret.', 'Over A7♯9, play C (the ♯9) and C♯ (the 3rd) in turn, then land on D.', 'Leave space: let a chord ring alone for a bar.'],
    theory: ['D Dorian, E♭ Dorian for the slip, B♭ Lydian over B♭maj7.', 'D harmonic minor or the A altered scale over A7♯9.', 'Chords in fourths slid by half steps (see the drill “Sun Ra: chords in fourths that drift”).']
  },
  arseniodos: {
    harmony: ['Aim for E on C, B on G7 and A on F.', 'In the montuno, play a guajeo or a riff and keep it for eight bars.', 'End the montuno with a break on the clave.'],
    theory: ['C major; C major pentatonic for riffs.', 'Thirds and octaves for tres-style double stops.', 'See the drills “Arsenio: a two-bar guajeo” and “the band break on the clave”.']
  },
  piazzollamilonga: {
    harmony: ['Hold one long note a bar over the bass, as in the drill “Piazzolla: a milonga lenta”.', 'On B7, play D♯ and resolve it to E.', 'In the B section, let G major sound bright before E minor returns.'],
    theory: ['E harmonic minor in the A section.', 'E natural minor (G major’s notes) in bars 9–14.', 'Arpeggios in 3 + 3 + 2 for the accompaniment.']
  },
  sosachacarera: {
    harmony: ['Strum it: the harmony is three chords, the music is the rhythm.', 'If you solo, keep to F, A and D on Dm, and C♯ on A7.', 'Answer the bombo: leave the chasquido on 4 clear.'],
    theory: ['D harmonic minor (D E F G A B♭ C♯).', 'The bar in two and in three, the sesquiáltera.', 'See the drills “Mercedes Sosa: chacarera strum” and “the bombo on your guitar”.']
  },
  miltonpedal: {
    harmony: ['Keep the open D ringing under every chord.', 'Over C, lean on E and C, the notes that are not in D major.', 'Over A7, play C♯ and rise to D for the top.'],
    theory: ['D Mixolydian (D E F♯ G A B C).', 'Open-string shapes over the pedal (see the drill “Milton: chords over a D pedal”).', 'Leaps of an octave in the melody, sung softly at the top.']
  },
  getzminor: {
    harmony: ['Chord melody: the top note of each chord is the melody.', 'On A7, C♯ resolving to D; on Em7♭5, B♭ falling to A.', 'Long legato lines in eighths through the ii–V.'],
    theory: ['D Dorian over Dm7; D harmonic minor over Em7♭5 and A7.', 'G Dorian over Gm7, or simply D Dorian throughout.', 'See the drills “Jazz Samba: chord melody” and “Getz: cool, legato eighths”.']
  },
  kulthumnahawand: {
    harmony: ['Play the lazima the same each time; ornament the line.', 'Lean on A♭ and let it fall to G.', 'B rises to C at the end of the line; on the way down use B♭.'],
    theory: ['Maqam Nahawand on C: C D E♭ F G A♭ B C.', 'Turns and tremolo on held notes, as the oud plays them.', 'See the drill “Umm Kulthum: one line, again and again”.']
  },
  minorswing: {
    harmony: ['Arpeggiate the chords, as Django did: Am6 (A C E F♯), Dm6 (D F A B), E7 (E G♯ B D, adding F for the ♭9).', 'Land on G♯ over E7 and resolve it to A on Am6.', 'Slide into chord notes from a half step below (see the drill “Arpeggios with chromatic approach”).'],
    theory: ['A Dorian (with F♯) over Am6 and D Dorian (with B) over Dm6: the 6ths in the chords come from those modes.', 'A harmonic minor over E7, or the diminished arpeggio G♯ B D F: the E7♭9 sound gypsy jazz loves.', 'A minor pentatonic sounds bluesy but misses the 6ths: add F♯ on Am6 and B on Dm6.']
  },
  andalusian: {
    harmony: ['Let your top note fall with the bass: C (Am), B (G), A (F), G♯ (E). These are the 3rds of each chord.', 'On E, lean on G♯ and resolve phrases to E.', 'End each line with the F–E half step.'],
    theory: ['E Phrygian dominant (E F G♯ A B C D) over E; E Phrygian (with G) over the other chords.', 'The G against G♯ is part of the sound: G over Am and G, G♯ over E.', 'Finish phrases with the chord change, on the strong beat, as flamenco does.']
  },
  sonmontuno: {
    harmony: ['Target the 3rds on the changes: E on C, A on F, B on G.', 'Anticipate: play the next chord’s note on the & before the change, as the bass does.', 'Repeat a short figure, like a guajeo, and change one note to fit each chord.'],
    theory: ['C major pentatonic (C D E G A) and C major; F and B colour the IV and V.', 'Start phrases on a clave hit (the a of 1 or the & of 2) rather than on 1.', 'For the style, see the drill “Tres-style guajeo in octaves”.']
  },
  bossavamp: {
    harmony: ['Guide tones: F and C on Dm7, G and D on Em7♭5, C♯ and G on A7, then F on Dm7.', 'Hear the two resolutions: C♯ (A7) up to D, G (A7) down to F.', 'Add the 9th (E) on Dm7 for the soft bossa colour.'],
    theory: ['D Dorian (with B) over Dm7 for a bright, soft minor; D natural minor (with B♭) over Em7♭5.', 'D harmonic minor (with C♯ and B♭) over A7.', 'Play straight eighths, not swung, and quietly.']
  },
  highlife: {
    harmony: ['Short arpeggios that change with each chord: G B D, C E G, D F♯ A.', 'Keep a shared note and move the others: G is in G and C, D is in G and D.', 'Play in the gaps of the bell pattern, so your line interlocks with the band.'],
    theory: ['G major pentatonic (G A B D E) works everywhere.', 'G major for runs; C over C and F♯ over D are the chord notes to bring out.', 'Thirds and sixths are the classic highlife double stops.']
  },
  soukous: {
    harmony: ['Bright arpeggios high on the neck: E G♯ B, A C♯ E, B D♯ F♯.', 'Loop a one-bar cell and move it to fit the next chord.', 'Target the 3rds: G♯, C♯ and D♯.'],
    theory: ['E major pentatonic (E F♯ G♯ B C♯) fits every chord.', 'E major for runs. The sebene repeats, so build intensity by climbing the neck, not by changing scale.', 'Play in 3rds or 6ths for the two-guitar sound.']
  },
  reggae: {
    harmony: ['Target C and E over Am, F♯ and A over D.', 'The F♯ makes the D chord: land on it in the D bar.', 'Leave space: reggae lead answers the singer and stops.'],
    theory: ['A Dorian (A B C D E F♯ G).', 'A minor pentatonic for bluesy fills; add F♯ for the Dorian colour.', 'See the drill “Short fills between vocal lines”.']
  },
  tango: {
    harmony: ['G♯ on E7 resolving to A: the tango’s strongest pull.', 'Over Dm land on F or A; over Am on C or E.', 'Phrase with the habanera rhythm of the bass: a long note, then shorter ones.'],
    theory: ['A harmonic minor (A B C D E F G♯) over E7 and Am.', 'A natural minor over Dm.', 'Contrast a short, accented phrase (marcato) with a long, dragged one (arrastre).']
  },
  hijazvamp: {
    harmony: ['Bring out the step from E♭ to F♯: that wide gap is the sound of Hijaz.', 'Over E♭ play E♭ G B♭ and resolve E♭ down to D; over Cm play C E♭ G.', 'End phrases on D, or rest on G halfway, as the maqam does.'],
    theory: ['D Hijaz (Phrygian dominant): D E♭ F♯ G A B♭ C.', 'Stay in the lower four notes (D E♭ F♯ G) first, rest on G, then go higher (see the drill “Maqam Hijaz”).', 'Klezmer players call the same scale freygish: add a krekhts, a sobbing ornament, on long notes.']
  },
  blues12: {
    harmony: ['Aim for each chord’s 3rd: C♯ on A7, F♯ on D7, G♯ on E7.', 'Each chord’s 7th is a blue note: G on A7, C on D7, D on E7.', 'Play a phrase in bars 1–2 and answer it in bars 3–4 (call and response), then follow the change to D7 in bar 5.'],
    theory: ['A minor pentatonic (A C D E G) over everything: its C rubs against the C♯ of A7, and that rub is the blues.', 'A major pentatonic (A B C♯ E F♯) for sweeter phrases, especially over A7.', 'Mix them: slide from C to C♯, minor 3rd to major 3rd.']
  },
  rockvamp: {
    harmony: ['Target the 3rds: F♯ on D, E on C, B on G.', 'Play the C natural over the C chord and hear it fit: it is the borrowed note.', 'A falling line through the chords: F♯ (D), E (C), D (G).'],
    theory: ['D minor pentatonic (D F G A C) for a hard rock sound; its F against the F♯ of D is the bluesy clash.', 'D Mixolydian (D E F♯ G A B C) for melodic lines.', 'D major pentatonic over D; switch to C major pentatonic over C to follow the change.']
  },
  funkvamp: {
    harmony: ['E9 is E G♯ B D F♯: target G♯ and D, its 3rd and 7th.', 'Slide from G to G♯ (minor to major 3rd) for the funk-blues rub.', 'Short, percussive phrases with ghost notes, locked to the sixteenths.'],
    theory: ['E Mixolydian (E F♯ G♯ A B C♯ D) matches the chord.', 'E Dorian (with G) or E minor pentatonic for the funkier side.', 'Repeat one riff and change only its rhythm.']
  },
  country145: {
    harmony: ['Target the 3rds: B on G, E on C, F♯ on D7; C, the 7th of D7, falls to B on G.', 'Hammer from B♭ to B over G: minor to major 3rd, the country-blues move.', 'Outline each chord with its triad and connect them by step.'],
    theory: ['G major pentatonic (G A B D E) everywhere; C major pentatonic over C.', 'B♭ as a passing note into B gives the bluesy country sound.', 'Double stops in 3rds and 6ths imitate a pedal steel.']
  },
  fadominor: {
    harmony: ['On E7 aim for G♯ and resolve it to A; B (the 5th of E7) can rise to C, the 3rd of Am.', 'On A7, C♯ rises to D, the root of Dm.', 'Answer the singer: fill only the gaps and end on A or E.'],
    theory: ['A harmonic minor (A B C D E F G♯) over E7.', 'A natural minor over Am and Dm; add C♯ over A7.', 'See the drill “Guitarra-style fills in A harmonic minor”.']
  },
  slackkey: {
    harmony: ['Play melody notes on the top strings over the alternating thumb: G B D on G, C E G on C, D F♯ A C on D7.', 'In Taro Patch (D G D G B D) the open strings are all notes of G: use them as drones.', 'Hammer-ons from open strings into chord tones.'],
    theory: ['G major pentatonic (G A B D E) and G major.', 'Add C and E over the C chord, C and F♯ over D7.', 'Slack key melodies are simple and singable: play the song first, then decorate it.']
  },
  mbaqangajive: {
    harmony: ['Aim for the 3rds on each change: B on G, E on C, F♯ on D.', 'Repeat one short figure through the cycle and change one note to fit each chord.', 'Place your notes on the & between the bass notes.'],
    theory: ['G major pentatonic (G A B D E) over the whole cycle.', 'Add C over C and F♯ over D for the chord tones.', 'Thirds on strings 3 and 2, slid from a fret below, are the classic mbaqanga double stops.']
  },
  ranchera: {
    harmony: ['On the long D7, lean on C and resolve it to B when G comes.', 'On G7, the F falls to E on C.', 'Play in thirds and sixths, as mariachi violins and trumpets do.'],
    theory: ['G major throughout; add F natural over G7.', 'G major pentatonic for simple fills between the singer’s lines.', 'End phrases on held notes: B or D over G.']
  },
  cumbiaam: {
    harmony: ['Aim for C on Am, F on Dm and G♯ on E7.', 'Resolve G♯ up to A and D down to C when E7 goes to Am.', 'Short phrases, repeated, as gaitas and accordions play.'],
    theory: ['A harmonic minor (A B C D E F G♯) over E7.', 'A natural minor or A minor pentatonic over Am and Dm.', 'Chicha guitarists play the melody in fast picked eighths or tremolo.']
  },
  morlamvamp: {
    harmony: ['Use an open string as a drone (open A or E) and play the melody against it.', 'Repeat a two-bar pattern many times, then change one note.', 'End phrases on A or E.'],
    theory: ['A thang san: A C D E G, the same notes as A minor pentatonic.', 'For thang yao, the “long” mode, move home to C: C D E G A.', 'Slides and quick hammer-ons copy the singer’s ornaments.']
  }
};
