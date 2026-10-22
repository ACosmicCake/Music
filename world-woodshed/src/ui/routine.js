/* World Woodshed — Routine tab: build, edit and start custom practice routines */
import D from '../data.js';
import E from '../engine.js';
import { view, h, toast, go, PAGES, hooks, ui } from './core.js';
import { BLOCKS, BLOCK_ORDER, CATS, PATTERNS, DRILLS, TEMPLATES, awayBlocks, needsGuitar, warmScales, describe, blockTitle, newBlock, fromTemplate, setTotal, syncWeights, totalOf, fmtMin, fmtClock, placeBreaks } from '../routines.js';
import { startSession, runCurrent, jump, finishScreen, discardSession, togglePause, autoAdvanceToggle } from './session.js';
import { smartPlanner, learningPrefsCard } from './smart.js';

const PRESETS = [15, 30, 45, 60, 90, 120, 180, 240];
const clone = o => JSON.parse(JSON.stringify(o));

/* Colour ribbon: one segment per block, width by minutes */
export function ribbon(blocks, opts = {}) {
  const total = totalOf(blocks) || 1;
  const wrap = h('div', { class: 'ribbon-wrap' });
  const rb = h('div', { class: 'ribbon' + (opts.small ? ' small' : ''), role: 'img', 'aria-label': blocks.map(b => blockTitle(b) + ' ' + b.minutes + ' minutes').join(', ') });
  blocks.forEach((b, i) => {
    const seg = h('span', { class: 'rseg cat-' + BLOCKS[b.type].cat + (opts.state ? ' ' + opts.state(b, i) : ''), style: { flexGrow: String(b.minutes) }, title: blockTitle(b) + ' · ' + fmtMin(b.minutes) });
    if (opts.onClick) seg.addEventListener('click', () => opts.onClick(b, i));
    rb.append(seg);
  });
  wrap.append(rb);
  if (!opts.small) {
    const axis = h('div', { class: 'raxis mono' });
    axis.append(h('span', { text: '0' }), h('span', { text: fmtMin(total / 2) }), h('span', { text: fmtMin(total) }));
    wrap.append(axis);
  }
  return wrap;
}
function legend(blocks) {
  const cats = [...new Set(blocks.map(b => BLOCKS[b.type].cat))];
  return h('div', { class: 'legend' }, cats.map(c => {
    const m = totalOf(blocks.filter(b => BLOCKS[b.type].cat === c));
    return h('span', { class: 'lg cat-' + c }, h('i'), CATS[c].name + ' ' + fmtMin(m));
  }));
}

PAGES.routine = function () {
  const active = E.activeRoutineId();
  view.append(h('div', { class: 'pagehead' }, h('span', { class: 'eyebrow', text: 'Routine' }), h('h1', { text: 'Plan your practice' }),
    h('p', { class: 'muted', text: 'Smart practice chooses what to work on for the time you have. Or build your own routine: line up blocks and the smart plan fills them with the right scale, technique, rhythm and tune each time. The timer keeps going while you play and chimes when a block is over.' })));
  if (E.session()) view.append(sessionCard());
  view.append(picker(active));
  if (active === 'smart') view.append(smartPlanner(), learningPrefsCard());
  else view.append(editor(E.getRoutine(active)));
  view.append(templatesCard());
};

