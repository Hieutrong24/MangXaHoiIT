// src/app.js
const express = require("express");

function buildApp({ dispatcher }) {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (req, res) => res.json({ ok: true }));

  // POST /events
  // body: { type: "code.result", payload: {...}, traceId?, occurredAt? }
  app.post("/events", async (req, res) => {
    try {
      const msg = req.body || {};
      await dispatcher.dispatch(msg);
      res.json({ ok: true });
    } catch (e) {
      res.status(400).json({ ok: false, error: e.message });
    }
  });

  app.get("/", (req, res) => {
    res.json({
      ok: true,
      service: "notification-service",
      endpoints: { health: "/health", events: "POST /events" },
    });
  });

  return app;
}

module.exports = { buildApp };
