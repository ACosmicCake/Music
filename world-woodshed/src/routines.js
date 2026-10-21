/* World Woodshed — practice routine building blocks, templates and time fitting */
import D from './data.js';
import E from './engine.js';
import Cur from './curriculum.js';

/* Block categories: colour tokens live in styles.css as --c-<id> */
export const CATS = {
  warm: { name: 'Warm-up' },
  tech: { name: 'Technique' },
  rhythm: { name: 'Rhythm' },
  ear: { name: 'Ear' },
  fret: { name: 'Neck & reading' },
  music: { name: 'Music' },
  study: { name: 'Study' },
  rest: { name: 'Rest' }
};

/* Block types. tool = which tool opens; skill = where the minutes count in progress stats;
   fields = settings the user can change (see FIELD below). */
export const BLOCKS = {
  scalewarm: { name: 'Scale warm-up', cat: 'warm', tool: 'scalewarm', skill: 'technique', minutes: 8, fields: ['scale', 'tonic', 'pattern', 'bpm'], desc: 'A scale in one position with the metronome. The tempo climbs as you stay clean.' },
  technique: { name: 'Technique', cat: 'tech', tool: 'technique', skill: 'technique', minutes: 10, fields: ['exercise'], desc: 'A tempo ladder for one exercise: picking, legato, rasgueado, travis and more.' },
  callresp: { name: 'Call & response', cat: 'tech', tool: 'callresp', skill: 'callresp', minutes: 8, fields: [], desc: 'Hear a phrase, play it back on the fretboard.' },
  rhythms: { name: 'Rhythm & groove', cat: 'rhythm', tool: 'rhythms', skill: 'rhythmTap', minutes: 10, fields: ['rhythm'], desc: 'Loop a rhythm from anywhere in the world and take the tap-along test.' },
  gym: { name: 'Rhythm gym', cat: 'rhythm', tool: 'gym', skill: 'tuplets', minutes: 8, fields: [], desc: 'Tuplets, polyrhythms, the 16th grid, displaced clicks and echo, over a felt 16th pulse.' },
  metronome: { name: 'Metronome practice', cat: 'rhythm', tool: 'metronome', skill: 'clock', minutes: 10, fields: ['bpm'], desc: 'Play anything against the click, with gap bars to test your time.' },
  clock: { name: 'Internal clock', cat: 'rhythm', tool: 'clock', skill: 'clock', minutes: 5, fields: [], desc: 'Keep the beat when the click drops out.' },
  rhythmid: { name: 'Rhythm ID', cat: 'rhythm', tool: 'rhythmid', skill: 'rhythmId', minutes: 5, fields: [], desc: 'Name rhythms by ear.' },
  intervals: { name: 'Intervals', cat: 'ear', tool: 'intervals', skill: 'intervals', minutes: 8, fields: [], desc: 'Name the distance between two notes.' },
  degrees: { name: 'Scale degrees', cat: 'ear', tool: 'degrees', skill: 'degrees', minutes: 8, fields: [], desc: 'Hear each note against the key.' },
  chords: { name: 'Chord qualities', cat: 'ear', tool: 'chords', skill: 'chords', minutes: 8, fields: [], desc: 'Major, minor, sevenths and beyond by ear.' },
  progressions: { name: 'Progressions', cat: 'ear', tool: 'progressions', skill: 'progressions', minutes: 8, fields: [], desc: 'Follow chord changes by ear.' },
  scales: { name: 'Scales by ear', cat: 'ear', tool: 'scales', skill: 'scales', minutes: 6, fields: [], desc: 'Ragas, maqamat and modes over a drone.' },
  dictation: { name: 'Melodic dictation', cat: 'ear', tool: 'dictation', skill: 'dictation', minutes: 8, fields: [], desc: 'Hear a short melody in a key and write it back.' },
  drone: { name: 'Drone improvisation', cat: 'ear', tool: 'drone', skill: 'scales', minutes: 10, fields: ['scale', 'tonic'], desc: 'Improvise in a raga, maqam or mode over a tanpura drone.' },
  sightread: { name: 'Sight-reading', cat: 'fret', tool: 'sightread', skill: 'reading', minutes: 8, fields: [], desc: 'Read notes, rhythms and melodies from the staff, level by level.' },
  fretboard: { name: 'Fretboard notes', cat: 'fret', tool: 'fretboard', skill: 'fretboard', minutes: 6, fields: [], desc: 'Find any note on any string, fast.' },
  explorer: { name: 'Chords & scales on the neck', cat: 'fret', tool: 'explorer', skill: 'fretboard', minutes: 8, fields: [], desc: 'Map a scale or chord across the whole neck and play through it.' },
  drill: { name: 'Style drill', cat: 'music', tool: 'drill', skill: null, minutes: 10, fields: ['drill'], desc: 'An exercise from one of the styles: a backing loop, rotating variations and a tempo ladder.' },
  repertoire: { name: 'Repertoire & improvising', cat: 'music', tool: 'repertoire', skill: 'repertoire', minutes: 15, fields: ['tune'], desc: 'Loop a tune\'s changes in its groove and improvise over them.' },
  transcribe: { name: 'Transcribe a song', cat: 'music', tool: 'transcribe', skill: 'transcribe', minutes: 15, fields: ['song'], desc: 'Slow down and loop a recording, then work out the notes.' },
  free: { name: 'Free practice', cat: 'music', tool: 'free', skill: null, minutes: 10, fields: ['title', 'notes', 'bpm'], desc: 'Your own item: songs, pieces, anything. A timer, notes and an optional click.' },
  lesson: { name: 'Theory lesson', cat: 'study', tool: 'lesson', skill: null, minutes: 10, fields: ['lesson'], desc: 'Read and play through a lesson from the course.' },
  listening: { name: 'Active listening', cat: 'study', tool: 'listening', skill: null, minutes: 10, fields: ['style'], desc: 'Hear a key recording from a style with a guide to what to listen for.' },
  atlasquiz: { name: 'World music quiz', cat: 'study', tool: 'atlasquiz', skill: 'atlas', minutes: 5, fields: ['style'], desc: 'Questions on rhythms, scales, instruments and players.' },
  away: { name: 'No-guitar drill', cat: 'tech', tool: 'away', skill: null, minutes: 8, fields: ['drill'], desc: 'Practice without the instrument: finger independence on a table, konnakol, seeing the neck in your head, singing degrees.' },
  break: { name: 'Break', cat: 'rest', tool: 'rest', skill: null, minutes: 5, fields: [], fixed: true, desc: 'Rest your hands, stretch, drink water.' }
};
export const BLOCK_ORDER = ['scalewarm', 'technique', 'callresp', 'rhythms', 'gym', 'metronome', 'clock', 'rhythmid', 'intervals', 'degrees', 'chords', 'progressions', 'scales', 'dictation', 'drone', 'sightread', 'fretboard', 'explorer', 'drill', 'repertoire', 'transcribe', 'free', 'lesson', 'listening', 'atlasquiz', 'away', 'break'];

