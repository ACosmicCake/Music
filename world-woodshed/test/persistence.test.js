import './env.js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { SCHEMA } from '../src/sync.js';

/* Saving and loading progress (src/engine.js): a failed save is noticed once, still reaches the
   second copy, and every past save format loads into the current app without losing anything. */

const LS_KEY = 'world-woodshed-v1';
const fixture = n => readFileSync(new URL('./fixtures/save-schema-' + n + '.json', import.meta.url), 'utf8');

/* A minimal IndexedDB: one object store kept in memory, answering asynchronously like the real one */
function fakeIndexedDB() {
  const data = new Map();
  const later = fn => setTimeout(fn, 0);
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
afterEach(() => { localStorage.setItem = realSet; delete globalThis.indexedDB; vi.useRealTimers(); });
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
    await tick();
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
  it('schema 2 (current): loads as it was saved', async () => {
    const saved = JSON.parse(fixture(2));
    localStorage.setItem(LS_KEY, fixture(2));
    const E = await boot();
    const s = E.state;
    expect(s.schema).toBe(SCHEMA);
    expect(s.hdev).toEqual(saved.hdev);
    expect(s.cur.prefs.styles).toEqual(['flamenco', 'jazz']);
    expect(s.readLib.pieces).toEqual(saved.readLib.pieces);
    expect(s.history['2025-10-20'].sec).toBe(600);
  });
  it('a save that cannot be read leaves a fresh start, and does not throw', async () => {
    localStorage.setItem(LS_KEY, '{not json');
    const E = await boot();
    expect(E.state.skills).toEqual({});
  });
});
