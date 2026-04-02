import { normalizeCityToken } from './cityNormalization.js';

export function buildCityCountryLabelIndex(cities) {
  const counts = new Map();

  for (const city of cities) {
    const key = normalizeCityToken(city.display_name);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const labels = new Map();
  for (const city of cities) {
    const key = normalizeCityToken(city.display_name);
    const hasDuplicateName = (counts.get(key) ?? 0) > 1;
    labels.set(
      city.city_id,
      hasDuplicateName ? `${city.display_name}, ${city.country_code}` : city.display_name
    );
  }

  return labels;
}
