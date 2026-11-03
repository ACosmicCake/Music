import { describe, it, expect, vi } from 'vitest';
import './env.js';
import { reminderTimes, parseTime, IDS } from '../src/reminder.js';

/* The daily practice reminder: a week of times, skipping today once practised or once the time has gone by */
describe('the daily reminder times', () => {
  vi.setSystemTime(new Date(2026, 10, 3, 9, 0));
  const now = Date.now();
  const hm = d => [d.getDate(), d.getHours(), d.getMinutes()];
  it('reads the time', () => {
    expect(parseTime('7:05')).toEqual({ hour: 7, minute: 5 });
    expect(parseTime('24:00')).toBeNull();
    expect(parseTime('')).toBeNull();
  });
  it('sets a week, starting today when the time is still ahead', () => {
    const t = reminderTimes(now, '19:30', false);
    expect(t).toHaveLength(IDS.length);
    expect(hm(t[0])).toEqual([3, 19, 30]);
    expect(hm(t[6])).toEqual([9, 19, 30]);
  });
  it('starts tomorrow once today is practised, or when the time has gone by', () => {
    expect(hm(reminderTimes(now, '19:30', true)[0])).toEqual([4, 19, 30]);
    expect(hm(reminderTimes(now, '08:00', false)[0])).toEqual([4, 8, 0]);
    expect(reminderTimes(now, '08:00', false)).toHaveLength(IDS.length);
  });
  it('sets nothing for a time it can’t read', () => {
    expect(reminderTimes(now, 'soon', false)).toEqual([]);
  });
});

/* The plugin is a proxy that answers every property, "then" included, as a native call (as Capacitor's are):
   handing it through a promise must not call it, or every start shows an error */
vi.mock('../src/native.js', () => ({ isNative: () => true }));
const calls = [];
vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: new Proxy({}, { get: (t, prop) => () => {
    calls.push(prop);
    if (prop === 'then') return Promise.reject(new Error('"LocalNotifications.then()" is not implemented on android'));
    if (prop === 'checkPermissions') return Promise.resolve({ display: 'granted' });
    return Promise.resolve({});
  } })
}));
describe('setting the reminders in the app', () => {
  it('never calls the plugin’s "then", and sets a week once turned on', async () => {
    const E = (await import('../src/engine.js')).default;
    const R = await import('../src/reminder.js');
    const errors = [];
    const off = e => errors.push(e);
    process.on('unhandledRejection', off);
    await R.reschedule(); // never turned on: the plugin isn't touched
    expect(calls).toEqual([]);
    E.setSetting('reminder', { on: true, time: '19:30' });
    await R.reschedule();
    await new Promise(r => setTimeout(r, 0));
    process.off('unhandledRejection', off);
    expect(calls).not.toContain('then');
    expect(calls).toEqual(['cancel', 'checkPermissions', 'schedule']);
    expect(errors).toEqual([]);
  });
});
