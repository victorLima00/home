function toPositiveInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function toPositiveNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function round2(value) {
  return Number((value || 0).toFixed(2));
}

function resolveSloPolicyFromEnv(env = process.env) {
  return {
    windowMs: toPositiveInt(env.PROMO_SLO_WINDOW_MS, 60 * 60 * 1000),
    minRequests: toPositiveInt(env.PROMO_SLO_MIN_REQUESTS, 20),
    availabilityTargetPercent: toPositiveNumber(env.PROMO_SLO_TARGET_PERCENT, 99)
  };
}

function buildPromotionsSloReport({
  runtime,
  policy,
  windowSnapshot,
  now = () => new Date().toISOString()
}) {
  const requestTotal = windowSnapshot?.requestTotal || 0;
  const requestErrors = windowSnapshot?.requestErrors || 0;
  const budgetExceeded = windowSnapshot?.budgetExceeded || 0;
  const errorRatePercent = requestTotal ? round2((requestErrors / requestTotal) * 100) : 0;
  const availabilityPercent = requestTotal ? round2(100 - errorRatePercent) : 100;

  const allowedErrorRatePercent = round2(100 - policy.availabilityTargetPercent);
  const burnRate =
    allowedErrorRatePercent > 0 ? round2(errorRatePercent / allowedErrorRatePercent) : 0;
  const errorBudgetConsumedPercent =
    allowedErrorRatePercent > 0
      ? round2((errorRatePercent / allowedErrorRatePercent) * 100)
      : requestErrors > 0
        ? 100
        : 0;

  let status = 'ok';
  let reason = 'within_error_budget';

  if (requestTotal < policy.minRequests) {
    status = 'insufficient_data';
    reason = 'minimum_request_volume_not_reached';
  } else if (errorBudgetConsumedPercent >= 100) {
    status = 'unhealthy';
    reason = 'error_budget_exhausted';
  } else if (errorBudgetConsumedPercent >= 70 || burnRate >= 2) {
    status = 'degraded';
    reason = 'error_budget_burn_high';
  }

  const budgetExceededRatePercent = requestTotal
    ? round2((budgetExceeded / requestTotal) * 100)
    : 0;

  return {
    status,
    timestamp: now(),
    runtime,
    policy,
    window: {
      startedAt: windowSnapshot?.startedAt || null,
      endedAt: windowSnapshot?.endedAt || null,
      requestTotal,
      requestErrors,
      requestSuccess: Math.max(0, requestTotal - requestErrors),
      budgetExceeded,
      budgetExceededRatePercent,
      latency: {
        avgMs: windowSnapshot?.avgMs || 0,
        p95Ms: windowSnapshot?.p95Ms || 0,
        maxMs: windowSnapshot?.maxMs || 0
      }
    },
    slo: {
      availabilityTargetPercent: policy.availabilityTargetPercent,
      availabilityPercent,
      errorRatePercent,
      allowedErrorRatePercent,
      errorBudgetConsumedPercent,
      burnRate,
      reason
    }
  };
}

module.exports = {
  resolveSloPolicyFromEnv,
  buildPromotionsSloReport
};
