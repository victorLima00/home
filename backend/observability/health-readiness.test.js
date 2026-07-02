const test = require('node:test');
const assert = require('node:assert/strict');

const { buildHealthSnapshot, buildReadinessReport } = require('./health-readiness');

test('buildHealthSnapshot retorna status ok com runtime informado', () => {
  const snapshot = buildHealthSnapshot({
    runtime: 'local-server',
    now: () => '2026-01-01T00:00:00.000Z'
  });

  assert.equal(snapshot.status, 'ok');
  assert.equal(snapshot.runtime, 'local-server');
  assert.equal(snapshot.timestamp, '2026-01-01T00:00:00.000Z');
});

test('buildReadinessReport retorna degraded com erro elevado em fonte', () => {
  const readiness = buildReadinessReport({
    runtime: 'serverless',
    now: () => '2026-01-01T00:00:00.000Z',
    metricsSnapshot: {
      requests: {
        total: 10,
        success: 8,
        error: 2
      },
      sources: {
        Zoom: {
          total: 4,
          success: 1,
          empty: 0,
          error: 3,
          errorsByType: { rate_limit: 2, timeout: 1 }
        }
      }
    }
  });

  assert.equal(readiness.status, 'degraded');
  assert.equal(readiness.runtime, 'serverless');
  assert.equal(readiness.checks.promotions.sourceChecks.Zoom.status, 'degraded');
});

test('buildReadinessReport retorna unhealthy com erro muito alto em requests', () => {
  const readiness = buildReadinessReport({
    runtime: 'local-server',
    metricsSnapshot: {
      requests: {
        total: 10,
        success: 1,
        error: 9
      },
      sources: {}
    }
  });

  assert.equal(readiness.status, 'unhealthy');
  assert.equal(readiness.checks.promotions.status, 'unhealthy');
});
