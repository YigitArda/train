export class FareCache {
  constructor(ttlMs = 5 * 60 * 1000) {
    this.ttlMs = ttlMs;
    this.store = new Map();
  }

  set(key, fare, now = Date.now()) {
    this.store.set(key, {
      fare,
      expiresAt: now + this.ttlMs,
    });
  }

  get(key, now = Date.now()) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt <= now) {
      this.store.delete(key);
      return null;
    }

    return entry.fare;
  }

  purgeExpired(now = Date.now()) {
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt <= now) {
        this.store.delete(key);
      }
    }
  }
}

export function buildOfficialOperatorDeepLink(operator, offerId) {
  if (!operator?.deepLinkTemplate) {
    throw new Error('Operator deep-link template is required.');
  }

  return operator.deepLinkTemplate.replace('{offerId}', encodeURIComponent(offerId));
}

export function calculateDelta(previousFare, latestFare) {
  if (previousFare === null || previousFare === undefined || previousFare === latestFare) {
    return null;
  }

  const amount = Math.abs(latestFare - previousFare);
  return {
    amount,
    direction: latestFare > previousFare ? 'artti' : 'azaldi',
    message:
      latestFare > previousFare
        ? `Fiyat ${amount} arttı.`
        : `Fiyat ${amount} azaldı.`,
  };
}

/**
 * Sonuç tıklaması akışı:
 * 1) connector.revalidateFare çağrılır.
 * 2) Fiyat değişimi varsa delta üretilir.
 * 3) Resmi operatör deep-link'i hazırlanır.
 * 4) Cache TTL bazlı temizlenir.
 */
export async function handleResultClick({
  result,
  connector,
  cache,
  now = Date.now(),
}) {
  if (!connector?.revalidateFare) {
    throw new Error('Connector must implement revalidateFare.');
  }

  cache.purgeExpired(now);

  const previousFare = cache.get(result.id, now) ?? result.price;
  const revalidated = await connector.revalidateFare({
    offerId: result.id,
    operatorId: result.operator.id,
    currentFare: result.price,
  });

  const latestFare = revalidated.fare;
  const delta = calculateDelta(previousFare, latestFare);

  cache.set(result.id, latestFare, now);

  return {
    fare: latestFare,
    delta,
    bookingDeepLink: buildOfficialOperatorDeepLink(result.operator, result.id),
    revalidatedAt: now,
  };
}
