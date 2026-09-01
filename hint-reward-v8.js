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
    for (let i = 0; i < 10; i++) {
      const spark = document.createElement('i');
      spark.className = 'hint-impact-spark';
      spark.style.left = `${cx}px`;
      spark.style.top = `${cy}px`;
      const angle = Math.PI * 2 * i / 10 + Math.random() * .24;
      const distance = 24 + Math.random() * 24;
      spark.style.setProperty('--x', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--y', `${Math.sin(angle) * distance}px`);
      document.body.append(spark);
      setTimeout(() => spark.remove(), 650);
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
    flyer.innerHTML = `
      <div class="hint-reward-card">
        <small>BONUS WORD!</small>
        <strong>+${delta} HINT POINT${delta === 1 ? '' : 'S'}</strong>
      </div>`;

    for (let i = 0; i < 9; i++) {
      const spark = document.createElement('i');
      spark.className = 'hint-reward-spark';
      spark.style.setProperty('--angle', `${i * 40}deg`);
      spark.style.setProperty('--distance', `${42 + (i % 3) * 9}px`);
      spark.style.setProperty('--delay', `${i * 18}ms`);
      flyer.append(spark);
    }

    document.body.append(flyer);

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const animation = flyer.animate(
      reduced ? [
        { transform: 'translate(-50%,-50%) scale(.9)', opacity: 0 },
        { transform: 'translate(-50%,-60%) scale(1)', opacity: 1 },
        { transform: 'translate(-50%,-60%) scale(1)', opacity: 0 }
      ] : [
        { transform: 'translate(-50%,-42%) scale(.52)', opacity: 0 },
        { transform: 'translate(-50%,-78%) scale(1.16)', opacity: 1, offset: .20 },
        { transform: 'translate(-50%,-86%) scale(1)', opacity: 1, offset: .52 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.58)`, opacity: .92, offset: .88 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.28)`, opacity: 0 }
      ],
      { duration: reduced ? 520 : 1180, easing: 'cubic-bezier(.18,.82,.24,1)', fill: 'forwards' }
    );

    const impactDelay = reduced ? 280 : 990;
    setTimeout(() => {
      pill.classList.remove('hint-reward-hit');
      void pill.offsetWidth;
      pill.classList.add('hint-reward-hit');
      burstAtTarget(targetRect);
      setTimeout(() => pill.classList.remove('hint-reward-hit'), 800);
    }, impactDelay);

    animation.addEventListener('finish', () => flyer.remove(), { once: true });
    setTimeout(() => flyer.remove(), 1600);
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
