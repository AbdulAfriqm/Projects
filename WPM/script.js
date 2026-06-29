/* ==============================
   TYPETERM — Core Logic
   ============================== */

// ── Word Banks ──────────────────────────────────────────────
const WORDS = {
  easy: [
    "the", "and", "for", "are", "but", "not", "you", "all", "can", "her",
    "was", "one", "our", "out", "day", "get", "has", "him", "his", "how",
    "man", "new", "now", "old", "see", "two", "way", "who", "boy", "did",
    "its", "let", "put", "say", "she", "too", "use", "cat", "dog", "run",
    "big", "sun", "hat", "cup", "red", "sit", "top", "air", "arm", "box"
  ],
  medium: [
    "about", "above", "after", "again", "along", "built", "carry", "cause",
    "clean", "close", "come", "cover", "cross", "dance", "delay", "drive",
    "earth", "eight", "every", "face", "false", "field", "fight", "final",
    "first", "floor", "found", "frame", "front", "given", "glass", "grant",
    "great", "green", "group", "guard", "guide", "happy", "heart", "heavy",
    "house", "human", "image", "index", "inner", "input", "issue", "japan",
    "judge", "known", "large", "later", "layer", "learn", "light", "limit",
    "local", "logic", "major", "match", "metal", "model", "money", "month"
  ],
  hard: [
    "abstract", "adequate", "adjacent", "alphabet", "argument", "assembly",
    "asterisk", "audience", "authentic", "balanced", "boundary", "brackets",
    "buffered", "callback", "capture", "category", "champion", "character",
    "chromatic", "circular", "classify", "cleverly", "clusters", "compiler",
    "computer", "conclude", "concrete", "conflict", "consumer", "contrary",
    "contrast", "controls", "converge", "creative", "database", "deadline",
    "debugger", "decision", "describe", "detailed", "developer", "diagonal",
    "digital", "discrete", "document", "dominant", "duration", "dynamics",
    "embedded", "encoding", "estimate", "evaluate", "explicit", "exposure",
    "feedback", "flexible", "floating", "forensic", "fragment", "function"
  ]
};

// ── State ────────────────────────────────────────────────────
let state = {
  words: [],
  charMap: [],        // flat: { char, wordIdx, charIdx, el }
  cursorPos: 0,
  typed: [],
  started: false,
  finished: false,
  totalTyped: 0,
  totalErrors: 0,
  timeLeft: 60,
  timerId: null,
  wpm: 0,
  difficulty: "easy"
};

// ── DOM References ───────────────────────────────────────────
const $wpm      = document.getElementById("wpm");
const $acc      = document.getElementById("accuracy");
const $timer    = document.getElementById("timer");
const $errors   = document.getElementById("errors");
const $display  = document.getElementById("word-display");
const $input    = document.getElementById("type-input");
const $startBtn = document.getElementById("start-btn");
const $resetBtn = document.getElementById("reset-btn");
const $retryBtn = document.getElementById("retry-btn");
const $results  = document.getElementById("result-screen");
const $diffBtns = document.querySelectorAll(".diff-btn");

// ── Helpers ──────────────────────────────────────────────────
function pickWords(count = 80) {
  const pool = WORDS[state.difficulty];
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return result;
}

function buildDisplay(words) {
  $display.innerHTML = "";
  state.charMap = [];

  words.forEach((word, wi) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "word";

    word.split("").forEach((ch, ci) => {
      const charSpan = document.createElement("span");
      charSpan.className = "char pending";
      charSpan.textContent = ch;
      wordSpan.appendChild(charSpan);

      state.charMap.push({
        char: ch,
        wordIdx: wi,
        charIdx: ci,
        el: charSpan
      });
    });

    $display.appendChild(wordSpan);

    // Gap between words (space)
    if (wi < words.length - 1) {
      const gap = document.createElement("span");
      gap.className = "char pending word-gap";
      gap.textContent = " ";
      $display.appendChild(gap);

      state.charMap.push({
        char: " ",
        wordIdx: wi,
        charIdx: word.length,
        el: gap
      });
    }
  });

  updateCursor(0);
}

function updateCursor(pos) {
  state.charMap.forEach((c, i) => {
    if (c.el.classList.contains("current")) {
      c.el.classList.remove("current");
    }
  });
  if (pos < state.charMap.length) {
    state.charMap[pos].el.classList.add("current");
    scrollToCursor(state.charMap[pos].el);
  }
}

function scrollToCursor(el) {
  el.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function computeWPM() {
  const elapsed = (60 - state.timeLeft) || 1;
  const wordsTyped = Math.floor(state.cursorPos / 5);
  return Math.round((wordsTyped / elapsed) * 60);
}

function computeAccuracy() {
  if (state.totalTyped === 0) return 100;
  return Math.round(((state.totalTyped - state.totalErrors) / state.totalTyped) * 100);
}

function grade(wpm, acc) {
  if (acc < 70) return "F";
  if (wpm < 20) return "D";
  if (wpm < 35) return "C";
  if (wpm < 55) return "B";
  if (wpm < 75) return "A";
  return "S+";
}

function flashStat(el, cls) {
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), 400);
}

