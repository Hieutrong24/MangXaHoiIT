const { env } = require("./config/env");
const { connectDb, disconnectDb } = require("./config/db");
const { createBroker } = require("./integrations/broker");
const { startHttpServer } = require("./integrations/http");
const { buildApp } = require("./app");

async function bootstrap() {
  await connectDb();

  const broker = createBroker();
  await broker.start();

  const postController = createPostController({ broker });
  const commentController = createCommentController({ broker });

  const app = buildApp({ postController, commentController });

  const http = startHttpServer({ app, port: env.PORT });

  const shutdown = async () => {
    await http.stop();
    await broker.stop();
    await disconnectDb();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap();