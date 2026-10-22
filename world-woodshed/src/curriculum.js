/* World Woodshed — smart practice: what to practise, when, and how much new material at once.
   Every piece of practice content (a scale on the neck, a technique, a rhythm, a tune, a lesson) is an item
   with a memory stability S in days. Predicted recall after t days is R = (1 + t / 9S)^-1 (the FSRS power
   curve), so an item is due after about S days, when R falls to 0.9. Each practice grows or shrinks S
   depending on how it went and on how long it had been (gains are bigger after longer gaps; massed
   repetition on the same day adds little). New items come in slowly, in prerequisite order, from the styles
   the player ranks first, and only when reviews are under control. Sessions are planned for the time the
   player has right now and take earlier sessions on the same day into account. */
import D from './data.js';
import E from './engine.js';

const DAY = 86400000, HOUR = 3600000;

export const PACE = {
  gentle: { name: 'Gentle', newPerDay: 1, desc: 'One new thing a day. Best if you have little time or want things to stick.' },
  steady: { name: 'Steady', newPerDay: 2, desc: 'Two new things a day, plus reviews. The default.' },
  fast: { name: 'Fast', newPerDay: 3, desc: 'Up to three new things a day if you practise most days for an hour or more.' }
};
const MOTOR = new Set(['warm', 'tech', 'rhythm', 'tune', 'drill']);
const KIND_NAME = { warm: 'scale', tech: 'technique', rhythm: 'rhythm', tune: 'tune', lesson: 'lesson', drill: 'style drill' };

/* ---------- state ---------- */
function cur() {
  const st = E.state;
  if (!st.cur) st.cur = {};
  const c = st.cur;
  if (!c.items) c.items = {};
  if (!c.prefs) c.prefs = { styles: [], pace: 'steady', goal: 30 };
  if (!c.days) c.days = {};
  return c;
}
export const prefs = () => cur().prefs;
export function setPrefs(p) { Object.assign(cur().prefs, p); E.touch(); }
function today() {
  const c = cur(), k = E.dayKey();
  if (!c.days[k]) {
    c.days[k] = { sessions: [], items: {}, fresh: [] };
    const keys = Object.keys(c.days).sort();
    while (keys.length > 45) delete c.days[keys.shift()];
  }
  return c.days[k];
}

/* ---------- catalogue ---------- */
const SCALE_ORDER = ['major', 'minpent', 'aeolian', 'majpent', 'blues', 'dorian', 'mixolydian', 'harmmin', 'phrydom', 'lydian', 'phrygian', 'melmin', 'dbharm', 'lyddom', 'hirajoshi', 'inscale', 'hungmin', 'misheberakh', 'yo', 'malkauns', 'wholetone', 'hwdim', 'altered', 'todi', 'marwa', 'purvi', 'bati', 'anchihoye'];
const TECH_ORDER = ['altpick', 'chords', 'spider', 'legato', 'travis', 'bends', 'strskip', 'hybrid', 'funkstrum', 'reststroke', 'pompe', 'pima', 'bossarh', 'picado', 'rasg', 'tremolo', 'sweep', 'konnakol'];
let catCache = null;
export function catalog() {
  if (catCache) return catCache;
  const list = [];
  const stylesOfScale = id => D.REGIONS.filter(r => r.scales.includes(id)).map(r => r.id);
  SCALE_ORDER.forEach((id, i) => {
    const sc = D.SCALES.find(x => x.id === id);
    if (!sc || !sc.steps.every(Number.isInteger)) return;
    list.push({ id: 'warm:' + id, kind: 'warm', ref: id, name: sc.name, tier: sc.tier, order: i, styles: stylesOfScale(id) });
  });
  TECH_ORDER.forEach((id, i) => {
    const ex = D.EXERCISES.find(x => x.id === id); if (!ex) return;
    const g = D.TECHNIQUES.find(t => t.id === id);
    list.push({ id: 'tech:' + id, kind: 'tech', ref: id, name: ex.name, tier: 1 + Math.floor(i / 4), order: i, styles: g ? g.styles || [] : [] });
  });
  D.RHYTHMS.forEach((r, i) => list.push({ id: 'rhythm:' + r.id, kind: 'rhythm', ref: r.id, name: r.name, tier: r.tier, order: i, styles: [r.region] }));
  let jazzIdx = 0;
  D.TUNES.forEach((t, i) => {
    const tier = t.group === 'Jazz standards' ? Math.min(5, 1 + Math.floor(jazzIdx++ / 3)) : 2;
    list.push({ id: 'tune:' + t.id, kind: 'tune', ref: t.id, name: t.name, tier, order: i, styles: [t.region || 'jazz'] });
  });
  (D.DRILLS || []).forEach((d, i) => list.push({ id: 'drill:' + d.id, kind: 'drill', ref: d.id, name: d.name, tier: d.level, order: i, styles: [d.style] }));
  D.LESSONS.forEach((l, i) => list.push({ id: 'lesson:' + l.id, kind: 'lesson', ref: l.id, name: l.title, tier: 1 + ['Foundations', 'Intermediate', 'Advanced'].indexOf(l.level), order: i, styles: [] }));
  catCache = list;
  return list;
}
const byId = id => catalog().find(x => x.id === id);

