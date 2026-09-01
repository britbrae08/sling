(() => {
  'use strict';

  const viewport = document.getElementById('crosswordViewport');
  const board = document.getElementById('crossword');
  const levelLabel = document.getElementById('levelLabel');
  if (!viewport || !board) return;

  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;
  let activePointer = null;
  let dragDistance = 0;
  let lastTapTime = 0;
  let lastTapX = 0;
  let lastTapY = 0;
  let recenterAnimation = null;

  viewport.setAttribute('aria-label', 'Crossword puzzle background. Drag with one finger anywhere on the open game background to move the puzzle. Double tap the background to center the puzzle.');

  function limits() {
    const vw = Math.max(1, viewport.clientWidth);
    const vh = Math.max(1, viewport.clientHeight);
    const bw = Math.max(1, board.scrollWidth || board.offsetWidth);
    const bh = Math.max(1, board.scrollHeight || board.offsetHeight);

    return {
      x: Math.max(vw * .82, (vw + bw) / 2 - 18),
      y: Math.max(vh * .82, (vh + bh) / 2 - 18)
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function apply() {
    const max = limits();
    x = clamp(x, -max.x, max.x);
    y = clamp(y, -max.y, max.y);
    board.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function stopRecenterAnimation() {
    if (!recenterAnimation) return;
    const animation = recenterAnimation;
    recenterAnimation = null;
    try { animation.cancel(); } catch (_) {}
  }

  function centerBoard({ animate = true } = {}) {
    stopRecenterAnimation();

    const fromX = x;
    const fromY = y;
    x = 0;
    y = 0;

    // Make the centered transform the real underlying style immediately.
    // The animation is visual-only, so it can never keep ownership of the
    // transform after it finishes and block the next drag gesture.
    board.style.transform = 'translate3d(0,0,0)';

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (animate && !reduceMotion && board.animate && (Math.abs(fromX) > 1 || Math.abs(fromY) > 1)) {
      const animation = board.animate([
        { transform: `translate3d(${fromX}px, ${fromY}px, 0)` },
        { transform: 'translate3d(0,0,0)' }
      ], {
        duration: 240,
        easing: 'cubic-bezier(.2,.8,.2,1)',
        fill: 'none'
      });

      recenterAnimation = animation;
      animation.addEventListener('finish', () => {
        if (recenterAnimation === animation) recenterAnimation = null;
        board.style.transform = 'translate3d(0,0,0)';
      }, { once: true });
      animation.addEventListener('cancel', () => {
        if (recenterAnimation === animation) recenterAnimation = null;
      }, { once: true });
    }
  }

  function reset() {
    centerBoard({ animate: false });
  }

  viewport.addEventListener('pointerdown', event => {
    if (activePointer !== null) return;

    // Any new touch immediately releases a still-running recenter animation.
    stopRecenterAnimation();

    activePointer = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    originX = x;
    originY = y;
    dragDistance = 0;
    viewport.classList.add('panning');
    viewport.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }, { passive: false });

  viewport.addEventListener('pointermove', event => {
    if (event.pointerId !== activePointer) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    dragDistance = Math.max(dragDistance, Math.hypot(dx, dy));
    x = originX + dx;
    y = originY + dy;
    apply();
    event.preventDefault();
  }, { passive: false });

  function end(event) {
    if (event.pointerId !== activePointer) return;

    const wasTap = dragDistance <= 10;
    activePointer = null;
    viewport.classList.remove('panning');

    if (wasTap) {
      const now = performance.now();
      const closeEnough = Math.hypot(event.clientX - lastTapX, event.clientY - lastTapY) <= 48;
      if (now - lastTapTime <= 340 && closeEnough) {
        centerBoard({ animate: true });
        lastTapTime = 0;
      } else {
        lastTapTime = now;
        lastTapX = event.clientX;
        lastTapY = event.clientY;
      }
    } else {
      lastTapTime = 0;
    }

    event.preventDefault();
  }

  viewport.addEventListener('pointerup', end, { passive: false });
  viewport.addEventListener('pointercancel', event => {
    if (event.pointerId !== activePointer) return;
    activePointer = null;
    dragDistance = 0;
    lastTapTime = 0;
    viewport.classList.remove('panning');
    event.preventDefault();
  }, { passive: false });

  new MutationObserver(() => requestAnimationFrame(reset)).observe(levelLabel || board, {
    childList: true,
    characterData: true,
    subtree: true
  });

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => requestAnimationFrame(apply)).observe(viewport);
  } else {
    window.addEventListener('resize', () => requestAnimationFrame(apply));
  }
})();
