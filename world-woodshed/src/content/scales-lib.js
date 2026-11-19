/* World Woodshed — the scale library (Learn → Scales): every scale beyond D.SCALES and the world scales of
   scales-world.js, loaded on demand (loadScaleLib in lazy.js) and put together by src/scalelib.js.

   Each: id, name, aka, steps (semitones above the tonic, .5 a quarter tone; approximate tunings as decimals),
   fam (the library's families, FAMILIES), region, styles (D.REGIONS ids), note.
   A scale with the same notes as one listed earlier (in D.SCALES, scales-world.js or above it here) is kept as
   its own card under its own name, and src/scalelib.js marks it with the scale it shares its notes with, so the
   finder names one scale and lists the others as its other names. The 72 Carnatic melakartas are made from
   their rule (melakartas()), not typed out.
   Quarter-tone steps are the usual textbook values; real players place them by ear and by tradition. */

export const FAMILIES = [
  ['modes', 'Modes & jazz'], ['sym', 'Symmetric'], ['india', 'India'], ['mideast', 'Middle East'],
  ['europe', 'Europe'], ['africa', 'Africa'], ['eastasia', 'East Asia'], ['seasia', 'Southeast Asia'], ['americas', 'Americas']
];

/* The families of the scales already in D.SCALES and scales-world.js */
export const FAMILY_OF = {
  major: ['modes'], aeolian: ['modes'], majpent: ['modes', 'eastasia', 'africa', 'americas'], minpent: ['modes', 'americas', 'africa', 'eastasia'],
  blues: ['modes', 'americas'], dorian: ['modes', 'europe'], mixolydian: ['modes', 'europe'], phrydom: ['europe', 'mideast'],
  harmmin: ['modes', 'europe'], phrygian: ['modes', 'europe'], lydian: ['modes'], dbharm: ['mideast', 'india', 'europe'],
  hirajoshi: ['eastasia'], inscale: ['eastasia', 'africa'], hungmin: ['europe'], melmin: ['modes'], lyddom: ['modes', 'americas'],
  todi: ['india'], marwa: ['india'], purvi: ['india'], malkauns: ['india', 'eastasia'], misheberakh: ['europe'],
  bayati: ['mideast'], rast: ['mideast'], saba: ['mideast'], yo: ['eastasia'], slendro: ['seasia'], pelog: ['seasia'],
  hoibac: ['seasia'], hoinam: ['seasia'], thai7: ['seasia'], bati: ['africa'], anchihoye: ['africa'], wholetone: ['sym', 'modes'],
  hwdim: ['sym', 'modes'], altered: ['modes'], shur: ['mideast'], chahargah: ['mideast'],
  bilawal: ['india'], bhupali: ['india'], kirwani: ['india'],
  locrian: ['modes'], locnat2: ['modes'], mixb6: ['modes', 'india'], dorb2: ['modes'], lydaug: ['modes'], whdim: ['sym', 'modes'],
  bebopdom: ['modes'], bebopmaj: ['modes'], majblues: ['americas', 'modes'], neapmin: ['modes'], neapmaj: ['modes'], prometheus: ['modes'],
  spanish8: ['europe'], hamsadhwani: ['india'], shivranjani: ['india'], kalavati: ['india'], abhogi: ['india'], jog: ['india'],
  ahirbhairav: ['india'], suznak: ['mideast'], karcigar: ['mideast', 'europe'], homayun: ['mideast'],
  iwato: ['eastasia'], kumoi: ['eastasia'], insen: ['eastasia'], shang: ['eastasia', 'india', 'europe']
};

