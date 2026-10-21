import D from '../data.js';
import A from '../audio.js';
import E from '../engine.js';
import { h, rand, choice, shuffle, noteName, toast, TOOLS, tool, pickFor, Quiz, Fretboard, positionsOfPc } from '../ui/core.js';

/* ======================================================
   EAR TOOLS
   ====================================================== */
tool('intervals', {
  tab: 'ear', skill: 'intervals', title: 'Intervals', eyebrow: 'Ear · anchor songs',
  desc: 'Hear two notes and name the distance. Anchor songs help at first, then fade as you get it right.',
  render(body, ctx) {
    const anchorsBtn = h('button', { class: 'btn small ghost' }, 'Edit my anchor songs');
    const editor = h('div', { class: 'card', hidden: true });
    anchorsBtn.onclick = () => { editor.hidden = !editor.hidden; if (!editor.hidden) buildEditor(); };
    function buildEditor() {
      editor.innerHTML = '';
      editor.append(h('h3', { text: 'Your anchor songs' }), h('p', { class: 'small muted', text: 'Use songs you already know well. Your versions replace the defaults.' }));
      D.INTERVALS.forEach(iv => {
        ['up', 'down'].forEach(dir => {
          const id = 'anc-' + iv.id + '-' + dir;
          const inp = h('input', { type: 'text', id, value: E.anchor(iv.id, dir) || '', placeholder: dir === 'up' ? 'Song that starts going up' : 'Song that starts going down' });
          inp.addEventListener('change', () => E.setAnchor(iv.id, dir, inp.value.trim()));
          editor.append(h('label', { class: 'stack small', for: id }, h('span', { text: iv.name + (dir === 'up' ? ' ↑' : ' ↓') }), inp));
        });
      });
    }
    body.append(h('div', { class: 'row' }, anchorsBtn), editor);
    return Quiz(body, ctx, () => {
      const item = pickFor('intervals', ctx);
      const [ivId, dir] = item.id.split(':');
      const iv = D.INTERVALS.find(i => i.id === ivId);
      const root = dir === 'down' ? rand(53, 62) : rand(48, 60);
      const pool = ctx.params.test ? E.universe('intervals') : E.unlocked('intervals');
      let ids = [...new Set(pool.filter(x => x.id.endsWith(':' + dir)).map(x => x.id.split(':')[0]))];
      if (ids.length < 4) ids = [...new Set(pool.map(x => x.id.split(':')[0]))];
      if (!ids.includes(ivId)) ids.push(ivId);
      if (ctx.params.contrast) ids = [...new Set(ctx.params.contrast.map(x => x.split(':')[0]).concat([ivId]))];
      const choices = D.INTERVALS.filter(i => ids.includes(i.id)).map(i => ({ id: i.id, label: i.id, sub: i.name }));
      const playIv = semi => {
        const t = A.now() + 0.05;
        if (dir === 'up') { A.note(root, t, 0.8, 1.0); A.note(root + semi, t + 0.75, 0.8, 1.4); }
        else if (dir === 'down') { A.note(root + semi, t, 0.8, 1.0); A.note(root, t + 0.75, 0.8, 1.4); }
        else { A.note(root, t, 0.65, 1.8); A.note(root + semi, t, 0.65, 1.8); }
      };
      const anc = dir === 'harm' ? 'Sounds ' + iv.feel : E.anchor(ivId, dir);
      const mode = !ctx.params.test && anc ? 'button' : 'none';
      const anchorFor = id => { if (dir === 'harm') return D.INTERVALS.find(i => i.id === id).feel; return E.anchor(id, dir) || D.INTERVALS.find(i => i.id === id).feel; };
      return {
        eyebrow: dir === 'up' ? 'Ascending' : dir === 'down' ? 'Descending' : 'Played together',
        prompt: 'Which interval?',
        play: () => playIv(iv.semi), choices, answer: ivId,
        hint: { mode, text: (dir === 'harm' ? '' : 'Think: ') + anc },
        compare: id => playIv(D.INTERVALS.find(i => i.id === id).semi),
        onResult: (ok, id, rt) => E.record('intervals', item.id, ok, { confused: id + ':' + dir, rt }),
        explain: (ok, id) => {
          const lines = [h('span', { text: iv.name + ': ' + anchorFor(ivId) })];
          if (!ok) lines.push(h('span', { class: 'small', text: 'You chose ' + D.INTERVALS.find(i => i.id === id).name + ': ' + anchorFor(id) }));
          return h('div', { class: 'stack' }, lines);
        }
      };
    });
  }
});

