import { describe, it, expect } from 'vitest';
import { cents, pitchCents, parseScl, build, systemOf, PRESETS, stepCents, stepName, nearestStep, defaultOpen, openOf, fretTable, nearStandard, tightest, fretCsv, specKey } from '../src/xen.js';
import { fretPdf } from '../src/fretpdf.js';

describe('tuning systems', () => {
  it('reads pitches as Scala writes them', () => {
    expect(pitchCents('3/2')).toBeCloseTo(701.955, 3);
    expect(pitchCents('2')).toBeCloseTo(1200, 6);
    expect(pitchCents('146.3')).toBeCloseTo(146.3, 6);
    expect(pitchCents('x')).toBe(null);
    expect(pitchCents('0/3')).toBe(null);
  });
  it('builds Bohlen-Pierce with its names', () => {
    const bp = systemOf('bp13');
    expect(bp.steps.length).toBe(13);
    expect(bp.period).toBeCloseTo(cents(3), 6);
    expect(stepCents(bp, 1)).toBeCloseTo(146.304, 2);
    expect(stepCents(bp, 13)).toBeCloseTo(1901.955, 2);
    expect(stepName(bp, 7).name).toBe('H');
    expect(stepName(bp, 14)).toEqual({ name: 'D♭', period: 1, m: 1 });
    expect(stepName(bp, -1)).toEqual({ name: 'B', period: -1, m: 12 });
    // the just BP scale has the same 13 names and its 9/7 at step 3
    const j = systemOf('bpjust');
    expect(j.steps.length).toBe(13);
    expect(stepCents(j, 3)).toBeCloseTo(cents(9 / 7), 6);
    expect(stepName(j, 3).name).toBe('E');
  });
  it('builds every preset', () => {
    PRESETS.forEach(p => { const s = systemOf(p.id); expect(s.error).toBeUndefined(); expect(s.id).toBe(p.id); expect(s.steps[0]).toBe(0); });
    expect(systemOf('edo12').std).toBe(true);
    expect(systemOf('nope').id).toBe('edo12');
  });
  it('reads a Scala file', () => {
    const s = parseScl('! bp.scl\n!\nBohlen-Pierce\n 13\n!\n 27/25\n 25/21\n 9/7\n 7/5\n 75/49\n 5/3\n 9/5\n 49/25\n 15/7\n 7/3\n 63/25\n 25/9\n 3/1\n');
    expect(s.name).toBe('Bohlen-Pierce');
    expect(s.steps.length).toBe(13);
    expect(s.period).toBeCloseTo(cents(3), 6);
    expect(parseScl('x\n3\n100.\n200.\n').error).toMatch(/3 pitches/);
    expect(parseScl('x\n2\n100.\nfoo\n').error).toBeTruthy();
    const c = build({ kind: 'scl', text: 'cents\n2\n350.0 neutral third\n1200.0\n' });
    expect(c.steps).toEqual([0, 350]);
  });
  it('checks what you build', () => {
    expect(build({ kind: 'ed', n: 0 }).error).toBeTruthy();
    expect(build({ kind: 'ed', n: 5, of: 'abc' }).error).toBeTruthy();
    expect(build({ kind: 'ji', ratios: '9/8 wow' }).error).toMatch(/wow/);
    const ji = build({ kind: 'ji', ratios: '5/4, 3/2 9/8 3/2 2/1 5/2' });
    expect(ji.steps.map(Math.round)).toEqual([0, 204, 386, 702]); // sorted, the repeat and anything past the period left out
    expect(build({ kind: 'ed', n: 19 }).name).toBe('19 equal (19-EDO)');
    expect(specKey({ kind: 'ed', n: 19, of: '2/1' })).toBe(specKey({ kind: 'ed', n: 19, of: '2/1' }));
    expect(specKey({ kind: 'ed', n: 19, of: '2/1' })).not.toBe(specKey({ kind: 'ed', n: 20, of: '2/1' }));
    expect(systemOf('mine:x', [{ id: 'mine:x', kind: 'ed', n: 7, of: '2/1' }]).steps.length).toBe(7);
  });
  it('finds the nearest step', () => {
    const bp = systemOf('bp13');
    expect(nearestStep(bp, 146.3 * 3 + 10)).toEqual({ k: 3, cents: 10 });
    expect(nearestStep(bp, -30)).toEqual({ k: 0, cents: -30 });
    expect(nearestStep(bp, 1901.955 + 140).k).toBe(14);
    expect(nearestStep(systemOf('edo12'), 1249).k).toBe(12);
  });
  it('picks open strings near standard tuning', () => {
    expect(defaultOpen(systemOf('bp13'))).toEqual([0, 3, 7, 10, 13, 16]);
    expect(defaultOpen(systemOf('edo12'))).toEqual([0, 5, 10, 15, 19, 24]);
    expect(defaultOpen(systemOf('edo19'))).toEqual([0, 8, 16, 24, 30, 38]);
    expect(openOf(systemOf('bp13'), [0, 4, 7, 10, 13, 17])).toEqual([0, 4, 7, 10, 13, 17]);
    expect(openOf(systemOf('bp13'), [1, 4, 7, 10, 13, 17])).toEqual([0, 3, 7, 10, 13, 16]);
    expect(openOf(systemOf('bp13'), 'x')).toEqual([0, 3, 7, 10, 13, 16]);
  });
  it('places the frets', () => {
    const t12 = fretTable(systemOf('edo12'), 645, 20);
    expect(t12[11].dist).toBeCloseTo(322.5, 6); // the octave halves the string
    expect(t12[0].dist).toBeCloseTo(36.2, 1);
    const bp = fretTable(systemOf('bp13'), 645, 20);
    expect(bp[12].dist).toBeCloseTo(645 * 2 / 3, 6); // the tritave leaves a third of the string
    expect(bp[0].gap).toBeCloseTo(645 * (1 - Math.pow(3, -1 / 13)), 6);
    expect(tightest(bp).fret).toBe(20);
    expect(nearStandard(t12[4].dist, 645)).toEqual({ fret: 5, off: expect.closeTo(0, 6) });
    expect(nearStandard(bp[3].dist, 645).fret).toBe(6); // 585 cents is closest to the tritone fret
    const csv = fretCsv(systemOf('bp13'), bp.slice(0, 2), 'in');
    expect(csv.split('\n')[0]).toBe('fret,step,cents,from nut (in),from previous fret (in)');
    expect(csv.split('\n')[1]).toMatch(/^1,D♭,146\.30,2\.058,2\.058$/);
  });
  it('writes a valid full-size PDF', () => {
    const sys = systemOf('bp13'), t = fretTable(sys, 645, 20);
    const pdf = fretPdf({ title: 'Bohlen-Pierce (13ED3)', lines: ['Scale length 645.0 mm'], unit: 'mm', paper: 'a4',
      frets: t.map(r => ({ fret: r.fret, dist: r.dist, name: stepName(sys, r.k).name })), table: [['Fret', 'Step'], ...t.map(r => [String(r.fret), stepName(sys, r.k).name])] });
    const s = String.fromCharCode(...pdf);
    expect(s.startsWith('%PDF-1.4')).toBe(true);
    expect(s).toContain('(Db)'); // ASCII only in the PDF
    const pages = (s.match(/\/Type \/Page /g) || []).length;
    expect(pages).toBe(3); // 531 mm of template on two overlapping A4 pages, then the table
    // every xref offset points at its object
    const xref = +/startxref\n(\d+)/.exec(s)[1], rows = s.slice(xref).split('\n').slice(3).filter(l => / n $/.test(l));
    rows.forEach((l, i) => expect(s.slice(+l.slice(0, 10), +l.slice(0, 10) + 12)).toMatch(new RegExp('^' + (i + 1) + ' 0 obj')));
    // a page is landscape A4 in points
    expect(s).toContain('/MediaBox [0 0 841.89 595.28]');
  });
});
