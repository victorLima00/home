const express = require('express');
const cors = require('cors');
const { buscarPromocoes } = require('./backend/services/promocoes-service');
const { createLogger } = require('./backend/observability/logger');
const { toSnapshot, toSloWindowSnapshot } = require('./backend/observability/promocoes-metrics');
const { buildOperationalDiagnostics } = require('./backend/observability/operational-diagnostics');
const {
  resolveSloPolicyFromEnv,
  buildPromotionsSloReport
} = require('./backend/observability/slo-promocoes');
const {
  buildHealthSnapshot,
  buildReadinessReport
} = require('./backend/observability/health-readiness');
const {
  promotionSearchRequestSchema,
  promotionSearchResponseSchema,
  apiErrorSchema
} = require('./packages/contracts/src/promocoes.runtime');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function generateTraceId() {
  return `trace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const appLogger = createLogger({ component: 'backend-http' });
const sloPolicy = resolveSloPolicyFromEnv(process.env);

function sendApiError(res, status, payload) {
  const parsedError = apiErrorSchema.safeParse(payload);
  const body = parsedError.success
    ? parsedError.data
    : {
        code: 'internal_error',
        message: 'Falha ao montar resposta de erro',
        details: parsedError.error.flatten(),
        traceId: generateTraceId()
      };

  return res.status(status).json(body);
}

app.post('/api/buscar-promocoes', async (req, res) => {
  const traceId = generateTraceId();
  const logger = appLogger.child({ traceId, route: '/api/buscar-promocoes' });

  logger.info('request_received', {
    method: req.method
  });

  const parsedRequest = promotionSearchRequestSchema.safeParse(req.body || {});
  if (!parsedRequest.success) {
    logger.warn('request_validation_failed', {
      details: parsedRequest.error.flatten()
    });

    return sendApiError(res, 400, {
      code: 'validation_error',
      message: 'Payload invalido para busca de promocoes',
      details: parsedRequest.error.flatten(),
      traceId
    });
  }

  try {
    const { itemName, notes } = parsedRequest.data;
    const results = await buscarPromocoes(itemName, notes, { traceId });
    const parsedResponse = promotionSearchResponseSchema.safeParse(results);

    if (!parsedResponse.success) {
      logger.warn('response_contract_failed', {
        details: parsedResponse.error.flatten()
      });

      return sendApiError(res, 502, {
        code: 'response_contract_error',
        message: 'Resposta fora do contrato de promocoes',
        details: parsedResponse.error.flatten(),
        traceId
      });
    }

    const totalComResultado = results.sources.filter((source) => source.results.length > 0).length;

    logger.info('request_succeeded', {
      query: results.query,
      totalSources: results.sources.length,
      totalWithResults: totalComResultado
    });

    return res.status(200).json(parsedResponse.data);
  } catch (error) {
    logger.error('request_failed', { error });

    return sendApiError(res, 500, {
      code: 'promotion_search_error',
      message: 'Erro ao buscar promocoes',
      details: { reason: error.message },
      traceId
    });
  }
});

app.get('/health', (req, res) => {
  return res.status(200).json(
    buildHealthSnapshot({
      runtime: 'local-server'
    })
  );
});

app.get('/ready', (req, res) => {
  const readiness = buildReadinessReport({
    runtime: 'local-server',
    metricsSnapshot: toSnapshot()
  });

  const statusCode = readiness.status === 'unhealthy' ? 503 : 200;
  return res.status(statusCode).json(readiness);
});

app.get('/metrics/promocoes', (req, res) => {
  return res.status(200).json(toSnapshot());
});

app.get('/ops/promocoes/summary', (req, res) => {
  const diagnostics = buildOperationalDiagnostics({
    runtime: 'local-server',
    metricsSnapshot: toSnapshot()
  });

  return res.status(200).json(diagnostics);
});

app.get('/ops/promocoes/slo', (req, res) => {
  const windowSnapshot = toSloWindowSnapshot({ windowMs: sloPolicy.windowMs });
  const report = buildPromotionsSloReport({
    runtime: 'local-server',
    policy: sloPolicy,
    windowSnapshot
  });

  const statusCode = report.status === 'unhealthy' ? 503 : 200;
  return res.status(statusCode).json(report);
});

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Servidor de Promoções iniciado!');
  console.log(`📍 Rodando em: http://localhost:${PORT}`);
  console.log(`🔍 Endpoint: POST http://localhost:${PORT}/api/buscar-promocoes`);
  console.log('');
  console.log('Exemplo de request:');
  console.log(
    JSON.stringify(
      {
        itemName: 'Sofá',
        notes: 'azul, 3 lugares'
      },
      null,
      2
    )
  );
  console.log('');
});

process.on('SIGTERM', () => {
  console.log('⛔ SIGTERM recebido. Encerrando...');
  process.exit(0);
});
