import { TicketProvider } from '../TicketProvider';
import { toProviderError } from '../provider_errors';
import {
  Currency,
  NormalizedStation,
  NormalizedTrip,
  TripSearchRequest,
  TripSearchResponse,
} from '../types';

type ProviderBCity = {
  code: string;
  label: string;
  stationRef: string;
  country: string;
};

type ProviderBFare = {
  amount: number;
  vat: number;
  bookingFee: number;
  currency: Currency;
};

type ProviderBJourney = {
  journeyRef: string;
  origin: ProviderBCity;
  destination: ProviderBCity;
  departIso: string;
  arriveIso: string;
  travelTimeMinutes: number;
  remaining: number;
  fare: ProviderBFare;
};

export class ProviderBAdapter implements TicketProvider {
  readonly name = 'provider_b';

  async searchTrips(_request: TripSearchRequest, context: { requestId: string }): Promise<TripSearchResponse> {
    try {
      const rawJourneys: ProviderBJourney[] = [];
      return {
        provider: this.name,
        trips: rawJourneys.map((journey) => this.normalizeJourney(journey)),
      };
    } catch (error) {
      throw toProviderError(error, this.name, context.requestId);
    }
  }

  async getCities(_query: string, context: { requestId: string }): Promise<NormalizedStation[]> {
    try {
      const rawCities: ProviderBCity[] = [];
      return rawCities.map((city) => this.normalizeCity(city));
    } catch (error) {
      throw toProviderError(error, this.name, context.requestId);
    }
  }

  async healthCheck(_context: { requestId: string }): Promise<{ ok: boolean; latencyMs: number }> {
    const start = Date.now();
    return { ok: true, latencyMs: Date.now() - start };
  }

  private normalizeJourney(journey: ProviderBJourney): NormalizedTrip {
    const total = journey.fare.amount + journey.fare.vat + journey.fare.bookingFee;

    return {
      tripId: journey.journeyRef,
      provider: this.name,
      origin: this.normalizeCity(journey.origin),
      destination: this.normalizeCity(journey.destination),
      departureAt: journey.departIso,
      arrivalAt: journey.arriveIso,
      durationMinutes: journey.travelTimeMinutes,
      availableSeats: journey.remaining,
      price: {
        base: journey.fare.amount,
        taxes: journey.fare.vat,
        fees: journey.fare.bookingFee,
        total,
        currency: journey.fare.currency,
      },
    };
  }

  private normalizeCity(city: ProviderBCity): NormalizedStation {
    return {
      id: city.stationRef,
      name: city.label,
      cityCode: city.code,
      countryCode: city.country,
    };
  }
}
