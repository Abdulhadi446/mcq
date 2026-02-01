/**
 * Sodeom AI API integration for MCQ generation
 */

const SODEOM_ENDPOINT = "https://sodeom.com/ai";

// Difficulty levels with descriptions for the AI
const DIFFICULTY_LEVELS = {
  1: { name: "Beginner", desc: "basic, introductory, common knowledge" },
  2: { name: "Easy", desc: "straightforward facts, well-known information" },
  3: { name: "Medium", desc: "moderate difficulty, requires some knowledge" },
  4: {
    name: "Intermediate",
    desc: "challenging, specific details, deeper understanding",
  },
  5: {
    name: "Advanced",
    desc: "complex concepts, nuanced understanding, expert-level",
  },
  6: {
    name: "Expert",
    desc: "highly specialized, obscure facts, professional knowledge",
  },
  7: {
    name: "Master",
    desc: "extremely difficult, cutting-edge, only specialists would know",
  },
};

// System prompt for strict JSON MCQ output (combined with user prompt for GET request)
const SYSTEM_PROMPT = `You are an MCQ generator. Output ONLY valid JSON. Generate a single UNIQUE multiple-choice question with exactly 4 choices. Format: {"question":"...","choices":[{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],"correct":"B","explanation":"..."}. No markdown, no extra text.`;

/**
 * Build the full prompt for a topic (combines system + user prompt for GET request)
 */
function buildUserPrompt(topic, history = [], difficulty = 1) {
  // Add randomness to encourage variety
  const randomSeed = Math.floor(Math.random() * 10000);

  // Get difficulty info
  const diffInfo =
    DIFFICULTY_LEVELS[Math.min(difficulty, 7)] || DIFFICULTY_LEVELS[1];

  // Different aspects to explore based on difficulty
  const beginnerAspects = [
    "basic facts",
    "common knowledge",
    "simple definitions",
    "famous examples",
  ];
  const intermediateAspects = [
    "specific details",
    "historical context",
    "comparisons",
    "applications",
    "processes",
  ];
  const advancedAspects = [
    "expert concepts",
    "rare facts",
    "technical details",
    "edge cases",
    "recent developments",
    "controversies",
  ];

  let aspects;
  if (difficulty <= 2) {
    aspects = beginnerAspects;
  } else if (difficulty <= 4) {
    aspects = [...beginnerAspects, ...intermediateAspects];
  } else {
    aspects = [...intermediateAspects, ...advancedAspects];
  }

  const randomAspect = aspects[Math.floor(Math.random() * aspects.length)];

  // Build list of forbidden topics/keywords from history
  const forbiddenKeywords = extractKeywords(history);

  // Extract concepts already covered
  const coveredConcepts = new Set();
  history.forEach((h) => {
    extractConcepts(h.question.toLowerCase()).forEach((c) =>
      coveredConcepts.add(c),
    );
  });

  let prompt = `${SYSTEM_PROMPT}\n\n[ID:${randomSeed}] Generate 1 COMPLETELY NEW and UNIQUE ${diffInfo.name.toUpperCase()}-level MCQ about ${randomAspect} of: ${topic}.\n\nDifficulty: ${diffInfo.name} (${diffInfo.desc}). Make the question appropriately ${difficulty >= 4 ? "challenging and specific" : "accessible"}.`;

  // Add history context to avoid repetition - be very explicit
  if (history.length > 0) {
    // List the exact questions to avoid
    const recentQuestions = history
      .slice(-10)
      .map((h) => h.question)
      .join(" | ");
    prompt += `\n\nSTRICT RULES:`;
    prompt += `\n1. NEVER ask about: ${forbiddenKeywords.slice(0, 15).join(", ")}`;
    prompt += `\n2. NEVER ask similar questions to: ${recentQuestions}`;
    prompt += `\n3. Ask about a COMPLETELY DIFFERENT aspect or subtopic`;
    prompt += `\n4. Be creative - explore unusual facts, specific details, or unique angles`;
  }

  return prompt;
}

/**
 * Extract keywords from history to avoid
 */
