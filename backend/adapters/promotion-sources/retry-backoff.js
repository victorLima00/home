function toPositiveInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function toNonNegativeNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function resolveRetryPolicyFromEnv(env = process.env) {
  const maxAttempts = toPositiveInt(env.PROMO_RETRY_MAX_ATTEMPTS, 3);
  const baseDelayMs = toPositiveInt(env.PROMO_RETRY_BASE_DELAY_MS, 150);
  const maxDelayMs = toPositiveInt(env.PROMO_RETRY_MAX_DELAY_MS, 1500);
  const jitterRatio = toNonNegativeNumber(env.PROMO_RETRY_JITTER_RATIO, 0.2);

  return {
    maxAttempts,
    baseDelayMs,
    maxDelayMs,
    jitterRatio
  };
}

function shouldRetryResult(result) {
  return Boolean(result?.error) && Boolean(result?.retryable);
}

function calculateBackoffDelayMs(retryNumber, policy, random = Math.random) {
  const expDelay = policy.baseDelayMs * 2 ** Math.max(0, retryNumber - 1);
  const cappedDelay = Math.min(expDelay, policy.maxDelayMs);
  const jitter = cappedDelay * policy.jitterRatio * random();

  return Math.round(cappedDelay + jitter);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executeWithRetry({ operation, policy, onRetry, wait = sleep }) {
  const attemptsLimit = toPositiveInt(policy?.maxAttempts, 3);
  const effectivePolicy = {
    maxAttempts: attemptsLimit,
    baseDelayMs: toPositiveInt(policy?.baseDelayMs, 150),
    maxDelayMs: toPositiveInt(policy?.maxDelayMs, 1500),
    jitterRatio: toNonNegativeNumber(policy?.jitterRatio, 0.2)
  };

  let attempts = 0;

  while (attempts < attemptsLimit) {
    attempts += 1;
    const result = await operation(attempts);
    const retryable = shouldRetryResult(result);

    if (!retryable) {
      return {
        result,
        attempts,
        retries: attempts - 1,
        retryExhausted: false
      };
    }

    if (attempts >= attemptsLimit) {
      return {
        result,
        attempts,
        retries: attempts - 1,
        retryExhausted: true
      };
    }

    const retryNumber = attempts;
    const delayMs = calculateBackoffDelayMs(retryNumber, effectivePolicy);

    if (typeof onRetry === 'function') {
      onRetry({ retryNumber, delayMs, result });
    }

    await wait(delayMs);
  }

  return {
    result: { error: 'retry_loop_terminated', retryable: false },
    attempts,
    retries: Math.max(0, attempts - 1),
    retryExhausted: true
  };
}

module.exports = {
  resolveRetryPolicyFromEnv,
  shouldRetryResult,
  calculateBackoffDelayMs,
  executeWithRetry
};
