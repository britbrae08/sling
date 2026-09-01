(() => {
  'use strict';

  const SPECIAL_SESSION_KEY = 'faithWordsSpecialSessionV32';

  // Establish Daily/Mini/Challenge mode before the asynchronous game runtime
  // boots. This prevents a reload during a special HARD puzzle from briefly
  // being treated as normal journey progression or earning a normal hard bonus.
  try {
    const activeSession = JSON.parse(sessionStorage.getItem(SPECIAL_SESSION_KEY) || 'null');
    window.FaithWordsSessionMode = ['daily','mini','challenge'].includes(activeSession?.type)
      ? activeSession.type
      : 'normal';
  } catch {
    window.FaithWordsSessionMode = 'normal';
  }

  const HARD_LEVELS = Object.freeze([20,25,30,35,40,45,50]);

  const journeys = Object.freeze([
    Object.freeze({
      id: 'jesus-grace',
      title: 'Jesus & Grace',
      subtitle: 'Christ, grace, peace, sacrifice and hope',
      levels: Object.freeze([7,9,13,14,15,16,17,18,19,23,47,48])
    }),
    Object.freeze({
      id: 'faith-courage',
      title: 'Faith & Courage',
      subtitle: 'Trust God when the way ahead is difficult',
      levels: Object.freeze([5,6,20,24,26,27,31,33,34,39,45])
    }),
    Object.freeze({
      id: 'word-wisdom',
      title: 'Word & Wisdom',
      subtitle: 'Scripture, truth, discernment and faithful choices',
      levels: Object.freeze([3,4,11,22,25,28,32,35,37])
    }),
    Object.freeze({
      id: 'creation-wonder',
      title: 'Creation & Wonder',
      subtitle: 'Notice God through creation, provision and beauty',
      levels: Object.freeze([1,2,10,21,29,30,36,38,40,50])
    }),
    Object.freeze({
      id: 'service-community',
      title: 'Service & Community',
      subtitle: 'Relationships, generosity, belonging and service',
      levels: Object.freeze([12,25,31,35,41,42,43,44])
    }),
    Object.freeze({
      id: 'worship-trust',
      title: 'Worship & Trust',
      subtitle: 'Prayer, worship, leadership and remembering God',
      levels: Object.freeze([5,8,9,20,24,27,41,44,46,47,49])
    })
  ]);

  const carryPrompts = Object.freeze({
    God: 'Where would stillness help you remember who God is today?',
    Pray: 'What is one thing you can bring honestly to God right now?',
    Hope: 'Where do you need to choose hope before you can see the outcome?',
    Faith: 'What next step can you take before the whole path is clear?',
    Grace: 'Where can you receive grace instead of trying to prove yourself?',
    Peace: 'What pressure can you place in Christ’s hands today?',
    Light: 'Where can you bring a little more truth or kindness today?',
    Heart: 'What has been shaping your inner life lately?',
    Truth: 'What truth gives you solid ground to stand on today?',
    Mercy: 'Where do you need a fresh beginning?',
    Share: 'Who could be strengthened by something you can share today?',
    Giant: 'What challenge looks different when God is part of the picture?',
    Cedar: 'What steady practice is helping you grow strong roots?',
    Table: 'What provision can you notice even before every problem is gone?',
    Stars: 'What does creation remind you about God today?'
  });

  function hashFNV1a(value) {
    let hash = 2166136261;
    for (const ch of String(value)) {
      hash ^= ch.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  window.FaithWordsConfig = Object.freeze({
    version: 32,
    maxHintPoints: 200,
    hardCompletionBonus: 2,
    hardLevels: HARD_LEVELS,
    hints: Object.freeze({ nudge: 3, letter: 5, word: 15 }),
    quality: window.FaithWordsLevelQuality?.rules || null,
    specialSessionKey: SPECIAL_SESSION_KEY,
    shareBaseUrl: 'https://faithcraft.agency/faithwords/',
    isHardLevel(levelNumber) {
      return HARD_LEVELS.includes(Number(levelNumber));
    },
    journeys,
    carryPrompt(level) {
      if (!level) return 'What truth from this Scripture do you want to carry into today?';
      return carryPrompts[level.theme] || 'What truth from this Scripture do you want to carry into today?';
    },
    dailyIndex(dateKey, levelCount) {
      return hashFNV1a(`daily-v32:${dateKey}`) % Math.max(1, Number(levelCount) || 1);
    },
    dailyMiniIndex(dateKey, levelCount) {
      const miniCount = Math.max(1, Math.min(12, Number(levelCount) || 1));
      return hashFNV1a(`mini-v32:${dateKey}`) % miniCount;
    }
  });
})();
