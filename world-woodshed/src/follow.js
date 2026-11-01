/* World Woodshed — following you through a score with the mic: each note the mic hears is matched to the
   written note it belongs to, and each written note ends up right, early, late, a wrong note or missed.
   Plain functions (no DOM, no audio), tested in test/follow.test.js. The score viewer (src/ui/scoreview.js)
   feeds them the score's notes from alphaTab and the mic's notes (src/listen.js) placed on the score's clock.

   Times are in ticks (alphaTab counts 960 to a quarter note); tempo is the bpm you are playing at, so the
   allowances can be in seconds, which is how timing feels, whatever the tempo. Pitch is compared by pitch
   class: a guitar part is written an octave above where it sounds, and the mic may hear the octave. */

export const TPQ = 960;
const GOOD_SEC = 0.12;  // within this of the written time: in time
const NEAR_SEC = 0.35;  // within this (and under half the gap to the next note): the same note, early or late

/* The notes to play, from alphaTab beats: [{ tick, midis, bar }] (rests and tied-over notes are left out) */
export function expectedFrom(beats) {
  const out = [];
  (beats || []).forEach(b => {
    if (!b || b.isRest) return;
    const notes = (b.notes || []).filter(n => !n.isTieDestination);
    if (!notes.length) return;
    out.push({ tick: b.tick, midis: notes.map(n => n.midi), bar: b.bar });
  });
  return out.sort((a, b) => a.tick - b.tick);
}

// a tap (no pitch) only says when: it counts as the written note
const pcOk = (midis, midi) => midi == null || midis.some(m => ((Math.round(m) - Math.round(midi)) % 12 + 12) % 12 === 0);

/* A follower for one pass through the notes (all of them, or a loop's).
   heard(tick, midi) places one heard note; passed(tick) marks the notes left behind before tick as missed;
   result() → { marks: [status per note: 'right' | 'early' | 'late' | 'wrong' | 'missed' | null], summary } */
export function follower(expected, bpm) {
  const secPerTick = 60 / Math.max(20, bpm) / TPQ;
  const marks = expected.map(() => null);
  const gapAfter = i => (i + 1 < expected.length ? expected[i + 1].tick - expected[i].tick : Infinity);
  const gapBefore = i => (i > 0 ? expected[i].tick - expected[i - 1].tick : Infinity);
  function heard(tick, midi) {
    // the written notes this could be: near enough in time, and not past half the way to a neighbour
    let best = -1, bestCost = Infinity;
    expected.forEach((e, i) => {
      const dt = tick - e.tick, dSec = Math.abs(dt) * secPerTick;
      if (dSec > NEAR_SEC) return;
      if (dt > 0 && dt > gapAfter(i) / 2 && dSec > GOOD_SEC) return;
      if (dt < 0 && -dt > gapBefore(i) / 2 && dSec > GOOD_SEC) return;
      const pitchOk = pcOk(e.midis, midi);
      // a note already played right keeps its mark; an open one, a matching pitch and a nearer one win
      const cost = dSec + (pitchOk ? 0 : 0.5) + (marks[i] === 'right' ? 2 : marks[i] ? 0.3 : 0);
      if (cost < bestCost) { bestCost = cost; best = i; }
    });
    if (best < 0) return null;
    const e = expected[best], dSec = (tick - e.tick) * secPerTick;
    const mark = !pcOk(e.midis, midi) ? 'wrong' : Math.abs(dSec) <= GOOD_SEC ? 'right' : dSec < 0 ? 'early' : 'late';
    // a second try at the same note only improves it (a slip then the right note still shows the slip as late)
    const rank = { right: 3, early: 2, late: 2, wrong: 1, missed: 0 };
    if (!marks[best] || rank[mark] > rank[marks[best]]) marks[best] = mark;
    return { index: best, mark: marks[best], dSec };
  }
  function passed(tick) {
    expected.forEach((e, i) => { if (!marks[i] && (tick - e.tick) * secPerTick > NEAR_SEC) marks[i] = 'missed'; });
  }
  return { heard, passed, result: () => ({ marks: marks.slice(), summary: summarize(expected, marks) }) };
}

/* Counts, a score from 0 to 1 and the bars with the most to fix (bar numbers from 1, worst first) */
export function summarize(expected, marks) {
  const s = { total: 0, right: 0, timing: 0, wrong: 0, missed: 0, score: 0, bars: [] };
  const byBar = new Map();
  marks.forEach((m, i) => {
    if (!m) return;
    s.total++;
    if (m === 'right') s.right++;
    else if (m === 'early' || m === 'late') s.timing++;
    else s[m]++;
    if (m !== 'right') { const b = expected[i].bar + 1; byBar.set(b, (byBar.get(b) || 0) + (m === 'early' || m === 'late' ? 0.5 : 1)); }
  });
  s.score = s.total ? (s.right + s.timing * 0.5) / s.total : 0;
  s.bars = [...byBar.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0]).map(x => x[0]);
  return s;
}
