const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createHttpStatusError,
  classifySourceError,
  normalizeSourceFailure
} = require('./source-error');

test('classifySourceError classifica status HTTP 429 como rate_limit', () => {
  const error = createHttpStatusError('FonteX', 429);
  const result = classifySourceError(error);

  assert.equal(result.errorType, 'rate_limit');
  assert.equal(result.errorCode, 'http_rate_limited');
  assert.equal(result.retryable, true);
  assert.equal(result.httpStatus, 429);
});

test('classifySourceError classifica timeout como retryable', () => {
  const result = classifySourceError(new Error('request timed out'));

  assert.equal(result.errorType, 'timeout');
  assert.equal(result.retryable, true);
});

test('normalizeSourceFailure preserva metadados de classificacao', () => {
  const error = createHttpStatusError('FonteY', 403);
  const normalized = normalizeSourceFailure('FonteY', error);

  assert.equal(normalized.source, 'FonteY');
  assert.equal(normalized.errorType, 'access_denied');
  assert.equal(normalized.errorCode, 'http_access_denied');
  assert.equal(normalized.retryable, false);
  assert.equal(normalized.httpStatus, 403);
  assert.equal(Array.isArray(normalized.results), true);
  assert.equal(normalized.results.length, 0);
});
