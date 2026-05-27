"use client"

import Link from "next/link"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { games } from "@/lib/games"

const gameTabs = [
  { id: "ela", label: "ELA Games" },
  { id: "math", label: "Math Games" },
]
const HOME_TAB_KEY = "learning-games-home-tab"
const isGameTab = tabId => gameTabs.some(tab => tab.id === tabId)

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("ela")
  const [displayedTab, setDisplayedTab] = useState("ela")
  const [isListVisible, setIsListVisible] = useState(true)
  const switchTimeoutRef = useRef(null)
  const switchFrameRef = useRef(null)
  const visibleGames = games.filter(game => game.category === displayedTab)

  useLayoutEffect(() => {
    const savedTab = window.localStorage.getItem(HOME_TAB_KEY)
    if (isGameTab(savedTab)) {
      setActiveTab(savedTab)
      setDisplayedTab(savedTab)
    }
  }, [])

  useEffect(() => {
    return () => {
      clearTimeout(switchTimeoutRef.current)
      cancelAnimationFrame(switchFrameRef.current)
    }
  }, [])

  function chooseTab(tabId) {
    if (tabId === activeTab) {
      return
    }

    clearTimeout(switchTimeoutRef.current)
    cancelAnimationFrame(switchFrameRef.current)
    setActiveTab(tabId)
    window.localStorage.setItem(HOME_TAB_KEY, tabId)
    setIsListVisible(false)

    switchTimeoutRef.current = setTimeout(() => {
      setDisplayedTab(tabId)
      switchFrameRef.current = requestAnimationFrame(() => {
        setIsListVisible(true)
      })
    }, 180)
  }

  return (
    <main className="home-shell">
      <div className="home-heading">
        <h1>Learning Games</h1>
        <p>pick a game and start learning</p>
      </div>

      <div
        className="home-tabs"
        data-active-tab={activeTab}
        role="tablist"
        aria-label="game subjects"
      >
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
        aria-labelledby={`${displayedTab}-tab`}
        className={`game-card-list ${isListVisible ? "is-visible" : "is-hidden"}`}
        id={`${displayedTab}-games`}
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
