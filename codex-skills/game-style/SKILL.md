---
name: game-style
description: Match the kid-friendly visual and interaction style of this Learning Games app. Use when styling a new or existing game, adding classes to app/globals.css, creating option buttons, panels, prompts, score displays, drag tokens, grids, correct/wrong/removed states, or responsive mobile-first game layouts.
---

# Game Style

## Style Principles

Use the existing app visual system instead of introducing a new design language.

- Build inside `GameShell` and let `.game-shell` provide the centered 500px mobile-first column.
- Use `.panel` for the main prompt area and extend it with a game-specific class.
- Use big, tappable buttons with visible borders, strong feedback states, and simple labels.
- Use the shared CSS variables in `:root` for surfaces, borders, text, green, and red.
- Keep prompts short and child-readable.
- Use `correct`, `wrong`, and `removed` state class names when possible.
- Preserve fixed dimensions or grid tracks for buttons, tokens, circles, rulers, and other interactive targets to avoid layout shift.
- Keep dynamic prompt regions accessible with `aria-live="polite"`.

## CSS Placement

Add styles to `app/globals.css` near related game styles:

- shared shell/control/card styles near the top,
- repeated option-grid styles next to existing option classes,
- game-specific panel and token styles near similar math or ELA games,
- keyframes near existing animations.

## References

Read `references/css-patterns.md` for exact reusable CSS shapes and naming patterns.
