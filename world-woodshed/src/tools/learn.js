import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import { view, h, shuffle, toast, bar, ui, renderTabs, teardown, go, tool, openTool, TOOLS, PAGES, Fretboard, positionsOfPc, hooks } from '../ui/core.js';
import { parseChord, prettySym, degreeLabel, spell, keyPrefersFlats } from '../theory.js';
import { RhythmGrid, playRhythmStep, stepDurFn } from './rhythm.js';
import { CircleWidget } from './practice.js';
import { guitarMidis, progressionMidis } from '../voicings.js';
import { loadEssays, loadGuides, loadLessons, whenLoaded, drawWhenLoaded } from '../content/lazy.js';
import { onSpotify, spotifyQuery, spotifyWeb, openSpotify } from '../spotify.js';

/* ======================================================
   LEARN: styles library, theory course, reference tools
   ====================================================== */
const yt = q => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
const wiki = q => 'https://en.wikipedia.org/w/index.php?search=' + encodeURIComponent(q);
const heardKey = (r, e) => r.id + '|' + e.artist + '|' + e.work;
const ext = (href, label, cls) => h('a', { class: cls || 'linkbtn', href, target: '_blank', rel: 'noopener' }, label, ' ↗');
const spotify = (e, label, cls) => { const q = spotifyQuery(e); return h('a', { class: cls || 'linkbtn', href: spotifyWeb(q), target: '_blank', rel: 'noopener', 'aria-label': 'Open ' + e.work + ' in Spotify', onclick: ev => openSpotify(ev, q) }, label, ' ↗'); };
export function heardCount(r) { return (r.essential || []).filter(e => E.heard(heardKey(r, e))).length; }
export function nextRecording(r) { return (r.essential || []).find(e => !E.heard(heardKey(r, e))) || null; }
const AREAS = ['All', 'Americas', 'Europe', 'Africa', 'Middle East & India', 'East Asia'];
const STUDY_KIND = { book: 'Book', method: 'Method', film: 'Film', documentary: 'Documentary', museum: 'Visit' };

/* ---------- Learn page ---------- */
PAGES.learn = function () {
  const section = ui.section.learn || 'styles';
  view.append(h('div', { class: 'pagehead' },
    h('span', { class: 'eyebrow', text: 'Learn' }), h('h1', { text: 'Every style, the theory, the records' }),
    h('p', { class: 'muted', text: 'Deep dives into 24 musical traditions: what they mean to the people who make them, how they work, what to hear and who to study. Plus in-depth technique guides, a theory course that plays its own examples, and reference tools.' })));
  const seg = h('div', { class: 'seg big' }, [['styles', 'Styles'], ['techniques', 'Techniques'], ['theory', 'Theory'], ['tools', 'Reference']].map(([k, t]) =>
    h('button', { 'aria-pressed': section === k ? 'true' : 'false', onclick: () => go('learn', k) }, t)));
  view.append(seg);
  if (section === 'theory') theoryIndex();
  else if (section === 'techniques') techniqueIndex();
  else if (section === 'tools') refIndex();
  else stylesIndex();
};

function stylesIndex() {
  const rw = E.regionOfWeek();
  let area = ui.section.learnArea || 'All', q = '';
  const chips = h('div', { class: 'chips' });
  const search = h('input', { type: 'search', placeholder: 'Search styles, players, instruments…', 'aria-label': 'Search styles', class: 'search' });
  const grid = h('div', { class: 'stylegrid' });
  view.append(h('div', { class: 'stack' }, search, chips), grid,
    h('div', { class: 'tools' }, tile('atlasquiz')));
  function drawChips() {
    chips.innerHTML = '';
    AREAS.forEach(a => chips.append(h('button', { class: 'chip', 'aria-pressed': a === area ? 'true' : 'false', onclick: () => { area = a; ui.section.learnArea = a; drawChips(); draw(); } }, a)));
  }
  function matches(r) {
    if (area !== 'All' && r.area !== area) return false;
    if (!q) return true;
    const hay = [r.name, r.places, r.summary, (r.listen || []).join(' '), (r.instruments || []).join(' '), (r.players || []).map(p => p.name).join(' '), (r.substyles || []).map(x => x.name).join(' ')].join(' ').toLowerCase();
    return q.split(/\s+/).every(w => hay.includes(w));
  }
  function draw() {
    grid.innerHTML = '';
    const list = D.REGIONS.filter(matches);
    if (!list.length) grid.append(h('p', { class: 'muted', text: 'No style matches "' + q + '".' }));
    list.forEach(r => {
      const n = (r.essential || []).length, hd = heardCount(r);
      grid.append(h('button', { class: 'stylecard area-' + slug(r.area), onclick: () => stylePage(r) },
        h('span', { class: 'eyebrow', text: r.area + (rw.id === r.id ? ' · this week' : '') }),
        h('b', { class: 'sc-name', text: r.name }),
        h('span', { class: 'small muted', text: r.places }),
        h('span', { class: 'sc-meta' }, h('span', { class: 'mono small', text: (r.era || '') }), h('span', { class: 'mono small', text: hd + '/' + n + ' heard' })),
        bar(n ? 100 * hd / n : 0, 'brass')));
    });
  }
  search.addEventListener('input', () => { q = search.value.trim().toLowerCase(); draw(); });
  drawChips(); draw();
}
const slug = s => s.toLowerCase().replace(/[^a-z]+/g, '-');
function tile(id, params) {
  const t = TOOLS[id];
  const m = t.skill && E.SKILLS[t.skill] ? Math.round(E.mastery(t.skill)) + '%' : '';
  return h('button', { class: 'tile', onclick: () => openTool(id, { params, returnTab: 'learn' }) }, h('span', { class: 't-title', text: t.title }), h('span', { class: 't-desc', text: t.desc }), h('span', { class: 't-meter', text: m }));
}

