/* World Woodshed — "Link another device": the GitHub sync setup carried in a link or QR code.
   A device that already syncs shows a link to the app with the repository, path and token in its #fragment
   (a fragment never reaches a server); another device that opens it, or has it pasted in Settings, joins the
   same sync with no typing. The token is the same one the first device holds, so the code is as secret as it. */

const PREFIX = 'ww1.';
export const SITE = 'https://acosmiccake.github.io/music/'; // where a scanned code opens when the Android app shows it

const toB64url = str => { const bytes = new TextEncoder().encode(str); let bin = ''; bytes.forEach(b => { bin += String.fromCharCode(b); }); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const fromB64url = b64 => { const s = b64.replace(/-/g, '+').replace(/_/g, '/'); return new TextDecoder().decode(Uint8Array.from(atob(s + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0))); };

/* the code alone: ww1.<base64url of [owner, repo, token, path]> */
export function encodeLink({ owner, repo, token, path }) {
  return PREFIX + toB64url(JSON.stringify([owner, repo, token, path || '']));
}

/* the link to open on the other device */
export function linkUrl(base, cfg) { return base.replace(/#.*$/, '') + '#link=' + encodeLink(cfg); }

/* A pasted link, a bare code or a location hash → { owner, repo, token, path }, or null when it isn't one */
export function decodeLink(text) {
  if (typeof text !== 'string') return null;
  const m = text.trim().match(/ww1\.([A-Za-z0-9_-]+)/);
  if (!m) return null;
  let a;
  try { a = JSON.parse(fromB64url(m[1])); } catch (e) { return null; }
  if (!Array.isArray(a) || a.length < 3 || !a.slice(0, 4).every(x => x === undefined || typeof x === 'string')) return null;
  const [owner, repo, token, path] = a.map(x => (x || '').trim());
  const name = /^[A-Za-z0-9_.-]{1,100}$/;
  if (!name.test(owner) || !name.test(repo) || !/^[A-Za-z0-9_]{20,255}$/.test(token)) return null;
  if (path && (path.length > 200 || /(^|\/)\.\.(\/|$)/.test(path) || path.startsWith('/'))) return null;
  return { owner, repo, token, path: path || undefined };
}

/* Is this hash a link? (#link=ww1.…) */
export const isLinkHash = hash => /^#link=ww1\./.test(hash || '');

/* A QR code as a grid of booleans (true = dark), with the four-module quiet zone the readers need */
export async function qrGrid(text) {
  const { default: qrcode } = await import('qrcode-generator');
  const qr = qrcode(0, 'M');
  qr.addData(text, 'Byte');
  qr.make();
  const n = qr.getModuleCount(), q = 4, rows = [];
  for (let r = -q; r < n + q; r++) { const row = []; for (let c = -q; c < n + q; c++) row.push(r >= 0 && c >= 0 && r < n && c < n && qr.isDark(r, c)); rows.push(row); }
  return rows;
}

/* ---- A 12-digit code typed on the other device ----
   The device that syncs makes a random code, encrypts the setup with a key stretched from it (PBKDF2 → AES-GCM)
   and posts it to a public relay (ntfy.sh) under a topic that is a hash of the code. The other device types the
   code, finds the topic, fetches and decrypts. The relay sees only the scrambled setup, and finding it at all
   takes the code; the app refuses a message older than CODE_MINUTES. Only used while linking. */
export const RELAY = 'https://ntfy.sh/';
export const CODE_MINUTES = 10;
const enc = new TextEncoder();
const b64u = bytes => { let bin = ''; bytes.forEach(b => { bin += String.fromCharCode(b); }); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64u = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); return Uint8Array.from(atob(s + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0)); };

/* twelve random digits, shown as 4821 9375 1046 */
export function makeCode() {
  const r = crypto.getRandomValues(new Uint32Array(12));
  return Array.from(r, x => x % 10).join('');
}
export const showCode = code => code.replace(/(\d{4})(?=\d)/g, '$1 ');
/* what was typed → the 12 digits, or null */
export function normCode(text) { const d = String(text || '').replace(/[\s-]/g, ''); return /^\d{12}$/.test(d) ? d : null; }

async function topicOf(code) {
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode('ww-link-topic:' + code)));
  return 'ww-' + Array.from(h.slice(0, 16), b => b.toString(16).padStart(2, '0')).join('');
}
async function keyOf(code) {
  const base = await crypto.subtle.importKey('raw', enc.encode(code), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode('ww-link-v1'), iterations: 150000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

/* post the setup under a code; resolves when the relay has it */
export async function sendByCode(cfg, code, fetchFn = fetch, now = Date.now()) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const body = enc.encode(JSON.stringify({ t: now, link: encodeLink(cfg) }));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await keyOf(code), body));
  let res;
  try { res = await fetchFn(RELAY + await topicOf(code), { method: 'POST', body: 'ww1:' + b64u(iv) + '.' + b64u(ct) }); } catch (e) { res = null; }
  if (!res || !res.ok) throw new Error('Could not reach the code service (ntfy.sh). Use the QR code or the link instead.');
}

/* fetch and open the setup for a typed code → { owner, repo, token, path } */
export async function receiveByCode(code, fetchFn = fetch, now = Date.now()) {
  let res;
  try { res = await fetchFn(RELAY + await topicOf(code) + '/json?poll=1&since=' + CODE_MINUTES + 'm', { cache: 'no-store' }); } catch (e) { res = null; }
  if (!res || !res.ok) throw new Error('Could not reach the code service (ntfy.sh). Check the connection, or use the link instead.');
  const msgs = (await res.text()).split('\n').map(l => { try { return JSON.parse(l); } catch (e) { return null; } })
    .filter(m => m && m.event === 'message' && typeof m.message === 'string' && m.message.startsWith('ww1:')).reverse();
  const key = await keyOf(code);
  for (const m of msgs) {
    try {
      const [iv, ct] = m.message.slice(4).split('.').map(unb64u);
      const p = JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)));
      if (typeof p.t !== 'number' || now - p.t > CODE_MINUTES * 60000 || p.t - now > 5 * 60000) continue;
      const cfg = decodeLink(p.link);
      if (cfg) return cfg;
    } catch (e) { /* not ours, or tampered with */ }
  }
  throw new Error('No device is showing that code. Check the digits, or make a new code (each lasts ' + CODE_MINUTES + ' minutes).');
}
