const test = require('node:test');
const assert = require('node:assert/strict');

const {
  promotionSearchResponseSchema,
  apiErrorSchema
} = require('../../packages/contracts/src/promocoes.runtime');

const serviceModulePath = require.resolve('../../backend/services/promocoes-service');
const handlerModulePath = require.resolve('../../api/buscar-promocoes');

function createMockRes() {
  return {
    headers: {},
    statusCode: 200,
    payload: null,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
    end() {
      this.payload = null;
      return this;
    }
  };
}

async function runHandlerWithMockedService(mockBuscarPromocoes, req) {
  const originalServiceCache = require.cache[serviceModulePath];
  const originalHandlerCache = require.cache[handlerModulePath];

  require.cache[serviceModulePath] = {
    id: serviceModulePath,
    filename: serviceModulePath,
    loaded: true,
    exports: {
      buscarPromocoes: mockBuscarPromocoes
    }
  };

  delete require.cache[handlerModulePath];
  const handler = require('../../api/buscar-promocoes');
  const res = createMockRes();

  try {
    await handler(req, res);
    return res;
  } finally {
    delete require.cache[handlerModulePath];

    if (originalServiceCache) {
      require.cache[serviceModulePath] = originalServiceCache;
    } else {
      delete require.cache[serviceModulePath];
    }

    if (originalHandlerCache) {
      require.cache[handlerModulePath] = originalHandlerCache;
    }
  }
}

test('serverless contract: payload invalido retorna ApiError padrao', async () => {
  const res = await runHandlerWithMockedService(async () => ({}), {
    method: 'POST',
    body: {}
  });

  assert.equal(res.statusCode, 400);
  const parsedError = apiErrorSchema.safeParse(res.payload);
  assert.equal(parsedError.success, true);
  assert.equal(res.payload.code, 'validation_error');
});

test('serverless contract: payload valido retorna response no contrato', async () => {
  const mockResponse = {
    query: 'Sofa cinza',
    consultas: ['Sofa cinza', 'Sofa'],
    timestamp: new Date().toISOString(),
    sources: [
      {
        source: 'Zoom',
        results: [
          {
            title: 'Sofa Retratil',
            price: 1999.9,
            link: 'https://example.com/produto',
            image: 'https://example.com/img.jpg',
            source: 'Zoom'
          }
        ],
        status: 'success',
        error: null,
        searchUsed: 'Sofa cinza',
        attempts: [{ query: 'Sofa cinza', total: 1, error: null }]
      }
    ]
  };

  const res = await runHandlerWithMockedService(async () => mockResponse, {
    method: 'POST',
    body: { itemName: 'Sofa cinza', notes: 'retratil' }
  });

  assert.equal(res.statusCode, 200);
  const parsedResponse = promotionSearchResponseSchema.safeParse(res.payload);
  assert.equal(parsedResponse.success, true);
});

test('serverless contract: response invalida retorna response_contract_error', async () => {
  const res = await runHandlerWithMockedService(async () => ({ invalid: true }), {
    method: 'POST',
    body: { itemName: 'Sofa cinza' }
  });

  assert.equal(res.statusCode, 502);
  const parsedError = apiErrorSchema.safeParse(res.payload);
  assert.equal(parsedError.success, true);
  assert.equal(res.payload.code, 'response_contract_error');
});
