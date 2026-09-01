(() => {
  'use strict';

  const scene = document.getElementById('scene');
  const toolbar = document.querySelector('.puzzle-toolbar');
  const menu = document.getElementById('audioMenu');
  const credit = document.querySelector('.dictionary-credit');
  const levelLabel = document.getElementById('levelLabel');
  const prompt = document.getElementById('themePrompt');
  const levels = window.FaithWordsLevels;

  if (scene && toolbar && toolbar.parentElement !== scene) scene.append(toolbar);

  if (menu && credit) {
    credit.classList.add('menu-credit');
    menu.append(credit);
  }

  function refreshMeta() {
    if (!levelLabel || !prompt || !Array.isArray(levels)) return;
    const match = levelLabel.textContent.match(/(\d+)/);
    const levelNumber = match ? Number(match[1]) : 1;
    const level = levels[levelNumber - 1];
    const letters = level?.letters?.length || 0;
    if (letters) prompt.textContent = `${letters} LETTERS • FIND EVERY WORD`;
  }

  if (levelLabel) {
    new MutationObserver(refreshMeta).observe(levelLabel, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  refreshMeta();
})();
