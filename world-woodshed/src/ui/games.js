/* World Woodshed — game mode's shared pieces: the high-score table and the end-of-run card.
   The scores are personal: kept in state.games (src/games.js) and synced to your other devices with the rest
   of your progress, never sent anywhere else. */
import E from '../engine.js';
import { h } from './core.js';

export const GAMES = {
  tower: { title: 'The Tower', tool: 'tower' },
  tightrope: { title: 'Tightrope', tool: 'tightrope' },
  twodrums: { title: 'Two Drums', tool: 'twodrums' },
  parrot: { title: 'Parrot', tool: 'parrot' },
  lighthouse: { title: 'Lighthouse Keeper', tool: 'lighthouse' },
  firefly: { title: 'Firefly Hunt', tool: 'firefly' },
  formgame: { title: 'Lost in the Form', tool: 'formgame' },
  opening: { title: 'Opening Night', tool: 'opening' }
};

const when = t => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: new Date(t).getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });

/* The table for one game. detail(entry) gives the second line (the exercise, the tower reached);
   mark is the time of a score just set, to light it up. */
export function Leaderboard(id, { detail, mark } = {}) {
  const list = E.gameScores(id), dev = E.device();
  const el = h('div', { class: 'card game-board' }, h('h3', { text: 'Your high scores' }));
  if (!list.length) { el.append(h('p', { class: 'small muted', text: 'No scores yet. Play a round to set the first one.' })); return el; }
  const row = (e, i) => {
    const info = [detail ? detail(e) : '', when(e.t), e.d && e.d !== dev ? 'another device' : ''].filter(Boolean).join(' · ');
    return h('li', { class: e.t === mark ? 'new' : '' }, h('span', { class: 'gs-rank mono', text: String(i + 1) }),
      h('span', { class: 'gs-what' }, h('b', { class: 'mono', text: e.s.toLocaleString() }), h('span', { class: 'small muted', text: info })));
  };
  el.append(h('ol', { class: 'game-scores' }, list.map(row)),
    h('p', { class: 'small muted', text: 'Your own scores, kept with your progress and synced to your other devices.' }));
  return el;
}

/* The card after a run: the score, where it placed, and the buttons to go again */
export function endCard({ title, score, rank, lines = [], again, extra }) {
  return h('div', { class: 'card game-end' + (rank === 1 ? ' best' : '') },
    h('span', { class: 'eyebrow', text: rank === 1 ? 'New high score!' : rank ? 'Number ' + rank + ' on your table' : 'Run over' }),
    h('h2', { text: title }),
    h('div', { class: 'game-big mono', text: score.toLocaleString() }),
    lines.map(l => h('p', { class: 'small', text: l })),
    h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: again }, 'Play again'), extra || ''));
}

/* How a game is played, the same on every game's first screen: what you do, how it scores, when the run ends.
   goal: one sentence, always shown; steps, scoring: lists of sentences; ends: one sentence. The rules are open
   until you have a score in that game (game: its id), then folded under one line so Play is near the top. */
export function HowTo({ game, goal, steps = [], scoring = [], ends, note }) {
  const sec = (title, items) => (items.length ? [h('h4', { text: title }), h('ul', { class: 'game-how-list' }, items.map(t => h('li', { text: t })))] : []);
  const rules = h('details', { class: 'game-rules', open: game && E.gameScores(game).length ? null : true },
    h('summary', { text: 'How to play and how it scores' }),
    sec('How to play', steps), sec('Scoring', scoring),
    ends ? h('p', { class: 'small game-ends' }, h('b', { text: 'The run ends ' }), ends) : '',
    note ? h('p', { class: 'small muted', text: note }) : '');
  return h('div', { class: 'game-how' }, goal ? h('p', { class: 'game-goal', text: goal }) : '', rules);
}

/* Your best on a Games tile */
export const bestLine = id => { const b = E.gameScores(id)[0]; return b ? 'Best ' + b.s.toLocaleString() : 'new'; };
