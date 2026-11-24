/* Solo breaks in the Rhythm atlas studio: play `every` cycles, then the rhythm drops out for `len` cycles
   while the count goes on, so the player solos and comes back in on time. Plain functions. */
export const SOLO_LENS = [0, 1, 2, 4, 8];
export const SOLO_EVERY = [1, 2, 4, 8];
/* Where cycle c falls: `solo` (in a break), `n` and `of` (which break cycle), `played` (how many playing cycles
   came before it, so the variations and fills go on from where they were rather than skipping the break),
   `last` (the last break cycle, before the rhythm comes back). */
export function soloAt(c, every, len) {
  if (!len || len < 1) return { solo: false, played: c };
  const e = Math.max(1, every || 1), period = e + len, k = Math.floor(c / period), pos = c % period;
  const played = k * e + Math.min(pos, e);
  if (pos < e) return { solo: false, played };
  const n = pos - e + 1;
  return { solo: true, n, of: len, last: n === len, played };
}
