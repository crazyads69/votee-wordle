import axios from "axios";

// Constants
const API_URL = "https://wordle.votee.dev:8000/random";
const COMMON_LETTERS = "etaoinsrhdlucmfywgpbvkxqjz";
const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 100;
const SEED = Math.floor(Math.random() * 1000000); // Make sure the seed is the same for all attempts

// Game state for tracking the correct, present, and absent letters
const gameState = {
  correctLetters: new Array(WORD_LENGTH).fill(null),
  presentLetters: new Set(),
  absentLetters: new Set(),
};

function generateGuessWord(gameState) {
  // Remove absent letters from the common letters pool
  const availableLetters = Array.from(COMMON_LETTERS).filter(
    (letter) => !gameState.absentLetters.has(letter)
  );

  return Array(WORD_LENGTH)
    .fill()
    .map((_, i) => {
      // If the letter is already correct, keep it
      if (gameState.correctLetters[i] !== null) {
        return gameState.correctLetters[i];
      }
      // Randomly choose a letter from the available letters pool and present letters pool
      const letterPool = [...gameState.presentLetters, ...availableLetters];
      return letterPool[Math.floor(Math.random() * letterPool.length)];
    })
    .join("");
}

async function makeGuess(guessWord) {
  const response = await axios.get(API_URL, {
    params: { guess: guessWord, size: WORD_LENGTH, seed: SEED },
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
  return isCorrect;
}

async function playWordle() {
  const startTime = Date.now();
  let attempt = 0;
  let isCorrect = false;

  while (!isCorrect && attempt < MAX_ATTEMPTS) {
    attempt++;
    const guessWord = generateGuessWord(gameState);
    console.log(`Attempt ${attempt}: ${guessWord}`);

    try {
      const result = await makeGuess(guessWord);
      isCorrect = updateGameState(gameState, result);
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      break;
    }
  }

  if (isCorrect) {
    const correctWord = gameState.correctLetters.join("");
    console.log(`Correct word: ${correctWord}, attempts: ${attempt}`);
    console.log(`Time: ${Date.now() - startTime}ms`);
  } else {
    console.log(`Failed to guess the word after ${attempt} attempts.`);
  }
}

playWordle();
