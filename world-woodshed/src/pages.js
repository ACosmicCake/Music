import D from './data.js';
import E from './engine.js';
import { view, h, s, toast, bar, ui, go, TOOLS, openTool, runBlock, startRoutine, startPlacement, PAGES } from './ui/core.js';
import { regionPage } from './tools/atlas.js';

/* ======================================================
   PAGES
   ====================================================== */
function toolTile(id, extra) {
  const t = TOOLS[id];
  const m = t.skill ? Math.round(E.mastery(t.skill)) : null;
  return h('button', { class: 'tile', onclick: () => openTool(id, extra || {}) }, h('span', { class: 't-title', text: t.title }), h('span', { class: 't-desc', text: t.desc }), h('span', { class: 't-meter', text: m !== null ? m + '%' : '' }));
}
Object.assign(PAGES, {
  today() {
    const st = E.state;
    const days = E.lastNDays(14), week = days.slice(-7);
    const wkMin = week.reduce((a, d) => a + d.min, 0), wkQ = week.reduce((a, d) => a + d.q, 0), wkC = week.reduce((a, d) => a + d.c, 0);
    const d = new Date();
    view.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) }), h('h1', { text: 'Today in the woodshed' })));

    if (!st.placementDone) {
      view.append(h('div', { class: 'card' }, h('h2', { text: 'Find your level first' }),
        h('p', { text: 'A 12-minute placement test samples every skill: intervals, chords, degrees, world scales, the fretboard, time feel, clave and world music knowledge. It sets your starting point so routines skip what you already know.' }),
        h('div', { class: 'row' }, h('button', { class: 'btn brass', onclick: startPlacement }, 'Start placement test'), h('button', { class: 'btn small ghost', onclick: () => { E.finishPlacement(); } }, 'Skip and start from the basics'))));
    }

    const r = E.routineToday();
    const rw = E.regionOfWeek();
    const routineCard = h('div', { class: 'card' });
    if (r) {
      const nextB = r.blocks.find(b => !b.done);
      const doneN = r.blocks.filter(b => b.done).length;
      routineCard.append(h('div', { class: 'spread' }, h('h2', { text: "Today's routine" }), h('span', { class: 'mono small muted', text: r.minutes + ' min · ' + E.FOCUS[r.focus].name })));
      routineCard.append(bar(100 * doneN / r.blocks.length, 'brass'));
      const list = h('div');
      r.blocks.forEach((b, i) => {
        const isNext = b === nextB;
        const target = b.questions ? b.questions : b.minutes * 60;
        const prog = b.questions ? (b.progress || 0) + '/' + b.questions : Math.floor((b.progress || 0) / 60) + '/' + b.minutes + ' min';
        list.append(h('div', { class: 'block' + (b.done ? ' done' : '') + (isNext ? ' next' : '') },
          h('span', { class: 'num', text: b.done ? '✓' : String(i + 1) }),
          h('div', { class: 'stack', style: { gap: '2px' } }, h('b', { text: TOOLS[b.tool].title + (b.params && b.params.exercise ? ': ' + D.EXERCISES.find(e => e.id === b.params.exercise).name : '') }), h('span', { class: 'why', text: b.reason })),
          h('div', { class: 'stack', style: { justifyItems: 'end', gap: '4px' } }, h('span', { class: 'mins', text: b.minutes + ' min' }), b.progress && !b.done ? h('span', { class: 'mins', text: prog }) : null,
            h('button', { class: 'btn small' + (isNext ? ' brass' : ''), onclick: () => { ui.plan = { kind: 'routine', blocks: r.blocks }; runBlock(b); } }, b.done ? 'Again' : isNext ? 'Start' : 'Open'))));
      });
      routineCard.append(list);
      routineCard.append(h('div', { class: 'row' }, nextB ? h('button', { class: 'btn brass', onclick: startRoutine }, doneN ? 'Continue routine' : 'Start routine') : h('b', { text: 'All blocks done today.' }),
        h('button', { class: 'btn small ghost', onclick: () => { routineCard.replaceWith(builder()); } }, 'Rebuild')));
    } else routineCard.append(...builder().children);
    view.append(routineCard);

    function builder() {
      const c = h('div', { class: 'card' });
      let minutes = st.settings.minutes || 30, focus = st.settings.focus || 'balanced';
      c.append(h('h2', { text: 'Build today\'s routine' }), h('p', { class: 'small muted', text: 'The planner weighs your weakest skills, reviews that are due, what you haven\'t touched lately and your region of the week.' }));
      const segM = h('div', { class: 'seg' });
      [15, 30, 45, 60].forEach(m => segM.append(h('button', { 'aria-pressed': m === minutes ? 'true' : 'false', onclick: e => { minutes = m; segM.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === e.currentTarget ? 'true' : 'false')); } }, m + ' min')));
      const sel = h('select', { id: 'focus-pick', 'aria-label': 'Focus' });
      Object.entries(E.FOCUS).forEach(([k, f]) => sel.append(h('option', { value: k, selected: k === focus ? true : null, text: f.name })));
      sel.onchange = () => { focus = sel.value; };
      c.append(h('div', { class: 'row' }, segM), h('label', { class: 'stack', for: 'focus-pick' }, h('span', { class: 'eyebrow', text: 'Focus' }), sel),
        h('div', { class: 'row' }, h('button', { class: 'btn brass', onclick: () => { E.makeRoutine(minutes, focus); } }, 'Build my routine')));
      return c;
    }

    view.append(h('div', { class: 'card' },
      h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Region of the week' }), h('span', { class: 'mono small', text: Math.round(E.regionScore(rw) * 100) + '%' })),
      h('h2', { text: rw.name }), h('p', { class: 'small', text: rw.summary }),
      h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => regionPage(rw) }, 'Explore ' + rw.name), h('button', { class: 'btn small ghost', onclick: () => go('atlas') }, 'Pick another'))));

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
        sec.append(h('button', { class: 'tile', style: { gridTemplateColumns: '1fr' }, onclick: () => openTool(E.SKILLS[k].tool) },
          h('div', { class: 'skillrow' }, h('span', { text: E.SKILLS[k].name + (k !== 'technique' ? ' · level ' + E.unlockedTier(k) : '') }), h('span', { class: 'mono', style: { textAlign: 'right' }, text: m + '%' }),
            h('span', { class: 'mono small ' + (tr > 0 ? 'trend-up' : tr < 0 ? 'trend-down' : 'muted'), style: { textAlign: 'right' }, text: tr === null ? '' : (tr > 0 ? '+' : '') + Math.round(tr) }), bar(m))));
      });
      prog.append(sec);
    });
    view.append(prog);

    const weak = E.weakItems(6), conf = E.confusions(4);
    if (weak.length || conf.length) {
      const wc = h('div', { class: 'card' }, h('h2', { text: 'Weak spots' }), h('p', { class: 'small muted', text: 'Lowest-scoring items you have tried at least twice. Routines and drills serve these more often.' }));
      weak.forEach(w => wc.append(h('div', { class: 'skillrow' }, h('span', { text: w.label }), h('span', { class: 'mono', style: { textAlign: 'right' }, text: Math.round(w.ema * 100) + '%' }), h('span', { class: 'small muted', text: E.SKILLS[w.skill].name.split(' ')[0] }), bar(w.ema * 100, 'brass'))));
      if (conf.length) {
        wc.append(h('h3', { text: 'Most confused' }));
        wc.append(h('ul', { class: 'list' }, conf.map(c => h('li', { text: c.la + ' heard as ' + c.lb + ' (' + c.count + '×)' }))));
      }
      view.append(wc);
    }

    const danger = h('div', { class: 'card' });
    danger.append(h('div', { class: 'spread' }, h('span', { class: 'small muted', text: E.storageNote() + '. Timing correction: ' + (st.settings.latencyMs || 0) + ' ms.' }),
      h('button', { class: 'btn small ghost', onclick: () => {
        const c = h('div', { class: 'confirm' }, h('b', { text: 'Erase all progress?' }), h('span', { class: 'small', text: 'This clears every score, routine and setting. It cannot be undone.' }),
          h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => c.remove() }, 'Keep my progress'), h('button', { class: 'btn small', style: { borderColor: 'var(--bad)', color: 'var(--bad)' }, onclick: () => { E.resetAll(); toast('Progress erased'); } }, 'Erase everything')));
        danger.append(c);
      } }, 'Reset progress')));
    view.append(backupCard(), danger);
  },
  ear() {
    view.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Ear training' }), h('h1', { text: 'Hear it before you play it' })));
    view.append(h('div', { class: 'tools' }, ['intervals', 'degrees', 'chords', 'progressions', 'scales', 'drone'].map(id => toolTile(id))));
    view.append(h('p', { class: 'small muted', text: 'No sound on an iPhone? Turn off silent mode; it mutes web audio.' }));
  },
  rhythm() {
    view.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Rhythm' }), h('h1', { text: 'Time, feel and the world\'s cycles' })));
    view.append(h('div', { class: 'tools' }, ['rhythms', 'rhythmid', 'clock', 'metronome'].map(id => toolTile(id))));
    view.append(h('p', { class: 'small muted', text: 'Tip: run the tap calibration in Metronome once per device, especially with Bluetooth headphones. Timing tests use taps on the screen or the space bar.' }));
  },
  play() {
    view.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Guitar' }), h('h1', { text: 'From the ear to the hands' })));
    view.append(h('div', { class: 'tools' }, ['fretboard', 'callresp', 'repertoire', 'technique'].map(id => toolTile(id))));
  },
  atlas() {
    const rw = E.regionOfWeek();
    view.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'World music atlas' }), h('h1', { text: 'Play music from everywhere' }),
      h('p', { class: 'muted', text: 'Each region has its rhythms, scales, guitar techniques, players to hear and a quiz. Your region of the week shapes your routines.' })));
    view.append(h('div', { class: 'tools' }, toolTile('atlasquiz')));
    const tl = h('div', { class: 'tools' });
    D.REGIONS.forEach(r => {
      const sc = Math.round(E.regionScore(r) * 100);
      tl.append(h('button', { class: 'tile', onclick: () => regionPage(r) }, h('span', { class: 't-title', text: r.name + (rw.id === r.id ? '  · this week' : '') }), h('span', { class: 't-desc', text: r.places }), h('span', { class: 't-meter', text: sc + '%' })));
    });
    view.append(tl);
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
