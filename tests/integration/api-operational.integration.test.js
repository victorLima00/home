const test = require('node:test');
const assert = require('node:assert/strict');

const { createMockRes } = require('../helpers/http-mocks');

const diagnosticsHandler = require('../../api/diagnostico-promocoes');
const sloHandler = require('../../api/promocoes-slo');

test('integration: diagnostico aceita OPTIONS e responde CORS', async () => {
  const req = { method: 'OPTIONS' };
  const res = createMockRes();

  await diagnosticsHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['Access-Control-Allow-Origin'], '*');
  assert.equal(res.headers['Access-Control-Allow-Methods'], 'GET, OPTIONS');
});

test('integration: diagnostico retorna resumo operacional', async () => {
  const req = { method: 'GET' };
  const res = createMockRes();

  await diagnosticsHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(typeof res.payload.status, 'string');
  assert.equal(typeof res.payload.summary, 'object');
  assert.equal(Array.isArray(res.payload.sources), true);
  assert.equal(Array.isArray(res.payload.alerts), true);
});

test('integration: SLO aceita OPTIONS e responde CORS', async () => {
  const req = { method: 'OPTIONS' };
  const res = createMockRes();

  await sloHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['Access-Control-Allow-Origin'], '*');
  assert.equal(res.headers['Access-Control-Allow-Methods'], 'GET, OPTIONS');
});

test('integration: SLO retorna relatório com policy e métricas', async () => {
  const req = { method: 'GET' };
  const res = createMockRes();

  await sloHandler(req, res);

  assert.equal([200, 503].includes(res.statusCode), true);
  assert.equal(typeof res.payload.status, 'string');
  assert.equal(typeof res.payload.policy, 'object');
  assert.equal(typeof res.payload.window, 'object');
  assert.equal(typeof res.payload.slo, 'object');
});

test('integration: endpoints rejeitam método inválido', async () => {
  const invalidReq = { method: 'POST' };

  const diagnosticsRes = createMockRes();
  await diagnosticsHandler(invalidReq, diagnosticsRes);
  assert.equal(diagnosticsRes.statusCode, 405);
  assert.equal(diagnosticsRes.payload.code, 'method_not_allowed');

  const sloRes = createMockRes();
  await sloHandler(invalidReq, sloRes);
  assert.equal(sloRes.statusCode, 405);
  assert.equal(sloRes.payload.code, 'method_not_allowed');
});
