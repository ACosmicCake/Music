/* World Woodshed — sight-reading curriculum and exercise generators.
   Pure data and functions (no DOM), so they can be tested in Node.
   All pitches are WRITTEN MIDI numbers: guitar music is written an octave above where it sounds
   (written middle C, 60, is the C on the A string, 3rd fret, which sounds as MIDI 48).
   Tempo is in beats per minute; in 6/8 the beat is the dotted quarter. */
import { KEYS, keyScale, spell, parseTime, durQ, DUR } from '../notation.js';

const range = (lo, hi, pcs) => { const out = []; for (let m = lo; m <= hi; m++) if (!pcs || pcs.includes(m % 12)) out.push(m); return out; };
const NAT = [0, 2, 4, 5, 7, 9, 11];
const nat = (lo, hi) => range(lo, hi, NAT);
const chrom = (lo, hi) => range(lo, hi);
const uniq = a => [...new Set(a)].sort((x, y) => x - y);
// a position (index finger at fret p): written low E string fret p − 1 to high e string fret p + 4, a stretch either side
const posNotes = p => chrom(51 + p, 80 + p);
// first position, written: low E (52, three ledger lines below) to G on the high e string, 3rd fret (79)
const TOP2 = [71, 72, 74, 76, 77, 79];          // B C D on the B string, E F G on the high e
const TOP3 = uniq(TOP2.concat([67, 69]));         // + G A on the G string
const TOP4 = uniq(TOP3.concat([62, 64, 65]));     // + D E F on the D string
const TOP5 = uniq(TOP4.concat([57, 59, 60]));     // + A B C on the A string
const FIRST = nat(52, 79);                        // + E F G on the low E string
const SHARP_F = [54, 66, 78], FLAT_B = [58, 70], SHARP_C = [61, 73], LEAD = [56, 68, 80, 63, 75]; // F♯, B♭, C♯; G♯ and D♯
const MOST_KEYS = ['C', 'G', 'D', 'F', 'A', 'Bb', 'Am', 'Em', 'Dm'];

/* The path: each level adds one new thing to everything before it (the fields below carry on from level to
   level unless a level sets them again). Rhythm features: durs (note values), dotted, rests, ties, feats
   (rhythm figures: dq dotted quarter + eighth, sync, 16mix, d8 dotted eighth + sixteenth, trip8, tripmix, tripq,
   trip16), times. Pitch: notes (written MIDI), keys, maxLeap, chromatic, leaps, lead (raise the 7th in minor),
   chords ('dyad' two notes at once, 'triad', 'melody' a melody with chords on the strong beats). focus makes
   the level's new figure come up more often. */
