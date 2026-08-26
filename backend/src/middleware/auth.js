/**
 * Session Authorization Middleware
 * (auth.js)
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mingling_jwt_secret_token_key_2026';

function authenticateSession(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['x-session-token'];
  let token = null;

  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = authHeader;
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Session token missing'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.sessionUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired session token'
    });
  }
}

module.exports = {
  authenticateSession,
  JWT_SECRET
};