/* ---------- Style page ---------- */
export function stylePage(r) {
  teardown(); ui.runner = { id: 'style', opts: {} }; ui.tab = 'learn'; renderTabs();
  view.innerHTML = ''; window.scrollTo(0, 0);
  whenLoaded(loadEssays, ui, view, toast, () => drawStylePage(r));
}
function drawStylePage(r) {
  const rw = E.regionOfWeek();
  const score = Math.round(E.regionScore(r) * 100);
  const n = (r.essential || []).length;
  const sections = [];
  const sec = (id, title, ...kids) => { const el = h('section', { class: 'card', id: 'st-' + id }, h('h2', { text: title }), ...kids); sections.push([id, title, el]); return el; };

  const hero = h('div', { class: 'hero style-hero area-' + slug(r.area) },
    h('div', { class: 'spread' }, h('button', { class: 'btn ghost small', onclick: () => go('learn', 'styles') }, '← All styles'), h('span', { class: 'eyebrow', text: r.area })),
    h('h1', { text: r.name }),
    h('p', { class: 'muted', text: r.places + (r.era ? ' · ' + r.era : '') }),
    h('p', { class: 'lede', text: r.summary }),
    h('div', { class: 'row' },
      h('button', { class: 'btn brass small', onclick: () => openTool('listening', { params: { region: r.id }, returnTab: 'learn' }) }, '▶ Listening session'),
      h('button', { class: 'btn small', onclick: () => openTool('atlasquiz', { params: { region: r.id }, returnTab: 'learn' }) }, 'Quiz me'),
      rw.id === r.id ? h('span', { class: 'pill', text: 'Style of the week' }) : h('button', { class: 'btn small ghost', onclick: () => { E.setRegionWeek(r.id); toast(r.name + ' is your style of the week'); stylePage(r); } }, 'Make it my style of the week')),
    h('div', { class: 'heromet' },
      h('div', {}, h('b', { class: 'mono', text: heardCount(r) + '/' + n }), h('span', { text: 'recordings heard' })),
      h('div', {}, h('b', { class: 'mono', text: score + '%' }), h('span', { text: 'rhythms, scales & quiz' }))));
  view.append(hero);

  // overview
  const ov = [];
  if (r.concepts) ov.push(h('h3', { text: 'Key ideas' }), h('ul', { class: 'list' }, r.concepts.map(c => h('li', { text: c }))));
  if (r.traits) ov.push(h('h3', { text: 'How it works' }), h('div', { class: 'traits' }, Object.entries(r.traits).map(([k, v]) => h('div', { class: 'trait' }, h('span', { class: 'eyebrow', text: k }), h('p', { text: v })))));
  if (r.instruments) ov.push(h('h3', { text: 'Instruments' }), h('div', { class: 'chips' }, r.instruments.map(c => h('a', { class: 'chip', href: wiki(c + ' instrument'), target: '_blank', rel: 'noopener' }, c))));
  const es = r.essay;
  if (es && es.thesis) ov.unshift(h('blockquote', { class: 'thesis' }, es.thesis));
  sec('overview', 'Overview', ...ov);
  if (es && es.philosophy) sec('philosophy', 'Philosophy & meaning', readTime(es.philosophy), essay(es.philosophy),
    es.questions ? h('div', { class: 'callout' }, h('b', { text: 'Questions to sit with' }), h('ul', { class: 'list' }, es.questions.map(q => h('li', { text: q })))) : null);

  if (r.history && r.history.length) sec('history', 'History', h('ol', { class: 'timeline' }, r.history.map(([when, what]) => h('li', {}, h('span', { class: 'mono when', text: when }), h('p', { text: what })))));
  if (r.substyles && r.substyles.length) sec('styles', 'Styles & forms', h('div', { class: 'subgrid' }, r.substyles.map(x => h('div', { class: 'sub' }, h('b', { text: x.name }), h('p', { class: 'small', text: x.text }), h('a', { class: 'small', href: yt(x.name + ' ' + r.name.split(' (')[0]), target: '_blank', rel: 'noopener' }, 'Hear examples ↗')))));

  // listening path
  if (es && es.depth) sec('depth', 'How it really works', readTime(es.depth), essay(es.depth));
  if (n) {
    const list = h('ol', { class: 'records' });
    const prog = h('span', { class: 'mono small muted' });
    const drawRecs = () => {
      list.innerHTML = '';
      prog.textContent = heardCount(r) + ' of ' + n + ' heard';
      r.essential.forEach((e, i) => list.append(recordRow(r, e, i, drawRecs)));
    };
    drawRecs();
    sec('listen', 'Listening path', h('p', { class: 'small muted', text: 'In order: start at the top. Tick each one off as you hear it; the Today page suggests the next.' }), prog, list,
      r.listenFor ? h('div', { class: 'callout' }, h('b', { text: 'Listen for' }), h('ul', { class: 'list' }, r.listenFor.map(x => h('li', { text: x })))) : null);
  }
  if (r.players && r.players.length) sec('players', 'Players to study', h('div', { class: 'players' }, r.players.map(p => h('div', { class: 'player' },
    h('div', { class: 'spread' }, h('b', { text: p.name }), h('span', { class: 'small muted', text: p.inst })),
    h('p', { class: 'small', text: p.why }),
    h('div', { class: 'row' }, ext(yt(p.name), 'YouTube'), ext(wiki(p.name), 'Wikipedia'))))));

  // play it
  const play = [];
  if (es && es.guitar) play.push(essay(es.guitar, true));
  const techs = D.TECHNIQUES.filter(t => (t.styles || []).includes(r.id));
  if (techs.length) play.push(h('h3', { text: 'Technique guides' }), h('div', { class: 'chips' }, techs.map(t => h('button', { class: 'chip', onclick: () => techniquePage(t, () => stylePage(r)) }, t.name))));
  if (r.practice) play.push(h('h3', { text: 'Practice steps' }), h('ol', { class: 'list steps' }, r.practice.map(x => h('li', { text: x }))));
  if (r.guitar) play.push(h('h3', { text: 'On guitar' }), h('ul', { class: 'list' }, r.guitar.map(c => h('li', { text: c }))));
  if (r.rhythms.length) play.push(h('h3', { text: 'Rhythms' }), h('div', { class: 'chips' }, r.rhythms.map(id => { const rr = D.RHYTHMS.find(x => x.id === id); return h('button', { class: 'chip', onclick: () => openTool('rhythms', { params: { rhythm: id }, returnTab: 'learn' }) }, '▶ ' + rr.name); })));
  if (r.scales.length) play.push(h('h3', { text: 'Scales & modes' }), h('div', { class: 'chips' }, r.scales.map(id => { const sc = D.SCALES.find(x => x.id === id); return h('button', { class: 'chip', onclick: () => openTool('drone', { params: { scale: id }, returnTab: 'learn' }) }, sc.name); })),
    h('p', { class: 'small muted', text: 'Each opens over a drone so you can hear it and play it.' }));
  const tunes = D.TUNES.filter(t => t.region === r.id);
  if (tunes.length) play.push(h('h3', { text: 'Grooves to jam over' }), h('div', { class: 'chips' }, tunes.map(t => h('button', { class: 'chip', onclick: () => openTool('repertoire', { params: { tune: t.id }, returnTab: 'learn' }) }, t.name))));
  const drills = (D.DRILLS || []).filter(d => d.style === r.id);
  if (drills.length) play.push(h('h3', { text: 'Style drills' }), h('div', { class: 'chips' }, drills.map(d => h('button', { class: 'chip', onclick: () => openTool('drill', { params: { drill: d.id }, returnTab: 'learn' }) }, d.name))),
    h('p', { class: 'small muted', text: 'Exercises a teacher of this tradition would give you, with a backing loop and variations that change as you go.' }));
  sec('play', 'On guitar', ...play);
  if (es && (es.glossary || es.respect)) sec('words', 'Words & respect',
    es.respect ? h('div', { class: 'callout patina' }, h('b', { text: 'Learning it with respect' }), h('p', { text: es.respect })) : null,
    es.glossary ? h('dl', { class: 'glossary' }, es.glossary.map(g => [h('dt', { text: g.term }), h('dd', { text: g.def })])) : null);

  if (r.study && r.study.length) sec('study', 'Go deeper', h('div', { class: 'stack' }, r.study.map(x => h('div', { class: 'studyrow' },
    h('span', { class: 'badge', text: STUDY_KIND[x.kind] || 'Resource' }),
    h('div', {}, h('b', { text: x.title }), h('span', { class: 'small muted', text: ' · ' + x.by }), x.note ? h('p', { class: 'small', text: x.note }) : null)))));

  const nav = h('nav', { class: 'secnav', 'aria-label': 'Sections' }, sections.map(([id, title]) => h('button', { class: 'chip', onclick: () => document.getElementById('st-' + id).scrollIntoView({ behavior: 'smooth', block: 'start' }) }, title)));
  view.append(nav, ...sections.map(x => x[2]));
}
function recordRow(r, e, i, redraw) {
  const key = heardKey(r, e), on = E.heard(key);
  return h('li', { class: 'record' + (on ? ' heard' : '') },
    h('button', { class: 'heardbtn', 'aria-pressed': on ? 'true' : 'false', 'aria-label': (on ? 'Heard: ' : 'Mark as heard: ') + e.work, onclick: () => { E.setHeard(key, !on); redraw(); } }, on ? '✓' : String(i + 1)),
    h('div', { class: 'rec-body' },
      h('div', { class: 'rec-title' }, h('b', { text: e.work }), h('span', { class: 'badge', text: e.kind }), i === 0 ? h('span', { class: 'badge brass', text: 'Start here' }) : null),
      h('span', { class: 'small' }, e.artist, h('span', { class: 'mono muted', text: ' · ' + e.year })),
      e.note ? h('p', { class: 'small muted', text: e.note }) : null),
    onSpotify(e) ? h('div', { class: 'rec-link rec-links' }, spotify(e, 'Spotify'), ext(yt(e.artist + ' ' + e.work), 'YouTube'))
      : ext(yt(e.artist + ' ' + e.work), 'Play', 'linkbtn rec-link'));
}

