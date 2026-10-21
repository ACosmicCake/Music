/* World Woodshed — On the go: practice for a commute, with headphones and no guitar.
   1. "How long is your ride?" plans a smart session from things that need only the phone.
   2. Hands-free ear training: a question plays, a pause to answer in your head, then the answer is spoken.
      Grade with a tap anywhere (left: missed, right: got it) or with headphone buttons, so the phone can
      stay in your hand or pocket. Grades feed the same spaced repetition as the quizzes. */
import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import Cur from '../curriculum.js';
import { h, tool, toast, openTool } from '../ui/core.js';
import { chordMidis } from '../theory.js';
import { BLOCKS, blockTitle, describe, totalOf, fmtMin } from '../routines.js';
import { startSession } from '../ui/session.js';
import { ribbon } from '../ui/routine.js';
import { speak, stopSpeaking, keepAwake, isNative } from '../native.js';
import './commute.css';

const RIDES = [5, 10, 15, 20, 30, 45, 60];
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

/* Swap anything that needs the guitar for something that doesn't */
function commuteBlocks(blocks) {
  return blocks.map(b0 => {
    const b = JSON.parse(JSON.stringify(b0)), p = b.params || {};
    const as = (type, params, why) => Object.assign(b, { type, params: Object.assign({}, params), settings: Object.assign({}, params), reason: why || b.reason });
    switch (b.type) {
      case 'scalewarm': return as('away', { drill: 'visualise', scale: p.scale, tonic: p.tonic }, 'See the scale on the neck in your head');
      case 'technique': return as('away', { drill: 'fingers' }, 'Finger independence, tapping on your leg');
      case 'free': return as('away', { drill: 'visualise' });
      case 'callresp': return as('dictation', {}, 'Hear it and write it back, instead of playing it back');
      case 'drill': {
        const d = (D.DRILLS || []).find(x => x.id === p.drill);
        const r = d && d.backing && d.backing.rhythm;
        return r ? as('rhythms', { rhythm: r }, 'Tap the rhythm from ' + d.name.toLowerCase()) : as('away', { drill: 'sing' }, 'Sing the degrees');
      }
      case 'repertoire': return as('repertoire', Object.assign({}, p, { ear: true }), 'Follow the form by ear with headphones');
      case 'transcribe': return as('listening', {});
      case 'metronome': return as('clock', {});
      case 'sightread': return as('sightread', Object.assign({}, p, { mode: p.mode === 'melody' ? 'rhythm' : (p.mode || 'notes') }));
      default: return b;
    }
  });
}

