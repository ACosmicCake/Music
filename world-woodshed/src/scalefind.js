/* World Woodshed — what scale is this? Plain functions (test/scalefind.test.js).

   findScales(notes, opts) takes the notes of a phrase (MIDI numbers, fractional when the mic heard a note
   between the frets, as a maqam's quarter tones are) and ranks every scale the app knows, on every tonic, by
   how well it explains them: how much of what was played is in the scale, how much of the scale was played,
   and how strongly the phrase leans on the tonic (the note it starts, ends, dwells and lands low on).
   catalogue(D) is D.SCALES with the world scales of src/content/scales-world.js and the styles each belongs to. */
import { WORLD_SCALES, MORE_NAMES } from './content/scales-world.js';

const mod12 = x => ((x % 12) + 12) % 12;

/* Every scale, with the D.REGIONS ids it belongs to: the region pages list D.SCALES ids, the world scales
   carry their own. app: true for the ones the rest of the app teaches (so the explorer can show them). */
export function catalogue(D) {
  const styles = id => (D.REGIONS || []).filter(r => (r.scales || []).includes(id)).map(r => r.id);
  const own = (D.SCALES || []).map(s => ({ ...s, styles: styles(s.id), more: MORE_NAMES[s.id] || [], app: true }));
  const seen = new Set(own.map(s => s.id));
  return own.concat(WORLD_SCALES.filter(s => !seen.has(s.id)).map(s => ({ ...s, more: [], app: false })));
}

/* How close a played pitch (semitones above the tonic, may be fractional) is to a scale step: 1 on it, less
   for a quarter tone off (a fretted E♭ for Rast's half-flat E), nothing past that */
function credit(d) {
  d = Math.abs(d);
  return d <= 0.2 ? 1 : d <= 0.6 ? 0.5 : 0;
}
function nearest(steps, x) {
  let best = Infinity, at = -1;
  steps.forEach((s, i) => { let d = Math.abs(mod12(x - s + 6) - 6); if (d < best) { best = d; at = i; } });
  return { d: best, i: at };
}

/* The pitch classes of a phrase, weighted: notes held or repeated count more, and the guitar's overall tuning
   (the median offset from A440's semitones) is taken off so a guitar a little sharp isn't heard as quarter tones.
   notes: [midi] or [{ midi, w }]. Returns { pcs: [{ p, w }] (p may be x.5), first, last, low, tune } */
export function profile(notes) {
  const list = notes.map(n => (typeof n === 'number' ? { midi: n, w: 1 } : { midi: n.midi, w: n.w ?? 1 })).filter(n => Number.isFinite(n.midi));
  if (!list.length) return null;
  const offs = list.map(n => n.midi - Math.round(n.midi)).sort((a, b) => a - b);
  // the tuning: the median offset of the notes that sit near a fret (a quarter tone doesn't count)
  const nearFret = offs.filter(o => Math.abs(o) < 0.3);
  const tune = nearFret.length ? nearFret[nearFret.length >> 1] : 0;
  const q = m => { const x = m - tune; const r = Math.round(x * 2) / 2; return mod12(Math.abs(r - Math.round(x)) === 0.5 && Math.abs(x - Math.round(x)) > 0.32 ? r : Math.round(x)); };
  const w = new Map();
  list.forEach(n => { const p = q(n.midi); w.set(p, (w.get(p) || 0) + n.w); });
  const low = list.reduce((a, n) => (n.midi < a.midi ? n : a), list[0]);
  return { pcs: [...w.entries()].map(([p, ww]) => ({ p, w: ww })), first: q(list[0].midi), last: q(list[list.length - 1].midi), low: q(low.midi), tune: Math.round(tune * 100) };
}

/* Rank scales for a phrase. opts: { tonic: a pitch class to hold fixed (else every one is tried), list: catalogue(D) }
   Returns [{ scale, tonic, score, fit, cover, missing: [step], outside: [p], same: [{ scale, tonic }] }] best first.
   Scales with the same notes on another tonic (C major and A minor) stay separate entries; same lists them. */
export function findScales(notes, opts = {}) {
  const pr = profile(notes);
  if (!pr || !opts.list) return [];
  const total = pr.pcs.reduce((a, x) => a + x.w, 0);
  const distinct = pr.pcs.length;
  const tonics = opts.tonic != null ? [mod12(opts.tonic)] : [...Array(12).keys()];
  const out = [];
  for (const sc of opts.list) {
    for (const t of tonics) {
      let fit = 0; const hit = new Set(), outside = [];
      for (const { p, w } of pr.pcs) {
        const n = nearest(sc.steps, p - t), c = credit(n.d);
        fit += w * c;
        if (c > 0) hit.add(n.i); else outside.push(p);
        if (c === 0.5) outside.push(p);
      }
      fit /= total;
      const cover = hit.size / sc.steps.length;
      // the tonic: its weight in the phrase, and whether the phrase starts, ends or lands lowest on it
      const at = p => Math.abs(mod12(p - t + 6) - 6) < 0.3;
      const tw = pr.pcs.filter(x => at(x.p)).reduce((a, x) => a + x.w, 0) / total;
      const home = (at(pr.last) ? 0.45 : 0) + (at(pr.first) ? 0.25 : 0) + (at(pr.low) ? 0.2 : 0) + Math.min(0.4, tw * 1.6);
      // a scale bigger than what was played can always fit: smaller ones that still fit are more telling
      const spare = Math.max(0, sc.steps.length - distinct);
      const score = 4 * fit + 1.4 * cover + (opts.tonic != null ? 0 : home) - 0.08 * spare - (sc.app ? 0 : 0.03) - (sc.steps.some(x => !Number.isInteger(x)) && !pr.pcs.some(x => !Number.isInteger(x.p)) ? 0.15 : 0);
      out.push({ scale: sc, tonic: t, score, fit, cover, outside: [...new Set(outside)], missing: sc.steps.filter((x, i) => !hit.has(i)) });
    }
  }
  out.sort((a, b) => b.score - a.score);
  // the same notes on another tonic, for each result
  const keyOf = r => r.scale.steps.map(x => mod12(x + r.tonic)).sort((a, b) => a - b).join(',');
  const byKey = new Map();
  out.forEach(r => { const k = keyOf(r); if (!byKey.has(k)) byKey.set(k, []); byKey.get(k).push(r); });
  out.forEach(r => { r.same = byKey.get(keyOf(r)).filter(x => x !== r && (x.scale.id !== r.scale.id || x.tonic !== r.tonic)).slice(0, 4).map(x => ({ scale: x.scale, tonic: x.tonic })); });
  return out;
}
