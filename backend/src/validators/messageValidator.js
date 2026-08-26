/**
 * Message Validator
 * (messageValidator.js)
 */

function validateMessage(req, res, next) {
  const { content, type, fileUrl } = req.body;
  if (type === 'text' && (!content || !content.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Message content cannot be empty.'
    });
  }
  if ((type === 'image' || type === 'file' || type === 'audio') && !fileUrl) {
    return res.status(400).json({
      success: false,
      message: 'File URL is required for media message.'
    });
  }
  next();
}

module.exports = {
  validateMessage
};
