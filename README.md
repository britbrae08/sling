# SLING

**Small stone. Big challenge.**

SLING is a mobile-first, Bible-era physics puzzle game built around one tactile interaction: **pull, aim, release**.

This repository currently contains the first dependency-free playable web prototype. The purpose of this version is to validate whether the sling itself feels satisfying before adding accounts, monetization, large content systems, or native app packaging.

## Prototype features

- Touch, pen, and mouse controls using Pointer Events
- Pull-back sling gesture with predicted trajectory
- Projectile gravity, ricochets, ground bounces, and obstacle collisions
- Clay jars, bullseyes, obstacles, and a first boss-style target
- 12 starter levels across Bethlehem Fields, Valley Road, and Valley of Elah
- 1–3 star scoring based on shot efficiency
- Limited stones per level
- Level unlocking and best-star progress saved in `localStorage`
- Level picker
- Lightweight sound generated with Web Audio (no audio assets required)
- Haptic feedback on supported phones
- Responsive portrait-first interface
- Web app manifest and prototype icon
- No frameworks or build step yet

## Play locally

Because this is a static prototype, any simple local HTTP server works. For example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080` on a desktop browser or a phone on the same local network.

Opening `index.html` directly will also render the game in most browsers, though serving over HTTP is preferred for web-app features.

## Core design rule

Before adding progression systems, leaderboards, daily challenges, cosmetics, accounts, or monetization, the core loop needs to be fun on its own:

> Pull → Aim → Release → Impact → Satisfaction → Next level

## Near-term roadmap

1. Playtest the launch feel on real iPhone and Android devices.
2. Tune launch power, gravity, collision response, and trajectory guidance.
3. Replace prototype geometric art with a coherent SLING visual direction.
4. Add richer target/obstacle mechanics: ropes, switches, breakables, moving targets, wind, and chain reactions.
5. Expand the first world to roughly 20–30 polished test levels.
6. Add level-completion juice: stronger impact animation, particles, audio, haptics, and camera response.
7. Add a Daily Sling challenge and score comparison only after the single-player loop proves fun.
8. Decide on the production game stack/native packaging once the prototype is validated.

## Product direction

SLING should remain a **game first**. The Bible is the setting and inspiration rather than a quiz layer. Early environments draw from the shepherd fields around Bethlehem and the Valley of Elah, while later worlds can broaden into an ancient biblical-era adventure aesthetic.

The initial product is intended for short sessions—roughly 30 seconds to a few minutes at a time—with enough mastery and three-star replayability to appeal to teens and adults.

## Brand relationship

SLING is presented by **FaithCraft**. The public-facing brand can simply use the name **FaithCraft**, while the associated studio/agency website remains **faithcraft.agency**. The word “Agency” does not need to appear in the game branding itself.

## Current architecture

The prototype deliberately uses plain HTML, CSS, Canvas, and JavaScript. This keeps iteration fast and makes it easy to test by URL before committing to a production framework. Once the mechanic is validated, the project can move to a game-focused stack that supports shared web/iOS/Android code.

---

Prototype by **FaithCraft**.
