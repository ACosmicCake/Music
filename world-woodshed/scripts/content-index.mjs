/* Vite plugin: `virtual:content-index`, the short fields of the long-form content, worked out at build time.
   The planner, lists and pickers need each technique guide's, style drill's and lesson's id, name and
   style straight away; the long texts are only read when one is opened. So the app bundles this index
   and fetches the full files on demand (src/content/lazy.js merges them into the same objects).
   Edit the content files as usual: the index is rebuilt from them on every build and dev reload. */
import { fileURLToPath } from 'node:url';

const ID = 'virtual:content-index', RID = '\0' + ID;
const FILES = {
  techniques: ['techniques-a.js', 'techniques-b.js'],
  drills: ['drills-a.js', 'drills-b.js'],
  lessons: ['lessons.js']
};
// the fields kept in the index; everything else stays in the on-demand chunk
export const INDEX_FIELDS = {
  techniques: ['id', 'name', 'family', 'styles', 'summary'],
  drills: ['id', 'style', 'name', 'focus', 'level', 'minutes', 'goal', 'tempo', 'backing'],
  lessons: ['id', 'level', 'minutes', 'title', 'summary']
};
const dir = new URL('../src/content/', import.meta.url);

export async function buildIndex(fresh = false) {
  const out = {};
  for (const [kind, files] of Object.entries(FILES)) {
    out[kind] = [];
    for (const f of files) {
      const url = new URL(f, dir).href + (fresh ? '?t=' + Date.now() : '');
      const list = (await import(url)).default;
      list.forEach(x => out[kind].push(Object.fromEntries(INDEX_FIELDS[kind].filter(k => k in x).map(k => [k, x[k]]))));
    }
  }
  return out;
}

export default function contentIndex() {
  return {
    name: 'content-index',
    resolveId: id => (id === ID ? RID : null),
    async load(id) {
      if (id !== RID) return null;
      Object.values(FILES).flat().forEach(f => this.addWatchFile(fileURLToPath(new URL(f, dir))));
      return 'export default ' + JSON.stringify(await buildIndex(true)) + ';';
    }
  };
}
