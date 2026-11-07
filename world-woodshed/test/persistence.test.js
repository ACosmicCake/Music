import './env.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { SCHEMA } from '../src/sync.js';

/* Saving and loading progress (src/engine.js): a failed save is noticed once, still reaches the
   second copy, and every past save format loads into the current app without losing anything. */

const LS_KEY = 'world-woodshed-v1';
const fixture = n => readFileSync(new URL('./fixtures/save-schema-' + n + '.json', import.meta.url), 'utf8');

/* A minimal IndexedDB: one object store kept in memory, answering asynchronously like the real one.
   It goes quiet when its test ends, so an engine from that test can't finish loading during the next
   one and write its progress into the next test's storage. */
const fakes = [];
function fakeIndexedDB() {
  const data = new Map();
  let open = true;
  const later = fn => setTimeout(() => { if (open) fn(); }, 0);
  fakes.push(() => { open = false; });
  const db = {
    createObjectStore() {},
    transaction() {
      const tx = { objectStore: () => ({
        put(v, k) { data.set(k, v); later(() => tx.oncomplete && tx.oncomplete()); },
        get(k) { const r = {}; later(() => { r.result = data.get(k); r.onsuccess && r.onsuccess(); }); return r; }
      }) };
      return tx;
    }
  };
  return { data, open() { const r = { result: db }; later(() => { r.onupgradeneeded && r.onupgradeneeded(); r.onsuccess && r.onsuccess(); }); return r; } };
}

/* A fresh engine, as on app start, with whatever is in storage now */
async function boot() {
  vi.resetModules();
  const E = (await import('../src/engine.js')).default;
  E.init();
  return E;
}
const tick = () => new Promise(r => setTimeout(r, 5));

let realSet;
beforeEach(() => { localStorage.clear(); realSet = localStorage.setItem; delete globalThis.indexedDB; });
afterEach(() => { fakes.splice(0).forEach(close => close()); localStorage.setItem = realSet; delete globalThis.indexedDB; vi.useRealTimers(); });
const fillUp = () => { localStorage.setItem = () => { const e = new Error('full'); e.name = 'QuotaExceededError'; throw e; }; };

describe('a save that fails', () => {
  it('is reported once, not once per save', async () => {
    const E = await boot();
    const seen = [];
    E.onSaveHealth(h => seen.push(h.level));
    fillUp();
    for (let i = 0; i < 5; i++) E.record('intervals', 'P5:up', true);
    await tick();
    expect(seen).toEqual(['failing']);
    expect(E.saveHealth()).toMatchObject({ level: 'failing', error: 'storage full' });
  });
  it('still reaches IndexedDB when localStorage is full', async () => {
    globalThis.indexedDB = fakeIndexedDB();
    const E = await boot();
    fillUp();
    E.record('chords', 'maj', true);
    await vi.waitFor(() => expect(globalThis.indexedDB.data.has(LS_KEY)).toBe(true));
    await tick(); // the transaction completes after the write
    expect(E.saveHealth().level).toBe('idb-only');
    const saved = JSON.parse(globalThis.indexedDB.data.get(LS_KEY));
    expect(saved.skills.chords.items.maj.n).toBe(1);
  });
  it('clears as soon as a save goes through again', async () => {
    const E = await boot();
    const seen = [];
    E.onSaveHealth(h => seen.push(h.level));
    fillUp();
    E.record('chords', 'maj', true);
    await tick();
    localStorage.setItem = realSet;
    E.record('chords', 'maj', true);
    expect(seen).toEqual(['failing', 'ok']);
    expect(JSON.parse(localStorage.getItem(LS_KEY)).skills.chords.items.maj.n).toBe(2);
  });
  it('asks for a backup file after a day without a successful save', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-20T10:00:00'));
    const E = await boot();
    fillUp();
    E.record('chords', 'maj', true);
    expect(E.saveHealth().stale).toBe(false);
    vi.setSystemTime(new Date('2026-10-21T11:00:00'));
    E.record('chords', 'maj', true);
    await tick();
    expect(E.saveHealth()).toMatchObject({ level: 'failing', stale: true });
  });
});

