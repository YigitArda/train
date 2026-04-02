const PUNCT_OR_SPACE = /[\s\p{P}\p{S}]+/gu;

export function stripDiacritics(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeCityToken(value) {
  return stripDiacritics(String(value ?? ''))
    .toLowerCase()
    .replace(PUNCT_OR_SPACE, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function normalizeCountryCode(value) {
  return String(value ?? '').trim().toUpperCase();
}

export function buildIsoNameKey(countryCode, cityName) {
  return `${normalizeCountryCode(countryCode)}::${normalizeCityToken(cityName)}`;
}
