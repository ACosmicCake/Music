import './env.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fakeIndexedDB } from './fakeidb.js';

/* The Library (src/library.js): what kind each file is, making an entry from another device safe to show,
   search and sort, and adding, reading, reordering and deleting files kept in IndexedDB on this device. */

let E, L, idb;
beforeEach(async () => {
  localStorage.clear();
  idb = globalThis.indexedDB = fakeIndexedDB();
  vi.resetModules();
  E = (await import('../src/engine.js')).default;
  L = await import('../src/library.js');
});

describe('files', () => {
  it('knows score formats, photos and the notation tool\'s own file by name, or by type when the name says nothing', () => {
    expect(L.fileKind('Asturias.pdf')).toBe('pdf');
    expect(L.fileKind('IMG_2041.JPG')).toBe('image');
    expect(L.fileKind('tune.musicxml')).toBe('musicxml');
    expect(L.fileKind('tune.mxl')).toBe('musicxml');
    expect(L.fileKind('tune.mscz')).toBe('musescore');
    expect(L.fileKind('solo.gp5')).toBe('guitarpro');
    expect(L.fileKind('riff.mid')).toBe('midi');
    expect(L.fileKind('riff.wwscore.json')).toBe('wwscore');
    expect(L.fileKind('scan', 'image/png')).toBe('image');
    expect(L.fileKind('download', 'application/pdf')).toBe('pdf');
    expect(L.fileKind('notes.json')).toBe('other');
    expect(L.mimeOf('tune.mxl', '')).toBe('application/vnd.recordare.musicxml');
    expect(L.mimeOf('tune.mscz', '')).toBe('application/x-musescore');
    expect(L.mimeOf('a.pdf', 'application/pdf')).toBe('application/pdf');
    expect(L.sizeLabel(512)).toBe('512 B');
    expect(L.sizeLabel(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });
});

describe('entries', () => {
  it('an entry from another device or a backup is made safe to show', () => {
    const e = L.cleanEntry({ id: 'x', title: '  ', status: 'mastered', link: 'javascript:alert(1)', notes: 5, by: { a: 1 },
      files: [{ id: 'f1', name: 'a.pdf', size: -3 }, { name: 'no id' }, 'junk', null] });
    expect(e).toMatchObject({ id: 'x', title: 'Untitled', status: 'learning', link: '', notes: '5', by: '' });
    expect(e.files).toEqual([expect.objectContaining({ id: 'f1', name: 'a.pdf', size: 0, kind: 'pdf' })]);
    expect(L.cleanEntry({ title: 'no id' })).toBeNull();
    expect(L.cleanEntry('junk')).toBeNull();
    expect(L.cleanEntry({ id: 'y', link: ' https://example.com/x ' }).link).toBe('https://example.com/x');
  });
  it('keeps the day a song was first marked learned', () => {
    const e = L.withStatus({ status: 'learning', learned: 0 }, 'learned', 1000);
    expect(e).toMatchObject({ status: 'learned', learned: 1000 });
    expect(L.withStatus(L.withStatus(e, 'learning', 2000), 'learned', 3000).learned).toBe(1000);
    expect(L.withStatus(e, 'nonsense')).toBe(e);
  });
  it('finds entries by any word of the title, composer, notes or file names, ignoring accents and case', () => {
    const e = { title: 'Asturias', by: 'Isaac Albéniz', notes: 'Leyenda, tremolo section', files: [{ name: 'page1.jpg' }] };
    expect(L.matches(e, 'albeniz')).toBe(true);
    expect(L.matches(e, 'TREMOLO asturias')).toBe(true);
    expect(L.matches(e, 'page1')).toBe(true);
    expect(L.matches(e, 'bach')).toBe(false);
    expect(L.matches(e, '  ')).toBe(true);
  });
  it('sorts by last change, title or composer (no composer last), and counts each status', () => {
    const list = [{ title: 'b', by: '', updatedAt: 3, status: 'learned' }, { title: 'A', by: 'Zed', updatedAt: 1, status: 'want' }, { title: 'c', by: 'Bach', updatedAt: 2, status: 'learned' }];
    expect(L.sortEntries(list).map(e => e.title)).toEqual(['b', 'c', 'A']);
    expect(L.sortEntries(list, 'title').map(e => e.title)).toEqual(['A', 'b', 'c']);
    expect(L.sortEntries(list, 'by').map(e => e.title)).toEqual(['c', 'A', 'b']);
    expect(L.countBy(list)).toEqual({ all: 3, want: 1, learning: 0, learned: 2 });
  });
});

describe('storing files on this device', () => {
  const blob = (text, type = '') => new Blob([text], { type });
  it('adds an entry with its files; the details go in the state, the files in IndexedDB', async () => {
    const id = await L.addToLibrary({ title: 'Riff', source: 'notation', files: [{ blob: blob('<score/>'), name: 'riff.musicxml' }, new File(['MThd'], 'riff.mid', { type: 'audio/midi' })] });
    const e = L.getEntry(id);
    expect(e).toMatchObject({ title: 'Riff', source: 'notation', status: 'learning' });
    expect(e.files.map(f => [f.name, f.kind, f.size])).toEqual([['riff.musicxml', 'musicxml', 8], ['riff.mid', 'midi', 4]]);
    expect(JSON.stringify(E.state)).not.toContain('<score/>'); // never in the saved state
    const got = await L.getFile(e.files[0].id);
    expect(got.name).toBe('riff.musicxml');
    expect(got.type).toBe('application/vnd.recordare.musicxml+xml');
    expect(await got.blob.text()).toBe('<score/>');
    expect(await L.getFile('lf-from-another-device')).toBeNull();
  });
  it('turns away what it cannot keep and says why, adding the rest', async () => {
    const id = await L.addToLibrary({ title: 'x' });
    const r = await L.addFiles(id, [{ name: 'nothing' }, blob('ok')]);
    expect(r.added).toBe(1);
    expect(r.failed).toEqual([['nothing', 'not a file']]);
    expect((await L.addFiles('no-such-entry', [blob('a')])).failed[0][1]).toMatch(/deleted/);
  });
  it('replaces a file whose content changed in the same place, moving its section tempos', async () => {
    const id = await L.addToLibrary({ title: 'Read', files: [new File(['p'], 'p1.jpg'), { blob: blob('<old/>'), name: 'Read (notes read).musicxml' }] });
    const old = L.getEntry(id).files[1].id;
    L.markClean(id, old, 1, 4, 80, 100);
    const nid = await L.replaceFile(id, old, blob('<new/>', 'application/vnd.recordare.musicxml+xml'));
    expect(nid).not.toBe(old);
    const e = L.getEntry(id);
    expect(e.files.map(f => f.name)).toEqual(['p1.jpg', 'Read (notes read).musicxml']);
    expect(e.files[1].id).toBe(nid);
    expect(await (await L.getFile(nid)).blob.text()).toBe('<new/>');
    expect(await L.getFile(old)).toBeNull();
    expect(E.state.tomb['libfile:' + old]).toBeGreaterThan(0);
    expect(L.sectionTempos(id, nid)).toHaveLength(1);
    expect(await L.replaceFile(id, 'nope', blob('x'))).toBeNull();
  });
  it('orders photos among photos, and other files among other files', async () => {
    const id = await L.addToLibrary({ title: 'x', files: [new File(['1'], 'p1.jpg'), new File(['s'], 's.pdf'), new File(['2'], 'p2.jpg')] });
    const ids = () => L.getEntry(id).files.map(f => f.name);
    const p2 = L.getEntry(id).files[2].id;
    L.moveFile(id, p2, -1);
    expect(ids()).toEqual(['p2.jpg', 's.pdf', 'p1.jpg']);
    L.moveFile(id, p2, -1); // already the first page
    expect(ids()).toEqual(['p2.jpg', 's.pdf', 'p1.jpg']);
  });
  it('removing a file or deleting an entry frees the space and leaves a tombstone for the other devices', async () => {
    const id = await L.addToLibrary({ title: 'x', files: [new File(['1'], 'a.jpg'), new File(['2'], 'b.pdf')] });
    const [a, b] = L.getEntry(id).files.map(f => f.id);
    await L.removeFile(id, a);
    expect(L.getEntry(id).files.map(f => f.id)).toEqual([b]);
    expect(idb.data.has(a)).toBe(false);
    expect(E.state.tomb['libfile:' + a]).toBeGreaterThan(0);
    await L.deleteEntry(id);
    expect(L.getEntry(id)).toBeNull();
    expect(idb.data.size).toBe(0);
    expect(E.state.tomb['lib:' + id]).toBeGreaterThan(0);
  });
  it('lets go of files deleted on another device', async () => {
    const id = await L.addToLibrary({ title: 'x', files: [new File(['1'], 'a.jpg'), new File(['2'], 'b.jpg')] });
    const [a] = L.getEntry(id).files.map(f => f.id);
    E.tombstone('libfile:' + a);
    expect(await L.prune()).toBe(1);
    expect(idb.data.size).toBe(1);
    delete E.state.library[id]; E.tombstone('lib:' + id); // the entry deleted on another device, merged in
    expect(await L.prune()).toBe(1);
    expect(idb.data.size).toBe(0);
  });
  it('an edit keeps the files, and a bad link is not saved', async () => {
    const id = await L.addToLibrary({ title: 'x', files: [new File(['1'], 'a.jpg')] });
    L.updateEntry(id, { title: '  ', by: 'Me', link: 'data:text/html,hi', notes: 'n', status: 'learned' });
    expect(L.getEntry(id)).toMatchObject({ title: 'Untitled', by: 'Me', link: '', notes: 'n', status: 'learned' });
    expect(L.getEntry(id).learned).toBeGreaterThan(0);
    expect(L.getEntry(id).files).toHaveLength(1);
  });
});

describe('how fast you can play each section', () => {
  it('keeps the fastest clean tempo per file and bar range, and lists them in bar order', () => {
    const id = E.saveLibEntry(L.newEntry({ title: 'Étude' })).id;
    expect(L.sectionTempos(id, 'f1')).toEqual([]);
    L.markClean(id, 'f1', 9, 16, 72, 120, 1000);
    L.markClean(id, 'f1', 9, 16, 66, 120, 2000); // slower: the best stays
    L.markClean(id, 'f1', 1, 8, 100.4, 120, 3000);
    L.markClean(id, 'f2', 1, 8, 50, 90, 3000);
    expect(L.sectionTempos(id, 'f1')).toEqual([
      { from: 1, to: 8, best: 100, of: 120, t: 3000 },
      { from: 9, to: 16, best: 72, of: 120, t: 2000 }
    ]);
    expect(L.sectionTempos(id, 'f2')).toEqual([{ from: 1, to: 8, best: 50, of: 90, t: 3000 }]);
    // the details shown for the entry are untouched
    expect(L.getEntry(id).title).toBe('Étude');
  });
  it('ignores a missing entry or no tempo', () => {
    expect(L.markClean('nope', 'f1', 1, 4, 80, 120)).toBeNull();
    const id = E.saveLibEntry(L.newEntry({ title: 'x' })).id;
    expect(L.markClean(id, 'f1', 1, 4, 0, 120)).toBeNull();
  });
});