const PATH = [
  { name: 'First notes: B to G', stage: 'Notes in first position', goal: 'Read B C D on the B string and E F G on the high e string, in whole and half notes.',
    notes: TOP2, durs: ['w', 'h'], dotted: [], rests: [], ties: false, feats: [], times: ['4/4'], keys: ['C'], tempo: [50, 72], maxLeap: 5,
    tips: ['Open high e is the top space; F is the top line; G sits just above the staff.', 'Open B is the middle line; C is the space above it (1st fret), D the line above that (3rd fret).', 'Count "1 2 3 4" out loud: a half note lasts two counts, a whole note all four.'] },
  { name: 'Quarter notes', goal: 'Add the quarter note: one count each, a filled head with a stem.', durs: ['w', 'h', 'q'], focus: ['q'], tempo: [52, 76],
    tips: ['A quarter note is one count: "1 2 3 4" is four of them.', 'Filled head = quarter; hollow head with a stem = half; hollow without a stem = whole.', 'Keep your picking hand moving down on every count, even through long notes.'] },
  { name: 'The G string: G and A', goal: 'Add the open G string and A (2nd fret) and move across three strings without looking down.', notes: TOP3,
    tips: ['Open G is the second line from the bottom: the line the treble clef curls around.', 'A is the space just above it, 2nd fret.', 'Steps on the staff (line to the next space) are neighbouring notes: often the next fret or the next string.'] },
  { name: 'Rests', goal: 'Keep counting through half and quarter rests: silence has a length too.', rests: ['h', 'q'], focus: ['r'],
    tips: ['A rest is counted exactly like a note of the same length. Keep the count going out loud.', 'Stop the string on a rest: lift the fretting finger or touch the string with the picking hand.', 'The half rest sits on the middle line like a hat; the quarter rest is the squiggle.'] },
  { name: 'The D string: D E F', goal: 'Read D (the space below the staff), E (the bottom line) and F on the D string.', notes: TOP4,
    tips: ['Open D hangs just below the staff, in the space under the bottom line.', 'The bottom line is E: D string, 2nd fret. F is the first space, 3rd fret.', 'The bottom line E and the top space E are an octave apart: two strings and two frets away.'] },
  { name: 'The A string: ledger lines', goal: 'Read A, B and C on the A string, with short ledger lines below the staff.', notes: TOP5, maxLeap: 7,
    tips: ['Middle C sits on one ledger line below the staff: A string, 3rd fret.', 'B hangs just under that ledger line (2nd fret); open A sits on the second ledger line.', 'Count ledger lines from the staff outwards, not from the note in.'] },
  { name: 'The low E string: all of first position', goal: 'Read every natural note in first position, down to low E three ledger lines below the staff.', notes: FIRST,
    tips: ['Low E, the open 6th string, hangs under three ledger lines. F sits on the third ledger line (1st fret) and G hangs under the second (3rd fret).', 'Learn landmarks, not every note: middle C (one ledger line), open D (the space below the staff), open A (two ledger lines) and low E.', 'The bottom line is E on the D string, 2nd fret, an octave above the open low E.'] },
  { name: '3/4 time and the dotted half', stage: 'Meters, eighths and ties', goal: 'Feel three beats to the bar, with the dotted half note filling a whole bar.', dotted: ['h'], times: ['4/4', '3/4'], focus: ['dh'], tempo: [56, 84],
    tips: ['The top number is beats per bar; the bottom 4 means the quarter note gets the beat.', '3/4 is waltz time: accent beat 1 a little, "ONE two three".', 'A dot adds half the note\'s value: a dotted half is 3 beats.'] },
  { name: '2/4 time', goal: 'Two beats to the bar: the march and polka feel, with bar lines coming twice as often.', times: ['4/4', '3/4', '2/4'],
    tips: ['In 2/4 there is no whole note: a half note fills the bar.', 'Bar lines come quickly; let your eyes run ahead of them.', 'Count "ONE two, ONE two", strong on every bar line.'] },
  { name: 'Eighth notes', goal: 'Read pairs of beamed eighth notes and count the "and" between beats.', durs: ['w', 'h', 'q', '8'], focus: ['8'], tempo: [54, 80],
    tips: ['Count "1 & 2 & 3 & 4 &": eighth notes fall on the numbers and on the "&".', 'Beams group eighths by the beat, so each beamed pair is one beat.', 'Alternate down and up picking: down on the beat, up on the "&".'] },
  { name: 'Eighth rests', goal: 'Read an eighth rest on the beat with the note on the "&", and a note on the beat with a rest after it.', rests: ['h', 'q', '8'], focus: ['r8'],
    tips: ['The eighth rest is a small 7 shape. It lasts half a beat.', 'Rest on the beat, note on the "&": the pick still moves down on the beat, but misses the string.', 'Say the rest out loud as "(1) &" so the count never stops.'] },
  { name: 'Ties', goal: 'Hold a tied note through the beat or across the bar line without picking it again.', ties: true, focus: ['tie'],
    tips: ['A tie joins two notes of the same pitch: pick the first, hold through the second.', 'A tie across the bar line is common: the note keeps sounding on the next bar\'s "1".', 'Count the beats you hold through, out loud.'] },
  { name: 'Dotted quarter and eighth', goal: 'Read the dotted quarter + eighth figure: long, then short on the "& of 2".', dotted: ['h', 'q'], feats: ['dq'], focus: ['dq'],
    tips: ['Dotted quarter + eighth = "1 & 2 &" with the eighth on the "& of 2".', 'Feel it as a quarter tied to an eighth.', 'Keep your foot or head on the beat; the dotted rhythm lands between it.'] },
  { name: 'The key of G: F sharp', stage: 'Key signatures and accidentals', goal: 'One sharp in the key signature: every F is F♯, in every octave.', notes: uniq(FIRST.concat(SHARP_F)), keys: ['G'],
    tips: ['One sharp (F♯) is G major. It sits on the top line, but applies to every F.', 'F♯ in first position: low E string 2nd fret, D string 4th fret, high e string 2nd fret.', 'Check the key signature before you play a note, every time.'] },
  { name: 'The key of F: B flat', goal: 'One flat: every B is B♭. Read in F major, and back in G and C.', notes: uniq(FIRST.concat(SHARP_F, FLAT_B)), keys: ['F', 'F', 'G', 'C'],
    tips: ['One flat (B♭) is F major. The flat sits on the middle line, but applies to every B.', 'B♭ in first position: A string 1st fret, and G string 3rd fret for the one on the middle line.', 'The open B string is B natural: in F major, stay off it.'] },
  { name: 'The key of D: two sharps', goal: 'Two sharps, F♯ and C♯: D major.', notes: uniq(FIRST.concat(SHARP_F, FLAT_B, SHARP_C)), keys: ['D', 'D', 'G', 'F', 'C'],
    tips: ['Two sharps (F♯ C♯) is D major. The last sharp is a half step below the key: C♯ → D.', 'C♯ in first position: A string 4th fret, B string 2nd fret.', 'Sharps always come in the same order: F C G D A E B.'] },
  { name: 'Minor keys', goal: 'Read in A, E and D minor, where the 7th is often raised by an accidental on the way to the tonic.', notes: uniq(FIRST.concat(SHARP_F, FLAT_B, SHARP_C, LEAD)), keys: ['Am', 'Am', 'Em', 'Dm', 'C', 'G', 'D', 'F'], lead: true,
    tips: ['A minor key shares its signature with the major a minor third above (A minor and C major).', 'In minor, the 7th is usually raised on the way to the tonic: G♯ in A minor, D♯ in E minor, C♯ in D minor.', 'Tell major from minor by the last note: it is nearly always the tonic.'] },
  { name: 'More keys: A, B flat and E flat', goal: 'Three sharps and two or three flats: A, B♭ and E♭ major.', notes: chrom(52, 80), keys: ['A', 'Bb', 'Eb', 'A', 'Bb', 'Eb', 'G', 'D', 'F', 'Am', 'Em', 'Dm'],
    tips: ['Sharps go F C G D A E B; flats go B E A D G C F.', 'With flats, the second-to-last flat names the key: B♭ E♭ → B♭ major.', 'In E♭ major, every A is A♭ too: G string, 1st fret.'] },
  { name: 'Accidentals', goal: 'Read sharps, flats and naturals added inside the bar, and remember they last until the bar line.', keys: ['C', 'G', 'F', 'D', 'Am'], chromatic: 0.22, tempo: [52, 76],
    tips: ['An accidental holds for the rest of the bar on that line or space. The bar line cancels it.', 'A natural sign cancels a sharp or flat from the key signature or from earlier in the bar.', 'Chromatic notes usually move by half step to the next note: look one note ahead to see where they resolve.'] },
  { name: 'Syncopation', stage: 'Syncopation and sixteenths', goal: 'Read rhythms that push across the beat: eighth-quarter-eighth and notes tied over the beat.', feats: ['dq', 'sync'], keys: MOST_KEYS, chromatic: 0, focus: ['sync'], tempo: [56, 84],
    tips: ['Keep your strumming hand going down and up in eighths; play only the strokes the music asks for.', 'Eighth-quarter-eighth: "1 & (2) &". The quarter starts on an "&" and holds through the beat.', 'A note tied over the beat is a syncopation too: say the count you are holding through.'] },
  { name: 'Sixteenth notes', goal: 'Read groups of four sixteenths: "1 e & a".', durs: ['w', 'h', 'q', '8', '16'], focus: ['16'], tempo: [44, 66],
    tips: ['Count "1 e & a 2 e & a": four sixteenths to the beat.', 'Two beams mean sixteenths. Read the whole beat as one shape.', 'Pick down-up-down-up, and practise slowly enough that every note is even.'] },
  { name: 'Eighth and two sixteenths', goal: 'Read the gallop (eighth, two sixteenths) and its reverse (two sixteenths, eighth).', feats: ['dq', 'sync', '16mix'], focus: ['16mix'],
    tips: ['Eighth + two sixteenths = "1 & a". Two sixteenths + eighth = "1 e &".', 'The beam shows it: one beam all the way, a second beam only under the sixteenths.', 'Keep the hand moving in sixteenths and skip the strokes that are not written.'] },
  { name: 'Dotted eighth and sixteenth', goal: 'Read the long-short skip of a dotted eighth and a sixteenth, and the sixteenth-eighth-sixteenth syncopation.', dotted: ['h', 'q', '8'], feats: ['dq', 'sync', '16mix', 'd8'], focus: ['d8'],
    tips: ['Dotted eighth + sixteenth is "1 (e &) a": long-short, like a skip.', 'The sixteenth gets a short stub of a second beam.', 'Don\'t let it turn into a triplet swing: the short note is a quarter of the beat, not a third.'] },
  { name: '6/8 time', goal: 'Feel two big beats of three eighths each, and read the quarter-eighth lilt of compound time.', times: ['6/8'], rests: ['q', '8'], focus: ['68'], tempo: [40, 63],
    tips: ['6/8 has two beats per bar, each a dotted quarter: count "1 2 3 4 5 6" with weight on 1 and 4.', 'Eighths are beamed in threes, one group per beat.', 'Quarter + eighth inside one beat is the lilting "long-short" of jigs and many 6/8 songs.'] },
  { name: 'Eighth-note triplets', stage: 'Triplets', goal: 'Three even notes in one beat, marked with a 3: "1 trip let".', times: ['4/4', '3/4', '2/4'], rests: ['h', 'q', '8'], feats: ['dq', 'sync', '16mix', 'd8', 'trip8'], focus: ['trip8'], tempo: [50, 76],
    tips: ['Three triplet eighths take the time of two ordinary eighths: one beat.', 'Count "1 trip let 2 trip let", or say "tri-po-let" on each beat.', 'Alternate picking puts the next beat on an upstroke. That is fine: keep the hand even.'] },
  { name: 'Triplets with rests and longer notes', goal: 'Read triplets with a rest in them, and a quarter plus an eighth inside the 3: the shuffle shape.', feats: ['dq', 'sync', '16mix', 'd8', 'trip8', 'tripmix'], focus: ['tripmix'],
    tips: ['Quarter + eighth under a 3 is "1 (trip) let": long-short, the shuffle.', 'A rest inside a triplet still takes its third of the beat. Count all three.', 'The bracket shows which notes share the beat when there is no beam.'] },
  { name: 'Quarter-note triplets', goal: 'Three quarter notes in the time of two: across two beats.', feats: ['dq', 'sync', '16mix', 'd8', 'trip8', 'tripmix', 'tripq'], focus: ['tripq'],
    tips: ['Three triplet quarters fill two beats. Each one is two triplet eighths long.', 'Count eighth-note triplets under them: "1 trip LET 2 TRIP let" and play on 1, the "let" of 1 and the "trip" of 2.', 'They feel like they float over the beat. Keep your foot steady.'] },
  { name: 'Two notes at once', stage: 'Chords', goal: 'Read double stops: two notes on one stem, a third or a sixth apart, played together.', chords: 'dyad', notes: chrom(57, 81), keys: ['C', 'G', 'D', 'F', 'Am', 'Em'], feats: ['dq'], ties: false, durs: ['w', 'h', 'q', '8'], rests: ['h', 'q'], tempo: [50, 72], focus: [],
    tips: ['Read the top note first, then the interval below it: a third is line-line or space-space next door; a sixth is line to space, five steps away.', 'Thirds on the top strings are usually on neighbouring strings; sixths skip a string.', 'Play both notes in one motion: pinch them with thumb and finger, or pick and sweep.'] },
  { name: 'Three-note chords', goal: 'Read stacked three-note chords and find them as shapes on the top three strings.', chords: 'triad',
    tips: ['A chord stacked line-line-line or space-space-space is a root-position triad: name the bottom note and you know the chord.', 'An inversion has a gap (a fourth) between two of its notes: the top note of the gap is the root.', 'Chords that follow each other usually share notes. Keep the common fingers down.'] },
  { name: 'Melody with chords', goal: 'Read a tune with chords under it on the strong beats, and single notes in between: chord melody.', chords: 'melody', feats: ['dq', 'sync'], notes: chrom(62, 84),
    tips: ['The melody is the top note of each chord. Hear it sing above the rest.', 'Fret the chord, then play the single notes with the fingers you have free.', 'Let the chord ring under the melody notes when the shape allows.'] },
  { name: 'Second position', stage: 'Up the neck', goal: 'Read with the index finger at the 2nd fret: one finger per fret from 2 to 5, so the sharp keys lie under the hand.',
    chords: null, notes: posNotes(2), keys: ['D', 'A', 'E', 'Bm', 'F#m', 'G'], feats: ['dq', 'sync', '16mix', 'd8'], ties: true, rests: ['h', 'q', '8'], durs: ['w', 'h', 'q', '8', '16'], tempo: [50, 76], maxLeap: 7, leaps: 0.1, position: 2,
    tips: ['Second position: index at fret 2, little finger at fret 5, and a stretch to 1 or 6 when a note asks for it.', 'The open strings are still there, but play the fretted note instead: B on the G string 4th fret, E on the B string 5th fret. It keeps the hand where it is.', 'A major and D major lie well here: the whole scale is under four fingers on every string.'] },
  { name: 'Fifth position: ledger lines above', goal: 'Read up to D above the staff in fifth position (index finger at the 5th fret).',
    chords: null, notes: uniq(nat(57, 86).concat([61, 66, 68, 70, 73, 78, 80, 82, 85])), keys: ['C', 'G', 'F', 'D', 'Am', 'Em'], feats: ['dq', 'sync', '16mix', 'd8', 'trip8'], ties: true, rests: ['h', 'q', '8'], durs: ['w', 'h', 'q', '8', '16'], tempo: [50, 76], position: 5,
    tips: ['In fifth position the index finger covers fret 5 on every string: the high e string gives A B C D at frets 5, 7, 8, 10.', 'A above the staff sits on one ledger line; C has two. Count the ledger lines from the staff outward.', 'Many notes now have a second home: E at the top space is the open e or the B string, 5th fret. Stay in position.'] },
  { name: 'Seventh position', goal: 'Index finger at the 7th fret: the middle of the neck, where the staff\'s top lines and the ledger lines above meet.',
    notes: posNotes(7), keys: ['G', 'D', 'A', 'E', 'Em', 'Bm', 'C'], tempo: [48, 72], position: 7,
    tips: ['Seventh position: the low E string gives B C♯ D E at frets 7 to 10, and the high e gives B C♯ D E an octave and a bit higher, two ledger lines and up.', 'The lowest note you can reach is B below middle C (written), on the low E string. Anything lower means leaving the position.', 'Learn one landmark per string: the 7th fret is B, E, A, D, F♯, B from the low string up.'] },
  { name: 'Ninth position', goal: 'Index finger at the 9th fret: the high register, three and four ledger lines above the staff.',
    notes: posNotes(9), keys: ['C', 'F', 'G', 'Am', 'Dm', 'Bb'], tempo: [46, 70], position: 9,
    tips: ['Ninth position: the low E string gives C♯ D E F at frets 9 to 12, the high e gives C♯ D E F two octaves up.', 'The 12th fret is the open strings an octave up: E A D G B E, the same letters as first position.', 'Count ledger lines in pairs: two lines is C, three is E, four is G above the staff.'] },
  { name: 'Across positions: shifting', goal: 'A melody too wide for one position: pick where to shift, and move the hand on an open string, a rest or a slide by a step.',
    notes: chrom(52, 89), keys: MOST_KEYS, maxLeap: 9, leaps: 0.15, tempo: [48, 72], position: null,
    tips: ['Scan for the highest and lowest notes first, and decide the shifts before you play: in a rest, on a long note, or on an open string.', 'Shift with a guide finger: keep the finger that played the last note on its string and slide it to the new fret.', 'Change position by a whole hand (first to fifth, fifth to ninth) more often than by a fret or two: you know where you land.'] },
  { name: 'Larger leaps', stage: 'Range and beyond', position: null, goal: 'Read leaps of a sixth, seventh and octave by recognising the shape of the interval on the staff.', notes: chrom(52, 86), keys: ['C', 'G', 'D', 'F', 'A', 'Bb', 'Am', 'Em', 'Dm'], maxLeap: 12, leaps: 0.3,
    tips: ['Read intervals, not just letters: line to line is an odd interval (3rd, 5th, 7th), line to space an even one.', 'An octave is line to space (or space to line) seven steps away: on the guitar, two strings over and two or three frets up.', 'Look at where a leap lands before you reach it, so the hand moves early.'] },
  { name: 'Sixteenth-note triplets', goal: 'Three notes in half a beat: the quick triplet turn, and six to the beat.', feats: ['dq', 'sync', '16mix', 'd8', 'trip8', 'tripmix', 'tripq', 'trip16'], focus: ['trip16'], maxLeap: 7, leaps: 0.1, tempo: [44, 63],
    tips: ['Three sixteenth-triplets take the time of two sixteenths: half a beat.', 'Six of them fill a beat: count "1 la li & la li".', 'Practise them as a quick turn or a slur first: hammer-ons and pull-offs make them easy to play even.'] },
  { name: '5/4 time', goal: 'Five beats to the bar, felt as 3 + 2 or 2 + 3.', times: ['5/4'], focus: [], tempo: [52, 80],
    tips: ['Count "1 2 3 4 5" with a small accent on 1 and a lighter one on 4 (3 + 2).', 'Long notes and ties often show the grouping: look where they start.', 'Take Five (Dave Brubeck Quartet, 1959) is the classic 5/4 to listen to.'] },
  { name: '12/8 time', goal: 'Four big beats of three eighths each: the slow blues and gospel feel.', times: ['12/8'], tempo: [40, 60],
    tips: ['12/8 is four dotted-quarter beats, each split in three: "1 trip let 2 trip let 3 trip let 4 trip let".', 'It reads like 4/4 with triplets everywhere, written without the 3s.', 'Quarter + eighth inside a beat is the shuffle again.'] },
  { name: 'Everything', goal: 'Mixed keys, meters, rhythms, triplets and positions: the kind of page a session or a band chart puts in front of you.',
    notes: chrom(52, 88), times: ['4/4', '3/4', '2/4', '6/8', '5/4', '12/8'], keys: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Am', 'Em', 'Bm', 'Dm', 'Gm'], tempo: [52, 84], maxLeap: 12, chromatic: 0.1, leaps: 0.15, focus: [],
    tips: ['Before you start: key, meter, the highest and lowest notes, and any tricky rhythm. Ten seconds of scanning saves the read.', 'Choose a position that covers the range, then stay in it.', 'Pick a tempo you can hold without stopping. Steady and slightly wrong beats perfect and halting.'] }
];
const CARRY = ['notes', 'durs', 'dotted', 'rests', 'ties', 'feats', 'times', 'keys', 'tempo', 'maxLeap', 'chromatic', 'leaps', 'lead', 'chords', 'position', 'stage'];
export const LEVELS = [];
PATH.forEach((spec, i) => {
  const prev = LEVELS[i - 1] || {};
  const L = { id: i + 1 };
  CARRY.forEach(k => { L[k] = k in spec ? spec[k] : prev[k]; });
  Object.assign(L, { name: spec.name, goal: spec.goal, tips: spec.tips, focus: spec.focus || [], newStage: !!spec.stage });
  if (L.lead) L.lead = true;
  L.sync = L.feats.includes('sync');
  LEVELS.push(L);
});
/* the stages the path is grouped in, for the level picker */
export const STAGES = LEVELS.filter(l => l.newStage).map((l, k, all) => ({ name: l.stage, from: l.id, to: k + 1 < all.length ? all[k + 1].id - 1 : LEVELS.length }));
/* The sixteen levels the app had before moved onto this path in state migration 8 (src/sync.js). */

