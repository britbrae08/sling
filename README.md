# FaithWords

**Find words. Uncover Scripture.**

FaithWords is a calm, mobile-first Bible-themed word puzzle game presented by **FaithCraft**.

## Current product system

FaithWords currently includes:

- 50 curated journey levels with intentional difficulty scoring and HARD-level cadence
- Swipe/drag word-connect wheel with backtracking, haptics, scramble, and Android pointer-cancel protection
- Crossword-style boards with movable/recenterable positioning
- Curated local lexicon plus dictionary fallback for unfamiliar bonus words
- Hint Points as the only gameplay resource, capped at 200
- Three hint choices: Starting Tile (3), Letter (5), Whole Word (15)
- +2 Hint Points on the first normal completion of eligible HARD levels
- Mid-level persistence for solved words and revealed hint letters
- Daily FaithWords and Daily Mini, isolated from normal progression
- Scripture Journeys grouped by theme without bypassing journey locks
- Scripture-focused Verse Reveal with reflection prompts and completion stats
- Saved Verses, shareable results, private Friend Challenges, and a Word Journal
- Display & Accessibility controls for text size, contrast, dark interface, reduced motion, haptics, and left-handed controls
- Installable PWA/offline shell
- Google cross-device sync framework (requires a configured Google OAuth Web Client ID before authentication can operate)

The game intentionally does **not** use global leaderboards, multiple currencies, lives, energy, loot boxes, or aggressive monetization mechanics.

## Core loop

> Swipe letters → discover words → fill the board → uncover Scripture → carry one thought forward → next puzzle

The Bible theme shapes the meaning of the experience without turning FaithWords into a trivia quiz. The goal is a word game that feels polished, peaceful, satisfying, and easy to return to for a few minutes at a time.

## v32 architecture

The core release layers load in a controlled sequence:

1. `level-quality-v32.js` — puzzle validation, bonus-only classification, difficulty scoring/tiering
2. `faithwords-config-v32.js` — progression rules, HARD cadence, hint costs, Daily selection, Journeys, reflection prompts
3. `lexicon-v32.js` — curated local word acceptance/exclusion
4. `game-runtime-v3.js` — upgraded gameplay runtime and persistent state
5. `experience-v32.js` — Daily/Mini, Journeys, Verse Reveal, sharing, Saved Verses, accessibility, special-mode backup/restore

Automated release checks live in `scripts/release-qa-v32.mjs` and run through `.github/workflows/release-qa.yml`.

## Public brand

FaithWords is presented by **FaithCraft** and is intended to be played publicly at `https://faithcraft.agency/faithwords/`.

The direct GitHub Pages origin remains available for deployment/debugging at `https://britbrae08.github.io/sling/`.

## Local development

No framework or build step is required for gameplay development:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

Run the release-quality gate with Node 22+:

```bash
node scripts/release-qa-v32.mjs
```

---

FaithWords by **FaithCraft**.
