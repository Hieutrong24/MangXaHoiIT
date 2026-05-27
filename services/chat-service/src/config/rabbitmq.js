const amqp = require("amqplib");
const { EXCHANGES } = require("../messaging/topics");

let connection = null;
let channel = null;

async function connectRabbit() {
  const url = process.env.RABBIT_URL;
  if (!url) {
    console.warn("[rabbitmq] RABBIT_URL not set, skip connect");
    return null;
  }

  if (channel) return channel;

  connection = await amqp.connect(url);

  connection.on("error", (err) => {
    console.error("[rabbitmq] connection error:", err.message);
  });

  connection.on("close", () => {
    console.warn("[rabbitmq] connection closed");
    connection = null;
    channel = null;
  });

  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGES.EVENTS, "topic", { durable: true });

  console.log("[rabbitmq] connected");
  return channel;
}

function getRabbitChannel() {
  return channel;
}

async function disconnectRabbit() {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
  } catch (e) {
    console.warn("[rabbitmq] channel close warning:", e.message);
  }

  try {
    if (connection) {
      await connection.close();
      connection = null;
    }
  } catch (e) {
    console.warn("[rabbitmq] connection close warning:", e.message);
  }
}

module.exports = {
  connectRabbit,
  getRabbitChannel,
  disconnectRabbit,
};