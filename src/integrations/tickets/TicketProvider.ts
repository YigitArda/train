import { NormalizedStation, TripSearchRequest, TripSearchResponse } from './types';

export interface TicketProvider {
  readonly name: string;

  searchTrips(request: TripSearchRequest, context: { requestId: string }): Promise<TripSearchResponse>;

  getCities(query: string, context: { requestId: string }): Promise<NormalizedStation[]>;

  healthCheck(context: { requestId: string }): Promise<{ ok: boolean; latencyMs: number }>;
}
