(() => {
  'use strict';

  const levels = [
    { theme: 'Faith', letters: 'FAITH', words: ['FAITH','FIT','HIT','HAT','FAT'], verse: 'Hebrews 11:1', text: 'Now faith is the substance of things hoped for, the evidence of things not seen.' },
    { theme: 'Grace', letters: 'GRACE', words: ['GRACE','RACE','CARE','GEAR','AGE'], verse: 'Ephesians 2:8', text: 'For by grace are ye saved through faith; and that not of yourselves.' },
    { theme: 'Peace', letters: 'PEACE', words: ['PEACE','PACE','CAPE','ACE','PEA'], verse: 'John 14:27', text: 'Peace I leave with you, my peace I give unto you.' },
    { theme: 'Praise', letters: 'PRAISE', words: ['PRAISE','RAISE','PAIR','PEAR','SIRE'], verse: 'Psalm 150:6', text: 'Let every thing that hath breath praise the LORD.' },
    { theme: 'Angel', letters: 'ANGEL', words: ['ANGEL','ANGLE','LEAN','LANE','GLEAN'], verse: 'Psalm 91:11', text: 'For he shall give his angels charge over thee, to keep thee in all thy ways.' },
    { theme: 'Bread', letters: 'BREAD', words: ['BREAD','BEAR','DEAR','READ','BAD'], verse: 'John 6:35', text: 'I am the bread of life: he that cometh to me shall never hunger.' },
    { theme: 'Heart', letters: 'HEART', words: ['HEART','EARTH','HEAR','RATE','TEAR'], verse: 'Proverbs 4:23', text: 'Keep thy heart with all diligence; for out of it are the issues of life.' },
    { theme: 'Light', letters: 'LIGHT', words: ['LIGHT','HILT','GILT','LIT','HIT'], verse: 'Matthew 5:14', text: 'Ye are the light of the world.' },
    { theme: 'Water', letters: 'WATER', words: ['WATER','WEAR','RATE','TEAR','RAW'], verse: 'John 4:14', text: 'The water that I shall give him shall be in him a well of water springing up into everlasting life.' },
    { theme: 'Stone', letters: 'STONE', words: ['STONE','TONE','NOTE','ONES','SENT'], verse: 'Psalm 118:22', text: 'The stone which the builders refused is become the head stone of the corner.' },
    { theme: 'Crown', letters: 'CROWN', words: ['CROWN','WORN','CROW','OWN','NOW'], verse: 'James 1:12', text: 'He shall receive the crown of life, which the Lord hath promised to them that love him.' },
    { theme: 'Prayer', letters: 'PRAYER', words: ['PRAYER','PRAY','RARE','YEAR','PAYER'], verse: '1 Thessalonians 5:17', text: 'Pray without ceasing.' },
    { theme: 'Spirit', letters: 'SPIRIT', words: ['SPIRIT','STRIP','TRIP','SIR','TIP'], verse: 'Galatians 5:25', text: 'If we live in the Spirit, let us also walk in the Spirit.' },
    { theme: 'Christ', letters: 'CHRIST', words: ['CHRIST','RICH','THIS','HIS','SIT'], verse: 'Philippians 4:13', text: 'I can do all things through Christ which strengtheneth me.' },
    { theme: 'Gospel', letters: 'GOSPEL', words: ['GOSPEL','POSE','POLE','SLOPE','LOG'], verse: 'Mark 16:15', text: 'Go ye into all the world, and preach the gospel to every creature.' }
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
    traceLine: document.getElementById('traceLine'),
    lightCount: document.getElementById('lightCount'),
    hintButton: document.getElementById('hintButton'),
    hintCount: document.getElementById('hintCount'),
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
    verseText: document.getElementById('verseText'),
    verseRef: document.getElementById('verseRef'),
    rewardAmount: document.getElementById('rewardAmount'),
    nextButton: document.getElementById('nextButton'),
    replayButton: document.getElementById('replayButton')
  };

  const saveKey = 'faithWordsProgressV1';
  let save = loadSave();
  let levelIndex = Math.min(save.lastLevel || 0, levels.length - 1);
  let found = new Set();
  let hintedCells = new Set();
  let hintCount = 3;
  let wheelOrder = [];
  let selected = [];
  let selecting = false;
  let gridData = null;
  let soundEnabled = true;
  let audioCtx = null;
  let messageTimer = null;

  function loadSave() {
    try {
      const raw = JSON.parse(localStorage.getItem(saveKey) || '{}');
      return {
        unlocked: Math.max(1, Number(raw.unlocked) || 1),
        lastLevel: Number(raw.lastLevel) || 0,
        light: Number(raw.light) || 0,
        completed: raw.completed || {}
      };
    } catch {
      return { unlocked: 1, lastLevel: 0, light: 0, completed: {} };
    }
  }

  function persist() {
    save.lastLevel = levelIndex;
    localStorage.setItem(saveKey, JSON.stringify(save));
  }

  function currentLevel() { return levels[levelIndex]; }

  function loadLevel(index) {
    levelIndex = Math.max(0, Math.min(index, levels.length - 1));
    found = new Set();
    hintedCells = new Set();
    hintCount = 3;
    selected = [];
    selecting = false;
    wheelOrder = currentLevel().letters.split('');
    gridData = buildCrossword(currentLevel().words);
    ui.completeOverlay.classList.remove('visible');
    ui.levelDrawer.classList.remove('open');
    ui.levelLabel.textContent = `LEVEL ${levelIndex + 1}`;
    ui.themeLabel.textContent = currentLevel().theme;
    ui.themePrompt.textContent = levelIndex < 3 ? 'Connect the letters. Find every word.' : 'A new set of words is waiting.';
    ui.hintCount.textContent = hintCount;
    ui.lightCount.textContent = save.light;
    setIdleReadout();
    renderCrossword();
    renderWheel();
    updateProgress();
    renderLevelGrid();
    persist();
  }

  function buildCrossword(words) {
    const ordered = words.map((word, index) => ({ word, index })).sort((a,b) => b.word.length - a.word.length);
    const cells = new Map();
    const placements = new Map();

    function key(r,c) { return `${r},${c}`; }
    function get(r,c) { return cells.get(key(r,c)); }
    function canPlace(word, row, col, dir) {
      for (let i = 0; i < word.length; i++) {
        const r = row + (dir === 'v' ? i : 0);
        const c = col + (dir === 'h' ? i : 0);
        const existing = get(r,c);
        if (existing && existing.letter !== word[i]) return false;
      }
      return true;
    }
    function place(item, row, col, dir) {
      const coords = [];
      for (let i = 0; i < item.word.length; i++) {
        const r = row + (dir === 'v' ? i : 0);
        const c = col + (dir === 'h' ? i : 0);
        const k = key(r,c);
        if (!cells.has(k)) cells.set(k, { letter: item.word[i], words: new Set() });
        cells.get(k).words.add(item.index);
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
        const nextRow = Math.max(...rows) + 2;
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

  function renderCrossword() {
    ui.crossword.replaceChildren();
    ui.crossword.style.gridTemplateColumns = `repeat(${gridData.cols}, var(--cell))`;
    ui.crossword.style.gridTemplateRows = `repeat(${gridData.rows}, var(--cell))`;

    for (let r = 0; r < gridData.rows; r++) {
      for (let c = 0; c < gridData.cols; c++) {
        const key = `${r},${c}`;
        const cell = gridData.cells.get(key);
        const el = document.createElement('div');
        if (!cell) {
          el.style.visibility = 'hidden';
          ui.crossword.append(el);
          continue;
        }
        el.className = 'cross-cell';
        const revealedByWord = [...cell.words].some(wordIndex => found.has(wordIndex));
        const revealedByHint = hintedCells.has(key);
        if (revealedByWord || revealedByHint) {
          el.textContent = cell.letter;
          el.classList.add('revealed');
          if (revealedByHint && !revealedByWord) el.classList.add('hint');
        }
        ui.crossword.append(el);
      }
    }
  }

  function renderWheel() {
    ui.wheel.querySelectorAll('.letter-btn').forEach(el => el.remove());
    const count = wheelOrder.length;
    const radius = 92;
    wheelOrder.forEach((letter, index) => {
      const angle = -Math.PI / 2 + index * (Math.PI * 2 / count);
      const x = 130 + Math.cos(angle) * radius;
      const y = 130 + Math.sin(angle) * radius;
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

  function submitSelection() {
    const word = selected.map(i => wheelOrder[i]).join('');
    selected = [];
    updateSelectionVisuals();
    if (word.length < 2) { setIdleReadout(); return; }

    const index = currentLevel().words.indexOf(word);
    if (index >= 0 && !found.has(index)) {
      found.add(index);
      save.light += word.length;
      ui.lightCount.textContent = save.light;
      flashMessage(`${word}  +${word.length} ✦`, false);
      renderCrossword();
      updateProgress();
      tone(520, .08, .045, 760);
      vibrate(18);
      if (found.size === currentLevel().words.length) setTimeout(completeLevel, 650);
      persist();
      return;
    }
    if (index >= 0) {
      flashMessage('Already found', false);
      tone(260, .05, .02);
      return;
    }
    flashMessage('Try another word', true);
    tone(160, .06, .02);
  }

  function flashMessage(text, bad) {
    clearTimeout(messageTimer);
    ui.message.textContent = text;
    ui.message.classList.toggle('bad', !!bad);
    messageTimer = setTimeout(() => {
      ui.message.textContent = '';
      ui.message.classList.remove('bad');
      if (!selecting && selected.length === 0) setIdleReadout();
    }, 1100);
  }

  function updateProgress() {
    ui.wordProgress.textContent = `${found.size} / ${currentLevel().words.length} words`;
  }

  function useHint() {
    if (hintCount <= 0) { flashMessage('No hints left this puzzle', true); return; }
    const candidates = [...gridData.cells.entries()].filter(([key, cell]) => {
      const revealed = [...cell.words].some(wordIndex => found.has(wordIndex)) || hintedCells.has(key);
      return !revealed;
    });
    if (!candidates.length) return;
    const [key] = candidates[Math.floor(Math.random() * candidates.length)];
    hintedCells.add(key);
    hintCount--;
    ui.hintCount.textContent = hintCount;
    renderCrossword();
    tone(610, .09, .035, 800);
  }

  function shuffleLetters() {
    for (let i = wheelOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wheelOrder[i], wheelOrder[j]] = [wheelOrder[j], wheelOrder[i]];
    }
    selected = [];
    renderWheel();
    setIdleReadout();
    tone(300, .04, .02, 420);
  }

  function completeLevel() {
    const level = currentLevel();
    const reward = 25 + levelIndex * 2;
    save.light += reward;
    save.completed[levelIndex] = true;
    save.unlocked = Math.max(save.unlocked, Math.min(levels.length, levelIndex + 2));
    ui.lightCount.textContent = save.light;
    ui.completeTitle.textContent = level.theme;
    ui.verseText.textContent = `“${level.text}”`;
    ui.verseRef.textContent = level.verse;
    ui.rewardAmount.textContent = reward;
    ui.nextButton.textContent = levelIndex === levels.length - 1 ? 'START AGAIN' : 'NEXT PUZZLE';
    ui.completeOverlay.classList.add('visible');
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
      button.innerHTML = `<strong>${unlocked ? index + 1 : '🔒'}</strong><span>${unlocked ? level.theme : 'Locked'}</span><small>${save.completed[index] ? '✓ Complete' : unlocked ? level.words.length + ' words' : ''}</small>`;
      if (unlocked) button.addEventListener('click', () => loadLevel(index));
      ui.levelGrid.append(button);
    });
  }

  function letterFromPoint(clientX, clientY) {
    const el = document.elementFromPoint(clientX, clientY);
    const button = el?.closest?.('.letter-btn');
    if (!button || !ui.wheel.contains(button)) return null;
    return Number(button.dataset.index);
  }

  ui.wheel.addEventListener('pointerdown', event => {
    const index = letterFromPoint(event.clientX, event.clientY);
    if (index === null) return;
    selecting = true;
    selected = [];
    addSelected(index);
    ui.wheel.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }, { passive: false });

  ui.wheel.addEventListener('pointermove', event => {
    if (!selecting) return;
    const index = letterFromPoint(event.clientX, event.clientY);
    if (index !== null) addSelected(index);
    event.preventDefault();
  }, { passive: false });

  function endSelection(event) {
    if (!selecting) return;
    selecting = false;
    submitSelection();
    event?.preventDefault?.();
  }
  ui.wheel.addEventListener('pointerup', endSelection, { passive: false });
  ui.wheel.addEventListener('pointercancel', endSelection, { passive: false });

  ui.shuffleButton.addEventListener('click', shuffleLetters);
  ui.hintButton.addEventListener('click', useHint);
  ui.levelsButton.addEventListener('click', () => ui.levelDrawer.classList.add('open'));
  ui.closeLevelsButton.addEventListener('click', () => ui.levelDrawer.classList.remove('open'));
  ui.startButton.addEventListener('click', () => { ui.startOverlay.classList.remove('visible'); tone(420, .08, .035, 620); });
  ui.replayButton.addEventListener('click', () => loadLevel(levelIndex));
  ui.nextButton.addEventListener('click', () => loadLevel(levelIndex === levels.length - 1 ? 0 : levelIndex + 1));
  ui.soundButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    ui.soundButton.textContent = soundEnabled ? '♪' : '×';
    ui.soundButton.setAttribute('aria-label', soundEnabled ? 'Mute sound' : 'Turn sound on');
    if (soundEnabled) tone(440, .06, .03, 640);
  });

  function vibrate(pattern) { if ('vibrate' in navigator) navigator.vibrate(pattern); }
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
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(now); osc.stop(now + duration + .01);
    } catch {}
  }

  loadLevel(levelIndex);
})();
