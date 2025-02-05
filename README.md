# Cracking the Wordle Code: My Journey Through the Votee AI Code Test

As I opened the message from Votee AI, my heart raced with excitement. The challenge before me was clear: create a program that could solve Wordle puzzles automatically. With one week to complete the task, I knew I had to dive in headfirst.

---

## Day 1: Understanding the Challenge

I started by thoroughly reading the API documentation provided by Votee. The Wordle-like puzzle seemed straightforward, but I knew that creating an efficient solver would be the real challenge. I decided to break down the problem into smaller, manageable parts.

---

## Day 2-3: Research and Planning

During my research, I stumbled upon an interesting article by [Jake Luebeck about Wordle solvers](https://jluebeck.github.io/posts/WordleSolver). This gave me some valuable insights into different approaches, particularly the use of information theory and entropy to make intelligent guesses.

I decided to implement three different strategies:

- **Entropy with letter frequency**
- **Pure entropy**
- **A greedy approach**

This would allow me to compare their effectiveness and showcase my ability to implement and analyze different algorithms.

---

## Day 4: Setting Up the Project

I created a new Git repository and set up my development environment. I chose to use Node.js for its simplicity and my familiarity with JavaScript. I installed the necessary dependencies, including Axios for making API requests.

---

## Day 5: Implementing the Strategies

I started by implementing the core functions that would be shared across all strategies:

- **`makeGuess`**: Interacts with the Wordle API.
- **`updateGameState`**: Processes the API response and updates the game state.
- **`getPattern`**: Generates the pattern for a guess.

Then, I implemented each strategy in separate files:

- `wordleWithFrequency.js`
- `wordleWithPureEntropy.js`
- `wordleWithGreedy.js`

The most challenging part was implementing the entropy calculation, but I persevered and got it working.

---

## Day 6: Debugging and Optimization

As I tested my code, I encountered a **"socket hang up"** error. This was a crucial moment that tested my problem-solving skills. I realized that I was making too many requests to the API too quickly. To solve this, I implemented a retry mechanism with exponential backoff using Axios interceptors.

I created a `utils.js` file to house these utility functions:

- **`delay`**: Adds a pause between requests.
- **`retryWithDelay`**: Retries failed requests.
- **`axiosWithRetry`**: A custom Axios instance with retry logic.

---

## Day 7: Benchmarking and Final Touches

With all strategies implemented and the retry mechanism in place, I created an `index.js` file to run a benchmark comparing the three approaches. This would not only showcase the effectiveness of each strategy but also demonstrate my ability to analyze and compare different algorithms.

I added detailed comments to my code and created a comprehensive README file explaining how to run the program and interpret the results.

---

## Conclusion

As I zipped up my Git repository and prepared to send it off, I felt a sense of accomplishment. This challenge had pushed me to apply my knowledge of algorithms, API interaction, and error handling in a real-world scenario. I had not only created a working Wordle solver but also implemented multiple strategies and a robust error-handling mechanism.

I was excited to submit my solution and eager to discuss my approach in the potential second-round interview. Regardless of the outcome, I knew that this experience had made me a better programmer and problem-solver.

---

## Tutorial: How to Run the Wordle Solver

1. **Clone the repository to your local machine.**
2. **Navigate to the project directory in your terminal.**
3. **Run `npm install` to install the necessary dependencies.**
4. **To start the benchmark, run:**

   ```bash
   npm start
   # or
   node index.js
