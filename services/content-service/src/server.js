const http = require("http");
const { env } = require("./config/env");
const { connectDb, disconnectDb } = require("./config/db");
const { createBroker } = require("./integrations/broker");

const { createPostRepository } = require("./modules/post/post.repository");
const { createPostService } = require("./modules/post/post.service");
const { createPostController } = require("./modules/post/post.controller");

const { createCommentRepository } = require("./modules/comment/comment.repository");
const { createCommentService } = require("./modules/comment/comment.service");
const { createCommentController } = require("./modules/comment/comment.controller");

const { createPostCreatedPublisher } = require("./events/publishers/post-created.publisher");
const { createCommentCreatedPublisher } = require("./events/publishers/comment-created.publisher");

const { createUploadService } = require("./modules/upload/upload.service");
const { createUploadController } = require("./modules/upload/upload.controller");

const { buildApp } = require("./app");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startBrokerWithRetry(broker, maxRetries = 20, delayMs = 5000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[content-service] broker start attempt ${attempt}/${maxRetries}`);
      await broker.start();
      console.log("[content-service] broker connected");
      return;
    } catch (error) {
      lastError = error;
      console.error(
        `[content-service] broker start failed attempt ${attempt}/${maxRetries}: ${error.message}`
      );

      if (attempt < maxRetries) {
        await sleep(delayMs);
      }
    }
  }

  throw lastError;
}

async function main() {
  await connectDb();
  console.log("[content-service] mongo connected");

  const broker = createBroker();
  await startBrokerWithRetry(broker);

  const postRepository = createPostRepository();
  const commentRepository = createCommentRepository();

  const postCreatedPublisher = createPostCreatedPublisher({ broker });
  const commentCreatedPublisher = createCommentCreatedPublisher({ broker });

  const commentService = createCommentService({
    commentRepository,
    commentCreatedPublisher,
    postRepository,
  });

  const postService = createPostService({
    postRepository,
    postCreatedPublisher,
    commentService,
  });

  const uploadService = createUploadService({ env });

  const postController = createPostController({ postService });
  const commentController = createCommentController({ commentService });
  const uploadController = createUploadController({ uploadService });

  const app = buildApp({
    env,
    broker,
    postController,
    commentController,
    uploadController,
  });

  const server = http.createServer(app);

  server.on("error", (err) => {
    console.error("[content-service] server error:", err);
  });

  server.listen(env.PORT, "0.0.0.0", () => {
    console.log(`[content-service] listening on port ${env.PORT}`);
    console.log(`[content-service] mongo=${env.MONGO_URI}`);
    console.log(`[content-service] broker=${broker.driver}`);
    console.log(`[content-service] exchange=${env.RABBIT_EXCHANGE || "events"}`);
    console.log(`[content-service] env=${env.NODE_ENV}`);
  });

  let stopping = false;

  const shutdown = async (reason) => {
    if (stopping) return;
    stopping = true;

    console.log(`[content-service] shutdown: ${reason}`);

    await new Promise((resolve) => {
      server.close(() => {
        console.log("[content-service] http closed");
        resolve();
      });
    });

    try {
      await broker.stop();
    } catch (error) {
      console.warn("[content-service] broker stop warning:", error?.message);
    }

    try {
      await disconnectDb();
      console.log("[content-service] mongo disconnected");
    } catch (error) {
      console.warn("[content-service] mongo disconnect warning:", error?.message);
    }

    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGBREAK", () => shutdown("SIGBREAK"));

  process.on("uncaughtException", (error) => {
    console.error("[content-service] uncaughtException:", error);
  });

  process.on("unhandledRejection", (error) => {
    console.error("[content-service] unhandledRejection:", error);
  });

  process.stdin.resume();
}

main().catch((e) => {
  console.error("[content-service] startup failed:", e);
  process.exit(1);
});