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

const { createGroupRepository } = require("./modules/group/group.repository");
const { createGroupService } = require("./modules/group/group.service");
const { createGroupController } = require("./modules/group/group.controller");

const { createJobRepository } = require("./modules/job/job.repository");
const { createJobService } = require("./modules/job/job.service");
const { createJobController } = require("./modules/job/job.controller");
const { createAdminController } = require("./modules/admin/admin.controller");

const { createPostCreatedPublisher } = require("./events/publishers/post-created.publisher");
const { createCommentCreatedPublisher } = require("./events/publishers/comment-created.publisher");

const { createUploadService } = require("./modules/upload/upload.service");
const { createUploadController } = require("./modules/upload/upload.controller");

const { buildApp } = require("./app");

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

async function startBrokerBestEffort(broker, maxRetries = 5, delayMs = 3000) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[content-service] broker start attempt ${attempt}/${maxRetries}`);
      await broker.start();
      console.log("[content-service] broker connected");
      return true;
    } catch (error) {
      lastError = error;
      console.error(`[content-service] broker start failed attempt ${attempt}/${maxRetries}: ${error.message}`);
      if (attempt < maxRetries) await sleep(delayMs);
    }
  }
  if (env.BROKER_REQUIRED) throw lastError;
  console.warn("[content-service] continuing without broker because BROKER_REQUIRED=false");
  return false;
}

async function main() {
  let storageDriver = env.CONTENT_STORAGE_DRIVER;
  if (storageDriver === "auto" || storageDriver === "mongo") {
    try {
      await connectDb();
      console.log("[content-service] mongo connected");
      storageDriver = "mongo";
    } catch (error) {
      if (storageDriver === "mongo") throw error;
      console.warn(`[content-service] mongo unavailable, falling back to file storage: ${error.message}`);
      storageDriver = "file";
    }
  }
  if (storageDriver !== "mongo") console.log("[content-service] using file storage fallback");

  const broker = createBroker();
  await startBrokerBestEffort(broker);

  const postRepository = createPostRepository({ driver: storageDriver });
  const commentRepository = createCommentRepository({ driver: storageDriver });
  const groupRepository = createGroupRepository({ driver: storageDriver });
  const jobRepository = createJobRepository();

  const postCreatedPublisher = createPostCreatedPublisher({ broker });
  const commentCreatedPublisher = createCommentCreatedPublisher({ broker });

  const commentService = createCommentService({ commentRepository, commentCreatedPublisher, postRepository });
  const postService = createPostService({ postRepository, postCreatedPublisher, commentService });
  const groupService = createGroupService({ groupRepository, postRepository });
  const jobService = createJobService({ jobRepository });
  const uploadService = createUploadService({ env });

  const postController = createPostController({ postService });
  const commentController = createCommentController({ commentService });
  const groupController = createGroupController({ groupService });
  const jobController = createJobController({ jobService });
  const uploadController = createUploadController({ uploadService });
  const adminController = createAdminController({ postService, commentService, groupService });

  const app = buildApp({ env: { ...env, CONTENT_STORAGE_DRIVER: storageDriver }, broker, postController, commentController, groupController, jobController, uploadController, adminController });

  const server = http.createServer(app);
  server.on("error", (err) => console.error("[content-service] server error:", err));
  server.listen(env.PORT, "0.0.0.0", () => {
    console.log(`[content-service] listening on port ${env.PORT}`);
    console.log(`[content-service] storage=${storageDriver}`);
    console.log(`[content-service] broker=${broker.driver}`);
  });

  let stopping = false;
  const shutdown = async (reason) => {
    if (stopping) return;
    stopping = true;
    console.log(`[content-service] shutdown: ${reason}`);
    await new Promise((resolve) => server.close(resolve));
    try { await broker.stop(); } catch (error) { console.warn("[content-service] broker stop warning:", error?.message); }
    try { await disconnectDb(); } catch (error) { console.warn("[content-service] mongo disconnect warning:", error?.message); }
    process.exit(0);
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGBREAK", () => shutdown("SIGBREAK"));
  process.on("uncaughtException", (error) => console.error("[content-service] uncaughtException:", error));
  process.on("unhandledRejection", (error) => console.error("[content-service] unhandledRejection:", error));
  process.stdin.resume();
}

main().catch((e) => {
  console.error("[content-service] startup failed:", e);
  process.exit(1);
});