const M = 'Modes & jazz';
export const LIB_SCALES = [
  // ---- modes of the harmonic minor
  { id: 'locnat6', name: 'Locrian ♮6', aka: '2nd mode of harmonic minor', steps: [0, 1, 3, 5, 6, 9, 10], fam: ['modes'], region: M, styles: ['jazz'], note: 'Locrian with a natural 6th. Over a half-diminished chord in a minor key.' },
  { id: 'ionaug', name: 'Ionian ♯5', aka: '3rd mode of harmonic minor · Ionian augmented', steps: [0, 2, 4, 5, 8, 9, 11], fam: ['modes'], region: M, styles: ['jazz'], note: 'Major with a raised 5th, for maj7♯5 chords.' },
  { id: 'lydsh2', name: 'Lydian ♯2', aka: '6th mode of harmonic minor', steps: [0, 3, 4, 6, 7, 9, 11], fam: ['modes'], region: M, styles: ['jazz'], note: 'Lydian with a raised 2nd: bright, with a bluesy rub between ♯2 and 3.' },
  { id: 'ultraloc', name: 'Ultralocrian', aka: '7th mode of harmonic minor · Super Locrian 𝄫7', steps: [0, 1, 3, 4, 6, 8, 9], fam: ['modes'], region: M, styles: ['jazz'], note: 'The altered scale with a double-flat 7th: fits a diminished 7th chord with tensions.' },

  // ---- harmonic major and its modes
  { id: 'harmmaj', name: 'Harmonic major', aka: 'Major with a ♭6 · Raga Nat Bhairav · Sarasangi (Carnatic)', steps: [0, 2, 4, 5, 7, 8, 11], fam: ['modes', 'india'], region: 'Classical · Jazz · India', styles: ['jazz', 'classical', 'hindustani', 'carnatic'], note: 'A major scale with the minor 6th of harmonic minor. Its iv chord is minor, which gives a bittersweet plagal cadence.' },
  { id: 'dorb5', name: 'Dorian ♭5', aka: '2nd mode of harmonic major · Locrian ♮2 ♮6', steps: [0, 2, 3, 5, 6, 9, 10], fam: ['modes'], region: M, styles: ['jazz'], note: 'Dorian with a flat 5th: a brighter half-diminished sound.' },
  { id: 'phryb4', name: 'Phrygian ♭4', aka: '3rd mode of harmonic major', steps: [0, 1, 3, 4, 7, 8, 10], fam: ['modes'], region: M, styles: ['jazz'], note: 'Phrygian with the 4th lowered to a major 3rd, so it holds both 3rds.' },
  { id: 'lydb3', name: 'Lydian ♭3', aka: '4th mode of harmonic major · Melodic minor ♯4', steps: [0, 2, 3, 6, 7, 9, 11], fam: ['modes', 'india'], region: M, styles: ['jazz'], note: 'Minor with a raised 4th, natural 6th and major 7th: a minor-major 7th chord with a ♯11.' },
  { id: 'mixb2', name: 'Mixolydian ♭2', aka: '5th mode of harmonic major', steps: [0, 1, 4, 5, 7, 9, 10], fam: ['modes'], region: M, styles: ['jazz'], note: 'A dominant scale with a ♭9 and a natural 13.' },
  { id: 'lydaugsh2', name: 'Lydian augmented ♯2', aka: '6th mode of harmonic major', steps: [0, 3, 4, 6, 8, 9, 11], fam: ['modes'], region: M, styles: ['jazz'], note: 'Raised 2nd, 4th and 5th over a major 3rd.' },
  { id: 'locbb7', name: 'Locrian 𝄫7', aka: '7th mode of harmonic major', steps: [0, 1, 3, 5, 6, 8, 9], fam: ['modes'], region: M, styles: ['jazz'], note: 'Locrian with a double-flat 7th: a diminished 7th chord with ♭9, 11 and ♭13.' },

  // ---- modes of the double harmonic
  { id: 'lydsh2sh6', name: 'Lydian ♯2 ♯6', aka: '2nd mode of double harmonic', steps: [0, 3, 4, 6, 7, 10, 11], fam: ['modes'], region: M, styles: [], note: 'Two augmented 2nds, between ♭2 and 3 shifted up: an unusual bright mode.' },
  { id: 'ultraphry', name: 'Ultraphrygian', aka: '3rd mode of double harmonic', steps: [0, 1, 3, 4, 7, 8, 9], fam: ['modes'], region: M, styles: [], note: 'Phrygian with a flat 4th and a double-flat 7th.' },
  { id: 'oriental', name: 'Oriental scale', aka: '5th mode of double harmonic', steps: [0, 1, 4, 5, 6, 9, 10], fam: ['modes', 'mideast'], region: 'Western name', styles: [], note: 'A ♭2 and a ♭5 over a major 3rd. The name is a Western label, not a scale from one tradition.' },
  { id: 'ionaugsh2', name: 'Ionian augmented ♯2', aka: '6th mode of double harmonic', steps: [0, 3, 4, 5, 8, 9, 11], fam: ['modes'], region: M, styles: [], note: 'Raised 2nd and 5th over a major 3rd.' },
  { id: 'locbb3bb7', name: 'Locrian 𝄫3 𝄫7', aka: '7th mode of double harmonic', steps: [0, 1, 2, 5, 6, 8, 9], fam: ['modes'], region: M, styles: [], note: 'Three half steps at the bottom: the most crowded mode of the double harmonic.' },

  // ---- modes of the Neapolitan major and minor
  { id: 'leadwt', name: 'Leading whole-tone', aka: '2nd mode of Neapolitan major', steps: [0, 2, 4, 6, 8, 10, 11], fam: ['modes'], region: M, styles: [], note: 'The whole-tone scale with a leading note: six whole steps and one half step home.' },
  { id: 'lydaugdom', name: 'Lydian augmented dominant', aka: '3rd mode of Neapolitan major', steps: [0, 2, 4, 6, 8, 9, 10], fam: ['modes'], region: M, styles: [], note: 'Raised 4th and 5th with a flat 7th.' },
  { id: 'lydmin', name: 'Lydian minor', aka: '4th mode of Neapolitan major', steps: [0, 2, 4, 6, 7, 8, 10], fam: ['modes'], region: M, styles: [], note: 'Major and Lydian below, minor above: a ♯4 with a ♭6 and ♭7.' },
  { id: 'majloc', name: 'Major Locrian', aka: '5th mode of Neapolitan major · Arabian scale (Western name)', steps: [0, 2, 4, 5, 6, 8, 10], fam: ['modes'], region: M, styles: [], note: 'A major 3rd under a Locrian top: ♭5, ♭6, ♭7.' },
  { id: 'altnat2', name: 'Super Locrian ♮2', aka: '6th mode of Neapolitan major · Altered ♮2', steps: [0, 2, 3, 4, 6, 8, 10], fam: ['modes'], region: M, styles: [], note: 'The altered scale with a natural 9th in place of the ♭9.' },
  { id: 'altbb3', name: 'Super Locrian 𝄫3', aka: '7th mode of Neapolitan major', steps: [0, 1, 2, 4, 6, 8, 10], fam: ['modes'], region: M, styles: [], note: 'Half step, half step, then whole steps: a whole-tone scale with a ♭2.' },
  { id: 'lydsh6', name: 'Lydian ♯6', aka: '2nd mode of Neapolitan minor', steps: [0, 2, 4, 6, 7, 10, 11], fam: ['modes'], region: M, styles: [], note: 'Lydian with a raised 6th, which sits a half step under the major 7th.' },
  { id: 'mixaug', name: 'Mixolydian augmented', aka: '3rd mode of Neapolitan minor', steps: [0, 2, 4, 5, 8, 9, 10], fam: ['modes'], region: M, styles: [], note: 'Mixolydian with a raised 5th.' },
  { id: 'locdom', name: 'Locrian dominant', aka: '5th mode of Neapolitan minor', steps: [0, 1, 4, 5, 6, 8, 10], fam: ['modes'], region: M, styles: [], note: 'A dominant 7♭5 chord with ♭9 and ♭13 around it.' },
  { id: 'ionsh2', name: 'Ionian ♯2', aka: '6th mode of Neapolitan minor', steps: [0, 3, 4, 5, 7, 8, 11], fam: ['modes'], region: M, styles: [], note: 'Raised 2nd, natural 3rd and a ♭6 over a major 7th.' },
  { id: 'ultralocbb3', name: 'Ultralocrian 𝄫3', aka: '7th mode of Neapolitan minor', steps: [0, 1, 2, 4, 5, 7, 8], fam: ['modes'], region: M, styles: [], note: 'Three half steps then whole steps: rarely played, but it completes the family.' },

  // ---- bebop, blues and other jazz scales
  { id: 'bebopmin', name: 'Bebop minor', aka: 'Dorian with a passing major 3rd', steps: [0, 2, 3, 4, 5, 7, 9, 10], fam: ['modes'], region: 'Jazz', styles: ['jazz'], note: 'Eight notes, so the chord tones of a minor 7th chord land on the beat in a run of eighths.' },
  { id: 'bebopdor', name: 'Bebop Dorian', aka: 'Dorian with a passing major 7th', steps: [0, 2, 3, 5, 7, 9, 10, 11], fam: ['modes'], region: 'Jazz', styles: ['jazz'], note: 'Another way to add a passing note to Dorian, between ♭7 and the root.' },
  { id: 'bebopmelmin', name: 'Bebop melodic minor', aka: 'Melodic minor with a passing ♭6', steps: [0, 2, 3, 5, 7, 8, 9, 11], fam: ['modes'], region: 'Jazz', styles: ['jazz'], note: 'The passing note between 5 and 6 keeps the chord tones on the beat.' },
  { id: 'compblues', name: 'Composite blues', aka: 'Major and minor blues together', steps: [0, 2, 3, 4, 5, 6, 7, 9, 10], fam: ['americas', 'modes'], region: 'USA', styles: ['blues', 'jazz'], note: 'Nine notes: the two pentatonics and the blue note. What most blues players move through.' },
  { id: 'majhex', name: 'Major hexatonic', aka: 'Major without the 7th', steps: [0, 2, 4, 5, 7, 9], fam: ['modes', 'europe'], region: 'Celtic · Folk', styles: ['celtic', 'country'], note: 'Six notes. Many Irish and Scottish tunes leave out the 7th, so they fit both major and Mixolydian.' },
  { id: 'minhex', name: 'Minor hexatonic', aka: 'Dorian and Aeolian without the 6th', steps: [0, 2, 3, 5, 7, 10], fam: ['modes', 'europe'], region: 'Celtic · Rock', styles: ['celtic', 'rock'], note: 'The minor pentatonic with a 2nd: no 6th, so it fits Dorian and natural minor alike.' },
  { id: 'mixhex', name: 'Mixolydian hexatonic', aka: 'Mixolydian without the 3rd', steps: [0, 2, 5, 7, 9, 10], fam: ['modes', 'europe'], region: 'Celtic', styles: ['celtic'], note: 'No 3rd, so neither major nor minor: common in pipe tunes.' },
  { id: 'dompent', name: 'Dominant pentatonic', aka: 'Major pentatonic with a ♭7 for the 6th', steps: [0, 2, 4, 7, 10], fam: ['modes'], region: 'Jazz · Funk', styles: ['jazz', 'funksoul'], note: 'Root, 9, 3, 5, ♭7: the chord tones of a dominant 9th as a five-note scale.' },
  { id: 'min6pent', name: 'Minor 6 pentatonic', aka: 'Minor pentatonic with a 6th for the ♭7', steps: [0, 3, 5, 7, 9], fam: ['modes'], region: 'Jazz', styles: ['jazz'], note: 'A Dorian-coloured pentatonic for minor 6th chords.' },
  { id: 'majb6pent', name: 'Major ♭6 pentatonic', aka: 'Major pentatonic with a ♭6', steps: [0, 2, 4, 7, 8], fam: ['modes'], region: 'Jazz', styles: ['jazz'], note: 'One changed note gives a darker major sound, used by modern jazz players over dominant chords.' },
  { id: 'minb5pent', name: 'Minor ♭5 pentatonic', aka: 'Minor pentatonic with a ♭5 for the 5th', steps: [0, 3, 5, 6, 10], fam: ['modes'], region: 'Jazz', styles: ['jazz'], note: 'The chord tones of a half-diminished chord with an 11th.' },
  { id: 'enigmatic', name: 'Enigmatic scale', aka: 'Scala enigmatica (Verdi)', steps: [0, 1, 4, 6, 8, 10, 11], fam: ['modes'], region: 'Italy · Classical', styles: ['classical'], note: 'Verdi harmonised this odd scale in his Ave Maria (1889), from a puzzle printed in a Milan music journal.' },
  { id: 'persianw', name: 'Persian scale (Western name)', aka: 'Double harmonic with a ♭5', steps: [0, 1, 4, 5, 6, 8, 11], fam: ['modes'], region: 'Western name', styles: [], note: 'The name comes from Western scale books; Persian music itself uses the dastgahs.' },
  { id: 'prometheusnea', name: 'Prometheus Neapolitan', aka: 'Prometheus with a ♭2', steps: [0, 1, 4, 6, 9, 10], fam: ['modes'], region: 'Classical', styles: ['classical'], note: 'Scriabin’s six-note scale with the 2nd lowered.' },
  { id: 'algerian', name: 'Algerian scale (Western name)', aka: 'Hungarian minor with a passing 4th', steps: [0, 2, 3, 5, 6, 7, 8, 11], fam: ['modes'], region: 'Western name', styles: [], note: 'Eight notes, from Western scale books: both the 4th and the raised 4th under an augmented 2nd at the top.' },
  { id: 'hungmaj', name: 'Hungarian major', aka: 'Lydian dominant with a ♯2', steps: [0, 3, 4, 6, 7, 9, 10], fam: ['europe'], region: 'Hungary', styles: ['classical'], note: 'Raised 2nd and 4th over a dominant chord.' },
  { id: 'romanmaj', name: 'Romanian major', aka: 'Lydian dominant ♭2', steps: [0, 1, 4, 6, 7, 9, 10], fam: ['europe'], region: 'Romania', styles: ['turkbalkan'], note: 'A ♭2 and ♯4 over a dominant 7th.' },

  // ---- symmetric scales
  { id: 'augmented', name: 'Augmented scale', aka: 'Hexatonic: minor 3rd, half step', steps: [0, 3, 4, 7, 8, 11], fam: ['sym', 'modes'], region: 'Jazz · Classical', styles: ['jazz'], note: 'Two augmented triads a half step apart. It repeats every major 3rd, so it has four keys.' },
  { id: 'augmented2', name: 'Augmented scale (half step first)', aka: 'Six-tone symmetrical', steps: [0, 1, 4, 5, 8, 9], fam: ['sym'], region: 'Jazz · Classical', styles: ['jazz'], note: 'The other mode of the augmented scale: half step, minor 3rd, again and again.' },
  { id: 'tritone', name: 'Tritone scale', aka: 'Two major triads a tritone apart', steps: [0, 1, 4, 6, 7, 10], fam: ['sym'], region: 'Jazz · Classical', styles: ['jazz'], note: 'The notes of a dominant 7th and its tritone substitute together. Stravinsky’s Petrushka chord lives here.' },
  { id: 'twosemi', name: 'Two-semitone tritone scale', aka: 'Messiaen’s fifth mode (one mode of it)', steps: [0, 1, 2, 6, 7, 8], fam: ['sym'], region: 'Classical', styles: ['classical'], note: 'Three notes a half step apart, then again a tritone up.' },
  { id: 'messiaen3', name: 'Messiaen mode 3', aka: 'Third mode of limited transposition', steps: [0, 2, 3, 4, 6, 7, 8, 10, 11], fam: ['sym'], region: 'France · Classical', styles: ['classical'], note: 'Whole step, half, half, three times. It repeats every major 3rd, so it has four keys. From Messiaen’s book The Technique of My Musical Language (1944).' },
  { id: 'messiaen4', name: 'Messiaen mode 4', aka: 'Fourth mode of limited transposition', steps: [0, 1, 2, 5, 6, 7, 8, 11], fam: ['sym'], region: 'France · Classical', styles: ['classical'], note: 'It repeats every tritone, so it has six keys.' },
  { id: 'messiaen6', name: 'Messiaen mode 6', aka: 'Sixth mode of limited transposition', steps: [0, 2, 4, 5, 6, 8, 10, 11], fam: ['sym'], region: 'France · Classical', styles: ['classical'], note: 'Two whole steps and two half steps, twice in an octave.' },
  { id: 'messiaen7', name: 'Messiaen mode 7', aka: 'Seventh mode of limited transposition', steps: [0, 1, 2, 3, 5, 6, 7, 8, 9, 11], fam: ['sym'], region: 'France · Classical', styles: ['classical'], note: 'Ten notes: every note but two a tritone apart.' },
  { id: 'chromatic', name: 'Chromatic scale', aka: 'All twelve notes', steps: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], fam: ['sym'], region: 'Everywhere', styles: [], note: 'Every fret. Any scale is a choice from it.' },

  // ---- India: Hindustani ragas and thaats, Carnatic janya ragas (melakartas are made below)
  { id: 'hindol', name: 'Raga Hindol', aka: 'Kalyan thaat · Sunadavinodini (Carnatic)', steps: [0, 4, 6, 9, 11], fam: ['india'], region: 'North India', styles: ['hindustani'], note: 'A spring raga of five notes: Sa Ga tivra Ma Dha Ni, no Re and no Pa.' },
  { id: 'lalit', name: 'Raga Lalit', aka: 'Both Ma, no Pa', steps: [0, 1, 4, 5, 6, 8, 11], fam: ['india'], region: 'North India', styles: ['hindustani'], note: 'A dawn raga with shuddh and tivra Ma side by side and no Pa. Usually sung with komal Dha.' },
  { id: 'vibhas', name: 'Raga Vibhas', aka: 'Bhairav thaat', steps: [0, 1, 4, 7, 8], fam: ['india'], region: 'North India', styles: ['hindustani'], note: 'Bhairav’s notes without Ma and Ni: Sa komal Re Ga Pa komal Dha. A morning raga.' },
  { id: 'chandrakauns', name: 'Raga Chandrakauns', aka: 'Malkauns with shuddh Ni', steps: [0, 3, 5, 8, 11], fam: ['india'], region: 'North India', styles: ['hindustani'], note: 'Malkauns with a natural 7th: Sa komal Ga Ma komal Dha shuddh Ni. A late-night raga.' },
  { id: 'yamankalyan', name: 'Raga Yaman Kalyan', aka: 'Yaman with a touch of shuddh Ma · Japanese Ichikosucho', steps: [0, 2, 4, 5, 6, 7, 9, 11], fam: ['india', 'eastasia'], region: 'North India', styles: ['hindustani'], note: 'Yaman, with shuddh Ma slipped in coming down (Ga Ma Ga Re). Eight notes in all.' },
  { id: 'bhinnashadja', name: 'Raga Bhinna Shadja', aka: 'No Re, no Pa', steps: [0, 4, 5, 9, 11], fam: ['india'], region: 'North India', styles: ['hindustani'], note: 'Sa Ga Ma Dha Ni: all shuddh, without Re and Pa.' },
  { id: 'brindavani', name: 'Raga Brindavani Sarang', aka: 'Both Ni', steps: [0, 2, 5, 7, 10, 11], fam: ['india'], region: 'North India', styles: ['hindustani'], note: 'A midday raga: Sa Re Ma Pa with shuddh Ni going up and komal Ni coming down.' },
  { id: 'madhuvanti', name: 'Raga Madhuvanti', aka: 'Dharmavati (Carnatic) · Todi-like with shuddh Re', steps: [0, 2, 3, 6, 7, 9, 11], fam: ['india'], region: 'North India', styles: ['hindustani', 'carnatic'], note: 'Komal Ga and tivra Ma with every other note shuddh: an evening raga.' },
  { id: 'gunkali', name: 'Raga Gunkali', aka: 'Bhairav thaat, pentatonic', steps: [0, 1, 5, 7, 8], fam: ['india'], region: 'North India', styles: ['hindustani'], note: 'Sa komal Re Ma Pa komal Dha: Bhairav without Ga and Ni.' },
  { id: 'bairagi', name: 'Raga Bairagi', aka: 'Bairagi Bhairav · Revati (Carnatic)', steps: [0, 1, 5, 7, 10], fam: ['india'], region: 'India', styles: ['hindustani', 'carnatic'], note: 'Sa komal Re Ma Pa komal Ni: a morning raga made popular by Pandit Ravi Shankar.' },
  { id: 'amritavarshini', name: 'Raga Amritavarshini', aka: 'Carnatic pentatonic', steps: [0, 4, 6, 7, 11], fam: ['india'], region: 'South India', styles: ['carnatic'], note: 'Sa Ga prati Ma Pa Ni: in legend, Muthuswami Dikshitar sang it to bring rain.' },
  { id: 'hamsanandi', name: 'Raga Hamsanandi', aka: 'Carnatic hexatonic · Raga Sohini’s notes', steps: [0, 1, 4, 6, 9, 11], fam: ['india'], region: 'South India', styles: ['carnatic'], note: 'Six notes with no Pa, from the 53rd melakarta Gamanashrama.' },
  { id: 'nagaswaravali', name: 'Raga Nagaswaravali', aka: 'Carnatic pentatonic', steps: [0, 4, 5, 7, 9], fam: ['india'], region: 'South India', styles: ['carnatic'], note: 'Sa Ga Ma Pa Dha: the major scale without Re and Ni.' },
  { id: 'bhoopalam', name: 'Raga Bhoopalam', aka: 'Carnatic pentatonic · Balinese pelog (12-note approximation)', steps: [0, 1, 3, 7, 8], fam: ['india', 'seasia'], region: 'South India · Bali', styles: ['carnatic', 'eastasia'], note: 'Sa Ri1 Ga2 Pa Da1: a morning raga of five notes. Western scale books call the same notes the Balinese scale.' },
  { id: 'valaji', name: 'Raga Valaji', aka: 'Carnatic pentatonic', steps: [0, 4, 7, 9, 10], fam: ['india'], region: 'South India', styles: ['carnatic'], note: 'Sa Ga Pa Da Ni2: no Ri and no Ma. Hindustani Kalavati has the same notes.' },
  { id: 'durga', name: 'Raga Durga', aka: 'Shuddha Saveri (Carnatic)', steps: [0, 2, 5, 7, 9], fam: ['india'], region: 'India', styles: ['hindustani', 'carnatic'], note: 'Sa Re Ma Pa Dha: no Ga and no Ni. The same notes as the Japanese Yo scale.' },
  { id: 'hindolam', name: 'Raga Hindolam', aka: 'Carnatic Malkauns', steps: [0, 3, 5, 8, 10], fam: ['india'], region: 'South India', styles: ['carnatic'], note: 'Sa Ga2 Ma Da1 Ni2: the Carnatic name for Malkauns’s notes (not the Hindustani Hindol).' },
  { id: 'mohanam', name: 'Raga Mohanam', aka: 'Carnatic Bhupali', steps: [0, 2, 4, 7, 9], fam: ['india'], region: 'South India', styles: ['carnatic'], note: 'Sa Ri2 Ga3 Pa Da2: one of the best-loved Carnatic ragas, on the major pentatonic.' },
  { id: 'madhyamavati', name: 'Raga Madhyamavati', aka: 'Carnatic pentatonic', steps: [0, 2, 5, 7, 10], fam: ['india'], region: 'South India', styles: ['carnatic'], note: 'Sa Ri2 Ma1 Pa Ni2: a raga often sung to close a concert.' },
  { id: 'udayaravi', name: 'Raga Udayaravichandrika', aka: 'Shuddha Dhanyasi', steps: [0, 3, 5, 7, 10], fam: ['india'], region: 'South India', styles: ['carnatic'], note: 'Sa Ga2 Ma1 Pa Ni2: the Carnatic minor pentatonic.' },
  { id: 'marwathaat', name: 'Marwa thaat', aka: 'Gamanashrama (Carnatic)', steps: [0, 1, 4, 6, 7, 9, 11], fam: ['india'], region: 'North India', styles: ['hindustani'], note: 'The parent scale of Marwa, Puriya and Sohini: komal Re and tivra Ma, with Pa (which those ragas mostly leave out).' },
  { id: 'kafi', name: 'Kafi thaat', aka: 'Raga Kafi · Kharaharapriya (Carnatic)', steps: [0, 2, 3, 5, 7, 9, 10], fam: ['india'], region: 'North India', styles: ['hindustani'], note: 'Komal Ga and komal Ni: the parent of Bageshri, Bhimpalasi and many light classical songs.' },
  { id: 'khamaj', name: 'Khamaj thaat', aka: 'Raga Khamaj · Harikambhoji (Carnatic)', steps: [0, 2, 4, 5, 7, 9, 10], fam: ['india'], region: 'North India', styles: ['hindustani'], note: 'All shuddh but komal Ni. The thumri and light classical favourite.' },
  { id: 'asavari', name: 'Asavari thaat', aka: 'Natabhairavi (Carnatic) · Raga Jaunpuri, Darbari', steps: [0, 2, 3, 5, 7, 8, 10], fam: ['india'], region: 'North India', styles: ['hindustani'], note: 'Komal Ga, Dha and Ni: the parent of Darbari Kanada and Jaunpuri.' },
  { id: 'bhairavi', name: 'Bhairavi thaat', aka: 'Raga Bhairavi · Hanumatodi (Carnatic)', steps: [0, 1, 3, 5, 7, 8, 10], fam: ['india'], region: 'North India', styles: ['hindustani'], note: 'Every note that can be komal is komal. Raga Bhairavi traditionally closes a concert.' },
  { id: 'kalyan', name: 'Kalyan thaat', aka: 'Raga Yaman · Mechakalyani (Carnatic)', steps: [0, 2, 4, 6, 7, 9, 11], fam: ['india'], region: 'North India', styles: ['hindustani'], note: 'All shuddh but tivra Ma: the first evening raga a student learns.' },
  { id: 'bhairavthaat', name: 'Bhairav thaat', aka: 'Raga Bhairav · Mayamalavagowla (Carnatic)', steps: [0, 1, 4, 5, 7, 8, 11], fam: ['india'], region: 'North India', styles: ['hindustani'], note: 'Komal Re and komal Dha: a dawn raga. Carnatic students learn their first exercises in Mayamalavagowla.' },

  // ---- Arab world, Turkey, Persia, Greece
  { id: 'sikah', name: 'Maqam Sikah', aka: 'Segâh (Turkish)', steps: [0, 1.5, 3.5, 5.5, 7, 8.5, 10.5], fam: ['mideast'], region: 'Arab world · Turkey', styles: ['arabic', 'turkbalkan'], note: 'Its home is the half-flat E itself, so it starts on a quarter tone. A maqam of Qur’an recitation and of much Egyptian song.' },
  { id: 'huzam', name: 'Maqam Huzam', aka: 'Hüzzam (Turkish)', steps: [0, 1.5, 3.5, 4.5, 7.5, 8.5, 10.5], fam: ['mideast'], region: 'Arab world · Turkey', styles: ['arabic', 'turkbalkan'], note: 'Sikah below, then a Hijaz above the 3rd: the augmented 2nd gives it its ache.' },
  { id: 'iraq', name: 'Maqam Iraq', aka: 'Sikah family', steps: [0, 1.5, 3.5, 5, 6.5, 8.5, 10.5], fam: ['mideast'], region: 'Arab world', styles: ['arabic'], note: 'A Sikah with Bayati above it, so three of its notes are a quarter tone off the frets.' },
  { id: 'jiharkah', name: 'Maqam Jiharkah', aka: 'Ajam family', steps: [0, 2, 4, 5, 7, 9, 10.5], fam: ['mideast'], region: 'Arab world', styles: ['arabic'], note: 'Major below, with a 7th a quarter tone under the major 7th.' },
  { id: 'nairuz', name: 'Maqam Nairuz', aka: 'Rast family · Nayruz', steps: [0, 2, 3.5, 5, 7, 8.5, 10], fam: ['mideast'], region: 'Arab world', styles: ['arabic'], note: 'Rast below and Bayati above the 5th.' },
  { id: 'mahurarab', name: 'Maqam Mahur', aka: 'Rast family (Arab)', steps: [0, 2, 3.5, 5, 7, 9, 11], fam: ['mideast'], region: 'Arab world', styles: ['arabic'], note: 'Rast with a natural 7th: the half-flat 3rd under a bright top. (Persian Mahur is another thing: the major scale.)' },
  { id: 'husayni', name: 'Maqam Husayni', aka: 'Hüseyni (Turkish) · Bayati family', steps: [0, 1.5, 3, 5, 7, 8.5, 10], fam: ['mideast'], region: 'Arab world · Turkey', styles: ['arabic', 'turkbalkan'], note: 'Bayati with a half-flat 6th: Bayati on the tonic and again on the 5th.' },
  { id: 'hijazrast', name: 'Maqam Hijaz (with Rast above)', aka: 'Hicaz (Turkish)', steps: [0, 1, 4, 5, 7, 8.5, 10], fam: ['mideast'], region: 'Arab world · Turkey', styles: ['arabic', 'turkbalkan'], note: 'Hijaz as Arab musicians often play it: the augmented 2nd below, and Rast on the 4th with its half-flat 6th. (On a piano it becomes Phrygian dominant.)' },
  { id: 'sabazamzam', name: 'Maqam Saba Zamzam', aka: 'Greek Sabah (on a fretted bouzouki)', steps: [0, 1, 3, 4, 7, 8, 10], fam: ['mideast', 'europe'], region: 'Arab world · Greece', styles: ['arabic', 'turkbalkan'], note: 'Saba with its 2nd lowered to a half step, so it fits the frets. Greek rebetiko players call it Sabah.' },
  { id: 'atharkurd', name: 'Maqam Athar Kurd', aka: 'Kurd with Nikriz above', steps: [0, 1, 3, 6, 7, 8, 11], fam: ['mideast'], region: 'Arab world', styles: ['arabic'], note: 'Kurd below, then a raised 4th and a leading note above.' },
  { id: 'kurd', name: 'Maqam Kurd', aka: 'Kürdi (Turkish) · Phrygian', steps: [0, 1, 3, 5, 7, 8, 10], fam: ['mideast'], region: 'Arab world · Turkey', styles: ['arabic', 'turkbalkan'], note: 'The maqam with Phrygian’s notes: no quarter tones, so it plays as written on any guitar.' },
  { id: 'nahawand', name: 'Maqam Nahawand', aka: 'Nihavend (Turkish)', steps: [0, 2, 3, 5, 7, 8, 11], fam: ['mideast'], region: 'Arab world · Turkey', styles: ['arabic', 'turkbalkan'], note: 'Harmonic minor going up; coming down it often takes the minor 7th (Kurd above).' },
  { id: 'ajam', name: 'Maqam Ajam', aka: 'Acem (Turkish) · the major scale', steps: [0, 2, 4, 5, 7, 9, 11], fam: ['mideast'], region: 'Arab world', styles: ['arabic'], note: 'The maqam with the notes of the major scale.' },
  { id: 'ushshaq', name: 'Makam Uşşak', aka: 'Turkish Bayati', steps: [0, 1.5, 3, 5, 7, 8, 10], fam: ['mideast'], region: 'Turkey', styles: ['turkbalkan'], note: 'The Turkish relative of Bayati. Turkish theory places its 2nd a little differently (by commas), but on a guitar it is the same quarter-flat 2nd.' },
  { id: 'nikriz', name: 'Maqam Nikriz', aka: 'Greek Nikriz · Romanian minor', steps: [0, 2, 3, 6, 7, 9, 10], fam: ['mideast'], region: 'Arab world · Greece · Romania', styles: ['arabic', 'turkbalkan', 'klezmer'], note: 'A raised 4th after a minor 3rd: the same notes as the klezmer Mi Sheberakh.' },
  { id: 'mahur', name: 'Dastgah Mahur', aka: 'Persian · the major scale', steps: [0, 2, 4, 5, 7, 9, 11], fam: ['mideast'], region: 'Iran', styles: ['persian'], note: 'The Persian dastgah with the major scale’s notes: festive and bright.' },
  { id: 'rastpanjgah', name: 'Dastgah Rast-Panjgah', aka: 'Persian', steps: [0, 2, 4, 5, 7, 9, 10], fam: ['mideast'], region: 'Iran', styles: ['persian'], note: 'A Persian dastgah on the notes of the Mixolydian mode, known for its many modulations.' },
  { id: 'hitzaz', name: 'Dromos Hitzaz', aka: 'Greek rebetiko', steps: [0, 1, 4, 5, 7, 8, 10], fam: ['europe', 'mideast'], region: 'Greece', styles: ['turkbalkan'], note: 'The rebetiko form of Hijaz, played on the frets of a bouzouki.' },
  { id: 'ousak', name: 'Dromos Ousak', aka: 'Greek rebetiko', steps: [0, 1, 3, 5, 7, 8, 10], fam: ['europe'], region: 'Greece', styles: ['turkbalkan'], note: 'The Greek, fretted form of Uşşak: on a bouzouki its quarter-flat 2nd becomes a ♭2.' },
  { id: 'piraiotikos', name: 'Dromos Piraiotikos', aka: 'Greek rebetiko', steps: [0, 1, 4, 6, 7, 8, 11], fam: ['europe'], region: 'Greece', styles: ['turkbalkan'], note: 'Named after Piraeus, the port where rebetiko grew: ♭2, 3 and ♯4 at the bottom.' },
  { id: 'hitzazkiar', name: 'Dromos Hitzazkiar', aka: 'Greek rebetiko · Hijaz Kar', steps: [0, 1, 4, 5, 7, 8, 11], fam: ['europe'], region: 'Greece', styles: ['turkbalkan'], note: 'Two augmented 2nds: the double harmonic scale as rebetiko players name it.' },

  // ---- Europe: klezmer, flamenco, Romani and folk
  { id: 'ahavaraba', name: 'Ahava Raba', aka: 'Freygish · klezmer', steps: [0, 1, 4, 5, 7, 8, 10], fam: ['europe'], region: 'Klezmer', styles: ['klezmer'], note: 'The most characteristic klezmer mode, named after a prayer: Phrygian dominant’s notes.' },
  { id: 'adonaimalakh', name: 'Adonai Malakh', aka: 'Klezmer · Jewish prayer mode', steps: [0, 2, 4, 5, 7, 9, 10], fam: ['europe'], region: 'Klezmer', styles: ['klezmer'], note: 'A prayer mode like Mixolydian, often with a minor 3rd an octave up.' },
  { id: 'magenavot', name: 'Magen Avot', aka: 'Klezmer · Jewish prayer mode', steps: [0, 2, 3, 5, 7, 8, 10], fam: ['europe'], region: 'Klezmer', styles: ['klezmer'], note: 'A prayer mode like natural minor.' },
  { id: 'andalusian', name: 'Andalusian Phrygian', aka: 'Flamenco mode on E (por arriba)', steps: [0, 1, 4, 5, 7, 8, 10], fam: ['europe'], region: 'Spain', styles: ['flamenco'], note: 'The Phrygian of flamenco takes a major 3rd over its home chord (E major in a piece on E), with the minor 3rd in the melody.' },
  { id: 'gypsymaj', name: 'Gypsy major (Western name)', aka: 'Double harmonic', steps: [0, 1, 4, 5, 7, 8, 11], fam: ['europe'], region: 'Western name', styles: [], note: 'Another Western book name for the double harmonic.' },

  // ---- Africa
  { id: 'tizitamaj', name: 'Tizita (major)', aka: 'Ethiopian qenet', steps: [0, 2, 4, 7, 9], fam: ['africa'], region: 'Ethiopia', styles: ['centraleast'], note: 'The qenet of longing and memory, named after a song form. Its major form has the major pentatonic’s notes.' },
  { id: 'tizitamin', name: 'Tizita (minor)', aka: 'Ethiopian qenet', steps: [0, 2, 3, 7, 8], fam: ['africa'], region: 'Ethiopia', styles: ['centraleast'], note: 'The minor form of Tizita: the same notes as the Japanese Hirajoshi.' },
  { id: 'batimin', name: 'Bati (minor)', aka: 'Ethiopian qenet', steps: [0, 3, 5, 7, 10], fam: ['africa'], region: 'Ethiopia', styles: ['centraleast'], note: 'The minor form of Bati, on the minor pentatonic’s notes.' },
  { id: 'ambassel', name: 'Ambassel', aka: 'Ethiopian qenet', steps: [0, 1, 5, 7, 8], fam: ['africa'], region: 'Ethiopia', styles: ['centraleast'], note: 'Named after a mountain region. Half steps above the 1st and 5th, like the Japanese In scale.' },
  { id: 'amadinda', name: 'Kiganda equipentatonic (approx.)', aka: 'Amadinda and akadinda xylophones, Uganda', steps: [0, 2.4, 4.8, 7.2, 9.6], fam: ['africa'], region: 'Uganda', styles: ['centraleast'], note: 'The xylophones of the Buganda court are tuned to five roughly equal steps, each about 240 cents. Every instrument differs a little.' },
  { id: 'equihepta', name: 'Equiheptatonic (approx.)', aka: 'Chopi timbila (Mozambique) · some Mande balafons', steps: [0, 1.71, 3.43, 5.14, 6.86, 8.57, 10.29], fam: ['africa'], region: 'Mozambique · West Africa', styles: ['southernafrica', 'westafrica'], note: 'Seven nearly equal steps of about 171 cents, as measured on Chopi xylophones and some balafons. Tunings vary by maker.' },

  // ---- East Asia
  { id: 'pyeongjo', name: 'Pyeongjo', aka: 'Korean', steps: [0, 2, 5, 7, 9], fam: ['eastasia'], region: 'Korea', styles: ['eastasia'], note: 'The Korean “even” mode, calm and bright, on the notes of the Yo scale.' },
  { id: 'gyemyeonjo', name: 'Gyemyeonjo', aka: 'Korean', steps: [0, 3, 5, 7, 10], fam: ['eastasia'], region: 'Korea', styles: ['eastasia'], note: 'The Korean plaintive mode, on the minor pentatonic’s notes; in folk song the 2nd and 3rd are often bent.' },
  { id: 'yayue', name: 'Yayue scale', aka: 'Chinese court music · Lydian', steps: [0, 2, 4, 6, 7, 9, 11], fam: ['eastasia'], region: 'China', styles: ['eastasia'], note: 'The seven-note scale of Chinese court ritual music: the gong pentatonic with a raised 4th and a major 7th.' },
  { id: 'qingyue', name: 'Qingyue scale', aka: 'Chinese · major', steps: [0, 2, 4, 5, 7, 9, 11], fam: ['eastasia'], region: 'China', styles: ['eastasia'], note: 'The Chinese seven-note scale with the major scale’s notes.' },
  { id: 'yanyue', name: 'Yanyue scale', aka: 'Chinese banquet music · Mixolydian', steps: [0, 2, 4, 5, 7, 9, 10], fam: ['eastasia'], region: 'China', styles: ['eastasia'], note: 'The seven-note scale of Chinese banquet music, with a flat 7th.' },
  { id: 'ryukyu', name: 'Ryukyu scale', aka: 'Okinawan', steps: [0, 4, 5, 7, 11], fam: ['eastasia'], region: 'Okinawa', styles: ['eastasia'], note: 'The sound of the sanshin: no 2nd and no 6th, with a major 7th.' },
  { id: 'chinese', name: 'Chinese scale (Western name)', aka: 'Lydian pentatonic', steps: [0, 4, 6, 7, 11], fam: ['eastasia'], region: 'Western name', styles: [], note: 'A Western book name; Chinese music itself is built on the five-note gong, shang, jue, zhi and yu modes.' },
  { id: 'taishikicho', name: 'Taishikicho', aka: 'Japanese gagaku', steps: [0, 2, 4, 5, 6, 7, 9, 10, 11], fam: ['eastasia'], region: 'Japan', styles: ['eastasia'], note: 'A gagaku mode with both 4ths and both 7ths, as Western scale books give it.' },
  { id: 'mongolian', name: 'Mongolian pentatonic', aka: 'Major pentatonic', steps: [0, 2, 4, 7, 9], fam: ['eastasia'], region: 'Mongolia', styles: ['eastasia'], note: 'Long song and morin khuur tunes are mostly built on these five notes.' },

  // ---- Southeast Asia
  { id: 'pelogbem', name: 'Pelog bem (12-note approx.)', aka: 'Javanese gamelan', steps: [0, 1, 3, 7, 8], fam: ['seasia'], region: 'Java', styles: ['eastasia'], note: 'A five-note selection from pelog, rounded to the frets. Real gamelans are tuned between them and differ from one set to the next.' },
  { id: 'slendro12', name: 'Slendro (12-note approx.)', aka: 'Javanese gamelan', steps: [0, 2, 5, 7, 9], fam: ['seasia'], region: 'Java · Bali', styles: ['eastasia'], note: 'Slendro’s near-equal steps rounded to the frets: a pentatonic. The true tuning is in Slendro (approx.).' },

  // ---- Americas
  { id: 'baiao', name: 'Baião mode', aka: 'Northeast Brazil · Lydian dominant', steps: [0, 2, 4, 6, 7, 9, 10], fam: ['americas'], region: 'Brazil', styles: ['brazil'], note: 'The raised 4th and flat 7th of Luiz Gonzaga’s baião and the forró that followed it.' },
  { id: 'nordestino', name: 'Nordestino Mixolydian', aka: 'Northeast Brazil', steps: [0, 2, 4, 5, 7, 9, 10], fam: ['americas'], region: 'Brazil', styles: ['brazil'], note: 'The flat 7th of the sanfona (accordion) and the viola caipira in northeastern song.' },
  { id: 'huayno', name: 'Andean pentatonic', aka: 'Huayno', steps: [0, 3, 5, 7, 10], fam: ['americas'], region: 'Peru · Bolivia · Ecuador', styles: ['latam'], note: 'Huayno and many Andean tunes sit on the minor pentatonic, often with its relative major in the same tune.' },
  { id: 'bluesmaj', name: 'Major blues (country)', aka: 'Major pentatonic with ♭3', steps: [0, 2, 3, 4, 7, 9], fam: ['americas'], region: 'USA', styles: ['country', 'blues'], note: 'The ♭3 that slides into the 3rd in bluegrass, western swing and country leads.' }
];

