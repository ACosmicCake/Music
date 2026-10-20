/* World Woodshed — UI */
(function () {
  const D = window.WW_DATA, A = window.WW_AUDIO, E = window.WW_ENGINE;
  const view = document.getElementById('view');
  const tabsEl = document.getElementById('tabs');
  const syncEl = document.getElementById('sync');

  /* ---------- tiny DOM helpers ---------- */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    kids.flat(Infinity).forEach(c => { if (c === null || c === undefined || c === false) return; el.append(c.nodeType ? c : document.createTextNode(String(c))); });
    return el;
  }
  const svgNS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, ...kids) {
    const el = document.createElementNS(svgNS, tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) { if (v !== null && v !== undefined) el.setAttribute(k, v); }
    kids.flat().forEach(c => { if (c !== null && c !== undefined) el.append(c.nodeType ? c : document.createTextNode(String(c))); });
    return el;
  }
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const choice = arr => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pc = m => ((Math.round(m) % 12) + 12) % 12;
  const noteName = m => D.NOTE_NAMES[pc(m)];
  function toast(msg) {
    const t = h('div', { class: 'toast', role: 'status', text: msg });
    document.body.append(t); setTimeout(() => t.remove(), 2200);
  }
  function bar(pct, cls) { return h('div', { class: 'bar ' + (cls || '') }, h('i', { style: { width: Math.max(0, Math.min(100, pct)) + '%' } })); }
  function regionName(id) { const r = D.REGIONS.find(x => x.id === id); return r ? r.name : id; }

  /* ---------- tabs & routing ---------- */
  const ICONS = {
    today: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg>',
    ear: '<svg viewBox="0 0 24 24"><path d="M7 15c0-6 2-10 6-10s5 3 5 6-3 4-3 6-1 4-3 4-2-1-2-2"/><path d="M11 11a2 2 0 1 1 4 0"/></svg>',
    rhythm: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="8" rx="8" ry="3"/><path d="M4 8v8c0 1.7 3.6 3 8 3s8-1.3 8-3V8"/><path d="M15 3l3-1M9 3L6 2"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M14 4l6 6-9 9a3 3 0 0 1-4-4l7-11z"/><path d="M4 20l3-3"/><path d="M16 6l2 2"/></svg>',
    atlas: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>'
  };
  const TABS = [['today', 'Today'], ['ear', 'Ear'], ['rhythm', 'Rhythm'], ['play', 'Play'], ['atlas', 'Atlas']];
  let ui = { tab: 'today', cleanup: null, runner: null, plan: null };

  function renderTabs() {
    tabsEl.innerHTML = '';
    TABS.forEach(([id, label]) => {
      const b = h('button', { class: 'tab', 'aria-current': ui.tab === id && !ui.runner ? 'page' : null, onclick: () => go(id) });
      b.innerHTML = ICONS[id];
      b.append(h('span', { text: label }));
      tabsEl.append(b);
    });
  }
  function teardown() {
    if (ui.cleanup) { try { ui.cleanup(); } catch (e) { console.error(e); } }
    ui.cleanup = null;
    A.stopAll();
  }
  function go(tab) {
    teardown();
    ui.tab = tab; ui.runner = null;
    try { history.replaceState(null, '', '#' + tab); } catch (e) { /* ignore */ }
    renderTabs();
    view.innerHTML = '';
    window.scrollTo(0, 0);
    PAGES[tab]();
  }
  E.onChange(() => {
    syncEl.textContent = E.storageNote();
    if (!ui.runner && ui.tab === 'today') { const y = window.scrollY; view.innerHTML = ''; PAGES.today(); window.scrollTo(0, y); }
  });

  /* ---------- tool registry ---------- */
  const TOOLS = {};
  function tool(id, def) { TOOLS[id] = Object.assign({ id }, def); }

  /* Tool runner: header, block progress, activity time tracking */
  function openTool(id, opts = {}) {
    teardown();
    const t = TOOLS[id];
    ui.runner = { id, opts };
    renderTabs();
    view.innerHTML = '';
    window.scrollTo(0, 0);
    const block = opts.block || null;
    const head = h('div', { class: 'runner-head' });
    const backBtn = h('button', { class: 'btn ghost small', onclick: () => go(opts.returnTab || t.tab || 'today') }, '← ', opts.block ? 'Routine' : 'Back');
    head.append(h('div', { class: 'spread' }, backBtn, h('span', { class: 'eyebrow', text: t.eyebrow || '' })));
    head.append(h('h1', { text: t.title }));
    if (t.desc && !block) head.append(h('p', { class: 'muted', text: t.desc }));
    const blockBar = h('div', { class: 'blockbar', hidden: !block });
    head.append(blockBar);
    const body = h('div', { class: 'section' });
    view.append(head, body);

    let lastAct = Date.now(), active = false, finished = false;
    const markAct = () => { lastAct = Date.now(); };
    document.addEventListener('pointerdown', markAct, true);
    document.addEventListener('keydown', markAct, true);
    const unitIsTime = block && !block.questions;
    function renderBlockBar() {
      if (!block) return;
      blockBar.innerHTML = '';
      const target = unitIsTime ? block.minutes * 60 : block.questions;
      const prog = Math.min(block.progress || 0, target);
      const plan = ui.plan;
      const idx = plan ? plan.blocks.indexOf(block) : -1;
      const label = unitIsTime ? Math.floor(prog / 60) + ' of ' + block.minutes + ' min' : prog + ' of ' + target;
      blockBar.append(h('div', { class: 'spread' }, h('b', { text: (plan && plan.kind === 'placement' ? 'Placement ' : 'Block ') + (idx + 1) + ' of ' + (plan ? plan.blocks.length : 1) }), h('span', { class: 'mono', text: label })));
      blockBar.append(bar(100 * prog / target, 'brass'));
      if (block.reason) blockBar.append(h('span', { class: 'small muted', text: block.reason }));
      if (block.done || prog >= target) {
        const next = plan ? plan.blocks.find(b => !b.done && b !== block) : null;
        blockBar.append(h('div', { class: 'row' },
          h('b', { text: 'Block complete.' }),
          next ? h('button', { class: 'btn brass small', onclick: () => runBlock(next) }, 'Next: ' + (E.SKILLS[next.skill] ? E.SKILLS[next.skill].name : TOOLS[next.tool].title) + ' →')
            : h('button', { class: 'btn brass small', onclick: () => finishPlan() }, plan && plan.kind === 'placement' ? 'See my results →' : 'Finish routine →')));
      }
    }
    function completeIfDone() {
      if (!block || finished) return;
      const target = unitIsTime ? block.minutes * 60 : block.questions;
      if ((block.progress || 0) >= target) {
        finished = true; block.done = true;
        if (ui.plan && ui.plan.kind === 'routine') E.blockProgress(block.id, block.progress, true);
        toast('Block complete');
      }
    }
    const ctx = {
      params: Object.assign({}, block ? block.params : {}, opts.params || {}),
      block,
      skill: t.skill,
      tick(n = 1) {
        if (!block || unitIsTime) return;
        block.progress = (block.progress || 0) + n;
        if (ui.plan && ui.plan.kind === 'routine') E.blockProgress(block.id, block.progress, false);
        completeIfDone(); renderBlockBar();
      },
      setActive(v) { active = v; },
      get blockDone() { return !!(block && block.done); }
    };
    const timer = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (!active && Date.now() - lastAct > 45000) return;
      const skill = (ctx.timeSkill) || t.skill;
      E.addTime(5, skill);
      if (block && unitIsTime) {
        block.progress = (block.progress || 0) + 5;
        if (ui.plan && ui.plan.kind === 'routine' && block.progress % 30 === 0) E.blockProgress(block.id, block.progress, false);
        completeIfDone(); renderBlockBar();
      }
    }, 5000);
    renderBlockBar();
    let toolCleanup = null;
    try { toolCleanup = t.render(body, ctx); } catch (e) { console.error(e); body.append(h('p', { text: 'Something went wrong loading this tool: ' + e.message })); }
    ui.cleanup = () => {
      clearInterval(timer);
      document.removeEventListener('pointerdown', markAct, true);
      document.removeEventListener('keydown', markAct, true);
      if (typeof toolCleanup === 'function') toolCleanup();
      if (block && ui.plan && ui.plan.kind === 'routine') E.blockProgress(block.id, block.progress || 0, block.done);
    };
  }

  /* ---------- Plans: routine and placement ---------- */
  function runBlock(block) {
    openTool(block.tool, { block, returnTab: 'today' });
  }
  function startRoutine() {
    const r = E.routineToday(); if (!r) return;
    ui.plan = { kind: 'routine', blocks: r.blocks };
    const next = r.blocks.find(b => !b.done) || r.blocks[0];
    runBlock(next);
  }
  function startPlacement() {
    ui.plan = { kind: 'placement', blocks: E.placementPlan() };
    runBlock(ui.plan.blocks[0]);
  }
  function finishPlan() {
    const plan = ui.plan;
    if (plan && plan.kind === 'placement') { E.finishPlacement(); E.makeRoutine(); toast('Placement saved. Your first routine is ready.'); }
    else toast('Routine finished. Nice work.');
    ui.plan = null;
    go('today');
  }

  /* ---------- Shared: item picking with test/region modes ---------- */
  function pickFor(skill, ctx, regionFilter) {
    const p = ctx.params || {};
    if (p.test) return E.pick(skill, E.universe(skill), { uniform: true });
    if (p.region && regionFilter && Math.random() < 0.65) {
      const pool = E.universe(skill).filter(x => regionFilter(x, p.region));
      if (pool.length) return E.pick(skill, pool);
    }
    return E.pick(skill);
  }

  /* ---------- Generic quiz component ---------- */
  function Quiz(container, ctx, gen, opts = {}) {
    const card = h('div', { class: 'card' });
    container.append(card);
    let q = null, t0 = 0, answered = false, autoTimer = null, alive = true;
    function next() {
      clearTimeout(autoTimer);
      if (!alive) return;
      answered = false;
      q = gen();
      card.innerHTML = '';
      const top = h('div', { class: 'stack' });
      if (q.eyebrow) top.append(h('span', { class: 'eyebrow', text: q.eyebrow }));
      top.append(h('div', { class: 'prompt', text: q.prompt }));
      if (q.sub) top.append(h('p', { class: 'muted small', text: q.sub }));
      card.append(top);
      const ctrl = h('div', { class: 'row' });
      if (q.play) ctrl.append(h('button', { class: 'btn primary', onclick: () => { A.ensure(); q.play(); } }, '▶ ', q.replayLabel || 'Play again'));
      (q.extraButtons || []).forEach(b => ctrl.append(h('button', { class: 'btn small', onclick: b.onclick }, b.label)));
      const hintBox = h('div', { class: 'hint', hidden: true });
      if (q.hint && q.hint.text) {
        if (q.hint.mode === 'auto') { hintBox.hidden = false; hintBox.textContent = q.hint.text; }
        else if (q.hint.mode === 'button') ctrl.append(h('button', { class: 'btn small ghost', onclick: () => { hintBox.hidden = false; hintBox.textContent = q.hint.text; } }, 'Hint'));
      }
      card.append(ctrl, hintBox);
      const grid = h('div', { class: 'choices' + (q.wide ? ' wide' : '') });
      q.choices.forEach((c, i) => {
        const b = h('button', { class: 'choice' + (q.wide ? ' wide' : ''), 'data-id': c.id, onclick: () => answer(c.id, b) }, h('b', { text: c.label }), c.sub ? h('span', { text: c.sub }) : null);
        grid.append(b);
      });
      card.append(grid);
      const fb = h('div', { class: 'feedback', hidden: true });
      card.append(fb);
      if (q.after) card.append(q.after);
      A.ensure();
      setTimeout(() => { if (alive && q.play && !q.noAutoplay) q.play(); t0 = performance.now(); }, 120);
      t0 = performance.now();
    }
    function answer(id) {
      if (answered) return;
      answered = true;
      const rt = performance.now() - t0;
      const correct = id === q.answer;
      card.querySelectorAll('.choice').forEach(b => {
        b.disabled = true;
        if (b.dataset.id === q.answer) b.classList.add('correct');
        else if (b.dataset.id === id) b.classList.add('wrong');
      });
      q.onResult && q.onResult(correct, id, rt);
      ctx.tick(1);
      const fb = card.querySelector('.feedback');
      fb.hidden = false; fb.className = 'feedback ' + (correct ? 'ok' : 'no');
      fb.innerHTML = '';
      const ex = q.explain ? q.explain(correct, id) : null;
      fb.append(h('b', { text: correct ? 'Correct.' : 'Not quite.' }));
      if (ex) fb.append(typeof ex === 'string' ? h('span', { text: ex }) : ex);
      const row = h('div', { class: 'row' });
      if (!correct && q.compare) {
        row.append(h('button', { class: 'btn small', onclick: () => q.compare(id) }, 'Hear yours'));
        if (q.play) row.append(h('button', { class: 'btn small', onclick: () => q.play() }, 'Hear correct'));
      }
      row.append(h('button', { class: 'btn primary small', onclick: next }, 'Next →'));
      fb.append(row);
      if (correct && !opts.noAuto) autoTimer = setTimeout(next, q.autoDelay || 1300);
    }
    function onKey(e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
      const n = parseInt(e.key, 10);
      if (!answered && n >= 1 && q && n <= q.choices.length) answer(q.choices[n - 1].id);
      else if (answered && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); next(); }
      else if (!answered && (e.key === 'r' || e.key === ' ') && q && q.play) { e.preventDefault(); q.play(); }
    }
    document.addEventListener('keydown', onKey);
    next();
    return () => { alive = false; clearTimeout(autoTimer); document.removeEventListener('keydown', onKey); };
  }

  /* ---------- Fretboard ---------- */
  const FB = { W: 700, H: 250, nut: 44, fw: 54.6, top: 22, gap: 40 };
  function fretX(f) { return f === 0 ? FB.nut / 2 : FB.nut + (f - 0.5) * FB.fw; }
  function strY(si) { return FB.top + (5 - si) * FB.gap; }
  function Fretboard(opts = {}) {
    const svg = s('svg', { viewBox: `0 0 ${FB.W} ${FB.H}`, class: 'fretboard', role: 'img', 'aria-label': opts.label || 'Guitar fretboard, frets 0 to 12' });
    const base = s('g'), hl = s('g'), dots = s('g');
    base.append(s('rect', { class: 'wood', x: FB.nut, y: FB.top - 12, width: FB.W - FB.nut, height: FB.gap * 5 + 24, rx: 4 }));
    [3, 5, 7, 9].forEach(f => base.append(s('circle', { class: 'inlay', cx: fretX(f), cy: FB.top + FB.gap * 2.5, r: 7 })));
    base.append(s('circle', { class: 'inlay', cx: fretX(12), cy: FB.top + FB.gap * 1.5, r: 7 }), s('circle', { class: 'inlay', cx: fretX(12), cy: FB.top + FB.gap * 3.5, r: 7 }));
    for (let f = 1; f <= 12; f++) base.append(s('line', { class: 'fret', x1: FB.nut + f * FB.fw, x2: FB.nut + f * FB.fw, y1: FB.top - 12, y2: FB.top + FB.gap * 5 + 12 }));
    base.append(s('line', { class: 'nut', x1: FB.nut, x2: FB.nut, y1: FB.top - 12, y2: FB.top + FB.gap * 5 + 12 }));
    for (let si = 0; si < 6; si++) base.append(s('line', { class: 'str', x1: 4, x2: FB.W, y1: strY(si), y2: strY(si), 'stroke-width': 1 + (5 - si) * 0.35 + 0.4 }));
    for (let f = 0; f <= 12; f++) base.append(s('text', { class: 'fnum', x: fretX(f), y: FB.H - 4 }, String(f)));
    svg.append(base, hl, dots);
    function highlightString(si) {
      hl.innerHTML = '';
      if (si === null || si === undefined) return;
      hl.append(s('rect', { class: 'hl', x: 0, y: strY(si) - FB.gap / 2 + 2, width: FB.W, height: FB.gap - 4, rx: 6 }));
    }
    function mark(list, keep) {
      if (!keep) dots.innerHTML = '';
      list.forEach(m => {
        const filled = ['root', 'g3', 'good', 'bad'].includes(m.kind);
        dots.append(s('circle', { class: 'dot ' + (m.kind || 'tone'), cx: fretX(m.f), cy: strY(m.s), r: 14 }));
        if (m.label) dots.append(s('text', { class: 'lbl' + (filled ? ' on' : ''), x: fretX(m.f), y: strY(m.s) }, m.label));
      });
    }
    svg.addEventListener('click', ev => {
      if (!opts.onTap) return;
      const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      const ctm = svg.getScreenCTM(); if (!ctm) return;
      const p = pt.matrixTransform(ctm.inverse());
      let si = Math.round(5 - (p.y - FB.top) / FB.gap); si = Math.max(0, Math.min(5, si));
      let f = p.x < FB.nut ? 0 : Math.ceil((p.x - FB.nut) / FB.fw); f = Math.max(0, Math.min(12, f));
      opts.onTap(si, f, ev);
    });
    const wrap = h('div', { class: 'fretwrap' }); wrap.append(svg);
    return { el: wrap, mark, clear: () => { dots.innerHTML = ''; }, highlightString };
  }
  function positionsOfPc(pcs, maxFret = 12, kindFn) {
    const out = [];
    E.STRINGS.forEach((st, si) => {
      for (let f = 0; f <= maxFret; f++) {
        const p = (st.midi + f) % 12;
        if (pcs.includes(p)) out.push({ s: si, f, p, kind: kindFn ? kindFn(p) : 'tone', label: D.NOTE_NAMES[p] });
      }
    });
    return out;
  }

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
        const choices = D.INTERVALS.filter(i => ids.includes(i.id)).map(i => ({ id: i.id, label: i.id, sub: i.name }));
        const playIv = semi => {
          const t = A.now() + 0.05;
          if (dir === 'up') { A.note(root, t, 0.8, 1.0); A.note(root + semi, t + 0.75, 0.8, 1.4); }
          else if (dir === 'down') { A.note(root + semi, t, 0.8, 1.0); A.note(root, t + 0.75, 0.8, 1.4); }
          else { A.note(root, t, 0.65, 1.8); A.note(root + semi, t, 0.65, 1.8); }
        };
        const st = E.skillState('intervals').items[item.id];
        const anc = dir === 'harm' ? 'Sounds ' + iv.feel : E.anchor(ivId, dir);
        let mode = 'none';
        if (!ctx.params.test && anc) mode = (!st || st.n < 3 || st.ema < 0.5) ? 'auto' : st.ema < 0.8 ? 'button' : 'none';
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
        const pool = (ctx.params.test ? E.universe('chords') : E.unlocked('chords')).map(x => x.id);
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
        const pool = (ctx.params.test ? E.universe('degrees') : E.unlocked('degrees')).map(x => x.id);
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
        if (pool.length < 3) pool = D.SCALES.filter(x => x.tier <= sc.tier + 1 && x.id !== sc.id).map(x => x.id);
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
      card.append(h('label', { class: 'stack', for: 'drone-scale' }, h('span', { class: 'eyebrow', text: 'Scale' }), sel), h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Tonic (Sa)' }), tonics), h('div', { class: 'row' }, droneBtn, playBtn), info, fb.el,
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

  /* ======================================================
     RHYTHM TOOLS
     ====================================================== */
  const SOUND_FOR = { clave: 'clave', bell: 'bell', low: 'low', mid: 'mid', high: 'high', shaker: 'shaker', clap: 'clap', chick: 'chick', hat: 'hat', ride: 'ride' };
  function stepDurFn(r, bpm) { const sd = 60 / bpm / r.spb; return () => sd; }
  function targetSteps(r) {
    const out = [];
    for (let i = 0; i < r.steps; i++) {
      if (r.target === 'all') { if (Object.entries(r.tracks).some(([k, v]) => (k === 'low' || k === 'high') && v[i] !== '.')) out.push(i); }
      else if (r.tracks[r.target][i] !== '.') out.push(i);
    }
    return out;
  }
  function beatSteps(r) {
    if (r.groups) { const out = []; let acc = 0; r.groups.forEach(g => { out.push(acc); acc += g; }); return out; }
    const out = []; for (let i = 0; i < r.steps; i += r.spb) out.push(i); return out;
  }
  function RhythmGrid(r) {
    const wrap = h('div', { class: 'rgrid-wrap' });
    const grid = h('div', { class: 'rgrid' });
    const cols = `56px repeat(${r.steps}, minmax(12px, 1fr))`;
    const gstarts = new Set(); if (r.groups) { let a = 0; r.groups.forEach(g => { if (a) gstarts.add(a); a += g; }); } else for (let i = r.spb; i < r.steps; i += r.spb) gstarts.add(i);
    const cells = [];
    const tgt = new Set(targetSteps(r));
    Object.entries(r.tracks).forEach(([name, pat]) => {
      const row = h('div', { class: 'rrow', style: { gridTemplateColumns: cols } });
      row.append(h('span', { class: 'rname', text: name === 'low' ? 'dum/low' : name === 'high' ? 'tek/high' : name }));
      for (let i = 0; i < r.steps; i++) {
        const ch = pat[i];
        const isT = (r.target === name) || (r.target === 'all' && (name === 'low' || name === 'high'));
        const c = h('span', { class: 'cell' + (ch === 'X' ? ' acc' : ch !== '.' ? ' on' : '') + (isT && ch !== '.' ? ' target' : '') + (gstarts.has(i) ? ' gstart' : '') });
        row.append(c); (cells[i] = cells[i] || []).push(c);
      }
      grid.append(row);
    });
    const labs = [];
    const labRow = h('div', { class: 'rrow', style: { gridTemplateColumns: cols } });
    labRow.append(h('span', { class: 'rname', text: r.labels ? 'say' : 'count' }));
    for (let i = 0; i < r.steps; i++) {
      let t = r.labels ? r.labels[i] : (i % r.spb === 0 ? String(i / r.spb + 1) : r.spb === 2 ? '&' : r.spb === 4 ? ['', 'e', '&', 'a'][i % 4] : r.spb === 3 ? ['', '&', 'a'][i % 3] : '');
      if (r.groups && !r.labels) { let a = 0, gi = 0; for (const g of r.groups) { if (i >= a && i < a + g) { t = String(i - a + 1); break; } a += g; gi++; } }
      const l = h('span', { class: 'lab' + (gstarts.has(i) ? ' gstart' : ''), text: t, title: t });
      labs.push(l); labRow.append(l);
    }
    grid.append(labRow);
    if (r.marks) {
      const mRow = h('div', { class: 'rrow', style: { gridTemplateColumns: cols } });
      mRow.append(h('span', { class: 'rname', text: 'hand' }));
      for (let i = 0; i < r.steps; i++) mRow.append(h('span', { class: 'lab', text: r.marks[i] || '' }));
      grid.append(mRow);
    }
    wrap.append(grid);
    let prev = -1;
    return {
      el: wrap,
      setNow(i) {
        if (prev >= 0) { (cells[prev] || []).forEach(c => c.classList.remove('now')); labs[prev] && labs[prev].classList.remove('now'); }
        if (i >= 0) { (cells[i] || []).forEach(c => c.classList.add('now')); labs[i] && labs[i].classList.add('now'); }
        prev = i;
      }
    };
  }
  function playRhythmStep(r, i, t, mute) {
    Object.entries(r.tracks).forEach(([name, pat]) => {
      if (mute && mute.has(name)) return;
      const ch = pat[i];
      if (ch !== '.') A.hit(SOUND_FOR[name] || 'mid', t, ch === 'X' ? 1 : 0.7);
    });
  }

  /* Matching taps to expected onsets */
  function scoreTaps(expected, taps, win) {
    const used = new Set(); const errs = [];
    expected.forEach(e => {
      let best = -1, bd = Infinity;
      taps.forEach((tp, j) => { if (used.has(j)) return; const d = tp - e.t; if (Math.abs(d) < Math.abs(bd) && Math.abs(d) <= win) { bd = d; best = j; } });
      if (best >= 0) { used.add(best); errs.push({ e, d: bd }); } else errs.push({ e, d: null });
    });
    const first = expected.length ? expected[0].t - win : 0, last = expected.length ? expected[expected.length - 1].t + win : 0;
    const extra = taps.filter((tp, j) => !used.has(j) && tp >= first && tp <= last).length;
    const hits = errs.filter(x => x.d !== null);
    const hitRate = expected.length ? hits.length / expected.length : 0;
    const meanAbs = hits.length ? hits.reduce((a, x) => a + Math.abs(x.d), 0) / hits.length : win;
    const mean = hits.length ? hits.reduce((a, x) => a + x.d, 0) / hits.length : 0;
    const sd = hits.length > 1 ? Math.sqrt(hits.reduce((a, x) => a + (x.d - mean) ** 2, 0) / (hits.length - 1)) : 0;
    const precision = Math.max(0, 1 - meanAbs / (win * 0.9));
    const score = Math.max(0, Math.min(1, hitRate * 0.6 + precision * 0.4 - Math.min(0.3, extra * 0.04)));
    return { errs, hitRate, meanAbs, mean, sd, extra, score };
  }
  function OffsetChart(errs, win, groupFn) {
    const W = 640, Hh = 150, pad = 30;
    const svg = s('svg', { viewBox: `0 0 ${W} ${Hh}`, class: 'chart', role: 'img', 'aria-label': 'Tap timing: points above the line are late, below are early' });
    const lim = Math.ceil(win * 1000 / 20) * 20;
    const y = ms => Hh / 2 - (ms / lim) * (Hh / 2 - 14);
    [-lim, -lim / 2, 0, lim / 2, lim].forEach(v => {
      svg.append(s('line', { class: v === 0 ? 'zero' : 'grid', x1: pad, x2: W - 6, y1: y(v), y2: y(v) }));
      svg.append(s('text', { x: pad - 4, y: y(v) + 3, 'text-anchor': 'end' }, (v > 0 ? '+' : '') + Math.round(v)));
    });
    svg.append(s('text', { x: W - 6, y: 12, 'text-anchor': 'end' }, 'late (ms)'), s('text', { x: W - 6, y: Hh - 4, 'text-anchor': 'end' }, 'early'));
    const n = errs.length, step = (W - pad - 16) / Math.max(1, n - 1);
    errs.forEach((x, i) => {
      const cx = pad + 8 + i * step;
      if (x.d === null) svg.append(s('text', { x: cx, y: Hh / 2 + 4, 'text-anchor': 'middle', fill: 'currentColor', class: '' }, '×'));
      else svg.append(s('circle', { cx, cy: y(Math.max(-lim, Math.min(lim, x.d * 1000))), r: 4.5, class: Math.abs(x.d * 1000) < 35 ? 'pt-good' : 'pt-bad' }));
    });
    return svg;
  }
  function describeOffset(meanMs) {
    if (Math.abs(meanMs) < 12) return 'Right in the pocket on average.';
    return meanMs > 0 ? 'You drag by ' + Math.round(meanMs) + ' ms on average (late).' : 'You rush by ' + Math.round(-meanMs) + ' ms on average (early).';
  }
  function TapPad(onTap, label = 'Tap here (or space bar)') {
    const pad = h('button', { class: 'tappad', type: 'button' }, label);
    const fire = ev => { ev.preventDefault(); onTap(ev); pad.classList.add('flash'); setTimeout(() => pad.classList.remove('flash'), 80); };
    pad.addEventListener('pointerdown', fire);
    const key = ev => { if (ev.code === 'Space' && !ev.repeat && !(ev.target && ['INPUT', 'SELECT', 'TEXTAREA'].includes(ev.target.tagName))) fire(ev); };
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    document.addEventListener('keydown', key);
    return { el: pad, cleanup: () => document.removeEventListener('keydown', key) };
  }

  tool('rhythms', {
    tab: 'rhythm', skill: 'rhythmTap', title: 'Rhythm atlas', eyebrow: 'Rhythm · play & tap along',
    desc: 'Clave, talas, iqa\'at, aksak meters and flamenco compás. Loop one, then take the tap test: two cycles with the pattern, two with it muted.',
    render(body, ctx) {
      const regionFilter = (x, region) => D.RHYTHMS.find(r => r.id === x.id).region === region;
      let r = D.RHYTHMS.find(x => x.id === ctx.params.rhythm) || D.RHYTHMS.find(x => x.id === (pickFor('rhythmTap', ctx, regionFilter) || {}).id) || D.RHYTHMS[0];
      let bpm = r.bpm, loop = null, testing = false, padObj = null;
      const card = h('div', { class: 'card' }); body.append(card);
      const sel = h('select', { id: 'rhythm-pick', 'aria-label': 'Rhythm' });
      D.REGIONS.forEach(reg => {
        const list = D.RHYTHMS.filter(x => x.region === reg.id); if (!list.length) return;
        const g = h('optgroup', { label: reg.name });
        list.forEach(x => g.append(h('option', { value: x.id, text: x.name })));
        sel.append(g);
      });
      const head = h('div', { class: 'stack' });
      const gridHolder = h('div');
      const tempo = h('input', { type: 'range', min: 40, max: 400, id: 'rhythm-tempo', 'aria-label': 'Tempo' });
      const tempoLbl = h('span', { class: 'mono small' });
      const playBtn = h('button', { class: 'btn primary' }, '▶ Loop');
      const testBtn = h('button', { class: 'btn brass' }, 'Take the tap test');
      const phase = h('div', { class: 'phase', hidden: true });
      const padHolder = h('div');
      const result = h('div', { class: 'stack' });
      card.append(h('label', { class: 'stack', for: 'rhythm-pick' }, h('span', { class: 'eyebrow', text: 'Rhythm' }), sel), head, gridHolder,
        h('label', { class: 'stack', for: 'rhythm-tempo' }, h('span', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Tempo' }), tempoLbl), tempo),
        h('div', { class: 'row' }, playBtn, testBtn), phase, padHolder, result);
      let grid = null;
      function setR(nr) {
        stop(); r = nr; bpm = r.bpm; sel.value = r.id;
        tempo.min = Math.round(r.bpm * 0.45); tempo.max = Math.round(r.bpm * 1.6); tempo.value = bpm;
        tempoLbl.textContent = bpm + ' ' + (r.unit ? r.unit + '/min' : 'bpm');
        head.innerHTML = '';
        const st = E.skillState('rhythmTap').items[r.id];
        head.append(h('h2', { text: r.name }), h('p', { class: 'small muted', text: regionName(r.region) + ' · ' + r.meter + (st ? ' · best recent score ' + Math.round(st.ema * 100) + '%' : '') }), h('p', { class: 'small', text: r.note }),
          h('p', { class: 'small muted', text: 'Outlined cells are what you tap in the test: ' + (r.target === 'all' ? 'every dum and tek' : r.target) + '.' }));
        gridHolder.innerHTML = ''; grid = RhythmGrid(r); gridHolder.append(grid.el);
        result.innerHTML = '';
      }
      function stop() {
        if (loop) loop.stop(); loop = null; testing = false;
        playBtn.textContent = '▶ Loop'; ctx.setActive(false);
        grid && grid.setNow(-1);
        if (padObj) { padObj.cleanup(); padObj = null; } padHolder.innerHTML = ''; phase.hidden = true;
        testBtn.disabled = false;
      }
      function play() {
        A.ensure();
        loop = A.Loop({ steps: r.steps, stepDur: stepDurFn(r, bpm), onStep: (i, t) => playRhythmStep(r, i, t), onVisual: i => grid.setNow(i) });
        loop.start(); playBtn.textContent = '■ Stop'; ctx.setActive(true);
      }
      playBtn.onclick = () => (loop ? stop() : play());
      tempo.oninput = () => { bpm = +tempo.value; tempoLbl.textContent = bpm + ' ' + (r.unit ? r.unit + '/min' : 'bpm'); if (loop && !testing) { stop(); play(); } };
      sel.onchange = () => setR(D.RHYTHMS.find(x => x.id === sel.value));
      testBtn.onclick = () => runTest();

      function runTest() {
        stop(); A.ensure(); testing = true; testBtn.disabled = true; result.innerHTML = '';
        const CYCLES = 5; // 1 count-in, 2 guided, 2 ghost
        const tgt = new Set(targetSteps(r));
        const beats = new Set(beatSteps(r));
        const sd = 60 / bpm / r.spb;
        const muteSet = new Set(r.target === 'all' ? ['low', 'high'] : [r.target]);
        const expected = [], taps = [];
        const lat = (E.state.settings.latencyMs || 0) / 1000;
        padObj = TapPad(ev => { taps.push(A.eventToAudioTime(ev) - lat); });
        padHolder.append(padObj.el);
        phase.hidden = false;
        loop = A.Loop({
          steps: r.steps, stepDur: () => sd, maxSteps: r.steps * CYCLES,
          onStep: (i, t, cycle) => {
            const ghost = cycle >= 3;
            playRhythmStep(r, i, t, ghost ? muteSet : null);
            if (cycle === 0 && beats.has(i)) A.hit(i === 0 ? 'clickHi' : 'click', t, 0.8);
            if (ghost && beats.has(i)) A.hit(i === 0 ? 'clickHi' : 'click', t, 0.45);
            if (cycle >= 1 && tgt.has(i)) expected.push({ t, cycle, ghost });
          },
          onVisual: (i, cycle) => {
            grid.setNow(i);
            phase.textContent = cycle === 0 ? 'Count-in: listen…' : cycle <= 2 ? 'Cycle ' + cycle + ' of 4: tap with the pattern' : 'Cycle ' + cycle + ' of 4: pattern muted, keep tapping';
          },
          onEnd: finish
        });
        loop.start(); ctx.setActive(true);
        function finish() {
          const ts = targetSteps(r);
          let minGap = r.steps;
          ts.forEach((st, k) => { const nx = k + 1 < ts.length ? ts[k + 1] : ts[0] + r.steps; minGap = Math.min(minGap, nx - st); });
          const win = Math.max(0.05, Math.min(0.15, sd * minGap * 0.45));
          const res = scoreTaps(expected, taps, win);
          const ghostRes = scoreTaps(expected.filter(e => e.ghost), taps, win);
          const ok = res.score >= 0.7;
          E.record('rhythmTap', r.id, ok, { score: res.score });
          ctx.tick(1);
          stop();
          result.append(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') },
            h('div', { class: 'spread' }, h('b', { text: 'Score ' + Math.round(res.score * 100) + '%' }), h('span', { class: 'mono small', text: Math.round(res.hitRate * 100) + '% hit · ±' + Math.round(res.sd * 1000) + ' ms spread' })),
            h('span', { text: describeOffset(res.mean * 1000) }),
            h('span', { class: 'small', text: 'With the pattern muted you hit ' + Math.round(ghostRes.hitRate * 100) + '% of notes' + (res.extra ? '; ' + res.extra + ' extra taps' : '') + '.' })),
            OffsetChart(res.errs, win),
            h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: runTest }, 'Try again'),
              h('button', { class: 'btn primary small', onclick: () => { const nx = pickFor('rhythmTap', ctx, regionFilter); setR(D.RHYTHMS.find(x => x.id === nx.id)); } }, 'Next rhythm →')));
        }
      }
      setR(r);
      return () => stop();
    }
  });

  tool('rhythmid', {
    tab: 'rhythm', skill: 'rhythmId', title: 'Name that rhythm', eyebrow: 'Rhythm · recognition',
    desc: 'Hear two cycles of a rhythm from somewhere in the world. Name it.',
    render(body, ctx) {
      let loop = null;
      const regionFilter = (x, region) => D.RHYTHMS.find(r => r.id === x.id).region === region;
      const stopLoop = () => { if (loop) loop.stop(); loop = null; };
      const cleanup = Quiz(body, ctx, () => {
        stopLoop();
        const item = pickFor('rhythmId', ctx, regionFilter);
        const r = D.RHYTHMS.find(x => x.id === item.id);
        let pool = (ctx.params.test ? E.universe('rhythmId') : E.unlocked('rhythmId')).map(x => x.id).filter(id => id !== r.id);
        if (pool.length < 3) pool = D.RHYTHMS.filter(x => x.id !== r.id && x.tier <= r.tier + 1).map(x => x.id);
        const opts = shuffle(shuffle(pool).slice(0, 3).concat([r.id])).map(id => D.RHYTHMS.find(x => x.id === id));
        const play = (rr = r) => { stopLoop(); loop = A.Loop({ steps: rr.steps, stepDur: stepDurFn(rr, rr.bpm), maxSteps: rr.steps * 2, onStep: (i, t) => playRhythmStep(rr, i, t) }); loop.start(); };
        return {
          prompt: 'Which rhythm?', play: () => play(r), wide: true, autoDelay: 1800,
          choices: opts.map(x => ({ id: x.id, label: x.name, sub: regionName(x.region) + ' · ' + x.meter })), answer: r.id,
          compare: id => play(D.RHYTHMS.find(x => x.id === id)),
          onResult: (ok, id, rt) => E.record('rhythmId', r.id, ok, { confused: id, rt }),
          explain: () => r.name + ' (' + regionName(r.region) + ', ' + r.meter + '). ' + r.note
        };
      });
      return () => { stopLoop(); cleanup(); };
    }
  });

  tool('clock', {
    tab: 'rhythm', skill: 'clock', title: 'Internal clock', eyebrow: 'Rhythm · time feel',
    desc: 'Tap every beat. After two bars the click disappears for four bars. Keep going until it comes back.',
    render(body, ctx) {
      const card = h('div', { class: 'card' }); body.append(card);
      let loop = null, padObj = null, item = ctx.params.tempo ? E.universe('clock').find(x => x.id === ctx.params.tempo) : pickFor('clock', ctx);
      const tempoSel = h('div', { class: 'chips' });
      const info = h('div', { class: 'phase' });
      const startBtn = h('button', { class: 'btn brass' }, 'Start');
      const padHolder = h('div'), result = h('div', { class: 'stack' });
      card.append(h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: 'Tempo' }), tempoSel), h('div', { class: 'row' }, startBtn), info, padHolder, result);
      function renderTempos() {
        tempoSel.innerHTML = '';
        E.universe('clock').slice().sort((a, b) => +a.id - +b.id).forEach(x => {
          const st = E.skillState('clock').items[x.id];
          tempoSel.append(h('button', { class: 'chip', 'aria-pressed': x.id === item.id ? 'true' : 'false', onclick: () => { item = x; renderTempos(); } }, x.label + (st ? ' · ' + Math.round(st.ema * 100) + '%' : '')));
        });
      }
      function stop() { if (loop) loop.stop(); loop = null; if (padObj) { padObj.cleanup(); padObj = null; } padHolder.innerHTML = ''; ctx.setActive(false); startBtn.disabled = false; }
      startBtn.onclick = () => {
        stop(); A.ensure(); result.innerHTML = ''; startBtn.disabled = true;
        const bpm = +item.id, beat = 60 / bpm, taps = [], expected = [];
        const lat = (E.state.settings.latencyMs || 0) / 1000;
        padObj = TapPad(ev => taps.push(A.eventToAudioTime(ev) - lat)); padHolder.append(padObj.el);
        const total = 8 + 16 + 4;
        loop = A.Loop({
          steps: total, stepDur: () => beat, maxSteps: total,
          onStep: (i, t) => {
            const audible = i < 8 || i >= 24;
            if (audible) A.hit(i % 4 === 0 ? 'clickHi' : 'click', t, 0.9);
            if (i >= 8 && i < 24) expected.push({ t, beat: i });
          },
          onVisual: i => { info.textContent = i < 8 ? 'Click on — bar ' + (Math.floor(i / 4) + 1) + ' of 2' : i < 24 ? 'Silent — bar ' + (Math.floor((i - 8) / 4) + 1) + ' of 4. Keep tapping.' : 'Click is back: how close were you?'; },
          onEnd: () => {
            const res = scoreTaps(expected, taps, beat * 0.45);
            const lastHits = res.errs.slice(-4).filter(x => x.d !== null);
            const drift = lastHits.length ? lastHits.reduce((a, x) => a + x.d, 0) / lastHits.length * 1000 : 0;
            const score = Math.max(0, Math.min(1, res.hitRate * 0.5 + Math.max(0, 1 - res.meanAbs * 1000 / 80) * 0.5));
            const ok = score >= 0.7;
            E.record('clock', item.id, ok, { score });
            ctx.tick(1);
            stop(); renderTempos();
            result.append(h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') },
              h('b', { text: 'Score ' + Math.round(score * 100) + '%' }),
              h('span', { text: 'Average error ' + Math.round(res.meanAbs * 1000) + ' ms. By the end of the silence you were ' + (Math.abs(drift) < 15 ? 'still on the beat.' : Math.round(Math.abs(drift)) + ' ms ' + (drift > 0 ? 'late (slowing down).' : 'early (speeding up).')) })),
              OffsetChart(res.errs, beat * 0.45),
              h('p', { class: 'small muted', text: 'Each point is one silent beat, left to right. Drifting upward means you slow down without the click.' }));
          }
        });
        loop.start(); ctx.setActive(true);
      };
      renderTempos();
      return () => stop();
    }
  });

  tool('metronome', {
    tab: 'rhythm', skill: 'clock', title: 'Metronome & calibration', eyebrow: 'Rhythm · tools',
    desc: 'A metronome with gap bars and subdivisions, plus a tap calibration that makes every timing score fair on your device.',
    render(body, ctx) {
      const st = { bpm: 90, beats: 4, sub: 1, play: 4, mute: 0 };
      let loop = null, calLoop = null, calPad = null;
      const card = h('div', { class: 'card' }); body.append(card);
      const big = h('div', { class: 'big-number mono', text: st.bpm });
      const dots = h('div', { class: 'row' });
      const bpmIn = h('input', { type: 'range', min: 30, max: 260, value: st.bpm, id: 'met-bpm', 'aria-label': 'Tempo' });
      const seg = (label, key, vals, fmt) => {
        const wrapper = h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: label }));
        const sg = h('div', { class: 'seg' });
        vals.forEach(v => sg.append(h('button', { 'aria-pressed': st[key] === v ? 'true' : 'false', onclick: e => { st[key] = v; sg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === e.currentTarget ? 'true' : 'false')); if (loop) { stopMet(); startMet(); } } }, fmt ? fmt(v) : String(v))));
        wrapper.append(sg); return wrapper;
      };
      const btn = h('button', { class: 'btn primary' }, '▶ Start');
      card.append(h('div', { class: 'spread' }, big, dots), bpmIn,
        h('div', { class: 'row' }, seg('Beats', 'beats', [2, 3, 4, 5, 7]), seg('Subdivision', 'sub', [1, 2, 3, 4], v => ['♩', '♫', '3', '4'][v - 1])),
        h('div', { class: 'row' }, seg('Play bars', 'play', [1, 2, 4]), seg('Then mute bars', 'mute', [0, 1, 2, 4], v => v === 0 ? 'off' : String(v))), btn);
      function renderDots(active) { dots.innerHTML = ''; for (let i = 0; i < st.beats; i++) dots.append(h('span', { style: { width: '14px', height: '14px', borderRadius: '50%', display: 'inline-block', background: i === active ? 'var(--brass)' : 'var(--sunk)' } })); }
      function startMet() {
        A.ensure();
        const steps = st.beats * st.sub * (st.play + st.mute);
        loop = A.Loop({
          steps, stepDur: () => 60 / st.bpm / st.sub,
          onStep: (i, t) => {
            const bar = Math.floor(i / (st.beats * st.sub));
            if (bar >= st.play) return;
            const inBar = i % (st.beats * st.sub);
            if (inBar === 0) A.hit('clickHi', t, 1); else if (inBar % st.sub === 0) A.hit('click', t, 0.85); else A.hit('click', t, 0.35);
          },
          onVisual: i => { const inBar = i % (st.beats * st.sub); if (inBar % st.sub === 0) renderDots(inBar / st.sub); }
        });
        loop.start(); btn.textContent = '■ Stop'; ctx.setActive(true);
      }
      function stopMet() { if (loop) loop.stop(); loop = null; btn.textContent = '▶ Start'; ctx.setActive(false); renderDots(-1); }
      btn.onclick = () => (loop ? stopMet() : startMet());
      bpmIn.oninput = () => { st.bpm = +bpmIn.value; big.textContent = st.bpm; if (loop) { stopMet(); startMet(); } };
      renderDots(-1);

      const cal = h('div', { class: 'card' }); body.append(cal);
      const calInfo = h('p', { class: 'small', text: 'Current correction: ' + (E.state.settings.latencyMs || 0) + ' ms.' });
      const calBtn = h('button', { class: 'btn' }, 'Calibrate');
      const calPadHolder = h('div');
      cal.append(h('h2', { text: 'Tap calibration' }), h('p', { class: 'small muted', text: 'Phones and Bluetooth headphones add delay. Tap along with 12 clicks; the app measures your device and subtracts it from every timing test.' }), calInfo, calBtn, calPadHolder);
      calBtn.onclick = () => {
        stopMet(); A.ensure(); calBtn.disabled = true;
        const taps = [], clicks = [], beat = 60 / 90;
        calPad = TapPad(ev => taps.push(A.eventToAudioTime(ev))); calPadHolder.innerHTML = ''; calPadHolder.append(calPad.el);
        calLoop = A.Loop({ steps: 16, stepDur: () => beat, maxSteps: 16, onStep: (i, t) => { A.hit(i % 4 === 0 ? 'clickHi' : 'click', t, 1); if (i >= 4) clicks.push(t); }, onEnd: () => {
          const offs = [];
          clicks.forEach(c => { let best = null; taps.forEach(tp => { const d = tp - c; if (Math.abs(d) < beat * 0.45 && (best === null || Math.abs(d) < Math.abs(best))) best = d; }); if (best !== null) offs.push(best * 1000); });
          calPad.cleanup(); calPadHolder.innerHTML = ''; calBtn.disabled = false;
          if (offs.length < 6) { calInfo.textContent = 'Not enough taps landed near the clicks. Try again and tap on every click.'; return; }
          offs.sort((a, b) => a - b);
          const med = Math.round(offs[Math.floor(offs.length / 2)]);
          E.setSetting('latencyMs', med);
          calInfo.textContent = 'Saved: ' + med + ' ms correction (' + offs.length + ' taps measured).';
        } });
        calLoop.start();
      };
      return () => { stopMet(); if (calLoop) calLoop.stop(); if (calPad) calPad.cleanup(); };
    }
  });

  /* ======================================================
     PLAY TOOLS
     ====================================================== */
  tool('fretboard', {
    tab: 'play', skill: 'fretboard', title: 'Fretboard notes', eyebrow: 'Play · know the neck',
    desc: 'Find the named note on the highlighted string. Starts with natural notes on the low strings.',
    render(body, ctx) {
      const card = h('div', { class: 'card' }); body.append(card);
      const prompt = h('div', { class: 'prompt' });
      const sub = h('p', { class: 'small muted' });
      const fbk = h('div', { class: 'feedback', hidden: true });
      let item, si, target, t0, locked = false, timer = null;
      const fb = Fretboard({ onTap: (s2, f, ev) => {
        if (locked) return;
        A.ensure();
        A.note(E.STRINGS[s2].midi + f, A.now() + 0.01, 0.8, 1.2);
        if (s2 !== si) { sub.textContent = 'Tap on the ' + E.STRINGS[si].name + ' string (highlighted).'; return; }
        locked = true;
        const got = (E.STRINGS[s2].midi + f) % 12;
        const ok = got === target;
        E.record('fretboard', item.id, ok, { confused: E.STRINGS[si].id + ':' + got, rt: performance.now() - t0 });
        ctx.tick(1);
        const marks = [];
        for (let ff = 0; ff <= 12; ff++) if ((E.STRINGS[si].midi + ff) % 12 === target) marks.push({ s: si, f: ff, kind: 'good', label: D.NOTE_NAMES[target] });
        if (!ok) marks.push({ s: s2, f, kind: 'bad', label: D.NOTE_NAMES[got] });
        fb.mark(marks);
        fbk.hidden = false; fbk.className = 'feedback ' + (ok ? 'ok' : 'no');
        fbk.textContent = ok ? 'Yes — ' + D.NOTE_FULL[target] + '.' : 'That was ' + D.NOTE_FULL[got] + '. ' + D.NOTE_FULL[target] + ' is at fret ' + marks.filter(m => m.kind === 'good').map(m => m.f).join(' and ') + '.';
        timer = setTimeout(next, ok ? 700 : 2000);
      } });
      card.append(prompt, sub, fb.el, fbk);
      function next() {
        clearTimeout(timer); locked = false; fbk.hidden = true; fb.clear();
        item = pickFor('fretboard', ctx);
        const [sid, p] = item.id.split(':');
        si = E.STRINGS.findIndex(x => x.id === sid); target = +p;
        prompt.textContent = 'Find ' + D.NOTE_FULL[target];
        sub.textContent = 'On the ' + E.STRINGS[si].name + ' string';
        fb.highlightString(si);
        t0 = performance.now();
      }
      next();
      return () => clearTimeout(timer);
    }
  });

  tool('callresp', {
    tab: 'play', skill: 'callresp', title: 'Call & response', eyebrow: 'Play · ear to hands',
    desc: 'Hear a short phrase, then play it back by tapping the fretboard. Any octave counts.',
    render(body, ctx) {
      const card = h('div', { class: 'card' }); body.append(card);
      let item, lick = [], played = [], done = false, tonic, sc;
      const prompt = h('div', { class: 'prompt' }), sub = h('p', { class: 'small muted' });
      const slots = h('div', { class: 'row mono' });
      const fbk = h('div', { class: 'feedback', hidden: true });
      const fb = Fretboard({ onTap: (si, f) => {
        A.ensure();
        const m = E.STRINGS[si].midi + f;
        A.note(m, A.now() + 0.01, 0.8, 1.0);
        if (done) return;
        played.push({ m, si, f });
        fb.mark(played.map(p => ({ s: p.si, f: p.f, kind: 'tone', label: noteName(p.m) })));
        renderSlots();
        if (played.length === lick.length) check(false);
      } });
      const playBtn = h('button', { class: 'btn primary' }, '▶ Play phrase');
      const undoBtn = h('button', { class: 'btn small' }, 'Undo');
      const giveBtn = h('button', { class: 'btn small ghost' }, 'Show answer');
      card.append(prompt, sub, h('div', { class: 'row' }, playBtn, undoBtn, giveBtn), slots, fb.el, fbk);
      function renderSlots() {
        slots.innerHTML = '';
        lick.forEach((m, i) => slots.append(h('span', { class: 'chip', text: played[i] ? noteName(played[i].m) : '·' })));
      }
      function playLick() {
        const at = A.now() + 0.05;
        A.strum([tonic - 12, tonic - 5, tonic, tonic + (sc.steps.includes(3) && !sc.steps.includes(4) ? 3 : 4)], at, 0.4, 0.02, 0.9);
        lick.forEach((m, i) => A.note(m, at + 1.1 + i * 0.42, 0.85, 0.8));
      }
      function gen() {
        item = pickFor('callresp', ctx);
        const li = D.LICK_ITEMS.find(x => x.id === item.id);
        sc = D.SCALES.find(x => x.id === li.scale);
        tonic = rand(52, 59);
        const poolN = [];
        [-12, 0, 12].forEach(o => sc.steps.forEach(st => { const m = tonic + o + st; if (m >= tonic - 5 && m <= tonic + 16) poolN.push(m); }));
        poolN.sort((a, b) => a - b);
        let idx = poolN.indexOf(choice([tonic, tonic + sc.steps[Math.min(2, sc.steps.length - 1)]]));
        if (idx < 0) idx = poolN.indexOf(tonic);
        lick = [poolN[idx]];
        for (let i = 1; i < li.len; i++) {
          const mv = choice([-2, -1, -1, 1, 1, 2, 1, -1, 3, -3]);
          idx = Math.max(0, Math.min(poolN.length - 1, idx + mv));
          if (poolN[idx] === lick[lick.length - 1]) idx = Math.max(0, Math.min(poolN.length - 1, idx + (idx > 0 ? -1 : 1)));
          lick.push(poolN[idx]);
        }
        played = []; done = false; fbk.hidden = true; fb.clear();
        prompt.textContent = 'Play it back: ' + li.len + ' notes';
        sub.textContent = sc.name + ' in ' + noteName(tonic) + '. A chord sets the key first.';
        renderSlots();
        setTimeout(playLick, 150);
      }
      function check(gaveUp) {
        done = true;
        let match = 0; lick.forEach((m, i) => { if (played[i] && pc(played[i].m) === pc(m)) match++; });
        const ok = !gaveUp && match === lick.length;
        E.record('callresp', item.id, ok, { score: gaveUp ? 0 : match / lick.length });
        ctx.tick(1);
        // show answer positions near the first played or around fret 5
        const ans = lick.map(m => { let best = null; E.STRINGS.forEach((st, si) => { const f = m - st.midi; if (f >= 0 && f <= 12) { const cost = Math.abs(f - 5) + si * 0.1; if (!best || cost < best.cost) best = { s: si, f, cost }; } }); return best; }).filter(Boolean);
        fb.mark(ans.map((a, i) => ({ s: a.s, f: a.f, kind: played[i] && pc(played[i].m) === pc(lick[i]) ? 'good' : 'g3', label: String(i + 1) })));
        fbk.hidden = false; fbk.className = 'feedback ' + (ok ? 'ok' : 'no'); fbk.innerHTML = '';
        fbk.append(h('b', { text: ok ? 'Spot on.' : gaveUp ? 'Here it is.' : match + ' of ' + lick.length + ' notes right.' }), h('span', { text: 'The phrase: ' + lick.map(noteName).join(' – ') + '. Numbers on the neck show one way to play it.' }),
          h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: playLick }, 'Hear again'), h('button', { class: 'btn primary small', onclick: gen }, 'Next →')));
      }
      playBtn.onclick = () => { A.ensure(); playLick(); };
      undoBtn.onclick = () => { if (done) return; played.pop(); fb.mark(played.map(p => ({ s: p.si, f: p.f, kind: 'tone', label: noteName(p.m) }))); renderSlots(); };
      giveBtn.onclick = () => { if (!done) check(true); };
      gen();
    }
  });

  /* ---- Chords for repertoire ---- */
  const QUAL = [
    ['m7b5', [0, 3, 6, 10]], ['mmaj7', [0, 3, 7, 11]], ['maj7', [0, 4, 7, 11]], ['dim7', [0, 3, 6, 9]], ['7#11', [0, 4, 7, 10, 18]],
    ['m7', [0, 3, 7, 10]], ['m6', [0, 3, 7, 9]], ['6', [0, 4, 7, 9]], ['7', [0, 4, 7, 10]], ['m', [0, 3, 7]], ['', [0, 4, 7]]
  ];
  const ROOTS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function parseChord(sym) {
    const mm = /^([A-G])(#|b)?(.*)$/.exec(sym);
    if (!mm) return null;
    let root = ROOTS[mm[1]] + (mm[2] === '#' ? 1 : mm[2] === 'b' ? -1 : 0); root = (root + 12) % 12;
    const rest = mm[3];
    const q = QUAL.find(([k]) => k === rest) || QUAL[QUAL.length - 1];
    const iv = q[1];
    const third = iv.includes(4) ? 4 : 3;
    let seventh = iv.includes(10) ? 10 : iv.includes(11) ? 11 : (iv.includes(9) ? 9 : null);
    const label7 = seventh === 9 ? (q[0] === 'dim7' ? '♭♭7' : '6') : '7';
    return { sym, root, iv, third, seventh, fifth: iv.includes(6) && !iv.includes(7) ? 6 : 7, label7, triad: seventh === null };
  }
  function flatName(p) { return ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'][p]; }
  function prettySym(sym) { return sym.replace(/b(?=[^a-z]|$)/, '♭').replace('#', '♯').replace('m7b5', 'm7♭5').replace(/^([A-G])b/, '$1♭'); }

  tool('repertoire', {
    tab: 'play', skill: 'repertoire', title: 'Repertoire gym', eyebrow: 'Play · standards & world grooves',
    desc: 'Loop the changes in the right groove, see guide tones on the neck, and drill them until you hear the form.',
    render(body, ctx) {
      let tune = D.TUNES.find(t => t.id === ctx.params.tune);
      const listCard = h('div', { class: 'section' });
      const tuneCard = h('div', { class: 'section' });
      body.append(listCard, tuneCard);
      let loop = null, drillCleanup = null;
      function stopLoop() { if (loop) loop.stop(); loop = null; ctx.setActive(false); }
      function showList() {
        stopLoop(); if (drillCleanup) { drillCleanup(); drillCleanup = null; }
        tuneCard.innerHTML = ''; listCard.innerHTML = '';
        ['Jazz standards', 'World grooves'].forEach(g => {
          listCard.append(h('h2', { text: g }));
          const tl = h('div', { class: 'tools' });
          D.TUNES.filter(t => t.group === g).forEach(t => {
            const st = E.skillState('repertoire').items[t.id];
            tl.append(h('button', { class: 'tile', onclick: () => openTune(t) }, h('span', { class: 't-title', text: t.name }), h('span', { class: 't-desc', text: (t.region ? regionName(t.region) + ' · ' : '') + D.GROOVES[t.groove].name + ' · ' + t.note }), h('span', { class: 't-meter', text: st ? Math.round(st.ema * 100) + '%' : 'new' })));
          });
          listCard.append(tl);
        });
      }
      function openTune(t) {
        tune = t; listCard.innerHTML = ''; tuneCard.innerHTML = '';
        const g = D.GROOVES[t.groove];
        let bpm = t.bpm, blind = false;
        const bars = t.bars.map(b => b.split(' ').map(parseChord));
        const back = h('button', { class: 'btn ghost small', onclick: showList }, '← All tunes');
        const chartEl = h('div', { class: 'cchart' });
        const barEls = [];
        function drawChart() {
          chartEl.innerHTML = ''; barEls.length = 0;
          bars.forEach(b => { const el = h('div', { class: 'cbar' }, b.map(c => blind ? h('span', { class: 'blind', text: '?' }) : h('span', { text: prettySym(c.sym) }))); chartEl.append(el); barEls.push(el); });
        }
        const nowLbl = h('div', { class: 'prompt' });
        const legend = h('p', { class: 'small muted' });
        const fb = Fretboard({ onTap: (si, f) => A.note(E.STRINGS[si].midi + f, A.now() + 0.01, 0.8, 1.2) });
        const tempo = h('input', { type: 'range', min: 50, max: 300, value: bpm, id: 'tune-tempo', 'aria-label': 'Tempo' });
        const tempoLbl = h('span', { class: 'mono small', text: bpm + ' bpm' });
        const playBtn = h('button', { class: 'btn primary' }, '▶ Play changes');
        const blindBtn = h('button', { class: 'btn small', 'aria-pressed': 'false' }, 'Hide chord names');
        const drillBtn = h('button', { class: 'btn brass' }, 'Drill guide tones');
        const drillHolder = h('div');
        const card = h('div', { class: 'card' },
          h('div', { class: 'spread' }, back, h('span', { class: 'eyebrow', text: g.name })),
          h('h2', { text: t.name }), h('p', { class: 'small muted', text: t.note }),
          h('div', { class: 'row' }, playBtn, blindBtn, drillBtn),
          h('label', { class: 'stack', for: 'tune-tempo' }, h('span', { class: 'spread' }, h('span', { class: 'eyebrow', text: 'Tempo' }), tempoLbl), tempo),
          nowLbl, fb.el, legend, chartEl);
        tuneCard.append(card, drillHolder);
        function showChord(c) {
          if (!c) return;
          nowLbl.textContent = blind ? 'Listen: what is this chord?' : prettySym(c.sym);
          const tones = [{ p: c.root, kind: 'root' }, { p: (c.root + c.third) % 12, kind: 'g3' }, { p: (c.root + (c.seventh !== null ? c.seventh : c.fifth)) % 12, kind: 'g7' }];
          if (blind) { fb.clear(); return; }
          fb.mark(positionsOfPc(tones.map(x => x.p)).map(m => Object.assign(m, { kind: tones.find(x => x.p === m.p).kind, label: m.p === c.root ? 'R' : m.p === (c.root + c.third) % 12 ? '3' : (c.seventh !== null ? c.label7 : '5') })));
          legend.textContent = 'Gold R = root · filled 3 = third · outlined ' + (c.seventh !== null ? c.label7 : '5') + ' = ' + (c.seventh !== null ? 'seventh' : 'fifth') + '. Connect the 3rds and 7ths by the nearest step.';
        }
        drawChart(); showChord(bars[0][0]);
        function chordAt(bi, step) { const b = bars[bi]; return b.length === 1 ? b[0] : b[step < g.steps / 2 ? 0 : 1]; }
        function voicing(c) {
          let r = 43 + c.root; if (r > 50) r -= 12;
          // shell voicing: root, 7th, 3rd above (or a triad when there is no 7th)
          return c.seventh !== null ? [r, r + c.seventh, r + c.third + 12] : [r, r + c.fifth, r + 12, r + c.third + 12];
        }
        function bassNote(c, kind, nextC, beat) {
          let r = 33 + c.root; if (r > 40) r -= 12;
          if (kind === 'r') return r;
          if (kind === '5') return r + c.fifth;
          // walking: beat 0 root, 1 third, 2 fifth, 3 approach to next root
          if (beat === 0) return r;
          if (beat === 1) return r + c.third;
          if (beat === 2) return r + c.fifth;
          let nr = 33 + nextC.root; if (nr > 40) nr -= 12;
          return nr + (Math.random() < 0.5 ? 1 : -1);
        }
        const sdur = () => 60 / bpm / g.spb;
        function play() {
          A.ensure();
          const total = g.steps * bars.length;
          let lastChord = null;
          loop = A.Loop({
            steps: total, stepDur: sdur,
            onStep: (i, tt) => {
              const bi = Math.floor(i / g.steps), st = i % g.steps;
              const c = chordAt(bi, st);
              Object.entries(g.perc).forEach(([name, pat]) => { if (pat[st] !== '.') A.hit(SOUND_FOR[name], tt, pat[st] === 'X' ? 0.9 : 0.55); });
              if (g.comp[st] !== '.') A.strum(voicing(c), tt, g.comp[st] === 'X' ? 0.6 : 0.42, 0.012, t.groove === 'pompe' || t.groove === 'reggae' ? 0.18 : t.groove === 'swing' ? 0.35 : 0.6);
              if (g.bass === 'walk') { if (st % g.spb === 0) { const nb = bars[(bi + (st / g.spb === 3 ? 1 : 0)) % bars.length]; const nextC = st / g.spb === 3 ? nb[0] : c; A.note(bassNote(c, 'walk', nextC, st / g.spb), tt, 0.75, 0.55); } }
              else if (g.bass[st] !== '.') A.note(bassNote(c, g.bass[st]), tt, 0.75, 0.6);
            },
            onVisual: i => {
              const bi = Math.floor(i / g.steps), st = i % g.steps;
              const c = chordAt(bi, st);
              if (st === 0 || (bars[bi].length > 1 && st === g.steps / 2)) {
                barEls.forEach((el, k) => el.classList.toggle('now', k === bi));
                if (c !== lastChord) { showChord(c); lastChord = c; }
              }
            }
          });
          loop.start(); playBtn.textContent = '■ Stop'; ctx.setActive(true); ctx.timeSkill = 'repertoire';
        }
        playBtn.onclick = () => { if (loop) { stopLoop(); playBtn.textContent = '▶ Play changes'; } else play(); };
        tempo.oninput = () => { bpm = +tempo.value; tempoLbl.textContent = bpm + ' bpm'; };
        blindBtn.onclick = () => { blind = !blind; blindBtn.setAttribute('aria-pressed', String(blind)); blindBtn.textContent = blind ? 'Show chord names' : 'Hide chord names'; drawChart(); showChord(bars[0][0]); };
        drillBtn.onclick = () => { if (drillCleanup) drillCleanup(); drillHolder.innerHTML = ''; drillCleanup = drill(drillHolder, t, bars); drillHolder.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      }
      function drill(holder, t, bars) {
        const all = bars.flat();
        const uniq = []; all.forEach(c => { if (!uniq.some(u => u.sym === c.sym)) uniq.push(c); });
        return Quiz(holder, ctx, () => {
          const c = choice(uniq);
          const want = c.seventh !== null ? [(c.root + c.third) % 12, (c.root + c.seventh) % 12] : [(c.root + c.third) % 12, (c.root + c.fifth) % 12];
          const step2 = c.seventh !== null ? c.label7 : '5th';
          const combos = [];
          // answer choices: correct pair + plausible wrong pairs
          const key = p => flatName(p[0]) + ' & ' + flatName(p[1]);
          const cands = [want, [(c.root + (c.third === 4 ? 3 : 4)) % 12, want[1]], [want[0], (c.root + (c.seventh === 10 ? 11 : 10)) % 12], [(c.root + 7) % 12, c.root], [(want[0] + 1) % 12, (want[1] + 11) % 12]];
          cands.forEach(p => { if (!combos.some(x => key(x) === key(p))) combos.push(p); });
          const opts = shuffle(combos.slice(0, 4));
          const voiceIt = () => { let r = 48 + c.root; A.strum([r - 12].concat(c.iv.map(x => r + x)), A.now() + 0.05, 0.6, 0.02, 1.6); };
          return {
            eyebrow: t.name, prompt: prettySym(c.sym) + ': 3rd & ' + (c.seventh !== null ? c.label7 : '5th') + '?',
            sub: 'Pick the guide tones, then find them on the neck above.', play: voiceIt, replayLabel: 'Hear chord', noAutoplay: false,
            choices: opts.map(p => ({ id: key(p), label: key(p) })), answer: key(want),
            onResult: (ok, id, rt) => E.record('repertoire', t.id, ok, { rt }),
            explain: () => '3rd = ' + flatName(want[0]) + ', ' + step2 + ' = ' + flatName(want[1]) + '. Resolve each by step into the next chord.'
          };
        });
      }
      if (tune) openTune(tune); else showList();
      return () => { stopLoop(); if (drillCleanup) drillCleanup(); };
    }
  });

  tool('technique', {
    tab: 'play', skill: 'technique', title: 'Technique ladders', eyebrow: 'Play · speed with control',
    desc: 'Play with the click. Clean? It goes up 4 bpm. Two sloppy runs in a row? It drops 8. Your best clean tempo is tracked against a goal.',
    render(body, ctx) {
      const holder = h('div', { class: 'section' }); body.append(holder);
      let loop = null, countTimer = null;
      function stopAll() { if (loop) loop.stop(); loop = null; clearInterval(countTimer); ctx.setActive(false); }
      function list() {
        stopAll(); holder.innerHTML = '';
        const tl = h('div', { class: 'tools' });
        D.EXERCISES.forEach(ex => {
          const t = E.state.tech[ex.id];
          tl.append(h('button', { class: 'tile', onclick: () => open(ex) }, h('span', { class: 't-title', text: ex.name }),
            h('span', { class: 't-desc' }, bar(t && t.best ? 100 * t.best / ex.target : 0, 'brass')),
            h('span', { class: 't-meter', text: (t && t.best ? t.best : '—') + ' / ' + ex.target })));
        });
        holder.append(tl);
      }
      function open(ex) {
        stopAll(); holder.innerHTML = '';
        const t = E.techState(ex.id);
        const card = h('div', { class: 'card' });
        holder.append(card);
        const back = h('button', { class: 'btn ghost small', onclick: list }, '← All exercises');
        card.append(h('div', { class: 'spread' }, back, h('span', { class: 'eyebrow', text: ex.unit })), h('h2', { text: ex.name }), h('p', { class: 'small', text: ex.how }));
        const best = h('p', { class: 'small muted' });
        const progress = h('div');
        function refreshStats() {
          best.textContent = 'Best clean: ' + (t.best || '—') + ' · Goal: ' + ex.target + (ex.mode === 'count' ? ' changes per minute' : ' bpm');
          progress.innerHTML = ''; progress.append(bar(100 * (t.best || 0) / ex.target, 'brass'));
        }
        if (ex.mode === 'count') {
          let count = 0, left = 60;
          const big = h('div', { class: 'big-number mono', text: '0' });
          const clock = h('div', { class: 'phase', text: '60 s' });
          const startBtn = h('button', { class: 'btn primary' }, 'Start 60 seconds');
          const padObj = TapPad(() => { if (left > 0 && left < 60) { count++; big.textContent = count; } }, 'Tap once per clean change');
          card.append(best, progress, h('div', { class: 'spread' }, big, clock), startBtn, padObj.el);
          startBtn.onclick = () => {
            count = 0; left = 60; big.textContent = '0'; startBtn.disabled = true; ctx.setActive(true); A.ensure(); A.hit('clickHi', A.now() + 0.05);
            left = 59.9;
            const t0 = Date.now();
            countTimer = setInterval(() => {
              left = Math.max(0, 60 - (Date.now() - t0) / 1000);
              clock.textContent = Math.ceil(left) + ' s';
              if (left <= 0) { clearInterval(countTimer); A.hit('clickHi', A.now() + 0.02); startBtn.disabled = false; ctx.setActive(false); E.techCount(ex.id, count); ctx.tick(1); refreshStats(); toast(count + ' changes in a minute'); }
            }, 100);
          };
          refreshStats();
          const prevCleanup = ctx._cleanupExtra; ctx._cleanupExtra = () => { padObj.cleanup(); prevCleanup && prevCleanup(); };
          return;
        }
        const big = h('div', { class: 'big-number mono', text: t.bpm });
        const sub = { '16ths': 4, '8ths': 2, '8th triplets': 3, '16th triplets': 6, quarters: 1 }[ex.unit] || 2;
        const playBtn = h('button', { class: 'btn primary' }, '▶ Click');
        const minus = h('button', { class: 'btn small', onclick: () => { E.setTechBpm(ex.id, t.bpm - 2); big.textContent = t.bpm; restart(); } }, '−2');
        const plus = h('button', { class: 'btn small', onclick: () => { E.setTechBpm(ex.id, t.bpm + 2); big.textContent = t.bpm; restart(); } }, '+2');
        const cleanBtn = h('button', { class: 'btn brass' }, 'Clean ✓');
        const sloppyBtn = h('button', { class: 'btn' }, 'Not clean');
        const note = h('p', { class: 'small muted', text: 'Play 4 bars per attempt. Be honest: clean means even, relaxed and in time.' });
        card.append(best, progress, h('div', { class: 'spread' }, h('div', { class: 'row' }, minus, big, plus), playBtn), h('div', { class: 'row' }, cleanBtn, sloppyBtn), note);
        function start() {
          A.ensure();
          loop = A.Loop({ steps: 4 * sub, stepDur: () => 60 / t.bpm / sub, onStep: (i, tt) => { if (i === 0) A.hit('clickHi', tt, 1); else if (i % sub === 0) A.hit('click', tt, 0.85); else A.hit('click', tt, 0.3); } });
          loop.start(); playBtn.textContent = '■ Stop'; ctx.setActive(true);
        }
        function restart() { if (loop) { loop.stop(); loop = null; start(); } }
        playBtn.onclick = () => { if (loop) { stopAll(); playBtn.textContent = '▶ Click'; } else start(); };
        cleanBtn.onclick = () => { const before = t.bpm; E.techResult(ex.id, true); big.textContent = t.bpm; refreshStats(); restart(); toast('Clean at ' + before + '. Next: ' + t.bpm + ' bpm'); };
        sloppyBtn.onclick = () => { const before = t.bpm; E.techResult(ex.id, false); big.textContent = t.bpm; refreshStats(); restart(); toast(t.bpm < before ? 'Dropped to ' + t.bpm + ' bpm. Rebuild it clean.' : 'Stay at ' + t.bpm + ' and try again'); };
        refreshStats();
      }
      if (ctx.params.exercise) open(D.EXERCISES.find(e => e.id === ctx.params.exercise)); else list();
      return () => { stopAll(); ctx._cleanupExtra && ctx._cleanupExtra(); };
    }
  });

  /* ======================================================
     ATLAS
     ====================================================== */
  tool('atlasquiz', {
    tab: 'atlas', skill: 'atlas', title: 'World music quiz', eyebrow: 'Knowledge · spaced review',
    desc: 'Questions about rhythms, scales, instruments and players from every region. Missed ones come back sooner.',
    render(body, ctx) {
      return Quiz(body, ctx, () => {
        const regionFilter = (x, region) => x.region === region;
        const item = pickFor('atlas', ctx, regionFilter);
        const [rid, i] = item.id.split(':');
        const r = D.REGIONS.find(x => x.id === rid), f = r.facts[+i];
        const opts = shuffle([f.a].concat(f.w));
        return {
          eyebrow: r.name, prompt: f.q, wide: true, choices: opts.map(o => ({ id: o, label: o })), answer: f.a,
          onResult: (ok, id, rt) => E.record('atlas', item.id, ok, { rt }),
          explain: () => r.summary.split('. ')[0] + '.'
        };
      });
    }
  });

  function regionPage(r) {
    teardown(); ui.runner = { id: 'region' }; renderTabs();
    view.innerHTML = ''; window.scrollTo(0, 0);
    const score = Math.round(E.regionScore(r) * 100);
    const rw = E.regionOfWeek();
    view.append(h('div', { class: 'runner-head' }, h('div', { class: 'spread' }, h('button', { class: 'btn ghost small', onclick: () => go('atlas') }, '← Atlas'), h('span', { class: 'eyebrow', text: r.places })), h('h1', { text: r.name }), h('p', { text: r.summary })));
    view.append(h('div', { class: 'card' },
      h('div', { class: 'spread' }, h('h3', { text: 'Your progress here' }), h('span', { class: 'mono', text: score + '%' })), bar(score),
      h('div', { class: 'row' },
        h('button', { class: 'btn brass small', onclick: () => openTool('atlasquiz', { params: { region: r.id }, returnTab: 'atlas' }) }, 'Quiz me on ' + r.name),
        rw.id === r.id ? h('span', { class: 'small muted', text: 'This is your region of the week.' }) : h('button', { class: 'btn small', onclick: () => { E.setRegionWeek(r.id); toast(r.name + ' is your focus this week'); regionPage(r); } }, 'Make this my focus region'))));
    view.append(h('div', { class: 'card' }, h('h3', { text: 'Key ideas' }), h('ul', { class: 'list' }, r.concepts.map(c => h('li', { text: c })))));
    if (r.rhythms.length) {
      view.append(h('div', { class: 'card' }, h('h3', { text: 'Rhythms to play' }), h('div', { class: 'chips' }, r.rhythms.map(id => {
        const rr = D.RHYTHMS.find(x => x.id === id);
        return h('button', { class: 'chip', onclick: () => openTool('rhythms', { params: { rhythm: id }, returnTab: 'atlas' }) }, rr.name);
      }))));
    }
    view.append(h('div', { class: 'card' }, h('h3', { text: 'Scales & modes' }), h('div', { class: 'chips' }, r.scales.map(id => {
      const sc = D.SCALES.find(x => x.id === id);
      return h('button', { class: 'chip', onclick: () => openTool('drone', { params: { scale: id }, returnTab: 'atlas' }) }, sc.name);
    })), h('p', { class: 'small muted', text: 'Opens the drone explorer so you can hear and play each one.' })));
    const tunes = D.TUNES.filter(t => t.region === r.id);
    if (tunes.length) view.append(h('div', { class: 'card' }, h('h3', { text: 'Grooves to jam over' }), h('div', { class: 'chips' }, tunes.map(t => h('button', { class: 'chip', onclick: () => openTool('repertoire', { params: { tune: t.id }, returnTab: 'atlas' }) }, t.name)))));
    view.append(h('div', { class: 'card' }, h('h3', { text: 'On guitar' }), h('ul', { class: 'list' }, r.guitar.map(c => h('li', { text: c })))));
    view.append(h('div', { class: 'card' }, h('h3', { text: 'Instruments' }), h('div', { class: 'chips' }, r.instruments.map(c => h('span', { class: 'chip', text: c })))));
    view.append(h('div', { class: 'card' }, h('h3', { text: 'Listen to' }), h('div', { class: 'chips' }, r.listen.map(a => h('a', { class: 'chip', href: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(a), target: '_blank', rel: 'noopener' }, a + ' ↗'))),
      h('p', { class: 'small muted', text: 'Each link opens a YouTube search in a new tab.' })));
  }

  /* ======================================================
     PAGES
     ====================================================== */
  function toolTile(id, extra) {
    const t = TOOLS[id];
    const m = t.skill ? Math.round(E.mastery(t.skill)) : null;
    return h('button', { class: 'tile', onclick: () => openTool(id, extra || {}) }, h('span', { class: 't-title', text: t.title }), h('span', { class: 't-desc', text: t.desc }), h('span', { class: 't-meter', text: m !== null ? m + '%' : '' }));
  }
  const PAGES = {
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
      view.append(danger);
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
  };

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

  /* ---------- plugins (e.g. Transcribe) ---------- */
  const UI = { h, s, tool, openTool, go, Fretboard, positionsOfPc, toast, bar, noteName, TOOLS, PAGES, TABS, ICONS, renderTabs, get ui() { return ui; } };
  (window.WW_PLUGINS || []).forEach(fn => { try { fn(UI); } catch (e) { console.error(e); } });

  /* ---------- boot ---------- */
  E.init();
  syncEl.textContent = E.storageNote();
  const startTab = (location.hash || '').replace('#', '');
  go(TABS.some(t => t[0] === startTab) ? startTab : 'today');
})();
