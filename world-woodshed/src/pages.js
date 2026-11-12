import D from './data.js';
import E from './engine.js';
import { view, h, s, toast, bar, ui, go, TOOLS, openTool, startPlacement, PAGES, noteName, isCompact, applyDisplay, teardown, renderTabs, focusView } from './ui/core.js';
import { regionPage } from './tools/atlas.js';
import { heardCount, nextRecording, lessonPage } from './tools/learn.js';
import { ribbon, awayButton } from './ui/routine.js';
import { startSession, runCurrent, discardSession } from './ui/session.js';
import { blockTitle, totalOf, fmtMin } from './routines.js';
import { micSettingsCard } from './ui/mic.js';
import Cur from './curriculum.js';
import { shareFile, isNative } from './native.js';
import { checkForUpdate as checkWebUpdate } from './pwa.js';
import { currentVersion, checkRelease } from './update.js';
import { connect as ghConnect, disconnect as ghDisconnect, syncNow as ghSyncNow, status as ghStatus, onStatus as ghOnStatus, linkSetup } from './ghsync.js';
import { decodeLink, linkUrl, qrGrid, SITE, makeCode, showCode, normCode, sendByCode, receiveByCode, CODE_MINUTES } from './linkcode.js';
import { smartPlanner, learningPrefsCard } from './ui/smart.js';
import { goalCard, applyRamp } from './ui/goal.js';
import { weekReviewCard } from './ui/weekreview.js';
import { gardenCard, impactSettingsCard } from './ui/garden.js';
import Samples from './samples.js';
import A from './audio.js';
import { VOICES } from './guitars.js';
import { SAMPLE_SOURCES } from './content/samples.js';
import * as Rem from './reminder.js';
import { statsPage, heatmap, dayChart } from './ui/stats.js';
import { tasteSettingsCard, becauseCard } from './ui/taste.js';
import { favList, withStar, repaintStars } from './ui/favs.js';
import { GYM } from './content/gym.js';
import { bestLine } from './ui/games.js';

/* ======================================================
   PAGES
   ====================================================== */
