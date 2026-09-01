(() => {
  'use strict';
  const PREF_KEY = 'faithWordsAudioPrefsV2';
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem(PREF_KEY) || '{}'); } catch {}

  const prefs = window.FaithWordsPrefs = {
    sfxEnabled: stored.sfxEnabled !== false
  };

  const menuButton = document.getElementById('menuButton');
  const menu = document.getElementById('audioMenu');
  const sfxToggle = document.getElementById('sfxToggle');

  function persist() {
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
  }

  function update() {
    if (sfxToggle) sfxToggle.checked = prefs.sfxEnabled;
    if (menuButton) menuButton.setAttribute('aria-label', prefs.sfxEnabled ? 'Open menu' : 'Open menu, game sounds off');
  }

  function toggleMenu(force) {
    if (!menu || !menuButton) return;
    const open = typeof force === 'boolean' ? force : !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  }

  menuButton?.addEventListener('click', event => {
    event.stopPropagation();
    toggleMenu();
  });
  menu?.addEventListener('click', event => event.stopPropagation());
  document.addEventListener('click', () => toggleMenu(false));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') toggleMenu(false);
  });
  sfxToggle?.addEventListener('change', () => {
    prefs.sfxEnabled = !!sfxToggle.checked;
    persist();
    update();
  });

  update();
})();