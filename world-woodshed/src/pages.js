import D from './data.js';
import E from './engine.js';
import { view, h, s, toast, bar, ui, go, TOOLS, openTool, startPlacement, PAGES, Fretboard } from './ui/core.js';
import { regionPage } from './tools/atlas.js';
import { heardCount, nextRecording, lessonPage } from './tools/learn.js';
import { ribbon, awayButton } from './ui/routine.js';
import { startSession, runCurrent } from './ui/session.js';
import { BLOCKS, blockTitle, totalOf, fmtMin } from './routines.js';
import { micSettingsCard } from './ui/mic.js';
import Cur from './curriculum.js';
import { smartPlanner, learningPrefsCard } from './ui/smart.js';

/* ======================================================
   PAGES
   ====================================================== */
function toolTile(id, extra) {
  const t = TOOLS[id];
  const m = t.skill && E.SKILLS[t.skill] ? Math.round(E.mastery(t.skill)) : null;
  return h('button', { class: 'tile', onclick: () => openTool(id, extra || {}) }, h('span', { class: 't-title', text: t.title }), h('span', { class: 't-desc', text: t.desc }), h('span', { class: 't-meter', text: m !== null ? m + '%' : '' }));
}
const TRAIN = {
  ear: { name: 'Ear', title: 'Hear it before you play it', tools: ['intervals', 'degrees', 'dictation', 'chords', 'progressions', 'scales', 'drone'], tip: 'No sound on an iPhone? Turn off silent mode; it mutes web audio.' },
  rhythm: { name: 'Rhythm', title: 'Time, feel and the world\'s cycles', tools: ['rhythms', 'gym', 'rhythmid', 'clock', 'metronome'], tip: 'Run the tap calibration in Metronome once per device, especially with Bluetooth headphones. Timing tests use taps on the screen or the space bar.' },
  play: { name: 'Guitar', title: 'From the ear to the hands', tools: ['scalewarm', 'technique', 'drill', 'sightread', 'fretboard', 'callresp', 'repertoire', 'explorer'], tip: 'Scale warm-up and Technique ladders raise the tempo only when you play clean. Be honest with yourself.' },
  away: { name: 'No guitar', title: 'Practice without the instrument', tools: ['away', 'sightread', 'intervals', 'degrees', 'rhythms', 'fretboard', 'listening', 'lesson'], tip: 'Ear training, rhythm taps, fretboard quizzes, theory and listening all work with just the phone. Any routine can also run in no-guitar mode from the Routine tab.' }
};
function greeting() { const hr = new Date().getHours(); return hr < 5 ? 'Late session' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'; }

Object.assign(PAGES, {
  today() {
    const st = E.state;
    const days = E.lastNDays(14), week = days.slice(-7);
    const wkMin = week.reduce((a, d) => a + d.min, 0), wkQ = week.reduce((a, d) => a + d.q, 0), wkC = week.reduce((a, d) => a + d.c, 0);
    const d = new Date();
    const lessonsDone = D.LESSONS.filter(l => E.lessonDone(l.id)).length;
    const heardAll = D.REGIONS.reduce((a, r) => a + heardCount(r), 0);
    view.append(h('div', { class: 'hero today-hero' },
      h('span', { class: 'eyebrow', text: d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) }),
      h('h1', { text: greeting() + '. Time to play.' }),
      h('div', { class: 'heromet' },
        h('div', {}, h('b', { class: 'mono', text: E.streak() }), h('span', { text: 'day streak' })),
        h('div', {}, h('b', { class: 'mono', text: fmtMin(wkMin) }), h('span', { text: 'this week' })),
        h('div', {}, h('b', { class: 'mono', text: lessonsDone + '/' + D.LESSONS.length }), h('span', { text: 'lessons' })),
        h('div', {}, h('b', { class: 'mono', text: heardAll }), h('span', { text: 'records heard' })))));

    // practice now
    const ses = E.session();
    const pc = h('div', { class: 'card practice-card' });
    if (ses) {
      const b = ses.blocks[ses.idx];
      pc.append(h('div', { class: 'spread' }, h('div', { class: 'stack', style: { gap: '2px' } }, h('span', { class: 'eyebrow', text: 'Session in progress' }), h('h2', { text: ses.name })), h('span', { class: 'mono small muted', text: 'Block ' + (ses.idx + 1) + ' of ' + ses.blocks.length })),
        ribbon(ses.blocks, { small: true, state: (x, i) => (x.done ? 'done' : '') + (i === ses.idx ? ' now' : '') }),
        h('div', { class: 'row' }, h('button', { class: 'btn brass big', onclick: () => runCurrent() }, '▶ Resume: ' + (b ? blockTitle(b) : 'finish')), h('button', { class: 'btn ghost', onclick: () => go('routine') }, 'See the plan')));
    } else {
      // the smart plan is the main way in; a custom routine is one tap away
      pc.className = 'stack';
      if (!st.settings.prefsDismissed) pc.append(learningPrefsCard({ compact: true, dismiss: () => { E.setSetting('prefsDismissed', true); } }));
      pc.append(smartPlanner({ compact: true }));
      const aid = E.activeRoutineId();
      const r = aid !== 'smart' ? E.getRoutine(aid) : null;
      if (r) pc.append(h('div', { class: 'card slim' }, h('div', { class: 'spread' },
        h('div', { class: 'stack', style: { gap: '2px' } }, h('span', { class: 'eyebrow', text: 'Or run your routine' }), h('b', { text: r.name + ' · ' + fmtMin(totalOf(r.blocks)) })),
        h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => startSession(r) }, '▶ Start'), awayButton(r, 'btn small ghost'))), ribbon(r.blocks, { small: true })));
    }
    view.append(pc);

    if (!st.placementDone) {
      view.append(h('div', { class: 'card' }, h('h2', { text: 'Find your level first' }),
        h('p', { text: 'A 12-minute placement test samples every skill: intervals, chords, degrees, world scales, the fretboard, time feel, clave and world music knowledge. It sets your starting point so plans skip what you already know.' }),
        h('div', { class: 'row' }, h('button', { class: 'btn brass', onclick: startPlacement }, 'Start placement test'), h('button', { class: 'btn small ghost', onclick: () => { E.finishPlacement(); } }, 'Skip and start from the basics'))));
    }

    // next up: style of the week + course
    const rw = E.regionOfWeek();
    const rec = nextRecording(rw);
    const nl = D.LESSONS.find(l => !E.lessonDone(l.id));
    view.append(h('div', { class: 'duo' },
      h('div', { class: 'card nextcard area-' + rw.area.toLowerCase().replace(/[^a-z]+/g, '-') },
        h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Style of the week' }), h('span', { class: 'mono small', text: Math.round(E.regionScore(rw) * 100) + '%' })),
        h('h2', { text: rw.name }), h('p', { class: 'small', text: rw.summary }),
        rec ? h('div', { class: 'callout' }, h('span', { class: 'eyebrow', text: 'Next to hear' }), h('b', { text: rec.work }), h('span', { class: 'small', text: rec.artist + ' · ' + rec.year })) : null,
        h('div', { class: 'row' }, h('button', { class: 'btn small brass', onclick: () => openTool('listening', { params: { region: rw.id }, returnTab: 'today' }) }, '▶ Listen'), h('button', { class: 'btn small', onclick: () => regionPage(rw) }, 'Explore'), h('button', { class: 'btn small ghost', onclick: () => go('learn', 'styles') }, 'Pick another'))),
      h('div', { class: 'card nextcard' },
        h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Theory course' }), h('span', { class: 'mono small', text: lessonsDone + '/' + D.LESSONS.length })),
        nl ? h('h2', { text: nl.title }) : h('h2', { text: 'Course complete' }),
        nl ? h('p', { class: 'small', text: nl.summary }) : h('p', { class: 'small', text: 'Revisit any lesson from the Learn tab.' }),
        bar(100 * lessonsDone / D.LESSONS.length, 'brass'),
        h('div', { class: 'row' }, nl ? h('button', { class: 'btn small brass', onclick: () => lessonPage(nl) }, (lessonsDone ? 'Continue' : 'Start') + ' · ' + nl.minutes + ' min') : null, h('button', { class: 'btn small ghost', onclick: () => go('learn', 'theory') }, 'All lessons')))));

    // Progress
    const prog = h('div', { class: 'card' });
    prog.append(h('h2', { text: 'Progress' }));
    prog.append(h('div', { class: 'stats' },
      h('div', { class: 'stat' }, h('b', { class: 'mono', text: wkMin }), h('span', { text: 'minutes, last 7 days' })),
      h('div', { class: 'stat' }, h('b', { class: 'mono', text: wkQ }), h('span', { text: 'answers, last 7 days' })),
      h('div', { class: 'stat' }, h('b', { class: 'mono', text: wkQ ? Math.round(100 * wkC / wkQ) + '%' : '—' }), h('span', { text: 'accuracy' })),
      h('div', { class: 'stat' }, h('b', { class: 'mono', text: E.streak() }), h('span', { text: 'day streak' }))));
    prog.append(dayChart(days), heatmap());
    Object.entries(E.CAT_NAMES).forEach(([cat, name]) => {
      const ks = Object.keys(E.SKILLS).filter(k => E.SKILLS[k].cat === cat);
      const sec = h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: name }));
      ks.forEach(k => {
        const m = Math.round(E.mastery(k)), tr = E.trend(k);
        const due = k !== 'technique' ? E.dueCount(k) : 0, lp = k !== 'technique' ? E.levelProgress(k) : null;
        sec.append(h('button', { class: 'tile', style: { gridTemplateColumns: '1fr' }, onclick: () => openTool(E.SKILLS[k].tool, { returnTab: 'today' }) },
          h('div', { class: 'skillrow' }, h('span', {}, E.SKILLS[k].name + (k !== 'technique' ? ' · level ' + E.unlockedTier(k) : ''), due ? h('span', { class: 'badge brass', text: due + ' due' }) : ''), h('span', { class: 'mono', style: { textAlign: 'right' }, text: m + '%' }),
            h('span', { class: 'mono small ' + (tr > 0 ? 'trend-up' : tr < 0 ? 'trend-down' : 'muted'), style: { textAlign: 'right' }, text: tr === null ? '' : (tr > 0 ? '+' : '') + Math.round(tr) }), bar(m)),
          lp && E.skillState(k).last ? h('span', { class: 'small muted', text: lp.text }) : ''));
      });
      prog.append(sec);
    });
    view.append(prog);

    const weak = E.weakItems(6), conf = E.confusions(4);
    if (weak.length || conf.length) {
      const wc = h('div', { class: 'card' }, h('h2', { text: 'Weak spots' }), h('p', { class: 'small muted', text: 'Lowest-scoring items you have tried at least twice. The smart plan and the drills serve these more often.' }));
      weak.forEach(w => wc.append(h('div', { class: 'skillrow' }, h('span', { text: w.label }), h('span', { class: 'mono', style: { textAlign: 'right' }, text: Math.round(w.ema * 100) + '%' }), h('span', { class: 'small muted', text: E.SKILLS[w.skill].name.split(' ')[0] }), bar(w.ema * 100, 'brass'))));
      if (conf.length) {
        wc.append(h('h3', { text: 'Most confused' }));
        wc.append(h('ul', { class: 'list' }, conf.map(c => h('li', { class: 'confrow' }, h('span', { text: c.la + ' heard as ' + c.lb + ' (' + c.count + '×)' }),
          CONTRAST_SKILLS.includes(c.skill) ? h('button', { class: 'btn small', onclick: () => openTool(E.SKILLS[c.skill].tool, { params: { contrast: [c.a, c.b] }, returnTab: 'today' }) }, 'Drill these two →') : ''))));
        wc.append(h('p', { class: 'small muted', text: 'A contrast drill plays only the two you mix up, back and forth, so your ear learns the difference before they go back into the mix.' }));
      }
      view.append(wc);
    }

    const jr = E.journal().slice(0, 5);
    if (jr.length) {
      view.append(h('div', { class: 'card' }, h('h2', { text: 'Practice journal' }),
        h('div', { class: 'stack' }, jr.map(j => h('div', { class: 'jrow' },
          h('div', { class: 'spread' }, h('b', { text: j.name }), h('span', { class: 'mono small muted', text: new Date(j.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' + fmtMin(j.sec / 60) + ' · ' + j.done + '/' + j.total + ' blocks' })),
          j.note ? h('p', { class: 'small', text: j.note }) : null)))));
    }

    const danger = h('div', { class: 'card' });
    danger.append(h('div', { class: 'spread' }, h('span', { class: 'small muted', text: E.storageNote() + '. Timing correction: ' + (st.settings.latencyMs || 0) + ' ms.' }),
      h('button', { class: 'btn small ghost', onclick: () => {
        const c = h('div', { class: 'confirm' }, h('b', { text: 'Erase all progress?' }), h('span', { class: 'small', text: 'This clears every score, routine and setting. It cannot be undone.' }),
          h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => c.remove() }, 'Keep my progress'), h('button', { class: 'btn small danger', onclick: () => { E.resetAll(); toast('Progress erased'); } }, 'Erase everything')));
        danger.append(c);
      } }, 'Reset progress')));
    view.append(backupCard(), danger);
  },
  train() {
    const sec = TRAIN[ui.section.train] ? ui.section.train : 'ear';
    const t = TRAIN[sec];
    view.append(h('div', { class: 'pagehead' }, h('span', { class: 'eyebrow', text: 'Train' }), h('h1', { text: t.title })));
    view.append(h('div', { class: 'seg big' }, Object.entries(TRAIN).map(([k, x]) => h('button', { 'aria-pressed': k === sec ? 'true' : 'false', onclick: () => go('train', k) }, x.name))));
    view.append(h('div', { class: 'tools' }, t.tools.map(id => toolTile(id, { returnTab: 'train' }))));
    view.append(h('p', { class: 'small muted', text: t.tip }));
    view.append(guitarCard(), micSettingsCard());
  }
});

