/* Just enough of a browser for engine.js and the modules built on it to load in Node:
   an in-memory localStorage and a document that accepts listeners. IndexedDB is absent,
   which engine.js already treats as "unavailable" and skips. Import this first. */
const store = new Map();
globalThis.localStorage = {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => { store.set(k, String(v)); },
  removeItem: k => { store.delete(k); },
  clear: () => store.clear()
};
if (!globalThis.document) globalThis.document = { addEventListener() {}, visibilityState: 'visible' };
