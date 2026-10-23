/* World Woodshed — content library */
import INDEX from 'virtual:content-index';
import STYLES_A from './content/styles-a.js';
import STYLES_B from './content/styles-b.js';
import STYLES_NEW from './content/styles-new.js';
import EX_VARS from './content/exercise-vars.js';
import RHY_VAR from './content/rhythms-var.js';
import RHY_NEW from './content/rhythms-new.js';
const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const NOTE_FULL = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'];

/* ---------- Intervals with anchor songs ---------- */
const INTERVALS = [
  { id: 'm2', semi: 1, name: 'Minor 2nd', up: 'Jaws theme', down: 'Für Elise', feel: 'tense, rubbing' },
  { id: 'M2', semi: 2, name: 'Major 2nd', up: 'Frère Jacques', down: 'Mary Had a Little Lamb', feel: 'a plain step' },
  { id: 'm3', semi: 3, name: 'Minor 3rd', up: 'Greensleeves', down: 'Hey Jude', feel: 'dark, minor' },
  { id: 'M3', semi: 4, name: 'Major 3rd', up: 'When the Saints Go Marching In', down: 'Summertime', feel: 'bright, major' },
  { id: 'P4', semi: 5, name: 'Perfect 4th', up: 'Here Comes the Bride', down: 'Eine Kleine Nachtmusik', feel: 'open, a call to start' },
  { id: 'TT', semi: 6, name: 'Tritone', up: 'The Simpsons theme', down: 'Black Sabbath (the song)', feel: 'unstable, wants to move' },
  { id: 'P5', semi: 7, name: 'Perfect 5th', up: 'Star Wars main theme', down: 'The Flintstones theme', feel: 'hollow, strong' },
  { id: 'm6', semi: 8, name: 'Minor 6th', up: 'The Entertainer (the jump after the opening run)', down: '', feel: 'bittersweet' },
  { id: 'M6', semi: 9, name: 'Major 6th', up: 'My Bonnie Lies Over the Ocean', down: "Nobody Knows the Trouble I've Seen", feel: 'warm, wide' },
  { id: 'm7', semi: 10, name: 'Minor 7th', up: 'Star Trek (original theme)', down: '', feel: 'bluesy, unresolved' },
  { id: 'M7', semi: 11, name: 'Major 7th', up: "Don't Know Why (Norah Jones)", down: '', feel: 'almost an octave, yearning' },
  { id: 'P8', semi: 12, name: 'Octave', up: 'Somewhere Over the Rainbow', down: '', feel: 'same note, higher' }
];

/* ---------- Chord qualities ---------- */
const CHORDS = [
  { id: 'maj', name: 'Major', iv: [0, 4, 7], tier: 1 },
  { id: 'min', name: 'Minor', iv: [0, 3, 7], tier: 1 },
  { id: 'dim', name: 'Diminished', iv: [0, 3, 6], tier: 2 },
  { id: 'aug', name: 'Augmented', iv: [0, 4, 8], tier: 2 },
  { id: 'sus4', name: 'Sus4', iv: [0, 5, 7], tier: 2 },
  { id: 'maj7', name: 'Major 7', iv: [0, 4, 7, 11], tier: 3 },
  { id: 'dom7', name: 'Dominant 7', iv: [0, 4, 7, 10], tier: 3 },
  { id: 'm7', name: 'Minor 7', iv: [0, 3, 7, 10], tier: 3 },
  { id: 'm7b5', name: 'Half-diminished', iv: [0, 3, 6, 10], tier: 4 },
  { id: 'dim7', name: 'Diminished 7', iv: [0, 3, 6, 9], tier: 4 },
  { id: 'six', name: 'Major 6', iv: [0, 4, 7, 9], tier: 4 },
  { id: 'm6', name: 'Minor 6', iv: [0, 3, 7, 9], tier: 4 },
  { id: 'sus2', name: 'Sus2', iv: [0, 2, 7], tier: 4 },
  { id: 'mMaj7', name: 'Minor-major 7', iv: [0, 3, 7, 11], tier: 5 },
  { id: 'nine', name: 'Dominant 9', iv: [0, 4, 7, 10, 14], tier: 5 },
  { id: 'sharp9', name: '7♯9', iv: [0, 4, 7, 10, 15], tier: 5 },
  { id: 'flat9', name: '7♭9', iv: [0, 4, 7, 10, 13], tier: 5 },
  { id: 'maj9', name: 'Major 9', iv: [0, 4, 7, 11, 14], tier: 5 }
];

/* ---------- Scale degrees ---------- */
const DEGREES = [
  { id: '1', semi: 0, solf: 'Do', sargam: 'Sa', tier: 1 },
  { id: '3', semi: 4, solf: 'Mi', sargam: 'Ga', tier: 1 },
  { id: '5', semi: 7, solf: 'Sol', sargam: 'Pa', tier: 1 },
  { id: '2', semi: 2, solf: 'Re', sargam: 'Re', tier: 2 },
  { id: '4', semi: 5, solf: 'Fa', sargam: 'Ma', tier: 2 },
  { id: '6', semi: 9, solf: 'La', sargam: 'Dha', tier: 3 },
  { id: '7', semi: 11, solf: 'Ti', sargam: 'Ni', tier: 3 },
  { id: '♭7', semi: 10, solf: 'Te', sargam: 'komal Ni', tier: 4 },
  { id: '♭3', semi: 3, solf: 'Me', sargam: 'komal Ga', tier: 4 },
  { id: '♯4', semi: 6, solf: 'Fi', sargam: 'tivra Ma', tier: 5 },
  { id: '♭6', semi: 8, solf: 'Le', sargam: 'komal Dha', tier: 5 },
  { id: '♭2', semi: 1, solf: 'Ra', sargam: 'komal Re', tier: 5 }
];

/* ---------- Diatonic progression chords ---------- */
const NUMERALS = [
  { id: 'I', root: 0, q: 'maj', tier: 1 },
  { id: 'IV', root: 5, q: 'maj', tier: 1 },
  { id: 'V', root: 7, q: 'maj', tier: 1 },
  { id: 'vi', root: 9, q: 'min', tier: 2 },
  { id: 'ii', root: 2, q: 'min', tier: 3 },
  { id: 'iii', root: 4, q: 'min', tier: 4 },
  { id: '♭VII', root: 10, q: 'maj', tier: 5 }
];

