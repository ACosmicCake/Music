/* World Woodshed — installable app: offline cache, update prompt, install button */
import { registerSW } from 'virtual:pwa-register';

let installEvent = null;

export function registerApp(toast) {
  if (!('serviceWorker' in navigator)) return;
  const update = registerSW({
    onNeedRefresh() { showUpdate(() => update(true)); },
    onOfflineReady() { toast('Ready to use offline'); }
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
