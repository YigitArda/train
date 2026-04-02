import { normalizeCountryCode } from './cityNormalization.js';

/**
 * @typedef {Object} ProviderRef
 * @property {string} provider
 * @property {'city' | 'station'} ref_type
 * @property {string} ref_value
 */

/**
 * @typedef {Object} CanonicalCity
 * @property {string} city_id
 * @property {string} display_name
 * @property {string} ascii_name
 * @property {string} country_code
 * @property {number} lat
 * @property {number} lng
 * @property {string[]} aliases
 * @property {ProviderRef[]} provider_refs
 */

export function toCanonicalCity(raw) {
  const city = {
    city_id: String(raw.city_id ?? '').trim(),
    display_name: String(raw.display_name ?? '').trim(),
    ascii_name: String(raw.ascii_name ?? '').trim(),
    country_code: normalizeCountryCode(raw.country_code),
    lat: Number(raw.lat),
    lng: Number(raw.lng),
    aliases: Array.isArray(raw.aliases) ? raw.aliases.map((alias) => String(alias).trim()).filter(Boolean) : [],
    provider_refs: Array.isArray(raw.provider_refs)
      ? raw.provider_refs
          .map((ref) => ({
            provider: String(ref.provider ?? '').trim(),
            ref_type: ref.ref_type === 'station' ? 'station' : 'city',
            ref_value: String(ref.ref_value ?? '').trim(),
          }))
          .filter((ref) => ref.provider && ref.ref_value)
      : [],
  };

  if (!city.city_id || !city.display_name || !city.country_code) {
    throw new Error(`Invalid canonical city payload: ${JSON.stringify(raw)}`);
  }

  if (!Number.isFinite(city.lat) || !Number.isFinite(city.lng)) {
    throw new Error(`Invalid coordinates for city ${city.city_id}`);
  }

  return city;
}
