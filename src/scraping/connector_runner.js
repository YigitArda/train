import {
  AsyncJobQueue,
  CircuitBreaker,
  RotationPool,
  TokenBucketRateLimiter,
} from './network_controls.js';
import { HybridScraper } from './hybrid_scraper.js';

export class ConnectorRunner {
  constructor({
    connectors = [],
    proxies = [],
    userAgents = [],
    queue = new AsyncJobQueue({ concurrency: 5 }),
    limiter = new TokenBucketRateLimiter({ capacity: 20, refillPerSecond: 10 }),
    circuitFactory = () => new CircuitBreaker(),
    scraper = new HybridScraper(),
  } = {}) {
    this.connectors = connectors;
    this.scraper = scraper;
    this.queue = queue;
    this.limiter = limiter;

    this.proxyPool = new RotationPool(proxies);
    this.uaPool = new RotationPool(userAgents);
    this.circuits = new Map(connectors.map((c) => [c.id, circuitFactory(c)]));
  }

  async runAll(payload = {}) {
    const jobs = this.connectors.map((connector) =>
      this.queue.push(() => this._runConnector(connector, payload))
    );
    return Promise.all(jobs);
  }

  async _runConnector(connector, payload) {
    const circuit = this.circuits.get(connector.id);
    const context = {
      ...payload,
      proxy: this.proxyPool.next(),
      userAgent: this.uaPool.next(),
    };

    try {
      await this.limiter.acquire();
      const data = await circuit.execute(() => this.scraper.scrape(connector, context));
      connector.lastKnownData = data;
      return {
        connectorId: connector.id,
        mode: 'live',
        data,
      };
    } catch (error) {
      return this._degradedMode(connector, error);
    }
  }

  _degradedMode(connector, error) {
    return {
      connectorId: connector.id,
      mode: 'degraded',
      reason: error.code || error.message,
      data: connector.lastKnownData ?? null,
      redirect: connector.redirectUrl || null,
    };
  }
}
