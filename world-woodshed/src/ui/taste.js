/* World Woodshed — your music taste in the app: favourite players (Monk, Sun Ra), the Spotify connection, and
   the "Because you listen to…" card on Today. The plain functions are in src/taste.js, the login and API call in
   src/spotifyauth.js. Every name from Spotify is set as text, never as HTML. */
import D from '../data.js';
import Cur from '../curriculum.js';
import { h, toast, openTool } from './core.js';
import { regionPage } from '../tools/atlas.js';
import { isNative } from '../native.js';
import { PLAYERS, tasteFrom, rankedStyles } from '../taste.js';
import * as Sp from '../spotifyauth.js';

const regionName = id => (D.REGIONS.find(r => r.id === id) || {}).name || id;
const taste = () => Cur.prefs().taste || null;
const favourites = () => Cur.prefs().players || [];

/* Read Spotify again and fold what it says into the plan: players it finds are added to your favourites
   (never taken away), and the style order follows Spotify when "Spotify orders my styles" is on. */
export async function refreshTaste() {
  const artists = await Sp.topArtists();
  const t = tasteFrom(artists, D.REGIONS);
  const p = Cur.prefs();
  const patch = {
    taste: { at: Date.now(), artists: t.artists, styles: t.styles.slice(0, 8), players: t.players },
    players: [...new Set(favourites().concat(t.players))]
  };
  const order = rankedStyles(t);
  if (p.tasteAuto !== false && order.length) patch.styles = order;
  Cur.setPrefs(patch);
  return t;
}

/* At start: finish a Spotify login we just came back from, read the top artists and show what changed */
export async function bootSpotify(openSettings) {
  let fresh = false;
  try { fresh = await Sp.finishLogin(); } catch (e) { toast('Spotify could not connect: ' + e.message); if (openSettings) openSettings(); return; }
  if (!fresh) return;
  try {
    const t = await refreshTaste();
    toast(t.styles.length ? 'Spotify connected: your plan now starts with ' + rankedStyles(t).slice(0, 2).map(regionName).join(' and ') : 'Spotify connected');
  } catch (e) { toast(e.message); }
  if (openSettings) openSettings();
}

export function playerChips(onChange) {
  const row = h('div', { class: 'chips' });
  const draw = () => {
    row.innerHTML = '';
    PLAYERS.forEach(pl => {
      const on = favourites().includes(pl.id);
      row.append(h('button', { class: 'chip', 'aria-pressed': String(on), title: pl.blurb, onclick: () => {
        Cur.setPrefs({ players: on ? favourites().filter(x => x !== pl.id) : favourites().concat([pl.id]) });
        draw(); if (onChange) onChange();
      } }, (on ? '★ ' : '☆ ') + pl.name));
    });
  };
  draw();
  return row;
}

/* Settings → Your music taste */
export function tasteSettingsCard() {
  const card = h('div', { class: 'card stack taste-card' });
  let busy = false;
  function draw() {
    card.innerHTML = '';
    card.append(h('span', { class: 'eyebrow', text: 'Favourite players' }),
      h('p', { class: 'small muted', text: 'Their drills and tunes come first in your plan, and Today suggests them. Spotify adds players it finds in your top artists.' }),
      playerChips());
    card.append(h('span', { class: 'eyebrow', text: 'Spotify' }));
    const st = Sp.status(), t = taste();
    if (isNative()) {
      card.append(h('p', { class: 'small muted', text: 'Connect Spotify in the web app (in a browser). What it finds is part of your learning plan, so it reaches this device when your progress syncs.' }));
    } else if (st.on) {
      const refresh = h('button', { class: 'btn small' }, 'Read my top artists again');
      refresh.onclick = async () => {
        if (busy) return; busy = true; refresh.disabled = true; refresh.textContent = 'Reading…';
        try { await refreshTaste(); toast('Updated from Spotify'); } catch (e) { toast(e.message); }
        busy = false; draw();
      };
      card.append(h('p', { class: 'small', text: 'Connected on this device. The app reads only your top artists.' }),
        st.lastError ? h('p', { class: 'small bad-text', text: st.lastError }) : '',
        h('div', { class: 'row' }, refresh, h('button', { class: 'btn small ghost', onclick: () => { Sp.disconnect(); toast('Spotify disconnected on this device'); draw(); } }, 'Disconnect')));
    } else {
      const err = h('p', { class: 'small bad-text', hidden: true });
      const idIn = h('input', { id: 'sp-id', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: '32 letters and digits', value: st.clientId || '' });
      const go = h('button', { class: 'btn brass small' }, 'Connect Spotify');
      go.onclick = async () => {
        if (!Sp.builtClientId()) Sp.setClientId(idIn.value);
        try { go.disabled = true; await Sp.connect(); } catch (e) { go.disabled = false; err.hidden = false; err.textContent = e.message; }
      };
      const uri = Sp.redirectUri();
      card.append(h('p', { class: 'small', text: 'Connect your Spotify account and the app reads your top artists, works out the styles they point to, orders your plan by them and suggests drills and tunes to match.' }),
        st.lastError ? h('p', { class: 'small bad-text', text: st.lastError }) : '');
      if (!Sp.builtClientId()) {
        card.append(h('details', { class: 'small' }, h('summary', { text: 'Set it up once (about 3 minutes)' }),
          h('ol', { class: 'list small' },
            h('li', {}, 'Open the ', h('a', { href: 'https://developer.spotify.com/dashboard', target: '_blank', rel: 'noopener' }, 'Spotify developer dashboard'), ', log in and tap Create app. Spotify asks that the account owning the app has Premium.'),
            h('li', {}, 'Any name and description. Redirect URI: ', h('code', { text: uri }), '. API: Web API. Save.'),
            h('li', { text: 'In the app’s settings, under User Management, add the name and email of your Spotify account.' }),
            h('li', { text: 'Copy the Client ID into the box below and tap Connect Spotify. Do this once on each device you use.' })),
          h('label', { class: 'stack field', for: 'sp-id' }, h('span', { class: 'eyebrow', text: 'Client ID' }), idIn)));
      }
      card.append(h('div', { class: 'row' }, go), err,
        h('p', { class: 'small muted', text: 'The login is kept only on this device, never in your progress, sync files or backups. The app asks Spotify for your top artists and nothing else, and only when you connect or tap to read them again.' }));
    }
    if (t && t.styles && t.styles.length) {
      const auto = Cur.prefs().tasteAuto !== false;
      card.append(h('span', { class: 'eyebrow', text: 'What your listening points to' }),
        h('ol', { class: 'list small' }, t.styles.slice(0, 5).map(s => h('li', {}, h('b', { text: regionName(s.id) }), ': ' + s.artists.join(', ')))),
        h('label', { class: 'row small', style: { flexWrap: 'nowrap', alignItems: 'flex-start' } }, h('input', { type: 'checkbox', checked: auto ? true : null, onchange: e => {
          Cur.setPrefs({ tasteAuto: e.target.checked });
          if (e.target.checked) { const o = rankedStyles(t); if (o.length) Cur.setPrefs({ styles: o }); }
          toast(e.target.checked ? 'Your style order now follows Spotify' : 'Your style order stays as you set it');
        } }), 'Spotify orders my styles (Your learning plan)'),
        t.artists && t.artists.length ? h('p', { class: 'small muted', text: 'Top artists: ' + t.artists.slice(0, 10).join(', ') + '.' }) : '');
    }
  }
  draw();
  const off = Sp.onStatus(() => { if (!card.isConnected) { off(); return; } if (!busy) draw(); });
  return card;
}

