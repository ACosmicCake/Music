/* World Woodshed — Constraint roll: improvise over a vamp with one limit at a time (plain functions, test/constraints.test.js).
   A constraint is rolled into an instance { id, p } (its random choices, e.g. which three notes), which is all that is
   saved; build(instance, vamp, tuning) gives its name, instruction and, when the app can hear whether you keep it, the
   rules that check each note you play (from the mic or a tap on the fretboard). The tool is src/tools/constraint.js. */

const pcOf = m => ((Math.round(m) % 12) + 12) % 12;
const NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const SHARPS = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const STRING_NAMES = ['6th', '5th', '4th', '3rd', '2nd', '1st'];
const DEG = ['1', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♭6', '6', '♭7', '7'];

/* ---------- the backings ---------- */
/* Each vamp is a few bars on the Repertoire band (a groove from D.GROOVES), with the scale that fits it, so the
   note constraints have notes to choose from. bars: one string per bar, chords split by spaces. */
export const VAMPS = [
  { id: 'dorian', name: 'D Dorian funk', where: 'Funk · modal jazz', groove: 'funk', bars: ['Dm7', 'G7'], tonic: 2, scale: [0, 2, 3, 5, 7, 9, 10], scaleName: 'D Dorian', bpm: 92, flats: false },
  { id: 'blues', name: 'Blues shuffle in A', where: 'Blues', groove: 'shuffle', bars: ['A7', 'D7', 'A7', 'A7', 'D7', 'D7', 'A7', 'A7', 'E7', 'D7', 'A7', 'E7'], tonic: 9, scale: [0, 3, 4, 5, 6, 7, 9, 10], scaleName: 'A blues (with the major 3rd and 6th)', bpm: 96, flats: false },
  { id: 'swing', name: 'ii–V–I swing in C', where: 'Jazz', groove: 'swing', bars: ['Dm7', 'G7', 'Cmaj7', 'Cmaj7'], tonic: 0, scale: [0, 2, 4, 5, 7, 9, 11], scaleName: 'C major', bpm: 132, flats: false },
  { id: 'bossa', name: 'Bossa nova in F', where: 'Brazil', groove: 'bossa', bars: ['Fmaj7', 'Fmaj7', 'Gm7', 'C7'], tonic: 5, scale: [0, 2, 4, 5, 7, 9, 11], scaleName: 'F major', bpm: 120, flats: true },
  { id: 'son', name: 'Son montuno in C', where: 'Cuba', groove: 'son', bars: ['C', 'F', 'G7', 'F'], tonic: 0, scale: [0, 2, 4, 5, 7, 9, 11], scaleName: 'C major', bpm: 100, flats: false },
  { id: 'flamenco', name: 'Andalusian cadence (tangos)', where: 'Flamenco', groove: 'flamenco', bars: ['Am', 'G', 'F', 'E'], tonic: 4, scale: [0, 1, 3, 4, 5, 7, 8, 10], scaleName: 'E Phrygian with the G♯ of the E chord', bpm: 104, flats: false },
  { id: 'hijaz', name: 'D Hijaz over maqsum', where: 'Arab world', groove: 'maqsum', bars: ['D', 'D', 'Cm', 'D'], tonic: 2, scale: [0, 1, 4, 5, 7, 8, 10], scaleName: 'D Hijaz (Phrygian dominant)', bpm: 100, flats: true },
  { id: 'bhupali', name: 'Drone in C, raga Bhupali', where: 'India', groove: 'drone', bars: ['C'], tonic: 0, scale: [0, 2, 4, 7, 9], scaleName: 'Bhupali (C D E G A)', bpm: 70, flats: false },
  { id: 'highlife', name: 'Highlife in G', where: 'West Africa', groove: 'highlife', bars: ['G', 'C', 'D', 'G'], tonic: 7, scale: [0, 2, 4, 5, 7, 9, 11], scaleName: 'G major', bpm: 112, flats: false },
  { id: 'tango', name: 'Tango 3-3-2 in A minor', where: 'Argentina', groove: 'tango332', bars: ['Am', 'Am', 'E7', 'E7'], tonic: 9, scale: [0, 2, 3, 5, 7, 8, 11], scaleName: 'A harmonic minor', bpm: 100, flats: false },
  { id: 'mbaqanga', name: 'Mbaqanga in C', where: 'Southern Africa', groove: 'mbaqanga', bars: ['C', 'F', 'C', 'G'], tonic: 0, scale: [0, 2, 4, 5, 7, 9, 11], scaleName: 'C major', bpm: 116, flats: false },
  { id: 'reggae', name: 'One drop in A minor', where: 'Jamaica', groove: 'reggae', bars: ['Am', 'D'], tonic: 9, scale: [0, 2, 3, 5, 7, 9, 10], scaleName: 'A Dorian', bpm: 76, flats: false }
];
export const vampOf = id => VAMPS.find(v => v.id === id) || VAMPS[0];

/* The kinds of constraint, in the order the set-up lists them */
export const CATS = {
  notes: 'Notes',
  shape: 'Shapes and leaps',
  neck: 'The neck',
  rhythm: 'Rhythm',
  form: 'Space and phrasing',
  touch: 'Sound and touch',
  players: 'Your players',
  world: 'From the world'
};

const pick = (rng, arr) => arr[Math.floor(rng() * arr.length) % arr.length];
function sample(rng, arr, n) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}
const nameOf = (pc, v) => (v && v.flats ? NAMES : SHARPS)[pcOf(pc)];
const listNames = (pcs, v) => { const n = pcs.map(p => nameOf(p, v)); return n.length < 2 ? n.join('') : n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1]; };
const scalePcs = v => v.scale.map(s => pcOf(v.tonic + s));
const byPitch = (v, pcs) => pcs.slice().sort((a, b) => pcOf(a - v.tonic) - pcOf(b - v.tonic));

