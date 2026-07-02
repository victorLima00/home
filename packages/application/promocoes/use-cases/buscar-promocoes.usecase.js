const { construirConsultas, consolidarSources } = require('../../../domain/promocoes');
const { assertPromotionSourcePort } = require('../ports/promotion-source.port');

async function buscarComFallback(source, consultas) {
  const attempts = [];
  let ultimoErro = null;

  for (const consulta of consultas) {
    const resultado = await source.search(consulta);
    const total = Array.isArray(resultado.results) ? resultado.results.length : 0;

    attempts.push({
      query: consulta,
      total,
      error: resultado.error || null
    });

    if (total > 0) {
      return {
        ...resultado,
        source: resultado.source || source.name,
        status: 'success',
        searchUsed: consulta,
        attempts
      };
    }

    if (resultado.error) {
      ultimoErro = resultado.error;
    }
  }

  return {
    source: source.name,
    results: [],
    status: ultimoErro ? 'error' : 'empty',
    error: ultimoErro,
    searchUsed: consultas[0] || '',
    attempts
  };
}

function createBuscarPromocoesUseCase({ sources, now = () => new Date().toISOString() }) {
  if (!Array.isArray(sources) || sources.length === 0) {
    throw new Error('BuscarPromocoesUseCase requer ao menos uma fonte');
  }

  sources.forEach(assertPromotionSourcePort);

  return {
    async execute({ itemName, notes }) {
      if (typeof itemName !== 'string' || itemName.trim().length === 0) {
        throw new Error('itemName obrigatorio para buscar promocoes');
      }

      const consultas = construirConsultas(itemName, notes);
      const queryPrincipal = consultas[0] || itemName;

      const resultados = await Promise.all(
        sources.map((source) => buscarComFallback(source, consultas))
      );

      const sourcesConsolidadas = consolidarSources(itemName, consultas, resultados);

      return {
        query: queryPrincipal,
        consultas,
        timestamp: now(),
        sources: sourcesConsolidadas
      };
    }
  };
}

module.exports = {
  createBuscarPromocoesUseCase
};
