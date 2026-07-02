const state = {
  startedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  history: {
    requestOutcomes: [],
    budgetExceededTimestamps: []
  },
  requests: {
    total: 0,
    success: 0,
    error: 0,
    budgetExceeded: 0,
    durationMsTotal: 0,
    durationMsMax: 0
  },
  sourceCalls: {}
};

const HISTORY_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function toEpochMs(isoValue) {
  const parsed = Date.parse(isoValue);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function pruneHistory(nowMs = Date.now()) {
  const cutoff = nowMs - HISTORY_MAX_AGE_MS;
  state.history.requestOutcomes = state.history.requestOutcomes.filter(
    (entry) => entry.ts >= cutoff
  );
  state.history.budgetExceededTimestamps = state.history.budgetExceededTimestamps.filter(
    (entryTs) => entryTs >= cutoff
  );
}

function toP95(values) {
  if (!values.length) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(0, Math.ceil(sorted.length * 0.95) - 1);
  return sorted[index];
}

function touch() {
  state.updatedAt = new Date().toISOString();
}

function ensureSource(sourceName) {
  if (!state.sourceCalls[sourceName]) {
    state.sourceCalls[sourceName] = {
      total: 0,
      success: 0,
      empty: 0,
      error: 0,
      shortCircuit: 0,
      retriesTotal: 0,
      retryExhaustedTotal: 0,
      circuitOpenTotal: 0,
      circuitHalfOpenTotal: 0,
      circuitCloseTotal: 0,
      circuitShortCircuitTotal: 0,
      errorsByType: {},
      resultItemsTotal: 0,
      durationMsTotal: 0,
      durationMsMax: 0
    };
  }

  return state.sourceCalls[sourceName];
}

function recordRequestStart() {
  state.requests.total += 1;
  touch();
}

function recordRequestSuccess(durationMs) {
  const nowMs = Date.now();
  pruneHistory(nowMs);

  state.requests.success += 1;
  state.requests.durationMsTotal += durationMs;
  state.requests.durationMsMax = Math.max(state.requests.durationMsMax, durationMs);
  state.history.requestOutcomes.push({ ts: nowMs, ok: true, durationMs });
  touch();
}

function recordRequestError(durationMs) {
  const nowMs = Date.now();
  pruneHistory(nowMs);

  state.requests.error += 1;
  state.requests.durationMsTotal += durationMs;
  state.requests.durationMsMax = Math.max(state.requests.durationMsMax, durationMs);
  state.history.requestOutcomes.push({ ts: nowMs, ok: false, durationMs });
  touch();
}

function recordRequestBudgetExceeded() {
  const nowMs = Date.now();
  pruneHistory(nowMs);

  state.requests.budgetExceeded += 1;
  state.history.budgetExceededTimestamps.push(nowMs);
  touch();
}

function recordSourceCall({
  sourceName,
  status,
  durationMs,
  resultCount,
  errorType = null,
  retryCount = 0,
  retryExhausted = false
}) {
  const source = ensureSource(sourceName);

  source.total += 1;
  source.retriesTotal += Math.max(0, retryCount);
  if (retryExhausted) {
    source.retryExhaustedTotal += 1;
  }
  source.durationMsTotal += durationMs;
  source.durationMsMax = Math.max(source.durationMsMax, durationMs);
  source.resultItemsTotal += resultCount;

  if (status === 'success') source.success += 1;
  else if (status === 'empty') source.empty += 1;
  else if (status === 'short_circuit') {
    source.shortCircuit += 1;
  } else {
    source.error += 1;

    if (errorType) {
      source.errorsByType[errorType] = (source.errorsByType[errorType] || 0) + 1;
    }
  }

  touch();
}

function recordSourceCircuitEvent({ sourceName, eventType }) {
  const source = ensureSource(sourceName);

  if (eventType === 'open') {
    source.circuitOpenTotal += 1;
  } else if (eventType === 'half_open') {
    source.circuitHalfOpenTotal += 1;
  } else if (eventType === 'close') {
    source.circuitCloseTotal += 1;
  } else if (eventType === 'short_circuit') {
    source.circuitShortCircuitTotal += 1;
  }

  touch();
}

function toSnapshot() {
  const requestAvgMs = state.requests.total
    ? Number((state.requests.durationMsTotal / state.requests.total).toFixed(2))
    : 0;

  const sources = Object.fromEntries(
    Object.entries(state.sourceCalls).map(([name, source]) => {
      const avgMs = source.total ? Number((source.durationMsTotal / source.total).toFixed(2)) : 0;
      const avgItems = source.total
        ? Number((source.resultItemsTotal / source.total).toFixed(2))
        : 0;

      return [
        name,
        {
          ...source,
          avgMs,
          avgItems
        }
      ];
    })
  );

  return {
    startedAt: state.startedAt,
    updatedAt: state.updatedAt,
    requests: {
      ...state.requests,
      avgMs: requestAvgMs
    },
    sources
  };
}

function toSloWindowSnapshot({ windowMs, now = () => Date.now() }) {
  const nowMs = now();
  pruneHistory(nowMs);

  const safeWindowMs = Number.isFinite(windowMs) && windowMs > 0 ? windowMs : 60 * 60 * 1000;
  const windowStartMs = nowMs - safeWindowMs;

  const outcomesInWindow = state.history.requestOutcomes.filter(
    (entry) => entry.ts >= windowStartMs
  );
  const budgetExceededInWindow = state.history.budgetExceededTimestamps.filter(
    (entryTs) => entryTs >= windowStartMs
  );

  const requestTotal = outcomesInWindow.length;
  const requestErrors = outcomesInWindow.filter((entry) => !entry.ok).length;
  const durations = outcomesInWindow
    .map((entry) => entry.durationMs)
    .filter((value) => Number.isFinite(value));
  const avgMs = durations.length
    ? Number((durations.reduce((acc, value) => acc + value, 0) / durations.length).toFixed(2))
    : 0;
  const maxMs = durations.length ? Math.max(...durations) : 0;
  const p95Ms = durations.length ? toP95(durations) : 0;

  return {
    startedAt: new Date(windowStartMs).toISOString(),
    endedAt: new Date(nowMs).toISOString(),
    requestTotal,
    requestErrors,
    budgetExceeded: budgetExceededInWindow.length,
    avgMs,
    maxMs,
    p95Ms,
    uptimeSec: Number(((nowMs - toEpochMs(state.startedAt)) / 1000).toFixed(2))
  };
}

module.exports = {
  recordRequestStart,
  recordRequestSuccess,
  recordRequestError,
  recordRequestBudgetExceeded,
  recordSourceCall,
  recordSourceCircuitEvent,
  toSnapshot,
  toSloWindowSnapshot
};
