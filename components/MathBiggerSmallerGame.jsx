"use client"

import { useEffect, useState } from "react"

import CongratsOverlay from "./CongratsOverlay"
import GameShell from "./GameShell"
import RoundTracker from "./RoundTracker"

const TOTAL_ROUNDS = 10
const MIN_NUMBER = 1
const MAX_NUMBER = 10
const MIN_DIFFERENCE = 3
const FOCUS_MODES = {
  bigger: {
    label: "Bigger",
    prompt: "Bigger",
    subtitle: "pick the bigger or smaller set",
  },
  smaller: {
    label: "Smaller",
    prompt: "Smaller",
    subtitle: "pick the bigger or smaller set",
  },
}

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
  }
}

function getAnswer(question, focusMode) {
  if (focusMode === "smaller") {
    return question.left < question.right ? "left" : "right"
  }

  return question.left > question.right ? "left" : "right"
}

export default function MathBiggerSmallerGame() {
  const [focusMode, setFocusMode] = useState("bigger")
  const [question, setQuestion] = useState(null)
  const [roundsComplete, setRoundsComplete] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [roundMarks, setRoundMarks] = useState([])
  const [selected, setSelected] = useState(null)
  const [wrongChoice, setWrongChoice] = useState(null)
  const [acceptingAnswers, setAcceptingAnswers] = useState(true)
  const [flash, setFlash] = useState("")
  const [showWin, setShowWin] = useState(false)
  const modeContent = FOCUS_MODES[focusMode]

  function startGame(nextFocusMode = focusMode) {
    const resolvedFocusMode =
      typeof nextFocusMode === "string" ? nextFocusMode : focusMode

    setQuestion(makeQuestion())
    setFocusMode(resolvedFocusMode)
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
    if (!question || !acceptingAnswers) return

    if (value === getAnswer(question, focusMode)) {
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

  function changeFocusMode(event) {
    startGame(event.target.value)
  }

  useEffect(() => {
    if (!flash) return undefined
    document.body.classList.add(flash)
    return () => document.body.classList.remove(flash)
  }, [flash])

  useEffect(() => {
    setQuestion(makeQuestion())
  }, [])

  if (!question) {
    return (
      <GameShell title='Math Bigger Smaller' subtitle={modeContent.subtitle}>
        <RoundTracker marks={roundMarks} total={TOTAL_ROUNDS} />
        <section className='panel math-bigger-smaller-panel' aria-live='polite'>
          <div className='math-bigger-smaller-prompt'>Loading sets...</div>
        </section>
      </GameShell>
    )
  }

  return (
    <GameShell title='Math Bigger Smaller' subtitle={modeContent.subtitle}>
      <RoundTracker marks={roundMarks} total={TOTAL_ROUNDS} />

      <section className='panel math-bigger-smaller-panel'>
        <div className='math-bigger-smaller-prompt'>
          Which set is{" "}
          <select
            aria-label='choose bigger or smaller'
            className='select-input math-bigger-smaller-focus-select'
            id='math-bigger-smaller-focus'
            onChange={changeFocusMode}
            value={focusMode}
          >
            {Object.entries(FOCUS_MODES).map(([value, mode]) => (
              <option key={value} value={value}>
                {mode.prompt}
              </option>
            ))}
          </select>{" "}
          ?
        </div>
        <div
          className='math-bigger-smaller-choices'
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
          <div className='math-bigger-smaller-symbol'>?</div>
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
        onPlayAgain={() => startGame()}
        show={showWin}
      />
    </GameShell>
  )
}

function NumberChoice({ choice, isCorrect, isWrong, number, onChoose }) {
  return (
    <button
      className={`math-bigger-smaller-choice ${isCorrect ? "correct" : ""} ${
        isWrong ? "wrong" : ""
      }`}
      onClick={() => onChoose(choice)}
      type='button'
    >
      <span className='math-bigger-smaller-number'>{number}</span>
      <span
        className='math-bigger-smaller-pencils'
        aria-label={`${number} pencils`}
      >
        {Array.from({ length: number }, (_, index) => (
          <span
            className='math-bigger-smaller-pencil'
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
