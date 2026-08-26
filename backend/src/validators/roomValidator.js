/**
 * Room Validator
 * (roomValidator.js)
 */

function validateCreateRoom(req, res, next) {
  const { name } = req.body;
  if (!name || name.trim().length < 2 || name.trim().length > 50) {
    return res.status(400).json({
      success: false,
      message: 'Room name must be between 2 and 50 characters.'
    });
  }
  next();
}

module.exports = {
  validateCreateRoom
};
