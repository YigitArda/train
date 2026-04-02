class TokenBucketRateLimiter {
  constructor({ capacity = 20, refillPerSecond = 10 } = {}) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillPerSecond = refillPerSecond;
    this.lastRefill = Date.now();
  }

  _refill() {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    if (elapsedSeconds <= 0) return;

    const refill = elapsedSeconds * this.refillPerSecond;
    this.tokens = Math.min(this.capacity, this.tokens + refill);
    this.lastRefill = now;
  }

  async acquire() {
    while (true) {
      this._refill();
      if (this.tokens >= 1) {
        this.tokens -= 1;
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }
}

class CircuitBreaker {
  constructor({
    failureThreshold = 5,
    recoveryTimeoutMs = 30_000,
    halfOpenMaxInFlight = 1,
  } = {}) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeoutMs = recoveryTimeoutMs;
    this.halfOpenMaxInFlight = halfOpenMaxInFlight;

    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureAt = null;
    this.halfOpenInFlight = 0;
  }

  async execute(task) {
    this._transitionIfNeeded();

    if (this.state === 'OPEN') {
      const err = new Error('Circuit breaker is OPEN');
      err.code = 'CIRCUIT_OPEN';
      throw err;
    }

    if (this.state === 'HALF_OPEN') {
      if (this.halfOpenInFlight >= this.halfOpenMaxInFlight) {
        const err = new Error('Circuit breaker HALF_OPEN budget exhausted');
        err.code = 'CIRCUIT_HALF_OPEN_BUSY';
        throw err;
      }
      this.halfOpenInFlight += 1;
    }

    try {
      const result = await task();
      this._onSuccess();
      return result;
    } catch (error) {
      this._onFailure();
      throw error;
    } finally {
      if (this.state === 'HALF_OPEN') {
        this.halfOpenInFlight = Math.max(0, this.halfOpenInFlight - 1);
      }
    }
  }

  _onSuccess() {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
    }
  }

  _onFailure() {
    this.failureCount += 1;
    this.lastFailureAt = Date.now();

    if (this.state === 'HALF_OPEN' || this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  _transitionIfNeeded() {
    if (this.state !== 'OPEN' || this.lastFailureAt == null) {
      return;
    }

    const elapsed = Date.now() - this.lastFailureAt;
    if (elapsed >= this.recoveryTimeoutMs) {
      this.state = 'HALF_OPEN';
      this.failureCount = 0;
    }
  }
}

class RotationPool {
  constructor(items = []) {
    this.items = [...items];
    this.cursor = 0;
  }

  next() {
    if (this.items.length === 0) {
      return null;
    }

    const item = this.items[this.cursor % this.items.length];
    this.cursor += 1;
    return item;
  }
}

class AsyncJobQueue {
  constructor({ concurrency = 4 } = {}) {
    this.concurrency = concurrency;
    this.running = 0;
    this.jobs = [];
  }

  push(job) {
    return new Promise((resolve, reject) => {
      this.jobs.push({ job, resolve, reject });
      this._drain();
    });
  }

  _drain() {
    while (this.running < this.concurrency && this.jobs.length > 0) {
      const entry = this.jobs.shift();
      this.running += 1;

      Promise.resolve()
        .then(entry.job)
        .then(entry.resolve)
        .catch(entry.reject)
        .finally(() => {
          this.running -= 1;
          this._drain();
        });
    }
  }
}

module.exports = {
  AsyncJobQueue,
  CircuitBreaker,
  RotationPool,
  TokenBucketRateLimiter,
};
