import { NormalizedConnectorError } from './types';

const TIMEOUT_PATTERNS = ['timeout', 'timed out', 'etimedout'];
const BLOCKED_PATTERNS = ['forbidden', '403', 'captcha', 'blocked'];
const CHANGED_DOM_PATTERNS = ['selector', 'dom', 'parse', 'unexpected html'];
const SOLD_OUT_PATTERNS = ['sold out', 'no seats', 'unavailable'];

function includesOneOf(input: string, patterns: string[]): boolean {
  return patterns.some((pattern) => input.includes(pattern));
}

export function normalizeConnectorError(error: unknown): NormalizedConnectorError {
  const message = error instanceof Error ? error.message : String(error ?? 'Unknown error');
  const lower = message.toLowerCase();

  if (includesOneOf(lower, TIMEOUT_PATTERNS)) {
    return { code: 'timeout', message, retryable: true, cause: error };
  }

  if (includesOneOf(lower, BLOCKED_PATTERNS)) {
    return { code: 'blocked', message, retryable: true, cause: error };
  }

  if (includesOneOf(lower, CHANGED_DOM_PATTERNS)) {
    return { code: 'changed_dom', message, retryable: true, cause: error };
  }

  if (includesOneOf(lower, SOLD_OUT_PATTERNS)) {
    return { code: 'sold_out', message, retryable: false, cause: error };
  }

  return { code: 'unknown', message, retryable: false, cause: error };
}
