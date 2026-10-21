/* World Woodshed — shared theory helpers: chord symbols, note names, diatonic harmony */
import D from './data.js';

export const QUAL = [
  ['m7b5', [0, 3, 6, 10]], ['mmaj7', [0, 3, 7, 11]], ['maj7', [0, 4, 7, 11]], ['maj9', [0, 4, 7, 11, 14]], ['dim7', [0, 3, 6, 9]],
  ['7#11', [0, 4, 7, 10, 18]], ['7b9', [0, 4, 7, 10, 13]], ['7#9', [0, 4, 7, 10, 15]], ['13', [0, 4, 7, 10, 14, 21]],
  ['m9', [0, 3, 7, 10, 14]], ['9', [0, 4, 7, 10, 14]], ['m7', [0, 3, 7, 10]], ['m6', [0, 3, 7, 9]], ['6', [0, 4, 7, 9]], ['7', [0, 4, 7, 10]],
  ['dim', [0, 3, 6]], ['aug', [0, 4, 8]], ['sus4', [0, 5, 7]], ['sus2', [0, 2, 7]], ['m', [0, 3, 7]], ['', [0, 4, 7]]
];
const ROOTS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export function parseChord(sym) {
  const mm = /^([A-G])(#|b)?(.*)$/.exec(sym);
  if (!mm) return null;
  let root = ROOTS[mm[1]] + (mm[2] === '#' ? 1 : mm[2] === 'b' ? -1 : 0); root = (root + 12) % 12;
  const rest = mm[3];
  const q = QUAL.find(([k]) => k === rest) || QUAL[QUAL.length - 1];
  const iv = q[1];
  const third = iv.includes(4) ? 4 : 3;
  const seventh = iv.includes(10) ? 10 : iv.includes(11) ? 11 : (iv.includes(9) ? 9 : null);
  const label7 = seventh === 9 ? (q[0] === 'dim7' ? '♭♭7' : '6') : '7';
  return { sym, root, iv, third, seventh, fifth: iv.includes(6) && !iv.includes(7) ? 6 : iv.includes(8) && !iv.includes(7) ? 8 : 7, label7, triad: seventh === null };
}
export function flatName(p) { return ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'][((p % 12) + 12) % 12]; }
export function prettySym(sym) { return sym.replace(/b(?=[^a-z]|$)/, '♭').replace('#', '♯').replace('m7b5', 'm7♭5').replace(/^([A-G])b/, '$1♭'); }

/* Close voicing around the guitar's middle register: root in the bass, the rest above.
   root is a pitch class (0 = C). The bass note is the lowest one of that name from G2 (MIDI 43) up to F♯3. */
export function chordMidis(root, iv) {
  let r = 40 + ((((root - 40) % 12) + 12) % 12); if (r < 43) r += 12;
  return iv.map(x => r + x);
}

/* Interval names used to label notes relative to a root */
export const DEGREE_LABEL = ['R', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♭6', '6', '♭7', '7'];
export function degreeLabel(semi) {
  if (!Number.isInteger(semi)) return '¼';
  return DEGREE_LABEL[((semi % 12) + 12) % 12];
}

/* Spelling: use flats for flat keys, sharps for sharp keys */
const SHARP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
export function spell(pc, preferFlats) { return preferFlats ? flatName(pc) : SHARP_NAMES[((pc % 12) + 12) % 12]; }
export function keyPrefersFlats(tonicPc, minor) {
  const rel = minor ? (tonicPc + 3) % 12 : tonicPc; // relative major
  return [5, 10, 3, 8, 1, 6].includes(rel);          // F B♭ E♭ A♭ D♭ G♭
}

/* Triads and 7ths built on each degree of a 7-note scale */
const TRIAD_NAMES = { '4,7': ['', 'maj'], '3,7': ['m', 'min'], '3,6': ['dim', 'dim'], '4,8': ['aug', 'aug'] };
const SEV_NAMES = { '4,7,11': 'maj7', '4,7,10': '7', '3,7,10': 'm7', '3,6,10': 'm7b5', '3,6,9': 'dim7', '3,7,11': 'mmaj7', '4,8,11': 'maj7#5' };
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
export function diatonicChords(steps, tonicPc) {
  if (steps.length !== 7 || steps.some(x => !Number.isInteger(x))) return [];
  const flats = keyPrefersFlats(tonicPc, steps[2] === 3);
  return steps.map((st, i) => {
    const at = k => { const j = i + k; return steps[j % 7] + 12 * Math.floor(j / 7) - st; };
    const third = at(2), fifth = at(4), sev = at(6);
    const tri = TRIAD_NAMES[third + ',' + fifth] || ['?', '?'];
    const sevName = SEV_NAMES[third + ',' + fifth + ',' + sev] || '';
    let rn = ROMAN[i];
    if (third === 3) rn = rn.toLowerCase();
    const acc = st - [0, 2, 4, 5, 7, 9, 11][i];
    if (acc < 0) rn = '♭' + rn; else if (acc > 0) rn = '♯' + rn;
    if (tri[1] === 'dim') rn += '°'; else if (tri[1] === 'aug') rn += '+';
    const root = (tonicPc + st) % 12;
    const name = spell(root, flats);
    return { degree: i + 1, roman: rn, root, triad: name + tri[0], seventh: name + (sevName ? prettySym(sevName) : ''), iv: [0, third, fifth], iv7: [0, third, fifth, sev] };
  });
}

export function scaleById(id) { return D.SCALES.find(s => s.id === id); }
