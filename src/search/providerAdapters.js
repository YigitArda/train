export function mapProviderResponse(providerId, payload) {
  if (providerId === 'primary') {
    return payload.trips.map((trip) => ({
      id: trip.id,
      fromCityId: trip.origin_city_id,
      toCityId: trip.destination_city_id,
      amount: trip.price.amount,
      currency: trip.price.currency,
    }));
  }

  if (providerId === 'fallback') {
    return payload.results.map((item) => ({
      id: item.offer_id,
      fromCityId: item.origin.city_id,
      toCityId: item.destination.city_id,
      amount: item.total_price,
      currency: item.currency,
    }));
  }

  throw new Error(`Unknown provider: ${providerId}`);
}

export function validateAdapterContract(mappedTrip) {
  const requiredKeys = ['id', 'fromCityId', 'toCityId', 'amount', 'currency'];
  for (const key of requiredKeys) {
    if (!(key in mappedTrip)) return false;
  }
  return typeof mappedTrip.amount === 'number' && mappedTrip.amount >= 0;
}