/* How to sight-read: shown on every level */
export const HOW_TO = [
  ['Scan first', 'Before you play, check the key signature, the time signature, the highest and lowest notes and any rhythm you don\'t recognise.'],
  ['Look ahead', 'Keep your eyes a beat or two ahead of where you are playing. The note you are on is already in your hands.'],
  ['Keep going', 'Never stop to fix a wrong note. The beat goes on; land the next one. Rhythm matters more than pitch.'],
  ['Count', 'Count out loud or in your head the whole time, rests included. Tap your foot.'],
  ['Read in shapes', 'See groups: a beamed beat, a scale run, a chord outline, an interval. Read words, not letters.'],
  ['Go slow', 'Choose a tempo where you can read everything without stopping, then speed up 4 bpm at a time.']
];

/* ---------- items for the skill system ---------- */
const NAME = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const midiLabel = m => NAME[m % 12] + (Math.floor(m / 12) - 1);
export function noteTier(m) {
  const L = LEVELS.find(l => l.notes.includes(m));
  return L ? Math.max(1, Math.min(LEVELS.length, L.id)) : LEVELS.length;
}
export function readingItems() {
  const all = uniq(LEVELS.flatMap(l => l.notes));
  const out = all.map(m => ({ id: 'n:' + m, label: 'Read ' + midiLabel(m) + ' (written)', tier: noteTier(m) }));
  LEVELS.forEach(l => {
    out.push({ id: 'L' + l.id + ':rhythm', label: 'Level ' + l.id + ' rhythm: ' + l.name, tier: l.id });
    out.push({ id: 'L' + l.id + ':melody', label: 'Level ' + l.id + ' melody: ' + l.name, tier: l.id });
  });
  return out;
}
export const levelOf = k => LEVELS[Math.max(0, Math.min(LEVELS.length - 1, (k | 0) - 1))];

