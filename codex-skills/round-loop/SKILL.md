---
name: round-loop
description: Implement the reusable round-based answer loop used across this Learning Games app. Use when a game has ten rounds, selectable answers, correct/wrong feedback, first-attempt scoring, removed wrong options, screen flashes, disabled input between rounds, RoundTracker marks, or a CongratsOverlay finish state.
---

# Round Loop

## Core Loop

Use this skill for answer-driven games such as math comparison, measurement, patterns, sets, and reading choices.

1. Generate a prompt or question with a pure helper function.
2. Track progress with `round` or `roundsComplete`, plus `correct`, `incorrect`, `roundMarks`, `acceptingAnswers`, `flash`, and `showWin`.
3. For multiple-choice games where wrong answers disappear, also track `removed`, `correctOption`, and `wrongOption`.
4. Ignore input when the game is not accepting answers or the selected option has already been removed.
5. On the first correct answer for a round, count a correct only if that round has not already been marked incorrect.
6. On an incorrect answer, increment incorrect every time, mark the current round as incorrect, flash red, and temporarily show the wrong state.
7. After a correct answer, block input, flash green, then either show the win overlay or advance after about 650ms.
8. Reset all per-round transient state before the next prompt.

## Timing And Feedback

- Use `flashScreen("screen-flash-green")` and `flashScreen("screen-flash-red")` with the body-class effect already used in the app.
- Use about `300ms` to remove a wrong option and about `350ms` for a wrong-choice pulse that stays visible.
- Use about `650ms` after a correct answer before advancing or showing the win overlay.
- Keep `aria-live="polite"` on changing prompt regions.

## References

Read `references/answer-loop-template.md` before implementing or repairing a round loop.
