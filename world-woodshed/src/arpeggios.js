/* World Woodshed — arpeggios on the neck (plain functions, test/arpeggios.test.js).
   Used by the Arpeggio warm-up (one arpeggio in one position, like the Scale warm-up) and Arpeggio changes
   (a new chord every few bars, the hand staying in one position). Strings are given as open MIDI notes,
   low to high (E.STRINGS.map(s => s.midi)), so these work on any tuning and capo. */
import D from './data.js';

/* Every chord the app knows, in the order the smart plan brings them in: the triads and the four sevenths
   of jazz first, then the colours */
export const ARP_ORDER = ['maj', 'min', 'dom7', 'maj7', 'm7', 'm7b5', 'dim7', 'dim', 'aug', 'sus4', 'six', 'm6', 'sus2', 'mMaj7', 'nine', 'maj9', 'flat9', 'sharp9'];
export const arpOf = id => D.CHORDS.find(c => c.id === id) || D.CHORDS[0];
export const ARPS = () => ARP_ORDER.map(arpOf).concat(D.CHORDS.filter(c => !ARP_ORDER.includes(c.id)));

/* Chord-tone names: 9ths and altered 9ths named as such, the rest as degrees */
const LABEL = { 0: 'R', 2: '2', 3: '♭3', 4: '3', 5: '4', 6: '♭5', 7: '5', 8: '♯5', 9: '6', 10: '♭7', 11: '7', 13: '♭9', 14: '9', 15: '♯9' };
export function toneLabel(iv, chordId) {
  if (chordId === 'dim7' && iv === 9) return '𝄫7';
  return LABEL[iv] || String(iv);
}

export const ARP_PATTERNS = {
  updown: 'Up and down',
  downup: 'Down and up',
  inversions: 'From each inversion',
  thirds: 'Skip a note',
  fours: 'Groups of 4'
};

/* The chord tones in frets start..start+4 (and no higher than fret 12), low to high, one of each pitch.
   Each note is { s, f, m, p, iv } with iv the chord tone (0 = root). With trim, the run goes from the
   lowest root to the highest one in the window, as the Scale warm-up's do. */
export function windowNotes(iv, rootPc, start, strings, trim = true) {
  const pcs = iv.map(x => (rootPc + x) % 12);
  const out = [];
  strings.forEach((open, si) => {
    for (let f = start; f <= start + 4 && f <= 12; f++) {
      const m = open + f, p = m % 12, k = pcs.indexOf(p);
      if (k < 0) continue;
      if (out.length && m <= out[out.length - 1].m) continue;
      out.push({ s: si, f, m, p, iv: iv[k] });
    }
  });
  if (!trim) return out;
  const first = out.findIndex(n => n.iv === 0), last = out.map(n => n.iv).lastIndexOf(0);
  return first >= 0 && last > first ? out.slice(first, last + 1) : out;
}

/* Positions for a root: under the first finger on the 6th, 5th or 4th string, or the little finger on the
   6th or 5th (roughly the CAGED shapes), starting no higher than fret 8 */
export function arpPositions(rootPc, strings) {
  const out = [];
  const [s6, s5, s4] = strings;
  [[s6, 1], [s5, 1], [s4, 1], [s6, 4], [s5, 4]].forEach(([open, back]) => {
    const f = ((rootPc - open) % 12 + 12) % 12;
    [f, f + 12].forEach(ff => { const st = ff - back; if (st >= 0 && st <= 8) out.push(st); });
  });
  if (!out.length) out.push(0);
  return [...new Set(out)].sort((a, b) => a - b).filter((x, i, a) => i === 0 || x - a[i - 1] >= 2);
}

/* One round of a pattern over the window's notes. Every pattern starts on the root and ends on it. */
export function arpSeq(L, pattern) {
  const n = L.length, seq = [];
  if (n < 2) return L.slice();
  switch (pattern) {
    case 'downup':
      for (let i = n - 1; i >= 0; i--) seq.push(L[i]);
      for (let i = 1; i < n; i++) seq.push(L[i]);
      break;
    case 'inversions': {
      // up one octave of chord tones from each of the first few notes (root position, 1st, 2nd, 3rd inversion),
      // then down the same way from the top
      const k = Math.max(3, new Set(L.map(x => x.iv)).size);
      for (let i = 0; i + k < n; i++) for (let j = 0; j <= k; j++) seq.push(L[i + j]);
      for (let i = n - 1; i - k >= 0; i--) for (let j = 0; j <= k; j++) seq.push(L[i - j]);
      if (!seq.length) return arpSeq(L, 'updown');
      break;
    }
    case 'thirds':
      for (let i = 0; i + 2 < n; i++) seq.push(L[i], L[i + 2]);
      for (let i = n - 1; i - 2 >= 0; i--) seq.push(L[i], L[i - 2]);
      break;
    case 'fours':
      for (let i = 0; i + 3 < n; i++) seq.push(L[i], L[i + 1], L[i + 2], L[i + 3]);
      for (let i = n - 1; i - 3 >= 0; i--) seq.push(L[i], L[i - 1], L[i - 2], L[i - 3]);
      break;
    default:
      for (let i = 0; i < n; i++) seq.push(L[i]);
      for (let i = n - 2; i >= 0; i--) seq.push(L[i]);
  }
  if (seq.length && seq[0] !== L[0] && L[0].iv === 0) seq.unshift(L[0]);
  if (seq.length && seq[seq.length - 1] !== L[0] && L[0].iv === 0) seq.push(L[0]);
  return seq;
}