/* ---------- Listening session tool ---------- */
tool('listening', {
  tab: 'learn', skill: null, title: 'Active listening', eyebrow: 'Learn · the records',
  desc: 'One recording at a time from a style\'s listening path, with what to listen for.',
  render(body, ctx) {
    let r = D.REGIONS.find(x => x.id === (ctx.params || {}).region) || E.regionOfWeek();
    const card = h('div', { class: 'card' }), rest = h('div', { class: 'card' });
    body.append(card, rest);
    function draw() {
      card.innerHTML = ''; rest.innerHTML = '';
      const sel = h('select', { 'aria-label': 'Style', id: 'listen-style' });
      D.REGIONS.forEach(x => sel.append(h('option', { value: x.id, selected: x.id === r.id ? true : null, text: x.name })));
      sel.onchange = () => { r = D.REGIONS.find(x => x.id === sel.value); draw(); };
      const e = nextRecording(r);
      card.append(h('label', { class: 'stack field', for: 'listen-style' }, h('span', { class: 'eyebrow', text: 'Style' }), sel));
      if (!e) card.append(h('h2', { text: 'You have heard the whole path for ' + r.name + '.' }), h('p', { class: 'muted', text: 'Pick another style, or go back to your favourite and transcribe a phrase from it.' }));
      else {
        const i = r.essential.indexOf(e);
        card.append(h('span', { class: 'eyebrow', text: 'Recording ' + (i + 1) + ' of ' + r.essential.length }),
          h('h2', { class: 'rec-now', text: e.work }), h('p', {}, e.artist, h('span', { class: 'mono muted', text: ' · ' + e.year + ' · ' + e.kind })),
          e.note ? h('p', { class: 'lede', text: e.note }) : null,
          r.listenFor ? h('div', { class: 'callout' }, h('b', { text: 'While it plays, listen for' }), h('ul', { class: 'list' }, shuffle(r.listenFor).slice(0, 3).map(x => h('li', { text: x })))) : null,
          h('div', { class: 'row' }, onSpotify(e) ? spotify(e, 'Open in Spotify', 'btn primary') : null,
            ext(yt(e.artist + ' ' + e.work), onSpotify(e) ? 'YouTube' : 'Find it on YouTube', onSpotify(e) ? 'btn' : 'btn primary'),
            h('button', { class: 'btn brass', onclick: () => { E.setHeard(heardKey(r, e), true); toast('Marked as heard'); draw(); } }, 'Heard it ✓')),
          h('p', { class: 'small muted', text: 'Listen twice: once just to enjoy it, once with the prompts above. Hum one phrase you want to learn, then take it to Transcribe.' }));
      }
      rest.append(h('div', { class: 'spread' }, h('h3', { text: 'The full path' }), h('button', { class: 'btn small ghost', onclick: () => stylePage(r) }, 'About ' + r.name + ' →')));
      const ol = h('ol', { class: 'records' });
      (r.essential || []).forEach((x, k) => ol.append(recordRow(r, x, k, draw)));
      rest.append(ol);
    }
    draw();
  }
});

