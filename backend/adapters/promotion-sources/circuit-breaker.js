function toPositiveInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function toResultError(sourceName, errorType, errorCode, message) {
  return {
    source: sourceName,
    results: [],
    error: message,
    errorType,
    errorCode,
    retryable: false,
    httpStatus: null
  };
}

function resolveCircuitBreakerPolicyFromEnv(env = process.env) {
  return {
    failureThreshold: toPositiveInt(env.PROMO_CB_FAILURE_THRESHOLD, 3),
    windowMs: toPositiveInt(env.PROMO_CB_WINDOW_MS, 15000),
    openMs: toPositiveInt(env.PROMO_CB_OPEN_MS, 10000)
  };
}

function createCircuitBreaker({ sourceName, policy, now = () => Date.now() }) {
  const effectivePolicy = {
    failureThreshold: toPositiveInt(policy?.failureThreshold, 3),
    windowMs: toPositiveInt(policy?.windowMs, 15000),
    openMs: toPositiveInt(policy?.openMs, 10000)
  };

  let state = 'closed';
  let openedAt = 0;
  let failureTimestamps = [];

  function pruneFailures(currentMs) {
    const cutoff = currentMs - effectivePolicy.windowMs;
    failureTimestamps = failureTimestamps.filter((ts) => ts >= cutoff);
  }

  function open(currentMs) {
    state = 'open';
    openedAt = currentMs;
  }

  function close() {
    state = 'closed';
    openedAt = 0;
    failureTimestamps = [];
  }

  function getState() {
    return state;
  }

  async function execute(operation, hooks = {}) {
    const beforeState = state;
    const currentMs = now();

    if (state === 'open') {
      const elapsedOpenMs = currentMs - openedAt;
      if (elapsedOpenMs < effectivePolicy.openMs) {
        const result = toResultError(
          sourceName,
          'circuit_open',
          'circuit_open',
          `Circuit breaker aberto para ${sourceName}`
        );

        if (typeof hooks.onShortCircuit === 'function') {
          hooks.onShortCircuit({ sourceName, breakerState: 'open', elapsedOpenMs });
        }

        return {
          result,
          shortCircuited: true,
          beforeState,
          afterState: 'open'
        };
      }

      state = 'half_open';
      if (typeof hooks.onHalfOpen === 'function') {
        hooks.onHalfOpen({ sourceName });
      }
    }

    let result;

    try {
      result = await operation();
    } catch (error) {
      result = toResultError(
        sourceName,
        'unexpected',
        'unexpected_source_exception',
        error?.message || `Erro inesperado na fonte ${sourceName}`
      );
    }

    const hasFailure = Boolean(result?.error);
    const observedMs = now();

    if (!hasFailure) {
      if (state === 'half_open' && typeof hooks.onClose === 'function') {
        hooks.onClose({ sourceName, from: 'half_open', to: 'closed' });
      }

      close();

      return {
        result,
        shortCircuited: false,
        beforeState,
        afterState: 'closed'
      };
    }

    if (state === 'half_open') {
      open(observedMs);

      if (typeof hooks.onOpen === 'function') {
        hooks.onOpen({ sourceName, from: 'half_open', to: 'open' });
      }

      return {
        result,
        shortCircuited: false,
        beforeState,
        afterState: 'open'
      };
    }

    pruneFailures(observedMs);
    failureTimestamps.push(observedMs);

    if (failureTimestamps.length >= effectivePolicy.failureThreshold) {
      open(observedMs);

      if (typeof hooks.onOpen === 'function') {
        hooks.onOpen({ sourceName, from: 'closed', to: 'open' });
      }
    }

    return {
      result,
      shortCircuited: false,
      beforeState,
      afterState: state
    };
  }

  return {
    getState,
    execute
  };
}

module.exports = {
  resolveCircuitBreakerPolicyFromEnv,
  createCircuitBreaker
};
