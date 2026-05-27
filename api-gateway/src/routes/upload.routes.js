const express = require("express");
const multer = require("multer");

const { uploadController } = require("../controllers/upload.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024,
  },
});

 
router.use(authMiddleware());

router.post(
  "/cloudinary",
  upload.single("file"),
  uploadController.uploadToCloudinary
);

module.exports = { uploadRoutes: router };