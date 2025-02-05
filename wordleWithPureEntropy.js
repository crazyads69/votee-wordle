import axios from "axios";
import { retryWithDelay, axiosWithRetry } from "./utils.js";

const API_URL = "https://wordle.votee.dev:8000/random";
const RANDOM_WORD_API = "https://random-word-api.herokuapp.com/all";
const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 100;

async function playWordleWithPureEntropy(seed) {
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
  let bestWord = "";
  let maxEntropy = -Infinity;

  for (const word of gameState.possibleWords) {
    const entropy = calculateEntropy(word, gameState.possibleWords);
    if (entropy > maxEntropy) {
      maxEntropy = entropy;
      bestWord = word;
    }
  }

  return bestWord;
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
  return retryWithDelay(
    async () => {
      const response = await axiosWithRetry.get(API_URL, {
        params: { guess: guessWord, size: WORD_LENGTH, seed: seed },
      });
      return response.data;
    },
    3,
    1000
  );
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

export { playWordleWithPureEntropy };
