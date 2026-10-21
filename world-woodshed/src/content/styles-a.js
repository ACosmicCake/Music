/* World Woodshed — style deep-dives: Caribbean, Brazil, Spain, India, the Arab world, Turkey & the Balkans, West Africa */
export default {
  cuba: {
    era: '1870s–today',
    history: [
      ['1879', 'Miguel Faílde’s orchestra plays “Las alturas de Simpson” in Matanzas, usually named as the first danzón.'],
      ['1880s–1900s', 'After slavery ends in 1886, rumba (yambú, guaguancó, columbia) takes shape in the Afro-Cuban neighbourhoods and docks of Havana and Matanzas.'],
      ['1910s–1920s', 'Son travels from Oriente in the east to Havana. Groups like Sexteto Habanero and Ignacio Piñeiro’s Septeto Nacional (1927) make it the national sound.'],
      ['1940s', 'Arsenio Rodríguez adds conga, piano and trumpets to the son group and stretches the montuno section. In New York, Machito and Mario Bauzá start Afro-Cuban jazz.'],
      ['1950s', 'Mambo (Pérez Prado) and chachachá (Enrique Jorrín, Orquesta Aragón) spread worldwide, and Benny Moré leads his Banda Gigante in Havana.'],
      ['1960s–1970s', 'In New York, Puerto Rican and Cuban musicians at Fania Records sell their son-based music as salsa. In Havana, Los Van Van (1969) create songo.'],
      ['1990s', 'Timba, led by NG La Banda, fills Havana dance halls. Buena Vista Social Club (1997) brings older son musicians a world audience.']
    ],
    substyles: [
      { name: 'Son montuno', text: 'The core Cuban song form: a verse section, then a long montuno where coro and lead singer trade lines over a looping tres guajeo and anticipated bass.' },
      { name: 'Rumba', text: 'Drums, claves, sticks and voices only. Guaguancó is a couple dance in 4 with rumba clave; columbia is a fast men’s solo dance in 6/8.' },
      { name: 'Danzón and chachachá', text: 'Elegant dances for charanga bands of flute, violins and piano. Chachachá slows the beat down and gives it a steady güiro scrape and the “cha-cha-chá” step.' },
      { name: 'Trova and bolero', text: 'Singer-guitarists from Santiago de Cuba, often in duos with a second voice. Bolero is the slow romantic song, with rich chords and a gentle 4/4.' },
      { name: 'Salsa', text: 'Son and mambo arranged for trombones and trumpets in 1960s–70s New York and Puerto Rico, with harder piano montunos and the timbales cowbell.' },
      { name: 'Bachata', text: 'Guitar music from the Dominican Republic: a picked requinto lead, a rhythm guitar playing arpeggios, bass and bongó in a quick 4/4.' }
    ],
    traits: {
      rhythm: 'Every part locks to the two-bar clave without always playing it. The bass skips beat 1 and anticipates the next chord, so the music feels like it is always leaning forward.',
      harmony: 'Simple and repetitive on purpose: I–IV–V–IV vamps in major, i–iv–V in minor, and ii–V turnarounds in boleros. The montuno often loops one or two chords for minutes.',
      melody: 'The lead singer (sonero) improvises short lines (pregones) between a fixed coro. Tres and piano guajeos are short, syncopated and often doubled in octaves or thirds.',
      form: 'A song opens with the verse (the largo), then switches to the montuno: coro–pregón exchanges, horn riffs called mambos, solos, and a tight ending.',
      sound: 'A son conjunto is tres, guitar, bass, bongó, conga, piano, trumpets and voices. Salsa adds trombones and timbales; rumba strips it back to three congas, sticks, clave and singers.'
    },
    essential: [
      { artist: 'Buena Vista Social Club', work: 'Buena Vista Social Club', year: 1997, kind: 'album', note: 'Start with “Chan Chan”: four chords (Dm–F–Gm–A), a guitar riff and clave you can feel from the first bar.' },
      { artist: 'Trío Matamoros', work: 'Son de la loma', year: 1928, kind: 'track', note: 'Early son from Santiago: two voices, two guitars and maracas, with the guitar carrying both bass and rhythm.' },
      { artist: 'Orquesta Casino de la Playa', work: 'Bruca maniguá', year: 1937, kind: 'track', note: 'Arsenio Rodríguez’s song sung by Miguelito Valdés; hear the son clave under a slow, heavy minor groove.' },
      { artist: 'Los Muñequitos de Matanzas', work: 'Los muñequitos', year: 1956, kind: 'track', note: 'Guaguancó from Matanzas (the group was then Guaguancó Matancero): three congas, sticks and a lead singer.' },
      { artist: 'Cachao', work: 'Descargas: Cuban Jam Session in Miniature', year: 1957, kind: 'album', note: 'Short jam sessions built on the bass tumbao; follow the bass line and the way soloists enter over it.' },
      { artist: 'Eddie Palmieri', work: 'Azúcar pa’ ti', year: 1965, kind: 'album', note: 'The track “Azúcar” rides one long piano montuno; learn its pattern before you learn any tres guajeo.' },
      { artist: 'Celia Cruz & Johnny Pacheco', work: 'Celia & Johnny', year: 1974, kind: 'album', note: 'Salsa built on son: hear the coro–pregón exchange between Celia Cruz and the chorus on “Quimbara”.' },
      { artist: 'Willie Colón & Rubén Blades', work: 'Siembra', year: 1978, kind: 'album', note: 'Story songs over trombone-heavy salsa; notice how the horn mambos punctuate each coro section.' },
      { artist: 'Juan Luis Guerra y 4.40', work: 'Bachata Rosa', year: 1990, kind: 'album', note: 'Dominican bachata and merengue with a polished sound; follow the picked guitar figures under the voice.' },
      { artist: 'Los Van Van', work: 'Llegó… Van Van', year: 1999, kind: 'album', note: 'Songo and timba from Havana: the bass and drums break the clave pattern up in new ways.' }
    ],
    players: [
      { name: 'Arsenio Rodríguez', inst: 'tres', why: 'The source of the modern tres style: short, percussive guajeos that lock to clave and leave room for the bass.' },
      { name: 'Compay Segundo', inst: 'armónico (7-string guitar), voice', why: 'Shows how a simple chord-and-riff part, played with perfect timing, holds a whole son together.' },
      { name: 'Eliades Ochoa', inst: 'guitar, voice', why: 'Strummed and picked son and guajira from Oriente; study his right hand for accents that sit around the clave.' },
      { name: 'Pancho Amat', inst: 'tres', why: 'Modern tres player who mixes traditional guajeos with jazz harmony and fast single-note lines.' },
      { name: 'Yomo Toro', inst: 'Puerto Rican cuatro', why: 'Brought the jíbaro cuatro into Fania-era salsa; his bright, fast lines translate well to the top strings of a guitar.' },
      { name: 'Israel “Cachao” López', inst: 'double bass', why: 'Learn the anticipated bass tumbao from him; it is what guitarists most often get wrong in this music.' },
      { name: 'Eddie Palmieri', inst: 'piano', why: 'His montunos show how a two-bar pattern can drive a band; many guitar guajeos copy piano parts like his.' },
      { name: 'Benny Moré', inst: 'voice, bandleader', why: 'A model sonero: listen to how he places improvised lines against the coro and the clave.' }
    ],
    study: [
      { title: 'The Salsa Guidebook for Piano and Ensemble', by: 'Rebeca Mauleón', kind: 'method', note: 'Clear explanations of clave, montunos, tumbaos and how a salsa arrangement fits together.' },
      { title: 'Cuba and Its Music: From the First Drums to the Mambo', by: 'Ned Sublette', kind: 'book', note: 'A detailed history of how African and Spanish music met in Cuba, up to the 1950s.' },
      { title: 'The Latin Real Book', by: 'Sher Music Co.', kind: 'book', note: 'Lead sheets for salsa, son, Latin jazz and Brazilian tunes, with authentic arrangements.' },
      { title: 'Buena Vista Social Club', by: 'Wim Wenders (1999)', kind: 'film', note: 'Documentary on the musicians behind the 1997 album, with long performance scenes.' }
    ],
    listenFor: [
      'Clap clave along with “Chan Chan” and notice that the guitar riff and bass never fight it.',
      'Find the moment a song switches from verse to montuno: the coro starts repeating and the band locks into one loop.',
      'Follow the bass for 16 bars and count how few times it plays on beat 1.',
      'In guaguancó, separate the three congas: two keep a steady conversation while the high quinto improvises against them.',
      'In a salsa track, listen for the horn mambo that appears between coro sections and build-ups.'
    ],
    practice: [
      'Loop son clave 3-2 in the Rhythm atlas and clap it while counting 1–8, then switch to 2-3 without stopping.',
      'Strum Chan Chan (Dm–F–Gm–A7) with a muted strum on every eighth and accents on the “and” of 2 and on 4.',
      'Load the Son montuno vamp in the Repertoire gym and play a two-bar guajeo in octaves on strings 1 and 3, checking it against the clave.',
      'Play the bass tumbao on the low strings (the “and” of 2 and beat 4) over the same vamp, then switch between bass and guajeo every 8 bars.',
      'Open a Buena Vista tres solo in Transcribe at 70% and learn one phrase built from octaves and thirds.'
    ]
  },

  brazil: {
    era: '1870s–today',
    history: [
      ['1870s', 'In Rio, musicians around flautist Joaquim Callado play European polkas and waltzes with an Afro-Brazilian swing on flute, guitar and cavaquinho: choro begins.'],
      ['1916–1917', '“Pelo telefone”, credited to Donga, is registered and recorded as a samba and becomes the first samba hit.'],
      ['1928–1930s', 'The first escolas de samba form in Rio’s hillside neighbourhoods, and radio and singers like Carmen Miranda make samba the national sound.'],
      ['1940s', 'Luiz Gonzaga takes baião, the accordion, zabumba and triangle music of the Northeast, onto national radio with “Asa branca” (1947).'],
      ['1958–1959', 'João Gilberto records “Chega de saudade” with Tom Jobim’s arrangement. His quiet voice and new guitar beat start bossa nova.'],
      ['1967–1968', 'Tropicália (Caetano Veloso, Gilberto Gil, Os Mutantes) brings electric guitars and rock into Brazilian song, under a military government that later exiles Gil and Veloso.'],
      ['1970s–today', 'Paulinho da Viola and Cartola keep samba’s roots alive, Raphael Rabello reshapes the 7-string guitar, and Yamandu Costa and Hamilton de Holanda push choro further.']
    ],
    substyles: [
      { name: 'Samba', text: 'Rio’s Afro-Brazilian song and dance in 2/4, from street batucadas to the lighter samba-canção and the backyard partido-alto and pagode.' },
      { name: 'Choro', text: 'Instrumental music for a small group (regional) of flute or bandolim, cavaquinho, 6- and 7-string guitar and pandeiro. Fast, virtuosic and full of chromatic runs.' },
      { name: 'Bossa nova', text: 'Samba slowed down and made intimate: one voice, nylon guitar and jazz chords. The guitar plays the whole drum section with thumb and fingers.' },
      { name: 'Baião and forró', text: 'Dance music from the Northeast for accordion, zabumba (bass drum) and triangle, with melodies that use the raised 4th and flat 7th.' },
      { name: 'Afro-Bahian styles', text: 'From Salvador: samba de roda, the ijexá rhythm of the afoxé groups, and the big drum blocos of carnival.' },
      { name: 'MPB and Tropicália', text: 'Música popular brasileira: singer-songwriters from the late 1960s on who mix samba, bossa, rock and regional forms.' }
    ],
    traits: {
      rhythm: 'Most styles are felt in 2 with a sixteenth-note grid. In samba the low surdo answers on beat 2, and the tamborim, cavaquinho and guitar play syncopated figures that tie across the bar line.',
      harmony: 'Choro moves through secondary dominants and diminished passing chords. Bossa nova uses jazz voicings (maj7, m7, 7♭9, 6/9) and moves one inner voice at a time, often chromatically.',
      melody: 'Long, lyrical lines float over the syncopation. Choro melodies run in fast arpeggios with chromatic approach notes; Northeastern tunes lean on the ♯4 and ♭7.',
      form: 'Choro is a rondo (AA BB A CC A). Sambas alternate verse and a refrain that everyone sings; bossa songs follow 32-bar or freer song forms.',
      sound: 'Nylon-string guitar is the centre: alone in bossa, paired with a 7-string guitar in choro. Pandeiro, cavaquinho and surdo give samba its lift; accordion leads the Northeast.'
    },
    essential: [
      { artist: 'João Gilberto', work: 'Chega de saudade', year: 1959, kind: 'album', note: 'Start here: hear the guitar alone and notice the thumb never stops while the chords move around it.' },
      { artist: 'Stan Getz & João Gilberto', work: 'Getz/Gilberto', year: 1964, kind: 'album', note: 'Bossa with jazz musicians; Jobim on piano and João on guitar show how little the guitar needs to play.' },
      { artist: 'Elis Regina & Antônio Carlos Jobim', work: 'Elis & Tom', year: 1974, kind: 'album', note: 'Jobim songs with a full band; follow the chord movement on “Águas de março” and “Corcovado”.' },
      { artist: 'Cartola', work: 'Cartola', year: 1976, kind: 'album', note: 'Samba from the Mangueira hill with a regional backing; listen for the 7-string guitar answering the voice.' },
      { artist: 'Jacob do Bandolim & Época de Ouro', work: 'Vibrações', year: 1967, kind: 'album', note: 'Choro played tight: bandolim melody, cavaquinho chords, and a 7-string guitar weaving bass lines.' },
      { artist: 'Luiz Gonzaga', work: 'Asa branca', year: 1947, kind: 'track', note: 'The anthem of the Northeast; hear accordion, zabumba and triangle play the baião pattern.' },
      { artist: 'Baden Powell & Vinicius de Moraes', work: 'Os Afro-sambas', year: 1966, kind: 'album', note: 'Baden’s guitar takes rhythms from Bahian Candomblé and capoeira; the right hand is strong and percussive.' },
      { artist: 'Jorge Ben', work: 'Samba esquema novo', year: 1963, kind: 'album', note: 'A choppy, strummed samba guitar style quite unlike bossa; “Mas que nada” is the best-known track.' },
      { artist: 'Caetano Veloso, Gilberto Gil, Gal Costa, Os Mutantes and others', work: 'Tropicália ou Panis et Circencis', year: 1968, kind: 'album', note: 'Brazilian rhythms meet psychedelic rock and orchestral collage.' },
      { artist: 'Milton Nascimento & Lô Borges', work: 'Clube da Esquina', year: 1972, kind: 'album', note: 'Music from Minas Gerais with open, ringing guitar chords and unusual progressions; Toninho Horta and Beto Guedes play guitar.' },
      { artist: 'Egberto Gismonti', work: 'Dança das cabeças', year: 1977, kind: 'album', note: 'Guitar, piano and Naná Vasconcelos’s percussion and berimbau, ranging from choro runs to forest soundscapes.' }
    ],
    players: [
      { name: 'Baden Powell', inst: 'violão', why: 'A strong, percussive right hand that mixes samba, Afro-Bahian rhythm and classical technique.' },
      { name: 'João Gilberto', inst: 'violão, voice', why: 'The bossa batida: study how he places each chord around the steady thumb and his voice.' },
      { name: 'Dino 7 Cordas', inst: '7-string guitar', why: 'Defined the baixaria, the walking counter-lines of the 7-string guitar in choro and samba.' },
      { name: 'Raphael Rabello', inst: '6- and 7-string guitar', why: 'Took the 7-string guitar into solo virtuoso playing; clean scale runs and full arrangements.' },
      { name: 'Yamandu Costa', inst: '7-string guitar', why: 'A modern player who adds southern Brazilian and Argentine folk styles to choro.' },
      { name: 'Toninho Horta', inst: 'guitar', why: 'Rich chord voicings and harmony from Minas Gerais; great for learning how to move inner voices.' },
      { name: 'Jacob do Bandolim', inst: 'bandolim', why: 'Precise choro melody playing; his tunes are standard repertoire to learn on guitar.' },
      { name: 'Waldir Azevedo', inst: 'cavaquinho', why: 'Wrote “Brasileirinho” (1949); his fast, bright lines are good picking studies.' }
    ],
    study: [
      { title: 'The Brazilian Guitar Book', by: 'Nelson Faria', kind: 'method', note: 'Right-hand patterns for samba, bossa, baião and more, with chord voicings and recordings.' },
      { title: 'The Brazilian Sound: Samba, Bossa Nova, and the Popular Music of Brazil', by: 'Chris McGowan & Ricardo Pessanha', kind: 'book', note: 'A readable overview of styles, regions and key artists.' },
      { title: 'Bossa Nova: The Story of the Brazilian Music That Seduced the World', by: 'Ruy Castro', kind: 'book', note: 'The people and Rio scene around João Gilberto and Jobim.' },
      { title: 'Brasileirinho', by: 'Mika Kaurismäki (2005)', kind: 'film', note: 'A documentary about choro, full of rodas and performances.' }
    ],
    listenFor: [
      'On “Chega de saudade”, separate João’s thumb (steady bass) from his fingers (offbeat chord plucks).',
      'In a samba, find the deep surdo note on beat 2 and feel each bar as light–HEAVY.',
      'In a choro, follow the 7-string guitar: it answers the melody with bass runs at the ends of phrases.',
      'In “Asa branca”, hear the triangle keep sixteenths while the zabumba plays the baião bass pattern.',
      'Count the sections of a choro and notice each time the A section returns.'
    ],
    practice: [
      'Work up the Bossa nova right hand in the Technique ladders: thumb on 1 and 3, then add the finger syncopation.',
      'Loop the Bossa vamp in D minor in the Repertoire gym with Dm9, Em7♭5 and A7♭9 voicings, keeping the top note close as the chords change.',
      'Loop the samba rhythm in the Rhythm atlas and play a partido-alto pattern: thumb on each beat (heavier on 2), fingers on the syncopations.',
      'Over a drone in the Drone & scale explorer, improvise a baião line in Lydian dominant, leaning on the ♯4 and ♭7.',
      'Learn the A section of “Brasileirinho” slowly with the Metronome on beat 2, then add a simple 7-string-style bass line between phrases.'
    ]
  },

  flamenco: {
    era: '1840s–today',
    history: [
      ['1400s–1700s', 'Gitanos (Spanish Roma) settle in Andalusia from the 1400s, living alongside Morisco, Jewish-converso and Andalusian communities. Their songs and dances mix over centuries.'],
      ['1860s–1900s', 'Cafés cantantes in Seville, Jerez and Cádiz, such as Silverio Franconetti’s, give flamenco a paid stage and fix many of the palos.'],
      ['1922', 'Manuel de Falla and Federico García Lorca organise the Concurso de Cante Jondo in Granada to protect older “deep song”.'],
      ['1920s–1950s', 'Ramón Montoya and Niño Ricardo make the guitar a solo voice, while popular ópera flamenca shows favour lighter fandangos.'],
      ['1950s–1960s', 'Sabicas and Mario Escudero take concert flamenco guitar to New York, and singer Antonio Mairena leads a revival of older Gitano cante.'],
      ['1970s', 'Paco de Lucía’s rumba “Entre dos aguas” (1973) is a hit. With Camarón de la Isla he records “La leyenda del tiempo” (1979), adding bass, rock and jazz.'],
      ['1980s–today', 'Nuevo flamenco: Ketama, Tomatito, Vicente Amigo and Gerardo Núñez. The cajón joins the band, and Rosalía later brings palos into pop.']
    ],
    substyles: [
      { name: 'Soleá', text: 'Slow and serious, in a 12-count compás. Often called the mother of many palos; guitarists play it “por arriba”, in E Phrygian.' },
      { name: 'Bulerías', text: 'Fast, playful 12-count from Jerez, felt as starting on 12. Full of breaks, jokes and sudden stops; the hardest compás to feel.' },
      { name: 'Alegrías', text: 'A cheerful 12-count palo from Cádiz in a major key (often E or A), with the same accents as soleá.' },
      { name: 'Seguiriya', text: 'The darkest palo, a lament. Its five uneven beats (2+2+3+3+2) are played “por medio”, in A Phrygian.' },
      { name: 'Tangos and rumba', text: 'Palos in 4. Tangos come from Seville, Cádiz and Granada; rumba flamenca has Cuban roots and became the popular face of flamenco.' },
      { name: 'Fandangos and free palos', text: 'Fandangos de Huelva are in 3 with a strong beat. Malagueñas, tarantas and granaínas are sung in free time over a strummed guitar.' }
    ],
    traits: {
      rhythm: 'Most palos use a 12-count cycle with fixed accents; seguiriya shortens it into 2+2+3+3+2, and tangos and rumba are in 4. Palmas and footwork fill in counts the guitar leaves out.',
      harmony: 'Home is a Phrygian cadence. “Por arriba” runs Am–G–F–E with open strings ringing, “por medio” runs Dm–C–B♭–A, and major palos swing between I and V7.',
      melody: 'Cante is melismatic, with small steps, slides and pitches between the frets. Guitar falsetas use the Phrygian dominant colour, a major third over the tonic chord, and fast picado runs.',
      form: 'A performance strings together falsetas (composed guitar passages), letras (sung verses) and remates (closing phrases), all inside the compás. Llamadas call the singer or dancer in.',
      sound: 'The flamenco guitar is lighter than a classical guitar, with low action, a bright attack and a golpeador (tap plate). Add voice, palmas, jaleo (shouts), footwork and, since the late 1970s, cajón.'
    },
    essential: [
      { artist: 'Paco de Lucía', work: 'Entre dos aguas', year: 1973, kind: 'track', note: 'Start here: a rumba in 4 with bass and bongos, so the groove is easy to follow while the guitar improvises.' },
      { artist: 'Carlos Saura', work: 'Flamenco', year: 1995, kind: 'film', note: 'A tour of the palos filmed on a bare stage with many masters; use it to hear and see each compás.' },
      { artist: 'Paco de Lucía', work: 'Almoraima', year: 1976, kind: 'album', note: 'Solo guitar across many palos; hear how each piece keeps its own compás and mood.' },
      { artist: 'Camarón de la Isla', work: 'La leyenda del tiempo', year: 1979, kind: 'album', note: 'Cante with electric bass, sitar and rock drums; Tomatito and others play guitar around Camarón’s voice.' },
      { artist: 'Paco de Lucía', work: 'Siroco', year: 1987, kind: 'album', note: 'Solo guitar at its most focused; pick one track and count the 12-beat compás through it.' },
      { artist: 'Manolo Sanlúcar', work: 'Tauromagia', year: 1988, kind: 'album', note: 'Composed suites for flamenco guitar and ensemble, with rich harmony beyond the basic cadence.' },
      { artist: 'Camarón de la Isla', work: 'Soy gitano', year: 1989, kind: 'album', note: 'Tomatito accompanies; study how the guitar keeps to simple compás while the voice sings and fills between lines.' },
      { artist: 'Vicente Amigo', work: 'De mi corazón al aire', year: 1991, kind: 'album', note: 'Melodic, lyrical solo guitar; good for hearing how falsetas are shaped like sung phrases.' },
      { artist: 'Tomatito & Michel Camilo', work: 'Spain', year: 2000, kind: 'album', note: 'Flamenco guitar with jazz piano; hear Tomatito keep the flamenco phrasing over jazz chords.' },
      { artist: 'Paco de Lucía', work: 'Cositas buenas', year: 2004, kind: 'album', note: 'Late Paco with cante, palmas and cajón; the bulerías show the modern band sound.' },
      { artist: 'Rosalía', work: 'El mal querer', year: 2018, kind: 'album', note: 'Pop production built on flamenco palmas and palos; listen for which compás sits under each song.' }
    ],
    players: [
      { name: 'Paco de Lucía', inst: 'guitar', why: 'Clean, fast picado, new harmony and a modern band sound; every flamenco guitarist after him learned from his records.' },
      { name: 'Niño Ricardo', inst: 'guitar', why: 'His Seville falsetas shaped the mid-century toque and are still taught; good for learning traditional phrasing.' },
      { name: 'Sabicas', inst: 'guitar', why: 'Concert solo guitar with clear, powerful technique; study his rasgueados and tremolo.' },
      { name: 'Ramón Montoya', inst: 'guitar', why: 'Turned the accompanying guitar into a solo concert instrument and created new free-time pieces.' },
      { name: 'Tomatito', inst: 'guitar', why: 'Accompanied Camarón for years; the best model for playing behind a singer.' },
      { name: 'Moraíto Chico', inst: 'guitar', why: 'Jerez bulerías accompaniment with deep, relaxed compás and few notes.' },
      { name: 'Vicente Amigo', inst: 'guitar', why: 'Singing melodies and warm tone; shows how to write falsetas that feel like songs.' },
      { name: 'Camarón de la Isla', inst: 'cante (voice)', why: 'Learn how a singer phrases over compás so you know where to leave space.' }
    ],
    study: [
      { title: 'El arte flamenco de la guitarra', by: 'Juan Martín', kind: 'method', note: 'A graded method with falsetas in tablature for the main palos.' },
      { title: 'Flamenco Guitar Method (Vols. 1–2)', by: 'Gerhard Graf-Martinez', kind: 'method', note: 'Step-by-step rasgueado, picado and compás work with audio.' },
      { title: 'The Art of Flamenco', by: 'D.E. Pohren', kind: 'book', note: 'An older but detailed guide to palos, cante and the flamenco world.' },
      { title: 'Paco de Lucía: La búsqueda', by: 'Curro Sánchez Varela (2014)', kind: 'film', note: 'Documentary on Paco’s life and music, made by his son.' }
    ],
    listenFor: [
      'In a soleá or bulerías, count 12 aloud and notice where the guitar finishes its phrases (usually on 10).',
      'When the singer comes in, notice the guitar drops to simple compás strumming; falsetas only appear between verses.',
      'Hear the cadence to E (or A por medio): when the bass falls F–E it feels like arriving home, not like a dominant.',
      'Listen to the palmas: sordas are muted and low, claras are sharp and bright, and they mark accents differently.',
      'In “Entre dos aguas”, notice that the groove is in 4 like a rumba, not in 12.'
    ],
    practice: [
      'Clap soleá in the Rhythm atlas, counting 1–12 aloud and accenting 3, 6, 8, 10 and 12.',
      'Strum E and F over that count, with a rasgueado on each accent; build speed with the rasgueado Technique ladder.',
      'Loop the Andalusian cadence in the Repertoire gym and play picado runs in E Phrygian dominant that end on E.',
      'Play tangos with the Flamenco tangos groove: thumb on the bass strings (alzapúa down and up), chords on the accents.',
      'Pick one falseta from Almoraima or Siroco, slow it down in Transcribe, and fit it exactly inside the 12-count.'
    ]
  },

  hindustani: {
    era: '1200s–today',
    history: [
      ['1200s–1300s', 'At the Delhi Sultanate court, Persian and Indian music meet. Tradition credits the poet-musician Amir Khusrau with qawwali and new instruments.'],
      ['1500s', 'Tansen sings at Akbar’s Mughal court and becomes the model musician. Dhrupad is the main classical vocal form.'],
      ['1700s', 'Khayal, a freer and more ornamented vocal form, grows at Muhammad Shah’s court in Delhi. Gharanas (family schools of style) begin to form.'],
      ['1900s–1930s', 'V.N. Bhatkhande sorts ragas into ten thaats and publishes notated songs; V.D. Paluskar opens music schools to the public.'],
      ['1940s–1950s', 'Radio and LPs make stars of Ravi Shankar, Vilayat Khan and Ali Akbar Khan, and the sitar and sarod become solo concert instruments.'],
      ['1960s', 'Ravi Shankar plays Monterey (1967) and Woodstock (1969) and teaches George Harrison, bringing raga to Western audiences.'],
      ['1970s–today', 'Zakir Hussain builds bridges to jazz and other traditions. Brij Bhushan Kabra, Vishwa Mohan Bhatt and Debashish Bhattacharya bring slide guitar into the classical stage.']
    ],
    substyles: [
      { name: 'Dhrupad', text: 'The oldest surviving classical form: a long, slow alap on vowel sounds, then a song with pakhawaj drum. Austere and grand.' },
      { name: 'Khayal', text: 'The main vocal form today: a slow (vilambit) and a fast (drut) song, each opened up with improvised phrases, sargam and fast taans.' },
      { name: 'Instrumental raga', text: 'Sitar, sarod, bansuri and others: alap, jor and jhala without drums, then a gat with tabla that speeds up to a climax.' },
      { name: 'Thumri and dadra', text: 'Light classical love songs in ragas like Khamaj and Bhairavi, with more freedom to mix notes; sung by Begum Akhtar and Girija Devi.' },
      { name: 'Qawwali', text: 'Sufi devotional song from India and Pakistan: a lead singer, chorus, harmonium and tabla, with hand claps building to ecstatic repetition.' }
    ],
    traits: {
      rhythm: 'A tala cycle such as teental (16), jhaptal (10) or ektal (12) repeats under the music. Tempo rises step by step from slow to fast, and phrases end on sam.',
      harmony: 'There are no chord changes: everything is heard against the tanpura drone of Sa and Pa (or Ma or Ni). Tension and release come from how each note sits against Sa.',
      melody: 'A raga has its own ascent and descent (aroha and avaroha), which can differ, and important notes (vadi and samvadi). Ornaments like meend (glide) and andolan (slow sway) are part of the note.',
      form: 'An instrumental performance usually runs alap (free), jor (with pulse), jhala (fast strokes on drone strings), then a gat (composition) with tabla, improvised variations and a fast finish.',
      sound: 'Sitar and sarod have sympathetic strings that ring with the melody. The tabla’s right drum is tuned to Sa, the left drum bends in pitch, and the tanpura gives a buzzing, overtone-rich drone.'
    },
    essential: [
      { artist: 'Shivkumar Sharma, Hariprasad Chaurasia & Brij Bhushan Kabra', work: 'Call of the Valley', year: 1967, kind: 'album', note: 'Start here: short raga pieces on santoor, flute and slide guitar, with clear melodies.' },
      { artist: 'Ravi Shankar', work: 'Three Ragas', year: 1956, kind: 'album', note: 'Full raga performances on sitar; follow each one from alap to the tabla entry.' },
      { artist: 'Ali Akbar Khan', work: 'Music of India: Morning and Evening Ragas', year: 1955, kind: 'album', note: 'The sarod is fretless; hear how many notes are reached by slides.' },
      { artist: 'Ravi Shankar', work: 'Ravi Shankar at the Monterey International Pop Festival', year: 1967, kind: 'album', note: 'A live set that builds to a very fast finish; hear the jhala and the sitar–tabla exchanges.' },
      { artist: 'Ravi Shankar & Ali Akbar Khan', work: 'In Concert 1972', year: 1973, kind: 'album', note: 'A jugalbandi (duet) of sitar and sarod, with Alla Rakha on tabla; notice how they hand phrases back and forth.' },
      { artist: 'Satyajit Ray', work: 'Jalsaghar (The Music Room)', year: 1958, kind: 'film', note: 'Music by Vilayat Khan, with performances by Begum Akhtar (thumri), Bismillah Khan and Roshan Kumari (kathak).' },
      { artist: 'Nusrat Fateh Ali Khan & Party', work: 'Shahen-Shah', year: 1989, kind: 'album', note: 'Qawwali: hear the harmonium and claps lock the rhythm while Nusrat improvises sargam over it.' },
      { artist: 'Zakir Hussain', work: 'Making Music', year: 1987, kind: 'album', note: 'Tabla with Hariprasad Chaurasia, John McLaughlin and Jan Garbarek: a gentle meeting of Indian and Western players.' },
      { artist: 'Vishwa Mohan Bhatt & Ry Cooder', work: 'A Meeting by the River', year: 1993, kind: 'album', note: 'Two slide guitarists improvising together; Bhatt’s Mohan veena shows raga ornaments on a guitar.' }
    ],
    players: [
      { name: 'Brij Bhushan Kabra', inst: 'slide guitar', why: 'The first to play Hindustani classical music on guitar, held flat with a steel bar.' },
      { name: 'Vishwa Mohan Bhatt', inst: 'Mohan veena (modified slide guitar)', why: 'Shows how to get meend, gamak and fast taans from a guitar with sympathetic strings.' },
      { name: 'Ravi Shankar', inst: 'sitar', why: 'Clear structure and rhythmic play with tabla; a good model for building a performance.' },
      { name: 'Vilayat Khan', inst: 'sitar', why: 'Developed gayaki ang, playing the sitar like a singing voice with long pulled notes.' },
      { name: 'Nikhil Banerjee', inst: 'sitar', why: 'Deep, patient alaps; study how slowly a raga can be revealed.' },
      { name: 'Ali Akbar Khan', inst: 'sarod', why: 'The sarod is fretless and plucked, close to a slide guitar in sound; learn his slides and rhythmic strokes.' },
      { name: 'Zakir Hussain', inst: 'tabla', why: 'Listen to his accompaniment to learn how tabla answers and supports a melodic soloist.' },
      { name: 'Hariprasad Chaurasia', inst: 'bansuri', why: 'Breath-like phrasing and smooth glides, easy to copy with slides on the guitar.' }
    ],
    study: [
      { title: 'The Raga Guide: A Survey of 74 Hindustani Ragas', by: 'Joep Bor (ed.), Nimbus Records', kind: 'book', note: 'Each raga with notes, phrases and a short recorded example on the included CDs.' },
      { title: 'My Music, My Life', by: 'Ravi Shankar', kind: 'book', note: 'Memoir plus a clear introduction to raga, tala and sitar technique.' },
      { title: 'Raga', by: 'Howard Worth (1971)', kind: 'film', note: 'Documentary following Ravi Shankar in India and the West, with lessons and concerts.' }
    ],
    listenFor: [
      'In the alap, notice that there is no drum and the player reveals the raga a few notes at a time, often resting on Sa.',
      'When the tabla enters, find sam: soloist and drummer often meet on it with a big phrase or a shared nod.',
      'Count a teental cycle and listen for khali around beat 9, where the tabla’s bass drum drops out.',
      'Listen for tihais: the same phrase three times, the last note landing on sam.',
      'Count how many notes are reached by sliding (meend) rather than by a new pluck.'
    ],
    practice: [
      'Set the drone to Sa in the Drone & scale explorer and play Yaman (Lydian) slowly, holding each note until it sits against the drone.',
      'Learn Yaman’s typical phrases, Ni Re Ga, Re Ga, Ni Re Sa going up and Pa Ma Ga Re Sa coming down, with slides between notes.',
      'Clap teental in the Rhythm atlas: claps on 1, 5 and 13, a wave on 9, while saying the beat numbers.',
      'Play a five-minute alap on one string only, sliding between notes, so position shifts become glides.',
      'Make a tihai: start on beat 2 of teental and play a 4-beat phrase, rest 2, phrase, rest 2, phrase; the last note lands on the next sam.'
    ]
  },

  carnatic: {
    era: '1500s–today',
    history: [
      ['1500s', 'Purandara Dasa sets up the graded lessons (sarali varisai, alankaras) in raga Mayamalavagowla that students still learn first.'],
      ['1600s', 'Venkatamakhin’s Chaturdandi Prakashika lays out the 72-melakarta scheme of parent scales.'],
      ['late 1700s–1840s', 'The Trinity, Tyagaraja, Muthuswami Dikshitar and Syama Sastri, compose the kritis at the heart of today’s concerts.'],
      ['1800s', 'Baluswami Dikshitar adopts the European violin; tuned and held differently, it becomes the standard accompanying instrument.'],
      ['1920s–1940s', 'Ariyakudi Ramanuja Iyengar shapes the concert order used today, and the Madras Music Academy (1928) starts the December music season.'],
      ['1940s–1980s', 'M.S. Subbulakshmi becomes a national voice. U. Srinivas plays concerts on electric mandolin, and Shakti (from 1975) joins John McLaughlin with L. Shankar, Zakir Hussain and Vikku Vinayakram.'],
      ['2000s–today', 'Prasanna adapts gamaka to the guitar. Singers like T.M. Krishna take concerts outside the usual halls and question caste barriers in the art.']
    ],
    substyles: [
      { name: 'Varnam', text: 'A concert opener and study piece that sets out the raga’s phrases, played in two speeds. Every student learns several.' },
      { name: 'Kriti', text: 'The main composed song, in three parts: pallavi (refrain), anupallavi and charanam. Improvised sections are added around it.' },
      { name: 'Ragam–tanam–pallavi', text: 'The improvised centrepiece: free alapana, then tanam with a pulse, then one line of song developed in many speeds and rhythms.' },
      { name: 'Tillana', text: 'A lively, rhythmic piece built on drum syllables, often used to close a concert or a Bharatanatyam dance.' },
      { name: 'Padam and javali', text: 'Slower love songs from the dance tradition, sung with expressive detail rather than speed.' }
    ],
    traits: {
      rhythm: 'Talas are counted with claps, finger counts and waves; adi (8), rupaka (3), misra chapu (7) and khanda chapu (5) are the most common. Each beat can be split in 3, 4, 5, 7 or 9, and phrases resolve with korvais.',
      harmony: 'There are no chords. A tanpura or shruti box holds Sa and Pa, melakartas give each raga its parent scale, and janya ragas skip notes or zigzag (vakra).',
      melody: 'Gamaka is part of the note itself: a note may oscillate wide, slide in from above, or stay plain. Two ragas with the same notes can differ only in their gamakas.',
      form: 'A concert moves from a varnam through several kritis, each with improvised alapana, neraval and kalpanaswaram, to a main piece with a percussion solo (tani avartanam), then lighter songs.',
      sound: 'The voice is the model. Violin shadows the singer phrase by phrase, mridangam is tuned to Sa, and ghatam, kanjira and morsing add colour. The veena’s frets sit in wax, so players pull the string for deep bends.'
    },
    essential: [
      { artist: 'Shakti with John McLaughlin', work: 'Shakti with John McLaughlin', year: 1976, kind: 'album', note: 'Start here: acoustic guitar and violin trade fast lines with tabla and ghatam, using Carnatic rhythmic ideas.' },
      { artist: 'M.S. Subbulakshmi', work: 'Sri Venkatesa Suprabhatam', year: 1963, kind: 'track', note: 'A devotional piece heard every morning across South India; listen for her steady pitch and gentle gamakas.' },
      { artist: 'M.S. Subbulakshmi', work: 'Meera', year: 1945, kind: 'film', note: 'The Tamil film in which she plays the saint Meera; her songs show the voice Carnatic instrumentalists copy.' },
      { artist: 'K. Viswanath', work: 'Sankarabharanam', year: 1979, kind: 'film', note: 'A Telugu film about a Carnatic singer, full of kritis and ragas sung by S.P. Balasubrahmanyam and Vani Jairam.' },
      { artist: 'L. Shankar', work: 'Who’s to Know', year: 1980, kind: 'album', note: 'Violin with mridangam and tabla, including a long ragam–tanam–pallavi; hear the form unfold.' },
      { artist: 'U. Srinivas & Michael Brook', work: 'Dream', year: 1995, kind: 'album', note: 'Electric mandolin over an ambient setting; notice how Srinivas gets gamakas from a fretted instrument.' },
      { artist: 'Remember Shakti', work: 'The Believer', year: 2000, kind: 'album', note: 'John McLaughlin with U. Srinivas on mandolin and V. Selvaganesh on kanjira; fast unison lines and konnakol.' },
      { artist: 'John McLaughlin', work: 'Floating Point', year: 2008, kind: 'album', note: 'Electric guitar recorded in Chennai with Indian musicians; odd groupings and Carnatic phrasing in a fusion band.' },
      { artist: 'T.M. Krishna', work: 'Chennai Poromboke Paadal', year: 2017, kind: 'track', note: 'A Carnatic song about pollution of the Ennore creek, sung on location; hear raga phrasing in a new setting.' }
    ],
    players: [
      { name: 'Prasanna', inst: 'guitar', why: 'Plays full Carnatic concerts on electric guitar; study his slides and bends for gamaka.' },
      { name: 'John McLaughlin', inst: 'guitar', why: 'Applied konnakol and Carnatic rhythmic groupings to guitar with Shakti.' },
      { name: 'U. Srinivas', inst: 'electric mandolin', why: 'Proved that a fretted instrument can play gamakas; his fast phrases are a model for guitarists.' },
      { name: 'S. Balachander', inst: 'veena', why: 'Long, singing bends on the veena that you can copy on guitar strings.' },
      { name: 'Lalgudi Jayaraman', inst: 'violin', why: 'Violin phrasing modelled on the voice, and many tillanas and varnams still played today.' },
      { name: 'M.S. Subbulakshmi', inst: 'voice', why: 'The voice behind the style; learn melodies by singing them her way first.' },
      { name: 'Palghat Mani Iyer', inst: 'mridangam', why: 'His accompaniment set the standard for how drums support and answer the soloist.' },
      { name: 'Vikku Vinayakram', inst: 'ghatam', why: 'Shows the rhythmic language on a clay pot; follow his korvais and konnakol.' }
    ],
    study: [
      { title: 'Solkattu Manual: An Introduction to the Rhythmic Language of South Indian Music', by: 'David P. Nelson', kind: 'book', note: 'Step-by-step konnakol exercises with recordings; ideal before you try rhythmic ideas on guitar.' },
      { title: 'Music in South India', by: 'T. Viswanathan & Matthew Harp Allen', kind: 'book', note: 'A short introduction to raga, tala, forms and the concert, with a CD.' },
      { title: 'Applying Karnatic Rhythmical Techniques to Western Music', by: 'Rafael Reina', kind: 'method', note: 'Gati, jathi, korvai and more, written for Western players.' }
    ],
    listenFor: [
      'In a kriti, notice each time the pallavi (opening line) returns; the improvisations always circle back to it.',
      'Listen to one held note and notice whether it shakes widely, slides in, or stays plain.',
      'Follow the violin: it shadows the singer a moment behind, then repeats each improvised phrase.',
      'In the percussion solo, listen for the korvai, a pattern played three times that brings everyone back to beat 1 together.',
      'Count adi tala (clap, three finger counts, clap–wave, clap–wave) along a kriti.'
    ],
    practice: [
      'Say ta-ka-di-mi (4) and ta-ki-ta (3) with the Metronome, then climb the Konnakol + guitar Technique ladder.',
      'Play sarali varisai 1 in Mayamalavagowla on C (C D♭ E F G A♭ B C), up and down, over a drone at three speeds.',
      'Learn the pallavi of Dikshitar’s “Vatapi Ganapatim” in Hamsadhwani (C D E G B) by ear, singing it before you play it.',
      'Hold a note and add a slow, wide bend up a half step and back, then try sliding into it from the note above.',
      'Group sixteenths in fives (ta-di-gi-na-thom) over 4/4 and keep going until the group starts on beat 1 again, five bars later.'
    ]
  },

  arabic: {
    era: '700s–today',
    history: [
      ['800s', 'In Abbasid Baghdad, Ishaq al-Mawsili and his student Ziryab refine oud playing. Ziryab moves to Córdoba in 822 and is credited with adding a fifth course.'],
      ['900s–1200s', 'Al-Kindi, al-Farabi and Safi al-Din al-Urmawi write about intervals and modes. Andalusian music grows in al-Andalus and later moves to North Africa.'],
      ['1932', 'The Cairo Congress of Arab Music brings musicians and scholars together to document maqam, tuning and rhythm.'],
      ['1930s–1970s', 'Umm Kulthum’s monthly radio concerts from Cairo, with songs by Riad Al Sunbati, Mohammed Abdel Wahab and Baligh Hamdi, define the long tarab song.'],
      ['1950s–1970s', 'In Beirut, Fairuz and the Rahbani brothers blend Levantine folk with orchestral song; Farid al-Atrash is a star singer and oud player in Cairo films.'],
      ['1960s–1990s', 'Munir Bashir makes the solo oud taqsim a concert form; Iraqi maqam and the Andalusian nuba of the Maghreb keep their own traditions.'],
      ['1990s–today', 'Anouar Brahem, Rabih Abou-Khalil and Dhafer Youssef take the oud into jazz, Naseer Shamma opens Bayt al-Oud schools, and Raï singers reach world audiences.']
    ],
    substyles: [
      { name: 'Tarab song', text: 'The long Egyptian classical song of Umm Kulthum and Abdel Wahab: orchestral introductions, then verses stretched and repeated as the audience responds.' },
      { name: 'Instrumental forms', text: 'Taqsim (free improvisation), and composed bashraf, sama’i and longa pieces for takht ensemble that move through related maqamat.' },
      { name: 'Muwashshah', text: 'Strophic songs from al-Andalus, kept alive especially in Aleppo, often in long, complex rhythmic cycles.' },
      { name: 'Iraqi maqam', text: 'A Baghdad vocal tradition with set melodic routes, sung with santur, joza (spike fiddle) and percussion.' },
      { name: 'Andalusian nuba', text: 'Suites from Morocco, Algeria and Tunisia that trace back to al-Andalus, played by orchestras of oud, violin, rebab and percussion.' },
      { name: 'Raï and popular song', text: 'From Oran in Algeria: older Bedouin song turned into dance music with synths, guitar and drum machines, alongside Egyptian and Lebanese pop.' }
    ],
    traits: {
      rhythm: 'Iqa’at are cycles of dum (low) and tek (high) strokes, from 2 beats to more than 20. Maqsum and baladi drive songs, sama’i thaqil (10/8) carries the sama’i form, and players fill each skeleton with ornaments.',
      harmony: 'The texture is heterophonic, not chordal: everyone plays the same tune with their own ornaments over a felt tonic. The harmonic journey is modulation from one maqam to a related one through shared ajnas.',
      melody: 'Melody moves mostly by step. Each maqam has a lower jins, a ghammaz (pivot note where the upper jins starts) and habits of phrasing, and quarter-tone pitches vary a little from region to region.',
      form: 'Songs alternate instrumental refrains (lazmat) with sung verses. Instrumental suites open with a taqsim; a sama’i has four sections (khanat) with a returning refrain (taslim).',
      sound: 'A takht is oud, qanun, ney, violin and riq; Cairo’s orchestras add a string section. The oud is fretless with five or six courses, played with a long, flexible plectrum (risha).'
    },
    essential: [
      { artist: 'Umm Kulthum', work: 'Enta Omri', year: 1964, kind: 'track', note: 'Start with the long instrumental introduction by Abdel Wahab; then hear how each sung line is repeated and varied.' },
      { artist: 'Fairuz', work: 'Zahrat al-Mada’en', year: 1967, kind: 'track', note: 'A Rahbani brothers song for Jerusalem; shorter than Cairo tarab, with choir and orchestra.' },
      { artist: 'Umm Kulthum', work: 'Al Atlal', year: 1966, kind: 'track', note: 'Riad Al Sunbati’s setting; follow the maqam changes as the song moves from section to section.' },
      { artist: 'Abdel Halim Hafez', work: 'Qariat al-Finjan', year: 1976, kind: 'track', note: 'Mohamed el-Mougy’s music to Nizar Qabbani’s poem; hear the dialogue between the singer and the orchestra.' },
      { artist: 'Marcel Khalife', work: 'Promises of the Storm', year: 1976, kind: 'album', note: 'Oud and voice setting Mahmoud Darwish’s poems; simple accompaniment patterns you can learn on guitar.' },
      { artist: 'Hamza El Din', work: 'Escalay (The Water Wheel)', year: 1971, kind: 'album', note: 'Nubian music from southern Egypt and Sudan on oud: pentatonic and rhythmic, a different side of the instrument.' },
      { artist: 'Anouar Brahem', work: 'Barzakh', year: 1991, kind: 'album', note: 'Tunisian oud with violin and percussion; quiet, clear taqasim and compositions in maqam.' },
      { artist: 'Rabih Abou-Khalil', work: 'Blue Camel', year: 1992, kind: 'album', note: 'Lebanese oud with jazz musicians in long rhythmic cycles; count the odd meters.' },
      { artist: 'Khaled', work: 'Didi', year: 1992, kind: 'track', note: 'Algerian Raï as pop; hear the maqam-flavoured vocal over a dance beat.' },
      { artist: 'Souad Massi', work: 'Raoui', year: 2001, kind: 'album', note: 'Algerian songs with acoustic guitar; good for hearing North African melody on a fretted guitar.' }
    ],
    players: [
      { name: 'Munir Bashir', inst: 'oud', why: 'Slow, spacious taqasim from Iraq; learn how silence and repeated notes build a maqam.' },
      { name: 'Farid al-Atrash', inst: 'oud, voice', why: 'Fast, flowing taqasim with Spanish touches; his intros show oud virtuosity in song.' },
      { name: 'Riad Al Sunbati', inst: 'oud, composer', why: 'Wrote many of Umm Kulthum’s songs; his solo oud shows classical Egyptian phrasing.' },
      { name: 'Naseer Shamma', inst: 'oud', why: 'Iraqi player and teacher with refined technique; a model for clean, expressive right-hand work.' },
      { name: 'Anouar Brahem', inst: 'oud', why: 'Simple, slow melodies with exact intonation; great for learning how to play quietly.' },
      { name: 'Simon Shaheen', inst: 'oud, violin', why: 'Palestinian player who teaches and records classical forms (sama’i, longa) with great clarity.' },
      { name: 'Ali Jihad Racy', inst: 'ney, buzuq', why: 'Musician and scholar who explains tarab from the inside.' },
      { name: 'Hossam Ramzy', inst: 'darbuka, percussion', why: 'Clear recordings of Egyptian rhythms; learn the dum–tek patterns with him.' }
    ],
    study: [
      { title: 'Inside Arabic Music: Arabic Maqam Performance and Theory in the 20th Century', by: 'Johnny Farraj & Sami Abu Shumays', kind: 'book', note: 'Maqam, ajnas, modulation and rhythm explained for players, with many examples.' },
      { title: 'Making Music in the Arab World: The Culture and Artistry of Tarab', by: 'A.J. Racy', kind: 'book', note: 'How performers and listeners create tarab together.' },
      { title: 'Umm Kulthum: A Voice Like Egypt', by: 'Michal Goldman (1996)', kind: 'film', note: 'Documentary on Umm Kulthum’s life, with concert footage.' }
    ],
    listenFor: [
      'In “Enta Omri”, notice how long the orchestra plays before the voice enters, and how each line gets a new twist when repeated.',
      'Find the quarter-tone note: in Bayati on D, the second degree is E half-flat, between E♭ and E.',
      'In a taqsim, notice where the player pauses; those resting notes outline the jins.',
      'Pick out the riq or darbuka, find the dum on beat 1 of maqsum, and hear how the tek strokes fill the rest.',
      'Hear heterophony: oud, qanun and violin play the same tune but not quite together, each adding its own turns.'
    ],
    practice: [
      'Tap maqsum in the Rhythm atlas saying “dum tek – tek dum – tek –”, then play it on muted strings.',
      'Learn jins Hijaz on D (D E♭ F♯ G) as a four-note cell over a D drone, then add jins Nahawand on G above it (G A B♭ C).',
      'Over a D drone, bend E♭ slightly sharp to find Bayati’s E half-flat; check it by ear against the drone.',
      'Play a one-minute taqsim in Hijaz: start low, rest on G (the ghammaz), climb higher, and return to D.',
      'Slow a song introduction to 60–70% in Transcribe and learn its first lazma by ear.'
    ]
  },

  turkbalkan: {
    era: '1400s–today',
    history: [
      ['1400s–1800s', 'Ottoman court music grows in Istanbul from Turkish, Persian, Arab, Greek, Armenian and Jewish musicians; Mevlevi lodges keep the ney and long ayin suites.'],
      ['about 1700', 'Dimitrie Cantemir, a Moldavian prince living in Istanbul, writes down hundreds of Ottoman instrumental pieces in his own notation.'],
      ['1500s–1900s', 'Across the Ottoman Balkans, makam, aksak rhythms and the zurna-and-tapan pair spread, while Bulgarian, Greek, Macedonian, Serbian and Romanian villages keep their own songs and dances.'],
      ['1920s–1930s', 'After the 1923 population exchange, refugees from Asia Minor help shape rebetiko in Piraeus and Athens, played on bouzouki and baglamas.'],
      ['1951', 'Philip Koutev founds the Bulgarian State Folk Ensemble; its singers reach the world through the 1975 album Le Mystère des Voix Bulgares.'],
      ['1970s–1980s', 'Bulgarian wedding music explodes with Ivo Papazov’s clarinet; in Turkey, Anatolian rock and arabesk put the bağlama next to electric guitars.'],
      ['1990s–today', 'Taraf de Haïdouks, Boban Marković and Goran Bregović bring Romani and brass band music to world stages; Erkan Oğur plays makam on fretless guitar.']
    ],
    substyles: [
      { name: 'Ottoman / Turkish classical', text: 'Court and concert music: peşrev and saz semaisi pieces, fasıl suites of songs, and taksim improvisations in makam.' },
      { name: 'Turkish folk and bağlama', text: 'Türkü songs from Anatolia, and the Alevi aşık tradition of poet-singers who accompany themselves on bağlama.' },
      { name: 'Bulgarian wedding music', text: 'Fast, virtuosic dance music for clarinet, sax, accordion, electric guitar and drums, in 7/8, 9/8, 11/8 and more.' },
      { name: 'Rebetiko', text: 'Greek urban song of the 1920s–50s, sung over bouzouki and baglamas, with dances like zeibekiko (9/8) and hasapiko.' },
      { name: 'Serbian and Macedonian brass', text: 'Romani brass bands of trumpets, tubas and drums playing kolo and čoček dances, celebrated at the Guča festival.' },
      { name: 'Romanian lăutari', text: 'Romani professional musicians playing violin, cimbalom, accordion and bass at weddings, often starting with a free doina.' }
    ],
    traits: {
      rhythm: 'Aksak meters group fast pulses into 2s and 3s: 7/8 as 2+2+3, 9/8 as 2+2+2+3, 11/8 as 2+2+3+2+2. Turkish usul are taught with düm–tek syllables, and dancers feel the long beat as a lift.',
      harmony: 'Folk and Ottoman music is modal and mostly unharmonised. Balkan wedding bands add simple I–IV–V, ♭VII–I or Phrygian ♭II–I chords, with a bass that pumps out the aksak groups.',
      melody: 'Turkish theory divides the whole tone into nine commas, so notes like the segâh in makam Rast sit slightly flat of a guitar’s fret. Clarinet and kaval lines are full of fast trills, turns and grace notes.',
      form: 'A peşrev or saz semaisi has four sections (hane) with a returning refrain (teslim). Folk dances repeat short tunes and speed up, and Romani bands often open with a free taksim or doina.',
      sound: 'Turkey: bağlama with movable frets including microtonal ones, kanun, ney, kemençe and oud. Bulgaria: gadulka, gaida, kaval and tapan. Wedding bands: clarinet, sax, accordion, electric guitar; Serbian bands: trumpets and tubas.'
    },
    essential: [
      { artist: 'Goran Bregović', work: 'Ederlezi', year: 1988, kind: 'track', note: 'Start here: from the film Time of the Gypsies, a slow Romani melody with turns you can learn on guitar.' },
      { artist: 'Le Mystère des Voix Bulgares', work: 'Le Mystère des Voix Bulgares', year: 1975, kind: 'album', note: 'Arranged Bulgarian village songs; listen for held seconds between voices that ring rather than clash.' },
      { artist: 'Ivo Papazov & His Orchestra', work: 'Orpheus Ascending', year: 1989, kind: 'album', note: 'Bulgarian wedding music at full speed; count the aksak meters under the clarinet runs.' },
      { artist: 'Taraf de Haïdouks', work: 'Musique des Tziganes de Roumanie', year: 1991, kind: 'album', note: 'Romanian Romani lăutari from Clejani: violins, cimbalom, accordion and rough, lively vocals.' },
      { artist: 'Fanfare Ciocărlia', work: 'Radio Pascani', year: 1998, kind: 'album', note: 'Romanian brass band dance tunes at high speed; follow the tuba and the off-beat horns.' },
      { artist: 'Markos Vamvakaris', work: 'Frangosyriani', year: 1935, kind: 'track', note: 'Early rebetiko on bouzouki; hear the simple, strong melody and the steady strum.' },
      { artist: 'Fatih Akın', work: 'Crossing the Bridge: The Sound of Istanbul', year: 2005, kind: 'film', note: 'A tour of Istanbul’s music, from Romani clarinet to arabesk, Kurdish song and Turkish rock.' },
      { artist: 'Orhan Gencebay', work: 'Batsın Bu Dünya', year: 1975, kind: 'track', note: 'Arabesk with Gencebay’s fast bağlama; notice the microtonal notes and runs.' },
      { artist: 'Erkin Koray', work: 'Elektronik Türküler', year: 1974, kind: 'album', note: 'Anatolian folk songs on fuzz electric guitar and electric saz; good for hearing makam on a rock guitar.' }
    ],
    players: [
      { name: 'Erkan Oğur', inst: 'fretless guitar, kopuz, bağlama', why: 'Plays Turkish makam and folk songs on a fretless guitar he developed; the clearest model for this music on guitar.' },
      { name: 'Arif Sağ', inst: 'bağlama', why: 'Made şelpe, playing with the fingers of both hands on the neck, popular; ideas you can borrow for guitar tapping.' },
      { name: 'Neşet Ertaş', inst: 'bağlama, voice', why: 'Central Anatolian folk song with simple, deep accompaniment; learn how voice and instrument share the tune.' },
      { name: 'Markos Vamvakaris', inst: 'bouzouki, voice', why: 'Early rebetiko; strong, rhythmic playing that suits a pick and a steel-string guitar.' },
      { name: 'Yurdal Tokcan', inst: 'oud', why: 'Modern Turkish oud with clear phrasing in makam and taksim.' },
      { name: 'Ivo Papazov', inst: 'clarinet', why: 'Bulgarian wedding style at its fastest; copy his ornaments with hammer-ons and pull-offs.' },
      { name: 'Theodosii Spassov', inst: 'kaval', why: 'Bulgarian kaval with folk and jazz; useful for breathy phrasing and asymmetric meters.' },
      { name: 'Ferus Mustafov', inst: 'saxophone, clarinet', why: 'Macedonian Romani wedding sound; fast čoček lines full of turns.' }
    ],
    study: [
      { title: 'Music in Turkey: Experiencing Music, Expressing Culture', by: 'Eliot Bates', kind: 'book', note: 'An introduction to makam, usul, instruments and Turkish music today, with audio.' },
      { title: 'Music in Bulgaria: Experiencing Music, Expressing Culture', by: 'Timothy Rice', kind: 'book', note: 'Bulgarian village music, ensembles and wedding music, with audio examples.' },
      { title: 'Road to Rembetika', by: 'Gail Holst', kind: 'book', note: 'History of rebetiko, its musicians and songs.' }
    ],
    listenFor: [
      'In a Bulgarian dance tune, tap only the long beats: rachenitsa feels short-short-LONG.',
      'Listen to the clarinet and notice the grace notes before almost every main note.',
      'In Turkish music, listen for notes between the guitar’s frets, such as the second degree of makam Uşşak sitting a little low.',
      'Find the free doina or taksim at the start of a Romani piece and the moment the band kicks into the dance.',
      'In rebetiko, count the 9/8 of a zeibekiko and notice how the dancer’s steps sit across it.'
    ],
    practice: [
      'Count 7/8 as “1-2, 1-2, 1-2-3” over the rachenitsa in the Rhythm atlas and strum down at the start of each group.',
      'Play kalamatianos (3+2+2) and rachenitsa (2+2+3) back to back: the same 7 pulses with a different feel.',
      'Say kopanitsa (2+2+3+2+2) as “ta-ka ta-ka ta-ki-ta ta-ka ta-ka”, then play a Phrygian dominant scale in that grouping.',
      'Practise clarinet-style ornaments over the Hijaz / freygish vamp: quick hammer-on trills and three-note turns, then work up the legato Technique ladder.',
      'Try a şelpe-style passage: tap notes with both hands on the top strings while an open string keeps sounding.'
    ]
  },

  westafrica: {
    era: '1200s–today',
    history: [
      ['1200s', 'Sundiata Keita founds the Mali Empire. Griot (jeli) families keep his epic and sing it with balafon and ngoni; the kora appears in Mande music later.'],
      ['1920s–1950s', 'Highlife grows in Ghana’s coastal towns from palm-wine guitar songs and dance bands like E.T. Mensah’s Tempos, mixing local rhythms with brass and calypso.'],
      ['1960s', 'Independence: new states fund national bands like Bembeya Jazz in Guinea, while jùjú (I.K. Dairo) and highlife fill Nigerian dance halls.'],
      ['1970s', 'Fela Kuti builds Afrobeat in Lagos from highlife, jazz, funk and Yoruba rhythm with drummer Tony Allen. In Mali, the Rail Band and Les Ambassadeurs electrify griot songs.'],
      ['1980s', 'King Sunny Adé’s jùjú and Youssou N’Dour’s Senegalese mbalax tour widely, and Salif Keita and Toumani Diabaté record for international labels.'],
      ['1990s', 'Ali Farka Touré’s guitar from northern Mali reaches a wide audience with Talking Timbuktu (1994).'],
      ['2000s–today', 'Tinariwen and Bombino carry Tuareg guitar music (assouf) from the Sahara, and Nigerian and Ghanaian Afrobeats pop spreads worldwide.']
    ],
    substyles: [
      { name: 'Mande griot music', text: 'Praise songs and epics from Mali, Guinea, Senegal and Gambia, sung by jelis with kora, ngoni and balafon. Electric bands later moved the parts to guitar.' },
      { name: 'Highlife', text: 'Ghanaian and Nigerian dance music with bright, interlocking guitar lines over a bell and clave-like pattern, in major keys.' },
      { name: 'Jùjú', text: 'Yoruba music from Nigeria with several electric guitars, pedal steel, talking drums and praise singing.' },
      { name: 'Afrobeat', text: 'Fela Kuti’s long, horn-driven grooves with political lyrics, built on interlocking guitars and Tony Allen’s drumming.' },
      { name: 'Desert blues / assouf', text: 'Tuareg and northern Malian guitar music: hypnotic riffs, hand claps and call-and-response singing.' },
      { name: 'Mbalax', text: 'Senegalese pop built on sabar drum rhythms, with fast guitar and keyboard lines and Wolof singing.' }
    ],
    traits: {
      rhythm: 'Much of the music sits in 12/8 or is felt as four beats each split into both 3 and 2. A bell timeline anchors everyone, parts start at different points of the cycle, and the downbeat is often felt rather than played.',
      harmony: 'Harmony is simple and cyclical. Highlife and jùjú use I–IV–V in major, Mande songs often stay on one or two chords, and desert blues sits on one modal vamp.',
      melody: 'In tonal languages like Yoruba and Akan, melodies follow the rise and fall of the words. Guitar leads borrow kora and ngoni runs and stay mostly pentatonic or hexatonic.',
      form: 'Songs loop a short pattern for a long time: a sung section, then breaks where lead guitar or kora improvises. On kora, the birimintingo runs sit over the steady kumbengo ostinato.',
      sound: 'Mande groups use kora, ngoni, balafon and voice. Highlife and jùjú use clean electric guitars and talking drums; Afrobeat adds horns, organ and two interlocking guitars; desert blues uses overdriven guitars and claps.'
    },
    essential: [
      { artist: 'Ali Farka Touré & Ry Cooder', work: 'Talking Timbuktu', year: 1994, kind: 'album', note: 'Start here: slow, repeating guitar riffs from northern Mali that are easy to follow and learn.' },
      { artist: 'Toumani Diabaté', work: 'Kaira', year: 1988, kind: 'album', note: 'Solo kora: hear the thumb ostinato and the fast runs above it at the same time.' },
      { artist: 'Prince Nico Mbarga & Rocafil Jazz', work: 'Sweet Mother', year: 1976, kind: 'track', note: 'Highlife guitar: two bright guitar parts lock together over a steady groove.' },
      { artist: 'King Sunny Adé & His African Beats', work: 'Juju Music', year: 1982, kind: 'album', note: 'Layers of electric guitar, pedal steel and talking drum; try to count how many guitar parts there are.' },
      { artist: 'Fela Kuti & Africa 70', work: 'Expensive Shit', year: 1975, kind: 'album', note: 'Long Afrobeat grooves; follow the two guitars and Tony Allen’s drums before the horns enter.' },
      { artist: 'Orchestra Baobab', work: 'Pirates Choice', year: 1982, kind: 'album', note: 'Senegalese band playing Cuban-style music with Wolof and Mande touches; Barthélemy Attisso’s guitar leads.' },
      { artist: 'Salif Keita', work: 'Soro', year: 1987, kind: 'album', note: 'Griot singing with a big electric band; hear Mande guitar lines arranged for synths and horns.' },
      { artist: 'Oumou Sangaré', work: 'Moussolou', year: 1989, kind: 'album', note: 'Wassoulou music from southern Mali: kamalengoni, fiddle and call-and-response singing.' },
      { artist: 'Toumani Diabaté & Ali Farka Touré', work: 'In the Heart of the Moon', year: 2005, kind: 'album', note: 'Kora and guitar duets; listen to how the two instruments split bass, ostinato and melody.' },
      { artist: 'Tinariwen', work: 'Aman Iman', year: 2007, kind: 'album', note: 'Tuareg desert blues: interlocking riffs, claps and group vocals.' }
    ],
    players: [
      { name: 'Ali Farka Touré', inst: 'guitar', why: 'Riffs drawn from northern Malian fiddle and lute music; learn the open-string drones and repeated patterns.' },
      { name: 'Sékou “Bembeya” Diabaté', inst: 'guitar', why: 'Bembeya Jazz’s lead guitarist; long, flowing lines that adapt Mande balafon and kora playing.' },
      { name: 'Djelimady Tounkara', inst: 'guitar', why: 'Super Rail Band guitarist; a model for turning kora and ngoni parts into guitar parts.' },
      { name: 'Kanté Manfila', inst: 'guitar', why: 'Les Ambassadeurs’ guitarist and arranger; clear, melodic Mande lines.' },
      { name: 'King Sunny Adé', inst: 'guitar, voice', why: 'Jùjú bandleader; study how many simple guitar parts lock into one groove.' },
      { name: 'Toumani Diabaté', inst: 'kora', why: 'Shows bass, ostinato and runs played at once; split his parts between thumb and fingers.' },
      { name: 'Bassekou Kouyaté', inst: 'ngoni', why: 'Takes the ngoni into a full band; fast, bluesy lines that sit well on guitar.' },
      { name: 'Tony Allen', inst: 'drums', why: 'Afrobeat drumming; learning his patterns tells you where the guitar parts should sit.' }
    ],
    study: [
      { title: 'In Griot Time: An American Guitarist in Mali', by: 'Banning Eyre', kind: 'book', note: 'A guitarist’s account of studying with Djelimady Tounkara in Bamako.' },
      { title: 'African Rhythm and African Sensibility', by: 'John Miller Chernoff', kind: 'book', note: 'How Ghanaian drummers think about rhythm, timelines and community.' },
      { title: 'The Music of Africa', by: 'J.H. Kwabena Nketia', kind: 'book', note: 'A broad introduction to African music structures and instruments.' },
      { title: 'Finding Fela', by: 'Alex Gibney (2014)', kind: 'film', note: 'Documentary on Fela Kuti’s life and Afrobeat.' }
    ],
    listenFor: [
      'On Talking Timbuktu, tap your foot to the pulse and notice the guitar riff can be felt in 2 or in 3.',
      'On Kaira, separate the kora’s low thumb pattern from the runs above it.',
      'In an Afrobeat track, find the two guitars: one plays short chords, the other a muted single-note line; neither changes for minutes.',
      'In jùjú, listen for the talking drum answering the singer’s words.',
      'In Tinariwen, notice how small changes to a repeated riff mark new sections.'
    ],
    practice: [
      'Loop the bembe bell in the Rhythm atlas; tap four dotted quarters with your foot, then six quarters with your hand, and switch.',
      'Play the Highlife progression in the Repertoire gym with one short arpeggio per chord, repeated exactly for 16 bars.',
      'Build a kora-style ostinato: thumb alternates two bass notes on the beat while the index finger plucks offbeats on a high string; hold it for five minutes.',
      'With a looper, record a choppy two-chord rhythm part, then add a muted single-note pentatonic line offset by an eighth note, Afrobeat style.',
      'Slow an Ali Farka Touré or Tinariwen riff to 70% in Transcribe and learn it in A minor pentatonic with hammer-ons from open strings.'
    ]
  }
};
