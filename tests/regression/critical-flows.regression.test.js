const test = require('node:test');
const assert = require('node:assert/strict');

const { createMockRes } = require('../helpers/http-mocks');

const serviceModulePath = require.resolve('../../backend/services/promocoes-service');
const buscarPromocoesHandlerPath = require.resolve('../../api/buscar-promocoes');

const diagnosticsHandler = require('../../api/diagnostico-promocoes');
const sloHandler = require('../../api/promocoes-slo');

async function runBuscarPromocoesWithMockedService(mockBuscarPromocoes, req) {
  const originalServiceCache = require.cache[serviceModulePath];
  const originalHandlerCache = require.cache[buscarPromocoesHandlerPath];

  require.cache[serviceModulePath] = {
    id: serviceModulePath,
    filename: serviceModulePath,
    loaded: true,
    exports: {
      buscarPromocoes: mockBuscarPromocoes
    }
  };

  delete require.cache[buscarPromocoesHandlerPath];
  const handler = require('../../api/buscar-promocoes');
  const res = createMockRes();

  try {
    await handler(req, res);
    return res;
  } finally {
    delete require.cache[buscarPromocoesHandlerPath];

    if (originalServiceCache) {
      require.cache[serviceModulePath] = originalServiceCache;
    } else {
      delete require.cache[serviceModulePath];
    }

    if (originalHandlerCache) {
      require.cache[buscarPromocoesHandlerPath] = originalHandlerCache;
    }
  }
}

test('regression: buscar-promocoes rejeita payload inválido', async () => {
  const res = await runBuscarPromocoesWithMockedService(async () => ({}), {
    method: 'POST',
    body: {}
  });

  assert.equal(res.statusCode, 400);
  assert.equal(res.payload.code, 'validation_error');
});

test('regression: buscar-promocoes retorna sucesso em payload válido', async () => {
  const mockResponse = {
    query: 'Sofa',
    consultas: ['Sofa'],
    timestamp: new Date().toISOString(),
    sources: [
      {
        source: 'Zoom',
        results: [
          {
            title: 'Sofa Retratil',
            price: 1599.99,
            link: 'https://example.com/sofa',
            image: 'https://example.com/sofa.jpg',
            source: 'Zoom'
          }
        ],
        status: 'success',
        error: null,
        searchUsed: 'Sofa',
        attempts: [{ query: 'Sofa', total: 1, error: null }]
      }
    ]
  };

  const res = await runBuscarPromocoesWithMockedService(async () => mockResponse, {
    method: 'POST',
    body: { itemName: 'Sofa' }
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.query, 'Sofa');
  assert.equal(Array.isArray(res.payload.sources), true);
});

test('regression: buscar-promocoes retorna erro padronizado quando serviço falha', async () => {
  const res = await runBuscarPromocoesWithMockedService(
    async () => {
      throw new Error('falha simulada');
    },
    {
      method: 'POST',
      body: { itemName: 'Sofa' }
    }
  );

  assert.equal(res.statusCode, 500);
  assert.equal(res.payload.code, 'promotion_search_error');
});

test('regression: endpoints operacionais continuam disponíveis', async () => {
  const diagnosticsRes = createMockRes();
  await diagnosticsHandler({ method: 'GET' }, diagnosticsRes);

  assert.equal(diagnosticsRes.statusCode, 200);
  assert.equal(typeof diagnosticsRes.payload.status, 'string');

  const sloRes = createMockRes();
  await sloHandler({ method: 'GET' }, sloRes);

  assert.equal([200, 503].includes(sloRes.statusCode), true);
  assert.equal(typeof sloRes.payload.slo, 'object');
});
