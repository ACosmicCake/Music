/* World Woodshed — style deep-dives: four more regions (Southern Africa & Madagascar, Mexico,
   Colombia & Venezuela, mainland Southeast Asia). Same shape as styles-new.js: whole style objects,
   appended to D.REGIONS. Their essays are in essays-7.js and their drills in drills-c.js. */
export default {
  southernafrica: {
    id: 'southernafrica', name: 'Southern Africa & Madagascar', places: 'Johannesburg · Durban · Soweto · Maputo · Antananarivo · Toliara',
    summary: 'Migrant workers carried guitars, concertinas and church harmony into the mine towns of South Africa, and out of them came marabi, kwela, mbaqanga and the Zulu guitar music called maskanda. Across the Mozambique Channel, Madagascar has its own guitar world: fast 6/8 salegy and tsapiky, and fingerstyle players who tune the guitar to sound like the valiha zither.',
    concepts: ['The cycle: a short chord loop (I–IV–I–V) repeated, never resolved, as in marabi and mbaqanga', 'Mbaqanga lead guitar: bright, picked lines high on the neck, interlocking with a busy bass', 'Maskanda: the opening run (izihlabo), picking (ukupika), vamping (ukuvamba) and spoken praises (izibongo)', 'Two roots a whole step apart, from the music of the Zulu and Xhosa bows', 'Voices and guitars overlap: the answer starts before the call ends', 'Salegy and tsapiky: fast 6/8 that you can also feel in 3'],
    instruments: ['Guitar', 'Bass guitar', 'Concertina', 'Penny whistle', 'Accordion', 'Umakhweyana (bow)', 'Valiha', 'Kabosy', 'Marovany'],
    rhythms: [], scales: ['major', 'mixolydian', 'majpent'],
    guitar: ['Play a four-chord cycle (G C G D) for five minutes without stopping: the music is in how the loop breathes, not in where it goes', 'Mbaqanga: pick single notes high on strings 1–3 with a pick, palm muting a little, and leave space for the bass', 'Maskanda: thumb on strings 4–6, index finger on 1–3; the thumb and finger answer each other', 'Start a maskanda phrase high and let it fall, the way Zulu song falls', 'Salegy: strum or pick six even notes per beat-pair and accent 1 and 4, then 1, 3 and 5'],
    listen: ['Mahlathini and the Mahotella Queens', 'Makgona Tsohle Band', 'Phuzushukela (John Bhengu)', 'Shiyani Ngcobo', 'Phuzekhemisi', 'Juluka', 'Ray Phiri', 'D’Gary', 'Jaojoby'],
    facts: [
      { q: 'Maskanda takes its name from…', a: 'The Afrikaans word musikant, “musician”', w: ['A Zulu word for “thumb”', 'A Durban street', 'The concertina'] },
      { q: 'In maskanda, the izihlabo is…', a: 'The guitar run that opens a song', w: ['The praise poetry', 'The bass line', 'The closing chord'] },
      { q: 'Mbaqanga is named after…', a: 'A maize bread or porridge, everyday food', w: ['A township in Soweto', 'A Zulu dance step', 'A brand of guitar'] },
      { q: 'Which band backed Mahlathini and the Mahotella Queens?', a: 'Makgona Tsohle Band', w: ['Juluka', 'Stimela', 'Ladysmith Black Mambazo'] },
      { q: 'Salegy, from northern Madagascar, is usually felt in…', a: '6/8 (or 12/8)', w: ['5/4', '7/8', 'A slow 4/4'] },
      { q: 'The valiha, Madagascar’s national instrument, is a…', a: 'Tube zither', w: ['Bowed lute', 'Frame drum', 'Bamboo flute'] },
      { q: 'The marabi cycle that runs through South African popular music is built on…', a: 'I, IV and V', w: ['ii, V and I', 'i, ♭VI and ♭VII', 'One chord only'] }
    ],
    era: '1920s–today',
    history: [
      ['1886', 'Gold is found on the Witwatersrand. Johannesburg grows into a city of migrant workers from all over southern Africa, who bring guitars, concertinas, mouth organs and their own songs.'],
      ['1920s–1930s', 'Marabi fills the slumyards and shebeens of Johannesburg: a keyboard or guitar repeating one short chord cycle for hours so people can dance. Its I–IV–I–V loop runs through almost everything that follows.'],
      ['1950s', 'Kwela: boys play penny whistles on street corners over strummed guitars and a one-string bass. Elias and his Zig-Zag Jive Flutes’ “Tom Hark” is a British hit in 1958. In Mozambique, marrabenta grows in the bars of Lourenço Marques (now Maputo).'],
      ['1950s–1960s', 'In Durban, John Bhengu, known as Phuzushukela, turns Zulu guitar songs into a recorded style with a fast picked thumb and finger: the root of modern maskanda.'],
      ['Mid-1960s', 'Mbaqanga: at Gallo’s Mavuthela studio, the Makgona Tsohle Band (Marks Mankwane on guitar, Joseph Makwela on bass, West Nkosi on saxophone) backs Mahlathini’s deep “groaning” voice and the Mahotella Queens.'],
      ['1970s', 'Johnny Clegg and Sipho Mchunu’s Juluka mixes Zulu guitar with rock; their first album “Universal Men” comes out in 1979. In Madagascar salegy goes electric in the northwest.'],
      ['1985–1986', '“The Indestructible Beat of Soweto” takes mbaqanga abroad. Paul Simon’s “Graceland” brings in South African players such as guitarist Ray Phiri and bassist Bakithi Kumalo.'],
      ['1990s–today', 'Maskanda is one of the best-selling styles in KwaZulu-Natal, with players such as Phuzekhemisi and Shiyani Ngcobo. Madagascar’s D’Gary takes Malagasy fingerstyle to festivals worldwide.']
    ],
    substyles: [
      { name: 'Marabi', text: 'The first township dance music, from 1920s Johannesburg: one cycle of I–IV–I–V on piano, organ or guitar, repeated for a whole night.' },
      { name: 'Kwela', text: '1950s street music: penny whistle melodies over strummed guitar and a bouncing bass, with a light swing.' },
      { name: 'Mbaqanga', text: 'Electric township jive from the 1960s: a melodic, driving bass, high picked guitar lines, a saxophone or accordion, and male–female vocal groups.' },
      { name: 'Maskanda', text: 'Zulu guitar music: a solo guitarist-singer, or a band, with an opening run, fast picking, vamping and rapid spoken praises (izibongo).' },
      { name: 'Marrabenta', text: 'Mozambique’s urban dance music from Maputo: bright guitars and fast, light rhythm, with Portuguese and Ronga influences.' },
      { name: 'Salegy', text: 'Fast 6/8 dance music from northern Madagascar, on electric guitars, bass, accordion or keyboard and drums.' },
      { name: 'Tsapiky', text: 'Very fast, bright guitar music from Toliara in the southwest of Madagascar, played at weddings and funerals that go on for days.' },
      { name: 'Malagasy fingerstyle', text: 'Solo acoustic guitar in open tunings, borrowing patterns from the valiha and the marovany zithers.' }
    ],
    traits: {
      rhythm: 'South African styles mostly sit in a swinging or straight 4/4 at dance tempos (110–135), with the bass carrying as much rhythm as the drums. Madagascar’s salegy and tsapiky are in a fast 6/8 that can be felt in two or in three at once.',
      harmony: 'Short cycles of I, IV and V, repeated without a final cadence. Older Zulu and Xhosa music has two roots a whole step apart, from the bow’s two notes, and that sound comes back in maskanda melodies.',
      melody: 'Zulu melodies fall from high to low, and voices enter before the last phrase has ended. Mbaqanga guitar lines are short, repeated and bright; maskanda lines are fast and run across the strings with the thumb answering.',
      form: 'Songs are built from a cycle, not from verses and a bridge: a guitar introduction, sung sections, a long instrumental part, and in maskanda the izibongo, a fast spoken praise over the guitar.',
      sound: 'Clean electric guitar with a pick, high on the neck and close to the bridge for mbaqanga; acoustic or clean electric guitar played with thumb and finger for maskanda. Bass guitars are loud and melodic.'
    },
    essential: [
      { artist: 'Various artists', work: 'The Indestructible Beat of Soweto', year: 1985, kind: 'album', note: 'The famous mbaqanga and maskanda compilation: start here for the guitar and bass sound.' },
      { artist: 'Mahlathini and the Mahotella Queens', work: 'Thokozile', year: 1988, kind: 'album', note: 'Makgona Tsohle Band behind a groaning lead voice and close female harmony: hear how the guitar and bass lock.' },
      { artist: 'Elias and his Zig-Zag Jive Flutes', work: 'Tom Hark', year: 1958, kind: 'track', note: 'Kwela: penny whistle over strummed guitar and the I–IV–I–V cycle.' },
      { artist: 'Juluka', work: 'Universal Men', year: 1979, kind: 'album', note: 'Johnny Clegg and Sipho Mchunu: Zulu guitar picking with folk and rock.' },
      { artist: 'Shiyani Ngcobo', work: 'Introducing Shiyani Ngcobo', year: 2004, kind: 'album', note: 'Old-style maskanda on acoustic guitar: the izihlabo, the picking and the praises.' },
      { artist: 'Busi Mhlongo', work: 'Urbanzulu', year: 1998, kind: 'album', note: 'Maskanda guitar patterns inside a modern band, with a great singer.' },
      { artist: 'Paul Simon', work: 'Graceland', year: 1986, kind: 'album', note: 'South African players on guitar and bass; listen to Bakithi Kumalo’s fretless bass and the township guitar parts.' },
      { artist: 'Ghorwane', work: 'Majurugenta', year: 1993, kind: 'album', note: 'Mozambican marrabenta with bright interlocking guitars and horns.' },
      { artist: 'Henry Kaiser and David Lindley', work: 'A World Out of Time', year: 1992, kind: 'album', note: 'Recorded in Madagascar with D’Gary and many Malagasy musicians: valiha, kabosy and guitar side by side.' }
    ],
    players: [
      { name: 'Marks Mankwane', inst: 'electric guitar', why: 'The mbaqanga lead guitar sound: short, ringing, high lines locked with the bass.' },
      { name: 'Phuzushukela (John Bhengu)', inst: 'guitar, voice', why: 'Shaped maskanda on record with a fast thumb and finger and long runs.' },
      { name: 'Shiyani Ngcobo', inst: 'guitar, voice', why: 'Old-style maskanda: the opening runs, the picking and the praises.' },
      { name: 'Phuzekhemisi', inst: 'guitar, voice', why: 'A modern maskanda star: hear how the band fits around the guitar.' },
      { name: 'Sipho Mchunu and Johnny Clegg', inst: 'guitars, voices', why: 'Zulu street guitar (isishameni style) brought into a band.' },
      { name: 'Ray Phiri', inst: 'electric guitar', why: 'Township jive, soul and jazz in one guitarist; leader of Stimela.' },
      { name: 'Bakithi Kumalo', inst: 'bass', why: 'The singing, sliding township bass that the guitar plays against.' },
      { name: 'D’Gary', inst: 'acoustic guitar', why: 'Malagasy fingerstyle in his own open tunings, fast and percussive.' }
    ],
    study: [
      { title: 'In Township Tonight! South Africa’s Black City Music and Theatre', by: 'David B. Coplan', kind: 'book', note: 'The history of marabi, kwela, mbaqanga and township jazz.' },
      { title: 'Music and Social Change in South Africa: Maskanda Past and Present', by: 'Kathryn Olsen', kind: 'book', note: 'What maskanda is, how it is played and what it means to its players.' },
      { title: 'Nightsong: Performance, Power, and Practice in South Africa', by: 'Veit Erlmann', kind: 'book', note: 'Zulu migrant choral music (isicathamiya): the vocal side of the same world.' }
    ],
    listenFor: [
      'Count how many chords the cycle has, and notice that it never really ends.',
      'Follow the bass for one minute: how often does it play the root on 1?',
      'In mbaqanga, hear the guitar answer the voices in the gaps.',
      'In maskanda, listen for the opening run, then the spoken praises over the guitar.',
      'In salegy, tap two beats per bar, then three: both fit.'
    ],
    practice: [
      'Open the Mbaqanga rhythm in the rhythm library and play offbeat chops on strings 2–4 for a full minute.',
      'In the Repertoire gym, play the Mbaqanga jive cycle and pick a two-bar line that repeats with the loop.',
      'Do the style drill “Maskanda thumb and finger” slowly, then add a falling melody on top.',
      'Loop the Salegy rhythm and accent first in two, then in three, without changing what your hand plays.',
      'Load a Mahlathini or Shiyani Ngcobo track in Transcribe, slow it to 70% and learn the guitar’s opening.'
    ]
  },

  mexico: {
    id: 'mexico', name: 'Mexico', places: 'Jalisco · Mexico City · Monterrey · Veracruz · the Huasteca · Michoacán',
    summary: 'Mexico is a guitar country with a whole family of guitars: the mariachi’s vihuela and guitarrón, the requinto of the romantic trios, the norteño bajo sexto, the jaranas of Veracruz and the Huasteca. Its music runs from mariachi sones in shifting 6/8 and 3/4 to rancheras, boleros and accordion polkas.',
    concepts: ['Sesquiáltera: a bar of 6/8 then a bar of 3/4, the pulse of the son jalisciense and huapango', 'Mánico: the vihuela’s strummed patterns that drive the mariachi', 'Guitarrón bass in octaves under the vihuela', 'The canción ranchera on three accompaniments: vals, polka and bolero', 'Requinto: a small guitar tuned a 4th higher that plays the introductions and fills of the trios', 'Huapango falsetto and the jarana huasteca'],
    instruments: ['Guitar', 'Vihuela mexicana', 'Guitarrón', 'Requinto', 'Bajo sexto', 'Button accordion', 'Jarana', 'Violin', 'Trumpet', 'Harp'],
    rhythms: ['sesqui'], scales: ['major', 'harmmin', 'aeolian', 'mixolydian'],
    guitar: ['Learn the three ranchera accompaniments: vals (bass, strum, strum), polka (bass, strum) and bolero ranchero', 'Strum a son in sesquiáltera: one bar accented in two, the next in three', 'Play thirds and sixths on two strings for introductions, the way a requinto does', 'Use bass runs on strings 5–6 to walk between chords, as the guitarrón does', 'Learn the minor key with its harmonic minor V7: Am, Dm, E7'],
    listen: ['Mariachi Vargas de Tecalitlán', 'Trío Los Panchos', 'José Alfredo Jiménez', 'Pedro Infante', 'Lola Beltrán', 'Chavela Vargas', 'Los Tigres del Norte', 'Lila Downs', 'Natalia Lafourcade'],
    facts: [
      { q: 'The mariachi vihuela has how many strings?', a: 'Five', w: ['Four', 'Six', 'Twelve'] },
      { q: 'The guitarrón is…', a: 'A deep, six-string bass guitar played in octaves', w: ['A large harp', 'A twelve-string lead guitar', 'A drum'] },
      { q: 'The requinto of the romantic trios is tuned…', a: 'A 4th higher than a guitar', w: ['An octave lower', 'A whole step higher', 'In open G'] },
      { q: 'Which trio, formed in New York in 1944, made the requinto famous?', a: 'Trío Los Panchos', w: ['Los Tres Ases', 'Los Macorinos', 'Trío Calaveras'] },
      { q: 'Sesquiáltera alternates…', a: '6/8 and 3/4', w: ['4/4 and 2/4', '5/8 and 7/8', '9/8 and 12/8'] },
      { q: 'Norteño music pairs the button accordion with…', a: 'The bajo sexto', w: ['The harp', 'The tres', 'The cavaquinho'] },
      { q: 'Mariachi was added to UNESCO’s list of intangible heritage in…', a: '2011', w: ['1968', '1994', '2020'] }
    ],
    era: '1850s–today',
    history: [
      ['1500s–1700s', 'Spanish vihuelas, guitars, harps and violins arrive. In the countryside they mix with Indigenous and African music into mestizo sones, each region with its own instruments and dances.'],
      ['1852', 'A priest’s letter from Rosamorada, Nayarit, mentions “mariachis” playing at fiestas: an early written use of the word.'],
      ['1908', 'The Cuarteto Coculense, from Cocula, Jalisco, records in Mexico City: some of the earliest mariachi recordings.'],
      ['1930s', 'Radio (XEW from 1930) and film carry rancheras across the country. “Allá en el Rancho Grande” (1936) starts the comedia ranchera, and mariachis add trumpets. In Texas, Narciso Martínez records accordion polkas with a bajo sexto from 1936.'],
      ['1940s', 'The bolero era: Agustín Lara and Consuelo Velázquez write songs heard around the world. Trío Los Panchos forms in New York in 1944, with Alfredo Gil on requinto.'],
      ['1950s–1960s', 'Mariachi Vargas de Tecalitlán, with arranger Rubén Fuentes, sets the modern mariachi sound. José Alfredo Jiménez writes rancheras that every singer covers. Ritchie Valens turns the son jarocho “La Bamba” into rock and roll in 1958.'],
      ['1970s–1990s', 'Norteño grows on both sides of the border with Los Tigres del Norte. Linda Ronstadt’s “Canciones de Mi Padre” (1987), with Mariachi Vargas, is a huge US hit.'],
      ['2011–today', 'Mariachi is listed as intangible heritage by UNESCO in 2011. Younger artists such as Lila Downs and Natalia Lafourcade, with the guitarists Los Macorinos, bring the old guitar styles back into pop.']
    ],
    substyles: [
      { name: 'Son jalisciense (mariachi son)', text: 'Fast instrumental and sung sones from Jalisco in sesquiáltera, driven by vihuela and guitarrón, with zapateado dancing.' },
      { name: 'Canción ranchera', text: 'Songs of love, pride and loss sung full-voice with mariachi, on a vals, polka or bolero accompaniment.' },
      { name: 'Bolero and the trío romántico', text: 'Three voices and guitars, one of them a requinto playing ornate introductions and fills in thirds and sixths.' },
      { name: 'Huapango (son huasteco)', text: 'From the Huasteca: violin, jarana huasteca and the deep quinta huapanguera, with falsetto breaks in the voice.' },
      { name: 'Son jarocho', text: 'From southern Veracruz: jaranas, requinto jarocho, harp and tarima dancing; “La Bamba” is a son jarocho.' },
      { name: 'Norteño', text: 'Button accordion and bajo sexto from the north, playing polkas, redovas, rancheras and corridos (story songs).' },
      { name: 'Corrido', text: 'Narrative ballads, from the Revolution to today, usually in a polka or vals rhythm.' }
    ],
    traits: {
      rhythm: 'Sones alternate 6/8 and 3/4 (sesquiáltera). Rancheras sit on a vals (3/4), a polka (fast 2/4) or a bolero ranchero (slow 4/4). Norteño is built on the polka and the redova.',
      harmony: 'Mostly I, IV and V7 in major, with secondary dominants (I7 to IV, II7 to V) and a long V7 before the return. Minor keys use the harmonic minor V7, and sones often move between relative major and minor.',
      melody: 'Melodies are written to be sung loud and long, with big held notes, wide leaps and sobs or falsetto breaks. Violins and trumpets play in thirds and sixths; requintos fill in fast runs.',
      form: 'Sones are verses (coplas) with instrumental interludes. Rancheras are verse–chorus songs with a short mariachi introduction and ending. Boleros are often AABA with a requinto introduction.',
      sound: 'In mariachi the vihuela strums high and bright, the guitar fills the middle and the guitarrón plays the bass in octaves. Trios use nylon or steel-string guitars and a requinto; norteño uses a twelve-string bajo sexto with the accordion.'
    },
    essential: [
      { artist: 'Linda Ronstadt with Mariachi Vargas de Tecalitlán', work: 'Canciones de Mi Padre', year: 1987, kind: 'album', note: 'Classic rancheras and huapangos with the most famous mariachi: hear the vihuela and guitarrón.' },
      { artist: 'Agustín Lara', work: 'Solamente una vez', year: 1941, kind: 'track', note: 'A Mexican bolero heard around the world; learn its chords on guitar.' },
      { artist: 'José Alfredo Jiménez', work: 'El rey', year: 1971, kind: 'track', note: 'The ranchera everyone sings: a slow vals with mariachi.' },
      { artist: 'Ritchie Valens', work: 'La Bamba', year: 1958, kind: 'track', note: 'A son jarocho turned into rock and roll: the I–IV–V riff comes from the jarana.' },
      { artist: 'Los Tigres del Norte', work: 'Jefe de jefes', year: 1997, kind: 'album', note: 'Norteño corridos: accordion, bajo sexto and story-telling.' },
      { artist: 'Lila Downs', work: 'La Cantina', year: 2006, kind: 'album', note: 'Rancheras and corridos sung with a modern band and mariachi.' },
      { artist: 'Natalia Lafourcade', work: 'Musas', year: 2017, kind: 'album', note: 'Boleros and Latin American classics with Los Macorinos, Chavela Vargas’s guitarists: a lesson in bolero guitar.' }
    ],
    players: [
      { name: 'Alfredo Gil', inst: 'requinto', why: 'Made the requinto the voice of the romantic trio, with ornate introductions in thirds.' },
      { name: 'Silvestre Vargas', inst: 'violin, bandleader', why: 'Built Mariachi Vargas de Tecalitlán into the model of the modern mariachi.' },
      { name: 'Rubén Fuentes', inst: 'violin, arranger', why: 'The arranger behind the modern mariachi sound; study how the parts fit.' },
      { name: 'José Alfredo Jiménez', inst: 'composer, voice', why: 'Wrote many of the best-known rancheras; learn them to learn the style.' },
      { name: 'Natividad “Nati” Cano', inst: 'vihuela, bandleader', why: 'Led Mariachi Los Camperos in Los Angeles; a master of the vihuela.' },
      { name: 'Narciso Martínez', inst: 'button accordion', why: 'Set the accordion and bajo sexto pairing of conjunto and norteño in the 1930s.' },
      { name: 'Los Macorinos (Juan Carlos Allende and Miguel Peña)', inst: 'guitars', why: 'Two guitars accompanying a singer: bass lines, fills and bolero chords.' },
      { name: 'Gilberto Gutiérrez', inst: 'jarana, voice', why: 'Leader of Mono Blanco and of the son jarocho revival.' }
    ],
    study: [
      { title: 'Mariachi Music in America: Experiencing Music, Expressing Culture', by: 'Daniel Sheehy', kind: 'book', note: 'A short, clear guide to how mariachi works, with musical examples.' },
      { title: 'The Texas-Mexican Conjunto: History of a Working-Class Music', by: 'Manuel Peña', kind: 'book', note: 'Where the accordion and bajo sexto sound comes from.' },
      { title: 'Música Norteña: Mexican Migrants Creating a Nation Between Nations', by: 'Cathy Ragland', kind: 'book', note: 'Norteño and corridos on both sides of the border.' }
    ],
    listenFor: [
      'In a mariachi son, tap along and hear the accents switch between two and three per bar.',
      'Pick out the guitarrón: it plays the bass notes in octaves.',
      'In a ranchera, decide if the band is playing a vals, a polka or a bolero.',
      'In a trio bolero, listen to the requinto’s introduction and where it comes back.',
      'In norteño, hear how the bajo sexto plays bass notes and chords in one part.'
    ],
    practice: [
      'Open the Son jalisciense rhythm in the rhythm library and strum six eighths, accenting 1 and 4, then 1, 3 and 5.',
      'In the Repertoire gym, play the Canción ranchera in G with the vals: bass note, strum, strum.',
      'Do the style drill “Requinto thirds” to learn bolero introductions on two strings.',
      'Play E7 to Am with the E harmonic minor sound: E, F, G♯, A over E7.',
      'Load a Los Panchos or Los Macorinos recording in Transcribe, slow it to 70% and learn one introduction.'
    ]
  },

  colombia: {
    id: 'colombia', name: 'Colombia & Venezuela', places: 'Cartagena · Barranquilla · Valledupar · the Andes · the Llanos · Caracas',
    summary: 'On Colombia’s Caribbean coast, gaita flutes and African drums gave the world cumbia, and the accordion gave it vallenato. In the Andes, guitar, tiple and bandola play bambucos and pasillos, and on the plains of both countries the harp and cuatro drive the joropo. Venezuela also gave the classical guitar some of its best-loved pieces, the waltzes of Antonio Lauro.',
    concepts: ['Cumbia: the scraper’s long–short–short, bass on 1 and 3, chords on the offbeats', 'Vallenato’s four aires: paseo, merengue, son and puya', 'Bambuco: a melody that sounds in 3/4 over an accompaniment in 6/8', 'Joropo: fast 3/4 and 6/8 at once, with the cuatro’s strummed rhythm and the harp’s bass', 'The Venezuelan waltz: a 3/4 that pulls toward 6/8 in the bass', 'Champeta: Congolese and West African guitar in Cartagena'],
    instruments: ['Guitar', 'Tiple', 'Bandola', 'Cuatro', 'Arpa llanera', 'Accordion', 'Caja vallenata', 'Guacharaca', 'Gaitas', 'Tambor alegre', 'Maracas'],
    rhythms: ['cumbia', 'sesqui'], scales: ['major', 'aeolian', 'harmmin', 'mixolydian'],
    guitar: ['Cumbia: strum short chords on every offbeat while a thumb or the bass marks 1 and 3', 'Bambuco: accompany in 6/8 while you hum the melody in 3/4, and feel the two meters together', 'Joropo: learn the cuatro’s rhythm on the top four strings, with a muted stroke', 'Play Lauro’s waltz bass: two notes per bar in 3/4, so it sounds like 6/8', 'Champeta: pick bright, repeating lines high on the neck, as Congolese guitarists do'],
    listen: ['Los Gaiteros de San Jacinto', 'Totó la Momposina', 'Alejo Durán', 'Carlos Vives', 'Antonio Lauro', 'Alirio Díaz', 'Simón Díaz', 'Gentil Montaña', 'Garzón y Collazos'],
    facts: [
      { q: 'The guacharaca in vallenato is a…', a: 'Scraper', w: ['Drum', 'Small guitar', 'Flute'] },
      { q: 'Which is not one of the four aires of vallenato?', a: 'Bambuco', w: ['Paseo', 'Puya', 'Merengue'] },
      { q: 'The Venezuelan cuatro has…', a: 'Four strings', w: ['Three doubled courses', 'Six strings', 'Twelve strings in four triples'] },
      { q: 'The Colombian tiple has twelve strings in…', a: 'Four courses of three', w: ['Six pairs', 'Three courses of four', 'Two courses of six'] },
      { q: 'Antonio Lauro is best known for…', a: 'Venezuelan waltzes for guitar', w: ['Cumbia big band arrangements', 'Vallenato accordion songs', 'Salsa'] },
      { q: 'The Festival de la Leyenda Vallenata takes place in…', a: 'Valledupar', w: ['Cartagena', 'Caracas', 'Medellín'] },
      { q: 'Bambuco is famous because its notation is argued over: is it in…', a: '3/4 or 6/8?', w: ['5/4 or 7/8?', '2/4 or 4/4?', '9/8 or 12/8?'] }
    ],
    era: '1800s–today',
    history: [
      ['1700s–1800s', 'On the Caribbean coast, Indigenous gaita flutes, African drums and Spanish song and dance meet in cumbia, porro and bullerengue. In the Andes, Spanish string instruments become the tiple and the bandola; on the plains, the harp and cuatro become the joropo’s band.'],
      ['1890s', 'In Bogotá, Pedro Morales Pino writes down bambucos and pasillos and forms an estudiantina of bandolas, tiples and guitars.'],
      ['1934', 'Antonio Fuentes founds Discos Fuentes in Cartagena. It records cumbia, porro and vallenato for decades.'],
      ['1940s–1950s', 'Lucho Bermúdez and Pacho Galán bring cumbia and porro into big dance bands, and coastal music becomes the sound of Colombia. In Caracas, Antonio Lauro and Alirio Díaz build the Venezuelan guitar repertoire.'],
      ['1960s', 'Cumbia spreads across Latin America: guitar-led cumbia in Peru (chicha), and new local styles in Mexico and Argentina.'],
      ['1968', 'The first Festival de la Leyenda Vallenata is held in Valledupar; Alejo Durán is crowned the first accordion king.'],
      ['1970s–1980s', 'In Cartagena, sound systems called picós play African records, and local bands make champeta with Congolese-style guitar. Simón Díaz’s “Caballo viejo” (1980) becomes one of the best-known Venezuelan songs.'],
      ['1993–today', 'Carlos Vives’s “Clásicos de la Provincia” makes vallenato pop, and Totó la Momposina takes coastal drumming and song to world stages. Vallenato is added to UNESCO’s list of heritage in need of urgent safeguarding in 2015.']
    ],
    substyles: [
      { name: 'Cumbia', text: 'From the Caribbean coast: gaitas or clarinet over drums, later accordion, big band and guitar. Now played in local forms from Mexico to Argentina.' },
      { name: 'Vallenato', text: 'Accordion, caja and guacharaca from the region around Valledupar, in four aires: paseo, merengue, son and puya.' },
      { name: 'Bambuco and pasillo', text: 'Andean string music for trío (bandola, tiple, guitar) or duo with voices. The bambuco plays 3/4 against 6/8; the pasillo is a quick waltz.' },
      { name: 'Joropo', text: 'The music of the Llanos of Colombia and Venezuela: harp or bandola, cuatro and maracas in fast 3/4 and 6/8, with zapateado dancing.' },
      { name: 'Vals venezolano', text: 'The Venezuelan waltz, played by small string groups and brought to the classical guitar by Antonio Lauro.' },
      { name: 'Champeta', text: 'Afro-Colombian dance music from Cartagena and San Basilio de Palenque, built on soukous and highlife guitar.' },
      { name: 'Currulao', text: 'Afro-Colombian music of the Pacific coast, on the chonta marimba and drums, with call-and-response singing.' }
    ],
    traits: {
      rhythm: 'Cumbia is a cut-time 4/4 with chords on the offbeats. Vallenato’s paseo is a relaxed 4/4 and the puya very fast. Bambuco, joropo and the Venezuelan waltz all play with 3/4 and 6/8 at once.',
      harmony: 'Mostly I, IV and V7 in major or minor, with the harmonic minor V7 in minor keys. Andean music moves between relative major and minor, and Lauro’s waltzes add chromatic chords and modulations.',
      melody: 'Cumbia melodies are short phrases repeated by gaita, clarinet or accordion. Vallenato tells a story in long sung verses with accordion answers. Andean melodies are lyrical and played in thirds by bandola and tiple.',
      form: 'Cumbia and vallenato are verse and chorus with instrumental breaks. Bambucos and pasillos have two or three sections, often with a change of key. Joropo is improvised over fixed chord cycles called golpes and pasajes.',
      sound: 'Coastal bands use accordion or gaitas with drums and scrapers; guitar and bass took over in the cities. Andean trios use bright steel strings on the tiple and bandola with a nylon guitar. Joropo uses the cuatro’s strummed rhythm under a harp.'
    },
    essential: [
      { artist: 'Los Gaiteros de San Jacinto', work: 'Un Fuego de Sangre Pura', year: 2006, kind: 'album', note: 'Cumbia at its root: gaita flutes, tambor alegre, llamador and maracas.' },
      { artist: 'Totó la Momposina', work: 'La Candela Viva', year: 1993, kind: 'album', note: 'Coastal song and drumming: cumbia, bullerengue and mapalé.' },
      { artist: 'Carlos Vives', work: 'Clásicos de la Provincia', year: 1993, kind: 'album', note: 'Classic vallenatos with a band: accordion, caja, guacharaca, guitar and bass.' },
      { artist: 'Various artists', work: 'The Roots of Chicha', year: 2007, kind: 'album', note: 'Peruvian guitar cumbia from the 1960s–70s: cumbia played by electric guitars.' },
      { artist: 'Various artists', work: 'Palenque Palenque: Champeta Criolla & Afro Roots in Colombia 1975–91', year: 2010, kind: 'album', note: 'Champeta and the African guitar styles behind it.' },
      { artist: 'Simón Díaz', work: 'Caballo viejo', year: 1980, kind: 'track', note: 'A Venezuelan song from the plains, in the joropo world, covered around the world.' }
    ],
    players: [
      { name: 'Antonio Lauro', inst: 'guitar, composer', why: 'His Venezuelan waltzes are the way into this music on classical guitar.' },
      { name: 'Alirio Díaz', inst: 'classical guitar', why: 'Played and arranged Venezuelan music for the concert guitar.' },
      { name: 'Gentil Montaña', inst: 'guitar, composer', why: 'Colombian rhythms (bambuco, pasillo, guabina, porro) written for solo guitar.' },
      { name: 'Garzón y Collazos', inst: 'guitars, voices', why: 'The classic Colombian duo of bambucos and pasillos: two guitars and two voices.' },
      { name: 'Cheo Hurtado', inst: 'cuatro', why: 'A modern master of the Venezuelan cuatro; learn its strumming from him.' },
      { name: 'Alejo Durán', inst: 'accordion, voice', why: 'The first vallenato king; hear how the accordion answers the voice.' },
      { name: 'Enrique Delgado', inst: 'electric guitar', why: 'Leader of Los Destellos and a founder of guitar-led Peruvian cumbia.' },
      { name: 'Totó la Momposina', inst: 'voice', why: 'The voice of coastal tradition: learn the rhythms from her band.' }
    ],
    study: [
      { title: 'Music, Race, and Nation: Música Tropical in Colombia', by: 'Peter Wade', kind: 'book', note: 'How coastal music such as cumbia and porro became Colombia’s national sound.' },
      { title: 'Cumbia! Scenes of a Migrant Latin American Music Genre', by: 'Héctor Fernández L’Hoeste and Pablo Vila (eds.)', kind: 'book', note: 'How cumbia changed in each country it reached.' },
      { title: 'Venezuelan Waltzes', by: 'Antonio Lauro', kind: 'method', note: 'The scores themselves, in several editions: start with “Natalia”.' }
    ],
    listenFor: [
      'In cumbia, find the scraper and say its long–short–short with it.',
      'In vallenato, hear when the accordion answers the singer and when it plays alone.',
      'In a bambuco, clap in three with the melody, then in two with the bass.',
      'In joropo, follow the harp’s bass line and the cuatro’s strokes against each other.',
      'In a Lauro waltz, notice the bass playing two notes per bar.'
    ],
    practice: [
      'Open the Cumbia rhythm in the rhythm library and strum short offbeat chords for a full minute.',
      'In the Repertoire gym, play the Cumbia in A minor and comp, then play a melody in thirds over it.',
      'Do the style drill “Bambuco: three against two” slowly, counting out loud.',
      'Learn the cuatro strum on the top four strings in the drill “Joropo cuatro strum”.',
      'Load a Lauro waltz or a vallenato in Transcribe, slow it to 70% and learn the first phrase.'
    ]
  },

  seasia: {
    id: 'seasia', name: 'Mainland Southeast Asia', places: 'Saigon and the Mekong Delta · Hanoi · Bangkok · Isan · Laos · Phnom Penh',
    summary: 'In southern Vietnam, players carved scoops between the frets of the guitar so they could bend and shake notes like the old zithers and lutes, and the guitar phím lõm became a lead instrument of cải lương theatre. In Thailand and Laos, mor lam and luk thung moved the khaen and the phin into electric bands, and in 1960s Phnom Penh, Cambodian singers and guitar bands made a rock music all their own.',
    concepts: ['Guitar phím lõm: a scalloped fretboard for pressed bends (nhấn) and wide vibrato (rung)', 'Vọng cổ: the central song form of cải lương, with lines of growing length', 'Modes as moods: Bắc (bright), Nam and Oán (sorrowful), with notes that waver', 'Thang san and thang yao: the “short” (minor-like) and “long” (major-like) pentatonic of the khaen', 'The phin: three strings, a drone and a fast repeating melody', 'The cycle ends on the strong beat: Thai and Lao music lands on the last beat, not the first'],
    instruments: ['Guitar (phím lõm)', 'Đàn tranh', 'Đàn kìm', 'Đàn bầu', 'Khaen', 'Phin', 'Ching', 'Chapei dang veng', 'Electric guitar', 'Hawaiian steel guitar'],
    rhythms: ['bolero'], scales: ['majpent', 'minpent', 'thai7', 'slendro'],
    guitar: ['Press a note sharp by pushing the string toward the fretboard, not sideways, and let it back slowly: that is nhấn on a normal guitar', 'Play a pentatonic line and decorate one note per phrase with a slow, wide vibrato', 'Phin style: let the open 1st and 2nd strings drone and pick a fast melody on one string against them', 'Thang san: A C D E G; thang yao: C D E G A. Same five notes, different home', 'Luk thung and Khmer rock: clean electric guitar with a little reverb, short tremolo-picked phrases and bends'],
    listen: ['Văn Vĩ', 'Trịnh Công Sơn', 'Suraphol Sombatcharoen', 'Pumpuang Duangjan', 'Chaweewan Dumnern', 'Khun Narin’s Electric Phin Band', 'Sinn Sisamouth', 'Ros Sereysothea', 'Kong Nay'],
    facts: [
      { q: 'Guitar phím lõm means…', a: 'A guitar with a scooped (scalloped) fretboard', w: ['A twelve-string guitar', 'A guitar played on the lap', 'A fretless bass'] },
      { q: 'Vọng cổ grew from the song “Dạ cổ hoài lang”, written in 1919 by…', a: 'Cao Văn Lầu', w: ['Trịnh Công Sơn', 'Văn Vĩ', 'Sinn Sisamouth'] },
      { q: 'Cải lương is…', a: 'A reformed theatre from southern Vietnam', w: ['A Thai boxing rhythm', 'A Cambodian court dance', 'A Lao mouth organ'] },
      { q: 'The khaen is a…', a: 'Bamboo mouth organ', w: ['Three-string lute', 'Pair of small cymbals', 'Bowed fiddle'] },
      { q: 'In Thai music the strong beat of a cycle falls…', a: 'At the end of the cycle', w: ['On the first beat', 'On the second beat', 'Nowhere: it is free'] },
      { q: 'Which singer was called the queen of luk thung?', a: 'Pumpuang Duangjan', w: ['Ros Sereysothea', 'Khánh Ly', 'Pan Ron'] },
      { q: 'Most Cambodian rock musicians of the 1960s and 70s…', a: 'Were killed under the Khmer Rouge (1975–79)', w: ['Emigrated to France in the 1950s', 'Never recorded', 'Played only in Bangkok'] }
    ],
    era: '1910s–today',
    history: [
      ['Late 1910s', 'Cải lương, a reformed theatre with spoken scenes and songs, takes shape in the Mekong Delta out of đờn ca tài tử, the chamber music of southern amateurs.'],
      ['1919', 'Cao Văn Lầu writes “Dạ cổ hoài lang” in Bạc Liêu. Stretched to longer and longer lines, it becomes vọng cổ, the heart of cải lương.'],
      ['1930s–1940s', 'Southern players adopt the guitar and scoop out the wood between the frets so they can bend notes as on the đàn kìm and đàn tranh: the guitar phím lõm. The Hawaiian steel guitar is also popular.'],
      ['1940s', 'In Thailand the government promotes ramwong, a circle dance with a light ching-and-drum rhythm, as a national pastime; Western bands and Latin rhythms shape Thai popular song.'],
      ['1950s–1960s', 'Luk thung (“child of the fields”) becomes the music of rural migrants in Bangkok. Suraphol Sombatcharoen is its first great star, until he is shot in 1968. In Phnom Penh, Sinn Sisamouth and Ros Sereysothea record with rock and soul bands.'],
      ['1975–1979', 'Saigon falls in 1975; much southern music is restricted and lives on in the diaspora. In Cambodia the Khmer Rouge kill most of the country’s musicians.'],
      ['1980s–1990s', 'Mor lam and luk thung grow with electric bands; Pumpuang Duangjan brings electronic sounds to luk thung before her death in 1992. Paris by Night (from 1983) carries Vietnamese song to the diaspora.'],
      ['2010s–today', 'Đờn ca tài tử is listed by UNESCO in 2013 and the chapei dang veng in 2016. The film “Don’t Think I’ve Forgotten” (2014) and bands such as Khun Narin’s Electric Phin Band bring the region’s guitar music to new listeners.']
    ],
    substyles: [
      { name: 'Đờn ca tài tử', text: 'Southern Vietnamese chamber music for amateurs: đàn kìm, đàn tranh, đàn cò and guitar phím lõm playing set pieces with improvised ornaments.' },
      { name: 'Cải lương', text: 'Reformed theatre from the Mekong Delta: spoken drama with songs, above all vọng cổ, accompanied by a small band led by the guitar phím lõm.' },
      { name: 'Nhạc vàng and Vietnamese bolero', text: 'Sentimental southern popular song from the 1950s–70s, often on a slow “bolero” rhythm, with guitar accompaniment.' },
      { name: 'Mor lam (lam)', text: 'Sung poetry from Laos and Isan with khaen, later with phin, bass and drums; mor lam sing is the fast electric dance form.' },
      { name: 'Luk thung', text: 'Thai country song: rural voice and ornaments over a band with brass, keyboards and guitar.' },
      { name: 'Cambodian rock', text: '1960s–70s Phnom Penh: Cambodian singers with surf, garage, soul and Latin bands. Most of its musicians died under the Khmer Rouge.' },
      { name: 'Chapei dang veng', text: 'Cambodian sung storytelling to a two-string long-necked lute, now rare; Kong Nay is its best-known master.' }
    ],
    traits: {
      rhythm: 'Vọng cổ moves slowly in long lines with free ornaments. Thai and Lao music counts in cycles that land on the last beat, marked by the closed “chap” of the small ching cymbals. Mor lam sing and luk thung use fast dance grooves; Khmer rock borrows the twist, the surf beat and Latin rhythms.',
      harmony: 'Traditional music is modal and drone-based: a mode is a set of notes with its own ornaments and mood, not a chord progression. Popular styles add simple chords, often one or two, under pentatonic melodies.',
      melody: 'Pentatonic melodies dominate. In Vietnamese modes some notes are always pressed or shaken, so their pitch moves; Thai tuning is traditionally seven roughly equal steps, between Western pitches.',
      form: 'Vọng cổ is a set of lines (câu) with fixed endings; singers and players fill the lines. Mor lam alternates sung poetry with khaen or phin interludes. Pop songs follow verse and chorus.',
      sound: 'The guitar phím lõm sounds nasal and singing, with deep bends. The phin is bright and droning; in electric bands it is played through a fuzzy amplifier. Khmer rock guitar is clean and reverbed, with organ and farfisa.'
    },
    essential: [
      { artist: 'Various artists', work: 'Longing for the Past: The 78 rpm Era in Southeast Asia', year: 2013, kind: 'album', note: 'Early recordings from the whole region, including cải lương and Thai and Lao music.' },
      { artist: 'Various artists', work: 'Sound of Siam: Leftfield Luk Thung, Jazz & Molam in Thailand 1964–1975', year: 2010, kind: 'album', note: 'Thai luk thung and mor lam on electric guitars, phin and khaen.' },
      { artist: 'Various artists', work: 'Cambodian Rocks', year: 1996, kind: 'album', note: 'The compilation that brought 1960s–70s Phnom Penh rock back to light.' },
      { artist: 'John Pirozzi (dir.)', work: 'Don’t Think I’ve Forgotten', year: 2014, kind: 'film', note: 'The story of Cambodian rock and roll and the musicians who were lost.' },
      { artist: 'Khun Narin’s Electric Phin Band', work: 'Khun Narin’s Electric Phin Band', year: 2014, kind: 'album', note: 'The electric phin: drone strings, fast lines and fuzz.' },
      { artist: 'Various artists', work: 'Hanoi Masters: War Is a Wound, Peace Is a Scar', year: 2013, kind: 'album', note: 'Northern Vietnamese masters of the traditional instruments: hear the bends and vibrato the guitar imitates.' }
    ],
    players: [
      { name: 'Văn Vĩ', inst: 'guitar phím lõm', why: 'A blind master of the scalloped guitar in cải lương: the model for bends and vibrato.' },
      { name: 'Cao Văn Lầu', inst: 'composer', why: 'Wrote the song that became vọng cổ, the core of southern Vietnamese music.' },
      { name: 'Trịnh Công Sơn', inst: 'songwriter, guitar', why: 'Vietnam’s great songwriter: simple guitar chords under unforgettable melodies.' },
      { name: 'Suraphol Sombatcharoen', inst: 'voice, songwriter', why: 'The first star of luk thung; learn the vocal ornaments a guitar can copy.' },
      { name: 'Pumpuang Duangjan', inst: 'voice', why: 'The queen of luk thung, who modernised it with electronic sounds.' },
      { name: 'Khun Narin', inst: 'electric phin', why: 'Phin lines over drones, played loud on the street.' },
      { name: 'Sinn Sisamouth', inst: 'voice, songwriter', why: 'The king of Khmer song: hundreds of songs over rock, Latin and ballad bands.' },
      { name: 'Kong Nay', inst: 'chapei dang veng, voice', why: 'Cambodian sung storytelling on a two-string lute.' }
    ],
    study: [
      { title: 'The Garland Handbook of Southeast Asian Music', by: 'Terry E. Miller and Sean Williams (eds.)', kind: 'book', note: 'Chapters on Vietnam, Thailand, Laos and Cambodia, with their instruments and modes.' },
      { title: 'Traditional Music of the Lao: Kaen Playing and Mawlum Singing in Northeast Thailand', by: 'Terry E. Miller', kind: 'book', note: 'The khaen, its modes (lai) and mor lam singing.' },
      { title: 'Luk Thung: The Culture and Politics of Thailand’s Most Popular Music', by: 'James Mitchell', kind: 'book', note: 'The history and meaning of Thai country song.' }
    ],
    listenFor: [
      'On the guitar phím lõm, hear which notes are pressed sharp and which are left plain.',
      'In vọng cổ, notice the long held endings of each line.',
      'In mor lam, find the drone under the khaen or phin.',
      'In Thai music, listen for the closed “chap” of the ching and count where it falls.',
      'In Khmer rock, compare the singer’s ornaments with the guitar’s.'
    ],
    practice: [
      'Open Thai seven-tone (approx.) over a drone and compare it with A minor pentatonic.',
      'Do the style drill “Nhấn: pressed bends” slowly with a tuner open, aiming each bend at a pitch.',
      'In the Repertoire gym, play the Mor lam vamp and improvise in A thang san (A C D E G).',
      'Open the Ching rhythm in the rhythm library and say “ching, chap” with it until the chap feels like the end.',
      'Load a luk thung or Khmer rock track in Transcribe, slow it to 70% and copy one guitar phrase with its bends.'
    ]
  }
};
