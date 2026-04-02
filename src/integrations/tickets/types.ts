export type Currency = 'USD' | 'EUR' | 'GBP' | 'TRY';

export type PriceBreakdown = {
  base: number;
  taxes: number;
  fees: number;
  total: number;
  currency: Currency;
};

export type NormalizedStation = {
  id: string;
  name: string;
  cityCode: string;
  countryCode: string;
};

export type NormalizedTrip = {
  tripId: string;
  provider: string;
  origin: NormalizedStation;
  destination: NormalizedStation;
  departureAt: string;
  arrivalAt: string;
  durationMinutes: number;
  availableSeats: number;
  price: PriceBreakdown;
};

export type TripSearchRequest = {
  originCityCode: string;
  destinationCityCode: string;
  departureDate: string;
  passengers: number;
};

export type TripSearchResponse = {
  trips: NormalizedTrip[];
  provider: string;
};
