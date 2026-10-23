/* World Woodshed — rhythm variations: all original rhythms
   For every rhythm in RHYTHMS: traditional variations (the player's target part never changes), fills that
   end cleanly on beat 1 / sam, a suggested pass length, a practice tempo range and tips.
   Tala grids have one step per matra, so multi-stroke bols (TiRaKiTa, DhaGe) sound as one step and are
   named in the labels; dugun variations put two bols in each matra-step. */

const TEENTAL = ['Dha', 'Dhin', 'Dhin', 'Dha', 'Dha', 'Dhin', 'Dhin', 'Dha', 'Dha', 'Tin', 'Tin', 'Ta', 'Ta', 'Dhin', 'Dhin', 'Dha'];
const RUPAK = ['Tin', 'Tin', 'Na', 'Dhi', 'Na', 'Dhi', 'Na'];
const JHAPTAL = ['Dhi', 'Na', 'Dhi', 'Dhi', 'Na', 'Ti', 'Na', 'Dhi', 'Dhi', 'Na'];
const KEHERWA = ['Dha', 'Ge', 'Na', 'Ti', 'Na', 'Ka', 'Dhi', 'Na'];
const DADRA = ['Dha', 'Dhi', 'Na', 'Dha', 'Ti', 'Na'];
const EKTAL = ['Dhin', 'Dhin', 'DhaGe', 'TiRaKiTa', 'Tu', 'Na', 'Kat', 'Ta', 'DhaGe', 'TiRaKiTa', 'Dhi', 'Na'];
const ADI = ['Ta', 'Ka', 'Di', 'Mi', 'Ta', 'Ka', 'Di', 'Mi'];
const COUNT12 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const rep = (a, n) => [].concat(...Array(n).fill(a));
const swap = (a, i, v) => a.map((x, k) => (k === i ? v : x));

/* Son and rumba: one round of clave is one bar of sixteenths here (1 e & a 2 e & a …), which is two bars of
   eighths in the slow count many teachers use; one-bar parts (conga marcha, bass tumbao, güiro) repeat twice per round. */
const TUMBAO_BASS = '...x..x....x..x.';
const CONGA_OPEN = '......xx......xx';
const CONGA_SLAP = '..X.......X.....';
const CONGA_HEELTOE = 'xx.xxx..xx.xxx..';

/* Words the notes and tips use, per region, shown under each rhythm as “Words used here”. */
const WORDS = {
  cuba: [
    ['Clave', 'the five-hit pattern every part fits around; one round is one bar here'],
    ['3-2 and 2-3', 'which half of the clave comes first: the half with three hits or the half with two'],
    ['Tumbao', 'the repeating conga part, or the repeating bass part, that never plays on 1'],
    ['Montuno', 'the loud, repeating last part of a son or salsa song'],
    ['Cáscara', 'a pattern tapped on the metal shell of the timbales'],
    ['Martillo', 'the bongo player’s steady pattern (“hammer”)'],
    ['Abanico', 'a short timbales roll that announces a new section'],
    ['Guagua', 'a wooden tube played with sticks in rumba']
  ],
  brazil: [
    ['Surdo', 'the big bass drum of samba; the low one answers on beat 2'],
    ['Ganzá', 'a metal shaker playing every sixteenth'],
    ['Caixa', 'the snare drum'],
    ['Repinique', 'the high lead drum that plays the calls (chamada) the band answers'],
    ['Zabumba', 'the big two-headed drum of baião, played with a beater on top and a stick underneath']
  ],
  flamenco: [
    ['Compás', 'the repeating cycle of 12 counts (or 5 uneven beats in seguiriya)'],
    ['Palmas', 'hand claps; sordas are soft cupped claps'],
    ['Remate', 'a closing phrase; in soleá and bulerías it stops on count 10'],
    ['Llamada', 'a “call” phrase that tells the others a section is starting or ending'],
    ['Golpe', 'a heel stamp, or a tap on the guitar top']
  ],
  hindustani: [
    ['Matra', 'one beat of the cycle: one square of the grid'],
    ['Sam', 'beat 1 of the cycle, where phrases land; marked with a clap'],
    ['Khali', 'the “empty” section, shown with a wave of the hand instead of a clap'],
    ['Vibhag', 'one section of the cycle (for example 4 beats of teental)'],
    ['Theka', 'the basic tabla pattern that names the cycle'],
    ['Bol', 'a spoken name for a tabla stroke: Dha, Dhin, Na, Tin…'],
    ['Bayan', 'the left-hand bass drum of the tabla'],
    ['Tihai', 'a phrase played three times so that its last stroke lands on sam'],
    ['Bedam', 'a tihai with no gaps between the three phrases'],
    ['Prakar', 'a small variation of the theka'],
    ['Dugun', 'double speed: two bols in each beat'],
    ['Vilambit, drut', 'slow, fast']
  ],
  carnatic: [
    ['Konnakol', 'drum strokes spoken as syllables: Ta Ka Di Mi…'],
    ['Samam', 'beat 1 of the cycle, where phrases land'],
    ['Mora', 'a phrase played three times so that it ends on samam'],
    ['Korvai', 'a longer closing phrase built the same way'],
    ['Chatusra, tisra, khanda, misra', 'groups of 4, 3, 5 and 7 notes per beat or per phrase'],
    ['Kalam, nadai', 'speed (how many notes per beat) and the grouping of notes in a beat'],
    ['Mridangam', 'the two-headed drum of South India; Thom is its left-hand bass stroke']
  ],
  arabic: [
    ['Dum', 'the low stroke in the middle of the drum'],
    ['Tek, ka', 'high strokes on the rim, right hand and left hand'],
    ['Riq', 'a small tambourine with jingles']
  ],
  turkbalkan: [
    ['Dum, tek', 'low stroke in the middle of the drum, high stroke on the rim'],
    ['Short and long beats', 'beats two or three eighths long; the counts and the gaps in the grid show where each one starts']
  ],
  persian: [
    ['Tombak', 'the goblet drum of Iran'],
    ['Dum, tek', 'low stroke in the middle of the drum, high stroke on the rim']
  ],
  westafrica: [
    ['Timeline', 'the bell pattern that everyone fits around, like the clave'],
    ['Kpanlogo', 'a dance rhythm from Ghana, and the drum it is played on'],
    ['Djembe, dundun', 'the hand drum and the stick-played bass drums of Mande music']
  ]
};

