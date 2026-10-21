/* World Woodshed — rhythm variations: new rhythms for every style.
   `extra` holds whole new rhythm objects (same schema as RHYTHMS in data.js); `rhythms` holds their variations,
   fills, suggested cycles, tempo range and tips. In every variation the player's part (the target track) stays
   exactly as in the base pattern; the music around it changes. No imports. */

// Base tracks, shared by the rhythm objects and their variations.
const B = {
  cascara: { bell: 'X.xx.x.xX.x.xx.x', clave: 'x..x..x...x.x...', high: '..x.......x.....', mid: '......xx......xx', low: '...x..x....x..x.' },
  tumbao: { mid: '......xx......xx', high: '..X.......X.....', clave: 'x..x..x...x.x...', low: '...x..x....x..x.' },
  baiao: { low: 'X..xX...X..xX...', bell: 'xxXxxxXxxxXxxxXx', high: '..x...x...x...x.' },
  maxixe: { clap: 'xx.xx.x.', low: 'x...x...', shaker: 'xxxXxxxX' },
  bulerias: { clap: 'X.....X.....X...X...X...', mid: 'x.x.x.x.x.x.x.x.x.x.x.x.' },
  tangos: { clap: '..x.x.x...x.x.x.', low: 'x.......x.......' },
  deepchandi: { clap: 'X..x...x..x...', low: 'xx.xx.....xxx.', high: 'xx.xxx.xx.xxx.' },
  jhoomra: { clap: 'X..x...x..x...', low: 'xx.xxx....xxx.', high: 'xxxxxxxxxxxxxx' },
  chautal: { clap: 'X.x.x.x.x.x.', low: 'xxx..xx...xx', high: 'xxxxxxxxxxxx' },
  misrachapu: { clap: 'X..x.x.', low: 'x..x.x.', high: 'xxxxxxx' },
  khandachapu: { clap: 'X.x..', low: 'x.x..', high: 'xxxxx' },
  aditisra: { clap: 'X..x..x..x..X..x..X..x..', low: 'x...........x.....x.....', high: 'xxxxxxxxxxxxxxxxxxxxxxxx' },
  ayyub: { low: 'x...x...', high: '...x..x.' },
  samaithaqil: { low: 'X....xx...', high: '...x...x..' },
  daichovo: { low: 'X.....x..', high: '..x.x...x' },
  paidushko: { low: 'X....', high: '..x..' },
  lesnoto: { clap: 'X..x.x.', low: 'X......', high: '...x.x.' },
  agbekor: { clap: '.xx.xx.xx.xx', bell: 'X.x.xx.x.x.x', low: 'x..x..x..x..' },
  kpanlogo: { bell: 'x..x..x...x.x...', shaker: 'xxxxxxxxxxxxxxxx', low: 'x...x...x...x...' },
  cavacha: { high: 'X.xxX.xxX.xxX.xx', low: 'x...x...x...x...', chick: '..x...x...x...x.' },
  benga: { chick: '..x...x...x...x.', low: 'x...x...x...x...', high: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' },
  tangomarcato: { chick: 'X.x.X.x.', low: 'x.x.x.x.' },
  cumbia: { chick: '..x...x...x...x.', shaker: 'X.xxX.xxX.xxX.xx', low: 'x.......x.......' },
  huayno: { clap: 'X.xxX.xx', low: 'x...x...' },
  steppers: { low: 'X...X...X...X...', high: '........x.......', hat: 'x.x.x.x.x.x.x.x.', chick: '....x.......x...' },
  rockers: { hat: '..x...x...x...x.', low: 'x.......x.......', high: '........x.......', chick: '....x.......x...' },
  ska: { chick: '..x...x...x...x.', low: 'x...x...x...x...', high: '....x.......x...' },
  jazzwaltz: { chick: '...x..x..', ride: 'x..x.xx..', low: 'x..x..x..', hat: '...x.....' },
  charleston: { chick: 'X....x......', ride: 'X..x.xx..x.x', hat: '...x.....x..', low: 'x..x..x..x..' },
  valsemusette: { chick: '..x.x.', low: 'x.....' },
  rumbamanouche: { chick: 'X..x..x.', low: 'x...x...' },
  hora: { chick: '....x.', low: 'X.....' },
  terkish: { clap: 'X..xX.x.', low: 'x...x...' },
  gamelan: { mid: '...x...x...x...x', bell: '.....x...x...x..', high: 'x.x.x.x.x.x.x.x.', low: '...............X' },
  taiko: { low: 'X...X...X.X.X...', high: 'x.xxx.xxx.xxx.xx', clave: '......x.......x.' },
  reng: { low: 'X..x..X..x..', high: '..x..x..x..x' },
  tasnif: { low: 'x...x...', high: '..x...x.' },
  fadomarcha: { chick: '.x.x.x.x', low: 'x.x.x.x.' },
  slowblues: { high: '...X.....X..', ride: 'xxxxxxxxxxxx', low: 'x.....x.....' },
  boogie: { low: 'x.xx.xx.xx.x', high: '...x.....x..', hat: 'x..x..x..x..' },
  halftime: { high: '........X.......', hat: 'x.x.x.x.x.x.x.x.', low: 'x.........x.....' },
  fourfloor: { hat: '..x...x...x...x.', low: 'X...X...X...X...', high: '....x.......x...' },
  bodiddley: { clap: 'X..x..x...x.x...', shaker: 'xxxxxxxxxxxxxxxx', low: 'x...x...x...x...' },
  purdie: { high: '.x..x.X...x.', hat: 'x.xx.xx.xx.x', low: 'x....x...x..' },
  motown: { high: 'X...X...X...X...', shaker: '....x.......x...', low: 'x.....x.x.......' },
  trainbeat: { chick: '....x.x.....x.x.', high: 'xxxxXxxxxxxxXxxx', low: 'x.......x.......' },
  travisbeat: { high: '.x.x.x.x', low: 'x.x.x.x.' },
  slackkey2: { low: 'x.x.x.x.', high: 'x..x.xx.' },
  islandstrum: { chick: 'x.xx.xxx', low: 'x...x...' },
  arpeggio34: { low: 'X.....', high: '.xxxxx' },
  jig: { chick: 'X.xX.xX.xX.x', mid: 'XxxXxxXxxXxx', low: 'x.....x.....' },
  reel: { chick: '..x...x.', mid: 'xxXxxxXx', low: 'x...x...' },
  slipjig: { chick: 'X.xX.xX.x', mid: 'XxxXxxXxx', low: 'x........' },
};
const v = (id, extra) => Object.assign({}, B[id], extra);
const pick = (id, ...keys) => { const o = {}; keys.forEach(k => { o[k] = B[id][k]; }); return o; };

const L = {
  deepchandi: ['Dha', 'Dhin', '–', 'Dha', 'Dha', 'Tin', '–', 'Ta', 'Tin', '–', 'Dha', 'Dha', 'Dhin', '–'],
  jhoomra: ['Dhin', '–Dha', 'TiRaKiTa', 'Dhin', 'Dhin', 'DhaGe', 'TiRaKiTa', 'Tin', '–Ta', 'TiRaKiTa', 'Dhin', 'Dhin', 'DhaGe', 'TiRaKiTa'],
  chautal: ['Dha', 'Dha', 'Din', 'Ta', 'KiTa', 'Dha', 'Din', 'Ta', 'TiTa', 'KaTa', 'GaDi', 'GaNa'],
  bulerias: ['12', '', '1', '', '2', '', '3', '', '4', '', '5', '', '6', '', '7', '', '8', '', '9', '', '10', '', '11', ''],
  gamelan: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
  taiko: ['Don', '', 'Do', 'Ko', 'Don', '', 'Ka', 'Ka', 'Don', '', 'Don', '', 'Don', '', 'Ka', 'Ka'],
};

const extra = [
  // ---------- Cuba
  { id: 'cascara', name: 'Cáscara (palitos) with son clave', region: 'cuba', meter: '4/4 (2 bars)', steps: 16, spb: 4, bpm: 100, tier: 2, target: 'bell',
    tracks: B.cascara,
    note: 'The timbalero’s pattern on the drum shell for verses, taken from the palitos of rumba. Written here for 3-2 clave: the whole 2-side of the clave falls on cáscara strokes.' },
  { id: 'tumbao', name: 'Conga marcha (tumbao)', region: 'cuba', meter: '4/4 (2 bars)', steps: 16, spb: 4, bpm: 100, tier: 1, target: 'mid',
    tracks: B.tumbao,
    note: 'The basic conga part of son and salsa: a slap on 2 and two open tones on 4 and the “and” of 4 in every bar. Quiet heel–toe strokes fill the gaps.' },
  // ---------- Brazil
  { id: 'baiao', name: 'Baião (zabumba and triangle)', region: 'brazil', meter: '2/4 (2 bars)', steps: 16, spb: 4, bpm: 90, tier: 2, target: 'low',
    tracks: B.baiao,
    note: 'The northeastern rhythm Luiz Gonzaga made national in the 1940s. The zabumba’s bass (1, the “a” of 1, 2) is what the guitar thumb or bass plays; the triangle rings on each “and”.' },
  { id: 'maxixe', name: 'Maxixe / choro síncope', region: 'brazil', meter: '2/4', steps: 8, spb: 4, bpm: 80, tier: 2, target: 'clap',
    tracks: B.maxixe,
    note: 'The sixteenth–eighth–sixteenth figure of maxixe, choro and early samba, answered by two even eighths. The cavaquinho strums it; the seven-string guitar plays bass on 1 and 2.' },
  // ---------- Flamenco
  { id: 'bulerias', name: 'Bulerías (counted from 12)', region: 'flamenco', meter: '12 counts: 3+3+2+2+2', steps: 24, spb: 2, bpm: 210, unit: 'count', groups: [6, 6, 4, 4, 4], tier: 3, target: 'clap',
    tracks: B.bulerias, labels: L.bulerias,
    note: 'Bulerías is counted from 12, the way flamencos count it: accents on 12, 3, 6, 8 and 10. The first half feels like two bars of 6/8, the second like a bar of 3/4.' },
  { id: 'tangos', name: 'Tangos flamencos', region: 'flamenco', meter: '4/4 (2 bars)', steps: 16, spb: 2, bpm: 110, tier: 2, target: 'clap',
    tracks: B.tangos,
    note: 'The 4/4 palo of tangos and tientos, counted in eight. The palmas leave beat 1 empty and clap 2, 3 and 4; the guitar strums into that gap.' },
  // ---------- Hindustani
  { id: 'deepchandi', name: 'Deepchandi (14)', region: 'hindustani', meter: '14 matras: 3+4+3+4', steps: 14, spb: 1, bpm: 90, unit: 'matra', groups: [3, 4, 3, 4], tier: 3, target: 'clap',
    tracks: B.deepchandi, labels: L.deepchandi, marks: { 0: 'X', 3: '2', 7: '0', 10: '3' },
    note: 'The fourteen-beat tala of thumri, hori and light classical songs. Claps on 1, 4 and 11, a wave on 8; the gaps after each section give it its swaying lilt.' },
  { id: 'jhoomra', name: 'Jhoomra (14)', region: 'hindustani', meter: '14 matras: 3+4+3+4', steps: 14, spb: 1, bpm: 50, unit: 'matra', groups: [3, 4, 3, 4], tier: 4, target: 'clap',
    tracks: B.jhoomra, labels: L.jhoomra, marks: { 0: 'X', 3: '2', 7: '0', 10: '3' },
    note: 'A very slow (vilambit) fourteen-beat tala for bada khayal, with the same sections as deepchandi but a dense, rolling theka. “–Dha” means the Dha falls on the second half of the beat.' },
  { id: 'chautal', name: 'Chautal (12)', region: 'hindustani', meter: '12 matras: 2×6', steps: 12, spb: 1, bpm: 80, unit: 'matra', groups: [2, 2, 2, 2, 2, 2], tier: 3, target: 'clap',
    tracks: B.chautal, labels: L.chautal, marks: { 0: 'X', 2: '0', 4: '2', 6: '0', 8: '3', 10: '4' },
    note: 'The twelve-beat tala of dhrupad, played on the pakhawaj. Six sections of two: claps on 1, 5, 9 and 11, waves on 3 and 7.' },
  // ---------- Carnatic
  { id: 'misrachapu', name: 'Misra chapu (7)', region: 'carnatic', meter: '7 beats: 3+2+2', steps: 7, spb: 1, bpm: 120, unit: 'beat', groups: [3, 2, 2], tier: 2, target: 'clap',
    tracks: B.misrachapu, labels: ['Ta', 'Ki', 'Ta', 'Ta', 'Ka', 'Di', 'Mi'], marks: { 0: 'clap', 3: 'clap', 5: 'clap' },
    note: 'A quick seven-beat tala for kritis and devotional songs: Ta-ki-ta Ta-ka Di-mi. Count it with claps on 1, 4 and 6.' },
  { id: 'khandachapu', name: 'Khanda chapu (5)', region: 'carnatic', meter: '5 beats: 2+3', steps: 5, spb: 1, bpm: 130, unit: 'beat', groups: [2, 3], tier: 2, target: 'clap',
    tracks: B.khandachapu, labels: ['Ta', 'Ka', 'Ta', 'Ki', 'Ta'], marks: { 0: 'clap', 2: 'clap' },
    note: 'A fast five-beat tala: Ta-ka Ta-ki-ta, short then long. Claps on 1 and 3.' },
  { id: 'aditisra', name: 'Adi tala in tisra nadai', region: 'carnatic', meter: '8 beats × 3', steps: 24, spb: 3, bpm: 70, unit: 'beat', groups: [12, 6, 6], tier: 3, target: 'clap',
    tracks: B.aditisra, labels: ['Ta', 'Ki', 'Ta', 'Ta', 'Ki', 'Ta', 'Ta', 'Ki', 'Ta', 'Ta', 'Ki', 'Ta', 'Ta', 'Ki', 'Ta', 'Ta', 'Ki', 'Ta', 'Ta', 'Ki', 'Ta', 'Ta', 'Ki', 'Ta'],
    marks: { 0: 'clap', 3: '1', 6: '2', 9: '3', 12: 'clap', 15: 'wave', 18: 'clap', 21: 'wave' },
    note: 'Adi tala with every beat split into three (tisra nadai). The hand keeps the eight kriyas — clap, three finger counts, clap-wave, clap-wave — while the voice says Ta-ki-ta.' },
  // ---------- Arabic
  { id: 'ayyub', name: 'Ayyub', region: 'arabic', meter: '2/4', steps: 8, spb: 4, bpm: 100, tier: 1, target: 'all',
    tracks: B.ayyub, labels: ['D', '', '', 'k', 'D', '', 'T', ''],
    note: 'A driving 2/4 of zar and Sufi dhikr and of fast dance entrances: Dum – – ka Dum – Tek –. It loops like a heartbeat.' },
  { id: 'samaithaqil', name: 'Samai thaqil (10/8)', region: 'arabic', meter: '10/8 (3+2+2+3)', steps: 10, spb: 1, bpm: 170, unit: '♪', groups: [3, 2, 2, 3], tier: 3, target: 'all',
    tracks: B.samaithaqil, labels: ['D', '', '', 'T', '', 'D', 'D', 'T', '', ''],
    note: 'The stately 10/8 of the instrumental samai: Dum – – Tek – Dum Dum Tek – –. A samai’s first three sections use it; the last usually switches to a lively 3/4 or 6/8.' },
  // ---------- Turkey & Balkans
  { id: 'daichovo', name: 'Daichovo 9/8', region: 'turkbalkan', meter: '9/8 (2+2+2+3)', steps: 9, spb: 1, bpm: 340, unit: '♪', groups: [2, 2, 2, 3], tier: 3, target: 'all',
    tracks: B.daichovo,
    note: 'A lively Bulgarian horo, counted 1-2-3-4 with the long beat last. The tapan’s heavy beater marks 1 and the long fourth beat; the thin stick fills in.' },
  { id: 'paidushko', name: 'Paidushko 5/8', region: 'turkbalkan', meter: '5/8 (2+3)', steps: 5, spb: 1, bpm: 300, unit: '♪', groups: [2, 3], tier: 2, target: 'all',
    tracks: B.paidushko,
    note: 'A Bulgarian and Macedonian horo in two uneven beats, quick–slow. The dance limps and bounces on the long beat.' },
  { id: 'lesnoto', name: 'Lesnoto 7/8 (clap the beats)', region: 'turkbalkan', meter: '7/8 (3+2+2)', steps: 7, spb: 1, bpm: 260, unit: '♪', groups: [3, 2, 2], tier: 1, target: 'clap',
    tracks: B.lesnoto,
    note: 'The Macedonian “easy” dance (lesno means easy): the same slow–quick–quick as kalamatianos but calmer and heavier. Clap the three uneven beats.' },
  // ---------- West Africa
  { id: 'agbekor', name: 'Agbekor / agbadza: kagan part', region: 'westafrica', meter: '12/8', steps: 12, spb: 3, bpm: 100, tier: 2, target: 'clap',
    tracks: B.agbekor,
    note: 'In Ewe agbadza and agbekor the smallest drum, kagan, plays the two offbeat pulses of every beat against the standard bell. Feel the four big beats you never play.' },
  { id: 'kpanlogo', name: 'Kpanlogo bell', region: 'westafrica', meter: '4/4 (2 bars)', steps: 16, spb: 4, bpm: 115, tier: 2, target: 'bell',
    tracks: B.kpanlogo,
    note: 'Kpanlogo is a Ga recreational drum dance from 1960s Accra. Its bell timeline is the same five-stroke figure as the Cuban 3-2 son clave; the conga-like kpanlogo drums and the shaker play around it.' },
  // ---------- Central & East Africa
  { id: 'cavacha', name: 'Soukous cavacha', region: 'centraleast', meter: '4/4', steps: 16, spb: 4, bpm: 140, tier: 3, target: 'high',
    tracks: B.cavacha,
    note: 'The galloping snare or hi-hat figure Zaïko Langa Langa made famous in the early 1970s. It drives the sebene, the fast guitar section of a soukous song, over a kick on every beat.' },
  { id: 'benga', name: 'Benga offbeat', region: 'centraleast', meter: '4/4', steps: 16, spb: 4, bpm: 130, tier: 2, target: 'chick',
    tracks: B.benga,
    note: 'Kenyan benga, born among Luo guitarists in the 1960s: fast and bright, with a kick on every beat, a bouncing bass and guitars picking interlocking lines. Strum or clap the offbeats.' },
  // ---------- Latin America
  { id: 'tangomarcato', name: 'Tango marcato', region: 'latam', meter: '4/4', steps: 8, spb: 2, bpm: 116, tier: 1, target: 'chick',
    tracks: B.tangomarcato,
    note: 'Marcato en cuatro: the tango orchestra marks all four beats short and dry, 1 and 3 a little heavier. Guitar, bandoneón and piano left hand chop each beat together.' },
  { id: 'cumbia', name: 'Cumbia', region: 'latam', meter: '4/4 (cut time)', steps: 16, spb: 4, bpm: 92, tier: 2, target: 'chick',
    tracks: B.cumbia,
    note: 'Colombian cumbia, now played from Mexico to Argentina: the guacharaca scrapes long–short–short on every beat, the bass marks 1 and 3, and guitar or accordion chords answer on the offbeats.' },
  { id: 'huayno', name: 'Huayno', region: 'latam', meter: '2/4', steps: 8, spb: 4, bpm: 100, tier: 2, target: 'clap',
    tracks: B.huayno,
    note: 'The Andean huayno in 2/4: each beat is an eighth and two sixteenths, strummed on charango and guitar and danced with a stamping step.' },
  // ---------- Caribbean
  { id: 'steppers', name: 'Reggae steppers', region: 'caribbean', meter: '4/4', steps: 16, spb: 4, bpm: 74, tier: 1, target: 'low',
    tracks: B.steppers,
    note: 'Steppers puts the kick on all four beats (Bob Marley’s “Exodus”, 1977) while the rimshot stays on 3 and the guitar skank on 2 and 4. Tap the kick.' },
  { id: 'rockers', name: 'Reggae rockers', region: 'caribbean', meter: '4/4', steps: 16, spb: 4, bpm: 78, tier: 2, target: 'hat',
    tracks: B.rockers,
    note: 'Rockers, the mid-1970s Channel One sound of Sly Dunbar: the kick fills the one-drop’s empty beat 1 and the hi-hat chatters on the offbeats. Tap the hi-hat.' },
  { id: 'ska', name: 'Ska offbeat', region: 'caribbean', meter: '4/4', steps: 16, spb: 4, bpm: 124, tier: 1, target: 'chick',
    tracks: B.ska,
    note: 'Early-1960s Jamaican ska: guitar and piano chop every “and” while the bass walks on the beat and the drums lean on 2 and 4.' },
  // ---------- Jazz
  { id: 'jazzwaltz', name: 'Jazz waltz', region: 'jazz', meter: '3/4 (swung)', steps: 9, spb: 3, bpm: 150, tier: 2, target: 'chick',
    tracks: B.jazzwaltz,
    note: 'Swing in three (“Someday My Prince Will Come”, Bill Evans’ “Waltz for Debby”): the ride plays ding, ding-a, ding; the comping answers the bass on 2 and 3.' },
  { id: 'charleston', name: 'Charleston comping', region: 'jazz', meter: '4/4 (swung)', steps: 12, spb: 3, bpm: 140, tier: 2, target: 'chick',
    tracks: B.charleston,
    note: 'The Charleston rhythm, 1 and the swung “and” of 2, is the most common comping figure in jazz. Keep both chords short so the “and” pops.' },
  // ---------- Manouche
  { id: 'valsemusette', name: 'Valse musette', region: 'manouche', meter: '3/4', steps: 6, spb: 2, bpm: 190, tier: 1, target: 'chick',
    tracks: B.valsemusette,
    note: 'The fast waltz of the Paris bals musette that Django Reinhardt grew up playing on banjo: bass on 1, short crisp chords on 2 and 3.' },
  { id: 'rumbamanouche', name: 'Gypsy jazz rumba (3+3+2)', region: 'manouche', meter: '4/4', steps: 8, spb: 2, bpm: 120, tier: 2, target: 'chick',
    tracks: B.rumbamanouche,
    note: 'Manouche bands play boleros and rumbas with a 3+3+2 strum, the Cuban tresillo driven by the pompe right hand.' },
  // ---------- Klezmer
  { id: 'hora', name: 'Hora / zhok (3/8 feel)', region: 'klezmer', meter: '3/4 (lopsided)', steps: 6, spb: 2, bpm: 110, tier: 2, target: 'chick',
    tracks: B.hora,
    note: 'The klezmer hora (zhok): three beats with the bass on 1, nothing on 2 and the chord on 3, so each bar limps “oom – pah”. Slow, expressive dance tunes use it.' },
  { id: 'terkish', name: 'Terkish', region: 'klezmer', meter: '4/4 (3+1+2+2)', steps: 8, spb: 2, bpm: 96, tier: 2, target: 'clap',
    tracks: B.terkish,
    note: 'Terkish (“Turkish”) is a moderate klezmer dance on the habanera-like long–short–long–long figure, close to the Greek syrtos.' },
  // ---------- East & Southeast Asia
  { id: 'gamelan', name: 'Gamelan lancaran cycle', region: 'eastasia', meter: '16 beats (lancaran)', steps: 16, spb: 1, bpm: 90, unit: 'beat', groups: [4, 4, 4, 4], tier: 3, target: 'mid',
    tracks: B.gamelan, labels: L.gamelan, marks: { 1: 'w', 3: 'N', 5: 'P', 7: 'N', 9: 'P', 11: 'N', 13: 'P', 15: 'G' },
    note: 'A Javanese lancaran: the gong (low) closes the cycle on beat 16, kenong (mid) marks every fourth beat, kempul (bell) answers on 6, 10 and 14, ketuk (high) ticks on the odd beats. Beat 2 is the empty “wela”.' },
  { id: 'taiko', name: 'Taiko: don-doko base', region: 'eastasia', meter: '4/4', steps: 16, spb: 4, bpm: 100, tier: 2, target: 'low',
    tracks: B.taiko, labels: L.taiko,
    note: 'A kumi-daiko practice phrase: the shime-daiko keeps the “don-doko” base (ji-uchi) while the chū-daiko plays the main part, spoken in kuchi-shōga (don = centre, ka = rim).' },
  // ---------- Persian
  { id: 'reng', name: 'Reng (6/8)', region: 'persian', meter: '6/8 (2 bars)', steps: 12, spb: 3, bpm: 76, tier: 2, target: 'all',
    tracks: B.reng, labels: ['Tom', '', 'Bak', 'Tom', '', 'Bak', 'Tom', '', 'Bak', 'Tom', '', 'Bak'],
    note: 'The reng, the dance piece that closes a Persian classical performance, moves in a lilting 6/8. On tombak the deep tom falls on each big beat and the bright bak just before the next.' },
  { id: 'tasnif', name: 'Tasnif in 2/4 (tombak)', region: 'persian', meter: '2/4', steps: 8, spb: 4, bpm: 84, tier: 1, target: 'all',
    tracks: B.tasnif, labels: ['Tom', '', 'Bak', '', 'Tom', '', 'Bak', ''],
    note: 'Many tasnifs, the composed songs of a Persian performance, move in a calm 2/4: tom on each beat, bak on each “and”, with rolls (riz) and finger snaps (pelang) as ornaments.' },
  // ---------- Fado
  { id: 'fadomarcha', name: 'Fado marcha / corrido (2/4)', region: 'fado', meter: '2/4 (2 bars)', steps: 8, spb: 2, bpm: 100, tier: 1, target: 'chick',
    tracks: B.fadomarcha,
    note: 'The fado viola in 2/4: a bass note on every beat and a short chord on every “and”, under the guitarra portuguesa. Fado corrido and the Lisbon marchas run on it.' },
  // ---------- Blues
  { id: 'slowblues', name: 'Slow blues (12/8)', region: 'blues', meter: '12/8 (slow)', steps: 12, spb: 3, bpm: 56, tier: 2, target: 'high',
    tracks: B.slowblues,
    note: 'The slow 12/8 blues of T-Bone Walker’s “Call It Stormy Monday” and Hendrix’s “Red House”: every beat is three triplet eighths, with the snare on 2 and 4. Feel the triplets between the backbeats.' },
  { id: 'boogie', name: 'Boogie-woogie bass', region: 'blues', meter: '4/4 (swung)', steps: 12, spb: 3, bpm: 120, tier: 1, target: 'low',
    tracks: B.boogie,
    note: 'The rolling swung-eighth left hand of boogie-woogie piano, which guitarists play as the shuffle riff on the low strings. Long–short on every beat, never stopping.' },
  // ---------- Rock
  { id: 'halftime', name: 'Half-time feel', region: 'rock', meter: '4/4', steps: 16, spb: 4, bpm: 140, tier: 1, target: 'high',
    tracks: B.halftime,
    note: 'The snare moves from 2 and 4 to beat 3 only, so the song feels half as fast while the hi-hat keeps the original eighths. Tap the snare.' },
  { id: 'fourfloor', name: 'Four on the floor', region: 'rock', meter: '4/4', steps: 16, spb: 4, bpm: 120, tier: 1, target: 'hat',
    tracks: B.fourfloor,
    note: 'Kick on every beat, snare on 2 and 4, an open hi-hat on every “and”: the disco and dance-rock beat. Tap the offbeat hi-hat.' },
  { id: 'bodiddley', name: 'Bo Diddley beat', region: 'rock', meter: '4/4 (2 bars)', steps: 16, spb: 4, bpm: 100, tier: 2, target: 'clap',
    tracks: B.bodiddley,
    note: 'Bo Diddley’s 1955 signature: the 3-2 clave strummed on guitar over Jerome Green’s maracas. It returns in “Not Fade Away” and George Michael’s “Faith”.' },
  // ---------- Funk & soul
  { id: 'purdie', name: 'Purdie half-time shuffle', region: 'funksoul', meter: '12/8 (half-time)', steps: 12, spb: 3, bpm: 88, tier: 5, target: 'high',
    tracks: B.purdie,
    note: 'Bernard Purdie’s shuffle (Steely Dan’s “Home at Last”, 1977; the model for Toto’s “Rosanna”): hi-hat on the shuffle, whispered ghost notes on the middle triplet, a single backbeat on 3.' },
  { id: 'motown', name: 'Motown four on the snare', region: 'funksoul', meter: '4/4', steps: 16, spb: 4, bpm: 120, tier: 1, target: 'high',
    tracks: B.motown,
    note: 'The mid-1960s Motown beat: snare, stomps or claps on all four beats (“Where Did Our Love Go”, “You Can’t Hurry Love”) with the tambourine on 2 and 4.' },
  // ---------- Country
  { id: 'trainbeat', name: 'Train beat (boom-chicka)', region: 'country', meter: '4/4', steps: 16, spb: 4, bpm: 110, tier: 2, target: 'chick',
    tracks: B.trainbeat,
    note: 'Johnny Cash’s freight-train feel: brushes on sixteenths accented on 2 and 4, and Luther Perkins’ muted boom-chicka — bass on 1 and 3, a double strum on 2 and 4.' },
  { id: 'travisbeat', name: 'Travis picking', region: 'country', meter: '4/4', steps: 8, spb: 2, bpm: 90, tier: 2, target: 'high',
    tracks: B.travisbeat,
    note: 'Merle Travis-style fingerpicking: the thumb alternates bass strings on every beat while the fingers pluck on the “and”s. Tap the finger notes against the thumb.' },
  // ---------- Hawaii
  { id: 'slackkey2', name: 'Slack key two-beat', region: 'hawaii', meter: '2/4 (2 bars)', steps: 8, spb: 2, bpm: 90, tier: 1, target: 'low',
    tracks: B.slackkey2,
    note: 'Kī hōʻalu (slack key) rests on a steady alternating thumb on every beat while the fingers pick the melody and syncopations above it, as Gabby Pahinui and Ray Kāne played it.' },
  { id: 'islandstrum', name: 'Island strum', region: 'hawaii', meter: '4/4', steps: 8, spb: 2, bpm: 100, tier: 1, target: 'chick',
    tracks: B.islandstrum,
    note: 'The everyday Hawaiian ukulele strum: down, down-up, up-down-up. The missing down-stroke on 3 gives it its lift.' },
  // ---------- Classical
  { id: 'arpeggio34', name: 'Arpeggio étude in 3/4', region: 'classical', meter: '3/4', steps: 6, spb: 2, bpm: 84, tier: 1, target: 'all',
    tracks: B.arpeggio34,
    note: 'A Giuliani-style right-hand study: thumb on 1, then i–m–a–m–i on the other eighths. The goal is evenness: every note the same distance apart, the bass a touch louder.' },
  // ---------- Celtic
  { id: 'jig', name: 'Jig (6/8)', region: 'celtic', meter: '6/8 (2 bars)', steps: 12, spb: 3, bpm: 110, tier: 2, target: 'chick',
    tracks: B.jig,
    note: 'The Irish double jig (“The Kesh”, “Out on the Ocean”): two beats of three eighths. Backing guitar leans long–short on each beat; the bodhrán plays all three with the first accented.' },
  { id: 'reel', name: 'Reel', region: 'celtic', meter: '4/4 (felt in 2)', steps: 8, spb: 2, bpm: 110, tier: 1, target: 'chick',
    tracks: B.reel,
    note: 'Irish and Scottish reels (“The Silver Spear”, “The Merry Blacksmith”): driving even eighths felt in two. Backing guitar plays bass on 1 and 3 and a crisp chord on 2 and 4.' },
  { id: 'slipjig', name: 'Slip jig (9/8)', region: 'celtic', meter: '9/8 (3+3+3)', steps: 9, spb: 3, bpm: 100, tier: 3, target: 'chick',
    tracks: B.slipjig,
    note: 'The slip jig (“The Butterfly”, “The Kid on the Mountain”): three beats of three eighths, long–short in each. The third beat makes the tune float.' },
];

const rhythms = {
  // ================= Cuba
  cascara: {
    cycles: 8, tempo: [70, 130],
    variations: [
      { name: 'Rumba clave underneath', tracks: v('cascara', { clave: 'x..x...x..x.x...' }), note: 'The third clave stroke moves later; the cáscara stays. Hear how the rumba clave sits less squarely against it.' },
      { name: 'Tresillo bass (older son)', tracks: v('cascara', { low: 'x..x..x.x..x..x.' }), note: 'The bass plays 3+3+2 on the downbeat instead of the anticipated tumbao. The whole groove sounds earlier, more 1940s.' },
      { name: 'Maracas added', tracks: v('cascara', { shaker: 'xxxxxxxxxxxxxxxx' }), note: 'Steady eighths on maracas: check that your shell strokes sit exactly on them.' },
      { name: 'Clave and cáscara alone', tracks: pick('cascara', 'bell', 'clave'), note: 'No drums, no bass: only the two timelines. Feel where they coincide (1, 2-and of bar 1, and the whole second bar).' },
    ],
    fills: [
      { name: 'Ensemble hits on the 2-side', cycles: 1,
        tracks: { bell: 'X.xx.x.x..X.X...', clave: 'x..x..x...x.x...', low: '...x..x...x.x...', mid: '......xx..x.x...', high: '..x.......X.X...' },
        note: 'Bar 2 is a band break: everyone hits the clave’s 2 and 3, then silence until the next 1.' },
      { name: 'Timbal roll into the next section', cycles: 1,
        tracks: { bell: 'X.xx.x.x........', clave: 'x..x..x...x.x...', high: '..x.....xxxxxxxX', mid: '......xx........', low: '...x..x....x..x.' },
        note: 'A building roll (abanico-style) over bar 2; the cymbal crash would be on the next 1.' },
    ],
    tips: ['Say the clave out loud while your hand plays cáscara.', 'Accent the first stroke of each bar lightly; keep the rest even.', 'In 2-3 songs the cáscara starts with its second bar.'],
  },
  tumbao: {
    cycles: 8, tempo: [70, 130],
    variations: [
      { name: 'Montuno: cowbell enters', tracks: v('tumbao', { bell: 'X.x.X.x.X.x.X.x.' }), note: 'The bongosero switches to the bell for the montuno; the conga part doesn’t change.' },
      { name: 'Clave 2-3', tracks: v('tumbao', { clave: '..x.x...x..x..x.' }), note: 'The marcha repeats every bar, so it fits either clave direction. Hear the song’s phrase start move.' },
      { name: 'Tresillo bass', tracks: v('tumbao', { low: 'x..x..x.x..x..x.' }), note: 'An older, on-the-beat bass. The open tones now answer the bass instead of floating over it.' },
      { name: 'Rumba clave and maracas', tracks: v('tumbao', { clave: 'x..x...x..x.x...', shaker: 'xxxxxxxxxxxxxxxx' }), note: 'Different clave, maracas on eighths. Keep the two open tones dead even.' },
    ],
    fills: [
      { name: 'Conga run into 1', cycles: 1,
        tracks: { mid: '......xx..x.xxXX', high: '..X.....x...x...', clave: 'x..x..x...x.x...', low: '...x..x....x..x.' },
        note: 'Bar 2 breaks into a run of tones and slaps that ends on the last eighth, so the marcha can restart on 1.' },
      { name: 'Break on the 2-side', cycles: 1,
        tracks: { mid: '......xx..X.X...', high: '..X.......X.X...', clave: 'x..x..x...x.x...', low: '...x..x...x.x...' },
        note: 'Everyone hits the clave’s 2 and 3 and stops. Count through the silence.' },
    ],
    tips: ['Play the heel–toe strokes silently to keep your hands moving.', 'Both open tones the same volume: the second one tends to drop.', 'Lock the opens with the bass’s last note of each bar.'],
  },
  // ================= Brazil
  baiao: {
    cycles: 8, tempo: [70, 130],
    variations: [
      { name: 'Triangle and zabumba only', tracks: pick('baiao', 'low', 'bell'), note: 'The classic forró trio minus the accordion. The triangle’s ringing “and” is your clock.' },
      { name: 'Bacalhau on every offbeat sixteenth', tracks: v('baiao', { high: '.x.x.x.x.x.x.x.x' }), note: 'The thin stick on the zabumba’s underside gets busier. Your bass doesn’t move.' },
      { name: 'Guitar chords on the offbeats', tracks: v('baiao', { chick: '..x...x...x...x.' }), note: 'Accordion or guitar chords on each “and”, as in a baião song accompaniment.' },
      { name: 'Clap on 2', tracks: v('baiao', { clap: '....x.......x...' }), note: 'Handclaps on beat 2 of each bar, the second note of the zabumba figure.' },
    ],
    fills: [
      { name: 'Zabumba virada into 1', cycles: 1, tracks: { low: 'X..xX...X.xX.xXx', bell: B.baiao.bell, high: '..x...x...x...x.' },
        note: 'Bar 2 breaks into a syncopated run on the zabumba and lands back on the next 1.' },
      { name: 'Stop on 2', cycles: 1, tracks: { low: 'X..xX...X...X...', bell: 'xxXxxxXxx...x...', high: '..x...x.........' },
        note: 'In bar 2 everyone hits 1 and 2 and stops. Hear the silence, come back on 1.' },
    ],
    tips: ['Say “boom – ba-boom”: dotted eighth, sixteenth, quarter.', 'Keep the sixteenth before beat 2 short and light.', 'On guitar, thumb plays the zabumba, fingers play the triangle offbeats.'],
  },
  maxixe: {
    cycles: 16, tempo: [60, 110],
    variations: [
      { name: 'Walking bass in eighths', tracks: v('maxixe', { low: 'x.x.x.x.' }), note: 'The seven-string guitar walks on every eighth; your síncope must not drift onto its notes.' },
      { name: 'Surdo on 2 (samba feel)', tracks: v('maxixe', { mid: '....X...' }), note: 'A deep stroke on beat 2 turns the figure toward samba.' },
      { name: 'Pandeiro alone', tracks: pick('maxixe', 'clap', 'shaker'), note: 'Only the sixteenths: place the síncope exactly in the grid.' },
      { name: 'Bass on 1 only', tracks: v('maxixe', { low: 'x.......' }), note: 'Fewer reference points. Feel beat 2 inside the long note.' },
    ],
    fills: [
      { name: 'Baixaria run into 1', cycles: 1, tracks: { clap: 'xx......', low: 'x.x.xxxx', shaker: 'xxxXxxxX' }, note: 'The cavaquinho stops after the first beat while the seven-string runs down to the next 1.' },
      { name: 'Breque on the “and” of 2', cycles: 1, tracks: { clap: 'xx.xx.X.', low: 'x.....X.', shaker: 'xxxXxxX.' }, note: 'A break: everyone hits the “and” of 2 together, then a breath before 1.' },
    ],
    tips: ['Count “1 e & a 2 e & a” and play 1, e, a, 2, &.', 'The note on “e” is short; don’t let it become an eighth.', 'Swing the sixteenths very slightly, as choro players do.'],
  },
  // ================= Flamenco
  bulerias: {
    cycles: 8, tempo: [150, 280], layaRamp: true,
    variations: [
      { name: 'Palmas a contratiempo', tracks: v('bulerias', { hat: '.x.x.x.x.x.x.x.x.x.x.x.x' }), note: 'A second palmero claps every offbeat. Keep your accents on the counts while the offbeats push.' },
      { name: 'Cajón on the accents', tracks: v('bulerias', { low: 'X.....x.....X...x...X...', high: '...x.....x.....x...x...x' }), note: 'The cajón doubles 12, 3, 6, 8, 10 with bass and slaps in between.' },
      { name: 'Two big beats (12 and 6)', tracks: v('bulerias', { mid: 'X...........X...........' }), note: 'Only 12 and 6 are marked under you: feel the compás as two halves.' },
      { name: 'Accents only', tracks: pick('bulerias', 'clap'), note: 'No pulse at all: just the five accents. You must feel the counts in between.' },
    ],
    fills: [
      { name: 'Remate (cierre) on 10', cycles: 1,
        tracks: { clap: 'X.....X.....X.X.X...X...', mid: 'x.x.x.x.x.x.x.x.x...X...', low: 'X.....X.....X.X.X...X...' },
        note: 'Hits on 12, 3, 6, 7, 8 and a hard 10, then silence on 11: the closing phrase of a dance or a falseta.' },
      { name: 'Llamada over two compases', cycles: 2,
        tracks: { clap: 'X.....X.....X...X...X...' + 'X.....X.....XxX.X...X...', mid: 'x.x.x.x.x.x.x.x.x.x.x.x.' + 'x.x.x.x.x.x.X.X.X...X...', low: '........................' + 'X.....X.....X.X.X...X...' },
        note: 'One normal compás, then a call: the cajón joins on 12 and the second compás closes hard on 10.' },
    ],
    tips: ['Say “do-ce, u-no, dos, TRES…” out loud; the counting is the music.', 'Start at 150 and add 10 per day; bulerías lives above 200.', 'Practise starting from 12, not from 1: that’s where flamencos enter.'],
  },
  tangos: {
    cycles: 8, tempo: [80, 150],
    variations: [
      { name: 'Contratiempo palmas', tracks: v('tangos', { hat: '.x.x.x.x.x.x.x.x' }), note: 'A second palmero on the offbeats. Your 2-3-4 stays on the beat.' },
      { name: 'Cajón', tracks: v('tangos', { low: 'x..x....x..x....', high: '....x.......x...' }), note: 'Bass on 1 and the “and” of 2, slap on 3: a common cajón tangos pattern.' },
      { name: 'Tientos strum (3+3+2)', tracks: v('tangos', { chick: 'x..x..x.x..x..x.' }), note: 'The guitar’s 3+3+2 strum, as in slower tientos. Your claps cross it.' },
    ],
    fills: [
      { name: 'Remate on 8', cycles: 1, tracks: { clap: '..x.x.x...x.x.X.', low: 'x.......x.....X.', chick: 'x.......x.....X.' }, note: 'Everyone closes on count 8 (beat 4 of bar 2) and leaves 1 silent, as always.' },
    ],
    tips: ['Count in eight: “1 2 3 4 5 6 7 8” over two bars.', 'The silent 1 is part of the pattern: breathe there.', 'Let the claps be dry and flat-handed (palmas sordas for quiet passages).'],
  },
  // ================= Hindustani
  deepchandi: {
    cycles: 6, tempo: [60, 140], layaRamp: true,
    variations: [
      { name: 'Theka with Dha Ge Tin', tracks: v('deepchandi', { high: 'xx.x.x.xx.x.x.' }), labels: ['Dha', 'Dhin', '–', 'Dha', 'Ge', 'Tin', '–', 'Ta', 'Tin', '–', 'Dha', 'Ge', 'Dhin', '–'], note: 'A common variant with Ge (bayan alone) in place of the second Dha.' },
      { name: 'Filled theka (prakar)', tracks: v('deepchandi', { low: 'xxxxx.....xxxx', high: 'xxxxxxxxxxxxxx' }), labels: ['Dha', 'Dhin', 'Ge', 'Dha', 'Dha', 'Tin', 'Ka', 'Ta', 'Tin', 'Ka', 'Dha', 'Dha', 'Dhin', 'Ge'], note: 'The gaps are filled with Ge and Ka. Your claps must stay on 1, 4, 8 and 11.' },
      { name: 'Bayan only on sam', tracks: v('deepchandi', { low: 'x.............' }), note: 'The bass only speaks on sam: the open and closed sections are now in your clapping alone.' },
    ],
    fills: [
      { name: 'Tihai: TiRaKiTa-Tak-Dha ×3 to sam', cycles: 1,
        tracks: { clap: 'X..x...x..x...', low: 'xx.x..x...x...', high: 'xx.xxxx.xxx.xx' },
        labels: ['Dha', 'Dhin', '–', 'Dha', 'TiRaKiTa', 'Tak', 'Dha', '–', 'TiRaKiTa', 'Tak', 'Dha', '–', 'TiRaKiTa', 'Tak'],
        note: 'Three times TiRaKiTa-Tak-Dha with a one-matra gap. The third Dha is sam itself, the first beat of the next cycle.' },
    ],
    tips: ['Wave (don’t clap) on 8, the khali.', 'Say the bols with the gaps: “Dha Dhin –”.', 'Feel the 3+4+3+4: the short sections come first.'],
  },
  jhoomra: {
    cycles: 4, tempo: [40, 90], layaRamp: true,
    variations: [
      { name: 'Bayan only on Dhin', tracks: v('jhoomra', { low: 'x..xx.....xx..' }), note: 'The bass speaks less; the slow sections stretch out. Keep counting every matra.' },
      { name: 'Sparse theka (no TiRaKiTa)', tracks: v('jhoomra', { low: 'xx.xxx....xxx.', high: 'xx.xxx.xx.xxx.' }), labels: ['Dhin', '–Dha', '–', 'Dhin', 'Dhin', 'DhaGe', '–', 'Tin', '–Ta', '–', 'Dhin', 'Dhin', 'DhaGe', '–'], note: 'The rolls drop out, leaving long empty matras.' },
      { name: 'Clap and bayan only', tracks: pick('jhoomra', 'clap', 'low'), note: 'Hear the sections only through the bass: open, open, closed (khali), open.' },
    ],
    fills: [
      { name: 'Tihai: TiRaKiTa-Tak-Dha ×3 to sam', cycles: 1,
        tracks: { clap: 'X..x...x..x...', low: 'xx.x..x...x...', high: 'xxxxxxx.xxx.xx' },
        labels: ['Dhin', '–Dha', 'TiRaKiTa', 'Dhin', 'TiRaKiTa', 'Tak', 'Dha', '–', 'TiRaKiTa', 'Tak', 'Dha', '–', 'TiRaKiTa', 'Tak'],
        note: 'The phrase three times with a one-matra gap; the last Dha lands on sam of the next cycle.' },
    ],
    tips: ['At vilambit speed, count half-beats under your breath.', 'The “–Dha” falls halfway through the matra: wait for it.', 'Practise at 60 first, then slow down to 45: slower is harder.'],
  },
  chautal: {
    cycles: 6, tempo: [60, 140], layaRamp: true,
    variations: [
      { name: 'Bass on Dha only', tracks: v('chautal', { low: 'xx...x......' }), note: 'The open pakhawaj strokes thin out to the Dhas.' },
      { name: 'Open GaDi GaNa', tracks: v('chautal', { low: 'x.........xx' }), note: 'Only sam and the closing GaDi GaNa are open: the cycle points toward sam.' },
      { name: 'Sparse: sam and claps', tracks: v('chautal', { high: 'x...x...x.x.' }), note: 'The drum plays only where you clap. Count the waves on 3 and 7 yourself.' },
    ],
    fills: [
      { name: 'Tihai: TiTa-KaTa-Dha ×3 to sam', cycles: 1,
        tracks: { clap: 'X.x.x.x.x.x.', low: 'xx..x...x...', high: 'xxxxx.xxx.xx' },
        labels: ['Dha', 'Dha', 'TiTa', 'KaTa', 'Dha', '–', 'TiTa', 'KaTa', 'Dha', '–', 'TiTa', 'KaTa'],
        note: 'Three TiTa-KaTa-Dha with one-matra gaps; the third Dha is the next sam.' },
    ],
    tips: ['Claps on 1, 5, 9, 11; waves on 3 and 7.', 'Pakhawaj bols are heavier than tabla: say them deep.', 'Dhrupad builds slowly from a calm tempo: try the speed-up.'],
  },
  // ================= Carnatic
  misrachapu: {
    cycles: 12, tempo: [80, 200], layaRamp: true,
    variations: [
      { name: 'Thoppi on 1 only', tracks: v('misrachapu', { low: 'x......' }), note: 'The bass head speaks once per cycle. Keep your claps on 1, 4 and 6.' },
      { name: 'Accent the second half', tracks: v('misrachapu', { low: '...x.x.', high: 'x..XxXx' }), note: 'The mridangam leans on 4 and 6, the way many kritis feel misra chapu: 3 + 4.' },
      { name: 'Kanjira doubling the strokes', tracks: v('misrachapu', { mid: 'x.xx.x.' }), note: 'A kanjira adds its own accents. Stay on your claps.' },
    ],
    fills: [
      { name: 'Mora: Ta-di-ki-na-tom ×3', cycles: 2,
        tracks: { clap: 'X..x.x.X..x.x.', low: '....x....x....', high: 'xxxxxxxxxxxxxx' },
        labels: ['Ta', 'Di', 'Ki', 'Na', 'Tom', 'Ta', 'Di', 'Ki', 'Na', 'Tom', 'Ta', 'Di', 'Ki', 'Na'],
        note: 'Five syllables three times without a gap: 15 strokes over two cycles, so the third Tom lands on samam.' },
    ],
    tips: ['Say Ta-ki-ta Ta-ka Di-mi aloud.', 'The 3 comes first: don’t rush it.', 'Clap the 1 firmly; 4 and 6 lighter.'],
  },
  khandachapu: {
    cycles: 16, tempo: [80, 220], layaRamp: true,
    variations: [
      { name: 'Accent the long beat', tracks: v('khandachapu', { low: '..x..', high: 'xxXxx' }), note: 'The mridangam leans on 3, the start of the long beat.' },
      { name: 'Kanjira on 1 and 4', tracks: v('khandachapu', { mid: 'x..x.' }), note: 'A second voice splits the 3 into its own pattern. Your claps stay on 1 and 3.' },
      { name: 'Strokes thinned out', tracks: v('khandachapu', { high: 'x.x..' }), note: 'Only the clapped beats sound. Feel the 2 and the 3 in between.' },
    ],
    fills: [
      { name: 'Mora: Ta-ka-tom ×3 to samam', cycles: 2,
        tracks: { clap: 'X.x..X.x..', low: '....x..x..', high: 'xxxxxxxxxx' },
        labels: ['Ta', 'Ka', 'Ta', 'Ka', 'Tom', 'Ta', 'Ka', 'Tom', 'Ta', 'Ka'],
        note: 'Ta-ka-tom three times starting on beat 3; the third Tom lands on samam.' },
    ],
    tips: ['Say Ta-ka Ta-ki-ta: short, long.', 'Start slow; khanda chapu is often very fast.', 'Then try Ta-ki-ta Ta-ka (3+2) and hear how different it feels.'],
  },
  aditisra: {
    cycles: 4, tempo: [50, 100],
    variations: [
      { name: 'Accent every Ta', tracks: v('aditisra', { high: 'XxxXxxXxxXxxXxxXxxXxxXxx' }), note: 'The first of each three is marked: easy to hear the beat.' },
      { name: 'Groups of four across the beats', tracks: v('aditisra', { high: 'XxxxXxxxXxxxXxxxXxxxXxxx' }), labels: ['Ta', 'Ka', 'Di', 'Mi', 'Ta', 'Ka', 'Di', 'Mi', 'Ta', 'Ka', 'Di', 'Mi', 'Ta', 'Ka', 'Di', 'Mi', 'Ta', 'Ka', 'Di', 'Mi', 'Ta', 'Ka', 'Di', 'Mi'], note: 'Ta-ka-di-mi in the triplet stream: the accents cross the beat and meet it again every four beats. Keep the kriya steady.' },
      { name: 'Sparse: only the Ta', tracks: v('aditisra', { high: 'x..x..x..x..x..x..x..x..' }), note: 'Only the beats sound; say ki-ta yourself.' },
    ],
    fills: [
      { name: 'Mora: Ta-di-ki-na-tom ×3 to samam', cycles: 1,
        tracks: { clap: B.aditisra.clap, low: '............x.....x.....', high: 'xxxxxxxxxxxxx.xxxxx.xxxx' },
        labels: ['Ta', 'Ki', 'Ta', 'Ta', 'Ki', 'Ta', 'Ta', 'Ki', 'Ta', 'Di', 'Ki', 'Na', 'Tom', '–', 'Ta', 'Di', 'Ki', 'Na', 'Tom', '–', 'Ta', 'Di', 'Ki', 'Na'],
        note: 'Ta-di-ki-na-tom three times with a one-pulse gap, starting on the third pulse of beat 3. The third Tom lands on samam.' },
    ],
    tips: ['Speak Ta-ki-ta while your hand does the kriyas.', 'Make sure all three syllables are equal.', 'Then switch between chatusra (4) and tisra (3) every cycle.'],
  },
  // ================= Arabic
  ayyub: {
    cycles: 16, tempo: [70, 160], layaRamp: true,
    variations: [
      { name: 'Riq jingles on eighths', tracks: v('ayyub', { shaker: 'x.x.x.x.' }), note: 'The riq marks eighths. Your Dums and Teks don’t change.' },
      { name: 'Handclaps on the Dums', tracks: v('ayyub', { clap: 'x...x...' }), note: 'Claps on each beat as in a zar circle.' },
      { name: 'Second drum fills in', tracks: v('ayyub', { mid: '.x...x.x' }), labels: ['D', 't', '', 'k', 'D', 't', 'T', 'k'], note: 'A second darbuka plays the gaps. Stay with your own strokes.' },
    ],
    fills: [
      { name: 'Tek roll into Dum', cycles: 1, tracks: { low: 'x.......', high: '..xxxxxx' }, labels: ['D', '', 't', 'k', 't', 'k', 't', 'k'], note: 'A roll of teks after the first Dum that leads into the next cycle.' },
    ],
    tips: ['Say “Dum – – ka Dum – Tek –”.', 'The ka is light; the Dums are equal.', 'Let it speed up like a dhikr: try the speed-up.'],
  },
  samaithaqil: {
    cycles: 8, tempo: [110, 240],
    variations: [
      { name: 'Teks filled in (tk)', tracks: v('samaithaqil', { mid: '.xx.x...xx' }), labels: ['D', 't', 'k', 'T', 'k', 'D', 'D', 'T', 't', 'k'], note: 'The gaps get light tk strokes. The skeleton stays the same.' },
      { name: 'Riq on every eighth', tracks: v('samaithaqil', { shaker: 'xxxxxxxxxx' }), note: 'Ten even eighths under you. Count them while you play.' },
      { name: 'Clap the four uneven beats', tracks: v('samaithaqil', { clap: 'x..x.x.x..' }), note: 'Claps on 1, 4, 6 and 8: 3+2+2+3.' },
    ],
    fills: [
      { name: 'Tek roll into the next cycle', cycles: 1, tracks: { low: 'X....xx...', high: '...x...xxx' }, labels: ['D', '', '', 'T', '', 'D', 'D', 'T', 'k', 'T'], note: 'The last group fills with teks into the next Dum.' },
    ],
    tips: ['Group the eighths 3+2+2+3 aloud.', 'The two Dums together are the centre of the cycle.', 'Play it slow and dignified: it carries long melodies.'],
  },
  // ================= Turkey & Balkans
  daichovo: {
    cycles: 12, tempo: [240, 420],
    variations: [
      { name: 'Clap the four beats', tracks: v('daichovo', { clap: 'x.x.x.x..' }), note: '1-2-3-4, with the 4 one eighth longer.' },
      { name: 'Tambura chords on the beats', tracks: v('daichovo', { chick: 'x.x.x.x..' }), note: 'A tambura or guitar strums each beat. Feel the stretch on 4.' },
      { name: 'Stick on every eighth', tracks: v('daichovo', { hat: 'xxxxxxxxx' }), note: 'The thin stick fills all nine eighths.' },
    ],
    fills: [
      { name: 'Stick roll into 1', cycles: 1, tracks: { low: 'X........', high: '..xxxxxxx' }, note: 'After the first beat the stick rolls through the bar into the next 1.' },
    ],
    tips: ['Count “1-2, 2-2, 3-2, 4-2-3”.', 'The long beat is the dance’s lift.', 'Feel four beats, not nine eighths.'],
  },
  paidushko: {
    cycles: 16, tempo: [200, 400],
    variations: [
      { name: 'Chords on both beats', tracks: v('paidushko', { chick: 'x.x..' }), note: 'Quick, slow: a strum on each.' },
      { name: 'Clap the long beat', tracks: v('paidushko', { clap: '..x..' }), note: 'Claps join the long beat.' },
      { name: 'Every eighth', tracks: v('paidushko', { shaker: 'xxxxx' }), note: 'All five eighths sound. Keep the 2+3 in your body.' },
    ],
    fills: [
      { name: 'Run into 1', cycles: 1, tracks: { low: 'X....', high: '.xxxx' }, note: 'Eighths through the bar into the next 1.' },
    ],
    tips: ['Say “quick, slo-ow”.', 'Two cycles make a “ten” that feels like 2+3+2+3.', 'Keep it light: the dance bounces.'],
  },
  lesnoto: {
    cycles: 12, tempo: [180, 360],
    variations: [
      { name: 'Tapan with stick fills', tracks: v('lesnoto', { hat: '.x..x.x' }), note: 'The stick plays between the beats.' },
      { name: 'Guitar on all three beats', tracks: v('lesnoto', { chick: 'x..x.x.' }), note: 'A strum doubles your claps: listen for the long first beat.' },
      { name: 'Bass only on 1', tracks: pick('lesnoto', 'clap', 'low'), note: 'Only the downbeat is given. Place 2 and 3 yourself.' },
    ],
    fills: [
      { name: 'Two-cycle phrase ending', cycles: 2, tracks: { clap: 'X..x.x.X......', low: 'X......X......', high: '...x.x........' }, note: 'A dance phrase ends on the next 1: in the second cycle only beat 1 sounds. Keep the beats in your head.' },
    ],
    tips: ['Clap 1 (long), 2, 3.', 'Lesnoto is slower than kalamatianos: don’t rush.', 'Walk it: step on each clap.'],
  },
  // ================= West Africa
  agbekor: {
    cycles: 8, tempo: [80, 140],
    variations: [
      { name: 'Bell and kagan only', tracks: pick('agbekor', 'clap', 'bell'), note: 'The timeline and your part. Where does the bell meet your offbeats?' },
      { name: 'Second drum in three', tracks: v('agbekor', { mid: 'x...x...x...' }), note: 'A drum plays three even notes per cycle: 3 against the four beats.' },
      { name: 'Axatse rattle', tracks: v('agbekor', { shaker: 'xxxxxxxxxxxx' }), note: 'The rattle fills every pulse.' },
      { name: 'Dancers’ beat only', tracks: pick('agbekor', 'clap', 'low'), note: 'No bell: just the four beats and your offbeats.' },
    ],
    fills: [
      { name: 'Lead drum call', cycles: 1, tracks: { clap: '.xx.xx......', bell: B.agbekor.bell, mid: '......xx.xxX' }, note: 'The kagan drops out while the lead drum calls into the next cycle.' },
    ],
    tips: ['Say “ka-gan” in the gaps after each beat.', 'Feel the four beats in your feet.', 'Never stop: kagan is the most constant part.'],
  },
  kpanlogo: {
    cycles: 8, tempo: [90, 140],
    variations: [
      { name: 'Shaker on the offbeats', tracks: v('kpanlogo', { shaker: '.x.x.x.x.x.x.x.x' }), note: 'The shaker moves to the offbeats; your bell doesn’t move.' },
      { name: 'Drum open tones on 4', tracks: v('kpanlogo', { mid: '......xx......xx' }), note: 'A supporting drum adds two open tones at the end of each bar.' },
      { name: 'Handclaps on 2 and 4', tracks: v('kpanlogo', { clap: '..x...x...x...x.' }), note: 'Claps on the backbeat, as people do around a kpanlogo group.' },
    ],
    fills: [
      { name: 'Lead drum call', cycles: 1, tracks: { bell: 'x..x..x.........', mid: '........xx.xxXX.', low: 'x...x...x.......' }, note: 'The bell drops out in bar 2 while the lead drum calls the next section.' },
    ],
    tips: ['Count it as two bars: 3 strokes, then 2.', 'Keep the bell bright and short.', 'Compare it with the son clave: the same shape in another tradition.'],
  },
  // ================= Central & East Africa
  cavacha: {
    cycles: 8, tempo: [110, 170],
    variations: [
      { name: 'Kick only', tracks: pick('cavacha', 'high', 'low'), note: 'Just the drum kit: hear the gallop against the four-on-the-floor.' },
      { name: 'Bass on the offbeats', tracks: v('cavacha', { mid: '..x...x...x...x.' }), note: 'A bouncing bass on the “and”s.' },
      { name: 'Guitar chops on 2 and 4', tracks: v('cavacha', { chick: '....x.......x...' }), note: 'The rhythm guitar thins to the backbeat.' },
    ],
    fills: [
      { name: 'Animation break', cycles: 1, tracks: { high: 'X.xxX.xx..X...X.', low: 'x...x.....x...x.', chick: '..x...x...x...x.' }, note: 'A break in the second half: the band hits 3 and 4, then the next cycle restarts the sebene.' },
    ],
    tips: ['Each beat: one long, two short — “tcha, ka-ka”.', 'Keep it light and fast; it should sound like a train.', 'Start at 110 and build.'],
  },
  benga: {
    cycles: 8, tempo: [100, 160],
    variations: [
      { name: 'Hi-hat on sixteenths', tracks: v('benga', { hat: 'xxxxxxxxxxxxxxxx' }), note: 'The hi-hat doubles up; your offbeats stay put.' },
      { name: 'Bass on eighths', tracks: v('benga', { mid: 'x.x.x.x.x.x.x.x.' }), note: 'A bouncing bass line on every eighth.' },
      { name: 'Drums only', tracks: pick('benga', 'chick', 'low', 'high'), note: 'Kick and snare alone.' },
    ],
    fills: [
      { name: 'Snare run into 1', cycles: 1, tracks: { chick: '..x...x.........', low: 'x...x...x.......', high: '....x...xxxxxxxx' }, note: 'A snare run over beats 3–4 that leads back to 1.' },
    ],
    tips: ['Count “1 & 2 & 3 & 4 &” and play the “&”s.', 'Keep the offbeat light and short.', 'Benga is fast: build speed slowly.'],
  },
  // ================= Latin America
  tangomarcato: {
    cycles: 16, tempo: [90, 140],
    variations: [
      { name: 'Bass on 1 and 3', tracks: v('tangomarcato', { low: 'x...x...' }), note: 'Marcato en dos in the bass; you keep all four.' },
      { name: 'Síncopa (3-3-2) in the bass', tracks: v('tangomarcato', { low: 'X..x..x.' }), note: 'The bass plays the 3-3-2. Hear it rub against your even beats.' },
      { name: 'Arrastre into each beat', tracks: v('tangomarcato', { mid: '.x.x.x.x' }), note: 'A drag (arrastre) before each beat, as the bandoneóns do.' },
    ],
    fills: [
      { name: '3-3-2 tutti', cycles: 1, tracks: { chick: 'X..x..x.', low: 'X..x..x.' }, note: 'The whole orchestra plays 3-3-2, then back to marcato.' },
    ],
    tips: ['Short and dry on every beat.', '1 and 3 a little heavier.', 'Then try marcato en dos: only 1 and 3.'],
  },
  cumbia: {
    cycles: 8, tempo: [80, 110],
    variations: [
      { name: 'Guacharaca alone', tracks: pick('cumbia', 'chick', 'shaker'), note: 'Just the scraper and your offbeats.' },
      { name: 'Alegre drum', tracks: v('cumbia', { mid: '......x.......x.' }), note: 'The alegre drum adds an open tone on 2&4 “and”.' },
      { name: 'Bass with pickup', tracks: v('cumbia', { low: 'x.......x.....x.' }), note: 'A short pickup before 1.' },
    ],
    fills: [
      { name: 'Break on 4', cycles: 1, tracks: { chick: '..x...x...x.....', shaker: 'X.xxX.xxX.xxX...', low: 'x.......x...X...' }, note: 'Everyone hits beat 4 and stops before 1.' },
    ],
    tips: ['Count “1 & 2 & 3 & 4 &”, play the “&”s.', 'Keep your chord short.', 'Relax: cumbia walks.'],
  },
  huayno: {
    cycles: 16, tempo: [80, 130],
    variations: [
      { name: 'Bombo on 1 only', tracks: v('huayno', { low: 'x.......' }), note: 'The bass drum plays once a bar.' },
      { name: 'Quena melody feel', tracks: v('huayno', { shaker: 'xxxxxxxx' }), note: 'A shaker on sixteenths.' },
      { name: 'Stamped steps', tracks: v('huayno', { mid: 'x...x...' }), note: 'The dancers stamp on each beat.' },
    ],
    fills: [
      { name: 'Fuga ending', cycles: 1, tracks: { clap: 'X.xxX...', low: 'x...X...' }, note: 'The bar ends on beat 2.' },
    ],
    tips: ['“Long, short-short” on every beat.', 'The two short notes are sixteenths: tight.', 'Stamp your foot on each beat.'],
  },
  // ================= Caribbean
  steppers: {
    cycles: 8, tempo: [60, 90],
    variations: [
      { name: 'Hi-hat on offbeats', tracks: v('steppers', { hat: '..x...x...x...x.' }), note: 'Open hi-hat on the “and”s.' },
      { name: 'Bass line', tracks: v('steppers', { mid: 'x..x..x.....x...' }), note: 'A bass line around the kick.' },
      { name: 'Organ bubble', tracks: v('steppers', { clap: '..xx..xx..xx..xx' }), note: 'The organ “bubble” on the offbeats.' },
    ],
    fills: [
      { name: 'Drop', cycles: 1, tracks: { low: 'X...X...X.......', high: '........x.......', chick: '....x...........' }, note: 'The band drops out for beat 4.' },
    ],
    tips: ['Kick even on every beat.', 'Relax; reggae tempos are slow.', 'Listen to the skank on 2 and 4.'],
  },
  rockers: {
    cycles: 8, tempo: [60, 95],
    variations: [
      { name: 'Hi-hat with 16th accents', tracks: v('rockers', { shaker: 'x.x.x.x.x.x.x.x.' }), note: 'A shaker on eighths.' },
      { name: 'Double skank', tracks: v('rockers', { chick: '....xx......xx..' }), note: 'The guitar chops twice on 2 and 4.' },
      { name: 'Kick on 1 only', tracks: v('rockers', { low: 'x...............' }), note: 'Only beat 1.' },
    ],
    fills: [
      { name: 'Snare roll', cycles: 1, tracks: { hat: '..x...x...x.....', low: 'x.......x.......', high: '........x...xxxx' }, note: 'A roll into 1.' },
    ],
    tips: ['Tap the “and”s.', 'Keep relaxed.', 'Listen to the kick.'],
  },
};

export default { extra, rhythms };
