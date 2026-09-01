(() => {
  'use strict';

  const levelGrid = document.getElementById('levelGrid');
  if (!levelGrid) return;

  const isHardLevel = levelNumber => {
    if (window.FaithWordsConfig?.isHardLevel) return window.FaithWordsConfig.isHardLevel(levelNumber);
    return Number(levelNumber) >= 20 && Number(levelNumber) % 5 === 0;
  };

  function annotateHardLevels() {
    levelGrid.querySelectorAll('.level-button').forEach(button => {
      const aria = button.getAttribute('aria-label') || '';
      const text = button.textContent || '';
      const match = aria.match(/Level\s+(\d+)/i) || text.match(/(?:Level\s+)?(\d+)/i);
      if (!match) return;

      const levelNumber = Number(match[1]);
      const hard = isHardLevel(levelNumber);
      button.classList.toggle('hard-menu-level', hard);

      const existing = button.querySelector('.hard-menu-tag');
      if (!hard) {
        existing?.remove();
        return;
      }

      if (!existing) {
        const tag = document.createElement('span');
        tag.className = 'hard-menu-tag';
        tag.textContent = 'HARD';
        tag.setAttribute('aria-hidden', 'true');
        button.append(tag);
      }

      if (!/\bhard\b/i.test(aria)) {
        button.setAttribute('aria-label', `${aria || `Level ${levelNumber}`}, hard`);
      }
    });
  }

  new MutationObserver(annotateHardLevels).observe(levelGrid, {
    childList: true,
    subtree: true
  });

  annotateHardLevels();
})();
