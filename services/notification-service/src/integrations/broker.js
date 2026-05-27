const amqp = require('amqplib');
const env = require('../config/env');
const eventRegistry = require('../events');

let connection;
let channel;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectBroker(maxRetries = 20, delayMs = 5000) {
  if (connection && channel) return channel;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[broker] connecting to RabbitMQ attempt ${attempt}/${maxRetries}...`);

      connection = await amqp.connect(env.rabbitUrl);

      connection.on('error', (error) => {
        console.error('[broker] connection error:', error.message);
      });

      connection.on('close', () => {
        console.warn('[broker] connection closed');
        connection = null;
        channel = null;
      });

      channel = await connection.createChannel();
      await channel.assertExchange(env.rabbitExchange, 'topic', { durable: true });

      console.log('[broker] RabbitMQ connected');
      return channel;
    } catch (error) {
      lastError = error;
      console.error(
        `[broker] connect failed attempt ${attempt}/${maxRetries}: ${error.message}`
      );

      connection = null;
      channel = null;

      if (attempt < maxRetries) {
        await sleep(delayMs);
      }
    }
  }

  throw lastError;
}

async function consumeEvents() {
  if (!channel) {
    await connectBroker();
  }

  const queueName = `${env.serviceName}.queue`;
  await channel.assertQueue(queueName, { durable: true });

  const eventNames = eventRegistry.getEventNames();
  for (const eventName of eventNames) {
    await channel.bindQueue(queueName, env.rabbitExchange, eventName);
    console.log(`[broker] bound queue ${queueName} -> ${env.rabbitExchange}:${eventName}`);
  }

  await channel.consume(queueName, async (message) => {
    if (!message) return;

    try {
      const eventName = message.fields.routingKey;
      const payload = JSON.parse(message.content.toString());

      console.log(`[broker] received event ${eventName}`);
      await eventRegistry.handle(eventName, payload);

      channel.ack(message);
    } catch (error) {
      console.error('[broker] consume error:', error.message);
      channel.nack(message, false, false);
    }
  });

  console.log(`[broker] consuming from queue ${queueName}`);
}

async function publish(eventName, payload) {
  if (!channel) {
    await connectBroker();
  }

  channel.publish(
    env.rabbitExchange,
    eventName,
    Buffer.from(JSON.stringify(payload)),
    {
      persistent: true,
      contentType: 'application/json',
    }
  );

  console.log(`[broker] published event ${eventName}`);
}

module.exports = {
  connectBroker,
  consumeEvents,
  publish,
};