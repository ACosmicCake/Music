/* World Woodshed — Transcribe, loaded the first time it is opened.
   Transcribe (src/tools/transcribe.js, with the time-stretcher) is a large module that most sessions never
   touch, so it is a separate chunk. Its songs are listed in the Library tab; this plugin registers its icon and a stand-in tool at boot,
   and opening the tool loads the real plugin, which replaces the stand-in, and then draws it. The chunk is in
   the service worker's precache, so Transcribe still opens offline. */
export const TRANSCRIBE_META = {
  tab: 'library', skill: 'transcribe', title: 'Transcribe', eyebrow: 'Learn songs by ear',
  desc: 'Load an audio or video file. Slow it down without changing pitch, loop sections, focus on the bass or melody, and find the notes.'
};

export default function transcribeLazy(UI) {
  let loading = null;
  const load = () => loading || (loading = import('./transcribe.js').then(m => { m.default(UI); }, e => { loading = null; throw e; }));
  const failed = (e, el) => {
    console.error(e);
    el.textContent = 'Transcribe could not be loaded. Check your connection and try again.';
  };

  UI.ICONS.transcribe = '<svg viewBox="0 0 24 24"><path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M21 12h0"/></svg>';
  UI.tool('transcribe', Object.assign({}, TRANSCRIBE_META, {
    render(body, ctx) {
      const runner = UI.ui.runner;
      let cleanup = null, gone = false;
      const note = UI.h('p', { class: 'muted', text: 'Loading Transcribe…' });
      body.append(note);
      load().then(() => {
        if (gone || UI.ui.runner !== runner) return;
        note.remove();
        cleanup = UI.TOOLS.transcribe.render(body, ctx);
      }, e => failed(e, note));
      return () => { gone = true; if (typeof cleanup === 'function') cleanup(); };
    }
  }));
}