export const PATTERNS = {
  updown: 'Up and down',
  thirds: 'In 3rds',
  fours: 'Groups of 4',
  threes: 'Groups of 3',
  sixths: 'In 6ths'
};

export const DRILLS = {
  fingers: 'Finger independence (tabletop)',
  konnakol: 'Konnakol: say and clap',
  visualise: 'See the neck in your head',
  sing: 'Sing the degrees'
};

/* Blocks that need the guitar in your hands, and what to do instead without it */
const AWAY_SWAP = {
  scalewarm: b => ({ drill: 'visualise', scale: (b.settings || {}).scale, tonic: (b.settings || {}).tonic }),
  technique: () => ({ drill: 'fingers' }),
  free: () => ({ drill: 'visualise' })
};
export const needsGuitar = b => !!AWAY_SWAP[b.type];
export function awayBlocks(blocks) {
  return blocks.map(b => {
    if (!AWAY_SWAP[b.type]) return JSON.parse(JSON.stringify(b));
    return { id: E.uid('b'), type: 'away', minutes: b.minutes, settings: AWAY_SWAP[b.type](b), reason: 'Instead of ' + blockTitle(b).toLowerCase() };
  });
}

/* Scales a warm-up can use (no quarter tones) */
export const warmScales = () => D.SCALES.filter(x => x.steps.every(Number.isInteger));

