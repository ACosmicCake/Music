import { describe, it, expect } from 'vitest';
import M from '../src/islandmap.js';

describe('the island map', () => {
  it('puts trees on land, off the Club\'s lot and the pond', () => {
    M.treeAt(60).forEach(p => { expect(M.inside(p.x, p.z, 0.9)).toBe(true); expect(M.inLot(p.x, p.z)).toBe(false); expect(M.nearPond(p.x, p.z)).toBe(false); });
  });
  it('keeps the first spots when more are planted', () => {
    expect(M.treeAt(10).slice(0, 5)).toEqual(M.treeAt(5));
    expect(M.kelpAt(8).slice(0, 3)).toEqual(M.kelpAt(3));
  });
  it('lays kelp in the shallows and litter on the beach', () => {
    M.kelpAt(20).forEach(p => expect(M.shallow(p.x, p.z) || !M.inside(p.x, p.z, 1.14)).toBe(true));
    expect(M.litterAt).toHaveLength(M.LITTER);
    M.litterAt.forEach(p => expect(M.inLot(p.x, p.z, 3)).toBe(false));
  });
});