/* ---------- rhythm generation ---------- */
// cells fill one or more beats. Each event: [dur, dotted, rest, tuplet]. tags name the rhythm figures a level
// must have reached (its feats) before the cell is used.
const T3 = (d, rest) => [d, 0, rest ? 1 : 0, 3];
const SIMPLE_CELLS = [
  { len: 4, ev: [['w']], w: 1.2 },
  { len: 3, ev: [['h', 1]], w: 1.2 },
  { len: 2, ev: [['h']], w: 2 },
  { len: 2, ev: [['h', 0, 1]], w: 0.7 },
  { len: 2, ev: [['q', 1], ['8']], w: 1.6, tags: ['dq'] },
  { len: 2, ev: [['8'], ['q'], ['8']], w: 1.5, tags: ['sync'] },
  { len: 2, ev: [['8', 0, 1], ['q'], ['8']], w: 0.8, tags: ['sync'] },
  { len: 1, ev: [['q']], w: 3 },
  { len: 1, ev: [['q', 0, 1]], w: 0.9 },
  { len: 1, ev: [['8'], ['8']], w: 2.4 },
  { len: 1, ev: [['8', 0, 1], ['8']], w: 0.9 },
  { len: 1, ev: [['8'], ['8', 0, 1]], w: 0.5 },
  { len: 1, ev: [['16'], ['16'], ['16'], ['16']], w: 1.4 },
  { len: 1, ev: [['8'], ['16'], ['16']], w: 1.3, tags: ['16mix'] },
  { len: 1, ev: [['16'], ['16'], ['8']], w: 1.3, tags: ['16mix'] },
  { len: 1, ev: [['8', 1], ['16']], w: 1.2, tags: ['d8'] },
  { len: 1, ev: [['16'], ['8'], ['16']], w: 0.8, tags: ['sync', '16mix'] },
  // triplets
  { len: 1, ev: [T3('8'), T3('8'), T3('8')], w: 2.2, tags: ['trip8'] },
  { len: 1, ev: [T3('q'), T3('8')], w: 1.4, tags: ['tripmix'] },
  { len: 1, ev: [T3('8'), T3('q')], w: 0.5, tags: ['tripmix'] },
  { len: 1, ev: [T3('8', 1), T3('8'), T3('8')], w: 0.7, tags: ['tripmix'] },
  { len: 1, ev: [T3('8'), T3('8', 1), T3('8')], w: 0.4, tags: ['tripmix'] },
  { len: 2, ev: [T3('q'), T3('q'), T3('q')], w: 1.6, tags: ['tripq'] },
  { len: 1, ev: [T3('16'), T3('16'), T3('16'), ['8']], w: 1.2, tags: ['trip16'] },
  { len: 1, ev: [['8'], T3('16'), T3('16'), T3('16')], w: 0.8, tags: ['trip16'] },
  { len: 1, ev: [T3('16'), T3('16'), T3('16'), T3('16'), T3('16'), T3('16')], w: 0.6, tags: ['trip16'] }
];
const COMPOUND_CELLS = [ // beat = dotted quarter
  { len: 2, ev: [['h', 1]], w: 1 },
  { len: 1, ev: [['q', 1]], w: 2 },
  { len: 1, ev: [['q'], ['8']], w: 3 },
  { len: 1, ev: [['8'], ['8'], ['8']], w: 2.6 },
  { len: 1, ev: [['8'], ['q']], w: 0.6 },
  { len: 1, ev: [['q', 1, 1]], w: 0.5 },
  { len: 1, ev: [['q'], ['8', 0, 1]], w: 0.7 },
  { len: 1, ev: [['8', 0, 1], ['8'], ['8']], w: 0.6 },
  { len: 1, ev: [['8', 1], ['16'], ['8']], w: 1 },
  { len: 1, ev: [['16'], ['16'], ['8'], ['8']], w: 0.8 }
];
function cellAllowed(c, L) {
  const dotted = L.dotted || [], rests = L.rests || [], feats = L.feats || [];
  if (c.tags && !c.tags.every(t => feats.includes(t))) return false;
  return c.ev.every(([d, dot, rest]) => L.durs.includes(d) && (!dot || dotted.includes(d)) && (!rest || rests.includes(d)));
}
function cellTags(c) {
  const t = new Set(c.tags || []);
  c.ev.forEach(([d, dot, rest, tup]) => {
    if (d === 'q' && !rest && !dot && !tup) t.add('q');
    if (d === '8' && !rest && !tup) t.add('8');
    if (d === '16' && !tup) t.add('16');
    if (rest) t.add(d === '8' ? 'r8' : 'r');
    if (dot && d === 'h') t.add('dh');
    if (dot && d === 'q') t.add('dq');
  });
  return t;
}
const pickW = (arr, wf, rng) => {
  const ws = arr.map(wf), tot = ws.reduce((a, b) => a + b, 0);
  let r = rng() * tot;
  for (let i = 0; i < arr.length; i++) { r -= ws[i]; if (r <= 0) return arr[i]; }
  return arr[arr.length - 1];
};
const toEv = ([d, dot, rest, tup]) => { const e = { dur: d, dot: !!dot, rest: !!rest }; if (tup) e.tup = tup; return e; };
const evQ = e => DUR[e.dur] * (e.dot ? 1.5 : 1) * (e.tup ? 2 / 3 : 1);

