(() => {
  'use strict';

  async function boot() {
    const response = await fetch('./game-v3.js?build=faithwords-v32', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load FaithWords (${response.status})`);
    let source = await response.text();

    source = source.replace(
      "const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';",
      "const DICTIONARY_API = 'https://freedictionaryapi.com/api/v1/entries/en/';"
    );
    source = source.replace('  const levels = [','  const levels = window.FaithWordsLevels || [');
    source = source.replace(
      '  const BONUS_WORD_POINTS = 1;',
      `  const BONUS_WORD_POINTS = 1;
  const MAX_HINT_POINTS = window.FaithWordsConfig?.maxHintPoints || 200;
  const HINT_NUDGE_COST = window.FaithWordsConfig?.hints?.nudge || 3;
  const HINT_WORD_COST = window.FaithWordsConfig?.hints?.word || 15;`
    );

    // Every curated board word and approved bonus word validates instantly.
    source = source.replace(
      '  const localDictionary = new Set([',
      `  const localDictionary = new Set([
    ...(window.FaithWordsLevels || []).flatMap(level => level.words || []),
    ...(window.FaithWordsLexicon?.accepted || []),`
    );
    source = source.replace(
      '    if (localDictionary.has(word)) return true;',
      `    if (window.FaithWordsLexicon?.excluded?.includes(word)) return false;
    if (localDictionary.has(word)) return true;`
    );

    source = source.replace(
      "      const valid = response.ok;\n      dictionaryCache.set(word, valid);\n      return valid;",
      "      let valid = false;\n      if (response.ok) {\n        const data = await response.json();\n        valid = !!data && Array.isArray(data.entries) && data.entries.length > 0;\n      }\n      dictionaryCache.set(word, valid);\n      return valid;"
    );
    source = source.replace(
      "        let nextRow = Math.max(...rows) + 2;\n        while (!canPlace(item.word, nextRow, 0, 'h')) nextRow += 2;\n        place(item, nextRow, 0, 'h');",
      "        const nextRow = Math.max(...rows) + 2;\n        place(item, nextRow, 0, 'h');"
    );

    // Preserve safe migration fields and resumable mid-level state.
    source = source.replace(
      `        bonusWords: raw.bonusWords || old.bonusWords || {}
      };
    } catch {
      return { unlocked: 1, lastLevel: 0, hintPoints: 0, completed: {}, bonusWords: {} };`,
      `        bonusWords: raw.bonusWords || old.bonusWords || {},
        foundWords: raw.foundWords || {},
        hintedByLevel: raw.hintedByLevel || {},
        hardRewards: raw.hardRewards || {}
      };
    } catch {
      return { unlocked: 1, lastLevel: 0, hintPoints: 0, completed: {}, bonusWords: {}, foundWords: {}, hintedByLevel: {}, hardRewards: {} };`
    );
    source = source.replace(
      '  let save = loadSave();',
      '  let save = loadSave();\n  save.hintPoints = Math.min(MAX_HINT_POINTS, Math.max(0, Number(save.hintPoints) || 0));'
    );
    source = source.replace(
      '  let validating = false;',
      '  let validating = false;\n  let hintUseCount = 0;'
    );

    source = source.replace(
      `  function persist() {
    save.lastLevel = levelIndex;
    localStorage.setItem(saveKey, JSON.stringify(save));
  }`,
      `  function persist() {
    save.lastLevel = levelIndex;
    save.hintPoints = Math.min(MAX_HINT_POINTS, Math.max(0, Number(save.hintPoints) || 0));
    save.foundWords ||= {};
    save.hintedByLevel ||= {};
    if (!save.completed[levelIndex] && found.size) save.foundWords[levelIndex] = [...found];
    else delete save.foundWords[levelIndex];
    if (!save.completed[levelIndex] && hintedCells.size) save.hintedByLevel[levelIndex] = [...hintedCells];
    else delete save.hintedByLevel[levelIndex];
    localStorage.setItem(saveKey, JSON.stringify(save));
    window.dispatchEvent(new CustomEvent('faithwords-progress-changed'));
  }`
    );

    source = source.replace(
      "  function loadLevel(index) {",
      `  function randomizeWheelOrder(sourceLetters, previousOrder = '') {
    const base = [...sourceLetters];
    if (base.length < 2) return base;
    const canonical = currentLevel().letters;
    const previous = Array.isArray(previousOrder) ? previousOrder.join('') : previousOrder;
    for (let attempt = 0; attempt < 30; attempt++) {
      const mixed = [...base];
      for (let i = mixed.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
      }
      const key = mixed.join('');
      if (key !== canonical && key !== previous) return mixed;
    }
    const fallback = [...base];
    fallback.push(fallback.shift());
    return fallback;
  }

  function loadLevel(index) {`
    );
    source = source.replace(
      `    found = new Set();
    hintedCells = new Set();`,
      `    found = save.completed[levelIndex] ? new Set() : new Set(save.foundWords?.[levelIndex] || []);
    hintedCells = save.completed[levelIndex] ? new Set() : new Set(save.hintedByLevel?.[levelIndex] || []);
    hintUseCount = 0;`
    );
    source = source.replace("    wheelOrder = currentLevel().letters.split('');","    wheelOrder = randomizeWheelOrder(currentLevel().letters.split(''));");

    source = source.replace(
      `    ui.levelLabel.textContent = \`LEVEL \${levelIndex + 1}\`;
    ui.themeLabel.textContent = currentLevel().theme;
    const wheelSize = expectedWheelSize(levelIndex + 1);
    ui.themePrompt.textContent = levelIndex < 4
      ? \`\${wheelSize} letters • only 3-letter words\`
      : \`\${wheelSize} letters • find every word\`;`,
      `    const levelNumber = levelIndex + 1;
    const hardLevel = window.FaithWordsConfig?.isHardLevel?.(levelNumber) ?? (levelNumber >= 20 && levelNumber % 5 === 0);
    const worldNumber = Math.min(5, Math.floor((levelNumber - 1) / 10) + 1);
    document.body.classList.remove('world-1','world-2','world-3','world-4','world-5');
    document.body.classList.add(\`world-\${worldNumber}\`);
    document.querySelector('.game-card')?.classList.toggle('hard-level', hardLevel);
    ui.levelLabel.textContent = \`LEVEL \${levelNumber}\`;
    const hardBadge = document.getElementById('hardBadge');
    if (hardBadge) hardBadge.hidden = !hardLevel;
    ui.themeLabel.textContent = '';
    const wheelSize = expectedWheelSize(levelNumber);
    ui.themePrompt.textContent = hardLevel
      ? \`\${wheelSize} letters • tougher board\`
      : levelIndex < 4
        ? \`\${wheelSize} letters • only 3-letter words\`
        : \`\${wheelSize} letters • find every word\`;`
    );

    // Keep normalized placements so richer hints can reveal a useful starting tile.
    source = source.replace(
      `    return { cells: normalized, rows: maxR + 1, cols: maxC + 1 };`,
      `    const normalizedPlacements = new Map();
    for (const [wordIndex, wordCoords] of placements.entries()) {
      normalizedPlacements.set(wordIndex, wordCoords.map(coord => {
        const [r,c] = coord.split(',').map(Number);
        return \`\${r-minR},\${c-minC}\`;
      }));
    }
    return { cells: normalized, rows: maxR + 1, cols: maxC + 1, placements: normalizedPlacements };`
    );

    source = source.replace(
      "    ui.wordReadout.textContent = word || 'Swipe through letters';",
      "    ui.wordReadout.textContent = word || '';"
    );
    source = source.replace(
      `  function setIdleReadout() {
    ui.wordReadout.textContent = 'Swipe through letters';
    ui.wordReadout.classList.add('idle');`,
      `  function setIdleReadout() {
    ui.wordReadout.textContent = '';
    ui.wordReadout.classList.add('idle');`
    );

    source = source.replace(
      `  function addSelected(index) {
    if (selected.includes(index)) return;
    selected.push(index);
    updateSelectionVisuals();
    tone(350 + selected.length * 38, .035, .025);
  }`,
      `  function addSelected(index) {
    const previousIndex = selected.length > 1 ? selected[selected.length - 2] : null;
    if (selected.includes(index)) {
      if (index === previousIndex) {
        selected.pop();
        updateSelectionVisuals();
        tone(Math.max(280, 350 + selected.length * 30), .028, .018);
        vibrate(3);
      }
      return;
    }
    selected.push(index);
    updateSelectionVisuals();
    tone(350 + selected.length * 38, .035, .025);
    vibrate(5);
  }`
    );

    source = source.replace(
      `      save.hintPoints += BONUS_WORD_POINTS;
      ui.bonusCount.textContent = save.hintPoints;
      flashMessage(\`\${word}  +\${BONUS_WORD_POINTS} HINT POINT\`, false, 1500);
      animateBonusPoint();`,
      `      const previousHintPoints = save.hintPoints;
      save.hintPoints = Math.min(MAX_HINT_POINTS, save.hintPoints + BONUS_WORD_POINTS);
      const earnedHintPoints = save.hintPoints - previousHintPoints;
      ui.bonusCount.textContent = save.hintPoints;
      if (earnedHintPoints > 0) {
        flashMessage(\`\${word}  +\${earnedHintPoints} HINT POINT\`, false, 1500);
        animateBonusPoint();
      } else {
        flashMessage(word, false, 1500);
      }`
    );

    // Three calm hint choices: nudge, letter, or whole word.
    source = source.replace(
      `  function useHint() {
    if (save.hintPoints < HINT_COST) {
      flashMessage(\`Need \${HINT_COST} hint points\`, true);
      return;
    }

    const candidates = [...gridData.cells.entries()].filter(([k, cell]) => {
      const revealed = [...cell.words].some(wordIndex => found.has(wordIndex)) || hintedCells.has(k);
      return !revealed;
    });
    if (!candidates.length) return;

    const [k] = candidates[Math.floor(Math.random() * candidates.length)];
    hintedCells.add(k);
    save.hintPoints -= HINT_COST;
    ui.bonusCount.textContent = save.hintPoints;
    renderCrossword();
    flashMessage(\`Hint used • -\${HINT_COST} points\`, false);
    tone(610, .09, .035, 800);
    persist();
  }`,
      `  function spendHint(cost, type) {
    if (save.hintPoints < cost) {
      flashMessage(\`Need \${cost} hint points\`, true);
      return false;
    }
    save.hintPoints -= cost;
    ui.bonusCount.textContent = save.hintPoints;
    hintUseCount += 1;
    window.dispatchEvent(new CustomEvent('faithwords-hint-used', { detail: { type, cost, levelNumber: levelIndex + 1 } }));
    return true;
  }

  function useHint() {
    const candidates = [...gridData.cells.entries()].filter(([k, cell]) => {
      const revealed = [...cell.words].some(wordIndex => found.has(wordIndex)) || hintedCells.has(k);
      return !revealed;
    });
    if (!candidates.length || !spendHint(HINT_COST, 'letter')) return false;

    const [k] = candidates[Math.floor(Math.random() * candidates.length)];
    hintedCells.add(k);
    renderCrossword();
    flashMessage(\`Letter hint • -\${HINT_COST}\`, false);
    tone(610, .09, .035, 800);
    vibrate(10);
    persist();
    return true;
  }

  function useNudgeHint() {
    const unsolved = currentLevel().words.map((_, index) => index).filter(index => !found.has(index));
    if (!unsolved.length) return false;
    const wordIndex = unsolved[Math.floor(Math.random() * unsolved.length)];
    const coords = gridData.placements?.get(wordIndex) || [];
    const k = coords.find(coord => !hintedCells.has(coord));
    if (!k) return useHint();
    if (!spendHint(HINT_NUDGE_COST, 'nudge')) return false;

    hintedCells.add(k);
    renderCrossword();
    flashMessage(\`Starting tile • -\${HINT_NUDGE_COST}\`, false);
    tone(560, .08, .03, 720);
    vibrate(8);
    persist();
    return true;
  }

  function useWordHint() {
    const unsolved = currentLevel().words.map((_, index) => index).filter(index => !found.has(index));
    if (!unsolved.length || !spendHint(HINT_WORD_COST, 'word')) return false;
    const wordIndex = unsolved[Math.floor(Math.random() * unsolved.length)];
    found.add(wordIndex);
    renderCrossword(wordIndex);
    updateProgress();
    flashMessage(\`Word revealed • -\${HINT_WORD_COST}\`, false, 1300);
    tone(640, .1, .035, 840);
    vibrate(14);
    if (found.size === currentLevel().words.length) setTimeout(completeLevel, 720);
    persist();
    return true;
  }`
    );

    // Reward the first normal completion of each hard level without adding a new currency.
    source = source.replace(
      `  function completeLevel() {
    const level = currentLevel();
    save.completed[levelIndex] = true;`,
      `  function completeLevel() {
    const level = currentLevel();
    const levelNumber = levelIndex + 1;
    const wasCompleted = !!save.completed[levelIndex];
    const hardLevel = window.FaithWordsConfig?.isHardLevel?.(levelNumber) ?? (levelNumber >= 20 && levelNumber % 5 === 0);
    const specialMode = window.FaithWordsSessionMode || 'normal';
    const hardEligible = !['daily','mini','challenge'].includes(specialMode);
    let hardBonus = 0;
    save.hardRewards ||= {};
    if (!wasCompleted && hardLevel && hardEligible && !save.hardRewards[levelIndex]) {
      hardBonus = window.FaithWordsConfig?.hardCompletionBonus || 2;
      const before = save.hintPoints;
      save.hintPoints = Math.min(MAX_HINT_POINTS, save.hintPoints + hardBonus);
      hardBonus = save.hintPoints - before;
      save.hardRewards[levelIndex] = true;
      ui.bonusCount.textContent = save.hintPoints;
    }
    save.completed[levelIndex] = true;
    delete save.foundWords?.[levelIndex];
    delete save.hintedByLevel?.[levelIndex];
    window.FaithWordsLastCompletion = {
      levelNumber,
      hardLevel,
      hardBonus,
      hintsUsed: hintUseCount,
      bonusWordsFound: levelBonusSet().size,
      mode: specialMode
    };`
    );

    source = source.replace(
      "    ui.completeTitle.textContent = level.theme;",
      "    const completedLabel = document.getElementById('completeLevelLabel');\n    if (completedLabel) completedLabel.textContent = `LEVEL ${levelIndex + 1}`;\n    ui.completeTitle.textContent = '';"
    );
    source = source.replace(
      '    launchConfetti();',
      `    window.dispatchEvent(new CustomEvent('faithwords-level-completed', { detail: window.FaithWordsLastCompletion }));`
    );

    source = source.replace(
      `  function renderLevelGrid() {
    ui.levelGrid.replaceChildren();
    levels.forEach((level, index) => {
      const unlocked = index < save.unlocked;
      const button = document.createElement('button');
      button.type = 'button';
      button.disabled = !unlocked;
      button.className = \`level-button\${unlocked ? '' : ' locked'}\${index === levelIndex ? ' current' : ''}\`;
      button.innerHTML = \`<strong>\${unlocked ? index + 1 : '🔒'}</strong><span>\${unlocked ? level.theme : 'Locked'}</span><small>\${unlocked ? level.letters.length + ' letters' : ''}</small>\`;
      if (unlocked) button.addEventListener('click', () => loadLevel(index));
      ui.levelGrid.append(button);
    });
  }`,
      `  function renderLevelGrid() {
    ui.levelGrid.replaceChildren();
    for (let groupStart = 0; groupStart < levels.length; groupStart += 10) {
      const groupNumber = Math.floor(groupStart / 10) + 1;
      const groupEnd = Math.min(levels.length, groupStart + 10);
      const section = document.createElement('section');
      section.className = \`level-group level-group-\${groupNumber}\`;
      const heading = document.createElement('h3');
      heading.textContent = \`Levels \${groupStart + 1}–\${groupEnd}\`;
      const grid = document.createElement('div');
      grid.className = 'level-group-grid';

      for (let index = groupStart; index < groupEnd; index++) {
        const level = levels[index];
        const unlocked = index < save.unlocked;
        const button = document.createElement('button');
        button.type = 'button';
        button.disabled = !unlocked;
        button.className = \`level-button\${unlocked ? '' : ' locked'}\${index === levelIndex ? ' current' : ''}\`;
        button.setAttribute('aria-label', unlocked ? \`Level \${index + 1}, \${level.theme}\` : \`Level \${index + 1}, locked\`);
        button.innerHTML = unlocked
          ? \`<strong>\${index + 1}</strong><span>\${level.theme}</span>\`
          : \`<strong>🔒</strong><span>Level \${index + 1}</span>\`;
        if (unlocked) button.addEventListener('click', () => loadLevel(index));
        grid.append(button);
      }

      section.append(heading, grid);
      ui.levelGrid.append(section);
    }
  }`
    );

    source = source.replace(
      `  function shuffleLetters() {
    for (let i = wheelOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wheelOrder[i], wheelOrder[j]] = [wheelOrder[j], wheelOrder[i]];
    }
    selected = [];
    ui.wheel.classList.remove('shuffle-spin');
    void ui.wheel.offsetWidth;
    ui.wheel.classList.add('shuffle-spin');
    renderWheel();
    setIdleReadout();
    tone(300, .04, .02, 420);
  }`,
      `  function shuffleLetters() {
    const previousOrder = wheelOrder.join('');
    wheelOrder = randomizeWheelOrder(wheelOrder, previousOrder);
    selected = [];
    renderWheel();
    setIdleReadout();
    tone(300, .04, .02, 420);
    vibrate(7);
  }`
    );

    // A cancelled gesture should never accidentally submit a partial word.
    source = source.replace(
      "  ui.wheel.addEventListener('pointercancel', endSelection, { passive: false });",
      `  ui.wheel.addEventListener('pointercancel', event => {
    if (!selecting) return;
    selecting = false;
    lastSwipeEvent = null;
    selected = [];
    updateSelectionVisuals();
    event?.preventDefault?.();
  }, { passive: false });`
    );

    source = source.replace(
      "  function vibrate(pattern) {\n    if ('vibrate' in navigator) navigator.vibrate(pattern);\n  }",
      "  function vibrate(pattern) {\n    if (window.FaithWordsPrefs && window.FaithWordsPrefs.hapticsEnabled === false) return;\n    if ('vibrate' in navigator) navigator.vibrate(pattern);\n  }"
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
      `  window.FaithWordsGame = {
    exportProgress() {
      return JSON.parse(JSON.stringify(save));
    },
    importProgress(progress) {
      if (!progress || typeof progress !== 'object') return false;
      localStorage.setItem(saveKey, JSON.stringify(progress));
      save = loadSave();
      save.hintPoints = Math.min(MAX_HINT_POINTS, Math.max(0, Number(save.hintPoints) || 0));
      levelIndex = Math.min(save.lastLevel || 0, levels.length - 1);
      loadLevel(levelIndex);
      return true;
    },
    getCurrentLevelIndex() { return levelIndex; },
    getCurrentState() {
      return {
        levelIndex,
        found: [...found],
        hintedCells: [...hintedCells],
        hintsUsed: hintUseCount,
        bonusWords: [...levelBonusSet()],
        wordCount: currentLevel().words.length
      };
    },
    useNudgeHint() { return useNudgeHint(); },
    useLetterHint() { return useHint(); },
    useWordHint() { return useWordHint(); },
    openLevel(index) {
      loadLevel(index);
      return true;
    }
  };

  window.FaithWordsSessionMode ||= 'normal';
  loadLevel(levelIndex);
})();`
    );

    const script = document.createElement('script');
    script.textContent = `${source}\n//# sourceURL=faithwords-runtime-v32.js`;
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
