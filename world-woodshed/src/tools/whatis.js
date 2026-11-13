/* World Woodshed — What chord is this? and What scale is this? (Train → Guitar)
   Name a chord strummed into the mic or tapped on the neck (src/chordid.js), and find the scales, ragas,
   maqamat and modes that a phrase fits (src/scalefind.js), with the styles each belongs to. */
import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import Mic from '../listen.js';
import { h, tool, openTool, Fretboard, positionsOfPc } from '../ui/core.js';
import { MicToggle } from '../ui/mic.js';
import { keepAwake } from '../native.js';
import { spell, keyPrefersFlats, degreeLabel } from '../theory.js';
import { voicing } from '../voicings.js';
import { nameChord, ChordEar, CHORD_TYPES, pcOf } from '../chordid.js';
import { findScales, catalogue } from '../scalefind.js';
import { stylePage } from './learn.js';
import './whatis.css';

const NOTE = p => D.NOTE_NAMES[pcOf(p)];

/* ---------------- What chord is this? ---------------- */
tool('whatchord', {
  tab: 'train', skill: null, title: 'What chord is this?', eyebrow: 'Name it',
  desc: 'Strum a chord into the mic, or tap where your fingers are on the neck, and see its name: the root, the bass, an inversion or slash chord, what each note is (R, ♭3, ♭7, 9…) and the other names the same notes go by.',
  render(body) {
    const st = { frets: [null, null, null, null, null, null], heard: null, pick: 0, from: 'neck' };
    const result = h('div', { class: 'card wi-result', 'aria-live': 'polite' });
    const neckCard = h('div', { class: 'card' });
    body.append(result, neckCard);

    // the mic: every block of samples to the chord ear; the analyzer's onsets mark strums
    let ear = null, offBlock = null, offOnset = null;
    const mic = MicToggle({ label: 'Listen to my strum', onLabel: 'Listening: strum a chord', hint: '',
      onOn: () => {
        keepAwake(true, 'whatchord');
        ear = ChordEar(Mic.sampleRate || A.ensure().sampleRate, { onChord: c => { st.heard = c; st.pick = 0; st.from = 'mic'; draw(); } });
        offBlock = Mic.on('block', (buf, t0) => ear && ear.push(buf, t0));
        offOnset = Mic.on('onset', ev => ear && ear.strum(ev.t));
        draw();
      },
      onOff: () => { keepAwake(false, 'whatchord'); if (offBlock) offBlock(); if (offOnset) offOnset(); offBlock = offOnset = null; ear = null; draw(); } });

    const tapped = () => st.frets.map((f, si) => (f === null ? null : E.STRINGS[si].midi + f)).filter(m => m !== null);
    const current = () => (st.from === 'mic' && st.heard ? st.heard.notes : tapped());

    const fb = Fretboard({ label: 'Guitar neck: tap where your fingers are', onTap: (si, f) => {
      st.frets[si] = st.frets[si] === f ? null : f; st.from = 'neck'; st.pick = 0;
      A.ensure(); A.fresh(); A.note(E.STRINGS[si].midi + f, A.now() + 0.01, 0.75, 1.4);
      draw();
    } });
    function strum(ms) { if (!ms.length) return; A.ensure(); A.fresh(); A.strum(ms.slice().sort((a, b) => a - b), A.now() + 0.03, 0.65, 0.022, 2); }
    function showShape(c) {
      const t = CHORD_TYPES.find(x => x.q === c.q); if (!t) return;
      const v = voicing(c.root, t.iv);
      if (!v) return;
      st.frets = v.frets.slice(); st.from = 'neck'; st.pick = 0; draw();
    }

    function draw() {
      const notes = current();
      const names = st.from === 'mic' && st.heard ? st.heard.names : nameChord(notes);
      const c = names[st.pick] || names[0];
      result.innerHTML = '';
      result.append(h('div', { class: 'spread' }, mic.el));
      if (!notes.length) {
        result.append(h('div', { class: 'wi-big muted', text: '—' }),
          h('p', { class: 'muted', text: mic.on ? 'Strum a chord and let it ring.' : 'Turn on the mic and strum a chord, or tap the frets below.' }));
      } else if (!c) {
        const pcs = [...new Set(notes.map(pcOf))];
        result.append(h('div', { class: 'wi-big', text: pcs.map(NOTE).join(' ') }),
          h('p', { class: 'muted', text: pcs.length < 2 ? 'One note isn’t a chord yet: add another string.' : 'These notes don’t make a chord the app knows. Try leaving one out.' }));
      } else {
        const sub = c.name + (c.inversion ? ', ' + c.inversion : '') + (c.slash && !c.inversion ? ', over ' + NOTE(c.bass) + ' in the bass' : '');
        result.append(...[h('div', { class: 'wi-big', text: c.sym }), h('p', { class: 'wi-sub', text: sub }),
          h('div', { class: 'wi-tones' }, c.tones.map(t => h('span', { class: 'wi-tone' + (t.heard ? '' : ' off'), title: t.heard ? null : 'not played' }, h('b', { text: t.name }), h('span', { text: t.deg })))),
          c.missing.length ? h('p', { class: 'small muted', text: 'No ' + c.missing.join(' or ') + ': guitarists often leave ' + (c.missing.length > 1 ? 'them' : 'it') + ' out, and the chord keeps its name.' }) : null,
          c.extra.length ? h('p', { class: 'small muted', text: 'Plus ' + c.extra.map(NOTE).join(', ') + ', which isn’t in this chord.' }) : null,
          st.from === 'mic' ? h('p', { class: 'small muted', text: 'Heard: ' + notes.map(m => NOTE(m) + (Math.floor(m / 12) - 1)).join(' ') + '. Not right? Tap the frets below instead.' }) : null].filter(Boolean));
        const others = names.slice(0, 6).map((x, i) => [x, i]).filter(([, i]) => i !== (names[st.pick] ? st.pick : 0));
        if (others.length) result.append(h('div', { class: 'stack wi-also' }, h('span', { class: 'eyebrow', text: 'Also called' }),
          h('div', { class: 'chips' }, others.map(([x, i]) => h('button', { class: 'chip', onclick: () => { st.pick = i; draw(); } }, x.sym)))));
        result.append(h('div', { class: 'row' },
          h('button', { class: 'btn', onclick: () => strum(notes) }, '▶ Hear it'),
          st.from === 'mic' ? h('button', { class: 'btn ghost', onclick: () => showShape(c) }, 'Show a shape for ' + c.sym.split('/')[0]) : null));
      }
      // the neck: the frets tapped
      fb.mark(st.frets.map((f, si) => (f === null ? null : { s: si, f, kind: c && pcOf(E.STRINGS[si].midi + f) === c.root ? 'root' : 'tone', label: NOTE(E.STRINGS[si].midi + f) })).filter(Boolean));
    }
    neckCard.append(h('h3', { text: 'Or tap it on the neck' }),
      h('p', { class: 'small muted', text: 'Tap each string where it is fretted (0 for open). Tap the same spot again to take the finger off: a string with no dot isn’t played.' }),
      fb.el,
      h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: () => { st.from = 'neck'; strum(tapped()); } }, '▶ Strum it'),
        h('button', { class: 'btn ghost', onclick: () => { st.frets = [null, null, null, null, null, null]; st.from = 'neck'; st.pick = 0; draw(); } }, 'Clear')));
    draw();
    return () => { keepAwake(false, 'whatchord'); mic.cleanup(); };
  }
});