/* ---------- memory model ---------- */
export const recall = (it, now = Date.now()) => (it && it.last ? Math.pow(1 + (now - it.last) / DAY / (9 * it.s), -1) : 0);
const overdue = (it, now = Date.now()) => (it.last ? (now - it.last) / DAY / it.s : 0); // 1 = due now
const GRADES = { again: 0, hard: 1, good: 2, easy: 3 };
export const GRADE_LABEL = { again: 'Lost it', hard: 'Hard', good: 'Good', easy: 'Easy' };

/* Update an item after practising it. grade: again | hard | good | easy */
export function review(id, grade, info = {}) {
  const c = cur(), now = Date.now(), g = GRADES[grade] ?? 2;
  let it = c.items[id];
  const isNew = !it;
  if (!it) {
    it = c.items[id] = { s: [0.3, 0.5, 1, 3][g], last: now, n: 1, lapses: 0, intro: now, g };
    today().fresh.push({ id, t: now, motor: MOTOR.has((byId(id) || {}).kind) });
  } else {
    const elapsedDays = (now - it.last) / DAY;
    if (g === 0) { it.s = Math.max(0.5, it.s * 0.3); it.lapses++; }
    else if (elapsedDays < 2 / 24) it.s *= 1.05;              // massed: barely helps long-term
    else if (elapsedDays < 0.5) it.s *= g >= 2 ? 1.15 : 1;    // same day: the real spaced review is tomorrow
    else {
      // spacing: reviewing near or after the due point grows stability most
      const f = Math.max(0.25, Math.min(1.5, elapsedDays / it.s));
      it.s = it.s * (1 + f * [0, 0.2, 1.5, 2.5][g]);
    }
    it.last = now; it.n++; it.g = g;
  }
  it.s = Math.min(it.s, MOTOR.has((byId(id) || {}).kind) ? 90 : 365);
  if (info.bpm) it.bpm = info.bpm;
  if (info.key !== undefined) { it.keys = it.keys || {}; it.keys[info.key] = now; }
  if (info.pattern) it.pattern = info.pattern;
  const d = today();
  (d.items[id] = d.items[id] || []).push(now);
  E.touch();
  return { item: it, isNew };
}
/* Turn measured results into a grade: a score 0..1 (quiz, test, notes heard by the mic) */
export function gradeFromScore(score) { return score >= 0.9 ? 'easy' : score >= 0.72 ? 'good' : score >= 0.5 ? 'hard' : 'again'; }

/* ---------- style priorities ---------- */
function styleWeight(item) {
  const order = prefs().styles || [];
  if (!order.length || !item.styles || !item.styles.length) return 0.3;
  let w = 0.12;
  item.styles.forEach(s => { const i = order.indexOf(s); if (i >= 0) w = Math.max(w, 1 - i * 0.18); });
  return w;
}
export function focusStyle() {
  const order = prefs().styles || [];
  return order.length ? D.REGIONS.find(r => r.id === E.regionOfWeek().id) || null : null;
}

