/* World Woodshed — the daily run that turns practice hours into real impact (see src/impact.js).
   Run by .github/workflows/impact.yml. Reads the progress file in your sync repository, orders what every
   10 hours earned from GoodAPI, and writes the ledger (world-woodshed-impact.json) beside the progress file.

   Environment:
     GOODAPI_KEY   your GoodAPI key (a test key, test_…, orders nothing real and costs nothing)
     SYNC_TOKEN    a GitHub token with Contents: Read and write on the sync repository (the app's own will do)
     SYNC_REPO     owner/name of the sync repository
     SYNC_PATH     the progress file's path there (default world-woodshed-progress.json)
     IMPACT_CAP    most units a month (default 10)
     IMPACT_TEST   'true' to order in test mode even with a live key
     IMPACT_TRY    'true' with a test key: also place one test order now, whatever the hours, to check the
                   key and the connection (not written to the ledger, so it never shows in the garden)
   Prints counts only, never your practice details. */
import { run, LEDGER_FILE, DEFAULT_CAP, amount } from '../../src/impact.js';

const env = process.env;
const need = k => { if (!env[k]) { console.error('Missing ' + k + '. See the impact section of README.md.'); process.exit(1); } return env[k]; };
const KEY = need('GOODAPI_KEY'), TOKEN = need('SYNC_TOKEN'), REPO = need('SYNC_REPO').trim();
const PATH = (env.SYNC_PATH || 'world-woodshed-progress.json').trim();
const LEDGER = (PATH.includes('/') ? PATH.slice(0, PATH.lastIndexOf('/') + 1) : '') + LEDGER_FILE;
const CAP = Number.isFinite(+env.IMPACT_CAP) && env.IMPACT_CAP !== '' ? +env.IMPACT_CAP : DEFAULT_CAP;
const TEST = /^test/i.test(KEY.trim()) || env.IMPACT_TEST === 'true';
const GOOD = 'https://app.thegoodapi.com';

const gh = (method, path, body, accept) => fetch('https://api.github.com/repos/' + REPO + '/contents/' + path.split('/').map(encodeURIComponent).join('/'), {
  method, headers: { Authorization: 'Bearer ' + TOKEN, Accept: accept || 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'world-woodshed-impact' },
  body: body ? JSON.stringify(body) : undefined
});
async function readJSON(path) {
  const res = await gh('GET', path, null, 'application/vnd.github.raw+json');
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('GitHub answered ' + res.status + ' reading ' + path);
  return JSON.parse(await res.text());
}
async function sha(path) {
  const res = await gh('GET', path);
  return res.ok ? (await res.json()).sha : null;
}

async function plant(kind, count, key) {
  const k = { tree: ['/plant/trees', 'veritree-kenya'], kelp: ['/plant/trees', 'veritree-bc-kelp'], bottles: ['/rescue/plastic_bottles', null] }[kind];
  const body = { count, attribution: 'world-woodshed', idempotency_key: key, ...(k[1] ? { project_id: k[1] } : {}) };
  const res = await fetch(GOOD + k[0], { method: 'POST', headers: { Authorization: KEY.trim(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('GoodAPI answered ' + res.status + (out.error ? ': ' + out.error : ''));
  const d = (out.tree_details || out.bottle_details || []).slice(-1)[0] || {};
  return { id: d.id || null, project: d.project_name ? d.project_name + (d.region && !d.project_name.includes(d.region) ? ', ' + d.region : '') : null };
}

async function dashboard() {
  try {
    const res = await fetch(GOOD + '/dashboard_url', { headers: { Authorization: KEY.trim() } });
    return res.ok ? (await res.json()).dashboard_url || null : null;
  } catch (e) { return null; }
}

/* Is the key one GoodAPI accepts? (lists past orders, which costs nothing) */
async function keyCheck() {
  try {
    const res = await fetch(GOOD + '/plant/trees', { headers: { Authorization: KEY.trim() } });
    return res.ok ? 'accepted' : 'refused (' + res.status + ')';
  } catch (e) { return 'unreachable (' + (e.message || e) + ')'; }
}
const check = await keyCheck();
console.log('GoodAPI ' + (TEST ? 'test' : 'live') + ' key: ' + check + '.');
if (!check.startsWith('accepted')) { console.error('Check GOODAPI_KEY in the repository secrets.'); process.exit(1); }

const progressFile = await readJSON(PATH);
if (!progressFile) { console.error('No progress file at ' + PATH + ' in ' + REPO + '. Is GitHub sync on in the app?'); process.exit(1); }
const state = progressFile.app === 'world-woodshed' ? progressFile.state : progressFile;
const ledger = await readJSON(LEDGER);
const choice = (state.settings && state.settings.impact && state.settings.impact.kind) || 'tree';
if (env.IMPACT_TRY === 'true') {
  if (!TEST) console.log('Skipped the trial order: it is only placed with a test key.');
  else {
    const kind = choice === 'turns' ? 'tree' : choice;
    const k = { tree: 1, kelp: 1, bottles: 10 }[kind] || 1;
    try { const t = await plant(kind, k, 'test-try-' + Date.now()); console.log('Trial ' + amount(kind, 1) + ' ordered in test mode' + (t.project ? ' (' + t.project + ')' : '') + '.'); }
    catch (e) { console.error('Trial order failed: ' + e.message); process.exit(1); }
  }
}
const r = await run({ ledger, hdev: state.hdev, choice, cap: CAP, test: TEST, plant });
const url = await dashboard();
if (url && /^https:\/\//.test(url)) r.ledger.dashboard = url;

const body = { message: 'Impact: ' + (r.started ? 'start counting' : r.made.length ? r.made.map(m => amount(m.kind, 1)).join(', ') : 'nothing new') + (TEST ? ' (test)' : ''),
  content: Buffer.from(JSON.stringify(r.ledger, null, 1)).toString('base64') };
const s = await sha(LEDGER);
const put = await gh('PUT', LEDGER, s ? { ...body, sha: s } : body);
if (!put.ok) { console.error('Could not write the ledger: GitHub answered ' + put.status); process.exit(1); }

console.log(r.started ? 'Started counting today. Hours from now on count.' : 'Ordered ' + r.made.length + (TEST ? ' in test mode' : '') + '. ' + (r.waiting > 0 ? r.waiting + ' more earned, waiting for next month\'s cap.' : ''));
if (r.error) { console.error(r.error); process.exit(1); }
