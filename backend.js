const express = require('express');
const cors = require('cors');
const { buscarPromocoes } = require('./backend/services/promocoes-service');
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
  const parsedRequest = promotionSearchRequestSchema.safeParse(req.body || {});
  if (!parsedRequest.success) {
    return sendApiError(res, 400, {
      code: 'validation_error',
      message: 'Payload invalido para busca de promocoes',
      details: parsedRequest.error.flatten(),
      traceId: generateTraceId()
    });
  }

  try {
    const { itemName, notes } = parsedRequest.data;
    const results = await buscarPromocoes(itemName, notes);
    const parsedResponse = promotionSearchResponseSchema.safeParse(results);

    if (!parsedResponse.success) {
      return sendApiError(res, 502, {
        code: 'response_contract_error',
        message: 'Resposta fora do contrato de promocoes',
        details: parsedResponse.error.flatten(),
        traceId: generateTraceId()
      });
    }

    const totalComResultado = results.sources.filter((source) => source.results.length > 0).length;

    console.log(`🔍 Buscando: "${results.query}"`);
    console.log(`✅ Resultados encontrados: ${totalComResultado} fontes`);

    return res.status(200).json(parsedResponse.data);
  } catch (error) {
    console.error('Erro na busca:', error);
    return sendApiError(res, 500, {
      code: 'promotion_search_error',
      message: 'Erro ao buscar promocoes',
      details: { reason: error.message },
      traceId: generateTraceId()
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
