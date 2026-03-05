// src/controllers/upload.controller.js
function createUploadController({ uploadService }) {
  return {
    // POST /api/uploads/cloudinary
    async uploadToCloudinary(req, res) {
      try {
        if (!req.file) return res.status(400).json({ message: "Missing file" });

        const kind = req.body.kind || "auto"; // image|video|raw|auto
        const traceId = req.headers["x-correlation-id"] || null;

        const result = await uploadService.uploadFile({
          file: req.file,
          kind,
          traceId,
          user: req.user || null, // nếu gateway set req.user từ auth middleware
        });

        return res.json({ success: true, data: result });
      } catch (e) {
        console.error("[uploadToCloudinary] error:", e);
        return res.status(500).json({ message: e.message || "Upload failed" });
      }
    },
  };
}

module.exports = { createUploadController };