const { createPromocoesComposition } = require('../composition/promocoes.composition');
const { createLogger } = require('../observability/logger');
const {
  recordRequestStart,
  recordRequestSuccess,
  recordRequestError,
  recordRequestBudgetExceeded
} = require('../observability/promocoes-metrics');
const {
  resolveTimeoutBudgetPolicyFromEnv,
  withTimeout,
  createRequestBudget
} = require('../adapters/promotion-sources/timeout-budget');

const { buscarPromocoesUseCase } = createPromocoesComposition();
const timeoutBudgetPolicy = resolveTimeoutBudgetPolicyFromEnv(process.env);

function generateTraceId() {
  return `trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function buscarPromocoes(itemName, notes, context = {}) {
  const traceId = context.traceId || generateTraceId();
  const logger = createLogger({ component: 'promocoes-service', traceId });
  const startedAt = Date.now();

  recordRequestStart();
  logger.info('promotion_search_started', {
    itemName,
    hasNotes: Boolean(notes),
    requestBudgetMs: timeoutBudgetPolicy.requestBudgetMs
  });

  try {
    const requestBudget = createRequestBudget({
      totalBudgetMs: timeoutBudgetPolicy.requestBudgetMs
    });

    const response = await withTimeout(
      () => buscarPromocoesUseCase.execute({ itemName, notes }),
      timeoutBudgetPolicy.requestBudgetMs,
      {
        timeoutMessage: `Promotion request exceeded latency budget (${timeoutBudgetPolicy.requestBudgetMs}ms)`
      }
    );
    const durationMs = Date.now() - startedAt;

    recordRequestSuccess(durationMs);
    logger.info('promotion_search_finished', {
      durationMs,
      sources: response.sources.length,
      sourcesWithResults: response.sources.filter((source) => source.results.length > 0).length,
      requestBudgetMs: requestBudget.totalBudgetMs,
      remainingBudgetMs: requestBudget.remainingMs()
    });

    return response;
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    recordRequestError(durationMs);

    if (error?.code === 'source_timeout' || /exceeded latency budget/i.test(error?.message || '')) {
      recordRequestBudgetExceeded(durationMs);
    }

    logger.error('promotion_search_failed', {
      durationMs,
      error
    });

    throw error;
  }
}

module.exports = {
  buscarPromocoes
};
