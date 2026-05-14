"use client"

import { useEffect, useState } from "react"

import CongratsOverlay from "./CongratsOverlay"
import GameShell from "./GameShell"
import RoundTracker from "./RoundTracker"
import ScoreBar from "./ScoreBar"

const TOTAL_ROUNDS = 10
const MIN_NUMBER = 1
const MAX_NUMBER = 10
const MIN_DIFFERENCE = 3

function makeNumberPairs(previousQuestion = null) {
  const choices = []
  for (let left = MIN_NUMBER; left <= MAX_NUMBER; left++) {
    for (let right = MIN_NUMBER; right <= MAX_NUMBER; right++) {
      const matchesPrevious =
        previousQuestion?.left === left && previousQuestion?.right === right

      if (Math.abs(left - right) >= MIN_DIFFERENCE && !matchesPrevious) {
        choices.push({ left, right })
      }
    }
  }

  return choices
}

function makeQuestion(previousQuestion = null) {
  const choices = makeNumberPairs(previousQuestion)
  const { left, right } = choices[Math.floor(Math.random() * choices.length)]

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
  const [roundMarks, setRoundMarks] = useState([])
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
      const alreadyMissed = roundMarks[roundsComplete] === "incorrect"
      setSelected(value)
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
    <GameShell title='Math Bigger' subtitle='pick the bigger set'>
      <ScoreBar
        items={[
          { label: "Checks", value: correct, total: TOTAL_ROUNDS },
          { label: "Incorrect", value: incorrect },
        ]}
      />

      <RoundTracker marks={roundMarks} total={TOTAL_ROUNDS} />

      <section className='panel math-bigger-panel'>
        <div className='math-bigger-prompt'>Which set is bigger?</div>
        <div
          className='math-bigger-choices'
          aria-live='polite'
          key={question.id}
        >
          <NumberChoice
            choice='left'
            isCorrect={selected === "left"}
            isWrong={wrongChoice === "left"}
            number={question.left}
            onChoose={chooseAnswer}
          />
          <div className='math-bigger-symbol'>?</div>
          <NumberChoice
            choice='right'
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
      type='button'
    >
      <span className='math-bigger-number'>{number}</span>
      <span className='math-bigger-pencils' aria-label={`${number} pencils`}>
        {Array.from({ length: number }, (_, index) => (
          <span
            className='math-bigger-pencil'
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
