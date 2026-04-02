import { MockRailConnector } from './connectors/mockRailConnector.js';
import { sortTrips } from './core/searchEngine.js';

const connector = new MockRailConnector();

const form = document.getElementById('search-form');
const resultsNode = document.getElementById('results');
const metaNode = document.getElementById('meta');
const fromNode = document.getElementById('from');
const toNode = document.getElementById('to');
const dateNode = document.getElementById('date');
const sortNode = document.getElementById('sortBy');

dateNode.valueAsDate = new Date();

function toHHMM(datetimeValue) {
  return new Date(datetimeValue).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(trip) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: trip.priceCurrency,
    maximumFractionDigits: 0,
  }).format(trip.priceAmount);
}

function renderEmpty(message) {
  resultsNode.innerHTML = `<p>${message}</p>`;
}

function renderTrips(trips) {
  if (!trips.length) {
    renderEmpty('Bu rota için doğrulanmış bilet bulunamadı.');
    return;
  }

  resultsNode.innerHTML = trips
    .map((trip, index) => {
      const recommended = index === 0 ? '<span class="badge">Önerilen</span>' : '';

      return `
        <a class="card" href="${trip.bookingUrl}" target="_blank" rel="noopener noreferrer">
          <div>
            <div class="route">${trip.from} → ${trip.to}</div>
            <div class="meta">${toHHMM(trip.departure)} - ${toHHMM(trip.arrival)} · ${trip.operator}</div>
          </div>
          <div class="meta">Süre: ${trip.durationMin} dk</div>
          <div class="meta">Aktarma: ${trip.transfers}</div>
          <div>
            <div class="price">${formatPrice(trip)}</div>
            ${recommended}
          </div>
        </a>
      `;
    })
    .join('');
}

async function runSearch() {
  const request = {
    from: fromNode.value,
    to: toNode.value,
    date: dateNode.value,
  };

  if (request.from === request.to) {
    metaNode.textContent = 'Lütfen farklı iki şehir seç.';
    renderEmpty('Aynı şehirden aynı şehre bilet gösterilemiyor.');
    return;
  }

  const rawTrips = await connector.searchTrips(request);
  const sortedTrips = sortTrips(rawTrips, sortNode.value);

  metaNode.textContent = `${sortedTrips.length} doğrulanmış sefer bulundu`;
  renderTrips(sortedTrips);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await runSearch();
});

runSearch();
