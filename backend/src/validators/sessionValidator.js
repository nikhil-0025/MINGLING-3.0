/**
 * Session Validator
 * (sessionValidator.js)
 */

function validateNickname(req, res, next) {
  const { nickname } = req.body;
  if (nickname && (nickname.length < 2 || nickname.length > 30)) {
    return res.status(400).json({
      success: false,
      message: 'Nickname must be between 2 and 30 characters long.'
    });
  }
  next();
}

module.exports = {
  validateNickname
};
