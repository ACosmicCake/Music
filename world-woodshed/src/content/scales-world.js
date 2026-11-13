/* World Woodshed — the scales "What scale is this?" knows, beyond D.SCALES.

   D.SCALES (src/data.js) are the scales the rest of the app teaches (the explorer, warm-ups, ear training).
   The scale finder also knows these: more modes, ragas, maqamat and makamlar, Persian dastgahs, Japanese,
   Chinese, Ethiopian and Greek scales, so a phrase can be traced to the music it belongs to.
   Each: id, name, aka, steps (semitones above the tonic; .5 is a quarter tone, as in D.SCALES), region,
   styles (D.REGIONS ids whose pages it leads to), note. Where a scale has the same notes as one in D.SCALES,
   it is not repeated here: its other names go in MORE_NAMES instead.
   Quarter-tone steps are the usual textbook values; real players place them by ear and by tradition. */

export const WORLD_SCALES = [
  // Western modes and jazz
  { id: 'locrian', name: 'Locrian', aka: '7th mode of major', steps: [0, 1, 3, 5, 6, 8, 10], region: 'Jazz · Metal', styles: ['jazz', 'rock'], note: 'The darkest mode: ♭2 and ♭5. Fits a half-diminished (m7♭5) chord.' },
  { id: 'locnat2', name: 'Locrian ♮2', aka: '6th mode of melodic minor · half-diminished scale', steps: [0, 2, 3, 5, 6, 8, 10], region: 'Jazz', styles: ['jazz'], note: 'Locrian with a natural 2nd: the usual choice over m7♭5 in a minor ii–V.' },
  { id: 'mixb6', name: 'Mixolydian ♭6', aka: 'Aeolian dominant · Hindu scale · Raga Charukesi', steps: [0, 2, 4, 5, 7, 8, 10], region: 'Jazz · South India · Film music', styles: ['jazz', 'carnatic'], note: 'Major below, minor above: the 5th mode of melodic minor. Charukesi is the 26th Carnatic melakarta.' },
  { id: 'dorb2', name: 'Dorian ♭2', aka: 'Phrygian ♮6 · 2nd mode of melodic minor', steps: [0, 1, 3, 5, 7, 9, 10], region: 'Jazz', styles: ['jazz'], note: 'Phrygian with a bright 6th. Over a sus♭9 chord.' },
  { id: 'lydaug', name: 'Lydian augmented', aka: '3rd mode of melodic minor', steps: [0, 2, 4, 6, 8, 9, 11], region: 'Jazz', styles: ['jazz'], note: 'Lydian with a raised 5th, for maj7♯5 chords.' },
  { id: 'whdim', name: 'Whole-half diminished', aka: 'Diminished scale · octatonic', steps: [0, 2, 3, 5, 6, 8, 9, 11], region: 'Jazz · Classical', styles: ['jazz', 'classical'], note: 'Whole step first. Fits a diminished 7th chord; repeats every minor 3rd.' },
  { id: 'bebopdom', name: 'Bebop dominant', aka: 'Mixolydian with a passing major 7th', steps: [0, 2, 4, 5, 7, 9, 10, 11], region: 'Jazz', styles: ['jazz', 'manouche'], note: 'The added 7th puts the chord tones on the beat in a run of eighths (named by the educator David Baker).' },
  { id: 'bebopmaj', name: 'Bebop major', aka: 'Major with a passing ♭6', steps: [0, 2, 4, 5, 7, 8, 9, 11], region: 'Jazz', styles: ['jazz'], note: 'The same idea on a major chord: the ♭6 is a passing note between 5 and 6.' },
  { id: 'majblues', name: 'Major blues', aka: 'Major pentatonic + ♭3', steps: [0, 2, 3, 4, 7, 9], region: 'USA', styles: ['blues', 'country', 'jazz', 'funksoul'], note: 'The ♭3 slides into the 3rd. Heard from B.B. King to bluegrass and western swing.' },
  { id: 'neapmin', name: 'Neapolitan minor', aka: 'Harmonic minor with a ♭2', steps: [0, 1, 3, 5, 7, 8, 11], region: 'Classical', styles: ['classical'], note: 'Harmonic minor with a ♭2.' },
  { id: 'neapmaj', name: 'Neapolitan major', aka: 'Melodic minor with a ♭2', steps: [0, 1, 3, 5, 7, 9, 11], region: 'Classical', styles: ['classical'], note: 'Minor 2nd and 3rd under a major 6th and 7th.' },
  { id: 'prometheus', name: 'Prometheus', aka: 'Scriabin’s mystic chord as a scale', steps: [0, 2, 4, 6, 9, 10], region: 'Classical', styles: ['classical'], note: 'Six notes from the chord Scriabin built his late music on.' },
  { id: 'spanish8', name: 'Spanish eight-tone', aka: 'Phrygian with both 3rds', steps: [0, 1, 3, 4, 5, 6, 8, 10], region: 'Spain', styles: ['flamenco'], note: 'Flamenco players move between the minor and major 3rd over the Phrygian tonic chord.' },

  // India
  { id: 'hamsadhwani', name: 'Raga Hamsadhwani', aka: 'Carnatic pentatonic', steps: [0, 2, 4, 7, 11], region: 'South India', styles: ['carnatic', 'hindustani'], note: 'Sa Re Ga Pa Ni: bright and festive. Often sung at the start of a concert.' },
  { id: 'shivranjani', name: 'Raga Shivranjani', aka: 'Hindustani pentatonic', steps: [0, 2, 3, 7, 9], region: 'North India', styles: ['hindustani'], note: 'Sa Re komal Ga Pa Dha: a plaintive raga heard in many film songs.' },
  { id: 'kalavati', name: 'Raga Kalavati', aka: 'Hindustani pentatonic', steps: [0, 4, 7, 9, 10], region: 'North India', styles: ['hindustani'], note: 'Sa Ga Pa Dha komal Ni: no Re and no Ma.' },
  { id: 'abhogi', name: 'Raga Abhogi', aka: 'Carnatic and Hindustani pentatonic', steps: [0, 2, 3, 5, 9], region: 'India', styles: ['carnatic', 'hindustani'], note: 'Sa Re komal Ga Ma Dha: no Pa.' },
  { id: 'jog', name: 'Raga Jog', aka: 'Hindustani, both Ga', steps: [0, 3, 4, 5, 7, 10], region: 'North India', styles: ['hindustani'], note: 'Shuddh Ga going up and komal Ga coming down: the blues-like rub of the two 3rds.' },
  { id: 'ahirbhairav', name: 'Raga Ahir Bhairav', aka: 'Chakravakam (Carnatic)', steps: [0, 1, 4, 5, 7, 9, 10], region: 'India', styles: ['hindustani', 'carnatic'], note: 'Komal Re with shuddh Dha and komal Ni: a morning raga, Bhairav below and Kafi above.' },

  // Arab world, Turkey, Greece, Persia
  { id: 'suznak', name: 'Maqam Suznak', aka: 'Rast below, Hijaz on the 5th', steps: [0, 2, 3.5, 5, 7, 8, 11], region: 'Arab world · Turkey', styles: ['arabic', 'turkbalkan'], note: 'Starts like Rast, with its quarter-flat 3rd, then turns into Hijaz above the 5th.' },
  { id: 'karcigar', name: 'Makam Karcığar', aka: 'Uşşak below, Hicaz on the 4th', steps: [0, 1.5, 3, 5, 6, 9, 10], region: 'Turkey · Greece', styles: ['turkbalkan'], note: 'A Turkish makam: the neutral 2nd of Bayati, then the augmented 2nd of Hijaz above the 4th.' },
  { id: 'homayun', name: 'Dastgah Homayun', aka: 'Persian', steps: [0, 1.5, 4, 5, 7, 8, 10], region: 'Iran', styles: ['persian'], note: 'A koron (quarter-flat) 2nd under a major 3rd: like Hijaz, but softer.' },

  // East Asia
  { id: 'iwato', name: 'Iwato', aka: 'Japanese', steps: [0, 1, 5, 6, 10], region: 'Japan', styles: ['eastasia'], note: 'Half steps above the tonic and the 4th, with a ♭5: stark and unresolved.' },
  { id: 'kumoi', name: 'Kumoi', aka: 'Japanese koto tuning', steps: [0, 2, 3, 7, 9], region: 'Japan', styles: ['eastasia'], note: 'A minor-sounding pentatonic with a major 6th.' },
  { id: 'insen', name: 'Insen', aka: 'Japanese (shakuhachi)', steps: [0, 1, 5, 7, 10], region: 'Japan', styles: ['eastasia'], note: 'The In scale with a ♭7 in place of the ♭6.' },
  { id: 'shang', name: 'Suspended pentatonic', aka: 'Chinese shang mode · Raga Madhyamavati (Carnatic) · Raga Megh', steps: [0, 2, 5, 7, 10], region: 'China · India · Celtic', styles: ['eastasia', 'carnatic', 'hindustani', 'celtic'], note: 'No 3rd at all: neither major nor minor.' }

];

