import { disambiguateDuplicateCities, normalizeCityName } from './cityResolver.js';

export function createAutocompleteSession({ cities, viewport = 'desktop' }) {
  let typed = '';
  let selected = null;

  return {
    type(value) {
      typed = value;
      const normalized = normalizeCityName(value);
      return cities.filter((city) => normalizeCityName(city.name).startsWith(normalized));
    },
    select(cityId) {
      selected = cities.find((city) => city.id === cityId) ?? null;
      return selected;
    },
    search() {
      if (!selected) {
        return { ok: false, reason: 'no_selection' };
      }

      const candidate = disambiguateDuplicateCities(typed, cities);
      if (!candidate || candidate.id !== selected.id) {
        return { ok: false, reason: 'selection_mismatch' };
      }

      return {
        ok: true,
        viewport,
        cityId: selected.id,
        cityLabel: `${selected.name}, ${selected.countryCode}`,
      };
    },
  };
}
