/* World Woodshed — real impact for your practice: every 10 hours practised plants a tree, a kelp plant or
   collects ten plastic bottles through GoodAPI (thegoodapi.com). Plain functions, shared by the app (the
   garden on Today, src/ui/garden.js) and the daily GitHub Action that pays for them
   (scripts/impact/plant.mjs, .github/workflows/impact.yml); test/impact.test.js.

   The Action keeps a ledger beside the progress file in the player's own sync repository
   (world-woodshed-impact.json); only the Action writes it, the app only reads it:
     { v: 1, start: 'YYYY-MM-DD', base: minutes already practised on the start day when it began,
       days: { 'YYYY-MM-DD': minutes }, planted: [{ n, kind, count, id, project, at, test }], ran, dashboard }
   Hours from before the first run don't count. Days are kept in the ledger as the Action sees them, because
   the app keeps only the last 180 days of history (a day seen once keeps its largest total). Each unit's
   order carries the idempotency key 'ww-<start>-<n>', so a retry or a second run never pays twice. */

export const HOURS = 10;                 // practice hours per unit
export const UNIT_MIN = HOURS * 60;
export const DEFAULT_CAP = 10;           // units a calendar month at most, unless the Action says otherwise
export const LEDGER_FILE = 'world-woodshed-impact.json';

/* What each 10 hours can become: GoodAPI's endpoint, project and how many of the thing */
export const KINDS = {
  tree: { name: 'Tree', many: 'trees', count: 1, path: '/plant/trees', project: 'veritree-kenya', where: 'Kilifi, Kenya', cost: 0.43 },
  kelp: { name: 'Kelp', many: 'kelp', count: 1, path: '/plant/trees', project: 'veritree-bc-kelp', where: 'British Columbia', cost: 0.43 },
  bottles: { name: '10 bottles', many: 'bottles', count: 10, path: '/rescue/plastic_bottles', project: null, where: 'ocean-bound plastic', cost: 0.5 }
};
export const ORDER = ['tree', 'kelp', 'bottles'];
export const CHOICES = [['tree', 'Trees'], ['kelp', 'Kelp'], ['bottles', 'Plastic bottles'], ['turns', 'Take turns']];

/* The kind for unit n (counted from 0) under the player's choice (settings.impact.kind) */
export function kindFor(choice, n) {
  if (choice === 'turns') return ORDER[n % ORDER.length];
  return KINDS[choice] ? choice : 'tree';
}

/* Minutes practised per day across every device (state.hdev: { device: { day: { sec } } }) */
export function dayMinutes(hdev) {
  const out = {};
  Object.values(hdev || {}).forEach(dev => Object.entries(dev || {}).forEach(([k, r]) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(k) && r && r.sec > 0) out[k] = (out[k] || 0) + r.sec / 60;
  }));
  return out;
}

const round1 = m => Math.round(m * 10) / 10;

/* A fresh ledger: counting starts on the latest day the progress knows of (or `today`, if later), less what
   was already practised on it, so past hours don't count */
export function startLedger(mins, today) {
  const last = Object.keys(mins).sort().pop();
  const start = last && last > today ? last : today;
  return { v: 1, start, base: round1(mins[start] || 0), days: {}, planted: [] };
}

/* The ledger's days brought up to date with what the progress holds now (a copy) */
export function withDays(ledger, mins) {
  const days = Object.assign({}, ledger.days);
  Object.entries(mins).forEach(([k, m]) => { if (k >= ledger.start) days[k] = Math.max(days[k] || 0, round1(m)); });
  return Object.assign({}, ledger, { days });
}

/* Minutes counted toward impact: the ledger's days, plus any newer practice the app has and it hasn't seen */
export function countedMinutes(ledger, mins = {}) {
  if (!ledger) return 0;
  let total = 0;
  const days = withDays(ledger, mins).days;
  Object.values(days).forEach(m => { total += m; });
  return Math.max(0, total - (ledger.base || 0));
}

/* Units earned (whole 10 hours) and where the next one stands */
export function progress(ledger, mins = {}) {
  const min = countedMinutes(ledger, mins);
  const earned = Math.floor(min / UNIT_MIN), done = ledger ? live(ledger).length : 0;
  return { min, earned, planted: done, waiting: Math.max(0, earned - done), toNext: UNIT_MIN - (min % UNIT_MIN), frac: (min % UNIT_MIN) / UNIT_MIN };
}

/* The ledger's real orders, or its test ones while the Action still runs on a test key */
export function live(ledger, test) {
  const all = (ledger && ledger.planted) || [];
  if (test === undefined) test = all.length > 0 && all.every(p => p.test);
  return all.filter(p => !!p.test === !!test);
}

const monthOf = iso => String(iso || '').slice(0, 7);

/* What to order now: the units earned and not yet ordered, at most `cap` this calendar month (UTC).
   Returns [{ n, kind, key }] */
export function due(ledger, mins, { now = Date.now(), cap = DEFAULT_CAP, choice = 'tree', test = false } = {}) {
  const l = withDays(ledger, mins);
  const done = live(l, test);
  const p = progress(l);
  const thisMonth = monthOf(new Date(now).toISOString());
  let room = Math.max(0, cap - done.filter(x => monthOf(x.at) === thisMonth).length);
  const out = [];
  for (let n = done.length; n < p.earned && room > 0; n++, room--) {
    out.push({ n, kind: kindFor(choice, n), key: (test ? 'test-' : '') + 'ww-' + l.start + '-' + n });
  }
  return out;
}

/* One run of the Action, with the order itself passed in (plant(kind, count, key) → { id, project }), so the
   tests can run it without the network. Returns the new ledger and what happened. A failed order stops the
   run; what was ordered before it is kept. */
export async function run({ ledger, hdev, choice, now = Date.now(), cap = DEFAULT_CAP, test = false, plant }) {
  const mins = dayMinutes(hdev);
  const today = new Date(now).toISOString().slice(0, 10);
  let l = ledger && ledger.v === 1 ? ledger : startLedger(mins, today);
  const started = l !== ledger;
  l = withDays(l, mins);
  // going live drops the test orders: their hours are paid for for real now
  if (!test && l.planted.some(p => p.test)) l.planted = l.planted.filter(p => !p.test);
  const todo = started ? [] : due(l, {}, { now, cap, choice, test });
  const made = [];
  let error = null;
  for (const u of todo) {
    const k = KINDS[u.kind];
    try {
      const r = await plant(u.kind, k.count, u.key);
      const entry = { n: u.n, kind: u.kind, count: k.count, id: (r && r.id) || null, project: (r && r.project) || k.where, at: new Date(now).toISOString() };
      if (test) entry.test = true;
      l.planted = l.planted.concat([entry]);
      made.push(entry);
    } catch (e) { error = e.message || String(e); break; }
  }
  l.ran = new Date(now).toISOString();
  return { ledger: l, started, made, error, waiting: progress(l).earned - live(l, test).length };
}

/* Words for a count of units of one kind: "3 trees", "1 kelp", "20 bottles" */
export function amount(kind, units) {
  const k = KINDS[kind] || KINDS.tree;
  if (kind === 'bottles') return units * k.count + ' bottle' + (units * k.count === 1 ? '' : 's');
  if (kind === 'kelp') return units + ' kelp';
  return units + ' tree' + (units === 1 ? '' : 's');
}

export default { HOURS, UNIT_MIN, DEFAULT_CAP, LEDGER_FILE, KINDS, ORDER, CHOICES, kindFor, dayMinutes, startLedger, withDays, countedMinutes, progress, live, due, run, amount };
