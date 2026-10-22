import D from './data.js';
import E from './engine.js';
import { view, h, toast, bar, ui, go, TOOLS, openTool, startPlacement, PAGES, Fretboard, isCompact, applyDisplay } from './ui/core.js';
import { regionPage } from './tools/atlas.js';
import { heardCount, nextRecording, lessonPage } from './tools/learn.js';
import { ribbon, awayButton } from './ui/routine.js';
import { startSession, runCurrent, discardSession } from './ui/session.js';
import { BLOCKS, blockTitle, totalOf, fmtMin } from './routines.js';
import { micSettingsCard } from './ui/mic.js';
import Cur from './curriculum.js';
import { shareFile, isNative } from './native.js';
import { connect as ghConnect, disconnect as ghDisconnect, syncNow as ghSyncNow, status as ghStatus, onStatus as ghOnStatus } from './ghsync.js';
import { smartPlanner, learningPrefsCard } from './ui/smart.js';
import { goalCard, applyRamp } from './ui/goal.js';
import Samples from './samples.js';
import A from './audio.js';
import { VOICES } from './guitars.js';
import { SAMPLE_SOURCES } from './content/samples.js';
import { statsPage, heatmap, dayChart } from './ui/stats.js';

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
  away: { name: 'No guitar', title: 'Practice without the instrument', tools: ['commute', 'away', 'dictation', 'sightread', 'intervals', 'degrees', 'rhythms', 'fretboard', 'listening', 'lesson'], tip: 'Ear training, rhythm taps, fretboard quizzes, theory and listening all work with just the phone. Any routine can also run in no-guitar mode from the Routine tab.' }
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

    // the daily goal and the streaks (the goal grows first, if it is time)
    applyRamp();
    view.append(goalCard());

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
      if (!st.settings.prefsDismissed) pc.append(learningPrefsCard({ compact: true, dismiss: () => { E.setSetting('prefsDismissed', true); } }));
      pc.append(smartPlanner({ compact: true }));
      const aid = E.activeRoutineId();
      const r = aid !== 'smart' ? E.getRoutine(aid) : null;
      if (r) pc.append(h('div', { class: 'card slim' }, h('div', { class: 'spread' },
        h('div', { class: 'stack', style: { gap: '2px' } }, h('span', { class: 'eyebrow', text: 'Or run your routine' }), h('b', { text: r.name + ' · ' + fmtMin(totalOf(r.blocks)) })),
        h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => startSession(r) }, '▶ Start'), awayButton(r, 'btn small ghost'))), ribbon(r.blocks, { small: true })));
    }
    view.append(pc);
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
          h('div', { class: 'skillrow' }, h('span', {}, E.SKILLS[k].name + (k !== 'technique' ? ' · level ' + E.unlockedTier(k) : ''), due ? h('span', { class: 'badge brass', text: due + ' due' }) : ''), h('span', { class: 'mono', style: { textAlign: 'right' }, text: m + '%' }),
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

    const danger = h('div', { class: 'card' });
    danger.append(h('div', { class: 'spread' }, h('span', { class: 'small muted', text: E.storageNote() + '. Timing correction: ' + (st.settings.latencyMs || 0) + ' ms.' }),
      h('button', { class: 'btn small ghost', onclick: () => {
        const c = h('div', { class: 'confirm' }, h('b', { text: 'Erase all progress?' }), h('span', { class: 'small', text: 'This clears every score, routine and setting. It cannot be undone.' }),
          h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => c.remove() }, 'Keep my progress'), h('button', { class: 'btn small danger', onclick: () => { E.resetAll(); toast('Progress erased'); } }, 'Erase everything')));
        danger.append(c);
      } }, 'Reset progress')));
    view.append(fold(backupCard(), 'Your progress on every device'), fold(danger, 'Reset progress'));
  },
  train() {
    const sec = TRAIN[ui.section.train] ? ui.section.train : 'ear';
    const t = TRAIN[sec];
    view.append(h('div', { class: 'pagehead' }, h('span', { class: 'eyebrow', text: 'Train' }), h('h1', { text: t.title })));
    view.append(h('div', { class: 'seg big' }, Object.entries(TRAIN).map(([k, x]) => h('button', { 'aria-pressed': k === sec ? 'true' : 'false', onclick: () => go('train', k) }, x.name))));
    view.append(h('div', { class: 'tools' }, t.tools.map(id => toolTile(id, { returnTab: 'train' }))));
    view.append(h('p', { class: 'small muted', text: t.tip }));
    view.append(fold(guitarCard(), 'Your guitar'), fold(displayCard(), 'Display'), fold(micSettingsCard(), 'Microphone'));
  }
});

const CONTRAST_SKILLS = ['intervals', 'chords', 'degrees', 'scales', 'rhythmId'];
/* Automatic sync through a private GitHub repository the player owns (opt-in; the token stays on this device) */
function githubSyncBox() {
  const box = h('div', { class: 'ghsync stack' });
  let connecting = false;
  const ago = t => { if (!t) return 'not yet'; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : Math.round(m / 60) + ' h ago'; };
  function draw() {
    box.innerHTML = '';
    const st = ghStatus();
    box.append(h('span', { class: 'eyebrow', text: 'Automatic sync' }));
    if (st.on) {
      box.append(h('p', { class: 'small', text: 'On, through ' + st.owner + '/' + st.repo + '. Last synced ' + ago(st.lastSync) + (st.busy ? ' · syncing…' : '') + '.' }),
        st.lastError ? h('p', { class: 'small bad-text', text: st.lastError }) : '',
        h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: async () => { await ghSyncNow('button'); draw(); toast(ghStatus().lastError ? 'Sync failed' : 'Synced'); } }, 'Sync now'),
          h('button', { class: 'btn small ghost', onclick: () => { ghDisconnect(); draw(); toast('Automatic sync is off on this device'); } }, 'Turn off')));
      return;
    }
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
    box.append(h('p', { class: 'small', text: 'Sync by itself through a private GitHub repository of your own: when the app opens, every few minutes while it is open, and shortly after you practise. It merges the same way as the sync file.' }),
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
  const demo = k => { const strum = () => A.strum([40, 47, 52, 56, 59, 64], A.now() + 0.05, 0.75, 0.02, 1.8); if (VOICES[k]) Samples.load(VOICES[k]).then(strum); else strum(); };
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
        h('li', { text: 'On the phone, open the app, go to Today → “Load a sync file”, and pick that file.' }),
        h('li', { text: 'Later, sync the other way the same way. Each load merges, so nothing is lost; mic and audio latency stay set per device.' }))),
    h('details', { class: 'small' }, h('summary', { text: 'Restore a backup exactly' }),
      h('p', { class: 'small muted', text: 'Replaces this device’s progress with the file as it was saved, instead of merging.' }),
      h('button', { class: 'btn small ghost', onclick: () => replaceIn.click() }, 'Restore from a file…')));
  return card;
}