/* Human summary of a block's settings */
export function describe(b) {
  const st = b.settings || {}, def = BLOCKS[b.type];
  const scale = id => (D.SCALES.find(x => x.id === id) || {}).name;
  const parts = [];
  switch (b.type) {
    case 'scalewarm': {
      const src = b.params && b.params.scale ? b.params : st.scale && st.scale !== 'auto' ? st : null;
      if (!src) { parts.push('Smart choice: scale, key, pattern and tempo rotate for you'); break; }
      parts.push((D.NOTE_NAMES[src.tonic ?? 0]) + ' ' + (scale(src.scale) || ''), PATTERNS[src.pattern || 'updown'].toLowerCase(), (src.bpm || 72) + ' bpm');
      break;
    }
    case 'drone': parts.push(st.scale ? D.NOTE_NAMES[st.tonic ?? 2] + ' ' + scale(st.scale) : 'Pick on the day'); break;
    case 'technique': { const ex = st.exercise || (b.params && b.params.exercise); parts.push(ex && ex !== 'auto' ? (D.EXERCISES.find(e => e.id === ex) || {}).name : 'Smart choice: rotates for you'); break; }
    case 'rhythms': { const rid = st.rhythm || (b.params && b.params.rhythm); parts.push(rid && rid !== 'auto' ? (D.RHYTHMS.find(r => r.id === rid) || {}).name : 'Smart choice: rotates for you'); break; }
    case 'repertoire': { const tid = st.tune || (b.params && b.params.tune); parts.push(tid && tid !== 'auto' ? (D.TUNES.find(t => t.id === tid) || {}).name : 'Smart choice: rotates for you'); break; }
    case 'drill': { const did = st.drill && st.drill !== 'auto' ? st.drill : b.params && b.params.drill; const dd = did && (D.DRILLS || []).find(x => x.id === did); parts.push(dd ? dd.name + ' (' + ((D.REGIONS.find(r => r.id === dd.style) || {}).name || dd.style) + ')' : 'Smart choice: from the styles you put first'); break; }
    case 'transcribe': { const sg = st.song && st.song !== 'auto' ? E.getSong(st.song) : null; parts.push(sg ? sg.title : 'Your most recent song'); break; }
    case 'lesson': { const lid = st.lesson && st.lesson !== 'auto' ? st.lesson : b.params && b.params.lesson; parts.push(lid ? (D.LESSONS.find(l => l.id === lid) || {}).title : 'Smart choice: new lessons and reviews'); break; }
    case 'listening': case 'atlasquiz': parts.push(st.style && st.style !== 'auto' ? (D.REGIONS.find(r => r.id === st.style) || {}).name : 'Style of the week'); break;
    case 'free': parts.push(st.notes ? st.notes.split('\n')[0].slice(0, 60) : 'Timer with notes'); if (st.bpm) parts.push(st.bpm + ' bpm'); break;
    case 'metronome': if (st.bpm) parts.push(st.bpm + ' bpm'); break;
    case 'away': parts.push(st.drill ? DRILLS[st.drill] : 'A different drill each time'); if (b.reason) parts.push(b.reason); break;
    default: if (b.reason) parts.push(b.reason); else parts.push(def ? def.desc : '');
  }
  return parts.filter(Boolean).join(' · ');
}
export function blockTitle(b) {
  if (b.type === 'free' && b.settings && b.settings.title) return b.settings.title;
  return BLOCKS[b.type] ? BLOCKS[b.type].name : b.type;
}

