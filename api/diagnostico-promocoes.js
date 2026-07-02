const { createLogger } = require('../backend/observability/logger');
const { toSnapshot } = require('../backend/observability/promocoes-metrics');
const { buildOperationalDiagnostics } = require('../backend/observability/operational-diagnostics');

const appLogger = createLogger({ component: 'api-diagnostico-promocoes' });

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      code: 'method_not_allowed',
      message: 'Metodo nao permitido',
      details: { allowedMethods: ['GET', 'OPTIONS'] }
    });
  }

  try {
    const diagnostics = buildOperationalDiagnostics({
      runtime: 'serverless',
      metricsSnapshot: toSnapshot()
    });

    appLogger.info('operational_diagnostics_requested', {
      status: diagnostics.status,
      degradedSources: diagnostics.summary.degradedSources
    });

    return res.status(200).json(diagnostics);
  } catch (error) {
    appLogger.error('operational_diagnostics_failed', { error });

    return res.status(500).json({
      code: 'operational_diagnostics_error',
      message: 'Erro ao gerar diagnostico operacional',
      details: { reason: error.message }
    });
  }
};
