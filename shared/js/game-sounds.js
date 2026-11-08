/* Short, local feedback tones. Never controls or cancels speech synthesis. */
(() => {
  'use strict';
  const KEY = 'hsk-game-sounds';
  let enabled = true, context, generation = 0;
  const active = new Set();
  try { enabled = localStorage.getItem(KEY) !== 'off'; } catch {}

  function stop() {
    generation++;
    for (const oscillator of active) {
      try { oscillator.stop(); } catch {}
    }
    active.clear();
  }
  function play(correct) {
    if (!enabled || typeof correct !== 'boolean' || document.hidden) return;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      if (!context || context.state === 'closed') context = new Audio();
      stop();
      const request = generation;
      const schedule = () => {
        if (!enabled || request !== generation || document.hidden || context.state !== 'running') return;
        const notes = correct ? [523.25, 659.25, 783.99] : [293.66, 220];
        const start = context.currentTime + 0.01;
        notes.forEach((frequency, i) => {
          const oscillator = context.createOscillator(), gain = context.createGain();
          const at = start + i * 0.085, end = at + 0.13;
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(frequency, at);
          gain.gain.setValueAtTime(0, at);
          gain.gain.linearRampToValueAtTime(0.075, at + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.001, end);
          oscillator.connect(gain); gain.connect(context.destination);
          active.add(oscillator);
          oscillator.onended = () => { active.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
          oscillator.start(at); oscillator.stop(end + 0.01);
        });
      };
      if (context.state === 'running') schedule();
      else Promise.resolve(context.resume()).then(schedule).catch(() => {});
    } catch { /* Unsupported/blocked audio must never prevent grading. */ }
  }
  function update(button) {
    button.textContent = enabled ? '🔔 Âm báo: Bật' : '🔕 Âm báo: Tắt';
    button.setAttribute('aria-pressed', String(enabled));
    button.title = 'Bật hoặc tắt âm báo đáp án đúng và sai';
  }
  function mount() {
    const nav = document.querySelector('#hsk-site-header .hsk-nav-actions');
    if (!nav || nav.querySelector('[data-game-sounds]')) return;
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.gameSounds = '';
    button.style.cssText = 'font:inherit;white-space:nowrap;cursor:pointer';
    update(button);
    button.addEventListener('click', () => {
      enabled = !enabled;
      if (!enabled) stop();
      try { localStorage.setItem(KEY, enabled ? 'on' : 'off'); } catch {}
      update(button);
    });
    nav.append(button);
  }
  window.HSKGameSounds = { play };
  mount();
  new MutationObserver(mount).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
})();
