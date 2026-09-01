(() => {
  'use strict';

  const levels = window.FaithWordsLevels;
  if (!Array.isArray(levels)) return;

  const optionalOnly = new Set(['PEE']);
  const issues = [];

  function canSpell(word, rack) {
    const counts = {};
    for (const ch of rack) counts[ch] = (counts[ch] || 0) + 1;
    for (const ch of word) {
      if (!counts[ch]) return false;
      counts[ch] -= 1;
    }
    return true;
  }

  levels.forEach((level, index) => {
    level.letters = String(level.letters || '').toUpperCase();
    const original = Array.isArray(level.words) ? level.words : [];
    const seen = new Set();
    const cleaned = [];

    original.forEach(rawWord => {
      const word = String(rawWord || '').trim().toUpperCase();
      if (!word || word.length < 3) {
        issues.push({ level: index + 1, word, issue: 'too-short' });
        return;
      }
      if (!canSpell(word, level.letters)) {
        issues.push({ level: index + 1, word, issue: 'cannot-spell-from-rack' });
        return;
      }
      if (seen.has(word)) {
        issues.push({ level: index + 1, word, issue: 'duplicate' });
        return;
      }
      seen.add(word);
      if (optionalOnly.has(word) && original.length > 2) {
        issues.push({ level: index + 1, word, issue: 'moved-to-bonus-only' });
        return;
      }
      cleaned.push(word);
    });

    if (!cleaned.length && original.length) cleaned.push(String(original[0]).toUpperCase());
    level.words = cleaned;

    const levelNumber = index + 1;
    const hard = levelNumber >= 20 && levelNumber % 5 === 0;
    const avgLength = cleaned.length
      ? cleaned.reduce((sum, word) => sum + word.length, 0) / cleaned.length
      : 0;
    const longWords = cleaned.filter(word => word.length === level.letters.length).length;
    const score = Math.round(
      cleaned.length * 1.4 +
      avgLength * 1.2 +
      longWords * 1.7 +
      level.letters.length * 2 +
      (hard ? 7 : 0)
    );
    const tier = hard ? 'hard' : score >= 31 ? 'challenging' : score >= 21 ? 'steady' : 'gentle';
    level.difficulty = Object.freeze({ score, tier, hard });
  });

  const primarySeen = new Map();
  levels.forEach((level, index) => {
    const primary = level.words?.[0];
    if (!primary) return;
    if (primarySeen.has(primary)) {
      issues.push({ level: index + 1, word: primary, issue: `duplicate-primary-with-level-${primarySeen.get(primary)}` });
    } else {
      primarySeen.set(primary, index + 1);
    }
  });

  window.FaithWordsLevelQuality = Object.freeze({
    version: 32,
    issues: Object.freeze(issues),
    summary: Object.freeze({
      levelCount: levels.length,
      hardLevels: levels.filter(level => level.difficulty?.hard).length,
      issueCount: issues.length
    })
  });

  if (issues.some(item => !['moved-to-bonus-only'].includes(item.issue))) {
    console.warn('FaithWords level quality audit', issues);
  }
})();
