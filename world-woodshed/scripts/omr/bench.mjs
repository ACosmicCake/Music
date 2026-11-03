/* How well score recognition reads the test pages from make-pages.py: notes found with the right pitch and
   start (precision and recall), of those how many have the right length, and bars found.

     node scripts/omr/bench.mjs DIR [--show N] */
import fs from 'fs';
import path from 'path';
import { recognize } from '../../src/omr/recognize.js';
import { midiOf } from '../../src/omr/assemble.js';

function readPgm(f) {
  const b = fs.readFileSync(f); let p = 0;
  const tok = () => { while (/\s/.test(String.fromCharCode(b[p]))) p++; let s = ''; while (!/\s/.test(String.fromCharCode(b[p]))) s += String.fromCharCode(b[p++]); return s; };
  tok(); const w = +tok(), h = +tok(); tok(); p++;
  return { w, h, d: new Uint8Array(b.subarray(p, p + w * h)) };
}

/* the score as [{ row, m, t, len, midi }] (one entry per pitch; rests left out) */
export function flatten(score) {
  const out = [];
  let row0 = 0;
  score.parts.forEach(part => {
    part.bars.forEach((bar, m) => {
      bar.forEach((voices, si) => voices.forEach(v => {
        let t = 0;
        v.forEach(e => { if (!e.rest) e.pitches.forEach(p => out.push({ row: row0 + si, m, t: +t.toFixed(3), len: +e.q.toFixed(3), midi: midiOf(p) })); t += e.q; });
      }));
    });
    row0 += part.staves.length;
  });
  return out;
}

/* the ties the reader found: row|bar|time|midi of each pitch a tie starts on */
function tiesOf(score) {
  const out = [];
  let row0 = 0;
  score.parts.forEach(part => {
    part.bars.forEach((bar, m) => bar.forEach((voices, si) => voices.forEach(v => {
      let t = 0;
      v.forEach(e => { if (!e.rest) e.pitches.forEach(p => { if (p.tieStart) out.push((row0 + si) + '|' + m + '|' + t.toFixed(2) + '|' + midiOf(p)); }); t += e.q; });
    })));
    row0 += part.staves.length;
  });
  return out;
}