/* ---------- hands-free questions ---------- */
const SKILL_SET = { mix: ['intervals', 'chords', 'degrees'], intervals: ['intervals'], chords: ['chords'], degrees: ['degrees'] };
function cadence(t, at) {
  const I = [t - 12, t - 5, t, t + 4], IV = [t - 7, t - 3, t, t + 5], V = [t - 5, t - 1, t + 2, t + 7];
  [I, IV, V, I].forEach((c, i) => A.strum(c, at + i * 0.6, 0.55, 0.02, 0.8));
  return at + 4 * 0.6;
}
function question(skill) {
  const item = E.pick(skill) || E.unlocked(skill)[0];
  if (!item) return null;
  if (skill === 'intervals') {
    const [id, dir] = item.id.split(':');
    const iv = D.INTERVALS.find(i => i.id === id);
    const root = dir === 'down' ? rand(55, 62) : rand(48, 57);
    return {
      skill, id: item.id, prompt: 'Which interval?', answer: iv.name + (dir === 'up' ? ' ↑' : dir === 'down' ? ' ↓' : ' (together)'),
      say: iv.name + (dir === 'up' ? ', going up' : dir === 'down' ? ', going down' : ', together'),
      play() {
        const t = A.now() + 0.08;
        if (dir === 'up') { A.note(root, t, 0.8, 1); A.note(root + iv.semi, t + 0.8, 0.8, 1.3); return 2.3; }
        if (dir === 'down') { A.note(root + iv.semi, t, 0.8, 1); A.note(root, t + 0.8, 0.8, 1.3); return 2.3; }
        A.note(root, t, 0.65, 1.8); A.note(root + iv.semi, t, 0.65, 1.8); return 2;
      }
    };
  }
  if (skill === 'chords') {
    const c = D.CHORDS.find(x => x.id === item.id);
    const root = rand(45, 53);
    return {
      skill, id: c.id, prompt: 'Which chord quality?', answer: c.name, say: c.name,
      play() {
        const t = A.now() + 0.08, ms = chordMidis(root, c.iv);
        ms.forEach((m, i) => A.note(m, t + i * 0.16, 0.55, 0.9));
        A.strum(ms, t + ms.length * 0.16 + 0.35, 0.8, 0.02, 1.8);
        return ms.length * 0.16 + 2.2;
      }
    };
  }
  const d = D.DEGREES.find(x => x.id === item.id);
  const tonic = rand(55, 63);
  return {
    skill: 'degrees', id: d.id, prompt: 'Which degree of the key?', answer: d.id + ' · ' + d.solf + ' · ' + d.sargam, say: 'Degree ' + d.id.replace('b', ' flat ').replace('#', ' sharp ') + ', ' + d.solf,
    play() { const at = cadence(tonic, A.now() + 0.08); A.note(tonic + d.semi, at + 0.5, 0.85, 1.6); return at - A.now() + 2.2; }
  };
}
/* a silent looping <audio> keeps a media session alive, so headphone buttons and the lock screen reach us */
function silentAudio() {
  const sr = 8000, n = sr, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
  const a = new Audio(URL.createObjectURL(new Blob([buf], { type: 'audio/wav' })));
  a.loop = true; a.volume = 0.01;
  return a;
}