/* ---------- Theory course ---------- */
const LEVELS = ['Foundations', 'Intermediate', 'Advanced'];
function theoryIndex() {
  const done = D.LESSONS.filter(l => E.lessonDone(l.id)).length;
  const nxt = D.LESSONS.find(l => !E.lessonDone(l.id));
  view.append(h('div', { class: 'card' },
    h('div', { class: 'spread' }, h('h2', { text: 'Theory course' }), h('span', { class: 'mono small muted', text: done + ' of ' + D.LESSONS.length + ' done' })),
    bar(100 * done / D.LESSONS.length, 'brass'),
    h('p', { class: 'small muted', text: 'Short lessons with examples you can hear and see on the neck, practice links into the trainers, and three check questions each.' }),
    nxt ? h('div', { class: 'row' }, h('button', { class: 'btn brass', onclick: () => lessonPage(nxt) }, (done ? 'Continue: ' : 'Start: ') + nxt.title)) : h('b', { text: 'Course complete. Revisit any lesson below.' })));
  LEVELS.forEach(lv => {
    const ls = D.LESSONS.filter(l => l.level === lv);
    const d = ls.filter(l => E.lessonDone(l.id)).length;
    view.append(h('div', { class: 'stack' }, h('div', { class: 'spread' }, h('span', { class: 'eyebrow', text: lv }), h('span', { class: 'mono small muted', text: d + '/' + ls.length })),
      h('div', { class: 'lessongrid' }, ls.map(l => h('button', { class: 'lessoncard' + (E.lessonDone(l.id) ? ' done' : ''), onclick: () => lessonPage(l) },
        h('span', { class: 'lc-num mono', text: E.lessonDone(l.id) ? '✓' : String(D.LESSONS.indexOf(l) + 1) }),
        h('span', { class: 'lc-body' }, h('b', { text: l.title }), h('span', { class: 'small muted', text: l.summary })),
        h('span', { class: 'mono small muted', text: l.minutes + ' min' }))))));
  });
}
export function lessonPage(l) {
  teardown(); ui.runner = { id: 'lesson', opts: {} }; ui.tab = 'learn'; renderTabs();
  view.innerHTML = ''; window.scrollTo(0, 0);
  view.append(h('div', { class: 'runner-head' }, h('div', { class: 'spread' }, h('button', { class: 'btn ghost small', onclick: () => go('learn', 'theory') }, '← Course'), h('span', { class: 'eyebrow', text: l.level + ' · ' + l.minutes + ' min' }))));
  const body = h('div', { class: 'section' }); view.append(body);
  const cleanup = renderLesson(body, l, { onNav: lessonPage });
  ui.cleanup = cleanup;
}
tool('lesson', {
  tab: 'learn', skill: null, title: 'Theory lesson', eyebrow: 'Learn · theory course',
  desc: 'Read and play through a lesson from the course.',
  render(body, ctx) {
    let l = D.LESSONS.find(x => x.id === (ctx.params || {}).lesson) || D.LESSONS.find(x => !E.lessonDone(x.id)) || D.LESSONS[0];
    let cleanup = null;
    const show = x => { if (cleanup) cleanup(); body.innerHTML = ''; l = x; cleanup = renderLesson(body, l, { onNav: show }); window.scrollTo(0, 0); };
    show(l);
    return () => cleanup && cleanup();
  }
});