/* Tool params for a block, resolving 'auto' choices at start time */
export function paramsFor(b, used = new Set()) {
  const st = b.settings || {}, out = Object.assign({}, b.params || {});
  const rw = E.regionOfWeek();
  const auto = v => v === undefined || v === null || v === '' || v === 'auto';
  // unpinned content comes from the smart plan, which also records how it went
  const smart = kind => {
    if (b.cur) return null;
    const r = Cur.choose(kind, Cur.context(), used);
    if (!r) return null;
    b.cur = r.item.id; b.reason = r.why; if (r.isNew) b.isNew = true; used.add(r.item.id);
    return r.item;
  };
  switch (b.type) {
    case 'scalewarm': {
      if (auto(st.scale) && !out.scale) { const it = smart('warm'); if (it) { Object.assign(out, Cur.warmDetails(it)); break; } }
      Object.assign(out, { scale: out.scale || st.scale || 'major', tonic: out.tonic ?? st.tonic ?? 0, pattern: out.pattern || st.pattern || 'updown', bpm: out.bpm || st.bpm || 72 });
      break;
    }
    case 'drone': if (st.scale) Object.assign(out, { scale: st.scale, tonic: st.tonic ?? 2 }); else if (!out.scale) out.scale = rw.scales.find(id => D.SCALES.find(x => x.id === id)) || 'dorian'; break;
    case 'technique': {
      if (!auto(st.exercise)) out.exercise = st.exercise;
      else if (!out.exercise) { const it = smart('tech'); out.exercise = it ? it.ref : E.techPick().id; }
      break;
    }
    case 'rhythms': {
      if (!auto(st.rhythm)) out.rhythm = st.rhythm;
      else if (!out.rhythm) { const it = smart('rhythm'); if (it) out.rhythm = it.ref; else out.region = rw.id; }
      break;
    }
    case 'repertoire': {
      if (!auto(st.tune)) out.tune = st.tune;
      else if (!out.tune) { const it = smart('tune'); if (it) out.tune = it.ref; }
      break;
    }
    case 'drill': {
      if (!auto(st.drill)) out.drill = st.drill;
      else if (!out.drill) { const it = smart('drill'); if (it) out.drill = it.ref; }
      break;
    }
    case 'transcribe': {
      const id = st.song && st.song !== 'auto' ? st.song : out.song || (E.listSongs()[0] || {}).id;
      if (id) out.song = id;
      break;
    }
    case 'lesson': {
      if (!auto(st.lesson)) out.lesson = st.lesson;
      else if (!out.lesson) { const it = smart('lesson'); out.lesson = it ? it.ref : nextLesson().id; }
      break;
    }
    case 'listening': case 'atlasquiz': out.region = st.style && st.style !== 'auto' ? st.style : (out.region || rw.id); break;
    case 'free': Object.assign(out, { title: st.title || 'Free practice', notes: st.notes || '', bpm: st.bpm || 0 }); break;
    case 'metronome': if (st.bpm) out.bpm = st.bpm; break;
    case 'gym': if (!out.ex) out.auto = true; break;
    case 'away': Object.assign(out, { drill: st.drill || Object.keys(DRILLS)[Math.floor(Math.random() * 4)] }); if (st.scale) out.scale = st.scale; if (st.tonic !== undefined) out.tonic = st.tonic; break;
  }
  return out;
}
export function nextLesson() { return D.LESSONS.find(l => !E.lessonDone(l.id)) || D.LESSONS[0]; }

/* ---------- Time fitting ---------- */
export const totalOf = blocks => blocks.reduce((a, b) => a + (b.minutes || 0), 0);
export const BREAK_EVERY = 50;

