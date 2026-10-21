# Notes for agents

The app is in `world-woodshed/`, a Vite project with plain JavaScript ES modules and no framework. It is an installable PWA (vite-plugin-pwa) deployed to GitHub Pages by `.github/workflows/deploy.yml`.

Run `npm install` then `npm run dev` (or `npm run build && npm run preview` to test the service worker) inside `world-woodshed/`, and drive it with Playwright to check a change. No tests yet.

## Files

`src/main.js` imports everything in order and boots the app:

- `index.html`: page shell only.
- `src/styles.css`: all CSS (design tokens on `:root`, dark mode via `prefers-color-scheme` and `data-theme`). Fonts are bundled from `@fontsource` so the app works offline.
- `src/data.js`: content. Intervals and anchor songs, chords, progressions, world scales and ragas/maqamat, rhythm cycles, tunes, grooves, technique exercises, styles (atlas regions). It merges in `src/content/`.
- `src/content/`: long-form content. `styles-a.js`, `styles-b.js` (deep-dive fields for the original regions: history, sub-styles, how it works, listening path, players, study, practice) and `styles-new.js` (eight whole new styles); `lessons.js` (the theory course). Keep recordings, years and books accurate.
- `src/theory.js`: chord-symbol parsing, note spelling, diatonic chords.
- `src/routines.js`: routine block types (`BLOCKS`), templates, time fitting (`setTotal`, auto breaks), no-guitar swaps (`awayBlocks`).
- `src/audio.js`: Web Audio synthesis (Karplus-Strong guitar, percussion voices, look-ahead `Loop` scheduler, tanpura `Drone`).
- `src/engine.js`: skill model, spaced repetition, mastery and level unlocks, placement test, the adaptive (smart) plan, custom routines, the running session, lessons done, recordings heard, practice journal, persistence, backup export/import.
- `src/ui/core.js`: UI helpers (`h`, `s`, `Fretboard`, `toast`, `Quiz`), tabs and routing (old `#ear`, `#rhythm`, `#play`, `#atlas` links are aliases), the tool registry (`tool`, `openTool`), placement runner. `PAGES` lives here and is filled in by the page modules; `hooks` lets `session.js` plug in without import cycles.
- `src/ui/session.js`: the practice session runner: wall-clock timer that keeps counting with the screen off, session bar on each tool, time-up chime and auto-advance, wake lock, finish screen and journal.
- `src/ui/routine.js`: the Routine tab (routine editor with drag reorder, durations, templates, smart plan, session overview).
- `src/tools/ear.js`, `rhythm.js`, `play.js`, `atlas.js`: trainers, registered with `tool(id, def)`.
- `src/tools/practice.js`: scale warm-up, chord & scale explorer, circle of fifths, reference tones, free practice, break, no-guitar drills.
- `src/tools/learn.js`: the Learn tab (style library and style pages, theory course and lesson reader, reference) and the `listening` and `lesson` tools.
- `src/tools/transcribe.js`: the Transcribe tab, a plugin that receives the `UI` object.
- `src/pages.js`: the Today dashboard and the Train page.
- `src/stretch.js` (phase-vocoder time-stretch with phase locking, transient resets and shared stereo phase; windowed-sinc resampler for pitch shift) and `src/stretch.worker.js` (runs it in a module Worker).
- `src/pwa.js`: service worker registration, update banner, install banner.

## Conventions

- No frameworks and no runtime requests to other sites; everything is bundled so it works offline.
- New tabs or tools can be added as a plugin: export a function that takes the `UI` object and add it to the list in `src/main.js` (pushing onto `window.WW_PLUGINS` still works too).
- Persistence: `engine.js` saves state to `localStorage` and a copy in IndexedDB, and asks for persistent storage. When `window.claude` exists (inside a claude.ai Artifact with the `db` and `user` capabilities), it also syncs to the private database. Keep that guard.
- Transcribe stores loaded audio in IndexedDB on the device only; song setups save with the rest of the state.
- No microphone input: answers are given by tapping.
