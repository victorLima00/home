const test = require('node:test');
const assert = require('node:assert/strict');

const {
  resolveRetryPolicyFromEnv,
  shouldRetryResult,
  calculateBackoffDelayMs,
  executeWithRetry
} = require('./retry-backoff');

test('resolveRetryPolicyFromEnv aplica defaults validos', () => {
  const policy = resolveRetryPolicyFromEnv({});

  assert.equal(policy.maxAttempts, 3);
  assert.equal(policy.baseDelayMs, 150);
  assert.equal(policy.maxDelayMs, 1500);
  assert.equal(policy.jitterRatio, 0.2);
});

test('shouldRetryResult retorna true apenas para erro retryable', () => {
  assert.equal(shouldRetryResult({ error: 'x', retryable: true }), true);
  assert.equal(shouldRetryResult({ error: 'x', retryable: false }), false);
  assert.equal(shouldRetryResult({ results: [] }), false);
});

test('calculateBackoffDelayMs respeita limite maximo', () => {
  const delay = calculateBackoffDelayMs(
    6,
    { maxAttempts: 3, baseDelayMs: 100, maxDelayMs: 500, jitterRatio: 0 },
    () => 0
  );

  assert.equal(delay, 500);
});

test('executeWithRetry faz retry em erro retryable e encerra em sucesso', async () => {
  const calls = [];

  const outcome = await executeWithRetry({
    policy: { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 5, jitterRatio: 0 },
    wait: async () => {},
    onRetry: ({ retryNumber }) => calls.push({ type: 'retry', retryNumber }),
    operation: async (attempt) => {
      calls.push({ type: 'call', attempt });

      if (attempt < 2) {
        return { error: 'timeout', retryable: true };
      }

      return { results: [{ title: 'ok' }] };
    }
  });

  assert.equal(outcome.attempts, 2);
  assert.equal(outcome.retries, 1);
  assert.equal(outcome.retryExhausted, false);
  assert.equal(calls.filter((c) => c.type === 'call').length, 2);
  assert.equal(calls.filter((c) => c.type === 'retry').length, 1);
});

test('executeWithRetry marca retryExhausted ao atingir limite', async () => {
  const outcome = await executeWithRetry({
    policy: { maxAttempts: 2, baseDelayMs: 1, maxDelayMs: 5, jitterRatio: 0 },
    wait: async () => {},
    operation: async () => ({ error: 'rate_limited', retryable: true })
  });

  assert.equal(outcome.attempts, 2);
  assert.equal(outcome.retries, 1);
  assert.equal(outcome.retryExhausted, true);
});
