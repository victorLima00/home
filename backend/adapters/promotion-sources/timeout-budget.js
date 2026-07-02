function toPositiveInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function normalizeSourceKey(sourceName) {
  return String(sourceName || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_');
}

function resolveTimeoutBudgetPolicyFromEnv(env = process.env) {
  const sourceDefaultTimeoutMs = toPositiveInt(env.PROMO_SOURCE_TIMEOUT_MS, 3500);
  const requestBudgetMs = toPositiveInt(env.PROMO_REQUEST_BUDGET_MS, 6500);

  return {
    sourceDefaultTimeoutMs,
    requestBudgetMs,
    sourceOverridesMs: {
      Zoom: toPositiveInt(env.PROMO_SOURCE_TIMEOUT_ZOOM_MS, sourceDefaultTimeoutMs),
      KaBuM: toPositiveInt(env.PROMO_SOURCE_TIMEOUT_KABUM_MS, sourceDefaultTimeoutMs)
    }
  };
}

function resolveSourceTimeoutMs({ policy, sourceName }) {
  const sourceKey = normalizeSourceKey(sourceName);
  const explicitEnvName = `PROMO_SOURCE_TIMEOUT_${sourceKey}_MS`;
  const explicitFromEnv = toPositiveInt(process.env[explicitEnvName], NaN);

  if (Number.isFinite(explicitFromEnv) && explicitFromEnv > 0) {
    return explicitFromEnv;
  }

  if (policy?.sourceOverridesMs?.[sourceName]) {
    return policy.sourceOverridesMs[sourceName];
  }

  return toPositiveInt(policy?.sourceDefaultTimeoutMs, 3500);
}

function withTimeout(operation, timeoutMs, { timeoutMessage } = {}) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const error = new Error(timeoutMessage || `Operation timed out after ${timeoutMs}ms`);
      error.name = 'SourceTimeoutError';
      error.code = 'source_timeout';
      reject(error);
    }, timeoutMs);

    Promise.resolve()
      .then(() => operation())
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

function createRequestBudget({ totalBudgetMs, now = () => Date.now() }) {
  const startedAtMs = now();
  const budgetMs = toPositiveInt(totalBudgetMs, 6500);

  return {
    totalBudgetMs: budgetMs,
    startedAtMs,
    remainingMs() {
      return Math.max(0, budgetMs - (now() - startedAtMs));
    },
    elapsedMs() {
      return Math.max(0, now() - startedAtMs);
    },
    isExceeded() {
      return now() - startedAtMs >= budgetMs;
    }
  };
}

module.exports = {
  resolveTimeoutBudgetPolicyFromEnv,
  resolveSourceTimeoutMs,
  withTimeout,
  createRequestBudget
};