const CONTRAST_SKILLS = ['intervals', 'chords', 'degrees', 'scales', 'rhythmId'];
/* Six months of practice at a glance: one square per day, darker for longer */
function heatmap() {
  const weeks = 26, cell = 13, gap = 3, padL = 22, padT = 16;
  const end = new Date(); end.setHours(12, 0, 0, 0);
  const start = new Date(end); start.setDate(end.getDate() - (weeks * 7 - 1));
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // back to a Monday
  const W = padL + weeks * (cell + gap) + 2, Hh = padT + 7 * (cell + gap);
  const svg = s('svg', { viewBox: `0 0 ${W} ${Hh}`, class: 'heatmap', role: 'img', 'aria-label': 'Practice per day over the last six months' });
  ['Mon', '', 'Wed', '', 'Fri', '', ''].forEach((t, i) => t && svg.append(s('text', { x: 0, y: padT + i * (cell + gap) + cell - 2 }, t)));
  let days = 0, total = 0, lastMonth = -1;
  for (let w = 0; w < weeks + 1; w++) for (let d = 0; d < 7; d++) {
    const dt = new Date(start); dt.setDate(start.getDate() + w * 7 + d);
    if (dt > end) continue;
    const hrec = E.state.history[E.dayKey(dt.getTime())], min = hrec ? Math.round(hrec.sec / 60) : 0, q = hrec ? hrec.q : 0;
    const lvl = min >= 45 ? 4 : min >= 20 ? 3 : min >= 8 ? 2 : (min > 0 || q > 0) ? 1 : 0;
    if (lvl) { days++; total += min; }
    const x = padL + w * (cell + gap), y = padT + d * (cell + gap);
    if (d === 0 && dt.getMonth() !== lastMonth) { lastMonth = dt.getMonth(); svg.append(s('text', { x, y: 10 }, dt.toLocaleDateString(undefined, { month: 'short' }))); }
    const r = s('rect', { class: 'hm l' + lvl, x, y, width: cell, height: cell, rx: 3 });
    r.append(s('title', {}, dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) + ': ' + (min ? min + ' min' : q ? q + ' answers' : 'no practice')));
    svg.append(r);
  }
  const scroller = h('div', { class: 'heatscroll' }, svg);
  requestAnimationFrame(() => { scroller.scrollLeft = scroller.scrollWidth; }); // the latest weeks first on a narrow screen
  return h('div', { class: 'stack heatwrap' }, h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Six months' }), h('span', { class: 'small muted', text: days + ' day' + (days === 1 ? '' : 's') + ' practised · ' + fmtMin(total) })), scroller);
}
function dayChart(days) {
  const W = 640, Hh = 160, padL = 30, padB = 22, padT = 12;
  const maxMin = Math.max(30, ...days.map(d => d.min));
  const top = Math.ceil(maxMin / 15) * 15;
  const svg = s('svg', { viewBox: `0 0 ${W} ${Hh}`, class: 'chart', role: 'img', 'aria-label': 'Minutes practiced per day for 14 days, with accuracy line' });
  const ih = Hh - padB - padT, iw = W - padL - 30;
  const y = v => padT + ih - (v / top) * ih;
  [0, top / 2, top].forEach(v => { svg.append(s('line', { class: 'grid', x1: padL, x2: W - 30, y1: y(v), y2: y(v) }), s('text', { x: padL - 5, y: y(v) + 3, 'text-anchor': 'end' }, Math.round(v))); });
  svg.append(s('text', { x: padL - 5, y: padT - 2, 'text-anchor': 'end' }, 'min'), s('text', { x: W - 4, y: padT - 2, 'text-anchor': 'end' }, 'acc'));
  const bw = iw / days.length;
  const pts = [];
  days.forEach((d, i) => {
    const x = padL + i * bw;
    if (d.min > 0) svg.append(s('rect', { class: 'barfill', x: x + 3, y: y(d.min), width: Math.max(2, bw - 6), height: Math.max(1, y(0) - y(d.min)), rx: 2 }));
    if (i % 2 === (days.length - 1) % 2) svg.append(s('text', { x: x + bw / 2, y: Hh - 6, 'text-anchor': 'middle' }, d.date.getDate()));
    if (d.acc !== null) pts.push([x + bw / 2, padT + ih - d.acc * ih]);
  });
  [0, 0.5, 1].forEach(v => svg.append(s('text', { x: W - 4, y: padT + ih - v * ih + 3, 'text-anchor': 'end' }, Math.round(v * 100) + '%')));
  if (pts.length > 1) svg.append(s('polyline', { class: 'accline', points: pts.map(p => p.join(',')).join(' ') }));
  pts.forEach(p => svg.append(s('circle', { class: 'accdot', cx: p[0], cy: p[1], r: 3 })));
  const wrap = h('div', { class: 'stack' }, svg, h('p', { class: 'small muted', text: 'Bars: minutes per day. Gold line: accuracy on days you answered questions.' }));
  return wrap;
}

