export default function RoundTracker({ marks, total, label = "rounds complete" }) {
  return (
    <div className="checks-row" aria-label={label}>
      {Array.from({ length: total }, (_, index) => (
        <div
          className={`check-slot ${
            marks[index] === "correct" ? "earned" : ""
          } ${marks[index] === "incorrect" ? "missed" : ""}`}
          key={index}
        >
          {marks[index] === "correct"
            ? "✅"
            : marks[index] === "incorrect"
              ? "🚫"
              : "✓"}
        </div>
      ))}
    </div>
  )
}
