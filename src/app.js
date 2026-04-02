import { MockRailConnector } from './connectors/mockRailConnector.js';
import { sortTrips } from './core/searchEngine.js';

const CITIES = ['İstanbul', 'Ankara', 'Eskişehir', 'Paris', 'Londra', 'Berlin', 'Amsterdam'];

const connector = new MockRailConnector();
const form = document.getElementById('search-form');
const resultsNode = document.getElementById('results');
const metaNode = document.getElementById('meta');
const fromNode = document.getElementById('from');
const toNode = document.getElementById('to');
const dateNode = document.getElementById('date');

dateNode.valueAsDate = new Date();

function formatPrice(trip) {
  const formatter = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: trip.currency,
    maximumFractionDigits: 0,
  });

  return formatter.format(trip.price);
}

function populateCities() {
  CITIES.forEach((city) => {
    const fromOption = document.createElement('option');
    fromOption.value = city;
    fromOption.textContent = city;

    const toOption = document.createElement('option');
    toOption.value = city;
    toOption.textContent = city;

    fromNode.appendChild(fromOption);
    toNode.appendChild(toOption);
  });

  fromNode.value = 'İstanbul';
  toNode.value = 'Ankara';
}

function toHHMM(value) {
  return new Date(value).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function render(trips) {
  if (!trips.length) {
    resultsNode.innerHTML = '<p>Bu şehir çifti için doğrulanmış bilet bulunamadı.</p>';
    return;
  }

  resultsNode.innerHTML = trips
    .map((trip, index) => {
      const tag = index === 0 ? '<span class="badge">Önerilen</span>' : '';
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
            ${tag}
          </div>
        </a>`;
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
    metaNode.textContent = 'Lütfen farklı iki şehir seçin';
    render([]);
    return;
  }

  const sortBy = document.getElementById('sortBy').value;
  const rawTrips = await connector.searchTrips(request);
  const trips = sortTrips(rawTrips, sortBy);

  metaNode.textContent = `${trips.length} doğrulanmış sefer bulundu`;
  render(trips);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await runSearch();
});

populateCities();
runSearch();