function toolTile(id, extra) {
  const t = TOOLS[id];
  let m = t.skill && E.SKILLS[t.skill] ? Math.round(E.mastery(t.skill)) : null;
  if (m === 0 && !(E.state.skills[t.skill] || {}).last) m = null; // not tried yet: no score, rather than a 0% that reads as failing
  // a game shows your high score instead
  const meter = t.game ? bestLine(t.game) : m !== null ? m + '%' : '';
  const tile = h('button', { class: 'tile' + (t.game ? ' game-tile' : ''), onclick: () => openTool(id, extra || {}) }, h('span', { class: 't-title', text: t.title }), h('span', { class: 't-desc', text: t.desc }), h('span', { class: 't-meter', text: meter }));
  return extra && extra.star ? withStar(tile, 'tool', id, t.title, extra.star) : tile;
}
/* A favourite's tile on Train → ★ Favourites: tools, Rhythm gym and technique exercises, style drills (src/ui/favs.js) */
function favTile(f, redraw) {
  const go = (tool, params, title, desc) => withStar(h('button', { class: 'tile', onclick: () => openTool(tool, { params, returnTab: 'train' }) }, h('span', { class: 't-title', text: title }), h('span', { class: 't-desc', text: desc })), f.kind, f.id, title, redraw);
  if (f.kind === 'tool') return TOOLS[f.id] ? toolTile(f.id, { returnTab: 'train', star: redraw }) : null;
  if (f.kind === 'gym') { const x = GYM.find(g => g.id === f.id); return x && TOOLS.gym ? go('gym', { ex: x.id }, x.name, 'Rhythm gym · ' + x.desc.split('. ')[0] + '.') : null; }
  if (f.kind === 'tech') { const x = D.EXERCISES.find(e => e.id === f.id); return x && TOOLS.technique ? go('technique', { exercise: x.id }, x.name, 'Technique · ' + (x.how || '').split('. ')[0]) : null; }
  if (f.kind === 'drill') { const x = D.DRILLS.find(d => d.id === f.id); return x && TOOLS.drill ? go('drill', { drill: x.id }, x.name, 'Style drill · ' + (x.goal || '')) : null; }
  return null;
}
/* Train → ★ Favourites: everything starred, grouped by kind. Unstarring a tile here takes it off the page. */
const FAV_GROUPS = [
  ['Tools', f => f.kind === 'tool' && !(TOOLS[f.id] || {}).game],
  ['Games', f => f.kind === 'tool' && !!(TOOLS[f.id] || {}).game],
  ['Rhythm gym', f => f.kind === 'gym'],
  ['Technique', f => f.kind === 'tech'],
  ['Style drills', f => f.kind === 'drill']
];
function favPage() {
  const page = h('div', { class: 'stack fav-page' });
  const draw = () => {
    page.innerHTML = '';
    const all = favList();
    FAV_GROUPS.forEach(([name, test]) => {
      const tiles = all.filter(test).map(f => favTile(f, draw)).filter(Boolean);
      if (tiles.length) page.append(h('section', { class: 'stack tool-group' }, h('h2', { class: 'eyebrow', text: name }), h('div', { class: 'tools' }, tiles)));
    });
    if (!page.childNodes.length) page.append(h('div', { class: 'card stack' }, h('h2', { text: 'Nothing starred yet' }),
      h('p', { class: 'small', text: 'Tap ☆ beside any tool or game in Train, a Rhythm gym or technique exercise, or a style drill, and it comes here, so what you practise most is one tap away. Your favourites sync to your other devices with the rest of your progress.' }),
      h('div', { class: 'row' }, Object.entries(TRAIN).filter(([k]) => k !== 'favs').map(([k, x]) => h('button', { class: 'btn small', onclick: () => go('train', k) }, x.name)))));
  };
  draw();
  return page;
}
const TRAIN = {
  favs: { name: '★', label: 'Favourites', title: 'Your favourites', favs: true, tools: [], tip: 'Stars are kept with your progress, so they follow you to every device you sync. Smart practice mixes one into most sessions, after what is due for review.' },
  ear: { name: 'Ear', title: 'Hear it before you play it', tools: ['intervals', 'degrees', 'dictation', 'chords', 'progressions', 'scales', 'drone'], tip: 'No sound on an iPhone? Turn off silent mode; it mutes web audio.' },
  rhythm: { name: 'Rhythm', title: 'Time, feel and the world\'s cycles', tools: ['rhythms', 'gym', 'rhythmid', 'clock', 'metronome'], tip: 'Run the tap calibration in Metronome once per device, especially with Bluetooth headphones. Timing tests use taps on the screen or the space bar.' },
  play: { name: 'Guitar', title: 'From the ear to the hands', tools: ['tuner', 'scalewarm', 'arpwarm', 'arpchanges', 'technique', 'drill', 'sightread', 'notenames', 'fretboard', 'callresp', 'constraint', 'repertoire', 'notate', 'recorder', 'explorer', 'whatchord', 'whatscale'],
    groups: [['Hands and the neck', ['tuner', 'scalewarm', 'arpwarm', 'arpchanges', 'technique', 'fretboard', 'explorer']], ['Name it', ['whatchord', 'whatscale']], ['Styles and tunes', ['drill', 'repertoire', 'callresp', 'constraint']], ['Reading and writing', ['sightread', 'notenames', 'notate']], ['Record yourself', ['recorder']]], tip: 'Scale warm-up and Technique ladders raise the tempo only when you play clean. Be honest with yourself.' },
  games: { name: 'Games', title: 'Practice as a game', tools: ['tower', 'lighthouse', 'firefly', 'opening', 'formgame', 'tightrope', 'twodrums', 'parrot'], tip: 'Every game counts as practice: its time goes to the skill it trains and its answers into your progress there. High scores are your own, synced to your other devices with the rest of your progress.' },
  away: { name: 'No guitar', title: 'Practice without the instrument', tools: ['commute', 'away', 'dictation', 'sightread', 'notenames', 'intervals', 'degrees', 'rhythms', 'fretboard', 'listening', 'lesson'], tip: 'Ear training, rhythm taps, fretboard quizzes, theory and listening all work with just the phone. Any routine can also run in no-guitar mode from the Routine tab.' }
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
        h('div', {}, h('b', { class: 'mono', text: fmtMin(wkMin) }), h('span', { text: 'this week' })),
        h('div', {}, h('b', { class: 'mono', text: lessonsDone + '/' + D.LESSONS.length }), h('span', { text: 'lessons' })),
        h('div', {}, h('b', { class: 'mono', text: heardAll }), h('span', { text: 'records heard' })))));

    // practice now
    const ses = E.session();
    const pc = h('div', { class: 'card practice-card' });
    if (ses) {
      const b = ses.blocks[ses.idx];
      pc.append(h('div', { class: 'spread' }, h('div', { class: 'stack', style: { gap: '2px' } }, h('span', { class: 'eyebrow', text: ses.paused ? 'Session paused' : 'Session in progress' }), h('h2', { text: ses.name })), h('span', { class: 'mono small muted', text: 'Block ' + (ses.idx + 1) + ' of ' + ses.blocks.length })),
        ribbon(ses.blocks, { small: true, state: (x, i) => (x.done ? 'done' : '') + (i === ses.idx ? ' now' : '') }),
        h('div', { class: 'row' }, h('button', { class: 'btn brass big', onclick: () => runCurrent() }, '▶ Resume: ' + (b ? blockTitle(b) : 'finish')), h('button', { class: 'btn ghost', onclick: () => go('routine') }, 'See the plan'),
          h('button', { class: 'btn ghost', onclick: () => { discardSession(); toast('Session ended'); } }, 'End it')));
    } else {
      // the smart plan is the main way in; a custom routine is one tap away
      pc.className = 'stack';
      pc.append(smartPlanner({ compact: true }));
      const aid = E.activeRoutineId();
      const r = aid !== 'smart' ? E.getRoutine(aid) : null;
      if (r) pc.append(h('div', { class: 'card slim' }, h('div', { class: 'spread' },
        h('div', { class: 'stack', style: { gap: '2px' } }, h('span', { class: 'eyebrow', text: 'Or run your routine' }), h('b', { text: r.name + ' · ' + fmtMin(totalOf(r.blocks)) })),
        h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => startSession(r) }, '▶ Start'), awayButton(r, 'btn small ghost'))), ribbon(r.blocks, { small: true })));
    }
    view.append(pc);
    // the styles to work on first: folded under the planner until opened, so the way into practice comes first
    if (!ses && !st.settings.prefsDismissed) {
      const chosen = (Cur.prefs().styles || []).map(id => (D.REGIONS.find(r => r.id === id) || {}).name).filter(Boolean);
      view.append(h('details', { class: 'foldwrap prefs-fold' }, h('summary', {}, h('span', { class: 'stack', style: { gap: '1px' } }, 'Your learning plan',
        h('span', { class: 'small muted', style: { fontFamily: 'var(--font-body)', fontWeight: 400 }, text: chosen.length ? chosen.join(', ') : 'Pick the styles to work on first' }))),
        learningPrefsCard({ compact: true, dismiss: () => { E.setSetting('prefsDismissed', true); } })));
    }
    // the daily goal and the streaks (the goal grows first, if it is time)
    applyRamp();
    view.append(goalCard());
    // every 10 hours a real tree, kelp plant or bottles collected (once the daily Action has started counting)
    view.append(gardenCard());
    // last week, from Monday until you put it away
    const review = ses ? null : weekReviewCard({ today: true });
    if (review) view.append(review);
    // drills, tunes and styles that match your favourite players and what you listen to on Spotify
    const because = becauseCard();
    if (because) view.append(because);
    // commuting: a no-guitar session or hands-free ear training (first thing in the Android app)
    const goCard = h('div', { class: 'card go-card' }, h('div', { class: 'spread' }, h('div', { class: 'stack', style: { gap: '2px' } }, h('span', { class: 'eyebrow', text: 'On the go' }), h('b', { text: 'Commuting? Headphones in, no guitar needed.' })),
      h('button', { class: 'btn brass', onclick: () => openTool('commute', { returnTab: 'today' }) }, 'Open →')),
      h('p', { class: 'small muted', text: 'A smart session sized to your ride, or hands-free ear training with the phone in your pocket.' }));
    if (isNative()) view.insertBefore(goCard, pc); else view.append(goCard);

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
      h('div', { class: 'stat' }, h('b', { class: 'mono', text: E.streaks().best }), h('span', { text: 'best streak, days' }))));
    prog.append(dayChart(days), heatmap(), h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => statsPage() }, 'All statistics →')));
    Object.entries(E.CAT_NAMES).forEach(([cat, name]) => {
      const ks = Object.keys(E.SKILLS).filter(k => E.SKILLS[k].cat === cat);
      const sec = h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: name }));
      ks.forEach(k => {
        const m = Math.round(E.mastery(k)), tr = E.trend(k);
        const due = k !== 'technique' ? E.dueCount(k) : 0, lp = k !== 'technique' ? E.levelProgress(k) : null;
        sec.append(h('button', { class: 'tile', style: { gridTemplateColumns: '1fr' }, onclick: () => openTool(E.SKILLS[k].tool, { returnTab: 'today' }) },
          h('div', { class: 'skillrow progrow' }, h('span', { class: 'sk-name' }, h('span', { text: E.SKILLS[k].name }), k !== 'technique' || due ? h('span', { class: 'sk-sub' }, k !== 'technique' ? h('span', { class: 'small muted', text: 'Level ' + E.unlockedTier(k) }) : '', due ? h('span', { class: 'badge brass', text: due + ' due' }) : '') : ''), h('span', { class: 'mono', style: { textAlign: 'right' }, text: m + '%' }),
            h('span', { class: 'mono small ' + (tr > 0 ? 'trend-up' : tr < 0 ? 'trend-down' : 'muted'), style: { textAlign: 'right' }, text: tr === null ? '' : (tr > 0 ? '+' : '') + Math.round(tr) }), bar(m)),
          lp && E.skillState(k).last ? h('span', { class: 'small muted', text: lp.text }) : ''));
      });
      prog.append(sec);
    });
    view.append(fold(prog, 'Progress'));

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
      view.append(fold(wc, 'Weak spots'));
    }

    const jr = E.journal().slice(0, 5);
    if (jr.length) {
      view.append(foldWith('Practice journal', h('div', { class: 'card' }, h('h2', { text: 'Practice journal' }),
        h('div', { class: 'stack' }, jr.map(j => h('div', { class: 'jrow' },
          h('div', { class: 'spread' }, h('b', { text: j.name }), h('span', { class: 'mono small muted', text: new Date(j.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' + fmtMin(j.sec / 60) + ' · ' + j.done + '/' + j.total + ' blocks' })),
          j.note ? h('p', { class: 'small', text: j.note }) : null))))));
    }

    view.append(settingsLink('Your guitar, display, sounds, microphone, sync and backups'));
  },
  train() {
    // with no section chosen yet, Train opens on your favourites if you have any
    const sec = TRAIN[ui.section.train] ? ui.section.train : favList().length ? 'favs' : 'ear';
    const t = TRAIN[sec];
    view.append(h('div', { class: 'pagehead' }, h('span', { class: 'eyebrow', text: 'Train' }), h('h1', { text: t.title })));
    view.append(h('div', { class: 'seg big train-seg' }, Object.entries(TRAIN).map(([k, x]) => h('button', { 'aria-pressed': k === sec ? 'true' : 'false', 'aria-label': x.label || null, title: x.label || null, onclick: () => go('train', k) }, x.name))));
    const redraw = () => repaintStars(view);
    if (t.favs) view.append(favPage());
    if (t.groups) t.groups.forEach(([name, ids]) => view.append(h('section', { class: 'stack tool-group' }, h('h2', { class: 'eyebrow', text: name }), h('div', { class: 'tools' }, ids.map(id => toolTile(id, { returnTab: 'train', star: redraw }))))));
    else if (!t.favs) view.append(h('div', { class: 'tools' }, t.tools.map(id => toolTile(id, { returnTab: 'train', star: redraw }))));
    view.append(h('p', { class: 'small muted', text: t.tip }));
    view.append(settingsLink('Your guitar (tuning, capo, left-handed), display, sounds and microphone'));
  }
});

/* Erase the progress: on this device only, or on every device when it syncs. With sync on, this device only
   also stops syncing, or the next sync would bring everything back. */
function resetConfirm() {
  const synced = ghStatus().on, account = !synced && E.cloudOn(); // account: the claude.ai copy, shared by every device signed in
  let where = 'here';
  const c = h('div', { class: 'confirm' }, h('b', { text: 'Erase all progress?' }));
  if (synced) {
    const opt = (v, label, note) => h('label', { class: 'reset-opt' },
      h('input', { type: 'radio', name: 'reset-where', value: v, checked: v === where ? true : null, onchange: () => { where = v; } }),
      h('span', {}, h('b', { text: label }), h('span', { class: 'small muted', text: ' ' + note })));
    c.append(h('span', { class: 'small', text: 'Your progress syncs with other devices. What should be erased?' }),
      opt('here', 'This device only.', 'Sync is turned off here, and your other devices and the synced copy keep everything. Connecting sync again later brings it back.'),
      opt('all', 'Every device.', 'The synced copy and each device are cleared when they next sync. Only a backup file can bring it back.'));
  } else c.append(h('span', { class: 'small', text: account ? 'This clears every score, routine and setting on every device signed in to your account. It cannot be undone.' : 'This clears every score, routine and setting. It cannot be undone.' }));
  c.append(h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => c.remove() }, 'Keep my progress'),
    h('button', { class: 'btn small danger', onclick: () => {
      if (synced && where === 'here' && ghStatus().on) ghDisconnect();
      E.resetAll(account || (synced && where === 'all'));
      if (synced && where === 'all' && ghStatus().on) ghSyncNow('reset');
      toast(synced && where === 'all' ? 'Progress erased on every device' : 'Progress erased on this device');
      c.remove();
    } }, 'Erase everything')));
  return c;
}

