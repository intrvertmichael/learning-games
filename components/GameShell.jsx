"use client"

import Link from "next/link"

export default function GameShell({ title, subtitle, children }) {
  return (
    <main className="game-shell">
      <div className="game-heading">
        <Link className="back-link" href="/">
          Back Home
        </Link>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {children}
    </main>
  )
}
