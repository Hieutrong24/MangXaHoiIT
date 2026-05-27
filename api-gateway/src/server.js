// src/server.js
const { createApp } = require("./app");
const { env } = require("./config/env");

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`[api-gateway] listening on port ${env.PORT} (${env.NODE_ENV})`);
});