/* ---------- picking ---------- */
function introduced(kind) { const c = cur(); return catalog().filter(x => x.kind === kind && c.items[x.id]); }
function allowedTier(kind) {
  const c = cur();
  const est = introduced(kind).filter(x => c.items[x.id].s >= 4);
  return Math.max(1, ...est.map(x => x.tier)) + (est.length >= 2 ? 1 : 0);
}
function newCandidates(kind) {
  const c = cur();
  if (kind === 'lesson') { const l = D.LESSONS.find(x => !E.lessonDone(x.id) && !c.items['lesson:' + x.id]); return l ? [byId('lesson:' + l.id)] : []; }
  const cap = allowedTier(kind);
  // the styles you ranked first may reach one level further
  return catalog().filter(x => x.kind === kind && !c.items[x.id] && (x.tier <= cap || (x.tier <= cap + 1 && styleWeight(x) >= 0.8)))
    .map(x => ({ x, score: styleWeight(x) * 2 - x.tier * 0.35 - x.order * 0.01 + Math.random() * 0.05 }))
    .sort((a, b) => b.score - a.score).map(o => o.x);
}

/* Planning context for a session that starts now */
export function context() {
  const d = today(), now = Date.now();
  const sessions = d.sessions.slice();
  const lastEnd = sessions.length ? Math.max(...sessions.map(s => s.end || s.start)) : 0;
  const freshMotor = d.fresh.filter(f => f.motor);
  const c = cur();
  const dueBacklog = Object.entries(c.items).filter(([id, it]) => overdue(it, now) > 1.3 && MOTOR.has((byId(id) || {}).kind)).length;
  const dueNow = Object.entries(c.items).filter(([id, it]) => overdue(it, now) >= 0.9 && MOTOR.has((byId(id) || {}).kind)).length;
  const established = Object.values(c.items).filter(it => it.s >= 7).length;
  const hour = new Date().getHours();
  return {
    now, sessionNo: sessions.length + 1, minutesToday: Math.round(sessions.reduce((a, s) => a + (s.minutes || 0), 0)),
    sinceLast: lastEnd ? (now - lastEnd) / HOUR : null,
    newToday: d.fresh.length, newMotorToday: freshMotor.length,
    lastNewMotorAgo: freshMotor.length ? (now - Math.max(...freshMotor.map(f => f.t))) / HOUR : null,
    dueBacklog, dueNow, level: established < 5 ? 'beginner' : established < 15 ? 'intermediate' : 'advanced', evening: hour >= 19, budget: PACE[prefs().pace || 'steady'].newPerDay,
    practisedToday: id => (d.items[id] || []).length,
    firstToday: id => (d.items[id] || [])[0] || null,
    freshToday: d.fresh
  };
}

