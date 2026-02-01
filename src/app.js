/**
 * Main app logic for Infinite MCQ Generator
 * Feed-style: all questions stay visible
 * Adaptive difficulty based on performance
 */

import { calculateDifficulty, generateMCQ, getDifficultyName } from "./api.js";
import { addToHistory, getHistory, getStats, updateStats } from "./storage.js";

// DOM Elements
const elements = {
  // Topic & Start
  topicInput: document.getElementById("topic"),
  startBtn: document.getElementById("startBtn"),

  // States
  welcome: document.getElementById("welcome"),
  loading: document.getElementById("loading"),
  error: document.getElementById("error"),
  errorMsg: document.getElementById("errorMsg"),
  retryBtn: document.getElementById("retryBtn"),

  // Questions Feed
  questionsFeed: document.getElementById("questionsFeed"),

  // Stats
  score: document.getElementById("score"),
  total: document.getElementById("total"),
  streak: document.getElementById("streak"),
};

// App State
const state = {
  currentTopic: "",
  questionCount: 0,
  history: [],
  isGenerating: false,
  currentDifficulty: 1,
};

/**
 * Initialize app
 */
function init() {
  // Load saved data
  state.history = getHistory();
  updateStatsDisplay();

  // Event listeners
  elements.startBtn.addEventListener("click", handleStart);
  elements.retryBtn.addEventListener("click", handleRetry);

  // Enter key on topic input
  elements.topicInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleStart();
  });
}

/**
 * Handle start button click
 */
async function handleStart() {
  if (state.isGenerating) return;

  const topic = elements.topicInput.value.trim() || "General Knowledge";
  state.currentTopic = topic;

  // Hide welcome
  elements.welcome.classList.add("hidden");

  await loadNextQuestion();
}

/**
 * Handle retry button click
 */
async function handleRetry() {
  elements.error.classList.add("hidden");
  await loadNextQuestion();
}

/**
 * Load and display next question
 */
async function loadNextQuestion() {
  if (state.isGenerating) return;
  state.isGenerating = true;

  // Calculate difficulty based on recent performance
  state.currentDifficulty = calculateDifficulty(state.history);

  // Show loading at bottom
  elements.loading.classList.remove("hidden");
  elements.error.classList.add("hidden");
  elements.startBtn.disabled = true;
  elements.startBtn.textContent = "Loading...";

  try {
    const result = await generateMCQ(
      state.currentTopic,
      state.history,
      state.currentDifficulty,
    );

    if (result.success) {
      state.questionCount++;

      // Add new question card to feed
      const cardId = `question-${state.questionCount}`;
      addQuestionToFeed(
        result.mcq,
        cardId,
        state.questionCount,
        state.currentDifficulty,
      );

      // Scroll to new question
      setTimeout(() => {
        const newCard = document.getElementById(cardId);
        if (newCard) {
          newCard.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    } else {
      elements.errorMsg.textContent =
        result.error || "Failed to generate question";
      elements.error.classList.remove("hidden");
    }
  } catch (err) {
    elements.errorMsg.textContent = err.message || "Something went wrong";
    elements.error.classList.remove("hidden");
  } finally {
    elements.loading.classList.add("hidden");
    elements.startBtn.disabled = false;
    elements.startBtn.textContent = "Next Question";
    state.isGenerating = false;
  }
}

/**
 * Add a question card to the feed
 */
function addQuestionToFeed(mcq, cardId, questionNum, difficulty) {
  const card = document.createElement("div");
  card.className = "question-card";
  card.id = cardId;
  card.dataset.mcq = JSON.stringify(mcq);

  const diffName = getDifficultyName(difficulty);
  const diffClass =
    difficulty <= 2 ? "easy" : difficulty <= 4 ? "medium" : "hard";

  card.innerHTML = `
    <div class="question-header">
      <span class="question-number">Question #${questionNum}</span>
      <span class="difficulty-badge ${diffClass}">${diffName}</span>
    </div>
    <p class="question-text">${escapeHtml(mcq.question)}</p>

    <div class="choices">
      ${mcq.choices
        .map(
          (choice) => `
        <div class="choice" data-id="${choice.id}">
          <span class="choice-letter">${choice.id}</span>
          <span class="choice-text">${escapeHtml(choice.text)}</span>
        </div>
      `,
        )
        .join("")}
    </div>

    <div class="feedback hidden">
      <div class="feedback-result"></div>
      <div class="explanation"></div>
    </div>
  `;

  // Add click handlers to choices
  const choices = card.querySelectorAll(".choice");
  choices.forEach((choiceEl) => {
    choiceEl.addEventListener("click", () => {
      handleChoiceClick(cardId, choiceEl.dataset.id);
    });
  });

  elements.questionsFeed.appendChild(card);
}

/**
 * Handle choice selection
 */
function handleChoiceClick(cardId, choiceId) {
  const card = document.getElementById(cardId);
  if (!card || card.classList.contains("answered")) return;

  card.classList.add("answered");

  const mcq = JSON.parse(card.dataset.mcq);
  const isCorrect = choiceId === mcq.correct;

  // Update stats
  const stats = updateStats(isCorrect);
  updateStatsDisplay(stats);

  // Highlight choices
  const choiceElements = card.querySelectorAll(".choice");
  choiceElements.forEach((el) => {
    el.classList.add("disabled");

    if (el.dataset.id === mcq.correct) {
      el.classList.add("correct");
    } else if (el.dataset.id === choiceId && !isCorrect) {
      el.classList.add("incorrect");
    }
  });

  // Show feedback
  const feedback = card.querySelector(".feedback");
  const feedbackResult = card.querySelector(".feedback-result");
  const explanation = card.querySelector(".explanation");

  feedbackResult.textContent = isCorrect ? "✓ Correct!" : "✗ Incorrect";
  feedbackResult.className = `feedback-result ${isCorrect ? "correct" : "incorrect"}`;
  explanation.textContent = mcq.explanation || "No explanation provided.";
  feedback.classList.remove("hidden");

  // Save to history
  const historyEntry = {
    question: mcq.question,
    choices: mcq.choices,
    selected: choiceId,
    correct: mcq.correct,
    isCorrect,
    topic: state.currentTopic,
  };

  state.history = addToHistory(historyEntry);

  // Auto-load next question after a short delay
  setTimeout(() => {
    loadNextQuestion();
  }, 1500);
}

/**
 * Update stats display
 */
function updateStatsDisplay(stats = null) {
  const s = stats || getStats();
  elements.score.textContent = s.correct;
  elements.total.textContent = s.total;
  elements.streak.textContent = s.streak;
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Initialize on load
init();
