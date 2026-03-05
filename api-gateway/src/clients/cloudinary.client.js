// src/clients/cloudinary.client.js (CommonJS)
const cloudinary = require("cloudinary").v2;

function initCloudinaryClient({ cloudName, apiKey, apiSecret }) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  return {
    /**
     * Upload 1 file base64 dataURI lên Cloudinary
     * @param {string} dataUri - "data:<mime>;base64,<...>"
     * @param {{ resource_type: "image"|"video"|"raw", folder?: string, public_id?: string }} options
     */
    async uploadDataUri(dataUri, options = {}) {
      return cloudinary.uploader.upload(dataUri, options);
    },
  };
}

module.exports = { initCloudinaryClient };