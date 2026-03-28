const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const TOTAL = 10 // 5 upper + 5 lower

let currentLetter = "A"
let correctCount = 0
let incorrectCount = 0
let totalPlaced = 0

const upperHint = document.getElementById("upper-hint")
const lowerHint = document.getElementById("lower-hint")
const upperBox = document.getElementById("upper-box")
const lowerBox = document.getElementById("lower-box")
const upperPlaced = document.getElementById("upper-placed")
const lowerPlaced = document.getElementById("lower-placed")
const tray = document.getElementById("tray")
const letterInput = document.getElementById("letter-input")
const goBtn = document.getElementById("go-btn")
const congrats = document.getElementById("congrats")
const statCorrect = document.getElementById("stat-correct")
const statIncorrect = document.getElementById("stat-incorrect")
const playAgain = document.getElementById("play-again")

// ── Build Round ────────────────────────────────────────────
function buildRound(letter) {
  currentLetter = letter.toUpperCase()
  correctCount = 0
  incorrectCount = 0
  totalPlaced = 0

  upperHint.textContent = currentLetter
  lowerHint.textContent = currentLetter.toLowerCase()
  upperPlaced.innerHTML = ""
  lowerPlaced.innerHTML = ""
  tray.innerHTML = ""

  // 5 uppercase + 5 lowercase, shuffled
  const types = [...Array(5).fill("upper"), ...Array(5).fill("lower")]
  shuffle(types)

  types.forEach((type, i) => {
    const el = document.createElement("div")
    el.className = "token " + type + "-token"
    el.textContent =
      type === "upper" ? currentLetter : currentLetter.toLowerCase()
    el.dataset.type = type
    el.dataset.id = i
    tray.appendChild(el)
    attachDrag(el)
  })
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

// ── Drag & Drop ────────────────────────────────────────────
let dragClone = null
let activeEl = null
let offX = 0,
  offY = 0

function getPoint(e) {
  const s = e.touches ? e.touches[0] : e
  return { x: s.clientX, y: s.clientY }
}

function attachDrag(el) {
  el.addEventListener("mousedown", e => onStart(e, el))
  el.addEventListener("touchstart", e => onStart(e, el), { passive: false })
}

function onStart(e, el) {
  if (el.classList.contains("placed")) return
  e.preventDefault()
  activeEl = el

  const r = el.getBoundingClientRect()
  const pt = getPoint(e)
  offX = pt.x - (r.left + r.width / 2)
  offY = pt.y - (r.top + r.height / 2)

  const size = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue("--token-size"),
  )
  const isUpper = el.classList.contains("upper-token")

  dragClone = document.createElement("div")
  dragClone.style.cssText = `
    position:fixed; pointer-events:none; z-index:9999;
    width:${size}px; height:${size}px; border-radius:50%;
    background:#fff;
    border:4px solid #bbb;
    color:#555;
    font-family:'Fredoka One',cursive; font-size:2.3rem;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 10px 28px rgba(0,0,0,.2);
    transform:translate(-50%,-50%) scale(1.12);
    left:${pt.x - offX}px; top:${pt.y - offY}px;
  `
  dragClone.textContent = el.textContent
  document.body.appendChild(dragClone)
  el.style.opacity = "0.2"
}

function onMove(e) {
  if (!dragClone) return
  e.preventDefault()
  const pt = getPoint(e)
  dragClone.style.left = pt.x - offX + "px"
  dragClone.style.top = pt.y - offY + "px"
}

function onEnd(e) {
  if (!dragClone || !activeEl) return
  const src = e.changedTouches ? e.changedTouches[0] : e
  const cx = src.clientX,
    cy = src.clientY

  document.body.removeChild(dragClone)
  dragClone = null

  const overUpper = isOver(cx, cy, upperBox)
  const overLower = isOver(cx, cy, lowerBox)
  const isUpper = activeEl.dataset.type === "upper"

  if (overUpper || overLower) {
    const correct = isUpper === overUpper
    const box = overUpper ? upperBox : lowerBox
    const area = overUpper ? upperPlaced : lowerPlaced

    if (correct) {
      const chip = document.createElement("div")
      chip.className =
        "placed-token " + (isUpper ? "upper" : "lower") + "-token"
      chip.textContent = activeEl.textContent
      area.appendChild(chip)

      activeEl.classList.add("placed")
      activeEl.style.opacity = ""

      flash(box, "flash-green")
      correctCount++
      totalPlaced++
      if (totalPlaced === TOTAL) setTimeout(showCongrats, 500)
    } else {
      flash(box, "shake")
      activeEl.style.opacity = ""
      incorrectCount++
    }
  } else {
    activeEl.style.opacity = ""
  }

  activeEl = null
}

function flash(box, cls) {
  box.classList.remove("flash-green", "shake")
  void box.offsetWidth
  box.classList.add(cls)
  setTimeout(() => box.classList.remove(cls), 600)
}

function isOver(cx, cy, el) {
  const r = el.getBoundingClientRect()
  return cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom
}

document.addEventListener("mousemove", onMove)
document.addEventListener("touchmove", onMove, { passive: false })
document.addEventListener("mouseup", onEnd)
document.addEventListener("touchend", onEnd)

// ── Congrats ───────────────────────────────────────────────
function showCongrats() {
  statCorrect.textContent = correctCount
  statIncorrect.textContent = incorrectCount
  congrats.classList.add("show")
  launchConfetti()
}

const CONFETTI_COLORS = [
  "#ff6b35",
  "#ffce00",
  "#36c46a",
  "#4a90d9",
  "#d44a8a",
  "#a259ff",
  "#ff9a5c",
]

function launchConfetti() {
  for (let i = 0; i < 90; i++) {
    setTimeout(() => {
      const c = document.createElement("div")
      c.className = "confetti-piece"
      c.style.left = Math.random() * 100 + "vw"
      c.style.top = "-14px"
      c.style.width = 7 + Math.random() * 9 + "px"
      c.style.height = 7 + Math.random() * 9 + "px"
      c.style.background =
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
      c.style.animationDuration = 1.4 + Math.random() * 1.8 + "s"
      document.body.appendChild(c)
      setTimeout(() => c.remove(), 3500)
    }, i * 20)
  }
}

// ── Controls ───────────────────────────────────────────────
goBtn.addEventListener("click", () => {
  const val = letterInput.value.trim().toUpperCase()
  if (!val || !LETTERS.includes(val)) {
    letterInput.style.borderColor = "#f04040"
    setTimeout(() => (letterInput.style.borderColor = ""), 900)
    return
  }
  congrats.classList.remove("show")
  buildRound(val)
})

letterInput.addEventListener("keydown", e => {
  if (e.key === "Enter") goBtn.click()
})
letterInput.addEventListener("input", () => {
  letterInput.value = letterInput.value.toUpperCase()
})

playAgain.addEventListener("click", () => {
  congrats.classList.remove("show")
  buildRound(currentLetter)
})

// ── Init ───────────────────────────────────────────────────
buildRound("A")
