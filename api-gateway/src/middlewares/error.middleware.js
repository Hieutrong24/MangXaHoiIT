// src/middlewares/error.middleware.js
function errorMiddleware(err, req, res, next) {
  const status = err.status && Number.isInteger(err.status) ? err.status : 500;

  const payload = {
    success: false,
    message: err.message || "Internal Server Error",
    correlationId: req.correlationId,
  };

  // If upstream error, include safe details (không leak stack)
  if (err.upstream) {
    payload.upstream = {
      service: err.upstream.service,
      status: err.upstream.status,
      // data có thể chứa message từ service (tuỳ bạn muốn giữ/ẩn)
      data: err.upstream.data,
    };
  }

  // Log server-side
  if (status >= 500) {
    console.error("[Gateway Error]", {
      status,
      message: err.message,
      correlationId: req.correlationId,
      stack: err.stack,
      upstream: err.upstream,
    });
  }

  res.status(status).json(payload);
}

module.exports = { errorMiddleware };
