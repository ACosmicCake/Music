/* World Woodshed — the few things the Android app does natively, with web fallbacks.
   In the browser (and the installed web app) everything here uses web APIs; inside the Android app
   (Capacitor) it uses the phone's share sheet, text-to-speech and keep-awake. Plugins load only there. */
import { Capacitor } from '@capacitor/core';

export const isNative = () => { try { return Capacitor.isNativePlatform(); } catch (e) { return false; } };

/* Share a text file (the progress sync file) through the share sheet, or download it */
export async function shareFile(name, text, title) {
  if (isNative()) {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const w = await Filesystem.writeFile({ path: name, data: text, directory: Directory.Cache, encoding: Encoding.UTF8 });
    await Share.share({ title, files: [w.uri], dialogTitle: title });
    return 'shared';
  }
  const f = new File([text], name, { type: 'application/json' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title }); return 'shared'; }
  } catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(f); a.download = name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  return 'downloaded';
}

/* Keep the screen on while anything asks for it (a running session, hands-free practice, Transcribe playing).
   Each caller holds its own claim, so one letting go doesn't turn the screen off under another. The Android
   app uses the native keep-awake (its WebView has no Screen Wake Lock); the browser drops a wake lock when
   the page is hidden, so it is taken again when the page comes back. */
const holders = new Set();
let lock = null, lockBusy = false;
async function webLock() {
  if (!navigator.wakeLock) return;
  const want = holders.size > 0 && document.visibilityState === 'visible';
  if (want && !lock && !lockBusy) {
    lockBusy = true;
    try {
      const l = await navigator.wakeLock.request('screen');
      if (holders.size) { lock = l; l.addEventListener('release', () => { if (lock === l) lock = null; }); } else l.release().catch(() => {});
    } finally { lockBusy = false; }
  } else if (!holders.size && lock) { const l = lock; lock = null; await l.release(); }
}
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (!isNative()) webLock().catch(() => {}); });
export async function keepAwake(on, who = 'app') {
  if (on) holders.add(who); else holders.delete(who);
  try {
    if (isNative()) {
      const { KeepAwake } = await import('@capacitor-community/keep-awake');
      if (holders.size) await KeepAwake.keepAwake(); else await KeepAwake.allowSleep(); // the state now, after the import
      return true;
    }
    await webLock();
    return true;
  } catch (e) { return false; }
}

/* Speak a short phrase with the phone's own voice (on-device); resolves when done, false if unavailable */
let ttsReady = null;
export async function speak(text, opts = {}) {
  try {
    if (isNative()) {
      const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
      await TextToSpeech.speak({ text, lang: opts.lang || 'en-US', rate: opts.rate || 1.0, pitch: 1.0, volume: 1.0, category: 'playback' });
      return true;
    }
    if (!('speechSynthesis' in window)) return false;
    if (!ttsReady) ttsReady = new Promise(res => { if (speechSynthesis.getVoices().length) res(); else { speechSynthesis.onvoiceschanged = () => res(); setTimeout(res, 800); } });
    await ttsReady;
    return await new Promise(res => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = opts.lang || 'en-US'; u.rate = opts.rate || 1.0;
      const voice = speechSynthesis.getVoices().find(v => v.lang && v.lang.startsWith('en') && v.localService);
      if (voice) u.voice = voice;
      u.onend = () => res(true); u.onerror = () => res(false);
      speechSynthesis.cancel(); speechSynthesis.speak(u);
      setTimeout(() => res(true), 6000);
    });
  } catch (e) { return false; }
}
export async function stopSpeaking() {
  try {
    if (isNative()) { const { TextToSpeech } = await import('@capacitor-community/text-to-speech'); await TextToSpeech.stop(); }
    else if ('speechSynthesis' in window) speechSynthesis.cancel();
  } catch (e) { /* ignore */ }
}

/* Android back button: close the open tool, then go to Today, then leave the app */
export async function onBack(handler) {
  if (!isNative()) return;
  const { App } = await import('@capacitor/app');
  App.addListener('backButton', () => { if (!handler()) App.minimizeApp(); });
}
