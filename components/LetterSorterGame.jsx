"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import CongratsOverlay from "./CongratsOverlay"
import GameShell from "./GameShell"
import PillButton from "./PillButton"
import ScoreBar from "./ScoreBar"

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const TOTAL = 10

function shuffle(items) {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function makeTokens(letter, shouldShuffle = true) {
  const types = [...Array(5).fill("upper"), ...Array(5).fill("lower")]
  const orderedTokens = types.map((type, index) => ({
    id: `${type}-${index}`,
    type,
    placed: false,
    char: type === "upper" ? letter : letter.toLowerCase(),
  }))

  return shouldShuffle ? shuffle(orderedTokens) : orderedTokens
}

function isOver(point, element) {
  if (!element) return false
  const rect = element.getBoundingClientRect()
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  )
}

export default function LetterSorterGame() {
  const [currentLetter, setCurrentLetter] = useState("A")
  const [inputValue, setInputValue] = useState("A")
  const [tokens, setTokens] = useState(() => makeTokens("A", false))
  const [placed, setPlaced] = useState({ upper: [], lower: [] })
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [flash, setFlash] = useState({ upper: "", lower: "" })
  const [drag, setDrag] = useState(null)
  const [showWin, setShowWin] = useState(false)

  const upperRef = useRef(null)
  const lowerRef = useRef(null)
  const dragRef = useRef(null)
  const placedIdsRef = useRef(new Set())

  const totalPlaced = placed.upper.length + placed.lower.length
  const letters = useMemo(() => LETTERS.split(""), [])

  useEffect(() => {
    setTokens(makeTokens("A"))
  }, [])

  function buildRound(letter) {
    setCurrentLetter(letter)
    setInputValue(letter)
    setTokens(makeTokens(letter))
    setPlaced({ upper: [], lower: [] })
    setCorrect(0)
    setIncorrect(0)
    setFlash({ upper: "", lower: "" })
    setDrag(null)
    setShowWin(false)
    placedIdsRef.current = new Set()
  }

  function flashBox(type, className) {
    setFlash(current => ({ ...current, [type]: "" }))
    window.requestAnimationFrame(() => {
      setFlash(current => ({ ...current, [type]: className }))
      window.setTimeout(
        () => setFlash(current => ({ ...current, [type]: "" })),
        600,
      )
    })
  }

  function handleGo() {
    buildRound(inputValue)
  }

  function startDrag(event, token) {
    if (token.placed) return
    event.preventDefault()
    const point = { x: event.clientX, y: event.clientY }
    setDrag({ id: token.id, type: token.type, char: token.char, point })
  }

  useEffect(() => {
    dragRef.current = drag
  }, [drag])

  useEffect(() => {
    function move(event) {
      if (!dragRef.current) return
      setDrag(current =>
        current
          ? { ...current, point: { x: event.clientX, y: event.clientY } }
          : current,
      )
    }

    function end(event) {
      const current = dragRef.current
      if (!current) return

      const point = { x: event.clientX, y: event.clientY }
      dragRef.current = null
      setDrag(null)

      const overUpper = isOver(point, upperRef.current)
      const overLower = isOver(point, lowerRef.current)

      if (overUpper || overLower) {
        const target = overUpper ? "upper" : "lower"
        const isCorrect = current.type === target

        if (isCorrect) {
          if (placedIdsRef.current.has(current.id)) return
          placedIdsRef.current.add(current.id)

          setPlaced(existing => ({
            ...existing,
            [target]: [...existing[target], current],
          }))
          setTokens(existing =>
            existing.map(token =>
              token.id === current.id ? { ...token, placed: true } : token,
            ),
          )
          setCorrect(count => count + 1)
          flashBox(target, "flash-green")
        } else {
          setIncorrect(count => count + 1)
          flashBox(target, "shake")
        }
      }
    }

    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", end)
    window.addEventListener("pointercancel", end)

    return () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", end)
      window.removeEventListener("pointercancel", end)
    }
  }, [])

  useEffect(() => {
    if (totalPlaced === TOTAL) {
      const timer = window.setTimeout(() => setShowWin(true), 500)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [totalPlaced])

  const hints = useMemo(
    () => ({
      upper: currentLetter,
      lower: currentLetter.toLowerCase(),
    }),
    [currentLetter],
  )

  return (
    <GameShell title="Letter Sorter">
      <div className="control-bar">
        <label htmlFor="letter-select">Letter:</label>
        <select
          className="select-input"
          id="letter-select"
          onChange={event => setInputValue(event.target.value)}
          value={inputValue}
        >
          {letters.map(letter => (
            <option key={letter} value={letter}>
              {letter}
            </option>
          ))}
        </select>
        <PillButton onClick={handleGo}>Go</PillButton>
      </div>

      <ScoreBar
        items={[
          { label: "Correct", value: correct, total: TOTAL },
          { label: "Incorrect", value: incorrect },
        ]}
      />

      <div className="target-grid">
        <div className={`target-box upper ${flash.upper}`} ref={upperRef}>
          <div className="target-label">Uppercase</div>
          <div className="hint-letter">{hints.upper}</div>
          <div className="placed-area">
            {placed.upper.map(token => (
              <div className="placed-token upper-token" key={token.id}>
                {token.char}
              </div>
            ))}
          </div>
        </div>

        <div className={`target-box lower ${flash.lower}`} ref={lowerRef}>
          <div className="target-label">Lowercase</div>
          <div className="hint-letter">{hints.lower}</div>
          <div className="placed-area">
            {placed.lower.map(token => (
              <div className="placed-token lower-token" key={token.id}>
                {token.char}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="panel">
        <div className="tray-label">Drag each letter to the right box!</div>
        <div className="tray">
          {tokens.map(token => (
            <button
              className={`token ${token.type}-token ${
                token.placed ? "placed" : ""
              }`}
              key={token.id}
              onPointerDown={event => startDrag(event, token)}
              type="button"
            >
              {token.char}
            </button>
          ))}
        </div>
      </section>

      {drag ? (
        <div
          className="drag-clone"
          style={{ left: drag.point.x, top: drag.point.y }}
        >
          {drag.char}
        </div>
      ) : null}

      <CongratsOverlay
        correct={correct}
        incorrect={incorrect}
        onPlayAgain={() => buildRound(currentLetter)}
        show={showWin}
      />
    </GameShell>
  )
}
