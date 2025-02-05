import axios from "axios";

const API_URL = "https://wordle.votee.dev:8000/random";
const RANDOM_WORD_API = "https://random-word-api.herokuapp.com/all";
const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 100;

async function playWordleWithGreedy(seed) {
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
  return gameState.possibleWords[0]; // Simply choose the first word in the list
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

module.exports = { playWordleWithGreedy };
