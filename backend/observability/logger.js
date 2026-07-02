function serializeError(error) {
  if (!error) return null;

  return {
    name: error.name,
    message: error.message,
    stack: error.stack
  };
}

function log(level, event, fields = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...fields
  };

  const line = JSON.stringify(payload);

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.log(line);
}

function createLogger(baseFields = {}) {
  return {
    debug(event, fields = {}) {
      log('debug', event, { ...baseFields, ...fields });
    },
    info(event, fields = {}) {
      log('info', event, { ...baseFields, ...fields });
    },
    warn(event, fields = {}) {
      log('warn', event, { ...baseFields, ...fields });
    },
    error(event, fields = {}) {
      const error = fields.error ? serializeError(fields.error) : undefined;
      log('error', event, { ...baseFields, ...fields, ...(error ? { error } : {}) });
    },
    child(extraFields = {}) {
      return createLogger({ ...baseFields, ...extraFields });
    }
  };
}

module.exports = {
  createLogger
};
