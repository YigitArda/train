import { TicketProvider } from '../TicketProvider';
import { toProviderError } from '../provider_errors';
import {
  Currency,
  NormalizedStation,
  NormalizedTrip,
  TripSearchRequest,
  TripSearchResponse,
} from '../types';

type ProviderAStation = {
  station_id: string;
  station_name: string;
  city_code: string;
  country_code: string;
};

type ProviderATrip = {
  id: string;
  from: ProviderAStation;
  to: ProviderAStation;
  departure_time: string;
  arrival_time: string;
  duration_min: number;
  seats: number;
  pricing: {
    base: number;
    taxes: number;
    service_fee: number;
    currency: Currency;
  };
};

export class ProviderAAdapter implements TicketProvider {
  readonly name = 'provider_a';

  async searchTrips(_request: TripSearchRequest, context: { requestId: string }): Promise<TripSearchResponse> {
    try {
      const rawTrips: ProviderATrip[] = [];
      return {
        provider: this.name,
        trips: rawTrips.map((trip) => this.normalizeTrip(trip)),
      };
    } catch (error) {
      throw toProviderError(error, this.name, context.requestId);
    }
  }

  async getCities(_query: string, context: { requestId: string }): Promise<NormalizedStation[]> {
    try {
      const rawStations: ProviderAStation[] = [];
      return rawStations.map((station) => this.normalizeStation(station));
    } catch (error) {
      throw toProviderError(error, this.name, context.requestId);
    }
  }

  async healthCheck(_context: { requestId: string }): Promise<{ ok: boolean; latencyMs: number }> {
    const start = Date.now();
    return { ok: true, latencyMs: Date.now() - start };
  }

  private normalizeTrip(trip: ProviderATrip): NormalizedTrip {
    const fees = trip.pricing.service_fee;
    const total = trip.pricing.base + trip.pricing.taxes + fees;

    return {
      tripId: trip.id,
      provider: this.name,
      origin: this.normalizeStation(trip.from),
      destination: this.normalizeStation(trip.to),
      departureAt: trip.departure_time,
      arrivalAt: trip.arrival_time,
      durationMinutes: trip.duration_min,
      availableSeats: trip.seats,
      price: {
        base: trip.pricing.base,
        taxes: trip.pricing.taxes,
        fees,
        total,
        currency: trip.pricing.currency,
      },
    };
  }

  private normalizeStation(station: ProviderAStation): NormalizedStation {
    return {
      id: station.station_id,
      name: station.station_name,
      cityCode: station.city_code,
      countryCode: station.country_code,
    };
  }
}