/* Choose the item of one kind for this session, with the reason */
export function choose(kind, ctx, used = new Set(), opts = {}) {
  const c = cur(), now = ctx.now;
  const mine = introduced(kind).filter(x => !used.has(x.id));
  const fmtAgo = t => { const hh = (now - t) / HOUR; return hh < 1 ? 'under an hour ago' : hh < 24 ? Math.round(hh) + ' h ago' : Math.round(hh / 24) + ' days ago'; };
  // 1. something new earlier today, now at least an hour old: a spaced same-day review
  const sameDay = mine.filter(x => ctx.practisedToday(x.id) === 1 && c.items[x.id].intro > now - DAY && now - ctx.firstToday(x.id) > 4 * HOUR);
  if (sameDay.length && !opts.noSameDay) {
    const x = sameDay[0];
    return { item: x, why: 'Same-day review: new ' + fmtAgo(ctx.firstToday(x.id)) + '. Coming back after a gap makes it stick.', tag: 'review' };
  }
  // 2. due reviews, most overdue first (weighted a little toward your styles)
  const due = mine.filter(x => overdue(c.items[x.id], now) >= 0.9 && !ctx.practisedToday(x.id))
    .sort((a, b) => (overdue(c.items[b.id], now) + styleWeight(b) * 0.3) - (overdue(c.items[a.id], now) + styleWeight(a) * 0.3));
  if (due.length) {
    const x = due[0], it = c.items[x.id];
    return { item: x, why: 'Review: last practised ' + fmtAgo(it.last) + ', predicted recall ' + Math.round(recall(it, now) * 100) + '%.', tag: 'review' };
  }
  // 3. something new, if the budget, the backlog and the clock allow
  const isMotor = MOTOR.has(kind);
  // the first item of each kind is free (there is nothing to review yet), up to two per session
  const starter = !mine.length && !introduced(kind).length && (opts.starters || 0) < 2 && ctx.newMotorToday + (opts.starters || 0) < 3;
  let block = null;
  if (starter) { if (opts.onStarter) opts.onStarter(); }
  else {
    if (kind === 'lesson') { if (ctx.newToday - ctx.newMotorToday >= 1) block = 'one new lesson a day is plenty'; }
    else if (ctx.newMotorToday >= ctx.budget) block = 'today’s ' + ctx.budget + ' new item' + (ctx.budget > 1 ? 's are' : ' is') + ' already in';
    else if (ctx.dueBacklog > 8 || (ctx.dueNow || 0) > (ctx.reviewRoom || 99)) block = 'reviews first: ' + Math.max(ctx.dueBacklog, ctx.dueNow || 0) + ' items are due';
    else if (isMotor && ctx.lastNewMotorAgo !== null && ctx.lastNewMotorAgo < 4) block = 'a new motor skill was learned under 4 hours ago; give it time to settle';
    else if (opts.newTaken) block = 'one new item per session';
  }
  if (!block) {
    const nc = newCandidates(kind).filter(x => !used.has(x.id));
    if (nc.length) {
      const x = nc[0], st = (prefs().styles || []).find(s => x.styles.includes(s));
      const sn = st ? (D.REGIONS.find(r => r.id === st) || {}).name : null;
      return { item: x, isNew: true, why: 'New ' + KIND_NAME[kind] + (sn ? ', from your focus on ' + sn : '') + '. Practised on its own first, then mixed in later.', tag: 'new' };
    }
  }
  // 4. keep things moving: the least recently practised item not done today
  const keep = mine.filter(x => !ctx.practisedToday(x.id)).sort((a, b) => recall(c.items[a.id], now) - recall(c.items[b.id], now));
  if (keep.length) {
    const x = keep[0];
    return { item: x, why: 'Keep it fresh: practised ' + fmtAgo(c.items[x.id].last) + '.' + (block ? ' No new ' + KIND_NAME[kind] + ' now: ' + block + '.' : ''), tag: 'maintain' };
  }
  if (mine.length) return { item: mine[0], why: 'Another round today.' + (block ? ' No new ' + KIND_NAME[kind] + ' now: ' + block + '.' : ''), tag: 'maintain' };
  return null;
}

/* ---------- content details for a scale warm-up: key, pattern, position and tempo rotate ---------- */
const KEY_ORDER = [9, 4, 7, 2, 0, 5, 11, 10, 3, 8, 1, 6]; // A E G D C F B B♭ E♭ A♭ D♭ G♭: guitar-friendly first
export function warmDetails(item) {
  const it = cur().items[item.id];
  const s = it ? it.s : 0;
  const allowed = KEY_ORDER.slice(0, Math.min(12, 3 + Math.floor(s / 3)));
  const used = (it && it.keys) || {};
  const key = allowed.slice().sort((a, b) => (used[a] || 0) - (used[b] || 0))[0];
  const pats = s < 3 ? ['updown'] : s < 7 ? ['updown', 'thirds'] : s < 14 ? ['thirds', 'fours', 'threes'] : ['thirds', 'fours', 'threes', 'sixths'];
  const pattern = pats.filter(p => p !== (it && it.pattern))[0] || pats[0];
  // positions: where the root sits on the 6th, 5th or 4th string, rotating once the scale is settled
  // (starting no higher than fret 8: the neck drawn is frets 0–12)
  const starts = [];
  [4, 9, 2].forEach(open => { let f = ((key - open) % 12 + 12) % 12; [f, f + 12].forEach(ff => { const st = Math.max(0, ff - 1); if (st <= 8 && !starts.includes(st)) starts.push(st); }); });
  starts.sort((a, b) => a - b);
  const start = s < 5 ? starts.find(x => x >= 0 && x <= 7) ?? starts[0] : starts[Math.floor(Math.random() * starts.length)];
  const bpm = Math.round((it && it.bpm) || (pattern === 'updown' ? 66 : 60));
  return { scale: item.ref, tonic: key, pattern, start, bpm, smart: true, autoPos: s >= 10 };
}