function chordMidis(root, iv) { return iv.map(x => root + x); }
tool('chords', {
  tab: 'ear', skill: 'chords', title: 'Chord qualities', eyebrow: 'Ear · harmony',
  desc: 'Hear a chord arpeggiated then strummed. Name its quality.',
  render(body, ctx) {
    return Quiz(body, ctx, () => {
      const item = pickFor('chords', ctx);
      const ch = D.CHORDS.find(c => c.id === item.id);
      const root = rand(45, 53);
      const pool = ctx.params.contrast || (ctx.params.test ? E.universe('chords') : E.unlocked('chords')).map(x => x.id);
      let opts = D.CHORDS.filter(c => pool.includes(c.id));
      if (opts.length > 8) opts = shuffle(opts.filter(c => c.id !== ch.id)).slice(0, 7).concat([ch]).sort((a, b) => D.CHORDS.indexOf(a) - D.CHORDS.indexOf(b));
      const playCh = c => {
        const t = A.now() + 0.05, ms = chordMidis(root, c.iv);
        ms.forEach((m, i) => A.note(m, t + i * 0.16, 0.55, 0.9));
        A.strum(ms, t + ms.length * 0.16 + 0.35, 0.8, 0.02, 1.8);
      };
      const formula = c => c.iv.map(x => ['1', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♯5', '6', '♭7', '7', '8', '♭9', '9', '♯9'][x]).join(' ');
      return {
        prompt: 'Which chord quality?', sub: 'Root: ' + noteName(root),
        play: () => playCh(ch), choices: opts.map(c => ({ id: c.id, label: c.name })), answer: ch.id,
        compare: id => playCh(D.CHORDS.find(c => c.id === id)),
        onResult: (ok, id, rt) => E.record('chords', ch.id, ok, { confused: id, rt }),
        explain: () => ch.name + ': ' + formula(ch)
      };
    });
  }
});

function cadence(t, at) {
  const I = [t - 12, t - 5, t, t + 4], IV = [t - 7, t - 3, t, t + 5], V = [t - 5, t - 1, t + 2, t + 7];
  [I, IV, V, I].forEach((c, i) => A.strum(c, at + i * 0.6, 0.6, 0.02, 0.8));
  return at + 4 * 0.6;
}
tool('degrees', {
  tab: 'ear', skill: 'degrees', title: 'Scale degrees', eyebrow: 'Ear · functional hearing',
  desc: 'A cadence sets the key, then one note sounds. Name its degree. This is the core skill for playing by ear.',
  render(body, ctx) {
    return Quiz(body, ctx, () => {
      const item = pickFor('degrees', ctx);
      const dg = D.DEGREES.find(d => d.id === item.id);
      const t = rand(55, 63);
      const pool = ctx.params.contrast || (ctx.params.test ? E.universe('degrees') : E.unlocked('degrees')).map(x => x.id);
      const opts = D.DEGREES.filter(d => pool.includes(d.id)).sort((a, b) => a.semi - b.semi);
      const play = () => { const at = cadence(t, A.now() + 0.05); A.note(t + dg.semi, at + 0.4, 0.85, 1.6); };
      return {
        prompt: 'Which degree?', sub: 'Key of ' + noteName(t) + ' major',
        play, choices: opts.map(d => ({ id: d.id, label: d.id, sub: d.solf + ' · ' + d.sargam })), answer: dg.id,
        extraButtons: [{ label: 'Note only', onclick: () => A.note(t + dg.semi, A.now() + 0.05, 0.85, 1.5) }, { label: 'Tonic', onclick: () => A.note(t, A.now() + 0.05, 0.85, 1.5) }],
        compare: id => { const d2 = D.DEGREES.find(d => d.id === id); A.note(t, A.now() + 0.05, 0.7, 0.8); A.note(t + d2.semi, A.now() + 0.7, 0.85, 1.4); },
        onResult: (ok, id, rt) => E.record('degrees', dg.id, ok, { confused: id, rt }),
        explain: () => 'Degree ' + dg.id + ' — ' + dg.solf + ' in solfège, ' + dg.sargam + ' in sargam. Sing it back from the tonic.'
      };
    });
  }
});

tool('progressions', {
  tab: 'ear', skill: 'progressions', title: 'Progressions', eyebrow: 'Ear · harmony',
  desc: 'A four-chord loop starts on I. Name the other three chords.',
  render(body, ctx) {
    const card = h('div', { class: 'card' }); body.append(card);
    let alive = true;
    function newQ() {
      if (!alive) return;
      card.innerHTML = '';
      const pool = (ctx.params.test ? E.universe('progressions') : E.unlocked('progressions')).map(x => x.id);
      const nums = D.NUMERALS.filter(n => n.id === 'I' || pool.includes(n.id));
      const seq = ['I'];
      for (let i = 1; i < 4; i++) {
        const prevId = seq[i - 1];
        let cand = nums.filter(n => n.id !== prevId);
        // weight weak numerals
        const it = E.pick('progressions', E.universe('progressions').filter(x => cand.some(c => c.id === x.id)));
        seq.push(it && Math.random() < 0.6 ? it.id : choice(cand).id);
      }
      const t = rand(52, 59);
      const voicing = n => {
        const num = D.NUMERALS.find(x => x.id === n);
        let r = t + num.root; if (r > t + 6) r -= 12;
        const third = num.q === 'min' ? 3 : 4;
        return [r - 12, r, r + third, r + 7];
      };
      const play = () => {
        let at = A.now() + 0.05;
        for (let rep = 0; rep < 2; rep++) seq.forEach(n => { A.strum(voicing(n), at, 0.65, 0.02, 1.0); at += 1.0; });
      };
      const chosen = [null, null, null];
      card.append(h('div', { class: 'prompt', text: 'Name the loop' }), h('p', { class: 'muted small', text: 'Key of ' + noteName(t) + ' major. The first chord is I.' }));
      card.append(h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: play }, '▶ Play loop')));
      const slots = h('div', { class: 'stack' });
      const checkBtn = h('button', { class: 'btn brass', disabled: true }, 'Check');
      for (let i = 1; i < 4; i++) {
        const row = h('div', { class: 'chips' });
        nums.forEach(n => {
          const c = h('button', { class: 'chip', 'aria-pressed': 'false', onclick: () => {
            chosen[i - 1] = n.id;
            row.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === c ? 'true' : 'false'));
            checkBtn.disabled = chosen.some(x => !x);
          } }, n.id);
          row.append(c);
        });
        slots.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Chord ' + (i + 1) }), row));
      }
      card.append(slots, checkBtn);
      const fb = h('div', { class: 'feedback', hidden: true }); card.append(fb);
      checkBtn.onclick = () => {
        checkBtn.disabled = true;
        let right = 0;
        for (let i = 1; i < 4; i++) {
          const ok = chosen[i - 1] === seq[i];
          if (ok) right++;
          E.record('progressions', seq[i], ok, { confused: chosen[i - 1] });
        }
        ctx.tick(1);
        fb.hidden = false; fb.className = 'feedback ' + (right === 3 ? 'ok' : 'no');
        fb.innerHTML = '';
        fb.append(h('b', { text: right === 3 ? 'All three right.' : right + ' of 3 right.' }), h('span', { text: 'The loop was ' + seq.join(' – ') + '.' }),
          h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: play }, 'Hear again'), h('button', { class: 'btn primary small', onclick: newQ }, 'Next →')));
      };
      setTimeout(() => alive && play(), 150);
    }
    newQ();
    return () => { alive = false; };
  }
});

