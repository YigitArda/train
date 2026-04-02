export type ProviderRuntimeConfig = {
  timeoutMs: number;
  retryCount: number;
  retryDelayMs: number;
  circuitBreakerFailureThreshold: number;
  circuitBreakerResetMs: number;
};

export type TicketProvidersConfig = {
  multi_enabled: boolean;
  primary: string;
  secondary: string;
  runtime: ProviderRuntimeConfig;
};

export type AppConfig = {
  tickets: {
    providers: TicketProvidersConfig;
  };
};

export const defaultAppConfig: AppConfig = {
  tickets: {
    providers: {
      multi_enabled: false,
      primary: 'provider_a',
      secondary: 'provider_b',
      runtime: {
        timeoutMs: 2_500,
        retryCount: 1,
        retryDelayMs: 200,
        circuitBreakerFailureThreshold: 3,
        circuitBreakerResetMs: 30_000,
      },
    },
  },
};

export function isMultiProviderEnabled(config: AppConfig): boolean {
  return config.tickets.providers.multi_enabled;
}
