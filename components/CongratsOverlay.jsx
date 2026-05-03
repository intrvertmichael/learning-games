"use client"

import { useEffect, useMemo, useState } from "react"

import PillButton from "./PillButton"

const CONFETTI_COLORS = [
  "#ff6b35",
  "#ffce00",
  "#36c46a",
  "#4a90d9",
  "#d44a8a",
  "#a259ff",
  "#ff9a5c",
]

export default function CongratsOverlay({
  show,
  correct,
  incorrect,
  onPlayAgain,
}) {
  const [burst, setBurst] = useState(0)

  useEffect(() => {
    if (show) setBurst(count => count + 1)
  }, [show])

  const pieces = useMemo(() => {
    if (!show) return []
    return Array.from({ length: 90 }, (_, index) => ({
      id: `${burst}-${index}`,
      left: `${Math.random() * 100}vw`,
      size: `${7 + Math.random() * 9}px`,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: `${index * 20}ms`,
      duration: `${1.4 + Math.random() * 1.8}s`,
    }))
  }, [burst, show])

  if (!show) return null

  return (
    <div className="congrats-overlay">
      <div className="big-emoji">🎉</div>
      <h2>Amazing job!</h2>
      <div className="stats-card">
        <div className="stat-row correct">
          ✅ <span>{correct}</span> correct
        </div>
        <div className="stat-row incorrect">
          ❌ <span>{incorrect}</span> incorrect
        </div>
      </div>
      <PillButton className="play-again-button" onClick={onPlayAgain}>
        Play Again 🔄
      </PillButton>
      {pieces.map(piece => (
        <span
          className="confetti-piece"
          key={piece.id}
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.size,
            background: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
          }}
        />
      ))}
    </div>
  )
}
