# Sample credits and licences

Every recorded sound in `public/samples/` comes from a freely licensed library listed here.
Only CC0 and CC-BY sources are used (the guitars' SoundFont is also MIT-licensed at its origin). Each library is named with the exact commit it was taken from,
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

## Guitars (FluidR3 GM)

Both guitars come from one SoundFont, as rendered note by note for the web:

- **Source:** FluidR3 GM SoundFont, as MP3 notes from midi-js-soundfonts (`FluidR3_GM/`)
- **Author:** Frank Wen (FluidR3 GM SoundFont); the notes were rendered by Benjamin Gleitzman
- **Licence:** the rendered notes are published under [Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/) (CC BY 3.0), as the repository's README states. The FluidR3 GM SoundFont they were made from was released by Frank Wen under the MIT licence: his README says "I hereby release Fluid under the MIT license, as described in COPYING" (reproduced, with COPYING, in MuseScore's [`share/sound/FluidR3Mono_License.md`](https://github.com/musescore/MuseScore/blob/v3.6.2/share/sound/FluidR3Mono_License.md)). Both licences allow this use with credit; the MIT notice is below.
- **Where:** https://github.com/gleitz/midi-js-soundfonts, commit `044fab8e1456bfafc5776e86dfd6bb8697149aef`
- **Changes:** besides the processing listed at the top, nothing. The renders have a single velocity per note, so the app makes softer notes darker (a low-pass filter) as well as quieter while it plays.

The MIT notice for the FluidR3 GM SoundFont:

> Copyright (c) 2000-2002, 2008 Frank Wen <getfrank@gmail.com>
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## guitar-nylon — Nylon-string guitar

- **From:** `FluidR3_GM/acoustic_guitar_nylon-mp3/`
- **What:** `<note>.mp3` (for example `E2.mp3`, `Bb3.mp3`): every semitone from C2 to E6, one velocity, cut to 3 seconds.

## guitar-steel — Steel-string guitar

- **From:** `FluidR3_GM/acoustic_guitar_steel-mp3/`
- **What:** `<note>.mp3`: every semitone from C2 to E6, one velocity, cut to 3 seconds.

## piano — Piano

- **Source:** Versilian Community Sample Library (VCSL), Grand Piano, Steinway B
- **Author:** Versilian Studios LLC and contributors
- **Licence:** [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) (public domain dedication)
- **Where:** https://github.com/sgossner/VCSL, commit `c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e`
- **What:** close-miked notes without the sustain pedal (`Chordophones/Zithers/Grand Piano, Steinway B/NoSus/`), every whole tone from C2 to C7, three velocity layers (vl2, vl3, vl4).
- **Note:** the library normalised every sample, so the app restores the dynamic range with a gain per layer, as the library's own notes advise.

## Percussion (VCSL)

Every percussion sound below comes from one library:

- **Source:** Versilian Community Sample Library (VCSL)
- **Author:** Versilian Studios LLC and contributors
- **Licence:** [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) (public domain dedication)
- **Where:** https://github.com/sgossner/VCSL, commit `c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e`
- **Note:** the library keeps each recording's natural level, so no gain per layer is needed.

## kick — Bass drum

- **From:** `Membranophones/Struck Membranophones/Bass Drum 1/`
- **What:** `BDrumNew_hit_<v3|v5|v7>_rr<1|2>_Sum.wav`: a concert bass drum, three dynamics, two round-robins.

## snare — Snare drum

- **From:** `Membranophones/Struck Membranophones/Snare Drum, Modern 1/`
- **What:** `Snare2_HitSN_<v6|v7|v9>_rr<1|2>_Mid.wav`: snares on, three dynamics, two round-robins.

## tom — Tom

- **From:** `Membranophones/Struck Membranophones/Tom 1/Stick/`
- **What:** `TomH_HitS_<v2|v3|v4>_rr<1|2>_Mid.wav`: played with sticks, three dynamics, two round-robins.

## hat — Hi-hat

- **From:** `Idiophones/Struck Idiophones/Hi-Hat Cymbal/`
- **What:** `HiHat_HitC_<v2|v3|v4>_rr<1|2>_Mid.wav`: closed, three dynamics, two round-robins.

## hatfoot — Hi-hat pedal

- **From:** `Idiophones/Struck Idiophones/Hi-Hat Cymbal/`
- **What:** `HiHat_Close_rr<1|2>_Mid.wav`: the hi-hat closed with the pedal (the band's "chick" on 2 and 4), two round-robins.

## ride — Ride cymbal

- **From:** `Idiophones/Struck Idiophones/Suspended Cymbal 1/`
- **What:** `susCymb1_hit_stick_<pp|mp|f>1.wav`: a suspended cymbal struck with a stick, three dynamics.

## clave — Claves

- **From:** `Idiophones/Struck Idiophones/Claves/`
- **What:** `Claves1_Hit_<v1|v2|v3>_rr1_Mid.wav`: three dynamics.

## cowbell — Cowbell

- **From:** `Idiophones/Struck Idiophones/Cowbells/`
- **What:** `Cowbell1_Hit_<v2|v3|v4>_rr1_Mid.wav`: three dynamics.

## agogo — Agogô bell

- **From:** `Idiophones/Struck Idiophones/Agogo Bells/`
- **What:** `Agogo_High_<v1|v2|v3>_rr1_Mid.wav`: the high bell, three dynamics.

## shaker — Shaker

- **From:** `Idiophones/Struck Idiophones/Shaker, Small/`
- **What:** `Mid_ShakerHighFaster_Up_rr<1|2>.wav`: the up-stroke of a shake, two round-robins (the down-strokes swell in too slowly to keep time).

## clap — Hand clap

- **From:** `Idiophones/Struck Idiophones/Claps/`
- **What:** `Clap_rr<1-6>.wav`: one clap, six round-robins.

## wood — Woodblock (metronome)

- **From:** `Idiophones/Struck Idiophones/Woodblock/`
- **What:** `wood_click_pp_rr<1-3>.wav`, `wood_click_mp.wav`, `wood_click_f_rr<1|2>.wav`: three dynamics. The accented click plays it a fifth higher.

## conga-low — Tumba (low conga)

- **From:** `Membranophones/Struck Membranophones/Conga/`
- **What:** `Tumba_HitN_<v2|v3|v4>_rr<1|2>_Sum.wav`: open tone, three dynamics, two round-robins.

## conga-mid — Conga

- **From:** `Membranophones/Struck Membranophones/Conga/`
- **What:** `Conga_HitN_<v1|v2|v3>_rr<1|2>_Sum.wav`: open tone, three dynamics, two round-robins.

## conga-high — Quinto (high conga)

- **From:** `Membranophones/Struck Membranophones/Conga/`
- **What:** `Quinto_HitN_<v1|v2|v3>_rr<1|2>_Sum.wav`: open tone, three dynamics, two round-robins.

## darbuka-doum — Darbuka doum

- **From:** `Membranophones/Struck Membranophones/Darbuka/`
- **What:** `Darbuka_1_hit_<vl1|vl2>_rr<1|2>.wav`: the low centre stroke, two dynamics, two round-robins.

## darbuka-tek — Darbuka tek

- **From:** `Membranophones/Struck Membranophones/Darbuka/`
- **What:** `Darbuka_2_hit_<vl1|vl2>_rr<1|2>.wav`: the high rim stroke, two dynamics, two round-robins.

## cajon-bass — Cajón bass

- **From:** `Idiophones/Struck Idiophones/Cajon/`
- **What:** `Cajon_hit2_<pp|mp|f>_rr<1|2>.wav`: the low centre stroke, three dynamics, two round-robins.

## cajon-slap — Cajón slap

- **From:** `Idiophones/Struck Idiophones/Cajon/`
- **What:** `Cajon_hit1_<mp|f|fff>_rr<1|2>.wav`: the bright edge stroke, three dynamics, two round-robins.
