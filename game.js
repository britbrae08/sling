(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const W = 390;
  const H = 690;
  const GROUND_Y = 642;
  const GRAVITY = 560;
  const MAX_PULL = 112;
  const STONE_RADIUS = 10;
  const ANCHOR = { x: 72, y: 548 };

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

  const levels = [
    {
      name: 'First Stone', world: 'Bethlehem Fields', par: 1, maxShots: 4,
      objective: 'Hit the clay jar',
      targets: [{ x: 300, y: 610, kind: 'pot' }], obstacles: []
    },
    {
      name: 'Two for One', world: 'Bethlehem Fields', par: 1, maxShots: 4,
      objective: 'Clear both targets',
      targets: [{ x: 265, y: 610, kind: 'pot' }, { x: 327, y: 610, kind: 'pot' }], obstacles: []
    },
    {
      name: 'High Mark', world: 'Bethlehem Fields', par: 1, maxShots: 4,
      objective: 'Reach the high target',
      targets: [{ x: 305, y: 457, kind: 'target' }],
      obstacles: [{ x: 255, y: 492, w: 105, h: 16, kind: 'stone' }]
    },
    {
      name: 'Split Decision', world: 'Bethlehem Fields', par: 2, maxShots: 5,
      objective: 'Hit high and low',
      targets: [{ x: 235, y: 590, kind: 'pot' }, { x: 320, y: 425, kind: 'target' }],
      obstacles: [{ x: 274, y: 460, w: 90, h: 16, kind: 'wood' }]
    },
    {
      name: 'Narrow Window', world: 'Bethlehem Fields', par: 2, maxShots: 5,
      objective: 'Thread the opening',
      targets: [{ x: 325, y: 570, kind: 'target' }],
      obstacles: [
        { x: 232, y: 430, w: 18, h: 118, kind: 'stone' },
        { x: 232, y: 590, w: 18, h: 52, kind: 'stone' }
      ]
    },
    {
      name: 'Three Marks', world: 'Bethlehem Fields', par: 2, maxShots: 5,
      objective: 'Clear all three',
      targets: [
        { x: 223, y: 555, kind: 'pot' },
        { x: 292, y: 500, kind: 'target' },
        { x: 346, y: 590, kind: 'pot' }
      ],
      obstacles: [{ x: 258, y: 536, w: 70, h: 14, kind: 'wood' }]
    },
    {
      name: 'Stone Steps', world: 'Valley Road', par: 2, maxShots: 5,
      objective: 'Climb the targets',
      targets: [
        { x: 220, y: 555, kind: 'target' },
        { x: 280, y: 485, kind: 'target' },
        { x: 340, y: 415, kind: 'target' }
      ],
      obstacles: [
        { x: 190, y: 586, w: 60, h: 14, kind: 'stone' },
        { x: 250, y: 516, w: 60, h: 14, kind: 'stone' },
        { x: 310, y: 446, w: 60, h: 14, kind: 'stone' }
      ]
    },
    {
      name: 'The Gate', world: 'Valley Road', par: 2, maxShots: 5,
      objective: 'Clear the gate targets',
      targets: [{ x: 264, y: 515, kind: 'target' }, { x: 338, y: 515, kind: 'target' }],
      obstacles: [
        { x: 236, y: 545, w: 18, h: 97, kind: 'wood' },
        { x: 348, y: 545, w: 18, h: 97, kind: 'wood' },
        { x: 236, y: 530, w: 130, h: 15, kind: 'wood' }
      ]
    },
    {
      name: 'Long Shot', world: 'Valley of Elah', par: 1, maxShots: 4,
      objective: 'Make the long shot',
      targets: [{ x: 348, y: 385, kind: 'target' }],
      obstacles: [{ x: 320, y: 420, w: 62, h: 16, kind: 'stone' }]
    },
    {
      name: 'The Wall', world: 'Valley of Elah', par: 2, maxShots: 5,
      objective: 'Find a way around',
      targets: [{ x: 325, y: 595, kind: 'pot' }],
      obstacles: [{ x: 235, y: 455, w: 22, h: 187, kind: 'stone' }]
    },
    {
      name: 'Five Stones', world: 'Valley of Elah', par: 3, maxShots: 5,
      objective: 'Clear the field',
      targets: [
        { x: 205, y: 600, kind: 'pot' },
        { x: 250, y: 520, kind: 'target' },
        { x: 300, y: 600, kind: 'pot' },
        { x: 338, y: 455, kind: 'target' }
      ],
      obstacles: [{ x: 219, y: 550, w: 63, h: 13, kind: 'wood' }]
    },
    {
      name: 'Giant Challenge', world: 'Valley of Elah', par: 1, maxShots: 3,
      objective: 'One target. Make it count.',
      boss: true,
      targets: [{ x: 330, y: 335, kind: 'boss' }],
      obstacles: [{ x: 294, y: 382, w: 76, h: 18, kind: 'stone' }]
    }
  ];

  const saveKey = 'slingPrototypeProgressV1';
  const progress = loadProgress();
  let levelIndex = Math.min(progress.lastLevel || 0, levels.length - 1);
  let shots = 0;
  let targets = [];
  let obstacles = [];
  let particles = [];
  let dragging = false;
  let flightTime = 0;
  let resetTimer = null;
  let lastFrame = performance.now();
  let mode = 'ready'; // ready | dragging | flying | complete | failed
  let resultType = 'complete';
  let soundEnabled = true;
  let audioCtx = null;

  const stone = {
    x: ANCHOR.x,
    y: ANCHOR.y,
    vx: 0,
    vy: 0,
    active: true,
    bounces: 0
  };

  function loadProgress() {
    try {
      const raw = JSON.parse(localStorage.getItem(saveKey) || '{}');
      return {
        unlocked: Math.max(1, Number(raw.unlocked) || 1),
        bestStars: raw.bestStars || {},
        lastLevel: Number(raw.lastLevel) || 0
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
    shots = 0;
    targets = level.targets.map(t => ({ ...t, hit: false, flash: 0 }));
    obstacles = level.obstacles.map(o => ({ ...o }));
    particles = [];
    mode = 'ready';
    dragging = false;
    clearTimeout(resetTimer);
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
    stone.x = ANCHOR.x;
    stone.y = ANCHOR.y;
    stone.vx = 0;
    stone.vy = 0;
    stone.active = true;
    stone.bounces = 0;
    flightTime = 0;
    if (mode !== 'complete' && mode !== 'failed') mode = 'ready';
  }

  function updateStones() {
    const remaining = Math.max(0, levels[levelIndex].maxShots - shots);
    ui.stonesLabel.textContent = String(remaining);
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
    if (distance(p.x, p.y, stone.x, stone.y) <= 46) {
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
    let dx = p.x - ANCHOR.x;
    let dy = p.y - ANCHOR.y;
    const d = Math.hypot(dx, dy);
    if (d > MAX_PULL) {
      dx = dx / d * MAX_PULL;
      dy = dy / d * MAX_PULL;
    }
    // Keep the pouch mostly behind the fork so the gesture feels like a sling.
    dx = Math.min(dx, 28);
    stone.x = ANCHOR.x + dx;
    stone.y = ANCHOR.y + dy;
    event.preventDefault();
  }

  function onPointerUp(event) {
    if (!dragging || mode !== 'dragging') return;
    dragging = false;
    const pullX = ANCHOR.x - stone.x;
    const pullY = ANCHOR.y - stone.y;
    const pull = Math.hypot(pullX, pullY);

    if (pull < 16) {
      resetStone();
      return;
    }

    stone.vx = pullX * 5.25;
    stone.vy = pullY * 5.25;
    mode = 'flying';
    flightTime = 0;
    shots += 1;
    updateStones();
    vibrate(12);
    tone(250, 0.06, 0.05, 520);
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

    for (const obstacle of obstacles) {
      collideObstacle(stone, previous, obstacle);
    }

    for (const target of targets) {
      if (target.hit) continue;
      const radius = target.kind === 'boss' ? 25 : target.kind === 'pot' ? 19 : 18;
      if (distance(stone.x, stone.y, target.x, target.y) < radius + STONE_RADIUS) {
        hitTarget(target);
        const dx = stone.x - target.x;
        const dy = stone.y - target.y;
        const len = Math.max(1, Math.hypot(dx, dy));
        const nx = dx / len;
        const ny = dy / len;
        const dot = stone.vx * nx + stone.vy * ny;
        stone.vx -= 1.25 * dot * nx;
        stone.vy -= 1.25 * dot * ny;
        stone.vx *= 0.78;
        stone.vy *= 0.78;
      }
    }

    if (targets.every(t => t.hit)) {
      mode = 'complete';
      stone.active = false;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(showComplete, 520);
      return;
    }

    if (stone.y + STONE_RADIUS >= GROUND_Y) {
      stone.y = GROUND_Y - STONE_RADIUS;
      if (Math.abs(stone.vy) > 72 && stone.bounces < 3) {
        stone.vy *= -0.38;
        stone.vx *= 0.78;
        stone.bounces += 1;
        tone(110, 0.025, 0.018);
      } else {
        finishShot();
        return;
      }
    }

    if (stone.x > W + 80 || stone.x < -90 || stone.y > H + 100 || flightTime > 6.5) {
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
      ball.vx = -Math.abs(ball.vx) * 0.62;
    } else if (cameFromRight) {
      ball.x = rect.x + rect.w + STONE_RADIUS + 0.5;
      ball.vx = Math.abs(ball.vx) * 0.62;
    } else if (cameFromTop) {
      ball.y = rect.y - STONE_RADIUS - 0.5;
      ball.vy = -Math.abs(ball.vy) * 0.58;
    } else if (cameFromBottom) {
      ball.y = rect.y + rect.h + STONE_RADIUS + 0.5;
      ball.vy = Math.abs(ball.vy) * 0.58;
    } else {
      ball.vx *= -0.55;
      ball.vy *= -0.55;
    }
    tone(130, 0.025, 0.018);
  }

  function finishShot() {
    if (mode !== 'flying') return;
    mode = 'ready';
    stone.active = false;
    const remaining = levels[levelIndex].maxShots - shots;
    if (remaining <= 0) {
      mode = 'failed';
      resetTimer = setTimeout(showFailed, 450);
    } else {
      resetTimer = setTimeout(resetStone, 420);
    }
  }

  function hitTarget(target) {
    target.hit = true;
    target.flash = 0.22;
    spawnParticles(target.x, target.y, target.kind === 'boss' ? 24 : 12);
    vibrate(target.kind === 'boss' ? [18, 35, 35] : 18);
    tone(target.kind === 'boss' ? 90 : 420, 0.08, 0.065, target.kind === 'boss' ? 160 : 720);
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
    ui.nextButton.textContent = levelIndex === levels.length - 1 ? 'PLAY AGAIN' : 'NEXT LEVEL';
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
    if (mode === 'dragging') drawAimGuide();
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
    // Back band
    ctx.strokeStyle = '#4b2b1e';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(54, 545);
    ctx.lineTo(stone.x, stone.y);
    ctx.stroke();

    // Fork
    ctx.strokeStyle = '#6f4429';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(70, 632);
    ctx.lineTo(70, 570);
    ctx.lineTo(53, 535);
    ctx.moveTo(70, 570);
    ctx.lineTo(91, 535);
    ctx.stroke();

    ctx.strokeStyle = '#9a6a3f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(70, 630);
    ctx.lineTo(70, 574);
    ctx.stroke();

    // Front band
    ctx.strokeStyle = '#3c2218';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(91, 545);
    ctx.lineTo(stone.x, stone.y);
    ctx.stroke();
  }

  function drawAimGuide() {
    const pullX = ANCHOR.x - stone.x;
    const pullY = ANCHOR.y - stone.y;
    let x = stone.x;
    let y = stone.y;
    let vx = pullX * 5.25;
    let vy = pullY * 5.25;
    const step = 0.09;

    for (let i = 0; i < 18; i++) {
      vy += GRAVITY * step;
      x += vx * step;
      y += vy * step;
      if (y > GROUND_Y || x > W) break;
      ctx.globalAlpha = Math.max(0.08, 0.68 - i * 0.035);
      ctx.fillStyle = '#fff5d7';
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1.5, 4 - i * 0.12), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const power = Math.min(1, Math.hypot(pullX, pullY) / MAX_PULL);
    ctx.fillStyle = 'rgba(19,39,31,0.52)';
    roundRect(ctx, 24, 25, 116, 26, 13);
    ctx.fill();
    ctx.fillStyle = '#f2d18e';
    ctx.fillRect(35, 35, 94 * power, 6);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(35, 35, 94, 6);
  }

  function drawStone() {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = mode === 'flying' ? 10 : 3;
    ctx.fillStyle = '#d8d0bf';
    ctx.beginPath();
    ctx.arc(stone.x, stone.y, STONE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.32)';
    ctx.beginPath();
    ctx.arc(stone.x - 3, stone.y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawTargets() {
    targets.forEach(target => {
      if (target.hit) {
        ctx.globalAlpha = 0.16;
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
    const grd = ctx.createRadialGradient(330, 340, 20, 330, 340, 125);
    grd.addColorStop(0, 'rgba(108,34,24,0.03)');
    grd.addColorStop(1, 'rgba(73,19,13,0.16)');
    ctx.fillStyle = grd;
    ctx.fillRect(210, 210, 180, 270);
    ctx.restore();
  }

  function spawnParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 45 + Math.random() * 150;
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
    loadLevel(levelIndex === levels.length - 1 ? 0 : levelIndex + 1);
  });

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
