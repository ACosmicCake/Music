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
  }
};
