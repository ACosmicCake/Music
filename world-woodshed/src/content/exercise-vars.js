/* World Woodshed — technique exercise variations
   One entry per EXERCISES id (src/data.js). Each has 5–8 variations, ordered from basic to hard;
   the technique tool rotates them so practice stays variable (Schmidt’s schema theory; Shea & Kohl 1990)
   and mixed (contextual interference; Shea & Morgan 1979). `burst` is a short run at speed between
   slow, controlled runs; `cue` keeps attention on the sound, not the hand (Wulf).
   positions: [string 1–6 (1 = high e), fret 0–12]. */
export default {
  altpick: {
    variations: [
      { name: 'One string, steady 16ths', how: 'On the B string, play fret 5 four times, fret 7 four times, fret 8 four times and fret 7 four times, strict down-up throughout. Downstrokes fall on the beat.', focus: 'Every note the same volume and the same click at the front, ups as strong as downs.', positions: [[2, 5], [2, 7], [2, 8]] },
      { name: 'Accent the upstrokes', how: 'Same one-string pattern, but accent the ‘e’ and the ‘a’ of each beat (the upstrokes) and keep the downstrokes soft. Then swap and accent only the beat.', focus: 'Two clear volume levels, with the accents landing exactly in time.', positions: [[2, 5], [2, 7], [2, 8]] },
      { name: 'Outside string changes', how: 'Alternate one note per string between the G string fret 7 and the B string fret 8, starting with a downstroke on the G. The pick always travels around the outside of the pair.', focus: 'The two notes ringing equally, with no ghost note from the string the pick passes.', positions: [[3, 7], [2, 8]] },
      { name: 'Inside string changes', how: 'Same two notes, but start with a downstroke on the B string fret 8 and an upstroke on the G string fret 7, so the pick works between the strings.', focus: 'No snag or missed note when the pick turns around between the strings.', positions: [[2, 8], [3, 7]] },
      { name: 'Groups of three', how: 'On the B string, cycle frets 5-7-8 in steady 16ths and accent the first note of each group. The accent moves from downstroke to upstroke and back, returning to beat 1 every three beats.', focus: 'The accented pattern of three floating over the click without pulling the time.', positions: [[2, 5], [2, 7], [2, 8]] },
      { name: 'Three notes per string, A minor', how: 'A natural minor three notes per string from the 5th fret: low E 5-7-8, A 5-7-8, D 5-7-9, G 5-7-9, B 6-8-10, high e 7-8-10, up and back, strict alternate.', focus: 'An even stream across every string change, with no bump where the pick crosses.', positions: [[6, 5], [5, 5], [4, 5], [3, 5], [2, 6], [1, 7]] },
      { name: 'Groups of five', how: 'Ascend the same A minor shape in five-note groups (A B C D E, then B C D E F, and so on), accenting the first note of each group, strict alternate picking.', focus: 'The five-note accent pattern clearly audible, and the click still steady underneath.', positions: [[6, 5], [6, 7], [6, 8], [5, 5], [5, 7]] },
    ],
    burst: 'Play four notes on one string at about 20% above your clean tempo, stop dead for a beat with the hand loose, and repeat four or five times before going back to the slow run.',
    cue: 'Listen for the pick’s attack: every note should start with the same small, crisp click.',
  },

  spider: {
    variations: [
      { name: '1-2-3-4 across the strings', how: 'One finger per fret at frets 5–8: play 5-6-7-8 on each string from the low E to the high e, then 8-7-6-5 back down. Alternate picking.', focus: 'Each note sustaining fully into the next, with no gap or buzz.', positions: [[6, 5], [6, 6], [6, 7], [6, 8]] },
      { name: 'Permutation 1-3-2-4', how: 'Same frets, but play fingers 1-3-2-4 (frets 5-7-6-8) on each string, up and back.', focus: 'An even, singing line even though the fingers jump around.', positions: [[6, 5], [6, 7], [6, 6], [6, 8]] },
      { name: 'Permutation 4-2-3-1', how: 'Fingers 4-2-3-1 (frets 8-6-7-5) on each string, low E to high e and back.', focus: 'No note louder or shorter than its neighbours.', positions: [[6, 8], [6, 6], [6, 7], [6, 5]] },
      { name: 'Groups of three', how: 'Use only fingers 1-2-3 (frets 5-6-7) on each string, played in 16ths, so each string change falls on a different part of the beat.', focus: 'String changes that are impossible to hear: the line should sound like one long scale.', positions: [[6, 5], [6, 6], [6, 7]] },
      { name: 'Diagonal climb', how: 'Play 1-2-3-4 on each string, moving up one fret per string: low E frets 1–4, A 2–5, D 3–6, G 4–7, B 5–8, high e 6–9, then come back the same way.', focus: 'Shifts that do not interrupt the flow of notes.', positions: [[6, 1], [5, 2], [4, 3], [3, 4], [2, 5], [1, 6]] },
      { name: 'Two-string spider walk', how: 'Crawl across two strings: finger 1 on low E fret 5, finger 2 on A fret 6, finger 3 on low E fret 7, finger 4 on A fret 8. Keep each finger down until it moves; then move to the A and D strings.', focus: 'Each new note clean while the held notes do not ring together.', positions: [[6, 5], [5, 6], [6, 7], [5, 8]] },
      { name: 'First position stretch', how: 'The plain 1-2-3-4 pattern at frets 1–4, where the frets are widest, across all six strings and back.', focus: 'The fourth-finger note as full and clear as the first-finger note.', positions: [[6, 1], [6, 2], [6, 3], [6, 4]] },
    ],
    burst: 'Play one string’s four notes at about 20% over your clean tempo, freeze on the last note for a beat, then do the next string the same way.',
    cue: 'Listen for legato: each note should sustain right up to the next one, like a sung line.',
  },

  legato: {
    variations: [
      { name: 'One string, up and down', how: 'On the B string, pick fret 5 then hammer 7 and 8; then pick fret 8 and pull off to 7 and 5. Repeat in 16th-note triplets.', focus: 'Hammered and pulled notes as loud as the picked one.', positions: [[2, 5], [2, 7], [2, 8]] },
      { name: 'A minor ascending', how: 'A minor three notes per string from the 5th fret (low E 5-7-8, A 5-7-8, D 5-7-9, G 5-7-9, B 6-8-10, high e 7-8-10). Pick only the first note on each string and hammer the rest.', focus: 'An even triplet stream with no accent on the picked notes.', positions: [[6, 5], [5, 5], [4, 5], [3, 5], [2, 6], [1, 7]] },
      { name: 'A minor descending', how: 'Same shape from the top down: pick the highest note on each string and pull off to the other two.', focus: 'Pull-offs that keep their volume to the last note on each string.', positions: [[1, 10], [2, 10], [3, 9], [4, 9], [5, 8], [6, 8]] },
      { name: 'Open-position pull-offs, E minor', how: 'E minor three notes per string with open strings: low E 0-2-3, A 0-2-3, D 0-2-4, G 0-2-4, B 1-3-5, high e 2-3-5. Descend picking the top note of each string.', focus: 'Open strings speaking as clearly as fretted ones, with no other strings ringing.', positions: [[6, 0], [5, 0], [4, 0], [3, 0], [2, 1], [1, 2]] },
      { name: 'Groups of four over triplets', how: 'On the B string, loop frets 5-7-8-7 against the triplet click (pick only the first 5 of each group). The group starts on a different triplet each time and lines up again every two beats.', focus: 'The four-note shape clear while the triplet pulse stays steady.', positions: [[2, 5], [2, 7], [2, 8]] },
      { name: 'Hammer-ons from nowhere', how: 'The ascending A minor shape with no pick at all: start each new string by hammering its first note with the fretting finger.', focus: 'First note on each string at the same volume as the rest.', positions: [[6, 5], [5, 5], [4, 5], [3, 5], [2, 6], [1, 7]] },
    ],
    burst: 'Play one string’s worth (three notes, or 5-7-8-7-5) at about 20% over your clean tempo, rest a full beat, and repeat a few times before the slow run.',
    cue: 'Listen to the volume curve: hammered and pulled notes should be level with the picked one.',
  },

  strskip: {
    variations: [
      { name: 'A minor over strings 5-3-1', how: 'A string fret 7 (E), G string fret 5 (C), high e fret 5 (A), then back down. Skip the D and B strings and mute them.', focus: 'Only one note sounding at a time, and no ring from the skipped strings.', positions: [[5, 7], [3, 5], [1, 5]] },
      { name: 'C major over strings 6-4-2', how: 'Low E fret 3 (G), D string fret 2 (E), B string fret 1 (C), up and back, skipping the A and G strings.', focus: 'The big jumps as smooth as neighbouring strings.', positions: [[6, 3], [4, 2], [2, 1]] },
      { name: 'Octaves skipping a string', how: 'Pick separately the octave pairs on the low E and D strings: A (5 and 7), C (8 and 10), D (10 and 12), then back. Keep the A string muted with the fretting hand.', focus: 'Both notes of each octave at equal volume, and silence from the A string.', positions: [[6, 5], [4, 7], [6, 8], [4, 10]] },
      { name: 'Groups of three over 8ths', how: 'Loop the A minor shape E-C-A (A string 7, G 5, high e 5) without turning around, accenting the first note of each group. The accent lands on a different 8th each time.', focus: 'A clear three-note accent pattern against the even click.', positions: [[5, 7], [3, 5], [1, 5]] },
      { name: 'G7 shell over strings 5-3-1', how: 'A string fret 10 (G), G string fret 10 (F), high e fret 7 (B), up and back.', focus: 'The tritone between F and B ringing cleanly at the top.', positions: [[5, 10], [3, 10], [1, 7]] },
      { name: 'Changes: Am – F – C – G', how: 'One bar each over strings 5-3-1: Am (7, 5, 5), F (8, 5, 5), C (10, 9, 8), G (10, 7, 7), each played up and back.', focus: 'A smooth melody in the top notes as the chords change.', positions: [[5, 7], [3, 5], [1, 5]] },
    ],
    burst: 'Play one up-and-back arpeggio at about 20% over your clean tempo, hold the last note for a beat, then play it once slowly before the next burst.',
    cue: 'Listen to the skipped strings: they should stay silent the whole time.',
  },

  sweep: {
    variations: [
      { name: 'D minor, top three strings', how: 'G string fret 7 (D), B fret 6 (F), high e fret 5 (A): one downward pick motion, then back up with one upward motion.', focus: 'Three separate notes, not a strum: each one stops as the next sounds.', positions: [[3, 7], [2, 6], [1, 5]] },
      { name: 'D major shape', how: 'G string fret 7 (D), B fret 7 (F♯), high e fret 5 (A), up and back. Roll one finger across the 7th fret and lift it as you leave each string.', focus: 'The two notes on the same fret never ringing together.', positions: [[3, 7], [2, 7], [1, 5]] },
      { name: 'Minor then major', how: 'Alternate one triplet of D minor (7-6-5) with one of D major (7-7-5). Only the B string note changes.', focus: 'The change from F to F♯ heard clearly in the middle of the shape.', positions: [[3, 7], [2, 6], [2, 7], [1, 5]] },
      { name: 'As 8th notes', how: 'Play the D minor shape up and back (G 7, B 6, high e 5, B 6) as straight 8ths instead of triplets, so each sweep now crosses the beat instead of filling it.', focus: 'Notes exactly on the grid, not rushed together into a flam.', positions: [[3, 7], [2, 6], [1, 5]] },
      { name: 'Hammer and pull at the top', how: 'G string 7, B 6, high e 5, hammer to 8, pull back to 5, then B 6 with an upstroke: six notes, two triplets. Repeat.', focus: 'The hammered note as loud as the swept ones.', positions: [[3, 7], [2, 6], [1, 5], [1, 8]] },
      { name: 'Changes: Am – F – C – G', how: 'One bar each: Am (G 9, B 10, high e 8), F (10, 10, 8), C (9, 8, 8), G (7, 8, 7), each swept up and back.', focus: 'Clean separation even when the shape changes.', positions: [[3, 9], [2, 10], [1, 8]] },
    ],
    burst: 'Sweep one shape up and back at about 20% above your clean tempo, stop with all strings muted, and check that nothing rang over.',
    cue: 'Listen for separation: each note should stop as the next begins, like a fast run, never a chord.',
  },

  chords: {
    variations: [
      { name: 'E and A minor', how: 'E (022100) and Am (x02210): the same shape moved over one string. Lift and place all three fingers together.', focus: 'Every string sounding on the first strum after the change.' },
      { name: 'A and D', how: 'A (x02220) and D (xx0232). Count a change only when the new chord rings clean on the first strum.', focus: 'No buzz or dead string on the first strum.' },
      { name: 'G and D', how: 'G (320033) and D (xx0232), with the ring finger staying on the B string, fret 3, as an anchor.', focus: 'The B-string note never stopping.' },
      { name: 'C and Fmaj7', how: 'C (x32010) and Fmaj7 (xx3210). The index stays on the B string, fret 1; the other two fingers move over one string.', focus: 'The high e string ringing open in both chords.' },
      { name: 'G and C', how: 'G (320003) and C (x32010). Strum only the strings that belong to each chord.', focus: 'Correct bass note: low E for G, A string for C.' },
      { name: 'Barre: F and C', how: 'F (133211) barred at the 1st fret and C (x32010).', focus: 'All six strings of the F ringing, with no muted B or high e.' },
      { name: 'Bm and G', how: 'Bm barred at the 2nd fret (x24432) and G (320003).', focus: 'An even strum with no gap before the new chord.' },
      { name: 'Three-chord cycle: G – C – D', how: 'Rotate G (320003), C (x32010), D (xx0232) and count every clean arrival.', focus: 'Each chord ringing on the beat without a gap in the strumming.' },
    ],
    burst: 'For ten seconds, change as fast as you can and count only perfect arrivals, then rest and do the next ten seconds slowly with your eyes closed.',
    cue: 'Listen to the first strum after each change: every string should ring, with no buzz or gap.',
  },

  travis: {
    variations: [
      { name: 'Thumb only, C: 5-4-5-4', how: 'Hold C (x32010). The thumb plays the A string (C) and D string (E) on each beat, nothing else.', focus: 'A steady, even bass line like a walking bass.', positions: [[5, 3], [4, 2], [2, 1]] },
      { name: 'Add the fingers', how: 'Thumb 5-4-5-4 on the beats; index plucks the B string on the ‘and’ of 1 and 3, middle the high e on the ‘and’ of 2 and 4.', focus: 'Bass and treble at a clear balance, the bass slightly softer.', positions: [[5, 3], [4, 2], [2, 1]] },
      { name: 'Pinch on beat 1', how: 'Same pattern, but on beat 1 the thumb and middle finger pluck together (A string and high e).', focus: 'The pinched notes sounding as one.', positions: [[5, 3], [4, 2], [2, 1]] },
      { name: 'Alternating root: 5-4-6-4', how: 'On C, the ring finger hops from the A string fret 3 to the low E string fret 3 (G) on beat 3, so the bass goes C-E-G-E.', focus: 'The moving bass sounding like a small melody, without breaking the pulse.', positions: [[5, 3], [6, 3], [4, 2], [2, 1]] },
      { name: 'G with 6-4 bass', how: 'Hold G (320003). Thumb alternates the low E (G) and the open D on the beats; fingers on the B and high e strings between.', focus: 'The bass roll keeping its weight on the low strings.', positions: [[6, 3], [5, 2], [1, 3]] },
      { name: 'Palm-muted bass', how: 'Rest the heel of the picking hand lightly on the bass strings so the thumb notes go short and thumpy while the fingers ring.', focus: 'A short, thumpy bass under ringing treble notes.', positions: [[5, 3], [4, 2], [2, 1]] },
      { name: 'Ragtime changes: C – A7 – D7 – G7', how: 'One bar each. The thumb keeps alternating the root and a string next to it; the fingers keep the same pattern on the top strings.', focus: 'No hiccup in the bass when the chord changes.' },
      { name: 'Syncopated melody', how: 'On C, add the little finger on the high e fret 3 (G) and pluck it with the middle finger on the ‘and’ of 2, letting it ring through beat 3 while the thumb keeps going.', focus: 'The held melody note ringing over the bass.', positions: [[5, 3], [4, 2], [2, 1], [1, 3]] },
    ],
    burst: 'Play one bar of the pattern at about 20% above your clean tempo, let the chord ring for a bar, then play a slow bar before the next burst.',
    cue: 'Listen for two players: a steady bass player under a separate melody player.',
  },

  bossarh: {
    variations: [
      { name: 'Thumb alone', how: 'Hold Dm7 at the 5th fret (x5756x). The thumb alternates the A string fret 5 (D) and the low E fret 5 (A) on beats 1 and 3.', focus: 'A soft, round bass like a surdo drum, all notes equal.', positions: [[5, 5], [4, 7], [3, 5], [2, 6], [6, 5]] },
      { name: 'Fingers on 1, ‘and’ of 2 and 4', how: 'Thumb as before; fingers (i-m-a on strings 3, 2, 1) pluck together on beat 1, the ‘and’ of 2 and beat 4.', focus: 'Fingers lighter than the bass, short and gentle.', positions: [[5, 5], [4, 7], [3, 5], [2, 6]] },
      { name: 'Two-bar bossa clave', how: 'Bar 1: fingers on 1, the ‘and’ of 2, and 4. Bar 2: fingers on 2 and the ‘and’ of 3. The thumb never changes.', focus: 'A loop that feels like one two-bar phrase, not two separate bars.', positions: [[5, 5], [4, 7], [3, 5], [2, 6]] },
      { name: 'Reversed clave', how: 'Swap the bars: bar 1 fingers on 2 and the ‘and’ of 3; bar 2 on 1, the ‘and’ of 2, and 4.', focus: 'The thumb still steady while the syncopation moves.', positions: [[5, 5], [4, 7], [3, 5], [2, 6]] },
      { name: 'Anticipation', how: 'Play the two-bar pattern but change chord on the ‘and’ of 4 of the bar before, between Dm7 (x5756x) and G7 (3x343x).', focus: 'The new chord arriving early, with the thumb still on the beat.', positions: [[5, 5], [6, 3]] },
      { name: 'ii–V–I: Dm7 – G7 – Cmaj7', how: 'Dm7 (x5756x), G7 (3x343x), Cmaj7 (x3545x), two bars each with the clave pattern. The thumb plays each chord’s root and fifth.', focus: 'Smooth inner voices and an even bass as the shapes change.', positions: [[5, 5], [6, 3], [5, 3]] },
    ],
    burst: 'Play one bar of the finger pattern at about 20% above your clean tempo, then let the chord ring and play two slow bars.',
    cue: 'Listen for a quiet, steady bass under light, clipped finger chords, never louder than a voice.',
  },

  rasg: {
    variations: [
      { name: 'Four-stroke roll e-a-m-i', how: 'On an E chord (022100), flick e, a, m, i down in that order as four even 16ths, with i landing on the beat.', focus: 'Four separate attacks, evenly spaced, not a blur.' },
      { name: 'Three-stroke a-m-i', how: 'Leave out the little finger: a-m-i down in 16th-note triplets, starting each triplet on the beat.', focus: 'Equal volume from all three fingers.' },
      { name: 'Continuous five-stroke', how: 'e-a-m-i down, then i up: five strokes per group, looped as 16ths so the group starts on a different 16th each time.', focus: 'A seamless roll with no gap between groups.' },
      { name: 'Accent on the index', how: 'Play the four-stroke roll in 16ths, keeping e-a-m soft and accenting i on each beat.', focus: 'One clear accent per beat, with the roll feeding into it.' },
      { name: 'Soleá accents', how: 'In E (chords E and F), count 12 beats and play a full roll on beats 3, 6, 8, 10 and 12, single index strokes on the others.', focus: 'The 12-beat cycle clearly heard through the accents.' },
      { name: 'Bulerías from 12', how: 'In A (chords A and B♭), count 12 1 2 3 … 11 and accent 12, 3, 6, 8 and 10 with rolls.', focus: 'The phrase starting on 12, not 1.' },
      { name: '4/4 compás', how: 'In a binary palo such as tangos, end a roll on beat 1 of each 4/4 bar, then single index strokes on 2, 3 and 4.', focus: 'The roll arriving exactly on beat 1.' },
    ],
    burst: 'Play one roll at about 20% above your clean tempo, let the chord ring for two beats, then play two rolls slowly.',
    cue: 'Listen for a single, even crackle, like a drum roll, rather than separate strums.',
  },

  picado: {
    variations: [
      { name: 'Open string i-m', how: 'Alternate i and m rest strokes on the open G string in 16ths, accenting the first note of each group of four.', focus: 'Both fingers the same volume and tone.', positions: [[3, 0]] },
      { name: 'One string with shifts', how: 'On the B string, play C D E F G (frets 1-3-5-6-8) up and back with strict i-m alternation.', focus: 'No gap or slur at the shifts.', positions: [[2, 1], [2, 3], [2, 5], [2, 6], [2, 8]] },
      { name: 'E Phrygian across the strings', how: 'E Phrygian in first position: low E 0-1-3, A 0-2-3, D 0-2-3, G 0-2, B 0-1-3, high e 0-1-3, up and back with i-m.', focus: 'An even line across every string change.', positions: [[6, 0], [6, 1], [6, 3], [5, 0], [5, 2], [5, 3]] },
      { name: 'Groups of three', how: 'Loop E-F-G on the high e (frets 0-1-3) in 16ths with i-m, accenting the first of each three. The accent moves between i and m.', focus: 'The accent pattern clear while the 16ths stay even.', positions: [[1, 0], [1, 1], [1, 3]] },
      { name: 'Other pairs: m-a and i-a', how: 'Repeat the open-string and one-string patterns with m-a, then i-a alternation.', focus: 'The same tone from the less familiar pair as from i-m.', positions: [[3, 0]] },
      { name: 'Groups of five, descending', how: 'Descend E Phrygian in five-note groups (G F E D C, then F E D C B, and so on), accenting the first of each group.', focus: 'The group of five clearly heard over the 4/4 click.', positions: [[1, 3], [1, 1], [1, 0], [2, 3], [2, 1]] },
    ],
    burst: 'Play one group of four notes at about 20% above your clean tempo, freeze for a beat with the fingers relaxed, and repeat four times before a slow run.',
    cue: 'Listen for a dry, punchy rest-stroke tone, every note as loud as the one before.',
  },

  reststroke: {
    variations: [
      { name: 'A minor arpeggio, one note per string', how: 'Low E 5 (A), A 7 (E), D 7 (A), G 5 (C), B 5 (E), high e 5 (A): all downstrokes, each resting on the next string.', focus: 'A full, punchy tone on every note.', positions: [[6, 5], [5, 7], [4, 7], [3, 5], [2, 5], [1, 5]] },
      { name: 'Two notes per string', how: 'A minor pentatonic: low E 5-8, A 5-7, D 5-7, G 5-7, B 5-8, high e 5-8. Down-up on each string, so each new string starts with a rest stroke.', focus: 'The upstroke as clear as the downstroke.', positions: [[6, 5], [5, 5], [4, 5], [3, 5], [2, 5], [1, 5]] },
      { name: 'Three notes per string', how: 'A minor three notes per string (low E 5-7-8, A 5-7-8, D 5-7-9, G 5-7-9, B 6-8-10, high e 7-8-10) ascending: down-up-down, then a rest-stroke down on the next string.', focus: 'Even timing where two downstrokes follow each other.', positions: [[6, 5], [5, 5], [4, 5], [3, 5], [2, 6], [1, 7]] },
      { name: 'Diminished arpeggio climb', how: 'D 6 (G♯), G 4 (B), B 3 (D), high e 1 (F), all rest-stroke downs; then up three frets (D 9, G 7, B 6, e 4) and again.', focus: 'Each four-note group ringing clearly and in time.', positions: [[4, 6], [3, 4], [2, 3], [1, 1]] },
      { name: 'Triplet groups', how: 'Play the A minor arpeggio in groups of three over the 8ths, accenting the first of each group.', focus: 'A clear 3-against-2 lilt over a steady swing.', positions: [[6, 5], [5, 7], [4, 7]] },
      { name: 'Down and up the arpeggio', how: 'Go up the A minor arpeggio with rest-stroke downs, then down it with a single upward sweep.', focus: 'Matching tone and volume both ways.', positions: [[6, 5], [5, 7], [4, 7], [3, 5], [2, 5], [1, 5]] },
    ],
    burst: 'Play the arpeggio up once at about 20% above your clean tempo, let the top note ring for a beat, then play it slowly before the next burst.',
    cue: 'Listen for a fat, horn-like attack on each note, with the pick landing on the next string.',
  },

  pompe: {
    variations: [
      { name: 'Am6, plain pompe', how: 'Hold Am6 (5x455x). Downstrokes on all four beats: 1 and 3 fuller, 2 and 4 short, choked by releasing the fretting hand.', focus: 'Long on 1 and 3, short on 2 and 4.', positions: [[6, 5], [4, 4], [3, 5], [2, 5]] },
      { name: 'Ghost upstroke before 2 and 4', how: 'Add a quick muted upstroke just before beats 2 and 4, so they become up-down.', focus: 'A crisp, snare-like snap on 2 and 4.', positions: [[6, 5], [4, 4], [3, 5], [2, 5]] },
      { name: 'Minor swing changes', how: 'Am6 (5x455x), Dm6 (x5343x), E7 (x7675x), Am6, one bar each.', focus: 'No break in the pulse when the chord changes.', positions: [[6, 5], [5, 5], [5, 7]] },
      { name: 'Changes every two beats', how: 'Alternate Am6 (5x455x) and E7 (x7675x) every two beats.', focus: 'The choke on 2 and 4 staying exactly the same through the changes.', positions: [[6, 5], [5, 7]] },
      { name: 'Major: G6 – E7 – Am6 – D7', how: 'G6 (3x243x), E7 (x7675x), Am6 (5x455x), D7 (x5453x), one bar each.', focus: 'Smooth chord changes without loss of tempo.', positions: [[6, 3], [5, 7], [6, 5], [5, 5]] },
    ],
    burst: 'Play one bar at about 20% above your clean tempo, let the chord ring, then play two slow bars.',
    cue: 'Listen for a snare-like bark on 2 and 4 and a round bass on 1 and 3.',
  },

  tremolo: {
    variations: [
      { name: 'Open high e', how: 'Tremolo-pick the open high e in steady 16ths with the pick moving from the wrist.', focus: 'An even stream with no gaps or louder notes.', positions: [[1, 0]] },
      { name: 'Accents in threes', how: 'Same note, accenting every third pick, so the accent moves across the beat and returns after three beats.', focus: 'The accent pattern clear while the stream stays even.', positions: [[1, 0]] },
      { name: 'Melody on one string', how: 'Keep the tremolo going on the B string while playing C D E F E D C (frets 1-3-5-6-5-3-1), one beat per note.', focus: 'The melody connected, with no gap between notes.', positions: [[2, 1], [2, 3], [2, 5], [2, 6]] },
      { name: 'Across the strings', how: 'One beat each on the G string fret 2 (A), B fret 1 (C), open high e (E), B fret 1, without stopping the tremolo.', focus: 'No gap where the pick changes strings.', positions: [[3, 2], [2, 1], [1, 0]] },
      { name: 'Palm-muted low E', how: 'Palm-mute the low E and tremolo-pick it in 16ths, then 16th triplets.', focus: 'A tight, chugging tone with no ringing.', positions: [[6, 0]] },
      { name: 'Dynamic swell', how: 'On the B string fret 5, crescendo for two bars and diminuendo for two, without changing the speed.', focus: 'Smooth volume change while the speed stays exact.', positions: [[2, 5]] },
    ],
    burst: 'Tremolo one beat at about 20% over your clean tempo, then rest for a beat with the arm loose, four times in a row.',
    cue: 'Listen for one continuous, shimmering note rather than separate picks.',
  },

  konnakol: {
    variations: [
      { name: 'Three speeds, ta-ka-di-mi', how: 'Say ta-ka-di-mi as quarter notes, then 8ths, then 16ths, two bars each, playing a muted string with each syllable.', focus: 'Voice and guitar exactly together at every speed.' },
      { name: 'Chatusra: accent on ta', how: 'ta-ka-di-mi in 16ths, playing every syllable but accenting ta.', focus: 'A clear accent on the beat, the other syllables even.' },
      { name: 'Tisra: ta-ki-ta in 16ths', how: 'Say ta-ki-ta in 16ths against the click; accent ta. The pattern lines up with beat 1 every three beats.', focus: 'The three-note group floating over the 4/4 pulse.' },
      { name: 'Only the accents', how: 'Keep saying ta-ki-ta in 16ths but play the guitar only on ta.', focus: 'The guitar accents falling exactly where the voice says ta.' },
      { name: 'Khanda: ta-di-ki-na-thom', how: 'Say the five syllables in 16ths and play every one, accenting ta. The pattern meets beat 1 again after five beats.', focus: 'The five-note group heard clearly over the 4/4 click.' },
      { name: 'Misra: ta-ki-ta ta-ka-di-mi', how: 'Seven syllables (3+4) in 16ths, accenting both ta’s. It lines up again after seven beats.', focus: 'The 3+4 shape clearly heard.' },
      { name: 'Tihai to beat 1', how: 'From beat 1: ta-di-ki-na-thom, a 16th rest, ta-di-ki-na-thom, a 16th rest, ta-di-ki-na-thom. The last thom lands on the next beat 1.', focus: 'The final thom landing exactly on the downbeat.' },
    ],
    burst: 'Speak and play one group at about 20% above your clean tempo, then speak it slowly once before the next burst.',
    cue: 'Listen for your voice and the guitar sounding as one: no flam between syllable and note.',
  },

  funkstrum: {
    variations: [
      { name: 'All muted 16ths', how: 'Hold E9 (x7677x) with relaxed pressure so the strings are muted, strumming down-up in 16ths.', focus: 'A crisp, even scratch with no stray pitches.', positions: [[5, 7], [4, 6], [3, 7], [2, 7]] },
      { name: 'Accents on 2 and 4', how: 'Muted 16ths, pressing E9 down only on beats 2 and 4 so the chord rings there.', focus: 'Short, punchy chords on 2 and 4 like a snare.', positions: [[5, 7], [4, 6], [3, 7], [2, 7]] },
      { name: 'Accent the ‘and’ and the ‘a’', how: 'Let the chord sound on the ‘and’ of each beat (a downstroke) for a bar, then on the ‘a’ (an upstroke) for a bar.', focus: 'Upstroke accents as clear and in time as downstroke accents.', positions: [[5, 7], [4, 6], [3, 7], [2, 7]] },
      { name: 'Small triad', how: 'Strum only the top three strings, D minor (G 7, B 6, high e 5), muting everything else.', focus: 'A bright, tight chord with no low strings ringing.', positions: [[3, 7], [2, 6], [1, 5]] },
      { name: 'Slide from D♯9 to E9', how: 'Play D♯9 (x6566x) on the ‘a’ of 4 and slide up a fret to E9 (x7677x) on beat 1.', focus: 'The slide arriving exactly on beat 1.', positions: [[5, 6], [5, 7]] },
      { name: 'Syncopated accents', how: 'Let the chord ring on 1, the ‘a’ of 1, the ‘and’ of 2 and the ‘e’ of 4; everything else muted.', focus: 'Accents sharp and exactly in their place.', positions: [[5, 7], [4, 6], [3, 7], [2, 7]] },
      { name: 'Single-note scratch', how: 'On the D string, mute all the strings and play fret 7 (A) and fret 5 (G) on chosen 16ths, with the strum never stopping.', focus: 'Short, clear notes popping out of the scratch.', positions: [[4, 7], [4, 5]] },
    ],
    burst: 'Play one bar at about 20% above your clean tempo, rest for a bar with the hand still moving in the air, then play a slow bar.',
    cue: 'Listen for the groove: accents that pop like a snare over an even scratch.',
  },

  hybrid: {
    variations: [
      { name: 'Bass and pluck', how: 'Hold G (320003). Pick the low E (G) on each beat and pluck the B and high e strings together with middle and ring on the ‘and’.', focus: 'A clear bass with a bright snap on the off-beat.', positions: [[6, 3], [5, 2], [1, 3]] },
      { name: 'Alternating bass', how: 'Same chord; the pick alternates low E and open D on the beats, and the fingers pluck the top strings on the off-beats.', focus: 'A steady bass with a crisp off-beat chord.', positions: [[6, 3], [5, 2], [1, 3]] },
      { name: 'Roll: pick-m-a', how: 'On G (320003), pick the open G string, pluck the open B with m and the high e (fret 3) with a, looped. The three-note group lands on a different 8th each time.', focus: 'All three notes even, with no gap at the loop.', positions: [[3, 0], [2, 0], [1, 3]] },
      { name: 'Sixths in C', how: 'Pick the G string and pluck the high e with m together: G 5 + e 5 (C and A), G 7 + e 7 (D and B), G 9 + e 8 (E and C), up and back.', focus: 'Both notes of each pair sounding as one.', positions: [[3, 5], [1, 5], [3, 7], [1, 7]] },
      { name: 'Chicken picking snaps', how: 'Alternate a picked note on the G string (fret 7) with a middle-finger snap on the high e (fret 5), pulling the string up so it slaps the fretboard.', focus: 'A popping, percussive snap on every plucked note.', positions: [[3, 7], [1, 5]] },
      { name: 'Skipping roll', how: 'Pick the D string, pluck the B with m and the high e with a, on a C chord (x32010).', focus: 'An even roll across the skipped string, with no ringing G string.', positions: [[4, 2], [2, 1], [1, 0]] },
    ],
    burst: 'Play one bar at about 20% above your clean tempo, let it ring, then play a slow bar.',
    cue: 'Listen for the twang: plucked notes should snap, picked notes should be round.',
  },

  pima: {
    variations: [
      { name: 'p-i-m-a on A minor', how: 'Hold Am (x02210). p on the A string, then i, m and a on the G, B and high e strings, in 16ths.', focus: 'Four notes at the same volume, ringing into each other.', positions: [[5, 0], [3, 2], [2, 1], [1, 0]] },
      { name: 'p-a-m-i', how: 'Same chord, descending: p on the A string, then a, m, i on the high e, B and G.', focus: 'Even volume coming down as going up.', positions: [[5, 0], [3, 2], [2, 1], [1, 0]] },
      { name: 'p-m-i-a', how: 'Same chord, the fingers in the order m, i, a after the thumb.', focus: 'A smooth, even ripple even with the jump between i and a.', positions: [[5, 0], [3, 2], [2, 1], [1, 0]] },
      { name: 'p-i-m-a-m-i', how: 'Six notes over the 16ths, so the thumb lands on a different 16th each time.', focus: 'A flowing wave with no bump where the pattern turns.', positions: [[5, 0], [3, 2], [2, 1], [1, 0]] },
      { name: 'Pinch: p+a, then m-i-m', how: 'Pluck the A string and high e together with p and a, then m, i, m.', focus: 'The pinched notes as one, with the bass held under the melody.', positions: [[5, 0], [3, 2], [2, 1], [1, 0]] },
      { name: 'Changes: Am – Dm – E7 – Am', how: 'Keep p-i-m-a going: Am (x02210), Dm (xx0231), E7 (020100), Am. The thumb takes each chord’s root string (A, D, low E).', focus: 'An unbroken flow through the changes.', positions: [[5, 0], [4, 0], [6, 0]] },
      { name: 'Tremolo p-a-m-i', how: 'p on the A string, then a, m, i all on the high e string at the same fret, as in Tárrega’s Recuerdos de la Alhambra.', focus: 'The three repeated notes even, sounding like one sustained note.', positions: [[5, 0], [1, 0]] },
    ],
    burst: 'Play one group at about 20% above your clean tempo, let the chord ring for a beat, then play two groups slowly.',
    cue: 'Listen for a harp-like ring: each note even, all of them sustaining together.',
  },

  bends: {
    variations: [
      { name: 'Whole step on the G string', how: 'Play the G string fret 9 (E) as the target, then bend fret 7 (D) up to match it.', focus: 'The bent note exactly matching the target pitch.', positions: [[3, 7], [3, 9]] },
      { name: 'Half step on the B string', how: 'Play the B string fret 9 (G♯), then bend fret 8 (G) up a half step to match.', focus: 'Exactly a half step: not under, not over.', positions: [[2, 8], [2, 9]] },
      { name: 'Whole step on the B string', how: 'Play the B string fret 10 (A), then bend fret 8 (G) up to match.', focus: 'Arriving in tune without overshooting and settling.', positions: [[2, 8], [2, 10]] },
      { name: 'Unison bend', how: 'Hold the B string fret 5 (E) and bend the G string fret 7 (D) up to E against it.', focus: 'No beating between the two notes when the bend is in tune.', positions: [[3, 7], [2, 5]] },
      { name: 'Pre-bend and release', how: 'Silently bend the G string fret 7 up to E, pick, and release to D in time with the click.', focus: 'The pre-bent start in tune and the release smooth.', positions: [[3, 7], [3, 9]] },
      { name: 'Minor-third bend', how: 'Play the B string fret 11 (B♭), then bend fret 8 (G) up a step and a half to match.', focus: 'Reaching the target pitch exactly without going over.', positions: [[2, 8], [2, 11]] },
      { name: 'Low on the neck', how: 'Play the B string fret 5 (E), then bend fret 3 (D) up a whole step to match it.', focus: 'The bend in tune despite the stiffer string near the nut.', positions: [[2, 3], [2, 5]] },
    ],
    burst: 'Do four quick bends in a row at about 20% above your clean tempo, each landing in tune, then rest.',
    cue: 'Listen to the pitch: the bend should arrive at the target note and stop there, in tune.',
  },
};