/* The notes of one string, or of a few frets across the neck, for the tuning given (open-string MIDI notes, low to high) */
function cells(tuning, strings, lo, hi) {
  const out = [];
  strings.forEach(si => { for (let f = lo; f <= hi; f++) out.push({ s: si, f, m: tuning[si] + f }); });
  return out;
}
/* A neck rule: a tap is checked by its string and fret, a heard note only by its pitch (the mic can't tell strings apart) */
function neckRule(list, what) {
  const ok = new Set(list.map(c => c.s + ':' + c.f)), mids = new Set(list.map(c => c.m));
  return n => {
    if (n.si !== undefined && n.si !== null) return ok.has(n.si + ':' + n.f) ? '' : 'that tap was off ' + what;
    return mids.has(Math.round(n.midi)) ? '' : 'that note can’t be played on ' + what;
  };
}
const pcRule = (pcs, v, why) => { const set = new Set(pcs.map(pcOf)); return n => (set.has(n.pc) ? '' : nameOf(n.pc, v) + ' ' + (why || 'isn’t one of your notes')); };
const chordPcs = c => c.iv.map(x => pcOf(c.root + x));

/* ---------- the constraints ----------
   make(v, rng) → p, the random choices (kept with the instance); info(p, v, tuning) → { text, rules?, show? }.
   rules get one heard or tapped note at a time (see makeJudge for its fields) and return '' or why it broke the rule.
   show tells the fretboard what to light up: { pcs } notes, { cells } places, { chord: 'tones' | 'guide' | 'colour' }. */
const C = [];
const add = (id, cat, name, def) => C.push(Object.assign({ id, cat, name }, def));

/* Notes */
add('three-notes', 'notes', 'Three notes only', {
  why: 'With so few notes, rhythm, length and where you put them do the talking.',
  make: (v, rng) => ({ pcs: [pcOf(v.tonic)].concat(sample(rng, scalePcs(v).slice(1), 2)) }),
  info: (p, v) => ({ text: 'Use only ' + listNames(byPitch(v, p.pcs), v) + ', in any octave.', rules: [pcRule(p.pcs, v)], show: { pcs: p.pcs } })
});
add('two-notes', 'notes', 'Two notes only', {
  why: 'Two notes make you invent with rhythm, accents and octaves.',
  make: (v, rng) => ({ pcs: sample(rng, scalePcs(v), 2) }),
  info: (p, v) => ({ text: 'Only ' + listNames(byPitch(v, p.pcs), v) + ', in any octave. Make it groove.', rules: [pcRule(p.pcs, v)], show: { pcs: p.pcs } })
});
add('one-note', 'notes', 'One note', {
  why: 'One pitch leaves rhythm, length, loudness and tone: the parts of a voice that aren’t the notes.',
  make: (v, rng) => ({ pcs: [pick(rng, scalePcs(v))] }),
  info: (p, v) => ({ text: 'Only ' + nameOf(p.pcs[0], v) + ', in any octave. Hear how it changes over each chord.', rules: [pcRule(p.pcs, v)], show: { pcs: p.pcs } })
});
add('own-pent', 'notes', 'Your own five-note scale', {
  why: 'Five notes chosen by chance make a scale nobody else plays this way.',
  make: (v, rng) => ({ pcs: v.scale.length <= 5 ? scalePcs(v) : [pcOf(v.tonic)].concat(sample(rng, scalePcs(v).slice(1), 4)) }),
  info: (p, v) => ({ text: 'Your scale for now: ' + listNames(byPitch(v, p.pcs), v) + '. Find what it wants to say.', rules: [pcRule(p.pcs, v)], show: { pcs: p.pcs } })
});
add('drop-one', 'notes', 'Leave one note out', {
  why: 'A missing note changes the colour of the whole scale.',
  make: (v, rng) => ({ out: pick(rng, scalePcs(v).slice(1)) }),
  info: (p, v) => {
    const pcs = scalePcs(v).filter(x => x !== p.out);
    return { text: v.scaleName + ' without its ' + DEG[pcOf(p.out - v.tonic)] + ' (' + nameOf(p.out, v) + '). Every other note is yours.', rules: [pcRule(pcs, v, 'is outside the scale or the note you left out')], show: { pcs } };
  }
});
add('one-outside', 'notes', 'One note from outside', {
  why: 'A note outside the scale, used on purpose, is how a personal sound often starts.',
  make: (v, rng) => ({ extra: pick(rng, Array.from({ length: 12 }, (_, i) => i).filter(x => !scalePcs(v).includes(x))) }),
  info: (p, v) => {
    const pcs = scalePcs(v).concat([p.extra]);
    return { text: v.scaleName + ' plus ' + nameOf(p.extra, v) + '. Use the new note in every phrase and make it sound right.', rules: [pcRule(pcs, v, 'is outside the scale')], show: { pcs, extra: p.extra } };
  }
});
add('chord-tones', 'notes', 'Chord tones only', {
  why: 'Playing only the chord’s own notes makes the changes audible without the band.',
  make: () => ({}),
  info: () => ({ text: 'Only the notes of the chord sounding now. Follow it as it changes.', rules: [n => (chordPcs(n.chord).includes(n.pc) ? '' : NAMES[n.pc] + ' isn’t in ' + n.chord.sym)], show: { chord: 'tones' } })
});
add('guide-tones', 'notes', '3rds and 7ths', {
  why: 'The 3rd and 7th say what a chord is; lines built from them sound like the harmony moving.',
  make: () => ({}),
  info: () => ({
    text: 'Only the 3rd and the 7th of each chord (the 3rd and 5th of a plain triad). Move to the nearest one at each change.',
    rules: [n => { const g = guideOf(n.chord); return g.includes(n.pc) ? '' : NAMES[n.pc] + ' isn’t a 3rd or 7th of ' + n.chord.sym; }], show: { chord: 'guide' }
  })
});
add('no-chord-tones', 'notes', 'Between the chord tones', {
  why: 'Colour notes (9ths, 11ths, 13ths) are where much of a soloist’s flavour lives.',
  make: () => ({}),
  info: (p, v) => ({ text: 'Only scale notes that are not in the chord sounding now. Lean on them.', rules: [n => (chordPcs(n.chord).includes(n.pc) ? NAMES[n.pc] + ' is in ' + n.chord.sym : scalePcs(v).includes(n.pc) ? '' : nameOf(n.pc, v) + ' is outside the scale')], show: { chord: 'colour' } })
});
add('no-root', 'notes', 'Never the root', {
  why: 'Without the root to fall back on, every phrase has to land somewhere less obvious.',
  make: () => ({}),
  info: () => ({ text: 'Any note but the root of the chord sounding now.', rules: [n => (n.pc === n.chord.root ? NAMES[n.pc] + ' is the root of ' + n.chord.sym : '')], show: { chord: 'noroot' } })
});
add('start-on', 'notes', 'Start every phrase on one note', {
  why: 'A fixed starting point makes you find new ways away from it.',
  make: (v, rng) => ({ pc: pick(rng, scalePcs(v).slice(1)) }),
  info: (p, v) => ({ text: 'Begin every phrase on ' + nameOf(p.pc, v) + ' (the ' + DEG[pcOf(p.pc - v.tonic)] + '). Rest at least a beat between phrases.', rules: [n => (n.phraseIdx === 0 && n.pc !== p.pc ? 'that phrase began on ' + nameOf(n.pc, v) : '')], show: { pcs: [p.pc] } })
});
add('end-on', 'notes', 'End every phrase on one note', {
  why: 'Arriving at the same place from many directions is how a melody makes a home.',
  make: (v, rng) => ({ pc: pick(rng, scalePcs(v)) }),
  info: (p, v) => ({ text: 'Finish every phrase on ' + nameOf(p.pc, v) + ' (the ' + DEG[pcOf(p.pc - v.tonic)] + '), however you get there.', show: { pcs: [p.pc] } })
});

