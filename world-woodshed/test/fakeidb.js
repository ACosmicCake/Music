/* A minimal IndexedDB with the calls src/libfiles.js makes, answering asynchronously like the real one.
   `data` is the Library's database; the engine keeps its copy of the state in another. */
export function fakeIndexedDB() {
  const dbs = new Map(), later = fn => setTimeout(fn, 0);
  const make = data => ({
    createObjectStore() {},
    transaction() {
      const tx = {};
      const done = (r, v) => { later(() => { r.result = v; tx.oncomplete && tx.oncomplete(); }); return r; };
      tx.objectStore = () => ({
        put(v, k) { data.set(k, v); return done({}, k); },
        get(k) { return done({}, data.get(k)); },
        delete(k) { data.delete(k); return done({}, undefined); },
        getAllKeys() { return done({}, [...data.keys()]); }
      });
      return tx;
    }
  });
  const store = name => { if (!dbs.has(name)) dbs.set(name, new Map()); return dbs.get(name); };
  return {
    get data() { return store('world-woodshed-library'); },
    open(name) { const r = { result: make(store(name)) }; later(() => { r.onupgradeneeded && r.onupgradeneeded(); r.onsuccess && r.onsuccess(); }); return r; }
  };
}
