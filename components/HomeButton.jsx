"use client"

import Link from "next/link"

export default function HomeButton({ className = "" }) {
  return (
    <Link
      aria-label="Go back to the home page"
      className={`home-button ${className}`.trim()}
      href="/"
    >
      <svg
        aria-hidden="true"
        className="home-button-icon"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M3 11.2 12 4l9 7.2"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.4"
        />
        <path
          d="M5.5 10.4V20h4.7v-5.1h3.6V20h4.7v-9.6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.4"
        />
      </svg>
      <span>Home</span>
    </Link>
  )
}
