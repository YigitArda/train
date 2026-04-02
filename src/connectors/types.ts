export type StationRef = {
  value: string;
  kind: 'uic' | 'station_id';
};

export type FareClass = 'first' | 'second' | 'business' | 'economy' | 'sleeper';

export type FareRules = {
  refundable: boolean;
  exchangeable: boolean;
  conditions?: string;
};

export type NormalizedTrip = {
  origin: StationRef;
  destination: StationRef;
  departure: string; // ISO-8601 timezone-aware datetime
  arrival: string; // ISO-8601 timezone-aware datetime
  fare: number;
  currency: string;
  class: FareClass;
  fareRules: FareRules;
  transferCount: number;
  operator: string;
  bookingUrl: string;
};

export type SearchTripsRequest = {
  origin: StationRef;
  destination: StationRef;
  departureDate: string; // YYYY-MM-DD
  passengers?: number;
};

export type SearchTripsResponse = {
  trips: NormalizedTrip[];
};

export type HealthcheckResponse = {
  ok: boolean;
  checkedAt: string;
  latencyMs?: number;
  details?: string;
};

export type ConnectorErrorCode =
  | 'timeout'
  | 'blocked'
  | 'changed_dom'
  | 'sold_out'
  | 'unknown';

export type NormalizedConnectorError = {
  code: ConnectorErrorCode;
  message: string;
  retryable: boolean;
  cause?: unknown;
};
