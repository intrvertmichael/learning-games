"use client"

import { useEffect, useState } from "react"

import CongratsOverlay from "./CongratsOverlay"
import GameShell from "./GameShell"
import ScoreBar from "./ScoreBar"

const TOTAL_ROUNDS = 10
const MAX_SIZE = 10
const CHOICES = Array.from({ length: MAX_SIZE }, (_, index) => index + 1)

function randomSize(previousSize = null) {
  const choices = CHOICES.filter(choice => choice !== previousSize)
  return choices[Math.floor(Math.random() * choices.length)]
}

function makeQuestions() {
  const questions = []

  for (let index = 0; index < TOTAL_ROUNDS; index++) {
    questions.push(randomSize(questions[index - 1]))
  }

  return questions
}

export default function MathMeasureGame() {
  const [questions, setQuestions] = useState(() => makeQuestions())
  const [round, setRound] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [selected, setSelected] = useState(null)
  const [wrongChoice, setWrongChoice] = useState(null)
  const [acceptingAnswers, setAcceptingAnswers] = useState(true)
  const [flash, setFlash] = useState("")
  const [showWin, setShowWin] = useState(false)

  const answer = questions[round] ?? questions[questions.length - 1]
  const completedRounds = correct

  function startGame() {
    setQuestions(makeQuestions())
    setRound(0)
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

  function goToNextRound(nextRound) {
    setSelected(null)
    setWrongChoice(null)
    setAcceptingAnswers(true)
    setRound(nextRound)
  }

  function chooseMeasure(value) {
    if (!acceptingAnswers) return

    if (value === answer) {
      const nextRound = round + 1
      setSelected(value)
      setCorrect(count => count + 1)
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
    <GameShell
      title='Math Measure'
      subtitle='measure the pencil with ten squares'
    >
      <ScoreBar
        items={[
          { label: "Checks", value: correct, total: TOTAL_ROUNDS },
          { label: "Incorrect", value: incorrect },
        ]}
      />

      <div className='checks-row' aria-label='rounds complete'>
        {Array.from({ length: TOTAL_ROUNDS }, (_, index) => (
          <div
            className={`check-slot ${index < completedRounds ? "earned" : ""}`}
            key={index}
          >
            {index < completedRounds ? "✅" : "✓"}
          </div>
        ))}
      </div>

      <section className='panel measure-panel'>
        <div className='measure-prompt-label'>How big is the pencil?</div>

        <div className='math-measure-stage' aria-live='polite'>
          <div className='measured-object-track' aria-hidden='true'>
            <div
              className='measured-pencil'
              key={`${round}-${answer}`}
              style={{ gridColumn: `1 / span ${answer}` }}
            >
              <span className='pencil-eraser' />
              <span className='pencil-body' />
              <span className='pencil-tip' />
            </div>
          </div>

          <div className='measure-ruler' aria-label='click a measurement'>
            {CHOICES.map(choice => (
              <button
                className={`measure-square ${
                  selected === choice ? "correct" : ""
                } ${wrongChoice === choice ? "wrong" : ""}`}
                key={choice}
                onClick={() => chooseMeasure(choice)}
                type='button'
              >
                {choice}
              </button>
            ))}
          </div>
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
