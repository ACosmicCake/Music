# Notes for agents

The app is in `world-woodshed/`, a Vite project with plain JavaScript ES modules and no framework. It is an installable PWA (vite-plugin-pwa) deployed to GitHub Pages by `.github/workflows/deploy.yml`.

Run `npm install` then `npm run dev` (or `npm run build && npm run preview` to test the service worker) inside `world-woodshed/`, and drive it with Playwright to check a change. No tests yet.

## Files

`src/main.js` imports everything in order and boots the app:

- `index.html`: page shell only.
- `src/styles.css`: all CSS (design tokens on `:root`, dark mode via `prefers-color-scheme` and `data-theme`). Fonts are bundled from `@fontsource` so the app works offline.
- `src/data.js`: content. Intervals and anchor songs, chords, progressions, world scales and ragas/maqamat, rhythm cycles, jazz standards, grooves, technique exercises, atlas regions.
- `src/audio.js`: Web Audio synthesis (Karplus-Strong guitar, percussion voices, look-ahead `Loop` scheduler, tanpura `Drone`).
- `src/engine.js`: skill model, spaced repetition, mastery and level unlocks, placement test, routine builder, persistence, backup export/import.
- `src/ui/core.js`: UI helpers (`h`, `s`, `Fretboard`, `toast`, `Quiz`), tabs and routing, the tool registry (`tool`, `openTool`), routine runner. `PAGES` lives here and is filled in by `src/pages.js`.
- `src/tools/ear.js`, `rhythm.js`, `play.js`, `atlas.js`: trainers, registered with `tool(id, def)`.
- `src/tools/transcribe.js`: the Transcribe tab, a plugin that receives the `UI` object.
- `src/pages.js`: tab pages and the Today dashboard.
- `src/stretch.js` (WSOLA time-stretch and pitch shift) and `src/stretch.worker.js` (runs it in a module Worker).
- `src/pwa.js`: service worker registration, update banner, install banner.

## Conventions

- No frameworks and no runtime requests to other sites; everything is bundled so it works offline.
- New tabs or tools can be added as a plugin: export a function that takes the `UI` object and add it to the list in `src/main.js` (pushing onto `window.WW_PLUGINS` still works too).
- Persistence: `engine.js` saves state to `localStorage` and a copy in IndexedDB, and asks for persistent storage. When `window.claude` exists (inside a claude.ai Artifact with the `db` and `user` capabilities), it also syncs to the private database. Keep that guard.
- Transcribe stores loaded audio in IndexedDB on the device only; song setups save with the rest of the state.
- No microphone input: answers are given by tapping.