/* One bar of rhythm events: [{dur, dot, rest}] */
function genBar(L, ts, rng, opts = {}) {
  const compound = ts.compound;
  const cells = (compound ? COMPOUND_CELLS : SIMPLE_CELLS).filter(c => cellAllowed(c, L));
  const focus = new Set(L.focus || []);
  const beats = ts.beats;
  const out = [];
  let b = 0;
  const end = opts.endLen || 0; // beats reserved for a final long note
  const fits = (c, at) => {
    if (at + c.len > beats - end) return false;
    if (!compound && c.len >= 2 && beats === 4) {
      if (c.len === 2 && at % 2 !== 0) return false;  // half-note shapes start on 1 or 3
      if (c.len === 3 && at > 1) return false;
      if (c.len === 4 && at !== 0) return false;
    }
    return true;
  };
  while (b < beats - end) {
    const ok = cells.filter(c => fits(c, b) && !(opts.noRestStart && b === 0 && c.ev[0][2]));
    if (!ok.length) { out.push(toEv(compound ? ['q', 1] : ['q'])); b++; continue; } // never needed by the levels (the tests check)
    const c = pickW(ok, x => {
      let w = x.w;
      const tags = cellTags(x);
      tags.forEach(t => { if (focus.has(t)) w *= 3; });
      if (x.len > 1 && b === 0 && opts.first) w *= 0.6;
      return w;
    }, rng);
    c.ev.forEach(e => out.push(toEv(e)));
    b += c.len;
  }
  if (end) {
    const q = end * ts.beatQ;
    const ev = q === 4 ? ['w'] : q === 3 ? ['h', 1] : q === 2 ? ['h'] : q === 1.5 ? ['q', 1] : ['q'];
    const last = toEv(ev); last.end = true; // the long note that closes a phrase
    out.push(last);
  }
  return out;
}
function endLenFor(L, ts, rng) {
  const dotted = L.dotted || [];
  const opts = [];
  if (ts.compound) { if (L.durs.includes('h') && dotted.includes('h')) opts.push([2, 3]); if (dotted.includes('q')) opts.push([1, 2]); }
  else {
    if (ts.beats === 4 && L.durs.includes('w')) opts.push([4, 3]);
    if (ts.beats >= 3 && dotted.includes('h')) opts.push([3, 2]);
    if (ts.beats >= 2 && L.durs.includes('h')) opts.push([2, 3]);
    if (L.durs.includes('q')) opts.push([1, 1]);
  }
  return pickW(opts, o => o[1], rng)[0];
}