/* A way to Settings at the foot of a page (the gear in the top bar is the other) */
function settingsLink(what) {
  return h('button', { class: 'tile settings-link', onclick: () => settingsPage() }, h('span', { class: 't-title', text: 'Settings' }), h('span', { class: 't-desc', text: what }), h('span', { class: 't-meter', 'aria-hidden': 'true', text: '→' }));
}

/* ======================================================
   SETTINGS: everything about this device and your progress, in one place (the gear in the top bar)
   ====================================================== */
export function settingsPage() {
  const from = ui.runner ? null : ui.tab; // opened from inside a tool: Back goes to the tab, as a tool's own Back does
  teardown(); ui.runner = { id: 'settings', opts: {} }; renderTabs();
  view.innerHTML = ''; window.scrollTo(0, 0);
  const st = E.state;
  view.append(h('div', { class: 'pagehead' },
    h('div', { class: 'spread' }, h('button', { class: 'btn ghost small rh-back', onclick: () => go(from || ui.tab || 'today') }, '← Back'), h('span', { class: 'eyebrow', text: 'This device and your progress' })),
    h('h1', { text: 'Settings' })));
  const danger = h('div', { class: 'card' });
  danger.append(h('h3', { text: 'Reset progress' }), h('div', { class: 'spread' }, h('span', { class: 'small muted', text: E.storageNote() + '. Timing correction: ' + (st.settings.latencyMs || 0) + ' ms.' }),
    h('button', { class: 'btn small ghost', onclick: () => { if (!danger.querySelector('.confirm')) danger.append(resetConfirm()); } }, 'Reset progress')));
  view.append(h('div', { class: 'stack settings' },
    fold(guitarCard(), 'Your guitar'), fold(tasteSettingsCard(), 'Your music taste'), fold(displayCard(), 'Display and sounds'), fold(micSettingsCard(), 'Microphone'),
    fold(backupCard(), 'Your progress on every device'), fold(impactSettingsCard(), 'Real impact for your practice'), fold(h('div', { class: 'card' }, updateBox()), 'App updates'), fold(danger, 'Reset progress')));
  focusView();
}

