"use client"

import HomeButton from "./HomeButton"

export default function GameShell({ title, subtitle, children }) {
  return (
    <main className="game-shell">
      <div className="game-heading">
        <HomeButton />
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {children}
    </main>
  )
}
