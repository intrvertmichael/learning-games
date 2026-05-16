"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { games } from "@/lib/games"

const gameTabs = [
  { id: "ela", label: "ELA Games" },
  { id: "math", label: "Math Games" },
]
const HOME_TAB_KEY = "learning-games-home-tab"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("ela")
  const visibleGames = games.filter(game => game.category === activeTab)

  useEffect(() => {
    const savedTab = window.localStorage.getItem(HOME_TAB_KEY)
    if (gameTabs.some(tab => tab.id === savedTab)) {
      setActiveTab(savedTab)
    }
  }, [])

  function chooseTab(tabId) {
    setActiveTab(tabId)
    window.localStorage.setItem(HOME_TAB_KEY, tabId)
  }

  return (
    <main className="home-shell">
      <div className="home-heading">
        <h1>Learning Games</h1>
        <p>pick a game and start learning</p>
      </div>

      <div className="home-tabs" role="tablist" aria-label="game subjects">
        {gameTabs.map(tab => (
          <button
            aria-controls={`${tab.id}-games`}
            aria-selected={activeTab === tab.id}
            className="home-tab"
            id={`${tab.id}-tab`}
            key={tab.id}
            onClick={() => chooseTab(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section
        aria-labelledby={`${activeTab}-tab`}
        className="game-card-list"
        id={`${activeTab}-games`}
        role="tabpanel"
      >
        {visibleGames.map(game => (
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
