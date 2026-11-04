/* Reviewed reading supplements. Vietnamese glosses are written for the local context.
   Names are transliterations, not literal translations. Sources document readings/senses. */
(() => {
  const entries = [
  {
    "hanzi": "小明",
    "pinyin": "Xiǎo Míng",
    "meaning": "Tiểu Minh (tên người)",
    "source": "https://pinyin.info/rules/GBT16159-2012.html"
  },
  {
    "hanzi": "小红",
    "pinyin": "Xiǎo Hóng",
    "meaning": "Tiểu Hồng (tên người)",
    "source": "https://dacidian.18dao.net/zh-hans/zici/小紅/070220365"
  },
  {
    "hanzi": "小丽",
    "pinyin": "Xiǎo Lì",
    "meaning": "Tiểu Lệ (tên người; 丽 đọc là lì trong tên này)",
    "source": "https://zdic.net/hans/丽"
  },
  {
    "hanzi": "李文",
    "pinyin": "Lǐ Wén",
    "meaning": "Lý Văn (tên người; 李 là họ Lý)",
    "source": "https://www.hanzistroke.com/word/李文"
  },
  {
    "hanzi": "王老师",
    "pinyin": "Wáng lǎoshī",
    "meaning": "Thầy/cô Vương (王 là họ Vương, 老师 là giáo viên)",
    "source": "https://elon.io/grammar/chinese-mandarin/nouns/titles"
  },
  {
    "hanzi": "李",
    "pinyin": "Lǐ",
    "meaning": "Họ Lý (trong tên người)",
    "source": "https://zdic.net/hans/李"
  },
  {
    "hanzi": "王",
    "pinyin": "Wáng",
    "meaning": "Họ Vương (trong tên người)",
    "source": "https://zdic.net/hans/王"
  },
  {
    "hanzi": "丽",
    "pinyin": "lì",
    "meaning": "Đẹp, mỹ lệ; trong tên 小丽 đọc là lì",
    "source": "https://zdic.net/hans/丽"
  },
  {
    "hanzi": "看书",
    "pinyin": "kàn shū",
    "meaning": "Đọc sách",
    "source": "https://zdic.net/hans/看书"
  },
  {
    "hanzi": "买东西",
    "pinyin": "mǎi dōngxi",
    "meaning": "Mua đồ, mua sắm (东西 ở đây là đồ vật)",
    "source": "https://dict.revised.moe.edu.tw/dictView.jsp?ID=28004&la=0&powerMode=0"
  },
  {
    "hanzi": "担心",
    "pinyin": "dānxīn",
    "meaning": "Lo lắng",
    "source": "https://zdic.net/hans/担心"
  },
  {
    "hanzi": "号码",
    "pinyin": "hàomǎ",
    "meaning": "Số, mã số (ví dụ: số điện thoại)",
    "source": "https://zdic.net/hans/号码"
  },
  {
    "hanzi": "门",
    "pinyin": "mén",
    "meaning": "Cửa, cổng",
    "source": "https://zdic.net/hans/门"
  },
  {
    "hanzi": "首",
    "pinyin": "shǒu",
    "meaning": "Lượng từ cho bài hát hoặc bài thơ (这首歌: bài hát này)",
    "source": "https://zdic.net/hans/首"
  },
  {
    "hanzi": "位",
    "pinyin": "wèi",
    "meaning": "Lượng từ lịch sự dùng cho người (这位女士: vị/cô này)",
    "source": "https://zdic.net/hans/位"
  },
  {
    "hanzi": "难",
    "pinyin": "nán",
    "meaning": "Khó (trong 很难写: rất khó viết)",
    "source": "https://zdic.net/hans/难"
  },
  {
    "hanzi": "有意思",
    "pinyin": "yǒu yìsi",
    "meaning": "Thú vị, hay (trong ngữ cảnh bài đọc)",
    "source": "https://zdic.net/hans/有意思"
  },
  {
    "hanzi": "城市",
    "pinyin": "chéngshì",
    "meaning": "Thành phố",
    "source": "https://zdic.net/hans/城市"
  }
];
  window.HSK1_READING_DICTIONARY = entries;
  const previous = window.hskLookupDictionary;
  window.hskLookupDictionary = function () {
    const words = new Map(previous().map(word => [word.hanzi, word]));
    for (const word of entries) words.set(word.hanzi, word);
    return [...words.values()].sort((a, b) => b.hanzi.length - a.hanzi.length);
  };
})();
