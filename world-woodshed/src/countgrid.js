/* World Woodshed — count grids: where each note of a written phrase falls on the counts
   ("1 e & a 2 e & a"), with the backing's own part (the clave, the clap, dum and tek) on the same
   grid, and a plain "play on" line per bar. Plain functions; the drill page draws them (src/tools/drills.js).

   A count string can be given instead of the written meter, one label per slot of a bar
   ("1 2 3 4 5 6 7 8 9 10 11 12" for a flamenco compás), or a list of them used bar by bar in turn
   (['1 2 3 4', '5 6 7 8', …] for the sixteen beats of teental). A '|' in a count string marks the start
   of a group ("1 2 | 3 4 | 5 6 7"); otherwise a gap is left before each beat that has subdivisions. */
import { parseTime, durQ, spell } from './notation.js';

const SUB = { 1: [''], 2: ['', '&'], 3: ['', '&', 'a'], 4: ['', 'e', '&', 'a'] };
const near = (a, b) => Math.abs(a - b) < 1e-6;
const isBeat = l => /^\d+$/.test(l);
/* Slots that start a group, for the small gap the grid draws before them */
export function groupStarts(count, labels) {
  if (count && String(count).includes('|')) { const out = []; let j = 0; String(count).trim().split(/\s+/).forEach(t => { if (t === '|') { if (j) out.push(j); } else j++; }); return out; }
  if (labels.every(isBeat)) return [];
  return labels.map((l, j) => (j && isBeat(l) ? j : -1)).filter(j => j > 0);
}

/* One bar of labels for a meter at `per` slots per beat, or null when that meter is not counted that way. */
export function countLabels(time = '4/4', per = 2) {
  const ts = parseTime(time);
  if (ts.den === 8 && !ts.compound) return per === 1 ? Array.from({ length: ts.num }, (_, i) => String(i + 1)) : null; // 7/8, 11/8: one count per eighth
  if (ts.compound && per !== 3) return null; // 6/8, 12/8: 1 & a 2 & a
  if (!ts.compound && ![1, 2, 4].includes(per)) return null;
  const out = [];
  for (let b = 0; b < ts.beats; b++) SUB[per].forEach(s => out.push(s || String(b + 1)));
  return out;
}

/* Slot length (in quarters) for each choice of labels for a meter, coarsest first. */
function choices(time, count) {
  const ts = parseTime(time);
  if (count) {
    const all = [].concat(count).map(c => c.trim().split(/\s+/).filter(l => l !== '|'));
    return all.every(l => l.length === all[0].length) ? [{ labels: all[0], all, slotQ: ts.barQ / all[0].length }] : [];
  }
  return [1, 2, 3, 4].map(per => ({ per, labels: countLabels(time, per) })).filter(c => c.labels)
    .map(c => ({ labels: c.labels, all: [c.labels], slotQ: ts.barQ / c.labels.length }));
}

/* Times (quarters from the start of each bar) of every note (and rest, if asked) in written bars of { m, d, dot }. */
export function onsets(bars, rests = false) {
  return bars.map(bar => { let t = 0; const out = []; bar.forEach(n => { const len = durQ({ dur: n.d, dot: n.dot }); if (rests || n.m != null) out.push({ t, len, m: n.m, sp: n.sp }); t += len; }); return out; });
}

/* The backing's part to show beside the phrase: the rhythm's target track(s), or a groove's clave.
   Each row is { name, pattern, stepQ } with one character per step (x, X or .). */
export function backingRows(backing, D) {
  const b = backing || {};
  if (b.rhythm) {
    const r = D.RHYTHMS.find(x => x.id === b.rhythm); if (!r) return [];
    const stepQ = (r.unit === '♪' ? 0.5 : 1) / r.spb; // ♪ rhythms count eighths, the others count quarters
    const names = r.target === 'all' ? ['low', 'high'].filter(k => r.tracks[k]) : [r.target];
    return names.filter(k => r.tracks[k]).map(k => ({ name: (r.target === 'all' ? ALL_NAME[k] : TRACK_NAME[k]) || k, pattern: r.tracks[k], stepQ }));
  }
  if (b.groove && D.GROOVES[b.groove] && D.GROOVES[b.groove].perc && D.GROOVES[b.groove].perc.clave) {
    const g = D.GROOVES[b.groove];
    return [{ name: 'clave', pattern: g.perc.clave, stepQ: 1 / g.spb }];
  }
  return [];
}
const ALL_NAME = { low: 'dum', high: 'tek' }, TRACK_NAME = { low: 'drum', high: 'snare', chick: 'chop' };

/* Is a backing hit at bar-relative time t (quarters) in bar i? */
function backingHit(row, absT) {
  const loopQ = row.pattern.length * row.stepQ;
  const k = ((absT % loopQ) + loopQ) % loopQ / row.stepQ;
  if (!near(k, Math.round(k))) return null;
  const ch = row.pattern[Math.round(k) % row.pattern.length];
  return ch === '.' ? '' : ch === 'X' ? 'acc' : 'on';
}
function backingFits(row, barQ, slotQ) {
  for (let k = 0; k < row.pattern.length; k++) {
    if (row.pattern[k] === '.') continue;
    const t = (k * row.stepQ) % barQ;
    if (!near(t / slotQ, Math.round(t / slotQ))) return false;
  }
  return true;
}

/* Lay a written phrase out on count slots.
   opts: { time, count, key, spell: '#'|'b' for chromatic notes, backing: rows from backingRows, who: 'you' }
   Returns { labels, bars: [{ rows: [{ name, cells: [{ kind: 'on'|'acc'|'hold'|'', text }] }], play }] } or null
   when the notes fall between the counts this meter offers. */
