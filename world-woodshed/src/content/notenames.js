/* World Woodshed — Note names: name notes and chords on the treble staff, the bass staff and the two together
   (the grand staff of piano music). Pure data and functions (no DOM), so they can be tested in Node.
   Unlike Sight-reading, pitches here are REAL (sounding) MIDI numbers, as piano and bass music is written:
   middle C (60) sits on one ledger line below the treble staff and one above the bass staff.

   Items (the `notenames` skill): n:<staff>:<midi> for a natural note, n:<staff>:<midi>:s|f for a sharp or flat
   (the same key spelled two ways is two items), c:<staff>:<quality>:<inversion> for a chord (the root changes
   every time). staff: t treble, b bass, g grand (chords only: the bass note in the bass clef, the chord above
   in the treble). Tiers are the three levels below. */

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
const ACC = { '-1': '♭', 0: '', 1: '♯' };
const mod = (a, n) => ((a % n) + n) % n;

export const STAVES = { t: 'Treble', b: 'Bass', g: 'Both' };
/* written range of each staff: `in` from the space below the bottom line to the space above the top line,
   `out` to three ledger lines either side */
export const RANGE = {
  t: { in: [62, 79], out: [53, 88], mid: 71 }, // D4–G5; F3 (3 lines below) – E6 (3 lines above); B4 middle line
  b: { in: [41, 59], out: [33, 67], mid: 50 }  // F2–B3; A1 – G4; D3 middle line
};
export const LEVELS = [
  { id: 1, notes: 'Inside the staff', chords: 'Major and minor', notesGoal: 'The lines and spaces of the staff, and the notes hanging just above and below it.', chordsGoal: 'Major and minor triads in root position, on the staff, with no sharps or flats.' },
  { id: 2, notes: 'Ledger lines', chords: 'Inversions', notesGoal: 'Up to three ledger lines above and below the staff, middle C included.', chordsGoal: 'Inversions and the diminished triad, reaching onto ledger lines.' },
  { id: 3, notes: 'Sharps and flats', chords: 'Sevenths, any root', notesGoal: 'Every sharp and flat across the whole range: the same key can be spelled two ways.', chordsGoal: 'Augmented triads and the four common sevenths, on any root with its sharps or flats.' }
];

/* chord qualities: semitones above the root, the symbol after the root's name, the tier of root position */
export const QUALITIES = {
  maj: { iv: [0, 4, 7], sym: '', name: 'major', tier: 1 },
  min: { iv: [0, 3, 7], sym: 'm', name: 'minor', tier: 1 },
  dim: { iv: [0, 3, 6], sym: '°', name: 'diminished', tier: 2 },
  aug: { iv: [0, 4, 8], sym: '+', name: 'augmented', tier: 3 },
  7: { iv: [0, 4, 7, 10], sym: '7', name: 'dominant seventh', tier: 3 },
  maj7: { iv: [0, 4, 7, 11], sym: 'maj7', name: 'major seventh', tier: 3 },
  m7: { iv: [0, 3, 7, 10], sym: 'm7', name: 'minor seventh', tier: 3 },
  m7b5: { iv: [0, 3, 6, 10], sym: 'm7♭5', name: 'half-diminished seventh', tier: 3 }
};
export const QUALITY_ORDER = ['maj', 'min', 'dim', 'aug', '7', 'maj7', 'm7', 'm7b5'];
export const INVERSIONS = ['root position', 'first inversion', 'second inversion'];

/* ---------- spelling ---------- */
const isNatural = pc => LETTER_PC.includes(mod(pc, 12));
/* the note name of a letter (0–6 from C) and an alteration */
export const nameOf = (L, alter) => LETTERS[L] + ACC[alter];
/* how a written note reads: natural pitches by their letter; a sharp or flat as asked */
export function spellNote(midi, acc) {
  const pc = mod(midi, 12);
  let L, alter = 0;
  if (isNatural(pc)) L = LETTER_PC.indexOf(pc);
  else { alter = acc === 'f' ? -1 : 1; L = LETTER_PC.indexOf(mod(pc - alter, 12)); }
  const octave = Math.floor((midi - alter) / 12) - 1;
  return { midi, L, letter: LETTERS[L], alter, octave, name: nameOf(L, alter), full: nameOf(L, alter) + octave };
}
const staffLabel = s => ({ t: 'treble', b: 'bass', g: 'grand staff' }[s]);

