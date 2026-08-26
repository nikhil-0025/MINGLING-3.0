/**
 * File Mongoose Model
 * (File.js)
 */

const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: true,
    unique: true
  },
  publicId: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  uploaderSessionId: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('File', fileSchema);