/* ---------------- What scale is this? ---------------- */
let SCALE_LIST = null;
const scaleList = () => SCALE_LIST || (SCALE_LIST = catalogue(D));
/* a scale step's note name from the tonic, quarter tones as ¼♭ on the note above */
function stepName(tonic, x, flats) { return Number.isInteger(x) ? spell(tonic + x, flats) : spell(tonic + Math.ceil(x), flats) + '¼♭'; }
const minorish = steps => steps.includes(3) && !steps.includes(4);

tool('whatscale', {
  tab: 'train', skill: null, title: 'What scale is this?', eyebrow: 'Name it',
  desc: 'Play a phrase or a run into the mic, or tap notes on the neck, and see which scales fit: modes, ragas, maqamat, Persian dastgahs, Japanese, Chinese and Ethiopian scales, with the styles each one belongs to.',
  render(body) {
    const st = { notes: [], tonic: null, open: 0 };   // notes: [{ midi, w }] in the order played
    const inCard = h('div', { class: 'card' });
    const outCard = h('div', { class: 'card wi-result', 'aria-live': 'polite' });
    const neckCard = h('div', { class: 'card' });
    body.append(inCard, outCard, neckCard);
    let offNote = null, lastT = -1;
    const mic = MicToggle({ label: 'Listen to my playing', onLabel: 'Listening: play a phrase', hint: '',
      onOn: () => { keepAwake(true, 'whatscale'); offNote = Mic.on('note', ev => { if (ev.t - lastT < 0.05) return; lastT = ev.t; add(ev.midi); }); },
      onOff: () => { keepAwake(false, 'whatscale'); if (offNote) offNote(); offNote = null; } });
    function add(midi) { st.notes.push({ midi, w: 1 }); if (st.notes.length > 400) st.notes.shift(); st.open = 0; draw(); }
    const fb = Fretboard({ label: 'Guitar neck: tap notes to add them', onTap: (si, f) => {
      const m = E.STRINGS[si].midi + f;
      A.ensure(); A.fresh(); A.note(m, A.now() + 0.01, 0.75, 1.2);
      add(m);
    } });

    function draw() {
      // what was played: each pitch class and how often
      inCard.innerHTML = '';
      inCard.append(h('div', { class: 'spread' }, mic.el));
      const counts = new Map();
      st.notes.forEach(n => { const p = pcOf(n.midi); counts.set(p, (counts.get(p) || 0) + 1); });
      const max = Math.max(1, ...counts.values());
      inCard.append(h('h3', { text: st.notes.length ? 'Notes so far · ' + counts.size + ' different, ' + st.notes.length + ' played' : 'Play or tap some notes' }),
        st.notes.length ? h('div', { class: 'wi-pcs' }, [...Array(12).keys()].filter(p => counts.has(p)).map(p => h('span', { class: 'wi-pc', style: { '--w': (counts.get(p) / max).toFixed(2) } }, h('b', { text: D.NOTE_NAMES[p] }), h('span', { class: 'mono small', text: '×' + counts.get(p) }))))
          : h('p', { class: 'muted', text: 'Play a phrase in one key, or run up and down a scale. Five or more different notes tell the scales apart; the note you come home to tells the tonic.' }),
        h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Home note (tonic)' }),
          h('div', { class: 'chips' }, h('button', { class: 'chip', 'aria-pressed': String(st.tonic === null), onclick: () => { st.tonic = null; st.open = 0; draw(); } }, 'Auto'),
            D.NOTE_NAMES.map((n, i) => h('button', { class: 'chip', 'aria-pressed': String(st.tonic === i), onclick: () => { st.tonic = i; st.open = 0; draw(); } }, n)))),
        st.notes.length ? h('div', { class: 'row' },
          h('button', { class: 'btn ghost small', onclick: () => { st.notes.pop(); st.open = 0; draw(); } }, 'Undo last'),
          h('button', { class: 'btn ghost small', onclick: () => { st.notes = []; st.open = 0; draw(); } }, 'Start again')) : '');

      outCard.innerHTML = '';
      fb.clear();
      if (counts.size < 3) {
        outCard.append(h('p', { class: 'muted', text: counts.size ? 'A few more notes, please: three or more different ones.' : 'The scales that fit will show here.' }));
        return;
      }
      const all = findScales(st.notes, { list: scaleList(), tonic: st.tonic });
      // one entry per scale and tonic; the top ten
      const top = all.slice(0, 10);
      const r = top[st.open] || top[0];
      const sc = r.scale, flats = keyPrefersFlats(r.tonic, minorish(sc.steps));
      const names = sc.steps.map(x => stepName(r.tonic, x, flats));
      outCard.append(...[h('span', { class: 'eyebrow', text: st.open ? 'Also fits' : 'Best fit' }),
        h('div', { class: 'wi-big', text: spell(r.tonic, flats) + ' ' + sc.name }),
        h('p', { class: 'wi-sub', text: [sc.aka, ...(sc.more || [])].filter(Boolean).join(' · ') }),
        h('div', { class: 'wi-tones' }, names.map((n, i) => h('span', { class: 'wi-tone' + (r.missing.includes(sc.steps[i]) ? ' off' : '') }, h('b', { text: n }), h('span', { text: i === 0 ? 'home' : Number.isInteger(sc.steps[i]) ? degreeLabel(sc.steps[i]) : degreeLabel(Math.ceil(sc.steps[i])) + '¼♭' })))),
        h('p', { class: 'small', text: sc.region + '. ' + sc.note }),
        r.missing.length ? h('p', { class: 'small muted', text: 'Not played yet: ' + r.missing.map(x => stepName(r.tonic, x, flats)).join(', ') + '. Play ' + (r.missing.length > 1 ? 'them' : 'it') + ' to make sure.' }) : null,
        r.outside.length ? h('p', { class: 'small muted', text: 'Outside this scale: ' + r.outside.map(p => (Number.isInteger(p) ? spell(p, flats) : spell(Math.ceil(p), flats) + '¼♭')).join(', ') + ' (a passing note, or another scale).' }) : null,
        r.same.length ? h('p', { class: 'small muted', text: 'The same notes from another home: ' + r.same.map(x => spell(x.tonic, keyPrefersFlats(x.tonic, minorish(x.scale.steps))) + ' ' + x.scale.name).join(' · ') + '.' }) : null].filter(Boolean));
      const regs = (sc.styles || []).map(id => D.REGIONS.find(g => g.id === id)).filter(Boolean);
      if (regs.length) outCard.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Heard in' }), h('div', { class: 'chips' }, regs.map(g => h('button', { class: 'chip', onclick: () => stylePage(g) }, g.name)))));
      outCard.append(h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: () => {
          A.ensure(); A.fresh();
          const base = 52 + ((r.tonic - 52) % 12 + 12) % 12, t0 = A.now() + 0.05;
          [...sc.steps, 12].forEach((x, i) => A.note(base + x, t0 + i * 0.32, 0.7, 0.6, { detune: Number.isInteger(x) ? 0 : (x - Math.round(x)) * 100 }));
        } }, '▶ Hear the scale'),
        sc.app ? h('button', { class: 'btn ghost', onclick: () => openTool('explorer', { params: { mode: 'scale', scale: sc.id, root: r.tonic }, returnTab: 'train' }) }, 'See it on the whole neck') : null));
      if (top.length > 1) outCard.append(h('div', { class: 'stack wi-also' }, h('span', { class: 'eyebrow', text: 'Other scales that fit' }),
        h('div', { class: 'wi-list' }, top.map((x, i) => i === st.open ? null : h('button', { class: 'wi-row', onclick: () => { st.open = i; draw(); } },
          h('b', { text: spell(x.tonic, keyPrefersFlats(x.tonic, minorish(x.scale.steps))) + ' ' + x.scale.name }),
          h('span', { class: 'small muted', text: x.scale.region + (x.missing.length ? ' · ' + x.missing.length + ' not played' : '') + (x.outside.length ? ' · ' + x.outside.length + ' outside' : '') }))))));
      // the scale on the neck, home notes filled
      const pcs = sc.steps.filter(Number.isInteger).map(x => pcOf(r.tonic + x));
      fb.mark(positionsOfPc(pcs, 12, p => (p === r.tonic ? 'root' : 'tone')));
    }
    neckCard.append(h('h3', { text: 'Or tap notes on the neck' }), h('p', { class: 'small muted', text: 'Each tap adds a note. The neck shows the best scale’s notes, with the home note filled.' }), fb.el);
    draw();
    return () => { keepAwake(false, 'whatscale'); mic.cleanup(); };
  }
});