/* Shapes and leaps */
const ivRule = (ok, why) => n => (n.prev && n.gap < 2 && !ok(Math.abs(Math.round(n.midi) - Math.round(n.prev.midi))) ? why(Math.abs(Math.round(n.midi) - Math.round(n.prev.midi))) : '');
const IV = ['the same note', 'a half step', 'a whole step', 'a minor 3rd', 'a major 3rd', 'a 4th', 'a tritone', 'a 5th', 'a minor 6th', 'a major 6th', 'a minor 7th', 'a major 7th', 'an octave'];
const ivName = d => (d <= 12 ? IV[d] : 'more than an octave');
add('steps', 'shape', 'Steps only', {
  why: 'Stepwise lines sing; Stan Getz and most singers live there.',
  make: () => ({}),
  info: () => ({ text: 'Move by half or whole steps only, no jumps. Rest a couple of beats to start again somewhere new.', rules: [ivRule(d => d <= 2, d => 'that was ' + ivName(d))] })
});
add('leaps', 'shape', 'No steps', {
  why: 'Leaps break the habit of running up and down the scale.',
  make: () => ({}),
  info: () => ({ text: 'Every note a 3rd or more from the one before: no steps, no repeats.', rules: [ivRule(d => d >= 3, d => 'that was ' + ivName(d))] })
});
add('fourths', 'shape', '4ths and 5ths', {
  why: 'Lines in 4ths sound open and modern, as in modal jazz and much West African guitar.',
  make: () => ({}),
  info: () => ({ text: 'Move only by 4ths, 5ths or octaves. Repeat a note when you need a breath.', rules: [ivRule(d => [0, 5, 7, 12].includes(d), d => 'that was ' + ivName(d))] })
});
add('thirds', 'shape', 'Up and down in 3rds', {
  why: 'Thirds outline chords inside the line, even without the band.',
  make: () => ({}),
  info: () => ({ text: 'Every move a minor or major 3rd, up or down.', rules: [ivRule(d => d === 3 || d === 4, d => 'that was ' + ivName(d))] })
});
add('no-repeat', 'shape', 'Never the same note twice', {
  why: 'No repeated notes keeps the line moving.',
  make: () => ({}),
  info: () => ({ text: 'Never play the same note twice in a row.', rules: [ivRule(d => d !== 0, () => 'that note came twice')] })
});
add('small-leaps', 'shape', 'Nothing bigger than a 5th', {
  why: 'Long singing lines with leaps no wider than a 5th, the way a voice moves.',
  make: () => ({}),
  info: () => ({ text: 'Any notes, but never jump more than a 5th. Make phrases at least two bars long.', rules: [ivRule(d => d <= 7, d => 'that leap was ' + ivName(d))] })
});
add('octave-leap', 'shape', 'One big leap per phrase', {
  why: 'A leap of an octave or more, placed on purpose, is a phrase’s climax.',
  make: () => ({}),
  info: () => ({ text: 'Put one leap of an octave or more in every phrase, and make it the high point.' })
});
add('rise-fall', 'shape', 'Up by step, down by leap', {
  why: 'Turning a habit round makes you hear new shapes.',
  make: () => ({}),
  info: () => ({ text: 'Climb by step and come down by leap. Then try the other way round.' })
});
add('mirror', 'shape', 'Upside down', {
  why: 'Inverting a phrase is one of the oldest ways to make more from less.',
  make: () => ({}),
  info: () => ({ text: 'Play a short phrase, then the same phrase upside down: where it went up, go down by as much.' })
});
add('approach', 'shape', 'From a half step below', {
  why: 'Chromatic approach notes are the glue of bebop and of much Latin playing.',
  make: () => ({}),
  info: () => ({ text: 'Arrive at every chord note from a half step below it.' })
});
add('wide', 'shape', 'More than an octave', {
  why: 'Using the whole range of the guitar in one phrase.',
  make: () => ({}),
  info: () => ({ text: 'Every phrase spans more than an octave from its lowest note to its highest.' })
});

