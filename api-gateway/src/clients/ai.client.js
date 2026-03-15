const { env } = require("../config/env");
const { createHttpClient } = require("../utils/httpClient");
const { SERVICE_NAMES } = require("../config/constants");

const http = createHttpClient({
  baseURL: env.CONTENT_SERVICE_URL,
  serviceName: SERVICE_NAMES.CONTENT,
});

const aiClient = {
  async getSuggestion(ctx) {
    const res = await http.post("/api/ai/suggestion", {}, { __ctx: ctx });
    return res.data;
  },
};

module.exports = { aiClient };