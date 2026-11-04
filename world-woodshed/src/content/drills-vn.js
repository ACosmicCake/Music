/* World Woodshed — style drills for Nam Bộ (vọng cổ guitar, guitar phím lõm), in Vietnamese like the style page.
   Written for dây Lai tuning (`daylai` in src/engine.js: A D G D A D low to high) in the dây Đào key, hò = D4
   (MIDI 62: string 1 open, string 2 fret 5, string 3 fret 12). The drill page offers to switch the app to dây
   Lai (d.tuning), writes the ký âm under the notes (d.ho, d.hoi: src/kyam.js) and the tab under the staff
   (d.tab; each variation's own [string, fret] list in v.tab, string 1 the highest).
   Phrases use the short form of drills-a.js ('midi:dur', '.' after the duration for a dot, 'b' or '#' after
   the pitch to spell it, 'r' for a rest, '|' between bars), plus '^' after the pitch for a pressed note (nhấn),
   each '^' half a semitone higher (n.up), and '~' for a shaken one (rung, n.rung). The staff shows the fret's
   pitch; Hear the phrase plays the pressed pitch. These phrases are exercises in the style, written for this
   app, not transcriptions of bài bản or of the vọng cổ melody. */

const P = s => s.trim().split('|').map(bar => bar.trim().split(/\s+/).map(tok => {
  const [m0, d0] = tok.split(':');
  const dot = d0.endsWith('.');
  const mm = /^(r|\d+)([b#])?(\^*)(~?)$/.exec(m0);
  if (!mm) throw new Error('drills-vn: bad note ' + tok);
  const n = { m: mm[1] === 'r' ? null : Number(mm[1]), d: dot ? d0.slice(0, -1) : d0 };
  if (dot) n.dot = true;
  if (mm[2]) n.sp = mm[2];
  if (mm[3]) n.up = mm[3].length / 2;
  if (mm[4]) n.rung = true;
  return n;
}));
// tab: '1:0 1:3 2:5' → [[1, 0], [1, 3], [2, 5]], one [string, fret] per struck note
const T = s => s.trim().split(/\s+/).map(x => x.split(':').map(Number));

const BASE = { style: 'vietnam', tuning: 'daylai', ho: 62, tab: true };
const DRONE = { groove: 'songlang', bars: ['Dsus4'] };

export default [
  {
    ...BASE, hoi: 'bac',
    id: 'vietnam-day-lai',
    name: 'Lên dây Lai và tên nốt',
    focus: 'ear',
    level: 1,
    minutes: 8,
    goal: 'Lên dây Lai, rồi đờn và đọc to năm chữ hò xự xang xê cống (và liu) trên dây 1, dây Đào, hò là Rê.',
    why: 'Mọi bài bản đều học bằng chữ đờn. Khi tay đặt đúng phím mà miệng đọc đúng chữ, bạn bắt đầu nghe nhạc theo cách người đờn tài tử nghe: theo chỗ đứng của nốt so với hò, không theo tên Đô Rê Mi.',
    backing: DRONE,
    tempo: [50, 80],
    steps: [
      'Nếu app chưa ở dây Lai, bấm “Use Dây Lai” ở trên. Mở Reference tones và lên từng dây theo tiếng mẫu: dây 1 Rê, dây 2 La, dây 3 Rê, dây 4 Sol, dây 5 Rê, dây 6 La. Chỉ hạ dây xuống, đừng lên cao hơn cách lên dây cũ.',
      'Dây Đào: hò là Rê. Dây 1 buông là hò.',
      'Đờn chậm lên rồi xuống trên dây 1: phím 0, 2, 5, 7, 9, 12. Đọc to: hò, xự, xang, xê, cống, liu.',
      'Chạm dây nhẹ trong lòng phím lõm. Ấn sâu là phô (tiếng cao hơn): so với tiếng drone.',
      'Đây là hơi Bắc: đờn thẳng, không nhấn, không rung.'
    ],
    variations: [
      { name: 'Năm dây buông', how: 'Từ dây 5 lên dây 1: Rê, Sol, Rê, La, Rê. Ba dây Rê cách nhau từng quãng tám; dây 1 là hò.',
        bars: P('38:q 43:q 50:q 57:q | 62:w'), time: '4/4', key: 'C', tab: T('5:0 4:0 3:0 2:0 1:0'),
        names: '_ _ _ xề hò' },
      { name: 'Hò xự xang xê cống liu', how: 'Lên trên dây 1 và đọc to từng chữ.',
        bars: P('62:q 64:q 67:q 69:q | 71:q 74:q r:h'), time: '4/4', key: 'C', tab: T('1:0 1:2 1:5 1:7 1:9 1:12'),
        positions: [[1, 0], [1, 2], [1, 5], [1, 7], [1, 9], [1, 12]] },
      { name: 'Xuống lại hò', how: 'Liu cống xê xang xự hò. Nghe hò như chỗ về nhà.',
        bars: P('74:q 71:q 69:q 67:q | 64:q 62:h.'), time: '4/4', key: 'C', tab: T('1:12 1:9 1:7 1:5 1:2 1:0') },
      { name: 'Xề dưới hò', how: 'Dây 2 buông là La, xê ở dưới hò một quãng tám: chữ xề. Xề, hò, xự, hò.',
        bars: P('57:q 62:q 64:q 62:q | 57:h 62:h'), time: '4/4', key: 'C', tab: T('2:0 1:0 1:2 1:0 2:0 1:0') },
      { name: 'Đọc chữ không nhìn', how: 'Đờn rồi đọc: cống, xang, hò, xê… Cố đoán chữ trước khi nhìn tên dưới nốt.',
        bars: P('71:q 67:q 62:q 69:q | 64:q 69:q 67:h'), time: '4/4', key: 'C', tab: T('1:9 1:5 1:0 1:7 1:2 1:7 1:5') }
    ],
    listen: { artist: 'Văn Vĩ', work: 'ghi-ta phím lõm' }
  },
  {
    ...BASE, hoi: 'bac',
    id: 'vietnam-dan-thang',
    name: 'Đờn thẳng cho đúng nốt',
    focus: 'technique',
    level: 1,
    minutes: 6,
    goal: 'Đờn từng nốt dài, chạm dây vừa đủ, sao cho tiếng không bị phô so với drone, trên dây 1, 2 và 3.',
    why: 'Trên đờn phím lõm, ngón tay ấn sâu một chút là tiếng đã cao lên. Trước khi học nhấn, phải biết không nhấn: đặt ngón nhẹ, đúng nốt. Đây là gốc của hơi Bắc.',
    backing: DRONE,
    tempo: [50, 72],
    steps: [
      'Đặt ngón ngay sau phím (phía thân đờn), trong lòng chỗ khoét.',
      'Chạm dây vừa đủ cho tiếng kêu rõ. Nghe tiếng drone: nốt có “rè” không?',
      'Giữ mỗi nốt trọn hai phách. Không rung.',
      'Mở máy so dây (Reference tones) nếu muốn nhìn kim.',
      'Thử ấn sâu hơn một chút để nghe tiếng phô, rồi về lại chỗ đúng.'
    ],
    variations: [
      { name: 'Xang và xê', how: 'Dây 1 phím 5 (xang) và phím 7 (xê), mỗi nốt hai phách.',
        bars: P('67:h 69:h | 67:h 62:h'), time: '4/4', key: 'C', tab: T('1:5 1:7 1:5 1:0') },
      { name: 'Hò ở ba chỗ', how: 'Cùng một nốt hò: dây 1 buông, dây 2 phím 5, dây 3 phím 12. Ba tiếng phải bằng nhau.',
        bars: P('62:h 62:h | 62:w'), time: '4/4', key: 'C', tab: T('1:0 2:5 3:12') },
      { name: 'Trên dây 2', how: 'Xề, hò, xự trên dây 2 (phím 0, 5, 7): dây 2 là dây nhấn nhiều nhất, nên tập đờn thẳng trên nó trước.',
        bars: P('57:h 62:h | 64:h 62:h'), time: '4/4', key: 'C', tab: T('2:0 2:5 2:7 2:5') },
      { name: 'Câu ngắn hơi Bắc', how: 'Hò xự xang xê, xang xự hò: đờn thẳng, mỗi nốt rõ và đều.',
        bars: P('62:q 64:q 67:q 69:q | 67:q 64:q 62:h'), time: '4/4', key: 'C', tab: T('1:0 1:2 1:5 1:7 1:5 1:2 1:0') }
    ],
    listen: { artist: 'Vĩnh Bảo', work: 'nhạc tài tử hơi Bắc' }
  },
  {
    ...BASE, hoi: 'nam',
    id: 'vietnam-nhan',
    name: 'Nhấn trên phím lõm',
    focus: 'technique',
    level: 1,
    minutes: 8,
    goal: 'Nhấn một nốt lên lưng chừng, lên nửa cung và lên một cung cho đúng cao độ, giữ, rồi nhả về chậm như lúc lên.',
    why: 'Hơi Nam và hơi Oán cần những nốt nằm giữa hai phím: xự cao hơn Fa mà thấp hơn Fa thăng, cống từ Si giáng nhấn lên. Phím đờn không có những nốt đó; ngón tay phải tìm ra nó. Nhấn đúng chỗ quan trọng hơn nhấn mạnh.',
    backing: DRONE,
    tempo: [44, 66],
    steps: [
      'Đặt ngón ở dây 1 phím 3 (Fa). Đờn thẳng một phách.',
      'Ấn ngón thẳng xuống lòng phím lõm, chậm, cho tiếng cao dần. Dừng ở lưng chừng giữa Fa và Fa thăng: đó là xự của hơi Nam.',
      'Giữ, rồi nhả ra chậm như lúc ấn. Bấm ▶ Hear the phrase để nghe nốt đích.',
      'Tập cống: dây 1 phím 8 (Si giáng), nhấn lên rồi nhả.',
      'Dây nhỏ (dây 1, dây 2 cỡ 0.008) nhấn dễ hơn nhiều. Nếu thấy cứng quá, đổi dây nhỏ hơn.'
    ],
    variations: [
      { name: 'Nhấn nửa cung', how: 'Fa, rồi nhấn lên Fa thăng mà không đổi phím. Nốt thứ hai là tiếng nhấn, không phải phím mới.',
        bars: P('65:h 65^^:h | 65^^:h 65:h'), time: '4/4', key: 'C', tab: T('1:3 1:3 1:3 1:3'),
        positions: [[1, 3]] },
      { name: 'Xự lưng chừng', how: 'Hò, rồi xự: Fa nhấn lên một phần tư cung, giữ, về hò.',
        bars: P('62:q 65^:h. | 65^:q 62:h.'), time: '4/4', key: 'C', tab: T('1:0 1:3 1:3 1:0') },
      { name: 'Cống: nhấn rồi nhả', how: 'Xê, cống (Si giáng nhấn lên), nhả về Si giáng, rồi xê.',
        bars: P('69:q 70b^:q 70b:q 69:q | 69:w'), time: '4/4', key: 'C', tab: T('1:7 1:8 1:8 1:7 1:7'),
        positions: [[1, 8]] },
      { name: 'Nhấn một cung', how: 'Xang (Sol) nhấn lên tới La, tiếng bằng phím 7. So với xê đờn thẳng.',
        bars: P('67:h 67^^^^:h | 69:h 67:h'), time: '4/4', key: 'C', tab: T('1:5 1:5 1:7 1:5') },
      { name: 'Trên dây 2', how: 'Dây 2 phím 8 là Fa: nhấn xự ở đây. Dây 2 là dây nhấn nhiều nhất trong vọng cổ.',
        bars: P('62:q 65^:h. | 65^:q 62:h.'), time: '4/4', key: 'C', tab: T('2:5 2:8 2:8 2:5') }
    ],
    listen: { artist: 'Văn Vĩ', work: 'vọng cổ ghi-ta phím lõm' }
  },
  {
    ...BASE, hoi: 'nam',
    id: 'vietnam-rung',
    name: 'Rung: rộng và chậm',
    focus: 'technique',
    level: 1,
    minutes: 6,
    goal: 'Đờn một nốt thẳng nửa phách, rồi rung rộng và đều, cho rung lớn dần rồi nhỏ lại khi nốt tắt, ở xang và oan.',
    why: 'Rung của ghi-ta phím lõm rộng và chậm hơn rung ghi-ta rock, và thường vào trễ. Chọn nốt nào rung, nốt nào để thẳng là cách năm chữ đờn trở thành Xuân, Ai hay Oán.',
    backing: DRONE,
    tempo: [44, 66],
    steps: [
      'Dây 1 phím 5: xang (Sol). Đờn thẳng nửa phách.',
      'Rồi ấn xuống và nới ra nhịp nhàng, ba bốn lần một giây. Rung bằng cả cổ tay, không chỉ đầu ngón.',
      'Giữ đều: mỗi lần rung rộng bằng nhau, nhanh bằng nhau.',
      'Cho rung lớn dần, rồi nhỏ lại khi nốt tắt.',
      'Rồi tập ở oan: dây 1 phím 10 (Đô).'
    ],
    variations: [
      { name: 'Xang rung', how: 'Một nốt xang trọn ô nhịp: thẳng, rồi rung từ phách 2.',
        bars: P('67~:w'), time: '4/4', key: 'C', tab: T('1:5'), positions: [[1, 5]] },
      { name: 'Oan rung', how: 'Xê, rồi oan (Đô) rung dài. Đây là màu của hơi Oán.',
        bars: P('69:q 72~:h. | 69:q 67~:h.'), time: '4/4', key: 'C', tab: T('1:7 1:10 1:7 1:5'), positions: [[1, 10]] },
      { name: 'Nhấn rồi rung', how: 'Xự: nhấn lên lưng chừng, giữ, rồi rung ở cao độ đã nhấn.',
        bars: P('62:q 65^~:h. | 62:w'), time: '4/4', key: 'C', tab: T('1:0 1:3 1:0') },
      { name: 'Ba kiểu rung', how: 'Cùng nốt xang ba lần: rung nhẹ (Xuân), rung vừa, rung mạnh (Ai, Oán). Nghe tâm trạng đổi.',
        bars: P('67~:h 67~:h | 67~:w'), time: '4/4', key: 'C', tab: T('1:5 1:5 1:5') }
    ],
    listen: { artist: 'Kim Sinh', work: 'ghi-ta phím lõm' }
  },
  {
    ...BASE, hoi: 'nam',
    id: 'vietnam-luyen',
    name: 'Luyến, vuốt và láy',
    focus: 'technique',
    level: 2,
    minutes: 8,
    goal: 'Nối hai, ba nốt liền nhau bằng một lần gảy: vuốt (trượt ngón), búng (pull-off), ấn (hammer-on), và láy quanh một nốt.',
    why: 'Giọng ca không bao giờ nhảy từ nốt này sang nốt kia như phím đàn piano: nó trượt, nó vòng. Ghi-ta phím lõm bắt chước giọng ca bằng cách luyến. Một câu đờn có luyến nghe như đang hát.',
    backing: DRONE,
    tempo: [50, 76],
    steps: [
      'Vuốt: gảy xang (dây 1 phím 5), giữ ngón ấn, trượt lên phím 7 (xê) mà không gảy lại.',
      'Búng (pull-off): gảy xê, rồi kéo ngón ra cho xang kêu (ngón khác đã đặt sẵn ở phím 5).',
      'Ấn (hammer-on): gảy hò buông, rồi dập ngón xuống phím 3 cho xự kêu.',
      'Láy: đờn nhanh xê–cống–xê rồi giữ xê.',
      'Mỗi nhóm nốt nối với nhau chỉ gảy một lần ở nốt đầu.'
    ],
    variations: [
      { name: 'Vuốt xang lên xê', how: 'Gảy xang, trượt lên xê, giữ. Rồi trượt về.',
        bars: P('67:q 69:h. | 69:q 67:h.'), time: '4/4', key: 'C', tab: T('1:5 1:7 1:7 1:5') },
      { name: 'Ấn hò lên xự', how: 'Hò buông, dập ngón vào phím 3 cho xự, nhấn nhẹ lên.',
        bars: P('62:8 65^:8 65^:h. | 62:w'), time: '4/4', key: 'C', tab: T('1:0 1:3 1:3 1:0') },
      { name: 'Láy quanh xê', how: 'Xê, cống, xê nhanh như một nốt hoa, rồi xê dài.',
        bars: P('69:8 70b:8 69:8 r:8 69:h | 67~:w'), time: '4/4', key: 'C', tab: T('1:7 1:8 1:7 1:7 1:5') },
      { name: 'Một câu có luyến', how: 'Xang vuốt lên xê, láy xê, búng về xang, ấn hò lên xự, về hò.',
        bars: P('67:8 69:8 69:q 70b:8 69:8 67:q | 62:8 65^:8 65^:q 62:h'), time: '4/4', key: 'C', tab: T('1:5 1:7 1:7 1:8 1:7 1:5 1:0 1:3 1:3 1:0') }
    ],
    listen: { artist: 'Văn Vĩ', work: 'rao ghi-ta phím lõm' }
  },
  {
    ...BASE,
    id: 'vietnam-song-lang',
    name: 'Dứt câu trên song lang',
    focus: 'rhythm',
    level: 1,
    minutes: 6,
    goal: 'Đếm theo song lang và đờn những câu ngắn sao cho nốt cuối rơi đúng tiếng song lang ở phách 4.',
    why: 'Trong nhạc tài tử, nhịp mạnh nằm ở cuối nhóm: câu nhạc đi tới tiếng song lang rồi nghỉ ở đó. Người học nhạc Tây quen nghe phách 1 là mạnh, nên câu hay dứt sai chỗ. Tập dứt trên song lang là tập cái hồn nhịp của vọng cổ.',
    backing: { rhythm: 'songlang' },
    tempo: [44, 72],
    hoi: 'bac',
    steps: [
      'Nghe song lang vài vòng. Đếm “một, hai, ba, CẮC”.',
      'Gõ chân vào chữ CẮC.',
      'Đờn mỗi câu sao cho nốt cuối kêu cùng lúc với song lang.',
      'Sau nốt cuối là nghỉ: phách 1 là hơi thở, không phải chỗ bắt đầu mạnh.',
      'Khi đã quen, thử biến thể “Nhịp chậm gấp đôi” của nhịp Song lang trong Rhythm atlas.'
    ],
    variations: [
      { name: 'Chỉ nốt cuối', how: 'Im ba phách, đờn hò đúng tiếng song lang.',
        bars: P('r:q r:q r:q 62:q | r:q r:q r:q 62:q'), time: '4/4', key: 'C', tab: T('1:0 1:0') },
      { name: 'Ba nốt tới song lang', how: 'Xê xang xự… hò! Nốt hò là đích, ba nốt trước là đường đi.',
        bars: P('69:q 67:q 64:q 62:q | 69:q 67:q 64:q 62:q'), time: '4/4', key: 'C', tab: T('1:7 1:5 1:2 1:0 1:7 1:5 1:2 1:0') },
      { name: 'Câu hai nhịp', how: 'Một câu dài tám phách, chỉ dứt ở tiếng song lang thứ hai. Tiếng song lang đầu là chỗ ghé, không dừng.',
        bars: P('62:q 64:q 67:q 69:q | 71:q 69:q 67:8 64:8 62:q'), time: '4/4', key: 'C', tab: T('1:0 1:2 1:5 1:7 1:9 1:7 1:5 1:2 1:0') },
      { name: 'Ngân trước khi dứt', how: 'Xê ngân dài hai phách rưỡi, rồi xang, hò dứt đúng song lang.',
        bars: P('69:h. 67:q | 69:h 67:8 64:8 62:q'), time: '4/4', key: 'C', tab: T('1:7 1:5 1:7 1:5 1:2 1:0') }
    ],
    listen: { artist: 'Út Trà Ôn', work: 'vọng cổ' }
  },
  {
    ...BASE, hoi: 'bac',
    id: 'vietnam-hoi-bac',
    name: 'Hơi Bắc: đờn thẳng, vui tươi',
    focus: 'melody',
    level: 2,
    minutes: 8,
    goal: 'Đờn những câu ngắn hơi Bắc trên hò xự xang xê cống: nốt thẳng, gọn, sáng, dứt ở hò hoặc xê trên tiếng song lang.',
    why: 'Hơi Bắc là hơi vui tươi của nhạc tài tử, gần như không nhấn không rung. Tập nó trước giúp tay quen đường đi của năm chữ đờn; sau đó mới thêm nhấn rung để thành hơi Nam, hơi Oán.',
    backing: DRONE,
    tempo: [56, 90],
    steps: [
      'Đọc chữ đờn dưới mỗi nốt trước khi đờn.',
      'Đờn thẳng, gọn, đều, không rung.',
      'Câu dứt ở hò (về nhà) hoặc xê (lửng lơ, chờ câu sau).',
      'Lặp lại mỗi câu nhiều vòng, rồi tự đổi một hai nốt ở giữa, giữ nguyên nốt dứt.',
      'Đây là câu tập viết cho app theo hơi Bắc, không phải trích bài bản. Bài bản thật học với thầy hoặc theo bản ký âm.'
    ],
    variations: [
      { name: 'Đi lên, về hò', how: 'Hò xự xang xê cống, xê xang xự hò.',
        bars: P('62:q 64:q 67:q 69:q | 71:q 69:8 67:8 64:q 62:q'), time: '4/4', key: 'C', tab: T('1:0 1:2 1:5 1:7 1:9 1:7 1:5 1:2 1:0') },
      { name: 'Dứt xê', how: 'Câu dứt ở xê: nghe như còn chờ câu tiếp.',
        bars: P('74:q 71:q 69:q 67:q | 64:q 67:8 64:8 62:8 64:8 69:q'), time: '4/4', key: 'C', tab: T('1:12 1:9 1:7 1:5 1:2 1:5 1:2 1:0 1:2 1:7') },
      { name: 'Hỏi và đáp', how: 'Câu đầu dứt xê (hỏi), câu sau dứt hò (đáp).',
        bars: P('67:q 69:q 71:q 69:q | 67:q 64:8 67:8 69:h | 71:q 69:q 67:q 64:q | 67:8 64:8 62:8 64:8 62:h'), time: '4/4', key: 'C',
        tab: T('1:5 1:7 1:9 1:7 1:5 1:2 1:5 1:7 1:9 1:7 1:5 1:2 1:5 1:2 1:0 1:2 1:0') },
      { name: 'Lên liu', how: 'Câu đi lên tới liu (hò cao) rồi về hò.',
        bars: P('69:8 71:8 74:q 71:8 69:8 67:q | 69:q 67:8 64:8 62:h'), time: '4/4', key: 'C', tab: T('1:7 1:9 1:12 1:9 1:7 1:5 1:7 1:5 1:2 1:0') }
    ],
    listen: { artist: 'Vĩnh Bảo', work: 'Lưu thủy trường' }
  },
  {
    ...BASE, hoi: 'nam',
    id: 'vietnam-xuan-ai',
    name: 'Hơi Xuân và hơi Ai: cùng câu, khác lòng',
    focus: 'ear',
    level: 2,
    minutes: 10,
    goal: 'Đờn một câu trên hò xự xang xê cống của hơi Nam, lần đầu nhấn rung nhẹ (Xuân, man mác), lần sau nhấn rung mạnh và chậm hơn (Ai, tỉ tê), và nghe tâm trạng đổi.',
    why: 'Hơi Xuân và hơi Ai dùng cùng một thang âm. Theo các nhà nghiên cứu, hơi Xuân chỉ nhấn và rung nhẹ ở xự, xang, xê; hơi Ai nhấn và rung mạnh ở xự, xang. Một câu đờn, hai cách nhấn: đây là bài học quan trọng nhất của nhạc tài tử.',
    backing: DRONE,
    tempo: [44, 70],
    steps: [
      'Đờn câu 1 với nhấn rung nhẹ, tiếng đều, nhịp ung dung: hơi Xuân.',
      'Đờn lại câu đó chậm hơn, nhấn xự sâu hơn, rung xang mạnh và dài: hơi Ai.',
      'Câu 3 và 4 là một câu mới; làm lại như vậy.',
      'Thu âm hai lần đờn bằng điện thoại và nghe lại: bạn có nghe ra hai tâm trạng?',
      'Những dấu ↗ (nhấn) và ~ (rung) dưới nốt là gợi ý, không phải luật.'
    ],
    variations: [
      { name: 'Xuân: nhấn nhẹ', how: 'Hò xự xang xê, xang xự hò. Nhấn xự vừa đủ, rung xang nhẹ.',
        bars: P('62:q 65^:q 67~:q 69:q | 67~:q 65^:q 62:h'), time: '4/4', key: 'C', tab: T('1:0 1:3 1:5 1:7 1:5 1:3 1:0') },
      { name: 'Ai: nhấn sâu, rung mạnh', how: 'Cùng câu, chậm hơn: nhấn xự sâu, rung xang dài và mạnh.',
        bars: P('62:q 65^:q 67~:h | 65^:q 67~:q 62:h'), time: '4/4', key: 'C', tab: T('1:0 1:3 1:5 1:3 1:5 1:0') },
      { name: 'Câu dứt xang', how: 'Xê cống xê xang… dứt ở xang rung: lửng lơ, nhớ nhung.',
        bars: P('69:q 70b^:q 69:q 67~:q | 65^:q 62:q 67~:h'), time: '4/4', key: 'C', tab: T('1:7 1:8 1:7 1:5 1:3 1:0 1:5') },
      { name: 'Xề và hò', how: 'Câu xuống thấp, qua xề rồi về hò: ở hơi Ai, nhấn rung đậm hơn ở lần sau.',
        bars: P('67~:q 65^:q 62:q 57:q | 62:q 65^:8 62:8 62:h'), time: '4/4', key: 'C', tab: T('1:5 1:3 1:0 2:0 1:0 1:3 1:0 1:0') }
    ],
    listen: { artist: 'Văn Vĩ', work: 'Nam ai ghi-ta phím lõm' }
  },
  {
    ...BASE, hoi: 'nam',
    id: 'vietnam-hoi-oan',
    name: 'Hơi Oán và chữ oan',
    focus: 'melody',
    level: 3,
    minutes: 10,
    goal: 'Đờn những câu có chữ oan (Đô, dây 1 phím 10) nhấn và rung mạnh, xự nhấn, cống nhấn, trên nền drone, để nghe màu buồn sâu xa của hơi Oán.',
    why: 'Hơi Oán là hơi buồn nhất mà cũng hùng nhất của nhạc tài tử, và vọng cổ gần với nó. Chữ oan, nhấn và rung mạnh, là dấu hiệu của hơi Oán. Học được hơi Oán là đã gần vọng cổ.',
    backing: DRONE,
    tempo: [40, 64],
    steps: [
      'Tìm chữ oan: dây 1 phím 10 (Đô). Đờn thẳng, rồi rung mạnh.',
      'Ôn lại xự (phím 3 nhấn lưng chừng) và cống (phím 8 nhấn lên).',
      'Đờn các câu thật chậm. Cho mỗi nốt nhấn hay rung trọn thời gian của nó.',
      'Nghe một bản Tứ đại oán hay vọng cổ: tìm chỗ chữ oan rung.',
      'Có thầy gọi chữ này là “phan” trong hơi Nam và “oan” trong hơi Oán: nếu gặp chữ khác, đó là cách gọi, không phải nốt khác.'
    ],
    variations: [
      { name: 'Xê lên oan', how: 'Xê, oan rung dài, rồi về xê.',
        bars: P('69:q 72~:h. | 72~:q 69:h.'), time: '4/4', key: 'C', tab: T('1:7 1:10 1:10 1:7'), positions: [[1, 7], [1, 10]] },
      { name: 'Cống và oan', how: 'Xê, cống nhấn, oan rung, cống nhấn, xê.',
        bars: P('69:q 70b^:q 72~:h | 70b^:q 69:h.'), time: '4/4', key: 'C', tab: T('1:7 1:8 1:10 1:8 1:7') },
      { name: 'Từ oan về hò', how: 'Oan, xê, xang rung, xự nhấn, hò: một đường đi xuống của hơi Oán.',
        bars: P('72~:h 69:q 67~:q | 65^:q 65^:8 62:8 62:h'), time: '4/4', key: 'C', tab: T('1:10 1:7 1:5 1:3 1:3 1:0 1:0') },
      { name: 'Câu dài hai nhịp', how: 'Hò lên liu qua oan, rồi về hò. Dứt trên song lang.',
        bars: P('62:q 65^:q 67~:q 69:q | 72~:h 74:q 72:q | 69:q 70b^:q 69:q 67~:q | 65^:q 67:8 65^:8 62:h'), time: '4/4', key: 'C',
        tab: T('1:0 1:3 1:5 1:7 1:10 1:12 1:10 1:7 1:8 1:7 1:5 1:3 1:5 1:3 1:0') }
    ],
    listen: { artist: 'Various artists', work: 'Tứ đại oán' }
  },
  {
    ...BASE, hoi: 'nam',
    id: 'vietnam-rao',
    name: 'Rao: dạo vào hơi',
    focus: 'ear',
    level: 3,
    minutes: 8,
    goal: 'Dạo vài câu tự do, không nhịp, bằng hò xự xang xê cống oan với nhấn rung, sao cho người nghe biết ngay là hơi Nam hay hơi Oán.',
    why: 'Trước khi vào bài, người đờn rao: dạo tự do để cho người ca và người nghe vào hơi. Rao là chỗ thấy tay nghề, vì không có nhịp che: chỉ còn tiếng đờn và cách nhấn rung.',
    backing: { groove: 'drone', bars: ['Dsus4'] },
    tempo: [40, 60],
    steps: [
      'Không cần theo nhịp. Các câu dưới đây chỉ là gợi ý đường đi; giữ nốt lâu hay mau tùy ý.',
      'Bắt đầu ở hò hoặc xê, đi lên oan, rồi về.',
      'Cho mỗi nốt dài một cách nhấn hay rung riêng.',
      'Nghỉ giữa các câu như lấy hơi.',
      'Dứt rao ở hò, ngân dài: chỗ người ca sẽ vào.'
    ],
    variations: [
      { name: 'Mở hơi', how: 'Hò, xự nhấn, xang rung dài. Nghỉ.',
        bars: P('62:q 65^:q 67~:h | r:w'), time: '4/4', key: 'C', tab: T('1:0 1:3 1:5') },
      { name: 'Lên cao', how: 'Xê, oan rung, liu, oan, xê.',
        bars: P('69:q 72~:h 74:q | 72:q 69:h.'), time: '4/4', key: 'C', tab: T('1:7 1:10 1:12 1:10 1:7') },
      { name: 'Xuống xề', how: 'Xang, xự, hò, xề (dây 2 buông), về hò.',
        bars: P('67~:q 65^:q 62:q 57:q | 62:w'), time: '4/4', key: 'C', tab: T('1:5 1:3 1:0 2:0 1:0') },
      { name: 'Ráp lại', how: 'Ba câu trên nối nhau, rồi tự đổi đường đi, giữ chỗ dứt ở hò.',
        bars: P('62:q 65^:q 67~:h | 69:q 72~:h 74:q | 72:q 69:q 67~:q 65^:q | 62:w'), time: '4/4', key: 'C',
        tab: T('1:0 1:3 1:5 1:7 1:10 1:12 1:10 1:7 1:5 1:3 1:0') }
    ],
    listen: { artist: 'Văn Vĩ', work: 'rao vọng cổ' }
  },
  {
    ...BASE, hoi: 'nam',
    id: 'vietnam-vong-co-chu-dut',
    name: 'Sáu câu vọng cổ: chữ dứt',
    focus: 'ear',
    level: 3,
    minutes: 12,
    goal: 'Thuộc chữ đờn dứt của sáu câu vọng cổ nhịp 32 (cống, xang, hò, hò, xê, hò) và đờn một câu ngắn dứt đúng mỗi chữ trên tiếng song lang.',
    why: 'Mỗi câu vọng cổ là một chặng đường dài 32 nhịp, kết thúc ở một chữ đờn mà người ca và người đờn cùng biết trước. Thuộc sáu chữ dứt là có bản đồ của cả bài: nghe một bản vọng cổ, bạn biết mình đang ở câu nào.',
    backing: DRONE,
    tempo: [44, 66],
    steps: [
      'Đọc thuộc: câu 1 cống, câu 2 xang, câu 3 hò, câu 4 hò, câu 5 xê, câu 6 hò. Chữ xự không dùng để dứt câu.',
      'Mỗi biến thể dưới đây là một câu ngắn (2 ô nhịp) đi tới chữ dứt của một câu vọng cổ, dứt trên song lang. Câu thật dài 32 nhịp; đây chỉ là đoạn cuối, viết để tập.',
      'Đờn đủ sáu câu theo thứ tự, như đi hết bài.',
      'Nghe một bản vọng cổ (Út Trà Ôn, Út Bạch Lan, Minh Cảnh…): đếm câu và đoán chữ dứt.',
      'Có tài liệu ghi câu 5 dứt hò thay vì xê. Hỏi thầy, hoặc nghe nhiều bản, rồi ghi lại điều bạn nghe.'
    ],
    variations: [
      { name: 'Câu 1: dứt cống', how: 'Đi lên xê rồi dứt ở cống nhấn.',
        bars: P('62:q 65^:q 67~:q 69:q | 72~:q 69:q 69:q 70b^:q'), time: '4/4', key: 'C', tab: T('1:0 1:3 1:5 1:7 1:10 1:7 1:7 1:8') },
      { name: 'Câu 2: dứt xang', how: 'Từ cống đi xuống, dứt ở xang rung.',
        bars: P('70b^:q 69:q 72~:q 69:q | 65^:q 62:q 65^:q 67~:q'), time: '4/4', key: 'C', tab: T('1:8 1:7 1:10 1:7 1:3 1:0 1:3 1:5') },
      { name: 'Câu 3: dứt hò', how: 'Xang xê, xang xự, hò.',
        bars: P('67~:q 69:q 67~:q 65^:q | 67:q 65^:q 65^:8 62:8 62:q'), time: '4/4', key: 'C', tab: T('1:5 1:7 1:5 1:3 1:5 1:3 1:3 1:0 1:0') },
      { name: 'Câu 4: dứt hò', how: 'Lên liu rồi về hò.',
        bars: P('69:q 72~:q 74:q 72:q | 69:q 67~:q 65^:q 62:q'), time: '4/4', key: 'C', tab: T('1:7 1:10 1:12 1:10 1:7 1:5 1:3 1:0') },
      { name: 'Câu 5: dứt xê', how: 'Từ hò đi lên, dứt ở xê: chưa về nhà, chờ câu cuối.',
        bars: P('62:q 57:q 62:q 65^:q | 67~:q 65^:q 67:q 69:q'), time: '4/4', key: 'C', tab: T('1:0 2:0 1:0 1:3 1:5 1:3 1:5 1:7') },
      { name: 'Câu 6: dứt hò', how: 'Câu cuối về hò, ngân dài: hết bài.',
        bars: P('69:q 67~:q 65^:q 67~:q | 65^:8 62:8 57:q 62:h'), time: '4/4', key: 'C', tab: T('1:7 1:5 1:3 1:5 1:3 1:0 2:0 1:0') }
    ],
    listen: { artist: 'Út Trà Ôn', work: 'vọng cổ sáu câu' }
  },
  {
    ...BASE, hoi: 'nam',
    id: 'vietnam-dan-lot',
    name: 'Đờn lót: trả lời người ca',
    focus: 'melody',
    level: 3,
    minutes: 10,
    goal: 'Hát (hay ngâm nga) một câu ngắn hai ô nhịp, rồi đờn một câu trả lời hai ô nhịp trên ghi-ta, dứt cùng chữ với người ca, trên tiếng song lang.',
    why: 'Trong cải lương, ghi-ta theo sát người ca: khi người ca ngưng, ghi-ta đờn lót vào chỗ trống, nhắc lại chữ đờn chính và đưa câu tới chỗ dứt. Đây là việc chính của người đờn ghi-ta trong ban cổ nhạc.',
    backing: DRONE,
    tempo: [44, 66],
    steps: [
      'Ô nhịp 1–2 của mỗi biến thể là câu ca: hát bằng “a” hoặc ngâm nga theo.',
      'Ô nhịp 3–4 là câu đờn lót: trả lời, dứt cùng chữ.',
      'Khi đã quen, đổi câu đờn lót theo ý mình, nhưng giữ chữ dứt.',
      'Bật một bản vọng cổ chỉ có giọng ca (hoặc ca chậm), tập đờn lót vào chỗ người ca nghỉ.',
      'Đờn lót không lấn giọng ca: nhỏ tiếng hơn, ít nốt hơn.'
    ],
    variations: [
      { name: 'Dứt hò', how: 'Câu ca dứt hò; ghi-ta trả lời bằng xang, xự nhấn, hò.',
        bars: P('69:q 67:q 65:q 62:q | 62:h r:h | r:q 67~:q 65^:q 62:q | 62:h r:h'), time: '4/4', key: 'C',
        tab: T('1:7 1:5 1:3 1:0 1:0 1:5 1:3 1:0 1:0') },
      { name: 'Dứt xang', how: 'Câu ca dứt xang; ghi-ta trả lời bằng xê, oan rung, xê, xang.',
        bars: P('62:q 65:q 67:h | 67:h r:h | r:q 69:q 72~:q 69:q | 67~:h r:h'), time: '4/4', key: 'C',
        tab: T('1:0 1:3 1:5 1:5 1:7 1:10 1:7 1:5') },
      { name: 'Dứt xê', how: 'Câu ca dứt xê; ghi-ta láy quanh xê rồi giữ.',
        bars: P('67:q 69:q 72:q 69:q | 69:h r:h | r:q 69:8 70b:8 69:q 67~:q | 69:h r:h'), time: '4/4', key: 'C',
        tab: T('1:5 1:7 1:10 1:7 1:7 1:7 1:8 1:7 1:5 1:7') }
    ],
    listen: { artist: 'Minh Cảnh', work: 'vọng cổ' }
  }
];
