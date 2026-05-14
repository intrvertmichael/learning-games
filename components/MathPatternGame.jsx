"use client"

import { useEffect, useState } from "react"

import CongratsOverlay from "./CongratsOverlay"
import GameShell from "./GameShell"
import RoundTracker from "./RoundTracker"

const TOTAL_ROUNDS = 10
const PATTERN_LENGTH = 6
const REVEAL_STEP = 0.58
const REVEAL_ANIMATION = 0.62
const EMOJI_PAIRS = [
  ["🍎", "🍌"],
  ["🚗", "✈️"],
  ["⭐", "🌙"],
  ["🐶", "🐱"],
  ["🌈", "☀️"],
  ["⚽", "🏀"],
  ["🎈", "🎁"],
  ["🍕", "🍔"],
  ["🦋", "🌻"],
  ["🐸", "🐝"],
  ["🍓", "🍇"],
  ["🚀", "🛸"],
]

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)]
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5)
}

function makeQuestion(previousQuestion = null) {
  const choices = EMOJI_PAIRS.filter(
    pair => pair.join("-") !== previousQuestion?.pairKey,
  )
  const pair = pickRandom(choices)
  const startsWithA = Math.random() > 0.5
  const pattern = Array.from({ length: PATTERN_LENGTH }, (_, index) => {
    const useFirst = index % 2 === 0 ? startsWithA : !startsWithA
    return useFirst ? pair[0] : pair[1]
  })
  const answer = startsWithA ? pair[0] : pair[1]
  const outsideDistractor = shuffle(
    EMOJI_PAIRS.flat().filter(emoji => !pair.includes(emoji)),
  )[0]

  return {
    id: `${pair.join("-")}-${startsWithA ? "a" : "b"}-${Date.now()}-${Math.random()}`,
    pairKey: pair.join("-"),
    pattern,
    answer,
    options: shuffle([...pair, outsideDistractor]),
  }
}

export default function MathPatternGame() {
  const [question, setQuestion] = useState(() => makeQuestion())
  const [roundsComplete, setRoundsComplete] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [roundMarks, setRoundMarks] = useState([])
  const [removed, setRemoved] = useState([])
  const [correctOption, setCorrectOption] = useState(null)
  const [wrongOption, setWrongOption] = useState(null)
  const [acceptingAnswers, setAcceptingAnswers] = useState(true)
  const [isRevealing, setIsRevealing] = useState(true)
  const [flash, setFlash] = useState("")
  const [replayKey, setReplayKey] = useState(0)
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
    setIsRevealing(true)
    setFlash("")
    setReplayKey(0)
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
    setIsRevealing(true)
    setQuestion(currentQuestion => makeQuestion(currentQuestion))
    setRemoved([])
    setCorrectOption(null)
    setWrongOption(null)
    setAcceptingAnswers(true)
  }

  function replayPattern() {
    setIsRevealing(true)
    setReplayKey(key => key + 1)
  }

  function chooseAnswer(value) {
    if (!acceptingAnswers || isRevealing || removed.includes(value)) return

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

  useEffect(() => {
    setIsRevealing(true)
    const revealMs = (PATTERN_LENGTH * REVEAL_STEP + REVEAL_ANIMATION) * 1000
    const timer = window.setTimeout(() => setIsRevealing(false), revealMs)
    return () => window.clearTimeout(timer)
  }, [question.id, replayKey])

  return (
    <GameShell title="Math Pattern" subtitle="find what comes next">
      <RoundTracker marks={roundMarks} total={TOTAL_ROUNDS} />

      <section className="panel pattern-panel">
        <div className="pattern-prompt">What comes next?</div>
        <div
          className="pattern-row"
          aria-live="polite"
          key={`${question.id}-${replayKey}`}
        >
          {question.pattern.map((emoji, index) => (
            <span
              className="pattern-token"
              key={`${question.id}-${index}`}
              style={{ animationDelay: `${index * REVEAL_STEP}s` }}
            >
              {emoji}
            </span>
          ))}
          <span
            className="pattern-token pattern-missing"
            style={{ animationDelay: `${PATTERN_LENGTH * REVEAL_STEP}s` }}
          >
            ?
          </span>
        </div>
        <button
          className="pattern-replay-button"
          disabled={isRevealing}
          onClick={replayPattern}
          type="button"
        >
          Replay
        </button>
      </section>

      <div className="pattern-options" aria-label="answer choices">
        {question.options.map(option => (
          <button
            className={`pattern-option ${
              removed.includes(option) ? "removed" : ""
            } ${correctOption === option ? "correct" : ""} ${
              wrongOption === option ? "wrong" : ""
            }`}
            key={option}
            onClick={() => chooseAnswer(option)}
            disabled={!acceptingAnswers || isRevealing || removed.includes(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>

      <CongratsOverlay
        correct={correct}
        incorrect={incorrect}
        onPlayAgain={startGame}
        show={showWin}
      />
    </GameShell>
  )
}
