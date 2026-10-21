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
    note: 'Grand Piano, Steinway B (close mics, no sustain pedal).'
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
  }
];
