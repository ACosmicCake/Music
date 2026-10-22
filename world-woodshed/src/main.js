/* World Woodshed — entry point: styles, fonts, tools, pages, plugins, then boot */
import '@fontsource/bricolage-grotesque/latin-500.css';
import '@fontsource/bricolage-grotesque/latin-700.css';
import '@fontsource/bricolage-grotesque/latin-800.css';
import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './styles.css';

import E from './engine.js';
import A from './audio.js';
import Cur from './curriculum.js';
import './drumkit.js';
import Guitars from './guitars.js';
import { h, s, tool, openTool, go, Fretboard, positionsOfPc, toast, bar, noteName, TOOLS, PAGES, TABS, TAB_ALIASES, ICONS, renderTabs, ui, syncEl, applyDisplay, watchErrors } from './ui/core.js';
import './tools/ear.js';
import './tools/dictation.js';
import './tools/rhythm.js';
import './tools/play.js';
import './tools/atlas.js';
import './tools/practice.js';
import './tools/reading.js';
import './tools/drills.js';
import './tools/rhythmgym.js';
import './tools/learn.js';
import { bootSession } from './ui/session.js';
import './ui/routine.js';
import './pages.js';
import './ui/library.js';
import transcribe from './tools/transcribe-lazy.js';
import { registerApp } from './pwa.js';
import { isNative, onBack } from './native.js';
import { initGitHubSync } from './ghsync.js';
import './tools/commute.js';
import { initSaveBanner } from './ui/savebanner.js';

/* ---------- plugins (e.g. Transcribe) ---------- */
const UI = { h, s, tool, openTool, go, Fretboard, positionsOfPc, toast, bar, noteName, TOOLS, PAGES, TABS, ICONS, renderTabs, get ui() { return ui; } };
[transcribe, ...(window.WW_PLUGINS || [])].forEach(fn => { try { fn(UI); } catch (e) { console.error(e); } });

/* ---------- boot ---------- */
watchErrors();
E.init();
applyDisplay();
initSaveBanner();
initGitHubSync();
let resizeT = null;
window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(applyDisplay, 150); });
E.onChange(applyDisplay);
// which output path the audio asks for (Train → Display → Sound output), read when the audio first starts
A.setOutput(E.state.settings.audioOutput);
E.onChange(st => A.setOutput(st.settings.audioOutput));
// the recorded guitar the player chose (Train → Display → Sounds), loaded on the first tap
Guitars.setVoice(E.state.settings.guitarSound);
E.onChange(st => Guitars.setVoice(st.settings.guitarSound));
Cur.migrate();
bootSession();
syncEl.textContent = E.storageNote();
const hashTab = () => { const t = (location.hash || '').replace('#', ''); return TABS.some(x => x[0] === t) || TAB_ALIASES[t] ? t : null; };
const startHash = location.hash;
go(hashTab() || 'today');
if (startHash === '#go') openTool('commute', { returnTab: 'today' }); // the 'On the go' shortcut
// Links and app shortcuts like #transcribe switch tabs without a reload.
window.addEventListener('hashchange', () => { if (location.hash === '#go') { openTool('commute', { returnTab: 'today' }); return; } const t = hashTab(); if (t && (t !== ui.tab || ui.runner)) go(t); });
// The Android app has no service worker (it is already offline); its back button closes tools first.
if (!isNative()) registerApp(toast);
onBack(() => { if (ui.runner) { go(ui.tab || 'today'); return true; } if (ui.tab !== 'today') { go('today'); return true; } return false; });
