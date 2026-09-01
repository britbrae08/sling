(() => {
  'use strict';

  async function boot() {
    const response = await fetch('./game-v3.js?build=audio-menu-v7', { cache: 'no-store' });
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

    // Prevent this class of content bug from shipping again. After switching
    // to a level, remove any required answer that cannot actually be formed
    // from that level's letter wheel and report it in the console for fixing.
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

    source = source.replace(
      `  function shuffleLetters() {\n    for (let i = wheelOrder.length - 1; i > 0; i--) {\n      const j = Math.floor(Math.random() * (i + 1));\n      [wheelOrder[i], wheelOrder[j]] = [wheelOrder[j], wheelOrder[i]];\n    }\n    selected = [];\n    ui.wheel.classList.remove('shuffle-spin');\n    void ui.wheel.offsetWidth;\n    ui.wheel.classList.add('shuffle-spin');\n    renderWheel();\n    setIdleReadout();\n    tone(300, .04, .02, 420);\n  }`,
      `  function shuffleLetters() {\n    const previousOrder = wheelOrder.join('');\n    wheelOrder = randomizeWheelOrder(wheelOrder, previousOrder);\n    selected = [];\n    ui.wheel.classList.remove('shuffle-spin');\n    void ui.wheel.offsetWidth;\n    ui.wheel.classList.add('shuffle-spin');\n    renderWheel();\n    setIdleReadout();\n    tone(300, .04, .02, 420);\n  }`
    );

    // The top-right menu owns audio preferences. Core gameplay effects already
    // cover letter selection, correct words, wrong words, shuffle, hints,
    // bonus words and level completion; this gate makes that entire layer
    // independently muteable from the background music.
    source = source.replace(
      "  function tone(startFreq, duration=.06, volume=.03, endFreq=null) {\n    if (!soundEnabled) return;",
      "  function tone(startFreq, duration=.06, volume=.03, endFreq=null) {\n    if (window.FaithWordsPrefs && window.FaithWordsPrefs.sfxEnabled === false) return;\n    if (!soundEnabled) return;"
    );

    source = source.replace(
      "      osc.type = 'sine';",
      "      osc.type = startFreq >= 500 ? 'triangle' : 'sine';"
    );

    const script = document.createElement('script');
    script.textContent = `${source}\n//# sourceURL=faithwords-runtime-v7.js`;
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