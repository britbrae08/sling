(() => {
  'use strict';

  async function boot() {
    const response = await fetch('./game-v3.js?build=hard-levels-v9', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load FaithWords (${response.status})`);
    let source = await response.text();

    source = source.replace(
      "const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';",
      "const DICTIONARY_API = 'https://freedictionaryapi.com/api/v1/entries/en/';"
    );

    source = source.replace(
      "      const valid = response.ok;\n      dictionaryCache.set(word, valid);\n      return valid;",
      "      let valid = false;\n      if (response.ok) {\n        const data = await response.json();\n        valid = !!data && Array.isArray(data.entries) && data.entries.length > 0;\n      }\n      dictionaryCache.set(word, valid);\n      return valid;"
    );

    // Every fifth level is a harder challenge, but it keeps the same wheel
    // size as the level immediately before it.
    source = source.replace(
      `  function expectedWheelSize(levelNumber) {\n    if (levelNumber <= 4) return 3;\n    if (levelNumber <= 12) return 4;\n    if (levelNumber <= 80) return 5;\n    return 6;\n  }`,
      `  function expectedWheelSize(levelNumber) {\n    if (levelNumber > 1 && levelNumber % 5 === 0) return expectedWheelSize(levelNumber - 1);\n    if (levelNumber <= 4) return 3;\n    if (levelNumber <= 12) return 4;\n    if (levelNumber <= 80) return 5;\n    return 6;\n  }`
    );

    // Level 5: still a three-letter wheel, but the clue is hidden and AWL is
    // deliberately less obvious than the early tutorial words.
    source = source.replace(
      `    {\n      theme: 'Pray', letters: 'PRAY', words: ['PRAY', 'PAY', 'RAY'],\n      verse: '1 Thessalonians 5:17',\n      verseText: 'Keep returning to prayer.',\n      reading: 'Prayer does not have to be complicated or long. It can become a rhythm woven through ordinary life: gratitude, questions, requests, silence, and trust.'\n    },`,
      `    {\n      theme: 'Law', letters: 'LAW', words: ['LAW', 'AWL'],\n      verse: 'Psalm 119:105',\n      verseText: 'God’s word is pictured as a lamp for our feet and a light for our path.',\n      reading: 'God’s law is meant to give direction, not merely information. A faithful life grows as truth moves from something we know into something that shapes the way we choose and live.'\n    },`
    );

    // Move KING to level 9, then make level 10 a denser STAR challenge using
    // the same four-letter wheel size.
    source = source.replace(
      `    {\n      theme: 'King', letters: 'KING', words: ['KING', 'KIN', 'INK'],\n      verse: 'Revelation 19:16',\n      verseText: 'Jesus is described as King of kings and Lord of lords.',\n      reading: 'Calling Jesus King is a statement about more than admiration. It asks who ultimately has authority over our values, our direction, and the way we choose to live.'\n    },`,
      `    {\n      theme: 'Star', letters: 'STAR', words: ['STAR', 'ART', 'RAT', 'TAR', 'SAT'],\n      verse: 'Matthew 2:10',\n      verseText: 'The travelers rejoiced when they saw the star.',\n      reading: 'The star in the nativity story became a sign that drew people toward Jesus. Even when the whole route is not visible, a clear point of light can be enough to guide the next faithful step.'\n    },`
    );

    source = source.replace(
      `    {\n      theme: 'Star', letters: 'STAR', words: ['STAR', 'ART', 'RAT', 'TAR'],\n      verse: 'Matthew 2:10',\n      verseText: 'The travelers rejoiced when they saw the star.',\n      reading: 'The star in the nativity story became a sign that drew people toward Jesus. Sometimes a small point of light is enough to help us take the next faithful step.'\n    },`,
      `    {\n      theme: 'King', letters: 'KING', words: ['KING', 'KIN', 'INK'],\n      verse: 'Revelation 19:16',\n      verseText: 'Jesus is described as King of kings and Lord of lords.',\n      reading: 'Calling Jesus King is a statement about more than admiration. It asks who ultimately has authority over our values, our direction, and the way we choose to live.'\n    },`
    );

    // Level 15: five letters, same as level 14, with a denser set of closely
    // related answers than a normal five-letter level.
    source = source.replace(
      `    {\n      theme: 'Peace', letters: 'PEACE', words: ['PEACE', 'PACE', 'CAPE', 'ACE', 'PEA'],\n      verse: 'John 14:27',\n      verseText: 'Jesus offers a peace different from what the world gives.',\n      reading: 'Peace is not always the absence of pressure. Sometimes it is the steady presence of Christ while the pressure is still around us.'\n    }`,
      `    {\n      theme: 'Heart', letters: 'HEART', words: ['HEART', 'EARTH', 'HEAR', 'HEAT', 'HATE'],\n      verse: 'Proverbs 4:23',\n      verseText: 'Guard your heart carefully, because the direction of life flows from it.',\n      reading: 'Scripture treats the heart as more than emotion. It points to the inner life from which choices, desires, attitudes, and direction flow. What we allow to shape the heart eventually shapes the life.'\n    }`
    );

    // Level 12 wheel is W-I-S-E. Every required board word must use only
    // those letters. SUE and USE incorrectly required a U, so they are removed.
    source = source.replace(
      "theme: 'Wise', letters: 'WISE', words: ['WISE', 'SEW', 'SUE', 'USE'],",
      "theme: 'Wise', letters: 'WISE', words: ['WISE', 'SEW'],"
    );

    // Keep the Grace crossword connected: GEAR remains a valid bonus word,
    // but is not required on the board.
    source = source.replace(
      "theme: 'Grace', letters: 'GRACE', words: ['GRACE', 'RACE', 'CARE', 'GEAR', 'AGE'],",
      "theme: 'Grace', letters: 'GRACE', words: ['GRACE', 'RACE', 'CARE', 'AGE'],"
    );

    // A disconnected fallback must never spin forever if a future word set
    // cannot cross cleanly with the current board.
    source = source.replace(
      "        let nextRow = Math.max(...rows) + 2;\n        while (!canPlace(item.word, nextRow, 0, 'h')) nextRow += 2;\n        place(item, nextRow, 0, 'h');",
      "        const nextRow = Math.max(...rows) + 2;\n        place(item, nextRow, 0, 'h');"
    );

    // Prevent impossible answers from shipping again.
    source = source.replace(
      "    levelIndex = Math.max(0, Math.min(index, levels.length - 1));",
      "    levelIndex = Math.max(0, Math.min(index, levels.length - 1));\n    const impossibleWords = currentLevel().words.filter(word => !canSpellFromRack(word, currentLevel().letters));\n    if (impossibleWords.length) {\n      console.error('FaithWords level has answers not present in its wheel:', levelIndex + 1, impossibleWords);\n      currentLevel().words = currentLevel().words.filter(word => canSpellFromRack(word, currentLevel().letters));\n    }"
    );

    // Randomize the wheel whenever a level opens. Avoid both the canonical
    // letter order and the immediately previous arrangement whenever possible.
    source = source.replace(
      "  function loadLevel(index) {",
      `  function randomizeWheelOrder(sourceLetters, previousOrder = '') {\n    const base = [...sourceLetters];\n    if (base.length < 2) return base;\n    const canonical = currentLevel().letters;\n    const previous = Array.isArray(previousOrder) ? previousOrder.join('') : previousOrder;\n\n    for (let attempt = 0; attempt < 24; attempt++) {\n      const mixed = [...base];\n      for (let i = mixed.length - 1; i > 0; i--) {\n        const j = Math.floor(Math.random() * (i + 1));\n        [mixed[i], mixed[j]] = [mixed[j], mixed[i]];\n      }\n      const key = mixed.join('');\n      if (key !== canonical && key !== previous) return mixed;\n    }\n\n    const fallback = [...base];\n    fallback.push(fallback.shift());\n    if (fallback.join('') === canonical || fallback.join('') === previous) {\n      fallback.push(fallback.shift());\n    }\n    return fallback;\n  }\n\n  function loadLevel(index) {`
    );

    source = source.replace(
      "    wheelOrder = currentLevel().letters.split('');",
      "    wheelOrder = randomizeWheelOrder(currentLevel().letters.split(''));"
    );

    // Hard levels are every fifth puzzle. Hide the theme word so the main
    // answer is not handed to the player, and surface a conspicuous red badge.
    source = source.replace(
      `    ui.levelLabel.textContent = \`LEVEL \${levelIndex + 1}\`;\n    ui.themeLabel.textContent = currentLevel().theme;\n    const wheelSize = expectedWheelSize(levelIndex + 1);\n    ui.themePrompt.textContent = levelIndex < 4\n      ? \`\${wheelSize} letters • only 3-letter words\`\n      : \`\${wheelSize} letters • find every word\`;`,
      `    const levelNumber = levelIndex + 1;\n    const hardLevel = levelNumber % 5 === 0;\n    ui.levelLabel.textContent = \`LEVEL \${levelNumber}\`;\n    ui.themeLabel.textContent = hardLevel ? 'Challenge' : currentLevel().theme;\n    const hardBadge = document.getElementById('hardBadge');\n    if (hardBadge) hardBadge.hidden = !hardLevel;\n    document.querySelector('.game-card')?.classList.toggle('hard-level', hardLevel);\n    const wheelSize = expectedWheelSize(levelNumber);\n    ui.themePrompt.textContent = hardLevel\n      ? \`\${wheelSize} letters • challenge board • no theme clue\`\n      : levelIndex < 4\n        ? \`\${wheelSize} letters • only 3-letter words\`\n        : \`\${wheelSize} letters • find every word\`;`
    );

    source = source.replace(
      `  function shuffleLetters() {\n    for (let i = wheelOrder.length - 1; i > 0; i--) {\n      const j = Math.floor(Math.random() * (i + 1));\n      [wheelOrder[i], wheelOrder[j]] = [wheelOrder[j], wheelOrder[i]];\n    }\n    selected = [];\n    ui.wheel.classList.remove('shuffle-spin');\n    void ui.wheel.offsetWidth;\n    ui.wheel.classList.add('shuffle-spin');\n    renderWheel();\n    setIdleReadout();\n    tone(300, .04, .02, 420);\n  }`,
      `  function shuffleLetters() {\n    const previousOrder = wheelOrder.join('');\n    wheelOrder = randomizeWheelOrder(wheelOrder, previousOrder);\n    selected = [];\n    ui.wheel.classList.remove('shuffle-spin');\n    void ui.wheel.offsetWidth;\n    ui.wheel.classList.add('shuffle-spin');\n    renderWheel();\n    setIdleReadout();\n    tone(300, .04, .02, 420);\n  }`
    );

    // The top-right menu owns audio preferences. Game sounds remain separately
    // muteable from background music.
    source = source.replace(
      "  function tone(startFreq, duration=.06, volume=.03, endFreq=null) {\n    if (!soundEnabled) return;",
      "  function tone(startFreq, duration=.06, volume=.03, endFreq=null) {\n    if (window.FaithWordsPrefs && window.FaithWordsPrefs.sfxEnabled === false) return;\n    if (!soundEnabled) return;"
    );

    source = source.replace(
      "      osc.type = 'sine';",
      "      osc.type = startFreq >= 500 ? 'triangle' : 'sine';"
    );

    const script = document.createElement('script');
    script.textContent = `${source}\n//# sourceURL=faithwords-runtime-v9.js`;
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