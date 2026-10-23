/* World Woodshed — melodies for the Repertoire tunes that are a progression rather than a song (a blues, the
   rhythm changes, the world grooves' vamps). Each is an original line written for this app over the tune's
   chords, so it can be shown and played; the standards that are still under copyright have none, and Pan
   adds their own (src/melody.js). Loaded with the tunes' notes (loadTuneNotes), attached as t.melody.

   key: the key signature to write it in. mel: bars split by |, each note pitch:quarters at sounding pitch
   (C4 is middle C), r:quarters a rest, -:quarters the note before held over the bar line. Eighths are written
   straight and swung by the band in a swing or shuffle groove. test/melody.test.js checks every bar adds up
   to four beats and the melody has one bar per bar of the chart. */

export default {
  fblues: {
    key: 'F',
    mel: 'r:.5 A4:.5 C5:.5 Eb5:1 C5:.5 A4:1 | D5:.5 Db5:.5 C5:.5 Bb4:.5 Ab4:2 | r:.5 A4:.5 C5:.5 Eb5:1 C5:.5 A4:1 | G4:1 Bb4:.5 C5:.5 Eb5:1 D5:1 |' +
      ' -:1 r:.5 F5:.5 D5:.5 Bb4:.5 Ab4:1 | B4:1 D5:1 F5:1 Ab5:1 | A5:1.5 F5:.5 C5:1 A4:1 | F#4:1 A4:.5 C5:1.5 r:1 |' +
      ' Bb4:.5 A4:.5 Bb4:.5 D5:1 F5:1.5 | E5:1 C5:.5 Bb4:1 G4:1.5 | A4:1 C5:1 F#4:1 A4:1 | Bb4:1 D5:1 E5:1 r:1'
  },
  rhythm: {
    key: 'Bb',
    mel: 'D5:.5 F5:.5 r:.5 D5:.5 B4:1 D5:1 | C5:.5 Eb5:.5 G5:1 F5:.5 Eb5:.5 C5:1 | D5:.5 F5:.5 A5:1 G5:.5 F5:.5 B4:1 | C5:1.5 Bb4:.5 A4:1 r:1 |' +
      ' Ab4:.5 C5:.5 Eb5:1 D5:.5 Ab5:.5 F5:1 | G5:1 Eb5:1 Db5:1 E5:1 | F5:.5 E5:.5 D5:.5 C5:.5 B4:1 G4:1 | Eb5:1 C5:1 A4:1 F4:1'
  },
  minorswing: {
    key: 'Am',
    mel: 'E4:.5 F#4:.5 A4:.5 C5:.5 E5:2 | E5:.5 D#5:.5 E5:.5 C5:.5 A4:2 | F4:.5 A4:.5 B4:.5 D5:.5 F5:2 | E5:.5 F5:.5 D5:1 B4:2 |' +
      ' C5:1 B4:.5 C5:.5 E5:1 A4:1 | F#4:1 A4:1 C5:2 | B4:.5 D5:.5 F5:.5 G#4:.5 B4:2 | D5:1 B4:.5 G#4:.5 E4:2 |' +
      ' D5:1.5 F5:.5 A5:2 | A5:.5 G#5:.5 A5:.5 F5:.5 D5:2 | C5:1 E5:1 A5:2 | A5:.5 F#5:.5 E5:.5 C5:.5 A4:2 |' +
      ' G#4:.5 B4:.5 D5:.5 F5:.5 E5:2 | D5:.5 B4:.5 G#4:.5 F4:.5 E4:2 | A4:1 C5:1 E5:1 F#5:1 | A5:3 r:1'
  },
  andalusian: {
    key: 'Am',
    mel: 'E5:1 D5:.5 C5:.5 B4:1 C5:1 | B4:1 A4:.5 G4:.5 D5:2 | C5:1 B4:.5 A4:.5 F4:1 A4:1 | G#4:2 F4:.5 E4:1.5 |' +
      ' A4:.5 C5:.5 E5:1 A5:2 | G5:1 F5:.5 E5:.5 D5:2 | C5:.5 D5:.5 C5:.5 A4:.5 F4:2 | F4:.5 G#4:.5 B4:1 E4:2'
  },
  sonmontuno: {
    key: 'C',
    mel: 'E5:.5 E5:.5 r:.5 G5:1 F5:.5 A4:1 | D5:.5 B4:.5 r:.5 D5:1 C5:.5 A4:1 | E5:.5 G5:.5 r:.5 E5:1 C5:.5 A4:1 | B4:.5 D5:.5 r:.5 F5:1 A4:.5 C5:1'
  },
  bossavamp: {
    key: 'Dm',
    mel: 'r:.5 F5:1 E5:.5 D5:1 C5:1 | A4:2.5 r:.5 E5:1 | -:1 D5:.5 Bb4:1.5 G4:1 | C#5:2 Bb4:1 G4:1 |' +
      ' F4:.5 A4:.5 C5:.5 E5:1 F5:1.5 | D5:3 r:1 | G5:1 E5:.5 D5:.5 Bb4:2 | A4:.5 C#5:.5 E5:.5 G5:.5 F5:2'
  },
  highlife: {
    key: 'G',
    mel: 'B4:.5 D5:.5 G5:.5 D5:.5 B4:1 G4:1 | C5:.5 E5:.5 G5:.5 E5:.5 C5:1 r:1 | D5:.5 B4:.5 D5:1 G5:1.5 r:.5 | F#5:.5 E5:.5 D5:.5 A4:.5 F#4:2 |' +
      ' G4:.5 B4:.5 D5:.5 G5:1 F#5:.5 G5:1 | E5:1 C5:.5 E5:.5 G5:2 | F#5:.5 A5:.5 F#5:.5 D5:.5 A4:1 C5:1 | B4:3 r:1'
  },
  soukous: {
    key: 'E',
    mel: 'G#5:.5 E5:.5 B4:.5 E5:.5 A5:.5 E5:.5 C#5:.5 E5:.5 | F#5:.5 D#5:.5 B4:.5 D#5:.5 E5:.5 C#5:.5 A4:.5 C#5:.5 |' +
      ' B5:1 G#5:.5 E5:.5 A5:1 E5:.5 C#5:.5 | D#5:1 F#5:.5 B4:.5 C#5:1 A4:1'
  },
  reggae: {
    key: 'G',
    mel: 'r:1 E5:.5 C5:.5 A4:1.5 G4:.5 | A4:1 F#4:1 D4:2 | r:1 E5:.5 G5:.5 E5:1 C5:1 | D5:.5 C5:.5 A4:.5 F#4:2.5'
  },
  tango: {
    key: 'Am',
    mel: 'E5:1.5 C5:.5 A4:1 B4:1 | G#4:1.5 B4:.5 D5:1 F5:1 | E5:1.5 D5:.5 B4:1 G#4:1 | A4:3 r:1 |' +
      ' D5:1.5 F5:.5 A5:1 G5:.5 F5:.5 | E5:1.5 C5:.5 A4:2 | B4:.5 C5:.5 D5:.5 F5:.5 E5:1 G#4:1 | A4:2 r:2'
  },
  hijazvamp: {
    key: 'Gm',
    mel: 'D5:1 Eb5:.5 F#5:.5 G5:1 F#5:1 | Eb5:.5 F#5:.5 Eb5:.5 C5:.5 D5:2 | G5:1 F#5:.5 Eb5:.5 Bb4:2 | A4:1 F#4:.5 Eb4:.5 D4:2 |' +
      ' D4:.5 F#4:.5 A4:.5 D5:.5 F#5:2 | G5:1 Eb5:.5 C5:.5 G4:2 | Bb4:1 G4:.5 Bb4:.5 Eb5:2 | D5:.5 Eb5:.5 D5:3'
  },
  blues12: {
    key: 'A',
    mel: 'r:.5 C5:.5 C#5:.5 E5:1 C#5:.5 A4:1 | G4:1 A4:3 | r:.5 C5:.5 C#5:.5 E5:1 G5:.5 E5:1 | C#5:2 r:2 |' +
      ' r:.5 C5:.5 D5:.5 F#5:1 D5:.5 C5:1 | A4:1 F4:.5 F#4:.5 D4:2 | r:.5 C5:.5 C#5:.5 E5:1 C#5:.5 A4:1 | G4:1 A4:3 |' +
      ' B4:.5 D5:.5 E5:.5 G#5:1.5 E5:1 | F#5:.5 D5:.5 C5:.5 A4:1.5 F#4:1 | E4:.5 G4:.5 A4:.5 C5:.5 C#5:2 | B4:1 G#4:1 E4:2'
  },
  rockvamp: {
    key: 'D',
    mel: 'F#5:1 A5:1 F#5:.5 E5:.5 D5:1 | E5:1 G5:1 E5:.5 D5:.5 C5:1 | D5:1.5 B4:.5 G4:2 | A4:.5 C5:.5 A4:.5 F#4:.5 D4:2 |' +
      ' D5:.5 D5:.5 F#5:.5 A5:1.5 F#5:1 | G5:.5 G5:.5 E5:.5 C5:1.5 E5:1 | D5:1 B4:.5 D5:.5 G5:1 F5:1 | F#5:3 r:1'
  },
  funkvamp: {
    key: 'D',
    mel: 'E5:.25 r:.25 G5:.25 r:.25 E5:.5 D5:.25 E5:.75 r:.5 B4:.5 D5:.5 | r:.5 E5:.25 E5:.25 G#5:.5 E5:.5 F#5:1 r:1 |' +
      ' B5:.25 r:.25 A5:.25 r:.25 G5:.5 E5:.5 D5:.25 E5:.75 r:1 | C#5:.5 D5:.5 E5:.5 G5:.5 F#5:1 E5:1'
  },
  country145: {
    key: 'G',
    mel: 'D5:1 B4:1 G4:1 B4:1 | D5:1.5 E5:.5 D5:2 | E5:1 C5:1 G4:1 C5:1 | E5:1.5 G5:.5 E5:2 |' +
      ' D5:.5 B4:.5 G4:1 A4:.5 Bb4:.5 B4:1 | D5:2 r:2 | F#5:1 E5:.5 D5:.5 C5:1 A4:1 | F#4:1 A4:1 C5:2 |' +
      ' B4:1 D5:1 G5:1 D5:1 | B4:3 r:1 | C5:1 E5:1 G5:1 E5:1 | G5:1.5 E5:.5 C5:2 |' +
      ' B4:.5 A4:.5 G4:.5 B4:.5 D5:2 | C5:1 A4:1 F#4:1 A4:1 | G4:2 B4:1 D5:1 | G5:2 r:2'
  },
  fadominor: {
    key: 'Am',
    mel: 'E4:1 A4:1 B4:1 C5:1 | E5:3 D5:.5 C5:.5 | B4:2 G#4:1 B4:1 | D5:3 r:1 |' +
      ' D5:1 F5:1 E5:1 D5:1 | C5:.5 B4:.5 G#4:1 E4:2 | A4:1 C5:1 E5:2 | A5:3 r:1 |' +
      ' G5:1 E5:1 C5:1 A4:1 | C#5:2 E5:1 G5:1 | F5:3 E5:.5 D5:.5 | A4:3 r:1 |' +
      ' C5:1 E5:1 D5:1 C5:1 | B4:1 G#4:1 F4:1 G#4:1 | A4:4 | r:4'
  },
  slackkey: {
    key: 'G',
    mel: 'B4:1 D5:.5 E5:.5 D5:2 | G5:1 E5:.5 D5:.5 B4:2 | C5:1 E5:.5 G5:.5 E5:2 | D5:1.5 B4:.5 G4:2 |' +
      ' B4:.5 D5:.5 G5:1 A5:.5 G5:.5 E5:1 | F#5:1 A5:1 F#5:.5 D5:.5 C5:1 | B4:1 A4:.5 G4:.5 D4:1 G4:1 | G4:3 r:1'
  }
};
