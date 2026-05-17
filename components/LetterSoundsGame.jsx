"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import CongratsOverlay from "./CongratsOverlay"
import GameShell from "./GameShell"
import RoundTracker from "./RoundTracker"

const VOWELS = [
  {
    letter: "A",
    shortSound: {
      sound: "/ă/",
      example: "apple",
      words: ["cat", "bat", "map", "hat", "jam", "bag", "ran", "sad", "fan", "cap"],
    },
    longSound: {
      sound: "/ā/",
      example: "cake",
      words: [
        "cake",
        "lake",
        "make",
        "game",
        "name",
        "tape",
        "rain",
        "play",
        "day",
        "stay",
      ],
    },
  },
  {
    letter: "E",
    shortSound: {
      sound: "/ĕ/",
      example: "egg",
      words: ["bed", "red", "pen", "hen", "net", "ten", "leg", "web", "pet", "men"],
    },
    longSound: {
      sound: "/ē/",
      example: "me",
      words: ["me", "we", "he", "she", "tree", "bee", "see", "feet", "keep", "leaf"],
    },
  },
  {
    letter: "I",
    shortSound: {
      sound: "/ĭ/",
      example: "igloo",
      words: ["sit", "hit", "pig", "dig", "lip", "pin", "win", "fish", "hill", "milk"],
    },
    longSound: {
      sound: "/ī/",
      example: "ice",
      words: ["ice", "bike", "kite", "like", "time", "five", "line", "pine", "ride", "fly"],
    },
  },
  {
    letter: "O",
    shortSound: {
      sound: "/ŏ/",
      example: "octopus",
      words: ["hot", "pot", "log", "mop", "box", "fox", "top", "hop", "sock", "rock"],
    },
    longSound: {
      sound: "/ō/",
      example: "go",
      words: ["go", "no", "so", "home", "bone", "rope", "hope", "cone", "boat", "snow"],
    },
  },
  {
    letter: "U",
    shortSound: {
      sound: "/ŭ/",
      example: "up",
      words: ["sun", "cup", "bug", "rug", "mud", "bus", "run", "fun", "nut", "gum"],
    },
    longSound: {
      sound: "/ū/",
      example: "cube",
      words: ["cube", "tube", "cute", "mule", "use", "huge", "fume", "muse", "fuse", "mute"],
    },
  },
]

const TOTAL_ROUNDS = 10

