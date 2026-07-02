const { createBuscarPromocoesUseCase } = require('../../packages/application/promocoes');
const { zoomSource } = require('../adapters/promotion-sources/zoom-source');
const { kabumSource } = require('../adapters/promotion-sources/kabum-source');
const { createLogger } = require('../observability/logger');
const { recordSourceCall } = require('../observability/promocoes-metrics');

const baseLogger = createLogger({ component: 'promocoes-composition' });

function instrumentSource(source) {
  return {
    name: source.name,
    async search(query) {
      const startedAt = Date.now();

      try {
        const result = await source.search(query);
        const durationMs = Date.now() - startedAt;
        const resultCount = Array.isArray(result?.results) ? result.results.length : 0;
        const status = result?.error ? 'error' : resultCount > 0 ? 'success' : 'empty';

        recordSourceCall({
          sourceName: source.name,
          status,
          durationMs,
          resultCount
        });

        baseLogger.info('promotion_source_call', {
          source: source.name,
          query,
          status,
          durationMs,
          resultCount,
          hasError: Boolean(result?.error)
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
