import { MockRailConnector } from './connectors/mockRailConnector.js';
import { sortTrips } from './core/searchEngine.js';

const connector = new MockRailConnector();

const form = document.getElementById('search-form');
const fromNode = document.getElementById('from');
const toNode = document.getElementById('to');
const dateNode = document.getElementById('date');
const sortNode = document.getElementById('sortBy');
const metaNode = document.getElementById('meta');
const resultsNode = document.getElementById('results');

dateNode.valueAsDate = new Date();
fromNode.value = 'İstanbul';
toNode.value = 'Ankara';

function formatTime(value) {
  return new Date(value).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function formatPrice(trip) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: trip.priceCurrency,
    maximumFractionDigits: 0,
  }).format(trip.priceAmount);
}

function renderMessage(text) {
  resultsNode.innerHTML = `<p>${text}</p>`;
}

function renderTrips(trips) {
  if (!trips.length) {
    renderMessage('Bu rota için bilet bulunamadı.');
    return;
  }

  resultsNode.innerHTML = trips
    .map(
      (trip, index) => `
        <a class="card" href="${trip.bookingUrl}" target="_blank" rel="noopener noreferrer">
          <div>
            <div class="route">${trip.from} → ${trip.to}</div>
            <div class="meta">${formatTime(trip.departure)} - ${formatTime(trip.arrival)} · ${trip.operator}</div>
          </div>
          <div class="meta">Süre: ${trip.durationMin} dk</div>
          <div class="meta">Aktarma: ${trip.transfers}</div>
          <div>
            <div class="price">${formatPrice(trip)}</div>
            ${index === 0 ? '<span class="badge">Önerilen</span>' : ''}
          </div>
        </a>
      `
    )
    .join('');
}

async function search() {
  const request = {
    from: fromNode.value,
    to: toNode.value,
    date: dateNode.value,
  };

  if (!request.from || !request.to) {
    metaNode.textContent = 'Şehir seçimi gerekli';
    renderMessage('Lütfen kalkış ve varış şehirlerini seçin.');
    return;
  }

  if (request.from === request.to) {
    metaNode.textContent = 'Geçersiz rota';
    renderMessage('Kalkış ve varış şehirleri farklı olmalı.');
    return;
  }

  const trips = sortTrips(await connector.searchTrips(request), sortNode.value);
  metaNode.textContent = `${trips.length} sefer bulundu`;
  renderTrips(trips);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await search();
});

search();
