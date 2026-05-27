const { contentClient } = require("../clients/content.client");

function ctxFromReq(req) {
  return {
    correlationId: req.correlationId,
    authHeader: req.authHeader || req.headers.authorization || "",
    user: req.user || null,
  };
}

const uploadController = {
  async uploadToCloudinary(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Missing file",
          correlationId: req.correlationId,
        });
      }

      const kind = req.body?.kind || "auto";

      const data = await contentClient.uploadToContentService(
        req.file,
        kind,
        ctxFromReq(req)
      );

      return res.status(201).json({
        success: true,
        data: data?.data ?? data,
        correlationId: req.correlationId,
      });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = { uploadController };