/* The neck */
add('one-string', 'neck', 'One string', {
  why: 'Along one string you think in distances, as a sitar or oud player does, not in boxes.',
  make: (v, rng) => ({ s: pick(rng, [1, 2, 3, 4]) }),
  info: (p, v, T) => { const list = cells(T, [p.s], 0, 12); return { text: 'Only the ' + STRING_NAMES[p.s] + ' string, frets 0 to 12. Slide to get around.', rules: [neckRule(list, 'the ' + STRING_NAMES[p.s] + ' string')], show: { cells: list } }; }
});
add('two-strings', 'neck', 'Two strings', {
  why: 'Two neighbouring strings give you shapes along the neck instead of across it.',
  make: (v, rng) => ({ s: pick(rng, [0, 1, 2, 3, 4]) }),
  info: (p, v, T) => { const list = cells(T, [p.s, p.s + 1], 0, 12); return { text: 'Only the ' + STRING_NAMES[p.s] + ' and ' + STRING_NAMES[p.s + 1] + ' strings.', rules: [neckRule(list, 'those two strings')], show: { cells: list } }; }
});
add('two-frets', 'neck', 'Two frets wide', {
  why: 'A tiny box across all six strings makes you use every string.',
  make: (v, rng) => ({ f: pick(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9]) }),
  info: (p, v, T) => { const list = cells(T, [0, 1, 2, 3, 4, 5], p.f, p.f + 1); return { text: 'Only frets ' + p.f + ' and ' + (p.f + 1) + ', all six strings. Don’t move your hand.', rules: [neckRule(list, 'frets ' + p.f + '–' + (p.f + 1))], show: { cells: list } }; }
});
add('one-position', 'neck', 'One position', {
  why: 'Staying put makes you find every idea under one hand.',
  make: (v, rng) => ({ f: pick(rng, [0, 2, 3, 5, 7, 8, 9]) }),
  info: (p, v, T) => { const list = cells(T, [0, 1, 2, 3, 4, 5], p.f, p.f + 3); return { text: 'Frets ' + p.f + ' to ' + (p.f + 3) + ' only. No shifting.', rules: [neckRule(list, 'frets ' + p.f + '–' + (p.f + 3))], show: { cells: list } }; }
});
add('up-high', 'neck', 'Up the neck', {
  why: 'Up high the guitar sounds sweeter and the shapes are new to the hand.',
  make: () => ({}),
  info: (p, v, T) => { const list = cells(T, [0, 1, 2, 3, 4, 5], 7, 12); return { text: 'Frets 7 to 12 only.', rules: [neckRule(list, 'frets 7–12')], show: { cells: list } }; }
});
add('low-strings', 'neck', 'The three low strings', {
  why: 'Low lines sound like a horn or a bass player soloing.',
  make: () => ({}),
  info: (p, v, T) => { const list = cells(T, [0, 1, 2], 0, 12); return { text: 'Only the 6th, 5th and 4th strings.', rules: [neckRule(list, 'the low strings')], show: { cells: list } }; }
});
add('open-ring', 'neck', 'Open strings ringing', {
  why: 'Fretted notes against open strings give the guitar its own harmony, as Milton Nascimento’s does.',
  make: () => ({}),
  info: () => ({ text: 'Let an open string ring under every phrase, and move a fretted note against it.' })
});
add('one-finger', 'neck', 'One finger', {
  why: 'One finger means sliding, and slides are a voice of their own.',
  make: (v, rng) => ({ k: pick(rng, ['first', 'second', 'third']) }),
  info: p => ({ text: 'Fret every note with your ' + p.k + ' finger only. Slide between them.' })
});
add('new-position', 'neck', 'A new place each phrase', {
  why: 'Moving every phrase stops the hand from playing its favourite licks.',
  make: () => ({}),
  info: () => ({ text: 'Play each phrase in a new place on the neck, a few frets higher than the last, then start again low.' })
});

