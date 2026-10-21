# Music

## World Woodshed

A practice app for guitar, ear training, rhythm and world music, with a planner that tests you, tracks every skill and builds a daily routine. It lives in [`world-woodshed/`](world-woodshed/).

It is an installable web app: it works offline on phone and computer, gets its own icon and window, and updates itself when a new version is published.

### Start it on your computer with one click

1. Install [Node.js](https://nodejs.org/en/download) (the LTS version) once.
2. Get this repository: `git clone`, or on GitHub click **Code → Download ZIP** and unzip it.
3. Double-click the launcher for your system in the top folder:
   - **Windows:** `Start World Woodshed (Windows).bat`
   - **Mac:** `Start World Woodshed (Mac).command` (the first time, right-click it → **Open** → **Open**, because macOS blocks unknown scripts)
   - **Linux:** `start-world-woodshed.sh`

The first start installs what the app needs (about a minute, internet needed once). After that it opens in your browser within seconds, offline too. Keep the small terminal window open while you practise; close it to stop.

### Use it online

Every push to `main` builds the app and publishes it to GitHub Pages (see `.github/workflows/deploy.yml`). Open the Pages link, then:

- **iPhone or iPad (Safari):** Share → Add to Home Screen.
- **Android (Chrome):** tap Install when the banner appears, or menu → Install app.
- **Mac, Windows or Linux (Chrome or Edge):** click the install icon in the address bar, or the Install banner in the app.

Smart practice plans each session for the time you have right now, whether it is your first session of the day or your third. It reviews what is due (spaced repetition), brings in new material slowly from the styles you rank first, and rotates scales, keys, patterns, techniques, rhythms and tunes for you. The research it follows is explained in the app. A Sight-reading module takes you from open strings to syncopation in 6/8 and fifth position across 16 levels.

With the microphone allowed, the app can hear your guitar: a real tuner, answering quizzes by playing, rhythm tests on the guitar, and live timing and right-note checks in warm-ups and technique ladders. The sound is analysed on the device and never recorded or sent. Wear headphones for timing tests so the mic hears only your guitar.

Progress is saved on the device (localStorage, with a second copy in IndexedDB). To carry it between devices, use **Today → Your progress on every device**: **Send my progress** on one device and **Load a sync file** on the other. Loading merges, so practice done on either device is kept.

### Android app (for commutes)

The same app is also packaged for Android (`world-woodshed/android`, Capacitor), built by `.github/workflows/android.yml`. Each build of `main` is published as a release: on the phone, open **Releases → latest** in this repository, tap `WorldWoodshed.apk`, and allow installs from your browser when Android asks. New versions install over the old one and keep your progress. Pull requests get the APK as a workflow artifact.

It opens with **On the go**: a smart session sized to your ride that needs only the phone (scale positions become seeing the neck in your head, call & response becomes dictation, tunes become following the form by ear), and hands-free ear training where a question plays, the answer is spoken, and you grade it by tapping either half of a dark screen. It works fully offline. Use the sync file above to keep it in step with the computer.

Builds are signed with the sideload key in `android/app` so updates install over each other. To sign with your own key instead, add the repository secrets `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` and `ANDROID_KEY_PASSWORD` (switching keys means uninstalling once, so sync your progress to a file first).

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
| `src/data.js` | Content: intervals, chords, scales, rhythms, tunes, styles; merges in `src/content/` |
| `src/content/` | Style deep-dives (history, listening paths, players, books) and the theory course |
| `src/routines.js` | Routine blocks, templates, time fitting and no-guitar swaps |
| `src/curriculum.js`, `src/ui/smart.js` | Smart practice: memory model, session planner, learning preferences |
| `src/notation.js`, `src/tools/reading.js` | Staff notation renderer and the sight-reading trainer |
| `src/audio.js` | Web Audio synthesis and the loop scheduler |
| `src/band.js` | The backing band for tunes: walking bass, piano comping, drums, mixer |
| `src/engine.js` | Skill model, spaced repetition, routines, saving and backup |
| `src/ui/core.js` | DOM helpers, tabs and routing, tool runner, quiz, fretboard |
| `src/ui/routine.js`, `src/ui/session.js` | Routine editor, and the session player with its timer |
| `src/tools/*.js` | One file per area: ear, rhythm, play, practice, learn, atlas, transcribe |
| `src/pages.js` | The Today and Train pages |
| `src/listen.js`, `src/ui/mic.js` | Microphone: pitch and onset detection, Listen toggle, timing meter |
| `src/pwa.js` | Offline cache, update prompt and install button |
| `src/stretch.js`, `src/stretch.worker.js` | Time-stretch and pitch shift for Transcribe |
| `public/icons/` | App icons. Edit `icon.svg`, then run `npm run icons` |

To add a trainer, call `tool('my-id', { title, desc, skill, render(body, ctx) { … } })` in one of the `src/tools/` files and add a `toolTile('my-id')` to its page in `src/pages.js`.
