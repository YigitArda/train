export type ProviderErrorClass = 'provider_error' | 'timeout' | 'rate_limited';

export type ProviderError = Error & {
  errorClass: ProviderErrorClass;
  provider?: string;
  requestId?: string;
  cause?: unknown;
};

const TIMEOUT_PATTERNS = ['timeout', 'timed out', 'etimedout', 'aborterror'];
const RATE_LIMIT_PATTERNS = ['429', 'rate limit', 'too many requests'];

function includesOneOf(input: string, patterns: string[]): boolean {
  return patterns.some((pattern) => input.includes(pattern));
}

export function classifyProviderError(error: unknown): ProviderErrorClass {
  const text = error instanceof Error ? error.message : String(error ?? 'unknown');
  const lower = text.toLowerCase();

  if (includesOneOf(lower, TIMEOUT_PATTERNS)) {
    return 'timeout';
  }

  if (includesOneOf(lower, RATE_LIMIT_PATTERNS)) {
    return 'rate_limited';
  }

  return 'provider_error';
}

export function toProviderError(
  error: unknown,
  provider: string,
  requestId: string,
): ProviderError {
  const message = error instanceof Error ? error.message : String(error ?? 'Unknown provider failure');
  const wrapped = new Error(message) as ProviderError;
  wrapped.errorClass = classifyProviderError(error);
  wrapped.provider = provider;
  wrapped.requestId = requestId;
  wrapped.cause = error;
  return wrapped;
}
