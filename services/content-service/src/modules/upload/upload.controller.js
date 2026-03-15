function createUploadController({ uploadService }) {
  return {
    async upload(req, res) {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "Missing file" });
        }

        const kind = req.body.kind || "auto";

        const data = await uploadService.uploadFile({
          file: req.file,
          kind,
        });

        return res.status(201).json({
          success: true,
          data,
        });
      } catch (e) {
        return res.status(500).json({
          success: false,
          error: e.message || "Upload failed",
        });
      }
    },
  };
}

module.exports = { createUploadController };