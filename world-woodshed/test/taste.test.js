import { describe, it, expect } from 'vitest';
import D from '../src/data.js';
import { loadDrills, loadBios } from '../src/content/lazy.js';
import { PLAYERS, GENRES, playersOf, tasteFrom, rankedStyles, playerBoost, artistIndex } from '../src/taste.js';

describe('favourite players', () => {
  it('finds a player under the names Spotify credits them by', () => {
    expect(playersOf('Thelonious Monk')).toEqual(['monk']);
    expect(playersOf('Thelonious Monk Quartet')).toEqual(['monk']);
    expect(playersOf('Sun Ra Arkestra')).toEqual(['sunra']);
    expect(playersOf('Sun Ra')).toEqual(['sunra']);
    expect(playersOf('Sunra')).toEqual([]);
    expect(playersOf('Meredith Monk')).toEqual([]);
    expect(playersOf('Miles Davis Quintet')).toEqual(['miles']);
    expect(playersOf('Arsenio Rodríguez y su Conjunto')).toEqual(['arsenio']);
    expect(playersOf('Compay Segundo')).toEqual(['bvsc']);
    expect(playersOf('Astor Piazzolla y su Quinteto Tango Nuevo')).toEqual(['piazzolla']);
    expect(playersOf('Mercedes Sosa')).toEqual(['sosa']);
    expect(playersOf('Milton Nascimento')).toEqual(['milton']);
    expect(playersOf('Stan Getz & João Gilberto')).toEqual(['getz']);
    expect(playersOf('Oum Kalthoum')).toEqual(['kulthum']);
    expect(playersOf('Umm Kulthum')).toEqual(['kulthum']);
    expect(playersOf('Miles Kane')).toEqual([]);
  });
  it('every player belongs to a style the app has, and their tunes say who they are for', () => {
    for (const p of PLAYERS) expect(D.REGIONS.some(r => r.id === p.style), p.id).toBe(true);
    for (const t of D.TUNES.filter(x => x.players)) {
      expect(t.group, t.id).toBe('Players');
      t.players.forEach(id => expect(PLAYERS.some(p => p.id === id), t.id).toBe(true));
    }
  });
  it('reads genres written with accents', () => {
    const t = tasteFrom([{ name: 'Someone', genres: ['nueva canción'] }, { name: 'Other', genres: ['forró'] }], D.REGIONS);
    expect(t.styles.map(s => s.id)).toEqual(expect.arrayContaining(['latam', 'brazil']));
  });
  it('every player has drills and a tune, all in their style', async () => {
    await loadDrills();
    for (const p of PLAYERS) {
      const ds = D.DRILLS.filter(d => (d.players || []).includes(p.id));
      expect(ds.length, p.id).toBeGreaterThanOrEqual(5);
      ds.forEach(d => { expect(d.style, d.id).toBe(p.style); expect(d.variations.length, d.id).toBeGreaterThanOrEqual(3); expect(d.listen, d.id).toBeTruthy(); });
      expect(D.TUNES.filter(t => (t.players || []).includes(p.id)).length, p.id).toBeGreaterThanOrEqual(1);
    }
  });
  it('every player has records to hear, each with a title and a year or a note', () => {
    for (const p of PLAYERS) {
      expect((p.records || []).length, p.id).toBeGreaterThanOrEqual(3);
      p.records.forEach(r => { expect(typeof r[0], p.id).toBe('string'); expect(r[1], p.id).toBeTruthy(); });
    }
  });
  it('every player has a life: a timeline, how they learned, wrote and the stories, what to practise and sources', async () => {
    await loadBios();
    expect(Object.keys(D.BIOS).sort()).toEqual(PLAYERS.map(p => p.id).sort());
    PLAYERS.forEach(pl => {
      const b = D.BIOS[pl.id];
      expect(b.lede.length, pl.id).toBeGreaterThan(80);
      expect(b.life.length, pl.id).toBeGreaterThanOrEqual(5);
      b.life.forEach(([when, what]) => { expect(typeof when).toBe('string'); expect(what.length).toBeGreaterThan(10); });
      expect(b.parts.length, pl.id).toBeGreaterThanOrEqual(3);
      b.parts.forEach(x => { expect(x.h).toBeTruthy(); expect(x.p.length, pl.id + ' ' + x.h).toBeGreaterThanOrEqual(3); });
      expect(b.parts.some(x => /learn|practi/i.test(x.h)), pl.id).toBe(true);
      expect(b.parts.some(x => /stor/i.test(x.h)), pl.id).toBe(true);
      expect(b.take.length, pl.id).toBeGreaterThanOrEqual(3);
      expect(b.sources.length, pl.id).toBeGreaterThanOrEqual(2);
      b.sources.forEach(([title, url]) => { expect(title).toBeTruthy(); if (url) expect(url).toMatch(/^https:\/\//); });
      expect(b.sources.some(s => !s[1]), pl.id + ' cites a book or film').toBe(true);
    });
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
    expect(t.players).toEqual(['monk', 'sunra', 'bvsc']);
    expect(rankedStyles(t)[0]).toBe('jazz');
  });
  it('works without genres, from the artists the app’s own style pages name', () => {
    const idx = artistIndex(D.REGIONS);
    expect(idx.size).toBeGreaterThan(50);
    const t = tasteFrom([{ name: 'Buena Vista Social Club', genres: [] }, { name: 'Sun Ra Arkestra', genres: [] }], D.REGIONS);
    expect(t.styles.map(s => s.id)).toEqual(expect.arrayContaining(['cuba', 'jazz']));
    expect(t.players).toEqual(['sunra', 'bvsc']);
  });
  it('ignores what matches nothing and keeps names as plain short text', () => {
    const t = tasteFrom([{ name: 'x'.repeat(500), genres: ['vaporwave'] }, null, { genres: ['jazz'] }], D.REGIONS);
    expect(t.styles).toEqual([]);
    expect(t.artists[0].length).toBe(80);
    expect(rankedStyles(t)).toEqual([]);
    expect(tasteFrom(undefined, D.REGIONS).styles).toEqual([]);
  });
});
