import { MockRailConnector } from './connectors/mockRailConnector.js';
import { sortTrips } from './core/searchEngine.js';

const ALL_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya',
  'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik',
  'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum',
  'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir',
  'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkâri', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kırıkkale',
  'Kırklareli', 'Kırşehir', 'Kilis', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa',
  'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye',
  'Rize', 'Sakarya', 'Samsun', 'Şanlıurfa', 'Siirt', 'Sinop', 'Sivas', 'Şırnak',
  'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
  'Paris', 'Londra', 'Berlin', 'Amsterdam'
];

const connector = new MockRailConnector();

const form = document.getElementById('search-form');
const fromNode = document.getElementById('from');
const toNode = document.getElementById('to');
const dateNode = document.getElementById('date');
const sortNode = document.getElementById('sortBy');
const metaNode = document.getElementById('meta');
const resultsNode = document.getElementById('results');

function fillCityOptions() {
  const baseOptions = ['<option value="">Şehir seç</option>'];
  const cityOptions = ALL_CITIES.map((city) => `<option value="${city}">${city}</option>`);

  fromNode.innerHTML = [...baseOptions, ...cityOptions].join('');
  toNode.innerHTML = [...baseOptions, ...cityOptions].join('');

  fromNode.value = 'İstanbul';
  toNode.value = 'Ankara';
}

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
        <a class="card" href="${trip.bookingUrl}" rel="noopener noreferrer">
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

dateNode.valueAsDate = new Date();
fillCityOptions();

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await search();
});

search();
