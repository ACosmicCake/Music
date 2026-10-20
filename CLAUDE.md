# Notes for agents

The app is in `world-woodshed/`. No build step, no package manager, no tests yet. Serve the folder with `python3 -m http.server` and drive it with Playwright to check a change.

## Files

Scripts load in this order from `index.html`, each attaching one global to `window`:

- `index.html`: page shell and all CSS (design tokens on `:root`, dark mode via `prefers-color-scheme` and `data-theme`).
- `data.js` → `WW_DATA`: content. Intervals and anchor songs, chords, progressions, world scales and ragas/maqamat, rhythm cycles, jazz standards, grooves, technique exercises, atlas regions.
- `audio.js` → `WW_AUDIO`: Web Audio synthesis (Karplus-Strong guitar, percussion voices, look-ahead `Loop` scheduler, tanpura `Drone`).
- `engine.js` → `WW_ENGINE`: skill model, spaced repetition, mastery and level unlocks, placement test, routine builder, persistence.
- `stretch.js` → `WW_STRETCH`: WSOLA time-stretch and pitch shift. Also runs as a Web Worker.
- `transcribe.js`: the Transcribe tab, registered as a plugin through `window.WW_PLUGINS`.
- `app.js`: UI helpers (`h`, `Fretboard`, `toast`), tabs, every trainer screen, routine runner and dashboard. Runs plugins at the end.

## Conventions

- No frameworks or external scripts. Only Google Fonts are loaded from outside.
- New tabs or tools can be added as a plugin: push a function onto `window.WW_PLUGINS`; it receives the `UI` object from `app.js`.
- Persistence: `engine.js` saves state to `localStorage` and, when `window.claude` exists (inside a claude.ai Artifact with the `db` and `user` capabilities), also to the private database. Keep that guard so the app works standalone.
- Transcribe stores loaded audio in IndexedDB on the device only; song setups save with the rest of the state.
- No microphone input: answers are given by tapping.
