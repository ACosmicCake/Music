/* World Woodshed — Nam Bộ: đờn ca tài tử, cải lương and the vọng cổ guitar (guitar phím lõm).
   A whole style, written in Vietnamese at Pan's request (the rest of the app stays in English).
   Its essay is in essays-9.js, its drills in drills-vn.js (on dây Lai tuning, `daylai` in src/engine.js),
   the song lang rhythm in rhythms-new.js and its lessons at the end of lessons.js ("World traditions").
   Facts come from Vietnamese sources (Nguyễn Tấn Nhì on the 20 bài tổ; Đỗ Quốc Dũng, Tạp chí Khoa học
   Đại học Văn Hiến 2019, on vọng cổ nhịp 32; Bùi Trọng Hiền, Viện Âm nhạc, on điệu and hơi; guitar
   teachers on dây Lai). Where sources disagree the text says so. */
export default {
  vietnam: {
    id: 'vietnam', name: 'Nam Bộ: vọng cổ, cải lương & đờn ca tài tử',
    places: 'Sài Gòn · Bạc Liêu · Mỹ Tho · Vĩnh Long · Cần Đước · đồng bằng sông Cửu Long',
    summary: 'Đờn ca tài tử là nhạc thính phòng của người tài tử miền Nam: vài cây đờn và một giọng ca ngồi chơi với nhau, theo những bài bản có sẵn mà không lần nào giống lần nào. Từ đó sinh ra sân khấu cải lương và bài vọng cổ, trái tim của cải lương. Cây đờn ghi-ta phím lõm, khoét lõm giữa các phím để nhấn và rung như đờn kìm, đờn tranh, đã thành tiếng đờn dẫn của cả hai.',
    concepts: [
      'Hò xự xang xê cống: tên năm nốt, nói vị trí so với nốt chủ hò chứ không phải cao độ cố định',
      'Hơi và điệu: Bắc vui, Nam (Xuân, Ai) buồn man mác hay tỉ tê, Oán buồn sâu xa, Lễ trang nghiêm; khác nhau ở chỗ nhấn, chỗ rung và nốt dứt',
      'Nhấn, rung, luyến: một nốt là một cử chỉ, không phải một điểm',
      'Song lang: nhịp mạnh nằm ở cuối nhóm, câu nhạc đi tới đó rồi nghỉ',
      'Vọng cổ: 6 câu nhịp 32, mỗi câu có chữ đờn dứt riêng',
      'Bài bản: 20 bài tổ (6 Bắc, 3 Nam, 7 Lễ, 4 Oán) là khung, người đờn tô điểm',
      'Dây Lai: cách lên dây ghi-ta phím lõm, chơi được dây Đào (hò Rê) và dây Kép (hò Sol)'
    ],
    instruments: ['Ghi-ta phím lõm (lục huyền cầm)', 'Đờn kìm (nguyệt)', 'Đờn cò (nhị)', 'Đờn tranh', 'Đờn bầu (độc huyền)', 'Đờn tỳ bà', 'Đờn tam', 'Ống tiêu', 'Song lang', 'Violon và ghi-ta Hạ uy cầm trong ban cổ nhạc cải lương'],
    rhythms: ['songlang', 'bolero'], scales: ['hoibac', 'hoinam', 'majpent'],
    guitar: [
      'Lên dây Lai: từ dây 1 (cao nhất) xuống dây 6 là Rê La Rê Sol Rê La; dây 6 gần như không đờn',
      'Dùng phím gảy mỏng và dây 1, dây 2 nhỏ để nhấn cho dễ',
      'Nhấn: ấn ngón thẳng xuống lòng phím lõm để nốt cao lên, nhả từ từ cho nốt xuống',
      'Rung: đờn nốt thẳng một chút rồi mới rung, rung rộng và chậm',
      'Đếm theo song lang: câu nhạc dứt trên tiếng song lang, không bắt đầu ở đó',
      'Học bằng tai trước: nghe một câu vọng cổ nhiều lần rồi mới đờn theo'
    ],
    listen: ['Văn Vĩ', 'Kim Sinh', 'Út Trà Ôn', 'Thanh Nga', 'Út Bạch Lan', 'Lệ Thủy', 'Minh Vương', 'Minh Cảnh', 'Vĩnh Bảo', 'Trần Văn Khê'],
    facts: [
      { q: 'Ghi-ta phím lõm khác ghi-ta thường ở chỗ nào?', a: 'Gỗ giữa các phím được khoét lõm xuống', w: ['Có mười hai dây', 'Không có phím', 'Đặt nằm trên đùi để đờn'] },
      { q: 'Bài “Dạ cổ hoài lang”, gốc của vọng cổ, là của ai?', a: 'Cao Văn Lầu (Sáu Lầu)', w: ['Trịnh Công Sơn', 'Văn Vĩ', 'Viễn Châu'] },
      { q: 'Vọng cổ nhịp 32 ngày nay có mấy câu?', a: '6 câu', w: ['20 câu', '4 câu', '32 câu'] },
      { q: 'Trong một nhóm phách, tiếng song lang thường rơi vào…', a: 'Phách mạnh ở cuối nhóm', w: ['Phách đầu tiên', 'Mọi phách', 'Không cố định'] },
      { q: '20 bài tổ của đờn ca tài tử gồm…', a: '6 Bắc, 3 Nam, 7 Lễ, 4 Oán', w: ['5 Bắc, 5 Nam, 5 Lễ, 5 Oán', '10 Bắc, 10 Nam', '7 Bắc, 3 Nam, 6 Lễ, 4 Oán'] },
      { q: 'Đờn ca tài tử được UNESCO ghi danh năm nào?', a: '2013', w: ['1998', '2005', '2019'] },
      { q: 'Hơi Bắc được đờn thế nào?', a: 'Đờn thẳng, gần như không nhấn không rung, vui tươi', w: ['Nhấn và rung mạnh mọi nốt', 'Chỉ đờn nốt hò', 'Không có nhịp'] },
      { q: '“Dây Đào” và “dây Kép” khác nhau ở…', a: 'Nốt hò: Rê cho giọng nữ (đào), Sol cho giọng nam (kép)', w: ['Số dây trên đờn', 'Loại gỗ của đờn', 'Hơi Bắc và hơi Nam'] }
    ],
    era: 'cuối thế kỷ 19 – nay',
    history: [
      ['Cuối thế kỷ 19', 'Nhạc lễ và ca Huế theo các nhạc quan, nho sĩ từ miền Trung vào Nam. Tương truyền ông Nguyễn Quang Đại (Ba Đợi), nhạc quan triều Huế, vào Nam (có lẽ khoảng năm 1885) và lập nhóm ở Cần Đước (Long An): soạn lại bài Huế, đặt thêm bài, sắp xếp các hơi. Ở miền Tây có nhóm của ông Trần Quang Quờn (Kinh Lịch Quờn) ở Vĩnh Long.'],
      ['Khoảng 1900', 'Hệ thống bài bản tài tử thành hình, với 20 bài tổ: 6 Bắc, 3 Nam, 7 Lễ (bài Cò), 4 Oán. Người chơi gọi nhau là “tài tử”: chơi vì yêu nhạc, không phải nghề.'],
      ['1915–1918', 'Ca ra bộ: người ca vừa ca vừa diễn (bài Tứ đại oán “Bùi Kiệm – Nguyệt Nga”, Vĩnh Long, khoảng 1915). Ngày 15/3/1918, gánh thầy Năm Tú ở Mỹ Tho diễn “Kim Vân Kiều”, thường được coi là vở cải lương đầu tiên.'],
      ['1919', 'Cao Văn Lầu (1892–1976) ở Bạc Liêu viết “Dạ cổ hoài lang”, 20 câu nhịp 2. Bài được đờn ca khắp miền Nam và thành “vọng cổ”. (Có nguồn ghi khoảng 1917–1920.)'],
      ['1920s–1930s', 'Vọng cổ dài dần ra: nhịp 4 (Trịnh Thiên Tư), nhịp 8 (Năm Nghĩa, khoảng 1934), nhịp 16 (Mộng Vân, khoảng 1936–1939). Mỗi lần câu dài gấp đôi, có thêm chỗ cho lời và cho nhấn nhá. Ghi-ta được khoét phím lõm để nhấn như đờn kìm, đờn tranh.'],
      ['1940–1941', 'Năm Nhỏ (Trần Tấn Hưng) làm vọng cổ nhịp 32, rút từ 20 câu còn 6 câu. Ngày giỗ tổ cải lương 12/8 năm Tân Tỵ (1941) ông độc tấu bài 6 câu nhịp 32 trên ghi-ta phím lõm.'],
      ['1950s–1970s', 'Thời vàng son của cải lương: các đoàn lớn, đĩa hát, radio. Út Trà Ôn, Thanh Nga, Út Bạch Lan, Hữu Phước, Thành Được, Lệ Thủy, Minh Vương, Minh Cảnh. Soạn giả Viễn Châu viết những bài vọng cổ nổi tiếng và đi đầu lối tân cổ giao duyên (một đoạn tân nhạc, rồi vào vọng cổ). Ghi-ta phím lõm thành tiếng đờn dẫn của ban cổ nhạc.'],
      ['1975 – nay', 'Cải lương sống ở trong nước và ở hải ngoại. Vọng cổ nhịp 32 (thỉnh thoảng nhịp 16) vẫn là bài bắt buộc trong các liên hoan. Năm 2013 UNESCO ghi danh Nghệ thuật Đờn ca tài tử Nam Bộ là di sản văn hóa phi vật thể đại diện của nhân loại.']
    ],
    substyles: [
      { name: 'Đờn ca tài tử', text: 'Nhạc thính phòng của người tài tử: đờn kìm, đờn cò, đờn tranh, ghi-ta phím lõm, ống tiêu và một giọng ca. Ngồi trên bộ ván, trong nhà hay ngoài vườn, chơi bài bản và tô điểm theo ý mình.' },
      { name: 'Ca ra bộ', text: 'Bước giữa tài tử và sân khấu (khoảng 1915): người ca vừa ca bài bản vừa làm điệu bộ theo nhân vật.' },
      { name: 'Cải lương', text: 'Sân khấu “sửa đổi cho hay hơn” ra đời ở Mỹ Tho, Vĩnh Long, Sài Gòn cuối thập niên 1910: lời thoại xen bài ca, ban cổ nhạc ngồi bên cánh gà, vọng cổ là chỗ khán giả chờ nhất.' },
      { name: 'Vọng cổ', text: 'Từ “Dạ cổ hoài lang” (1919) lớn dần thành nhịp 4, 8, 16, 32. Ngày nay thường ca 6 câu nhịp 32, mỗi câu có chữ đờn dứt riêng; người ca có thể nói lối, ngâm thơ trước khi vào câu.' },
      { name: 'Tân cổ giao duyên', text: 'Một bài tân nhạc ghép với vài câu vọng cổ, phổ biến từ thập niên 1960: cầu nối giữa nhạc trẻ và cổ nhạc.' },
      { name: 'Ghi-ta phím lõm độc tấu', text: 'Rao và đờn bài bản một mình trên ghi-ta phím lõm, như Văn Vĩ; tiếng đờn nhấn rung thay cho giọng ca.' }
    ],
    traits: {
      rhythm: 'Nhịp chậm và co giãn, đếm theo nhóm, nhịp mạnh nằm ở cuối nhóm và được đánh dấu bằng song lang. Câu nhạc “xuống song lang” để dứt. Trước bài thường có đoạn rao, tự do không nhịp, để vào hơi.',
      harmony: 'Không có hợp âm theo kiểu phương Tây. Các cây đờn cùng đi một giai điệu, mỗi cây tô điểm một kiểu (phức điệu chi tiết). Ghi-ta đệm thì nhắc lại nốt chủ và các chữ đờn chính.',
      melody: 'Năm nốt hò xự xang xê cống, nhưng cao độ không cố định: hơi Bắc đờn thẳng, hơi Nam và Oán nhấn xự và cống lên lưng chừng, rung xang và oan. Câu nhạc theo dấu giọng của lời tiếng Việt.',
      form: 'Bài bản có số câu và chữ đờn dứt câu cố định; người đờn, người ca điền vào khung đó. Vọng cổ: 6 câu nhịp 32. Bài nhỏ (Lưu thủy, Kim tiền…) ngắn, hay dùng để tập.',
      sound: 'Ghi-ta phím lõm vang, mũi, như hát: nốt trượt lên, run, rồi tắt dần. Đờn kìm giòn và tròn, đờn cò réo rắt, đờn tranh lấp lánh, song lang khô và gọn.'
    },
    essential: [
      { artist: 'Various artists', work: 'Longing for the Past: The 78 rpm Era in Southeast Asia', year: 2013, kind: 'album', note: 'Có những đĩa 78 vòng cải lương và tài tử đời đầu: nghe tiếng đờn ca trước thời băng từ.' },
      { artist: 'Văn Vĩ', work: 'Độc tấu ghi-ta phím lõm', kind: 'recording', note: 'Nghe cách ông nhấn, rung và luyến: mẫu mực của ghi-ta vọng cổ.' },
      { artist: 'Út Trà Ôn', work: 'Tình anh bán chiếu', kind: 'song', note: 'Bài vọng cổ của soạn giả Viễn Châu, gắn với giọng ca Út Trà Ôn. Nghe sáu câu và chỗ dứt mỗi câu.' },
      { artist: 'Cao Văn Lầu', work: 'Dạ cổ hoài lang', kind: 'song', note: 'Bài gốc của vọng cổ, nhịp 2. Nghe một bản ca chậm rồi so với vọng cổ nhịp 32.' },
      { artist: 'Vĩnh Bảo', work: 'Đờn tranh, nhạc tài tử', kind: 'recording', note: 'Danh cầm đờn tranh của nhạc tài tử: nghe nhấn nhá trên đờn tranh, cái mà ghi-ta phím lõm bắt chước.' },
      { artist: 'Kim Sinh', work: 'Ghi-ta phím lõm', kind: 'recording', note: 'Một bậc thầy ghi-ta phím lõm khác: so tiếng đờn của ông với Văn Vĩ.' }
    ],
    players: [
      { name: 'Văn Vĩ', inst: 'ghi-ta phím lõm', why: 'Nghệ sĩ khiếm thị, bậc thầy ghi-ta phím lõm của cải lương: học nhấn, rung, luyến ở ông.' },
      { name: 'Kim Sinh', inst: 'ghi-ta phím lõm', why: 'Nghệ sĩ khiếm thị, đờn ghi-ta phím lõm và ghi-ta Hạ uy cầm, có lối đờn riêng.' },
      { name: 'Năm Nhỏ (Trần Tấn Hưng)', inst: 'ghi-ta phím lõm, nhạc sĩ', why: 'Người làm vọng cổ nhịp 32 sáu câu, độc tấu nó trên ghi-ta phím lõm năm 1941.' },
      { name: 'Cao Văn Lầu', inst: 'nhạc sĩ', why: 'Viết “Dạ cổ hoài lang”, mầm của vọng cổ.' },
      { name: 'Út Trà Ôn', inst: 'ca', why: 'Một trong những giọng vọng cổ được yêu mến nhất: nghe cách ông ngân và dứt câu.' },
      { name: 'Viễn Châu', inst: 'soạn giả, đờn tranh', why: 'Viết hàng ngàn bài vọng cổ, đi đầu tân cổ giao duyên.' },
      { name: 'Vĩnh Bảo', inst: 'đờn tranh', why: 'Danh cầm và thầy của nhạc tài tử, sống gần trọn thế kỷ 20.' },
      { name: 'Trần Văn Khê', inst: 'nhà nghiên cứu, đờn kìm', why: 'Giải thích nhạc cổ truyền Việt Nam cho thế giới và cho người Việt.' }
    ],
    study: [
      { title: 'La musique vietnamienne traditionnelle', by: 'Trần Văn Khê', kind: 'book', note: 'Sách nền tảng về nhạc cổ truyền Việt Nam (1962), có điệu, hơi và nhạc tài tử.' },
      { title: 'Musics of Vietnam', by: 'Phạm Duy', kind: 'book', note: 'Tổng quan bằng tiếng Anh về các dòng nhạc Việt, có cải lương và tài tử.' },
      { title: 'The Garland Handbook of Southeast Asian Music', by: 'Terry E. Miller and Sean Williams (eds.)', kind: 'book', note: 'Chương về Việt Nam: nhạc cụ, điệu thức, sân khấu.' },
      { title: 'Về thuật ngữ điệu và hơi trong nhạc tài tử – cải lương Nam Bộ', by: 'Bùi Trọng Hiền (Viện Âm nhạc)', kind: 'article', note: 'Bài viết rõ ràng về điệu, hơi, và vì sao người ta dùng hai chữ này khác nhau.' },
      { title: 'Hệ thống bài bản đờn ca tài tử', by: 'Nguyễn Tấn Nhì', kind: 'article', note: 'Danh sách 20 bài tổ và lịch sử các nhóm tài tử.' }
    ],
    listenFor: [
      'Ở ghi-ta phím lõm: nốt nào được nhấn lên, nốt nào được rung, nốt nào đờn thẳng?',
      'Trong vọng cổ: đếm sáu câu, và nghe nốt dứt ở cuối mỗi câu.',
      'Tiếng song lang: nó rơi ở đầu hay cuối câu nhạc?',
      'Đoạn rao trước bài: không có nhịp, nhưng nghe ra hơi gì?',
      'Khi người ca nghỉ, ghi-ta đờn gì vào chỗ trống?'
    ],
    practice: [
      'Lên dây Lai (Settings → Your guitar → Dây Lai), rồi làm bài “Lên dây Lai và tên nốt”.',
      'Mở nhịp Song lang trong Rhythm atlas, gõ chân vào tiếng song lang suốt một phút.',
      'Làm bài “Nhấn trên phím lõm” với máy so dây mở bên cạnh, nhắm từng nốt nhấn cho đúng.',
      'Đờn một câu ngắn hơi Bắc rồi đờn lại hơi Nam: cùng nốt, khác cách nhấn rung.',
      'Mở một bản vọng cổ trong Transcribe, chậm lại 70%, đếm sáu câu và chép lại chữ đờn dứt mỗi câu.'
    ]
  }
};
