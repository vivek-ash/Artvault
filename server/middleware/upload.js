const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const ErrorResponse = require('../utils/ErrorResponse');

// Use memory storage — files go straight to Cloudinary, not disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ErrorResponse('Only JPEG, PNG, GIF, and WebP images are allowed', 400), false);
  }
};

// Multer middleware — accepts a single image field
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max
  },
});

/**
 * Upload a single image to Cloudinary with both preview (watermarked) and original versions.
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {string} folder - Cloudinary folder path
 * @returns {Object} { preview, original, thumbnail, publicId }
 */
const uploadToCloudinary = (fileBuffer, folder = 'artvault/artworks') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        quality: 'auto:best',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) {
          return reject(new ErrorResponse('Image upload failed', 500));
        }

        const publicId = result.public_id;
        const baseUrl = result.secure_url;

        // Generate URLs with Cloudinary transformations
        // Original — full resolution (protected, only delivered after purchase)
        const original = baseUrl;

        // Preview — lower quality + watermark overlay
        const preview = cloudinary.url(publicId, {
          transformation: [
            { width: 1200, crop: 'limit', quality: 60 },
            {
              overlay: 'text:Arial_40_bold:ArtVault%20Preview',
              gravity: 'center',
              opacity: 30,
              color: '#ffffff',
            },
          ],
          secure: true,
        });

        // Thumbnail — small version for grid/cards
        const thumbnail = cloudinary.url(publicId, {
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'auto', quality: 'auto' },
          ],
          secure: true,
        });

        resolve({
          preview,
          original,
          thumbnail,
          publicId,
        });
      }
    );

    // Pipe the buffer to the upload stream
    const { Readable } = require('stream');
    const readableStream = new Readable();
    readableStream.push(fileBuffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Delete an image from Cloudinary by public_id
 * @param {string} publicId - Cloudinary public_id
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Cloudinary deletion error:', error.message);
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
};
