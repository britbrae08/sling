(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const W = 390;
  const H = 690;
  const CAMERA_Y = 1.65;
  const FOV_X = Math.PI * 0.64;
  const FOV_Y = Math.PI * 0.82;
  const GRAVITY = 9.81;
  const STONE_RADIUS = 0.16;
  const MAX_POWER_PULL = 155;
  const MIN_SPEED = 18;
  const MAX_SPEED = 58;
  const AIR_DRAG = 0.9985;
  const GROUND_BOUNCE = 0.56;
  const ROLL_FRICTION = 0.987;
  const MAX_SHOT_TIME = 14;

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
    { ref: 'Psalm 119:105', text: 'Your word is a lamp to my feet, and a light for my path.' },
    { ref: 'Matthew 11:28', text: 'Come to me, all you who labor and are heavily burdened, and I will give you rest.' },
    { ref: 'Romans 12:2', text: 'Do not be conformed to this world, but be transformed by the renewing of your mind.' },
    { ref: 'Matthew 5:16', text: 'Let your light shine before men, that they may see your good works and glorify your Father who is in heaven.' },
    { ref: 'Hebrews 11:1', text: 'Now faith is assurance of things hoped for, proof of things not seen.' },
    { ref: 'Psalm 46:10', text: 'Be still, and know that I am God.' },
    { ref: 'Joshua 1:9', text: 'Be strong and courageous. Do not be afraid; neither be dismayed.' },
    { ref: 'Galatians 5:22–23', text: 'The fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faith, gentleness, and self-control.' }
  ];

  const levels = [
    { name: 'First Range', world: 'Bethlehem Range', maxShots: 4, par: 1, target: { x: 0, y: 1.5, z: 42, radius: 2.2, kind: 'gong' }, objective: 'Hit the bronze target • 42 m', startYaw: 0, startPitch: 0.24 },
    { name: 'Olive Grove', world: 'Bethlehem Range', maxShots: 4, par: 1, target: { x: -6, y: 1.6, z: 58, radius: 2.0, kind: 'gong' }, objective: 'Left target • 58 m', startYaw: -0.08, startPitch: 0.23 },
    { name: 'Long Field', world: 'Valley Road', maxShots: 5, par: 2, target: { x: 8, y: 1.8, z: 78, radius: 1.9, kind: 'gong' }, objective: 'Long target • 78 m', startYaw: 0.08, startPitch: 0.28 },
    { name: 'High Mark', world: 'Valley Road', maxShots: 5, par: 2, target: { x: -3, y: 6.8, z: 70, radius: 2.0, kind: 'shield' }, objective: 'Elevated target • 70 m', startYaw: -0.03, startPitch: 0.34 },
    { name: 'Narrow Strike', world: 'Valley Road', maxShots: 5, par: 2, target: { x: 12, y: 1.4, z: 94, radius: 1.45, kind: 'shield' }, objective: 'Small target • 94 m', startYaw: 0.12, startPitch: 0.29 },
    { name: 'Far Hill', world: 'Valley of Elah', maxShots: 5, par: 2, target: { x: -13, y: 3.8, z: 112, radius: 1.7, kind: 'gong' }, objective: 'Far hill • 112 m', startYaw: -0.12, startPitch: 0.31 },
    { name: 'Pottery Row', world: 'Valley of Elah', maxShots: 5, par: 2, target: { x: 5, y: 0.9, z: 82, radius: 1.25, kind: 'pot' }, objective: 'Break the jar • 82 m', startYaw: 0.05, startPitch: 0.22 },
    { name: 'Drop Shot', world: 'Valley of Elah', maxShots: 6, par: 3, target: { x: -9, y: 1.2, z: 128, radius: 1.6, kind: 'pot' }, objective: 'Arc it in • 128 m', startYaw: -0.06, startPitch: 0.36 },
    { name: 'Distant Shield', world: 'Judean Hills', maxShots: 6, par: 3, target: { x: 18, y: 5.4, z: 142, radius: 1.6, kind: 'shield' }, objective: 'High right • 142 m', startYaw: 0.11, startPitch: 0.34 },
    { name: 'The Valley', world: 'Valley of Elah', maxShots: 6, par: 3, target: { x: -20, y: 2.1, z: 158, radius: 1.55, kind: 'gong' }, objective: 'Master the distance • 158 m', startYaw: -0.12, startPitch: 0.38 },
    { name: 'Giant Distance', world: 'Valley of Elah', maxShots: 5, par: 2, target: { x: 8, y: 3.6, z: 176, radius: 2.4, kind: 'boss' }, objective: 'The giant target • 176 m', startYaw: 0.04, startPitch: 0.4, boss: true },
    { name: 'Impossible Shot', world: 'Valley of Elah', maxShots: 6, par: 3, target: { x: -17, y: 8.2, z: 196, radius: 1.7, kind: 'boss' }, objective: 'Final mark • 196 m', startYaw: -0.08, startPitch: 0.45, boss: true }
  ];

  const saveKey = 'slingFirstPersonProgressV1';
  const progress = loadProgress();
  let levelIndex = Math.min(progress.lastLevel || 0, levels.length - 1);
  let shots = 0;
  let mode = 'ready';
  let aimYaw = levels[levelIndex].startYaw;
  let aimPitch = levels[levelIndex].startPitch;
  let pointerMode = null;
  let lastPointer = null;
  let powerStartY = 0;
  let power = 0;
  let shotTime = 0;
  let restTime = 0;
  let resultType = 'complete';
  let soundEnabled = true;
  let audioCtx = null;
  let lastFrame = performance.now();
  let nextLevelAfterVerse = 0;
  let lastVerseIndex = -1;

  const stone = { x: 0, y: 1.25, z: 0.9, vx: 0, vy: 0, vz: 0, active: false, bounces: 0, maxHeight: 0, maxDistance: 0 };
  const verseUi = createVerseOverlay();

  function loadProgress() {
    try {
      const raw = JSON.parse(localStorage.getItem(saveKey) || '{}');
      return { unlocked: Math.max(1, Number(raw.unlocked) || 1), bestStars: raw.bestStars || {}, lastLevel: Number(raw.lastLevel) || 0 };
    } catch {
      return { unlocked: 1, bestStars: {}, lastLevel: 0 };
    }
  }

  function saveProgress() {
    progress.lastLevel = levelIndex;
    localStorage.setItem(saveKey, JSON.stringify(progress));
  }

  function createVerseOverlay() {
    const style = document.createElement('style');
    style.textContent = `.verse-overlay{position:absolute;inset:0;z-index:10;display:none;align-items:center;justify-content:center;overflow:hidden;padding:36px 28px 64px;text-align:center;background:linear-gradient(180deg,rgba(91,142,172,.10),rgba(239,214,156,.18) 48%,rgba(22,48,38,.72))}.verse-overlay.visible{display:flex}.verse-cloud{position:absolute;left:-25%;top:12%;width:150%;height:180px;background:radial-gradient(ellipse at center,rgba(255,250,235,.45),rgba(255,250,235,0) 70%);filter:blur(10px)}.verse-content{position:relative;width:min(100%,342px);margin-top:-70px;text-shadow:0 2px 18px rgba(43,37,27,.28)}.verse-text{margin:0;color:#fff9e8;font-family:Georgia,'Times New Roman',serif;font-size:clamp(1.45rem,5.8vw,2.12rem);font-weight:700;line-height:1.2}.verse-ref{display:block;margin-top:17px;color:#4e3926;font-size:.76rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.verse-next{position:absolute;right:22px;bottom:26px;width:66px;height:66px;border:1px solid rgba(255,247,223,.5);border-radius:50%;background:rgba(19,39,31,.94);color:#f2d18e;font-size:2rem;font-weight:900;box-shadow:0 12px 34px rgba(0,0,0,.24);cursor:pointer}.verse-next:active{transform:scale(.96)}`;
    document.head.append(style);
    const wrap = document.createElement('div');
    wrap.className = 'verse-overlay';
    wrap.innerHTML = `<div class="verse-cloud"></div><div class="verse-content"><p class="verse-text"></p><span class="verse-ref"></span></div><button class="verse-next" type="button" aria-label="Next level">→</button>`;
    canvas.parentElement.append(wrap);
    return { wrap, text: wrap.querySelector('.verse-text'), ref: wrap.querySelector('.verse-ref'), next: wrap.querySelector('.verse-next') };
  }

  function loadLevel(index) {
    levelIndex = Math.max(0, Math.min(index, levels.length - 1));
    const level = levels[levelIndex];
    shots = 0;
    mode = 'ready';
    pointerMode = null;
    power = 0;
    aimYaw = level.startYaw;
    aimPitch = level.startPitch;
    verseUi.wrap.classList.remove('visible');
    ui.resultOverlay.classList.remove('visible');
    resetStone();
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
    stone.x = 0; stone.y = 1.25; stone.z = 0.9; stone.vx = 0; stone.vy = 0; stone.vz = 0;
    stone.active = false; stone.bounces = 0; stone.maxHeight = stone.y; stone.maxDistance = stone.z;
    shotTime = 0; restTime = 0;
    if (!['complete', 'failed', 'verse'].includes(mode)) mode = 'ready';
  }

  function updateStones() { ui.stonesLabel.textContent = String(Math.max(0, levels[levelIndex].maxShots - shots)); }

  function pointerPos(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (W / rect.width), y: (event.clientY - rect.top) * (H / rect.height) };
  }

  function powerControlCenter() { return { x: W / 2, y: H - 86 }; }

  function onPointerDown(event) {
    if (!['ready', 'aiming'].includes(mode)) return;
    const p = pointerPos(event);
    const pc = powerControlCenter();
    if (Math.hypot(p.x - pc.x, p.y - pc.y) < 58) {
      pointerMode = 'power'; powerStartY = p.y; power = 0; mode = 'power'; canvas.setPointerCapture?.(event.pointerId); tone(185, 0.025, 0.02);
    } else {
      pointerMode = 'aim'; lastPointer = p; mode = 'aiming'; canvas.setPointerCapture?.(event.pointerId);
    }
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!pointerMode) return;
    const p = pointerPos(event);
    if (pointerMode === 'aim') {
      const dx = p.x - lastPointer.x;
      const dy = p.y - lastPointer.y;
      aimYaw = clamp(aimYaw - dx * 0.0041, -0.82, 0.82);
      aimPitch = clamp(aimPitch - dy * 0.0038, 0.02, 0.88);
      lastPointer = p;
    } else if (pointerMode === 'power') {
      const drag = Math.max(0, p.y - powerStartY);
      power = clamp(drag / MAX_POWER_PULL, 0, 1);
    }
    event.preventDefault();
  }

  function onPointerUp(event) {
    if (!pointerMode) return;
    if (pointerMode === 'power') {
      if (power >= 0.08) launchStone(power);
      else { power = 0; mode = 'ready'; }
    } else if (pointerMode === 'aim') {
      mode = 'ready';
    }
    pointerMode = null; lastPointer = null; event.preventDefault();
  }

  function launchStone(powerValue) {
    const speed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * Math.pow(powerValue, 0.82);
    const horizontal = Math.cos(aimPitch) * speed;
    stone.x = 0; stone.y = 1.25; stone.z = 0.9;
    stone.vx = Math.sin(aimYaw) * horizontal;
    stone.vy = Math.sin(aimPitch) * speed;
    stone.vz = Math.cos(aimYaw) * horizontal;
    stone.active = true; stone.bounces = 0; stone.maxHeight = stone.y; stone.maxDistance = stone.z;
    shots += 1; updateStones(); power = 0; shotTime = 0; restTime = 0; mode = 'flying';
    vibrate(18); tone(230, 0.075, 0.06, 620);
  }

  function update(dt) {
    if (!['flying', 'rolling'].includes(mode)) return;
    shotTime += dt;
    if (mode === 'flying') {
      stone.vy -= GRAVITY * dt;
      const drag = Math.pow(AIR_DRAG, dt * 60);
      stone.vx *= drag; stone.vy *= drag; stone.vz *= drag;
      stone.x += stone.vx * dt; stone.y += stone.vy * dt; stone.z += stone.vz * dt;
      stone.maxHeight = Math.max(stone.maxHeight, stone.y); stone.maxDistance = Math.max(stone.maxDistance, stone.z);
      if (checkTargetHit()) return;
      if (stone.y - STONE_RADIUS <= 0 && stone.vy < 0) {
        stone.y = STONE_RADIUS;
        const impact = Math.abs(stone.vy);
        if (impact > 2.4) {
          stone.vy = impact * GROUND_BOUNCE; stone.vx *= 0.9; stone.vz *= 0.9; stone.bounces += 1; tone(105, 0.03, 0.018);
        } else { stone.vy = 0; mode = 'rolling'; }
      }
    } else {
      const friction = Math.pow(ROLL_FRICTION, dt * 60);
      stone.vx *= friction; stone.vz *= friction;
      stone.x += stone.vx * dt; stone.z += stone.vz * dt; stone.maxDistance = Math.max(stone.maxDistance, stone.z);
      if (checkTargetHit()) return;
      const groundSpeed = Math.hypot(stone.vx, stone.vz);
      if (groundSpeed < 0.38) { restTime += dt; if (restTime > 0.45) finishShot(); } else restTime = 0;
    }
    if (stone.z < -10 || Math.abs(stone.x) > 160 || stone.z > 280 || stone.y < -10 || shotTime > MAX_SHOT_TIME) finishShot();
  }

  function checkTargetHit() {
    const t = levels[levelIndex].target;
    const dx = stone.x - t.x, dy = stone.y - t.y, dz = stone.z - t.z;
    if (dx * dx + dy * dy + dz * dz <= (t.radius + STONE_RADIUS) ** 2) {
      stone.active = false; mode = 'complete'; vibrate(t.kind === 'boss' ? [22, 30, 40] : 22);
      tone(t.kind === 'boss' ? 92 : 440, 0.1, 0.075, t.kind === 'boss' ? 170 : 820);
      setTimeout(showComplete, 430); return true;
    }
    return false;
  }

  function finishShot() {
    if (!['flying', 'rolling'].includes(mode)) return;
    stone.active = false; stone.vx = 0; stone.vy = 0; stone.vz = 0;
    const remaining = levels[levelIndex].maxShots - shots;
    if (remaining <= 0) { mode = 'failed'; setTimeout(showFailed, 350); }
    else { mode = 'ready'; power = 0; setTimeout(resetStone, 220); }
  }

  function starsForShots(value) {
    const par = levels[levelIndex].par;
    if (value <= par) return 3;
    if (value <= par + 1) return 2;
    return 1;
  }

  function showComplete() {
    const level = levels[levelIndex];
    const stars = starsForShots(shots);
    const oldBest = Number(progress.bestStars[levelIndex] || 0);
    progress.bestStars[levelIndex] = Math.max(oldBest, stars);
    progress.unlocked = Math.max(progress.unlocked, Math.min(levels.length, levelIndex + 2));
    saveProgress();
    resultType = 'complete';
    ui.resultEyebrow.textContent = level.boss ? 'GIANT RANGE CLEARED' : 'TARGET HIT';
    ui.resultTitle.textContent = stars === 3 ? 'Bullseye.' : stars === 2 ? 'Great shot.' : 'Target down.';
    ui.resultStars.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    ui.resultShots.textContent = String(shots);
    ui.resultBest.textContent = '★'.repeat(progress.bestStars[levelIndex]) + '☆'.repeat(3 - progress.bestStars[levelIndex]);
    ui.nextButton.textContent = levelIndex === levels.length - 1 ? 'CONTINUE' : 'NEXT';
    ui.resultOverlay.classList.add('visible'); renderLevelGrid();
  }

  function showFailed() {
    resultType = 'failed'; ui.resultEyebrow.textContent = 'OUT OF STONES'; ui.resultTitle.textContent = 'Adjust your shot.'; ui.resultStars.textContent = '☆☆☆'; ui.resultShots.textContent = String(shots);
    const best = Number(progress.bestStars[levelIndex] || 0);
    ui.resultBest.textContent = best ? '★'.repeat(best) + '☆'.repeat(3 - best) : '—';
    ui.nextButton.textContent = 'TRY AGAIN'; ui.resultOverlay.classList.add('visible');
  }

  function showVerseInterlude(nextIndex) {
    ui.resultOverlay.classList.remove('visible'); mode = 'verse'; nextLevelAfterVerse = nextIndex;
    let pick = Math.floor(Math.random() * verses.length);
    if (verses.length > 1 && pick === lastVerseIndex) pick = (pick + 1) % verses.length;
    lastVerseIndex = pick;
    verseUi.text.textContent = `“${verses[pick].text}”`; verseUi.ref.textContent = verses[pick].ref;
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
      button.type = 'button'; button.disabled = !unlocked;
      button.innerHTML = `<strong>${index + 1}</strong><span>${best ? '★'.repeat(best) : unlocked ? `${level.target.z}m` : 'LOCKED'}</span>`;
      if (unlocked) button.addEventListener('click', () => { ui.levelDrawer.classList.remove('open'); loadLevel(index); });
      ui.levelGrid.append(button);
    });
  }

  function projectPoint(x, y, z) {
    const dx = x, dz = z;
    if (dz <= 0.12) return null;
    const yaw = Math.atan2(dx, dz);
    const horizontalDistance = Math.hypot(dx, dz);
    const pitch = Math.atan2(y - CAMERA_Y, horizontalDistance);
    const relYaw = yaw - aimYaw;
    const relPitch = pitch - aimPitch;
    if (Math.abs(relYaw) > FOV_X * 0.72 || Math.abs(relPitch) > FOV_Y * 0.72) return null;
    return { x: W / 2 + (relYaw / FOV_X) * W, y: H * 0.46 - (relPitch / FOV_Y) * H, scale: 1 / Math.max(0.22, z * 0.018), distance: z };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawSkyAndGround(); drawRangeMarkers(); drawTarget(); drawCrosshair();
    if (stone.active) drawStone();
    drawShotStatus(); drawPowerControl();
  }

  function drawSkyAndGround() {
    const horizon = clamp(H * 0.47 + (aimPitch - 0.25) * 250, 170, 455);
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#8fb6c7'); sky.addColorStop(0.56, '#d9c795'); sky.addColorStop(1, '#e8c98a');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, horizon);
    ctx.globalAlpha = 0.72; ctx.fillStyle = '#fff1bf'; ctx.beginPath(); ctx.arc(320, 72, 30, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = '#6d805d'; ctx.beginPath(); ctx.moveTo(0, horizon + 8); ctx.quadraticCurveTo(70, horizon - 65, 150, horizon + 2); ctx.quadraticCurveTo(230, horizon - 88, 315, horizon + 5); ctx.quadraticCurveTo(355, horizon - 40, 390, horizon - 5); ctx.lineTo(390, horizon + 80); ctx.lineTo(0, horizon + 80); ctx.closePath(); ctx.fill();
    const ground = ctx.createLinearGradient(0, horizon, 0, H); ground.addColorStop(0, '#9c8c5f'); ground.addColorStop(1, '#5e6545'); ctx.fillStyle = ground; ctx.fillRect(0, horizon, W, H - horizon);
    ctx.strokeStyle = 'rgba(242,225,179,.18)'; ctx.lineWidth = 1;
    for (let i = 1; i <= 7; i++) { const t = i / 7; const y = horizon + Math.pow(t, 1.75) * (H - horizon); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(242,225,179,.13)';
    for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + i * 10, horizon); ctx.lineTo(W / 2 + i * 88, H); ctx.stroke(); }
  }

  function drawRangeMarkers() {
    const distances = [40, 80, 120, 160, 200];
    ctx.save(); ctx.font = '700 10px system-ui, sans-serif'; ctx.textAlign = 'center';
    distances.forEach(d => { const p = projectPoint(0, 0.02, d); if (!p) return; ctx.fillStyle = 'rgba(245,232,195,.72)'; ctx.fillText(`${d}m`, p.x, p.y); });
    ctx.restore();
  }

  function drawTarget() {
    const t = levels[levelIndex].target;
    const p = projectPoint(t.x, t.y, t.z);
    if (!p) { drawTargetDirectionArrow(t); return; }
    const angular = Math.atan2(t.radius, Math.max(1, t.z));
    const radiusPx = clamp((angular / FOV_Y) * H, 8, 72);
    ctx.save(); ctx.translate(p.x, p.y); ctx.shadowColor = levels[levelIndex].boss ? 'rgba(103,31,21,.35)' : 'rgba(0,0,0,.28)'; ctx.shadowBlur = 14;
    if (t.kind === 'pot') {
      const s = radiusPx / 18; ctx.scale(s, s); ctx.fillStyle = '#9c5136'; ctx.beginPath(); ctx.moveTo(-14, -17); ctx.quadraticCurveTo(-19, 5, -10, 16); ctx.quadraticCurveTo(0, 22, 10, 16); ctx.quadraticCurveTo(19, 5, 14, -17); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#d08a63'; ctx.fillRect(-12, -22, 24, 6);
    } else {
      ctx.fillStyle = t.kind === 'boss' ? '#5b2c22' : '#eadbb5'; ctx.beginPath(); ctx.arc(0, 0, radiusPx, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = t.kind === 'boss' ? '#e3b76b' : '#9b5136'; ctx.lineWidth = Math.max(3, radiusPx * 0.22); ctx.beginPath(); ctx.arc(0, 0, radiusPx * 0.62, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = t.kind === 'boss' ? '#e3b76b' : '#9b5136'; ctx.beginPath(); ctx.arc(0, 0, radiusPx * 0.19, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.save(); ctx.fillStyle = 'rgba(19,39,31,.72)'; roundRect(ctx, p.x - 42, p.y + radiusPx + 9, 84, 22, 11); ctx.fill(); ctx.fillStyle = '#f6e6bd'; ctx.font = '800 10px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(`${Math.round(t.z)} m`, p.x, p.y + radiusPx + 24); ctx.restore();
  }

  function drawTargetDirectionArrow(t) {
    const yaw = Math.atan2(t.x, t.z);
    const rel = normalizeAngle(yaw - aimYaw);
    const right = rel > 0;
    ctx.save(); ctx.fillStyle = 'rgba(19,39,31,.78)'; const x = right ? W - 44 : 44; const y = H * 0.43; ctx.beginPath(); ctx.arc(x, y, 25, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#f2d18e'; ctx.font = '900 28px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(right ? '→' : '←', x, y - 1); ctx.restore();
  }

  function drawCrosshair() {
    const cx = W / 2, cy = H * 0.46;
    ctx.save(); ctx.strokeStyle = 'rgba(255,249,230,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.moveTo(cx - 25, cy); ctx.lineTo(cx - 9, cy); ctx.moveTo(cx + 9, cy); ctx.lineTo(cx + 25, cy); ctx.moveTo(cx, cy - 25); ctx.lineTo(cx, cy - 9); ctx.moveTo(cx, cy + 9); ctx.lineTo(cx, cy + 25); ctx.stroke();
    ctx.fillStyle = 'rgba(19,39,31,.55)'; roundRect(ctx, cx - 61, cy - 54, 122, 22, 11); ctx.fill(); ctx.fillStyle = '#f7e8bf'; ctx.font = '800 10px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('SWIPE TO AIM', cx, cy - 39); ctx.restore();
  }

  function drawStone() {
    const p = projectPoint(stone.x, stone.y, stone.z);
    if (!p) {
      if (stone.y > 4) { ctx.save(); ctx.fillStyle = 'rgba(19,39,31,.72)'; roundRect(ctx, W / 2 - 72, 72, 144, 28, 14); ctx.fill(); ctx.fillStyle = '#f2d18e'; ctx.font = '800 11px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('STONE ABOVE VIEW ↑', W / 2, 90); ctx.restore(); }
      return;
    }
    const r = clamp(12 / Math.max(0.45, stone.z * 0.025), 3, 17);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.34)'; ctx.shadowBlur = 8; ctx.fillStyle = '#d8d0bf'; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.38)'; ctx.beginPath(); ctx.arc(p.x - r * 0.28, p.y - r * 0.3, Math.max(1.3, r * 0.28), 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }

  function drawShotStatus() {
    if (!['flying', 'rolling'].includes(mode)) return;
    ctx.save(); ctx.fillStyle = 'rgba(19,39,31,.73)'; roundRect(ctx, 17, 17, 138, 50, 16); ctx.fill(); ctx.fillStyle = '#f2d18e'; ctx.font = '900 11px system-ui, sans-serif'; ctx.fillText(mode === 'rolling' ? 'ROLLING' : 'IN FLIGHT', 30, 37); ctx.fillStyle = '#fff4d6'; ctx.font = '700 10px system-ui, sans-serif'; ctx.fillText(`${Math.max(0, stone.z).toFixed(0)} m  •  ${Math.max(0, stone.y).toFixed(1)} m high`, 30, 55); ctx.restore();
  }

  function drawPowerControl() {
    if (['flying', 'rolling', 'complete', 'failed', 'verse'].includes(mode)) return;
    const c = powerControlCenter();
    const pulledY = c.y + power * MAX_POWER_PULL * 0.78;
    ctx.save(); ctx.fillStyle = 'rgba(19,39,31,.78)'; ctx.beginPath(); ctx.arc(c.x, c.y, 44, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = 'rgba(242,209,142,.42)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(c.x, c.y, 44, Math.PI, Math.PI * 2); ctx.stroke();
    if (mode === 'power') { ctx.strokeStyle = '#f2d18e'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x, pulledY); ctx.stroke(); }
    ctx.fillStyle = '#d8d0bf'; ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 7; ctx.beginPath(); ctx.arc(c.x, mode === 'power' ? pulledY : c.y, 14, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = '#f7e8bf'; ctx.font = '900 10px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(mode === 'power' ? `${Math.round(power * 100)}% POWER` : 'PULL FOR POWER', c.x, c.y - 55); ctx.restore();
  }

  function loop(now) {
    const dt = Math.min(0.034, (now - lastFrame) / 1000 || 0);
    lastFrame = now; update(dt); draw(); requestAnimationFrame(loop);
  }

  function roundRect(context, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    context.beginPath(); context.moveTo(x + radius, y); context.arcTo(x + w, y, x + w, y + h, radius); context.arcTo(x + w, y + h, x, y + h, radius); context.arcTo(x, y + h, x, y, radius); context.arcTo(x, y, x + w, y, radius); context.closePath();
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function normalizeAngle(value) { while (value > Math.PI) value -= Math.PI * 2; while (value < -Math.PI) value += Math.PI * 2; return value; }
  function vibrate(pattern) { if ('vibrate' in navigator) navigator.vibrate(pattern); }

  function tone(startFreq, duration = 0.06, volume = 0.04, endFreq = null) {
    if (!soundEnabled) return;
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator(); const gain = audioCtx.createGain(); const now = audioCtx.currentTime;
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(startFreq, now); if (endFreq) oscillator.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
      gain.gain.setValueAtTime(volume, now); gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      oscillator.connect(gain); gain.connect(audioCtx.destination); oscillator.start(now); oscillator.stop(now + duration + 0.01);
    } catch {}
  }

  canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
  canvas.addEventListener('pointermove', onPointerMove, { passive: false });
  canvas.addEventListener('pointerup', onPointerUp, { passive: false });
  canvas.addEventListener('pointercancel', onPointerUp, { passive: false });

  ui.startButton.addEventListener('click', () => { ui.startOverlay.classList.remove('visible'); loadLevel(0); tone(330, 0.08, 0.04, 520); });
  ui.restartButton.addEventListener('click', () => loadLevel(levelIndex));
  ui.retryButton.addEventListener('click', () => loadLevel(levelIndex));
  ui.nextButton.addEventListener('click', () => { if (resultType === 'failed') { loadLevel(levelIndex); return; } showVerseInterlude(levelIndex === levels.length - 1 ? 0 : levelIndex + 1); });
  verseUi.next.addEventListener('click', () => loadLevel(nextLevelAfterVerse));
  ui.levelsButton.addEventListener('click', () => ui.levelDrawer.classList.add('open'));
  ui.closeLevelsButton.addEventListener('click', () => ui.levelDrawer.classList.remove('open'));
  ui.soundButton.addEventListener('click', () => { soundEnabled = !soundEnabled; ui.soundButton.textContent = soundEnabled ? '♪' : '×'; ui.soundButton.setAttribute('aria-label', soundEnabled ? 'Mute sound' : 'Turn sound on'); if (soundEnabled) tone(420, 0.06, 0.035, 620); });

  loadLevel(levelIndex);
  renderLevelGrid();
  requestAnimationFrame(loop);
})();