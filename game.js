(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const W = 390;
  const H = 690;
  const CAMERA_START_Y = 1.65;
  const FOV_X = Math.PI * 0.72;
  const FOV_Y = Math.PI * 0.88;
  const GRAVITY = 9.81;
  const STONE_RADIUS = 0.16;
  const MAX_POWER_PULL = 118;
  const MIN_SPEED = 17;
  const MAX_SPEED = 61;
  const AIR_DRAG_PER_SECOND = 0.985;
  const GROUND_BOUNCE = 0.48;
  const ROLL_RETENTION_PER_SECOND = 0.72;
  const MAX_SHOT_TIME = 18;

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
    {
      name: 'First Range', world: 'Bethlehem Range', maxShots: 4, par: 1,
      objective: 'Hit the target • 42 m', startYaw: 0.12, startPitch: 0.20,
      targets: [{ x: -7, y: 1.7, z: 42, radius: 2.3, kind: 'gong' }]
    },
    {
      name: 'Two Marks', world: 'Bethlehem Range', maxShots: 5, par: 2,
      objective: 'Clear 2 targets', startYaw: -0.08, startPitch: 0.20,
      targets: [
        { x: 11, y: 1.6, z: 48, radius: 2.1, kind: 'gong' },
        { x: -13, y: 4.4, z: 62, radius: 2.0, kind: 'shield' }
      ]
    },
    {
      name: 'Near and Far', world: 'Olive Grove', maxShots: 6, par: 2,
      objective: 'Clear 2 distances', startYaw: 0.06, startPitch: 0.22,
      targets: [
        { x: -16, y: 1.5, z: 38, radius: 2.1, kind: 'pot' },
        { x: 15, y: 2.2, z: 82, radius: 2.0, kind: 'gong' }
      ]
    },
    {
      name: 'High and Low', world: 'Valley Road', maxShots: 6, par: 2,
      objective: 'Clear high + low', startYaw: -0.02, startPitch: 0.26,
      targets: [
        { x: 13, y: 7.6, z: 66, radius: 2.0, kind: 'shield' },
        { x: -17, y: 1.0, z: 74, radius: 1.8, kind: 'pot' }
      ]
    },
    {
      name: 'Three Across', world: 'Valley Road', maxShots: 7, par: 3,
      objective: 'Clear 3 targets', startYaw: 0.0, startPitch: 0.24,
      targets: [
        { x: -22, y: 2.0, z: 76, radius: 1.8, kind: 'gong' },
        { x: 5, y: 5.6, z: 88, radius: 1.7, kind: 'shield' },
        { x: 25, y: 1.4, z: 96, radius: 1.9, kind: 'gong' }
      ]
    },
    {
      name: 'Depth Test', world: 'Valley of Elah', maxShots: 8, par: 3,
      objective: 'Clear 3 distances', startYaw: 0.10, startPitch: 0.26,
      targets: [
        { x: 18, y: 1.3, z: 52, radius: 1.8, kind: 'pot' },
        { x: -12, y: 3.8, z: 104, radius: 1.8, kind: 'shield' },
        { x: 25, y: 2.0, z: 132, radius: 2.0, kind: 'gong' }
      ]
    },
    {
      name: 'Pottery Row', world: 'Valley of Elah', maxShots: 7, par: 3,
      objective: 'Break 3 jars', startYaw: -0.12, startPitch: 0.20,
      targets: [
        { x: -19, y: 0.9, z: 58, radius: 1.55, kind: 'pot' },
        { x: 2, y: 1.0, z: 72, radius: 1.45, kind: 'pot' },
        { x: 21, y: 1.0, z: 87, radius: 1.5, kind: 'pot' }
      ]
    },
    {
      name: 'Corner Shots', world: 'Judean Hills', maxShots: 8, par: 3,
      objective: 'Find all 3 marks', startYaw: 0.0, startPitch: 0.30,
      targets: [
        { x: -26, y: 6.8, z: 92, radius: 1.75, kind: 'shield' },
        { x: 27, y: 5.4, z: 116, radius: 1.75, kind: 'shield' },
        { x: -8, y: 1.5, z: 138, radius: 1.9, kind: 'gong' }
      ]
    },
    {
      name: 'Four Winds', world: 'Judean Hills', maxShots: 10, par: 4,
      objective: 'Clear 4 targets', startYaw: 0.08, startPitch: 0.28,
      targets: [
        { x: -30, y: 2.0, z: 74, radius: 1.75, kind: 'gong' },
        { x: 26, y: 2.2, z: 84, radius: 1.75, kind: 'gong' },
        { x: -18, y: 7.2, z: 108, radius: 1.7, kind: 'shield' },
        { x: 20, y: 6.4, z: 126, radius: 1.7, kind: 'shield' }
      ]
    },
    {
      name: 'Long Range', world: 'Valley of Elah', maxShots: 8, par: 3,
      objective: 'Clear the far line', startYaw: -0.08, startPitch: 0.36,
      targets: [
        { x: -26, y: 2.0, z: 146, radius: 1.9, kind: 'gong' },
        { x: 8, y: 4.6, z: 162, radius: 1.85, kind: 'shield' },
        { x: 29, y: 2.3, z: 178, radius: 2.0, kind: 'gong' }
      ]
    },
    {
      name: 'Giant Range', world: 'Valley of Elah', maxShots: 8, par: 3, boss: true,
      objective: 'Clear the giant range', startYaw: 0.04, startPitch: 0.40,
      targets: [
        { x: -22, y: 3.0, z: 148, radius: 2.0, kind: 'gong' },
        { x: 24, y: 4.4, z: 172, radius: 2.1, kind: 'shield' },
        { x: 5, y: 5.2, z: 192, radius: 3.0, kind: 'boss' }
      ]
    },
    {
      name: 'Master Range', world: 'Valley of Elah', maxShots: 11, par: 4, boss: true,
      objective: 'Clear all 4 final marks', startYaw: -0.06, startPitch: 0.42,
      targets: [
        { x: -31, y: 7.8, z: 142, radius: 1.8, kind: 'shield' },
        { x: 30, y: 1.8, z: 160, radius: 1.8, kind: 'gong' },
        { x: -17, y: 2.0, z: 185, radius: 1.75, kind: 'gong' },
        { x: 17, y: 8.6, z: 205, radius: 2.6, kind: 'boss' }
      ]
    }
  ];

  const scenery = [
    { x: -18, z: 25, type: 'tree' }, { x: 20, z: 31, type: 'rock' }, { x: -31, z: 46, type: 'tree' },
    { x: 28, z: 58, type: 'tree' }, { x: -12, z: 73, type: 'rock' }, { x: 35, z: 88, type: 'tree' },
    { x: -39, z: 102, type: 'tree' }, { x: 17, z: 118, type: 'rock' }, { x: -25, z: 136, type: 'tree' },
    { x: 33, z: 154, type: 'tree' }, { x: -9, z: 174, type: 'rock' }, { x: 26, z: 194, type: 'tree' },
    { x: -34, z: 218, type: 'tree' }, { x: 11, z: 238, type: 'rock' }
  ];

  const saveKey = 'slingMultiTargetProgressV1';
  const progress = loadProgress();
  let levelIndex = Math.min(progress.lastLevel || 0, levels.length - 1);
  let targets = [];
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
  let lastLanding = null;
  let hitMessage = '';
  let hitMessageUntil = 0;

  const camera = { x: 0, y: CAMERA_START_Y, z: 0, yaw: 0, pitch: 0.22 };
  const stone = { x: 0, y: 1.25, z: 0.9, vx: 0, vy: 0, vz: 0, active: false, bounces: 0 };
  const verseUi = createVerseOverlay();

  function loadProgress() {
    try {
      const previous = JSON.parse(localStorage.getItem('slingFirstPersonProgressV2') || '{}');
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
    targets = level.targets.map((target, i) => ({ ...target, id: i, hit: false }));
    shots = 0;
    mode = 'ready';
    pointerMode = null;
    power = 0;
    aimYaw = level.startYaw;
    aimPitch = level.startPitch;
    lastLanding = null;
    hitMessage = '';
    verseUi.wrap.classList.remove('visible');
    ui.resultOverlay.classList.remove('visible');
    resetStone();
    resetCameraToAim();
    updateHud();
    renderLevelGrid();
    saveProgress();
  }

  function updateHud() {
    const remainingTargets = targets.filter(t => !t.hit).length;
    ui.levelLabel.textContent = String(levelIndex + 1);
    ui.worldLabel.textContent = levels[levelIndex].world;
    ui.objectiveLabel.textContent = remainingTargets > 0
      ? `${levels[levelIndex].objective} • ${remainingTargets} left`
      : levels[levelIndex].objective;
    ui.progressText.textContent = `${levelIndex + 1} / ${levels.length}`;
    ui.progressFill.style.width = `${((levelIndex + 1) / levels.length) * 100}%`;
    updateStones();
  }

  function resetStone() {
    stone.x = 0; stone.y = 1.25; stone.z = 0.9;
    stone.vx = 0; stone.vy = 0; stone.vz = 0;
    stone.active = false; stone.bounces = 0;
    shotTime = 0; restTime = 0;
    if (!['complete', 'failed', 'verse', 'targetHit'].includes(mode)) mode = 'ready';
  }

  function resetCameraToAim() {
    camera.x = 0; camera.y = CAMERA_START_Y; camera.z = 0;
    camera.yaw = aimYaw; camera.pitch = aimPitch;
  }

  function updateStones() {
    ui.stonesLabel.textContent = String(Math.max(0, levels[levelIndex].maxShots - shots));
  }

  function pointerPos(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (W / rect.width), y: (event.clientY - rect.top) * (H / rect.height) };
  }

  function powerControlCenter() {
    return { x: W / 2, y: H - 164 };
  }

  function onPointerDown(event) {
    if (!['ready', 'aiming'].includes(mode)) return;
    const p = pointerPos(event);
    const pc = powerControlCenter();
    if (Math.hypot(p.x - pc.x, p.y - pc.y) < 60) {
      pointerMode = 'power';
      powerStartY = p.y;
      power = 0;
      mode = 'power';
      canvas.setPointerCapture?.(event.pointerId);
      tone(185, 0.025, 0.02);
    } else {
      pointerMode = 'aim';
      lastPointer = p;
      mode = 'aiming';
      canvas.setPointerCapture?.(event.pointerId);
    }
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!pointerMode) return;
    const p = pointerPos(event);
    if (pointerMode === 'aim') {
      const dx = p.x - lastPointer.x;
      const dy = p.y - lastPointer.y;
      aimYaw = normalizeAngle(aimYaw - dx * 0.0062);
      aimPitch = clamp(aimPitch - dy * 0.0054, -0.12, 1.18);
      camera.yaw = aimYaw;
      camera.pitch = aimPitch;
      lastPointer = p;
    } else {
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
    } else {
      mode = 'ready';
    }
    pointerMode = null;
    lastPointer = null;
    event.preventDefault();
  }

  function launchStone(powerValue) {
    const speed = MIN_SPEED + (MAX_SPEED - MIN_SPEED) * Math.pow(powerValue, 0.88);
    const horizontal = Math.cos(aimPitch) * speed;
    stone.x = 0; stone.y = 1.25; stone.z = 0.9;
    stone.vx = Math.sin(aimYaw) * horizontal;
    stone.vy = Math.sin(aimPitch) * speed;
    stone.vz = Math.cos(aimYaw) * horizontal;
    stone.active = true;
    stone.bounces = 0;
    shots += 1;
    updateHud();
    power = 0;
    shotTime = 0;
    restTime = 0;
    mode = 'flying';
    setupFollowCamera();
    vibrate(18);
    tone(230, 0.075, 0.06, 620);
  }

  function update(dt) {
    if (!['flying', 'rolling'].includes(mode)) return;
    shotTime += dt;
    const previous = { x: stone.x, y: stone.y, z: stone.z };

    if (mode === 'flying') {
      stone.vy -= GRAVITY * dt;
      const drag = Math.pow(AIR_DRAG_PER_SECOND, dt);
      stone.vx *= drag; stone.vy *= drag; stone.vz *= drag;
      stone.x += stone.vx * dt;
      stone.y += stone.vy * dt;
      stone.z += stone.vz * dt;

      const hit = checkTargetHit(previous);
      if (hit) {
        handleTargetHit(hit);
        return;
      }

      if (stone.y - STONE_RADIUS <= 0 && stone.vy < 0) {
        stone.y = STONE_RADIUS;
        const impact = Math.abs(stone.vy);
        if (impact > 3.1) {
          stone.vy = impact * GROUND_BOUNCE;
          stone.vx *= 0.88;
          stone.vz *= 0.88;
          stone.bounces += 1;
          tone(105, 0.03, 0.018);
        } else {
          stone.vy = 0;
          mode = 'rolling';
        }
      }
    } else {
      const retention = Math.pow(ROLL_RETENTION_PER_SECOND, dt);
      stone.vx *= retention;
      stone.vz *= retention;
      stone.x += stone.vx * dt;
      stone.z += stone.vz * dt;

      const hit = checkTargetHit(previous);
      if (hit) {
        handleTargetHit(hit);
        return;
      }

      const speed = Math.hypot(stone.vx, stone.vz);
      if (speed < 0.28) {
        restTime += dt;
        if (restTime > 0.55) finishShot();
      } else {
        restTime = 0;
      }
    }

    updateFollowCamera(dt);

    if (horizontalDistance(stone.x, stone.z) > 350 || stone.y < -10 || shotTime > MAX_SHOT_TIME) {
      finishShot();
    }
  }

  function checkTargetHit(previous) {
    let best = null;
    let bestDistance = Infinity;

    for (const target of targets) {
      if (target.hit) continue;

      const hitRadius = target.radius * 1.08 + STONE_RADIUS;
      const distanceSq = segmentSphereDistanceSquared(previous, stone, target);
      if (distanceSq <= hitRadius * hitRadius && distanceSq < bestDistance) {
        best = target;
        bestDistance = distanceSq;
      }
    }

    if (!best) return null;
    const centerDistance = Math.sqrt(bestDistance);
    const quality = centerDistance <= best.radius * 0.28 ? 'BULLSEYE' : centerDistance <= best.radius * 0.7 ? 'SOLID HIT' : 'EDGE HIT';
    return { target: best, quality };
  }

  function handleTargetHit(hit) {
    hit.target.hit = true;
    hitMessage = hit.quality;
    hitMessageUntil = performance.now() + 900;
    stone.active = false;
    mode = 'targetHit';
    vibrate(hit.target.kind === 'boss' ? [22, 30, 40] : 22);
    tone(hit.target.kind === 'boss' ? 92 : 440, 0.1, 0.075, hit.target.kind === 'boss' ? 170 : 820);
    updateHud();

    if (targets.every(target => target.hit)) {
      mode = 'complete';
      setTimeout(showComplete, 520);
      return;
    }

    setTimeout(() => {
      mode = 'ready';
      resetStone();
      resetCameraToAim();
    }, 520);
  }

  function segmentSphereDistanceSquared(a, b, c) {
    const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z;
    const acx = c.x - a.x, acy = c.y - a.y, acz = c.z - a.z;
    const len2 = abx * abx + aby * aby + abz * abz;
    const t = len2 > 0 ? clamp((acx * abx + acy * aby + acz * abz) / len2, 0, 1) : 0;
    const px = a.x + abx * t, py = a.y + aby * t, pz = a.z + abz * t;
    const dx = px - c.x, dy = py - c.y, dz = pz - c.z;
    return dx * dx + dy * dy + dz * dz;
  }

  function setupFollowCamera() {
    const speed = Math.max(0.1, Math.hypot(stone.vx, stone.vz));
    const dx = stone.vx / speed;
    const dz = stone.vz / speed;
    camera.x = stone.x - dx * 4.5;
    camera.y = Math.max(1.4, stone.y + 1.8);
    camera.z = stone.z - dz * 4.5;
    aimCameraAtStone(0.18);
  }

  function updateFollowCamera(dt) {
    if (!['flying', 'rolling'].includes(mode)) return;
    const speed = Math.max(0.1, Math.hypot(stone.vx, stone.vz));
    const dx = stone.vx / speed;
    const dz = stone.vz / speed;
    const trail = mode === 'rolling' ? 5.5 : 4.8;
    const targetX = stone.x - dx * trail;
    const targetZ = stone.z - dz * trail;
    const targetY = mode === 'rolling' ? 2.4 : Math.max(1.8, stone.y + 2.0);
    const follow = 1 - Math.exp(-5.5 * dt);
    camera.x += (targetX - camera.x) * follow;
    camera.y += (targetY - camera.y) * follow;
    camera.z += (targetZ - camera.z) * follow;
    aimCameraAtStone(mode === 'rolling' ? 0.08 : 0.22);
  }

  function aimCameraAtStone(leadSeconds) {
    const lookX = stone.x + stone.vx * leadSeconds;
    const lookY = stone.y + stone.vy * leadSeconds * 0.35;
    const lookZ = stone.z + stone.vz * leadSeconds;
    const dx = lookX - camera.x;
    const dy = lookY - camera.y;
    const dz = lookZ - camera.z;
    camera.yaw = Math.atan2(dx, dz);
    camera.pitch = Math.atan2(dy, Math.max(0.01, Math.hypot(dx, dz)));
  }

  function finishShot() {
    if (!['flying', 'rolling'].includes(mode)) return;
    lastLanding = { x: stone.x, z: stone.z };
    stone.active = false;
    stone.vx = 0; stone.vy = 0; stone.vz = 0;
    const remaining = levels[levelIndex].maxShots - shots;
    if (remaining <= 0) {
      mode = 'failed';
      setTimeout(showFailed, 420);
    } else {
      mode = 'ready';
      power = 0;
      resetStone();
      resetCameraToAim();
    }
  }

  function starsForShots(value) {
    const par = levels[levelIndex].par;
    if (value <= par) return 3;
    if (value <= par + 2) return 2;
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
    ui.resultEyebrow.textContent = level.boss ? 'RANGE CLEARED' : 'ALL TARGETS HIT';
    ui.resultTitle.textContent = stars === 3 ? 'Sharpshooter.' : stars === 2 ? 'Great shooting.' : 'Range cleared.';
    ui.resultStars.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
    ui.resultShots.textContent = String(shots);
    ui.resultBest.textContent = '★'.repeat(progress.bestStars[levelIndex]) + '☆'.repeat(3 - progress.bestStars[levelIndex]);
    ui.nextButton.textContent = levelIndex === levels.length - 1 ? 'CONTINUE' : 'NEXT';
    ui.resultOverlay.classList.add('visible');
    renderLevelGrid();
  }

  function showFailed() {
    resultType = 'failed';
    ui.resultEyebrow.textContent = 'OUT OF STONES';
    ui.resultTitle.textContent = `${targets.filter(target => target.hit).length} of ${targets.length} targets hit`;
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
    verseUi.text.textContent = `“${verses[pick].text}”`;
    verseUi.ref.textContent = verses[pick].ref;
    verseUi.next.textContent = levelIndex === levels.length - 1 ? '↻' : '→';
    verseUi.next.setAttribute('aria-label', levelIndex === levels.length - 1 ? 'Restart game' : 'Next level');
    verseUi.wrap.classList.add('visible');
  }

  function renderLevelGrid() {
    ui.levelGrid.replaceChildren();
    levels.forEach((level, index) => {
      const unlocked = index < progress.unlocked;
      const best = Number(progress.bestStars[index] || 0);
      const distances = level.targets.map(target => target.z);
      const label = distances.length > 1 ? `${level.targets.length} targets` : `${Math.round(distances[0])}m`;
      const button = document.createElement('button');
      button.className = `level-button${unlocked ? '' : ' locked'}${index === levelIndex ? ' current' : ''}`;
      button.type = 'button';
      button.disabled = !unlocked;
      button.innerHTML = `<strong>${index + 1}</strong><span>${best ? '★'.repeat(best) : unlocked ? label : 'LOCKED'}</span>`;
      if (unlocked) button.addEventListener('click', () => {
        ui.levelDrawer.classList.remove('open');
        loadLevel(index);
      });
      ui.levelGrid.append(button);
    });
  }

  function projectWorld(x, y, z) {
    const dx = x - camera.x;
    const dy = y - camera.y;
    const dz = z - camera.z;

    const sinY = Math.sin(camera.yaw);
    const cosY = Math.cos(camera.yaw);
    const right = dx * cosY - dz * sinY;
    const forward0 = dx * sinY + dz * cosY;

    const sinP = Math.sin(camera.pitch);
    const cosP = Math.cos(camera.pitch);
    const up = dy * cosP - forward0 * sinP;
    const forward = dy * sinP + forward0 * cosP;

    if (forward <= 0.08) return null;
    const nx = right / (forward * Math.tan(FOV_X / 2));
    const ny = up / (forward * Math.tan(FOV_Y / 2));
    if (Math.abs(nx) > 1.35 || Math.abs(ny) > 1.35) return null;
    return { x: W * 0.5 + nx * W * 0.5, y: H * 0.46 - ny * H * 0.5, depth: forward };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawSkyAndGround();
    drawScenery();
    drawRangeMarkers();
    drawLandingMarker();
    drawTargets();
    if (stone.active) drawStone();
    if (!['flying', 'rolling', 'targetHit'].includes(mode)) drawCrosshair();
    drawShotStatus();
    drawHitMessage();
    drawPowerControl();
  }

  function drawSkyAndGround() {
    const horizon = clamp(H * 0.47 + camera.pitch * 255, 120, 535);
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#78a9c4');
    sky.addColorStop(0.58, '#d6c696');
    sky.addColorStop(1, '#edcc8c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, horizon);

    ctx.globalAlpha = 0.72;
    ctx.fillStyle = '#fff1bf';
    ctx.beginPath();
    ctx.arc(318, 72, 29, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#6c805d';
    ctx.beginPath();
    ctx.moveTo(0, horizon + 9);
    ctx.quadraticCurveTo(80, horizon - 58, 155, horizon + 3);
    ctx.quadraticCurveTo(235, horizon - 80, 316, horizon + 5);
    ctx.quadraticCurveTo(355, horizon - 36, 390, horizon - 4);
    ctx.lineTo(390, horizon + 78);
    ctx.lineTo(0, horizon + 78);
    ctx.closePath();
    ctx.fill();

    const ground = ctx.createLinearGradient(0, horizon, 0, H);
    ground.addColorStop(0, '#a19062');
    ground.addColorStop(1, '#566044');
    ctx.fillStyle = ground;
    ctx.fillRect(0, horizon, W, H - horizon);
    drawWorldGrid();
  }

  function drawWorldGrid() {
    ctx.save();
    ctx.strokeStyle = 'rgba(244,226,177,.16)';
    ctx.lineWidth = 1;
    for (let z = Math.max(10, Math.floor(camera.z / 20) * 20); z <= camera.z + 220; z += 20) {
      const a = projectWorld(-90, 0, z);
      const b = projectWorld(90, 0, z);
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    for (let x = -80; x <= 80; x += 20) {
      const a = projectWorld(x, 0, Math.max(1, camera.z + 1));
      const b = projectWorld(x, 0, camera.z + 230);
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawScenery() {
    const ordered = scenery
      .map(s => ({ ...s, p: projectWorld(s.x, 0, s.z) }))
      .filter(s => s.p)
      .sort((a, b) => b.p.depth - a.p.depth);

    for (const s of ordered) {
      const scale = clamp(170 / s.p.depth, 0.24, 2.2);
      ctx.save();
      ctx.translate(s.p.x, s.p.y);
      ctx.scale(scale, scale);
      if (s.type === 'tree') {
        ctx.fillStyle = '#5b3e28';
        ctx.fillRect(-3, -27, 6, 27);
        ctx.fillStyle = '#485c3e';
        ctx.beginPath();
        ctx.arc(0, -32, 13, 0, Math.PI * 2);
        ctx.arc(-8, -25, 10, 0, Math.PI * 2);
        ctx.arc(9, -24, 9, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#77705f';
        ctx.beginPath();
        ctx.ellipse(0, -4, 12, 7, -0.15, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawRangeMarkers() {
    if (['flying', 'rolling'].includes(mode)) return;
    ctx.save();
    ctx.font = '700 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (const d of [40, 80, 120, 160, 200]) {
      const p = projectWorld(0, 0.03, d);
      if (!p) continue;
      ctx.fillStyle = 'rgba(245,232,195,.72)';
      ctx.fillText(`${d}m`, p.x, p.y);
    }
    ctx.restore();
  }

  function drawLandingMarker() {
    if (!lastLanding || ['flying', 'rolling'].includes(mode)) return;
    const p = projectWorld(lastLanding.x, 0.03, lastLanding.z);
    if (!p) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,239,187,.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    ctx.moveTo(p.x - 12, p.y); ctx.lineTo(p.x + 12, p.y);
    ctx.moveTo(p.x, p.y - 12); ctx.lineTo(p.x, p.y + 12);
    ctx.stroke();
    ctx.fillStyle = 'rgba(19,39,31,.72)';
    roundRect(ctx, p.x - 34, p.y + 14, 68, 20, 10);
    ctx.fill();
    ctx.fillStyle = '#f5e5ba';
    ctx.font = '800 9px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LAST SHOT', p.x, p.y + 27);
    ctx.restore();
  }

  function drawTargets() {
    const activeTargets = targets
      .filter(target => !target.hit)
      .map(target => ({ target, p: projectWorld(target.x, target.y, target.z) }))
      .sort((a, b) => (b.p?.depth || 0) - (a.p?.depth || 0));

    for (const item of activeTargets) {
      if (item.p) drawTarget(item.target, item.p);
    }

    if (!['flying', 'rolling'].includes(mode)) drawTargetDirectionHint();
  }

  function drawTarget(target, p) {
    const radiusPx = clamp((target.radius / Math.max(1, p.depth)) * 330, 7, 72);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.shadowColor = target.kind === 'boss' ? 'rgba(103,31,21,.38)' : 'rgba(0,0,0,.28)';
    ctx.shadowBlur = 14;

    if (target.kind === 'pot') {
      const s = radiusPx / 18;
      ctx.scale(s, s);
      ctx.fillStyle = '#9c5136';
      ctx.beginPath();
      ctx.moveTo(-14, -17);
      ctx.quadraticCurveTo(-19, 5, -10, 16);
      ctx.quadraticCurveTo(0, 22, 10, 16);
      ctx.quadraticCurveTo(19, 5, 14, -17);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d08a63';
      ctx.fillRect(-12, -22, 24, 6);
    } else {
      ctx.fillStyle = target.kind === 'boss' ? '#5b2c22' : '#eadbb5';
      ctx.beginPath();
      ctx.arc(0, 0, radiusPx, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = target.kind === 'boss' ? '#e3b76b' : '#9b5136';
      ctx.lineWidth = Math.max(3, radiusPx * 0.18);
      ctx.beginPath();
      ctx.arc(0, 0, radiusPx * 0.66, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = target.kind === 'boss' ? '#f3d28c' : '#c88762';
      ctx.lineWidth = Math.max(2, radiusPx * 0.12);
      ctx.beginPath();
      ctx.arc(0, 0, radiusPx * 0.36, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = target.kind === 'boss' ? '#e3b76b' : '#9b5136';
      ctx.beginPath();
      ctx.arc(0, 0, radiusPx * 0.14, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    if (!['flying', 'rolling'].includes(mode)) {
      ctx.save();
      ctx.fillStyle = 'rgba(19,39,31,.74)';
      roundRect(ctx, p.x - 40, p.y + radiusPx + 8, 80, 21, 10);
      ctx.fill();
      ctx.fillStyle = '#f6e6bd';
      ctx.font = '800 9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(target.z)} m`, p.x, p.y + radiusPx + 22);
      ctx.restore();
    }
  }

  function drawTargetDirectionHint() {
    const unhit = targets.filter(target => !target.hit);
    if (!unhit.length) return;

    const visible = unhit.some(target => projectWorld(target.x, target.y, target.z));
    if (visible) return;

    const target = unhit[0];
    const targetYaw = Math.atan2(target.x, target.z);
    const rel = normalizeAngle(targetYaw - aimYaw);
    const right = rel > 0;
    ctx.save();
    ctx.fillStyle = 'rgba(19,39,31,.78)';
    const x = right ? W - 44 : 44;
    const y = H * 0.43;
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2d18e';
    ctx.font = '900 28px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(right ? '→' : '←', x, y - 1);
    ctx.restore();
  }

  function drawCrosshair() {
    const cx = W / 2;
    const cy = H * 0.46;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,249,230,.92)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.moveTo(cx - 25, cy); ctx.lineTo(cx - 9, cy);
    ctx.moveTo(cx + 9, cy); ctx.lineTo(cx + 25, cy);
    ctx.moveTo(cx, cy - 25); ctx.lineTo(cx, cy - 9);
    ctx.moveTo(cx, cy + 9); ctx.lineTo(cx, cy + 25);
    ctx.stroke();
    ctx.fillStyle = 'rgba(19,39,31,.55)';
    roundRect(ctx, cx - 72, cy - 55, 144, 22, 11);
    ctx.fill();
    ctx.fillStyle = '#f7e8bf';
    ctx.font = '800 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DRAG ANYWHERE TO AIM', cx, cy - 40);
    ctx.restore();
  }

  function drawStone() {
    if (['flying', 'rolling'].includes(mode)) {
      const r = mode === 'rolling' ? 16 : 18;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.42)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#d8d0bf';
      ctx.beginPath();
      ctx.arc(W / 2, H * 0.46, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.38)';
      ctx.beginPath();
      ctx.arc(W / 2 - r * 0.28, H * 0.46 - r * 0.3, r * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawShotStatus() {
    if (!['flying', 'rolling'].includes(mode)) return;
    const distance = horizontalDistance(stone.x, stone.z);
    ctx.save();
    ctx.fillStyle = 'rgba(19,39,31,.76)';
    roundRect(ctx, 16, 17, 160, 53, 16);
    ctx.fill();
    ctx.fillStyle = '#f2d18e';
    ctx.font = '900 11px system-ui, sans-serif';
    ctx.fillText(mode === 'rolling' ? 'FOLLOWING ROLLOUT' : 'FOLLOWING STONE', 29, 38);
    ctx.fillStyle = '#fff4d6';
    ctx.font = '700 10px system-ui, sans-serif';
    ctx.fillText(`${distance.toFixed(0)} m  •  ${Math.max(0, stone.y).toFixed(1)} m high`, 29, 56);
    ctx.restore();
  }

  function drawHitMessage() {
    if (!hitMessage || performance.now() > hitMessageUntil) return;
    ctx.save();
    ctx.fillStyle = 'rgba(19,39,31,.88)';
    roundRect(ctx, W / 2 - 76, 78, 152, 40, 20);
    ctx.fill();
    ctx.fillStyle = '#f2d18e';
    ctx.font = '900 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(hitMessage, W / 2, 103);
    ctx.restore();
  }

  function drawPowerControl() {
    if (['flying', 'rolling', 'complete', 'failed', 'verse', 'targetHit'].includes(mode)) return;
    const c = powerControlCenter();
    const pulledY = c.y + power * MAX_POWER_PULL;
    ctx.save();
    ctx.fillStyle = 'rgba(19,39,31,.80)';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(242,209,142,.42)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 44, Math.PI, Math.PI * 2);
    ctx.stroke();
    if (mode === 'power') {
      ctx.strokeStyle = '#f2d18e';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x, pulledY);
      ctx.stroke();
    }
    ctx.fillStyle = '#d8d0bf';
    ctx.shadowColor = 'rgba(0,0,0,.3)';
    ctx.shadowBlur = 7;
    ctx.beginPath();
    ctx.arc(c.x, mode === 'power' ? pulledY : c.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#f7e8bf';
    ctx.font = '900 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(mode === 'power' ? `${Math.round(power * 100)}% POWER` : 'PULL FOR POWER', c.x, c.y - 55);
    ctx.restore();
  }

  function loop(now) {
    const dt = Math.min(0.034, (now - lastFrame) / 1000 || 0);
    lastFrame = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function horizontalDistance(x, z) {
    return Math.hypot(x, z);
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

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function normalizeAngle(value) {
    while (value > Math.PI) value -= Math.PI * 2;
    while (value < -Math.PI) value += Math.PI * 2;
    return value;
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
    } catch {}
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