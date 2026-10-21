/* World Woodshed — your own tunes for the Repertoire gym: reading a typed chord chart and form, and
   checking a tune before it is saved or played.

   A chart is typed the way it is written on paper: bars split by | or new lines, chords in a bar split by
   spaces (up to four, sharing the bar's four beats evenly, as in D.TUNES), and % repeats the bar before.
   Common spellings are accepted (C-7, CΔ7, Cø, C°7, Cmin7, C7(b9), lower-case roots) and stored the way
   src/theory.js writes them, so the band, the guide-tone drill and transposition treat them like the
   preset tunes. A form is either one letter per equal section (AABA) or labels with bar counts (A8 B8, or
   Intro 4, A 8). Pure functions: no DOM and no saved state. */
import D from './data.js';
import { QUAL } from './theory.js';

export const MAX_BARS = 128, MAX_PER_BAR = 4, MAX_SECTIONS = 24, MIN_BPM = 50, MAX_BPM = 300;
const KNOWN = new Set(QUAL.map(q => q[0]));
const ALIAS = {
  M: '', maj: '', Ma: '', ma: '', M7: 'maj7', Maj7: 'maj7', ma7: 'maj7', 'Δ': 'maj7', 'Δ7': 'maj7', '^': 'maj7', '^7': 'maj7',
  M9: 'maj9', Maj9: 'maj9', ma9: 'maj9', 'Δ9': 'maj9', 'ø': 'm7b5', 'ø7': 'm7b5', 'm7-5': 'm7b5', '°': 'dim', o: 'dim', '°7': 'dim7', o7: 'dim7',
  '+': 'aug', '#5': 'aug', sus: 'sus4', dom7: '7', mM7: 'mmaj7', mmaj: 'mmaj7', 'mΔ': 'mmaj7', 'mΔ7': 'mmaj7', mMaj7: 'mmaj7', mma7: 'mmaj7',
  '7+11': '7#11', '7-9': '7b9', '7+9': '7#9'
};
/* the chord types the band knows, for the error message */
export const KNOWN_TYPES = 'C Cm C7 Cmaj7 Cm7 Cm7b5 Cdim Cdim7 C6 Cm6 C9 Cm9 Cmaj9 C13 C7b9 C7#9 C7#11 Csus4 Csus2 Caug CmMaj7';

