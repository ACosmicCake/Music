import { describe, it, expect } from 'vitest';
import D from '../src/data.js';
import { loadEssays, loadScience } from '../src/content/lazy.js';

/* Long-form content loaded on demand (src/content/lazy.js) still reaches the shared data. */

describe('on-demand content', () => {
  it('is not in the first download', () => {
    expect(D.REGIONS.some(r => r.essay)).toBe(false);
    expect(D.SCIENCE).toBeNull();
  });
  it('attaches every essay to a style that exists', async () => {
    await loadEssays();
    expect(loadEssays.done()).toBe(true);
    const withEssay = D.REGIONS.filter(r => r.essay);
    expect(withEssay.length).toBeGreaterThan(20);
    withEssay.forEach(r => expect(typeof r.essay.thesis, r.id).toBe('string'));
    const ids = new Set(D.REGIONS.map(r => r.id));
    const all = await Promise.all([1, 2, 3, 4, 5, 6].map(i => import(`../src/content/essays-${i}.js`)));
    all.forEach(m => Object.keys(m.default).forEach(id => expect(ids.has(id), id).toBe(true)));
  });
  it('loads the science page with its sources', async () => {
    await loadScience();
    expect(D.SCIENCE.length).toBeGreaterThan(5);
    D.SCIENCE.forEach(x => { expect(x.title).toBeTruthy(); expect(x.sources.length, x.title).toBeGreaterThan(0); });
  });
});
