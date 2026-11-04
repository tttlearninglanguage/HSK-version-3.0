/* Reading-specific segmentation and polyphonic glosses; vocabulary cards keep their original senses. */
(() => {
  const records = window.HSK3_UPDATE.readings;
  const baseWord = window.h2ReadingWord;
  const baseTokens = window.h2Tokens;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const glosses = new Map();
  let active;
  const markup = (text, reading, ruby = false) => String(text).split(/([\u3400-\u9fff]+)/).map(chunk => {
    if (!/[\u3400-\u9fff]/.test(chunk)) return escape(chunk);
    const words = reading?.tokens?.[chunk];
    if (!words) return baseTokens(chunk);
    return words.map(word => {
      if (ruby) return `<ruby>${escape(word.hanzi)}<rt>${escape(word.pinyin)}</rt></ruby>`;
      const key = `reading:${word.hanzi}:${word.pinyin}`;
      glosses.set(key, word);
      return `<button type="button" class="h2-word" data-lookup="${escape(key)}" aria-label="Tra từ ${escape(word.hanzi)}">${escape(word.hanzi)}</button>`;
    }).join('');
  }).join('');
  window.h3ReadingTokens = (text, reading) => { if (reading) active = reading; return markup(text, reading || active); };
  window.h2ReadingWord = key => glosses.get(key) || baseWord(key);
  window.h2ReadingAnnotated = text => markup(text, records.find(r => r.text === text) || active, true);
})();
