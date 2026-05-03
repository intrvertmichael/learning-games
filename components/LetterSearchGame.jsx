"use client"

import { useEffect, useMemo, useState } from "react"

import CongratsOverlay from "./CongratsOverlay"
import GameShell from "./GameShell"
import PillButton from "./PillButton"
import ScoreBar from "./ScoreBar"

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const TARGET_TOTAL = 10
const GRID_TOTAL = 24

function shuffle(items) {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function makeGrid(letter, letterCase, shouldShuffle = true) {
  const upper = letter.toUpperCase()
  const lower = letter.toLowerCase()
  const targetChar = letterCase === "upper" ? upper : lower
  const distractorChar = letterCase === "upper" ? lower : upper

  const items = [
    ...Array.from({ length: TARGET_TOTAL }, (_, index) => ({
      id: `target-${index}`,
      char: targetChar,
      isTarget: true,
      status: "ready",
    })),
    ...Array.from({ length: GRID_TOTAL - TARGET_TOTAL }, (_, index) => ({
      id: `distractor-${index}`,
      char: distractorChar,
      isTarget: false,
      status: "ready",
    })),
  ]

  return shouldShuffle ? shuffle(items) : items
}

export default function LetterSearchGame() {
  const [currentLetter, setCurrentLetter] = useState("A")
  const [currentCase, setCurrentCase] = useState("upper")
  const [letterSelect, setLetterSelect] = useState("A")
  const [caseSelect, setCaseSelect] = useState("upper")
  const [items, setItems] = useState(() => makeGrid("A", "upper", false))
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [showWin, setShowWin] = useState(false)

  function buildGrid(letter = currentLetter, letterCase = currentCase) {
    setCurrentLetter(letter)
    setCurrentCase(letterCase)
    setLetterSelect(letter)
    setCaseSelect(letterCase)
    setItems(makeGrid(letter, letterCase))
    setCorrect(0)
    setIncorrect(0)
    setShowWin(false)
  }

  useEffect(() => {
    setItems(makeGrid("A", "upper"))
  }, [])

  function chooseCircle(item) {
    if (item.status !== "ready") return

    if (item.isTarget) {
      const nextCorrect = correct + 1
      setCorrect(nextCorrect)
      setItems(existing =>
        existing.map(existingItem =>
          existingItem.id === item.id
            ? { ...existingItem, status: "correct" }
            : existingItem,
        ),
      )
      window.setTimeout(() => {
        setItems(existing =>
          existing.map(existingItem =>
            existingItem.id === item.id
              ? { ...existingItem, status: "found" }
              : existingItem,
          ),
        )
      }, 500)
      if (nextCorrect >= TARGET_TOTAL) {
        window.setTimeout(() => setShowWin(true), 500)
      }
      return
    }

    setIncorrect(count => count + 1)
    setItems(existing =>
      existing.map(existingItem =>
        existingItem.id === item.id
          ? { ...existingItem, status: "wrong" }
          : existingItem,
      ),
    )
  }

  const letters = useMemo(() => ALPHABET.split(""), [])

  return (
    <GameShell title="Letter Search" subtitle="tap all matching letter circles">
      <div className="control-bar">
        <label htmlFor="case-select">Find:</label>
        <select
          className="select-input"
          id="case-select"
          onChange={event => setCaseSelect(event.target.value)}
          value={caseSelect}
        >
          <option value="upper">Uppercase</option>
          <option value="lower">Lowercase</option>
        </select>

        <select
          className="select-input"
          aria-label="letter"
          onChange={event => setLetterSelect(event.target.value)}
          value={letterSelect}
        >
          {letters.map(letter => (
            <option key={letter} value={letter}>
              {letter}
            </option>
          ))}
        </select>

        <PillButton onClick={() => buildGrid(letterSelect, caseSelect)}>
          Apply
        </PillButton>
      </div>

      <ScoreBar
        items={[
          { label: "Correct", value: correct, total: TARGET_TOTAL },
          { label: "Incorrect", value: incorrect },
        ]}
      />

      <div className="circle-grid">
        {items.map(item =>
          item.status === "found" ? (
            <div className="circle-placeholder" key={item.id} />
          ) : (
            <button
              className={`circle-button ${
                item.status === "wrong" ? "wrong" : ""
              } ${item.status === "correct" ? "correct-flash" : ""}`}
              key={item.id}
              onClick={() => chooseCircle(item)}
              type="button"
            >
              {item.char}
            </button>
          ),
        )}
      </div>

      <CongratsOverlay
        correct={correct}
        incorrect={incorrect}
        onPlayAgain={() => buildGrid(currentLetter, currentCase)}
        show={showWin}
      />
    </GameShell>
  )
}
