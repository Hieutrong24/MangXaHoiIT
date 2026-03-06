// src/routes/upload.routes.js
const router = require("express").Router();
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }, 
});


router.post("/cloudinary", upload.single("file"), async (req, res) => {
  return res.json({
    success: true,
    data: {
      name: req.file?.originalname,
      mime: req.file?.mimetype,
      bytes: req.file?.size,
    },
    correlationId: req.correlationId,
  });
});

module.exports = { uploadRoutes: router };