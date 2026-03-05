// src/integrations/broker.js
const { EventEmitter } = require("events");
const { env } = require("../config/env");

function createInMemoryBroker(logger) {
  const bus = new EventEmitter();
  bus.setMaxListeners(100);

  return {
    driver: "inmemory",
    async start() {
      logger?.info?.("[broker] inmemory started");
    },
    async stop() {
      logger?.info?.("[broker] inmemory stopped");
    },
    async publish(type, payload, options = {}) {
      const msg = { type, payload, ...options, occurredAt: new Date().toISOString() };
      setImmediate(() => bus.emit("event", msg));
      return { ok: true };
    },
    async subscribe(handler) {
      bus.on("event", handler);
      return { ok: true };
    },
  };
}

function createRabbitBroker(logger) {
  let amqplib = null;
  try {
    amqplib = require("amqplib");
  } catch {
    throw new Error("BROKER_DRIVER=rabbitmq but amqplib is not installed. Run: npm i amqplib");
  }

  let conn = null;
  let ch = null;

  async function start() {
    conn = await amqplib.connect(env.RABBIT_URL);
    ch = await conn.createChannel();
    await ch.assertExchange(env.RABBIT_EXCHANGE, "topic", { durable: true });
    await ch.assertQueue(env.RABBIT_QUEUE, { durable: true });
    await ch.bindQueue(env.RABBIT_QUEUE, env.RABBIT_EXCHANGE, "#");
    await ch.prefetch(env.RABBIT_PREFETCH);

    logger?.info?.(`[broker] rabbitmq started url=${env.RABBIT_URL} ex=${env.RABBIT_EXCHANGE} q=${env.RABBIT_QUEUE}`);
  }

  async function stop() {
    try { await ch?.close(); } catch {}
    try { await conn?.close(); } catch {}
    logger?.info?.("[broker] rabbitmq stopped");
  }

  async function publish(type, payload, options = {}) {
    if (!ch) throw new Error("broker not started");

    const msg = {
      type,
      payload,
      traceId: options.traceId || null,
      occurredAt: options.occurredAt || new Date().toISOString(),
    };

    const routingKey = type;
    const ok = ch.publish(
      env.RABBIT_EXCHANGE,
      routingKey,
      Buffer.from(JSON.stringify(msg)),
      { persistent: true, contentType: "application/json" }
    );

    return { ok: !!ok };
  }

  async function subscribe(handler) {
    if (!ch) throw new Error("broker not started");

    await ch.consume(env.RABBIT_QUEUE, async (m) => {
      if (!m) return;
      try {
        const txt = m.content.toString("utf8");
        const msg = JSON.parse(txt);
        await handler(msg);
        ch.ack(m);
      } catch (e) {
        logger?.error?.(`[broker] consume error: ${e?.message || e}`);
        // reject + requeue=false để tránh loop vô hạn
        ch.nack(m, false, false);
      }
    });

    return { ok: true };
  }

  return { driver: "rabbitmq", start, stop, publish, subscribe };
}

function createBroker(logger) {
  const driver = (env.BROKER_DRIVER || "inmemory").toLowerCase();
  if (driver === "rabbitmq") return createRabbitBroker(logger);
  return createInMemoryBroker(logger);
}

module.exports = { createBroker };