tool('commute', {
  tab: 'train', skill: null, title: 'On the go', eyebrow: 'Commute · headphones, no guitar',
  desc: 'Practice on the bus or train: a session that needs only the phone, or hands-free ear training you can do with the screen in your pocket.',
  render(body, ctx) {
    const pref = Object.assign({ set: 'mix', wait: 3, voice: true }, E.state.settings.commute || {});
    const save = () => E.setSetting('commute', Object.assign({}, pref));
    let run = null;

    /* 1. a ride-length session */
    const plan = h('div', { class: 'card' });
    let minutes = null, blocks = null;
    function drawPlan() {
      plan.innerHTML = '';
      plan.append(h('span', { class: 'eyebrow', text: 'Smart session, no guitar' }), h('h2', { text: 'How long is your ride?' }),
        h('div', { class: 'chips presets' }, RIDES.map(m => h('button', { class: 'chip', 'aria-pressed': m === minutes ? 'true' : 'false', onclick: () => { minutes = m; blocks = commuteBlocks(Cur.planSession(m).blocks.filter(b => b.type !== 'break')); drawPlan(); } }, fmtMin(m)))));
      if (!blocks) { plan.append(h('p', { class: 'small muted', text: 'The plan picks what is due from your own progress, then swaps anything that needs the guitar: scale positions become seeing the neck in your head, call & response becomes dictation, tunes become following the form by ear.' })); return; }
      plan.append(ribbon(blocks),
        h('ol', { class: 'blocks static smartlist' }, blocks.map(b => h('li', { class: 'brow cat-' + BLOCKS[b.type].cat },
          h('div', { class: 'bmain' }, h('span', { class: 'bicon' }), h('div', { class: 'btext' }, h('b', { text: blockTitle(b) }), h('span', { class: 'small muted', text: b.reason || describe(b) })), h('span', { class: 'mono small', text: b.minutes + 'm' }))))),
        h('div', { class: 'row' }, h('button', { class: 'btn brass big', onclick: () => startSession({ name: 'On the go', blocks, autoAdvance: true }) }, '▶ Start · ' + fmtMin(totalOf(blocks))),
          h('button', { class: 'btn ghost', onclick: () => { blocks = commuteBlocks(Cur.planSession(minutes).blocks.filter(b => b.type !== 'break')); drawPlan(); } }, 'Shuffle')));
    }
    drawPlan();

    /* 2. hands-free ear training */
    const hf = h('div', { class: 'card' });
    function drawHf() {
      hf.innerHTML = '';
      const seg = (opts, cur, on) => h('div', { class: 'seg' }, opts.map(([k, t]) => h('button', { 'aria-pressed': String(k === cur), onclick: () => { on(k); save(); drawHf(); } }, t)));
      hf.append(h('span', { class: 'eyebrow', text: 'Hands-free' }), h('h2', { text: 'Ear training with the screen in your pocket' }),
        h('p', { class: 'small', text: 'A question plays, you answer in your head, then the answer is spoken. Tap the right half of the screen if you got it, the left half if you missed it' + (isNative() ? '' : ', or use your headphone buttons: next = got it, previous = missed') + '. Your answers go into the same reviews as the quizzes.' }),
        h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'What' }), seg([['mix', 'Mixed'], ['intervals', 'Intervals'], ['chords', 'Chords'], ['degrees', 'Degrees']], pref.set, k => { pref.set = k; })),
        h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Time to answer' }), seg([[2, '2 s'], [3, '3 s'], [5, '5 s'], [8, '8 s']], pref.wait, k => { pref.wait = k; })),
        h('label', { class: 'check small' }, h('input', { type: 'checkbox', checked: pref.voice ? true : null, onchange: e => { pref.voice = e.target.checked; save(); } }), 'Speak the answers'),
        h('button', { class: 'btn brass big', onclick: startHf }, '▶ Start hands-free'));
    }
    drawHf();

    /* 3. the rest of the phone-only tools */
    const more = h('div', { class: 'card' }, h('span', { class: 'eyebrow', text: 'Also good on the go' }),
      h('div', { class: 'chips' }, [['dictation', 'Melodic dictation'], ['intervals', 'Intervals'], ['degrees', 'Scale degrees'], ['sightread', 'Sight-reading'], ['rhythms', 'Tap rhythms'], ['gym', 'Rhythm gym'], ['clock', 'Internal clock'], ['fretboard', 'Fretboard notes'], ['away', 'Konnakol & visualising'], ['lesson', 'Theory lessons'], ['listening', 'Listening path']]
        .map(([id, t]) => h('button', { class: 'chip', onclick: () => openTool(id, { returnTab: 'train', params: id === 'sightread' ? { mode: 'notes' } : id === 'away' ? { drill: 'konnakol' } : {} }) }, t))),
      h('p', { class: 'small muted', text: 'Everything works offline. Headphones help: the sounds are quiet details, and nobody else has to hear your intervals.' }));
    body.append(plan, hf, more);

    function startHf() {
      if (run) return;
      A.ensure();
      const skills = SKILL_SET[pref.set].filter(k => E.unlocked(k).length);
      if (!skills.length) { toast('Nothing unlocked yet'); return; }
      run = { alive: true, n: 0, got: 0, wake: null, grade: null, paused: false };
      const r = run;
      const scr = h('div', { class: 'pocket', role: 'dialog', 'aria-label': 'Hands-free ear training' });
      const status = h('div', { class: 'pk-status mono' });
      const big = h('div', { class: 'pk-big' });
      const sub = h('div', { class: 'pk-sub' });
      const left = h('button', { class: 'pk-half pk-miss', 'aria-label': 'Missed it' }, h('span', { text: '✗ missed' }));
      const right = h('button', { class: 'pk-half pk-got', 'aria-label': 'Got it' }, h('span', { text: '✓ got it' }));
      const stopBtn = h('button', { class: 'pk-stop', onclick: () => stopHf() }, '■ Stop');
      const pauseBtn = h('button', { class: 'pk-stop', onclick: () => { r.paused = !r.paused; pauseBtn.textContent = r.paused ? '▶ Resume' : '❚❚ Pause'; if (!r.paused && r.wake) r.wake(); } }, '❚❚ Pause');
      scr.append(h('div', { class: 'pk-top' }, status, h('div', { class: 'row' }, pauseBtn, stopBtn)), h('div', { class: 'pk-mid' }, big, sub), h('div', { class: 'pk-halves' }, left, right));
      document.body.append(scr);
      keepAwake(true);
      const grade = ok => { if (r.grade) { const g = r.grade; r.grade = null; g(ok); } };
      left.onclick = () => grade(false); right.onclick = () => grade(true);
      // headphone buttons through a media session (the browser and the installed web app)
      let silent = null;
      if ('mediaSession' in navigator && !isNative()) {
        try {
          silent = silentAudio(); silent.play().catch(() => {});
          navigator.mediaSession.metadata = new MediaMetadata({ title: 'Hands-free ear training', artist: 'World Woodshed' });
          navigator.mediaSession.setActionHandler('nexttrack', () => grade(true));
          navigator.mediaSession.setActionHandler('previoustrack', () => grade(false));
          navigator.mediaSession.setActionHandler('pause', () => { r.paused = true; pauseBtn.textContent = '▶ Resume'; });
          navigator.mediaSession.setActionHandler('play', () => { r.paused = false; pauseBtn.textContent = '❚❚ Pause'; if (r.wake) r.wake(); });
        } catch (e) { /* not supported */ }
      }
      r.cleanup = () => {
        if (silent) { silent.pause(); silent = null; }
        if ('mediaSession' in navigator) ['nexttrack', 'previoustrack', 'pause', 'play'].forEach(a => { try { navigator.mediaSession.setActionHandler(a, null); } catch (e) { /* ignore */ } });
        keepAwake(false); stopSpeaking(); scr.remove();
      };
      const sleep = s => new Promise(res => { const id = setTimeout(res, s * 1000); r.wake = () => { clearTimeout(id); res(); }; });
      const waitWhilePaused = async () => { while (r.alive && r.paused) await sleep(60); };
      ctx.setActive(true);
      (async () => {
        let i = 0;
        while (r.alive) {
          await waitWhilePaused(); if (!r.alive) break;
          const q = question(skills[i++ % skills.length]);
          if (!q) break;
          status.textContent = r.n + ' answered · ' + r.got + ' right';
          big.textContent = q.prompt; sub.textContent = 'Listen…';
          const len = q.play();
          await sleep(len); if (!r.alive) break;
          sub.textContent = 'Answer in your head';
          await sleep(pref.wait); if (!r.alive) break;
          big.textContent = q.answer; sub.textContent = 'Right half: got it · left half: missed';
          if (pref.voice && !(await speak(q.say))) A.hit('clickHi', A.now() + 0.02, 0.4);
          if (!pref.voice) A.hit('clickHi', A.now() + 0.02, 0.4);
          // a few seconds to grade; no grade means no record, and it moves on
          const ok = await new Promise(res => { r.grade = res; setTimeout(() => { if (r.grade === res) { r.grade = null; res(null); } }, 5000); });
          if (!r.alive) break;
          if (ok !== null) {
            E.record(q.skill, q.id, ok);
            r.n++; if (ok) r.got++;
            ctx.tick(1);
            sub.textContent = ok ? '✓' : '✗ It comes back sooner';
          } else sub.textContent = 'Skipped';
          await sleep(0.8);
        }
      })();
    }
    function stopHf() {
      if (!run) return;
      const r = run; run = null;
      r.alive = false; if (r.wake) r.wake(); if (r.grade) r.grade(null);
      r.cleanup();
      ctx.setActive(false);
      if (r.n) toast(r.got + ' of ' + r.n + ' right · saved to your reviews');
    }
    return () => stopHf();
  }
});
