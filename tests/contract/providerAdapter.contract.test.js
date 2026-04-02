import test from 'node:test';
import assert from 'node:assert/strict';

import {
  mapProviderResponse,
  validateAdapterContract,
} from '../../src/search/providerAdapters.js';

test('contract: provider adapter response schema doğrulaması', () => {
  const mapped = mapProviderResponse('fallback', {
    results: [
      {
        offer_id: 'x1',
        origin: { city_id: 'city_paris_fr' },
        destination: { city_id: 'city_london_gb' },
        total_price: 140,
        currency: 'EUR',
      },
    ],
  });

  assert.equal(mapped.length, 1);
  assert.equal(validateAdapterContract(mapped[0]), true);
});