function playScale(tonic, steps, at, dur = 0.34) {
  const asc = steps.concat([12]);
  const notes = asc.concat(asc.slice(0, -1).reverse());
  notes.forEach((st, i) => A.note(tonic + st, at + i * dur, 0.7, 0.9));
  return at + notes.length * dur;
}
tool('scales', {
  tab: 'ear', skill: 'scales', title: 'World scales by ear', eyebrow: 'Ear · ragas, maqamat, modes',
  desc: 'A drone sets the tonic, then a scale rises and falls. Name it. Quarter-tone maqamat appear at the top level.',
  render(body, ctx) {
    let drone = null;
    const stopDrone = () => { if (drone) { drone.stop(); drone = null; } };
    const regionFilter = (x, region) => { const r = D.REGIONS.find(rr => rr.id === region); return r && r.scales.includes(x.id); };
    const cleanup = Quiz(body, ctx, () => {
      stopDrone();
      const item = pickFor('scales', ctx, regionFilter);
      const sc = D.SCALES.find(x => x.id === item.id);
      const tonic = rand(50, 57);
      let pool = (ctx.params.test ? E.universe('scales') : E.unlocked('scales')).map(x => x.id).filter(id => id !== sc.id);
      if (ctx.params.contrast) pool = ctx.params.contrast.filter(id => id !== sc.id);
      else if (pool.length < 3) pool = D.SCALES.filter(x => x.tier <= sc.tier + 1 && x.id !== sc.id).map(x => x.id);
      const opts = shuffle(shuffle(pool).slice(0, 3).concat([sc.id])).map(id => D.SCALES.find(x => x.id === id));
      const play = (scale = sc) => {
        stopDrone(); A.stopAll();
        drone = A.Drone(tonic); drone.start();
        playScale(tonic + 12, scale.steps, A.now() + 1.6);
      };
      return {
        prompt: 'Which scale is this?', sub: 'Tonic ' + noteName(tonic) + '. Listen for the small and large steps.',
        play: () => play(sc), wide: true,
        choices: opts.map(x => ({ id: x.id, label: x.name, sub: x.aka })), answer: sc.id,
        compare: id => play(D.SCALES.find(x => x.id === id)), autoDelay: 2200,
        onResult: (ok, id, rt) => E.record('scales', sc.id, ok, { confused: id, rt }),
        explain: () => h('div', { class: 'stack' }, h('span', { text: sc.name + ' — ' + sc.aka }), h('span', { class: 'small', text: sc.region + '. ' + sc.note }))
      };
    });
    return () => { stopDrone(); cleanup(); };
  }
});

