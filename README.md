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

**Automatic sync (optional):** the same card can sync by itself through a private GitHub repository of your own. Create a private repository (for example `woodshed-sync`), then a [fine-grained token](https://github.com/settings/personal-access-tokens/new) limited to that repository with **Contents: Read and write**, and enter both under **Today → Your progress on every device → Automatic sync** on each device. It syncs when the app opens, every few minutes while it's open, and shortly after you practise, merging like the sync file. The token stays on the device and never goes into your progress or files.

### Android app (for commutes)

The same app is also packaged for Android (`world-woodshed/android`, Capacitor), built by `.github/workflows/android.yml`. Each build of `main` is published as a release: on the phone, open **Releases → latest** in this repository, tap `WorldWoodshed.apk`, and allow installs from your browser when Android asks. New versions install over the old one and keep your progress. Pull requests get the APK as a workflow artifact.

It opens with **On the go**: a smart session sized to your ride that needs only the phone (scale positions become seeing the neck in your head, call & response becomes dictation, tunes become following the form by ear), and hands-free ear training where a question plays, the answer is spoken, and you grade it by tapping either half of a dark screen. It works fully offline. Use the sync file above to keep it in step with the computer.

**Build it on your own computer instead** (no GitHub Actions needed): install [Android Studio](https://developer.android.com/studio), then in `world-woodshed/` run `npm install` and `npm run android:sync`, open the `android` folder in Android Studio and choose **Build → Build App Bundle(s) / APK(s) → Build APK(s)** (or run `./gradlew assembleRelease` inside `android/`). The APK lands in `android/app/build/outputs/apk/`. Copy it to the phone, or plug the phone in with USB debugging on and press Run.

Releases are signed with your own private key, kept only in the repository secrets `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` and `ANDROID_KEY_PASSWORD` (Settings → Secrets and variables → Actions). Updates only install over the old app when they are signed with the same key, so keep a copy of the keystore somewhere safe. Without the secrets, the workflow still builds a test APK (signed with a throwaway debug key) but doesn't publish a release.

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
| `src/samples.js`, `public/samples/` | Recorded instruments, loaded on first use (credits in `public/samples/LICENSES.md`, rebuilt by `scripts/samples/build.mjs`) |
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

### Contributing

Changes come in as pull requests against `main`, one focused change each, small enough to review in about ten minutes. Say in the description what changed, why, how you checked it, and show before and after (numbers or screenshots).

Before you open one, in `world-woodshed/`:

```sh
npm run lint      # ESLint, recommended rules: must show no errors
npm test          # Vitest, everything in test/
npm run build     # must build with no new warnings
```

Then try the change in the app (`npm run dev`) on a phone-sized window, at 240 px wide (the compact layout for small phones) and on a desktop, in light and dark mode. If it touches loading or caching, also run `npm run preview`, load the app once, go offline and reload. The same lint, tests and build run on every pull request (`android.yml`) and before each deploy (`deploy.yml`).

House rules:

- **No frameworks and nothing fetched at runtime.** Plain ES modules, everything bundled, so the app works offline. The only network use is the opt-in GitHub sync.
- **Build the DOM with `h()` and `s()`**, setting text with `text:`. Don't put strings into `innerHTML`; `test/safety.test.js` checks this.
- **Saved progress is never lost.** If you change the shape of the saved state, raise `SCHEMA`, add a step to `MIGRATIONS` and a rule to `merge()` in `src/sync.js`, and add tests in `test/sync.test.js` and `test/persistence.test.js`. Deletions leave a tombstone. Settings that belong to one device go in `DEVICE_SETTINGS`.
- **Content must be accurate:** recordings, years, books and theory. When you add or change content, extend `test/content.test.js`.
- **The microphone is opt-in.** Sound is analysed on the device, never recorded or sent, and every mic feature must also work by tapping.
- **Match the code around you:** one file per tool, small functions, and comments that explain the music or the maths rather than the code.
