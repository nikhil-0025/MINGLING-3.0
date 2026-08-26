/**
 * Upload Service Layer
 * (uploadService.js)
 */

const cloudinary = require('../config/cloudinary');
const generateId = require('../utils/generateId');
const FileModel = require('../models/File');

class UploadService {
  async uploadBuffer(fileBuffer, mimeType, sessionUser) {
    const fileId = generateId('file');

    return new Promise((resolve, reject) => {
      let resourceType = 'auto';
      if (mimeType.startsWith('image/')) resourceType = 'image';
      else if (mimeType.startsWith('audio/') || mimeType.startsWith('video/')) resourceType = 'video';

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'mingling_uploads',
          resource_type: resourceType
        },
        async (error, result) => {
          if (error) {
            console.warn('[CLOUDINARY UPLOAD WARN]', error.message);
            // Fallback base64 data URI if Cloudinary credentials are mock
            const base64Data = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
            return resolve({
              fileId,
              publicId: 'local_fallback',
              url: base64Data,
              mimeType,
              size: fileBuffer.length
            });
          }

          try {
            await FileModel.create({
              fileId,
              publicId: result.public_id,
              url: result.secure_url,
              uploaderSessionId: sessionUser.sessionId,
              mimeType,
              size: fileBuffer.length
            });
          } catch (err) {
            console.warn('[FILE DB WARN]', err.message);
          }

          resolve({
            fileId,
            publicId: result.public_id,
            url: result.secure_url,
            mimeType,
            size: fileBuffer.length
          });
        }
      );

      uploadStream.end(fileBuffer);
    });
  }
}

module.exports = new UploadService();
