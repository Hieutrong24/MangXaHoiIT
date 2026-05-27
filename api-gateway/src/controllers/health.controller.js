const { authClient } = require("../clients/auth.client");
const { userClient } = require("../clients/user.client");
const { codejudgeClient } = require("../clients/codejudge.client");
const { contentClient } = require("../clients/content.client");

async function safeCall(fn) {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      status: e.status || e.response?.status || 0,
      message: e.message,
      upstream: e.upstream || e.response?.data,
    };
  }
}

const healthController = {
  async checkServices(req, res) {
    const correlationId = req.correlationId;

    const results = {
      auth: await safeCall(() => authClient.ping?.({ correlationId }) ?? Promise.resolve("no ping")),
      user: await safeCall(() => userClient.ping?.({ correlationId }) ?? Promise.resolve("no ping")),
      codejudge: await safeCall(() => codejudgeClient.ping?.({ correlationId }) ?? Promise.resolve("no ping")),
      content: await safeCall(() => contentClient.ping?.({ correlationId }) ?? Promise.resolve("no ping")),
    };

    res.json({ success: true, correlationId, results });
  },
};

module.exports = { healthController };