/* A rhythm: { time, bars: [[{dur, dot, rest, tie, tup, end}]] }. With final, the last bar ends on a long note.
   Longer pieces fall into four-bar phrases: most phrases end on a longer note, and a phrase sometimes opens
   with the rhythm of the first one, as written music does. */
export function genRhythm(L, o = {}) {
  const rng = o.rng || Math.random;
  const time = o.time || L.times[Math.floor(rng() * L.times.length)];
  const ts = parseTime(time);
  const nb = o.bars || 2;
  const bars = [];
  for (let i = 0; i < nb; i++) {
    const last = i === nb - 1 && o.final !== false;
    const phraseEnd = !last && nb >= 8 && i % 4 === 3 && rng() < 0.75;
    if (i >= 4 && i % 4 < 2 && i < nb - 1 && rng() < 0.3) { bars.push(bars[i - 4].map(e => Object.assign({}, e, { tie: undefined }))); continue; }
    bars.push(genBar(L, ts, rng, { endLen: last || phraseEnd ? endLenFor(L, ts, rng) : 0, first: i === 0, noRestStart: i === 0 && o.noRestStart }));
  }
  // ties: join a note to the next one across a beat or bar line
  if (L.ties) {
    const flat = []; bars.forEach((bar, bi) => { let on = 0; bar.forEach(e => { flat.push({ e, bi, on }); on += evQ(e); }); });
    const cands = [];
    for (let i = 0; i + 1 < flat.length; i++) {
      const a = flat[i], z = flat[i + 1];
      if (a.e.rest || z.e.rest) continue;
      if (i + 1 === flat.length - 1) continue; // the final note stays a fresh attack
      const onBeat = Math.abs(z.on / ts.beatQ - Math.round(z.on / ts.beatQ)) < 1e-6;
      if (onBeat && (z.bi !== a.bi || z.on > 0)) cands.push(a);
    }
    const n = Math.min(cands.length, Math.round(nb * (L.sync ? 0.6 : 0.4) * ((L.focus || []).includes('tie') ? 1.6 : 1) * (0.5 + rng())));
    for (let k = 0; k < n && cands.length; k++) {
      const c = cands.splice(Math.floor(rng() * cands.length), 1)[0];
      c.e.tie = true;
      // no chains: the notes either side of a tie can't start another one
      const j = flat.indexOf(c);
      for (let x = cands.length - 1; x >= 0; x--) if (Math.abs(flat.indexOf(cands[x]) - j) <= 1) cands.splice(x, 1);
    }
  }
  return { time, bars };
}

/* ---------- melody generation ---------- */
const sum = a => a.reduce((x, y) => x + y, 0);
/* A melody: { key, time, bars: [[{midi, dur, dot?, tie?, tup?, spell?, chord?}]] }; starts and ends on the tonic.
   At the chord levels the notes get a third or sixth under them (dyad), become a chord progression (triad),
   or get chords under the strong beats (melody). o.bars sets the length (4 by default). */
