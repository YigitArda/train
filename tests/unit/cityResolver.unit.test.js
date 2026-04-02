import test from 'node:test';
import assert from 'node:assert/strict';

import {
  disambiguateDuplicateCities,
  normalizeCityName,
} from '../../src/search/cityResolver.js';
import { mapProviderResponse } from '../../src/search/providerAdapters.js';

test('unit: city normalization', () => {
  assert.equal(normalizeCityName('  İstanbul  '), 'istanbul');
  assert.equal(normalizeCityName('Londres'), 'london');
});

test('unit: duplicate city disambiguation', () => {
  const city = disambiguateDuplicateCities('Paris', [
    { id: 'paris-tx-us', name: 'Paris', countryCode: 'US' },
    { id: 'paris-fr', name: 'Paris', countryCode: 'FR' },
  ]);

  assert.equal(city.id, 'paris-fr');
});

test('unit: provider response mapping', () => {
  const mapped = mapProviderResponse('primary', {
    trips: [
      {
        id: 't1',
        origin_city_id: 'city_paris_fr',
        destination_city_id: 'city_berlin_de',
        price: { amount: 89, currency: 'EUR' },
      },
    ],
  });

  assert.deepEqual(mapped[0], {
    id: 't1',
    fromCityId: 'city_paris_fr',
    toCityId: 'city_berlin_de',
    amount: 89,
    currency: 'EUR',
  });
});