/* The 72 melakartas: Sa and Pa fixed, Ma shuddha (1–36) or prati (37–72), then Ri–Ga in six ways (the chakra)
   and Da–Ni in six ways within it. */
const MELA_NAMES = ['Kanakangi', 'Ratnangi', 'Ganamurti', 'Vanaspati', 'Manavati', 'Tanarupi', 'Senavati', 'Hanumatodi', 'Dhenuka',
  'Natakapriya', 'Kokilapriya', 'Rupavati', 'Gayakapriya', 'Vakulabharanam', 'Mayamalavagowla', 'Chakravakam', 'Suryakantam',
  'Hatakambari', 'Jhankaradhvani', 'Natabhairavi', 'Kiravani', 'Kharaharapriya', 'Gourimanohari', 'Varunapriya', 'Mararanjani',
  'Charukesi', 'Sarasangi', 'Harikambhoji', 'Dheerasankarabharanam', 'Naganandini', 'Yagapriya', 'Ragavardhini', 'Gangeyabhushani',
  'Vagadheeswari', 'Shulini', 'Chalanata', 'Salagam', 'Jalarnavam', 'Jhalavarali', 'Navaneetam', 'Pavani', 'Raghupriya', 'Gavambhodi',
  'Bhavapriya', 'Shubhapantuvarali', 'Shadvidamargini', 'Suvarnangi', 'Divyamani', 'Dhavalambari', 'Namanarayani', 'Kamavardhini',
  'Ramapriya', 'Gamanashrama', 'Vishwambari', 'Shamalangi', 'Shanmukhapriya', 'Simhendramadhyamam', 'Hemavati', 'Dharmavati',
  'Neetimati', 'Kantamani', 'Rishabhapriya', 'Latangi', 'Vachaspati', 'Mechakalyani', 'Chitrambari', 'Sucharitra', 'Jyotiswarupini',
  'Dhatuvardhani', 'Nasikabhushani', 'Kosalam', 'Rasikapriya'];
