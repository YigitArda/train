export function sortTrips(trips, sortBy) {
  if (sortBy === 'duration') {
    return [...trips].sort((a, b) => a.durationMin - b.durationMin);
  }
  return [...trips].sort((a, b) => a.priceEur - b.priceEur);
}
