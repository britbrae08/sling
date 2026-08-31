(() => {
  'use strict';

  const replacements = [
    [
      'const STONE_RADIUS = 0.16;',
      'const STONE_RADIUS = 0.12;'
    ],
    [
      'const GROUND_BOUNCE = 0.48;',
      'const GROUND_BOUNCE = 0.42;'
    ],
    [
      'const ROLL_RETENTION_PER_SECOND = 0.72;',
      'const ROLL_RETENTION_PER_SECOND = 0.38;'
    ],
    [
      'stone.vy = Math.sin(aimPitch) * speed;',
      "const powerArcLift = 1.5 + 4.5 * Math.pow(powerValue, 1.15);\n    stone.vy = Math.sin(aimPitch) * speed + powerArcLift;"
    ],
    [
      "    updateFollowCamera(dt);\n\n    if (horizontalDistance(stone.x, stone.z) > 350 || stone.y < -10 || shotTime > MAX_SHOT_TIME) {",
      "    updateFollowCamera(dt);\n\n    if (hasPassedAllRemainingTargets()) {\n      finishShot();\n      return;\n    }\n\n    if (horizontalDistance(stone.x, stone.z) > 350 || stone.y < -10 || shotTime > MAX_SHOT_TIME) {"
    ],
    [
      '  function checkTargetHit(previous) {',
      "  function hasPassedAllRemainingTargets() {\n    const remaining = targets.filter(target => !target.hit);\n    if (!remaining.length) return false;\n    const farthestTargetDistance = Math.max(...remaining.map(target => horizontalDistance(target.x, target.z)));\n    return horizontalDistance(stone.x, stone.z) > farthestTargetDistance + 10;\n  }\n\n  function checkTargetHit(previous) {"
    ],
    [
      "      const r = mode === 'rolling' ? 16 : 18;",
      "      const r = mode === 'rolling' ? 8 : 10;"
    ],
    [
      '      ctx.shadowBlur = 10;',
      '      ctx.shadowBlur = 7;'
    ]
  ];

  async function boot() {
    const response = await fetch('./game.js?physics=arc-v1', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load SLING engine (${response.status})`);
    let source = await response.text();

    for (const [from, to] of replacements) {
      if (!source.includes(from)) {
        console.warn('SLING tuning hook not found:', from.slice(0, 80));
        continue;
      }
      source = source.replace(from, to);
    }

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