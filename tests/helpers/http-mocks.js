function createMockRes() {
  return {
    headers: {},
    statusCode: 200,
    payload: null,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
    end() {
      this.payload = null;
      return this;
    }
  };
}

module.exports = {
  createMockRes
};
