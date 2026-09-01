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

  viewport.setAttribute('aria-label', 'Crossword puzzle background. Drag with one finger anywhere on the open game background to move the puzzle.');

  function limits() {
    const vw = Math.max(1, viewport.clientWidth);
    const vh = Math.max(1, viewport.clientHeight);
    const bw = Math.max(1, board.scrollWidth || board.offsetWidth);
    const bh = Math.max(1, board.scrollHeight || board.offsetHeight);

    // The crossword is a full-screen background object now. Allow it to travel
    // across almost the entire gameplay surface while keeping a small portion
    // recoverable at the furthest edge.
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

  function reset() {
    x = 0;
    y = 0;
    board.style.transform = 'translate3d(0,0,0)';
  }

  viewport.addEventListener('pointerdown', event => {
    if (activePointer !== null) return;
    activePointer = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    originX = x;
    originY = y;
    viewport.classList.add('panning');
    viewport.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }, { passive: false });

  viewport.addEventListener('pointermove', event => {
    if (event.pointerId !== activePointer) return;
    x = originX + (event.clientX - startX);
    y = originY + (event.clientY - startY);
    apply();
    event.preventDefault();
  }, { passive: false });

  function end(event) {
    if (event.pointerId !== activePointer) return;
    activePointer = null;
    viewport.classList.remove('panning');
    event.preventDefault();
  }

  viewport.addEventListener('pointerup', end, { passive: false });
  viewport.addEventListener('pointercancel', end, { passive: false });

  new MutationObserver(() => requestAnimationFrame(reset)).observe(levelLabel || board, {
    childList: true,
    characterData: true,
    subtree: true
  });

  new ResizeObserver(() => requestAnimationFrame(apply)).observe(viewport);
})();
