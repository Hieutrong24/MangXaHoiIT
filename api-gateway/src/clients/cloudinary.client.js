// src/clients/cloudinary.client.js (CommonJS)
const cloudinary = require("cloudinary").v2;

function initCloudinaryClient({ cloudName, apiKey, apiSecret }) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  return {
    
    async uploadDataUri(dataUri, options = {}) {
      return cloudinary.uploader.upload(dataUri, options);
    },
  };
}

module.exports = { initCloudinaryClient };