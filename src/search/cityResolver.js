const CITY_ALIASES = new Map([
  ['stambul', 'istanbul'],
  ['constantinople', 'istanbul'],
  ['londres', 'london'],
]);

export function normalizeCityName(input = '') {
  const folded = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s,]/gu, ' ')
    .toLowerCase();

  const compact = folded.replace(/\s+/g, ' ').trim();
  return CITY_ALIASES.get(compact) ?? compact;
}

export function disambiguateDuplicateCities(query, candidates) {
  const normalizedQuery = normalizeCityName(query);
  let matching = candidates.filter(
    (candidate) => normalizeCityName(candidate.name) === normalizedQuery
  );

  if (matching.length === 0) {
    matching = candidates.filter((candidate) =>
      normalizeCityName(candidate.name).startsWith(normalizedQuery)
    );
  }

  if (matching.length <= 1) return matching[0] ?? null;

  const withCountryMatch = matching.find(
    (candidate) => normalizeCityName(`${candidate.name}, ${candidate.countryCode}`) === normalizedQuery
  );

  if (withCountryMatch) return withCountryMatch;

  return [...matching].sort((a, b) => {
    if (a.countryCode === 'FR' && b.countryCode !== 'FR') return -1;
    if (b.countryCode === 'FR' && a.countryCode !== 'FR') return 1;
    return a.id.localeCompare(b.id);
  })[0];
}

export function resolveCitySelection({ typedCity, selectedSuggestion, resolver }) {
  const typed = normalizeCityName(typedCity);
  const selected = selectedSuggestion ? normalizeCityName(selectedSuggestion.label) : null;

  if (!selectedSuggestion || typed !== selected) {
    return { status: 'mismatch', reason: 'typed_city_differs_from_selected_suggestion' };
  }

  const resolved = resolver(selectedSuggestion);
  if (!resolved) {
    return { status: 'mismatch', reason: 'resolver_returned_empty' };
  }

  return { status: 'ok', city: resolved };
}
