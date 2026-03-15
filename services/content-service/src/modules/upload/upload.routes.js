const express = require("express");
const multer = require("multer");

function buildUploadRoutes({ uploadController }) {
  const router = express.Router();

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 30 * 1024 * 1024,
    },
  });

  router.post("/cloudinary", upload.single("file"), uploadController.upload);

  return router;
}

module.exports = { buildUploadRoutes };