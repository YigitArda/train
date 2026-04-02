const test = require('node:test');
const assert = require('node:assert/strict');

const { RetryPolicy } = require('../src/scraping/retry_policy');
const { smokeTestConnectors } = require('../src/connectors/smoke_test');
const { ConnectorRunner } = require('../src/scraping/connector_runner');

test('RetryPolicy computes jittered delay within band', () => {
  const policy = new RetryPolicy({ baseDelayMs: 100, jitterRatio: 0.2, multiplier: 2 });
  const delay = policy.computeDelayMs(3); // 400 +/- 80
  assert.ok(delay >= 320 && delay <= 480);
});

test('smokeTestConnectors detects selector breakages', async () => {
  const reports = await smokeTestConnectors([
    {
      id: 'ok',
      smokeSelectors: ['#title', '.price'],
      fetchHttp: async () => ({ html: `<div id="title"></div><span class="price">9</span>` }),
    },
    {
      id: 'broken',
      smokeSelectors: ['#missing'],
      fetchHttp: async () => ({ html: '<div></div>' }),
    },
  ]);

  assert.equal(reports[0].status, 'pass');
  assert.equal(reports[1].status, 'fail');
  assert.deepEqual(reports[1].missingSelectors, ['#missing']);
});

test('ConnectorRunner returns degraded mode with fallback data', async () => {
  const runner = new ConnectorRunner({
    connectors: [
      {
        id: 'x',
        smokeSelectors: ['#required'],
        redirectUrl: 'https://status.example.com/x',
        lastKnownData: { value: 42 },
        fetchHttp: async () => ({ html: '<div></div>' }),
        fetchBrowser: async () => {
          const err = new Error('browser down');
          err.statusCode = 503;
          throw err;
        },
        parse: async () => ({ value: 99 }),
      },
    ],
  });

  const [result] = await runner.runAll();
  assert.equal(result.mode, 'degraded');
  assert.deepEqual(result.data, { value: 42 });
  assert.equal(result.redirect, 'https://status.example.com/x');
});
