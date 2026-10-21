/* World Woodshed — technique guides: the exercise ladders (one guide per EXERCISES entry, same order and ids) */
export default [
  {
    id: 'altpick',
    name: 'Alternate picking',
    family: 'Picking hand',
    summary: 'Every note gets the opposite stroke from the one before it: down, up, down, up. It ties the picking hand to the pulse, so the hand becomes a clock that keeps time even when it is not playing.',
    why: [
      'Alternate picking is the default way to play single notes with a pick, and the reason is time. If the pick moves down on every beat and up on every “and”, the hand is already in the right place for the next note before you decide to play it. Rhythm stops being something you calculate and becomes something your arm does. That is why fiddle-tune flatpickers, jazz guitarists, metal players and Irish mandolin players all land on the same basic rule, even though their tone and repertoire have nothing in common.',
      'It also gives every note the same kind of start. A picked note has a clear front edge: a small click, then the pitch. When every note in a line has that edge, fast passages sound articulate rather than smeared, and the listener can hear each pitch even at speed. Bluegrass flatpicking (Doc Watson, Tony Rice), jazz-rock (John McLaughlin, Al Di Meola), shred (Paul Gilbert, Steve Morse) and much heavy metal rhythm playing all depend on that clarity.',
      'The exercise in the app has two parts for a reason. On one string, alternate picking is easy: the pick goes back and forth like a pendulum. The hard part is crossing to another string, because the pick has to get over or around the string it just played. Most of the real technique, and most of the modern debate, is about what happens at that moment.'
    ],
    philosophy: [
      'The first idea behind alternate picking is that time lives in the body before it lives in the head. A pick hand that keeps moving in eighths or sixteenths, whether or not it touches a string, is doing the same job as a drummer’s hi-hat hand. Players who learn this way often find that their rests become steadier too, because the hand keeps counting through the silence. When you practise, notice that the downstrokes fall on the beat: the motion and the meter line up, and that alignment is the whole point.',
      'The second idea is economy, and it is easy to misunderstand. Economy does not mean the smallest possible motion at all costs; it means no motion that does not serve the sound. A tight, tense hand making tiny movements is less economical than a loose one making slightly bigger movements, because tension costs endurance and smooths out the dynamics. The best alternate pickers look calm. Their speed comes from removing effort, not adding it.',
      'There are schools of thought about where the motion should come from. Older method books usually said “from the wrist”. Later analysis, especially Troy Grady’s slow-motion studies of fast players in his Cracking the Code series, showed that great pickers use different joints: some mostly wrist, some forearm rotation, some a blend with the elbow, and many of them move the pick on a slight diagonal so that it escapes the strings on one side. His point, which matches what teachers have long seen, is that string changes are easier when the picking motion is shaped to leave the string in the direction you need to go next.',
      'That leads to the old argument between strict alternate picking and its rivals. Economy and sweep pickers let the pick continue in the same direction when it crosses to the next string, and gypsy jazz players use rest strokes and repeated downstrokes on purpose. None of these is “correct”. Strict alternation gives you an unbreakable link to the beat and an even attack; the others trade some of that for fluency across strings. Learn strict alternate picking first, so that any exception you make later is a choice and not a habit.'
    ],
    mechanics: [
      { h: 'Grip', p: [
        'Hold the pick between the pad of the thumb and the side of the first joint of the index finger, with only a few millimetres of tip showing. Too much pick means the tip drags through the string and the motion gets bigger; too little means you miss strings. The grip should be firm enough that the pick does not twist when it hits a string, but you should be able to wiggle the pick slightly with your other hand.',
        'Use a medium or heavy pick for this work. Thin picks flex and give back energy at unpredictable moments, which makes it hard to hear whether your downs and ups are even.'
      ] },
      { h: 'Motion', p: [
        'Start with the pick moving on one string at a slow tempo and watch it. The motion should be short, roughly the width of the string plus a little, and symmetrical: the downstroke and the upstroke travel the same distance at the same speed. Many players find it easiest to let the wrist move as if shaking water off the hand, or to rotate the forearm slightly as if turning a door handle. Try both and keep whichever feels lighter.',
        'Let the side of the hand or the palm lightly brush the bridge area, or let the little finger rest on the guitar top. These contact points give the hand a reference so it always knows where the strings are. They should touch, not press.'
      ] },
      { h: 'String changes', p: [
        'Play two notes on the G string and two on the B string, over and over: down-up, down-up. Now try three per string: down-up-down, up-down-up. With three per string, half the string changes happen after a downstroke and half after an upstroke, and one of them will feel worse. That is the “inside” or “outside” problem: the pick has to jump over a string, or pass between two strings, depending on direction.',
        'Slow the hard change down and watch how the pick leaves the string. If the pick is trapped between the strings, angle the stroke so it exits away from the guitar on the side you are heading to. This is the core skill; tempo comes after it.'
      ] },
      { h: 'Both hands together', p: [
        'Alternate picking only sounds clean when the fretting finger lands a hair before the pick strikes. If the pick arrives first you hear a dead click or the previous pitch. At slow tempos, exaggerate it: put the finger down, then pick. At speed the two motions merge, but the order stays the same.',
        'Mute what you are not playing. The side of the picking hand rests lightly on the low strings, and the unused fingers of the fretting hand lie across the high strings. Clean alternate picking is half picking, half muting.'
      ] }
    ],
    mistakes: [
      { problem: 'Downstrokes are louder than upstrokes, so lines sound lumpy.', fix: 'Play eighths at 60 BPM and accent the upstrokes on purpose for a minute, then try to make them equal. Record yourself; the ear in the moment is generous.' },
      { problem: 'The forearm and shoulder tighten as the tempo rises.', fix: 'Stop at the first sign of tension and drop the metronome 10 BPM. Practise short bursts at speed, four notes then a rest, so the arm learns that fast motion and relaxation can coexist.' },
      { problem: 'The pick gets stuck between strings when crossing.', fix: 'Isolate the change: two notes on one string, two on the next, at a tempo where it is easy. Watch the pick and tilt the stroke so it exits the string in the direction of travel.' },
      { problem: 'The hands drift apart at higher speed.', fix: 'Practise the passage at half tempo with both hands exaggerating the order: fret, then pick. Then use bursts of the fast tempo to let them lock together.' },
      { problem: 'The motion gets bigger and the pick digs in.', fix: 'Choke up so less pick shows, and keep the tip angled slightly so it glides across the string. Play quieter: big digging motions are usually an attempt to get volume that should come from the amp.' },
      { problem: 'Speed goes up but the time gets worse.', fix: 'Put the click on beats 2 and 4 only, or on one beat per bar. If you cannot land exactly with a sparse click, the speed is not real yet.' }
    ],
    stages: [
      { name: 'Stage 1: Pendulum on one string', goal: 'Even eighth notes on one string where you cannot hear which are downs and which are ups.', how: 'Open G string, eighth notes at 60–80 BPM, two minutes at a time. Then sixteenths at 60. Keep the arm still and the motion small.' },
      { name: 'Stage 2: Two-string changes', goal: 'Clean crossings in both directions with no extra noise.', how: 'Two notes per string, then three per string, on adjacent strings, at 70–90 BPM in sixteenths. Spend most of the time on whichever change feels worse.' },
      { name: 'Stage 3: Scales and sequences', goal: 'A full scale in sixteenths with the downstrokes on the beat and no tension.', how: 'Major scale in one position, ascending and descending, 80–110 BPM. Then sequences in groups of three and four, which put string changes in different places.' },
      { name: 'Stage 4: Bursts and endurance', goal: 'Short bursts above your comfortable tempo that sound relaxed, then a steady minute just below it.', how: 'Four or six notes at the target tempo, then a rest, repeated. Raise the target by 4–6 BPM at a time. Finish with one minute at 90 percent.' },
      { name: 'Stage 5: Music', goal: 'A real piece played cleanly at tempo: a fiddle tune, a bebop head or a metal riff.', how: 'Learn “Blackberry Blossom” or a Charlie Parker head with strict alternate picking at 120–140 BPM eighths, then 16ths at 120+ on a rock passage. Slow it down whenever one note smears.' }
    ],
    listen: [
      { artist: 'Al Di Meola', work: 'Race with Devil on Spanish Highway (Elegant Gypsy, 1977)', note: 'Very fast single-note lines with a muted, percussive pick attack. Notice how each note has its own front edge.' },
      { artist: 'Mahavishnu Orchestra', work: 'The Noonward Race (The Inner Mounting Flame, 1971)', note: 'John McLaughlin’s picking drives the band like a drum part; the lines are rhythmic before they are melodic.' },
      { artist: 'Doc Watson', work: 'Black Mountain Rag', note: 'A fiddle tune on flat-top guitar. The down-up motion carries the swing of the fiddle bow.' },
      { artist: 'Racer X', work: 'Scarified (Second Heat, 1987)', note: 'Paul Gilbert’s even, clear alternate picking across strings at high speed.' }
    ],
    styles: ['rock', 'country', 'jazz', 'celtic']
  },
  {
    id: 'spider',
    name: 'Chromatic spider (1-2-3-4)',
    family: 'Fretting hand',
    summary: 'One finger per fret, four notes per string, all the way across the neck and back. It builds finger independence, accuracy and a quiet, efficient fretting hand, and it is a test of attention as much as of fingers.',
    why: [
      'The spider exercise exists because the fretting hand does not naturally work as four equal fingers. The ring and little fingers share tendons and a nerve supply in ways that make them want to move together, and the little finger starts out weaker and shorter than the others. Playing 1-2-3-4 on every string forces each finger to arrive in turn, at a known spot, with the others staying where they are. It is the guitar’s version of a pianist’s five-finger exercise.',
      'It also teaches the one-finger-per-fret position, the basic geometry of the fretting hand in most styles: the hand covers four frets, and each finger owns one of them. Once that frame is in the hand, scales and arpeggios become a matter of choosing fingers, not reaching for notes. Rock and metal players, jazz players working with chromatic passing tones and classical guitarists all use versions of it.',
      'In the app the spider counts as a technique ladder because it is measurable: you can raise the tempo a few beats at a time and hear exactly when the hand gets sloppy. That makes it a good daily check of the state of your hands, a warm-up you can compare from day to day.'
    ],
    philosophy: [
      'There is a long-running argument about exercises like this. One side says they build independence and strength that transfer to all music. The other says that motor skills are specific, that you get good at exactly what you practise, and that playing a chromatic pattern for years mostly makes you good at chromatic patterns. Both are partly right. The spider will not make you musical, but the habits it can build, such as fingers staying close to the strings, landing just behind the fret and relaxing after each note, are general. The exercise is worth doing only if you practise those habits on purpose, not just the notes.',
      'A useful way to think about the spider is as a meditation on economy. Watch the fingers that are not playing. Do they fly up off the neck, or curl into the palm? Every millimetre a finger lifts is a millimetre it has to come back. Teachers in very different traditions, from classical method books to rock instructional videos such as John Petrucci’s Rock Discipline, describe the same goal: fingers that hover just above the strings, ready to drop.',
      'It is also a lesson about effort. Most beginners press several times harder than they need to. Try this: fret a note and slowly release pressure until it buzzes, then add just enough to make it ring. That amount of pressure is your target. A fretting hand that uses minimal force can play longer, faster and more in tune, because a heavy grip pulls strings sharp.',
      'Finally, the spider is boring on purpose, and that is useful. Repetition without attention trains nothing; repetition with attention trains a lot. If you notice your mind wandering, change something small: start on a different string, reverse the finger order, accent every third note. The variation brings attention back, and attention is what makes the practice work.'
    ],
    mechanics: [
      { h: 'Hand position', p: [
        'Put the thumb roughly behind the second finger, on the middle of the back of the neck, with the pad rather than the tip touching. The palm should not touch the neck. In this classical-style position the fingers can spread over four frets and come down on their tips, square to the fretboard.',
        'Start at the fifth fret, where the frets are close enough to reach easily. Move down toward the first fret only when the hand is comfortable; the wider spacing there is a stretch.'
      ] },
      { h: 'Finger placement', p: [
        'Place each fingertip just behind the fret wire, not in the middle of the space between frets. Close to the fret you need much less pressure and get a cleaner note. Use the very tip of the finger so it does not touch the string below, and keep the first joint bent.',
        'When you play finger 2, leave finger 1 down. When you play finger 3, leave 1 and 2 down if the pattern allows. This “building” approach keeps the hand stable going up. On the way down, place all four fingers first, then lift them one by one, which trains clean pull-offs of pressure without any sound from the lifted finger.'
      ] },
      { h: 'Picking hand', p: [
        'Use strict alternate picking, starting with a downstroke. With four notes per string, every string starts with a downstroke, which makes it a gentle first exercise for the pick hand too.',
        'Mute the strings below the one you are playing with the side of the picking hand, and the strings above with the underside of the fretting fingers. The goal is to hear four notes per string and nothing else.'
      ] },
      { h: 'Variations', p: [
        'There are 24 orders of four fingers: 1-2-3-4, 1-3-2-4, 1-2-4-3, 4-3-2-1 and so on. Each one stresses a different pair. The hardest for most people are the ones that move 3 and 4 separately, such as 1-3-4-2 or 2-4-1-3. Pick one awkward permutation a week.',
        'The true “spider” versions alternate strings: finger 1 on the low E and finger 2 on the A, then 3 on the low E and 4 on the A, so only two fingers move at a time while the others hold. This strongly trains independence and looks like a spider walking up the neck.'
      ] }
    ],
    mistakes: [
      { problem: 'Fingers fly far off the string after playing.', fix: 'Leave fingers down as long as the pattern allows, and practise slowly while watching only the fingers that are not playing. A finger should hover no more than a centimetre above the string.' },
      { problem: 'The little finger collapses at the first joint or comes in flat.', fix: 'Practise the 3-4 pair alone at a slow tempo, focusing on landing on the tip with a slightly curved joint. Move higher up the neck, where the stretch is smaller, until it holds its shape.' },
      { problem: 'Squeezing the neck with the thumb.', fix: 'Every so often lift the thumb off the back of the neck while playing. If the notes still sound, you were squeezing more than needed; use the arm weight and finger pull instead.' },
      { problem: 'Notes buzz or sound dead.', fix: 'Move each fingertip closer to the fret wire and check that the pick does not strike before the finger is down.' },
      { problem: 'Tempo pushes ahead of the click as the run goes on.', fix: 'Put the click on beats 2 and 4, or accent the first note of each string. The spider is a timing exercise as much as a finger one.' },
      { problem: 'The hand tires quickly or aches.', fix: 'Stop. Shake the hand out, then go on at a lower tempo with less pressure. Pain is never part of this exercise.' }
    ],
    stages: [
      { name: 'Stage 1: Clean placement', goal: 'Every note clear, every fingertip just behind the fret, no buzzes.', how: 'Fifth position, 1-2-3-4 across all six strings and back, in quarter notes at 60 BPM. Leave fingers down on the way up.' },
      { name: 'Stage 2: Minimal effort', goal: 'Same notes with light pressure and fingers hovering close to the strings.', how: 'Eighth notes at 70–80 BPM. Use the press-until-it-buzzes test at the start of each session. Move the pattern down to first position.' },
      { name: 'Stage 3: Permutations', goal: 'Any of the 24 finger orders at the same tempo as 1-2-3-4.', how: 'Pick four permutations, including at least two that separate fingers 3 and 4. Sixteenths at 60–80 BPM.' },
      { name: 'Stage 4: True spider', goal: 'Two-string spider walking up the neck with only two fingers moving at a time.', how: 'Fingers 1 and 3 on one string, 2 and 4 on the next, alternating. Start at 50 BPM in eighths, slowly up.' },
      { name: 'Stage 5: Musical chromatics', goal: 'Chromatic passing tones in real lines, played with the same economy.', how: 'Learn bebop lines with chromatic approach notes, or a metal riff built on chromatic clusters, at 100–120 BPM sixteenths.' }
    ],
    listen: [
      { artist: 'Allan Holdsworth', work: 'Devil Take the Hindmost (Metal Fatigue, 1985)', note: 'Wide four-finger stretches and very even fretting. Notice how quiet and smooth the line is: no stray noises between notes.' },
      { artist: 'Pat Martino', work: 'Sunny (Live!, 1972)', note: 'Long continuous jazz lines with chromatic passing tones, each note fretted with the same weight.' },
      { artist: 'Steve Vai', work: 'For the Love of God (Passion and Warfare, 1990)', note: 'Runs that use all four fingers evenly across the neck. Vai has described the long, structured practice routines behind this kind of control.' }
    ],
    styles: ['rock', 'jazz', 'classical']
  },
  {
    id: 'legato',
    name: '3-notes-per-string legato',
    family: 'Fretting hand',
    summary: 'Pick the first note on each string and sound the rest with hammer-ons and pull-offs. The fretting hand takes over the job of making sound, and the line flows like a voice or a horn instead of a string of separate attacks.',
    why: [
      '“Legato” means “tied” in Italian: notes that connect without gaps. On a guitar the main way to tie notes is to let the fretting hand sound them. A hammer-on drives a finger onto the string hard enough to sound a higher note; a pull-off flicks the finger off sideways to pluck the lower note that is already fretted. Since only the first note on a string is picked, the line loses the front edge of each pick attack and gains a smooth, singing quality.',
      'Three notes per string is the usual training shape because it divides scales evenly: seven-note scales fit neatly in a three-notes-per-string pattern, and the regular rhythm of one pick, two slurs makes the hands sync. It is the basic vocabulary of fusion and rock legato players such as Allan Holdsworth, Joe Satriani and Steve Vai.',
      'Legato also appears in very different traditions. Celtic guitarists and fiddlers use quick hammer-ons and pull-offs as ornaments (cuts, rolls); classical guitar writing has slurs marked in the score; Appalachian and blues players use hammer-ons from open strings to make a line bounce. In every case the idea is the same: the fretting hand adds sound and shape, not only pitch.'
    ],
    philosophy: [
      'Legato is about which hand speaks. In picked playing the right hand decides when notes start, and the left hand decides what they are. In legato the left hand does both. That shifts the centre of attention and changes how phrases are shaped: the line breathes when you pick, and flows when you do not. Many players eventually treat the pick as punctuation, used to mark the start of a phrase or an accent, with the slurs carrying the sentence between.',
      'Allan Holdsworth is the clearest example of where this can lead. He said many times in interviews that he would rather have played saxophone, and that he disliked the sound of the pick attack; his very smooth legato was a way to get the guitar closer to a horn. You do not have to share his taste, but the idea is useful: decide what kind of sound you want, then build technique toward it.',
      'There is also a lesson about evenness. A legato line is only as good as its weakest note, and the weak note is almost always the pull-off to the index finger or the hammer-on with the little finger. Matching volume between picked and slurred notes forces you to hear the line as a whole instead of as a pattern of hand motions. The aim is that a listener cannot tell which notes were picked.',
      'Finally, legato shows that strength and tension are different things. A hammer-on needs speed and accuracy, not force: a finger dropped from a small height, fast and onto the tip, sounds louder than a finger pushed down hard. Many players discover that their legato improves when they stop trying so hard.'
    ],
    mechanics: [
      { h: 'Hammer-ons', p: [
        'Fret the first note, pick it, then bring the next finger down quickly on its tip, just behind the fret. Think of the finger as a small hammer that drops from about a centimetre above the string, not as a finger that slowly presses. The speed of arrival makes the sound.',
        'Hammer-ons from nowhere (onto a string that has not been picked) are a more advanced skill, but they matter when you change strings in legato lines. Practise them separately once the basic slur sounds full.'
      ] },
      { h: 'Pull-offs', p: [
        'A pull-off is a small pluck with the fretting finger. Make sure the lower note is already fretted, then pull the higher finger slightly down toward the floor (toward the next string) as it leaves, so it catches the string and sets it moving. Lifting straight up gives a weak note.',
        'The finger that stays down holds the note steady. If it is not pressing firmly enough, the pull-off drags the string sideways and the pitch bends. Anchor it.'
      ] },
      { h: 'Muting', p: [
        'Legato amplifies noise, especially with distortion. The side of the picking hand rests on the low strings below the one you are playing. The fretting hand’s index finger lies lightly across higher strings, and its underside touches the string below. Hammer-ons and pull-offs set other strings ringing by sympathy, so muting is not optional.',
        'Check at low volume with a clean tone first; if it is not clean there, gain will only make it worse.'
      ] },
      { h: 'Rhythm and phrasing', p: [
        'In 16th-note triplets (six notes per beat) a three-notes-per-string scale puts a picked note on every beat and every half beat. Count it out loud and make sure the picked notes are not louder or early.',
        'Then break the pattern. Accent the third note, or start the phrase on a slurred note. The ladder in the app uses triplets because they are even and clear, but real legato phrasing moves the accents around freely.'
      ] }
    ],
    mistakes: [
      { problem: 'Picked notes are much louder than slurred ones.', fix: 'Pick lighter and hammer harder. Practise at a low volume where you can hear the difference clearly, and aim for no change at all between the picked and the slurred notes.' },
      { problem: 'Pull-offs fade out.', fix: 'Pull the finger slightly toward the floor as it leaves, catching the string. Check that the lower note is firmly fretted.' },
      { problem: 'Other strings ring and the line sounds messy.', fix: 'Build muting into the slow practice from the start: picking-hand palm on the lower strings, index finger lightly across the higher ones.' },
      { problem: 'The rhythm rushes in the middle of each string.', fix: 'Count the triplets out loud and use a click with a subdivision. Slurs tend to rush because they need no pick motion; the pick hand can keep moving silently as a clock.' },
      { problem: 'Hand tension builds and the little finger gets tired.', fix: 'Use less force and more speed. Shorten sessions and rest between sets. Practise at a lower position of the neck only when the upper positions feel easy.' },
      { problem: 'Hammers land in the middle of the fret space, giving a buzz.', fix: 'Slow down until each finger lands right behind the fret. Accuracy first; speed follows.' }
    ],
    stages: [
      { name: 'Stage 1: Single slurs', goal: 'Hammer-ons and pull-offs that are as loud as the picked note.', how: 'One string, frets 5-7 and 5-8: pick, hammer; pick, pull. Quarter notes at 60 BPM, clean tone, low volume.' },
      { name: 'Stage 2: Three per string, one string', goal: 'Even triplets with one pick per three notes.', how: 'Frets 5-7-8 up and down on one string, 16th triplets at 60–70 BPM. Repeat on every string.' },
      { name: 'Stage 3: Full scale', goal: 'A three-notes-per-string major scale over six strings, smooth and in time.', how: 'G major from the low E, eighth-note triplets, then 16th triplets at 60–80 BPM. Ascending first, then descending.' },
      { name: 'Stage 4: Hammer-ons from nowhere', goal: 'Change strings without picking, with the first note on a new string still clear.', how: 'Ascending scales where only the first note of the whole run is picked. Start at 50 BPM in triplets.' },
      { name: 'Stage 5: Phrasing with legato', goal: 'Musical lines that mix legato and picking on purpose.', how: 'Learn a legato passage from a Holdsworth or Satriani recording at reduced tempo, then compose a phrase of your own where only the accents are picked.' }
    ],
    listen: [
      { artist: 'Allan Holdsworth', work: 'Devil Take the Hindmost (Metal Fatigue, 1985)', note: 'Long legato lines with almost no picked attacks. The guitar sounds closer to a horn than a plucked string.' },
      { artist: 'Joe Satriani', work: 'Surfing with the Alien (Surfing with the Alien, 1987)', note: 'Fast hammer-on and pull-off runs over a driving groove; listen for the evenness between picked and slurred notes.' },
      { artist: 'Joe Satriani', work: 'Always with Me, Always with You (Surfing with the Alien, 1987)', note: 'A slower melody where slurs shape the phrasing, a reminder that legato is a vocal idea before it is a speed technique.' }
    ],
    styles: ['rock', 'jazz', 'celtic']
  },
  {
    id: 'strskip',
    name: 'String-skipping arpeggios',
    family: 'Picking hand',
    summary: 'Arpeggios that jump over a string instead of moving to the next one, so the notes of a chord come out in wide intervals. It trains the picking hand to travel accurately and the ear to hear lines that leap rather than step.',
    why: [
      'A guitar is tuned so that neighbouring strings are a fourth apart (a third between G and B). Playing a triad across adjacent strings gives the close, compact sound of a chord shape. Skipping a string spreads the same notes out: root on the D string, third on the B, fifth on the high E, for example, or a three-note shape spread over strings 5, 3 and 1. The result is the wide-interval sound of a violin or cello crossing strings, or a piano player’s open voicing.',
      'This sound became important in neoclassical rock in the 1980s, when players such as Paul Gilbert and Jason Becker borrowed from violin music (Paganini’s Caprices, Bach’s solo string works) and wanted arpeggios that did not sound like strummed chord shapes. Jazz players use string skipping for intervallic lines built on fourths and sixths; country and chicken-pickin’ players use it, often with hybrid picking, for wide double-stop and arpeggio licks.',
      'The exercise also solves a technical problem: sweeping across adjacent strings is efficient but sounds like a strum if it is not clean, while skipping strings forces each note to be picked separately. It builds a picking hand that can find any string without looking, and it teaches muting, because every string you jump over is a string that might ring.'
    ],
    philosophy: [
      'String skipping is about distance and accuracy. The pick has to travel past a string without touching it and land exactly on the next target. That is a different skill from picking speed: it is closer to aiming. Players who train it often find that their whole picking hand becomes more confident, because it knows where each string is in space. The idea is old: classical guitar teachers have long trained right-hand fingers to find strings by touch and position rather than sight.',
      'Musically, the exercise changes how you hear chords. A close triad on three adjacent strings blends into one sound; the same notes spread out become three separate voices. Bach’s writing for solo violin and cello does exactly this: a single instrument implies harmony by jumping between registers, and the ear fills in the chord. When you play string-skipping arpeggios, try to hear the top and bottom notes as two melodies moving at once.',
      'There is a debate among rock players between sweeping and skipping. Sweeping is smooth and fast but tends toward a blurred, harp-like sound; skipping is more angular and articulate but harder to play fast. Neither is better. Some players, such as Paul Gilbert, have deliberately preferred wide, picked arpeggios because each note has its own attack. Choose based on the sound you want, not on which looks more impressive.',
      'Finally, this exercise trains silence. Most of the work is in muting the strings you skip and stopping notes that should not ring together. The cleanest players are those who think of muting as part of the note, not as an extra step.'
    ],
    mechanics: [
      { h: 'Picking pattern', p: [
        'For a three-note triad on strings 4, 2 and 1 (for example), use strict alternate picking or a mix where the pick moves in the direction of the next string. A common pattern going up is down-up-down, then on the way back up-down-up. When the pick must jump a string, think of the stroke as an arc that rises slightly over the skipped string and comes back down.',
        'Keep the motion small. A big jump looks dramatic but loses accuracy. Most of the distance comes from the wrist and forearm shifting slightly across the strings, not from a bigger stroke.'
      ] },
      { h: 'Fretting hand', p: [
        'Use fingerings that do not require two notes on the same fret on adjacent strings with one finger, since that tends to make them ring together. When a note must be fretted and then released, lift the finger just enough to stop the sound but keep it touching the string.',
        'Wide-interval shapes often include a stretch. Keep the thumb low on the back of the neck to allow the fingers to spread, and move the whole hand rather than straining.'
      ] },
      { h: 'Muting', p: [
        'The picking hand’s palm lightly covers the strings below the one you are playing. The fretting hand’s index finger or unused fingers lie across the skipped string so it cannot ring. When you jump from string 4 to string 2, string 3 is muted by the fretting finger on string 4 touching it lightly.',
        'Practise with a little distortion once the clean version works. Gain shows every stray noise.'
      ] },
      { h: 'Sound', p: [
        'Each note should have its own attack and should stop when the next starts, unless you choose to let them ring. Listen for the wide gap between notes: if the arpeggio sounds like a strum, notes are overlapping.',
        'Try both ways: notes cut short (staccato) for a clear, violin-like sound, and notes allowed to ring for a harp-like effect. Then choose for each phrase.'
      ] }
    ],
    mistakes: [
      { problem: 'The pick catches the skipped string.', fix: 'Practise only the jump: two notes, one on each target string, slowly. Exaggerate the arc of the pick over the skipped string, then shrink it.' },
      { problem: 'Notes ring together and the arpeggio blurs.', fix: 'Lift the previous fretting finger just enough to stop the string. Add palm muting for the lower strings.' },
      { problem: 'The picking hand looks for strings and loses time.', fix: 'Practise with eyes closed at a slow tempo. The hand learns distance by feel; looking slows it down.' },
      { problem: 'The skipped string rings by sympathy.', fix: 'Lay a fretting-hand finger lightly across it, or let the edge of the picking hand touch it.' },
      { problem: 'Stretches cause tension in the fretting hand.', fix: 'Choose a higher fret position where the spacing is smaller, and let the thumb drop lower behind the neck.' },
      { problem: 'Upward and downward runs sound different.', fix: 'Work each direction separately. Usually one direction has an awkward string change; adjust the pick direction for that move.' }
    ],
    stages: [
      { name: 'Stage 1: Two-string jumps', goal: 'Clean jumps between strings 4 and 2, and 3 and 1, with no noise from the skipped string.', how: 'Single notes on each string, alternate picking, quarter notes at 60 BPM. Then eighths.' },
      { name: 'Stage 2: Triad arpeggios', goal: 'A major and minor triad over strings 5, 3 and 2 or 4, 2 and 1, up and down, evenly.', how: 'Eighth notes at 70–90 BPM, root position first, then the other inversions.' },
      { name: 'Stage 3: Through a progression', goal: 'Change triads with the chords of a song without a break.', how: 'Play string-skipping arpeggios over a I–vi–IV–V progression, one triad per bar, 90–120 BPM eighths.' },
      { name: 'Stage 4: Four-note and wide shapes', goal: 'Seventh chords and two-octave arpeggios with skipped strings.', how: 'Major 7 and minor 7 arpeggios spread over five strings, 100–140 BPM eighths.' },
      { name: 'Stage 5: Musical lines', goal: 'Wide-interval melodies that use the technique as a voice, not a pattern.', how: 'Learn a passage from Bach’s Cello Suite No. 1 Prelude with a pick, or a neoclassical rock arpeggio passage, and play it at 140–160 BPM eighths.' }
    ],
    listen: [
      { artist: 'Pablo Casals', work: 'Bach, Cello Suite No. 1 in G major, Prelude (recorded 1936–1939)', note: 'One string instrument making harmony by crossing and skipping strings. Listen for how the ear hears chords from single notes.' },
      { artist: 'Itzhak Perlman', work: 'Paganini, 24 Caprices (1972)', note: 'The violin writing that neoclassical rock players borrowed from. Listen to the wide string crossings in Caprice No. 1 and No. 24.' },
      { artist: 'Jason Becker', work: 'Perpetual Burn (Perpetual Burn, 1988)', note: 'Picked arpeggios that leap between registers with a violin-like clarity.' },
      { artist: 'Racer X', work: 'Scarified (Second Heat, 1987)', note: 'Paul Gilbert’s picked, wide-interval arpeggio lines, with each note articulated rather than swept.' }
    ],
    styles: ['rock', 'classical', 'country', 'jazz']
  },
  {
    id: 'sweep',
    name: '3-string sweep arpeggios',
    family: 'Picking hand',
    summary: 'The pick moves in one continuous stroke across several strings, playing one note on each, while the fretting hand releases each note as the next one sounds. Done well it sounds like a fast, clean arpeggio; done badly it sounds like a strum.',
    why: [
      'Sweep picking exists because alternate picking across many strings with one note per string is awkward: the pick would have to jump back and forth around each string. If instead the pick simply carries on in the same direction, falling through the strings like a hand dropping down a staircase, the motion becomes very efficient. One downward motion can play three, four or six notes.',
      'The principle is older than rock. Django Reinhardt used raked, swept arpeggios with rest strokes in the 1930s, as part of gypsy picking. The fusion guitarist Frank Gambale built a whole system around picking in the direction of the next string and taught it widely as “economy” or “speed” picking. In 1980s rock, Yngwie Malmsteen, Jason Becker and Marty Friedman made fast sweep arpeggios a defining sound of neoclassical metal.',
      'The three-string version in the app is the core unit. Most longer sweeps are built out of three-string shapes, usually a triad on the G, B and high E strings, often with a hammer-on or pull-off at the top. Getting this small shape completely clean is more valuable than playing a sloppy six-string sweep.'
    ],
    philosophy: [
      'Sweeping is the clearest example on guitar of letting a single gesture produce many notes. Instead of thinking “pick, pick, pick”, you make one motion and the strings fall under it. That changes the timing problem: the rhythm comes from the speed of the stroke and from the fretting hand releasing each note on time, not from separate pick attacks. It is closer to a harpist’s gliss or a pianist’s rolled chord than to ordinary picking.',
      'This raises the main idea of sweeping: separation. Fretting a chord shape and dragging the pick across it is a strum. A sweep only becomes an arpeggio when each note stops before the next one starts. The fretting hand does the most important work: it rolls a finger across a barre, lifts a finger as the pick reaches the next string, and lets only one note ring at a time. Players who master sweeping usually say the left hand was the harder part.',
      'There is a long argument about sweeping as a musical device. Critics hear it as a showy pattern that turns chords into scales of noise. Its defenders point out that the same idea, rapid broken chords, runs through Baroque and Romantic music. The honest answer is that it depends on how it is used. A sweep that outlines a harmony at the right moment, with clear notes and good time, is as musical as any other line. A sweep used because the hand knows the shape is not.',
      'Sweeping also teaches the value of slow practice. At speed, every error hides in the blur. At slow tempos, you can hear whether the notes are separate, whether the rhythm is even, and whether the pick is moving with a steady speed. Most players who sweep well spent a long time sweeping slowly.'
    ],
    mechanics: [
      { h: 'Pick motion', p: [
        'For an ascending sweep (toward the floor), the pick moves down through the strings as one push, resting briefly on each string after it sounds, so it is ready to push through the next. For a descending sweep, the pick moves up in the same way. The movement should feel like a controlled push, not a flick.',
        'Keep the pick angled slightly in the direction of travel, so it glides off each string. Tilt the pick so the edge leads rather than the flat face; this reduces drag.'
      ] },
      { h: 'Fretting hand: rolls and lifts', p: [
        'When two adjacent notes are on the same fret, such as the G and B strings in many triad shapes, use a roll: the finger presses one string with its tip, then rolls flat to fret the next as the tip lifts off the first. The first note stops as the second starts.',
        'When notes are on different fingers, lift each finger the moment the next note sounds. Lift just enough to stop the note; keep the finger touching the string so it cannot ring open.'
      ] },
      { h: 'Rhythm', p: [
        'Three strings give three notes, which naturally fit eighth-note triplets. Count “1-trip-let, 2-trip-let” out loud and make sure the pick does not rush through the shape. A common error is a fast burst followed by a pause; the goal is an even rhythm.',
        'Add a hammer-on or pull-off at the top of the shape to turn the direction cleanly. This gives you a five-note pattern (up three strings, hammer, pull, back down) that is the basis of many sweep licks.'
      ] },
      { h: 'Muting', p: [
        'The picking hand’s palm follows the pick, resting on the strings that have just been played. The fretting hand keeps unused fingers lightly on the strings. Sweep arpeggios are notorious for noise; muting is part of the technique.',
        'Practise with a clean tone first, then with gain, and check that you hear only one note at a time.'
      ] }
    ],
    mistakes: [
      { problem: 'The arpeggio sounds like a strum.', fix: 'Practise very slowly, one note per beat, and listen for each note stopping before the next one sounds. Work on the fretting-hand roll until it is automatic.' },
      { problem: 'The pick motion is a series of separate strokes.', fix: 'Think of the sweep as one push. Let the pick rest on each string briefly, then push through. Do the motion on muted strings until it feels like one gesture.' },
      { problem: 'The rhythm is uneven: a rush and then a stop.', fix: 'Count triplets out loud and use a click on each beat. Slow down until each note is in its own place in time.' },
      { problem: 'Noise from strings that should be silent.', fix: 'Let the picking-hand palm follow the pick across the strings, and keep unused fretting fingers touching the strings.' },
      { problem: 'The roll on same-fret notes leaves both notes ringing.', fix: 'Practise only the roll: press with the tip, roll flat, and lift the tip as the pad takes over. One note on, one note off.' },
      { problem: 'Speed attempted before the motion is clean.', fix: 'Stay at a tempo where every repetition is clean for a full minute before moving up by 4–6 BPM.' }
    ],
    stages: [
      { name: 'Stage 1: The motion alone', goal: 'A smooth, even push of the pick across three muted strings, up and down.', how: 'Mute the strings with the fretting hand and sweep across G, B and E in eighth-note triplets at 50–60 BPM.' },
      { name: 'Stage 2: One shape, slow', goal: 'A clean three-string triad with each note separate.', how: 'A major triad on G, B and E (for example 7th fret shape for G major), triplets at 60 BPM. Then minor and diminished.' },
      { name: 'Stage 3: Turnaround', goal: 'A five-note pattern up and back with a hammer-on or pull-off at the top.', how: 'Sweep up three strings, hammer, pull, sweep down. Triplets at 70–90 BPM.' },
      { name: 'Stage 4: Through changes', goal: 'Sweeping through a chord progression without losing time.', how: 'Am–Dm–E–Am or similar, one shape per beat, 90–120 BPM triplets.' },
      { name: 'Stage 5: Longer shapes', goal: 'Five- and six-string sweeps that stay clean at speed.', how: 'Extend the three-string shapes downward to five strings. Use a click at 100–140 BPM in triplets or sixteenths.' }
    ],
    listen: [
      { artist: 'Jason Becker', work: 'Altitudes (Perpetual Burn, 1988)', note: 'Very clean, fast sweeps; each note in the arpeggio is separate even at high speed.' },
      { artist: 'Yngwie Malmsteen', work: 'Black Star (Rising Force, 1984)', note: 'Neoclassical sweeps that outline harmonic minor chords, borrowed from Baroque harpsichord and violin writing.' },
      { artist: 'Cacophony', work: 'Speed Metal Symphony (Speed Metal Symphony, 1987)', note: 'Marty Friedman and Jason Becker trading and harmonising sweep and arpeggio lines.' },
      { artist: 'Quintette du Hot Club de France', work: 'Minor Swing (1937)', note: 'Django Reinhardt’s raked arpeggios, swept with rest strokes: the jazz roots of the technique.' }
    ],
    styles: ['rock', 'manouche', 'jazz', 'classical']
  },
  {
    id: 'chords',
    name: 'Chord changes per minute',
    family: 'Fretting hand',
    summary: 'Switch between two chords for one minute and count the clean changes. It turns the hardest part of early playing, getting from one shape to another in time, into a short daily drill with a number you can track.',
    why: [
      'Holding a chord is one skill; moving between chords in time is another. Most beginners can play every chord in a song slowly but cannot play the song, because the gaps between the chords are too long. The music stops at each change while the fingers search. Chord changes per minute isolate that gap and train it directly.',
      'The drill is widely known as “one-minute changes”, popularised for guitar beginners by the teacher Justin Sandercoe. The idea is simple: choose two chords, set a timer for 60 seconds, change back and forth as fast as you can while still playing each chord cleanly, and write down the number. Doing it for a few minutes a day with different pairs is one of the fastest ways to make songs playable.',
      'The skill matters at every level. Folk, rock and country songs live on smooth open-chord changes; jazz players move between voicings on every beat; flamenco and Brazilian players change shapes inside fast rhythm patterns. In every case the change has to be finished before the beat, not on it.'
    ],
    philosophy: [
      'The key idea is that a chord change begins before you hear it. Expert players start moving toward the next shape during the last beat of the previous chord, so that the fingers land just in time. In motor learning terms, the change becomes a single planned movement from one shape to another, not two separate actions (let go, then find). The drill trains that planning: after a while your hand stops thinking in two shapes and starts thinking in one motion.',
      'A second idea is economy of motion, and it is very concrete with chords. Look for common fingers: when changing from C to Am, the first and second fingers stay on the same notes, and only the third finger moves. Look for guide fingers: from G to Em, the second finger may slide along the string rather than lift. Look for anchors: in many folk and rock songs, the third and fourth fingers stay on the B and E strings through several chords. Every finger that does not move is a finger that cannot be late.',
      'The third idea is about priorities. Early on, many students stop the rhythm while they fix the chord. A better habit is the opposite: keep the strumming hand going, and land the chord as best you can. A slightly messy chord on time sounds like music; a perfect chord late does not. The drill counts clean changes, but in a song, time comes first.',
      'Finally, the drill teaches patience in a measurable way. Your number will go from 15 to 30 to 50 over weeks, not hours. Writing it down makes progress visible, and visible progress keeps people practising.'
    ],
    mechanics: [
      { h: 'Choosing pairs', p: [
        'Start with pairs that appear together in songs: G–C, C–D, D–A, Am–E, Em–G, A–E. Then add the pairs that cause you trouble. Do two or three pairs per session, one minute each.',
        'When a pair includes a barre chord, such as F–C, expect lower numbers at first. Change the chords in your list every week or two.'
      ] },
      { h: 'The motion', p: [
        'Lift the fingers only a little, and move them as a unit to the new shape, landing all at once if possible. Watch your hand: fingers that fly far from the strings are lost time. Aim for the fingers to hover just above the strings.',
        'If one finger is consistently late, practise the change in slow motion, focusing on that finger. Then put it back into the full change.'
      ] },
      { h: 'Counting and the strum', p: [
        'Strum once per chord and check that all the strings that should ring do ring. Count a change only if the new chord sounds clean. Be honest; the number only means something if the standard is fixed.',
        'Once the number is good, add rhythm: four strums per chord at a slow tempo, then two, then one, keeping the strumming hand going even when the change is not finished.'
      ] },
      { h: 'Relaxation', p: [
        'Squeezing slows changes. Press only as hard as needed, and let the thumb rest lightly behind the neck. A relaxed hand can move faster than a tense one.',
        'Shake out the hand between rounds, and stop if you feel strain in the wrist or forearm.'
      ] }
    ],
    mistakes: [
      { problem: 'Fingers lift far away from the strings between chords.', fix: 'Practise the change slowly while watching the fingers. Keep them hovering close to the strings, and move common fingers as little as possible.' },
      { problem: 'The rhythm stops at every change.', fix: 'Keep the strumming hand moving no matter what. Use open strings for the last strum before the change if needed; that is better than stopping.' },
      { problem: 'One finger lands late every time.', fix: 'Place that finger first and let the others follow. Then practise the change with the late finger leading.' },
      { problem: 'Counting messy changes to make the number go up.', fix: 'Fix the standard: every string that should ring must ring. Track the number honestly.' },
      { problem: 'Only practising easy pairs.', fix: 'Include at least one pair you find hard in every session. Progress happens there.' },
      { problem: 'Hand fatigue and squeezing.', fix: 'Reduce pressure, check thumb position, and take breaks between rounds.' }
    ],
    stages: [
      { name: 'Stage 1: First pairs', goal: '20–30 clean changes per minute between easy open chords.', how: 'G–C, C–D, Am–E, one minute each, once per day. Write down the number.' },
      { name: 'Stage 2: More pairs', goal: '40 changes per minute between any common open chords.', how: 'Add Em–G, D–A, A–E and the pairs from songs you want to play.' },
      { name: 'Stage 3: Barre chords', goal: '30–40 changes per minute between a barre chord and an open chord.', how: 'F–C, Bm–G, F–Am. Use partial barres at first if needed.' },
      { name: 'Stage 4: In rhythm', goal: 'Smooth changes inside a strumming pattern at song tempo.', how: 'Down-down-up-up-down-up at 80–100 BPM, changing every bar, then every two beats.' },
      { name: 'Stage 5: Song-level', goal: '60+ changes per minute and smooth changes through whole songs.', how: 'Play songs with many changes, such as “Here Comes the Sun” or “Little Wing”, and keep the rhythm going throughout.' }
    ],
    listen: [
      { artist: 'Neil Young', work: 'Heart of Gold (Harvest, 1972)', note: 'Simple open-chord changes that never interrupt the strum. Listen for how the rhythm carries through each change.' },
      { artist: 'Oasis', work: 'Wonderwall ((What’s the Story) Morning Glory?, 1995)', note: 'The third and fourth fingers stay on the high strings through every chord, a clear example of anchoring.' },
      { artist: 'Bob Marley', work: 'Redemption Song (Uprising, 1980)', note: 'Voice and acoustic guitar only. Open chords with melodic bass runs between them, so the changes become part of the tune.' },
      { artist: 'Jimi Hendrix', work: 'Little Wing (Axis: Bold as Love, 1967)', note: 'Chord changes that are fluid and decorated, with fingers adding melody notes as they move between shapes.' }
    ],
    styles: ['rock', 'country', 'blues', 'celtic']
  },
  {
    id: 'travis',
    name: 'Travis picking',
    family: 'Fingerstyle',
    summary: 'The thumb alternates between two bass strings on every beat while the fingers add melody and chord notes in between. One player sounds like a bass player, a rhythm guitarist and a melody instrument at once.',
    why: [
      'Travis picking is named after Merle Travis, the Kentucky guitarist who made it famous on records and radio in the 1940s. He learned it in Muhlenberg County, Kentucky, from local players including Mose Rager and Ike Everly (the father of the Everly Brothers), who had in turn picked it up from a regional style that drew on African American players such as the fiddler and guitarist Arnold Shultz. Travis played with a thumbpick and just his index finger; Chet Atkins, who heard him on the radio, developed the style further with more fingers and a cleaner, more pianistic sound.',
      'The core is a steady alternating bass: the thumb plays a root on one string and another chord tone on another string, back and forth, on every beat. Over that “boom-boom” the fingers play melody notes, often on the off-beats, and pinch notes together with the thumb on the beat. The result is self-contained music: one guitar can play a whole tune without a band.',
      'The same principle runs through a lot of fingerstyle music. Piedmont blues players such as Blind Blake and Mississippi John Hurt used alternating-thumb patterns; Elizabeth Cotten, playing left-handed and upside-down, built her own version; the 1960s folk revival spread it through songs by Bob Dylan, Paul Simon and James Taylor. Hawaiian slack-key guitarists use a similar steady thumb under melody.'
    ],
    philosophy: [
      'The main idea is independence: two musical roles in one hand. The thumb is a clock, a bass player, a drummer. The fingers are a singer. The thumb must not listen to the fingers; it keeps going whatever they do. Learning Travis picking is learning to let one part of the hand run on autopilot so that attention is free for the other. It is the guitar version of a pianist’s left hand.',
      'This changes how you think about time. In Travis picking, the beat is always audible, so syncopations in the melody are heard against something solid. A melody note just before the beat creates tension because the thumb is so clearly on the beat. The style is a lesson in how syncopation needs a steady ground to mean anything.',
      'There is also a philosophy of sound. Travis and many players after him palm-muted the bass strings slightly with the side of the picking hand, so the thumb gives a dull, percussive thump while the treble notes ring clear. That contrast separates the two roles for the ear. Chet Atkins went the other way at times, letting the bass ring for a fuller, more piano-like sound. Both are valid; decide which roles you want to separate and how.',
      'Finally, the style shows how a technique carries a history. It grew in a region where Black and white musicians shared tunes and tricks, then moved to the radio, then to Nashville, then to the folk clubs. When you play it, you are using a pattern that many hands shaped.'
    ],
    mechanics: [
      { h: 'Thumb', p: [
        'For a C chord, the thumb alternates between the 5th string (C) and the 4th string (E) on beats 1 and 2, then the 6th string (G, fret 3) and the 4th string on beats 3 and 4. For a G chord, alternate 6th and 4th strings. For D, alternate 4th and 3rd. The pattern always lands the root on beat 1.',
        'Use a thumbpick if you like the punchier sound; many players use the bare thumb. Either way, the thumb should move from the joint at the base, not from the tip, with a small motion. Rest the side of the palm lightly on the bass strings near the bridge for the muted thump.'
      ] },
      { h: 'Fingers', p: [
        'The index finger usually takes the 3rd string (G) and the middle finger the 2nd string (B), with the ring finger optional for the 1st string. In the basic pattern, a finger plays on each off-beat (the “and”) between thumb strokes. A pinch is the thumb and a finger playing together on the beat.',
        'A common starting pattern over four beats: pinch (thumb and middle) on 1, index on the “and” of 1, thumb on 2, middle on the “and” of 2, thumb on 3, index on the “and” of 3, thumb on 4, middle on the “and” of 4.'
      ] },
      { h: 'Melody', p: [
        'Once the pattern runs on its own, change which strings the fingers play to pick out a tune. The fingers are free to move; the thumb is not. Simple melodies such as “Freight Train” or “Windy and Warm” are good targets.',
        'Many melody notes fall on the off-beat. Let them, and hear how they push against the thumb.'
      ] },
      { h: 'Sound and balance', p: [
        'The bass should be steady and slightly quieter than the melody. If the thumb is louder, the tune disappears. Practise with the melody slightly accented.',
        'The hand should feel calm. The thumb moves in a small arc, and the fingers move up into the palm (not away from the guitar).'
      ] }
    ],
    mistakes: [
      { problem: 'The thumb stops or stumbles when the fingers play a melody note.', fix: 'Practise the thumb alone for a few minutes at a time, then add one finger note per bar. Increase only when the thumb never stops.' },
      { problem: 'Thumb and fingers drift together into one rhythm.', fix: 'Say “boom-chick” for the thumb and count off-beats out loud for the fingers. Practise at a slow tempo with a click on every beat.' },
      { problem: 'The bass drowns out the melody.', fix: 'Palm-mute the bass slightly and play the fingers a little stronger.' },
      { problem: 'Hand bounces and loses position.', fix: 'Rest the little finger lightly on the top or the side of the palm near the bridge for a reference, but keep it light.' },
      { problem: 'Wrong bass strings when chords change.', fix: 'Learn the thumb pattern for each chord separately: for C, 5-4-6-4; for G, 6-4-6-4; for D, 4-3-4-3; for A, 5-4-5-4. Then change chords slowly.' },
      { problem: 'Pinches are uneven, one note louder than the other.', fix: 'Practise pinches slowly and listen for both notes equally, then add the pattern again.' }
    ],
    stages: [
      { name: 'Stage 1: Thumb alone', goal: 'A steady alternating bass that does not stop or change.', how: 'C and G chords, thumb only, quarter notes at 60–70 BPM for one minute each. Then change chords every bar.' },
      { name: 'Stage 2: Add the off-beats', goal: 'An even eighth-note pattern with thumb on beats and fingers on the “and”.', how: 'The basic pattern on C, G, Am and D, at 70–90 BPM eighths.' },
      { name: 'Stage 3: Pinches and variations', goal: 'Pinches on beat 1 and melodic variations in the finger notes, with a steady thumb.', how: 'Add pinches to the pattern; vary which finger notes fall where. 90–110 BPM.' },
      { name: 'Stage 4: Melody', goal: 'A simple tune over the alternating bass.', how: 'Learn “Freight Train” or a similar tune at 90–110 BPM. Focus on keeping the thumb steady under the melody.' },
      { name: 'Stage 5: Syncopation and full arrangements', goal: 'A full fingerstyle piece with syncopated melody at up to 120 BPM.', how: 'Learn a Merle Travis or Chet Atkins piece, or arrange a song yourself. Play it with the melody clear and the bass steady.' }
    ],
    listen: [
      { artist: 'Merle Travis', work: 'Cannon Ball Rag', note: 'The thumb never stops while the index finger plays syncopated melody above it. Listen for the muted, percussive bass.' },
      { artist: 'Chet Atkins', work: 'Windy and Warm', note: 'A smooth, clean version of the style with a melody that floats over the bass.' },
      { artist: 'Elizabeth Cotten', work: 'Freight Train (Folksongs and Instrumentals with Guitar, 1958)', note: 'Played left-handed on an upside-down guitar, so her fingers play the bass and the thumb plays the melody. Same musical idea, a different hand.' },
      { artist: 'Mississippi John Hurt', work: 'Candy Man Blues (1928)', note: 'An earlier blues version of alternating-thumb picking: a gentle, steady bass under a singing voice and guitar melody.' }
    ],
    styles: ['country', 'blues', 'hawaii']
  },
  {
    id: 'bossarh',
    name: 'Bossa nova right hand',
    family: 'Fingerstyle',
    summary: 'The thumb plays a steady bass on the strong beats while the fingers pluck chords in a syncopated pattern. It distils the sound of a samba percussion section into one quiet guitar.',
    why: [
      'Bossa nova (“new wave” or “new thing”) took shape in Rio de Janeiro in the late 1950s. Its guitar rhythm, the batida, is usually credited to João Gilberto, whose 1958 single “Chega de Saudade” and 1959 album of the same name set the template. He took the many layers of a samba ensemble, with the surdo bass drum on the beat and the tamborim and other percussion playing syncopated patterns, and condensed them into a single guitar played softly with the fingers.',
      'The thumb takes the surdo’s role: a steady bass on the strong beats, often alternating root and fifth. The fingers (usually index, middle and ring together) play the chord in a syncopated pattern that moves around the thumb. The harmony is often rich, with sevenths, ninths and altered chords taken from jazz and from Antônio Carlos Jobim’s compositions.',
      'Bossa nova spread internationally through Getz/Gilberto (1964) and the many jazz recordings of Jobim’s songs. Today the bossa right hand is a basic skill for jazz guitarists, Brazilian music players and anyone who accompanies singers.'
    ],
    philosophy: [
      'The heart of bossa nova is restraint. João Gilberto sang quietly, close to the microphone, and played quietly too. The often-told story, recounted in Ruy Castro’s history of bossa nova, is that he spent months practising alone in a small bathroom for its acoustics, refining the guitar beat and his soft voice. Whatever the details, the music shows the result: every sound is chosen, and nothing is loud.',
      'There is also a philosophy of time. The thumb is steady; the fingers syncopate; and the voice floats, often slightly ahead of or behind the guitar, so the melody seems to hover over the rhythm. This depends on the right hand being absolutely reliable. The freedom in the voice comes from the stability in the guitar.',
      'Another idea is that one instrument can be an ensemble. Like Travis picking, the bossa hand splits into two roles, but here the model is a percussion section. Thinking of the thumb as surdo and the fingers as tamborim helps; the guitar is not strumming chords, it is drumming them. Listen to a samba school and then to João Gilberto, and you can hear the same rhythmic DNA in very different clothes.',
      'Finally, the pattern is not fixed. Gilberto varied his finger rhythms constantly, adapting them to the phrase and the words. Students learn one or two patterns first, but the goal is to feel the rhythmic grammar well enough to improvise within it.'
    ],
    mechanics: [
      { h: 'Thumb', p: [
        'The thumb plays the bass note of each chord on beats 1 and 3 (in 4/4 notation; in 2/4 it is every beat). Alternate the root and the fifth below or above it: for Am7 with root on the 5th string, play the root, then the E on the 6th string. Keep it soft and steady, a pulse rather than a melody.',
        'Let the thumb move from the base joint and rest lightly on the next string after playing, or simply release. The sound should be round and short, not booming.'
      ] },
      { h: 'Fingers', p: [
        'The index, middle and ring fingers pluck the top three or four strings of the chord together, like a single hand clap. Pull the fingers up into the palm rather than away from the guitar. The motion is small and quick.',
        'One common two-bar pattern, close to the “bossa clave”, puts the finger chords on beat 1, the “and” of 2 and beat 4 in the first bar, then beat 2 and the “and” of 3 in the second. Many other patterns exist; start with one and loop it.'
      ] },
      { h: 'Chord voicings', p: [
        'Bossa voicings are usually four notes, with the bass on the 6th or 5th string and three upper notes on the middle strings. Common shapes: maj7, m7, 7(9), m7♭5 and 7(♭9). Learn a few and move them around.',
        'Release the upper notes slightly after each finger stroke to make them short. The contrast between short chords and a steady bass gives the pattern its bounce.'
      ] },
      { h: 'Feel', p: [
        'Bossa eighths are not swung like jazz; they are nearly straight, with a gentle lilt. Listen to recordings and imitate the subtle push, not a swing.',
        'Keep the volume low. A bossa nova played loud is a different kind of music.'
      ] }
    ],
    mistakes: [
      { problem: 'The thumb follows the finger rhythm and loses the steady bass.', fix: 'Practise the thumb alone on beats 1 and 3, then add the finger chords one at a time. If the thumb wobbles, go back.' },
      { problem: 'The pattern sounds stiff and mechanical.', fix: 'Play along with João Gilberto recordings at low volume, and copy the feel rather than the notation. Let the eighths relax slightly.' },
      { problem: 'Playing too loud.', fix: 'Practise at a volume where you could sing quietly over the guitar. The style depends on it.' },
      { problem: 'Finger chords are uneven, one string louder.', fix: 'Pluck the strings together with a single, small pull of the hand. Check each finger separately if one is weak.' },
      { problem: 'Chord changes break the pattern.', fix: 'Practise the chord changes slowly with only the thumb, then add the pattern. Change chords on beat 1, with the thumb.' },
      { problem: 'Swinging the eighths like jazz.', fix: 'Listen to the straight, gentle feel of bossa recordings, and play with a click on eighth notes until the pattern sits evenly.' }
    ],
    stages: [
      { name: 'Stage 1: Thumb and chord', goal: 'A steady thumb with one finger chord per bar.', how: 'Am7 to D7, thumb on 1 and 3, finger chord on beat 1. 70–80 BPM.' },
      { name: 'Stage 2: The basic pattern', goal: 'A two-bar syncopated pattern over a steady thumb.', how: 'The pattern described above on Am7–D7, 80–100 BPM. Loop for several minutes.' },
      { name: 'Stage 3: Changes', goal: 'The pattern through a full progression.', how: 'A ii–V–I in several keys, or the chords of “Corcovado”. 90–120 BPM.' },
      { name: 'Stage 4: Variation', goal: 'Variations in the finger rhythm without losing the thumb.', how: 'Learn two or three other patterns and switch between them every four bars, 110–130 BPM.' },
      { name: 'Stage 5: Accompanying a melody', goal: 'Singing or playing a melody over the pattern, with the guitar steady.', how: 'Sing “Garota de Ipanema” or another standard over your own accompaniment at 120–140 BPM.' }
    ],
    listen: [
      { artist: 'João Gilberto', work: 'Chega de Saudade (Chega de Saudade, 1959)', note: 'The guitar beat that started bossa nova. Listen to the thumb and the fingers as separate instruments.' },
      { artist: 'Stan Getz & João Gilberto', work: 'Desafinado (Getz/Gilberto, 1964)', note: 'The bossa hand in a jazz setting. The guitar stays quiet and steady under saxophone and voice.' },
      { artist: 'João Gilberto', work: 'Águas de Março (João Gilberto, 1973)', note: 'Voice and guitar alone, with very little else. The pattern shifts subtly with the words.' },
      { artist: 'Elis Regina & Tom Jobim', work: 'Águas de Março (Elis & Tom, 1974)', note: 'The same song in a fuller arrangement. Compare the guitar parts.' }
    ],
    styles: ['brazil', 'jazz', 'latam']
  },
  {
    id: 'rasg',
    name: 'Flamenco rasgueado (e-a-m-i)',
    family: 'Rhythm',
    summary: 'The fingers flick out one after another from a loose fist, little finger first, to make a fast, rolling strum. It is the flamenco guitar’s loudest and most percussive sound, used to mark the compás and drive the dancers and singers.',
    why: [
      'Flamenco guitar is a rhythm instrument first. Its job is to support the singer (cante) and the dancer (baile) and to mark the compás, the rhythmic cycle of each flamenco form (palo). Rasgueado, the rolling strum, is the main tool for that. It makes a burst of sound that can be as loud as a dancer’s footwork and as precise as a drum roll.',
      'The basic four-stroke rasgueado, e-a-m-i (little, ring, middle, index), produces four strokes in quick succession, often followed by an upstroke with the index. Other common types include the three-stroke triplet rasgueado, the continuous rasgueado that rolls without a gap, and the abanico, a fan-like motion with the thumb and fingers. Each has its place in different palos such as soleá, bulerías, alegrías and tangos.',
      'Rasgueado is also used in other Spanish and Latin American guitar traditions, from classical works by Joaquín Turina and Joaquín Rodrigo to Latin American folk styles. The flamenco rumba of Paco de Lucía and later the Gipsy Kings made the rasgueado sound familiar far beyond Spain.'
    ],
    philosophy: [
      'In flamenco the guitarist is a percussionist. The guitar’s body has a tapping plate (golpeador) for strikes with the fingers, and flamenco guitars are built with low action and light woods to give a dry, punchy attack. Rasgueado is the logical result: the hand becomes a set of four small hammers. Thinking of the hand as a drummer rather than a strummer changes how you practise. The goal is not volume but rhythmic precision and bite.',
      'The compás is the central idea. Flamenco forms have rhythmic cycles, such as the 12-beat cycle of soleá and bulerías with accents on 3, 6, 8, 10 and 12, or the four-beat cycle of tangos. Rasgueado marks these accents and fills the space between them. A rasgueado that lands slightly late is not just a technical error; it breaks the shared time between guitarist, dancer and singer.',
      'There are schools of thought on how to play it. Some teachers emphasise individual finger extensions from a fist, with the wrist still; others combine finger flicks with a rotation of the wrist and forearm, especially for continuous rasgueado and abanico. Paco de Lucía’s generation pushed for extreme clarity and speed. Most players end up blending these approaches. The common point is that the hand is loose: tension kills the roll.',
      'Finally, rasgueado is a social sound. It is meant to be heard by a group, to set the energy, to call the dancer in (llamada) or close a section (remate). Practising it alone, try to imagine who it is for.'
    ],
    mechanics: [
      { h: 'Hand position', p: [
        'Rest the thumb on the 6th string or on the top of the guitar near the soundhole for stability. Curl the fingers into a loose fist, with the fingernails facing the strings. The hand floats over the strings near the end of the fingerboard or above the soundhole.',
        'The fist should be loose enough that you could slide a pencil into it. A tight fist makes the flicks slow and uneven.'
      ] },
      { h: 'The flick', p: [
        'Each finger flicks outward from the fist, striking the strings with the back of the nail. Start with the little finger (e), then ring (a), middle (m) and index (i). Each finger should extend fully and quickly, as if flicking water off the fingertip.',
        'The finger should strike several strings, not just one, and sound like a burst. Release each finger before the next one plays so the strokes are separate.'
      ] },
      { h: 'Rhythm and accent', p: [
        'Practise the four-stroke rasgueado in sixteenth notes, one stroke per sixteenth, then as a quick roll ending on the beat. The last stroke (often index) usually lands on the accented beat.',
        'Add an upstroke with the index to make a five-stroke pattern, and practise the triplet and continuous variants once the basic roll is even.'
      ] },
      { h: 'Sound', p: [
        'The sound should be bright and crisp, with a clear attack from each finger. The nails help: flamenco players keep the nails of the strumming hand slightly long and shaped.',
        'Listen for an even roll. If one finger is weaker, the roll sounds lumpy. Practise that finger alone.'
      ] }
    ],
    mistakes: [
      { problem: 'The roll is uneven, with some fingers weaker or late.', fix: 'Practise each finger flick separately at a slow tempo, then pairs (e-a, a-m, m-i), then the full roll. Use a metronome at 60 BPM on sixteenths.' },
      { problem: 'The hand tenses into a tight fist.', fix: 'Loosen the fist until a pencil could slide in. Shake out the hand between sets.' },
      { problem: 'Fingers strike only one or two strings.', fix: 'Extend each finger fully and aim for three or four strings per stroke.' },
      { problem: 'Rasgueado drifts away from the compás.', fix: 'Practise with palmas (hand claps) or a click on the accented beats. The roll must end exactly on the accent.' },
      { problem: 'Nails break or snag.', fix: 'Shape the nails smoothly and keep them short enough to be strong. Some players use nail glue or fibreglass for reinforcement.' },
      { problem: 'The arm bounces with each stroke.', fix: 'Keep the thumb resting on the 6th string or the top for stability. The motion is in the fingers and wrist, not the arm.' }
    ],
    stages: [
      { name: 'Stage 1: Single flicks', goal: 'Each finger flicks out fully and cleanly.', how: 'Flick each finger separately on an E minor chord, quarter notes at 60 BPM.' },
      { name: 'Stage 2: Four-stroke roll', goal: 'An even e-a-m-i rasgueado in sixteenths.', how: 'Sixteenth notes at 60–80 BPM. Count “1-e-and-a”, one finger per subdivision.' },
      { name: 'Stage 3: Rolls on the beat', goal: 'A quick roll that ends exactly on the beat.', how: 'Roll e-a-m into an accented i on beat 1, then 2, 3 and 4. 80–100 BPM.' },
      { name: 'Stage 4: Variants', goal: 'Triplet and continuous rasgueado, plus the abanico.', how: 'Practise each variant at 70–100 BPM, then combine them in a pattern.' },
      { name: 'Stage 5: In compás', goal: 'Rasgueado in a real palo, with accents on the right beats.', how: 'Play the 12-beat soleá or bulería compás with rasgueados on the accents. 100–120 BPM.' }
    ],
    listen: [
      { artist: 'Paco de Lucía', work: 'Entre dos aguas (Fuente y caudal, 1973)', note: 'A rumba where the rasgueado is precise and rhythmic, not loud for its own sake. Listen to the rolls that close phrases.' },
      { artist: 'Paco de Lucía', work: 'Almoraima (Almoraima, 1976)', note: 'Bulería compás with sharp rasgueados marking the accents of the 12-beat cycle.' },
      { artist: 'Gipsy Kings', work: 'Bamboléo (Gipsy Kings, 1987)', note: 'Rumba strumming in a popular setting. The rolling strums drive the whole band.' }
    ],
    styles: ['flamenco', 'latam']
  },
  {
    id: 'picado',
    name: 'Flamenco picado (i-m rest stroke)',
    family: 'Fingerstyle',
    summary: 'Single-note runs played by alternating index and middle fingers with rest strokes, each finger landing on the next string after it plays. It gives flamenco scale passages their hard, bright, percussive attack.',
    why: [
      'Picado means roughly “pricked” or “chopped” in Spanish. It is the flamenco way to play fast single-note lines: scale runs, melodic passages in falsetas, and the dramatic flourishes that end a phrase. The fingers alternate, usually index and middle (i-m), sometimes with the ring finger (i-m-a or m-a), and each stroke is a rest stroke (apoyando): the finger plays through the string and comes to rest on the next string toward the player.',
      'The rest stroke gives a fuller, louder and more direct sound than a free stroke, because the finger pushes the string toward the top of the guitar rather than pulling it across. In flamenco, where the guitar has to cut through palmas, footwork and voice, that sound matters. Paco de Lucía made extremely fast and clean picado a central part of modern flamenco guitar, and later players such as Vicente Amigo and Tomatito built on it.',
      'Classical guitar uses the same rest stroke, but flamenco picado differs in sound and attitude. It is played closer to the bridge, with more attack, and phrased with strong accents that line up with the compás. The aim is not a smooth classical line but a cutting, rhythmic one.'
    ],
    philosophy: [
      'The first idea is that every note is a percussive event. Flamenco is rhythm-centred, and picado is often less like a singer’s phrase and more like a drummer’s fill played on pitches. When practising, accent the first note of each group so the run has a pulse. A long picado run without accents sounds like a blur; with them, it dances.',
      'The second idea concerns speed and meaning. Flamenco has an old tension between virtuosity and the deep expression its musicians call jondo, or the elusive quality Federico García Lorca wrote about in his 1933 lecture on duende: a dark, earthy force that cannot be learned as technique. Older aficionados sometimes criticise fast runs as empty display. The answer most great players give with their music is that technique is a tool for expression, not a replacement for it. A picado run should say something: it builds tension, completes a phrase or answers the singer.',
      'The third idea is the economy of the alternating fingers. In picado the fingers act like legs walking: one lands as the other lifts. This alternation is strictly kept, even across string changes, much like strict alternate picking with a plectrum. Players argue about when to break it (using the same finger twice on a string change, or bringing in the ring finger), but most agree that the habit of alternation must come first.',
      'Finally, picado demands stability. Many flamenco players rest the thumb on a lower string or on the guitar top as an anchor, and keep the hand very still while the fingers do the work. A stable hand lets the fingers move fast and accurately.'
    ],
    mechanics: [
      { h: 'Hand position', p: [
        'Place the hand between the soundhole and the bridge, closer to the bridge than in classical playing for a brighter sound. Rest the thumb on the 6th string or a lower string not in use, or on the top of the guitar. Keep the wrist slightly arched and the fingers curved.',
        'The fingers should strike the strings at a slight angle, so the nail and fingertip contact the string together.'
      ] },
      { h: 'The rest stroke', p: [
        'Each finger plays through the string and lands on the next thicker string, the one nearer your face. Keep the finger mostly straight from the base joint, bending slightly at the middle joint, and move from the base knuckle.',
        'As one finger lands, the other is already starting its stroke. Think of a walking motion: one foot down, the other moving.'
      ] },
      { h: 'Accents and rhythm', p: [
        'Accent the first note of each group of four (in sixteenths) or three (in triplets). The accent comes from a slightly stronger stroke, not a bigger motion.',
        'Practise with a click. Picado must lock into the compás, so the accents should line up exactly with beats.'
      ] },
      { h: 'Fretting hand and string changes', p: [
        'The fretting hand must be just as precise: each note fretted just behind the fret, with fingers close to the strings. Synchronise both hands carefully at slow tempos.',
        'When crossing strings, keep the alternation strict. Moving from a higher string to a lower one with a rest stroke is natural; moving the other way requires the finger to lift slightly more. Practise both.'
      ] }
    ],
    mistakes: [
      { problem: 'Uneven volume between i and m.', fix: 'Practise each finger alone, then alternate slowly, listening for equal tone and volume. Record yourself.' },
      { problem: 'Fingers lose alternation on string changes.', fix: 'Practise two notes on one string and two on the next at a slow tempo, keeping strict alternation.' },
      { problem: 'The hand moves and loses position.', fix: 'Anchor the thumb on a lower string or the top. The fingers move; the hand stays still.' },
      { problem: 'Runs sound blurred and unaccented.', fix: 'Accent the first note of each group and practise with a click.' },
      { problem: 'Tension in the hand and forearm at speed.', fix: 'Slow down and focus on a relaxed, loose motion from the base knuckle. Short bursts at speed, then rest.' },
      { problem: 'Hands out of sync.', fix: 'Slow down and exaggerate the order: fret, then strike. Then bring the tempo back up gradually.' }
    ],
    stages: [
      { name: 'Stage 1: Rest stroke tone', goal: 'A full, clear rest stroke with each finger.', how: 'Open strings, i then m, quarter notes at 60 BPM. Listen for equal sound.' },
      { name: 'Stage 2: Alternation', goal: 'Even i-m alternation on one string.', how: 'Eighth notes, then sixteenths at 60–80 BPM. Accent the first of each group.' },
      { name: 'Stage 3: String changes', goal: 'Strict alternation across strings.', how: 'Two- and three-octave scales in E Phrygian (the flamenco mode), sixteenths at 70–100 BPM.' },
      { name: 'Stage 4: Accented runs', goal: 'Fast runs with clear accents in compás.', how: 'Scale runs in groups of three and four, ending on a beat. 100–120 BPM.' },
      { name: 'Stage 5: Falsetas', goal: 'Picado passages from real falsetas, played cleanly and musically.', how: 'Learn a falseta with picado, such as from a Paco de Lucía rumba or bulería, at 120–130 BPM sixteenths.' }
    ],
    listen: [
      { artist: 'Paco de Lucía & Al Di Meola', work: 'Mediterranean Sundance / Río Ancho (Friday Night in San Francisco, 1981)', note: 'Paco’s picado next to Al Di Meola’s plectrum. Hear the difference between fingers and pick at high speed.' },
      { artist: 'Paco de Lucía', work: 'Zyryab (Zyryab, 1990)', note: 'Very fast picado runs that are still rhythmic and phrased.' },
      { artist: 'Paco de Lucía', work: 'Concierto de Aranjuez (1991)', note: 'A classical piece played with flamenco picado. Compare it with a classical recording to hear the difference in attack.' },
      { artist: 'Paco de Lucía', work: 'Entre dos aguas (Fuente y caudal, 1973)', note: 'Picado runs in a relaxed rumba groove, with clear accents.' }
    ],
    styles: ['flamenco', 'classical']
  },
  {
    id: 'reststroke',
    name: 'Gypsy jazz rest stroke',
    family: 'Picking hand',
    summary: 'A downstroke that pushes through the string and comes to rest on the next one, used every time the line moves to a higher string. It gives gypsy jazz its loud, punchy acoustic sound and its characteristic swing.',
    why: [
      'Gypsy jazz grew in 1930s France around Django Reinhardt and the Quintette du Hot Club de France. The guitars were acoustic, played in noisy cafés and dance halls, often without amplification. Players needed a way to get a big, cutting sound from a small instrument, and the rest stroke was the answer: a downstroke that pushes the pick through the string toward the top of the guitar and stops on the next string. That pushes more energy into the string and gives a fat, loud tone.',
      'The rest stroke is part of a wider system often called “gypsy picking”. In its usual form, string changes toward the floor (to a higher-pitched string) are always played with a downstroke, so the pick can rest on the next string. On a single string, picking alternates down and up. The rules lead to repeated downstrokes and a picking pattern that does not always alternate, but that is exactly what gives the style its accents and swing.',
      'Django developed his technique with a badly injured fretting hand after a 1928 caravan fire, playing solos mostly with two fingers. His picking hand did not anchor on the guitar; it floated, with a loose wrist and a heavy pick. Modern players such as Biréli Lagrène and Stochelo Rosenberg keep the same basic picking system.'
    ],
    philosophy: [
      'The rest stroke is about sound first. In gypsy jazz the tone is not a matter of amp settings; it comes from how the pick strikes the string. A rest stroke uses the weight of the hand and gravity to make the downstroke strong. Players often describe the hand as “falling” through the strings rather than picking them, and the result is a dense, projecting tone.',
      'The style is also an argument about time. Because downstrokes fall on string changes and many strong beats, gypsy picking builds accents into the line. Swing comes partly from where the downstrokes land. Strict alternate picking gives a neutral, even attack; gypsy picking gives a line that leans. Neither is better, but if you want the gypsy sound, the picking pattern is part of it.',
      'There is a debate about how strictly to follow the rules. Teachers such as Michael Horowitz, in his book Gypsy Picking, set out a systematic version. Others point out that Django himself was not systematic and that players mix approaches. The useful idea is to start with clear rules, so the rest stroke becomes automatic, then let the music decide.',
      'Finally, the rest stroke teaches relaxation at speed. Gypsy jazz players play very fast lines with a floating hand and a loose wrist, moving from the forearm and wrist rotation. Tension shortens the stroke and kills the tone.'
    ],
    mechanics: [
      { h: 'Grip and pick', p: [
        'Use a thick pick, often 2–3 mm or more, with a rounded or bevelled edge. Hold it between the thumb and the side of the index finger with the other fingers curled loosely. The grip is firm enough to control the pick but loose enough for the wrist to move freely.',
        'Angle the pick slightly so that it slides through the string rather than snagging.'
      ] },
      { h: 'Hand position', p: [
        'Keep the wrist bent and the hand floating above the strings, not anchored on the top. The motion comes from wrist rotation and the forearm, like turning a key.',
        'The hand should feel heavy and relaxed, letting the pick fall into the string with gravity.'
      ] },
      { h: 'The rest stroke', p: [
        'Play a downstroke through the string and let the pick come to rest on the next string toward the floor. Practise on open strings first: down on the 4th string, rest on the 3rd, and listen for the full sound.',
        'Upstrokes stay on one string and do not rest. They are lighter and quicker.'
      ] },
      { h: 'Picking pattern', p: [
        'Use downstrokes on every change to a higher string. With two notes per string ascending, the pattern is down-up, down-up. With three notes per string ascending, it becomes down-up-down, down-up-down. Descending lines are usually played down-up or with upstrokes on string changes toward the ceiling.',
        'Practise arpeggios with one note per string: these become a series of rest-stroke downstrokes, a sweep in the gypsy style.'
      ] }
    ],
    mistakes: [
      { problem: 'Downstrokes are thin and weak.', fix: 'Let the pick push through and rest on the next string. Use the weight of the hand rather than finger pressure.' },
      { problem: 'Anchoring the hand on the guitar top.', fix: 'Practise with the hand floating. Use the wrist and forearm rotation for the motion.' },
      { problem: 'Rest strokes on upstrokes.', fix: 'Remember the rule: rest strokes only on downstrokes when changing to a higher string.' },
      { problem: 'Rushing repeated downstrokes.', fix: 'Practise with a click and count. Repeated downstrokes need time to recover.' },
      { problem: 'Thin pick gives a weak sound.', fix: 'Use a thicker pick, 2–3 mm or more.' },
      { problem: 'Tension in the wrist at speed.', fix: 'Slow down, shake out the hand, and play bursts at speed with relaxation.' }
    ],
    stages: [
      { name: 'Stage 1: The rest stroke', goal: 'A full, loud downstroke that rests on the next string.', how: 'Open strings, quarter notes at 60–80 BPM. Listen for tone.' },
      { name: 'Stage 2: Two notes per string', goal: 'Down-up patterns with rest strokes on string changes.', how: 'Scales ascending with two notes per string, eighths at 90–120 BPM.' },
      { name: 'Stage 3: Three notes per string', goal: 'Down-up-down patterns with consecutive downstrokes.', how: 'Scales ascending with three notes per string, eighths at 100–140 BPM.' },
      { name: 'Stage 4: Arpeggios', goal: 'One-note-per-string arpeggios as rest-stroke sweeps.', how: 'Major and minor 6 arpeggios, eighths at 120–160 BPM.' },
      { name: 'Stage 5: Lines', goal: 'Gypsy jazz lines with the right picking pattern and swing.', how: 'Learn a Django solo or head, such as “Minor Swing”, at 160–200 BPM eighths.' }
    ],
    listen: [
      { artist: 'Quintette du Hot Club de France', work: 'Minor Swing (1937)', note: 'Django Reinhardt’s solo with rest-stroke arpeggios and a loud, punchy tone.' },
      { artist: 'Django Reinhardt', work: 'Nuages (1940)', note: 'A slow melody where the rest stroke gives each note weight and a vocal quality.' },
      { artist: 'Django Reinhardt & Stéphane Grappelli', work: 'Djangology (recorded in Rome, 1949)', note: 'Late Django with a modern sound but the same picking principles.' },
      { artist: 'Biréli Lagrène', work: 'Routes to Django (1980)', note: 'A young player reviving the style with a strong rest-stroke sound.' }
    ],
    styles: ['manouche', 'jazz']
  },
  {
    id: 'pompe',
    name: 'La pompe',
    family: 'Rhythm',
    summary: 'The gypsy jazz rhythm guitar pattern: a full chord on beats 1 and 3, a short, choked chord on 2 and 4. It is the band’s drum kit and bass section, played by a guitar.',
    why: [
      'La pompe (“the pump”) is the rhythm guitar style of gypsy jazz. In Django Reinhardt’s Quintette du Hot Club de France there were no drums: two rhythm guitars and a double bass held the time. The pompe pattern gives a strong, swinging four beats per bar, with a full chord on 1 and 3 and a short, sharp chord on 2 and 4 that mimics a snare drum backbeat.',
      'The pompe is the foundation of gypsy jazz. In many Manouche communities, young players spend years playing rhythm before taking solos. A good soloist can only swing if the pompe swings. The same principle exists in big band swing: Freddie Green played four-to-the-bar chords with Count Basie for decades, keeping the band’s pulse.',
      'The exercise in the app uses a simplified version: bass notes on 1 and 3, a short muted chord on 2 and 4. That splits the roles clearly, so you can feel the bass and backbeat before adding the full gypsy pompe with its quick up-down “pump” on 2 and 4.'
    ],
    philosophy: [
      'The pompe is about the role of the rhythm guitarist: invisible but essential. When the pompe is good, nobody notices it; they just feel the band swinging. That humility is part of the style. The rhythm player serves the soloist, the tune and the dancers.',
      'Time is the main idea. The pompe defines the pulse, so it must be steady and slightly forward-leaning, never dragging. Gypsy jazz tempos can be very fast, and a rhythm player has to keep the pulse at 250 BPM or more without tension. That comes from a loose wrist and economy, not force.',
      'Sound and silence are equally important. The short chord on 2 and 4 is made by releasing the fretting-hand pressure just after the strum, so the chord stops quickly. The silence after the chord is part of the rhythm. Without it, the pompe becomes a wash of sound.',
      'Finally, the pompe is about listening. Two rhythm guitars and a bass must lock together. The best rhythm players listen to the bass and the soloist and adjust their dynamics and accents to support them.'
    ],
    mechanics: [
      { h: 'Strumming hand', p: [
        'Use downstrokes on every beat. On 1 and 3, strum the lower strings or the full chord, letting it ring briefly. On 2 and 4, play a short, accented chord. In the full gypsy version, add a quick ghost upstroke just before the downstroke on 2 and 4, making an “up-down” pump.',
        'Keep the wrist loose and the motion small. The power comes from the wrist and forearm, not the shoulder.'
      ] },
      { h: 'Fretting hand', p: [
        'Use compact three- or four-note voicings, often on the 6th, 4th and 3rd strings or the 5th, 4th and 3rd. Common chords include major 6, minor 6, dominant 7 and diminished.',
        'On 2 and 4, release the pressure just after the strum to choke the chord. The fingers stay touching the strings but stop pressing.'
      ] },
      { h: 'Rhythm and accent', p: [
        'Accent 2 and 4 slightly, like a snare backbeat. The beats should be even in time but not in volume.',
        'Practise at slow tempos first, then gradually increase. At high tempos the motion becomes smaller and quicker.'
      ] },
      { h: 'Sound', p: [
        'The sound should be punchy, with a clear pulse. Avoid letting chords ring too long. The short chord on 2 and 4 should be crisp and percussive.',
        'Listen to recordings and imitate the balance between bass and chord.'
      ] }
    ],
    mistakes: [
      { problem: 'Chords on 2 and 4 ring too long.', fix: 'Release the fretting-hand pressure just after the strum to choke the chord.' },
      { problem: 'Tempo drags or rushes.', fix: 'Practise with a click and record yourself. The pompe must be steady.' },
      { problem: 'Wrist is stiff at high tempos.', fix: 'Shake out the hand and practise at a slower tempo with a loose wrist. Increase the tempo gradually.' },
      { problem: 'Strumming too many strings.', fix: 'Focus on three- or four-note voicings and mute the unused strings.' },
      { problem: 'Accents in the wrong place.', fix: 'Accent 2 and 4 like a snare drum. Practise with a click on 2 and 4.' },
      { problem: 'Too loud, drowning out the soloist.', fix: 'Adjust dynamics; the pompe supports the music, not competes with it.' }
    ],
    stages: [
      { name: 'Stage 1: Bass and chord', goal: 'A steady bass on 1 and 3 and short chord on 2 and 4.', how: 'Quarter notes at 120 BPM on a single chord.' },
      { name: 'Stage 2: Changes', goal: 'Smooth chord changes without breaking the rhythm.', how: 'A ii–V–I progression, 120–150 BPM.' },
      { name: 'Stage 3: Full pompe', goal: 'The full pattern with ghost upstrokes.', how: 'Add the ghost upstroke before 2 and 4. 130–160 BPM.' },
      { name: 'Stage 4: Tunes', goal: 'The pompe through full tunes.', how: 'Play “Minor Swing” or “Dark Eyes” at 150–180 BPM.' },
      { name: 'Stage 5: Fast tempos', goal: 'A steady, swinging pompe at high tempos.', how: 'Play tunes at 180–220 BPM with a relaxed wrist.' }
    ],
    listen: [
      { artist: 'Quintette du Hot Club de France', work: 'Dinah (1934)', note: 'Two rhythm guitars and bass driving the band without drums.' },
      { artist: 'Quintette du Hot Club de France', work: 'Minor Swing (1937)', note: 'The pompe under Django’s solo. Listen for the short chord on 2 and 4.' },
      { artist: 'Count Basie Orchestra', work: 'Li’l Darlin’ (The Atomic Mr. Basie, 1958)', note: 'Freddie Green’s four-to-the-bar rhythm guitar in a big band. The same function in a different style.' }
    ],
    styles: ['manouche', 'jazz']
  },
  {
    id: 'tremolo',
    name: 'Tremolo picking',
    family: 'Picking hand',
    summary: 'Very fast, even alternate picking on a single note, so the note seems to sustain like a bowed string or a held voice. It is one of the oldest ways to make a plucked instrument sing.',
    why: [
      'A plucked string starts loud and dies away. For centuries, players of plucked instruments have used rapid repeated strokes to fight that decay and make a note last. The mandolin’s singing melodies, the Greek bouzouki’s held notes, the oud’s rīsha tremolo in a taqsīm, the Russian domra and balalaika, the Chinese pipa and liuqin, and the Vietnamese and Thai plucked lutes all use some form of tremolo. On the classical guitar the same idea is done with the fingers (p-a-m-i), most famously in Tárrega’s “Recuerdos de la Alhambra”.',
      'On the electric guitar, tremolo picking arrived with surf music. Dick Dale’s 1962 recording of “Misirlou”, an old eastern Mediterranean tune, used furious tremolo on the low strings with a very heavy gauge of string and a loud, reverb-drenched amp. Dale, whose father was Lebanese, connected his playing to the oud music he heard in his family. From surf it passed into rock, and in the 1990s Norwegian black metal made long tremolo-picked melodies over blast beats one of its defining sounds.',
      'The exercise in the app trains the core motion: very fast, even picks on one note. Once that motion is reliable, you can move it between notes and strings to play tremolo melodies.'
    ],
    philosophy: [
      'Tremolo is a technique of illusion. The listener should hear a sustained, singing note, not a series of picks. That only happens when the picking is fast and even enough that the individual attacks merge. An uneven tremolo sounds like rattling. The goal is not speed for its own sake but continuity: the note should feel as if it is being drawn, like a bow on a violin.',
      'It also shows how speed and relaxation are related. Tremolo cannot be forced. If you tense the forearm to go faster, the motion becomes jerky and soon stops. The fastest tremolo pickers use a very small motion and a loose arm, often with the motion coming from forearm rotation or a slight shaking of the wrist. Many find it helpful to think of the motion as a vibration or shiver rather than as separate strokes.',
      'There is a cross-cultural lesson here too. Different traditions control tremolo in different ways. Mandolin and bouzouki players often use a measured tremolo, with a set number of strokes per beat, so it fits the rhythm. Surf and metal players often use an unmeasured tremolo, as fast as possible, for texture. Classical guitarists use the fingers in a set pattern. Each choice expresses a different idea of what a sustained note should be: rhythmic, textural or vocal.',
      'Finally, tremolo moves the expression into the fretting hand and the dynamics. Since the right hand is doing a steady motion, the shape of the phrase comes from the left hand’s slides, vibrato and note choices, and from swells in volume. Think of it as singing: the breath is steady, and the words change.'
    ],
    mechanics: [
      { h: 'Grip and motion', p: [
        'Hold the pick firmly enough that it does not twist, with only a little tip showing. The motion is small and fast, coming from the wrist, forearm rotation, or a combination. Experiment: some players feel the motion like shaking a thermometer, others like turning a doorknob quickly back and forth.',
        'Rest the side of the hand lightly on the bridge or strings for stability, or let it float if that feels freer.'
      ] },
      { h: 'Evenness', p: [
        'Start with measured tremolo: a fixed number of picks per beat. Play sixteenths at a moderate tempo, then sextuplets, then thirty-seconds. This builds control. Unmeasured tremolo (as fast as possible) should still sound even.',
        'Listen to the downstrokes and upstrokes. If one is stronger, the tremolo sounds uneven. Work on the weaker one.'
      ] },
      { h: 'Moving between notes', p: [
        'Once the tremolo is steady on one note, move it to other notes on the same string, keeping the picking constant. Then move between strings. The challenge is to keep the right hand going while the left hand changes notes.',
        'In metal and surf, the left hand often slides along a single string, so the tremolo continues without string changes.'
      ] },
      { h: 'Sound and dynamics', p: [
        'Use dynamics: start soft and swell, or decrease the volume at the end of a phrase. The tremolo can sound mechanical if it is always the same.',
        'Experiment with picking position: closer to the bridge for a brighter sound, closer to the neck for a warmer sound.'
      ] }
    ],
    mistakes: [
      { problem: 'Forearm tension and fatigue.', fix: 'Relax the arm and practise short bursts. Use a smaller motion, and take breaks.' },
      { problem: 'Uneven strokes, with downstrokes louder.', fix: 'Practise measured tremolo slowly, focusing on equal volume. Record yourself.' },
      { problem: 'The tremolo stops when the left hand changes notes.', fix: 'Practise with a slow note change, keeping the right hand going. Then speed up the changes.' },
      { problem: 'The motion is too large.', fix: 'Choke up on the pick and reduce the motion until the tip just clears the string.' },
      { problem: 'Hitting other strings.', fix: 'Mute the other strings with the palm and the fretting hand.' },
      { problem: 'The tremolo sounds mechanical.', fix: 'Add dynamics and vibrato. Practise phrasing as if singing.' }
    ],
    stages: [
      { name: 'Stage 1: Measured sixteenths', goal: 'Even sixteenths on one note.', how: 'Open string, sixteenths at 90 BPM, one minute at a time.' },
      { name: 'Stage 2: Faster subdivisions', goal: 'Sextuplets and thirty-seconds, even and relaxed.', how: 'Sixteenths at 120, then sextuplets at 90, then thirty-seconds at 70 BPM.' },
      { name: 'Stage 3: Note changes', goal: 'Tremolo across notes without stopping.', how: 'A scale on one string, tremolo on each note for a beat, 80–100 BPM.' },
      { name: 'Stage 4: Melodies', goal: 'A melody played with tremolo, sounding sustained.', how: 'Learn a simple melody such as “Misirlou” or a mandolin tune, tremolo throughout.' },
      { name: 'Stage 5: Dynamics and speed', goal: 'A fast, even tremolo with dynamics and phrasing.', how: 'Play tremolo melodies at 140–160 BPM sixteenths, with swells and vibrato.' }
    ],
    listen: [
      { artist: 'Dick Dale & His Del-Tones', work: 'Misirlou (1962)', note: 'Very fast tremolo picking on the low strings, with slides. Listen to how the tremolo drives the rhythm.' },
      { artist: 'Darkthrone', work: 'Transilvanian Hunger (Transilvanian Hunger, 1994)', note: 'Long tremolo-picked melodies over fast drums. The tremolo becomes a texture.' },
      { artist: 'Vassilis Tsitsanis', work: 'Synnefiasmeni Kyriaki', note: 'Bouzouki tremolo in rebetiko: the held notes of the melody sustained by rapid picking.' },
      { artist: 'Francisco Tárrega (composer)', work: 'Recuerdos de la Alhambra', note: 'Classical guitar tremolo with the fingers: the same idea of a sustained melody over an arpeggiated bass. Many recordings.' }
    ],
    styles: ['rock', 'arabic', 'turkbalkan', 'eastasia', 'classical']
  },
  {
    id: 'konnakol',
    name: 'Konnakol + guitar (ta-ka-di-mi)',
    family: 'Body & mind',
    summary: 'Speak rhythm syllables while you play: ta-ka-di-mi for four notes per beat, ta-ki-ta for three. The voice becomes a second metronome and a way to think in rhythm, borrowed from the South Indian art of konnakol.',
    why: [
      'Konnakol is the South Indian (Carnatic) practice of reciting rhythmic syllables (solkattu). Percussionists, especially mridangam players, use it to learn and compose rhythms, and it is also a performance art on its own. The syllables group naturally: ta-ka (2), ta-ki-ta (3), ta-ka-di-mi (4), ta-di-gi-na-tom (5), and combinations such as ta-ki-ta ta-ka-di-mi (7). Speaking them makes complex rhythms clear and memorable.',
      'Carnatic music organises time in tala cycles, such as the eight-beat Adi tala, and each beat can be subdivided in different gati (or nadai): four, three, five, seven or nine. Konnakol lets a musician move between these subdivisions accurately, play rhythmic phrases across the beat, and calculate cadences (such as the korvai and mora, phrases repeated three times to land exactly on the first beat of the cycle, the sam).',
      'For guitarists, konnakol is a practical tool. Saying the syllables while playing locks the rhythm into the body and makes subdivisions audible. John McLaughlin, who studied Indian music and worked with Indian musicians in Shakti from the 1970s, became a well-known advocate of konnakol for Western musicians, and recorded an instructional DVD with the percussionist V. Selvaganesh. In the West, a similar system called Takadimi is used in some music schools to teach rhythm.'
    ],
    philosophy: [
      'The central idea is that rhythm is a language. If you can say it, you can play it. Speaking syllables makes rhythm audible and memorable, and turns abstract counting into something closer to speech. In Indian music the voice and the hands are closely linked: drummers often recite a phrase before they play it, and the recitation itself can be an art.',
      'Another idea is that the body keeps time in layers. In Carnatic practice, musicians keep the tala with hand gestures (claps, waves and finger counts) while singing or speaking a rhythm against it. Combining hand gestures, voice and instrument trains the mind to hold several layers at once. On guitar, the playing hand is one layer, the voice another, and the metronome a third.',
      'Konnakol also shows a different relationship between precision and freedom. Indian rhythm is extremely precise: phrases must land exactly on the sam. Yet within that precision, players improvise elaborate patterns. The precision makes the freedom possible, because everyone knows where the cycle begins and ends.',
      'Finally, konnakol is about attention. Speaking while playing forces you to notice what you are doing. You cannot drift. Many players find it changes the quality of their practice: it becomes more focused and more musical.'
    ],
    mechanics: [
      { h: 'Syllables', p: [
        'Start with ta-ka-di-mi (four syllables per beat). Speak them evenly with a metronome on the beat, one syllable per sixteenth note. Then ta-ki-ta (three per beat, triplets), and ta-ka (two per beat, eighths).',
        'Later add ta-di-gi-na-tom (five) and ta-ki-ta ta-ka-di-mi (seven). Speak them in time, accenting the first syllable of each group.'
      ] },
      { h: 'Hand gestures', p: [
        'Keep the tala with the hand: for a simple four-beat cycle, clap on beat 1, then count fingers on 2, 3 and 4. For Adi tala (eight beats), clap, then count three fingers, then clap and wave, clap and wave.',
        'Practise the hand gestures with the voice before adding the guitar.'
      ] },
      { h: 'With the guitar', p: [
        'Play sixteenths on one note or a scale while speaking ta-ka-di-mi. Let the picks and the syllables line up. Then speak ta-ki-ta while playing sixteenths, creating a three-against-four feel.',
        'Accent the notes that match the first syllable of each group. This makes the groupings audible on the guitar.'
      ] },
      { h: 'Phrases and cadences', p: [
        'Build phrases from different groupings: for example, 3+3+2 (ta-ki-ta ta-ki-ta ta-ka) over eight sixteenths. Then create a phrase that is repeated three times to land on beat 1, a simple mora.',
        'Use the voice to compose rhythms, then play them on the guitar.'
      ] }
    ],
    mistakes: [
      { problem: 'Syllables drift away from the click.', fix: 'Practise speaking only, with a slow click. Accent the first syllable of each group.' },
      { problem: 'Speaking and playing do not line up.', fix: 'Slow down until both match exactly. Start with one syllable per note.' },
      { problem: 'Losing the beat when speaking groups of three or five.', fix: 'Keep the beat with a hand gesture or foot tap. Count the cycle out loud before speaking.' },
      { problem: 'Mumbling the syllables.', fix: 'Speak clearly and evenly. Konnakol is precise; the syllables should be crisp.' },
      { problem: 'Treating it as a novelty.', fix: 'Use konnakol daily, as a way to learn rhythms and check timing.' },
      { problem: 'Getting lost in long phrases.', fix: 'Break phrases into smaller groups and practise each, then combine.' }
    ],
    stages: [
      { name: 'Stage 1: Speak in four', goal: 'Even ta-ka-di-mi with a click.', how: 'Speak sixteenths at 60–80 BPM, accent on ta.' },
      { name: 'Stage 2: Speak in three', goal: 'Even ta-ki-ta triplets with a click.', how: 'Speak triplets at 60–80 BPM.' },
      { name: 'Stage 3: Guitar and voice', goal: 'Sixteenths on guitar with ta-ka-di-mi, then ta-ki-ta.', how: 'Play and speak together at 60–90 BPM. Accent the groups on the guitar.' },
      { name: 'Stage 4: Groupings', goal: 'Groupings of 3, 5 and 7 over a four-beat cycle.', how: 'Speak and play groupings at 60–100 BPM.' },
      { name: 'Stage 5: Mora and korvai', goal: 'Phrases that repeat three times and land on beat 1.', how: 'Compose a mora and play it on the guitar at 80–120 BPM.' }
    ],
    listen: [
      { artist: 'Shakti with John McLaughlin', work: 'Shakti with John McLaughlin (1976)', note: 'Guitar, violin, tabla and ghatam playing long rhythmic phrases. Listen for phrases grouped in 3, 5 and 7 and the way they land together.' },
      { artist: 'Remember Shakti', work: 'Saturday Night in Bombay (2001)', note: 'A later version of the group with V. Selvaganesh. Rhythmic phrases and konnakol-based ideas played on guitar and percussion.' },
      { artist: 'John McLaughlin & V. Selvaganesh', work: 'The Gateway to Rhythm (DVD, 2007)', note: 'An instructional introduction to konnakol for Western musicians.' },
      { artist: 'Zakir Hussain', work: 'Making Music (1987)', note: 'Tabla, guitar, flute and saxophone. Rhythmic dialogue across cultures, with McLaughlin on guitar.' }
    ],
    styles: ['carnatic', 'hindustani', 'jazz']
  },
  {
    id: 'funkstrum',
    name: '16th-note funk strumming',
    family: 'Rhythm',
    summary: 'The strumming hand moves down and up in constant sixteenths, while the fretting hand mutes most strokes and lets only a few accented chords ring. The guitar becomes a percussion instrument with pitch.',
    why: [
      'Funk guitar comes from James Brown’s bands in the 1960s and 1970s. Guitarists such as Jimmy Nolen and Phelps “Catfish” Collins played short, choppy chords and muted scratches that locked with the drums and bass. The guitar was not a lead instrument but a part of the rhythm section, playing a tight, repeated pattern. This sound, often called “chicken scratch”, is the basis of funk, disco and much soul and R&B guitar.',
      'The key technique is constant sixteenth-note motion in the strumming hand. The hand moves down and up all the time, like a drummer’s hi-hat hand, and the fretting hand decides which strokes sound. Most strokes are muted (the fretting hand rests lightly on the strings), producing a percussive scratch. A few are accented chords. The result is a groove where the guitar’s accents sit exactly where the band needs them.',
      'Nile Rodgers in Chic, Prince, and many session players made this technique a core of pop music. It also connects to West African guitar styles, where interlocking guitar parts create a rhythmic fabric, and to Caribbean styles such as reggae, where the guitar plays short, choked chords on the off-beat.'
    ],
    philosophy: [
      'Funk is about the groove, and the groove is about time. The constant sixteenth motion makes the hand a clock. Because the hand never stops, the accents fall exactly in the right place. It is the same idea as alternate picking: the motion is the meter.',
      'Funk is also about space. The guitar plays a small part, often only a few chords, leaving room for the bass, drums, horns and voice. Muted strokes are not silence, but they are space with texture. The best funk guitar parts are simple and precise: the power comes from placement, not complexity.',
      'James Brown emphasised “the One”: the first beat of the bar as the centre of gravity. Funk parts often build around it, with syncopations that pull away from it and return. The guitar, bass and drums interlock, each playing a part that fits with the others. This interlocking principle has deep roots in African music, where many small parts combine to make a complex whole.',
      'Finally, funk guitar demands discipline. Repeating a short pattern for minutes without variation, and keeping it perfectly steady, is hard. It is a form of meditation, where the goal is to lock in so deeply that the groove feels effortless.'
    ],
    mechanics: [
      { h: 'Strumming hand', p: [
        'Move the hand down and up in constant sixteenths: down on the beat and on the “and”, up on the “e” and the “a”. The motion is from the wrist, small and loose. Keep it going even when no strings sound.',
        'Strum only a few strings, often the top three or four. Use a light pick or a medium one held loosely.'
      ] },
      { h: 'Fretting hand muting', p: [
        'For muted strokes, lift the fretting fingers slightly so they touch the strings but do not press them. This gives a percussive scratch. For accented strokes, press the chord down just for that stroke, then release.',
        'Use small chord shapes, such as three-note ninth chords on the top strings. The fingers must be able to press and release quickly.'
      ] },
      { h: 'Accents', p: [
        'Choose a pattern of accents, for example on the “e” of 1 and the “and” of 2. Play those strokes with the chord pressed; all others are muted.',
        'Accent strokes should be short and sharp. Release the chord quickly after the accent.'
      ] },
      { h: 'Feel', p: [
        'Funk sixteenths can be straight or slightly swung. Listen to recordings to get the right feel.',
        'Lock with the drums and bass. Play along with recordings and focus on the interplay.'
      ] }
    ],
    mistakes: [
      { problem: 'The strumming hand stops between accents.', fix: 'Keep the hand moving in constant sixteenths, even when not strumming.' },
      { problem: 'Muted strokes ring.', fix: 'Lift the fretting fingers just enough to stop the strings.' },
      { problem: 'Accents in the wrong place.', fix: 'Count the sixteenths out loud and practise slowly with a click.' },
      { problem: 'The pattern sounds stiff.', fix: 'Relax the wrist and play along with recordings.' },
      { problem: 'Too many strings strummed.', fix: 'Focus on the top three or four strings.' },
      { problem: 'Playing too much.', fix: 'Simplify the pattern and leave space.' }
    ],
    stages: [
      { name: 'Stage 1: Muted sixteenths', goal: 'Constant muted sixteenths.', how: 'Mute all strings and strum sixteenths at 70 BPM.' },
      { name: 'Stage 2: One accent', goal: 'One accented chord per beat.', how: 'Accent on the beat, then on the “e”, the “and”, the “a”.' },
      { name: 'Stage 3: Patterns', goal: 'A two-bar pattern with several accents.', how: 'Choose a pattern from a funk recording and play it at 80–100 BPM.' },
      { name: 'Stage 4: Chord changes', goal: 'Patterns with chord changes.', how: 'Two chords per bar at 90–110 BPM.' },
      { name: 'Stage 5: Groove', goal: 'A full funk groove with a band or recording.', how: 'Play along with James Brown or Chic recordings at 100–110 BPM.' }
    ],
    listen: [
      { artist: 'James Brown', work: 'Papa’s Got a Brand New Bag (1965)', note: 'Jimmy Nolen’s choppy rhythm guitar locking with the band.' },
      { artist: 'James Brown', work: 'Get Up (I Feel Like Being a) Sex Machine (1970)', note: 'Catfish Collins’s scratch guitar: a single pattern repeated for minutes.' },
      { artist: 'Chic', work: 'Good Times (Risqué, 1979)', note: 'Nile Rodgers’s rhythm guitar: precise accents and muted scratches.' },
      { artist: 'Prince', work: 'Kiss (Parade, 1986)', note: 'Sparse funk guitar with lots of space.' }
    ],
    styles: ['funksoul', 'westafrica', 'caribbean']
  },
  {
    id: 'hybrid',
    name: 'Hybrid picking',
    family: 'Picking hand',
    summary: 'Hold a pick between thumb and index finger and use the free middle and ring fingers to pluck higher strings. You get the attack of a pick and the reach of fingerstyle in one hand, which is why country guitar runs on it.',
    why: [
      'A pick alone can only be on one string at a time. Fingers can play several strings at once, or leap across the neck without travelling. Hybrid picking combines the two: the pick usually takes the bass notes and single-note lines, and the middle (m) and ring (a) fingers pluck notes on higher strings, either together with the pick (a pinch) or between pick strokes.',
      'It became central to country guitar through players such as James Burton, whose Telecaster solos on Ricky Nelson’s records in the late 1950s and early 1960s used a flatpick and a fingerpick on his middle finger. Albert Lee, Danny Gatton, Brent Mason and Brad Paisley built the “chicken pickin’” sound on it: snapped, half-muted notes plucked by the fingers, clucking against picked notes and double-stops. Rock and fusion players such as Steve Morse, Eric Johnson and many session players use hybrid picking for wide intervals and string skips that would be awkward with a pick alone.',
      'It also lets a pick player play fingerstyle-like patterns: alternating bass with the pick and melody or chord notes with the fingers, similar to Travis picking. One hand can switch between strumming, flatpicking and fingerpicking without putting the pick down.'
    ],
    philosophy: [
      'Hybrid picking is a practical answer to a simple question: why choose? Many guitarists start with either a pick or fingers and stay in that world. Hybrid pickers decide that each tool has a job: the pick for attack and speed in single lines, the fingers for chords, wide intervals and snap. It reflects the country and session musician’s ethic of using whatever gets the sound fastest and most reliably.',
      'It also changes what a “note” can sound like. A finger snapping a string against the frets (a “snap” or “pop”) gives a percussive, slightly sharp attack quite different from the pick. Country players mix these colours deliberately: a picked note, a snapped note, a muted chicken-pick “cluck”. Tone becomes a matter of which finger, how hard and how muted, not only which amp.',
      'There is a debate about whether hybrid picking is a separate technique or a compromise. Purist flatpickers and fingerstylists sometimes see it as neither one nor the other. Its players see it as a full system with its own sound. As with most technique debates, the answer lies in the music: chicken pickin’ cannot be played the same way with a pick alone.',
      'Finally, hybrid picking trains independence between the pick and the fingers, similar to the thumb–finger independence of Travis picking. That independence lets you think in two voices: a bass line and a melody, or a melody and its harmony.'
    ],
    mechanics: [
      { h: 'Grip', p: [
        'Hold the pick between the thumb and index finger as usual. The middle and ring fingers stay free, curled lightly above the higher strings. Some players also use the little finger.',
        'The fingers pluck with the flesh or nail of the fingertip. Some players use fingerpicks on the middle finger, as James Burton did.'
      ] },
      { h: 'Basic patterns', p: [
        'Start with a pinch: pick a bass note on the 4th or 5th string and pluck the 2nd string with the middle finger at the same time. Then alternate: pick, then middle finger, then pick, then ring finger.',
        'Practise arpeggios across four strings: pick on the 4th string, middle on the 3rd, ring on the 2nd, middle on the 3rd.'
      ] },
      { h: 'Snaps and chicken pickin’', p: [
        'For a snap, hook the finger under the string and pull it up, letting it snap against the frets. For chicken pickin’, mute the string lightly with the fretting hand or the picking hand’s palm and pluck it with the finger for a clucking sound.',
        'Mix picked notes and snapped notes to create the country sound.'
      ] },
      { h: 'Balance', p: [
        'Balance the volume between the pick and the fingers. The fingers are usually quieter, so pluck firmly.',
        'Keep the hand relaxed. The fingers should move independently of the pick.'
      ] }
    ],
    mistakes: [
      { problem: 'Fingers too quiet compared to the pick.', fix: 'Pluck firmly, or use the nail, and pick slightly lighter.' },
      { problem: 'Pick and fingers out of sync in pinches.', fix: 'Practise pinches slowly, listening for one sound.' },
      { problem: 'Fingers tense or clumsy.', fix: 'Practise finger plucks alone, without the pick, to build independence.' },
      { problem: 'Snaps too loud or too thin.', fix: 'Adjust how far you pull the string and how fast you release it.' },
      { problem: 'Losing the pick grip.', fix: 'Keep the pick grip steady and let the other fingers move independently.' },
      { problem: 'Muting problems.', fix: 'Use the palm and fretting hand to control unwanted strings.' }
    ],
    stages: [
      { name: 'Stage 1: Pinches', goal: 'Even pinches of pick and middle finger.', how: 'Pick on the 4th string, middle on the 2nd, quarter notes at 70 BPM.' },
      { name: 'Stage 2: Alternation', goal: 'Pick and finger alternation.', how: 'Pick–middle–pick–ring across strings, eighths at 70–90 BPM.' },
      { name: 'Stage 3: Arpeggios', goal: 'Four-string arpeggios.', how: 'Pick on the bass, fingers on the higher strings, eighths at 90–110 BPM.' },
      { name: 'Stage 4: Chicken pickin’', goal: 'Snapped and muted notes in a lick.', how: 'Learn a simple country lick with snaps at 100–120 BPM.' },
      { name: 'Stage 5: Full licks and songs', goal: 'Country solos with hybrid picking at speed.', how: 'Learn a James Burton or Albert Lee solo at 120–140 BPM.' }
    ],
    listen: [
      { artist: 'Ricky Nelson (James Burton, guitar)', work: 'Hello Mary Lou (1961)', note: 'James Burton’s solo: pick and finger together, with snapped notes.' },
      { artist: 'Albert Lee', work: 'Country Boy', note: 'Fast hybrid-picked country lines with snaps and double-stops.' },
      { artist: 'Danny Gatton', work: 'Elmira St. Boogie (88 Elmira St., 1991)', note: 'Hybrid picking across country, rockabilly and jazz.' }
    ],
    styles: ['country', 'rock', 'blues']
  },
  {
    id: 'pima',
    name: 'Classical arpeggios (p-i-m-a)',
    family: 'Fingerstyle',
    summary: 'The thumb plays the bass and the index, middle and ring fingers each own a treble string, so a chord unfolds note by note. It is the foundation of classical right-hand technique and of much fingerstyle playing.',
    why: [
      'Classical guitarists name the right-hand fingers with Spanish initials: p (pulgar, thumb), i (índice, index), m (medio, middle) and a (anular, ring). In a basic p-i-m-a arpeggio, the thumb plays a bass note and the fingers play the 3rd, 2nd and 1st strings in turn. That pattern, and its many variations (p-i-m-a-m-i, p-a-m-i, p-i-m-i), is how guitar music makes chords flow as melody and harmony at once.',
      'Arpeggio studies have been central to classical guitar teaching since the early nineteenth century. Mauro Giuliani’s 120 right-hand studies (Op. 1) systematically work through arpeggio patterns, and Fernando Sor and Dionisio Aguado wrote methods and studies built on them. Heitor Villa-Lobos’s Étude No. 1 (from the 12 Études, 1929) is a famous modern arpeggio study, and Leo Brouwer’s Estudios Sencillos use arpeggio patterns as musical miniatures.',
      'Beyond classical guitar, p-i-m-a arpeggios underpin flamenco arpeggios, Latin American folk accompaniment and much fingerstyle pop and folk playing. The principle of assigning fingers to strings is a basic skill in any fingerstyle tradition.'
    ],
    philosophy: [
      'The first idea is that each finger owns a string. That makes the hand stable: instead of searching, the fingers sit above their strings, ready to play. Classical teachers call this “planting” or “preparation”: placing the finger on the string before it plays, so it moves with certainty. Good arpeggios come from a hand that moves very little.',
      'The second idea is evenness of tone. Classical guitar is quiet and exposed; every note is heard. A p-i-m-a arpeggio should sound like one voice, not four different fingers. That requires matching the tone of each finger, which leads to the long debate about nails. Fernando Sor played with the flesh of his fingertips; Dionisio Aguado used nails. Francisco Tárrega played with nails for much of his life and later, according to his student Emilio Pujol, without them; Pujol taught a nail-less school. Andrés Segovia championed nails, and most classical guitarists today use them, shaping and polishing them carefully. The debate is about tone: warmth versus brilliance, and what the “true” guitar sound should be.',
      'A third idea is about where motion comes from. Traditional schools emphasise the fingers moving from the base knuckle with a still hand. The Uruguayan guitarist and teacher Abel Carlevaro argued for a more integrated use of the hand, wrist and arm, with fixation of some joints and movement of others. Modern teaching often blends these approaches.',
      'Finally, the arpeggio is a musical form, not just an exercise. In works like Villa-Lobos’s Étude No. 1 or the anonymous “Romance”, the arpeggio carries the harmony and the melody emerges from it. Practising arpeggios with dynamics, with a melody brought out by one finger, and with phrasing turns technique into music.'
    ],
    mechanics: [
      { h: 'Hand position', p: [
        'Sit with the guitar on the left leg raised (or with a support), so the right hand falls naturally over the soundhole. The wrist is slightly arched, and the fingers hang above the strings with the thumb slightly ahead of the fingers, toward the neck.',
        'The thumb plays with a free stroke, moving from the base joint, and should not collide with the index finger.'
      ] },
      { h: 'Finger motion', p: [
        'Each finger moves from the base knuckle and pulls the string up into the palm (free stroke, tirando). The finger should not touch the next string after playing. The motion is small and relaxed.',
        'Prepare the fingers on their strings before playing, especially at slow tempos. Then release each in turn.'
      ] },
      { h: 'Tone and balance', p: [
        'Listen for even tone and volume across the fingers. If one finger is weaker or brighter, adjust the angle or the nail contact.',
        'Bring out a melody note by playing one finger slightly stronger. Practise this with each finger.'
      ] },
      { h: 'Rhythm and stillness', p: [
        'Keep the rhythm even. Arpeggios often rush at the top. Count and use a metronome.',
        'Keep the hand still. Only the fingers move.'
      ] }
    ],
    mistakes: [
      { problem: 'The hand bounces with each stroke.', fix: 'Keep the wrist still and let only the fingers move. Practise slowly with preparation.' },
      { problem: 'Uneven volume or tone between fingers.', fix: 'Practise each finger alone, then pairs, listening for even sound.' },
      { problem: 'The ring finger is weak.', fix: 'Practise a–m and a–i alternations to strengthen it.' },
      { problem: 'The thumb collides with the index finger.', fix: 'Move the thumb slightly ahead of the fingers, toward the neck.' },
      { problem: 'Rushing at the top of the arpeggio.', fix: 'Count and use a metronome, especially at slow tempos.' },
      { problem: 'Nails catch or click.', fix: 'Shape and polish the nails smoothly, and adjust the contact angle.' }
    ],
    stages: [
      { name: 'Stage 1: Open strings', goal: 'Even p-i-m-a on open strings.', how: 'Thumb on the 5th string, i-m-a on 3-2-1, sixteenths at 50 BPM.' },
      { name: 'Stage 2: Variations', goal: 'p-a-m-i and p-i-m-a-m-i patterns.', how: 'On open strings, then on simple chords, 50–70 BPM.' },
      { name: 'Stage 3: Chords', goal: 'Arpeggios through a chord progression.', how: 'Am–Dm–E–Am, 60–80 BPM.' },
      { name: 'Stage 4: Melody', goal: 'A melody brought out of the arpeggio.', how: 'Play the “Romance”, bringing out the a finger, at 60–80 BPM.' },
      { name: 'Stage 5: Studies', goal: 'Concert arpeggio studies.', how: 'Learn Villa-Lobos’s Étude No. 1 or a Giuliani study at 80–100 BPM.' }
    ],
    listen: [
      { artist: 'Narciso Yepes', work: 'Romance (Jeux interdits soundtrack, 1952)', note: 'The melody emerges from the arpeggio. Listen for the ring finger bringing out the top line.' },
      { artist: 'Julian Bream', work: 'Villa-Lobos, Étude No. 1', note: 'A continuous arpeggio study with a clear, even right hand.' },
      { artist: 'Francisco Tárrega (composer)', work: 'Lágrima', note: 'A short piece where arpeggios carry harmony and melody. Many recordings.' }
    ],
    styles: ['classical', 'latam', 'flamenco']
  },
  {
    id: 'bends',
    name: 'Bends in tune',
    family: 'Expression',
    summary: 'Push or pull a string sideways to raise its pitch, and stop exactly on the target note. Bending turns the guitar from a fretted instrument into a voice that can slide between notes and cry.',
    why: [
      'A fret fixes pitch. Bending frees it. By pushing a string across the fretboard, you raise its pitch smoothly, reaching notes between the frets and sliding from one to another. That lets the guitar imitate the human voice, which rarely jumps cleanly from pitch to pitch but slides and leans into notes. Blues singers bend notes, and blues guitarists learned to bend strings to match them.',
      'Bending is central to blues, rock and country guitar. B.B. King, Albert King and Freddie King made bends the heart of electric blues soloing. Rock guitarists such as Eric Clapton, Jimmy Page and David Gilmour built solos on expressive bends. Country players imitate the pedal steel guitar with bends, and the B-Bender, invented by Clarence White and Gene Parsons in the late 1960s, mechanically bends the B string for the same effect.',
      'The exercise in the app focuses on bending in tune: reaching the exact pitch of the note two frets up. That is the basic skill. Expressive bends, quarter-tone “curls”, pre-bends and releases all depend on it.'
    ],
    philosophy: [
      'Bending is about the voice. The guitar is often called a voice, and bends are where that comparison becomes real. When you bend, you shape a note’s pitch over time, like a singer. B.B. King said in interviews that he heard his guitar as a second voice, and his bends and vibrato follow the way he sang.',
      'Bending also raises questions of intonation. In Western music, pitch is often thought of as fixed: twelve notes per octave. Blues uses “blue notes” that sit between those fixed pitches, especially around the minor and major third and the flatted seventh. A slight bend on the minor third, toward but not reaching the major third, is one of the central sounds of blues. Learning to bend in tune is not about rigid pitch; it is about control, so you can choose exactly where the note goes.',
      'There are parallels in other traditions. Indian sitar players pull strings sideways (meend) to slide between notes, and Arab and Turkish music uses microtones and slides. Hawaiian and slide guitar achieve similar effects with a bar or slide. Bending is one way of making a fretted instrument behave like a voice or a fretless instrument.',
      'Finally, bending is physical. It needs strength, but more importantly, it needs the right use of the hand: pushing with several fingers, pivoting from the wrist, and using the thumb over the neck for leverage. Bending with one finger and tension quickly leads to fatigue and poor pitch.'
    ],
    mechanics: [
      { h: 'Fingers', p: [
        'Use three fingers to bend: if bending with the ring finger, place the middle and index fingers behind it on the same string. All three push together. This gives strength and control.',
        'Push the string toward the ceiling (for the G, B and E strings) or pull toward the floor (for lower strings). The fingertips stay on the string.'
      ] },
      { h: 'Wrist and thumb', p: [
        'Most of the motion comes from rotating the wrist, like turning a doorknob, not from the fingers alone. Hook the thumb over the top of the neck for leverage.',
        'The hand pivots around the thumb.'
      ] },
      { h: 'Pitch', p: [
        'Play the target note first (two frets up for a whole-step bend), then bend to match it. Listen carefully. Then bend first and check the target.',
        'Practise half-step, whole-step and step-and-a-half bends.'
      ] },
      { h: 'Vibrato and release', p: [
        'Add vibrato to a bent note by slightly releasing and re-bending it. Keep the vibrato centred on the target pitch.',
        'Release the bend smoothly back to the original note, controlling the pitch all the way.'
      ] }
    ],
    mistakes: [
      { problem: 'Bends go out of tune (flat or sharp).', fix: 'Play the target note first, then bend to match. Use a tuner to check.' },
      { problem: 'Bending with one finger.', fix: 'Use three fingers together for strength and control.' },
      { problem: 'Other strings ring when bending.', fix: 'Mute them with the fretting hand and the picking hand.' },
      { problem: 'Bending with finger strength alone.', fix: 'Rotate the wrist and use the thumb over the neck for leverage.' },
      { problem: 'Vibrato goes out of tune.', fix: 'Practise vibrato on bent notes slowly, staying centred on the target pitch.' },
      { problem: 'Releases sound uncontrolled.', fix: 'Practise slow, smooth releases back to the original pitch.' }
    ],
    stages: [
      { name: 'Stage 1: Half-step bends', goal: 'Accurate half-step bends on the B and G strings.', how: 'Bend and compare to the target, quarter notes at 60 BPM.' },
      { name: 'Stage 2: Whole-step bends', goal: 'Accurate whole-step bends.', how: 'On the G and B strings, at 60–80 BPM.' },
      { name: 'Stage 3: Bends and releases', goal: 'Bend and release in time.', how: 'Bend on the beat, release on the next beat, 70–90 BPM.' },
      { name: 'Stage 4: Vibrato', goal: 'In-tune vibrato on bent notes.', how: 'Bend and add vibrato, keeping the pitch centred, 80–100 BPM.' },
      { name: 'Stage 5: Expressive bends', goal: 'Bends in solos with control and expression.', how: 'Learn a B.B. King or David Gilmour solo, with in-tune bends at 100–120 BPM.' }
    ],
    listen: [
      { artist: 'B.B. King', work: 'The Thrill Is Gone (Completely Well, 1969)', note: 'Expressive bends and vibrato that sound like a voice.' },
      { artist: 'Albert King', work: 'Born Under a Bad Sign (1967)', note: 'Big bends pulled down toward the floor on an upside-down guitar.' },
      { artist: 'Pink Floyd', work: 'Comfortably Numb (The Wall, 1979)', note: 'David Gilmour’s long, in-tune bends.' },
      { artist: 'Stevie Ray Vaughan & Double Trouble', work: 'Texas Flood (Texas Flood, 1983)', note: 'Heavy-string bends with intense vibrato.' }
    ],
    styles: ['blues', 'rock', 'country', 'hindustani']
  }
];
