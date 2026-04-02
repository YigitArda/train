import {
  HealthcheckResponse,
  NormalizedConnectorError,
  NormalizedTrip,
  SearchTripsRequest,
  SearchTripsResponse,
} from './types';

export abstract class BaseConnector<TRawResult = unknown> {
  abstract readonly operator: string;

  abstract searchTrips(request: SearchTripsRequest): Promise<SearchTripsResponse>;

  abstract normalize(rawResult: TRawResult): NormalizedTrip[];

  abstract healthcheck(): Promise<HealthcheckResponse>;

  protected buildError(error: Omit<NormalizedConnectorError, 'retryable'>): NormalizedConnectorError {
    const retryable = error.code === 'timeout' || error.code === 'blocked' || error.code === 'changed_dom';
    return { ...error, retryable };
  }
}