/* ---------- World scales, ragas, maqamat ---------- */
// steps in semitones; .5 = quarter tone
const SCALES = [
  { id: 'major', name: 'Major (Ionian)', aka: 'Bilawal thaat · Shankarabharanam', steps: [0, 2, 4, 5, 7, 9, 11], tier: 1, region: 'Everywhere', note: 'The reference scale for most Western music.' },
  { id: 'aeolian', name: 'Natural minor', aka: 'Aeolian · Asavari thaat · Natabhairavi', steps: [0, 2, 3, 5, 7, 8, 10], tier: 1, region: 'Everywhere', note: 'Sad-sounding minor; the relative minor of major.' },
  { id: 'majpent', name: 'Major pentatonic', aka: 'Raga Bhupali · Chinese gong mode · Ethiopian Tizita (major)', steps: [0, 2, 4, 7, 9], tier: 1, region: 'China · India · Ethiopia · West Africa', note: 'Five notes with no half steps. Found on every continent.' },
  { id: 'minpent', name: 'Minor pentatonic', aka: 'Chinese yu mode', steps: [0, 3, 5, 7, 10], tier: 1, region: 'Blues · West Africa · Andes · China', note: 'The rock and blues workhorse; also central to Andean huayno.' },
  { id: 'blues', name: 'Blues scale', aka: 'Minor pentatonic + ♭5', steps: [0, 3, 5, 6, 7, 10], tier: 1, region: 'USA', note: 'Adds the "blue note" between 4 and 5.' },
  { id: 'dorian', name: 'Dorian', aka: 'Kafi thaat · Kharaharapriya', steps: [0, 2, 3, 5, 7, 9, 10], tier: 2, region: 'Jazz · Celtic · India', note: 'Minor with a bright natural 6th.' },
  { id: 'mixolydian', name: 'Mixolydian', aka: 'Khamaj thaat · Harikambhoji', steps: [0, 2, 4, 5, 7, 9, 10], tier: 2, region: 'Celtic · Blues · India', note: 'Major with a flat 7th. Many Irish tunes use it.' },
  { id: 'phrydom', name: 'Phrygian dominant', aka: 'Maqam Hijaz (on a piano) · Freygish · flamenco mode', steps: [0, 1, 4, 5, 7, 8, 10], tier: 2, region: 'Spain · Arab world · Klezmer · Balkans', note: 'The step-and-a-half between ♭2 and 3 gives the "Middle Eastern" sound.' },
  { id: 'harmmin', name: 'Harmonic minor', aka: 'Maqam Nahawand (ascending) · Kiravani', steps: [0, 2, 3, 5, 7, 8, 11], tier: 2, region: 'Gypsy jazz · Arab world · Classical', note: 'Minor with a raised 7th leading home.' },
  { id: 'phrygian', name: 'Phrygian', aka: 'Maqam Kurd · Bhairavi thaat · Hanumatodi', steps: [0, 1, 3, 5, 7, 8, 10], tier: 3, region: 'Spain · Arab world · India', note: 'Minor with a dark flat 2nd.' },
  { id: 'lydian', name: 'Lydian', aka: 'Raga Yaman / Kalyan thaat · Kalyani', steps: [0, 2, 4, 6, 7, 9, 11], tier: 3, region: 'India · Film music · Jazz', note: 'Major with a raised 4th (tivra Ma). Yaman is an evening raga.' },
  { id: 'dbharm', name: 'Double harmonic', aka: 'Raga Bhairav · Mayamalavagowla · Hijaz Kar', steps: [0, 1, 4, 5, 7, 8, 11], tier: 3, region: 'India · Arab world · Turkey', note: 'Two augmented 2nds. Bhairav is a dawn raga.' },
  { id: 'hirajoshi', name: 'Hirajoshi', aka: 'Japanese koto tuning', steps: [0, 2, 3, 7, 8], tier: 3, region: 'Japan', note: 'A pentatonic koto tuning with half steps.' },
  { id: 'inscale', name: 'In (Miyako-bushi)', aka: 'Ethiopian Ambassel (approx.)', steps: [0, 1, 5, 7, 8], tier: 3, region: 'Japan · Ethiopia', note: 'Pentatonic with half steps above 1 and 5.' },
  { id: 'hungmin', name: 'Hungarian minor', aka: 'Gypsy minor', steps: [0, 2, 3, 6, 7, 8, 11], tier: 4, region: 'Hungary · Romani music', note: 'Harmonic minor with a raised 4th.' },
  { id: 'melmin', name: 'Melodic minor', aka: 'Jazz minor', steps: [0, 2, 3, 5, 7, 9, 11], tier: 4, region: 'Jazz', note: 'Minor with major 6th and 7th; source of altered sounds.' },
  { id: 'lyddom', name: 'Lydian dominant', aka: 'Baião mode · Vachaspati', steps: [0, 2, 4, 6, 7, 9, 10], tier: 4, region: 'Brazil · Jazz', note: 'Raised 4th and flat 7th; the sound of northeast Brazil.' },
  { id: 'todi', name: 'Todi thaat', aka: 'Raga Miyan ki Todi', steps: [0, 1, 3, 6, 7, 8, 11], tier: 4, region: 'North India', note: 'Komal Re, Ga, Dha with tivra Ma. A morning raga family.' },
  { id: 'marwa', name: 'Raga Marwa', aka: 'Marwa thaat (6 notes, no Pa)', steps: [0, 1, 4, 6, 9, 11], tier: 4, region: 'North India', note: 'A sunset raga that avoids the 5th.' },
  { id: 'purvi', name: 'Purvi thaat', aka: 'Raga Purvi', steps: [0, 1, 4, 6, 7, 8, 11], tier: 4, region: 'North India', note: 'Komal Re and Dha with tivra Ma.' },
  { id: 'malkauns', name: 'Raga Malkauns', aka: 'Chinese yu-like (5 notes)', steps: [0, 3, 5, 8, 10], tier: 4, region: 'North India', note: 'A deep late-night pentatonic raga.' },
  { id: 'misheberakh', name: 'Misheberakh', aka: 'Ukrainian Dorian · Altered Dorian', steps: [0, 2, 3, 6, 7, 9, 10], tier: 4, region: 'Klezmer', note: 'Dorian with a raised 4th; a weeping klezmer mode.' },
  { id: 'bayati', name: 'Maqam Bayati', aka: 'Jins Bayati on the tonic', steps: [0, 1.5, 3, 5, 7, 8, 10], tier: 5, region: 'Arab world · Turkey', note: 'The 2nd is a quarter tone flat. On guitar: bend from the ♭2 fret halfway.' },
  { id: 'rast', name: 'Maqam Rast', aka: 'The "mother" maqam', steps: [0, 2, 3.5, 5, 7, 9, 10.5], tier: 5, region: 'Arab world · Turkey · Persia', note: 'The 3rd and 7th sit a quarter tone below major.' },
  { id: 'saba', name: 'Maqam Saba', aka: 'Jins Saba', steps: [0, 1.5, 3, 4, 7, 8, 10], tier: 5, region: 'Arab world', note: 'A sorrowful maqam with a quarter-tone 2nd and a flat 4th.' },
  { id: 'yo', name: 'Yo scale', aka: 'Japanese folk pentatonic', steps: [0, 2, 5, 7, 9], tier: 5, region: 'Japan', note: 'Pentatonic without half steps, used in folk songs.' },
  { id: 'slendro', name: 'Slendro (approx.)', aka: 'Javanese and Balinese gamelan', steps: [0, 2.4, 4.8, 7.2, 9.6], tier: 5, region: 'Indonesia', note: 'Five roughly equal steps. Each gamelan has its own tuning.' },
  { id: 'pelog', name: 'Pelog (approx.)', aka: 'Gamelan 5-note selection', steps: [0, 1.2, 2.7, 6.6, 7.5], tier: 5, region: 'Indonesia', note: 'Uneven steps, small and large. Tunings vary by gamelan.' },
  { id: 'bati', name: 'Bati (major)', aka: 'Ethiopian qenet', steps: [0, 4, 5, 7, 11], tier: 5, region: 'Ethiopia', note: 'Pentatonic with the major 7th; heard in Ethio-jazz.' },
  { id: 'anchihoye', name: 'Anchihoye', aka: 'Ethiopian qenet', steps: [0, 1, 5, 6, 9], tier: 5, region: 'Ethiopia', note: 'A striking pentatonic with two half steps.' },
  { id: 'wholetone', name: 'Whole tone', aka: 'Augmented scale of Debussy and bebop', steps: [0, 2, 4, 6, 8, 10], tier: 4, region: 'Jazz · Impressionism', note: 'Six notes, all whole steps. Dreamy and unresolved; fits 7♯5 chords.' },
  { id: 'hwdim', name: 'Half-whole diminished', aka: 'Dominant diminished · octatonic', steps: [0, 1, 3, 4, 6, 7, 9, 10], tier: 4, region: 'Jazz', note: 'Alternating half and whole steps. Fits 7♭9 chords and repeats every minor 3rd.' },
  { id: 'altered', name: 'Altered (super Locrian)', aka: '7th mode of melodic minor', steps: [0, 1, 3, 4, 6, 8, 10], tier: 5, region: 'Jazz', note: 'Every tension on a dominant chord at once: ♭9, ♯9, ♯11 and ♭13.' },
  { id: 'shur', name: 'Dastgah Shur', aka: 'Persian · close to Maqam Bayati', steps: [0, 1.5, 3, 5, 7, 8, 10], tier: 5, region: 'Iran', note: 'The 2nd is koron, about a quarter tone flat. Shur is the parent of several other Persian modes.' },
  { id: 'chahargah', name: 'Dastgah Chahargah', aka: 'Persian', steps: [0, 1.5, 4, 5, 7, 8.5, 11], tier: 5, region: 'Iran', note: 'Two koron notes (2nd and 6th), each followed by a wide step. Bright and heroic.' }
];

