const test = require('node:test');
const assert = require('node:assert/strict');

const {
  promotionSearchRequestSchema,
  promotionSearchResponseSchema,
  apiErrorSchema
} = require('./promocoes.runtime');

test('contract request: payload valido passa no schema', () => {
  const parsed = promotionSearchRequestSchema.parse({
    itemName: 'Sofa',
    notes: 'reclinavel'
  });

  assert.equal(parsed.itemName, 'Sofa');
  assert.equal(parsed.notes, 'reclinavel');
});

test('contract request: payload invalido falha no schema', () => {
  const parsed = promotionSearchRequestSchema.safeParse({
    itemName: '   '
  });

  assert.equal(parsed.success, false);
});

test('contract response: payload valido passa no schema', () => {
  const parsed = promotionSearchResponseSchema.parse({
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
        attempts: [
          {
            query: 'Sofa cinza',
            total: 1,
            error: null
          }
        ]
      }
    ]
  });

  assert.equal(parsed.sources.length, 1);
  assert.equal(parsed.sources[0].status, 'success');
});

test('contract apiError: payload valido passa no schema', () => {
  const parsed = apiErrorSchema.parse({
    code: 'validation_error',
    message: 'Payload invalido',
    details: { field: 'itemName' },
    traceId: 'trace-123'
  });

  assert.equal(parsed.code, 'validation_error');
});