describe('loading a save from every past format', () => {
  it('schema 1 (before per-device history): everything is kept and migrated', async () => {
    const old = JSON.parse(fixture(1));
    localStorage.setItem(LS_KEY, fixture(1));
    const E = await boot();
    const s = E.state;
    expect(s.schema).toBe(SCHEMA);
    expect(s.skills).toEqual(old.skills);
    expect(s.hdev.legacy['2025-10-18']).toMatchObject({ sec: 1200, q: 14, c: 11 });
    expect(s.history['2025-10-18'].mastery).toEqual({ intervals: 12 });
    expect(s.tech.altpick.best).toBe(92);
    expect(s.anchors['P5:up']).toBe('Star Wars theme');
    expect(s.songs.sg1.sections).toHaveLength(1);
    expect(s.routines[0].name).toBe('Mornings');
    expect(s.journal[0].note).toBe('Felt good');
    expect(Object.values(s.readLib.pieces).map(p => p.no).sort()).toEqual([1, 2]);
    Object.keys(s.readLib.pieces).forEach(id => expect(id).toMatch(/^p.{6}\d+$/));
    expect(s.settings).toMatchObject({ tuning: 'dropd', capo: 2, focus: 'jazz', latencyMs: 35 });
    expect(E.STRINGS[0].midi).toBe(38 + 2); // drop D with a capo on 2, applied on load
  });
  it('schema 2 (before your own tunes): everything is kept, with an empty tune list', async () => {
    const saved = JSON.parse(fixture(2));
    localStorage.setItem(LS_KEY, fixture(2));
    const E = await boot();
    const s = E.state;
    expect(s.schema).toBe(SCHEMA);
    expect(s.hdev).toEqual(saved.hdev);
    expect(s.cur.prefs.styles).toEqual(['flamenco', 'jazz']);
    // the same pieces; the level each sits at moved to the 36-step reading path (schema 8)
    const moved = { 1: 2, 2: 3, 3: 7, 4: 10, 5: 11, 6: 9, 7: 13, 8: 16, 9: 18, 10: 19, 11: 23, 12: 20, 13: 24, 14: 31, 15: 32, 16: 36 };
    expect(s.readLib.pieces).toEqual(Object.fromEntries(Object.entries(saved.readLib.pieces).map(([id, p]) => [id, Object.assign({}, p, { lv: moved[p.lv] || p.lv })])));
    expect(s.history['2025-10-20'].sec).toBe(600);
    expect(s.tunes).toEqual({});
    expect(E.listTunes()).toEqual([]);
  });
  it('schema 3 (before time on each scale): your tunes and their deletions are kept, with no scale time yet', async () => {
    const saved = JSON.parse(fixture(3));
    localStorage.setItem(LS_KEY, fixture(3));
    const E = await boot();
    const s = E.state;
    expect(s.schema).toBe(SCHEMA);
    expect(s.skills).toEqual(saved.skills);
    expect(s.tunes).toEqual(saved.tunes);
    expect(s.tomb['tune:my-ab12mgx0aa']).toBe(1760870000000);
    expect(E.listTunes().map(t => t.name)).toEqual(['Montuno sketch', 'Rainy-day blues']);
    expect(E.getTune('my-ab12mgx1k2').form).toEqual([['A', 4], ['B', 4], ['C', 4]]);
    expect(s.scaleTime).toEqual({});
  });
  it('schema 4 (before personal bests): time on each scale from every device is kept, with no bests yet', async () => {
    const saved = JSON.parse(fixture(4));
    localStorage.setItem(LS_KEY, fixture(4));
    const E = await boot();
    const s = E.state;
    expect(s.schema).toBe(SCHEMA);
    expect(s.skills).toEqual(saved.skills);
    expect(s.tunes).toEqual(saved.tunes);
    expect(s.scaleTime).toEqual(saved.scaleTime);
    E.addScaleTime('v', 'major', 7, 10);
    expect(s.scaleTime.d9f3k2a['major:7'].v).toBe(640); // another device's time is never touched
    expect(s.scaleTime[E.device()]['major:7'].v).toBe(10);
    expect(s.records).toEqual({});
  });
  it('schema 5 (before the Library): loads as it was saved, the best streaks and the growing goal included, with an empty library', async () => {
    const saved = JSON.parse(fixture(5));
    localStorage.setItem(LS_KEY, fixture(5));
    const E = await boot();
    const s = E.state;
    expect(s.schema).toBe(SCHEMA);
    expect(s.scaleTime).toEqual(saved.scaleTime);
    expect(s.records).toEqual({ streak: 41, goalStreak: 12 });
    expect(s.cur.prefs).toMatchObject({ goal: 90, goalTarget: 240, streakRule: 10 });
    expect(E.streaks()).toMatchObject({ best: 41, goalBest: 12 }); // kept though the history no longer shows them
    expect(s.library).toEqual({});
  });
  it('schema 6 (before melodies): the Library loads as it was saved, deletions included, with no melodies', async () => {
    const saved = JSON.parse(fixture(6));
    localStorage.setItem(LS_KEY, fixture(6));
    const E = await boot();
    const s = E.state;
    expect(s.schema).toBe(SCHEMA);
    expect(s.library).toEqual(saved.library);
    expect(s.tomb).toMatchObject({ 'lib:lbold': 1760300000000, 'libfile:lfgone': 1760300000000 });
    expect(E.listLibrary().map(e => e.title).sort()).toEqual(['Asturias', 'Blackbird']);
    expect(s.records).toEqual({ streak: 41, goalStreak: 12 });
    expect(s.melodies).toEqual({});
  });
  it('schema 7 (before the 36-step reading path): a melody added to a tune loads as it was saved, a removed one stays removed', async () => {
    const saved = JSON.parse(fixture(7));
    localStorage.setItem(LS_KEY, fixture(7));
    const E = await boot();
    const s = E.state;
    expect(s.schema).toBe(SCHEMA);
    expect(s.melodies).toEqual(saved.melodies);
    expect(E.getMelody('autumn').name).toBe('Autumn Leaves.mxl');
    expect(E.getMelody('solar')).toBe(null);
    expect(s.library).toEqual(saved.library);
    expect(Object.values(s.readLib.pieces).map(p => p.lv)).toEqual([2, 2]); // old level 1 is level 2 now
  });
  it('schema 8 (before the positions up the neck): sight-reading progress, settings and kept pieces with chords and triplets load as saved', async () => {
    const saved = JSON.parse(fixture(8));
    localStorage.setItem(LS_KEY, fixture(8));
    const E = await boot();
    const s = E.state;
    expect(s.schema).toBe(SCHEMA);
    expect(s.skills.reading).toEqual(saved.skills.reading);
    expect(s.readLib).toEqual(saved.readLib);
    expect(s.settings).toMatchObject({ readingBpm: { m25: 58, r28: 64 }, readingLen: { m: 16, r: 4 }, readingRunOn: true, readingPaper: true });
    expect(s.melodies).toEqual(saved.melodies);
  });
  it('schema 9 (before the band charts): progress on the positions up the neck and the score you sight-read load as saved', async () => {
    const saved = JSON.parse(fixture(9));
    localStorage.setItem(LS_KEY, fixture(9));
    const E = await boot();
    const s = E.state;
    expect(s.schema).toBe(SCHEMA);
    const items = s.skills.reading.items, was = saved.skills.reading.items;
    expect(items['L33:melody']).toEqual(was['L33:melody']);
    expect(items['L44:rhythm']).toEqual(was['L40:rhythm']); // Everything is 44 since schema 10
    expect(items['L41:rhythm']).toEqual(was['L40:rhythm']); // and the band-chart steps below it take its record
    expect(s.readLib).toEqual(saved.readLib);
    expect(s.settings).toMatchObject({ readingBpm: { m25: 58, r28: 64, m33: 54 }, readingOwn: { per: 4, entry: 'lb1', file: 'lf1', from: 1 } });
  });
  it('schema 10 (before game mode): band-chart progress and a kept chord chart with repeats and accents load as saved', async () => {
    const saved = JSON.parse(fixture(10));
    localStorage.setItem(LS_KEY, fixture(10));
    const E = await boot();
    const s = E.state;
    expect(s.schema).toBe(SCHEMA);
    expect(s.skills.reading).toEqual(saved.skills.reading);
    expect(s.readLib).toEqual(saved.readLib);
    expect(s.settings.readingBpm).toMatchObject({ m42: 66 });
    const RL = (await import('../src/readlib.js')).default;
    const chart = RL.decode(s.readLib.pieces.zz1.code);
    expect(chart.repeat).toEqual([0, 1]);
    expect(chart.chords).toEqual([[{ text: 'Am7', at: 0 }], [{ text: 'G', at: 0 }, { text: 'C', at: 2 }]]);
    expect(chart.bars[0][0]).toMatchObject({ slash: true, acc: true, dur: '8' });
    expect(chart.bars[0][3]).toMatchObject({ slash: true, stac: true });
    expect(s.games).toEqual({});
  });
  it('schema 11 (current): the high scores of both games, from two devices, load as saved', async () => {
    const saved = JSON.parse(fixture(11));
    localStorage.setItem(LS_KEY, fixture(11));
    const E = await boot();
    const s = E.state;
    expect(s.schema).toBe(SCHEMA);
    expect(s.games).toEqual(saved.games);
    expect(E.gameScores('tower').map(x => x.s)).toEqual([420, 130]);
    expect(E.gameScores('updraft')[0]).toMatchObject({ ex: 'pos-and', bpm: 72 });
  });
  it('a save that cannot be read leaves a fresh start, and does not throw', async () => {
    localStorage.setItem(LS_KEY, '{not json');
    const E = await boot();
    expect(E.state.skills).toEqual({});
  });
});
