(() => {
  'use strict';

  const grid = document.getElementById('levelGrid');
  if (!grid) return;

  let scheduled = false;

  function decorateNextLevel() {
    scheduled = false;
    const buttons = [...grid.querySelectorAll('.level-button')];
    if (!buttons.length) return;

    const firstLocked = buttons.find(button => button.classList.contains('locked'));
    if (!firstLocked || firstLocked.dataset.nextLevelReady === 'true') return;

    const levelIndex = buttons.indexOf(firstLocked);
    if (levelIndex < 0) return;

    firstLocked.disabled = false;
    firstLocked.classList.remove('locked');
    firstLocked.classList.add('next-level');
    firstLocked.dataset.nextLevelReady = 'true';
    firstLocked.setAttribute('aria-label', `Next level, Level ${levelIndex + 1}`);
    firstLocked.innerHTML = `<strong>${levelIndex + 1}</strong><span>NEXT LEVEL</span>`;

    firstLocked.addEventListener('click', event => {
      event.preventDefault();
      const game = window.FaithWordsGame;
      const progress = game?.exportProgress?.();
      if (!game?.importProgress || !progress) return;

      // Open the next level without prematurely unlocking anything after it.
      // The normal completion logic still controls permanent progression.
      progress.lastLevel = levelIndex;
      game.importProgress(progress);
    }, { once: true });
  }

  function scheduleDecorate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(decorateNextLevel);
  }

  new MutationObserver(scheduleDecorate).observe(grid, { childList: true, subtree: true });
  window.addEventListener('load', scheduleDecorate);
  setTimeout(scheduleDecorate, 500);
})();
