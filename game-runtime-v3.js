(() => {
  'use strict';

  async function boot() {
    const response = await fetch('./game-v3.js?build=faithwords-50-v12', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load FaithWords (${response.status})`);
    let source = await response.text();

    source = source.replace(
      "const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';",
      "const DICTIONARY_API = 'https://freedictionaryapi.com/api/v1/entries/en/';"
    );

    source = source.replace(
      '  const levels = [',
      '  const levels = window.FaithWordsLevels || ['
    );

    source = source.replace(
      "      const valid = response.ok;\n      dictionaryCache.set(word, valid);\n      return valid;",
      "      let valid = false;\n      if (response.ok) {\n        const data = await response.json();\n        valid = !!data && Array.isArray(data.entries) && data.entries.length > 0;\n      }\n      dictionaryCache.set(word, valid);\n      return valid;"
    );

    source = source.replace(
      "        let nextRow = Math.max(...rows) + 2;\n        while (!canPlace(item.word, nextRow, 0, 'h')) nextRow += 2;\n        place(item, nextRow, 0, 'h');",
      "        const nextRow = Math.max(...rows) + 2;\n        place(item, nextRow, 0, 'h');"
    );

    source = source.replace(
      "  function loadLevel(index) {",
      `  function randomizeWheelOrder(sourceLetters, previousOrder = '') {\n    const base = [...sourceLetters];\n    if (base.length < 2) return base;\n    const canonical = currentLevel().letters;\n    const previous = Array.isArray(previousOrder) ? previousOrder.join('') : previousOrder;\n    for (let attempt = 0; attempt < 30; attempt++) {\n      const mixed = [...base];\n      for (let i = mixed.length - 1; i > 0; i--) {\n        const j = Math.floor(Math.random() * (i + 1));\n        [mixed[i], mixed[j]] = [mixed[j], mixed[i]];\n      }\n      const key = mixed.join('');\n      if (key !== canonical && key !== previous) return mixed;\n    }\n    const fallback = [...base];\n    fallback.push(fallback.shift());\n    return fallback;\n  }\n\n  function loadLevel(index) {`
    );

    source = source.replace(
      "    wheelOrder = currentLevel().letters.split('');",
      "    wheelOrder = randomizeWheelOrder(currentLevel().letters.split(''));"
    );

    source = source.replace(
      `    ui.levelLabel.textContent = \`LEVEL \${levelIndex + 1}\`;\n    ui.themeLabel.textContent = currentLevel().theme;\n    const wheelSize = expectedWheelSize(levelIndex + 1);\n    ui.themePrompt.textContent = levelIndex < 4\n      ? \`\${wheelSize} letters • only 3-letter words\`\n      : \`\${wheelSize} letters • find every word\`;`,
      `    const levelNumber = levelIndex + 1;\n    const hardLevel = levelNumber % 5 === 0;\n    const worldNumber = Math.min(5, Math.floor((levelNumber - 1) / 10) + 1);\n    document.body.classList.remove('world-1','world-2','world-3','world-4','world-5');\n    document.body.classList.add(\`world-\${worldNumber}\`);\n    document.querySelector('.game-card')?.classList.toggle('hard-level', hardLevel);\n    ui.levelLabel.textContent = \`LEVEL \${levelNumber}\`;\n    const hardBadge = document.getElementById('hardBadge');\n    if (hardBadge) hardBadge.hidden = !hardLevel;\n    ui.themeLabel.textContent = hardLevel ? 'Challenge' : currentLevel().theme;\n    const wheelSize = expectedWheelSize(levelNumber);\n    ui.themePrompt.textContent = hardLevel\n      ? \`\${wheelSize} letters • tougher board • no theme clue\`\n      : levelIndex < 4\n        ? \`\${wheelSize} letters • only 3-letter words\`\n        : \`\${wheelSize} letters • find every word\`;`
    );

    source = source.replace(
      `  function shuffleLetters() {\n    for (let i = wheelOrder.length - 1; i > 0; i--) {\n      const j = Math.floor(Math.random() * (i + 1));\n      [wheelOrder[i], wheelOrder[j]] = [wheelOrder[j], wheelOrder[i]];\n    }\n    selected = [];\n    ui.wheel.classList.remove('shuffle-spin');\n    void ui.wheel.offsetWidth;\n    ui.wheel.classList.add('shuffle-spin');\n    renderWheel();\n    setIdleReadout();\n    tone(300, .04, .02, 420);\n  }`,
      `  function shuffleLetters() {\n    const previousOrder = wheelOrder.join('');\n    wheelOrder = randomizeWheelOrder(wheelOrder, previousOrder);\n    selected = [];\n    renderWheel();\n    setIdleReadout();\n    tone(300, .04, .02, 420);\n  }`
    );

    source = source.replace(
      "  function tone(startFreq, duration=.06, volume=.03, endFreq=null) {\n    if (!soundEnabled) return;",
      "  function tone(startFreq, duration=.06, volume=.03, endFreq=null) {\n    if (window.FaithWordsPrefs && window.FaithWordsPrefs.sfxEnabled === false) return;\n    if (!soundEnabled) return;"
    );

    source = source.replace(
      "      osc.type = 'sine';",
      "      osc.type = startFreq >= 500 ? 'triangle' : 'sine';"
    );

    const script = document.createElement('script');
    script.textContent = `${source}\n//# sourceURL=faithwords-runtime-v12.js`;
    document.head.appendChild(script);
  }

  boot().catch(error => {
    console.error(error);
    const message = document.getElementById('message');
    if (message) {
      message.textContent = 'Reload FaithWords to continue.';
      message.classList.add('bad');
    }
  });
})();