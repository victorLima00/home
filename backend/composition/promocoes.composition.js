const { createBuscarPromocoesUseCase } = require('../../packages/application/promocoes');
const { zoomSource } = require('../adapters/promotion-sources/zoom-source');
const { kabumSource } = require('../adapters/promotion-sources/kabum-source');
const {
  resolveRetryPolicyFromEnv,
  executeWithRetry
} = require('../adapters/promotion-sources/retry-backoff');
const {
  resolveCircuitBreakerPolicyFromEnv,
  createCircuitBreaker
} = require('../adapters/promotion-sources/circuit-breaker');
const {
  resolveTimeoutBudgetPolicyFromEnv,
  resolveSourceTimeoutMs,
  withTimeout
} = require('../adapters/promotion-sources/timeout-budget');
const { normalizeSourceFailure } = require('../adapters/promotion-sources/source-error');
const { createLogger } = require('../observability/logger');
const {
  recordSourceCall,
  recordSourceCircuitEvent
} = require('../observability/promocoes-metrics');

const baseLogger = createLogger({ component: 'promocoes-composition' });
const retryPolicy = resolveRetryPolicyFromEnv(process.env);
const circuitBreakerPolicy = resolveCircuitBreakerPolicyFromEnv(process.env);
const timeoutBudgetPolicy = resolveTimeoutBudgetPolicyFromEnv(process.env);

baseLogger.info('promotion_retry_policy_loaded', retryPolicy);
baseLogger.info('promotion_circuit_breaker_policy_loaded', circuitBreakerPolicy);
baseLogger.info('promotion_timeout_budget_policy_loaded', timeoutBudgetPolicy);

function instrumentSource(source) {
  const circuitBreaker = createCircuitBreaker({
    sourceName: source.name,
    policy: circuitBreakerPolicy
  });
  const sourceTimeoutMs = resolveSourceTimeoutMs({
    sourceName: source.name,
    policy: timeoutBudgetPolicy
  });

  return {
    name: source.name,
    async search(query) {
      const startedAt = Date.now();

      try {
        const retryEvents = [];
        let retryOutcome = null;

        const { result, shortCircuited, beforeState, afterState } = await circuitBreaker.execute(
          async () => {
            retryOutcome = await executeWithRetry({
              policy: retryPolicy,
              operation: async () => {
                try {
                  return await withTimeout(() => source.search(query), sourceTimeoutMs, {
                    timeoutMessage: `Source ${source.name} timed out after ${sourceTimeoutMs}ms`
                  });
                } catch (error) {
                  return normalizeSourceFailure(source.name, error);
                }
              },
              onRetry: ({ retryNumber, delayMs, result: retryResult }) => {
                retryEvents.push({
                  retryNumber,
                  delayMs,
                  errorType: retryResult?.errorType || null,
                  errorCode: retryResult?.errorCode || null
                });

                baseLogger.warn('promotion_source_retry_scheduled', {
                  source: source.name,
                  query,
                  retryNumber,
                  delayMs,
                  sourceTimeoutMs,
                  errorType: retryResult?.errorType || null,
                  errorCode: retryResult?.errorCode || null
                });
              }
            });

            return retryOutcome.result;
          },
          {
            onOpen: () => {
              recordSourceCircuitEvent({ sourceName: source.name, eventType: 'open' });
              baseLogger.warn('promotion_source_circuit_open', {
                source: source.name,
                query
              });
            },
            onHalfOpen: () => {
              recordSourceCircuitEvent({ sourceName: source.name, eventType: 'half_open' });
              baseLogger.info('promotion_source_circuit_half_open', {
                source: source.name,
                query
              });
            },
            onClose: () => {
              recordSourceCircuitEvent({ sourceName: source.name, eventType: 'close' });
              baseLogger.info('promotion_source_circuit_closed', {
                source: source.name,
                query
              });
            },
            onShortCircuit: ({ elapsedOpenMs }) => {
              recordSourceCircuitEvent({ sourceName: source.name, eventType: 'short_circuit' });
              baseLogger.warn('promotion_source_short_circuit', {
                source: source.name,
                query,
                elapsedOpenMs
              });
            }
          }
        );

        const durationMs = Date.now() - startedAt;
        const resultCount = Array.isArray(result?.results) ? result.results.length : 0;
        const status = shortCircuited
          ? 'short_circuit'
          : result?.error
            ? 'error'
            : resultCount > 0
              ? 'success'
              : 'empty';
        const errorType = result?.errorType || null;
        const errorCode = result?.errorCode || null;
        const attempts = retryOutcome?.attempts || 0;
        const retries = retryOutcome?.retries || 0;
        const retryExhausted = retryOutcome?.retryExhausted || false;

        recordSourceCall({
          sourceName: source.name,
          status,
          durationMs,
          resultCount,
          errorType,
          retryCount: retries,
          retryExhausted
        });

        baseLogger.info('promotion_source_call', {
          source: source.name,
          query,
          status,
          durationMs,
          resultCount,
          hasError: Boolean(result?.error),
          errorType,
          errorCode,
          beforeState,
          afterState,
          attempts,
          retries,
          shortCircuited,
          retryExhausted,
          retryEvents,
          sourceTimeoutMs,
          retryable: result?.retryable ?? null,
          httpStatus: result?.httpStatus ?? null
        });

        return result;
      } catch (error) {
        const durationMs = Date.now() - startedAt;

        recordSourceCall({
          sourceName: source.name,
          status: 'error',
          durationMs,
          resultCount: 0
        });

        baseLogger.error('promotion_source_exception', {
          source: source.name,
          query,
          durationMs,
          error
        });

        throw error;
      }
    }
  };
}

function createPromocoesComposition() {
  const buscarPromocoesUseCase = createBuscarPromocoesUseCase({
    sources: [instrumentSource(zoomSource), instrumentSource(kabumSource)]
  });

  return {
    buscarPromocoesUseCase
  };
}

module.exports = {
  createPromocoesComposition
};
