const fs = require("fs");

let cloudinary = null;
try {
  // Dynamically require cloudinary to prevent server crash if not installed
  cloudinary = require("cloudinary").v2;
} catch (err) {
  console.warn("⚠️ [Cloudinary Service] cloudinary package is not installed. Will use local storage fallback.");
}

const isConfigured = 
  cloudinary &&
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("☁️ [Cloudinary Service] Configured successfully.");
} else {
  console.log("☁️ [Cloudinary Service] Not configured or package missing. Operating in local storage fallback mode.");
}

/**
 * Uploads a local file to Cloudinary if configured.
 * @param {string} localFilePath - Path to the local file.
 * @param {string} folder - Cloudinary folder name.
 * @returns {Promise<string|null>} - Returns Cloudinary secure URL if successful, otherwise null.
 */
const uploadToCloudinary = async (localFilePath, folder = "supportsphere") => {
  if (!isConfigured) {
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: folder,
      resource_type: "auto", // Automatically detect file type (image, raw/pdf, etc.)
    });

    // Delete the local file after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return result.secure_url;
  } catch (error) {
    console.error("❌ [Cloudinary Upload Error]:", error.message);
    return null;
  }
};

module.exports = {
  uploadToCloudinary,
  isCloudinaryConfigured: !!isConfigured,
};
