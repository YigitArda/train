import { MockRailConnector } from './connectors/mockRailConnector.js';
import { sortTrips } from './core/searchEngine.js';

const connector = new MockRailConnector();
const form = document.getElementById('search-form');
const resultsNode = document.getElementById('results');
const metaNode = document.getElementById('meta');

document.getElementById('date').valueAsDate = new Date();

function toHHMM(value) {
  return new Date(value).toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function render(trips) {
  if (!trips.length) {
    resultsNode.innerHTML = '<p>Sonuç bulunamadı.</p>';
    return;
  }

  resultsNode.innerHTML = trips
    .map((trip, index) => {
      const tag = index === 0 ? '<span class="badge">Önerilen</span>' : '';
      return `
        <article class="card">
          <div>
            <div class="route">${trip.from} → ${trip.to}</div>
            <div class="meta">${toHHMM(trip.departure)} - ${toHHMM(trip.arrival)} · ${trip.operator}</div>
          </div>
          <div class="meta">Süre: ${trip.durationMin} dk</div>
          <div class="meta">Aktarma: ${trip.transfers}</div>
          <div>
            <div class="price">€${trip.priceEur}</div>
            ${tag}
          </div>
        </article>`;
    })
    .join('');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const request = {
    from: document.getElementById('from').value.trim(),
    to: document.getElementById('to').value.trim(),
    date: document.getElementById('date').value,
  };
  const sortBy = document.getElementById('sortBy').value;

  const rawTrips = await connector.searchTrips(request);
  const trips = sortTrips(rawTrips, sortBy);

  metaNode.textContent = `${trips.length} sefer bulundu`;
  render(trips);
});