function shuffle(items) {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function findVowel(letter) {
  return VOWELS.find(vowel => vowel.letter === letter) ?? VOWELS[0]
}

function makeQuestions(vowel) {
  const shortWords = shuffle(vowel.shortSound.words).slice(0, TOTAL_ROUNDS / 2)
  const longWords = shuffle(vowel.longSound.words).slice(0, TOTAL_ROUNDS / 2)
  const questions = [
    ...shortWords.map((word, index) => ({
      id: `${vowel.letter}-short-${word}-${index}`,
      type: "short",
      word,
    })),
    ...longWords.map((word, index) => ({
      id: `${vowel.letter}-long-${word}-${index}`,
      type: "long",
      word,
    })),
  ]

  return shuffle(questions)
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

export default function LetterSoundsGame() {
  const [currentLetter, setCurrentLetter] = useState("A")
  const [questions, setQuestions] = useState([])
  const [round, setRound] = useState(0)
  const [placed, setPlaced] = useState({ short: null, long: null })
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [roundMarks, setRoundMarks] = useState([])
  const [flash, setFlash] = useState({ short: "", long: "" })
  const [screenFlash, setScreenFlash] = useState("")
  const [drag, setDrag] = useState(null)
  const [acceptingAnswers, setAcceptingAnswers] = useState(true)
  const [showWin, setShowWin] = useState(false)

  const shortRef = useRef(null)
  const longRef = useRef(null)
  const dragRef = useRef(null)

  const currentVowel = useMemo(() => findVowel(currentLetter), [currentLetter])
  const currentQuestion = questions[round] ?? null
  const vowelOptions = useMemo(() => VOWELS.map(vowel => vowel.letter), [])
  const displayLetter = `${currentLetter}${currentLetter.toLowerCase()}`

  function startGame(letter = currentLetter) {
    const vowel = findVowel(letter)
    setCurrentLetter(vowel.letter)
    setQuestions(makeQuestions(vowel))
    setRound(0)
    setPlaced({ short: null, long: null })
    setCorrect(0)
    setIncorrect(0)
    setRoundMarks([])
    setFlash({ short: "", long: "" })
    setScreenFlash("")
    setDrag(null)
    dragRef.current = null
    setAcceptingAnswers(true)
    setShowWin(false)
  }

  useEffect(() => {
    startGame("A")
  }, [])

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

  function flashScreen(className) {
    setScreenFlash("")
    window.requestAnimationFrame(() => {
      setScreenFlash(className)
      window.setTimeout(() => setScreenFlash(""), 500)
    })
  }

  function goToNextRound(nextRound) {
    setPlaced({ short: null, long: null })
    setDrag(null)
    dragRef.current = null
    setAcceptingAnswers(true)
    setRound(nextRound)
  }

  function startDrag(event) {
    if (!currentQuestion || !acceptingAnswers) return
    event.preventDefault()
    const point = { x: event.clientX, y: event.clientY }
    setDrag({ ...currentQuestion, point })
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
      if (!current || !acceptingAnswers) return

      const point = { x: event.clientX, y: event.clientY }
      dragRef.current = null
      setDrag(null)

      const overShort = isOver(point, shortRef.current)
      const overLong = isOver(point, longRef.current)

      if (overShort || overLong) {
        const target = overShort ? "short" : "long"
        const isCorrect = current.type === target

        if (isCorrect) {
          const nextRound = round + 1
          const alreadyMissed = roundMarks[round] === "incorrect"

          setPlaced(existing => ({
            ...existing,
            [target]: current,
          }))
          setAcceptingAnswers(false)
          if (!alreadyMissed) {
            setCorrect(count => count + 1)
            setRoundMarks(existing => {
              const nextMarks = [...existing]
              nextMarks[round] = "correct"
              return nextMarks
            })
          }
          flashBox(target, "flash-green")
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
        flashBox(target, "shake")
        flashScreen("screen-flash-red")
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
  }, [acceptingAnswers, round, roundMarks])

  return (
    <GameShell title="Letter Sounds" subtitle="sort each word by its vowel sound">
      <div className={`letter-sounds-flash-layer ${screenFlash}`} />

      <div className="control-bar letter-sounds-controls">
        <div className="letter-focus" aria-label={`current letter ${displayLetter}`}>
          {displayLetter}
        </div>

        <label htmlFor="vowel-select">Vowel:</label>
        <select
          className="select-input"
          id="vowel-select"
          onChange={event => startGame(event.target.value)}
          value={currentLetter}
        >
          {vowelOptions.map(letter => (
            <option key={letter} value={letter}>
              {letter}
            </option>
          ))}
        </select>
      </div>

      <RoundTracker marks={roundMarks} total={TOTAL_ROUNDS} />

      <div className="target-grid letter-sounds-grid">
        <div className={`target-box short-sound ${flash.short}`} ref={shortRef}>
          <div className="target-label">Short Sound</div>
          <div className="sound-mark">{currentVowel.shortSound.sound}</div>
          <div className="sound-example">as in {currentVowel.shortSound.example}</div>
          <div className="placed-area word-placed-area">
            {placed.short ? (
              <div className="placed-word-token short-word-token">
                {placed.short.word}
              </div>
            ) : null}
          </div>
        </div>

        <div className={`target-box long-sound ${flash.long}`} ref={longRef}>
          <div className="target-label">Long Sound</div>
          <div className="sound-mark">{currentVowel.longSound.sound}</div>
          <div className="sound-example">as in {currentVowel.longSound.example}</div>
          <div className="placed-area word-placed-area">
            {placed.long ? (
              <div className="placed-word-token long-word-token">
                {placed.long.word}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <section className="panel letter-sound-word-panel" aria-live="polite">
        {currentQuestion && acceptingAnswers ? (
          <div className="tray word-tray single-word-tray">
            <button
              className="word-token letter-sound-prompt-token"
              onPointerDown={startDrag}
              type="button"
            >
              {currentQuestion.word}
            </button>
          </div>
        ) : (
          <div className="letter-sound-next-word">
            {showWin ? "Great work!" : "Loading word..."}
          </div>
        )}
      </section>

      {drag ? (
        <div
          className="drag-clone word-drag-clone"
          style={{ left: drag.point.x, top: drag.point.y }}
        >
          {drag.word}
        </div>
      ) : null}

      <CongratsOverlay
        correct={correct}
        incorrect={incorrect}
        onPlayAgain={() => startGame(currentLetter)}
        show={showWin}
      />
    </GameShell>
  )
}
