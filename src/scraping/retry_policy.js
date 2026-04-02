/**
 * Exponential backoff retry policy with optional jitter.
 */
class RetryPolicy {
  constructor({
    maxAttempts = 5,
    baseDelayMs = 200,
    maxDelayMs = 10_000,
    multiplier = 2,
    jitterRatio = 0.25,
  } = {}) {
    this.maxAttempts = maxAttempts;
    this.baseDelayMs = baseDelayMs;
    this.maxDelayMs = maxDelayMs;
    this.multiplier = multiplier;
    this.jitterRatio = jitterRatio;
  }

  computeDelayMs(attempt) {
    const expDelay = Math.min(
      this.maxDelayMs,
      this.baseDelayMs * Math.pow(this.multiplier, attempt - 1)
    );

    const jitterBand = expDelay * this.jitterRatio;
    const jitter = (Math.random() * 2 - 1) * jitterBand;
    return Math.max(0, Math.floor(expDelay + jitter));
  }

  async execute(fn, shouldRetry = RetryPolicy.defaultShouldRetry) {
    let lastError;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt += 1) {
      try {
        return await fn(attempt);
      } catch (error) {
        lastError = error;
        if (attempt >= this.maxAttempts || !shouldRetry(error, attempt)) {
          throw error;
        }

        const delayMs = this.computeDelayMs(attempt);
        await RetryPolicy.sleep(delayMs);
      }
    }

    throw lastError;
  }

  static defaultShouldRetry(error) {
    if (!error) return false;
    if (error.retryable === true) return true;
    return [408, 425, 429, 500, 502, 503, 504].includes(error.statusCode);
  }

  static sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = {
  RetryPolicy,
};
