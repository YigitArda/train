import { BaseConnector } from './baseConnector.js';

const TRY_PER_EUR = 40;

const ROUTES = {
  'İstanbul|Ankara': [
    trip('TCDD-IST-ANK-1', '06:00:00', '10:45:00', 285, 0, 'TCDD Taşımacılık', 650, 'TRY', 'https://ebilet.tcddtasimacilik.gov.tr/'),
    trip('TCDD-IST-ANK-2', '12:10:00', '16:55:00', 285, 0, 'TCDD Taşımacılık', 730, 'TRY', 'https://ebilet.tcddtasimacilik.gov.tr/'),
  ],
  'Ankara|Eskişehir': [
    trip('TCDD-ANK-ESK-1', '07:20:00', '08:55:00', 95, 0, 'TCDD Taşımacılık', 310, 'TRY', 'https://ebilet.tcddtasimacilik.gov.tr/'),
    trip('TCDD-ANK-ESK-2', '18:40:00', '20:15:00', 95, 0, 'TCDD Taşımacılık', 340, 'TRY', 'https://ebilet.tcddtasimacilik.gov.tr/'),
  ],
  'Paris|Londra': [
    trip('EST-PAR-LON-1', '08:12:00', '09:39:00', 87, 0, 'Eurostar', 89, 'EUR', 'https://www.eurostar.com/'),
    trip('EST-PAR-LON-2', '14:42:00', '16:09:00', 87, 0, 'Eurostar', 104, 'EUR', 'https://www.eurostar.com/'),
  ],
  'Berlin|Amsterdam': [
    trip('DB-BER-AMS-1', '09:06:00', '15:00:00', 354, 1, 'DB + NS International', 71, 'EUR', 'https://www.nsinternational.com/'),
    trip('DB-BER-AMS-2', '13:06:00', '19:00:00', 354, 1, 'DB + NS International', 82, 'EUR', 'https://www.nsinternational.com/'),
  ],
};

function trip(id, departure, arrival, durationMin, transfers, operator, amount, currency, bookingUrl) {
  return { id, departure, arrival, durationMin, transfers, operator, amount, currency, bookingUrl };
}

function routeKey(from, to) {
  return `${from}|${to}`;
}

function toPriceEur(amount, currency) {
  return currency === 'EUR' ? amount : Number((amount / TRY_PER_EUR).toFixed(2));
}

function toTrip(template, request) {
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
    priceAmount: template.amount,
    priceCurrency: template.currency,
    priceEur: toPriceEur(template.amount, template.currency),
  };
}

export class MockRailConnector extends BaseConnector {
  constructor() {
    super('mock-rail');
  }

  async searchTrips(request) {
    const forward = ROUTES[routeKey(request.from, request.to)] ?? [];
    const reverse = ROUTES[routeKey(request.to, request.from)] ?? [];
    const routeTrips = forward.length ? forward : reverse;
    return routeTrips.map((item) => toTrip(item, request));
  }
}