/* Rhythm */
add('offbeats', 'rhythm', 'Off the beat', {
  why: 'Starting notes between the beats is where syncopation, and much of the world’s groove, lives.',
  make: () => ({}),
  info: () => ({ text: 'Start every note between the clicks, never on a beat.', rules: [n => (Math.abs(n.phase) < 0.17 ? 'that note was on the beat' : '')] })
});
add('onbeats', 'rhythm', 'On the beat', {
  why: 'Quarter notes only: the melody has to make it interesting.',
  make: () => ({}),
  info: () => ({ text: 'Start notes only on the beats: quarter notes and longer.', rules: [n => (Math.abs(n.phase) >= 0.2 ? 'that note was between beats' : '')] })
});
add('per-bar', 'rhythm', 'Few notes a bar', {
  why: 'Space lets each note mean something; Miles Davis made a sound out of it.',
  make: (v, rng) => ({ n: pick(rng, [1, 2, 3, 4]) }),
  info: p => ({ text: (p.n === 1 ? 'One note a bar.' : 'At most ' + p.n + ' notes a bar.') + ' Choose each one.', rules: [n => (n.barCount >= p.n ? 'that was note ' + (n.barCount + 1) + ' in the bar' : '')] })
});
add('long-notes', 'rhythm', 'Long notes', {
  why: 'Long notes put the weight on tone, vibrato and where you place them.',
  make: () => ({}),
  info: () => ({ text: 'Every note lasts at least two beats. Let it ring and shape it.', rules: [n => (n.prev && n.gap < 1.75 ? 'that came ' + n.gap.toFixed(1) + ' beats after the last note' : '')] })
});
add('play-rest', 'rhythm', 'Play, then rest', {
  why: 'Answering the band’s space with your own is half of phrasing.',
  make: (v, rng) => ({ n: pick(rng, [1, 2]) }),
  info: p => ({
    text: 'Play for ' + (p.n === 1 ? 'a bar' : p.n + ' bars') + ', then rest for ' + (p.n === 1 ? 'a bar' : p.n + ' bars') + '. The screen shows which.',
    rules: [n => (Math.floor(n.bar / p.n) % 2 === 1 ? 'that bar was for resting' : '')], rest: p.n
  })
});
add('not-on-one', 'rhythm', 'Never on 1', {
  why: 'Avoiding the downbeat makes the bar line disappear.',
  make: () => ({}),
  info: () => ({ text: 'Never play on beat 1 of a bar. Start phrases anywhere else.', rules: [n => (n.beatInBar < 0.17 || n.beatInBar > n.bpb - 0.17 ? 'that note was on 1' : '')] })
});
add('phrase-beat', 'rhythm', 'Start on one beat', {
  why: 'Where a phrase starts changes what it means.',
  make: (v, rng) => ({ b: pick(rng, [1, 1.5, 2.5, 3, 3.5]) }),
  info: p => {
    const lbl = { 1: 'beat 2', 1.5: 'the & of 2', 2.5: 'the & of 3', 3: 'beat 4', 3.5: 'the & of 4' }[p.b];
    return {
      text: 'Start every phrase on ' + lbl + '. Rest at least a beat between phrases.',
      rules: [n => { if (n.phraseIdx !== 0) return ''; const d = Math.abs(n.beatInBar - p.b); return d < 0.25 || n.bpb - d < 0.25 ? '' : 'that phrase started off ' + lbl; }]
    };
  }
});
add('one-rhythm', 'rhythm', 'One rhythm', {
  why: 'Keep the rhythm, change the notes: the riff is the oldest way to build a solo.',
  make: () => ({}),
  info: () => ({ text: 'Find a one-bar rhythm in the first bars, then keep it all the way. Change only the notes.' })
});
add('triplets', 'rhythm', 'Triplets only', {
  why: 'Three against the band’s two pulls the time in a new direction.',
  make: () => ({}),
  info: () => ({ text: 'Only triplets: three notes to a beat, or three to two beats.' })
});
add('double-time', 'rhythm', 'Slow, then double', {
  why: 'Changing speed inside a solo is one of the clearest ways to build it.',
  make: () => ({}),
  info: () => ({ text: 'Alternate: a phrase in long notes, then one twice as busy, then long again.' })
});
add('displace', 'rhythm', 'Move it by an eighth', {
  why: 'The same idea a half beat later sounds new; Monk did this all the time.',
  make: () => ({}),
  info: () => ({ text: 'Play a short idea, then the same idea an eighth note later, then later again.' })
});

/* Space and phrasing */
add('short-phrases', 'form', 'Short phrases', {
  why: 'Short phrases with breaths between them sound like speech.',
  make: (v, rng) => ({ n: pick(rng, [2, 3, 4, 5]) }),
  info: p => ({ text: 'At most ' + p.n + ' notes, then rest at least a beat. Every phrase.', rules: [n => (n.phraseIdx >= p.n ? 'that phrase had ' + (n.phraseIdx + 1) + ' notes' : '')] })
});
add('motif', 'form', 'One motif', {
  why: 'Developing one idea is how a solo tells a story instead of listing licks.',
  make: () => ({}),
  info: () => ({ text: 'Make a motif of three to five notes. Play it again and again, changing one thing each time: a note, the rhythm, where it starts, its range.' })
});
add('question-answer', 'form', 'Question and answer', {
  why: 'A phrase that asks and one that answers, the shape of so much folk music.',
  make: () => ({}),
  info: () => ({ text: 'Pairs of phrases: the first ends up in the air, the second comes home to the tonic.' })
});
add('grow', 'form', 'One more each time', {
  why: 'Growing a phrase note by note builds intensity naturally.',
  make: () => ({}),
  info: () => ({ text: 'Phrase one has one note, phrase two has two, then three… When it gets too long, start again from one.' })
});
add('half-silence', 'form', 'As much silence as sound', {
  why: 'Rests are part of the line; the band fills them.',
  make: () => ({}),
  info: () => ({ text: 'Rest exactly as long as you just played, every time.' })
});
add('climb', 'form', 'One long climb', {
  why: 'A solo with one direction has a shape anyone can hear.',
  make: () => ({}),
  info: () => ({ text: 'Start at the bottom of the neck and end at the top. Never go back to where you started.' })
});
add('speech', 'form', 'Play it like talking', {
  why: 'Speech rhythm is personal: nobody talks quite like you.',
  make: () => ({}),
  info: () => ({ text: 'Say a sentence in your head and play its rhythm and rise and fall. Then another.' })
});
add('sing-first', 'form', 'Sing it first', {
  why: 'What you sing is what you really hear, not what the fingers know.',
  make: () => ({}),
  info: () => ({ text: 'Sing a phrase, then play it. Then sing the next one.' })
});
add('bring-back', 'form', 'Bring it back', {
  why: 'Returning to an earlier idea gives a solo a form.',
  make: () => ({}),
  info: () => ({ text: 'Keep the best phrase of the first minute in your head and bring it back, changed, at the end.' })
});