/* Other names for the scales already in D.SCALES (same notes, another tradition) */
export const MORE_NAMES = {
  major: ['Dastgah Mahur', 'Kora tuning Silaba (approx.)'],
  lydian: ['Kora tuning Sauta (approx.)'],
  majpent: ['Chinese gong mode', 'Raga Mohanam'],
  minpent: ['Chinese yu mode', 'Ethiopian Bati minor'],
  yo: ['Raga Durga', 'Chinese zhi mode'],
  malkauns: ['Chinese jue mode'],
  bati: ['Ryukyu (Okinawa)'],
  misheberakh: ['Maqam Nikriz', 'Romanian minor', 'Greek Nikriz'],
  hungmin: ['Maqam Nawa Athar', 'Double harmonic minor', 'Simhendramadhyamam (Carnatic)'],
  purvi: ['Greek Piraiotikos'],
  phrydom: ['Ahava Raba (klezmer)', 'Greek Hitzaz'],
  dbharm: ['Greek Hitzazkiar'],
  phrygian: ['Greek Ousak (on a fretted bouzouki)', 'Maqam Kurd'],
  harmmin: ['Maqam Nahawand'],
  marwa: ['Raga Sohini'],
  inscale: ['Ethiopian Ambassel'],
  hirajoshi: ['Ethiopian Tizita (minor)']
};
