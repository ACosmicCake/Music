/* World Woodshed — installable app: offline cache, update prompt, install button */
import { registerSW } from 'virtual:pwa-register';

let installEvent = null;
let reg = null, update = null, waiting = false, applyWhenFound = false;

export function registerApp(toast) {
  if (!('serviceWorker' in navigator)) return;
  update = registerSW({
    onNeedRefresh() { waiting = true; if (applyWhenFound) update(true); else showUpdate(() => update(true)); },
    onOfflineReady() { toast('Ready to use offline'); },
    onRegisteredSW(url, r) { reg = r || null; }
  });
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    installEvent = e;
    showInstall();
  });
  window.addEventListener('appinstalled', () => { installEvent = null; hideInstall(); });
}

function banner(id, text, label, onclick) {
  let el = document.getElementById(id);
  if (el) return el;
  el = document.createElement('div');
  el.id = id;
  el.className = 'app-banner';
  const span = document.createElement('span');
  span.textContent = text;
  const btn = document.createElement('button');
  btn.className = 'btn small brass';
  btn.textContent = label;
  btn.onclick = onclick;
  const close = document.createElement('button');
  close.className = 'btn small ghost';
  close.setAttribute('aria-label', 'Dismiss');
  close.textContent = '✕';
  close.onclick = () => el.remove();
  el.append(span, btn, close);
  document.body.append(el);
  return el;
}

function showUpdate(apply) {
  banner('ww-update', 'A new version is ready.', 'Update', apply);
}

function showInstall() {
  try { if (localStorage.getItem('ww-install-dismissed')) return; } catch (e) { /* ignore */ }
  const el = banner('ww-install', 'Install World Woodshed as an app.', 'Install', async () => {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    installEvent = null;
    el.remove();
  });
  el.lastChild.addEventListener('click', () => { try { localStorage.setItem('ww-install-dismissed', '1'); } catch (e) { /* ignore */ } });
}
function hideInstall() { const el = document.getElementById('ww-install'); if (el) el.remove(); }

/* Check for updates (Settings → App updates): ask the service worker to look for a new version now, and if
   there is one, install it and reload into it (as the banner's Update button does).
   → 'updating' (it reloads by itself), 'current', 'offline' or 'unsupported' (no service worker, as in dev) */
export async function checkForUpdate() {
  if (!reg || !update) return 'unsupported';
  if (waiting || reg.waiting) { update(true); return 'updating'; }
  if (navigator.onLine === false) return 'offline';
  try { await reg.update(); } catch (e) { return 'offline'; }
  const found = reg.installing || reg.waiting;
  if (!found) return 'current';
  applyWhenFound = true; // onNeedRefresh applies it once it has installed
  found.addEventListener('statechange', () => { if (found.state === 'redundant') applyWhenFound = false; });
  if (waiting) update(true);
  return 'updating';
}
