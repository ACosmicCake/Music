/* World Woodshed — the recorded guitars behind A.note() and A.strum().

   Every guitar sound in the app (ear training, the fretboard, chord demos, the band's guitar comping)
   goes through A.note. Here a note is played from a recorded nylon- or steel-string guitar instead of
   the synthesized plucked string, as the player chooses (settings.guitarSound: 'nylon', 'steel' or
   'synth'). The recordings have one velocity per note, so a softer note is made darker with a low-pass
   filter as well as quieter, the way a string plucked gently has fewer upper harmonics. The chosen
   guitar starts loading on the first tap; until it has loaded, the synth plays. */
import A from './audio.js';
import Samples from './samples.js';

export const VOICES = { nylon: 'guitar-nylon', steel: 'guitar-steel', synth: null };
let voice = null; // set from the settings at boot (src/main.js)

/* Decoding needs the audio running, and browsers start audio only from a tap: until then, wait for one */
const onAudio = fn => {
  if (typeof document === 'undefined') return; // not in a browser (tests)
  if (A.now() > 0) fn(); else document.addEventListener('pointerdown', fn, { once: true, capture: true });
};

/* Which guitar plays: a key of VOICES (anything else means the default, nylon) */
export function setVoice(v) {
  v = v in VOICES ? v : 'nylon';
  if (v === voice) return;
  voice = v;
  const id = VOICES[voice];
  if (id) onAudio(() => Samples.load(id));
}
export const currentVoice = () => voice;

/* The brightness of a note: about 1.6 kHz for the softest pluck up to 12 kHz at full strength, and never
   much brighter than the caller asked for (the band's comping asks for a mellow guitar) */
export function cutoffFor(vel, tone) {
  const v = Math.max(0, Math.min(1, vel));
  const f = 1600 * Math.pow(2, 2.9 * v);
  return tone ? Math.min(f, tone * 2) : f;
}

A.setNoteSampler((midi, when, vel, dur, o) => {
  const id = VOICES[voice];
  if (!id) return null;
  if (!Samples.ready(id)) { Samples.load(id); return null; }
  const ctx = A.ensure();
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = cutoffFor(vel, o.tone); lp.Q.value = 0.5;
  lp.connect(o.out);
  // the level follows vel as the synth's does: play() scales a single layer by 0.8 + 0.35 × vel, so undo that
  const v = Math.max(0, Math.min(1, vel));
  const src = Samples.play(id, midi, when, v, dur, lp, { gain: v / (0.8 + 0.35 * v), detune: o.detune, release: o.release || 0.25 });
  if (!src) { lp.disconnect(); return null; }
  src.addEventListener('ended', () => lp.disconnect());
  return src;
});


export default { VOICES, setVoice, currentVoice, cutoffFor };
