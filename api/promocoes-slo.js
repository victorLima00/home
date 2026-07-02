const { createLogger } = require('../backend/observability/logger');
const { toSloWindowSnapshot } = require('../backend/observability/promocoes-metrics');
const {
  resolveSloPolicyFromEnv,
  buildPromotionsSloReport
} = require('../backend/observability/slo-promocoes');

const appLogger = createLogger({ component: 'api-promocoes-slo' });
const sloPolicy = resolveSloPolicyFromEnv(process.env);

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
    const windowSnapshot = toSloWindowSnapshot({ windowMs: sloPolicy.windowMs });
    const report = buildPromotionsSloReport({
      runtime: 'serverless',
      policy: sloPolicy,
      windowSnapshot
    });

    appLogger.info('promotions_slo_requested', {
      status: report.status,
      availabilityPercent: report.slo.availabilityPercent,
      errorBudgetConsumedPercent: report.slo.errorBudgetConsumedPercent
    });

    return res.status(200).json(report);
  } catch (error) {
    appLogger.error('promotions_slo_failed', { error });

    return res.status(500).json({
      code: 'promotions_slo_error',
      message: 'Erro ao montar relatorio de SLO',
      details: { reason: error.message }
    });
  }
};
