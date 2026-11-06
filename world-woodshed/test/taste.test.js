import { describe, it, expect } from 'vitest';
import D from '../src/data.js';
import { loadDrills } from '../src/content/lazy.js';
import { PLAYERS, GENRES, playersOf, tasteFrom, rankedStyles, playerBoost, artistIndex } from '../src/taste.js';

describe('favourite players', () => {
  it('finds a player under the names Spotify credits them by', () => {
    expect(playersOf('Thelonious Monk')).toEqual(['monk']);
    expect(playersOf('Thelonious Monk Quartet')).toEqual(['monk']);
    expect(playersOf('Sun Ra Arkestra')).toEqual(['sunra']);
    expect(playersOf('Sun Ra')).toEqual(['sunra']);
    expect(playersOf('Sunra')).toEqual([]);
    expect(playersOf('Meredith Monk')).toEqual([]);
  });
  it('every player has drills and a tune, all in their style', async () => {
    await loadDrills();
    for (const p of PLAYERS) {
      const ds = D.DRILLS.filter(d => (d.players || []).includes(p.id));
      expect(ds.length, p.id).toBeGreaterThanOrEqual(3);
      ds.forEach(d => { expect(d.style, d.id).toBe(p.style); expect(d.variations.length, d.id).toBeGreaterThanOrEqual(3); expect(d.listen, d.id).toBeTruthy(); });
      expect(D.TUNES.filter(t => (t.players || []).includes(p.id)).length, p.id).toBeGreaterThanOrEqual(1);
    }
  });
  it('the index the planner sees before the drills load knows their players', () => {
    const d = D.DRILLS.find(x => x.id === 'jazz-monk-wholetone');
    expect(d && d.players).toEqual(['monk']);
  });
  it('a favourite player’s items get the boost, others none', () => {
    expect(playerBoost({ players: ['monk'] }, ['monk'])).toBe(1);
    expect(playerBoost({ players: ['sunra'] }, ['monk'])).toBe(0);
    expect(playerBoost({ players: [] }, ['monk'])).toBe(0);
    expect(playerBoost({}, undefined)).toBe(0);
  });
});

describe('taste from top artists', () => {
  it('every genre rule points at a style the app has', () => {
    GENRES.forEach(([, id]) => expect(D.REGIONS.some(r => r.id === id), id).toBe(true));
  });
  it('maps Spotify genres to styles, the top artists counting most', () => {
    const t = tasteFrom([
      { name: 'Thelonious Monk', genres: ['bebop', 'hard bop', 'jazz piano'] },
      { name: 'Sun Ra', genres: ['free jazz', 'avant-garde jazz', 'spiritual jazz'] },
      { name: 'Fela Kuti', genres: ['afrobeat'] },
      { name: 'Buena Vista Social Club', genres: ['son cubano'] },
      { name: 'Radiohead', genres: ['art rock', 'alternative rock'] }
    ], D.REGIONS);
    expect(t.styles[0].id).toBe('jazz');
    expect(t.styles[0].artists).toEqual(['Thelonious Monk', 'Sun Ra']);
    expect(t.styles.map(s => s.id)).toEqual(expect.arrayContaining(['westafrica', 'cuba', 'rock']));
    expect(t.players).toEqual(['monk', 'sunra']);
    expect(rankedStyles(t)[0]).toBe('jazz');
  });
  it('works without genres, from the artists the app’s own style pages name', () => {
    const idx = artistIndex(D.REGIONS);
    expect(idx.size).toBeGreaterThan(50);
    const t = tasteFrom([{ name: 'Buena Vista Social Club', genres: [] }, { name: 'Sun Ra Arkestra', genres: [] }], D.REGIONS);
    expect(t.styles.map(s => s.id)).toEqual(expect.arrayContaining(['cuba', 'jazz']));
    expect(t.players).toEqual(['sunra']);
  });
  it('ignores what matches nothing and keeps names as plain short text', () => {
    const t = tasteFrom([{ name: 'x'.repeat(500), genres: ['vaporwave'] }, null, { genres: ['jazz'] }], D.REGIONS);
    expect(t.styles).toEqual([]);
    expect(t.artists[0].length).toBe(80);
    expect(rankedStyles(t)).toEqual([]);
    expect(tasteFrom(undefined, D.REGIONS).styles).toEqual([]);
  });
});
