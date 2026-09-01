(() => {
  'use strict';

  async function boot() {
    const response = await fetch('./game-v3.js?build=faithwords-v13', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load FaithWords (${response.status})`);
    let source = await response.text();

    source = source.replace(
      "const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';",
      "const DICTIONARY_API = 'https://freedictionaryapi.com/api/v1/entries/en/';"
    );
    source = source.replace('  const levels = [','  const levels = window.FaithWordsLevels || [');
    source = source.replace(
      "      const valid = response.ok;\n      dictionaryCache.set(word, valid);\n      return valid;",
      "      let valid = false;\n      if (response.ok) {\n        const data = await response.json();\n        valid = !!data && Array.isArray(data.entries) && data.entries.length > 0;\n      }\n      dictionaryCache.set(word, valid);\n      return valid;"
    );
    source = source.replace(
      "        let nextRow = Math.max(...rows) + 2;\n        while (!canPlace(item.word, nextRow, 0, 'h')) nextRow += 2;\n        place(item, nextRow, 0, 'h');",
      "        const nextRow = Math.max(...rows) + 2;\n        place(item, nextRow, 0, 'h');"
    );

    source = source.replace(
      `  function persist() {\n    save.lastLevel = levelIndex;\n    localStorage.setItem(saveKey, JSON.stringify(save));\n  }`,
      `  function persist() {\n    save.lastLevel = levelIndex;\n    localStorage.setItem(saveKey, JSON.stringify(save));\n    window.dispatchEvent(new CustomEvent('faithwords-progress-changed'));\n  }`
    );

    source = source.replace(
      "  function loadLevel(index) {",
      `  function randomizeWheelOrder(sourceLetters, previousOrder = '') {\n    const base = [...sourceLetters];\n    if (base.length < 2) return base;\n    const canonical = currentLevel().letters;\n    const previous = Array.isArray(previousOrder) ? previousOrder.join('') : previousOrder;\n    for (let attempt = 0; attempt < 30; attempt++) {\n      const mixed = [...base];\n      for (let i = mixed.length - 1; i > 0; i--) {\n        const j = Math.floor(Math.random() * (i + 1));\n        [mixed[i], mixed[j]] = [mixed[j], mixed[i]];\n      }\n      const key = mixed.join('');\n      if (key !== canonical && key !== previous) return mixed;\n    }\n    const fallback = [...base];\n    fallback.push(fallback.shift());\n    return fallback;\n  }\n\n  function loadLevel(index) {`
    );
    source = source.replace("    wheelOrder = currentLevel().letters.split('');","    wheelOrder = randomizeWheelOrder(currentLevel().letters.split(''));");

    source = source.replace(
      `    ui.levelLabel.textContent = \`LEVEL \${levelIndex + 1}\`;\n    ui.themeLabel.textContent = currentLevel().theme;\n    const wheelSize = expectedWheelSize(levelIndex + 1);\n    ui.themePrompt.textContent = levelIndex < 4\n      ? \`\${wheelSize} letters • only 3-letter words\`\n      : \`\${wheelSize} letters • find every word\`;`,
      `    const levelNumber = levelIndex + 1;\n    const hardLevel = levelNumber >= 20 && levelNumber % 5 === 0;\n    const worldNumber = Math.min(5, Math.floor((levelNumber - 1) / 10) + 1);\n    document.body.classList.remove('world-1','world-2','world-3','world-4','world-5');\n    document.body.classList.add(\`world-\${worldNumber}\`);\n    document.querySelector('.game-card')?.classList.toggle('hard-level', hardLevel);\n    ui.levelLabel.textContent = \`LEVEL \${levelNumber}\`;\n    const hardBadge = document.getElementById('hardBadge');\n    if (hardBadge) hardBadge.hidden = !hardLevel;\n    ui.themeLabel.textContent = '';\n    const wheelSize = expectedWheelSize(levelNumber);\n    ui.themePrompt.textContent = hardLevel\n      ? \`\${wheelSize} letters • tougher board\`\n      : levelIndex < 4\n        ? \`\${wheelSize} letters • only 3-letter words\`\n        : \`\${wheelSize} letters • find every word\`;`
    );

    source = source.replace(
      "    ui.completeTitle.textContent = level.theme;",
      "    ui.completeTitle.textContent = `Level ${levelIndex + 1}`;"
    );

    source = source.replace(
      `  function renderLevelGrid() {\n    ui.levelGrid.replaceChildren();\n    levels.forEach((level, index) => {\n      const unlocked = index < save.unlocked;\n      const button = document.createElement('button');\n      button.type = 'button';\n      button.disabled = !unlocked;\n      button.className = \`level-button\${unlocked ? '' : ' locked'}\${index === levelIndex ? ' current' : ''}\`;\n      button.innerHTML = \`<strong>\${unlocked ? index + 1 : '🔒'}</strong><span>\${unlocked ? level.theme : 'Locked'}</span><small>\${unlocked ? level.letters.length + ' letters' : ''}</small>\`;\n      if (unlocked) button.addEventListener('click', () => loadLevel(index));\n      ui.levelGrid.append(button);\n    });\n  }`,
      `  function renderLevelGrid() {\n    ui.levelGrid.replaceChildren();\n    for (let groupStart = 0; groupStart < levels.length; groupStart += 10) {\n      const groupNumber = Math.floor(groupStart / 10) + 1;\n      const groupEnd = Math.min(levels.length, groupStart + 10);\n      const section = document.createElement('section');\n      section.className = \`level-group level-group-\${groupNumber}\`;\n      const heading = document.createElement('h3');\n      heading.textContent = \`Levels \${groupStart + 1}–\${groupEnd}\`;\n      const grid = document.createElement('div');\n      grid.className = 'level-group-grid';\n\n      for (let index = groupStart; index < groupEnd; index++) {\n        const unlocked = index < save.unlocked;\n        const button = document.createElement('button');\n        button.type = 'button';\n        button.disabled = !unlocked;\n        button.className = \`level-button\${unlocked ? '' : ' locked'}\${index === levelIndex ? ' current' : ''}\`;\n        button.setAttribute('aria-label', \`Level \${index + 1}\${unlocked ? '' : ', locked'}\`);\n        button.innerHTML = \`<strong>\${unlocked ? index + 1 : '🔒'}</strong><span>Level \${index + 1}</span>\`;\n        if (unlocked) button.addEventListener('click', () => loadLevel(index));\n        grid.append(button);\n      }\n\n      section.append(heading, grid);\n      ui.levelGrid.append(section);\n    }\n  }`
    );

    source = source.replace(
      `  function shuffleLetters() {\n    for (let i = wheelOrder.length - 1; i > 0; i--) {\n      const j = Math.floor(Math.random() * (i + 1));\n      [wheelOrder[i], wheelOrder[j]] = [wheelOrder[j], wheelOrder[i]];\n    }\n    selected = [];\n    ui.wheel.classList.remove('shuffle-spin');\n    void ui.wheel.offsetWidth;\n    ui.wheel.classList.add('shuffle-spin');\n    renderWheel();\n    setIdleReadout();\n    tone(300, .04, .02, 420);\n  }`,
      `  function shuffleLetters() {\n    const previousOrder = wheelOrder.join('');\n    wheelOrder = randomizeWheelOrder(wheelOrder, previousOrder);\n    selected = [];\n    renderWheel();\n    setIdleReadout();\n    tone(300, .04, .02, 420);\n  }`
    );

    source = source.replace(
      "  function tone(startFreq, duration=.06, volume=.03, endFreq=null) {\n    if (!soundEnabled) return;",
      "  function tone(startFreq, duration=.06, volume=.03, endFreq=null) {\n    if (window.FaithWordsPrefs && window.FaithWordsPrefs.sfxEnabled === false) return;\n    if (!soundEnabled) return;"
    );
    source = source.replace("      osc.type = 'sine';","      osc.type = startFreq >= 500 ? 'triangle' : 'sine';");

    source = source.replace("      tone(520, .08, .045, 760);", "      // reward chime handled by word-feedback-v10.js");
    source = source.replace("      tone(260, .05, .02);", "      // duplicate-word sound handled by word-feedback-v10.js");
    source = source.replace("      tone(280, .05, .02);", "      // duplicate bonus-word sound handled by word-feedback-v10.js");
    source = source.replace("      tone(660, .1, .045, 960);", "      // bonus-word reward chime handled by word-feedback-v10.js");
    source = source.replace("    tone(160, .06, .02);", "    // invalid-word sound handled by word-feedback-v10.js");

    source = source.replace(
      "  loadLevel(levelIndex);\n})();",
      `  window.FaithWordsGame = {\n    exportProgress() {\n      return JSON.parse(JSON.stringify(save));\n    },\n    importProgress(progress) {\n      if (!progress || typeof progress !== 'object') return false;\n      localStorage.setItem(saveKey, JSON.stringify(progress));\n      save = loadSave();\n      levelIndex = Math.min(save.lastLevel || 0, levels.length - 1);\n      loadLevel(levelIndex);\n      return true;\n    }\n  };\n\n  loadLevel(levelIndex);\n})();`
    );

    const script = document.createElement('script');
    script.textContent = `${source}\n//# sourceURL=faithwords-runtime-v13.js`;
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
