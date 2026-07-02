function toPercent(numerator, denominator) {
  if (!denominator) return 0;
  return Number(((numerator / denominator) * 100).toFixed(2));
}

function sourceStatusFromSnapshot(sourceSnapshot) {
  const total = sourceSnapshot?.total || 0;
  const error = sourceSnapshot?.error || 0;
  const shortCircuit = sourceSnapshot?.shortCircuit || 0;
  const errorRate = toPercent(error, total);
  const shortCircuitRate = toPercent(shortCircuit, total);

  if (total >= 3 && (errorRate >= 60 || shortCircuitRate >= 30)) {
    return {
      status: 'unhealthy',
      reason: 'source_failure_rate_high',
      errorRate,
      shortCircuitRate
    };
  }

  if (total >= 3 && (errorRate >= 30 || shortCircuitRate >= 15)) {
    return {
      status: 'degraded',
      reason: 'source_failure_rate_elevated',
      errorRate,
      shortCircuitRate
    };
  }

  return {
    status: 'ok',
    reason: 'source_within_threshold',
    errorRate,
    shortCircuitRate
  };
}

function rankStatus(status) {
  if (status === 'unhealthy') return 3;
  if (status === 'degraded') return 2;
  return 1;
}

function maxStatus(a, b) {
  return rankStatus(a) >= rankStatus(b) ? a : b;
}

function buildOperationalDiagnostics({
  metricsSnapshot,
  runtime,
  now = () => new Date().toISOString()
}) {
  const requests = metricsSnapshot?.requests || {};
  const sourceEntries = Object.entries(metricsSnapshot?.sources || {});

  const requestTotal = requests.total || 0;
  const requestSuccess = requests.success || 0;
  const requestError = requests.error || 0;
  const requestErrorRate = toPercent(requestError, requestTotal);
  const requestSuccessRate = toPercent(requestSuccess, requestTotal);

  let overallStatus = 'ok';
  const alerts = [];

  if (requestTotal >= 10 && requestErrorRate >= 40) {
    overallStatus = maxStatus(overallStatus, 'degraded');
    alerts.push({
      type: 'request_error_rate',
      severity: 'warning',
      message: 'Taxa de erro geral elevada',
      value: requestErrorRate
    });
  }

  if (requestTotal >= 10 && requestErrorRate >= 70) {
    overallStatus = maxStatus(overallStatus, 'unhealthy');
    alerts.push({
      type: 'request_error_rate',
      severity: 'critical',
      message: 'Taxa de erro geral critica',
      value: requestErrorRate
    });
  }

  const sources = sourceEntries.map(([name, sourceSnapshot]) => {
    const diagnosis = sourceStatusFromSnapshot(sourceSnapshot);
    overallStatus = maxStatus(overallStatus, diagnosis.status);

    if (diagnosis.status !== 'ok') {
      alerts.push({
        type: 'source_health',
        severity: diagnosis.status === 'unhealthy' ? 'critical' : 'warning',
        message: `Fonte ${name} com degradacao`,
        source: name,
        errorRate: diagnosis.errorRate,
        shortCircuitRate: diagnosis.shortCircuitRate
      });
    }

    return {
      source: name,
      status: diagnosis.status,
      reason: diagnosis.reason,
      totalCalls: sourceSnapshot.total || 0,
      avgMs: sourceSnapshot.avgMs || 0,
      maxMs: sourceSnapshot.durationMsMax || 0,
      errorRate: diagnosis.errorRate,
      shortCircuitRate: diagnosis.shortCircuitRate,
      retriesTotal: sourceSnapshot.retriesTotal || 0,
      errorsByType: sourceSnapshot.errorsByType || {}
    };
  });

  sources.sort((a, b) => rankStatus(b.status) - rankStatus(a.status));

  return {
    status: overallStatus,
    timestamp: now(),
    runtime,
    summary: {
      requestTotal,
      requestSuccess,
      requestError,
      requestSuccessRate,
      requestErrorRate,
      avgMs: requests.avgMs || 0,
      maxMs: requests.durationMsMax || 0,
      sourceCount: sources.length,
      degradedSources: sources.filter((source) => source.status !== 'ok').length
    },
    sources,
    alerts
  };
}

module.exports = {
  buildOperationalDiagnostics
};
