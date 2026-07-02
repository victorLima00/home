const state = {
  startedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  requests: {
    total: 0,
    success: 0,
    error: 0,
    durationMsTotal: 0,
    durationMsMax: 0
  },
  sourceCalls: {}
};

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
  state.requests.success += 1;
  state.requests.durationMsTotal += durationMs;
  state.requests.durationMsMax = Math.max(state.requests.durationMsMax, durationMs);
  touch();
}

function recordRequestError(durationMs) {
  state.requests.error += 1;
  state.requests.durationMsTotal += durationMs;
  state.requests.durationMsMax = Math.max(state.requests.durationMsMax, durationMs);
  touch();
}

function recordSourceCall({ sourceName, status, durationMs, resultCount, errorType = null }) {
  const source = ensureSource(sourceName);

  source.total += 1;
  source.durationMsTotal += durationMs;
  source.durationMsMax = Math.max(source.durationMsMax, durationMs);
  source.resultItemsTotal += resultCount;

  if (status === 'success') source.success += 1;
  else if (status === 'empty') source.empty += 1;
  else {
    source.error += 1;

    if (errorType) {
      source.errorsByType[errorType] = (source.errorsByType[errorType] || 0) + 1;
    }
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

module.exports = {
  recordRequestStart,
  recordRequestSuccess,
  recordRequestError,
  recordSourceCall,
  toSnapshot
};
