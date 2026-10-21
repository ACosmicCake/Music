/* World Woodshed — open a recording from the listening path in Spotify.
   No Spotify account or API: a link searches Spotify for the artist and the record, and the first
   result is the album or song. On Android it opens the Spotify app straight away (a spotify: link);
   if nothing took over after a moment (Spotify not installed), it opens the search on the web instead.
   Everywhere else it is a normal link to the web player, which offers the desktop app. */
import { isNative } from './native.js';

const PLAYABLE = ['album', 'track'];
export const onSpotify = e => PLAYABLE.includes(e.kind);
/* fewer words find more: no notes in brackets, no "Various artists", only the first of a list of names */
const clean = t => t.replace(/\([^)]*\)/g, ' ').replace(/[‘’]/g, "'").replace(/[“”"]/g, ' ');
export const spotifyQuery = e => {
  const artist = /^various artists/i.test(e.artist) ? '' : clean(e.artist).split(',')[0];
  return (artist + ' ' + clean(e.work)).replace(/\s+/g, ' ').trim();
};
export const spotifyWeb = q => 'https://open.spotify.com/search/' + encodeURIComponent(q);
export const spotifyApp = q => 'spotify:search:' + encodeURIComponent(q);
const isAndroid = () => isNative() || /Android/i.test(navigator.userAgent || '');

/* onclick for a link whose href is spotifyWeb(q) */
export function openSpotify(ev, q) {
  if (!isAndroid()) return;
  ev.preventDefault();
  let left = false;
  const away = () => { left = true; };
  const hidden = () => { if (document.hidden) left = true; };
  window.addEventListener('blur', away);
  document.addEventListener('visibilitychange', hidden);
  location.href = spotifyApp(q);
  setTimeout(() => {
    window.removeEventListener('blur', away);
    document.removeEventListener('visibilitychange', hidden);
    if (left || document.hidden) return;
    // in the app a web link is handed to Android (and so to the browser); in Chrome a new tab, still within the tap's activation
    if (isNative()) location.href = spotifyWeb(q);
    else window.open(spotifyWeb(q), '_blank', 'noopener');
  }, 1500);
}
