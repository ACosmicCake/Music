import { describe, it, expect } from 'vitest';
import { soloAt } from '../src/solobreak.js';

describe('solo breaks', () => {
  it('plays every cycle when off', () => {
    for (let c = 0; c < 10; c++) expect(soloAt(c, 2, 0)).toEqual({ solo: false, played: c });
  });
  it('plays 2 cycles, then breaks for 4, and counts on', () => {
    const s = Array.from({ length: 12 }, (_, c) => soloAt(c, 2, 4));
    expect(s.map(x => x.solo)).toEqual([false, false, true, true, true, true, false, false, true, true, true, true]);
    expect(s.map(x => x.played)).toEqual([0, 1, 2, 2, 2, 2, 2, 3, 4, 4, 4, 4]);
    expect(s[2]).toMatchObject({ n: 1, of: 4, last: false });
    expect(s[5]).toMatchObject({ n: 4, of: 4, last: true });
  });
  it('alternates one and one', () => {
    expect([0, 1, 2, 3].map(c => soloAt(c, 1, 1).solo)).toEqual([false, true, false, true]);
  });
});
