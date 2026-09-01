import fs from 'node:fs';
import vm from 'node:vm';

const read = path => fs.readFileSync(path, 'utf8');
const failures = [];
const passes = [];

function check(condition, message) {
  if (condition) passes.push(message);
  else failures.push(message);
}

function canSpell(word, rack) {
  const counts = Object.create(null);
  for (const ch of rack) counts[ch] = (counts[ch] || 0) + 1;
  for (const ch of word) {
    if (!counts[ch]) return false;
    counts[ch] -= 1;
  }
  return true;
}

const sessionMap = new Map();
const sandbox = {
  console,
  sessionStorage: {
    getItem: key => sessionMap.has(key) ? sessionMap.get(key) : null,
    setItem: (key, value) => sessionMap.set(key, String(value)),
    removeItem: key => sessionMap.delete(key)
  }
};
sandbox.window = sandbox;
vm.createContext(sandbox);

for (const file of [
  'levels-v12.js',
  'levels-tuning-v13.js',
  'level-quality-v32.js',
  'faithwords-config-v32.js',
  'lexicon-v32.js'
]) {
  vm.runInContext(read(file), sandbox, { filename: file });
}

const levels = sandbox.FaithWordsLevels;
const quality = sandbox.FaithWordsLevelQuality;
const config = sandbox.FaithWordsConfig;
const lexicon = sandbox.FaithWordsLexicon;

check(Array.isArray(levels) && levels.length === 50, '50 level definitions load');
check(quality?.version === 32, 'v32 puzzle-quality layer loads');
check(quality?.summary?.errorCount === 0, 'puzzle-quality audit has zero errors');
check(config?.version === 32, 'v32 central configuration loads');
check(lexicon?.version === 32, 'v32 local lexicon loads');

const allowedTiers = new Set(['gentle','steady','challenging','advanced','hard']);
levels.forEach((level, index) => {
  const number = index + 1;
  const words = level.words || [];
  check(words.length > 0, `Level ${number} has required words`);
  check(new Set(words).size === words.length, `Level ${number} has no duplicate required words`);
  check(words.every(word => word.length >= 3), `Level ${number} enforces minimum required-word length`);
  check(words.every(word => canSpell(word, level.letters)), `Level ${number} required words can be made from wheel`);
  check(Number.isFinite(level.difficulty?.score) && level.difficulty.score > 0, `Level ${number} has difficulty score`);
  check(allowedTiers.has(level.difficulty?.tier), `Level ${number} has difficulty tier`);
  check((level.bonusOnlyWords || []).every(word => !words.includes(word)), `Level ${number} keeps bonus-only words off board`);
});

check(quality.rules.minimumRequiredWordLength === 3, 'minimum required-word length is centralized');
check(quality.rules.bonusOnlyWords.includes('PEE'), 'questionable word PEE is classified bonus-only');
check(lexicon.isBonusOnly('PEE') && lexicon.isAccepted('PEE'), 'bonus-only words validate locally without becoming board answers');
check(lexicon.excluded.every(word => !lexicon.isAccepted(word)), 'excluded lexicon words cannot be locally accepted');

const expectedHard = [20,25,30,35,40,45,50];
check(JSON.stringify([...config.hardLevels]) === JSON.stringify(expectedHard), 'HARD cadence is exactly 20,25,30,35,40,45,50');
check(config.hardCompletionBonus === 2, 'HARD first-completion reward is +2 Hint Points');
check(config.maxHintPoints === 200, 'Hint Points are capped at 200');
check(config.hints.nudge === 3 && config.hints.letter === 5 && config.hints.word === 15, 'three hint costs are 3/5/15');

const date = '2026-09-01';
const dailyA = config.dailyIndex(date, levels.length);
const dailyB = config.dailyIndex(date, levels.length);
const miniA = config.dailyMiniIndex(date, levels.length);
const miniB = config.dailyMiniIndex(date, levels.length);
check(dailyA === dailyB && dailyA >= 0 && dailyA < levels.length, 'Daily FaithWords selection is deterministic and in range');
check(miniA === miniB && miniA >= 0 && miniA < Math.min(12, levels.length), 'Daily Mini selection is deterministic and short-puzzle scoped');

const journeyTitles = [...config.journeys].map(journey => journey.title);
for (const title of ['Jesus & Grace','Faith & Courage','Word & Wisdom','Creation & Wonder','Service & Community','Worship & Trust']) {
  check(journeyTitles.includes(title), `Scripture Journey exists: ${title}`);
}
check([...config.journeys].every(journey => [...journey.levels].every(number => number >= 1 && number <= levels.length)), 'Scripture Journey level references are valid');

for (const theme of ['Faith','Grace','Peace','Light','Mercy','Heart','Giant','Table','Cedar']) {
  const prompt = config.carryPrompt({ theme });
  check(prompt && !prompt.startsWith('What truth from this Scripture'), `Theme-specific Carry prompt exists: ${theme}`);
}
check(config.carryPrompt({ theme: 'Faith' }) === 'What next step can you take before the whole path is clear?', 'Faith reflection prompt matches product requirement');

// Special-mode startup guard must run before the game engine.
sessionMap.set(config.specialSessionKey, JSON.stringify({ type: 'daily', index: 19 }));
const guardSandbox = { console, sessionStorage: sandbox.sessionStorage };
guardSandbox.window = guardSandbox;
vm.createContext(guardSandbox);
vm.runInContext(read('faithwords-config-v32.js'), guardSandbox, { filename: 'faithwords-config-v32.js' });
check(guardSandbox.FaithWordsSessionMode === 'daily', 'startup guard restores Daily mode before game initialization');
sessionMap.clear();