/* ---------- Rhythm library ----------
   Track strings: x = hit, X = accent, . = rest. One char per step.
   target = the track you tap in tap-along tests.
*/
const RHYTHMS = [
  { id: 'son32', name: 'Son clave 3-2', region: 'cuba', meter: '4/4 (one bar here, two in the slow count)', steps: 16, spb: 4, bpm: 100, tier: 1, target: 'clave', alt: '1 & 2 & 3 & 4 & 1 & 2 & 3 & 4 &'.split(' '),
    tracks: { clave: 'X..x..x...x.x...', bell: 'x...x...x...x...', high: '....x...........', mid: '............x.x.', low: '......x.....x...' },
    note: 'The key pattern of Cuban son and salsa. Every part locks to it. Here one bar is one round: clave on 1, the a of 1, the & of 2, the & of 3 and 4. Many teachers count the same round twice as slowly, over two bars (the “slow” row): 1, 2 &, 4, then 2, 3. It is the same rhythm.' },
  { id: 'son23', name: 'Son clave 2-3', region: 'cuba', meter: '4/4 (one bar here, two in the slow count)', steps: 16, spb: 4, bpm: 100, tier: 2, target: 'clave', alt: '1 & 2 & 3 & 4 & 1 & 2 & 3 & 4 &'.split(' '),
    tracks: { clave: '..X.x...x..x..x.', bell: 'x...x...x...x...', high: '....x...........', mid: '............x.x.', low: '......x.....x...' },
    note: 'The same clave, started from its second half: the two-hit half comes first. Here it plays on the & of 1, 2, 3, the a of 3 and the & of 4 (in the slow count: 2, 3, then 1, 2 &, 4). Songs pick one way round and keep it.' },
  { id: 'rumba32', name: 'Rumba clave 3-2', region: 'cuba', meter: '4/4 (one bar here, two in the slow count)', steps: 16, spb: 4, bpm: 105, tier: 2, target: 'clave', alt: '1 & 2 & 3 & 4 & 1 & 2 & 3 & 4 &'.split(' '),
    tracks: { clave: 'X..x...x..x.x...', mid: '............x.x.', high: '....x.......x...', shaker: 'x.x.x.x.x.x.x.x.' },
    note: 'Like son clave, but the third hit comes a little later: 1, the a of 1, the a of 2, the & of 3 and 4 (in the slow count: 1, 2 &, 4 &, then 2, 3). Used in rumba and Afro-Cuban folkloric music.' },
  { id: 'tresillo', name: 'Tresillo (3+3+2)', region: 'cuba', meter: '4/4', steps: 8, spb: 2, bpm: 100, tier: 1, target: 'clap',
    tracks: { clap: 'X..x..x.', low: 'x.......', shaker: 'xxxxxxxx' },
    note: 'Eight pulses grouped 3+3+2. The seed of habanera, reggaeton, the klezmer bulgar and much more.' },
  { id: 'bembe', name: '6/8 bell (bembé / Ewe timeline)', region: 'westafrica', meter: '12/8', steps: 12, spb: 3, bpm: 96, tier: 2, target: 'bell',
    tracks: { bell: 'X.x.xx.x.x.x', low: 'x..x..x..x..', shaker: 'xxxxxxxxxxxx' },
    note: 'The standard 7-stroke bell of West Africa and Afro-Cuban 6/8. Feel it in 4 big beats and in 12 small ones.' },
  { id: 'habanera', name: 'Habanera', region: 'latam', meter: '2/4', steps: 8, spb: 4, bpm: 70, tier: 1, target: 'low',
    tracks: { low: 'X..xx.x.', shaker: 'x.x.x.x.' },
    note: 'Cuban dance rhythm that crossed to tango, ragtime and early jazz.' },
  { id: 'bossa', name: 'Bossa nova', region: 'brazil', meter: '4/4 (2 bars)', steps: 16, spb: 4, bpm: 128, tier: 2, target: 'clave',
    tracks: { clave: 'x..x..x...x..x..', low: 'x.....x.x.....x.', shaker: 'x.x.x.x.x.x.x.x.' },
    note: 'The rim-click pattern of bossa nova. On guitar, the thumb plays the bass while the fingers play syncopated chords.' },
  { id: 'samba', name: 'Samba (surdo + ganzá)', region: 'brazil', meter: '2/4 (2 bars)', steps: 16, spb: 4, bpm: 96, tier: 3, target: 'low', count: '1 e & a 2 e & a 1 e & a 2 e & a'.split(' '),
    tracks: { low: '....X.......X...', mid: 'x.......x.......', shaker: 'Xxxxxxxx' + 'Xxxxxxxx' },
    note: 'The deep surdo stroke lands on beat 2 of each 2/4 bar; the ganzá shakes steady 16ths.' },
  { id: 'maqsum', name: 'Maqsum', region: 'arabic', meter: '4/4', steps: 8, spb: 2, bpm: 100, tier: 1, target: 'all',
    tracks: { low: 'x...x...', high: '.x.x..x.' }, labels: ['D', 'T', '', 'T', 'D', '', 'T', ''],
    note: 'The most common Arabic rhythm: Dum Tek – Tek Dum – Tek –.' },
  { id: 'baladi', name: 'Baladi', region: 'arabic', meter: '4/4', steps: 8, spb: 2, bpm: 95, tier: 2, target: 'all',
    tracks: { low: 'xx..x...', high: '...x..x.' }, labels: ['D', 'D', '', 'T', 'D', '', 'T', ''],
    note: 'A heavier Maqsum that starts with two dums. Popular for belly dance and pop.' },
  { id: 'saidi', name: "Sa'idi", region: 'arabic', meter: '4/4', steps: 8, spb: 2, bpm: 100, tier: 2, target: 'all',
    tracks: { low: 'x..xx...', high: '.x....x.' }, labels: ['D', 'T', '', 'D', 'D', '', 'T', ''],
    note: 'From Upper Egypt. The double dum in the middle is the giveaway.' },
  { id: 'malfuf', name: 'Malfuf', region: 'arabic', meter: '2/4', steps: 8, spb: 4, bpm: 88, tier: 3, target: 'all',
    tracks: { low: 'x.......', high: '...x..x.' }, labels: ['D', '', '', 'T', '', '', 'T', ''],
    note: 'A fast 3+3+2 rhythm used for entrances and lively songs.' },
  { id: 'rachenitsa', name: 'Rachenitsa 7/8', region: 'turkbalkan', meter: '7/8 (2+2+3)', steps: 7, spb: 1, bpm: 330, unit: '♪', groups: [2, 2, 3], tier: 2, target: 'all',
    tracks: { low: 'X......', high: '..x.x..' },
    note: 'Bulgarian dance rhythm: quick-quick-slow.' },
  { id: 'kalamatianos', name: 'Kalamatianos 7/8', region: 'turkbalkan', meter: '7/8 (3+2+2)', steps: 7, spb: 1, bpm: 300, unit: '♪', groups: [3, 2, 2], tier: 3, target: 'all',
    tracks: { low: 'X......', high: '...x.x.' },
    note: 'Greek circle dance: slow-quick-quick.' },
  { id: 'karsilama', name: 'Karşılama 9/8', region: 'turkbalkan', meter: '9/8 (2+2+2+3)', steps: 9, spb: 1, bpm: 330, unit: '♪', groups: [2, 2, 2, 3], tier: 3, target: 'all',
    tracks: { low: 'X........', high: '..x.x.x..' },
    note: 'Turkish and Balkan 9/8 with the long group at the end.' },
  { id: 'kopanitsa', name: 'Kopanitsa 11/8', region: 'turkbalkan', meter: '11/8 (2+2+3+2+2)', steps: 11, spb: 1, bpm: 340, unit: '♪', groups: [2, 2, 3, 2, 2], tier: 4, target: 'all',
    tracks: { low: 'X...x......', high: '..x....x.x.' },
    note: 'Bulgarian 11/8 with the long beat in the middle.' },
  { id: 'teental', name: 'Teental (16)', region: 'hindustani', meter: '16 matras: 4+4+4+4', steps: 16, spb: 1, bpm: 120, unit: 'matra', groups: [4, 4, 4, 4], tier: 2, target: 'clap',
    tracks: { low: 'xxxxxxxxx....xxx', high: 'xxxxxxxxxxxxxxxx', clap: 'X...x...x...x...' },
    labels: ['Dha', 'Dhin', 'Dhin', 'Dha', 'Dha', 'Dhin', 'Dhin', 'Dha', 'Dha', 'Tin', 'Tin', 'Ta', 'Ta', 'Dhin', 'Dhin', 'Dha'],
    marks: { 0: 'X', 4: '2', 8: '0', 12: '3' },
    note: 'The most common North Indian tala. Clap on 1, 5 and 13; wave on 9 (khali), where the bass drum goes quiet.' },
  { id: 'rupak', name: 'Rupak (7)', region: 'hindustani', meter: '7 matras: 3+2+2', steps: 7, spb: 1, bpm: 110, unit: 'matra', groups: [3, 2, 2], tier: 3, target: 'clap',
    tracks: { low: '...x.x.', high: 'xxxxxxx', clap: 'X..x.x.' },
    labels: ['Tin', 'Tin', 'Na', 'Dhi', 'Na', 'Dhi', 'Na'], marks: { 0: '0', 3: '1', 5: '2' },
    note: 'Unusual because the cycle starts on khali (a wave), not a clap.' },
  { id: 'jhaptal', name: 'Jhaptal (10)', region: 'hindustani', meter: '10 matras: 2+3+2+3', steps: 10, spb: 1, bpm: 110, unit: 'matra', groups: [2, 3, 2, 3], tier: 3, target: 'clap',
    tracks: { low: 'x.xx...xx.', high: 'xxxxxxxxxx', clap: 'X.x..x.x..' },
    labels: ['Dhi', 'Na', 'Dhi', 'Dhi', 'Na', 'Ti', 'Na', 'Dhi', 'Dhi', 'Na'], marks: { 0: 'X', 2: '2', 5: '0', 7: '3' },
    note: 'Ten beats grouped 2+3+2+3. Khali falls on beat 6.' },
  { id: 'keherwa', name: 'Keherwa (8)', region: 'hindustani', meter: '8 matras: 4+4', steps: 8, spb: 1, bpm: 120, unit: 'matra', groups: [4, 4], tier: 1, target: 'clap',
    tracks: { low: 'xx....x.', high: 'x.xxxxxx', clap: 'X...x...' },
    labels: ['Dha', 'Ge', 'Na', 'Ti', 'Na', 'Ka', 'Dhi', 'Na'], marks: { 0: 'X', 4: '0' },
    note: 'The light, folk and film-song tala.' },
  { id: 'dadra', name: 'Dadra (6)', region: 'hindustani', meter: '6 matras: 3+3', steps: 6, spb: 1, bpm: 120, unit: 'matra', groups: [3, 3], tier: 1, target: 'clap',
    tracks: { low: 'xx.x..', high: 'xxxxxx', clap: 'X..x..' },
    labels: ['Dha', 'Dhi', 'Na', 'Dha', 'Ti', 'Na'], marks: { 0: 'X', 3: '0' },
    note: 'A six-beat tala for light classical and folk songs.' },
  { id: 'ektal', name: 'Ektal (12)', region: 'hindustani', meter: '12 matras: 2×6', steps: 12, spb: 1, bpm: 100, unit: 'matra', groups: [2, 2, 2, 2, 2, 2], tier: 4, target: 'clap',
    tracks: { low: 'xxx...x.x.x.', high: 'xxxxxxxxxxxx', clap: 'X.x.x.x.x.x.' },
    labels: ['Dhin', 'Dhin', 'DhaGe', 'TiRaKiTa', 'Tu', 'Na', 'Kat', 'Ta', 'DhaGe', 'TiRaKiTa', 'Dhi', 'Na'], marks: { 0: 'X', 2: '0', 4: '2', 6: '0', 8: '3', 10: '4' },
    note: 'Twelve beats in six pairs, used for slow khayal.' },
  { id: 'adi', name: 'Adi tala (8)', region: 'carnatic', meter: '8 beats: 4+2+2', steps: 8, spb: 1, bpm: 90, unit: 'beat', groups: [4, 2, 2], tier: 2, target: 'clap',
    tracks: { low: 'x...x.x.', high: 'xxxxxxxx', clap: 'X...x.x.' },
    labels: ['Ta', 'Ka', 'Di', 'Mi', 'Ta', 'Ka', 'Di', 'Mi'], marks: { 0: 'clap', 1: '1', 2: '2', 3: '3', 4: 'clap', 5: 'wave', 6: 'clap', 7: 'wave' },
    note: 'The main South Indian tala: a clap and three finger counts, then clap-wave, clap-wave.' },
  { id: 'solea', name: 'Soleá / bulerías compás', region: 'flamenco', meter: '12 counts', steps: 12, spb: 1, bpm: 130, unit: 'count', tier: 2, target: 'clap',
    tracks: { clap: '..X..X.X.X.X', mid: 'xxxxxxxxxxxx' },
    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    note: 'The 12-count flamenco cycle with accents on 3, 6, 8, 10 and 12. Bulerías is the same cycle played fast.' },
  { id: 'seguiriya', name: 'Seguiriya compás', region: 'flamenco', meter: '12 counts: 2+2+3+3+2', steps: 12, spb: 1, bpm: 150, unit: 'count', groups: [2, 2, 3, 3, 2], tier: 4, target: 'clap',
    tracks: { clap: 'X.x.x..x..x.', mid: 'xxxxxxxxxxxx' },
    note: 'The deep, tragic palo. Feel it as five uneven beats.' },
  { id: 'sesqui', name: 'Sesquiáltera (6/8 + 3/4)', region: 'latam', meter: '6/8 + 3/4', steps: 12, spb: 3, bpm: 80, tier: 3, target: 'clap',
    tracks: { clap: 'X..x..x.x.x.', low: 'x.....x.....', shaker: 'xxxxxxxxxxxx' },
    note: 'Two bars of six eighths, felt first in 2 then in 3. The heart of chacarera, huapango and joropo.' },
  { id: 'onedrop', name: 'Reggae one drop', region: 'caribbean', meter: '4/4', steps: 16, spb: 4, bpm: 76, tier: 2, target: 'chick',
    tracks: { low: '........X.......', high: '........x.......', hat: 'x.x.x.x.x.x.x.x.', chick: '....x.......x...' },
    note: 'Kick and snare together on beat 3 only. The guitar skank chops on 2 and 4.' },
  { id: 'swing', name: 'Jazz swing ride', region: 'jazz', meter: '4/4 (swung)', steps: 12, spb: 3, bpm: 140, tier: 1, target: 'hat',
    tracks: { ride: 'X..x.xx..x.x', hat: '...x.....x..', low: 'x..x..x..x..' },
    note: 'Ding, ding-a, ding, ding-a. The hi-hat closes on 2 and 4: tap those.' },
  { id: 'pompe', name: 'La pompe (gypsy jazz)', region: 'manouche', meter: '4/4', steps: 8, spb: 2, bpm: 170, tier: 2, target: 'chick',
    tracks: { low: 'x...x...', chick: '..X...X.' },
    note: 'Bass note on 1 and 3, a short, crisp chord on 2 and 4.' },
  { id: 'bulgar', name: 'Bulgar / freylekhs', region: 'klezmer', meter: '4/4 (3+3+2)', steps: 8, spb: 2, bpm: 130, tier: 2, target: 'clap',
    tracks: { clap: 'X..x..x.', low: 'x...x...', chick: '..x...x.' },
    note: 'Klezmer dance rhythm with the 3+3+2 accent over a steady oom-pah.' },
  { id: 'shuffle', name: 'Blues shuffle (12/8)', region: 'blues', meter: '12/8', steps: 12, spb: 3, bpm: 84, tier: 1, target: 'ride',
    tracks: { ride: 'x.xx.xx.xx.x', high: '...x.....x..', low: 'x.....x.....' },
    note: 'Each beat splits into a long and a short note (the first and third of a triplet). Snare on 2 and 4.' },
  { id: 'backbeat', name: 'Rock backbeat', region: 'rock', meter: '4/4', steps: 8, spb: 2, bpm: 112, tier: 1, target: 'high',
    tracks: { hat: 'xxxxxxxx', high: '..X...X.', low: 'x...xx..' },
    note: 'Straight eighths on the hi-hat, kick on 1 and 3, snare cracking on 2 and 4. Tap the snare.' },
  { id: 'funk16', name: 'Funk sixteenths', region: 'funksoul', meter: '4/4 (16ths)', steps: 16, spb: 4, bpm: 96, tier: 3, target: 'low',
    tracks: { hat: 'x.x.x.x.x.x.x.x.', high: '....X..x....X..x', low: 'x......x..x.....' },
    note: 'Ghost notes and a syncopated kick around a hard 2 and 4. Count every 16th: 1 e & a.' },
  { id: 'boomchick', name: 'Boom-chick', region: 'country', meter: '2/4 feel', steps: 8, spb: 2, bpm: 110, tier: 1, target: 'chick',
    tracks: { low: 'x...x...', chick: '..X...X.' },
    note: 'Bass note on 1 and 3 (root, then fifth), a short strum on 2 and 4. The engine of country and bluegrass rhythm guitar.' }
];

