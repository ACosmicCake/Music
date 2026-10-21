import D from './data.js';
import E from './engine.js';
import { view, h, s, toast, bar, ui, go, TOOLS, openTool, startPlacement, PAGES } from './ui/core.js';
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
  ear: { name: 'Ear', title: 'Hear it before you play it', tools: ['intervals', 'degrees', 'chords', 'progressions', 'scales', 'drone'], tip: 'No sound on an iPhone? Turn off silent mode; it mutes web audio.' },
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
    prog.append(dayChart(days));
    Object.entries(E.CAT_NAMES).forEach(([cat, name]) => {
      const ks = Object.keys(E.SKILLS).filter(k => E.SKILLS[k].cat === cat);
      const sec = h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: name }));
      ks.forEach(k => {
        const m = Math.round(E.mastery(k)), tr = E.trend(k);
        sec.append(h('button', { class: 'tile', style: { gridTemplateColumns: '1fr' }, onclick: () => openTool(E.SKILLS[k].tool, { returnTab: 'today' }) },
          h('div', { class: 'skillrow' }, h('span', { text: E.SKILLS[k].name + (k !== 'technique' ? ' · level ' + E.unlockedTier(k) : '') }), h('span', { class: 'mono', style: { textAlign: 'right' }, text: m + '%' }),
            h('span', { class: 'mono small ' + (tr > 0 ? 'trend-up' : tr < 0 ? 'trend-down' : 'muted'), style: { textAlign: 'right' }, text: tr === null ? '' : (tr > 0 ? '+' : '') + Math.round(tr) }), bar(m))));
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
        wc.append(h('ul', { class: 'list' }, conf.map(c => h('li', { text: c.la + ' heard as ' + c.lb + ' (' + c.count + '×)' }))));
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
    view.append(micSettingsCard());
  }
});

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

/* Backup: download progress as a file, or load one back (e.g. to move to another device) */
function backupCard() {
  const card = h('div', { class: 'card' });
  const file = h('input', { type: 'file', accept: '.json,application/json', hidden: true, onchange: async () => {
    const f = file.files[0]; file.value = '';
    if (!f) return;
    try { E.importBackup(JSON.parse(await f.text())); toast('Progress restored from backup'); go('today'); }
    catch (e) { toast(e.message.includes('backup') ? e.message : 'Could not read that file'); }
  } });
  const download = () => {
    const blob = new Blob([JSON.stringify(E.exportBackup())], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: 'world-woodshed-backup-' + E.dayKey() + '.json' });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  card.append(h('div', { class: 'spread' },
    h('div', {}, h('h3', { text: 'Backup' }), h('span', { class: 'small muted', text: 'Save your progress to a file, or load it on another device.' })),
    h('div', { class: 'row' },
      h('button', { class: 'btn small', onclick: download }, 'Export'),
      h('button', { class: 'btn small ghost', onclick: () => file.click() }, 'Import'))), file);
  return card;
}
