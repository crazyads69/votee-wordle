import axios from "axios";

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function retryWithDelay(fn, retries = 3, delayMs = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await delay(delayMs);
    return retryWithDelay(fn, retries - 1, delayMs);
  }
}

export const axiosWithRetry = axios.create();

axiosWithRetry.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.config &&
      error.response &&
      (error.response.status === 429 || error.code === "ECONNABORTED")
    ) {
      await delay(1000);
      return axiosWithRetry(error.config);
    }
    return Promise.reject(error);
  }
);
