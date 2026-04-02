import { TicketProvider } from '../../integrations/tickets/TicketProvider';
import { toProviderError } from '../../integrations/tickets/provider_errors';
import { TripSearchRequest, TripSearchResponse } from '../../integrations/tickets/types';
import { AppConfig, isMultiProviderEnabled } from './config';

type CircuitBreakerState = {
  failures: number;
  openedAt?: number;
};

export class TicketSearchService {
  private readonly breakers = new Map<string, CircuitBreakerState>();

  constructor(
    private readonly providers: Map<string, TicketProvider>,
    private readonly config: AppConfig,
  ) {}

  async searchTrips(request: TripSearchRequest, requestId: string): Promise<TripSearchResponse> {
    const { primary, secondary } = this.config.tickets.providers;

    try {
      return await this.callProvider(primary, request, requestId);
    } catch (primaryError) {
      if (!isMultiProviderEnabled(this.config)) {
        throw primaryError;
      }

      this.log('warn', requestId, `Primary provider failed, falling back to ${secondary}`, {
        primary,
        secondary,
        error: primaryError,
      });

      return this.callProvider(secondary, request, requestId);
    }
  }

  private async callProvider(
    providerName: string,
    request: TripSearchRequest,
    requestId: string,
  ): Promise<TripSearchResponse> {
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`Provider not configured: ${providerName}`);
    }

    if (this.isCircuitOpen(providerName)) {
      throw toProviderError(new Error(`Circuit open for provider: ${providerName}`), providerName, requestId);
    }

    const runtime = this.config.tickets.providers.runtime;

    for (let attempt = 0; attempt <= runtime.retryCount; attempt += 1) {
      try {
        this.log('info', requestId, 'Calling provider', { provider: providerName, attempt: attempt + 1 });

        const response = await this.withTimeout(
          provider.searchTrips(request, { requestId }),
          runtime.timeoutMs,
          providerName,
          requestId,
        );

        this.onSuccess(providerName);
        this.log('info', requestId, 'Provider call completed', {
          provider: providerName,
          tripCount: response.trips.length,
        });

        return response;
      } catch (error) {
        const wrappedError = toProviderError(error, providerName, requestId);
        this.onFailure(providerName);

        this.log('error', requestId, 'Provider call failed', {
          provider: providerName,
          errorClass: wrappedError.errorClass,
          attempt: attempt + 1,
          message: wrappedError.message,
        });

        if (attempt === runtime.retryCount) {
          throw wrappedError;
        }

        await this.delay(runtime.retryDelayMs);
      }
    }

    throw toProviderError(new Error('Unexpected provider flow termination'), providerName, requestId);
  }

  private isCircuitOpen(providerName: string): boolean {
    const state = this.breakers.get(providerName);
    if (!state?.openedAt) {
      return false;
    }

    const resetMs = this.config.tickets.providers.runtime.circuitBreakerResetMs;
    if (Date.now() - state.openedAt >= resetMs) {
      this.breakers.set(providerName, { failures: 0 });
      return false;
    }

    return true;
  }

  private onSuccess(providerName: string): void {
    this.breakers.set(providerName, { failures: 0 });
  }

  private onFailure(providerName: string): void {
    const current = this.breakers.get(providerName) ?? { failures: 0 };
    const failures = current.failures + 1;
    const threshold = this.config.tickets.providers.runtime.circuitBreakerFailureThreshold;

    if (failures >= threshold) {
      this.breakers.set(providerName, { failures, openedAt: Date.now() });
      return;
    }

    this.breakers.set(providerName, { failures });
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    providerName: string,
    requestId: string,
  ): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;

    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timer = setTimeout(() => {
            reject(toProviderError(new Error(`Timeout after ${timeoutMs}ms`), providerName, requestId));
          }, timeoutMs);
        }),
      ]);
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private log(level: 'info' | 'warn' | 'error', requestId: string, message: string, details?: object): void {
    const payload = {
      level,
      message,
      requestIdHeader: 'X-Request-ID',
      requestId,
      ...details,
    };

    if (level === 'error') {
      console.error(payload);
      return;
    }

    if (level === 'warn') {
      console.warn(payload);
      return;
    }

    console.info(payload);
  }
}
