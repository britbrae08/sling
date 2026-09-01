(() => {
  'use strict';

  const levels = window.FaithWordsLevels;
  const config = window.FaithWordsConfig;
  if (!Array.isArray(levels) || !levels.length || !config) return;

  const PREF_KEY = 'faithWordsExperiencePrefsV32';
  const DAILY_STATS_KEY = 'faithWordsDailyStatsV32';
  const SAVED_VERSES_KEY = 'faithWordsSavedVersesV32';
  const SPECIAL_BACKUP_KEY = 'faithWordsSpecialBackupV32';
  const SPECIAL_SESSION_KEY = 'faithWordsSpecialSessionV32';

  const menu = document.getElementById('audioMenu');
  const menuButton = document.getElementById('menuButton');
  const levelsButton = document.getElementById('levelsButton');
  const hintButton = document.getElementById('hintButton');
  const nextButton = document.getElementById('nextButton');
  const startButton = document.getElementById('startButton');
  const completeOverlay = document.getElementById('completeOverlay');
  const completeCard = document.getElementById('completeCard');
  const message = document.getElementById('message');

  let specialMode = null;
  let completionHintUses = 0;

  function parseJSON(value, fallback) {
    try { return JSON.parse(value); } catch { return fallback; }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function dateKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function closeMenu() {
    menu?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }

  function normalProgress() {
    const backup = parseJSON(localStorage.getItem(SPECIAL_BACKUP_KEY), null);
    if (backup?.progress) return clone(backup.progress);
    return window.FaithWordsGame?.exportProgress?.() || null;
  }

  function firstUnfinished(progress) {
    const completed = progress?.completed || {};
    const index = levels.findIndex((_, i) => !completed[i]);
    return index < 0 ? levels.length : index;
  }

  function flash(text) {
    const toast = document.getElementById('experienceToast') || (() => {
      const el = document.createElement('div');
      el.id = 'experienceToast';
      el.className = 'experience-toast';
      document.body.append(el);
      return el;
    })();
    toast.textContent = text;
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1600);
  }

  /* ---------- Preferences ---------- */

  const storedPrefs = parseJSON(localStorage.getItem(PREF_KEY), {});
  const experiencePrefs = {
    textSize: storedPrefs.textSize || 'normal',
    highContrast: !!storedPrefs.highContrast,
    reducedMotion: !!storedPrefs.reducedMotion,
    hapticsEnabled: storedPrefs.hapticsEnabled !== false,
    darkMode: !!storedPrefs.darkMode,
    leftHanded: !!storedPrefs.leftHanded
  };

  window.FaithWordsPrefs ||= {};
  Object.assign(window.FaithWordsPrefs, experiencePrefs);

  function savePrefs() {
    localStorage.setItem(PREF_KEY, JSON.stringify(experiencePrefs));
    Object.assign(window.FaithWordsPrefs, experiencePrefs);
  }

  function applyPrefs() {
    document.body.classList.toggle('text-large', experiencePrefs.textSize === 'large');
    document.body.classList.toggle('text-extra-large', experiencePrefs.textSize === 'extra');
    document.body.classList.toggle('high-contrast', experiencePrefs.highContrast);
    document.body.classList.toggle('reduced-motion', experiencePrefs.reducedMotion);
    document.body.classList.toggle('dark-ui', experiencePrefs.darkMode);
    document.body.classList.toggle('left-handed', experiencePrefs.leftHanded);
    Object.assign(window.FaithWordsPrefs, experiencePrefs);
  }

  applyPrefs();

  /* ---------- Reusable experience drawer ---------- */

  const drawer = document.createElement('section');
  drawer.id = 'experienceDrawer';
  drawer.className = 'experience-drawer';
  drawer.setAttribute('aria-label', 'FaithWords experience');
  drawer.innerHTML = `
    <div class="experience-drawer-header">
      <div><small id="experienceDrawerKicker">FaithWords</small><h2 id="experienceDrawerTitle">FaithWords</h2></div>
      <button id="experienceDrawerClose" class="experience-drawer-close" type="button" aria-label="Close">×</button>
    </div>
    <div id="experienceDrawerBody" class="experience-drawer-body"></div>`;
  document.body.append(drawer);

  const drawerTitle = drawer.querySelector('#experienceDrawerTitle');
  const drawerKicker = drawer.querySelector('#experienceDrawerKicker');
  const drawerBody = drawer.querySelector('#experienceDrawerBody');
  drawer.querySelector('#experienceDrawerClose')?.addEventListener('click', () => drawer.classList.remove('open'));

  function openDrawer(title, kicker, render) {
    closeMenu();
    drawerTitle.textContent = title;
    drawerKicker.textContent = kicker || 'FaithWords';
    drawerBody.replaceChildren();
    render(drawerBody);
    drawer.classList.add('open');
  }

  function openNormalLevel(index) {
    const game = window.FaithWordsGame;
    const progress = normalProgress();
    if (!game?.importProgress || !progress) return;
    const next = firstUnfinished(progress);
    const allowed = !!progress.completed?.[index] || index === next;
    if (!allowed) return;
    progress.lastLevel = index;
    game.importProgress(progress);
    drawer.classList.remove('open');
  }

  function renderJourneys(host) {
    const progress = normalProgress();
    const next = firstUnfinished(progress);
    config.journeys.forEach(journey => {
      const card = document.createElement('section');
      card.className = 'journey-card';
      const heading = document.createElement('h3');
      heading.textContent = journey.title;
      const copy = document.createElement('p');
      copy.textContent = journey.subtitle;
      const levelWrap = document.createElement('div');
      levelWrap.className = 'journey-levels';

      journey.levels.forEach(levelNumber => {
        const index = levelNumber - 1;
        const level = levels[index];
        if (!level) return;
        const completed = !!progress?.completed?.[index];
        const available = completed || index === next;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `journey-level${config.isHardLevel(levelNumber) ? ' hard' : ''}`;
        button.disabled = !available;
        button.innerHTML = `<strong>${available ? levelNumber : '🔒'}</strong><span>${level.theme}</span>`;
        button.setAttribute('aria-label', available ? `Level ${levelNumber}, ${level.theme}` : `Level ${levelNumber}, locked`);
        if (available) button.addEventListener('click', () => openNormalLevel(index));
        levelWrap.append(button);
      });

      card.append(heading, copy, levelWrap);
      host.append(card);
    });
  }

  function renderJournal(host) {
    const progress = normalProgress();
    const bonusWords = progress?.bonusWords || {};
    const entries = Object.entries(bonusWords)
      .map(([index, words]) => ({ index: Number(index), words: Array.isArray(words) ? words : [] }))
      .filter(entry => entry.words.length)
      .sort((a,b) => a.index - b.index);

    if (!entries.length) {
      const empty = document.createElement('div');
      empty.className = 'journal-empty';
      empty.textContent = 'Extra words you discover will collect here as your FaithWords Word Journal.';
      host.append(empty);
      return;
    }

    entries.forEach(entry => {
      const section = document.createElement('section');
      section.className = 'journal-level';
      const title = document.createElement('h3');
      title.textContent = `Level ${entry.index + 1} • ${levels[entry.index]?.theme || 'FaithWords'}`;
      const wrap = document.createElement('div');
      wrap.className = 'word-chip-wrap';
      [...new Set(entry.words)].sort().forEach(word => {
        const chip = document.createElement('span');
        chip.className = 'word-chip';
        chip.textContent = word;
        wrap.append(chip);
      });
      section.append(title, wrap);
      host.append(section);
    });
  }

  function readSavedVerses() {
    return parseJSON(localStorage.getItem(SAVED_VERSES_KEY), []);
  }

  function writeSavedVerses(items) {
    localStorage.setItem(SAVED_VERSES_KEY, JSON.stringify(items));
  }

  function verseKey(levelNumber, level) {
    return `${levelNumber}:${level?.verse || ''}`;
  }

  function isVerseSaved(levelNumber, level) {
    const key = verseKey(levelNumber, level);
    return readSavedVerses().some(item => item.key === key);
  }

  function toggleSavedVerse(levelNumber, level) {
    const key = verseKey(levelNumber, level);
    const items = readSavedVerses();
    const index = items.findIndex(item => item.key === key);
    if (index >= 0) {
      items.splice(index, 1);
      writeSavedVerses(items);
      return false;
    }
    items.unshift({
      key,
      levelNumber,
      theme: level.theme,
      verse: level.verse,
      verseText: level.verseText,
      reading: level.reading,
      savedAt: new Date().toISOString()
    });
    writeSavedVerses(items.slice(0, 100));
    return true;
  }

  function renderSavedVerses(host) {
    const items = readSavedVerses();
    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'saved-empty';
      empty.textContent = 'Save a verse after completing a puzzle and it will appear here.';
      host.append(empty);
      return;
    }

    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'saved-verse-card';
      card.innerHTML = `<strong>${item.verse}</strong><p>${item.verseText}</p>`;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.setAttribute('aria-label', `Remove ${item.verse}`);
      remove.textContent = '×';
      remove.addEventListener('click', () => {
        writeSavedVerses(readSavedVerses().filter(saved => saved.key !== item.key));
        renderSavedVersesView();
      });
      card.append(remove);
      host.append(card);
    });
  }

  function renderSavedVersesView() {
    openDrawer('Saved Verses', 'Carry Scripture with you', renderSavedVerses);
  }

  function renderAccessibility(host) {
    const text = document.createElement('section');
    text.className = 'settings-section';
    text.innerHTML = '<h3>Text size</h3><div class="text-size-options"></div>';
    const sizes = [
      ['normal','Normal'],
      ['large','Large'],
      ['extra','Extra Large']
    ];
    const sizeWrap = text.querySelector('.text-size-options');
    sizes.forEach(([value,label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.classList.toggle('active', experiencePrefs.textSize === value);
      button.addEventListener('click', () => {
        experiencePrefs.textSize = value;
        savePrefs();
        applyPrefs();
        renderAccessibilityView();
      });
      sizeWrap.append(button);
    });
    host.append(text);

    const toggles = [
      ['highContrast','Higher contrast'],
      ['darkMode','Dark interface'],
      ['reducedMotion','Reduce motion'],
      ['hapticsEnabled','Haptic feedback'],
      ['leftHanded','Left-handed controls']
    ];
    const section = document.createElement('section');
    section.className = 'settings-section';
    section.innerHTML = '<h3>Comfort & controls</h3>';
    toggles.forEach(([key,label]) => {
      const row = document.createElement('label');
      row.className = 'setting-row';
      const copy = document.createElement('span');
      copy.textContent = label;
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = !!experiencePrefs[key];
      input.addEventListener('change', () => {
        experiencePrefs[key] = input.checked;
        savePrefs();
        applyPrefs();
      });
      row.append(copy, input);
      section.append(row);
    });
    host.append(section);
  }

  function renderAccessibilityView() {
    openDrawer('Display & Accessibility', 'Make FaithWords comfortable', renderAccessibility);
  }

  /* ---------- Daily play and private challenge sessions ---------- */

  const modeBadge = document.createElement('div');
  modeBadge.id = 'specialModeBadge';
  modeBadge.className = 'special-mode-badge';
  modeBadge.innerHTML = '<span id="specialModeLabel">Daily</span><button type="button" aria-label="Return to journey">×</button>';
  document.body.append(modeBadge);
  modeBadge.querySelector('button')?.addEventListener('click', () => finishSpecialMode());

  function applySpecialModeUI() {
    document.body.classList.toggle('special-mode', !!specialMode);
    document.body.classList.toggle('daily-mode', specialMode?.type === 'daily');
    document.body.classList.toggle('mini-mode', specialMode?.type === 'mini');
    document.body.classList.toggle('challenge-mode', specialMode?.type === 'challenge');
    const label = modeBadge.querySelector('#specialModeLabel');
    if (label) {
      label.textContent = specialMode?.type === 'daily'
        ? 'Daily FaithWords'
        : specialMode?.type === 'mini'
          ? 'Daily Mini'
          : specialMode?.type === 'challenge'
            ? 'Friend Challenge'
            : '';
    }
  }

  function mergeBonusWords(base = {}, current = {}) {
    const merged = clone(base || {});
    Object.entries(current || {}).forEach(([index, words]) => {
      merged[index] = [...new Set([...(merged[index] || []), ...(Array.isArray(words) ? words : [])])];
    });
    return merged;
  }

  function startSpecialMode(type, index) {
    const game = window.FaithWordsGame;
    if (!game?.exportProgress || !game?.importProgress) return;

    if (specialMode) finishSpecialMode({ silent: true });

    const progress = game.exportProgress();
    const backup = { progress: clone(progress), startedAt: new Date().toISOString() };
    localStorage.setItem(SPECIAL_BACKUP_KEY, JSON.stringify(backup));

    specialMode = { type, index, date: dateKey(), normalLevel: progress.lastLevel || 0 };
    sessionStorage.setItem(SPECIAL_SESSION_KEY, JSON.stringify(specialMode));
    window.FaithWordsSessionMode = type;

    const temporary = clone(progress);
    temporary.lastLevel = index;
    temporary.unlocked = Math.max(Number(temporary.unlocked) || 1, index + 1);
    temporary.foundWords ||= {};
    temporary.hintedByLevel ||= {};
    delete temporary.foundWords[index];
    delete temporary.hintedByLevel[index];
    game.importProgress(temporary);
    completionHintUses = 0;
    applySpecialModeUI();
    closeMenu();
    drawer.classList.remove('open');
  }

  function finishSpecialMode({ silent = false } = {}) {
    const game = window.FaithWordsGame;
    const backup = parseJSON(localStorage.getItem(SPECIAL_BACKUP_KEY), null);
    if (!backup?.progress || !game?.importProgress) {
      specialMode = null;
      sessionStorage.removeItem(SPECIAL_SESSION_KEY);
      localStorage.removeItem(SPECIAL_BACKUP_KEY);
      window.FaithWordsSessionMode = 'normal';
      applySpecialModeUI();
      return;
    }

    const current = game.exportProgress?.() || {};
    const restored = clone(backup.progress);
    // Hint spending and extra-word discoveries still matter during Daily/Challenge play,
    // but temporary level completion never skips the normal journey.
    restored.hintPoints = Math.max(0, Math.min(config.maxHintPoints, Number(current.hintPoints) || 0));
    restored.bonusWords = mergeBonusWords(restored.bonusWords, current.bonusWords);

    specialMode = null;
    sessionStorage.removeItem(SPECIAL_SESSION_KEY);
    localStorage.removeItem(SPECIAL_BACKUP_KEY);
    window.FaithWordsSessionMode = 'normal';
    applySpecialModeUI();
    game.importProgress(restored);
    updateDailyMenuStat();
    if (!silent) flash('Back to your FaithWords journey');
  }

  function recoverSpecialMode() {
    const session = parseJSON(sessionStorage.getItem(SPECIAL_SESSION_KEY), null);
    const backup = parseJSON(localStorage.getItem(SPECIAL_BACKUP_KEY), null);
    if (session && backup?.progress) {
      specialMode = session;
      window.FaithWordsSessionMode = session.type;
      applySpecialModeUI();
      return;
    }
    if (backup?.progress && window.FaithWordsGame?.importProgress) {
      window.FaithWordsSessionMode = 'normal';
      window.FaithWordsGame.importProgress(backup.progress);
      localStorage.removeItem(SPECIAL_BACKUP_KEY);
      sessionStorage.removeItem(SPECIAL_SESSION_KEY);
    }
  }

  function readDailyStats() {
    return parseJSON(localStorage.getItem(DAILY_STATS_KEY), { daily: {}, mini: {} });
  }

  function recordDailyCompletion(type, levelNumber, hintsUsed) {
    if (!['daily','mini'].includes(type)) return;
    const stats = readDailyStats();
    stats.daily ||= {};
    stats.mini ||= {};
    stats[type][dateKey()] = { levelNumber, hintsUsed, completedAt: new Date().toISOString() };
    localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(stats));
    updateDailyMenuStat();
  }

  function daysPlayedThisMonth() {
    const stats = readDailyStats();
    const prefix = dateKey().slice(0,7);
    return new Set([
      ...Object.keys(stats.daily || {}),
      ...Object.keys(stats.mini || {})
    ].filter(key => key.startsWith(prefix))).size;
  }

  /* ---------- Hint choices ---------- */

  const hintChooser = document.createElement('div');
  hintChooser.id = 'hintChooser';
  hintChooser.className = 'hint-chooser';
  hintChooser.innerHTML = `
    <div class="hint-chooser-head"><strong>Choose a hint</strong><span>Use Hint Points</span></div>
    <div class="hint-options">
      <button class="hint-option" type="button" data-hint="nudge"><b>Starting Tile</b><small>Reveal where a word begins</small><em>${config.hints.nudge} points</em></button>
      <button class="hint-option default" type="button" data-hint="letter"><b>Letter</b><small>Reveal one hidden letter</small><em>${config.hints.letter} points</em></button>
      <button class="hint-option" type="button" data-hint="word"><b>Whole Word</b><small>Reveal one unsolved word</small><em>${config.hints.word} points</em></button>
    </div>`;
  document.body.append(hintChooser);

  function closeHintChooser() {
    hintChooser.classList.remove('open');
  }

  function installHintChoices() {
    if (!hintButton || !window.FaithWordsGame?.useLetterHint) return;
    hintButton.setAttribute('aria-label', 'Open hint choices');
    hintButton.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      hintChooser.classList.toggle('open');
    }, true);

    hintChooser.querySelectorAll('[data-hint]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        const type = button.dataset.hint;
        const game = window.FaithWordsGame;
        if (type === 'nudge') game.useNudgeHint?.();
        if (type === 'letter') game.useLetterHint?.();
        if (type === 'word') game.useWordHint?.();
        closeHintChooser();
      });
    });

    document.addEventListener('click', event => {
      if (!hintChooser.contains(event.target) && event.target !== hintButton) closeHintChooser();
    });
  }

  window.addEventListener('faithwords-hint-used', () => {
    completionHintUses += 1;
  });

  /* ---------- Verse Reveal, save, share, and friend challenges ---------- */

  function ensureCompletionExtras() {
    if (!completeCard) return null;
    let carry = completeCard.querySelector('#carryPrompt');
    if (!carry) {
      carry = document.createElement('div');
      carry.id = 'carryPrompt';
      carry.className = 'carry-prompt';
      const scripture = completeCard.querySelector('.scripture-panel');
      scripture?.insertAdjacentElement('afterend', carry);
    }

    let stats = completeCard.querySelector('#completionStats');
    if (!stats) {
      stats = document.createElement('div');
      stats.id = 'completionStats';
      stats.className = 'completion-stats';
      carry.insertAdjacentElement('afterend', stats);
    }

    let actions = completeCard.querySelector('#completionActions');
    if (!actions) {
      actions = document.createElement('div');
      actions.id = 'completionActions';
      actions.className = 'completion-actions';
      actions.innerHTML = `
        <button id="saveVerseButton" type="button">Save Verse</button>
        <button id="shareResultButton" type="button">Share</button>
        <button id="challengeShareButton" class="challenge-share" type="button">Challenge a Friend</button>`;
      nextButton?.insertAdjacentElement('beforebegin', actions);
    }
    return { carry, stats, actions };
  }

  function challengeUrl(levelNumber) {
    const url = new URL(location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('challenge', String(levelNumber));
    return url.toString();
  }

  async function sharePayload({ title, text, url }) {
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return true;
      }
      const full = `${text}${url ? `\n${url}` : ''}`;
      await navigator.clipboard?.writeText(full);
      flash('Copied to share');
      return true;
    } catch (error) {
      if (error?.name !== 'AbortError') flash('Sharing is not available here');
      return false;
    }
  }

  function handleCompletion(detail = {}) {
    const game = window.FaithWordsGame;
    const levelIndex = Math.max(0, Math.min(levels.length - 1, (detail.levelNumber || game?.getCurrentLevelIndex?.() + 1 || 1) - 1));
    const levelNumber = levelIndex + 1;
    const level = levels[levelIndex];
    const extras = ensureCompletionExtras();
    if (!extras || !level) return;

    document.body.classList.add('level-reveal-glow');
    setTimeout(() => document.body.classList.remove('level-reveal-glow'), 760);

    const prompt = config.carryPrompt(level);
    extras.carry.innerHTML = `<strong>Carry this with you</strong>${prompt}`;

    const progress = game?.exportProgress?.() || {};
    const bonusCount = (progress.bonusWords?.[levelIndex] || []).length;
    const hintsUsed = Number(detail.hintsUsed ?? completionHintUses) || 0;
    const statParts = [`<span>${bonusCount} extra word${bonusCount === 1 ? '' : 's'}</span>`, `<span>${hintsUsed} hint${hintsUsed === 1 ? '' : 's'} used</span>`];
    if (detail.hardBonus > 0) statParts.push(`<span class="hard-reward">HARD +${detail.hardBonus} Hint Points</span>`);
    extras.stats.innerHTML = statParts.join('');

    const saveButton = extras.actions.querySelector('#saveVerseButton');
    const shareButton = extras.actions.querySelector('#shareResultButton');
    const challengeButton = extras.actions.querySelector('#challengeShareButton');

    const saved = isVerseSaved(levelNumber, level);
    saveButton.classList.toggle('saved', saved);
    saveButton.textContent = saved ? 'Verse Saved' : 'Save Verse';
    saveButton.onclick = () => {
      const nowSaved = toggleSavedVerse(levelNumber, level);
      saveButton.classList.toggle('saved', nowSaved);
      saveButton.textContent = nowSaved ? 'Verse Saved' : 'Save Verse';
      flash(nowSaved ? 'Verse saved' : 'Verse removed');
    };

    shareButton.onclick = () => sharePayload({
      title: `FaithWords Level ${levelNumber}`,
      text: `FaithWords • Level ${levelNumber} ✓\n${level.verse} — ${level.verseText}\n${bonusCount} extra words • ${hintsUsed} hints`,
      url: new URL('.', location.href).toString()
    });

    challengeButton.onclick = () => sharePayload({
      title: 'FaithWords Friend Challenge',
      text: `I finished FaithWords Level ${levelNumber}. Can you solve it with fewer than ${hintsUsed || 1} hint${hintsUsed === 1 ? '' : 's'}?`,
      url: challengeUrl(levelNumber)
    });

    if (specialMode) {
      const completeLabel = document.getElementById('completeLevelLabel');
      if (completeLabel) {
        const prefix = specialMode.type === 'daily' ? 'DAILY' : specialMode.type === 'mini' ? 'DAILY MINI' : 'CHALLENGE';
        completeLabel.textContent = `${prefix} • LEVEL ${levelNumber}`;
      }
      nextButton.textContent = 'RETURN TO JOURNEY';
      recordDailyCompletion(specialMode.type, levelNumber, hintsUsed);
    }

    completionHintUses = 0;
  }

  window.addEventListener('faithwords-level-completed', event => handleCompletion(event.detail || {}));

  nextButton?.addEventListener('click', event => {
    if (!specialMode) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    finishSpecialMode();
  }, true);

  /* ---------- Menu ---------- */

  let dailyMenuStat = null;

  function updateDailyMenuStat() {
    if (!dailyMenuStat) return;
    const stats = readDailyStats();
    const today = dateKey();
    const dailyDone = !!stats.daily?.[today];
    const miniDone = !!stats.mini?.[today];
    const played = daysPlayedThisMonth();
    dailyMenuStat.textContent = `${played} day${played === 1 ? '' : 's'} played this month • Daily ${dailyDone ? '✓' : 'open'} • Mini ${miniDone ? '✓' : 'open'}`;
  }

  function installMenuFeatures() {
    if (!menu || !levelsButton || menu.querySelector('#dailyMenuAction')) return;

    const grid = document.createElement('div');
    grid.className = 'experience-menu-grid';
    grid.innerHTML = `
      <button id="dailyMenuAction" class="experience-menu-action" type="button"><strong>Daily FaithWords</strong><span>Today’s puzzle</span></button>
      <button id="miniMenuAction" class="experience-menu-action" type="button"><strong>Daily Mini</strong><span>Quick puzzle</span></button>
      <button id="journeysMenuAction" class="experience-menu-action wide" type="button"><strong>Scripture Journeys</strong><span>Explore themes ›</span></button>
      <button id="journalMenuAction" class="experience-menu-action" type="button"><strong>Word Journal</strong><span>Extra words</span></button>
      <button id="savedMenuAction" class="experience-menu-action" type="button"><strong>Saved Verses</strong><span>Keep Scripture</span></button>
      <button id="accessibilityMenuAction" class="experience-menu-action wide" type="button"><strong>Display & Accessibility</strong><span>Text, contrast, controls ›</span></button>`;

    dailyMenuStat = document.createElement('p');
    dailyMenuStat.className = 'daily-menu-stat';

    levelsButton.insertAdjacentElement('afterend', grid);
    grid.insertAdjacentElement('afterend', dailyMenuStat);

    grid.querySelector('#dailyMenuAction')?.addEventListener('click', () => startSpecialMode('daily', config.dailyIndex(dateKey(), levels.length)));
    grid.querySelector('#miniMenuAction')?.addEventListener('click', () => startSpecialMode('mini', config.dailyMiniIndex(dateKey(), levels.length)));
    grid.querySelector('#journeysMenuAction')?.addEventListener('click', () => openDrawer('Scripture Journeys', 'Explore FaithWords by theme', renderJourneys));
    grid.querySelector('#journalMenuAction')?.addEventListener('click', () => openDrawer('Word Journal', 'Extra words you discovered', renderJournal));
    grid.querySelector('#savedMenuAction')?.addEventListener('click', renderSavedVersesView);
    grid.querySelector('#accessibilityMenuAction')?.addEventListener('click', renderAccessibilityView);
    updateDailyMenuStat();
  }

  /* ---------- Incoming friend challenge ---------- */

  const challengeParam = Number(new URLSearchParams(location.search).get('challenge'));
  if (challengeParam >= 1 && challengeParam <= levels.length) {
    startButton?.addEventListener('click', () => {
      setTimeout(() => startSpecialMode('challenge', challengeParam - 1), 0);
      const url = new URL(location.href);
      url.searchParams.delete('challenge');
      history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }, { once: true });
  }

  /* ---------- Boot when the async game runtime is ready ---------- */

  function bootWhenReady(attempt = 0) {
    if (!window.FaithWordsGame?.exportProgress) {
      if (attempt < 120) setTimeout(() => bootWhenReady(attempt + 1), 50);
      return;
    }
    recoverSpecialMode();
    installHintChoices();
    installMenuFeatures();
    ensureCompletionExtras();

    // Fallback in case an older cached runtime displays completion before the
    // custom completion event is available.
    if (completeOverlay) {
      new MutationObserver(() => {
        if (completeOverlay.classList.contains('visible')) {
          const detail = window.FaithWordsLastCompletion || {};
          handleCompletion(detail);
        }
      }).observe(completeOverlay, { attributes: true, attributeFilter: ['class'] });
    }
  }

  bootWhenReady();
})();
