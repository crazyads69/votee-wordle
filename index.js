import { playWordleWithFrequency } from "./wordleWithFrequency.js";
import { playWordleWithPureEntropy } from "./wordleWithPureEntropy.js";
import { playWordleWithGreedy } from "./wordleWithGreedy.js";
import { delay } from "./utils.js";

async function runBenchmark(numGames) {
  const results = {
    entropyWithFrequency: { totalAttempts: 0, successes: 0 },
    pureEntropy: { totalAttempts: 0, successes: 0 },
    greedy: { totalAttempts: 0, successes: 0 },
  };

  for (let i = 0; i < numGames; i++) {
    const seed = Math.floor(Math.random() * 1000000);
    console.log(`Game ${i + 1}, Seed: ${seed}`);

    const frequencyResult = await playWordleWithFrequency(seed);
    results.entropyWithFrequency.totalAttempts += frequencyResult.attempts;
    if (frequencyResult.isCorrect) results.entropyWithFrequency.successes++;

    const pureEntropyResult = await playWordleWithPureEntropy(seed);
    results.pureEntropy.totalAttempts += pureEntropyResult.attempts;
    if (pureEntropyResult.isCorrect) results.pureEntropy.successes++;

    const greedyResult = await playWordleWithGreedy(seed);
    results.greedy.totalAttempts += greedyResult.attempts;
    if (greedyResult.isCorrect) results.greedy.successes++;

    console.log(`Entropy with Frequency: ${frequencyResult.attempts} attempts`);
    console.log(`Pure Entropy: ${pureEntropyResult.attempts} attempts`);
    console.log(`Greedy: ${greedyResult.attempts} attempts`);
    console.log("---");
    await delay(2000);
  }

  console.log("\nResults:");
  console.log("Entropy with Frequency:");
  console.log(
    `  Average attempts: ${
      results.entropyWithFrequency.totalAttempts / numGames
    }`
  );
  console.log(
    `  Success rate: ${
      (results.entropyWithFrequency.successes / numGames) * 100
    }%`
  );

  console.log("\nPure Entropy:");
  console.log(
    `  Average attempts: ${results.pureEntropy.totalAttempts / numGames}`
  );
  console.log(
    `  Success rate: ${(results.pureEntropy.successes / numGames) * 100}%`
  );

  console.log("\nGreedy:");
  console.log(`  Average attempts: ${results.greedy.totalAttempts / numGames}`);
  console.log(
    `  Success rate: ${(results.greedy.successes / numGames) * 100}%`
  );
}

const numGames = 100; // You can adjust this number
runBenchmark(numGames);
