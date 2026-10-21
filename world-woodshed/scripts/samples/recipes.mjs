/* Which recordings become the app's sampled instruments, and how.
   Every source is CC0 or CC-BY; public/samples/LICENSES.md credits each one. The build script
   (build.mjs) reads these recipes, so the sample set can be rebuilt or changed from source. */

const NOTE = { c: 0, 'c#': 1, db: 1, d: 2, 'd#': 3, eb: 3, e: 4, f: 5, 'f#': 6, gb: 6, g: 7, 'g#': 8, ab: 8, a: 9, 'a#': 10, bb: 10, b: 11 };
// scientific pitch: C4 = MIDI 60
export const midiOf = name => { const m = /^([a-g](?:#|b)?)(-?\d)$/i.exec(name); return 12 * (+m[2] + 1) + NOTE[m[1].toLowerCase()]; };

export const SOURCES = {
  smolken: {
    name: "D. Smolken's Double Bass",
    author: 'D. Smolken (Karoryfer Samples)',
    licence: 'CC0-1.0',
    url: 'https://github.com/sfzinstruments/dsmolken.double-bass',
    commit: 'c2985eb647109d2a8f30a70071e3e163339d7396',
    note: '1958 Otto Rubner double bass, pizzicato, fifths tuning (CGDA).'
  },
  vcsl: {
    name: 'Versilian Community Sample Library (VCSL)',
    author: 'Versilian Studios LLC and contributors',
    licence: 'CC0-1.0',
    url: 'https://github.com/sgossner/VCSL',
    commit: 'c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e',
    note: 'Grand Piano, Steinway B (close mics, no sustain pedal) and the percussion listed in LICENSES.md.'
  }
};

/* Each instrument: sampled notes in velocity layers (soft to loud) and round-robins.
   maxSec trims each note (with a fade) to what the app needs; layerGain restores the dynamic range
   where the source normalised every sample; gain sets the instrument's level against the others. */
export const INSTRUMENTS = [
  {
    id: 'upright', name: 'Upright bass', source: 'smolken', maxSec: 3, fade: 0.4, release: 0.09, gain: 1.9,
    // every pitch the library sampled: a minor or major third apart, C1 to A3
    files: ['c1', 'eb1', 'g1', 'bb1', 'd2', 'f2', 'a2', 'c3', 'e3', 'g3', 'a3'].flatMap(n =>
      ['p', 'm', 'f'].flatMap((dyn, layer) => ['a', 'b'].map((rr, r) => ({ src: `pizz/pizz_${n}_${dyn}${rr}.wav`, midi: midiOf(n), layer, rr: r }))))
  },
  {
    id: 'piano', name: 'Piano', source: 'vcsl', maxSec: 4, fade: 0.8, release: 0.22, gain: 0.78, layerGain: [0.32, 0.6, 1],
    // whole tones from C2 to C7: no note is more than a semitone from its sample
    files: (() => {
      const out = [];
      for (let m = 36; m <= 96; m += 2) {
        const name = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][m % 12] + (Math.floor(m / 12) - 1);
        [2, 3, 4].forEach((vl, layer) => out.push({ src: `Chordophones/Zithers/Grand Piano, Steinway B/NoSus/JHPiano_NoSus_Close_${name}_vl${vl}_rr1.wav`, midi: m, layer, rr: 0 }));
      }
      return out;
    })()
  },

  /* Percussion, all VCSL: one sound per instrument, recorded at its own pitch, so every file is "MIDI 60"
     (the app shifts pitch only for the metronome's accented click). The recordings keep their natural
     levels, so no layer gain is needed; gain matches each sound's loudness to the synth voice it replaces. layers: the file for each dynamic, soft to loud, each with its
     round-robins (rr). oneLayer: why a sound has a single dynamic. */
  ...[
    { id: 'kick', name: 'Bass drum', maxSec: 0.8, fade: 0.35, gain: 1, dir: 'Membranophones/Struck Membranophones/Bass Drum 1',
      layers: ['v3', 'v5', 'v7'].map(v => [1, 2].map(r => `BDrumNew_hit_${v}_rr${r}_Sum.wav`)) },
    { id: 'snare', name: 'Snare drum', maxSec: 0.5, fade: 0.2, gain: 0.124, dir: 'Membranophones/Struck Membranophones/Snare Drum, Modern 1',
      layers: ['v6', 'v7', 'v9'].map(v => [1, 2].map(r => `Snare2_HitSN_${v}_rr${r}_Mid.wav`)) },
    { id: 'tom', name: 'Tom', maxSec: 0.7, fade: 0.3, gain: 1.22, dir: 'Membranophones/Struck Membranophones/Tom 1/Stick',
      layers: ['v2', 'v3', 'v4'].map(v => [1, 2].map(r => `TomH_HitS_${v}_rr${r}_Mid.wav`)) },
    { id: 'hat', name: 'Hi-hat', maxSec: 0.3, fade: 0.12, gain: 0.174, dir: 'Idiophones/Struck Idiophones/Hi-Hat Cymbal',
      layers: ['v2', 'v3', 'v4'].map(v => [1, 2].map(r => `HiHat_HitC_${v}_rr${r}_Mid.wav`)) },
    { id: 'hatfoot', name: 'Hi-hat pedal', maxSec: 0.25, fade: 0.1, gain: 5.9, dir: 'Idiophones/Struck Idiophones/Hi-Hat Cymbal',
      oneLayer: 'The library recorded the closing hi-hat at one dynamic.',
      layers: [[1, 2].map(r => `HiHat_Close_rr${r}_Mid.wav`)] },
    { id: 'ride', name: 'Ride cymbal', maxSec: 1.6, fade: 0.9, gain: 1.15, dir: 'Idiophones/Struck Idiophones/Suspended Cymbal 1',
      layers: ['pp', 'mp', 'f'].map(v => [`susCymb1_hit_stick_${v}1.wav`]) },
    { id: 'clave', name: 'Claves', maxSec: 0.3, fade: 0.12, gain: 3.6, dir: 'Idiophones/Struck Idiophones/Claves',
      layers: ['v1', 'v2', 'v3'].map(v => [`Claves1_Hit_${v}_rr1_Mid.wav`]) },
    { id: 'cowbell', name: 'Cowbell', maxSec: 0.4, fade: 0.15, gain: 1, dir: 'Idiophones/Struck Idiophones/Cowbells',
      layers: ['v2', 'v3', 'v4'].map(v => [`Cowbell1_Hit_${v}_rr1_Mid.wav`]) },
    { id: 'agogo', name: 'Agogô bell', maxSec: 0.4, fade: 0.15, gain: 4.5, dir: 'Idiophones/Struck Idiophones/Agogo Bells',
      layers: ['v1', 'v2', 'v3'].map(v => [`Agogo_High_${v}_rr1_Mid.wav`]) },
    { id: 'shaker', name: 'Shaker', maxSec: 0.2, fade: 0.06, gain: 1.57, dir: 'Idiophones/Struck Idiophones/Shaker, Small',
      oneLayer: 'The softer down-strokes swell in over about 40 ms and would sound late, so only the crisp up-strokes are used.',
      layers: [[1, 2].map(r => `Mid_ShakerHighFaster_Up_rr${r}.wav`)] },
    { id: 'clap', name: 'Hand clap', maxSec: 0.3, fade: 0.12, gain: 0.153, dir: 'Idiophones/Struck Idiophones/Claps',
      oneLayer: 'The library has velocity layers only for a studio clap with no round-robins; six round-robins of one clap sound more like a person clapping.',
      layers: [[1, 2, 3, 4, 5, 6].map(r => `Clap_rr${r}.wav`)] },
    { id: 'wood', name: 'Woodblock (metronome)', maxSec: 0.2, fade: 0.08, gain: 0.65, dir: 'Idiophones/Struck Idiophones/Woodblock',
      layers: [['wood_click_pp_rr1.wav', 'wood_click_pp_rr2.wav', 'wood_click_pp_rr3.wav'], ['wood_click_mp.wav'], ['wood_click_f_rr1.wav', 'wood_click_f_rr2.wav']] },
    { id: 'conga-low', name: 'Tumba (low conga)', maxSec: 0.6, fade: 0.25, gain: 6.1, dir: 'Membranophones/Struck Membranophones/Conga',
      layers: ['v2', 'v3', 'v4'].map(v => [1, 2].map(r => `Tumba_HitN_${v}_rr${r}_Sum.wav`)) },
    { id: 'conga-mid', name: 'Conga', maxSec: 0.6, fade: 0.25, gain: 2.0, dir: 'Membranophones/Struck Membranophones/Conga',
      layers: ['v1', 'v2', 'v3'].map(v => [1, 2].map(r => `Conga_HitN_${v}_rr${r}_Sum.wav`)) },
    { id: 'conga-high', name: 'Quinto (high conga)', maxSec: 0.5, fade: 0.2, gain: 0.275, dir: 'Membranophones/Struck Membranophones/Conga',
      layers: ['v1', 'v2', 'v3'].map(v => [1, 2].map(r => `Quinto_HitN_${v}_rr${r}_Sum.wav`)) },
    { id: 'darbuka-doum', name: 'Darbuka doum', maxSec: 0.7, fade: 0.3, gain: 0.62, dir: 'Membranophones/Struck Membranophones/Darbuka',
      layers: ['vl1', 'vl2'].map(v => [1, 2].map(r => `Darbuka_1_hit_${v}_rr${r}.wav`)) },
    { id: 'darbuka-tek', name: 'Darbuka tek', maxSec: 0.3, fade: 0.12, gain: 0.34, dir: 'Membranophones/Struck Membranophones/Darbuka',
      layers: ['vl1', 'vl2'].map(v => [1, 2].map(r => `Darbuka_2_hit_${v}_rr${r}.wav`)) },
    { id: 'cajon-bass', name: 'Cajón bass', maxSec: 0.4, fade: 0.18, gain: 1.06, dir: 'Idiophones/Struck Idiophones/Cajon',
      layers: ['pp', 'mp', 'f'].map(v => [1, 2].map(r => `Cajon_hit2_${v}_rr${r}.wav`)) },
    { id: 'cajon-slap', name: 'Cajón slap', maxSec: 0.35, fade: 0.15, gain: 0.66, dir: 'Idiophones/Struck Idiophones/Cajon',
      layers: ['mp', 'f', 'fff'].map(v => [1, 2].map(r => `Cajon_hit1_${v}_rr${r}.wav`)) }
  ].map(({ dir, layers, ...inst }) => ({
    ...inst, source: 'vcsl', release: 0.05,
    files: layers.flatMap((rrs, layer) => rrs.map((f, rr) => ({ src: dir + '/' + f, midi: 60, layer, rr })))
  }))
];
