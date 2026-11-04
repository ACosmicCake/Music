import { describe, it, expect } from 'vitest';
import { kyamName, kyamNames } from '../src/kyam.js';
import DRILLS from '../src/content/drills-vn.js';
import D from '../src/data.js';

const LAI = [33, 38, 43, 50, 57, 62]; // dây Lai, low to high (daylai in src/engine.js)

describe('ký âm names', () => {
  it('names hơi Bắc from hò, with the octave names', () => {
    expect([62, 64, 67, 69, 71, 74, 76, 79, 81].map(m => kyamName(m, 62))).toEqual(['hò', 'xự', 'xang', 'xê', 'cống', 'liu', 'ú', 'xáng', 'xế']);
    expect(kyamName(57, 62)).toBe('xề');
    expect(kyamName(63, 62)).toBe('');
  });
  it('names hơi Nam as guitar teachers write it, with a mark for pressed and shaken notes', () => {
    expect([62, 65, 67, 69, 70, 72].map(m => kyamName(m, 62, 'nam'))).toEqual(['hò', 'xự', 'xang', 'xê', 'cống', 'oan']);
    expect(kyamNames([{ m: 65, up: 0.5 }, { m: 67, rung: true }, { m: null }], 62, 'nam')).toEqual(['xự↗', 'xang~', '']);
  });
});

describe('vọng cổ guitar drills', () => {
  it('are on dây Lai, which the app knows', async () => {
    const E = (await import('./env.js'), await import('../src/engine.js')).default;
    expect(E.TUNINGS.find(t => t.id === 'daylai').midi).toEqual(LAI);
    for (const d of DRILLS) expect(d.tuning, d.id).toBe('daylai');
  });
  it('give one tab place per struck note, on the fret that sounds that note', () => {
    for (const d of DRILLS) for (const v of d.variations) {
      if (!v.bars || !v.tab) continue;
      const struck = v.bars.flat().filter(n => n.m != null);
      expect(v.tab.length, d.id + ' ' + v.name).toBe(struck.length);
      struck.forEach((n, k) => { const [s, f] = v.tab[k]; expect(LAI[6 - s] + f, d.id + ' ' + v.name + ' note ' + (k + 1)).toBe(n.m); });
    }
  });
  it('name every note they play, and their own names cover the phrase', () => {
    for (const d of DRILLS) for (const v of d.variations) {
      if (!v.bars) continue;
      const flat = v.bars.flat();
      if (v.names) { expect(v.names.trim().split(/\s+/).length, d.id + ' ' + v.name).toBe(flat.length); continue; }
      kyamNames(flat, v.ho ?? d.ho, v.hoi || d.hoi).forEach((t, i) => { if (flat[i].m != null && flat[i].m >= 57) expect(t, d.id + ' ' + v.name + ' note ' + (i + 1)).not.toBe(''); });
    }
  });
  it('point the style page and the lessons at things that exist', () => {
    const st = D.REGIONS.find(r => r.id === 'vietnam');
    expect(st).toBeTruthy();
    for (const l of D.LESSONS.filter(x => (x.styles || []).includes('vietnam'))) expect(l.level).toBe('World traditions');
    expect(D.GROOVES.songlang).toBeTruthy();
    expect(D.SCALES.some(s => s.id === 'hoinam')).toBe(true);
  });
});