/* ---------- planning a session ---------- */
const EAR_TOOLS = ['intervals', 'chords', 'degrees', 'progressions', 'scales', 'dictation'];
function earPick(ctx, exclude) {
  const doneToday = new Set((today().sessions || []).flatMap(s => s.types || []));
  return Object.keys(E.SKILLS).filter(k => EAR_TOOLS.includes(E.SKILLS[k].tool) && !exclude.has(k)).map(k => {
    const m = E.mastery(k), days = E.daysSince(k), due = E.dueCount(k);
    return { k, p: (1 - m / 100) + Math.min(days, 10) / 10 * 0.6 + Math.min(due, 10) / 10 * 0.6 - (doneToday.has(E.SKILLS[k].tool) ? 0.8 : 0) + Math.random() * 0.1, m, due };
  }).sort((a, b) => b.p - a.p)[0];
}

/* Build a session for the minutes the player has now. Returns blocks ready for the session runner. */
export function planSession(minutes) {
  minutes = Math.max(5, Math.round(minutes));
  const ctx = context();
  const used = new Set();
  let newTaken = false, starters = 0;
  // which kind gets this session's one new item: the one with the least introduced so far, relative to its size
  const kinds = ['warm', 'tech', 'rhythm', 'tune'].concat((D.DRILLS || []).length ? ['drill'] : []);
  const share = k => introduced(k).length / Math.max(1, catalog().filter(x => x.kind === k).length) + Math.random() * 0.02;
  const newKind = kinds.slice().sort((a, b) => share(a) - share(b))[0];
  // fewer, longer blocks for beginners; more variety (interleaving) as the player advances
  const blockLen = { beginner: 7.5, intermediate: 6.5, advanced: 5.5 }[ctx.level];
  // every block gets at least two minutes, so a 5-minute ride has room for two, not three
  const nBlocks = Math.min(Math.floor(minutes / 2), Math.max(3, Math.min(10, Math.round(minutes / blockLen))));
  ctx.reviewRoom = Math.floor(nBlocks / 2);
  const blocks = [];
  const add = (kind, weight, extra) => blocks.push(Object.assign({ kind, weight }, extra || {}));
  const pickItem = (kind, opts) => {
    const motorBlocked = MOTOR.has(kind) && kind !== newKind;
    const r = choose(kind, ctx, used, Object.assign({ newTaken: newTaken || motorBlocked, starters, onStarter: () => { starters++; } }, opts || {}));
    if (r) { used.add(r.item.id); if (r.isNew) newTaken = true; }
    return r;
  };

  // evening, with a new motor skill learned earlier today: a short rerun before sleep helps it consolidate
  const freshTech = ctx.freshToday.filter(f => f.motor && ctx.now - f.t > 2 * HOUR).map(f => byId(f.id)).filter(Boolean);
  let rerun = ctx.evening && ctx.sessionNo > 1 && freshTech.length ? freshTech[0] : null;

  // 1. warm-up: a scale on the neck
  const w = pickItem('warm');
  if (w) add('warm', 0.13, w);
  // 2. the core, ranked by need
  const cands = [];
  const tech = pickItem('tech'); if (tech) cands.push(['tech', 0.17, tech]);
  const rh = pickItem('rhythm'); if (rh) cands.push(['rhythm', 0.15, rh]);
  const ear1 = earPick(ctx, new Set()); if (ear1) cands.push(['ear', 0.14, { ear: ear1 }]);
  // tuplets and the 16th grid: spaced like the ear trainers, more often when the rhythm skill is weak
  if (minutes >= 15) cands.push(['gym', 0.1 + (1 - E.mastery('tuplets') / 100) * 0.06, {}]);
  const tune = pickItem('tune'); if (tune) cands.push(['tune', 0.2, tune]);
  // style drills: the deepest material for the styles you put first
  if ((D.DRILLS || []).length && minutes >= 15) { const dr = pickItem('drill'); if (dr) cands.push(['drill', 0.16, dr]); }
  if (minutes >= 20 && E.SKILLS.reading) cands.push(['reading', 0.11, {}]);
  if (minutes >= 25) {
    const les = pickItem('lesson', { noSameDay: true });
    if (les) cands.push(['lesson', 0.11, les]);
    else cands.push(['listen', 0.09, {}]);
  }
  if (minutes >= 40) { const ear2 = earPick(ctx, new Set([ear1 && ear1.k])); if (ear2) cands.push(['ear', 0.1, { ear: ear2 }]); }
  if (minutes >= 40) cands.push(['fret', 0.07, {}]);
  if (minutes >= 50) { const sg = E.listSongs().find(x => x.lastOpened && Date.now() - x.lastOpened < 30 * DAY); if (sg) cands.push(['transcribe', 0.14, { song: sg }]); }
  if (minutes >= 60) cands.push(['listen', 0.08, {}]);
  // new items and reviews first, then the rest; keep within the block count
  const rank = c => (c[2] && c[2].isNew ? 2 : 0) + (c[2] && c[2].tag === 'review' ? 1 : 0) + c[1];
  cands.sort((a, b) => rank(b) - rank(a));
  if (rerun && (used.has(rerun.id) || nBlocks - blocks.length < 2)) rerun = null; // the rerun only when a core block still fits
  const room = nBlocks - blocks.length - (rerun ? 1 : 0);
  cands.slice(0, Math.max(1, room)).forEach(c => add(c[0], c[1], c[2]));
  if (rerun) add('rerun', 0.07, { item: rerun, why: 'Before sleep: a few minutes on today’s new ' + KIND_NAME[rerun.kind] + '. Sleep helps lock in what you practised today.' });

  // order: warm-up, then new material while fresh, then alternate kinds, study at the end
  const pos = b => b.kind === 'warm' ? 0 : b.isNew ? 1 : b.kind === 'rerun' ? 9 : ['lesson', 'listen'].includes(b.kind) ? 8 : 2;
  blocks.sort((a, b) => pos(a) - pos(b));
  for (let i = 2; i < blocks.length - 1; i++) {
    if (blocks[i].kind === blocks[i - 1].kind) { const j = blocks.findIndex((x, k) => k > i && x.kind !== blocks[i].kind && pos(x) === pos(blocks[i])); if (j > 0) [blocks[i], blocks[j]] = [blocks[j], blocks[i]]; }
  }
  // minutes: by weight, with a floor; new items get enough time to settle
  const sum = blocks.reduce((a, b) => a + b.weight, 0);
  const brk = minutes >= 45 ? Math.floor(minutes / 27) : 0; // 2-minute hand breaks, roughly every 25 minutes
  const playMin = minutes - brk * 2;
  blocks.forEach(b => { b.minutes = Math.max(b.isNew && minutes >= 20 ? 5 : 2, Math.round(playMin * b.weight / sum)); });
  let diff = playMin - blocks.reduce((a, b) => a + b.minutes, 0);
  const flex = blocks.slice().sort((a, b) => b.minutes - a.minutes);
  for (let k = 0; diff !== 0 && k < 50; k++) { const b = flex[k % flex.length]; if (diff > 0) { b.minutes++; diff--; } else if (b.minutes > 2) { b.minutes--; diff++; } }
  const out = blocks.map(toBlock);
  if (brk) {
    let run = 0;
    for (let i = 0; i < out.length - 1; i++) {
      run += out[i].minutes;
      if (run >= 24 && out.filter(b => b.type === 'break').length < brk) { out.splice(i + 1, 0, { id: E.uid('b'), type: 'break', minutes: 2, settings: {}, params: {}, reason: 'A short break: rest the hands. Gains often show up during rests.' }); run = 0; i++; }
    }
    const left = minutes - out.reduce((a, b) => a + b.minutes, 0);
    if (left) out.filter(b => b.type !== 'break').sort((a, b) => b.minutes - a.minutes)[0].minutes += left;
  }
  return { ctx, blocks: out };
}

