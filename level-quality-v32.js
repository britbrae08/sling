(() => {
  'use strict';

  const levels = window.FaithWordsLevels;
  if (!Array.isArray(levels)) return;

  const MIN_REQUIRED_WORD_LENGTH = 3;
  const BONUS_ONLY_WORDS = Object.freeze(['PEE']);
  const bonusOnlySet = new Set(BONUS_ONLY_WORDS);
  const issues = [];

  const RULES = Object.freeze({
    minimumRequiredWordLength: MIN_REQUIRED_WORD_LENGTH,
    bonusOnlyWords: BONUS_ONLY_WORDS,
    tierThresholds: Object.freeze({ gentleMax: 23, steadyMax: 33, challengingMax: 43 })
  });

  function normalizeWord(value) {
    return String(value || '').trim().toUpperCase();
  }

  function canSpell(word, rack) {
    const counts = Object.create(null);
    for (const ch of normalizeWord(rack)) counts[ch] = (counts[ch] || 0) + 1;
    for (const ch of normalizeWord(word)) {
      if (!counts[ch]) return false;
      counts[ch] -= 1;
    }
    return true;
  }

  function difficultyFor(level, levelNumber) {
    const words = level.words || [];
    const rackSize = level.letters.length;
    const answerCount = words.length;
    const avgLength = answerCount
      ? words.reduce((sum, word) => sum + word.length, 0) / answerCount
      : 0;
    const fullRackWords = words.filter(word => word.length === rackSize).length;
    const shortWords = words.filter(word => word.length === MIN_REQUIRED_WORD_LENGTH).length;
    const hard = levelNumber >= 20 && levelNumber % 5 === 0;

    // Difficulty is intentionally multi-factor. Adding answers is only one input.
    const breakdown = Object.freeze({
      rackComplexity: rackSize * 3.5,
      answerLoad: answerCount * 1.25,
      averageLengthPressure: avgLength * 1.35,
      fullRackPressure: fullRackWords * 1.8,
      searchAmbiguity: Math.min(6, shortWords * 0.65),
      hardLevelAdjustment: hard ? 7 : 0
    });
    const score = Math.round(Object.values(breakdown).reduce((sum, value) => sum + value, 0));
    const tier = hard
      ? 'hard'
      : score <= RULES.tierThresholds.gentleMax
        ? 'gentle'
        : score <= RULES.tierThresholds.steadyMax
          ? 'steady'
          : score <= RULES.tierThresholds.challengingMax
            ? 'challenging'
            : 'advanced';

    return Object.freeze({ score, tier, hard, breakdown });
  }

  function auditLevel(level, index) {
    const levelNumber = index + 1;
    level.letters = normalizeWord(level.letters);
    const original = Array.isArray(level.words) ? level.words.map(normalizeWord) : [];
    const seen = new Set();
    const required = [];
    const bonusOnly = new Set(Array.isArray(level.bonusOnlyWords) ? level.bonusOnlyWords.map(normalizeWord) : []);

    original.forEach(word => {
      if (!word || word.length < MIN_REQUIRED_WORD_LENGTH) {
        issues.push({ severity: 'error', level: levelNumber, word, issue: 'required-word-too-short' });
        return;
      }
      if (!canSpell(word, level.letters)) {
        issues.push({ severity: 'error', level: levelNumber, word, issue: 'required-word-cannot-be-made-from-wheel' });
        return;
      }
      if (seen.has(word)) {
        issues.push({ severity: 'error', level: levelNumber, word, issue: 'duplicate-required-word' });
        return;
      }
      seen.add(word);

      if (bonusOnlySet.has(word)) {
        bonusOnly.add(word);
        issues.push({ severity: 'info', level: levelNumber, word, issue: 'classified-bonus-only' });
        return;
      }
      required.push(word);
    });

    if (!required.length) {
      issues.push({ severity: 'fatal', level: levelNumber, word: '', issue: 'level-has-no-valid-required-words' });
    }

    level.words = required;
    level.bonusOnlyWords = [...bonusOnly].filter(word => canSpell(word, level.letters));
    level.difficulty = difficultyFor(level, levelNumber);
    return level;
  }

  levels.forEach(auditLevel);

  // Cross-level repetition is a tuning warning, not a broken puzzle. Some themes
  // intentionally recur while the actual boards and Scriptures continue to vary.
  const primarySeen = new Map();
  levels.forEach((level, index) => {
    const primary = level.words?.[0];
    if (!primary) return;
    if (primarySeen.has(primary)) {
      issues.push({
        severity: 'warning',
        level: index + 1,
        word: primary,
        issue: `repeated-primary-from-level-${primarySeen.get(primary)}`
      });
    } else {
      primarySeen.set(primary, index + 1);
    }
  });

  const errors = issues.filter(item => item.severity === 'error' || item.severity === 'fatal');
  window.FaithWordsLevelQuality = Object.freeze({
    version: 32,
    rules: RULES,
    canSpell,
    difficultyFor,
    auditLevel,
    issues: Object.freeze(issues),
    summary: Object.freeze({
      levelCount: levels.length,
      hardLevels: levels.filter(level => level.difficulty?.hard).length,
      errorCount: errors.length,
      warningCount: issues.filter(item => item.severity === 'warning').length,
      bonusOnlyCount: levels.reduce((sum, level) => sum + (level.bonusOnlyWords?.length || 0), 0)
    })
  });

  if (errors.length) console.error('FaithWords puzzle-quality errors', errors);
  else if (issues.some(item => item.severity === 'warning')) console.warn('FaithWords puzzle-quality tuning notes', issues);
})();
