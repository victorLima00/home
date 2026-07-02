const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveSloPolicyFromEnv, buildPromotionsSloReport } = require('./slo-promocoes');

test('resolveSloPolicyFromEnv aplica defaults validos', () => {
  const policy = resolveSloPolicyFromEnv({});

  assert.equal(policy.windowMs, 3600000);
  assert.equal(policy.minRequests, 20);
  assert.equal(policy.availabilityTargetPercent, 99);
});

test('buildPromotionsSloReport retorna insufficient_data abaixo do minimo', () => {
  const report = buildPromotionsSloReport({
    runtime: 'local-server',
    policy: { windowMs: 60000, minRequests: 10, availabilityTargetPercent: 99 },
    windowSnapshot: {
      startedAt: '2026-01-01T00:00:00.000Z',
      endedAt: '2026-01-01T00:01:00.000Z',
      requestTotal: 5,
      requestErrors: 1,
      budgetExceeded: 0,
      avgMs: 200,
      p95Ms: 300,
      maxMs: 500
    }
  });

  assert.equal(report.status, 'insufficient_data');
  assert.equal(report.slo.reason, 'minimum_request_volume_not_reached');
});

test('buildPromotionsSloReport retorna unhealthy quando error budget esgota', () => {
  const report = buildPromotionsSloReport({
    runtime: 'local-server',
    policy: { windowMs: 60000, minRequests: 10, availabilityTargetPercent: 99 },
    windowSnapshot: {
      startedAt: '2026-01-01T00:00:00.000Z',
      endedAt: '2026-01-01T00:01:00.000Z',
      requestTotal: 100,
      requestErrors: 4,
      budgetExceeded: 3,
      avgMs: 380,
      p95Ms: 910,
      maxMs: 1400
    }
  });

  assert.equal(report.status, 'unhealthy');
  assert.equal(report.slo.errorBudgetConsumedPercent, 400);
});

test('buildPromotionsSloReport retorna ok com erro dentro do budget', () => {
  const report = buildPromotionsSloReport({
    runtime: 'local-server',
    policy: { windowMs: 60000, minRequests: 10, availabilityTargetPercent: 99 },
    windowSnapshot: {
      startedAt: '2026-01-01T00:00:00.000Z',
      endedAt: '2026-01-01T00:01:00.000Z',
      requestTotal: 100,
      requestErrors: 0,
      budgetExceeded: 0,
      avgMs: 210,
      p95Ms: 460,
      maxMs: 780
    }
  });

  assert.equal(report.status, 'ok');
  assert.equal(report.slo.errorBudgetConsumedPercent, 0);
});