export function genMelody(L, o = {}) {
  const rng = o.rng || Math.random;
  for (let attempt = 0; attempt < 300; attempt++) {
    const key = o.key || L.keys[Math.floor(rng() * L.keys.length)];
    const m = L.chords === 'triad' ? chordPiece(L, key, rng, o) : tryMelody(L, key, rng, o);
    if (m && L.chords === 'dyad') addThirdsAndSixths(L, m, rng);
    if (m && L.chords === 'melody') addChordsUnder(L, m, rng);
    if (m) return m;
  }
  // fall back to a plain scale fragment (should never be needed; the tests check this)
  const key = L.keys[0], K = KEYS[key];
  const t = L.notes.find(n => n % 12 === K.tonic);
  return { key, time: '4/4', bars: [[{ midi: t, dur: 'w' }]] };
}
function tryMelody(L, key, rng, o) {
  const K = KEYS[key];
  const rh = genRhythm(L, { time: o.time, bars: o.bars || 4, rng, final: true, noRestStart: true });
  const scale = keyScale(key);
  const dia = L.notes.filter(n => scale.includes(n % 12));
  if (dia.length < 5) return null;
  const tonics = dia.filter(n => n % 12 === K.tonic);
  if (!tonics.length) return null;
  const lead = K.minor ? (K.tonic + 11) % 12 : null; // raised 7th in minor
  const restful = [0, 2, 4].map(d => scale[d]); // 1, 3 and 5: where a phrase can come to rest
  // attacks: notes that need a pitch (tied continuations copy the one before)
  const evs = rh.bars.flat();
  const attacks = [];
  evs.forEach((e, i) => { if (e.rest) return; const prev = evs[i - 1]; if (prev && !prev.rest && prev.tie) return; attacks.push(e); });
  const phraseEnd = attacks.map(e => !!e.end);
  const n = attacks.length;
  if (n < 2) return null;
  const mid = (dia[0] + dia[dia.length - 1]) / 2;
  const start = pickW(tonics, t => 1 / (1 + Math.abs(t - mid) / 4), rng);
  const lo = dia[0], hi = dia[dia.length - 1];
  const seq = [start], spells = [null];
  const leapP = L.leaps || 0.1;
  const idxOf = m => dia.indexOf(m);
  let forced = null;
  for (let i = 1; i < n; i++) {
    const prev = seq[i - 1], prev2 = seq[i - 2];
    if (i === n - 1) {
      const t = tonics.filter(x => Math.abs(x - prev) <= Math.min(L.maxLeap, 7));
      if (!t.length) return null;
      seq.push(t.sort((a, b) => Math.abs(a - prev) - Math.abs(b - prev))[0]); spells.push(null);
      break;
    }
    if (forced !== null) { seq.push(forced.m); spells.push(forced.sp); forced = null; continue; }
    if (i === n - 2) {
      // cadence: approach a tonic by step (2nd degree or leading tone), sometimes from the 5th
      const opts = [];
      tonics.forEach(T => {
        const above = dia.find(x => x > T), below = [...dia].reverse().find(x => x < T);
        if (above !== undefined && above - T <= 2) opts.push([above, 3]);
        if (below !== undefined) {
          if (lead !== null && L.notes.includes(T - 1) && L.lead) opts.push([T - 1, 3]);
          else opts.push([below, 2]);
        }
        if (L.maxLeap >= 5 && dia.includes(T + 7)) opts.push([T + 7, 0.6]);
        if (L.maxLeap >= 5 && dia.includes(T - 5)) opts.push([T - 5, 0.6]);
      });
      const ok = opts.filter(([m]) => Math.abs(m - prev) <= L.maxLeap && m !== prev);
      if (!ok.length) return null;
      seq.push(pickW(ok, x => x[1] / (1 + Math.abs(x[0] - prev) / 5), rng)[0]); spells.push(null);
      continue;
    }
    // chromatic passing or neighbour tone
    if (L.chromatic && rng() < L.chromatic && i < n - 3) {
      const dir = rng() < 0.5 ? 1 : -1, c = prev + dir;
      if (!scale.includes(c % 12) && L.notes.includes(c)) {
        const pass = prev + 2 * dir;
        if (dia.includes(pass) && rng() < 0.6) { seq.push(c); spells.push(dir > 0 ? '#' : 'b'); forced = { m: pass, sp: null }; continue; }
        seq.push(c); spells.push(dir > 0 ? 'b' : '#'); forced = { m: prev, sp: null }; continue; // neighbour: up = flat, down = sharp
      }
    }
    // diatonic motion: mostly steps, some thirds, occasional leaps; recover after a leap
    const pi = idxOf(prev);
    const lastLeap = prev2 !== undefined ? prev - prev2 : 0;
    const cand = [];
    dia.forEach((m, j) => {
      const d = j - pi, iv = Math.abs(m - prev);
      if (iv > L.maxLeap) return;
      let w;
      if (d === 0) w = 0.25;
      else if (Math.abs(d) === 1) w = 5;
      else if (Math.abs(d) === 2) w = 1.8;
      else w = leapP * 6 / (Math.abs(d) - 1);
      if (Math.abs(lastLeap) >= 5) w *= Math.sign(m - prev) === -Math.sign(lastLeap) && Math.abs(d) === 1 ? 4 : 0.15;
      // drift back towards the middle of the range
      const nm = (m - mid) / Math.max(4, (hi - lo) / 2);
      w *= Math.exp(-nm * nm * 0.8);
      if (d === 0 && prev2 === prev) w = 0;
      if (phraseEnd[i]) w *= restful.includes(m % 12) ? 2.5 : 0.5;
      cand.push([m, w]);
    });
    const c = cand.filter(x => x[1] > 0);
    if (!c.length) return null;
    seq.push(pickW(c, x => x[1], rng)[0]); spells.push(null);
  }
  if (seq.length !== n) return null;
  for (let i = 1; i < n; i++) if (Math.abs(seq[i] - seq[i - 1]) > L.maxLeap) return null;
  if (seq.some(m => !L.notes.includes(m))) return null;
  // write the pitches into the rhythm
  let k = -1;
  const bars = rh.bars.map(bar => bar.map(e => {
    if (e.rest) { const r = { midi: null, dur: e.dur }; if (e.dot) r.dot = true; if (e.tup) r.tup = e.tup; return r; }
    const prevE = evs[evs.indexOf(e) - 1];
    if (!(prevE && !prevE.rest && prevE.tie)) k++;
    const out = { midi: seq[k], dur: e.dur };
    if (e.dot) out.dot = true;
    if (e.tup) out.tup = e.tup;
    if (e.tie) out.tie = true;
    if (spells[k]) out.spell = spells[k];
    return out;
  }));
  return { key, time: rh.time, bars };
}