const CONTRAST_SKILLS = ['intervals', 'chords', 'degrees', 'scales', 'rhythmId'];
/* A link from another device (Link another device), opened from a scanned code: Settings asks to join it */
let pendingLink = null;
export function offerLink(cfg) {
  pendingLink = cfg;
  settingsPage();
  const b = view.querySelector('.ghsync');
  if (!b) return;
  const d = b.closest('details'); if (d) d.open = true;
  b.scrollIntoView({ block: 'center' });
}
/* Automatic sync through a private GitHub repository the player owns (opt-in; the token stays on this device) */
function githubSyncBox() {
  const box = h('div', { class: 'ghsync stack' });
  let connecting = false;
  const ago = t => { if (!t) return 'not yet'; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : Math.round(m / 60) + ' h ago'; };
  const linkBox = h('div', { class: 'stack' });
  // the QR code and link that let another device join this sync without typing
  async function showLink() {
    const cfg = linkSetup();
    if (!cfg) return;
    const url = linkUrl(isNative() ? SITE : location.origin + location.pathname, cfg);
    const grid = await qrGrid(url), n = grid.length;
    let d = '';
    grid.forEach((row, y) => row.forEach((on, x) => { if (on) d += 'M' + x + ' ' + y + 'h1v1h-1z'; }));
    // a 12-digit code to type on a device with no camera (a laptop): sent encrypted through ntfy.sh
    const codeBox = h('div', { class: 'stack' });
    const codeBtn = h('button', { class: 'btn small brass' }, 'Show a code to type');
    codeBtn.onclick = async () => {
      codeBtn.disabled = true; codeBtn.textContent = 'Making a code…';
      const code = makeCode();
      try {
        await sendByCode(cfg, code);
        codeBox.innerHTML = '';
        codeBox.append(h('p', { class: 'linkcode mono', text: showCode(code) }),
          h('p', { class: 'small', text: 'On the other device, open Settings → Your progress on every device → Have a code or link from another device? and type this code. It works for ' + CODE_MINUTES + ' minutes.' }));
        codeBtn.textContent = 'New code';
      } catch (e) { codeBox.innerHTML = ''; codeBox.append(h('p', { class: 'small bad-text', text: e.message })); codeBtn.textContent = 'Show a code to type'; }
      codeBtn.disabled = false;
    };
    linkBox.innerHTML = '';
    linkBox.append(h('div', { class: 'linkqr' }, s('svg', { viewBox: '0 0 ' + n + ' ' + n, role: 'img', 'aria-label': 'QR code that links another device', 'shape-rendering': 'crispEdges' },
        s('rect', { width: n, height: n, fill: '#fff' }), s('path', { d, fill: '#000' }))),
      h('p', { class: 'small', text: 'Point the other device’s camera at this QR code: the app opens there and joins this sync. On a laptop or in the Android app, tap Show a code to type and type the code there instead.' }),
      h('p', { class: 'small bad-text', text: 'The QR code, the link and the code each let a device read and change your progress. Show them only to your own devices.' }),
      codeBox,
      h('div', { class: 'row' },
        codeBtn,
        h('button', { class: 'btn small', onclick: async () => { try { await navigator.clipboard.writeText(url); toast('Link copied'); } catch (e) { toast('Could not copy. Scan the code instead.'); } } }, 'Copy the link'),
        h('button', { class: 'btn small ghost', onclick: () => { linkBox.innerHTML = ''; } }, 'Hide')));
  }
  // join the sync another device showed (a scanned code or a pasted link)
  function joinCard(cfg) {
    const err = h('p', { class: 'small bad-text', hidden: true });
    const dev = h('input', { id: 'gh-link-dev', type: 'text', autocomplete: 'off', placeholder: isNative() ? 'Phone' : 'Laptop' });
    const join = h('button', { class: 'btn brass small' }, 'Join');
    join.onclick = async () => {
      join.disabled = true; join.textContent = 'Joining…'; err.hidden = true; connecting = true;
      try { await ghConnect({ owner: cfg.owner, repo: cfg.repo, token: cfg.token, path: cfg.path, deviceName: dev.value.trim() }); pendingLink = null; connecting = false; toast('Linked: progress now syncs by itself'); draw(); }
      catch (e) { connecting = false; err.hidden = false; err.textContent = e.message; join.disabled = false; join.textContent = 'Join'; }
    };
    box.append(h('div', { class: 'stack linkjoin' },
      h('p', { class: 'small', text: 'Join the automatic sync through ' + cfg.owner + '/' + cfg.repo + '? This device’s progress is merged with what is there; nothing practised on either side is lost.' }),
      h('label', { class: 'stack field', for: 'gh-link-dev' }, h('span', { class: 'eyebrow', text: 'This device’s name' }), dev),
      h('div', { class: 'row' }, join, h('button', { class: 'btn small ghost', onclick: () => { pendingLink = null; draw(); } }, 'Cancel')), err));
  }
  function draw() {
    box.innerHTML = '';
    const st = ghStatus();
    box.append(h('span', { class: 'eyebrow', text: 'Automatic sync' }));
    if (st.on) {
      box.append(h('p', { class: 'small', text: 'On, through ' + st.owner + '/' + st.repo + '. Last synced ' + ago(st.lastSync) + (st.busy ? ' · syncing…' : '') + '.' }),
        st.lastError ? h('p', { class: 'small bad-text', text: st.lastError }) : '',
        h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: async () => { await ghSyncNow('button'); draw(); toast(ghStatus().lastError ? 'Sync failed' : 'Synced'); } }, 'Sync now'),
          h('button', { class: 'btn small', onclick: () => showLink() }, 'Link another device'),
          h('button', { class: 'btn small ghost', onclick: () => { ghDisconnect(); draw(); toast('Automatic sync is off on this device'); } }, 'Turn off')),
        linkBox);
      if (pendingLink) { const same = pendingLink.owner === st.owner && pendingLink.repo === st.repo; pendingLink = null; toast(same ? 'This device already syncs with that repository' : 'This device already syncs. Turn it off first to join another repository.'); }
      return;
    }
    linkBox.innerHTML = ''; // the code stays open through status redraws while sync is on, never after
    if (pendingLink) { joinCard(pendingLink); return; }
    const f = (id, label, attrs) => h('label', { class: 'stack field', for: id }, h('span', { class: 'eyebrow', text: label }), h('input', Object.assign({ id, type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' }, attrs)));
    const err = h('p', { class: 'small bad-text', hidden: true });
    const go = h('button', { class: 'btn brass small' }, 'Connect');
    const form = h('div', { class: 'stack' },
      f('gh-owner', 'GitHub username', { placeholder: 'ACosmicCake' }),
      f('gh-repo', 'Private repository', { placeholder: 'woodshed-sync' }),
      f('gh-token', 'Token', { type: 'password', placeholder: 'github_pat_…' }),
      f('gh-dev', 'This device’s name', { placeholder: isNative() ? 'Phone' : 'Laptop' }),
      h('div', { class: 'row' }, go), err);
    go.onclick = async () => {
      const v = id => form.querySelector('#' + id).value.trim();
      if (!v('gh-owner') || !v('gh-repo') || !v('gh-token')) { err.hidden = false; err.textContent = 'Fill in the username, repository and token.'; return; }
      go.disabled = true; go.textContent = 'Connecting…'; err.hidden = true; connecting = true;
      try { await ghConnect({ owner: v('gh-owner'), repo: v('gh-repo'), token: v('gh-token'), deviceName: v('gh-dev') }); connecting = false; toast('Connected: progress now syncs by itself'); draw(); }
      catch (e) { connecting = false; err.hidden = false; err.textContent = e.message; go.disabled = false; go.textContent = 'Connect'; }
    };
    const paste = h('input', { id: 'gh-link', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: '4821 9375 1046', onkeydown: e => { if (e.key === 'Enter') usePaste(); } });
    const pasteErr = h('p', { class: 'small bad-text', hidden: true });
    const useBtn = h('button', { class: 'btn small brass' }, 'Use it');
    const usePaste = async () => {
      pasteErr.hidden = true;
      const code = normCode(paste.value);
      if (code) {
        useBtn.disabled = true; useBtn.textContent = 'Looking…';
        try { pendingLink = await receiveByCode(code); draw(); return; }
        catch (e) { pasteErr.hidden = false; pasteErr.textContent = e.message; useBtn.disabled = false; useBtn.textContent = 'Use it'; return; }
      }
      const c = decodeLink(paste.value);
      if (!c) { pasteErr.hidden = false; pasteErr.textContent = 'Type the 12-digit code, or paste the link, from Link another device on the device that syncs.'; return; }
      pendingLink = c; draw();
    };
    useBtn.onclick = usePaste;
    box.append(h('p', { class: 'small', text: 'Sync by itself through a private GitHub repository of your own: when the app opens, every few minutes while it is open, and shortly after you practise. It merges the same way as the sync file.' }),
      h('details', { class: 'small' }, h('summary', { text: 'Have a code or link from another device?' }),
        h('p', { class: 'small muted', text: 'On a device that already syncs, open Settings → Your progress on every device → Link another device. Scan its QR code with this device’s camera, or tap Show a code to type there and type the code here.' }),
        h('label', { class: 'stack field', for: 'gh-link' }, h('span', { class: 'eyebrow', text: 'Code or link' }), paste),
        h('div', { class: 'row' }, useBtn), pasteErr),
      h('details', { class: 'small' }, h('summary', { text: 'Set it up (about 3 minutes)' }),
        h('ol', { class: 'list small' },
          h('li', {}, 'Create a private repository, for example ', h('b', { text: 'woodshed-sync' }), ': ', h('a', { href: 'https://github.com/new', target: '_blank', rel: 'noopener' }, 'github.com/new'), ' (choose Private).'),
          h('li', {}, 'Make a token that can only touch that repository: ', h('a', { href: 'https://github.com/settings/personal-access-tokens/new', target: '_blank', rel: 'noopener' }, 'new fine-grained token'), '. Repository access: Only select repositories → that one. Permissions → Contents: Read and write. Choose an expiry, generate it and copy it.'),
          h('li', { text: 'Fill in the form below on this device and tap Connect.' }),
          h('li', { text: 'Do the same on your other device with the same repository (the same token works). From then on both stay in step.' })),
        h('p', { class: 'small muted', text: 'The token is kept only on this device, never in your progress, sync files or backups. It can read and write that one repository and nothing else. When it expires, make a new one and connect again.' }),
        form));
  }
  draw();
  const off = ghOnStatus(() => { if (!box.isConnected) { off(); return; } if (!connecting) draw(); });
  return box;
}

/* On a small screen, long cards fold to a one-line summary you can open */
function fold(card, title) {
  if (!isCompact()) return card;
  return h('details', { class: 'foldwrap' }, h('summary', {}, title), card);
}
const foldWith = (title, card) => fold(card, title);

/* Display: compact layout and text size, for this device only */
/* Sampled instruments: what there is, how big, and a button to keep them all for offline use */
function soundsSection() {
  const el = h('div', { class: 'stack' });
  const mb = b => (b / 1e6).toFixed(b < 1e7 ? 1 : 0) + ' MB';
  const total = Samples.totalBytes();
  const status = h('span', { class: 'small muted', role: 'status' });
  const btn = h('button', { class: 'btn small' }, 'Download all sounds · ' + mb(total));
  // the guitar heard everywhere: a recording or the synthesized plucked string; choosing one plays a chord in it
  const gtr = E.state.settings.guitarSound in VOICES ? E.state.settings.guitarSound : 'nylon';
  let demoFor = null; // only the last guitar chosen plays, once it has loaded, and it stops the one before
  const demo = k => { demoFor = k; const strum = () => { if (demoFor !== k) return; A.ensure(); A.fresh(); A.strum([40, 47, 52, 56, 59, 64], A.now() + 0.05, 0.75, 0.02, 1.8); }; if (VOICES[k]) Samples.load(VOICES[k]).then(strum); else strum(); };
  const gtrSeg = h('div', { class: 'seg' }, [['nylon', 'Nylon'], ['steel', 'Steel-string'], ['synth', 'Synth']].map(([k, t]) => h('button', { 'aria-pressed': String(k === gtr), onclick: e => {
    [...gtrSeg.children].forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget)));
    E.setSetting('guitarSound', k); demo(k);
  } }, t)));
  const credits = Object.values(SAMPLE_SOURCES).map(s => s.author + ' (' + s.licence.replace(/-1\.0$/, '').replace('CC-BY-', 'CC BY ') + ')').join('; ');
  el.append(h('span', { class: 'eyebrow', text: 'Guitar sound' }), gtrSeg,
    h('span', { class: 'small muted', text: 'Recorded nylon- or steel-string guitar for everything the app plays on guitar, or the lighter synthesized string.' }),
    h('span', { class: 'eyebrow', text: 'Sounds' }),
    h('span', { class: 'small muted', text: 'Recorded instruments (guitars, upright bass, piano and percussion) load the first time they play, and the synthesized sound fills in until they do. Download them now to have them all offline.' }),
    h('span', { class: 'small muted' }, 'Recordings by ' + credits + '. ', h('a', { href: (import.meta.env.BASE_URL || '/') + 'samples/LICENSES.md', target: '_blank', rel: 'noopener' }, 'Credits and licences')));
  if (isNative()) { el.append(h('span', { class: 'small', text: 'Included in the app: ' + mb(total) + '.' })); return el; }
  el.append(h('div', { class: 'row' }, btn), status);
  const show = have => {
    const all = have >= total;
    status.textContent = all ? 'All sounds are on this device.' : have ? mb(have) + ' of ' + mb(total) + ' on this device.' : '';
    btn.disabled = all ? true : null;
  };
  Samples.offlineBytes().then(show);
  btn.onclick = async () => {
    btn.disabled = true;
    const r = await Samples.downloadAll((done, all) => { status.textContent = 'Downloading… ' + Math.round(100 * done / all) + '%'; });
    if (r.failed) { status.textContent = r.failed + ' files could not be downloaded. Check the connection and try again.'; btn.disabled = null; return; }
    // with no service worker yet (the first visit), the browser's own cache is all there is
    const have = await Samples.offlineBytes();
    if (have) show(have); else status.textContent = 'Downloaded. They will be kept for offline use once the app has installed itself.';
  };
  return el;
}

