const { buscarPromocoes } = require('../backend/services/promocoes-service');
const {
  promotionSearchRequestSchema,
  promotionSearchResponseSchema,
  apiErrorSchema
} = require('../packages/contracts/src/promocoes.runtime');

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

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return sendApiError(res, 405, {
      code: 'method_not_allowed',
      message: 'Metodo nao permitido',
      details: { allowedMethods: ['POST', 'OPTIONS'] },
      traceId: generateTraceId()
    });
  }

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
};
