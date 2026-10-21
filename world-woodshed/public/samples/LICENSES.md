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