/* One chord as typed → { sym } in the app's spelling, or { error } */
export function normChord(tok) {
  const raw = String(tok).trim();
  if (raw.includes('/')) return { error: raw + ': slash chords are not supported yet. Write the chord without the bass note (' + raw.split('/')[0] + ').' };
  const m = /^([A-Ga-g])([#b♯♭]?)(.*)$/.exec(raw);
  if (!m) return { error: raw + ' is not a chord: start with a note from A to G.' };
  const root = m[1].toUpperCase() + (m[2] === '♯' ? '#' : m[2] === '♭' ? 'b' : m[2]);
  let q = m[3].replace(/[()]/g, '').replace(/♭/g, 'b').replace(/♯/g, '#');
  if (q in ALIAS) q = ALIAS[q];
  else if (/^(min|mi|-)/.test(q)) { q = 'm' + q.replace(/^(min|mi|-)/, ''); if (q in ALIAS) q = ALIAS[q]; }
  if (!KNOWN.has(q)) return { error: raw + ': the band does not know this chord type yet. It knows ' + KNOWN_TYPES + '.' };
  return { sym: root + q };
}

/* A typed chart → { bars: ['Cm7', 'Gm7 C7', ...], errors: [message] } */
export function parseChart(text) {
  const bars = [], errors = [];
  String(text || '').split(/\n/).forEach(line => line.split('|').forEach(cell => {
    const toks = cell.trim().split(/\s+/).filter(Boolean);
    if (!toks.length) return;
    if (toks.length === 1 && toks[0] === '%') {
      if (bars.length) bars.push(bars[bars.length - 1]); else errors.push('% repeats the bar before, so it cannot start the chart.');
      return;
    }
    const syms = [];
    toks.forEach(tk => { const c = normChord(tk); if (c.error) errors.push('Bar ' + (bars.length + 1) + ': ' + c.error); else syms.push(c.sym); });
    if (syms.length > MAX_PER_BAR) errors.push('Bar ' + (bars.length + 1) + ' has ' + syms.length + ' chords; a bar holds up to ' + MAX_PER_BAR + ' (one per beat).');
    bars.push(syms.join(' '));
  }));
  if (!bars.length) errors.push('Type some chords: bars split by |, for example Dm7 | G7 | Cmaj7 | Cmaj7');
  if (bars.length > MAX_BARS) errors.push('That is ' + bars.length + ' bars; a tune can have up to ' + MAX_BARS + '.');
  return { bars, errors };
}

/* Bars → chart text, four bars to a line (how the editor shows a saved tune) */
export function chartText(bars) {
  const lines = [];
  for (let i = 0; i < bars.length; i += 4) lines.push(bars.slice(i, i + 4).join(' | '));
  return lines.join('\n');
}

/* A typed form → { form: [[label, bars]] or null (no sections), error } for a chart of n bars */
export function parseForm(text, n) {
  const str = String(text || '').trim();
  if (!str) return { form: null };
  let form;
  if (/^[A-Z]+$/.test(str)) {
    const k = str.length;
    if (n % k) return { error: str + ' splits the tune into ' + k + ' equal sections, but ' + n + ' bars do not divide by ' + k + '. Give the lengths instead, like ' + [...str].map(l => l + '8').join(' ') + '.' };
    form = [...str].map(l => [l, n / k]);
  } else {
    form = [];
    const toks = str.split(/[\s,;]+/).filter(Boolean);
    for (let i = 0; i < toks.length; i++) {
      const tk = toks[i], m = /^(.*\D)(\d+)$/.exec(tk);
      if (/^\d+$/.test(tk)) { if (!form.length || form[form.length - 1][1]) return { error: 'Put a section name before ' + tk + ', like A ' + tk + '.' }; form[form.length - 1][1] = +tk; }
      else if (m && !/^\d+$/.test(toks[i + 1] || '')) form.push([m[1], +m[2]]);
      else form.push([tk, 0]);
    }
    const missing = form.find(f => !f[1]);
    if (missing) return { error: 'Section ' + missing[0] + ' needs a number of bars, like ' + missing[0] + '8.' };
  }
  if (form.length > MAX_SECTIONS) return { error: 'Up to ' + MAX_SECTIONS + ' sections.' };
  const long = form.find(f => f[0].length > 8);
  if (long) return { error: 'Keep section names short (up to 8 letters): ' + long[0] + '.' };
  const sum = form.reduce((a, f) => a + f[1], 0);
  if (sum !== n) return { error: 'The form adds up to ' + sum + ' bars, but the chart has ' + n + '.' };
  return { form };
}

/* A form → its text in the editor */
export function formText(form) {
  if (!form || !form.length) return '';
  const even = form.every(f => /^[A-Z]$/.test(f[0]) && f[1] === form[0][1]);
  return even ? form.map(f => f[0]).join('') : form.map(f => f[0] + (/\d$/.test(f[0]) ? ' ' : '') + f[1]).join(' ');
}

/* An editor draft { id?, name, chart, form, groove, bpm, note } → { tune, errors: { field: message } }.
   tune is set only when there are no errors; it has the shape of a D.TUNES entry. */
export function checkTune(d) {
  const errors = {};
  const name = String(d.name || '').trim().slice(0, 60);
  if (!name) errors.name = 'Give the tune a name.';
  const chart = parseChart(d.chart);
  if (chart.errors.length) errors.chart = chart.errors.slice(0, 4).join(' ');
  const groove = D.GROOVES[d.groove] ? d.groove : null;
  if (!groove) errors.groove = 'Pick a groove.';
  const bpm = Math.round(Math.min(MAX_BPM, Math.max(MIN_BPM, +d.bpm || 120)));
  let form = null;
  if (!errors.chart) { const f = parseForm(d.form, chart.bars.length); if (f.error) errors.form = f.error; else form = f.form; }
  if (Object.keys(errors).length) return { errors };
  const tune = { name, groove, bpm, note: String(d.note || '').trim().slice(0, 120), bars: chart.bars };
  if (d.id) tune.id = d.id;
  if (form) tune.form = form;
  return { tune, errors };
}

/* A saved tune (perhaps from another device or an old backup) made safe to play: the same shape as a
   D.TUNES entry with group 'Your tunes', or null if it cannot be played */
export function playable(t) {
  if (!t || typeof t !== 'object' || !t.id || !Array.isArray(t.bars)) return null;
  const chart = parseChart(t.bars.map(String).join(' | '));
  if (chart.errors.length || !D.GROOVES[t.groove]) return null;
  const n = chart.bars.length;
  const form = Array.isArray(t.form) && t.form.length <= MAX_SECTIONS && t.form.every(f => Array.isArray(f) && typeof f[0] === 'string' && Number.isInteger(f[1]) && f[1] > 0)
    && t.form.reduce((a, f) => a + f[1], 0) === n ? t.form.map(f => [f[0].slice(0, 8), f[1]]) : undefined;
  return {
    id: String(t.id), name: String(t.name || 'Untitled'), group: 'Your tunes', mine: true, groove: t.groove,
    bpm: Math.round(Math.min(MAX_BPM, Math.max(MIN_BPM, +t.bpm || 120))), note: String(t.note || ''),
    form, bars: chart.bars
  };
}

export default { normChord, parseChart, chartText, parseForm, formText, checkTune, playable, MAX_BARS, MIN_BPM, MAX_BPM };
