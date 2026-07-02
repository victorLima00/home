const test = require('node:test');
const assert = require('node:assert/strict');

const { createBuscarPromocoesUseCase } = require('./buscar-promocoes.usecase');

test('createBuscarPromocoesUseCase falha sem fontes', () => {
  assert.throws(() => createBuscarPromocoesUseCase({ sources: [] }), {
    message: 'BuscarPromocoesUseCase requer ao menos uma fonte'
  });
});

test('execute falha quando itemName e invalido', async () => {
  const useCase = createBuscarPromocoesUseCase({
    sources: [{ name: 'FonteFake', search: async () => ({ results: [] }) }]
  });

  await assert.rejects(() => useCase.execute({ itemName: '   ' }), {
    message: 'itemName obrigatorio para buscar promocoes'
  });
});

test('execute aplica fallback por consulta e consolida fontes', async () => {
  const chamadas = [];

  const useCase = createBuscarPromocoesUseCase({
    now: () => '2026-01-01T00:00:00.000Z',
    sources: [
      {
        name: 'FonteA',
        async search(query) {
          chamadas.push({ source: 'A', query });
          if (query === 'Sofa cinza retratil') {
            return { results: [], error: null };
          }
          return {
            source: 'FonteA',
            results: [{ title: 'Produto A', price: 1000, link: '#', image: '', source: 'FonteA' }]
          };
        }
      },
      {
        name: 'FonteB',
        async search(query) {
          chamadas.push({ source: 'B', query });
          return { source: 'FonteB', results: [] };
        }
      }
    ]
  });

  const resultado = await useCase.execute({
    itemName: 'Sofa cinza',
    notes: 'retratil'
  });

  assert.equal(resultado.query, 'Sofa cinza retratil');
  assert.equal(resultado.timestamp, '2026-01-01T00:00:00.000Z');
  assert.equal(resultado.sources.length, 2);

  const sourceA = resultado.sources.find((s) => s.source === 'FonteA');
  const sourceB = resultado.sources.find((s) => s.source === 'FonteB');

  assert.ok(sourceA);
  assert.ok(sourceB);
  assert.equal(sourceA.status, 'success');
  assert.equal(sourceA.results.length, 1);
  assert.equal(sourceA.attempts.length >= 2, true);
  assert.equal(sourceB.status, 'empty');

  assert.equal(
    chamadas.some((c) => c.source === 'A' && c.query === 'Sofa cinza retratil'),
    true
  );
});