function renderLesson(root, l, opts = {}) { return drawWhenLoaded(loadLessons, root, () => drawLesson(root, l, opts)); }
function drawLesson(root, l, opts) {
  const loops = [];
  const article = h('article', { class: 'card lesson' }, h('h1', { text: l.title }), h('p', { class: 'lede', text: l.summary }));
  root.append(article);
  l.body.forEach(b => {
    if (b.p) article.append(h('p', { text: b.p }));
    else if (b.h) article.append(h('h3', { text: b.h }));
    else if (b.list) article.append(h('ul', { class: 'list' }, b.list.map(x => h('li', { text: x }))));
    else if (b.tip) article.append(h('div', { class: 'callout' }, h('p', { text: b.tip })));
    else if (b.table) article.append(h('div', { class: 'tablewrap' }, h('table', {}, h('thead', {}, h('tr', {}, b.table[0].map(c => h('th', { text: c })))), h('tbody', {}, b.table.slice(1).map(row => h('tr', {}, row.map(c => h('td', { text: c }))))))));
    else if (b.ex) article.append(example(b.ex, loops));
  });
  if (l.practice && l.practice.length) root.append(h('div', { class: 'card' }, h('h3', { text: 'Practise it' }), h('div', { class: 'tools' }, l.practice.filter(p => TOOLS[p.tool]).map(p => h('button', { class: 'tile', onclick: () => openTool(p.tool, { params: p.params, returnTab: 'learn' }) }, h('span', { class: 't-title', text: p.label }), h('span', { class: 't-desc', text: TOOLS[p.tool].title }), h('span', { class: 't-meter', text: '→' }))))));
  if (l.check && l.check.length) {
    const qc = h('div', { class: 'card' }, h('h3', { text: 'Check yourself' }));
    let right = 0, answered = 0;
    const score = h('p', { class: 'small muted' });
    l.check.forEach((c, qi) => {
      const opts2 = shuffle([c.a].concat(c.w));
      const fb = h('p', { class: 'small', hidden: true });
      const grid = h('div', { class: 'choices wide' });
      opts2.forEach(o => grid.append(h('button', { class: 'choice wide', onclick: ev => {
        if (grid.dataset.done) return; grid.dataset.done = '1'; answered++;
        const ok = o === c.a; if (ok) right++;
        grid.querySelectorAll('button').forEach(b => { b.disabled = true; if (b.textContent === c.a) b.classList.add('correct'); });
        if (!ok) ev.currentTarget.classList.add('wrong');
        fb.hidden = false; fb.textContent = ok ? 'Correct.' : 'The answer is: ' + c.a + '.';
        score.textContent = right + ' of ' + answered + ' right' + (answered === l.check.length ? (right === answered ? '. Lesson marked complete.' : '. Mark it complete when you\'re ready.') : '');
        if (answered === l.check.length && hooks.signal) hooks.signal('lesson:' + l.id, { score: right / answered });
        if (answered === l.check.length && right === answered && !E.lessonDone(l.id)) { E.setLessonDone(l.id, true); drawDone(); }
      } }, h('b', { text: o }))));
      qc.append(h('div', { class: 'stack' }, h('b', { text: (qi + 1) + '. ' + c.q }), grid, fb));
    });
    qc.append(score);
    root.append(qc);
  }
  const doneRow = h('div', { class: 'card' });
  root.append(doneRow);
  function drawDone() {
    doneRow.innerHTML = '';
    const i = D.LESSONS.indexOf(l), prev = D.LESSONS[i - 1], next = D.LESSONS[i + 1];
    const isDone = E.lessonDone(l.id);
    doneRow.append(h('div', { class: 'spread' },
      h('button', { class: 'btn' + (isDone ? ' ghost' : ' brass'), onclick: () => { E.setLessonDone(l.id, !isDone); drawDone(); } }, isDone ? '✓ Completed' : 'Mark lesson complete'),
      h('div', { class: 'row' },
        prev ? h('button', { class: 'btn small ghost', onclick: () => opts.onNav(prev) }, '← ' + prev.title) : null,
        next ? h('button', { class: 'btn small', onclick: () => opts.onNav(next) }, next.title + ' →') : null)));
  }
  drawDone();
  return () => { loops.forEach(lp => lp.stop()); };
}