/* ---------- live session overview ---------- */
function sessionCard() {
  const s = E.session();
  const card = h('div', { class: 'card session-card' });
  const status = h('span', { class: 'mono small' });
  const list = h('div', { class: 'stack' });
  function paint() {
    if (!card.isConnected && card.dataset.drawn) return;
    const st = E.session(); if (!st) { card.remove(); return; }
    const el = st.blocks.reduce((a, b) => a + (b.elapsed || 0), 0) / 1000;
    status.textContent = fmtClock(el) + ' of ' + fmtMin(totalOf(st.blocks)) + (st.paused ? ' · paused' : '');
    list.querySelectorAll('[data-i]').forEach(row => {
      const b = st.blocks[+row.dataset.i];
      row.querySelector('.t').textContent = b.done ? '✓ ' + fmtClock(b.elapsed / 1000) : b.swapped ? 'swapped' : b.skipped ? 'skipped' : +row.dataset.i === st.idx ? fmtClock(Math.max(0, b.minutes * 60 - b.elapsed / 1000)) + ' left' : fmtMin(b.minutes);
    });
  }
  s.blocks.forEach((b, i) => list.append(h('button', { class: 'srow cat-' + BLOCKS[b.type].cat + (i === s.idx ? ' now' : '') + (b.done ? ' done' : ''), 'data-i': i, onclick: () => jump(i) },
    h('span', { class: 'dot' }), h('span', { class: 'n', text: blockTitle(b) }), h('span', { class: 't mono small' }))));
  card.append(
    h('div', { class: 'spread' }, h('div', { class: 'stack', style: { gap: '2px' } }, h('span', { class: 'eyebrow', text: 'Session in progress' }), h('h2', { text: s.name })), status),
    ribbon(s.blocks, { small: true, state: (b, i) => (b.done ? 'done' : '') + (i === s.idx ? ' now' : ''), onClick: (b, i) => jump(i) }),
    list,
    h('div', { class: 'row' },
      h('button', { class: 'btn brass', onclick: () => runCurrent() }, '▶ Back to ' + blockTitle(s.blocks[s.idx] || s.blocks[0])),
      h('button', { class: 'btn', onclick: () => { togglePause(); go('routine'); } }, s.paused ? 'Resume timer' : 'Pause timer'),
      h('button', { class: 'btn ghost', onclick: () => finishScreen() }, 'Finish now'),
      h('button', { class: 'btn ghost small', onclick: () => {
        const c = h('div', { class: 'confirm' }, h('b', { text: 'Discard this session?' }), h('span', { class: 'small', text: 'Time already practised still counts in your stats.' }),
          h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => c.remove() }, 'Keep it'), h('button', { class: 'btn small danger', onclick: () => { discardSession(); go('routine'); } }, 'Discard')));
        card.append(c);
      } }, 'Discard')));
  card.dataset.drawn = '1';
  paint();
  hooks.onSessionTick = paint;
  return card;
}

/* ---------- routine picker ---------- */
function picker(active) {
  const row = h('div', { class: 'rpicker', role: 'tablist', 'aria-label': 'Routines' });
  row.append(h('button', { class: 'rpick smart', role: 'tab', 'aria-selected': active === 'smart' ? 'true' : 'false', onclick: () => { E.setActiveRoutine('smart'); go('routine'); } },
    h('b', { text: 'Smart practice' }), h('span', { class: 'small', text: 'Chooses what to practise for the time you have' })));
  E.routines().forEach(r => row.append(h('button', { class: 'rpick', role: 'tab', 'aria-selected': r.id === active ? 'true' : 'false', onclick: () => { E.setActiveRoutine(r.id); go('routine'); } },
    h('b', { text: r.name }), h('span', { class: 'mono small', text: fmtMin(totalOf(r.blocks)) }), ribbon(r.blocks, { small: true }))));
  row.append(h('button', { class: 'rpick add', onclick: () => {
    const r = { id: E.uid('r'), name: 'New routine', breaks: false, blocks: [newBlock('scalewarm'), newBlock('rhythms'), newBlock('repertoire')] };
    syncWeights(r); E.saveRoutine(r); E.setActiveRoutine(r.id); go('routine');
  } }, h('b', { text: '+ New routine' }), h('span', { class: 'small', text: 'Start empty-ish' })));
  return row;
}

