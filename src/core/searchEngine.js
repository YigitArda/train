function getComparablePrice(trip) {
  if (Number.isFinite(trip.priceEur)) {
    return trip.priceEur;
  }

  if (Number.isFinite(trip.price)) {
    return trip.price;
  }

  if (Number.isFinite(trip.priceTry)) {
    return trip.priceTry;
  }

  return Number.POSITIVE_INFINITY;
}

export function sortTrips(trips, sortBy) {
  if (sortBy === 'duration') {
    return [...trips].sort((a, b) => a.durationMin - b.durationMin);
  }

  return [...trips].sort((a, b) => getComparablePrice(a) - getComparablePrice(b));
}
