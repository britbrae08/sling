(() => {
  'use strict';

  const countEl = document.getElementById('bonusCount');
  const pill = countEl?.closest('.bonus-pill');
  const readout = document.getElementById('wordReadout');
  const wheel = document.getElementById('letterWheel');
  const startButton = document.getElementById('startButton');

  if (!countEl || !pill) return;

  let armed = false;
  let lastCount = Number(countEl.textContent) || 0;

  startButton?.addEventListener('click', () => {
    // Give the game engine time to restore any saved balance first so only
    // points earned after Play trigger the celebration.
    setTimeout(() => {
      lastCount = Number(countEl.textContent) || 0;
      armed = true;
    }, 700);
  });

  function burstAtTarget(rect) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 12; i++) {
      const spark = document.createElement('i');
      spark.className = 'hint-impact-spark';
      spark.style.left = `${cx}px`;
      spark.style.top = `${cy}px`;
      const angle = Math.PI * 2 * i / 12 + Math.random() * .2;
      const distance = 26 + Math.random() * 30;
      spark.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
      document.body.append(spark);
      setTimeout(() => spark.remove(), 700);
    }
  }

  function celebrateIncrease(delta) {
    const sourceRect = (readout || wheel || pill).getBoundingClientRect();
    const targetRect = pill.getBoundingClientRect();
    const sourceX = sourceRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top + sourceRect.height / 2;
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;

    const flyer = document.createElement('div');
    flyer.className = 'hint-reward-flyer';
    flyer.style.left = `${sourceX}px`;
    flyer.style.top = `${sourceY}px`;
    flyer.setAttribute('aria-hidden', 'true');
    flyer.innerHTML = `
      <div class="hint-reward-token">
        <span>+${delta}</span>
        <i>✦</i>
      </div>`;

    for (let i = 0; i < 12; i++) {
      const spark = document.createElement('i');
      spark.className = 'hint-reward-spark';
      spark.style.setProperty('--angle', `${i * 30}deg`);
      spark.style.setProperty('--distance', `${46 + (i % 4) * 8}px`);
      spark.style.setProperty('--delay', `${i * 16}ms`);
      flyer.append(spark);
    }

    document.body.append(flyer);

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const animation = flyer.animate(
      reduced ? [
        { transform: 'translate(-50%,-50%) scale(.8)', opacity: 0 },
        { transform: 'translate(-50%,-58%) scale(1)', opacity: 1 },
        { transform: 'translate(-50%,-58%) scale(1)', opacity: 0 }
      ] : [
        { transform: 'translate(-50%,-40%) scale(.42) rotate(-12deg)', opacity: 0 },
        { transform: 'translate(-50%,-78%) scale(1.24) rotate(5deg)', opacity: 1, offset: .20 },
        { transform: 'translate(-50%,-88%) scale(1) rotate(-2deg)', opacity: 1, offset: .50 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.56) rotate(12deg)`, opacity: .95, offset: .88 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.2) rotate(20deg)`, opacity: 0 }
      ],
      { duration: reduced ? 480 : 1120, easing: 'cubic-bezier(.18,.82,.24,1)', fill: 'forwards' }
    );

    const impactDelay = reduced ? 250 : 940;
    setTimeout(() => {
      pill.classList.remove('hint-reward-hit');
      void pill.offsetWidth;
      pill.classList.add('hint-reward-hit');
      burstAtTarget(targetRect);
      setTimeout(() => pill.classList.remove('hint-reward-hit'), 820);
    }, impactDelay);

    animation.addEventListener('finish', () => flyer.remove(), { once: true });
    setTimeout(() => flyer.remove(), 1500);
  }

  const observer = new MutationObserver(() => {
    const nextCount = Number(countEl.textContent) || 0;
    if (!armed) {
      lastCount = nextCount;
      return;
    }

    if (nextCount > lastCount) celebrateIncrease(nextCount - lastCount);
    lastCount = nextCount;
  });

  observer.observe(countEl, { childList: true, characterData: true, subtree: true });
})();
