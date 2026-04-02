import { RetryPolicy } from './retry_policy.js';

export class HybridScraper {
  constructor({ retryPolicy = new RetryPolicy() } = {}) {
    this.retryPolicy = retryPolicy;
  }

  async scrape(connector, context = {}) {
    const httpAttempt = () => connector.fetchHttp(context);
    const browserAttempt = () => connector.fetchBrowser(context);

    try {
      const response = await this.retryPolicy.execute(httpAttempt);
      if (this._selectorsBroken(response.html, connector.smokeSelectors)) {
        const error = new Error('HTTP selector mismatch; escalating to browser');
        error.retryable = false;
        throw error;
      }
      return connector.parse(context, response.html);
    } catch (httpError) {
      const browserResponse = await this.retryPolicy.execute(browserAttempt);
      return connector.parse(context, browserResponse.html);
    }
  }

  _selectorsBroken(html = '', selectors = []) {
    if (!selectors || selectors.length === 0) return false;

    return selectors.some((selector) => {
      if (selector.startsWith('#')) {
        return (
          !html.includes(`id="${selector.slice(1)}"`) &&
          !html.includes(`id='${selector.slice(1)}'`)
        );
      }

      if (selector.startsWith('.')) {
        return (
          !html.includes(`class="${selector.slice(1)}`) &&
          !html.includes(`class='${selector.slice(1)}`)
        );
      }

      return !html.includes(`<${selector}`);
    });
  }
}
