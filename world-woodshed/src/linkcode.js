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