/* Interactive examples inside lessons */
function example(ex, loops) {
  const wrap = h('div', { class: 'example' });
  const btn = h('button', { class: 'btn primary small' }, '▶ ' + (ex.label || 'Play'));
  wrap.append(btn);
  const flatsFor = (root, minor) => keyPrefersFlats(root, minor);
  const fbFor = (pcsWithDeg, root) => {
    const fb = Fretboard({ onTap: (si, f) => A.note(E.STRINGS[si].midi + f, A.now() + 0.01, 0.8, 1.2) });
    const marks = [];
    pcsWithDeg.forEach(([pc, deg]) => positionsOfPc([pc]).forEach(m => marks.push(Object.assign(m, { kind: pc === root ? 'root' : 'tone', label: degreeLabel(deg) }))));
    fb.mark(marks);
    return fb.el;
  };
  switch (ex.type) {
    case 'scale': {
      const sc = D.SCALES.find(x => x.id === ex.scale); if (!sc) return h('span');
      const root = ex.tonic || 0, flats = flatsFor(root, sc.steps[2] === 3);
      wrap.append(h('span', { class: 'mono small', text: sc.steps.map(st => Number.isInteger(st) ? spell(root + st, flats) : spell(root + Math.ceil(st), flats) + '¼♭').join(' ') }));
      btn.onclick = () => { A.ensure(); const t = A.now() + 0.05; const up = sc.steps.concat([12]); up.concat(up.slice(0, -1).reverse()).forEach((st, i) => A.note(48 + root + st, t + i * 0.27, 0.7, 0.5)); };
      wrap.append(fbFor(sc.steps.filter(Number.isInteger).map(st => [(root + st) % 12, st]), root));
      break;
    }
    case 'chord': {
      const c = D.CHORDS.find(x => x.id === ex.chord); if (!c) return h('span');
      const root = ex.root || 0, flats = flatsFor(root, c.iv[1] === 3);
      wrap.append(h('span', { class: 'mono small', text: c.iv.map(x => spell(root + x, flats)).join(' ') }));
      btn.onclick = () => { A.ensure(); const ms = guitarMidis(root, c.iv); const t = A.now() + 0.05; ms.forEach((m, i) => A.note(m, t + i * 0.2, 0.6, 1)); A.strum(ms, t + ms.length * 0.2 + 0.15, 0.7, 0.03, 2); };
      wrap.append(fbFor(c.iv.map(x => [(root + x) % 12, x % 12]), root));
      break;
    }
    case 'interval': {
      const root = 48 + (ex.root || 0), semi = ex.semi || 0;
      wrap.append(h('span', { class: 'mono small', text: spell(root, true) + ' → ' + spell(root + semi, semi === 6 ? false : true) }));
      btn.onclick = () => { A.ensure(); const t = A.now() + 0.05; A.note(root, t, 0.8, 0.8); A.note(root + semi, t + 0.7, 0.8, 0.8); A.note(root, t + 1.6, 0.6, 1.2); A.note(root + semi, t + 1.6, 0.6, 1.2); };
      break;
    }
    case 'progression': {
      const chords = (ex.chords || []).map(parseChord).filter(Boolean);
      const chips = chords.map(c => h('span', { class: 'chip', text: prettySym(c.sym) }));
      wrap.append(h('div', { class: 'chips' }, chips));
      btn.onclick = () => {
        A.ensure(); const t = A.now() + 0.05, bar = 1.4;
        const shapes = progressionMidis(chords.map(c => [c.root, c.iv]));
        chords.forEach((c, i) => {
          const ms = shapes[i];
          A.note(28 + (((c.root - 28) % 12) + 12) % 12, t + i * bar, 0.7, bar * 0.9); // bass: that root from E1 up
          A.strum(ms, t + i * bar, 0.55, 0.02, bar * 0.45); A.strum(ms, t + i * bar + bar / 2, 0.45, 0.02, bar * 0.4, { dir: 'up' });
          setTimeout(() => chips.forEach((ch, k) => ch.setAttribute('aria-pressed', k === i ? 'true' : 'false')), (t + i * bar - A.now()) * 1000);
        });
        setTimeout(() => chips.forEach(ch => ch.setAttribute('aria-pressed', 'false')), (t + chords.length * bar - A.now()) * 1000);
      };
      break;
    }
    case 'rhythm': {
      const r = D.RHYTHMS.find(x => x.id === ex.rhythm); if (!r) return h('span');
      const grid = RhythmGrid(r);
      let lp = null;
      btn.onclick = () => {
        if (lp) { lp.stop(); lp = null; grid.setNow(-1); btn.textContent = '▶ ' + (ex.label || 'Play'); return; }
        A.ensure();
        lp = A.Loop({ steps: r.steps, stepDur: stepDurFn(r, r.bpm), maxSteps: r.steps * 4, onStep: (i, t) => playRhythmStep(r, i, t), onVisual: i => grid.setNow(i), onEnd: () => { lp = null; grid.setNow(-1); btn.textContent = '▶ ' + (ex.label || 'Play'); } });
        loops.push(lp); lp.start(); btn.textContent = '■ Stop';
      };
      wrap.append(h('span', { class: 'small muted', text: r.name + ' · ' + r.meter }), grid.el,
        h('button', { class: 'btn small ghost', onclick: () => openTool('rhythms', { params: { rhythm: r.id }, returnTab: 'learn' }) }, 'Tap along in the Rhythm atlas →'));
      break;
    }
    case 'melody': {
      const bpm = ex.bpm || 90, beat = 60 / bpm;
      btn.onclick = () => { A.ensure(); const t = A.now() + 0.05; (ex.notes || []).forEach((m, i) => { if (m !== null && m !== undefined) A.note(m, t + i * beat, 0.75, beat * 0.95); }); };
      wrap.append(h('span', { class: 'mono small', text: (ex.notes || []).map(m => m === null ? '–' : spell(m, true)).join(' ') }));
      break;
    }
    case 'fretboard': {
      const root = ex.root ?? (ex.pcs || [0])[0];
      btn.hidden = !ex.label; btn.disabled = true; btn.className = 'eyebrow plain'; btn.textContent = ex.label || '';
      wrap.append(fbFor((ex.pcs || []).map(pc => [pc, ((pc - root) % 12 + 12) % 12]), root));
      break;
    }
    case 'circle': {
      btn.remove();
      if (ex.label) wrap.append(h('span', { class: 'eyebrow', text: ex.label }));
      wrap.append(CircleWidget());
      break;
    }
    default: return h('span');
  }
  return wrap;
}

