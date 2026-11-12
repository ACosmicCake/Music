import { describe, it, expect } from 'vitest';
import Eco from '../src/ecosystem.js';

const ids = rs => rs.map(r => r.id);

describe('the garden ecosystem', () => {
  it('counts units by kind', () => {
    expect(Eco.counts([{ kind: 'tree' }, { kind: 'kelp' }, { kind: 'tree' }, { kind: 'odd' }])).toEqual({ tree: 2, kelp: 1, bottles: 0 });
  });
  it('an empty island has no animals, and the first comes with two trees', () => {
    expect(Eco.residents({ tree: 0, kelp: 0, bottles: 0 })).toEqual([]);
    expect(ids(Eco.residents({ tree: 2, kelp: 0, bottles: 0 }))).toEqual(['snail', 'butterfly']);
    expect(Eco.nextArrival({ tree: 0, kelp: 0, bottles: 0 })).toMatchObject({ total: 1 });
  });
  it('a fox needs rabbits, and a turtle needs kelp and a clean beach', () => {
    expect(ids(Eco.residents({ tree: 25, kelp: 0, bottles: 0 }))).toContain('fox');
    expect(ids(Eco.residents({ tree: 0, kelp: 6, bottles: 4 }))).not.toContain('turtle');
    expect(ids(Eco.residents({ tree: 0, kelp: 6, bottles: 5 }))).toContain('turtle');
    expect(ids(Eco.residents({ tree: 17, kelp: 0, bottles: 0 }))).not.toContain('heron');
    expect(ids(Eco.residents({ tree: 18, kelp: 0, bottles: 0 }))).toContain('heron');
  });
  it('numbers grow with what they live on, up to a limit', () => {
    const f = n => Eco.residents({ tree: 0, kelp: n, bottles: 0 }).find(r => r.id === 'fish').n;
    expect(f(1)).toBe(1);
    expect(f(6)).toBe(4);
    expect(f(100)).toBe(10);
  });
  it('shy animals hide when the island wilts', () => {
    const rs = Eco.residents({ tree: 10, kelp: 0, bottles: 0 }, { wilted: true });
    expect(rs.find(r => r.id === 'rabbit').hiding).toBe(true);
    expect(rs.find(r => r.id === 'butterfly').hiding).toBe(false);
  });
  it('names what the next arrival still needs', () => {
    const n = Eco.nextArrival({ tree: 6, kelp: 0, bottles: 0 });
    expect(n.id).toBe('rabbit');
    expect(Eco.shortWords(n.short)).toBe('1 more tree');
    expect(Eco.shortWords({ kelp: 1, bottles: 2 })).toBe('1 more kelp and 20 more bottles');
  });
  it('spots are stable as the garden grows, stay where allowed and spread out from the start', () => {
    const o = { bounds: [-20, 20, -20, 20], ok: (x, z) => !(x > 0 && z > 0), cx: -10, cz: -10, gap: 2 };
    const a = Eco.spots(30, o), b = Eco.spots(31, o);
    expect(b.slice(0, 30)).toEqual(a);
    b.forEach(p => expect(p.x > 0 && p.z > 0).toBe(false));
    expect(Math.hypot(a[0].x + 10, a[0].z + 10)).toBeLessThan(Math.hypot(a[29].x + 10, a[29].z + 10));
  });
  it('has a varied cast, each one reachable', () => {
    expect(Eco.ANIMALS.length).toBeGreaterThanOrEqual(25);
    const all = Eco.residents({ tree: 100, kelp: 100, bottles: 100 });
    expect(all.length).toBe(Eco.ANIMALS.length);
  });
});
