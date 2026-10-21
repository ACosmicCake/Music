/* World Woodshed — style deep-dives: new styles (blues, rock, funk & soul, country, classical, fado, Persia, Hawaiʻi) */
export default {
  blues: {
    id: 'blues', name: 'Blues (USA)', places: 'Mississippi Delta · Texas · Chicago · Memphis',
    summary: 'The blues grew in the African American South around 1900, from work songs, field hollers and spirituals. It moved north to Chicago, got loud, and became the root of jazz, R&B, rock and soul.',
    concepts: ['12-bar form: I, IV and V over twelve bars', 'Blue notes: the ♭3, ♭5 and ♭7, bent or slid', 'Shuffle feel: long-short eighth notes', 'AAB lyrics: a line, the same line again, then an answer', 'Call and response between voice and guitar', 'Turnarounds: a lick in bars 11–12 that leads back to the top'],
    instruments: ['Acoustic guitar', 'Electric guitar', 'Slide (bottleneck)', 'Harmonica', 'Piano', 'Bass', 'Drums'],
    rhythms: ['shuffle'], scales: ['blues', 'minpent', 'majpent', 'mixolydian'],
    guitar: ['Play the shuffle boogie on the low strings: root–5th, root–6th, palm-muted', 'Bend the ♭3 a little sharp, toward the major 3rd', 'Answer each vocal line, then get out of the way', 'Try slide in open G or open D tuning'],
    listen: ['Robert Johnson', 'Muddy Waters', 'B.B. King', 'Howlin’ Wolf', 'T-Bone Walker', 'Albert King', 'Elmore James', 'Stevie Ray Vaughan'],
    facts: [
      { q: 'How many bars are in the standard blues form?', a: '12', w: ['10', '24', '32'] },
      { q: 'In a quick-change 12-bar blues, bar 2 goes to…', a: 'The IV chord', w: ['The V chord', 'The vi chord', 'The ♭VI chord'] },
      { q: 'Which note does the blues scale add to the minor pentatonic?', a: '♭5', w: ['♮6', '♭2', 'Major 7th'] },
      { q: 'Who recorded “Crazy Blues” in 1920, the first big blues hit by a Black singer?', a: 'Mamie Smith', w: ['Bessie Smith', 'Billie Holiday', 'Memphis Minnie'] },
      { q: 'Muddy Waters and Howlin’ Wolf recorded mostly for which Chicago label?', a: 'Chess', w: ['Motown', 'Stax', 'Atlantic'] },
      { q: 'In AAB blues lyrics, the second line…', a: 'Repeats the first line', w: ['Is a brand-new line', 'Is sung by a choir', 'Is always spoken'] }
    ],
    era: '1900s–today',
    history: [
      ['1903', 'W.C. Handy hears a man playing slide guitar with a knife at a train station in Tutwiler, Mississippi. He later builds a career writing down and publishing blues.'],
      ['1920', 'Mamie Smith records “Crazy Blues”. It sells well, and record companies start looking for blues singers.'],
      ['1926–1937', 'Country blues guitarists record: Blind Lemon Jefferson in Texas, Charley Patton in Mississippi, and Robert Johnson, who cuts 29 songs in 1936–37.'],
      ['1940s', 'T-Bone Walker plays single-note lines on electric guitar with a jump band and sets the model for electric lead.'],
      ['1948–1950s', 'Muddy Waters, in Chicago since 1943, records for Aristocrat, soon renamed Chess. With Howlin’ Wolf, Little Walter and Willie Dixon he builds the electric Chicago band sound.'],
      ['1960s', 'British bands and the folk revival bring the blues to new audiences. Son House and Skip James are found again and play festivals; B.B. King and Albert King reach rock fans.'],
      ['1983–today', 'Stevie Ray Vaughan’s “Texas Flood” brings back hard Texas blues. Buddy Guy, Gary Clark Jr. and Christone “Kingfish” Ingram keep it going.']
    ],
    substyles: [
      { name: 'Delta blues', text: 'Solo voice and acoustic guitar from the Mississippi Delta, often with a slide and a hard, driving thumb. Charley Patton, Son House, Robert Johnson.' },
      { name: 'Piedmont blues', text: 'From the East Coast: a ragtime-like fingerpicking style with an alternating thumb. Blind Blake, Blind Willie McTell, Mississippi John Hurt plays close to it.' },
      { name: 'Texas blues', text: 'Single-string lines and a loose swing, from Blind Lemon Jefferson to T-Bone Walker, Freddie King and Stevie Ray Vaughan.' },
      { name: 'Chicago blues', text: 'The Delta style plugged in, with amplified harmonica, piano, bass and drums. Muddy Waters, Howlin’ Wolf, Otis Rush, Buddy Guy.' },
      { name: 'Jump and West Coast blues', text: 'Horn sections, swing rhythm and jazzy chords from the 1940s. T-Bone Walker and Lowell Fulson.' },
      { name: 'Blues rock', text: 'Louder, longer solos from the 1960s on, through British and American rock bands. Cream, Peter Green’s Fleetwood Mac, Stevie Ray Vaughan.' }
    ],
    traits: {
      rhythm: 'Most blues swings: eighth notes are long-short, in a 12/8 feel, with the backbeat on 2 and 4. Slow blues, the shuffle and the straight-eighth boogie are the main grooves.',
      harmony: 'The 12-bar form uses I, IV and V, usually all dominant 7th chords. A turnaround in bars 11–12 leads back to the top, and a quick change visits IV in bar 2.',
      melody: 'Melodies mix minor and major thirds over major chords. Blue notes are bent, slid or worried, and phrases follow the voice.',
      form: 'Twelve bars with AAB lyrics: a line, the line again over IV, then the answer. Eight- and sixteen-bar blues exist, and Delta players often stretch bars freely.',
      sound: 'Acoustic guitar, often with a slide, in the Delta; electric guitar, harmonica, piano, bass and drums in Chicago. Tube amps pushed into light overdrive give the electric tone.'
    },
    essential: [
      { artist: 'B.B. King', work: 'Live at the Regal', year: 1965, kind: 'album', note: 'Short vocal phrases, wide hand vibrato, and space for the crowd to answer.' },
      { artist: 'Muddy Waters', work: 'Hoochie Coochie Man', year: 1954, kind: 'track', note: 'The stop-time riff: the band hits together, then drops out under the voice.' },
      { artist: 'Robert Johnson', work: 'King of the Delta Blues Singers', year: 1961, kind: 'album', note: 'One guitar plays bass, rhythm and answers to the voice at once; learn his turnarounds.' },
      { artist: 'Charley Patton', work: 'Pony Blues', year: 1929, kind: 'track', note: 'Hard, percussive playing and a rough voice: Delta blues near its root.' },
      { artist: 'Mississippi John Hurt', work: 'Candy Man Blues', year: 1928, kind: 'track', note: 'A steady alternating thumb under a light, syncopated melody.' },
      { artist: 'T-Bone Walker', work: 'Call It Stormy Monday (But Tuesday Is Just as Bad)', year: 1947, kind: 'track', note: 'Jazzy 9th chords and smooth single-note lines on early electric guitar.' },
      { artist: 'Elmore James', work: 'Dust My Broom', year: 1951, kind: 'track', note: 'The triplet slide riff in open tuning that every slide player learns.' },
      { artist: 'Howlin’ Wolf', work: 'Smokestack Lightnin’', year: 1956, kind: 'track', note: 'A hypnotic riff that stays on one chord the whole way.' },
      { artist: 'Freddie King', work: 'Hide Away', year: 1961, kind: 'track', note: 'A shuffle instrumental packed with licks every blues player learns.' },
      { artist: 'Albert King', work: 'Born Under a Bad Sign', year: 1967, kind: 'album', note: 'Slow, huge string bends over the Stax house band.' },
      { artist: 'Stevie Ray Vaughan and Double Trouble', work: 'Texas Flood', year: 1983, kind: 'album', note: 'Heavy strings, hard attack and the Texas shuffle at full power.' }
    ],
    players: [
      { name: 'B.B. King', inst: 'guitar, voice', why: 'Hand vibrato and how to say a lot with three notes.' },
      { name: 'Robert Johnson', inst: 'guitar, voice', why: 'Boogie bass with the thumb, slide in open tunings, and turnarounds.' },
      { name: 'Muddy Waters', inst: 'slide guitar, voice', why: 'Slide over a full band, and the power of playing less.' },
      { name: 'T-Bone Walker', inst: 'electric guitar', why: 'Jazz-flavored 9th chords and the first electric blues vocabulary.' },
      { name: 'Albert King', inst: 'guitar', why: 'Wide bends on a left-handed Flying V strung upside down.' },
      { name: 'Mississippi John Hurt', inst: 'acoustic guitar', why: 'A relaxed alternating thumb that never stops under the melody.' },
      { name: 'Freddie King', inst: 'guitar', why: 'Punchy instrumental hooks, played with a thumbpick and a fingerpick.' },
      { name: 'Hubert Sumlin', inst: 'guitar', why: 'Odd, angular fills behind Howlin’ Wolf’s voice.' }
    ],
    study: [
      { title: 'Deep Blues', by: 'Robert Palmer', kind: 'book', note: 'The story of the Delta blues and how it became Chicago blues.' },
      { title: 'The Land Where the Blues Began', by: 'Alan Lomax', kind: 'book', note: 'Field recording trips in the Delta, told by the man who made them.' },
      { title: 'Blues You Can Use', by: 'John Ganapes', kind: 'book', note: 'A method book of blues guitar licks, rhythm parts and scale positions.' }
    ],
    listenFor: [
      'Count the 12 bars and say out loud when the band moves to IV and to V.',
      'Find the turnaround in bars 11–12 and hum it back.',
      'Listen to how the guitar answers each vocal line, then stops.',
      'Notice which notes get bent, and how far: a quarter tone, a half step or a whole step.',
      'Compare a Delta recording with a Chicago one: what does the band add?'
    ],
    practice: [
      'Loop the shuffle in the Rhythm atlas and clap the long-short eighths before you play.',
      'In the Repertoire gym, comp a 12-bar blues in A with the root–5th / root–6th boogie.',
      'In the Scale warm-up, play A minor pentatonic in the first box, then add the ♭5.',
      'Use Call & response: answer each 2-bar phrase with a lick that ends on the root.',
      'Load a Freddie King or B.B. King recording in Transcribe, slow it to 70% and learn one 4-bar phrase with its bends.'
    ]
  },

  rock: {
    id: 'rock', name: 'Rock & metal', places: 'Memphis · London · Birmingham · Los Angeles · Seattle',
    summary: 'Rock and roll came out of 1950s America from rhythm and blues, country and gospel over a loud backbeat. British bands sent it back louder, and it split into hard rock, prog, punk, metal, grunge and indie, with the guitar riff at the center.',
    concepts: ['The riff: a short, repeated figure a song is built on', 'Power chords: root and 5th, no 3rd', 'Backbeat: snare on 2 and 4', 'Distortion and feedback as part of the sound', 'Palm muting and down-picking for tight rhythm', 'Verse–chorus song form with a guitar solo'],
    instruments: ['Electric guitar', 'Bass guitar', 'Drum kit', 'Tube amplifier', 'Effects pedals', 'Hammond organ', 'Voice'],
    rhythms: ['backbeat'], scales: ['minpent', 'aeolian', 'blues', 'mixolydian', 'phrygian', 'harmmin'],
    guitar: ['Down-pick eighth-note power chords with the palm resting lightly on the strings', 'Learn riffs by ear and loop the hard bars in Transcribe', 'Practice in-tune bends and an even, wide vibrato', 'Mute the strings you are not playing with both hands so distortion stays clean'],
    listen: ['Chuck Berry', 'The Beatles', 'Jimi Hendrix', 'Led Zeppelin', 'Black Sabbath', 'Ramones', 'Metallica', 'Nirvana'],
    facts: [
      { q: 'A power chord contains…', a: 'Root and 5th (often with the octave)', w: ['Root, 3rd and 5th', 'Root and 7th', 'Root, 2nd and 4th'] },
      { q: 'Which band from Birmingham, England, is often called the first heavy metal band?', a: 'Black Sabbath', w: ['The Beatles', 'Ramones', 'Nirvana'] },
      { q: 'Who wrote and recorded “Johnny B. Goode” in 1958?', a: 'Chuck Berry', w: ['Little Richard', 'Elvis Presley', 'Buddy Holly'] },
      { q: 'In a rock backbeat, the snare drum hits…', a: 'Beats 2 and 4', w: ['Beats 1 and 3', 'Only beat 1', 'Every eighth note'] },
      { q: 'Grunge came mainly from which city?', a: 'Seattle', w: ['London', 'Detroit', 'Nashville'] },
      { q: 'Palm muting means…', a: 'Resting the picking hand lightly on the strings near the bridge', w: ['Pressing the strings flat with the fretting palm', 'Turning the volume knob down', 'Covering the pickups with a cloth'] }
    ],
    era: '1950s–today',
    history: [
      ['1951–1958', 'Early rock and roll: “Rocket 88” (1951) is cut in Memphis with a fuzzy, broken amp. Chuck Berry, Little Richard, Elvis Presley and Buddy Holly make it a national craze, and Berry’s double-stop intros become the guitar vocabulary.'],
      ['1964–1967', 'The British invasion: the Beatles, the Rolling Stones, the Kinks and the Who. The Kinks’ “You Really Got Me” points toward hard rock, and Jimi Hendrix arrives in London in 1966.'],
      ['1969–1973', 'Hard rock and prog: Led Zeppelin, Deep Purple and Black Sabbath turn the riff up, while King Crimson, Yes and Pink Floyd stretch the forms.'],
      ['1976–1977', 'Punk strips it back: the Ramones in New York, the Sex Pistols and the Clash in London. Fast down-strokes, three chords and do-it-yourself labels.'],
      ['1978–1980s', 'Eddie Van Halen’s tapping changes lead guitar. The New Wave of British Heavy Metal (Iron Maiden) and thrash (Metallica, Slayer, Megadeth) make metal faster and tighter.'],
      ['1991', 'Nirvana’s “Nevermind” takes grunge and alternative rock from Seattle into the mainstream.'],
      ['1990s–today', 'Indie and math rock: Slint, Don Caballero, American Football and later bands use odd meters, clean tones and tapped, interlocking guitar parts.']
    ],
    substyles: [
      { name: 'Rock and roll', text: 'Twelve-bar blues forms, a straight-eighth boogie and short, bright guitar breaks. Chuck Berry, Scotty Moore with Elvis, Buddy Holly.' },
      { name: 'Hard rock', text: 'Blues riffs on loud amps with long solos. Led Zeppelin, Deep Purple, AC/DC.' },
      { name: 'Punk', text: 'Short, fast songs with all-downstroke barre chords and no long solos. Ramones, the Clash, Bad Brains.' },
      { name: 'Heavy metal', text: 'Down-tuned, high-gain riffs in Aeolian and Phrygian, palm-muted gallops and fast, precise solos. Black Sabbath, Iron Maiden, Metallica, then many sub-genres.' },
      { name: 'Grunge and alternative', text: 'Quiet verses and loud choruses, drop D riffs and raw tone. Nirvana, Soundgarden, Pixies.' },
      { name: 'Indie and math rock', text: 'Clean or lightly driven guitars in interlocking parts, odd meters, open tunings and two-hand tapping. Slint, Don Caballero, American Football, TTNG.' }
    ],
    traits: {
      rhythm: 'Straight eighths over a backbeat on 2 and 4, driven by the kick drum and a down-picked guitar. Metal adds gallops (an eighth and two 16ths) and double kick; math rock shifts between odd meters.',
      harmony: 'Power chords and riffs replace full triads under distortion. Common moves are I–♭VII–IV, i–♭VI–♭VII and blues-based I–IV–V; metal leans on Aeolian, Phrygian and harmonic minor.',
      melody: 'Lead guitar grows from the blues: minor pentatonic boxes, bends and vibrato. Later players add modes, tapping, sweep-picked arpeggios and harmony leads in 3rds.',
      form: 'Most songs run intro, verse, chorus, verse, chorus, solo, chorus. Prog and metal string together longer sections, and math rock builds pieces from shifting riffs.',
      sound: 'Solid-body electric guitars into tube amps, from clean 1950s twang to crunch, fuzz and high-gain distortion. Bass and drums lock to the riff; wah, delay and overdrive pedals color it.'
    },
    essential: [
      { artist: 'Chuck Berry', work: 'Johnny B. Goode', year: 1958, kind: 'track', note: 'The double-stop intro and the boogie rhythm under the verse.' },
      { artist: 'The Kinks', work: 'You Really Got Me', year: 1964, kind: 'track', note: 'A two-chord power-chord riff played through a slashed, distorted speaker.' },
      { artist: 'The Jimi Hendrix Experience', work: 'Are You Experienced', year: 1967, kind: 'album', note: 'Chord-and-melody rhythm playing, fuzz and feedback used as music.' },
      { artist: 'Black Sabbath', work: 'Paranoid', year: 1970, kind: 'album', note: 'Slow, heavy riffs built on the tritone and minor pentatonic.' },
      { artist: 'Led Zeppelin', work: 'Led Zeppelin IV', year: 1971, kind: 'album', note: 'Riffs, acoustic fingerpicking and layered studio guitars on one record.' },
      { artist: 'Ramones', work: 'Ramones', year: 1976, kind: 'album', note: 'Nothing but fast downstroke barre chords: test your stamina against it.' },
      { artist: 'Van Halen', work: 'Van Halen', year: 1978, kind: 'album', note: 'Two-hand tapping in “Eruption” and swinging, bouncy rhythm parts.' },
      { artist: 'Metallica', work: 'Master of Puppets', year: 1986, kind: 'album', note: 'Tight, down-picked thrash riffs in E minor and Phrygian.' },
      { artist: 'Nirvana', work: 'Nevermind', year: 1991, kind: 'album', note: 'Quiet verse, loud chorus, and simple riffs played with total commitment.' },
      { artist: 'Slint', work: 'Spiderland', year: 1991, kind: 'album', note: 'Clean, interlocking guitar parts that build slowly into loud sections.' },
      { artist: 'American Football', work: 'American Football', year: 1999, kind: 'album', note: 'Open tunings, clean arpeggios and shifting meters: a model for math rock and emo.' }
    ],
    players: [
      { name: 'Chuck Berry', inst: 'guitar, voice', why: 'Double-stop licks and the straight-eighth rock rhythm.' },
      { name: 'Jimi Hendrix', inst: 'guitar', why: 'Chords and melody played together, and feedback used as music.' },
      { name: 'Jimmy Page', inst: 'guitar', why: 'Riff writing, alternate tunings and layered studio guitars.' },
      { name: 'Tony Iommi', inst: 'guitar', why: 'Heavy, down-tuned riffs; after losing two fingertips in a factory accident he used light strings and homemade tips.' },
      { name: 'Johnny Ramone', inst: 'guitar', why: 'Relentless all-downstroke barre chords.' },
      { name: 'Eddie Van Halen', inst: 'guitar', why: 'Two-hand tapping, whammy bar and rhythm parts that swing.' },
      { name: 'James Hetfield', inst: 'rhythm guitar', why: 'Fast, tight down-picking and palm-muted thrash riffs.' },
      { name: 'Robert Fripp', inst: 'guitar', why: 'Strict cross-picking, odd meters and his New Standard Tuning (C G D A E G).' }
    ],
    study: [
      { title: 'It Might Get Loud', by: 'Davis Guggenheim', kind: 'film', note: 'Jimmy Page, the Edge and Jack White talk and play about guitar and sound.' },
      { title: 'Metal: A Headbanger’s Journey', by: 'Sam Dunn', kind: 'documentary', note: 'Where heavy metal came from and how its sub-genres split.' },
      { title: 'Please Kill Me: The Uncensored Oral History of Punk', by: 'Legs McNeil and Gillian McCain', kind: 'book', note: 'The New York punk scene told by the people in it.' },
      { title: 'Our Band Could Be Your Life', by: 'Michael Azerrad', kind: 'book', note: 'How 1980s American indie bands toured and recorded on their own.' }
    ],
    listenFor: [
      'Find the riff, then count how many bars it lasts before it repeats.',
      'Listen for whether the guitar plays full chords or just root and 5th.',
      'Hear how the snare on 2 and 4 lines up with the strummed chords.',
      'In a metal song, notice the palm-muted notes between the accents.',
      'In a math rock track, count the bars of each section and spot the odd meter.'
    ],
    practice: [
      'Set the Metronome at 100 bpm and down-pick palm-muted eighths on the low E for two minutes.',
      'Loop the backbeat in the Rhythm atlas and play an E5–G5–A5 riff against it.',
      'In the Scale warm-up, play E minor pentatonic in two positions, then switch to E Aeolian and E Phrygian and hear the difference.',
      'Work a Technique ladder for bends: hit the target pitch, check it, add vibrato.',
      'Load a riff you love in Transcribe, slow it to 60% and learn it note for note, then bring the speed back up.'
    ]
  },

  funksoul: {
    id: 'funksoul', name: 'Funk, soul & R&B', places: 'Detroit · Memphis · Muscle Shoals · New Orleans · Philadelphia',
    summary: 'Rhythm and blues met gospel and became soul in the late 1950s and 1960s, at labels like Motown in Detroit and Stax in Memphis. James Brown then put the weight on beat 1 and made every instrument a drum: that is funk. Neo-soul in the 1990s brought jazz chords back in.',
    concepts: ['The one: funk puts the weight on beat 1', '16th-note strumming with muted “chicken scratch” strokes', 'One-chord vamps on 9th and minor 7th chords', 'Interlocking parts: guitar, bass and drums each play a small piece', 'Fills between vocal lines in 3rds, 4ths and 6ths', 'Neo-soul: extended chords, hammer-on fills, laid-back time'],
    instruments: ['Electric guitar', 'Electric bass', 'Drums', 'Hammond organ', 'Fender Rhodes', 'Clavinet', 'Horn section'],
    rhythms: ['funk16', 'backbeat'], scales: ['dorian', 'minpent', 'mixolydian', 'blues'],
    guitar: ['Keep the strumming hand moving in 16ths, even when it does not touch the strings', 'Release fretting-hand pressure to get the muted “chicken scratch”', 'Use small shapes on the top 3–4 strings: 9th chords, m7 chords and triads', 'Lock with the drummer’s hi-hat, not with the singer'],
    listen: ['James Brown', 'Curtis Mayfield', 'Booker T. & the M.G.’s', 'Sly & the Family Stone', 'The Meters', 'Chic', 'Prince', 'D’Angelo'],
    facts: [
      { q: 'In funk, “the one” means…', a: 'A strong accent on beat 1 of the bar', w: ['A solo for one instrument', 'A song with one verse', 'The first chorus'] },
      { q: 'Steve Cropper played guitar in which house band?', a: 'Booker T. & the M.G.’s', w: ['The Funk Brothers', 'The Meters', 'The J.B.’s'] },
      { q: 'Motown was founded in which city?', a: 'Detroit', w: ['Memphis', 'Chicago', 'New Orleans'] },
      { q: 'The Meters came from…', a: 'New Orleans', w: ['Detroit', 'Memphis', 'Philadelphia'] },
      { q: 'Nile Rodgers co-led which band?', a: 'Chic', w: ['Parliament', 'The Meters', 'Earth, Wind & Fire'] },
      { q: '“Chicken scratch” guitar is…', a: 'Fast, muted 16th-note strumming', w: ['Slide playing', 'Fingerpicked arpeggios', 'Tremolo picking on one note'] }
    ],
    era: '1950s–today',
    history: [
      ['1954', 'Ray Charles records “I Got a Woman”, setting a gospel feel to secular lyrics: an early step from R&B toward soul.'],
      ['1959–1962', 'Berry Gordy founds Motown in Detroit, and Stax grows in Memphis. Booker T. & the M.G.’s cut “Green Onions” in 1962.'],
      ['1965–1967', 'James Brown’s “Papa’s Got a Brand New Bag” and “Cold Sweat” move the accent to the one and make the guitar a choppy rhythm part.'],
      ['1968–1975', 'Sly & the Family Stone, the Meters, Curtis Mayfield and Parliament-Funkadelic spread funk; Mayfield’s “Super Fly” comes out in 1972.'],
      ['1977–1987', 'Chic’s disco hits ride Nile Rodgers’ guitar, and Prince builds the Minneapolis sound from funk, rock and synths.'],
      ['1995–2000', 'Neo-soul: D’Angelo’s “Brown Sugar”, Erykah Badu’s “Baduizm” and D’Angelo’s “Voodoo” bring back live bands and jazz chords.'],
      ['2010s–today', 'Players like Cory Wong and Melanie Faye make funk and neo-soul guitar a big part of online guitar culture.']
    ],
    substyles: [
      { name: 'Motown', text: 'Polished Detroit soul with a busy bass, tambourine on every beat and guitars playing short, clean figures. The Funk Brothers backed most of it.' },
      { name: 'Southern soul', text: 'Rawer, gospel-heavy soul from Stax in Memphis and FAME in Muscle Shoals. Horns, organ and spare guitar fills.' },
      { name: 'Funk', text: 'Long vamps on one chord, 16th-note guitar and bass on the one. James Brown, Sly & the Family Stone, Parliament-Funkadelic.' },
      { name: 'New Orleans funk', text: 'Looser, syncopated grooves with second-line drumming. The Meters and Allen Toussaint.' },
      { name: 'Disco and boogie', text: 'Four-on-the-floor kick drum with tight 16th-note guitar and strings. Chic is the guitar model.' },
      { name: 'Neo-soul', text: 'Laid-back, behind-the-beat time with major 7th, 9th and 11th chords and hammer-on fills. D’Angelo, Erykah Badu, Lauryn Hill.' }
    ],
    traits: {
      rhythm: 'Soul sits on a strong backbeat; funk puts weight on beat 1 and fills the bar with 16th notes. The guitar plays a repeating cell, with muted strokes between the chord stabs.',
      harmony: 'Soul uses gospel-based progressions with I–IV moves and passing chords. Funk often stays on one chord, such as E9 or Em7, for minutes; neo-soul uses major 7ths, 9ths and chromatic slides.',
      melody: 'Singers bring gospel runs and call and response. Guitar fills use double stops in 3rds, 4ths and 6ths, and minor pentatonic or Dorian lines.',
      form: 'Soul songs use verse–chorus forms. Funk tunes are built from vamps, breakdowns and a bridge, and the band changes section on a cue from the leader.',
      sound: 'Clean, bright single-coil guitar, sometimes with wah or a phaser. Tight bass and drums, horns, organ, Rhodes and clavinet.'
    },
    essential: [
      { artist: 'James Brown', work: 'Cold Sweat', year: 1967, kind: 'track', note: 'Every instrument plays a short rhythmic part, all leaning on the one.' },
      { artist: 'Booker T. & the M.G.’s', work: 'Green Onions', year: 1962, kind: 'track', note: 'A minor blues over an organ riff, with Steve Cropper’s short, biting guitar.' },
      { artist: 'Otis Redding', work: 'Otis Blue: Otis Redding Sings Soul', year: 1965, kind: 'album', note: 'Southern soul with Cropper’s fills placed between the vocal lines.' },
      { artist: 'Sly & the Family Stone', work: 'Stand!', year: 1969, kind: 'album', note: 'Rock, soul and funk mixed, with choppy guitar and group vocals.' },
      { artist: 'The Meters', work: 'Cissy Strut', year: 1969, kind: 'track', note: 'A New Orleans instrumental where guitar and bass play the same syncopated line.' },
      { artist: 'Marvin Gaye', work: 'What’s Going On', year: 1971, kind: 'album', note: 'Soft, layered Motown grooves; follow the guitar under the strings.' },
      { artist: 'Funkadelic', work: 'Maggot Brain', year: 1971, kind: 'album', note: 'Eddie Hazel’s long solo on the title track, then the funk-rock of the rest.' },
      { artist: 'Curtis Mayfield', work: 'Super Fly', year: 1972, kind: 'album', note: 'Percussion-driven grooves, strings and melodic chord fills from Mayfield’s open tuning.' },
      { artist: 'Chic', work: 'Good Times', year: 1979, kind: 'track', note: 'Nile Rodgers’ clean, nonstop 16th-note chord rhythm.' },
      { artist: 'Prince', work: 'Sign o’ the Times', year: 1987, kind: 'album', note: 'Funk rhythm guitar, rock solos and drum machines, all from one player.' },
      { artist: 'D’Angelo', work: 'Voodoo', year: 2000, kind: 'album', note: 'Grooves played deliberately behind the beat, and rich neo-soul chords.' }
    ],
    players: [
      { name: 'Jimmy Nolen', inst: 'guitar', why: 'James Brown’s guitarist from 1965 and the model for the 16th-note chicken scratch.' },
      { name: 'Steve Cropper', inst: 'guitar', why: 'Short fills and chord stabs that serve the singer.' },
      { name: 'Curtis Mayfield', inst: 'guitar, voice', why: 'Soft, melodic chord fills in his open F♯ tuning.' },
      { name: 'Leo Nocentelli', inst: 'guitar', why: 'Syncopated New Orleans riffs that leave room for the drums.' },
      { name: 'Nile Rodgers', inst: 'guitar', why: 'Fast, clean 16th-note chord rhythm that drives a whole band.' },
      { name: 'Eddie Hazel', inst: 'guitar', why: 'Long, emotional solos over a funk band.' },
      { name: 'Prince', inst: 'guitar, everything', why: 'Clean funk rhythm and fierce rock leads in the same song.' },
      { name: 'Cory Wong', inst: 'guitar', why: 'Tight modern 16th-note rhythm guitar with Vulfpeck and his own bands.' }
    ],
    study: [
      { title: 'The Funkmasters: The Great James Brown Rhythm Sections 1960–1973', by: 'Allan Slutsky and Chuck Silverman', kind: 'book', note: 'Transcribed guitar, bass and drum parts from James Brown records.' },
      { title: 'Sweet Soul Music', by: 'Peter Guralnick', kind: 'book', note: 'The history of Southern soul, from Stax to Muscle Shoals.' },
      { title: 'Standing in the Shadows of Motown', by: 'Paul Justman', kind: 'documentary', note: 'The Funk Brothers, the session band behind Motown’s hits.' }
    ],
    listenFor: [
      'Find the one: where does the whole band hit together?',
      'Listen for the muted strokes between the guitar’s chord stabs.',
      'Notice how guitar, bass and drums each play a different small pattern.',
      'In a soul ballad, hear where the guitar fills go: only in the gaps between vocal lines.',
      'In neo-soul, notice how far behind the click the drums and bass sit.'
    ],
    practice: [
      'Loop funk16 in the Rhythm atlas and strum steady 16ths, all muted, for two minutes.',
      'Accent only the 16ths you choose while the hand keeps moving: start with beat 1 and the “a” of 2.',
      'In the Repertoire gym, vamp on E9 then on Em7 for a full minute without changing the pattern.',
      'Play E Dorian in the Scale warm-up, then pick double stops in 6ths from it.',
      'Load a James Brown or Nile Rodgers groove in Transcribe, slow it to 70% and copy the guitar part exactly.'
    ]
  },

  country: {
    id: 'country', name: 'Country, bluegrass & folk', places: 'Appalachia · Nashville · Bakersfield · Texas · Greenwich Village',
    summary: 'Country and bluegrass grew from British and Irish ballads and fiddle tunes, African American blues and the banjo, which has West African roots. Nashville became the center of the business, while bluegrass, Telecaster country and the folk revival each found their own guitar sound.',
    concepts: ['Boom-chick: bass note on the beat, chord on the offbeat', 'Travis picking: alternating thumb bass under a fingered melody', 'Flatpicking: fiddle tunes played with a pick', 'Carter scratch: melody on the bass strings, strums above', 'Chicken pickin’: hybrid picking with snapped, muted notes', 'The capo: open-string shapes in any key'],
    instruments: ['Acoustic guitar (dreadnought)', 'Telecaster', 'Five-string banjo', 'Fiddle', 'Mandolin', 'Pedal steel', 'Upright bass'],
    rhythms: ['boomchick'], scales: ['majpent', 'major', 'mixolydian', 'blues'],
    guitar: ['Boom-chick: root on 1, strum on 2, alternate bass on 3, strum on 4', 'Travis picking: keep the thumb steady on two bass strings like a clock', 'Flatpick fiddle tunes with strict down-up alternate picking', 'Use a capo so G, C and D shapes work in any key'],
    listen: ['The Carter Family', 'Merle Travis', 'Chet Atkins', 'Doc Watson', 'Johnny Cash', 'Clarence White', 'Tony Rice', 'Molly Tuttle'],
    facts: [
      { q: 'Travis picking is named after…', a: 'Merle Travis', w: ['Randy Travis', 'Travis Tritt', 'Travis Barker'] },
      { q: 'Who is called the father of bluegrass?', a: 'Bill Monroe', w: ['Hank Williams', 'Johnny Cash', 'Merle Haggard'] },
      { q: 'The “Carter scratch” puts the melody…', a: 'On the bass strings, with strums above', w: ['On the high E string only', 'In harmonics', 'On a slide'] },
      { q: 'The Bakersfield sound comes from which state?', a: 'California', w: ['Tennessee', 'Texas', 'Kentucky'] },
      { q: 'In boom-chick, the bass note falls…', a: 'On the beat, with the chord on the offbeat', w: ['Only on beat 4', 'On every offbeat', 'Between beats in 16ths'] },
      { q: 'In which year were the Bristol Sessions, which recorded the Carter Family and Jimmie Rodgers?', a: '1927', w: ['1903', '1945', '1963'] }
    ],
    era: '1920s–today',
    history: [
      ['1927', 'The Bristol Sessions in Tennessee: producer Ralph Peer records the Carter Family and Jimmie Rodgers in the same week.'],
      ['1945–1946', 'Bill Monroe’s Blue Grass Boys, with Lester Flatt on guitar and Earl Scruggs on banjo, set the bluegrass sound.'],
      ['1940s–1950s', 'Merle Travis records his thumb-picked style. Chet Atkins builds on it and, as an RCA producer, shapes the smoother Nashville sound.'],
      ['1950s–1960s', 'Telecaster country: James Burton, Don Rich and the Bakersfield sound of Buck Owens and Merle Haggard bring twang and chicken pickin’.'],
      ['1960s', 'The folk revival: Doc Watson’s flatpicking reaches young audiences at the Newport Folk Festival, and Elizabeth Cotten’s “Freight Train” becomes a fingerpicking standard.'],
      ['1970s–1980s', 'After Clarence White, Tony Rice makes the guitar a lead voice in bluegrass; his “Manzanita” comes out in 1979.'],
      ['2000s–today', 'Bryan Sutton, Billy Strings and Molly Tuttle push flatpicking forward, and Brent Mason and others keep Telecaster country sharp in Nashville.']
    ],
    substyles: [
      { name: 'Old-time and early country', text: 'Fiddle tunes, ballads and string bands from the 1920s. The Carter Family and Jimmie Rodgers.' },
      { name: 'Bluegrass', text: 'Fast acoustic band music with banjo rolls, mandolin chops on the offbeat and solos passed around. Guitar keeps a strong boom-chick and adds runs.' },
      { name: 'Honky-tonk and Bakersfield', text: 'Electric bar-room country with Telecaster, pedal steel and a hard backbeat. Hank Williams, Buck Owens, Merle Haggard.' },
      { name: 'Nashville sound', text: 'Smooth production with strings and vocal choirs from the late 1950s. Chet Atkins’ clean fingerstyle fits right in.' },
      { name: 'Folk fingerstyle', text: 'Travis picking and alternating-thumb patterns under songs and instrumentals. Elizabeth Cotten, Mississippi John Hurt, the 1960s folk revival.' },
      { name: 'Flatpicking', text: 'Fiddle tunes and solos played note for note with a pick on a dreadnought. Doc Watson, Clarence White, Tony Rice.' }
    ],
    traits: {
      rhythm: 'Most country is in 2 or 4 with a boom-chick feel: bass on the beat, chord on the offbeat. Bluegrass drives hard on the offbeat, and waltzes in 3/4 are common.',
      harmony: 'Mostly I, IV and V in major keys, with secondary dominants like II7 leading to V. Open-position chords and capos keep open strings ringing.',
      melody: 'Major pentatonic with the ♭3 sliding up to the 3 is the core country lick. Fiddle tunes run in eighth notes through major and Mixolydian, and Telecaster players bend one note inside a chord to copy pedal steel.',
      form: 'Songs tell a story in verses and choruses. Fiddle tunes have an A part and a B part, each played twice (AABB); bluegrass bands pass solos around the circle.',
      sound: 'Acoustic dreadnought guitars, banjo, fiddle, mandolin and upright bass in bluegrass. Electric country uses the bright Telecaster bridge pickup, clean amps and pedal steel.'
    },
    essential: [
      { artist: 'Johnny Cash', work: 'At Folsom Prison', year: 1968, kind: 'album', note: 'Luther Perkins’ muted boom-chick: the simplest country guitar part there is.' },
      { artist: 'The Carter Family', work: 'Wildwood Flower', year: 1928, kind: 'track', note: 'Maybelle Carter’s melody on the bass strings with brushed strums above.' },
      { artist: 'Elizabeth Cotten', work: 'Folksongs and Instrumentals with Guitar', year: 1958, kind: 'album', note: 'Includes “Freight Train”: alternating bass and melody, played left-handed and upside down.' },
      { artist: 'Merle Travis', work: 'Folk Songs of the Hills', year: 1947, kind: 'album', note: 'Thumb-picked bass and melody under his singing.' },
      { artist: 'Flatt & Scruggs', work: 'Foggy Mountain Breakdown', year: 1949, kind: 'track', note: 'Banjo rolls over a driving bluegrass rhythm guitar.' },
      { artist: 'Doc Watson', work: 'Doc Watson', year: 1964, kind: 'album', note: 'Fiddle tunes flatpicked on guitar, clean and strong.' },
      { artist: 'The Kentucky Colonels', work: 'Appalachian Swing!', year: 1964, kind: 'album', note: 'Clarence White’s syncopated bluegrass lead guitar.' },
      { artist: 'Buck Owens', work: 'Act Naturally', year: 1963, kind: 'track', note: 'Bakersfield twang: Don Rich’s bright Telecaster and a hard backbeat.' },
      { artist: 'Chet Atkins and Les Paul', work: 'Chester & Lester', year: 1976, kind: 'album', note: 'Two guitarists trading clean, playful jazz-country lines.' },
      { artist: 'Tony Rice', work: 'Manzanita', year: 1979, kind: 'album', note: 'Big-toned bluegrass flatpicking with a strong rhythm groove.' },
      { artist: 'Molly Tuttle & Golden Highway', work: 'Crooked Tree', year: 2022, kind: 'album', note: 'Modern bluegrass with fast, clean crosspicking.' }
    ],
    players: [
      { name: 'Maybelle Carter', inst: 'guitar', why: 'The Carter scratch: melody with the thumb, strums with the fingers.' },
      { name: 'Merle Travis', inst: 'guitar', why: 'The thumb-picked style that bears his name.' },
      { name: 'Chet Atkins', inst: 'guitar', why: 'Travis picking pushed further: independent melody, harmonics and a clean tone.' },
      { name: 'Elizabeth Cotten', inst: 'guitar', why: 'Left-handed on an upside-down guitar, with a gentle, rolling alternating bass.' },
      { name: 'Doc Watson', inst: 'guitar, voice', why: 'Fiddle tunes flatpicked with strong, even tone.' },
      { name: 'Clarence White', inst: 'guitar', why: 'Syncopated bluegrass lead, and later the B-bender on a Telecaster.' },
      { name: 'Tony Rice', inst: 'guitar', why: 'Big tone, bluegrass rhythm and jazz-tinged lead lines.' },
      { name: 'James Burton', inst: 'Telecaster', why: 'Chicken pickin’ and string bends with Ricky Nelson and Elvis Presley.' }
    ],
    study: [
      { title: 'Fingerpicking Styles for Guitar', by: 'Happy Traum', kind: 'book', note: 'Alternating-bass patterns and folk fingerstyle, step by step.' },
      { title: 'Country Music, U.S.A.', by: 'Bill C. Malone', kind: 'book', note: 'A full history of country music.' },
      { title: 'Country Music', by: 'Ken Burns', kind: 'documentary', note: 'A long PBS series from the Carter Family to the 1990s.' }
    ],
    listenFor: [
      'Follow the bass notes: does the guitar alternate root and 5th on 1 and 3?',
      'In a bluegrass tune, hear the mandolin chop on 2 and 4.',
      'Count the A and B parts of a fiddle tune and hear each repeat.',
      'Listen for a ♭3 sliding up to the 3 in country licks.',
      'In a Telecaster solo, notice the snapped, muted chicken-pickin’ notes.'
    ],
    practice: [
      'Loop boomchick in the Rhythm atlas and play G–C–D with alternating bass at 90 bpm.',
      'Travis picking on a C chord: thumb on strings 5–4–5–4, then add melody notes on the top strings with the fingers.',
      'In the Scale warm-up, play G major pentatonic in open position, then add the ♭3 as a passing note.',
      'Learn the A part of a fiddle tune (for example “Soldier’s Joy”) with strict alternate picking and the Metronome.',
      'Load a Tony Rice or Doc Watson recording in Transcribe and learn a G run at half speed.'
    ]
  },

  classical: {
    id: 'classical', name: 'Classical guitar', places: 'Spain · Italy · Vienna · Paris · Paraguay · Brazil · Cuba',
    summary: 'The classical guitar plays written music: solo pieces, chamber music and concertos from the Renaissance to today. It grew from the vihuela and the Baroque guitar, took its modern shape with Antonio de Torres in 19th-century Spain, and became a concert instrument through Tárrega and Segovia.',
    concepts: ['Free stroke (tirando) and rest stroke (apoyando)', 'Right-hand fingers named p, i, m, a', 'Reading standard notation in positions', 'Études: studies that train one skill each', 'Tone color: plucking near the bridge or over the soundhole', 'Voicing: bringing out the melody over bass and inner parts'],
    instruments: ['Classical (nylon-string) guitar', 'Vihuela', 'Renaissance lute', 'Baroque guitar', 'Romantic guitar', 'Guitar duo and quartet', 'Orchestra (concertos)'],
    rhythms: [], scales: ['major', 'aeolian', 'harmmin', 'melmin'],
    guitar: ['Sit with the guitar raised on the left leg, using a footstool or a support', 'Alternate i and m in free stroke and rest stroke; keep the hand still', 'Play slow arpeggio studies to train p, i, m and a', 'Shape your nails and listen for an even, round tone'],
    listen: ['Andrés Segovia', 'Julian Bream', 'John Williams', 'Narciso Yepes', 'Manuel Barrueco', 'David Russell', 'Ana Vidović', 'Sharon Isbin'],
    facts: [
      { q: 'Who wrote “Recuerdos de la Alhambra”?', a: 'Francisco Tárrega', w: ['Fernando Sor', 'Joaquín Rodrigo', 'Heitor Villa-Lobos'] },
      { q: 'Who composed the “Concierto de Aranjuez”?', a: 'Joaquín Rodrigo', w: ['Manuel de Falla', 'Isaac Albéniz', 'Leo Brouwer'] },
      { q: 'Which luthier set the size and fan bracing of the modern classical guitar?', a: 'Antonio de Torres', w: ['C.F. Martin', 'Leo Fender', 'Mario Maccaferri'] },
      { q: 'In right-hand fingering, “p” stands for…', a: 'The thumb', w: ['The index finger', 'The little finger', 'A rest stroke'] },
      { q: 'Heitor Villa-Lobos was from…', a: 'Brazil', w: ['Spain', 'Cuba', 'Paraguay'] },
      { q: 'Agustín Barrios Mangoré was from…', a: 'Paraguay', w: ['Argentina', 'Mexico', 'Spain'] }
    ],
    era: '1500s–today',
    history: [
      ['1536', 'Luis de Milán publishes “El Maestro” in Valencia, the first printed book of music for the vihuela.'],
      ['1600s–1700s', 'The five-course Baroque guitar spreads across Europe. Gaspar Sanz publishes his guitar method in 1674, and Robert de Visée plays for Louis XIV.'],
      ['1800s–1830s', 'The six-string guitar takes over. Fernando Sor in Paris and London and Mauro Giuliani in Vienna write studies, sonatas and variations still taught today.'],
      ['1850s–1900s', 'Antonio de Torres builds the modern guitar in Spain. Francisco Tárrega plays and writes for it, shapes modern technique and composes “Recuerdos de la Alhambra”.'],
      ['1920s–1950s', 'Andrés Segovia takes the guitar into concert halls worldwide and asks composers for new music. Agustín Barrios and Heitor Villa-Lobos, whose 12 Études date from 1929, write from South American traditions.'],
      ['1939–1940', 'Joaquín Rodrigo writes the “Concierto de Aranjuez”; Regino Sainz de la Maza plays the premiere in Barcelona in 1940.'],
      ['1960s–today', 'Julian Bream and John Williams commission new works, and Leo Brouwer in Cuba writes the “Estudios sencillos” and “El decamerón negro” (1981). The repertoire keeps growing.']
    ],
    substyles: [
      { name: 'Renaissance vihuela and lute', text: 'Fantasías, dance pieces and song settings by Luis de Milán, Luys de Narváez and John Dowland, often played on guitar with the 3rd string tuned to F♯.' },
      { name: 'Baroque', text: 'Dance suites by Gaspar Sanz and Robert de Visée, plus transcriptions of Bach’s lute and cello suites and Scarlatti sonatas.' },
      { name: 'Classical era', text: 'Clear melodies over Alberti-style accompaniment: sonatas, variations and studies by Sor, Giuliani, Carulli and Carcassi.' },
      { name: 'Romantic and Spanish', text: 'Tárrega’s preludes and tremolo pieces, and transcriptions of Albéniz and Granados piano music that sound native to the guitar.' },
      { name: 'Latin American', text: 'Concert music built on local dances: Barrios’ waltzes, Villa-Lobos’ études and preludes, Antonio Lauro’s Venezuelan waltzes.' },
      { name: 'Modern and contemporary', text: 'New sounds and techniques: Britten’s “Nocturnal”, Brouwer’s études and works by Takemitsu and Dyens.' }
    ],
    traits: {
      rhythm: 'Time is flexible: rubato stretches and relaxes phrases. Dance forms set the pulse in many pieces, from pavanes and galliards to Baroque suites and Latin American waltzes.',
      harmony: 'Tonal harmony in major and minor keys, with cadences that close each phrase. The player holds bass, harmony and melody at once, so voice leading matters as much as chord names.',
      melody: 'Melodies are written out and shaped with phrasing, dynamics and vibrato. Scales run through major and natural, harmonic and melodic minor.',
      form: 'Études, preludes, theme and variations, sonatas, suites of dances, and concertos with orchestra.',
      sound: 'Nylon strings on a light, fan-braced body, played with fingertips and nails and usually unamplified. Tone changes with where you pluck: sweet over the soundhole, bright near the bridge.'
    },
    essential: [
      { artist: 'Julian Bream and John Williams', work: 'Together', year: 1971, kind: 'album', note: 'Two very different tones in duets from the Renaissance to Spanish music.' },
      { artist: 'Andrés Segovia', work: 'Segovia Golden Jubilee', year: 1958, kind: 'album', note: 'Segovia’s big, singing tone across the repertoire he built.' },
      { artist: 'Narciso Yepes', work: 'Jeux interdits (Forbidden Games)', year: 1952, kind: 'film', note: 'The film score that made the “Romance” one of the first pieces many guitarists learn.' },
      { artist: 'Julian Bream', work: '20th Century Guitar', year: 1967, kind: 'album', note: 'Modern works written for the guitar, played with strong color contrasts.' },
      { artist: 'John Williams', work: 'John Williams Plays Barrios', year: 1977, kind: 'album', note: 'The record that brought Barrios’ music to a wide audience.' },
      { artist: 'Paco de Lucía', work: 'Concierto de Aranjuez', year: 1991, kind: 'album', note: 'Rodrigo’s concerto from a flamenco player; compare it with a classical version.' },
      { artist: 'Christopher Nupen (dir.)', work: 'Segovia at Los Olivos', year: 1967, kind: 'film', note: 'Watch Segovia’s right hand and posture up close.' },
      { artist: 'Miloš Karadaglić', work: 'Mediterráneo', year: 2011, kind: 'album', note: 'Spanish, Greek and Balkan pieces with a warm modern sound.' },
      { artist: 'Jason Vieaux', work: 'Play', year: 2014, kind: 'album', note: 'Clean, relaxed technique across many styles.' }
    ],
    players: [
      { name: 'Fernando Sor', inst: 'guitar, composer', why: 'Studies that teach how to make a melody sing over a bass line.' },
      { name: 'Francisco Tárrega', inst: 'guitar, composer', why: 'Tremolo, Romantic tone and much of modern technique.' },
      { name: 'Andrés Segovia', inst: 'guitar', why: 'A large, singing tone and a lifetime of building the repertoire.' },
      { name: 'Agustín Barrios Mangoré', inst: 'guitar, composer', why: 'Romantic-style pieces mixed with South American dances.' },
      { name: 'Julian Bream', inst: 'guitar, lute', why: 'Color and character in every phrase; he commissioned works from Britten, Walton and others.' },
      { name: 'John Williams', inst: 'guitar', why: 'Clean, even technique and a very wide repertoire.' },
      { name: 'Leo Brouwer', inst: 'guitar, composer', why: 'His “Estudios sencillos” are a clear way into modern guitar music.' },
      { name: 'Ana Vidović', inst: 'guitar', why: 'A relaxed, efficient right hand worth watching closely.' }
    ],
    study: [
      { title: 'Solo Guitar Playing', by: 'Frederick Noad', kind: 'book', note: 'A step-by-step classical method from reading to repertoire.' },
      { title: 'Pumping Nylon', by: 'Scott Tennant', kind: 'book', note: 'Technique workouts for both hands, with clear explanations.' },
      { title: '120 Right-Hand Studies, Op. 1', by: 'Mauro Giuliani', kind: 'book', note: 'Arpeggio patterns on simple chords: the standard right-hand workout.' },
      { title: 'Twenty Studies for the Guitar', by: 'Fernando Sor, ed. Andrés Segovia', kind: 'book', note: 'Sor’s studies in a graded order.' }
    ],
    listenFor: [
      'Follow three layers at once: bass, inner voice and melody.',
      'Notice when the player plucks near the bridge for a brighter tone.',
      'Hear where the tempo stretches at the end of a phrase.',
      'In a tremolo piece, listen for the bass melody under the repeated notes.',
      'Compare two players in the same piece and name one difference in tone or timing.'
    ],
    practice: [
      'With the Metronome at 60, play p-i-m-a arpeggios on an open E minor chord, four notes per beat.',
      'Alternate i and m in rest stroke on one string, then on a scale, with the Metronome.',
      'In the Scale warm-up, play A natural, harmonic and melodic minor in one position.',
      'Learn the first 8 bars of Sor’s Study in B minor (Op. 35 No. 22) and bring out the melody.',
      'Load a Segovia or Bream recording in Transcribe and copy the rubato in one phrase.'
    ]
  },

  fado: {
    id: 'fado', name: 'Portugal (fado)', places: 'Lisbon (Alfama, Mouraria, Bairro Alto) · Coimbra',
    summary: 'Fado is urban song from Lisbon about longing, fate and daily life, first heard in the 1820s–1840s. A singer is accompanied by the guitarra portuguesa, a pear-shaped 12-string cittern, and the viola, a Spanish-style guitar. Coimbra has its own fado, linked to the university.',
    concepts: ['Saudade: longing for something absent or lost', 'Guitarra plays fills and counter-melody; viola keeps the harmony and pulse', 'Fados tradicionais: old melodies such as Fado Menor, Corrido and Mouraria', 'Lisbon fado and Coimbra fado', 'Casas de fado: small houses where fado is sung', 'The singer leads the time and the players follow'],
    instruments: ['Guitarra portuguesa (Lisbon model)', 'Guitarra de Coimbra', 'Viola (Spanish guitar)', 'Viola baixo (acoustic bass)', 'Voice (fadista)'],
    rhythms: [], scales: ['harmmin', 'aeolian', 'major'],
    guitar: ['On the viola, play the bass on the beat and a light chord after it', 'Watch the singer: they stretch and pause the time', 'Learn the i–V7 of Fado Menor and the I–V7 of Fado Corrido', 'Try guitarra-style fills: a picked melody with fast tremolo on held notes'],
    listen: ['Amália Rodrigues', 'Carlos Paredes', 'Alfredo Marceneiro', 'Carlos do Carmo', 'Mariza', 'Camané', 'Ana Moura', 'Carminho'],
    facts: [
      { q: 'How many strings does the guitarra portuguesa have?', a: '12 (six pairs)', w: ['6', '10 (five pairs)', '4'] },
      { q: 'Saudade means roughly…', a: 'Longing for something absent or lost', w: ['Joy at a festival', 'A fast dance', 'A guitar tuning'] },
      { q: 'Who is called the “Queen of Fado”?', a: 'Amália Rodrigues', w: ['Cesária Évora', 'Mercedes Sosa', 'Fairuz'] },
      { q: 'Coimbra fado is linked to…', a: 'The university and its students', w: ['Fishing villages', 'Church choirs', 'Military bands'] },
      { q: 'Carlos Paredes was a master of the…', a: 'Guitarra portuguesa', w: ['Accordion', 'Viola baixo', 'Piano'] },
      { q: 'In which year did UNESCO list fado as Intangible Cultural Heritage?', a: '2011', w: ['1974', '1999', '2020'] }
    ],
    era: '1820s–today',
    history: [
      ['1820s–1840s', 'Fado appears in Lisbon’s poor neighborhoods, in taverns and among sailors and workers. Maria Severa (1820–1846) becomes the first famous fadista.'],
      ['Late 1800s', 'Fado reaches Coimbra, where university students make a more formal, serenade-like style.'],
      ['1920s–1930s', 'Fado moves into casas de fado, onto records and onto the radio. The Estado Novo dictatorship (1933–1974) censors lyrics and licenses performers.'],
      ['1940s–1960s', 'Amália Rodrigues takes fado to the world. From 1962 she works with composer Alain Oulman and sings great Portuguese poets.'],
      ['1967', 'Carlos Paredes releases “Guitarra Portuguesa” and makes the guitarra a solo concert instrument.'],
      ['1974', 'After the Carnation Revolution, fado is for a time seen as music of the old regime. José Afonso, from the Coimbra tradition, had sung “Grândola, Vila Morena”, the radio signal for the coup.'],
      ['1990s–today', 'Mariza, Camané, Ana Moura and Carminho lead a new generation, and UNESCO lists fado as Intangible Cultural Heritage in 2011.']
    ],
    substyles: [
      { name: 'Fados tradicionais', text: 'Old melodies and chord patterns, such as Fado Menor, Fado Corrido and Fado Mouraria, that singers set new poems to.' },
      { name: 'Fado-canção', text: 'Composed songs with their own melody and often a chorus, popular from the 1930s on.' },
      { name: 'Coimbra fado', text: 'Sung by students and graduates in black capes, often as serenades. The Coimbra guitarra is larger and tuned lower than the Lisbon one.' },
      { name: 'Fado vadio', text: 'Amateur fado: anyone may sing in a tavern, accompanied by the house players.' },
      { name: 'Guitarradas and solo guitarra', text: 'Instrumental pieces and variations for the guitarra, from Armandinho to Carlos Paredes.' }
    ],
    traits: {
      rhythm: 'Most fados are in 2/4 or 4/4, with the viola playing bass on the beat and a chord on the offbeat. The singer pulls the time around, and the players wait.',
      harmony: 'Harmony is simple, often just tonic and dominant: Fado Menor moves between i and V7, Fado Corrido between I and V7. Fado-canção adds IV, relative keys and passing chords.',
      melody: 'The singer ornaments freely, with slides and turns on long notes. The guitarra answers each line with fills in harmonic minor or major and plays tremolo on held notes.',
      form: 'Strophic: verses of 4, 5, 6 or 10 lines sung over a repeated melody. In traditional fado the same melody carries many different poems.',
      sound: 'Voice, guitarra portuguesa and viola, sometimes with a viola baixo. The steel-strung guitarra has a bright, bell-like ring and is picked with the thumb and index finger.'
    },
    essential: [
      { artist: 'Amália Rodrigues', work: 'Com Que Voz', year: 1970, kind: 'album', note: 'Amália singing poets over Alain Oulman’s melodies; follow the guitarra’s answers.' },
      { artist: 'Henri Verneuil (dir.)', work: 'Les Amants du Tage', year: 1955, kind: 'film', note: 'Amália sings “Barco Negro” in this film, which helped carry fado abroad.' },
      { artist: 'Carlos do Carmo', work: 'Um Homem na Cidade', year: 1977, kind: 'album', note: 'Lisbon portrayed in song, with a modern touch to the arrangements.' },
      { artist: 'Carlos Paredes', work: 'Guitarra Portuguesa', year: 1967, kind: 'album', note: 'Solo guitarra: driving rhythm, tremolo and long melodic lines.' },
      { artist: 'José Afonso', work: 'Cantigas do Maio', year: 1971, kind: 'album', note: 'A Coimbra-trained singer turning to protest song; includes “Grândola, Vila Morena”.' },
      { artist: 'Carlos Paredes and Charlie Haden', work: 'Dialogues', year: 1990, kind: 'album', note: 'Guitarra and double bass in quiet conversation.' },
      { artist: 'Mariza', work: 'Fado em Mim', year: 2001, kind: 'album', note: 'Traditional fados with a strong modern voice.' },
      { artist: 'Ana Moura', work: 'Para Além da Saudade', year: 2007, kind: 'album', note: 'Classic fado sound, close and warm.' },
      { artist: 'Carminho', work: 'Fado', year: 2009, kind: 'album', note: 'A young singer close to the casa de fado style.' },
      { artist: 'Carlos Saura (dir.)', work: 'Fados', year: 2007, kind: 'film', note: 'Many singers and players filmed in performance, old and new.' }
    ],
    players: [
      { name: 'Carlos Paredes', inst: 'guitarra portuguesa', why: 'Solo guitarra with a powerful right hand and long lines.' },
      { name: 'Armandinho', inst: 'guitarra portuguesa', why: 'Early 20th-century player who shaped Lisbon guitarra style.' },
      { name: 'Artur Paredes', inst: 'guitarra de Coimbra', why: 'Carlos’s father, who renewed the Coimbra guitarra and its playing.' },
      { name: 'José Fontes Rocha', inst: 'guitarra portuguesa', why: 'Amália’s guitarist for many years; listen to how he answers the voice.' },
      { name: 'Amália Rodrigues', inst: 'voice', why: 'Phrasing and timing: how a fadista bends the beat.' },
      { name: 'Alfredo Marceneiro', inst: 'voice', why: 'The older, rawer Lisbon style and its slow, free time.' },
      { name: 'Carlos do Carmo', inst: 'voice', why: 'Clear diction and a modern, urban fado.' }
    ],
    study: [
      { title: 'Fado and the Place of Longing', by: 'Richard Elliott', kind: 'book', note: 'Fado’s history, places and themes in English.' },
      { title: 'Museu do Fado', by: 'Lisbon (Alfama)', kind: 'museum', note: 'Instruments, recordings and history of fado in the neighborhood where it grew.' }
    ],
    listenFor: [
      'Separate the two guitars: who plays the bass and chords, who plays the fills?',
      'Hear how the guitarra waits for the singer, then answers.',
      'Listen for the tremolo on long guitarra notes.',
      'Decide if a fado is in a minor key (like Fado Menor) or a major key (like Fado Corrido).',
      'Notice when the singer slows down or pauses, and how the players follow.'
    ],
    practice: [
      'In the Repertoire gym, loop Am–E7 at a slow tempo with bass on the beat and a soft chord after it.',
      'Do the same in C–G7 for a Corrido feel, keeping the bass steady.',
      'In the Scale warm-up, play A harmonic minor and make short 2-bar fills that end on A.',
      'Practice tremolo on one string with the Metronome: 4, then 6 notes per beat.',
      'Load a Carlos Paredes track in Transcribe, slow it to 60% and learn one phrase on the top strings of your guitar.'
    ]
  },

  persian: {
    id: 'persian', name: 'Persia (Iran)', places: 'Tehran · Isfahan · Shiraz · Tabriz · the Iranian diaspora',
    summary: 'Persian classical music is learned through the radif, a large body of short melodies passed from teacher to student. The melodies are grouped into seven dastgahs and five avaz, and players improvise from them, often with a singer setting the poetry of Hafez, Rumi and Saadi.',
    concepts: ['Radif: the repertoire of melodies passed from teacher to student', 'Dastgah: one of seven modal systems', 'Avaz: five modes derived from Shur and Homayun; also unmetered singing', 'Gushe: a short melodic piece inside a dastgah', 'Koron (about a quarter tone flat) and sori (about a quarter tone sharp)', 'Shahed: the central “witness” note of a mode'],
    instruments: ['Tar', 'Setar', 'Kamancheh', 'Santur', 'Ney', 'Tombak', 'Daf'],
    rhythms: [], scales: ['shur', 'chahargah', 'phrygian', 'harmmin'],
    guitar: ['Use a fretless guitar, or add movable frets, for koron and sori notes', 'Copy the tar’s fast tremolo (riz) with quick, light alternate picking', 'Learn one gushe by ear and play it slowly over a drone', 'Shape phrases around the shahed and end on the resting note'],
    listen: ['Mohammad Reza Shajarian', 'Hossein Alizadeh', 'Mohammad Reza Lotfi', 'Jalil Shahnaz', 'Ahmad Ebadi', 'Kayhan Kalhor', 'Parviz Meshkatian'],
    facts: [
      { q: 'How many dastgahs are in the Persian radif?', a: '7', w: ['5', '12', '72'] },
      { q: 'A koron lowers a note by about…', a: 'A quarter tone', w: ['A whole tone', 'A minor 3rd', 'An octave'] },
      { q: 'A short melody inside a dastgah is called a…', a: 'Gushe', w: ['Tala', 'Palo', 'Jins'] },
      { q: 'Despite its name (“three strings”), the setar has…', a: '4 strings', w: ['3 strings', '6 strings', '12 strings'] },
      { q: 'The kamancheh is a…', a: 'Bowed spike fiddle', w: ['Hammered dulcimer', 'Goblet drum', 'Long-necked lute'] },
      { q: 'Who introduced the koron and sori signs?', a: 'Ali-Naqi Vaziri', w: ['Hafez', 'Mohammad Reza Shajarian', 'Kayhan Kalhor'] }
    ],
    era: '1800s–today (much older roots)',
    history: [
      ['600s', 'At the Sasanian court of Khosrow II, the musician Barbad is said to have made a melody for each day of the year.'],
      ['1800s', 'At the Qajar court in Tehran, the Farahani family, above all the brothers Mirza Abdollah and Mirza Hossein-Qoli, gather the melodies into the radif.'],
      ['1920s', 'Ali-Naqi Vaziri writes the music in notation, opens a music school, and creates the koron and sori signs for in-between notes.'],
      ['1956–1979', 'The radio program “Golha” broadcasts poetry with classical music across Iran and shapes a generation of listeners.'],
      ['1970s', 'A revival returns to the older radif teaching. Shajarian, Lotfi, Alizadeh and Meshkatian come to the fore, later with the Chavosh group.'],
      ['1979–1990s', 'After the revolution, public music is restricted for some years. Classical music slowly returns to concert halls, and many musicians also work abroad.'],
      ['2009–today', 'UNESCO lists the radif as Intangible Cultural Heritage in 2009. Kayhan Kalhor, Hossein Alizadeh and younger players perform worldwide, and Iranian guitarists adapt the music to fretless and microtonal guitars.']
    ],
    substyles: [
      { name: 'Avaz', text: 'Unmetered vocal improvisation on a poem, with the instrument answering each line. The singer’s tahrir, a yodel-like ornament, is a highlight.' },
      { name: 'Pishdaramad', text: 'A metered overture that introduces the dastgah, made popular by tar player Darvish Khan in the early 1900s.' },
      { name: 'Chaharmezrab', text: 'A fast, rhythmic instrumental piece over a repeated note or ostinato, showing off right-hand technique.' },
      { name: 'Tasnif', text: 'A composed, metered song, often on classical poetry, sung with the ensemble.' },
      { name: 'Reng', text: 'A light dance piece, usually in 6/8, that closes a performance.' }
    ],
    traits: {
      rhythm: 'Much of a performance is unmetered: the avaz follows the breath and the poem. Metered pieces use 2/4, 6/8 and other meters, often with the tombak.',
      harmony: 'There is no chord harmony. All players share one melody with small differences (heterophony), sometimes over an open drone string.',
      melody: 'Each mode has a central note (shahed), a resting note (ist) and signature gushes. Koron and sori notes sit between the piano keys, and the melody climbs through gushes before returning.',
      form: 'A performance moves through the gushes of one dastgah, from the opening daramad up to higher gushes and back down to a closing forud. A typical set: pishdaramad, chaharmezrab, avaz, tasnif, reng.',
      sound: 'Plucked tar and setar, bowed kamancheh, hammered santur and end-blown ney, with tombak and daf. Tremolo (riz) on strings and the singer’s tahrir are central ornaments.'
    },
    essential: [
      { artist: 'Mohammad Reza Shajarian and Parviz Meshkatian', work: 'Bidad', year: 1985, kind: 'album', note: 'Classic avaz and tasnif in Homayun; follow how the instruments answer the voice.' },
      { artist: 'Shajarian, Hossein Alizadeh, Kayhan Kalhor, Homayoun Shajarian', work: 'Faryad', year: 2002, kind: 'album', note: 'Tar, setar and kamancheh around one of Iran’s best-known voices.' },
      { artist: 'Ali Hatami (dir.), music by Hossein Alizadeh', work: 'Delshodegan', year: 1992, kind: 'film', note: 'A film about Qajar-era musicians; the score is full of tar and setar.' },
      { artist: 'Ghazal (Kayhan Kalhor and Shujaat Husain Khan)', work: 'Lost Songs of the Silk Road', year: 1997, kind: 'album', note: 'Kamancheh and sitar improvise together: hear dastgah and raga meet.' },
      { artist: 'Kayhan Kalhor', work: 'Scattering Stars Like Dust', year: 1998, kind: 'album', note: 'Kamancheh with a small ensemble, moving through modes.' },
      { artist: 'Ghazal', work: 'The Rain', year: 2003, kind: 'album', note: 'Long live improvisations built from short motifs.' },
      { artist: 'Kayhan Kalhor and Erdal Erzincan', work: 'The Wind', year: 2006, kind: 'album', note: 'Kamancheh and Turkish bağlama find shared modes.' },
      { artist: 'Kayhan Kalhor and Brooklyn Rider', work: 'Silent City', year: 2008, kind: 'album', note: 'Persian modal playing with a string quartet.' }
    ],
    players: [
      { name: 'Mohammad Reza Lotfi', inst: 'tar, setar', why: 'Strong right hand and deep radif knowledge; a leader of the 1970s revival.' },
      { name: 'Hossein Alizadeh', inst: 'tar, setar', why: 'Composer and improviser; hear how he builds and develops a gushe.' },
      { name: 'Jalil Shahnaz', inst: 'tar', why: 'A singing tone and expressive ornaments.' },
      { name: 'Ahmad Ebadi', inst: 'setar', why: 'A quiet, intimate setar style from the radio era.' },
      { name: 'Ali-Naqi Vaziri', inst: 'tar, teacher', why: 'Wrote the music down and created the koron and sori signs.' },
      { name: 'Kayhan Kalhor', inst: 'kamancheh', why: 'Long, breathing improvisations that move through a mode.' },
      { name: 'Parviz Meshkatian', inst: 'santur', why: 'Composer and santur player who wrote classic tasnifs and instrumental pieces.' },
      { name: 'Mohammad Reza Shajarian', inst: 'voice', why: 'Phrasing: how a line rises, holds and falls. Play along with the voice.' }
    ],
    study: [
      { title: 'The Dastgah Concept in Persian Music', by: 'Hormoz Farhat', kind: 'book', note: 'A clear guide to the dastgahs, their intervals and gushes.' },
      { title: 'The Radif of Persian Music: Studies of Structure and Cultural Context', by: 'Bruno Nettl', kind: 'book', note: 'How the radif is built, taught and used for improvisation.' },
      { title: 'Classical Persian Music: An Introduction', by: 'Ella Zonis', kind: 'book', note: 'An older but readable introduction to the system and its instruments.' }
    ],
    listenFor: [
      'Find the shahed: the note the melody keeps returning to.',
      'Listen for koron notes that sound between two piano keys.',
      'Hear the instrument repeat or answer the singer’s line in the avaz.',
      'Notice when the music shifts from free time to a steady meter.',
      'Listen for the tar’s fast tremolo on long notes.'
    ],
    practice: [
      'In the Drone & scale explorer, play Shur over a drone and bend the koron 2nd slowly until it sits in tune.',
      'Pick one note as shahed and improvise short phrases that circle around it and end there.',
      'Practice riz (tremolo) on one string with the Metronome, slowly raising the speed.',
      'Use Call & response: answer each phrase without chords, one note at a time.',
      'Load a Shajarian avaz in Transcribe, slow it down, and follow the voice on one string.'
    ]
  },

  hawaii: {
    id: 'hawaii', name: 'Hawaiian slack key & steel', places: 'Oʻahu · Maui · Hawaiʻi Island · Kauaʻi',
    summary: 'Slack key guitar, kī hōʻalu, means “loosen the key”: Hawaiian players retune the strings to open chords and fingerpick a bass with the thumb under a melody. Joseph Kekuku developed the steel guitar in the 1880s by sliding a metal bar on the strings, and that sound spread around the world.',
    concepts: ['Kī hōʻalu: open tunings “loosened” from standard', 'Taro Patch: open G (D G D G B D)', 'Alternating thumb bass with melody on the high strings', 'Hammer-ons, pull-offs and harmonics (“chimes”)', 'Steel guitar: a bar sliding on strings, played flat on the lap', 'The vamp: a short turnaround between verses'],
    instruments: ['Slack key guitar', 'Lap steel guitar', 'ʻUkulele', 'Upright bass', 'Ipu (gourd drum)', 'Voice'],
    rhythms: [], scales: ['major', 'majpent'],
    guitar: ['Tune to Taro Patch: lower the 6th, 5th and 1st strings a whole step to D G D G B D', 'Keep the thumb alternating on the low strings while the fingers play the melody', 'Add hammer-ons and pull-offs from the open strings', 'Play chimes (harmonics) at the 12th, 7th and 5th frets'],
    listen: ['Gabby Pahinui', 'Sonny Chillingworth', 'Leonard Kwan', 'Ray Kāne', 'Keola Beamer', 'Ledward Kaapana', 'Cyril Pahinui', 'Sol Hoʻopiʻi'],
    facts: [
      { q: 'Kī hōʻalu means…', a: 'Loosen the key (the tuning pegs)', w: ['Sliding bar', 'Dance of the islands', 'High voice'] },
      { q: 'Taro Patch tuning is…', a: 'Open G: D G D G B D', w: ['Open D: D A D F♯ A D', 'DADGAD', 'Standard: E A D G B E'] },
      { q: 'Who is credited with developing the Hawaiian steel guitar?', a: 'Joseph Kekuku', w: ['Gabby Pahinui', 'Israel Kamakawiwoʻole', 'Ledward Kaapana'] },
      { q: 'The guitar first came to Hawaiʻi with…', a: 'Mexican and Spanish cowboys (vaqueros)', w: ['British missionaries', 'Japanese plantation workers', 'American soldiers in World War II'] },
      { q: 'In slack key, “chimes” are…', a: 'Harmonics', w: ['Bells in the band', 'Fast strums', 'Bar slides'] },
      { q: 'The steel guitar is played with…', a: 'A metal bar sliding on the strings', w: ['A bow', 'Mallets', 'Only open strings'] }
    ],
    era: '1830s–today',
    history: [
      ['1830s', 'King Kamehameha III brings Mexican and Spanish vaqueros to work cattle. They bring guitars, and Hawaiians start retuning them to suit their own songs.'],
      ['1880s', 'Joseph Kekuku, a schoolboy on Oʻahu, develops the steel guitar by sliding a metal bar along the strings.'],
      ['1915', 'Hawaiian music is a hit at the Panama–Pacific International Exposition in San Francisco, and a Hawaiian craze sweeps the USA.'],
      ['1920s–1930s', 'Steel players such as Sol Hoʻopiʻi record widely, and the steel sound passes into country, blues and Western swing.'],
      ['1940s', 'Gabby Pahinui records “Hiʻilawe”, often named the first commercial slack key recording.'],
      ['1970s', 'The Hawaiian Renaissance revives language, hula and music; Gabby Pahinui and younger players bring slack key to a new audience.'],
      ['1990s–today', 'George Winston’s Dancing Cat label records many slack key players. A slack key collection wins the first Grammy for Best Hawaiian Music Album in 2005.']
    ],
    substyles: [
      { name: 'Solo slack key', text: 'One guitar in an open tuning playing bass, harmony and melody, often in a family’s own tuning passed down privately.' },
      { name: 'Slack key in a band', text: 'Several guitars in different tunings with bass, ʻukulele and voices, as in the Gabby Pahinui Hawaiian Band.' },
      { name: 'Hawaiian steel guitar', text: 'Lap steel with a bar: smooth glides, bar slants for harmony and wide vibrato. It led to the pedal steel of country music.' },
      { name: 'Hapa haole songs', text: 'Hawaiian-style songs with English lyrics, popular from the 1910s to the 1950s and full of steel guitar.' },
      { name: 'Leo kiʻekiʻe (falsetto)', text: 'Hawaiian falsetto singing with breaks between voice registers, often accompanied by slack key.' }
    ],
    traits: {
      rhythm: 'Most pieces are in 2/4 or 4/4 at an easy pace, with a steady alternating bass. Waltzes in 3/4 are common, and hula songs follow the dancers.',
      harmony: 'Major-key harmony with I, IV and V7, and a vamp (II7–V7–I) that closes each verse. Open tunings let open strings ring under the chords.',
      melody: 'Melodies sit on the top strings in major and major pentatonic, decorated with hammer-ons, pull-offs, slides and harmonics. Falsetto singing shapes the phrasing.',
      form: 'Songs are strophic, with a vamp between verses. The last verse, the haʻina, sums up the song.',
      sound: 'Acoustic guitar in open tunings, fingerpicked with bare fingers or a thumbpick. Steel guitar adds glides and vibrato; ʻukulele and upright bass round out a band.'
    },
    essential: [
      { artist: 'Gabby Pahinui', work: 'Gabby', year: 1972, kind: 'album', note: 'Warm slack key and voice: the place to start.' },
      { artist: 'The Gabby Pahinui Hawaiian Band', work: 'The Gabby Pahinui Hawaiian Band, Vol. 1', year: 1975, kind: 'album', note: 'Several guitars in different tunings weaving together.' },
      { artist: 'Ry Cooder', work: 'Chicken Skin Music', year: 1976, kind: 'album', note: 'Includes Gabby Pahinui and Atta Isaacs; hear slack key next to blues and Tex-Mex.' },
      { artist: 'Ray Kāne', work: 'Punahele', year: 1994, kind: 'album', note: 'Slow, deep, old-style solo slack key.' },
      { artist: 'Sonny Chillingworth', work: 'Sonny Solo', year: 1994, kind: 'album', note: 'Strong rhythm and bright tone from one guitar.' },
      { artist: 'Israel Kamakawiwoʻole', work: 'Facing Future', year: 1993, kind: 'album', note: 'ʻUkulele and voice; hear the Hawaiian vamp and feel.' },
      { artist: 'Alexander Payne (dir.)', work: 'The Descendants', year: 2011, kind: 'film', note: 'The soundtrack is almost all Hawaiian music, with many slack key players.' }
    ],
    players: [
      { name: 'Gabby Pahinui', inst: 'slack key guitar, steel guitar, voice', why: 'Warm, swinging slack key and some of the first slack key records.' },
      { name: 'Sonny Chillingworth', inst: 'slack key guitar', why: 'Driving rhythm and a bright, strong tone.' },
      { name: 'Ray Kāne', inst: 'slack key guitar', why: 'Simple, deep, unhurried playing in old-style tunings.' },
      { name: 'Leonard Kwan', inst: 'slack key guitar', why: 'Clear melodies across many tunings, and his own slack key compositions.' },
      { name: 'Keola Beamer', inst: 'slack key guitar', why: 'A gentle, composed style; he has also taught slack key widely.' },
      { name: 'Ledward Kaapana', inst: 'slack key guitar', why: 'Fast, playful technique and bright harmonics.' },
      { name: 'Sol Hoʻopiʻi', inst: 'steel guitar', why: 'Jazz-tinged steel that spread the sound in the 1920s and 1930s.' },
      { name: 'Jerry Byrd', inst: 'steel guitar', why: 'Clean, precise lap steel; he moved to Hawaiʻi and taught a new generation of players.' }
    ],
    study: [
      { title: 'Hawaiian Music and Musicians: An Encyclopedic History', by: 'George S. Kanahele (ed.)', kind: 'book', note: 'The reference work on Hawaiian music, people and styles.' },
      { title: 'Kika Kila: How the Hawaiian Steel Guitar Changed the Sound of Modern Music', by: 'John W. Troutman', kind: 'book', note: 'The history of the steel guitar and the Hawaiian players behind it.' },
      { title: 'The Hawaiian Steel Guitar and Its Great Hawaiian Musicians', by: 'Lorene Ruymar', kind: 'book', note: 'Players, tunings and techniques of the steel guitar.' }
    ],
    listenFor: [
      'Follow the thumb: is the bass alternating, or does it stay on one note?',
      'Hear the open strings ringing under the melody.',
      'Listen for the vamp at the end of each verse.',
      'Spot the harmonics (chimes) and where they fall in the phrase.',
      'On steel guitar, notice how the bar slides into notes from below.'
    ],
    practice: [
      'Tune to Taro Patch (D G D G B D) and play the open G, then barre the 5th fret for C and the 7th for D.',
      'Play alternating bass on strings 6 and 4 with the Metronome at 70, then add melody on strings 1–2.',
      'Add hammer-ons from the open 2nd and 3rd strings to the 2nd fret, in time.',
      'Play chimes at the 12th, 7th and 5th frets and fit them at the end of a phrase.',
      'Load a Gabby Pahinui or Ray Kāne track in Transcribe, slow it to 70% and copy one vamp.'
    ]
  }
};
