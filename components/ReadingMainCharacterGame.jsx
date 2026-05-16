"use client"

import { useEffect, useState } from "react"

import CongratsOverlay from "./CongratsOverlay"
import GameShell from "./GameShell"
import RoundTracker from "./RoundTracker"
import storiesData from "@/data/reading-main-character-stories.json"

const STORIES = storiesData.stories
const TOTAL_ROUNDS = 10

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5)
}

function makeRounds() {
  return shuffle(STORIES).slice(0, TOTAL_ROUNDS).map(story => {
    const distractors = shuffle(
      STORIES.filter(otherStory => otherStory.id !== story.id),
    ).slice(0, 2)

    return {
      ...story,
      options: shuffle([story, ...distractors]).map(option => ({
        id: option.id,
        emoji: option.main_character_emoji,
        name: option.main_character_name,
      })),
    }
  })
}

export default function ReadingMainCharacterGame() {
  const [rounds, setRounds] = useState(null)
  const [round, setRound] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [roundMarks, setRoundMarks] = useState([])
  const [removed, setRemoved] = useState([])
  const [correctOption, setCorrectOption] = useState(null)
  const [wrongOption, setWrongOption] = useState(null)
  const [acceptingAnswers, setAcceptingAnswers] = useState(true)
  const [flash, setFlash] = useState("")
  const [showWin, setShowWin] = useState(false)

  const story = rounds?.[round] ?? null

  function startGame() {
    setRounds(makeRounds())
    setRound(0)
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

  function goToNextRound(nextRound) {
    setRound(nextRound)
    setRemoved([])
    setCorrectOption(null)
    setWrongOption(null)
    setAcceptingAnswers(true)
  }

  function chooseAnswer(option) {
    if (!story || !acceptingAnswers || removed.includes(option.id)) return

    if (option.id === story.id) {
      const nextRound = round + 1
      const alreadyMissed = roundMarks[round] === "incorrect"
      setCorrectOption(option.id)
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
    setWrongOption(option.id)
    flashScreen("screen-flash-red")
    window.setTimeout(() => {
      setRemoved(existing => [...existing, option.id])
      setWrongOption(null)
    }, 300)
  }

  useEffect(() => {
    if (!flash) return undefined
    document.body.classList.add(flash)
    return () => document.body.classList.remove(flash)
  }, [flash])

  useEffect(() => {
    setRounds(makeRounds())
  }, [])

  if (!story) {
    return (
      <GameShell
        title="Reading Main Character"
        subtitle="read the story and pick who it is about"
      >
        <RoundTracker marks={roundMarks} total={TOTAL_ROUNDS} />
        <section className="panel reading-story-panel" aria-live="polite">
          <p className="reading-story-text">Loading story...</p>
        </section>
      </GameShell>
    )
  }

  return (
    <GameShell
      title="Reading Main Character"
      subtitle="read the story and pick who it is about"
    >
      <RoundTracker marks={roundMarks} total={TOTAL_ROUNDS} />

      <section className="panel reading-story-panel" aria-live="polite">
        <p className="reading-story-text">{story.story}</p>
      </section>

      <div className="reading-options" aria-label="main character choices">
        {story.options.map(option => (
          <button
            className={`reading-option ${
              removed.includes(option.id) ? "removed" : ""
            } ${correctOption === option.id ? "correct" : ""} ${
              wrongOption === option.id ? "wrong" : ""
            }`}
            disabled={!acceptingAnswers || removed.includes(option.id)}
            key={option.id}
            onClick={() => chooseAnswer(option)}
            type="button"
          >
            <span className="reading-option-emoji">{option.emoji}</span>
            <span className="reading-option-name">{option.name}</span>
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
