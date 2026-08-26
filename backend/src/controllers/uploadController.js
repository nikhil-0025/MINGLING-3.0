/**
 * Upload Controller
 * (uploadController.js)
 */

const uploadService = require('../services/uploadService');

class UploadController {
  async handleFileUpload(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided for upload'
        });
      }

      const uploaded = await uploadService.uploadBuffer(
        req.file.buffer,
        req.file.mimetype,
        req.sessionUser
      );

      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: uploaded
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UploadController();
