const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizarTermos, construirConsultas, consolidarSources } = require('./index');

test('normalizarTermos remove stopwords e tokens curtos', () => {
  const termos = normalizarTermos('Sofa de 2 lugares, para sala e tipo premium!');

  assert.deepEqual(termos, ['sofa', 'lugares', 'sala', 'premium']);
});

test('construirConsultas cria consultas deduplicadas e relevantes', () => {
  const consultas = construirConsultas('Sofa Cinza', 'retratil e reclinavel para sala');

  assert.equal(consultas.length > 0, true);
  assert.equal(consultas[0], 'Sofa Cinza retratil reclinavel sala');
  assert.equal(new Set(consultas).size, consultas.length);
  assert.equal(consultas.includes('Sofa Cinza'), true);
});

test('consolidarSources aplica defaults de source/status/searchUsed', () => {
  const itemName = 'Sofa';
  const consultas = ['Sofa cinza', 'Sofa'];
  const resultados = [
    {
      results: [{ title: 'Produto A' }],
      attempts: [{ query: 'Sofa cinza', total: 1, error: null }]
    },
    {
      source: 'KaBuM',
      results: [],
      status: 'empty',
      attempts: [{ query: 'Sofa', total: 0, error: null }]
    }
  ];

  const sources = consolidarSources(itemName, consultas, resultados);

  assert.equal(sources.length, 2);
  assert.equal(sources[0].source, 'Zoom');
  assert.equal(sources[0].status, 'success');
  assert.equal(sources[0].searchUsed, 'Sofa cinza');
  assert.equal(sources[1].source, 'KaBuM');
  assert.equal(sources[1].status, 'empty');
});
