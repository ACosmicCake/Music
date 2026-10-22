/* World Woodshed — On the go plans: what a ride session can hold without a guitar, and your own choices.
   - commuteBlocks: swaps anything in a plan that needs the guitar for something that doesn't.
   - planRide: the smart plan for a ride, keeping only the kinds of practice you include.
   - mineBlocks: your own commute (a saved list of block kinds and minutes), fitted to the ride.
   No DOM, so it can be tested (test/commuteplan.test.js). */
import D from './data.js';
import Cur from './curriculum.js';
import { BLOCKS, DRILLS, newBlock, fitTo, totalOf } from './routines.js';

/* What a ride can hold, grouped for "What to include". 'away:<drill>' is a no-guitar drill. */
export const GO_GROUPS = {
  ear: { name: 'Ear training', keys: ['intervals', 'degrees', 'chords', 'progressions', 'scales', 'dictation'] },
  rhythm: { name: 'Rhythm', keys: ['rhythms', 'gym', 'clock', 'rhythmid'] },
  neck: { name: 'Neck & reading', keys: ['away:visualise', 'fretboard', 'sightread'] },
  body: { name: 'Fingers & voice', keys: ['away:fingers', 'away:konnakol', 'away:sing'] },
  tunes: { name: 'Tunes by ear', keys: ['repertoire'] },
  study: { name: 'Theory & listening', keys: ['lesson', 'listening', 'atlasquiz'] }
};
export const GO_KEYS = Object.values(GO_GROUPS).flatMap(g => g.keys);

export const keyOf = b => (b.type === 'away' ? 'away:' + ((b.settings || {}).drill || (b.params || {}).drill || 'visualise') : b.type);
export const groupOf = b => Object.keys(GO_GROUPS).find(g => GO_GROUPS[g].keys.includes(keyOf(b))) || null;
export function keyTitle(key) {
  const [type, drill] = key.split(':');
  if (drill) return DRILLS[drill].split(' (')[0];
  return type === 'repertoire' ? 'Follow a tune by ear' : BLOCKS[type].name;
}
export const goTitle = b => (GO_KEYS.includes(keyOf(b)) ? keyTitle(keyOf(b)) : BLOCKS[b.type] ? BLOCKS[b.type].name : b.type);

/* A new block of one kind, set up for the phone */
export function goBlock(key, minutes) {
  const [type, drill] = key.split(':');
  const params = drill ? { drill } : type === 'repertoire' ? { ear: true } : type === 'sightread' ? { mode: 'notes' } : {};
  const b = newBlock(type, { settings: Object.assign({}, params), params });
  b.minutes = b.weight = Math.max(1, Math.round(minutes || Math.min(5, BLOCKS[type].minutes)));
  return b;
}

/* Swap anything that needs the guitar for something that doesn't. A swapped block no longer practises the
   planned item (tapping fingers on your leg is not the technique exercise), so it doesn't grade it either. */
export function commuteBlocks(blocks) {
  return blocks.map(b0 => {
    const b = JSON.parse(JSON.stringify(b0)), p = b.params || {};
    const as = (type, params, why, keepItem) => {
      if (!keepItem) { delete b.cur; delete b.isNew; }
      return Object.assign(b, { type, params: Object.assign({}, params), settings: Object.assign({}, params), reason: why || b.reason });
    };
    switch (b.type) {
      case 'scalewarm': return as('away', Object.assign({ drill: 'visualise' }, p.scale ? { scale: p.scale } : {}, Number.isInteger(p.tonic) ? { tonic: p.tonic } : {}), 'See the scale on the neck in your head');
      case 'technique': return as('away', { drill: 'fingers' }, 'Finger independence, tapping on your leg');
      case 'free': return as('away', { drill: 'visualise' });
      case 'callresp': return as('dictation', {}, 'Hear it and write it back, instead of playing it back');
      case 'drill': {
        const d = (D.DRILLS || []).find(x => x.id === p.drill);
        const r = d && d.backing && d.backing.rhythm;
        return r ? as('rhythms', { rhythm: r }, 'Tap the rhythm from ' + d.name.toLowerCase()) : as('away', { drill: 'sing' }, 'Sing the degrees');
      }
      case 'repertoire': return as('repertoire', Object.assign({}, p, { ear: true }), 'Follow the form by ear with headphones', true);
      case 'transcribe': return as('listening', {});
      case 'metronome': return as('clock', {});
      case 'sightread': return as('sightread', Object.assign({}, p, { mode: p.mode === 'melody' ? 'rhythm' : (p.mode || 'notes') }), b.reason, true);
      default: return b;
    }
  });
}

const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* The smart plan for a ride of `minutes`, without the groups in `skip`. What was left out is replaced by
   other kinds you include, so the ride stays as long and about as varied. */
export function planRide(minutes, skip = []) {
  const all = commuteBlocks(Cur.planSession(minutes).blocks.filter(b => b.type !== 'break'));
  const off = new Set(skip.filter(g => GO_GROUPS[g]));
  // no hand breaks on a ride: their minutes go to the rest
  if (!off.size) return fitTo(all, minutes);
  const blocks = all.filter(b => !off.has(groupOf(b)));
  const pool = shuffle(Object.keys(GO_GROUPS).filter(g => !off.has(g)).flatMap(g => GO_GROUPS[g].keys).filter(k => !blocks.some(b => keyOf(b) === k)));
  while (blocks.length < all.length && pool.length) blocks.push(goBlock(pool.pop(), 4));
  return blocks.length ? fitTo(blocks, minutes) : [];
}

/* Your own commute: [{ key, minutes }] as blocks, fitted to the ride (null keeps their own lengths) */
export function mineBlocks(list, minutes) {
  const blocks = (Array.isArray(list) ? list : []).filter(x => x && GO_KEYS.includes(x.key)).map(x => goBlock(x.key, x.minutes));
  if (blocks.length && minutes && minutes !== totalOf(blocks)) fitTo(blocks, minutes);
  return blocks;
}
export const toMine = blocks => blocks.filter(b => GO_KEYS.includes(keyOf(b))).map(b => ({ key: keyOf(b), minutes: b.minutes }));

/* A first own commute, from the Commute template */
export const DEFAULT_MINE = [{ key: 'intervals', minutes: 4 }, { key: 'chords', minutes: 3 }, { key: 'away:visualise', minutes: 4 }, { key: 'listening', minutes: 4 }];
