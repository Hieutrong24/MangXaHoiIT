// src/services/notification.service.js
const { CHANNELS } = require("../config/constants");

function normalizeRecipient(r) {
  if (!r) return null;
  return {
    userId: r.userId ? String(r.userId) : null,
    email: r.email ? String(r.email) : null,
    deviceTokens: Array.isArray(r.deviceTokens) ? r.deviceTokens.map(String) : [],
  };
}

function createNotificationService({ mailer, push, websocket, logger }) {
  async function sendToRecipient(recipient, notification, channels) {
    const r = normalizeRecipient(recipient);
    if (!r || !r.userId) return { ok: false, error: "RECIPIENT_USER_ID_REQUIRED" };

    const results = [];

    const chosen = Array.isArray(channels) && channels.length > 0
      ? channels
      : [CHANNELS.WEBSOCKET]; // default

    for (const ch of chosen) {
      if (ch === CHANNELS.WEBSOCKET) {
        const res = await websocket.notify({ userId: r.userId, notification });
        results.push({ channel: ch, ...res });
      }

      if (ch === CHANNELS.EMAIL) {
        if (!r.email) {
          results.push({ channel: ch, ok: true, skipped: true, reason: "NO_EMAIL" });
        } else {
          const res = await mailer.send({
            to: r.email,
            subject: notification.title || "Notification",
            text: notification.body || "",
          });
          results.push({ channel: ch, ...res });
        }
      }

      if (ch === CHANNELS.PUSH) {
        const res = await push.send({
          deviceTokens: r.deviceTokens,
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
        });
        results.push({ channel: ch, ...res });
      }
    }

    return { ok: true, userId: r.userId, results };
  }

  async function send({ recipients, notification, channels }) {
    if (!notification) throw new Error("notification required");
    if (!Array.isArray(recipients) || recipients.length === 0) throw new Error("recipients required");

    const out = [];
    for (const r of recipients) {
      try {
        out.push(await sendToRecipient(r, notification, channels));
      } catch (e) {
        logger?.error?.(`[notify] send error user=${r?.userId}: ${e?.message || e}`);
        out.push({ ok: false, error: e?.message || String(e), userId: r?.userId || null });
      }
    }
    return out;
  }

  return { send, sendToRecipient };
}

module.exports = { createNotificationService };