function extractKeywords(history) {
  const keywords = new Set();
  const commonWords = new Set([
    "what",
    "which",
    "the",
    "is",
    "are",
    "a",
    "an",
    "of",
    "in",
    "to",
    "for",
    "as",
    "known",
    "called",
    "does",
    "do",
    "has",
    "have",
    "following",
    "typically",
    "usually",
    "refers",
  ]);

  history.forEach((h) => {
    // Extract key nouns/topics from questions
    const words = h.question
      .toLowerCase()
      .replace(/[?.,!'"]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !commonWords.has(w));
    words.forEach((w) => keywords.add(w));
  });

  return Array.from(keywords).slice(0, 20); // Limit to avoid prompt being too long
}

/**
 * Check if a question is too similar to previous questions
 * Uses multiple detection strategies for better coverage
 */
export function isDuplicateQuestion(newQuestion, history) {
  if (!history || history.length === 0) return false;

  const newLower = newQuestion.toLowerCase();
  const newWords = new Set(newLower.split(/\s+/).filter((w) => w.length > 3));

  // Extract the core concept/topic from the new question
  const newConcepts = extractConcepts(newLower);

  for (const h of history) {
    const oldLower = h.question.toLowerCase();

    // Check for exact or near-exact match
    if (newLower === oldLower) return true;

    // Check for high word overlap (>50% similar - lowered threshold)
    const oldWords = new Set(oldLower.split(/\s+/).filter((w) => w.length > 3));
    const intersection = [...newWords].filter((w) => oldWords.has(w));
    const similarity =
      intersection.length / Math.max(newWords.size, oldWords.size);

    if (similarity > 0.5) return true;

    // Check for concept overlap (semantic similarity)
    const oldConcepts = extractConcepts(oldLower);
    const conceptOverlap = [...newConcepts].filter((c) => oldConcepts.has(c));
    if (conceptOverlap.length > 0) return true;

    // Check for key phrase matches (expanded list)
    const keyPhrases = [
      "red planet",
      "capital of france",
      "capital city",
      "general knowledge",
      "largest country",
      "largest land area",
      "purpose of programming",
      "programming language",
      "main purpose",
      "primary purpose",
      "what is the",
      "which planet",
      "which country",
    ];
    for (const phrase of keyPhrases) {
      if (newLower.includes(phrase) && oldLower.includes(phrase)) return true;
    }
  }

  return false;
}

/**
 * Extract core concepts from a question for semantic matching
 */
function extractConcepts(questionLower) {
  const concepts = new Set();

  // Concept patterns - if question contains these, add the concept
  const conceptPatterns = [
    {
      patterns: [
        "purpose of programming",
        "programming is",
        "what is programming",
      ],
      concept: "programming-purpose",
    },
    {
      patterns: ["programming language", "language is used", "write code"],
      concept: "programming-language",
    },
    { patterns: ["capital of", "capital city"], concept: "capital-city" },
    { patterns: ["red planet", "mars"], concept: "mars" },
    {
      patterns: ["largest country", "biggest country", "land area"],
      concept: "largest-country",
    },
    { patterns: ["python", "python's"], concept: "python" },
    { patterns: ["javascript", "js "], concept: "javascript" },
    {
      patterns: ["list and tuple", "tuple and list", "mutable", "immutable"],
      concept: "python-data-structures",
    },
    { patterns: ["loop", "for loop", "while loop"], concept: "loops" },
    { patterns: ["function", "def ", "return"], concept: "functions" },
    { patterns: ["variable", "variables"], concept: "variables" },
    { patterns: ["array", "arrays"], concept: "arrays" },
    { patterns: ["object", "objects", "oop"], concept: "objects" },
    { patterns: ["class", "classes", "inheritance"], concept: "classes" },
    { patterns: ["syntax", "syntactically"], concept: "syntax" },
    {
      patterns: ["beginner", "beginners", "learn", "easier to learn"],
      concept: "beginner-friendly",
    },
  ];

  for (const { patterns, concept } of conceptPatterns) {
    for (const pattern of patterns) {
      if (questionLower.includes(pattern)) {
        concepts.add(concept);
        break;
      }
    }
  }

  return concepts;
}

/**
 * Parse AI response - handles various formats
 */
function parseAIResponse(answerText) {
  if (!answerText || typeof answerText !== "string") {
    return { ok: false, error: "Empty response from AI" };
  }

  let text = answerText.trim();

  // Remove markdown code fences if present
  text = text.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "");
  text = text.trim();

  // Try direct parse
  try {
    const parsed = JSON.parse(text);
    if (validateMCQ(parsed)) {
      return { ok: true, data: parsed };
    }
  } catch (e) {
    // Continue to fallback parsing
  }

  // Fallback: find JSON object in text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (validateMCQ(parsed)) {
        return { ok: true, data: parsed };
      }
    } catch (e) {
      // Continue
    }
  }

  return { ok: false, error: "Failed to parse MCQ from AI response" };
}

