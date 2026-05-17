---
name: add-game
description: Build or extend games in this specific Next.js Learning Games app. Use when adding a new classroom game, wiring a game route, registering a game card, matching existing component structure, or updating shared app navigation for games under app/games, components, lib/games.js, and app/globals.css.
---

# Add Game

## Workflow

Use this skill to add a new game end to end in this repo.

1. Read the nearest existing game in `components/` before writing code.
2. Create a client component in `components/<GameName>Game.jsx`.
3. Wrap the activity in `GameShell`; use `RoundTracker` for round-based games or `ScoreBar` for collection/search/sorting games.
4. Create a thin route at `app/games/<slug>/page.jsx` with metadata and the component render only.
5. Add the game to `lib/games.js` with `title`, `href`, `description`, `accent`, and `category`.
6. Add scoped CSS to `app/globals.css`, reusing existing shell, panel, option, correct, wrong, and removed class conventions.
7. Verify with `npm run build`; for visual or interaction work, run the app and inspect the game in a browser.

## App Conventions

- Use JavaScript and JSX, not TypeScript.
- Add `"use client"` to interactive game components.
- Keep route pages as server components unless the page itself needs interactivity.
- Import app modules with the `@/` alias when crossing top-level folders.
- Prefer constants such as `TOTAL_ROUNDS`, `GOAL`, `OPTIONS`, and domain-specific item pools near the top of the game file.
- Keep question generation as pure helper functions above the component.
- Avoid hydration mismatches: do not call randomized or time-based helpers (`Math.random`, `Date.now`, shuffled question builders, random IDs) inside `useState` initializers or render-time expressions that affect the initial UI. Use deterministic initial state such as `null`, `[]`, or an ordered placeholder, then generate randomized rounds in `useEffect` after hydration.
- Keep the home page driven by `lib/games.js`; do not hard-code new cards in `app/page.jsx`.
- Preserve the app's mobile-first width: shared shells max out at 500px.

## References

Read `references/app-map.md` when you need exact file responsibilities, route-page shape, or registration examples.