/* A planned slot as a session block for the runner */
function toBlock(b) {
  const out = { id: E.uid('b'), minutes: b.minutes, settings: {}, params: {}, smart: true };
  const it = b.item;
  switch (b.kind) {
    case 'warm': Object.assign(out, { type: 'scalewarm', params: warmDetails(it), cur: it.id, reason: b.why }); break;
    case 'tech': Object.assign(out, { type: 'technique', params: { exercise: it.ref }, cur: it.id, reason: b.why }); break;
    case 'rhythm': Object.assign(out, { type: 'rhythms', params: { rhythm: it.ref }, cur: it.id, reason: b.why }); break;
    case 'tune': Object.assign(out, { type: 'repertoire', params: { tune: it.ref }, cur: it.id, reason: b.why }); break;
    case 'lesson': Object.assign(out, { type: 'lesson', params: { lesson: it.ref }, cur: it.id, reason: b.why }); break;
    case 'drill': Object.assign(out, { type: 'drill', params: { drill: it.ref }, cur: it.id, reason: b.why }); break;
    case 'rerun': {
      const t = { warm: 'scalewarm', tech: 'technique', rhythm: 'rhythms', tune: 'repertoire', drill: 'drill' }[it.kind];
      Object.assign(out, { type: t, params: it.kind === 'warm' ? warmDetails(it) : { exercise: it.ref, rhythm: it.ref, tune: it.ref, drill: it.ref }, cur: it.id, reason: b.why });
      break;
    }
    case 'ear': Object.assign(out, { type: E.SKILLS[b.ear.k].tool, reason: 'Ear: ' + Math.round(b.ear.m) + '% mastered' + (b.ear.due >= 3 ? ', ' + b.ear.due + ' items due' : '') + '. Missed items come back sooner.' }); break;
    case 'reading': {
      // rotate note reading, rhythm and melody; extra note drills when many notes are due
      const recent = Object.values(cur().days).flatMap(d => d.sessions || []).flatMap(x => x.types || []).filter(t => t === 'sightread').length;
      const mode = E.dueCount('reading') >= 4 ? 'notes' : ['notes', 'rhythm', 'melody'][recent % 3];
      Object.assign(out, { type: 'sightread', params: { mode }, reason: 'Sight-reading (' + { notes: 'note reading', rhythm: 'rhythm', melody: 'melody' }[mode] + ') at your level. Notes you miss come back sooner.' });
      break;
    }
    case 'gym': Object.assign(out, { type: 'gym', params: { auto: true }, reason: 'Rhythm gym: tuplets, polyrhythms and the 16th grid at your level (' + Math.round(E.mastery('tuplets')) + '% mastered). Silent bars make you keep time alone.' }); break;
    case 'fret': Object.assign(out, { type: 'fretboard', reason: 'Fretboard notes, spaced by how well you know each one.' }); break;
    case 'listen': { const r = focusStyle() || E.regionOfWeek(); Object.assign(out, { type: 'listening', params: { region: r.id }, reason: 'Listening: the next record from ' + r.name + '.' }); break; }
    case 'transcribe': Object.assign(out, { type: 'transcribe', params: { song: b.song.id }, reason: 'Transcribe: keep going on “' + b.song.title + '”.' }); break;
  }
  if (b.isNew) out.isNew = true;
  return out;
}

