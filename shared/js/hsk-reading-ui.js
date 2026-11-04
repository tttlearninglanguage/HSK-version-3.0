/* Reading presentation shared by HSK 1–3. Existing renderers own answers and progress. */
(() => {
  const app = document.getElementById('app');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let popup, anchor;
  function close() { popup?.remove(); popup = anchor = null; }
  function show(word, target) {
    close();
    anchor = target;
    popup = document.createElement('aside');
    popup.id = 'hsk-reading-gloss';
    popup.className = 'hsk-reading-gloss';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-label', 'Tra từ ' + word.hanzi);
    popup.innerHTML = `<div class="gloss-head"><span class="gloss-hanzi">${escape(word.hanzi)}</span><button type="button" aria-label="Đóng tra từ">✕</button></div><p class="gloss-pin">${escape(word.pinyin)}</p><p>${escape(word.meaning)}</p><button type="button" class="gloss-audio">🔊 Nghe</button>`;
    popup.querySelector('[aria-label="Đóng tra từ"]').onclick = close;
    popup.querySelector('.gloss-audio').onclick = () => window.speak(word.hanzi);
    document.body.append(popup);
    position();
  }
  function position() {
    if (!popup || !anchor?.isConnected) return;
    const r = anchor.getBoundingClientRect(), b = popup.getBoundingClientRect();
    popup.style.left = Math.max(12, Math.min(innerWidth - b.width - 12, r.left)) + 'px';
    popup.style.top = Math.max(12, Math.min(innerHeight - b.height - 12, r.bottom + b.height + 12 < innerHeight ? r.bottom + 8 : r.top - b.height - 8)) + 'px';
  }
  function lookup(event) {
    const target = event.target.closest?.('.reading-study .h2-word,.reading-study .hsk-clickword');
    if (!target) return;
    if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
    const word = target.classList.contains('h2-word') ? window.h2ReadingWord(target.dataset.lookup) : window.hskWordIndex?.[target.dataset.word ?? target.getAttribute('onclick')?.match(/hskShowWord\((\d+)\)/)?.[1]];
    if (!word) return;
    event.preventDefault(); event.stopImmediatePropagation();
    show(word, target);
  }
  window.addEventListener('click', lookup, true);
  window.addEventListener('keydown', lookup, true);
  document.addEventListener('click', event => {
    if (popup && !popup.contains(event.target) && !anchor?.contains(event.target)) close();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && popup) { const target = anchor; close(); target?.focus(); } });
  window.addEventListener('resize', close);
  window.addEventListener('scroll', position, true);
  function fitAnswers(panel) {
    const options = panel.querySelector('.h2-options,.grid');
    if (!options) return;
    const answers = [...options.querySelectorAll('.h2-answer,.option')];
    if (!answers.length) return;
    const longest = Math.max(...answers.map(b => Array.from(b.textContent.trim()).length));
    const desired = longest <= 6 ? 4 : longest <= 18 ? 2 : 1;
    const available = Math.max(1, Math.floor((options.clientWidth + 10) / (longest <= 6 ? 140 : 240)));
    options.style.setProperty('--reading-answer-columns', Math.min(desired, available));
  }
  function decorate() {
    if (anchor && !anchor.isConnected) close();
    const layout = app.querySelector('.h2-reading-layout');
    if (layout && !layout.dataset.readingUnified) {
      layout.dataset.readingUnified = 'true';
      const passage = layout.querySelector('.h2-passage'), question = layout.querySelector('.h2-reading-question');
      passage.classList.add('reading-study');
      question.classList.remove('panel');
      question.id = 'hsk-reading-question';
      const status = question.querySelector('.row');
      if (status) passage.prepend(status);
      const progress = question.querySelector('.progress');
      if (progress) status?.after(progress);
      const hint = passage.querySelector('.h2-lookup-hint');
      hint.textContent = '👆 Bấm vào từ hoặc cụm từ để xem Pinyin và nghĩa tiếng Việt.';
      const pin = passage.querySelector('#h2-reading-pinyin');
      const text = passage.querySelector('.h2-passage-text');
      const ruby = document.createElement('div');
      ruby.id = pin.id; ruby.className = 'reading-pinyin'; ruby.hidden = pin.hidden;
      ruby.innerHTML = window.h2ReadingAnnotated(text.textContent);
      pin.replaceWith(ruby);
      const toggle = passage.querySelector('[onclick*="h2ToggleReading(\'pinyin\'"]');
      toggle.textContent = ruby.hidden ? '🔤 Hiện Pinyin' : '🔤 Ẩn Pinyin';
      toggle.setAttribute('aria-controls', ruby.id); toggle.setAttribute('aria-expanded', String(!ruby.hidden));
      const tools = document.createElement('div'); tools.className = 'toolbar reading-pinyin-control'; tools.append(toggle);
      text.after(tools, ruby);
      const divider = document.createElement('hr'); passage.append(divider, question);
    }
    const hsk1 = app.querySelector('.panel:has(>#passageFeedback)');
    if (hsk1) hsk1.classList.add('reading-study');
    app.querySelectorAll('.reading-study').forEach(panel => {
      const toggle = panel.querySelector('#togglePinyin,[aria-controls="h2-reading-pinyin"]');
      const pin = panel.querySelector('#readingPinyin,#h2-reading-pinyin');
      if (toggle && pin) {
        const label = pin.hidden ? '🔤 Hiện Pinyin' : '🔤 Ẩn Pinyin';
        if (toggle.textContent !== label) toggle.textContent = label;
        const expanded = String(!pin.hidden);
        if (toggle.getAttribute('aria-expanded') !== expanded) toggle.setAttribute('aria-expanded', expanded);
        toggle.setAttribute('aria-controls', pin.id);
      }
      fitAnswers(panel);
    });
  }
  new MutationObserver(decorate).observe(app, {childList:true, subtree:true, attributes:true, attributeFilter:['hidden']});
  window.addEventListener('resize', () => app.querySelectorAll('.reading-study').forEach(fitAnswers));
  decorate();
})();
