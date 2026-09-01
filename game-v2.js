(() => {
  'use strict';

  const HINT_COST = 12;
  const BONUS_WORD_POINTS = 3;

  const levels = [
    {
      theme: 'God', letters: 'GOD', words: ['GOD', 'DOG'], bonus: [],
      verse: 'Psalm 46:10', verseText: 'Be still, and remember that God is God.',
      reading: 'The first puzzle is simple on purpose. Faith often begins the same way: not with having every answer, but with remembering who God is and choosing to trust Him one step at a time.'
    },
    {
      theme: 'Son', letters: 'STONE', words: ['SON', 'ONE', 'TEN', 'TOE'], bonus: ['NET', 'NOT', 'SET', 'TON'],
      verse: 'John 3:16', verseText: 'God loved the world and gave His Son so that those who trust Him may have life.',
      reading: 'Small words can carry a large meaning. The Christian story centers on the Son of God and the love that moved God toward us, not away from us.'
    },
    {
      theme: 'Faith', letters: 'FAITH', words: ['FAITH', 'FIT', 'HIT', 'HAT'], bonus: ['FAT', 'AFT'],
      verse: 'Hebrews 11:1', verseText: 'Faith gives substance to what we hope for and confidence in what we cannot yet see.',
      reading: 'Faith does not require pretending that uncertainty is gone. It means placing confidence in God while the whole path is still unfolding.'
    },
    {
      theme: 'Grace', letters: 'GRACE', words: ['GRACE', 'RACE', 'CARE', 'AGE'], bonus: ['GEAR', 'ACRE', 'CAR', 'EAR', 'ARE', 'ARC', 'ERA', 'RAG'],
      verse: 'Ephesians 2:8', verseText: 'You are saved by grace through faith; it is God’s gift, not something you earn.',
      reading: 'Grace is a gift before it is a task. You do not have to prove your worth to God before receiving His love, help, or forgiveness.'
    },
    {
      theme: 'Peace', letters: 'PEACE', words: ['PEACE', 'PACE', 'CAPE', 'ACE'], bonus: ['PEA', 'APE', 'CAP'],
      verse: 'John 14:27', verseText: 'Jesus gives a peace that is different from the peace the world gives.',
      reading: 'Peace is not always the absence of pressure. Sometimes it is the steady presence of Christ while pressure is still around you.'
    },
    {
      theme: 'Bread', letters: 'BREAD', words: ['BREAD', 'READ', 'BEAR', 'DEAR', 'BAD'], bonus: ['BARE', 'DARE', 'BEAD', 'BED', 'RED', 'BAR', 'BARD', 'BRA'],
      verse: 'John 6:35', verseText: 'Jesus said, “I am the bread of life.”',
      reading: 'Bread was ordinary, daily food. Jesus used that familiar picture to describe our need for Him: not occasionally, but as a regular source of life and strength.'
    },
    {
      theme: 'Heart', letters: 'HEART', words: ['HEART', 'HEAR', 'HEAT', 'RATE', 'HAT'], bonus: ['TEAR', 'EAR', 'ART', 'RAT', 'TEA', 'HER', 'THE', 'ATE', 'ARE', 'ERA'],
      verse: 'Proverbs 4:23', verseText: 'Guard your heart carefully, because the direction of life flows from it.',
      reading: 'What repeatedly receives your attention shapes your inner life. Guarding the heart means noticing what you are allowing to influence your thoughts, desires, and choices.'
    },
    {
      theme: 'Angel', letters: 'ANGEL', words: ['ANGEL', 'ANGLE', 'LEAN', 'LANE', 'AGE'], bonus: ['GLEAN', 'LEG', 'GEL', 'ALE', 'LAG', 'NAG'],
      verse: 'Psalm 91:11', verseText: 'God commands His angels concerning His people, to guard them in their ways.',
      reading: 'Scripture often reminds us that God’s care reaches beyond what we can see. You may not see every way He protects, guides, or provides.'
    },
    {
      theme: 'Water', letters: 'WATER', words: ['WATER', 'WEAR', 'RATE', 'TEAR', 'RAW'], bonus: ['AWE', 'WAR', 'ART', 'EAR', 'TEA', 'ATE', 'ARE', 'ERA', 'RAT', 'TAR', 'WET'],
      verse: 'John 4:14', verseText: 'Jesus described the life He gives as living water that keeps flowing.',
      reading: 'Water refreshes what is dry. Jesus used living water as a picture of the deeper life God offers—something that renews us from within.'
    },
    {
      theme: 'Stone', letters: 'STONE', words: ['STONE', 'TONE', 'NOTE', 'SON', 'ONE'], bonus: ['SENT', 'ONES', 'NET', 'TEN', 'SET', 'TOE', 'NOT', 'TON', 'NOSE', 'NEST', 'TENS', 'TOES', 'EON'],
      verse: 'Psalm 118:22', verseText: 'The stone the builders rejected became the cornerstone.',
      reading: 'God can give purpose to what people overlook or reject. Scripture repeatedly shows Him building something meaningful from what others considered unimportant.'
    },
    {
      theme: 'Crown', letters: 'CROWN', words: ['CROWN', 'WORN', 'CROW', 'OWN', 'NOW'], bonus: ['ROW', 'WON', 'COW'],
      verse: 'James 1:12', verseText: 'Those who remain faithful through testing are promised the crown of life.',
      reading: 'Endurance is built in ordinary choices. Remaining faithful when things are difficult forms a kind of strength that comfort alone cannot create.'
    },
    {
      theme: 'Prayer', letters: 'PRAYER', words: ['PRAYER', 'PRAY', 'RARE', 'YEAR', 'PAYER'], bonus: ['RAY', 'PAY', 'EAR', 'PEAR', 'PREY', 'REAP', 'PARE'],
      verse: '1 Thessalonians 5:17', verseText: 'Keep praying.',
      reading: 'Prayer does not need to be complicated to be real. A few honest words offered to God throughout the day can keep the heart connected to Him.'
    },
    {
      theme: 'Spirit', letters: 'SPIRIT', words: ['SPIRIT', 'STRIP', 'TRIP', 'SIT', 'TIP'], bonus: ['RIP', 'SIR', 'PIT', 'SPIT', 'PITS', 'TIPS', 'RIPS', 'STIR', 'IRIS'],
      verse: 'Galatians 5:25', verseText: 'If we live by the Spirit, let us also keep in step with the Spirit.',
      reading: 'Spiritual growth is not only about knowing what is right. It is learning to notice God’s leading and respond to it in the next actual choice.'
    },
    {
      theme: 'Christ', letters: 'CHRIST', words: ['CHRIST', 'RICH', 'THIS', 'HIS', 'HIT'], bonus: ['HITS', 'ITCH', 'SIT', 'ITS', 'SIR'],
      verse: 'Philippians 4:13', verseText: 'Through Christ, I can face what He calls me to with His strength.',
      reading: 'Christian strength is not self-sufficiency. It is learning to depend on Christ for courage, endurance, wisdom, and the ability to keep going.'
    },
    {
      theme: 'Gospel', letters: 'GOSPEL', words: ['GOSPEL', 'SLOPE', 'POSE', 'POLE', 'LOG'], bonus: ['LEG', 'PEG', 'LOSE', 'SOLE', 'SLOP', 'LEGS', 'LOGS', 'PESO'],
      verse: 'Mark 16:15', verseText: 'Go into all the world and share the good news.',
      reading: 'The gospel means good news. It is a message meant to move outward—through words, service, compassion, and lives that make the character of Jesus visible.'
    }
  ];

  const ui = {
    levelLabel: document.getElementById('levelLabel'),
    themeLabel: document.getElementById('themeLabel'),
    themePrompt: document.getElementById('themePrompt'),
    wordProgress: document.getElementById('wordProgress'),
    crossword: document.getElementById('crossword'),
    wordReadout: document.getElementById('wordReadout'),
    message: document.getElementById('message'),
    wheel: document.getElementById('letterWheel'),
    traceSvg: document.getElementById('traceSvg'),
    traceLine: document.getElementById('traceLine'),
    bonusCount: document.getElementById('bonusCount'),
    bonusPill: document.querySelector('.bonus-pill'),
    hintButton: document.getElementById('hintButton'),
    hintCost: document.getElementById('hintCost'),
    shuffleButton: document.getElementById('shuffleButton'),
    soundButton: document.getElementById('soundButton'),
    levelsButton: document.getElementById('levelsButton'),
    levelDrawer: document.getElementById('levelDrawer'),
    levelGrid: document.getElementById('levelGrid'),
    closeLevelsButton: document.getElementById('closeLevelsButton'),
    startOverlay: document.getElementById('startOverlay'),
    startButton: document.getElementById('startButton'),
    completeOverlay: document.getElementById('completeOverlay'),
    completeTitle: document.getElementById('completeTitle'),
    readingText: document.getElementById('readingText'),
    verseText: document.getElementById('verseText'),
    verseRef: document.getElementById('verseRef'),
    nextButton: document.getElementById('nextButton'),
    replayButton: document.getElementById('replayButton'),
    celebrationLayer: document.getElementById('celebrationLayer'),
    sceneSparkles: document.getElementById('sceneSparkles')
  };

  const saveKey = 'faithWordsProgressV2';
  let save = loadSave();
  let levelIndex = Math.min(save.lastLevel || 0, levels.length - 1);
  let found = new Set();
  let bonusFound = new Set();
  let hintedCells = new Set();
  let wheelOrder = [];
  let selected = [];
  let selecting = false;
  let gridData = null;
  let soundEnabled = true;
  let audioCtx = null;
  let messageTimer = null;
  let lastPointer = null;

  function loadSave() {
    try {
      const old = JSON.parse(localStorage.getItem('faithWordsProgressV1') || '{}');
      const raw = JSON.parse(localStorage.getItem(saveKey) || '{}');
      return {
        unlocked: Math.max(1, Number(raw.unlocked ?? old.unlocked) || 1),
        lastLevel: Number(raw.lastLevel ?? old.lastLevel) || 0,
        bonusPoints: Math.max(0, Number(raw.bonusPoints ?? old.light) || 0),
        completed: raw.completed || old.completed || {},
        bonusWords: raw.bonusWords || {}
      };
    } catch {
      return { unlocked: 1, lastLevel: 0, bonusPoints: 0, completed: {}, bonusWords: {} };
    }
  }

  function persist() {
    save.lastLevel = levelIndex;
    save.bonusWords[levelIndex] = [...bonusFound];
    localStorage.setItem(saveKey, JSON.stringify(save));
  }

  function currentLevel() { return levels[levelIndex]; }

  function loadLevel(index) {
    levelIndex = Math.max(0, Math.min(index, levels.length - 1));
    found = new Set();
    hintedCells = new Set();
    selected = [];
    selecting = false;
    lastPointer = null;
    bonusFound = new Set(save.bonusWords[levelIndex] || []);
    wheelOrder = currentLevel().letters.split('');
    gridData = buildCrossword(currentLevel().words);
    ui.completeOverlay.classList.remove('visible');
    ui.levelDrawer.classList.remove('open');
    ui.levelLabel.textContent = `LEVEL ${levelIndex + 1}`;
    ui.themeLabel.textContent = currentLevel().theme;
    ui.themePrompt.textContent = levelIndex < 2 ? 'Start with simple three-letter words.' : 'Find the board words—and watch for bonus words.';
    updateBonusUi();
    setIdleReadout();
    renderCrossword();
    renderWheel();
    updateProgress();
    renderLevelGrid();
    persist();
  }

  function buildCrossword(words) {
    const ordered = words.map((word, index) => ({ word, index })).sort((a, b) => b.word.length - a.word.length || a.index - b.index);
    const cells = new Map();
    const placements = new Map();
    const key = (r, c) => `${r},${c}`;
    const get = (r, c) => cells.get(key(r, c));

    function canPlace(word, row, col, dir, requireOverlap) {
      const before = dir === 'h' ? get(row, col - 1) : get(row - 1, col);
      const after = dir === 'h' ? get(row, col + word.length) : get(row + word.length, col);
      if (before || after) return false;
      let overlaps = 0;
      for (let i = 0; i < word.length; i++) {
        const r = row + (dir === 'v' ? i : 0);
        const c = col + (dir === 'h' ? i : 0);
        const existing = get(r, c);
        if (existing) {
          if (existing.letter !== word[i]) return false;
          if (existing.dirs.has(dir)) return false;
          overlaps++;
          continue;
        }
        if (dir === 'h' && (get(r - 1, c) || get(r + 1, c))) return false;
        if (dir === 'v' && (get(r, c - 1) || get(r, c + 1))) return false;
      }
      return requireOverlap ? overlaps > 0 : true;
    }

    function place(item, row, col, dir) {
      const coords = [];
      for (let i = 0; i < item.word.length; i++) {
        const r = row + (dir === 'v' ? i : 0);
        const c = col + (dir === 'h' ? i : 0);
        const k = key(r, c);
        if (!cells.has(k)) cells.set(k, { letter: item.word[i], words: new Set(), dirs: new Set() });
        const cell = cells.get(k);
        cell.words.add(item.index);
        cell.dirs.add(dir);
        coords.push(k);
      }
      placements.set(item.index, coords);
    }

    place(ordered[0], 0, 0, 'h');
    for (let n = 1; n < ordered.length; n++) {
      const item = ordered[n];
      const candidates = [];
      for (const [cellKey, cell] of cells.entries()) {
        const [r, c] = cellKey.split(',').map(Number);
        for (let i = 0; i < item.word.length; i++) {
          if (item.word[i] !== cell.letter) continue;
          for (const dir of ['v', 'h']) {
            const row = r - (dir === 'v' ? i : 0);
            const col = c - (dir === 'h' ? i : 0);
            if (!canPlace(item.word, row, col, dir, true)) continue;
            let overlap = 0;
            for (let j = 0; j < item.word.length; j++) {
              const rr = row + (dir === 'v' ? j : 0);
              const cc = col + (dir === 'h' ? j : 0);
              if (get(rr, cc)) overlap++;
            }
            candidates.push({ row, col, dir, overlap, spread: Math.abs(row) + Math.abs(col) });
          }
        }
      }
      candidates.sort((a, b) => b.overlap - a.overlap || a.spread - b.spread);
      if (candidates.length) {
        const best = candidates[0];
        place(item, best.row, best.col, best.dir);
      } else {
        const rows = [...cells.keys()].map(k => Number(k.split(',')[0]));
        let row = Math.max(...rows) + 2;
        while (!canPlace(item.word, row, 0, 'h', false)) row++;
        place(item, row, 0, 'h');
      }
    }

    const coords = [...cells.keys()].map(k => k.split(',').map(Number));
    const minR = Math.min(...coords.map(v => v[0]));
    const minC = Math.min(...coords.map(v => v[1]));
    const normalized = new Map();
    const normalizedPlacements = new Map();
    for (const [k, cell] of cells.entries()) {
      const [r, c] = k.split(',').map(Number);
      normalized.set(`${r - minR},${c - minC}`, cell);
    }
    for (const [wordIndex, wordCoords] of placements.entries()) {
      normalizedPlacements.set(wordIndex, wordCoords.map(k => {
        const [r, c] = k.split(',').map(Number);
        return `${r - minR},${c - minC}`;
      }));
    }
    const maxR = Math.max(...[...normalized.keys()].map(k => Number(k.split(',')[0])));
    const maxC = Math.max(...[...normalized.keys()].map(k => Number(k.split(',')[1])));
    return { cells: normalized, placements: normalizedPlacements, rows: maxR + 1, cols: maxC + 1 };
  }

  function renderCrossword(newWordIndex = null) {
    ui.crossword.replaceChildren();
    ui.crossword.style.gridTemplateColumns = `repeat(${gridData.cols}, var(--cell))`;
    ui.crossword.style.gridTemplateRows = `repeat(${gridData.rows}, var(--cell))`;
    const newCells = new Set(newWordIndex === null ? [] : (gridData.placements.get(newWordIndex) || []));
    let revealOrder = 0;
    for (let r = 0; r < gridData.rows; r++) {
      for (let c = 0; c < gridData.cols; c++) {
        const cellKey = `${r},${c}`;
        const cell = gridData.cells.get(cellKey);
        const el = document.createElement('div');
        el.dataset.key = cellKey;
        if (!cell) {
          el.style.visibility = 'hidden';
          ui.crossword.append(el);
          continue;
        }
        el.className = 'cross-cell';
        const revealedByWord = [...cell.words].some(wordIndex => found.has(wordIndex));
        const revealedByHint = hintedCells.has(cellKey);
        if (revealedByWord || revealedByHint) {
          el.textContent = cell.letter;
          el.classList.add('revealed');
          if (revealedByHint && !revealedByWord) el.classList.add('hint');
          if (newCells.has(cellKey)) {
            el.classList.add('new-word');
            el.style.animationDelay = `${revealOrder * 55}ms`;
            revealOrder++;
          }
        }
        ui.crossword.append(el);
      }
    }
  }

  function wheelGeometry() {
    const size = ui.wheel.clientWidth || 300;
    return { size, center: size / 2, radius: size * 0.36 };
  }

  function renderWheel() {
    ui.wheel.querySelectorAll('.letter-btn').forEach(el => el.remove());
    const count = wheelOrder.length;
    const { center, radius } = wheelGeometry();
    wheelOrder.forEach((letter, index) => {
      const angle = -Math.PI / 2 + index * (Math.PI * 2 / count);
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;
      const button = document.createElement('div');
      button.className = 'letter-btn';
      button.dataset.index = String(index);
      button.textContent = letter;
      button.style.left = `${x}px`;
      button.style.top = `${y}px`;
      ui.wheel.append(button);
    });
    updateTrace();
  }

  function addSelected(index) {
    if (selected.includes(index)) return;
    selected.push(index);
    updateSelectionVisuals();
    tone(360 + selected.length * 34, .032, .022);
    vibrate(5);
  }

  function updateSelectionVisuals() {
    const buttons = [...ui.wheel.querySelectorAll('.letter-btn')];
    buttons.forEach((button, index) => button.classList.toggle('active', selected.includes(index)));
    const word = selected.map(i => wheelOrder[i]).join('');
    ui.wordReadout.textContent = word || 'Swipe through letters';
    ui.wordReadout.className = `word-readout${word ? '' : ' idle'}`;
    updateTrace();
  }

  function updateTrace() {
    const buttons = [...ui.wheel.querySelectorAll('.letter-btn')];
    const { size } = wheelGeometry();
    ui.traceSvg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    const points = selected.map(index => {
      const b = buttons[index];
      return b ? `${parseFloat(b.style.left)},${parseFloat(b.style.top)}` : null;
    }).filter(Boolean);
    ui.traceLine.setAttribute('points', points.join(' '));
  }

  function setIdleReadout() {
    ui.wordReadout.textContent = 'Swipe through letters';
    ui.wordReadout.className = 'word-readout idle';
    ui.message.textContent = '';
    ui.message.className = 'message';
  }

  function submitSelection() {
    const word = selected.map(i => wheelOrder[i]).join('');
    selected = [];
    updateSelectionVisuals();
    if (word.length < 3) {
      flashMessage('Words start at 3 letters', true);
      return;
    }

    const puzzleIndex = currentLevel().words.indexOf(word);
    if (puzzleIndex >= 0 && !found.has(puzzleIndex)) {
      found.add(puzzleIndex);
      showWordResult(word, 'success');
      flashMessage(`${word} found`, false);
      renderCrossword(puzzleIndex);
      updateProgress();
      tone(520, .09, .045, 810);
      vibrate(18);
      if (found.size === currentLevel().words.length) setTimeout(completeLevel, 800);
      persist();
      return;
    }
    if (puzzleIndex >= 0) {
      showWordResult(word, 'success');
      flashMessage('Already on the board', false);
      tone(270, .05, .02);
      return;
    }
    if (currentLevel().bonus.includes(word)) {
      if (bonusFound.has(word)) {
        showWordResult(word, 'bonus');
        flashMessage('Bonus word already collected', false, true);
        return;
      }
      bonusFound.add(word);
      save.bonusPoints += BONUS_WORD_POINTS;
      showWordResult(word, 'bonus');
      flashMessage(`BONUS WORD  +${BONUS_WORD_POINTS} ✦`, false, true);
      animateBonusPoints(BONUS_WORD_POINTS);
      updateBonusUi();
      persist();
      tone(620, .1, .04, 940);
      vibrate([12, 18, 12]);
      return;
    }
    showWordResult(word, 'bad');
    flashMessage('Not in this puzzle’s word list', true);
    tone(160, .06, .02);
  }

  function showWordResult(word, state) {
    ui.wordReadout.textContent = word;
    ui.wordReadout.className = `word-readout ${state}`;
    setTimeout(() => {
      if (!selecting && selected.length === 0) setIdleReadout();
    }, state === 'bad' ? 520 : 700);
  }

  function flashMessage(text, bad, bonus = false) {
    clearTimeout(messageTimer);
    ui.message.textContent = text;
    ui.message.className = `message${bad ? ' bad' : bonus ? ' bonus' : ''}`;
    messageTimer = setTimeout(() => {
      ui.message.textContent = '';
      ui.message.className = 'message';
    }, 1200);
  }

  function updateProgress() {
    ui.wordProgress.textContent = `${found.size} / ${currentLevel().words.length} words`;
  }

  function updateBonusUi() {
    ui.bonusCount.textContent = save.bonusPoints;
    ui.hintCost.textContent = `${HINT_COST} ✦`;
    const ready = save.bonusPoints >= HINT_COST;
    ui.hintButton.disabled = !ready;
    ui.hintButton.classList.toggle('ready', ready);
    ui.hintButton.setAttribute('aria-label', ready ? `Use a hint for ${HINT_COST} bonus points` : `Earn ${HINT_COST - save.bonusPoints} more bonus points for a hint`);
  }

  function useHint() {
    if (save.bonusPoints < HINT_COST) {
      flashMessage(`Earn ${HINT_COST - save.bonusPoints} more bonus points`, true);
      return;
    }
    const candidates = [...gridData.cells.entries()].filter(([cellKey, cell]) => {
      const revealed = [...cell.words].some(wordIndex => found.has(wordIndex)) || hintedCells.has(cellKey);
      return !revealed;
    });
    if (!candidates.length) return;
    const [cellKey] = candidates[Math.floor(Math.random() * candidates.length)];
    hintedCells.add(cellKey);
    save.bonusPoints -= HINT_COST;
    updateBonusUi();
    renderCrossword();
    persist();
    flashMessage(`Hint used  −${HINT_COST} ✦`, false);
    tone(610, .09, .035, 800);
    vibrate(12);
  }

  function shuffleLetters() {
    for (let i = wheelOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wheelOrder[i], wheelOrder[j]] = [wheelOrder[j], wheelOrder[i]];
    }
    selected = [];
    ui.wheel.classList.remove('shuffle');
    void ui.wheel.offsetWidth;
    ui.wheel.classList.add('shuffle');
    setTimeout(() => ui.wheel.classList.remove('shuffle'), 450);
    renderWheel();
    setIdleReadout();
    tone(300, .04, .02, 430);
  }

  function completeLevel() {
    const level = currentLevel();
    save.completed[levelIndex] = true;
    save.unlocked = Math.max(save.unlocked, Math.min(levels.length, levelIndex + 2));
    ui.completeTitle.textContent = level.theme;
    ui.readingText.textContent = level.reading;
    ui.verseRef.textContent = level.verse;
    ui.verseText.textContent = level.verseText;
    ui.nextButton.textContent = 'NEXT';
    ui.completeOverlay.classList.add('visible');
    renderLevelGrid();
    persist();
    celebrate();
    tone(520, .18, .05, 880);
    setTimeout(() => tone(660, .18, .04, 990), 130);
    vibrate([20, 35, 28]);
  }

  function renderLevelGrid() {
    ui.levelGrid.replaceChildren();
    levels.forEach((level, index) => {
      const unlocked = index < save.unlocked;
      const button = document.createElement('button');
      button.type = 'button';
      button.disabled = !unlocked;
      button.className = `level-button${unlocked ? '' : ' locked'}${index === levelIndex ? ' current' : ''}`;
      button.innerHTML = `<strong>${unlocked ? index + 1 : '🔒'}</strong><span>${unlocked ? level.theme : 'Locked'}</span><small>${save.completed[index] ? '✓ Complete' : unlocked ? level.words.length + ' words' : ''}</small>`;
      if (unlocked) button.addEventListener('click', () => loadLevel(index));
      ui.levelGrid.append(button);
    });
  }

  function nearestLetter(clientX, clientY, threshold = 54) {
    const buttons = [...ui.wheel.querySelectorAll('.letter-btn')];
    let best = null;
    let bestDistance = threshold;
    for (let i = 0; i < buttons.length; i++) {
      const rect = buttons[i].getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const distance = Math.hypot(clientX - cx, clientY - cy);
      if (distance <= bestDistance) {
        best = i;
        bestDistance = distance;
      }
    }
    return best;
  }

  function sweepForLetters(from, to) {
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(distance / 12));
    for (let step = 1; step <= steps; step++) {
      const t = step / steps;
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t;
      const index = nearestLetter(x, y, 50);
      if (index !== null) addSelected(index);
    }
  }

  ui.wheel.addEventListener('pointerdown', event => {
    const index = nearestLetter(event.clientX, event.clientY, 62);
    if (index === null) return;
    selecting = true;
    selected = [];
    lastPointer = { x: event.clientX, y: event.clientY };
    ui.wheel.classList.add('selecting');
    addSelected(index);
    ui.wheel.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }, { passive: false });

  ui.wheel.addEventListener('pointermove', event => {
    if (!selecting) return;
    const next = { x: event.clientX, y: event.clientY };
    if (lastPointer) sweepForLetters(lastPointer, next);
    else {
      const index = nearestLetter(next.x, next.y, 50);
      if (index !== null) addSelected(index);
    }
    lastPointer = next;
    event.preventDefault();
  }, { passive: false });

  function endSelection(event) {
    if (!selecting) return;
    selecting = false;
    lastPointer = null;
    ui.wheel.classList.remove('selecting');
    submitSelection();
    event?.preventDefault?.();
  }

  ui.wheel.addEventListener('pointerup', endSelection, { passive: false });
  ui.wheel.addEventListener('pointercancel', endSelection, { passive: false });

  function animateBonusPoints(amount) {
    const wheelRect = ui.wheel.getBoundingClientRect();
    const pillRect = ui.bonusPill.getBoundingClientRect();
    const startX = wheelRect.left + wheelRect.width / 2;
    const startY = wheelRect.top + wheelRect.height * .38;
    const endX = pillRect.left + pillRect.width / 2;
    const endY = pillRect.top + pillRect.height / 2;
    const chip = document.createElement('div');
    chip.className = 'bonus-fly';
    chip.textContent = `+${amount} ✦`;
    chip.style.left = `${startX}px`;
    chip.style.top = `${startY}px`;
    chip.style.setProperty('--tx', `${endX - startX}px`);
    chip.style.setProperty('--ty', `${endY - startY}px`);
    document.body.append(chip);
    setTimeout(() => chip.remove(), 900);
    ui.bonusPill.classList.remove('bump');
    setTimeout(() => {
      ui.bonusPill.classList.add('bump');
      setTimeout(() => ui.bonusPill.classList.remove('bump'), 550);
    }, 560);
  }

  function celebrate() {
    ui.celebrationLayer.replaceChildren();
    for (let i = 0; i < 28; i++) {
      const piece = document.createElement('i');
      piece.className = 'confetti';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.animationDelay = `${Math.random() * .35}s`;
      piece.style.animationDuration = `${1.3 + Math.random() * .8}s`;
      piece.style.setProperty('--drift', `${-70 + Math.random() * 140}px`);
      ui.celebrationLayer.append(piece);
    }
    setTimeout(() => ui.celebrationLayer.replaceChildren(), 2400);
  }

  function buildSceneSparkles() {
    ui.sceneSparkles.replaceChildren();
    for (let i = 0; i < 10; i++) {
      const sparkle = document.createElement('i');
      sparkle.className = 'scene-sparkle';
      sparkle.style.left = `${8 + Math.random() * 84}%`;
      sparkle.style.top = `${20 + Math.random() * 60}%`;
      sparkle.style.animationDelay = `${-Math.random() * 4}s`;
      sparkle.style.animationDuration = `${3.4 + Math.random() * 2.5}s`;
      ui.sceneSparkles.append(sparkle);
    }
  }

  ui.shuffleButton.addEventListener('click', shuffleLetters);
  ui.hintButton.addEventListener('click', useHint);
  ui.levelsButton.addEventListener('click', () => ui.levelDrawer.classList.add('open'));
  ui.closeLevelsButton.addEventListener('click', () => ui.levelDrawer.classList.remove('open'));
  ui.startButton.addEventListener('click', () => {
    ui.startOverlay.classList.remove('visible');
    tone(420, .08, .035, 620);
  });
  ui.replayButton.addEventListener('click', () => loadLevel(levelIndex));
  ui.nextButton.addEventListener('click', () => loadLevel(levelIndex === levels.length - 1 ? 0 : levelIndex + 1));
  ui.soundButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    ui.soundButton.textContent = soundEnabled ? '♪' : '×';
    ui.soundButton.setAttribute('aria-label', soundEnabled ? 'Mute sound' : 'Turn sound on');
    if (soundEnabled) tone(440, .06, .03, 640);
  });

  window.addEventListener('resize', () => {
    if (!selecting) renderWheel();
  });

  function vibrate(pattern) {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  }

  function tone(startFreq, duration = .06, volume = .03, endFreq = null) {
    if (!soundEnabled) return;
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(.001, now + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + duration + .01);
    } catch {}
  }

  buildSceneSparkles();
  loadLevel(levelIndex);
})();
