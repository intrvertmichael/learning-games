import Link from "next/link"

import { games } from "@/lib/games"

export default function HomePage() {
  return (
    <main className="home-shell">
      <div className="home-heading">
        <h1>Learning Games</h1>
        <p>pick a game and start learning</p>
      </div>

      <section className="game-card-list" aria-label="games">
        {games.map(game => (
          <Link
            className="game-card"
            data-accent={game.accent}
            href={game.href}
            key={game.href}
          >
            <h2>{game.title}</h2>
            <p>{game.description}</p>
          </Link>
        ))}
      </section>
    </main>
  )
}
