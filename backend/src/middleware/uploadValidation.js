/**
 * Upload Validation Middleware
 * (uploadValidation.js)
 */

const multer = require('multer');

// Configure multer memory storage
const storage = multer.memoryStorage();

// 15 MB file size limit
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'audio/mpeg', 'audio/wav', 'audio/webm', 'video/mp4', 'video/webm'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed.`));
    }
  }
});

module.exports = upload;
