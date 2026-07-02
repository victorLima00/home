function toPercent(numerator, denominator) {
  if (!denominator) return 0;
  return Number(((numerator / denominator) * 100).toFixed(2));
}

function rankStatus(status) {
  if (status === 'unhealthy') return 3;
  if (status === 'degraded') return 2;
  return 1;
}

function maxStatus(a, b) {
  return rankStatus(a) >= rankStatus(b) ? a : b;
}

function evaluateRequestStatus(requests) {
  const total = requests?.total || 0;
  const error = requests?.error || 0;
  const errorRate = toPercent(error, total);

  if (total >= 5 && errorRate >= 80) {
    return { status: 'unhealthy', errorRate, reason: 'high_request_error_rate' };
  }

  if (total >= 5 && errorRate >= 40) {
    return { status: 'degraded', errorRate, reason: 'elevated_request_error_rate' };
  }

  return { status: 'ok', errorRate, reason: 'request_error_rate_within_threshold' };
}

function evaluateSourceStatus(source) {
  const total = source?.total || 0;
  const error = source?.error || 0;
  const errorRate = toPercent(error, total);

  if (total >= 3 && errorRate >= 80) {
    return { status: 'unhealthy', errorRate, reason: 'high_source_error_rate' };
  }

  if (total >= 3 && errorRate >= 50) {
    return { status: 'degraded', errorRate, reason: 'elevated_source_error_rate' };
  }

  return { status: 'ok', errorRate, reason: 'source_error_rate_within_threshold' };
}

function buildReadinessReport({ runtime, metricsSnapshot, now = () => new Date().toISOString() }) {
  const timestamp = now();
  const requests = metricsSnapshot?.requests || {};
  const sources = metricsSnapshot?.sources || {};

  let overallStatus = 'ok';

  const requestCheck = evaluateRequestStatus(requests);
  overallStatus = maxStatus(overallStatus, requestCheck.status);

  const sourceChecks = Object.fromEntries(
    Object.entries(sources).map(([sourceName, sourceData]) => {
      const sourceCheck = evaluateSourceStatus(sourceData);
      overallStatus = maxStatus(overallStatus, sourceCheck.status);

      return [
        sourceName,
        {
          status: sourceCheck.status,
          errorRate: sourceCheck.errorRate,
          reason: sourceCheck.reason,
          totalCalls: sourceData.total || 0,
          errorsByType: sourceData.errorsByType || {}
        }
      ];
    })
  );

  const uptimeSec = Number(process.uptime().toFixed(2));

  return {
    status: overallStatus,
    timestamp,
    runtime,
    checks: {
      process: {
        status: 'ok',
        uptimeSec,
        nodeVersion: process.version
      },
      promotions: {
        status: requestCheck.status,
        requestErrorRate: requestCheck.errorRate,
        reason: requestCheck.reason,
        totalRequests: requests.total || 0,
        sourceChecks
      }
    }
  };
}

function buildHealthSnapshot({ runtime, now = () => new Date().toISOString() }) {
  return {
    status: 'ok',
    timestamp: now(),
    runtime,
    uptimeSec: Number(process.uptime().toFixed(2))
  };
}

module.exports = {
  buildHealthSnapshot,
  buildReadinessReport
};