/* Sound and touch */
add('slides', 'touch', 'Slides only', {
  why: 'Gliding between notes is closer to a voice than picking each one.',
  make: () => ({}),
  info: () => ({ text: 'Pick the first note of each phrase, then slide to every other one.' })
});
add('legato', 'touch', 'Hammer-ons and pull-offs', {
  why: 'Legato makes lines flow and changes the accents.',
  make: () => ({}),
  info: () => ({ text: 'Pick only when you change string; every other note is a hammer-on or pull-off.' })
});
add('double-stops', 'touch', 'Two notes at once', {
  why: 'Double stops in 3rds and 6ths are the sound of son, country and soul guitar.',
  make: (v, rng) => ({ k: pick(rng, ['3rds', '6ths', '4ths']) }),
  info: p => ({ text: 'Play everything as double stops in ' + p.k + ' from the scale.' })
});
add('harmonics', 'touch', 'Harmonics and open strings', {
  why: 'The sounds between the frets are a palette most players never use.',
  make: () => ({}),
  info: () => ({ text: 'Only natural harmonics (frets 12, 7, 5, 4) and open strings.' })
});
add('percussive', 'touch', 'Notes and knocks', {
  why: 'Mixing muted notes and taps on the body turns a line into a groove.',
  make: () => ({}),
  info: () => ({ text: 'Between every two notes, a muted string or a tap on the guitar’s body.' })
});
add('bends', 'touch', 'Bend into it', {
  why: 'Approaching from below, as singers and maqam players do, makes each note expressive.',
  make: () => ({}),
  info: () => ({ text: 'Bend or slide into every long note from a little below it.' })
});
add('dynamics', 'touch', 'Whisper to shout', {
  why: 'Loudness is a part of the line, not a setting.',
  make: () => ({}),
  info: () => ({ text: 'Start as quietly as the guitar can sound and get louder with every phrase. Then drop back to a whisper.' })
});
add('thumb', 'touch', 'Thumb only', {
  why: 'The thumb gives a round, warm sound, as Wes Montgomery’s did.',
  make: () => ({}),
  info: () => ({ text: 'Play every note with the flesh of your thumb.' })
});
add('vibrato', 'touch', 'Vibrato on everything long', {
  why: 'Your vibrato is part of your voice: its speed and width are yours.',
  make: (v, rng) => ({ k: pick(rng, ['slow and wide', 'fast and narrow', 'starting late, after the note']) }),
  info: p => ({ text: 'Every note longer than a beat gets vibrato, ' + p.k + '.' })
});
add('tremolo', 'touch', 'Tremolo', {
  why: 'Tremolo turns a guitar note into a sustained, singing one, as in mandolin and flamenco playing.',
  make: () => ({}),
  info: () => ({ text: 'Play long notes as fast repeated picking (tremolo), short ones plainly.' })
});

