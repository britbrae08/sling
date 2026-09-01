(() => {
  'use strict';

  const grid = document.getElementById('levelGrid');
  const levels = window.FaithWordsLevels;
  if (!grid || !Array.isArray(levels)) return;

  let scheduled = false;
  let observer = null;

  function completedAt(progress, index) {
    return !!progress?.completed?.[index];
  }

  function openLevel(index) {
    const game = window.FaithWordsGame;
    const progress = game?.exportProgress?.();
    if (!game?.importProgress || !progress) return;
    progress.lastLevel = index;
    game.importProgress(progress);
  }

  function setButtonState(button, index, state) {
    const level = levels[index];
    if (!level) return;

    button.classList.remove('locked', 'next-level');
    button.disabled = false;
    button.dataset.progressState = state;

    if (state === 'completed') {
      button.setAttribute('aria-label', `Level ${index + 1}, ${level.theme}`);
      button.innerHTML = `<strong>${index + 1}</strong><span>${level.theme}</span>`;
    } else if (state === 'next') {
      button.classList.add('next-level');
      button.setAttribute('aria-label', `Next level, Level ${index + 1}`);
      button.innerHTML = `<strong>${index + 1}</strong><span>NEXT LEVEL</span>`;
    } else {
      button.classList.add('locked');
      button.disabled = true;
      button.setAttribute('aria-label', `Level ${index + 1}, locked`);
      button.innerHTML = `<strong>🔒</strong><span>Level ${index + 1}</span>`;
    }

    if (state !== 'locked' && button.dataset.progressHandler !== 'true') {
      button.dataset.progressHandler = 'true';
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        openLevel(index);
      }, { capture: true });
    }
  }

  function decorateProgression() {
    scheduled = false;
    const game = window.FaithWordsGame;
    const progress = game?.exportProgress?.();
    const buttons = [...grid.querySelectorAll('.level-button')];
    if (!progress || !buttons.length) return;

    let nextIndex = levels.findIndex((_, index) => !completedAt(progress, index));
    if (nextIndex < 0) nextIndex = levels.length;

    observer?.disconnect();
    buttons.forEach((button, index) => {
      if (index < nextIndex && completedAt(progress, index)) {
        setButtonState(button, index, 'completed');
      } else if (index === nextIndex && index < levels.length) {
        setButtonState(button, index, 'next');
      } else {
        setButtonState(button, index, 'locked');
      }
    });
    observer?.observe(grid, { childList: true, subtree: true });
  }

  function scheduleDecorate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(decorateProgression);
  }

  observer = new MutationObserver(scheduleDecorate);
  observer.observe(grid, { childList: true, subtree: true });
  window.addEventListener('faithwords-progress-changed', scheduleDecorate);
  window.addEventListener('load', scheduleDecorate);
  setTimeout(scheduleDecorate, 500);
})();
