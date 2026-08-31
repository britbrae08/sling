(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const W = 390;
  const H = 690;
  const GROUND_Y = 642;
  const GRAVITY = 620;
  const MAX_PULL = 175;
  const STONE_RADIUS = 10;
  const RELEASE_CLEARANCE = 42;
  const GROUND_BOUNCE = 0.74;
  const SURFACE_BOUNCE = 0.84;
  const ROLL_RETENTION_PER_SECOND = 0.58;
  const MIN_ROLL_SPEED = 10;
  const MAX_FLIGHT_TIME = 15;

  const ui = {
    levelLabel: document.getElementById('levelLabel'),
    stonesLabel: document.getElementById('stonesLabel'),
    worldLabel: document.getElementById('worldLabel'),
    objectiveLabel: document.getElementById('objectiveLabel'),
    progressText: document.getElementById('progressText'),
    progressFill: document.getElementById('progressFill'),
    startOverlay: document.getElementById('startOverlay'),
    startButton: document.getElementById('startButton'),
    resultOverlay: document.getElementById('resultOverlay'),
    resultEyebrow: document.getElementById('resultEyebrow'),
    resultTitle: document.getElementById('resultTitle'),
    resultStars: document.getElementById('resultStars'),
    resultShots: document.getElementById('resultShots'),
    resultBest: document.getElementById('resultBest'),
    nextButton: document.getElementById('nextButton'),
    retryButton: document.getElementById('retryButton'),
    restartButton: document.getElementById('restartButton'),
    levelsButton: document.getElementById('levelsButton'),
    levelDrawer: document.getElementById('levelDrawer'),
    closeLevelsButton: document.getElementById('closeLevelsButton'),
    levelGrid: document.getElementById('levelGrid'),
    soundButton: document.getElementById('soundButton')
  };

  const verses = [
    { ref: 'John 3:16', text: 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.' },
    { ref: 'Philippians 4:13', text: 'I can do all things through Christ, who strengthens me.' },
    { ref: 'Romans 8:28', text: 'We know that all things work together for good for those who love God, to those who are called according to his purpose.' },
    { ref: 'Psalm 119:105', text: 'Your word is a lamp to my feet, and a light for my path.' },
    { ref: 'Matthew 11:28', text: 'Come to me, all you who labor and are heavily burdened, and I will give you rest.' },
    { ref: '1 Corinthians 13:13', text: 'But now faith, hope, and love remain—these three. The greatest of these is love.' },
    { ref: 'Romans 12:2', text: 'Do not be conformed to this world, but be transformed by the renewing of your mind.' },
    { ref: 'Matthew 5:16', text: 'Even so, let your light shine before men, that they may see your good works and glorify your Father who is in heaven.' },
    { ref: 'Hebrews 11:1', text: 'Now faith is assurance of things hoped for, proof of things not seen.' },
    { ref: 'Psalm 46:10', text: 'Be still, and know that I am God.' },
    { ref: 'Joshua 1:9', text: 'Be strong and courageous. Do not be afraid; neither be dismayed.' },
    { ref: 'Galatians 5:22–23', text: 'The fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faith, gentleness, and self-control.' }
  ];

  const levels = [
    {
      name: 'First Stone', world: 'Bethlehem Fields', par: 1, maxShots: 4,
      objective: 'Hit the clay jar', anchor: { x: 72, y: 548 },
      targets: [{ x: 300, y: 610, kind: 'pot' }], obstacles: []
    },
    {
      name: 'Turn Around', world: 'Bethlehem Fields', par: 1, maxShots: 4,
      objective: 'Shoot from right to left', anchor: { x: 318, y: 540 },
      targets: [{ x: 82, y: 605, kind: 'pot' }], obstacles: []
    },
    {
      name: 'Downhill', world: 'Bethlehem Fields', par: 1, maxShots: 4,
      objective: 'Drop onto the mark', anchor: { x: 68, y: 330 },
      targets: [{ x: 310, y: 548, kind: 'target' }],
      obstacles: [{ x: 260, y: 583, w: 100, h: 14, kind: 'stone' }]
    },
    {
      name: 'Crosswind', world: 'Bethlehem Fields', par: 2, maxShots: 5,
      objective: 'Clear both sides', anchor: { x: 320, y: 345 },
      targets: [{ x: 78, y: 500, kind: 'target' }, { x: 198, y: 606, kind: 'pot' }],
      obstacles: [{ x: 135, y: 545, w: 105, h: 15, kind: 'wood' }]
    },
    {
      name: 'Sky Shot', world: 'Valley Road', par: 1, maxShots: 4,
      objective: 'Send it high', anchor: { x: 195, y: 555 },
      targets: [{ x: 196, y: 240, kind: 'target' }],
      obstacles: [{ x: 155, y: 282, w: 82, h: 14, kind: 'stone' }]
    },
    {
      name: 'Across the Valley', world: 'Valley Road', par: 2, maxShots: 5,
      objective: 'Hit the spread targets', anchor: { x: 62, y: 435 },
      targets: [{ x: 300, y: 425, kind: 'target' }, { x: 340, y: 605, kind: 'pot' }],
      obstacles: [{ x: 250, y: 475, w: 18, h: 120, kind: 'stone' }]
    },
    {
      name: 'Falling Stone', world: 'Valley Road', par: 2, maxShots: 5,
      objective: 'Work from above', anchor: { x: 318, y: 225 },
      targets: [{ x: 80, y: 570, kind: 'target' }, { x: 205, y: 615, kind: 'pot' }],
      obstacles: [{ x: 130, y: 500, w: 110, h: 15, kind: 'wood' }]
    },
    {
      name: 'Side Door', world: 'Valley Road', par: 2, maxShots: 5,
      objective: 'Find an angle through', anchor: { x: 68, y: 300 },
      targets: [{ x: 322, y: 310, kind: 'target' }, { x: 322, y: 552, kind: 'target' }],
      obstacles: [{ x: 220, y: 355, w: 20, h: 205, kind: 'stone' }]
    },
    {
      name: 'Bank Shot', world: 'Valley of Elah', par: 2, maxShots: 5,
      objective: 'Use the stone wall', anchor: { x: 320, y: 555 },
      targets: [{ x: 72, y: 380, kind: 'target' }],
      obstacles: [
        { x: 145, y: 305, w: 20, h: 230, kind: 'stone' },
        { x: 145, y: 285, w: 150, h: 20, kind: 'stone' }
      ]
    },
    {
      name: 'Floor Runner', world: 'Valley of Elah', par: 2, maxShots: 5,
      objective: 'Bounce, then roll', anchor: { x: 68, y: 370 },
      targets: [{ x: 338, y: 617, kind: 'pot' }],
      obstacles: [{ x: 225, y: 525, w: 16, h: 55, kind: 'wood' }]
    },
    {
      name: 'Double Bounce', world: 'Valley of Elah', par: 3, maxShots: 6,
      objective: 'Use the surfaces', anchor: { x: 322, y: 295 },
      targets: [{ x: 72, y: 445, kind: 'target' }, { x: 210, y: 610, kind: 'pot' }],
      obstacles: [
        { x: 130, y: 520, w: 150, h: 16, kind: 'stone' },
        { x: 110, y: 365, w: 18, h: 120, kind: 'stone' }
      ]
    },
    {
      name: 'Giant Challenge', world: 'Valley of Elah', par: 2, maxShots: 4,
      objective: 'Make the impossible shot', boss: true, anchor: { x: 72, y: 560 },
      targets: [{ x: 322, y: 300, kind: 'boss' }],
      obstacles: [
        { x: 210, y: 390, w: 22, h: 210, kind: 'stone' },
        { x: 210, y: 370, w: 135, h: 20, kind: 'stone' }
      ]
    }
  ];

  const saveKey = 'slingPrototypeProgressV2';
  const progress = loadProgress();

  let levelIndex = Math.min(progress.lastLevel || 0, levels.length - 1);
  let anchor = { ...levels[levelIndex].anchor };
  let shots = 0;
  let targets = [];
  let obstacles = [];
  let particles = [];
  let dragging = false;
  let flightTime = 0;
  let restTime = 0;
  let resetTimer = null;
  let lastFrame = performance.now();
  let mode = 'ready'; // ready | dragging | flying | settling | complete | failed | verse
  let resultType = 'complete';
  let soundEnabled = true;
  let audioCtx = null;
  let groundPhysicsActive = true;
  let releaseOrigin = { ...anchor };
  let releaseStartedBelowGround = false;
  let nextLevelAfterVerse = 0;
  let lastVerseIndex = -1;

  const stone = {
    x: anchor.x,
    y: anchor.y,
    vx: 0,
    vy: 0,
    angle: 0,
    active: true,
    bounces: 0
  };

  const verseUi = createVerseOverlay();

  function createVerseOverlay() {
    const style = document.createElement('style');
    style.textContent = `
      .verse-overlay{position:absolute;inset:0;z-index:8;display:none;overflow:hidden;background:linear-gradient(180deg,rgba(239,214,156,.12),rgba(24,52,41,.28) 72%,rgba(13,30,23,.72));align-items:center;justify-content:center;padding:38px 28px 54px;text-align:center}
      .verse-overlay.visible{display:flex}
      .verse-cloud{position:absolute;width:150%;height:130px;left:-25%;top:17%;background:radial-gradient(ellipse at center,rgba(255,248,224,.33),rgba(255,248,224,0) 68%);filter:blur(8px);pointer-events:none}
      .verse-content{position:relative;width:min(100%,340px);margin-top:-72px;text-shadow:0 2px 16px rgba(42,39,28,.22)}
      .verse-text{margin:0;color:#fff7df;font-family:Georgia,'Times New Roman',serif;font-size:clamp(1.55rem,6vw,2.25rem);font-weight:700;line-height:1.18}
      .verse-ref{display:block;margin-top:18px;color:#513826;font-size:.78rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
      .verse-next{position:absolute;right:22px;bottom:28px;width:64px;height:64px;border:1px solid rgba(255,247,223,.42);border-radius:50%;background:rgba(19,39,31,.9);color:#f2d18e;font-size:2rem;font-weight:900;box-shadow:0 12px 34px rgba(0,0,0,.24);cursor:pointer}
      .verse-next:active{transform:scale(.96)}
    `;
    document.head.append(style);

    const wrap = document.createElement('div');
    wrap.className = 'verse-overlay';
    wrap.innerHTML = `
      <div class="verse-cloud"></div>
      <div class="verse-content">
        <p class="verse-text"></p>
        <span class="verse-ref"></span>
      </div>
      <button class="verse-next" type="button" aria-label="Next level">→</button>
    `;
    canvas.parentElement.append(wrap);
    return {
      wrap,
      text: wrap.querySelector('.verse-text'),
      ref: wrap.querySelector('.verse-ref'),
      next: wrap.querySelector('.verse-next')
    };
  }

  function loadProgress() {
    try {
      const previous = JSON.parse(localStorage.getItem('slingPrototypeProgressV1') || '{}');
      const raw = JSON.parse(localStorage.getItem(saveKey) || '{}');
      return {
        unlocked: Math.max(1, Number(raw.unlocked || previous.unlocked) || 1),
        bestStars: raw.bestStars || previous.bestStars || {},
        lastLevel: Number(raw.lastLevel ?? previous.lastLevel) || 0
      };
    } catch {
      return { unlocked: 1, bestStars: {}, lastLevel: 0 };
    }
  }

  function saveProgress() {
    progress.lastLevel = levelIndex;
    localStorage.setItem(saveKey, JSON.stringify(progress));
  }

  function loadLevel(index) {
    levelIndex = Math.max(0, Math.min(index, levels.length - 1));
    const level = levels[levelIndex];
    anchor = { ...level.anchor };
    shots = 0;
    targets = level.targets.map(t => ({ ...t, hit: false, flash: 0 }));
    obstacles = level.obstacles.map(o => ({ ...o }));
    particles = [];
    mode = 'ready';
    dragging = false;
    restTime = 0;
    clearTimeout(resetTimer);
    verseUi.wrap.classList.remove('visible');
    resetStone();
    ui.resultOverlay.classList.remove('visible');
    ui.levelLabel.textContent = String(levelIndex + 1);
    ui.worldLabel.textContent = level.world;
    ui.objectiveLabel.textContent = level.objective;
    ui.progressText.textContent = `${levelIndex + 1} / ${levels.length}`;
    ui.progressFill.style.width = `${((levelIndex + 1) / levels.length) * 100}%`;
    updateStones();
    renderLevelGrid();
    saveProgress();
  }

  function resetStone() {
    stone.x = anchor.x;
    stone.y = anchor.y;
    stone.vx = 0;
    stone.vy = 0;
    stone.angle = 0;
    stone.active = true;
    stone.bounces = 0;
    flightTime = 0;
    restTime = 0;
    groundPhysicsActive = true;
    releaseOrigin = { ...anchor };
    releaseStartedBelowGround = false;
    if (mode !== 'complete' && mode !== 'failed' && mode !== 'verse') mode = 'ready';
  }

  function updateStones() {
    ui.stonesLabel.textContent = String(Math.max(0, levels[levelIndex].maxShots - shots));
  }

  function pointerPos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (W / rect.width),
      y: (event.clientY - rect.top) * (H / rect.height)
    };
  }

  function onPointerDown(event) {
    if (mode !== 'ready') return;
    const p = pointerPos(event);
    if (distance(p.x, p.y, stone.x, stone.y) <= 54) {
      dragging = true;
      mode = 'dragging';
      canvas.setPointerCapture?.(event.pointerId);
      event.preventDefault();
      tone(180, 0.03, 0.025);
    }
  }

  function onPointerMove(event) {
    if (!dragging || mode !== 'dragging') return;
    const p = pointerPos(event);
    let dx = p.x - anchor.x;
    let dy = p.y - anchor.y;
    const d = Math.hypot(dx, dy);
    if (d > MAX_PULL) {
      dx = dx / d * MAX_PULL;
      dy = dy / d * MAX_PULL;
    }
    stone.x = anchor.x + dx;
    stone.y = anchor.y + dy;
    event.preventDefault();
  }

  function onPointerUp(event) {
    if (!dragging || mode !== 'dragging') return;
    dragging = false;

    const pullX = anchor.x - stone.x;
    const pullY = anchor.y - stone.y;
    const pull = Math.hypot(pullX, pullY);
    if (pull < 14) {
      resetStone();
      return;
    }

    const normalizedPower = Math.min(1, pull / MAX_PULL);
    const launchMultiplier = 6.7 + normalizedPower * 2.5;
    stone.vx = pullX * launchMultiplier;
    stone.vy = pullY * launchMultiplier;
    releaseOrigin = { x: stone.x, y: stone.y };
    releaseStartedBelowGround = releaseOrigin.y + STONE_RADIUS >= GROUND_Y;
    groundPhysicsActive = false;
    mode = 'flying';
    flightTime = 0;
    restTime = 0;
    shots += 1;
    updateStones();
    vibrate(16);
    tone(220, 0.075, 0.055, 620);
    event.preventDefault();
  }

  function update(dt) {
    updateParticles(dt);
    targets.forEach(t => { if (t.flash > 0) t.flash -= dt; });
    if (mode !== 'flying') return;

    flightTime += dt;
    const previous = { x: stone.x, y: stone.y };
    stone.vy += GRAVITY * dt;
    stone.x += stone.vx * dt;
    stone.y += stone.vy * dt;
    stone.angle += (stone.vx / STONE_RADIUS) * dt * 0.55;

    if (!groundPhysicsActive) {
      const clearedSling = distance(stone.x, stone.y, releaseOrigin.x, releaseOrigin.y) >= RELEASE_CLEARANCE;
      const emergedAboveGround = stone.y + STONE_RADIUS < GROUND_Y - 2;
      if (clearedSling && (!releaseStartedBelowGround || emergedAboveGround)) {
        groundPhysicsActive = true;
      }
    }

    for (const obstacle of obstacles) collideObstacle(stone, previous, obstacle);

    for (const target of targets) {
      if (target.hit) continue;
      const radius = target.kind === 'boss' ? 28 : target.kind === 'pot' ? 20 : 19;
      if (distance(stone.x, stone.y, target.x, target.y) < radius + STONE_RADIUS) {
        hitTarget(target);
        bounceFromCircle(stone, target.x, target.y, 0.88);
      }
    }

    if (targets.every(t => t.hit)) {
      mode = 'complete';
      stone.active = false;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(showComplete, 460);
      return;
    }

    if (groundPhysicsActive && stone.y + STONE_RADIUS >= GROUND_Y) {
      stone.y = GROUND_Y - STONE_RADIUS;
      if (stone.vy > 64) {
        stone.vy = -stone.vy * GROUND_BOUNCE;
        stone.vx *= 0.96;
        stone.bounces += 1;
        restTime = 0;
        tone(105, 0.03, 0.018);
      } else {
        stone.vy = 0;
        stone.vx *= Math.pow(ROLL_RETENTION_PER_SECOND, dt);
        if (Math.abs(stone.vx) < MIN_ROLL_SPEED) {
          stone.vx = 0;
          restTime += dt;
          if (restTime > 0.55) {
            finishShot();
            return;
          }
        } else {
          restTime = 0;
        }
      }
    } else {
      restTime = 0;
    }

    if (
      stone.x > W + 700 || stone.x < -700 ||
      stone.y > H + 700 ||
      flightTime > MAX_FLIGHT_TIME
    ) {
      finishShot();
    }
  }

  function collideObstacle(ball, previous, rect) {
    const nearestX = clamp(ball.x, rect.x, rect.x + rect.w);
    const nearestY = clamp(ball.y, rect.y, rect.y + rect.h);
    const dx = ball.x - nearestX;
    const dy = ball.y - nearestY;
    if (dx * dx + dy * dy > STONE_RADIUS * STONE_RADIUS) return;

    const cameFromLeft = previous.x + STONE_RADIUS <= rect.x;
    const cameFromRight = previous.x - STONE_RADIUS >= rect.x + rect.w;
    const cameFromTop = previous.y + STONE_RADIUS <= rect.y;
    const cameFromBottom = previous.y - STONE_RADIUS >= rect.y + rect.h;

    if (cameFromLeft) {
      ball.x = rect.x - STONE_RADIUS - 0.5;
      ball.vx = -Math.abs(ball.vx) * SURFACE_BOUNCE;
      ball.vy *= 0.98;
    } else if (cameFromRight) {
      ball.x = rect.x + rect.w + STONE_RADIUS + 0.5;
      ball.vx = Math.abs(ball.vx) * SURFACE_BOUNCE;
      ball.vy *= 0.98;
    } else if (cameFromTop) {
      ball.y = rect.y - STONE_RADIUS - 0.5;
      ball.vy = -Math.abs(ball.vy) * SURFACE_BOUNCE;
      ball.vx *= 0.98;
    } else if (cameFromBottom) {
      ball.y = rect.y + rect.h + STONE_RADIUS + 0.5;
      ball.vy = Math.abs(ball.vy) * SURFACE_BOUNCE;
      ball.vx *= 0.98;
    } else {
      ball.vx *= -0.8;
      ball.vy *= -0.8;
    }
    ball.bounces += 1;
    restTime = 0;
    tone(125, 0.025, 0.018);
  }

  function bounceFromCircle(ball, cx, cy, restitution) {
    const dx = ball.x - cx;
    const dy = ball.y - cy;
    const len = Math.max(1, Math.hypot(dx, dy));
    const nx = dx / len;
    const ny = dy / len;
    const dot = ball.vx * nx + ball.vy * ny;
    if (dot < 0) {
      ball.vx -= (1 + restitution) * dot * nx;
      ball.vy -= (1 + restitution) * dot * ny;
    }
    ball.vx *= 0.97;
    ball.vy *= 0.97;
  }

  function finishShot() {
    if (mode !== 'flying') return;
    mode = 'settling';
    stone.active = false;
    stone.vx = 0;
    stone.vy = 0;
    const remaining = levels[levelIndex].maxShots - shots;
    if (remaining <= 0) {
      mode = 'failed';
      resetTimer = setTimeout(showFailed, 400);
    } else {
      resetTimer = setTimeout(resetStone, 360);
    }
  }

  function hitTarget(target) {
    target.hit = true;
    target.flash = 0.24;
    spawnParticles(target.x, target.y, target.kind === 'boss' ? 28 : 14);
    vibrate(target.kind === 'boss' ? [20, 30, 42] : 20);
    tone(target.kind === 'boss' ? 90 : 430, 0.085, 0.07, target.kind === 'boss' ? 170 : 760);
  }

  function starsForShots(value) {
    const par = levels[levelIndex].par;
    if (value <= par) return 3;
    if (value <= par + 1) return 2;
    return 1;
  }

  function showComplete() {
    const stars = starsForShots(shots);
    const oldBest = Number(progress.bestStars[levelIndex] || 0);
    progress.bestStars[levelIndex] = Math.max(oldBest, stars);
    progress.unlocked = Math.max(progress.unlocked, Math.min(levels.length, levelIndex + 2));
    saveProgress();

    resultType = 'complete';
    ui.resultEyebrow.textContent = levels[levelIndex].boss ? 'GIANT CHALLENGE CLEARED' : 'LEVEL CLEARED';
    ui.resultTitle.textContent = stars === 3 ? 'Perfect shot.' : stars === 2 ? 'Nicely done.' : 'Target cleared.';
    ui.resultStars.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    ui.resultShots.textContent = String(shots);
    ui.resultBest.textContent = '★'.repeat(progress.bestStars[levelIndex]) + '☆'.repeat(3 - progress.bestStars[levelIndex]);
    ui.nextButton.textContent = levelIndex === levels.length - 1 ? 'CONTINUE' : 'NEXT';
    ui.resultOverlay.classList.add('visible');
    renderLevelGrid();
    tone(520, 0.08, 0.055, 780);
    setTimeout(() => tone(660, 0.08, 0.045, 940), 90);
  }

  function showFailed() {
    resultType = 'failed';
    ui.resultEyebrow.textContent = 'OUT OF STONES';
    ui.resultTitle.textContent = 'Almost.';
    ui.resultStars.textContent = '☆☆☆';
    ui.resultShots.textContent = String(shots);
    const best = Number(progress.bestStars[levelIndex] || 0);
    ui.resultBest.textContent = best ? '★'.repeat(best) + '☆'.repeat(3 - best) : '—';
    ui.nextButton.textContent = 'TRY AGAIN';
    ui.resultOverlay.classList.add('visible');
  }

  function showVerseInterlude(nextIndex) {
    ui.resultOverlay.classList.remove('visible');
    mode = 'verse';
    nextLevelAfterVerse = nextIndex;

    let pick = Math.floor(Math.random() * verses.length);
    if (verses.length > 1 && pick === lastVerseIndex) pick = (pick + 1) % verses.length;
    lastVerseIndex = pick;
    const verse = verses[pick];
    verseUi.text.textContent = `“${verse.text}”`;
    verseUi.ref.textContent = verse.ref;
    verseUi.next.textContent = levelIndex === levels.length - 1 ? '↻' : '→';
    verseUi.next.setAttribute('aria-label', levelIndex === levels.length - 1 ? 'Restart game' : 'Next level');
    verseUi.wrap.classList.add('visible');
  }

  function renderLevelGrid() {
    ui.levelGrid.replaceChildren();
    levels.forEach((level, index) => {
      const unlocked = index < progress.unlocked;
      const best = Number(progress.bestStars[index] || 0);
      const button = document.createElement('button');
      button.className = `level-button${unlocked ? '' : ' locked'}${index === levelIndex ? ' current' : ''}`;
      button.type = 'button';
      button.disabled = !unlocked;
      button.innerHTML = `<strong>${index + 1}</strong><span>${best ? '★'.repeat(best) : unlocked ? level.name : 'LOCKED'}</span>`;
      if (unlocked) {
        button.addEventListener('click', () => {
          ui.levelDrawer.classList.remove('open');
          loadLevel(index);
        });
      }
      ui.levelGrid.append(button);
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawSky();
    drawDistantHills();
    drawGround();
    drawObstacles();
    drawTargets();
    drawSling();
    if (stone.active) drawStone();
    drawParticles();
    if (levels[levelIndex].boss) drawBossAtmosphere();
  }

  function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, '#efd69c');
    gradient.addColorStop(0.46, '#dcb878');
    gradient.addColorStop(1, '#b77d48');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = 0.72;
    ctx.fillStyle = '#fff2c9';
    ctx.beginPath();
    ctx.arc(318, 84, 31, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(255,246,218,0.2)';
    ctx.beginPath();
    ctx.ellipse(120, 128, 63, 12, 0, 0, Math.PI * 2);
    ctx.ellipse(154, 148, 48, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawDistantHills() {
    ctx.fillStyle = '#82906b';
    ctx.beginPath();
    ctx.moveTo(0, 330);
    ctx.quadraticCurveTo(68, 250, 132, 326);
    ctx.quadraticCurveTo(210, 210, 294, 320);
    ctx.quadraticCurveTo(346, 264, 390, 302);
    ctx.lineTo(390, 510);
    ctx.lineTo(0, 510);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#5e7056';
    ctx.beginPath();
    ctx.moveTo(0, 407);
    ctx.quadraticCurveTo(93, 334, 180, 408);
    ctx.quadraticCurveTo(277, 325, 390, 410);
    ctx.lineTo(390, 570);
    ctx.lineTo(0, 570);
    ctx.closePath();
    ctx.fill();
  }

  function drawGround() {
    ctx.fillStyle = '#8a6840';
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = '#c39a5c';
    ctx.fillRect(0, GROUND_Y - 7, W, 7);

    ctx.strokeStyle = 'rgba(67,71,45,0.6)';
    ctx.lineWidth = 2;
    for (let x = 9; x < W; x += 24) {
      const h = 5 + ((x * 17) % 9);
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y - 6);
      ctx.lineTo(x + 3, GROUND_Y - 6 - h);
      ctx.moveTo(x + 3, GROUND_Y - 7);
      ctx.lineTo(x + 8, GROUND_Y - 12);
      ctx.stroke();
    }
  }

  function drawSling() {
    const pouch = mode === 'dragging' ? { x: stone.x, y: stone.y } : { ...anchor };
    const forkY = anchor.y - 4;

    ctx.strokeStyle = '#4b2b1e';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(anchor.x - 18, forkY);
    ctx.lineTo(pouch.x, pouch.y);
    ctx.stroke();

    ctx.strokeStyle = '#6f4429';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(anchor.x, anchor.y + 78);
    ctx.lineTo(anchor.x, anchor.y + 25);
    ctx.lineTo(anchor.x - 18, forkY - 8);
    ctx.moveTo(anchor.x, anchor.y + 25);
    ctx.lineTo(anchor.x + 18, forkY - 8);
    ctx.stroke();

    ctx.strokeStyle = '#9a6a3f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(anchor.x, anchor.y + 76);
    ctx.lineTo(anchor.x, anchor.y + 28);
    ctx.stroke();

    ctx.strokeStyle = '#3c2218';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(anchor.x + 18, forkY);
    ctx.lineTo(pouch.x, pouch.y);
    ctx.stroke();
  }

  function drawStone() {
    ctx.save();
    ctx.translate(stone.x, stone.y);
    ctx.rotate(stone.angle);
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = mode === 'flying' ? 9 : 3;
    ctx.fillStyle = '#d8d0bf';
    ctx.beginPath();
    ctx.arc(0, 0, STONE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.34)';
    ctx.beginPath();
    ctx.arc(-3, -3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,83,70,.26)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-5, 3);
    ctx.quadraticCurveTo(0, 6, 5, 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawTargets() {
    targets.forEach(target => {
      if (target.hit) {
        ctx.globalAlpha = 0.15;
        drawTarget(target);
        ctx.globalAlpha = 1;
      } else {
        drawTarget(target);
      }
    });
  }

  function drawTarget(target) {
    ctx.save();
    if (target.flash > 0) {
      ctx.shadowColor = '#fff2a6';
      ctx.shadowBlur = 22;
    }

    if (target.kind === 'pot') {
      ctx.fillStyle = '#9c5136';
      ctx.beginPath();
      ctx.moveTo(target.x - 15, target.y - 16);
      ctx.quadraticCurveTo(target.x - 20, target.y + 9, target.x - 10, target.y + 18);
      ctx.quadraticCurveTo(target.x, target.y + 24, target.x + 10, target.y + 18);
      ctx.quadraticCurveTo(target.x + 20, target.y + 9, target.x + 15, target.y - 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#cc8660';
      ctx.fillRect(target.x - 13, target.y - 21, 26, 7);
      ctx.strokeStyle = '#e4b080';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(target.x, target.y + 3, 8, 0, Math.PI * 2);
      ctx.stroke();
    } else if (target.kind === 'boss') {
      ctx.fillStyle = '#4b3728';
      roundRect(ctx, target.x - 24, target.y - 34, 48, 68, 13);
      ctx.fill();
      ctx.fillStyle = '#8b6b45';
      ctx.beginPath();
      ctx.arc(target.x, target.y - 39, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d8ad63';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(target.x, target.y - 5, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#d8ad63';
      ctx.beginPath();
      ctx.arc(target.x, target.y - 5, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#f2e3c0';
      ctx.beginPath();
      ctx.arc(target.x, target.y, 19, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#9c5136';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(target.x, target.y, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#9c5136';
      ctx.beginPath();
      ctx.arc(target.x, target.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawObstacles() {
    obstacles.forEach(o => {
      if (o.kind === 'wood') {
        ctx.fillStyle = '#785033';
        roundRect(ctx, o.x, o.y, o.w, o.h, 4);
        ctx.fill();
        ctx.strokeStyle = 'rgba(238,194,126,0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(o.x + 7, o.y + o.h / 2);
        ctx.lineTo(o.x + o.w - 7, o.y + o.h / 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#756f5d';
        roundRect(ctx, o.x, o.y, o.w, o.h, 5);
        ctx.fill();
        ctx.strokeStyle = 'rgba(245,230,192,0.2)';
        ctx.strokeRect(o.x + 2, o.y + 2, o.w - 4, o.h - 4);
      }
    });
  }

  function drawBossAtmosphere() {
    if (targets[0]?.hit) return;
    ctx.save();
    const t = targets[0] || { x: 320, y: 300 };
    const grd = ctx.createRadialGradient(t.x, t.y, 20, t.x, t.y, 125);
    grd.addColorStop(0, 'rgba(108,34,24,0.03)');
    grd.addColorStop(1, 'rgba(73,19,13,0.16)');
    ctx.fillStyle = grd;
    ctx.fillRect(Math.max(0, t.x - 120), Math.max(0, t.y - 130), 240, 270);
    ctx.restore();
  }

  function spawnParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 45 + Math.random() * 165;
      particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 30,
        life: 0.45 + Math.random() * 0.45,
        size: 2 + Math.random() * 4
      });
    }
  }

  function updateParticles(dt) {
    particles = particles.filter(p => {
      p.life -= dt;
      p.vy += 260 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      return p.life > 0;
    });
  }

  function drawParticles() {
    ctx.fillStyle = '#f4d48e';
    particles.forEach(p => {
      ctx.globalAlpha = Math.min(1, p.life * 1.5);
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1;
  }

  function loop(now) {
    const dt = Math.min(0.034, (now - lastFrame) / 1000 || 0);
    lastFrame = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function roundRect(context, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + w, y, x + w, y + h, radius);
    context.arcTo(x + w, y + h, x, y + h, radius);
    context.arcTo(x, y + h, x, y, radius);
    context.arcTo(x, y, x + w, y, radius);
    context.closePath();
  }

  function vibrate(pattern) {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  }

  function tone(startFreq, duration = 0.06, volume = 0.04, endFreq = null) {
    if (!soundEnabled) return;
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(startFreq, now);
      if (endFreq) oscillator.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.01);
    } catch {
      // Audio is enhancement only; gameplay never depends on it.
    }
  }

  canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
  canvas.addEventListener('pointermove', onPointerMove, { passive: false });
  canvas.addEventListener('pointerup', onPointerUp, { passive: false });
  canvas.addEventListener('pointercancel', onPointerUp, { passive: false });

  ui.startButton.addEventListener('click', () => {
    ui.startOverlay.classList.remove('visible');
    loadLevel(0);
    tone(330, 0.08, 0.04, 520);
  });

  ui.restartButton.addEventListener('click', () => loadLevel(levelIndex));
  ui.retryButton.addEventListener('click', () => loadLevel(levelIndex));

  ui.nextButton.addEventListener('click', () => {
    if (resultType === 'failed') {
      loadLevel(levelIndex);
      return;
    }
    showVerseInterlude(levelIndex === levels.length - 1 ? 0 : levelIndex + 1);
  });

  verseUi.next.addEventListener('click', () => loadLevel(nextLevelAfterVerse));

  ui.levelsButton.addEventListener('click', () => ui.levelDrawer.classList.add('open'));
  ui.closeLevelsButton.addEventListener('click', () => ui.levelDrawer.classList.remove('open'));

  ui.soundButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    ui.soundButton.textContent = soundEnabled ? '♪' : '×';
    ui.soundButton.setAttribute('aria-label', soundEnabled ? 'Mute sound' : 'Turn sound on');
    if (soundEnabled) tone(420, 0.06, 0.035, 620);
  });

  loadLevel(levelIndex);
  renderLevelGrid();
  requestAnimationFrame(loop);
})();