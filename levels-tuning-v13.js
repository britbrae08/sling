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
    theme: 'Crown',
    letters: 'CROWN',
    words: ['CROWN','WORN','CROW','OWN','NOW','ROW','WON','COW'],
    verse: 'James 1:12',
    verseText: 'Scripture uses a crown as a picture of enduring faithfulness.',
    reading: 'Endurance grows through repeated faithful choices, especially when the easier option would be to stop.'
  });

  Object.assign(levels[39], {
    theme: 'Dream',
    letters: 'DREAM',
    words: ['DREAM','READ','DEAR','DARE','MADE','MARE','REAM','ARM','RAM','EAR','RED','MAD','DAM'],
    verse: 'Genesis 37:5',
    verseText: 'Joseph’s dreams became part of a much longer story.',
    reading: 'A meaningful beginning does not guarantee an easy middle, but God can keep working through the whole story.'
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
    theme: 'Star',
    letters: 'STARS',
    words: ['STARS','STAR','TARS','RATS','TSAR','ART','RAT','TAR','SAT'],
    verse: 'Genesis 1:16',
    verseText: 'The lights of the heavens are part of God’s created order.',
    reading: 'The night sky can remind us how large creation is and how intentionally Scripture describes it.'
  });
})();
