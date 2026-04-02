import { BaseConnector } from './baseConnector.js';

const CITY_ROUTES = {
  'İstanbul-Ankara': [
    {
      id: 'YHT-ANK-1',
      departure: '06:00:00',
      arrival: '10:45:00',
      durationMin: 285,
      transfers: 0,
      operator: 'TCDD Taşımacılık',
      priceTry: 650,
      bookingUrl: 'https://ebilet.tcddtasimacilik.gov.tr/',
    },
    {
      id: 'YHT-ANK-2',
      departure: '12:10:00',
      arrival: '16:55:00',
      durationMin: 285,
      transfers: 0,
      operator: 'TCDD Taşımacılık',
      priceTry: 730,
      bookingUrl: 'https://ebilet.tcddtasimacilik.gov.tr/',
    },
  ],
  'Ankara-Eskişehir': [
    {
      id: 'YHT-ESK-1',
      departure: '07:20:00',
      arrival: '08:55:00',
      durationMin: 95,
      transfers: 0,
      operator: 'TCDD Taşımacılık',
      priceTry: 310,
      bookingUrl: 'https://ebilet.tcddtasimacilik.gov.tr/',
    },
    {
      id: 'YHT-ESK-2',
      departure: '18:40:00',
      arrival: '20:15:00',
      durationMin: 95,
      transfers: 0,
      operator: 'TCDD Taşımacılık',
      priceTry: 340,
      bookingUrl: 'https://ebilet.tcddtasimacilik.gov.tr/',
    },
  ],
  'Paris-Londra': [
    {
      id: 'EUR-LON-1',
      departure: '08:12:00',
      arrival: '09:39:00',
      durationMin: 87,
      transfers: 0,
      operator: 'Eurostar',
      priceTry: 3650,
      bookingUrl: 'https://www.eurostar.com/',
    },
    {
      id: 'EUR-LON-2',
      departure: '14:42:00',
      arrival: '16:09:00',
      durationMin: 87,
      transfers: 0,
      operator: 'Eurostar',
      priceTry: 4250,
      bookingUrl: 'https://www.eurostar.com/',
    },
  ],
  'Berlin-Amsterdam': [
    {
      id: 'IC-AMS-1',
      departure: '09:06:00',
      arrival: '15:00:00',
      durationMin: 354,
      transfers: 1,
      operator: 'DB + NS International',
      priceTry: 2890,
      bookingUrl: 'https://www.nsinternational.com/',
    },
    {
      id: 'IC-AMS-2',
      departure: '13:06:00',
      arrival: '19:00:00',
      durationMin: 354,
      transfers: 1,
      operator: 'DB + NS International',
      priceTry: 3320,
      bookingUrl: 'https://www.nsinternational.com/',
    },
  ],
};

export class MockRailConnector extends BaseConnector {
  constructor() {
    super('mock-rail');
  }

  async searchTrips(request) {
    const key = `${request.from}-${request.to}`;
    const templates = CITY_ROUTES[key] ?? [];

    return templates.map((trip) => ({
      ...trip,
      from: request.from,
      to: request.to,
      departure: `${request.date}T${trip.departure}`,
      arrival: `${request.date}T${trip.arrival}`,
    }));
  }
}
