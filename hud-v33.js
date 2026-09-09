(() => {
  'use strict';

  const levelPickerButton = document.getElementById('levelPickerButton');
  const levelDrawer = document.getElementById('levelDrawer');
  const audioMenu = document.getElementById('audioMenu');
  const menuButton = document.getElementById('menuButton');
  const wheel = document.getElementById('letterWheel');

  if (levelPickerButton && levelDrawer) {
    levelPickerButton.setAttribute('aria-expanded', levelDrawer.classList.contains('open') ? 'true' : 'false');

    // Capture the tap before older HUD handlers so the same Level button
    // reliably toggles the drawer open and closed.
    levelPickerButton.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();

      audioMenu?.classList.remove('open');
      menuButton?.setAttribute('aria-expanded', 'false');

      const opening = !levelDrawer.classList.contains('open');
      levelDrawer.classList.toggle('open', opening);
      levelPickerButton.setAttribute('aria-expanded', opening ? 'true' : 'false');
    }, true);

    const closeLevelsButton = document.getElementById('closeLevelsButton');
    closeLevelsButton?.addEventListener('click', () => {
      levelPickerButton.setAttribute('aria-expanded', 'false');
    });
  }

  if (!wheel) return;

  const alignmentStyle = document.createElement('style');
  alignmentStyle.id = 'faithwords-wheel-alignment-v35';
  alignmentStyle.textContent = `
    #letterWheel .letter-btn {
      transform: translate(var(--fw-wheel-dx, 0px), var(--fw-wheel-dy, 0px));
      transform-origin: center;
    }
    #letterWheel .letter-btn.active {
      transform: translate(var(--fw-wheel-dx, 0px), var(--fw-wheel-dy, 0px)) scale(1.08);
    }
  `;
  document.head.append(alignmentStyle);

  function alignWheelLetters() {
    const rect = wheel.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    // The game engine lays the wheel out in a 300 x 300 coordinate system.
    // Scale those coordinates to the wheel's actual responsive size without
    // changing the engine's hit-testing coordinates.
    const scaleX = rect.width / 300;
    const scaleY = rect.height / 300;

    wheel.querySelectorAll('.letter-btn').forEach(button => {
      const x = Number.parseFloat(button.style.left);
      const y = Number.parseFloat(button.style.top);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      button.style.setProperty('--fw-wheel-dx', `${x * (scaleX - 1)}px`);
      button.style.setProperty('--fw-wheel-dy', `${y * (scaleY - 1)}px`);
    });
  }

  const observer = new MutationObserver(() => requestAnimationFrame(alignWheelLetters));
  observer.observe(wheel, { childList: true });

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => requestAnimationFrame(alignWheelLetters)).observe(wheel);
  } else {
    window.addEventListener('resize', () => requestAnimationFrame(alignWheelLetters), { passive: true });
  }

  requestAnimationFrame(alignWheelLetters);
})();