/**
 * Validate MCQ structure
 */
function validateMCQ(obj) {
  if (!obj || typeof obj !== "object") return false;
  if (typeof obj.question !== "string" || !obj.question.trim()) return false;
  if (!Array.isArray(obj.choices) || obj.choices.length < 2) return false;
  if (typeof obj.correct !== "string") return false;

  // Validate each choice
  for (const choice of obj.choices) {
    if (!choice.id || !choice.text) return false;
  }

  // Validate correct answer exists in choices
  const correctExists = obj.choices.some((c) => c.id === obj.correct);
  if (!correctExists) return false;

  return true;
}

/**
 * Call Sodeom AI endpoint
 */
async function callSodeomAI(topic, history = [], difficulty = 1, retries = 3) {
  const userPrompt = buildUserPrompt(topic, history, difficulty);

  let lastError = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Use GET request to avoid CORS preflight issues
      const url = `${SODEOM_ENDPOINT}?query=${encodeURIComponent(userPrompt)}`;

      const response = await fetch(url, {
        method: "GET",
      });

      if (response.status === 429) {
        // Rate limited - wait and retry
        const retryAfter = parseInt(
          response.headers.get("Retry-After") || "2",
          10,
        );
        await delay(retryAfter * 1000);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.answer) {
        throw new Error("No answer in response");
      }

      // Parse the MCQ from answer
      const parsed = parseAIResponse(data.answer);

      if (parsed.ok) {
        return { success: true, mcq: parsed.data, rawAnswer: data.answer };
      } else {
        lastError = new Error(parsed.error);
        // Retry on parse failure
        continue;
      }
    } catch (error) {
      lastError = error;

      // Exponential backoff
      if (attempt < retries - 1) {
        await delay(Math.pow(2, attempt) * 1000);
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || "Failed to generate MCQ",
  };
}

/**
 * Generate a single MCQ with adaptive difficulty and duplicate checking
 */
export async function generateMCQ(topic, history = [], difficulty = 1) {
  const maxAttempts = 5; // Try up to 5 times to get a unique question

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await callSodeomAI(topic, history, difficulty);

    if (!result.success) {
      return result; // Return error if API failed
    }

    // Check if this question is a duplicate
    if (!isDuplicateQuestion(result.mcq.question, history)) {
      return result; // Unique question found!
    }

    console.log(`Duplicate detected (attempt ${attempt + 1}), regenerating...`);

    // Small delay before retry
    await delay(500);
  }

  // If we still have duplicates after max attempts, return last result anyway
  // (better than nothing)
  return callSodeomAI(topic, history, difficulty);
}

/**
 * Calculate difficulty based on performance
 * Returns difficulty level 1-7
 */
export function calculateDifficulty(history) {
  if (history.length < 3) return 1; // Start easy

  // Look at recent performance (last 5 questions)
  const recent = history.slice(-5);
  const correctCount = recent.filter((h) => h.isCorrect).length;
  const accuracy = correctCount / recent.length;

  // Check for streak
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].isCorrect) streak++;
    else break;
  }

  // Calculate base difficulty from accuracy
  let difficulty = 1;

  if (accuracy >= 0.8 && streak >= 3) {
    difficulty = Math.min(7, 3 + Math.floor(streak / 2)); // Increase with streak
  } else if (accuracy >= 0.6) {
    difficulty = 3;
  } else if (accuracy >= 0.4) {
    difficulty = 2;
  } else {
    difficulty = 1; // Go back to basics
  }

  return difficulty;
}

/**
 * Get difficulty name for display
 */
export function getDifficultyName(level) {
  const names = {
    1: "Beginner",
    2: "Easy",
    3: "Medium",
    4: "Intermediate",
    5: "Advanced",
    6: "Expert",
    7: "Master",
  };
  return names[level] || "Beginner";
}

/**
 * Helper: delay
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
