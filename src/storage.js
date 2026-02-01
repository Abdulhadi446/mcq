/**
 * LocalStorage helpers for MCQ app
 */

const STORAGE_KEYS = {
  HISTORY: "mcq_history",
  STATS: "mcq_stats",
  SETTINGS: "mcq_settings",
};

/**
 * Get history from localStorage
 */
export function getHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Save history to localStorage
 */
export function saveHistory(history) {
  try {
    // Keep only last 100 entries
    const trimmed = history.slice(-100);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn("Failed to save history:", e);
  }
}

/**
 * Add entry to history
 */
export function addToHistory(entry) {
  const history = getHistory();
  history.push({
    ...entry,
    timestamp: Date.now(),
  });
  saveHistory(history);
  return history;
}

/**
 * Clear history
 */
export function clearHistory() {
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

/**
 * Get stats
 */
export function getStats() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    return data
      ? JSON.parse(data)
      : {
          total: 0,
          correct: 0,
          streak: 0,
          bestStreak: 0,
        };
  } catch {
    return { total: 0, correct: 0, streak: 0, bestStreak: 0 };
  }
}

/**
 * Save stats
 */
export function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.warn("Failed to save stats:", e);
  }
}

/**
 * Update stats after answer
 */
export function updateStats(isCorrect) {
  const stats = getStats();
  stats.total++;

  if (isCorrect) {
    stats.correct++;
    stats.streak++;
    if (stats.streak > stats.bestStreak) {
      stats.bestStreak = stats.streak;
    }
  } else {
    stats.streak = 0;
  }

  saveStats(stats);
  return stats;
}

/**
 * Reset stats
 */
export function resetStats() {
  saveStats({ total: 0, correct: 0, streak: 0, bestStreak: 0 });
}

/**
 * Get settings
 */
export function getSettings() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data
      ? JSON.parse(data)
      : {
          autoAdvance: false,
          autoAdvanceDelay: 2000,
        };
  } catch {
    return { autoAdvance: false, autoAdvanceDelay: 2000 };
  }
}

/**
 * Save settings
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn("Failed to save settings:", e);
  }
}