// ── Timer ────────────────────────────────────────────────────
function startTimer() {
  state.timerId = setInterval(() => {
    state.timeLeft--;
    $timer.textContent = state.timeLeft + "s";

    if (state.timeLeft <= 10) flashStat($timer, "flash-red");
    else if (state.timeLeft <= 20) flashStat($timer, "flash-amber");

    if (state.timeLeft <= 0) endGame();
  }, 1000);
}

// ── Game Flow ────────────────────────────────────────────────
function initGame() {
  clearInterval(state.timerId);
  $results.classList.add("hidden");

  state = {
    ...state,
    words: pickWords(80),
    charMap: [],
    cursorPos: 0,
    typed: [],
    started: false,
    finished: false,
    totalTyped: 0,
    totalErrors: 0,
    timeLeft: 60,
    timerId: null,
    wpm: 0,
  };

  buildDisplay(state.words);

  $wpm.textContent = "0";
  $acc.innerHTML   = "100<span class='unit'>%</span>";
  $timer.innerHTML = "60<span class='unit'>s</span>";
  $errors.textContent = "0";

  $input.value = "";
  $input.disabled = true;
  $startBtn.textContent = "[ START ]";
}

function startGame() {
  $input.disabled = false;
  $input.focus();
  state.started = true;
  startTimer();
  $startBtn.textContent = "[ RUNNING ]";
  $startBtn.disabled = true;
}

function endGame() {
  clearInterval(state.timerId);
  state.finished = true;
  $input.disabled = true;

  const finalWpm = computeWPM();
  const finalAcc = computeAccuracy();
  const finalGrade = grade(finalWpm, finalAcc);

  document.getElementById("final-wpm").textContent    = finalWpm;
  document.getElementById("final-acc").textContent    = finalAcc + "%";
  document.getElementById("final-errors").textContent  = state.totalErrors;
  document.getElementById("final-grade").textContent   = finalGrade;

  $results.classList.remove("hidden");
  $startBtn.disabled = false;
  $startBtn.textContent = "[ START ]";
}

// ── Input Handling ───────────────────────────────────────────
$input.addEventListener("input", (e) => {
  if (!state.started || state.finished) return;

  const val = $input.value;

  // We handle character by character based on value length
  const newLen = val.length;
  const prevPos = state.cursorPos;

  if (newLen === 0) {
    // Backspace to 0 — remove all
    for (let i = prevPos - 1; i >= 0; i--) {
      const c = state.charMap[i];
      c.el.classList.remove("correct", "wrong");
      c.el.classList.add("pending");
    }
    state.cursorPos = 0;
    updateCursor(0);
    return;
  }

  const typedChar = val[val.length - 1];
  const pos = state.cursorPos;

  if (pos >= state.charMap.length) return;

  const expected = state.charMap[pos];

  if (e.inputType === "deleteContentBackward") {
    // Backspace
    if (pos > 0) {
      const prev = state.charMap[pos - 1];
      prev.el.classList.remove("correct", "wrong");
      prev.el.classList.add("pending");
      state.cursorPos--;
      updateCursor(state.cursorPos);
    }
    $input.value = val.slice(0, -1);
    return;
  }

  // Forward character
  state.totalTyped++;
  if (typedChar === expected.char) {
    expected.el.classList.remove("pending", "wrong");
    expected.el.classList.add("correct");
  } else {
    expected.el.classList.remove("pending", "correct");
    expected.el.classList.add("wrong");
    state.totalErrors++;
    flashStat($errors, "flash-red");
  }

  state.cursorPos++;
  updateCursor(state.cursorPos);
  $input.value = "";

  // Update live stats
  const wpm = computeWPM();
  const acc = computeAccuracy();
  $wpm.textContent = wpm;
  $acc.innerHTML   = acc + "<span class='unit'>%</span>";
  $errors.textContent = state.totalErrors;

  if (state.cursorPos >= state.charMap.length) endGame();
});

// ── Buttons ──────────────────────────────────────────────────
$startBtn.addEventListener("click", () => {
  if (!state.started) startGame();
});

$resetBtn.addEventListener("click", () => {
  initGame();
});

$retryBtn.addEventListener("click", () => {
  initGame();
});

$diffBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    $diffBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.difficulty = btn.dataset.diff;
    initGame();
  });
});

// ── Keyboard Shortcut: Enter to start ───────────────────────
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !state.started && !state.finished) {
    startGame();
  }
  if (e.key === "Escape") initGame();
});

// ── Boot ─────────────────────────────────────────────────────
initGame();
