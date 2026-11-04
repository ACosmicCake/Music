/* Ký âm: the southern Vietnamese note names (hò xự xang xê cống), for the vọng cổ guitar drills and lessons.
   Plain functions; test/kyam.test.js.

   A name says where a note sits above hò, the home note, not which pitch it is: on dây Lai tuning in the dây
   Đào key hò is D. Which pitch each name has depends on the hơi (mode). In hơi Bắc the five notes are the
   pentatonic 0 2 5 7 9 semitones above hò. In hơi Nam and Oán, as guitar teachers write them, xự sits a
   minor third up and is pressed sharp, cống a minor sixth up and pressed (or a major sixth), and oan a minor
   seventh up, shaken (rung). The octave above hò is liu, then ú, xáng, xế; xề is xê an octave below hò. */
const BAC = { 0: 'hò', 2: 'xự', 5: 'xang', 7: 'xê', 9: 'cống' };
const NAM = { 0: 'hò', 3: 'xự', 5: 'xang', 7: 'xê', 8: 'cống', 9: 'cống', 10: 'oan' };
const UP = { hò: 'liu', xự: 'ú', xang: 'xáng', xê: 'xế' };

/* The name of one pitch (MIDI, the fret's pitch before any press) with hò at `ho`; '' when it has none */
export function kyamName(midi, ho, hoi = 'bac') {
  if (midi == null || ho == null) return '';
  const d = Math.round(midi) - ho, pc = ((d % 12) + 12) % 12, oct = Math.floor(d / 12);
  const name = (hoi === 'bac' ? BAC : NAM)[pc];
  if (!name) return '';
  if (oct === 0) return name;
  if (oct === 1) return UP[name] || '';
  if (oct === -1) return name === 'xê' ? 'xề' : '';
  return '';
}

/* Names for a list of notes ({ m, up, rung } as the drills write them, or plain MIDI numbers), with a mark
   for a pressed note (↗) and a shaken one (~) */
export function kyamNames(notes, ho, hoi = 'bac') {
  return notes.map(n => {
    const m = n != null && typeof n === 'object' ? n.m : n;
    const name = kyamName(m, ho, hoi);
    if (!name || typeof n !== 'object') return name;
    return name + (n.up ? '↗' : '') + (n.rung ? '~' : '');
  });
}
