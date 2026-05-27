// src/utils/httpClient.js
const axios = require("axios");
const https = require("https");

function createHttpClient({ baseURL, serviceName, timeoutMs }) {
  if (!baseURL) throw new Error("createHttpClient: baseURL is required");

  const isHttps = typeof baseURL === "string" && baseURL.startsWith("https://");
  const httpsAgent = isHttps ? new https.Agent({ rejectUnauthorized: false }) : undefined;

  const client = axios.create({
    baseURL,
    timeout: timeoutMs ?? Number(process.env.HTTP_TIMEOUT_MS || 8000),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ...(httpsAgent ? { httpsAgent } : {}),
  });

  client.interceptors.request.use(
    (config) => {
      const ctx = config?.__ctx;

      config.headers = config.headers || {};

    
      const cid = ctx?.correlationId;
      if (cid) {
        config.headers["x-correlation-id"] = cid;
        config.headers["X-Correlation-Id"] = cid; 
      }

  
      const auth = ctx?.authHeader;
      if (auth) {
        config.headers["Authorization"] = auth;
        config.headers["authorization"] = auth; 
      }

     
      const userId = ctx?.user?.id || ctx?.xUserId;
      if (userId) {
        config.headers["X-User-Id"] = String(userId);
        config.headers["x-user-id"] = String(userId);
      }

    
      if (serviceName) config.headers["x-client-service"] = "api-gateway";

      if (!config.headers["user-agent"]) {
        config.headers["user-agent"] = "api-gateway/1.0";
      }


      console.log("[UPSTREAM REQUEST]", {
  service: serviceName,
  url: (config.baseURL || "") + (config.url || ""),
  hasCtx: !!config.__ctx,
  xUserId_in_ctx: config.__ctx?.xUserId,
  userId_in_ctx: config.__ctx?.user?.id,
  headers_sent: {
    Authorization: !!config.headers?.Authorization || !!config.headers?.authorization,
    "X-User-Id": config.headers?.["X-User-Id"],
    "x-user-id": config.headers?.["x-user-id"],
  },
});

      return config;
    },
    (err) => Promise.reject(err)
  );

  client.interceptors.response.use(
    (res) => res,
    (err) => {
      const status = err.response?.status;
      const data = err.response?.data;

      const method = (err.config?.method || "get").toUpperCase();
      const url = (err.config?.baseURL || "") + (err.config?.url || "");

      console.error("[Upstream Axios Error]", {
        service: serviceName,
        method,
        url,
        status,
        data,
        message: err.message,
        code: err.code,
      });

      const e = new Error(
        `Upstream error from ${serviceName}: ${status || err.code || err.message}`
      );
      e.status = status || (err.code === "ECONNRESET" ? 502 : 502);
      e.upstream = { service: serviceName, status, data };
      e.cause = err;

      throw e;
    }
  );

  return client;
}

module.exports = { createHttpClient };