/* ---------- items ---------- */
export function noteItems() {
  const out = [];
  ['t', 'b'].forEach(s => {
    const R = RANGE[s];
    for (let m = R.out[0]; m <= R.out[1]; m++) {
      if (isNatural(m)) {
        const tier = m >= R.in[0] && m <= R.in[1] ? 1 : 2;
        out.push({ id: 'n:' + s + ':' + m, label: spellNote(m).full + ' (' + staffLabel(s) + ')', tier });
      } else {
        ['s', 'f'].forEach(a => out.push({ id: 'n:' + s + ':' + m + ':' + a, label: spellNote(m, a).full + ' (' + staffLabel(s) + ')', tier: 3 }));
      }
    }
  });
  return out;
}
export function chordItems() {
  const out = [];
  ['t', 'b', 'g'].forEach(s => QUALITY_ORDER.forEach(q => {
    const Q = QUALITIES[q];
    const invs = Q.iv.length === 3 && q !== 'aug' ? [0, 1, 2] : [0];
    invs.forEach(inv => out.push({
      id: 'c:' + s + ':' + q + ':' + inv,
      label: Q.name[0].toUpperCase() + Q.name.slice(1) + ', ' + INVERSIONS[inv] + ' (' + staffLabel(s) + ')',
      tier: inv ? Math.max(2, Q.tier) : Q.tier
    }));
  }));
  return out;
}
export const noteNameItems = () => noteItems().concat(chordItems());

/* the pool for a staff, kind and level: notes on the grand staff come from both staves */
export function poolFor(staff, kind, level, items = noteNameItems()) {
  const staves = kind === 'notes' ? (staff === 'g' ? ['t', 'b'] : [staff]) : [staff];
  const pre = kind === 'notes' ? 'n' : 'c';
  return items.filter(x => { const [p, s] = x.id.split(':'); return p === pre && staves.includes(s) && x.tier <= level; });
}
/* the highest level open, by the rule the engine uses for a skill: 80% of a level's items tried at 75% on average */
export function openLevel(staff, kind, seen, items = noteNameItems()) {
  let lv = 1;
  while (lv < LEVELS.length) {
    const pool = poolFor(staff, kind, lv, items);
    const tried = pool.filter(x => seen[x.id]);
    const avg = tried.length ? tried.reduce((a, x) => a + seen[x.id].ema, 0) / tried.length : 0;
    if (pool.length && tried.length / pool.length >= 0.8 && avg >= 0.75) lv++; else break;
  }
  return lv;
}

/* ---------- questions ---------- */
/* a note item as a card: its staff, pitch and spelling */
export function noteCard(id) {
  const [, s, m, a] = id.split(':');
  const sp = spellNote(+m, a);
  return Object.assign({ staff: s }, sp, { spell: sp.alter > 0 ? '#' : sp.alter < 0 ? 'b' : undefined });
}

/* every root a chord of this quality can be spelled on without double sharps or flats, E♯, B♯, C♭ or F♭, and
   with only sharps or only flats (so one stem can carry it); naturalOnly keeps those with no accidental at all */
