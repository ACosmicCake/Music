import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { SAMPLE_SETS, SAMPLE_SOURCES } from '../src/content/samples.js';
import { INSTRUMENTS, SOURCES } from '../scripts/samples/recipes.mjs';

/* The sampled instruments (src/content/samples.js, built by scripts/samples/build.mjs): every file the
   app may fetch exists, is a mono 44.1 kHz MP3, and comes from a credited CC0 or CC-BY source. */

const DIR = new URL('../public/samples/', import.meta.url);
const licences = readFileSync(new URL('LICENSES.md', DIR), 'utf8');

/* The first MPEG audio frame header: sample rate and channel mode (MPEG-1 Layer III) */
function mp3Info(buf) {
  let i = 0;
  if (buf.toString('latin1', 0, 3) === 'ID3') i = 10 + ((buf[6] & 0x7f) << 21 | (buf[7] & 0x7f) << 14 | (buf[8] & 0x7f) << 7 | (buf[9] & 0x7f));
  while (i < buf.length - 4 && !(buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0)) i++;
  const b1 = buf[i + 1], b2 = buf[i + 2], b3 = buf[i + 3];
  const version = (b1 >> 3) & 3, layer = (b1 >> 1) & 3;
  const rate = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] }[version][(b2 >> 2) & 3];
  return { mpeg1Layer3: version === 3 && layer === 1, rate, mono: (b3 >> 6) === 3 };
}

describe('sample manifest', () => {
  const sets = Object.entries(SAMPLE_SETS);
  it('has instruments', () => expect(sets.length).toBeGreaterThan(0));

  sets.forEach(([id, set]) => describe(id, () => {
    it('has every file, at the size the manifest says', () => {
      set.files.forEach(([name, , , , bytes]) => {
        const p = new URL(id + '/' + name, DIR);
        expect(existsSync(p), name).toBe(true);
        expect(statSync(p).size, name).toBe(bytes);
      });
      expect(set.bytes).toBe(set.files.reduce((a, f) => a + f[4], 0));
    });
    it('has nothing in its folder that the manifest leaves out', () => {
      const listed = new Set(set.files.map(f => f[0]));
      readdirSync(new URL(id + '/', DIR)).forEach(n => expect(listed.has(n), n).toBe(true));
    });
    it('is mono 44.1 kHz MP3', () => {
      set.files.forEach(([name]) => {
        const info = mp3Info(readFileSync(new URL(id + '/' + name, DIR)));
        expect(info, name).toEqual({ mpeg1Layer3: true, rate: 44100, mono: true });
      });
    });
    it('comes from a CC0 or CC-BY source credited in LICENSES.md', () => {
      const src = SAMPLE_SOURCES[set.source];
      expect(src, set.source).toBeTruthy();
      expect(src.licence).toMatch(/^(CC0-1\.0|CC-BY-[\d.]+)$/);
      expect(licences).toMatch(new RegExp('^## ' + id + ' — ', 'm'));
      expect(licences).toContain(src.commit);
      expect(licences).toContain(src.url);
    });
    it('matches its recipe', () => {
      const recipe = INSTRUMENTS.find(x => x.id === id);
      expect(recipe).toBeTruthy();
      expect(set.files.length).toBe(recipe.files.length);
      expect(SOURCES[recipe.source]).toEqual(SAMPLE_SOURCES[set.source]);
    });
    it('is sampled closely enough to shift no note far', () => {
      const roots = [...new Set(set.files.map(f => f[1]))].sort((a, b) => a - b);
      for (let i = 1; i < roots.length; i++) expect(roots[i] - roots[i - 1], id + ' gap at ' + roots[i]).toBeLessThanOrEqual(4);
    });
    it('has velocity layers and round-robins where the source has them', () => {
      const recipe = INSTRUMENTS.find(x => x.id === id);
      // a single dynamic only with a reason (the library recorded one)
      if (recipe.oneLayer) expect(recipe.oneLayer.length).toBeGreaterThan(20); else expect(set.layers).toBeGreaterThanOrEqual(2);
      if (set.layerGain) expect(set.layerGain).toHaveLength(set.layers);
    });
  }));

  it('stays far below the 500 MB ceiling', () => {
    const total = sets.reduce((a, [, s]) => a + s.bytes, 0);
    expect(total).toBeLessThan(500e6);
  });
  it('credits only sources that are used, and every folder is an instrument', () => {
    Object.keys(SAMPLE_SOURCES).forEach(k => expect(sets.some(([, s]) => s.source === k), k).toBe(true));
    readdirSync(DIR, { withFileTypes: true }).filter(d => d.isDirectory()).forEach(d => expect(SAMPLE_SETS[d.name], d.name).toBeTruthy());
  });
});
