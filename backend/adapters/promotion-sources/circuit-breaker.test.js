const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveCircuitBreakerPolicyFromEnv, createCircuitBreaker } = require('./circuit-breaker');

test('resolveCircuitBreakerPolicyFromEnv aplica defaults validos', () => {
  const policy = resolveCircuitBreakerPolicyFromEnv({});

  assert.equal(policy.failureThreshold, 3);
  assert.equal(policy.windowMs, 15000);
  assert.equal(policy.openMs, 10000);
});

test('circuit breaker abre apos atingir limiar de falhas', async () => {
  let nowMs = 0;
  const breaker = createCircuitBreaker({
    sourceName: 'Zoom',
    policy: { failureThreshold: 2, windowMs: 5000, openMs: 1000 },
    now: () => nowMs
  });

  await breaker.execute(async () => ({ error: 'timeout', retryable: true }));
  assert.equal(breaker.getState(), 'closed');

  nowMs = 10;
  await breaker.execute(async () => ({ error: 'timeout', retryable: true }));
  assert.equal(breaker.getState(), 'open');
});

test('circuit breaker short-circuit enquanto aberto', async () => {
  let nowMs = 0;
  const breaker = createCircuitBreaker({
    sourceName: 'KaBuM',
    policy: { failureThreshold: 1, windowMs: 5000, openMs: 1000 },
    now: () => nowMs
  });

  await breaker.execute(async () => ({ error: 'network', retryable: true }));
  assert.equal(breaker.getState(), 'open');

  nowMs = 100;
  const outcome = await breaker.execute(async () => ({ results: [{ title: 'nunca executa' }] }));

  assert.equal(outcome.shortCircuited, true);
  assert.equal(outcome.result.errorType, 'circuit_open');
});

test('circuit breaker fecha apos sucesso em half-open', async () => {
  let nowMs = 0;
  const breaker = createCircuitBreaker({
    sourceName: 'Zoom',
    policy: { failureThreshold: 1, windowMs: 5000, openMs: 1000 },
    now: () => nowMs
  });

  await breaker.execute(async () => ({ error: 'upstream', retryable: true }));
  assert.equal(breaker.getState(), 'open');

  nowMs = 1100;
  const outcome = await breaker.execute(async () => ({ results: [{ title: 'ok' }] }));

  assert.equal(outcome.shortCircuited, false);
  assert.equal(breaker.getState(), 'closed');
});

test('circuit breaker reabre em half-open quando tentativa falha', async () => {
  let nowMs = 0;
  const breaker = createCircuitBreaker({
    sourceName: 'KaBuM',
    policy: { failureThreshold: 1, windowMs: 5000, openMs: 1000 },
    now: () => nowMs
  });

  await breaker.execute(async () => ({ error: 'rate_limit', retryable: true }));
  assert.equal(breaker.getState(), 'open');

  nowMs = 1200;
  await breaker.execute(async () => ({ error: 'rate_limit', retryable: true }));

  assert.equal(breaker.getState(), 'open');
});