/* Daily reminder (the Android app; per device): a notification at a set time on days not practised yet */
function reminderBox() {
  const box = h('div', { class: 'stack' });
  const draw = () => {
    box.innerHTML = '';
    const r = Object.assign({ on: false, time: '19:00' }, E.state.settings.reminder || {});
    box.append(h('span', { class: 'eyebrow', text: 'Daily reminder' }));
    if (!isNative()) {
      box.append(h('span', { class: 'small muted', text: 'In the Android app, a notification at the time you choose on the days you haven’t practised yet. A web page can’t show one when it is closed.' }));
      return;
    }
    const save = async patch => {
      const next = Object.assign({}, r, patch);
      if (next.on && !(await Rem.allow())) { toast('Notifications are off for this app: turn them on in Android’s settings.'); next.on = false; }
      E.setSetting('reminder', next);
      await Rem.reschedule();
      draw();
    };
    const time = h('input', { type: 'time', value: r.time, 'aria-label': 'Reminder time', disabled: r.on ? null : true, onchange: e => { if (Rem.parseTime(e.target.value)) save({ time: e.target.value }); } });
    box.append(h('label', { class: 'check small' }, h('input', { type: 'checkbox', checked: r.on ? true : null, onchange: e => save({ on: e.target.checked }) }), 'Remind me to practise'),
      h('label', { class: 'row small' }, 'At', time),
      h('span', { class: 'small muted', text: 'Only on days you haven’t practised yet: once a minute is logged, today’s reminder is skipped. Stays on this device.' }));
  };
  draw();
  return box;
}

