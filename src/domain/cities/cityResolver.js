import { normalizeCityToken, normalizeCountryCode } from './cityNormalization.js';

export function resolveToCanonicalCity(catalog, providerResult) {
  const provider = String(providerResult.provider ?? '').trim();
  const refType = providerResult.ref_type === 'station' ? 'station' : 'city';
  const countryCode = normalizeCountryCode(providerResult.country_code);

  const providerRefKey = `${provider}:${refType}:${normalizeCityToken(providerResult.ref_value ?? providerResult.city_name ?? '')}`;
  const byProviderRef = catalog.byProviderRef.get(providerRefKey);
  if (byProviderRef) {
    return {
      city: catalog.byCityId.get(byProviderRef),
      match_method: 'provider_ref',
    };
  }

  const normalizedName = normalizeCityToken(providerResult.city_name ?? providerResult.station_name ?? providerResult.ref_value ?? '');
  const byNameKey = `${countryCode}:${normalizedName}`;
  const cityIds = catalog.searchIndex.get(byNameKey) ?? [];

  if (cityIds.length === 1) {
    return {
      city: catalog.byCityId.get(cityIds[0]),
      match_method: 'iso_name',
    };
  }

  if (cityIds.length > 1) {
    return {
      city: catalog.byCityId.get(cityIds[0]),
      match_method: 'iso_name_ambiguous',
      candidate_city_ids: cityIds,
    };
  }

  return {
    city: null,
    match_method: 'unmatched',
  };
}

export function mapProviderResultsToCanonicalCities(catalog, providerResults) {
  return providerResults.map((row) => {
    const resolved = resolveToCanonicalCity(catalog, row);
    return {
      ...row,
      canonical_city_id: resolved.city?.city_id ?? null,
      canonical_city: resolved.city ?? null,
      city_match_method: resolved.match_method,
      candidate_city_ids: resolved.candidate_city_ids ?? [],
    };
  });
}
