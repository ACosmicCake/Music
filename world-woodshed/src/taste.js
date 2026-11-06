/* World Woodshed — your listening taste: favourite players, and the styles your Spotify top artists point to.
   Plain functions (test/taste.test.js). The Spotify side (login, the API call) is src/spotifyauth.js; this only
   turns a list of artists into the app's styles and players, so it works the same on a list from anywhere.

   An artist counts toward a style when one of their Spotify genres matches it (GENRES) or when the app itself
   names them on that style's page (its listening path or its players), so it still works for artists Spotify
   gives no genres for. Higher in your top list counts for more. */

/* Players the app has drills and tunes for. `match` are lower-case names as Spotify or the app write them. */
export const PLAYERS = [
  { id: 'monk', name: 'Thelonious Monk', style: 'jazz', match: ['thelonious monk'], blurb: 'Whole-tone runs, minor seconds that rub, ideas moved across the beat, stride.' },
  { id: 'sunra', name: 'Sun Ra', style: 'jazz', match: ['sun ra'], blurb: 'Long vamps with space, chords in fourths, free playing over a pulse.' }
];

/* Spotify genre words → the app's styles. Checked in order; a genre can count for more than one style. */
export const GENRES = [
  [/\b(jazz|bebop|bop|swing|big band|cool jazz|free jazz|avant-garde jazz|spiritual jazz|fusion)\b/, 'jazz'],
  [/\b(gypsy jazz|jazz manouche|manouche)\b/, 'manouche'],
  [/\b(blues|delta blues|chicago blues)\b/, 'blues'],
  [/\b(rock|metal|punk|grunge|shoegaze|post-rock|indie|alternative)\b/, 'rock'],
  [/\b(funk|soul|r&b|neo soul|motown|disco|hip hop|rap)\b/, 'funksoul'],
  [/\b(country|bluegrass|folk|americana|singer-songwriter)\b/, 'country'],
  [/\b(classical|baroque|romantic era|early music|classical guitar)\b/, 'classical'],
  [/\b(son cubano|salsa|rumba|timba|mambo|cha-cha|bolero|latin jazz|afro-cuban)\b/, 'cuba'],
  [/\b(bossa nova|samba|mpb|choro|forró|forro|tropicália|tropicalia|brazilian)\b/, 'brazil'],
  [/\b(flamenco|rumba flamenca|nuevo flamenco)\b/, 'flamenco'],
  [/\b(hindustani|indian classical|sitar|ghazal|qawwali)\b/, 'hindustani'],
  [/\b(carnatic)\b/, 'carnatic'],
  [/\b(arab|arabic|maqam|oud|tarab|raï|rai|gnawa|chaabi)\b/, 'arabic'],
  [/\b(turkish|balkan|rebetiko|greek|anatolian)\b/, 'turkbalkan'],
  [/\b(afrobeat|highlife|mande|malian|desert blues|griot|kora|afropop|afrobeats)\b/, 'westafrica'],
  [/\b(soukous|rumba congolaise|congolese|benga|ethio|ethiopian)\b/, 'centraleast'],
  [/\b(tango|chacarera|zamba|nueva canción|andean|cueca|milonga)\b/, 'latam'],
  [/\b(reggae|ska|rocksteady|dub|dancehall)\b/, 'caribbean'],
  [/\b(klezmer)\b/, 'klezmer'],
  [/\b(j-pop|japanese|enka|city pop|k-pop|chinese|gamelan|min'yo)\b/, 'eastasia'],
  [/\b(celtic|irish|scottish|trad)\b/, 'celtic'],
  [/\b(fado)\b/, 'fado'],
  [/\b(persian|iranian)\b/, 'persian'],
  [/\b(hawaiian|slack key)\b/, 'hawaii'],
  [/\b(mbaqanga|kwaito|amapiano|south african|maskandi|malagasy|salegy)\b/, 'southernafrica'],
  [/\b(mariachi|ranchera|norteño|norteno|son jarocho|corrido|mexican)\b/, 'mexico'],
  [/\b(cumbia|vallenato|joropo|champeta|colombian)\b/, 'colombia'],
  [/\b(mor lam|molam|luk thung|thai|cambodian|khmer|lao)\b/, 'seasia']
];

export const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9& -]+/g, ' ').replace(/\s+/g, ' ').trim();

/* Players whose name matches an artist (Spotify often credits "Thelonious Monk Quartet" or "Sun Ra Arkestra") */
export function playersOf(name) {
  const n = norm(name);
  return PLAYERS.filter(p => p.match.some(m => n === m || n.startsWith(m + ' '))).map(p => p.id);
}

/* Artist name → the styles whose page names them, from the app's own regions (essential recordings, players) */
export function artistIndex(regions) {
  const idx = new Map();
  const add = (name, id) => {
    norm(name).split(/ and | with | & |, /).map(x => x.trim()).filter(x => x.length > 2).forEach(k => {
      if (!idx.has(k)) idx.set(k, new Set());
      idx.get(k).add(id);
    });
  };
  (regions || []).forEach(r => {
    (r.essential || []).forEach(e => { if (!/^various/i.test(e.artist || '')) add(e.artist, r.id); });
    (r.players || []).forEach(p => add(String(p.name || '').replace(/\([^)]*\)/g, ''), r.id));
  });
  return idx;
}

/* Your taste from a ranked list of artists [{ name, genres }] (top first).
   Returns { styles: [{ id, score, artists }] best first, players: [ids], artists: [names] }. */
export function tasteFrom(artists, regions) {
  const list = (artists || []).filter(a => a && a.name).slice(0, 50);
  const idx = artistIndex(regions);
  const known = new Set((regions || []).map(r => r.id));
  const styles = new Map(), players = new Set();
  list.forEach((a, rank) => {
    const w = 1 / (1 + rank * 0.08);
    const hit = new Set();
    (a.genres || []).forEach(g => GENRES.forEach(([re, id]) => { if (re.test(norm(g))) hit.add(id); }));
    const n = norm(a.name);
    (idx.get(n) || []).forEach(id => hit.add(id));
    playersOf(a.name).forEach(id => { players.add(id); hit.add(PLAYERS.find(p => p.id === id).style); });
    // gypsy jazz and Latin jazz are jazz too, but count for their own style first
    if (hit.has('manouche') || hit.has('cuba')) hit.delete('jazz');
    hit.forEach(id => {
      if (!known.has(id)) return;
      const s = styles.get(id) || { id, score: 0, artists: [] };
      s.score += w;
      if (s.artists.length < 4) s.artists.push(String(a.name).slice(0, 80));
      styles.set(id, s);
    });
  });
  return {
    styles: [...styles.values()].sort((x, y) => y.score - x.score).map(s => Object.assign(s, { score: Math.round(s.score * 100) / 100 })),
    players: PLAYERS.map(p => p.id).filter(id => players.has(id)),
    artists: list.slice(0, 20).map(a => String(a.name).slice(0, 80))
  };
}

/* The style order Spotify suggests: up to `max` styles that have at least a little weight */
export function rankedStyles(taste, max = 5) {
  return ((taste && taste.styles) || []).filter(s => s.score >= 0.3).slice(0, max).map(s => s.id);
}

/* How much a catalogue item ({ styles, players }) leans toward your favourite players: 1 if it is one of
   theirs, else 0. The planner adds this on top of the style weight. */
export function playerBoost(item, favourites) {
  const fav = favourites || [];
  return item && item.players && item.players.some(p => fav.includes(p)) ? 1 : 0;
}
