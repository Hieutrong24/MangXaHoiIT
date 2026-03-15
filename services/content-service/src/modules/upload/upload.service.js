const cloudinary = require("cloudinary").v2;

function fileToDataUri(file) {
  const base64 = file.buffer.toString("base64");
  return `data:${file.mimetype};base64,${base64}`;
}

function createUploadService({ env }) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });

  return {
    async uploadFile({ file, kind = "auto" }) {
      if (!file) throw new Error("Missing file");

      const dataUri = fileToDataUri(file);

      const uploaded = await cloudinary.uploader.upload(dataUri, {
        folder: env.CLOUDINARY_FOLDER || "it-social/posts",
        resource_type: kind || "auto",
        use_filename: true,
        unique_filename: true,
      });

      return {
        url: uploaded.url,
        secureUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
        resourceType: uploaded.resource_type,
        format: uploaded.format,
        bytes: uploaded.bytes,
        originalName: file.originalname,
      };
    },
  };
}

module.exports = { createUploadService };