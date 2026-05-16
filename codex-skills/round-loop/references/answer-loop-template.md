# Answer Loop Template

Use this as a starting shape, then rename variables to match the game.

```jsx
const TOTAL_ROUNDS = 10

function makeQuestion(previousQuestion = null) {
  return {
    id: `${Date.now()}-${Math.random()}`,
    answer: "example",
    options: ["example", "other"],
  }
}

export default function ExampleGame() {
  const [question, setQuestion] = useState(() => makeQuestion())
  const [roundsComplete, setRoundsComplete] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [roundMarks, setRoundMarks] = useState([])
  const [removed, setRemoved] = useState([])
  const [correctOption, setCorrectOption] = useState(null)
  const [wrongOption, setWrongOption] = useState(null)
  const [acceptingAnswers, setAcceptingAnswers] = useState(true)
  const [flash, setFlash] = useState("")
  const [showWin, setShowWin] = useState(false)

  function startGame() {
    setQuestion(makeQuestion())
    setRoundsComplete(0)
    setCorrect(0)
    setIncorrect(0)
    setRoundMarks([])
    setRemoved([])
    setCorrectOption(null)
    setWrongOption(null)
    setAcceptingAnswers(true)
    setFlash("")
    setShowWin(false)
  }

  function flashScreen(className) {
    setFlash("")
    window.requestAnimationFrame(() => {
      setFlash(className)
      window.setTimeout(() => setFlash(""), 500)
    })
  }

  function goToNextRound() {
    setQuestion(currentQuestion => makeQuestion(currentQuestion))
    setRemoved([])
    setCorrectOption(null)
    setWrongOption(null)
    setAcceptingAnswers(true)
  }

  function chooseAnswer(value) {
    if (!acceptingAnswers || removed.includes(value)) return

    if (value === question.answer) {
      const nextRound = roundsComplete + 1
      const alreadyMissed = roundMarks[roundsComplete] === "incorrect"
      setCorrectOption(value)
      if (!alreadyMissed) {
        setCorrect(count => count + 1)
        setRoundMarks(existing => {
          const nextMarks = [...existing]
          nextMarks[roundsComplete] = "correct"
          return nextMarks
        })
      }
      setRoundsComplete(nextRound)
      setAcceptingAnswers(false)
      flashScreen("screen-flash-green")

      if (nextRound >= TOTAL_ROUNDS) {
        window.setTimeout(() => setShowWin(true), 650)
      } else {
        window.setTimeout(goToNextRound, 650)
      }
      return
    }

    setIncorrect(count => count + 1)
    setRoundMarks(existing => {
      const nextMarks = [...existing]
      nextMarks[roundsComplete] = "incorrect"
      return nextMarks
    })
    setWrongOption(value)
    flashScreen("screen-flash-red")
    window.setTimeout(() => {
      setRemoved(existing => [...existing, value])
      setWrongOption(null)
    }, 300)
  }

  useEffect(() => {
    if (!flash) return undefined
    document.body.classList.add(flash)
    return () => document.body.classList.remove(flash)
  }, [flash])
}
```

## Common Variants

- If questions are precomputed, store `questions` and `round`; derive `question = questions[round]`.
- If wrong choices should stay available, omit `removed` and clear `wrongChoice` after about `350ms`.
- If the game has a reveal or replay phase, block answer handling with an extra state such as `isRevealing`.
- If the player can change settings, reset `correct`, `incorrect`, progress, transient option state, and `showWin` in the settings change handler.
