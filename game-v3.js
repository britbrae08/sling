(() => {
  'use strict';

  const HINT_COST = 5;
  const BONUS_WORD_POINTS = 1;
  const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
  const saveKey = 'faithWordsProgressV3';

  // Match Wordscapes' early wheel-size cadence:
  // Levels 1-4: 3 letters; 5-12: 4 letters; 13-80: 5 letters; 81+: 6 letters.
  const levels = [
    {
      theme: 'God', letters: 'GOD', words: ['GOD', 'DOG'],
      verse: 'Psalm 46:10',
      verseText: 'Be still and know that He is God.',
      reading: 'Faith begins with remembering who God is. Before solving every problem, there is value in becoming still enough to remember that God remains present and trustworthy.'
    },
    {
      theme: 'Ram', letters: 'RAM', words: ['RAM', 'ARM', 'MAR'],
      verse: 'Genesis 22:13',
      verseText: 'Abraham saw a ram provided at the right moment.',
      reading: 'The story of Abraham reminds us that provision can appear in ways we did not expect. What looks impossible from one angle may look very different when God opens another way.'
    },
    {
      theme: 'Ten', letters: 'TEN', words: ['TEN', 'NET'],
      verse: 'Exodus 20',
      verseText: 'God gave His people words to guide how they lived.',
      reading: 'The Ten Commandments were not random rules. They described a life shaped by loyalty to God, respect for people, and a community built on trust.'
    },
    {
      theme: 'One', letters: 'ONE', words: ['ONE', 'EON'],
      verse: 'Deuteronomy 6:4',
      verseText: 'The Lord our God is one.',
      reading: 'Scripture repeatedly calls God’s people back to wholehearted devotion. A divided life pulls in many directions; faith keeps returning the heart to the One who matters most.'
    },
    {
      theme: 'Pray', letters: 'PRAY', words: ['PRAY', 'PAY', 'RAY'],
      verse: '1 Thessalonians 5:17',
      verseText: 'Keep returning to prayer.',
      reading: 'Prayer does not have to be complicated or long. It can become a rhythm woven through ordinary life: gratitude, questions, requests, silence, and trust.'
    },
    {
      theme: 'Love', letters: 'LOVE', words: ['LOVE', 'VOLE'],
      verse: '1 Corinthians 13:13',
      verseText: 'Faith, hope, and love remain—and love is greatest.',
      reading: 'Biblical love is more than a feeling. It becomes visible in patience, kindness, truthfulness, forgiveness, and the choices we make toward other people.'
    },
    {
      theme: 'Hope', letters: 'HOPE', words: ['HOPE', 'HOP', 'HOE'],
      verse: 'Romans 15:13',
      verseText: 'May God fill you with hope as you trust Him.',
      reading: 'Hope gives us a reason to keep moving when we cannot yet see the outcome. Christian hope is rooted not merely in optimism, but in the character of God.'
    },
    {
      theme: 'Lamb', letters: 'LAMB', words: ['LAMB', 'BALM', 'LAB'],
      verse: 'John 1:29',
      verseText: 'John pointed to Jesus as the Lamb of God.',
      reading: 'The image of a lamb runs through Scripture and points toward sacrifice, rescue, and grace. The familiar symbol ultimately directs attention to Jesus.'
    },
    {
      theme: 'Star', letters: 'STAR', words: ['STAR', 'ART', 'RAT', 'TAR'],
      verse: 'Matthew 2:10',
      verseText: 'The travelers rejoiced when they saw the star.',
      reading: 'The star in the nativity story became a sign that drew people toward Jesus. Sometimes a small point of light is enough to help us take the next faithful step.'
    },
    {
      theme: 'King', letters: 'KING', words: ['KING', 'KIN', 'INK'],
      verse: 'Revelation 19:16',
      verseText: 'Jesus is described as King of kings and Lord of lords.',
      reading: 'Calling Jesus King is a statement about more than admiration. It asks who ultimately has authority over our values, our direction, and the way we choose to live.'
    },
    {
      theme: 'Rock', letters: 'ROCK', words: ['ROCK', 'CORK'],
      verse: 'Psalm 18:2',
      verseText: 'The Lord is pictured as a rock and a place of safety.',
      reading: 'A rock is steady when everything around it moves. Scripture uses that picture to describe the security of placing our trust in God rather than in changing circumstances.'
    },
    {
      theme: 'Wise', letters: 'WISE', words: ['WISE', 'SEW', 'SUE', 'USE'],
      verse: 'James 1:5',
      verseText: 'If you need wisdom, ask God for it.',
      reading: 'Wisdom is more than knowing facts. It is learning to recognize what matters, choose well, listen carefully, and apply truth to real life.'
    },
    {
      theme: 'Faith', letters: 'FAITH', words: ['FAITH', 'FIT', 'HIT', 'HAT'],
      verse: 'Hebrews 11:1',
      verseText: 'Faith gives confidence in what we hope for even when we cannot yet see it.',
      reading: 'Faith does not mean pretending uncertainty is gone. It means choosing to trust God while the whole path is still unfolding.'
    },
    {
      theme: 'Grace', letters: 'GRACE', words: ['GRACE', 'RACE', 'CARE', 'GEAR', 'AGE'],
      verse: 'Ephesians 2:8',
      verseText: 'Grace is God’s gift; it is not something we earn.',
      reading: 'Grace changes the starting point. Instead of proving our worth before approaching God, we begin by receiving what He offers and then live from gratitude.'
    },
    {
      theme: 'Peace', letters: 'PEACE', words: ['PEACE', 'PACE', 'CAPE', 'ACE', 'PEA'],
      verse: 'John 14:27',
      verseText: 'Jesus offers a peace different from what the world gives.',
      reading: 'Peace is not always the absence of pressure. Sometimes it is the steady presence of Christ while the pressure is still around us.'
    }
  ];

  // Common words are instant. Anything else of 3+ letters is checked against a
  // real dictionary service so valid extra words are not limited to a curated bonus list.
  const localDictionary = new Set([
    'GOD','DOG','RAM','ARM','MAR','TEN','NET','ONE','EON',
    'PRAY','PAY','RAY','PAR','RAP','YAP',
    'LOVE','VOLE',
    'HOPE','HOP','HOE',
    'LAMB','BALM','LAB',
    'STAR','ART','RAT','TAR','SAT',
    'KING','KIN','INK',
    'ROCK','CORK','ORC',
    'WISE','SEW','SUE','USE',
    'FAITH','FIT','HIT','HAT','FAT','AFT',
    'GRACE','RACE','CARE','GEAR','AGE','ACRE','CAR','EAR','ARE','ARC','ERA','RAG',
    'PEACE','PACE','CAPE','ACE','PEA','APE','CAP'
  ]);

  const ui = {
    levelLabel: document.getElementById('levelLabel'),
    themeLabel: document.getElementById('themeLabel'),
    themePrompt: document.getElementById('themePrompt'),
    wordProgress: document.getElementById('wordProgress'),
    crossword: document.getElementById('crossword'),
    wordReadout: document.getElementById('wordReadout'),
    message: document.getElementById('message'),
    wheel: document.getElementById('letterWheel'),
    traceLine: document.getElementById('traceLine'),
    bonusCount: document.getElementById('bonusCount'),
    hintButton: document.getElementById('hintButton'),
    hintCostLabel: document.getElementById('hintCostLabel'),
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
    rewardAmount: document.getElementById('rewardAmount'),
    nextButton: document.getElementById('nextButton'),
    replayButton: document.getElementById('replayButton'),
    bonusBurst: document.getElementById('bonusBurst')
  };

  let save = loadSave();
  let levelIndex = Math.min(save.lastLevel || 0, levels.length - 1);
  let found = new Set();
  let hintedCells = new Set();
  let wheelOrder = [];
  let selected = [];
  let selecting = false;
  let gridData = null;
  let soundEnabled = true;
  let audioCtx = null;
  let messageTimer = null;
  let validating = false;
  const dictionaryCache = new Map();

  function loadSave() {
    try {
      const raw = JSON.parse(localStorage.getItem(saveKey) || '{}');
      const old = JSON.parse(localStorage.getItem('faithWordsProgressV2') || '{}');
      return {
        unlocked: Math.max(1, Number(raw.unlocked || old.unlocked) || 1),
        lastLevel: Number(raw.lastLevel ?? old.lastLevel) || 0,
        hintPoints: Number(raw.hintPoints ?? old.bonus) || 0,
        completed: raw.completed || old.completed || {},
        bonusWords: raw.bonusWords || old.bonusWords || {}
      };
    } catch {
      return { unlocked: 1, lastLevel: 0, hintPoints: 0, completed: {}, bonusWords: {} };
    }
  }

  function persist() {
    save.lastLevel = levelIndex;
    localStorage.setItem(saveKey, JSON.stringify(save));
  }

  function currentLevel() { return levels[levelIndex]; }
  function levelBonusSet() {
    const stored = save.bonusWords[levelIndex] || [];
    return new Set(stored);
  }

  function expectedWheelSize(levelNumber) {
    if (levelNumber <= 4) return 3;
    if (levelNumber <= 12) return 4;
    if (levelNumber <= 80) return 5;
    return 6;
  }

  function loadLevel(index) {
    levelIndex = Math.max(0, Math.min(index, levels.length - 1));
    found = new Set();
    hintedCells = new Set();
    selected = [];
    selecting = false;
    validating = false;
    wheelOrder = currentLevel().letters.split('');
    gridData = buildCrossword(currentLevel().words);
    ui.completeOverlay.classList.remove('visible');
    ui.levelDrawer.classList.remove('open');
    ui.levelLabel.textContent = `LEVEL ${levelIndex + 1}`;
    ui.themeLabel.textContent = currentLevel().theme;
    const wheelSize = expectedWheelSize(levelIndex + 1);
    ui.themePrompt.textContent = levelIndex < 4
      ? `${wheelSize} letters • only 3-letter words`
      : `${wheelSize} letters • find every word`;
    ui.bonusCount.textContent = save.hintPoints;
    if (ui.hintCostLabel) ui.hintCostLabel.textContent = HINT_COST;
    setIdleReadout();
    renderCrossword();
    renderWheel();
    updateProgress();
    renderLevelGrid();
    persist();
  }

  function buildCrossword(words) {
    const ordered = words.map((word, index) => ({ word, index })).sort((a,b) => b.word.length - a.word.length || a.index - b.index);
    const cells = new Map();
    const placements = new Map();
    const occupied = new Map();

    const key = (r,c) => `${r},${c}`;
    const get = (r,c) => cells.get(key(r,c));

    function canPlace(word, row, col, dir) {
      const dr = dir === 'v' ? 1 : 0;
      const dc = dir === 'h' ? 1 : 0;
      const before = get(row - dr, col - dc);
      const after = get(row + dr * word.length, col + dc * word.length);
      if (before || after) return false;

      let overlaps = 0;
      for (let i = 0; i < word.length; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        const existing = get(r,c);
        if (existing && existing.letter !== word[i]) return false;
        if (existing) overlaps++;

        if (!existing) {
          if (dir === 'h' && (get(r - 1, c) || get(r + 1, c))) return false;
          if (dir === 'v' && (get(r, c - 1) || get(r, c + 1))) return false;
        } else {
          const dirs = occupied.get(key(r,c)) || new Set();
          if (dirs.has(dir)) return false;
        }
      }
      return cells.size === 0 || overlaps > 0;
    }

    function place(item, row, col, dir) {
      const coords = [];
      const dr = dir === 'v' ? 1 : 0;
      const dc = dir === 'h' ? 1 : 0;
      for (let i = 0; i < item.word.length; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        const k = key(r,c);
        if (!cells.has(k)) cells.set(k, { letter: item.word[i], words: new Set() });
        cells.get(k).words.add(item.index);
        if (!occupied.has(k)) occupied.set(k, new Set());
        occupied.get(k).add(dir);
        coords.push(k);
      }
      placements.set(item.index, coords);
    }

    place(ordered[0], 0, 0, 'h');

    for (let n = 1; n < ordered.length; n++) {
      const item = ordered[n];
      const candidates = [];
      for (const [cellKey, cell] of cells.entries()) {
        const [r,c] = cellKey.split(',').map(Number);
        for (let i = 0; i < item.word.length; i++) {
          if (item.word[i] !== cell.letter) continue;
          for (const dir of ['v','h']) {
            const row = r - (dir === 'v' ? i : 0);
            const col = c - (dir === 'h' ? i : 0);
            if (!canPlace(item.word, row, col, dir)) continue;
            let overlap = 0;
            for (let j = 0; j < item.word.length; j++) {
              const rr = row + (dir === 'v' ? j : 0);
              const cc = col + (dir === 'h' ? j : 0);
              if (get(rr,cc)) overlap++;
            }
            candidates.push({ row, col, dir, overlap, score: Math.abs(row) + Math.abs(col) });
          }
        }
      }
      candidates.sort((a,b) => b.overlap - a.overlap || a.score - b.score);
      if (candidates.length) {
        const best = candidates[0];
        place(item, best.row, best.col, best.dir);
      } else {
        const rows = [...cells.keys()].map(k => Number(k.split(',')[0]));
        let nextRow = Math.max(...rows) + 2;
        while (!canPlace(item.word, nextRow, 0, 'h')) nextRow += 2;
        place(item, nextRow, 0, 'h');
      }
    }

    const coords = [...cells.keys()].map(k => k.split(',').map(Number));
    const minR = Math.min(...coords.map(v => v[0]));
    const minC = Math.min(...coords.map(v => v[1]));
    const normalized = new Map();
    for (const [k,cell] of cells.entries()) {
      const [r,c] = k.split(',').map(Number);
      normalized.set(`${r-minR},${c-minC}`, cell);
    }
    const maxR = Math.max(...[...normalized.keys()].map(k => Number(k.split(',')[0])));
    const maxC = Math.max(...[...normalized.keys()].map(k => Number(k.split(',')[1])));
    return { cells: normalized, rows: maxR + 1, cols: maxC + 1 };
  }

  function renderCrossword(newWordIndex = null) {
    ui.crossword.replaceChildren();
    ui.crossword.style.gridTemplateColumns = `repeat(${gridData.cols}, var(--cell))`;
    ui.crossword.style.gridTemplateRows = `repeat(${gridData.rows}, var(--cell))`;

    let revealOrder = 0;
    for (let r = 0; r < gridData.rows; r++) {
      for (let c = 0; c < gridData.cols; c++) {
        const k = `${r},${c}`;
        const cell = gridData.cells.get(k);
        const el = document.createElement('div');
        if (!cell) {
          el.style.visibility = 'hidden';
          ui.crossword.append(el);
          continue;
        }
        el.className = 'cross-cell';
        const revealedByWord = [...cell.words].some(wordIndex => found.has(wordIndex));
        const revealedByHint = hintedCells.has(k);
        if (revealedByWord || revealedByHint) {
          el.textContent = cell.letter;
          el.classList.add('revealed');
          if (revealedByHint && !revealedByWord) el.classList.add('hint');
          if (newWordIndex !== null && cell.words.has(newWordIndex)) {
            el.classList.add('word-pop');
            el.style.animationDelay = `${revealOrder * 55}ms`;
            revealOrder++;
          }
        }
        ui.crossword.append(el);
      }
    }
  }

  function renderWheel() {
    ui.wheel.querySelectorAll('.letter-btn').forEach(el => el.remove());
    const count = wheelOrder.length;
    const radius = count <= 3 ? 104 : count === 4 ? 108 : 112;
    wheelOrder.forEach((letter, index) => {
      const angle = -Math.PI / 2 + index * (Math.PI * 2 / count);
      const x = 150 + Math.cos(angle) * radius;
      const y = 150 + Math.sin(angle) * radius;
      const button = document.createElement('button');
      button.className = 'letter-btn';
      button.type = 'button';
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
    tone(350 + selected.length * 38, .035, .025);
  }

  function updateSelectionVisuals() {
    const buttons = [...ui.wheel.querySelectorAll('.letter-btn')];
    buttons.forEach((button, index) => button.classList.toggle('active', selected.includes(index)));
    const word = selected.map(i => wheelOrder[i]).join('');
    ui.wordReadout.textContent = word || 'Swipe through letters';
    ui.wordReadout.classList.toggle('idle', !word);
    updateTrace();
  }

  function updateTrace() {
    const buttons = [...ui.wheel.querySelectorAll('.letter-btn')];
    const points = selected.map(index => {
      const b = buttons[index];
      if (!b) return null;
      return `${parseFloat(b.style.left)},${parseFloat(b.style.top)}`;
    }).filter(Boolean);
    ui.traceLine.setAttribute('points', points.join(' '));
  }

  function setIdleReadout() {
    ui.wordReadout.textContent = 'Swipe through letters';
    ui.wordReadout.classList.add('idle');
    ui.message.textContent = '';
    ui.message.classList.remove('bad');
  }

  function canSpellFromRack(word, rack) {
    const counts = {};
    for (const ch of rack) counts[ch] = (counts[ch] || 0) + 1;
    for (const ch of word) {
      if (!counts[ch]) return false;
      counts[ch]--;
    }
    return true;
  }

  async function isDictionaryWord(word) {
    if (localDictionary.has(word)) return true;
    if (dictionaryCache.has(word)) return dictionaryCache.get(word);

    try {
      const response = await fetch(`${DICTIONARY_API}${encodeURIComponent(word.toLowerCase())}`, {
        method: 'GET',
        cache: 'force-cache'
      });
      const valid = response.ok;
      dictionaryCache.set(word, valid);
      return valid;
    } catch {
      dictionaryCache.set(word, false);
      return false;
    }
  }

  async function submitSelection() {
    if (validating) return;
    const word = selected.map(i => wheelOrder[i]).join('');
    selected = [];
    updateSelectionVisuals();

    if (word.length < 3) {
      flashMessage('Words start at 3 letters', true);
      return;
    }
    if (!canSpellFromRack(word, currentLevel().letters)) {
      flashMessage('Try another word', true);
      return;
    }

    const index = currentLevel().words.indexOf(word);
    if (index >= 0 && !found.has(index)) {
      found.add(index);
      flashMessage(word, false);
      renderCrossword(index);
      updateProgress();
      tone(520, .08, .045, 760);
      vibrate(18);
      if (found.size === currentLevel().words.length) setTimeout(completeLevel, 720);
      persist();
      return;
    }
    if (index >= 0) {
      flashMessage('Already found', false);
      tone(260, .05, .02);
      return;
    }

    const bonusWords = levelBonusSet();
    if (bonusWords.has(word)) {
      flashMessage('Bonus word already counted', false);
      tone(280, .05, .02);
      return;
    }

    validating = true;
    flashMessage(`Checking ${word.toLowerCase()}…`, false, 4000);
    const valid = await isDictionaryWord(word);
    validating = false;

    if (valid) {
      bonusWords.add(word);
      save.bonusWords[levelIndex] = [...bonusWords];
      save.hintPoints += BONUS_WORD_POINTS;
      ui.bonusCount.textContent = save.hintPoints;
      flashMessage(`${word}  +${BONUS_WORD_POINTS} HINT POINT`, false, 1500);
      animateBonusPoint();
      tone(660, .1, .045, 960);
      vibrate(12);
      persist();
      return;
    }

    flashMessage('Not in the dictionary', true);
    tone(160, .06, .02);
  }

  function flashMessage(text, bad, duration = 1100) {
    clearTimeout(messageTimer);
    ui.message.textContent = text;
    ui.message.classList.toggle('bad', !!bad);
    messageTimer = setTimeout(() => {
      ui.message.textContent = '';
      ui.message.classList.remove('bad');
      if (!selecting && selected.length === 0) setIdleReadout();
    }, duration);
  }

  function updateProgress() {
    ui.wordProgress.textContent = `${found.size} / ${currentLevel().words.length} words`;
  }

  function useHint() {
    if (save.hintPoints < HINT_COST) {
      flashMessage(`Need ${HINT_COST} hint points`, true);
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
    flashMessage(`Hint used • -${HINT_COST} points`, false);
    tone(610, .09, .035, 800);
    persist();
  }

  function shuffleLetters() {
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
  }

  function completeLevel() {
    const level = currentLevel();
    save.completed[levelIndex] = true;
    save.unlocked = Math.max(save.unlocked, Math.min(levels.length, levelIndex + 2));
    ui.completeTitle.textContent = level.theme;
    ui.readingText.textContent = level.reading;
    ui.verseText.textContent = level.verseText;
    ui.verseRef.textContent = level.verse;
    ui.rewardAmount.textContent = save.hintPoints;
    ui.nextButton.textContent = levelIndex === levels.length - 1 ? 'START AGAIN' : 'NEXT';
    ui.completeOverlay.classList.add('visible');
    ui.completeOverlay.classList.remove('celebrate');
    void ui.completeOverlay.offsetWidth;
    ui.completeOverlay.classList.add('celebrate');
    launchConfetti();
    renderLevelGrid();
    persist();
    tone(520, .18, .05, 880);
    setTimeout(() => tone(660, .18, .04, 990), 130);
  }

  function renderLevelGrid() {
    ui.levelGrid.replaceChildren();
    levels.forEach((level, index) => {
      const unlocked = index < save.unlocked;
      const button = document.createElement('button');
      button.type = 'button';
      button.disabled = !unlocked;
      button.className = `level-button${unlocked ? '' : ' locked'}${index === levelIndex ? ' current' : ''}`;
      button.innerHTML = `<strong>${unlocked ? index + 1 : '🔒'}</strong><span>${unlocked ? level.theme : 'Locked'}</span><small>${unlocked ? level.letters.length + ' letters' : ''}</small>`;
      if (unlocked) button.addEventListener('click', () => loadLevel(index));
      ui.levelGrid.append(button);
    });
  }

  function wheelPoint(event) {
    const rect = ui.wheel.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (300 / rect.width),
      y: (event.clientY - rect.top) * (300 / rect.height)
    };
  }

  function nearestLetterIndex(event, maxDistance = 50) {
    const p = wheelPoint(event);
    const buttons = [...ui.wheel.querySelectorAll('.letter-btn')];
    let best = null;
    let bestDistance = Infinity;
    buttons.forEach((button, index) => {
      const x = parseFloat(button.style.left);
      const y = parseFloat(button.style.top);
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestDistance) {
        bestDistance = d;
        best = index;
      }
    });
    return bestDistance <= maxDistance ? best : null;
  }

  function sampleSwipeBetween(a, b) {
    const distance = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    const steps = Math.max(1, Math.ceil(distance / 7));
    for (let step = 1; step <= steps; step++) {
      const t = step / steps;
      const synthetic = {
        clientX: a.clientX + (b.clientX - a.clientX) * t,
        clientY: a.clientY + (b.clientY - a.clientY) * t
      };
      const index = nearestLetterIndex(synthetic, 52);
      if (index !== null) addSelected(index);
    }
  }

  let lastSwipeEvent = null;
  ui.wheel.addEventListener('pointerdown', event => {
    if (validating) return;
    const index = nearestLetterIndex(event, 58);
    if (index === null) return;
    selecting = true;
    selected = [];
    lastSwipeEvent = { clientX: event.clientX, clientY: event.clientY };
    addSelected(index);
    ui.wheel.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }, { passive: false });

  ui.wheel.addEventListener('pointermove', event => {
    if (!selecting) return;
    if (lastSwipeEvent) sampleSwipeBetween(lastSwipeEvent, event);
    const index = nearestLetterIndex(event, 54);
    if (index !== null) addSelected(index);
    lastSwipeEvent = { clientX: event.clientX, clientY: event.clientY };
    event.preventDefault();
  }, { passive: false });

  function endSelection(event) {
    if (!selecting) return;
    selecting = false;
    lastSwipeEvent = null;
    submitSelection();
    event?.preventDefault?.();
  }

  ui.wheel.addEventListener('pointerup', endSelection, { passive: false });
  ui.wheel.addEventListener('pointercancel', endSelection, { passive: false });

  function animateBonusPoint() {
    if (!ui.bonusBurst) return;
    ui.bonusBurst.textContent = `+${BONUS_WORD_POINTS}`;
    ui.bonusBurst.classList.remove('fly');
    void ui.bonusBurst.offsetWidth;
    ui.bonusBurst.classList.add('fly');
    const pill = ui.bonusCount.closest('.bonus-pill');
    pill?.classList.remove('bump');
    void pill?.offsetWidth;
    pill?.classList.add('bump');
  }

  function launchConfetti() {
    const host = ui.completeOverlay;
    host.querySelectorAll('.confetti').forEach(el => el.remove());
    for (let i = 0; i < 24; i++) {
      const piece = document.createElement('i');
      piece.className = 'confetti';
      piece.style.left = `${10 + Math.random() * 80}%`;
      piece.style.animationDelay = `${Math.random() * 260}ms`;
      piece.style.setProperty('--drift', `${-60 + Math.random() * 120}px`);
      piece.style.setProperty('--spin', `${180 + Math.random() * 540}deg`);
      host.append(piece);
      setTimeout(() => piece.remove(), 1900);
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

  function vibrate(pattern) {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  }

  function tone(startFreq, duration=.06, volume=.03, endFreq=null) {
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

  loadLevel(levelIndex);
})();