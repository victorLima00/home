const { createPromocoesComposition } = require('../composition/promocoes.composition');
const { createLogger } = require('../observability/logger');
const {
  recordRequestStart,
  recordRequestSuccess,
  recordRequestError
} = require('../observability/promocoes-metrics');

const { buscarPromocoesUseCase } = createPromocoesComposition();

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
    hasNotes: Boolean(notes)
  });

  try {
    const response = await buscarPromocoesUseCase.execute({ itemName, notes });
    const durationMs = Date.now() - startedAt;

    recordRequestSuccess(durationMs);
    logger.info('promotion_search_finished', {
      durationMs,
      sources: response.sources.length,
      sourcesWithResults: response.sources.filter((source) => source.results.length > 0).length
    });

    return response;
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    recordRequestError(durationMs);

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