function displayCard() {
  const card = h('div', { class: 'card' });
  const sounds = soundsSection();
  function draw() {
    card.innerHTML = '';
    const st = E.state.settings, seg = (opts, cur, key) => h('div', { class: 'seg' }, opts.map(([k, t]) => h('button', { 'aria-pressed': String(k === cur), onclick: () => { E.setSetting(key, k); applyDisplay(); draw(); } }, t)));
    card.append(h('h3', { text: 'Display' }),
      h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Layout' }), seg([['auto', 'Auto'], ['compact', 'Compact'], ['roomy', 'Roomy']], st.display || 'auto', 'display'),
        h('span', { class: 'small muted', text: 'Compact suits small phones: a slim top bar, the tab bar tucked away inside tools, tool descriptions behind ⓘ, and long sections folded. Auto turns it on for screens under 380 × 640.' })),
      h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Text size' }), seg([['s', 'Small'], ['m', 'Normal'], ['l', 'Large']], st.textSize || 'm', 'textSize')),
      h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Sound output' }), seg([['auto', 'Auto'], ['smooth', 'Smooth'], ['fast', 'Low latency']], st.audioOutput || 'auto', 'audioOutput'),
        h('span', { class: 'small muted', text: 'Low latency answers a tap a little sooner, but on some Android phones it crackles. Smooth avoids that, and the rhythm tools allow for the extra delay. Auto picks Smooth on Android.' + (A.outputUsed() && A.outputUsed() !== A.outputFor(st.audioOutput) ? ' The change applies the next time the app opens.' : '') }),
        h('span', { class: 'small muted', text: 'These settings stay on this device and do not sync.' })),
      reminderBox(),
      sounds);
  }
  draw();
  return card;
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
    // the open strings, big enough to read on a phone (a whole fretboard here drew them as tiny dots); with a
    // capo, the notes the strings sound at the capo; mirrored for a left-handed player like the neck
    const order = E.STRINGS.map((st, i) => i);
    if (g.lefty) order.reverse();
    const strings = h('div', { class: 'open-strings', role: 'list', 'aria-label': 'Your open strings, lowest first' }, order.map(i => {
      const m = E.STRINGS[i].midi;
      return h('div', { class: 'open-string' + (i === 0 ? ' low' : ''), role: 'listitem', 'aria-label': 'String ' + (6 - i) + ': ' + noteName(m) + (Math.floor(m / 12) - 1) },
        h('span', { class: 'eyebrow', text: String(6 - i) }), h('b', { text: noteName(m) }), h('span', { class: 'small muted mono', text: String(Math.floor(m / 12) - 1) }));
    }));
    card.append(h('div', { class: 'spread' }, h('h3', { text: 'Your guitar' }), h('span', { class: 'small muted', text: names.map(n => n.replace(/^(low|high) /, '')).join(' ') + (g.capo ? ' · capo ' + g.capo : '') })),
      h('p', { class: 'small muted', text: 'Every fretboard, scale position and fretboard answer follows these. With a capo, fret numbers count from the capo.' }),
      h('div', { class: 'formgrid' },
        h('label', { class: 'stack field', for: 'g-tuning' }, h('span', { class: 'eyebrow', text: 'Tuning' }), sel),
        h('label', { class: 'stack field', for: 'g-capo' }, h('span', { class: 'eyebrow', text: 'Capo' }), capo)),
      h('label', { class: 'check small' }, h('input', { type: 'checkbox', checked: g.lefty ? true : null, onchange: e => { E.setGuitar({ lefty: e.target.checked }); draw(); } }), 'Left-handed: show the neck mirrored, nut on the right'),
      h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Note names' }),
        h('div', { class: 'seg' }, [['letters', 'C D E'], ['solfege', 'Do Re Mi … Si'], ['solfegeTi', 'Do Re Mi … Ti']].map(([k, t]) => h('button', { 'aria-pressed': (E.state.settings.noteNames || 'letters') === k ? 'true' : 'false', onclick: () => { E.setGuitar({ noteNames: k }); draw(); } }, t))),
        h('span', { class: 'small muted', text: 'Used for notes on the neck, the tuner and answers. Chord symbols stay in letters, as charts write them.' })),
      h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Open strings' + (g.capo ? ' with the capo' : '') }), strings));
  }
  draw();
  return card;
}

