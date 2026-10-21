/* World Woodshed — one quiet banner when progress is not reaching this device's storage.
   Shown only while the main copy (localStorage) is failing: either the second copy (IndexedDB) still has it,
   or nothing is being saved. After a day without a successful save it also offers a backup file.
   It never repeats per save, and "Hide" keeps it away until things get worse. */
import E from '../engine.js';
import { h, toast } from './core.js';
import { shareFile } from '../native.js';

const RANK = { ok: 0, 'idb-only': 1, failing: 2 };

export function initSaveBanner() {
  const el = h('div', { class: 'save-banner', role: 'status', hidden: true });
  document.querySelector('.topbar').after(el);
  let hiddenAt = -1; // the level the player hid; a worse level shows again

  async function exportFile() {
    const name = 'world-woodshed-backup-' + E.dayKey() + '.json';
    try {
      const how = await shareFile(name, JSON.stringify(E.exportBackup()), 'World Woodshed progress');
      if (how === 'downloaded') toast('Saved ' + name + '. Keep it somewhere safe; load it from Today → Your progress on every device.');
    } catch (e) { toast('Could not make the backup file'); }
  }
  function draw(st) {
    const rank = RANK[st.level] + (st.stale ? 1 : 0);
    el.innerHTML = '';
    if (st.level === 'ok' || rank <= hiddenAt) { el.hidden = true; return; }
    const why = st.error ? ' (' + st.error + ')' : '';
    const text = st.level === 'idb-only'
      ? 'This device’s main storage is not saving' + why + '. Your progress is going to the backup copy instead.'
      : 'Progress is not being saved on this device' + why + '. Export a backup file so nothing is lost.';
    const since = st.stale ? ' Last saved ' + new Date(st.lastOk).toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' }) + '.' : '';
    el.append(h('span', { text: text + since }),
      st.level === 'failing' || st.stale ? h('button', { class: 'btn small brass', onclick: exportFile }, 'Export a backup') : '',
      h('button', { class: 'btn small ghost', onclick: () => { hiddenAt = rank; el.hidden = true; } }, 'Hide'));
    el.hidden = false;
  }
  E.onSaveHealth(draw);
  draw(E.saveHealth());
}
