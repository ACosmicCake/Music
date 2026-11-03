/* World Woodshed — a daily practice reminder in the Android app (Settings → Display → Daily reminder).
   A notification at the time the player picks, on the days they haven't practised yet: the next week of
   reminders is set each time the app opens and after practice, leaving out today once a minute or more is
   logged. Nothing is sent anywhere; Android shows them itself (@capacitor/local-notifications). The web app
   can't show a notice at a set time when it is closed, so there the setting says to use the Android app.
   reminderTimes is plain and tested in test/reminder.test.js. */
import E from './engine.js';
import { isNative } from './native.js';

export const IDS = [701, 702, 703, 704, 705, 706, 707]; // one notification a day, a week ahead
const dayKey = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

/* 'HH:MM' → { hour, minute }, or null */
export function parseTime(s) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || ''));
  if (!m || +m[1] > 23 || +m[2] > 59) return null;
  return { hour: +m[1], minute: +m[2] };
}

/* The times of the next `days` reminders from `now` (ms): at `time` on each day, today's only if it is still
   ahead and nothing was practised today. → [Date] */
export function reminderTimes(now, time, practisedToday, days = IDS.length) {
  const t = parseTime(time);
  if (!t) return [];
  const out = [];
  for (let k = 0; out.length < days && k <= days; k++) {
    const d = new Date(now);
    d.setDate(d.getDate() + k);
    d.setHours(t.hour, t.minute, 0, 0);
    if (k === 0 && (practisedToday || d.getTime() <= now)) continue;
    out.push(d);
  }
  return out.slice(0, days);
}

/* The words, set a week ahead, so nothing in them that changes from day to day but the goal */
function message() {
  let goal = 0;
  try { goal = E.streaks().goal; } catch (e) { /* no history yet */ }
  return goal ? 'Your ' + goal + ' minutes are waiting. Even ten minutes keeps the streak going.' : 'A few minutes with the guitar today keeps it in your hands.';
}

export const practisedToday = () => {
  const h = E.state.history && E.state.history[dayKey(Date.now())];
  return !!(h && h.sec >= 60);
};

let LN = null;
const plugin = async () => (LN = LN || (await import('@capacitor/local-notifications')).LocalNotifications);

/* Ask Android for permission to show notifications (Android 13 and later ask the player). → true if allowed */
export async function allow() {
  if (!isNative()) return false;
  const L = await plugin();
  let p = await L.checkPermissions();
  if (p.display === 'prompt' || p.display === 'prompt-with-rationale') p = await L.requestPermissions();
  return p.display === 'granted';
}

/* Set the week's reminders from the saved setting (or clear them when it is off). Safe to call often. */
let busy = null;
export function reschedule() {
  if (!isNative()) return Promise.resolve();
  const run = async () => {
    const L = await plugin();
    await L.cancel({ notifications: IDS.map(id => ({ id })) }).catch(() => {});
    const r = (E.state.settings && E.state.settings.reminder) || {};
    if (!r.on) return;
    const p = await L.checkPermissions();
    if (p.display !== 'granted') return;
    const times = reminderTimes(Date.now(), r.time || '19:00', practisedToday());
    await L.schedule({ notifications: times.map((at, i) => ({ id: IDS[i], title: 'Time to practise', body: message(), schedule: { at, allowWhileIdle: true } })) });
  };
  busy = (busy || Promise.resolve()).then(run, run).catch(e => console.error('reminder', e));
  return busy;
}

/* At start: set the week ahead, and again once the first minute of the day is logged (so today's goes) */
export function initReminder() {
  if (!isNative()) return;
  reschedule();
  let was = practisedToday();
  E.onChange(() => { const now = practisedToday(); if (now !== was) { was = now; reschedule(); } });
}
