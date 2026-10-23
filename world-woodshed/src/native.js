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

/* Hand any file (a score, a photo, a MIDI file) to another app: the share sheet in the Android app and where the
   browser can share files, otherwise a download. Resolves 'shared', 'downloaded' or 'cancelled'. */
const blobBase64 = blob => (typeof FileReader !== 'undefined'
  ? new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).slice(String(r.result).indexOf(',') + 1));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(blob);
  })
  : blob.arrayBuffer().then(buf => { const b = new Uint8Array(buf); let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); }));
/* Write a blob to the app's cache folder → its file:// uri. In pieces: the whole file as one base64 string
   crossing to Android in a single call ran the app out of memory and closed it for a large score or song. */
const PIECE = 3 * 512 * 1024; // bytes per call, a multiple of 3 so each piece is whole base64
export async function writeCacheFile(path, blob) {
  const { Filesystem, Directory } = await import('@capacitor/filesystem');
  const piece = i => blobBase64(blob.slice(i, i + PIECE));
  const w = await Filesystem.writeFile({ path, data: await piece(0), directory: Directory.Cache, recursive: true });
  for (let i = PIECE; i < blob.size; i += PIECE) await Filesystem.appendFile({ path, data: await piece(i), directory: Directory.Cache });
  return w.uri;
}
const safeName = name => [...String(name || 'file')].map(c => (c < ' ' || '\\/:*?"<>|'.includes(c) ? '_' : c)).join('').slice(0, 120) || 'file';
export async function shareBlob(name, blob, title) {
  const safe = safeName(name);
  if (isNative()) {
    const { Share } = await import('@capacitor/share');
    const uri = await writeCacheFile('share/' + safe, blob);
    try { await Share.share({ title, files: [uri], dialogTitle: title }); } catch (e) { if (/cancel/i.test(String(e && e.message))) return 'cancelled'; throw e; }
    return 'shared';
  }
  const f = new File([blob], safe, { type: blob.type || 'application/octet-stream' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title }); return 'shared'; }
  } catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(f); a.download = safe;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return 'downloaded';
}

/* Open a file in the app the phone uses for its type (a PDF reader, MuseScore for MIDI): in the Android app the
   file is written to the cache and handed over with a VIEW intent; types the phone knows no app for (.mscz,
   .gp) and any failure fall back to the share sheet. In the browser a PDF or image opens in a new tab and other
   files go to shareBlob. Resolves 'opened', or what shareBlob resolved. */
export async function openBlob(name, blob, title) {
  if (isNative()) {
    try {
      const { FileViewer } = await import('@capacitor/file-viewer');
      const uri = await writeCacheFile('open/' + safeName(name), blob);
      // the plugin wants a plain path: it strips 'file:///' along with the path's own leading slash
      await FileViewer.openDocumentFromLocalPath({ path: decodeURIComponent(uri.replace(/^file:\/\//, '')) });
      return 'opened';
    } catch (e) {
      console.warn('No app opened the file, using the share sheet', e);
      return shareBlob(name, blob, title);
    }
  }
  if (/^(application\/pdf|image\/)/.test(blob.type)) {
    const url = URL.createObjectURL(blob);
    if (window.open(url, '_blank')) { setTimeout(() => URL.revokeObjectURL(url), 60000); return 'opened'; }
    URL.revokeObjectURL(url);
  }
  return shareBlob(name, blob, title);
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
