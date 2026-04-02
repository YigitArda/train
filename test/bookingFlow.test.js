import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FareCache,
  buildOfficialOperatorDeepLink,
  calculateDelta,
  handleResultClick,
} from '../src/bookingFlow.js';

test('calculateDelta shows increase and decrease', () => {
  assert.deepEqual(calculateDelta(100, 130), {
    amount: 30,
    direction: 'artti',
    message: 'Fiyat 30 arttı.',
  });

  assert.deepEqual(calculateDelta(130, 100), {
    amount: 30,
    direction: 'azaldi',
    message: 'Fiyat 30 azaldı.',
  });

  assert.equal(calculateDelta(100, 100), null);
});

test('buildOfficialOperatorDeepLink uses operator template', () => {
  const url = buildOfficialOperatorDeepLink(
    { deepLinkTemplate: 'https://operator.example/book?offer={offerId}' },
    'ABC-123'
  );

  assert.equal(url, 'https://operator.example/book?offer=ABC-123');
});

test('FareCache drops expired entries via TTL purge', () => {
  const cache = new FareCache(1000);
  cache.set('offer-1', 200, 1000);

  assert.equal(cache.get('offer-1', 1500), 200);

  cache.purgeExpired(2001);
  assert.equal(cache.get('offer-1', 2001), null);
});

test('handleResultClick revalidates through connector and returns delta + deep link', async () => {
  const cache = new FareCache(60_000);
  cache.set('offer-2', 500, 1000);

  const connectorCalls = [];
  const connector = {
    async revalidateFare(payload) {
      connectorCalls.push(payload);
      return { fare: 450 };
    },
  };

  const result = {
    id: 'offer-2',
    price: 500,
    operator: {
      id: 'op-9',
      deepLinkTemplate: 'https://official-op.example/booking/{offerId}',
    },
  };

  const response = await handleResultClick({
    result,
    connector,
    cache,
    now: 5000,
  });

  assert.deepEqual(connectorCalls, [
    {
      offerId: 'offer-2',
      operatorId: 'op-9',
      currentFare: 500,
    },
  ]);

  assert.deepEqual(response.delta, {
    amount: 50,
    direction: 'azaldi',
    message: 'Fiyat 50 azaldı.',
  });
  assert.equal(response.fare, 450);
  assert.equal(response.bookingDeepLink, 'https://official-op.example/booking/offer-2');
  assert.equal(cache.get('offer-2', 5001), 450);
});
