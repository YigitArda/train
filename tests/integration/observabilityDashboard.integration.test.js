import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const dashboardPath = new URL('../../dashboards/search-quality.dashboard.json', import.meta.url);

test('integration: production observability dashboard includes required metrics', () => {
  const dashboard = JSON.parse(fs.readFileSync(dashboardPath, 'utf-8'));
  const metrics = dashboard.widgets.map((w) => w.metric);

  assert.ok(metrics.includes('city_select_success_rate'));
  assert.ok(metrics.includes('autocomplete_latency_p95'));
  assert.ok(metrics.includes('search_provider_fallback_rate'));
});