const dir = process.argv[2];
const show = process.argv.includes('--show') ? Number(process.argv[process.argv.indexOf('--show') + 1]) : -1;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.pgm')).sort();
let TP = 0, FP = 0, FN = 0, durOK = 0, pitchOnly = 0, barsOK = 0, ms = 0;
let repWant = 0, repGot = 0, repOK = 0, tieWant = 0, tieGot = 0, tieOK = 0, tieSeen = 0, tieFalse = 0;
let endWant = 0, endGot = 0, endOK = 0;
const rows = [];
files.forEach((f, idx) => {
  const base = path.join(dir, f.replace('.pgm', ''));
  const gt = JSON.parse(fs.readFileSync(base + '.json', 'utf8'));
  const g = readPgm(base + '.pgm');
  const t = Date.now();
  const score = recognize([g]);
  ms += Date.now() - t;
  const got = score ? flatten(score) : [];
  const want = [];
  gt.notes.forEach(n => { if (!n.rest) n.midi.forEach(m => want.push({ row: n.staff, m: n.m, t: n.t, len: n.len, midi: m })); });
  // a pickup shifts nothing here: generated pieces have none
  const key = e => e.row + '|' + e.m + '|' + e.t.toFixed(2) + '|' + e.midi;
  const W = new Map(); want.forEach(e => W.set(key(e), e));
  let tp = 0, dok = 0;
  got.forEach(e => { const w = W.get(key(e)); if (w) { tp++; if (Math.abs(w.len - e.len) < 0.01) dok++; W.delete(key(e)); } });
  // pitches in the right order regardless of rhythm (does the melody come through?)
  const seq = a => a.filter(e => e.row === 0).map(e => e.midi);
  const lcs = (a, b) => { const d = new Array(b.length + 1).fill(0); for (let i = 1; i <= a.length; i++) { let prev = 0; for (let j = 1; j <= b.length; j++) { const tmp = d[j]; d[j] = a[i - 1] === b[j - 1] ? prev + 1 : Math.max(d[j], d[j - 1]); prev = tmp; } } return d[b.length]; };
  const po = lcs(seq(want), seq(got)) / Math.max(1, seq(want).length);
  TP += tp; FP += got.length - tp; FN += want.length - tp; durOK += dok; pitchOnly += po;
  // repeats (pages from make-pages.py --marks): the same [first, last] bars
  const wr = (gt.meta.repeats || []).map(r => r.join('-')), gr = (score && score.repeats || []).map(r => r.join('-'));
  repWant += wr.length; repGot += gr.length; repOK += gr.filter(r => wr.includes(r)).length;
  // first and second endings: bar and number (the generated ones are one bar each)
  const we = (gt.meta.endings || []).map(e => e.join('-')), ge = (score && score.endings || []).flatMap(e => { const o = []; for (let b = e[0]; b <= e[1]; b++) o.push(b + '-' + e[2]); return o; });
  endWant += we.length; endGot += ge.length; endOK += ge.filter(e => we.includes(e)).length;
  // ties: a tie starting on the right note
  const wt = new Set(); gt.notes.forEach(n => { if (n.tieStart) n.midi.forEach(m => wt.add(n.staff + '|' + n.m + '|' + n.t.toFixed(2) + '|' + m)); });
  const gtie = score ? tiesOf(score) : [];
  tieWant += wt.size; tieGot += gtie.length; tieOK += gtie.filter(k => wt.has(k)).length;
  // of the tied notes the reader found at all, how many it tied; and ties on notes that were read right but have none
  const gotKeys = new Set(got.map(e => e.row + '|' + e.m + '|' + e.t.toFixed(2) + '|' + e.midi));
  wt.forEach(k => { if (gotKeys.has(k)) tieSeen++; });
  const wantKeys = new Set(want.map(key));
  tieFalse += gtie.filter(k => !wt.has(k) && wantKeys.has(k)).length;
  const nb = score ? score.counts.bars : 0;
  if (nb === gt.meta.bars) barsOK++;
  rows.push([f, gt.meta.font, gt.meta.time, gt.meta.staves.join(''), 'bars ' + nb + '/' + gt.meta.bars, 'R ' + (tp / Math.max(1, want.length) * 100).toFixed(0) + '%', 'P ' + (tp / Math.max(1, got.length) * 100).toFixed(0) + '%', 'seq ' + (po * 100).toFixed(0) + '%', score ? 'time ' + score.time.num + '/' + score.time.den + ' key ' + score.fifths + ' fixed ' + score.counts.fixed : ''].join('  '));
  if (idx === show) { console.log(JSON.stringify(score.warnings.slice(0, 10))); console.log('want', want.slice(0, 30).map(key).join(' ')); console.log('got ', got.slice(0, 30).map(key).join(' ')); }
});
rows.forEach(r => console.log(r));
const P = TP / Math.max(1, TP + FP), R = TP / Math.max(1, TP + FN);
console.log(`\nnotes: precision ${(P * 100).toFixed(1)}%  recall ${(R * 100).toFixed(1)}%  F1 ${(2 * P * R / Math.max(1e-9, P + R) * 100).toFixed(1)}%  right length ${(durOK / Math.max(1, TP) * 100).toFixed(1)}%`);
if (endWant || endGot) console.log(`endings: ${endOK} of ${endWant} found, ${endGot - endOK} wrong`);
if (repWant || repGot) console.log(`repeats: ${repOK} of ${repWant} found, ${repGot - repOK} wrong`);
if (tieWant || tieGot) console.log(`ties: ${tieOK} of ${tieWant} found (${tieSeen} of the tied notes were read), ${tieGot - tieOK} not matched, ${tieFalse} on a right note with no tie`);
console.log(`pitch order (melody): ${(pitchOnly / files.length * 100).toFixed(1)}%  bars right: ${barsOK}/${files.length}  ${(ms / files.length).toFixed(0)} ms a page`);
