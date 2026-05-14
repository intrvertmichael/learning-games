"use client"

import { useEffect, useState } from "react"

import CongratsOverlay from "./CongratsOverlay"
import GameShell from "./GameShell"
import RoundTracker from "./RoundTracker"

const TOTAL_ROUNDS = 10
const EMOJIS = ["🍎", "🚗", "⭐", "🐶", "🌈", "⚽", "🎈", "🍕", "🦋", "🌻"]

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)]
}

function makeQuestion(index) {
  const shouldMatch = index % 2 === 0
  const first = pickRandom(EMOJIS)

  if (shouldMatch) {
    return {
      id: `${index}-${first}-same`,
      first,
      second: first,
      answer: "same",
    }
  }

  const choices = EMOJIS.filter(emoji => emoji !== first)
  const second = pickRandom(choices)

  return {
    id: `${index}-${first}-${second}`,
    first,
    second,
    answer: "different",
  }
}

function makeQuestions() {
  return Array.from({ length: TOTAL_ROUNDS }, (_, index) =>
    makeQuestion(index),
  ).sort(() => Math.random() - 0.5)
}

export default function SameOrDifferentGame() {
  const [questions, setQuestions] = useState(() => makeQuestions())
  const [round, setRound] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [roundMarks, setRoundMarks] = useState([])
  const [selected, setSelected] = useState(null)
  const [wrongChoice, setWrongChoice] = useState(null)
  const [acceptingAnswers, setAcceptingAnswers] = useState(true)
  const [flash, setFlash] = useState("")
  const [showWin, setShowWin] = useState(false)

  const question = questions[round] ?? questions[questions.length - 1]

  function startGame() {
    setQuestions(makeQuestions())
    setRound(0)
    setCorrect(0)
    setIncorrect(0)
    setRoundMarks([])
    setSelected(null)
    setWrongChoice(null)
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

  function goToNextRound(nextRound) {
    setSelected(null)
    setWrongChoice(null)
    setAcceptingAnswers(true)
    setRound(nextRound)
  }

  function chooseAnswer(value) {
    if (!acceptingAnswers) return

    if (value === question.answer) {
      const nextRound = round + 1
      const alreadyMissed = roundMarks[round] === "incorrect"
      setSelected(value)
      if (!alreadyMissed) {
        setCorrect(count => count + 1)
        setRoundMarks(existing => {
          const nextMarks = [...existing]
          nextMarks[round] = "correct"
          return nextMarks
        })
      }
      setAcceptingAnswers(false)
      flashScreen("screen-flash-green")

      if (nextRound >= TOTAL_ROUNDS) {
        window.setTimeout(() => setShowWin(true), 650)
      } else {
        window.setTimeout(() => goToNextRound(nextRound), 650)
      }
      return
    }

    setIncorrect(count => count + 1)
    setRoundMarks(existing => {
      const nextMarks = [...existing]
      nextMarks[round] = "incorrect"
      return nextMarks
    })
    setWrongChoice(value)
    flashScreen("screen-flash-red")
    window.setTimeout(() => setWrongChoice(null), 350)
  }

  useEffect(() => {
    if (!flash) return undefined
    document.body.classList.add(flash)
    return () => document.body.classList.remove(flash)
  }, [flash])

  return (
    <GameShell title='Same or Different' subtitle='compare the two emojis'>
      <RoundTracker marks={roundMarks} total={TOTAL_ROUNDS} />

      <section className='panel same-different-panel'>
        <div className='same-different-prompt'>
          Are they the same or different?
        </div>
        <div className='emoji-compare-row' aria-live='polite' key={question.id}>
          <div className='emoji-compare-tile'>{question.first}</div>
          <div className='compare-symbol'>?</div>
          <div className='emoji-compare-tile'>{question.second}</div>
        </div>
      </section>

      <div className='same-different-options' aria-label='answer choices'>
        <button
          className={`same-different-button ${
            selected === "same" ? "correct" : ""
          } ${wrongChoice === "same" ? "wrong" : ""}`}
          onClick={() => chooseAnswer("same")}
          type='button'
        >
          <span className='same-different-button-emoji'>🟰</span>
          <span>same</span>
        </button>
        <button
          className={`same-different-button ${
            selected === "different" ? "correct" : ""
          } ${wrongChoice === "different" ? "wrong" : ""}`}
          onClick={() => chooseAnswer("different")}
          type='button'
        >
          <span className='same-different-button-emoji'>🚫</span>
          <span>different</span>
        </button>
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
