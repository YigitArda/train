import { BaseConnector } from './baseConnector.js';

const TRY_PER_EUR = 40;

const CITY_ROUTES = {
  'İstanbul-Ankara': [
    {
      id: 'YHT-ANK-1',
      departure: '06:00:00',
      arrival: '10:45:00',
      durationMin: 285,
      transfers: 0,
      operator: 'TCDD Taşımacılık',
      price: 650,
      currency: 'TRY',
      bookingUrl: 'https://ebilet.tcddtasimacilik.gov.tr/',
    },
    {
      id: 'YHT-ANK-2',
      departure: '12:10:00',
      arrival: '16:55:00',
      durationMin: 285,
      transfers: 0,
      operator: 'TCDD Taşımacılık',
      price: 730,
      currency: 'TRY',
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
      price: 310,
      currency: 'TRY',
      bookingUrl: 'https://ebilet.tcddtasimacilik.gov.tr/',
    },
    {
      id: 'YHT-ESK-2',
      departure: '18:40:00',
      arrival: '20:15:00',
      durationMin: 95,
      transfers: 0,
      operator: 'TCDD Taşımacılık',
      price: 340,
      currency: 'TRY',
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
      price: 89,
      currency: 'EUR',
      bookingUrl: 'https://www.eurostar.com/',
    },
    {
      id: 'EUR-LON-2',
      departure: '14:42:00',
      arrival: '16:09:00',
      durationMin: 87,
      transfers: 0,
      operator: 'Eurostar',
      price: 104,
      currency: 'EUR',
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
      price: 71,
      currency: 'EUR',
      bookingUrl: 'https://www.nsinternational.com/',
    },
    {
      id: 'IC-AMS-2',
      departure: '13:06:00',
      arrival: '19:00:00',
      durationMin: 354,
      transfers: 1,
      operator: 'DB + NS International',
      price: 82,
      currency: 'EUR',
      bookingUrl: 'https://www.nsinternational.com/',
    },
  ],
};

function normalizePriceEur(price, currency) {
  if (currency === 'EUR') {
    return price;
  }

  return Number((price / TRY_PER_EUR).toFixed(2));
}

export class MockRailConnector extends BaseConnector {
  constructor() {
    super('mock-rail');
  }

  async searchTrips(request) {
    const key = `${request.from}-${request.to}`;
    const reverseKey = `${request.to}-${request.from}`;
    const templates = CITY_ROUTES[key] ?? CITY_ROUTES[reverseKey] ?? [];

    return templates.map((trip, index) => ({
      ...trip,
      id: `${trip.id}-${index + 1}`,
      from: request.from,
      to: request.to,
      priceEur: normalizePriceEur(trip.price, trip.currency),
      departure: `${request.date}T${trip.departure}`,
      arrival: `${request.date}T${trip.arrival}`,
    }));
  }
}
