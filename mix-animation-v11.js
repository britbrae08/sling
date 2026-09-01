(() => {
  'use strict';

  const wheel = document.getElementById('letterWheel');
  const shuffleButton = document.getElementById('shuffleButton');
  if (!wheel || !shuffleButton) return;

  let beforePositions = null;
  let unlockTimer = null;

  function capturePositions() {
    beforePositions = [...wheel.querySelectorAll('.letter-btn')].map((button, index) => {
      const rect = button.getBoundingClientRect();
      return {
        letter: button.textContent.trim(),
        index,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    });
  }

  function animateToNewPositions() {
    if (!beforePositions?.length) return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const newButtons = [...wheel.querySelectorAll('.letter-btn')];
    if (!newButtons.length) return;

    const oldByLetter = new Map();
    beforePositions.forEach(item => {
      if (!oldByLetter.has(item.letter)) oldByLetter.set(item.letter, []);
      oldByLetter.get(item.letter).push(item);
    });

    wheel.classList.add('mix-in-motion');
    shuffleButton.classList.add('mix-active');
    shuffleButton.disabled = true;

    let longest = 0;

    newButtons.forEach((button, index) => {
      const rect = button.getBoundingClientRect();
      const newX = rect.left + rect.width / 2;
      const newY = rect.top + rect.height / 2;
      const queue = oldByLetter.get(button.textContent.trim()) || [];
      const old = queue.shift();
      if (!old) return;

      const dx = old.x - newX;
      const dy = old.y - newY;
      const distance = Math.hypot(dx, dy);

      // If an identical duplicate happens to map onto the same visible spot,
      // still give it a small hop so the entire mix feels alive.
      const stationary = distance < 3;
      const curveSign = index % 2 === 0 ? 1 : -1;
      const curve = Math.min(34, 16 + distance * .11) * curveSign;
      const length = Math.max(1, distance);
      const perpX = (-dy / length) * curve;
      const perpY = (dx / length) * curve;
      const delay = reduced ? 0 : index * 42;
      const duration = reduced ? 180 : 500 + Math.min(130, distance * .45);
      longest = Math.max(longest, delay + duration);

      const frames = stationary
        ? [
            { transform: 'translate(0,0) scale(1)', offset: 0 },
            { transform: `translate(0,-${10 + index * 2}px) scale(1.08)`, offset: .48 },
            { transform: 'translate(0,0) scale(1)', offset: 1 }
          ]
        : [
            { transform: `translate(${dx}px, ${dy}px) scale(.9) rotate(${curveSign * -8}deg)`, opacity: .86, offset: 0 },
            { transform: `translate(${dx * .54 + perpX}px, ${dy * .54 + perpY}px) scale(1.08) rotate(${curveSign * 5}deg)`, opacity: 1, offset: .56 },
            { transform: `translate(${dx * .12}px, ${dy * .12 - 5}px) scale(1.04) rotate(${curveSign * -2}deg)`, opacity: 1, offset: .86 },
            { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1, offset: 1 }
          ];

      button.animate(frames, {
        duration,
        delay,
        easing: 'cubic-bezier(.2,.82,.24,1.12)',
        fill: 'both'
      });
    });

    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(() => {
      wheel.classList.remove('mix-in-motion');
      shuffleButton.classList.remove('mix-active');
      shuffleButton.disabled = false;
    }, Math.max(220, longest + 40));
  }

  // Capture the old positions before the game engine handles the click.
  shuffleButton.addEventListener('click', capturePositions, true);

  // The game engine shuffles/re-renders synchronously in its own click handler.
  // This listener was loaded afterward, so the new positions are ready here.
  shuffleButton.addEventListener('click', () => {
    requestAnimationFrame(animateToNewPositions);
  });
})();
