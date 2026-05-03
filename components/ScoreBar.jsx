"use client"

export default function ScoreBar({ items }) {
  return (
    <div className="score-bar">
      {items.map(item => (
        <span key={item.label}>
          {item.label}: <span className="score-val">{item.value}</span>
          {item.total ? (
            <>
              /<span className="score-val">{item.total}</span>
            </>
          ) : null}
        </span>
      ))}
    </div>
  )
}