/* ---------- Arpeggio changes ---------- */
/* Common progressions as [semitones above the key, chord type] (types as theory.js spells them), one per slot.
   minor: the key is minor, for spelling. */
export const PROGRESSIONS = [
  { id: 'iiVI', name: 'ii–V–I', chords: [[2, 'm7'], [7, '7'], [0, 'maj7'], [0, 'maj7']] },
  { id: 'Ivi', name: 'I–vi–ii–V', chords: [[0, 'maj7'], [9, 'm7'], [2, 'm7'], [7, '7']] },
  { id: 'iiivi', name: 'iii–vi–ii–V', chords: [[4, 'm7'], [9, '7'], [2, 'm7'], [7, '7']] },
  { id: 'minor', name: 'Minor ii–V–i', minor: true, chords: [[2, 'm7b5'], [7, '7'], [0, 'm6'], [0, 'm6']] },
  { id: 'cycle', name: 'Cycle in a key (ii–V–I–IV–viiø–III7–vi)', chords: [[2, 'm7'], [7, '7'], [0, 'maj7'], [5, 'maj7'], [11, 'm7b5'], [4, '7'], [9, 'm7'], [9, 'm7']] },
  { id: 'blues', name: '12-bar blues', chords: [[0, '7'], [5, '7'], [0, '7'], [0, '7'], [5, '7'], [5, '7'], [0, '7'], [9, '7'], [2, 'm7'], [7, '7'], [0, '7'], [7, '7']] },
  { id: 'IIVV', name: 'I–IV–V (triads)', chords: [[0, ''], [5, ''], [7, ''], [0, '']] },
  { id: 'pop', name: 'I–V–vi–IV (triads)', chords: [[0, ''], [7, ''], [9, 'm'], [5, '']] },
  { id: 'andalusian', name: 'Andalusian cadence (i–♭VII–♭VI–V)', minor: true, chords: [[0, 'm'], [10, ''], [8, ''], [7, '7']] },
  { id: 'dorian', name: 'Dorian vamp (i7–IV7)', minor: true, chords: [[0, 'm7'], [5, '7']] },
  { id: 'rhythm', name: 'Rhythm changes, A section', chords: [[0, 'maj7'], [9, 'm7'], [2, 'm7'], [7, '7'], [4, 'm7'], [9, '7'], [2, 'm7'], [7, '7'], [0, 'maj7'], [0, '7'], [5, 'maj7'], [5, 'm6'], [4, 'm7'], [9, '7'], [2, 'm7'], [7, '7']] }
];
export const progOf = id => PROGRESSIONS.find(p => p.id === id) || PROGRESSIONS[0];

/* The chords of a progression in a key: [{ root, type }] */
export function progChords(prog, key) {
  return prog.chords.map(([st, type]) => ({ root: (key + st) % 12, type }));
}

/* Where to play a progression: the position (frets start..start+4) whose windows hold the most chord tones,
   the worst-served chord counting most, near the key's root on the 6th string */
export function bestPosition(chords, ivOf, key, strings) {
  let best = 0, score = -Infinity;
  const home = ((key - strings[0]) % 12 + 12) % 12;
  for (let st = 0; st <= 8; st++) {
    const counts = chords.map(c => windowNotes(ivOf(c.type), c.root, st, strings, false).length);
    const sc = Math.min(...counts) * 3 + counts.reduce((a, b) => a + b, 0) / counts.length - Math.abs(st - Math.max(0, home - 1)) * 0.15;
    if (sc > score) { score = sc; best = st; }
  }
  return best;
}

/* The line for a run of chords, each lasting `len` notes, in one position.
   mode 'nearest': start on the first chord's lowest root, go up and down through the window, and at each
   change carry on from the new chord's nearest note in the same direction (no leap, no restart).
   mode 'root': every chord starts on its lowest root in the window and goes up and down.
   windows: one list of notes (windowNotes(..., false)) per chord. Returns, per chord, its notes in order. */
export function changesLine(windows, len, mode = 'nearest') {
  const out = [];
  let last = null, dir = 1;
  windows.forEach(W => {
    const seg = [];
    if (!W.length) { out.push(seg); return; }
    let i;
    if (mode === 'root' || last === null) {
      i = W.findIndex(n => n.iv === 0); if (i < 0) i = 0; dir = 1;
    } else {
      // the nearest note to the last one, a step on in the direction we were going if two are as near
      let bi = 0, bd = Infinity;
      W.forEach((n, k) => {
        const d = Math.abs(n.m - last.m) + (n.m === last.m ? 0.6 : 0) + (Math.sign(n.m - last.m) === -dir ? 0.3 : 0);
        if (d < bd) { bd = d; bi = k; }
      });
      i = bi;
      if (W.length > 1 && (i + dir < 0 || i + dir >= W.length)) dir = -dir;
    }
    for (let k = 0; k < len; k++) {
      seg.push(W[i]);
      if (W.length < 2) continue;
      if (i + dir < 0 || i + dir >= W.length) dir = -dir;
      i += dir;
    }
    last = seg[seg.length - 1];
    out.push(seg);
  });
  return out;
}

/* How many semitones the hand-held line moves at each chord change (for the description and the tests) */
export const leaps = segs => segs.slice(1).map((sg, i) => (sg.length && segs[i].length ? Math.abs(sg[0].m - segs[i][segs[i].length - 1].m) : 0));
