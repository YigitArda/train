import test from 'node:test';
import assert from 'node:assert/strict';

import { buildCanonicalCityCatalog } from '../../src/domain/cities/cityCatalog.js';
import { normalizeCityToken } from '../../src/domain/cities/cityNormalization.js';
import { mapProviderResultsToCanonicalCities } from '../../src/domain/cities/cityResolver.js';
import { buildCityCountryLabelIndex } from '../../src/domain/cities/uiLabels.js';
import {
  cities_catalog_version,
  getCitiesCatalog,
  invalidateCitiesCatalog,
} from '../../src/data/cities/citiesCatalog.js';

test('normalizeCityToken handles case, diacritics and punctuation/whitespace', () => {
  assert.equal(normalizeCityToken('  MüNCHEN---Hbf '), 'munchen hbf');
  assert.equal(normalizeCityToken('São   Paulo'), 'sao paulo');
});

test('buildCanonicalCityCatalog dedupes by ISO code + city name', () => {
  const catalog = buildCanonicalCityCatalog([
    {
      city_id: 'city_paris_fr_a',
      display_name: 'Paris',
      ascii_name: 'Paris',
      country_code: 'fr',
      lat: 48.8566,
      lng: 2.3522,
      aliases: ['Paris City'],
      provider_refs: [{ provider: 'sncf', ref_type: 'city', ref_value: 'PAR' }],
    },
    {
      city_id: 'city_paris_fr_b',
      display_name: 'PARIS',
      ascii_name: 'Paris',
      country_code: 'FR',
      lat: 48.8566,
      lng: 2.3522,
      aliases: ['París'],
      provider_refs: [{ provider: 'other', ref_type: 'city', ref_value: 'Paris' }],
    },
  ]);

  assert.equal(catalog.cities.length, 1);
  assert.deepEqual(catalog.cities[0].aliases, ['PARIS', 'Paris', 'Paris City', 'París']);
});

test('resolver maps provider city/station refs to canonical city', () => {
  const catalog = getCitiesCatalog({ forceRefresh: true });
  const mapped = mapProviderResultsToCanonicalCities(catalog, [
    { provider: 'sncf', ref_type: 'station', ref_value: 'Paris Nord', country_code: 'FR' },
    { provider: 'db', city_name: 'Munchen', country_code: 'DE' },
  ]);

  assert.equal(mapped[0].canonical_city_id, 'city_paris_fr');
  assert.equal(mapped[0].city_match_method, 'provider_ref');

  assert.equal(mapped[1].canonical_city_id, 'city_munchen_de');
  assert.equal(mapped[1].city_match_method, 'iso_name');
});

test('UI label enforces country for duplicate names', () => {
  const labels = buildCityCountryLabelIndex([
    { city_id: 'city_paris_fr', display_name: 'Paris', country_code: 'FR' },
    { city_id: 'city_paris_us_tx', display_name: 'Paris', country_code: 'US' },
    { city_id: 'city_berlin_de', display_name: 'Berlin', country_code: 'DE' },
  ]);

  assert.equal(labels.get('city_paris_fr'), 'Paris, FR');
  assert.equal(labels.get('city_paris_us_tx'), 'Paris, US');
  assert.equal(labels.get('city_berlin_de'), 'Berlin');
});

test('catalog versioning and invalidation refreshes cache', () => {
  invalidateCitiesCatalog();
  const a = getCitiesCatalog();
  const b = getCitiesCatalog();
  assert.equal(a, b);

  const c = getCitiesCatalog({ expectedVersion: `${cities_catalog_version}-next` });
  assert.notEqual(c, b);

  invalidateCitiesCatalog();
  const d = getCitiesCatalog();
  assert.notEqual(d, c);
});
