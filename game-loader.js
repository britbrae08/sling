(() => {
  'use strict';

  function replaceRequired(source, pattern, replacement, label) {
    if (!pattern.test(source)) {
      console.warn(`SLING tuning hook not found: ${label}`);
      return source;
    }
    pattern.lastIndex = 0;
    return source.replace(pattern, replacement);
  }

  async function boot() {
    const response = await fetch('./game.js?controls=one-pull-v2', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load SLING engine (${response.status})`);
    let source = await response.text();

    source = replaceRequired(source, /const STONE_RADIUS = 0\.16;/, 'const STONE_RADIUS = 0.12;', 'smaller stone physics');
    source = replaceRequired(source, /const GROUND_BOUNCE = 0\.48;/, 'const GROUND_BOUNCE = 0.42;', 'bounce tuning');
    source = replaceRequired(source, /const ROLL_RETENTION_PER_SECOND = 0\.72;/, 'const ROLL_RETENTION_PER_SECOND = 0.38;', 'roll tuning');

    source = replaceRequired(
      source,
      /let powerStartY = 0;/,
      `let powerStartY = 0;\n  let pullStartX = 0;\n  let pullStartY = 0;\n  let pullDx = 0;\n  let pullDy = 0;\n  let pullBaseYaw = 0;\n  let pullBasePitch = 0;`,
      'one-pull state'
    );

    source = replaceRequired(
      source,
      /stone\.vy = Math\.sin\(aimPitch\) \* speed;/,
      `const powerArcLift = 1.5 + 4.5 * Math.pow(powerValue, 1.15);\n    stone.vy = Math.sin(aimPitch) * speed + powerArcLift;`,
      'power arc'
    );

    source = replaceRequired(
      source,
      /  function onPointerDown\(event\) \{[\s\S]*?\n  \}\n\n  function onPointerMove/,
      `  function onPointerDown(event) {\n    if (mode !== 'ready') return;\n    const p = pointerPos(event);\n    const c = powerControlCenter();\n    if (Math.hypot(p.x - c.x, p.y - c.y) > 88) return;\n\n    pointerMode = 'pull';\n    pullStartX = c.x;\n    pullStartY = c.y;\n    pullDx = 0;\n    pullDy = 0;\n    pullBaseYaw = aimYaw;\n    pullBasePitch = aimPitch;\n    power = 0;\n    mode = 'power';\n    canvas.setPointerCapture?.(event.pointerId);\n    tone(185, 0.025, 0.02);\n    event.preventDefault();\n  }\n\n  function onPointerMove`,
      'pointer down'
    );

    source = replaceRequired(
      source,
      /  function onPointerMove\(event\) \{[\s\S]*?\n  \}\n\n  function onPointerUp/,
      `  function onPointerMove(event) {\n    if (pointerMode !== 'pull') return;\n    const p = pointerPos(event);\n    const rawDx = p.x - pullStartX;\n    const rawDy = p.y - pullStartY;\n    const distance = Math.hypot(rawDx, rawDy);\n    const clampedDistance = Math.min(distance, MAX_POWER_PULL);\n    const scale = distance > 0 ? clampedDistance / distance : 0;\n    pullDx = rawDx * scale;\n    pullDy = rawDy * scale;\n    power = clamp(distance / MAX_POWER_PULL, 0, 1);\n\n    if (distance > 5) {\n      const nx = rawDx / distance;\n      const ny = rawDy / distance;\n      const directionBlend = clamp(distance / 28, 0, 1);\n      aimYaw = normalizeAngle(pullBaseYaw - nx * 0.58 * directionBlend);\n      aimPitch = clamp(pullBasePitch + ny * 0.44 * directionBlend, -0.16, 1.12);\n      camera.yaw = aimYaw;\n      camera.pitch = aimPitch;\n    }\n\n    event.preventDefault();\n  }\n\n  function onPointerUp`,
      'pointer move'
    );

    source = replaceRequired(
      source,
      /  function onPointerUp\(event\) \{[\s\S]*?\n  \}\n\n  function launchStone/,
      `  function onPointerUp(event) {\n    if (pointerMode !== 'pull') return;\n    const firePower = power;\n    pointerMode = null;\n    pullDx = 0;\n    pullDy = 0;\n\n    if (firePower >= 0.08) {\n      launchStone(firePower);\n    } else {\n      power = 0;\n      aimYaw = pullBaseYaw;\n      aimPitch = pullBasePitch;\n      resetCameraToAim();\n      mode = 'ready';\n    }\n\n    event.preventDefault();\n  }\n\n  function launchStone`,
      'pointer up'
    );

    source = replaceRequired(
      source,
      /    updateFollowCamera\(dt\);\n\n    if \(horizontalDistance\(stone\.x, stone\.z\) > 350 \|\| stone\.y < -10 \|\| shotTime > MAX_SHOT_TIME\) \{/,
      `    updateFollowCamera(dt);\n\n    if (hasPassedAllRemainingTargets()) {\n      finishShot();\n      return;\n    }\n\n    if (horizontalDistance(stone.x, stone.z) > 350 || stone.y < -10 || shotTime > MAX_SHOT_TIME) {`,
      'return after targets'
    );

    source = replaceRequired(
      source,
      /  function checkTargetHit\(previous\) \{/,
      `  function hasPassedAllRemainingTargets() {\n    const remaining = targets.filter(target => !target.hit);\n    if (!remaining.length) return false;\n    const farthestTargetDistance = Math.max(...remaining.map(target => horizontalDistance(target.x, target.z)));\n    return horizontalDistance(stone.x, stone.z) > farthestTargetDistance + 10;\n  }\n\n  function checkTargetHit(previous) {`,
      'passed-target helper'
    );

    source = replaceRequired(
      source,
      /ctx\.fillText\('DRAG ANYWHERE TO AIM', cx, cy - 40\);/,
      `ctx.fillText('PULL STONE • AIM + POWER', cx, cy - 40);`,
      'crosshair instruction'
    );

    source = replaceRequired(
      source,
      /  function drawPowerControl\(\) \{[\s\S]*?\n  \}\n\n  function loop/,
      `  function drawPowerControl() {\n    if (['flying', 'rolling', 'complete', 'failed', 'verse', 'targetHit'].includes(mode)) return;\n    const c = powerControlCenter();\n    const stoneX = c.x + pullDx;\n    const stoneY = c.y + pullDy;\n\n    ctx.save();\n    ctx.fillStyle = 'rgba(19,39,31,.76)';\n    ctx.beginPath();\n    ctx.arc(c.x, c.y, 46, 0, Math.PI * 2);\n    ctx.fill();\n\n    if (pointerMode === 'pull') {\n      ctx.strokeStyle = '#f2d18e';\n      ctx.lineWidth = 4;\n      ctx.lineCap = 'round';\n      ctx.beginPath();\n      ctx.moveTo(c.x - 22, c.y - 5);\n      ctx.lineTo(stoneX, stoneY);\n      ctx.moveTo(c.x + 22, c.y - 5);\n      ctx.lineTo(stoneX, stoneY);\n      ctx.stroke();\n    }\n\n    ctx.fillStyle = '#d8d0bf';\n    ctx.shadowColor = 'rgba(0,0,0,.34)';\n    ctx.shadowBlur = 7;\n    ctx.beginPath();\n    ctx.arc(pointerMode === 'pull' ? stoneX : c.x, pointerMode === 'pull' ? stoneY : c.y, 11, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.shadowBlur = 0;\n\n    ctx.fillStyle = '#f7e8bf';\n    ctx.font = '900 10px system-ui, sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillText(pointerMode === 'pull' ? (Math.round(power * 100) + '% POWER • RELEASE') : 'TOUCH + PULL TO AIM', c.x, c.y - 58);\n    ctx.restore();\n  }\n\n  function loop`,
      'unified pull control'
    );

    source = replaceRequired(
      source,
      /const r = mode === 'rolling' \? 16 : 18;/,
      `const r = mode === 'rolling' ? 8 : 10;`,
      'smaller visible stone'
    );

    source = replaceRequired(source, /ctx\.shadowBlur = 10;/, 'ctx.shadowBlur = 7;', 'stone shadow');

    const script = document.createElement('script');
    script.textContent = `${source}\n//# sourceURL=sling-game-runtime.js`;
    document.head.appendChild(script);
  }

  boot().catch(error => {
    console.error(error);
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#13271f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f7e8bf';
      ctx.font = '700 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Reload SLING to continue', canvas.width / 2, canvas.height / 2);
    }
  });
})();