# CSS Patterns

## Shell and panel

Reuse the shared shell and panel. Add only the game-specific class.

```jsx
<GameShell title="Game Title" subtitle="short instruction">
  <section className="panel example-panel" aria-live="polite">
    ...
  </section>
</GameShell>
```

```css
.example-panel {
  display: grid;
  gap: 18px;
  padding: 18px;
  text-align: center;
}
```

## Option grid

Use stable tracks and aspect ratios for tappable answers.

```css
.example-options {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.example-option {
  aspect-ratio: 1;
  border: 4px solid var(--surface-border);
  border-radius: 24px;
  background: #fff;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 2rem;
  line-height: 1;
  transition:
    transform 0.15s ease,
    opacity 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.example-option:hover:not(:disabled) {
  transform: scale(1.05);
}

.example-option.correct {
  background: #d8f7d7;
  border-color: var(--green);
  color: #2d7033;
  transform: scale(1.08);
}

.example-option.wrong {
  background: #ffe1e0;
  border-color: var(--red);
  color: #d13232;
  animation: shake 0.3s ease;
}

.example-option.removed {
  opacity: 0;
  transform: scale(0);
  pointer-events: none;
}
```

## Prompt objects

For arrays of visible objects, use CSS grid and fixed-ish dimensions:

```css
.example-object-row {
  width: 100%;
  min-height: 104px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: center;
  justify-items: center;
  gap: 10px;
  padding: 4px 8px;
  font-size: 3rem;
  line-height: 1;
}
```

## Feedback names

Prefer these names to fit existing code:

- `correct` for the chosen right answer.
- `wrong` for the chosen wrong answer pulse.
- `removed` for hidden wrong options.
- `correct-flash` for temporary found-item animation.
- `screen-flash-green` and `screen-flash-red` for body flash classes.

## Mobile safety

- Avoid viewport-scaled fonts except existing clamped emoji/token cases.
- Keep labels short so buttons do not overflow.
- Use `minmax(0, 1fr)` in grids so text and emoji can shrink inside tracks.
- Use `min-width: 0` on grid children that contain large text, emoji, or generated objects.
