(() => {
  'use strict';

  const message = document.getElementById('message');
  if (!message) return;

  let audioCtx = null;
  let lastText = '';

  function sfxEnabled() {
    return !window.FaithWordsPrefs || window.FaithWordsPrefs.sfxEnabled !== false;
  }

  function ensureAudio() {
    if (!sfxEnabled()) return null;
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
      return audioCtx;
    } catch {
      return null;
    }
  }

  function note(freq, when, duration, volume, type = 'triangle', endFreq = null) {
    const ctx = ensureAudio();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, when + duration);

    gain.gain.setValueAtTime(.0001, when);
    gain.gain.exponentialRampToValueAtTime(volume, when + .018);
    gain.gain.exponentialRampToValueAtTime(.0001, when + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(when);
    osc.stop(when + duration + .02);
  }

  function playReward() {
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime + .01;
    note(523.25, now, .14, .035, 'triangle');
    note(659.25, now + .075, .16, .032, 'triangle');
    note(783.99, now + .15, .22, .030, 'sine');
  }

  function playNegative() {
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime + .01;
    note(196, now, .12, .032, 'sine', 155);
    note(138.59, now + .075, .16, .026, 'triangle', 110);
  }

  function classify(text) {
    // New board words appear as the word itself. New bonus dictionary words
    // include the added hint point in the status message.
    if (/^[A-Z]{3,}$/.test(text)) return 'reward';
    if (/\+\d+\s+HINT POINT/i.test(text)) return 'reward';

    if (/^Already found$/i.test(text)) return 'negative';
    if (/already counted/i.test(text)) return 'negative';
    if (/Not in the dictionary/i.test(text)) return 'negative';
    if (/Words start at 3 letters/i.test(text)) return 'negative';
    if (/Try another word/i.test(text)) return 'negative';

    return null;
  }

  const observer = new MutationObserver(() => {
    const text = message.textContent.trim();
    if (!text || text === lastText) return;
    lastText = text;

    const result = classify(text);
    if (result === 'reward') playReward();
    if (result === 'negative') playNegative();
  });

  observer.observe(message, { childList: true, characterData: true, subtree: true });
})();