export function phraseGrid(bars, opts = {}) {
  const time = opts.time || '4/4', ts = parseTime(time), key = opts.key || 'C';
  const ons = onsets(bars), starts = onsets(bars, true); // rests count too: a phrase written in eighths is counted in eighths
  const on = (list, c) => list.every(bar => bar.every(o => near(o.t / c.slotQ, Math.round(o.t / c.slotQ))));
  const ok = choices(time, opts.count).filter(c => c.labels.length <= 16 && on(ons, c));
  const fit = ok.filter(c => on(starts, c)).concat(ok.filter(c => !on(starts, c)));
  const back = opts.backing || [];
  const pick = fit.find(c => back.every(r => backingFits(r, ts.barQ, c.slotQ))) || fit[0]; // fine enough for the backing too, if it can be
  if (!pick) return null;
  const { labels, all, slotQ } = pick, n = labels.length;
  const rows = back.filter(r => backingFits(r, ts.barQ, slotQ));
  return {
    labels, starts: groupStarts([].concat(opts.count || [])[0], labels),
    bars: ons.map((bar, bi) => {
      const labels = all[bi % all.length];
      const cells = Array.from({ length: n }, () => ({ kind: '', text: '' }));
      bar.forEach(o => {
        const j = Math.round(o.t / slotQ), name = spell(o.m, key, o.sp || opts.spell).name;
        cells[j] = { kind: 'on', text: name, m: o.m };
        for (let k = j + 1; k < n && (k * slotQ) < o.t + o.len - 1e-6; k++) cells[k] = { kind: 'hold', text: '' };
      });
      const back = rows.map(r => ({ name: r.name, cells: labels.map((_, j) => ({ kind: backingHit(r, bi * ts.barQ + j * slotQ) || '', text: '' })) }));
      return { labels, rows: back.concat([{ name: opts.who || 'you', cells, you: true }]), play: playLine(cells, labels) };
    })
  };
}

/* Lay hand-written patterns out on count slots: grid { rows: { thumb: 'x..X....' }, bars?, time?, count? }
   with one character per slot (x hit, X loud hit, - held, . rest) over `bars` bars (default 1). */
export function patternGrid(grid, opts = {}) {
  const time = grid.time || opts.time || '4/4', ts = parseTime(time);
  const entries = Object.entries(grid.rows || {});
  if (!entries.length) return null;
  const len = Math.max(...entries.map(([, p]) => p.length));
  const count = grid.count || opts.count, nBars = grid.bars || 1;
  const pick = choices(time, count).find(c => c.labels.length * nBars === len);
  if (!pick) return null;
  const { labels, all, slotQ } = pick, n = labels.length;
  const starts = groupStarts([].concat(count || [])[0], labels);
  const rows = (grid.backing === false ? [] : opts.backing || []).filter(r => backingFits(r, ts.barQ, slotQ));
  return {
    labels, starts,
    bars: Array.from({ length: nBars }, (_, bi) => {
      const labels = all[bi % all.length];
      const back = rows.map(r => ({ name: r.name, cells: labels.map((_, j) => ({ kind: backingHit(r, bi * ts.barQ + j * slotQ) || '', text: '' })) }));
      const own = entries.map(([name, p]) => ({ name, you: true, cells: labels.map((_, j) => { const ch = p[bi * n + j] || '.'; return { kind: ch === 'X' ? 'acc' : ch === '-' ? 'hold' : ch === '.' ? '' : 'on', text: '' }; }) }));
      const play = entries.length === 1 ? playLine(own[0].cells, labels)
        : own.map(r => { const l = playLine(r.cells, labels, 8); return l && r.name[0].toUpperCase() + r.name.slice(1) + ': ' + l.replace(/^Play on /, '').replace(/; rest on \S+$/, ''); }).filter(Boolean).join(' · ');
      return { labels, rows: back.concat(own), play };
    })
  };
}

/* Does any of your notes start between the counted beats? */
export function offBeat(g) {
  return g.bars.some(b => b.rows.some(r => r.you && r.cells.some((c, j) => (c.kind === 'on' || c.kind === 'acc') && !isBeat((b.labels || g.labels)[j]))));
}

/* The name of slot j: "1", "& of 2", "a of 3" (or just "7" in an odd meter). */
export function countName(labels, j) {
  const l = labels[j];
  if (isBeat(l)) return l;
  let b = j; while (b > 0 && !isBeat(labels[b])) b--;
  return l + ' of ' + labels[b];
}

/* "Rest on 1 · G on a of 1 · F on & of 2", or '' when the bar is too busy to read as a list. */
export function playLine(cells, labels, max = 6) {
  const hits = cells.map((c, j) => ({ c, j })).filter(x => x.c.kind === 'on' || x.c.kind === 'acc');
  if (!hits.length || (hits.length > max && hits.length < cells.length)) return '';
  const mixed = hits.some(x => x.c.kind === 'acc') && hits.some(x => x.c.kind === 'on');
  if (hits.length === cells.length) return hits[0].c.text ? '' : mixed ? 'Every count, loud on ' + hits.filter(x => x.c.kind === 'acc').map(x => countName(labels, x.j)).join(', ') : 'Every count';
  const parts = hits.map(({ c, j }) => (c.text ? c.text + ' on ' : '') + countName(labels, j) + (mixed && c.kind === 'acc' ? ' (loud)' : ''));
  const restFirst = cells[0].kind === '' ? 'rest on ' + labels[0] : '';
  if (hits.every(x => !x.c.text)) return 'Play on ' + parts.join(', ') + (restFirst ? '; ' + restFirst : '');
  return (restFirst ? [restFirst[0].toUpperCase() + restFirst.slice(1)] : []).concat(parts).join(' · ');
}

export const _test = { choices, backingFits };
