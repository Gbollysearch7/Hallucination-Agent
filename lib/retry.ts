type RetryOptions = {
  retries?: number;
  delayMs?: number;
  factor?: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  { retries = 2, delayMs = 300, factor = 2 }: RetryOptions = {}
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      return await fn(attempt + 1);
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === retries;

      if (isLastAttempt) {
        break;
      }

      const waitTime = delayMs * Math.pow(factor, attempt);
      await sleep(waitTime);
      attempt += 1;
    }
  }

  throw lastError;
}
