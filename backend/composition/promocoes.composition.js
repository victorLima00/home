const { createBuscarPromocoesUseCase } = require('../../packages/application/promocoes');
const { zoomSource } = require('../adapters/promotion-sources/zoom-source');
const { kabumSource } = require('../adapters/promotion-sources/kabum-source');
const {
  resolveRetryPolicyFromEnv,
  executeWithRetry
} = require('../adapters/promotion-sources/retry-backoff');
const { createLogger } = require('../observability/logger');
const { recordSourceCall } = require('../observability/promocoes-metrics');

const baseLogger = createLogger({ component: 'promocoes-composition' });
const retryPolicy = resolveRetryPolicyFromEnv(process.env);

baseLogger.info('promotion_retry_policy_loaded', retryPolicy);

function instrumentSource(source) {
  return {
    name: source.name,
    async search(query) {
      const startedAt = Date.now();

      try {
        const retryEvents = [];

        const { result, attempts, retries, retryExhausted } = await executeWithRetry({
          policy: retryPolicy,
          operation: async () => source.search(query),
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
              errorType: retryResult?.errorType || null,
              errorCode: retryResult?.errorCode || null
            });
          }
        });

        const durationMs = Date.now() - startedAt;
        const resultCount = Array.isArray(result?.results) ? result.results.length : 0;
        const status = result?.error ? 'error' : resultCount > 0 ? 'success' : 'empty';
        const errorType = result?.errorType || null;
        const errorCode = result?.errorCode || null;

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
          attempts,
          retries,
          retryExhausted,
          retryEvents,
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
