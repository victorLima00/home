const test = require('node:test');
const assert = require('node:assert/strict');

const {
  resolveTimeoutBudgetPolicyFromEnv,
  resolveSourceTimeoutMs,
  withTimeout,
  createRequestBudget
} = require('./timeout-budget');

test('resolveTimeoutBudgetPolicyFromEnv aplica defaults validos', () => {
  const policy = resolveTimeoutBudgetPolicyFromEnv({});

  assert.equal(policy.sourceDefaultTimeoutMs, 3500);
  assert.equal(policy.requestBudgetMs, 6500);
  assert.equal(policy.sourceOverridesMs.Zoom, 3500);
  assert.equal(policy.sourceOverridesMs.KaBuM, 3500);
});

test('resolveSourceTimeoutMs usa override da fonte quando existir', () => {
  const timeoutMs = resolveSourceTimeoutMs({
    sourceName: 'Zoom',
    policy: {
      sourceDefaultTimeoutMs: 2500,
      sourceOverridesMs: {
        Zoom: 1200
      }
    }
  });

  assert.equal(timeoutMs, 1200);
});

test('withTimeout rejeita quando operacao excede tempo', async () => {
  await assert.rejects(
    withTimeout(
      async () =>
        new Promise((resolve) => {
          setTimeout(resolve, 20);
        }),
      5,
      { timeoutMessage: 'tempo excedido' }
    ),
    /tempo excedido/
  );
});

test('createRequestBudget calcula tempo restante e excedido', () => {
  let nowMs = 100;
  const budget = createRequestBudget({
    totalBudgetMs: 50,
    now: () => nowMs
  });

  assert.equal(budget.remainingMs(), 50);
  assert.equal(budget.isExceeded(), false);

  nowMs = 130;
  assert.equal(budget.remainingMs(), 20);
  assert.equal(budget.isExceeded(), false);

  nowMs = 160;
  assert.equal(budget.remainingMs(), 0);
  assert.equal(budget.isExceeded(), true);
});
