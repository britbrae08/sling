(() => {
  'use strict';
  const levels = window.FaithWordsLevels;
  if (!Array.isArray(levels) || levels.length < 50) return;

  Object.assign(levels[29], {
    theme: 'Star',
    letters: 'STARE',
    words: ['STARE','STAR','RATE','TEAR','SEAT','EAST','EATS','EARS','EAR','ARE','ART','RAT','TAR','TEA','EAT'],
    verse: 'Matthew 2:10',
    verseText: 'The travelers rejoiced when they saw the star.',
    reading: 'A clear point of light can still guide the next faithful step when the whole route is not visible.'
  });

  Object.assign(levels[34], {
    theme: 'Cedar',
    letters: 'CEDAR',
    words: ['CEDAR','DEAR','READ','DARE','CARD','CARE','RACE','ACRE','ACE','ARC','CAR','EAR','ERA','RED'],
    verse: 'Psalm 92:12',
    verseText: 'Scripture compares flourishing strength to the cedar of Lebanon.',
    reading: 'Strong growth is often slow growth: rooted, steady, and able to endure changing seasons.'
  });

  Object.assign(levels[39], {
    theme: 'Table',
    letters: 'TABLE',
    words: ['TABLE','ABLE','BALE','LATE','TALE','BELT','BEAT','TEAL','BETA','BAT','BET','TAB','TEA','EAT','LET'],
    verse: 'Psalm 23:5',
    verseText: 'The psalm pictures God preparing a table even in the presence of trouble.',
    reading: 'God’s provision does not require every difficulty to disappear before we can recognize His care.'
  });

  Object.assign(levels[44], {
    theme: 'Giant',
    letters: 'GIANT',
    words: ['GIANT','TANG','GAIN','ANTI','TIN','TAN','TAG','ANT','NAG','GIN'],
    verse: '1 Samuel 17:45',
    verseText: 'David faced a giant with confidence rooted in God.',
    reading: 'Courage grows when the size of the challenge is not the only thing we see.'
  });

  Object.assign(levels[49], {
    theme: 'Stars',
    letters: 'STARS',
    words: ['STARS','STAR','TARS','RATS','TSAR','ART','RAT','TAR','SAT'],
    verse: 'Genesis 1:16',
    verseText: 'The lights of the heavens are part of God’s created order.',
    reading: 'The night sky can remind us how large creation is and how intentionally Scripture describes it.'
  });

  // Development guard: every level must have a unique primary puzzle word.
  const seenPrimaryWords = new Map();
  levels.forEach((level, index) => {
    const primary = String(level.words?.[0] || '').toUpperCase();
    if (!primary) return;
    if (seenPrimaryWords.has(primary)) {
      console.error(`FaithWords duplicate primary word: ${primary} on levels ${seenPrimaryWords.get(primary)} and ${index + 1}`);
    } else {
      seenPrimaryWords.set(primary, index + 1);
    }
  });
})();