tool('drone', {
  tab: 'ear', skill: 'scales', title: 'Drone & scale explorer', eyebrow: 'Ear · improvise over a drone',
  desc: 'Pick a raga, maqam or mode and a tonic. Play it over a tanpura-style drone and see it on the fretboard.',
  render(body, ctx) {
    let scId = ctx.params.scale || 'lydian', tonicPc = ctx.params.tonic !== undefined ? ctx.params.tonic : 2, drone = null;
    ctx.setActive(false);
    const card = h('div', { class: 'card' }); body.append(card);
    const sel = h('select', { id: 'drone-scale', 'aria-label': 'Scale' });
    [1, 2, 3, 4, 5].forEach(t => {
      const g = h('optgroup', { label: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5: microtonal & rare'][t - 1] });
      D.SCALES.filter(x => x.tier === t).forEach(x => g.append(h('option', { value: x.id, selected: x.id === scId ? true : null, text: x.name })));
      sel.append(g);
    });
    const tonics = h('div', { class: 'chips' });
    const info = h('div', { class: 'stack' });
    const fb = Fretboard({ onTap: (si, f) => A.note(E.STRINGS[si].midi + f, A.now() + 0.02, 0.8, 1.4) });
    const droneBtn = h('button', { class: 'btn primary' }, 'Start drone');
    const playBtn = h('button', { class: 'btn' }, '▶ Play scale');
    // quarter-tone scales: hear the real intervals against the nearest piano (12-TET) notes
    const abBox = h('div', { class: 'callout abbox', hidden: true });
    card.append(h('label', { class: 'stack', for: 'drone-scale' }, h('span', { class: 'eyebrow', text: 'Scale' }), sel), h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Tonic (Sa)' }), tonics), h('div', { class: 'row' }, droneBtn, playBtn), abBox, info, fb.el,
      h('p', { class: 'small muted', text: 'Tap the fretboard to hear a note. Dashed circles are quarter-tone notes: bend the fret below about halfway.' }));
    function tonicMidi() { return 48 + tonicPc; }
    function refresh() {
      const sc = D.SCALES.find(x => x.id === scId);
      tonics.innerHTML = '';
      D.NOTE_NAMES.forEach((n, i) => tonics.append(h('button', { class: 'chip', 'aria-pressed': i === tonicPc ? 'true' : 'false', onclick: () => { tonicPc = i; refresh(); if (drone) { stop(); startDrone(); } } }, n)));
      info.innerHTML = '';
      info.append(h('h2', { text: sc.name }), h('p', { class: 'small', text: sc.aka }), h('p', { class: 'small muted', text: sc.region + '. ' + sc.note }));
      const names = sc.steps.map(st => { const whole = Number.isInteger(st); return whole ? D.NOTE_NAMES[(tonicPc + st) % 12] : D.NOTE_NAMES[(tonicPc + Math.ceil(st)) % 12] + ' ¼♭'; });
      info.append(h('p', { class: 'mono small', text: names.join('  ') }));
      const marks = [];
      sc.steps.forEach(st => {
        const whole = Number.isInteger(st);
        const p = (tonicPc + Math.round(whole ? st : Math.ceil(st))) % 12;
        positionsOfPc([p]).forEach(m => marks.push(Object.assign(m, { kind: st === 0 ? 'root' : whole ? 'tone' : 'quarter', label: whole ? D.NOTE_NAMES[p] : '¼' })));
      });
      fb.mark(marks);
      const micro = sc.steps.some(st => !Number.isInteger(st));
      abBox.hidden = !micro; abBox.innerHTML = '';
      if (micro) {
        const tempered = sc.steps.map(Math.ceil);
        const at = (steps, when) => playScale(tonicMidi() + 12, steps, when || A.now() + 0.1);
        abBox.append(h('b', { text: 'Real quarter tones vs. the piano' }),
          h('p', { class: 'small', text: 'The ¼ notes sit between two frets. Hear the scale as it is sung and played on the oud or ney, then rounded to the nearest piano note, and listen for how the neutral steps lose their colour.' }),
          h('div', { class: 'row' },
            h('button', { class: 'btn small', onclick: () => { A.ensure(); at(sc.steps); } }, '▶ Real'),
            h('button', { class: 'btn small', onclick: () => { A.ensure(); at(tempered); } }, '▶ Rounded (12-TET)'),
            h('button', { class: 'btn small brass', onclick: () => { A.ensure(); at(tempered, at(sc.steps) + 0.6); toast('Real first, then rounded'); } }, '▶ Compare')));
      }
    }
    function startDrone() { drone = A.Drone(tonicMidi()); drone.start(); droneBtn.textContent = 'Stop drone'; ctx.setActive(true); }
    function stop() { if (drone) drone.stop(); drone = null; droneBtn.textContent = 'Start drone'; ctx.setActive(false); }
    droneBtn.onclick = () => { A.ensure(); drone ? stop() : startDrone(); };
    playBtn.onclick = () => { A.ensure(); playScale(tonicMidi() + 12, D.SCALES.find(x => x.id === scId).steps, A.now() + 0.1); };
    sel.onchange = () => { scId = sel.value; refresh(); };
    refresh();
    return () => stop();
  }
});
