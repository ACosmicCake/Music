/* World Woodshed — the recorded percussion behind A.hit().

   Every rhythm in the app is written for abstract voices (low, mid, high, clave, bell, shaker, clap,
   hat, ride, click...). The synth in audio.js plays them all the same way everywhere. Here each voice
   gets a real instrument, and low/mid/high depend on the music: a son montuno's low and high are
   congas, a maqsum's are the darbuka's doum and tek, a bulería's are the cajón's bass and slap, and a
   backbeat's are bass drum, tom and snare.

   Sounds without a free recording keep their synth voice: the tabla (Hindustani and Carnatic rhythms)
   and the chick, which in most rhythms here is a muted guitar chop rather than a drum. Every sample
   loads on first use (src/samples.js); until then the synth plays. */
import A from './audio.js';
import Samples from './samples.js';

/* Which recorded instrument plays low, mid and high in each kit; null keeps the synth */
export const KITS = {
  drums: { low: 'kick', mid: 'tom', high: 'snare' },
  congas: { low: 'conga-low', mid: 'conga-mid', high: 'conga-high' },
  darbuka: { low: 'darbuka-doum', mid: 'darbuka-tek', high: 'darbuka-tek' },
  cajon: { low: 'cajon-bass', mid: 'cajon-slap', high: 'cajon-slap' },
  tabla: { low: null, mid: null, high: null } // no freely licensed tabla recording yet
};

/* Each style region's hand drums */
const REGION_KIT = {
  cuba: 'congas', westafrica: 'congas',
  arabic: 'darbuka', turkbalkan: 'darbuka', persian: 'darbuka', // the tombak and tapan's nearest relative here
  flamenco: 'cajon',
  hindustani: 'tabla', carnatic: 'tabla'
};
export const kitFor = region => REGION_KIT[region] || 'drums';

/* The bell: the cowbell of Cuban music, the agogô in West African and Brazilian rhythms */
const BELL_FOR = { westafrica: 'agogo', brazil: 'agogo' };

/* Voices that sound the same in every kit. [instrument, semitones up, gain] */
const COMMON = {
  clave: ['clave', 0], shaker: ['shaker', 0], clap: ['clap', 0], hat: ['hat', 0], ride: ['ride', 0],
  click: ['wood', 0], clickHi: ['wood', 7, 1.7] // the accented click a fifth higher and louder, as the synth's is
};

/* The instrument (and pitch shift) for a voice, or null for the synth */
export function sampleFor(type, kit = 'drums', region) {
  if (type === 'bell') return [BELL_FOR[region] || 'cowbell', 0];
  if (COMMON[type]) return COMMON[type];
  const k = KITS[kit] || KITS.drums;
  return k[type] ? [k[type], 0] : null;
}

/* Decoding needs the audio running, and browsers start audio only from a tap: until then, wait for one */
const onAudio = fn => {
  if (typeof document === 'undefined') return; // not in a browser (tests)
  if (A.now() > 0) fn(); else document.addEventListener('pointerdown', fn, { once: true, capture: true });
};

/* The instruments a rhythm needs, so they can load before it plays */
export function prepare(types, kit, region) {
  onAudio(() => types.forEach(t => { const s = sampleFor(t, kit, region); if (s) Samples.load(s[0]); }));
}

/* The metronome is everywhere, so its woodblock (a few kB) loads on the first tap, before any count-in */
onAudio(() => Samples.load('wood'));

A.setHitSampler((type, when, vel, out, o) => {
  const s = sampleFor(type, o.kit, o.region);
  // the sample plays to its own end (each was cut to length with a fade when it was built)
  return s ? Samples.play(s[0], 60 + s[1], when, vel, 10, out, { gain: s[2] || 1 }) : null;
});

export default { KITS, kitFor, sampleFor, prepare };
