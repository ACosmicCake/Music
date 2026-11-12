import { describe, it, expect } from 'vitest';
import './env.js';
import { ANIMALS } from '../src/ecosystem.js';
import { FOLK, Folk, pickGuest, FIRST } from '../src/ui/folk.js';
import { LOOK } from '../src/folklook.js';

describe('the island animals as the club\'s guests', () => {
  it('has a look for every animal on the island', () => {
    ANIMALS.forEach(a => { expect(FOLK[a.id], a.id).toBeTruthy(); expect(LOOK[a.id], a.id).toBeTruthy(); });
    // the flat drawing's colour is the 3D fur's
    Object.entries(FOLK).forEach(([id, f]) => expect(LOOK[id][0]).toBe('#' + f.fur.toString(16).padStart(6, '0')));
  });
  it('builds every one on the shared rig', () => {
    Object.keys(FOLK).forEach(id => {
      const p = Folk(id, 3);
      expect(p.userData.animal).toBe(id);
      expect(p.userData.j.neck.children.length).toBeGreaterThan(3);
    });
  });
  it('picks guests from the residents, the same for the same seed', () => {
    const res = [{ id: 'rabbit', n: 4 }, { id: 'fox', n: 1 }, { id: 'heron', n: 1, hiding: true }];
    const seen = new Set();
    for (let s = 0; s < 200; s++) seen.add(pickGuest(res, s));
    expect([...seen].sort()).toEqual(['fox', 'rabbit']);
    expect(pickGuest(res, 42)).toBe(pickGuest(res, 42));
  });
  it('before any animal has moved in, the first ones visit', () => {
    for (let s = 0; s < 20; s++) expect(FIRST).toContain(pickGuest([], s));
  });
});
