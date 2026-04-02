import { buildIsoNameKey, normalizeCityToken } from './cityNormalization.js';
import { toCanonicalCity } from './citySchema.js';

function mergeCities(baseCity, incomingCity) {
  const aliasSet = new Set([
    ...baseCity.aliases,
    ...incomingCity.aliases,
    baseCity.display_name,
    incomingCity.display_name,
  ]);

  const providerKeySet = new Set(baseCity.provider_refs.map((ref) => `${ref.provider}:${ref.ref_type}:${ref.ref_value}`));
  const provider_refs = [...baseCity.provider_refs];

  for (const ref of incomingCity.provider_refs) {
    const key = `${ref.provider}:${ref.ref_type}:${ref.ref_value}`;
    if (!providerKeySet.has(key)) {
      providerKeySet.add(key);
      provider_refs.push(ref);
    }
  }

  return {
    ...baseCity,
    aliases: [...aliasSet].filter(Boolean).sort(),
    provider_refs,
  };
}

export function buildCanonicalCityCatalog(rawCities) {
  const byIsoAndName = new Map();

  for (const rawCity of rawCities) {
    const city = toCanonicalCity(rawCity);
    const dedupeKey = buildIsoNameKey(city.country_code, city.display_name);
    const current = byIsoAndName.get(dedupeKey);

    if (!current) {
      byIsoAndName.set(dedupeKey, city);
      continue;
    }

    byIsoAndName.set(dedupeKey, mergeCities(current, city));
  }

  const cities = [...byIsoAndName.values()].sort((a, b) => a.display_name.localeCompare(b.display_name));

  const byCityId = new Map(cities.map((city) => [city.city_id, city]));
  const byProviderRef = new Map();
  const searchIndex = new Map();

  for (const city of cities) {
    for (const ref of city.provider_refs) {
      byProviderRef.set(`${ref.provider}:${ref.ref_type}:${normalizeCityToken(ref.ref_value)}`, city.city_id);
    }

    const tokens = new Set([city.display_name, city.ascii_name, ...city.aliases]);
    for (const token of tokens) {
      const normalizedToken = normalizeCityToken(token);
      if (!normalizedToken) continue;
      const key = `${city.country_code}:${normalizedToken}`;
      if (!searchIndex.has(key)) {
        searchIndex.set(key, new Set());
      }
      searchIndex.get(key).add(city.city_id);
    }
  }

  const normalizedSearchIndex = new Map(
    [...searchIndex.entries()].map(([key, cityIdSet]) => [key, [...cityIdSet]])
  );

  return { cities, byCityId, byProviderRef, searchIndex: normalizedSearchIndex };
}
