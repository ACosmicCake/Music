# Music

## World Woodshed

A practice app for guitar, ear training, rhythm and world music, with a planner that tests you, tracks every skill and builds a daily routine. It lives in [`world-woodshed/`](world-woodshed/).

It is an installable web app: it works offline on phone and computer, gets its own icon and window, and updates itself when a new version is published.

### Use it

Every push to `main` builds the app and publishes it to GitHub Pages (see `.github/workflows/deploy.yml`). Open the Pages link, then:

- **iPhone or iPad (Safari):** Share → Add to Home Screen.
- **Android (Chrome):** tap Install when the banner appears, or menu → Install app.
- **Mac, Windows or Linux (Chrome or Edge):** click the install icon in the address bar, or the Install banner in the app.

Progress is saved on the device (localStorage, with a second copy in IndexedDB). To move it to another device, use **Backup → Export** on the Today tab and **Import** the file on the other device.

### Work on it

You need Node 20 or newer.

```sh
cd world-woodshed
npm install
npm run dev       # dev server at http://localhost:5173, reloads as you edit
npm run build     # production build in dist/
npm run preview   # serve the build, including the offline service worker
```

Code map:

| Path | What it is |
| --- | --- |
| `index.html` | Page shell |
| `src/main.js` | Entry point: loads styles, tools, pages and plugins, then boots |
| `src/styles.css` | All CSS, with design tokens on `:root` and dark mode |
| `src/data.js` | Content: intervals, chords, scales, rhythms, tunes, regions |
| `src/audio.js` | Web Audio synthesis and the loop scheduler |
| `src/engine.js` | Skill model, spaced repetition, routines, saving and backup |
| `src/ui/core.js` | DOM helpers, tabs and routing, tool runner, quiz, fretboard |
| `src/tools/*.js` | One file per area: ear, rhythm, play, atlas, transcribe |
| `src/pages.js` | The tab pages (Today, Ear, Rhythm, Play, Atlas) |
| `src/pwa.js` | Offline cache, update prompt and install button |
| `src/stretch.js`, `src/stretch.worker.js` | Time-stretch and pitch shift for Transcribe |
| `public/icons/` | App icons. Edit `icon.svg`, then run `npm run icons` |

To add a trainer, call `tool('my-id', { title, desc, skill, render(body, ctx) { … } })` in one of the `src/tools/` files and add a `toolTile('my-id')` to its page in `src/pages.js`.
