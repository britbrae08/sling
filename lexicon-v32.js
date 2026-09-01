(() => {
  'use strict';

  const accepted = [
    'MAR','PAR','RAP','YAP','SAT','RATS','TARS','ARTS','ORC','ION','NIL',
    'FAT','AFT','ACRE','GEAR','CAR','EAR','ARE','ARC','ERA','RAG','APE','CAP',
    'BARE','BEAD','BRED','BED','RED','DARE','BARD','GILT','THE','HATER',
    'GALE','GLEAN','ALE','LEG','LAG','GEL','CORN','NOR','ROW','COW',
    'WEAR','RAW','TONE','NOTE','ONES','SENT','SOT','SON','TOE',
    'SOME','MESS','MOSS','DIVA','AID','VIA','TREE','PEER','PET',
    'PAL','MAP','LAP','SAP','WHAT','TEA','SEE','SHE','FRUIT','FUR','RUT',
    'BILE','BIB','LIE','HURT','HUT','CRY','RYE','EVER','VEER','EVE',
    'GORY','LOG','JUG','DUG','DUE','FOOD','FOOL','FOLD','OLD',
    'MADE','ARM','RAM','LIVE','LOVE','VEIL','OIL','FAST','FAT',
    'LACK','COAL','COLA','OAK','HEAR','HARE','HER','SEA','RAT','TAR',
    'GAIN','ANTI','TIN','TAN','TAG','ANT','NAG','GIN','LORD','ORE',
    'SING','SKIN','SIN','SLAM','LAB','PEAR','YEAR','PARE','TSAR','EATS','EAST','SEAT',
    'EARS','EAT','CARD','DEAR','READ','CARE','RACE','ACE','TABLE','ABLE','BALE',
    'LATE','TALE','BELT','BEAT','TEAL','BETA','BAT','BET','TAB','LET'
  ];

  const excluded = [
    // Keep this list intentionally small. It is for entries that a general
    // dictionary may technically recognize but that would feel archaic,
    // offensive, or confusing in a calm all-ages word game.
    'OPE','WIS','ERG','ERE','NTH'
  ];

  window.FaithWordsLexicon = Object.freeze({
    version: 32,
    accepted: Object.freeze([...new Set(accepted)]),
    excluded: Object.freeze(excluded)
  });
})();
