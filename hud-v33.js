(() => {
  'use strict';

  const levelPickerButton = document.getElementById('levelPickerButton');
  const levelDrawer = document.getElementById('levelDrawer');
  const audioMenu = document.getElementById('audioMenu');
  const menuButton = document.getElementById('menuButton');
  const wheel = document.getElementById('letterWheel');

  // Keep the word currently being traced clearly above the letter wheel.
  // The puzzle board may sit behind this feedback, which is intentional: the
  // board can be moved, while the active word should never cover the letters.
  if (!document.getElementById('faithwords-word-readout-v37')) {
    const readoutStyle = document.createElement('style');
    readoutStyle.id = 'faithwords-word-readout-v37';
    readoutStyle.textContent = `
      .word-readout-wrap {
        bottom: calc(var(--fw-wheel-clearance) + 22px) !important;
        min-height: 42px !important;
        height: auto !important;
        padding: 0 16px !important;
        align-content: center !important;
        z-index: 14 !important;
      }
      .word-readout { margin: 0 !important; line-height: 1.08 !important; }
      .message { line-height: 1.15 !important; }
      @media (max-height: 780px) {
        .word-readout-wrap { bottom: calc(var(--fw-wheel-clearance) + 18px) !important; }
      }
      @media (max-height: 690px) {
        .word-readout-wrap { bottom: calc(var(--fw-wheel-clearance) + 14px) !important; }
      }
    `;
    document.head.append(readoutStyle);
  }

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
