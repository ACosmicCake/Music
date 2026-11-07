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
import { h, s, tool, openTool, go, Fretboard, positionsOfPc, toast, bar, noteName, TOOLS, PAGES, TABS, TAB_ALIASES, ICONS, renderTabs, ui, paintSync, applyDisplay, watchErrors } from './ui/core.js';
import './tools/ear.js';
import './tools/dictation.js';
import './tools/rhythm.js';
import './tools/play.js';
import './tools/atlas.js';
import './tools/practice.js';
import './tools/reading.js';
import './tools/notenames.js';
import './tools/notate.js';
import './tools/drills.js';
import './tools/rhythmgym.js';
import './tools/updraft.js';
import './tools/tower.js';
import './tools/learn.js';
import { bootSession } from './ui/session.js';
import './ui/routine.js';
import { settingsPage, offerLink } from './pages.js';
import { decodeLink, isLinkHash } from './linkcode.js';
import './ui/library.js';
import transcribe from './tools/transcribe-lazy.js';
import { registerApp } from './pwa.js';
import { isNative, onBack } from './native.js';
import { initGitHubSync } from './ghsync.js';
import { initLibSync } from './libsync.js';
import './tools/commute.js';
import { initSaveBanner } from './ui/savebanner.js';
import { initReminder } from './reminder.js';
import { bootSpotify } from './ui/taste.js';

/* ---------- plugins (e.g. Transcribe) ---------- */
const UI = { h, s, tool, openTool, go, Fretboard, positionsOfPc, toast, bar, noteName, TOOLS, PAGES, TABS, ICONS, renderTabs, get ui() { return ui; } };
[transcribe, ...(window.WW_PLUGINS || [])].forEach(fn => { try { fn(UI); } catch (e) { console.error(e); } });

/* ---------- boot ---------- */
watchErrors();
E.init();
applyDisplay();
initSaveBanner();
initGitHubSync();
initLibSync();
initReminder();
let resizeT = null;
window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(applyDisplay, 150); });
E.onChange(applyDisplay);
// which output path the audio asks for (Settings → Display → Sound output), read when the audio first starts
A.setOutput(E.state.settings.audioOutput);
E.onChange(st => A.setOutput(st.settings.audioOutput));
// the recorded guitar the player chose (Settings → Display → Sounds), loaded on the first tap
Guitars.setVoice(E.state.settings.guitarSound);
E.onChange(st => Guitars.setVoice(st.settings.guitarSound));
Cur.migrate();
bootSession();
paintSync();
const hashTab = () => { const t = (location.hash || '').replace('#', ''); return TABS.some(x => x[0] === t) || TAB_ALIASES[t] ? t : null; };
const startHash = location.hash;
go(hashTab() || 'today');
if (startHash === '#go') openTool('commute', { returnTab: 'today' }); // the 'On the go' shortcut
// coming back from the Spotify login (Settings → Your music taste): finish it, then show what it found
if (!isNative() && /[?&](code|error)=/.test(location.search)) bootSpotify(settingsPage);
// a scanned Link another device code (#link=ww1.…): take the token out of the address bar and history, then ask to join
function takeLink(hash = location.hash) {
  if (!isLinkHash(hash)) return false;
  const cfg = decodeLink(hash);
  history.replaceState(null, '', location.pathname + location.search + '#' + (ui.tab || 'today'));
  if (cfg) offerLink(cfg); else toast('That link is broken. Copy it again on the device that syncs.');
  return true;
}
takeLink(startHash); // go() above already put #today in the address bar
// Links and app shortcuts like #transcribe switch tabs without a reload.
window.addEventListener('hashchange', () => { if (takeLink()) return; if (location.hash === '#go') { openTool('commute', { returnTab: 'today' }); return; } const t = hashTab(); if (t && (t !== ui.tab || ui.runner)) go(t); });
// The Android app has no service worker (it is already offline); its back button closes tools first.
if (!isNative()) registerApp(toast);
// a full-screen view inside a tool marks its close button with data-back-close: back closes that first
onBack(() => { const x = document.querySelector('[data-back-close]'); if (x) { x.click(); return true; } if (ui.runner) { go(ui.tab || 'today'); return true; } if (ui.tab !== 'today') { go('today'); return true; } return false; });
