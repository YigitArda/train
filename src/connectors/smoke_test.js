/**
 * Connector smoke test:
 * - fetch via HTTP first
 * - validate required selector hints are present
 * - report potential selector breakages before prod runs
 */
async function smokeTestConnectors(connectors = []) {
  const reports = [];

  for (const connector of connectors) {
    try {
      const response = await connector.fetchHttp({ smokeTest: true });
      const html = response.html || '';
      const missing = (connector.smokeSelectors || []).filter((selector) =>
        !matchesSelectorHint(html, selector)
      );

      reports.push({
        connectorId: connector.id,
        status: missing.length === 0 ? 'pass' : 'fail',
        missingSelectors: missing,
      });
    } catch (error) {
      reports.push({
        connectorId: connector.id,
        status: 'error',
        error: error.message,
      });
    }
  }

  return reports;
}

function matchesSelectorHint(html, selector) {
  if (selector.startsWith('#')) {
    const id = selector.slice(1);
    return html.includes(`id="${id}"`) || html.includes(`id='${id}'`);
  }
  if (selector.startsWith('.')) {
    const cls = selector.slice(1);
    return html.includes(`class="${cls}`) || html.includes(`class='${cls}`);
  }
  return html.includes(`<${selector}`);
}

module.exports = {
  smokeTestConnectors,
};