/* One-time: routines made before the smart plan pinned the warm-up scale and technique; let it rotate them */
export function migrate() {
  if (E.state.settings.smartMigrated) return;
  E.routines().forEach(r => {
    let changed = false;
    r.blocks.forEach(b => {
      if (b.type === 'scalewarm' && b.settings && b.settings.scale) { b.settings = {}; changed = true; }
      if (b.type === 'technique' && b.settings && b.settings.exercise) { b.settings = {}; changed = true; }
    });
    if (changed) E.saveRoutine(r);
  });
  E.setSetting('smartMigrated', true);
}

/* ---------- swapping a block ---------- */
const KIND_OF = { scalewarm: 'warm', technique: 'tech', rhythms: 'rhythm', repertoire: 'tune', lesson: 'lesson', drill: 'drill' };
/* A block for a chosen type and (optionally) specific content, wired for grading */
export function blockFor(type, ref, minutes) {
  const kind = KIND_OF[type];
  if (kind && ref) {
    const item = byId(kind + ':' + ref);
    if (item) return toBlock({ kind, item, minutes, why: 'Your choice.' });
  }
  if (kind && !ref) {
    const r = choose(kind, context(), new Set());
    if (r) return toBlock({ kind, item: r.item, minutes, why: r.why, isNew: r.isNew });
  }
  if (type === 'gym') return Object.assign(toBlock({ kind: 'gym', minutes }), ref ? { params: { ex: ref }, reason: 'Your choice.' } : {});
  // one of your own tunes: not in the catalogue, so the block just opens it, ungraded
  const params = type === 'repertoire' && ref ? { tune: ref } : {};
  return { id: E.uid('b'), type, minutes, settings: {}, params, reason: 'Your choice.' };
}
/* The plan's own alternatives for a block: same kind, a style drill, or the area that needs it most */
export function alternatives(b, usedIds = []) {
  const ctx = context(), used = new Set(usedIds.concat(b.cur ? [b.cur] : []).filter(Boolean)), out = [];
  const minutes = b.minutes;
  const kind = KIND_OF[b.type];
  if (kind) {
    const r = choose(kind, ctx, used);
    if (r) out.push({ title: 'Another ' + KIND_NAME[kind], block: toBlock({ kind, item: r.item, minutes, why: r.why, isNew: r.isNew }) });
  }
  if (b.type !== 'drill' && (D.DRILLS || []).length) {
    const r = choose('drill', ctx, used);
    if (r) out.push({ title: 'A style drill', block: toBlock({ kind: 'drill', item: r.item, minutes, why: r.why, isNew: r.isNew }) });
  }
  // the weakest area not in this session's block type
  const areas = [];
  const ear = earPick(ctx, new Set()); if (ear && !EAR_TOOLS.includes(b.type)) areas.push({ m: ear.m, block: toBlock({ kind: 'ear', ear, minutes }), title: 'Ear: ' + E.SKILLS[ear.k].name });
  if (b.type !== 'gym') areas.push({ m: E.mastery('tuplets'), block: toBlock({ kind: 'gym', minutes }), title: 'Rhythm gym' });
  if (b.type !== 'sightread' && E.SKILLS.reading) areas.push({ m: E.mastery('reading'), block: toBlock({ kind: 'reading', minutes }), title: 'Sight-reading' });
  if (b.type !== 'fretboard') areas.push({ m: E.mastery('fretboard'), block: toBlock({ kind: 'fret', minutes }), title: 'Fretboard notes' });
  areas.sort((a, c) => a.m - c.m).slice(0, 2).forEach(a => { a.block.reason = (a.block.reason || '') + ' Your weakest area right now (' + Math.round(a.m) + '% mastered).'; out.push(a); });
  return out.slice(0, 4);
}