/* Your guitar: tuning, capo and left-handed fretboard, used by every tool that shows the neck */
function guitarCard() {
  const card = h('div', { class: 'card guitar-card' });
  function draw() {
    card.innerHTML = '';
    const g = E.guitar(), names = E.STRINGS.map(x => x.name);
    const sel = h('select', { id: 'g-tuning', onchange: () => { E.setGuitar({ tuning: sel.value }); draw(); } },
      E.TUNINGS.map(t => h('option', { value: t.id, selected: t.id === g.tuning ? true : null, text: t.name })));
    const capo = h('select', { id: 'g-capo', onchange: () => { E.setGuitar({ capo: +capo.value }); draw(); } },
      [0, 1, 2, 3, 4, 5, 6, 7].map(n => h('option', { value: String(n), selected: n === g.capo ? true : null, text: n ? 'Fret ' + n : 'No capo' })));
    const fb = Fretboard({ label: 'Your open strings' });
    fb.mark(E.STRINGS.map((st, i) => ({ s: i, f: 0, kind: i === 0 ? 'root' : 'tone', label: names[i].replace(/^(low|high) /, '') })));
    card.append(h('div', { class: 'spread' }, h('h3', { text: 'Your guitar' }), h('span', { class: 'small muted', text: names.map(n => n.replace(/^(low|high) /, '')).join(' ') + (g.capo ? ' · capo ' + g.capo : '') })),
      h('p', { class: 'small muted', text: 'Every fretboard, scale position and fretboard answer follows these. With a capo, fret numbers count from the capo.' }),
      h('div', { class: 'formgrid' },
        h('label', { class: 'stack field', for: 'g-tuning' }, h('span', { class: 'eyebrow', text: 'Tuning' }), sel),
        h('label', { class: 'stack field', for: 'g-capo' }, h('span', { class: 'eyebrow', text: 'Capo' }), capo)),
      h('label', { class: 'check small' }, h('input', { type: 'checkbox', checked: g.lefty ? true : null, onchange: e => { E.setGuitar({ lefty: e.target.checked }); draw(); } }), 'Left-handed: show the neck mirrored, nut on the right'),
      h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Note names' }),
        h('div', { class: 'seg' }, [['letters', 'C D E'], ['solfege', 'Do Re Mi … Si'], ['solfegeTi', 'Do Re Mi … Ti']].map(([k, t]) => h('button', { 'aria-pressed': (E.state.settings.noteNames || 'letters') === k ? 'true' : 'false', onclick: () => { E.setGuitar({ noteNames: k }); draw(); } }, t))),
        h('span', { class: 'small muted', text: 'Used for notes on the neck, the tuner and answers. Chord symbols stay in letters, as charts write them.' })),
      fb.el);
  }
  draw();
  return card;
}