/* Today: a few things to play that match your favourite players and your top styles, new ones first */
export function becauseCard() {
  const fav = favourites(), t = taste();
  if (!fav.length && !(t && t.styles && t.styles.length)) return null;
  const fresh = id => !Cur.itemState(id);
  const picks = [];
  // the next drill and tune of each favourite player
  fav.forEach(pid => {
    const pl = PLAYERS.find(p => p.id === pid); if (!pl) return;
    const drills = D.DRILLS.filter(d => (d.players || []).includes(pid)).sort((a, b) => (fresh('drill:' + b.id) - fresh('drill:' + a.id)) || a.level - b.level);
    const tunes = D.TUNES.filter(x => (x.players || []).includes(pid)).sort((a, b) => fresh('tune:' + b.id) - fresh('tune:' + a.id));
    if (drills[0]) picks.push({ why: pl.name, label: drills[0].name, kind: 'Drill', open: () => openTool('drill', { params: { drill: drills[0].id }, returnTab: 'today' }) });
    if (tunes[0]) picks.push({ why: pl.name, label: tunes[0].name, kind: 'Tune', open: () => openTool('repertoire', { params: { tune: tunes[0].id }, returnTab: 'today' }) });
  });
  // the top styles from Spotify that aren't jazz from a favourite player already
  // (a style a favourite player already stands for is covered by their drills and tunes above)
  const covered = new Set(fav.map(id => (PLAYERS.find(p => p.id === id) || {}).style));
  ((t && t.styles) || []).filter(s => !covered.has(s.id)).slice(0, 2).forEach(s => {
    const r = D.REGIONS.find(x => x.id === s.id); if (!r) return;
    const d = D.DRILLS.filter(x => x.style === s.id).sort((a, b) => (fresh('drill:' + b.id) - fresh('drill:' + a.id)) || a.level - b.level)[0];
    picks.push({ why: s.artists.slice(0, 2).join(', '), label: r.name, kind: 'Style', open: () => regionPage(r) });
    if (d) picks.push({ why: s.artists.slice(0, 2).join(', '), label: d.name, kind: 'Drill', open: () => openTool('drill', { params: { drill: d.id }, returnTab: 'today' }) });
  });
  if (!picks.length) return null;
  const names = [...new Set(fav.map(id => (PLAYERS.find(p => p.id === id) || {}).name).filter(Boolean).concat(((t && t.artists) || []).slice(0, 3)))].slice(0, 4);
  return h('div', { class: 'card because-card stack' },
    h('span', { class: 'eyebrow', text: 'Because you listen to' }),
    h('h2', { text: names.join(', ') }),
    h('ul', { class: 'because-list' }, picks.slice(0, 8).map(p => h('li', {},
      h('button', { class: 'btn small ghost because-item', onclick: p.open },
        h('span', { class: 'mono small muted', text: p.kind }), h('span', { class: 'because-label', text: p.label }), h('span', { class: 'small muted because-why', text: p.why }))))));
}