/* Sessions in the day log (called when a session ends) */
export function logSession(s, minutes) {
  const d = today();
  d.sessions.push({ start: s.started, end: Date.now(), minutes, types: s.blocks.filter(b => b.done).map(b => b.type) });
  E.touch();
}

/* What the item looks like for a prompt or a list */
export function describeItem(id) { const x = byId(id); return x ? x.name : id; }
export function stats() {
  const c = cur(), now = Date.now();
  const items = Object.entries(c.items).map(([id, it]) => ({ id, it, x: byId(id) })).filter(o => o.x);
  return {
    learned: items.length,
    due: items.filter(o => overdue(o.it, now) >= 0.9 && MOTOR.has(o.x.kind)).length,
    strong: items.filter(o => o.it.s >= 21).length,
    byKind: ['warm', 'tech', 'rhythm', 'tune', 'drill', 'lesson'].filter(k => k !== 'drill' || (D.DRILLS || []).length).map(k => ({ kind: k, name: KIND_NAME[k], n: items.filter(o => o.x.kind === k).length, total: catalog().filter(x => x.kind === k).length }))
  };
}
export function upcoming(n = 6) {
  const c = cur(), now = Date.now();
  return Object.entries(c.items).map(([id, it]) => ({ id, name: describeItem(id), dueIn: (it.last + it.s * DAY - now) / DAY, s: it.s }))
    .sort((a, b) => a.dueIn - b.dueIn).slice(0, n);
}
/* Everything the planner will treat as a due review at time t (the rule choose() uses), most overdue first */
export function dueAt(t = Date.now()) {
  const c = cur();
  return Object.entries(c.items).map(([id, it]) => ({ id, it, x: byId(id) })).filter(o => o.x && overdue(o.it, t) >= 0.9)
    .map(o => ({ id: o.id, name: o.x.name, kind: o.x.kind, kindName: KIND_NAME[o.x.kind], recall: recall(o.it, t), overdue: overdue(o.it, t) }))
    .sort((a, b) => b.overdue - a.overdue);
}

export default { alternatives, blockFor, migrate, PACE, prefs, setPrefs, catalog, review, gradeFromScore, choose, context, planSession, warmDetails, logSession, describeItem, stats, upcoming, dueAt, recall, GRADE_LABEL, focusStyle };
