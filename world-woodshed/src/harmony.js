/* World Woodshed — Roman numerals for the Repertoire gym's chord charts (plain functions, test/harmony.test.js).
   A numeral names a chord by the step of the key its root is on: I to VII on the major scale of the key's
   tonic, with b or # for the steps in between (bIII in C is E♭). Capitals have a major 3rd, small letters a
   minor 3rd. "V7/ii" is the V7 of ii: a chord that points to another chord of the key. A token can end in
   ":Key" (":Bb", ":Gm") when one chord belongs to a key other than its section's. */
import { spell, keyPrefersFlats } from './theory.js';

const STEP = { I: 0, II: 2, III: 4, IV: 5, V: 7, VI: 9, VII: 11 };
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/* 'Bb' → { pc: 10, minor: false }, 'Gm' → { pc: 7, minor: true } */
export function parseKey(key) {
  const m = /^([A-G])(b|#)?(m?)$/.exec(key || '');
  if (!m) return null;
  return { pc: (NOTE[m[1]] + (m[2] === 'b' ? 11 : m[2] === '#' ? 1 : 0)) % 12, minor: m[3] === 'm' };
}

/* The name of a key moved by `shift` semitones: "B♭ major", "G minor" */
export function keyName(key, shift = 0) {
  const k = parseKey(key); if (!k) return '';
  const pc = (k.pc + shift) % 12;
  return (shift ? spell(pc, keyPrefersFlats(pc, k.minor)) : spellKey(key)) + (k.minor ? ' minor' : ' major');
}
const spellKey = key => key.replace(/m$/, '').replace('b', '♭').replace('#', '♯');

/* One numeral: 'bVImaj7', 'iiø7', 'V7/ii' → { step, minor, rest, of } (of: the numeral it points to, or null) */
export function parseNumeral(tok) {
  const [head, of] = tok.split('/');
  const m = /^(b|#)?(VII|VI|V|IV|III|II|I|vii|vi|v|iv|iii|ii|i)(.*)$/.exec(head);
  if (!m) return null;
  const step = (STEP[m[2].toUpperCase()] + (m[1] === 'b' ? 11 : m[1] === '#' ? 1 : 0)) % 12;
  return { step, minor: m[2] === m[2].toLowerCase(), rest: m[3], of: of ? parseNumeral(of) : null };
}

/* The root pitch class a numeral names in a key (pc of the tonic) */
export function numeralRoot(tok, tonic) {
  const n = parseNumeral(tok); if (!n) return null;
  return (tonic + (n.of ? n.of.step : 0) + n.step) % 12;
}

/* Split a bar's numerals ('ii7 V7:G') into [{ rn, key }] with the section's key filled in */
export function barNumerals(bar, key) {
  return bar.split(' ').filter(Boolean).map(t => { const [rn, k] = t.split(':'); return { rn, key: k || key }; });
}

/* The numerals of a tune bar by bar, each chord with its key and whether the key changed there:
   [[{ rn, key, newKey }]]. sections: [{ bars: [from, to], key }] (bars counted from 1). */
export function chartNumerals(h) {
  const keyAt = bi => (h.sections.find(s => bi + 1 >= s.bars[0] && bi + 1 <= s.bars[1]) || {}).key;
  let last = null;
  return h.rn.map((bar, bi) => barNumerals(bar, keyAt(bi)).map(x => { const newKey = x.key !== last; last = x.key; return Object.assign(x, { newKey }); }));
}

export const prettyNumeral = tok => tok.replace(/(^|\/)b/g, '$1♭').replace(/(^|\/)#/g, '$1♯');
