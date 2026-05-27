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

async function main() {
  await connectDb();

  const broker = createBroker();
  await broker.start();

  // publishers
  const postCreatedPublisher = createPostCreatedPublisher({ broker });
  const commentCreatedPublisher = createCommentCreatedPublisher({ broker });

  // repositories
  const postRepository = createPostRepository();
  const commentRepository = createCommentRepository();

  // services
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

  // controllers
  const postController = createPostController({ postService });
  const commentController = createCommentController({ commentService });
  const uploadController = createUploadController({ uploadService });

  const app = buildApp({
    postController,
    commentController,
    uploadController,
  });

  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    console.log(`[content-service] listening http://localhost:${env.PORT}`);
    console.log(`[content-service] mongo=${env.MONGO_URI}`);
    console.log(`[content-service] broker=${broker.driver}`);
  });

  let stopping = false;
  const shutdown = async (reason) => {
    if (stopping) return;
    stopping = true;
    console.log(`[content-service] shutdown: ${reason}`);

    await new Promise((resolve) => server.close(resolve));
    await broker.stop();
    await disconnectDb();
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});