/* ---------- Long-form reading ---------- */
const wordsIn = secs => secs.reduce((a, x) => a + x.p.join(' ').split(/\s+/).length, 0);
function readTime(secs) { return h('span', { class: 'mono small muted', text: Math.max(1, Math.round(wordsIn(secs) / 220)) + ' min read · ' + secs.length + ' parts' }); }
/* Sections as expandable parts; the first is open so the page reads straight away */
function essay(secs, allOpen) {
  return h('div', { class: 'essay' }, secs.map((x, i) => {
    const d = h('details', { class: 'essay-sec', open: allOpen || i === 0 ? true : null },
      h('summary', {}, h('span', { class: 'mono es-n', text: String(i + 1).padStart(2, '0') }), h('span', { text: x.h })),
      h('div', { class: 'prose' }, x.p.map(t => h('p', { text: t }))));
    return d;
  }));
}

/* ---------- Techniques ---------- */
const FAMILIES = ['Picking hand', 'Fretting hand', 'Fingerstyle', 'Rhythm', 'Expression', 'Body & mind'];
function techniqueIndex() {
  view.append(h('p', { class: 'small muted', text: 'Each guide covers why the technique exists, the idea behind it, exactly how both hands move, the usual problems and their fixes, a path from first try to fluent, and recordings where you can hear it done well.' }));
  FAMILIES.forEach(f => {
    const ts = D.TECHNIQUES.filter(t => t.family === f);
    if (!ts.length) return;
    view.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: f }),
      h('div', { class: 'stylegrid' }, ts.map(t => {
        const ex = D.EXERCISES.find(e => e.id === t.id), st = ex && E.state.tech[ex.id];
        return h('button', { class: 'stylecard tech-card', onclick: () => techniquePage(t) },
          h('b', { class: 'sc-name', text: t.name }), h('span', { class: 'small muted', text: t.summary }),
          ex ? h('span', { class: 'sc-meta' }, h('span', { class: 'mono small', text: 'Tempo ladder' }), h('span', { class: 'mono small', text: (st && st.best ? st.best : '—') + ' / ' + ex.target })) : null);
      }))));
  });
}
export function techniquePage(t, back) {
  teardown(); ui.runner = { id: 'technique-guide', opts: {} }; ui.tab = 'learn'; renderTabs();
  view.innerHTML = ''; window.scrollTo(0, 0);
  whenLoaded(loadGuides, ui, view, toast, () => drawTechniquePage(t, back), false);
}
function drawTechniquePage(t, back) {
  const ex = D.EXERCISES.find(e => e.id === t.id);
  const sections = [];
  const sec = (id, title, ...kids) => { const el = h('section', { class: 'card', id: 'st-' + id }, h('h2', { text: title }), ...kids); sections.push([id, title, el]); return el; };
  view.append(h('div', { class: 'hero' },
    h('div', { class: 'spread' }, h('button', { class: 'btn ghost small', onclick: () => back ? back() : go('learn', 'techniques') }, '← Back'), h('span', { class: 'eyebrow', text: t.family })),
    h('h1', { text: t.name }), h('p', { class: 'lede', text: t.summary }),
    h('div', { class: 'row' },
      ex ? h('button', { class: 'btn brass small', onclick: () => openTool('technique', { params: { exercise: ex.id }, returnTab: 'learn' }) }, '▶ Practise on the tempo ladder') : null,
      (t.styles || []).map(id => { const r = D.REGIONS.find(x => x.id === id); return r ? h('button', { class: 'chip', onclick: () => stylePage(r) }, r.name) : null; }))));
  sec('why', 'Why it matters', h('div', { class: 'prose' }, t.why.map(p => h('p', { text: p }))));
  sec('idea', 'The deeper idea', h('div', { class: 'prose' }, t.philosophy.map(p => h('p', { text: p }))));
  sec('how', 'How to do it', essay(t.mechanics, true));
  sec('fix', 'Problems and fixes', h('div', { class: 'fixes' }, t.mistakes.map(m => h('div', { class: 'fix' }, h('b', { text: m.problem }), h('p', { class: 'small', text: m.fix })))));
  sec('path', 'From first try to fluent', h('ol', { class: 'stages' }, t.stages.map(st => h('li', {}, h('b', { text: st.name }), h('p', { class: 'small', text: st.goal }), h('p', { class: 'small muted', text: st.how })))));
  sec('hear', 'Hear it', h('ol', { class: 'records' }, t.listen.map((e, i) => h('li', { class: 'record' },
    h('span', { class: 'heardbtn static', text: String(i + 1) }),
    h('div', { class: 'rec-body' }, h('b', { text: e.work }), h('span', { class: 'small', text: e.artist }), e.note ? h('p', { class: 'small muted', text: e.note }) : null),
    ext(yt(e.artist + ' ' + e.work), 'Play', 'linkbtn rec-link')))));
  const nav = h('nav', { class: 'secnav', 'aria-label': 'Sections' }, sections.map(([id, title]) => h('button', { class: 'chip', onclick: () => document.getElementById('st-' + id).scrollIntoView({ behavior: 'smooth', block: 'start' }) }, title)));
  view.append(nav, ...sections.map(x => x[2]));
}

/* ---------- Reference ---------- */
function refIndex() {
  view.append(h('div', { class: 'tools' }, ['explorer', 'circle', 'tuner', 'drone', 'metronome'].map(id => tile(id))));
  view.append(h('p', { class: 'small muted', text: 'The explorer maps any scale or chord across the neck and shows the chords inside a scale. Reference tones help you tune by ear in eight tunings.' }));
}
