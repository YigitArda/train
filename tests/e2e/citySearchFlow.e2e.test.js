import test from 'node:test';
import assert from 'node:assert/strict';

import { createAutocompleteSession } from '../../src/search/e2eFlow.js';

const cities = [
  { id: 'paris-fr', name: 'Paris', countryCode: 'FR' },
  { id: 'paris-tx-us', name: 'Paris', countryCode: 'US' },
  { id: 'berlin-de', name: 'Berlin', countryCode: 'DE' },
];

test('e2e: şehir yaz/öneri seç/arama yap akışı', () => {
  const session = createAutocompleteSession({ cities });
  const suggestions = session.type('Ber');
  assert.equal(suggestions.length, 1);

  session.select('berlin-de');
  const result = session.search();

  assert.equal(result.ok, true);
  assert.equal(result.cityId, 'berlin-de');
});

test('e2e: aynı isimli şehir seçimi (Paris, FR vs başka Paris)', () => {
  const session = createAutocompleteSession({ cities });
  session.type('Paris');
  session.select('paris-fr');

  const result = session.search();
  assert.equal(result.ok, true);
  assert.equal(result.cityLabel, 'Paris, FR');
});

test('e2e: mobil görünümde autocomplete seçim stabilitesi', () => {
  const session = createAutocompleteSession({ cities, viewport: 'mobile' });
  for (let i = 0; i < 5; i += 1) {
    session.type('Paris');
    session.select('paris-fr');
    const result = session.search();
    assert.equal(result.ok, true);
    assert.equal(result.viewport, 'mobile');
  }
});