/* Your progress on every device: a sync file that merges (nothing practised on either device is lost),
   an exact restore, and live sync when the app runs inside claude.ai */
function backupCard() {
  const card = h('div', { class: 'card sync-card' });
  const fileFor = () => {
    const json = JSON.stringify(E.exportBackup());
    return new File([json], 'world-woodshed-sync-' + E.dayKey() + '.json', { type: 'application/json' });
  };
  const download = f => {
    const a = h('a', { href: URL.createObjectURL(f), download: f.name });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const send = async () => {
    const f = fileFor();
    try {
      if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: 'World Woodshed progress' }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    download(f); toast('Saved ' + f.name + '. Send it to your other device and load it there.');
  };
  const reader = mode => {
    const inp = h('input', { type: 'file', accept: '.json,application/json', hidden: true, onchange: async () => {
      const f = inp.files[0]; inp.value = '';
      if (!f) return;
      try {
        const obj = JSON.parse(await f.text());
        if (mode === 'replace' && !confirm('Replace everything on this device with that file? Practice done here since it was saved will be lost.')) return;
        const changed = E.importBackup(obj, mode);
        toast(mode === 'replace' ? 'Restored from the file' : changed ? 'Merged: progress from both devices is kept' : 'Already up to date: nothing new in that file');
        go('today');
      } catch (e) { toast(e.message && e.message.includes('backup') ? e.message : 'Could not read that file'); }
    } });
    card.append(inp);
    return inp;
  };
  const mergeIn = reader('merge'), replaceIn = reader('replace');
  const cloud = E.cloudOn();
  card.append(
    h('div', { class: 'spread' }, h('h3', { text: 'Your progress on every device' }), h('span', { class: 'badge' + (cloud ? ' brass' : ''), text: E.storageNote() })),
    h('p', { class: 'small', text: cloud
      ? 'Progress syncs to your account by itself: open the app on your phone while signed in and it picks up where you left off, and practice on either device is merged.'
      : 'Progress is saved on this device. To carry on on your phone (or another computer), send it a sync file and load it there. Loading merges instead of overwriting: practice done on either device is kept, so you can go back and forth and sync whenever you like.' }),
    h('div', { class: 'row' },
      h('button', { class: 'btn brass small', onclick: send }, 'Send my progress'),
      h('button', { class: 'btn small', onclick: () => mergeIn.click() }, 'Load a sync file')),
    h('details', { class: 'small' }, h('summary', { text: 'How to set up your Android phone' }),
      h('ol', { class: 'list small' },
        h('li', { text: 'On the phone, open the app’s web address in Chrome and choose ⋮ → Add to Home screen (or Install app). It then works offline like an app.' }),
        h('li', { text: 'Here, tap “Send my progress”. Share it to yourself (Drive, email, a chat with yourself, Nearby Share), or save the file and copy it over.' }),
        h('li', { text: 'On the phone, open the app, go to Today → “Load a sync file”, and pick that file.' }),
        h('li', { text: 'Later, sync the other way the same way. Each load merges, so nothing is lost; mic and audio latency stay set per device.' }))),
    h('details', { class: 'small' }, h('summary', { text: 'Restore a backup exactly' }),
      h('p', { class: 'small muted', text: 'Replaces this device’s progress with the file as it was saved, instead of merging.' }),
      h('button', { class: 'btn small ghost', onclick: () => replaceIn.click() }, 'Restore from a file…')));
  return card;
}
