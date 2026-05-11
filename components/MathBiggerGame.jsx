"use client"

import { useEffect, useState } from "react"

import CongratsOverlay from "./CongratsOverlay"
import GameShell from "./GameShell"
import ScoreBar from "./ScoreBar"

const TOTAL_ROUNDS = 10
const MIN_NUMBER = 1
const MAX_NUMBER = 10

function randomNumber(excludedValue = null) {
  const choices = []
  for (let value = MIN_NUMBER; value <= MAX_NUMBER; value++) {
    if (value !== excludedValue) choices.push(value)
  }
  return choices[Math.floor(Math.random() * choices.length)]
}

function makeQuestion(previousQuestion = null) {
  let left = randomNumber()
  let right = randomNumber(left)

  if (previousQuestion) {
    let guard = 0
    while (
      left === previousQuestion.left &&
      right === previousQuestion.right &&
      guard < 20
    ) {
      left = randomNumber()
      right = randomNumber(left)
      guard += 1
    }
  }

  return {
    id: `${left}-${right}-${Date.now()}-${Math.random()}`,
    left,
    right,
    answer: left > right ? "left" : "right",
  }
}

export default function MathBiggerGame() {
  const [question, setQuestion] = useState(() => makeQuestion())
  const [roundsComplete, setRoundsComplete] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [selected, setSelected] = useState(null)
  const [wrongChoice, setWrongChoice] = useState(null)
  const [acceptingAnswers, setAcceptingAnswers] = useState(true)
  const [flash, setFlash] = useState("")
  const [showWin, setShowWin] = useState(false)

  function startGame() {
    setQuestion(makeQuestion())
    setRoundsComplete(0)
    setCorrect(0)
    setIncorrect(0)
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

  function goToNextRound() {
    setQuestion(currentQuestion => makeQuestion(currentQuestion))
    setSelected(null)
    setWrongChoice(null)
    setAcceptingAnswers(true)
  }

  function chooseAnswer(value) {
    if (!acceptingAnswers) return

    if (value === question.answer) {
      const nextRound = roundsComplete + 1
      setSelected(value)
      setCorrect(count => count + 1)
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
    <GameShell title="Math Bigger" subtitle="pick the bigger number">
      <ScoreBar
        items={[
          { label: "Checks", value: roundsComplete, total: TOTAL_ROUNDS },
          { label: "Incorrect", value: incorrect },
        ]}
      />

      <div className="checks-row" aria-label="rounds complete">
        {Array.from({ length: TOTAL_ROUNDS }, (_, index) => (
          <div
            className={`check-slot ${
              index < roundsComplete ? "earned" : ""
            }`}
            key={index}
          >
            {index < roundsComplete ? "✅" : "✓"}
          </div>
        ))}
      </div>

      <section className="panel math-bigger-panel">
        <div className="math-bigger-prompt">Which number is bigger?</div>
        <div
          className="math-bigger-choices"
          aria-live="polite"
          key={question.id}
        >
          <NumberChoice
            choice="left"
            isCorrect={selected === "left"}
            isWrong={wrongChoice === "left"}
            number={question.left}
            onChoose={chooseAnswer}
          />
          <div className="math-bigger-symbol">?</div>
          <NumberChoice
            choice="right"
            isCorrect={selected === "right"}
            isWrong={wrongChoice === "right"}
            number={question.right}
            onChoose={chooseAnswer}
          />
        </div>
      </section>

      <CongratsOverlay
        correct={correct}
        incorrect={incorrect}
        onPlayAgain={startGame}
        show={showWin}
      />
    </GameShell>
  )
}

function NumberChoice({ choice, isCorrect, isWrong, number, onChoose }) {
  return (
    <button
      className={`math-bigger-choice ${isCorrect ? "correct" : ""} ${
        isWrong ? "wrong" : ""
      }`}
      onClick={() => onChoose(choice)}
      type="button"
    >
      <span className="math-bigger-number">{number}</span>
      <span className="math-bigger-pencils" aria-label={`${number} pencils`}>
        {Array.from({ length: number }, (_, index) => (
          <span
            className="math-bigger-pencil"
            key={index}
            style={{ animationDelay: `${index * 0.02}s` }}
          >
            ✏️
          </span>
        ))}
      </span>
    </button>
  )
}