/* ---------- World music atlas ---------- */
const REGIONS = [
  { id: 'cuba', name: 'Cuba & the Caribbean', places: 'Cuba · Puerto Rico · Dominican Republic',
    summary: 'Son, rumba, danzón and mambo grew where Spanish song forms met West African drumming. Salsa later carried Cuban son to New York and around the world.',
    concepts: ['Clave: the two-bar key pattern every part locks to', 'Tumbao: the repeating conga and bass pattern', 'Montuno / guajeo: a looping, syncopated tres or piano figure', 'Coro–pregón: chorus and lead singer trading lines'],
    instruments: ['Tres', 'Congas', 'Bongó', 'Timbales', 'Claves', 'Güiro', 'Maracas'],
    rhythms: ['son32', 'son23', 'rumba32', 'tresillo', 'bembe'], scales: ['major', 'aeolian', 'mixolydian'],
    guitar: ['Play guajeos in octaves on the top strings, the way a tres does', 'Learn the anticipated bass that lands on the "and" of 2 and on 4', 'Comp montunos over I–IV–V–IV and keep clave in your body'],
    listen: ['Arsenio Rodríguez', 'Benny Moré', 'Celia Cruz', 'Buena Vista Social Club', 'Compay Segundo', 'Los Van Van', 'Eliades Ochoa'],
    facts: [
      { q: 'In son clave 3-2, which bar has three notes?', a: 'The first bar', w: ['The second bar', 'Both bars', 'Neither'] },
      { q: 'Which Cuban instrument has three doubled courses of strings?', a: 'Tres', w: ['Charango', 'Bandola', 'Cavaquinho'] },
      { q: 'What is a tumbao?', a: 'The repeating conga or bass pattern', w: ['A lead vocal improvisation', 'A slow ballad form', 'A trumpet mute'] },
      { q: 'How does rumba clave differ from son clave?', a: 'The third note is delayed', w: ['It adds a fourth note', 'It is in 7/8', 'It drops the 2-side'] },
      { q: 'How many strokes are in the Afro-Cuban 6/8 bell pattern?', a: '7', w: ['5', '6', '9'] }
    ] },
  { id: 'brazil', name: 'Brazil', places: 'Rio de Janeiro · Bahia · the Northeast',
    summary: 'Samba grew in Rio from Afro-Brazilian rhythm. In the late 1950s bossa nova softened it with jazz harmony and a quiet, syncopated guitar. Choro, baião and MPB add more worlds.',
    concepts: ['Bossa right hand: thumb on the bass, fingers syncopate the chords', 'Samba accent on beat 2 (the surdo)', 'Choro and the 7-string guitar bass lines (baixaria)', 'Baião: Lydian dominant melodies from the Northeast'],
    instruments: ['Violão (nylon guitar)', '7-string guitar', 'Cavaquinho', 'Pandeiro', 'Surdo', 'Tamborim', 'Berimbau'],
    rhythms: ['bossa', 'samba'], scales: ['major', 'dorian', 'lyddom', 'mixolydian'],
    guitar: ['Keep the thumb steady on 1 and 3 while the fingers play the syncopation', 'Learn ii–V voicings with 9ths and 13ths', 'Play choro melodies with the metronome on beat 2'],
    listen: ['João Gilberto', 'Antônio Carlos Jobim', 'Baden Powell', 'Jacob do Bandolim', 'Luiz Gonzaga', 'Gilberto Gil', 'Elis Regina', 'Yamandu Costa'],
    facts: [
      { q: 'Who is credited with the bossa nova guitar beat?', a: 'João Gilberto', w: ['Luiz Gonzaga', 'Jacob do Bandolim', 'Pixinguinha'] },
      { q: "The surdo's strongest stroke in samba falls on…", a: 'Beat 2', w: ['Beat 1', 'Every offbeat', 'Beat 3'] },
      { q: 'Baião melodies often use which scale?', a: 'Lydian dominant', w: ['Harmonic minor', 'Hirajoshi', 'Whole tone'] },
      { q: "Choro's 7-string guitar is known for…", a: 'Counter-melodic bass lines', w: ['Strummed drones', 'Slide playing', 'Quarter-tone bends'] },
      { q: 'A pandeiro is a…', a: 'Frame drum with jingles', w: ['Bowed string instrument', 'Bamboo flute', 'Bass drum'] }
    ] },
  { id: 'flamenco', name: 'Flamenco (Spain)', places: 'Andalusia · Seville · Jerez · Granada',
    summary: 'Flamenco comes from Andalusia, with Gitano (Romani), Moorish, Jewish and Andalusian roots. Each style, or palo, has its own compás, mood and harmony.',
    concepts: ['Compás: rhythmic cycles, often 12 counts', 'Palos: soleá, bulerías, alegrías, seguiriya, tangos, fandangos', 'Andalusian cadence: Am–G–F–E', 'Phrygian mode with a major chord on the tonic'],
    instruments: ['Flamenco guitar', 'Cajón', 'Palmas (hand claps)', 'Cante (voice)', 'Zapateado (footwork)'],
    rhythms: ['solea', 'seguiriya'], scales: ['phrydom', 'phrygian', 'harmmin'],
    guitar: ['Rasgueado: the four-finger roll (e-a-m-i)', 'Picado: rest-stroke runs alternating i and m', 'Alzapúa: thumb strokes down and up', 'Count compás out loud while you play'],
    listen: ['Paco de Lucía', 'Camarón de la Isla', 'Tomatito', 'Vicente Amigo', 'Sabicas', 'Niño Ricardo'],
    facts: [
      { q: 'Which counts are accented in soleá and bulerías?', a: '3, 6, 8, 10, 12', w: ['1, 4, 7, 10', '2, 4, 6, 8, 10, 12', '1, 5, 9'] },
      { q: 'A flamenco style is called a…', a: 'Palo', w: ['Raga', 'Maqam', 'Usul'] },
      { q: 'The Andalusian cadence in A minor is…', a: 'Am–G–F–E', w: ['Am–Dm–E–Am', 'C–Am–F–G', 'Am–E–Am–E'] },
      { q: 'Rasgueado is…', a: 'A fast strummed roll using the fingers', w: ['A thumb-only melody', 'A tuning', 'A dance step'] },
      { q: 'Which guitarist brought jazz and Brazilian influences into flamenco?', a: 'Paco de Lucía', w: ['Django Reinhardt', 'Baden Powell', 'Andrés Segovia'] }
    ] },
  { id: 'hindustani', name: 'North India (Hindustani)', places: 'India · Pakistan · Bangladesh · Nepal',
    summary: 'North Indian classical music is built on raga, a melodic framework, and tala, a rhythmic cycle, over a constant drone. Performances often grow from a slow, free alap into composed and improvised sections.',
    concepts: ['Raga: scale plus signature phrases, mood and time of day', 'Tala: a cycle of matras; sam is beat 1', 'Sargam: Sa Re Ga Ma Pa Dha Ni', 'Thaat: ten parent scales', 'Meend (glide) and gamak (oscillation)', 'Tihai: a phrase played three times that lands on sam'],
    instruments: ['Sitar', 'Sarod', 'Tabla', 'Tanpura', 'Bansuri', 'Sarangi', 'Harmonium'],
    rhythms: ['teental', 'keherwa', 'dadra', 'rupak', 'jhaptal', 'ektal'], scales: ['lydian', 'dbharm', 'phrygian', 'dorian', 'mixolydian', 'todi', 'purvi', 'marwa', 'majpent', 'malkauns'],
    guitar: ['Practice ragas over a drone, using slides and bends for meend', "Learn each raga's signature phrases (pakad), not only the scale", 'Sing sargam while you play', 'Clap and wave the tala while someone else plays'],
    listen: ['Ravi Shankar', 'Ali Akbar Khan', 'Nikhil Banerjee', 'Zakir Hussain', 'Hariprasad Chaurasia', 'Debashish Bhattacharya', 'Brij Bhushan Kabra'],
    facts: [
      { q: 'How many matras are in Teental?', a: '16', w: ['12', '10', '7'] },
      { q: 'The first beat of a tala cycle is called…', a: 'Sam', w: ['Khali', 'Tihai', 'Alap'] },
      { q: 'Raga Yaman uses which raised note?', a: 'Tivra Ma (raised 4th)', w: ['Komal Re', 'Komal Ni', 'Komal Dha'] },
      { q: 'Rupak tala begins on…', a: 'Khali (a wave)', w: ['A loud clap', 'The 5th matra', 'A tihai'] },
      { q: 'A tihai is…', a: 'A phrase played three times that lands on sam', w: ['A drone instrument', 'A 7-beat cycle', 'The slow opening'] },
      { q: 'Raga Bhairav uses…', a: 'Komal Re and komal Dha', w: ['Tivra Ma only', 'All natural notes', 'Komal Ga and Ni'] }
    ] },
  { id: 'carnatic', name: 'South India (Carnatic)', places: 'Tamil Nadu · Karnataka · Kerala · Andhra Pradesh',
    summary: 'South Indian classical music centers on composed songs (kritis), with ornaments (gamakas) shaping almost every note. The 72-melakarta system organizes parent scales mathematically.',
    concepts: ['Melakarta: 72 parent ragas', 'Gamaka: ornaments essential to raga identity', 'Adi tala: 8 beats (4+2+2)', 'Konnakol: spoken rhythm (ta ka di mi)', 'Korvai: a rhythmic cadence that lands on beat 1'],
    instruments: ['Veena', 'Mridangam', 'Ghatam', 'Violin', 'Kanjira', 'Mandolin'],
    rhythms: ['adi'], scales: ['major', 'dorian', 'lydian', 'dbharm', 'harmmin'],
    guitar: ['Speak konnakol, then play it', 'Phrase in groups of 3, 5 and 7 against a pulse of 4', 'Use slides and vibrato to imitate gamakas'],
    listen: ['M.S. Subbulakshmi', 'Lalgudi Jayaraman', 'U. Srinivas (mandolin)', 'Prasanna (guitar)', 'Shakti', 'T.M. Krishna'],
    facts: [
      { q: 'How many melakarta ragas are there?', a: '72', w: ['10', '32', '108'] },
      { q: 'How many beats are in Adi tala?', a: '8', w: ['7', '12', '16'] },
      { q: 'Konnakol is…', a: 'Spoken rhythm syllables', w: ['A drum', 'A 72-note scale', 'A wedding song'] },
      { q: 'Raga Shankarabharanam has the same notes as…', a: 'The major scale', w: ['Dorian', 'Phrygian', 'Harmonic minor'] },
      { q: 'Mayamalavagowla matches which Hindustani raga?', a: 'Bhairav', w: ['Yaman', 'Kafi', 'Malkauns'] }
    ] },
  { id: 'arabic', name: 'Arab world', places: 'Egypt · Lebanon · Syria · Iraq · Morocco · the Gulf',
    summary: 'Arabic music is organized by maqam: modes built from small cells called ajnas, often with quarter tones. Rhythmic modes (iqa\'at) of dum and tek strokes drive the percussion.',
    concepts: ['Maqam and jins (ajnas): modes built from 3–5 note cells', 'Quarter tones: notes between the piano keys', 'Taqsim: free improvisation that explores a maqam', 'Tarab: musical ecstasy shared by players and listeners', "Iqa': a rhythmic mode of dum and tek"],
    instruments: ['Oud', 'Qanun', 'Ney', 'Violin', 'Riq', 'Darbuka', 'Daf'],
    rhythms: ['maqsum', 'baladi', 'saidi', 'malfuf'], scales: ['phrydom', 'bayati', 'rast', 'saba', 'harmmin', 'phrygian'],
    guitar: ['Use small bends, or a fretless guitar, for quarter tones', 'Think in jins cells rather than 7-note scales', 'In a taqsim, explore the lower jins before you modulate', 'Tap maqsum and baladi on the guitar body'],
    listen: ['Umm Kulthum', 'Fairuz', 'Munir Bashir', 'Marcel Khalife', 'Anouar Brahem', 'Rabih Abou-Khalil', 'Naseer Shamma'],
    facts: [
      { q: 'Which maqam has a step and a half between its 2nd and 3rd notes?', a: 'Hijaz', w: ['Rast', 'Bayati', 'Kurd'] },
      { q: 'Which is Maqsum?', a: 'D T – T D – T –', w: ['D – – T – – T –', 'D D – T D – T –', 'D T – D D – T –'] },
      { q: "Which maqam's 2nd degree is a quarter tone flat?", a: 'Bayati', w: ['Kurd', 'Nahawand', 'Hijaz'] },
      { q: 'A taqsim is…', a: 'A free improvisation', w: ['A dance rhythm', 'A choir', 'A tuning'] },
      { q: 'The main Arabic lute is the…', a: 'Oud', w: ['Saz', 'Sitar', 'Kora'] },
      { q: 'In Arabic percussion, "dum" is…', a: 'The low, deep stroke', w: ['The high edge stroke', 'A roll', 'A rest'] }
    ] },
  { id: 'turkbalkan', name: 'Turkey & the Balkans', places: 'Turkey · Bulgaria · Greece · Macedonia · Serbia · Romania',
    summary: 'Turkish makam music and Balkan folk share "limping" meters (aksak) such as 7/8, 9/8 and 11/8, built from groups of 2s and 3s. Romani wedding and brass bands push them to dazzling speeds.',
    concepts: ['Aksak: limping meters made of 2s and 3s', 'Usul: Turkish rhythmic cycles', 'Makam: the Turkish modal system, with microtones', 'Heavily ornamented melody and fast unison runs'],
    instruments: ['Bağlama (saz)', 'Kanun', 'Ney', 'Kaval', 'Gaida', 'Tapan', 'Clarinet', 'Fretless guitar'],
    rhythms: ['rachenitsa', 'kalamatianos', 'karsilama', 'kopanitsa'], scales: ['phrydom', 'dbharm', 'hungmin', 'bayati'],
    guitar: ['Count meters as group syllables: 1-2, 1-2, 1-2-3', 'Practice clarinet-style ornaments with hammer-ons and pull-offs', 'Use bends or a fretless guitar for makam'],
    listen: ['Ivo Papazov', 'Erkan Oğur', 'Le Mystère des Voix Bulgares', 'Goran Bregović', 'Taraf de Haïdouks', 'Boban Marković'],
    facts: [
      { q: 'How is a rachenitsa 7/8 grouped?', a: '2+2+3', w: ['3+2+2', '2+3+2', '4+3'] },
      { q: 'How is the Greek kalamatianos 7/8 grouped?', a: '3+2+2', w: ['2+2+3', '2+3+2', '3+4'] },
      { q: 'Kopanitsa is in…', a: '11/8', w: ['7/8', '9/8', '5/4'] },
      { q: 'Aksak means…', a: 'Limping', w: ['Sliding', 'Drone', 'Wedding'] },
      { q: 'Erkan Oğur is known for playing…', a: 'Fretless guitar', w: ['Gaida', 'Kanun', 'Tabla'] }
    ] },
  { id: 'westafrica', name: 'West Africa', places: 'Mali · Senegal · Guinea · Ghana · Nigeria',
    summary: 'West African music is built on interlocking parts: a timeline bell, cross-rhythms of 3 against 2, and call and response. Guitar styles include Ghanaian highlife, Nigerian Afrobeat and jùjú, and Malian desert blues.',
    concepts: ['Timeline: a repeating bell pattern everyone hears against', 'Polyrhythm: 3 against 2', 'Interlocking parts: the groove is the sum of short patterns', 'Griots: hereditary musician-historians', 'Call and response'],
    instruments: ['Kora', 'Balafon', 'Djembe', 'Dundun', 'Talking drum', 'Ngoni', 'Gankogui bell'],
    rhythms: ['bembe', 'tresillo'], scales: ['majpent', 'minpent', 'mixolydian', 'major'],
    guitar: ['Learn a short guitar part and hold it for minutes without changing it', 'Play 2 against 3: thumb in dotted quarters, fingers in eighths', 'Learn kora-style ostinatos with an alternating thumb'],
    listen: ['Ali Farka Touré', 'Toumani Diabaté', 'Fela Kuti', 'Tony Allen', 'King Sunny Adé', 'Oumou Sangaré', 'Salif Keita', 'Tinariwen'],
    facts: [
      { q: 'The 21-string harp-lute of the Mande griots is the…', a: 'Kora', w: ['Mbira', 'Balafon', 'Sitar'] },
      { q: 'Who pioneered Afrobeat?', a: 'Fela Kuti', w: ['Ali Farka Touré', 'Bob Marley', 'Salif Keita'] },
      { q: 'In 12/8 West African music, the bell pattern is the…', a: 'Timeline', w: ['Sam', 'Clave direction', 'Montuno'] },
      { q: "Tinariwen's Tuareg guitar style is often called…", a: 'Desert blues', w: ['Highlife', 'Soukous', 'Jùjú'] },
      { q: 'A balafon is a…', a: 'Wooden xylophone', w: ['Talking drum', 'Bowed fiddle', 'Bell'] }
    ] },
  { id: 'centraleast', name: 'Central & East Africa', places: 'DR Congo · Ethiopia · Kenya · Zimbabwe',
    summary: 'Congolese rumba and soukous made the electric guitar the star of African popular music, with bright, looping lead lines. Ethiopian music uses four main modes called qenet, and Zimbabwe\'s chimurenga guitarists copy mbira patterns.',
    concepts: ['Sebene: the fast, guitar-led dance section of a Congolese song', 'Qenet: Ethiopian modes (Tizita, Bati, Ambassel, Anchihoye)', 'Mbira patterns arranged for guitar', 'Benga: the fast plucked style of Kenya'],
    instruments: ['Electric guitar', 'Likembe', 'Mbira', 'Krar', 'Masenqo', 'Washint'],
    rhythms: [], scales: ['majpent', 'bati', 'inscale', 'anchihoye'],
    guitar: ['Play high, looping sebene lines with relaxed alternate picking', 'Learn an mbira ostinato and split it between thumb and fingers', 'Improvise in a qenet over a drone'],
    listen: ['Franco & TPOK Jazz', 'Tabu Ley Rochereau', 'Dr. Nico', 'Mulatu Astatke', 'Mahmoud Ahmed', 'Thomas Mapfumo', 'Oliver Mtukudzi'],
    facts: [
      { q: 'The guitar-led dance section of Congolese rumba is the…', a: 'Sebene', w: ['Tihai', 'Taqsim', 'Bridge'] },
      { q: 'Ethiopian modes are called…', a: 'Qenet', w: ['Maqam', 'Dastgah', 'Thaat'] },
      { q: 'Mulatu Astatke is known as the father of…', a: 'Ethio-jazz', w: ['Afrobeat', 'Soukous', 'Highlife'] },
      { q: 'Chimurenga guitarists imitate which instrument?', a: 'Mbira', w: ['Kora', 'Oud', 'Sitar'] }
    ] },
  { id: 'manouche', name: 'Gypsy jazz (France)', places: 'Paris · Samois-sur-Seine · Romani (Sinti) communities',
    summary: "Gypsy jazz, or jazz manouche, was born in 1930s France with Django Reinhardt and Stéphane Grappelli's Quintette du Hot Club de France. It pairs swing tunes with a driving acoustic rhythm guitar called la pompe.",
    concepts: ['La pompe: bass on 1 and 3, short chord on 2 and 4', 'Rest-stroke picking', 'Arpeggio-based soloing', 'Minor 6 chords and diminished runs'],
    instruments: ['Selmer-Maccaferri guitar', 'Violin', 'Double bass', 'Clarinet', 'Accordion'],
    rhythms: ['pompe', 'swing'], scales: ['harmmin', 'dorian', 'major', 'hungmin'],
    guitar: ['Practice rest stroke with downstrokes across strings', 'Learn m6 and dim7 shapes up the neck', 'Keep la pompe relaxed at 180+ bpm'],
    listen: ['Django Reinhardt', 'Stéphane Grappelli', 'Stochelo Rosenberg', 'Biréli Lagrène', 'Angelo Debarre', 'Tchavolo Schmitt'],
    facts: [
      { q: 'In la pompe, where are the short chords?', a: 'On 2 and 4', w: ['On 1 and 3', 'On every offbeat', 'Only on 1'] },
      { q: 'Django Reinhardt led the Quintette du Hot Club de France with…', a: 'Stéphane Grappelli', w: ['Charlie Parker', 'Paco de Lucía', 'Les Paul'] },
      { q: 'A signature gypsy jazz chord is the…', a: 'Minor 6', w: ['Sus2', 'Power chord', 'Quartal'] },
      { q: 'Rest-stroke picking means…', a: 'The pick comes to rest on the next string', w: ['Resting between phrases', 'Muting with the palm', 'Using only upstrokes'] }
    ] },
  { id: 'jazz', name: 'Jazz (USA)', places: 'New Orleans · Chicago · Kansas City · New York',
    summary: 'Jazz grew in New Orleans from blues, ragtime, brass bands and Caribbean rhythm. Swing feel, improvising over chord changes and a shared book of standards are its core.',
    concepts: ['Swing feel: uneven eighths and a 2 and 4 backbeat', 'ii–V–I progressions', 'Guide tones: the 3rd and 7th of each chord', '12-bar blues form', 'Rhythm changes'],
    instruments: ['Guitar', 'Piano', 'Double bass', 'Drums', 'Saxophone', 'Trumpet'],
    rhythms: ['swing'], scales: ['dorian', 'mixolydian', 'blues', 'melmin', 'major'],
    guitar: ['Comp with 3-note shell voicings', 'Connect guide tones through the changes', 'Transcribe short solos: sing, find, play along'],
    listen: ['Charlie Christian', 'Wes Montgomery', 'Jim Hall', 'Grant Green', 'Joe Pass', 'Pat Martino', 'B.B. King', 'Robert Johnson'],
    facts: [
      { q: 'In swing, the hi-hat closes on…', a: '2 and 4', w: ['1 and 3', 'Every beat', 'Only beat 1'] },
      { q: "A chord's guide tones are its…", a: '3rd and 7th', w: ['Root and 5th', '9th and 13th', 'Root and 3rd'] },
      { q: 'A ii–V–I in C is…', a: 'Dm7–G7–Cmaj7', w: ['Em7–A7–Dmaj7', 'Cmaj7–Am7–Dm7', 'G7–C7–F7'] },
      { q: 'Rhythm changes come from which tune?', a: 'I Got Rhythm', w: ['Autumn Leaves', 'So What', 'Giant Steps'] }
    ] },
  { id: 'latam', name: 'Latin America', places: 'Argentina · Mexico · Venezuela · Peru · Chile · Paraguay',
    summary: 'Spanish guitar traditions met Indigenous and African music across Latin America. Many folk styles alternate 6/8 and 3/4 (sesquiáltera), and Argentine tango grew partly from the habanera.',
    concepts: ['Sesquiáltera: 6/8 and 3/4 alternating', 'Habanera rhythm in tango', 'Son jarocho and huapango (Mexico)', 'Chacarera and zamba (Argentina)', 'Huayno (Andes)'],
    instruments: ['Charango', 'Bandoneón', 'Cuatro', 'Jarana', 'Requinto', 'Bombo legüero', 'Quena'],
    rhythms: ['sesqui', 'habanera'], scales: ['harmmin', 'aeolian', 'major', 'minpent'],
    guitar: ['Strum six eighths, then move the accents to feel three', 'Learn tango marcato (four strong beats) and the habanera', 'Practice chacarera strumming with the bombo pattern'],
    listen: ['Atahualpa Yupanqui', 'Astor Piazzolla', 'Carlos Gardel', 'Mercedes Sosa', 'Violeta Parra', 'Agustín Barrios', 'Simón Díaz'],
    facts: [
      { q: 'Sesquiáltera alternates…', a: '6/8 and 3/4', w: ['4/4 and 2/4', '7/8 and 9/8', '5/4 and 3/4'] },
      { q: 'The bandoneón is central to…', a: 'Tango', w: ['Samba', 'Huayno', 'Son jarocho'] },
      { q: 'Atahualpa Yupanqui was a guitarist-singer from…', a: 'Argentina', w: ['Cuba', 'Spain', 'Brazil'] },
      { q: 'The charango is a small Andean…', a: 'String instrument', w: ['Flute', 'Drum', 'Rattle'] }
    ] },
  { id: 'caribbean', name: 'Jamaica', places: 'Kingston · Trench Town',
    summary: 'Ska, rocksteady and reggae came out of 1960s Jamaica, mixing mento, R&B and Rastafarian drumming. The guitar is a rhythm instrument here: short chops on the offbeats.',
    concepts: ['One drop: kick and snare on beat 3', 'The skank: muted guitar chops on 2 and 4', 'Bass as the lead voice', 'Dub: remixing with echo and space'],
    instruments: ['Electric guitar', 'Bass', 'Drums', 'Organ', 'Nyabinghi drums'],
    rhythms: ['onedrop'], scales: ['aeolian', 'dorian', 'minpent', 'major'],
    guitar: ['Chop short, muted chords exactly on 2 and 4', 'Play high triads on the top three strings', 'Leave space for the bass'],
    listen: ['Bob Marley & the Wailers', 'Toots & the Maytals', 'Ernest Ranglin', 'Peter Tosh', 'Burning Spear'],
    facts: [
      { q: 'In the one drop, the kick and snare land on…', a: 'Beat 3', w: ['Beat 1', 'Beats 2 and 4', 'Every beat'] },
      { q: 'The reggae guitar skank falls on…', a: '2 and 4', w: ['1 and 3', 'Only beat 1', 'Every 16th'] },
      { q: 'Which guitarist shaped ska and Jamaican jazz?', a: 'Ernest Ranglin', w: ['Django Reinhardt', 'Paco de Lucía', 'Franco'] }
    ] },
  { id: 'klezmer', name: 'Klezmer (Eastern Europe)', places: 'Ashkenazi Jewish communities · Ukraine · Moldova · Poland · New York',
    summary: 'Klezmer is the celebration music of Eastern European Jews, played at weddings by clarinet, violin and brass. Its modes and sobbing ornaments imitate the cantor\'s voice.',
    concepts: ['Freygish: the same notes as Phrygian dominant', 'Misheberakh: Dorian with a raised 4th', 'Krekhts: a sob-like vocal ornament', 'Bulgar / freylekhs dance rhythm (3+3+2)'],
    instruments: ['Clarinet', 'Violin', 'Accordion', 'Tsimbl (hammered dulcimer)', 'Trumpet', 'Tuba'],
    rhythms: ['bulgar', 'tresillo'], scales: ['phrydom', 'misheberakh', 'harmmin', 'dorian'],
    guitar: ['Play oom-pah accompaniment with bass notes and chord chops', 'Use quick pull-offs to imitate krekhts', 'Learn freygish over a I–♭II–I vamp'],
    listen: ['Naftule Brandwein', 'Dave Tarras', 'The Klezmatics', 'Brave Old World', 'Budowitz'],
    facts: [
      { q: 'Freygish has the same notes as…', a: 'Phrygian dominant', w: ['Dorian', 'Lydian', 'Major pentatonic'] },
      { q: 'A krekhts is…', a: 'A sob-like ornament', w: ['A wedding dance', 'A drum', 'A key change'] },
      { q: 'The bulgar accents eight pulses as…', a: '3+3+2', w: ['2+2+3', '4+4', '2+3+3'] }
    ] },
  { id: 'eastasia', name: 'East & Southeast Asia', places: 'Japan · China · Indonesia (Java, Bali)',
    summary: 'Japanese, Chinese and Indonesian traditions use pentatonic scales, space and timbre in very different ways. Gamelan in Java and Bali uses tuned bronze instruments in two systems, slendro and pelog, that do not match Western pitches.',
    concepts: ['Pentatonic modes (Chinese gong, shang, jue, zhi, yu)', 'Ma: meaningful silence in Japanese music', 'In and Yo scales', 'Colotomy: gongs that mark the gamelan cycle', 'Kotekan: interlocking Balinese parts'],
    instruments: ['Koto', 'Shamisen', 'Shakuhachi', 'Guzheng', 'Pipa', 'Erhu', 'Gamelan (gong, saron, bonang)'],
    rhythms: [], scales: ['inscale', 'hirajoshi', 'yo', 'majpent', 'minpent', 'slendro', 'pelog'],
    guitar: ['Use harmonics and bends to imitate koto', 'Play pentatonic melodies and leave long silences', 'Split a kotekan line between two guitars'],
    listen: ['Michio Miyagi (koto)', 'Wu Man (pipa)', 'Liu Fang (pipa)', 'Gamelan Gong Kebyar recordings'],
    facts: [
      { q: "Gamelan's two tuning systems are…", a: 'Slendro and pelog', w: ['Maqam and jins', 'Raga and tala', 'Gong and shang'] },
      { q: 'How many notes are in the Japanese In scale?', a: '5', w: ['6', '7', '8'] },
      { q: 'In Japanese music, ma refers to…', a: 'Meaningful space or silence', w: ['A drum', 'A fast tempo', 'A tuning peg'] },
      { q: 'Kotekan is…', a: 'Interlocking parts split between two players', w: ['A solo improvisation', 'A bamboo flute', 'A 7-beat cycle'] }
    ] },
  { id: 'celtic', name: 'Ireland & Scotland', places: 'Ireland · Scotland · Brittany · Cape Breton',
    summary: 'Irish and Scottish traditional music is dance music: jigs, reels, hornpipes and slides, decorated with cuts, rolls and slides. Guitarists often accompany in DADGAD or drop D tuning.',
    concepts: ['Jig (6/8), reel (fast 4/4), slip jig (9/8)', 'Ornaments: cut, tap, roll', 'DADGAD tuning', 'Sessions: tunes played in sets'],
    instruments: ['Fiddle', 'Tin whistle', 'Uilleann pipes', 'Bodhrán', 'Bouzouki', 'Harp'],
    rhythms: [], scales: ['mixolydian', 'dorian', 'major'],
    guitar: ['Try DADGAD and let open strings ring', 'Accompany jigs with a down-up-down feel in 6/8', 'Learn tunes by ear in sets of three'],
    listen: ['The Chieftains', 'Planxty', 'The Bothy Band', 'Martin Hayes & Dennis Cahill', 'Tony McManus', 'Dick Gaughan'],
    facts: [
      { q: 'A jig is in…', a: '6/8', w: ['4/4', '3/4', '7/8'] },
      { q: 'DADGAD is…', a: 'An open guitar tuning', w: ['A dance', 'A fiddle bow stroke', 'A Scottish drum'] },
      { q: 'A slip jig is in…', a: '9/8', w: ['6/8', '12/8', '5/4'] },
      { q: 'The bodhrán is a…', a: 'Frame drum', w: ['Bagpipe', 'Flute', 'Harp'] }
    ] }
];

