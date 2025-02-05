import axios from "axios";

const API_URL = "https://wordle.votee.dev:8000/random";
const RANDOM_WORD_API = "https://random-word-api.herokuapp.com/all";
const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 1000;

const LETTER_FREQUENCY = {
  a: 8.17,
  b: 1.49,
  c: 2.78,
  d: 4.25,
  e: 12.7,
  f: 2.23,
  g: 2.02,
  h: 6.09,
  i: 6.97,
  j: 0.15,
  k: 0.77,
  l: 4.03,
  m: 2.41,
  n: 6.75,
  o: 7.51,
  p: 1.93,
  q: 0.1,
  r: 5.99,
  s: 6.33,
  t: 9.06,
  u: 2.76,
  v: 0.98,
  w: 2.36,
  x: 0.15,
  y: 1.97,
  z: 0.07,
};

function letterFrequencyScore(word) {
  return word
    .split("")
    .reduce((score, ch) => score + (LETTER_FREQUENCY[ch] || 0), 0);
}

async function playWordleWithFrequency(seed) {
  const gameState = {
    correctLetters: new Array(WORD_LENGTH).fill(null),
    presentLetters: new Set(),
    absentLetters: new Set(),
    possibleWords: [],
  };

  const response = await axios.get(RANDOM_WORD_API);
  gameState.possibleWords = response.data.filter(
    (word) => word.length === WORD_LENGTH
  );

  let attempt = 0;
  let isCorrect = false;

  while (!isCorrect && attempt < MAX_ATTEMPTS) {
    attempt++;
    const guessWord = generateGuessWord(gameState);

    try {
      const result = await makeGuess(guessWord, seed);
      isCorrect = updateGameState(gameState, result);
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      break;
    }
  }

  return { isCorrect, attempts: attempt };
}

function generateGuessWord(gameState) {
  let bestWords = [];
  let maxScore = -Infinity;

  for (const word of gameState.possibleWords) {
    const entropy = calculateEntropy(word, gameState.possibleWords);
    const frequencyScore = letterFrequencyScore(word);
    const score = entropy + frequencyScore / 100; // Weighting frequency score
    if (score > maxScore) {
      maxScore = score;
      bestWords = [word];
    } else if (score === maxScore) {
      bestWords.push(word);
    }
  }

  return bestWords[Math.floor(Math.random() * bestWords.length)];
}

function calculateEntropy(word, possibleWords) {
  const patterns = new Map();
  for (const possibleWord of possibleWords) {
    const pattern = getPattern(word, possibleWord);
    patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
  }

  return Array.from(patterns.values()).reduce((entropy, count) => {
    const probability = count / possibleWords.length;
    return entropy - probability * Math.log2(probability);
  }, 0);
}

function getPattern(guess, actual) {
  const pattern = new Array(WORD_LENGTH).fill("absent");
  const actualLetters = new Map();

  for (let i = 0; i < WORD_LENGTH; i++) {
    actualLetters.set(actual[i], (actualLetters.get(actual[i]) || 0) + 1);
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === actual[i]) {
      pattern[i] = "correct";
      actualLetters.set(guess[i], actualLetters.get(guess[i]) - 1);
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (pattern[i] !== "correct" && actualLetters.get(guess[i]) > 0) {
      pattern[i] = "present";
      actualLetters.set(guess[i], actualLetters.get(guess[i]) - 1);
    }
  }

  return pattern.join("");
}

async function makeGuess(guessWord, seed) {
  const response = await axios.get(API_URL, {
    params: { guess: guessWord, size: WORD_LENGTH, seed: seed },
  });
  return response.data;
}

function updateGameState(gameState, result) {
  let isCorrect = true;
  result.forEach(({ slot, guess, result }) => {
    switch (result) {
      case "correct":
        gameState.correctLetters[slot] = guess;
        break;
      case "present":
        gameState.presentLetters.add(guess);
        isCorrect = false;
        break;
      case "absent":
        gameState.absentLetters.add(guess);
        isCorrect = false;
        break;
    }
  });

  gameState.possibleWords = gameState.possibleWords.filter((word) => {
    return result.every(({ slot, guess, result }) => {
      if (result === "correct" && word[slot] !== guess) return false;
      if (result === "present" && !word.includes(guess)) return false;
      if (result === "absent" && word.includes(guess)) return false;
      return true;
    });
  });

  return isCorrect;
}

export { playWordleWithFrequency };
