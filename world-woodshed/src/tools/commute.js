/* World Woodshed — On the go: practice for a commute, with headphones and no guitar.
   1. "How long is your ride?" plans a smart session from things that need only the phone.
   2. Hands-free ear training: a question plays, a pause to answer in your head, then the answer is spoken.
      Grade with a tap anywhere (left: missed, right: got it) or with headphone buttons, so the phone can
      stay in your hand or pocket. Grades feed the same spaced repetition as the quizzes. */
import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import { h, tool, toast, openTool } from '../ui/core.js';
import { BLOCKS, describe, totalOf, fmtMin } from '../routines.js';
import { GO_GROUPS, keyTitle, goTitle, goBlock, planRide, mineBlocks, toMine, DEFAULT_MINE } from '../commuteplan.js';
import { startSession, autoAdvanceToggle } from '../ui/session.js';
import { ribbon } from '../ui/routine.js';
import { speak, stopSpeaking, keepAwake, isNative } from '../native.js';
import './commute.css';

const RIDES = [5, 10, 15, 20, 30, 45, 60];
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

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
        const t = A.now() + 0.08, ms = c.iv.map(x => root + x); // root here is already a MIDI note
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
    const pref = Object.assign({ set: 'mix', wait: 3, voice: true, mode: 'smart', skip: [], stopAfter: 0, twice: false }, E.state.settings.commute || {});
    // the hands-free set was one choice ('mix' or one skill) before you could tick several
    if (!Array.isArray(pref.skills) || !pref.skills.length) pref.skills = (SKILL_SET[pref.set] || SKILL_SET.mix).slice();
    const save = () => E.setSetting('commute', Object.assign({}, pref));
    let run = null;

    /* 1. a ride-length session: the smart plan, or your own commute */
    const plan = h('div', { class: 'card go-plan' });
    // the ride length last started on this device, planned and ready
    const last = E.state.settings.lastRide;
    let minutes = Number.isInteger(last) && last >= 3 && last <= 180 ? last : null;
    let blocks = null;
    const mine = () => (Array.isArray(pref.mine) && pref.mine.length ? pref.mine : DEFAULT_MINE);
    const rebuild = () => {
      // your own commute shows at its own length until you pick a ride
      if (pref.mode === 'mine') { blocks = mineBlocks(mine(), minutes); minutes = totalOf(blocks) || minutes; } else blocks = minutes ? planRide(minutes, pref.skip || []) : null;
    };
    // an edit to your own commute is saved as it is made; an edit to the smart plan lasts until the next plan
    const edited = () => {
      blocks.forEach(b => { b.weight = b.minutes; });
      minutes = totalOf(blocks) || minutes;
      if (pref.mode === 'mine') { pref.mine = toMine(blocks); save(); }
      drawPlan();
    };
    rebuild();
    function blockRow(b, i) {
      const step = d => { b.minutes = Math.max(1, Math.min(60, b.minutes + d)); edited(); };
      const ctl = h('div', { class: 'go-ctl' },
        h('button', { class: 'btn small ghost', 'aria-label': 'One minute less', onclick: () => step(-1) }, '−'),
        h('span', { class: 'mono small', text: b.minutes + ' min' }),
        h('button', { class: 'btn small ghost', 'aria-label': 'One minute more', onclick: () => step(1) }, '+'),
        h('span', { class: 'grow' }),
        i > 0 ? h('button', { class: 'btn small ghost', 'aria-label': 'Move up', onclick: () => { blocks.splice(i - 1, 0, blocks.splice(i, 1)[0]); edited(); } }, '↑') : '',
        h('button', { class: 'btn small ghost', 'aria-label': 'Remove ' + goTitle(b), disabled: blocks.length < 2 ? true : null, onclick: () => { blocks.splice(i, 1); edited(); } }, '✕'));
      const title = goTitle(b), sub = b.reason || describe(b);
      return h('li', { class: 'brow cat-' + BLOCKS[b.type].cat },
        h('div', { class: 'bmain' }, h('span', { class: 'bicon' }), h('div', { class: 'btext' }, h('b', { text: title }), sub && !sub.startsWith(title) ? h('span', { class: 'small muted', text: sub }) : '')),
        ctl);
    }
    function addRow() {
      const sel = h('select', { 'aria-label': 'Add to the ride' }, h('option', { value: '', text: '+ Add…' }),
        Object.values(GO_GROUPS).map(g => h('optgroup', { label: g.name }, g.keys.map(k => h('option', { value: k, text: keyTitle(k) })))));
      sel.onchange = () => { if (!sel.value) return; blocks.push(goBlock(sel.value, 4)); edited(); };
      return sel;
    }
    function drawPlan() {
      plan.innerHTML = '';
      const custom = h('input', { type: 'number', min: 3, max: 180, step: 1, inputmode: 'numeric', class: 'go-min mono', 'aria-label': 'Ride length in minutes', value: minutes && !RIDES.includes(minutes) ? String(minutes) : '' });
      custom.onchange = () => { const v = Math.round(+custom.value); if (v >= 3 && v <= 180) { minutes = v; rebuild(); drawPlan(); } };
      plan.append(h('span', { class: 'eyebrow', text: 'Session, no guitar' }), h('h2', { text: 'How long is your ride?' }),
        h('div', { class: 'chips presets' }, RIDES.map(m => h('button', { class: 'chip', 'aria-pressed': m === minutes ? 'true' : 'false', onclick: () => { minutes = m; rebuild(); drawPlan(); } }, fmtMin(m))),
          h('label', { class: 'go-other small' }, 'or', custom, 'min')),
        h('div', { class: 'seg', role: 'group', 'aria-label': 'Plan' }, [['smart', 'Smart plan'], ['mine', 'My own commute']].map(([k, t]) =>
          h('button', { 'aria-pressed': String(pref.mode === k), onclick: () => { if (pref.mode === k) return; pref.mode = k; save(); rebuild(); drawPlan(); } }, t))));
      if (pref.mode === 'smart') {
        const skip = new Set(pref.skip || []);
        plan.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'What to include' }),
          h('div', { class: 'chips' }, Object.entries(GO_GROUPS).map(([g, def]) => h('button', { class: 'chip', 'aria-pressed': String(!skip.has(g)), onclick: () => {
            if (skip.has(g)) skip.delete(g);
            else if (skip.size >= Object.keys(GO_GROUPS).length - 1) { toast('Keep at least one'); return; } else skip.add(g);
            pref.skip = [...skip]; save(); rebuild(); drawPlan();
          } }, def.name)))));
      }
      if (!blocks) {
        plan.append(h('p', { class: 'small muted', text: pref.mode === 'mine'
          ? 'Your own list of what to do on the ride, stretched or shrunk to fit its length. Pick a length, then add, remove, reorder and time each part.'
          : 'The plan picks what is due from your own progress, then swaps anything that needs the guitar: scale positions become seeing the neck in your head, call & response becomes dictation, tunes become following the form by ear.' }));
        return;
      }
      const ses = E.session();
      plan.append(ribbon(blocks),
        h('ol', { class: 'blocks static smartlist' }, blocks.map(blockRow)),
        h('div', { class: 'row' }, addRow()),
        ses ? h('p', { class: 'small muted', text: 'Starting this ends the session in progress (' + ses.name + ').' }) : '',
        h('div', { class: 'row' }, h('button', { class: 'btn brass big', onclick: () => { E.state.settings.lastRide = minutes; startSession({ name: 'On the go', blocks }); } }, '▶ Start · ' + fmtMin(totalOf(blocks))),
          pref.mode === 'smart' ? h('button', { class: 'btn ghost', onclick: () => { rebuild(); drawPlan(); } }, 'Shuffle') : '',
          pref.mode === 'smart' ? h('button', { class: 'btn ghost', onclick: () => { pref.mine = toMine(blocks); pref.mode = 'mine'; save(); drawPlan(); toast('Saved as your own commute'); } }, 'Keep as my own')
            : h('button', { class: 'btn ghost', onclick: () => { pref.mine = DEFAULT_MINE.slice(); save(); rebuild(); drawPlan(); } }, 'Reset')),
        h('div', { class: 'row' }, autoAdvanceToggle()));
    }
    drawPlan();

    /* 2. hands-free ear training */
    const hf = h('div', { class: 'card' });
    function drawHf() {
      hf.innerHTML = '';
      const seg = (opts, cur, on) => h('div', { class: 'seg' }, opts.map(([k, t]) => h('button', { 'aria-pressed': String(k === cur), onclick: () => { on(k); save(); drawHf(); } }, t)));
      const pick = h('div', { class: 'chips' }, [['intervals', 'Intervals'], ['chords', 'Chord qualities'], ['degrees', 'Scale degrees']].map(([k, t]) => h('button', { class: 'chip', 'aria-pressed': String(pref.skills.includes(k)), onclick: () => {
        if (pref.skills.includes(k)) { if (pref.skills.length < 2) { toast('Keep at least one'); return; } pref.skills = pref.skills.filter(x => x !== k); } else pref.skills = pref.skills.concat(k);
        save(); drawHf();
      } }, t)));
      hf.append(h('span', { class: 'eyebrow', text: 'Hands-free' }), h('h2', { text: 'Ear training with the screen in your pocket' }),
        h('p', { class: 'small', text: 'A question plays, you answer in your head, then the answer is spoken. Tap the right half of the screen if you got it, the left half if you missed it' + (isNative() ? '' : ', or use your headphone buttons: next = got it, previous = missed') + '. Your answers go into the same reviews as the quizzes.' }),
        h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'What' }), pick),
        h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Time to answer' }), seg([[2, '2 s'], [3, '3 s'], [5, '5 s'], [8, '8 s']], pref.wait, k => { pref.wait = k; })),
        h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Stop after' }), seg([[0, 'No limit'], [10, '10 min'], [15, '15 min'], [20, '20 min'], [30, '30 min']], pref.stopAfter, k => { pref.stopAfter = k; })),
        h('label', { class: 'check small' }, h('input', { type: 'checkbox', checked: pref.twice ? true : null, onchange: e => { pref.twice = e.target.checked; save(); } }), 'Play each question twice'),
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
      const skills = pref.skills.filter(k => SKILL_SET.mix.includes(k) && E.unlocked(k).length);
      if (!skills.length) { toast('Nothing unlocked yet'); return; }
      run = { alive: true, n: 0, got: 0, wake: null, grade: null, paused: false, started: Date.now(), pausedFor: 0 };
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
      keepAwake(true, 'handsfree');
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
        keepAwake(false, 'handsfree'); stopSpeaking(); scr.remove();
      };
      const sleep = s => new Promise(res => { const id = setTimeout(res, s * 1000); r.wake = () => { clearTimeout(id); res(); }; });
      const waitWhilePaused = async () => { const t0 = Date.now(); while (r.alive && r.paused) await sleep(60); r.pausedFor += Date.now() - t0; };
      ctx.setActive(true);
      (async () => {
        let i = 0;
        while (r.alive) {
          await waitWhilePaused(); if (!r.alive) break;
          if (pref.stopAfter && Date.now() - r.started - r.pausedFor > pref.stopAfter * 60000) { stopHf(); break; }
          const q = question(skills[i++ % skills.length]);
          if (!q) { stopHf(); break; }
          status.textContent = r.n + ' answered · ' + r.got + ' right';
          big.textContent = q.prompt; sub.textContent = 'Listen…';
          const len = q.play();
          await sleep(len); if (!r.alive) break;
          if (pref.twice) { await sleep(0.6); if (!r.alive) break; await sleep(q.play()); if (!r.alive) break; }
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