/* Deep-dive fields (history, sub-styles, recordings, players, study) live in src/content/.
   Existing regions get them merged in; new styles are appended whole. */
Object.values(STYLES_NEW).forEach(st => REGIONS.push(st));
REGIONS.forEach(r => Object.assign(r, STYLES_A[r.id] || {}, STYLES_B[r.id] || {}));
// Long-form essays (r.essay) and the science page (SCIENCE) load on demand: see src/content/lazy.js
const AREA = {
  cuba: 'Americas', brazil: 'Americas', latam: 'Americas', caribbean: 'Americas', jazz: 'Americas', blues: 'Americas', rock: 'Americas', funksoul: 'Americas', country: 'Americas', hawaii: 'Americas',
  flamenco: 'Europe', manouche: 'Europe', klezmer: 'Europe', celtic: 'Europe', classical: 'Europe', fado: 'Europe', turkbalkan: 'Europe',
  arabic: 'Middle East & India', persian: 'Middle East & India', hindustani: 'Middle East & India', carnatic: 'Middle East & India',
  westafrica: 'Africa', centraleast: 'Africa', eastasia: 'East Asia'
};
REGIONS.forEach(r => { r.area = AREA[r.id] || 'World'; });

/* ---------- Repertoire: chord charts & grooves ---------- */
const GROOVES = {
  swing: { name: 'Swing', steps: 12, spb: 3, perc: { ride: 'X..x.xx..x.x', hat: '...x.....x..' }, comp: 'x..x..x..x..', bass: 'walk' },
  bossa: { name: 'Bossa nova', steps: 16, spb: 4, perc: { clave: 'x..x..x...x..x..', shaker: 'x.x.x.x.x.x.x.x.' }, comp: 'x..x..x...x..x..', bass: 'r.....5.r.....5.' },
  son: { name: 'Son montuno', steps: 16, spb: 4, perc: { clave: 'X..x..x...x.x...', bell: 'x...x...x...x...', mid: '............x.x.' }, comp: '..x...x...x...x.', bass: '......r.....5...' },
  reggae: { name: 'Reggae one drop', steps: 16, spb: 4, perc: { low: '........X.......', high: '........x.......', hat: 'x.x.x.x.x.x.x.x.' }, comp: '....x.......x...', bass: 'r.....r.5...r...' },
  pompe: { name: 'La pompe', steps: 8, spb: 2, perc: {}, comp: '..X...X.', bass: 'r...5...' },
  tango: { name: 'Tango / habanera', steps: 8, spb: 2, perc: { shaker: 'x.x.x.x.' }, comp: 'x.x.x.x.', bass: 'r..55.r.' },
  flamenco: { name: 'Flamenco tangos (4/4)', steps: 8, spb: 2, perc: { clap: '..x...x.', mid: 'x.x.x.x.' }, comp: 'X.xxX.x.', bass: 'r...r...' },
  highlife: { name: 'Highlife', steps: 16, spb: 4, perc: { bell: 'x.x.xx.x.x.x.x.x', shaker: 'x.x.x.x.x.x.x.x.' }, comp: '..x...x...x...x.', bass: 'r...5...r...5...' },
  soukous: { name: 'Soukous / rumba', steps: 16, spb: 4, perc: { hat: 'x.x.x.x.x.x.x.x.', high: '....x.......x...', low: 'x.......x.......' }, comp: 'x.xx.xx.x.xx.xx.', bass: 'r..5..r.r..5..r.' },
  drone: { name: 'Drone', steps: 8, spb: 2, perc: {}, comp: 'x.......', bass: 'r.......' },
  shuffle: { name: 'Blues shuffle', steps: 12, spb: 3, perc: { ride: 'x.xx.xx.xx.x', high: '...x.....x..', low: 'x.....x.....' }, comp: '...x.....x..', bass: 'r.35.67.65.3' },
  rock: { name: 'Rock eighths', steps: 8, spb: 2, perc: { hat: 'xxxxxxxx', high: '..x...x.', low: 'x...xx..' }, comp: 'X.x.X.x.', bass: 'rrrrrrrr' },
  funk: { name: 'Funk sixteenths', steps: 16, spb: 4, perc: { hat: 'x.x.x.x.x.x.x.x.', high: '....X..x....X..x', low: 'x......x..x.....' }, comp: '..x.x..x..x.x..x', bass: 'r......r..r.8...' },
  boomchick: { name: 'Boom-chick', steps: 8, spb: 2, perc: {}, comp: '..x...x.', bass: 'r...5...' },
  fado: { name: 'Fado', steps: 8, spb: 2, perc: {}, comp: '..x.x.x.', bass: 'r...5...' }
};

