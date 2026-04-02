import { buildCanonicalCityCatalog } from '../../domain/cities/cityCatalog.js';

export const cities_catalog_version = '2026.04.02';

const canonicalCitySeed = [
  {
    city_id: 'city_paris_fr',
    display_name: 'Paris',
    ascii_name: 'Paris',
    country_code: 'FR',
    lat: 48.8566,
    lng: 2.3522,
    aliases: ['Paris City'],
    provider_refs: [
      { provider: 'sncf', ref_type: 'city', ref_value: 'PAR' },
      { provider: 'sncf', ref_type: 'station', ref_value: 'Paris Nord' },
    ],
  },
  {
    city_id: 'city_paris_us_tx',
    display_name: 'Paris',
    ascii_name: 'Paris',
    country_code: 'US',
    lat: 33.6609,
    lng: -95.5555,
    aliases: ['Paris TX'],
    provider_refs: [{ provider: 'amtrak', ref_type: 'city', ref_value: 'Paris, TX' }],
  },
  {
    city_id: 'city_munchen_de',
    display_name: 'München',
    ascii_name: 'Munchen',
    country_code: 'DE',
    lat: 48.1351,
    lng: 11.582,
    aliases: ['Muenchen', 'Munich'],
    provider_refs: [{ provider: 'db', ref_type: 'city', ref_value: 'Muenchen' }],
  },
];

let cache = {
  version: null,
  catalog: null,
};

export function getCitiesCatalog(options = {}) {
  const { forceRefresh = false, expectedVersion = cities_catalog_version } = options;

  const versionMismatch = cache.version !== expectedVersion;
  if (forceRefresh || versionMismatch || !cache.catalog) {
    cache = {
      version: expectedVersion,
      catalog: buildCanonicalCityCatalog(canonicalCitySeed),
    };
  }

  return cache.catalog;
}

export function invalidateCitiesCatalog() {
  cache = {
    version: null,
    catalog: null,
  };
}
