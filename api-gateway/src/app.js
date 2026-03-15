const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { randomUUID } = require("crypto");

const { env } = require("./config/env");
const { HEADER } = require("./config/constants");
const { uploadRoutes } = require("./routes/upload.routes");
const { createRateLimiter } = require("./middlewares/rateLimit.middleware");
const { errorMiddleware } = require("./middlewares/error.middleware");
const { chatRoutes } = require("./routes/chat.routes");
const { authRoutes } = require("./routes/auth.routes");
const { userRoutes } = require("./routes/user.routes");
const { codeRoutes } = require("./routes/code.routes");
const { contentRoutes } = require("./routes/content.routes");
const { healthRoutes } = require("./routes/health.routes");
const { aiRoutes } = require("./routes/ai.routes");
const externalRoutes = require("./routes/external.routes");

function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use("/api/health", healthRoutes);

  app.use((req, res, next) => {
    const incoming = req.headers[HEADER.CORRELATION_ID];
    req.correlationId =
      incoming && typeof incoming === "string" ? incoming : randomUUID();

    res.setHeader(HEADER.CORRELATION_ID, req.correlationId);
    next();
  });

  app.use(helmet());

  app.use(
    cors({
      origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  morgan.token("cid", (req) => req.correlationId);
  app.use(morgan(":method :url :status - :response-time ms cid=:cid"));

  app.use(createRateLimiter({ windowMs: 60 * 1000, max: 300 }));

  app.get("/health", (req, res) => {
    res.json({
      ok: true,
      env: env.NODE_ENV,
      correlationId: req.correlationId,
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/code", codeRoutes);
  app.use("/api/content", contentRoutes);
  app.use("/api/uploads", uploadRoutes);
  app.use("/api/external", externalRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/chats", chatRoutes);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Not Found",
      correlationId: req.correlationId,
    });
  });

  app.use(errorMiddleware);

  return app;
}

module.exports = { createApp };