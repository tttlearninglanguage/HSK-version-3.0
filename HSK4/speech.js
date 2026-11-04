/* Shared native speech playback. Keep speak() in the originating user gesture. */
(() => {
  const synth = window.speechSynthesis;
  let active = null;
  let readingButton = null;
  let readingLabel = '';
  function resetReadingButton() {
    if (!readingButton) return;
    readingButton.textContent = readingLabel;
    readingButton.setAttribute('aria-pressed', 'false');
    readingButton = null;
  }
  let startTimer = null;
  let voices = [];
  let preferred = '';
  const voiceKey = 'hsk4-voice';
  try { preferred = localStorage.getItem(voiceKey) || ''; } catch {}

  function hideNotice() { document.getElementById('hsk-speech-notice')?.remove(); }
  function notice(message, retry) {
    hideNotice();
    const box = document.createElement('div');
    box.id = 'hsk-speech-notice';
    box.setAttribute('role', 'status');
    box.style.cssText = 'position:fixed;bottom:12px;left:12px;right:12px;z-index:3000;max-width:560px;margin:auto;padding:14px;background:white;color:#253244;border:1px solid #d9dfe7;border-radius:14px;box-shadow:0 6px 24px #172b4026;font:15px/1.5 Arial,sans-serif';
    const text = document.createElement('p');
    text.textContent = message;
    text.style.margin = '0 0 8px';
    box.append(text);
    if (retry) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = '🔊 Nghe lại';
      button.onclick = retry;
      box.append(button);
    }
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Đóng';
    close.onclick = hideNotice;
    box.append(close);
    document.body.append(box);
  }
  const isChinese = v => /^(zh|cmn)([-_]|$)/i.test(v.lang);
  function refreshVoices() {
    try { voices = synth ? synth.getVoices().filter(isChinese) : []; } catch { voices = []; }
    const picker = document.getElementById('voiceSelect');
    if (picker) {
      const value = preferred;
      picker.replaceChildren(new Option('Tự chọn giọng tiếng Trung tốt nhất', ''));
      voices.forEach(v => picker.add(new Option(`${v.name} (${v.lang})`, v.voiceURI)));
      if (voices.some(v => v.voiceURI === value)) picker.value = value;
    }
  }
  function pickVoice() {
    const chosen = voices.find(v => v.voiceURI === preferred);
    if (chosen) return chosen;
    // Prefer Mandarin and local voices; never accidentally default to Cantonese.
    return voices.filter(v => !/^(zh[-_](HK|MO)|yue)([-_]|$)/i.test(v.lang))
      .map(v => ({v, score: (/^(zh[-_](CN|Hans)|cmn)([-_]|$)/i.test(v.lang) ? 10 : 0) + (v.localService ? 2 : 0)}))
      .sort((a, b) => b.score - a.score)[0]?.v;
  }
  function stop() {
    clearTimeout(startTimer);
    const needsCancel = active || synth?.speaking || synth?.pending;
    resetReadingButton();
    active = null; // Ignore end/error events from the superseded request.
    if (synth && needsCancel) synth.cancel();
  }
  function play(value, rate = .85, systemVoice = false, button = null) {
    const text = String(value ?? '').trim();
    if (!text) return;
    if (!synth || typeof window.SpeechSynthesisUtterance !== 'function') {
      notice('Trình duyệt này chưa hỗ trợ đọc tiếng Trung. Hãy mở trang bằng Safari hoặc Chrome phiên bản mới.');
      return;
    }
    hideNotice();
    refreshVoices();
    stop();
    // WebKit can remain paused after backgrounding or interrupting speech.
    if (synth.paused) synth.resume();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = Math.min(.95, Math.max(.65, Number(rate) || .85));
    utterance.pitch = 1;
    utterance.volume = 1;
    const voice = systemVoice ? undefined : pickVoice();
    if (voice) { utterance.voice = voice; utterance.lang = voice.lang.replace(/_/g, '-'); }
    // Retain the utterance until completion (including while native voices load).
    active = utterance;
    if (button?.isConnected) {
      readingButton = button;
      readingLabel = button.textContent;
      button.textContent = '⏹ Dừng đọc';
      button.setAttribute('aria-pressed', 'true');
    }
    utterance.onstart = () => {
      if (active !== utterance) return;
      clearTimeout(startTimer);
      hideNotice();
    };
    utterance.onend = () => {
      if (active !== utterance) return;
      clearTimeout(startTimer);
      active = null;
      resetReadingButton();
      hideNotice();
    };
    utterance.onerror = event => {
      if (active !== utterance) return;
      clearTimeout(startTimer);
      active = null;
      resetReadingButton();
      if (event.error === 'canceled' || event.error === 'interrupted') return;
      const message = event.error === 'not-allowed'
        ? 'Trình duyệt yêu cầu bấm để phát âm. Hãy bấm Nghe lại.'
        : 'Chưa phát được tiếng Trung. Hãy bấm Nghe lại; nếu vẫn không có tiếng, kiểm tra âm lượng và giọng tiếng Trung trong cài đặt thiết bị.';
      notice(message, () => play(text, rate, true, button));
    };
    startTimer = setTimeout(() => {
      if (active === utterance) notice('Chưa nhận được tín hiệu phát âm. Hãy bấm Nghe lại và kiểm tra âm lượng thiết bị.', () => play(text, rate, true, button));
    }, 5000);
    try {
      // Do not await voiceschanged or defer this call: iOS requires user activation.
      synth.speak(utterance);
    } catch (error) { utterance.onerror({error: error.name}); }
  }
  window.hskReadPassage = (button, text, rate = .85) => {
    if (readingButton === button && active) { stop(); hideNotice(); return; }
    window.speak(text, rate, false, button);
  };
  document.addEventListener('click', event => {
    const button = event.target.closest?.('[data-reading-audio]');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.hskReadPassage(button, button.dataset.say ?? button.dataset.text);
  }, true);
  // Stop an old passage when navigation or a new question removes its control.
  new MutationObserver(() => {
    if (readingButton && !readingButton.isConnected) { stop(); hideNotice(); }
  }).observe(document.body, {childList: true, subtree: true});
  window.speak = play;
  window.topicSay = text => play(text, .83);
  window.hskChooseSpeechVoice = value => {
    preferred = value;
    try { localStorage.setItem(voiceKey, value); } catch {}
    play('你好，欢迎学习汉语。', .82);
  };
  refreshVoices();
  synth?.addEventListener?.('voiceschanged', refreshVoices);
  window.addEventListener('pagehide', () => { stop(); hideNotice(); });
})();