/* Your progress on every device: a sync file that merges (nothing practised on either device is lost),
   an exact restore, and live sync when the app runs inside claude.ai */
function backupCard() {
  const card = h('div', { class: 'card sync-card' });
  const send = async () => {
    const name = 'world-woodshed-sync-' + E.dayKey() + '.json';
    try {
      const how = await shareFile(name, JSON.stringify(E.exportBackup()), 'World Woodshed progress');
      if (how === 'downloaded') toast('Saved ' + name + '. Send it to your other device and load it there.');
    } catch (e) { toast('Could not share the file'); }
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
    githubSyncBox(),
    h('details', { class: 'small' }, h('summary', { text: 'How to set up your Android phone' }),
      h('ol', { class: 'list small' },
        h('li', { text: 'On the phone, open the app’s web address in Chrome and choose ⋮ → Add to Home screen (or Install app). It then works offline like an app.' }),
        h('li', { text: 'Here, tap “Send my progress”. Share it to yourself (Drive, email, a chat with yourself, Nearby Share), or save the file and copy it over.' }),
        h('li', { text: 'On the phone, open the app, go to Settings → Your progress on every device → “Load a sync file”, and pick that file.' }),
        h('li', { text: 'Later, sync the other way the same way. Each load merges, so nothing is lost; mic and audio latency stay set per device.' }))),
    h('details', { class: 'small' }, h('summary', { text: 'Restore a backup exactly' }),
      h('p', { class: 'small muted', text: 'Replaces this device’s progress with the file as it was saved, instead of merging.' }),
      h('button', { class: 'btn small ghost', onclick: () => replaceIn.click() }, 'Restore from a file…')),
    storageBox());
  return card;
}