/* Your players: original devices in their manner, never their licks */
add('monk-seconds', 'players', 'Seconds that rub', {
  player: 'monk', why: 'Thelonious Monk: minor 2nds, odd placement and space.',
  make: () => ({}),
  info: () => ({ text: 'Play two notes a half step apart, together or one after the other, in every phrase, and leave space after them.' })
});
add('monk-whole', 'players', 'Whole steps down', {
  player: 'monk', why: 'Thelonious Monk: whole-tone runs dropping through the changes.',
  make: () => ({}),
  info: () => ({ text: 'End phrases with a fast run down in whole steps, then a silence.' })
});
add('miles-space', 'players', 'Few notes, much space', {
  player: 'miles', why: 'Miles Davis: the middle of the range, few notes and long rests.',
  make: () => ({}),
  info: () => ({ text: 'At most three notes a bar, mostly in the middle of the neck. Rest whole bars.', rules: [n => (n.barCount >= 3 ? 'that was note ' + (n.barCount + 1) + ' in the bar' : '')] })
});
add('sunra-change', 'players', 'Change one thing', {
  player: 'sunra', why: 'Sun Ra: long vamps where each phrase moves one dial.',
  make: () => ({}),
  info: () => ({ text: 'With each new phrase change exactly one thing: register, density or loudness.' })
});
add('arsenio-cell', 'players', 'Build on one cell', {
  player: 'arsenio', why: 'Arsenio Rodríguez: tres solos built from one rhythmic cell.',
  make: () => ({}),
  info: () => ({ text: 'Find a cell of three or four notes that fits the clave, and build the whole solo from it, moved and varied.' })
});
add('bvsc-second', 'players', 'The second voice', {
  player: 'bvsc', why: 'Buena Vista Social Club: the second voice a 3rd or 6th under the melody.',
  make: () => ({}),
  info: () => ({ text: 'Imagine a simple tune and play it in 3rds or 6ths under where it would be.' })
});
add('piazzolla-332', 'players', 'Accents in 3-3-2', {
  player: 'piazzolla', why: 'Astor Piazzolla: the 3-3-2 accent pattern over the bar.',
  make: () => ({}),
  info: () => ({ text: 'Accent 1, the & of 2 and 4 in every bar (3+3+2 eighths), with long notes over the top in between.' })
});
add('sosa-free', 'players', 'Free time, then the pulse', {
  player: 'sosa', why: 'Mercedes Sosa: a free opening, sung alone, before the rhythm starts.',
  make: () => ({}),
  info: () => ({ text: 'Mute the band or ignore it for the first phrases: play freely, as if singing alone, then fall into the pulse.' })
});
add('milton-open', 'players', 'Shapes over open strings', {
  player: 'milton', why: 'Milton Nascimento: moving shapes against strings that ring, and phrases that add a beat.',
  make: () => ({}),
  info: () => ({ text: 'Move one fretted shape along the neck while the open strings ring. Make some phrases a beat longer than expected.' })
});
add('getz-lines', 'players', 'Long singing lines', {
  player: 'getz', why: 'Stan Getz: long, singing lines without big leaps.',
  make: () => ({}),
  info: () => ({ text: 'Phrases of two to four bars, no leap bigger than a 5th, every note sung through.', rules: [ivRule(d => d <= 7, d => 'that leap was ' + ivName(d))] })
});
add('kulthum-repeat', 'players', 'One line, again and again', {
  player: 'kulthum', why: 'Umm Kulthum: one line repeated, each time with more ornament, until the closing cadence.',
  make: () => ({}),
  info: () => ({ text: 'Play one line again and again, adding a little ornament each time, then end it with a clear cadence on the tonic.' })
});

/* From the world */
add('alap', 'world', 'Unfold the scale', {
  why: 'In a raga’s alap the notes arrive one at a time, each one explored before the next.',
  make: () => ({}),
  info: (p, v) => ({ text: 'Start on ' + nameOf(v.tonic, v) + ' alone. Add one new note of ' + v.scaleName + ' each phrase, going up, and explore it before the next.' })
});
add('meend', 'world', 'Glide between notes', {
  why: 'Meend, the sitar’s glide, makes notes flow out of one another.',
  make: () => ({}),
  info: () => ({ text: 'No note starts from nothing: slide or bend into each one from the note before.' })
});
add('jins', 'world', 'The lower four notes', {
  why: 'An Arab maqam is built from small groups of notes (ajnas); staying in one shows its character.',
  make: () => ({}),
  info: (p, v) => {
    const pcs = v.scale.slice(0, 4).map(s => pcOf(v.tonic + s));
    return { text: 'Only the lowest four notes of ' + v.scaleName + ': ' + listNames(pcs, v) + '.', rules: [pcRule(pcs, v)], show: { pcs } };
  }
});
add('pregon', 'world', 'Answer the coro', {
  why: 'In son the singer (pregón) answers a choir (coro) that comes back every few bars.',
  make: () => ({}),
  info: () => ({ text: 'Sing a two-bar coro in your head, then answer it for two bars on the guitar. Again and again, a new answer each time.' })
});
add('guajeo', 'world', 'A guajeo', {
  why: 'A repeating two-bar figure, changed a little at a time, is the heart of a Cuban montuno.',
  make: () => ({}),
  info: () => ({ text: 'Make a two-bar figure that repeats. Change one note every few times round.' })
});
add('remate', 'world', 'End with a remate', {
  why: 'In flamenco a phrase often ends with a fast run that slams onto the downbeat.',
  make: () => ({}),
  info: () => ({ text: 'Every phrase ends with a quick run that lands exactly on beat 1.' })
});
add('bell', 'world', 'From a bell pattern', {
  why: 'West African bell patterns are melodies of rhythm; give one notes.',
  make: () => ({}),
  info: () => ({ text: 'Play the bell rhythm you hear on one note, then let the notes move while the rhythm stays.' })
});
add('konnakol', 'world', 'Say it, then play it', {
  why: 'Konnakol syllables (ta ka di mi) make a rhythm clear before the hands try it.',
  make: () => ({}),
  info: () => ({ text: 'Say a phrase in syllables (ta ka di mi, ta ki ta) and then play exactly that rhythm.' })
});
add('call-low', 'world', 'Call low, answer high', {
  why: 'Call and response with yourself, as in the blues and in work songs.',
  make: () => ({}),
  info: () => ({ text: 'Each call low on the neck, each answer high, like two voices.' })
});

export const CONSTRAINTS = C;
export const constraintOf = id => C.find(c => c.id === id) || null;
const guideOf = c => {
  const t = pcOf(c.root + c.third);
  const s = c.seventh !== null && c.seventh !== undefined ? pcOf(c.root + c.seventh) : pcOf(c.root + c.fifth);
  return [t, s];
};