/* ---------- editor ---------- */
function editor(stored) {
  const r = clone(stored);
  const wrap = h('div', { class: 'stack editor' });
  let openId = null;
  const commit = () => { E.saveRoutine(r); };
  function draw() {
    wrap.innerHTML = '';
    const total = totalOf(r.blocks);
    // hero: name, total, presets, start
    const name = h('input', { class: 'titleinput', type: 'text', value: r.name, 'aria-label': 'Routine name', maxlength: 60 });
    name.addEventListener('change', () => { r.name = name.value.trim() || 'My routine'; commit(); });
    const presets = h('div', { class: 'chips presets' }, PRESETS.map(m => h('button', { class: 'chip', 'aria-pressed': m === total ? 'true' : 'false', onclick: () => { setTotal(r, m); commit(); draw(); } }, fmtMin(m).replace(' min', 'm').replace(' h', 'h'))));
    const step = d => { setTotal(r, Math.max(5, total + d)); commit(); draw(); };
    wrap.append(h('div', { class: 'hero routine-hero' },
      h('div', { class: 'spread' }, name, h('div', { class: 'row' },
        h('button', { class: 'btn small ghost', onclick: () => { const c = clone(r); c.id = E.uid('r'); c.name = r.name + ' (copy)'; E.saveRoutine(c); E.setActiveRoutine(c.id); go('routine'); toast('Copied'); } }, 'Duplicate'),
        h('button', { class: 'btn small ghost', onclick: () => {
          const c = h('div', { class: 'confirm' }, h('b', { text: 'Delete "' + r.name + '"?' }),
            h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => c.remove() }, 'Keep it'), h('button', { class: 'btn small danger', onclick: () => { E.deleteRoutine(r.id); go('routine'); } }, 'Delete')));
          wrap.firstChild.append(c);
        } }, 'Delete'))),
      h('div', { class: 'duration' },
        h('button', { class: 'btn round', 'aria-label': 'Five minutes less', onclick: () => step(-5) }, '−'),
        h('div', { class: 'dur-big' }, h('b', { class: 'mono', text: fmtMin(total) }), h('span', { class: 'small muted', text: r.blocks.length + ' blocks · total time' })),
        h('button', { class: 'btn round', 'aria-label': 'Five minutes more', onclick: () => step(5) }, '+')),
      presets,
      ribbon(r.blocks, { onClick: b => { openId = b.id; draw(); const el = wrap.querySelector('[data-id="' + b.id + '"]'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }),
      legend(r.blocks),
      h('div', { class: 'row' },
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: r.breaks ? true : null, onchange: e => { r.breaks = e.target.checked; setTotal(r, total); commit(); draw(); } }), '5-minute breaks about every hour'),
        autoAdvanceToggle()),
      h('button', { class: 'btn brass big start', onclick: () => { commit(); startSession(r); } }, E.session() ? '▶ Start over with this routine' : '▶ Start session · ' + fmtMin(total)),
      awayButton(r)));

    // blocks
    const list = h('ol', { class: 'blocks' });
    r.blocks.forEach((b, i) => list.append(blockRow(b, i)));
    wrap.append(h('div', { class: 'card' },
      h('div', { class: 'spread' }, h('h2', { text: 'Blocks' }), h('span', { class: 'small muted', text: 'Drag ⋮⋮ to reorder · tap a block to change it' })),
      list,
      h('button', { class: 'btn addblock', onclick: () => addSheet() }, '+ Add a block')));
  }

  function blockRow(b, i) {
    const def = BLOCKS[b.type];
    const isOpen = openId === b.id;
    const handle = h('span', { class: 'handle', 'aria-hidden': 'true', title: 'Drag to reorder' }, '⋮⋮');
    const mins = h('div', { class: 'mins' },
      h('button', { class: 'mbtn', 'aria-label': 'Less time', onclick: e => { e.stopPropagation(); b.minutes = Math.max(1, b.minutes - (b.minutes > 10 ? 5 : 1)); syncWeights(r); commit(); draw(); } }, '−'),
      h('span', { class: 'mono', text: b.minutes + 'm' }),
      h('button', { class: 'mbtn', 'aria-label': 'More time', onclick: e => { e.stopPropagation(); b.minutes = Math.min(240, b.minutes + (b.minutes >= 10 ? 5 : 1)); syncWeights(r); commit(); draw(); } }, '+'));
    const row = h('li', { class: 'brow cat-' + def.cat + (isOpen ? ' open' : ''), 'data-id': b.id },
      h('div', { class: 'bmain' }, handle,
        h('span', { class: 'bicon', 'aria-hidden': 'true' }),
        h('button', { class: 'btext', 'aria-expanded': isOpen ? 'true' : 'false', onclick: () => { openId = isOpen ? null : b.id; draw(); } },
          h('b', { text: blockTitle(b) }), h('span', { class: 'small muted', text: describe(b) })),
        mins));
    if (isOpen) row.append(settingsPanel(b, i));
    dragify(handle, row);
    return row;
  }

  function settingsPanel(b, i) {
    const def = BLOCKS[b.type];
    const set = (k, v) => { b.settings = b.settings || {}; if (v === '' || v === 'auto') delete b.settings[k]; else b.settings[k] = v; commit(); };
    const redraw = () => draw();
    const smartScale = b.type === 'scalewarm' && (!b.settings || !b.settings.scale || b.settings.scale === 'auto');
    const fields = def.fields.filter(f => !(smartScale && ['tonic', 'pattern', 'bpm'].includes(f))).map(f => field(f, b, set, redraw)).filter(Boolean);
    return h('div', { class: 'bpanel' },
      h('p', { class: 'small muted', text: def.desc }),
      fields.length ? h('div', { class: 'formgrid' }, fields) : null,
      h('div', { class: 'row' },
        h('button', { class: 'btn small', disabled: i === 0 ? true : null, onclick: () => { move(i, i - 1); } }, '↑ Up'),
        h('button', { class: 'btn small', disabled: i === r.blocks.length - 1 ? true : null, onclick: () => { move(i, i + 1); } }, '↓ Down'),
        h('button', { class: 'btn small ghost', onclick: () => { const c = clone(b); c.id = E.uid('b'); delete c.auto; r.blocks.splice(i + 1, 0, c); syncWeights(r); commit(); openId = c.id; draw(); } }, 'Duplicate'),
        h('button', { class: 'btn small ghost danger', onclick: () => { r.blocks.splice(i, 1); syncWeights(r); commit(); openId = null; draw(); } }, 'Remove'),
        h('button', { class: 'btn small primary', onclick: () => { commit(); startSession(Object.assign(clone(r), { name: r.name, blocks: r.blocks.slice(i) })); } }, '▶ Start from here')));
  }
  function move(from, to) {
    const [b] = r.blocks.splice(from, 1); r.blocks.splice(to, 0, b);
    if (r.breaks) r.blocks = placeBreaks(r.blocks, true);
    commit(); draw();
  }
  // Pointer-based drag (works with touch); rows swap live as you pass their middle
  function dragify(handle, row) {
    handle.addEventListener('pointerdown', e => {
      e.preventDefault();
      const list = row.parentElement;
      let startY = e.clientY;
      row.classList.add('dragging');
      try { handle.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      const moveFn = ev => {
        let dy = ev.clientY - startY;
        const next = row.nextElementSibling, prev = row.previousElementSibling;
        if (next && dy > next.offsetHeight / 2) { list.insertBefore(next, row); startY += next.offsetHeight; dy = ev.clientY - startY; }
        else if (prev && dy < -prev.offsetHeight / 2) { list.insertBefore(row, prev); startY -= prev.offsetHeight; dy = ev.clientY - startY; }
        row.style.transform = 'translateY(' + dy + 'px)';
      };
      const up = () => {
        handle.removeEventListener('pointermove', moveFn); handle.removeEventListener('pointerup', up); handle.removeEventListener('pointercancel', up);
        row.style.transform = ''; row.classList.remove('dragging');
        const order = [...list.children].map(el => el.dataset.id);
        r.blocks.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
        if (r.breaks) r.blocks = placeBreaks(r.blocks, true);
        commit(); draw();
      };
      handle.addEventListener('pointermove', moveFn); handle.addEventListener('pointerup', up); handle.addEventListener('pointercancel', up);
    });
  }

  function addSheet() {
    const close = () => sheet.remove();
    const groups = Object.keys(CATS).map(c => {
      const types = BLOCK_ORDER.filter(t => BLOCKS[t].cat === c);
      return h('div', { class: 'stack' }, h('span', { class: 'eyebrow', text: CATS[c].name }),
        h('div', { class: 'typegrid' }, types.map(t => h('button', { class: 'typecard cat-' + c, onclick: () => {
          const b = newBlock(t);
          r.blocks.push(b); syncWeights(r); commit(); openId = b.id; close(); draw();
          const el = wrap.querySelector('[data-id="' + b.id + '"]'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } }, h('span', { class: 'bicon', 'aria-hidden': 'true' }), h('b', { text: BLOCKS[t].name }), h('span', { class: 'small muted', text: BLOCKS[t].desc })))));
    });
    const sheet = h('div', { class: 'sheet-back', onclick: e => { if (e.target === sheet) close(); } },
      h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Add a block' },
        h('div', { class: 'spread' }, h('h2', { text: 'Add a block' }), h('button', { class: 'btn small ghost', onclick: close }, 'Close')),
        groups));
    document.body.append(sheet);
    const esc = e => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } };
    document.addEventListener('keydown', esc);
  }
  draw();
  return wrap;
}

