// src/integrations/mailer.js
const { env } = require("../config/env");

let nodemailer = null;
try {
  nodemailer = require("nodemailer");
} catch {
  // only required if SMTP_ENABLED=true
}

function createMailer(logger) {
  const enabled = !!env.SMTP_ENABLED;

  if (!enabled) {
    return {
      enabled: false,
      async send() {
        return { ok: true, skipped: true, reason: "SMTP_DISABLED" };
      },
    };
  }

  if (!nodemailer) {
    throw new Error("SMTP_ENABLED=true but nodemailer is not installed. Run: npm i nodemailer");
  }

  if (!env.SMTP_HOST) throw new Error("SMTP_HOST is required when SMTP_ENABLED=true");
  if (!env.MAIL_FROM) throw new Error("MAIL_FROM is required when SMTP_ENABLED=true");

  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });

  return {
    enabled: true,
    async send({ to, subject, text, html }) {
      if (!to) return { ok: false, error: "MAIL_TO_REQUIRED" };

      const info = await transport.sendMail({
        from: env.MAIL_FROM,
        to,
        subject: subject || "(no subject)",
        text: text || "",
        html: html || undefined,
      });

      logger?.info?.(`[mailer] sent to=${to} id=${info.messageId}`);
      return { ok: true, messageId: info.messageId };
    },
  };
}

module.exports = { createMailer };