// bars: each string is one bar; chords in a bar separated by space
const TUNES = [
  { id: 'autumn', name: 'Autumn Leaves', group: 'Jazz standards', groove: 'swing', bpm: 140, note: 'Major and minor ii–V–Is in G minor / B♭ major.',
    form: [['A', 8], ['A', 8], ['B', 8], ['C', 8]], bars: ['Cm7', 'F7', 'Bbmaj7', 'Ebmaj7', 'Am7b5', 'D7', 'Gm6', 'Gm6', 'Cm7', 'F7', 'Bbmaj7', 'Ebmaj7', 'Am7b5', 'D7', 'Gm6', 'Gm6', 'Am7b5', 'D7', 'Gm6', 'Gm6', 'Cm7', 'F7', 'Bbmaj7', 'Ebmaj7', 'Am7b5', 'D7', 'Gm7 C7', 'Fm7 Bb7', 'Ebmaj7', 'Am7b5 D7', 'Gm6', 'Gm6'] },
  { id: 'bluebossa', name: 'Blue Bossa', group: 'Jazz standards', groove: 'bossa', bpm: 130, note: 'Minor ii–V in C minor, then a brief trip to D♭ major.',
    form: [['A', 8], ['B', 8]], bars: ['Cm7', 'Cm7', 'Fm7', 'Fm7', 'Dm7b5', 'G7', 'Cm7', 'Cm7', 'Ebm7', 'Ab7', 'Dbmaj7', 'Dbmaj7', 'Dm7b5', 'G7', 'Cm7', 'Dm7b5 G7'] },
  { id: 'summertime', name: 'Summertime (simplified)', group: 'Jazz standards', groove: 'swing', bpm: 90, note: 'A minor blues-tinged song form. Great for guide tones in minor.',
    form: [['A', 8], ['A', 8]], bars: ['Am6', 'E7', 'Am6', 'Am6', 'Dm7', 'Dm7', 'Bm7b5', 'E7', 'Am6', 'E7', 'Am6', 'Am6', 'C6 Am7', 'Dm7 E7', 'Am6', 'Bm7b5 E7'] },
  { id: 'flyme', name: 'Fly Me to the Moon (A section)', group: 'Jazz standards', groove: 'swing', bpm: 130, note: 'Runs down the cycle of fifths.',
    bars: ['Am7', 'Dm7', 'G7', 'Cmaj7 C7', 'Fmaj7', 'Bm7b5', 'E7', 'Am7 A7', 'Dm7', 'G7', 'Cmaj7 Am7', 'Dm7', 'G7', 'Cmaj7', 'Bm7b5', 'E7'] },
  { id: 'fblues', name: 'Jazz blues in F', group: 'Jazz standards', groove: 'swing', bpm: 140, note: 'The jazz blues used by Billie\'s Bounce, Now\'s the Time and many more.',
    bars: ['F7', 'Bb7', 'F7', 'Cm7 F7', 'Bb7', 'Bdim7', 'F7', 'D7', 'Gm7', 'C7', 'F7 D7', 'Gm7 C7'] },
  { id: 'satin', name: 'Satin Doll (A section)', group: 'Jazz standards', groove: 'swing', bpm: 125, note: 'Chained ii–Vs moving up by step.',
    bars: ['Dm7 G7', 'Dm7 G7', 'Em7 A7', 'Em7 A7', 'Am7 D7', 'Abm7 Db7', 'Cmaj7', 'Cmaj7'] },
  { id: 'atrain', name: 'Take the A Train (A section)', group: 'Jazz standards', groove: 'swing', bpm: 160, note: 'Home for the famous II7 (D7 in C) with a ♯11.',
    bars: ['Cmaj7', 'Cmaj7', 'D7#11', 'D7#11', 'Dm7', 'G7', 'Cmaj7', 'Cmaj7'] },
  { id: 'sowhat', name: 'So What (modal)', group: 'Jazz standards', groove: 'swing', bpm: 135, note: 'Sixteen bars of D Dorian, eight of E♭ Dorian, eight of D Dorian.',
    form: [['A', 8], ['A', 8], ['B', 8], ['A', 8]], bars: ['Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Ebm7', 'Ebm7', 'Ebm7', 'Ebm7', 'Ebm7', 'Ebm7', 'Ebm7', 'Ebm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7', 'Dm7'] },
  { id: 'rhythm', name: 'Rhythm changes (A section)', group: 'Jazz standards', groove: 'swing', bpm: 170, note: 'From I Got Rhythm: fast I–vi–ii–V turnarounds in B♭.',
    bars: ['Bbmaj7 G7', 'Cm7 F7', 'Dm7 G7', 'Cm7 F7', 'Fm7 Bb7', 'Ebmaj7 Edim7', 'Dm7 G7', 'Cm7 F7'] },
  { id: 'atttya', name: 'All the Things You Are', group: 'Jazz standards', groove: 'swing', bpm: 140, note: 'Key centers move by fourths and thirds. A guide-tone workout.',
    form: [['A1', 8], ['A2', 8], ['B', 8], ['A3', 12]], bars: ['Fm7', 'Bbm7', 'Eb7', 'Abmaj7', 'Dbmaj7', 'G7', 'Cmaj7', 'Cmaj7', 'Cm7', 'Fm7', 'Bb7', 'Ebmaj7', 'Abmaj7', 'Am7b5 D7', 'Gmaj7', 'Gmaj7', 'Am7', 'D7', 'Gmaj7', 'Gmaj7', 'F#m7b5', 'B7', 'Emaj7', 'C7', 'Fm7', 'Bbm7', 'Eb7', 'Abmaj7', 'Dbmaj7', 'Dbm7', 'Cm7', 'Bdim7', 'Bbm7', 'Eb7', 'Abmaj7', 'Gm7b5 C7'] },
  { id: 'solar', name: 'Solar', group: 'Jazz standards', groove: 'swing', bpm: 150, note: 'A 12-bar cycle that slides through keys by ii–Vs.',
    bars: ['Cm6', 'Cm6', 'Gm7', 'C7', 'Fmaj7', 'Fmaj7', 'Fm7', 'Bb7', 'Ebmaj7', 'Ebm7 Ab7', 'Dbmaj7', 'Dm7b5 G7'] },
  { id: 'giant', name: 'Giant Steps', group: 'Jazz standards', groove: 'swing', bpm: 120, note: 'Coltrane changes: three keys a major third apart. Start slow.',
    bars: ['Bmaj7 D7', 'Gmaj7 Bb7', 'Ebmaj7', 'Am7 D7', 'Gmaj7 Bb7', 'Ebmaj7 F#7', 'Bmaj7', 'Fm7 Bb7', 'Ebmaj7', 'Am7 D7', 'Gmaj7', 'C#m7 F#7', 'Bmaj7', 'Fm7 Bb7', 'Ebmaj7', 'C#m7 F#7'] },
  { id: 'minorswing', name: 'Minor Swing changes', group: 'World grooves', region: 'manouche', groove: 'pompe', bpm: 180, note: 'The gypsy jazz jam tune: A minor, D minor and E7.',
    bars: ['Am6', 'Am6', 'Dm6', 'Dm6', 'Am6', 'Am6', 'E7', 'E7', 'Dm6', 'Dm6', 'Am6', 'Am6', 'E7', 'E7', 'Am6', 'Am6'] },
  { id: 'andalusian', name: 'Andalusian cadence', group: 'World grooves', region: 'flamenco', groove: 'flamenco', bpm: 110, note: 'Am–G–F–E. Treat E as home and play E Phrygian dominant over it.',
    bars: ['Am', 'G', 'F', 'E', 'Am', 'G', 'F', 'E'] },
  { id: 'sonmontuno', name: 'Son montuno vamp', group: 'World grooves', region: 'cuba', groove: 'son', bpm: 100, note: 'I–IV–V–IV in C over 3-2 son clave. Lock your guajeo to the clave.',
    bars: ['C F', 'G F', 'C F', 'G F'] },
  { id: 'bossavamp', name: 'Bossa vamp in D minor', group: 'World grooves', region: 'brazil', groove: 'bossa', bpm: 128, note: 'A minor ii–V–i with lush 9ths in the bossa style.',
    bars: ['Dm7', 'Dm7', 'Em7b5', 'A7', 'Dm7', 'Dm7', 'Em7b5', 'A7'] },
  { id: 'highlife', name: 'Highlife progression', group: 'World grooves', region: 'westafrica', groove: 'highlife', bpm: 120, note: 'I–IV–I–V in G. Play short, interlocking arpeggios.',
    bars: ['G', 'C', 'G', 'D', 'G', 'C', 'D', 'G'] },
  { id: 'soukous', name: 'Soukous sebene', group: 'World grooves', region: 'centraleast', groove: 'soukous', bpm: 135, note: 'I–IV–V–IV in E. Loop bright lines high on the neck.',
    bars: ['E A', 'B A', 'E A', 'B A'] },
  { id: 'reggae', name: 'Reggae minor vamp', group: 'World grooves', region: 'caribbean', groove: 'reggae', bpm: 76, note: 'i–IV in A Dorian. Chop on 2 and 4.',
    bars: ['Am', 'D', 'Am', 'D'] },
  { id: 'tango', name: 'Tango minor', group: 'World grooves', region: 'latam', groove: 'tango', bpm: 110, note: 'A minor with harmonic-minor V7. Strong habanera bass.',
    bars: ['Am', 'E7', 'E7', 'Am', 'Dm', 'Am', 'E7', 'Am'] },
  { id: 'hijazvamp', name: 'Hijaz / freygish vamp', group: 'World grooves', region: 'arabic', groove: 'flamenco', bpm: 100, note: 'D–E♭–D: play D Phrygian dominant (Hijaz on D). Also works for klezmer and Balkan music.',
    bars: ['D', 'D', 'Eb', 'D', 'D', 'Cm', 'Eb', 'D'] },
  { id: 'blues12', name: '12-bar shuffle blues in A', group: 'Blues, rock & roots', region: 'blues', groove: 'shuffle', bpm: 88, note: 'I7 for four bars, IV7 for two, back to I7, then V7–IV7–I7–V7. Play A minor pentatonic, then aim for each chord\'s 3rd.',
    bars: ['A7', 'A7', 'A7', 'A7', 'D7', 'D7', 'A7', 'A7', 'E7', 'D7', 'A7', 'E7'] },
  { id: 'rockvamp', name: 'Rock I–♭VII–IV in D', group: 'Blues, rock & roots', region: 'rock', groove: 'rock', bpm: 116, note: 'The Mixolydian rock move. Try D minor pentatonic, then D Mixolydian.',
    bars: ['D', 'C', 'G', 'D', 'D', 'C', 'G', 'D'] },
  { id: 'funkvamp', name: 'One-chord funk in E', group: 'Blues, rock & roots', region: 'funksoul', groove: 'funk', bpm: 98, note: 'Stay on E9 and lock to the 16ths. E Dorian and E minor pentatonic on top.',
    bars: ['E9', 'E9', 'E9', 'E9'] },
  { id: 'country145', name: 'I–IV–V boom-chick in G', group: 'Blues, rock & roots', region: 'country', groove: 'boomchick', bpm: 110, note: 'Bass on 1 and 3, strum on 2 and 4. G major pentatonic for fills.',
    bars: ['G', 'G', 'C', 'C', 'G', 'G', 'D7', 'D7', 'G', 'G', 'C', 'C', 'G', 'D7', 'G', 'G'] },
  { id: 'fadominor', name: 'Fado menor progression', group: 'World grooves', region: 'fado', groove: 'fado', bpm: 70, note: 'i–V7–i with a turn to iv. A harmonic minor over the E7.',
    bars: ['Am', 'Am', 'E7', 'E7', 'E7', 'E7', 'Am', 'Am', 'Am', 'A7', 'Dm', 'Dm', 'Am', 'E7', 'Am', 'Am'] },
  { id: 'slackkey', name: 'Slack key vamp in G', group: 'World grooves', region: 'hawaii', groove: 'boomchick', bpm: 90, note: 'Alternate the thumb on the bass strings and play the melody on top, as in Taro Patch (open G) tuning.',
    bars: ['G', 'G', 'C', 'G', 'G', 'D7', 'G', 'G'] }
];