/* Run any routine without the instrument: guitar-only blocks become no-guitar drills of the same length */
export function awayButton(r, cls) {
  const n = r.blocks.filter(needsGuitar).length;
  return h('button', { class: cls || 'btn ghost start', title: n ? n + ' guitar-only blocks become no-guitar drills' : 'Every block works without the guitar', onclick: () => {
    E.saveRoutine(r);
    startSession({ id: r.id, name: r.name + ' · no guitar', blocks: awayBlocks(r.blocks) });
  } }, 'No guitar with me' + (n ? ' (swaps ' + n + ' block' + (n > 1 ? 's' : '') + ')' : ''));
}

/* One settings field for a block */
function field(f, b, set, redraw) {
  const st = b.settings || {};
  const id = 'f-' + b.id + '-' + f;
  const sel = (label, opts, value, onchange) => {
    const s = h('select', { id });
    opts.forEach(o => {
      if (o.group) { const g = h('optgroup', { label: o.group }); o.items.forEach(it => g.append(h('option', { value: it.value, selected: String(it.value) === String(value) ? true : null, text: it.text }))); s.append(g); }
      else s.append(h('option', { value: o.value, selected: String(o.value) === String(value) ? true : null, text: o.text }));
    });
    s.onchange = () => { onchange(s.value); redraw(); };
    return h('label', { class: 'stack field', for: id }, h('span', { class: 'eyebrow', text: label }), s);
  };
  const auto = text => ({ value: 'auto', text });
  switch (f) {
    case 'scale': {
      const list = b.type === 'scalewarm' ? warmScales() : D.SCALES;
      const opts = [auto(b.type === 'drone' ? 'From the style of the week' : 'Smart choice: rotates scale, key, pattern and tempo')].concat([1, 2, 3, 4, 5].map(t => ({ group: 'Level ' + t, items: list.filter(x => x.tier === t).map(x => ({ value: x.id, text: x.name })) })).filter(g => g.items.length));
      return sel('Scale', opts, st.scale || 'auto', v => set('scale', v));
    }
    case 'tonic': return sel('Key', D.NOTE_NAMES.map((n, i) => ({ value: String(i), text: n })), String(st.tonic ?? (b.type === 'drone' ? 2 : 0)), v => set('tonic', +v));
    case 'pattern': return sel('Pattern', Object.entries(PATTERNS).map(([k, v]) => ({ value: k, text: v })), st.pattern || 'updown', v => set('pattern', v));
    case 'bpm': {
      const inp = h('input', { id, class: 'num', type: 'number', min: 30, max: 260, value: st.bpm || '', placeholder: b.type === 'scalewarm' ? '72' : 'none' });
      inp.onchange = () => { const v = +inp.value; set('bpm', v >= 30 ? Math.min(260, v) : ''); redraw(); };
      return h('label', { class: 'stack field', for: id }, h('span', { class: 'eyebrow', text: b.type === 'scalewarm' ? 'Start tempo (bpm)' : 'Click tempo (bpm)' }), inp);
    }
    case 'exercise': return sel('Exercise', [auto('Smart choice: rotates for you')].concat(D.EXERCISES.map(e => ({ value: e.id, text: e.name }))), st.exercise || 'auto', v => set('exercise', v));
    case 'rhythm': {
      const byRegion = {};
      D.RHYTHMS.forEach(x => { const rn = (D.REGIONS.find(r => r.id === x.region) || { name: 'Other' }).name; (byRegion[rn] = byRegion[rn] || []).push({ value: x.id, text: x.name }); });
      return sel('Rhythm', [auto('Smart choice: rotates for you')].concat(Object.entries(byRegion).map(([g, items]) => ({ group: g, items }))), st.rhythm || 'auto', v => set('rhythm', v));
    }
    case 'tune': {
      const groups = [...new Set(D.TUNES.map(t => t.group))].map(g => ({ group: g, items: D.TUNES.filter(t => t.group === g).map(t => ({ value: t.id, text: t.name })) }));
      const mine = E.listTunes();
      if (mine.length) groups.unshift({ group: 'Your tunes', items: mine.map(t => ({ value: t.id, text: t.name })) });
      return sel('Tune', [auto('Smart choice: rotates for you')].concat(groups), st.tune || 'auto', v => set('tune', v));
    }
    case 'song': {
      const songs = E.listSongs();
      return sel('Song', [auto(songs.length ? 'Most recent song' : 'Load a song in Transcribe first')].concat(songs.map(sg => ({ value: sg.id, text: sg.title }))), st.song || 'auto', v => set('song', v));
    }
    case 'lesson': return sel('Lesson', [auto('Smart choice: new lessons and reviews')].concat(['Foundations', 'Intermediate', 'Advanced'].map(lv => ({ group: lv, items: D.LESSONS.filter(l => l.level === lv).map(l => ({ value: l.id, text: l.title })) }))), st.lesson || 'auto', v => set('lesson', v));
    case 'drill': {
      // two block types share this field: a no-guitar drill, or a style drill
      if (b.type === 'away') return sel('Drill', [auto('A different one each time')].concat(Object.entries(DRILLS).map(([k, v]) => ({ value: k, text: v }))), st.drill || 'auto', v => set('drill', v));
      const groups = D.REGIONS.map(r => ({ group: r.name, items: (D.DRILLS || []).filter(d => d.style === r.id).map(d => ({ value: d.id, text: d.name })) })).filter(g => g.items.length);
      return sel('Drill', [auto('Smart choice: from the styles you put first')].concat(groups), st.drill || 'auto', v => set('drill', v));
    }
    case 'style': return sel('Style', [auto('Style of the week')].concat(D.REGIONS.map(r => ({ value: r.id, text: r.name }))), st.style || 'auto', v => set('style', v));
    case 'title': {
      const inp = h('input', { id, type: 'text', value: st.title || '', placeholder: 'e.g. Recuerdos, Blackbird, my solo' });
      inp.onchange = () => { set('title', inp.value.trim()); redraw(); };
      return h('label', { class: 'stack field', for: id }, h('span', { class: 'eyebrow', text: 'Title' }), inp);
    }
    case 'notes': {
      const ta = h('textarea', { id, rows: 2, placeholder: 'Goal for this block, bars to fix, tempo to reach…' }); ta.value = st.notes || '';
      ta.onchange = () => { set('notes', ta.value.trim()); redraw(); };
      return h('label', { class: 'stack field wide', for: id }, h('span', { class: 'eyebrow', text: 'Notes' }), ta);
    }
  }
  return null;
}

/* ---------- templates ---------- */
function templatesCard() {
  return h('div', { class: 'stack' },
    h('span', { class: 'eyebrow', text: 'Start from a template' }),
    h('div', { class: 'tplgrid' }, TEMPLATES.map(t => {
      const preview = fromTemplate(t, t.minutes);
      return h('button', { class: 'tplcard', onclick: () => { const r = fromTemplate(t, t.minutes); E.saveRoutine(r); E.setActiveRoutine(r.id); go('routine'); window.scrollTo(0, 0); toast(t.name + ' added. Change the length and blocks to fit your day.'); } },
        h('div', { class: 'spread' }, h('b', { text: t.name }), h('span', { class: 'mono small muted', text: fmtMin(t.minutes) })),
        h('span', { class: 'small muted', text: t.desc }),
        ribbon(preview.blocks, { small: true }));
    })));
}
