const test = require('node:test');
const assert = require('node:assert/strict');

const { buildOperationalDiagnostics } = require('./operational-diagnostics');

test('buildOperationalDiagnostics retorna ok sem alertas em snapshot saudavel', () => {
  const report = buildOperationalDiagnostics({
    runtime: 'local-server',
    now: () => '2026-07-02T00:00:00.000Z',
    metricsSnapshot: {
      requests: {
        total: 12,
        success: 12,
        error: 0,
        avgMs: 320,
        durationMsMax: 890
      },
      sources: {
        Zoom: {
          total: 12,
          error: 1,
          shortCircuit: 0,
          retriesTotal: 2,
          avgMs: 340,
          durationMsMax: 920,
          errorsByType: {}
        }
      }
    }
  });

  assert.equal(report.status, 'ok');
  assert.equal(report.summary.requestErrorRate, 0);
  assert.equal(report.alerts.length, 0);
});

test('buildOperationalDiagnostics retorna degraded com request error rate elevado', () => {
  const report = buildOperationalDiagnostics({
    runtime: 'local-server',
    metricsSnapshot: {
      requests: {
        total: 20,
        success: 10,
        error: 10,
        avgMs: 400,
        durationMsMax: 1300
      },
      sources: {}
    }
  });

  assert.equal(report.status, 'degraded');
  assert.equal(
    report.alerts.some((alert) => alert.type === 'request_error_rate'),
    true
  );
});

test('buildOperationalDiagnostics prioriza fonte unhealthy no status final', () => {
  const report = buildOperationalDiagnostics({
    runtime: 'local-server',
    metricsSnapshot: {
      requests: {
        total: 6,
        success: 5,
        error: 1,
        avgMs: 210,
        durationMsMax: 700
      },
      sources: {
        Zoom: {
          total: 6,
          error: 4,
          shortCircuit: 2,
          retriesTotal: 5,
          avgMs: 360,
          durationMsMax: 1300,
          errorsByType: { timeout: 4 }
        }
      }
    }
  });

  assert.equal(report.status, 'unhealthy');
  assert.equal(report.sources[0].status, 'unhealthy');
  assert.equal(
    report.alerts.some((alert) => alert.type === 'source_health'),
    true
  );
});