/* ---------- Technique exercises ---------- */
const EXERCISES = [
  { id: 'altpick', name: 'Alternate picking', unit: '16ths', target: 140, start: 80, how: 'Strict down-up on one string, then across two strings. Keep the motion small and from the wrist.' },
  { id: 'spider', name: 'Chromatic spider (1-2-3-4)', unit: '16ths', target: 120, start: 70, how: 'One finger per fret across all six strings and back. Keep fingers close to the frets.' },
  { id: 'legato', name: '3-notes-per-string legato', unit: '16th triplets', target: 120, start: 70, how: 'Pick once per string, hammer and pull the rest. Match the volume of picked and legato notes.' },
  { id: 'strskip', name: 'String-skipping arpeggios', unit: '8ths', target: 160, start: 90, how: 'Triad arpeggios that skip a string. Mute the strings you skip.' },
  { id: 'sweep', name: '3-string sweep arpeggios', unit: '8th triplets', target: 140, start: 70, how: 'One continuous pick motion through the strings. Lift each finger as soon as the note sounds.' },
  { id: 'chords', name: 'Chord changes per minute', unit: 'changes/min', target: 60, start: 0, mode: 'count', how: 'Pick two chords. Switch between them for 60 seconds and tap once per clean change.' },
  { id: 'travis', name: 'Travis picking', unit: '8ths', target: 120, start: 70, how: 'Thumb alternates bass strings on every beat; fingers pinch melody notes between.' },
  { id: 'bossarh', name: 'Bossa nova right hand', unit: '8ths', target: 140, start: 80, how: 'Thumb on 1 and 3, fingers play the syncopated pattern. Keep the thumb steady.' },
  { id: 'rasg', name: 'Flamenco rasgueado (e-a-m-i)', unit: '16ths', target: 120, start: 60, how: 'Flick each finger out from a loose fist, little finger first. Aim for an even roll.' },
  { id: 'picado', name: 'Flamenco picado (i-m rest stroke)', unit: '16ths', target: 130, start: 70, how: 'Alternate index and middle with rest strokes. Accent the first note of each group.' },
  { id: 'reststroke', name: 'Gypsy jazz rest stroke', unit: '8ths', target: 200, start: 110, how: 'Downstroke that rests on the next string when changing strings. Upstrokes stay on one string.' },
  { id: 'pompe', name: 'La pompe', unit: 'quarters', target: 200, start: 120, how: 'Bass on 1 and 3, a short muted chord on 2 and 4. Keep the wrist loose.' },
  { id: 'tremolo', name: 'Tremolo picking', unit: '16ths', target: 160, start: 90, how: 'Very fast, even picks on one note. Relax the forearm.' },
  { id: 'konnakol', name: 'Konnakol + guitar (ta-ka-di-mi)', unit: '16ths', target: 120, start: 60, how: 'Say ta-ka-di-mi while playing 16ths. Then try ta-ki-ta (3s) against the click.' },
  { id: 'funkstrum', name: '16th-note funk strumming', unit: '16ths', target: 110, start: 70, how: 'Keep the strumming hand moving down-up in 16ths. The fretting hand mutes most strokes; let only the accents ring.' },
  { id: 'hybrid', name: 'Hybrid picking', unit: '8ths', target: 140, start: 70, how: 'Pick the bass note, then pluck the higher strings with the middle and ring fingers. A country staple.' },
  { id: 'pima', name: 'Classical arpeggios (p-i-m-a)', unit: '16ths', target: 100, start: 50, how: 'Thumb on the bass, then i, m and a on strings 3, 2 and 1. Keep the volume even and the hand still.' },
  { id: 'bends', name: 'Bends in tune', unit: 'quarters', target: 120, start: 60, how: 'Bend a whole step on the G or B string and match the note two frets up. Push with three fingers.' }
];

