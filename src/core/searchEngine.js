function priceForSort(trip) {
  if (Number.isFinite(trip.priceEur)) return trip.priceEur;
  if (Number.isFinite(trip.priceAmount)) return trip.priceAmount;
  return Number.POSITIVE_INFINITY;
}

export function sortTrips(trips, sortBy) {
  if (sortBy === 'duration') {
    return [...trips].sort((a, b) => a.durationMin - b.durationMin);
  }

  return [...trips].sort((a, b) => priceForSort(a) - priceForSort(b));
}
