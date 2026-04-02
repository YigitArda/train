import test from 'node:test';
import assert from 'node:assert/strict';

import { RetryPolicy } from '../../src/scraping/retry_policy.js';
import { resolveCitySelection } from '../../src/search/cityResolver.js';
import { searchWithFallback } from '../../src/search/providerOrchestrator.js';

test('integration: primary provider fail -> fallback provider success', async () => {
  const primaryProvider = {
    search: async () => {
      throw Object.assign(new Error('primary down'), { statusCode: 503, retryable: true });
    },
  };

  const fallbackProvider = {
    search: async () => ({
      results: [
        {
          offer_id: 'f1',
          origin: { city_id: 'city_london_gb' },
          destination: { city_id: 'city_paris_fr' },
          total_price: 120,
          currency: 'EUR',
        },
      ],
    }),
  };

  const result = await searchWithFallback({ request: {}, primaryProvider, fallbackProvider });
  assert.equal(result.provider, 'fallback');
  assert.equal(result.trips[0].id, 'f1');
});

test('integration: timeout and retry behavior', async () => {
  let attempts = 0;

  const primaryProvider = {
    search: async () => {
      attempts += 1;
      if (attempts < 2) {
        throw Object.assign(new Error('timeout'), { statusCode: 408, retryable: true });
      }
      return {
        trips: [
          {
            id: 'p1',
            origin_city_id: 'city_berlin_de',
            destination_city_id: 'city_paris_fr',
            price: { amount: 99, currency: 'EUR' },
          },
        ],
      };
    },
  };

  const fallbackProvider = { search: async () => ({ results: [] }) };

  const result = await searchWithFallback({
    request: {},
    primaryProvider,
    fallbackProvider,
    retryPolicy: new RetryPolicy({ maxAttempts: 2, baseDelayMs: 1, jitterRatio: 0 }),
  });

  assert.equal(result.provider, 'primary');
  assert.equal(attempts, 2);
});

test('integration: city resolver mismatch scenarios', () => {
  const resolved = resolveCitySelection({
    typedCity: 'Paris, FR',
    selectedSuggestion: { id: 'paris-fr', label: 'Paris, FR' },
    resolver: () => null,
  });

  assert.equal(resolved.status, 'mismatch');
  assert.equal(resolved.reason, 'resolver_returned_empty');
});
