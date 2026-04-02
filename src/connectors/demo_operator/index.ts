import { BaseConnector } from '../base_connector';
import { normalizeConnectorError } from '../error_normalizer';
import {
  HealthcheckResponse,
  NormalizedTrip,
  SearchTripsRequest,
  SearchTripsResponse,
  StationRef,
} from '../types';

type DemoRawTrip = {
  from: string;
  to: string;
  departureAt: string;
  arrivalAt: string;
  amount: number;
  currency: string;
  cabin: 'first' | 'second' | 'business' | 'economy' | 'sleeper';
  refundable: boolean;
  exchangeable: boolean;
  fareConditions?: string;
  transfers: number;
  deeplink: string;
};

type DemoRawResult = {
  trips: DemoRawTrip[];
};

export class DemoOperatorConnector extends BaseConnector<DemoRawResult> {
  readonly operator = 'demo_operator';

  async searchTrips(_request: SearchTripsRequest): Promise<SearchTripsResponse> {
    try {
      const rawResult: DemoRawResult = { trips: [] };
      return { trips: this.normalize(rawResult) };
    } catch (error) {
      throw normalizeConnectorError(error);
    }
  }

  normalize(rawResult: DemoRawResult): NormalizedTrip[] {
    return rawResult.trips.map((trip) => ({
      origin: this.toStationRef(trip.from),
      destination: this.toStationRef(trip.to),
      departure: trip.departureAt,
      arrival: trip.arrivalAt,
      fare: trip.amount,
      currency: trip.currency,
      class: trip.cabin,
      fareRules: {
        refundable: trip.refundable,
        exchangeable: trip.exchangeable,
        conditions: trip.fareConditions,
      },
      transferCount: trip.transfers,
      operator: this.operator,
      bookingUrl: trip.deeplink,
    }));
  }

  async healthcheck(): Promise<HealthcheckResponse> {
    const start = Date.now();
    return {
      ok: true,
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - start,
      details: 'Demo operator connector reachable',
    };
  }

  private toStationRef(stationCode: string): StationRef {
    if (/^\d+$/.test(stationCode)) {
      return { value: stationCode, kind: 'uic' };
    }

    return { value: stationCode, kind: 'station_id' };
  }
}
