const GOAL = 10
const MIN_SET = 0
const MAX_SET = 9

let answer = 0
let checks = 0
let correctTries = 0
let incorrectTries = 0
let acceptingAnswers = true

const checksEl = document.getElementById("checks")
const incorrectEl = document.getElementById("incorrect")
const checksRow = document.getElementById("checks-row")
const pencilSet = document.getElementById("pencil-set")
const options = document.getElementById("options")
const congrats = document.getElementById("congrats")
const statCorrect = document.getElementById("stat-correct")
const statIncorrect = document.getElementById("stat-incorrect")
const playAgain = document.getElementById("play-again")

function startGame() {
  checks = 0
  correctTries = 0
  incorrectTries = 0
  acceptingAnswers = true
  congrats.classList.remove("show")
  updateScore()
  renderChecks()
  buildOptions()
  nextPrompt()
}

function nextPrompt() {
  answer = randomSetCount()
  acceptingAnswers = true
  pencilSet.innerHTML = ""

  for (let i = 0; i < answer; i++) {
    const pencil = document.createElement("span")
    pencil.className = "pencil"
    pencil.textContent = "✏️"
    pencil.style.animationDelay = i * 0.025 + "s"
    pencilSet.appendChild(pencil)
  }

  buildOptions()
}

function randomSetCount() {
  return Math.floor(Math.random() * (MAX_SET - MIN_SET + 1)) + MIN_SET
}

function buildOptions() {
  options.innerHTML = ""

  for (let i = 0; i <= 10; i++) {
    const btn = document.createElement("button")
    btn.className = "option-btn"
    btn.type = "button"
    btn.textContent = i
    btn.dataset.value = i
    btn.addEventListener("click", () => chooseAnswer(btn, i))
    options.appendChild(btn)
  }
}

function chooseAnswer(btn, value) {
  if (!acceptingAnswers || btn.classList.contains("removed")) return

  if (value === answer) {
    acceptingAnswers = false
    correctTries++
    checks++
    btn.classList.add("correct")
    flashScreen("flash-green")
    updateScore()
    renderChecks()

    if (checks >= GOAL) {
      setTimeout(showCongrats, 650)
    } else {
      setTimeout(nextPrompt, 650)
    }
    return
  }

  incorrectTries++
  btn.classList.add("removed")
  flashScreen("flash-red")
  updateScore()
}

function updateScore() {
  checksEl.textContent = checks
  incorrectEl.textContent = incorrectTries
}

function renderChecks() {
  checksRow.innerHTML = ""

  for (let i = 0; i < GOAL; i++) {
    const slot = document.createElement("div")
    slot.className = "check-slot"
    if (i < checks) {
      slot.classList.add("earned")
      slot.textContent = "✅"
    } else {
      slot.textContent = "✓"
    }
    checksRow.appendChild(slot)
  }
}

function flashScreen(className) {
  document.body.classList.remove("flash-green", "flash-red")
  void document.body.offsetWidth
  document.body.classList.add(className)
  setTimeout(() => document.body.classList.remove(className), 500)
}

function showCongrats() {
  statCorrect.textContent = correctTries
  statIncorrect.textContent = incorrectTries
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

playAgain.addEventListener("click", startGame)

startGame()
