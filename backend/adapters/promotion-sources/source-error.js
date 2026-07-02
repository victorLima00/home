function createHttpStatusError(sourceName, status) {
  const error = new Error(`${sourceName} error (${status})`);
  error.name = 'SourceHttpError';
  error.httpStatus = status;
  return error;
}

function classifySourceError(error) {
  const message = String(error?.message || '').toLowerCase();
  const httpStatus = Number.isInteger(error?.httpStatus) ? error.httpStatus : null;

  if (httpStatus !== null) {
    if (httpStatus === 401 || httpStatus === 403) {
      return {
        errorType: 'access_denied',
        errorCode: 'http_access_denied',
        retryable: false,
        httpStatus
      };
    }

    if (httpStatus === 404) {
      return { errorType: 'not_found', errorCode: 'http_not_found', retryable: false, httpStatus };
    }

    if (httpStatus === 429) {
      return {
        errorType: 'rate_limit',
        errorCode: 'http_rate_limited',
        retryable: true,
        httpStatus
      };
    }

    if (httpStatus >= 500) {
      return {
        errorType: 'upstream',
        errorCode: 'http_upstream_error',
        retryable: true,
        httpStatus
      };
    }

    return { errorType: 'http', errorCode: 'http_error', retryable: false, httpStatus };
  }

  if (/timeout|timed out|aborted/.test(message)) {
    return {
      errorType: 'timeout',
      errorCode: 'request_timeout',
      retryable: true,
      httpStatus: null
    };
  }

  if (/enotfound|econnreset|econnrefused|eai_again|network|fetcherror/.test(message)) {
    return { errorType: 'network', errorCode: 'network_error', retryable: true, httpStatus: null };
  }

  if (/parse|invalid html|selector/.test(message)) {
    return { errorType: 'parse', errorCode: 'parse_error', retryable: false, httpStatus: null };
  }

  return { errorType: 'unknown', errorCode: 'unknown_error', retryable: false, httpStatus: null };
}

function normalizeSourceFailure(sourceName, error) {
  const classification = classifySourceError(error);

  return {
    source: sourceName,
    results: [],
    error: error?.message || 'Erro desconhecido na fonte',
    errorType: classification.errorType,
    errorCode: classification.errorCode,
    retryable: classification.retryable,
    httpStatus: classification.httpStatus
  };
}

module.exports = {
  createHttpStatusError,
  classifySourceError,
  normalizeSourceFailure
};
