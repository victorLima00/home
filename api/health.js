const { toSnapshot } = require('../backend/observability/promocoes-metrics');
const {
  buildHealthSnapshot,
  buildReadinessReport
} = require('../backend/observability/health-readiness');

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

  const mode = String(req.query?.mode || 'health').toLowerCase();
  const metricsSnapshot = toSnapshot();

  if (mode === 'ready' || mode === 'readiness') {
    const readiness = buildReadinessReport({
      runtime: 'serverless',
      metricsSnapshot
    });

    const statusCode = readiness.status === 'unhealthy' ? 503 : 200;
    return res.status(statusCode).json(readiness);
  }

  return res.status(200).json(
    buildHealthSnapshot({
      runtime: 'serverless'
    })
  );
};
