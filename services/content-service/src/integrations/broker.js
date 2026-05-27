const { EventEmitter } = require("events");
const { env } = require("../config/env");

function createInMemoryBroker() {
  const bus = new EventEmitter();
  bus.setMaxListeners(100);

  return {
    driver: "inmemory",

    async start() {
      console.log("[broker] inmemory started");
    },

    async stop() {
      console.log("[broker] inmemory stopped");
    },

    async publish(type, payload, meta = {}) {
      const msg = {
        type,
        payload,
        ...meta,
        occurredAt: new Date().toISOString(),
      };

      setImmediate(() => bus.emit("event", msg));
      console.log(`[broker] inmemory published type=${type}`);
      return { ok: true };
    },

    async subscribe(handler) {
      bus.on("event", handler);
      return { ok: true };
    },
  };
}

function createRabbitBroker() {
  const amqplib = require("amqplib");

  let conn = null;
  let ch = null;

  return {
    driver: "rabbitmq",

    async start() {
      if (ch) return;

      conn = await amqplib.connect(env.RABBIT_URL);

      conn.on("error", (error) => {
        console.error("[broker] rabbitmq connection error:", error.message);
      });

      conn.on("close", () => {
        console.warn("[broker] rabbitmq connection closed");
        conn = null;
        ch = null;
      });

      ch = await conn.createChannel();
      await ch.assertExchange(env.RABBIT_EXCHANGE, "topic", { durable: true });

      console.log(
        `[broker] rabbitmq started url=${env.RABBIT_URL} ex=${env.RABBIT_EXCHANGE}`
      );
    },

    async stop() {
      try {
        await ch?.close();
      } catch {}

      try {
        await conn?.close();
      } catch {}

      ch = null;
      conn = null;

      console.log("[broker] rabbitmq stopped");
    },

    async publish(type, payload, meta = {}) {
      if (!ch) {
        throw new Error("broker not started");
      }

      const msg = {
        type,
        payload,
        ...meta,
        occurredAt: new Date().toISOString(),
      };

      const ok = ch.publish(
        env.RABBIT_EXCHANGE,
        type,
        Buffer.from(JSON.stringify(msg)),
        {
          persistent: true,
          contentType: "application/json",
        }
      );

      console.log(
        `[broker] rabbitmq published ex=${env.RABBIT_EXCHANGE} routingKey=${type}`
      );

      return { ok: !!ok };
    },

    async subscribe() {
      return { ok: true, skipped: true };
    },
  };
}

function createBroker() {
  if (env.BROKER_DRIVER === "rabbitmq") {
    return createRabbitBroker();
  }

  return createInMemoryBroker();
}

module.exports = { createBroker };