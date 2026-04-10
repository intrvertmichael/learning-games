const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
let currentLetter = "A"
let currentCase = "upper"
let correct = 0,
  wrong = 0
let foundCount = 0,
  totalTargets = 0
let confettiAnim = null

const letterSelect = document.getElementById("letter-select")
const caseSelect = document.getElementById("case-select")
const applyBtn = document.getElementById("apply-btn")
const targetDisplay = document.getElementById("target-display")
const targetSub = document.getElementById("target-sub")
const grid = document.getElementById("circles-grid")
const scoreCorrect = document.getElementById("score-correct")
const scoreTotal = document.getElementById("score-total")
const scoreWrong = document.getElementById("score-wrong")
const winOverlay = document.getElementById("win-overlay")
const winStats = document.getElementById("win-stats")
const resetBtn = document.getElementById("reset-btn")
const confCanvas = document.getElementById("confetti")

ALPHABET.split("").forEach(l => {
  const opt = document.createElement("option")
  opt.value = l
  opt.textContent = l
  letterSelect.appendChild(opt)
})

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function buildGrid() {
  grid.innerHTML = ""
  correct = 0
  wrong = 0
  foundCount = 0
  scoreCorrect.textContent = "0"
  scoreWrong.textContent = "0"
  winOverlay.classList.remove("active")
  stopConfetti()

  const upper = currentLetter.toUpperCase()
  const lower = currentLetter.toLowerCase()

  targetDisplay.textContent = currentCase === "upper" ? upper : lower
  targetSub.textContent =
    currentCase === "upper" ? "uppercase letter" : "lowercase letter"

  const numTargets = 4 + Math.floor(Math.random() * 4)
  const numDistractors = 20 - numTargets
  totalTargets = numTargets
  scoreTotal.textContent = totalTargets

  const items = []
  for (let i = 0; i < numTargets; i++)
    items.push({
      char: currentCase === "upper" ? upper : lower,
      isTarget: true,
    })
  for (let i = 0; i < numDistractors; i++)
    items.push({
      char: currentCase === "upper" ? lower : upper,
      isTarget: false,
    })
  shuffle(items)

  items.forEach(item => {
    const wrap = document.createElement("div")
    wrap.className = "circle-wrap"

    const bg = document.createElement("div")
    bg.className = "circle-bg"

    const label = document.createElement("div")
    label.className = "circle-label"
    label.textContent = item.char

    wrap.appendChild(bg)
    wrap.appendChild(label)

    wrap.addEventListener("click", () => {
      if (wrap.classList.contains("done")) return
      wrap.classList.add("done")

      if (item.isTarget) {
        correct++
        scoreCorrect.textContent = correct
        wrap.classList.add("correct-flash")
        wrap.addEventListener(
          "animationend",
          () => {
            const placeholder = document.createElement("div")
            placeholder.className = "circle-placeholder"
            wrap.replaceWith(placeholder)
            foundCount++
            if (foundCount >= totalTargets) setTimeout(showWin, 200)
          },
          { once: true },
        )
      } else {
        wrong++
        scoreWrong.textContent = wrong
        wrap.classList.add("wrong")
      }
    })

    grid.appendChild(wrap)
  })
}

function showWin() {
  winStats.innerHTML = `Correct taps: <span>${correct}</span>&nbsp;&nbsp;&nbsp;Incorrect taps: <span>${wrong}</span>`
  winOverlay.classList.add("active")
  launchConfetti()
}

applyBtn.addEventListener("click", () => {
  currentLetter = letterSelect.value
  currentCase = caseSelect.value
  buildGrid()
})

resetBtn.addEventListener("click", buildGrid)

const COLORS = [
  "#639922",
  "#378ADD",
  "#D4537E",
  "#E24B4A",
  "#EF9F27",
  "#1D9E75",
  "#7F77DD",
]
let particles = []

function launchConfetti() {
  confCanvas.width = confCanvas.offsetWidth
  confCanvas.height = confCanvas.offsetHeight
  particles = Array.from({ length: 90 }, () => ({
    x: Math.random() * confCanvas.width,
    y: -10 - Math.random() * 50,
    vx: (Math.random() - 0.5) * 3.5,
    vy: 2.5 + Math.random() * 3,
    rot: Math.random() * 360,
    vrot: (Math.random() - 0.5) * 9,
    size: 7 + Math.random() * 8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: Math.random() > 0.5 ? "rect" : "circle",
  }))
  animConfetti()
}

function animConfetti() {
  const ctx = confCanvas.getContext("2d")
  ctx.clearRect(0, 0, confCanvas.width, confCanvas.height)
  particles.forEach(p => {
    p.x += p.vx
    p.y += p.vy
    p.rot += p.vrot
    p.vy += 0.06
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate((p.rot * Math.PI) / 180)
    ctx.fillStyle = p.color
    ctx.globalAlpha =
      p.y < confCanvas.height
        ? 1
        : Math.max(0, 1 - (p.y - confCanvas.height) / 50)
    if (p.shape === "rect")
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
    else {
      ctx.beginPath()
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  })
  particles = particles.filter(p => p.y < confCanvas.height + 70)
  if (particles.length > 0) confettiAnim = requestAnimationFrame(animConfetti)
  else {
    ctx.clearRect(0, 0, confCanvas.width, confCanvas.height)
  }
}

function stopConfetti() {
  if (confettiAnim) {
    cancelAnimationFrame(confettiAnim)
    confettiAnim = null
  }
  const ctx = confCanvas.getContext("2d")
  if (ctx) ctx.clearRect(0, 0, confCanvas.width, confCanvas.height)
}

buildGrid()
