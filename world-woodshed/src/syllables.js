/* Syllables to speak a rhythm, shown under the Rhythm atlas grid. Plain functions.
   Two rows:
   - say: one sayable syllable per drum sound, so the pattern itself can be spoken, cut to two letters when the next step sounds too. A rhythm that has its own
     traditional syllables (tabla bols, konnakol, dum and tek) keeps them (`r.labels`); the others get a syllable
     for the sound that leads on each step (`sayRow`). Loud hits are written in capitals.
   - ta ka: Takadimi counting, the same for every rhythm, so you speak where each note falls in the beat:
     ta on the beat, then ta ka di mi in fours, ta di in twos and ta ki da in threes (`takaRow`). */

// the middle-eastern, Turkish/Balkan and Persian drums are spoken dum (low, the middle of the skin), tek (high, the rim) and ka (the other hand's rim)
const DUMTEK = new Set(['arabic', 'turkbalkan', 'persian']);
const SAY = { low: 'dum', mid: 'go', high: 'ta', clap: 'pa', clave: 'tok', bell: 'ting', chick: 'chk', hat: 'ts', ride: 'ding', shaker: 'sh' };
const SAY_DUMTEK = { low: 'dum', mid: 'ka', high: 'tek' };
// when two sounds fall together, say the one that leads: the player's own part, then the drums from low to high
const ORDER = ['low', 'mid', 'high', 'clap', 'clave', 'bell', 'chick', 'hat', 'ride', 'shaker'];

export function syllableFor(name, region) {
  return (DUMTEK.has(region) && SAY_DUMTEK[name]) || SAY[name] || 'ta';
}

/* The sounds a rhythm uses with the syllable for each, for the legend */
export function sayLegend(r) {
  return Object.keys(r.tracks).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)).map(n => [n, syllableFor(n, r.region)]);
}

function leadAt(r, i) {
  const own = r.target === 'all' ? ['low', 'high'] : [r.target];
  const names = own.concat(ORDER, Object.keys(r.tracks));
  for (const n of names) { const p = r.tracks[n]; if (p && p[i] && p[i] !== '.') return [n, p[i]]; }
  return null;
}

/* One entry per step: the syllable, or '' where nothing sounds */
export function sayRow(r) {
  if (r.labels) return Array.from({ length: r.steps }, (_, i) => r.labels[i] || '');
  const hits = Array.from({ length: r.steps }, (_, i) => leadAt(r, i));
  return hits.map((hit, i) => {
    if (!hit) return '';
    let w = syllableFor(hit[0], r.region);
    if (hits[i + 1]) w = w.slice(0, 2); // a quick note straight after: say it short, as you would at speed (dum becomes du, tok to)
    return hit[1] === 'X' ? w.toUpperCase() : w;
  });
}

const SUBS = { 1: ['ta'], 2: ['ta', 'di'], 3: ['ta', 'ki', 'da'], 4: ['ta', 'ka', 'di', 'mi'], 6: ['ta', 'va', 'ki', 'di', 'da', 'ma'] };
const subOf = (k, n) => (SUBS[n] ? SUBS[n][k] : k === 0 ? 'ta' : '');

/* One entry per step, or null when it would say only ta (a tala counted one beat to a step) */
export function takaRow(r) {
  const out = [];
  if (r.groups && r.unit === '♪') { // aksak: the groups of eighths are the beats, long and short
    r.groups.forEach(g => { for (let k = 0; k < g; k++) out.push(subOf(k, g)); });
  } else {
    const n = r.spb || 1;
    for (let i = 0; i < r.steps; i++) out.push(subOf(i % n, n));
  }
  while (out.length < r.steps) out.push('');
  return out.every(x => x === 'ta') ? null : out.slice(0, r.steps);
}
