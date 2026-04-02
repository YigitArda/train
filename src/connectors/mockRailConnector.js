import { BaseConnector } from './baseConnector.js';

export class MockRailConnector extends BaseConnector {
  constructor() {
    super('mock-rail');
  }

  async searchTrips(request) {
    const seed = `${request.from}-${request.to}-${request.date}`;
    const basePrice = 39 + (seed.length % 30);

    return [
      {
        id: 'T1',
        from: request.from,
        to: request.to,
        departure: `${request.date}T06:10:00`,
        arrival: `${request.date}T11:00:00`,
        durationMin: 290,
        transfers: 1,
        operator: 'DB + NS',
        priceEur: basePrice,
      },
      {
        id: 'T2',
        from: request.from,
        to: request.to,
        departure: `${request.date}T09:25:00`,
        arrival: `${request.date}T14:05:00`,
        durationMin: 280,
        transfers: 0,
        operator: 'Eurostar',
        priceEur: basePrice + 19,
      },
      {
        id: 'T3',
        from: request.from,
        to: request.to,
        departure: `${request.date}T13:20:00`,
        arrival: `${request.date}T19:40:00`,
        durationMin: 380,
        transfers: 2,
        operator: 'SNCF + NS',
        priceEur: basePrice - 8,
      },
    ];
  }
}