/* Scale the flexible blocks so the whole routine lasts `total` minutes (breaks keep their length) */
export function fitTo(blocks, total) {
  const flex = blocks.filter(b => !BLOCKS[b.type] || !BLOCKS[b.type].fixed);
  const fixed = totalOf(blocks) - totalOf(flex);
  const target = Math.max(flex.length, Math.round(total - fixed));
  const w = flex.map(b => Math.max(0.5, b.weight || b.minutes || 1));
  const sum = w.reduce((a, b) => a + b, 0) || 1;
  const raw = w.map(x => Math.max(1, x / sum * target));
  const mins = raw.map(Math.floor);
  let left = target - mins.reduce((a, b) => a + b, 0);
  const order = raw.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]);
  for (let k = 0; left > 0 && order.length; k = (k + 1) % order.length, left--) mins[order[k][1]]++;
  for (let k = order.length - 1; left < 0 && k >= 0; k--) { const i = order[k][1]; if (mins[i] > 1) { mins[i]--; left++; } }
  flex.forEach((b, i) => { b.minutes = mins[i]; });
  return blocks;
}

/* Insert a short break after roughly every 50 minutes of practice (or remove auto breaks) */
export function placeBreaks(blocks, on) {
  const out = blocks.filter(b => !(b.type === 'break' && b.auto));
  if (!on) return out;
  const practice = totalOf(out.filter(b => b.type !== 'break'));
  if (practice < 75) return out;
  const res = [];
  let run = 0;
  out.forEach(b => {
    if (b.type === 'break') { res.push(b); run = 0; return; }
    // break before a block that would take this stretch well past BREAK_EVERY minutes
    if (run >= 30 && run + b.minutes > BREAK_EVERY + 10 && res[res.length - 1].type !== 'break') { res.push(newBlock('break', { auto: true })); run = 0; }
    res.push(b);
    run += b.minutes;
  });
  return res;
}

/* Set the routine's total length. With breaks on, the total includes them. */
export function setTotal(r, total) {
  total = Math.max(5, Math.min(600, Math.round(total)));
  let blocks = r.blocks.filter(b => !(b.type === 'break' && b.auto));
  blocks.forEach(b => { if (!b.weight) b.weight = b.minutes; }); // weights keep repeated resizing from drifting
  let n = 0, placed = blocks;
  for (let pass = 0; pass < 5; pass++) {
    fitTo(blocks, total - n * BLOCKS.break.minutes);
    placed = placeBreaks(blocks, r.breaks);
    const m = placed.filter(b => b.type === 'break' && b.auto).length;
    if (m === n) break;
    n = m;
  }
  const diff = total - totalOf(placed);
  if (diff) {
    const flex = placed.filter(b => !BLOCKS[b.type].fixed).sort((a, b) => b.minutes - a.minutes);
    if (flex.length) flex[0].minutes = Math.max(1, flex[0].minutes + diff);
  }
  r.blocks = placed;
  return r;
}
/* After editing one block's length, refresh the weights so later resizes keep the new balance */
export function syncWeights(r) { r.blocks.forEach(b => { b.weight = b.minutes; }); }

export function newBlock(type, extra) {
  const def = BLOCKS[type];
  return Object.assign({ id: E.uid('b'), type, minutes: def.minutes, settings: {} }, extra || {});
}

