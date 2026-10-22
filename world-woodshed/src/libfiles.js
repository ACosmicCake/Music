/* World Woodshed — the Library's files, kept on this device only (IndexedDB database 'world-woodshed-library').
   A score PDF or a few phone photos of a score run to tens of megabytes. The saved state lives in localStorage
   (about 5 MB in all) and travels whole in every sync file, GitHub push, cloud save and backup, so the files
   never go there: only their names and sizes do (state.library, src/engine.js). Each record is
   { blob, name, type, size, entry, thumb } under the file's id; thumb is a small JPEG for image files. */
let dbp = null;
function open() {
  if (dbp) return dbp;
  dbp = new Promise((res, rej) => {
    try {
      const r = indexedDB.open('world-woodshed-library', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('files');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    } catch (e) { rej(e); }
  });
  dbp.catch(() => { dbp = null; });
  return dbp;
}
async function tx(mode, fn) {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction('files', mode);
    const req = fn(t.objectStore('files'));
    t.oncomplete = () => res(req && req.result);
    t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
  });
}

export const putFile = (id, rec) => tx('readwrite', st => st.put(rec, id)).then(() => true).catch(() => false);
export const getFile = id => tx('readonly', st => st.get(id)).then(r => r || null).catch(() => null);
export const delFile = id => tx('readwrite', st => st.delete(id)).then(() => true).catch(() => false);
/* the ids of the files on this device */
export const localIds = () => tx('readonly', st => st.getAllKeys()).then(k => new Set(k || [])).catch(() => new Set());

/* A small JPEG of an image, for the list and the page strip; null if the browser can't decode it */
export async function thumbnail(blob, size = 240) {
  try {
    if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return null;
    const bmp = await createImageBitmap(blob);
    const k = Math.min(1, size / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(bmp.width * k)); c.height = Math.max(1, Math.round(bmp.height * k));
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const dims = { w: bmp.width, h: bmp.height };
    if (bmp.close) bmp.close();
    const out = await new Promise(res => c.toBlob(res, 'image/jpeg', 0.75));
    return out ? Object.assign({ blob: out }, dims) : null;
  } catch (e) { return null; }
}
