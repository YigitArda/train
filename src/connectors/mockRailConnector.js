import { BaseConnector } from './baseConnector.js';

const TRY_PER_EUR = 40;

const ROUTE_DATA = {
  'İstanbul|Ankara': [
    {
      id: 'TCDD-IST-ANK-1',
      departure: '06:00:00',
      arrival: '10:45:00',
      durationMin: 285,
      transfers: 0,
      operator: 'TCDD Taşımacılık',
      bookingUrl: 'https://ebilet.tcddtasimacilik.gov.tr/',
      price: { amount: 650, currency: 'TRY' },
    },
    {
      id: 'TCDD-IST-ANK-2',
      departure: '12:10:00',
      arrival: '16:55:00',
      durationMin: 285,
      transfers: 0,
      operator: 'TCDD Taşımacılık',
      bookingUrl: 'https://ebilet.tcddtasimacilik.gov.tr/',
      price: { amount: 730, currency: 'TRY' },
    },
  ],
  'Ankara|Eskişehir': [
    {
      id: 'TCDD-ANK-ESK-1',
      departure: '07:20:00',
      arrival: '08:55:00',
      durationMin: 95,
      transfers: 0,
      operator: 'TCDD Taşımacılık',
      bookingUrl: 'https://ebilet.tcddtasimacilik.gov.tr/',
      price: { amount: 310, currency: 'TRY' },
    },
    {
      id: 'TCDD-ANK-ESK-2',
      departure: '18:40:00',
      arrival: '20:15:00',
      durationMin: 95,
      transfers: 0,
      operator: 'TCDD Taşımacılık',
      bookingUrl: 'https://ebilet.tcddtasimacilik.gov.tr/',
      price: { amount: 340, currency: 'TRY' },
    },
  ],
  'Paris|Londra': [
    {
      id: 'EUROSTAR-PAR-LON-1',
      departure: '08:12:00',
      arrival: '09:39:00',
      durationMin: 87,
      transfers: 0,
      operator: 'Eurostar',
      bookingUrl: 'https://www.eurostar.com/',
      price: { amount: 89, currency: 'EUR' },
    },
    {
      id: 'EUROSTAR-PAR-LON-2',
      departure: '14:42:00',
      arrival: '16:09:00',
      durationMin: 87,
      transfers: 0,
      operator: 'Eurostar',
      bookingUrl: 'https://www.eurostar.com/',
      price: { amount: 104, currency: 'EUR' },
    },
  ],
  'Berlin|Amsterdam': [
    {
      id: 'DB-NS-BER-AMS-1',
      departure: '09:06:00',
      arrival: '15:00:00',
      durationMin: 354,
      transfers: 1,
      operator: 'DB + NS International',
      bookingUrl: 'https://www.nsinternational.com/',
      price: { amount: 71, currency: 'EUR' },
    },
    {
      id: 'DB-NS-BER-AMS-2',
      departure: '13:06:00',
      arrival: '19:00:00',
      durationMin: 354,
      transfers: 1,
      operator: 'DB + NS International',
      bookingUrl: 'https://www.nsinternational.com/',
      price: { amount: 82, currency: 'EUR' },
    },
  ],
};

function routeKey(from, to) {
  return `${from}|${to}`;
}

function toPriceEur(amount, currency) {
  if (currency === 'EUR') return amount;
  return Number((amount / TRY_PER_EUR).toFixed(2));
}

function hydrateTrip(template, request) {
  const { amount, currency } = template.price;
  return {
    id: template.id,
    from: request.from,
    to: request.to,
    departure: `${request.date}T${template.departure}`,
    arrival: `${request.date}T${template.arrival}`,
    durationMin: template.durationMin,
    transfers: template.transfers,
    operator: template.operator,
    bookingUrl: template.bookingUrl,
    priceAmount: amount,
    priceCurrency: currency,
    priceEur: toPriceEur(amount, currency),
  };
}

export class MockRailConnector extends BaseConnector {
  constructor() {
    super('mock-rail');
  }

  async searchTrips(request) {
    const direct = ROUTE_DATA[routeKey(request.from, request.to)] ?? [];
    const reverse = ROUTE_DATA[routeKey(request.to, request.from)] ?? [];
    const source = direct.length ? direct : reverse;

    return source.map((trip) => hydrateTrip(trip, request));
  }
}
