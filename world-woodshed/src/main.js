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
import Cur from './curriculum.js';
import { h, s, tool, openTool, go, Fretboard, positionsOfPc, toast, bar, noteName, TOOLS, PAGES, TABS, TAB_ALIASES, ICONS, renderTabs, ui, syncEl } from './ui/core.js';
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
import transcribe from './tools/transcribe.js';
import { registerApp } from './pwa.js';

/* ---------- plugins (e.g. Transcribe) ---------- */
const UI = { h, s, tool, openTool, go, Fretboard, positionsOfPc, toast, bar, noteName, TOOLS, PAGES, TABS, ICONS, renderTabs, get ui() { return ui; } };
[transcribe, ...(window.WW_PLUGINS || [])].forEach(fn => { try { fn(UI); } catch (e) { console.error(e); } });

/* ---------- boot ---------- */
E.init();
Cur.migrate();
bootSession();
syncEl.textContent = E.storageNote();
const hashTab = () => { const t = (location.hash || '').replace('#', ''); return TABS.some(x => x[0] === t) || TAB_ALIASES[t] ? t : null; };
go(hashTab() || 'today');
// Links and app shortcuts like #transcribe switch tabs without a reload.
window.addEventListener('hashchange', () => { const t = hashTab(); if (t && (t !== ui.tab || ui.runner)) go(t); });
registerApp(toast);