/* ---------- chords ---------- */
/* the triads of a key by scale degree (0 = I), with the 7th raised in V of a minor key */
function triadPcs(key, deg, raise) {
  const sc = keyScale(key), K = KEYS[key];
  const pcs = [sc[deg], sc[(deg + 2) % 7], sc[(deg + 4) % 7]];
  if (K.minor && deg === 4 && raise) pcs[1] = (pcs[1] + 1) % 12;
  return pcs;
}
// which chord can follow which (scale degrees); the diminished triads are left out
const NEXT_MAJOR = { 0: [3, 4, 5, 1, 2], 1: [4, 4, 3], 2: [5, 3], 3: [4, 0, 1], 4: [0, 0, 5], 5: [1, 3, 4] };
const NEXT_MINOR = { 0: [3, 4, 5, 6, 2], 2: [5, 3], 3: [4, 0], 4: [0, 0, 5], 5: [3, 4, 2, 6], 6: [2, 0] };
const nextDegree = (key, d, rng) => { const t = KEYS[key].minor ? NEXT_MINOR : NEXT_MAJOR; const o = t[d] || [0]; return o[Math.floor(rng() * o.length)]; };
/* close-position voicings of a triad between lo and hi, lowest note first */
function closeVoicings(pcs, lo, hi) {
  const out = [];
  for (let b = lo; b <= hi; b++) {
    if (!pcs.includes(b % 12)) continue;
    const v = [b];
    for (let m = b + 1; v.length < 3 && m <= b + 12; m++) if (pcs.includes(m % 12) && !v.some(x => x % 12 === m % 12)) v.push(m);
    if (v.length === 3 && v[2] <= hi) out.push(v);
  }
  return out;
}
const voiceDist = (a, b) => a.reduce((s, x, i) => s + Math.abs(x - b[i]), 0);
/* A chord progression to read: every attack a close three-note chord on the top strings, I at the end, V before it */
function chordPiece(L, key, rng, o) {
  const plain = Object.assign({}, L, { durs: L.durs.filter(d => d !== '8' && d !== '16'), dotted: (L.dotted || []).filter(d => d === 'h'), ties: false, feats: [] });
  const rh = genRhythm(plain, { time: o.time, bars: o.bars || 4, rng, final: true, noRestStart: true });
  const lo = 62, hi = 81, nb = rh.bars.length;
  let deg = 0, prev = null;
  const raise = !!L.lead;
  const bars = rh.bars.map((bar, bi) => {
    // one chord per bar, sometimes two; V in the last bar but one, I in the last
    const plan = bi === nb - 1 ? [0] : bi === nb - 2 ? [4] : [bi === 0 ? 0 : nextDegree(key, deg, rng)];
    if (bi > 0 && bi < nb - 2 && rng() < 0.35) plan.push(nextDegree(key, plan[0], rng));
    return bar.map((e, j) => {
      if (e.rest) { const r = { midi: null, dur: e.dur }; if (e.dot) r.dot = true; return r; }
      const half = plan.length > 1 && j >= bar.length / 2 ? 1 : 0;
      deg = plan[half];
      const vs = closeVoicings(triadPcs(key, deg, raise), lo, hi);
      const v = prev ? vs.slice().sort((a, b) => voiceDist(a, prev) - voiceDist(b, prev) + (rng() - 0.5) * 2)[0] : vs.slice().sort((a, b) => Math.abs(a[2] - 76) - Math.abs(b[2] - 76))[0];
      prev = v;
      const n = { midi: v[2], chord: v.slice(), dur: e.dur };
      if (e.dot) n.dot = true;
      return n;
    });
  });
  // the first chord is the tonic; the piece must have at least two chords
  if (bars.flat().filter(n => n.chord).length < 2) return null;
  return { key, time: rh.time, bars };
}
/* Double stops: a diatonic third or sixth under most notes of a melody */
function addThirdsAndSixths(L, piece, rng) {
  const sc = keyScale(piece.key), lo = Math.min(...L.notes);
  piece.bars.forEach(bar => bar.forEach(n => {
    if (n.midi == null || n.spell || rng() > 0.75) return;
    const under = [3, 4, 8, 9].map(iv => n.midi - iv).filter(m => m >= lo && sc.includes(m % 12));
    if (!under.length) return;
    const thirds = under.filter(m => n.midi - m <= 4), sixths = under.filter(m => n.midi - m >= 8);
    const pick = (rng() < 0.55 && thirds.length ? thirds : sixths.length ? sixths : thirds)[0];
    n.chord = [pick, n.midi];
  }));
  piece.bars.flat().forEach((n, i, all) => { if (n.tie && all[i + 1]) { if (n.chord) all[i + 1].chord = n.chord.slice(); else delete all[i + 1].chord; } });
}
/* Chord melody: a chord under the melody on the strong beats (1, and 3 in 4/4), voiced just below the tune */
function addChordsUnder(L, piece, rng) {
  const ts = parseTime(piece.time), K = KEYS[piece.key];
  const strong = ts.compound ? [0, 1.5 * Math.floor(ts.beats / 2)] : ts.beats === 4 ? [0, 2] : [0];
  const degs = K.minor ? [0, 2, 3, 4, 5, 6] : [0, 1, 2, 3, 4, 5];
  let deg = 0;
  const flat = piece.bars.flat();
  piece.bars.forEach((bar, bi) => {
    let q = 0;
    bar.forEach(n => {
      const at = q; q += durQ(n);
      const prevN = flat[flat.indexOf(n) - 1];
      if (n.midi == null || n.spell || (prevN && prevN.tie) || !strong.some(x => Math.abs(x - at) < 1e-6) || n.midi < 64) return;
      const last = bi === piece.bars.length - 1;
      const fits = degs.filter(d => triadPcs(piece.key, d, !!L.lead).includes(n.midi % 12));
      if (!fits.length) return;
      const wanted = last ? 0 : nextDegree(piece.key, deg, rng);
      deg = fits.includes(wanted) ? wanted : fits.includes(deg) && rng() < 0.4 ? deg : fits[Math.floor(rng() * fits.length)];
      const pcs = triadPcs(piece.key, deg, !!L.lead);
      const under = [];
      for (let m = n.midi - 1; m >= n.midi - 12 && under.length < 2; m--) if (pcs.includes(m % 12) && m % 12 !== n.midi % 12) under.unshift(m);
      if (under.length && under[0] >= 55) n.chord = under.concat(n.midi);
    });
  });
  flat.forEach((n, i) => { if (n.tie && flat[i + 1]) { if (n.chord) flat[i + 1].chord = n.chord.slice(); else delete flat[i + 1].chord; } });
}

/* A one-pitch rhythm to read, written on the middle line (at the chord levels, a third or a G chord to strum) */
export function rhythmPiece(L, o = {}) {
  const rh = genRhythm(L.chords ? Object.assign({}, L, { ties: false }) : L, Object.assign({ bars: 2, final: true }, o));
  const pitch = o.pitch || 71;
  const chord = L.chords === 'dyad' ? [71, 74] : L.chords ? [67, 71, 74] : null; // a third on the top strings, or a G chord
  return { key: 'C', time: rh.time, bars: rh.bars.map(bar => bar.map(e => {
    const n = { midi: e.rest ? null : chord ? 74 : pitch, dur: e.dur };
    if (e.dot) n.dot = true; if (e.tup) n.tup = e.tup; if (e.tie && !e.rest) n.tie = true;
    if (chord && !e.rest) n.chord = chord.slice();
    return n;
  })) };
}

/* A flash card: one written note, the key it is shown in and its spelled name */
export function noteCard(L, midi, rng = Math.random) {
  const keys = L.keys.filter(k => keyScale(k).includes(midi % 12));
  const key = keys.length ? keys[Math.floor(rng() * keys.length)] : 'C';
  const pref = rng() < 0.5 ? '#' : 'b';
  const sp = spell(midi, key, pref);
  return { key, note: { midi, dur: 'w', spell: pref }, letter: sp.letter, alter: sp.alter, name: sp.name };
}

/* Onset times of a piece in quarter notes: [{ i (flat index), q (onset), len, midi }] for each attack */
export function attacks(piece) {
  const out = []; let t = 0, i = 0, prev = null;
  const ts = parseTime(piece.time);
  piece.bars.forEach(bar => {
    const full = bar.length === 1 && bar[0].midi == null && bar[0].dur === 'w';
    bar.forEach(n => {
      const len = full ? ts.barQ : durQ(n);
      if (n.midi != null) {
        if (prev && prev.midi === n.midi && prev.tie) out[out.length - 1].len += len;
        else { const a = { i, q: t, len, midi: n.midi }; if (n.chord && n.chord.length > 1) a.chord = n.chord.slice(); out.push(a); }
      }
      prev = n; t += len; i++;
    });
  });
  return out;
}
export const pieceLength = piece => sum(piece.bars.map(b => (b.length === 1 && b[0].midi == null && b[0].dur === 'w') ? parseTime(piece.time).barQ : sum(b.map(durQ))));
