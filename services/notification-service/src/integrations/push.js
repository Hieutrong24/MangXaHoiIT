// src/integrations/push.js
function createPush(logger) {
  // Bạn có thể tích hợp FCM/APNs sau.
  return {
    enabled: false,
    async send({ deviceTokens, title, body, data }) {
      if (!Array.isArray(deviceTokens) || deviceTokens.length === 0) {
        return { ok: true, skipped: true, reason: "NO_DEVICE_TOKENS" };
      }
      logger?.info?.("[push] not implemented yet, skipped");
      return { ok: true, skipped: true, reason: "PUSH_NOT_IMPLEMENTED" };
    },
  };
}

module.exports = { createPush };
