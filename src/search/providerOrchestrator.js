import { RetryPolicy } from '../scraping/retry_policy.js';
import { mapProviderResponse } from './providerAdapters.js';

export async function withTimeout(promise, timeoutMs) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`Timeout after ${timeoutMs}ms`);
      err.statusCode = 408;
      err.retryable = true;
      reject(err);
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

export async function searchWithFallback({
  request,
  primaryProvider,
  fallbackProvider,
  retryPolicy = new RetryPolicy({ maxAttempts: 2, baseDelayMs: 1, jitterRatio: 0 }),
  timeoutMs = 50,
}) {
  try {
    const primaryPayload = await retryPolicy.execute(() => withTimeout(primaryProvider.search(request), timeoutMs));
    return { provider: 'primary', trips: mapProviderResponse('primary', primaryPayload) };
  } catch (_error) {
    const fallbackPayload = await retryPolicy.execute(() =>
      withTimeout(fallbackProvider.search(request), timeoutMs)
    );
    return { provider: 'fallback', trips: mapProviderResponse('fallback', fallbackPayload) };
  }
}