const index = read('index.html');
const experience = read('experience-v32.js');
const experienceCss = read('experience-v32.css');
const runtimePatcher = read('game-runtime-v3.js');
const baseRuntime = read('game-v3.js');
const serviceWorker = read('service-worker.js');
const accountSync = read('account-sync-v13.js');

const sequence = [
  'level-quality-v32.js',
  'faithwords-config-v32.js',
  'lexicon-v32.js',
  'game-runtime-v3.js',
  'experience-v32.js'
].map(name => index.indexOf(name));
check(sequence.every(position => position >= 0) && sequence.every((position, i) => i === 0 || position > sequence[i - 1]), 'index loads quality → config → lexicon → runtime → premium experience in order');
check(!index.includes('hud-layout-v18.js'), 'legacy HUD relocator script is not loaded');
check(!index.includes('hud-layout-v18.css'), 'legacy HUD relocator stylesheet is not loaded');
check(index.includes('id="levelPickerButton"'), 'current-level pill is the level-picker entry point');
check(index.includes('aria-hidden="true" tabindex="-1">Levels</button>'), 'legacy Levels hook is hidden from the 3-bar menu');

for (const text of ['Daily FaithWords','Daily Mini','Scripture Journeys','Word Journal','Saved Verses','Display & Accessibility']) {
  check(experience.includes(text), `premium menu includes ${text}`);
}
for (const text of ['Starting Tile','Whole Word','faithWordsSpecialBackupV32','faithWordsSpecialSessionV32','Challenge a Friend','Save Verse']) {
  check(experience.includes(text), `premium experience contains ${text}`);
}
check(experience.includes("['daily','mini','challenge']"), 'special modes are explicitly isolated from normal progression/rewards');
check(experienceCss.includes('.confetti{display:none!important;}'), 'confetti is disabled in the calm Verse Reveal');
check(experienceCss.includes('left-handed'), 'left-handed presentation rules exist');
check(experienceCss.includes('reduced-motion'), 'reduced-motion presentation rules exist');
check(experienceCss.includes('dark-ui'), 'dark interface presentation rules exist');
check(experienceCss.includes('high-contrast'), 'higher-contrast presentation rules exist');

// Execute the runtime transformation without executing the resulting game. This catches
// fragile source-replacement failures before deployment.
const generatedScripts = [];
const patchSandbox = {
  console,
  fetch: async () => ({ ok: true, status: 200, text: async () => baseRuntime }),
  document: {
    createElement: () => ({ textContent: '' }),
    head: { appendChild: node => generatedScripts.push(node.textContent) },
    getElementById: () => null
  },
  setTimeout,
  clearTimeout
};
patchSandbox.window = patchSandbox;
vm.createContext(patchSandbox);
vm.runInContext(runtimePatcher, patchSandbox, { filename: 'game-runtime-v3.js' });
await new Promise(resolve => setTimeout(resolve, 20));
const generatedRuntime = generatedScripts.join('\n');
check(generatedRuntime.includes('window.FaithWordsGame = {'), 'upgraded runtime API is generated successfully');
check(generatedRuntime.includes('MAX_HINT_POINTS'), 'generated runtime enforces Hint Point maximum');
check(generatedRuntime.includes("!['daily','mini','challenge'].includes(specialMode)"), 'generated runtime blocks HARD rewards in special modes');
check(generatedRuntime.includes('foundWords') && generatedRuntime.includes('hintedByLevel'), 'generated runtime persists mid-level solved words and hint reveals');
check(generatedRuntime.includes("ui.wheel.addEventListener('pointercancel', event =>"), 'generated runtime cancels Android swipe without submitting');
check(generatedRuntime.includes('faithwords-level-completed'), 'generated runtime emits Verse Reveal completion event');
check(!generatedRuntime.includes("ui.wheel.addEventListener('pointercancel', endSelection"), 'legacy pointer-cancel submission path is removed');

check(serviceWorker.includes('level-quality-v32.js') && serviceWorker.includes('faithwords-config-v32.js') && serviceWorker.includes('lexicon-v32.js') && serviceWorker.includes('experience-v32.js'), 'offline shell caches all v32 architecture layers');
check(!serviceWorker.includes('hud-layout-v18.js') && !serviceWorker.includes('hud-layout-v18.css'), 'offline shell no longer caches legacy HUD relocator');
check(index.includes('meta name="faithwords-google-client-id" content=""'), 'Google OAuth Client ID remains intentionally unconfigured');
check(accountSync.includes("if (!CLIENT_ID)"), 'Google sync framework safely handles missing OAuth Client ID');

const monetizationSurface = `${index}\n${experience}`;
for (const forbidden of ['loot box','loot boxes','diamond currency','energy currency']) {
  check(!monetizationSurface.toLowerCase().includes(forbidden), `no disruptive monetization mechanic: ${forbidden}`);
}

console.log(`FaithWords v32 QA: ${passes.length} checks passed.`);
if (failures.length) {
  console.error(`FaithWords v32 QA: ${failures.length} checks failed:`);
  failures.forEach(item => console.error(` - ${item}`));
  process.exit(1);
}