const CHAKRAS = ['Indu', 'Netra', 'Agni', 'Veda', 'Bana', 'Rutu', 'Rishi', 'Vasu', 'Brahma', 'Disi', 'Rudra', 'Aditya'];
const RG = [[1, 2, 'Ri1 Ga1'], [1, 3, 'Ri1 Ga2'], [1, 4, 'Ri1 Ga3'], [2, 3, 'Ri2 Ga2'], [2, 4, 'Ri2 Ga3'], [3, 4, 'Ri3 Ga3']];
const DN = [[8, 9, 'Da1 Ni1'], [8, 10, 'Da1 Ni2'], [8, 11, 'Da1 Ni3'], [9, 10, 'Da2 Ni2'], [9, 11, 'Da2 Ni3'], [10, 11, 'Da3 Ni3']];
export function melakartas() {
  return MELA_NAMES.map((name, i) => {
    const n = i + 1, ma = n <= 36 ? 5 : 6, k = i % 36, rg = RG[Math.floor(k / 6)], dn = DN[k % 6];
    const vivadi = rg[0] === 1 && rg[1] === 2 || rg[0] === 3 || dn[0] === 8 && dn[1] === 9 || dn[0] === 10;
    return { id: 'mela' + n, name: 'Melakarta ' + n + ': ' + name, aka: 'Carnatic parent scale · ' + CHAKRAS[Math.floor(i / 6)] + ' chakra',
      steps: [0, rg[0], rg[1], ma, 7, dn[0], dn[1]], fam: ['india'], region: 'South India', styles: ['carnatic'],
      note: 'Sa ' + rg[2] + ' Ma' + (ma === 5 ? '1' : '2') + ' Pa ' + dn[2] + '. One of the 72 parent scales of Carnatic music, ordered by a fixed rule: ' +
        (n <= 36 ? 'the first 36 have shuddha (natural) Ma, ' : 'the last 36 have prati (raised) Ma, ') + 'and each chakra of six shares its Ri and Ga.' +
        (vivadi ? ' A vivadi mela: two of its notes are spelled as different swaras but sit next to each other, which makes it sound tense.' : '') };
  });
}
