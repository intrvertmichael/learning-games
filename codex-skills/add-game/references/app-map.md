# Learning Games App Map

## Core files

- `components/GameShell.jsx`: shared game page wrapper with home button, title, and optional subtitle.
- `components/CongratsOverlay.jsx`: win overlay with correct and incorrect totals plus play-again/home actions.
- `components/RoundTracker.jsx`: ten-ish mark row for round games; accepts `marks`, `total`, and optional `label`.
- `components/ScoreBar.jsx`: compact score display for non-round collection games.
- `components/PillButton.jsx` and `components/HomeButton.jsx`: shared buttons.
- `lib/games.js`: source of truth for home-page game cards.
- `app/games/<slug>/page.jsx`: one route file per game.
- `app/globals.css`: all component and game styling.

## Route page pattern

```jsx
import ExampleGame from "@/components/ExampleGame"

export const metadata = {
  title: "Example | Learning Games",
}

export default function ExamplePage() {
  return <ExampleGame />
}
```

## Game registration pattern

```js
{
  title: "Math Example",
  href: "/games/math-example",
  description: "Short child-friendly description.",
  accent: "orange",
  category: "math",
}
```

Use `category: "math"` or `"ela"` unless the home tabs are intentionally expanded. Current accent values are `blue`, `pink`, `green`, `yellow`, and the existing CSS also has an orange visual vocabulary through `--text-primary` and surface borders.

## Component skeleton

```jsx
"use client"

import { useEffect, useState } from "react"

import CongratsOverlay from "./CongratsOverlay"
import GameShell from "./GameShell"
import RoundTracker from "./RoundTracker"

const TOTAL_ROUNDS = 10

export default function ExampleGame() {
  const [round, setRound] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [roundMarks, setRoundMarks] = useState([])
  const [showWin, setShowWin] = useState(false)

  function startGame() {
    setRound(0)
    setCorrect(0)
    setIncorrect(0)
    setRoundMarks([])
    setShowWin(false)
  }

  return (
    <GameShell title="Example" subtitle="short instruction">
      <RoundTracker marks={roundMarks} total={TOTAL_ROUNDS} />
      <section className="panel example-panel">{/* prompt */}</section>
      <CongratsOverlay
        correct={correct}
        incorrect={incorrect}
        onPlayAgain={startGame}
        show={showWin}
      />
    </GameShell>
  )
}
```