export function chordSpelling(L, alter, q) {
  const Q = QUALITIES[q], rootPc = mod(LETTER_PC[L] + alter, 12);
  const notes = Q.iv.map((iv, k) => {
    const NL = (L + 2 * k) % 7;
    let a = mod(rootPc + iv - LETTER_PC[NL], 12); if (a > 6) a -= 12;
    return { L: NL, alter: a, pc: mod(rootPc + iv, 12) };
  });
  if (notes.some(n => Math.abs(n.alter) > 1 || (n.alter && isNatural(n.pc)))) return null;
  const signs = new Set(notes.filter(n => n.alter).map(n => Math.sign(n.alter)));
  if (signs.size > 1) return null;
  return notes;
}
export function chordRoots(q, naturalOnly) {
  const out = [];
  for (let L = 0; L < 7; L++) for (const a of [0, -1, 1]) {
    const pc = mod(LETTER_PC[L] + a, 12);
    if (a && isNatural(pc)) continue;
    const sp = chordSpelling(L, a, q);
    if (sp && (!naturalOnly || sp.every(n => !n.alter))) out.push({ L, alter: a });
  }
  return out;
}
/* close position from the root at `base`, inverted: the lowest inv notes go up an octave */
function voice(base, q, inv, spelled) {
  const Q = QUALITIES[q];
  const ns = Q.iv.map((iv, k) => ({ midi: base + iv, L: spelled[k].L, alter: spelled[k].alter }));
  for (let k = 0; k < inv; k++) ns[k].midi += 12;
  return ns.sort((a, b) => a.midi - b.midi);
}
/* the octave that fits the range and sits nearest the middle line */
function place(rootPc, q, inv, spelled, lo, hi, mid) {
  let best = null;
  for (let base = rootPc; base < 110; base += 12) {
    const v = voice(base, q, inv, spelled);
    if (v[0].midi < lo || v[v.length - 1].midi > hi) continue;
    const d = Math.abs((v[0].midi + v[v.length - 1].midi) / 2 - mid);
    if (!best || d < best.d) best = { v, d };
  }
  return best && best.v;
}
const withNames = n => Object.assign(n, { letter: LETTERS[n.L], name: nameOf(n.L, n.alter), octave: Math.floor((n.midi - n.alter) / 12) - 1 });
/* A chord item as a card at a level: a root (random among those the level allows), its notes bottom up and,
   on the grand staff, which go on which staff. rnd for tests. Returns null if nothing fits (never for these ranges). */
export function chordCard(id, level, rnd = Math.random) {
  const [, s, q, invS] = id.split(':');
  const inv = +invS, Q = QUALITIES[q];
  const roots = chordRoots(q, level < 3);
  const order = roots.map(r => [rnd(), r]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  const wide = level >= 2;
  for (const r of order) {
    const spelled = chordSpelling(r.L, r.alter, q);
    const rootPc = mod(LETTER_PC[r.L] + r.alter, 12);
    let upper, lower = [];
    if (s === 'g') {
      // the right hand plays the chord in the treble, the left hand its bass note in the bass clef
      const R = RANGE.t, B = RANGE.b;
      upper = place(rootPc, q, inv, spelled, wide ? R.out[0] : R.in[0], wide ? R.out[1] - 4 : R.in[1], R.mid);
      if (!upper) continue;
      const bassL = upper[0];
      const lo = wide ? B.out[0] : B.in[0], hi = B.in[1];
      let bm = null;
      for (let m = mod(bassL.midi, 12); m <= hi; m += 12) if (m >= lo && (bm == null || Math.abs(m - (B.mid - 3)) < Math.abs(bm - (B.mid - 3)))) bm = m;
      if (bm == null) continue;
      lower = [{ midi: bm, L: bassL.L, alter: bassL.alter }];
    } else {
      const R = RANGE[s];
      upper = place(rootPc, q, inv, spelled, wide ? R.out[0] : R.in[0], wide ? R.out[1] : R.in[1], R.mid);
      if (!upper) continue;
    }
    const notes = lower.concat(upper).map(n => withNames(Object.assign({}, n)));
    const rootName = nameOf(r.L, r.alter);
    const bass = notes[0];
    return {
      staff: s, q, inv, root: { L: r.L, alter: r.alter, name: rootName },
      symbol: rootName + Q.sym + (inv ? '/' + bass.name : ''),
      name: rootName + ' ' + Q.name + (inv ? ', ' + INVERSIONS[inv] + ' (' + bass.name + ' in the bass)' : ''),
      notes,
      treble: s === 'b' ? [] : (s === 'g' ? upper : notes).map(n => n.midi),
      bass: s === 't' ? [] : (s === 'g' ? lower : notes).map(n => n.midi),
      spell: notes.some(n => n.alter > 0) ? '#' : notes.some(n => n.alter < 0) ? 'b' : undefined
    };
  }
  return null;
}
/* the qualities a level asks about, for the answer buttons */
export const qualitiesAt = level => QUALITY_ORDER.filter(q => QUALITIES[q].tier <= level);