/* ---------- Templates ---------- */
export const TEMPLATES = [
  { id: 'essentials', name: 'Daily essentials', minutes: 60, desc: 'A bit of everything: a scale warm-up, technique, time, ear, the neck and real music.',
    blocks: [['scalewarm', 8], ['technique', 8], ['rhythms', 10], ['intervals', 6], ['chords', 5], ['fretboard', 5], ['repertoire', 13], ['listening', 5]] },
  { id: 'quick', name: 'Quick daily', minutes: 20, desc: 'When time is short: warm up, groove, ears, play.',
    blocks: [['scalewarm', 5], ['rhythms', 5], ['intervals', 4], ['repertoire', 6]] },
  { id: 'jazz', name: 'Jazz guitarist', minutes: 90, desc: 'Arpeggios and modes, guide tones through standards, comping, transcription and theory.',
    blocks: [['scalewarm', 8], ['technique', 8], ['chords', 6], ['progressions', 6], ['repertoire', 25, { tune: 'autumn' }], ['transcribe', 20], ['lesson', 10], ['listening', 7, { style: 'jazz' }]] },
  { id: 'world', name: 'World explorer', minutes: 60, desc: 'Ragas over a drone, rhythms from your style of the week, world scales and the records that matter.',
    blocks: [['scalewarm', 6], ['drone', 12], ['rhythms', 12], ['scales', 6], ['repertoire', 12], ['listening', 8], ['atlasquiz', 4]] },
  { id: 'technique', name: 'Technique builder', minutes: 60, desc: 'Clean, fast, relaxed hands: scales, two technique ladders, ear-to-hand and free application.',
    blocks: [['scalewarm', 10], ['technique', 14], ['technique', 12], ['callresp', 8], ['fretboard', 6], ['free', 10, { title: 'Apply it', notes: 'Improvise over a backing track using today\'s technique.' }]] },
  { id: 'ear', name: 'Ear first', minutes: 45, desc: 'Intervals to progressions, then hands and a real recording.',
    blocks: [['intervals', 7], ['degrees', 7], ['chords', 7], ['progressions', 7], ['callresp', 7], ['transcribe', 10]] },
  { id: 'bluesrock', name: 'Blues & rock', minutes: 60, desc: 'Pentatonic boxes, bends in tune, shuffle and backbeat time, a 12-bar and the records.',
    blocks: [['scalewarm', 8], ['technique', 8], ['rhythms', 8, { rhythm: 'shuffle' }], ['repertoire', 18, { tune: 'blues12' }], ['callresp', 8], ['listening', 10, { style: 'blues' }]] },
  { id: 'noguitar', name: 'No guitar today', minutes: 30, desc: 'Everything you can do with just the phone and your voice: ears, rhythm, finger drills, theory and records.',
    blocks: [['intervals', 4], ['degrees', 3], ['away', 4, { drill: 'sing' }], ['rhythms', 4], ['away', 3, { drill: 'konnakol' }], ['fretboard', 3], ['away', 3, { drill: 'fingers' }], ['lesson', 4], ['listening', 2]] },
  { id: 'commute', name: 'Commute', minutes: 15, desc: 'Headphones on, no instrument: quick ear reps, a mental run through a scale and one record.',
    blocks: [['intervals', 4], ['chords', 3], ['away', 4, { drill: 'visualise' }], ['listening', 4]] },
  { id: 'marathon', name: 'Deep session', minutes: 180, desc: 'A long day in the woodshed, with breaks: every area, plus time for your own pieces.',
    blocks: [['scalewarm', 10], ['technique', 15], ['rhythms', 15], ['metronome', 10], ['intervals', 8], ['chords', 8], ['progressions', 8], ['fretboard', 8], ['repertoire', 25], ['transcribe', 20], ['lesson', 12], ['free', 15, { title: 'Pieces & songs' }], ['listening', 11]] }
];

export function fromTemplate(t, minutes, opts = {}) {
  const r = {
    id: E.uid('r'), name: opts.name || t.name, template: t.id, breaks: (minutes || t.minutes) >= 90, autoAdvance: true,
    blocks: t.blocks.map(([type, w, settings]) => Object.assign(newBlock(type), { minutes: w, weight: w, settings: Object.assign({}, settings || {}) }))
  };
  return setTotal(r, minutes || t.minutes);
}

export function fmtMin(m) {
  m = Math.round(m);
  if (m < 60) return m + ' min';
  const hh = Math.floor(m / 60), mm = m % 60;
  return hh + ' h' + (mm ? ' ' + mm + ' min' : '');
}
export function fmtClock(sec) {
  sec = Math.max(0, Math.round(sec));
  const hh = Math.floor(sec / 3600), mm = Math.floor((sec % 3600) / 60), ss = sec % 60;
  return (hh ? hh + ':' + String(mm).padStart(2, '0') : String(mm)) + ':' + String(ss).padStart(2, '0');
}