/* Two constraints stacked must be in different kinds, and not two that fight (only a few notes and only leaps) */
const CLASH = [['notes', 'shape']];
const clash = (a, b) => a.cat === b.cat || CLASH.some(([x, y]) => (a.cat === x && b.cat === y) || (a.cat === y && b.cat === x));

/* Roll one or two constraints from the kinds chosen, not one of the recent ones if anything else is left.
   o: { cats: [kind], only: [id] (e.g. the ones you kept), recent: [id], stack: bool, players: [player id] }.
   A player's constraint is rolled more often when they are among your favourites. */
export function roll(vamp, o = {}, rng = Math.random) {
  const cats = o.cats && o.cats.length ? o.cats : Object.keys(CATS);
  let pool = C.filter(c => cats.includes(c.cat) && (!o.only || !o.only.length || o.only.includes(c.id)));
  if (!pool.length) pool = C.slice();
  const fresh = pool.filter(c => !(o.recent || []).includes(c.id));
  const from = fresh.length ? fresh : pool;
  const weigh = c => (c.player && (o.players || []).includes(c.player) ? 3 : 1);
  const choose = list => { let t = list.reduce((s, c) => s + weigh(c), 0) * rng(); for (const c of list) if ((t -= weigh(c)) < 0) return c; return list[list.length - 1]; };
  const first = choose(from);
  const out = [{ id: first.id, p: first.make(vamp, rng) }];
  if (o.stack) {
    const rest = from.filter(c => !clash(c, first)).length ? from.filter(c => !clash(c, first)) : C.filter(c => !clash(c, first));
    if (rest.length) { const second = choose(rest); out.push({ id: second.id, p: second.make(vamp, rng) }); }
  }
  return out;
}

/* What an instance says and checks, for this vamp and tuning (open-string MIDI notes, 6th string first) */
export function build(inst, vamp, tuning) {
  const c = constraintOf(inst.id);
  if (!c) return null;
  const p = Object.assign(c.make(vamp, () => 0), inst.p || {});
  const r = c.info(p, vamp, tuning);
  return { id: c.id, cat: c.cat, kind: CATS[c.cat], name: c.name, why: c.why, player: c.player || null, text: r.text, rules: r.rules || [], show: r.show || null, rest: r.rest || 0, checked: !!(r.rules && r.rules.length) };
}

/* The chords of a vamp as the band takes them, one list per bar */
export function vampBars(vamp, parse) { return vamp.bars.map(b => b.split(' ').map(parse).filter(Boolean)); }

/* Checks each note against the rules of the constraints built. A note is { midi, pos, si?, f? }: pos in beats from
   the first bar of the vamp (after the count-in), si and f when it was tapped on the fretboard. A phrase starts after
   a rest of at least a beat. Returns { ok, why } and keeps count. */
export function makeJudge(built, bars, bpb) {
  const rules = [].concat(...built.filter(Boolean).map(b => b.rules));
  let prev = null, barNo = -1, barCount = 0, phraseIdx = 0;
  const stats = { notes: 0, kept: 0, broke: 0 };
  function hear(note) {
    const pos = Math.max(0, note.pos), near = pos + 0.17; // a note a little early still belongs to the next beat
    const bar = Math.floor(near / bpb), beatInBar = pos - bar * bpb;
    const b = bars[((bar % bars.length) + bars.length) % bars.length];
    const chord = b[Math.min(b.length - 1, Math.floor(Math.max(0, near - bar * bpb) * b.length / bpb))];
    const gap = prev ? pos - prev.pos : Infinity;
    if (gap >= 0 && gap < 0.08) return null; // the same attack heard twice
    if (bar !== barNo) { barNo = bar; barCount = 0; }
    if (gap >= 1) phraseIdx = 0;
    const n = { midi: note.midi, pc: pcOf(note.midi), pos, bar, beatInBar, bpb, phase: pos - Math.round(pos), chord, prev, gap, barCount, phraseIdx, si: note.si, f: note.f };
    const why = rules.map(r => r(n)).filter(Boolean);
    prev = { midi: note.midi, pos }; barCount++; phraseIdx++;
    stats.notes++; if (why.length) stats.broke++; else stats.kept++;
    return { ok: !why.length, why: why[0] || '', bar, chord };
  }
  return { hear, stats, reset() { prev = null; barNo = -1; barCount = 0; phraseIdx = 0; stats.notes = stats.kept = stats.broke = 0; } };
}

/* The fretboard dots for a constraint: [{ s, f, kind }] over frets 0–12 */
export function marksFor(show, vamp, chord, tuning) {
  if (!show) return [];
  if (show.cells) return show.cells.map(c => ({ s: c.s, f: c.f, kind: pcOf(c.m) === pcOf(vamp.tonic) ? 'root' : 'tone' }));
  let pcs = show.pcs, root = pcOf(vamp.tonic);
  if (show.chord && chord) {
    const tones = chordPcs(chord);
    root = chord.root;
    pcs = show.chord === 'tones' ? tones : show.chord === 'guide' ? guideOf(chord) : show.chord === 'colour' ? scalePcs(vamp).filter(x => !tones.includes(x)) : scalePcs(vamp).filter(x => x !== chord.root);
  }
  if (!pcs) return [];
  const out = [];
  tuning.forEach((m, s) => { for (let f = 0; f <= 12; f++) { const pc = pcOf(m + f); if (pcs.includes(pc)) out.push({ s, f, kind: pc === show.extra ? 'g3' : pc === root ? 'root' : 'tone' }); } });
  return out;
}
export const noteName = (pc, vamp) => nameOf(pc, vamp);