/* How much of this device's room for saved progress is used (the browser keeps about 5 MB of text for it).
   The Library's files and Transcribe's audio are stored apart and don't count here. */
const PART_NAMES = { readLib: 'Pieces you read (reading library)', skills: 'Answers and skills', hdev: 'Practice history', cur: 'The smart plan', library: 'Library details', songs: 'Transcribe setups', journal: 'Practice journal', tunes: 'Your tunes', melodies: 'Melodies', scaleTime: 'Time on each scale', settings: 'Settings', routines: 'Routines', games: 'Game scores', history: 'Daily totals', tech: 'Technique tempos', session: 'The running session' };
const mb = n => (n < 1048576 ? Math.max(1, Math.round(n / 1024)) + ' KB' : (n / 1048576).toFixed(1) + ' MB');
function storageBox() {
  const u = E.storageUse(), pct = Math.round(u.share * 100);
  const top = Object.entries(u.parts).filter(([, n]) => n > 2048).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return h('details', { class: 'small storage-use' }, h('summary', { text: 'Room used on this device: ' + mb(u.bytes) + ' of about ' + mb(u.limit) + ' (' + pct + '%)' }),
    bar(Math.min(100, pct), pct >= 80 ? 'bad' : 'brass'),
    h('p', { class: 'small muted', text: pct >= 80 ? 'Nearly full. A save that doesn’t fit still goes to the second copy, but send a backup file to be safe, and consider deleting old pieces in the reading library.' : 'Your progress is kept as text in the browser. Library files and recordings are stored apart and don’t count here.' }),
    top.length ? h('ul', { class: 'list small' }, top.map(([k, n]) => h('li', { text: (PART_NAMES[k] || k) + ': ' + mb(n) }))) : null);
}

/* Check for updates: the web app reloads into a new version; the Android app opens the newest release's page */
function updateBox() {
  const ver = h('span', { class: 'small muted' });
  const status = h('span', { class: 'small', role: 'status' });
  const get = h('div', { class: 'row' });
  const btn = h('button', { class: 'btn small', onclick: async () => {
    btn.disabled = true; get.innerHTML = '';
    status.textContent = 'Checking…';
    try {
      if (isNative()) {
        const r = await checkRelease(await currentVersion());
        if (r.state === 'available') {
          status.textContent = 'Version ' + r.version + ' is out. Download WorldWoodshed.apk from its page and install it over this one; your progress stays.';
          get.append(h('button', { class: 'btn brass small', onclick: () => { location.href = r.url; } }, 'Get version ' + r.version));
        } else status.textContent = { current: 'You have the latest version.', offline: 'Could not reach GitHub. Check the connection and try again.' }[r.state] || 'Could not check for updates just now. Try again later.';
      } else {
        const r = await checkWebUpdate();
        status.textContent = { updating: 'Updating… the app reloads in a moment.', current: 'You have the latest version.', offline: 'You are offline. Check again when you are connected.' }[r] || 'This copy updates each time the page loads.';
      }
    } finally { btn.disabled = null; }
  } }, 'Check for updates');
  currentVersion().then(v => { ver.textContent = v ? 'Version ' + v : ''; });
  return h('div', { class: 'stack update-box' }, h('span', { class: 'eyebrow', text: 'App updates' }), h('div', { class: 'row' }, btn, ver), status, get);
}

// the gear in the top bar opens Settings from anywhere
const gear = document.getElementById('settings-btn');
if (gear) gear.addEventListener('click', () => settingsPage());
// the tuning fork beside it opens the tuner from anywhere; Back returns to the tab you were on
const fork = document.getElementById('tuner-btn');
if (fork) fork.addEventListener('click', () => { if (!(ui.runner && ui.runner.id === 'tuner')) openTool('tuner', { returnTab: ui.tab }); });