export default {
  extra: [],
  words: WORDS,
  rhythms: {
    son32: {
      cycles: 8, tempo: [80, 130],
      variations: [
        { name: 'Conga marcha (tumbao) and bass tumbao', tracks: { clave: 'X..x..x...x.x...', hat: CONGA_HEELTOE, high: CONGA_SLAP, mid: CONGA_OPEN, low: TUMBAO_BASS },
          note: 'Conga: heel and toe on most counts, a sharp slap on the & of 1 and the & of 3, two open tones on the & and a of 2 and of 4. Bass: the a of 1, the & of 2, the a of 3 and the & of 4, never on 1.' },
        { name: 'Cáscara on the timbal shell (3-2)', tracks: { clave: 'X..x..x...x.x...', hat: 'x.xx.x.xx.x.xx.x', mid: CONGA_OPEN, low: TUMBAO_BASS },
          note: 'The timbales player taps this on the drum’s metal shell in the verse. Its second half lands on the clave’s last two hits, so it only fits one way round.' },
        { name: 'Son conjunto: güiro and maracas', tracks: { clave: 'X..x..x...x.x...', chick: 'X.xxX.xxX.xxX.xx', shaker: 'xxxxxxxxxxxxxxxx', low: TUMBAO_BASS },
          note: 'No bell: the güiro scrapes long-short-short and the maracas shake every sixteenth, as in the older son bands.' },
        { name: 'Bongó martillo', tracks: { clave: 'X..x..x...x.x...', hat: 'xxxxxx.xxxxxxx.x', mid: '......x.......x.', low: TUMBAO_BASS },
          note: 'The bongo player’s steady pattern (martillo, “hammer”): almost every sixteenth, with an open tone on the & of 2 and the & of 4.' },
        { name: 'Montuno: bongó bell and full tumbao', tracks: { clave: 'X..x..x...x.x...', bell: 'X.x.x.x.X.x.x.x.', high: CONGA_SLAP, mid: CONGA_OPEN, low: TUMBAO_BASS },
          note: 'In the loud, repeating last part of a song (the montuno) the bongo player switches to a hand bell on every number and &; the clave stays the same.' }
      ],
      fills: [
        { name: 'Abanico (timbales roll into the next 1)', cycles: 1, tracks: { clave: 'X..x..x...x.x...', high: '............xxxX', mid: CONGA_OPEN, low: TUMBAO_BASS },
          note: 'A short roll on the last beat signals a new section; in the band a cymbal and the bell land on the next 1.' },
        { name: 'Unison break on the clave', cycles: 1, tracks: { clave: 'X..x..x...x.x...', low: 'X..x..x...x.x...', mid: 'X..x..x...x.x...', high: 'X..x..x...x.x...' },
          note: 'The whole band hits the five clave strokes together and nothing else: the classic “a la clave” break.' }
      ],
      tips: ['Keep the clave going while you sing the conga tumbao, then swap.', 'In the shell (cáscara) variation, check that the pairs of quick taps fall in the half of the bar with three clave hits.', 'During the break, feel the empty spaces as strongly as the hits: the band comes back exactly on 1.']
    },

    son23: {
      cycles: 8, tempo: [80, 130],
      variations: [
        { name: 'Conga marcha (tumbao) and bass tumbao', tracks: { clave: '..X.x...x..x..x.', hat: CONGA_HEELTOE, high: CONGA_SLAP, mid: CONGA_OPEN, low: TUMBAO_BASS },
          note: 'The conga and bass parts are the same whichever way round the clave goes; only the clave changes.' },
        { name: 'Cáscara on the timbal shell (2-3)', tracks: { clave: '..X.x...x..x..x.', hat: 'x.x.xx.xx.xx.x.x', mid: CONGA_OPEN, low: TUMBAO_BASS },
          note: 'The two halves of the shell pattern swap places to follow the clave.' },
        { name: 'Son conjunto: güiro and maracas', tracks: { clave: '..X.x...x..x..x.', chick: 'X.xxX.xxX.xxX.xx', shaker: 'xxxxxxxxxxxxxxxx', low: TUMBAO_BASS },
          note: 'Long-short-short güiro and steady maracas under a 2-3 clave.' },
        { name: 'Montuno: bongó bell and full tumbao', tracks: { clave: '..X.x...x..x..x.', bell: 'X.x.x.x.X.x.x.x.', high: CONGA_SLAP, mid: CONGA_OPEN, low: TUMBAO_BASS },
          note: 'Bell on every number and &; listen for the clave’s first hit on the & of 1, not on 1.' }
      ],
      fills: [
        { name: 'Abanico (timbales roll into the next 1)', cycles: 1, tracks: { clave: '..X.x...x..x..x.', high: '............xxxX', mid: CONGA_OPEN, low: TUMBAO_BASS },
          note: 'After the roll the clave starts again from the same half: it never turns around.' },
        { name: 'Unison break on the clave', cycles: 1, tracks: { clave: '..X.x...x..x..x.', low: '..X.x...x..x..x.', mid: '..X.x...x..x..x.', high: '..X.x...x..x..x.' },
          note: 'Everyone hits the clave together; the first beat of the cycle is silent, so count it.' }
      ],
      tips: ['Start counting on 1 even though the clave starts on the & of 1: the silent 1 is the hard part.', 'Alternate a pass of Son clave 3-2 and Son clave 2-3 so you hear the same pattern from both ends.', 'In the break, say “one” out loud on the empty 1.']
    },

    rumba32: {
      cycles: 8, tempo: [85, 140], layaRamp: true,
      variations: [
        { name: 'Palitos (guagua) on the rumba clave', tracks: { clave: 'X..x...x..x.x...', hat: 'x.xx.x.xx.x.xx.x', mid: '............x.x.', high: '....x.......x...' },
          note: 'The sticks play every clave hit plus some in between; salsa’s shell pattern grew out of it.' },
        { name: 'Palmas on the clave', tracks: { clave: 'X..x...x..x.x...', clap: 'X..x...x..x.x...', mid: '............x.x.', high: '....x.......x...', shaker: 'x.x.x.x.x.x.x.x.' },
          note: 'Singers and dancers clap the clave with the stick player; feel the late third hit, on the a of 2.' },
        { name: 'Palitos and low drum on the downbeats', tracks: { clave: 'X..x...x..x.x...', hat: 'x.xx.x.xx.x.xx.x', low: 'x.......x.......', mid: '............x.x.', high: '....x.......x...' },
          note: 'A low drum marks 1 and 3 so you can hear how late the clave’s third hit comes, just before 3.' }
      ],
      fills: [
        { name: 'Quinto phrase into the next 1', cycles: 1, tracks: { clave: 'X..x...x..x.x...', high: 'X..x...x..x.xxxx', mid: '............x.x.' },
          note: 'The lead drum plays with the clave hits, then rolls into the next 1.' },
        { name: 'Break: clave alone', cycles: 1, tracks: { clave: 'X..x...x..x.x...' },
          note: 'The drums drop out for one cycle; keep the time in your body so they can come back together.' }
      ],
      tips: ['Rumba tends to speed up as the quinto heats up: practise with “speed up” on.', 'Say “1, a of 1, a of 2, & of 3, 4” (slow count: “1, 2 &, 4 & … 2, 3”) and make the third hit late enough.', 'Clap the clave while the palitos play, then switch to the palitos.']
    },

    tresillo: {
      cycles: 12, tempo: [70, 140],
      variations: [
        { name: 'Habanera bass under the tresillo', tracks: { clap: 'X..x..x.', low: 'x..xx.x.', shaker: 'xxxxxxxx' },
          note: 'The bass adds beat 3 to the tresillo: the habanera, its close cousin.' },
        { name: 'Cinquillo on the bell', tracks: { clap: 'X..x..x.', bell: 'x.xx.xx.', low: 'x.......' },
          note: 'The Cuban danzón cinquillo fills in two strokes between the tresillo notes.' },
        { name: 'Kick on every beat, snare on the tresillo', tracks: { clap: 'X..x..x.', low: 'x.x.x.x.', high: '...x..x.' },
          note: 'Straight kicks with the tresillo’s last two notes on the snare: the idea behind the dembow of reggaeton.' },
        { name: 'Bell on the beat', tracks: { clap: 'X..x..x.', bell: 'x.x.x.x.' },
          note: 'Only the beat around you: feel the second and third claps fall between the bells.' }
      ],
      fills: [
        { name: 'Cinquillo break', cycles: 1, tracks: { clap: 'X.xx.xx.', low: 'x.xx.xx.' },
          note: 'Everyone plays the five-note cinquillo once, then the tresillo returns.' },
        { name: 'Stop on the third note', cycles: 1, tracks: { clap: 'X..x..X.', low: 'x.....x.', shaker: 'xxxxxx..' },
          note: 'The band stops after the last tresillo note; land the next downbeat together.' }
      ],
      tips: ['Count 1-2-3 1-2-3 1-2 under your breath: the groups are the rhythm.', 'Try it over the four-on-the-floor variation: the clash is what makes it dance.']
    },

    bembe: {
      cycles: 8, tempo: [70, 130],
      variations: [
        { name: 'Feel it in four: dotted-quarter pulse', tracks: { bell: 'X.x.xx.x.x.x', shaker: 'x..x..x..x..', low: 'x.....x.....' },
          note: 'The shaker marks the four big beats that dancers step to; the bell floats over them.' },
        { name: 'Claps in three (6 against 4)', tracks: { bell: 'X.x.xx.x.x.x', clap: 'x.x.x.x.x.x.', low: 'x..x..x..x..' },
          note: 'Six even claps per cycle against the four big beats: the cross-rhythm at the heart of 12/8.' },
        { name: 'Claps on big beats 2 and 4', tracks: { bell: 'X.x.xx.x.x.x', clap: '...x.....x..', low: 'x.....x.....', shaker: 'xxxxxxxxxxxx' },
          note: 'Like a backbeat in 12/8: notice which bell strokes line up with the claps.' },
        { name: 'Shekere doubles the bell', tracks: { bell: 'X.x.xx.x.x.x', shaker: 'X.x.xx.x.x.x', low: 'x..x..x..x..' },
          note: 'The rattle reinforces the timeline; listen for the two short gaps after strokes 3 and 7.' }
      ],
      fills: [
        { name: 'Unison break on the timeline', cycles: 1, tracks: { bell: 'X.x.xx.x.x.x', low: 'X.x.xx.x.x.x', mid: 'X.x.xx.x.x.x' },
          note: 'All the drums play the bell pattern together for one cycle, then drop back to their parts.' },
        { name: 'Big beats only', cycles: 1, tracks: { bell: 'X..x..x..x..', low: 'X..x..x..x..', shaker: 'X..x..x..x..' },
          note: 'The timeline stops: hold its shape in your head over the four beats.' }
      ],
      tips: ['Step the four big beats with your feet while you clap the bell.', 'Sing the bell starting from its 2nd stroke and from its 5th: West African players hear it from many entry points.', 'Switch between the “in 4” and “in 3” variations without stopping.']
    },

    habanera: {
      cycles: 12, tempo: [55, 110],
      variations: [
        { name: 'Tango marcato in four', tracks: { low: 'X..xx.x.', chick: 'x.x.x.x.' },
          note: 'Four even chords per bar over the habanera bass, as in early tango.' },
        { name: '3-3-2 accents on top', tracks: { low: 'X..xx.x.', chick: 'X..x..x.', shaker: 'x.x.x.x.' },
          note: 'The upper part plays the tresillo while the bass keeps the habanera: they share all but one note.' },
        { name: 'Cinquillo in the right hand', tracks: { low: 'X..xx.x.', bell: 'x.xx.xx.' },
          note: 'The contradanza and danzón figure that sits over the habanera in 19th-century Cuban piano music.' },
        { name: 'Oom-pah chords (ragtime left hand)', tracks: { low: 'X..xx.x.', chick: '..x...x.' },
          note: 'Chords on the offbeat eighths: the “Spanish tinge” Jelly Roll Morton spoke of.' }
      ],
      fills: [
        { name: 'Stop-time ending', cycles: 1, tracks: { low: 'X...X...', shaker: '........' },
          note: 'Two firm hits and silence; the habanera comes back on the next downbeat.' }
      ],
      tips: ['Lean on the first note and keep the “and” of 1 short.', 'Play the bass on your thumb and the cinquillo with your fingers.']
    },

    bossa: {
      cycles: 8, tempo: [100, 150],
      variations: [
        { name: 'Shaker sixteenths, accent on the last', tracks: { clave: 'x..x..x...x..x..', low: 'x.....x.x.....x.', shaker: 'xxxXxxxXxxxXxxxX' },
          note: 'The samba lilt underneath: the last sixteenth of each beat leans forward.' },
        { name: 'Jazz bossa: ride eighths', tracks: { clave: 'x..x..x...x..x..', low: 'x.....x.x.....x.', ride: 'x.x.x.x.x.x.x.x.' },
          note: 'The way bossa is played on a drum kit in jazz: rim clicks with ride cymbal eighths.' },
        { name: 'Bass on 1 and 3 only', tracks: { clave: 'x..x..x...x..x..', low: 'x.......x.......', shaker: 'x.x.x.x.x.x.x.x.' },
          note: 'A plainer thumb: notice how the rim pattern now carries all the syncopation.' },
        { name: 'Hi-hat on the offbeats', tracks: { clave: 'x..x..x...x..x..', low: 'x.....x.x.....x.', hat: '..x...x...x...x.' },
          note: 'The “and” of every beat ticks: check which rim clicks fall with it.' }
      ],
      fills: [
        { name: 'Snare pickup into 1', cycles: 1, tracks: { clave: 'x..x..x...x..x..', low: 'x.....x.x.....x.', high: '............x.xx' },
          note: 'A soft brush pickup on beat 4 sets up the next phrase.' },
        { name: 'Break: rim alone', cycles: 1, tracks: { clave: 'x..x..x...x..x..' },
          note: 'Bass and shaker stop; keep the bass in your head.' }
      ],
      tips: ['Play it on guitar: thumb on the bass track, fingers on the rim pattern.', 'Keep it quiet; bossa nova grooves come from evenness, not volume.']
    },

    samba: {
      cycles: 8, tempo: [80, 120],
      variations: [
        { name: 'Pandeiro feel: accent on the last sixteenth', tracks: { low: '....X.......X...', mid: 'x.......x.......', shaker: 'xxxXxxxXxxxXxxxX' },
          note: 'The forward lean of samba: each beat’s fourth sixteenth is pushed.' },
        { name: 'Caixa (snare) sixteenths', tracks: { low: '....X.......X...', mid: 'x.......x.......', high: 'xxXxxxXxxxXxxxXx', shaker: 'XxxxxxxxXxxxxxxx' },
          note: 'The snare section fills every sixteenth; the surdos still answer each other on 1 and 2.' },
        { name: 'Palmas with the surdo', tracks: { low: '....X.......X...', mid: 'x.......x.......', clap: '....x.......x...', shaker: 'xxxXxxxXxxxXxxxX' },
          note: 'Samba de roda style: the hands clap with the strong surdo on beat 2.' },
        { name: 'Surdos only', tracks: { low: '....X.......X...', mid: 'x.......x.......' },
          note: 'Just the two surdos in conversation: beat 1 asks, beat 2 answers.' }
      ],
      fills: [
        { name: 'Repinique call (chamada) and stop', cycles: 1, tracks: { low: '....X...........', high: 'X..x..x...x.x.x.', shaker: 'Xxxxxxxx........' },
          note: 'A typical call shape: the lead drum calls and the bateria comes back together on the next 1.' },
        { name: 'Break: everyone on beat 2', cycles: 1, tracks: { low: '....X.......X...', mid: '....X.......X...', high: '....X.......X...' },
          note: 'All the drums hit only the surdo’s beat 2: the beat samba leans on.' }
      ],
      tips: ['Walk the surdo: left foot on 1, right foot (heavier) on 2.', 'Keep your sixteenths light; the push on the last one is small.']
    },

    maqsum: {
      cycles: 12, tempo: [70, 140],
      variations: [
        { name: 'Filled maqsum (tek-ka)', tracks: { low: 'x...x...', high: '.x.x..x.', hat: '..x..x.x' }, labels: ['D', 'T', 'ka', 'T', 'D', 'ka', 'T', 'ka'],
          note: 'Light “ka” strokes fill the gaps, the way a darbuka player keeps the hand moving.' },
        { name: 'Riq jingles in eighths', tracks: { low: 'x...x...', high: '.x.x..x.', shaker: 'Xxxxxxxx' }, labels: ['D', 'T', '', 'T', 'D', '', 'T', ''],
          note: 'The tambourine (riq) shimmers on every eighth; dum and tek stay underneath.' },
        { name: 'Bass drum doubles the dums', tracks: { low: 'x...x...', high: '.x.x..x.', mid: 'X...x...' }, labels: ['D', 'T', '', 'T', 'D', '', 'T', ''],
          note: 'A tabl or frame drum reinforces both dums so you can feel the bar in two halves.' },
        { name: 'Sha’bi handclaps', tracks: { low: 'x...x...', high: '.x.x..x.', clap: '..x...x.' }, labels: ['D', 'T', '', 'T', 'D', '', 'T', ''],
          note: 'Party claps on 2 and 4: one lands between the teks, one on the last tek.' }
      ],
      fills: [
        { name: 'Tek-ka roll into the next dum', cycles: 1, tracks: { low: 'x.......', high: '.xxxxxxX' }, labels: ['D', 'T', 'ka', 'T', 'ka', 'T', 'ka', 'T'],
          note: 'After the first dum, unbroken tek-ka strokes build to the next downbeat.' },
        { name: 'Stop: three dums (3+3+2)', cycles: 1, tracks: { low: 'X..X..X.', high: '........' }, labels: ['D', '', '', 'D', '', '', 'D', ''],
          note: 'A common ending or break figure: three dums and silence before the rhythm resumes.' }
      ],
      tips: ['Say the syllables: “Dum tek – tek dum – tek –”.', 'Clap the teks while you tap the dums on your leg.', 'Go back and forth between maqsum and baladi to hear the one changed stroke.']
    },

    baladi: {
      cycles: 12, tempo: [70, 130],
      variations: [
        { name: 'Filled baladi (tek-ka)', tracks: { low: 'xx..x...', high: '...x..x.', hat: '..x..x.x' }, labels: ['D', 'D', 'ka', 'T', 'D', 'ka', 'T', 'ka'],
          note: '“Ka” strokes fill in; the two opening dums still dominate.' },
        { name: 'Riq jingles in eighths', tracks: { low: 'xx..x...', high: '...x..x.', shaker: 'Xxxxxxxx' }, labels: ['D', 'D', '', 'T', 'D', '', 'T', ''],
          note: 'Even jingles make the heavy start of the bar stand out.' },
        { name: 'Bass drum on the dums', tracks: { low: 'xx..x...', high: '...x..x.', mid: 'Xx..x...' }, labels: ['D', 'D', '', 'T', 'D', '', 'T', ''],
          note: 'A deep drum doubles all three dums: the earthy, street (baladi) sound.' },
        { name: 'Handclaps on 2 and 4', tracks: { low: 'xx..x...', high: '...x..x.', clap: '..x...x.' }, labels: ['D', 'D', '', 'T', 'D', '', 'T', ''],
          note: 'The claps answer the double dum.' }
      ],
      fills: [
        { name: 'Tek-ka roll into the next dum', cycles: 1, tracks: { low: 'xx......', high: '..xxxxxX' }, labels: ['D', 'D', 'ka', 'T', 'ka', 'T', 'ka', 'T'],
          note: 'Keep the double dum, then fill to the end of the bar.' },
        { name: 'Stop: dum-dum … dum', cycles: 1, tracks: { low: 'XX..X...', high: '........' }, labels: ['D', 'D', '', '', 'D', '', '', ''],
          note: 'Only the dums sound; the teks are silent for one cycle.' }
      ],
      tips: ['Make the two opening dums equal and heavy.', 'Switch to maqsum mid-pass and back without losing the bar line.']
    },

    saidi: {
      cycles: 12, tempo: [80, 140],
      variations: [
        { name: 'Filled sa’idi (tek-ka)', tracks: { low: 'x..xx...', high: '.x....x.', hat: '..x..x.x' }, labels: ['D', 'T', 'ka', 'D', 'D', 'ka', 'T', 'ka'],
          note: 'The “ka” fills around the double dum in the middle.' },
        { name: 'Tabl baladi doubles the dums', tracks: { low: 'x..xx...', high: '.x....x.', mid: 'X..Xx...' }, labels: ['D', 'T', '', 'D', 'D', '', 'T', ''],
          note: 'The big two-headed drum of Upper Egypt pounds the dums, as with the mizmar and stick dance.' },
        { name: 'Claps on the double dum', tracks: { low: 'x..xx...', high: '.x....x.', clap: '...xx...' }, labels: ['D', 'T', '', 'D', 'D', '', 'T', ''],
          note: 'Clapping the giveaway double dum makes it impossible to miss.' },
        { name: 'Riq jingles in eighths', tracks: { low: 'x..xx...', high: '.x....x.', shaker: 'Xxxxxxxx' }, labels: ['D', 'T', '', 'D', 'D', '', 'T', ''],
          note: 'Even jingles under the uneven dums.' }
      ],
      fills: [
        { name: 'Tek-ka roll into the next dum', cycles: 1, tracks: { low: 'x.......', high: '.xxxxxxX' }, labels: ['D', 'T', 'ka', 'T', 'ka', 'T', 'ka', 'T'],
          note: 'The middle dums give way to a roll that lands on the next 1.' },
        { name: 'Stop on the double dum', cycles: 1, tracks: { low: 'x..XX...', high: '.x......' }, labels: ['D', 'T', '', 'D', 'D', '', '', ''],
          note: 'Play up to the double dum, then hold the silence.' }
      ],
      tips: ['Lean on the second of the two middle dums.', 'Tap the dums on your thigh and the teks on the side of your guitar.']
    },

    malfuf: {
      cycles: 16, tempo: [70, 120],
      variations: [
        { name: 'Filled malfuf (ka strokes)', tracks: { low: 'x.......', high: '...x..x.', hat: '.xx.xx.x' }, labels: ['D', 'ka', 'ka', 'T', 'ka', 'ka', 'T', 'ka'],
          note: 'Every sixteenth sounds; the 3+3+2 accents must still stand out.' },
        { name: 'Claps on the 3+3+2', tracks: { low: 'x.......', high: '...x..x.', clap: 'x..x..x.' }, labels: ['D', '', '', 'T', '', '', 'T', ''],
          note: 'The claps outline the whole tresillo shape, dum included.' },
        { name: 'Riq in sixteenths', tracks: { low: 'x.......', high: '...x..x.', shaker: 'Xxxxxxxx' }, labels: ['D', '', '', 'T', '', '', 'T', ''],
          note: 'A fast, even shimmer: feel the gap after the dum.' }
      ],
      fills: [
        { name: 'Tek-ka roll into the next dum', cycles: 1, tracks: { low: 'x.......', high: '.xxxxxxX' }, labels: ['D', 'T', 'ka', 'T', 'ka', 'T', 'ka', 'T'],
          note: 'A short roll for an entrance or transition.' }
      ],
      tips: ['Malfuf is fast: count it in two, not in eight.', 'Compare it with tresillo: the same 3+3+2, spoken as dum-tek-tek.']
    },

    rachenitsa: {
      cycles: 16, tempo: [220, 420],
      variations: [
        { name: 'Claps on the three beats', tracks: { low: 'X......', high: '..x.x..', clap: 'x.x.x..' },
          note: 'Clap quick, quick, slow: the long third beat is what dancers feel.' },
        { name: 'Tapan pickup into 1', tracks: { low: 'X......', high: '..x.x..', mid: '......x', shaker: 'xxxxxxx' },
          note: 'The last pulse kicks the next downbeat, the way a tapan player drives the dance.' },
        { name: 'Tarambuka fills', tracks: { low: 'X......', high: '..x.x..', hat: '.x.x.xx' },
          note: 'Light strokes fill every remaining pulse; keep the 2+2+3 shape clear.' }
      ],
      fills: [
        { name: 'Tapan run into 1', cycles: 1, tracks: { low: 'X.....x', high: 'xxxxxxx' },
          note: 'Every pulse sounds for one cycle, building into the next downbeat.' },
        { name: 'Hold the long beat', cycles: 1, tracks: { low: 'X...X..', high: '.......' },
          note: 'Hits on 1 and on the long beat, then silence: count the 3.' }
      ],
      tips: ['Say “ta-ka ta-ka ta-ki-ta”.', 'At dance tempo feel three beats, the last a little longer.']
    },

    kalamatianos: {
      cycles: 16, tempo: [200, 380],
      variations: [
        { name: 'Claps on the three beats', tracks: { low: 'X......', high: '...x.x.', clap: 'x..x.x.' },
          note: 'Slow, quick, quick: the long beat comes first.' },
        { name: 'Defi (frame drum) jingles', tracks: { low: 'X......', high: '...x.x.', shaker: 'xxxxxxx' },
          note: 'Even pulses: count 1-2-3 1-2 1-2.' },
        { name: 'Filled pulses', tracks: { low: 'X......', high: '...x.x.', hat: '.xx.x.x' },
          note: 'Light strokes on every remaining pulse.' }
      ],
      fills: [
        { name: 'Daouli run into 1', cycles: 1, tracks: { low: 'X.....x', high: 'xxxxxxx' },
          note: 'Every pulse for one cycle, landing on the next downbeat.' }
      ],
      tips: ['Say “ta-ki-ta ta-ka ta-ka”.', 'Practise it after rachenitsa: same 7, the long beat moved to the front.']
    },

    karsilama: {
      cycles: 12, tempo: [220, 400],
      variations: [
        { name: 'Claps on the four beats', tracks: { low: 'X........', high: '..x.x.x..', clap: 'x.x.x.x..' },
          note: 'Three short beats and a long one: clap 1, 2, 3, 4-and-.' },
        { name: 'Darbuka ka fills', tracks: { low: 'X........', high: '..x.x.x..', hat: '.x.x.x.xx' },
          note: 'Light strokes fill every pulse; feel the stretch of the last group.' },
        { name: 'Tambourine pulses', tracks: { low: 'X........', high: '..x.x.x..', shaker: 'Xxxxxxxxx' },
          note: 'Nine even pulses, accent on 1.' }
      ],
      fills: [
        { name: 'Run into 1', cycles: 1, tracks: { low: 'X.......x', high: 'xxxxxxxxx' },
          note: 'Every pulse for one cycle; the last one pushes into the downbeat.' }
      ],
      tips: ['Count “1-2 2-2 3-2 4-2-3”.', 'Dance it: three even steps, then a longer one.']
    },

    kopanitsa: {
      cycles: 12, tempo: [240, 420],
      variations: [
        { name: 'Claps on the five beats', tracks: { low: 'X...x......', high: '..x....x.x.', clap: 'x.x.x..x.x.' },
          note: 'Short, short, LONG, short, short: the long beat is in the middle.' },
        { name: 'Tambourine pulses', tracks: { low: 'X...x......', high: '..x....x.x.', shaker: 'Xxxxxxxxxxx' },
          note: 'Eleven even pulses; let the groups show through.' },
        { name: 'Tarambuka fills', tracks: { low: 'X...x......', high: '..x....x.x.', hat: '.x.x.xx.x.x' },
          note: 'Every remaining pulse is filled; keep the long beat clear.' }
      ],
      fills: [
        { name: 'Stop on the long beat', cycles: 1, tracks: { low: 'X...X......', high: '..x........' },
          note: 'Play into the long middle beat and hold the rest of the cycle in silence.' }
      ],
      tips: ['Say “ta-ka ta-ka ta-ki-ta ta-ka ta-ka”.', 'Learn it slowly in five beats before the fast pulse.']
    },

    teental: {
      cycles: 5, tempo: [60, 220], layaRamp: true,
      variations: [
        { name: 'Theka with TiRaKiTa before the return', tracks: { low: 'xxxxxxxxx....xxx', high: 'XxxxxxxxxxxxXxxx', clap: 'X...x...x...x...' }, labels: swap(TEENTAL, 12, 'TiRaKiTa'),
          note: 'A common prakar: TiRaKiTa (four quick strokes, one matra here) replaces the 13th Ta and leads back to the bayan.' },
        { name: 'Prakar with Dha-Ge on the vibhag ends', tracks: { low: 'xxxXxxxXx....xxX', high: 'Xxxxxxxxxxxxxxxx', clap: 'X...x...x...x...' },
          labels: ['Dha', 'Dhin', 'Dhin', 'DhaGe', 'Dha', 'Dhin', 'Dhin', 'DhaGe', 'Dha', 'Tin', 'Tin', 'Ta', 'Ta', 'Dhin', 'Dhin', 'DhaGe'],
          note: 'The bayan adds a Ge after the last Dha of each tali vibhag; the khali section stays closed.' },
        { name: 'Tilwada theka (same 16 matras)', tracks: { low: 'x.xxxx....xxxxxx', high: 'Xxxxxxxxxxxxxxxx', clap: 'X...x...x...x...' },
          labels: ['Dha', 'TiRaKiTa', 'Dhin', 'Dhin', 'Dha', 'Dha', 'Tin', 'Tin', 'Ta', 'TiRaKiTa', 'Dhin', 'Dhin', 'Dha', 'Dha', 'Dhin', 'Dhin'],
          note: 'The theka of Tilwada, a slow 16-beat tala with the same claps and khali; the bayan drops out on Tin Tin and Ta TiRaKiTa.' },
        { name: 'Dugun theka (double speed)', tracks: { low: 'xxxxx.xxxxxxx.xx', high: 'XxxxxxxxXxxxxxxx', clap: 'X...x...x...x...' },
          labels: rep(['DhaDhin', 'DhinDha', 'DhaDhin', 'DhinDha', 'DhaTin', 'TinTa', 'TaDhin', 'DhinDha'], 2),
          note: 'The whole theka twice per cycle, two bols per matra; the grid has one step per matra, so each step names both bols and sounds once.' }
      ],
      fills: [
        { name: 'Sam-to-sam tihai: Dha TiRaKiTa Dhin Na Dha ×3', cycles: 2,
          tracks: { low: 'X.x.X.x.x.X.x.x.' + 'Xxxxxxxxx....xxx', high: 'XxxxX.xxxxX.xxxx' + 'Xxxxxxxxxxxxxxxx', clap: 'X...x...x...x...X...x...x...x...' },
          labels: ['Dha', 'TiRaKiTa', 'Dhin', 'Na', 'Dha', '–', 'Dha', 'TiRaKiTa', 'Dhin', 'Na', 'Dha', '–', 'Dha', 'TiRaKiTa', 'Dhin', 'Na'].concat(TEENTAL),
          note: 'A 5-matra phrase with a 1-matra gap, three times: 17 matras from sam to the next sam, where the third Dha lands and the theka resumes.' },
        { name: 'Tihai: TiRaKiTa Dha – ×3 to the next sam', cycles: 1,
          tracks: { low: 'xxxxxxxxx.X..X..', high: 'xxxxxxxxxxX.xX.x', clap: 'X...x...x...x...' },
          labels: TEENTAL.slice(0, 9).concat(['TiRaKiTa', 'Dha', '–', 'TiRaKiTa', 'Dha', '–', 'TiRaKiTa']),
          note: 'Theka to the 9th matra, then the tihai: its third Dha is the sam of the next cycle.' },
        { name: 'Chakradar: TiRaKiTa TaKiTa Dha tihai ×3', cycles: 3,
          tracks: { low: '..X...X...X'.repeat(3) + 'xxxxxxxx....xxx', high: 'xxX.xxX.xxX'.repeat(3) + 'xxxxxxxxxxxxxxx', clap: 'X...x...x...x...'.repeat(3) },
          labels: rep(['TiRaKiTa', 'TaKiTa', 'Dha', '–', 'TiRaKiTa', 'TaKiTa', 'Dha', '–', 'TiRaKiTa', 'TaKiTa', 'Dha'], 3).concat(TEENTAL.slice(1)),
          note: 'An 11-matra tihai played three times without a break: 33 matras from sam, the ninth Dha lands on sam of the third cycle.' }
      ],
      tips: ['Clap and wave the tala with your hand while the theka plays: clap, clap, wave, clap.', 'Recite the bols, then recite the tihai and check that the last Dha meets your clap on sam.', 'Teental pieces start slow and speed up: try “speed up” and keep the claps even.']
    },

    rupak: {
      cycles: 8, tempo: [70, 200], layaRamp: true,
      variations: [
        { name: 'TiRaKiTa in the khali vibhag', tracks: { low: '...x.x.', high: 'xxXxxxx', clap: 'X..x.x.' }, labels: swap(RUPAK, 2, 'TiRaKiTa'),
          note: 'The third matra becomes TiRaKiTa: a little rush before the first Dhi.' },
        { name: 'TiRaKiTa pickup into sam', tracks: { low: '...x.x.', high: 'xxxxxxX', clap: 'X..x.x.' }, labels: swap(RUPAK, 6, 'TiRaKiTa'),
          note: 'The last Na becomes TiRaKiTa, leading into the open sam on Tin.' },
        { name: 'Dugun theka (double speed)', tracks: { low: '.xx..xx', high: 'Xxxxxxx', clap: 'X..x.x.' },
          labels: ['TinTin', 'NaDhi', 'NaDhi', 'NaTin', 'TinNa', 'DhiNa', 'DhiNa'],
          note: 'Two bols per matra, so the theka runs twice per cycle; with one step per matra each step names both bols.' }
      ],
      fills: [
        { name: 'Tihai: TiRaKiTa Dha ×3 to the next sam', cycles: 1,
          tracks: { low: '...X.X.', high: 'xxxXxXx', clap: 'X..x.x.' }, labels: ['Tin', 'Tin', 'TiRaKiTa', 'Dha', 'TiRaKiTa', 'Dha', 'TiRaKiTa'],
          note: 'A short bedam (gapless) tihai; the third Dha falls on the next sam.' },
        { name: 'Sam-to-sam tihai: Dha TiRaKiTa Dhin Na Dha ×3', cycles: 3,
          tracks: { low: 'x.x.X'.repeat(3) + '..x.x.', high: 'xxxxX'.repeat(3) + 'xxxxxx', clap: 'X..x.x.'.repeat(3) },
          labels: rep(['Dha', 'TiRaKiTa', 'Dhin', 'Na', 'Dha'], 3).concat(RUPAK.slice(1)),
          note: 'Three 5-matra phrases, 15 matras from sam: the last Dha lands on sam of the third cycle, then the theka returns.' }
      ],
      tips: ['Start the cycle with a wave, not a clap: sam is khali in rupak.', 'Count it 3+2+2 out loud before you add the bols.']
    },

    jhaptal: {
      cycles: 6, tempo: [70, 200], layaRamp: true,
      variations: [
        { name: 'TiRaKiTa on khali', tracks: { low: 'x.xx...xx.', high: 'xxxxxXxxxx', clap: 'X.x..x.x..' }, labels: swap(JHAPTAL, 5, 'TiRaKiTa'),
          note: 'Ti on the 6th matra (khali) becomes TiRaKiTa; the bayan stays silent there.' },
        { name: 'TiRaKiTa pickup into sam', tracks: { low: 'x.xx...xx.', high: 'xxxxxxxxxX', clap: 'X.x..x.x..' }, labels: swap(JHAPTAL, 9, 'TiRaKiTa'),
          note: 'The last Na becomes TiRaKiTa, pushing into the Dhi on sam.' },
        { name: 'Dugun theka (double speed)', tracks: { low: 'xx.xxxx.xx', high: 'XxxxxXxxxx', clap: 'X.x..x.x..' },
          labels: rep(['DhiNa', 'DhiDhi', 'NaTi', 'NaDhi', 'DhiNa'], 2),
          note: 'The ten bols fit into five matras and repeat; the grid has one step per matra, so each step names a pair of bols.' }
      ],
      fills: [
        { name: 'Tihai: TiRaKiTa Dha – ×3 to the next sam', cycles: 1,
          tracks: { low: 'x.x.X..X..', high: 'xxxxX.xX.x', clap: 'X.x..x.x..' }, labels: ['Dhi', 'Na', 'Dhi', 'TiRaKiTa', 'Dha', '–', 'TiRaKiTa', 'Dha', '–', 'TiRaKiTa'],
          note: 'Starts on the 4th matra; the third Dha is the next sam.' },
        { name: 'Sam-to-sam tihai: TiRaKiTa TaKiTa Dha – ×3', cycles: 2,
          tracks: { low: '..X...X...' + 'X.xx...xx.', high: 'xxX.xxX.xx' + 'Xxxxxxxxxx', clap: 'X.x..x.x..X.x..x.x..' },
          labels: ['TiRaKiTa', 'TaKiTa', 'Dha', '–', 'TiRaKiTa', 'TaKiTa', 'Dha', '–', 'TiRaKiTa', 'TaKiTa', 'Dha'].concat(JHAPTAL.slice(1)),
          note: '11 matras from sam to sam: the third Dha lands on the next sam and the theka resumes.' }
      ],
      tips: ['Count 2+3+2+3 and clap 1, 3, wave 6, clap 8.', 'Say the theka slowly with the hand signs before you play along.']
    },

    keherwa: {
      cycles: 10, tempo: [70, 220], layaRamp: true,
      variations: [
        { name: 'Prakar with a second Ge', tracks: { low: 'xx.x..x.', high: 'x.x.xxxx', clap: 'X...x...' }, labels: swap(KEHERWA, 3, 'Ge'),
          note: 'Dha Ge Na Ge: a bouncier, dholak-like first half; the khali half is unchanged.' },
        { name: 'TiRaKiTa pickup into sam', tracks: { low: 'xx....x.', high: 'x.xxxxxX', clap: 'X...x...' }, labels: swap(KEHERWA, 7, 'TiRaKiTa'),
          note: 'The last Na becomes TiRaKiTa, rushing into the next Dha.' },
        { name: 'Dugun theka (double speed)', tracks: { low: 'x..xx..x', high: 'XxxxXxxx', clap: 'X...x...' },
          labels: rep(['DhaGe', 'NaTi', 'NaKa', 'DhiNa'], 2),
          note: 'The theka twice per cycle, two bols per matra; one step per matra, so each step names a pair.' }
      ],
      fills: [
        { name: 'Tihai: TiRaKiTa Dha ×3 to the next sam', cycles: 1,
          tracks: { low: 'xx..X.X.', high: 'x.xxXxXx', clap: 'X...x...' }, labels: ['Dha', 'Ge', 'Na', 'TiRaKiTa', 'Dha', 'TiRaKiTa', 'Dha', 'TiRaKiTa'],
          note: 'From the 4th matra; the third Dha is the next sam.' },
        { name: 'Sam-to-sam tihai: TiRaKiTa TaKiTa Dha ×3', cycles: 2,
          tracks: { low: '..X..X..' + 'Xx....x.', high: 'xxXxxXxx' + 'X.xxxxxx', clap: 'X...x...X...x...' },
          labels: rep(['TiRaKiTa', 'TaKiTa', 'Dha'], 3).concat(KEHERWA.slice(1)),
          note: 'Nine matras from sam: the third Dha lands on the next sam.' }
      ],
      tips: ['Feel keherwa in two halves: bayan open in the first, closed until Dhi in the second.', 'Light songs (bhajan, ghazal, film) often speed up at the end: try “speed up”.']
    },

    dadra: {
      cycles: 12, tempo: [80, 240], layaRamp: true,
      variations: [
        { name: 'Resonant strokes: Dha Dhin Na | Dha Tin Na', tracks: { low: 'xx.x..', high: 'xXxxXx', clap: 'X..x..' }, labels: ['Dha', 'Dhin', 'Na', 'Dha', 'Tin', 'Na'],
          note: 'Open, ringing Dhin and Tin in place of the closed Dhi and Ti.' },
        { name: 'Bayan Ge: Dha Ge Na | Dha Ti Na', tracks: { low: 'xX.x..', high: 'x.xxxx', clap: 'X..x..' }, labels: ['Dha', 'Ge', 'Na', 'Dha', 'Ti', 'Na'],
          note: 'The second matra is played on the bayan alone, giving a lilting swing.' },
        { name: 'Dugun theka (double speed)', tracks: { low: 'xx.xx.', high: 'XxxXxx', clap: 'X..x..' },
          labels: rep(['DhaDhi', 'NaDha', 'TiNa'], 2),
          note: 'The theka twice per cycle, two bols per matra; one step per matra, so each step names a pair.' }
      ],
      fills: [
        { name: 'Tihai: TiRaKiTa Dha ×3 to the next sam', cycles: 1,
          tracks: { low: 'x.X.X.', high: 'xxXxXx', clap: 'X..x..' }, labels: ['Dha', 'TiRaKiTa', 'Dha', 'TiRaKiTa', 'Dha', 'TiRaKiTa'],
          note: 'Bedam (gapless); the third Dha is the next sam.' },
        { name: 'Sam-to-sam tihai: TiRaKiTa TaKiTa Dha – – ×3', cycles: 3,
          tracks: { low: '..X...' + '.X....' + 'Xx.x..', high: 'xxX..x' + 'xX..xx' + 'Xxxxxx', clap: 'X..x..'.repeat(3) },
          labels: ['TiRaKiTa', 'TaKiTa', 'Dha', '–', '–', 'TiRaKiTa', 'TaKiTa', 'Dha', '–', '–', 'TiRaKiTa', 'TaKiTa', 'Dha'].concat(DADRA.slice(1)),
          note: '13 matras from sam: phrases of 3 with gaps of 2, the last Dha lands on sam of the third cycle.' }
      ],
      tips: ['Feel two beats of three: clap on 1, wave on 4.', 'Dadra songs often finish with a fast laggi: try “speed up”.']
    },

    ektal: {
      cycles: 4, tempo: [40, 200], layaRamp: true,
      variations: [
        { name: 'TiRaKiTa pickup into sam', tracks: { low: 'xxx...x.x.x.', high: 'xxxxxx.xxxxX', clap: 'X.x.x.x.x.x.' }, labels: swap(EKTAL, 11, 'TiRaKiTa'),
          note: 'The last Na becomes TiRaKiTa; Kat on the 7th matra is a bayan-only stroke.' },
        { name: 'Open Dhin before sam', tracks: { low: 'xxx...x.x.x.', high: 'xxxxxx.xxxXx', clap: 'X.x.x.x.x.x.' }, labels: swap(EKTAL, 10, 'Dhin'),
          note: 'Dhi Na becomes Dhin Na: a ringing stroke that announces the sam.' },
        { name: 'Dugun theka (double speed)', tracks: { low: 'xx.xxxxx.xxx', high: 'XxxxxxXxxxxx', clap: 'X.x.x.x.x.x.' },
          labels: rep(['Dhin Dhin', 'DhaGe TiRaKiTa', 'Tu Na', 'Kat Ta', 'DhaGe TiRaKiTa', 'Dhi Na'], 2),
          note: 'Two bols per matra, so the theka runs twice per cycle; one step per matra, so each step names its bols.' }
      ],
      fills: [
        { name: 'Tihai: TiRaKiTa Dha – ×3 to the next sam', cycles: 1,
          tracks: { low: 'xxx...X..X..', high: 'xxxxxxX.xX.x', clap: 'X.x.x.x.x.x.' },
          labels: EKTAL.slice(0, 5).concat(['TiRaKiTa', 'Dha', '–', 'TiRaKiTa', 'Dha', '–', 'TiRaKiTa']),
          note: 'Theka to the 5th matra, then the tihai; the third Dha is the next sam.' },
        { name: 'Sam-to-sam tihai: TiRaKiTa TaKiTa Dha – – ×3', cycles: 2,
          tracks: { low: '..X....X....' + 'Xxx...x.x.x.', high: 'xxX..xxX..xx' + 'Xxxxxx.xxxxx', clap: 'X.x.x.x.x.x.'.repeat(2) },
          labels: ['TiRaKiTa', 'TaKiTa', 'Dha', '–', '–', 'TiRaKiTa', 'TaKiTa', 'Dha', '–', '–', 'TiRaKiTa', 'TaKiTa', 'Dha'].concat(EKTAL.slice(1)),
          note: '13 matras from sam: the last Dha lands on the next sam and the theka continues.' }
      ],
      tips: ['In slow (vilambit) ektal each matra is long: subdivide it in four in your head.', 'Learn the six hand signs: clap, wave, clap, wave, clap, clap.', 'Khayal performances move from vilambit to drut ektal: practise at both ends of the tempo range.']
    },

    adi: {
      cycles: 8, tempo: [50, 120],
      variations: [
        { name: 'Konnakol: Ta Ka Di Mi Ta Ka Jo Nu', tracks: { low: 'x...x...', high: 'Xxxxxxxx', clap: 'X...x.x.' }, labels: ['Ta', 'Ka', 'Di', 'Mi', 'Ta', 'Ka', 'Jo', 'Nu'],
          note: 'The standard chatusra (four) phrase: the second half changes its syllables but not its shape.' },
        { name: 'Tisra grouping: Ta Ki Ta ×2, Ta Ka', tracks: { low: 'x..x..x.', high: 'XxxXxxXx', clap: 'X...x.x.' }, labels: ['Ta', 'Ki', 'Ta', 'Ta', 'Ki', 'Ta', 'Ta', 'Ka'],
          note: 'Groups of three across the beats (3+3+2) against the 4+2+2 of the tala: a tisra feel within the grid.' },
        { name: 'Khanda + tisra: Ta Di Ki Na Thom, Ta Ki Ta', tracks: { low: 'x...Xx..', high: 'Xxxx.Xxx', clap: 'X...x.x.' }, labels: ['Ta', 'Di', 'Ki', 'Na', 'Thom', 'Ta', 'Ki', 'Ta'],
          note: 'A five then a three: the Thom (left-hand bass stroke) lands on the second clap.' },
        { name: 'Mridangam sarvalaghu: Tha Dhi Thom Nam', tracks: { low: 'x.x.x.x.', high: '.x.x.x.x', clap: 'X...x.x.' }, labels: ['Tha', 'Dhi', 'Thom', 'Nam', 'Tha', 'Dhi', 'Thom', 'Nam'],
          note: 'The four basic mridangam strokes as a flowing pattern: left hand on Tha and Thom, right hand on Dhi and Nam.' },
        { name: 'Second speed: Ta Ka Di Mi in two beats', tracks: { low: 'x...x...', high: 'XxxxXxxx', clap: 'X...x.x.' }, labels: rep(['TaKa', 'DiMi', 'TaKa', 'JoNu'], 2),
          note: 'Irandam kalam: two syllables per beat, so the phrase runs twice per cycle; the grid has one step per beat, so each step names a pair.' }
      ],
      fills: [
        { name: 'Korvai: Ta Di Ki Na Thom, then Ta Ki Ta ×3 to samam', cycles: 3,
          tracks: { low: 'x...X.x.' + '..x...x.' + 'X...x.x.', high: 'Xxxx..Xx' + 'x.Xxx.Xx' + 'Xxxxxxxx', clap: 'X...x.x.'.repeat(3) },
          labels: ['Ta', 'Di', 'Ki', 'Na', 'Thom', '–', 'Ta', 'Ki', 'Ta', '–', 'Ta', 'Ki', 'Ta', '–', 'Ta', 'Ki', 'Ta'].concat(ADI.slice(1)),
          note: 'A khanda opening (5 + a rest), then a mora of Ta Ki Ta with one-beat gaps: 17 beats, the last Ta lands on samam of the third cycle.' },
        { name: 'Khanda mora: Ta Di Ki Na Thom ×3, samam to samam', cycles: 3,
          tracks: { low: 'x...X.x.' + '..X.x...' + 'X...x.x.', high: 'Xxxx..Xx' + 'xx..Xxxx' + '.xxxxxxx', clap: 'X...x.x.'.repeat(3) },
          labels: ['Ta', 'Di', 'Ki', 'Na', 'Thom', '–', 'Ta', 'Di', 'Ki', 'Na', 'Thom', '–', 'Ta', 'Di', 'Ki', 'Na', 'Thom'].concat(ADI.slice(1)),
          note: 'Three fives with one-beat gaps, 17 beats: the third Thom lands exactly on samam.' }
      ],
      tips: ['Keep the hand action going (clap, three finger counts, clap-wave, clap-wave) while you speak the konnakol.', 'Speak the tisra and khanda variations slowly first; the clap must not follow your syllables.', 'Carnatic tempo stays steady: practise the korvai without speeding up.']
    },

    solea: {
      cycles: 6, tempo: [90, 240], layaRamp: true,
      variations: [
        { name: 'Accents only (no ticking)', tracks: { clap: '..X..X.X.X.X' }, labels: COUNT12,
          note: 'The soft count drops out; keep the 12 counts alive in your head.' },
        { name: 'Cajón under the palmas', tracks: { clap: '..X..X.X.X.X', low: '..X..x.x.x.X', high: 'xx.xx.x.x.x.' }, labels: COUNT12,
          note: 'Bass tones on the accents, light slaps on the counts between, the way cajón joined flamenco in the late 1970s.' },
        { name: 'Feet on 12 and 6', tracks: { clap: '..X..X.X.X.X', mid: 'xxxxxxxxxxxx', low: '.....X.....X' }, labels: COUNT12,
          note: 'The dancer’s golpes mark the two halves of the compás: bulerías is often felt from 12 to 5 and 6 to 11.' },
        { name: 'Palmas sordas: soft hands, every count', tracks: { clap: '..X..X.X.X.X', shaker: 'xxxxxxxxxxxx' }, labels: COUNT12,
          note: 'Muted, cupped claps on every count under the accents, as behind a singer.' }
      ],
      fills: [
        { name: 'Remate: close on 10', cycles: 1, tracks: { clap: '..X..X.X.X..', mid: 'xxxxxxxxxX..' }, labels: COUNT12,
          note: 'Everything stops on 10; 11 and 12 are silent and the compás starts again together.' },
        { name: 'Llamada shape: 1-2-3, 6-7-8, close on 10', cycles: 1, tracks: { clap: 'XXX..XXX.X..', mid: '............' }, labels: COUNT12,
          note: 'A typical call from the dancer or guitar; the strong close falls on 10, as in the remate.' }
      ],
      tips: ['Count out loud and clap 3, 6, 8, 10, 12.', 'Bulerías speeds up and is often counted from 12: try “speed up” and start your count on 12.', 'Practise the remate until stopping on 10 feels natural.']
    },

    seguiriya: {
      cycles: 6, tempo: [90, 180],
      variations: [
        { name: 'Five beats only', tracks: { clap: 'X.x.x..x..x.' },
          note: 'No pulse: feel the five uneven beats, short short long long short.' },
        { name: 'Guitar bass on the long beats', tracks: { clap: 'X.x.x..x..x.', mid: 'xxxxxxxxxxxx', low: '....x..x....' },
          note: 'Deep notes on beats 3 and 4 make the two long beats heavier.' },
        { name: 'Knuckle raps on every pulse', tracks: { clap: 'X.x.x..x..x.', hat: 'xxxxxxxxxxxx' },
          note: 'Nudillos (knuckles on the table) keep the pulse, as at a juerga.' }
      ],
      fills: [
        { name: 'Cierre: close on the fifth beat', cycles: 1, tracks: { clap: 'X.x.x..x..X.', mid: 'xxxxxxxxxxX.' },
          note: 'A strong final beat and a short silence before the compás starts again.' }
      ],
      tips: ['Count “1-2, 1-2, 1-2-3, 1-2-3, 1-2”.', 'Seguiriya is heavy and slow: do not rush the two long beats.']
    },

    sesqui: {
      cycles: 8, tempo: [60, 120],
      variations: [
        { name: 'Bombo in two', tracks: { clap: 'X..x..x.x.x.', low: 'x..x..x..x..', shaker: 'xxxxxxxxxxxx' },
          note: 'The drum stays in 6/8 for both bars: hear how the claps go into 3 against it.' },
        { name: 'Bombo in three', tracks: { clap: 'X..x..x.x.x.', low: 'x.x.x.x.x.x.', shaker: 'xxxxxxxxxxxx' },
          note: 'The drum stays in 3/4: now the first bar of claps is the one that pulls against it.' },
        { name: 'Both at once', tracks: { clap: 'X..x..x.x.x.', low: 'x..x..x..x..', mid: 'x.x.x.x.x.x.' },
          note: 'Two against three all the way through: the ambiguity chacarera and huapango live in.' }
      ],
      fills: [
        { name: 'Hemiola break: claps in three', cycles: 1, tracks: { clap: 'X.x.x.x.x.x.', low: 'X.x.x.x.x.x.' },
          note: 'Both bars in 3/4 for one cycle, then back to 6/8 + 3/4.' }
      ],
      tips: ['Say “1-2-3 4-5-6 1-2 3-4 5-6”.', 'Strum it on guitar: down on every clap, mute between.']
    },

    onedrop: {
      cycles: 8, tempo: [60, 95],
      variations: [
        { name: 'Steppers: kick on every beat', tracks: { chick: '....x.......x...', low: 'x...x...x...x...', high: '........x.......', hat: 'x.x.x.x.x.x.x.x.' },
          note: 'The roots-reggae steppers beat: four kicks against the same off-beat skank.' },
        { name: 'Two-drop: kick on 1 and 3', tracks: { chick: '....x.......x...', low: 'x.......x.......', high: '........x.......', hat: 'x.x.x.x.x.x.x.x.' },
          note: 'The kick adds beat 1 back in; the rim still cracks only on 3.' },
        { name: 'Hi-hat on the upbeats', tracks: { chick: '....x.......x...', low: '........X.......', high: '........x.......', hat: '..x...x...x...x.' },
          note: 'Only the “and” of each beat: the space around beat 1 is wider.' }
      ],
      fills: [
        { name: 'Snare roll into 1', cycles: 1, tracks: { chick: '....x.......x...', low: '........X.......', high: '........x...xxxX', hat: 'x.x.x.x.x.x.....' },
          note: 'Sixteenths on the last beat lead into the next bar.' },
        { name: 'Drop-out: skank alone', cycles: 1, tracks: { chick: '....x.......x...' },
          note: 'The drums disappear for a bar; the guitar keeps the time.' }
      ],
      tips: ['There is no kick on 1: do not add one in your body.', 'Keep the skank short and late rather than early.']
    },

    swing: {
      cycles: 8, tempo: [80, 240],
      variations: [
        { name: 'Two-feel: bass on 1 and 3', tracks: { hat: '...x.....x..', ride: 'X..x.xx..x.x', low: 'x.....x.....' },
          note: 'Half-note bass, as in the head of many standards.' },
        { name: 'Snare comping on the skips', tracks: { hat: '...x.....x..', ride: 'X..x.xx..x.x', low: 'x..x..x..x..', high: '.....x.....x' },
          note: 'The snare doubles the “a” of 2 and 4, the ride’s skip notes.' },
        { name: 'Straight quarters on the ride', tracks: { hat: '...x.....x..', ride: 'X..x..x..x..', low: 'x..x..x..x..' },
          note: 'No skip notes: the swing has to come from you.' },
        { name: 'Brushes', tracks: { hat: '...x.....x..', shaker: 'x.xx.xx.xx.x', low: 'x..x..x..x..' },
          note: 'A swept brush pattern instead of the ride: softer, same feel.' }
      ],
      fills: [
        { name: 'Triplet fill on 3 and 4', cycles: 1, tracks: { hat: '...x.....x..', ride: 'X..x........', high: '......xxxxxX', low: 'x..x........' },
          note: 'Snare triplets fill the second half of the bar and lead into 1.' },
        { name: 'Charleston stop', cycles: 1, tracks: { hat: '...x.....x..', ride: 'X....x......', low: 'X....x......', high: 'X....x......' },
          note: 'The band hits 1 and the “a” of 2, then lays out; the hi-hat keeps 2 and 4.' }
      ],
      tips: ['Tap 2 and 4 with your foot while you sing the ride pattern.', 'Swing ratio relaxes as tempo goes up: keep it loose.']
    },

    pompe: {
      cycles: 12, tempo: [100, 260],
      variations: [
        { name: 'Ghost up-strokes', tracks: { chick: '..X...X.', low: 'x...x...', hat: '.x...x..' },
          note: 'A quiet up-stroke just before 2 and 4 (here on the “and” of 1 and 3) gives the pompe its bounce.' },
        { name: 'Walking double bass', tracks: { chick: '..X...X.', low: 'x.x.x.x.' },
          note: 'The bass walks on every beat; the guitar still snaps 2 and 4.' },
        { name: 'Bass on 1 only', tracks: { chick: '..X...X.', low: 'x.......' },
          note: 'A ballad-style half-bar bass: more room for the chord.' }
      ],
      fills: [
        { name: 'Solo break', cycles: 1, tracks: { chick: 'X.......', low: 'X.......' },
          note: 'One hit on 1, then silence while the soloist plays; the rhythm comes back on the next 1.' },
        { name: 'Charleston stop', cycles: 1, tracks: { chick: 'X..X....', low: 'X..X....' },
          note: 'Hits on 1 and the “and” of 2, then silence.' }
      ],
      tips: ['Keep the 2 and 4 chord short: lift the left-hand fingers right after.', 'Practise slowly; the pompe gets lighter, not louder, at speed.']
    },

    bulgar: {
      cycles: 12, tempo: [100, 170],
      variations: [
        { name: 'Drum on the 3+3+2', tracks: { clap: 'X..x..x.', low: 'x..x..x.', chick: '..x...x.' },
          note: 'The poyk (bass drum) plays the bulgar accents, the guitar the oom-pah.' },
        { name: 'Snare eighths with 3+3+2 accents', tracks: { clap: 'X..x..x.', high: 'XxxXxxXx', low: 'x...x...' },
          note: 'Even eighths on the snare, accents in groups of 3, 3 and 2.' },
        { name: 'Cymbal backbeat', tracks: { clap: 'X..x..x.', low: 'x...x...', ride: '..x...x.' },
          note: 'The cymbal on the poyk marks 2 and 4 against the 3+3+2.' }
      ],
      fills: [
        { name: 'Unison 3+3+2 stop', cycles: 1, tracks: { clap: 'X..x..x.', low: 'X..x..x.', chick: 'X..x..x.' },
          note: 'Everyone plays the accents and nothing else for a bar.' },
        { name: 'Drum roll into 1', cycles: 1, tracks: { clap: 'X..x..x.', high: 'xxxxxxxX', low: 'x...x...' },
          note: 'Eighths on the snare build into the next phrase.' }
      ],
      tips: ['Sing the 3+3+2 while your foot taps 1 and 3.', 'Notice that only the first accent matches the bass.']
    },

    shuffle: {
      cycles: 8, tempo: [60, 140],
      variations: [
        { name: 'Four on the floor (Chicago)', tracks: { ride: 'x.xx.xx.xx.x', high: '...x.....x..', low: 'x..x..x..x..' },
          note: 'The kick on every beat, as in many Chicago blues bands.' },
        { name: 'Texas double shuffle', tracks: { ride: 'x.xx.xx.xx.x', high: 'x.xX.xx.xX.x', low: 'x.....x.....' },
          note: 'The snare plays the shuffle too, with the backbeat accented.' },
        { name: 'Half-time shuffle', tracks: { ride: 'x.xx.xx.xx.x', high: '......X.....', low: 'x.........x.' },
          note: 'Snare only on 3: the same shuffle feels twice as wide.' },
        { name: 'Hi-hat foot on 2 and 4', tracks: { ride: 'x.xx.xx.xx.x', high: '...x.....x..', low: 'x.....x.....', hat: '...x.....x..' },
          note: 'The foot closes the hi-hat with the snare.' }
      ],
      fills: [
        { name: 'Turnaround triplets', cycles: 1, tracks: { ride: 'x.xx.xx.x...', high: '...x.....xxX', low: 'x.....x.....' },
          note: 'A snare triplet on beat 4 leads into the next chorus.' },
        { name: 'Stop-time', cycles: 1, tracks: { ride: 'X...........', high: 'X...........', low: 'X...........' },
          note: 'One hit on 1, then silence, as under a vocal stop chorus.' }
      ],
      tips: ['Say “DOO-ba DOO-ba”: long-short, never even.', 'Keep the shuffle relaxed even in the stop-time bars.']
    },

    backbeat: {
      cycles: 12, tempo: [70, 160],
      variations: [
        { name: 'Four-on-the-floor kick', tracks: { hat: 'xxxxxxxx', high: '..X...X.', low: 'x.x.x.x.' },
          note: 'The disco-rock kick: the snare still cracks on 2 and 4.' },
        { name: 'Ride cymbal instead of hats', tracks: { ride: 'Xxxxxxxx', high: '..X...X.', low: 'x...xx..' },
          note: 'A bigger, washier chorus sound.' },
        { name: 'Syncopated kick: 1, “and” of 2, 3', tracks: { hat: 'xxxxxxxx', high: '..X...X.', low: 'x..xx...' },
          note: 'The kick anticipates beat 3.' },
        { name: 'Quarter-note hats', tracks: { hat: 'x.x.x.x.', high: '..X...X.', low: 'x...xx..' },
          note: 'Half as many hats: more space around the snare.' }
      ],
      fills: [
        { name: 'Snare eighths on 3 and 4', cycles: 1, tracks: { hat: 'xxxx....', high: '..X.xxxx', low: 'x.......' },
          note: 'A simple fill that leads into the next bar.' },
        { name: 'Tom fill on beat 4', cycles: 1, tracks: { hat: 'xxxxxx..', high: '..X...x.', mid: '......xx', low: 'x...x...' },
          note: 'Snare then toms on the last beat.' }
      ],
      tips: ['Tap 2 and 4 hard and steady while the kick changes.', 'Keep the snare on the beat during fills.']
    },

    funk16: {
      cycles: 8, tempo: [80, 120],
      variations: [
        { name: 'Sixteenth hats', tracks: { hat: 'XxxxXxxxXxxxXxxx', high: '....X..x....X..x', low: 'x......x..x.....' },
          note: 'One-handed sixteenths with an accent on each beat.' },
        { name: 'More ghost notes', tracks: { hat: 'x.x.x.x.x.x.x.x.', high: '..x.X..x.x..X.xx', low: 'x......x..x.....' },
          note: 'Soft snare strokes around the backbeat: feel them more than hear them.' },
        { name: 'Claps on 2 and 4', tracks: { hat: 'x.x.x.x.x.x.x.x.', high: '....X..x....X..x', low: 'x......x..x.....', clap: '....x.......x...' },
          note: 'A hand-clap doubles the backbeat.' }
      ],
      fills: [
        { name: 'Sixteenth snare fill on beat 4', cycles: 1, tracks: { hat: 'x.x.x.x.x.x.....', high: '....X..x....xxxX', low: 'x......x..x.....' },
          note: 'Four sixteenths on the snare lead into 1.' },
        { name: 'Break: kick and snare only', cycles: 1, tracks: { high: '....X..x....X..x', low: 'x......x..x.....' },
          note: 'The hats drop out; keep the sixteenths in your head.' }
      ],
      tips: ['Count “1 e & a” out loud slowly before you speed up.', 'Your kick part never changes: let the other parts move around it.']
    },

    boomchick: {
      cycles: 12, tempo: [80, 180],
      variations: [
        { name: 'Bass walk-up into 1', tracks: { chick: '..X...X.', low: 'x...x..x' },
          note: 'An extra bass note on the “and” of 4 leads to the next chord.' },
        { name: 'Train beat', tracks: { chick: '..X...X.', low: 'x...x...', high: 'xxXxxxXx' },
          note: 'Snare eighths with accents on 2 and 4, the country train beat.' },
        { name: 'Brushes in eighths', tracks: { chick: '..X...X.', low: 'x...x...', shaker: 'xxxxxxxx' },
          note: 'Even eighths make the boom-chick swing more.' }
      ],
      fills: [
        { name: 'Bass run into 1', cycles: 1, tracks: { chick: '..X.....', low: 'x...xxxx' },
          note: 'Four bass notes walk up or down to the next chord, the bluegrass G-run idea.' },
        { name: 'Stop on 1', cycles: 1, tracks: { chick: '........', low: 'X.......' },
          note: 'One bass note and silence; the band comes back on the next 1.' }
      ],
      tips: ['Alternate root and fifth on the bass notes.', 'Mute the chick right after you play it.']
    }
  }
};
