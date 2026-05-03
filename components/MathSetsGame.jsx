"use client"

import { useEffect, useState } from "react"

import CongratsOverlay from "./CongratsOverlay"
import GameShell from "./GameShell"
import ScoreBar from "./ScoreBar"

const GOAL = 10
const MIN_SET = 1
const MAX_SET = 9
const OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1)

function randomSetCount(previousAnswer = null) {
  const choices = []
  for (let value = MIN_SET; value <= MAX_SET; value++) {
    if (value !== previousAnswer) choices.push(value)
  }
  return choices[Math.floor(Math.random() * choices.length)]
}

export default function MathSetsGame() {
  const [answer, setAnswer] = useState(3)
  const [checks, setChecks] = useState(0)
  const [correctTries, setCorrectTries] = useState(0)
  const [incorrectTries, setIncorrectTries] = useState(0)
  const [removed, setRemoved] = useState([])
  const [correctOption, setCorrectOption] = useState(null)
  const [wrongOption, setWrongOption] = useState(null)
  const [acceptingAnswers, setAcceptingAnswers] = useState(true)
  const [flash, setFlash] = useState("")
  const [showWin, setShowWin] = useState(false)

  useEffect(() => {
    setAnswer(randomSetCount())
  }, [])

  function startGame() {
    setAnswer(randomSetCount())
    setChecks(0)
    setCorrectTries(0)
    setIncorrectTries(0)
    setRemoved([])
    setCorrectOption(null)
    setWrongOption(null)
    setAcceptingAnswers(true)
    setFlash("")
    setShowWin(false)
  }

  function nextPrompt() {
    setAnswer(currentAnswer => randomSetCount(currentAnswer))
    setRemoved([])
    setCorrectOption(null)
    setWrongOption(null)
    setAcceptingAnswers(true)
  }

  function flashScreen(className) {
    setFlash("")
    window.requestAnimationFrame(() => {
      setFlash(className)
      window.setTimeout(() => setFlash(""), 500)
    })
  }

  function chooseAnswer(value) {
    if (!acceptingAnswers || removed.includes(value)) return

    if (value === answer) {
      const nextChecks = checks + 1
      setAcceptingAnswers(false)
      setCorrectTries(count => count + 1)
      setChecks(nextChecks)
      setCorrectOption(value)
      flashScreen("screen-flash-green")

      if (nextChecks >= GOAL) {
        window.setTimeout(() => setShowWin(true), 650)
      } else {
        window.setTimeout(nextPrompt, 650)
      }
      return
    }

    setIncorrectTries(count => count + 1)
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

  return (
    <GameShell title="MathSets" subtitle="count the pencils in each set">
      <ScoreBar
        items={[
          { label: "Checks", value: checks, total: GOAL },
          { label: "Incorrect", value: incorrectTries },
        ]}
      />

      <div className="checks-row" aria-label="checks earned">
        {Array.from({ length: GOAL }, (_, index) => (
          <div
            className={`check-slot ${index < checks ? "earned" : ""}`}
            key={index}
          >
            {index < checks ? "✅" : "✓"}
          </div>
        ))}
      </div>

      <section className="panel math-panel">
        <div className="math-prompt-label">How many pencils?</div>
        <div className="pencil-set" aria-live="polite">
          {Array.from({ length: answer }, (_, index) => (
            <span
              className="pencil"
              key={index}
              style={{ animationDelay: `${index * 0.025}s` }}
            >
              ✏️
            </span>
          ))}
        </div>
      </section>

      <div className="option-grid" aria-label="number choices">
        {OPTIONS.map(option => (
          <button
            className={`option-button ${
              removed.includes(option) ? "removed" : ""
            } ${correctOption === option ? "correct" : ""} ${
              wrongOption === option ? "wrong" : ""
            }`}
            key={option}
            onClick={() => chooseAnswer(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>

      <CongratsOverlay
        correct={correctTries}
        incorrect={incorrectTries}
        onPlayAgain={startGame}
        show={showWin}
      />
    </GameShell>
  )
}
