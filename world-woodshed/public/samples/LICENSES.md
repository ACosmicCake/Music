# Sample credits and licences

Every recorded sound in `public/samples/` comes from a freely licensed library listed here.
Only CC0 and CC-BY sources are used. Each library is named with the exact commit it was taken from,
and `scripts/samples/recipes.mjs` lists the original file behind every note.

Changes made to every file by `scripts/samples/build.mjs`:
- mixed down to mono at 44.1 kHz
- leading silence removed
- shortened, with a fade-out
- encoded as MP3 (LAME VBR quality 4)

No other processing was done. The app adjusts level and velocity response while it plays.

## upright — Upright bass

- **Source:** D. Smolken's Double Bass (pizzicato samples)
- **Author:** D. Smolken (Karoryfer Samples)
- **Licence:** [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) (public domain dedication)
- **Where:** https://github.com/sfzinstruments/dsmolken.double-bass, commit `c2985eb647109d2a8f30a70071e3e163339d7396`
- **What:** a 1958 Otto Rubner double bass in fifths tuning (CGDA), played pizzicato. 11 pitches from C1 to A3, three dynamics (p, mf, f), two round-robins each (`pizz/pizz_<note>_<p|m|f><a|b>.wav`).

## piano — Piano

- **Source:** Versilian Community Sample Library (VCSL), Grand Piano, Steinway B
- **Author:** Versilian Studios LLC and contributors
- **Licence:** [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) (public domain dedication)
- **Where:** https://github.com/sgossner/VCSL, commit `c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e`
- **What:** close-miked notes without the sustain pedal (`Chordophones/Zithers/Grand Piano, Steinway B/NoSus/`), every whole tone from C2 to C7, three velocity layers (vl2, vl3, vl4).
- **Note:** the library normalised every sample, so the app restores the dynamic range with a gain per layer, as the library's own notes advise.