/* ---------- Call & response items ---------- */
const LICK_ITEMS = [
  { id: 'majpent:3', scale: 'majpent', len: 3, tier: 1 },
  { id: 'minpent:3', scale: 'minpent', len: 3, tier: 1 },
  { id: 'majpent:4', scale: 'majpent', len: 4, tier: 2 },
  { id: 'minpent:4', scale: 'minpent', len: 4, tier: 2 },
  { id: 'blues:4', scale: 'blues', len: 4, tier: 3 },
  { id: 'major:4', scale: 'major', len: 4, tier: 3 },
  { id: 'dorian:5', scale: 'dorian', len: 5, tier: 4 },
  { id: 'phrydom:4', scale: 'phrydom', len: 4, tier: 4 },
  { id: 'minpent:5', scale: 'minpent', len: 5, tier: 4 },
  { id: 'major:6', scale: 'major', len: 6, tier: 5 },
  { id: 'harmmin:5', scale: 'harmmin', len: 5, tier: 5 },
  { id: 'lydian:5', scale: 'lydian', len: 5, tier: 5 }
];

/* Technique guides, style drills and theory lessons: their short fields (ids, names, styles, levels) come
   from a build-time index (scripts/content-index.mjs); the long texts are merged into the same objects when
   a guide, drill or lesson is opened (src/content/lazy.js). */
const DRILLS = INDEX.drills;
const LESSONS = INDEX.lessons;

/* More rhythms for every style (src/content/rhythms-new.js), and variations, fills, longer cycles and tips
   for every rhythm (src/content/rhythms-var.js). New rhythms are listed on their style's page too. */
RHY_NEW.extra.forEach(x => { if (!RHYTHMS.some(r => r.id === x.id)) RHYTHMS.push(x); });
RHYTHMS.forEach(r => {
  const v = RHY_VAR.rhythms[r.id] || RHY_NEW.rhythms[r.id];
  if (v) r.var = v;
  if (RHY_VAR.words[r.region]) r.words = RHY_VAR.words[r.region];
  const reg = REGIONS.find(g => g.id === r.region);
  if (reg && !(reg.rhythms = reg.rhythms || []).includes(r.id)) reg.rhythms.push(r.id);
});

/* Technique variations, a speed-burst recipe and an external-focus cue per exercise (src/content/exercise-vars.js) */
EXERCISES.forEach(ex => { if (EX_VARS[ex.id]) ex.vars = EX_VARS[ex.id]; });

const TECHNIQUES = INDEX.techniques;

export default { DRILLS, SCIENCE: null, LESSONS, TECHNIQUES, NOTE_NAMES, NOTE_FULL, INTERVALS, CHORDS, DEGREES, NUMERALS, SCALES, RHYTHMS, REGIONS, GROOVES, TUNES, EXERCISES, LICK_ITEMS };
