(() => {
  'use strict';

  const coreAccepted = [
    'MAR','PAR','RAP','YAP','SAT','RATS','TARS','ARTS','ORC','ION','NIL',
    'FAT','AFT','ACRE','GEAR','CAR','EAR','ARE','ARC','ERA','RAG','APE','CAP',
    'BARE','BEAD','BRED','BED','RED','DARE','BARD','GILT','THE','HATER',
    'GALE','GLEAN','ALE','LEG','LAG','GEL','CORN','NOR','ROW','COW',
    'WEAR','RAW','TONE','NOTE','ONES','SENT','SOT','SON','TOE',
    'SOME','MESS','MOSS','DIVA','AID','VIA','TREE','PEER','PET',
    'PAL','MAP','LAP','SAP','WHAT','TEA','SEE','SHE','FRUIT','FUR','RUT',
    'BILE','BIB','LIE','HURT','HUT','CRY','RYE','EVER','VEER','EVE',
    'GORY','LOG','JUG','DUG','DUE','FOOD','FOOL','FOLD','OLD',
    'MADE','ARM','RAM','LIVE','LOVE','VEIL','OIL','FAST','LACK','COAL','COLA','OAK',
    'HEAR','HARE','HER','SEA','RAT','TAR','GAIN','ANTI','TIN','TAN','TAG','ANT','NAG','GIN',
    'LORD','ORE','SING','SKIN','SIN','SLAM','LAB','PEAR','YEAR','PARE','TSAR','EATS','EAST','SEAT',
    'EARS','EAT','CARD','DEAR','READ','CARE','RACE','ACE','TABLE','ABLE','BALE',
    'LATE','TALE','BELT','BEAT','TEAL','BETA','BAT','BET','TAB','LET'
  ];

  // These are valid enough to reward as discoveries, but are intentionally kept
  // off required crossword boards because they can feel awkward or distracting.
  const bonusOnly = [
    ...(window.FaithWordsLevelQuality?.rules?.bonusOnlyWords || ['PEE'])
  ];

  const excluded = [
    // A general dictionary may recognize these, but they are too archaic,
    // technical, confusing, or otherwise poor fits for this all-ages game.
    'OPE','WIS','ERG','ERE','NTH'
  ];

  const boardWords = (window.FaithWordsLevels || []).flatMap(level => level.words || []);
  const accepted = [...new Set([...coreAccepted, ...bonusOnly, ...boardWords].map(word => String(word).toUpperCase()))];
  const excludedSet = new Set(excluded.map(word => String(word).toUpperCase()));
  const bonusOnlySet = new Set(bonusOnly.map(word => String(word).toUpperCase()));
  const acceptedSet = new Set(accepted.filter(word => !excludedSet.has(word)));

  window.FaithWordsLexicon = Object.freeze({
    version: 32,
    accepted: Object.freeze([...acceptedSet]),
    bonusOnly: Object.freeze([...bonusOnlySet]),
    excluded: Object.freeze([...excludedSet]),
    isAccepted(word) {
      return acceptedSet.has(String(word || '').toUpperCase());
    },
    isBonusOnly(word) {
      return bonusOnlySet.has(String(word || '').toUpperCase());
    },
    isExcluded(word) {
      return excludedSet.has(String(word || '').toUpperCase());
    },
    classify(word) {
      const value = String(word || '').toUpperCase();
      if (excludedSet.has(value)) return 'excluded';
      if (bonusOnlySet.has(value)) return 'bonus-only';
      if (acceptedSet.has(value)) return 'accepted';
      return 'unfamiliar';
    }
  });
})();
